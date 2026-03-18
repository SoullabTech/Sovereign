/**
 * Journal Interpretation Contracts — Phase 12 Scaffold
 *
 * Defines the authority grammar for MAIA's journal interpretation domain.
 * Uses the shared SymbolicAuthorityContracts layer.
 *
 * SEPARATION ENFORCED HERE:
 *   sourceFragments[]  → what the human actually wrote (occurrence layer)
 *   extractedSymbols[] → symbols / archetypes / elements identified (factual extraction)
 *   interpretations[]  → meaning layer — what might be present (derived)
 *   blockedClaims[]    → claims suppressed by authority gate
 *
 * The meaning layer MAY NOT invent source content.
 * The meaning layer MAY infer patterns but MUST flag them as 'derived' or 'fallback'.
 * Recurring pattern claims and causation claims require multi-entry backing.
 *
 * Renderers that output journal interpretation MUST pass through the authority
 * gate before emitting identity claims, causation claims, or recurring patterns.
 */

import type {
  SymbolicAuthority,
  SymbolicClaimType,
  SymbolicAuditMeta,
  SymbolicRenderItem,
  SymbolicAuthoritySummary,
  SymbolicAuthorityCheckResult,
} from '@/lib/symbolic/symbolicAuthorityContracts';

// ─────────────────────────────────────────────────────────────────────────────
// SOURCE LAYER
// Raw material — what the human wrote. This is the authoritative occurrence.
// ─────────────────────────────────────────────────────────────────────────────

export interface JournalSourceFragment {
  id: string;
  /** The actual text fragment from the human's writing */
  text: string;
  /** Source journal entry this fragment comes from */
  entryId: string;
  /** Timestamp of the original entry */
  timestamp: string;
  /** Optional: character position range within the entry */
  range?: { start: number; end: number };
}

// ─────────────────────────────────────────────────────────────────────────────
// EXTRACTION LAYER
// Symbols, archetypes, elemental signatures identified in source text.
// These are factual extractions — present in text, not inferred.
// ─────────────────────────────────────────────────────────────────────────────

export type JournalSymbolKind =
  | 'element'        // fire, water, earth, air, aether
  | 'archetype'      // hero, shadow, anima, self, trickster...
  | 'spiralogic'     // explicit Spiralogic language
  | 'somatic'        // body-referenced language
  | 'relational'     // other/relationship-referenced language
  | 'temporal'       // time-referenced language (past/future/present)
  | 'threshold'      // transition / liminal language
  | 'keyword';       // significant word that surfaces repeatedly

export interface JournalExtractedSymbol {
  id: string;
  /** The symbol or archetype identified */
  symbol: string;
  kind: JournalSymbolKind;
  /** Source fragment IDs from which this was extracted */
  sourceIds: string[];
  /** How many source fragments contain this symbol (backing count) */
  backingCount: number;
  /** True if this symbol appears in ≥2 source fragments (recurring) */
  isRecurring: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// INTERPRETATION LAYER
// Derived meaning — what might be present.
// Must not assert occurrence; must cite supporting symbols/sources.
// ─────────────────────────────────────────────────────────────────────────────

export type JournalInterpretationKind =
  | 'elemental_synthesis'   // what the elemental mix suggests
  | 'pattern_observation'   // observed (not inferred) pattern across entries
  | 'threshold_recognition' // a liminal or transition moment identified
  | 'somatic_signature'     // body-language pattern
  | 'shadow_indicator'      // possible suppressed material
  | 'integration_invitation'; // suggested integration question or action

export interface JournalInterpretation {
  id: string;
  kind: JournalInterpretationKind;
  /** The derived interpretation text */
  text: string;
  /** Authority level of this interpretation */
  authority: SymbolicAuthority;
  /** Claim types detected in the interpretation text */
  claimTypes: JournalClaimValidation['claimTypes'];
  /** Symbol IDs and/or source fragment IDs that back this interpretation */
  supportingIds: string[];
  /** True if the authority layer blocked this from rendering */
  renderBlocked: boolean;
  /** Why it was blocked */
  blockReason?: string;
  /** Confidence qualifier — rendered with interpretation text */
  confidence: 'observed' | 'possible' | 'speculative';
  /** traceId for audit correlation */
  traceId: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// CLAIM VALIDATION
// Authority check result specialized for journal domain.
// ─────────────────────────────────────────────────────────────────────────────

export interface JournalClaimValidation {
  ok: boolean;
  reason: SymbolicAuthorityCheckResult['reason'];
  claimTypes: SymbolicClaimType[];
  supportingIds: string[];
  requiredBackingCount: number; // min sources needed to pass this claim type
  actualBackingCount: number;
}

/** Minimum number of source fragments required per claim type */
export const JOURNAL_BACKING_REQUIREMENTS: Partial<Record<SymbolicClaimType, number>> = {
  recurring_pattern: 2,   // needs at least 2 entries showing the pattern
  causation_claim: 3,     // needs 3 fragments to assert cause
  identity_claim: 0,      // never allowed — always blocked regardless of backing
  trend_assertion: 3,     // needs 3+ observations
  relative_time: 0,       // always blocked (same as astrology)
};

// ─────────────────────────────────────────────────────────────────────────────
// JOURNAL PAYLOAD
// The complete input for a journal interpretation pass.
// ─────────────────────────────────────────────────────────────────────────────

export interface JournalInterpretationPayload {
  generatedAt: string;

  /** Raw source material — what the human actually wrote */
  sourceFragments: JournalSourceFragment[];

  /** Symbols, archetypes, elements identified in source text */
  extractedSymbols: JournalExtractedSymbol[];

  /** Derived meaning layer — must not invent occurrence */
  interpretations: JournalInterpretation[];

  /** Claims suppressed by the authority gate */
  blockedClaims: BlockedJournalClaim[];

  /** Active guardrails for this interpretation pass */
  guardrails: string[];

  /** Optional: payload-level health summary */
  authoritySummary?: JournalAuthoritySummary;
}

// ─────────────────────────────────────────────────────────────────────────────
// BLOCKED CLAIM RECORD
// Preserves suppressed material for audit — never rendered, always logged.
// ─────────────────────────────────────────────────────────────────────────────

export interface BlockedJournalClaim {
  id: string;
  /** The text that was suppressed */
  originalText: string;
  claimTypes: SymbolicClaimType[];
  blockReason: SymbolicAuthorityCheckResult['reason'];
  /** traceId of the interpretation that contained this claim */
  interpretationId: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// JOURNAL AUTHORITY SUMMARY
// Payload-level health metrics — extends SymbolicAuthoritySummary.
// ─────────────────────────────────────────────────────────────────────────────

export interface JournalAuthoritySummary extends SymbolicAuthoritySummary {
  domain: 'journal';
  totalSourceFragments: number;
  totalExtractedSymbols: number;
  recurringSymbols: number;
  totalInterpretations: number;
  blockedInterpretations: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// RENDER ITEM TYPES
// Journal-specific rendered output shapes using the shared contract.
// ─────────────────────────────────────────────────────────────────────────────

export interface JournalSynthesisRenderItem extends SymbolicRenderItem {
  interpretationKind: JournalInterpretationKind;
  confidence: JournalInterpretation['confidence'];
}

export interface JournalDiagnosticRenderItem extends SymbolicRenderItem {
  fragmentCount: number;
  symbolCount: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// GUARDRAILS
// Journal-specific authority guardrails. Analogous to ASTRO_GUARDRAILS.
// ─────────────────────────────────────────────────────────────────────────────

export const JOURNAL_GUARDRAILS: string[] = [
  'interpretation_must_cite_source',
  'pattern_requires_multi_entry_backing',
  'identity_claims_blocked',
  'causation_claims_require_3_fragments',
  'relative_time_always_blocked',
  'confidence_qualifier_required',
  'shadow_material_offered_not_asserted',
];

// ─────────────────────────────────────────────────────────────────────────────
// UTILITY — BUILD AUTHORITY SUMMARY
// ─────────────────────────────────────────────────────────────────────────────

export function buildJournalAuthoritySummary(
  payload: JournalInterpretationPayload
): JournalAuthoritySummary {
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
    domain: 'journal',
    totalItems: payload.interpretations.length,
    authoritativeItems,
    derivedItems,
    fallbackItems,
    blockedItems,
    guardrailCount: payload.guardrails.length,
    totalSourceFragments: payload.sourceFragments.length,
    totalExtractedSymbols: payload.extractedSymbols.length,
    recurringSymbols: payload.extractedSymbols.filter(s => s.isRecurring).length,
    totalInterpretations: payload.interpretations.length,
    blockedInterpretations: blockedItems,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// UTILITY — CLAIM DETECTION FOR JOURNAL TEXT
// Extends the shared claim type detection for journal-specific patterns.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Detect journal-relevant claim types in text.
 * Returns both shared claim types and journal-specific ones.
 */
export function detectJournalClaimTypes(text: string): SymbolicClaimType[] {
  const lower = text.toLowerCase();
  const types: SymbolicClaimType[] = [];

  // Shared — relative time and calendar date (same rules as astrology)
  if (/\b(today|tomorrow|this week|next week|yesterday)\b/i.test(text)) {
    types.push('relative_time');
  }
  if (/\d{4}-\d{2}-\d{2}/.test(text)) {
    types.push('calendar_date');
  }

  // Journal-specific
  if (/\b(you always|you never|you keep|this keeps|it always|always happens)\b/i.test(text)) {
    types.push('recurring_pattern');
  }
  if (/\bbecause\b.{0,40}\byou\b|\byou\b.{0,40}\bbecause\b/i.test(text)) {
    types.push('causation_claim');
  }
  if (/\byou are\b|\byou're\b.{0,20}\b(a|an|the|someone)\b/i.test(text)) {
    types.push('identity_claim');
  }
  if (/\bthere is a (pattern|trend|tendency)\b|\bthis pattern\b/i.test(text)) {
    types.push('trend_assertion');
  }
  if (/\bin your relationships?\b|\bwith (others|people|partners|friends)\b/i.test(text)) {
    types.push('relational_claim');
  }

  return types;
}

/**
 * Check whether a journal claim is safe to render given the payload.
 * Identity claims are always blocked. Other claim types need backing.
 */
export function validateJournalClaim(
  text: string,
  claimTypes: SymbolicClaimType[],
  payload: JournalInterpretationPayload
): JournalClaimValidation {
  // Identity claims: always blocked
  if (claimTypes.includes('identity_claim')) {
    return {
      ok: false,
      reason: 'unsupported_claim_type',
      claimTypes,
      supportingIds: [],
      requiredBackingCount: 0,
      actualBackingCount: 0,
    };
  }

  // Relative time: always blocked
  if (claimTypes.includes('relative_time')) {
    return {
      ok: false,
      reason: 'relative_time_not_allowed',
      claimTypes,
      supportingIds: [],
      requiredBackingCount: 0,
      actualBackingCount: 0,
    };
  }

  // Recurring pattern: needs ≥2 source fragments
  if (claimTypes.includes('recurring_pattern')) {
    const required = JOURNAL_BACKING_REQUIREMENTS.recurring_pattern ?? 2;
    const actual = payload.sourceFragments.length;
    if (actual < required) {
      return {
        ok: false,
        reason: 'missing_support',
        claimTypes,
        supportingIds: [],
        requiredBackingCount: required,
        actualBackingCount: actual,
      };
    }
  }

  // Causation claims: needs ≥3 source fragments
  if (claimTypes.includes('causation_claim')) {
    const required = JOURNAL_BACKING_REQUIREMENTS.causation_claim ?? 3;
    const actual = payload.sourceFragments.length;
    if (actual < required) {
      return {
        ok: false,
        reason: 'missing_support',
        claimTypes,
        supportingIds: [],
        requiredBackingCount: required,
        actualBackingCount: actual,
      };
    }
  }

  return {
    ok: true,
    reason: 'source_backed',
    claimTypes,
    supportingIds: payload.sourceFragments.map(f => f.id),
    requiredBackingCount: 0,
    actualBackingCount: payload.sourceFragments.length,
  };
}
