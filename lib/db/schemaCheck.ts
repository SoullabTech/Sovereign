/**
 * Startup schema drift detector.
 *
 * Runs once at server boot. Warns loudly if critical columns or tables are
 * missing (= unapplied migration) but never throws — the server still starts
 * so the problem is diagnosable rather than silent-or-unbootable.
 *
 * Add to this list whenever a schema-mismatch 503 occurs in production.
 */

import { query } from '@/lib/db/postgres';

// ─── What to check ─────────────────────────────────────────────────────────

interface ColumnCheck {
  table: string;
  column: string;
  addedBy: string; // migration filename — makes the log actionable
}

interface TableCheck {
  table: string;
  addedBy: string;
}

const REQUIRED_COLUMNS: ColumnCheck[] = [
  // members — high-traffic, profile API references all of these
  { table: 'members', column: 'nostr_pubkey',         addedBy: '20260310000001_member_nostr.sql' },
  { table: 'members', column: 'nostr_registered_at',  addedBy: '20260310000001_member_nostr.sql' },
  { table: 'members', column: 'astrology_consent',    addedBy: '20260301000001_member_astrology_consent.sql' },
  { table: 'conversation_turns', column: 'exchange_id', addedBy: '20260301000001_conversation_turns_exchange_seq.sql' },
  // team_messages — delete path writes this; missing column 500s every deletion
  { table: 'team_messages', column: 'deleted_by', addedBy: '20260617000001_team_message_deletion_audit.sql' },
];

const REQUIRED_TABLES: TableCheck[] = [
  { table: 'member_nostr_events',       addedBy: '20260310000002_member_nostr_events.sql' },
  { table: 'nostr_channels',            addedBy: '20260310000003_nostr_channels.sql' },
  { table: 'maia_nostr_service_keys',   addedBy: '20260310000004_maia_nostr_delegation.sql' },
  { table: 'accumulating_hypotheses',   addedBy: '20260311000001_accumulating_hypotheses.sql' },
  { table: 'interpretive_ledger',       addedBy: '20260311000002_interpretive_ledger.sql' },
  { table: 'member_spiral_state',       addedBy: '20260213200001_member_spiral_state.sql' },
  { table: 'runtime_events',            addedBy: '20260524000001_runtime_events.sql' },
];

// ─── Check runner ───────────────────────────────────────────────────────────

export async function runSchemaCheck(): Promise<void> {
  const tag = '[SchemaCheck]';
  let problems = 0;

  try {
    // Check columns
    const colResult = await query(`
      SELECT table_name, column_name
      FROM information_schema.columns
      WHERE (table_name, column_name) = ANY(
        SELECT t.table_name, t.column_name
        FROM (VALUES ${REQUIRED_COLUMNS.map((_, i) => `($${i * 2 + 1}, $${i * 2 + 2})`).join(', ')}) AS t(table_name, column_name)
      )
    `, REQUIRED_COLUMNS.flatMap(c => [c.table, c.column]));

    const foundCols = new Set(colResult.rows.map(r => `${r.table_name}.${r.column_name}`));
    for (const { table, column, addedBy } of REQUIRED_COLUMNS) {
      if (!foundCols.has(`${table}.${column}`)) {
        console.error(`${tag} SCHEMA MISMATCH — missing column ${table}.${column} (migration: ${addedBy})`);
        problems++;
      }
    }

    // Check tables
    const tableResult = await query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name = ANY($1)
    `, [REQUIRED_TABLES.map(t => t.table)]);

    const foundTables = new Set(tableResult.rows.map(r => r.table_name));
    for (const { table, addedBy } of REQUIRED_TABLES) {
      if (!foundTables.has(table)) {
        console.error(`${tag} SCHEMA MISMATCH — missing table ${table} (migration: ${addedBy})`);
        problems++;
      }
    }

    // Migration count drift
    const migResult = await query('SELECT COUNT(*) AS cnt FROM schema_migrations');
    const dbCount = parseInt(migResult.rows[0].cnt, 10);
    console.log(`${tag} schema_migrations records: ${dbCount}`);
    if (problems === 0) {
      console.log(`${tag} ✓ all ${REQUIRED_COLUMNS.length} columns + ${REQUIRED_TABLES.length} tables present`);
    } else {
      console.error(`${tag} ✗ ${problems} schema problem(s) detected — run migration audit`);
    }
  } catch (err) {
    // DB not reachable at startup — warn but don't crash
    console.warn(`${tag} could not run schema check (DB not ready?):`, err);
  }
}
