/**
 * Dreamspell Kin calibration. Anchors: 26 Jul 1987 = Kin 34; 21 Dec 2012 =
 * Kin 207 (Blue Crystal Hand); 3 Sep 2003 = Kin 193, Red Spectral Skywalker,
 * Blue Night wavespell (the case that exposed a 30-Kin offset).
 *
 * This is the Dreamspell count only. The traditional GMT count for the same
 * date is 13 Akbal, 11 Mol, 12.19.10.10.3 — a different system, not covered here.
 */
import { dreamspellKin, calculateMayanBirthSign } from '@/lib/astrology/mayanAstrology';

const d = (s: string) => new Date(`${s}T12:00:00.000Z`);

describe('dreamspellKin', () => {
  it('matches known anchors', () => {
    expect(dreamspellKin(d('1987-07-26'))).toBe(34);
    expect(dreamspellKin(d('2012-12-21'))).toBe(207);
    expect(dreamspellKin(d('2003-09-03'))).toBe(193);
  });
  it('skips 29 February', () => {
    expect(dreamspellKin(d('2000-02-29'))).toBe(dreamspellKin(d('2000-02-28')));
    expect(dreamspellKin(d('2000-03-01'))).toBe((dreamspellKin(d('2000-02-28')) % 260) + 1);
  });
  it('counts dates before the epoch', () => {
    expect(dreamspellKin(d('1987-07-25'))).toBe(33);
    expect(dreamspellKin(d('1900-01-01'))).toBeGreaterThanOrEqual(1);
  });
});

describe('calculateMayanBirthSign', () => {
  it('3 Sep 2003 is Kin 193, tone 11, Ben, Akbal wavespell', () => {
    const s = calculateMayanBirthSign(d('2003-09-03'));
    expect(s.tzolkinNumber).toBe(193);
    expect(s.tone.number).toBe(11);
    expect(s.daySign.name).toBe('Ben');
    expect(s.wavespell).toBe('Akbal Wavespell');
  });
});
