/**
 * ASTRO-PRO-GRID-01 — declinations against known astronomical facts.
 */
import { calculateDeclinations, declinationPairs } from '../lib/astrology/proDeclinations';

describe('Pro declinations', () => {
  it('puts the Sun at the obliquity on the June solstice and near 0 at the equinox', () => {
    const solstice = calculateDeclinations('2000-06-21T01:48:00Z').find((d) => d.body === 'Sun')!;
    expect(solstice.declination).toBeCloseTo(23.44, 1);
    expect(solstice.outOfBounds).toBe(false);
    const equinox = calculateDeclinations('2000-03-20T07:35:00Z').find((d) => d.body === 'Sun')!;
    expect(Math.abs(equinox.declination)).toBeLessThan(0.05);
  });

  it('returns the ten bodies and refuses an invalid instant', () => {
    expect(calculateDeclinations('2027-08-03T12:00:00Z')).toHaveLength(10);
    expect(() => calculateDeclinations('not a date')).toThrow();
  });

  it('pairs parallels on the same side and contraparallels across the equator', () => {
    const pairs = declinationPairs([
      { body: 'Sun', declination: 10, outOfBounds: false },
      { body: 'Moon', declination: 10.5, outOfBounds: false },
      { body: 'Mars', declination: -10.2, outOfBounds: false },
      { body: 'Venus', declination: 22, outOfBounds: false },
    ], 1);
    expect(pairs).toEqual(expect.arrayContaining([
      { a: 'Sun', b: 'Moon', type: 'parallel', orb: 0.5 },
      { a: 'Sun', b: 'Mars', type: 'contraparallel', orb: 0.2 },
    ]));
    expect(pairs.some((p) => p.a === 'Venus' || p.b === 'Venus')).toBe(false);
  });
});
