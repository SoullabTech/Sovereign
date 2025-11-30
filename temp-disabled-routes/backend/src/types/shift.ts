/**
 * SHIFt (Implicit) - Types and Interfaces
 * 
 * Maps ongoing conversational and behavioral signals to 12 Spiralogic facets
 * without requiring explicit testing. Provides elemental profiles, phase inference,
 * and phenomenological narratives for agents.
 */

// ============================================================================
// CORE TYPES
// ============================================================================

export type Element = 'fire' | 'earth' | 'water' | 'air' | 'aether';
export type Phase = 'initiation' | 'grounding' | 'collaboration' | 'transformation' | 'completion';

export interface FacetCode {
  code: string;                          // e.g., "F1_Meaning"
  element: Element;
  phenomenologicalLabel: string;        // e.g., "Inspired purpose"
}

// The 12 Spiralogic Facets
export const SPIRALOGIC_FACETS: Record<string, FacetCode> = {
  F1_Meaning: { code: 'F1_Meaning', element: 'fire', phenomenologicalLabel: 'Inspired purpose' },
  F2_Courage: { code: 'F2_Courage', element: 'fire', phenomenologicalLabel: 'Willingness to face truth / take action' },
  E1_Coherence: { code: 'E1_Coherence', element: 'earth', phenomenologicalLabel: 'Life-path coherence / "crystal" clarity' },
  E2_Grounding: { code: 'E2_Grounding', element: 'earth', phenomenologicalLabel: 'Reliable routines / embodied stability' },
  W1_Attunement: { code: 'W1_Attunement', element: 'water', phenomenologicalLabel: 'Emotional range & regulation' },
  W2_Belonging: { code: 'W2_Belonging', element: 'water', phenomenologicalLabel: 'Felt support / reciprocity' },
  A1_Reflection: { code: 'A1_Reflection', element: 'air', phenomenologicalLabel: 'Meta-cognition / sense-making' },
  A2_Adaptability: { code: 'A2_Adaptability', element: 'air', phenomenologicalLabel: 'Reframing / cognitive flexibility' },
  AE1_Values: { code: 'AE1_Values', element: 'aether', phenomenologicalLabel: 'Values/virtue alignment' },
  AE2_Fulfillment: { code: 'AE2_Fulfillment', element: 'aether', phenomenologicalLabel: 'Narrative wholeness / life-satisfaction' },
  C1_Integration: { code: 'C1_Integration', element: 'aether', phenomenologicalLabel: 'Practice of integrating insights' },
  C2_Integrity: { code: 'C2_Integrity', element: 'aether', phenomenologicalLabel: 'Word–deed alignment / congruence' }
};

// ============================================================================
// SIGNAL TYPES
// ============================================================================

export interface ConversationalSignals {
  meaningDensity: number;               // % of sentences expressing purpose/"why"
  actionCommitmentCount: number;        // explicit next-step statements
  truthNaming: boolean;                 // direct naming of avoided topic
  coherenceMarkers: number;             // % "this fits / next step / long-term"
  routineLanguage: number;              // % sleep/food/movement/ritual mentions
  affectRegulationOk: number;           // ratio of emotion words : flooding markers
  reciprocityIndex: number;             // (offers+asks+thanks)/length
  metaReferences: number;               // % noticing, reframing, perspective-taking
  valuesHits: number;                   // count of values lexicon matches
  wholenessReferences: number;          // % "peace with," "chapter closed/open"
  integrationCommitment: boolean;       // "I'll try X for Y days"
  integrityRepair: boolean;             // acknowledges mismatch & repairs
}

export interface BehavioralSignals {
  streakDays: number;                   // practice streak
  journalsLast7Days: number;            // journaling frequency
  ritualsLast7Days: number;             // ritual/meeting attendance
  tasksCompletionRate: number;          // tasks created vs completed
  ontimeRate: number;                   // punctuality
  helpSeekingAppropriate: boolean;      // asks for support when needed
}

export interface ContentQualitySignals {
  readabilityVariance: number;          // stable clarity
  sentimentVariance: number;            // emotional range
  avoidanceScore: number;               // topic avoidance patterns
}

export interface BioEmbodiedSignals {
  hrvTrend?: number;                    // HRV baseline trend
  sleepRegularity?: number;             // sleep consistency
}

export interface SHIFtFeatures {
  conversational: ConversationalSignals;
  behavioral: BehavioralSignals;
  contentQuality: ContentQualitySignals;
  bioEmbodied?: BioEmbodiedSignals;
  timestamp: Date;
  sessionId: string;
}

// ============================================================================
// PROFILE TYPES
// ============================================================================

export interface FacetScore {
  code: string;                         // e.g., "F1_Meaning"
  score: number;                        // 0-100
  confidence: number;                   // 0-1
  delta7d: number;                      // 7-day change
  evidenceWeights: Record<string, number>; // feature contributions
  source: 'implicit' | 'explicit' | 'blended';
}

export interface ElementalProfile {
  fire: number;                         // 0-100
  earth: number;                        // 0-100
  water: number;                        // 0-100
  air: number;                          // 0-100
  aether: number;                       // 0-100
  confidence: number;                   // 0-1 overall confidence
}

export interface PhaseInference {
  primary: Phase;
  primaryConfidence: number;            // 0-1
  secondary: Phase;
  secondaryConfidence: number;          // 0-1
  logits: Record<Phase, number>;        // raw phase scores
}

export interface SHIFtProfile {
  userId: string;
  elements: ElementalProfile;
  facets: FacetScore[];
  phase: PhaseInference;
  confidence: number;                   // overall profile confidence
  lastUpdated: Date;
  freshness: number;                    // 0-1 based on decay
  narrative: string;                    // phenomenological summary
  practice?: SuggestedPractice;         // recommended practice
  alerts?: SHIFtAlert[];                // any flags
}

export interface SuggestedPractice {
  title: string;
  description: string;
  steps: string[];
  targetFacets: string[];               // which facets this helps
  durationMinutes: number;
}

export interface SHIFtAlert {
  code: 'low_grounding' | 'avoidance_spike' | 'calibration_needed' | 'phase_transition';
  severity: 'info' | 'warning' | 'action';
  message: string;
  recommendation: string;
  facetsAffected: string[];
}

// ============================================================================
// EXPLICIT/IMPLICIT BLENDING
// ============================================================================

export interface ExplicitScore {
  facetCode: string;
  score: number;                        // 0-100
  takenAt: Date;
  version: string;                      // test version
}

export interface BlendingConfig {
  explicitWeight: number;               // initial weight for explicit scores
  decayHalfLifeDays: number;            // how fast explicit weight decays
  conflictThreshold: number;            // delta that triggers calibration
}

// ============================================================================
// GROUP/COLLECTIVE TYPES
// ============================================================================

export interface GroupSHIFtSnapshot {
  groupId: string;
  date: Date;
  elementMeans: ElementalProfile;
  facetMeans: Record<string, number>;
  coherence: number;                    // group alignment 0-1
  coherenceScore: number;               // alias for coherence, used in narratives
  participantCount: number;
  dominantPhase: Phase;
  dominantElement: Element;             // strongest collective element
  lowestElement?: Element;              // weakest collective element
  imbalanceScore: number;               // 0-1, higher = more imbalanced
  phaseAlignment?: PhaseInference;     // group phase consensus
  emergingPatterns: string[];
}

// ============================================================================
// API TYPES
// ============================================================================

export interface SHIFtIngestRequest {
  userId: string;
  sessionId: string;
  text?: string;
  events?: Array<{
    type: string;
    timestamp: Date;
    payload: any;
  }>;
  metrics?: {
    streakDays?: number;
    tasksCompleted?: number;
    journalEntries?: number;
  };
}

export interface SHIFtComputeRequest {
  userId: string;
  windowDays?: number;                  // default 28
  includeExplicit?: boolean;            // blend with explicit scores
}

export interface SHIFtProfileResponse {
  elements: ElementalProfile;
  facets: Array<{
    code: string;
    label: string;
    score: number;
    confidence: number;
    delta7d: number;
  }>;
  phase: {
    primary: Phase;
    primaryConfidence: number;
    secondary: Phase;
    secondaryConfidence: number;
  };
  narrative: string;
  practice?: {
    title: string;
    steps: string[];
  };
  alerts?: Array<{
    code: string;
    message: string;
  }>;
}

// ============================================================================
// EVENT TYPES
// ============================================================================

export type SHIFtEvent = 
  | {
      type: 'shift.facet.updated';
      userId: string;
      facet: string;
      score: number;
      confidence: number;
      previousScore: number;
    }
  | {
      type: 'shift.phase.changed';
      userId: string;
      from: Phase;
      to: Phase;
      confidence: number;
    }
  | {
      type: 'shift.alert.triggered';
      userId: string;
      alert: SHIFtAlert;
    }
  | {
      type: 'shift.calibration.needed';
      userId: string;
      facet: string;
      implicitScore: number;
      explicitScore: number;
      delta: number;
    };

// ============================================================================
// PRIVACY & CONSENT
// ============================================================================

export interface SHIFtConsent {
  userId: string;
  implicitTracking: boolean;
  explicitTesting: boolean;
  dataRetentionDays: number;
  facetOptOuts: string[];               // specific facets to exclude
  consentedAt: Date;
  version: string;
}