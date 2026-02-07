/**
 * Audio Usage Logger
 *
 * Non-blocking per-event logging for audio uploads and transcriptions.
 * Tracks shape of usage (size, duration, route, outcome) — never content.
 * Feeds future metering, quotas, and pricing decisions.
 */

import { query } from '../db/postgres';

export type AudioUsageEvent = {
  memberId: string;
  eventType: 'upload' | 'transcribe' | 'stream_chunk';
  route: string;
  fileSizeBytes?: number;
  durationMs?: number;
  mimeType?: string;
  status: 'ok' | 'rejected' | 'error';
  rejectReason?: string;
  sessionId?: string;
  tier?: string;
};

/**
 * Log an audio usage event to the database.
 * Fully fire-and-forget: returns void (not a Promise), never throws,
 * and never produces unhandled rejection warnings.
 */
export function logAudioUsageEvent(e: AudioUsageEvent): void {
  try {
    query(
      `INSERT INTO audio_usage_events
        (member_id, event_type, route, file_size_bytes, duration_ms, mime_type, status, reject_reason, session_id, tier)
       VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        e.memberId,
        e.eventType,
        e.route,
        e.fileSizeBytes ?? null,
        e.durationMs ?? null,
        e.mimeType ?? null,
        e.status,
        e.rejectReason ?? null,
        e.sessionId ?? null,
        e.tier ?? null,
      ]
    ).catch((err) => {
      console.error('[audioUsageLogger] Async failure:', err);
    });
  } catch (err) {
    // Guard against synchronous throws (pool not ready, params construction, etc.)
    console.error('[audioUsageLogger] Sync failure:', err);
  }
}
