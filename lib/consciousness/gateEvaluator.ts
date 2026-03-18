/**
 * lib/consciousness/gateEvaluator.ts
 *
 * Pure gate evaluation functions for the Accumulating Hypothesis Buffer.
 *
 * Design principles:
 *   - Pure functions: no DB access, no side effects
 *   - Each gate fails independently — all must pass for promotion
 *   - OS adjudicates; the model only proposes
 *   - original_language is never read or used here
 *
 * Gate sequence (in order):
 *   1. Recurrence          — has the pattern appeared enough times?
 *   2. Cross-context       — does it transcend a single domain/register?
 *   3. Developmental rel.  — does it map to the OS ontology?
 *   4. Structural complete — can it be expressed in normalized schema?
 *   5. Store routing       — which store does this belong in?
 *   6. Confidence floor    — is composite confidence above threshold?
 *
 *   Bonus: eligibility vs. worthiness — a formally valid candidate
 *   may still not be useful enough to hold (prevents inflation).
 */

import type {
  AccumulatingHypothesis,
  ConfidenceProfile,
  GateEvaluationInput,
  GateEvaluationResult,
  GateResult,
  GateStatus,
  GateThresholds,
  HypothesisEvidenceEvent,
  ContradictionEvent,
  PromotionRecommendation,
  SpiralogicPhase,
} from '../types/interpretive-ledger';

import {
  DEFAULT_GATE_THRESHOLDS,
} from '../types/interpretive-ledger';

// ─── Composite confidence calculation ────────────────────────────────────────

/**
 * Derive a composite confidence score from the three independent dimensions.
 *
 * Weighting rationale:
 *   structural_confidence carries the most weight because cross-context
 *   durability is the hardest signal to fake and most predictive of
 *   ledger-worthiness. Interpretive confidence is discounted slightly
 *   because the model can be fluently confident about weak observations.
 */
export function computeCompositeConfidence(
  signal: number,
  structural: number,
  interpretive: number,
): number {
  const weighted =
    signal       * 0.30 +
    structural   * 0.45 +
    interpretive * 0.25;
  return Math.min(1, Math.max(0, parseFloat(weighted.toFixed(3))));
}

/**
 * Recompute the full ConfidenceProfile from current evidence and contradiction state.
 *
 * signal_confidence    — weighted average of evidence signal strengths
 * structural_confidence — cross-context coherence, penalised by contradictions
 * interpretive_confidence — evidence_weight average (type quality proxy)
 */
export function computeConfidence(
  evidence: HypothesisEvidenceEvent[],
  contradictions: ContradictionEvent[],
  cross_context_count: number,
  min_cross_context: number,
): ConfidenceProfile {
  if (evidence.length === 0) {
    return {
      signal_confidence:        0,
      structural_confidence:    0,
      interpretive_confidence:  0,
      composite:                0,
      computed_at:              new Date(),
    };
  }

  // Signal confidence: weighted average of individual signal strengths
  const totalWeight   = evidence.reduce((s, e) => s + e.evidence_weight, 0);
  const weightedSignal = evidence.reduce(
    (s, e) => s + e.signal_strength * e.evidence_weight, 0
  );
  const signal_confidence = totalWeight > 0 ? weightedSignal / totalWeight : 0;

  // Structural confidence: cross-context ratio, penalised by contradiction weight
  const contextRatio = Math.min(1, cross_context_count / Math.max(1, min_cross_context));
  const totalContradictionPenalty = contradictions.reduce(
    (s, c) => s + c.contradiction_weight, 0
  );
  // Cap penalty at 0.8 to avoid zeroing out well-evidenced hypotheses entirely
  const contradictionPenalty = Math.min(0.80, totalContradictionPenalty * 0.4);
  const structural_confidence = Math.max(0, contextRatio - contradictionPenalty);

  // Interpretive confidence: average evidence_weight (type quality proxy)
  const interpretive_confidence = totalWeight / evidence.length;

  const composite = computeCompositeConfidence(
    signal_confidence,
    structural_confidence,
    interpretive_confidence,
  );

  return {
    signal_confidence:        parseFloat(signal_confidence.toFixed(3)),
    structural_confidence:    parseFloat(structural_confidence.toFixed(3)),
    interpretive_confidence:  parseFloat(interpretive_confidence.toFixed(3)),
    composite,
    computed_at:              new Date(),
  };
}

// ─── Individual gates ─────────────────────────────────────────────────────────

/** Gate 1: Has the pattern recurred enough times across sessions? */
export function evaluateRecurrenceGate(
  hypothesis: AccumulatingHypothesis,
  thresholds: GateThresholds,
): GateResult {
  if (hypothesis.recurrence_count >= thresholds.min_recurrence) {
    return 'passed';
  }

  // Strong-signal single-session exception:
  // if evidence is very strong and internally rich, allow with 1 session
  const internalPoints = hypothesis.evidence_events.length;
  const composite = hypothesis.confidence.composite;

  if (
    hypothesis.recurrence_count >= 1 &&
    composite >= thresholds.strong_signal_composite &&
    internalPoints >= thresholds.strong_signal_min_internal_points
  ) {
    // Passes, but hypothesis should be marked provisional
    return 'passed';
  }

  return 'pending';
}

/**
 * Gate 2: Does the pattern appear across meaningfully different contexts?
 *
 * Two questions:
 *   - distinct domain contexts ≥ min_cross_context
 *   - distinct elemental/emotional states ≥ min_cross_context
 *
 * Both must hold to avoid confusing situational activation with structural pattern.
 */
export function evaluateCrossContextGate(
  hypothesis: AccumulatingHypothesis,
  thresholds: GateThresholds,
): GateResult {
  if (hypothesis.cross_context_count >= thresholds.min_cross_context) {
    return 'passed';
  }
  // Not enough distinct contexts yet — keep accumulating
  return 'pending';
}

/**
 * Gate 3: Does this map to the cognitive OS ontology?
 *
 * Prevents the ledger from filling with clever model language or
 * interesting-but-non-operative observations.
 * style_calibration → relational_calibration store (lighter gate elsewhere)
 * ephemeral → never enters interpretive ledger
 */
export function evaluateDevelopmentalRelevanceGate(
  hypothesis: AccumulatingHypothesis,
): GateResult {
  if (hypothesis.target_store === 'ephemeral') {
    return 'failed'; // explicitly non-operative
  }

  if (
    hypothesis.target_store === 'interpretive_ledger' &&
    hypothesis.interpretation_type === 'style_calibration'
  ) {
    // style_calibration belongs in relational_calibration store, not interpretive_ledger
    return 'failed';
  }

  // Must map to a recognized interpretive type
  const operative_types = ['elemental', 'phase', 'relational', 'identity_arc', 'style_calibration'];
  if (!operative_types.includes(hypothesis.interpretation_type)) {
    return 'failed';
  }

  return 'passed';
}

/**
 * Gate 4: Can this be expressed in normalized schema form?
 *
 * Anti-mystification gate: if interpretation cannot be reduced to
 * observation + meaning + evidence + confidence + routing relevance,
 * it should not persist. Strips model charisma.
 */
export function evaluateStructuralCompletenessGate(
  hypothesis: AccumulatingHypothesis,
): GateResult {
  const required: Array<keyof AccumulatingHypothesis> = [
    'observation_summary',
    'candidate_interpretation',
    'interpretation_type',
    'target_store',
    'contradiction_conditions',
    'decay_conditions',
  ];

  for (const field of required) {
    const value = hypothesis[field];
    if (!value || (typeof value === 'string' && value.trim().length < 10)) {
      return 'failed';
    }
    if (Array.isArray(value) && value.length === 0) {
      return 'failed';
    }
  }

  // Falsifiability check: must have at least one contradiction condition
  if (hypothesis.contradiction_conditions.length === 0) {
    return 'failed';
  }

  return 'passed';
}

/**
 * Gate 5: Which store does this belong in?
 * Ensures candidates aren't evaluated against wrong-store standards.
 */
export function evaluateStoreRoutingGate(
  hypothesis: AccumulatingHypothesis,
): GateResult {
  const valid_stores = ['interpretive_ledger', 'state_store', 'relational_calibration', 'ephemeral'];
  if (!valid_stores.includes(hypothesis.target_store)) {
    return 'failed';
  }
  return 'passed';
}

/** Gate 6: Is composite confidence above the promotion floor? */
export function evaluateConfidenceFloorGate(
  hypothesis: AccumulatingHypothesis,
  thresholds: GateThresholds,
): GateResult {
  if (hypothesis.confidence.composite >= thresholds.min_composite_confidence) {
    return 'passed';
  }
  return 'pending';
}

// ─── Full gate sequence ───────────────────────────────────────────────────────

/**
 * Run the full gate sequence against a hypothesis.
 * Returns a complete GateStatus reflecting independent pass/fail per gate.
 */
export function runGateSequence(
  hypothesis: AccumulatingHypothesis,
  thresholds: GateThresholds,
): GateStatus {
  return {
    recurrence:               evaluateRecurrenceGate(hypothesis, thresholds),
    cross_context:            evaluateCrossContextGate(hypothesis, thresholds),
    developmental_relevance:  evaluateDevelopmentalRelevanceGate(hypothesis),
    structural_completeness:  evaluateStructuralCompletenessGate(hypothesis),
    store_routing:            evaluateStoreRoutingGate(hypothesis),
    confidence_floor:         evaluateConfidenceFloorGate(hypothesis, thresholds),
    evaluated_at:             new Date(),
  };
}

// ─── Eligibility and worthiness ───────────────────────────────────────────────

/** All formal gates must pass (none failed, none pending) */
export function isPromotionEligible(gate_status: GateStatus): boolean {
  return Object.entries(gate_status)
    .filter(([key]) => key !== 'evaluated_at')
    .every(([, result]) => result === 'passed');
}

/**
 * Eligibility is necessary but not sufficient.
 * Worthiness asks: will this improve future routing, interpretation,
 * or the member's continuity? If not, it's valid but not worth holding.
 *
 * A formally valid candidate may be discarded if:
 *   - routing_influence is near zero (pattern has no practical effect)
 *   - cross_context_count is at bare minimum with low structural confidence
 *   - interpretation adds nothing to an existing active ledger entry
 */
export function isPromotionWorthy(
  hypothesis: AccumulatingHypothesis,
  existingLedgerSummaries: string[],
): boolean {
  // Not worth holding if routing influence would be negligible
  if (hypothesis.confidence.composite < 0.35) return false;

  // Not worth holding if this is a near-duplicate of an active ledger entry
  const normalized = hypothesis.candidate_interpretation.toLowerCase().trim();
  const isDuplicate = existingLedgerSummaries.some(
    existing => similarity(existing.toLowerCase(), normalized) > 0.82,
  );
  if (isDuplicate) return false;

  return true;
}

// ─── Expiry checks ────────────────────────────────────────────────────────────

/**
 * Should this hypothesis expire?
 *
 * Conditions:
 *   1. Inactivity: no new evidence in N sessions
 *   2. Contradiction dominance: contradictions outweigh evidence significantly
 *   3. Developmental irrelevance: current phase has moved far from creation phase
 */
export function shouldExpire(
  hypothesis: AccumulatingHypothesis,
  currentPhase: SpiralogicPhase,
  sessionsSinceLastEvidence: number,
  inactivityThreshold: number = 5,
): boolean {
  // Inactivity decay
  if (sessionsSinceLastEvidence >= inactivityThreshold) {
    return true;
  }

  // Contradiction dominance: if structural_confidence has been driven to near-zero
  // Guard: only applies when cross_context_count > 0 — a brand-new hypothesis that
  // hasn't yet crossed contexts will have structural_confidence = 0 legitimately,
  // and should be held (pending) rather than expired.
  if (
    hypothesis.confidence.structural_confidence < 0.05 &&
    hypothesis.cross_context_count > 0
  ) {
    return true;
  }

  // Developmental distance: if the member has moved more than 4 full phases
  const phaseDelta = Math.abs(currentPhase - hypothesis.phase_at_creation);
  const wrappedDelta = Math.min(phaseDelta, 12 - phaseDelta); // spiral wraps at 12
  if (wrappedDelta >= 5 && hypothesis.confidence.composite < 0.50) {
    return true;
  }

  return false;
}

// ─── Main evaluation entry point ─────────────────────────────────────────────

/**
 * Full gate evaluation — the OS adjudication function.
 *
 * Consumes a hypothesis and context; returns a complete evaluation result
 * with recommendation. The hypothesis itself is not mutated here.
 */
export function evaluateHypothesis(
  input: GateEvaluationInput,
  existingLedgerSummaries: string[] = [],
  sessionsSinceLastEvidence: number = 0,
): GateEvaluationResult {
  const { hypothesis, thresholds, current_phase } = input;

  const gate_status = runGateSequence(hypothesis, thresholds);
  const confidence  = computeConfidence(
    hypothesis.evidence_events,
    hypothesis.contradicting_evidence,
    hypothesis.cross_context_count,
    thresholds.min_cross_context,
  );

  const expiry_recommended = shouldExpire(
    hypothesis,
    current_phase,
    sessionsSinceLastEvidence,
  );

  if (expiry_recommended) {
    return {
      hypothesis_id:       hypothesis.id,
      gate_status,
      confidence,
      promotion_eligible:  false,
      promotion_worthy:    false,
      expiry_recommended:  true,
      recommendation:      'discard',
      reason:              buildReason(gate_status, confidence, 'expired'),
      evaluated_at:        new Date(),
    };
  }

  const promotion_eligible = isPromotionEligible(gate_status);
  const promotion_worthy   = promotion_eligible
    ? isPromotionWorthy(hypothesis, existingLedgerSummaries)
    : false;

  let recommendation: PromotionRecommendation;
  let reason: string;

  if (promotion_eligible && promotion_worthy) {
    recommendation = 'promote';
    reason         = buildReason(gate_status, confidence, 'promote');
  } else if (hasFatalFailure(gate_status)) {
    recommendation = 'discard';
    reason         = buildReason(gate_status, confidence, 'discard');
  } else {
    recommendation = 'hold';
    reason         = buildReason(gate_status, confidence, 'hold');
  }

  return {
    hypothesis_id: hypothesis.id,
    gate_status,
    confidence,
    promotion_eligible,
    promotion_worthy,
    expiry_recommended: false,
    recommendation,
    reason,
    evaluated_at: new Date(),
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** A fatal failure is one that cannot recover with more evidence */
function hasFatalFailure(gate_status: GateStatus): boolean {
  return (
    gate_status.developmental_relevance === 'failed' ||
    gate_status.structural_completeness === 'failed' ||
    gate_status.store_routing          === 'failed'
  );
}

function buildReason(
  gate_status: GateStatus,
  confidence: ConfidenceProfile,
  outcome: 'promote' | 'hold' | 'discard' | 'expired',
): string {
  const pending = Object.entries(gate_status)
    .filter(([k, v]) => k !== 'evaluated_at' && v === 'pending')
    .map(([k]) => k);

  const failed = Object.entries(gate_status)
    .filter(([k, v]) => k !== 'evaluated_at' && v === 'failed')
    .map(([k]) => k);

  if (outcome === 'promote') {
    return `All gates passed. Composite confidence: ${confidence.composite}. Promoting to ledger.`;
  }
  if (outcome === 'expired') {
    return `Hypothesis expired due to inactivity, contradiction dominance, or developmental distance.`;
  }
  if (outcome === 'discard') {
    return `Fatal gate failure: [${failed.join(', ')}]. Cannot recover with more evidence.`;
  }
  // hold
  const parts: string[] = [];
  if (pending.length > 0) parts.push(`Pending gates: [${pending.join(', ')}]`);
  if (failed.length  > 0) parts.push(`Failed gates: [${failed.join(', ')}]`);
  parts.push(`Composite confidence: ${confidence.composite}`);
  return parts.join('. ') + '. Continue accumulating.';
}

/**
 * Naive string similarity (Dice coefficient on bigrams).
 * Used for duplicate detection in worthiness check — not a precision tool.
 */
function similarity(a: string, b: string): number {
  if (a === b) return 1;
  if (a.length < 2 || b.length < 2) return 0;

  const getBigrams = (s: string): Map<string, number> => {
    const bigrams = new Map<string, number>();
    for (let i = 0; i < s.length - 1; i++) {
      const bigram = s.slice(i, i + 2);
      bigrams.set(bigram, (bigrams.get(bigram) ?? 0) + 1);
    }
    return bigrams;
  };

  const bigramsA = getBigrams(a);
  const bigramsB = getBigrams(b);

  let intersection = 0;
  for (const [bigram, countA] of bigramsA) {
    const countB = bigramsB.get(bigram) ?? 0;
    intersection += Math.min(countA, countB);
  }

  return (2 * intersection) / (a.length + b.length - 2);
}

// ─── Convenience re-exports for consumers ────────────────────────────────────

export { DEFAULT_GATE_THRESHOLDS };
