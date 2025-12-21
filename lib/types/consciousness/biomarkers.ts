/**
 * Consciousness Biomarkers - Canonical Type Definitions
 *
 * This file defines comprehensive biomarker types for tracking multi-dimensional
 * consciousness development across 13 therapeutic and psychological frameworks.
 *
 * Frameworks integrated:
 * 1. Alchemical Psychology (Jung, Hillman)
 * 2. Somatic Psychology (embodiment, sensation)
 * 3. Polyvagal Theory (Porges)
 * 4. Internal Family Systems (Schwartz)
 * 5. Hemispheric Integration (McGilchrist)
 * 6. Gestalt Therapy (Perls)
 * 7. Jungian Psychology (individuation)
 * 8. Phenomenology (Husserl, Merleau-Ponty)
 * 9. Dialogical Self Theory (Hermans)
 * 10. ACT (Hayes)
 * 11. Systemic Constellation Work (Hellinger)
 * 12. Spiralogic (12-phase elemental system)
 * 13. Transformation Tracking (multi-dimensional)
 *
 * Part of Phase 4.2D - Consciousness Biomarkers Integration
 * Source: /Users/soullab/MAIA-PAI-SOVEREIGN/lib/types/consciousness-biomarkers.ts
 * Integrated: 2025-12-21
 * Attribution: Kelly Soullab (Claude Code Agent)
 */

import type { ConsciousnessProfile } from '@/lib/types/cognitive/ConsciousnessProfile';
import type { ElementType } from '@/lib/types/soullab-metadata';

// ═══════════════════════════════════════════════════════════════════════════════
// ALCHEMICAL STAGE TRACKING
// ═══════════════════════════════════════════════════════════════════════════════

export type AlchemicalPhase =
  | 'calcination'     // Fire: Burning away the old
  | 'dissolution'     // Water: Emotional liquefaction
  | 'separation'      // Air: Distinguishing essence from dross
  | 'conjunction'     // Earth: Bringing opposites together
  | 'fermentation'    // Aether: Spiritual inspiration
  | 'distillation'    // Refinement: Purifying the essence
  | 'coagulation';    // Integration: New form emerges

export interface AlchemicalStage {
  currentPhase: AlchemicalPhase;
  element: ElementType;
  intensity: number; // 0-1
  completionPercentage: number; // 0-100
  nextPhase?: AlchemicalPhase;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SOMATIC & EMBODIED STATES
// ═══════════════════════════════════════════════════════════════════════════════

export type SomaticMarker =
  | 'grounded'
  | 'energized'
  | 'relaxed'
  | 'tense'
  | 'numb'
  | 'flowing'
  | 'contracted'
  | 'expanded';

export interface SomaticState {
  primaryMarker: SomaticMarker;
  bodyAwareness: number; // 0-1: How connected to body sensations
  energyLevel: number; // 0-1
  tension: Record<string, number>; // e.g., { shoulders: 0.7, jaw: 0.5 }
  breathPattern?: 'shallow' | 'deep' | 'rapid' | 'slow' | 'held';
}

// ═══════════════════════════════════════════════════════════════════════════════
// POLYVAGAL THEORY INTEGRATION
// ═══════════════════════════════════════════════════════════════════════════════

export type PolyvagalMode =
  | 'ventral-vagal'      // Social engagement, safety
  | 'sympathetic'        // Fight/flight activation
  | 'dorsal-vagal';      // Shutdown, freeze

export interface PolyvagalState {
  dominantMode: PolyvagalMode;
  safetySignal: number; // 0-1: Neuroception of safety
  socialEngagement: number; // 0-1: Capacity for connection
  mobilization: number; // 0-1: Sympathetic activation
  immobilization: number; // 0-1: Dorsal vagal activation
  coregulation?: boolean; // Is regulatory support available
}

// ═══════════════════════════════════════════════════════════════════════════════
// INTERNAL FAMILY SYSTEMS (IFS)
// ═══════════════════════════════════════════════════════════════════════════════

export type IFSPartType = 'manager' | 'firefighter' | 'exile';

export interface IFSPart {
  name: string;
  type: IFSPartType;
  role: string; // What this part does
  activation: number; // 0-1: How active right now
  burden?: string; // What this part carries
  needsUnburdening?: boolean;
}

export interface IFSParts {
  self: number; // 0-1: Self-energy/Self-leadership
  activeParts: IFSPart[];
  blended?: boolean; // Is a part blended with Self
  polarization?: Array<[string, string]>; // Opposing parts
}

// ═══════════════════════════════════════════════════════════════════════════════
// HEMISPHERIC INTEGRATION (McGilchrist)
// ═══════════════════════════════════════════════════════════════════════════════

export type HemisphericMode =
  | 'right-dominant'     // Holistic, contextual, embodied
  | 'left-dominant'      // Analytical, categorical, abstract
  | 'balanced'           // Integrated flow between hemispheres
  | 'disconnected';      // Poor inter-hemispheric communication

export interface HemisphericBalance {
  mode: HemisphericMode;
  leftActivation: number; // 0-1: Analytical/linguistic
  rightActivation: number; // 0-1: Intuitive/holistic
  integration: number; // 0-1: How well they work together
  dominantAttention: 'narrow' | 'broad' | 'flexible';
}

// ═══════════════════════════════════════════════════════════════════════════════
// GESTALT AWARENESS
// ═══════════════════════════════════════════════════════════════════════════════

export type GestaltContact =
  | 'full-contact'       // Present, engaged, aware
  | 'confluence'         // Merged, no boundaries
  | 'introjection'       // Swallowing whole without discrimination
  | 'projection'         // Seeing own traits in others
  | 'retroflection'      // Turning back on self
  | 'deflection';        // Avoiding direct contact

export interface GestaltState {
  contactStyle: GestaltContact;
  awareness: number; // 0-1: Present moment awareness
  responsibility: number; // 0-1: Owning experience
  unfinishedBusiness?: string[]; // Incomplete gestalts
  figureGroundClarity: number; // 0-1: What's foreground vs background
}

// ═══════════════════════════════════════════════════════════════════════════════
// JUNGIAN PROCESS TRACKING
// ═══════════════════════════════════════════════════════════════════════════════

export type JungianPhase =
  | 'ego-development'
  | 'shadow-encounter'
  | 'anima-animus-integration'
  | 'self-realization'
  | 'individuation';

export interface JungianProcess {
  currentPhase: JungianPhase;
  shadowWork: number; // 0-1: Degree of shadow integration
  animaAnimusContact: number; // 0-1: Connection to contra-sexual archetype
  selfAxis: number; // 0-1: Ego-Self alignment
  activeArchetypes: string[]; // e.g., ['Hero', 'Wise Old Man', 'Trickster']
  complexes?: string[]; // Active psychological complexes
}

// ═══════════════════════════════════════════════════════════════════════════════
// PHENOMENOLOGICAL PRESENCE
// ═══════════════════════════════════════════════════════════════════════════════

export interface PhenomenologicalState {
  presentMoment: number; // 0-1: Degree of presence
  embodiedAwareness: number; // 0-1: Living through the body
  intentionality: number; // 0-1: Directedness toward world
  intersubjectivity: number; // 0-1: Shared meaning-making
  lifeworld: 'rich' | 'constricted' | 'expanding';
}

// ═══════════════════════════════════════════════════════════════════════════════
// DIALOGICAL SELF
// ═══════════════════════════════════════════════════════════════════════════════

export interface DialogicalPosition {
  name: string; // e.g., "Inner Critic", "Wise Elder", "Wounded Child"
  voice: string; // Characteristic way of speaking
  perspective: string; // Viewpoint this position holds
  salience: number; // 0-1: How prominent right now
}

export interface DialogicalState {
  activePositions: DialogicalPosition[];
  dominantVoice?: string;
  polyphony: number; // 0-1: Multiplicity of voices
  integration: number; // 0-1: Harmony among positions
}

// ═══════════════════════════════════════════════════════════════════════════════
// ACT (ACCEPTANCE & COMMITMENT THERAPY) MARKERS
// ═══════════════════════════════════════════════════════════════════════════════

export interface ACTState {
  psychologicalFlexibility: number; // 0-1: Core ACT metric
  presentMomentAwareness: number; // 0-1
  cognitiveDefusion: number; // 0-1: Distance from thoughts
  acceptanceVsAvoidance: number; // -1 to 1: Avoidance vs acceptance
  selfAsContext: number; // 0-1: Observing self vs conceptualized self
  values: string[]; // Identified core values
  committedActions: number; // 0-1: Acting on values
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTELLATION STATE (Family/Systemic)
// ═══════════════════════════════════════════════════════════════════════════════

export interface ConstellationState {
  systemicEntanglements: string[]; // Identified family system patterns
  loyalties: string[]; // Hidden loyalties to system
  representationalField: number; // 0-1: Clarity of systemic field
  resolutionMovements: string[]; // Healing movements identified
}

// ═══════════════════════════════════════════════════════════════════════════════
// SPIRALOGIC PHASE (12-Phase System)
// ═══════════════════════════════════════════════════════════════════════════════

export type SpiralogicElement = 'fire' | 'water' | 'earth' | 'air' | 'aether';

export type SpiralogicRefinement = 'emergence' | 'deepening' | 'mastery';

export interface SpiralogicPhase {
  element: SpiralogicElement;
  refinement: SpiralogicRefinement;
  phaseNumber: number; // 1-12
  elementProgress: number; // 0-100: Progress within current element
  spiralNumber: number; // Which cycle through the 12 phases
}

// ═══════════════════════════════════════════════════════════════════════════════
// TRANSFORMATION SCORE
// ═══════════════════════════════════════════════════════════════════════════════

export interface TransformationScore {
  overall: number; // 0-100: Composite score
  dimensions: {
    cognitive: number; // Mental/belief transformation
    emotional: number; // Affective transformation
    somatic: number; // Embodied transformation
    behavioral: number; // Action/pattern transformation
    relational: number; // Interpersonal transformation
    spiritual: number; // Transcendent/meaning transformation
  };
  momentum: 'accelerating' | 'steady' | 'plateauing' | 'regressing';
  breakthroughPotential: number; // 0-1: Likelihood of breakthrough
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMMON BIOMARKER MIXIN
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Common consciousness biomarker properties that can be mixed into any result type.
 * Use this when result objects (API responses, extraction results, etc.) need
 * to include consciousness biomarker data.
 */
export interface ConsciousnessBiomarkers {
  // Alchemical tracking
  alchemicalStage?: AlchemicalStage;

  // Embodiment markers
  somaticState?: SomaticState;
  polyvagalState?: PolyvagalState;

  // Psychological frameworks
  ifsParts?: IFSParts;
  jungianProcess?: JungianProcess;
  actState?: ACTState;

  // Cognitive-perceptual
  hemisphericMode?: HemisphericBalance;
  phenomenological?: PhenomenologicalState;

  // Relational-systemic
  gestaltState?: GestaltState;
  dialogical?: DialogicalState;
  constellationState?: ConstellationState;

  // Spiralogic integration
  spiralogicPhase?: SpiralogicPhase;

  // Transformation metrics
  transformationScore?: TransformationScore;
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXTENDED CONSCIOUSNESS PROFILE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Extended consciousness profile that includes all biomarker dimensions.
 * This extends the base ConsciousnessProfile with detailed tracking.
 */
export interface ExtendedConsciousnessProfile extends ConsciousnessProfile, ConsciousnessBiomarkers {}

// ═══════════════════════════════════════════════════════════════════════════════
// BIOMARKER SNAPSHOT
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * A point-in-time snapshot of all consciousness biomarkers.
 * Used for tracking changes over time and detecting patterns.
 */
export interface BiomarkerSnapshot {
  timestamp: Date;
  userId: string;
  sessionId?: string;
  profile: ExtendedConsciousnessProfile;
  context?: {
    activity?: string; // What prompted this measurement
    journalEntryId?: string;
    oracleConsultId?: string;
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// BIOMARKER EVOLUTION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Tracks how biomarkers change over time.
 */
export interface BiomarkerEvolution {
  userId: string;
  timeframe: {
    start: Date;
    end: Date;
  };
  snapshots: BiomarkerSnapshot[];
  trends: {
    dimension: string; // e.g., 'alchemicalStage.intensity'
    direction: 'increasing' | 'decreasing' | 'stable' | 'oscillating';
    significance: number; // 0-1: How significant the trend
  }[];
  insights: string[]; // Patterns detected across snapshots
}
