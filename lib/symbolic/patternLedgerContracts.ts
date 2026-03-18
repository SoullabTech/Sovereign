/**
 * Pattern Ledger Contracts — Phase 13
 *
 * Governance layer for MAIA's pattern ledger domain.
 * Sits naturally between journal interpretation and field sensing.
 *
 * FOUR-LAYER MODEL:
 *   evidence[]      → raw repeated observations (occurrence layer) — authoritative
 *   candidates[]    → grouped recurrence signals (extraction layer) — derived
 *   interpretations[] → what a pattern may mean (meaning layer) — derived/fallback
 *   blockedClaims[] → suppressed overreach, preserved for audit
 *
 * SEPARATION ENFORCED HERE:
 *   Evidence is what was observed.
 *   A candidate is that the observation recurs.
 *   An interpretation is what recurrence might mean.
 *   These must not be collapsed.
 *
 * Renderers producing pattern-level output must pass through authority gating
 * before emitting identity claims, causation claims, or strong pattern assertions.
 */

import type {
  SymbolicAuthority,
  SymbolicClaimType,
  SymbolicAuthoritySummary,
  SymbolicAuthorityCheckResult,
  SymbolicRenderItem,
  SymbolicAuditMeta,
} from '@/lib/symbolic/symbolicAuthorityContracts';

// ─────────────────────────────────────────────────────────────────────────────
// EVIDENCE LAYER — OCCURRENCE
// Raw repeated observations. These are authoritative — they happened.
// ─────────────────────────────────────────────────────────────────────────────

export interface PatternEvidenceFragment {
  id: string;
  /** Source record this fragment came from (journal entry, session, check-in) */
  sourceId: string;
  /** The actual observed text or signal */
  text: string;
  /** ISO timestamp of the source observation */
  timestamp?: string;
  /** Classification tags (element, theme, symbol, etc.) */
  tags?: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// CANDIDATE LAYER — EXTRACTION
// A pattern candidate is the claim that evidence recurs.
// Candidates are grounded in evidence but are not yet interpreted.
// ─────────────────────────────────────────────────────────────────────────────

export type PatternCandidateConfidence = 'low' | 'medium' | 'high';

export interface PatternCandidate {
  id: string;
  /** Human-readable label for the candidate pattern */
  label: string;
  /** Evidence fragment IDs that constitute this pattern */
  evidenceIds: string[];
  /** How many evidence fragments support this candidate */
  recurrenceCount: number;
  /** Confidence based on recurrenceCount and temporal spread */
  confidence: PatternCandidateConfidence;
  /**
   * True if evidence spans at least 2 distinct timestamps.
   * Required before causation claims can be made about this candidate.
   */
  multipleTimestamps: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// INTERPRETATION LAYER — MEANING
// What a pattern candidate might mean.
// Must cite supporting evidence or candidates — may not invent occurrence.
// ─────────────────────────────────────────────────────────────────────────────

export interface PatternInterpretation {
  id: string;
  /** The interpretation text */
  text: string;
  /** Authority level of this interpretation */
  authority: SymbolicAuthority;
  /** Claim types detected in the text */
  claimTypes: SymbolicClaimType[];
  /** Evidence fragment IDs and/or candidate IDs that back this interpretation */
  supportingIds: string[];
  /** True if the authority gate suppressed this interpretation */
  renderBlocked: boolean;
  /** Why it was blocked */
  blockReason?: string;
  /** traceId for audit correlation */
  traceId: string;
  /** Source: derived from candidates, or fallback generation */
  source: 'derived' | 'fallback';
}

// ─────────────────────────────────────────────────────────────────────────────
// BLOCKED CLAIM RECORD
// Suppressed material — never rendered, always preserved for audit.
// ─────────────────────────────────────────────────────────────────────────────

export interface BlockedPatternClaim {
  id: string;
  /** The text that was suppressed */
  text: string;
  /** Why it was blocked */
  reason: SymbolicAuthorityCheckResult['reason'] | 'weak_recurrence' | 'strong_wording_low_confidence';
  /** traceId of the interpretation that contained this claim */
  traceId: string;
  /** Claim types that triggered blocking */
  claimTypes: SymbolicClaimType[];
}

// ─────────────────────────────────────────────────────────────────────────────
// PATTERN LEDGER PAYLOAD
// The complete input/output for a pattern ledger governance pass.
// ─────────────────────────────────────────────────────────────────────────────

export interface PatternLedgerPayload {
  domain: 'pattern_ledger';
  generatedAt: string;

  /** Raw repeated observations — authoritative occurrence */
  evidence: PatternEvidenceFragment[];

  /** Grouped recurrence signals — extraction from evidence */
  candidates: PatternCandidate[];

  /** Derived meaning layer — must cite evidence/candidates */
  interpretations: PatternInterpretation[];

  /** Suppressed claims — preserved for audit */
  blockedClaims: BlockedPatternClaim[];

  /** Active guardrails for this ledger pass */
  guardrails: string[];

  /** Payload-level health summary */
  authoritySummary?: PatternLedgerAuthoritySummary;
}

// ─────────────────────────────────────────────────────────────────────────────
// AUTHORITY SUMMARY — PATTERN LEDGER
// Extends SymbolicAuthoritySummary with ledger-specific metrics.
// ─────────────────────────────────────────────────────────────────────────────

export interface PatternLedgerAuthoritySummary extends SymbolicAuthoritySummary {
  domain: 'pattern_ledger';
  totalEvidence: number;
  totalCandidates: number;
  highConfidenceCandidates: number;
  lowConfidenceCandidates: number;
  totalInterpretations: number;
  blockedInterpretations: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// GUARDRAILS
// ─────────────────────────────────────────────────────────────────────────────

export const PATTERN_LEDGER_GUARDRAILS: string[] = [
  'identity_claims_blocked',
  'causation_requires_3_fragments_across_2_timestamps',
  'recurring_pattern_requires_recurrence_count_2',
  'strong_wording_requires_high_confidence',
  'relationship_claims_require_relational_evidence',
  'interpretation_must_cite_candidate_or_evidence',
  'relative_time_always_blocked',
];

// ─────────────────────────────────────────────────────────────────────────────
// STRONG WORDING DETECTION
// Words/phrases that assert forceful pattern claims — require high confidence.
// ─────────────────────────────────────────────────────────────────────────────

const STRONG_WORDING_PATTERNS = [
  /\byou always\b/i,
  /\byou never\b/i,
  /\bcore pattern\b/i,
  /\byou are\b/i,
  /\byour (nature|identity|personality)\b/i,
  /\bthis is who you are\b/i,
  /\binvariably\b/i,
  /\bconsistently\b/i,
  /\bfundamentally\b/i,
];

export function containsStrongWording(text: string): boolean {
  return STRONG_WORDING_PATTERNS.some(p => p.test(text));
}

// ─────────────────────────────────────────────────────────────────────────────
// CLAIM DETECTION — PATTERN LEDGER DOMAIN
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Detect claim types in pattern ledger interpretation text.
 * Extends the shared claim types with ledger-specific detection.
 */
export function detectPatternClaimTypes(text: string): SymbolicClaimType[] {
  const types: SymbolicClaimType[] = [];

  // Always blocked: relative time
  if (/\b(today|tomorrow|this week|next week|yesterday)\b/i.test(text)) {
    types.push('relative_time');
  }

  // Always blocked: identity assertions
  if (/\byou are\b|\byou're\b.{0,20}\b(a|an|the|someone|fundamentally)\b|\bthis is who you are\b/i.test(text)) {
    types.push('identity_claim');
  }

  // Needs multi-fragment, multi-timestamp backing
  if (/\b(because|due to|as a result of|this causes|leads to|this leads)\b/i.test(text)) {
    types.push('causation_claim');
  }

  // Needs recurrence count ≥ 2
  if (/\b(patterns?|recurring|repeatedly|again and again|keeps (happening|coming up))\b/i.test(text)) {
    types.push('recurring_pattern');
  }

  // Needs explicit relational evidence
  if (/\b(in your relationships?|with (others|people|partners))\b/i.test(text)) {
    types.push('relational_claim');
  }

  // Calendar date present
  if (/\d{4}-\d{2}-\d{2}/.test(text)) {
    types.push('calendar_date');
  }

  return types;
}

// ─────────────────────────────────────────────────────────────────────────────
// VALIDATION — CORE GATE
// ─────────────────────────────────────────────────────────────────────────────

export interface PatternClaimValidation {
  ok: boolean;
  reason: SymbolicAuthorityCheckResult['reason'] | 'weak_recurrence' | 'strong_wording_low_confidence';
  claimTypes: SymbolicClaimType[];
  supportingIds: string[];
  details?: string;
}

/**
 * Validate whether a pattern interpretation is safe to render.
 *
 * Rules (in order of precedence):
 *   1. Identity claims — always blocked
 *   2. Relative time — always blocked
 *   3. Strong wording — blocked if candidate confidence is not 'high'
 *   4. Causation claims — need ≥3 evidence fragments across ≥2 timestamps
 *   5. Recurring pattern claims — need recurrence count ≥ 2
 *   6. Relational claims — need at least one relational-tagged evidence fragment
 */
export function validatePatternClaim(
  text: string,
  claimTypes: SymbolicClaimType[],
  payload: PatternLedgerPayload,
  candidateId?: string
): PatternClaimValidation {
  const supportingIds = payload.evidence.map(e => e.id);

  // 1. Identity claims: always blocked
  if (claimTypes.includes('identity_claim')) {
    return { ok: false, reason: 'unsupported_claim_type', claimTypes, supportingIds: [], details: 'Identity claims are not permitted in pattern ledger output.' };
  }

  // 2. Relative time: always blocked
  if (claimTypes.includes('relative_time')) {
    return { ok: false, reason: 'relative_time_not_allowed', claimTypes, supportingIds: [] };
  }

  // 3. Strong wording: blocked unless candidate confidence is 'high'
  if (containsStrongWording(text)) {
    const candidate = candidateId
      ? payload.candidates.find(c => c.id === candidateId)
      : payload.candidates[0];
    if (!candidate || candidate.confidence !== 'high') {
      return {
        ok: false,
        reason: 'strong_wording_low_confidence',
        claimTypes,
        supportingIds: [],
        details: `Strong wording requires a high-confidence candidate. Candidate confidence: ${candidate?.confidence ?? 'unknown'}.`,
      };
    }
  }

  // 4. Causation claims: ≥3 fragments across ≥2 timestamps
  if (claimTypes.includes('causation_claim')) {
    const fragmentsWithTime = payload.evidence.filter(e => e.timestamp);
    const uniqueTimestamps = new Set(fragmentsWithTime.map(e => e.timestamp));
    if (payload.evidence.length < 3 || uniqueTimestamps.size < 2) {
      return {
        ok: false,
        reason: 'missing_support',
        claimTypes,
        supportingIds: [],
        details: `Causation claims require ≥3 evidence fragments across ≥2 timestamps. Found: ${payload.evidence.length} fragments, ${uniqueTimestamps.size} timestamps.`,
      };
    }
  }

  // 5. Recurring pattern claims: recurrence count ≥ 2
  if (claimTypes.includes('recurring_pattern')) {
    const candidate = candidateId
      ? payload.candidates.find(c => c.id === candidateId)
      : payload.candidates.find(c => c.recurrenceCount >= 2);
    if (!candidate || candidate.recurrenceCount < 2) {
      return {
        ok: false,
        reason: 'weak_recurrence',
        claimTypes,
        supportingIds: [],
        details: `Recurring pattern claims require recurrence count ≥ 2. Found: ${candidate?.recurrenceCount ?? 0}.`,
      };
    }
  }

  // 6. Relational claims: need at least one relational-tagged fragment
  if (claimTypes.includes('relational_claim')) {
    const relationalEvidence = payload.evidence.filter(
      e => e.tags?.includes('relational') || e.tags?.includes('relationship')
    );
    if (relationalEvidence.length === 0) {
      return {
        ok: false,
        reason: 'missing_support',
        claimTypes,
        supportingIds: [],
        details: 'Relational claims require at least one relational-tagged evidence fragment.',
      };
    }
  }

  return { ok: true, reason: 'source_backed', claimTypes, supportingIds };
}

// ─────────────────────────────────────────────────────────────────────────────
// AUTHORITY SUMMARY BUILDER
// ─────────────────────────────────────────────────────────────────────────────

export function buildPatternLedgerAuthoritySummary(
  payload: PatternLedgerPayload
): PatternLedgerAuthoritySummary {
  const authoritativeItems = payload.interpretations.filter(
    i => i.authority === 'authoritative'
  ).length;

  const derivedItems = payload.interpretations.filter(
    i => i.authority === 'derived'
  ).length;

  const fallbackItems = payload.interpretations.filter(
    i => i.authority === 'fallback'
  ).length;

  const blockedItems = payload.interpretations.filter(
    i => i.renderBlocked
  ).length;

  return {
    domain: 'pattern_ledger',
    totalItems: payload.interpretations.length,
    authoritativeItems,
    derivedItems,
    fallbackItems,
    blockedItems,
    guardrailCount: payload.guardrails.length,
    totalEvidence: payload.evidence.length,
    totalCandidates: payload.candidates.length,
    highConfidenceCandidates: payload.candidates.filter(c => c.confidence === 'high').length,
    lowConfidenceCandidates: payload.candidates.filter(c => c.confidence === 'low').length,
    totalInterpretations: payload.interpretations.length,
    blockedInterpretations: blockedItems,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// RENDER ITEM TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface PatternLedgerRenderItem extends SymbolicRenderItem {
  candidateLabel?: string;
  recurrenceCount?: number;
  confidence?: PatternCandidateConfidence;
}
