import {
  ATTENTION_BAND_ORDER,
  validateAttentionMap,
  type WholeManuscriptAttentionMap,
} from '../attentionMap';

const map: WholeManuscriptAttentionMap = {
  manuscriptId: 'm1',
  revisionNumber: 12,
  commissionedAt: '2026-09-28T23:00:00Z',
  readingIds: ['r1', 'r2'],
  items: [{
    id: 'a1',
    band: 'begin-here',
    scale: 'chapter',
    label: 'Chapter 10 transition',
    notice: 'The transition compresses several distinct moves.',
    whyItMatters: 'It carries the book into its final synthesis.',
    uncertainty: null,
    evidence: [{
      readingId: 'r1', observationKey: 'o1', sectionIds: ['s10'],
      lens: 'structure', observation: 'The transition compresses several distinct moves.',
    }],
    sectionIds: ['s10'],
  }],
};

describe('whole-manuscript attention map', () => {
  it('requires explicit evidence for every attention placement', () => {
    expect(validateAttentionMap(map)).toEqual({ ok: true });
    expect(validateAttentionMap({
      ...map,
      items: [{ ...map.items[0]!, evidence: [] }],
    })).toEqual({ ok: false, reason: 'attention_item_requires_evidence' });
  });

  it('orders attention by named bands rather than numeric scores', () => {
    expect(ATTENTION_BAND_ORDER).toEqual(['begin-here', 'next', 'later', 'watch']);
    expect(JSON.stringify(map)).not.toMatch(/"(score|grade|severity|confidence|priority)"/);
  });
});
