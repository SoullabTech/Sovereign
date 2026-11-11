/**
 * Four Pillars against published values, not against the code under test.
 *
 *  - 2000-01-01 (noon) is 己卯 year, 丙子 month, 戊午 day (the year has not
 *    turned: Lichun is in February), and 2000-01-07 is a 甲子 day.
 *  - Mao Zedong, 1893-12-26 about 08:00 China time: 癸巳 甲子 丁酉 甲辰.
 *  - The year pillar turns at Lichun, not on 1 January.
 */
import { generateFourPillars } from '@/app/api/_backend/src/services/fourPillarsService';
import * as Astronomy from 'astronomy-engine';
import { lichun, daYunStartAgeExact } from '@/lib/astrology/fourPillarsCore';

// The Jie moment, found here directly from the Sun's longitude (independent of the module under test).
const jieAfter = (instant: Date) => {
  const lon = Astronomy.SunPosition(instant).elon;
  const next = (Math.floor(((lon - 315 + 360) % 360) / 30) + 1) * 30 + 315;
  return Astronomy.SearchSunLongitude(next % 360, instant, 40)!.date;
};

const text = (p: { stem: string; branch: string }) => `${p.stem}-${p.branch}`;
const pillars = (iso: string, tz = 480) => {
  const f = generateFourPillars(new Date(iso), tz);
  return [f.year, f.month, f.day, f.hour].map(text);
};

describe('Four Pillars reference values', () => {
  it('2000-01-01 noon China time: 己卯 丙子 戊午 戊午', () => {
    expect(pillars('2000-01-01T04:00:00Z')).toEqual(['Ji-Mao', 'Bing-Zi', 'Wu-Wu', 'Wu-Wu']);
  });
  it('2000-01-07 is a Jiazi day', () => {
    expect(pillars('2000-01-07T04:00:00Z')[2]).toBe('Jia-Zi');
  });
  it('Mao Zedong 1893-12-26 08:00: 癸巳 甲子 丁酉 甲辰', () => {
    expect(pillars('1893-12-26T00:00:00Z')).toEqual(['Gui-Si', 'Jia-Zi', 'Ding-You', 'Jia-Chen']);
  });
  it('the year pillar turns at Lichun, not 1 January and not Chinese New Year', () => {
    const li = lichun(1984);
    const before = new Date(li.getTime() - 3_600_000);
    const after = new Date(li.getTime() + 3_600_000);
    expect(text(generateFourPillars(before, 0).year)).toBe('Gui-Hai'); // 1983
    expect(text(generateFourPillars(after, 0).year)).toBe('Jia-Zi');   // 1984
    expect(text(generateFourPillars(new Date('1984-01-15T12:00:00Z'), 0).year)).toBe('Gui-Hai');
  });
  it('the month pillar turns at the Jie moment, not on a calendar day', () => {
    const endsAt = jieAfter(new Date('2003-09-03T12:15:00Z'));
    const a = generateFourPillars(new Date(endsAt.getTime() - 60_000), 0).month;
    const b = generateFourPillars(new Date(endsAt.getTime() + 60_000), 0).month;
    expect(text(a)).not.toBe(text(b));
  });
  it('late Zi (23:00-24:00) continues the same day: Jia day 23:30 is 丙子', () => {
    const jiaDayLate = pillars('2000-01-07T15:30:00Z'); // 23:30 China time
    expect(jiaDayLate[2]).toBe('Jia-Zi');
    expect(jiaDayLate[3]).toBe('Bing-Zi');
  });
});

describe('Da Yun start age', () => {
  it('counts three days per year from the previous Jie (backward)', () => {
    const exact = daYunStartAgeExact(new Date('1893-12-26T00:00:00Z'), 'backward');
    expect(exact).toBeGreaterThan(6.2);
    expect(exact).toBeLessThan(6.6);
  });
  it('counts to the next Jie going forward', () => {
    const born = new Date('2003-09-03T12:15:00Z');
    const days = (jieAfter(born).getTime() - born.getTime()) / 86_400_000;
    // Reported to whole months, so within half a month (1/24 year) of days / 3.
    expect(Math.abs(daYunStartAgeExact(born, 'forward') - days / 3)).toBeLessThan(1 / 24 + 1e-9);
  });
});
