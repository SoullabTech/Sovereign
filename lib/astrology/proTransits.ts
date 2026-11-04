/**
 * ASTRO-PRO-TRANSITS-01 — the sky at a chosen moment, laid over a natal chart.
 *
 * Pure geometry. Transit positions come from the Pro calculator; this module
 * only converts them to longitudes and measures angular relationships to the
 * natal bodies. It assigns no meaning to any aspect.
 */
import type { PlanetPosition } from './proEphemerisCalculator';
import { normalizeLongitude, toEclipticLongitude, type WheelBody } from './proChartGeometry';

export const TRANSIT_BODIES = [
  ['sun', 'Sun', '☉'], ['moon', 'Moon', '☽'], ['mercury', 'Mercury', '☿'],
  ['venus', 'Venus', '♀'], ['mars', 'Mars', '♂'], ['jupiter', 'Jupiter', '♃'],
  ['saturn', 'Saturn', '♄'], ['uranus', 'Uranus', '♅'], ['neptune', 'Neptune', '♆'],
  ['pluto', 'Pluto', '♇'],
] as const;

export interface TransitBody {
  name: string;
  glyph: string;
  longitude: number;
  position: PlanetPosition;
}

export type TransitAspectType = 'conjunction' | 'opposition' | 'trine' | 'square' | 'sextile';

export interface TransitAspect {
  transit: string;
  natal: string;
  type: TransitAspectType;
  orb: number;
}

const ASPECT_ANGLES: ReadonlyArray<readonly [TransitAspectType, number]> = [
  ['conjunction', 0], ['sextile', 60], ['square', 90], ['trine', 120], ['opposition', 180],
];

/** Earliest and latest moments the Pro transit view accepts. */
export const TRANSIT_RANGE = { minYear: 1800, maxYear: 2200 } as const;

export function transitMomentInRange(date: Date): boolean {
  const year = date.getUTCFullYear();
  return Number.isFinite(date.getTime()) && year >= TRANSIT_RANGE.minYear && year <= TRANSIT_RANGE.maxYear;
}

export function transitBodies(positions: Record<string, PlanetPosition> | null | undefined): TransitBody[] {
  if (!positions) return [];
  return TRANSIT_BODIES.flatMap(([key, name, glyph]) => {
    const position = positions[key];
    if (!position) return [];
    const longitude = toEclipticLongitude(position.sign, position.degree);
    return longitude === null ? [] : [{ name, glyph, longitude, position }];
  });
}

/** Separation between two longitudes, 0–180°. */
export function angularSeparation(a: number, b: number): number {
  const d = normalizeLongitude(a - b);
  return d > 180 ? 360 - d : d;
}

/**
 * Every major aspect from a transiting body to a natal body within maxOrb,
 * closest first. One pair can hold only one aspect at a time.
 */
export function transitToNatalAspects(
  transits: readonly TransitBody[],
  natal: readonly Pick<WheelBody, 'name' | 'longitude'>[],
  maxOrb: number,
): TransitAspect[] {
  if (!Number.isFinite(maxOrb) || maxOrb < 0) return [];
  const found: TransitAspect[] = [];
  for (const t of transits) {
    for (const n of natal) {
      const separation = angularSeparation(t.longitude, n.longitude);
      for (const [type, angle] of ASPECT_ANGLES) {
        const orb = Math.abs(separation - angle);
        if (orb <= maxOrb) {
          found.push({ transit: t.name, natal: n.name, type, orb: Number(orb.toFixed(2)) });
          break;
        }
      }
    }
  }
  return found.sort((a, b) => a.orb - b.orb || a.transit.localeCompare(b.transit));
}
