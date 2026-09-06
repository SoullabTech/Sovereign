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

/* WS2-08A — heading depth is preserved, never guessed. */
describe('segment (WS2-08A heading depth)', () => {
  it('records the number of # marks as the explicit depth, with signal markdown', () => {
    const text = ['# One', 'a', '## One point one', 'b', '### Fine', 'c', '# Two', 'd'].join('\n');
    const out = segment(text);
    expect(out.map((s) => [s.heading, s.headingDepth, s.headingSignal])).toEqual([
      ['One', 1, 'markdown'],
      ['One point one', 2, 'markdown'],
      ['Fine', 3, 'markdown'],
      ['Two', 1, 'markdown'],
    ]);
  });

  it('reads "Chapter N" wording as depth 1 from the document itself', () => {
    const text = ['Chapter One — The Late Frost', 'a', 'chapter two', 'b'].join('\n');
    const out = segment(text);
    expect(out.map((s) => [s.headingDepth, s.headingSignal])).toEqual([
      [1, 'chapter'],
      [1, 'chapter'],
    ]);
  });

  it('reads an ALL-CAPS "CHAPTER N" as chapter wording (depth 1), not as a bare caps boundary', () => {
    const text = ['CHAPTER ONE', 'a', 'THE TURNING', 'b', 'CHAPTER TWO', 'c'].join('\n');
    const out = segment(text);
    expect(out.map((s) => [s.headingDepth, s.headingSignal])).toEqual([
      [1, 'chapter'],
      [null, 'caps'],
      [1, 'chapter'],
    ]);
  });

  it('treats an ALL-CAPS line as a boundary whose depth is unclassified (null)', () => {
    const text = ['THE SACRED FLAME', 'a', 'THE TURNING', 'b', 'HEALING', 'c'].join('\n');
    const out = segment(text);
    expect(out).toHaveLength(3);
    for (const s of out) {
      expect(s.headingDepth).toBeNull();
      expect(s.headingSignal).toBe('caps');
    }
  });

  it('leaves an untitled preamble and a heading-less whole document unclassified', () => {
    const withPreamble = segment(['Front.', '# A', 'a', '# B', 'b'].join('\n'));
    expect(withPreamble[0].heading).toBeNull();
    expect(withPreamble[0].headingDepth).toBeNull();
    expect(withPreamble[0].headingSignal).toBeNull();

    const blob = segment('No headings here at all, just prose.');
    expect(blob[0].headingDepth).toBeNull();
    expect(blob[0].headingSignal).toBeNull();
  });

  it('keeps a carried orphan heading\'s own depth for the section it leads', () => {
    // "# Part One" has no body of its own; it is carried into the next section
    // and leads it. The section is depth 1 (the Part), and the depth-2 line it
    // carried sits in the body, in order.
    const text = ['# Part One', '## The Frost', 'body', '# Part Two', 'more'].join('\n');
    const out = segment(text);
    expect(out[0].heading).toBe('Part One');
    expect(out[0].headingDepth).toBe(1);
    expect(out[0].body).toContain('The Frost');
    expect(out[1].headingDepth).toBe(1);
  });

  it('mixed signals: markdown depth survives alongside ALL-CAPS boundaries', () => {
    const text = ['# Fire', 'a', 'THE SACRED FLAME', 'b', '## Kindling', 'c'].join('\n');
    const out = segment(text);
    expect(out.map((s) => [s.headingDepth, s.headingSignal])).toEqual([
      [1, 'markdown'],
      [null, 'caps'],
      [2, 'markdown'],
    ]);
  });
});

/* WS2-08A F2 — the production fixture, witnessed in code first. Generic caps do
   not manufacture hierarchy; explicit chapter wording in caps still does. */
describe('segment (WS2-08A F2 fixture — precedence, not one side of it)', () => {
  it('PART ONE → caps/NULL · CHAPTER ONE → chapter/1 · THE HOUSE AT NIGHT → caps/NULL · CHAPTER TWO → chapter/1', () => {
    const text = [
      'PART ONE', 'opening lines', 'CHAPTER ONE', 'the first chapter',
      'THE HOUSE AT NIGHT', 'a scene', 'CHAPTER TWO', 'the second chapter',
    ].join('\n');
    const out = segment(text);
    expect(out.map((s) => [s.heading, s.headingSignal, s.headingDepth])).toEqual([
      ['PART ONE', 'caps', null],
      ['CHAPTER ONE', 'chapter', 1],
      ['THE HOUSE AT NIGHT', 'caps', null],
      ['CHAPTER TWO', 'chapter', 1],
    ]);
  });
});
