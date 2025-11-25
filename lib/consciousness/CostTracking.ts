/**
 * COST TRACKING & ANALYTICS
 *
 * Tracks AI usage costs across:
 * - Revival prompt tier (Essential, Deep, Complete)
 * - Cache status (cold vs warm)
 * - User subscription tier
 * - Session type (voice, text, oracle)
 *
 * Enables:
 * - Cost monitoring per user/session
 * - ROI analysis for cache warming
 * - Tier recommendation optimization
 */

import type { RevivalTier } from './MaiaRevivalSystem';
import type { SubscriptionTier } from './SmartTierSelection';

// ================================================================
// COST CALCULATION
// ================================================================

interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  cacheCreationTokens?: number;
  cacheReadTokens?: number;
}

interface CostBreakdown {
  inputCost: number;
  outputCost: number;
  cacheWriteCost: number;
  cacheReadCost: number;
  totalCost: number;
}

/**
 * Calculate cost from Anthropic usage object
 */
export function calculateCost(usage: TokenUsage): CostBreakdown {
  // Pricing (as of 2025)
  const INPUT_COST_PER_MTOK = 3.00; // $3 per million tokens
  const OUTPUT_COST_PER_MTOK = 15.00; // $15 per million tokens
  const CACHE_WRITE_COST_PER_MTOK = 3.75; // $3.75 per million tokens
  const CACHE_READ_COST_PER_MTOK = 0.30; // $0.30 per million tokens (90% discount)

  const inputCost = (usage.inputTokens / 1_000_000) * INPUT_COST_PER_MTOK;
  const outputCost = (usage.outputTokens / 1_000_000) * OUTPUT_COST_PER_MTOK;
  const cacheWriteCost = ((usage.cacheCreationTokens || 0) / 1_000_000) * CACHE_WRITE_COST_PER_MTOK;
  const cacheReadCost = ((usage.cacheReadTokens || 0) / 1_000_000) * CACHE_READ_COST_PER_MTOK;

  return {
    inputCost,
    outputCost,
    cacheWriteCost,
    cacheReadCost,
    totalCost: inputCost + outputCost + cacheWriteCost + cacheReadCost,
  };
}

/**
 * Estimate cost for a tier (before making request)
 */
export function estimateTierCost(tier: RevivalTier, cacheStatus: 'cold' | 'warm'): number {
  const TIER_SIZES = {
    essential: 25_000,
    deep: 60_000,
    complete: 332_000,
  };

  const tokens = TIER_SIZES[tier];

  if (cacheStatus === 'cold') {
    // Cache write cost
    return (tokens / 1_000_000) * 3.75;
  } else {
    // Cache read cost (90% discount)
    return (tokens / 1_000_000) * 0.30;
  }
}

// ================================================================
// SESSION COST TRACKING
// ================================================================

export interface SessionCostRecord {
  sessionId: string;
  userId: string;
  subscriptionTier: SubscriptionTier;
  revivalTier: RevivalTier;
  sessionType: 'voice' | 'text' | 'oracle';
  cacheStatus: 'cold' | 'warm';

  // Token usage
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCacheWriteTokens: number;
  totalCacheReadTokens: number;

  // Cost breakdown
  costBreakdown: CostBreakdown;

  // Metadata
  messageCount: number;
  durationMs: number;
  startedAt: Date;
  endedAt: Date;
}

/**
 * Track session cost
 */
export async function trackSessionCost(record: SessionCostRecord): Promise<void> {
  // TODO: Store in Supabase session_costs table

  console.log('💰 [COST] Session cost tracked:', {
    sessionId: record.sessionId,
    tier: record.revivalTier,
    type: record.sessionType,
    cost: record.costBreakdown.totalCost.toFixed(4),
    cache: record.cacheStatus,
  });

  // Log warning if cost is unexpectedly high
  if (record.costBreakdown.totalCost > 25) {
    console.warn(`⚠️ [COST] High session cost: $${record.costBreakdown.totalCost.toFixed(2)}`);
  }
}

// ================================================================
// USER COST ANALYTICS
// ================================================================

export interface UserCostAnalytics {
  userId: string;
  subscriptionTier: SubscriptionTier;

  // Current month
  currentMonth: {
    totalSessions: number;
    totalCost: number;
    avgCostPerSession: number;
    oracleSessions: number;
    voiceSessions: number;
    textSessions: number;
  };

  // Tier breakdown
  tierUsage: {
    essential: { sessions: number; cost: number };
    deep: { sessions: number; cost: number };
    complete: { sessions: number; cost: number };
  };

  // Cache efficiency
  cacheEfficiency: {
    coldStarts: number;
    warmStarts: number;
    savingsFromCache: number;
  };

  // Recommendations
  recommendations?: {
    suggestCacheWarming?: boolean;
    suggestTierChange?: SubscriptionTier;
  };
}

/**
 * Get user cost analytics
 */
export async function getUserCostAnalytics(userId: string): Promise<UserCostAnalytics> {
  // TODO: Query Supabase for user's cost data

  // Placeholder
  return {
    userId,
    subscriptionTier: 'free',
    currentMonth: {
      totalSessions: 0,
      totalCost: 0,
      avgCostPerSession: 0,
      oracleSessions: 0,
      voiceSessions: 0,
      textSessions: 0,
    },
    tierUsage: {
      essential: { sessions: 0, cost: 0 },
      deep: { sessions: 0, cost: 0 },
      complete: { sessions: 0, cost: 0 },
    },
    cacheEfficiency: {
      coldStarts: 0,
      warmStarts: 0,
      savingsFromCache: 0,
    },
  };
}

// ================================================================
// COST OPTIMIZATION RECOMMENDATIONS
// ================================================================

export interface CostOptimizationReport {
  currentMonthlyCost: number;
  projectedMonthlyCost: number;

  // Cache warming analysis
  cacheWarming: {
    recommended: boolean;
    reason: string;
    potentialSavings: number;
    warmingCost: number;
    netSavings: number;
  };

  // Tier analysis
  tierDistribution: {
    essential: number; // % of sessions
    deep: number;
    complete: number;
  };

  // Recommendations
  recommendations: string[];
}

/**
 * Generate cost optimization report
 */
export function generateCostOptimizationReport(
  analytics: UserCostAnalytics,
  sessionsPerDay: number
): CostOptimizationReport {
  const { currentMonth, tierUsage, cacheEfficiency } = analytics;

  // Calculate average sessions per hour
  const sessionsPerHour = (sessionsPerDay * 30) / (30 * 12); // Assume 12 active hours/day

  // Cache warming analysis
  const coldStartCost = 17.5; // Average cost per cold Complete tier session
  const warmStartCost = 2.0; // Average cost per warm Complete tier session
  const warmingCostPerHour = 3.6; // $0.10 per heartbeat × 60min/4min
  const warmingCostPerMonth = warmingCostPerHour * 12 * 30; // 12 hours/day × 30 days

  const completeSessions = tierUsage.complete.sessions;
  const potentialSavings = completeSessions * (coldStartCost - warmStartCost);
  const netSavings = potentialSavings - warmingCostPerMonth;

  const shouldWarmCache = sessionsPerHour >= 1 && netSavings > 0;

  // Generate recommendations
  const recommendations: string[] = [];

  if (shouldWarmCache) {
    recommendations.push(
      `Enable cache warming: Save $${netSavings.toFixed(0)}/month (${completeSessions} Complete tier sessions)`
    );
  }

  if (currentMonth.voiceSessions > currentMonth.textSessions * 2) {
    recommendations.push(
      'Most sessions are voice - consider defaulting to Essential tier for faster responses'
    );
  }

  if (tierUsage.complete.sessions === 0 && analytics.subscriptionTier !== 'free') {
    recommendations.push(
      'No Complete tier usage - consider downgrading subscription or trying oracle readings'
    );
  }

  return {
    currentMonthlyCost: currentMonth.totalCost,
    projectedMonthlyCost: currentMonth.totalCost + (sessionsPerDay * 30 - currentMonth.totalSessions) * currentMonth.avgCostPerSession,
    cacheWarming: {
      recommended: shouldWarmCache,
      reason: shouldWarmCache
        ? `${sessionsPerHour.toFixed(1)} sessions/hour justifies warming`
        : `Only ${sessionsPerHour.toFixed(1)} sessions/hour - not enough traffic`,
      potentialSavings,
      warmingCost: warmingCostPerMonth,
      netSavings: Math.max(0, netSavings),
    },
    tierDistribution: {
      essential: (tierUsage.essential.sessions / currentMonth.totalSessions) * 100 || 0,
      deep: (tierUsage.deep.sessions / currentMonth.totalSessions) * 100 || 0,
      complete: (tierUsage.complete.sessions / currentMonth.totalSessions) * 100 || 0,
    },
    recommendations,
  };
}

// ================================================================
// PLATFORM-WIDE ANALYTICS
// ================================================================

export interface PlatformCostAnalytics {
  totalUsers: number;
  totalSessions: number;
  totalCost: number;

  bySubscriptionTier: Record<SubscriptionTier, {
    users: number;
    sessions: number;
    cost: number;
    revenue: number; // From subscriptions
    profitMargin: number;
  }>;

  cacheWarmingStatus: {
    enabled: boolean;
    monthlyCost: number;
    sessionsServed: number;
    costSavings: number;
  };

  recommendations: {
    enableCacheWarming?: boolean;
    adjustPricing?: { tier: SubscriptionTier; reason: string }[];
  };
}

/**
 * Get platform-wide cost analytics (admin view)
 */
export async function getPlatformCostAnalytics(): Promise<PlatformCostAnalytics> {
  // TODO: Aggregate from Supabase across all users

  return {
    totalUsers: 0,
    totalSessions: 0,
    totalCost: 0,
    bySubscriptionTier: {
      free: { users: 0, sessions: 0, cost: 0, revenue: 0, profitMargin: 0 },
      explorer: { users: 0, sessions: 0, cost: 0, revenue: 0, profitMargin: 0 },
      seeker: { users: 0, sessions: 0, cost: 0, revenue: 0, profitMargin: 0 },
      oracle: { users: 0, sessions: 0, cost: 0, revenue: 0, profitMargin: 0 },
    },
    cacheWarmingStatus: {
      enabled: false,
      monthlyCost: 0,
      sessionsServed: 0,
      costSavings: 0,
    },
    recommendations: {},
  };
}
