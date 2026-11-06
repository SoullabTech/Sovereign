/**
 * ASTRO-PRO-ORBS-01 — the astrologer's orbs (founder request 2026-11-06).
 *
 * Two dials, as professional chart software offers:
 *   - an orb for each aspect (conjunction 8°, sextile 6°, quincunx 3°, …);
 *   - an orb for each point (wider for the Sun and Moon, say).
 * A pair's point orb is the larger of its two points' orbs, or their average
 * (the traditional moieties), as the astrologer chooses. An aspect is found
 * when it lies within the aspect's orb scaled by the pair's orb over 8°. With
 * nothing changed the aspects are exactly the engine's.
 */
import type { Aspect, BirthChart } from './proEphemerisCalculator';
import { aspectEndpointLongitudes, normalizeLongitude } from './proChartGeometry';

export type AspectType = Aspect['type'];

/** The engine's aspect table: exact angle and orb at the default point orb. */
export const ASPECT_DEFINITIONS: ReadonlyArray<{ type: AspectType; angle: number; orb: number }> = [
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
export const MIN_ORB = 0.5;
export const MAX_ORB = 15;

/** The points an astrologer can give an orb, in chart order. */
export const ORB_POINTS = [
  'Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto',
  'Chiron', 'North Node', 'South Node', 'Ascendant', 'Midheaven',
] as const;

export type OrbPoint = typeof ORB_POINTS[number];
export type PairRule = 'larger' | 'average';

export interface OrbSettings {
  /** Only points the astrologer changed. */
  points: Partial<Record<OrbPoint, number>>;
  /** Only aspects the astrologer changed. */
  aspects: Partial<Record<AspectType, number>>;
  pairRule: PairRule;
}

export const DEFAULT_ORB_SETTINGS: OrbSettings = { points: {}, aspects: {}, pairRule: 'larger' };

const KNOWN_POINTS = new Set<string>(ORB_POINTS);
const ENGINE_ASPECT_ORB = new Map(ASPECT_DEFINITIONS.map((d) => [d.type, d.orb]));

function cleanOrb(raw: unknown, fallback: number): number | null {
  if (typeof raw !== 'number' || !Number.isFinite(raw)) return null;
  const orb = Math.round(raw * 2) / 2;
  if (orb < MIN_ORB || orb > MAX_ORB || orb === fallback) return null;
  return orb;
}

/** Keeps only known points and aspects with an orb in range, to half a degree. */
export function cleanOrbSettings(value: unknown): OrbSettings {
  if (!value || typeof value !== 'object') return { ...DEFAULT_ORB_SETTINGS, points: {}, aspects: {} };
  const v = value as Record<string, unknown>;
  const points: OrbSettings['points'] = {};
  for (const [name, raw] of Object.entries((v.points && typeof v.points === 'object' ? v.points : {}) as Record<string, unknown>)) {
    const orb = KNOWN_POINTS.has(name) ? cleanOrb(raw, DEFAULT_POINT_ORB) : null;
    if (orb !== null) points[name as OrbPoint] = orb;
  }
  const aspects: OrbSettings['aspects'] = {};
  for (const [type, raw] of Object.entries((v.aspects && typeof v.aspects === 'object' ? v.aspects : {}) as Record<string, unknown>)) {
    const engine = ENGINE_ASPECT_ORB.get(type as AspectType);
    const orb = engine === undefined ? null : cleanOrb(raw, engine);
    if (orb !== null) aspects[type as AspectType] = orb;
  }
  return { points, aspects, pairRule: v.pairRule === 'average' ? 'average' : 'larger' };
}

export function pointOrb(settings: OrbSettings, name: string): number {
  return (KNOWN_POINTS.has(name) ? settings.points[name as OrbPoint] : undefined) ?? DEFAULT_POINT_ORB;
}

export function aspectOrb(settings: OrbSettings, type: AspectType): number {
  return settings.aspects[type] ?? ENGINE_ASPECT_ORB.get(type) ?? 0;
}

export function pairOrb(settings: OrbSettings, a: string, b: string): number {
  const x = pointOrb(settings, a);
  const y = pointOrb(settings, b);
  return settings.pairRule === 'average' ? (x + y) / 2 : Math.max(x, y);
}

/** True when the settings find exactly the engine's aspects (the pair rule alone changes nothing). */
export function isDefaultOrbs(settings: OrbSettings): boolean {
  const clean = cleanOrbSettings(settings);
  return Object.keys(clean.points).length === 0 && Object.keys(clean.aspects).length === 0;
}

/** One-click starting points. Each is an ordinary setting the astrologer can then adjust. */
export const ORB_PRESETS: ReadonlyArray<{ id: string; label: string; settings: OrbSettings }> = [
  { id: 'engine', label: 'Engine default', settings: DEFAULT_ORB_SETTINGS },
  {
    id: 'luminaries', label: 'Wider Sun and Moon',
    settings: { points: { Sun: 10, Moon: 10 }, aspects: {}, pairRule: 'larger' },
  },
  {
    id: 'tight', label: 'Tight',
    settings: {
      points: {},
      aspects: { conjunction: 6, opposition: 6, trine: 5, square: 5, sextile: 4, quincunx: 2, semisextile: 1, semisquare: 1, sesquiquadrate: 1, quintile: 1, biquintile: 1 },
      pairRule: 'larger',
    },
  },
];

/**
 * The chart's aspects under these orbs. With nothing changed the engine's own
 * aspects are returned untouched. Otherwise, for each pair of plotted points
 * and each aspect, the engine's decision stands wherever that tolerance is
 * unchanged; only a changed tolerance is decided again, from the chart's
 * positions. (The engine decides from unrounded positions and the chart
 * carries them to 0.01°, so re-deciding an unchanged tolerance could flip a
 * pair sitting on the boundary.) The engine's aspects to any other body are
 * kept as reported.
 */
export function aspectsWithOrbs(chart: BirthChart, settings: OrbSettings): Aspect[] {
  const engine = chart.aspects || [];
  if (isDefaultOrbs(settings)) return engine;
  const s = cleanOrbSettings(settings);
  const longitudes = aspectEndpointLongitudes(chart);
  const names = [...longitudes.keys()];
  const found: Aspect[] = [];
  for (let i = 0; i < names.length; i++) {
    for (let j = i + 1; j < names.length; j++) {
      const a = names[i];
      const b = names[j];
      if ((a === 'Ascendant' || a === 'Midheaven') && (b === 'Ascendant' || b === 'Midheaven')) continue;
      if (a.endsWith(' Node') && b.endsWith(' Node')) continue;
      let separation = normalizeLongitude(longitudes.get(b)! - longitudes.get(a)!);
      if (separation > 180) separation = 360 - separation;
      const scale = pairOrb(s, a, b) / DEFAULT_POINT_ORB;
      for (const def of ASPECT_DEFINITIONS) {
        const limit = aspectOrb(s, def.type) * scale;
        if (limit === def.orb) {
          const reported = engine.find((x) => x.type === def.type &&
            ((x.planet1 === a && x.planet2 === b) || (x.planet1 === b && x.planet2 === a)));
          if (reported) found.push(reported);
          continue;
        }
        const orb = Math.abs(separation - def.angle);
        if (orb <= limit) {
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
export function withOrbSettings(chart: BirthChart, settings: OrbSettings): BirthChart {
  return isDefaultOrbs(settings) ? chart : { ...chart, aspects: aspectsWithOrbs(chart, settings) };
}
