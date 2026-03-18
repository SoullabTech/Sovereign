/**
 * Cross-Domain Symbolic Governance — Phase 15
 *
 * Governs how astrology, journal, pattern ledger, and field sensing
 * may support or constrain one another when producing synthesized output.
 *
 * THE CORE RISK THIS PREVENTS:
 *   Each domain is safe in isolation. The failure mode appears when combining:
 *     - astrology suggests tension
 *     - journal suggests repetition
 *     - field sensing suggests contraction
 *   ...and the system overstates the synthesis by treating three weak derived
 *   claims as one strong authoritative claim.
 *
 * That is composite overreach. This layer prevents it.
 *
 * RULES ENFORCED HERE:
 *   1. Strictest blocking rule wins — if any contributing domain blocks, synthesis blocks
 *   2. Identity claims remain blocked even if all domains weakly suggest them
 *   3. Authority cannot be upgraded by convergence alone
 *      Two derived claims do not produce one authoritative claim
 *      Authority can only improve if at least one contributing item is authoritative
 *   4. Cross-domain synthesis must cite supporting domain items explicitly
 *   5. When contributing domains disagree, render uncertainty — not synthesis
 *   6. A claim type that is blocked in any domain stays blocked in synthesis
 *   7. Minimum contributing domains for synthesis: 2
 *      Single-domain output is governed by that domain alone
 */

import type {
  SymbolicDomain,
  SymbolicAuthority,
  SymbolicClaimType,
  SymbolicAuditMeta,
  SymbolicRenderItem,
  SymbolicAuthorityCheckResult,
} from '@/lib/symbolic/symbolicAuthorityContracts';

// ─────────────────────────────────────────────────────────────────────────────
// DOMAIN CONTRIBUTION
// One domain's governed output that feeds into a cross-domain synthesis.
// ─────────────────────────────────────────────────────────────────────────────

export interface DomainContribution {
  /** Which domain this item came from */
  domain: SymbolicDomain;
  /** The item's traceId within its domain */
  traceId: string;
  /** The item's authority level */
  authority: SymbolicAuthority;
  /** Whether the item was blocked in its own domain */
  renderBlocked: boolean;
  /** Why it was blocked, if applicable */
  blockReason?: string;
  /** Claim types detected in this item */
  claimTypes: SymbolicClaimType[];
  /** Whether the item's language was assertively framed */
  assertivelyFramed?: boolean;
  /** Brief description of what this domain contributes to the synthesis */
  contributionSummary: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// CROSS-DOMAIN SYNTHESIS ITEM
// The governed output of combining two or more domain contributions.
// ─────────────────────────────────────────────────────────────────────────────

export interface CrossDomainSynthesisItem {
  id: string;
  /** The synthesized text — must be framed as possibility when authority is derived/fallback */
  text: string;
  /** Which domains contributed to this synthesis */
  supportingDomains: SymbolicDomain[];
  /** The traceId from each contributing item (domain:traceId format) */
  supportingIds: string[];
  /** Resolved authority — determined by the weakest contributing item (see resolveAuthority) */
  authority: SymbolicAuthority;
  /** True if any contributing item was blocked or the synthesis itself was blocked */
  renderBlocked: boolean;
  /** Why it was blocked */
  blockReason?: string;
  /** traceId for this synthesis item */
  traceId: string;
  /** Whether the contributing domains agreed or disagreed */
  domainAgreement: 'converging' | 'diverging' | 'uncertain';
}

// ─────────────────────────────────────────────────────────────────────────────
// CROSS-DOMAIN GOVERNANCE CHECK RESULT
// ─────────────────────────────────────────────────────────────────────────────

export type CrossDomainBlockReason =
  | 'contributing_domain_blocked'       // one or more inputs were blocked
  | 'identity_claim_multi_domain'       // identity claim regardless of domain count
  | 'authority_upgrade_by_convergence'  // attempt to upgrade derived → authoritative via rhyming
  | 'insufficient_domains'             // fewer than 2 domains contributing
  | 'domain_disagreement'              // contributing domains point in different directions
  | 'relative_time_in_any_domain'      // relative time claim present in any contribution
  | 'all_contributions_fallback';      // every contributing item is fallback only

export interface CrossDomainGovernanceResult {
  ok: boolean;
  reason: CrossDomainBlockReason | 'synthesis_permitted';
  resolvedAuthority: SymbolicAuthority;
  domainAgreement: CrossDomainSynthesisItem['domainAgreement'];
  details?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// AUTHORITY RESOLUTION
// The strictest rule: synthesis authority = weakest contributing authority.
// Two derived claims produce one derived claim — not one authoritative claim.
// ─────────────────────────────────────────────────────────────────────────────

const AUTHORITY_RANK: Record<SymbolicAuthority, number> = {
  authoritative: 2,
  derived: 1,
  fallback: 0,
};

/**
 * Resolve the authority of a synthesis from its contributing items.
 * Returns the weakest authority — convergence never upgrades authority.
 */
export function resolveAuthority(contributions: DomainContribution[]): SymbolicAuthority {
  if (contributions.length === 0) return 'fallback';

  const minRank = Math.min(...contributions.map(c => AUTHORITY_RANK[c.authority]));

  if (minRank >= AUTHORITY_RANK.authoritative) return 'authoritative';
  if (minRank >= AUTHORITY_RANK.derived) return 'derived';
  return 'fallback';
}

// ─────────────────────────────────────────────────────────────────────────────
// DOMAIN AGREEMENT DETECTION
// Detect whether contributing domains are converging, diverging, or uncertain.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Elemental groupings used to assess domain agreement.
 * Convergence: all contributions share the same elemental quality or state direction.
 * Divergence: contributions suggest meaningfully different elemental qualities.
 * Uncertain: cannot determine agreement from the available structure.
 */
export type ElementalPolarity = 'contracting' | 'expanding' | 'neutral';

const CONTRACTION_KEYWORDS = /\b(contraction|withdrawal|retreat|heaviness|closure|avoidance|silence|freeze|restriction)\b/i;
// Note: 'movement' excluded — too generic (appears in "resistance to forward movement")
const EXPANSION_KEYWORDS = /\b(expansion|opening|reaching|flow|emergence|initiation|warmth|opening up|expanding)\b/i;

function detectPolarity(text: string): ElementalPolarity {
  const contracts = CONTRACTION_KEYWORDS.test(text);
  const expands = EXPANSION_KEYWORDS.test(text);
  if (contracts && !expands) return 'contracting';
  if (expands && !contracts) return 'expanding';
  return 'neutral';
}

/**
 * Determine whether contributing domain summaries are converging or diverging.
 */
export function assessDomainAgreement(
  contributions: DomainContribution[]
): CrossDomainSynthesisItem['domainAgreement'] {
  if (contributions.length < 2) return 'uncertain';

  const polarities = contributions.map(c => detectPolarity(c.contributionSummary));
  const nonNeutral = polarities.filter(p => p !== 'neutral');

  if (nonNeutral.length === 0) return 'uncertain';

  const allSame = nonNeutral.every(p => p === nonNeutral[0]);
  if (allSame) return 'converging';

  // Check if any are directly opposite
  const hasContracting = nonNeutral.includes('contracting');
  const hasExpanding = nonNeutral.includes('expanding');
  if (hasContracting && hasExpanding) return 'diverging';

  return 'uncertain';
}

// ─────────────────────────────────────────────────────────────────────────────
// CORE GOVERNANCE CHECK
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Validate whether a cross-domain synthesis is permitted.
 *
 * Rules (in order of precedence):
 *   1. Insufficient domains — need ≥2 distinct domains
 *   2. Contributing domain blocked — if any input was blocked, synthesis blocks
 *   3. Relative time in any domain — always blocks
 *   4. Identity claim in any domain — always blocks
 *   5. All contributions fallback — blocks (nothing authoritative enough to synthesize)
 *   6. Domain disagreement — blocks; render uncertainty instead
 *   7. Authority upgrade by convergence — denied; resolved authority = weakest
 *   8. Otherwise: permitted
 */
export function validateCrossDomainSynthesis(
  contributions: DomainContribution[]
): CrossDomainGovernanceResult {
  const resolvedAuthority = resolveAuthority(contributions);
  const domainAgreement = assessDomainAgreement(contributions);

  // 1. Insufficient domains
  const uniqueDomains = new Set(contributions.map(c => c.domain));
  if (uniqueDomains.size < 2) {
    return {
      ok: false,
      reason: 'insufficient_domains',
      resolvedAuthority,
      domainAgreement,
      details: `Cross-domain synthesis requires ≥2 distinct domains. Found: ${uniqueDomains.size}.`,
    };
  }

  // 2. Blocked contributing domain
  const blockedContribution = contributions.find(c => c.renderBlocked);
  if (blockedContribution) {
    return {
      ok: false,
      reason: 'contributing_domain_blocked',
      resolvedAuthority,
      domainAgreement,
      details: `Domain '${blockedContribution.domain}' contribution was blocked (${blockedContribution.blockReason}). Synthesis cannot proceed.`,
    };
  }

  // 3. Relative time in any domain
  const hasRelativeTime = contributions.some(c => c.claimTypes.includes('relative_time'));
  if (hasRelativeTime) {
    return {
      ok: false,
      reason: 'relative_time_in_any_domain',
      resolvedAuthority,
      domainAgreement,
      details: 'Relative time claim detected in one or more contributing domains.',
    };
  }

  // 4. Identity claim in any domain — always blocked even with multi-domain convergence
  const hasIdentityClaim = contributions.some(c => c.claimTypes.includes('identity_claim'));
  if (hasIdentityClaim) {
    return {
      ok: false,
      reason: 'identity_claim_multi_domain',
      resolvedAuthority,
      domainAgreement,
      details: 'Identity claims cannot be synthesized across domains. Multi-domain convergence does not validate identity claims.',
    };
  }

  // 5. All contributions fallback — nothing trustworthy enough to synthesize
  const allFallback = contributions.every(c => c.authority === 'fallback');
  if (allFallback) {
    return {
      ok: false,
      reason: 'all_contributions_fallback',
      resolvedAuthority,
      domainAgreement,
      details: 'All contributing items are fallback authority. Cross-domain synthesis requires at least one derived or authoritative item.',
    };
  }

  // 6. Domain disagreement — render uncertainty, not synthesis
  if (domainAgreement === 'diverging') {
    return {
      ok: false,
      reason: 'domain_disagreement',
      resolvedAuthority,
      domainAgreement,
      details: 'Contributing domains point in different directions. Render uncertainty rather than synthesis.',
    };
  }

  // Synthesis is permitted. Note: authority is resolved to weakest — cannot be upgraded.
  return {
    ok: true,
    reason: 'synthesis_permitted',
    resolvedAuthority,
    domainAgreement,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// BUILD SYNTHESIS ITEM
// Construct a CrossDomainSynthesisItem from contributions + governance result.
// ─────────────────────────────────────────────────────────────────────────────

export function buildCrossDomainSynthesisItem(
  id: string,
  text: string,
  contributions: DomainContribution[],
  traceId: string
): CrossDomainSynthesisItem {
  const governanceResult = validateCrossDomainSynthesis(contributions);

  return {
    id,
    text: governanceResult.ok ? text : '',
    supportingDomains: [...new Set(contributions.map(c => c.domain))],
    supportingIds: contributions.map(c => `${c.domain}:${c.traceId}`),
    authority: governanceResult.resolvedAuthority,
    renderBlocked: !governanceResult.ok,
    blockReason: governanceResult.ok ? undefined : governanceResult.reason,
    traceId,
    domainAgreement: governanceResult.domainAgreement,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// UNCERTAINTY TEXT BUILDER
// When domains disagree, produce a bounded uncertainty statement.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Build a safe uncertainty statement when cross-domain synthesis is blocked.
 * Never asserts — only names that the signal is present but unclear.
 */
export function buildUncertaintyStatement(
  contributions: DomainContribution[],
  reason: CrossDomainBlockReason
): string {
  const domains = [...new Set(contributions.map(c => c.domain))].join(', ');

  switch (reason) {
    case 'domain_disagreement':
      return `Multiple signals are present across ${domains}, but they point in different directions. No synthesis is offered — what is here may need more time to clarify.`;
    case 'contributing_domain_blocked':
      return `Some contributing signals were blocked from rendering. What remains is present but incomplete — synthesis is not available.`;
    case 'all_contributions_fallback':
      return `The signals present across ${domains} are not yet grounded enough to synthesize. They may be worth noticing, but cannot be offered as interpretation.`;
    case 'identity_claim_multi_domain':
      return `Multiple domains suggest something, but a claim about who you are is not within what this system can reliably offer — across any number of signals.`;
    case 'relative_time_in_any_domain':
      return `A time-sensitive signal is present but cannot be grounded to specific timing. The underlying quality may be real; the timing is uncertain.`;
    default:
      return `Signals are present but synthesis is not available at this time.`;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// CROSS-DOMAIN AUDIT SUMMARY
// ─────────────────────────────────────────────────────────────────────────────

export interface CrossDomainAuditSummary {
  totalSynthesisAttempts: number;
  permittedSyntheses: number;
  blockedSyntheses: number;
  blockReasonCounts: Partial<Record<CrossDomainBlockReason, number>>;
  domainsRepresented: SymbolicDomain[];
}

export function buildCrossDomainAuditSummary(
  items: CrossDomainSynthesisItem[]
): CrossDomainAuditSummary {
  const blockReasonCounts: Partial<Record<CrossDomainBlockReason, number>> = {};

  for (const item of items) {
    if (item.renderBlocked && item.blockReason) {
      const key = item.blockReason as CrossDomainBlockReason;
      blockReasonCounts[key] = (blockReasonCounts[key] ?? 0) + 1;
    }
  }

  const domainsRepresented = [
    ...new Set(items.flatMap(i => i.supportingDomains)),
  ] as SymbolicDomain[];

  return {
    totalSynthesisAttempts: items.length,
    permittedSyntheses: items.filter(i => !i.renderBlocked).length,
    blockedSyntheses: items.filter(i => i.renderBlocked).length,
    blockReasonCounts,
    domainsRepresented,
  };
}
