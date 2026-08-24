/**
 * MEMBER IDENTITY OWNERSHIP CENSUS — read-only.
 *
 * WHY THIS EXISTS
 *   Two member rows exist for one human (Kelly). One of them owns the 16 Soul Portraits;
 *   the other is the identity the browser currently authenticates as. Before any
 *   consolidation is even planned, we need to know — table by table — what each identity
 *   actually owns, and where a rebind would collide with a uniqueness constraint.
 *
 * WHAT THIS WITNESSES
 *   For every column in the database that references (or plausibly holds) a member id:
 *     - how many rows sit under identity A
 *     - how many rows sit under identity B
 *     - whether a unique constraint makes an A→B rebind structurally unsafe
 *   Plus a proposed merge rule per column. The merge rule is a CLASSIFICATION, not an
 *   instruction: nothing here executes, proposes SQL to run unattended, or writes.
 *
 * WHAT THIS DOES NOT WITNESS
 *   Which identity *should* be canonical (that is a human ruling, not a query).
 *   Semantic equivalence of rows. Whether history rows may be rewritten at all
 *   (append-only ledgers are flagged PROVENANCE_PRESERVE and the answer there is no).
 *   What the 6 counted soul_portraits deletes were — the trace section narrows, not answers.
 *
 * DATA DISCIPLINE
 *   No arbitrary member-scoped content is read. Output is limited to schema/count
 *   information PLUS identity/account metadata (username, email, name, onboarding state,
 *   created_at, last_sign_in) for the two explicitly supplied candidate member ids — the
 *   two identities being reconciled, and nothing else. No conversation, journal, portrait,
 *   or Sanctuary-governed material is selected or printed, for any member.
 *   The whole run executes inside a READ ONLY transaction, so a write is refused by
 *   Postgres itself rather than by this script's good manners. Every fallible probe runs
 *   inside its own SAVEPOINT, so one failing column cannot abort the transaction and
 *   silently collapse the rest of the census into false zeros.
 *
 * Run (production, inside the container on minisforum):
 *   docker exec maia-sovereign sh -c 'DATABASE_URL="$DATABASE_URL" npx tsx \
 *     scripts/witness/member-identity-ownership-census.ts <UUID_A> <UUID_B>'
 *
 * Args:
 *   <UUID_A> <UUID_B>   the two member ids to compare (A is treated as the CANONICAL
 *                       candidate, B as the LEGACY/duplicate candidate — labels only)
 *   --out <path>        JSON report path (default /tmp/member-identity-census-<ts>.json)
 *   --timeout-ms <n>    per-query statement timeout (default 60000)
 */

import { writeFileSync } from 'fs';
import { Pool } from 'pg';

// ── args ────────────────────────────────────────────────────────────────────
const argv = process.argv.slice(2);
function flag(name: string, fallback: string): string {
  const i = argv.indexOf(name);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : fallback;
}
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ids = argv.filter((a) => UUID_RE.test(a));
if (ids.length !== 2 || ids[0].toLowerCase() === ids[1].toLowerCase()) {
  console.error('usage: member-identity-ownership-census.ts <UUID_A> <UUID_B> [--out path] [--timeout-ms n]');
  console.error('       two DISTINCT member uuids are required.');
  process.exit(2);
}
const [A, B] = ids;
const OUT = flag('--out', `/tmp/member-identity-census-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
const TIMEOUT_MS = Number(flag('--timeout-ms', '60000'));

// ── classification ──────────────────────────────────────────────────────────
const LEDGER_RE = /(_events|_event|_ledger|_log|_logs|_audit|_history|_consents|_runs|_passes|_receipts)$/;
const SESSION_RE = /(^auth_|_sessions$|^sessions$|_tokens$|^refresh_)/;

type MergeRule =
  | 'NO_OP'                 // neither identity has rows here
  | 'CANONICAL_ONLY'        // already where it should be; nothing to do
  | 'REBIND_CLEAN'          // rows only under legacy, no uniqueness obstruction
  | 'REBIND_CHECK'          // rows under both, no detected collision — still needs a human read
  | 'COLLISION_MANUAL'      // a unique key would be violated by a blind rebind
  | 'PROVENANCE_PRESERVE'   // append-only history: the actor recorded is a fact, not a pointer
  | 'SESSION_NO_REBIND'     // auth/session state: let it expire and re-authenticate
  | 'ERROR';                // count failed (timeout, permission, exotic type)

type Row = {
  table: string;
  column: string;
  declaredFk: boolean;
  dataType: string;
  rowsA: number | null;
  rowsB: number | null;
  uniqueKeys: string[];
  collisions: string[];
  rule: MergeRule;
  note?: string;
};

// ── main ────────────────────────────────────────────────────────────────────
async function main() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://soullab@localhost:5432/maia_consciousness',
    max: 1,
  });
  const c = await pool.connect();
  try {
    // Structural read-only guarantee: any write below is refused by the server.
    await c.query('BEGIN');
    await c.query('SET TRANSACTION READ ONLY');
    await c.query(`SET statement_timeout = ${Math.max(1000, TIMEOUT_MS)}`);

    // 1 ─ identity rows (identity fields only; no content)
    const idents = await c.query(
      `SELECT id::text, username, email, name, onboarded, onboarding_step,
              created_at, last_sign_in
         FROM members WHERE id = ANY($1::uuid[]) ORDER BY created_at`,
      [[A, B]]
    );

    // 2 ─ declared foreign keys to members(id)
    // The referenced attribute is constrained to members.id explicitly: a FK pointing at
    // another unique member column (email, username, passkey) is a DIFFERENT relationship
    // and must not be counted as an id reference. The local column's real type is read from
    // the catalog rather than assumed to be uuid — assuming uuid is what would make such a
    // column throw on cast, which is precisely the error the savepoints now contain.
    const fks = await c.query(`
      SELECT cl.relname::text                    AS table_name,
             att.attname::text                   AS column_name,
             att.atttypid::regtype::text         AS data_type,
             con.conname::text                   AS constraint_name,
             con.confdeltype                     AS on_delete
        FROM pg_constraint con
        JOIN pg_class cl ON cl.oid = con.conrelid
        JOIN pg_namespace n ON n.oid = cl.relnamespace AND n.nspname = 'public'
        JOIN unnest(con.conkey, con.confkey) WITH ORDINALITY AS k(attnum, fattnum, ord) ON TRUE
        JOIN pg_attribute att  ON att.attrelid  = con.conrelid  AND att.attnum  = k.attnum
        JOIN pg_attribute fatt ON fatt.attrelid = con.confrelid AND fatt.attnum = k.fattnum
       WHERE con.contype = 'f'
         AND con.confrelid = 'public.members'::regclass
         AND fatt.attname = 'id'
       ORDER BY 1, 2`);

    // 3 ─ undeclared candidates: member-shaped columns with no FK to members
    const heur = await c.query(`
      SELECT col.table_name, col.column_name, col.data_type
        FROM information_schema.columns col
        JOIN information_schema.tables tab
          ON tab.table_schema = col.table_schema
         AND tab.table_name  = col.table_name
         AND tab.table_type  = 'BASE TABLE'
       WHERE col.table_schema = 'public'
         AND col.table_name <> 'members'
         AND col.data_type IN ('uuid', 'text', 'character varying')
         AND ( col.column_name ~ '(^|_)(member|user|owner|practitioner|actor|author|subject|recipient|sender|guardian|steward|participant|client|reviewer|uploader|arranger|witness)(_?id)?$'
            OR col.column_name IN ('created_by','updated_by','invited_by','authored_by','resolved_by',
                                   'reviewed_by','redeemed_by','acknowledged_by','saved_by','used_by',
                                   'witnessed_by','safety_reviewed_by','target_id') )
       ORDER BY 1, 2`);

    const fkKeys = new Set(fks.rows.map((r: any) => `${r.table_name}.${r.column_name}`));
    const candidates: Array<{ table: string; column: string; declaredFk: boolean; dataType: string }> = [
      ...fks.rows.map((r: any) => ({
        table: String(r.table_name).replace(/^public\./, ''),
        column: r.column_name,
        declaredFk: true,
        dataType: r.data_type,
      })),
      ...heur.rows
        .filter((r: any) => !fkKeys.has(`${r.table_name}.${r.column_name}`) && !fkKeys.has(`public.${r.table_name}.${r.column_name}`))
        .map((r: any) => ({ table: r.table_name, column: r.column_name, declaredFk: false, dataType: r.data_type })),
    ];

    // 4 ─ unique indexes per table (for collision analysis)
    const uniq = await c.query(`
      SELECT t.relname AS table_name,
             i.relname AS index_name,
             ix.indpred IS NOT NULL AS partial,
             -- ::text matters: array_agg(attname) yields name[] (oid 1003), for which node-pg
             -- has no array parser, so it arrives as the raw string '{a,b}' rather than an
             -- array. text[] (oid 1009) is parsed. asArray() below is the belt to this brace.
             array_agg(a.attname::text ORDER BY k.ord) AS cols,
             bool_or(k.attnum = 0)               AS has_expression
        FROM pg_index ix
        JOIN pg_class i ON i.oid = ix.indexrelid
        JOIN pg_class t ON t.oid = ix.indrelid
        JOIN pg_namespace n ON n.oid = t.relnamespace AND n.nspname = 'public'
        JOIN unnest(ix.indkey) WITH ORDINALITY AS k(attnum, ord) ON TRUE
        LEFT JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = k.attnum
       WHERE ix.indisunique
       GROUP BY 1, 2, 3`);

    const uniqByTable = new Map<string, any[]>();
    for (const u of uniq.rows) {
      if (!uniqByTable.has(u.table_name)) uniqByTable.set(u.table_name, []);
      uniqByTable.get(u.table_name)!.push(u);
    }

    // 5 ─ counts + collisions, one candidate column at a time
    const rows: Row[] = [];
    for (const cand of candidates) {
      // A JS-level throw here would abort the whole census exactly the way an unisolated
      // SQL error would — the same false-zero failure class, one layer up. Contained.
      try {
      let rowsA: number | null = null;
      let rowsB: number | null = null;
      let note: string | undefined;
      const lhs = cast(cand.dataType);
      if (!lhs) {
        // catalog type we cannot compare a member uuid against — reported, never assumed zero
        note = `not counted: unsupported column type ${cand.dataType}`;
      } else {
        const countSql = `SELECT count(*)::int AS n FROM ${qi(cand.table)} WHERE ${qi(cand.column)} = ${lhs}`;
        const ra = await probe(c, () => c.query(countSql, [A]));
        if (ra.ok) rowsA = ra.value.rows[0].n;
        else note = `count failed (A): ${ra.error}`;
        const rb = await probe(c, () => c.query(countSql, [B]));
        if (rb.ok) rowsB = rb.value.rows[0].n;
        else note = [note, `count failed (B): ${rb.error}`].filter(Boolean).join('; ');
      }

      const uniqueKeys: string[] = [];
      const collisions: string[] = [];
      if (rowsA !== null && rowsB !== null && rowsA > 0 && rowsB > 0) {
        for (const u of uniqByTable.get(cand.table) || []) {
          const cols: string[] = asArray(u.cols).filter((x): x is string => Boolean(x));
          if (!cols.includes(cand.column)) continue;
          const label = `${u.index_name}(${cols.join(',')})${u.partial ? ' [partial]' : ''}`;
          uniqueKeys.push(label);
          if (u.has_expression) {
            collisions.push(`${label} — expression index, MANUAL REVIEW`);
            continue;
          }
          const others = cols.filter((x) => x !== cand.column);
          if (others.length === 0) {
            // one row per member: both hold one, so a rebind cannot keep both
            collisions.push(`${label} — one-row-per-member; both identities occupied`);
            continue;
          }
          const sel = others.map(qi).join(', ');
          const hit = await probe(c, () =>
            c.query(
              `SELECT count(*)::int AS n FROM (
                 SELECT ${sel} FROM ${qi(cand.table)} WHERE ${qi(cand.column)} = ${cast(cand.dataType)}
                 INTERSECT
                 SELECT ${sel} FROM ${qi(cand.table)} WHERE ${qi(cand.column)} = ${cast(cand.dataType, 2)}
               ) x`,
              [A, B]
            )
          );
          if (!hit.ok) collisions.push(`${label} — collision test failed: ${hit.error}`);
          else if (hit.value.rows[0].n > 0) collisions.push(`${label} — ${hit.value.rows[0].n} overlapping key(s)`);
        }
      }

      rows.push({
        ...cand,
        rowsA,
        rowsB,
        uniqueKeys,
        collisions,
        rule: classify(cand.table, rowsA, rowsB, collisions, note),
        note,
      });
      } catch (e: any) {
        rows.push({
          ...cand,
          rowsA: null,
          rowsB: null,
          uniqueKeys: [],
          collisions: [],
          rule: 'ERROR',
          note: `probe crashed: ${String(e?.message || e).split('\n')[0]}`,
        });
      }
    }

    // 6 ─ OPEN QUESTION (separate from the census): soul_portraits delete trace
    const trace: Record<string, any> = {};
    // Each trace query is savepoint-isolated too: this section is an OPEN QUESTION probe,
    // and it must never be able to abort the transaction and take the census down with it.
    const traceQueries: Array<[string, string, any[]]> = [
      ['portrait_table_stats',
       `SELECT relname, n_tup_ins, n_tup_upd, n_tup_del, n_live_tup
          FROM pg_stat_user_tables
         WHERE relname IN ('soul_portraits','soul_portrait_consents','member_guardians')`, []],
      // Owner identities other than the two candidates are shown by uuid prefix only —
      // a diagnostic must not spill other members' usernames or emails.
      ['portraits_by_owner',
       `SELECT left(p.owner_member_id::text, 8) || '…' AS owner_prefix,
               (p.owner_member_id = $1::uuid)          AS is_canonical_candidate,
               (p.owner_member_id = $2::uuid)          AS is_legacy_candidate,
               count(*)::int                           AS portraits
          FROM soul_portraits p
         GROUP BY 1,2,3 ORDER BY 4 DESC LIMIT 20`, [A, B]],
      ['orphaned_consent_rows',
       `SELECT count(*)::int AS n FROM soul_portrait_consents sc
         WHERE NOT EXISTS (SELECT 1 FROM soul_portraits p WHERE p.id = sc.portrait_id)`, []],
      ['consent_rows_for_missing_portraits_detail',
       `SELECT sc.portrait_id::text, min(sc.created_at) AS first_event,
               max(sc.created_at) AS last_event, count(*)::int AS events
          FROM soul_portrait_consents sc
         WHERE NOT EXISTS (SELECT 1 FROM soul_portraits p WHERE p.id = sc.portrait_id)
         GROUP BY 1 ORDER BY 2`, []],
    ];
    for (const [key, sql, params] of traceQueries) {
      const r = await probe(c, () => c.query(sql, params));
      trace[key] = r.ok ? r.value.rows : { error: r.error };
    }

    await c.query('ROLLBACK');

    // ── report ──────────────────────────────────────────────────────────────
    const report = {
      generated_at: new Date().toISOString(),
      read_only: true,
      canonical_candidate: A,
      legacy_candidate: B,
      identities: idents.rows,
      columns_examined: rows.length,
      rows,
      open_question_portrait_delete_trace: trace,
    };
    writeFileSync(OUT, JSON.stringify(report, null, 2));

    print(report);
    console.log(`\nJSON report: ${OUT}`);
    console.log('NO WRITES WERE PERFORMED. This ran inside a READ ONLY transaction.');
  } finally {
    c.release();
    await pool.end();
  }
}

// ── helpers ─────────────────────────────────────────────────────────────────

/**
 * Run one fallible probe inside its own SAVEPOINT.
 *
 * Without this, the per-probe try/catch below is decorative: every query shares one
 * transaction, so the FIRST error puts Postgres into aborted state and every later probe
 * fails with `current transaction is aborted`. The census would then read as a wall of
 * zeros/errors caused by a single exotic column — the exact `ERROR != zero` failure this
 * instrument exists to avoid. The SAVEPOINT keeps the failure local; the outer
 * READ ONLY transaction is untouched, so the no-write guarantee still holds.
 */
async function probe(
  c: any,
  fn: () => Promise<any>
): Promise<{ ok: true; value: any } | { ok: false; error: string }> {
  await c.query('SAVEPOINT census_probe');
  try {
    const value = await fn();
    await c.query('RELEASE SAVEPOINT census_probe');
    return { ok: true, value };
  } catch (e: any) {
    await c.query('ROLLBACK TO SAVEPOINT census_probe');
    await c.query('RELEASE SAVEPOINT census_probe');
    return { ok: false, error: String(e?.message || e).split('\n')[0] };
  }
}

/**
 * Postgres array -> JS array, tolerating a driver that hands back the raw '{a,b}' literal.
 * Fallback only; the ::text cast above means the driver normally parses this itself. The naive
 * split is lossy for a quoted identifier containing a comma — such a name would yield a bogus
 * column, whose collision probe then fails and is reported ERROR rather than read as zero.
 */
function asArray(v: any): Array<string | null> {
  if (Array.isArray(v)) return v;
  if (typeof v === 'string' && v.startsWith('{') && v.endsWith('}')) {
    const body = v.slice(1, -1);
    if (body === '') return [];
    return body.split(',').map((x) => {
      const t = x.replace(/^"|"$/g, '');
      return t === 'NULL' ? null : t;
    });
  }
  return [];
}

function qi(ident: string): string {
  return '"' + String(ident).replace(/"/g, '""') + '"';
}
/** Comparison operand for a member id against a column of the given catalog type. */
function cast(dataType: string, param = 1): string | null {
  const t = String(dataType).toLowerCase();
  if (t === 'uuid') return `$${param}::uuid`;
  if (t === 'text' || t === 'varchar' || t.startsWith('character varying')) return `$${param}::text`;
  return null; // not guessed — the column is reported uncounted instead
}
function classify(
  table: string,
  a: number | null,
  b: number | null,
  collisions: string[],
  note?: string
): MergeRule {
  if (note || a === null || b === null) return 'ERROR';
  if (a === 0 && b === 0) return 'NO_OP';
  if (SESSION_RE.test(table)) return 'SESSION_NO_REBIND';
  if (LEDGER_RE.test(table)) return 'PROVENANCE_PRESERVE';
  if (b === 0) return 'CANONICAL_ONLY';
  if (a === 0) return 'REBIND_CLEAN';
  return collisions.length > 0 ? 'COLLISION_MANUAL' : 'REBIND_CHECK';
}

function print(r: any) {
  console.log('MEMBER IDENTITY OWNERSHIP CENSUS — read-only\n');
  console.log(`  canonical candidate (A): ${r.canonical_candidate}`);
  console.log(`  legacy candidate    (B): ${r.legacy_candidate}\n`);
  for (const m of r.identities) {
    console.log(`  ${m.id}  ${m.username}  ${m.email}  onboarded=${m.onboarded}  created=${m.created_at}  last_sign_in=${m.last_sign_in}`);
  }

  const touched = r.rows.filter((x: Row) => (x.rowsA || 0) + (x.rowsB || 0) > 0 || x.rule === 'ERROR');
  touched.sort((x: Row, y: Row) => (y.rowsB || 0) - (x.rowsB || 0) || (y.rowsA || 0) - (x.rowsA || 0));

  console.log(`\n  columns examined: ${r.columns_examined}   columns with rows under either identity: ${touched.length}\n`);
  console.log('| table | column | fk | rows A (canonical) | rows B (legacy) | collision risk | merge rule |');
  console.log('|---|---|---|---|---|---|---|');
  for (const x of touched) {
    const risk = x.collisions.length ? x.collisions.join('; ') : x.uniqueKeys.length ? 'unique keys present, no overlap found' : '—';
    console.log(`| ${x.table} | ${x.column} | ${x.declaredFk ? 'yes' : 'no'} | ${x.rowsA ?? '?'} | ${x.rowsB ?? '?'} | ${risk} | ${x.rule}${x.note ? ' — ' + x.note : ''} |`);
  }

  const byRule: Record<string, number> = {};
  for (const x of r.rows) byRule[x.rule] = (byRule[x.rule] || 0) + 1;
  console.log('\n  rule tally: ' + Object.entries(byRule).map(([k, v]) => `${k}=${v}`).join('  '));

  console.log('\nOPEN QUESTION — soul_portraits delete trace (NOT part of the census):');
  console.log(JSON.stringify(r.open_question_portrait_delete_trace, null, 2));
}

main().catch((e) => {
  console.error('census failed:', e);
  process.exit(1);
});
