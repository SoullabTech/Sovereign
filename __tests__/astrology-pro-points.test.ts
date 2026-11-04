/**
 * ASTRO-PRO-POINTS-01 / TRANSFORMS-01 — Vertex, ayanamsa, sidereal,
 * harmonic and lots, checked against the sky and known values.
 */
import * as Astronomy from 'astronomy-engine';
import type { BirthChart, PlanetPosition } from '../lib/astrology/proEphemerisCalculator';
import { calculateChartPoints, eclipticAzimuth } from '../lib/astrology/proChartPoints';
import { harmonicChart, lots, siderealChart } from '../lib/astrology/proChartTransforms';

const SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
const at = (lon: number, house = 1): PlanetPosition => ({ sign: SIGNS[Math.floor(lon / 30)], degree: lon % 30, house, retrograde: false });

function chart(sun: number, moon: number, asc: number): BirthChart {
  const p = at(200);
  const houses = Array.from({ length: 12 }, (_, i) => (asc + i * 30) % 360);
  return {
    sun: at(sun), moon: at(moon), mercury: p, venus: p, mars: p, jupiter: p, saturn: p,
    uranus: p, neptune: p, pluto: p, chiron: p, northNode: p, southNode: p,
    lilith: p, ceres: p, pallas: p, juno: p, vesta: p,
    ascendant: { sign: at(asc).sign, degree: asc % 30 },
    midheaven: { sign: at((asc + 270) % 360).sign, degree: ((asc + 270) % 360) % 30 },
    houses, aspects: [],
  };
}

describe('Vertex and ayanamsa', () => {
  const utc = '1990-06-15T18:30:00Z';
  it('puts the Vertex due west and the Antivertex opposite', () => {
    const points = calculateChartPoints(utc, 40.7128, -74.006);
    expect(points.vertex).not.toBeNull();
    const az = eclipticAzimuth(points.vertex!, Astronomy.MakeTime(new Date(utc)), new Astronomy.Observer(40.7128, -74.006, 0));
    expect(az).toBeCloseTo(270, 3);
    expect(((points.antivertex! - points.vertex!) + 360) % 360).toBeCloseTo(180, 6);
  });

  it('gives Lahiri near 23°51′ at J2000 and leaves the Vertex undefined on the equator', () => {
    expect(calculateChartPoints('2000-01-01T12:00:00Z', 10, 0).ayanamsa.lahiri).toBeCloseTo(23.85, 1);
    expect(calculateChartPoints(utc, 0, 0).vertex).toBeNull();
  });
});

describe('chart transforms', () => {
  it('shifts every position and cusp by the ayanamsa for the sidereal view', () => {
    const s = siderealChart(chart(100, 10, 0), 24)!;
    expect(s.sun).toMatchObject({ sign: 'Gemini', degree: 16 });
    expect(s.ascendant).toEqual({ sign: 'Pisces', degree: 6 });
    expect(s.houses[0]).toBe(336);
  });

  it('multiplies longitudes for a harmonic chart', () => {
    const h = harmonicChart(chart(100, 10, 0), 5)!;
    // 100° × 5 = 500° → 140° = 20° Leo; equal houses start at the harmonic Ascendant.
    expect(h.sun).toMatchObject({ sign: 'Leo', degree: 20 });
    expect(h.houses[0]).toBe(0);
  });

  it('refuses a harmonic below 2', () => {
    expect(harmonicChart(chart(100, 10, 0), 1)).toBeNull();
  });

  it('computes Fortune and Spirit by sect', () => {
    // Sun at 200° with Asc 0°: house 7 → day chart.
    const day = lots(chart(200, 50, 0));
    expect(day[0]).toMatchObject({ name: 'Part of Fortune', sect: 'day', longitude: 210 });
    expect(day[1]).toMatchObject({ name: 'Part of Spirit', longitude: 150 });
    // Sun at 100°: house 4 → night chart.
    expect(lots(chart(100, 50, 0))[0]).toMatchObject({ sect: 'night', longitude: 50 });
  });
});
