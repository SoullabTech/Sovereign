import { segment } from '@/lib/manuscript/ingest/segment';

describe('segment (mechanical manuscript segmentation)', () => {
  it('returns a single untitled section for a heading-less blob, body verbatim', () => {
    const text = 'Just a long paragraph of prose with no headings at all. It keeps going.';
    const out = segment(text);
    expect(out).toHaveLength(1);
    expect(out[0].heading).toBeNull();
    expect(out[0].body).toBe(text);
  });

  it('splits on markdown headings and stores the heading without its # marks', () => {
    const text = ['# Chapter One', '', 'Body one.', '', '# Chapter Two', '', 'Body two.'].join('\n');
    const out = segment(text);
    expect(out.map((s) => s.heading)).toEqual(['Chapter One', 'Chapter Two']);
    expect(out[0].body).toContain('Body one.');
    expect(out[1].body).toContain('Body two.');
  });

  it('keeps a preamble before the first heading as an untitled section', () => {
    const text = ['Front matter line.', '', '# One', 'a', '# Two', 'b'].join('\n');
    const out = segment(text);
    expect(out[0].heading).toBeNull();
    expect(out[0].body).toContain('Front matter line.');
    expect(out.slice(1).map((s) => s.heading)).toEqual(['One', 'Two']);
  });

  it('treats fewer than two headings as a single whole-text section', () => {
    const text = ['# Only One', '', 'Body.'].join('\n');
    const out = segment(text);
    expect(out).toHaveLength(1);
    expect(out[0].heading).toBeNull();
    expect(out[0].body).toBe(text);
  });

  it('detects lowercase "chapter N" and ALL-CAPS lines as headings', () => {
    const text = ['chapter one', 'a', 'THE TURNING', 'b'].join('\n');
    const out = segment(text);
    expect(out.map((s) => s.heading)).toEqual(['chapter one', 'THE TURNING']);
  });

  /**
   * Five-persona walk, 2026-08-05: a real manuscript's prose-style headings
   * ("Chapter One — The Late Frost") were invisible to the lowercase literal
   * and the whole book collapsed to one untitled section. Case-fixed for the
   * chapter branch ONLY — a global /i would make the ALL-CAPS branch match
   * ordinary mixed-case prose lines.
   */
  it('detects capitalized "Chapter N — Title" prose headings (the persona-walk defect)', () => {
    const text = [
      'Chapter One — The Late Frost',
      'Maren counted the jars twice.',
      'Chapter Two — What Maren Kept',
      'The letters lived in a biscuit tin.',
    ].join('\n');
    const out = segment(text);
    expect(out.map((s) => s.heading)).toEqual([
      'Chapter One — The Late Frost',
      'Chapter Two — What Maren Kept',
    ]);
  });

  it('a global /i must never arrive: mixed-case prose lines are not headings', () => {
    const text = [
      '# Real Heading',
      'A short line of prose',
      'Another ordinary sentence here',
      '# Second Heading',
      'body',
    ].join('\n');
    const out = segment(text);
    expect(out.map((s) => s.heading)).toEqual(['Real Heading', 'Second Heading']);
  });

  it('never invents a heading — body text is carried through unchanged', () => {
    const text = ['# H', 'line with trailing spaces   ', '\tand a tab'].join('\n');
    const out = segment(text);
    // Only one heading detected (< 2) → whole text as one section, verbatim.
    expect(out).toHaveLength(1);
    expect(out[0].body).toBe(text);
  });
});
