/**
 * Field Sensing Contracts — Phase 14
 *
 * Governance layer for MAIA's field sensing domain.
 * This is where epistemic integrity is hardest to maintain.
 *
 * FOUR-LAYER MODEL:
 *   reportedState[]  → user explicitly stated their state (occurrence) — authoritative
 *   observedSignals[] → system-detected signals: tone, pace, element, pattern (observed)
 *   inferences[]     → what signals may suggest (meaning layer) — derived
 *   projectionRisk[] → claims that exceed evidence — suppressed for audit
 *
 * WHAT MAKES FIELD SENSING DIFFERENT:
 *   In astrology, the authority question is: "Is this event real?"
 *   In journal, the authority question is: "Did the human actually write this?"
 *   In pattern ledger, the question is: "Does recurrence justify the claim?"
 *
 *   In field sensing, the authority question is harder:
 *   "Is MAIA perceiving — or projecting?"
 *
 * PROJECTION RISK is not just a wrong answer.
 * It is a specific failure mode: the system attributes an internal state
 * (emotion, intent, wound, desire) to the human WITHOUT sufficient grounding.
 *
 * This is psychologically harmful. MAIA must not do it.
 *
 * RULES ENFORCED HERE:
 *   1. No attribution of internal state (emotion, intent) without explicit user signal
 *   2. No "you are feeling X" without at least one reported state OR two observed signals
 *   3. No relational inference without relational evidence
 *   4. No attribution of intent (why someone did something) — ever
 *   5. No shift claims ("something has shifted") without anchored before/after contrast
 *   6. Inferences must be offered as possibilities, never assertions
 *   7. Relative time always blocked
 *
 * Signal confidence is explicit: 'low' | 'medium' | 'high'
 * Inferences below 'medium' confidence are suppressed.
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
// REPORTED STATE — OCCURRENCE LAYER
// What the user explicitly stated about their own state.
// This is the only authoritative source for internal state claims.
// ─────────────────────────────────────────────────────────────────────────────

export type ReportedStateKind =
  | 'emotion'         // "I feel..."
  | 'body'            // "I notice in my body..."
  | 'desire'          // "I want..." / "I need..."
  | 'resistance'      // "I don't want..." / "I can't..."
  | 'uncertainty'     // "I don't know..." / "I'm not sure..."
  | 'relational'      // "Between me and X, I notice..."
  | 'transition';     // "Something is shifting..." (self-reported)

export interface FieldReportedState {
  id: string;
  kind: ReportedStateKind;
  /** Verbatim or near-verbatim text from the user */
  text: string;
  /** Source session or message ID */
  sourceId: string;
  timestamp?: string;
  /** True if the user explicitly confirmed this state when reflected back */
  confirmed?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// OBSERVED SIGNALS — DETECTION LAYER
// System-detected signals. These are observations, not interpretations.
// A signal says "X was present in the exchange" — not "X means Y".
// ─────────────────────────────────────────────────────────────────────────────

export type ObservedSignalKind =
  | 'element'         // dominant elemental pattern in language
  | 'pace'            // rhythm, response latency, sentence length
  | 'tone'            // warmth, flatness, sharpness, openness
  | 'repetition'      // a word, phrase, or theme repeated in session
  | 'deflection'      // topic changed, question unanswered
  | 'contraction'     // language narrowed, hedged, or shortened
  | 'expansion'       // language opened, elaborated, reached further
  | 'somatic_marker'; // body reference: breath, tension, heaviness

export type SignalConfidence = 'low' | 'medium' | 'high';

export interface FieldObservedSignal {
  id: string;
  kind: ObservedSignalKind;
  /** What was observed — descriptive, not interpretive */
  description: string;
  /** Number of distinct occurrences that support this signal */
  occurrenceCount: number;
  confidence: SignalConfidence;
  /** Source IDs (message, session, prior exchanges) */
  sourceIds: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// INFERENCE — MEANING LAYER
// What signals may suggest. Not what they prove.
// Inferences are always conditional — framed as possibility, not assertion.
// ─────────────────────────────────────────────────────────────────────────────

export type FieldInferenceKind =
  | 'emotional_state'     // possible emotional quality present
  | 'elemental_quality'   // elemental characterization of the field
  | 'threshold_proximity' // possible transition or liminal state
  | 'relational_pattern'  // possible pattern in how user relates
  | 'somatic_quality'     // possible body-level quality
  | 'field_shift'         // possible movement or change in state
  | 'integration_readiness'; // possible openness to reflection

export interface FieldInference {
  id: string;
  kind: FieldInferenceKind;
  /** The inference text — must be framed as possibility */
  text: string;
  /** Authority of this inference */
  authority: SymbolicAuthority;
  /** Claim types detected in the text */
  claimTypes: FieldClaimType[];
  /** Reported state IDs and/or observed signal IDs that ground this inference */
  supportingIds: string[];
  /** Minimum confidence required to allow rendering — must be 'medium' or 'high' */
  minimumConfidence: SignalConfidence;
  /** Actual confidence of the strongest supporting signal */
  actualConfidence: SignalConfidence;
  /** True if the authority gate suppressed this inference */
  renderBlocked: boolean;
  /** Why it was blocked */
  blockReason?: string;
  /** traceId for audit correlation */
  traceId: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// FIELD CLAIM TYPES
// Extends SymbolicClaimType with field-sensing-specific claim types.
// ─────────────────────────────────────────────────────────────────────────────

export type FieldClaimType =
  | SymbolicClaimType
  | 'emotional_attribution'  // "you are feeling X" — requires reported state or 2 signals
  | 'intent_attribution'     // "you did/do X because..." — always blocked
  | 'shift_claim'            // "something has shifted" — requires before/after contrast
  | 'relational_inference';  // "in how you relate..." — requires relational evidence

// ─────────────────────────────────────────────────────────────────────────────
// PROJECTION RISK RECORD
// Suppressed claims — the system detected the claim but blocked it.
// These exist only in the audit record. They never reach the human.
// ─────────────────────────────────────────────────────────────────────────────

export interface FieldProjectionRisk {
  id: string;
  /** The text that was suppressed */
  originalText: string;
  claimTypes: FieldClaimType[];
  blockReason: 'intent_attribution' | 'emotional_attribution_ungrounded' |
               'shift_claim_no_contrast' | 'relational_inference_no_data' |
               'low_confidence_inference' | 'relative_time_not_allowed' |
               'missing_support';
  /** traceId of the inference that contained this risk */
  inferenceId: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// FIELD SENSING PAYLOAD
// ─────────────────────────────────────────────────────────────────────────────

export interface FieldSensingPayload {
  domain: 'field';
  generatedAt: string;

  /** What the user explicitly stated */
  reportedStates: FieldReportedState[];

  /** System-detected signals */
  observedSignals: FieldObservedSignal[];

  /** Derived meaning — what signals may suggest */
  inferences: FieldInference[];

  /** Suppressed projection risks — audit only, never rendered */
  projectionRisks: FieldProjectionRisk[];

  /** Active guardrails */
  guardrails: string[];

  /** Payload-level health summary */
  authoritySummary?: FieldSensingAuthoritySummary;
}

// ─────────────────────────────────────────────────────────────────────────────
// AUTHORITY SUMMARY
// ─────────────────────────────────────────────────────────────────────────────

export interface FieldSensingAuthoritySummary extends SymbolicAuthoritySummary {
  domain: 'field';
  totalReportedStates: number;
  confirmedStates: number;
  totalObservedSignals: number;
  highConfidenceSignals: number;
  lowConfidenceSignals: number;
  totalInferences: number;
  blockedInferences: number;
  projectionRisksCount: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// GUARDRAILS
// ─────────────────────────────────────────────────────────────────────────────

export const FIELD_SENSING_GUARDRAILS: string[] = [
  'intent_attribution_blocked',
  'emotional_attribution_requires_reported_state_or_two_signals',
  'shift_claims_require_anchored_contrast',
  'relational_inference_requires_relational_evidence',
  'inferences_framed_as_possibility_not_assertion',
  'low_confidence_inferences_suppressed',
  'relative_time_always_blocked',
];

// ─────────────────────────────────────────────────────────────────────────────
// CLAIM DETECTION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Detect field sensing claim types in inference text.
 */
export function detectFieldClaimTypes(text: string): FieldClaimType[] {
  const types: FieldClaimType[] = [];

  // Relative time — always blocked (shared rule)
  if (/\b(today|tomorrow|this week|next week|yesterday)\b/i.test(text)) {
    types.push('relative_time');
  }

  // Intent attribution — always blocked: "you did X because", "the reason you", "your reason"
  if (/\b(you did .{0,30} because|the reason you|your reason (for|to)|why you (did|do|chose|avoid))\b/i.test(text)) {
    types.push('intent_attribution');
  }

  // Emotional attribution — "you are feeling", "you feel", "you're experiencing"
  // Exclude "feel free" which is a directive, not an emotional attribution
  if (/\byou (are feeling|feel(?!\s+free)|felt|are experiencing|experience)\b/i.test(text)) {
    types.push('emotional_attribution');
  }

  // Shift claims — "something has shifted", "a shift is occurring", "there has been a movement"
  if (/\b(something has shifted|a shift (is|has)|there (is|has been) a (shift|movement|change) (in you|in your))\b/i.test(text)) {
    types.push('shift_claim');
  }

  // Relational inference — "in how you relate", "in your relationships", "with others you tend"
  if (/\b(in how you relate|in your relationships?|with others you|your relational)\b/i.test(text)) {
    types.push('relational_inference');
  }

  // Recurring pattern (from shared types)
  if (/\b(patterns?|recurring|repeatedly|again and again)\b/i.test(text)) {
    types.push('recurring_pattern');
  }

  // Calendar date
  if (/\d{4}-\d{2}-\d{2}/.test(text)) {
    types.push('calendar_date');
  }

  return types;
}

// ─────────────────────────────────────────────────────────────────────────────
// LANGUAGE VALIDATION
// Inferences must be framed as possibility — not assertion.
// ─────────────────────────────────────────────────────────────────────────────

const ASSERTIVE_FRAMING_PATTERNS = [
  /\byou are feeling\b/i,          // must be "there may be a sense of..."
  /\byou feel\b(?! free)/i,        // "you feel free" is different
  /\byou are (in|at|within)\b/i,   // location assertions about state
  /\bthis is (what|why|how)\b/i,   // causal assertion
  /\byou need to\b/i,              // directive
  /\byou should\b/i,               // directive
  /\bthe truth is\b/i,             // certainty claim
  /\bit is clear\b/i,              // certainty claim
];

const POSSIBILITY_FRAMING_PATTERNS = [
  /\b(may|might|could|perhaps|possibly|there may be|it seems|one possibility|what (if|comes))\b/i,
  /\b(it appears|this suggests|this might indicate|a sense of|something like)\b/i,
];

export function isAssertivelyFramed(text: string): boolean {
  return ASSERTIVE_FRAMING_PATTERNS.some(p => p.test(text));
}

export function isPossibilityFramed(text: string): boolean {
  return POSSIBILITY_FRAMING_PATTERNS.some(p => p.test(text));
}

// ─────────────────────────────────────────────────────────────────────────────
// VALIDATION — CORE GATE
// ─────────────────────────────────────────────────────────────────────────────

export interface FieldClaimValidation {
  ok: boolean;
  reason: SymbolicAuthorityCheckResult['reason'] |
    'intent_attribution' | 'emotional_attribution_ungrounded' |
    'shift_claim_no_contrast' | 'relational_inference_no_data' |
    'low_confidence_inference' | 'assertive_framing';
  claimTypes: FieldClaimType[];
  supportingIds: string[];
  details?: string;
}

/**
 * Validate a field sensing inference against the payload.
 *
 * Rules (in order of precedence):
 *   1. Intent attribution — always blocked
 *   2. Relative time — always blocked
 *   3. Assertive framing — blocked when emotional/state claim uses assertion language
 *   4. Emotional attribution — needs reported state OR ≥2 observed signals
 *   5. Shift claims — needs ≥1 reported state with contrasting timestamps
 *   6. Relational inference — needs relational-tagged reported state or signal
 *   7. Low confidence — blocked when actualConfidence is 'low'
 *   8. Recurring pattern — needs ≥2 signal occurrences
 */
export function validateFieldInference(
  text: string,
  claimTypes: FieldClaimType[],
  payload: FieldSensingPayload,
  inference?: Pick<FieldInference, 'actualConfidence' | 'minimumConfidence'>
): FieldClaimValidation {
  const supportingIds = [
    ...payload.reportedStates.map(r => r.id),
    ...payload.observedSignals.map(s => s.id),
  ];

  // 1. Intent attribution: always blocked
  if (claimTypes.includes('intent_attribution')) {
    return {
      ok: false,
      reason: 'intent_attribution',
      claimTypes,
      supportingIds: [],
      details: 'Intent attribution is not permitted. MAIA does not attribute why a person did something.',
    };
  }

  // 2. Relative time: always blocked
  if (claimTypes.includes('relative_time')) {
    return { ok: false, reason: 'relative_time_not_allowed', claimTypes, supportingIds: [] };
  }

  // 3. Assertive framing on emotional/state claims: blocked
  if (
    (claimTypes.includes('emotional_attribution') || claimTypes.includes('shift_claim')) &&
    isAssertivelyFramed(text) &&
    !isPossibilityFramed(text)
  ) {
    return {
      ok: false,
      reason: 'assertive_framing',
      claimTypes,
      supportingIds: [],
      details: 'Emotional and state claims must be framed as possibility, not assertion.',
    };
  }

  // 4. Emotional attribution: needs reported state OR ≥2 observed signals
  if (claimTypes.includes('emotional_attribution')) {
    const hasReportedState = payload.reportedStates.length > 0;
    const highOrMedSignals = payload.observedSignals.filter(
      s => s.confidence === 'high' || s.confidence === 'medium'
    );
    if (!hasReportedState && highOrMedSignals.length < 2) {
      return {
        ok: false,
        reason: 'emotional_attribution_ungrounded',
        claimTypes,
        supportingIds: [],
        details: `Emotional attribution requires a reported state or ≥2 medium/high-confidence signals. Found: ${payload.reportedStates.length} reported states, ${highOrMedSignals.length} qualifying signals.`,
      };
    }
  }

  // 5. Shift claims: need ≥1 reported state with at least two distinct timestamps
  if (claimTypes.includes('shift_claim')) {
    const timedStates = payload.reportedStates.filter(r => r.timestamp);
    const uniqueTimestamps = new Set(timedStates.map(r => r.timestamp));
    if (uniqueTimestamps.size < 2) {
      return {
        ok: false,
        reason: 'shift_claim_no_contrast',
        claimTypes,
        supportingIds: [],
        details: `Shift claims require reported states across ≥2 timestamps to establish contrast. Found: ${uniqueTimestamps.size} timestamp(s).`,
      };
    }
  }

  // 6. Relational inference: needs relational-tagged reported state or signal
  if (claimTypes.includes('relational_inference')) {
    const hasRelationalState = payload.reportedStates.some(r => r.kind === 'relational');
    const hasRelationalSignal = payload.observedSignals.some(s => s.kind === 'tone' || s.kind === 'repetition');
    if (!hasRelationalState && !hasRelationalSignal) {
      return {
        ok: false,
        reason: 'relational_inference_no_data',
        claimTypes,
        supportingIds: [],
        details: 'Relational inferences require relational reported state or relevant observed signals.',
      };
    }
  }

  // 7. Low confidence: block if actualConfidence is 'low'
  if (inference && inference.actualConfidence === 'low') {
    return {
      ok: false,
      reason: 'low_confidence_inference',
      claimTypes,
      supportingIds: [],
      details: `Inference blocked: actualConfidence is 'low'. Minimum required: '${inference.minimumConfidence}'.`,
    };
  }

  return { ok: true, reason: 'source_backed', claimTypes, supportingIds };
}

// ─────────────────────────────────────────────────────────────────────────────
// AUTHORITY SUMMARY BUILDER
// ─────────────────────────────────────────────────────────────────────────────

export function buildFieldSensingAuthoritySummary(
  payload: FieldSensingPayload
): FieldSensingAuthoritySummary {
  const authoritativeItems = payload.inferences.filter(i => i.authority === 'authoritative').length;
  const derivedItems = payload.inferences.filter(i => i.authority === 'derived').length;
  const fallbackItems = payload.inferences.filter(i => i.authority === 'fallback').length;
  const blockedItems = payload.inferences.filter(i => i.renderBlocked).length;

  return {
    domain: 'field',
    totalItems: payload.inferences.length,
    authoritativeItems,
    derivedItems,
    fallbackItems,
    blockedItems,
    guardrailCount: payload.guardrails.length,
    totalReportedStates: payload.reportedStates.length,
    confirmedStates: payload.reportedStates.filter(r => r.confirmed).length,
    totalObservedSignals: payload.observedSignals.length,
    highConfidenceSignals: payload.observedSignals.filter(s => s.confidence === 'high').length,
    lowConfidenceSignals: payload.observedSignals.filter(s => s.confidence === 'low').length,
    totalInferences: payload.inferences.length,
    blockedInferences: blockedItems,
    projectionRisksCount: payload.projectionRisks.length,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// RENDER ITEM TYPE
// ─────────────────────────────────────────────────────────────────────────────

export interface FieldSensingRenderItem extends SymbolicRenderItem {
  inferenceKind: FieldInferenceKind;
  confidence: SignalConfidence;
  isPossibilityFramed: boolean;
}
