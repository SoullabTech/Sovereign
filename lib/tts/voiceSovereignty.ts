/**
 * Voice Sovereignty — audit logging, consent gate, and policy resolution.
 *
 * Three responsibilities:
 *   1. Log fallback events (fire-and-forget, never blocks TTS)
 *   2. Check cloud consent (per-member + global system setting)
 *   3. Resolve voice policy for response headers
 *
 * Philosophy: "Keep me speaking, but tell me the truth when it isn't local."
 *
 * Table: voice_fallback_events (see migrations/20260213100001_voice_sovereignty.sql)
 */

import { query } from '@/lib/db/postgres';

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

export type VoicePolicy = 'local-only' | 'local-prefer' | 'cloud-allowed' | 'cloud-primary';

export interface FallbackEvent {
  requestId: string;
  memberId?: string;
  anonId?: string;
  sessionId?: string;
  intendedProvider: string;
  actualProvider: string;
  isFallback: boolean;
  reason?: string;
  latencyMs?: number;
  audioBytes?: number;
  textLength?: number;
  /** Provenance (Phase 0): why the provider was selected — configured_default | archetype_rule | explicit_request. */
  selectionReason?: string;
  /** Provenance (Phase 0): classified cause when a fallback occurred — provider_unavailable | local_failure | consent_policy | none. */
  fallbackReason?: string;
  meta?: Record<string, unknown>;
}

export interface CloudConsentResult {
  allowed: boolean;
  reason: 'member_consent' | 'global_disabled' | 'no_setting' | 'default';
}

// ═══════════════════════════════════════════════════════════════
// 1. Fallback Audit Logging
// ═══════════════════════════════════════════════════════════════

/**
 * Log a voice fallback event for sovereignty accounting.
 * Fire-and-forget: swallows errors to avoid breaking TTS flow.
 * Returns void (not Promise) to prevent accidental await.
 */
export function logFallbackEvent(evt: FallbackEvent): void {
  query(
    `INSERT INTO voice_fallback_events
      (request_id, member_id, anon_id, session_id,
       intended_provider, actual_provider, is_fallback, reason,
       latency_ms, audio_bytes, text_length, meta)
    VALUES
      ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12::jsonb)`,
    [
      evt.requestId,
      evt.memberId || null,
      evt.anonId || null,
      evt.sessionId || null,
      evt.intendedProvider,
      evt.actualProvider,
      evt.isFallback,
      evt.reason || null,
      evt.latencyMs || null,
      evt.audioBytes || null,
      evt.textLength || null,
      {
        ...(evt.meta || {}),
        ...(evt.selectionReason ? { selectionReason: evt.selectionReason } : {}),
        ...(evt.fallbackReason ? { fallbackReason: evt.fallbackReason } : {}),
      },
    ]
  ).catch((e) => {
    // Swallow — sovereignty accounting should never break the voice
    console.warn('[voice-sovereignty] failed to log fallback event:', {
      error: e instanceof Error ? e.message : String(e),
      requestId: evt.requestId,
    });
  });
}

// ═══════════════════════════════════════════════════════════════
// 2. Cloud Voice Consent Gate
// ═══════════════════════════════════════════════════════════════

/**
 * Check if cloud TTS is allowed for this request.
 *
 * Resolution order:
 *   1. Global system setting (admin can force-disable for all)
 *   2. Per-member setting (member can opt out of cloud voice)
 *   3. Default: allowed (sovereignty-pragmatic)
 *
 * Per-request override: if request includes `x-voice-local-only: 1`,
 * cloud is denied regardless of settings.
 */
export async function checkCloudConsent(opts: {
  memberId?: string;
  localOnlyHeader?: boolean;
}): Promise<CloudConsentResult> {
  // Per-request override: "never cloud for this request"
  if (opts.localOnlyHeader) {
    return { allowed: false, reason: 'member_consent' };
  }

  // Check global system setting
  try {
    const globalResult = await query(
      `SELECT value FROM system_settings WHERE key = 'voice_cloud_fallback_enabled'`
    );
    if (globalResult.rows.length > 0) {
      const globalAllowed = globalResult.rows[0].value;
      if (globalAllowed === false || globalAllowed === 'false') {
        return { allowed: false, reason: 'global_disabled' };
      }
    }
  } catch {
    // If system_settings table doesn't exist, allow by default
  }

  // Check per-member setting
  if (opts.memberId) {
    try {
      const memberResult = await query(
        `SELECT allow_cloud_voice FROM member_settings WHERE member_id = $1`,
        [opts.memberId]
      );
      if (memberResult.rows.length > 0 && memberResult.rows[0].allow_cloud_voice === false) {
        return { allowed: false, reason: 'member_consent' };
      }
      if (memberResult.rows.length > 0) {
        return { allowed: true, reason: 'member_consent' };
      }
    } catch {
      // If member_settings table missing or column missing, allow by default
    }
  }

  // Default: sovereignty-pragmatic (allow cloud, but disclose)
  return { allowed: true, reason: 'default' };
}

// ═══════════════════════════════════════════════════════════════
// 3. Voice Policy Resolution
// ═══════════════════════════════════════════════════════════════

/**
 * Resolve the current voice policy for response headers.
 *
 * Returns a human-readable policy string:
 *   - "local-only": local TTS only, cloud denied
 *   - "local-prefer": local first, cloud fallback allowed
 *   - "cloud-allowed": cloud is the configured provider
 *   - "cloud-primary": local voice not enabled
 */
export function resolveVoicePolicy(opts: {
  localVoiceEnabled: boolean;
  configuredProvider: string;
  cloudConsentAllowed: boolean;
}): VoicePolicy {
  if (!opts.localVoiceEnabled) {
    return 'cloud-primary';
  }

  if (opts.configuredProvider === 'openai') {
    return 'cloud-allowed';
  }

  if (!opts.cloudConsentAllowed) {
    return 'local-only';
  }

  return 'local-prefer';
}

// ═══════════════════════════════════════════════════════════════
// 4. Fallback Statistics (for dashboard / ops)
// ═══════════════════════════════════════════════════════════════

/**
 * Get fallback statistics for a time period.
 * Used for the "sovereignty accounting" dashboard.
 */
export async function getFallbackStats(opts?: {
  sinceDays?: number;
  memberId?: string;
}): Promise<{
  totalRequests: number;
  fallbackCount: number;
  fallbackRate: number;
  byProvider: Record<string, number>;
}> {
  const sinceDays = opts?.sinceDays ?? 7;
  const params: unknown[] = [sinceDays];
  let memberFilter = '';

  if (opts?.memberId) {
    memberFilter = ' AND member_id = $2';
    params.push(opts.memberId);
  }

  try {
    const result = await query(
      `SELECT
        COUNT(*)::int as total,
        COUNT(*) FILTER (WHERE is_fallback)::int as fallbacks,
        actual_provider,
        COUNT(*)::int as provider_count
      FROM voice_fallback_events
      WHERE created_at >= NOW() - ($1 || ' days')::interval
        ${memberFilter}
      GROUP BY actual_provider`,
      params
    );

    let totalRequests = 0;
    let fallbackCount = 0;
    const byProvider: Record<string, number> = {};

    for (const row of result.rows) {
      totalRequests += row.total;
      fallbackCount += row.fallbacks;
      byProvider[row.actual_provider] = row.provider_count;
    }

    return {
      totalRequests,
      fallbackCount,
      fallbackRate: totalRequests > 0 ? fallbackCount / totalRequests : 0,
      byProvider,
    };
  } catch {
    return { totalRequests: 0, fallbackCount: 0, fallbackRate: 0, byProvider: {} };
  }
}
