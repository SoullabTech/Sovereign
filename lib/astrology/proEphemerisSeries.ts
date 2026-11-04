/**
 * ASTRO-PRO-EPHEMERIS-01 — sampled planetary longitudes over a date range,
 * and the exact transit-to-natal hits found in them.
 *
 * Samples are geocentric apparent longitudes of date, one per step. Exact
 * hits are found where the signed distance to (natal + aspect angle) changes
 * sign between samples, refined by linear interpolation — accurate to within
 * a few hours for the Sun and slower bodies. The Moon is excluded from hits:
 * daily samples are too coarse for it. No meaning is assigned to any hit.
 */
import * as Astronomy from 'astronomy-engine';

export const SERIES_BODIES = [
  'Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto',
] as const;
export type SeriesBody = typeof SERIES_BODIES[number];

export const SERIES_LIMITS = { maxDays: 1100, maxSamples: 1500 } as const;

export interface EphemerisSeries {
  from: string;
  stepHours: number;
  /** longitudes[body][i] is the longitude at from + i × step. */
  longitudes: Record<SeriesBody, number[]>;
}

export function longitudeOf(body: SeriesBody, time: Astronomy.AstroTime): number {
  return body === 'Moon'
    ? Astronomy.EclipticGeoMoon(time).lon
    : Astronomy.Ecliptic(Astronomy.GeoVector(Astronomy.Body[body], time, true)).elon;
}

export function ephemerisSeries(from: Date, to: Date, stepHours: number): EphemerisSeries | null {
  const span = to.getTime() - from.getTime();
  if (!Number.isFinite(span) || span <= 0 || span > SERIES_LIMITS.maxDays * 86_400_000) return null;
  if (!Number.isFinite(stepHours) || stepHours < 1) return null;
  const step = stepHours * 3_600_000;
  const count = Math.floor(span / step) + 1;
  if (count > SERIES_LIMITS.maxSamples) return null;
  const longitudes = Object.fromEntries(SERIES_BODIES.map((b) => [b, [] as number[]])) as Record<SeriesBody, number[]>;
  for (let i = 0; i < count; i++) {
    const time = Astronomy.MakeTime(new Date(from.getTime() + i * step));
    for (const body of SERIES_BODIES) longitudes[body].push(Number(longitudeOf(body, time).toFixed(4)));
  }
  return { from: from.toISOString(), stepHours, longitudes };
}

export type HitAspect = 'conjunction' | 'sextile' | 'square' | 'trine' | 'opposition';
const HIT_ANGLES: ReadonlyArray<readonly [HitAspect, number]> = [
  ['conjunction', 0], ['sextile', 60], ['square', 90], ['trine', 120], ['opposition', 180],
];

export interface TransitHit {
  at: string;
  transit: SeriesBody;
  natal: string;
  type: HitAspect;
  retrograde: boolean;
}

function signedDelta(value: number, target: number): number {
  return ((value - target) % 360 + 540) % 360 - 180;
}

/** Exact transit-to-natal aspect moments inside the sampled range. */
export function transitHits(
  series: EphemerisSeries,
  natal: readonly { name: string; longitude: number }[],
): TransitHit[] {
  const start = new Date(series.from).getTime();
  const step = series.stepHours * 3_600_000;
  const hits: TransitHit[] = [];
  for (const body of SERIES_BODIES) {
    if (body === 'Moon') continue;
    const lons = series.longitudes[body];
    for (const point of natal) {
      for (const [type, angle] of HIT_ANGLES) {
        // Each angle other than 0/180 has two targets (waxing and waning side).
        const targets = angle === 0 || angle === 180 ? [point.longitude + angle] : [point.longitude + angle, point.longitude - angle];
        for (const target of targets) {
          for (let i = 1; i < lons.length; i++) {
            const d0 = signedDelta(lons[i - 1], target);
            const d1 = signedDelta(lons[i], target);
            if (d0 === 0 || Math.sign(d0) === Math.sign(d1) || Math.abs(d1 - d0) > 90) continue;
            const fraction = d0 / (d0 - d1);
            hits.push({
              at: new Date(start + (i - 1 + fraction) * step).toISOString(),
              transit: body, natal: point.name, type,
              retrograde: d1 < d0,
            });
          }
        }
      }
    }
  }
  return hits.sort((a, b) => a.at.localeCompare(b.at));
}
