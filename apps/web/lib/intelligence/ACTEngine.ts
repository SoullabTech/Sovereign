/**
 * ACT (ACCEPTANCE & COMMITMENT THERAPY) ENGINE
 *
 * Based on Steven Hayes' Acceptance and Commitment Therapy
 *
 * Detects psychological flexibility and the 6 core ACT processes:
 * - Acceptance (vs experiential avoidance)
 * - Cognitive Defusion (vs fusion)
 * - Present Moment Awareness (vs past/future rumination)
 * - Self as Context (vs conceptualized self)
 * - Values Clarity (vs values confusion)
 * - Committed Action (vs inaction/avoidance)
 *
 * Elemental Resonance: FIRE (values, committed action) + AIR (defusion, perspective)
 */

export interface ACTState {
  detected: boolean;
  confidence: number;
  indicators: string[];

  // Overall psychological flexibility score
  psychologicalFlexibility: number; // 0-1 (0 = rigid/stuck, 1 = flexible/flowing)

  // The ACT Hexaflex (6 core processes)
  hexaflex: {
    // Process 1: Acceptance (opening to experience)
    acceptance: {
      detected: boolean;
      level: number; // 0-1 (0 = complete avoidance, 1 = full acceptance)
      indicators: string[];
    };

    // Process 2: Cognitive Defusion (seeing thoughts as thoughts)
    cognitiveDefusion: {
      detected: boolean;
      level: number; // 0-1 (0 = total fusion, 1 = complete defusion)
      indicators: string[];
    };

    // Process 3: Present Moment Awareness
    presentMoment: {
      detected: boolean;
      level: number; // 0-1 (0 = lost in past/future, 1 = grounded in now)
      indicators: string[];
    };

    // Process 4: Self as Context (observing self vs conceptualized self)
    selfAsContext: {
      detected: boolean;
      level: number; // 0-1 (0 = attached to self-concept, 1 = fluid awareness)
      indicators: string[];
    };

    // Process 5: Values Clarity
    values: {
      detected: boolean;
      clarity: number; // 0-1 (0 = no clue what matters, 1 = crystal clear)
      identifiedValues: string[]; // Extracted value words
      indicators: string[];
    };

    // Process 6: Committed Action
    committedAction: {
      detected: boolean;
      level: number; // 0-1 (0 = stuck/avoidant, 1 = active engagement)
      valueAligned: boolean; // Is action aligned with stated values?
      indicators: string[];
    };
  };

  // Experiential Avoidance (ACT's core pathology)
  experientialAvoidance: {
    detected: boolean;
    patterns: string[]; // What they're avoiding (feelings, thoughts, memories)
    strategies: string[]; // How they're avoiding (numbing, distraction, substances)
    cost: string; // What avoidance costs them (relationships, vitality, values)
    confidence: number;
  };

  // Cognitive Fusion (hooked by thoughts)
  cognitiveFusion: {
    detected: boolean;
    fusedBeliefs: string[]; // Thoughts they treat as literal truth
    literality: number; // 0-1 (how literally they take thoughts)
    confidence: number;
  };

  // Values-Action Alignment
  valuesActionGap: {
    gapDetected: boolean;
    description: string; // "Knows values but not living them"
    gapSize: number; // 0-1 (0 = aligned, 1 = complete disconnect)
  };

  // Elemental resonance
  elementalResonance: {
    fire: number; // Values clarity, committed action, purpose
    air: number; // Defusion, perspective, mindfulness
  };
}

export class ACTEngine {

  /**
   * Extract ACT state from text
   */
  extract(text: string): ACTState {
    const lower = text.toLowerCase();
    const indicators: string[] = [];

    // Detect hexaflex processes
    const acceptance = this.detectAcceptance(lower);
    const cognitiveDefusion = this.detectCognitiveDefusion(lower);
    const presentMoment = this.detectPresentMoment(lower);
    const selfAsContext = this.detectSelfAsContext(lower);
    const values = this.detectValues(lower);
    const committedAction = this.detectCommittedAction(lower);

    // Detect pathological processes
    const experientialAvoidance = this.detectExperientialAvoidance(lower);
    const cognitiveFusion = this.detectCognitiveFusion(lower);

    // Calculate psychological flexibility
    const psychologicalFlexibility = this.calculatePsychologicalFlexibility(
      acceptance,
      cognitiveDefusion,
      presentMoment,
      selfAsContext,
      values,
      committedAction
    );

    // Detect values-action gap
    const valuesActionGap = this.detectValuesActionGap(values, committedAction);

    // Calculate elemental resonance
    const elementalResonance = this.calculateElementalResonance(
      values,
      committedAction,
      cognitiveDefusion,
      presentMoment
    );

    // Aggregate indicators
    if (acceptance.detected) indicators.push(...acceptance.indicators);
    if (cognitiveDefusion.detected) indicators.push(...cognitiveDefusion.indicators);
    if (presentMoment.detected) indicators.push(...presentMoment.indicators);
    if (selfAsContext.detected) indicators.push(...selfAsContext.indicators);
    if (values.detected) indicators.push(...values.indicators);
    if (committedAction.detected) indicators.push(...committedAction.indicators);
    if (experientialAvoidance.detected) indicators.push('experiential-avoidance');
    if (cognitiveFusion.detected) indicators.push('cognitive-fusion');

    const detected = indicators.length > 0;
    const confidence = detected ? psychologicalFlexibility : 0;

    return {
      detected,
      confidence,
      indicators,
      psychologicalFlexibility,
      hexaflex: {
        acceptance,
        cognitiveDefusion,
        presentMoment,
        selfAsContext,
        values,
        committedAction
      },
      experientialAvoidance,
      cognitiveFusion,
      valuesActionGap,
      elementalResonance
    };
  }

  /**
   * PROCESS 1: Acceptance (willingness to experience)
   */
  private detectAcceptance(text: string): ACTState['hexaflex']['acceptance'] {
    let detected = false;
    let level = 0.5;
    const indicators: string[] = [];

    // Acceptance language
    const acceptancePatterns = [
      /\b(accept|accepting|acceptance|allow|allowing|willing|willingness)\b/i,
      /make room for|open to|let it be/i,
      /it's okay to (feel|be|have)/i,
      /\b(embrace|welcoming|holding) (the|this|my)/i
    ];

    for (const pattern of acceptancePatterns) {
      if (pattern.test(text)) {
        detected = true;
        level = Math.max(level, 0.7);
        indicators.push('acceptance-language');
        break;
      }
    }

    // "Sitting with" discomfort
    if (/sit(ting)? with (the|this|my) (pain|fear|discomfort|uncertainty)/i.test(text)) {
      detected = true;
      level = Math.max(level, 0.8);
      indicators.push('sitting-with-discomfort');
    }

    // Avoidance language (lowers acceptance level)
    const avoidancePatterns = [
      /can't (handle|stand|take|deal with)/i,
      /need (it|this|the feeling) to (go away|stop)/i,
      /make it stop/i,
      /\b(numb|avoid|escape|get away from)\b/i
    ];

    for (const pattern of avoidancePatterns) {
      if (pattern.test(text)) {
        level = Math.min(level, 0.3);
        indicators.push('avoidance-detected');
        break;
      }
    }

    return { detected, level, indicators };
  }

  /**
   * PROCESS 2: Cognitive Defusion (seeing thoughts as thoughts)
   */
  private detectCognitiveDefusion(text: string): ACTState['hexaflex']['cognitiveDefusion'] {
    let detected = false;
    let level = 0.5;
    const indicators: string[] = [];

    // Defusion language (noticing thoughts as thoughts)
    const defusionPatterns = [
      /\b(i'm having the thought|having a thought|my mind (says|tells me)|mind is saying)\b/i,
      /\b(notice|noticing) (the|my) thought/i,
      /it's just a thought/i,
      /\b(thought|story|narrative|belief) (that|about)\b/i,
      /my mind (is telling me|says)/i
    ];

    for (const pattern of defusionPatterns) {
      if (pattern.test(text)) {
        detected = true;
        level = Math.max(level, 0.8);
        indicators.push('defusion-language');
        break;
      }
    }

    // Meta-awareness of thinking
    if (/watching (my|the) thoughts|observing (my|the) (mind|thoughts)/i.test(text)) {
      detected = true;
      level = Math.max(level, 0.9);
      indicators.push('meta-awareness');
    }

    // Fusion markers (treating thoughts as facts)
    const fusionPatterns = [
      /\b(i am|i'm) (broken|worthless|unlovable|a failure|damaged)\b/i,
      /\b(it's true|definitely|obviously|clearly) (that i|i'm)\b/i,
      /\b(always|never) (am|will be)\b/i
    ];

    for (const pattern of fusionPatterns) {
      if (pattern.test(text)) {
        level = Math.min(level, 0.2);
        indicators.push('cognitive-fusion');
        break;
      }
    }

    return { detected, level, indicators };
  }

  /**
   * PROCESS 3: Present Moment Awareness
   */
  private detectPresentMoment(text: string): ACTState['hexaflex']['presentMoment'] {
    let detected = false;
    let level = 0.5;
    const indicators: string[] = [];

    // Present moment language
    const presentPatterns = [
      /\b(right now|this moment|present|here|currently)\b/i,
      /in this moment/i,
      /what's happening now/i,
      /\b(breath|breathing|sensing|feeling) (right )?now\b/i
    ];

    for (const pattern of presentPatterns) {
      if (pattern.test(text)) {
        detected = true;
        level = Math.max(level, 0.7);
        indicators.push('present-moment-language');
        break;
      }
    }

    // Body/sensory awareness (grounding in now)
    if (/\b(feel|sense|notice) (my|the) (body|breath|feet|ground)/i.test(text)) {
      detected = true;
      level = Math.max(level, 0.8);
      indicators.push('somatic-grounding');
    }

    // Past/future rumination (lowers present moment)
    const ruminationPatterns = [
      /keep (thinking|worrying) about/i,
      /can't stop (replaying|going over|thinking about)/i,
      /what if|if only/i,
      /\b(worried|anxious|scared) about (what|the future|tomorrow)/i
    ];

    for (const pattern of ruminationPatterns) {
      if (pattern.test(text)) {
        level = Math.min(level, 0.3);
        indicators.push('rumination-detected');
        break;
      }
    }

    return { detected, level, indicators };
  }

  /**
   * PROCESS 4: Self as Context (observing self vs conceptualized self)
   */
  private detectSelfAsContext(text: string): ACTState['hexaflex']['selfAsContext'] {
    let detected = false;
    let level = 0.5;
    const indicators: string[] = [];

    // Observer self language
    const observerPatterns = [
      /\b(witness|witnessing|observing|watching|noticing) (myself|my|the)\b/i,
      /\b(awareness|consciousness) (that|which) (holds|contains|witnesses)\b/i,
      /part of me.*but (i'm|i am) not (just )?that/i,
      /\b(i have|there is) (a|this) (thought|feeling|sensation) but i am not/i
    ];

    for (const pattern of observerPatterns) {
      if (pattern.test(text)) {
        detected = true;
        level = Math.max(level, 0.8);
        indicators.push('observer-self');
        break;
      }
    }

    // Fluid self-identity
    if (/\b(i contain|i'm more than|bigger than|not limited to)\b/i.test(text)) {
      detected = true;
      level = Math.max(level, 0.7);
      indicators.push('fluid-self-identity');
    }

    // Conceptualized self (rigid identity)
    const rigidSelfPatterns = [
      /\b(i am|i'm) (just|only|always) (a|an)/i,
      /that's (who|what) i am/i,
      /\b(i've always been|i'll always be)\b/i
    ];

    for (const pattern of rigidSelfPatterns) {
      if (pattern.test(text)) {
        level = Math.min(level, 0.3);
        indicators.push('conceptualized-self');
        break;
      }
    }

    return { detected, level, indicators };
  }

  /**
   * PROCESS 5: Values Clarity
   */
  private detectValues(text: string): ACTState['hexaflex']['values'] {
    let detected = false;
    let clarity = 0.5;
    const identifiedValues: string[] = [];
    const indicators: string[] = [];

    // Values language
    const valuesPatterns = [
      /\b(value|values|what matters|what's important|meaningful|meaning|purpose)\b/i,
      /\b(stand for|care about|committed to)\b/i,
      /want my life to be about/i,
      /\b(direction|compass|north star)\b/i
    ];

    for (const pattern of valuesPatterns) {
      if (pattern.test(text)) {
        detected = true;
        clarity = Math.max(clarity, 0.7);
        indicators.push('values-language');
        break;
      }
    }

    // Common ACT values (extract when mentioned)
    const valueWords = [
      'love', 'connection', 'authenticity', 'courage', 'growth', 'compassion',
      'creativity', 'contribution', 'family', 'friendship', 'health', 'integrity',
      'learning', 'service', 'freedom', 'justice', 'beauty', 'adventure'
    ];

    for (const value of valueWords) {
      const regex = new RegExp(`\\b${value}\\b`, 'i');
      if (regex.test(text) && /\b(value|important|matter|care about)\b/i.test(text)) {
        identifiedValues.push(value);
        clarity = Math.max(clarity, 0.8);
        indicators.push(`value-identified:${value}`);
      }
    }

    // Values confusion
    if (/don't know what (matters|i care about|i stand for|my purpose is)/i.test(text)) {
      clarity = Math.min(clarity, 0.2);
      indicators.push('values-confusion');
    }

    return { detected, clarity, identifiedValues, indicators };
  }

  /**
   * PROCESS 6: Committed Action
   */
  private detectCommittedAction(text: string): ACTState['hexaflex']['committedAction'] {
    let detected = false;
    let level = 0.5;
    let valueAligned = false;
    const indicators: string[] = [];

    // Committed action language
    const actionPatterns = [
      /\b(i (will|am going to|plan to|commit to)|taking action|moving toward)\b/i,
      /even though.*\b(i'm|i am|i will) (doing|going|acting)/i,
      /despite.*\b(i (did|will|am))\b/i,
      /\b(step|move|act) (toward|in the direction of)\b/i
    ];

    for (const pattern of actionPatterns) {
      if (pattern.test(text)) {
        detected = true;
        level = Math.max(level, 0.7);
        indicators.push('committed-action-language');
        break;
      }
    }

    // Acting despite discomfort (classic ACT)
    if (/even though (i'm|it's|the) (scared|uncomfortable|anxious|hard).*\b(i (did|will|am))/i.test(text)) {
      detected = true;
      level = Math.max(level, 0.9);
      indicators.push('action-despite-discomfort');
    }

    // Values-aligned action
    if (/because (it matters|i value|it's important)/i.test(text)) {
      valueAligned = true;
      indicators.push('value-aligned-action');
    }

    // Inaction/avoidance
    const inactionPatterns = [
      /\b(stuck|can't move|frozen|paralyzed|not doing anything)\b/i,
      /\b(avoiding|procrastinat|putting off)\b/i,
      /know what to do but (can't|won't|not doing)/i
    ];

    for (const pattern of inactionPatterns) {
      if (pattern.test(text)) {
        level = Math.min(level, 0.3);
        indicators.push('inaction-detected');
        break;
      }
    }

    return { detected, level, valueAligned, indicators };
  }

  /**
   * Detect Experiential Avoidance (core ACT pathology)
   */
  private detectExperientialAvoidance(text: string): ACTState['experientialAvoidance'] {
    let detected = false;
    const patterns: string[] = [];
    const strategies: string[] = [];
    let cost = '';
    let confidence = 0;

    // What they're avoiding
    const avoidanceTargets = [
      { pattern: /avoid(ing)? (the|my|this) (feeling|emotion|pain|fear|anxiety|grief)/i, target: 'painful feelings' },
      { pattern: /don't want to (feel|think about|remember)/i, target: 'unwanted experiences' },
      { pattern: /can't (handle|take|deal with|stand) (the|this|my)/i, target: 'overwhelming experiences' },
      { pattern: /need (it|this|the) to (stop|go away)/i, target: 'discomfort' }
    ];

    for (const { pattern, target } of avoidanceTargets) {
      if (pattern.test(text)) {
        detected = true;
        patterns.push(target);
        confidence = Math.max(confidence, 0.7);
        break;
      }
    }

    // HOW they're avoiding (strategies)
    const avoidanceStrategies = [
      { pattern: /\b(numb|numbing|shut down|disconnect)\b/i, strategy: 'emotional numbing' },
      { pattern: /\b(distract|keep busy|stay busy)\b/i, strategy: 'distraction/busyness' },
      { pattern: /\b(drink|alcohol|substance|drug|weed)\b/i, strategy: 'substance use' },
      { pattern: /\b(sleep|sleeping) (all|too much|to escape)/i, strategy: 'oversleeping' },
      { pattern: /\b(scroll|phone|social media|screen|netflix)\b/i, strategy: 'digital escape' }
    ];

    for (const { pattern, strategy } of avoidanceStrategies) {
      if (pattern.test(text)) {
        strategies.push(strategy);
        confidence = Math.max(confidence, 0.8);
      }
    }

    // What it costs them
    if (/but (it's|i'm) (costing|losing|missing|sacrificing)/i.test(text)) {
      const costMatch = text.match(/(costing|losing|missing|sacrificing)\s+([^.!?]+)/i);
      cost = costMatch ? costMatch[1] : 'vitality and connection';
      confidence = Math.max(confidence, 0.9);
    }

    return {
      detected,
      patterns,
      strategies,
      cost,
      confidence
    };
  }

  /**
   * Detect Cognitive Fusion
   */
  private detectCognitiveFusion(text: string): ACTState['cognitiveFusion'] {
    let detected = false;
    const fusedBeliefs: string[] = [];
    let literality = 0.5;
    let confidence = 0;

    // Fusion with self-concept
    const selfFusionPatterns = [
      /\b(i am|i'm) (broken|worthless|unlovable|a failure|damaged|bad|wrong)\b/i,
      /\b(i've always been|i'll always be|i'm just) (a|an)/i,
      /that's (who|what) i am/i
    ];

    for (const pattern of selfFusionPatterns) {
      const match = text.match(pattern);
      if (match) {
        detected = true;
        fusedBeliefs.push(match[0]);
        literality = Math.max(literality, 0.8);
        confidence = 0.8;
      }
    }

    // Fusion with predictions
    if (/\b(will|going to|definitely|certainly) (fail|mess up|be rejected|be alone)\b/i.test(text)) {
      detected = true;
      fusedBeliefs.push('fused with catastrophic predictions');
      literality = Math.max(literality, 0.7);
      confidence = Math.max(confidence, 0.7);
    }

    // Absolute language (sign of fusion)
    const absoluteCount = (text.match(/\b(always|never|everyone|nobody|every time)\b/gi) || []).length;
    if (absoluteCount >= 2) {
      detected = true;
      literality = Math.max(literality, 0.7);
      confidence = Math.max(confidence, 0.6);
    }

    return {
      detected,
      fusedBeliefs,
      literality,
      confidence
    };
  }

  /**
   * Calculate overall psychological flexibility
   */
  private calculatePsychologicalFlexibility(
    acceptance: ACTState['hexaflex']['acceptance'],
    cognitiveDefusion: ACTState['hexaflex']['cognitiveDefusion'],
    presentMoment: ACTState['hexaflex']['presentMoment'],
    selfAsContext: ACTState['hexaflex']['selfAsContext'],
    values: ACTState['hexaflex']['values'],
    committedAction: ACTState['hexaflex']['committedAction']
  ): number {
    // Average of all six hexaflex processes
    const sum =
      acceptance.level +
      cognitiveDefusion.level +
      presentMoment.level +
      selfAsContext.level +
      values.clarity +
      committedAction.level;

    return sum / 6;
  }

  /**
   * Detect values-action gap
   */
  private detectValuesActionGap(
    values: ACTState['hexaflex']['values'],
    committedAction: ACTState['hexaflex']['committedAction']
  ): ACTState['valuesActionGap'] {
    const gapDetected = values.clarity > 0.6 && committedAction.level < 0.4;
    const gapSize = gapDetected ? values.clarity - committedAction.level : 0;
    const description = gapDetected
      ? 'Values are clear but not being lived (knowing-doing gap)'
      : 'Values and actions appear aligned';

    return {
      gapDetected,
      description,
      gapSize
    };
  }

  /**
   * Calculate elemental resonance
   */
  private calculateElementalResonance(
    values: ACTState['hexaflex']['values'],
    committedAction: ACTState['hexaflex']['committedAction'],
    cognitiveDefusion: ACTState['hexaflex']['cognitiveDefusion'],
    presentMoment: ACTState['hexaflex']['presentMoment']
  ): ACTState['elementalResonance'] {
    // FIRE = values clarity + committed action
    const fire = (values.clarity + committedAction.level) / 2;

    // AIR = cognitive defusion + present moment awareness
    const air = (cognitiveDefusion.level + presentMoment.level) / 2;

    return { fire, air };
  }
}

// Singleton instance
export const actEngine = new ACTEngine();
