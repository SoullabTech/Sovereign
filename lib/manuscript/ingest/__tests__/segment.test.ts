import { segment, MAX_SECTIONS } from '@/lib/manuscript/ingest/segment';

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

  /**
   * WS2-01C, 2026-08-27 — the print-manuscript defect.
   *
   * A 212-page book imported as a rail of a hundred-plus fragments, every one
   * "~1 page", because every capitalised subhead in the book was promoted to a
   * peer of the chapters. "Chapter 10: The Living Spiral" held nothing but its
   * own epigraph — the chapter's first subhead cut immediately after it.
   *
   * The document declares its own levels. Cut at the strongest one it uses.
   */
  describe('heading levels — cutting at the strongest the document declares', () => {
    const printBook = [
      'Chapter 10: The Living Spiral',
      '',
      '"Human beings can be transformed." — Wayne Teasdale',
      '',
      'THE ALCHEMICAL PROPERTIES OF AETHER',
      '',
      'Aether is the fifth element.',
      '',
      'RETURN TO FLOW',
      '',
      'The spiral returns.',
      '',
      'Chapter 11: The Conclusion',
      '',
      'INTEGRATED REFLECTION',
      '',
      'What was carried forward.',
    ].join('\n');

    it('a chapter keeps its subheads instead of being cut apart by them', () => {
      const out = segment(printBook);
      expect(out.map((s) => s.heading)).toEqual([
        'Chapter 10: The Living Spiral',
        'Chapter 11: The Conclusion',
      ]);
    });

    it("a chapter's range ends immediately before the next chapter", () => {
      const out = segment(printBook);
      expect(out[0].body).toContain('THE ALCHEMICAL PROPERTIES OF AETHER');
      expect(out[0].body).toContain('RETURN TO FLOW');
      expect(out[0].body).toContain('The spiral returns.');
      expect(out[0].body).not.toContain('Chapter 11');
      expect(out[1].body).toContain('INTEGRATED REFLECTION');
    });

    it('every character of the source survives the cut', () => {
      const out = segment(printBook);
      const rebuilt = out
        .map((s) => (s.heading ? `${s.heading}\n${s.body}` : s.body))
        .join('\n');
      for (const line of printBook.split('\n').filter((l) => l.trim())) {
        expect(rebuilt).toContain(line);
      }
    });

    it('markdown depth wins where the document uses it', () => {
      const text = [
        '# Part One',
        '',
        '## Chapter A',
        '',
        'alpha',
        '',
        '## Chapter B',
        '',
        'beta',
        '',
        '# Part Two',
        '',
        '## Chapter C',
        '',
        'gamma',
      ].join('\n');
      expect(segment(text).map((s) => s.heading)).toEqual(['Part One', 'Part Two']);
    });

    it('a single top-level line does not declare a one-section book', () => {
      /* A title page standing alone above ALL-CAPS chapter titles must not
         collapse the whole manuscript into one part. Level 1 cuts once, so the
         next level down is used. */
      const text = [
        '# Elemental Alchemy',
        '',
        'FIRE',
        '',
        'the first element',
        '',
        'WATER',
        '',
        'the second element',
      ].join('\n');
      /* Two cuts, not one: the title page does not swallow the book. FIRE
         itself is absorbed by the WS-01 orphan-carry rule, because the title
         line above it has no body of its own — that rule is unchanged and its
         words are still carried, in order, into the section that follows. */
      const out = segment(text);
      expect(out).toHaveLength(2);
      expect(out[0].heading).toBe('Elemental Alchemy');
      expect(out[0].body).toContain('FIRE');
      expect(out[0].body).toContain('the first element');
      expect(out[1].heading).toBe('WATER');
    });

    it('caps-only manuscripts still cut at their capitalised titles', () => {
      const text = ['FIRE', '', 'the first', '', 'WATER', '', 'the second'].join('\n');
      expect(segment(text).map((s) => s.heading)).toEqual(['FIRE', 'WATER']);
    });
  });

  it('the section cap absorbs the remainder rather than truncating the book', () => {
    /* WS2-01C — the loop used to stop at MAX_SECTIONS and end, dropping every
       remaining line of the member's manuscript with nothing said. */
    const lines: string[] = [];
    for (let i = 0; i < MAX_SECTIONS + 40; i++) {
      lines.push(`Chapter ${i} marker`, '', `body of chapter ${i}`, '');
    }
    const out = segment(lines.join('\n'));
    expect(out.length).toBeLessThanOrEqual(MAX_SECTIONS);
    const rebuilt = out.map((s) => `${s.heading ?? ''}\n${s.body}`).join('\n');
    expect(rebuilt).toContain(`body of chapter ${MAX_SECTIONS + 39}`);
    expect(rebuilt).toContain(`Chapter ${MAX_SECTIONS + 39} marker`);
  });
});
