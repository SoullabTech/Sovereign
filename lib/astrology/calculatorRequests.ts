/**
 * Bounded admission for the identity-free astrology calculators.
 * The provisional operator gate is 60 calculation requests per 60 seconds,
 * aggregate across both routes in one process. It is not a per-person/IP limit,
 * durable limit, or multi-process capacity control. Reassess before scaling out.
 */
import { NextResponse } from 'next/server';
import { createRateLimiter } from '@/lib/http/rateLimit';
import { resolveBirthTimeUTC, type BirthData, type HouseSystem } from '@/lib/astrology/ephemerisCalculator';
import type { AyanamsaType } from '@/lib/astrology/types/vedic';

export const BIRTH_CHART_BODY_LIMIT = 8 * 1024;
export const TRANSIT_BODY_LIMIT = 64 * 1024;
export const VEDIC_BODY_LIMIT = 16 * 1024;
export const CALCULATOR_REQUEST_LIMIT = 60;
export const CALCULATOR_WINDOW_MS = 60_000;
export const MAX_TIMEZONE_LENGTH = 128;

// Member-supplied birth data can appear in calculator POST bodies or results.
export const CALCULATOR_PRIVATE_HEADERS = {
  'Cache-Control': 'private, no-store',
  'X-Content-Type-Options': 'nosniff',
};

export interface CalculatorFailure {
  ok: false;
  status: 400 | 408 | 413 | 429;
  code: string;
  retryAfter?: number;
}
export type CalculatorResult<T> = { ok: true; value: T } | CalculatorFailure;

function failure(status: CalculatorFailure['status'], code: string): CalculatorFailure {
  return { ok: false, status, code };
}

// Symbol.for keeps a single limiter when Next emits separate route bundles in
// the same process. The existing limiter implementation remains unchanged.
const BUDGET_SYMBOL = Symbol.for('soullab.astrology.calculatorBudget.v1');
type BudgetState = { limited: ReturnType<typeof createRateLimiter> };
const processBudget = globalThis as typeof globalThis & Record<symbol, BudgetState | undefined>;
const budget = processBudget[BUDGET_SYMBOL] ??
  (processBudget[BUDGET_SYMBOL] = {
    limited: createRateLimiter(CALCULATOR_REQUEST_LIMIT, CALCULATOR_WINDOW_MS),
  });

export function takeCalculatorBudget(now = Date.now()): CalculatorFailure | null {
  if (!budget.limited('calculator', now)) return null;
  return {
    ...failure(429, 'CALCULATOR_RATE_LIMITED'),
    retryAfter: Math.ceil(CALCULATOR_WINDOW_MS / 1000),
  };
}

export function calculatorFailureResponse(result: CalculatorFailure) {
  const error = result.status === 429 ? 'Calculator request limit reached'
    : result.status === 408 ? 'Calculator request body timed out'
    : result.status === 413 ? 'Calculator request body too large' : 'Invalid calculator request';
  return NextResponse.json({ error, code: result.code }, {
    status: result.status,
    headers: { ...CALCULATOR_PRIVATE_HEADERS, ...(result.retryAfter ? { 'Retry-After': String(result.retryAfter) } : {}) },
  });
}

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export const CALCULATOR_READ_DEADLINE_MS = 5000;
export const CALCULATOR_ACTIVE_BODY_LIMIT = 4;

export interface CalculatorReadDependencies {
  schedule: (callback: () => void, milliseconds: number) => unknown;
  clear: (handle: unknown) => void;
}
type CalculatorObjectReader = (
  request: Request, maxBytes: number,
) => Promise<CalculatorResult<Record<string, unknown>>>;

/**
 * Bound both buffered bytes and pending work. A timed-out read keeps its slot
 * until its read/cancellation settles; this can hold availability until process
 * recovery when a transport never cooperates.
 */
export function createCalculatorObjectReader(
  deps: CalculatorReadDependencies,
): CalculatorObjectReader {
  let active = 0;
  return async (request, maxBytes) => {
    if (!Number.isInteger(maxBytes) || maxBytes < 1 || maxBytes > TRANSIT_BODY_LIMIT) {
      return failure(400, 'CALCULATOR_INVALID_BODY');
    }
    if (!request.body) return failure(400, 'CALCULATOR_INVALID_JSON');
    if (request.signal?.aborted) return failure(400, 'CALCULATOR_BODY_ABORTED');
    if (active >= CALCULATOR_ACTIVE_BODY_LIMIT) {
      return { ...failure(429, 'CALCULATOR_BODY_BUSY'), retryAfter: 1 };
    }

    active += 1;
    let reader: ReadableStreamDefaultReader<Uint8Array>;
    try {
      reader = request.body.getReader();
    } catch {
      active -= 1;
      return failure(400, 'CALCULATOR_INVALID_BODY');
    }
    const bytes = new Uint8Array(maxBytes);
    let size = 0;
    let completed = false;
    let interruption: CalculatorFailure | undefined;
    let resultSettled = false;
    let workSettled = false;
    let released = false;
    let cancelled = false;
    let cancellation: Promise<unknown> | undefined;
    const release = () => {
      if (!released && resultSettled && workSettled) {
        released = true;
        active -= 1;
      }
    };
    const cancelReader = () => {
      if (cancelled) return;
      cancelled = true;
      try {
        cancellation = Promise.resolve(reader.cancel()).catch(() => {});
      } catch {
        // Cancellation is best effort and must not prevent caller settlement.
      }
    };
    let resolveInterruption: (result: CalculatorFailure) => void = () => {};
    const stopped = new Promise<CalculatorFailure>((resolve) => {
      resolveInterruption = resolve;
    });
    const stop = (reason: CalculatorFailure) => {
      if (interruption || resultSettled) return;
      interruption = reason;
      bytes.fill(0);
      cancelReader();
      resolveInterruption(reason);
    };
    const abort = () => stop(failure(400, 'CALCULATOR_BODY_ABORTED'));
    request.signal?.addEventListener('abort', abort, { once: true });
    const timer = deps.schedule(
      () => stop(failure(408, 'CALCULATOR_BODY_TIMEOUT')),
      CALCULATOR_READ_DEADLINE_MS,
    );
    if (request.signal?.aborted) abort();

    const work = (async (): Promise<CalculatorResult<Record<string, unknown>>> => {
      try {
        if (interruption) return interruption;
        let reads = 0;
        while (true) {
          // Exact maxBytes one-byte chunks plus final done remain valid.
          // Empty chunks also consume work and cannot grow memory indefinitely.
          if (reads >= maxBytes + 1) return failure(400, 'CALCULATOR_INVALID_BODY');
          reads += 1;
          const { value, done } = await reader.read();
          if (interruption) return interruption;
          if (done) {
            completed = true;
            break;
          }
          if (size + value.byteLength > maxBytes) {
            return failure(413, 'CALCULATOR_BODY_TOO_LARGE');
          }
          bytes.set(value, size);
          size += value.byteLength;
        }
        let text: string;
        try {
          text = new TextDecoder('utf-8', { fatal: true }).decode(bytes.subarray(0, size));
        } catch {
          return failure(400, 'CALCULATOR_INVALID_UTF8');
        }
        let body: unknown;
        try {
          body = JSON.parse(text);
        } catch {
          return failure(400, 'CALCULATOR_INVALID_JSON');
        }
        return isObject(body) ? { ok: true, value: body } : failure(400, 'CALCULATOR_INVALID_BODY');
      } catch {
        return interruption || failure(400, 'CALCULATOR_INVALID_BODY');
      }
    })();
    // Cleanup is tracked separately from the caller result: even a hanging
    // cancel cannot turn a known overflow/invalid response into an endless wait.
    const cleanup = work.then(async () => {
      bytes.fill(0);
      if (!completed) cancelReader();
      if (cancellation) await cancellation;
      try { reader.releaseLock(); } catch { /* Best effort after reads settle. */ }
    }).finally(() => {
      workSettled = true;
      release();
    });
    void cleanup.catch(() => {});
    try {
      return await Promise.race([work, stopped]);
    } finally {
      deps.clear(timer);
      request.signal?.removeEventListener('abort', abort);
      resultSettled = true;
      release();
    }
  };
}

const BODY_READER_SYMBOL = Symbol.for('soullab.astrology.calculatorBodyReader.v1');

/** Count actual stream bytes; Content-Length is not authority. */
export function readCalculatorObject(
  request: Request,
  maxBytes: number,
): Promise<CalculatorResult<Record<string, unknown>>> {
  const registry = globalThis as typeof globalThis & Record<symbol, CalculatorObjectReader | undefined>;
  const reader = registry[BODY_READER_SYMBOL] ??
    (registry[BODY_READER_SYMBOL] = createCalculatorObjectReader({
      schedule: (callback, milliseconds) => setTimeout(callback, milliseconds),
      clear: (handle) => clearTimeout(handle as ReturnType<typeof setTimeout>),
    }));
  return reader(request, maxBytes);
}

function isCalendarDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  if (year < 1 || month < 1 || month > 12 || day < 1) return false;
  const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const days = [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return day <= days[month - 1];
}

const HOUSE_SYSTEMS = new Set<HouseSystem>(['whole-sign', 'equal', 'porphyry', 'placidus', 'koch']);

export function validateBirthChartRequest(
  body: Record<string, unknown>,
): CalculatorResult<BirthData> {
  const { date, time, location, houseSystem } = body;
  if (!isCalendarDate(date) || typeof time !== 'string' ||
      !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(time) || !isObject(location)) {
    return failure(400, 'BIRTH_CHART_INVALID_INPUT');
  }
  const { lat, lng, timezone } = location;
  if (typeof lat !== 'number' || !Number.isFinite(lat) || lat < -90 || lat > 90 ||
      typeof lng !== 'number' || !Number.isFinite(lng) || lng < -180 || lng > 180 ||
      (timezone != null && (typeof timezone !== 'string' || timezone.length > MAX_TIMEZONE_LENGTH)) ||
      (houseSystem != null && houseSystem !== '' && !HOUSE_SYSTEMS.has(houseSystem as HouseSystem))) {
    return failure(400, 'BIRTH_CHART_INVALID_INPUT');
  }
  return {
    ok: true,
    value: {
      date,
      time,
      location: {
        lat,
        lng,
        // Absent, null, empty or invalid-IANA strings retain the longitude fallback.
        timezone: (timezone as string | undefined) || undefined,
      },
      houseSystem: (houseSystem as HouseSystem | undefined) || 'placidus',
    },
  };
}

export function validateTransitChartRequest(
  body: Record<string, unknown>,
): CalculatorResult<Record<string, unknown> | null | undefined> {
  const { birthChart } = body;
  if (birthChart === undefined || birthChart === null) return { ok: true, value: birthChart };
  if (!isObject(birthChart) || Object.keys(birthChart).length > 64) {
    return failure(400, 'TRANSIT_CHART_INVALID_INPUT');
  }
  // Preserve all named points and full-chart metadata; the existing aspect
  // helper skips invalid individual points and owns motion uncertainty.
  return { ok: true, value: birthChart };
}


const AYANAMSA_TYPES = new Set<AyanamsaType>(['lahiri', 'true_chitra', 'krishnamurti']);
const VEDIC_RASHIS = new Set([
  'Mesha', 'Vrishabha', 'Mithuna', 'Karka', 'Simha', 'Kanya',
  'Tula', 'Vrischika', 'Dhanu', 'Makara', 'Kumbha', 'Meena',
]);

function validAyanamsa(value: unknown): value is AyanamsaType {
  return typeof value === 'string' && AYANAMSA_TYPES.has(value as AyanamsaType);
}

function validTimezone(value: unknown): value is string {
  if (typeof value !== 'string' || value.length < 1 || value.length > MAX_TIMEZONE_LENGTH) return false;
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: value }).format(new Date(0));
    return true;
  } catch {
    return false;
  }
}

function validateVedicLocation(value: unknown) {
  if (!isObject(value)) return null;
  const { lat, lng, timezone } = value;
  if (typeof lat !== 'number' || !Number.isFinite(lat) || lat < -90 || lat > 90 ||
      typeof lng !== 'number' || !Number.isFinite(lng) || lng < -180 || lng > 180 ||
      !validTimezone(timezone)) return null;
  return { lat, lng, timezone };
}

export interface VedicBirthInstant {
  instant: Date;
  iso: string;
  timeZone: string;
  offsetLabel: string;
}

function utcMilliseconds(
  year: number, month: number, day: number, hours: number, minutes: number,
): number {
  const instant = new Date(0);
  instant.setUTCHours(0, 0, 0, 0);
  instant.setUTCFullYear(year, month - 1, day);
  instant.setUTCHours(hours, minutes, 0, 0);
  return instant.getTime();
}

function wallTimeAt(timeZone: string, utcMillis: number) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date(utcMillis));
  const get = (kind: string) => Number(parts.find(part => part.type === kind)?.value);
  return {
    year: get('year'), month: get('month'), day: get('day'),
    hours: get('hour') % 24, minutes: get('minute'), seconds: get('second'),
  };
}

/**
 * Resolve one exact local civil birth minute for the Free Vedic calculator.
 *
 * This is deliberately scoped to Vedic admission rather than changing the
 * shared Western calculator contract. Nonexistent and repeated wall times are
 * refused before any chart, ayanamsa or Dasha work. A unique match must also
 * agree byte-for-time with the existing Free natal engine's IANA resolver.
 */
export function admitVedicBirthInstant(
  date: string,
  time: string,
  location: { lng: number; timezone: string },
): CalculatorResult<VedicBirthInstant> {
  if (!isCalendarDate(date) || !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(time) ||
      !Number.isFinite(location.lng) || location.lng < -180 || location.lng > 180 ||
      !validTimezone(location.timezone)) {
    return failure(400, 'VEDIC_BIRTH_TIME_UNRESOLVED');
  }

  try {
    const [year, month, day] = date.split('-').map(Number);
    const [hours, minutes] = time.split(':').map(Number);
    const wallMillis = utcMilliseconds(year, month, day, hours, minutes);
    const offsets = new Set<number>();

    // Sampling both sides of the requested wall time discovers ordinary,
    // half-hour and quarter-hour offset regimes, including DST transitions.
    for (let deltaHours = -36; deltaHours <= 36; deltaHours += 3) {
      const sample = wallMillis + deltaHours * 3_600_000;
      const rendered = wallTimeAt(location.timezone, sample);
      if (Object.values(rendered).some(value => !Number.isInteger(value))) {
        return failure(400, 'VEDIC_BIRTH_TIME_UNRESOLVED');
      }
      const renderedAsUtc = utcMilliseconds(
        rendered.year, rendered.month, rendered.day,
        rendered.hours, rendered.minutes,
      ) + rendered.seconds * 1000;
      const offsetMillis = renderedAsUtc - sample;
      if (!Number.isInteger(offsetMillis) || Math.abs(offsetMillis) > 86_400_000) {
        return failure(400, 'VEDIC_BIRTH_TIME_UNRESOLVED');
      }
      offsets.add(offsetMillis);
    }

    const matches = new Set<number>();
    for (const offsetMillis of offsets) {
      const candidate = wallMillis - offsetMillis;
      const rendered = wallTimeAt(location.timezone, candidate);
      if (rendered.year === year && rendered.month === month && rendered.day === day &&
          rendered.hours === hours && rendered.minutes === minutes && rendered.seconds === 0) {
        matches.add(candidate);
      }
    }

    if (matches.size === 0) return failure(400, 'VEDIC_BIRTH_TIME_NONEXISTENT');
    if (matches.size > 1) return failure(400, 'VEDIC_BIRTH_TIME_AMBIGUOUS');

    const instantMillis = [...matches][0];
    const resolved = resolveBirthTimeUTC(
      year, month, day, hours, minutes,
      location.timezone, location.lng,
    );
    if (resolved.source !== 'iana' || resolved.utc.getTime() !== instantMillis) {
      return failure(400, 'VEDIC_BIRTH_TIME_UNRESOLVED');
    }

    return {
      ok: true,
      value: {
        instant: new Date(instantMillis),
        iso: new Date(instantMillis).toISOString(),
        timeZone: location.timezone,
        offsetLabel: resolved.offsetLabel,
      },
    };
  } catch {
    return failure(400, 'VEDIC_BIRTH_TIME_UNRESOLVED');
  }
}

export interface VedicChartRequest {
  date: string;
  time: string;
  location: { lat: number; lng: number; timezone: string };
  ayanamsa: AyanamsaType;
  includeDasha: boolean;
}

export function validateVedicChartRequest(body: Record<string, unknown>): CalculatorResult<VedicChartRequest> {
  const location = validateVedicLocation(body.location);
  const ayanamsa = body.ayanamsa === undefined ? 'lahiri' : body.ayanamsa;
  if (!isCalendarDate(body.date) || typeof body.time !== 'string' ||
      !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(body.time) || !location ||
      !validAyanamsa(ayanamsa) ||
      (body.includeDasha !== undefined && typeof body.includeDasha !== 'boolean')) {
    return failure(400, 'VEDIC_CHART_INVALID_INPUT');
  }
  return {
    ok: true,
    value: {
      date: body.date,
      time: body.time,
      location,
      ayanamsa,
      includeDasha: body.includeDasha !== false,
    },
  };
}

export interface GocharaRequest {
  natalMoonRashi: string;
  ayanamsa: AyanamsaType;
}

export function validateGocharaRequest(body: Record<string, unknown>): CalculatorResult<GocharaRequest> {
  const ayanamsa = body.ayanamsa === undefined ? 'lahiri' : body.ayanamsa;
  if (typeof body.natalMoonRashi !== 'string' || !VEDIC_RASHIS.has(body.natalMoonRashi) ||
      !validAyanamsa(ayanamsa) || body.currentTransits !== undefined ||
      body.natalMoonLongitude !== undefined) {
    return failure(400, 'GOCHARA_INVALID_INPUT');
  }
  return { ok: true, value: { natalMoonRashi: body.natalMoonRashi, ayanamsa } };
}

export interface AshtakavargaRequest {
  date: string;
  time: string;
  location: { lat: number; lng: number; timezone: string };
  ayanamsa: AyanamsaType;
  includeCurrentTransits: boolean;
}

export function validateAshtakavargaRequest(body: Record<string, unknown>): CalculatorResult<AshtakavargaRequest> {
  const location = validateVedicLocation(body.location);
  const time = body.time === undefined || body.time === '' ? '12:00' : body.time;
  const ayanamsa = body.ayanamsa === undefined ? 'lahiri' : body.ayanamsa;
  if (!isCalendarDate(body.date) || typeof time !== 'string' ||
      !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(time) || !location ||
      !validAyanamsa(ayanamsa) ||
      (body.includeCurrentTransits !== undefined && typeof body.includeCurrentTransits !== 'boolean')) {
    return failure(400, 'ASHTAKAVARGA_INVALID_INPUT');
  }
  return {
    ok: true,
    value: {
      date: body.date,
      time,
      location,
      ayanamsa,
      includeCurrentTransits: body.includeCurrentTransits !== false,
    },
  };
}
