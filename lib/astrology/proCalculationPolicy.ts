/**
 * ASTRO-CALC-PRIV-01 — bounded professional chart calculation admission.
 *
 * Calculates NO astrological meanings. Explicitly refuses inputs that would
 * trigger approximation, unsupported house labels, or ambiguous local time.
 * This does not replace astronomical reference certification.
 */
import { isValidTimeZone, resolveBirthTimeUTC, type BirthData, type HouseSystem } from './ephemerisCalculator';

export type ProCalculationError =
  | 'INVALID_REQUEST'
  | 'INVALID_BIRTH_DATE'
  | 'INVALID_BIRTH_TIME'
  | 'INVALID_COORDINATES'
  | 'TIMEZONE_REQUIRED'
  | 'TIMEZONE_INVALID'
  | 'TIME_AMBIGUOUS'
  | 'TIME_NONEXISTENT'
  | 'TIME_ENGINE_MISMATCH'
  | 'HOUSE_SYSTEM_UNSUPPORTED'
  | 'LATITUDE_UNVERIFIED';

export type ProAdmission =
  | { ok: true; birthData: BirthData; actualHouseSystem: HouseSystem; verifiedUtc: string }
  | { ok: false; error: ProCalculationError };

export const PRO_SUPPORTED_HOUSE_SYSTEMS: ReadonlyArray<HouseSystem> =
  Object.freeze(['whole-sign', 'equal', 'porphyry']);
export const PRO_MAX_TESTED_LATITUDE = 66;

function utcMilliseconds(year: number, month: number, day: number, hours: number, minutes: number): number {
  const date = new Date(0);
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCFullYear(year, month - 1, day);
  date.setUTCHours(hours, minutes);
  return date.getTime();
}
function wallTimeAt(timeZone: string, utcMs: number) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(new Date(utcMs));
  const get = (kind: string) => Number(parts.find(p => p.type === kind)?.value);
  return { year: get('year'), month: get('month'), day: get('day'),
    hours: get('hour') % 24, minutes: get('minute') };
}

/** All real UTC instants matching a local wall time, using current IANA data. */
export function matchingUtcInstants(
  date: string, clock: string, timeZone: string,
): string[] {
  if (!isValidTimeZone(timeZone)) return [];
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(clock)) return [];
  const [year, month, day] = date.split('-').map(Number);
  const [hours, minutes] = clock.split(':').map(Number);
  if (!Number.isInteger(year) || hours > 23 || minutes > 59) return [];
  const wallMillis = utcMilliseconds(year, month, day, hours, minutes);
  const offsets = new Set<number>();
  // Probe around the candidate wall instant; this observes offset changes
  // during spring/fall transitions (including ±30m political changes).
  for (let delta = -36; delta <= 36; delta += 3) {
    const trialMs = wallMillis + delta * 3_600_000;
    const rendered = wallTimeAt(timeZone, trialMs);
    const renderedAsUTC = utcMilliseconds(
      rendered.year, rendered.month, rendered.day, rendered.hours, rendered.minutes,
    );
    offsets.add(Math.round((renderedAsUTC - trialMs) / 60_000));
  }
  const candidates = new Set<string>();
  for (const offset of offsets) {
    const instant = wallMillis - offset * 60_000;
    const parts = wallTimeAt(timeZone, instant);
    if (parts.year === year && parts.month === month && parts.day === day &&
        parts.hours === hours && parts.minutes === minutes) {
      candidates.add(new Date(instant).toISOString());
    }
  }
  return [...candidates].sort();
}

/**
 * The caller must explicitly select calculationProfile=strict-core. Legacy
 * birth-chart consumers remain unchanged until their own compatibility gates.
 */
export function admitProCalculation(payload: unknown): ProAdmission {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return { ok: false, error: 'INVALID_REQUEST' };
  }
  const body = payload as Record<string, unknown>;
  const rawDate = body.date;
  const rawTime = body.time;
  if (typeof rawDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
    return { ok: false, error: 'INVALID_BIRTH_DATE' };
  }
  const [year, month, day] = rawDate.split('-').map(Number);
  const roundTrip = new Date(utcMilliseconds(year, month, day, 0, 0));
  if (roundTrip.getUTCFullYear() !== year || roundTrip.getUTCMonth() !== month - 1 ||
      roundTrip.getUTCDate() !== day) return { ok: false, error: 'INVALID_BIRTH_DATE' };
  // Engine truncates seconds in current implementation. Do not pretend otherwise.
  if (typeof rawTime !== 'string' || !/^\d{2}:\d{2}$/.test(rawTime)) {
    return { ok: false, error: 'INVALID_BIRTH_TIME' };
  }
  const [hours, minutes] = rawTime.split(':').map(Number);
  if (hours > 23 || minutes > 59) return { ok: false, error: 'INVALID_BIRTH_TIME' };
  const loc = body.location;
  if (!loc || typeof loc !== 'object' || Array.isArray(loc)) return { ok: false, error: 'INVALID_COORDINATES' };
  const coords = loc as Record<string, unknown>;
  const lat = coords.lat;
  const lng = coords.lng;
  if (typeof lat !== 'number' || typeof lng !== 'number' ||
      !Number.isFinite(lat) || !Number.isFinite(lng) ||
      lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return { ok: false, error: 'INVALID_COORDINATES' };
  }
  if (Math.abs(lat) >= PRO_MAX_TESTED_LATITUDE) return { ok: false, error: 'LATITUDE_UNVERIFIED' };
  const timezone = coords.timezone;
  if (typeof timezone !== 'string' || !timezone.trim()) return { ok: false, error: 'TIMEZONE_REQUIRED' };
  if (!isValidTimeZone(timezone)) return { ok: false, error: 'TIMEZONE_INVALID' };
  const houseSystem = body.houseSystem ?? 'porphyry';
  if (typeof houseSystem !== 'string' || !PRO_SUPPORTED_HOUSE_SYSTEMS.includes(houseSystem as HouseSystem)) {
    return { ok: false, error: 'HOUSE_SYSTEM_UNSUPPORTED' };
  }
  const matches = matchingUtcInstants(rawDate, rawTime, timezone);
  if (matches.length === 0) return { ok: false, error: 'TIME_NONEXISTENT' };
  if (matches.length > 1) return { ok: false, error: 'TIME_AMBIGUOUS' };
  const converted = resolveBirthTimeUTC(year, month, day, hours, minutes, timezone, lng);
  if (converted.source !== 'iana' || converted.utc.toISOString() !== matches[0]) {
    return { ok: false, error: 'TIME_ENGINE_MISMATCH' };
  }
  return {
    ok: true,
    birthData: {
      date: rawDate, time: rawTime,
      location: { lat, lng, timezone }, houseSystem: houseSystem as HouseSystem,
      qualityMode: 'strict-core',
    },
    actualHouseSystem: houseSystem as HouseSystem,
    verifiedUtc: matches[0],
  };
}
