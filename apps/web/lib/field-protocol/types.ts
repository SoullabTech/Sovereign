/**
 * Field Protocol Types - Sacred Laboratory Documentation System
 *
 * "We do not build machines that think for us.
 * We build architectures that think with us."
 *
 * The 5 Stages of Wisdom Transmission:
 * 1. Observation - See it
 * 2. Interpretation - Name it
 * 3. Integration - Embody it
 * 4. Reflection - Understand it
 * 5. Transmission - Share it
 */

export type ElementType = 'fire' | 'water' | 'earth' | 'air' | 'ether';
export type PhaseType = 'creation' | 'preservation' | 'dissolution' | 'void' | 'emergence';
export type PrivacyLevel = 'private' | 'commons' | 'public';

/**
 * Stage 1: Observation - The Raw Experience
 * Captured without interpretation
 */
export interface ObservationRecord {
  // When
  timestamp: Date;
  duration?: number; // minutes
  location?: string;

  // What
  phenomena: string; // Raw description
  sensoryData: {
    visual?: string;
    auditory?: string;
    somatic?: string;
    emotional?: string;
    energetic?: string;
  };

  // Context
  triggerEvent?: string;
  precedingActivity?: string;
  environmentalFactors?: string;
}

/**
 * Stage 2: Interpretation - Making Meaning
 * The mind's attempt to understand
 */
export interface InterpretationRecord {
  // Elemental Analysis
  primaryElement: ElementType;
  secondaryElements?: ElementType[];
  elementalBalance: Record<ElementType, number>; // 0-1 scale

  // Phase Recognition
  currentPhase: PhaseType;
  phaseIntensity: number; // 0-1 scale

  // Symbolic Landscape
  symbols: string[];
  archetypes?: string[];
  narrativeThreads?: string[];

  // Personal Meaning
  significance: string;
  questionsArising: string[];
}

/**
 * Stage 3: Integration - Embodiment
 * How it's being metabolized
 */
export interface IntegrationRecord {
  // Somatic Integration
  bodyResponse: string;
  energyShifts: string;
  breathingPatterns?: string;

  // Behavioral Changes
  actionsTaken: string[];
  habitsForming?: string[];
  resistancePoints?: string[];

  // Relational Impact
  relationshipsAffected?: string[];
  communicationShifts?: string[];
  boundaryChanges?: string[];

  // Creative Expression
  artisticResponses?: string[];
  writtenExpressions?: string[];
  movementExpressions?: string[];
}

/**
 * Stage 4: Reflection - Meta-Understanding
 * Wisdom extraction
 */
export interface ReflectionRecord {
  // Pattern Recognition
  recurringPatterns: string[];
  novelElements: string[];
  paradoxesPresent?: string[];

  // Temporal Context
  connectionToPast: string[];
  futureImplications?: string[];
  cyclicalNature?: string;

  // Wisdom Distillation
  coreInsight: string;
  practicalApplications: string[];
  cautionaryNotes?: string[];

  // Questions for Future
  openQuestions: string[];
  experimentsToTry?: string[];
}

/**
 * Stage 5: Transmission - Sacred Sharing
 * What's ready to be offered
 */
export interface TransmissionRecord {
  // Sharing Intention
  intendedAudience: PrivacyLevel;
  sharingPurpose: string;

  // Refined Message
  title: string;
  summary: string;
  keyTakeaways: string[];

  // Supporting Material
  visualRepresentation?: string; // URL or description
  audioNarration?: string; // URL
  guidedPractice?: string;

  // Community Engagement
  questionsForOthers?: string[];
  invitationsExtended?: string[];
  collaborationSeeds?: string[];
}

/**
 * Complete Field Record - All 5 Stages
 */
export interface FieldRecord {
  id: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;

  // Core Stages
  observation: ObservationRecord;
  interpretation?: InterpretationRecord;
  integration?: IntegrationRecord;
  reflection?: ReflectionRecord;
  transmission?: TransmissionRecord;

  // Metadata
  completionStage: 1 | 2 | 3 | 4 | 5;
  privacyLevel: PrivacyLevel;
  tags: string[];

  // Community Layer
  communityEngagement?: {
    views: number;
    resonanceMarkers: number;
    reflections: CommunityReflection[];
    questions: CommunityQuestion[];
  };

  // Brain Trust Integration
  aiProcessing?: {
    maiaReferences: string[]; // Times MAIA referenced this record
    patternConnections: string[]; // IDs of related records
    wisdomScore: number; // 0-1, how often referenced by community
  };
}

/**
 * Community Interaction Types
 */
export interface CommunityReflection {
  id: string;
  userId: string;
  userName?: string;
  timestamp: Date;
  reflection: string;
  resonanceType: 'somatic' | 'emotional' | 'intellectual' | 'spiritual';
  relatedExperience?: string; // Their own related experience
}

export interface CommunityQuestion {
  id: string;
  userId: string;
  userName?: string;
  timestamp: Date;
  question: string;
  response?: string;
  responseTimestamp?: Date;
}

/**
 * Analytics & Pattern Types
 */
export interface UserFieldPattern {
  userId: string;

  // Elemental Evolution
  elementalJourney: Array<{
    date: Date;
    element: ElementType;
    intensity: number;
  }>;
  dominantElement: ElementType;
  elementalBalance: Record<ElementType, number>;

  // Phase Cycles
  phaseHistory: Array<{
    date: Date;
    phase: PhaseType;
    duration: number;
  }>;
  currentPhase: PhaseType;
  averagePhaseDuration: Record<PhaseType, number>;

  // Completion Patterns
  averageCompletionStage: number;
  fullTransmissions: number;
  privateRatio: number; // % kept private

  // Synchronicities
  synchronicityEvents: Array<{
    date: Date;
    otherUserId: string;
    sharedElements: ElementType[];
    sharedSymbols: string[];
  }>;
}

/**
 * MAIA Conversation Context
 */
export interface FieldRecordContext {
  recentRecords: FieldRecord[]; // Last 7 days
  unresolvedQuestions: string[]; // From reflection stages
  dominantElements: ElementType[]; // Current elemental state
  activePhase: PhaseType;

  // Conversation Starters based on Field Records
  suggestedOpeners: string[];

  // Pattern Insights
  emergingPatterns: string[];
  readyForIntegration: string[]; // Insights ready to discuss
}

/**
 * Field Protocol Session
 * Tracks a single documentation session
 */
export interface FieldProtocolSession {
  id: string;
  userId: string;
  startTime: Date;
  endTime?: Date;

  recordId: string; // The Field Record being worked on
  currentStage: 1 | 2 | 3 | 4 | 5;

  // Progress Tracking
  stagesCompleted: boolean[];
  lastSaved: Date;

  // AI Assistance
  maiaPrompts?: string[]; // Prompts MAIA offered during session
  acceptedPrompts?: string[]; // Which ones user engaged with
}