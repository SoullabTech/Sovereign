/**
 * Placidus and Koch house cusps against independent Swiss Ephemeris references.
 * ALL CASES ARE PUBLIC/SYNTHETIC.
 *
 * References generated outside the Soullab code by
 * scripts/astrology/generate-swiss-quadrant-houses.py using PySwissEph
 * 2.10.03 (Moshier backend, FLG_MOSEPH), houses_ex systems 'P' and 'K'.
 * Same tolerance as the existing O/E/W fixtures. These are numerical
 * reference fixtures, not evidence about astrological interpretation.
 */
import { calculateBirthChart } from '../proEphemerisCalculator';
import { admitProCalculation } from '../proCalculationPolicy';

const delta = (a: number, b: number) => Math.abs((((a - b) % 360) + 540) % 360 - 180);

const fixtures: Array<{ label: string; utc: string; lat: number; lng: number; placidus: number[]; koch: number[] }> = [
 { label: "J2000 Greenwich", utc: '2000-01-01T12:00:00Z', lat: 0, lng: 0,
   placidus: [11.3739, 42.90665, 71.96085, 99.61109, 128.04052, 158.84942, 191.3739, 222.90665, 251.96085, 279.61109, 308.04052, 338.84942],
   koch: [11.3739, 42.90665, 71.96085, 99.61109, 128.04052, 158.84942, 191.3739, 222.90665, 251.96085, 279.61109, 308.04052, 338.84942] },
 { label: "New York ordinary spring 1985", utc: '1985-03-15T19:30:00Z', lat: 40.7128, lng: -74.006,
   placidus: [134.20419, 155.53701, 181.77918, 214.08791, 250.2359, 284.60831, 314.20419, 335.53701, 1.77918, 34.08791, 70.2359, 104.60831],
   koch: [134.20419, 160.68819, 187.46147, 214.08791, 256.59606, 287.29313, 314.20419, 340.68819, 7.46147, 34.08791, 76.59606, 107.29313] },
 { label: "Connecticut autumn 2026", utc: '2026-10-12T18:00:00Z', lat: 41.383, lng: -72.9,
   placidus: [285.66985, 329.28201, 10.49891, 40.84905, 63.86623, 84.08272, 105.66985, 149.28201, 190.49891, 220.84905, 243.86623, 264.08272],
   koch: [285.66985, 317.02779, 358.71363, 40.84905, 60.71225, 81.59238, 105.66985, 137.02779, 178.71363, 220.84905, 240.71225, 261.59238] },
 { label: "Sydney southern hemisphere 2026", utc: '2026-10-15T22:30:00Z', lat: -33.8688, lng: 151.2093,
   placidus: [260.64372, 282.98216, 305.26193, 331.14035, 3.83354, 42.87751, 80.64372, 102.98216, 125.26193, 151.14035, 183.83354, 222.87751],
   koch: [260.64372, 285.51406, 308.43699, 331.14035, 12.55207, 50.66129, 80.64372, 105.51406, 128.43699, 151.14035, 192.55207, 230.66129] },
 { label: "Quito equatorial 2026", utc: '2026-05-24T11:12:00Z', lat: -0.1807, lng: -78.4678,
   placidus: [63.55127, 91.4222, 119.42311, 149.49053, 181.74545, 213.81698, 243.55127, 271.4222, 299.42311, 329.49053, 1.74545, 33.81698],
   koch: [63.55127, 91.40964, 119.40424, 149.49053, 181.71683, 213.78997, 243.55127, 271.40964, 299.40424, 329.49053, 1.71683, 33.78997] },
 { label: "Reykjavik high latitude 1990", utc: '1990-06-15T18:30:00Z', lat: 64.1466, lng: -21.9426,
   placidus: [219.26117, 245.65778, 288.76385, 337.65329, 7.83112, 26.62409, 39.26117, 65.65778, 108.76385, 157.65329, 187.83112, 206.62409],
   koch: [219.26117, 239.12482, 260.68267, 337.65329, 358.3112, 19.01729, 39.26117, 59.12482, 80.68267, 157.65329, 178.3112, 199.01729] },
];

describe('Pro quadrant houses vs Swiss Ephemeris', () => {
  for (const c of fixtures) {
    for (const system of ['placidus', 'koch'] as const) {
      it(system + ': ' + c.label, async () => {
        const iso = new Date(c.utc).toISOString();
        const admission = admitProCalculation({
          date: iso.slice(0, 10), time: iso.slice(11, 16),
          location: { lat: c.lat, lng: c.lng, timezone: 'UTC' }, houseSystem: system,
        });
        expect(admission.ok).toBe(true);
        if (!admission.ok) return;
        const chart = await calculateBirthChart(admission.birthData);
        const worst = Math.max(...chart.houses.map((cusp, i) => delta(cusp, c[system][i])));
        expect(worst).toBeLessThanOrEqual(0.025);
      });
    }
  }

  it('fails a Porphyry substitute, so the check can tell the methods apart', async () => {
    const c = fixtures[1];
    const iso = new Date(c.utc).toISOString();
    const admission = admitProCalculation({ date: iso.slice(0, 10), time: iso.slice(11, 16), location: { lat: c.lat, lng: c.lng, timezone: 'UTC' }, houseSystem: 'porphyry' });
    if (!admission.ok) throw new Error('admission');
    const porphyry = await calculateBirthChart(admission.birthData);
    expect(Math.max(...porphyry.houses.map((cusp, i) => delta(cusp, c.placidus[i])))).toBeGreaterThan(1);
  });
});
