/**
 * ASTRO-PRO-ORBS-01 — an orb for each planet (founder request 2026-11-06).
 *
 * The engine's aspect table gives the major aspects an 8° orb and the rest
 * smaller ones. An astrologer may give each point its own orb instead — wider
 * for the Sun and Moon, say. A pair uses the larger orb of its two points, and
 * every aspect's orb scales from the engine's by the same ratio, so with every
 * point at 8° the aspects are exactly the engine's.
 */
import type { Aspect, BirthChart } from './proEphemerisCalculator';
import { aspectEndpointLongitudes, normalizeLongitude } from './proChartGeometry';

/** The engine's aspect table: exact angle and orb at the default point orb. */
export const ASPECT_DEFINITIONS: ReadonlyArray<{ type: Aspect['type']; angle: number; orb: number }> = [
  { type: 'conjunction', angle: 0, orb: 8 },
  { type: 'opposition', angle: 180, orb: 8 },
  { type: 'trine', angle: 120, orb: 8 },
  { type: 'square', angle: 90, orb: 8 },
  { type: 'sextile', angle: 60, orb: 6 },
  { type: 'quincunx', angle: 150, orb: 3 },
  // Minor aspects, with tight orbs so none overlaps a major one.
  { type: 'semisextile', angle: 30, orb: 2 },
  { type: 'semisquare', angle: 45, orb: 2 },
  { type: 'sesquiquadrate', angle: 135, orb: 2 },
  { type: 'quintile', angle: 72, orb: 2 },
  { type: 'biquintile', angle: 144, orb: 2 },
];

export const DEFAULT_POINT_ORB = 8;
export const MIN_POINT_ORB = 1;
export const MAX_POINT_ORB = 15;

/** The points an astrologer can give an orb, in chart order. */
export const ORB_POINTS = [
  'Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto',
  'Chiron', 'North Node', 'South Node', 'Ascendant', 'Midheaven',
] as const;

export type OrbPoint = typeof ORB_POINTS[number];
export type PointOrbs = Partial<Record<OrbPoint, number>>;

const KNOWN = new Set<string>(ORB_POINTS);

/** Keeps only known points with an orb in range, rounded to half a degree. */
export function cleanPointOrbs(value: unknown): PointOrbs {
  if (!value || typeof value !== 'object') return {};
  const out: PointOrbs = {};
  for (const [name, raw] of Object.entries(value as Record<string, unknown>)) {
    if (!KNOWN.has(name) || typeof raw !== 'number' || !Number.isFinite(raw)) continue;
    const orb = Math.round(raw * 2) / 2;
    if (orb < MIN_POINT_ORB || orb > MAX_POINT_ORB || orb === DEFAULT_POINT_ORB) continue;
    out[name as OrbPoint] = orb;
  }
  return out;
}

export function pointOrb(orbs: PointOrbs, name: string): number {
  return (KNOWN.has(name) ? orbs[name as OrbPoint] : undefined) ?? DEFAULT_POINT_ORB;
}

export function isDefaultOrbs(orbs: PointOrbs): boolean {
  return Object.keys(cleanPointOrbs(orbs)).length === 0;
}

/**
 * The chart's aspects under these orbs. With every point at the default the
 * engine's own aspects are returned untouched. Otherwise aspects among the
 * plotted points and angles are recalculated from their positions; the
 * engine's aspects to any other body are kept as reported.
 */
export function aspectsWithOrbs(chart: BirthChart, orbs: PointOrbs): Aspect[] {
  const engine = chart.aspects || [];
  if (isDefaultOrbs(orbs)) return engine;
  const longitudes = aspectEndpointLongitudes(chart);
  const names = [...longitudes.keys()];
  const found: Aspect[] = [];
  for (let i = 0; i < names.length; i++) {
    for (let j = i + 1; j < names.length; j++) {
      const a = names[i];
      const b = names[j];
      if ((a === 'Ascendant' || a === 'Midheaven') && (b === 'Ascendant' || b === 'Midheaven')) continue;
      if (a.endsWith(' Node') && b.endsWith(' Node')) continue;
      let separation = Math.abs(normalizeLongitude(longitudes.get(b)! - longitudes.get(a)!));
      if (separation > 180) separation = 360 - separation;
      const scale = Math.max(pointOrb(orbs, a), pointOrb(orbs, b)) / DEFAULT_POINT_ORB;
      for (const def of ASPECT_DEFINITIONS) {
        const orb = Math.abs(separation - def.angle);
        if (orb <= def.orb * scale) {
          found.push({ planet1: a, planet2: b, type: def.type, orb: Number(orb.toFixed(2)), exact: orb < 1 });
        }
      }
    }
  }
  const recalculated = new Set(names);
  const kept = engine.filter((x) => !(recalculated.has(x.planet1) && recalculated.has(x.planet2)));
  return [...found, ...kept];
}

/** The same chart with its aspects found under these orbs. */
export function withPointOrbs(chart: BirthChart, orbs: PointOrbs): BirthChart {
  return isDefaultOrbs(orbs) ? chart : { ...chart, aspects: aspectsWithOrbs(chart, orbs) };
}
