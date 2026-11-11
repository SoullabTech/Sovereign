/**
 * The Pro house wheel is fed only from the calculated chart. For Owen's chart
 * (3 Sep 2003, 08:15 New Haven; independent Meeus/ASC values: Sun 10.59° Virgo,
 * ASC 2.40° Libra) the wheel must receive those placements, every house value
 * must be 1–12, withheld asteroids must be absent, and aspects must be limited
 * to the five the wheel draws between bodies it actually plots.
 */
import { calculateBirthChart } from '@/lib/astrology/proEphemerisCalculator';
import { wheelPlanets, wheelAspects } from '@/lib/astrology/proHouseWheel';

describe('Pro house wheel inputs', () => {
  let chart: any;
  beforeAll(async () => {
    chart = await calculateBirthChart({
      date: '2003-09-03', time: '08:15',
      location: { lat: 41.3083, lng: -72.9279, timezone: 'America/New_York' },
    } as any);
  });

  it('places the Sun at 10.6° Virgo as independently computed', () => {
    const sun = wheelPlanets(chart).find((p) => p.name === 'Sun')!;
    expect(sun.sign).toBe('Virgo');
    expect(sun.degree).toBeCloseTo(10.59, 1);
  });

  it('gives every plotted body a house from 1 to 12', () => {
    const planets = wheelPlanets(chart);
    expect(planets.length).toBeGreaterThanOrEqual(10);
    for (const p of planets) expect(p.house).toBeGreaterThanOrEqual(1), expect(p.house).toBeLessThanOrEqual(12);
  });

  it('does not show the withheld asteroids', () => {
    const names = wheelPlanets(chart).map((p) => p.name);
    for (const n of ['Pallas', 'Juno', 'Vesta']) expect(names).not.toContain(n);
  });

  it('keeps only the five major aspects between plotted bodies', () => {
    const names = new Set(wheelPlanets(chart).map((p) => p.name));
    const aspects = wheelAspects(chart);
    expect(aspects.length).toBeGreaterThan(0);
    for (const a of aspects) {
      expect(['conjunction', 'sextile', 'square', 'trine', 'opposition']).toContain(a.type);
      expect(names.has(a.planet1) && names.has(a.planet2)).toBe(true);
    }
  });
});
