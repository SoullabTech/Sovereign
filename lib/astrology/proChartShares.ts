/**
 * ASTRO-PRO-CHART-SHARE-01 — a private link that shows a client their chart.
 *
 * The owner of a saved chart may make one live link for it, after confirming
 * the person agreed to have their chart shared this way. The link carries an
 * unguessable token only; the chart is recalculated on the server from the
 * saved birth details on every view. Turning the link off takes effect at once.
 * Nothing about the viewer is recorded.
 */
import { randomBytes } from 'crypto';
import { query } from '@/lib/db/postgres';
import { isSavedChartId } from './proSavedCharts';

const TOKEN = /^[A-Za-z0-9_-]{43}$/;

export interface ChartShare {
  id: string;
  token: string;
  createdAt: string;
}

export interface SharedChartBirth {
  ownerMemberId: string;
  label: string;
  placeLabel: string | null;
  date: string;
  time: string;
  location: { lat: number; lng: number; timezone: string };
}

export function isShareToken(value: unknown): value is string {
  return typeof value === 'string' && TOKEN.test(value);
}

export function sharePath(token: string): string {
  return `/shared-chart/${token}`;
}

function newToken(): string {
  return randomBytes(32).toString('base64url');
}

interface ShareRow { id: string; token: string; created_at: string }

function toShare(row: ShareRow): ChartShare {
  return { id: row.id, token: row.token, createdAt: new Date(row.created_at).toISOString() };
}

/** The live link for one of the owner's saved charts, if any. */
export async function readLiveShare(ownerMemberId: string, chartId: string): Promise<ChartShare | null> {
  if (!isSavedChartId(chartId)) return null;
  const result = await query<ShareRow>(
    `SELECT id, token, created_at FROM astrology_pro_chart_shares
     WHERE owner_member_id = $1 AND saved_chart_id = $2 AND revoked_at IS NULL LIMIT 1`,
    [ownerMemberId, chartId],
  );
  return result.rows[0] ? toShare(result.rows[0]) : null;
}

/**
 * Makes the live link for an owner's saved chart, or returns the one already
 * live. Returns null when the chart is not the owner's.
 */
export async function createShare(ownerMemberId: string, chartId: string): Promise<ChartShare | null> {
  if (!isSavedChartId(chartId)) return null;
  const result = await query<ShareRow>(
    `INSERT INTO astrology_pro_chart_shares (token, owner_member_id, saved_chart_id, consent_attested_at)
     SELECT $1, $2, c.id, now() FROM astrology_pro_saved_charts c
     WHERE c.id = $3 AND c.owner_member_id = $2
     ON CONFLICT (saved_chart_id) WHERE revoked_at IS NULL DO NOTHING
     RETURNING id, token, created_at`,
    [newToken(), ownerMemberId, chartId],
  );
  if (result.rows[0]) return toShare(result.rows[0]);
  return readLiveShare(ownerMemberId, chartId);
}

/** Turns off the live link for an owner's saved chart. True if one was live. */
export async function revokeShare(ownerMemberId: string, chartId: string): Promise<boolean> {
  if (!isSavedChartId(chartId)) return false;
  const result = await query(
    `UPDATE astrology_pro_chart_shares SET revoked_at = now()
     WHERE owner_member_id = $1 AND saved_chart_id = $2 AND revoked_at IS NULL`,
    [ownerMemberId, chartId],
  );
  return (result.rowCount ?? 0) > 0;
}

interface SharedRow {
  owner_member_id: string;
  label: string;
  place_label: string | null;
  birth_date: string;
  birth_time: string;
  latitude: number | string;
  longitude: number | string;
  timezone: string;
}

/** The saved chart behind a live link; null for an unknown or turned-off link. */
export async function readSharedChartBirth(token: string): Promise<SharedChartBirth | null> {
  if (!isShareToken(token)) return null;
  const result = await query<SharedRow>(
    `SELECT s.owner_member_id, c.label, c.place_label, c.birth_date::text AS birth_date,
            c.birth_time::text AS birth_time, c.latitude, c.longitude, c.timezone
     FROM astrology_pro_chart_shares s
     JOIN astrology_pro_saved_charts c ON c.id = s.saved_chart_id AND c.owner_member_id = s.owner_member_id
     WHERE s.token = $1 AND s.revoked_at IS NULL LIMIT 1`,
    [token],
  );
  const row = result.rows[0];
  if (!row) return null;
  return {
    ownerMemberId: row.owner_member_id,
    label: row.label,
    placeLabel: row.place_label,
    date: row.birth_date,
    time: row.birth_time.slice(0, 5),
    location: { lat: Number(row.latitude), lng: Number(row.longitude), timezone: row.timezone },
  };
}
