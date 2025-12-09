/**
 * Subscription and User Tier Types
 */

export type UserTier = 'free' | 'subscriber' | 'premium';

export type SubscriptionStatus = 'active' | 'expired' | 'trial' | 'none' | 'cancelled';

export interface SubscriptionInfo {
  status: SubscriptionStatus;
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
  subscription: SubscriptionInfo;
  createdAt: Date;
  lastActive: Date;
}

// Premium features that require subscription
export const PREMIUM_FEATURES = {
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

export type PremiumFeature = typeof PREMIUM_FEATURES[keyof typeof PREMIUM_FEATURES];

// Feature access by tier
export const TIER_FEATURES: Record<UserTier, PremiumFeature[]> = {
  free: [],
  subscriber: [
    PREMIUM_FEATURES.LAB_TOOLS,
    PREMIUM_FEATURES.COMMUNITY_COMMONS,
    PREMIUM_FEATURES.VOICE_SYNTHESIS,
    PREMIUM_FEATURES.BRAIN_TRUST
  ],
  premium: [
    PREMIUM_FEATURES.LAB_TOOLS,
    PREMIUM_FEATURES.COMMUNITY_COMMONS,
    PREMIUM_FEATURES.VOICE_SYNTHESIS,
    PREMIUM_FEATURES.BRAIN_TRUST,
    PREMIUM_FEATURES.ADVANCED_ORACLE,
    PREMIUM_FEATURES.FIELD_PROTOCOL,
    PREMIUM_FEATURES.SCRIBE_MODE,
    PREMIUM_FEATURES.BIRTH_CHART,
    PREMIUM_FEATURES.ELDER_COUNCIL
  ]
};

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