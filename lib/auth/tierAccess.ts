/**
 * Tier Access Gating
 *
 * Principle-based access control for MAIA tiers.
 * See /docs/TIER_STRUCTURE.md for full definitions.
 *
 * Tiers:
 * - free: Touch — episodic encounters, basic tools
 * - personal: Continuity — MAIA remembers, patterns emerge
 * - pro: Stewardship — work for others, creation tools
 */

export type MemberTier = 'free' | 'personal' | 'pro';

export interface TierInfo {
  tier: MemberTier;
  tier_started_at?: Date | string;
}

/**
 * LimitsEnforcer tier vocabulary (billing/enforcement layer).
 * Maps to MemberTier for access checks.
 */
export type LimitsTier = 'free' | 'member_plus' | 'studio_pro';

/**
 * Convert LimitsEnforcer tier to access-tier vocabulary.
 * Centralizes the mapping so routes don't diverge.
 */
export function toMemberTier(limitsTier: LimitsTier | string | null | undefined): MemberTier {
  if (!limitsTier) return 'free';
  if (limitsTier === 'studio_pro') return 'pro';
  if (limitsTier === 'member_plus') return 'personal';
  // If already in MemberTier vocabulary, pass through
  if (limitsTier === 'personal' || limitsTier === 'pro' || limitsTier === 'free') {
    return limitsTier as MemberTier;
  }
  return 'free';
}

/**
 * Ergonomic wrapper: check continuity access from tier string directly.
 * Delegates to hasContinuityAccess for policy.
 */
export function hasContinuityTier(tier: MemberTier | null | undefined): boolean {
  return hasContinuityAccess(tier ? { tier } : null);
}

// ============================================
// Core Access Checks (principle-based)
// ============================================

/**
 * Has Continuity Access (Personal+)
 *
 * Required for:
 * - Time-based synthesis
 * - Pattern recognition across sessions
 * - Unlimited AI-intensive features
 * - Personal data export
 */
export function hasContinuityAccess(member: TierInfo | null): boolean {
  if (!member) return false;
  return member.tier === 'personal' || member.tier === 'pro';
}

/**
 * Has Stewardship Access (Pro only)
 *
 * Required for:
 * - Other people's data or consciousness
 * - Export for public/commercial use
 * - Clinical or practitioner tools
 * - Multi-model orchestration
 * - Collective field analysis
 * - Biometric integration
 */
export function hasStewardshipAccess(member: TierInfo | null): boolean {
  if (!member) return false;
  return member.tier === 'pro';
}

// ============================================
// Feature-Specific Checks
// ============================================

/**
 * Pattern synthesis (journal + oracle + astrology cross-reference)
 */
export function canAccessPatternSynthesis(member: TierInfo | null): boolean {
  return hasContinuityAccess(member);
}

/**
 * Unlimited MAIA conversations
 */
export function hasUnlimitedConversations(member: TierInfo | null): boolean {
  return hasContinuityAccess(member);
}

/**
 * Full astrology (transits, returns, life cycles)
 */
export function canAccessFullAstrology(member: TierInfo | null): boolean {
  return hasContinuityAccess(member);
}

/**
 * Unlimited oracle readings
 */
export function hasUnlimitedOracle(member: TierInfo | null): boolean {
  return hasContinuityAccess(member);
}

/**
 * Dream journal with symbol tracking
 */
export function canAccessDreamJournal(member: TierInfo | null): boolean {
  return hasContinuityAccess(member);
}

/**
 * Elder Council (choose your guide)
 */
export function canAccessElderCouncil(member: TierInfo | null): boolean {
  return hasContinuityAccess(member);
}

/**
 * Synastry (relationship charts)
 * Personal: own relationships
 * Pro: client relationships
 */
export function canAccessSynastry(member: TierInfo | null): boolean {
  return hasContinuityAccess(member);
}

/**
 * Data export for personal use
 */
export function canExportPersonalData(member: TierInfo | null): boolean {
  return hasContinuityAccess(member);
}

// ============================================
// Pro-Only Features
// ============================================

/**
 * Export for others (Descript, Patreon, etc.)
 */
export function canExportForOthers(member: TierInfo | null): boolean {
  return hasStewardshipAccess(member);
}

/**
 * Scribe Pro (transcription, session capture)
 */
export function canAccessScribePro(member: TierInfo | null): boolean {
  return hasStewardshipAccess(member);
}

/**
 * Brain Trust (multi-model)
 */
export function canAccessBrainTrust(member: TierInfo | null): boolean {
  return hasStewardshipAccess(member);
}

/**
 * Guardian Console (biometric monitoring)
 */
export function canAccessGuardianConsole(member: TierInfo | null): boolean {
  return hasStewardshipAccess(member);
}

/**
 * Field Analytics (collective patterns)
 */
export function canAccessFieldAnalytics(member: TierInfo | null): boolean {
  return hasStewardshipAccess(member);
}

/**
 * IPP (clinical tools)
 */
export function canAccessIPP(member: TierInfo | null): boolean {
  return hasStewardshipAccess(member);
}

/**
 * Library of Alexandria (full corpus)
 */
export function canAccessFullLibrary(member: TierInfo | null): boolean {
  return hasStewardshipAccess(member);
}

/**
 * Advanced synastry (client relationships)
 */
export function canAccessClientSynastry(member: TierInfo | null): boolean {
  return hasStewardshipAccess(member);
}

// ============================================
// Threshold Detection (for upgrade prompts)
// ============================================

/**
 * Check if user is at a threshold moment for Personal upgrade
 */
export function isAtPersonalThreshold(
  member: TierInfo | null,
  context: {
    conversationsToday?: number;
    oracleReadingsThisWeek?: number;
    journalEntriesTotal?: number;
    hasPatternToShow?: boolean;
  }
): boolean {
  if (!member || member.tier !== 'free') return false;

  // Soft limits that suggest threshold
  const { conversationsToday = 0, oracleReadingsThisWeek = 0, journalEntriesTotal = 0, hasPatternToShow = false } = context;

  // Third oracle reading in a week
  if (oracleReadingsThisWeek >= 3) return true;

  // Pattern detected but can't show it
  if (hasPatternToShow && journalEntriesTotal >= 3) return true;

  // Several conversations in one day
  if (conversationsToday >= 5) return true;

  return false;
}

/**
 * Check if user is at a threshold moment for Pro upgrade
 */
export function isAtProThreshold(
  member: TierInfo | null,
  context: {
    tryingToAddSecondPerson?: boolean;
    tryingToExport?: boolean;
    accessingGuardianConsole?: boolean;
    accessingClinicalTools?: boolean;
  }
): boolean {
  if (!member || member.tier !== 'personal') return false;

  const { tryingToAddSecondPerson, tryingToExport, accessingGuardianConsole, accessingClinicalTools } = context;

  return !!(tryingToAddSecondPerson || tryingToExport || accessingGuardianConsole || accessingClinicalTools);
}

// ============================================
// Tier Display Helpers
// ============================================

export function getTierDisplayName(tier: MemberTier): string {
  switch (tier) {
    case 'free': return 'Free';
    case 'personal': return 'Personal';
    case 'pro': return 'Pro';
    default: return 'Free';
  }
}

export function getTierDescription(tier: MemberTier): string {
  switch (tier) {
    case 'free': return 'Explore MAIA';
    case 'personal': return 'MAIA remembers the thread';
    case 'pro': return 'Hold space for others';
    default: return 'Explore MAIA';
  }
}

/**
 * Get Pro-tier extended information
 *
 * For Pro members only: surfaces awareness of Helper Infrastructure
 * without being promotional. This is a relational offering, not a product.
 */
export function getProExtendedInfo(): {
  helperInfrastructure: {
    available: boolean;
    hint: string;
    learnMore: string;
  };
} {
  return {
    helperInfrastructure: {
      available: true,
      hint: 'Supporting others? Ethical infrastructure may be available.',
      learnMore: 'See docs/TIER_STRUCTURE.md for Helper Infrastructure & Worldcraft',
    },
  };
}

export function getTierPrice(tier: MemberTier): number {
  switch (tier) {
    case 'free': return 0;
    case 'personal': return 9;
    case 'pro': return 35;
    default: return 0;
  }
}
