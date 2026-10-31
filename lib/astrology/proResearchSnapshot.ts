/**
 * FG07 Astro Pro research — read-only, in-memory, owned chart facts.
 *
 * No database calls, identities, cookies, birth dates/times, persistence,
 * external providers, model invocation, synastry, downloads, or chart sharing.
 * Numerical calculations originate entirely in the existing Pro engine.
 */
import type { BirthChart, Aspect } from './proEphemerisCalculator';
import { chartBodies, geometricHouseFromCusps, hasValidChartGeometry } from './proChartGeometry';

export type ResearchAspect = Pick<Aspect, 'planet1' | 'planet2' | 'type' | 'orb' | 'exact'>;

export interface ResearchPosition {
  name: string;
  glyph: string;
  zodiacSign: string;
  zodiacDegree: number;
  longitude: number;
  calculatedHouse: number;
  geometricHouse: number | null;
  cuspConventionDiffers: boolean;
  motion: string;
}

export interface ResearchSnapshot {
  positions: ResearchPosition[];
  aspects: ResearchAspect[];
  countWithHouseConventionDifference: number;
  motionUncertainCount: number;
  note: string;
}

const VALID_ASPECTS = new Set([
  'conjunction', 'opposition', 'trine', 'square', 'sextile', 'quincunx',
]);

/**
 * Rejects missing/invalid source. Does not "repair" chart facts with guessed
 * zero-Aries coordinates or derive a birth record from browser input.
 */
export function createProResearchSnapshot(chart: unknown): ResearchSnapshot | null {
  if (!hasValidChartGeometry(chart)) return null;
  const source = chart as BirthChart;
  const bodies = chartBodies(source);
  const known = new Set<string>(bodies.map((body) => body.name));
  const positions = bodies.map((body): ResearchPosition => {
    const geometricHouse = geometricHouseFromCusps(body.longitude, source.houses);
    return {
      name: body.name,
      glyph: body.glyph,
      zodiacSign: body.position.sign,
      zodiacDegree: body.position.degree,
      longitude: body.longitude,
      calculatedHouse: body.position.house,
      geometricHouse,
      cuspConventionDiffers: geometricHouse !== null && geometricHouse !== body.position.house,
      motion: body.position.motionStatus || 'not-evaluated',
    };
  }).sort((a, b) => a.longitude - b.longitude || a.name.localeCompare(b.name));

  // The engine is the sole source of aspects. Do not recalculate, infer,
  // silently round away an orb or invent applying/separating phases.
  const aspects = source.aspects
    .filter((candidate): candidate is Aspect =>
      !!candidate && typeof candidate === 'object' &&
      typeof candidate.planet1 === 'string' &&
      typeof candidate.planet2 === 'string' &&
      known.has(candidate.planet1) && known.has(candidate.planet2) &&
      candidate.planet1 !== candidate.planet2 &&
      VALID_ASPECTS.has(candidate.type) &&
      Number.isFinite(candidate.orb) && candidate.orb >= 0 &&
      candidate.orb <= 180 &&
      typeof candidate.exact === 'boolean')
    .map(({ planet1, planet2, type, orb, exact }) =>
      ({ planet1, planet2, type, orb, exact }))
    .sort((a, b) =>
      a.orb - b.orb ||
      a.planet1.localeCompare(b.planet1) ||
      a.planet2.localeCompare(b.planet2));

  return {
    positions,
    aspects,
    countWithHouseConventionDifference: positions.filter(p => p.cuspConventionDiffers).length,
    motionUncertainCount: positions.filter(p => p.motion === 'stationary-uncertain' ||
      p.motion === 'not-evaluated').length,
    note: 'Calculator-reported chart facts; independent astronomical certification pending.',
  };
}

/** Display-only filter. Never changes the private calculation or stored data. */
export function researchAspectsWithinOrb(
  snapshot: ResearchSnapshot | null,
  maxOrb: number | null,
): ResearchAspect[] {
  if (!snapshot || (maxOrb !== null && (!Number.isFinite(maxOrb) || maxOrb < 0 || maxOrb > 180)))
    return [];
  return snapshot.aspects.filter(a => maxOrb === null || a.orb <= maxOrb);
}
