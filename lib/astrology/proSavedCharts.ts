/**
 * ASTRO-PRO-SAVED-CHARTS-01 — a Pro member's saved charts for other people.
 *
 * Every read and write is scoped by the owner's verified member id, which the
 * route resolves from the server session; the browser never names an owner.
 * Only birth inputs and the owner's permission attestation are stored. No
 * computed chart, note or interpretation is persisted, and nothing here is
 * read by MAIA conversation or memory.
 */
import { query } from '@/lib/db/postgres';
import { admitProCalculation } from './proCalculationPolicy';

export const PRO_SAVED_CHART_LIMIT = 500;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export interface SavedChartInput {
  label: string;
  birthDate: string;
  birthTime: string;
  latitude: number;
  longitude: number;
  timezone: string;
  placeLabel: string | null;
}

export interface SavedChartSummary {
  id: string;
  label: string;
  birthDate: string;
  birthTime: string;
  placeLabel: string | null;
  createdAt: string;
}

export interface SavedChartBirth {
  date: string;
  time: string;
  location: { lat: number; lng: number; timezone: string };
}

export type SavedChartValidation =
  | { ok: true; input: SavedChartInput }
  | { ok: false; error: string };

export function isSavedChartId(value: unknown): value is string {
  return typeof value === 'string' && UUID.test(value);
}

/**
 * Accepts exactly the fields a member types. The chart must be calculable by
 * the Pro admission policy before it is kept, so nothing unusable is stored.
 */
export function validateSavedChartInput(body: unknown): SavedChartValidation {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return { ok: false, error: 'invalid_request' };
  const b = body as Record<string, unknown>;
  const allowed = new Set([
    'label', 'birthDate', 'birthTime', 'latitude', 'longitude', 'timezone', 'placeLabel', 'permissionAttested',
  ]);
  if (Object.keys(b).some((key) => !allowed.has(key))) return { ok: false, error: 'unexpected_field' };
  if (b.permissionAttested !== true) return { ok: false, error: 'permission_attestation_required' };

  const label = typeof b.label === 'string' ? b.label.trim() : '';
  if (label.length < 1 || label.length > 80) return { ok: false, error: 'label_invalid' };

  const placeLabel = b.placeLabel === undefined || b.placeLabel === null || b.placeLabel === ''
    ? null : typeof b.placeLabel === 'string' ? b.placeLabel.trim().slice(0, 160) || null : undefined;
  if (placeLabel === undefined) return { ok: false, error: 'place_label_invalid' };

  if (typeof b.latitude !== 'number' || typeof b.longitude !== 'number' ||
      !Number.isFinite(b.latitude) || !Number.isFinite(b.longitude)) {
    return { ok: false, error: 'INVALID_COORDINATES' };
  }
  const admission = admitProCalculation({
    date: b.birthDate,
    time: b.birthTime,
    location: { lat: b.latitude, lng: b.longitude, timezone: b.timezone },
    houseSystem: 'porphyry',
  });
  if (!admission.ok) return { ok: false, error: admission.error };

  return {
    ok: true,
    input: {
      label,
      birthDate: b.birthDate as string,
      birthTime: b.birthTime as string,
      latitude: b.latitude,
      longitude: b.longitude,
      timezone: b.timezone as string,
      placeLabel,
    },
  };
}

interface SummaryRow {
  id: string;
  label: string;
  birth_date: string;
  birth_time: string;
  place_label: string | null;
  created_at: string;
}

function toSummary(row: SummaryRow): SavedChartSummary {
  return {
    id: row.id,
    label: row.label,
    birthDate: row.birth_date,
    birthTime: row.birth_time.slice(0, 5),
    placeLabel: row.place_label,
    createdAt: row.created_at,
  };
}

const SUMMARY_COLUMNS =
  'id, label, birth_date::text AS birth_date, birth_time::text AS birth_time, place_label, created_at::text AS created_at';

export async function listSavedCharts(ownerMemberId: string): Promise<SavedChartSummary[]> {
  const result = await query<SummaryRow>(
    `SELECT ${SUMMARY_COLUMNS} FROM astrology_pro_saved_charts
     WHERE owner_member_id = $1 ORDER BY created_at DESC, id LIMIT ${PRO_SAVED_CHART_LIMIT}`,
    [ownerMemberId],
  );
  return result.rows.map(toSummary);
}

/** Returns null when the owner is already at the limit. */
export async function createSavedChart(
  ownerMemberId: string, input: SavedChartInput,
): Promise<SavedChartSummary | null> {
  // A storage ceiling, not a security boundary: two simultaneous saves at the
  // limit could both pass the count.
  const result = await query<SummaryRow>(
    `INSERT INTO astrology_pro_saved_charts
       (owner_member_id, label, birth_date, birth_time, latitude, longitude, timezone, place_label, permission_attested_at)
     SELECT $1, $2, $3::date, $4::time, $5, $6, $7, $8, now()
     WHERE (SELECT count(*) FROM astrology_pro_saved_charts WHERE owner_member_id = $1) < ${PRO_SAVED_CHART_LIMIT}
     RETURNING ${SUMMARY_COLUMNS}`,
    [ownerMemberId, input.label, input.birthDate, input.birthTime,
      input.latitude, input.longitude, input.timezone, input.placeLabel],
  );
  const row = result.rows[0];
  return row ? toSummary(row) : null;
}

interface BirthRow {
  birth_date: string;
  birth_time: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

export async function readSavedChartBirth(
  ownerMemberId: string, chartId: string,
): Promise<SavedChartBirth | null> {
  const result = await query<BirthRow>(
    `SELECT birth_date::text AS birth_date, birth_time::text AS birth_time, latitude, longitude, timezone
     FROM astrology_pro_saved_charts WHERE id = $1 AND owner_member_id = $2 LIMIT 1`,
    [chartId, ownerMemberId],
  );
  const row = result.rows[0];
  if (!row) return null;
  return {
    date: row.birth_date,
    time: row.birth_time.slice(0, 5),
    location: { lat: Number(row.latitude), lng: Number(row.longitude), timezone: row.timezone },
  };
}

export async function savedChartExists(ownerMemberId: string, chartId: string): Promise<boolean> {
  const result = await query<{ id: string }>(
    'SELECT id FROM astrology_pro_saved_charts WHERE id = $1 AND owner_member_id = $2 LIMIT 1',
    [chartId, ownerMemberId],
  );
  return result.rows.length > 0;
}

/** Hard delete. Returns false when no chart with this id belongs to the owner. */
export async function deleteSavedChart(ownerMemberId: string, chartId: string): Promise<boolean> {
  const result = await query<{ id: string }>(
    'DELETE FROM astrology_pro_saved_charts WHERE id = $1 AND owner_member_id = $2 RETURNING id',
    [chartId, ownerMemberId],
  );
  return result.rows.length > 0;
}
