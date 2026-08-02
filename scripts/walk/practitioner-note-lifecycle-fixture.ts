#!/usr/bin/env npx tsx
/**
 * ACCEPTANCE WALK FIXTURE — practitioner note lifecycle (PR #890)
 *
 * Creates a DISPOSABLE practitioner + client + session, records exact baseline
 * counts, and tears everything down with an exact-restoration assertion.
 *
 * The walk itself is performed by a human in the real UI. This script only
 * prepares the ground, snapshots state, and proves the ground was restored.
 *
 * ── SAFETY ─────────────────────────────────────────────────────────────────
 *
 * Every destructive statement is scoped to the fixture practitioner id that
 * THIS script created and recorded. There is no `DELETE ... WHERE member_id`,
 * no delete by name pattern, and no delete that could reach a real row.
 * Teardown refuses to run if the recorded fixture id is missing or if the
 * practitioner it points at is not the one this script marked.
 *
 * ── SCHEMA INTROSPECTION, NOT ASSUMPTION ───────────────────────────────────
 *
 * `practitioner_clients` has THREE conflicting CREATE TABLE statements across
 * migrations (see project_studio_caseload_registry_split). Hard-coding a column
 * list would produce a fixture that works on one database and fails on another,
 * and the failure would look like a defect in the feature under test. So the
 * INSERT is built from information_schema against the database actually being
 * walked.
 *
 * ⚠️ Introspection covers NOT NULL and defaults. It does NOT cover CHECK
 * constraints — a row can satisfy every column requirement and still be
 * refused. `practitioner_clients_pending_reachable` is exactly that case:
 *
 *   CHECK (relationship_status <> 'pending' OR member_id IS NOT NULL
 *          OR normalized_invitation_email IS NOT NULL)
 *
 * A default `relationship_status='pending'` with no member and no invitation
 * email violates it. The fixture supplies the invitation email so the client is
 * "reachable" without inventing a member. Found by running this script, not by
 * reading the schema.
 *
 * ── ATOMICITY ──────────────────────────────────────────────────────────────
 *
 * setup() runs in a TRANSACTION. The first version did not, and a failure on
 * the client insert left an orphan practitioner behind with no state file to
 * clean it up — a fixture that litters the database it is supposed to leave
 * untouched. Either the whole fixture exists, or none of it does.
 *
 * Usage:
 *   npx tsx scripts/walk/practitioner-note-lifecycle-fixture.ts setup
 *   npx tsx scripts/walk/practitioner-note-lifecycle-fixture.ts baseline
 *   npx tsx scripts/walk/practitioner-note-lifecycle-fixture.ts inspect
 *   npx tsx scripts/walk/practitioner-note-lifecycle-fixture.ts plaintext-scan
 *   npx tsx scripts/walk/practitioner-note-lifecycle-fixture.ts teardown
 */

import db from '../../lib/db/postgres';
import { randomUUID } from 'crypto';
import { writeFileSync, readFileSync, existsSync, unlinkSync } from 'fs';
import { join } from 'path';

const STATE_FILE = join(process.cwd(), '.walk-practitioner-note-fixture.json');
const MARKER = 'WALK-FIXTURE-890';

interface FixtureState {
  practitionerId: string;
  clientId: string;
  sessionId: string | null;
  otherPractitionerId: string;
  otherClientId: string;
  createdAt: string;
  baseline: Record<string, number>;
}

// ── helpers ────────────────────────────────────────────────────────────────

async function columnsOf(
  table: string
): Promise<Map<string, { nullable: boolean; type: string; hasDefault: boolean; generated: boolean }>> {
  const r = await db.query(
    `SELECT column_name, is_nullable, data_type, column_default, is_generated
       FROM information_schema.columns WHERE table_name = $1`,
    [table]
  );
  const m = new Map();
  for (const row of r.rows) {
    m.set(row.column_name, {
      nullable: row.is_nullable === 'YES',
      type: row.data_type,
      hasDefault: row.column_default !== null,
      // GENERATED ALWAYS columns are computed by the database and reject any
      // supplied value outright ("cannot insert a non-DEFAULT value").
      // practitioner_clients.normalized_invitation_email is one: it derives from
      // invitation_email. Write the source column, never the generated one.
      generated: row.is_generated === 'ALWAYS',
    });
  }
  return m;
}

/**
 * Build an INSERT using only columns that exist, and supply a value for every
 * NOT NULL column without a default. Anything required that we have no value
 * for is reported rather than guessed — a fixture that silently invents data is
 * how a walk ends up testing something other than the feature.
 */
async function insertIntrospected(
  table: string,
  desired: Record<string, unknown>
): Promise<string> {
  const cols = await columnsOf(table);
  if (cols.size === 0) throw new Error(`table ${table} does not exist in this database`);

  const use: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(desired)) {
    if (cols.has(k) && !cols.get(k)!.generated) use[k] = v;
  }

  const missing: string[] = [];
  for (const [name, meta] of cols) {
    if (meta.generated) continue;
    if (!meta.nullable && !meta.hasDefault && !(name in use)) missing.push(`${name} (${meta.type})`);
  }
  if (missing.length) {
    throw new Error(
      `${table}: required column(s) with no fixture value: ${missing.join(', ')}\n` +
      `  The fixture will not guess. Add an explicit value in this script.`
    );
  }

  const names = Object.keys(use);
  const params = names.map((_, i) => `$${i + 1}`);
  const r = await db.query(
    `INSERT INTO ${table} (${names.join(', ')}) VALUES (${params.join(', ')}) RETURNING id`,
    Object.values(use)
  );
  return r.rows[0].id;
}

const COUNTED_TABLES = [
  'practitioners',
  'practitioner_clients',
  'practitioner_client_notes',
  'sessions',
];

async function counts(): Promise<Record<string, number>> {
  const out: Record<string, number> = {};
  for (const t of COUNTED_TABLES) {
    const exists = await db.query(`SELECT to_regclass($1) IS NOT NULL AS ok`, [t]);
    if (!exists.rows[0].ok) continue;
    const r = await db.query(`SELECT count(*)::int AS n FROM ${t}`);
    out[t] = r.rows[0].n;
  }
  return out;
}

function loadState(): FixtureState {
  if (!existsSync(STATE_FILE)) {
    throw new Error(`No fixture state at ${STATE_FILE} — run \`setup\` first.`);
  }
  return JSON.parse(readFileSync(STATE_FILE, 'utf8'));
}

// ── commands ───────────────────────────────────────────────────────────────

async function setup() {
  if (existsSync(STATE_FILE)) {
    throw new Error(
      `Fixture state already exists at ${STATE_FILE}.\n` +
      `  Run \`teardown\` before creating another, or the previous fixture is orphaned.`
    );
  }

  const baseline = await counts();
  console.log('📊 Baseline counts (before fixture):');
  for (const [t, n] of Object.entries(baseline)) console.log(`   ${t.padEnd(28)} ${n}`);

  const stamp = Date.now();
  // All-or-nothing. A partial fixture is worse than none: it leaves rows behind
  // that no state file knows about, so teardown cannot reach them.
  await db.query('BEGIN');
  try {

  // Primary fixture identity.
  const practitionerId = await insertIntrospected('practitioners', {
    id: randomUUID(),
    slug: `${MARKER.toLowerCase()}-${stamp}`,
    name: `${MARKER} Practitioner`,
    email: `${MARKER.toLowerCase()}-${stamp}@invalid.test`,
    status: 'active',
  });

  const clientEmail = `${MARKER.toLowerCase()}-client-${stamp}@invalid.test`;
  const clientId = await insertIntrospected('practitioner_clients', {
    id: randomUUID(),
    practitioner_id: practitionerId,
    name: `${MARKER} Client`,
    email: clientEmail,
    full_name: `${MARKER} Client`,
    display_name: `${MARKER} Client`,
    status: 'active',
    // Satisfies practitioner_clients_pending_reachable:
    //   relationship_status <> 'pending' OR member_id IS NOT NULL
    //   OR normalized_invitation_email IS NOT NULL
    // Taking the first disjunct — an 'active' relationship — avoids inventing a
    // members row, and models what the walk actually needs: a real client the
    // practitioner already works with.
    relationship_status: 'active',
    invitation_email: clientEmail,
  });

  // A SECOND practitioner + client. Criterion 13 needs cross-scope refusal, and
  // "refused" is only meaningful against a row that genuinely exists elsewhere —
  // a random UUID would 404 for the trivial reason that nothing is there.
  const otherPractitionerId = await insertIntrospected('practitioners', {
    id: randomUUID(),
    slug: `${MARKER.toLowerCase()}-other-${stamp}`,
    name: `${MARKER} Other Practitioner`,
    email: `${MARKER.toLowerCase()}-other-${stamp}@invalid.test`,
    status: 'active',
  });

  const otherClientEmail = `${MARKER.toLowerCase()}-otherclient-${stamp}@invalid.test`;
  const otherClientId = await insertIntrospected('practitioner_clients', {
    id: randomUUID(),
    practitioner_id: otherPractitionerId,
    name: `${MARKER} Other Client`,
    email: otherClientEmail,
    full_name: `${MARKER} Other Client`,
    display_name: `${MARKER} Other Client`,
    status: 'active',
    relationship_status: 'active',
    invitation_email: otherClientEmail,
  });

  // A real session for criterion 13's ownership check. Optional — if `sessions`
  // needs columns we cannot supply, the walk still runs with session_id null and
  // criterion 13's session arm is recorded as NOT EXERCISED rather than passed.
  // SAVEPOINT, not a bare try: inside a transaction a failed statement poisons
  // the whole thing, so catching the error without rolling back to a savepoint
  // would make every subsequent statement fail with "current transaction is
  // aborted" — and the real cause would be buried.
  let sessionId: string | null = null;
  await db.query('SAVEPOINT session_fixture');
  try {
    sessionId = await insertIntrospected('sessions', {
      id: randomUUID(),
      practitioner_id: practitionerId,
      client_id: clientId,
      scheduled_start: new Date(stamp).toISOString(),
      scheduled_end: new Date(stamp + 3600_000).toISOString(),
      status: 'completed',
    });
    await db.query('RELEASE SAVEPOINT session_fixture');
  } catch (e) {
    await db.query('ROLLBACK TO SAVEPOINT session_fixture');
    console.warn(`\n⚠️  Session fixture not created: ${(e as Error).message}`);
    console.warn('   Criterion 13 (session ownership) must be recorded NOT EXERCISED, not passed.');
  }

  await db.query('COMMIT');

  // State file written only AFTER the commit. Writing it first would leave a
  // file pointing at rows that a rollback removed, and teardown would then
  // refuse against ids that no longer exist.
  const state: FixtureState = {
    practitionerId,
    clientId,
    sessionId,
    otherPractitionerId,
    otherClientId,
    createdAt: new Date(stamp).toISOString(),
    baseline,
  };
  writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));

  console.log('\n✅ Fixture created:');
  console.log(`   practitioner       ${practitionerId}`);
  console.log(`   client             ${clientId}`);
  console.log(`   session            ${sessionId ?? '(none — see warning above)'}`);
  console.log(`   other practitioner ${otherPractitionerId}`);
  console.log(`   other client       ${otherClientId}`);
  console.log(`\n   Walk URL: /studio/clients/${clientId}`);
  console.log(`   State:    ${STATE_FILE}`);
  console.log(`\n⚠️  Sign in as the fixture practitioner and RECORD which practitioner row`);
  console.log(`   getCurrentPractitioner() resolves to. Notes are scoped to practitioner_id;`);
  console.log(`   an identity mismatch reads as "my notes disappeared" — a false defect.`);

  } catch (e) {
    await db.query('ROLLBACK').catch(() => {});
    throw new Error(
      `${(e as Error).message}\n` +
      `  Transaction rolled back — no fixture rows were left behind.`
    );
  }
}

async function baseline() {
  const s = loadState();
  console.log('📊 Baseline recorded at fixture setup:');
  for (const [t, n] of Object.entries(s.baseline)) console.log(`   ${t.padEnd(28)} ${n}`);
}

/** Full row state for the fixture client — the before/after each criterion needs. */
async function inspect() {
  const s = loadState();
  const r = await db.query(
    `SELECT id, kind, lifecycle, completion_mode, completed_at, version,
            session_id, note_date, promoted_from, status,
            length(content_enc) AS ciphertext_len,
            created_at, updated_at
       FROM practitioner_client_notes
      WHERE practitioner_id = $1
      ORDER BY created_at`,
    [s.practitionerId]
  );

  console.log(`\n📋 practitioner_client_notes for fixture practitioner (${r.rows.length} row(s))\n`);
  if (r.rows.length === 0) {
    console.log('   (none)');
  } else {
    for (const n of r.rows) {
      console.log(`   ${n.id}`);
      console.log(`     kind=${n.kind}  lifecycle=${n.lifecycle}  completion_mode=${n.completion_mode ?? 'NULL'}`);
      console.log(`     completed_at=${n.completed_at ?? 'NULL'}  version=${n.version}`);
      console.log(`     session_id=${n.session_id ?? 'NULL'}  note_date=${n.note_date?.toISOString?.().slice(0, 10) ?? n.note_date}`);
      console.log(`     status=${n.status ?? 'NULL'}  promoted_from=${n.promoted_from ?? 'NULL'}`);
      console.log(`     ciphertext_len=${n.ciphertext_len}  updated=${n.updated_at?.toISOString?.() ?? n.updated_at}`);
      console.log('');
    }
  }

  // Criterion 10 discrimination, stated as data rather than inferred.
  const locked = r.rows.filter((n) => n.completion_mode === 'practitioner_declared');
  const editable = r.rows.filter((n) => n.lifecycle === 'completed' && n.completion_mode !== 'practitioner_declared');
  console.log(`   locked (completion_mode='practitioner_declared'): ${locked.length}`);
  console.log(`   completed but editable (backfilled):              ${editable.length}`);
}

/**
 * Criterion 3, database half: does the note body exist anywhere in plaintext?
 *
 * Checks the encrypted table has no plaintext sibling column, AND greps the
 * known plaintext PHI surface (sessions.notes / sessions.practitioner_notes,
 * the unruled finding from the ruling doc §3) for the walk sentinel.
 */
async function plaintextScan() {
  const s = loadState();
  const sentinel = process.argv[3];
  if (!sentinel) {
    throw new Error('Usage: plaintext-scan "<exact sentinel string you typed into the note>"');
  }

  const cols = await columnsOf('practitioner_client_notes');
  const plaintextish = [...cols.keys()].filter(
    (c) => c === 'content' || (c.includes('content') && !c.includes('_enc'))
  );
  console.log(`\n🔍 practitioner_client_notes plaintext-capable columns: ${plaintextish.length ? plaintextish.join(', ') : 'NONE ✅'}`);

  const hits = await db.query(
    `SELECT id FROM sessions
      WHERE (practitioner_id = $1 OR client_id = $2)
        AND (notes ILIKE $3 OR practitioner_notes ILIKE $3)`,
    [s.practitionerId, s.clientId, `%${sentinel}%`]
  );
  console.log(`🔍 sessions.notes / practitioner_notes containing the sentinel: ${hits.rows.length}`);
  if (hits.rows.length > 0) {
    console.log('   ❌ Note content leaked into the plaintext sessions columns.');
    for (const h of hits.rows) console.log(`      session ${h.id}`);
  } else {
    console.log('   ✅ No leak into the known plaintext PHI surface.');
  }
}

/**
 * Teardown. Deletes ONLY rows owned by the two fixture practitioners this
 * script created, then asserts every counted table is back to its exact
 * baseline. A near-match is a failure, not a rounding difference.
 */
async function teardown() {
  const s = loadState();

  // Refuse to delete anything unless the recorded ids still point at rows this
  // script marked. Guards against a stale state file aimed at a real row.
  for (const pid of [s.practitionerId, s.otherPractitionerId]) {
    const r = await db.query(`SELECT name FROM practitioners WHERE id = $1`, [pid]);
    if (r.rows.length === 0) {
      console.warn(`⚠️  practitioner ${pid} already absent — continuing.`);
      continue;
    }
    if (!String(r.rows[0].name).startsWith(MARKER)) {
      throw new Error(
        `REFUSING TEARDOWN: practitioner ${pid} is named "${r.rows[0].name}", which does not carry ` +
        `the ${MARKER} marker. The state file does not describe a fixture row.`
      );
    }
  }

  const notes = await db.query(
    `DELETE FROM practitioner_client_notes WHERE practitioner_id = ANY($1::uuid[]) RETURNING id`,
    [[s.practitionerId, s.otherPractitionerId]]
  );
  const sess = await db.query(
    `DELETE FROM sessions WHERE practitioner_id = ANY($1::uuid[]) RETURNING id`,
    [[s.practitionerId, s.otherPractitionerId]]
  );
  const clients = await db.query(
    `DELETE FROM practitioner_clients WHERE practitioner_id = ANY($1::uuid[]) RETURNING id`,
    [[s.practitionerId, s.otherPractitionerId]]
  );
  const pracs = await db.query(
    `DELETE FROM practitioners WHERE id = ANY($1::uuid[]) RETURNING id`,
    [[s.practitionerId, s.otherPractitionerId]]
  );

  console.log(`🧹 Deleted: ${notes.rows.length} note(s), ${sess.rows.length} session(s), ` +
              `${clients.rows.length} client(s), ${pracs.rows.length} practitioner(s)`);

  const after = await counts();
  let clean = true;
  console.log('\n📊 Baseline restoration:');
  for (const [t, before] of Object.entries(s.baseline)) {
    const now = after[t];
    const ok = now === before;
    if (!ok) clean = false;
    console.log(`   ${ok ? '✅' : '❌'} ${t.padEnd(28)} ${before} → ${now}`);
  }

  if (!clean) {
    console.error('\n❌ EXACT CLEANUP FAILED — counts did not return to baseline.');
    console.error('   State file retained for investigation. Criterion 14 FAILS.');
    process.exit(1);
  }

  unlinkSync(STATE_FILE);
  console.log('\n✅ Exact cleanup verified. Criterion 14 satisfied.');
}

// ── entry ──────────────────────────────────────────────────────────────────

async function main() {
  const cmd = process.argv[2];
  switch (cmd) {
    case 'setup': await setup(); break;
    case 'baseline': await baseline(); break;
    case 'inspect': await inspect(); break;
    case 'plaintext-scan': await plaintextScan(); break;
    case 'teardown': await teardown(); break;
    default:
      console.error('Usage: setup | baseline | inspect | plaintext-scan "<sentinel>" | teardown');
      process.exit(1);
  }
  await db.end?.();
}

main().catch((e) => {
  console.error(`\n❌ ${e.message}`);
  process.exit(1);
});
