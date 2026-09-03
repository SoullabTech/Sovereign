/**
 * BUILD-07A — an observation is structurally dependent on recoverable evidence.
 * INV-8 (depth), INV-9 (unread span), INV-16a, INV-17, and the non-empty relation.
 */

import { bindEvidence, unreadSpan, type BoundEvidence } from '../bind';
import { evidenceAtRev1 } from './fixture';

describe('bindEvidence proves every ref against the evidence, or refuses', () => {
  const { evidence } = evidenceAtRev1({ bodyScope: ['s0', 's1'] });

  it('refuses an empty relation — no observation without evidence', () => {
    const r = bindEvidence([], evidence);
    expect(!r.ok && r.refusal).toBe('no_evidence');
  });

  it('binds a section read at body depth', () => {
    const r = bindEvidence([{ kind: 'section', sectionId: 's1' }], evidence);
    expect(r.ok).toBe(true);
    expect(r.ok && r.value.inputFingerprint).toBe(evidence.readState.inputFingerprint);
  });

  it('refuses prose-derived evidence on a section read at position depth only (INV-8)', () => {
    const r = bindEvidence([{ kind: 'section', sectionId: 's3' }], evidence);
    expect(!r.ok && r.refusal).toBe('body_not_read');
    const p = bindEvidence([{ kind: 'passage', sectionId: 's3', range: { start: 0, end: 2 } }], evidence);
    expect(!p.ok && p.refusal).toBe('body_not_read');
  });

  it('binds order-derived evidence over position-depth sections', () => {
    const r = bindEvidence([{ kind: 'section-run', sectionIds: ['s1', 's2', 's3'] }], evidence);
    expect(r.ok).toBe(true);
  });

  it('refuses a run that is not a contiguous run of the topology as read', () => {
    expect(bindEvidence([{ kind: 'section-run', sectionIds: ['s0', 's2'] }], evidence)).toMatchObject({ refusal: 'run_not_as_read' });
    expect(bindEvidence([{ kind: 'section-run', sectionIds: ['s2', 's1'] }], evidence)).toMatchObject({ refusal: 'run_not_as_read' });
    expect(bindEvidence([{ kind: 'section-run', sectionIds: ['s1', 's1'] }], evidence)).toMatchObject({ refusal: 'run_not_as_read' });
  });

  it('refuses a section the reading does not hold', () => {
    expect(bindEvidence([{ kind: 'section', sectionId: 'ghost' }], evidence)).toMatchObject({ refusal: 'unknown_section' });
    expect(bindEvidence([{ kind: 'section-run', sectionIds: ['s1', 'ghost'] }], evidence)).toMatchObject({ refusal: 'unknown_section' });
  });

  it('refuses a passage beyond its section as read', () => {
    const r = bindEvidence([{ kind: 'passage', sectionId: 's0', range: { start: 0, end: 10_000 } }], evidence);
    expect(!r.ok && r.refusal).toBe('range_outside_section');
  });

  it('refuses a malformed ref, naming its index', () => {
    const r = bindEvidence([{ kind: 'section', sectionId: 's0' }, { quote: 'the lantern' }], evidence);
    expect(!r.ok && r.refusal).toBe('malformed_ref');
    expect(!r.ok && r.index).toBe(1);
  });

  it('binds authored structure by canonical unit id, and refuses any other id (INV-17)', () => {
    expect(bindEvidence([{ kind: 'structure-unit', unitId: 'u1' }], evidence).ok).toBe(true);
    expect(bindEvidence([{ kind: 'structure-units', unitIds: ['u1', 'u2'] }], evidence).ok).toBe(true);
    expect(bindEvidence([{ kind: 'structure-topology' }], evidence).ok).toBe(true);
    /* A proposal-internal key, a reviewed unit key, and the proposed row all fail the same way. */
    for (const id of ['p1', 'm1', 'p9']) {
      expect(bindEvidence([{ kind: 'structure-unit', unitId: id }], evidence)).toMatchObject({ refusal: 'unknown_structure_unit' });
    }
  });

  it('refuses structural evidence where no structure was supplied — absent, not degraded (INV-16a)', () => {
    const none = evidenceAtRev1({ withStructure: false }).evidence;
    expect(bindEvidence([{ kind: 'structure-unit', unitId: 'u1' }], none)).toMatchObject({ refusal: 'structure_not_supplied' });
    expect(bindEvidence([{ kind: 'structure-topology' }], none)).toMatchObject({ refusal: 'structure_not_supplied' });
    /* Textual evidence in the same reading is unaffected. */
    expect(bindEvidence([{ kind: 'section', sectionId: 's0' }], none).ok).toBe(true);
  });

  it('refuses the whole relation if any one ref fails — there is no partial bind', () => {
    const r = bindEvidence([
      { kind: 'section', sectionId: 's0' },
      { kind: 'section', sectionId: 's3' },
    ], evidence);
    expect(r.ok).toBe(false);
  });
});

describe('BoundEvidence cannot be forged', () => {
  it('a structurally identical literal is not assignable to BoundEvidence', () => {
    const { evidence } = evidenceAtRev1();
    const real = bindEvidence([{ kind: 'section', sectionId: 's0' }], evidence);
    const forged = { refs: [{ kind: 'section', sectionId: 's0' }] as const, inputFingerprint: 'x', toJSON: () => ({}) };
    /* @ts-expect-error — the private member makes the type nominal. */
    const accepted: BoundEvidence = forged;
    expect(accepted).toBeDefined();
    expect(real.ok && real.value.constructor.name).toBe('Bound');
  });

  it('serialises to refs + fingerprint and nothing else — the proof does not survive JSON', () => {
    const { evidence } = evidenceAtRev1();
    const r = bindEvidence([{ kind: 'section', sectionId: 's0' }], evidence);
    const json = JSON.parse(JSON.stringify(r.ok ? r.value : null));
    expect(Object.keys(json).sort()).toEqual(['inputFingerprint', 'refs']);
  });
});

describe('unreadSpan is derived from coverage plus the refs (INV-9)', () => {
  it('names the sections between the refs that were not read at body depth', () => {
    const { evidence } = evidenceAtRev1({ bodyScope: ['s0', 's3'] });
    const r = bindEvidence([{ kind: 'section', sectionId: 's0' }, { kind: 'section', sectionId: 's3' }], evidence);
    expect(r.ok && unreadSpan(r.value, evidence)).toEqual(['s1', 's2']);
  });

  it('is empty when the span was read whole', () => {
    const { evidence } = evidenceAtRev1({ bodyScope: ['s0', 's1'] });
    const r = bindEvidence([{ kind: 'section', sectionId: 's0' }, { kind: 'section', sectionId: 's1' }], evidence);
    expect(r.ok && unreadSpan(r.value, evidence)).toEqual([]);
  });

  it('a structural ref spans its unit\'s placements', () => {
    const { evidence } = evidenceAtRev1({ bodyScope: ['s2'] });
    const r = bindEvidence([{ kind: 'structure-unit', unitId: 'u2' }], evidence);
    expect(r.ok && unreadSpan(r.value, evidence)).toEqual(['s3']);
  });
});
