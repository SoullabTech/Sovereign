/**
 * Voice Tier Telemetry
 *
 * Logs Opus/Sonnet routing decisions for analysis and optimization.
 * Stores METADATA ONLY - never raw user input.
 *
 * Enable in prod via: VOICE_TIER_TELEMETRY=1
 */

import { query } from './postgres';
import { createHash } from 'crypto';

export type VoiceTierTelemetryRow = {
  tier: 'opus' | 'sonnet';
  reason: string;
  model: string;
  userId?: string;
  messageCount?: number;
  mode?: string;
  awarenessLevel?: number;
  hasDeepPattern?: boolean;
  isOpusTierUser?: boolean;
  sessionId?: string;
  processingProfile?: string;
  latencyMs?: number;
};

/**
 * Hash userId for privacy-preserving telemetry
 */
function hashUserId(userId: string | undefined): string | null {
  if (!userId) return null;
  return createHash('sha256').update(userId).digest('hex').slice(0, 16);
}

/**
 * Log a voice tier selection decision.
 * Gracefully degrades if table doesn't exist.
 */
export async function logVoiceTierTelemetry(row: VoiceTierTelemetryRow): Promise<void> {
  // Check if telemetry is enabled (opt-in in prod)
  const enabled = process.env.VOICE_TIER_TELEMETRY === '1' ||
    process.env.NODE_ENV === 'development';

  if (!enabled) return;

  const {
    tier,
    reason,
    model,
    userId,
    messageCount,
    mode,
    awarenessLevel,
    hasDeepPattern = false,
    isOpusTierUser = false,
    sessionId,
    processingProfile,
    latencyMs
  } = row;

  try {
    await query(
      `
      INSERT INTO voice_tier_telemetry
        (tier, reason, model, user_id_hash, message_count, mode, awareness_level,
         has_deep_pattern, is_opus_tier_user, session_id, processing_profile, latency_ms)
      VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      `,
      [
        tier,
        reason,
        model,
        hashUserId(userId),
        messageCount ?? null,
        mode ?? null,
        awarenessLevel ?? null,
        hasDeepPattern,
        isOpusTierUser,
        sessionId ?? null,
        processingProfile ?? null,
        latencyMs ?? null
      ]
    );
  } catch (error) {
    // Graceful degradation - don't fail the request if telemetry fails
    const msg = error instanceof Error ? error.message : String(error);
    if (msg.includes('does not exist')) {
      console.warn('[VoiceTierTelemetry] Table not yet created - skipping');
    } else {
      console.error('[VoiceTierTelemetry] Failed to log:', msg);
    }
  }
}

/**
 * Query voice tier distribution for analysis.
 * Returns counts by tier and reason for the specified time window.
 */
export async function getVoiceTierDistribution(
  hoursAgo: number = 24
): Promise<{ tier: string; reason: string; count: number }[]> {
  const result = await query(
    `
    SELECT tier, reason, COUNT(*) as count
    FROM voice_tier_telemetry
    WHERE formed_at > now() - $1::interval
    GROUP BY tier, reason
    ORDER BY count DESC
    `,
    [`${hoursAgo} hours`]
  );

  return result.rows.map(row => ({
    tier: row.tier as string,
    reason: row.reason as string,
    count: parseInt(row.count, 10)
  }));
}

/**
 * Get awareness level routing stats.
 */
export async function getAwarenessRoutingStats(
  hoursAgo: number = 24
): Promise<{ awarenessLevel: number | null; tier: string; count: number }[]> {
  const result = await query(
    `
    SELECT awareness_level, tier, COUNT(*) as count
    FROM voice_tier_telemetry
    WHERE formed_at > now() - $1::interval
    GROUP BY awareness_level, tier
    ORDER BY awareness_level, tier
    `,
    [`${hoursAgo} hours`]
  );

  return result.rows.map(row => ({
    awarenessLevel: row.awareness_level as number | null,
    tier: row.tier as string,
    count: parseInt(row.count, 10)
  }));
}
