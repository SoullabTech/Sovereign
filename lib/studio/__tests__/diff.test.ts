import { CONTEXT_LINES, diffLines, MAX_DIFF_LINES, toHunks } from '../diff';

describe('diffLines', () => {
  it('reports no change between identical texts', () => {
    const d = diffLines('one\ntwo', 'one\ntwo');
    expect(d.added).toBe(0);
    expect(d.removed).toBe(0);
    expect(d.lines.every((l) => l.kind === 'same')).toBe(true);
  });

  it('sees an inserted paragraph as added, not as everything rewritten', () => {
    const d = diffLines('one\nthree', 'one\ntwo\nthree');
    expect(d.added).toBe(1);
    expect(d.removed).toBe(0);
    expect(d.lines.find((l) => l.kind === 'added')!.text).toBe('two');
  });

  it('sees a deleted paragraph as removed', () => {
    const d = diffLines('one\ntwo\nthree', 'one\nthree');
    expect(d.removed).toBe(1);
    expect(d.added).toBe(0);
  });

  it('sees a rewritten line as one removal and one addition', () => {
    const d = diffLines('the fire burns', 'the water flows');
    expect(d.added).toBe(1);
    expect(d.removed).toBe(1);
  });

  it('carries line numbers on the side each line exists in', () => {
    const d = diffLines('one\nthree', 'one\ntwo\nthree');
    const added = d.lines.find((l) => l.kind === 'added')!;
    expect(added.beforeLine).toBeNull();
    expect(added.afterLine).toBe(2);
    const same = d.lines.find((l) => l.text === 'three')!;
    expect(same.beforeLine).toBe(2);
    expect(same.afterLine).toBe(3);
  });

  it('handles an empty side without losing the other', () => {
    expect(diffLines('', 'one\ntwo').added).toBe(2);
    expect(diffLines('one\ntwo', '').removed).toBe(2);
  });

  it('refuses a comparison too large to compute rather than freezing', () => {
    const huge = 'x\n'.repeat(MAX_DIFF_LINES + 10);
    const d = diffLines(huge, huge);
    expect(d.tooLarge).toBe(true);
    expect(d.lines).toEqual([]);
  });

  it('every line of both versions is accounted for exactly once', () => {
    const before = 'a\nb\nc\nd';
    const after = 'a\nx\nc\nd\ne';
    const d = diffLines(before, after);
    const reconstructedBefore = d.lines
      .filter((l) => l.kind !== 'added')
      .map((l) => l.text)
      .join('\n');
    const reconstructedAfter = d.lines
      .filter((l) => l.kind !== 'removed')
      .map((l) => l.text)
      .join('\n');
    expect(reconstructedBefore).toBe(before);
    expect(reconstructedAfter).toBe(after);
  });
});

describe('toHunks', () => {
  const long = (n: number) => Array.from({ length: n }, (_, i) => `line ${i}`).join('\n');

  it('keeps everything when everything changed', () => {
    const d = diffLines('a\nb', 'c\nd');
    const hunks = toHunks(d.lines);
    expect(hunks.every((h) => h.kind === 'lines')).toBe(true);
  });

  it('collapses a long unchanged run and REPORTS how much it stands for', () => {
    const before = `${long(60)}\nthe fire burns`;
    const after = `${long(60)}\nthe water flows`;
    const hunks = toHunks(diffLines(before, after).lines);
    const collapsed = hunks.filter((h) => h.kind === 'collapsed');
    expect(collapsed.length).toBeGreaterThan(0);
    expect(collapsed[0].count).toBeGreaterThan(0);
  });

  it('keeps context either side of a change', () => {
    const before = `${long(30)}\nfire\n${long(30)}`;
    const after = `${long(30)}\nwater\n${long(30)}`;
    const hunks = toHunks(diffLines(before, after).lines);
    const shown = hunks.filter((h) => h.kind === 'lines').flatMap((h) => h.lines);
    // The changed pair plus context either side of each.
    expect(shown.length).toBeGreaterThanOrEqual(CONTEXT_LINES * 2);
    expect(shown.some((l) => l.text === 'fire')).toBe(true);
    expect(shown.some((l) => l.text === 'water')).toBe(true);
  });

  it('loses no line: shown plus collapsed equals the whole diff', () => {
    const before = `${long(50)}\nfire`;
    const after = `${long(50)}\nwater`;
    const d = diffLines(before, after);
    const hunks = toHunks(d.lines);
    const total = hunks.reduce((sum, h) => sum + h.count, 0);
    expect(total).toBe(d.lines.length);
  });
});
