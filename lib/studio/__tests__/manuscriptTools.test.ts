import { replacePreview, replaceRanges } from '../manuscriptTools';

const TEXT = 'fire and fire and fire';
const HITS = [
  { start: 0, end: 4 },
  { start: 9, end: 13 },
  { start: 18, end: 22 },
];

describe('replaceRanges — only what the writer was shown', () => {
  it('replaces every given range and leaves the rest alone', () => {
    const { next, replaced } = replaceRanges(TEXT, HITS, 'water');
    expect(next).toBe('water and water and water');
    expect(replaced).toBe(3);
  });

  it('replaces just one range when just one was chosen', () => {
    expect(replaceRanges(TEXT, [HITS[1]], 'water').next).toBe('fire and water and fire');
  });

  it('stays correct when the replacement is shorter', () => {
    expect(replaceRanges(TEXT, HITS, 'x').next).toBe('x and x and x');
  });

  it('stays correct when the ranges arrive out of order', () => {
    expect(replaceRanges(TEXT, [HITS[2], HITS[0], HITS[1]], 'x').next).toBe('x and x and x');
  });

  it('refuses overlapping ranges rather than producing garbage', () => {
    expect(() =>
      replaceRanges(TEXT, [{ start: 0, end: 4 }, { start: 2, end: 6 }], 'z'),
    ).toThrow('Overlapping ranges');
  });

  it('refuses a range outside the text', () => {
    expect(() => replaceRanges(TEXT, [{ start: 0, end: 9999 }], 'z')).toThrow('out of bounds');
  });

  it('does not mutate the text it was given', () => {
    replaceRanges(TEXT, HITS, 'water');
    expect(TEXT).toBe('fire and fire and fire');
  });

  it('replaces nothing when given nothing', () => {
    expect(replaceRanges(TEXT, [], 'water')).toEqual({ next: TEXT, replaced: 0 });
  });
});

describe('replacePreview', () => {
  it('shows how the line will read, not just a count', () => {
    expect(replacePreview({ before: 'the ', after: ' burns low' }, 'water')).toBe(
      'the water burns low',
    );
  });
});
