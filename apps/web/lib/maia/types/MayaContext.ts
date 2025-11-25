/**
 * Maya Context System
 * Provides real-time Spiralogic state and pattern awareness for authentic presence-based responses
 */

import { CompressedFacetState, FacetTransition } from '@/lib/spiralogic/types';

/**
 * Loop patterns that indicate stuck points requiring attention
 */
export interface LoopPattern {
  facetId: string;
  element: string;
  cycleCount: number;
  duration: number; // minutes
  intensity: number; // 0-1
  needsAttention: boolean;
}

/**
 * Collective pattern affecting individual experience
 */
export interface CollectivePattern {
  theme: string;
  resonanceStrength: number; // 0-1
  affectedElement: string;
  prevalence: number; // percentage of field
}

/**
 * Response depth indicators
 */
export enum ResponseDepth {
  SURFACE = 'surface',      // Light touch, maintaining flow
  EXPLORATORY = 'exploratory', // Gentle probing
  DEEP = 'deep',            // Full depth engagement
  INTEGRATIVE = 'integrative'  // Weaving multiple threads
}

/**
 * Transition momentum and direction
 */
export interface TransitionMomentum {
  direction: 'ascending' | 'descending' | 'circling' | 'spiraling';
  speed: number; // 0-1
  stability: number; // 0-1
}

/**
 * Complete context for Maya's awareness
 */
export interface MayaContext {
  // Current spiral position
  spiralState: CompressedFacetState;

  // Recent movement patterns (last 3-5 transitions)
  recentTransitions: FacetTransition[];

  // Momentum and trajectory
  momentum: TransitionMomentum;

  // Stuck or looping patterns
  activeLoops: LoopPattern[];

  // Collective field influence (optional)
  fieldResonance?: CollectivePattern;

  // Conversation depth tracking
  sessionDepth: number; // 0-10 scale
  currentDepth: ResponseDepth;

  // Pattern recognition flags
  patterns: {
    needsGrounding: boolean;
    seekingClarity: boolean;
    avoidingDepth: boolean;
    readyForTransition: boolean;
    integrationPhase: boolean;
  };

  // Energetic quality
  energetics: {
    charge: number; // -1 to 1 (depleted to charged)
    coherence: number; // 0-1 (scattered to coherent)
    openness: number; // 0-1 (closed to open)
  };
}

/**
 * Compressed context for token efficiency
 */
export interface CompressedMayaContext {
  // 64-byte state fingerprint
  stateFingerprint: string;

  // Essential patterns only
  primaryPattern: string;
  depth: ResponseDepth;
  momentum: 'rising' | 'falling' | 'stable' | 'cycling';

  // Critical flags
  attention: string[]; // What needs attention
  avoid: string[]; // What to avoid

  // Single number summaries
  coherence: number;
  readiness: number;
}

/**
 * Response constraints that shape Maya's output
 */
export interface ResponseConstraints {
  // Core directives
  holdSpace: boolean;           // Prioritize presence over solving
  mirrorOnly: boolean;          // Reflect without interpreting
  offerDoorway: boolean;        // Suggest transition when ready
  maintainPresence: boolean;    // Stay with what is

  // Depth guidance
  maxDepth: ResponseDepth;
  minDepth: ResponseDepth;

  // Pattern-specific constraints
  avoidAnalysis: boolean;
  avoidAdvice: boolean;
  emphasizeFeeling: boolean;
  emphasizeBody: boolean;

  // Elemental guidance
  primaryElement: string;
  avoidElement?: string;

  // Length constraints
  responseLength: 'brief' | 'moderate' | 'expansive';
}

/**
 * Framework activation criteria
 */
export interface FrameworkCues {
  spiralPosition: {
    facet: string;
    element: string;
    intensity: number;
  };

  patternIndicators: string[];

  activationThreshold: number; // 0-1
  currentActivation: number; // 0-1

  suggestedFrameworks: string[]; // Ranked by relevance
}

/**
 * Complete context package for API calls
 */
export interface MayaRequestContext {
  // User input
  message: string;

  // Compressed context for efficiency
  context: CompressedMayaContext;

  // Active constraints
  constraints: ResponseConstraints;

  // Framework cues if threshold met
  frameworks?: FrameworkCues;

  // Session metadata
  sessionId: string;
  turnCount: number;
  timestamp: Date;
}

/**
 * Response shaped by context
 */
export interface MayaResponse {
  // The actual response text
  content: string;

  // How the context influenced response
  contextInfluence: {
    depthChosen: ResponseDepth;
    elementsEngaged: string[];
    patternsAddressed: string[];
    constraintsApplied: string[];
  };

  // State updates from response
  stateUpdates?: {
    suggestedTransition?: FacetTransition;
    depthShift?: ResponseDepth;
    patternShift?: string;
  };

  // Metadata
  responseId: string;
  timestamp: Date;
}