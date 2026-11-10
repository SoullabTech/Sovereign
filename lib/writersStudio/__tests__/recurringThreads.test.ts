import { recurringThreads, markTerm, excerptOf } from '../recurringThreads';

const secs = (...t: string[]) => t.map((text, i) => ({ id: `c${i + 1}`, text }));

describe('recurringThreads · counted, not interpreted', () => {
  it('finds a word that recurs across chapters, with the chapters it is in', () => {
    const r = recurringThreads(secs('Marta held the key by the harbour.', 'The nets were heavy that winter.', 'She lost the key near the water.', 'No one spoke of it.'));
    const key = r.find((t) => t.term === 'key');
    expect(key?.chapterIds).toEqual(['c1', 'c3']);
  });
  it('ignores small and ordinary words, and words in nearly every chapter', () => {
    const r = recurringThreads(secs('the harbour and the quay', 'the harbour at night', 'the harbour again', 'the harbour once more', 'harbour harbour'));
    expect(r.map((t) => t.term)).not.toContain('harbour');   // in every chapter: tells you nothing about any one of them
    expect(r.map((t) => t.term)).not.toContain('the');
  });
  it('a word in only one chapter is not a thread', () => { expect(recurringThreads(secs('lantern lantern', 'nothing here', 'or here')).map((t) => t.term)).not.toContain('lantern'); });
  it('is deterministic and stable-ordered', () => {
    const a = recurringThreads(secs('attention budget clinic', 'attention budget study', 'budget attention evidence', 'clinic study'));
    expect(JSON.stringify(a)).toBe(JSON.stringify(recurringThreads(secs('attention budget clinic', 'attention budget study', 'budget attention evidence', 'clinic study'))));
  });
  it('works for an argument as well as a story (nonfiction vocabulary)', () => {
    const r = recurringThreads(secs('Attention is the scarce resource.', 'The clinic study protected attention.', 'An attention budget is spent.', 'Slowness protects attention.', 'Begin Monday.'));
    expect(r[0]?.term).toBe('attention');
  });
  it('one chapter or none yields nothing', () => { expect(recurringThreads(secs('only one'))).toEqual([]); expect(recurringThreads([])).toEqual([]); });
  it('never returns the writer’s text as anything but their own words (terms are substrings of the manuscript)', () => {
    const text = 'Marta kept the lantern; the lantern burned. A lantern, always.';
    const r = recurringThreads([{ id: 'a', text }, { id: 'b', text }]);
    for (const t of r) expect(text.toLowerCase()).toContain(t.term);
  });
});

describe('markTerm · whole words only', () => {
  it('marks whole-word, case-insensitive occurrences', () => {
    expect(markTerm('The Key and the keys, a key.', 'key').filter((p) => p.hit).map((p) => p.text)).toEqual(['Key', 'key']);
  });
  it('returns the paragraph untouched with no term', () => { expect(markTerm('abc', null)).toEqual([{ text: 'abc', hit: false }]); });
  it('never loses or adds a character', () => {
    const p = 'She lost the key near the water; the key was never found.';
    expect(markTerm(p, 'key').map((x) => x.text).join('')).toBe(p);
  });
});

describe('excerptOf', () => {
  it('cuts at a word and says it cut; never pads', () => {
    const e = excerptOf('word '.repeat(200), 50); expect(e.cut).toBe(true); expect(e.text.length).toBeLessThanOrEqual(50); expect(e.text.endsWith('wor')).toBe(false);
    expect(excerptOf('short', 50)).toEqual({ text: 'short', cut: false });
  });
});
