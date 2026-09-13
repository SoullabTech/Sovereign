/**
 * BCS-01A · Step 6 — checkpoint resume, against REAL PostgreSQL.
 *
 * Proves that durably completed execution units survive loss of a worker claim,
 * WITHOUT any of them becoming coverage, an observation, or a finding.
 */

import { Pool, type PoolClient } from 'pg';
import { sha256 } from '../frozenSectionProvider';
import * as fs from 'fs';
import * as path from 'path';
import {
  createCommission, enqueueExecution, claimNextExecution, completeExecution,
  failExecution, recordCheckpointWithInputs, firstUnfinishedPartition, listPartitions,
  runFrozenSweepPartition, recoverExpiredClaims, loadExecution,
  type NewCommission, type ExecutionRow, type PartitionRow,
} from '../recurrenceSweepStore';

const MIGRATIONS = [
  '20260913000001_recurrence_sweep_execution.sql',
  '20260913000002_recurrence_sweep_claim_recovery.sql',
  '20260913000003_recurrence_sweep_checkpoints.sql',
  '20260913000004_recurrence_sweep_checkpoint_inputs.sql',
  '20260913000005_recurrence_sweep_observations.sql',
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

/**
 * STEP-7 RESTATEMENT: the bare checkpoint path is no longer exported, so this
 * witness drives the material-crossing runner with a fixture provider. The Step-6
 * claims are unchanged — only the seam they run through is.
 */
const PERMISSIVE = { currentMaxJurisdiction: () => 'sovereign' as const };
const fixtureProvider = {
  acquire: async (r: { sectionId: string; revisionNumber: number }) => {
    const text = `body of ${r.sectionId}`;
    return {
      text,
      sectionId: r.sectionId,
      revisionDigest: 'sha256:frozen-rev-7',
      state: {
        revisionNumber: r.revisionNumber,
        range: { start: 0, end: [...text].length },
        digest: sha256(text),
      },
    };
  },
};
const runUnit = (
  client: PoolClient,
  executionId: string,
  worker: string,
  attempt: number,
  process: (p: PartitionRow, text: string) => Promise<void>,
) =>
  runFrozenSweepPartition(
    client, executionId, worker, attempt, 'sovereign', PERMISSIVE, fixtureProvider, process,
  );

const ageHeartbeat = (id: string) =>
  pool.query(`UPDATE recurrence_sweep_executions SET heartbeat_at = NOW() - interval '10 minutes' WHERE id = $1`, [id]);

async function started(scope = COMMISSION): Promise<ExecutionRow> {
  const c = await createCommission(pool, scope);
  const e = await enqueueExecution(pool, c.id, 'member:m1');
  if (!e.ok) throw new Error(`fixture: ${e.refusal}`);
  return (await claimNextExecution(pool, 'worker-A'))!;
}

beforeAll(async () => { for (const m of MIGRATIONS) await pool.query(fs.readFileSync(m, 'utf8')); });
beforeEach(async () => { await pool.query('TRUNCATE recurrence_sweep_commissions CASCADE'); });
afterAll(async () => { await pool.end(); });

describe('partition plan is derived from the frozen commission, atomically', () => {
  it('scope s1·s2·s3 yields exactly ordinals 0,1,2 — no omission, addition or reorder', async () => {
    const e = await started();
    const parts = await listPartitions(pool, e.id);
    expect(parts.map((p) => [p.ordinal, p.section_id])).toEqual([[0, 's1'], [1, 's2'], [2, 's3']]);
  });

  it('a scope that cannot yield disjoint partitions REFUSES rather than deduplicating', async () => {
    const c = await createCommission(pool, { ...COMMISSION, bodyScopeSectionIds: ['s1', 's1', 's2'] });
    const r = await enqueueExecution(pool, c.id, 'member:m1');
    expect(r.ok).toBe(false);
    expect(!r.ok && r.refusal).toBe('scope_not_partitionable');

    // and the refusal is atomic — no execution survived it
    const n = await pool.query<{ n: string }>(`SELECT count(*)::text AS n FROM recurrence_sweep_executions`);
    expect(n.rows[0].n).toBe('0');
  });
});

describe('checkpoint follows successful computation, never precedes it', () => {
  it('a throwing processor leaves the unit unfinished', async () => {
    const e = await started();
    const client = await pool.connect();
    try {
      await expect(
        runUnit(client, e.id, 'worker-A', e.attempts, async () => {
          throw new Error('unit failed');
        }),
      ).rejects.toThrow('unit failed');
    } finally { client.release(); }

    const next = await firstUnfinishedPartition(pool, e.id);
    expect(next!.ordinal).toBe(0); // still the first unit
  });

  it('only the earliest unfinished partition may be checkpointed', async () => {
    const e = await started();
    const parts = await listPartitions(pool, e.id);
    const client = await pool.connect();
    try {
      const skip = await recordCheckpointWithInputs(client, e.id, parts[2].id, 'worker-A', e.attempts, { rangeStart: 0, rangeEnd: 1, frozenDigest: 'd-fixture' });
      expect(skip.ok).toBe(false);
      expect(!skip.ok && skip.refusal).toBe('partition_not_next');
    } finally { client.release(); }
  });
});

describe('THE RESUME WITNESS — checkpointed work survives, uncheckpointed work repeats', () => {
  it('s1 once, s2 twice, s3 once', async () => {
    const e = await started();
    const seen: string[] = [];
    const ok = async (p: PartitionRow) => { seen.push(p.section_id); };
    const boom = async (p: PartitionRow) => {
      seen.push(p.section_id);
      throw new Error('lost');
    };

    // attempt 1: s1 succeeds and checkpoints; s2 runs and throws before checkpoint
    let client = await pool.connect();
    try {
      await runUnit(client, e.id, 'worker-A', 1, ok);
      await expect(
        runUnit(client, e.id, 'worker-A', 1, boom),
      ).rejects.toThrow('lost');
    } finally { client.release(); }

    expect((await firstUnfinishedPartition(pool, e.id))!.section_id).toBe('s2');

    // the claim expires and is recovered
    await ageHeartbeat(e.id);
    expect(await recoverExpiredClaims(pool, '30 seconds')).toBe(1);
    expect((await loadExecution(pool, e.id))!.status).toBe('queued');

    // checkpoint 0 survived recovery
    expect((await firstUnfinishedPartition(pool, e.id))!.section_id).toBe('s2');

    // attempt 2 resumes at s2, not s1
    const again = (await claimNextExecution(pool, 'worker-B'))!;
    expect(again.attempts).toBe(2);
    client = await pool.connect();
    try {
      const r1 = await runUnit(client, e.id, 'worker-B', 2, ok);
      expect(r1.ok && r1.value.partition.section_id).toBe('s2');
      const r2 = await runUnit(client, e.id, 'worker-B', 2, ok);
      expect(r2.ok && r2.value.partition.section_id).toBe('s3');
    } finally { client.release(); }

    expect(seen).toEqual(['s1', 's2', 's2', 's3']); // the whole contract, in one array
    expect(await firstUnfinishedPartition(pool, e.id)).toBeNull();
  });
});

describe('checkpoint ownership inherits the Step-5 claim generation', () => {
  it('an obsolete attempt cannot checkpoint, even with the same worker string', async () => {
    const e = await started();
    await ageHeartbeat(e.id);
    await recoverExpiredClaims(pool, '30 seconds');
    const again = (await claimNextExecution(pool, 'worker-A'))!; // SAME worker string
    expect(again.attempts).toBe(2);

    const parts = await listPartitions(pool, e.id);
    const client = await pool.connect();
    try {
      const stale = await recordCheckpointWithInputs(client, e.id, parts[0].id, 'worker-A', 1, { rangeStart: 0, rangeEnd: 1, frozenDigest: 'd-fixture' });
      expect(stale.ok).toBe(false);
      expect(!stale.ok && stale.refusal).toBe('not_claim_owner');

      const current = await recordCheckpointWithInputs(client, e.id, parts[0].id, 'worker-A', 2, { rangeStart: 0, rangeEnd: 1, frozenDigest: 'd-fixture' });
      expect(current.ok).toBe(true);
    } finally { client.release(); }
  });

  it('a checkpoint is refused once the claim has been revoked', async () => {
    const e = await started();
    await ageHeartbeat(e.id);
    await recoverExpiredClaims(pool, '30 seconds'); // recovery wins the race

    const parts = await listPartitions(pool, e.id);
    const client = await pool.connect();
    try {
      const late = await recordCheckpointWithInputs(client, e.id, parts[0].id, 'worker-A', 1, { rangeStart: 0, rangeEnd: 1, frozenDigest: 'd-fixture' });
      expect(late.ok).toBe(false);
      expect(!late.ok && late.refusal).toBe('not_running');
    } finally { client.release(); }
  });

  it('a checkpoint committed BEFORE the claim expires survives it', async () => {
    const e = await started();
    const parts = await listPartitions(pool, e.id);
    const client = await pool.connect();
    try {
      expect((await recordCheckpointWithInputs(client, e.id, parts[0].id, 'worker-A', 1, { rangeStart: 0, rangeEnd: 1, frozenDigest: 'd-fixture' })).ok).toBe(true);
    } finally { client.release(); }

    await ageHeartbeat(e.id);
    await recoverExpiredClaims(pool, '30 seconds');
    expect((await firstUnfinishedPartition(pool, e.id))!.ordinal).toBe(1);
  });
});

describe('checkpoint progress is not lifecycle completion', () => {
  it('normal completion is REFUSED while any partition is unfinished', async () => {
    const e = await started();
    const parts = await listPartitions(pool, e.id);
    const client = await pool.connect();
    try {
      await recordCheckpointWithInputs(client, e.id, parts[0].id, 'worker-A', 1, { rangeStart: 0, rangeEnd: 1, frozenDigest: 'd-fixture' });
    } finally { client.release(); }

    const early = await completeExecution(pool, e.id, 'worker-A', 1);
    expect(early.ok).toBe(false);
    expect(!early.ok && early.refusal).toBe('incomplete_partitions');
  });

  it('checkpointing the LAST partition does not complete the execution', async () => {
    const e = await started();
    const parts = await listPartitions(pool, e.id);
    const client = await pool.connect();
    try {
      for (const p of parts) await recordCheckpointWithInputs(client, e.id, p.id, 'worker-A', 1, { rangeStart: 0, rangeEnd: 1, frozenDigest: 'd-fixture' });
    } finally { client.release(); }

    expect((await loadExecution(pool, e.id))!.status).toBe('running'); // progress ≠ terminus
    const done = await completeExecution(pool, e.id, 'worker-A', 1);
    expect(done.ok && done.value.status).toBe('completed');
  });

  it('fail is a non-normal terminal path and needs no checkpoints', async () => {
    const e = await started();
    const r = await failExecution(pool, e.id, 'worker-A', 1);
    expect(r.ok && r.value.status).toBe('failed');
  });
});

describe('a checkpoint is not coverage, and not an observation', () => {
  it('a fully checkpointed, completed execution has zero epistemic output', async () => {
    const e = await started();
    const parts = await listPartitions(pool, e.id);
    const client = await pool.connect();
    try {
      for (const p of parts) await recordCheckpointWithInputs(client, e.id, p.id, 'worker-A', 1, { rangeStart: 0, rangeEnd: 1, frozenDigest: 'd-fixture' });
    } finally { client.release(); }
    await completeExecution(pool, e.id, 'worker-A', 1);

    const { rows } = await pool.query<{ table_name: string }>(
      `SELECT table_name FROM information_schema.tables
        WHERE table_schema='public' AND table_name LIKE 'recurrence_sweep%'`,
    );
    // RESTATED AT STEP 10: the epistemic tables now exist, so the claim is asserted
    // where it is actually true — in the ROWS. This execution produced none.
    void rows;
    const epistemic = await pool.query<{ obs: string; ev: string }>(
      `SELECT (SELECT count(*) FROM recurrence_sweep_observations)::text AS obs,
              (SELECT count(*) FROM recurrence_sweep_observation_evidence)::text AS ev`);
    expect([epistemic.rows[0].obs, epistemic.rows[0].ev]).toEqual(['0', '0']);
    // no observation, no coverage, no lineage, no currency table exists at all
  });

  it('no code path derives DevelopmentalCoverage from checkpoint rows', async () => {
    /**
     * A COLUMN-ABSENCE ASSERTION CANNOT SEE THIS. The first version of this suite
     * had only schema assertions, and a mutation that added a coverage-deriving
     * FUNCTION passed every one of them. This is the instrument that was missing.
     *
     * Comments are stripped before scanning — the C21 lesson already recorded in
     * this repository: a file that documents its own compliance must not read as
     * the banned behaviour returning.
     */
    const src = fs.readFileSync(path.join(__dirname, '../recurrenceSweepStore.ts'), 'utf8');
    const code = src
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/(^|[^:])\/\/.*$/gm, '$1');

    expect(code).not.toMatch(/DevelopmentalCoverage/);
    expect(code).not.toMatch(/\bcoverage\b/i);

    // and nothing exported from the store is a coverage producer
    const store = require('../recurrenceSweepStore') as Record<string, unknown>;
    expect(Object.keys(store).filter((k) => /coverage/i.test(k))).toEqual([]);
  });

  it('checkpoint persistence carries nothing epistemic', async () => {
    const { rows } = await pool.query<{ table_name: string; column_name: string }>(
      `SELECT table_name, column_name FROM information_schema.columns
        WHERE table_name IN ('recurrence_sweep_checkpoints','recurrence_sweep_partitions')`,
    );
    const cols = rows.map((r) => r.column_name);
    for (const forbidden of [
      'coverage', 'occurrences', 'observation', 'output_data', 'result', 'lineage',
      'currency', 'stale', 'producer', 'progress', 'next_partition',
      'last_completed_partition', 'checkpoint_blob', 'model', 'confidence', 'body',
    ]) {
      expect(cols).not.toContain(forbidden);
    }
    expect(cols.sort()).toEqual(['completed_at', 'execution_id', 'id', 'ordinal', 'partition_id', 'section_id']);
  });
});
