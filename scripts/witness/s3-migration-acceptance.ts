/**
 * S3 · P1 — MIGRATION ACCEPTANCE WITNESS.
 *
 *   ⭐⭐ Two migrations, two different classes, one witness that keeps them
 *       apart.
 *
 *   20260910000001_pending_ask_claims.sql
 *       ADDITIVE. A new durable lifecycle substrate. Nothing existing can break.
 *
 *   20260910000002_context_disclosure_boundary_developmental.sql
 *       ALTERS A CHECK on a table that already holds production rows. It only
 *       ADMITS a previously refused value, so no existing row can become
 *       invalid — but that must be DEMONSTRATED, not asserted.
 *
 * ⛔ DISPOSABLE DATABASE ONLY. This script drops and rebuilds a schema. It must
 * never be pointed at production, and it applies nothing to production.
 *
 * ⚠️ SCOPE, STATED HONESTLY. The subject is the TWO migrations above. Their
 * ancestors (`runtime_consent_state`, `members`, `member_manuscripts`,
 * `ask_threads`) are stood up minimally — `runtime_consent_state` verbatim from
 * its own migration — because pulling the whole historical chain would witness
 * other lanes' migrations rather than these. That is a scope choice, and it is
 * the reason this run cannot speak to the health of anything but these two.
 *
 * Usage:  S3_MIGRATION_DB_URL=postgresql://…  npx tsx scripts/witness/s3-migration-acceptance.ts
 */

import { Client } from 'pg';
import { readFileSync } from 'fs';
import { join } from 'path';

const URL = process.env.S3_MIGRATION_DB_URL;
if (!URL) {
  console.error('S3_MIGRATION_DB_URL is required, and must name a DISPOSABLE database.');
  process.exit(2);
}

const ROOT = join(__dirname, '..', '..');
const M = (f: string) => readFileSync(join(ROOT, 'database', 'migrations', f), 'utf8');
const PENDING = '20260910000001_pending_ask_claims.sql';
const BOUNDARY = '20260910000002_context_disclosure_boundary_developmental.sql';

const results: { id: string; ok: boolean; detail: string }[] = [];
const check = (id: string, ok: boolean, detail: string) => {
  results.push({ id, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${id.padEnd(6)}  ${detail}`);
};

const c = new Client({ connectionString: URL });

/** Did this statement fail, and with what? `null` means it succeeded. */
async function refusal(sql: string, params: unknown[] = []): Promise<string | null> {
  try { await c.query(sql, params as any[]); return null; }
  catch (e) { return (e as Error).message; }
}

const MEMBER = '11111111-1111-1111-1111-111111111111';
const WORK = '22222222-2222-2222-2222-222222222222';
const THREAD = '33333333-3333-3333-3333-333333333333';
const READING = '44444444-4444-4444-4444-444444444444';
const ref = (n: string) => `${n}${'0'.repeat(Math.max(0, 40 - n.length))}`;

const FOCUS = 'writers_studio.focus->maia_cognition';
const DEVELOPMENTAL = 'writers_studio.ask->maia_developmental';

const seedReceipt = async (disclosureId: string, boundary: string, requestId: string) => {
  await c.query(
    `INSERT INTO runtime_consent_state (request_id, member_id, posture)
     VALUES ($1, $2, 'normal') ON CONFLICT (request_id) DO NOTHING`, [requestId, MEMBER]);
  return refusal(
    `INSERT INTO context_disclosure_receipts
       (disclosure_id, member_id, request_ref, boundary, source_class,
        participation_basis, source_ref, scope_kind, section_ref,
        authorized_by, gesture, policy_version, state)
     VALUES ($1,$2,$3,$4,'work','member_invoked',$5,'section','sec-1','member','ask_maia','v1','attempted')`,
    [disclosureId, MEMBER, requestId, boundary, WORK]);
};

async function main() {
  await c.connect();

  /* ── A · FRESH RECONSTRUCTION ───────────────────────────────────────────── */
  await c.query('DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;');
  await c.query('CREATE EXTENSION IF NOT EXISTS pgcrypto');
  await c.query(`
    CREATE TABLE members (id uuid PRIMARY KEY);
    CREATE TABLE member_manuscripts (id uuid PRIMARY KEY);
    CREATE TABLE ask_threads (id uuid PRIMARY KEY);
    INSERT INTO members VALUES ('${MEMBER}');
    INSERT INTO member_manuscripts VALUES ('${WORK}');
    INSERT INTO ask_threads VALUES ('${THREAD}');`);
  /* Verbatim from 20260718000001_s5_provenance_substrate.sql. */
  await c.query(`
    CREATE TABLE runtime_consent_state (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      request_id TEXT NOT NULL UNIQUE,
      member_id TEXT, session_id TEXT,
      posture TEXT NOT NULL CHECK (posture IN ('normal','sanctuary')),
      resolved_from TEXT NOT NULL DEFAULT 'request-meta',
      resolved_at TIMESTAMPTZ NOT NULL DEFAULT NOW());`);
  /* ⭐ The receipts substrate's INSERT trigger consults the tombstone ledger — a
     tombstoned receipt can never be restored — so the ledger must exist for the
     table to accept a row at all. Verbatim from the same S5 migration; found by
     running the witness, not by reading the trigger. */
  await c.query(`
    CREATE TABLE deletion_manifests (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      manifest TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
    CREATE TABLE provenance_tombstones (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      manifest_id UUID NOT NULL REFERENCES deletion_manifests(id) ON DELETE CASCADE,
      object_kind TEXT NOT NULL,
      object_id TEXT NOT NULL,
      tombstoned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (object_kind, object_id));`);
  await c.query(M('20260909000001_context_disclosure_receipts.sql'));
  check('A1', true, 'ancestors + receipts substrate rebuilt on an empty schema');

  const forward = await refusal(M(PENDING));
  check('A2', forward === null, forward ?? 'pending_ask_claims applies to a fresh database');

  /* ⭐ The pre-existing row is written BEFORE the widening, so the widening has
     something real to be validated against. */
  const pre = await seedReceipt('d-focus-1', FOCUS, 'req-focus-1');
  check('A3', pre === null, pre ?? 'a production-shaped Focus receipt exists before the widening');

  const widen = await refusal(M(BOUNDARY));
  check('A4', widen === null, widen ?? 'the boundary widening applies with existing rows present');

  /* ── B · pending_ask_claims · STRUCTURE ─────────────────────────────────── */
  const cols = (await c.query<{ column_name: string }>(
    `SELECT column_name FROM information_schema.columns
      WHERE table_name='pending_ask_claims' ORDER BY column_name`)).rows.map((r) => r.column_name);
  const expected = ['completed_at','consumed_at','created_at','expires_at','manuscript_id',
    'member_id','observation_key','ping_placeholder','reading_id','ref','thread_id']
    .filter((x) => x !== 'ping_placeholder');
  check('B1', JSON.stringify(cols) === JSON.stringify(expected),
    `columns: ${cols.join(', ')}`);

  const banned = ['section_id','section_ref','sections','authorized','scope_kind',
    'disclosure_id','may_cross','consent','permission','grant','body','text','prose','passage'];
  const leaked = banned.filter((b) => cols.includes(b));
  check('B2', leaked.length === 0,
    leaked.length ? `permission-bearing column(s): ${leaked.join(', ')}` : 'no permission-bearing column exists');

  const lifetime = await refusal(
    `INSERT INTO pending_ask_claims (ref, member_id, manuscript_id, thread_id, reading_id, observation_key, created_at, expires_at)
     VALUES ($1,$2,$3,$4,$5,'o', now(), now() - interval '1 minute')`,
    [ref('bad-lifetime-'), MEMBER, WORK, THREAD, READING]);
  check('B3', lifetime !== null && /expiry_after_creation/.test(lifetime),
    lifetime ? 'expires_at must follow created_at' : 'a row expiring before it existed was ACCEPTED');

  const shortRef = await refusal(
    `INSERT INTO pending_ask_claims (ref, member_id, manuscript_id, thread_id, reading_id, observation_key, expires_at)
     VALUES ('short',$1,$2,$3,$4,'o', now() + interval '30 min')`, [MEMBER, WORK, THREAD, READING]);
  check('B4', shortRef !== null, shortRef ? 'a low-entropy ref is refused' : 'a 5-character ref was ACCEPTED');

  const orphanCompletion = await refusal(
    `INSERT INTO pending_ask_claims (ref, member_id, manuscript_id, thread_id, reading_id, observation_key, expires_at, completed_at)
     VALUES ($1,$2,$3,$4,$5,'o', now() + interval '30 min', now())`,
    [ref('orphan-completion-'), MEMBER, WORK, THREAD, READING]);
  check('B5', orphanCompletion !== null && /completion_requires_consumption/.test(orphanCompletion),
    orphanCompletion ? 'a completion cannot exist without the claim that produced it' : 'an orphan completion was ACCEPTED');

  /* ── C · pending_ask_claims · TRIGGERS ──────────────────────────────────── */
  const live = ref('live-claim-');
  await c.query(
    `INSERT INTO pending_ask_claims (ref, member_id, manuscript_id, thread_id, reading_id, observation_key, expires_at)
     VALUES ($1,$2,$3,$4,$5,'o', now() + interval '30 min')`, [live, MEMBER, WORK, THREAD, READING]);

  const claimed = await c.query(
    `UPDATE pending_ask_claims SET consumed_at = now()
      WHERE ref = $1 AND consumed_at IS NULL AND expires_at > now() RETURNING ref`, [live]);
  check('C1', claimed.rowCount === 1, 'the atomic claim wins once');

  const second = await c.query(
    `UPDATE pending_ask_claims SET consumed_at = now()
      WHERE ref = $1 AND consumed_at IS NULL AND expires_at > now() RETURNING ref`, [live]);
  check('C2', second.rowCount === 0, 'a second claim matches no row');

  const unconsume = await refusal(`UPDATE pending_ask_claims SET consumed_at = NULL WHERE ref = $1`, [live]);
  check('C3', unconsume !== null && /already consumed/i.test(unconsume),
    unconsume ? 'a consumed claim can never return to pending' : 'consumed_at was CLEARED');

  const repoint = await refusal(`UPDATE pending_ask_claims SET observation_key = 'other' WHERE ref = $1`, [live]);
  check('C4', repoint !== null && /immutable/i.test(repoint),
    repoint ? 'the Ask binding cannot be re-pointed' : 'the Ask binding was REWRITTEN');

  await c.query(`UPDATE pending_ask_claims SET completed_at = now() WHERE ref = $1`, [live]);
  const recomplete = await refusal(`UPDATE pending_ask_claims SET completed_at = now() WHERE ref = $1`, [live]);
  check('C5', recomplete !== null, recomplete ? 'completion is recorded once' : 'completion was RE-RECORDED');

  const expired = ref('expired-claim-');
  await c.query(
    `INSERT INTO pending_ask_claims (ref, member_id, manuscript_id, thread_id, reading_id, observation_key, created_at, expires_at)
     VALUES ($1,$2,$3,$4,$5,'o', now() - interval '60 min', now() - interval '5 min')`,
    [expired, MEMBER, WORK, THREAD, READING]);
  const expiredClaim = await c.query(
    `UPDATE pending_ask_claims SET consumed_at = now()
      WHERE ref = $1 AND consumed_at IS NULL AND expires_at > now() RETURNING ref`, [expired]);
  check('C6', expiredClaim.rowCount === 0, 'an expired resume cannot be claimed');

  /* ── D · IDEMPOTENCE AND ROLLBACK ───────────────────────────────────────── */
  const again = await refusal(M(PENDING));
  check('D1', again === null, again ?? 'the pending migration re-applies without error');

  const rowsBefore = (await c.query(`SELECT count(*)::int AS n FROM pending_ask_claims`)).rows[0].n;
  await c.query(`DROP TABLE pending_ask_claims; DROP FUNCTION IF EXISTS pending_ask_claims_forward_only();`);
  const reapply = await refusal(M(PENDING));
  const rowsAfter = (await c.query(`SELECT count(*)::int AS n FROM pending_ask_claims`)).rows[0].n;
  check('D2', reapply === null && rowsAfter === 0 && rowsBefore > 0,
    `rollback rehearsed: ${rowsBefore} row(s) discarded, table rebuilt clean`);

  /* ── E–H · THE CHECK CHANGE, AGAINST EXISTING DATA ──────────────────────── */
  const survivor = (await c.query(
    `SELECT disclosure_id, boundary, source_class, participation_basis, source_ref,
            scope_kind, section_ref, gesture, state
       FROM context_disclosure_receipts WHERE disclosure_id = 'd-focus-1'`)).rows[0];
  check('E1', !!survivor, 'the pre-existing Focus receipt survived the widening');
  check('E2', survivor?.boundary === FOCUS && survivor?.state === 'attempted' && survivor?.scope_kind === 'section',
    `its meaning is unchanged: boundary=${survivor?.boundary} state=${survivor?.state} scope=${survivor?.scope_kind}`);

  const dev = await seedReceipt('d-dev-1', DEVELOPMENTAL, 'req-dev-1');
  check('F1', dev === null, dev ?? 'the developmental boundary value is now accepted');

  const bogus = await seedReceipt('d-bogus-1', 'writers_studio.anything->anywhere', 'req-bogus-1');
  check('G1', bogus !== null && /boundary_check/.test(bogus),
    bogus ? 'an unrelated boundary value is still rejected' : 'an ARBITRARY boundary value was accepted');

  const focusStillOk = await seedReceipt('d-focus-2', FOCUS, 'req-focus-2');
  check('H1', focusStillOk === null, focusStillOk ?? 'new Focus receipts are still admitted');

  /* ── I · THE ROLLBACK PATH, REHEARSED ───────────────────────────────────── */
  /* ⭐ EXPLICITLY TRANSACTIONAL. The rollback in the migration's own comment is
     two statements; run through one implicit transaction the DROP would be
     rolled back with the failed ADD, and run separately it would leave the table
     unconstrained. The rehearsal must show what a real rollback would do. */
  await c.query('BEGIN');
  const narrowWithDev = await refusal(`
    ALTER TABLE context_disclosure_receipts DROP CONSTRAINT context_disclosure_receipts_boundary_check;
    ALTER TABLE context_disclosure_receipts ADD CONSTRAINT context_disclosure_receipts_boundary_check
      CHECK (boundary IN ('${FOCUS}'));`);
  await c.query('ROLLBACK');
  check('I1', narrowWithDev !== null,
    narrowWithDev
      ? 'narrowing FAILS while a developmental receipt exists — evidence is not disposable'
      : 'narrowing SUCCEEDED with a developmental receipt present');

  /* ⛔ THE ROLLBACK IS NOT "DELETE UNTIL THE CONSTRAINT FITS."
     The migration's own rollback note says so: *"Delete nothing to make the
     constraint fit; a receipt is not disposable."* An earlier draft of this
     witness rehearsed I2 by deleting the developmental receipts — which would
     have proved the rollback works by doing the one thing the migration
     forbids. Found by running it: the delete was refused by the receipts
     table's governed-custody trigger, and the refusal was right.

     ⭐ So the truthful statement is CONDITIONAL, and it is rehearsed on a
     substrate where the condition holds — a clean receipts table with no
     developmental row ever written. */
  await c.query(`DROP TABLE context_disclosure_receipts CASCADE`);
  await c.query(M('20260909000001_context_disclosure_receipts.sql'));
  const rewiden = await refusal(M(BOUNDARY));
  const focusOnly = await seedReceipt('d-focus-3', FOCUS, 'req-focus-3');
  const narrowClean = (rewiden === null && focusOnly === null) ? await refusal(`
    ALTER TABLE context_disclosure_receipts DROP CONSTRAINT context_disclosure_receipts_boundary_check;
    ALTER TABLE context_disclosure_receipts ADD CONSTRAINT context_disclosure_receipts_boundary_check
      CHECK (boundary IN ('${FOCUS}'));`) : 'the clean substrate could not be rebuilt';
  check('I2', narrowClean === null,
    narrowClean ?? 'rollback succeeds while no developmental receipt has ever been written');

  check('I3', true,
    'once a developmental receipt exists the rollback is UNAVAILABLE — and that is correct, not a defect');

  await c.end();

  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length} passed · ${failed.length} failed`);
  process.exit(failed.length === 0 ? 0 : 1);
}

main().catch((e) => { console.error(e); process.exit(3); });
