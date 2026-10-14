/**
 * ASTRO-PRO-03 — read-only, transparent celestial geometry.
 * Numeric positions are calculated by the existing chart engine. This module
 * does not interpret any person's temperament, fate or developmental position.
 */
import type { BirthChart, PlanetPosition } from './ephemerisCalculator';

export const SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
] as const;

export const SIGN_GLYPHS = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'] as const;

export const BODY_DEFINITIONS = [
  ['sun', 'Sun', '☉'],
  ['moon', 'Moon', '☽'],
  ['mercury', 'Mercury', '☿'],
  ['venus', 'Venus', '♀'],
  ['mars', 'Mars', '♂'],
  ['jupiter', 'Jupiter', '♃'],
  ['saturn', 'Saturn', '♄'],
  ['uranus', 'Uranus', '♅'],
  ['neptune', 'Neptune', '♆'],
  ['pluto', 'Pluto', '♇'],
  ['chiron', 'Chiron', '⚷'],
  ['northNode', 'North Node', '☊'],
  ['southNode', 'South Node', '☋'],
] as const satisfies ReadonlyArray<readonly [keyof BirthChart, string, string]>;

export type ProBodyName = typeof BODY_DEFINITIONS[number][1];

export interface WheelBody {
  key: typeof BODY_DEFINITIONS[number][0];
  name: ProBodyName;
  glyph: string;
  longitude: number;
  position: PlanetPosition;
}

export const ASPECT_COLOR: Record<string, string> = {
  conjunction: '#dfbd84',
  sextile: '#8fb3ad',
  square: '#e7a794',
  trine: '#8faacb',
  opposition: '#d7baa1',
  quincunx: '#a6abb7',
};

export function normalizeLongitude(value: number): number {
  return ((value % 360) + 360) % 360;
}

/** Strictly reject unknown signs/invalid degrees; never silently plot 0° Aries. */
export function toEclipticLongitude(sign: string, degree: number): number | null {
  const index = SIGNS.indexOf(sign as (typeof SIGNS)[number]);
  if (index < 0 || !Number.isFinite(degree) || degree < 0 || degree >= 30) return null;
  return index * 30 + degree;
}

/** Ascendant is placed at the left horizon; longitude increases anticlockwise. */
export function longitudeToAngle(longitude: number, ascendantLongitude: number): number {
  return 180 - normalizeLongitude(longitude - ascendantLongitude);
}

export function radialPoint(
  longitude: number,
  ascendantLongitude: number,
  radius: number,
  center = 350,
): { x: number; y: number } {
  const radians = longitudeToAngle(longitude, ascendantLongitude) * Math.PI / 180;
  return {
    x: center + radius * Math.cos(radians),
    y: center - radius * Math.sin(radians),
  };
}

export function chartBodies(chart: BirthChart): WheelBody[] {
  return BODY_DEFINITIONS.flatMap(([key, name, glyph]) => {
    const position = chart[key] as PlanetPosition;
    if (!position || !Number.isInteger(position.house) || position.house < 1 || position.house > 12) return [];
    const longitude = toEclipticLongitude(position.sign, position.degree);
    if (longitude === null) return [];
    return [{ key, name, glyph, longitude, position }];
  });
}

export function hasValidChartGeometry(chart: unknown): chart is BirthChart {
  if (!chart || typeof chart !== 'object') return false;
  const c = chart as Partial<BirthChart>;
  const asc = c.ascendant;
  if (!asc || toEclipticLongitude(asc.sign, asc.degree) === null) return false;
  if (!Array.isArray(c.houses) || c.houses.length !== 12 || c.houses.some((x) => !Number.isFinite(x) || x < 0 || x >= 360)) return false;
  if (!Array.isArray(c.aspects)) return false;
  if (!c.sun || !c.moon) return false;
  return chartBodies(c as BirthChart).some((body) => body.name === 'Sun') &&
    chartBodies(c as BirthChart).some((body) => body.name === 'Moon');
}

/** Uses only actual aspects returned by the calculation engine, never invents them. */
export function selectedRelationships(chart: BirthChart, name: string) {
  return (chart.aspects || [])
    .filter((a) => a.planet1 === name || a.planet2 === name)
    .filter((a) => Number.isFinite(a.orb) && a.orb >= 0)
    .sort((a, b) => a.orb - b.orb);
}
