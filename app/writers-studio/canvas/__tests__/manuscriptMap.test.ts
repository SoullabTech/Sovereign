import {
  findInDraft,
  frameAfterEdit,
  frameForRegion,
  mapDraft,
  OPENING_KEY,
  regionAtOffset,
  regionLabel,
  spliceFrame,
  type DeclaredPart,
} from '../manuscriptMap';

/**
 * The map's job is to let a writer work on one chapter without scrolling the
 * whole book. Two things make that safe rather than merely convenient:
 *
 *   1. Coverage — every character belongs to exactly one region. If a region
 *      could lose text, focusing a part would hide the member's own words from
 *      them, and an edit spliced back would delete what was hidden.
 *   2. Honesty — a part the map cannot find is REPORTED, never silently
 *      dropped. A rail that quietly omits a chapter is the dishonest display
 *      the Structure design ruled against.
 */

const parts = (...headings: (string | null)[]): DeclaredPart[] =>
  headings.map((heading, i) => ({ id: `s${i + 1}`, position: i + 1, heading }));

const draft = ['Front Matter', '', 'Copyright and so on.', '', 'Chapter One', '', 'It began.', '', 'Chapter Two', '', 'It continued.', ''].join('\n');

describe('mapDraft — locating carried cuts', () => {
  it('anchors each declared heading, in declared order', () => {
    const map = mapDraft(draft, parts('Front Matter', 'Chapter One', 'Chapter Two'));
    expect(map.regions.map((r) => r.key)).toEqual(['s1', 's2', 's3']);
    expect(map.adrift).toEqual([]);
    const chapterOne = map.regions[1];
    expect(draft.slice(chapterOne.start, chapterOne.end)).toBe('Chapter One\n\nIt began.\n\n');
  });

  it('covers the whole draft with no gaps and no overlaps', () => {
    const map = mapDraft(draft, parts('Front Matter', 'Chapter One', 'Chapter Two'));
    let cursor = 0;
    for (const r of map.regions) {
      expect(r.start).toBe(cursor);
      expect(r.end).toBeGreaterThanOrEqual(r.start);
      cursor = r.end;
    }
    expect(cursor).toBe(draft.length);
    expect(map.regions.map((r) => draft.slice(r.start, r.end)).join('')).toBe(draft);
  });

  it('gives text before the first located heading its own region rather than orphaning it', () => {
    const withPreamble = `A note before we begin.\n\n${draft}`;
    const map = mapDraft(withPreamble, parts('Front Matter', 'Chapter One', 'Chapter Two'));
    expect(map.regions[0].key).toBe(OPENING_KEY);
    expect(withPreamble.slice(map.regions[0].start, map.regions[0].end)).toBe(
      'A note before we begin.\n\n',
    );
    expect(map.regions.map((r) => withPreamble.slice(r.start, r.end)).join('')).toBe(withPreamble);
  });

  it('reports a heading the member has since rewritten instead of guessing at it', () => {
    const rewritten = draft.replace('Chapter Two', 'Two: The Turning');
    const map = mapDraft(rewritten, parts('Front Matter', 'Chapter One', 'Chapter Two'));
    expect(map.adrift.map((p) => p.heading)).toEqual(['Chapter Two']);
    expect(map.regions.map((r) => r.key)).toEqual(['s1', 's2']);
    // The rewritten chapter's words are still reachable — they fall inside the
    // preceding region, so nothing is hidden from the writer.
    expect(map.regions.map((r) => rewritten.slice(r.start, r.end)).join('')).toBe(rewritten);
  });

  it('never fuzzy-matches: a near-miss heading is adrift, not resolved', () => {
    const map = mapDraft(draft, parts('CHAPTER ONE'));
    expect(map.adrift).toHaveLength(1);
  });

  it('treats an unnamed carried part as adrift — it has no line to be a door to', () => {
    const map = mapDraft(draft, parts('Front Matter', null, 'Chapter Two'));
    expect(map.adrift.map((p) => p.position)).toEqual([2]);
  });

  it('resolves a repeated heading forward, in declared order', () => {
    const repeated = 'Interlude\n\nfirst\n\nInterlude\n\nsecond\n';
    const map = mapDraft(repeated, parts('Interlude', 'Interlude'));
    expect(map.adrift).toEqual([]);
    expect(repeated.slice(map.regions[0].start, map.regions[0].end)).toBe('Interlude\n\nfirst\n\n');
    expect(repeated.slice(map.regions[1].start, map.regions[1].end)).toBe('Interlude\n\nsecond\n');
  });

  it('matches a heading line ignoring surrounding whitespace only', () => {
    const padded = '  Chapter One  \n\nbody\n';
    const map = mapDraft(padded, parts('Chapter One'));
    expect(map.adrift).toEqual([]);
    expect(map.regions[0].start).toBe(0);
  });

  it('falls back to one whole-draft region when nothing can be located', () => {
    const map = mapDraft('just some prose\n', parts('Chapter One'));
    expect(map.regions).toHaveLength(1);
    expect(map.regions[0].key).toBe(OPENING_KEY);
    expect(map.regions[0].end).toBe('just some prose\n'.length);
    expect(map.adrift).toHaveLength(1);
  });

  it('handles an empty draft without producing an invalid range', () => {
    const map = mapDraft('', parts('Chapter One'));
    expect(map.regions).toEqual([
      { key: OPENING_KEY, heading: null, position: null, start: 0, end: 0 },
    ]);
  });
});

describe('regionAtOffset', () => {
  it('answers which part a given offset lives in', () => {
    const map = mapDraft(draft, parts('Front Matter', 'Chapter One', 'Chapter Two'));
    expect(regionAtOffset(map, draft.indexOf('It began.'))?.key).toBe('s2');
    expect(regionAtOffset(map, draft.indexOf('It continued.'))?.key).toBe('s3');
  });
});

describe('findInDraft — locating material across the whole manuscript', () => {
  it('reports every match with the part it lives in', () => {
    const found = findInDraft(draft, mapDraft(draft, parts('Front Matter', 'Chapter One', 'Chapter Two')), 'it');
    expect(found.hits.map((h) => h.region?.key)).toEqual(['s2', 's3']);
    expect(found.hits[0].before).toBe('');
    expect(found.hits[0].match).toBe('It');
    expect(found.hits[0].after).toBe(' began.');
  });

  it('returns the draft’s own casing for the match, not the query’s', () => {
    const content = 'She wrote In The Front Of The Book here.\n';
    const found = findInDraft(content, mapDraft(content, []), 'in the front of the book');
    expect(found.hits[0].match).toBe('In The Front Of The Book');
  });

  it('windows a match buried deep in a paragraph instead of truncating the line', () => {
    const content = `${'filler word '.repeat(120)}NEEDLE${' trailing word'.repeat(60)}\n`;
    const [hit] = findInDraft(content, mapDraft(content, []), 'needle').hits;
    expect(hit.match).toBe('NEEDLE');
    expect(hit.clippedStart).toBe(true);
    expect(hit.clippedEnd).toBe(true);
    expect(hit.before.length).toBeLessThanOrEqual(48);
    expect(hit.after.length).toBeLessThanOrEqual(96);
    // The point of the window: the match is IN the excerpt, not cut off by it.
    expect(`${hit.before}${hit.match}${hit.after}`).toContain('NEEDLE');
  });

  it('does not clip a short line', () => {
    const content = 'a short line with needle in it\n';
    const [hit] = findInDraft(content, mapDraft(content, []), 'needle').hits;
    expect(hit.clippedStart).toBe(false);
    expect(hit.clippedEnd).toBe(false);
    expect(`${hit.before}${hit.match}${hit.after}`).toBe(content.trim());
  });

  it('is case-insensitive and does not treat the query as a pattern', () => {
    const content = 'See chapter 1 (the front of the book).\n';
    const map = mapDraft(content, []);
    expect(findInDraft(content, map, 'FRONT OF THE BOOK').hits).toHaveLength(1);
    expect(findInDraft(content, map, '(the front').hits).toHaveLength(1);
    expect(findInDraft(content, map, 'ch.*ter').hits).toHaveLength(0);
  });

  it('ignores a query too short to be a search', () => {
    expect(findInDraft(draft, mapDraft(draft, []), 'a').hits).toEqual([]);
    expect(findInDraft(draft, mapDraft(draft, []), '   ').hits).toEqual([]);
  });

  it('caps results and says so rather than rendering thousands of rows', () => {
    const many = 'the\n'.repeat(50);
    const found = findInDraft(many, mapDraft(many, []), 'the', 10);
    expect(found.hits).toHaveLength(10);
    expect(found.truncated).toBe(true);
  });

  it('does not overlap matches', () => {
    const content = 'aaaa';
    const found = findInDraft(content, mapDraft(content, []), 'aa');
    expect(found.hits.map((h) => h.index)).toEqual([0, 2]);
  });
});

describe('regionLabel', () => {
  it('uses the member’s own words, and names the opening honestly', () => {
    const map = mapDraft(`preamble\n${draft}`, parts('Front Matter', 'Chapter One', 'Chapter Two'));
    expect(regionLabel(map.regions[0])).toBe('Opening pages');
    expect(regionLabel(map.regions[1])).toBe('Front Matter');
  });
});

describe('spliceFrame — a narrowed frame must never become a narrowed save', () => {
  const book = 'Front Matter\n\nA.\n\nChapter Ten\n\nold ten.\n\nChapter Eleven\n\nB.\n';
  const ten = mapDraft(book, parts('Front Matter', 'Chapter Ten', 'Chapter Eleven')).regions[1];

  it('returns the WHOLE draft with only the framed part replaced', () => {
    const full = spliceFrame(book, ten, 'Chapter Ten\n\nrewritten from scratch.\n\n');
    expect(full.startsWith('Front Matter\n\nA.\n\n')).toBe(true);
    expect(full.endsWith('Chapter Eleven\n\nB.\n')).toBe(true);
    expect(full).toContain('rewritten from scratch.');
    expect(full).not.toContain('old ten.');
  });

  it('leaves everything outside the frame byte-identical, even when the part is emptied', () => {
    const full = spliceFrame(book, ten, '');
    expect(full).toBe('Front Matter\n\nA.\n\nChapter Eleven\n\nB.\n');
  });

  it('is the identity edit when nothing is framed', () => {
    expect(spliceFrame(book, null, 'everything replaced')).toBe('everything replaced');
  });

  it('clamps an impossible frame rather than truncating the manuscript', () => {
    expect(spliceFrame(book, { start: 0, end: book.length * 10 }, 'x')).toBe('x');
    expect(spliceFrame(book, { start: book.length + 50, end: book.length + 90 }, 'x')).toBe(
      `${book}x`,
    );
    // An inverted frame inserts; it never deletes backwards.
    expect(spliceFrame('abcdef', { start: 4, end: 2 }, 'X')).toBe('abcdXef');
  });

  it('re-maps cleanly after a framed rewrite — the rail follows the living text', () => {
    const full = spliceFrame(book, ten, 'Chapter Ten\n\nmuch, much longer now.\n\n');
    const after = mapDraft(full, parts('Front Matter', 'Chapter Ten', 'Chapter Eleven'));
    expect(after.adrift).toEqual([]);
    expect(full.slice(after.regions[2].start, after.regions[2].end)).toBe(
      'Chapter Eleven\n\nB.\n',
    );
  });
});

describe('frameAfterEdit — the frame follows its own text', () => {
  it('keeps its start and takes the new length', () => {
    expect(frameAfterEdit({ start: 10, end: 20 }, 'abc')).toEqual({ start: 10, end: 13 });
  });

  it('stays null when nothing is framed', () => {
    expect(frameAfterEdit(null, 'abc')).toBeNull();
  });

  it('survives a keystroke-by-keystroke rewrite without drifting off the part', () => {
    // The property that matters: repeated edits inside a frame never leak into
    // the neighbouring parts, even though the frame moves after each one.
    let content = 'One\n\na\n\nTwo\n\nb\n\nThree\n\nc\n';
    const declared = parts('One', 'Two', 'Three');
    let framed = frameForRegion(content, mapDraft(content, declared), 's2');
    for (const ch of 'xyz') {
      const visible = content.slice(framed!.start, framed!.end) + ch;
      content = spliceFrame(content, framed, visible);
      framed = frameAfterEdit(framed, visible);
    }
    expect(content).toBe('One\n\na\n\nTwo\n\nbxyz\n\nThree\n\nc\n');
    // Nothing was welded together; every part is still on the map.
    expect(mapDraft(content, declared).adrift).toEqual([]);
  });
});

describe('frameForRegion — a frame cannot reach the part below it', () => {
  const book = 'One\n\na\n\nTwo\n\nb\n\nThree\n\nc\n';
  const declared = parts('One', 'Two', 'Three');
  const map = mapDraft(book, declared);

  it('holds the separating blank line outside the frame', () => {
    const frame = frameForRegion(book, map, 's2')!;
    expect(book.slice(frame.start, frame.end)).toBe('Two\n\nb');
    // The region itself still owns those newlines — only the FRAME excludes
    // them, so the map stays a gap-free cover of the draft.
    expect(book.slice(map.regions[1].start, map.regions[1].end)).toBe('Two\n\nb\n\n');
  });

  it('keeps the separator even when the writer empties the part', () => {
    const frame = frameForRegion(book, map, 's2')!;
    const emptied = spliceFrame(book, frame, '');
    expect(emptied).toBe('One\n\na\n\n\n\nThree\n\nc\n');
    // The heading was inside the frame, so emptying the part removed it too —
    // "Two" is now genuinely gone from the draft, and the map says exactly
    // that rather than pretending it is still somewhere.
    expect(mapDraft(emptied, declared).adrift.map((pt) => pt.heading)).toEqual(['Two']);
    // "Three" is untouched: the part below was never in reach.
    const after = mapDraft(emptied, declared);
    expect(emptied.slice(after.regions.at(-1)!.start, after.regions.at(-1)!.end)).toBe(
      'Three\n\nc\n',
    );
  });

  it('lets the last part keep its own tail — there is nothing below it', () => {
    const frame = frameForRegion(book, map, 's3')!;
    expect(book.slice(frame.start, frame.end)).toBe('Three\n\nc\n');
  });

  it('is null for a part that is not on the map', () => {
    expect(frameForRegion(book, map, 'nope')).toBeNull();
    expect(frameForRegion(book, map, null)).toBeNull();
  });
});

describe('scale — a 200-part book must stay a writing surface', () => {
  // The map is rebuilt on every keystroke. If it is not cheap at book scale,
  // framed writing is worse than scrolling, not better.
  const declared: DeclaredPart[] = [];
  const body: string[] = [];
  for (let i = 1; i <= 216; i++) {
    declared.push({ id: `s${i}`, position: i, heading: `Chapter ${i}` });
    body.push(`Chapter ${i}`, '', 'Lorem ipsum dolor sit amet. '.repeat(70), '');
  }
  const book = body.join('\n');

  it('maps a book of this size', () => {
    expect(book.length).toBeGreaterThan(400_000);
    const map = mapDraft(book, declared);
    expect(map.adrift).toEqual([]);
    expect(map.regions).toHaveLength(216);
    expect(map.regions.map((r) => book.slice(r.start, r.end)).join('')).toBe(book);
  });

  it('maps it fast enough to run between keystrokes', () => {
    const began = Date.now();
    for (let i = 0; i < 10; i++) mapDraft(book, declared);
    // Generous, because CI machines vary — this is a guard against an
    // accidental O(n·parts) rewrite, not a benchmark.
    expect(Date.now() - began).toBeLessThan(2000);
  });

  it('does not mistake a chapter title quoted inside a paragraph for the chapter', () => {
    const quoted = 'Chapter One\n\nAs I said in Chapter Two, the point stands.\n\nChapter Two\n\nreal.\n';
    const map = mapDraft(quoted, parts('Chapter One', 'Chapter Two'));
    expect(quoted.slice(map.regions[1].start, map.regions[1].end)).toBe('Chapter Two\n\nreal.\n');
  });
});
