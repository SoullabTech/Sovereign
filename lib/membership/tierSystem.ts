// @ts-nocheck
// Membership Tier System
// Foundation / Explorer / Pioneer
//
// Controls access to:
// - Neuropod protocol tiers
// - Community Commons
// - Pioneer Circle features
// - Early beta access

export type MembershipTier = 'foundation' | 'explorer' | 'pioneer';

export interface MembershipStatus {
  userId: string;
  tier: MembershipTier;
  subscriptionActive: boolean;
  subscriptionExpiresAt: Date | null;
  paymentMethod: 'stripe' | 'paypal' | 'manual' | 'lifetime' | null;

  // Access flags
  tier1Access: boolean; // All tiers
  tier2Access: boolean; // Explorer+
  tier3Access: boolean; // Pioneer only (future)

  // Pioneer-specific features
  pioneerEarlyBetaAccess: boolean;
  pioneerResearchPriority: boolean;
  pioneerFindResonanceBeta: boolean;

  // Tier history
  tierHistory: TierHistoryEntry[];

  createdAt: Date;
  updatedAt: Date;
}

export interface TierHistoryEntry {
  tier: MembershipTier;
  startedAt: Date;
  endedAt: Date | null;
  reason?: string; // 'upgrade', 'downgrade', 'initial', 'expired'
}

// Tier feature matrix
export const TIER_FEATURES = {
  foundation: {
    name: 'Foundation',
    monthlyPrice: 0, // Free
    annualPrice: 0,
    features: [
      'Basic MAIA conversations',
      'Tier 1 Neuropod protocols (grounding, sleep prep, stress reduction)',
      'Community presence (read-only)',
      'Basic consciousness tracking',
    ],
    neuropodAccess: {
      tier1: true,
      tier2: false,
      tier3: false,
      protocolCount: 6,
    },
    commonsAccess: false,
    maxSessionsPerMonth: 30,
  },

  explorer: {
    name: 'Explorer',
    monthlyPrice: 29,
    annualPrice: 290, // 2 months free
    features: [
      'All Foundation features',
      'Tier 2 Neuropod protocols (ASSR entrainment, somatic exploration)',
      'Community Commons posting (with Bloom 4+ gate)',
      'Advanced consciousness analytics',
      'Wisdom synthesis',
      'Archetypal session templates',
    ],
    neuropodAccess: {
      tier1: true,
      tier2: true,
      tier3: false,
      protocolCount: 13, // 6 Tier 1 + 7 Tier 2
    },
    commonsAccess: true, // Still gated by Bloom 4+
    maxSessionsPerMonth: 100,
  },

  pioneer: {
    name: 'Pioneer',
    monthlyPrice: 79,
    annualPrice: 790, // 2 months free
    features: [
      'All Explorer features',
      'Early beta access to new protocols',
      'Research participation priority',
      '"Find Your Resonance" personalized protocol tuning',
      'Direct feedback to development team',
      'Monthly Pioneer Circle calls',
      'Lifetime price lock guarantee',
    ],
    neuropodAccess: {
      tier1: true,
      tier2: true,
      tier3: false, // Tier 3 not offered yet (experimental)
      protocolCount: 13,
    },
    commonsAccess: true,
    maxSessionsPerMonth: -1, // Unlimited
    pioneerFeatures: {
      earlyBetaAccess: true,
      researchPriority: true,
      findResonanceBeta: true,
      monthlyCall: true,
      lifetimePriceLock: true,
    },
  },
};

/**
 * Get user's membership status from database
 */
export async function getMembershipStatus(userId: string): Promise<MembershipStatus | null> {
  // TODO: Implement database query
  // SELECT * FROM user_membership WHERE user_id = $1

  // Placeholder implementation
  return {
    userId,
    tier: 'foundation',
    subscriptionActive: true,
    subscriptionExpiresAt: null,
    paymentMethod: null,
    tier1Access: true,
    tier2Access: false,
    tier3Access: false,
    pioneerEarlyBetaAccess: false,
    pioneerResearchPriority: false,
    pioneerFindResonanceBeta: false,
    tierHistory: [
      {
        tier: 'foundation',
        startedAt: new Date(),
        endedAt: null,
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Check if user has access to a specific feature
 */
export function hasFeatureAccess(
  membership: MembershipStatus,
  feature:
    | 'tier1-protocols'
    | 'tier2-protocols'
    | 'tier3-protocols'
    | 'commons-posting'
    | 'pioneer-beta'
    | 'find-resonance'
): boolean {
  // Subscription must be active (except for free tier)
  if (membership.tier !== 'foundation' && !membership.subscriptionActive) {
    return false;
  }

  switch (feature) {
    case 'tier1-protocols':
      return membership.tier1Access;
    case 'tier2-protocols':
      return membership.tier2Access;
    case 'tier3-protocols':
      return membership.tier3Access;
    case 'commons-posting':
      return membership.tier === 'explorer' || membership.tier === 'pioneer';
    case 'pioneer-beta':
      return membership.pioneerEarlyBetaAccess;
    case 'find-resonance':
      return membership.pioneerFindResonanceBeta;
    default:
      return false;
  }
}

/**
 * Upgrade user's membership tier
 */
export async function upgradeMembership(
  userId: string,
  newTier: MembershipTier,
  paymentMethod: 'stripe' | 'paypal' | 'manual',
  subscriptionExpiresAt: Date
): Promise<MembershipStatus> {
  // TODO: Implement database update
  // UPDATE user_membership SET
  //   tier = $2,
  //   subscription_active = true,
  //   subscription_expires_at = $3,
  //   subscription_payment_method = $4,
  //   tier_history = tier_history || jsonb_build_object(...),
  //   updated_at = NOW()
  // WHERE user_id = $1

  // Update tier access flags
  const tier2Access = newTier === 'explorer' || newTier === 'pioneer';
  const tier3Access = newTier === 'pioneer'; // Future

  const pioneerFeatures = TIER_FEATURES[newTier].pioneerFeatures || {
    earlyBetaAccess: false,
    researchPriority: false,
    findResonanceBeta: false,
    monthlyCall: false,
    lifetimePriceLock: false,
  };

  // Placeholder return
  return {
    userId,
    tier: newTier,
    subscriptionActive: true,
    subscriptionExpiresAt,
    paymentMethod,
    tier1Access: true,
    tier2Access,
    tier3Access,
    pioneerEarlyBetaAccess: pioneerFeatures.earlyBetaAccess,
    pioneerResearchPriority: pioneerFeatures.researchPriority,
    pioneerFindResonanceBeta: pioneerFeatures.findResonanceBeta,
    tierHistory: [
      {
        tier: 'foundation',
        startedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        endedAt: new Date(),
        reason: 'upgrade',
      },
      {
        tier: newTier,
        startedAt: new Date(),
        endedAt: null,
      },
    ],
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
  };
}

/**
 * Downgrade user's membership tier (e.g., subscription expired)
 */
export async function downgradeToFoundation(
  userId: string,
  reason: 'expired' | 'cancelled' | 'payment-failed'
): Promise<MembershipStatus> {
  // TODO: Implement database update
  // UPDATE user_membership SET
  //   tier = 'foundation',
  //   subscription_active = false,
  //   tier_history = tier_history || jsonb_build_object(...),
  //   updated_at = NOW()
  // WHERE user_id = $1

  return {
    userId,
    tier: 'foundation',
    subscriptionActive: false,
    subscriptionExpiresAt: null,
    paymentMethod: null,
    tier1Access: true,
    tier2Access: false,
    tier3Access: false,
    pioneerEarlyBetaAccess: false,
    pioneerResearchPriority: false,
    pioneerFindResonanceBeta: false,
    tierHistory: [
      {
        tier: 'foundation',
        startedAt: new Date(),
        endedAt: null,
        reason,
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Get tier pricing for display
 */
export function getTierPricing(tier: MembershipTier, billingCycle: 'monthly' | 'annual') {
  const features = TIER_FEATURES[tier];
  const price = billingCycle === 'monthly' ? features.monthlyPrice : features.annualPrice;

  const monthlySavings =
    billingCycle === 'annual' ? features.monthlyPrice * 12 - features.annualPrice : 0;

  return {
    tier,
    tierName: features.name,
    billingCycle,
    price,
    monthlySavings,
    pricePerMonth: billingCycle === 'annual' ? features.annualPrice / 12 : price,
    features: features.features,
    neuropodAccess: features.neuropodAccess,
  };
}

/**
 * Mythic messaging for tier upgrade prompts
 */
export function getTierUpgradeMessage(currentTier: MembershipTier, targetTier: MembershipTier): string {
  if (currentTier === 'foundation' && targetTier === 'explorer') {
    return `The Explorer tier opens access to deeper protocols: ASSR entrainment, somatic unwinding, and archetypal session templates. Your nervous system is ready for this depth work.`;
  }

  if (currentTier === 'explorer' && targetTier === 'pioneer') {
    return `The Pioneer Circle is for those committed to co-creating consciousness computing. You'll get early access to experimental protocols, personalized resonance tuning, and direct input into our research roadmap.`;
  }

  if (currentTier === 'foundation' && targetTier === 'pioneer') {
    return `The Pioneer tier includes everything in Explorer plus early beta access, research priority, and monthly calls with the development team. Consider starting with Explorer to build your practice first.`;
  }

  return `Upgrade to ${targetTier} to unlock additional features and protocols.`;
}

/**
 * Check if subscription is expiring soon
 */
export function isSubscriptionExpiringSoon(membership: MembershipStatus, daysThreshold: number = 7): boolean {
  if (!membership.subscriptionExpiresAt) return false;

  const daysUntilExpiration =
    (membership.subscriptionExpiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24);

  return daysUntilExpiration > 0 && daysUntilExpiration <= daysThreshold;
}

/**
 * Get membership dashboard summary
 */
export function getMembershipDashboard(membership: MembershipStatus) {
  const features = TIER_FEATURES[membership.tier];

  return {
    tier: membership.tier,
    tierName: features.name,
    subscriptionActive: membership.subscriptionActive,
    expiresAt: membership.subscriptionExpiresAt,
    expiringSoon: isSubscriptionExpiringSoon(membership),

    neuropodAccess: {
      tier1: membership.tier1Access,
      tier2: membership.tier2Access,
      tier3: membership.tier3Access,
      protocolCount: features.neuropodAccess.protocolCount,
    },

    commonsAccess: features.commonsAccess,
    maxSessionsPerMonth: features.maxSessionsPerMonth,

    pioneerFeatures: membership.tier === 'pioneer' ? {
      earlyBetaAccess: membership.pioneerEarlyBetaAccess,
      researchPriority: membership.pioneerResearchPriority,
      findResonanceBeta: membership.pioneerFindResonanceBeta,
    } : null,

    upgradeOptions: getUpgradeOptions(membership.tier),
  };
}

/**
 * Get available upgrade options
 */
function getUpgradeOptions(currentTier: MembershipTier): MembershipTier[] {
  if (currentTier === 'foundation') {
    return ['explorer', 'pioneer'];
  }
  if (currentTier === 'explorer') {
    return ['pioneer'];
  }
  return []; // Pioneer is top tier
}
