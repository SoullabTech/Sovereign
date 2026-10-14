import type { BirthChart } from '../ephemerisCalculator';
import {
  toEclipticLongitude,
  normalizeLongitude,
  radialPoint,
  chartBodies,
  selectedRelationships,
  hasValidChartGeometry,
  longitudeToAngle,
} from '../proChartGeometry';

const syntheticChart: BirthChart = {
  sun: { sign: 'Aries', degree: 3.2, house: 1, retrograde: false },
  moon: { sign: 'Libra', degree: 3.2, house: 7, retrograde: false },
  mercury: { sign: 'Pisces', degree: 28, house: 12, retrograde: false },
  venus: { sign: 'Taurus', degree: 5, house: 2, retrograde: false },
  mars: { sign: 'Cancer', degree: 18, house: 4, retrograde: false },
  jupiter: { sign: 'Sagittarius', degree: 12, house: 9, retrograde: false },
  saturn: { sign: 'Aquarius', degree: 8, house: 11, retrograde: false },
  uranus: { sign: 'Gemini', degree: 11, house: 3, retrograde: false },
  neptune: { sign: 'Pisces', degree: 15, house: 12, retrograde: false },
  pluto: { sign: 'Capricorn', degree: 23, house: 10, retrograde: false },
  chiron: { sign: 'Aries', degree: 13, house: 1, retrograde: false },
  northNode: { sign: 'Virgo', degree: 9, house: 6, retrograde: true },
  southNode: { sign: 'Pisces', degree: 9, house: 12, retrograde: true },
  lilith: { sign: 'Gemini', degree: 9, house: 3, retrograde: false },
  ceres: { sign: 'Cancer', degree: 13, house: 4, retrograde: false },
  pallas: { sign: 'Leo', degree: 15, house: 5, retrograde: false },
  juno: { sign: 'Scorpio', degree: 9, house: 8, retrograde: false },
  vesta: { sign: 'Sagittarius', degree: 15, house: 9, retrograde: false },
  ascendant: { sign: 'Aries', degree: 0 },
  midheaven: { sign: 'Capricorn', degree: 0 },
  houses: [0, 32, 61, 90, 120, 149, 180, 212, 241, 270, 300, 329],
  aspects: [
    { planet1: 'Sun', planet2: 'Moon', type: 'opposition', orb: 0, exact: true },
    { planet1: 'Sun', planet2: 'Saturn', type: 'sextile', orb: 4.8, exact: false },
    { planet1: 'Moon', planet2: 'Saturn', type: 'trine', orb: 4.8, exact: false },
  ],
};

describe('Astrology Pro chart-first geometry, synthetic only', () => {
  it('plots sign degrees rather than allocating all planets evenly by houses', () => {
    expect(toEclipticLongitude('Aries', 3.2)).toBe(3.2);
    expect(toEclipticLongitude('Libra', 3.2)).toBe(183.2);
    expect(toEclipticLongitude('Pisces', 28)).toBe(358);
    expect(chartBodies(syntheticChart).find((b) => b.name === 'Moon')?.longitude).toBeCloseTo(183.2, 6);
  });

  it('never silently treats unknown or out-of-range placements as Aries zero', () => {
    expect(toEclipticLongitude('Atlantis', 0)).toBeNull();
    expect(toEclipticLongitude('Aries', 30)).toBeNull();
    expect(toEclipticLongitude('Aries', -0.1)).toBeNull();
    expect(toEclipticLongitude('Aries', Number.NaN)).toBeNull();
  });

  it('keeps the ascendant at the left and uses actual continuous longitude', () => {
    const asc = 0;
    const left = radialPoint(asc, asc, 200);
    const upper = radialPoint(90, asc, 200);
    expect(left.x).toBeCloseTo(150, 4);
    expect(left.y).toBeCloseTo(350, 4);
    expect(upper.x).toBeCloseTo(350, 4);
    expect(upper.y).toBeCloseTo(150, 4);
    expect(longitudeToAngle(0, asc)).toBe(180);
    expect(normalizeLongitude(-3)).toBe(357);
  });

  it('uses only calculator-returned aspects for the selected planet', () => {
    const actual = selectedRelationships(syntheticChart, 'Sun');
    expect(actual).toHaveLength(2);
    expect(actual[0].orb).toBe(0);
    expect(actual.every((a) => a.planet1 === 'Sun' || a.planet2 === 'Sun')).toBe(true);
    expect(selectedRelationships(syntheticChart, 'Uranus')).toHaveLength(0);
  });

  it('fails visibly when chart geometry is missing rather than inventing a fallback', () => {
    expect(hasValidChartGeometry(syntheticChart)).toBe(true);
    expect(hasValidChartGeometry({ ...syntheticChart, houses: [] })).toBe(false);
    expect(hasValidChartGeometry({ ...syntheticChart, ascendant: { sign: 'Unknown', degree: 0 } })).toBe(false);
    expect(hasValidChartGeometry({ ...syntheticChart, houses: syntheticChart.houses.map(() => 361) })).toBe(false);
  });
});
