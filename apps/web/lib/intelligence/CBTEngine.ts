/**
 * CBT (COGNITIVE BEHAVIORAL THERAPY) ENGINE - Third Wave
 *
 * Based on Aaron Beck's CBT + Third Wave (Metacognitive, Exposure-based)
 *
 * Detects:
 * - Cognitive distortions (10 common types)
 * - Automatic thoughts vs rational responses
 * - Thought-feeling-behavior links
 * - Metacognitive awareness (thoughts about thoughts)
 * - Exposure engagement
 *
 * Elemental Resonance: AIR (thought, cognition) + EARTH (behavioral change, reality-testing)
 */

export interface CBTState {
  detected: boolean;
  confidence: number;
  indicators: string[];

  // Cognitive Distortions (10 classic types)
  cognitiveDistortions: {
    allOrNothing: boolean; // Black-and-white thinking
    overgeneralization: boolean; // One event = always
    mentalFilter: boolean; // Focus only on negative
    discountingPositive: boolean; // Positive doesn't count
    jumpingToConclusions: boolean; // Mind reading, fortune telling
    magnification: boolean; // Blowing things out of proportion
    emotionalReasoning: boolean; // "I feel it, so it's true"
    shouldStatements: boolean; // Rigid should/must
    labeling: boolean; // "I'm a failure" (vs "I failed")
    personalization: boolean; // Everything is my fault
  };

  // Automatic Thoughts
  automaticThoughts: {
    detected: boolean;
    thoughts: string[]; // Captured automatic thoughts
    emotionalIntensity: number; // 0-1
    indicators: string[];
  };

  // Rational Responses (cognitive restructuring)
  rationalResponses: {
    detected: boolean;
    restructuring: boolean; // Actively challenging thoughts
    evidence: boolean; // Looking for evidence
    indicators: string[];
  };

  // Thought-Feeling-Behavior Triangle
  triangleAwareness: {
    thoughtsIdentified: boolean;
    feelingsIdentified: boolean;
    behaviorsIdentified: boolean;
    linksRecognized: boolean; // Seeing connections
  };

  // Metacognitive Awareness (Third Wave)
  metacognition: {
    detected: boolean;
    level: number; // 0-1 (awareness of thought processes)
    decentering: boolean; // Seeing thoughts as events, not truth
    indicators: string[];
  };

  // Exposure (behavioral component)
  exposure: {
    detected: boolean;
    engaging: boolean; // Actually doing exposure
    type: 'in-vivo' | 'imaginal' | 'interoceptive' | 'none';
    indicators: string[];
  };

  // Elemental resonance
  elementalResonance: {
    air: number; // Cognitive work, metacognition
    earth: number; // Behavioral change, reality-testing
  };
}

export class CBTEngine {
  extract(text: string): CBTState {
    const lower = text.toLowerCase();
    const indicators: string[] = [];

    const cognitiveDistortions = this.detectCognitiveDistortions(lower);
    const automaticThoughts = this.detectAutomaticThoughts(lower);
    const rationalResponses = this.detectRationalResponses(lower);
    const triangleAwareness = this.detectTriangleAwareness(lower);
    const metacognition = this.detectMetacognition(lower);
    const exposure = this.detectExposure(lower);

    const elementalResonance = this.calculateElementalResonance(metacognition, exposure);

    Object.entries(cognitiveDistortions).forEach(([key, value]) => {
      if (value) indicators.push(`distortion-${key}`);
    });
    if (automaticThoughts.detected) indicators.push(...automaticThoughts.indicators);
    if (metacognition.detected) indicators.push(...metacognition.indicators);

    const detected = indicators.length > 0;
    const confidence = detected ? 0.7 : 0;

    return {
      detected,
      confidence,
      indicators,
      cognitiveDistortions,
      automaticThoughts,
      rationalResponses,
      triangleAwareness,
      metacognition,
      exposure,
      elementalResonance
    };
  }

  private detectCognitiveDistortions(text: string): CBTState['cognitiveDistortions'] {
    return {
      allOrNothing: /\b(always|never|completely|totally|all or nothing)\b/i.test(text),
      overgeneralization: /\b(always (happens|fails)|never works|every time)\b/i.test(text),
      mentalFilter: /\b(only (see|focus on)|can't see (anything|the) (good|positive))\b/i.test(text),
      discountingPositive: /\b(doesn't count|doesn't matter|not real|just luck)\b/i.test(text),
      jumpingToConclusions: /\b(they (think|know)|will definitely|going to (fail|happen))\b/i.test(text),
      magnification: /\b(catastrophe|disaster|terrible|awful|end of the world)\b/i.test(text),
      emotionalReasoning: /\b(i feel.*so (it|this) must be|feels true)\b/i.test(text),
      shouldStatements: /\b(should|must|have to|ought to|supposed to)\b/i.test(text),
      labeling: /\b(i'm (a|an) (failure|loser|idiot))\b/i.test(text),
      personalization: /\b(my fault|because of me|i caused)\b/i.test(text)
    };
  }

  private detectAutomaticThoughts(text: string): CBTState['automaticThoughts'] {
    let detected = false;
    const thoughts: string[] = [];
    let emotionalIntensity = 0.5;
    const indicators: string[] = [];

    // Look for thought markers
    if (/\b(thought|thinking|told myself|my mind said)\b/i.test(text)) {
      detected = true;
      indicators.push('automatic-thought');
    }

    // Capture "I am..." statements (often automatic thoughts)
    const iAmPattern = /\b(i'm|i am) (a |an |the )?(failure|worthless|stupid|broken|bad|wrong)/gi;
    const matches = text.match(iAmPattern);
    if (matches) {
      detected = true;
      thoughts.push(...matches);
      emotionalIntensity = 0.8;
    }

    return { detected, thoughts, emotionalIntensity, indicators };
  }

  private detectRationalResponses(text: string): CBTState['rationalResponses'] {
    let detected = false;
    let restructuring = false;
    let evidence = false;
    const indicators: string[] = [];

    // Restructuring
    if (/\b(but (maybe|actually|also)|on the other hand|alternatively)\b/i.test(text)) {
      detected = true;
      restructuring = true;
      indicators.push('cognitive-restructuring');
    }

    // Evidence seeking
    if (/\b(evidence|proof|is (it|that) (really )?true|what's the (evidence|proof))\b/i.test(text)) {
      detected = true;
      evidence = true;
      indicators.push('evidence-seeking');
    }

    return { detected, restructuring, evidence, indicators };
  }

  private detectTriangleAwareness(text: string): CBTState['triangleAwareness'] {
    const thoughtsIdentified = /\b(thought|think|believe)\b/i.test(text);
    const feelingsIdentified = /\b(feel|feeling|emotion)\b/i.test(text);
    const behaviorsIdentified = /\b(did|do|action|behavio(u)?r)\b/i.test(text);
    const linksRecognized = /\b(because|so (then|i)|led to|caused|made me)\b/i.test(text) &&
                           (thoughtsIdentified || feelingsIdentified || behaviorsIdentified);

    return { thoughtsIdentified, feelingsIdentified, behaviorsIdentified, linksRecognized };
  }

  private detectMetacognition(text: string): CBTState['metacognition'] {
    let detected = false;
    let level = 0.5;
    let decentering = false;
    const indicators: string[] = [];

    // Metacognitive awareness (thinking about thinking)
    if (/\b(notice|noticing) (my|the) (thought|thinking)\b/i.test(text)) {
      detected = true;
      level = 0.7;
      indicators.push('metacognitive-awareness');
    }

    // Decentering (thoughts as events, not truth)
    if (/\b((it's )?just a thought|thought is not (a )?fact|having a thought)\b/i.test(text)) {
      detected = true;
      decentering = true;
      level = 0.9;
      indicators.push('decentering');
    }

    return { detected, level, decentering, indicators };
  }

  private detectExposure(text: string): CBTState['exposure'] {
    let detected = false;
    let engaging = false;
    let type: 'in-vivo' | 'imaginal' | 'interoceptive' | 'none' = 'none';
    const indicators: string[] = [];

    // In-vivo exposure (real-life)
    if (/\b(facing|confront|approach|do (it|the thing)|exposure)\b/i.test(text)) {
      detected = true;
      engaging = true;
      type = 'in-vivo';
      indicators.push('exposure-therapy');
    }

    // Imaginal exposure
    if (/\b(imagine|imagining|picture|visualize).{0,20}(fear|scary|anxious)\b/i.test(text)) {
      detected = true;
      type = 'imaginal';
    }

    // Interoceptive exposure (body sensations)
    if (/\b(bring on|induce|create).{0,20}(sensation|symptom|panic)\b/i.test(text)) {
      detected = true;
      type = 'interoceptive';
    }

    return { detected, engaging, type, indicators };
  }

  private calculateElementalResonance(
    metacognition: CBTState['metacognition'],
    exposure: CBTState['exposure']
  ): CBTState['elementalResonance'] {
    const air = metacognition.level;
    const earth = exposure.engaging ? 0.8 : 0.4;
    return { air, earth };
  }
}

export const cbtEngine = new CBTEngine();
