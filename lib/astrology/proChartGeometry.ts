/**
 * ASTRO-PRO-03 — read-only, transparent celestial geometry.
 * Numeric positions are calculated by the existing chart engine. This module
 * does not interpret any person's temperament, fate or developmental position.
 */
import type { BirthChart, PlanetPosition } from './proEphemerisCalculator';

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

/**
 * CF-02: readable planet markers without changing their calculated positions.
 *
 * The true zodiacal position is always the anchor dot at radius 235. The
 * optional offset applies only to the clickable glyph. Deterministic candidate
 * selection avoids overlap, including pairs straddling 0 degrees Aries.
 * Aspect geometry remains tied to true longitudes, never these display points.
 */
export interface ChartMarkerPlacement {
  name: ProBodyName;
  longitude: number;
  x: number;
  y: number;
  anchorX: number;
  anchorY: number;
  displaced: boolean;
  offsetDegrees: number;
  radius: number;
}

export function layoutChartMarkers(
  bodies: readonly WheelBody[],
  ascendantLongitude: number,
): ChartMarkerPlacement[] {
  if (!Number.isFinite(ascendantLongitude)) return [];
  // Sorting by relative longitude makes the output stable under source reorder.
  const ordered = [...bodies].sort((a, b) => {
    const delta = normalizeLongitude(a.longitude - ascendantLongitude) -
      normalizeLongitude(b.longitude - ascendantLongitude);
    return delta || a.name.localeCompare(b.name);
  });
  const placed: ChartMarkerPlacement[] = [];
  const minDistanceSquared = 47 * 47; // 22px radius + 3px between controls
  const ringRadii = [211, 251, 171] as const;

  for (const body of ordered) {
    const anchor = radialPoint(body.longitude, ascendantLongitude, 235);
    const natural = radialPoint(body.longitude, ascendantLongitude, 211);
    const options: Array<{
      x: number; y: number; offset: number; radius: number; cost: number;
    }> = [];
    for (let angle = 0; angle <= 76; angle += 2) {
      for (const sign of angle === 0 ? [1] : [-1, 1]) {
        const offset = angle * sign;
        for (const radius of ringRadii) {
          const point = radialPoint(body.longitude + offset, ascendantLongitude, radius);
          const distance = Math.hypot(point.x - natural.x, point.y - natural.y);
          options.push({
            ...point, offset, radius,
            cost: distance + Math.abs(offset) * 0.12 +
              (radius === 171 ? 1 : 0),
          });
        }
      }
    }
    options.sort((a, b) => a.cost - b.cost ||
      Math.abs(a.offset) - Math.abs(b.offset) ||
      b.radius - a.radius || a.offset - b.offset);

    const selected = options.find((option) =>
      placed.every((prior) => {
        const dx = option.x - prior.x;
        const dy = option.y - prior.y;
        return dx * dx + dy * dy >= minDistanceSquared - 0.0001;
      }),
    );
    if (!selected) {
      // Never paint an overlapping button and imply that it is independently
      // selectable. The complete planet index below the wheel remains usable.
      continue;
    }
    placed.push({
      name: body.name,
      longitude: body.longitude,
      x: selected.x, y: selected.y,
      anchorX: anchor.x, anchorY: anchor.y,
      displaced: selected.offset !== 0 || selected.radius !== 211,
      offsetDegrees: selected.offset, radius: selected.radius,
    });
  }
  return placed;
}

/**
 * CF-01: true geometric house membership, distinct from the legacy 5-degree
 * pre-angular-cusp interpretation used by the existing calculation engine.
 *
 * Never guess when cusp geometry is invalid. Exact cusps are in the following
 * house, while a body immediately before a cusp stays in the preceding house.
 */
export function geometricHouseFromCusps(
  longitude: number, houseCusps: readonly number[],
): number | null {
  if (!Number.isFinite(longitude) || houseCusps.length !== 12 ||
      houseCusps.some((c) => !Number.isFinite(c) || c < 0 || c >= 360)) {
    return null;
  }
  const spans = houseCusps.map((c, i) =>
    normalizeLongitude(houseCusps[(i + 1) % 12] - c),
  );
  if (spans.some((arc) => arc <= 0) ||
      Math.abs(spans.reduce((a, b) => a + b, 0) - 360) > 0.00001) {
    return null;
  }
  const position = normalizeLongitude(longitude);
  for (let i = 0; i < 12; i += 1) {
    if (normalizeLongitude(position - houseCusps[i]) < spans[i]) {
      return i + 1;
    }
  }
  return null;
}

/**
 * Returns a possible angular-cusp influence, not a geometrical house.
 * Kept separate so the client can see both conventions without confusion.
 */
export function angularHouseInfluence(
  longitude: number,
  houseCusps: readonly number[],
  orbDegrees = 5,
): { house: 1 | 4 | 7 | 10; degreesBeforeCusp: number } | null {
  if (geometricHouseFromCusps(longitude, houseCusps) === null ||
      !Number.isFinite(orbDegrees) || orbDegrees <= 0 || orbDegrees > 30) {
    return null;
  }
  for (const index of [0, 3, 6, 9] as const) {
    const distance = normalizeLongitude(houseCusps[index] - normalizeLongitude(longitude));
    if (distance > 0 && distance <= orbDegrees) {
      return { house: (index + 1) as 1 | 4 | 7 | 10, degreesBeforeCusp: distance };
    }
  }
  return null;
}
