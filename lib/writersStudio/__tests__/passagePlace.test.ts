import { passagePlaceLabel } from '../passagePlace';

const body = 'First paragraph here.\n\nSecond one, longer.\n\nThird.';
const s = (heading: string | null, position = 0) => ({ heading, position });

test('names the section by its heading, or "Section N" as the page does — never "Selected passage"', () => {
  expect(passagePlaceLabel(s('The Hill'), body, null)).toBe('The Hill');
  expect(passagePlaceLabel(s(null, 2), body, null)).toBe('Section 3');
  expect(passagePlaceLabel(s('  '), body, null)).toBe('Section 1');
});

test('adds which paragraph the writer is in', () => {
  expect(passagePlaceLabel(s(null), body, { start: 0, end: 21 })).toBe('Section 1 · paragraph 1');
  const second = body.indexOf('Second');
  expect(passagePlaceLabel(s(null), body, { start: second, end: second + 6 })).toBe('Section 1 · paragraph 2');
  expect(passagePlaceLabel(s(null), body, { start: 0, end: body.indexOf('Third') + 3 })).toBe('Section 1 · paragraphs 1–3');
});
