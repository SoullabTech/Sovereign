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

  it('never invents a heading — body text is carried through unchanged', () => {
    const text = ['# H', 'line with trailing spaces   ', '\tand a tab'].join('\n');
    const out = segment(text);
    // Only one heading detected (< 2) → whole text as one section, verbatim.
    expect(out).toHaveLength(1);
    expect(out[0].body).toBe(text);
  });
});
