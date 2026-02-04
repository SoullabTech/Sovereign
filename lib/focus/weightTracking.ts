/**
 * STEWARDSHIP WEIGHT TRACKING
 *
 * Cost-bearing thresholds for stewardship.
 * Not a paywall. An honest accounting of shared labor.
 *
 * "Soullab doesn't sell attention. It shares the cost of sustained care."
 *
 * NOTE:
 * This weight system is shared across:
 * - Focus Flow (member-facing)
 * - Practitioner portals (SMS, email, outreach)
 * - MAIA background services
 *
 * UI thresholds are currently enforced ONLY in Focus Flow.
 * Other callers log weight silently for now.
 *
 * The system is a shared ledger, not a feature gate.
 * Focus Flow is just the first visible citizen of a system that already exists.
 */

import { query, insertOne, queryOne } from '@/lib/db/postgres';

// ============================================================================
// Action Weights
// ============================================================================

/**
 * Weight values for cost-bearing actions.
 * These represent real costs: compute, infrastructure, scheduled attention.
 *
 * Key rule: Weight reflects cost, not moral importance.
 *
 * Categories:
 * - Member actions: Focus Flow, MAIA conversation, pattern work
 * - Practitioner actions: SMS, email blasts, client management
 * - System actions: Background monitoring, persistence
 */
export const ACTION_WEIGHTS = {
  // ========================================
  // Zero cost - always available
  // ========================================
  capture: 0,              // Local, instant

  // ========================================
  // Light cost (1)
  // ========================================
  next_step: 1,            // Light compute
  focus_garden_visit: 1,   // Wisdom access
  background_monitoring: 1, // Per hour of presence
  memory_persistence: 1,    // Per day of storage

  // ========================================
  // Medium cost (2)
  // ========================================
  pattern_query: 2,        // Database + analysis
  reminder_scheduled: 2,   // Scheduled email (internal)
  client_reminder: 2,      // Practitioner: client reminder

  // ========================================
  // High cost (3)
  // ========================================
  ai_draft: 3,             // Claude API call
  focus_garden_complete: 3, // Full wisdom session
  email_send: 3,           // Practitioner: email send (Resend)

  // ========================================
  // Heavy cost (4-5)
  // ========================================
  sms_send: 4,             // Practitioner: Twilio SMS
  gmail_send: 5,           // OAuth + Gmail delivery
  campaign_schedule: 5,    // Practitioner: scheduled campaign

  // ========================================
  // Bulk operations (8+)
  // ========================================
  bulk_outreach: 8,        // Practitioner: mass outreach
} as const;

export type ActionType = keyof typeof ACTION_WEIGHTS;

// ============================================================================
// Threshold Levels
// ============================================================================

/**
 * Threshold configuration by stewardship tier.
 * Higher tiers have higher thresholds before invitations appear.
 */
export const TIER_THRESHOLDS = {
  witness: {
    soft: 20,      // Acknowledgment appears
    medium: 40,    // Invitation appears
    hard: 60,      // Honest pause
  },
  holder: {
    soft: 60,
    medium: 100,
    hard: 150,
  },
  steward: {
    soft: 200,
    medium: 400,
    hard: Infinity, // Never paused
  },
  sustainer: {
    soft: Infinity,
    medium: Infinity,
    hard: Infinity, // Never paused
  },
  sponsored: {
    soft: 40,
    medium: 60,
    hard: 80,
  },
} as const;

export type StewardshipTier = keyof typeof TIER_THRESHOLDS;

export type ThresholdLevel = 'none' | 'acknowledgment' | 'invitation' | 'pause';

// ============================================================================
// Types
// ============================================================================

export interface WeightLogEntry {
  id: string;
  member_id: string;
  action_type: string;
  weight: number;
  source?: string;
  metadata?: Record<string, any>;
  created_at: Date;
}

export interface ThresholdCheck {
  allowed: boolean;
  level: ThresholdLevel;
  currentWeight: number;
  projectedWeight: number;
  tier: StewardshipTier;
  message?: string;
}

export interface MemberStewardship {
  tier: StewardshipTier;
  weeklyWeight: number;
  monthlyWeight: number;
  sponsoredUntil?: Date;
}

// ============================================================================
// Weight Logging
// ============================================================================

/**
 * Log a cost-bearing action for a member.
 */
export async function logAction(
  memberId: string,
  actionType: ActionType,
  options?: {
    source?: string;
    metadata?: Record<string, any>;
  }
): Promise<WeightLogEntry> {
  const weight = ACTION_WEIGHTS[actionType];

  const entry = await insertOne<WeightLogEntry>('focus_weight_log', {
    member_id: memberId,
    action_type: actionType,
    weight,
    source: options?.source || null,
    metadata: options?.metadata ? JSON.stringify(options.metadata) : '{}',
  });

  console.log(`[Weight] Logged ${actionType} (${weight}) for member ${memberId.slice(0, 8)}...`);

  return entry;
}

/**
 * Get weekly weight for a member.
 */
export async function getWeeklyWeight(memberId: string): Promise<number> {
  const result = await queryOne<{ weekly_weight: number }>(
    'SELECT weekly_weight($1) as weekly_weight',
    [memberId]
  );

  return result?.weekly_weight || 0;
}

/**
 * Get monthly weight for a member.
 */
export async function getMonthlyWeight(memberId: string): Promise<number> {
  const result = await queryOne<{ monthly_weight: number }>(
    'SELECT monthly_weight($1) as monthly_weight',
    [memberId]
  );

  return result?.monthly_weight || 0;
}

/**
 * Get member's stewardship status.
 */
export async function getMemberStewardship(memberId: string): Promise<MemberStewardship> {
  const member = await queryOne<{
    stewardship_tier: StewardshipTier;
    sponsored_until: Date | null;
  }>(
    'SELECT stewardship_tier, sponsored_until FROM members WHERE id = $1',
    [memberId]
  );

  const weeklyWeight = await getWeeklyWeight(memberId);
  const monthlyWeight = await getMonthlyWeight(memberId);

  // Check if sponsored access has expired
  let tier = member?.stewardship_tier || 'witness';
  if (tier === 'sponsored' && member?.sponsored_until) {
    if (new Date(member.sponsored_until) < new Date()) {
      tier = 'witness'; // Expired, revert to witness
    }
  }

  return {
    tier,
    weeklyWeight,
    monthlyWeight,
    sponsoredUntil: member?.sponsored_until || undefined,
  };
}

// ============================================================================
// Threshold Classification
// ============================================================================

/**
 * Check if an action is allowed and what threshold level applies.
 * This is the core logic for the cost-bearing threshold system.
 */
export async function checkThreshold(
  memberId: string,
  actionType: ActionType
): Promise<ThresholdCheck> {
  const stewardship = await getMemberStewardship(memberId);
  const actionWeight = ACTION_WEIGHTS[actionType];
  const projectedWeight = stewardship.weeklyWeight + actionWeight;

  const thresholds = TIER_THRESHOLDS[stewardship.tier];

  // Determine threshold level
  let level: ThresholdLevel;
  let allowed = true;
  let message: string | undefined;

  if (projectedWeight <= thresholds.soft) {
    level = 'none';
  } else if (projectedWeight <= thresholds.medium) {
    level = 'acknowledgment';
  } else if (projectedWeight <= thresholds.hard) {
    level = 'invitation';
  } else {
    level = 'pause';
    // Still allowed, but with honest pause
    message = "You're asking Soullab to carry a lot this week.";
  }

  return {
    allowed,
    level,
    currentWeight: stewardship.weeklyWeight,
    projectedWeight,
    tier: stewardship.tier,
    message,
  };
}

/**
 * Check threshold before an action and log it if proceeding.
 * Convenience function that combines check + log.
 */
export async function checkAndLogAction(
  memberId: string,
  actionType: ActionType,
  options?: {
    source?: string;
    metadata?: Record<string, any>;
  }
): Promise<ThresholdCheck & { logged: boolean }> {
  const check = await checkThreshold(memberId, actionType);

  // Zero-weight actions always log silently
  if (ACTION_WEIGHTS[actionType] === 0) {
    await logAction(memberId, actionType, options);
    return { ...check, logged: true };
  }

  // Non-zero actions log but return threshold info for UI to handle
  await logAction(memberId, actionType, options);

  return { ...check, logged: true };
}

// ============================================================================
// Tier Management
// ============================================================================

/**
 * Update a member's stewardship tier.
 */
export async function updateMemberTier(
  memberId: string,
  tier: StewardshipTier,
  sponsoredUntil?: Date
): Promise<void> {
  await query(
    `UPDATE members
     SET stewardship_tier = $1,
         sponsored_until = $2
     WHERE id = $3`,
    [tier, sponsoredUntil || null, memberId]
  );

  console.log(`[Weight] Updated tier for ${memberId.slice(0, 8)}... to ${tier}`);
}

/**
 * Grant sponsored access to a member.
 */
export async function grantSponsoredAccess(
  recipientId: string,
  durationDays: number = 30,
  poolContributionId?: string
): Promise<void> {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + durationDays);

  // Update member tier
  await updateMemberTier(recipientId, 'sponsored', expiresAt);

  // Record the grant (without attribution to contributor - privacy)
  await insertOne('sponsored_access_grants', {
    recipient_id: recipientId,
    pool_contribution_id: poolContributionId || null,
    expires_at: expiresAt,
  });

  console.log(`[Weight] Granted ${durationDays} days sponsored access to ${recipientId.slice(0, 8)}...`);
}

// ============================================================================
// Analytics (for internal dashboards)
// ============================================================================

/**
 * Get weight distribution across all members (for analytics).
 */
export async function getWeightDistribution(): Promise<{
  totalMembers: number;
  byTier: Record<StewardshipTier, number>;
  averageWeeklyWeight: number;
  highUsageCount: number;
}> {
  const tierCounts = await query<{ tier: StewardshipTier; count: number }>(
    `SELECT stewardship_tier as tier, COUNT(*) as count
     FROM members
     GROUP BY stewardship_tier`
  );

  const avgWeight = await queryOne<{ avg: number }>(
    `SELECT AVG(weekly_weight(id))::INTEGER as avg FROM members`
  );

  const highUsage = await queryOne<{ count: number }>(
    `SELECT COUNT(*) as count FROM members WHERE weekly_weight(id) > 40`
  );

  const byTier: Record<StewardshipTier, number> = {
    witness: 0,
    holder: 0,
    steward: 0,
    sustainer: 0,
    sponsored: 0,
  };

  for (const row of tierCounts.rows) {
    byTier[row.tier] = Number(row.count);
  }

  return {
    totalMembers: Object.values(byTier).reduce((a, b) => a + b, 0),
    byTier,
    averageWeeklyWeight: avgWeight?.avg || 0,
    highUsageCount: highUsage?.count || 0,
  };
}

/**
 * Get action breakdown for a member (for personal insights).
 */
export async function getMemberActionBreakdown(
  memberId: string,
  days: number = 7
): Promise<Record<string, { count: number; totalWeight: number }>> {
  const result = await query<{
    action_type: string;
    count: number;
    total_weight: number;
  }>(
    `SELECT
       action_type,
       COUNT(*)::INTEGER as count,
       SUM(weight)::INTEGER as total_weight
     FROM focus_weight_log
     WHERE member_id = $1 AND created_at > NOW() - INTERVAL '${days} days'
     GROUP BY action_type
     ORDER BY total_weight DESC`,
    [memberId]
  );

  const breakdown: Record<string, { count: number; totalWeight: number }> = {};
  for (const row of result.rows) {
    breakdown[row.action_type] = {
      count: Number(row.count),
      totalWeight: Number(row.total_weight),
    };
  }

  return breakdown;
}

// ============================================================================
// Exports
// ============================================================================

export const WeightTracking = {
  // Constants
  ACTION_WEIGHTS,
  TIER_THRESHOLDS,

  // Core functions
  logAction,
  getWeeklyWeight,
  getMonthlyWeight,
  getMemberStewardship,
  checkThreshold,
  checkAndLogAction,

  // Tier management
  updateMemberTier,
  grantSponsoredAccess,

  // Analytics
  getWeightDistribution,
  getMemberActionBreakdown,
};

export default WeightTracking;
