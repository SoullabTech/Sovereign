import { deriveMaiaThemeOccurrences } from '../occurrences';
import type { DevelopmentalReading, DevelopmentalObservation } from '@/lib/manuscript/developmentalReading/contract';

const reading = (refs: DevelopmentalObservation['evidenceRefs']): DevelopmentalReading => ({
  id: 'reading-1',
  manuscriptId: 'work-1',
  scope: { commissionedLens: 'themes', bodyScope: ['s1', 's2', 's3'], withStructure: false },
  readState: {
    draftId: 'draft-1', revisionNumber: 7, revisionDigest: 'a'.repeat(64),
    sectionTopology: ['s1', 's2', 's3'],
    sections: {
      s1: { revisionNumber: 7, range: { start: 0, end: 100 }, digest: '1'.repeat(64) },
      s2: { revisionNumber: 7, range: { start: 100, end: 200 }, digest: '2'.repeat(64) },
      s3: { revisionNumber: 7, range: { start: 200, end: 300 }, digest: '3'.repeat(64) },
    },
    inputFingerprint: 'f'.repeat(64),
  },
  coverage: { sections: { s1: 'body', s2: 'body', s3: 'body' } },
  outcome: 'reading',
  observations: [{
    key: 'o1', observationId: 'dobs_1', admissionIndex: 0, basisFingerprint: 'b'.repeat(64),
    position: { sectionPosition: 0, codePointStart: 0 }, lens: 'themes',
    themeLabel: 'Crossing and staying', evidenceRefs: refs,
    observation: 'Crossing recurs in the sections read.',
    doesNotEstablish: ['author-intent'], structureDependency: { kind: 'independent' },
  }],
  provenance: {
    reader: { provider: 'anthropic', model: 'witness', promptHash: 'p', readerVersion: 'r' },
    classifier: null, readingContractVersion: 'DEVELOPMENTAL-READING-CONTRACT-04', frozenAt: '2026-09-26T00:00:00.000Z',
  },
});

const observationOf = (r: DevelopmentalReading): DevelopmentalObservation => {
  if (r.outcome !== 'reading') throw new Error('fixture');
  return r.observations[0];
};

describe('D5C3 Themes evidence-to-occurrence adapter', () => {
  test('preserves section evidence and frozen revision without prose', () => {
    const r = reading([{ kind: 'section', sectionId: 's1' }, { kind: 'section', sectionId: 's2' }]);
    const out = deriveMaiaThemeOccurrences(r, observationOf(r));
    expect(out).toEqual({ ok: true, occurrences: [
      { sectionId: 's1', range: null, sourceReadingId: 'reading-1', sourceObservationId: 'dobs_1', sourceRevisionNumber: 7, provenance: 'maia-observation' },
      { sectionId: 's2', range: null, sourceReadingId: 'reading-1', sourceObservationId: 'dobs_1', sourceRevisionNumber: 7, provenance: 'maia-observation' },
    ] });
  });

  test('keeps exact passage ranges and lets precise passage supersede coarse section ref', () => {
    const r = reading([
      { kind: 'section', sectionId: 's1' },
      { kind: 'passage', sectionId: 's1', range: { start: 8, end: 21 } },
      { kind: 'passage', sectionId: 's1', range: { start: 8, end: 21 } },
      { kind: 'passage', sectionId: 's2', range: { start: 3, end: 12 } },
    ]);
    const out = deriveMaiaThemeOccurrences(r, observationOf(r));
    expect(out.ok).toBe(true);
    if (!out.ok) return;
    expect(out.occurrences.map((o) => [o.sectionId, o.range])).toEqual([
      ['s1', { start: 8, end: 21 }], ['s2', { start: 3, end: 12 }],
    ]);
  });

  test('structural refs cannot manufacture textual occurrence', () => {
    const r = reading([
      { kind: 'section', sectionId: 's1' },
      { kind: 'structure-unit', unitId: 'u1' },
    ]);
    const out = deriveMaiaThemeOccurrences(r, observationOf(r));
    expect(out).toEqual({ ok: false, refusal: 'not_theme_candidate', detail: 'insufficient_repeated_evidence' });
  });

  test('refuses a direct ref outside the frozen state', () => {
    const r = reading([{ kind: 'section', sectionId: 's1' }, { kind: 'section', sectionId: 'missing' }]);
    const out = deriveMaiaThemeOccurrences(r, observationOf(r));
    expect(out.ok).toBe(false);
    if (!out.ok) expect(out.refusal).toBe('evidence_not_in_frozen_state');
  });

  test('refuses an empty or out-of-range passage', () => {
    const r = reading([
      { kind: 'passage', sectionId: 's1', range: { start: 4, end: 4 } },
      { kind: 'section', sectionId: 's2' },
    ]);
    const out = deriveMaiaThemeOccurrences(r, observationOf(r));
    expect(out.ok).toBe(false);
    if (!out.ok) expect(out.refusal).toBe('invalid_passage_range');
  });

  test('requires the observation to belong to the reading', () => {
    const r = reading([{ kind: 'section', sectionId: 's1' }, { kind: 'section', sectionId: 's2' }]);
    const o = { ...observationOf(r), observationId: 'dobs_elsewhere' };
    const out = deriveMaiaThemeOccurrences(r, o);
    expect(out).toEqual({ ok: false, refusal: 'observation_not_in_reading' });
  });
});
