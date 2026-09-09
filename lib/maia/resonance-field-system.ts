/**
 * Resonance Field System
 * Archetypal agents create probability fields that Sesame vibrates within
 *
 * Revolutionary principle: Agents don't DECIDE response, they create
 * an atmospheric field that makes certain responses more probable.
 * Response emerges from interference pattern, not selection.
 */

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
 */
export interface ResonanceField {
  /** Weather-derived, and ABSENT when no weather signal was supplied. */
  elements?: ElementalFrequency;
  /** State-derived, and ABSENT when no user state was supplied. */
  consciousness?: ConsciousnessInfluence;
  /** ⭐ Computed from THIS TEXT. Always present. */
  hemispheres: HemisphericBalance;
  /** ⭐ Archetypal readings of THIS TEXT. Always present. */
  textSilence: number;
  textTiming: number;

  // Derived atmospheric properties — present only where their premises are
  wordDensity?: number;
  silenceProbability?: number;
  fragmentationRate?: number;
  responseLatency?: number;
  pauseDuration?: number;

  /**
   * ⭐ CHRONOLOGY ONLY. The factual number of exchanges. It may NOT determine
   * intimacy, "deepening", elemental identity, or relational depth.
   * ⛔ `intimacyLevel` is REMOVED — it was `exchangeCount / 30`.
   */
  exchangeCount: number;
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
  /**
   * RESONANCE-TRUTH (founder ruling, 2026-09-09).
   *
   * ⭐⭐ Count may describe chronology. It may not masquerade as relationship.
   * ⭐⭐ Chronology tells us how long the conversation has gone on. It does not
   *     tell us what the relationship has become.
   *
   * REMOVED: `exchangeCount < 10 → Air 0.5` ("early") and `< 30 → Water 0.4`
   * ("deepening"), which declared turn 11 more Water-like than turn 9 purely
   * because two more exchanges had occurred. Also removed the `intimacyLevel > 0.7
   * → Earth 0.6` branch, since intimacy itself was `exchangeCount / 30`.
   *
   * REMOVED: the "balanced middle" 0.25/0.25/0.25/0.25 fallthrough. ⭐ Unknown is
   * not neutral — a balanced field is a CLAIM that the four are in equilibrium,
   * and nothing observed that.
   *
   * ⛔ No replacement heuristic. Absence is returned as absence.
   */
  static calculateElementalWeights(
    userWeather: string | undefined
  ): ElementalFrequency | undefined {
    // Weather-derived, and only when weather was actually supplied.
    if (userWeather && (userWeather.includes('crisis') || userWeather.includes('rage'))) {
      return {
        earth: 0.1,
        water: 0.1,
        air: 0.1,
        fire: 0.7,
      };
    }

    // ⛔ No fallthrough weights. With no weather signal there is nothing to
    // derive an elemental field from, and a "balanced middle" would assert
    // equilibrium nobody observed.
    return undefined;
  }

  /**
   * Calculate consciousness influence based on user state
   */
  /**
   * RESONANCE-TRUTH — ⭐ Unknown is not neutral.
   *
   * Previously an absent state arrived as `''`, matched no branch, and fell
   * through to an "ordinary" distribution — silently transforming UNKNOWN into
   * ORDINARY. State-dependent branches now simply do not participate.
   */
  static calculateConsciousnessInfluence(
    userState: string | undefined
  ): ConsciousnessInfluence | undefined {
    if (!userState) return undefined;
    if (userState.includes('crisis') || userState.includes('raw')) {
      return {
        conscious: 0.2,
        unconscious: 0.5,
        higherSelf: 0.1,
        lowerSelf: 0.2,
      };
    }

    // ⛔ REMOVED: an `intimacyLevel > 0.7` branch (intimacy was exchangeCount/30)
    // and an "early conversation" fallthrough that fired for every unknown state.
    return undefined;
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
    if (elements && elements.earth > 0.5) {
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
    if (elements && elements.water > 0.4) {
      responses.push(
        "Feel that.",
        "Let it flow.",
        "I'm here.",
        "Stay with it.",
        "Mm-hmm."
      );
    }

    // Air-heavy field: Questions, exploration
    if (elements && elements.air > 0.4) {
      responses.push(
        "Tell me.",
        "What else?",
        "And?",
        "How so?",
        "Keep going."
      );
    }

    // Fire-heavy field: Active, immediate
    if (elements && elements.fire > 0.4) {
      responses.push(
        "Yes!",
        "Do it.",
        "Now.",
        "Go.",
        "That."
      );
    }

    // Higher self influence: Space and wisdom
    if (consciousness && consciousness.higherSelf > 0.3) {
      responses.push(
        "Breathe.",
        "Space.",
        "Wisdom's here.",
        "Trust.",
        null as any  // Higher self often chooses silence
      );
    }

    // Lower self influence: Raw immediacy
    if (consciousness && consciousness.lowerSelf > 0.3) {
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
    // RESONANCE-TRUTH: no silence probability means no basis to fall silent.
    if (field.silenceProbability !== undefined && randomSeed < field.silenceProbability) {
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
   */
  /**
   * RESONANCE-TRUTH — the question is not "how do we keep every field
   * populated?" but ⭐ "what is still knowable once the fabricated premises are
   * removed?" Several outputs cannot survive, and that is the correct outcome.
   *
   * ⛔ `intimacyLevel` is gone as a parameter. A real intimacy signal would be a
   * separate member-about inference with its own provenance, consent, authority
   * and room policy — and Writer's Studio has already ruled that kind of
   * relationship interpretation is not ambient. Absent means absent: not 0, not
   * 0.1, and not a better-looking formula.
   */
  generateField(
    userInput: string,
    context: any,
    exchangeCount: number
  ): ResonanceField {
    // ⭐ `context.userWeather || ''` used to turn UNKNOWN into a value that
    // matched no branch and therefore read as ORDINARY. Absence stays absent.
    const elements = ProbabilityCascade.calculateElementalWeights(context.userWeather);
    const consciousness = ProbabilityCascade.calculateConsciousnessInfluence(context.userState);

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

    /**
     * Each derived property survives only where its premises do.
     *
     *   wordDensity        f(elements) ONLY          → absent without elements
     *   silenceProbability blends elements + consciousness + text readings
     *                      → absent; rescaling the surviving term would be a
     *                        DIFFERENT quantity wearing the same name
     *   fragmentationRate  blends elements.air + a real hemispheric reading
     *                      → absent, same reason. The hemispheric reading itself
     *                        survives and is exported as `hemispheres`.
     *   responseLatency    avgTiming (text) × elements → absent
     *   pauseDuration      was literally `intimacyLevel * 2000` → absent
     *
     * ⭐ What remains is what was actually observed: the hemispheric balance and
     * the archetypal readings, both computed from THIS TEXT, plus the factual
     * exchange count — as chronology, claiming nothing about the relationship.
     */
    const field: ResonanceField = {
      elements,
      consciousness,
      hemispheres,
      textSilence: totalSilence,
      textTiming: avgTiming,

      ...(elements ? {
        wordDensity: (1 - elements.earth * 0.7) * (1 + elements.air * 0.3),
        fragmentationRate: elements.air * 0.7 + hemispheres.rightBrain * 0.3,
        responseLatency: Math.max(500, avgTiming * (1 + elements.earth * 2) * (1 - elements.fire * 0.5)),
        pauseDuration: 1000 + (elements.earth * 1500),
        ...(consciousness ? {
          silenceProbability:
            elements.earth * 0.6 +
            consciousness.higherSelf * 0.4 +
            consciousness.unconscious * 0.2 +
            totalSilence * 0.3,
        } : {}),
      } : {}),

      exchangeCount
    };

    // Store in history
    this.fieldHistory.push(field);

    return field;
  }

  /**
   * Generate response by letting field constrain possibilities
   */
  generateResponse(field: ResonanceField): string | null {
    // Get constrained palette based on field
    const palette = ResponsePalette.getConstrainedResponses(field);

    // Select from palette (with silence probability)
    return ResponsePalette.selectResponse(palette, field);
  }

  /**
   * Complete flow: field generation → response emergence
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
  }> {
    // Generate field
    const field = this.generateField(userInput, context, exchangeCount);

    // Let response emerge from field
    const response = this.generateResponse(field);

    return {
      response,
      field,
      /**
       * OPERATIONAL DEFAULT, not a cognitive signal. A response still has to be
       * scheduled, so when the field cannot supply a timing the system falls back
       * to a plain default. ⭐ That is the system choosing what to DO in the
       * absence of knowledge — it is not a claim that anything was observed, and
       * these values never enter cognition.
       */
      timing: {
        delay: field.responseLatency ?? 800,
        pauseAfter: field.pauseDuration ?? 1000
      }
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
    /** Absent when the two fields did not both carry elemental weights. */
    elementalShift?: string;
    /** Absent when either field lacked a silence premise. */
    silenceTrend?: number;
    // ⛔ `intimacyGrowth` REMOVED — it measured the growth of exchangeCount/30.
  } {
    // ⛔ Was: `{ elementalShift: 'insufficient data', intimacyGrowth: 0, silenceTrend: 0 }`.
    // Zero is not "no trend"; it is a trend of zero. With fewer than two fields
    // there is nothing to compare, so nothing is returned.
    if (this.fieldHistory.length < 2) return {};

    const first = this.fieldHistory[0];
    const last = this.fieldHistory[this.fieldHistory.length - 1];

    // RESONANCE-TRUTH: a trend across two fields is only computable where BOTH
    // carried the premise. ⛔ `intimacyGrowth` is gone entirely — it measured the
    // growth of a number that was `exchangeCount / 30`, i.e. it measured the
    // passage of turns and called it deepening.
    const elementalShift = (last.elements && first.elements)
      ? `Moving toward ${Object.entries({
          earth: last.elements.earth - first.elements.earth,
          water: last.elements.water - first.elements.water,
          air: last.elements.air - first.elements.air,
          fire: last.elements.fire - first.elements.fire,
        }).reduce((a, b) => (a[1] > b[1] ? a : b))[0]}`
      : undefined;

    return {
      elementalShift,
      silenceTrend: (last.silenceProbability !== undefined && first.silenceProbability !== undefined)
        ? last.silenceProbability - first.silenceProbability
        : undefined,
    };
  }
}

/**
 * Export for integration with breath/lungs system
 */
export default ResonanceFieldGenerator;