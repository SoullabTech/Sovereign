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

  // === Elemental Agents & Intelligence (Phase 4.2C expansion) ===

  /**
   * Elemental agent activation states
   * Each element has an autonomous agent that can be activated
   */
  elemental_agents?: {
    earth?: { active: boolean; intensity: number; last_activation?: Date };
    water?: { active: boolean; intensity: number; last_activation?: Date };
    air?: { active: boolean; intensity: number; last_activation?: Date };
    fire?: { active: boolean; intensity: number; last_activation?: Date };
    aether?: { active: boolean; intensity: number; last_activation?: Date };
  };

  /**
   * Collective elemental balance metric
   * Overall harmony across all active elements
   */
  collectiveElementalBalance?: number;

  /**
   * Elemental coherence (0-1 scale)
   * How well elements are working together vs. conflicting
   */
  elemental_coherence?: number;

  // === Transition Dynamics ===

  /**
   * Elemental transition matrix
   * Probabilities or rates of shift between elemental states
   */
  transition_dynamics?: {
    earth_to_water?: number;
    earth_to_air?: number;
    earth_to_fire?: number;
    water_to_earth?: number;
    water_to_air?: number;
    water_to_fire?: number;
    air_to_earth?: number;
    air_to_water?: number;
    air_to_fire?: number;
    fire_to_earth?: number;
    fire_to_water?: number;
    fire_to_air?: number;
  };

  /**
   * Current elemental momentum
   * Which direction the elemental system is moving
   */
  elemental_momentum?: {
    direction?: Element;
    magnitude?: number;
  };

  /**
   * Elemental stability (0-1 scale)
   * How stable vs. volatile the elemental distribution is
   */
  elemental_stability?: number;

  /**
   * Recent elemental transitions
   * History of shifts between elements
   */
  transition_history?: Array<{
    from: Element;
    to: Element;
    timestamp: Date;
    trigger?: string;
  }>;

  // === Archetypal Mappings ===

  /**
   * Jungian archetype correspondences
   * How elements map to archetypal patterns
   */
  archetypal_mappings?: {
    earth?: string[];  // e.g., ['Mother', 'Builder', 'Senex']
    water?: string[];  // e.g., ['Lover', 'Healer', 'Mystic']
    air?: string[];    // e.g., ['Sage', 'Trickster', 'Messenger']
    fire?: string[];   // e.g., ['Warrior', 'Creator', 'Transformer']
    aether?: string[]; // e.g., ['Self', 'Magician', 'Shaman']
  };

  /**
   * Active archetypal constellation via elements
   * Which archetypes are currently activated through elemental lens
   */
  active_archetype_elements?: string[];

  // === Alchemical Process ===

  /**
   * Current alchemical phase
   * Stage in the transformation process
   */
  alchemical_phase?: 'nigredo' | 'albedo' | 'citrinitas' | 'rubedo' | 'peacock tail' | 'conjunction';

  /**
   * Alchemical operation active
   * Specific transformative process underway
   */
  alchemical_operation?: 'calcination' | 'dissolution' | 'separation' | 'conjunction' | 'fermentation' | 'distillation' | 'coagulation';

  /**
   * Philosopher's stone proximity (0-1 scale)
   * Progress toward alchemical wholeness/integration
   */
  philosophers_stone_proximity?: number;

  /**
   * Prima materia recognition
   * Awareness of the base material for transformation
   */
  prima_materia_identified?: boolean;

  /**
   * Solve et coagula balance
   * Balance between dissolution and solidification
   */
  solve_et_coagula?: {
    solve?: number;  // Dissolution tendency
    coagula?: number; // Solidification tendency
    balance?: number; // Harmony between the two
  };

  // === Astrological Correspondences ===

  /**
   * Zodiac element correspondence
   * How current elemental state maps to astrological elements
   */
  zodiac_correspondence?: {
    fire_signs?: number;   // Aries, Leo, Sagittarius resonance
    earth_signs?: number;  // Taurus, Virgo, Capricorn resonance
    air_signs?: number;    // Gemini, Libra, Aquarius resonance
    water_signs?: number;  // Cancer, Scorpio, Pisces resonance
  };

  /**
   * Planetary influences on elemental state
   * How celestial bodies affect elemental distribution
   */
  planetary_influences?: {
    sun?: number;      // Fire/vitality
    moon?: number;     // Water/emotion
    mercury?: number;  // Air/communication
    venus?: number;    // Earth/beauty
    mars?: number;     // Fire/will
    jupiter?: number;  // Fire/expansion
    saturn?: number;   // Earth/structure
  };

  /**
   * Current astrological season influence
   * How zodiac season affects elements
   */
  astrological_season_effect?: number;

  // === Seasonal & Natural Attunement ===

  /**
   * Seasonal attunement
   * How elements align with natural seasons
   */
  seasonal_attunement?: {
    spring?: number;  // Air/renewal
    summer?: number;  // Fire/expansion
    autumn?: number;  // Earth/harvest
    winter?: number;  // Water/depth
  };

  /**
   * Current season emphasis
   * Which season most influences elemental state
   */
  dominant_season?: 'spring' | 'summer' | 'autumn' | 'winter';

  /**
   * Natural cycles synchronization (0-1 scale)
   * Alignment with day/night, lunar, seasonal cycles
   */
  natural_cycles_sync?: number;

  /**
   * Circadian elemental rhythm
   * How elements shift through day/night cycle
   */
  circadian_pattern?: {
    dawn?: Element;     // Typical dominant element at dawn
    midday?: Element;   // Noon element
    dusk?: Element;     // Evening element
    midnight?: Element; // Night element
  };

  // === Elemental Practices & Cultivation ===

  /**
   * Active elemental practices
   * Practices being used to cultivate or balance elements
   */
  active_practices?: string[];

  /**
   * Elemental deficiency indicators
   * Which elements need strengthening
   */
  deficient_elements?: Element[];

  /**
   * Elemental excess indicators
   * Which elements need tempering
   */
  excessive_elements?: Element[];

  /**
   * Elemental prescriptions
   * Recommended practices to restore balance
   */
  prescriptions?: Array<{
    element: Element;
    practice: string;
    priority: 'high' | 'medium' | 'low';
  }>;

  // === Relational & Field Dynamics ===

  /**
   * Hemisphere bias
   * Tendency toward left (air/fire) vs. right (earth/water) brain
   */
  hemisphereBias?: 'left' | 'right' | 'balanced';

  /**
   * Elemental field strength (0-1 scale)
   * How strongly the elemental framework influences consciousness
   */
  field_strength?: number;

  /**
   * Elemental entanglement
   * Connections between this framework and others
   */
  entanglement?: Array<{
    framework_id: string;
    entanglement_strength: number;
    shared_elements: Element[];
  }>;

  /**
   * Collective field contribution
   * How this framework participates in larger elemental field
   */
  collective_contribution?: {
    earth?: number;
    water?: number;
    air?: number;
    fire?: number;
    aether?: number;
  };

  // === Integration & Wholeness ===

  /**
   * Quintessence activation (0-1 scale)
   * Degree to which the fifth element (aether/spirit) is active
   */
  quintessence_activation?: number;

  /**
   * Elemental mandala completeness (0-1 scale)
   * Wholeness of elemental configuration
   */
  mandala_completeness?: number;

  /**
   * Elemental wisdom accessed
   * Insights gained from elemental work
   */
  wisdom_insights?: string[];

  /**
   * Integration milestones
   * Significant achievements in elemental balancing
   */
  integration_milestones?: Array<{
    date: Date;
    description: string;
    elements_involved: Element[];
  }>;
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
