/**
 * The seeding invariant, exercised against the ways a partition can lose text.
 *
 * These are not hypothetical failure modes. Every one of them is something a
 * plausible implementation does by default — trim a section, join with '\n',
 * drop an empty section, normalise a blank run — and each would silently
 * alter a member's manuscript in a conversion they were never asked to
 * approve. The invariant's whole job is to make those aborts, not diffs.
 */

import {
  flattenSections,
  verifyRoundTrip,
  assertRoundTrip,
  SeedInvariantViolation,
} from '../seedInvariant';

const partition = (text: string, cuts: number[]) => {
  const bounds = [0, ...cuts, text.length];
  return bounds.slice(0, -1).map((start, i) => ({ text: text.slice(start, bounds[i + 1]) }));
};

const DRAFT = 'Chapter One\n\nThe morning came.\n\nChapter Two\n\nAnd then it went.\n';

describe('flattenSections', () => {
  it('joins with nothing — a separator would be a character nobody wrote', () => {
    expect(flattenSections([{ text: 'a' }, { text: 'b' }])).toBe('ab');
  });

  it('reconstructs an honest partition exactly', () => {
    expect(flattenSections(partition(DRAFT, [13, 45]))).toBe(DRAFT);
  });

  it('an empty section list flattens to the empty string', () => {
    expect(flattenSections([])).toBe('');
  });
});

describe('verifyRoundTrip', () => {
  it('passes for a partition that keeps every character', () => {
    const r = verifyRoundTrip(DRAFT, partition(DRAFT, [13, 45]));
    expect(r.ok).toBe(true);
    expect(r.divergesAt).toBe(-1);
  });

  it('passes for the degenerate one-section partition', () => {
    expect(verifyRoundTrip(DRAFT, [{ text: DRAFT }]).ok).toBe(true);
  });

  it('FAILS when a section was trimmed', () => {
    const secs = partition(DRAFT, [13, 45]).map((s) => ({ text: s.text.trim() }));
    const r = verifyRoundTrip(DRAFT, secs);
    expect(r.ok).toBe(false);
    expect(r.reconstructedLength).toBeLessThan(r.originalLength);
  });

  it('FAILS when sections were re-joined with a newline', () => {
    const secs = partition(DRAFT, [13, 45]);
    const rejoined = [{ text: secs.map((s) => s.text).join('\n') }];
    expect(verifyRoundTrip(DRAFT, rejoined).ok).toBe(false);
  });

  it('FAILS when a blank run was normalised', () => {
    // the seam where '\n\n' quietly becomes '\n' — same words, different draft
    expect(verifyRoundTrip(DRAFT, [{ text: DRAFT.replace(/\n\n/g, '\n') }]).ok).toBe(false);
  });

  it('FAILS when an empty section was dropped', () => {
    const secs = [...partition(DRAFT, [13, 45]), { text: '' }];
    expect(verifyRoundTrip(DRAFT, secs).ok).toBe(true);         // keeping it is fine
    expect(verifyRoundTrip(DRAFT + '\n', secs).ok).toBe(false); // losing a char is not
  });

  it('FAILS on a single trailing character, with no tolerance', () => {
    const r = verifyRoundTrip(DRAFT, [{ text: DRAFT + ' ' }]);
    expect(r.ok).toBe(false);
    expect(r.divergesAt).toBe(DRAFT.length);
  });

  it('reports the offset of the first difference, never the text', () => {
    const r = verifyRoundTrip('abcdef', [{ text: 'abXdef' }]);
    expect(r.divergesAt).toBe(2);
    expect(JSON.stringify(r)).not.toContain('X');
  });

  it('preserves trailing whitespace and unicode exactly', () => {
    const odd = 'héllo wörld  \n\n\ttabbed\n';
    expect(verifyRoundTrip(odd, partition(odd, [6, 14])).ok).toBe(true);
  });
});

describe('assertRoundTrip', () => {
  it('is silent when the partition is lossless', () => {
    expect(() => assertRoundTrip(DRAFT, partition(DRAFT, [13]))).not.toThrow();
  });

  it('throws SeedInvariantViolation — there is no close-enough branch', () => {
    expect(() => assertRoundTrip(DRAFT, [{ text: DRAFT.trim() }]))
      .toThrow(SeedInvariantViolation);
  });

  it('the violation carries offsets and lengths, not the member\'s prose', () => {
    try {
      assertRoundTrip('the quick brown fox', [{ text: 'the quick brown cat' }]);
      throw new Error('should have thrown');
    } catch (e) {
      expect(e).toBeInstanceOf(SeedInvariantViolation);
      expect((e as Error).message).not.toContain('fox');
      expect((e as Error).message).not.toContain('cat');
      expect((e as Error).message).toContain('char 16');
    }
  });
});
