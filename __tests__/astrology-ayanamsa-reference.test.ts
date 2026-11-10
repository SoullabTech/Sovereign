/**
 * Ayanamsa against its published definitions, not against the previous linear
 * fit. Anchors (outside the code under test):
 *  - Lahiri was fixed by the Calendar Reform Committee at 23°15'00.658" on
 *    1956-03-21 (a true value, 23.250183°).
 *  - True Lahiri at J2000 is 23°51'11" (23.8531°).
 *  - Krishnamurti is about 5'48" (0.0966°) less than Lahiri.
 *  - True Chitra holds Spica (J2000 longitude 203.84136°, from RA 13h25m11.579s
 *    Dec -11°09'40.75") at 0° Libra, so it sits 0.0118° under Lahiri at J2000
 *    before nutation, which both include.
 */
import { calculateAyanamsa, compareAyanamsas } from '@/lib/astrology/ayanamsaCalculator';

const at = (iso: string) => new Date(iso);

describe('ayanamsa', () => {
  it('Lahiri equals its defining value on 1956-03-21', () => {
    expect(Math.abs(calculateAyanamsa(at('1956-03-21T00:00:00Z'), 'lahiri') - 23.250183)).toBeLessThan(0.0005);
  });
  it('Lahiri at J2000 is 23°51\'11"', () => {
    expect(Math.abs(calculateAyanamsa(at('2000-01-01T12:00:00Z'), 'lahiri') - 23.8531)).toBeLessThan(0.0005);
  });
  it('Krishnamurti is about 5\'48" under Lahiri, steadily', () => {
    for (const iso of ['1950-01-01T00:00:00Z', '2003-09-03T12:15:00Z', '2026-11-07T00:00:00Z']) {
      const d = compareAyanamsas(at(iso), 'lahiri', 'krishnamurti');
      expect(d).toBeGreaterThan(0.0955);
      expect(d).toBeLessThan(0.0975);
    }
  });
  it('True Chitra follows Spica: 0.0157° under Lahiri on the mean, close to it overall', () => {
    const d = compareAyanamsas(at('2000-01-01T12:00:00Z'), 'lahiri', 'true_chitra');
    expect(d).toBeGreaterThan(0.012);
    expect(d).toBeLessThan(0.019);
  });
  it('advances about 50.3 arcseconds a year', () => {
    const a = calculateAyanamsa(at('2010-06-01T00:00:00Z'), 'lahiri');
    const b = calculateAyanamsa(at('2011-06-01T00:00:00Z'), 'lahiri');
    expect(Math.abs((b - a) * 3600 - 50.3)).toBeLessThan(0.9); // nutation adds up to ~±0.9"/yr
  });
  it('is the true value: it carries the 18.6-year nutation wobble', () => {
    const wobble: number[] = [];
    for (let y = 2000; y <= 2010; y++) {
      wobble.push(calculateAyanamsa(at(`${y}-01-01T00:00:00Z`), 'lahiri') - 0.01397 * (y - 2000));
    }
    expect(Math.max(...wobble) - Math.min(...wobble)).toBeGreaterThan(0.002);
  });
});
