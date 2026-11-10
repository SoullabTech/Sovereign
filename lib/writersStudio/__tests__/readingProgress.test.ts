import { readingProgressText, LONG_READ_MS } from '../readingProgress';

test('the first seconds show only the stage', () => { expect(readingProgressText('MAIA is reading the chapter…', 4_000)).toBe('MAIA is reading the chapter…'); });
test('then elapsed time, so slow never looks like stuck', () => { expect(readingProgressText('MAIA is reading the chapter…', 83_000)).toBe('MAIA is reading the chapter… (1:23 so far)'); });
test('after a few minutes, an honest note: it may still finish, keep the page open, writing unaffected; never a made-up estimate', () => {
  const t = readingProgressText('MAIA is reading the chapter…', LONG_READ_MS + 5_000);
  expect(t).toMatch(/3:05 so far/);
  expect(t).toMatch(/may still finish/);
  expect(t).toMatch(/Your writing is not affected/);
  expect(t).not.toMatch(/%|remaining|almost done/i);
});
