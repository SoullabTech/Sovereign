/**
 * Transit Field — the current sky meeting one natal chart.
 *
 * JARVIS-ASTROLOGY-SOUL-JOURNEY-01 · T0/T1.
 *
 * This module answers one question: which bodies in the current sky are
 * actually contacting this natal chart, and how is each contact moving?
 * It calculates; it does not interpret. Symbolic reading, whole-chart
 * synthesis and member meaning live in other layers and may not be
 * smuggled in here.
 *
 * Epistemic discipline (T0 census findings, carried as law):
 *   - Only bodies computed from a real ephemeris (astronomy-engine) are
 *     admitted as transiting bodies. Linear "mean motion" approximations for
 *     Chiron, the asteroids, Lilith and the node are NOT admitted: an
 *     approximate position may not be stated as an activation.
 *   - Applying vs separating is derived from the actual change in deviation
 *     from exact over time — it accounts for retrograde motion. The legacy
 *     `diff < angle` shortcut in /api/astrology/current-transits was wrong
 *     for half of all cases and is not reused.
 *   - Exact passes and activation windows are found by sampling the real
 *     ephemeris and refining minima; a window that runs past the search
 *     horizon is reported as open-ended, never invented.
 *   - Ordering is a stated rule (slower bodies first, then closeness to
 *     exact), never an editorial importance score.
 *
 * Frame: geocentric, tropical, true ecliptic of date — the same frame as the
 * natal engine (lib/astrology/ephemerisCalculator.ts). Aspect geometry is
 * computed in this frame regardless of the member's display lens.
 */

import * as Astronomy from 'astronomy-engine';

export const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
] as const;

export type TransitingBody =
  | 'Sun' | 'Moon' | 'Mercury' | 'Venus' | 'Mars'
  | 'Jupiter' | 'Saturn' | 'Uranus' | 'Neptune' | 'Pluto';

export type AspectName = 'conjunction' | 'sextile' | 'square' | 'trine' | 'opposition';
export type TransitScale = 'major' | 'minor';
export type TransitMotion = 'applying' | 'separating';

export interface AspectDef {
  name: AspectName;
  angle: number;
  symbol: string;
}

export const TRANSIT_ASPECTS: readonly AspectDef[] = [
  { name: 'conjunction', angle: 0, symbol: '☌' },
  { name: 'sextile', angle: 60, symbol: '⚹' },
  { name: 'square', angle: 90, symbol: '□' },
  { name: 'trine', angle: 120, symbol: '△' },
  { name: 'opposition', angle: 180, symbol: '☍' },
];

interface BodyProfile {
  scale: TransitScale;
  /** Orb for conjunction / square / trine / opposition, degrees. */
  orb: number;
  /** Orb for sextile, degrees. */
  sextileOrb: number;
  /** Search horizon either side of now, days. */
  horizonDays: number;
  /** Sampling step, hours. */
  stepHours: number;
  /** Typical |daily motion|, degrees — used only to recognise a station. */
  typicalSpeed: number;
  /** Plain-language duration grammar for the surface. */
  pace: string;
}

/**
 * The transit orb and salience table. This IS the salience grammar: every
 * value here is visible to the member through `orbTable` and `reasons`.
 */
export const BODY_PROFILES: Record<TransitingBody, BodyProfile> = {
  Moon:    { scale: 'minor', orb: 1.5, sextileOrb: 1,   horizonDays: 1.5, stepHours: 0.5, typicalSpeed: 13.2,  pace: 'passes within hours' },
  Sun:     { scale: 'minor', orb: 2,   sextileOrb: 1.5, horizonDays: 6,   stepHours: 2,   typicalSpeed: 0.99,  pace: 'lasts a few days' },
  Mercury: { scale: 'minor', orb: 2,   sextileOrb: 1.5, horizonDays: 60,  stepHours: 4,   typicalSpeed: 1.2,   pace: 'lasts days; longer around a station' },
  Venus:   { scale: 'minor', orb: 2,   sextileOrb: 1.5, horizonDays: 60,  stepHours: 4,   typicalSpeed: 1.1,   pace: 'lasts days; longer around a station' },
  Mars:    { scale: 'minor', orb: 2,   sextileOrb: 1.5, horizonDays: 120, stepHours: 8,   typicalSpeed: 0.55,  pace: 'lasts about a week; longer around a station' },
  Jupiter: { scale: 'major', orb: 3,   sextileOrb: 2,   horizonDays: 260, stepHours: 24,  typicalSpeed: 0.12,  pace: 'a developmental arc of weeks to months' },
  Saturn:  { scale: 'major', orb: 3,   sextileOrb: 2,   horizonDays: 320, stepHours: 24,  typicalSpeed: 0.06,  pace: 'a developmental arc of months' },
  Uranus:  { scale: 'major', orb: 3,   sextileOrb: 2,   horizonDays: 420, stepHours: 24,  typicalSpeed: 0.03,  pace: 'a long developmental arc, often over a year' },
  Neptune: { scale: 'major', orb: 3,   sextileOrb: 2,   horizonDays: 420, stepHours: 24,  typicalSpeed: 0.02,  pace: 'a long developmental arc, often over a year' },
  Pluto:   { scale: 'major', orb: 3,   sextileOrb: 2,   horizonDays: 420, stepHours: 24,  typicalSpeed: 0.015, pace: 'a long developmental arc, often over a year' },
};

export const TRANSITING_BODIES = Object.keys(BODY_PROFILES) as TransitingBody[];

/** Natal points admitted as contact targets, and why the rest are not. */
export const ADMITTED_NATAL_POINTS = [
  'Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn',
  'Uranus', 'Neptune', 'Pluto', 'Ascendant', 'Midheaven',
] as const;
export type NatalPointName = (typeof ADMITTED_NATAL_POINTS)[number];

export const EXCLUDED_POINTS: ReadonlyArray<{ point: string; reason: string }> = [
  { point: 'Chiron, Ceres, Pallas, Juno, Vesta', reason: 'Positions are approximated from orbital elements, not a full ephemeris; contacts are not stated.' },
  { point: 'Lilith and the lunar nodes', reason: 'Calculated as mean points; held out of the activation field until a true-point calculation is admitted.' },
];

const ANGLES: ReadonlySet<string> = new Set(['Ascendant', 'Midheaven']);
const LUMINARIES: ReadonlySet<string> = new Set(['Sun', 'Moon']);

/** Below this deviation (degrees) a contact is described as exact. */
export const EXACT_THRESHOLD = 1 / 60;

export interface NatalPointInput {
  point: string;
  /** Tropical ecliptic longitude, 0–360. */
  longitude: number;
}

export interface ExactPass {
  at: string;
  /** Minimum deviation reached at this pass, degrees. */
  deviation: number;
  /** True when the pass reaches exact; false when the body stations short. */
  perfects: boolean;
}

export interface TransitActivation {
  id: string;
  transiting: {
    body: TransitingBody;
    longitude: number;
    sign: string;
    degree: number;
    retrograde: boolean;
    stationary: boolean;
    speedPerDay: number;
  };
  natal: { point: string; longitude: number; sign: string; degree: number };
  aspect: AspectDef;
  /** Current distance from exact, degrees. */
  deviation: number;
  allowedOrb: number;
  motion: TransitMotion;
  scale: TransitScale;
  /** Why this contact is surfaced and where it sits — the visible salience grammar. */
  reasons: string[];
  timing: {
    windowStart: string | null;
    windowEnd: string | null;
    /** Window began before the search horizon; start is not known. */
    openStart: boolean;
    /** Window continues past the search horizon; end is not known. */
    openEnd: boolean;
    passes: ExactPass[];
    nextExact: string | null;
    lastExact: string | null;
    precision: 'hour';
  };
  authority: 'calculated';
}

export interface SkyPosition {
  body: TransitingBody;
  longitude: number;
  sign: string;
  degree: number;
  retrograde: boolean;
}

export interface TransitField {
  calculatedAt: string;
  frame: 'geocentric · tropical · true ecliptic of date';
  sky: SkyPosition[];
  activations: TransitActivation[];
  counts: { major: number; minor: number; all: number };
  orderingRule: string;
  orbTable: Array<{ body: TransitingBody; scale: TransitScale; orb: number; sextileOrb: number; pace: string }>;
  excluded: ReadonlyArray<{ point: string; reason: string }>;
  ignoredNatalPoints: string[];
}

export const ORDERING_RULE =
  'Slower bodies first (major before minor), then the contact closest to exact. No importance score is applied.';

// ─────────────────────────────────────────────────────────────────────────────
// Geometry
// ─────────────────────────────────────────────────────────────────────────────

export function normalize(longitude: number): number {
  return ((longitude % 360) + 360) % 360;
}

export function toZodiac(longitude: number): { sign: string; degree: number } {
  const lon = normalize(longitude);
  const index = Math.min(11, Math.floor(lon / 30));
  return { sign: ZODIAC_SIGNS[index], degree: lon - index * 30 };
}

export function signDegreeToLongitude(sign: string, degree: number): number | null {
  const index = ZODIAC_SIGNS.findIndex((s) => s.toLowerCase() === sign.toLowerCase());
  if (index < 0 || !Number.isFinite(degree)) return null;
  return index * 30 + degree;
}

/** Acute angular separation, 0–180. */
export function separation(a: number, b: number): number {
  const d = Math.abs(normalize(a) - normalize(b));
  return d > 180 ? 360 - d : d;
}

export function deviationFromAspect(transitLon: number, natalLon: number, angle: number): number {
  return Math.abs(separation(transitLon, natalLon) - angle);
}

const ASTRO_BODY: Record<Exclude<TransitingBody, 'Sun' | 'Moon'>, Astronomy.Body> = {
  Mercury: Astronomy.Body.Mercury,
  Venus: Astronomy.Body.Venus,
  Mars: Astronomy.Body.Mars,
  Jupiter: Astronomy.Body.Jupiter,
  Saturn: Astronomy.Body.Saturn,
  Uranus: Astronomy.Body.Uranus,
  Neptune: Astronomy.Body.Neptune,
  Pluto: Astronomy.Body.Pluto,
};

/** Geocentric tropical ecliptic longitude (true ecliptic of date). */
export function bodyLongitude(body: TransitingBody, date: Date): number {
  const time = Astronomy.MakeTime(date);
  if (body === 'Sun') return normalize(Astronomy.SunPosition(time).elon);
  if (body === 'Moon') return normalize(Astronomy.EclipticGeoMoon(time).lon);
  return normalize(Astronomy.Ecliptic(Astronomy.GeoVector(ASTRO_BODY[body], time, true)).elon);
}

/** Signed daily motion in longitude, degrees/day (negative = retrograde). */
export function bodySpeed(body: TransitingBody, date: Date): number {
  const h = 6 * 3600_000;
  const before = bodyLongitude(body, new Date(date.getTime() - h));
  const after = bodyLongitude(body, new Date(date.getTime() + h));
  let d = after - before;
  if (d > 180) d -= 360;
  if (d < -180) d += 360;
  return d / 0.5;
}

// ─────────────────────────────────────────────────────────────────────────────
// Temporal search
// ─────────────────────────────────────────────────────────────────────────────

interface Samples {
  times: number[];
  longitudes: number[];
  nowIndex: number;
  stepMs: number;
}

function sampleBody(body: TransitingBody, now: Date): Samples {
  const profile = BODY_PROFILES[body];
  const stepMs = profile.stepHours * 3600_000;
  const steps = Math.ceil((profile.horizonDays * 24) / profile.stepHours);
  const times: number[] = [];
  const longitudes: number[] = [];
  for (let i = -steps; i <= steps; i++) {
    const t = now.getTime() + i * stepMs;
    times.push(t);
    longitudes.push(bodyLongitude(body, new Date(t)));
  }
  return { times, longitudes, nowIndex: steps, stepMs };
}

/** Golden-section minimisation of deviation on [a, b] (ms). */
function refineMinimum(
  body: TransitingBody,
  natalLon: number,
  angle: number,
  a: number,
  b: number,
): { t: number; deviation: number } {
  const f = (t: number) => deviationFromAspect(bodyLongitude(body, new Date(t)), natalLon, angle);
  const g = (Math.sqrt(5) - 1) / 2;
  let lo = a;
  let hi = b;
  let c = hi - g * (hi - lo);
  let d = lo + g * (hi - lo);
  let fc = f(c);
  let fd = f(d);
  while (hi - lo > 60_000) {
    if (fc < fd) {
      hi = d; d = c; fd = fc; c = hi - g * (hi - lo); fc = f(c);
    } else {
      lo = c; c = d; fc = fd; d = lo + g * (hi - lo); fd = f(d);
    }
  }
  const t = (lo + hi) / 2;
  return { t, deviation: f(t) };
}

/** Bisect the orb boundary between an inside and an outside sample (ms), to the hour. */
function refineEdge(
  body: TransitingBody,
  natalLon: number,
  angle: number,
  orb: number,
  inside: number,
  outside: number,
): number {
  const f = (t: number) => deviationFromAspect(bodyLongitude(body, new Date(t)), natalLon, angle);
  let a = inside;
  let b = outside;
  while (Math.abs(b - a) > 3600_000) {
    const m = (a + b) / 2;
    if (f(m) <= orb) a = m; else b = m;
  }
  return a;
}

function iso(t: number): string {
  return new Date(t).toISOString();
}

function computeTiming(
  body: TransitingBody,
  samples: Samples,
  natalLon: number,
  angle: number,
  orb: number,
): TransitActivation['timing'] {
  const devs = samples.longitudes.map((lon) => deviationFromAspect(lon, natalLon, angle));
  const n = devs.length;

  let startIdx = samples.nowIndex;
  while (startIdx > 0 && devs[startIdx - 1] <= orb) startIdx--;
  let endIdx = samples.nowIndex;
  while (endIdx < n - 1 && devs[endIdx + 1] <= orb) endIdx++;

  const openStart = startIdx === 0 && devs[0] <= orb;
  const openEnd = endIdx === n - 1 && devs[n - 1] <= orb;

  const passes: ExactPass[] = [];
  for (let i = Math.max(startIdx, 0); i <= endIdx; i++) {
    const prev = i > 0 ? devs[i - 1] : Infinity;
    const next = i < n - 1 ? devs[i + 1] : Infinity;
    if (devs[i] <= prev && devs[i] < next) {
      const a = samples.times[Math.max(0, i - 1)];
      const b = samples.times[Math.min(n - 1, i + 1)];
      const refined = refineMinimum(body, natalLon, angle, a, b);
      // A minimum on the window edge is the window boundary, not a pass.
      if (refined.deviation > orb) continue;
      if (passes.some((p) => Math.abs(Date.parse(p.at) - refined.t) < samples.stepMs)) continue;
      passes.push({
        at: iso(refined.t),
        deviation: refined.deviation,
        perfects: refined.deviation <= EXACT_THRESHOLD,
      });
    }
  }

  const now = samples.times[samples.nowIndex];
  const perfecting = passes.filter((p) => p.perfects).map((p) => Date.parse(p.at));
  const nextExact = perfecting.filter((t) => t >= now).sort((x, y) => x - y)[0];
  const lastExact = perfecting.filter((t) => t < now).sort((x, y) => y - x)[0];

  return {
    windowStart: openStart
      ? null
      : iso(refineEdge(body, natalLon, angle, orb, samples.times[startIdx], samples.times[startIdx - 1])),
    windowEnd: openEnd
      ? null
      : iso(refineEdge(body, natalLon, angle, orb, samples.times[endIdx], samples.times[endIdx + 1])),
    openStart,
    openEnd,
    passes,
    nextExact: nextExact !== undefined ? iso(nextExact) : null,
    lastExact: lastExact !== undefined ? iso(lastExact) : null,
    precision: 'hour',
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Field
// ─────────────────────────────────────────────────────────────────────────────

function reasonsFor(
  body: TransitingBody,
  natalPoint: string,
  deviation: number,
  stationary: boolean,
): string[] {
  const profile = BODY_PROFILES[body];
  const reasons = [
    profile.scale === 'major'
      ? `${body} moves slowly — ${profile.pace}.`
      : `${body} moves quickly — ${profile.pace}.`,
  ];
  if (ANGLES.has(natalPoint)) reasons.push(`Contacts a chart angle (${natalPoint}); its position depends on birth time.`);
  if (LUMINARIES.has(natalPoint)) reasons.push(`Contacts a natal luminary (${natalPoint}).`);
  if (deviation <= 1) reasons.push('Within one degree of exact.');
  if (stationary) reasons.push(`${body} is near a station, so the contact lingers.`);
  return reasons;
}

export function calculateTransitField(
  natal: NatalPointInput[],
  now: Date = new Date(),
): TransitField {
  const admitted = new Set<string>(ADMITTED_NATAL_POINTS);
  const natalPoints = natal.filter(
    (p) => admitted.has(p.point) && Number.isFinite(p.longitude),
  );
  const ignoredNatalPoints = natal.filter((p) => !admitted.has(p.point)).map((p) => p.point);

  const sky: SkyPosition[] = [];
  const activations: TransitActivation[] = [];

  for (const body of TRANSITING_BODIES) {
    const profile = BODY_PROFILES[body];
    const lon = bodyLongitude(body, now);
    const speed = bodySpeed(body, now);
    const retrograde = speed < 0;
    const stationary = Math.abs(speed) < profile.typicalSpeed * 0.1 && body !== 'Sun' && body !== 'Moon';
    const z = toZodiac(lon);
    sky.push({ body, longitude: lon, sign: z.sign, degree: z.degree, retrograde });

    let samples: Samples | null = null;

    for (const point of natalPoints) {
      const natalLon = normalize(point.longitude);
      for (const aspect of TRANSIT_ASPECTS) {
        const allowedOrb = aspect.name === 'sextile' ? profile.sextileOrb : profile.orb;
        const deviation = deviationFromAspect(lon, natalLon, aspect.angle);
        if (deviation > allowedOrb) continue;

        // Applying/separating from the actual change in deviation, so
        // retrograde motion is accounted for.
        const ahead = deviationFromAspect(
          bodyLongitude(body, new Date(now.getTime() + 3600_000)), natalLon, aspect.angle,
        );
        const motion: TransitMotion = ahead < deviation ? 'applying' : 'separating';

        if (!samples) samples = sampleBody(body, now);
        const timing = computeTiming(body, samples, natalLon, aspect.angle, allowedOrb);
        const nz = toZodiac(natalLon);

        activations.push({
          id: `${body}-${aspect.name}-${point.point}`.toLowerCase().replace(/\s+/g, '-'),
          transiting: { body, longitude: lon, sign: z.sign, degree: z.degree, retrograde, stationary, speedPerDay: speed },
          natal: { point: point.point, longitude: natalLon, sign: nz.sign, degree: nz.degree },
          aspect,
          deviation,
          allowedOrb,
          motion,
          scale: profile.scale,
          reasons: reasonsFor(body, point.point, deviation, stationary),
          timing,
          authority: 'calculated',
        });
      }
    }
  }

  activations.sort((a, b) => {
    if (a.scale !== b.scale) return a.scale === 'major' ? -1 : 1;
    return a.deviation - b.deviation;
  });

  const major = activations.filter((a) => a.scale === 'major').length;
  return {
    calculatedAt: now.toISOString(),
    frame: 'geocentric · tropical · true ecliptic of date',
    sky,
    activations,
    counts: { major, minor: activations.length - major, all: activations.length },
    orderingRule: ORDERING_RULE,
    orbTable: TRANSITING_BODIES.map((body) => ({
      body,
      scale: BODY_PROFILES[body].scale,
      orb: BODY_PROFILES[body].orb,
      sextileOrb: BODY_PROFILES[body].sextileOrb,
      pace: BODY_PROFILES[body].pace,
    })),
    excluded: EXCLUDED_POINTS,
    ignoredNatalPoints,
  };
}

/** Degrees → `0°24′`. */
export function formatOrb(deg: number): string {
  let d = Math.floor(deg);
  let m = Math.round((deg - d) * 60);
  if (m === 60) { d += 1; m = 0; }
  return `${d}°${String(m).padStart(2, '0')}′`;
}
