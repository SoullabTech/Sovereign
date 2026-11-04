/**
 * ASTRO-PRO-COMPARE-01 — cross-aspects and the midpoint composite.
 */
import type { BirthChart, PlanetPosition } from '../lib/astrology/proEphemerisCalculator';
import { chartBodies } from '../lib/astrology/proChartGeometry';
import { compositeChart, crossAspects, midpoint } from '../lib/astrology/proComparison';

const SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
const at = (lon: number, house = 1): PlanetPosition => ({ sign: SIGNS[Math.floor(lon / 30)], degree: lon % 30, house, retrograde: false });

function chart(sun: number, moon: number, asc: number, mc: number): BirthChart {
  const p = at(0);
  return {
    sun: at(sun), moon: at(moon), mercury: p, venus: p, mars: p, jupiter: p, saturn: p,
    uranus: p, neptune: p, pluto: p, chiron: p, northNode: p, southNode: p,
    lilith: p, ceres: p, pallas: p, juno: p, vesta: p,
    ascendant: { sign: at(asc).sign, degree: asc % 30 },
    midheaven: { sign: at(mc).sign, degree: mc % 30 },
    houses: Array.from({ length: 12 }, (_, i) => (asc + i * 30) % 360),
    aspects: [],
  };
}

describe('Pro comparison', () => {
  it('takes the shorter-arc midpoint, including across 0° Aries', () => {
    expect(midpoint(10, 50)).toBe(30);
    expect(midpoint(350, 10)).toBe(0);
    expect(midpoint(10, 350)).toBe(0);
    expect(midpoint(0, 180)).toBe(90);
  });

  it('finds cross-chart contacts within orb only', () => {
    const contacts = crossAspects([{ name: 'Sun', longitude: 10 }], [{ name: 'Moon', longitude: 191 }, { name: 'Venus', longitude: 50 }], 3);
    expect(contacts).toEqual([{ inner: 'Sun', outer: 'Moon', type: 'opposition', orb: 1 }]);
  });

  it('builds a composite from midpoints with equal houses from the composite Ascendant', () => {
    const c = compositeChart(chart(10, 100, 0, 270), chart(50, 140, 20, 290))!;
    // Midpoint of 10° and 50° is 30°, which is 0° Taurus.
    expect(c.sun.sign).toBe('Taurus');
    expect(c.sun.degree).toBe(0);
    expect(c.ascendant).toEqual({ sign: 'Aries', degree: 10 });
    expect(c.houses[0]).toBe(10);
    expect(c.houses[3]).toBe(100);
    // Minor bodies are not carried over from one person.
    expect((c as unknown as Record<string, unknown>).ceres).toBeUndefined();
    expect(chartBodies(c).find((b) => b.name === 'Moon')!.longitude).toBe(120);
  });

  it('refuses a composite without both Ascendants', () => {
    const broken = { ...chart(10, 100, 0, 270), ascendant: { sign: 'Nowhere', degree: 0 } };
    expect(compositeChart(broken, chart(50, 140, 20, 290))).toBeNull();
  });
});
