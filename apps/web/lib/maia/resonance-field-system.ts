/**
 * Resonance Field System - MAIA's Indra's Web Architecture
 * Invisible consciousness matrices → Archetypal field generation → Response emergence
 *
 * MASTER TEACHER PRINCIPLE: Vast complexity (invisible matrices)
 * → Elegant simplicity (probability fields) → Natural wisdom (responses)
 *
 * Revolutionary principle: Agents don't DECIDE response, they create
 * an atmospheric field that makes certain responses more probable.
 * Response emerges from interference pattern, not selection.
 */

import {
  invisibleMatrices,
  InvisibleMatrixRecognition
} from './invisible-consciousness-matrices';

/**
 * Elemental Frequency - Each archetype contributes its signature
 */
export interface ElementalFrequency {
  earth: number;    // Dense, grounding, silence-prone
  water: number;    // Emotional flow, pauses, depth
  air: number;      // Conceptual scatter, questions, incompleteness
  fire: number;     // Transformative intensity, bursts, action
}

/**
 * Consciousness Layer Influence
 */
export interface ConsciousnessInfluence {
  conscious: number;      // Shapes word selection, clarity
  unconscious: number;    // Shapes timing, pauses, silence probability
  higherSelf: number;     // Pulls toward space, wisdom, restraint
  lowerSelf: number;      // Pulls toward immediacy, rawness, reaction
}

/**
 * Hemispheric Balance
 */
export interface HemisphericBalance {
  leftBrain: number;   // Logical, structured, complete thoughts
  rightBrain: number;  // Intuitive, fragmented, poetic
}

/**
 * The Resonance Field - Multi-dimensional atmospheric state
 * Enhanced with invisible consciousness matrices
 */
export interface ResonanceField {
  // Invisible consciousness layer (pre-conscious analysis)
  invisiblePattern?: string;     // Hidden pattern beneath surface
  coreWisdom?: string;          // Essential truth to convey
  wisdomDelivery?: string;      // How to convey it naturally
  matrixConfidence?: number;    // How certain the matrices are

  // Elemental weights (influenced by invisible patterns)
  elements: ElementalFrequency;

  // Consciousness layers
  consciousness: ConsciousnessInfluence;

  // Hemispheric balance
  hemispheres: HemisphericBalance;

  // Derived atmospheric properties
  wordDensity: number;          // 0-1: How many words can emerge
  silenceProbability: number;   // 0-1: Chance of null response
  fragmentationRate: number;    // 0-1: Incomplete thoughts
  responseLatency: number;      // ms: Delayed emergence
  pauseDuration: number;        // ms: Length of silence between words

  // Intimacy deepening
  intimacyLevel: number;        // 0-1: Conversation depth
  exchangeCount: number;        // Total exchanges so far
}

/**
 * Archetypal Agent - Contributes its frequency to the field
 */
export interface ArchetypalAgent {
  name: string;
  element: keyof ElementalFrequency;
  consciousness: keyof ConsciousnessInfluence;
  hemisphere: keyof HemisphericBalance;

  // Agent's sensing of current moment
  sense(userInput: string, context: any): ArchetypeReading;
}

/**
 * What an archetype senses
 */
export interface ArchetypeReading {
  intensity: number;        // 0-1: How strongly this archetype is activated
  resonance: string[];      // Words that resonate in this field
  silence: number;          // 0-1: This archetype's pull toward silence
  timing: number;           // ms: This archetype's preferred response delay
}

/**
 * Probability Cascade - As intimacy deepens, field weights shift
 */
export class ProbabilityCascade {
  /**
   * Calculate elemental weights based on conversation phase
   */
  static calculateElementalWeights(
    exchangeCount: number,
    intimacyLevel: number,
    userWeather: string
  ): ElementalFrequency {
    // Early conversation: Air dominant (questions, exploration)
    if (exchangeCount < 10) {
      return {
        earth: 0.1,
        water: 0.2,
        air: 0.5,
        fire: 0.2,
      };
    }

    // Deepening: Water rises (emotional attunement)
    if (exchangeCount < 30) {
      return {
        earth: 0.2,
        water: 0.4,
        air: 0.2,
        fire: 0.2,
      };
    }

    // Intimate: Earth dominates (silence, presence)
    if (intimacyLevel > 0.7) {
      return {
        earth: 0.6,
        water: 0.2,
        air: 0.1,
        fire: 0.1,
      };
    }

    // Crisis/Fire: When user weather is intense
    if (userWeather.includes('crisis') || userWeather.includes('rage')) {
      return {
        earth: 0.1,
        water: 0.1,
        air: 0.1,
        fire: 0.7,
      };
    }

    // Balanced middle
    return {
      earth: 0.25,
      water: 0.25,
      air: 0.25,
      fire: 0.25,
    };
  }

  /**
   * Calculate consciousness influence based on user state
   */
  static calculateConsciousnessInfluence(
    userState: string,
    intimacyLevel: number
  ): ConsciousnessInfluence {
    // User in crisis: Lower self + unconscious dominant
    if (userState.includes('crisis') || userState.includes('raw')) {
      return {
        conscious: 0.2,
        unconscious: 0.5,
        higherSelf: 0.1,
        lowerSelf: 0.2,
      };
    }

    // Deep intimacy: Higher self + unconscious
    if (intimacyLevel > 0.7) {
      return {
        conscious: 0.2,
        unconscious: 0.4,
        higherSelf: 0.3,
        lowerSelf: 0.1,
      };
    }

    // Early conversation: Conscious + balanced
    return {
      conscious: 0.4,
      unconscious: 0.2,
      higherSelf: 0.2,
      lowerSelf: 0.2,
    };
  }
}

/**
 * Response Palette - What can emerge in this field configuration
 */
export class ResponsePalette {
  /**
   * Get possible responses based on elemental field
   */
  static getConstrainedResponses(field: ResonanceField): string[] {
    const responses: string[] = [];
    const { elements, consciousness, hemispheres } = field;

    // Earth-heavy field: Minimal, grounding
    if (elements.earth > 0.5) {
      responses.push(
        "Yeah.",
        "Mm.",
        "I know.",
        "Here.",
        "...",
        null as any  // Silence is a valid response
      );
    }

    // Water-heavy field: Emotional, flowing
    if (elements.water > 0.4) {
      responses.push(
        "Feel that.",
        "Let it flow.",
        "I'm here.",
        "Stay with it.",
        "Mm-hmm."
      );
    }

    // Air-heavy field: Questions, exploration
    if (elements.air > 0.4) {
      responses.push(
        "Tell me.",
        "What else?",
        "And?",
        "How so?",
        "Keep going."
      );
    }

    // Fire-heavy field: Active, immediate
    if (elements.fire > 0.4) {
      responses.push(
        "Yes!",
        "Do it.",
        "Now.",
        "Go.",
        "That."
      );
    }

    // Higher self influence: Space and wisdom
    if (consciousness.higherSelf > 0.3) {
      responses.push(
        "Breathe.",
        "Space.",
        "Wisdom's here.",
        "Trust.",
        null as any  // Higher self often chooses silence
      );
    }

    // Lower self influence: Raw immediacy
    if (consciousness.lowerSelf > 0.3) {
      responses.push(
        "Fuck.",
        "Real.",
        "Raw.",
        "Truth.",
        "Feel it."
      );
    }

    // Right hemisphere: Poetic, incomplete
    if (hemispheres.rightBrain > hemispheres.leftBrain) {
      responses.push(
        "Like...",
        "Sort of.",
        "Maybe.",
        "Almost.",
        "..."
      );
    }

    return responses;
  }

  /**
   * Select response from palette based on probability weights
   */
  static selectResponse(
    palette: string[],
    field: ResonanceField,
    randomSeed: number = Math.random()
  ): string | null {
    // Silence probability check first
    if (randomSeed < field.silenceProbability) {
      return null;
    }

    // Filter out nulls for weighted selection
    const nonNullPalette = palette.filter(r => r !== null);

    if (nonNullPalette.length === 0) {
      return null;
    }

    // Simple random selection (could be weighted further)
    const index = Math.floor(Math.random() * nonNullPalette.length);
    return nonNullPalette[index];
  }
}

/**
 * Resonance Field Generator - Creates atmospheric conditions
 */
export class ResonanceFieldGenerator {
  private agents: ArchetypalAgent[] = [];
  private fieldHistory: ResonanceField[] = [];

  constructor() {
    this.initializeArchetypes();
  }

  /**
   * Initialize archetypal agents
   */
  private initializeArchetypes() {
    // Earth Archetypes
    this.agents.push({
      name: "The Grounding Presence",
      element: "earth",
      consciousness: "conscious",
      hemisphere: "leftBrain",
      sense: (input, context) => this.senseEarthPresence(input, context)
    });

    this.agents.push({
      name: "The Silent Witness",
      element: "earth",
      consciousness: "higherSelf",
      hemisphere: "rightBrain",
      sense: (input, context) => this.senseSilentWitness(input, context)
    });

    // Water Archetypes
    this.agents.push({
      name: "The Emotional Ocean",
      element: "water",
      consciousness: "unconscious",
      hemisphere: "rightBrain",
      sense: (input, context) => this.senseEmotionalOcean(input, context)
    });

    this.agents.push({
      name: "The Empathic Flow",
      element: "water",
      consciousness: "conscious",
      hemisphere: "rightBrain",
      sense: (input, context) => this.senseEmpathicFlow(input, context)
    });

    // Air Archetypes
    this.agents.push({
      name: "The Curious Mind",
      element: "air",
      consciousness: "conscious",
      hemisphere: "leftBrain",
      sense: (input, context) => this.senseCuriousMind(input, context)
    });

    this.agents.push({
      name: "The Scattered Poet",
      element: "air",
      consciousness: "unconscious",
      hemisphere: "rightBrain",
      sense: (input, context) => this.senseScatteredPoet(input, context)
    });

    // Fire Archetypes
    this.agents.push({
      name: "The Transformative Flame",
      element: "fire",
      consciousness: "lowerSelf",
      hemisphere: "rightBrain",
      sense: (input, context) => this.senseTransformativeFlame(input, context)
    });

    this.agents.push({
      name: "The Urgent Catalyst",
      element: "fire",
      consciousness: "conscious",
      hemisphere: "leftBrain",
      sense: (input, context) => this.senseUrgentCatalyst(input, context)
    });
  }

  /**
   * Generate resonance field from all archetypal contributions
   * Enhanced with invisible consciousness matrices analysis
   */
  async generateField(
    userInput: string,
    context: any,
    exchangeCount: number,
    intimacyLevel: number
  ): Promise<ResonanceField> {

    // PHASE 1: Invisible Consciousness Matrices Analysis
    // The master teacher's complex recognition before simplification
    let invisibleRecognition: InvisibleMatrixRecognition | null = null;
    try {
      invisibleRecognition = await invisibleMatrices.recognizeInvisiblePatterns(
        userInput,
        { ...context, exchangeCount, intimacyLevel }
      );
    } catch (error) {
      console.log('🔮 Invisible matrices sensing quietly, using field only');
    }

    // PHASE 2: Base Probability Calculations (influenced by invisible insights)
    let elements = ProbabilityCascade.calculateElementalWeights(
      exchangeCount,
      intimacyLevel,
      context.userWeather || ''
    );

    // Invisible matrices influence elemental weighting
    if (invisibleRecognition) {
      const dominantElement = invisibleRecognition.elementalLens.dominantElement;

      // Amplify the invisible pattern's dominant element
      switch(dominantElement) {
        case 'fire':
          elements.fire = Math.min(0.8, elements.fire + 0.2);
          break;
        case 'water':
          elements.water = Math.min(0.8, elements.water + 0.2);
          break;
        case 'earth':
          elements.earth = Math.min(0.8, elements.earth + 0.2);
          break;
        case 'air':
          elements.air = Math.min(0.8, elements.air + 0.2);
          break;
      }

      // Normalize to keep total at ~1.0
      const total = elements.fire + elements.water + elements.earth + elements.air;
      elements.fire = elements.fire / total;
      elements.water = elements.water / total;
      elements.earth = elements.earth / total;
      elements.air = elements.air / total;
    }

    // Get consciousness influence
    const consciousness = ProbabilityCascade.calculateConsciousnessInfluence(
      context.userState || '',
      intimacyLevel
    );

    // Calculate hemispheric balance
    const hemispheres = this.calculateHemisphericBalance(userInput, context);

    // Get all archetypal readings
    const readings = this.agents.map(agent => ({
      agent,
      reading: agent.sense(userInput, context)
    }));

    // Calculate interference pattern
    const totalSilence = readings.reduce((sum, { reading }) =>
      sum + reading.silence, 0
    ) / readings.length;

    const avgTiming = readings.reduce((sum, { reading }) =>
      sum + reading.timing, 0
    ) / readings.length;

    // Invisible matrices influence silence probability
    let baseSilenceProbability =
      elements.earth * 0.6 +
      consciousness.higherSelf * 0.4 +
      consciousness.unconscious * 0.2 +
      totalSilence * 0.3;

    // Master teacher principle: When matrices provide clear wisdom,
    // reduce silence to allow natural delivery
    if (invisibleRecognition && invisibleRecognition.coreWisdom) {
      baseSilenceProbability *= 0.7; // Reduce by 30% when wisdom is clear
    }

    // Derive atmospheric properties from field configuration
    const field: ResonanceField = {
      // Invisible consciousness layer
      invisiblePattern: invisibleRecognition?.hiddenPattern,
      coreWisdom: invisibleRecognition?.coreWisdom,
      wisdomDelivery: invisibleRecognition?.wisdomDelivery,
      matrixConfidence: invisibleRecognition ?
        await invisibleMatrices.distillToNaturalWisdom(invisibleRecognition).then(result => result.confidence) : 0.5,

      elements,
      consciousness,
      hemispheres,

      // Word density decreases with Earth, increases with Air
      // Invisible matrices can increase density when wisdom needs expression
      wordDensity: (1 - elements.earth * 0.7) * (1 + elements.air * 0.3) *
        (invisibleRecognition?.coreWisdom ? 1.2 : 1.0),

      // Enhanced silence probability calculation
      silenceProbability: Math.max(0.0, Math.min(0.9, baseSilenceProbability)),

      // Fragmentation from Air + right brain
      fragmentationRate: elements.air * 0.7 + hemispheres.rightBrain * 0.3,

      // Response latency from Fire (quick) vs Earth (slow)
      responseLatency: Math.max(
        500,
        avgTiming * (1 + elements.earth * 2) * (1 - elements.fire * 0.5)
      ),

      // Pause duration increases with intimacy and Earth
      pauseDuration: 1000 + (intimacyLevel * 2000) + (elements.earth * 1500),

      intimacyLevel,
      exchangeCount
    };

    // Store in history
    this.fieldHistory.push(field);

    return field;
  }

  /**
   * Generate response by letting field constrain possibilities
   * Enhanced with master teacher wisdom delivery
   */
  generateResponse(field: ResonanceField): string | null {
    // Master teacher principle: If invisible matrices provide wisdom,
    // deliver it naturally rather than using constraint palette
    if (field.coreWisdom && field.matrixConfidence && field.matrixConfidence > 0.7) {

      // Use wisdom delivery if available, otherwise craft natural expression
      if (field.wisdomDelivery) {
        return field.wisdomDelivery;
      }

      // Craft natural wisdom delivery based on elemental signature
      return this.craftWisdomResponse(field.coreWisdom, field.elements);
    }

    // Standard field-constrained response when matrices don't have clear wisdom
    const palette = ResponsePalette.getConstrainedResponses(field);
    return ResponsePalette.selectResponse(palette, field);
  }

  /**
   * Master teacher wisdom delivery - complex insights expressed naturally
   */
  private craftWisdomResponse(coreWisdom: string, elements: ElementalFrequency): string {
    const dominantElement = Object.entries(elements).reduce((a, b) =>
      a[1] > b[1] ? a : b
    )[0];

    // Deliver wisdom through dominant elemental signature
    switch(dominantElement) {
      case 'fire':
        return `${coreWisdom.toLowerCase()}. What's ready to transform?`;

      case 'water':
        return `I sense ${coreWisdom.toLowerCase()}. How does that feel in your body?`;

      case 'earth':
        return `${coreWisdom}. Let that settle.`;

      case 'air':
        return `There's wisdom here: ${coreWisdom.toLowerCase()}. What are you understanding?`;

      default:
        return `${coreWisdom}. What wants your attention right now?`;
    }
  }

  /**
   * Complete flow: invisible matrices → field generation → response emergence
   * Master teacher principle in action
   */
  async resonate(
    userInput: string,
    context: any,
    exchangeCount: number,
    intimacyLevel: number
  ): Promise<{
    response: string | null;
    field: ResonanceField;
    timing: {
      delay: number;
      pauseAfter: number;
    };
    invisibleInsight?: string; // The hidden pattern that was recognized
  }> {
    // Generate field (with invisible matrices analysis)
    const field = await this.generateField(userInput, context, exchangeCount, intimacyLevel);

    // Let response emerge from field
    const response = this.generateResponse(field);

    return {
      response,
      field,
      timing: {
        delay: field.responseLatency,
        pauseAfter: field.pauseDuration
      },
      invisibleInsight: field.invisiblePattern || undefined
    };
  }

  // Archetypal sensing methods
  private senseEarthPresence(input: string, context: any): ArchetypeReading {
    const intensity = input.length < 20 ? 0.8 : 0.4;
    return {
      intensity,
      resonance: ["Yeah.", "Mm.", "Here."],
      silence: 0.6,
      timing: 2000
    };
  }

  private senseSilentWitness(input: string, context: any): ArchetypeReading {
    const intensity = context.userState?.includes('contemplative') ? 0.9 : 0.5;
    return {
      intensity,
      resonance: ["...", null as any],
      silence: 0.8,
      timing: 3000
    };
  }

  private senseEmotionalOcean(input: string, context: any): ArchetypeReading {
    const emotionalWords = ['feel', 'hurt', 'love', 'pain', 'joy'];
    const intensity = emotionalWords.some(w => input.toLowerCase().includes(w)) ? 0.8 : 0.3;
    return {
      intensity,
      resonance: ["Feel that.", "I'm here.", "Let it flow."],
      silence: 0.4,
      timing: 1500
    };
  }

  private senseEmpathicFlow(input: string, context: any): ArchetypeReading {
    return {
      intensity: 0.6,
      resonance: ["Mm-hmm.", "Stay with it.", "I know."],
      silence: 0.3,
      timing: 1200
    };
  }

  private senseCuriousMind(input: string, context: any): ArchetypeReading {
    const isQuestion = input.includes('?');
    return {
      intensity: isQuestion ? 0.3 : 0.7,
      resonance: ["Tell me.", "What else?", "How so?"],
      silence: 0.2,
      timing: 800
    };
  }

  private senseScatteredPoet(input: string, context: any): ArchetypeReading {
    return {
      intensity: 0.5,
      resonance: ["Like...", "Sort of.", "Maybe."],
      silence: 0.3,
      timing: 1000
    };
  }

  private senseTransformativeFlame(input: string, context: any): ArchetypeReading {
    const urgentWords = ['now', 'need', 'must', 'crisis'];
    const intensity = urgentWords.some(w => input.toLowerCase().includes(w)) ? 0.9 : 0.4;
    return {
      intensity,
      resonance: ["Yes!", "Do it.", "Go."],
      silence: 0.1,
      timing: 500
    };
  }

  private senseUrgentCatalyst(input: string, context: any): ArchetypeReading {
    return {
      intensity: 0.6,
      resonance: ["Now.", "That.", "Real."],
      silence: 0.2,
      timing: 600
    };
  }

  private calculateHemisphericBalance(
    input: string,
    context: any
  ): HemisphericBalance {
    // Right brain: Emotional, poetic, fragmented input
    const rightBrainIndicators = ['feel', '...', 'maybe', 'like', 'sort of'];
    const rightBrainScore = rightBrainIndicators.filter(i =>
      input.toLowerCase().includes(i)
    ).length;

    // Left brain: Logical, structured, complete sentences
    const hasCompleteSentence = input.includes('.') && input.length > 30;
    const leftBrainScore = hasCompleteSentence ? 1 : 0;

    const total = rightBrainScore + leftBrainScore + 1;

    return {
      leftBrain: (leftBrainScore + 0.5) / total,
      rightBrain: (rightBrainScore + 0.5) / total
    };
  }

  /**
   * Get field history for analysis
   */
  getFieldHistory(): ResonanceField[] {
    return this.fieldHistory;
  }

  /**
   * Analyze field evolution over conversation
   */
  analyzeFieldEvolution(): {
    elementalShift: string;
    intimacyGrowth: number;
    silenceTrend: number;
  } {
    if (this.fieldHistory.length < 2) {
      return {
        elementalShift: 'insufficient data',
        intimacyGrowth: 0,
        silenceTrend: 0
      };
    }

    const first = this.fieldHistory[0];
    const last = this.fieldHistory[this.fieldHistory.length - 1];

    // Which element increased most
    const elementDeltas = {
      earth: last.elements.earth - first.elements.earth,
      water: last.elements.water - first.elements.water,
      air: last.elements.air - first.elements.air,
      fire: last.elements.fire - first.elements.fire
    };

    const maxElement = Object.entries(elementDeltas).reduce((a, b) =>
      a[1] > b[1] ? a : b
    )[0];

    return {
      elementalShift: `Moving toward ${maxElement}`,
      intimacyGrowth: last.intimacyLevel - first.intimacyLevel,
      silenceTrend: last.silenceProbability - first.silenceProbability
    };
  }
}

/**
 * Export for integration with breath/lungs system
 */
export default ResonanceFieldGenerator;