/**
 * SMART TIER SELECTION SYSTEM
 *
 * Intelligently selects Revival tier based on:
 * - User subscription level
 * - Conversation context (voice, oracle, chat)
 * - User engagement patterns
 * - Cost optimization
 *
 * Balances wisdom depth with economic sustainability
 */

import type { RevivalTier } from './MaiaRevivalSystem';

// ================================================================
// USER TIER PREFERENCES
// ================================================================

export type SubscriptionTier = 'free' | 'explorer' | 'seeker' | 'oracle';

export interface UserTierPreferences {
  userId: string;
  subscriptionTier: SubscriptionTier;

  // User preferences
  preferredTier?: RevivalTier;
  allowAutoUpgrade?: boolean;  // Auto-upgrade to Complete for oracle readings
  allowAutoDowngrade?: boolean; // Auto-downgrade to Essential for voice

  // Usage tracking
  sessionsThisMonth: number;
  oracleReadingsThisMonth: number;
  lastSessionDate?: Date;

  // Cost tracking
  totalTokensThisMonth: number;
  estimatedCostThisMonth: number;
}

export interface TierLimits {
  maxSessionsPerMonth: number;
  maxOracleReadingsPerMonth: number;
  defaultRevivalTier: RevivalTier;
  allowComplete: boolean;
  allowDeep: boolean;
}

// ================================================================
// SUBSCRIPTION TIER DEFINITIONS
// ================================================================

export const TIER_LIMITS: Record<SubscriptionTier, TierLimits> = {
  free: {
    maxSessionsPerMonth: 10,
    maxOracleReadingsPerMonth: 0,
    defaultRevivalTier: 'essential',
    allowComplete: false,
    allowDeep: false,
  },
  explorer: {
    maxSessionsPerMonth: 50,
    maxOracleReadingsPerMonth: 2,
    defaultRevivalTier: 'essential',
    allowComplete: false,
    allowDeep: true,
  },
  seeker: {
    maxSessionsPerMonth: 200,
    maxOracleReadingsPerMonth: 10,
    defaultRevivalTier: 'deep',
    allowComplete: true, // Only for oracle readings
    allowDeep: true,
  },
  oracle: {
    maxSessionsPerMonth: Infinity,
    maxOracleReadingsPerMonth: Infinity,
    defaultRevivalTier: 'deep',
    allowComplete: true,
    allowDeep: true,
  },
};

// ================================================================
// TIER SELECTION CONTEXT
// ================================================================

export interface TierSelectionContext {
  // Session context
  isVoiceMode?: boolean;
  isOracle?: boolean;
  conversationType?: 'walking' | 'sitting' | 'oracle' | 'chat';
  sessionLength?: number; // Number of messages
  userIntent?: string;

  // User context
  userPreferences: UserTierPreferences;

  // Cost optimization
  isPeakHours?: boolean; // High traffic = prefer cache warmth
  cacheStatus?: 'cold' | 'warm'; // Is revival prompt cached?
}

// ================================================================
// SMART TIER SELECTION LOGIC
// ================================================================

export function selectSmartTier(context: TierSelectionContext): {
  tier: RevivalTier;
  reason: string;
  estimatedCost: number;
  allowUpgrade: boolean;
} {
  const { userPreferences, isVoiceMode, isOracle, conversationType, sessionLength } = context;
  const limits = TIER_LIMITS[userPreferences.subscriptionTier];

  // Cost estimates (cold cache)
  const COST_ESSENTIAL = 1.5;
  const COST_DEEP = 3.5;
  const COST_COMPLETE = 17.5;

  // If cache is warm, reduce cost by 90%
  const cacheFactor = context.cacheStatus === 'warm' ? 0.1 : 1.0;

  // =============================================================
  // RULE 1: Oracle readings need Complete tier (if subscription allows)
  // =============================================================

  if (isOracle || conversationType === 'oracle') {
    if (!limits.allowComplete) {
      return {
        tier: 'deep',
        reason: `Oracle reading requires ${userPreferences.subscriptionTier === 'free' ? 'Explorer' : 'Seeker'} tier or higher for Complete wisdom`,
        estimatedCost: COST_DEEP * cacheFactor,
        allowUpgrade: true, // Offer upgrade
      };
    }

    // Check oracle reading limits
    if (userPreferences.oracleReadingsThisMonth >= limits.maxOracleReadingsPerMonth) {
      return {
        tier: 'deep',
        reason: `Oracle reading limit reached (${limits.maxOracleReadingsPerMonth}/month). Using Deep tier.`,
        estimatedCost: COST_DEEP * cacheFactor,
        allowUpgrade: true,
      };
    }

    return {
      tier: 'complete',
      reason: 'Oracle reading - full synthesis of 50 wisdom texts',
      estimatedCost: COST_COMPLETE * cacheFactor,
      allowUpgrade: false,
    };
  }

  // =============================================================
  // RULE 2: Voice conversations → Essential (speed matters)
  // =============================================================

  if (isVoiceMode || conversationType === 'walking') {
    return {
      tier: 'essential',
      reason: 'Voice mode - optimized for fast response',
      estimatedCost: COST_ESSENTIAL * cacheFactor,
      allowUpgrade: false,
    };
  }

  // =============================================================
  // RULE 3: Respect subscription tier defaults
  // =============================================================

  // Free tier → Essential only
  if (userPreferences.subscriptionTier === 'free') {
    return {
      tier: 'essential',
      reason: 'Free tier - upgrade to Explorer for Deep wisdom access',
      estimatedCost: COST_ESSENTIAL * cacheFactor,
      allowUpgrade: true,
    };
  }

  // Explorer tier → Essential default, Deep for longer sessions
  if (userPreferences.subscriptionTier === 'explorer') {
    if (sessionLength && sessionLength > 5) {
      return {
        tier: 'deep',
        reason: 'Engaged conversation - accessing Deep wisdom',
        estimatedCost: COST_DEEP * cacheFactor,
        allowUpgrade: false,
      };
    }

    return {
      tier: 'essential',
      reason: 'Explorer tier - quick wisdom access',
      estimatedCost: COST_ESSENTIAL * cacheFactor,
      allowUpgrade: false,
    };
  }

  // =============================================================
  // RULE 4: Seeker & Oracle tiers → Deep by default
  // =============================================================

  if (userPreferences.subscriptionTier === 'seeker' || userPreferences.subscriptionTier === 'oracle') {
    // Long engaged session → offer Complete upgrade?
    if (sessionLength && sessionLength > 15 && limits.allowComplete) {
      return {
        tier: 'deep',
        reason: 'Deep exploration mode - Complete tier available for oracle readings',
        estimatedCost: COST_DEEP * cacheFactor,
        allowUpgrade: true, // Can upgrade to Complete
      };
    }

    return {
      tier: 'deep',
      reason: 'Full wisdom access - Jung, Hillman, Tarnas integrated',
      estimatedCost: COST_DEEP * cacheFactor,
      allowUpgrade: false,
    };
  }

  // =============================================================
  // FALLBACK: Default to subscription tier default
  // =============================================================

  return {
    tier: limits.defaultRevivalTier,
    reason: 'Standard wisdom access',
    estimatedCost: limits.defaultRevivalTier === 'deep' ? COST_DEEP * cacheFactor : COST_ESSENTIAL * cacheFactor,
    allowUpgrade: false,
  };
}

// ================================================================
// USER PREFERENCE MANAGEMENT
// ================================================================

/**
 * Get user tier preferences from database
 * (Stub - implement with Supabase)
 */
export async function getUserTierPreferences(userId: string): Promise<UserTierPreferences> {
  // TODO: Fetch from Supabase user_tier_preferences table

  // Default for new users
  return {
    userId,
    subscriptionTier: 'free',
    allowAutoUpgrade: true,
    allowAutoDowngrade: true,
    sessionsThisMonth: 0,
    oracleReadingsThisMonth: 0,
    totalTokensThisMonth: 0,
    estimatedCostThisMonth: 0,
  };
}

/**
 * Update user tier preferences
 */
export async function updateUserTierPreferences(
  userId: string,
  updates: Partial<UserTierPreferences>
): Promise<void> {
  // TODO: Update Supabase user_tier_preferences table
  console.log(`[TIER] Updated preferences for ${userId}:`, updates);
}

/**
 * Track session usage
 */
export async function trackSessionUsage(
  userId: string,
  tier: RevivalTier,
  isOracle: boolean,
  tokensUsed: number,
  estimatedCost: number
): Promise<void> {
  // TODO: Update usage tracking in Supabase
  console.log(`[TIER] Session tracked:`, {
    userId,
    tier,
    isOracle,
    tokensUsed,
    estimatedCost,
  });
}

// ================================================================
// TIER UPGRADE SUGGESTIONS
// ================================================================

export interface UpgradeSuggestion {
  shouldSuggest: boolean;
  currentTier: SubscriptionTier;
  suggestedTier: SubscriptionTier;
  reason: string;
  benefits: string[];
}

/**
 * Determine if we should suggest a tier upgrade
 */
export function getUpgradeSuggestion(
  userPreferences: UserTierPreferences,
  deniedFeature?: 'oracle' | 'deep' | 'complete'
): UpgradeSuggestion {
  const current = userPreferences.subscriptionTier;

  // Free → Explorer (if they want oracle or hit limits)
  if (current === 'free') {
    if (deniedFeature === 'oracle' || userPreferences.sessionsThisMonth >= 8) {
      return {
        shouldSuggest: true,
        currentTier: 'free',
        suggestedTier: 'explorer',
        reason: deniedFeature === 'oracle'
          ? 'Oracle readings require Explorer tier or higher'
          : 'You\'re close to your free tier limit',
        benefits: [
          '50 sessions per month (vs 10)',
          '2 oracle readings per month',
          'Access to Deep wisdom (Jung, Hillman)',
        ],
      };
    }
  }

  // Explorer → Seeker (if they want more oracles or Complete tier)
  if (current === 'explorer') {
    if (deniedFeature === 'complete' || userPreferences.oracleReadingsThisMonth >= 2) {
      return {
        shouldSuggest: true,
        currentTier: 'explorer',
        suggestedTier: 'seeker',
        reason: deniedFeature === 'complete'
          ? 'Complete wisdom access (50 books) requires Seeker tier'
          : 'You\'ve used your oracle reading limit',
        benefits: [
          '200 sessions per month',
          '10 oracle readings per month',
          'Complete tier access for oracle readings (50 wisdom texts)',
        ],
      };
    }
  }

  // Seeker → Oracle (if they're power users)
  if (current === 'seeker') {
    if (userPreferences.sessionsThisMonth > 150 || userPreferences.oracleReadingsThisMonth > 8) {
      return {
        shouldSuggest: true,
        currentTier: 'seeker',
        suggestedTier: 'oracle',
        reason: 'You\'re a dedicated practitioner - unlimited access available',
        benefits: [
          'Unlimited sessions',
          'Unlimited oracle readings',
          'Priority support',
          'Early access to new features',
        ],
      };
    }
  }

  return {
    shouldSuggest: false,
    currentTier: current,
    suggestedTier: current,
    reason: '',
    benefits: [],
  };
}
