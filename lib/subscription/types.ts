/**
 * Sustaining Circle Membership Model
 *
 * Philosophy: Consciousness shouldn't be paywalled.
 * Everyone gets full access. Contribution sustains the mission.
 *
 * Recognition Circles (based on generosity, not restrictions):
 * - Explorer: Community member (no contribution yet)
 * - Sustainer: Monthly sustaining contributor
 * - Guardian: Generous monthly supporter
 * - Elder: Wisdom keeper, highest contribution
 * - Founder: Pioneer Circle - lifetime founding member
 * - Seva: Contributing through service/exchange
 */

// Recognition circles - everyone gets full access, these are gratitude tiers
export type ContributionCircle = 'explorer' | 'sustainer' | 'guardian' | 'elder' | 'founder' | 'seva';

// Legacy type alias for backward compatibility
export type UserTier = ContributionCircle;

export type MembershipStatus = 'active' | 'paused' | 'founding' | 'seva' | 'explorer';

// Suggested contribution levels (pay what feels right)
export const CONTRIBUTION_SUGGESTIONS = {
  sustainer: {
    suggested: 9,
    min: 1,
    name: 'Sustainer',
    description: 'Help keep the sacred fire burning',
    icon: '🕯️'
  },
  guardian: {
    suggested: 22,
    min: 15,
    name: 'Guardian',
    description: 'Steward of the community space',
    icon: '🛡️'
  },
  elder: {
    suggested: 44,
    min: 33,
    name: 'Elder',
    description: 'Wisdom keeper, sustaining the whole',
    icon: '🌳'
  },
  founder: {
    oneTime: 222,
    name: 'Founding Pioneer',
    description: 'Lifetime founding member of the circle',
    icon: '⭐'
  }
} as const;

// Seva (service exchange) pathways
export const SEVA_PATHWAYS = {
  content: { name: 'Content Weaver', description: 'Contribute writings, reflections, wisdom' },
  moderation: { name: 'Circle Keeper', description: 'Help maintain sacred community space' },
  translation: { name: 'Bridge Builder', description: 'Translate for other languages/cultures' },
  mentorship: { name: 'Guide', description: 'Support newer members on their journey' },
  technical: { name: 'Builder', description: 'Contribute code, design, or technical skills' },
  outreach: { name: 'Messenger', description: 'Share the work with aligned communities' }
} as const;

export type SevaPathway = keyof typeof SEVA_PATHWAYS;

// Membership info - replaces old subscription model
export interface MembershipInfo {
  status: MembershipStatus;
  circle: ContributionCircle;
  contributionAmount?: number;  // Monthly contribution (if sustaining)
  lifetimeContribution?: number; // Total given over time
  sevaPathway?: SevaPathway;     // If contributing through service
  joinedAt?: Date;
  founderNumber?: number;        // Pioneer Circle founding number (1-222)
}

// Legacy interface for backward compatibility
export interface SubscriptionInfo {
  status: MembershipStatus;
  tier: UserTier;
  expiresAt?: Date;
  trialEndsAt?: Date;
  features: string[];
  planId?: string;
  customerId?: string;
}

export interface User {
  id: string;
  name: string;
  email?: string;
  subscription: SubscriptionInfo;  // Legacy
  membership?: MembershipInfo;      // New model
  createdAt: Date;
  lastActive: Date;
}

// All features - EVERYONE gets full access (consciousness shouldn't be paywalled)
export const ALL_FEATURES = {
  LAB_TOOLS: 'lab_tools',
  COMMUNITY_COMMONS: 'community_commons',
  VOICE_SYNTHESIS: 'voice_synthesis',
  BRAIN_TRUST: 'brain_trust',
  ADVANCED_ORACLE: 'advanced_oracle',
  FIELD_PROTOCOL: 'field_protocol',
  SCRIBE_MODE: 'scribe_mode',
  BIRTH_CHART: 'birth_chart',
  ELDER_COUNCIL: 'elder_council'
} as const;

// Legacy export for backward compatibility
export const PREMIUM_FEATURES = ALL_FEATURES;
export type PremiumFeature = typeof ALL_FEATURES[keyof typeof ALL_FEATURES];

// Everyone gets all features - no gating!
const ALL_FEATURES_LIST: PremiumFeature[] = Object.values(ALL_FEATURES);

export const TIER_FEATURES: Record<UserTier, PremiumFeature[]> = {
  explorer: ALL_FEATURES_LIST,
  sustainer: ALL_FEATURES_LIST,
  guardian: ALL_FEATURES_LIST,
  elder: ALL_FEATURES_LIST,
  founder: ALL_FEATURES_LIST,
  seva: ALL_FEATURES_LIST
};

// Circle descriptions for UI
export const CIRCLE_DESCRIPTIONS: Record<ContributionCircle, string> = {
  explorer: 'Welcome to the journey - full access to all tools',
  sustainer: 'Sustaining the sacred fire with monthly contribution',
  guardian: 'Generous steward of the community space',
  elder: 'Wisdom keeper, deeply sustaining the whole',
  founder: 'Pioneer Circle - lifetime founding member',
  seva: 'Contributing through sacred service'
};

// Legacy export
export const TIER_DESCRIPTIONS = CIRCLE_DESCRIPTIONS;

// Feature display names for UI
export const FEATURE_NAMES: Record<PremiumFeature, string> = {
  [PREMIUM_FEATURES.LAB_TOOLS]: 'Lab Tools',
  [PREMIUM_FEATURES.COMMUNITY_COMMONS]: 'Community Commons',
  [PREMIUM_FEATURES.VOICE_SYNTHESIS]: 'Voice Synthesis',
  [PREMIUM_FEATURES.BRAIN_TRUST]: 'Brain Trust',
  [PREMIUM_FEATURES.ADVANCED_ORACLE]: 'Advanced Oracle',
  [PREMIUM_FEATURES.FIELD_PROTOCOL]: 'Field Protocol',
  [PREMIUM_FEATURES.SCRIBE_MODE]: 'Scribe Mode',
  [PREMIUM_FEATURES.BIRTH_CHART]: 'Cosmic Blueprint',
  [PREMIUM_FEATURES.ELDER_COUNCIL]: 'Elder Council'
};