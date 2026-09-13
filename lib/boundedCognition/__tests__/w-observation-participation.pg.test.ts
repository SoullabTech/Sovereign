/**
 * BCS-01A · Step 10 — P11 (material classification) and P12 (CMT boundary).
 *
 * P12's geometry is the point: a lawful neighbour SUCCEEDS while the prohibited
 * subject FAILS. "Everything refuses" would not be evidence.
 */

import { Pool, type PoolClient } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import {
  createCommission, enqueueExecution, claimNextExecution, listPartitions,
  runFrozenSweepPartition, type NewCommission, type ExecutionRow, type PartitionRow,
} from '../recurrenceSweepStore';
import {
  recordRecurrenceObservation, buildRecurrenceClaimCoverage, classifyObservationMaterial,
  type EvidentiaryUse,
} from '../recurrenceObservation';
import { sha256, type FrozenSectionMaterial } from '../frozenSectionProvider';
import { adjudicateParticipation } from '../../maia/canonical-turn/adjudicate';
import { PRODUCER_REGISTRY } from '../../maia/canonical-turn/producerRegistry';
import { ROOM_POLICIES } from '../../maia/canonical-turn/policy';
import { CanonicalTurnRefused, type CandidateBlock } from '../../maia/canonical-turn/types';

const MIGRATIONS = [
  '20260913000001_recurrence_sweep_execution.sql',
  '20260913000002_recurrence_sweep_claim_recovery.sql',
  '20260913000003_recurrence_sweep_checkpoints.sql',
  '20260913000004_recurrence_sweep_checkpoint_inputs.sql',
  '20260913000005_recurrence_sweep_observations.sql',
].map((f) => path.join(__dirname, '../../../database/migrations/', f));

const pool = new Pool({ connectionString: process.env.BCS_TEST_DATABASE_URL });

const REV = 7, REV_DIGEST = 'sha256:frozen-rev-7';
const SCOPE = ['s1', 's2', 's3'];
const COMMISSION: NewCommission = {
  memberId: '11111111-1111-1111-1111-111111111111',
  manuscriptId: '22222222-2222-2222-2222-222222222222',
  draftId: '33333333-3333-3333-3333-333333333333',
  revisionNumber: REV, revisionDigest: REV_DIGEST,
  bodyScopeSectionIds: SCOPE, scopeFingerprint: 'fp', maxJurisdiction: 'sovereign',
};
const TEXT: Record<string, string> = { s1: 'the gesture', s2: 'middle', s3: 'the gesture again' };

const PERMISSIVE = { currentMaxJurisdiction: () => 'sovereign' as const };
const provider = {
  acquire: async ({ sectionId, revisionNumber }: { sectionId: string; revisionNumber: number }): Promise<FrozenSectionMaterial> => {
    const text = TEXT[sectionId] ?? 'x';
    return { text, sectionId, revisionDigest: REV_DIGEST,
      state: { revisionNumber, range: { start: 0, end: [...text].length }, digest: sha256(text) } };
  },
};
const noop = async (_p: PartitionRow, _t: string) => {};

/** An execution whose three partitions all carry frozen lineage. */
async function executed(scope = SCOPE): Promise<{ e: ExecutionRow; parts: PartitionRow[] }> {
  const c = await createCommission(pool, { ...COMMISSION, bodyScopeSectionIds: scope });
  const r = await enqueueExecution(pool, c.id, 'member:m1');
  if (!r.ok) throw new Error(r.refusal);
  const e = (await claimNextExecution(pool, 'worker-A'))!;
  const client = await pool.connect();
  try {
    for (let i = 0; i < scope.length; i++) {
      await runFrozenSweepPartition(client, e.id, 'worker-A', 1, 'sovereign', PERMISSIVE, provider, noop);
    }
  } finally { client.release(); }
  return { e, parts: await listPartitions(pool, e.id) };
}

const uses = (parts: PartitionRow[], occurringSections: string[]): EvidentiaryUse[] =>
  parts.map((p) => ({ partitionId: p.id, sectionId: p.section_id, occurrence: occurringSections.includes(p.section_id) }));

const counts = async () => {
  const o = await pool.query<{ n: string }>(`SELECT count(*)::text AS n FROM recurrence_sweep_observations`);
  const ev = await pool.query<{ n: string }>(`SELECT count(*)::text AS n FROM recurrence_sweep_observation_evidence`);
  return [o.rows[0].n, ev.rows[0].n];
};

beforeAll(async () => { for (const m of MIGRATIONS) await pool.query(fs.readFileSync(m, 'utf8')); });
beforeEach(async () => { await pool.query('TRUNCATE recurrence_sweep_commissions CASCADE'); });
afterAll(async () => { await pool.end(); });

describe('P11 · a durable observation exists only through claim-scoped evidence + Step-3 admission', () => {
  it('POSITIVE — coverage s1·s2·s3, occurrences s1·s3 → one observation, three evidence rows', async () => {
    const { e, parts } = await executed();
    const client = await pool.connect();
    try {
      const r = await recordRecurrenceObservation(client, e.id, 'the gesture recurs', 'coverage', uses(parts, ['s1', 's3']));
      expect(r.ok).toBe(true);
      if (!r.ok) return;
      expect(classifyObservationMaterial(r.observation)).toBe('recurrence_observation');
    } finally { client.release(); }

    expect(await counts()).toEqual(['1', '3']);
    const occ = await pool.query<{ n: string }>(
      `SELECT count(*)::text AS n FROM recurrence_sweep_observation_evidence WHERE occurrence`);
    expect(occ.rows[0].n).toBe('2');
  });

  it('F-J2.3 · classification is invariant to machinery, and cannot see it', async () => {
    /**
     * ⚠️ ADDED AFTER F11-A AND F12-B STAYED GREEN. The first witness only called the
     * classifier one way and compared it to a literal, so a mutant that added a
     * machinery parameter — or renamed the material in lockstep — passed. R2 says the
     * repair belongs to the instrument, not the mutation.
     */
    const material = { materialKind: 'recurrence_observation' } as const;

    // two construction paths, different irrelevant machinery metadata OUTSIDE the value
    const viaWorkerA = { ...material, __producedBy: 'worker-A', __queue: 'q1' } as never;
    const viaWorkerB = { ...material, __producedBy: 'worker-B', __queue: 'q2' } as never;
    expect(classifyObservationMaterial(viaWorkerA)).toBe(classifyObservationMaterial(viaWorkerB));

    // the identity must not NAME machinery — the relation, not a hardcoded string a
    // mutant can move in lockstep
    const kind = classifyObservationMaterial(material);
    expect(kind).not.toMatch(/job|sweep|worker|model|queue|execution|result|output/i);
    expect(kind).toBe('recurrence_observation');

    // structural: the classifier has no parameter through which machinery could arrive
    const src = fs.readFileSync(path.join(__dirname, '../recurrenceObservation.ts'), 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
    const fn = src.slice(src.indexOf('export function classifyObservationMaterial'));
    const sig = fn.slice(0, fn.indexOf('):'));
    expect(sig).not.toMatch(/worker|job|queue|model|execution|mechanism/i);
    expect(sig.split(',').filter((p) => p.includes(':')).length).toBe(1);
  });

  it('the observation carries no machinery column at all', async () => {
    const { rows } = await pool.query<{ column_name: string }>(
      `SELECT column_name FROM information_schema.columns WHERE table_name='recurrence_sweep_observations'`);
    expect(rows.map((r) => r.column_name).sort())
      .toEqual(['claim_extent', 'claim_text', 'created_at', 'execution_id', 'id']);
  });

  it('REFUSAL · partial coverage — claim outruns what this claim covers', async () => {
    const { e, parts } = await executed();
    const client = await pool.connect();
    try {
      const two = uses(parts, ['s1', 's2']).slice(0, 2);
      const r = await recordRecurrenceObservation(client, e.id, 'x', 'commissioned_scope', two);
      expect(!r.ok && 'verdict' in r && r.verdict).toBe('PARTIAL_COVERAGE');
    } finally { client.release(); }
    expect(await counts()).toEqual(['0', '0']);
  });

  it('REFUSAL · uniformity — 2/2 covered units is REGULARITY (the two-unit ruling, through the real output path)', async () => {
    const { e, parts } = await executed();
    const client = await pool.connect();
    try {
      const two = uses(parts, ['s1', 's2']).slice(0, 2);
      const r = await recordRecurrenceObservation(client, e.id, 'x', 'coverage', two);
      expect(!r.ok && 'verdict' in r && r.verdict).toBe('REGULARITY');
    } finally { client.release(); }
    expect(await counts()).toEqual(['0', '0']);
  });

  it('REFUSAL · insufficient separation — one covered unit', async () => {
    const { e, parts } = await executed();
    const client = await pool.connect();
    try {
      const r = await recordRecurrenceObservation(client, e.id, 'x', 'coverage', [uses(parts, ['s1'])[0]]);
      expect(!r.ok && 'verdict' in r && r.verdict).toBe('INSUFFICIENT_SEPARATION');
    } finally { client.release(); }
    expect(await counts()).toEqual(['0', '0']);
  });

  it('REFUSAL · evidence not belonging to this execution', async () => {
    const { parts } = await executed();
    const other = await executed();
    const client = await pool.connect();
    try {
      const r = await recordRecurrenceObservation(client, other.e.id, 'x', 'coverage', uses(parts, ['s1', 's3']));
      expect(!r.ok && 'refusal' in r && r.refusal).toBe('evidence_not_in_execution');
    } finally { client.release(); }
    expect(await counts()).toEqual(['0', '0']);
  });

  it('the coverage constructor cannot be fed an execution, a checkpoint list, or all lineage', () => {
    // The signature is the guard: only explicit per-claim uses are expressible.
    const coverage = buildRecurrenceClaimCoverage([
      { partitionId: 'p1', sectionId: 's1', occurrence: true },
      { partitionId: 'p3', sectionId: 's3', occurrence: true },
    ]);
    expect(coverage.sections).toEqual({ s1: 'body', s3: 'body' });

    const src = fs.readFileSync(path.join(__dirname, '../recurrenceObservation.ts'), 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
    const fn = src.slice(src.indexOf('export function buildRecurrenceClaimCoverage'));
    const sig = fn.slice(0, fn.indexOf('):'));
    expect(sig).toMatch(/uses: readonly EvidentiaryUse\[\]/);
    expect(sig).not.toMatch(/executionId|checkpoint|lineage/i);
  });
});

describe('P12 · the participation boundary discriminates', () => {
  const IDENTITY = { status: 'verified', memberId: 'm-1' as never, memberRef: 'ref' } as const;
  const ENCOUNTER = { input: 'hello', sessionRef: 's', room: ROOM_POLICIES.writers_studio } as const;
  const SOVEREIGNTY = { sanctuary: false, memoryMode: 'continuity', allowCrossSessionMemory: true } as const;

  it('POSITIVE ARM — the lawful neighbour `member.atoms` is ADMITTED under its existing conditions', () => {
    const candidate: CandidateBlock = { producerId: 'member.atoms', text: 'a placed atom', itemCount: 1 };
    const p = adjudicateParticipation({
      candidates: [candidate], identity: IDENTITY, encounter: ENCOUNTER, sovereignty: SOVEREIGNTY,
    });
    expect(p.admitted.map((a) => a.producerId)).toContain('member.atoms');
  });

  it('TYPE LOCK — no producer exists that could truthfully carry this material', () => {
    // ⚠️ NARROWED. The first version banned the token `observation`, which matched two
    // legitimate pre-existing producers. That was the R1 failure again: a word ban
    // where a relation was meant. The prohibition is on a producer for THIS material.
    const keys = Object.keys(PRODUCER_REGISTRY);
    expect(keys.filter((k) => /recurrence|sweep|bounded/i.test(k))).toEqual([]);

    // ⭐ THE NEAREST NEIGHBOUR EXISTS AND STILL CANNOT CARRY IT. This is the stronger
    // negative arm: not "no producer is named recurrence", but "the closest registered
    // system-authored Writer's Studio observation producer declares a DIFFERENT
    // provenance", so using it would be a provenance lie.
    const neighbour = PRODUCER_REGISTRY['system.writer_pursued_observation'];
    expect(neighbour.authoredBy).toBe('system');
    expect(neighbour.participationClass).toBe('retrieved');
    expect(neighbour.provenance).toContain('writerStudioContext.pursuit');
    expect(neighbour.provenance).toContain("MAIA's own earlier words");
    // a bounded-cognition sweep artifact is not MAIA's earlier words returned to a turn
    expect(neighbour.provenance).not.toMatch(/sweep|recurrence|checkpoint|lineage/i);
  });

  it('TYPE LOCK — the observation module exports no CandidateBlock converter', () => {
    const mod = require('../recurrenceObservation') as Record<string, unknown>;
    expect(Object.keys(mod).filter((k) => /candidate|block|producer|participat/i.test(k))).toEqual([]);
    const raw = fs.readFileSync(path.join(__dirname, '../recurrenceObservation.ts'), 'utf8');
    const src = raw.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
    expect(src).not.toMatch(/CandidateBlock|producerId|adjudicateParticipation/);
  });

  it('RUNTIME LOCK — an untrusted offer bearing an unregistered identity refuses the whole turn (G2)', () => {
    // Known-bad boundary fixture only. This name is NOT introduced anywhere in the
    // application — it exists to prove the second lock already present in MIPA.
    const forged = { producerId: 'system.recurrence_observation', text: 'the gesture recurs' } as unknown as CandidateBlock;
    let refused: CanonicalTurnRefused | null = null;
    try {
      adjudicateParticipation({
        candidates: [forged], identity: IDENTITY, encounter: ENCOUNTER, sovereignty: SOVEREIGNTY,
      });
    } catch (e) { refused = e as CanonicalTurnRefused; }
    expect(refused).toBeInstanceOf(CanonicalTurnRefused);
    expect((refused as CanonicalTurnRefused & { code?: string }).code ?? String(refused))
      .toMatch(/unregistered_producer/);
  });

  it('NO DIRECT PATH — the observation module imports nothing that can reach a served turn', () => {
    // Comments stripped first — the C21 lesson, met for the third time in this lane:
    // the module header NAMES the forbidden surfaces in order to document that it
    // avoids them, and a raw scan reads that prose as the banned behaviour returning.
    const raw = fs.readFileSync(path.join(__dirname, '../recurrenceObservation.ts'), 'utf8');
    const src = raw.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
    const imports = [...src.matchAll(/from '([^']+)'/g)].map((m) => m[1]);
    expect(imports.sort()).toEqual([
      '../manuscript/development/readState', './recurrenceAdmission', 'pg',
    ]);
    for (const forbidden of [
      'getMaiaResponse', 'renderer', 'prompt', 'canonical-turn', 'maiaVoice', 'maiaService', 'route',
    ]) {
      expect(src).not.toContain(forbidden);
    }
  });

  it('REGISTRY FREEZE — member.atoms spec and registry surface are unchanged by this lane', () => {
    const spec = PRODUCER_REGISTRY['member.atoms'];
    expect(spec.authoredBy).toBe('member');
    expect(spec.participationClass).toBe('placed');
    expect(spec.authority).toBe('situate');
    expect(spec.requires).toEqual({ identity: 'verified', notSanctuary: true });
    expect(spec.rooms).toContain('writers_studio');
  });
});
