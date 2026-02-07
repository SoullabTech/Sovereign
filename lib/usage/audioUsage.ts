/**
 * Audio Usage Event Logging
 *
 * Durable, append-only event log for audio uploads.
 * Used for metering, pricing, and usage analytics.
 *
 * Table: audio_usage_events (see migrations/20260207220000_audio_usage_events.sql)
 */

import { query } from "@/lib/db/postgres";

export type AudioUsageStatus = "ok" | "rejected" | "error";

export type AudioUsageEvent = {
  memberId: string;
  route: string;
  kind?: string; // 'audio' | 'transcription' | 'upload'
  bytes: number;
  seconds?: number | null;
  status: AudioUsageStatus; // Required: 'ok' | 'rejected' | 'error'
  errorCode?: string | null;
  meta?: Record<string, unknown>;
};

/**
 * Log an audio usage event to the database.
 * Swallows errors to avoid breaking primary flows.
 */
export async function logAudioUsageEvent(evt: AudioUsageEvent): Promise<void> {
  const {
    memberId,
    route,
    kind = "audio",
    bytes,
    seconds = null,
    status,
    errorCode = null,
    meta = {},
  } = evt;

  // Don't let metering failures break primary flows
  try {
    await query(
      `
      INSERT INTO audio_usage_events
        (member_id, route, kind, bytes, seconds, status, error_code, meta)
      VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8::jsonb)
      `,
      [memberId, route, kind, bytes, seconds, status, errorCode, JSON.stringify(meta)]
    );
  } catch (e) {
    // Swallow - metering should never break the primary flow
    console.warn("[audioUsage] failed to log event:", e instanceof Error ? e.message : e);
  }
}

/**
 * Get total audio usage for a member in a time range.
 * Useful for tier/quota enforcement and billing summaries.
 */
export async function getAudioUsageSummary(
  memberId: string,
  options?: {
    since?: Date;
    until?: Date;
    route?: string;
    status?: AudioUsageStatus;
  }
): Promise<{ totalBytes: number; totalSeconds: number; eventCount: number }> {
  const { since, until, route, status } = options ?? {};

  let sql = `
    SELECT
      COALESCE(SUM(bytes), 0)::bigint as total_bytes,
      COALESCE(SUM(seconds), 0)::int as total_seconds,
      COUNT(*)::int as event_count
    FROM audio_usage_events
    WHERE member_id = $1
  `;
  const params: unknown[] = [memberId];
  let paramIdx = 2;

  if (since) {
    sql += ` AND created_at >= $${paramIdx}`;
    params.push(since.toISOString());
    paramIdx++;
  }

  if (until) {
    sql += ` AND created_at <= $${paramIdx}`;
    params.push(until.toISOString());
    paramIdx++;
  }

  if (route) {
    sql += ` AND route = $${paramIdx}`;
    params.push(route);
    paramIdx++;
  }

  if (status) {
    sql += ` AND status = $${paramIdx}`;
    params.push(status);
  }

  try {
    const result = await query(sql, params);
    const row = result.rows[0];
    return {
      totalBytes: Number(row?.total_bytes ?? 0),
      totalSeconds: Number(row?.total_seconds ?? 0),
      eventCount: Number(row?.event_count ?? 0),
    };
  } catch {
    return { totalBytes: 0, totalSeconds: 0, eventCount: 0 };
  }
}
