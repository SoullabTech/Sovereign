/**
 * Planet positions and apparent motion against values computed outside the
 * code under test: the JPL "Keplerian elements for approximate positions"
 * (1800-2050) for the planets, Meeus's lunar series for the Moon, and Meeus's
 * solar position for the Sun, each precessed to the date. Positions are
 * geocentric ecliptic longitudes of date at 12:00 UT.
 *
 * Tolerances: 0.05° for most bodies; Jupiter and Saturn 0.2° because that
 * element table is itself only good to about 0.1-0.15° for them.
 *
 * Retrograde states are from apparent motion over +/-12 hours of the same
 * independent model. Before this test, the Free chart reported no planet as
 * retrograde (it called a heliocentric longitude, which never decreases).
 */
import { calculateBirthChart } from '@/lib/astrology/ephemerisCalculator';

const SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
const BODIES = ['sun','moon','mercury','venus','mars','jupiter','saturn','uranus','neptune','pluto'] as const;

const REFERENCE: Record<string, Record<string, number> & { retro?: never }> & any = {
  '2003-09-03': { sun: 160.59, moon: 250.262, mercury: 174.565, venus: 164.904, mars: 333.517, jupiter: 151.561, saturn: 100.713, uranus: 330.432, neptune: 311.019, pluto: 257.253, retro: ['mercury','mars','uranus','neptune'] },
  '1990-01-27': { sun: 307.293, moon: 315.888, mercury: 282.739, venus: 293.789, mars: 268.5, jupiter: 92.177, saturn: 288.66, uranus: 277.291, neptune: 283.002, pluto: 227.63, retro: ['venus','jupiter'] },
  '2026-11-07': { sun: 225.091, moon: 204.356, mercury: 218.614, venus: 203.728, mars: 141.818, jupiter: 145.088, saturn: 8.976, uranus: 64.424, neptune: 1.94, pluto: 303.18, retro: ['mercury','venus','saturn','uranus','neptune'] },
};
const diff = (a: number, b: number) => Math.abs(((a - b + 540) % 360) - 180);

describe.each(Object.keys(REFERENCE))('%s 12:00 UT', (date) => {
  let chart: any;
  beforeAll(async () => {
    chart = await calculateBirthChart({
      date, time: '12:00', location: { lat: 40, lng: 0, timezone: 'UTC' }, houseSystem: 'whole-sign',
    } as any);
  });
  it.each(BODIES)('%s longitude matches the independent reference', (body) => {
    const lon = SIGNS.indexOf(chart[body].sign) * 30 + chart[body].degree;
    const tol = body === 'jupiter' || body === 'saturn' ? 0.2 : 0.05;
    expect(diff(lon, REFERENCE[date][body])).toBeLessThan(tol);
  });
  it('retrograde planets match apparent motion', () => {
    const got = BODIES.filter((b) => b !== 'sun' && b !== 'moon' && chart[b].retrograde);
    expect([...got].sort()).toEqual([...REFERENCE[date].retro].sort());
  });
});
