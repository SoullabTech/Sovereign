/**
 * EMDR (EYE MOVEMENT DESENSITIZATION & REPROCESSING) ENGINE
 *
 * Based on Francine Shapiro's EMDR
 *
 * Detects:
 * - Unprocessed traumatic memories
 * - SUDS level (Subjective Units of Disturbance Scale 0-10)
 * - VOC level (Validity of Cognition 1-7)
 * - Negative cognitions (NC) vs Positive cognitions (PC)
 * - Body sensations associated with trauma
 * - Processing signs (integration happening)
 *
 * Elemental Resonance: WATER (flow, processing) + FIRE (discharge, transformation)
 */

export interface EMDRState {
  detected: boolean;
  confidence: number;
  indicators: string[];

  // Traumatic memory indicators
  traumaMemory: {
    detected: boolean;
    type: 'visual' | 'somatic' | 'emotional' | 'mixed';
    intrusive: boolean; // Intrusive vs recalled
    vividness: number; // 0-1
    indicators: string[];
  };

  // SUDS Level (0-10 disturbance)
  SUDS: {
    estimated: number; // 0-10
    confidence: number;
    indicators: string[];
  };

  // Negative Cognition (NC)
  negativeCognition: {
    detected: boolean;
    cognitions: string[]; // e.g., "I'm not safe", "I'm powerless"
    believability: number; // 0-1
    indicators: string[];
  };

  // Positive Cognition (PC) - desired belief
  positiveCognition: {
    detected: boolean;
    cognitions: string[];
    indicators: string[];
  };

  // VOC (Validity of Cognition for PC: 1-7)
  VOC: {
    estimated: number; // 1-7 (1 = completely false, 7 = completely true)
    confidence: number;
  };

  // Body Sensations (where trauma is held)
  bodySensations: {
    detected: boolean;
    locations: string[]; // chest, throat, stomach, etc.
    quality: string[]; // tight, heavy, hot, etc.
    indicators: string[];
  };

  // Processing Indicators (EMDR reprocessing happening)
  processing: {
    detected: boolean;
    signs: string[]; // shifts, insights, releases
    phase: 'activation' | 'processing' | 'integration' | 'none';
    indicators: string[];
  };

  // Elemental resonance
  elementalResonance: {
    water: number; // Flow, bilateral processing, memory integration
    fire: number; // Discharge, transformation of stuck energy
  };
}

export class EMDREngine {
  extract(text: string): EMDRState {
    const lower = text.toLowerCase();
    const indicators: string[] = [];

    const traumaMemory = this.detectTraumaMemory(lower);
    const SUDS = this.estimateSUDS(lower);
    const negativeCognition = this.detectNegativeCognition(lower);
    const positiveCognition = this.detectPositiveCognition(lower);
    const VOC = this.estimateVOC(lower, positiveCognition);
    const bodySensations = this.detectBodySensations(lower);
    const processing = this.detectProcessing(lower);

    const elementalResonance = this.calculateElementalResonance(processing, traumaMemory);

    if (traumaMemory.detected) indicators.push(...traumaMemory.indicators);
    if (negativeCognition.detected) indicators.push(...negativeCognition.indicators);
    if (bodySensations.detected) indicators.push(...bodySensations.indicators);
    if (processing.detected) indicators.push(...processing.indicators);

    const detected = indicators.length > 0;
    const confidence = detected ? 0.7 : 0;

    return {
      detected,
      confidence,
      indicators,
      traumaMemory,
      SUDS,
      negativeCognition,
      positiveCognition,
      VOC,
      bodySensations,
      processing,
      elementalResonance
    };
  }

  private detectTraumaMemory(text: string): EMDRState['traumaMemory'] {
    let detected = false;
    let type: 'visual' | 'somatic' | 'emotional' | 'mixed' = 'mixed';
    let intrusive = false;
    let vividness = 0.5;
    const indicators: string[] = [];

    // Visual memory
    if (/\b(see|seeing|image|picture|flash|replay)\b/i.test(text)) {
      detected = true;
      type = 'visual';
      indicators.push('visual-memory');
    }

    // Somatic memory
    if (/\b(body (remembers|holds)|feel it in my|stored in)\b/i.test(text)) {
      detected = true;
      type = 'somatic';
      indicators.push('somatic-memory');
    }

    // Intrusive
    if (/\b(keeps coming back|can't stop|intrusive|haunts|won't leave)\b/i.test(text)) {
      intrusive = true;
      vividness = 0.9;
      indicators.push('intrusive-memory');
    }

    // Vividness
    if (/\b(vivid|clear|like it's happening now|right there)\b/i.test(text)) {
      vividness = 0.9;
    }

    return { detected, type, intrusive, vividness, indicators };
  }

  private estimateSUDS(text: string): EMDRState['SUDS'] {
    let estimated = 5;
    let confidence = 0.5;
    const indicators: string[] = [];

    // Explicit SUDS
    const sudsMatch = text.match(/\b(suds|disturbance|distress).{0,20}(\d|10)/i);
    if (sudsMatch) {
      estimated = parseInt(sudsMatch[2]);
      confidence = 0.9;
      indicators.push('explicit-SUDS');
    }
    // Infer from intensity language
    else if (/\b(unbearable|excruciating|overwhelming|crushing)\b/i.test(text)) {
      estimated = 9;
      confidence = 0.7;
    }
    else if (/\b(intense|strong|severe|really bad)\b/i.test(text)) {
      estimated = 7;
      confidence = 0.6;
    }
    else if (/\b(moderate|some|okay|manageable)\b/i.test(text)) {
      estimated = 4;
      confidence = 0.6;
    }
    else if (/\b(mild|slight|little|barely)\b/i.test(text)) {
      estimated = 2;
      confidence = 0.6;
    }

    return { estimated, confidence, indicators };
  }

  private detectNegativeCognition(text: string): EMDRState['negativeCognition'] {
    let detected = false;
    const cognitions: string[] = [];
    let believability = 0.5;
    const indicators: string[] = [];

    const commonNCs = [
      { pattern: /\b(i'm|i am) not safe\b/i, cognition: "I'm not safe" },
      { pattern: /\b(i'm|i am) (powerless|helpless)\b/i, cognition: "I'm powerless" },
      { pattern: /\b(i'm|i am) not (good enough|worthy)\b/i, cognition: "I'm not good enough" },
      { pattern: /\b(i'm|i am) (bad|wrong|defective)\b/i, cognition: "I'm defective/bad" },
      { pattern: /\b(i can't|i cannot) trust\b/i, cognition: "I can't trust anyone" },
      { pattern: /\b(i'm|i am) in danger\b/i, cognition: "I'm in danger" },
      { pattern: /\b(it's|it is) my fault\b/i, cognition: "It's my fault" },
      { pattern: /\b(i'm|i am) worthless\b/i, cognition: "I'm worthless" }
    ];

    for (const { pattern, cognition } of commonNCs) {
      if (pattern.test(text)) {
        detected = true;
        cognitions.push(cognition);
        believability = 0.8;
        indicators.push('negative-cognition');
      }
    }

    return { detected, cognitions, believability, indicators };
  }

  private detectPositiveCognition(text: string): EMDRState['positiveCognition'] {
    let detected = false;
    const cognitions: string[] = [];
    const indicators: string[] = [];

    const commonPCs = [
      { pattern: /\b(i am|i'm) safe (now)?\b/i, cognition: "I am safe now" },
      { pattern: /\b(i have|i've got) power\b/i, cognition: "I have power/control" },
      { pattern: /\b(i am|i'm) (good enough|worthy)\b/i, cognition: "I am good enough" },
      { pattern: /\b(i can|i am able to) trust\b/i, cognition: "I can trust (wisely)" },
      { pattern: /\b(i did|it was) the best (i|we) could\b/i, cognition: "I did the best I could" }
    ];

    for (const { pattern, cognition } of commonPCs) {
      if (pattern.test(text)) {
        detected = true;
        cognitions.push(cognition);
        indicators.push('positive-cognition');
      }
    }

    return { detected, cognitions, indicators };
  }

  private estimateVOC(text: string, pc: EMDRState['positiveCognition']): EMDRState['VOC'] {
    let estimated = 3;
    let confidence = 0.5;

    if (!pc.detected) return { estimated: 1, confidence: 0 };

    // Explicit VOC
    const vocMatch = text.match(/\b(voc|validity|how true).{0,20}([1-7])/i);
    if (vocMatch) {
      estimated = parseInt(vocMatch[2]);
      confidence = 0.9;
    }
    // Infer from language
    else if (/\b(completely|totally|absolutely) true\b/i.test(text)) {
      estimated = 7;
      confidence = 0.7;
    }
    else if (/\b(mostly|pretty) true\b/i.test(text)) {
      estimated = 5;
      confidence = 0.6;
    }
    else if (/\b(starting to|beginning to) (feel|believe)\b/i.test(text)) {
      estimated = 3;
      confidence = 0.6;
    }

    return { estimated, confidence };
  }

  private detectBodySensations(text: string): EMDRState['bodySensations'] {
    let detected = false;
    const locations: string[] = [];
    const quality: string[] = [];
    const indicators: string[] = [];

    const bodyParts = ['chest', 'throat', 'stomach', 'shoulders', 'jaw', 'heart', 'gut', 'neck', 'back'];
    for (const part of bodyParts) {
      if (new RegExp(`\\b${part}\\b`, 'i').test(text)) {
        locations.push(part);
        detected = true;
      }
    }

    const sensations = ['tight', 'heavy', 'hot', 'cold', 'pressure', 'numb', 'tingle', 'ache'];
    for (const sensation of sensations) {
      if (new RegExp(`\\b${sensation}\\b`, 'i').test(text)) {
        quality.push(sensation);
        detected = true;
      }
    }

    if (detected) indicators.push('body-sensations');

    return { detected, locations, quality, indicators };
  }

  private detectProcessing(text: string): EMDRState['processing'] {
    let detected = false;
    const signs: string[] = [];
    let phase: 'activation' | 'processing' | 'integration' | 'none' = 'none';
    const indicators: string[] = [];

    // Processing signs
    if (/\b(shift|shifting|changing|moving|release|releasing)\b/i.test(text)) {
      detected = true;
      signs.push('shifting/releasing');
      phase = 'processing';
      indicators.push('processing-active');
    }

    if (/\b(insight|realize|understand|see now|makes sense)\b/i.test(text)) {
      detected = true;
      signs.push('insight emerging');
      phase = 'integration';
      indicators.push('integration-phase');
    }

    if (/\b(lighter|clearer|softer|less)\b/i.test(text)) {
      detected = true;
      signs.push('intensity decreasing');
      phase = 'integration';
    }

    return { detected, signs, phase, indicators };
  }

  private calculateElementalResonance(
    processing: EMDRState['processing'],
    traumaMemory: EMDRState['traumaMemory']
  ): EMDRState['elementalResonance'] {
    const water = processing.detected ? 0.8 : (traumaMemory.detected ? 0.5 : 0.3);
    const fire = processing.phase === 'processing' ? 0.8 : 0.4;
    return { water, fire };
  }
}

export const emdrEngine = new EMDREngine();
