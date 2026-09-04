/**
 * BUILD-07A — the reference vocabulary: typed, durable, versionless, proseless.
 */

import {
  EVIDENCE_REF_KINDS, isEvidenceRef, requirementOf, sectionIdsOf, unitIdsOf, isStructural,
  type EvidenceRef,
} from '../evidenceRef';

describe('EvidenceRef is typed by its discriminant', () => {
  it('names textual AND structural evidence', () => {
    expect(EVIDENCE_REF_KINDS).toEqual(expect.arrayContaining(['section', 'passage', 'section-run']));
    expect(EVIDENCE_REF_KINDS).toEqual(expect.arrayContaining(['structure-unit', 'structure-units', 'structure-topology']));
  });

  it('declares what each kind requires of coverage', () => {
    expect(requirementOf({ kind: 'section', sectionId: 'a' })).toBe('body');
    expect(requirementOf({ kind: 'passage', sectionId: 'a', range: { start: 0, end: 1 } })).toBe('body');
    expect(requirementOf({ kind: 'section-run', sectionIds: ['a', 'b'] })).toBe('position');
    expect(requirementOf({ kind: 'structure-unit', unitId: 'u' })).toBe('structure');
    expect(requirementOf({ kind: 'structure-units', unitIds: ['u', 'v'] })).toBe('structure');
    expect(requirementOf({ kind: 'structure-topology' })).toBe('structure');
  });

  it('rejects a ref whose kind must be inferred from populated fields', () => {
    expect(isEvidenceRef({ sectionId: 'a' })).toBe(false);
    expect(isEvidenceRef({ unitId: 'u' })).toBe(false);
    expect(isEvidenceRef({ kind: 'quote', text: 'the lantern' })).toBe(false);
  });

  it('rejects an empty run or an empty unit set — non-empty by shape', () => {
    expect(isEvidenceRef({ kind: 'section-run', sectionIds: [] })).toBe(false);
    expect(isEvidenceRef({ kind: 'structure-units', unitIds: [] })).toBe(false);
  });

  it('rejects an inverted or negative passage range', () => {
    expect(isEvidenceRef({ kind: 'passage', sectionId: 'a', range: { start: 5, end: 2 } })).toBe(false);
    expect(isEvidenceRef({ kind: 'passage', sectionId: 'a', range: { start: -1, end: 2 } })).toBe(false);
    expect(isEvidenceRef({ kind: 'passage', sectionId: 'a', range: { start: 0.5, end: 2 } })).toBe(false);
  });
});

describe('a ref carries no version and no prose (INV-5, INV-6)', () => {
  const all: EvidenceRef[] = [
    { kind: 'section', sectionId: 'a' },
    { kind: 'passage', sectionId: 'a', range: { start: 0, end: 3 } },
    { kind: 'section-run', sectionIds: ['a', 'b'] },
    { kind: 'structure-unit', unitId: 'u' },
    { kind: 'structure-units', unitIds: ['u', 'v'] },
    { kind: 'structure-topology' },
  ];

  it('no variant has a field that could carry a version, a heading, a quote or a live offset', () => {
    for (const ref of all) {
      const keys = Object.keys(ref);
      expect(keys).not.toEqual(expect.arrayContaining(['revision']));
      expect(keys).not.toEqual(expect.arrayContaining(['revisionNumber']));
      expect(keys).not.toEqual(expect.arrayContaining(['version']));
      expect(keys).not.toEqual(expect.arrayContaining(['quote']));
      expect(keys).not.toEqual(expect.arrayContaining(['text']));
      expect(keys).not.toEqual(expect.arrayContaining(['heading']));
      expect(keys).not.toEqual(expect.arrayContaining(['offset']));
      expect(keys).not.toEqual(expect.arrayContaining(['charOffset']));
    }
  });

  it('every dependency is a stable identity', () => {
    expect(sectionIdsOf(all[1])).toEqual(['a']);
    expect(sectionIdsOf(all[2])).toEqual(['a', 'b']);
    expect(unitIdsOf(all[4])).toEqual(['u', 'v']);
    expect(unitIdsOf(all[5])).toEqual([]);
    expect(isStructural(all[5])).toBe(true);
    expect(isStructural(all[0])).toBe(false);
  });
});
