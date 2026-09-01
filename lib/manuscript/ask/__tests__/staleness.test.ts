/** WS2-05B-8B-02c-2 — three-state staleness, and UNKNOWN ≠ CURRENT (contract §4). */

import { computeStaleness, isCurrent, mustNotAssertCurrent, UNMEASURED } from '../staleness';

const frozen = { interpretationInputHash: 'IH', sectionTopologyHash: 'TH', reviewRevision: 3 };

describe('UNKNOWN is not CURRENT', () => {
  it('an all-unmeasured state is not current', () => {
    expect(isCurrent(UNMEASURED)).toBe(false);
  });

  it('one unmeasured dimension is enough to withhold "current"', () => {
    const s = computeStaleness({
      frozen, canonicalAtOpen: 'C', frozenProposalId: 'P1',
      now: { interpretationInputHash: null, sectionTopologyHash: 'TH',
             reviewRevision: 3, newestProposalId: 'P1', canonicalFingerprint: 'C' },
    });
    expect(s.inputMoved).toEqual({ state: 'unmeasured' });
    expect(s.topologyMoved).toEqual({ state: 'unchanged' });
    expect(isCurrent(s)).toBe(false);
    /* And it constrains her the same way a known change does. */
    expect(mustNotAssertCurrent(s)).toBe(true);
  });

  it('is current only when every dimension was measured and unchanged', () => {
    const s = computeStaleness({
      frozen, canonicalAtOpen: 'C', frozenProposalId: 'P1',
      now: { interpretationInputHash: 'IH', sectionTopologyHash: 'TH',
             reviewRevision: 3, newestProposalId: 'P1', canonicalFingerprint: 'C' },
    });
    expect(isCurrent(s)).toBe(true);
    expect(mustNotAssertCurrent(s)).toBe(false);
  });
});

describe('the dimensions are compositional, not exclusive', () => {
  it('reports moved text AND a moved tree AND supersession at once', () => {
    const s = computeStaleness({
      frozen, canonicalAtOpen: 'C', frozenProposalId: 'P1',
      now: { interpretationInputHash: 'CHANGED', sectionTopologyHash: 'TH',
             reviewRevision: 9, newestProposalId: 'P2', canonicalFingerprint: 'C' },
    });
    expect(s.inputMoved).toEqual({ state: 'changed' });
    expect(s.reviewMoved).toEqual({ state: 'changed', was: 3, now: 9 });
    expect(s.readingSuperseded).toEqual({ state: 'superseded', by: 'P2' });
    /* None of the three erased either of the others. */
    expect(isCurrent(s)).toBe(false);
  });
});

describe('measured-unchanged is distinguishable from could-not-measure', () => {
  it('reviewMoved says unchanged when it was measured and equal', () => {
    const s = computeStaleness({
      frozen, canonicalAtOpen: 'C', frozenProposalId: 'P1',
      now: { reviewRevision: 3, newestProposalId: 'P1',
             interpretationInputHash: 'IH', sectionTopologyHash: 'TH', canonicalFingerprint: 'C' },
    });
    expect(s.reviewMoved).toEqual({ state: 'unchanged' });
    expect(s.readingSuperseded).toEqual({ state: 'not-superseded' });
  });

  it('reviewMoved says unmeasured when it could not be read', () => {
    const s = computeStaleness({
      frozen, canonicalAtOpen: 'C', frozenProposalId: 'P1',
      now: { reviewRevision: null, newestProposalId: null,
             interpretationInputHash: 'IH', sectionTopologyHash: 'TH', canonicalFingerprint: 'C' },
    });
    expect(s.reviewMoved).toEqual({ state: 'unmeasured' });
    expect(s.readingSuperseded).toEqual({ state: 'unmeasured' });
    expect(isCurrent(s)).toBe(false);
  });
});

describe('a thread with no reading', () => {
  it('reports the reading dimensions unmeasured, never unchanged', () => {
    const s = computeStaleness({
      frozen: null, canonicalAtOpen: 'C', frozenProposalId: null,
      now: { canonicalFingerprint: 'C' },
    });
    expect(s.inputMoved).toEqual({ state: 'unmeasured' });
    expect(s.canonicalMoved).toEqual({ state: 'unchanged' });
    expect(isCurrent(s)).toBe(false);
  });
});
