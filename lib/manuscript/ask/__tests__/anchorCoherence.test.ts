/** WS2-05B-8B-02c-2 — the anchor ⇄ reading coherence invariants (contract §2). */

import { checkAnchor } from '../anchor';
import type { StructureInterpretation } from '../../structure/interpret';

const reading = (over: Partial<StructureInterpretation> = {}): StructureInterpretation => ({
  form: 'stable',
  account: 'an account',
  coverage: { bodies: { sectionIds: [] } } as never,
  unaccountedSectionIds: [],
  uncertainRegions: [{ fromSectionId: 's1', toSectionId: 's2', why: 'where this ends' }],
  units: [{ id: 'u1', title: null, kind: null, editorialLabel: 'Fire',
    fromSectionId: 's1', toSectionId: 's2', uncertainty: [], children: [] }],
  editorialSynthesis: {
    thesis: 't', strongestFindings: [],
    questionsForAuthor: [{ label: 'Where does Fire begin?', explanation: 'x' }],
  },
  ...over,
} as StructureInterpretation);

const R = { proposalId: 'P1', interpretation: reading() };

describe('proposal-dependent anchors require a matching frozen reading', () => {
  it.each(['proposal', 'division', 'question', 'uncertainty'] as const)(
    'refuses %s with no reading', (on) => {
      const a = { on, proposalId: 'P1', unitId: 'u1', questionIndex: 0, regionIndex: 0 } as never;
      expect(checkAnchor(a, null)).toEqual({ refusal: 'anchor_requires_reading', ok: false });
    });

  it('refuses a proposalId that disagrees with the reading — never repairs it', () => {
    const r = checkAnchor({ on: 'question', proposalId: 'P2', questionIndex: 0 }, R);
    expect(r).toEqual({ ok: false, refusal: 'anchor_reading_mismatch' });
  });

  it('refuses a question index outside the frozen reading', () => {
    expect(checkAnchor({ on: 'question', proposalId: 'P1', questionIndex: 7 }, R))
      .toEqual({ ok: false, refusal: 'anchor_unresolved', detail: 'question' });
  });

  it('refuses an uncertainty index outside the frozen reading', () => {
    expect(checkAnchor({ on: 'uncertainty', proposalId: 'P1', regionIndex: 3 }, R))
      .toEqual({ ok: false, refusal: 'anchor_unresolved', detail: 'region' });
  });

  it('refuses a unit the reading does not hold', () => {
    expect(checkAnchor({ on: 'division', proposalId: 'P1', unitId: 'nope' }, R))
      .toEqual({ ok: false, refusal: 'anchor_unresolved', detail: 'unit' });
  });

  it('accepts a coherent question and uncertainty anchor', () => {
    expect(checkAnchor({ on: 'question', proposalId: 'P1', questionIndex: 0 }, R).ok).toBe(true);
    expect(checkAnchor({ on: 'uncertainty', proposalId: 'P1', regionIndex: 0 }, R).ok).toBe(true);
  });
});

describe('anchors that need no reading', () => {
  it('opens on a Work that was never read', () => {
    expect(checkAnchor({ on: 'work' }, null).ok).toBe(true);
    expect(checkAnchor({ on: 'section', sectionId: 's1' }, null).ok).toBe(true);
  });

  it('DEGRADES a concern whose unitId does not resolve — the concern survives', () => {
    const r = checkAnchor({ on: 'concern', sectionIds: ['s1'], unitId: 'ghost' }, R);
    expect(r.ok).toBe(true);
    /* The author's concern is theirs; only the false structural claim is
       dropped. Guessing at which unit they meant would author it for them. */
    expect(r.ok && 'unitId' in r.anchor).toBe(false);
  });

  it('keeps a concern unit that does resolve', () => {
    const r = checkAnchor({ on: 'concern', sectionIds: ['s1'], unitId: 'u1' }, R);
    expect(r.ok && (r.anchor as { unitId?: string }).unitId).toBe('u1');
  });
});
