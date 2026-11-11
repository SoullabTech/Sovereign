/**
 * Mean Black Moon Lilith is the mean lunar APOGEE. Physical check, independent
 * of the formula: at every real apogee astronomy-engine finds, the Moon's
 * longitude is near the mean apogee (within a few degrees on average) and
 * about 180° from the mean perigee.
 */
import * as Astronomy from 'astronomy-engine';
import { calculateBirthChart } from '@/lib/astrology/ephemerisCalculator';
import { calculateBirthChart as calculateProChart } from '@/lib/astrology/proEphemerisCalculator';

const SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
const lonOf = (p: { sign: string; degree: number }) => SIGNS.indexOf(p.sign) * 30 + p.degree;
const diff = (a: number, b: number) => Math.abs(((a - b + 540) % 360) - 180);

describe('Lilith is the mean apogee', () => {
  it('sits on average near the Moon at real apogees, not opposite them', async () => {
    let apsis = Astronomy.SearchLunarApsis(new Date('1995-01-01T00:00:00Z'));
    const apogees: Date[] = [];
    while (apogees.length < 12) {
      if (apsis.kind === Astronomy.ApsisKind.Apocenter) apogees.push(apsis.time.date);
      apsis = Astronomy.NextLunarApsis(apsis);
    }
    let total = 0;
    for (const when of apogees) {
      const iso = when.toISOString();
      const chart: any = await calculateBirthChart({
        date: iso.slice(0, 10), time: iso.slice(11, 16), location: { lat: 40, lng: 0, timezone: 'UTC' }, houseSystem: 'whole-sign',
      } as any);
      total += diff(lonOf(chart.lilith), chart.moon ? lonOf(chart.moon) : 0);
    }
    expect(total / apogees.length).toBeLessThan(15); // a perigee-based Lilith would average ~177°
  });
  it('J2000 value: 23° Sagittarius (263.35°) in both calculators', async () => {
    const input = { date: '2000-01-01', time: '12:00', location: { lat: 40, lng: 0, timezone: 'UTC' }, houseSystem: 'whole-sign' } as any;
    for (const calc of [calculateBirthChart, calculateProChart]) {
      const chart: any = await (calc as any)(input);
      expect(Math.abs(lonOf(chart.lilith) - 263.353)).toBeLessThan(0.05);
    }
  });
});
