#!/usr/bin/env tsx
/**
 * DISPATCH AUTHORITY — real-database integration proof.
 *
 * SELF-ADDRESSED-RETURN-01 Tier 1. Proves the seven cases the founder required
 * before worker registration (2026-09-04 review). These are the ugly ones: the
 * races and crashes where a member's own words could be duplicated, lost, or
 * "cancelled" in a way that did not actually cancel anything.
 *
 * Requires a real Postgres. Nothing here is mocked — a mocked concurrency test
 * asserts the mock.
 *
 *   DATABASE_URL=postgresql://... npx tsx scripts/verify-reminders-dispatch.ts
 */

import { query, closePool } from '../lib/db/postgres';
import {
  beginDispatch,
  cancelIfNotDispatching,
  claimDue,
  markDelivered,
  recordTerminalFailure,
  releaseDispatch,
} from '../lib/reminders/dispatch';
import { hashCancelToken } from '../lib/reminders/cancelToken';
import { RETRY_HORIZON_HOURS } from '../lib/reminders/types';

let passed = 0;
let failed = 0;

function ok(label: string, detail = '') {
  passed++;
  console.log(`  \x1b[32m✔\x1b[0m ${label}${detail ? `  \x1b[2m(${detail})\x1b[0m` : ''}`);
}
function bad(label: string, detail = '') {
  failed++;
  console.log(`  \x1b[31m✘\x1b[0m ${label}${detail ? `  \x1b[31m→ ${detail}\x1b[0m` : ''}`);
}
function expect(cond: boolean, label: string, detail = '') {
  cond ? ok(label) : bad(label, detail);
}

let memberId: string;

async function makeReminder(opts: {
  deliveryAt?: string;
  deadline?: string;
  firstAttemptAt?: string | null;
  text?: string;
} = {}): Promise<{ id: string; tokenHash: string }> {
  const tokenHash = hashCancelToken(`tok-${Math.random()}`);
  const res = await query<{ id: string }>(
    `INSERT INTO member_reminders
       (member_id, source_type, source_id, delivery_at, delivery_timezone,
        delivery_deadline, delivery_text, cancel_token_hash, first_attempt_at)
     VALUES ($1, 'member_note', NULL, $2, 'America/New_York', $3, $4, $5, $6)
     RETURNING id`,
    [
      memberId,
      opts.deliveryAt ?? new Date(Date.now() - 60_000).toISOString(),
      opts.deadline ?? new Date(Date.now() + 6 * 3600_000).toISOString(),
      opts.text ?? 'the words I approved',
      tokenHash,
      opts.firstAttemptAt ?? null,
    ],
  );
  return { id: res.rows[0].id, tokenHash };
}

async function row(id: string) {
  const r = await query<Record<string, unknown>>(
    `SELECT * FROM member_reminders WHERE id = $1`,
    [id],
  );
  return r.rows[0];
}

/**
 * Refuse to run destructively against anything but a disposable database.
 *
 * This script issues unqualified `DELETE FROM members`. Pointed at a real
 * environment it would empty that table — so the check is a precondition, not a
 * courtesy, and it runs BEFORE the first destructive statement.
 *
 * It reads `current_database()` over the live connection rather than parsing
 * DATABASE_URL, because the URL is not authoritative about where the client
 * actually lands: the database segment may be absent, PGDATABASE may override
 * it, and a service/connection alias can redirect it. The connection itself is
 * the only thing that knows.
 */
async function assertDisposableDatabase(): Promise<string> {
  const r = await query<{ db: string }>(`SELECT current_database() AS db`);
  const db = r.rows[0].db;
  if (!/(^|_)(test|integration)$/.test(db)) {
    console.error(
      `\x1b[31mREFUSING TO RUN\x1b[0m — this script issues unqualified DELETEs and the ` +
        `connected database is "${db}", which is not disposable.\n` +
        `Its name must end in _test or _integration. No statement has been executed.`
    );
    await closePool().catch(() => {});
    process.exit(2);
  }
  return db;
}

async function main() {
  const dbName = await assertDisposableDatabase();
  console.log(`\x1b[2mdatabase: ${dbName}\x1b[0m`);

  await query(`DELETE FROM member_reminders`);
  await query(`DELETE FROM members`);
  // members requires passkey/username/password_hash (NOT NULL, no defaults) in
  // the canonical migration chain — 20260103000001_members.sql, never relaxed by
  // any later migration. An email-only insert fails 23502 against any database
  // carrying the real schema, so the fixture supplies the full required tuple.
  const m = await query<{ id: string }>(
    `INSERT INTO members (email, passkey, username, password_hash)
     VALUES ('witness@example.test', 'SOULLAB-WITNESS-DISPATCH',
             'witness_dispatch', 'not-a-real-hash')
     RETURNING id`,
  );
  memberId = m.rows[0].id;

  console.log('\n\x1b[1mDISPATCH AUTHORITY — real-database proof\x1b[0m');
  console.log('\x1b[2mPENDING → CLAIMED → DISPATCHING → DELIVERED\x1b[0m\n');

  // ── 1. Two workers claim one due reminder → only one reaches dispatch ────
  console.log('\x1b[1m1. Two workers, one due reminder\x1b[0m');
  {
    const { id } = await makeReminder();
    // Concurrent claims, exactly as two worker processes would run them.
    const [a, b] = await Promise.all([claimDue(10), claimDue(10)]);
    const claimants = [...a, ...b].filter((r) => r.id === id);
    expect(claimants.length === 1, 'exactly one worker leases the reminder', `${claimants.length} claimed`);

    // Even if a second worker somehow held a stale token, dispatch is the
    // authority — only one transition can succeed.
    const winner = claimants[0];
    const [d1, d2] = await Promise.all([
      beginDispatch(id, winner.claim_token),
      beginDispatch(id, winner.claim_token),
    ]);
    const dispatched = [d1, d2].filter((d) => d.ok);
    expect(dispatched.length === 1, 'exactly one dispatch transition succeeds', `${dispatched.length} dispatched`);
    const r = await row(id);
    expect(r.delivery_attempts === 1, 'attempts incremented exactly once', `attempts=${r.delivery_attempts}`);
  }

  // ── 2. Crash before dispatch → lease expires, still cancellable ──────────
  console.log('\n\x1b[1m2. Worker crashes before dispatch\x1b[0m');
  {
    const { id } = await makeReminder();
    const [claimed] = (await claimDue(10)).filter((r) => r.id === id);
    expect(Boolean(claimed), 'reminder leased');

    // Worker dies here. Nothing releases the lease.
    let due = (await claimDue(10)).filter((r) => r.id === id);
    expect(due.length === 0, 'held lease blocks re-claim while valid', `${due.length} re-claimed`);

    // Cancellation still works during the lease — CLAIMED is internal only.
    const cancelDuringLease = await cancelIfNotDispatching({ id, memberId });
    expect(cancelDuringLease === 'cancelled', 'member can still cancel a merely-claimed reminder', cancelDuringLease);

    // A fresh one, to prove lease expiry restores claimability.
    const second = await makeReminder();
    await claimDue(10);
    await query(`UPDATE member_reminders SET claim_expires_at = now() - interval '1 minute' WHERE id = $1`, [second.id]);
    due = (await claimDue(10)).filter((r) => r.id === second.id);
    expect(due.length === 1, 'expired lease becomes claimable again', `${due.length} re-claimed`);
  }

  // ── 3. Crash after provider success, before delivered_at ────────────────
  console.log('\n\x1b[1m3. Crash after send, before delivered_at commits\x1b[0m');
  {
    const { id } = await makeReminder();
    const [claimed] = (await claimDue(10)).filter((r) => r.id === id);
    const first = await beginDispatch(id, claimed.claim_token);
    expect(first.ok, 'dispatch begins');
    // Provider accepted. Process dies before markDelivered.
    await releaseDispatch(id);
    const r1 = await row(id);
    expect(r1.first_attempt_at !== null, 'first_attempt_at survives the release', 'retry horizon must run from the FIRST attempt');
    expect(r1.delivered_at === null, 'not marked delivered');

    // Retry: within the horizon, so it proceeds — and the provider
    // idempotency key (self-addressed-return/<id>, stable and derived) is what
    // makes that safe. Exactly one email.
    const [again] = (await claimDue(10)).filter((r) => r.id === id);
    const second = await beginDispatch(id, again.claim_token);
    expect(second.ok, 'retry is permitted inside the horizon');
    const r2 = await row(id);
    expect(r2.delivery_attempts === 2, 'both attempts counted', `attempts=${r2.delivery_attempts}`);
  }

  // ── 4. Retry crosses the safety horizon → delivery_uncertain, no send ────
  console.log('\n\x1b[1m4. Retry beyond the idempotency window\x1b[0m');
  {
    const stale = new Date(Date.now() - (RETRY_HORIZON_HOURS + 1) * 3600_000).toISOString();
    const { id } = await makeReminder({
      deadline: new Date(Date.now() + 24 * 3600_000).toISOString(),
      firstAttemptAt: stale,
    });
    const [claimed] = (await claimDue(10)).filter((r) => r.id === id);
    const d = await beginDispatch(id, claimed.claim_token);
    expect(!d.ok && d.reason === 'retry_horizon', 'dispatch refused past the horizon', d.ok ? 'dispatched' : d.reason);
    await recordTerminalFailure(id, 'delivery_uncertain');
    const r = await row(id);
    expect(r.failure_code === 'delivery_uncertain', 'recorded as delivery_uncertain', String(r.failure_code));
    expect(r.delivered_at === null, 'never sent');
  }

  // ── 5. Member cancels while merely claimed → cancellation wins ───────────
  console.log('\n\x1b[1m5. Cancel races a claim\x1b[0m');
  {
    const { id } = await makeReminder();
    const [claimed] = (await claimDue(10)).filter((r) => r.id === id);
    const cancel = await cancelIfNotDispatching({ id, memberId });
    expect(cancel === 'cancelled', 'cancellation wins before dispatch', cancel);
    const d = await beginDispatch(id, claimed.claim_token);
    expect(!d.ok && d.reason === 'cancelled', 'worker cannot dispatch a cancelled reminder', d.ok ? 'DISPATCHED' : d.reason);
    const r = await row(id);
    expect(r.delivered_at === null && r.dispatch_started_at === null, 'no send occurred');
  }

  // ── 6. Member cancels after dispatch began → truthful too-late ───────────
  console.log('\n\x1b[1m6. Cancel arrives after dispatch began\x1b[0m');
  {
    const { id, tokenHash } = await makeReminder();
    const [claimed] = (await claimDue(10)).filter((r) => r.id === id);
    const d = await beginDispatch(id, claimed.claim_token);
    expect(d.ok, 'dispatch begins first');
    const cancel = await cancelIfNotDispatching({ id, memberId });
    expect(cancel === 'already_sending', 'cancellation reports already_sending, not success', cancel);
    const byToken = await cancelIfNotDispatching({ cancelTokenHash: tokenHash });
    expect(byToken === 'already_sending', 'the emailed token link is equally truthful', byToken);
    const r = await row(id);
    expect(r.cancelled_at === null, 'the row is not falsely marked cancelled');
  }

  // ── 7. Authored-time deadline expired → never delivered late ─────────────
  console.log('\n\x1b[1m7. Authored-time deadline passed\x1b[0m');
  {
    const { id } = await makeReminder({
      deliveryAt: new Date(Date.now() - 8 * 3600_000).toISOString(),
      deadline: new Date(Date.now() - 2 * 3600_000).toISOString(),
    });
    const [claimed] = (await claimDue(10)).filter((r) => r.id === id);
    const d = await beginDispatch(id, claimed.claim_token);
    expect(!d.ok && d.reason === 'expired', 'dispatch refused past the deadline', d.ok ? 'DISPATCHED' : d.reason);
    await recordTerminalFailure(id, 'expired');
    const r = await row(id);
    expect(r.delivered_at === null, 'a late message is never sent');
    expect(r.failure_code === 'expired', 'recorded as expired', String(r.failure_code));
  }

  // ── 8. Never sent before the member's chosen time ───────────────────────
  console.log('\n\x1b[1m8. A reminder is never sent before its chosen time\x1b[0m');
  {
    // Chosen time is an hour away. The floor is the member's instruction.
    const { id } = await makeReminder({
      deliveryAt: new Date(Date.now() + 3600_000).toISOString(),
      deadline: new Date(Date.now() + 7 * 3600_000).toISOString(),
    });
    const claimed = (await claimDue(50)).filter((r) => r.id === id);
    expect(claimed.length === 0, 'a future reminder is not claimable', `${claimed.length} claimed`);

    // Even a forged claim cannot dispatch: the linearization point re-asserts
    // delivery_at <= now(), so the guarantee does not rest on the claim query.
    await query(
      `UPDATE member_reminders
          SET claimed_at = now(), claim_token = gen_random_uuid(),
              claim_expires_at = now() + interval '5 minutes'
        WHERE id = $1`,
      [id],
    );
    const forged = await query<{ claim_token: string }>(
      `SELECT claim_token FROM member_reminders WHERE id = $1`,
      [id],
    );
    const d = await beginDispatch(id, forged.rows[0].claim_token);
    expect(
      !d.ok && d.reason === 'not_yet_due',
      'dispatch refuses before the chosen time even with a valid claim',
      d.ok ? 'DISPATCHED EARLY' : d.reason,
    );
    const r = await row(id);
    expect(r.delivered_at === null && r.dispatch_started_at === null, 'nothing was sent early');
  }

  // ── 9. The authored timezone is retained verbatim ───────────────────────
  console.log('\n\x1b[1m9. Authored timezone survives\x1b[0m');
  {
    const { id } = await makeReminder();
    const r = await row(id);
    expect(
      r.delivery_timezone === 'America/New_York',
      'the zone the member authored in is stored, not normalised to UTC',
      String(r.delivery_timezone),
    );
  }

  // ── Invariant sweep ─────────────────────────────────────────────────────
  console.log('\n\x1b[1mInvariants across every row touched\x1b[0m');
  {
    const bad1 = await query(`SELECT id FROM member_reminders WHERE cancelled_at IS NOT NULL AND dispatch_started_at IS NOT NULL`);
    expect(bad1.rows.length === 0, 'no row is both cancelled and dispatched', `${bad1.rows.length} rows`);
    const bad2 = await query(`SELECT id FROM member_reminders WHERE delivered_at IS NOT NULL AND dispatch_started_at IS NULL`);
    expect(bad2.rows.length === 0, 'no delivery without a dispatch', `${bad2.rows.length} rows`);
    const cols = await query<{ column_name: string }>(
      `SELECT column_name FROM information_schema.columns WHERE table_name = 'member_reminders'`,
    );
    const forbidden = cols.rows
      .map((c) => c.column_name)
      .filter((c) => /last_seen|last_active|days_|engagement|opened|clicked|visited|returned|conversion/i.test(c));
    expect(forbidden.length === 0, 'the live table carries no absence or engagement column', forbidden.join(', '));
  }

  console.log(`\n${'─'.repeat(60)}`);
  console.log(`\x1b[1m${passed} passed · ${failed} failed\x1b[0m`);
  if (failed > 0) {
    console.log('\n❌ The dispatch contract is not currently true in code.');
    process.exit(1);
  }
  console.log('\n✅ Dispatch authority holds under concurrency, crash, cancellation and expiry.');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => closePool());
