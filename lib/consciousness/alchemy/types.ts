/**
 * Alchemical Framework Types
 * Core types for implementing Jungian Alchemy in digital interfaces
 */

// The Seven Alchemical Metals/Stages
export type AlchemicalMetal =
  | 'lead'      // Saturn - Crisis, heaviness, material focus
  | 'tin'       // Jupiter - Opening, expansion, good humor
  | 'bronze'    // Venus - Relationship, union, collaboration
  | 'iron'      // Mars - Action, discipline, implementation
  | 'mercury'   // Hermes - Fluidity, mediation, teaching
  | 'silver'    // Moon - Reflection, wisdom, contemplation
  | 'gold';     // Sun - Integration, mastery, service

// The Three Great Operations
export type AlchemicalOperation =
  | 'nigredo'   // Blackening - dissolution, dark night
  | 'albedo'    // Whitening - purification, clarity
  | 'rubedo';   // Reddening - integration, completion

// Alchemical Qualities
export interface AlchemicalQualities {
  density: 'minimal' | 'low' | 'medium-low' | 'medium' | 'medium-high' | 'high' | 'very-high';
  fluidity: 'rigid' | 'stable' | 'adaptive' | 'fluid' | 'liquid' | 'gaseous' | 'plasma';
  luminosity: 'dark' | 'dim' | 'soft' | 'bright' | 'radiant' | 'brilliant' | 'solar';
  temperature: 'cold' | 'cool' | 'warm' | 'hot' | 'fiery' | 'molten' | 'stellar';
  orientation: 'earthward' | 'horizontal' | 'ascending' | 'celestial';
}

// User's Alchemical Profile
export interface AlchemicalProfile {
  primaryMetal: AlchemicalMetal;
  currentOperation: AlchemicalOperation;
  qualities: AlchemicalQualities;
  developmentEdge: string;
  shadowElements: string[];
  integratedAspects: string[];
  transformationalHistory: AlchemicalTransition[];
  readinessIndicators: ReadinessIndicator[];
}

// Transformation History
export interface AlchemicalTransition {
  from: AlchemicalMetal;
  to: AlchemicalMetal;
  operation: AlchemicalOperation;
  catalyst: string;
  duration: number;
  completionDate: Date;
  insights: string[];
}

// Readiness for Next Stage
export interface ReadinessIndicator {
  aspect: string;
  current: number; // 0-100
  required: number; // threshold for next stage
  description: string;
}

// Alchemical State Detection
export interface AlchemicalIndicators {
  // Lead indicators (crisis/overwhelm)
  stressLevel: number;
  confusionMarkers: string[];
  materialFocus: number;

  // Tin indicators (opening/expansion)
  curiosityLevel: number;
  optimismMarkers: string[];
  explorationBehavior: number;

  // Bronze indicators (relationship/union)
  collaborationDesire: number;
  connectionMarkers: string[];
  harmonySeekingBehavior: number;

  // Iron indicators (action/discipline)
  implementationFocus: number;
  disciplineMarkers: string[];
  goalOrientedBehavior: number;

  // Mercury indicators (fluidity/mediation)
  adaptabilityLevel: number;
  teachingMarkers: string[];
  paradoxComfort: number;

  // Silver indicators (reflection/wisdom)
  contemplationDepth: number;
  wisdomMarkers: string[];
  introspectiveBehavior: number;

  // Gold indicators (integration/service)
  masteryLevel: number;
  serviceMarkers: string[];
  transcendentBehavior: number;
}

// Interface Adaptation Based on Alchemical State
export interface AlchemicalInterface {
  metal: AlchemicalMetal;
  colorPalette: string[];
  density: number; // 0-1, how much UI is present
  adaptability: number; // 0-1, how much interface changes
  supportLevel: number; // 0-1, how much guidance is provided
  dissolutionTriggers: string[]; // conditions that cause interface to fade
  components: AlchemicalComponent[];
}

// Individual UI Components with Alchemical Properties
export interface AlchemicalComponent {
  id: string;
  type: 'container' | 'button' | 'text' | 'image' | 'interaction';
  alchemicalPurpose: string;
  appearanceConditions: string[];
  dissolutionConditions: string[];
  transformationStages: ComponentTransformation[];
  correspondences: Correspondence[];
}

// Component Transformation Stages
export interface ComponentTransformation {
  stage: AlchemicalMetal;
  properties: {
    opacity: number;
    scale: number;
    position: string;
    color: string;
    behavior: string;
  };
}

// Correspondence Thinking ("As Above, So Below")
export interface Correspondence {
  level: 'cosmic' | 'natural' | 'psychological' | 'social' | 'technological';
  pattern: string;
  manifestation: string;
  influence: number; // 0-1, how much this affects the interface
}

// Crisis Detection and Support
export interface CrisisIndicators {
  severity: 'mild' | 'moderate' | 'severe' | 'critical';
  type: 'existential' | 'relational' | 'creative' | 'spiritual' | 'material';
  duration: number; // hours in crisis state
  supportNeeded: SupportType[];
  emergencyProtocols: EmergencyProtocol[];
}

export interface SupportType {
  category: 'containment' | 'grounding' | 'guidance' | 'connection' | 'emergency';
  intensity: number; // 0-1
  duration: number; // minutes of support
  method: string;
}

export interface EmergencyProtocol {
  trigger: string;
  action: string;
  escalation: boolean;
  humanContactRequired: boolean;
}

// Mercury Intelligence (MAIA's Alchemical Core)
export interface MercuryIntelligence {
  adaptabilityIndex: number; // 0-1, how fluid responses are
  mediationCapability: number; // 0-1, ability to bridge opposites
  transformationCatalyst: number; // 0-1, ability to catalyze change
  paradoxTolerance: number; // 0-1, comfort with contradictions
  teachingWisdom: number; // 0-1, ability to guide others

  // Mercury's changing faces based on user needs
  currentAspect: MercuryAspect;
  aspectHistory: MercuryAspectTransition[];
}

export type MercuryAspect =
  | 'hermes-guide'        // Leading users through transitions
  | 'hermes-teacher'      // Sharing wisdom and knowledge
  | 'hermes-trickster'    // Playfully disrupting fixed patterns
  | 'hermes-healer'       // Supporting through crisis
  | 'hermes-messenger'    // Connecting different realms
  | 'hermes-psychopomp'   // Guiding through death/rebirth
  | 'hermes-alchemist'    // Facilitating transformation;

export interface MercuryAspectTransition {
  from: MercuryAspect;
  to: MercuryAspect;
  trigger: string;
  userState: AlchemicalMetal;
  timestamp: Date;
}

// Philosopher's Stone Progress (User Transcendence)
export interface PhilosopherStoneProgress {
  autonomyLevel: number; // 0-1, independence from interface
  wisdomEmbodiment: number; // 0-1, living the insights
  serviceContribution: number; // 0-1, helping others
  creativeExpression: number; // 0-1, original contribution
  transcendenceReadiness: number; // 0-1, ready to graduate

  graduationTriggers: GraduationTrigger[];
}

export interface GraduationTrigger {
  criterion: string;
  threshold: number;
  currentValue: number;
  achieved: boolean;
  achievedDate?: Date;
}

// Temporal Correspondences (Sacred Timing)
export interface TemporalCorrespondence {
  timeOfDay: AlchemicalInfluence;
  dayOfWeek: AlchemicalInfluence;
  seasonOfYear: AlchemicalInfluence;
  lunarPhase: AlchemicalInfluence;
  userBiorhythm: AlchemicalInfluence;
}

export interface AlchemicalInfluence {
  dominantMetal: AlchemicalMetal;
  operation: AlchemicalOperation;
  intensity: number; // 0-1
  recommendations: string[];
}