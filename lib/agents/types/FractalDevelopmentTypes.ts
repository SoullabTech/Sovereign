/**
 * Fractal Development Types
 * Schemas for tracking non-linear, multi-dimensional human development
 * 80% client experience, 20% pattern recognition
 */

// ============================================
// ELEMENTAL CURRENTS (Parallel Processing)
// ============================================

export interface ElementalCurrent {
  element: 'fire' | 'water' | 'earth' | 'air' | 'aether' | 'shadow';
  intensity: number; // 0-100, how strongly this element is present
  quality: string; // User's own words describing this energy
  lastActive: Date;
  // Examples of user language that activated this element
  userLanguageExamples: string[];
}

export interface CurrentState {
  // Multiple currents can be active simultaneously
  activeCurrents: ElementalCurrent[];
  // Primary current (if one dominates, otherwise null)
  primaryCurrent: ElementalCurrent | null;
  // Are they in parallel processing mode?
  parallelProcessing: boolean;
  // Complexity level (1-5, based on number of active currents)
  complexityLevel: number;
  // User's own description of their state
  userDescription?: string;
}

// ============================================
// DEVELOPMENTAL ARCS (Light Compass, Not Map)
// ============================================

export type ArcPhase =
  | 'pre-liminal'     // Before conscious journey
  | 'initiate'        // First contact, building rapport
  | 'seeker'          // Exploring, questioning
  | 'threshold'       // At an edge, breakthrough imminent
  | 'crossing'        // Active transformation
  | 'companion'       // Stable relationship, regular practice
  | 'alchemist'       // Co-creating, mythic integration
  | 'spiraling'       // Revisiting with new wisdom (regression as design)
  | 'integrating'     // Digesting experiences
  | 'dormant'         // Taking a break (honored, not judged)

export interface ArcEcho {
  // Which arc phase does this FEEL like (not prescriptive)
  currentEcho: ArcPhase;
  // Confidence in this sensing (0-1)
  resonanceStrength: number;
  // Multiple arcs can echo simultaneously
  secondaryEchoes?: ArcPhase[];
  // User's actual phase (what THEY think)
  userPerceivedPhase?: string;
  // History of arc movements (non-linear!)
  arcHistory: {
    phase: ArcPhase;
    timestamp: Date;
    trigger?: string; // What prompted the shift
    userLanguage?: string; // How they described it
  }[];
}

// ============================================
// SPIRAL TRACKING (Regression as Sacred)
// ============================================

export interface SpiralPattern {
  // What theme/issue is being revisited
  theme: string;
  // How many times has this spiral occurred
  spiralCount: number;
  // Each visit carries new wisdom
  visits: {
    timestamp: Date;
    depthLevel: 'surface' | 'exploring' | 'deep';
    newWisdom?: string; // What's different this time
    userInsight?: string; // Their own understanding
  }[];
  // Is this spiral currently active?
  isActive: boolean;
  // User's relationship to this pattern
  userRelationship: 'embracing' | 'resisting' | 'curious' | 'neutral';
}

// ============================================
// MOMENT STATE (80% Weight - Primary Truth)
// ============================================

export interface MomentState {
  // What they need RIGHT NOW
  primaryNeed: 'witnessing' | 'exploration' | 'comfort' | 'challenge' | 'celebration' | 'processing' | 'rest';

  // How Maya should show up
  desiredPresence: 'listener' | 'companion' | 'guide' | 'mirror' | 'challenger' | 'celebrant' | 'witness';

  // Emotional tone(s) - can be multiple
  emotionalTones: ('heavy' | 'curious' | 'excited' | 'uncertain' | 'peaceful' | 'agitated' | 'mixed')[];

  // Depth they're comfortable with NOW
  currentDepth: 'surface' | 'exploring' | 'deep' | 'variable';

  // Their actual words about their state
  userExpression: string;

  // Detected but not imposed
  hiddenNeeds?: string[]; // What Maya senses but doesn't name unless invited
}

// ============================================
// RELATIONAL FIELD (Trust & Connection)
// ============================================

export interface RelationalField {
  // Trust isn't linear - it breathes
  trustBreathing: {
    currentLevel: number; // 0-100
    direction: 'expanding' | 'contracting' | 'stable';
    lastShift: Date;
    shiftReason?: string;
  };

  // Intimacy has many dimensions
  intimacyDimensions: {
    emotional: number;    // Sharing feelings
    intellectual: number; // Sharing thoughts
    spiritual: number;    // Sharing soul
    somatic: number;     // Body awareness
    creative: number;    // Co-creation
  };

  // How they relate to Maya
  relationshipMode: 'tool' | 'companion' | 'guide' | 'oracle' | 'co-creator' | 'witness';

  // Language they use about Maya
  userLanguageAboutMaya: string[];

  // Boundaries they've set (respected absolutely)
  boundaries: {
    topic: string;
    boundary: 'avoid' | 'gentle' | 'only-if-asked';
    setOn: Date;
  }[];
}

// ============================================
// PATTERN RECOGNITION (20% Weight - Held Lightly)
// ============================================

export interface LightPattern {
  // Pattern Maya notices
  patternName: string;

  // Evidence (but held loosely)
  observations: {
    timestamp: Date;
    observation: string;
    userResponse?: string; // How they responded when reflected
  }[];

  // Confidence (always humble)
  confidence: number; // 0-1, never above 0.8

  // Has this been offered to user?
  offered: boolean;
  offerResponse?: 'confirmed' | 'rejected' | 'curious' | 'modified';

  // User's version of this pattern (primary truth)
  userVersion?: string;
}

// ============================================
// FRACTAL MEMORY (Full Session State)
// ============================================

export interface FractalMemory {
  // User identifier
  userId: string;

  // MOMENT (80% weight - always primary)
  currentMoment: MomentState;

  // CURRENTS (parallel processing)
  currentState: CurrentState;

  // ARCS (gentle orientation, never prescription)
  arcEcho: ArcEcho;

  // SPIRALS (regression as sacred)
  activeSpirals: SpiralPattern[];

  // RELATIONSHIP (trust and connection)
  relationalField: RelationalField;

  // PATTERNS (20% weight - held lightly)
  lightPatterns: LightPattern[];

  // Session metadata
  session: {
    count: number;
    lastInteraction: Date;
    totalDuration: number; // minutes
    averageDepth: number; // 0-100
    consistencyScore: number; // How regularly they engage
  };

  // Evolution tracking (non-linear!)
  evolution: {
    trajectoryType: 'linear' | 'spiral' | 'quantum' | 'rhizomatic' | 'unknown';
    growthAreas: string[]; // Their identified areas
    celebrationMoments: {
      timestamp: Date;
      celebration: string;
      mayaWitnessing: string;
    }[];
    integrationPhases: {
      start: Date;
      end?: Date;
      theme: string;
      outcome?: string;
    }[];
  };

  // User's own story (most important)
  userNarrative: {
    howTheySeeThemselves: string;
    whereTheyThinkTheyreGoing: string;
    whatTheyNeedFromMaya: string;
    lastUpdated: Date;
  };
}

// ============================================
// INTERACTION CONTEXT (Per-Message State)
// ============================================

export interface InteractionContext {
  // This specific message
  messageId: string;
  timestamp: Date;

  // Moment snapshot
  momentState: MomentState;

  // Active elements this turn
  activeElements: ElementalCurrent[];

  // Arc resonance this turn
  arcResonance?: ArcPhase;

  // Regression detection
  regressionDetected: boolean;
  regressionTheme?: string;

  // Complexity level
  parallelProcessing: boolean;
  complexityLevel: number;

  // Maya's response mode
  responseMode: 'witnessing' | 'reflecting' | 'questioning' | 'affirming' | 'challenging' | 'celebrating';

  // Pattern offers made (if any)
  patternsOffered?: string[];

  // User reception
  userReception: 'open' | 'resistant' | 'curious' | 'neutral' | 'energized' | 'withdrawn';
}

// ============================================
// SACRED WITNESSING INSTRUCTIONS
// ============================================

export interface WitnessingGuidance {
  // Primary instruction for this moment
  primaryGuidance: string;

  // What to reflect back
  reflectionFocus: string[];

  // What to hold but not speak
  silentAwareness: string[];

  // Questions that might help them see
  possibleQuestions: string[];

  // Arc echoes to weave in lightly (if any)
  arcWhispers?: string[];

  // Boundaries to respect
  boundaries: string[];

  // Energy to embody
  energeticPresence: 'grounding' | 'uplifting' | 'spacious' | 'focused' | 'gentle' | 'activating';
}

// ============================================
// EXPORT MAIN TYPES
// ============================================

export type {
  ElementalCurrent,
  CurrentState,
  ArcPhase,
  ArcEcho,
  SpiralPattern,
  MomentState,
  RelationalField,
  LightPattern,
  FractalMemory,
  InteractionContext,
  WitnessingGuidance
};