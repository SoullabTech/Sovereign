/**
 * BCS-01A · Step 5 — expired-claim recovery, against REAL PostgreSQL.
 *
 * A missed heartbeat does not establish that a process crashed. It establishes
 * only that the durable store no longer recognizes the claim as live enough to
 * retain ownership. Nothing here asserts anything about an OS process.
 */

import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import {
  listPartitions,
  recordCheckpointWithInputs,
  createCommission,
  enqueueExecution,
  claimNextExecution,
  heartbeat,
  completeExecution,
  recordCancelRequest,
  observeCancellation,
  loadExecution,
  recoverExpiredClaims,
  type NewCommission,
  type ExecutionRow,
} from '../recurrenceSweepStore';

const MIGRATIONS = [
  '20260913000001_recurrence_sweep_execution.sql',
  '20260913000002_recurrence_sweep_claim_recovery.sql',
  '20260913000003_recurrence_sweep_checkpoints.sql',
  '20260913000004_recurrence_sweep_checkpoint_inputs.sql',
].map((f) => path.join(__dirname, '../../../database/migrations/', f));

const pool = new Pool({ connectionString: process.env.BCS_TEST_DATABASE_URL });

const COMMISSION: NewCommission = {
  memberId: '11111111-1111-1111-1111-111111111111',
  manuscriptId: '22222222-2222-2222-2222-222222222222',
  draftId: '33333333-3333-3333-3333-333333333333',
  revisionNumber: 7,
  revisionDigest: 'sha256:frozen-rev-7',
  bodyScopeSectionIds: ['s1', 's2', 's3'],
  scopeFingerprint: 'fp-abc',
  maxJurisdiction: 'sovereign',
};

/** Step-6 refinement: normal completion requires every partition checkpointed. */
async function checkpointAll(executionId: string, worker: string, attempt: number) {
  const client = await pool.connect();
  try {
    for (const p of await listPartitions(pool, executionId)) {
      const r = await recordCheckpointWithInputs(client, executionId, p.id, worker, attempt, { rangeStart: 0, rangeEnd: 1, frozenDigest: 'd-fixture' });
      if (!r.ok) throw new Error(`fixture checkpoint: ${r.refusal}`);
    }
  } finally {
    client.release();
  }
}

/** Backdate the liveness signal. Nothing about the worker process changes. */
const ageHeartbeat = (id: string, ago: string) =>
  pool.query(
    `UPDATE recurrence_sweep_executions SET heartbeat_at = NOW() - $2::interval WHERE id = $1`,
    [id, ago],
  );

async function claimed(worker = 'worker-A', maxAttempts = 3): Promise<ExecutionRow> {
  const c = await createCommission(pool, COMMISSION);
  await enqueueExecution(pool, c.id, 'member:m1', maxAttempts);
  return (await claimNextExecution(pool, worker))!;
}

beforeAll(async () => {
  for (const m of MIGRATIONS) await pool.query(fs.readFileSync(m, 'utf8'));
});
beforeEach(async () => {
  await pool.query('TRUNCATE recurrence_sweep_commissions CASCADE');
});
afterAll(async () => {
  await pool.end();
});

describe('A · a healthy claim is never recovered', () => {
  it('a fresh heartbeat keeps the execution running, same claimant, same attempt', async () => {
    const e = await claimed();
    const recovered = await recoverExpiredClaims(pool, '30 seconds');

    expect(recovered).toBe(0); // a reaper that requeues everything cannot pass
    const row = (await loadExecution(pool, e.id))!;
    expect(row.status).toBe('running');
    expect(row.claimed_by).toBe('worker-A');
    expect(row.attempts).toBe(1);
  });
});

describe('B · an expired recoverable claim is revoked, not refunded', () => {
  it('running → queued · attempts unchanged · claim fields cleared · queued_at unchanged', async () => {
    const e = await claimed();
    const queuedAtBefore = (await loadExecution(pool, e.id))!.queued_at;
    await ageHeartbeat(e.id, '10 minutes');

    expect(await recoverExpiredClaims(pool, '30 seconds')).toBe(1);

    const row = (await loadExecution(pool, e.id))!;
    expect(row.status).toBe('queued');
    expect(row.attempts).toBe(1); // the expired claim happened; it stays counted
    expect(row.claimed_by).toBeNull();
    expect(row.claimed_at).toBeNull();
    expect(row.heartbeat_at).toBeNull();
    expect(row.finished_at).toBeNull();
    expect(row.queued_at.getTime()).toBe(queuedAtBefore.getTime()); // not restamped
  });
});

describe('C · the same execution becomes claimable again', () => {
  it('attempt N → N+1 on the new claim, with a new claim time', async () => {
    const e = await claimed();
    await ageHeartbeat(e.id, '10 minutes');
    await recoverExpiredClaims(pool, '30 seconds');

    const again = (await claimNextExecution(pool, 'worker-B'))!;
    expect(again.id).toBe(e.id); // the SAME execution, not a new one
    expect(again.attempts).toBe(2);
    expect(again.claimed_by).toBe('worker-B');
    expect(again.claimed_at).not.toBeNull();
  });
});

describe('D · ABA — an obsolete claim identity cannot mutate a later incarnation', () => {
  it('same worker string, later attempt: the old claim is refused, the new one permitted', async () => {
    const first = await claimed('worker-A');
    expect(first.attempts).toBe(1);

    await ageHeartbeat(first.id, '10 minutes');
    await recoverExpiredClaims(pool, '30 seconds');

    const second = (await claimNextExecution(pool, 'worker-A'))!; // SAME worker string
    expect(second.attempts).toBe(2);

    const stale = await completeExecution(pool, first.id, 'worker-A', 1);
    expect(stale.ok).toBe(false); // worker name equality is not enough

    const staleBeat = await heartbeat(pool, first.id, 'worker-A', 1);
    expect(staleBeat.ok).toBe(false);

    await checkpointAll(first.id, 'worker-A', 2);
    const current = await completeExecution(pool, first.id, 'worker-A', 2);
    expect(current.ok).toBe(true);
    expect(current.ok && current.value.status).toBe('completed');
  });
});

describe('E · an expired final attempt is failed, not requeued', () => {
  it('running → failed · finished_at set · claim fields cleared', async () => {
    const e = await claimed('worker-A', 1); // budget of one
    expect(e.attempts).toBe(1);
    await ageHeartbeat(e.id, '10 minutes');

    expect(await recoverExpiredClaims(pool, '30 seconds')).toBe(1);

    const row = (await loadExecution(pool, e.id))!;
    expect(row.status).toBe('failed');
    expect(row.finished_at).not.toBeNull();
    expect(row.claimed_by).toBeNull();
    expect(row.heartbeat_at).toBeNull();
    expect(await claimNextExecution(pool, 'worker-B')).toBeNull();
  });
});

describe('F/G · a cancellation request survives recovery and is never promoted', () => {
  it('requeue preserves the request and does NOT produce cancelled', async () => {
    const e = await claimed();
    const client = await pool.connect();
    try {
      await recordCancelRequest(client, e.id, { requestedBy: 'member:m1', authority: 'member' });
    } finally {
      client.release();
    }

    await ageHeartbeat(e.id, '10 minutes');
    await recoverExpiredClaims(pool, '30 seconds');

    const row = (await loadExecution(pool, e.id))!;
    expect(row.status).toBe('queued'); // NOT cancelled — the reaper saw nothing to act on
    const req = await pool.query(
      `SELECT 1 FROM recurrence_sweep_cancel_requests WHERE execution_id = $1`,
      [e.id],
    );
    expect(req.rowCount).toBe(1); // the act survives as evidence
  });

  it('the next claimant may observe the preserved request and truthfully cancel', async () => {
    const e = await claimed();
    const c1 = await pool.connect();
    try {
      await recordCancelRequest(c1, e.id, { requestedBy: 'member:m1', authority: 'member' });
    } finally {
      c1.release();
    }
    await ageHeartbeat(e.id, '10 minutes');
    await recoverExpiredClaims(pool, '30 seconds');

    const next = (await claimNextExecution(pool, 'worker-B'))!;
    const c2 = await pool.connect();
    try {
      const done = await observeCancellation(c2, next.id, 'worker-B', next.attempts);
      expect(done.ok && done.value.status).toBe('cancelled');
      expect(done.ok && done.value.claimed_by).toBeNull();
    } finally {
      c2.release();
    }
  });

  it('an exhausted budget with a pending request terminates as failed, not cancelled', async () => {
    const e = await claimed('worker-A', 1);
    const client = await pool.connect();
    try {
      await recordCancelRequest(client, e.id, { requestedBy: 'member:m1', authority: 'member' });
    } finally {
      client.release();
    }
    await ageHeartbeat(e.id, '10 minutes');
    await recoverExpiredClaims(pool, '30 seconds');

    // No execution path observed the request and terminated because of it.
    expect((await loadExecution(pool, e.id))!.status).toBe('failed');
  });
});

describe('H · concurrent recovery affects an expired claim exactly once', () => {
  it('two reapers, one revocation', async () => {
    const e = await claimed();
    await ageHeartbeat(e.id, '10 minutes');

    const a = await pool.connect();
    const b = await pool.connect();
    try {
      const [ra, rb] = await Promise.all([
        recoverExpiredClaims(a, '30 seconds'),
        recoverExpiredClaims(b, '30 seconds'),
      ]);
      expect(ra + rb).toBe(1);
    } finally {
      a.release();
      b.release();
    }
    expect((await loadExecution(pool, e.id))!.attempts).toBe(1);
  });
});

describe('I/J · recovery touches nothing it should not', () => {
  it('terminal executions are never recovered', async () => {
    const e = await claimed();
    await checkpointAll(e.id, 'worker-A', e.attempts);
    await completeExecution(pool, e.id, 'worker-A', e.attempts);
    await pool.query(
      `UPDATE recurrence_sweep_executions SET finished_at = NOW() - interval '1 day' WHERE id = $1`,
      [e.id],
    );
    expect(await recoverExpiredClaims(pool, '30 seconds')).toBe(0);
    expect((await loadExecution(pool, e.id))!.status).toBe('completed');
  });

  it('creates no new execution row and no new commission', async () => {
    const e = await claimed();
    await ageHeartbeat(e.id, '10 minutes');
    await recoverExpiredClaims(pool, '30 seconds');

    const ex = await pool.query<{ n: string }>(
      `SELECT count(*)::text AS n FROM recurrence_sweep_executions`,
    );
    const co = await pool.query<{ n: string }>(
      `SELECT count(*)::text AS n FROM recurrence_sweep_commissions`,
    );
    expect(ex.rows[0].n).toBe('1');
    expect(co.rows[0].n).toBe('1');
  });

  it('refuses a non-positive expiry interval', async () => {
    await expect(recoverExpiredClaims(pool, '0 seconds')).rejects.toThrow(/positive/);
  });
});

describe('K · the lifecycle invariant is enforced by the database', () => {
  it('a terminal row may not retain current-claim fields', async () => {
    const e = await claimed();
    await checkpointAll(e.id, 'worker-A', e.attempts);
    await completeExecution(pool, e.id, 'worker-A', e.attempts);
    await expect(
      pool.query(`UPDATE recurrence_sweep_executions SET claimed_by = 'ghost' WHERE id = $1`, [e.id]),
    ).rejects.toThrow(/claim_fields_match_status/);
  });

  it('a queued row may not sit at its attempt ceiling — `queued` would be false', async () => {
    const e = await claimed('worker-A', 1);
    await ageHeartbeat(e.id, '10 minutes');
    await recoverExpiredClaims(pool, '30 seconds'); // → failed, correctly
    await expect(
      pool.query(
        `UPDATE recurrence_sweep_executions
            SET status='queued', finished_at=NULL, claimed_by=NULL, claimed_at=NULL, heartbeat_at=NULL
          WHERE id = $1`,
        [e.id],
      ),
    ).rejects.toThrow(/queued_is_claimable/);
  });
});
