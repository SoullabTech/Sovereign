// Personal Oracle Matching and Personality System

export interface ElementalAssessment {
  fire: number; // Vision, creativity, passion (0-100)
  water: number; // Emotion, intuition, flow (0-100)
  earth: number; // Grounding, manifestation, stability (0-100)
  air: number; // Communication, clarity, analysis (0-100)
  aether: number; // Integration, transcendence, unity (0-100)

  // Derived metrics
  dominantElement: string;
  secondaryElement: string;
  needsBalancing: string[];
  evolutionPath: string;
  crystallizationLevel: number; // 0-100: How integrated their elements are
}

export interface PersonalityVector {
  // Communication style
  communicationStyle:
    | "direct"
    | "metaphorical"
    | "questioning"
    | "storytelling"
    | "energetic";

  // Guidance approach
  guidanceStyle:
    | "supportive"
    | "challenging"
    | "investigative"
    | "visionary"
    | "nurturing";

  // Depth preference
  depthPreference: "surface" | "moderate" | "deep" | "mystical";

  // Interaction tempo
  tempo:
    | "slow_contemplative"
    | "steady_rhythm"
    | "dynamic_flow"
    | "intense_bursts";

  // Shadow work approach
  shadowApproach:
    | "gentle_integration"
    | "direct_confrontation"
    | "playful_exploration"
    | "sacred_witnessing";

  // Learning style preference
  learningStyle:
    | "experiential"
    | "conceptual"
    | "embodied"
    | "intuitive"
    | "systematic";
}

export interface OraclePersonality {
  // Core identity
  name: string;
  element: string;
  archetype: string;
  subArchetype: string; // More specific than primary archetype

  // Personality traits
  primaryTraits: string[];
  shadowTraits: string[];
  giftQualities: string[];

  // Voice characteristics
  voiceProfile: {
    tone: string;
    vocabulary: string[];
    phrasePatterns: string[];
    metaphorStyle: string;
    questioningStyle: string;
  };

  // Guidance specialties
  specialties: {
    primaryFocus: string[];
    healingApproach: string[];
    growthCatalysts: string[];
    integrationMethods: string[];
  };

  // Relationship dynamics
  relationshipStyle: {
    connectionApproach: string;
    boundaryStyle: string;
    challengeMethod: string;
    supportMethod: string;
  };

  // Evolution path for this specific participant
  evolutionJourney: {
    currentPhase: string;
    nextGrowthEdge: string;
    deepestCalling: string;
    shadowToIntegrate: string;
  };
}

export interface ParticipantContext {
  // Basic info
  participantId: string;
  personalInfo: {
    preferredName: string;
    communicationPreferences: string[];
    sensitivityLevel: "low" | "medium" | "high" | "extremely_sensitive";
    traumaInformed: boolean;
  };

  // Current state
  currentState: {
    emotionalTone: string;
    energyLevel: number;
    primaryChallenge: string;
    seekingGuidanceOn: string[];
    readinessLevel: number; // 0-100: How ready for transformation
    safetyNeeds: string[];
  };

  // Retreat intentions
  intentions: {
    primaryIntention: string;
    secondaryIntentions: string[];
    desiredOutcomes: string[];
    openToExploring: string[];
    avoidingOrFearing: string[];
    previousExperiences: string[];
  };

  // Elemental profile
  elementalProfile: ElementalAssessment;

  // Life context
  lifeContext: {
    majorTransitions: string[];
    relationshipStatus: string;
    workLifeBalance: string;
    spiritualPractices: string[];
    mentalHealthContext: string[];
  };

  // Learning & growth patterns
  growthPatterns: {
    howTheyLearnBest: string[];
    whatMotivatesthem: string[];
    whatBlocksThem: string[];
    pastTransformations: string[];
    currentGrowthEdge: string;
  };
}

export interface PersonalOracleMatch {
  // Match metadata
  matchId: string;
  participantId: string;
  matchScore: number; // 0-100: How well matched
  matchReasoning: string[];

  // Oracle configuration
  oraclePersonality: OraclePersonality;
  personalizations: {
    customPrompts: string[];
    adaptationRules: string[];
    growthChallenges: string[];
    safetyProtocols: string[];
  };

  // Relationship parameters
  relationshipDynamics: {
    initialConnectionStrategy: string;
    progressionPath: string[];
    milestoneRecognitions: string[];
    evolutionTriggers: string[];
  };

  // Pre-retreat preparation
  preRetreatWork: {
    introductionSequence: string[];
    preparationGuidances: string[];
    intentionDeepening: string[];
    expectationSetting: string[];
  };

  // Retreat-mode configuration
  retreatMode: {
    dailyRhythm: string;
    intensityLevel: string;
    integrationSupport: string[];
    crisisProtocols: string[];
  };

  // Post-retreat evolution
  postRetreatPath: {
    integrationPlan: string[];
    ongoingSupport: string[];
    evolutionGoals: string[];
    checkInSchedule: string;
  };
}

export interface OracleArchetypeTemplate {
  element: string;
  name: string;
  description: string;

  // Personality variations
  variations: {
    [key: string]: {
      traits: string[];
      specialties: string[];
      communicationStyle: string;
      bestMatchedWith: string[];
    };
  };

  // Guidance approaches
  approaches: {
    supportive: string[];
    challenging: string[];
    healing: string[];
    visionary: string[];
  };

  // Evolution paths this archetype can guide
  evolutionPaths: string[];
}
