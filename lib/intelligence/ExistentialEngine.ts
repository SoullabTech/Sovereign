/**
 * EXISTENTIAL THERAPY ENGINE
 *
 * Based on Viktor Frankl (Logotherapy), Irvin Yalom, Rollo May
 *
 * Detects:
 * - Existential givens (death, freedom, isolation, meaninglessness)
 * - Meaning-making capacity
 * - Existential anxiety vs neurotic anxiety
 * - Authenticity vs inauthenticity
 * - Choice and responsibility
 *
 * Elemental Resonance: AETHER (meaning, spirit) + FIRE (freedom, will)
 */

export interface ExistentialState {
  detected: boolean;
  confidence: number;
  indicators: string[];

  // The 4 Existential Givens (Yalom)
  existentialGivens: {
    // 1. Death (mortality awareness)
    death: {
      detected: boolean;
      awareness: number; // 0-1 (death anxiety vs death acceptance)
      indicators: string[];
    };

    // 2. Freedom (existential freedom = responsibility)
    freedom: {
      detected: boolean;
      level: number; // 0-1 (awareness of freedom/choice)
      anxietyPresent: boolean; // Freedom anxiety
      indicators: string[];
    };

    // 3. Isolation (ultimate aloneness)
    isolation: {
      detected: boolean;
      type: 'interpersonal' | 'intrapersonal' | 'existential';
      bearing: number; // 0-1 (capacity to bear aloneness)
      indicators: string[];
    };

    // 4. Meaninglessness (responsibility to create meaning)
    meaninglessness: {
      detected: boolean;
      despair: boolean; // Existential despair
      searchActive: boolean; // Actively searching for meaning
      indicators: string[];
    };
  };

  // Meaning-Making (Frankl's core)
  meaning: {
    detected: boolean;
    sources: string[]; // What gives meaning: love, work, suffering, creation
    clarity: number; // 0-1 (meaning clarity)
    logotherapyNeeds: boolean; // Need help finding meaning
    indicators: string[];
  };

  // Authenticity vs Inauthenticity
  authenticity: {
    authentic: boolean;
    inauthentic: boolean;
    description: string;
    indicators: string[];
  };

  // Existential Anxiety (vs Neurotic Anxiety)
  anxiety: {
    type: 'existential' | 'neurotic' | 'mixed' | 'none';
    description: string;
    indicators: string[];
  };

  // Choice & Responsibility
  choiceResponsibility: {
    awarenessOfChoice: boolean;
    acceptingResponsibility: boolean;
    avoidingResponsibility: boolean;
    indicators: string[];
  };

  // Elemental resonance
  elementalResonance: {
    aether: number; // Meaning, spirit, transcendence
    fire: number; // Freedom, will, purpose
  };
}

export class ExistentialEngine {
  extract(text: string): ExistentialState {
    const lower = text.toLowerCase();
    const indicators: string[] = [];

    const existentialGivens = this.detectExistentialGivens(lower);
    const meaning = this.detectMeaning(lower);
    const authenticity = this.detectAuthenticity(lower);
    const anxiety = this.detectAnxietyType(lower);
    const choiceResponsibility = this.detectChoiceResponsibility(lower);

    const elementalResonance = this.calculateElementalResonance(meaning, choiceResponsibility);

    if (existentialGivens.death.detected) indicators.push(...existentialGivens.death.indicators);
    if (existentialGivens.freedom.detected) indicators.push(...existentialGivens.freedom.indicators);
    if (existentialGivens.isolation.detected) indicators.push(...existentialGivens.isolation.indicators);
    if (existentialGivens.meaninglessness.detected) indicators.push(...existentialGivens.meaninglessness.indicators);
    if (meaning.detected) indicators.push(...meaning.indicators);
    if (authenticity.authentic || authenticity.inauthentic) indicators.push(...authenticity.indicators);

    const detected = indicators.length > 0;
    const confidence = detected ? 0.75 : 0;

    return {
      detected,
      confidence,
      indicators,
      existentialGivens,
      meaning,
      authenticity,
      anxiety,
      choiceResponsibility,
      elementalResonance
    };
  }

  private detectExistentialGivens(text: string): ExistentialState['existentialGivens'] {
    return {
      death: this.detectDeath(text),
      freedom: this.detectFreedom(text),
      isolation: this.detectIsolation(text),
      meaninglessness: this.detectMeaninglessness(text)
    };
  }

  private detectDeath(text: string): ExistentialState['existentialGivens']['death'] {
    let detected = false;
    let awareness = 0.5;
    const indicators: string[] = [];

    if (/\b(death|dying|mortality|finite|time (running out|limited))\b/i.test(text)) {
      detected = true;
      awareness = 0.7;
      indicators.push('death-awareness');
    }

    if (/\b(afraid (of|to) die|terrified of death|death anxiety)\b/i.test(text)) {
      awareness = 0.3;
      indicators.push('death-anxiety');
    }

    if (/\b(accept|accepting|peace with) (death|mortality|dying)\b/i.test(text)) {
      awareness = 0.9;
      indicators.push('death-acceptance');
    }

    return { detected, awareness, indicators };
  }

  private detectFreedom(text: string): ExistentialState['existentialGivens']['freedom'] {
    let detected = false;
    let level = 0.5;
    let anxietyPresent = false;
    const indicators: string[] = [];

    if (/\b(freedom|free|choice|choose|agency)\b/i.test(text)) {
      detected = true;
      level = 0.7;
      indicators.push('freedom-awareness');
    }

    if (/\b(too many choices|paralyzed by|burden of freedom|terrifying to choose)\b/i.test(text)) {
      anxietyPresent = true;
      indicators.push('freedom-anxiety');
    }

    if (/\b(i choose|i'm choosing|taking responsibility|my choice)\b/i.test(text)) {
      level = 0.9;
      indicators.push('freedom-embraced');
    }

    return { detected, level, anxietyPresent, indicators };
  }

  private detectIsolation(text: string): ExistentialState['existentialGivens']['isolation'] {
    let detected = false;
    let type: 'interpersonal' | 'intrapersonal' | 'existential' = 'interpersonal';
    let bearing = 0.5;
    const indicators: string[] = [];

    // Interpersonal isolation (loneliness)
    if (/\b(lonely|alone|isolated|no one)\b/i.test(text)) {
      detected = true;
      type = 'interpersonal';
      indicators.push('interpersonal-isolation');
    }

    // Existential isolation (ultimate aloneness)
    if (/\b(ultimately alone|can't truly (know|reach)|separate|unbridgeable)\b/i.test(text)) {
      detected = true;
      type = 'existential';
      bearing = 0.6;
      indicators.push('existential-isolation');
    }

    // Bearing isolation
    if (/\b(bear|bearing|tolerate|accept).{0,20}alone/i.test(text)) {
      bearing = 0.8;
    }

    return { detected, type, bearing, indicators };
  }

  private detectMeaninglessness(text: string): ExistentialState['existentialGivens']['meaninglessness'] {
    let detected = false;
    let despair = false;
    let searchActive = false;
    const indicators: string[] = [];

    if (/\b(meaningless|no meaning|no purpose|pointless|what's the point)\b/i.test(text)) {
      detected = true;
      despair = true;
      indicators.push('meaninglessness-despair');
    }

    if (/\b(searching for|looking for|trying to find) (meaning|purpose)\b/i.test(text)) {
      detected = true;
      searchActive = true;
      despair = false;
      indicators.push('meaning-search-active');
    }

    return { detected, despair, searchActive, indicators };
  }

  private detectMeaning(text: string): ExistentialState['meaning'] {
    let detected = false;
    const sources: string[] = [];
    let clarity = 0.5;
    let logotherapyNeeds = false;
    const indicators: string[] = [];

    // Meaning sources
    const meaningSources = [
      { pattern: /\b(love|loving|connection|relationship)\b/i, source: 'love' },
      { pattern: /\b(work|create|contribution|service)\b/i, source: 'creative work' },
      { pattern: /\b(learn|learning|growth|understanding)\b/i, source: 'experiential meaning' },
      { pattern: /\b(suffering|pain).{0,20}(meaning|purpose|transform)\b/i, source: 'attitudinal meaning (suffering)' }
    ];

    for (const { pattern, source } of meaningSources) {
      if (pattern.test(text)) {
        detected = true;
        sources.push(source);
        clarity = 0.7;
        indicators.push('meaning-source-identified');
      }
    }

    if (/\b(my (purpose|why|meaning) is|life is about)\b/i.test(text)) {
      clarity = 0.9;
      indicators.push('meaning-clarity');
    }

    if (/\b(don't know (why|what for)|no purpose|what's the point)\b/i.test(text)) {
      logotherapyNeeds = true;
      clarity = 0.2;
      indicators.push('logotherapy-indicated');
    }

    return { detected, sources, clarity, logotherapyNeeds, indicators };
  }

  private detectAuthenticity(text: string): ExistentialState['authenticity'] {
    let authentic = false;
    let inauthentic = false;
    let description = '';
    const indicators: string[] = [];

    // Authentic living
    if (/\b(authentic|true to myself|real|genuine|honest)\b/i.test(text)) {
      authentic = true;
      description = 'Living authentically, true to self';
      indicators.push('authenticity');
    }

    // Inauthentic living (bad faith)
    if (/\b(pretend|fake|mask|hide who i am|not myself)\b/i.test(text)) {
      inauthentic = true;
      description = 'Living inauthentically (bad faith), hiding true self';
      indicators.push('inauthenticity');
    }

    return { authentic, inauthentic, description, indicators };
  }

  private detectAnxietyType(text: string): ExistentialState['anxiety'] {
    let type: 'existential' | 'neurotic' | 'mixed' | 'none' = 'none';
    let description = '';
    const indicators: string[] = [];

    const hasAnxiety = /\b(anxious|anxiety|worried|worry|afraid)\b/i.test(text);
    if (!hasAnxiety) return { type: 'none', description: 'No anxiety detected', indicators };

    // Existential anxiety (about death, freedom, meaninglessness)
    const existentialAnxiety = /\b(death|mortality|meaning|purpose|freedom|choice)\b/i.test(text);

    // Neurotic anxiety (specific fears, avoidance)
    const neuroticAnxiety = /\b(what if|afraid of|specific|avoid|escape)\b/i.test(text);

    if (existentialAnxiety && neuroticAnxiety) {
      type = 'mixed';
      description = 'Mixed existential and neurotic anxiety';
    } else if (existentialAnxiety) {
      type = 'existential';
      description = 'Existential anxiety (about core human conditions)';
      indicators.push('existential-anxiety');
    } else if (neuroticAnxiety) {
      type = 'neurotic';
      description = 'Neurotic anxiety (specific fears)';
    }

    return { type, description, indicators };
  }

  private detectChoiceResponsibility(text: string): ExistentialState['choiceResponsibility'] {
    const awarenessOfChoice = /\b(i (can|could) choose|have a choice|choice is mine)\b/i.test(text);
    const acceptingResponsibility = /\b(my (responsibility|choice)|i'm responsible|take responsibility)\b/i.test(text);
    const avoidingResponsibility = /\b(no choice|have to|forced to|not my fault)\b/i.test(text);
    const indicators: string[] = [];

    if (awarenessOfChoice) indicators.push('awareness-of-choice');
    if (acceptingResponsibility) indicators.push('accepting-responsibility');
    if (avoidingResponsibility) indicators.push('avoiding-responsibility');

    return { awarenessOfChoice, acceptingResponsibility, avoidingResponsibility, indicators };
  }

  private calculateElementalResonance(
    meaning: ExistentialState['meaning'],
    choice: ExistentialState['choiceResponsibility']
  ): ExistentialState['elementalResonance'] {
    const aether = meaning.clarity;
    const fire = choice.acceptingResponsibility ? 0.8 : 0.4;
    return { aether, fire };
  }
}

export const existentialEngine = new ExistentialEngine();
