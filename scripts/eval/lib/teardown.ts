/**
 * Fixture teardown — schema-driven, dependency-ordered, all-or-nothing.
 *
 * Why this exists (2026-08-06): `cleanupEvalMember` deleted a hardcoded list of
 * tables in a hardcoded order. It ignored `practice_field_revisions ->
 * practice_fields`, so teardown aborted on the first statement and every
 * later delete (auth_sessions, magic_link_tokens, members) silently never ran
 * — while the harness still printed "synthetic records cleaned up".
 *
 * Two properties fix the class, not the instance:
 *
 *  1. The delete order is READ FROM THE LIVE SCHEMA, not written down here.
 *     A new child table added by a future migration is handled without editing
 *     this file — which is the only way a hardcoded order stops re-breaking.
 *     Only non-cascading constraints (ON DELETE NO ACTION / RESTRICT) are
 *     walked; CASCADE and SET NULL are the engine's job.
 *
 *  2. Teardown is transactional. Either the whole fixture goes or none of it
 *     does. A half-removed fixture (member deleted, rows orphaned; or rows
 *     deleted, member retained) is worse residue than an untouched one,
 *     because it no longer looks synthetic.
 *
 * What this deliberately does NOT do: defeat a guard. Some rows are
 * structurally undeletable by design — `practice_field_revisions` raises on
 * DELETE from a BEFORE trigger ("append-only is structural, not policy",
 * migration 20260710000002). Teardown never disables a trigger, never sets
 * session_replication_role, and never drops a constraint. It attempts the
 * delete inside a savepoint, and when the database refuses, it records the
 * refusal and rolls back. A harness that can defeat the product's immutability
 * guarantees is a harness that can no longer test them.
 */

/**
 * MUST be a DEDICATED connection, not a pool facade. `pool.query()` picks an
 * arbitrary idle client per call, so BEGIN / DELETE / COMMIT could land on
 * three different backends and the transaction guarantee would be fiction.
 * assertSameTransaction() below turns that mistake into a loud failure instead
 * of a silent one.
 */
export interface TeardownDb {
  query(sql: string, params?: unknown[]): Promise<{ rows: Record<string, unknown>[] }>;
}

/**
 * Identifies the backend AND the specific transaction.
 *
 * pg_current_xact_id() ASSIGNS a real transaction id, so it is stable inside a
 * BEGIN block and different on every statement outside one. That distinction
 * matters: a pool with a single idle client routes every statement to the same
 * backend, so pid alone (and transaction_timestamp, which also tracks the
 * implicit transaction) would look identical whether or not BEGIN actually
 * took effect. The xid is what makes "we are really in one transaction"
 * checkable rather than assumed.
 */
async function txFingerprint(db: TeardownDb, withXid: boolean): Promise<string> {
  const r = await db.query(
    `SELECT pg_backend_pid() AS pid, transaction_timestamp() AS ts${withXid ? ', pg_current_xact_id()::text AS xid' : ''}`,
  );
  const row = r.rows[0] ?? {};
  return `${row.pid}:${String(row.ts)}:${withXid ? String(row.xid) : 'no-xid'}`;
}

/** pg13+. Checked before BEGIN so a missing function cannot abort the transaction. */
async function xidProbeAvailable(db: TeardownDb): Promise<boolean> {
  try {
    const r = await db.query(`SELECT to_regprocedure('pg_current_xact_id()') IS NOT NULL AS ok`);
    return r.rows[0]?.ok === true;
  } catch {
    return false;
  }
}

async function assertSameTransaction(db: TeardownDb, expected: string, withXid: boolean, when: string): Promise<void> {
  const actual = await txFingerprint(db, withXid);
  if (actual !== expected) {
    throw new Error(
      `teardown: statements are not running in one transaction (${when}: ${expected} → ${actual}). ` +
        'Pass a dedicated client (pool.connect() / new Client()), never a pool.query facade.',
    );
  }
}

/** A set of rows the run created, named by a WHERE clause over one table. */
export interface FixtureRoot {
  table: string;
  /** SQL fragment after WHERE, using $1..$n. */
  whereSql: string;
  params: unknown[];
}

export interface TeardownOptions {
  /**
   * Tables that may ONLY lose rows already named by a root. The walk can reach
   * `members` through self-referencing columns (members.invited_by,
   * member_guardians.*), and deleting a real member because it pointed at the
   * fixture would be catastrophic — far worse than leftover synthetic rows.
   */
  guardedTables?: string[];
  /** Refuse rather than delete an implausible number of rows from one table. */
  maxRowsPerTable?: number;
}

export interface TeardownReport {
  clean: boolean;
  /** Tables the transaction removed rows from, in the order they were removed. */
  deleted: { table: string; rows: number }[];
  /** Why teardown could not complete. Non-empty implies clean === false. */
  blocked: { table: string; rows: number; reason: string }[];
}

interface FkEdge {
  child: string;
  childCols: string[];
  parent: string;
  parentCols: string[];
  onDelete: 'NO ACTION' | 'RESTRICT';
}

const qualify = (schema: string, table: string) => `"${schema.replace(/"/g, '""')}"."${table.replace(/"/g, '""')}"`;
const quoteCol = (col: string) => `"${col.replace(/"/g, '""')}"`;

/**
 * Catalog columns are of type `name`, and node-pg does not parse every array
 * OID into a JS array — an unparsed `name[]` arrives as the literal '{id}',
 * whose .length is 4. The catalog queries below cast to text[] so this does not
 * happen; this normalizer keeps a driver difference from silently turning
 * "table has a primary key" into "table has none".
 */
function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === 'string' && value.startsWith('{')) {
    const inner = value.slice(1, -1);
    return inner ? inner.split(',').map((s) => s.replace(/^"|"$/g, '')) : [];
  }
  return [];
}

/**
 * Every non-cascading FK in the database, keyed by the parent table it points
 * at. Read once per teardown: the shape of the fix is that this file learns
 * the graph instead of asserting it.
 */
async function loadFkGraph(db: TeardownDb): Promise<Map<string, FkEdge[]>> {
  const res = await db.query(`
    SELECT
      child_ns.nspname  || '.' || child.relname  AS child,
      parent_ns.nspname || '.' || parent.relname AS parent,
      con.confdeltype AS ondel,
      (SELECT array_agg(a.attname::text ORDER BY k.ord)
         FROM unnest(con.conkey) WITH ORDINALITY k(attnum, ord)
         JOIN pg_attribute a ON a.attrelid = con.conrelid AND a.attnum = k.attnum) AS child_cols,
      (SELECT array_agg(a.attname::text ORDER BY k.ord)
         FROM unnest(con.confkey) WITH ORDINALITY k(attnum, ord)
         JOIN pg_attribute a ON a.attrelid = con.confrelid AND a.attnum = k.attnum) AS parent_cols
    FROM pg_constraint con
    JOIN pg_class     child     ON child.oid      = con.conrelid
    JOIN pg_namespace child_ns  ON child_ns.oid   = child.relnamespace
    JOIN pg_class     parent    ON parent.oid     = con.confrelid
    JOIN pg_namespace parent_ns ON parent_ns.oid  = parent.relnamespace
    WHERE con.contype = 'f'
      AND con.confdeltype IN ('a', 'r')
      AND child_ns.nspname NOT IN ('pg_catalog', 'information_schema')
  `);

  const graph = new Map<string, FkEdge[]>();
  for (const row of res.rows) {
    const edge: FkEdge = {
      child: String(row.child),
      childCols: toStringArray(row.child_cols),
      parent: String(row.parent),
      parentCols: toStringArray(row.parent_cols),
      onDelete: row.ondel === 'r' ? 'RESTRICT' : 'NO ACTION',
    };
    const list = graph.get(edge.parent) ?? [];
    list.push(edge);
    graph.set(edge.parent, list);
  }
  return graph;
}

/** Single-column primary keys, which are what the walk needs to address rows. */
async function loadPrimaryKeys(db: TeardownDb): Promise<Map<string, string>> {
  const res = await db.query(`
    SELECT ns.nspname || '.' || c.relname AS tbl,
           (SELECT array_agg(a.attname::text ORDER BY k.ord)
              FROM unnest(i.indkey) WITH ORDINALITY k(attnum, ord)
              JOIN pg_attribute a ON a.attrelid = c.oid AND a.attnum = k.attnum) AS cols
    FROM pg_index i
    JOIN pg_class c      ON c.oid = i.indrelid
    JOIN pg_namespace ns ON ns.oid = c.relnamespace
    WHERE i.indisprimary AND ns.nspname NOT IN ('pg_catalog', 'information_schema')
  `);
  const pks = new Map<string, string>();
  for (const row of res.rows) {
    const cols = toStringArray(row.cols);
    if (cols.length === 1) pks.set(String(row.tbl), cols[0]);
  }
  return pks;
}

async function resolveTable(db: TeardownDb, table: string): Promise<string> {
  if (table.includes('.')) return table;
  const res = await db.query(
    `SELECT ns.nspname || '.' || c.relname AS tbl
       FROM pg_class c JOIN pg_namespace ns ON ns.oid = c.relnamespace
      WHERE c.relname = $1 AND c.relkind = 'r' AND ns.nspname = ANY(current_schemas(false))
      LIMIT 1`,
    [table],
  );
  const found = res.rows[0]?.tbl;
  if (!found) throw new Error(`teardown: table ${table} not found on the search path`);
  return String(found);
}

const splitQualified = (qualified: string): [string, string] => {
  const idx = qualified.indexOf('.');
  return [qualified.slice(0, idx), qualified.slice(idx + 1)];
};

/**
 * Remove a fixture in FK dependency order inside one transaction.
 *
 * Returns a report rather than throwing on refusal: a blocked teardown is a
 * finding the caller must surface, not an exception to swallow. Only an
 * infrastructure failure (connection lost, catalog unreadable) throws.
 */
export async function teardownFixture(
  db: TeardownDb,
  roots: FixtureRoot[],
  opts: TeardownOptions = {},
): Promise<TeardownReport> {
  const guarded = new Set(opts.guardedTables ?? []);
  const maxRows = opts.maxRowsPerTable ?? 1000;

  const graph = await loadFkGraph(db);
  const pks = await loadPrimaryKeys(db);

  const deleted: TeardownReport['deleted'] = [];
  const blocked: TeardownReport['blocked'] = [];
  // Guards against the members.invited_by self-cycle and diamond paths.
  const visited = new Set<string>();
  // Rows a root explicitly named — the only rows a guarded table may lose.
  const rootIds = new Map<string, Set<string>>();

  let savepoint = 0;

  /** Depth-first: clear every non-cascading dependent, then delete these rows. */
  async function removeRows(qualified: string, ids: string[], depth: number): Promise<void> {
    if (!ids.length) return;
    if (depth > 12) {
      blocked.push({ table: qualified, rows: ids.length, reason: 'FK graph deeper than 12 levels — refusing to walk further' });
      return;
    }

    const pk = pks.get(qualified);
    if (!pk) {
      blocked.push({ table: qualified, rows: ids.length, reason: 'no single-column primary key — dependents cannot be addressed' });
      return;
    }

    const fresh = ids.filter((id) => !visited.has(`${qualified}:${id}`));
    if (!fresh.length) return;
    for (const id of fresh) visited.add(`${qualified}:${id}`);

    if (fresh.length > maxRows) {
      blocked.push({ table: qualified, rows: fresh.length, reason: `${fresh.length} rows exceeds the ${maxRows}-row fixture cap — this does not look like fixture residue` });
      return;
    }

    const [schema, table] = splitQualified(qualified);
    const target = qualify(schema, table);

    for (const edge of graph.get(qualified) ?? []) {
      const childPk = pks.get(edge.child);
      const [cs, ct] = splitQualified(edge.child);
      const childTarget = qualify(cs, ct);
      const childColList = edge.childCols.map(quoteCol).join(', ');
      const parentColList = edge.parentCols.map(quoteCol).join(', ');
      const matching =
        `(${childColList}) IN (SELECT ${parentColList} FROM ${target} WHERE ${quoteCol(pk)} = ANY($1))`;

      if (!childPk) {
        // Cannot address the child's own dependents; only safe if it has none.
        if ((graph.get(edge.child) ?? []).length) {
          blocked.push({ table: edge.child, rows: -1, reason: 'no single-column primary key and has dependents of its own' });
          continue;
        }
        await deleteWhere(edge.child, childTarget, matching, [fresh]);
        continue;
      }

      const childRows = await db.query(
        `SELECT ${quoteCol(childPk)} AS id FROM ${childTarget} WHERE ${matching}`,
        [fresh],
      );
      const childIds = childRows.rows.map((r) => String(r.id));
      if (!childIds.length) continue;

      if (guarded.has(edge.child) || guarded.has(ct)) {
        const allowed = rootIds.get(edge.child) ?? new Set<string>();
        const stray = childIds.filter((id) => !allowed.has(id));
        if (stray.length) {
          blocked.push({
            table: edge.child,
            rows: stray.length,
            reason: `reached via ${edge.childCols.join(',')} but not named by a fixture root — refusing to delete rows this run did not create`,
          });
          continue;
        }
      }

      await removeRows(edge.child, childIds, depth + 1);
    }

    if (blocked.length) return; // Nothing more can succeed; collect and report.
    await deleteWhere(qualified, target, `${quoteCol(pk)} = ANY($1)`, [fresh]);
  }

  /**
   * One delete inside its own savepoint. A refusal (append-only trigger, a
   * constraint we did not model) is recorded and the savepoint rolled back, so
   * the walk can finish describing the full picture instead of dying on the
   * first raise — which is exactly how the original bug hid four other tables.
   */
  async function deleteWhere(label: string, target: string, whereSql: string, params: unknown[]): Promise<void> {
    const sp = `teardown_sp_${++savepoint}`;
    await db.query(`SAVEPOINT ${sp}`);
    try {
      const res = await db.query(`DELETE FROM ${target} WHERE ${whereSql} RETURNING 1`, params);
      await db.query(`RELEASE SAVEPOINT ${sp}`);
      if (res.rows.length) deleted.push({ table: label, rows: res.rows.length });
    } catch (err) {
      await db.query(`ROLLBACK TO SAVEPOINT ${sp}`);
      await db.query(`RELEASE SAVEPOINT ${sp}`);
      blocked.push({
        table: label,
        rows: -1,
        reason: `database refused the delete: ${err instanceof Error ? err.message : String(err)}`,
      });
    }
  }

  const withXid = await xidProbeAvailable(db);
  await db.query('BEGIN');
  const fingerprint = await txFingerprint(db, withXid);
  try {
    // Fail before any delete if this is a pool facade rather than one client.
    await assertSameTransaction(db, fingerprint, withXid, 'immediately after BEGIN');

    // Resolve every root first so guarded-table membership is known before the
    // walk can reach a guarded table from a different direction.
    const resolved: { qualified: string; ids: string[] }[] = [];
    for (const root of roots) {
      const qualified = await resolveTable(db, root.table);
      const pk = pks.get(qualified);
      if (!pk) throw new Error(`teardown: ${qualified} has no single-column primary key`);
      const res = await db.query(
        `SELECT ${quoteCol(pk)} AS id FROM ${qualify(...splitQualified(qualified))} WHERE ${root.whereSql}`,
        root.params,
      );
      const ids = res.rows.map((r) => String(r.id));
      resolved.push({ qualified, ids });
      const set = rootIds.get(qualified) ?? new Set<string>();
      for (const id of ids) set.add(id);
      rootIds.set(qualified, set);
      const [, bare] = splitQualified(qualified);
      rootIds.set(bare, set);
    }

    for (const { qualified, ids } of resolved) {
      await removeRows(qualified, ids, 0);
      if (blocked.length) break;
    }

    if (blocked.length) {
      await db.query('ROLLBACK');
      return { clean: false, deleted: [], blocked };
    }
    // The deletes are only real if they all happened here. Verify before COMMIT.
    await assertSameTransaction(db, fingerprint, withXid, 'before COMMIT');
    await db.query('COMMIT');
    return { clean: true, deleted, blocked };
  } catch (err) {
    await db.query('ROLLBACK').catch(() => {});
    throw err;
  }
}

/** One-line renderings for harness output and report files. */
export function describeTeardown(report: TeardownReport): string[] {
  if (report.clean) {
    const total = report.deleted.reduce((n, d) => n + d.rows, 0);
    if (!total) return ['teardown: nothing to remove'];
    return [`teardown: removed ${total} rows — ${report.deleted.map((d) => `${d.table}×${d.rows}`).join(', ')}`];
  }
  return [
    'teardown: REFUSED — the fixture was NOT removed (transaction rolled back, nothing partially deleted)',
    ...report.blocked.map((b) => `  · ${b.table}${b.rows >= 0 ? ` (${b.rows} rows)` : ''}: ${b.reason}`),
  ];
}
