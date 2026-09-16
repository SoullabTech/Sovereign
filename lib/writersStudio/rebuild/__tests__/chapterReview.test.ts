import { findingsFromPayloads, findingsForSection, lensCounts } from '../chapterReview';

const payload = {
  reading: {
    id: 'r1', manuscriptId: 'm1', outcome: 'reading',
    scope: { commissionedLens: 'development', bodyScope: ['d198', 'd199'], withStructure: false },
    readState: { sectionTopology: ['d198', 'd199'], revisionNumber: 5 },
    coverage: { sections: {} }, provenance: { frozenAt: '', reader: {}, classifier: null },
    observations: [
      { key: 'o1', lens: 'development', observation: 'The second movement introduces a personal turn that is not yet developed.',
        evidenceRefs: [{ kind: 'section', sectionId: 'd199' }], doesNotEstablish: ['author-intent'], structureDependency: { kind: 'independent' } },
      { key: 'o2', lens: 'development', observation: 'The transition spans both sections.',
        evidenceRefs: [{ kind: 'section-run', sectionIds: ['d198', 'd199'] }], doesNotEstablish: ['reader-effect'], structureDependency: { kind: 'independent' } },
    ],
  },
  assessment: { reading: { state: 'current' }, observations: { o1: { state: 'current' }, o2: { state: 'unmeasured' } } },
  sections: [],
} as any;

describe('chapter review projection', () => {
  it('links findings to the draft sections their frozen evidence names', () => {
    const f = findingsFromPayloads([payload]);
    expect(f[0]?.sectionIds).toEqual(['d199']);
    expect(f[1]?.sectionIds).toEqual(['d198', 'd199']);
    expect(findingsForSection(f, 'd199')).toHaveLength(2);
  });

  it('keeps lens counts descriptive rather than inventing good/bad verdicts', () => {
    expect(lensCounts(findingsFromPayloads([payload]))).toEqual({ development: 2 });
  });
});
