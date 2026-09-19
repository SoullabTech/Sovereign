import {
  observationSectionIdsByKey,
  settleReadingPresentationScope,
  visibleObservationKeys,
} from '../developReadingContext';

describe('develop reading context', () => {
  it('keeps every section named by an observation once, in evidence order', () => {
    expect(observationSectionIdsByKey([
      {
        key: 'o1',
        evidenceRefs: [
          { kind: 'section-run', sectionIds: ['s1', 's2'] },
          { kind: 'passage', sectionId: 's2', range: { start: 1, end: 3 } },
          { kind: 'section', sectionId: 's3' },
        ],
      },
    ]).get('o1')).toEqual(['s1', 's2', 's3']);
  });

  it('shows chapter context for any observation touching the chapter, not only the first section named', () => {
    const visible = visibleObservationKeys({
      observationKeys: ['o1', 'o2', 'o3'],
      observationSectionIds: new Map([
        ['o1', ['a1', 'a2']],
        ['o2', ['b1']],
        ['o3', []],
      ]),
      scope: 'chapter',
      chapterSectionIds: ['a2'],
    });
    expect([...visible]).toEqual(['o1']);
  });

  it('admits passage view only for an exact current passage locus already in hand', () => {
    expect(visibleObservationKeys({
      observationKeys: ['o1', 'o2'],
      observationSectionIds: new Map([
        ['o1', ['s1']],
        ['o2', ['s2']],
      ]),
      scope: 'passage',
      passageObservationKey: 'o2',
    })).toEqual(new Set(['o2']));
    expect(visibleObservationKeys({
      observationKeys: ['o1', 'o2'],
      observationSectionIds: new Map([
        ['o1', ['s1']],
        ['o2', ['s2']],
      ]),
      scope: 'passage',
      passageObservationKey: null,
    })).toEqual(new Set());
  });

  it('falls back honestly when a chosen chapter or passage context is no longer available', () => {
    expect(settleReadingPresentationScope('work', { chapterAvailable: true, passageAvailable: true })).toBe('work');
    expect(settleReadingPresentationScope('chapter', { chapterAvailable: false, passageAvailable: true })).toBe('work');
    expect(settleReadingPresentationScope('passage', { chapterAvailable: true, passageAvailable: false })).toBe('chapter');
    expect(settleReadingPresentationScope('passage', { chapterAvailable: false, passageAvailable: false })).toBe('work');
  });
});
