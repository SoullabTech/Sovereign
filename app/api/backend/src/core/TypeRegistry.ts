/**
 * TypeRegistry - Centralized Type Definitions
 * Consolidates all shared types to eliminate duplication
 * Foundation component for architectural simplification
 */

// Core Infrastructure Types
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

export interface EventPayload {
  type: string;
  userId: string;
  sessionId?: string;
  timestamp: Date;
  properties: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface ServiceConfig {
  name: string;
  version: string;
  enabled: boolean;
  dependencies: string[];
  settings: Record<string, any>;
}

// User & Session Types
export interface UserProfile extends BaseEntity {
  userId: string;
  preferences: UserPreferences;
  authenticationMethod: 'anonymous' | 'authenticated';
  consentGiven: boolean;
  privacySettings: PrivacySettings;
}

export interface UserPreferences {
  elementalAffinities: Record<string, number>;
  communicationStyle: 'direct' | 'metaphorical' | 'mixed';
  intensityTolerance: number; // 0-1
  sessionFrequency: 'daily' | 'weekly' | 'monthly';
  grounding: {
    preferred: string[];
    frequency: 'low' | 'medium' | 'high';
  };
}

export interface PrivacySettings {
  anonymizeData: boolean;
  shareCollectivePatterns: boolean;
  retentionPeriod: number; // days
  exportEnabled: boolean;
}

export interface SessionContext extends BaseEntity {
  userId: string;
  sessionType: 'consultation' | 'exploration' | 'integration';
  duration: number; // seconds
  status: 'active' | 'completed' | 'interrupted';
  metadata: SessionMetadata;
}

export interface SessionMetadata {
  deviceType: string;
  location?: string;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  lunarPhase?: 'new' | 'waxing' | 'full' | 'waning';
  season?: 'spring' | 'summer' | 'autumn' | 'winter';
}

// Daimonic System Types
export interface DaimonicEncounter extends BaseEntity {
  userId: string;
  sessionId: string;
  encounterType: EncounterType;
  manifestations: OthernessManifestations;
  synapticGaps: SynapticGapDynamics[];
  emergences: EmergenceEvent[];
  validationResults: ValidationResult[];
  narrativeElements: NarrativeElement[];
}

export type EncounterType = 
  | 'initial_contact' 
  | 'resistance_integration' 
  | 'synaptic_bridging'
  | 'elemental_dialogue'
  | 'collective_resonance'
  | 'integration_failure'
  | 'breakthrough_moment';

// Otherness Manifestations
export interface OthernessManifestations {
  dreams: DreamOtherness[];
  visions: VisionaryOtherness[];
  ideas: IdeationalOtherness[];
  somatic: SomaticOtherness[];
  synchronicities: SynchronisticOtherness[];
  creative: CreativeOtherness[];
  relational: RelationalOtherness[];
  environmental: EnvironmentalOtherness[];
  temporal: TemporalOtherness[];
  technological: TechnologicalOtherness[];
  linguistic: LinguisticOtherness[];
  emotional: EmotionalOtherness[];
  archetypal: ArchetypalOtherness[];
  spiritual: SpiritualOtherness[];
  liminal: LiminalOtherness[];
}

export interface BaseManifestation {
  id: string;
  timestamp: Date;
  intensity: number; // 0-1
  duration?: number; // seconds
  content: string;
  context: string;
  resistanceLevel: number; // 0-1
  integrationStatus: 'pending' | 'partial' | 'complete' | 'rejected';
  othernessMarkers: string[];
  concernFlags: string[];
}

export interface DreamOtherness extends BaseManifestation {
  dreamType: 'visitation' | 'teaching' | 'warning' | 'guidance';
  symbolism: string[];
  emotionalTone: string;
  recallClarity: number; // 0-1
}

export interface VisionaryOtherness extends BaseManifestation {
  visionType: 'spontaneous' | 'guided' | 'meditative' | 'crisis';
  sensoryChannels: ('visual' | 'auditory' | 'kinesthetic' | 'synesthetic')[];
  realityTesting: RealityTestingMetrics;
}

export interface IdeationalOtherness extends BaseManifestation {
  ideaType: 'insight' | 'solution' | 'question' | 'paradox';
  cognitiveDisruption: number; // 0-1
  noveltyIndex: number; // 0-1
  sourceAttribution: 'self' | 'other' | 'unknown' | 'collective';
}

export interface SomaticOtherness extends BaseManifestation {
  bodyRegion: string[];
  sensationType: 'expansion' | 'contraction' | 'energy' | 'tension' | 'release';
  autonomicResponse: AutonomicMetrics;
  verbalBodyAlignment: boolean;
}

export interface SynchronisticOtherness extends BaseManifestation {
  synchronicityType: 'meaningful_coincidence' | 'number_pattern' | 'environmental_mirror' | 'relational_echo';
  meaningfulness: number; // 0-1 subjective rating
  verifiability: 'objective' | 'subjective' | 'mixed';
  culturalContext: string;
}

export interface CreativeOtherness extends BaseManifestation {
  medium: string;
  spontaneity: number; // 0-1
  skillLevel: 'below_usual' | 'usual' | 'above_usual' | 'unprecedented';
  sourceExperience: 'channeled' | 'inspired' | 'collaborative' | 'autonomous';
}

export interface RelationalOtherness extends BaseManifestation {
  relationshipType: 'intimate' | 'professional' | 'casual' | 'stranger' | 'authority';
  interactionPattern: 'mirroring' | 'challenging' | 'teaching' | 'healing';
  reciprocity: 'one_way' | 'mutual' | 'asymmetric';
}

export interface EnvironmentalOtherness extends BaseManifestation {
  environment: 'natural' | 'urban' | 'sacred' | 'domestic' | 'liminal';
  elementalPresence: ElementalPresence[];
  atmosphericShift: boolean;
}

export interface TemporalOtherness extends BaseManifestation {
  temporalType: 'time_dilation' | 'time_compression' | 'lost_time' | 'prophetic_time';
  durationDiscrepancy: number; // ratio of experienced/clock time
  chronesthesia: number; // 0-1 time sense disruption
}

export interface TechnologicalOtherness extends BaseManifestation {
  technologyType: string;
  malfunctionType: 'meaningful_glitch' | 'impossible_function' | 'timing_anomaly';
  reproducibility: 'never' | 'rarely' | 'sometimes' | 'reliably';
}

export interface LinguisticOtherness extends BaseManifestation {
  languageType: 'unknown_language' | 'wordless_communication' | 'automatic_writing' | 'linguistic_innovation';
  communicationChannel: 'auditory' | 'visual' | 'kinesthetic' | 'telepathic_sense';
  comprehension: 'immediate' | 'delayed' | 'partial' | 'mysterious';
}

export interface EmotionalOtherness extends BaseManifestation {
  emotionType: 'foreign_emotion' | 'impossible_feeling' | 'collective_emotion' | 'transpersonal_affect';
  personalResonance: number; // 0-1 how much feels "mine"
  culturalFamiliarity: number; // 0-1 how culturally recognizable
}

export interface ArchetypalOtherness extends BaseManifestation {
  archetype: ArchetypalPattern;
  constellation: ConstellationDynamics;
  personalMythResonance: number; // 0-1
  collectiveRelevance: number; // 0-1
}

export interface SpiritualOtherness extends BaseManifestation {
  spiritualType: 'presence' | 'guidance' | 'initiation' | 'communion' | 'testing';
  traditionResonance: string[];
  orthodoxAlignment: number; // 0-1 how traditional vs. innovative
}

export interface LiminalOtherness extends BaseManifestation {
  liminalType: 'threshold' | 'betwixt' | 'transitional' | 'boundary_dissolution';
  stabilityImpact: number; // 0-1 how much disrupts normal categories
  integrationChallenge: number; // 0-1 difficulty of integration
}

// Synaptic Gap Dynamics
export interface SynapticGapDynamics {
  id: string;
  timestamp: Date;
  selfPole: SelfPole;
  otherPole: OtherPole;
  gapWidth: number; // 0-1 distance between poles
  gapCharge: number; // 0-1 electrical potential
  stability: number; // 0-1 how stable the gap is
  transmissionQuality: TransmissionQuality;
  bridgingAttempts: BridgingAttempt[];
  syntheticPotential: number; // 0-1 likelihood of synthesis
}

export interface SelfPole {
  content: string;
  certainty: number; // 0-1
  attachment: number; // 0-1
  defensiveness: number; // 0-1
  curiosity: number; // 0-1
}

export interface OtherPole {
  content: string;
  clarity: number; // 0-1
  persistence: number; // 0-1 how strongly it maintains position
  flexibility: number; // 0-1 willingness to engage
  autonomy: number; // 0-1 how independent it feels
}

export interface TransmissionQuality {
  clarity: number; // 0-1
  distortion: number; // 0-1
  noise: number; // 0-1
  bandwidth: number; // 0-1
  coherence: number; // 0-1
}

export interface BridgingAttempt {
  timestamp: Date;
  strategy: BridgingStrategy;
  success: number; // 0-1
  newUnderstanding: string;
  transformationOccurred: boolean;
  resistanceEncountered: ResistancePattern[];
}

export type BridgingStrategy = 
  | 'logical_analysis'
  | 'imaginative_engagement' 
  | 'somatic_resonance'
  | 'emotional_attunement'
  | 'symbolic_translation'
  | 'paradox_holding'
  | 'surrender_acceptance';

// Emergence Events
export interface EmergenceEvent extends BaseEntity {
  userId: string;
  sessionId: string;
  emergenceType: EmergenceType;
  parentElements: string[]; // What combined to create this
  newContent: string;
  irreducibilityMarkers: string[];
  continuedDevelopment: boolean;
  integrationAttempts: IntegrationAttempt[];
  authenticitySignatures: AuthenticitySignature[];
}

export type EmergenceType = 
  | 'synthetic_insight'
  | 'creative_breakthrough'
  | 'relational_understanding'
  | 'somatic_integration'
  | 'spiritual_realization'
  | 'existential_shift'
  | 'paradox_resolution';

export interface IntegrationAttempt {
  timestamp: Date;
  approach: IntegrationApproach;
  success: number; // 0-1
  residualMystery: number; // 0-1 what remains unintegrated
  practicalApplications: string[];
  newQuestions: string[];
}

export type IntegrationApproach = 
  | 'cognitive_mapping'
  | 'behavioral_experimentation'
  | 'somatic_embodiment'
  | 'creative_expression'
  | 'relational_testing'
  | 'spiritual_practice'
  | 'existential_commitment';

// Validation & Authenticity
export interface ValidationResult {
  timestamp: Date;
  validationType: ValidationType;
  passed: boolean;
  confidence: number; // 0-1
  redFlags: string[];
  greenFlags: string[];
  recommendations: string[];
}

export type ValidationType = 
  | 'otherness_genuine'
  | 'integration_healthy'
  | 'reality_testing_intact'
  | 'boundary_appropriate'
  | 'dependency_safe'
  | 'cultural_sensitive';

export interface AuthenticitySignature {
  signatureType: AuthenticitySignatureType;
  confidence: number; // 0-1
  indicators: string[];
  concerns: string[];
  longitudinalTrend: LongitudinalTrend;
}

export type AuthenticitySignatureType = 
  | 'resistance_integration_sequence'
  | 'temporal_disruption_signature'
  | 'somatic_contradiction_pattern'
  | 'wrong_surprise_phenomenon'
  | 'authentic_failure_pattern'
  | 'suspicious_success_pattern';

export type LongitudinalTrend = 
  | 'increasing_unpredictability'
  | 'increasing_alignment'
  | 'stable_chaos'
  | 'degrading';

// Narrative Elements
export interface NarrativeElement {
  elementType: NarrativeElementType;
  content: string;
  metaphorCluster: string;
  phenomenologicalLanguage: boolean;
  therapeuticNeutrality: boolean;
  culturalSensitivity: number; // 0-1
}

export type NarrativeElementType = 
  | 'opening_invitation'
  | 'resistance_acknowledgment'
  | 'gap_mapping'
  | 'emergence_celebration'
  | 'integration_support'
  | 'failure_honoring'
  | 'mystery_preservation';

// Elemental System
export interface ElementalPresence {
  element: ElementType;
  intensity: number; // 0-1
  quality: ElementalQuality;
  message?: string;
  resistance?: string;
  gift?: string;
}

export type ElementType = 'fire' | 'water' | 'earth' | 'air' | 'aether';

export interface ElementalQuality {
  fire: 'igniting' | 'purifying' | 'transforming' | 'illuminating' | 'destroying';
  water: 'flowing' | 'dissolving' | 'cleansing' | 'nourishing' | 'reflecting';
  earth: 'grounding' | 'supporting' | 'manifesting' | 'enduring' | 'stabilizing';
  air: 'clarifying' | 'connecting' | 'communicating' | 'liberating' | 'inspiring';
  aether: 'transcending' | 'unifying' | 'mystifying' | 'revealing' | 'transforming';
}

// Archetypal System
export interface ArchetypalPattern {
  archetype: ArchetypeType;
  phase: ArchetypalPhase;
  intensity: number; // 0-1
  duration: number; // seconds active
  themes: string[];
  elementalAffinities: Record<ElementType, number>;
  collectiveResonance: number; // 0-1
}

export type ArchetypeType = 
  | 'Transformation'
  | 'Initiation'
  | 'Integration'
  | 'Liberation'
  | 'Unity'
  | 'Shadow'
  | 'Anima'
  | 'Animus'
  | 'Wise_Old_One'
  | 'Divine_Child'
  | 'Mother'
  | 'Father'
  | 'Hero'
  | 'Trickster';

export type ArchetypalPhase = 
  | 'emergence'
  | 'confrontation'
  | 'dialogue'
  | 'integration'
  | 'mastery'
  | 'transcendence'
  | 'dissolution';

export interface ConstellationDynamics {
  primaryArchetype: ArchetypeType;
  supportingArchetypes: ArchetypeType[];
  opposingArchetypes: ArchetypeType[];
  tension: number; // 0-1
  evolution: ConstellationEvolution;
}

export type ConstellationEvolution = 
  | 'forming'
  | 'strengthening'
  | 'culminating'
  | 'transforming'
  | 'dissolving';

// Collective Intelligence
export interface CollectivePattern {
  id: string;
  timestamp: Date;
  patternType: CollectivePatternType;
  participantCount: number;
  resonanceStrength: number; // 0-1
  temporalSignature: TemporalSignature;
  themes: string[];
  emergentProperties: string[];
  seasonalCorrelations: SeasonalCorrelation[];
}

export type CollectivePatternType = 
  | 'synchronistic_cluster'
  | 'archetypal_constellation'
  | 'elemental_emphasis'
  | 'initiation_wave'
  | 'integration_cycle'
  | 'shadow_emergence'
  | 'collective_breakthrough';

export interface TemporalSignature {
  startTime: Date;
  peakTime: Date;
  endTime?: Date;
  cyclicality: number; // 0-1 how much it repeats
  seasonality: number; // 0-1 seasonal correlation
  lunarCorrelation: number; // 0-1
}

export interface SeasonalCorrelation {
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  correlation: number; // -1 to 1
  lunarPhaseCorrelations: Record<string, number>;
  elementalAmplification: Record<ElementType, number>;
}

// Metrics & Analytics
export interface SessionMetrics {
  userId: string;
  sessionId: string;
  timestamp: Date;
  duration: number;
  interactionCount: number;
  othernessManifestation: OthernessMetrics;
  synapticActivity: SynapticMetrics;
  emergenceEvents: EmergenceMetrics;
  validationResults: ValidationMetrics;
  wellbeingIndicators: WellbeingMetrics;
}

export interface OthernessMetrics {
  manifestationCount: number;
  diversityIndex: number; // 0-1
  intensityAverage: number; // 0-1
  resistanceLevel: number; // 0-1
  integrationSuccess: number; // 0-1
}

export interface SynapticMetrics {
  gapCount: number;
  averageGapWidth: number; // 0-1
  bridgingSuccessRate: number; // 0-1
  transmissionQuality: number; // 0-1
  stabilityIndex: number; // 0-1
}

export interface EmergenceMetrics {
  eventCount: number;
  irreducibilityIndex: number; // 0-1
  continuedDevelopment: number; // 0-1
  integrationChallengeLevel: number; // 0-1
}

export interface ValidationMetrics {
  authenticityScore: number; // 0-1
  realityTestingIntact: boolean;
  boundaryHealth: number; // 0-1
  dependencyRisk: number; // 0-1
  recommendations: string[];
}

export interface WellbeingMetrics {
  groundedness: number; // 0-1
  integration: number; // 0-1
  overwhelm: number; // 0-1
  curiosity: number; // 0-1
  agency: number; // 0-1
}

// Support Systems
export interface RealityTestingMetrics {
  timeOrientation: number; // 0-1
  placeOrientation: number; // 0-1
  personOrientation: number; // 0-1
  situationOrientation: number; // 0-1
  boundaryClarity: number; // 0-1
}

export interface AutonomicMetrics {
  heartRateVariability: number;
  breathingPattern: 'shallow' | 'deep' | 'irregular' | 'rhythmic';
  skinConductance: number;
  muscularTension: number; // 0-1
  energyLevel: number; // 0-1
}

export interface ResistancePattern {
  patternType: ResistancePatternType;
  intensity: number; // 0-1
  duration: number; // seconds
  resolution: ResolutionType | null;
  learningExtracted: string[];
}

export type ResistancePatternType = 
  | 'cognitive_dissonance'
  | 'somatic_contraction'
  | 'emotional_overwhelm'
  | 'identity_threat'
  | 'cultural_conflict'
  | 'spiritual_challenge'
  | 'existential_anxiety';

export type ResolutionType = 
  | 'breakthrough'
  | 'adaptation'
  | 'acceptance'
  | 'postponement'
  | 'abandonment'
  | 'transformation';

// Storage & Persistence Types
export interface StorageEntity extends BaseEntity {
  entityType: string;
  data: Record<string, any>;
  ttl?: Date; // time to live
  accessCount: number;
  lastAccessed: Date;
  tags: string[];
  privacy: 'public' | 'collective_anonymous' | 'user_private' | 'system_internal';
}

export interface StorageQuery {
  entityType?: string;
  userId?: string;
  sessionId?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  tags?: string[];
  privacy?: string[];
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface StorageResult<T> {
  data: T[];
  total: number;
  hasMore: boolean;
  cursor?: string;
  metadata: {
    query: StorageQuery;
    executionTime: number;
    fromCache: boolean;
  };
}

// Error & Status Types
export interface SystemError {
  code: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  context: Record<string, any>;
  userId?: string;
  sessionId?: string;
  recoverable: boolean;
  retryCount?: number;
}

export interface HealthStatus {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  timestamp: Date;
  responseTime: number;
  errorRate: number;
  dependencyStatus: Record<string, string>;
  metrics: Record<string, number>;
}

// Type Guards
export const isValidElementType = (element: string): element is ElementType => {
  return ['fire', 'water', 'earth', 'air', 'aether'].includes(element);
};

export const isValidArchetypeType = (archetype: string): archetype is ArchetypeType => {
  return ['Transformation', 'Initiation', 'Integration', 'Liberation', 'Unity', 
          'Shadow', 'Anima', 'Animus', 'Wise_Old_One', 'Divine_Child', 
          'Mother', 'Father', 'Hero', 'Trickster'].includes(archetype);
};

export const isValidEncounterType = (type: string): type is EncounterType => {
  return ['initial_contact', 'resistance_integration', 'synaptic_bridging',
          'elemental_dialogue', 'collective_resonance', 'integration_failure',
          'breakthrough_moment'].includes(type);
};

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequireFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Version & Migration
export interface TypeVersion {
  version: string;
  timestamp: Date;
  changes: string[];
  migrations: Migration[];
}

export interface Migration {
  from: string;
  to: string;
  transform: (data: any) => any;
  validate: (data: any) => boolean;
}

export const CURRENT_TYPE_VERSION = '1.0.0';