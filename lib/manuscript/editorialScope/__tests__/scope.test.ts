/**
 * WS-EDITORIAL-SCOPE-01 — FALSIFIERS.
 *
 * ⭐⭐ F1 IS THE ONE THAT MATTERS. It is the actual 2026-09-19 exchange: the
 * author's opening from Elemental Alchemy, and the wording MAIA returned in its
 * place. If F1 ever goes green under a default declaration, the law has been
 * weakened back to the state that produced the incident.
 */

import {
  DEFAULT_SCOPE_DECLARATION, LATITUDE_BANDS,
  judgeProposalScope, measureProposalScope, paragraphSpans, words,
  latitudeInstruction,
  type EditorialScopeDeclaration,
} from '../contract';

/* The author's words, as they stood. Two paragraphs of the opening. */
const AUTHOR = `To be human is to move through cycles. Morning turns to midday, midday leads toward dusk, dusk gives way to nightfall, and night eventually finds its way back to the light of day. Winter moves into spring, spring opens into summer, summer releases into fall, and fall returns again to the dormancy of winter. These rhythms surround us so completely that we rarely stop to consider how deeply they shape the way life itself unfolds.

Yet human development is more than simple repetition. When something returns, we are not necessarily the same person who encountered it before. An old fear can return while our capacity to remain present with it has changed. A familiar relationship can touch the same wound while revealing something we were previously unable to see. A question first encountered when we were young can return later carrying another depth entirely.

This is where the image of the spiral becomes useful. A cycle describes the natural movement of return. A spiral includes that return while allowing for development. We may find ourselves in familiar territory, but our awareness, understanding, capacities, and relationship to what is happening can be different.`;

/* What MAIA returned in its place: the first paragraph gone entirely, the third
   rebuilt around her own new term. */
const MAIA_REWRITE = `Yet human development is more than simple repetition. When something returns, we are not necessarily the same person who encountered it before. An old fear can return while our capacity to remain present with it has changed. A familiar relationship can touch the same wound while revealing something we were previously unable to see. A question first encountered when we were young can return later carrying another depth entirely.

There is also a movement in us that does not return at all. Something reaches, aims, commits, goes out from where it was and does not come back — the line drawn forward, the arrow released. We know this movement as clearly as we know the cycles: the decision made, the direction taken, the years that do not repeat. A life is not only circular. It also has a direction, and that direction is not undone by the fact that morning keeps arriving.

This is where the image of the spiral becomes useful. A cycle describes the natural movement of return. A line describes movement that goes somewhere. A spiral is what happens when these are the same movement: we come round again, and we are not where we were.`;

const at = (
  latitude: EditorialScopeDeclaration['latitude'],
  mayRemoveParagraphs = false,
): EditorialScopeDeclaration => ({ latitude, mayRemoveParagraphs });

describe('WS-EDITORIAL-SCOPE-01 · the law', () => {
  /* ─────────────────────────────────────────────────────────────────────── */
  it('F1 · REGRESSION · the 2026-09-19 rewrite is refused under the default', () => {
    const v = judgeProposalScope(AUTHOR, MAIA_REWRITE, DEFAULT_SCOPE_DECLARATION);
    expect(v.ok).toBe(false);
  });

  it('F1b · and it is refused for REMOVING A PARAGRAPH, not merely for size', () => {
    const v = judgeProposalScope(AUTHOR, MAIA_REWRITE, DEFAULT_SCOPE_DECLARATION);
    expect(v.ok).toBe(false);
    if (v.ok) return;
    expect(v.reason).toBe('scope_removes_paragraphs');
    expect(v.measure.droppedParagraphs.length).toBeGreaterThan(0);
  });

  it('F1c · ⭐⭐ MAXIMUM LATITUDE DOES NOT GRANT PARAGRAPH REMOVAL', () => {
    /* The founder's ruling, as an assertion: the slider and the paragraph
       permission are different controls, and 5 is not a synonym for both. */
    const v = judgeProposalScope(AUTHOR, MAIA_REWRITE, at(5));
    expect(v.ok).toBe(false);
    if (v.ok) return;
    expect(v.reason).toBe('scope_removes_paragraphs');
    expect(v.wouldPassAtLatitude).toBeNull();
  });

  it('F1d · with the paragraph permission explicitly granted, latitude decides', () => {
    expect(judgeProposalScope(AUTHOR, MAIA_REWRITE, at(5, true)).ok).toBe(true);
    expect(judgeProposalScope(AUTHOR, MAIA_REWRITE, at(1, true)).ok).toBe(false);
  });

  /* ─────────────────────────────────────────────────────────────────────── */
  it('F2 · the smallest useful edit is never blocked, even at latitude 1', () => {
    const before = 'These rhythms surround us so completely that we rarely stop to consider them.';
    const after = 'These rhythms surround us so completely that we seldom stop to consider them.';
    expect(judgeProposalScope(before, after, at(1)).ok).toBe(true);
  });

  it('F2b · a short line may be recast without tripping the fraction bound', () => {
    /* ⭐ The reason `freeWords` exists: on a 12-word locus any real edit is a
       large FRACTION, and refusing it would defeat the law's own purpose. */
    const before = 'The elements are not compartments into which we divide ourselves.';
    const after = 'The elements are not boxes we sort ourselves into.';
    expect(judgeProposalScope(before, after, at(1)).ok).toBe(true);
  });

  it('F3 · wholesale replacement of a passage is refused at every latitude below Open', () => {
    const mine = 'Fire appears through energy, vision, imagination, inspiration, and the illuminating '
      + 'sense of what might be possible. Water moves through feeling, emotion, memory, intuition, '
      + 'and the depths of our inner experience.';
    const hers = 'The elemental registers operate as distinct phenomenological modes, each disclosing '
      + 'a characteristic domain of givenness within the lived horizon of the subject.';
    for (const l of [1, 2, 3, 4] as const) {
      expect(judgeProposalScope(mine, hers, at(l, true)).ok).toBe(false);
    }
  });

  it('F4 · ⭐ a long unbroken cut is refused even when the fraction stays small', () => {
    /* The bound that a fraction rule alone would miss: on a long locus, deleting
       one solid stretch is a small share of the whole. */
    const filler = Array.from({ length: 400 }, (_, i) => `w${i}`).join(' ');
    const cut = Array.from({ length: 70 }, (_, i) => `c${i}`).join(' ');
    const author = `${filler} ${cut}`;
    const v = judgeProposalScope(author, filler, at(3, true));
    expect(v.ok).toBe(false);
    if (v.ok) return;
    expect(v.reason).toBe('scope_removes_contiguous_passage');
    expect(v.measure.removedFraction).toBeLessThan(LATITUDE_BANDS[3].maxRemovedFraction);
  });

  it('F5 · deleting the whole passage is refused under the default', () => {
    expect(judgeProposalScope(AUTHOR, '', DEFAULT_SCOPE_DECLARATION).ok).toBe(false);
  });

  it('F6 · an unchanged proposal is lawful and measures as zero removal', () => {
    const v = judgeProposalScope(AUTHOR, AUTHOR, at(1));
    expect(v.ok).toBe(true);
    expect(v.measure.removedWords).toBe(0);
    expect(v.measure.droppedParagraphs).toHaveLength(0);
  });

  it('F7 · pure addition removes nothing and is lawful at latitude 1', () => {
    const before = 'A cycle describes the natural movement of return';
    const after = 'A cycle describes the natural movement of return and of development';
    const v = judgeProposalScope(before, after, at(1));
    expect(v.ok).toBe(true);
    expect(v.measure.removedWords).toBe(0);
  });

  it('F7b · ⭐ changing a mark counts as changing a word, deliberately', () => {
    /* `return.` → `return,` is one removal and one addition. ⛔ Not a bug: every
       normalisation is a decision about which of the author's marks do not
       matter, and this law has no standing to make one. It is lawful because it
       is small, not because it is invisible. */
    const m = measureProposalScope(
      'A cycle describes the natural movement of return.',
      'A cycle describes the natural movement of return, and more.');
    expect(m.removedWords).toBe(1);
  });

  /* ── the measurement itself ─────────────────────────────────────────────── */
  it('F8 · the bands ascend and never invert', () => {
    /* ⛔ And the floor is NOT one of the ascending numbers — see F3. */
    for (const l of [1, 2, 3, 4] as const) {
      const lo = LATITUDE_BANDS[l];
      const hi = LATITUDE_BANDS[(l + 1) as 2 | 3 | 4 | 5];
      expect(hi.maxRemovedFraction).toBeGreaterThanOrEqual(lo.maxRemovedFraction);
      expect(hi.maxContiguousRemovedWords).toBeGreaterThanOrEqual(lo.maxContiguousRemovedWords);
    }
  });

  it('F9 · the default declaration is the most protective one available', () => {
    expect(DEFAULT_SCOPE_DECLARATION.latitude).toBe(1);
    expect(DEFAULT_SCOPE_DECLARATION.mayRemoveParagraphs).toBe(false);
  });

  it('F10 · paragraphs are blank-line delimited and short fragments are exempt', () => {
    expect(paragraphSpans(AUTHOR)).toHaveLength(3);
    expect(paragraphSpans('A heading\n\nshort\n\n' + AUTHOR)).toHaveLength(5);
    /* ⛔ A two-word fragment must not be reportable as a removed paragraph. */
    const v = judgeProposalScope('One two\n\n' + AUTHOR, AUTHOR, at(5));
    expect(v.ok).toBe(true);
  });

  it('F11 · an empty passage measures zero rather than NaN', () => {
    const m = measureProposalScope('', 'anything at all');
    expect(m.removedFraction).toBe(0);
    expect(judgeProposalScope('', 'anything at all', at(1)).ok).toBe(true);
  });

  it('F12 · words() does not normalise punctuation away', () => {
    expect(words('cycles. cycles')).toEqual(['cycles.', 'cycles']);
  });

  it('F13 · the refusal reports counts and never the rejected wording', () => {
    const v = judgeProposalScope(AUTHOR, MAIA_REWRITE, DEFAULT_SCOPE_DECLARATION);
    expect(v.ok).toBe(false);
    if (v.ok) return;
    /* ⛔ A refusal is not an occasion to disclose. The detail must not carry
       MAIA's rejected prose back to the writer as if it were on offer. */
    expect(v.detail).not.toContain('the arrow released');
    expect(v.detail).toMatch(/paragraph/i);
  });

  it('F14 · the instruction is courtesy only — it states nothing unenforced', () => {
    const text = latitudeInstruction(DEFAULT_SCOPE_DECLARATION);
    expect(text).toContain(LATITUDE_BANDS[1].label);
    expect(text).toMatch(/NOT allowed removing whole paragraphs/);
    expect(text).toMatch(/paragraph removal is off/i);
    expect(text).toMatch(/turn on paragraph removal/i);
    expect(latitudeInstruction(at(5, true))).toMatch(/has allowed proposals that remove/);
  });
});
