/**
 * ElementalFramework
 *
 * Core elemental system structure representing earth/water/air/fire logic.
 * Central to MAIA's archetypal processing and resonance tracking.
 *
 * Related to Spiralogic elemental agents (AetherAgent, EarthAgent, WaterAgent,
 * AirAgent, FireAgent) and alchemical consciousness processing.
 *
 * @phase Phase 4.2B Step 5 - Interface Expansion
 * @status Minimal stub - comprehensive fields pending Phase 4.2C
 */

/**
 * Individual element type
 */
export type Element = 'earth' | 'water' | 'air' | 'fire' | 'aether';

/**
 * Elemental distribution across four classical elements
 * Values typically range 0-1 representing relative presence/activation
 */
export interface ElementalDistribution {
  /** Earth: Grounding, stability, material manifestation */
  earth: number;

  /** Water: Emotion, flow, intuition, depth */
  water: number;

  /** Air: Thought, communication, clarity, perspective */
  air: number;

  /** Fire: Will, transformation, passion, energy */
  fire: number;

  /** Aether (quintessence): Integration, transcendence, consciousness itself */
  aether?: number;
}

/**
 * Elemental resonance pattern
 * Describes how elements interact and harmonize
 */
export interface ElementalResonance {
  /** Overall resonance level (0-1 scale) */
  level: number;

  /** Dominant harmonic (which element pair is most resonant) */
  dominant_harmonic?: `${Element}-${Element}`;

  /** Dissonance indicators (which elements are in tension) */
  tensions?: Array<`${Element}-${Element}`>;
}

/**
 * Main ElementalFramework interface
 */
export interface ElementalFramework {
  /** Unique identifier for this framework instance */
  id: string;

  /** Elemental distribution across elements */
  elements: ElementalDistribution;

  /**
   * Overall elemental balance metric (0-1 scale)
   * where 1 = perfect balance, 0 = severe imbalance
   */
  balance: number;

  /**
   * Resonance pattern across elements
   * Measures how well elements work together
   */
  resonance: ElementalResonance | number; // number for simple scalar, object for detailed

  /**
   * Dominant element (highest value in distribution)
   */
  dominant_element: Element;

  /**
   * Secondary element (second highest value)
   */
  secondary_element?: Element;

  /** Optional timestamp for tracking evolution */
  timestamp?: Date;

  /** Optional metadata for framework customization */
  metadata?: Record<string, any>;

  // TODO(phase4.2c): Add comprehensive fields:
  // - elemental_agents: { earth: Agent, water: Agent, air: Agent, fire: Agent, aether: Agent }
  // - transition_dynamics: TransitionMatrix (how elements shift over time)
  // - archetypal_mappings: ArchetypeMap (link to Jungian archetypes)
  // - alchemical_phase: 'nigredo' | 'albedo' | 'citrinitas' | 'rubedo'
  // - zodiac_correspondence: AstrologicalMapping
  // - seasonal_attunement: SeasonalInfluence
}

/**
 * Helper type for elemental balance assessment
 */
export interface ElementalBalanceAssessment {
  framework: ElementalFramework;
  is_balanced: boolean;
  imbalance_severity: 'none' | 'mild' | 'moderate' | 'severe';
  recommendations: string[];
}
