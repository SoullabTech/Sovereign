/**
 * ASTRO-PRO-ORBS-01 — an orb for each planet. With every point at the default
 * the engine's aspects stand untouched; a changed orb affects only the pairs
 * that include that point; a pair uses the larger orb of its two points.
 */
import { calculateBirthChart, type BirthChart } from '../lib/astrology/proEphemerisCalculator';
import { aspectsWithOrbs, cleanPointOrbs, withPointOrbs } from '../lib/astrology/proAspectOrbs';

const SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

function at(longitude: number) {
  return { sign: SIGNS[Math.floor(longitude / 30)], degree: longitude % 30, house: 1, retrograde: false };
}

/** A made-up chart: only the bodies given are placed; the engine reported no aspects. */
function chartWith(bodies: Record<string, number>): BirthChart {
  const chart: Record<string, unknown> = {
    ascendant: { sign: 'Libra', degree: 15 }, midheaven: { sign: 'Cancer', degree: 15 },
    houses: Array.from({ length: 12 }, (_, i) => i * 30), aspects: [],
  };
  for (const [key, longitude] of Object.entries(bodies)) chart[key] = at(longitude);
  return chart as unknown as BirthChart;
}

const ANGLES = new Set(['Ascendant', 'Midheaven']);
const pairs = (aspects: { planet1: string; planet2: string; type: string }[]) =>
  aspects.map((a) => `${a.planet1}|${a.planet2}|${a.type}`).sort();
/** The planet-to-planet aspects only; the made-up chart's angles are not under test. */
const planetPairs = (aspects: { planet1: string; planet2: string; type: string }[]) =>
  pairs(aspects.filter((a) => !ANGLES.has(a.planet1) && !ANGLES.has(a.planet2)));

describe('Per-planet orbs', () => {
  it('leaves the engine\'s aspects untouched at the default orbs', async () => {
    const chart = await calculateBirthChart({
      date: '1990-06-15', time: '14:30',
      location: { lat: 40.7128, lng: -74.006, timezone: 'America/New_York' }, houseSystem: 'porphyry',
    });
    expect(withPointOrbs(chart, {})).toBe(chart);
    expect(withPointOrbs(chart, { Sun: 8, Moon: 8 })).toBe(chart);
  });

  it('changes only the pairs that include the changed point', async () => {
    const chart = await calculateBirthChart({
      date: '1990-06-15', time: '14:30',
      location: { lat: 40.7128, lng: -74.006, timezone: 'America/New_York' }, houseSystem: 'porphyry',
    });
    const withoutPluto = (list: typeof chart.aspects) =>
      list.filter((a) => a.planet1 !== 'Pluto' && a.planet2 !== 'Pluto');
    const recalculated = aspectsWithOrbs(chart, { Pluto: 3 });
    expect(pairs(withoutPluto(recalculated))).toEqual(pairs(withoutPluto(chart.aspects)));
    for (const a of withoutPluto(recalculated)) {
      const engine = chart.aspects.find((x) => x.planet1 === a.planet1 && x.planet2 === a.planet2 && x.type === a.type)!;
      expect(Math.abs(a.orb - engine.orb)).toBeLessThanOrEqual(0.02); // positions are read at 0.01°
    }
  });

  it('finds a wider aspect only when a point is given a wider orb, using the larger of the pair', () => {
    const chart = chartWith({ sun: 0, moon: 10 }); // a 10° conjunction
    expect(planetPairs(aspectsWithOrbs(chart, { Moon: 9 }))).toEqual([]);
    expect(planetPairs(aspectsWithOrbs(chart, { Sun: 12, Moon: 2 }))).toEqual(['Sun|Moon|conjunction']);
  });

  it('narrows an aspect when both points are given tighter orbs', () => {
    const chart = chartWith({ mars: 0, saturn: 95 }); // square, 5° from exact
    expect(planetPairs(aspectsWithOrbs(chart, { Venus: 12 }))).toEqual(['Mars|Saturn|square']);
    expect(planetPairs(aspectsWithOrbs(chart, { Mars: 4, Saturn: 4 }))).toEqual([]);
  });

  it('scales the minor aspects from the pair\'s orb', () => {
    const chart = chartWith({ sun: 0, venus: 32.5 }); // semisextile, 2.5° from exact
    expect(planetPairs(aspectsWithOrbs(chart, { Venus: 7 }))).toEqual([]);
    expect(planetPairs(aspectsWithOrbs(chart, { Sun: 12 }))).toEqual(['Sun|Venus|semisextile']);
  });

  it('keeps only known points with an orb in range', () => {
    expect(cleanPointOrbs({ Sun: 10.3, Moon: 20, Lilith: 5, Mars: '6', Venus: 8, Saturn: 0.5 }))
      .toEqual({ Sun: 10.5 });
    expect(cleanPointOrbs(null)).toEqual({});
  });
});
