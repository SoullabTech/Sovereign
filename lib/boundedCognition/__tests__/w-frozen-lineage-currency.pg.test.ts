/**
 * BCS-01A · Step 7 — frozen input lineage + currency, against REAL PostgreSQL.
 * P8 · P9, plus the first real material crossing for P3 and the owed Step-4 M5 half.
 */

import { Pool, type PoolClient } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import {
  createCommission, enqueueExecution, claimNextExecution, listPartitions,
  loadExecution, recoverExpiredClaims, completeExecution,
  runFrozenSweepPartition, loadCheckpointLineage, measureCheckpointInputCurrency,
  type NewCommission, type ExecutionRow, type PartitionRow,
} from '../recurrenceSweepStore';
import { sha256, type FrozenSectionProvider, type FrozenSectionMaterial } from '../frozenSectionProvider';
import type { ExecutionJurisdiction, ProtectionProvider } from '../permission';

const MIGRATIONS = [
  '20260913000001_recurrence_sweep_execution.sql',
  '20260913000002_recurrence_sweep_claim_recovery.sql',
  '20260913000003_recurrence_sweep_checkpoints.sql',
  '20260913000004_recurrence_sweep_checkpoint_inputs.sql',
].map((f) => path.join(__dirname, '../../../database/migrations/', f));

const pool = new Pool({ connectionString: process.env.BCS_TEST_DATABASE_URL });

const REV = 7;
const REV_DIGEST = 'sha256:frozen-rev-7';
const COMMISSION: NewCommission = {
  memberId: '11111111-1111-1111-1111-111111111111',
  manuscriptId: '22222222-2222-2222-2222-222222222222',
  draftId: '33333333-3333-3333-3333-333333333333',
  revisionNumber: REV,
  revisionDigest: REV_DIGEST,
  bodyScopeSectionIds: ['s1', 's2', 's3'],
  scopeFingerprint: 'fp-abc',
  maxJurisdiction: 'external',
};

const TEXT: Record<string, string> = { s1: 'a recurring gesture — ⚑', s2: 'second', s3: 'third' };

/** Counts acquisitions so a refusal can assert the material was never acquired. */
function spyProvider(mutate?: (m: FrozenSectionMaterial) => FrozenSectionMaterial) {
  const calls: string[] = [];
  const provider: FrozenSectionProvider = {
    acquire: async ({ sectionId, revisionNumber }) => {
      calls.push(sectionId);
      const text = TEXT[sectionId] ?? 'x';
      const base: FrozenSectionMaterial = {
        text,
        sectionId,
        revisionDigest: REV_DIGEST,
        state: { revisionNumber, range: { start: 0, end: [...text].length }, digest: sha256(text) },
      };
      return mutate ? mutate(base) : base;
    },
  };
  return { provider, calls };
}

function mutableProtection(initial: ExecutionJurisdiction) {
  let current = initial;
  return {
    provider: { currentMaxJurisdiction: () => current } as ProtectionProvider,
    contractTo: (n: ExecutionJurisdiction) => { current = n; },
  };
}

const noop = async (_p: PartitionRow, _t: string) => {};

async function started(overrides: Partial<NewCommission> = {}): Promise<ExecutionRow> {
  const c = await createCommission(pool, { ...COMMISSION, ...overrides });
  const e = await enqueueExecution(pool, c.id, 'member:m1');
  if (!e.ok) throw new Error(e.refusal);
  return (await claimNextExecution(pool, 'worker-A'))!;
}

beforeAll(async () => { for (const m of MIGRATIONS) await pool.query(fs.readFileSync(m, 'utf8')); });
beforeEach(async () => { await pool.query('TRUNCATE recurrence_sweep_commissions CASCADE'); });
afterAll(async () => { await pool.end(); });

describe('A · exact frozen input is durably named', () => {
  it('reconstructs the typed relation with no duplicated identity and no prose', async () => {
    const e = await started();
    const { provider } = spyProvider();
    const p = mutableProtection('external');
    const client = await pool.connect();
    try {
      const r = await runFrozenSweepPartition(client, e.id, 'worker-A', 1, 'external', p.provider, provider, noop);
      expect(r.ok).toBe(true);
    } finally { client.release(); }

    const parts = await listPartitions(pool, e.id);
    const lineage = await loadCheckpointLineage(pool, parts[0].id);
    expect(lineage).toEqual({
      evidenceRef: { kind: 'section', sectionId: 's1' },
      manuscriptId: COMMISSION.manuscriptId,
      draftId: COMMISSION.draftId,
      revisionNumber: REV,
      revisionDigest: REV_DIGEST,
      range: { start: 0, end: [...TEXT.s1].length },   // code points, not UTF-16 units
      frozenDigest: sha256(TEXT.s1),
    });

    const cols = await pool.query<{ column_name: string }>(
      `SELECT column_name FROM information_schema.columns
        WHERE table_name = 'recurrence_sweep_checkpoint_inputs'`);
    expect(cols.rows.map((c) => c.column_name).sort())
      .toEqual(['frozen_digest', 'partition_id', 'range_end', 'range_start', 'recorded_at']);
  });
});

describe('B/C · integrity refusals leave nothing behind', () => {
  const cases: Array<[string, (m: FrozenSectionMaterial) => FrozenSectionMaterial, string]> = [
    ['digest disagrees with bytes', (m) => ({ ...m, state: { ...m.state, digest: 'sha256:lie' } }), 'digest_mismatch'],
    ['revision number disagrees', (m) => ({ ...m, state: { ...m.state, revisionNumber: 99 } }), 'revision_number_mismatch'],
    ['revision digest disagrees', (m) => ({ ...m, revisionDigest: 'sha256:other' }), 'revision_digest_mismatch'],
    ['a different section arrived', (m) => ({ ...m, sectionId: 'sX' }), 'section_mismatch'],
    ['range length disagrees', (m) => ({ ...m, state: { ...m.state, range: { start: 0, end: 999 } } }), 'range_length_mismatch'],
  ];

  it.each(cases)('%s → refused, no checkpoint, no lineage', async (_name, mutate, refusal) => {
    const e = await started();
    const { provider } = spyProvider(mutate);
    const p = mutableProtection('external');
    const client = await pool.connect();
    try {
      const r = await runFrozenSweepPartition(client, e.id, 'worker-A', 1, 'external', p.provider, provider, noop);
      expect(r.ok).toBe(false);
      expect(!r.ok && r.refusal).toBe(refusal);
    } finally { client.release(); }

    const cp = await pool.query<{ n: string }>(`SELECT count(*)::text AS n FROM recurrence_sweep_checkpoints`);
    const li = await pool.query<{ n: string }>(`SELECT count(*)::text AS n FROM recurrence_sweep_checkpoint_inputs`);
    expect([cp.rows[0].n, li.rows[0].n]).toEqual(['0', '0']);
  });

  it('a throwing processor writes neither checkpoint nor lineage', async () => {
    const e = await started();
    const { provider } = spyProvider();
    const p = mutableProtection('external');
    const client = await pool.connect();
    try {
      await expect(
        runFrozenSweepPartition(client, e.id, 'worker-A', 1, 'external', p.provider, provider,
          async () => { throw new Error('unit failed'); }),
      ).rejects.toThrow('unit failed');
    } finally { client.release(); }
    const cp = await pool.query<{ n: string }>(`SELECT count(*)::text AS n FROM recurrence_sweep_checkpoints`);
    expect(cp.rows[0].n).toBe('0');
  });
});

describe('D/E · permission is resolved BEFORE acquisition, from the commission', () => {
  it('current protection contracting mid-execution refuses the next acquisition', async () => {
    const e = await started();
    const { provider, calls } = spyProvider();
    const p = mutableProtection('external');
    const client = await pool.connect();
    try {
      const first = await runFrozenSweepPartition(client, e.id, 'worker-A', 1, 'external', p.provider, provider, noop);
      expect(first.ok).toBe(true);
      expect(calls).toEqual(['s1']);

      p.contractTo('sovereign'); // the member's protection contracts, same execution alive

      const second = await runFrozenSweepPartition(client, e.id, 'worker-A', 1, 'external', p.provider, provider, noop);
      expect(second.ok).toBe(false);
      expect(!second.ok && second.refusal).toBe('refused_by_current_protection');
      expect(calls).toEqual(['s1']); // ⭐ the material was NEVER acquired
    } finally { client.release(); }

    const cp = await pool.query<{ n: string }>(`SELECT count(*)::text AS n FROM recurrence_sweep_checkpoints`);
    expect(cp.rows[0].n).toBe('1');
  });

  it('a sovereign commission refuses an external request — provider not invoked', async () => {
    const e = await started({ maxJurisdiction: 'sovereign' });
    const { provider, calls } = spyProvider();
    const p = mutableProtection('external'); // current protection is permissive
    const client = await pool.connect();
    try {
      const r = await runFrozenSweepPartition(client, e.id, 'worker-A', 1, 'external', p.provider, provider, noop);
      expect(!r.ok && r.refusal).toBe('refused_by_frozen_ceiling');
      expect(calls).toEqual([]);
    } finally { client.release(); }
  });
});

describe('G · ABA — an obsolete claim cannot acquire Work', () => {
  it('old attempt refused, provider never invoked, later attempt permitted', async () => {
    const e = await started();
    await pool.query(
      `UPDATE recurrence_sweep_executions SET heartbeat_at = NOW() - interval '10 minutes' WHERE id = $1`, [e.id]);
    await recoverExpiredClaims(pool, '30 seconds');
    const again = (await claimNextExecution(pool, 'worker-A'))!; // SAME worker string
    expect(again.attempts).toBe(2);

    const { provider, calls } = spyProvider();
    const p = mutableProtection('external');
    const client = await pool.connect();
    try {
      const stale = await runFrozenSweepPartition(client, e.id, 'worker-A', 1, 'external', p.provider, provider, noop);
      expect(!stale.ok && stale.refusal).toBe('not_claim_owner');
      expect(calls).toEqual([]); // ⭐ fencing reaches material custody

      const current = await runFrozenSweepPartition(client, e.id, 'worker-A', 2, 'external', p.provider, provider, noop);
      expect(current.ok).toBe(true);
      expect(calls).toEqual(['s1']);
    } finally { client.release(); }
  });
});

describe('H/I/J/K · currency is derived, three-state, and inert', () => {
  async function withLineage() {
    const e = await started();
    const { provider } = spyProvider();
    const p = mutableProtection('external');
    const client = await pool.connect();
    try {
      await runFrozenSweepPartition(client, e.id, 'worker-A', 1, 'external', p.provider, provider, noop);
    } finally { client.release(); }
    const parts = await listPartitions(pool, e.id);
    return { execution: e, partitionId: parts[0].id };
  }

  it('H · UNCHANGED when the Work still matches the frozen digest', async () => {
    const { partitionId } = await withLineage();
    expect(await measureCheckpointInputCurrency(pool, partitionId, (s) => sha256(TEXT[s]))).toBe('unchanged');
  });

  it('I · CHANGED when it has moved', async () => {
    const { partitionId } = await withLineage();
    expect(await measureCheckpointInputCurrency(pool, partitionId, () => sha256('edited'))).toBe('changed');
  });

  it('J · UNMEASURED when it cannot be measured — never "current"', async () => {
    const { partitionId } = await withLineage();
    expect(await measureCheckpointInputCurrency(pool, partitionId, () => null)).toBe('unmeasured');
    expect(await measureCheckpointInputCurrency(pool, partitionId, () => { throw new Error('down'); }))
      .toBe('unmeasured');
  });

  it('K · measuring alters nothing — status, lineage, and execution count unchanged', async () => {
    const { execution, partitionId } = await withLineage();
    const before = await loadCheckpointLineage(pool, partitionId);

    for (const reader of [() => sha256('edited'), () => null, () => sha256(TEXT.s1)]) {
      await measureCheckpointInputCurrency(pool, partitionId, reader as () => string | null);
    }

    expect((await loadExecution(pool, execution.id))!.status).toBe('running');
    expect(await loadCheckpointLineage(pool, partitionId)).toEqual(before);
    const n = await pool.query<{ n: string }>(`SELECT count(*)::text AS n FROM recurrence_sweep_executions`);
    const c = await pool.query<{ n: string }>(`SELECT count(*)::text AS n FROM recurrence_sweep_commissions`);
    expect([n.rows[0].n, c.rows[0].n]).toEqual(['1', '1']);
  });

  it('a completed execution may legitimately see CHANGED — freeze is not corrupted', async () => {
    const { execution, partitionId } = await withLineage();
    const { provider } = spyProvider();
    const p = mutableProtection('external');
    const client = await pool.connect();
    try {
      await runFrozenSweepPartition(client, execution.id, 'worker-A', 1, 'external', p.provider, provider, noop);
      await runFrozenSweepPartition(client, execution.id, 'worker-A', 1, 'external', p.provider, provider, noop);
    } finally { client.release(); }
    await completeExecution(pool, execution.id, 'worker-A', 1);

    expect((await loadExecution(pool, execution.id))!.status).toBe('completed');
    expect(await measureCheckpointInputCurrency(pool, partitionId, () => sha256('member edited the live Work')))
      .toBe('changed');
    // the execution's subject is still the frozen revision it was commissioned for
    expect((await loadCheckpointLineage(pool, partitionId))!.revisionNumber).toBe(REV);
  });
});

describe('structural prohibitions — instrumented where the relation could appear', () => {
  const src = () => fs.readFileSync(path.join(__dirname, '../recurrenceSweepStore.ts'), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');

  it('no exported checkpoint-without-lineage path', async () => {
    const store = require('../recurrenceSweepStore') as Record<string, unknown>;
    const checkpointExports = Object.keys(store).filter((k) => /checkpoint/i.test(k) && typeof store[k] === 'function');
    expect(checkpointExports.sort()).toEqual([
      'firstUnfinishedPartition', 'loadCheckpointLineage', 'measureCheckpointInputCurrency',
      'recordCheckpointWithInputs',
    ].filter((n) => /checkpoint/i.test(n)).sort());
    expect(Object.keys(store)).not.toContain('recordCheckpoint');
    // and the only insert path writes both tables in one transaction
    const fn = src().slice(src().indexOf('export async function recordCheckpointWithInputs'));
    const body = fn.slice(0, fn.indexOf('\n}\n'));
    expect(body).toContain('recurrence_sweep_checkpoints');
    expect(body).toContain('recurrence_sweep_checkpoint_inputs');
  });

  it('no coverage producer, and no observation producer', async () => {
    const store = require('../recurrenceSweepStore') as Record<string, unknown>;
    expect(Object.keys(store).filter((k) => /coverage|observation/i.test(k))).toEqual([]);
    expect(src()).not.toMatch(/DevelopmentalCoverage/);
  });

  it('no causal vocabulary, and no currency/enqueue path', async () => {
    const code = src();
    expect(code).not.toMatch(/effectEstablished|causedBy|causal/i);
    const fn = code.slice(code.indexOf('export async function measureCheckpointInputCurrency'));
    expect(fn).not.toMatch(/INSERT|UPDATE|enqueue/i); // measuring writes nothing
  });

  it('the runner accepts no caller-authored frozen state', async () => {
    // API-SURFACE INSTRUMENT (R1: the relation, not the word). A caller that could
    // pass a digest, range or revision could name its own frozen subject.
    const fn = src().slice(src().indexOf('export async function runFrozenSweepPartition'));
    const signature = fn.slice(0, fn.indexOf('):'));
    expect(signature).not.toMatch(/digest|range|revision|frozenState/i);
    expect(signature).toMatch(/provider: FrozenSectionProvider/);
  });

  it('authority is read from the commission, never from an execution-side copy', async () => {
    const fn = src().slice(src().indexOf('export async function runFrozenSweepPartition'));
    const body = fn.slice(0, fn.indexOf('\n}\n'));
    expect(body).toMatch(/m\.max_jurisdiction/);        // from the commission
    expect(body).not.toMatch(/e\.max_jurisdiction/);    // never from the execution
  });

  it('no stored currency anywhere in the lane schema', async () => {
    const { rows } = await pool.query<{ column_name: string }>(
      `SELECT column_name FROM information_schema.columns WHERE table_name LIKE 'recurrence_sweep%'`);
    const cols = rows.map((r) => r.column_name);
    for (const forbidden of ['currency', 'stale', 'is_current', 'effect', 'influence', 'weight', 'read_at', 'body', 'prose', 'text']) {
      expect(cols).not.toContain(forbidden);
    }
  });
});
