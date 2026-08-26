import {
  findMatches,
  MAX_MATCHES,
  outlineOf,
  replacePreview,
  replaceRanges,
} from '../manuscriptTools';

describe('outlineOf — the draft’s own structure', () => {
  it('is empty for prose with no headings, rather than inventing one', () => {
    expect(outlineOf('Just a paragraph.\n\nAnd another one.')).toEqual([]);
  });

  it('reads markdown headings and their reach', () => {
    const out = outlineOf('# One\nalpha\n## Two\nbeta');
    expect(out.map((o) => o.title)).toEqual(['One', 'Two']);
    expect(out[0].level).toBe(1);
    expect(out[1].level).toBe(2);
    expect(out[0].extent).toBe('# One\nalpha\n'.length);
  });

  it('normalises so the outermost heading present is level 1', () => {
    const out = outlineOf('### Deep\nx\n#### Deeper\ny');
    expect(out.map((o) => o.level)).toEqual([1, 2]);
  });

  it('reads the units a writer actually types', () => {
    const out = outlineOf('Chapter One\ntext\nPART II\nmore');
    expect(out.map((o) => o.title)).toEqual(['Chapter One', 'PART II']);
  });

  it('does not mistake a rule or a number row for a title', () => {
    expect(outlineOf('--------\n12345\ntext')).toEqual([]);
  });

  it('does not mistake ordinary prose for a heading', () => {
    expect(outlineOf('the chapter closed behind her')).toEqual([]);
  });

  it('gives offsets that land on the heading in the real text', () => {
    const text = 'intro\n\n# Threshold\nbody';
    const [entry] = outlineOf(text);
    expect(text.slice(entry.offset, entry.offset + 11)).toBe('# Threshold');
  });
});

describe('findMatches', () => {
  const text = 'The fire and the firelight and the FIRE.';

  it('finds nothing for an empty query', () => {
    expect(findMatches(text, '').total).toBe(0);
  });

  it('is case-insensitive by default and exact when asked', () => {
    expect(findMatches(text, 'fire').total).toBe(3);
    expect(findMatches(text, 'fire', { caseSensitive: true }).total).toBe(2);
  });

  it('respects whole words', () => {
    expect(findMatches(text, 'fire', { wholeWord: true }).total).toBe(2);
  });

  it('does not require a word boundary the query cannot have', () => {
    expect(findMatches('a (b) c', '(', { wholeWord: true }).total).toBe(1);
  });

  it('carries context and a line number so the writer can see where it is', () => {
    const { matches } = findMatches('one\ntwo\nthe fire burns', 'fire');
    expect(matches[0].line).toBe(3);
    expect(matches[0].before).toContain('the');
    expect(matches[0].after).toContain('burns');
  });

  it('reports truncation instead of silently returning fewer', () => {
    const many = 'x '.repeat(MAX_MATCHES + 50);
    const res = findMatches(many, 'x');
    expect(res.matches.length).toBe(MAX_MATCHES);
    expect(res.total).toBe(MAX_MATCHES + 50);
    expect(res.truncated).toBe(true);
  });

  it('treats regex characters in the query as literal text', () => {
    expect(findMatches('a.b axb', 'a.b').total).toBe(1);
  });
});

describe('replaceRanges — only what the writer was shown', () => {
  const text = 'fire and fire and fire';

  it('replaces every given range and leaves the rest alone', () => {
    const { matches } = findMatches(text, 'fire');
    const { next, replaced } = replaceRanges(text, matches, 'water');
    expect(next).toBe('water and water and water');
    expect(replaced).toBe(3);
  });

  it('replaces just one range when just one was chosen', () => {
    const { matches } = findMatches(text, 'fire');
    expect(replaceRanges(text, [matches[1]], 'water').next).toBe('fire and water and fire');
  });

  it('stays correct when the replacement is longer or shorter', () => {
    const { matches } = findMatches(text, 'fire');
    expect(replaceRanges(text, matches, 'x').next).toBe('x and x and x');
  });

  it('refuses overlapping ranges rather than producing garbage', () => {
    expect(() => replaceRanges(text, [{ start: 0, end: 4 }, { start: 2, end: 6 }], 'z')).toThrow();
  });

  it('refuses a range outside the text', () => {
    expect(() => replaceRanges(text, [{ start: 0, end: 9999 }], 'z')).toThrow();
  });

  it('does not mutate the text it was given', () => {
    const { matches } = findMatches(text, 'fire');
    replaceRanges(text, matches, 'water');
    expect(text).toBe('fire and fire and fire');
  });
});

describe('replacePreview', () => {
  it('shows how the line will read, not just a count', () => {
    const { matches } = findMatches('the fire burns low', 'fire');
    expect(replacePreview(matches[0], 'water')).toBe('the water burns low');
  });
});
