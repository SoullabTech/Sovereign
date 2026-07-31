import { isValidNoteDate } from '../noteDate';

describe('isValidNoteDate', () => {
  it('accepts a calendar date in YYYY-MM-DD form', () => {
    expect(isValidNoteDate('2026-07-30')).toBe(true);
  });

  it('accepts a real leap day', () => {
    expect(isValidNoteDate('2024-02-29')).toBe(true);
  });

  // The defect condition this guard exists for: well-formed but nonexistent.
  // Without the guard these reach `$n::date` and Postgres raises, producing a 500
  // for what is a bad request. A test that only passed valid dates would not
  // exercise the failure at all.
  it('rejects a well-formed date that does not exist', () => {
    expect(isValidNoteDate('2026-02-30')).toBe(false);
  });

  it('rejects Feb 29 in a non-leap year', () => {
    expect(isValidNoteDate('2026-02-29')).toBe(false);
  });

  it('rejects an out-of-range month', () => {
    expect(isValidNoteDate('2026-13-01')).toBe(false);
  });

  it('rejects unpadded components', () => {
    expect(isValidNoteDate('2026-7-30')).toBe(false);
  });

  it('rejects non-date strings and non-strings', () => {
    for (const value of ['not-a-date', '', '2026-07-30T00:00:00Z', null, undefined, {}, 20260730]) {
      expect(isValidNoteDate(value)).toBe(false);
    }
  });
});
