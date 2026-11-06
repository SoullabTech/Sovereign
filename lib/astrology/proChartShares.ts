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
  /** The owner chose to include the Elemental Alchemy overview. */
  includeElemental: boolean;
  /** The owner chose to let the client ask MAIA about this chart. */
  includeAskMaia: boolean;
  /** Who is named as offering Ask MAIA (an astrologer or practice), if anyone. */
  askMaiaOfferedBy: string | null;
  askMaiaQuestions: number;
}

/** What a share link shows, as the owner chose it. */
export interface ShareOptions {
  includeElemental: boolean;
  includeAskMaia: boolean;
  askMaiaOfferedBy: string | null;
}

/** Questions a client may ask MAIA through one link. */
export const ASK_MAIA_LIMIT = 40;

/** Trims the offered-by name; empty means none. Null when too long. */
export function cleanOfferedBy(value: unknown): string | null | undefined {
  if (value === null || value === undefined) return null;
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim().replace(/\s+/g, ' ');
  if (!trimmed) return null;
  return trimmed.length <= 80 ? trimmed : undefined;
}

export interface SharedChartBirth {
  ownerMemberId: string;
  label: string;
  placeLabel: string | null;
  date: string;
  time: string;
  location: { lat: number; lng: number; timezone: string };
  includeElemental: boolean;
  includeAskMaia: boolean;
  askMaiaOfferedBy: string | null;
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

interface ShareRow {
  id: string; token: string; created_at: string; include_elemental: boolean;
  include_ask_maia: boolean; ask_maia_offered_by: string | null; ask_maia_questions: number;
}

const SHARE_COLUMNS = 'id, token, created_at, include_elemental, include_ask_maia, ask_maia_offered_by, ask_maia_questions';

function toShare(row: ShareRow): ChartShare {
  return {
    id: row.id, token: row.token, createdAt: new Date(row.created_at).toISOString(),
    includeElemental: row.include_elemental === true,
    includeAskMaia: row.include_ask_maia === true,
    askMaiaOfferedBy: row.ask_maia_offered_by ?? null,
    askMaiaQuestions: Number(row.ask_maia_questions) || 0,
  };
}

/** The live link for one of the owner's saved charts, if any. */
export async function readLiveShare(ownerMemberId: string, chartId: string): Promise<ChartShare | null> {
  if (!isSavedChartId(chartId)) return null;
  const result = await query<ShareRow>(
    `SELECT ${SHARE_COLUMNS} FROM astrology_pro_chart_shares
     WHERE owner_member_id = $1 AND saved_chart_id = $2 AND revoked_at IS NULL LIMIT 1`,
    [ownerMemberId, chartId],
  );
  return result.rows[0] ? toShare(result.rows[0]) : null;
}

/**
 * Makes the live link for an owner's saved chart, or returns the one already
 * live. Returns null when the chart is not the owner's.
 */
export async function createShare(
  ownerMemberId: string, chartId: string,
  options: ShareOptions = { includeElemental: false, includeAskMaia: false, askMaiaOfferedBy: null },
): Promise<ChartShare | null> {
  if (!isSavedChartId(chartId)) return null;
  const result = await query<ShareRow>(
    `INSERT INTO astrology_pro_chart_shares
       (token, owner_member_id, saved_chart_id, consent_attested_at, include_elemental, include_ask_maia, ask_maia_offered_by)
     SELECT $1, $2, c.id, now(), $4, $5, $6 FROM astrology_pro_saved_charts c
     WHERE c.id = $3 AND c.owner_member_id = $2
     ON CONFLICT (saved_chart_id) WHERE revoked_at IS NULL DO NOTHING
     RETURNING ${SHARE_COLUMNS}`,
    [newToken(), ownerMemberId, chartId, options.includeElemental, options.includeAskMaia, options.askMaiaOfferedBy],
  );
  if (result.rows[0]) return toShare(result.rows[0]);
  return readLiveShare(ownerMemberId, chartId);
}

/** Changes what a live link shows. Returns the link, or null if none is live. */
export async function setShareOptions(
  ownerMemberId: string, chartId: string, options: ShareOptions,
): Promise<ChartShare | null> {
  if (!isSavedChartId(chartId)) return null;
  const result = await query<ShareRow>(
    `UPDATE astrology_pro_chart_shares
     SET include_elemental = $3, include_ask_maia = $4, ask_maia_offered_by = $5
     WHERE owner_member_id = $1 AND saved_chart_id = $2 AND revoked_at IS NULL
     RETURNING ${SHARE_COLUMNS}`,
    [ownerMemberId, chartId, options.includeElemental, options.includeAskMaia, options.askMaiaOfferedBy],
  );
  return result.rows[0] ? toShare(result.rows[0]) : null;
}

/**
 * Takes one Ask MAIA question from a live link's allowance, before MAIA is
 * asked. False when the link is off, Ask MAIA is off, or the limit is reached.
 */
export async function consumeAskMaiaQuestion(token: string): Promise<boolean> {
  if (!isShareToken(token)) return false;
  const result = await query(
    `UPDATE astrology_pro_chart_shares SET ask_maia_questions = ask_maia_questions + 1
     WHERE token = $1 AND revoked_at IS NULL AND include_ask_maia AND ask_maia_questions < $2`,
    [token, ASK_MAIA_LIMIT],
  );
  return (result.rowCount ?? 0) > 0;
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
  include_elemental: boolean;
  include_ask_maia: boolean;
  ask_maia_offered_by: string | null;
}

/** The saved chart behind a live link; null for an unknown or turned-off link. */
export async function readSharedChartBirth(token: string): Promise<SharedChartBirth | null> {
  if (!isShareToken(token)) return null;
  const result = await query<SharedRow>(
    `SELECT s.owner_member_id, c.label, c.place_label, c.birth_date::text AS birth_date,
            c.birth_time::text AS birth_time, c.latitude, c.longitude, c.timezone, s.include_elemental,
            s.include_ask_maia, s.ask_maia_offered_by
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
    includeElemental: row.include_elemental === true,
    includeAskMaia: row.include_ask_maia === true,
    askMaiaOfferedBy: row.ask_maia_offered_by ?? null,
  };
}
