/**
 * Free Placidus and Koch must return real Placidus/Koch cusps, not Porphyry.
 * Reference cusps come from an independent implementation (bisection on the
 * defining property for Placidus; direct semi-arc trisection for Koch), run
 * outside this codebase for the three births below. Tolerance 0.02° covers the
 * small sidereal-time convention difference (~0.003°).
 */
import { calculateBirthChart } from '@/lib/astrology/ephemerisCalculator';

const CASES = [
  { name: 'New Haven 2003-09-03 12:15 UT', date: '2003-09-03', time: '12:15', lat: 41.3083, lng: -72.9279,
    placidus: { 2: 208.5385, 3: 239.0643, 11: 126.4187, 12: 156.6761 },
    koch: { 2: 211.8059, 3: 241.0481, 11: 123.7584, 12: 152.9472 } },
  { name: 'London 1990-06-15 06:30 UT', date: '1990-06-15', time: '06:30', lat: 51.5074, lng: -0.1278,
    placidus: { 2: 133.1371, 3: 153.1438, 11: 39.4445, 12: 83.0813 },
    koch: { 2: 138.4557, 3: 159.5108, 11: 60.1109, 12: 93.2155 } },
  { name: 'Sydney 1985-12-01 22:10 UT', date: '1985-12-01', time: '22:10', lat: -33.8688, lng: 151.2093,
    placidus: { 2: 318.9656, 3: 344.5634, 11: 231.0528, 12: 266.0191 },
    koch: { 2: 322.989, 3: 349.1917, 11: 237.7927, 12: 269.954 } },
] as const;

const diff = (a: number, b: number) => Math.abs(((a - b + 540) % 360) - 180);

describe.each(CASES)('$name', (c) => {
  for (const system of ['placidus', 'koch'] as const) {
    it(`${system} cusps match the independent reference`, async () => {
      const chart = await calculateBirthChart({
        date: c.date, time: c.time, location: { lat: c.lat, lng: c.lng, timezone: 'UTC' }, houseSystem: system,
      } as any);
      expect(chart.houseSystemApplied).toBe(system);
      for (const [house, expected] of Object.entries(c[system])) {
        expect(diff(chart.houses[Number(house) - 1], expected)).toBeLessThan(0.02);
      }
    });
  }
  it('placidus differs from porphyry (the old fallback)', async () => {
    const loc = { lat: c.lat, lng: c.lng, timezone: 'UTC' };
    const p = await calculateBirthChart({ date: c.date, time: c.time, location: loc, houseSystem: 'placidus' } as any);
    const f = await calculateBirthChart({ date: c.date, time: c.time, location: loc, houseSystem: 'porphyry' } as any);
    expect(diff(p.houses[1], f.houses[1])).toBeGreaterThan(0.5);
  });
});

describe('polar latitude', () => {
  it('falls back to Porphyry and says so', async () => {
    const chart = await calculateBirthChart({
      date: '2003-12-21', time: '12:00', location: { lat: 78.2, lng: 15.6, timezone: 'UTC' }, houseSystem: 'placidus',
    } as any);
    expect(chart.houseSystemApplied).toBe('porphyry');
  });
});
