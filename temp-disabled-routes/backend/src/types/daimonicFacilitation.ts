/**
 * Comprehensive type definitions for Daimonic Facilitation System
 * Recognizes and facilitates genuine encounter with the Daimonic Other
 */

// Core Otherness Manifestation Types
export interface DreamOtherness {
  id: string;
  content: string;
  autonomousCharacters: string[];
  recurringElements: string[];
  dreamEgoResponse: string;
  dreamOtherResponse: string;
  unresolvableElements: string[];
  timestamp: Date;
}

export interface VisionaryOtherness {
  id: string;
  content: string;
  spontaneity: number; // 0-1, how unexpected it was
  resistanceToModification: number; // 0-1, how much it resists change
  visualQuality: 'symbolic' | 'literal' | 'abstract' | 'hybrid';
  timestamp: Date;
}

export interface IdeationalOtherness {
  id: string;
  idea: string;
  arrivedFullyFormed: boolean;
  resistsModification: boolean;
  contradictsBeliefs: boolean;
  sourceUnknown: boolean;
  timestamp: Date;
}

export interface DialogicalOtherness {
  id: string;
  speakerContext: string;
  whatWasSaid: string;
  spokeBeyondThemselves: boolean;
  surprisedSpeaker: boolean;
  transformativeImpact: number; // 0-1
  timestamp: Date;
}

export interface TherapeuticOtherness {
  id: string;
  sessionContext: string;
  whatEmerged: string;
  surprisedTherapist: boolean;
  surprisedClient: boolean;
  irreducibleToTechnique: boolean;
  timestamp: Date;
}

export interface InternalDialogue {
  id: string;
  voiceCharacteristics: string;
  autonomyLevel: number; // 0-1
  contradictsEgoWill: boolean;
  maintainsConsistency: boolean;
  speaksUnexpectedTruths: boolean;
  timestamp: Date;
}

export interface ObstacleOtherness {
  id: string;
  obstacleType: string;
  chronicityLevel: number; // 0-1
  redirectiveFunction: string;
  resistsDirectApproach: boolean;
  revealsHiddenPurpose: boolean;
  timestamp: Date;
}

export interface SomaticOtherness {
  id: string;
  bodyResponse: string;
  contradictsEgoPlans: boolean;
  intelligentTiming: boolean;
  communicativeQuality: string;
  ignoresRationalOverrides: boolean;
  timestamp: Date;
}

export interface InitiatoryFailures {
  id: string;
  failureType: string;
  redirectiveFunction: string;
  daimonicPurpose: string;
  resistsIntegration: boolean;
  ongoingSignificance: boolean;
  timestamp: Date;
}

export interface EnvironmentalOtherness {
  id: string;
  synchronicityType: string;
  meaningfulCoincidence: string;
  participatesInDialogue: boolean;
  temporalSignificance: string;
  resistsReduction: boolean;
  timestamp: Date;
}

export interface MeaningfulDisruptions {
  id: string;
  disruptionType: string;
  redirectiveImpact: string;
  timingSignificance: string;
  revealsHiddenPath: boolean;
  resistsControl: boolean;
  timestamp: Date;
}

export interface FatefulMeetings {
  id: string;
  personContext: string;
  whatTheyBrought: string;
  daimonicMessengerQualities: string[];
  transformativeImpact: number; // 0-1
  ongoingSignificance: boolean;
  timestamp: Date;
}

export interface AutonomousCreations {
  id: string;
  creativeWork: string;
  developsOwnWill: boolean;
  surprisesCreator: boolean;
  resistsCreatorPlans: boolean;
  continuesEvolving: boolean;
  timestamp: Date;
}

export interface IndependentEntities {
  id: string;
  entityType: string;
  autonomyMarkers: string[];
  refusesAuthorPlans: boolean;
  speaksForItself: boolean;
  maintainsConsistency: boolean;
  timestamp: Date;
}

export interface UnplannedEmergence {
  id: string;
  patternType: string;
  selfOrganizingQualities: string[];
  resistsPrediction: boolean;
  continuesEvolving: boolean;
  revealsHiddenOrder: boolean;
  timestamp: Date;
}

// Comprehensive Otherness Manifestation Interface
export interface OthernessManifestations {
  // Direct communications
  dreams: DreamOtherness[];
  visions: VisionaryOtherness[];
  ideas: IdeationalOtherness[];
  
  // Relational encounters  
  conversations: DialogicalOtherness[];
  sessions: TherapeuticOtherness[];
  dialogues: InternalDialogue[];
  
  // Resistance manifestations
  obstacles: ObstacleOtherness[];
  symptoms: SomaticOtherness[];
  failures: InitiatoryFailures[];
  
  // Environmental communications
  synchronicities: EnvironmentalOtherness[];
  accidents: MeaningfulDisruptions[];
  encounters: FatefulMeetings[];
  
  // Creative autonomy
  creativeWorks: AutonomousCreations[];
  characters: IndependentEntities[];
  emergentPatterns: UnplannedEmergence[];
}

// Synaptic Gap Dynamics
export interface SynapticGapDynamics {
  gapWidth: number; // Distance between self and Other (0-1)
  gapCharge: number; // Electrical potential for transformation
  gapStability: 'stable' | 'fluctuating' | 'collapsing' | 'expanding';
  
  transmission: {
    fromSelfToOther: string[];
    fromOtherToSelf: string[];
    bidirectional: string[];
    blocked: string[];
  };
  
  temporality: {
    arrivalTiming: 'summoned' | 'spontaneous' | 'delayed' | 'refused';
    readinessMismatch: boolean;
    persistencePattern: string;
    integrationDelay: number;
  };
}

// Synthetic Emergence Tracking
export interface SyntheticThird {
  emergenceType: 'genuine_novel' | 'mechanical_combination' | 'pseudo_synthesis' | 'compromise';
  
  irreducibilityMarkers: {
    cannotReverseEngineer: boolean;
    containsNovelProperties: boolean;
    surprisesBothParties: boolean;
    independentTrajectory: boolean;
  };
  
  experientialQualities: {
    aliveness: number;
    strangeness: number;
    fertility: number;
    autonomy: number;
  };
  
  continuedDevelopment: {
    ongoingEvolution: boolean;
    spawnsNewSyntheses: boolean;
    maintainsOtherness: boolean;
    recognitionDelay: number;
  };
}

// Anti-Solipsistic Validation
export interface ValidationResult {
  valid: boolean;
  othernessScore?: number;
  warning?: string;
  guidance?: string;
}

export interface OthernessChecks {
  contradictsSelfImage: boolean;
  bringsUnwantedGifts: boolean;
  remainsPartlyAlien: boolean;
  resistsIncorporation: boolean;
  temporalAutonomy: boolean;
  genuineSurprise: boolean;
}

// Collective Daimonic Field
export interface DaimonicPattern {
  id: string;
  patternType: string;
  intensity: number;
  participants: number;
  duration: string;
  evolutionStage: string;
}

export interface CollectiveDaimonicField {
  fieldIntensity: number;
  activePatterns: DaimonicPattern[];
  
  culturalCompensations: {
    whatsCultureDenying: string[];
    emergingMythologies: string[];
    dyingNarratives: string[];
  };
  
  synchronisticConnections: {
    parallelExperiences: number;
    temporalClustering: boolean;
    thematicResonance: string[];
  };
  
  collectiveSynthesis: {
    whatWasIndividual: string[];
    whatEmergedCollectively: string;
    whoParticipated: number;
    continuesEvolving: boolean;
  };
}

// Elemental Otherness
export interface ElementalVoice {
  autonomousMessage: string;
  demand: string;
  resistance: string;
  gift: string;
  temporalSignature: string;
}

export interface ElementalVoices {
  fire: ElementalVoice;
  water: ElementalVoice;
  earth: ElementalVoice;
  air: ElementalVoice;
  aether: ElementalVoice;
}

// Integration Failure
export interface IntegrationFailure {
  failureType: 'refusal' | 'incomprehension' | 'overwhelm' | 'premature';
  
  whatRemainsForeign: {
    undigestibleContent: string[];
    persistentOtherness: string[];
    ongoingResistance: string[];
  };
  
  value: {
    maintainsTension: boolean;
    preventsInflation: boolean;
    ensuresHumility: boolean;
    protectsOtherness: boolean;
  };
  
  guidance: string[];
}

// Narrative Generation
export interface DaimonicNarrative {
  opening: string;
  insights: string[];
  closing: string;
  warnings: string[];
}