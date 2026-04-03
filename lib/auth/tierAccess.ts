/**
 * Tier Access Gating
 *
 * Principle-based access control for MAIA tiers.
 * See /docs/canon/MAIA_SANCTUARY_ECONOMY.md for governing doctrine.
 *
 * Core principle: Free users may experience limits of scale,
 * but never limits of being known.
 *
 * Tiers:
 * - free: Sanctuary — full MAIA, real continuity, capacity-bounded
 * - personal: Sustaining — expanded capacity, supports the sanctuary
 * - pro: Stewardship — practitioner tools, work for others
 *
 * What is NEVER gated by tier:
 * - Memory / continuity (MAIA remembers you)
 * - Pattern recognition
 * - Depth of insight
 * - Relational quality
 *
 * What CAN differ by tier:
 * - Conversation volume (capacity)
 * - Voice minutes (capacity)
 * - Archive fidelity (Band 3 memory)
 * - Practitioner infrastructure (pro only)
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
 * Has Continuity Access — TRUE FOR ALL AUTHENTICATED USERS
 *
 * Sanctuary Economy doctrine (docs/canon/MAIA_SANCTUARY_ECONOMY.md):
 * Memory and continuity are never gated by payment.
 * "Free users may experience limits of scale, but never limits of being known."
 *
 * This covers:
 * - Memory persistence across sessions (Band 1 + 2)
 * - Pattern recognition over time
 * - Relational memory
 * - Developmental tracking
 *
 * Previously gated to Personal+ — now universal for all authenticated members.
 */
export function hasContinuityAccess(member: TierInfo | null): boolean {
  if (!member) return false;
  // Sanctuary principle: everyone who is here gets continuity
  return true;
}

/**
 * Has Expanded Capacity (Personal+)
 *
 * Higher usage limits, not deeper access:
 * - More conversations per day
 * - More voice minutes
 * - Higher processing allowance
 * - Full archive fidelity (Band 3 memory)
 *
 * Free users still get real MAIA — just with capacity boundaries.
 */
export function hasExpandedCapacity(member: TierInfo | null): boolean {
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
//
// Sanctuary Economy split:
// - DEPTH features → universal (hasContinuityAccess, always true)
// - CAPACITY features → expandable (hasExpandedCapacity, Personal+)
// - PRACTITIONER features → professional (hasStewardshipAccess, Pro)
//

// --- Depth features (universal, all authenticated users) ---

/**
 * Pattern synthesis (journal + oracle + astrology cross-reference)
 * This is depth, not capacity — everyone gets pattern recognition.
 */
export function canAccessPatternSynthesis(member: TierInfo | null): boolean {
  return hasContinuityAccess(member);
}

/**
 * Full astrology (transits, returns, life cycles)
 * Depth feature — everyone gets the full astrological picture.
 */
export function canAccessFullAstrology(member: TierInfo | null): boolean {
  return hasContinuityAccess(member);
}

/**
 * Dream journal with symbol tracking
 * Depth feature — dreams are part of being known.
 */
export function canAccessDreamJournal(member: TierInfo | null): boolean {
  return hasContinuityAccess(member);
}

/**
 * Elder Council (choose your guide)
 * Depth feature — access to wisdom is not gated.
 */
export function canAccessElderCouncil(member: TierInfo | null): boolean {
  return hasContinuityAccess(member);
}

/**
 * Synastry (relationship charts)
 * Depth feature — own relationships (client synastry is Pro).
 */
export function canAccessSynastry(member: TierInfo | null): boolean {
  return hasContinuityAccess(member);
}

/**
 * Data export for personal use
 * Depth feature — your data is yours, always.
 */
export function canExportPersonalData(member: TierInfo | null): boolean {
  return hasContinuityAccess(member);
}

// --- Capacity features (expanded at Personal+) ---

/**
 * Expanded conversation volume
 * Free users get real conversations — just bounded.
 * Personal+ expands the envelope.
 */
export function hasUnlimitedConversations(member: TierInfo | null): boolean {
  return hasExpandedCapacity(member);
}

/**
 * Expanded oracle readings
 * Free users get oracle access — just bounded.
 * Personal+ removes the cap.
 */
export function hasUnlimitedOracle(member: TierInfo | null): boolean {
  return hasExpandedCapacity(member);
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
// Expansion Moments (not "upgrade prompts")
// ============================================
//
// These detect when a user is approaching capacity boundaries.
// The framing is NEVER "you hit a limit" but rather
// "you can expand what MAIA holds."
//
// See: docs/canon/MAIA_SANCTUARY_ECONOMY.md
//

/**
 * Check if user is at an expansion moment for Personal support
 *
 * This is NOT about blocking — it's about noticing when
 * someone's use pattern suggests they'd benefit from
 * expanded capacity.
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

  const { conversationsToday = 0, oracleReadingsThisWeek = 0 } = context;

  // Approaching daily conversation capacity
  if (conversationsToday >= 8) return true;

  // Frequent oracle use suggests deeper engagement
  if (oracleReadingsThisWeek >= 5) return true;

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
    case 'free': return 'Sanctuary';
    case 'personal': return 'Sustaining';
    case 'pro': return 'Stewardship';
    default: return 'Sanctuary';
  }
}

export function getTierDescription(tier: MemberTier): string {
  switch (tier) {
    case 'free': return 'Full MAIA, real continuity';
    case 'personal': return 'Expanded capacity, sustains the sanctuary';
    case 'pro': return 'Practitioner tools, hold space for others';
    default: return 'Full MAIA, real continuity';
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
