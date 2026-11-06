/**
 * Soul Portrait from a Pro Astrology chart (founder ruling 2026-11-05: portraits
 * begun in Pro use the Pro calculator).
 *
 * The birth details are read here, on the server, from the member's own chart or
 * from one of their saved charts — never from the browser or a URL. A saved
 * chart is reachable only by its owner; the member's own chart only while their
 * astrology consent is opted in. The caller must already hold Pro access.
 */
import { query } from '@/lib/db/postgres';
import { admitProCalculation } from '@/lib/astrology/proCalculationPolicy';
import { isSavedChartId, readSavedChartBirth } from '@/lib/astrology/proSavedCharts';
import type { BirthData } from '@/lib/astrology/proEphemerisCalculator';

export type ProChartSource = 'mine' | string;

export type ProChartBirthResult =
  | { ok: true; birthData: BirthData }
  | { ok: false; status: number; error: string };

export function isProChartSource(value: unknown): value is ProChartSource {
  return value === 'mine' || isSavedChartId(value);
}

interface OwnBirthRow {
  birth_date: string | null;
  birth_time: string | null;
  birth_location_lat: string | null;
  birth_location_lng: string | null;
  birth_timezone: string | null;
  astrology_consent: string | null;
}

async function readOwnBirth(
  memberId: string,
): Promise<{ ok: true; raw: unknown } | { ok: false; status: number; error: string }> {
  const result = await query<OwnBirthRow>(
    `SELECT birth_date::text AS birth_date, birth_time::text AS birth_time,
            birth_location_lat::text AS birth_location_lat,
            birth_location_lng::text AS birth_location_lng,
            birth_timezone, astrology_consent
     FROM members WHERE id = $1 LIMIT 1`,
    [memberId],
  );
  const row = result.rows[0];
  if (!row) return { ok: false, status: 404, error: 'member not found' };
  if (row.astrology_consent !== 'opted_in') {
    return { ok: false, status: 403, error: 'astrology consent required for your own chart' };
  }
  const lat = Number(row.birth_location_lat);
  const lng = Number(row.birth_location_lng);
  if (!row.birth_date || !row.birth_time || !row.birth_timezone ||
      row.birth_location_lat === null || row.birth_location_lng === null ||
      !Number.isFinite(lat) || !Number.isFinite(lng)) {
    return { ok: false, status: 422, error: 'complete birth details required' };
  }
  return {
    ok: true,
    raw: {
      date: row.birth_date,
      time: row.birth_time.slice(0, 5),
      location: { lat, lng, timezone: row.birth_timezone },
    },
  };
}

/** Loads and admits the birth details for a Pro chart owned by `memberId`. */
export async function loadProChartBirth(
  memberId: string, source: ProChartSource,
): Promise<ProChartBirthResult> {
  let raw: unknown;
  if (source === 'mine') {
    const own = await readOwnBirth(memberId);
    if (!own.ok) return own;
    raw = own.raw;
  } else {
    raw = await readSavedChartBirth(memberId, source);
    if (!raw) return { ok: false, status: 404, error: 'saved chart not found' };
  }
  const admission = admitProCalculation({ ...(raw as object), houseSystem: 'porphyry' });
  if (!admission.ok) return { ok: false, status: 422, error: 'birth details could not be used' };
  return { ok: true, birthData: admission.birthData };
}
