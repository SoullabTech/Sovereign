/**
 * lib/types/interpretive-ledger.ts
 *
 * Canonical domain interfaces for the Soullab Cognitive OS:
 *   - Accumulating Hypothesis Buffer
 *   - Gate Evaluation System
 *   - Interpretive Ledger
 *
 * Core principle: Evidence is immutable. Interpretation is scaffolding.
 *
 * Architecture:
 *   ObservationCandidate   (raw model output)
 *     ↓ OS normalization
 *   NormalizedObservation
 *     ↓ gate evaluation
 *   AccumulatingHypothesis (buffer — provisional, building evidence)
 *     ↓ promotion
 *   InterpretiveLedgerEntry (durable — sparse, structured, falsifiable)
 *
 * Three stores with different update semantics:
 *   interpretive_ledger     — heavy gate, slow decay, falsifiable claims
 *   state_store             — Bridge D, lighter gate, tracks current position
 *   relational_calibration  — style/framing prefs, user-editable directly
 *
 * NOTE: The canonical Element type lives here. Other files (modelRegistry.ts,
 * cognitive-types.ts) define their own variants — those should eventually
 * import from here. Canonical form is lowercase to match the wider codebase.
 */

// ─── Primitive domain types ───────────────────────────────────────────────────

export type Element = 'fire' | 'water' | 'earth' | 'air' | 'aether';

/** Spiralogic phases 1–12 */
export type SpiralogicPhase = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export type VoiceMode = 'Talk' | 'Care' | 'Note';

export type InterpretationType =
  | 'elemental'         // maps to elemental state / activation
  | 'phase'             // relates to Spiralogic phase position
  | 'relational'        // pattern in how person relates to others / system
  | 'identity_arc'      // longer-term identity / developmental narrative
  | 'style_calibration'; // how person prefers to engage → relational_calibration store

export type TargetStore =
  | 'interpretive_ledger'   // main durable interpretive record
  | 'state_store'           // Bridge D (updates lighter and faster)
  | 'relational_calibration' // style / framing preferences
  | 'ephemeral';            // interesting but not worth storing

// ─── Evidence types and weights ──────────────────────────────────────────────

export type EvidenceType =
  | 'explicit_statement'    // direct self-disclosure — highest weight
  | 'behavioral_pattern'    // how person acts, not just what they say
  | 'elemental_activation'  // specific elemental signal from conductor
  | 'emotional_register'    // tone, affect, emotional quality
  | 'verbal_pattern'        // recurring word choices or framings
  | 'topic_avoidance';      // what isn't said, deflections

/**
 * Canonical evidence weights by type.
 * Used to initialize evidence_weight; OS may adjust within bounds.
 */
export const EVIDENCE_WEIGHTS: Record<EvidenceType, number> = {
  explicit_statement:   0.90,
  behavioral_pattern:   0.70,
  elemental_activation: 0.65,
  emotional_register:   0.60,
  verbal_pattern:       0.45,
  topic_avoidance:      0.40,
};

/**
 * Canonical contradiction weights by source.
 * User corrections carry the highest weight without overriding the
 * evidence architecture — they enter as very strong contradiction events.
 */
export const CONTRADICTION_WEIGHTS = {
  user_correction:       0.95,
  explicit_statement:    0.85,
  behavioral_pattern:    0.70,
  system_observation:    0.55,
} as const;

export type ContradictionSource = keyof typeof CONTRADICTION_WEIGHTS;

// ─── Lifecycle enumerations ───────────────────────────────────────────────────

export type HypothesisStatus =
  | 'accumulating'    // below gate thresholds, building evidence
  | 'eligible'        // passes formal gates
  | 'worthy'          // OS judges useful for continuity (extra worthiness check)
  | 'promoted'        // successfully written to ledger
  | 'discarded'       // failed gates or explicitly rejected by OS
  | 'expired';        // inactivity decay / phase shift made irrelevant

export type LedgerEntryStatus =
  | 'active'          // in durable ledger, influencing routing
  | 'superseded'      // replaced by evolved interpretation (parent of another)
  | 'expired'         // natural decay
  | 'revoked';        // member cleared influence (evidence remains)

export type LedgerSurfacingStatus =
  | 'eligible'        // observation can be offered at next threshold
  | 'timing_gated'    // waiting for threshold moment
  | 'declined'        // offered, not accepted — held lightly
  | 'held_lightly'    // evidence retained, interpretation inactive
  | 're_emergent'     // new signal forming after prior decline
  | 'cleared_by_member'; // member explicitly cleared routing influence

export type GateResult = 'pending' | 'passed' | 'failed';

// ─── Confidence ───────────────────────────────────────────────────────────────

/**
 * Multi-dimensional confidence profile.
 *
 * The three dimensions fail independently:
 *   - High signal, low interpretive: pattern is clear but meaning is uncertain → hold longer
 *   - High interpretive, low structural: meaning seems clear but only one context → cross-context gate holds
 *   - Low signal, high interpretive: model was confident but evidence is thin → recurrence gate holds
 *
 * Promotion requires ALL THREE above their respective floors.
 */
export interface ConfidenceProfile {
  /** How strong and clear the observations are (0–1) */
  signal_confidence: number;
  /** How cross-context and durable the pattern is (0–1) */
  structural_confidence: number;
  /** Confidence in the meaning claim itself (0–1) */
  interpretive_confidence: number;
  /** Derived composite. Stored (not recomputed) for gate comparison. */
  composite: number;
  /** When this profile was last computed */
  computed_at: Date;
}

// ─── Evidence and contradiction events ───────────────────────────────────────

/**
 * A single observation that contributes to an accumulating hypothesis.
 * Evidence events are IMMUTABLE once written.
 * The interpretation built on top of them is not.
 */
export interface HypothesisEvidenceEvent {
  id: string;
  hypothesis_id: string;
  session_id: string;
  timestamp: Date;

  /** What specifically was observed — OS-normalized, not raw model language */
  observation: string;

  context_domain: string;           // topic area / life domain
  context_element: Element;         // elemental state at time of observation
  context_mode: VoiceMode;

  evidence_type: EvidenceType;

  /** 0–1. Initialised from EVIDENCE_WEIGHTS; OS may adjust within ±0.15 */
  evidence_weight: number;

  /** Intensity of this specific signal instance, independent of type weight */
  signal_strength: number;

  readonly is_immutable: true;      // structural reminder — not enforced at TS level
}

/**
 * Evidence that works against an accumulating hypothesis.
 * Does not delete the hypothesis — reduces structural_confidence.
 * Accumulates alongside supporting evidence; the hypothesis survives
 * if supporting evidence was strong enough.
 */
export interface ContradictionEvent {
  id: string;
  hypothesis_id: string;
  session_id: string;
  timestamp: Date;

  /** What was observed that contradicts the hypothesis */
  observation: string;

  context_domain: string;
  context_element: Element;

  source: ContradictionSource;

  /** 0–1. Use CONTRADICTION_WEIGHTS as canonical starting values. */
  contradiction_weight: number;

  /** True when this contradiction was explicitly stated by the member */
  user_initiated: boolean;
}

// ─── Gate system ─────────────────────────────────────────────────────────────

export interface GateStatus {
  recurrence:               GateResult;
  cross_context:            GateResult;
  developmental_relevance:  GateResult;
  structural_completeness:  GateResult;
  store_routing:            GateResult;
  confidence_floor:         GateResult;
  evaluated_at:             Date;
}

export interface GateThresholds {
  /** Minimum sessions with supporting evidence (standard path) */
  min_recurrence: number;
  /** Minimum distinct context types for cross-context gate */
  min_cross_context: number;
  /** Minimum composite confidence for promotion */
  min_composite_confidence: number;
  /**
   * Strong-signal single-session exception:
   * if composite ≥ this AND internal evidence points ≥ min_internal_points,
   * a hypothesis may be promoted from a single session (marked provisional).
   */
  strong_signal_composite: number;
  strong_signal_min_internal_points: number;
}

export const DEFAULT_GATE_THRESHOLDS: GateThresholds = {
  min_recurrence:                     2,
  min_cross_context:                  2,
  min_composite_confidence:           0.40,
  strong_signal_composite:            0.75,
  strong_signal_min_internal_points:  3,
};

// ─── Raw model output → normalized observation ───────────────────────────────

/**
 * Raw output from the active model before OS normalization.
 * Preserved for audit; never used for routing or promotion decisions.
 */
export interface ObservationCandidate {
  session_id: string;
  turn_index: number;
  originating_agent: string;
  originating_model: string;

  /** The model's actual language — archival only */
  raw_text: string;

  /** Model's proposed pattern (pre-normalization) */
  proposed_pattern: string;
  /** Model's proposed meaning (pre-normalization) */
  proposed_interpretation: string;

  context_element: Element;
  context_mode: VoiceMode;
  context_domain: string;
}

/**
 * After OS normalization: model language stripped,
 * OS schema applied, initial confidence estimated.
 */
export interface NormalizedObservation {
  /** Sourced from ObservationCandidate */
  session_id: string;
  originating_agent: string;
  originating_model: string;

  /** OS-authored description of the pattern — not model language */
  observation_summary: string;
  /** OS-authored meaning claim — not model language */
  candidate_interpretation: string;

  interpretation_type: InterpretationType;
  target_store: TargetStore;

  initial_evidence_event: Omit<HypothesisEvidenceEvent, 'id' | 'hypothesis_id'>;
  initial_confidence: Partial<ConfidenceProfile>;
}

// ─── Falsifiability anchor ────────────────────────────────────────────────────

/**
 * What would weaken or invalidate this interpretation.
 * Required for ledger admission. Entries without falsifiability anchors
 * cannot decay cleanly and become self-sealing over time.
 */
export interface FalsifiabilityAnchor {
  /** What evidence would weaken confidence in this interpretation */
  contradiction_conditions: string[];
  /** What developmental shift would make this interpretation irrelevant */
  decay_conditions: string[];
  /** Minimum cumulative contradiction weight before structural_confidence drops */
  minimum_contradiction_weight_to_weaken: number;
}

// ─── Decay schedule ───────────────────────────────────────────────────────────

/**
 * How a ledger entry loses influence over time.
 *
 * Decay is developmental, not calendar-based:
 *   - Inactivity (no new evidence in N sessions)
 *   - Phase distance (how far the member has moved since entry was formed)
 *   - Contradiction accumulation (tracked via ContradictionEvents)
 */
export interface DecaySchedule {
  /** Expire if no new supporting evidence within this many sessions */
  inactivity_sessions: number;
  /**
   * Weight applied per full Spiralogic phase elapsed since entry creation.
   * Reduces routing influence as developmental distance grows.
   * Range 0–1 (0 = no decay, 1 = full decay per phase).
   */
  phase_proximity_weight: number;
  /** Current routing influence (0–1), reduced by decay logic over time */
  current_routing_weight: number;
  last_decay_applied: Date;
}

// ─── Member annotations ───────────────────────────────────────────────────────

/**
 * How the member responds to a surfaced interpretation.
 *
 * Each type represents a distinct relational response with different epistemic weight:
 *   resonates          → positive recognition; increases routing influence slightly
 *   does_not_resonate  → decline; reduces routing influence, moves to held_lightly
 *   not_now            → timing feedback only; suppresses near-term surfacing
 *   add_context        → member extends the meaning in their own words (pure annotation)
 *   clear_influence    → removes active routing influence; evidence remains intact
 *
 * Design: annotation is a RESPONSE layer, not a correction layer.
 * The member meets the material consciously — they do not rewrite the system's record.
 */
export type AnnotationType =
  | 'resonates'
  | 'does_not_resonate'
  | 'not_now'
  | 'add_context'
  | 'clear_influence'
  // GATE 1 (founder ruling 2026-08-09): the member acts that confer routing
  // authority. 'confirm' — "yes, that's true of me". 'qualify' — "partly, but
  // it's more like…" (the member's words become the governing text). These are
  // the ONLY paths to routing_influence_weight > 0; recurrence, silence, and
  // confidence never promote (F4).
  | 'confirm'
  | 'qualify';

/**
 * The member's perspective on a ledger entry.
 * Stored alongside the system's observation — neither overwrites the other.
 * This is the co-authored layer: system holds its perception,
 * member holds their relationship to that perception.
 */
export interface MemberAnnotation {
  created_at: Date;
  /** The member's text — a note, context, or statement. May be empty for action-only responses. */
  annotation: string;
  annotation_type: AnnotationType;
}

// ─── Accumulating hypothesis ──────────────────────────────────────────────────

/**
 * An interpretation in progress.
 *
 * The accumulating buffer is the pre-ledger holding space.
 * Hypotheses here are provisional — they cannot be surfaced to the member,
 * their routing influence is minimal, and they carry no developmental weight
 * until promoted to the ledger.
 *
 * Key invariants:
 *   - evidence_events are immutable once written
 *   - original_language is archival only (never used for routing/promotion)
 *   - contradicting_evidence does not delete the hypothesis; it reduces confidence
 *   - parent_hypothesis_id supports interpretive lineage (refinement, not replacement)
 */
export interface AccumulatingHypothesis {
  id: string;
  member_id: string;
  created_at: Date;
  last_updated: Date;

  /** Developmental context when first observed */
  phase_at_creation: SpiralogicPhase;
  element_at_creation: Element;

  /** Source — for audit */
  originating_agent: string;
  originating_model: string;
  /** Pre-normalization model language. Archival only — never drives routing. */
  original_language: string;

  /** OS-normalized — these are the operational fields */
  observation_summary: string;
  candidate_interpretation: string;
  interpretation_type: InterpretationType;
  target_store: TargetStore;

  /** The primary record. Evidence events are immutable. */
  evidence_events: HypothesisEvidenceEvent[];

  /** Does not delete — reduces structural_confidence */
  contradicting_evidence: ContradictionEvent[];

  /** Derived from evidence_events */
  recurrence_count: number;
  /** Distinct context types (domain + element combinations) */
  context_types_seen: string[];
  cross_context_count: number;

  confidence: ConfidenceProfile;
  gate_status: GateStatus;

  /** What would weaken or falsify this interpretation */
  contradiction_conditions: string[];
  /** What developmental shift makes this interpretation irrelevant */
  decay_conditions: string[];

  status: HypothesisStatus;

  /**
   * Lineage: if this hypothesis is a refinement of an earlier one.
   * e.g. 'visibility tension' → 'visibility tension in professional contexts'
   * The parent is not replaced — both records persist.
   */
  parent_hypothesis_id: string | null;

  /**
   * How strongly this hypothesis currently influences routing (0–1).
   * Reduced to near-zero after surfacing declines.
   * Minimal (not zero) during accumulation — hypotheses may lightly
   * inform attunement before promotion.
   */
  routing_influence_weight: number;

  /** Not eligible for surfacing until promoted to ledger */
  surfacing_eligible: false;
}

// ─── Interpretive ledger entry ────────────────────────────────────────────────

/**
 * A durable interpretation that has passed all gates.
 *
 * Properties:
 *   - Sparse: only recurrent, cross-context, developmentally relevant patterns
 *   - Structured: normalized schema, not free-form text
 *   - Falsifiable: contradiction conditions required for admission
 *   - Revisable: confidence decays; annotations layer alongside
 *   - Legible: member can see, annotate, and revoke influence
 */
export interface InterpretiveLedgerEntry {
  id: string;
  member_id: string;

  /** Lineage back to the buffer hypothesis that was promoted */
  promoted_from_hypothesis_id: string;

  created_at: Date;
  promoted_at: Date;
  last_updated: Date;

  phase_at_creation: SpiralogicPhase;
  element_at_creation: Element;

  /** OS-normalized interpretation */
  observation_summary: string;
  interpretation: string;
  interpretation_type: InterpretationType;

  /** Human-readable summary of evidence basis — normalized for consistency */
  evidence_summary: string;
  evidence_event_count: number;
  cross_context_count: number;

  confidence: ConfidenceProfile;

  /** Current routing influence. Reduced by decay and member revocation. */
  routing_influence_weight: number;

  surfacing_status: LedgerSurfacingStatus;
  decay_schedule: DecaySchedule;
  falsifiability: FalsifiabilityAnchor;

  /** Member's annotations — neither overwrites the system's observation */
  member_annotations: MemberAnnotation[];

  /**
   * Lineage: if this entry evolved from an earlier ledger entry.
   * The parent entry is marked 'superseded', not deleted.
   */
  parent_ledger_entry_id: string | null;

  status: LedgerEntryStatus;
}

// ─── Gate evaluation I/O ─────────────────────────────────────────────────────

export interface GateEvaluationInput {
  hypothesis: AccumulatingHypothesis;
  thresholds: GateThresholds;
  /** Current developmental position — used for phase-proximity checks */
  current_phase: SpiralogicPhase;
  current_element: Element;
}

export type PromotionRecommendation =
  | 'promote'           // all gates passed, write to target store
  | 'hold'              // gates not yet passed, continue accumulating
  | 'discard'           // unrecoverable failure (incoherent, zero signal)
  | 're_evaluate_later'; // borderline — revisit at next phase threshold

export interface GateEvaluationResult {
  hypothesis_id: string;
  gate_status: GateStatus;
  confidence: ConfidenceProfile;

  /** Passes all formal gate criteria */
  promotion_eligible: boolean;
  /**
   * Eligible AND OS judges this interpretation useful for continuity.
   * Eligible ∩ Worthy = promote. Eligible ∩ ¬Worthy = hold for more evidence.
   */
  promotion_worthy: boolean;

  /** Inactivity or developmental irrelevance warrants expiry */
  expiry_recommended: boolean;

  recommendation: PromotionRecommendation;
  /** Human-readable explanation of the decision */
  reason: string;

  evaluated_at: Date;
}

// ─── Ledger query / read interfaces ──────────────────────────────────────────

export interface LedgerReadOptions {
  member_id: string;
  /** If true, include declined / held-lightly entries */
  include_inactive?: boolean;
  /** Filter to a specific interpretation type */
  interpretation_type?: InterpretationType;
  /** Filter to entries above this routing influence floor */
  min_routing_weight?: number;
  /** Maximum entries to return (default: all active) */
  limit?: number;
}

/**
 * What the routing layer consumes — a lean summary of active ledger entries
 * sufficient for routing decisions without loading full evidence chains.
 */
export interface LedgerRoutingView {
  entry_id: string;
  interpretation: string;
  interpretation_type: InterpretationType;
  routing_influence_weight: number;
  surfacing_status: LedgerSurfacingStatus;
  phase_at_creation: SpiralogicPhase;
  element_at_creation: Element;
  confidence_composite: number;
}

// ─── Store-specific thresholds ────────────────────────────────────────────────

/**
 * Each store has its own gate thresholds and decay properties,
 * reflecting different update semantics.
 *
 *   interpretive_ledger     — heaviest gates, slowest decay (climate)
 *   state_store             — lighter gates, faster decay (weather)
 *   relational_calibration  — lightest gates, direct user edit allowed
 */
export interface StoreThresholds {
  interpretive_ledger: GateThresholds;
  state_store: Partial<GateThresholds>;         // overrides DEFAULT_GATE_THRESHOLDS
  relational_calibration: Partial<GateThresholds>;
}

export const DEFAULT_STORE_THRESHOLDS: StoreThresholds = {
  interpretive_ledger: DEFAULT_GATE_THRESHOLDS,
  state_store: {
    min_recurrence: 1,               // current position, updates faster
    min_composite_confidence: 0.30,
  },
  relational_calibration: {
    min_recurrence: 1,               // one clear preference signal is enough
    min_composite_confidence: 0.25,
  },
};
