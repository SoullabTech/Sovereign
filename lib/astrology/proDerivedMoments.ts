/**
 * ASTRO-PRO-DERIVED-01 — the moments behind progressed and return charts.
 *
 * Secondary progression: one day after birth for each year of life. The
 *   progressed chart is cast for that instant at the birth place.
 * Returns: the first instant at or after a chosen date when a body comes back
 *   to its exact natal longitude (geocentric, apparent, of date). The return
 *   chart is cast for that instant at the birth place.
 *
 * Pure astronomy; assigns no meaning.
 */
import * as Astronomy from 'astronomy-engine';

export const RETURN_BODIES = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'] as const;
export type ReturnBody = typeof RETURN_BODIES[number];

const TROPICAL_YEAR_DAYS = 365.242189;
const DAY_MS = 86_400_000;

/** Coarse search step and longest window, per body. */
const SEARCH: Record<ReturnBody, { stepDays: number; windowDays: number }> = {
  Moon: { stepDays: 0.25, windowDays: 30 },
  Sun: { stepDays: 1, windowDays: 370 },
  Mercury: { stepDays: 0.5, windowDays: 400 },
  Venus: { stepDays: 0.5, windowDays: 600 },
  Mars: { stepDays: 1, windowDays: 820 },
  Jupiter: { stepDays: 2, windowDays: 4_600 },
  Saturn: { stepDays: 3, windowDays: 11_000 },
};

export function geocentricLongitude(body: ReturnBody, date: Date): number {
  const time = Astronomy.MakeTime(date);
  return body === 'Moon'
    ? Astronomy.EclipticGeoMoon(time).lon
    : Astronomy.Ecliptic(Astronomy.GeoVector(Astronomy.Body[body], time, true)).elon;
}

/** Signed difference lon − target in (−180, 180]. */
function signedDelta(lon: number, target: number): number {
  const d = ((lon - target) % 360 + 540) % 360 - 180;
  return d === -180 ? 180 : d;
}

/** The progressed instant for a target date, given the birth instant. */
export function secondaryProgressionInstant(birthUtc: Date, target: Date): Date {
  const ageYears = (target.getTime() - birthUtc.getTime()) / (TROPICAL_YEAR_DAYS * DAY_MS);
  return new Date(birthUtc.getTime() + ageYears * DAY_MS);
}

/**
 * First instant ≥ from when `body` reaches `targetLongitude` moving forward
 * through it. Returns null if not found inside the body's search window.
 */
export function findReturn(body: ReturnBody, targetLongitude: number, from: Date): Date | null {
  const { stepDays, windowDays } = SEARCH[body];
  const step = stepDays * DAY_MS;
  let t0 = from.getTime();
  let d0 = signedDelta(geocentricLongitude(body, new Date(t0)), targetLongitude);
  const end = t0 + windowDays * DAY_MS;
  while (t0 < end) {
    const t1 = t0 + step;
    const d1 = signedDelta(geocentricLongitude(body, new Date(t1)), targetLongitude);
    // A forward crossing: from behind the target to at/past it, not the jump
    // on the far side of the circle.
    if (d0 < 0 && d1 >= 0 && d1 - d0 < 90) {
      let lo = t0;
      let hi = t1;
      while (hi - lo > 1000) {
        const mid = (lo + hi) / 2;
        if (signedDelta(geocentricLongitude(body, new Date(mid)), targetLongitude) < 0) lo = mid;
        else hi = mid;
      }
      return new Date(Math.round(hi / 1000) * 1000);
    }
    t0 = t1;
    d0 = d1;
  }
  return null;
}

/** UTC wall date and minute for casting a chart with timezone Etc/UTC. */
export function utcParts(date: Date): { date: string; time: string } {
  const iso = new Date(Math.round(date.getTime() / 60_000) * 60_000).toISOString();
  return { date: iso.slice(0, 10), time: iso.slice(11, 16) };
}
