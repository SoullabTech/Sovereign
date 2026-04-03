/**
 * MAIA Limits Enforcer
 *
 * Single point of truth for usage limits enforcement.
 * Canonical reference: /docs/internal/MAIA_LIMITS_AND_STEWARDSHIP.md
 *
 * Philosophy: Enforce with dignity, not punishment.
 */

import { query } from '../db/postgres';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type MemberTier = 'free' | 'member_plus' | 'studio_pro';

export type EnforcementDecision =
  | { action: 'allow' }
  | { action: 'nudge'; message: string; nudgeType: string }
  | { action: 'block'; message: string }
  | { action: 'suggest_addon'; message: string; addonType: string };

export type ResourceType = 'text' | 'voice_stt' | 'voice_tts' | 'journal' | 'thread';

export interface UsageCheckParams {
  memberId?: string;
  anonId?: string;
  tier: MemberTier;
  resource: ResourceType;
  amount?: number; // e.g., seconds for voice, 1 for text turn
}

// ═══════════════════════════════════════════════════════════════════════════
// CANONICAL LIMITS (from MAIA_LIMITS_AND_STEWARDSHIP.md)
// ═══════════════════════════════════════════════════════════════════════════

const LIMITS = {
  free: {
    text_turns_per_day: 10,
    voice_demo_seconds_lifetime: 180, // 3 min
    journals_saved: true,   // Sanctuary Economy: journals are depth, not capacity. Always saved.
    threads_saved: true,    // Sanctuary Economy: threads are continuity. Always saved.
  },
  member_plus: {
    text_turns_per_day_soft: 50, // Soft cap - nudge
    text_turns_per_day_hard: 100, // Hard cap - suggest break
    voice_seconds_per_month: 1200, // 20 min
    journals_saved: true,
    threads_saved: true,
  },
  studio_pro: {
    text_turns_per_day_soft: 200,
    voice_metered: true,
    journals_saved: true,
    threads_saved: true,
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// USER-FACING MESSAGES (from MAIA_LIMITS_AND_STEWARDSHIP.md)
// ═══════════════════════════════════════════════════════════════════════════

const MESSAGES = {
  // Free tier (Sanctuary)
  free_text_limit: "You're working at today's capacity. We can continue tomorrow, or you can expand to give MAIA more room.",
  free_voice_exhausted: "Your voice time for now has completed.",
  // free_no_journal removed — journals are always saved (Sanctuary Economy)

  // Member+ tier
  member_plus_text_nudge: "You've been active today. MAIA is still here — just pacing for sustainability.",
  member_plus_text_soft_limit: "Taking a pause to stay grounded. Your conversations continue tomorrow.",
  member_plus_voice_limit: "You've reached this month's voice ritual time. Voice will refresh next month.",
  member_plus_voice_low: "You have about 5 minutes of voice time remaining this month.",
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// CORE ENFORCEMENT LOGIC
// ═══════════════════════════════════════════════════════════════════════════

export class LimitsEnforcer {
  // Cache for limits_disabled setting (refresh every 30s)
  private static limitsDisabledCache: { value: boolean; timestamp: number } | null = null;
  private static CACHE_TTL_MS = 30_000; // 30 seconds

  /**
   * Check if limits are globally disabled (admin override)
   */
  private static async areLimitsDisabled(): Promise<boolean> {
    // Check cache first
    const now = Date.now();
    if (this.limitsDisabledCache && (now - this.limitsDisabledCache.timestamp) < this.CACHE_TTL_MS) {
      return this.limitsDisabledCache.value;
    }

    try {
      const result = await query(
        `SELECT value FROM system_settings WHERE key = 'limits_disabled'`
      );
      const disabled = result.rows[0]?.value === true;
      this.limitsDisabledCache = { value: disabled, timestamp: now };
      return disabled;
    } catch (error) {
      // If table doesn't exist yet, limits are not disabled
      return false;
    }
  }

  /**
   * Check if a resource usage is allowed, and return the appropriate decision.
   * This is the SINGLE ENFORCEMENT POINT for all tier-based limits.
   */
  static async checkUsage(params: UsageCheckParams): Promise<EnforcementDecision> {
    // Check if limits are globally disabled (admin override for testing)
    if (await this.areLimitsDisabled()) {
      return { action: 'allow' };
    }

    const { tier, resource, memberId, anonId } = params;

    // Route to tier-specific enforcement
    switch (tier) {
      case 'free':
        return this.checkFreeTier(params);
      case 'member_plus':
        return this.checkMemberPlusTier(params);
      case 'studio_pro':
        return this.checkStudioProTier(params);
      default:
        console.warn(`[LimitsEnforcer] Unknown tier: ${tier}, defaulting to free limits`);
        return this.checkFreeTier(params);
    }
  }

  /**
   * Record usage after it happens (call after successful response)
   */
  static async recordUsage(params: UsageCheckParams & { tokensIn?: number; tokensOut?: number }): Promise<void> {
    const { memberId, anonId, resource, amount = 1, tokensIn = 0, tokensOut = 0 } = params;

    try {
      const today = new Date().toISOString().split('T')[0];

      if (resource === 'text') {
        await this.recordTextUsage(memberId, anonId, today, tokensIn, tokensOut);
      } else if (resource === 'voice_stt' || resource === 'voice_tts') {
        await this.recordVoiceUsage(memberId, anonId, resource, amount, params.tier);
      }
    } catch (error) {
      // Log but don't block on recording failure
      console.error('[LimitsEnforcer] Failed to record usage:', error);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // TIER-SPECIFIC ENFORCEMENT
  // ═══════════════════════════════════════════════════════════════════════════

  private static async checkFreeTier(params: UsageCheckParams): Promise<EnforcementDecision> {
    const { resource, memberId, anonId } = params;

    if (resource === 'text') {
      const dailyUsage = await this.getDailyTextUsage(memberId, anonId);

      if (dailyUsage >= LIMITS.free.text_turns_per_day) {
        return {
          action: 'block',
          message: MESSAGES.free_text_limit,
        };
      }
      return { action: 'allow' };
    }

    if (resource === 'voice_stt' || resource === 'voice_tts') {
      const voiceUsage = await this.getVoiceDemoUsage(memberId, anonId);

      if (voiceUsage.exhausted) {
        return {
          action: 'block',
          message: MESSAGES.free_voice_exhausted,
        };
      }
      return { action: 'allow' };
    }

    if (resource === 'journal' || resource === 'thread') {
      // Sanctuary Economy: journals and threads are always saved.
      // Memory is depth, not capacity. Everyone is remembered.
      return { action: 'allow' };
    }

    return { action: 'allow' };
  }

  private static async checkMemberPlusTier(params: UsageCheckParams): Promise<EnforcementDecision> {
    const { resource, memberId } = params;

    // Member+ must have a memberId (anon users are free tier)
    if (!memberId) {
      console.warn('[LimitsEnforcer] Member+ tier without memberId, allowing');
      return { action: 'allow' };
    }

    if (resource === 'text') {
      const dailyUsage = await this.getDailyTextUsage(memberId, undefined);

      if (dailyUsage >= LIMITS.member_plus.text_turns_per_day_hard) {
        return {
          action: 'nudge',
          message: MESSAGES.member_plus_text_soft_limit,
          nudgeType: 'text_soft_limit',
        };
      }

      if (dailyUsage >= LIMITS.member_plus.text_turns_per_day_soft) {
        const alreadyNudged = await this.hasBeenNudgedToday(memberId, 'text_soft_cap');
        if (!alreadyNudged) {
          await this.markNudgeShown(memberId, 'text_soft_cap');
          return {
            action: 'nudge',
            message: MESSAGES.member_plus_text_nudge,
            nudgeType: 'text_soft_cap',
          };
        }
      }

      return { action: 'allow' };
    }

    if (resource === 'voice_stt' || resource === 'voice_tts') {
      const voiceUsage = await this.getMonthlyVoiceUsage(memberId);

      // Check if limit exceeded
      if (voiceUsage.used >= voiceUsage.limit) {
        return {
          action: 'suggest_addon',
          message: MESSAGES.member_plus_voice_limit,
          addonType: 'voice_boost',
        };
      }

      // Warn when low (< 5 minutes remaining)
      const remaining = voiceUsage.limit - voiceUsage.used;
      if (remaining <= 300 && remaining > 0) { // 5 min = 300 sec
        const alreadyWarned = await this.hasBeenNudgedToday(memberId, 'voice_low');
        if (!alreadyWarned) {
          await this.markNudgeShown(memberId, 'voice_low');
          return {
            action: 'nudge',
            message: MESSAGES.member_plus_voice_low,
            nudgeType: 'voice_low',
          };
        }
      }

      return { action: 'allow' };
    }

    // Member+ has no limits on journals/threads
    return { action: 'allow' };
  }

  private static async checkStudioProTier(params: UsageCheckParams): Promise<EnforcementDecision> {
    const { resource, memberId } = params;

    // Studio Pro is metered but not blocked
    // Just log high usage for monitoring

    if (resource === 'text') {
      const dailyUsage = await this.getDailyTextUsage(memberId, undefined);

      if (dailyUsage >= LIMITS.studio_pro.text_turns_per_day_soft) {
        console.log(`[LimitsEnforcer] Studio Pro member ${memberId} at ${dailyUsage} turns today (monitoring)`);
      }
    }

    return { action: 'allow' };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // DATABASE QUERIES
  // ═══════════════════════════════════════════════════════════════════════════

  private static async getDailyTextUsage(memberId?: string, anonId?: string): Promise<number> {
    const today = new Date().toISOString().split('T')[0];

    try {
      const result = memberId
        ? await query(
            `SELECT text_turns FROM usage_daily WHERE member_id = $1 AND usage_date = $2`,
            [memberId, today]
          )
        : await query(
            `SELECT text_turns FROM usage_daily WHERE anon_id = $1 AND usage_date = $2`,
            [anonId, today]
          );

      return result.rows[0]?.text_turns ?? 0;
    } catch (error) {
      // Table might not exist yet - return 0 to allow usage
      console.warn('[LimitsEnforcer] Could not query daily usage:', error);
      return 0;
    }
  }

  private static async getVoiceDemoUsage(memberId?: string, anonId?: string): Promise<{ used: number; limit: number; exhausted: boolean }> {
    try {
      const result = memberId
        ? await query(`SELECT voice_seconds_used, voice_seconds_limit, demo_exhausted FROM usage_voice_demo WHERE member_id = $1`, [memberId])
        : await query(`SELECT voice_seconds_used, voice_seconds_limit, demo_exhausted FROM usage_voice_demo WHERE anon_id = $1`, [anonId]);

      if (result.rows[0]) {
        return {
          used: result.rows[0].voice_seconds_used,
          limit: result.rows[0].voice_seconds_limit,
          exhausted: result.rows[0].demo_exhausted,
        };
      }

      return { used: 0, limit: LIMITS.free.voice_demo_seconds_lifetime, exhausted: false };
    } catch (error) {
      console.warn('[LimitsEnforcer] Could not query voice demo usage:', error);
      return { used: 0, limit: LIMITS.free.voice_demo_seconds_lifetime, exhausted: false };
    }
  }

  private static async getMonthlyVoiceUsage(memberId: string): Promise<{ used: number; limit: number }> {
    const monthStart = new Date();
    monthStart.setDate(1);
    const monthStartStr = monthStart.toISOString().split('T')[0];

    try {
      const result = await query(
        `SELECT voice_seconds_used, voice_seconds_limit, voice_boost_seconds
         FROM usage_voice_monthly WHERE member_id = $1 AND usage_month = $2`,
        [memberId, monthStartStr]
      );

      if (result.rows[0]) {
        const row = result.rows[0];
        return {
          used: row.voice_seconds_used,
          limit: row.voice_seconds_limit + (row.voice_boost_seconds || 0),
        };
      }

      return { used: 0, limit: LIMITS.member_plus.voice_seconds_per_month };
    } catch (error) {
      console.warn('[LimitsEnforcer] Could not query monthly voice usage:', error);
      return { used: 0, limit: LIMITS.member_plus.voice_seconds_per_month };
    }
  }

  private static async hasBeenNudgedToday(memberId: string, nudgeType: string): Promise<boolean> {
    const today = new Date().toISOString().split('T')[0];

    try {
      const result = await query(
        `SELECT nudge_shown FROM usage_daily
         WHERE member_id = $1 AND usage_date = $2 AND nudge_type = $3 AND nudge_shown = true`,
        [memberId, today, nudgeType]
      );
      return result.rows.length > 0;
    } catch (error) {
      return false;
    }
  }

  private static async markNudgeShown(memberId: string, nudgeType: string): Promise<void> {
    const today = new Date().toISOString().split('T')[0];

    try {
      await query(
        `INSERT INTO usage_daily (member_id, usage_date, nudge_shown, nudge_type)
         VALUES ($1, $2, true, $3)
         ON CONFLICT (member_id, usage_date)
         DO UPDATE SET nudge_shown = true, nudge_type = $3, updated_at = NOW()`,
        [memberId, today, nudgeType]
      );
    } catch (error) {
      console.warn('[LimitsEnforcer] Could not mark nudge shown:', error);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // USAGE RECORDING
  // ═══════════════════════════════════════════════════════════════════════════

  private static async recordTextUsage(
    memberId: string | undefined,
    anonId: string | undefined,
    date: string,
    tokensIn: number,
    tokensOut: number
  ): Promise<void> {
    if (memberId) {
      await query(
        `INSERT INTO usage_daily (member_id, usage_date, text_turns, text_tokens_in, text_tokens_out)
         VALUES ($1, $2, 1, $3, $4)
         ON CONFLICT (member_id, usage_date)
         DO UPDATE SET
           text_turns = usage_daily.text_turns + 1,
           text_tokens_in = usage_daily.text_tokens_in + $3,
           text_tokens_out = usage_daily.text_tokens_out + $4,
           updated_at = NOW()`,
        [memberId, date, tokensIn, tokensOut]
      );
    } else if (anonId) {
      await query(
        `INSERT INTO usage_daily (anon_id, usage_date, text_turns, text_tokens_in, text_tokens_out)
         VALUES ($1, $2, 1, $3, $4)
         ON CONFLICT (anon_id, usage_date)
         DO UPDATE SET
           text_turns = usage_daily.text_turns + 1,
           text_tokens_in = usage_daily.text_tokens_in + $3,
           text_tokens_out = usage_daily.text_tokens_out + $4,
           updated_at = NOW()`,
        [anonId, date, tokensIn, tokensOut]
      );
    }
  }

  private static async recordVoiceUsage(
    memberId: string | undefined,
    anonId: string | undefined,
    resource: 'voice_stt' | 'voice_tts',
    seconds: number,
    tier: MemberTier
  ): Promise<void> {
    const column = resource === 'voice_stt' ? 'voice_seconds_stt' : 'voice_seconds_tts';
    const today = new Date().toISOString().split('T')[0];

    // Record daily voice usage
    if (memberId) {
      await query(
        `INSERT INTO usage_daily (member_id, usage_date, ${column})
         VALUES ($1, $2, $3)
         ON CONFLICT (member_id, usage_date)
         DO UPDATE SET ${column} = usage_daily.${column} + $3, updated_at = NOW()`,
        [memberId, today, seconds]
      );
    } else if (anonId) {
      await query(
        `INSERT INTO usage_daily (anon_id, usage_date, ${column})
         VALUES ($1, $2, $3)
         ON CONFLICT (anon_id, usage_date)
         DO UPDATE SET ${column} = usage_daily.${column} + $3, updated_at = NOW()`,
        [anonId, today, seconds]
      );
    }

    // For free tier: update lifetime demo usage
    if (tier === 'free') {
      if (memberId) {
        await query(
          `INSERT INTO usage_voice_demo (member_id, voice_seconds_used)
           VALUES ($1, $2)
           ON CONFLICT (member_id)
           DO UPDATE SET
             voice_seconds_used = usage_voice_demo.voice_seconds_used + $2,
             demo_exhausted = (usage_voice_demo.voice_seconds_used + $2) >= usage_voice_demo.voice_seconds_limit,
             updated_at = NOW()`,
          [memberId, seconds]
        );
      } else if (anonId) {
        await query(
          `INSERT INTO usage_voice_demo (anon_id, voice_seconds_used)
           VALUES ($1, $2)
           ON CONFLICT (anon_id)
           DO UPDATE SET
             voice_seconds_used = usage_voice_demo.voice_seconds_used + $2,
             demo_exhausted = (usage_voice_demo.voice_seconds_used + $2) >= usage_voice_demo.voice_seconds_limit,
             updated_at = NOW()`,
          [anonId, seconds]
        );
      }
    }

    // For member+: update monthly voice budget
    if (tier === 'member_plus' && memberId) {
      const monthStart = new Date();
      monthStart.setDate(1);
      const monthStartStr = monthStart.toISOString().split('T')[0];

      await query(
        `INSERT INTO usage_voice_monthly (member_id, usage_month, voice_seconds_used)
         VALUES ($1, $2, $3)
         ON CONFLICT (member_id, usage_month)
         DO UPDATE SET voice_seconds_used = usage_voice_monthly.voice_seconds_used + $3, updated_at = NOW()`,
        [memberId, monthStartStr, seconds]
      );
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPER: Get member tier from database
// ═══════════════════════════════════════════════════════════════════════════

export async function getMemberTier(memberId: string): Promise<MemberTier> {
  try {
    const result = await query(
      `SELECT tier FROM members WHERE id = $1`,
      [memberId]
    );

    const tier = result.rows[0]?.tier;

    if (tier === 'studio_pro' || tier === 'studio') {
      return 'studio_pro';
    }
    if (tier === 'member_plus' || tier === 'supporter' || tier === 'member') {
      return 'member_plus';
    }

    return 'free';
  } catch (error) {
    console.warn('[getMemberTier] Could not query tier, defaulting to free:', error);
    return 'free';
  }
}

export default LimitsEnforcer;
