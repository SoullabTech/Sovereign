/**
 * ASTRO-PRO-ORBS-01 — the astrologer's orbs. With nothing changed the engine's
 * aspects stand untouched; a changed point orb affects only that point's
 * pairs; a pair uses the larger or the average of its two point orbs; each
 * aspect's own orb can be changed.
 */
import { calculateBirthChart, type BirthChart } from '../lib/astrology/proEphemerisCalculator';
import {
  ASPECT_DEFINITIONS, ORB_PRESETS, aspectsWithOrbs as withSettings, cleanOrbSettings, withOrbSettings, type OrbSettings,
} from '../lib/astrology/proAspectOrbs';

/** Point orbs only, the larger-of-two rule, unless a test says otherwise. */
const aspectsWithOrbs = (chart: BirthChart, points: OrbSettings['points'], more: Partial<OrbSettings> = {}) =>
  withSettings(chart, { points, aspects: {}, pairRule: 'larger', ...more });

const SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

function at(longitude: number) {
  return { sign: SIGNS[Math.floor(longitude / 30)], degree: longitude % 30, house: 1, retrograde: false };
}

const NAMES: Record<string, string> = { sun: 'Sun', moon: 'Moon', venus: 'Venus', mars: 'Mars', saturn: 'Saturn', pluto: 'Pluto' };

/** A made-up chart: only the bodies given are placed; the engine's aspects among them at its default orbs. */
function chartWith(bodies: Record<string, number>): BirthChart {
  const keys = Object.keys(bodies);
  const aspects = [];
  for (let i = 0; i < keys.length; i++) {
    for (let j = i + 1; j < keys.length; j++) {
      let separation = Math.abs(bodies[keys[j]] - bodies[keys[i]]) % 360;
      if (separation > 180) separation = 360 - separation;
      for (const def of ASPECT_DEFINITIONS) {
        const orb = Math.abs(separation - def.angle);
        if (orb <= def.orb) aspects.push({ planet1: NAMES[keys[i]], planet2: NAMES[keys[j]], type: def.type, orb, exact: orb < 1 });
      }
    }
  }
  return { ...placed(bodies), aspects } as BirthChart;
}

function placed(bodies: Record<string, number>): BirthChart {
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
    const none = { points: {}, aspects: {}, pairRule: 'larger' as const };
    expect(withOrbSettings(chart, none)).toBe(chart);
    expect(withOrbSettings(chart, { ...none, points: { Sun: 8, Moon: 8 }, aspects: { sextile: 6 } })).toBe(chart);
    expect(withOrbSettings(chart, { ...none, pairRule: 'average' })).toBe(chart);
    expect(withOrbSettings(chart, ORB_PRESETS.find((p) => p.id === 'engine')!.settings)).toBe(chart);
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

  it('averages the two point orbs when the astrologer chooses moieties', () => {
    const chart = chartWith({ sun: 0, moon: 10 }); // a 10° conjunction
    expect(planetPairs(aspectsWithOrbs(chart, { Sun: 12, Moon: 6 }, { pairRule: 'average' }))).toEqual([]); // 9°
    expect(planetPairs(aspectsWithOrbs(chart, { Sun: 14, Moon: 6 }, { pairRule: 'average' })))
      .toEqual(['Sun|Moon|conjunction']); // 10°
    // Under moieties narrowing one point tightens its aspects to an unchanged point.
    const square = chartWith({ mars: 0, saturn: 95 }); // 5° from exact
    expect(planetPairs(aspectsWithOrbs(square, { Mars: 1 }, { pairRule: 'average' }))).toEqual([]); // 4.5°
    expect(planetPairs(aspectsWithOrbs(square, { Mars: 1 }))).toEqual(['Mars|Saturn|square']); // larger: 8°
  });

  it('uses each aspect\'s own orb', () => {
    const chart = chartWith({ mars: 0, saturn: 95 }); // square, 5° from exact
    expect(planetPairs(aspectsWithOrbs(chart, {}, { aspects: { square: 4 } }))).toEqual([]);
    expect(planetPairs(aspectsWithOrbs(chart, {}, { aspects: { square: 4, trine: 10 } }))).toEqual([]);
    const sextile = chartWith({ mars: 0, saturn: 67 }); // sextile, 7° from exact
    expect(planetPairs(aspectsWithOrbs(sextile, {}))).toEqual([]);
    expect(planetPairs(aspectsWithOrbs(sextile, {}, { aspects: { sextile: 7 } }))).toEqual(['Mars|Saturn|sextile']);
  });

  it('keeps the engine\'s decision on a boundary pair whose tolerance did not change', () => {
    // The engine saw 10.001° and 18.004° (8.003° apart: no conjunction); the chart
    // carries 10.00° and 18.00°, exactly 8° apart. Changing Pluto must not add it.
    const chart = { ...placed({ sun: 10, moon: 18, pluto: 200 }), aspects: [] } as BirthChart;
    expect(planetPairs(aspectsWithOrbs(chart, { Pluto: 3 }))).toEqual([]);
    // A reported engine aspect on an unchanged pair stays, with the engine's own orb.
    const reported = { planet1: 'Sun', planet2: 'Moon', type: 'conjunction' as const, orb: 7.99, exact: false };
    const withEngine = { ...chart, aspects: [reported] };
    expect(aspectsWithOrbs(withEngine, { Pluto: 3 })).toContainEqual(reported);
    // Once the pair's own tolerance changes, it is decided again from the chart's positions.
    expect(planetPairs(aspectsWithOrbs(chart, { Sun: 9 }))).toEqual(['Sun|Moon|conjunction']);
  });

  it('keeps only known points and aspects with an orb in range', () => {
    expect(cleanOrbSettings({
      points: { Sun: 10.3, Moon: 20, Lilith: 5, Mars: '6', Venus: 8, Saturn: 0.2 },
      aspects: { square: 6, sextile: 6, trine: 99, wobble: 3 },
      pairRule: 'whatever',
    })).toEqual({ points: { Sun: 10.5 }, aspects: { square: 6 }, pairRule: 'larger' });
    expect(cleanOrbSettings(null)).toEqual({ points: {}, aspects: {}, pairRule: 'larger' });
  });
});
