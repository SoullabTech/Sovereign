/**
 * BCS-01A · Step 4 — minimum durable execution, against REAL PostgreSQL.
 *
 * Step 4 does not close on mocked stores. Every assertion below runs against a
 * disposable database with the lane's migration applied.
 */

import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import {
  createCommission,
  loadCommission,
  commissionIsUnconsumed,
  enqueueExecution,
  claimNextExecution,
  heartbeat,
  completeExecution,
  failExecution,
  recordCancelRequest,
  observeCancellation,
  loadExecution,
  type NewCommission,
} from '../recurrenceSweepStore';

const CONN = process.env.BCS_TEST_DATABASE_URL;
const MIGRATIONS = [
  '20260913000001_recurrence_sweep_execution.sql',
  '20260913000002_recurrence_sweep_claim_recovery.sql',
].map((f) => path.join(__dirname, '../../../database/migrations/', f));

const pool = new Pool({ connectionString: CONN });

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

beforeAll(async () => {
  for (const m of MIGRATIONS) await pool.query(fs.readFileSync(m, 'utf8'));
});

beforeEach(async () => {
  await pool.query('TRUNCATE recurrence_sweep_commissions CASCADE');
});

afterAll(async () => {
  await pool.end();
});

describe('A · commission is the authority root and is independently observable (P1, P2)', () => {
  it('writes and reads back the exact frozen identity, with no execution yet', async () => {
    const c = await createCommission(pool, COMMISSION);
    const back = await loadCommission(pool, c.id);

    expect(back).not.toBeNull();
    expect(back!.revision_number).toBe(7);
    expect(back!.revision_digest).toBe('sha256:frozen-rev-7');
    expect(back!.body_scope_section_ids).toEqual(['s1', 's2', 's3']);
    expect(back!.scope_fingerprint).toBe('fp-abc');
    expect(back!.max_jurisdiction).toBe('sovereign');

    expect(await commissionIsUnconsumed(pool, c.id)).toBe(true);
  });

  it('no `coverage` column exists on the commission — authorized ≠ read', async () => {
    const { rows } = await pool.query<{ column_name: string }>(
      `SELECT column_name FROM information_schema.columns
        WHERE table_name = 'recurrence_sweep_commissions'`,
    );
    const cols = rows.map((r) => r.column_name);
    expect(cols).toContain('body_scope_section_ids');
    expect(cols).not.toContain('coverage');
    expect(cols).not.toContain('consumed');
    expect(cols).not.toContain('current_protection');
    expect(cols).not.toContain('effective_permission');
  });
});

describe('B · one-shot authority is structural, not a flag', () => {
  it('the first execution is created and the second is refused truthfully', async () => {
    const c = await createCommission(pool, COMMISSION);

    const first = await enqueueExecution(pool, c.id, 'member:m1');
    expect(first.ok).toBe(true);

    const second = await enqueueExecution(pool, c.id, 'member:m1');
    expect(second.ok).toBe(false);
    expect(!second.ok && second.refusal).toBe('commission_already_executed');

    expect(await commissionIsUnconsumed(pool, c.id)).toBe(false);
  });

  it('consumption is the execution row existing — there is no mutable flag', async () => {
    const { rows } = await pool.query<{ column_name: string }>(
      `SELECT column_name FROM information_schema.columns
        WHERE table_name = 'recurrence_sweep_executions'`,
    );
    const cols = rows.map((r) => r.column_name);
    expect(cols).not.toContain('consumed');
    // nor any authority copy the execution could drift from its commission
    expect(cols).not.toContain('max_jurisdiction');
    expect(cols).not.toContain('body_scope_section_ids');
    expect(cols).not.toContain('authorization_basis');
    // nor any responsibility a later step has not earned
    for (const forbidden of [
      'coverage', 'checkpoint', 'progress', 'output_data', 'input_data',
      'lineage', 'currency', 'stale', 'producer', 'depends_on', 'priority', 'metadata',
    ]) {
      expect(cols).not.toContain(forbidden);
    }
  });
});

describe('C · claim — the database owns concurrency (P4)', () => {
  it('two concurrent workers: exactly one gets the execution', async () => {
    const c = await createCommission(pool, COMMISSION);
    await enqueueExecution(pool, c.id, 'member:m1');

    const a = await pool.connect();
    const b = await pool.connect();
    try {
      const [ra, rb] = await Promise.all([
        claimNextExecution(a, 'worker-A'),
        claimNextExecution(b, 'worker-B'),
      ]);
      const winners = [ra, rb].filter((r) => r !== null);
      expect(winners).toHaveLength(1);

      const row = await loadExecution(pool, winners[0]!.id);
      expect(row!.status).toBe('running');
      expect(row!.attempts).toBe(1);
      expect(['worker-A', 'worker-B']).toContain(row!.claimed_by);
      expect(row!.claimed_at).not.toBeNull();
      expect(row!.heartbeat_at).not.toBeNull();
      expect(row!.finished_at).toBeNull();
    } finally {
      a.release();
      b.release();
    }
  });

  it('a running execution is not claimable again', async () => {
    const c = await createCommission(pool, COMMISSION);
    await enqueueExecution(pool, c.id, 'member:m1');
    expect(await claimNextExecution(pool, 'worker-A')).not.toBeNull();
    expect(await claimNextExecution(pool, 'worker-B')).toBeNull();
  });
});

describe('D · heartbeat belongs to the current claimant', () => {
  it('the owning worker may refresh; a different worker may not; a terminal one may not', async () => {
    const c = await createCommission(pool, COMMISSION);
    await enqueueExecution(pool, c.id, 'member:m1');
    const claimed = (await claimNextExecution(pool, 'worker-A'))!;

    expect((await heartbeat(pool, claimed.id, 'worker-A', claimed.attempts)).ok).toBe(true);

    const foreign = await heartbeat(pool, claimed.id, 'worker-B', claimed.attempts);
    expect(foreign.ok).toBe(false);
    expect(!foreign.ok && foreign.refusal).toBe('not_claim_owner');

    await completeExecution(pool, claimed.id, 'worker-A', claimed.attempts);
    expect((await heartbeat(pool, claimed.id, 'worker-A', claimed.attempts)).ok).toBe(false);
  });
});

describe('E/F · terminal states', () => {
  it('completed sets finished_at and is no longer claimable', async () => {
    const c = await createCommission(pool, COMMISSION);
    await enqueueExecution(pool, c.id, 'member:m1');
    const claimed = (await claimNextExecution(pool, 'worker-A'))!;

    const done = await completeExecution(pool, claimed.id, 'worker-A', claimed.attempts);
    expect(done.ok && done.value.status).toBe('completed');
    expect(done.ok && done.value.finished_at).not.toBeNull();
    expect(await claimNextExecution(pool, 'worker-B')).toBeNull();
  });

  it('failed sets finished_at and is no longer claimable', async () => {
    const c = await createCommission(pool, COMMISSION);
    await enqueueExecution(pool, c.id, 'member:m1');
    const claimed = (await claimNextExecution(pool, 'worker-A'))!;

    const failed = await failExecution(pool, claimed.id, 'worker-A', claimed.attempts);
    expect(failed.ok && failed.value.status).toBe('failed');
    expect(failed.ok && failed.value.finished_at).not.toBeNull();
    expect(await claimNextExecution(pool, 'worker-B')).toBeNull();
  });

  it('a completed execution may finish with NO epistemic output — that is intentional', async () => {
    const c = await createCommission(pool, COMMISSION);
    await enqueueExecution(pool, c.id, 'member:m1');
    const claimed = (await claimNextExecution(pool, 'worker-A'))!;
    await completeExecution(pool, claimed.id, 'worker-A', claimed.attempts);

    const { rows } = await pool.query<{ table_name: string }>(
      `SELECT table_name FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name LIKE 'recurrence_sweep%'`,
    );
    // execution ≠ participation; completion ≠ finding
    expect(rows.map((r) => r.table_name).sort()).toEqual([
      'recurrence_sweep_cancel_requests',
      'recurrence_sweep_commissions',
      'recurrence_sweep_executions',
    ]);
  });
});

describe('G · cancellation — the durable interval (P7)', () => {
  it('the request is written and the execution is STILL running', async () => {
    const c = await createCommission(pool, COMMISSION);
    await enqueueExecution(pool, c.id, 'member:m1');
    const claimed = (await claimNextExecution(pool, 'worker-A'))!;

    const client = await pool.connect();
    try {
      const req = await recordCancelRequest(client, claimed.id, {
        requestedBy: 'member:m1',
        authority: 'member',
        reason: 'no longer wanted',
      });
      expect(req.ok).toBe(true);
    } finally {
      client.release();
    }

    const mid = await loadExecution(pool, claimed.id);
    expect(mid!.status).toBe('running'); // the interval, in persistence
    expect(mid!.finished_at).toBeNull();
  });

  it('only the claiming worker observing the request produces cancelled', async () => {
    const c = await createCommission(pool, COMMISSION);
    await enqueueExecution(pool, c.id, 'member:m1');
    const claimed = (await claimNextExecution(pool, 'worker-A'))!;

    const client = await pool.connect();
    try {
      await recordCancelRequest(client, claimed.id, { requestedBy: 'member:m1', authority: 'member' });

      const foreign = await observeCancellation(client, claimed.id, 'worker-B', claimed.attempts);
      expect(foreign.ok).toBe(false);
      expect(!foreign.ok && foreign.refusal).toBe('not_claim_owner');

      const done = await observeCancellation(client, claimed.id, 'worker-A', claimed.attempts);
      expect(done.ok && done.value.status).toBe('cancelled');
      expect(done.ok && done.value.finished_at).not.toBeNull();
    } finally {
      client.release();
    }
  });

  it('refuses to cancel without an actual request', async () => {
    const c = await createCommission(pool, COMMISSION);
    await enqueueExecution(pool, c.id, 'member:m1');
    const claimed = (await claimNextExecution(pool, 'worker-A'))!;

    const client = await pool.connect();
    try {
      const r = await observeCancellation(client, claimed.id, 'worker-A', claimed.attempts);
      expect(r.ok).toBe(false);
      expect(!r.ok && r.refusal).toBe('no_cancel_request');
    } finally {
      client.release();
    }
  });

  it('a completed execution refuses a later cancel request', async () => {
    const c = await createCommission(pool, COMMISSION);
    await enqueueExecution(pool, c.id, 'member:m1');
    const claimed = (await claimNextExecution(pool, 'worker-A'))!;
    await completeExecution(pool, claimed.id, 'worker-A', claimed.attempts);

    const client = await pool.connect();
    try {
      const late = await recordCancelRequest(client, claimed.id, {
        requestedBy: 'member:m1',
        authority: 'member',
      });
      expect(late.ok).toBe(false);
      expect(!late.ok && late.refusal).toBe('already_terminal');
    } finally {
      client.release();
    }
  });
});
