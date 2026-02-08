/**
 * MAIA State Vector Type System
 *
 * The core data structure capturing a member's consciousness state at any moment.
 * This is a descriptive instrument, not a diagnostic one. It observes without prescribing.
 *
 * Design principles:
 *   - Grounded in the 12-facet Spiralogic model (fire/water/earth/air) plus aether
 *   - Extends existing StateIndicators from consciousness-state-detector.ts
 *   - Supports mixed states (grieving AND furious, clarity AND confusion)
 *   - Never collapses human complexity into a single score
 *   - Holds paradox: polarity, intensity, and stability are independent axes
 *
 * Canon alignment:
 *   - No engagement or retention metrics (Canon II.5)
 *   - No convergence optimization (Canon II.2)
 *   - No outcome framing -- the vector describes, it does not direct (Canon II.9)
 *   - States are not ranked -- survival is not "lower" than unified (Canon II.1)
 */

// ════════════════════════════════════════════════════════════════════════════
// FOUNDATIONAL TYPES
// ════════════════════════════════════════════════════════════════════════════

/**
 * The five elements of the Spiralogic framework.
 * Extends the 4-element type from SpiralogicDataModel.ts to include aether.
 */
export type Element = 'earth' | 'water' | 'fire' | 'air' | 'aether';

/**
 * The four base elements (without aether) for compatibility with
 * SpiralogicDataModel.ts which uses the 12-facet system across four elements.
 */
export type BaseElement = 'earth' | 'water' | 'fire' | 'air';

/**
 * Spiralogic facet codes from the 12-facet holoflower.
 * Each element has three facets progressing through vector, circle, spiral phases.
 *
 * Fire:  FEU (Self-Awareness), VUNV (Self-In-World), ZECH (Transcendent Self)
 * Water: IEVE (Emotional Intelligence), AGHT (Inner Transformation), NEINE (Deep Self-Awareness)
 * Earth: CHEN (Purpose & Mission), ALVE (Resources & Plans), ZWOIF (Refined Medicine)
 * Air:   AIN (Interpersonal), ZWEI (Collective Dynamics), AIRE (Codified Systems)
 */
export type FacetCode =
  | 'FEU' | 'VUNV' | 'ZECH'       // fire
  | 'IEVE' | 'AGHT' | 'NEINE'     // water
  | 'CHEN' | 'ALVE' | 'ZWOIF'     // earth
  | 'AIN' | 'ZWEI' | 'AIRE';      // air

/**
 * Aether qualities. Aether does not have named facets in the 12-facet model;
 * it manifests as integration qualities across all elements.
 */
export type AetherQuality =
  | 'witnessing'     // Observer consciousness, non-attachment
  | 'paradox'        // Holding contradictions without resolving them
  | 'integration'    // Weaving multiple elements into coherence
  | 'dissolution'    // Releasing fixed identity or pattern
  | 'stillness';     // Spacious presence, the pause before form

/**
 * The facet dimension of the state vector.
 * For base elements, references one of the 12 Spiralogic facets.
 * For aether, references a quality since aether has no numbered facets.
 */
export type Facet =
  | { type: 'spiralogic'; code: FacetCode }
  | { type: 'aether'; quality: AetherQuality };

/**
 * Phase within the elemental cycle.
 * Aligns with SpiralogicDataModel's Phase type (vector/circle/spiral)
 * but expressed as experiential states rather than structural positions.
 */
export type CyclePhase = 'entering' | 'in' | 'exiting';

/** Intensity of emotional or energetic charge. */
export type Intensity = 'low' | 'medium' | 'high';

/** How the state was captured. */
export type StateVectorSource =
  | 'checkin'            // Member initiated a check-in
  | 'conversation'       // Derived from ongoing conversation
  | 'auto-detected'      // System observed a shift without explicit input
  | 'voice-analysis'     // Derived from voice/speech patterns
  | 'journal';           // Derived from journal entry

// ════════════════════════════════════════════════════════════════════════════
// THE ELEMENTAL READING
// ════════════════════════════════════════════════════════════════════════════

/**
 * A single elemental reading within the state vector.
 * The state vector carries a primary and optional secondary reading
 * because humans are rarely in a single element.
 *
 * Example: "I am grieving and also furious" -> primary: water, secondary: fire
 */
export interface ElementalReading {
  /** Which element is active */
  element: Element;

  /** The specific facet active within that element (optional until we have strong signals) */
  facet?: Facet;

  /** Phase within the elemental cycle (optional without history) */
  phase?: CyclePhase;

  /** Emotional/energetic charge level */
  intensity: Intensity;

  /**
   * Polarity: contractive (1) to expansive (5).
   *   1 = deeply contracted, withdrawn, collapsed inward
   *   2 = somewhat contracted, cautious, held
   *   3 = neutral, balanced, neither pushing nor pulling
   *   4 = somewhat expansive, opening, reaching
   *   5 = fully expansive, radiating, wide open
   */
  polarity: 1 | 2 | 3 | 4 | 5;

  /**
   * Stability: settled (1) to volatile (5).
   *   1 = deeply settled, grounded, steady
   *   2 = mostly stable with minor fluctuations
   *   3 = moderate movement, responsive but not reactive
   *   4 = unsettled, shifting, somewhat reactive
   *   5 = volatile, rapid shifts, highly reactive
   */
  stability: 1 | 2 | 3 | 4 | 5;
}

// ════════════════════════════════════════════════════════════════════════════
// MOVEMENT -- WHAT IS ARRIVING AND DEPARTING
// ════════════════════════════════════════════════════════════════════════════

/**
 * Movement captures what is emerging versus receding in the member's field.
 * Essential for MAIA's response -- meeting someone where they are headed,
 * not where they have been.
 */
export interface StateMovement {
  /** Element(s) gaining strength */
  entering: Element[];

  /** Element(s) losing strength */
  exiting: Element[];

  /** Qualitative direction of the overall movement */
  trajectory: 'ascending' | 'descending' | 'circling' | 'spiraling' | 'still';

  /**
   * Speed of movement through the current transition.
   * 0.0 = frozen, no movement
   * 0.5 = gentle, natural pace
   * 1.0 = rapid, intense transition
   */
  velocity: number;
}

// ════════════════════════════════════════════════════════════════════════════
// KAIROS -- TEMPORAL QUALITY OF THE MOMENT
// ════════════════════════════════════════════════════════════════════════════

/**
 * Kairos captures the qualitative time-nature of the moment.
 * Not clock-time (chronos) but the character of the threshold.
 *
 * This directly informs how MAIA should hold space:
 *   - stable: maintain, do not push
 *   - transition: support movement, name what is shifting
 *   - threshold: hold with care, the moment is charged with potential
 *   - integration: help weave, connect threads, consolidate
 *   - collapse-risk: ground, simplify, do not add complexity
 */
export type KairosAssessment =
  | 'stable'
  | 'transition'
  | 'threshold'
  | 'integration'
  | 'collapse-risk';

export interface Kairos {
  assessment: KairosAssessment;

  /**
   * Confidence in this kairos reading (0.0 to 1.0).
   * Low confidence makes MAIA more tentative, not more assertive.
   */
  confidence: number;

  /** What is at stake in this moment, in plain language. */
  description?: string;
}

// ════════════════════════════════════════════════════════════════════════════
// EVIDENCE -- HOW WE KNOW WHAT WE KNOW
// ════════════════════════════════════════════════════════════════════════════

export type EvidenceCategory =
  | 'linguistic'     // Word choice, syntax, metaphor
  | 'relational'     // How they position self relative to others
  | 'somatic'        // Body references, energy, physical state
  | 'temporal'       // Time orientation (past/present/future)
  | 'behavioral'     // Patterns of action, avoidance, engagement
  | 'affective'      // Emotional tone, valence, arousal
  | 'cognitive';     // Thought patterns, complexity, coherence

/**
 * A single piece of evidence supporting the state vector.
 * Evidence is always transparent -- MAIA can explain why she reads the field as she does.
 */
export interface Evidence {
  category: EvidenceCategory;
  /** The actual observed signal, quoted or described */
  signal: string;
  /** 1 = faint/suggestive, 2 = clear/present, 3 = strong/dominant */
  strength: 1 | 2 | 3;
  /** Which dimension(s) this evidence informs */
  informs: Array<'element' | 'facet' | 'phase' | 'polarity' | 'intensity' | 'stability' | 'kairos' | 'movement'>;
}

export interface EvidenceModel {
  observations: Evidence[];

  /**
   * Contradictions are not errors -- they indicate paradox, mixed states,
   * or moments where the person holds multiple truths simultaneously.
   */
  contradictions: Array<{
    evidenceA: Evidence;
    evidenceB: Evidence;
    interpretation: string;
  }>;

  /**
   * What the evidence does NOT tell us.
   * Naming the gaps is an act of epistemic honesty.
   */
  gaps: EvidenceCategory[];
}

// ════════════════════════════════════════════════════════════════════════════
// THE STATE VECTOR
// ════════════════════════════════════════════════════════════════════════════

/**
 * The complete State Vector.
 *
 * Designed against real check-ins:
 *
 * "I am grieving and also furious"
 *   -> primary: water/high/2, secondary: fire/high/2, kairos: threshold
 *
 * "So good! The fire is back now that we are back online"
 *   -> primary: fire/high/5, kairos: stable
 *
 * "I think of 5 million things... I say fuck it"
 *   -> primary: air/high/4/volatile, movement: entering earth, exiting air
 *   -> kairos: collapse-risk
 *
 * "How do I trust myself when I am still figuring out who I even am?"
 *   -> primary: water/medium/3, secondary: air/medium/3, kairos: transition
 */
export interface StateVector {
  // ── Identity & Metadata ──────────────────────────────────────────────
  id: string;
  memberId: string;
  timestamp: Date;
  source: StateVectorSource;
  sessionId?: string;

  // ── Elemental Readings ───────────────────────────────────────────────
  primary: ElementalReading;
  secondary?: ElementalReading;

  // ── Confidence ───────────────────────────────────────────────────────
  /**
   * Overall confidence in this reading (0.0 to 1.0).
   * Low confidence is valuable information: "signals are ambiguous, hold lightly."
   */
  confidence: number;

  // ── Movement ─────────────────────────────────────────────────────────
  movement: StateMovement;

  // ── Kairos ───────────────────────────────────────────────────────────
  kairos: Kairos;

  // ── Evidence ─────────────────────────────────────────────────────────
  evidence: EvidenceModel;
}

// ════════════════════════════════════════════════════════════════════════════
// STATE VECTOR DELTA -- TRACKING CHANGE BETWEEN READINGS
// ════════════════════════════════════════════════════════════════════════════

export interface StateVectorDelta {
  from: StateVector;
  to: StateVector;
  elapsed: number; // milliseconds
  shifts: {
    elementShift: boolean;
    polarityDelta: number;
    stabilityDelta: number;
    intensityChanged: boolean;
    kairosShift: boolean;
    phaseShift: boolean;
  };
  /** 0.0 (no change) to 1.0 (fundamental shift) */
  significance: number;
}

// ════════════════════════════════════════════════════════════════════════════
// DATABASE ROW TYPE -- FLATTENED FOR POSTGRESQL
// ════════════════════════════════════════════════════════════════════════════

export interface StateVectorRow {
  id: string;
  member_id: string;
  session_id: string | null;
  source: StateVectorSource;

  // Indexed scalar columns for query performance
  primary_element: Element;
  primary_facet_code: string | null;
  primary_phase: CyclePhase | null;
  primary_intensity: Intensity;
  primary_polarity: number;
  primary_stability: number;
  confidence: number;

  // Secondary (nullable)
  secondary_element: Element | null;

  // Kairos
  kairos_assessment: KairosAssessment;
  kairos_confidence: number;
  kairos_description: string | null;

  // JSONB columns for nested data
  secondary_reading: ElementalReading | null;
  movement: StateMovement;
  evidence: EvidenceModel;

  // Raw input that produced this vector
  raw_text: string | null;

  created_at: Date;
}

// ════════════════════════════════════════════════════════════════════════════
// CONSTANTS AND GUARDS
// ════════════════════════════════════════════════════════════════════════════

export const ELEMENTS: readonly Element[] = ['earth', 'water', 'fire', 'air', 'aether'] as const;
export const BASE_ELEMENTS: readonly BaseElement[] = ['earth', 'water', 'fire', 'air'] as const;

export const FACET_CODES: readonly FacetCode[] = [
  'FEU', 'VUNV', 'ZECH',
  'IEVE', 'AGHT', 'NEINE',
  'CHEN', 'ALVE', 'ZWOIF',
  'AIN', 'ZWEI', 'AIRE'
] as const;

export const AETHER_QUALITIES: readonly AetherQuality[] = [
  'witnessing', 'paradox', 'integration', 'dissolution', 'stillness'
] as const;

export const FACET_TO_ELEMENT: Record<FacetCode, BaseElement> = {
  FEU: 'fire', VUNV: 'fire', ZECH: 'fire',
  IEVE: 'water', AGHT: 'water', NEINE: 'water',
  CHEN: 'earth', ALVE: 'earth', ZWOIF: 'earth',
  AIN: 'air', ZWEI: 'air', AIRE: 'air'
};

export const FACET_POSITION: Record<FacetCode, 1 | 2 | 3> = {
  FEU: 1, VUNV: 2, ZECH: 3,
  IEVE: 1, AGHT: 2, NEINE: 3,
  CHEN: 1, ALVE: 2, ZWOIF: 3,
  AIN: 1, ZWEI: 2, AIRE: 3
};

export const POLARITY_LABELS: Record<1 | 2 | 3 | 4 | 5, string> = {
  1: 'deeply contractive',
  2: 'somewhat contractive',
  3: 'neutral',
  4: 'somewhat expansive',
  5: 'fully expansive'
};

export const STABILITY_LABELS: Record<1 | 2 | 3 | 4 | 5, string> = {
  1: 'deeply settled',
  2: 'mostly stable',
  3: 'moderate movement',
  4: 'unsettled',
  5: 'volatile'
};

export const KAIROS_LABELS: Record<KairosAssessment, string> = {
  'stable': 'Settled ground. Maintain presence without pushing.',
  'transition': 'Something is shifting. Support the movement, name what is changing.',
  'threshold': 'A charged moment. Hold with care. Potential is present.',
  'integration': 'Threads are weaving together. Help consolidate what has been learned.',
  'collapse-risk': 'Overwhelm is near. Ground, simplify, do not add complexity.'
};

// ── Type Guards ──────────────────────────────────────────────────────────

export function isElement(value: string): value is Element {
  return (ELEMENTS as readonly string[]).includes(value);
}

export function isFacetCode(value: string): value is FacetCode {
  return (FACET_CODES as readonly string[]).includes(value);
}

export function isKairosAssessment(value: string): value is KairosAssessment {
  return ['stable', 'transition', 'threshold', 'integration', 'collapse-risk'].includes(value);
}

export function isIntensity(value: string): value is Intensity {
  return ['low', 'medium', 'high'].includes(value);
}
