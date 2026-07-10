/**
 * Adapter: sign+degree chart shapes → the grammar's `ChartPositions`.
 *
 * The live pipelines (`BirthChart` in lib/astrology/ephemerisCalculator,
 * `BirthChartData` on app/chart) carry per-body {sign, degree-within-sign}
 * rather than raw ecliptic longitude. This adapter reconstructs the
 * longitude (signIndex * 30 + degree) so `registerChart` — which owns sign
 * resolution end-to-end (SH-10) — remains the only registration authority.
 *
 * Refuse-not-repair: an unknown sign or non-finite degree throws; the
 * adapter never guesses. Callers on UI boundaries should catch and render
 * absence, not a default.
 *
 * Both-shapes note: the parameter type is structural (lowercase body keys,
 * each with sign+degree) so `BirthChart` and the chart page's local
 * `BirthChartData` both satisfy it without casts.
 *
 * Mode note: these chart shapes carry no birth-time-uncertainty metadata,
 * so the adapter emits mode 'timed' with no Moon branches. Noon-mode /
 * Moon-branched interpretation requires calling `interpretDominance` with
 * an explicitly constructed `ChartPositions` (SH-10) — it cannot be
 * recovered from these shapes.
 */

import type { ChartPositions, Q1Body } from '../registration';
import { SIGNS_IN_LONGITUDE_ORDER } from '../registration';

export class ChartAdapterError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ChartAdapterError';
  }
}

export interface SignDegreePosition {
  sign: string;
  degree: number;
}

/** The ten Q1 bodies in the lowercase key convention of the live chart shapes. */
export interface SignDegreeChart {
  sun: SignDegreePosition;
  moon: SignDegreePosition;
  mercury: SignDegreePosition;
  venus: SignDegreePosition;
  mars: SignDegreePosition;
  jupiter: SignDegreePosition;
  saturn: SignDegreePosition;
  uranus: SignDegreePosition;
  neptune: SignDegreePosition;
  pluto: SignDegreePosition;
}

const KEY_TO_BODY: ReadonlyArray<[keyof SignDegreeChart, Q1Body]> = [
  ['sun', 'Sun'],
  ['moon', 'Moon'],
  ['mercury', 'Mercury'],
  ['venus', 'Venus'],
  ['mars', 'Mars'],
  ['jupiter', 'Jupiter'],
  ['saturn', 'Saturn'],
  ['uranus', 'Uranus'],
  ['neptune', 'Neptune'],
  ['pluto', 'Pluto'],
];

function toLongitude(position: SignDegreePosition | undefined, body: Q1Body): number {
  if (!position || typeof position.sign !== 'string') {
    throw new ChartAdapterError(`Missing sign for ${body}`);
  }
  const signIndex = SIGNS_IN_LONGITUDE_ORDER.indexOf(
    position.sign as (typeof SIGNS_IN_LONGITUDE_ORDER)[number],
  );
  if (signIndex === -1) {
    throw new ChartAdapterError(`Unknown zodiac sign for ${body}: ${position.sign}`);
  }
  const degree = position.degree;
  if (typeof degree !== 'number' || !Number.isFinite(degree)) {
    throw new ChartAdapterError(`Non-finite degree for ${body}`);
  }
  // The sign is authoritative here (it was resolved upstream from the
  // unrounded longitude); clamp the within-sign degree into [0, 30) so a
  // legacy rounded 30.00° cannot leak the body into the next sign.
  const clamped = Math.min(Math.max(degree, 0), 29.999999);
  return signIndex * 30 + clamped;
}

/** Build `ChartPositions` (mode 'timed') from a sign+degree chart shape. */
export function chartPositionsFromSignDegrees(chart: SignDegreeChart): ChartPositions {
  const bodies = {} as Record<Q1Body, number>;
  for (const [key, body] of KEY_TO_BODY) {
    bodies[body] = toLongitude(chart[key], body);
  }
  return { bodies, mode: 'timed' };
}
