/**
 * WS-DELETE-01 · S4 — NC-19, the concurrent arrival claim.
 *
 * Founder review 2026-09-08 (second return). The recording-transaction-client
 * controls in `lib/storage/__tests__/erasureAuthority.test.ts` prove the seam's
 * decisions and its statement order. They cannot prove PostgreSQL row-lock
 * behaviour, and this defect lives entirely in that behaviour, so it gets a
 * real two-transaction witness against a real database.
 *
 * THE RACE, if the parent is not locked before the inventory is taken:
 *
 *   ERASURE TX                      ARRIVAL CLAIM
 *   capture refs → [A]
 *                                   attach arrival B to manuscript M, commit
 *   DELETE M  → cascade takes A AND B
 *   enqueue [A]
 *   COMMIT     → B's row is gone, B's bytes are retained, nothing names them.
 *
 * That is *unreferenced but retained* — the state WS-DELETE-01 forbids — reached
 * through the very act that promises the opposite.
 *
 *   DATABASE_URL=postgres://... npx tsx scripts/witness/ws-delete-01-s4-concurrency-witness.ts
 *
 * WRITES TO THE DATABASE. It creates a disposable fixture member and removes
 * everything it made, including its queue rows. It never touches the file vault:
 * the refs are strings here, because the question is which refs the act
 * enqueues, not whether bytes unlink.
 */
import { Client } from 'pg';
import { randomUUID } from 'crypto';

const URL = process.env.DATABASE_URL;
if (!URL) {
  console.error('DATABASE_URL required');
  process.exit(2);
}

let failures = 0;
function check(name: string, ok: boolean, detail = '') {
  if (!ok) failures += 1;
  console.log(`${ok ? '  ok  ' : ' FAIL '} ${name}${detail ? `  — ${detail}` : ''}`);
}

/** The seam's own SQL, run through a raw client so two real transactions can interleave. */
async function relinquish(c: Client, manuscriptId: string, memberId: string) {
  const subject = await c.query(
    `SELECT id FROM member_manuscripts WHERE id = $1 AND member_id = $2 FOR UPDATE`,
    [manuscriptId, memberId],
  );
  if (subject.rows.length === 0) return { deleted: false, refs: [] as string[] };
  const arrivals = await c.query(
    `SELECT artifact_ref FROM manuscript_source_arrivals
      WHERE manuscript_id = $1 AND member_id = $2 AND artifact_ref IS NOT NULL`,
    [manuscriptId, memberId],
  );
  const refs: string[] = arrivals.rows.map((r: any) => r.artifact_ref);
  const removed = await c.query(
    `DELETE FROM member_manuscripts WHERE id = $1 AND member_id = $2 RETURNING id`,
    [manuscriptId, memberId],
  );
  if (removed.rows.length === 0) return { deleted: false, refs: [] as string[] };
  if (refs.length > 0) {
    await c.query(
      `INSERT INTO vault_erasure_queue (artifact_ref) SELECT unnest($1::text[])`,
      [refs],
    );
  }
  return { deleted: true, refs };
}

async function arrival(c: Client, memberId: string, manuscriptId: string | null, ref: string) {
  const id = randomUUID();
  await c.query(
    `INSERT INTO manuscript_source_arrivals
       (id, member_id, manuscript_id, source_kind, artifact_ref, artifact_hash,
        artifact_size, original_filename, mime_type, source_text, source_text_hash,
        extraction_method, extractor_version)
     VALUES ($1,$2,$3,'artifact_extraction',$4,$5,10,'x.docx','text/plain',$6,$7,'test','1')`,
    [id, memberId, manuscriptId, ref, 'h'.repeat(64), 'text', 's'.repeat(64)],
  );
  return id;
}

async function main() {
  const admin = new Client({ connectionString: URL });
  await admin.connect();

  const memberId = randomUUID();
  const memberId2 = randomUUID();
  const manuscriptId = randomUUID();
  const REF_A = `manuscript-sources/${randomUUID()}.docx`;
  const REF_B = `manuscript-sources/${randomUUID()}.docx`;

  await admin.query(
    `INSERT INTO members (id, passkey, username, password_hash, name)
     VALUES ($1,$2,$3,'x','NC19 fixture')`,
    [memberId, `NC19-${memberId}`, `nc19-${memberId}`],
  );
  await admin.query(
    `INSERT INTO member_manuscripts (id, member_id, title, source_custody)
     VALUES ($1,$2,'NC19','source_custodied')`,
    [manuscriptId, memberId],
  );
  await admin.query(
    `INSERT INTO members (id, passkey, username, password_hash, name)
     VALUES ($1,$2,$3,'x','NC19 fixture 2')`,
    [memberId2, `NC19b-${memberId2}`, `nc19b-${memberId2}`],
  );
  await arrival(admin, memberId, manuscriptId, REF_A);          // already claimed
  const arrivalB = await arrival(admin, memberId, null, REF_B); // unclaimed

  console.log('\nNC-19 — concurrent arrival claim against a live relinquishment\n');

  const eraser = new Client({ connectionString: URL });
  const claimer = new Client({ connectionString: URL });
  await eraser.connect();
  await claimer.connect();

  await eraser.query('BEGIN');
  /* Take the lock and the inventory, then hold the transaction open. */
  const subject = await eraser.query(
    `SELECT id FROM member_manuscripts WHERE id = $1 AND member_id = $2 FOR UPDATE`,
    [manuscriptId, memberId],
  );
  check('1  the lifecycle subject is locked before any inventory is taken', subject.rows.length === 1);

  const inventory = await eraser.query(
    `SELECT artifact_ref FROM manuscript_source_arrivals
      WHERE manuscript_id = $1 AND member_id = $2 AND artifact_ref IS NOT NULL`,
    [manuscriptId, memberId],
  );
  const captured: string[] = inventory.rows.map((r: any) => r.artifact_ref);
  check('2  inventory sees exactly the Source already attached', captured.length === 1 && captured[0] === REF_A);

  /* The concurrent claim, exactly as claimArrival() issues it. Its foreign key
     takes FOR KEY SHARE on the locked parent, so it must wait. */
  await claimer.query('BEGIN');
  const claim = claimer.query(
    `UPDATE manuscript_source_arrivals SET manuscript_id = $2
      WHERE id = $1 AND member_id = $3 AND manuscript_id IS NULL`,
    [arrivalB, manuscriptId, memberId],
  );
  let settledEarly = false;
  claim.then(() => { settledEarly = true; }, () => { settledEarly = true; });
  await new Promise((r) => setTimeout(r, 750));
  check('3  ⛔ THE RACE IS CLOSED — the claim cannot cross the locked boundary', settledEarly === false,
    settledEarly ? 'the claim completed while the inventory was open' : 'blocked, as required');

  /* Finish the act. The claim is still waiting on the parent row. */
  const removed = await eraser.query(
    `DELETE FROM member_manuscripts WHERE id = $1 AND member_id = $2 RETURNING id`,
    [manuscriptId, memberId],
  );
  check('4  positive transition evidence preserved', removed.rows.length === 1);
  await eraser.query(
    `INSERT INTO vault_erasure_queue (artifact_ref) SELECT unnest($1::text[])`,
    [captured],
  );
  await eraser.query('COMMIT');

  /* Two outcomes are both correct, and PostgreSQL gives the stronger one: the
     waiting UPDATE resumes to find its referenced parent gone and the foreign
     key REFUSES it (23503), rather than quietly matching zero rows. Either way
     the invitation to attach to an erased manuscript is not honoured. */
  const claimOutcome = await claim.then(
    (r: any) => ({ kind: 'rows' as const, n: r.rowCount as number }),
    (e: any) => ({ kind: 'error' as const, code: e?.code as string }),
  );
  await claimer.query('ROLLBACK').catch(() => undefined);

  check(
    '5  once erasure commits, the claim cannot attach to the erased manuscript',
    (claimOutcome.kind === 'rows' && claimOutcome.n === 0)
      || (claimOutcome.kind === 'error' && claimOutcome.code === '23503'),
    claimOutcome.kind === 'error'
      ? `foreign key refused it (${claimOutcome.code})`
      : `rowCount=${claimOutcome.n}`,
  );

  const survivingB = await admin.query(
    `SELECT manuscript_id, artifact_ref FROM manuscript_source_arrivals WHERE id = $1`,
    [arrivalB],
  );
  check('6  ⛔ NO ORPHANED SOURCE — B never became this manuscript’s and was never cascaded away',
    survivingB.rows.length === 1 && survivingB.rows[0].manuscript_id === null,
    JSON.stringify(survivingB.rows[0] ?? null));

  const queued = await admin.query(
    `SELECT artifact_ref FROM vault_erasure_queue WHERE artifact_ref = ANY($1::text[])`,
    [[REF_A, REF_B]],
  );
  const queuedRefs = queued.rows.map((r: any) => r.artifact_ref).sort();
  check('7  every Source actually relinquished is owed destruction', queuedRefs.includes(REF_A));
  check('8  and nothing else is', !queuedRefs.includes(REF_B), queuedRefs.join(','));

  const cascadedGone = await admin.query(
    `SELECT count(*)::int AS n FROM manuscript_source_arrivals WHERE artifact_ref = $1`,
    [REF_A],
  );
  check('9  the cascade took exactly the row whose ref was captured', cascadedGone.rows[0].n === 0);

  /* ─────────────────────────────────────────────────────────────────────────
   * THE DEFECT DEMONSTRATION.
   *
   * A falsifier that cannot show what it would catch is not yet a falsifier.
   * This repeats the same interleaving with the parent lock REMOVED — the code
   * exactly as it stood before this repair — and requires the race to occur.
   * If this half ever stops reproducing, the control above has stopped meaning
   * anything and the witness says so rather than reporting a quiet pass.
   * ───────────────────────────────────────────────────────────────────────── */
  console.log('\n  demonstration — the same act WITHOUT the parent lock\n');

  const m2 = randomUUID();
  const R_A = `manuscript-sources/${randomUUID()}.docx`;
  const R_B = `manuscript-sources/${randomUUID()}.docx`;
  await admin.query(
    `INSERT INTO member_manuscripts (id, member_id, title, source_custody)
     VALUES ($1,$2,'NC19-unlocked','source_custodied')`,
    [m2, memberId2],
  );
  await arrival(admin, memberId2, m2, R_A);
  const b2 = await arrival(admin, memberId2, null, R_B);

  const e2 = new Client({ connectionString: URL });
  const c2 = new Client({ connectionString: URL });
  await e2.connect();
  await c2.connect();

  await e2.query('BEGIN');
  const inv2 = await e2.query(
    `SELECT artifact_ref FROM manuscript_source_arrivals
      WHERE manuscript_id = $1 AND member_id = $2 AND artifact_ref IS NOT NULL`,
    [m2, memberId2],
  );
  const captured2: string[] = inv2.rows.map((r: any) => r.artifact_ref);

  /* No lock was taken, so this commits straight through the open inventory. */
  await c2.query('BEGIN');
  const claimed2 = await c2.query(
    `UPDATE manuscript_source_arrivals SET manuscript_id = $2
      WHERE id = $1 AND member_id = $3 AND manuscript_id IS NULL`,
    [b2, m2, memberId2],
  );
  await c2.query('COMMIT');
  check('D1 without the lock the claim crosses the open inventory', claimed2.rowCount === 1);

  const del2 = await e2.query(
    `DELETE FROM member_manuscripts WHERE id = $1 AND member_id = $2 RETURNING id`,
    [m2, memberId2],
  );
  await e2.query(
    `INSERT INTO vault_erasure_queue (artifact_ref) SELECT unnest($1::text[])`,
    [captured2],
  );
  await e2.query('COMMIT');
  check('D2 the erasure still reports a clean success', del2.rows.length === 1);

  const bGone = await admin.query(
    `SELECT count(*)::int AS n FROM manuscript_source_arrivals WHERE id = $1`,
    [b2],
  );
  const bOwed = await admin.query(
    `SELECT count(*)::int AS n FROM vault_erasure_queue WHERE artifact_ref = $1`,
    [R_B],
  );
  check('D3 ⛔ B’s custody row was cascaded away', bGone.rows[0].n === 0);
  check('D4 ⛔ …and its bytes are owed to NOBODY — unreferenced but retained',
    bOwed.rows[0].n === 0,
    'this is the state WS-DELETE-01 forbids, produced by the act that promises the opposite');

  await admin.query(`DELETE FROM vault_erasure_queue WHERE artifact_ref = ANY($1::text[])`, [[R_A, R_B]]);
  await admin.query(`DELETE FROM manuscript_source_arrivals WHERE member_id = $1`, [memberId2]);
  await admin.query(`DELETE FROM member_manuscripts WHERE member_id = $1`, [memberId2]);
  await e2.end();
  await c2.end();

  /* ── Cleanup ── */
  await admin.query(`DELETE FROM vault_erasure_queue WHERE artifact_ref = ANY($1::text[])`, [[REF_A, REF_B]]);
  await admin.query(`DELETE FROM manuscript_source_arrivals WHERE member_id = $1`, [memberId]);
  await admin.query(`DELETE FROM member_manuscripts WHERE member_id = $1`, [memberId]);
  await admin.query(`DELETE FROM members WHERE id = ANY($1::uuid[])`, [[memberId, memberId2]]);
  const left = await admin.query(`SELECT count(*)::int AS n FROM members WHERE id = $1`, [memberId]);
  check('10 fixture removed', left.rows[0].n === 0);

  await eraser.end();
  await claimer.end();
  await admin.end();

  console.log(`\nNC-19: ${failures === 0 ? 'ALL CONTROLS PASSED' : `${failures} FAILURE(S)`}\n`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
