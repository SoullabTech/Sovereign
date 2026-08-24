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
 *   COUNTS AND SCHEMA NAMES ONLY. No row content, no member text, no conversation
 *   material is read or printed. The whole run executes inside a READ ONLY transaction,
 *   so a write is refused by Postgres itself rather than by this script's good manners.
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
    const fks = await c.query(`
      SELECT con.conrelid::regclass::text AS table_name,
             att.attname                  AS column_name,
             con.conname                  AS constraint_name,
             con.confdeltype              AS on_delete
        FROM pg_constraint con
        JOIN unnest(con.conkey) WITH ORDINALITY AS k(attnum, ord) ON TRUE
        JOIN pg_attribute att ON att.attrelid = con.conrelid AND att.attnum = k.attnum
       WHERE con.contype = 'f'
         AND con.confrelid = 'public.members'::regclass
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
        dataType: 'uuid',
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
             array_agg(a.attname ORDER BY k.ord) AS cols,
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
      const q = (id: string) => `SELECT count(*)::int AS n FROM ${qi(cand.table)} WHERE ${qi(cand.column)} = ${cast(cand.dataType)}`;
      let rowsA: number | null = null;
      let rowsB: number | null = null;
      let note: string | undefined;
      try {
        rowsA = (await c.query(q(A), [A])).rows[0].n;
        rowsB = (await c.query(q(B), [B])).rows[0].n;
      } catch (e: any) {
        note = `count failed: ${String(e.message || e).split('\n')[0]}`;
      }

      const uniqueKeys: string[] = [];
      const collisions: string[] = [];
      if (rowsA !== null && rowsB !== null && rowsA > 0 && rowsB > 0) {
        for (const u of uniqByTable.get(cand.table) || []) {
          const cols: string[] = (u.cols || []).filter(Boolean);
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
          try {
            const hit = await c.query(
              `SELECT count(*)::int AS n FROM (
                 SELECT ${sel} FROM ${qi(cand.table)} WHERE ${qi(cand.column)} = ${cast(cand.dataType)}
                 INTERSECT
                 SELECT ${sel} FROM ${qi(cand.table)} WHERE ${qi(cand.column)} = ${cast(cand.dataType, 2)}
               ) x`,
              [A, B]
            );
            if (hit.rows[0].n > 0) collisions.push(`${label} — ${hit.rows[0].n} overlapping key(s)`);
          } catch (e: any) {
            collisions.push(`${label} — collision test failed: ${String(e.message || e).split('\n')[0]}`);
          }
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
    }

    // 6 ─ OPEN QUESTION (separate from the census): soul_portraits delete trace
    const trace: Record<string, any> = {};
    try {
      trace.portrait_table_stats = (
        await c.query(`SELECT relname, n_tup_ins, n_tup_upd, n_tup_del, n_live_tup
                         FROM pg_stat_user_tables
                        WHERE relname IN ('soul_portraits','soul_portrait_consents','member_guardians')`)
      ).rows;
      // Owner identities other than the two candidates are shown by uuid prefix only —
      // a diagnostic must not spill other members' usernames or emails.
      trace.portraits_by_owner = (
        await c.query(
          `SELECT left(p.owner_member_id::text, 8) || '…'                              AS owner_prefix,
                  (p.owner_member_id = $1::uuid)                                        AS is_canonical_candidate,
                  (p.owner_member_id = $2::uuid)                                        AS is_legacy_candidate,
                  count(*)::int                                                         AS portraits
             FROM soul_portraits p
            GROUP BY 1,2,3 ORDER BY 4 DESC LIMIT 20`,
          [A, B]
        )
      ).rows;
      trace.orphaned_consent_rows = (
        await c.query(`SELECT count(*)::int AS n FROM soul_portrait_consents sc
                        WHERE NOT EXISTS (SELECT 1 FROM soul_portraits p WHERE p.id = sc.portrait_id)`)
      ).rows[0].n;
      trace.consent_rows_for_missing_portraits_detail = (
        await c.query(`SELECT sc.portrait_id::text, min(sc.created_at) AS first_event, max(sc.created_at) AS last_event,
                              count(*)::int AS events
                         FROM soul_portrait_consents sc
                        WHERE NOT EXISTS (SELECT 1 FROM soul_portraits p WHERE p.id = sc.portrait_id)
                        GROUP BY 1 ORDER BY 2`)
      ).rows;
    } catch (e: any) {
      trace.error = String(e.message || e).split('\n')[0];
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
function qi(ident: string): string {
  return '"' + String(ident).replace(/"/g, '""') + '"';
}
function cast(dataType: string, param = 1): string {
  return dataType === 'uuid' ? `$${param}::uuid` : `$${param}::text`;
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
