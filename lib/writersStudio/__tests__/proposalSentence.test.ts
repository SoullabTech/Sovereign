/**
 * The affected sentence, current and as it would read.
 *
 * ⭐⭐ THE BUG THIS EXISTS FOR, caught before it shipped. A first version
 * treated `\n` as a sentence terminator. The manuscript is HARD-WRAPPED, so the
 * fixture's own sentence breaks across a line immediately after the marked run:
 *
 *     …wisdom beyond the reactive, fixated
 *     mind. Success lies in…
 *
 * The comparison would have read "…beyond the reactive" and silently dropped
 * the word the change is about. ⛔ A comparison that truncates at a line wrap is
 * WORSE than no comparison: it answers the writer's question wrongly rather
 * than not at all — which is the EW-F1 failure wearing a helpful face.
 */
import { sentenceComparison } from '../proposalSentence';

const spaced = (start: number, end: number) =>
  ({ space: 'projected_section_body' as const, start, end });

/* The real §23 shape: hard-wrapped, the marked run at the end of a line. */
const BODY = [
  'Elemental alchemy connects us with wisdom beyond the reactive, fixated',
  'mind. Success lies in holding space for all elements of experience to come',
  'together naturally.',
].join('\n');

const at = (needle: string) => {
  const i = BODY.indexOf(needle);
  return spaced(
    [...BODY.slice(0, i)].length,
    [...BODY.slice(0, i + needle.length)].length,
  );
};

describe('sentenceComparison', () => {
  it('⭐ keeps the word on the far side of a line wrap', () => {
    const c = sentenceComparison(BODY, at(', fixated'), '')!;
    expect(c.scope).toBe('sentence');
    expect(c.current).toBe('Elemental alchemy connects us with wisdom beyond the reactive, fixated mind.');
    expect(c.wouldRead).toBe('Elemental alchemy connects us with wisdom beyond the reactive mind.');
  });

  it('⛔ and does not run on into the next sentence', () => {
    const c = sentenceComparison(BODY, at(', fixated'), '')!;
    expect(c.current).not.toContain('Success');
    expect(c.wouldRead).not.toContain('Success');
  });

  it('starts after the previous sentence, not at the paragraph top', () => {
    const c = sentenceComparison(BODY, at('holding space'), '')!;
    expect(c.scope).toBe('sentence');
    expect(c.current.startsWith('Success lies in')).toBe(true);
    expect(c.current).not.toContain('Elemental alchemy');
  });

  it('carries a replacement, not only a deletion', () => {
    const c = sentenceComparison(BODY, at(', fixated'), ' and fixed')!;
    expect(c.wouldRead).toBe(
      'Elemental alchemy connects us with wisdom beyond the reactive and fixed mind.');
  });

  it('⭐⭐ widens to the PARAGRAPH when a sentence edge cannot be found', () => {
    /* ⛔ Never an arbitrary character window — that is what EW-F1 shipped and it
       cut mid-word. A span with no terminator is reported honestly as a
       paragraph rather than dressed up as a sentence. */
    const noStops = 'a heading with no terminator at all and a MARK inside it';
    const i = noStops.indexOf('MARK');
    const c = sentenceComparison(noStops, spaced(i, i + 4), '')!;
    expect(c.scope).toBe('paragraph');
    expect(c.current).toBe(noStops);
    expect(c.wouldRead).toBe('a heading with no terminator at all and a  inside it');
  });

  it('does not borrow a terminator from an earlier paragraph', () => {
    const two = 'First para ends here.\n\nSecond para has MARK and no end';
    const i = two.indexOf('MARK');
    const c = sentenceComparison(two, spaced(i, i + 4), '')!;
    expect(c.scope).toBe('paragraph');
    expect(c.current).toBe('Second para has MARK and no end');
    expect(c.current).not.toContain('First para');
  });

  it('⛔ refuses any coordinate space but the projected body', () => {
    expect(sentenceComparison(BODY, { space: 'stored_section_text', start: 0, end: 3 }, '')).toBeNull();
    expect(sentenceComparison(BODY, { space: 'revision_content', start: 0, end: 3 }, '')).toBeNull();
  });

  it('⛔ indexes code points, not code units', () => {
    /* An astral character before the range shifts code units but not code
       points. Unconverted, this is FOCUS-W3 again. */
    const astral = `A 𝄞 note. The word MARK sits here.`;
    const i = astral.indexOf('MARK');
    const cp = [...astral.slice(0, i)].length;
    const c = sentenceComparison(astral, spaced(cp, cp + 4), 'X')!;
    expect(c.wouldRead).toBe('The word X sits here.');
  });
});
