/**
 * Ceremony Intelligence Types
 * 
 * Extended types for ceremony/retreat-specific collective intelligence.
 * Tracks group dynamics, ritual phases, and high-intensity consciousness states
 * that differ from everyday personal spiritual practice.
 */

import { AfferentStream, ElementalSignature, ArchetypeMap, ShadowPattern } from "../ain/collective/CollectiveIntelligence";
import { SpiralPhase } from "../spiralogic/SpiralogicCognitiveEngine";

// =============================================================================
// CEREMONY CONTEXT TYPES
// =============================================================================

export type CeremonyPhase = 'pre-retreat' | 'retreat-active' | 'post-retreat';
export type CeremonyType = 'individual' | 'group' | 'ceremony' | 'integration';
export type IntensityLevel = 'preparation' | 'opening' | 'peak' | 'integration' | 'closing';

export interface CeremonyContext {
  ceremonyId: string;                   // Unique ceremony/retreat identifier
  groupId: string;                      // Group/cohort identifier
  phase: CeremonyPhase;                 // Retreat lifecycle stage
  ceremonyType: CeremonyType;           // Session type
  intensityLevel: IntensityLevel;       // Current energy level
  location?: string;                    // Physical/energetic location
  facilitators: string[];               // Guide identifiers
  participantCount: number;             // Total participants
  duration: number;                     // Session duration in minutes
  startedAt: Date;                      // Ceremony start time
}

// =============================================================================
// CEREMONY-SPECIFIC AFFERENT STREAMS
// =============================================================================

export interface CeremonyAfferentStream extends AfferentStream {
  // Ceremony context
  ceremonyContext: CeremonyContext;
  
  // Group dynamics indicators
  groupSynchrony: number;               // 0-1 alignment with group field
  emotionalContagion: number;           // 0-1 susceptibility to group emotions
  leadershipEmergence: number;          // 0-1 natural guidance arising
  supportGiving: number;                // 0-1 capacity to hold others
  
  // High-intensity states (common in ceremony)
  energeticSensitivity: number;         // 0-1 sensitivity to subtle energies
  visionaryStates: number;              // 0-1 non-ordinary consciousness
  bodyActivation: number;               // 0-1 somatic/energetic activation
  boundaryPermeability: number;         // 0-1 ego boundary dissolution
  
  // Ceremony-specific patterns
  ritualReadiness: number;              // 0-1 prepared for deeper work
  integrationNeed: number;              // 0-1 requiring grounding/support
  overwhelmRisk: number;                // 0-1 risk of energetic overwhelm
  breakthroughPotential: number;        // 0-1 readiness for major shifts
  
  // Group archetypal roles
  activeArchetypes: CeremonyArchetypeMap;
  
  // Safety & containment
  groundingLevel: number;               // 0-1 connection to stability
  supportSystemAccess: number;         // 0-1 able to receive help
  safetySensing: number;                // 0-1 feeling held/protected
  
  // Intervention tracking
  needsIntervention?: boolean;          // Flag for high risk situations
}

export interface CeremonyArchetypeMap extends ArchetypeMap {
  facilitator: number;                  // Holding space, guiding
  witness: number;                      // Deep listening, presence
  guardian: number;                     // Protection, safety-keeping
  challenger: number;                   // Calling forth growth
  comedian: number;                     // Bringing levity, integration
  mystic: number;                       // Channel, visionary states
}

// =============================================================================
// GROUP CONSCIOUSNESS STATES
// =============================================================================

export interface GroupConsciousnessState {
  ceremonyId: string;
  timestamp: Date;
  
  // Group coherence metrics
  groupCoherence: number;               // 0-1 collective alignment
  energeticSync: number;                // 0-1 shared energy rhythms
  emotionalRange: number;               // 0-1 diversity of emotional states
  archetypicalBalance: number;          // 0-1 healthy role distribution
  
  // Group field characteristics
  containmentStrength: number;          // 0-1 group's holding capacity
  transformationCapacity: number;       // 0-1 readiness for deep work
  integrationSupport: number;           // 0-1 group's integration resources
  safetyResilience: number;             // 0-1 ability to handle difficulty
  
  // Collective patterns
  dominantGroupThemes: ElementalSignature;
  emergentGroupArchetypes: CeremonyArchetypeMap;
  groupShadowActivation: ShadowPattern[];
  collectiveBreakthroughReadiness: number;
  
  // Risk indicators
  overwhelmRisk: number;                // 0-1 group overwhelm potential
  fragmentationRisk: number;            // 0-1 risk of group dissolution
  breakthroughOpportunity: number;      // 0-1 collective transformation potential
}

// =============================================================================
// CEREMONY-SPECIFIC PATTERNS
// =============================================================================

export interface CeremonyEmergentPattern {
  id: string;
  ceremonyId: string;
  type: CeremonyPatternType;
  
  // Pattern identification
  strength: number;                     // 0-1 pattern intensity
  participants: string[];               // Affected participant IDs
  timeframe: {
    start: Date;
    peak?: Date;
    end?: Date;
  };
  confidence: number;                   // 0-1 detection confidence
  
  // Ceremony-specific characteristics
  phase: CeremonyPhase;                 // Which retreat phase
  groupImpact: number;                  // 0-1 effect on group field
  interventionNeeded: boolean;          // Requires facilitator attention
  supportRecommendations: string[];     // Specific guidance for this context
  
  // Pattern evolution
  likelyProgression: string;
  optimalResponse: string;
  timingGuidance: string;
  
  // Safety considerations
  riskLevel: 'low' | 'medium' | 'high';
  containmentNeeds: string[];
  integrationSupport: string[];
}

export type CeremonyPatternType =
  | 'group_opening'              // Collective heart opening
  | 'emotional_cascade'          // Shared emotional release
  | 'archetypal_constellation'   // Group archetypal dynamics
  | 'energy_overwhelm'           // Collective overwhelm state
  | 'breakthrough_wave'          // Group breakthrough momentum  
  | 'integration_resistance'     // Difficulty processing experiences
  | 'shadow_emergence'           // Group shadow surfacing
  | 'sacred_activation'          // Mystical/numinous group states
  | 'grounding_need'             // Collective need for stability
  | 'completion_readiness';      // Group ready for closure/integration

// =============================================================================
// RETREAT LIFECYCLE PATTERNS
// =============================================================================

export interface RetreatLifecyclePattern {
  phase: CeremonyPhase;
  commonPatterns: CeremonyPatternType[];
  typicalChallenges: string[];
  supportNeeds: string[];
  interventionTriggers: string[];
  optimalPractices: string[];
}

export const RETREAT_LIFECYCLE_PATTERNS: Record<CeremonyPhase, RetreatLifecyclePattern> = {
  'pre-retreat': {
    phase: 'pre-retreat',
    commonPatterns: ['shadow_emergence', 'integration_resistance'],
    typicalChallenges: [
      'anticipatory anxiety',
      'shadow material surfacing',
      'resistance to vulnerability',
      'practical concerns overwhelming spiritual intention'
    ],
    supportNeeds: [
      'reassurance and normalization',
      'practical preparation guidance',
      'gentle shadow work introduction',
      'community connection building'
    ],
    interventionTriggers: [
      'extreme anxiety or panic',
      'withdrawal from group process',
      'spiritual bypassing of practical concerns'
    ],
    optimalPractices: [
      'gentle breathwork',
      'journaling intentions and fears',
      'group sharing circles',
      'practical preparation checklists'
    ]
  },
  
  'retreat-active': {
    phase: 'retreat-active',
    commonPatterns: ['group_opening', 'breakthrough_wave', 'energy_overwhelm', 'archetypal_constellation'],
    typicalChallenges: [
      'energetic overwhelm',
      'boundary dissolution',
      'emotional flooding',
      'group dynamics complexity',
      'integration difficulty during peak states'
    ],
    supportNeeds: [
      'strong containment and grounding',
      'clear leadership and guidance',
      'individual attention within group context',
      'somatic regulation support',
      'integration practices'
    ],
    interventionTriggers: [
      'participant dissociation or panic',
      'group fragmentation or conflict',
      'unsafe risk-taking behaviors',
      'inability to ground after peak states'
    ],
    optimalPractices: [
      'somatic grounding techniques',
      'dyad sharing and witnessing',
      'movement and breathwork',
      'art/creative expression',
      'nature immersion'
    ]
  },
  
  'post-retreat': {
    phase: 'post-retreat',
    commonPatterns: ['integration_resistance', 'grounding_need', 'completion_readiness'],
    typicalChallenges: [
      'difficulty integrating insights',
      'return to ordinary consciousness',
      'loss of group connection',
      'practical life re-entry challenges',
      'maintaining new perspectives'
    ],
    supportNeeds: [
      'practical integration tools',
      'ongoing community connection',
      'gentle accountability structures',
      'normalization of integration difficulties',
      'bridge-building between retreat and daily life'
    ],
    interventionTriggers: [
      'complete rejection of retreat insights',
      'inability to function in daily life',
      'isolation from all support systems',
      'dangerous behavior changes'
    ],
    optimalPractices: [
      'daily integration practices',
      'regular check-ins with retreat community',
      'journaling and reflection',
      'gradual implementation of insights',
      'professional integration support if needed'
    ]
  }
};

// =============================================================================
// CEREMONY COLLECTIVE INTELLIGENCE QUERY TYPES
// =============================================================================

export interface CeremonyCollectiveQuery {
  ceremonyId?: string;                  // Specific ceremony focus
  groupId?: string;                     // Group/cohort focus
  phase?: CeremonyPhase;                // Retreat lifecycle focus
  patternType?: CeremonyPatternType;    // Specific pattern interest
  riskLevel?: 'low' | 'medium' | 'high'; // Safety focus
  timeRange: string;                    // Time window
  minimumGroupCoherence?: number;       // Filter threshold
  participantThreshold?: number;        // Minimum affected participants
}

export interface CeremonyCollectiveResponse {
  primaryInsight: string;               // Main group wisdom
  groupState: GroupConsciousnessState;  // Current group consciousness
  activePatterns: CeremonyEmergentPattern[]; // Detected ceremony patterns
  riskAssessment: {
    level: 'low' | 'medium' | 'high';
    concerns: string[];
    recommendations: string[];
  };
  supportNeeds: string[];               // Current group support needs
  interventionRecommendations: string[]; // Facilitator guidance
  timingGuidance: string;               // Optimal timing for activities
  integrationSupport: string[];         // Help for processing experiences
}

// =============================================================================
// FACILITATOR DASHBOARD TYPES
// =============================================================================

export interface FacilitatorDashboard {
  ceremonyOverview: {
    ceremonyId: string;
    currentPhase: CeremonyPhase;
    participantCount: number;
    duration: number;
    groupCoherence: number;
  };
  
  immediateAttention: {
    highRiskParticipants: string[];     // Need individual attention
    groupRiskLevel: 'low' | 'medium' | 'high';
    interventionRecommended: boolean;
    urgentPatterns: CeremonyEmergentPattern[];
  };
  
  groupDynamics: {
    dominantArchetypes: CeremonyArchetypeMap;
    groupEmotionalTone: ElementalSignature;
    coherenceHistory: Array<{ time: Date; value: number }>;
    breakdownRisks: string[];
  };
  
  guidance: {
    recommendedPractices: string[];
    timingAdvice: string;
    phaseTuning: string;
    integrationNeeds: string[];
  };
}