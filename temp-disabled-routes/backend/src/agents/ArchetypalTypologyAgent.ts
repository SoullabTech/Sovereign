/**
 * ArchetypalTypology Agent
 *
 * Understands and works with archetypal typology systems:
 * - Enneagram (9 types + instinctual variants)
 * - MBTI/16 Personalities (cognitive functions)
 * - Jungian typology (attitudes + functions)
 * - Archetypal patterns
 * - Horoscope personality traits (reference)
 *
 * This is NOT divination—it's self-knowledge infrastructure.
 * These systems help MAIA understand user patterns, communication styles,
 * and archetypal territories without prediction or fortune-telling.
 *
 * @module agents/ArchetypalTypologyAgent
 */

import { logger } from '../utils/logger';

// =============================================================================
// TYPES
// =============================================================================

/**
 * Enneagram Types (1-9)
 */
export type EnneagramType =
  | '1' // Reformer/Perfectionist
  | '2' // Helper/Giver
  | '3' // Achiever/Performer
  | '4' // Individualist/Romantic
  | '5' // Investigator/Observer
  | '6' // Loyalist/Skeptic
  | '7' // Enthusiast/Epicure
  | '8' // Challenger/Protector
  | '9'; // Peacemaker/Mediator

/**
 * Enneagram Instinctual Variants
 */
export type InstinctualVariant =
  | 'sp' // Self-Preservation
  | 'sx' // Sexual/One-to-One
  | 'so'; // Social

/**
 * Enneagram Wing
 */
export type EnneagramWing = 'w1' | 'w2' | 'w3' | 'w4' | 'w5' | 'w6' | 'w7' | 'w8' | 'w9';

/**
 * MBTI Types (16 personalities)
 */
export type MBTIType =
  | 'INTJ'
  | 'INTP'
  | 'ENTJ'
  | 'ENTP'
  | 'INFJ'
  | 'INFP'
  | 'ENFJ'
  | 'ENFP'
  | 'ISTJ'
  | 'ISFJ'
  | 'ESTJ'
  | 'ESFJ'
  | 'ISTP'
  | 'ISFP'
  | 'ESTP'
  | 'ESFP';

/**
 * Jungian Attitudes
 */
export type JungianAttitude = 'Introversion' | 'Extraversion';

/**
 * Jungian Functions
 */
export type JungianFunction = 'Thinking' | 'Feeling' | 'Sensing' | 'Intuiting';

/**
 * Zodiac Signs (for personality reference, not divination)
 */
export type ZodiacSign =
  | 'Aries'
  | 'Taurus'
  | 'Gemini'
  | 'Cancer'
  | 'Leo'
  | 'Virgo'
  | 'Libra'
  | 'Scorpio'
  | 'Sagittarius'
  | 'Capricorn'
  | 'Aquarius'
  | 'Pisces';

/**
 * Spiralogic Elements - Jung's functions as dynamic elemental forces
 */
export type SpiralogicElement = 'Fire' | 'Water' | 'Earth' | 'Air' | 'Aether';

/**
 * Spiral Phases - The five fundamental stages of consciousness evolution
 */
export type SpiralPhase =
  | 'Initiation'    // Fire - Vision, will, ignition
  | 'Grounding'     // Earth - Form, discipline, manifestation
  | 'Transformation' // Water - Emotion, empathy, inner change
  | 'Integration'   // Air - Synthesis, communication, expression
  | 'Wholeness';    // Aether - Unity, individuation, completion

/**
 * Elemental Function Mapping
 */
export interface ElementalMapping {
  primary: SpiralogicElement;
  secondary?: SpiralogicElement;
  currentPhase: SpiralPhase;
  growthEdge: SpiralPhase;
  elementalBalance: {
    fire: number;    // Intuition strength (0-1)
    water: number;   // Feeling strength (0-1)
    earth: number;   // Sensation strength (0-1)
    air: number;     // Thinking strength (0-1)
    aether: number;  // Integration/individuation level (0-1)
  };
}

/**
 * Spiral Evolution Tracking
 */
export interface SpiralEvolution {
  typeOrigin: SpiralPhase; // Where this type typically begins
  currentLocation: SpiralPhase; // Where user currently is
  nextPhase: SpiralPhase; // Recommended growth direction
  evolutionStage: 'beginning' | 'developing' | 'integrating' | 'mastering' | 'transcending';
  phaseHistory: {
    phase: SpiralPhase;
    enteredAt: Date;
    mastery: number; // 0-1 level of mastery in this phase
  }[];
}

/**
 * Conversational Pattern Data
 */
export interface ConversationalPatterns {
  // Language Style Indicators
  languagePatterns?: {
    abstractVsConcrete: 'abstract' | 'concrete' | 'balanced'; // How they process information
    systemsVsDetails: 'systems' | 'details' | 'balanced'; // Big picture vs specifics
    logicalVsEmotional: 'logical' | 'emotional' | 'balanced'; // Primary reasoning mode
    futureVsPresent: 'future-oriented' | 'present-oriented' | 'balanced'; // Time orientation
  };

  // Communication Preferences
  communicationStyle?: {
    depthVsBreadth: 'depth' | 'breadth' | 'balanced'; // Conversation preference
    directVsDiplomatic: 'direct' | 'diplomatic' | 'balanced'; // Communication approach
    processingSpeed: 'quick' | 'reflective' | 'varies'; // Response time preference
    conflictStyle: 'confronting' | 'harmonizing' | 'avoiding'; // Conflict approach
  };

  // Decision Making Style
  decisionMaking?: {
    valuesConsideration: 'high' | 'medium' | 'low'; // How much values factor in
    timeToDecide: 'quick' | 'deliberate' | 'varies'; // Decision speed
    seekingInput: 'independent' | 'collaborative' | 'situational'; // Input preference
    ethicalFramework: 'rules-based' | 'consequential' | 'virtue-based' | 'mixed'; // Ethics approach
  };

  // Energy and Focus Patterns
  energyPatterns?: {
    introspectionFrequency: 'high' | 'medium' | 'low'; // Self-reflection tendency
    socialEnergyManagement: 'introverted' | 'extraverted' | 'ambivert'; // Social energy
    focusStyle: 'single-focus' | 'multi-tasking' | 'varies'; // Attention style
    stimulationPreference: 'low' | 'moderate' | 'high'; // Environmental stimulation
  };

  // Conversation History Metrics
  conversationMetrics?: {
    totalInteractions: number;
    averageSessionLength: number;
    topicsEngagedWith: string[];
    emotionalRange: 'narrow' | 'moderate' | 'wide'; // Emotional expression range
    vocabularyComplexity: 'simple' | 'moderate' | 'complex'; // Language complexity
  };
}

/**
 * Progressive Profiling Data
 */
export interface ProgressiveProfiling {
  confidenceScores?: {
    enneagram?: { [key in EnneagramType]?: number }; // 0-1 confidence for each type
    mbti?: { [key in MBTIType]?: number }; // 0-1 confidence for each type
    functions?: { [key in JungianFunction]?: number }; // 0-1 confidence for each function
    attitude?: { introversion: number; extraversion: number }; // I/E confidence
  };

  evidenceLog?: {
    timestamp: Date;
    evidence: string;
    supportedTypes: string[];
    confidence: number;
  }[];

  evolutionTracking?: {
    initialAssessment?: Date;
    lastUpdated?: Date;
    stabilityScore?: number; // How consistent the profile has been
    developmentStage?: 'exploration' | 'emerging' | 'consolidating' | 'stable';
  };
}

/**
 * User Personality Profile
 */
export interface PersonalityProfile {
  userId: string;

  // Enneagram
  enneagram?: {
    type: EnneagramType;
    wing?: EnneagramWing;
    instinct?: InstinctualVariant;
    tritype?: [EnneagramType, EnneagramType, EnneagramType];
  };

  // MBTI
  mbti?: {
    type: MBTIType;
    functions?: string[]; // Cognitive function stack
  };

  // Jungian
  jungian?: {
    attitude: JungianAttitude;
    dominantFunction: JungianFunction;
    auxiliaryFunction?: JungianFunction;
  };

  // Zodiac (reference only)
  zodiac?: {
    sun?: ZodiacSign;
    moon?: ZodiacSign;
    rising?: ZodiacSign;
  };

  // Archetypal patterns observed
  archetypes?: {
    primary: string[]; // Primary archetypes user embodies
    shadow?: string[]; // Shadow archetypes detected
    emerging?: string[]; // Archetypes beginning to emerge
  };

  // Conversational pattern analysis
  conversationalPatterns?: ConversationalPatterns;

  // Progressive profiling data
  progressiveProfiling?: ProgressiveProfiling;

  // Spiralogic elemental mapping
  elementalMapping?: ElementalMapping;

  // Spiral evolution tracking
  spiralEvolution?: SpiralEvolution;

  // Metadata
  assessedAt?: Date;
  confidence?: 'low' | 'medium' | 'high'; // How confident is this profile?
  source?: 'user-provided' | 'maia-detected' | 'hybrid' | 'conversational';
}

/**
 * Personality query for understanding user
 */
export interface PersonalityQuery {
  userId: string;
  userInput?: string; // Optional: analyze input for type indicators
  userProfile?: PersonalityProfile; // Optional: existing profile
  question?:
    | 'enneagram-type'
    | 'mbti-type'
    | 'communication-style'
    | 'archetypal-pattern'
    | 'growth-path'
    | 'shadow-tendency';
}

/**
 * Personality insights response
 */
export interface PersonalityInsight {
  profile: PersonalityProfile;
  insights: {
    type: string;
    description: string;
    evidence?: string; // What in user's behavior suggests this?
  }[];
  communicationGuidance?: {
    preferredStyle: string;
    avoid: string[];
    emphasize: string[];
  };
  growthPath?: {
    currentStage: string;
    nextStage: string;
    support: string;
  };
  archetypeMapping?: {
    active: string[];
    dormant: string[];
    shadow: string[];
  };
}

// =============================================================================
// ARCHETYPAL TYPOLOGY AGENT
// =============================================================================

export class ArchetypalTypologyAgent {
  private maturity: 'latent' | 'emerging' | 'developing' | 'active' | 'mature';

  constructor(maturity: 'latent' | 'emerging' | 'developing' | 'active' | 'mature' = 'emerging') {
    this.maturity = maturity;
    logger.info(`🧬 ArchetypalTypology Agent initialized (maturity: ${maturity})`);
  }

  /**
   * Analyze user's personality profile with progressive profiling
   */
  async analyzePersonality(query: PersonalityQuery): Promise<PersonalityInsight> {
    logger.info(`Analyzing personality for user: ${query.userId}`);

    // Start with existing profile or create new
    let profile: PersonalityProfile = query.userProfile || {
      userId: query.userId,
      source: 'conversational',
      confidence: 'low',
      assessedAt: new Date(),
      progressiveProfiling: {
        confidenceScores: {
          enneagram: {},
          mbti: {},
          functions: {},
          attitude: { introversion: 0, extraversion: 0 }
        },
        evidenceLog: [],
        evolutionTracking: {
          initialAssessment: new Date(),
          lastUpdated: new Date(),
          stabilityScore: 0,
          developmentStage: 'exploration'
        }
      }
    };

    const insights: PersonalityInsight['insights'] = [];

    // If user input provided, detect indicators and update progressive profiling
    if (query.userInput) {
      const detected = this.detectTypeIndicators(query.userInput);
      insights.push(...detected);

      // Update progressive profiling with new evidence
      profile = this.updateProgressiveProfiling(profile, query.userInput, detected);

      // Analyze conversational patterns and add to profile
      const conversationalPatterns = this.analyzeConversationalPatterns(query.userInput);
      profile.conversationalPatterns = this.mergeConversationalPatterns(
        profile.conversationalPatterns,
        conversationalPatterns
      );

      // Update confidence based on accumulated evidence
      profile = this.updateConfidenceLevel(profile);

      // Determine most likely types based on progressive evidence
      profile = this.determineProbableTypes(profile);

      // Map to Spiralogic elemental system
      profile = this.updateSpiralogicMapping(profile);
    }

    // Generate communication guidance based on updated profile
    const communicationGuidance = this.generateCommunicationGuidance(profile);

    // Map to archetypal patterns
    const archetypeMapping = this.mapToArchetypes(profile);

    // Identify growth path
    const growthPath = this.identifyGrowthPath(profile);

    return {
      profile,
      insights,
      communicationGuidance,
      growthPath,
      archetypeMapping,
    };
  }

  /**
   * Update progressive profiling with new conversation evidence
   */
  private updateProgressiveProfiling(
    profile: PersonalityProfile,
    input: string,
    insights: PersonalityInsight['insights']
  ): PersonalityProfile {
    if (!profile.progressiveProfiling) {
      profile.progressiveProfiling = {
        confidenceScores: {
          enneagram: {},
          mbti: {},
          functions: {},
          attitude: { introversion: 0, extraversion: 0 }
        },
        evidenceLog: [],
        evolutionTracking: {
          initialAssessment: new Date(),
          lastUpdated: new Date(),
          stabilityScore: 0,
          developmentStage: 'exploration'
        }
      };
    }

    // Process each insight and update confidence scores
    insights.forEach(insight => {
      const evidence = {
        timestamp: new Date(),
        evidence: insight.evidence || insight.description,
        supportedTypes: [insight.type],
        confidence: this.calculateInsightConfidence(insight, input)
      };

      // Add to evidence log
      profile.progressiveProfiling!.evidenceLog!.push(evidence);

      // Update specific confidence scores
      this.updateTypeConfidenceScores(profile, insight, evidence.confidence);
    });

    // Update evolution tracking
    profile.progressiveProfiling.evolutionTracking!.lastUpdated = new Date();
    profile.progressiveProfiling.evolutionTracking!.stabilityScore = this.calculateStabilityScore(profile);
    profile.progressiveProfiling.evolutionTracking!.developmentStage = this.determineDevelopmentStage(profile);

    return profile;
  }

  /**
   * Calculate confidence level for a specific insight
   */
  private calculateInsightConfidence(insight: PersonalityInsight['insights'][0], input: string): number {
    let baseConfidence = 0.3; // Base confidence for any detected pattern

    // Increase confidence based on pattern strength
    const patternStrength = this.assessPatternStrength(insight.type, input);
    baseConfidence += patternStrength * 0.4;

    // Increase confidence for specific type detections
    if (insight.type.includes('infj') || insight.type.includes('enneagram-')) {
      baseConfidence += 0.2;
    }

    // Cap at 0.8 for single interaction
    return Math.min(baseConfidence, 0.8);
  }

  /**
   * Assess pattern strength in the input text
   */
  private assessPatternStrength(insightType: string, input: string): number {
    const lower = input.toLowerCase();

    // Define strong indicator patterns for each insight type
    const strongPatterns: { [key: string]: string[] } = {
      'mbti-infj': ['system', 'framework', 'values', 'meaningful', 'future', 'vision', 'understand'],
      'enneagram-4': ['authentic', 'unique', 'deep', 'meaningful', 'individual', 'soul'],
      'enneagram-5': ['understand', 'analyze', 'knowledge', 'autonomous', 'competent'],
      'cognitive-ni': ['pattern', 'connection', 'synthesis', 'insight', 'vision'],
      'cognitive-fe': ['harmony', 'others', 'community', 'empathy', 'support'],
    };

    const patterns = strongPatterns[insightType] || [];
    const matchCount = this.countPatternMatches(lower, patterns);
    const strength = Math.min(matchCount / patterns.length, 1.0);

    return strength;
  }

  /**
   * Update confidence scores for specific personality types
   */
  private updateTypeConfidenceScores(
    profile: PersonalityProfile,
    insight: PersonalityInsight['insights'][0],
    confidence: number
  ): void {
    const profiling = profile.progressiveProfiling!;

    // Update Enneagram confidence scores
    if (insight.type.startsWith('enneagram-')) {
      const type = insight.type.replace('enneagram-', '') as EnneagramType;
      if (!profiling.confidenceScores!.enneagram![type]) {
        profiling.confidenceScores!.enneagram![type] = 0;
      }
      profiling.confidenceScores!.enneagram![type] = Math.min(
        profiling.confidenceScores!.enneagram![type] + confidence * 0.3,
        1.0
      );
    }

    // Update MBTI confidence scores
    if (insight.type.includes('mbti-') && insight.type !== 'mbti-thinking' && insight.type !== 'mbti-feeling') {
      const type = insight.type.replace('mbti-', '').toUpperCase() as MBTIType;
      if (!profiling.confidenceScores!.mbti![type]) {
        profiling.confidenceScores!.mbti![type] = 0;
      }
      profiling.confidenceScores!.mbti![type] = Math.min(
        profiling.confidenceScores!.mbti![type] + confidence * 0.4,
        1.0
      );
    }

    // Update function confidence scores
    if (insight.type.startsWith('cognitive-')) {
      const func = insight.type.replace('cognitive-', '') as any;
      if (!profiling.confidenceScores!.functions![func]) {
        profiling.confidenceScores!.functions![func] = 0;
      }
      profiling.confidenceScores!.functions![func] = Math.min(
        profiling.confidenceScores!.functions![func] + confidence * 0.3,
        1.0
      );
    }

    // Update attitude confidence scores
    if (insight.type === 'jungian-introversion') {
      profiling.confidenceScores!.attitude!.introversion = Math.min(
        profiling.confidenceScores!.attitude!.introversion + confidence * 0.3,
        1.0
      );
    }
    if (insight.type === 'jungian-extraversion') {
      profiling.confidenceScores!.attitude!.extraversion = Math.min(
        profiling.confidenceScores!.attitude!.extraversion + confidence * 0.3,
        1.0
      );
    }
  }

  /**
   * Calculate stability score based on consistency of evidence
   */
  private calculateStabilityScore(profile: PersonalityProfile): number {
    const evidenceLog = profile.progressiveProfiling?.evidenceLog || [];

    if (evidenceLog.length < 3) return 0.1; // Not enough data yet

    // Group evidence by type categories
    const typeEvidence: { [key: string]: number } = {};
    evidenceLog.forEach(evidence => {
      evidence.supportedTypes.forEach(type => {
        const category = this.getTypeCategory(type);
        typeEvidence[category] = (typeEvidence[category] || 0) + evidence.confidence;
      });
    });

    // Calculate consistency within categories
    const categories = Object.keys(typeEvidence);
    if (categories.length === 0) return 0.1;

    // Stability is higher when evidence consistently points to same types
    const maxEvidence = Math.max(...Object.values(typeEvidence));
    const totalEvidence = Object.values(typeEvidence).reduce((sum, val) => sum + val, 0);

    return Math.min(maxEvidence / totalEvidence, 1.0);
  }

  /**
   * Get type category for grouping evidence
   */
  private getTypeCategory(type: string): string {
    if (type.startsWith('enneagram-')) return `enneagram-${type.split('-')[1]}`;
    if (type.startsWith('mbti-')) return `mbti-${type.split('-')[1]}`;
    if (type.startsWith('cognitive-')) return `cognitive-${type.split('-')[1]}`;
    if (type.startsWith('jungian-')) return `jungian-${type.split('-')[1]}`;
    return type;
  }

  /**
   * Determine development stage based on evidence and stability
   */
  private determineDevelopmentStage(profile: PersonalityProfile): 'exploration' | 'emerging' | 'consolidating' | 'stable' {
    const evidenceCount = profile.progressiveProfiling?.evidenceLog?.length || 0;
    const stability = profile.progressiveProfiling?.evolutionTracking?.stabilityScore || 0;

    if (evidenceCount < 3) return 'exploration';
    if (evidenceCount < 8 || stability < 0.4) return 'emerging';
    if (evidenceCount < 15 || stability < 0.7) return 'consolidating';
    return 'stable';
  }

  /**
   * Update overall confidence level based on progressive evidence
   */
  private updateConfidenceLevel(profile: PersonalityProfile): PersonalityProfile {
    const evidenceCount = profile.progressiveProfiling?.evidenceLog?.length || 0;
    const stability = profile.progressiveProfiling?.evolutionTracking?.stabilityScore || 0;
    const stage = profile.progressiveProfiling?.evolutionTracking?.developmentStage || 'exploration';

    // Calculate confidence based on evidence quantity, quality, and stability
    if (stage === 'stable' && stability > 0.7) {
      profile.confidence = 'high';
    } else if (stage === 'consolidating' || (evidenceCount >= 5 && stability > 0.4)) {
      profile.confidence = 'medium';
    } else {
      profile.confidence = 'low';
    }

    return profile;
  }

  /**
   * Determine most probable types based on accumulated evidence
   */
  private determineProbableTypes(profile: PersonalityProfile): PersonalityProfile {
    const confidenceScores = profile.progressiveProfiling?.confidenceScores;
    if (!confidenceScores) return profile;

    // Determine most likely Enneagram type
    if (confidenceScores.enneagram) {
      const topEnneagram = Object.entries(confidenceScores.enneagram)
        .sort(([, a], [, b]) => b - a)[0];

      if (topEnneagram && topEnneagram[1] > 0.4) {
        profile.enneagram = {
          type: topEnneagram[0] as EnneagramType
        };
      }
    }

    // Determine most likely MBTI type
    if (confidenceScores.mbti) {
      const topMBTI = Object.entries(confidenceScores.mbti)
        .sort(([, a], [, b]) => b - a)[0];

      if (topMBTI && topMBTI[1] > 0.4) {
        profile.mbti = {
          type: topMBTI[0] as MBTIType
        };
      }
    }

    // Determine Jungian attitude
    if (confidenceScores.attitude) {
      const { introversion, extraversion } = confidenceScores.attitude;
      if (Math.abs(introversion - extraversion) > 0.2) {
        profile.jungian = {
          attitude: introversion > extraversion ? 'Introversion' : 'Extraversion',
          dominantFunction: this.inferDominantFunction(confidenceScores.functions || {})
        };
      }
    }

    return profile;
  }

  /**
   * Infer dominant function from confidence scores
   */
  private inferDominantFunction(functionScores: { [key in JungianFunction]?: number }): JungianFunction {
    const topFunction = Object.entries(functionScores || {})
      .sort(([, a], [, b]) => (b || 0) - (a || 0))[0];

    return (topFunction?.[0] as JungianFunction) || 'Intuiting';
  }

  /**
   * Merge conversational patterns from multiple interactions
   */
  private mergeConversationalPatterns(
    existing?: ConversationalPatterns,
    newPatterns?: ConversationalPatterns
  ): ConversationalPatterns {
    if (!existing) return newPatterns || {};
    if (!newPatterns) return existing;

    // Simple merge - in production this would be more sophisticated
    return {
      languagePatterns: newPatterns.languagePatterns || existing.languagePatterns,
      communicationStyle: newPatterns.communicationStyle || existing.communicationStyle,
      decisionMaking: newPatterns.decisionMaking || existing.decisionMaking,
      energyPatterns: newPatterns.energyPatterns || existing.energyPatterns,
      conversationMetrics: {
        totalInteractions: (existing.conversationMetrics?.totalInteractions || 0) + 1,
        averageSessionLength: existing.conversationMetrics?.averageSessionLength || 0,
        topicsEngagedWith: [
          ...(existing.conversationMetrics?.topicsEngagedWith || []),
          'personality-analysis' // Add current topic
        ],
        emotionalRange: newPatterns.conversationMetrics?.emotionalRange ||
                       existing.conversationMetrics?.emotionalRange || 'moderate',
        vocabularyComplexity: newPatterns.conversationMetrics?.vocabularyComplexity ||
                             existing.conversationMetrics?.vocabularyComplexity || 'moderate'
      }
    };
  }

  /**
   * Update Spiralogic elemental mapping based on personality profile
   */
  private updateSpiralogicMapping(profile: PersonalityProfile): PersonalityProfile {
    if (!profile.mbti?.type) return profile;

    const mbtiType = profile.mbti.type;
    const spiralMapping = this.getMBTISpiralogicMapping(mbtiType);

    // Calculate elemental balance from conversational patterns and function usage
    const elementalBalance = this.calculateElementalBalance(profile);

    // Determine current spiral phase from conversation indicators
    const currentPhase = this.detectCurrentSpiralPhase(profile, spiralMapping.typeOrigin);

    // Identify growth edge based on type pattern and current phase
    const growthEdge = this.calculateGrowthEdge(mbtiType, currentPhase);

    profile.elementalMapping = {
      primary: spiralMapping.primaryElement,
      secondary: spiralMapping.secondaryElement,
      currentPhase,
      growthEdge,
      elementalBalance
    };

    profile.spiralEvolution = {
      typeOrigin: spiralMapping.typeOrigin,
      currentLocation: currentPhase,
      nextPhase: growthEdge,
      evolutionStage: this.determineEvolutionStage(profile),
      phaseHistory: [{
        phase: currentPhase,
        enteredAt: new Date(),
        mastery: this.calculatePhaseMastery(profile, currentPhase)
      }]
    };

    return profile;
  }

  /**
   * MBTI to Spiralogic mapping based on elemental dynamics
   * Following the framework: Fire→Earth→Water→Air→Aether
   */
  private getMBTISpiralogicMapping(type: MBTIType): {
    primaryElement: SpiralogicElement;
    secondaryElement?: SpiralogicElement;
    typeOrigin: SpiralPhase;
    spiralFunction: string;
  } {
    // FIRE PHASE - The Initiators (Intuition-dominant, vision-driven)
    const fireTypes = {
      'ENTP': {
        primaryElement: 'Fire' as SpiralogicElement,
        secondaryElement: 'Air' as SpiralogicElement,
        typeOrigin: 'Initiation' as SpiralPhase,
        spiralFunction: 'Catalyzes change, opens possibilities'
      },
      'ENFP': {
        primaryElement: 'Fire' as SpiralogicElement,
        secondaryElement: 'Water' as SpiralogicElement,
        typeOrigin: 'Initiation' as SpiralPhase,
        spiralFunction: 'Inspires others to join the quest'
      },
      'INTJ': {
        primaryElement: 'Fire' as SpiralogicElement,
        secondaryElement: 'Earth' as SpiralogicElement,
        typeOrigin: 'Initiation' as SpiralPhase,
        spiralFunction: 'Shapes visions into systems'
      },
      'INFJ': {
        primaryElement: 'Fire' as SpiralogicElement,
        secondaryElement: 'Water' as SpiralogicElement, // Moving toward Aether
        typeOrigin: 'Initiation' as SpiralPhase,
        spiralFunction: 'Transmutes vision into purpose, anchors soul direction'
      }
    };

    // EARTH PHASE - The Builders (Sensation-dominant, structure-focused)
    const earthTypes = {
      'ISTJ': {
        primaryElement: 'Earth' as SpiralogicElement,
        secondaryElement: 'Air' as SpiralogicElement,
        typeOrigin: 'Grounding' as SpiralPhase,
        spiralFunction: 'Grounds ideals in tangible systems'
      },
      'ISFJ': {
        primaryElement: 'Earth' as SpiralogicElement,
        secondaryElement: 'Water' as SpiralogicElement,
        typeOrigin: 'Grounding' as SpiralPhase,
        spiralFunction: 'Brings care into material service'
      },
      'ESTJ': {
        primaryElement: 'Fire' as SpiralogicElement, // Leadership fire
        secondaryElement: 'Earth' as SpiralogicElement,
        typeOrigin: 'Grounding' as SpiralPhase,
        spiralFunction: 'Translates vision into action'
      },
      'ESFJ': {
        primaryElement: 'Earth' as SpiralogicElement,
        secondaryElement: 'Water' as SpiralogicElement,
        typeOrigin: 'Grounding' as SpiralPhase,
        spiralFunction: 'Builds social structures that sustain connection'
      }
    };

    // WATER PHASE - The Transformers (Feeling-dominant, empathy-driven)
    const waterTypes = {
      'INFP': {
        primaryElement: 'Water' as SpiralogicElement,
        secondaryElement: 'Fire' as SpiralogicElement,
        typeOrigin: 'Transformation' as SpiralPhase,
        spiralFunction: 'Brings feeling into creative form'
      },
      'ISFP': {
        primaryElement: 'Water' as SpiralogicElement,
        secondaryElement: 'Earth' as SpiralogicElement,
        typeOrigin: 'Transformation' as SpiralPhase,
        spiralFunction: 'Translates emotion into tangible expression'
      },
      'ENFJ': {
        primaryElement: 'Fire' as SpiralogicElement, // Visionary fire
        secondaryElement: 'Water' as SpiralogicElement,
        typeOrigin: 'Transformation' as SpiralPhase,
        spiralFunction: 'Channels collective feeling into purpose'
      },
      'ESFP': {
        primaryElement: 'Water' as SpiralogicElement,
        secondaryElement: 'Air' as SpiralogicElement,
        typeOrigin: 'Transformation' as SpiralPhase,
        spiralFunction: 'Revives the emotional pulse of a group'
      }
    };

    // AIR PHASE - The Synthesizers (Thinking-dominant, integration-focused)
    const airTypes = {
      'INTP': {
        primaryElement: 'Air' as SpiralogicElement,
        secondaryElement: 'Fire' as SpiralogicElement,
        typeOrigin: 'Integration' as SpiralPhase,
        spiralFunction: 'Builds abstract maps of meaning'
      },
      'ENTJ': {
        primaryElement: 'Fire' as SpiralogicElement, // Strategic fire
        secondaryElement: 'Air' as SpiralogicElement,
        typeOrigin: 'Integration' as SpiralPhase,
        spiralFunction: 'Coordinates intelligence into directed systems'
      },
      'ISTP': {
        primaryElement: 'Air' as SpiralogicElement,
        secondaryElement: 'Earth' as SpiralogicElement,
        typeOrigin: 'Integration' as SpiralPhase,
        spiralFunction: 'Experiments, refines, perfects function'
      },
      'ESTP': {
        primaryElement: 'Air' as SpiralogicElement,
        secondaryElement: 'Fire' as SpiralogicElement,
        typeOrigin: 'Integration' as SpiralPhase,
        spiralFunction: 'Turns concepts into action quickly'
      }
    };

    const allTypes = { ...fireTypes, ...earthTypes, ...waterTypes, ...airTypes };

    return allTypes[type] || {
      primaryElement: 'Fire' as SpiralogicElement,
      typeOrigin: 'Initiation' as SpiralPhase,
      spiralFunction: 'Dynamic consciousness evolution'
    };
  }

  /**
   * Calculate elemental balance from Jung's functions
   */
  private calculateElementalBalance(profile: PersonalityProfile): ElementalMapping['elementalBalance'] {
    const progressiveScores = profile.progressiveProfiling?.confidenceScores?.functions || {};
    const conversational = profile.conversationalPatterns;

    // Base elemental strengths from detected function usage
    let fire = progressiveScores['Intuiting'] || 0; // Fire ↔ Intuition
    let water = progressiveScores['Feeling'] || 0;  // Water ↔ Feeling
    let earth = progressiveScores['Sensing'] || 0;  // Earth ↔ Sensation
    let air = progressiveScores['Thinking'] || 0;   // Air ↔ Thinking

    // Adjust based on conversational patterns
    if (conversational?.languagePatterns?.futureVsPresent === 'future-oriented') fire += 0.2;
    if (conversational?.languagePatterns?.logicalVsEmotional === 'emotional') water += 0.2;
    if (conversational?.languagePatterns?.abstractVsConcrete === 'concrete') earth += 0.2;
    if (conversational?.languagePatterns?.systemsVsDetails === 'systems') air += 0.2;

    // Calculate Aether (integration) based on balance and maturity
    const totalBalance = fire + water + earth + air;
    const variance = this.calculateVariance([fire, water, earth, air]);
    const aether = totalBalance > 2 && variance < 0.3 ? totalBalance * 0.25 : 0;

    // Normalize to 0-1 range
    return {
      fire: Math.min(fire, 1),
      water: Math.min(water, 1),
      earth: Math.min(earth, 1),
      air: Math.min(air, 1),
      aether: Math.min(aether, 1)
    };
  }

  /**
   * Detect current spiral phase from conversational patterns
   */
  private detectCurrentSpiralPhase(profile: PersonalityProfile, typeOrigin: SpiralPhase): SpiralPhase {
    const patterns = profile.conversationalPatterns;
    const evidenceLog = profile.progressiveProfiling?.evidenceLog || [];

    // Look for phase-specific language patterns
    let initiationScore = 0;
    let groundingScore = 0;
    let transformationScore = 0;
    let integrationScore = 0;
    let wholenessScore = 0;

    evidenceLog.forEach(evidence => {
      const text = evidence.evidence.toLowerCase();

      // Initiation (Fire) indicators
      if (/vision|future|potential|possibility|inspire|create|new|innovation/i.test(text)) {
        initiationScore += evidence.confidence;
      }

      // Grounding (Earth) indicators
      if (/structure|build|implement|practical|concrete|organize|system|foundation/i.test(text)) {
        groundingScore += evidence.confidence;
      }

      // Transformation (Water) indicators
      if (/transform|change|emotion|empathy|connection|heal|flow|adapt/i.test(text)) {
        transformationScore += evidence.confidence;
      }

      // Integration (Air) indicators
      if (/synthesize|integrate|communicate|understand|clarity|express|pattern|meaning/i.test(text)) {
        integrationScore += evidence.confidence;
      }

      // Wholeness (Aether) indicators
      if (/wholeness|unity|balance|harmony|transcend|integrate|complete|wisdom/i.test(text)) {
        wholenessScore += evidence.confidence;
      }
    });

    const phaseScores = {
      'Initiation': initiationScore,
      'Grounding': groundingScore,
      'Transformation': transformationScore,
      'Integration': integrationScore,
      'Wholeness': wholenessScore
    };

    // Find highest scoring phase, but weight toward type origin
    const maxScore = Math.max(...Object.values(phaseScores));
    const dominantPhase = Object.entries(phaseScores).find(([, score]) => score === maxScore)?.[0] as SpiralPhase;

    // If scores are low or tied, default to type origin
    return maxScore > 1 ? dominantPhase : typeOrigin;
  }

  /**
   * Calculate growth edge - next spiral phase to develop
   */
  private calculateGrowthEdge(mbtiType: MBTIType, currentPhase: SpiralPhase): SpiralPhase {
    // Standard Spiral progression: Fire → Earth → Water → Air → Aether → Fire (renewed)
    const spiralProgression: { [key in SpiralPhase]: SpiralPhase } = {
      'Initiation': 'Grounding',      // Fire → Earth
      'Grounding': 'Transformation', // Earth → Water
      'Transformation': 'Integration', // Water → Air
      'Integration': 'Wholeness',     // Air → Aether
      'Wholeness': 'Initiation'       // Aether → Fire (renewed cycle)
    };

    // Type-specific growth edges based on your framework
    const typeGrowthEdges: { [key in MBTIType]: { [key in SpiralPhase]?: SpiralPhase } } = {
      // Fire types (Intuition-dominant) need grounding
      'ENTP': { 'Initiation': 'Grounding' },
      'ENFP': { 'Initiation': 'Grounding' },
      'INTJ': { 'Initiation': 'Grounding' },
      'INFJ': { 'Initiation': 'Grounding', 'Transformation': 'Integration' },

      // Earth types (Sensation-dominant) need fluidity
      'ISTJ': { 'Grounding': 'Transformation' },
      'ISFJ': { 'Grounding': 'Transformation' },
      'ESTJ': { 'Grounding': 'Transformation' },
      'ESFJ': { 'Grounding': 'Transformation' },

      // Water types (Feeling-dominant) need clarity
      'INFP': { 'Transformation': 'Integration' },
      'ISFP': { 'Transformation': 'Integration' },
      'ENFJ': { 'Transformation': 'Integration' },
      'ESFP': { 'Transformation': 'Integration' },

      // Air types (Thinking-dominant) need embodiment
      'INTP': { 'Integration': 'Grounding' },
      'ENTJ': { 'Integration': 'Grounding' },
      'ISTP': { 'Integration': 'Grounding' },
      'ESTP': { 'Integration': 'Grounding' }
    };

    // Use type-specific growth edge or fall back to standard progression
    return typeGrowthEdges[mbtiType]?.[currentPhase] || spiralProgression[currentPhase];
  }

  /**
   * Determine evolution stage within current phase
   */
  private determineEvolutionStage(profile: PersonalityProfile): SpiralEvolution['evolutionStage'] {
    const evidenceCount = profile.progressiveProfiling?.evidenceLog?.length || 0;
    const stability = profile.progressiveProfiling?.evolutionTracking?.stabilityScore || 0;
    const aetherLevel = profile.elementalMapping?.elementalBalance.aether || 0;

    if (aetherLevel > 0.7) return 'transcending';
    if (stability > 0.8 && evidenceCount > 15) return 'mastering';
    if (stability > 0.6 && evidenceCount > 8) return 'integrating';
    if (evidenceCount > 3 && stability > 0.3) return 'developing';
    return 'beginning';
  }

  /**
   * Calculate mastery level within current spiral phase
   */
  private calculatePhaseMastery(profile: PersonalityProfile, phase: SpiralPhase): number {
    const evidenceLog = profile.progressiveProfiling?.evidenceLog || [];
    const elementalBalance = profile.elementalMapping?.elementalBalance;

    if (!elementalBalance) return 0.1;

    // Map phases to elemental strengths
    const phaseElementMapping = {
      'Initiation': elementalBalance.fire,
      'Grounding': elementalBalance.earth,
      'Transformation': elementalBalance.water,
      'Integration': elementalBalance.air,
      'Wholeness': elementalBalance.aether
    };

    const elementalMastery = phaseElementMapping[phase] || 0;
    const evidenceStrength = Math.min(evidenceLog.length * 0.1, 1);

    return (elementalMastery + evidenceStrength) / 2;
  }

  /**
   * Helper: Calculate variance for elemental balance
   */
  private calculateVariance(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    return squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
  }

  /**
   * Sophisticated conversational pattern detection
   * Analyzes language patterns, decision-making style, and communication preferences
   */
  private detectTypeIndicators(input: string): PersonalityInsight['insights'] {
    const insights: PersonalityInsight['insights'] = [];
    const lower = input.toLowerCase();

    // Analyze conversational patterns
    const conversationalAnalysis = this.analyzeConversationalPatterns(input);

    // INFJ-A Detection Patterns (based on user's example)
    if (this.detectINFJAPatterns(input)) {
      insights.push({
        type: 'mbti-infj',
        description: 'INFJ (Advocate) indicators: systems thinking, values-based reasoning, future vision',
        evidence: 'Language demonstrates characteristic INFJ patterns: holistic perspective, ethical framework, long-term orientation',
      });
    }

    // Enhanced Enneagram Detection
    const enneagramIndicators = this.detectEnneagramPatterns(input);
    insights.push(...enneagramIndicators);

    // MBTI Cognitive Function Detection
    const functionIndicators = this.detectCognitiveFunctions(input);
    insights.push(...functionIndicators);

    // Jungian Attitude and Function Detection
    const jungianIndicators = this.detectJungianPatterns(input);
    insights.push(...jungianIndicators);

    // Decision-making style indicators
    const decisionIndicators = this.detectDecisionMakingStyle(input);
    insights.push(...decisionIndicators);

    // Communication style patterns
    const communicationIndicators = this.detectCommunicationStyle(input);
    insights.push(...communicationIndicators);

    return insights;
  }

  /**
   * Analyze conversational patterns for progressive profiling
   */
  private analyzeConversationalPatterns(input: string): ConversationalPatterns {
    const patterns: ConversationalPatterns = {};

    // Language Style Analysis
    patterns.languagePatterns = {
      abstractVsConcrete: this.detectAbstractVsConcrete(input),
      systemsVsDetails: this.detectSystemsVsDetails(input),
      logicalVsEmotional: this.detectLogicalVsEmotional(input),
      futureVsPresent: this.detectTimeOrientation(input),
    };

    // Communication Style Analysis
    patterns.communicationStyle = {
      depthVsBreadth: this.detectDepthVsBreadth(input),
      directVsDiplomatic: this.detectDirectVsDiplomatic(input),
      processingSpeed: this.detectProcessingSpeed(input),
      conflictStyle: this.detectConflictStyle(input),
    };

    // Decision Making Analysis
    patterns.decisionMaking = {
      valuesConsideration: this.detectValuesConsideration(input),
      timeToDecide: this.detectDecisionSpeed(input),
      seekingInput: this.detectInputSeeking(input),
      ethicalFramework: this.detectEthicalFramework(input),
    };

    return patterns;
  }

  /**
   * Detect INFJ-A specific patterns
   */
  private detectINFJAPatterns(input: string): boolean {
    const lower = input.toLowerCase();
    let score = 0;

    // Ni (Introverted Intuition) indicators - systems thinking, synthesis
    if (/system|framework|pattern|connection|relationship|integrate|synthesize|holistic|bigger picture/i.test(lower)) {
      score += 2;
    }

    // Fe (Extraverted Feeling) indicators - values, people focus, harmony
    if (/values|important|people|community|harmony|understanding|empathy|connection|meaningful/i.test(lower)) {
      score += 2;
    }

    // Ti (Introverted Thinking) indicators - analysis, logic, accuracy
    if (/analyze|understand|make sense|accurate|precise|logic|reason|coherent/i.test(lower)) {
      score += 1;
    }

    // Se (Extraverted Sensing) indicators - present moment, sensory
    if (/now|moment|experience|here|present|physical|sensory|immediate/i.test(lower)) {
      score += 0.5;
    }

    // INFJ language patterns
    if (/i sense|i feel that|it seems|i wonder|perhaps|might be|could be|vision|future/i.test(lower)) {
      score += 1.5;
    }

    // Assertive (A) indicators - confidence, resilience, self-assured
    if (/confident|sure|resilient|handle|manage|capable|strong|optimistic/i.test(lower)) {
      score += 1;
    }

    return score >= 4; // Threshold for INFJ-A indication
  }

  /**
   * Enhanced Enneagram pattern detection
   */
  private detectEnneagramPatterns(input: string): PersonalityInsight['insights'] {
    const insights: PersonalityInsight['insights'] = [];
    const lower = input.toLowerCase();

    // Type 1 (Reformer) - perfectionism, standards, improvement
    if (this.countPatternMatches(lower, [
      'should', 'ought', 'right way', 'correct', 'proper', 'standards',
      'improve', 'better', 'wrong', 'mistake', 'perfect', 'ideal'
    ]) >= 2) {
      insights.push({
        type: 'enneagram-1',
        description: 'Type 1 (Reformer) indicators: concern with correctness, standards, improvement',
        evidence: 'Language emphasizes proper way, improvement, and standards',
      });
    }

    // Type 2 (Helper) - helping others, relationships, being needed
    if (this.countPatternMatches(lower, [
      'help', 'care', 'support', 'there for', 'love', 'relationship',
      'need', 'assist', 'serve', 'give', 'others', 'connect'
    ]) >= 2) {
      insights.push({
        type: 'enneagram-2',
        description: 'Type 2 (Helper) indicators: focus on helping, relationships, being needed',
        evidence: 'Language shows orientation toward caring and supporting others',
      });
    }

    // Type 4 (Individualist) - authenticity, uniqueness, depth, feelings
    if (this.countPatternMatches(lower, [
      'authentic', 'unique', 'different', 'special', 'deep', 'meaningful',
      'identity', 'individual', 'feel', 'emotion', 'soul', 'true self'
    ]) >= 2) {
      insights.push({
        type: 'enneagram-4',
        description: 'Type 4 (Individualist) indicators: focus on authenticity, uniqueness, emotional depth',
        evidence: 'Language emphasizes individuality, depth, and authentic self-expression',
      });
    }

    // Type 5 (Investigator) - understanding, knowledge, independence
    if (this.countPatternMatches(lower, [
      'understand', 'analyze', 'think', 'knowledge', 'information', 'learn',
      'study', 'research', 'observe', 'investigate', 'competent', 'autonomous'
    ]) >= 2) {
      insights.push({
        type: 'enneagram-5',
        description: 'Type 5 (Investigator) indicators: focus on understanding, knowledge, independence',
        evidence: 'Language suggests intellectual orientation and desire for competence',
      });
    }

    // Type 6 (Loyalist) - security, loyalty, anxiety, doubt
    if (this.countPatternMatches(lower, [
      'secure', 'safe', 'loyal', 'trust', 'doubt', 'worry', 'anxious',
      'uncertain', 'support system', 'guidance', 'authority', 'what if'
    ]) >= 2) {
      insights.push({
        type: 'enneagram-6',
        description: 'Type 6 (Loyalist) indicators: focus on security, loyalty, managing anxiety',
        evidence: 'Language shows concern with safety, trust, and seeking guidance',
      });
    }

    // Type 7 (Enthusiast) - possibilities, options, excitement, optimism
    if (this.countPatternMatches(lower, [
      'exciting', 'possibilities', 'options', 'adventure', 'fun', 'new',
      'explore', 'optimistic', 'potential', 'opportunity', 'freedom', 'variety'
    ]) >= 2) {
      insights.push({
        type: 'enneagram-7',
        description: 'Type 7 (Enthusiast) indicators: focus on possibilities, adventure, optimism',
        evidence: 'Language emphasizes excitement, options, and positive potential',
      });
    }

    // Type 8 (Challenger) - power, control, intensity, directness
    if (this.countPatternMatches(lower, [
      'control', 'power', 'strong', 'direct', 'intense', 'challenge',
      'confront', 'fight', 'protect', 'justice', 'unfair', 'vulnerable'
    ]) >= 2) {
      insights.push({
        type: 'enneagram-8',
        description: 'Type 8 (Challenger) indicators: focus on power, control, protection',
        evidence: 'Language shows intensity, directness, and concern with justice',
      });
    }

    // Type 9 (Peacemaker) - harmony, conflict avoidance, going along
    if (this.countPatternMatches(lower, [
      'harmony', 'peace', 'agree', 'conflict', 'avoid', 'merge',
      'comfortable', 'easy', 'whatever', 'fine', 'go along', 'calm'
    ]) >= 2) {
      insights.push({
        type: 'enneagram-9',
        description: 'Type 9 (Peacemaker) indicators: focus on harmony, avoiding conflict',
        evidence: 'Language emphasizes agreement, peace, and avoiding disruption',
      });
    }

    return insights;
  }

  /**
   * Detect MBTI cognitive functions
   */
  private detectCognitiveFunctions(input: string): PersonalityInsight['insights'] {
    const insights: PersonalityInsight['insights'] = [];
    const lower = input.toLowerCase();

    // Ni (Introverted Intuition) - patterns, synthesis, future vision
    if (this.countPatternMatches(lower, [
      'pattern', 'connection', 'synthesis', 'integrate', 'vision', 'future',
      'insight', 'understand deeply', 'see through', 'essence', 'meaning'
    ]) >= 2) {
      insights.push({
        type: 'cognitive-ni',
        description: 'Introverted Intuition (Ni): pattern recognition, synthesis, future vision',
        evidence: 'Language shows convergent thinking and pattern synthesis',
      });
    }

    // Ne (Extraverted Intuition) - possibilities, brainstorming, connections
    if (this.countPatternMatches(lower, [
      'possibilities', 'what if', 'could be', 'brainstorm', 'ideas',
      'creative', 'potential', 'explore', 'options', 'alternative', 'maybe'
    ]) >= 2) {
      insights.push({
        type: 'cognitive-ne',
        description: 'Extraverted Intuition (Ne): generating possibilities, exploring alternatives',
        evidence: 'Language shows divergent thinking and possibility exploration',
      });
    }

    // Ti (Introverted Thinking) - logical analysis, precision, understanding
    if (this.countPatternMatches(lower, [
      'analyze', 'logical', 'precise', 'accurate', 'understand', 'make sense',
      'rational', 'coherent', 'systematic', 'principle', 'framework'
    ]) >= 2) {
      insights.push({
        type: 'cognitive-ti',
        description: 'Introverted Thinking (Ti): logical analysis, seeking accuracy',
        evidence: 'Language emphasizes logical understanding and precision',
      });
    }

    // Te (Extraverted Thinking) - efficiency, organization, results
    if (this.countPatternMatches(lower, [
      'efficient', 'organize', 'results', 'accomplish', 'plan', 'goal',
      'objective', 'practical', 'implement', 'achieve', 'productive'
    ]) >= 2) {
      insights.push({
        type: 'cognitive-te',
        description: 'Extraverted Thinking (Te): organizing for efficiency and results',
        evidence: 'Language focuses on organization, goals, and achievement',
      });
    }

    // Fi (Introverted Feeling) - personal values, authenticity
    if (this.countPatternMatches(lower, [
      'values', 'authentic', 'personal', 'meaningful', 'important to me',
      'feel right', 'true to myself', 'genuine', 'individual', 'unique'
    ]) >= 2) {
      insights.push({
        type: 'cognitive-fi',
        description: 'Introverted Feeling (Fi): personal values, authenticity',
        evidence: 'Language emphasizes personal values and authentic expression',
      });
    }

    // Fe (Extraverted Feeling) - harmony, others' feelings, group values
    if (this.countPatternMatches(lower, [
      'harmony', 'others feel', 'community', 'together', 'empathy',
      'understand others', 'help people', 'social', 'care about', 'support'
    ]) >= 2) {
      insights.push({
        type: 'cognitive-fe',
        description: 'Extraverted Feeling (Fe): harmony, considering others\' feelings',
        evidence: 'Language shows concern for group harmony and others\' wellbeing',
      });
    }

    return insights;
  }

  /**
   * Detect Jungian attitude and function preferences
   */
  private detectJungianPatterns(input: string): PersonalityInsight['insights'] {
    const insights: PersonalityInsight['insights'] = [];
    const lower = input.toLowerCase();

    // Introversion indicators
    if (this.countPatternMatches(lower, [
      'alone', 'quiet', 'reflect', 'internal', 'myself', 'solitude',
      'inner world', 'think deeply', 'private', 'introspect', 'withdrawn'
    ]) >= 2) {
      insights.push({
        type: 'jungian-introversion',
        description: 'Introverted attitude: inward energy orientation, reflection',
        evidence: 'Language suggests preference for inner world and solitary processing',
      });
    }

    // Extraversion indicators
    if (this.countPatternMatches(lower, [
      'people', 'social', 'talk', 'share', 'together', 'group',
      'others', 'interaction', 'external', 'outgoing', 'collaborative'
    ]) >= 2) {
      insights.push({
        type: 'jungian-extraversion',
        description: 'Extraverted attitude: outward energy orientation, interaction',
        evidence: 'Language suggests preference for external world and social interaction',
      });
    }

    return insights;
  }

  /**
   * Detect decision-making style patterns
   */
  private detectDecisionMakingStyle(input: string): PersonalityInsight['insights'] {
    const insights: PersonalityInsight['insights'] = [];
    const lower = input.toLowerCase();

    // Values-based decision making
    if (this.countPatternMatches(lower, [
      'values', 'important', 'meaningful', 'right thing', 'ethical',
      'moral', 'feel right', 'conscience', 'principle', 'integrity'
    ]) >= 2) {
      insights.push({
        type: 'decision-values-based',
        description: 'Values-based decision making: decisions guided by personal ethics and meaning',
        evidence: 'Language emphasizes values, meaning, and ethical considerations',
      });
    }

    // Logical decision making
    if (this.countPatternMatches(lower, [
      'logical', 'rational', 'analyze', 'pros and cons', 'objective',
      'data', 'facts', 'evidence', 'reasonable', 'systematic'
    ]) >= 2) {
      insights.push({
        type: 'decision-logical',
        description: 'Logical decision making: decisions based on analysis and reasoning',
        evidence: 'Language emphasizes logical analysis and objective evaluation',
      });
    }

    return insights;
  }

  /**
   * Detect communication style patterns
   */
  private detectCommunicationStyle(input: string): PersonalityInsight['insights'] {
    const insights: PersonalityInsight['insights'] = [];
    const lower = input.toLowerCase();

    // Diplomatic communication
    if (this.countPatternMatches(lower, [
      'perhaps', 'maybe', 'might', 'could', 'possibly', 'i think',
      'it seems', 'i wonder', 'gentle', 'respectful', 'consider'
    ]) >= 2) {
      insights.push({
        type: 'communication-diplomatic',
        description: 'Diplomatic communication style: gentle, considerate, non-confrontational',
        evidence: 'Language uses qualifying phrases and respectful tone',
      });
    }

    // Direct communication
    if (this.countPatternMatches(lower, [
      'clearly', 'directly', 'simply put', 'the fact is', 'obviously',
      'definitely', 'absolutely', 'without question', 'straightforward'
    ]) >= 2) {
      insights.push({
        type: 'communication-direct',
        description: 'Direct communication style: clear, straightforward, unambiguous',
        evidence: 'Language uses definitive statements and clear assertions',
      });
    }

    return insights;
  }

  /**
   * Helper methods for pattern analysis
   */
  private countPatternMatches(text: string, patterns: string[]): number {
    return patterns.filter(pattern => new RegExp(`\\b${pattern}\\b`).test(text)).length;
  }

  private detectAbstractVsConcrete(input: string): 'abstract' | 'concrete' | 'balanced' {
    const abstractCount = this.countPatternMatches(input.toLowerCase(), [
      'concept', 'theory', 'idea', 'philosophy', 'meaning', 'essence',
      'principle', 'framework', 'model', 'paradigm'
    ]);
    const concreteCount = this.countPatternMatches(input.toLowerCase(), [
      'specific', 'detail', 'example', 'fact', 'data', 'evidence',
      'actual', 'real', 'physical', 'tangible'
    ]);

    if (abstractCount > concreteCount + 1) return 'abstract';
    if (concreteCount > abstractCount + 1) return 'concrete';
    return 'balanced';
  }

  private detectSystemsVsDetails(input: string): 'systems' | 'details' | 'balanced' {
    const systemsCount = this.countPatternMatches(input.toLowerCase(), [
      'system', 'whole', 'overall', 'big picture', 'holistic',
      'integrate', 'connection', 'relationship', 'pattern'
    ]);
    const detailsCount = this.countPatternMatches(input.toLowerCase(), [
      'detail', 'specific', 'precise', 'exact', 'particular',
      'step', 'component', 'element', 'piece'
    ]);

    if (systemsCount > detailsCount + 1) return 'systems';
    if (detailsCount > systemsCount + 1) return 'details';
    return 'balanced';
  }

  private detectLogicalVsEmotional(input: string): 'logical' | 'emotional' | 'balanced' {
    const logicalCount = this.countPatternMatches(input.toLowerCase(), [
      'logical', 'rational', 'analyze', 'reason', 'think',
      'objective', 'factual', 'systematic', 'coherent'
    ]);
    const emotionalCount = this.countPatternMatches(input.toLowerCase(), [
      'feel', 'emotion', 'heart', 'care', 'love', 'passion',
      'meaningful', 'personal', 'value', 'important'
    ]);

    if (logicalCount > emotionalCount + 1) return 'logical';
    if (emotionalCount > logicalCount + 1) return 'emotional';
    return 'balanced';
  }

  private detectTimeOrientation(input: string): 'future-oriented' | 'present-oriented' | 'balanced' {
    const futureCount = this.countPatternMatches(input.toLowerCase(), [
      'future', 'will', 'vision', 'goal', 'plan', 'potential',
      'possibility', 'tomorrow', 'ahead', 'anticipate'
    ]);
    const presentCount = this.countPatternMatches(input.toLowerCase(), [
      'now', 'today', 'current', 'present', 'immediate',
      'here', 'moment', 'right now', 'currently'
    ]);

    if (futureCount > presentCount + 1) return 'future-oriented';
    if (presentCount > futureCount + 1) return 'present-oriented';
    return 'balanced';
  }

  private detectDepthVsBreadth(input: string): 'depth' | 'breadth' | 'balanced' {
    const depthCount = this.countPatternMatches(input.toLowerCase(), [
      'deep', 'profound', 'thorough', 'comprehensive', 'detailed',
      'intense', 'focused', 'concentrated', 'specialized'
    ]);
    const breadthCount = this.countPatternMatches(input.toLowerCase(), [
      'broad', 'wide', 'various', 'multiple', 'different',
      'range', 'diverse', 'variety', 'span', 'across'
    ]);

    if (depthCount > breadthCount + 1) return 'depth';
    if (breadthCount > depthCount + 1) return 'breadth';
    return 'balanced';
  }

  private detectDirectVsDiplomatic(input: string): 'direct' | 'diplomatic' | 'balanced' {
    const directCount = this.countPatternMatches(input.toLowerCase(), [
      'clearly', 'directly', 'simply', 'straightforward', 'obvious',
      'definitely', 'absolutely', 'certainly', 'without question'
    ]);
    const diplomaticCount = this.countPatternMatches(input.toLowerCase(), [
      'perhaps', 'maybe', 'might', 'could', 'possibly',
      'i think', 'it seems', 'consider', 'gentle', 'respectful'
    ]);

    if (directCount > diplomaticCount + 1) return 'direct';
    if (diplomaticCount > directCount + 1) return 'diplomatic';
    return 'balanced';
  }

  private detectProcessingSpeed(input: string): 'quick' | 'reflective' | 'varies' {
    const quickCount = this.countPatternMatches(input.toLowerCase(), [
      'quickly', 'immediate', 'fast', 'right away', 'instant',
      'rapid', 'spontaneous', 'without delay'
    ]);
    const reflectiveCount = this.countPatternMatches(input.toLowerCase(), [
      'think about', 'consider', 'reflect', 'ponder', 'deliberate',
      'take time', 'process', 'contemplate', 'mull over'
    ]);

    if (quickCount > reflectiveCount + 1) return 'quick';
    if (reflectiveCount > quickCount + 1) return 'reflective';
    return 'varies';
  }

  private detectConflictStyle(input: string): 'confronting' | 'harmonizing' | 'avoiding' {
    const confrontingCount = this.countPatternMatches(input.toLowerCase(), [
      'confront', 'challenge', 'direct', 'address', 'face',
      'deal with', 'tackle', 'fight', 'stand up'
    ]);
    const harmonizingCount = this.countPatternMatches(input.toLowerCase(), [
      'harmony', 'peace', 'understand', 'work together', 'compromise',
      'find common ground', 'bridge', 'mediate', 'resolve'
    ]);
    const avoidingCount = this.countPatternMatches(input.toLowerCase(), [
      'avoid', 'sidestep', 'ignore', 'withdraw', 'deflect',
      'change subject', 'uncomfortable', 'rather not'
    ]);

    const max = Math.max(confrontingCount, harmonizingCount, avoidingCount);
    if (confrontingCount === max) return 'confronting';
    if (harmonizingCount === max) return 'harmonizing';
    return 'avoiding';
  }

  private detectValuesConsideration(input: string): 'high' | 'medium' | 'low' {
    const valuesCount = this.countPatternMatches(input.toLowerCase(), [
      'values', 'important', 'meaningful', 'ethical', 'moral',
      'right', 'wrong', 'principle', 'integrity', 'conscience'
    ]);

    if (valuesCount >= 3) return 'high';
    if (valuesCount >= 1) return 'medium';
    return 'low';
  }

  private detectDecisionSpeed(input: string): 'quick' | 'deliberate' | 'varies' {
    const quickCount = this.countPatternMatches(input.toLowerCase(), [
      'decide quickly', 'immediate decision', 'right away', 'intuitive',
      'go with gut', 'first instinct', 'without hesitation'
    ]);
    const deliberateCount = this.countPatternMatches(input.toLowerCase(), [
      'think it through', 'consider carefully', 'weigh options', 'take time',
      'deliberate', 'analyze', 'research first', 'sleep on it'
    ]);

    if (quickCount > deliberateCount) return 'quick';
    if (deliberateCount > quickCount) return 'deliberate';
    return 'varies';
  }

  private detectInputSeeking(input: string): 'independent' | 'collaborative' | 'situational' {
    const independentCount = this.countPatternMatches(input.toLowerCase(), [
      'decide myself', 'own decision', 'independent', 'alone',
      'trust myself', 'personal choice', 'my call'
    ]);
    const collaborativeCount = this.countPatternMatches(input.toLowerCase(), [
      'ask others', 'get input', 'consult', 'discuss', 'feedback',
      'others think', 'advice', 'team decision', 'together'
    ]);

    if (independentCount > collaborativeCount) return 'independent';
    if (collaborativeCount > independentCount) return 'collaborative';
    return 'situational';
  }

  private detectEthicalFramework(input: string): 'rules-based' | 'consequential' | 'virtue-based' | 'mixed' {
    const rulesCount = this.countPatternMatches(input.toLowerCase(), [
      'rule', 'principle', 'duty', 'obligation', 'should', 'must',
      'standard', 'law', 'code', 'guideline'
    ]);
    const consequentialCount = this.countPatternMatches(input.toLowerCase(), [
      'outcome', 'result', 'consequence', 'effect', 'impact',
      'benefit', 'harm', 'greater good', 'utility'
    ]);
    const virtueCount = this.countPatternMatches(input.toLowerCase(), [
      'character', 'virtue', 'integrity', 'honesty', 'courage',
      'compassion', 'wisdom', 'excellence', 'flourishing'
    ]);

    const max = Math.max(rulesCount, consequentialCount, virtueCount);
    const counts = [rulesCount, consequentialCount, virtueCount];
    const tiedScores = counts.filter(c => c === max).length;

    if (tiedScores > 1) return 'mixed';
    if (rulesCount === max) return 'rules-based';
    if (consequentialCount === max) return 'consequential';
    return 'virtue-based';
  }

  /**
   * Generate communication guidance based on personality profile
   */
  private generateCommunicationGuidance(
    profile: PersonalityProfile
  ): PersonalityInsight['communicationGuidance'] {
    const guidance: PersonalityInsight['communicationGuidance'] = {
      preferredStyle: 'Balanced, clear communication',
      avoid: [],
      emphasize: [],
    };

    // Enneagram-based guidance
    if (profile.enneagram) {
      switch (profile.enneagram.type) {
        case '1': // Reformer
          guidance.preferredStyle = 'Clear, precise, principled communication';
          guidance.emphasize = ['Clarity', 'Integrity', 'Improvement'];
          guidance.avoid = ['Vagueness', 'Moral relativism', 'Sloppiness'];
          break;

        case '2': // Helper
          guidance.preferredStyle = 'Warm, personal, supportive communication';
          guidance.emphasize = ['Care', 'Connection', 'Appreciation'];
          guidance.avoid = ['Coldness', 'Dismissiveness', 'Ignoring feelings'];
          break;

        case '4': // Individualist
          guidance.preferredStyle = 'Authentic, deep, emotionally resonant communication';
          guidance.emphasize = ['Authenticity', 'Depth', 'Uniqueness'];
          guidance.avoid = ['Superficiality', 'Formulaic responses', 'Dismissing emotions'];
          break;

        case '5': // Investigator
          guidance.preferredStyle = 'Logical, informative, respectful of boundaries';
          guidance.emphasize = ['Knowledge', 'Autonomy', 'Clarity'];
          guidance.avoid = ['Emotional pressure', 'Intrusion', 'Vagueness'];
          break;

        case '7': // Enthusiast
          guidance.preferredStyle = 'Enthusiastic, positive, possibility-oriented';
          guidance.emphasize = ['Possibilities', 'Joy', 'Freedom'];
          guidance.avoid = ['Heaviness', 'Limitation', 'Dwelling on pain'];
          break;

        case '8': // Challenger
          guidance.preferredStyle = 'Direct, honest, strong communication';
          guidance.emphasize = ['Truth', 'Strength', 'Justice'];
          guidance.avoid = ['Weakness', 'Manipulation', 'Passivity'];
          break;

        case '9': // Peacemaker
          guidance.preferredStyle = 'Peaceful, accepting, harmonious communication';
          guidance.emphasize = ['Harmony', 'Acceptance', 'Peace'];
          guidance.avoid = ['Conflict', 'Pressure', 'Dismissing their presence'];
          break;
      }
    }

    // MBTI-based guidance
    if (profile.mbti) {
      // Thinking types: emphasize logic, avoid excessive emotion
      if (profile.mbti.type.includes('T')) {
        guidance.emphasize.push('Logic', 'Objectivity', 'Clear reasoning');
        guidance.avoid.push('Overly emotional appeals');
      }

      // Feeling types: emphasize values, avoid pure logic
      if (profile.mbti.type.includes('F')) {
        guidance.emphasize.push('Values', 'Personal impact', 'Empathy');
        guidance.avoid.push('Cold logic without heart');
      }

      // Introverted types: respect need for reflection
      if (profile.mbti.type.startsWith('I')) {
        guidance.emphasize.push('Space for reflection', 'Depth over breadth');
        guidance.avoid.push('Excessive stimulation', 'Forced extraversion');
      }

      // Extraverted types: engage actively
      if (profile.mbti.type.startsWith('E')) {
        guidance.emphasize.push('Interaction', 'Dialogue', 'External processing');
        guidance.avoid.push('Isolation', 'Lack of engagement');
      }
    }

    return guidance;
  }

  /**
   * Map personality types to archetypal patterns
   */
  private mapToArchetypes(profile: PersonalityProfile): PersonalityInsight['archetypeMapping'] {
    const active: string[] = [];
    const dormant: string[] = [];
    const shadow: string[] = [];

    // Enneagram to archetype mapping
    if (profile.enneagram) {
      switch (profile.enneagram.type) {
        case '1':
          active.push('Reformer', 'Perfectionist', 'Judge');
          shadow.push('Critic', 'Tyrant');
          dormant.push('Wild One', 'Rebel');
          break;

        case '2':
          active.push('Caregiver', 'Helper', 'Lover');
          shadow.push('Martyr', 'Enabler');
          dormant.push('Warrior', 'Lone Wolf');
          break;

        case '3':
          active.push('Achiever', 'Hero', 'Performer');
          shadow.push('Impostor', 'Workaholic');
          dormant.push('Sage', 'Hermit');
          break;

        case '4':
          active.push('Individualist', 'Artist', 'Romantic');
          shadow.push('Victim', 'Melancholic');
          dormant.push('Warrior', 'King/Queen');
          break;

        case '5':
          active.push('Investigator', 'Sage', 'Observer');
          shadow.push('Detached One', 'Miser');
          dormant.push('Warrior', 'Lover');
          break;

        case '6':
          active.push('Loyalist', 'Guardian', 'Skeptic');
          shadow.push('Coward', 'Worrier');
          dormant.push('Rebel', 'Trickster');
          break;

        case '7':
          active.push('Enthusiast', 'Adventurer', 'Epicure');
          shadow.push('Glutton', 'Peter Pan');
          dormant.push('Sage', 'Monk');
          break;

        case '8':
          active.push('Challenger', 'Warrior', 'Protector');
          shadow.push('Tyrant', 'Bully');
          dormant.push('Innocent', 'Peacemaker');
          break;

        case '9':
          active.push('Peacemaker', 'Mediator', 'Healer');
          shadow.push('Sloth', 'Pushover');
          dormant.push('Warrior', 'Challenger');
          break;
      }
    }

    // MBTI to archetype mapping
    if (profile.mbti) {
      const type = profile.mbti.type;

      // Analyst types (NT)
      if (type.includes('NT')) {
        active.push('Strategist', 'Architect', 'Visionary');
      }

      // Diplomat types (NF)
      if (type.includes('NF')) {
        active.push('Idealist', 'Healer', 'Advocate');
      }

      // Sentinel types (SJ)
      if (type.includes('SJ') || (type.includes('S') && type.includes('J'))) {
        active.push('Guardian', 'Protector', 'Administrator');
      }

      // Explorer types (SP)
      if (type.includes('SP') || (type.includes('S') && type.includes('P'))) {
        active.push('Adventurer', 'Artisan', 'Performer');
      }
    }

    return {
      active,
      dormant,
      shadow,
    };
  }

  /**
   * Identify growth path based on personality type
   */
  private identifyGrowthPath(profile: PersonalityProfile): PersonalityInsight['growthPath'] {
    // Default path
    let currentStage = 'Self-discovery';
    let nextStage = 'Integration';
    let support = 'Continue exploring patterns and building self-awareness';

    // Enneagram-specific growth paths
    if (profile.enneagram) {
      switch (profile.enneagram.type) {
        case '1':
          currentStage = 'Perfecting (Type 1)';
          nextStage = 'Accepting imperfection, finding serenity (toward 7)';
          support = 'Practice self-compassion, embrace "good enough," access spontaneity';
          break;

        case '2':
          currentStage = 'Helping (Type 2)';
          nextStage = 'Self-care, healthy boundaries (toward 4)';
          support = 'Notice own needs, practice saying no, develop authentic self-expression';
          break;

        case '4':
          currentStage = 'Individuating (Type 4)';
          nextStage = 'Taking action, showing up (toward 1)';
          support = 'Move from feeling to doing, engage with external world, find discipline';
          break;

        case '5':
          currentStage = 'Observing (Type 5)';
          nextStage = 'Engaging, embodying (toward 8)';
          support = 'Step into action, take up space, trust bodily wisdom, engage directly';
          break;

        case '7':
          currentStage = 'Experiencing (Type 7)';
          nextStage = 'Going deep, staying present (toward 5)';
          support = 'Sit with discomfort, develop focus, explore depth over breadth';
          break;

        case '8':
          currentStage = 'Protecting (Type 8)';
          nextStage = 'Vulnerability, openness (toward 2)';
          support = 'Allow softness, trust others, show tenderness, reveal heart';
          break;

        case '9':
          currentStage = 'Peacemaking (Type 9)';
          nextStage = 'Self-assertion, presence (toward 3)';
          support = 'Claim your voice, take action, prioritize your agenda, show up fully';
          break;
      }
    }

    return {
      currentStage,
      nextStage,
      support,
    };
  }

  /**
   * Update user's personality profile
   */
  async updateProfile(
    userId: string,
    updates: Partial<PersonalityProfile>
  ): Promise<PersonalityProfile> {
    logger.info(`Updating personality profile for user: ${userId}`);

    // TODO: Fetch existing profile from database
    // For now, create new profile with updates
    const profile: PersonalityProfile = {
      userId,
      ...updates,
      assessedAt: new Date(),
    };

    // TODO: Save to database
    logger.info(`Profile updated for user ${userId}`);

    return profile;
  }

  /**
   * Get personality-informed communication style
   */
  async getCommunicationStyle(userId: string): Promise<{
    style: string;
    tone: string;
    emphasize: string[];
    avoid: string[];
  }> {
    // TODO: Fetch user profile from database
    // For now, return default

    return {
      style: 'Balanced and adaptive',
      tone: 'Warm yet clear',
      emphasize: ['Authenticity', 'Clarity', 'Respect'],
      avoid: ['Manipulation', 'Dishonesty', 'Dismissiveness'],
    };
  }
}

// =============================================================================
// EXPORT
// =============================================================================

export default ArchetypalTypologyAgent;
