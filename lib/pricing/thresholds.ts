/**
 * Upgrade Threshold Detection
 *
 * Philosophy:
 * - Limits modulate intensity, not belonging
 * - Adults choose. We don't chase.
 * - Prompts are invitations, not pressure
 *
 * Threshold Triggers:
 * - Usage-based: "Your practice is growing"
 * - Value-based: "You've been here X months"
 * - Feature-based: "This feature is part of Studio"
 */

// ============================================
// Types
// ============================================

export type PractitionerTier = 'earn' | 'studio' | null;
export type MemberSupportLevel = 'free' | 'supporter';

export interface ThresholdContext {
  // Practitioner metrics
  sessionsThisMonth?: number;
  activeClients?: number;
  monthsActive?: number;
  revenueThisMonth?: number;

  // Member metrics
  journalEntriesThisMonth?: number;
  conversationsThisMonth?: number;
  daysActive?: number;

  // Feature access attempts
  attemptedFeature?: string;
}

export interface ThresholdResult {
  shouldPrompt: boolean;
  promptType: PromptType;
  trigger: string;
  message: string;
  softLimit?: boolean; // If true, feature still works but prompt shown
}

export type PromptType =
  | 'supporter'           // Free member → Supporter
  | 'earn_to_studio'      // Earn → Studio
  | 'annual_checkin'      // Yearly reflection
  | 'feature_gate'        // Accessing gated feature
  | 'threshold'           // Usage-based threshold
  | 'helper_fund';        // Suggest Helper Fund

// ============================================
// Threshold Definitions
// ============================================

/**
 * Practitioner upgrade thresholds (Earn → Studio)
 */
export const PRACTITIONER_THRESHOLDS = {
  // Session-based
  SESSIONS_PER_MONTH: {
    soft: 10,   // Show subtle prompt
    medium: 20, // Show stronger prompt
    high: 50,   // Show compelling prompt
  },

  // Client-based
  ACTIVE_CLIENTS: {
    soft: 10,
    medium: 20,
    high: 50,
  },

  // Time-based
  MONTHS_ACTIVE: {
    first: 3,   // "You've been here 3 months"
    steady: 6,  // "6 months of practice"
    established: 12, // Annual check-in
  },

  // Revenue-based (when 3% > $35)
  MONTHLY_REVENUE_CENTS: {
    breakeven: 116700, // ~$1,167/mo where 3% ≈ $35
  },
} as const;

/**
 * Member upgrade thresholds (Free → Supporter)
 */
export const MEMBER_THRESHOLDS = {
  // Journal engagement
  JOURNAL_ENTRIES: {
    engaged: 10,  // 10 entries shows real engagement
    active: 30,   // Regular journaler
  },

  // Conversation engagement
  CONVERSATIONS: {
    engaged: 20,
    active: 50,
  },

  // Time-based
  DAYS_ACTIVE: {
    first: 30,   // First month prompt
    engaged: 90, // 3 months
  },
} as const;

/**
 * Cooldown periods (in days)
 */
export const COOLDOWN_DAYS = {
  after_dismiss: 30,      // 30 days after "Not now"
  after_not_interested: 90, // 90 days after "Not interested"
  after_show: 7,          // Minimum 7 days between any prompts
  feature_gate: 1,        // 1 day between feature gate prompts
} as const;

// ============================================
// Threshold Detection Functions
// ============================================

/**
 * Check if practitioner should see Studio upgrade prompt
 */
export function shouldPromptStudioUpgrade(
  tier: PractitionerTier,
  context: ThresholdContext,
  lastPromptAt?: Date | null,
  lastResponse?: string | null
): ThresholdResult | null {
  // Only for Earn practitioners
  if (tier !== 'earn') return null;

  // Check cooldown
  if (lastPromptAt && isInCooldown(lastPromptAt, lastResponse ?? null)) {
    return null;
  }

  const { sessionsThisMonth = 0, activeClients = 0, monthsActive = 0, revenueThisMonth = 0 } = context;

  // Revenue threshold (most compelling)
  if (revenueThisMonth >= PRACTITIONER_THRESHOLDS.MONTHLY_REVENUE_CENTS.breakeven) {
    return {
      shouldPrompt: true,
      promptType: 'earn_to_studio',
      trigger: 'revenue_breakeven',
      message: 'You\'re earning enough that Studio would save you money.',
      softLimit: false,
    };
  }

  // High session volume
  if (sessionsThisMonth >= PRACTITIONER_THRESHOLDS.SESSIONS_PER_MONTH.high) {
    return {
      shouldPrompt: true,
      promptType: 'threshold',
      trigger: '50_sessions',
      message: 'Your practice is thriving. 50 sessions this month.',
      softLimit: false,
    };
  }

  // Established practice (12 months)
  if (monthsActive >= PRACTITIONER_THRESHOLDS.MONTHS_ACTIVE.established) {
    return {
      shouldPrompt: true,
      promptType: 'annual_checkin',
      trigger: '12_months',
      message: 'A year with Soullab. How would you describe your practice?',
      softLimit: false,
    };
  }

  // Medium session volume
  if (sessionsThisMonth >= PRACTITIONER_THRESHOLDS.SESSIONS_PER_MONTH.medium) {
    return {
      shouldPrompt: true,
      promptType: 'threshold',
      trigger: '20_sessions',
      message: 'Your practice is growing. 20 sessions this month.',
      softLimit: true,
    };
  }

  // Many active clients
  if (activeClients >= PRACTITIONER_THRESHOLDS.ACTIVE_CLIENTS.medium) {
    return {
      shouldPrompt: true,
      promptType: 'threshold',
      trigger: '20_clients',
      message: 'You\'re supporting 20 active clients.',
      softLimit: true,
    };
  }

  // 6 months active
  if (monthsActive >= PRACTITIONER_THRESHOLDS.MONTHS_ACTIVE.steady && monthsActive < PRACTITIONER_THRESHOLDS.MONTHS_ACTIVE.established) {
    return {
      shouldPrompt: true,
      promptType: 'threshold',
      trigger: '6_months',
      message: 'Six months of practice. Your work is taking root.',
      softLimit: true,
    };
  }

  // Soft session threshold
  if (sessionsThisMonth >= PRACTITIONER_THRESHOLDS.SESSIONS_PER_MONTH.soft) {
    return {
      shouldPrompt: true,
      promptType: 'threshold',
      trigger: '10_sessions',
      message: 'Your practice is growing.',
      softLimit: true,
    };
  }

  return null;
}

/**
 * Check if free member should see Supporter prompt
 */
export function shouldPromptSupporter(
  supporterSince: Date | null,
  context: ThresholdContext,
  lastPromptAt?: Date | null,
  lastResponse?: string | null
): ThresholdResult | null {
  // Already a supporter
  if (supporterSince) return null;

  // Check cooldown
  if (lastPromptAt && isInCooldown(lastPromptAt, lastResponse ?? null)) {
    return null;
  }

  const { journalEntriesThisMonth = 0, conversationsThisMonth = 0, daysActive = 0 } = context;

  // High journal engagement
  if (journalEntriesThisMonth >= MEMBER_THRESHOLDS.JOURNAL_ENTRIES.active) {
    return {
      shouldPrompt: true,
      promptType: 'supporter',
      trigger: '30_journal_entries',
      message: 'You\'ve written 30 journal entries this month. Soullab is clearly valuable to you.',
      softLimit: true,
    };
  }

  // High conversation engagement
  if (conversationsThisMonth >= MEMBER_THRESHOLDS.CONVERSATIONS.active) {
    return {
      shouldPrompt: true,
      promptType: 'supporter',
      trigger: '50_conversations',
      message: 'You\'ve had 50 conversations with MAIA this month.',
      softLimit: true,
    };
  }

  // 90 days active
  if (daysActive >= MEMBER_THRESHOLDS.DAYS_ACTIVE.engaged) {
    return {
      shouldPrompt: true,
      promptType: 'supporter',
      trigger: '90_days',
      message: 'Three months with Soullab. If it\'s been valuable, consider becoming a Supporter.',
      softLimit: true,
    };
  }

  // Moderate engagement
  if (journalEntriesThisMonth >= MEMBER_THRESHOLDS.JOURNAL_ENTRIES.engaged) {
    return {
      shouldPrompt: true,
      promptType: 'supporter',
      trigger: '10_journal_entries',
      message: 'Soullab is free for personal growth. If you\'d like to support the work, Supporters help keep it accessible.',
      softLimit: true,
    };
  }

  // First month, some engagement
  if (daysActive >= MEMBER_THRESHOLDS.DAYS_ACTIVE.first && conversationsThisMonth >= 5) {
    return {
      shouldPrompt: true,
      promptType: 'supporter',
      trigger: '30_days_engaged',
      message: 'You\'ve been exploring for a month. No pressure, but Supporters help us keep growing.',
      softLimit: true,
    };
  }

  return null;
}

/**
 * Check if user is attempting a gated feature
 */
export function checkFeatureGate(
  feature: string,
  practitionerTier: PractitionerTier,
  supporterSince: Date | null
): ThresholdResult | null {
  const STUDIO_FEATURES = [
    'advanced_analytics',
    'custom_branding',
    'priority_support',
    'bulk_email',
    'multiple_calendars',
  ];

  const SUPPORTER_FEATURES = [
    'unlimited_conversations',
    'pattern_synthesis',
    'full_astrology',
    'community_contribute',
  ];

  // Studio-gated features
  if (STUDIO_FEATURES.includes(feature) && practitionerTier !== 'studio') {
    return {
      shouldPrompt: true,
      promptType: 'feature_gate',
      trigger: `feature_${feature}`,
      message: `${formatFeatureName(feature)} is part of Studio.`,
      softLimit: false,
    };
  }

  // Supporter-gated features
  if (SUPPORTER_FEATURES.includes(feature) && !supporterSince) {
    return {
      shouldPrompt: true,
      promptType: 'feature_gate',
      trigger: `feature_${feature}`,
      message: `${formatFeatureName(feature)} is available to Supporters.`,
      softLimit: false,
    };
  }

  return null;
}

// ============================================
// Helper Functions
// ============================================

function isInCooldown(lastPromptAt: Date, lastResponse: string | null): boolean {
  const now = new Date();
  const daysSince = Math.floor((now.getTime() - lastPromptAt.getTime()) / (1000 * 60 * 60 * 24));

  // Minimum cooldown
  if (daysSince < COOLDOWN_DAYS.after_show) {
    return true;
  }

  // Response-based cooldown
  if (lastResponse === 'later' || lastResponse === 'dismissed') {
    return daysSince < COOLDOWN_DAYS.after_dismiss;
  }

  if (lastResponse === 'not_interested') {
    return daysSince < COOLDOWN_DAYS.after_not_interested;
  }

  return false;
}

function formatFeatureName(feature: string): string {
  const names: Record<string, string> = {
    advanced_analytics: 'Advanced Analytics',
    custom_branding: 'Custom Branding',
    priority_support: 'Priority Support',
    bulk_email: 'Bulk Email',
    multiple_calendars: 'Multiple Calendars',
    unlimited_conversations: 'Unlimited MAIA Conversations',
    pattern_synthesis: 'Pattern Synthesis',
    full_astrology: 'Full Astrology Tools',
    community_contribute: 'Community Contributions',
  };
  return names[feature] || feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

// ============================================
// Prompt Messages
// ============================================

export const PROMPT_MESSAGES = {
  // Earn → Studio
  earn_to_studio: {
    headline: 'Your practice is steady.',
    body: 'Studio gives you predictable costs and reduced fees. Your contribution helps keep Soullab accessible for emerging practitioners.',
    cta_primary: 'Switch to Studio',
    cta_secondary: 'Not yet',
    cta_tertiary: 'Learn more',
  },

  // Free → Supporter
  free_to_supporter: {
    headline: 'Soullab is free for personal growth.',
    body: 'If it\'s been valuable, becoming a Supporter ($9/mo) helps us keep building and keeps access open for everyone.',
    cta_primary: 'Become a Supporter',
    cta_secondary: 'Maybe later',
    cta_tertiary: 'Why support?',
  },

  // Annual check-in
  annual_checkin: {
    headline: 'A moment to reflect.',
    body: 'You\'ve been part of Soullab for a year. How would you describe your practice right now?',
    options: [
      { value: 'emerging', label: 'Still emerging — I need support' },
      { value: 'stable', label: 'Stable — I can sustain myself' },
      { value: 'thriving', label: 'Thriving — I\'d like to give back' },
    ],
  },

  // Feature gate
  feature_gate: {
    headline: 'This feature is part of {tier}.',
    body: '{feature_description}',
    cta_primary: 'Upgrade',
    cta_secondary: 'Not now',
  },

  // Helper Fund prompt (for thriving practitioners)
  helper_fund: {
    headline: 'Would you like to give back?',
    body: 'The Helper Fund supports practitioners who are just starting out. Your contribution helps someone build their practice.',
    cta_primary: 'Contribute',
    cta_secondary: 'Not right now',
  },
} as const;
