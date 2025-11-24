/**
 * MAIA Dynamic Consciousness State Recognition System
 * Real-time awareness level detection - as mutable as HRV, as predictable as archetypes
 *
 * Recognizes 5 levels of current awareness state regardless of baseline development:
 * - A wise person can be in survival mode due to crisis
 * - An unaware person can have moments of profound insight
 * - States fluctuate based on stress, health, life events, spiritual openings
 */

export interface ConsciousnessState {
  currentLevel: 1 | 2 | 3 | 4 | 5;
  levelName: string;
  description: string;
  characteristics: string[];
  communicationStyle: string;
  responseNeeds: string[];
  elementalSignature: 'earth' | 'water' | 'air' | 'fire' | 'aether';
}

export interface StateIndicators {
  language: {
    complexity: number; // 0-1: Simple to sophisticated language
    emotional: number; // 0-1: Emotional content vs rational
    spiritual: number; // 0-1: Spiritual/transcendent language
    somatic: number; // 0-1: Body awareness references
    relational: number; // 0-1: Connection/relationship focus
  };
  stress: {
    urgency: number; // 0-1: How urgent/pressured they seem
    overwhelm: number; // 0-1: Capacity vs demand
    fragmentation: number; // 0-1: Scattered vs coherent
  };
  awareness: {
    selfReflection: number; // 0-1: Meta-awareness of their state
    presentMoment: number; // 0-1: Here/now vs past/future focus
    paradoxHolding: number; // 0-1: Both/and vs either/or thinking
    witnessCapacity: number; // 0-1: Observer vs identified with experience
  };
}

export interface ConsciousnessStateRecognition {
  detectedState: ConsciousnessState;
  indicators: StateIndicators;
  confidence: number;
  stateFluctuation: {
    stability: number; // How stable this state seems
    trajectory: 'ascending' | 'descending' | 'fluctuating' | 'stable';
    triggerFactors: string[]; // What might be influencing current state
  };
  adaptationRecommendations: {
    communicationAdjustments: string[];
    elementalApproach: string;
    wisdomDeliveryStyle: string;
  };
}

export class ConsciousnessStateDetector {

  /**
   * The 5 Dynamic Awareness Levels
   */
  private awarenessLevels: ConsciousnessState[] = [
    {
      currentLevel: 1,
      levelName: "Survival State",
      description: "Fight/flight activation, basic needs threatened, reactive mode",
      characteristics: [
        "Crisis language", "Urgent needs", "Black/white thinking",
        "External blame/control", "Body tension", "Time pressure"
      ],
      communicationStyle: "Simple, direct, grounding, immediate support",
      responseNeeds: ["Safety", "Presence", "Practical help", "Grounding"],
      elementalSignature: "earth"
    },
    {
      currentLevel: 2,
      levelName: "Emotional Processing",
      description: "Feelings are primary, seeking to be seen/heard/validated",
      characteristics: [
        "Emotional language", "Personal stories", "Relationship focus",
        "Seeking validation", "Internal experience primary", "Feeling overwhelmed"
      ],
      communicationStyle: "Empathetic, feeling-focused, validating, flowing",
      responseNeeds: ["Emotional validation", "Empathy", "Being heard", "Flow"],
      elementalSignature: "water"
    },
    {
      currentLevel: 3,
      levelName: "Mental Processing",
      description: "Thinking through problems, seeking understanding/clarity",
      characteristics: [
        "Analytical language", "Questions and exploration", "Cause-effect thinking",
        "Seeking understanding", "Mental frameworks", "Problem-solving focus"
      ],
      communicationStyle: "Clear, exploratory, framework-offering, questioning",
      responseNeeds: ["Clarity", "Understanding", "New perspectives", "Mental maps"],
      elementalSignature: "air"
    },
    {
      currentLevel: 4,
      levelName: "Transformational Opening",
      description: "Ready for change, seeing patterns, integrating insights",
      characteristics: [
        "Growth language", "Pattern recognition", "Change readiness",
        "Integration seeking", "Spiritual openings", "Breakthrough moments"
      ],
      communicationStyle: "Catalytic, transformative, pattern-revealing, inspiring",
      responseNeeds: ["Transformation support", "Pattern insight", "Change guidance", "Inspiration"],
      elementalSignature: "fire"
    },
    {
      currentLevel: 5,
      levelName: "Unified Awareness",
      description: "Spacious presence, paradox-holding, witnessing consciousness",
      characteristics: [
        "Spacious language", "Paradox holding", "Witness awareness",
        "Unity perspective", "Timeless quality", "Deep peace"
      ],
      communicationStyle: "Spacious, wisdom-sharing, paradox-honoring, presence-based",
      responseNeeds: ["Resonant wisdom", "Spacious reflection", "Unified perspective", "Presence"],
      elementalSignature: "aether"
    }
  ];

  /**
   * Real-time consciousness state detection
   */
  async detectCurrentState(
    message: string,
    context: {
      sessionHistory?: string[];
      timeOfDay?: string;
      userBaseline?: any;
      recentInteractions?: any[];
    }
  ): Promise<ConsciousnessStateRecognition> {

    // Analyze message for state indicators
    const indicators = this.analyzeStateIndicators(message);

    // Calculate level scores for each awareness state
    const levelScores = this.awarenessLevels.map(level => ({
      level,
      score: this.calculateLevelScore(indicators, level, context)
    }));

    // Find highest scoring level
    const detectedLevel = levelScores.reduce((highest, current) =>
      current.score > highest.score ? current : highest
    );

    // Assess state fluctuation patterns
    const stateFluctuation = this.assessStateFluctuation(message, context, detectedLevel.level);

    // Generate adaptation recommendations
    const adaptationRecommendations = this.generateAdaptationRecommendations(
      detectedLevel.level,
      indicators,
      stateFluctuation
    );

    return {
      detectedState: detectedLevel.level,
      indicators,
      confidence: detectedLevel.score,
      stateFluctuation,
      adaptationRecommendations
    };
  }

  /**
   * Analyze message for consciousness state indicators
   */
  private analyzeStateIndicators(message: string): StateIndicators {
    const msg = message.toLowerCase();

    // Language complexity analysis
    const complexWords = ['consciousness', 'paradox', 'integration', 'transcendence', 'embodiment'];
    const simpleWords = ['help', 'need', 'want', 'bad', 'good', 'now'];
    const complexity = complexWords.filter(w => msg.includes(w)).length /
                     Math.max(1, simpleWords.filter(w => msg.includes(w)).length);

    // Emotional content
    const emotionalWords = ['feel', 'emotion', 'hurt', 'love', 'angry', 'sad', 'joy', 'afraid'];
    const emotional = emotionalWords.filter(w => msg.includes(w)).length / emotionalWords.length;

    // Spiritual language
    const spiritualWords = ['soul', 'spirit', 'sacred', 'divine', 'awakening', 'consciousness', 'meaning'];
    const spiritual = spiritualWords.filter(w => msg.includes(w)).length / spiritualWords.length;

    // Somatic awareness
    const somaticWords = ['body', 'breath', 'tension', 'energy', 'sensation', 'felt', 'embodied'];
    const somatic = somaticWords.filter(w => msg.includes(w)).length / somaticWords.length;

    // Relational focus
    const relationalWords = ['relationship', 'connect', 'together', 'between', 'with', 'love', 'intimacy'];
    const relational = relationalWords.filter(w => msg.includes(w)).length / relationalWords.length;

    // Stress indicators
    const urgencyWords = ['urgent', 'immediately', 'crisis', 'emergency', 'now', 'quickly'];
    const urgency = urgencyWords.filter(w => msg.includes(w)).length / urgencyWords.length;

    const overwhelmWords = ['overwhelm', 'too much', 'can\'t handle', 'falling apart', 'breaking'];
    const overwhelm = overwhelmWords.filter(w => msg.includes(w)).length / overwhelmWords.length;

    const fragmentationWords = ['scattered', 'pieces', 'fragmented', 'all over', 'disconnected'];
    const fragmentation = fragmentationWords.filter(w => msg.includes(w)).length / fragmentationWords.length;

    // Awareness indicators
    const metaWords = ['notice', 'aware', 'observe', 'realize', 'see that', 'recognize'];
    const selfReflection = metaWords.filter(w => msg.includes(w)).length / metaWords.length;

    const presentWords = ['now', 'here', 'moment', 'present', 'currently', 'right now'];
    const presentMoment = presentWords.filter(w => msg.includes(w)).length / presentWords.length;

    const paradoxWords = ['both', 'and', 'even though', 'despite', 'yet also', 'simultaneously'];
    const paradoxHolding = paradoxWords.filter(w => msg.includes(w)).length / paradoxWords.length;

    const witnessWords = ['watching', 'observing', 'noticing', 'witnessing', 'part of me'];
    const witnessCapacity = witnessWords.filter(w => msg.includes(w)).length / witnessWords.length;

    return {
      language: {
        complexity: Math.min(1, complexity),
        emotional: Math.min(1, emotional),
        spiritual: Math.min(1, spiritual),
        somatic: Math.min(1, somatic),
        relational: Math.min(1, relational)
      },
      stress: {
        urgency: Math.min(1, urgency),
        overwhelm: Math.min(1, overwhelm),
        fragmentation: Math.min(1, fragmentation)
      },
      awareness: {
        selfReflection: Math.min(1, selfReflection),
        presentMoment: Math.min(1, presentMoment),
        paradoxHolding: Math.min(1, paradoxHolding),
        witnessCapacity: Math.min(1, witnessCapacity)
      }
    };
  }

  /**
   * Calculate likelihood score for each awareness level
   */
  private calculateLevelScore(
    indicators: StateIndicators,
    level: ConsciousnessState,
    context: any
  ): number {
    let score = 0;

    switch (level.currentLevel) {
      case 1: // Survival State
        score += indicators.stress.urgency * 0.4;
        score += indicators.stress.overwhelm * 0.3;
        score += (1 - indicators.awareness.witnessCapacity) * 0.2;
        score += (1 - indicators.language.complexity) * 0.1;
        break;

      case 2: // Emotional Processing
        score += indicators.language.emotional * 0.4;
        score += indicators.language.relational * 0.2;
        score += (1 - indicators.language.complexity) * 0.2;
        score += (1 - indicators.awareness.witnessCapacity) * 0.2;
        break;

      case 3: // Mental Processing
        score += indicators.language.complexity * 0.3;
        score += (1 - indicators.language.emotional) * 0.2;
        score += indicators.awareness.selfReflection * 0.25;
        score += (1 - indicators.stress.overwhelm) * 0.25;
        break;

      case 4: // Transformational Opening
        score += indicators.language.spiritual * 0.3;
        score += indicators.awareness.selfReflection * 0.3;
        score += indicators.language.complexity * 0.2;
        score += (1 - indicators.stress.urgency) * 0.2;
        break;

      case 5: // Unified Awareness
        score += indicators.awareness.witnessCapacity * 0.3;
        score += indicators.awareness.paradoxHolding * 0.25;
        score += indicators.awareness.presentMoment * 0.2;
        score += indicators.language.spiritual * 0.15;
        score += (1 - indicators.stress.overwhelm) * 0.1;
        break;
    }

    return Math.min(1, score);
  }

  /**
   * Assess state fluctuation patterns
   */
  private assessStateFluctuation(
    message: string,
    context: any,
    detectedLevel: ConsciousnessState
  ) {
    // Analyze stability indicators
    const stabilityWords = ['always', 'usually', 'consistently', 'stable', 'steady'];
    const fluctuationWords = ['sometimes', 'lately', 'today', 'right now', 'suddenly'];

    const stability = stabilityWords.filter(w =>
      message.toLowerCase().includes(w)
    ).length / Math.max(1, fluctuationWords.filter(w =>
      message.toLowerCase().includes(w)
    ).length);

    // Determine trajectory
    const upwardWords = ['growing', 'improving', 'opening', 'expanding', 'rising'];
    const downwardWords = ['declining', 'falling', 'closing', 'contracting', 'dropping'];

    const upward = upwardWords.filter(w => message.toLowerCase().includes(w)).length;
    const downward = downwardWords.filter(w => message.toLowerCase().includes(w)).length;

    let trajectory: 'ascending' | 'descending' | 'fluctuating' | 'stable' = 'stable';
    if (upward > downward) trajectory = 'ascending';
    else if (downward > upward) trajectory = 'descending';
    else if (stability < 0.5) trajectory = 'fluctuating';

    // Identify trigger factors
    const triggerFactors: string[] = [];
    if (message.includes('stress')) triggerFactors.push('stress');
    if (message.includes('relationship')) triggerFactors.push('relational dynamics');
    if (message.includes('work')) triggerFactors.push('work pressure');
    if (message.includes('health')) triggerFactors.push('health concerns');
    if (message.includes('spiritual')) triggerFactors.push('spiritual opening');

    return {
      stability: Math.min(1, stability),
      trajectory,
      triggerFactors
    };
  }

  /**
   * Generate adaptation recommendations
   */
  private generateAdaptationRecommendations(
    detectedLevel: ConsciousnessState,
    indicators: StateIndicators,
    stateFluctuation: any
  ) {
    const adaptations = {
      communicationAdjustments: [] as string[],
      elementalApproach: detectedLevel.elementalSignature,
      wisdomDeliveryStyle: detectedLevel.communicationStyle
    };

    // Level-specific adaptations
    switch (detectedLevel.currentLevel) {
      case 1: // Survival
        adaptations.communicationAdjustments.push(
          "Use simple, grounding language",
          "Focus on immediate practical support",
          "Avoid complex spiritual concepts",
          "Emphasize safety and presence"
        );
        break;

      case 2: // Emotional
        adaptations.communicationAdjustments.push(
          "Lead with emotional validation",
          "Use feeling-focused language",
          "Allow space for emotional expression",
          "Avoid rushing to solutions"
        );
        break;

      case 3: // Mental
        adaptations.communicationAdjustments.push(
          "Offer clear frameworks and perspectives",
          "Engage in exploratory questioning",
          "Provide mental maps and understanding",
          "Honor their analytical process"
        );
        break;

      case 4: // Transformational
        adaptations.communicationAdjustments.push(
          "Support their growth edge",
          "Reflect patterns and insights",
          "Offer transformational perspectives",
          "Encourage integration of insights"
        );
        break;

      case 5: // Unified
        adaptations.communicationAdjustments.push(
          "Match their spacious awareness",
          "Honor paradox and complexity",
          "Speak from wisdom and presence",
          "Allow for silence and space"
        );
        break;
    }

    // Stability-based adaptations
    if (stateFluctuation.stability < 0.5) {
      adaptations.communicationAdjustments.push(
        "Acknowledge the fluctuation",
        "Normalize state changes",
        "Offer grounding presence"
      );
    }

    return adaptations;
  }

  /**
   * Get baseline level from user's historical pattern
   */
  getBaselineLevel(userHistory: any[]): number {
    // This would analyze historical interactions to establish baseline
    // For now, return a default
    return 3; // Default to mental processing level
  }

  /**
   * Detect state shifts within conversation
   */
  detectStateShift(
    previousState: ConsciousnessStateRecognition,
    currentMessage: string
  ): {
    shiftDetected: boolean;
    shiftDirection: 'up' | 'down' | 'sideways' | 'none';
    shiftMagnitude: number;
  } {
    // Implementation for detecting real-time state changes
    return {
      shiftDetected: false,
      shiftDirection: 'none',
      shiftMagnitude: 0
    };
  }
}

// Global consciousness state detector
export const consciousnessStateDetector = new ConsciousnessStateDetector();