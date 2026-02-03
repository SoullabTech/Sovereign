/**
 * TCM State Extractor
 *
 * Detects Traditional Chinese Medicine patterns from conversation content.
 * Enables cross-framework synthesis with Western psychological frameworks.
 *
 * Detection Categories:
 * - Five Element imbalances (Wood, Fire, Earth, Metal, Water)
 * - Spirit disturbances (Shen, Hun, Po, Yi, Zhi)
 * - Eight Principles (Yin/Yang, Cold/Hot, etc.)
 * - Pathogenic patterns (Wind, Cold, Dampness, etc.)
 * - Organ patterns (Liver Qi stagnation, Heart Blood deficiency, etc.)
 */

import {
  TCMElement,
  FIVE_ELEMENTS,
  FIVE_SPIRITS,
  PATHOGENIC_FACTORS,
  TCM_CROSS_FRAMEWORK_PATTERNS,
  type EightPrinciplesState,
  type SpiritState
} from './ChineseMedicineFramework';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface TCMExtractionResult {
  detected: boolean;
  confidence: number;

  // Element Analysis
  elementalState: {
    dominant: TCMElement | null;
    deficient: TCMElement | null;
    stagnant: TCMElement | null;
    elementScores: Record<TCMElement, number>;
  };

  // Spirit Analysis
  spiritState: {
    disturbedSpirits: Array<{
      spirit: string;
      disturbance: 'excess' | 'deficiency' | 'unstable';
      indicators: string[];
      confidence: number;
    }>;
    shenClarity: number; // 0-1, how clear/present is consciousness
  };

  // Eight Principles
  eightPrinciples: EightPrinciplesState;

  // Pathogenic Factors
  pathogenicFactors: Array<{
    factor: string;
    detected: boolean;
    indicators: string[];
  }>;

  // Organ Patterns
  organPatterns: Array<{
    pattern: string;
    organ: string;
    element: TCMElement;
    confidence: number;
    indicators: string[];
    crossFrameworkCorrelations: {
      jungian?: string[];
      ifs?: string[];
      polyvagal?: string[];
      somatic?: string[];
    };
  }>;

  // Key Axes
  heartKidneyAxis: {
    balanced: boolean;
    pattern: string;
    indicators: string[];
  };

  // Therapeutic Direction
  therapeuticFocus: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Pattern Detection Keywords
// ─────────────────────────────────────────────────────────────────────────────

const ELEMENT_KEYWORDS: Record<TCMElement, { excess: string[]; deficiency: string[]; stagnation: string[] }> = {
  wood: {
    excess: ['rage', 'fury', 'explosive', 'violent', 'screaming', 'attacking', 'aggressive'],
    deficiency: ['no direction', 'aimless', 'depressed', 'can\'t decide', 'stuck', 'passive'],
    stagnation: ['frustrated', 'irritated', 'sighing', 'rib pain', 'tight chest', 'pms', 'mood swings', 'bottled up']
  },
  fire: {
    excess: ['manic', 'can\'t stop talking', 'racing thoughts', 'insomnia', 'palpitations', 'excessive laughter'],
    deficiency: ['no joy', 'flat', 'disconnected', 'can\'t feel', 'dull eyes', 'withdrawn'],
    stagnation: ['bitter', 'heartbroken', 'can\'t let go of love', 'guarded heart']
  },
  earth: {
    excess: ['obsessive', 'clingy', 'smothering', 'worry about everyone'],
    deficiency: ['can\'t nourish myself', 'empty', 'neglect self', 'eating problems', 'fatigue'],
    stagnation: ['overthinking', 'ruminating', 'worry loop', 'can\'t stop thinking', 'foggy', 'heavy']
  },
  metal: {
    excess: ['rigid', 'perfectionist', 'judgmental', 'harsh', 'cutting'],
    deficiency: ['can\'t let go', 'grief', 'loss', 'weak boundaries', 'catch everything', 'shallow breathing'],
    stagnation: ['stuck grief', 'prolonged mourning', 'attached to past', 'can\'t move on']
  },
  water: {
    excess: ['paranoid', 'phobic', 'terror', 'panic', 'night terrors'],
    deficiency: ['exhausted', 'burnt out', 'no willpower', 'give up easily', 'cold', 'back pain', 'aging fast'],
    stagnation: ['frozen fear', 'can\'t move forward', 'paralyzed', 'existential dread']
  }
};

const SPIRIT_KEYWORDS: Record<string, { disturbed: string[]; settled: string[] }> = {
  shen: {
    disturbed: ['insomnia', 'anxiety', 'restless', 'can\'t focus', 'scattered', 'confused', 'palpitations', 'startles easily'],
    settled: ['peaceful', 'present', 'clear thinking', 'good sleep', 'calm', 'connected']
  },
  hun: {
    disturbed: ['nightmares', 'no direction', 'can\'t dream', 'blocked creativity', 'rage', 'frustration'],
    settled: ['creative', 'visionary', 'clear purpose', 'good dreams', 'flexible']
  },
  po: {
    disturbed: ['grief', 'loss', 'can\'t breathe', 'skin problems', 'weak immunity', 'numb'],
    settled: ['embodied', 'vital', 'strong instincts', 'healthy boundaries', 'can let go']
  },
  yi: {
    disturbed: ['worry', 'overthinking', 'obsessing', 'can\'t concentrate', 'eating issues', 'foggy'],
    settled: ['clear thinking', 'good focus', 'nourished', 'centered', 'stable']
  },
  zhi: {
    disturbed: ['fear', 'terror', 'no willpower', 'exhausted', 'giving up', 'existential anxiety'],
    settled: ['determined', 'resilient', 'wise', 'courageous', 'rooted', 'ancestral connection']
  }
};

const PATHOGENIC_KEYWORDS: Record<string, string[]> = {
  wind: ['sudden', 'came out of nowhere', 'changing', 'unstable', 'migrating', 'trembling', 'tics', 'dizziness'],
  cold: ['cold', 'chills', 'contracted', 'frozen', 'withdrawn', 'shut down', 'numb', 'pale'],
  heat: ['hot', 'burning', 'red', 'inflamed', 'agitated', 'thirsty', 'restless', 'manic'],
  dampness: ['heavy', 'foggy', 'sluggish', 'stuck', 'bloated', 'mucus', 'cloudy thinking', 'lethargic'],
  dryness: ['dry', 'brittle', 'cracked', 'can\'t cry', 'rigid', 'parched', 'withered'],
  fire: ['rage', 'fury', 'explosive', 'bleeding', 'high fever', 'mania', 'violent', 'consuming']
};

const ORGAN_PATTERN_KEYWORDS: Record<string, { keywords: string[]; element: TCMElement; organ: string }> = {
  'liver_qi_stagnation': {
    keywords: ['frustrated', 'irritable', 'sighing', 'mood swings', 'rib pain', 'pms', 'bottled up anger', 'can\'t express'],
    element: 'wood',
    organ: 'Liver'
  },
  'liver_fire_rising': {
    keywords: ['rage', 'headache', 'red face', 'bitter taste', 'explosive anger', 'high blood pressure'],
    element: 'wood',
    organ: 'Liver'
  },
  'heart_blood_deficiency': {
    keywords: ['anxiety', 'palpitations', 'insomnia', 'poor memory', 'pale', 'startles easily', 'disconnected'],
    element: 'fire',
    organ: 'Heart'
  },
  'heart_fire_blazing': {
    keywords: ['insomnia', 'mania', 'incoherent speech', 'agitated', 'tongue ulcers', 'can\'t stop talking'],
    element: 'fire',
    organ: 'Heart'
  },
  'spleen_qi_deficiency': {
    keywords: ['fatigue', 'loose stools', 'no appetite', 'worry', 'bruises easily', 'weak limbs', 'overthinking'],
    element: 'earth',
    organ: 'Spleen'
  },
  'spleen_dampness': {
    keywords: ['foggy', 'heavy', 'bloated', 'sluggish', 'mucus', 'can\'t think clearly', 'ruminating'],
    element: 'earth',
    organ: 'Spleen'
  },
  'lung_qi_deficiency': {
    keywords: ['weak voice', 'shortness of breath', 'catches colds', 'sweating', 'sad', 'tired'],
    element: 'metal',
    organ: 'Lung'
  },
  'lung_grief': {
    keywords: ['grief', 'loss', 'can\'t let go', 'crying', 'chest tightness', 'mourning', 'prolonged sadness'],
    element: 'metal',
    organ: 'Lung'
  },
  'kidney_yang_deficiency': {
    keywords: ['cold', 'exhausted', 'lower back pain', 'no drive', 'pale', 'frequent urination', 'impotence'],
    element: 'water',
    organ: 'Kidney'
  },
  'kidney_yin_deficiency': {
    keywords: ['night sweats', 'hot flashes', 'dry mouth', 'tinnitus', 'insomnia', 'anxiety', 'restless'],
    element: 'water',
    organ: 'Kidney'
  },
  'kidney_fear': {
    keywords: ['fear', 'terror', 'phobia', 'panic', 'existential dread', 'no foundation', 'groundless'],
    element: 'water',
    organ: 'Kidney'
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Extractor Class
// ─────────────────────────────────────────────────────────────────────────────

export class TCMStateExtractor {
  /**
   * Extract TCM patterns from conversation text
   */
  extract(text: string): TCMExtractionResult {
    const normalizedText = text.toLowerCase();

    const elementalState = this.analyzeElements(normalizedText);
    const spiritState = this.analyzeSpirits(normalizedText);
    const eightPrinciples = this.analyzeEightPrinciples(normalizedText);
    const pathogenicFactors = this.analyzePathogenicFactors(normalizedText);
    const organPatterns = this.analyzeOrganPatterns(normalizedText);
    const heartKidneyAxis = this.analyzeHeartKidneyAxis(normalizedText, organPatterns);

    const detected = organPatterns.length > 0 ||
                     spiritState.disturbedSpirits.length > 0 ||
                     pathogenicFactors.some(p => p.detected);

    const confidence = this.calculateOverallConfidence(elementalState, spiritState, organPatterns);

    const therapeuticFocus = this.determineTherapeuticFocus(
      elementalState,
      spiritState,
      organPatterns,
      heartKidneyAxis
    );

    return {
      detected,
      confidence,
      elementalState,
      spiritState,
      eightPrinciples,
      pathogenicFactors,
      organPatterns,
      heartKidneyAxis,
      therapeuticFocus
    };
  }

  private analyzeElements(text: string): TCMExtractionResult['elementalState'] {
    const scores: Record<TCMElement, number> = {
      wood: 0, fire: 0, earth: 0, metal: 0, water: 0
    };
    let dominant: TCMElement | null = null;
    let deficient: TCMElement | null = null;
    let stagnant: TCMElement | null = null;

    const elements: TCMElement[] = ['wood', 'fire', 'earth', 'metal', 'water'];

    for (const element of elements) {
      const keywords = ELEMENT_KEYWORDS[element];

      // Check excess
      for (const kw of keywords.excess) {
        if (text.includes(kw)) {
          scores[element] += 2;
        }
      }

      // Check deficiency
      let deficiencyCount = 0;
      for (const kw of keywords.deficiency) {
        if (text.includes(kw)) {
          deficiencyCount++;
        }
      }
      if (deficiencyCount > 0) {
        scores[element] -= deficiencyCount;
        if (!deficient || deficiencyCount > 2) {
          deficient = element;
        }
      }

      // Check stagnation
      for (const kw of keywords.stagnation) {
        if (text.includes(kw)) {
          scores[element] += 1;
          stagnant = element;
        }
      }
    }

    // Find dominant
    const maxScore = Math.max(...Object.values(scores));
    if (maxScore > 0) {
      dominant = elements.find(e => scores[e] === maxScore) || null;
    }

    return { dominant, deficient, stagnant, elementScores: scores };
  }

  private analyzeSpirits(text: string): TCMExtractionResult['spiritState'] {
    const disturbedSpirits: TCMExtractionResult['spiritState']['disturbedSpirits'] = [];
    let shenClarity = 0.7; // Default moderate clarity

    const spirits = ['shen', 'hun', 'po', 'yi', 'zhi'] as const;

    for (const spirit of spirits) {
      const keywords = SPIRIT_KEYWORDS[spirit];
      const disturbedIndicators: string[] = [];
      const settledIndicators: string[] = [];

      for (const kw of keywords.disturbed) {
        if (text.includes(kw)) {
          disturbedIndicators.push(kw);
        }
      }

      for (const kw of keywords.settled) {
        if (text.includes(kw)) {
          settledIndicators.push(kw);
        }
      }

      if (disturbedIndicators.length > settledIndicators.length) {
        const disturbance = disturbedIndicators.length > 3 ? 'excess' :
                           disturbedIndicators.length > 1 ? 'unstable' : 'deficiency';

        disturbedSpirits.push({
          spirit: spirit.charAt(0).toUpperCase() + spirit.slice(1),
          disturbance,
          indicators: disturbedIndicators,
          confidence: Math.min(0.9, 0.3 + disturbedIndicators.length * 0.15)
        });
      }

      // Shen specifically affects overall clarity
      if (spirit === 'shen') {
        if (disturbedIndicators.length > 2) {
          shenClarity = Math.max(0.2, 0.7 - disturbedIndicators.length * 0.1);
        } else if (settledIndicators.length > 1) {
          shenClarity = Math.min(0.95, 0.7 + settledIndicators.length * 0.1);
        }
      }
    }

    return { disturbedSpirits, shenClarity };
  }

  private analyzeEightPrinciples(text: string): EightPrinciplesState {
    // Yin/Yang
    const yinIndicators = ['cold', 'pale', 'quiet', 'slow', 'internal', 'chronic', 'weak'];
    const yangIndicators = ['hot', 'red', 'loud', 'fast', 'external', 'acute', 'strong'];

    let yinCount = 0, yangCount = 0;
    for (const kw of yinIndicators) if (text.includes(kw)) yinCount++;
    for (const kw of yangIndicators) if (text.includes(kw)) yangCount++;

    const yinYang = yinCount > yangCount + 2 ? 'yin' :
                    yangCount > yinCount + 2 ? 'yang' : 'balanced';

    // Interior/Exterior
    const interiorIndicators = ['deep', 'chronic', 'organ', 'core', 'fundamental'];
    const exteriorIndicators = ['sudden', 'surface', 'acute', 'just started', 'recent'];

    let intCount = 0, extCount = 0;
    for (const kw of interiorIndicators) if (text.includes(kw)) intCount++;
    for (const kw of exteriorIndicators) if (text.includes(kw)) extCount++;

    const interiorExterior = intCount > extCount ? 'interior' :
                            extCount > intCount ? 'exterior' : 'half-interior-half-exterior';

    // Cold/Hot
    const coldIndicators = ['cold', 'chilly', 'frozen', 'withdrawn', 'pale'];
    const hotIndicators = ['hot', 'burning', 'inflamed', 'agitated', 'red'];

    let coldCount = 0, hotCount = 0;
    for (const kw of coldIndicators) if (text.includes(kw)) coldCount++;
    for (const kw of hotIndicators) if (text.includes(kw)) hotCount++;

    const coldHot = coldCount > hotCount ? 'cold' :
                    hotCount > coldCount ? 'hot' : 'neutral';

    // Deficiency/Excess
    const defIndicators = ['tired', 'weak', 'depleted', 'exhausted', 'empty', 'lacking'];
    const excIndicators = ['too much', 'overwhelming', 'excess', 'overload', 'flooded'];

    let defCount = 0, excCount = 0;
    for (const kw of defIndicators) if (text.includes(kw)) defCount++;
    for (const kw of excIndicators) if (text.includes(kw)) excCount++;

    const deficiencyExcess = defCount > excCount ? 'deficiency' :
                            excCount > defCount ? 'excess' : 'mixed';

    return { yinYang, interiorExterior, coldHot, deficiencyExcess };
  }

  private analyzePathogenicFactors(text: string): TCMExtractionResult['pathogenicFactors'] {
    const factors: TCMExtractionResult['pathogenicFactors'] = [];

    for (const [factor, keywords] of Object.entries(PATHOGENIC_KEYWORDS)) {
      const indicators: string[] = [];
      for (const kw of keywords) {
        if (text.includes(kw)) {
          indicators.push(kw);
        }
      }

      factors.push({
        factor: factor.charAt(0).toUpperCase() + factor.slice(1),
        detected: indicators.length >= 2,
        indicators
      });
    }

    return factors;
  }

  private analyzeOrganPatterns(text: string): TCMExtractionResult['organPatterns'] {
    const patterns: TCMExtractionResult['organPatterns'] = [];

    for (const [patternKey, config] of Object.entries(ORGAN_PATTERN_KEYWORDS)) {
      const indicators: string[] = [];
      for (const kw of config.keywords) {
        if (text.includes(kw)) {
          indicators.push(kw);
        }
      }

      if (indicators.length >= 2) {
        // Find cross-framework correlations
        const crossFramework = TCM_CROSS_FRAMEWORK_PATTERNS.find(
          p => p.tcmPattern.toLowerCase().includes(patternKey.replace(/_/g, ' '))
        );

        const patternName = patternKey
          .split('_')
          .map(w => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');

        patterns.push({
          pattern: patternName,
          organ: config.organ,
          element: config.element,
          confidence: Math.min(0.95, 0.4 + indicators.length * 0.15),
          indicators,
          crossFrameworkCorrelations: crossFramework ? {
            jungian: crossFramework.jungian,
            ifs: crossFramework.ifs,
            polyvagal: crossFramework.polyvagal,
            somatic: crossFramework.somatic
          } : {}
        });
      }
    }

    // Sort by confidence
    return patterns.sort((a, b) => b.confidence - a.confidence);
  }

  private analyzeHeartKidneyAxis(
    text: string,
    organPatterns: TCMExtractionResult['organPatterns']
  ): TCMExtractionResult['heartKidneyAxis'] {
    const heartPatterns = organPatterns.filter(p => p.organ === 'Heart');
    const kidneyPatterns = organPatterns.filter(p => p.organ === 'Kidney');

    const axisIndicators: string[] = [];

    // Check for axis imbalance indicators
    const imbalanceKeywords = [
      'insomnia', 'anxiety', 'palpitations', 'night sweats',
      'can\'t settle', 'mind racing', 'hot above cold below',
      'disconnected from body', 'floating', 'ungrounded'
    ];

    for (const kw of imbalanceKeywords) {
      if (text.includes(kw)) {
        axisIndicators.push(kw);
      }
    }

    const hasHeartIssue = heartPatterns.length > 0;
    const hasKidneyIssue = kidneyPatterns.length > 0;
    const hasAxisIndicators = axisIndicators.length >= 2;

    const balanced = !hasAxisIndicators && (!hasHeartIssue || !hasKidneyIssue);

    let pattern = 'Balanced';
    if (!balanced) {
      if (hasHeartIssue && hasKidneyIssue) {
        pattern = 'Heart-Kidney disconnection (Fire and Water not communicating)';
      } else if (hasHeartIssue) {
        pattern = 'Heart Fire not descending';
      } else if (hasKidneyIssue) {
        pattern = 'Kidney Water not ascending';
      } else {
        pattern = 'Axis instability';
      }
    }

    return { balanced, pattern, indicators: axisIndicators };
  }

  private calculateOverallConfidence(
    elementalState: TCMExtractionResult['elementalState'],
    spiritState: TCMExtractionResult['spiritState'],
    organPatterns: TCMExtractionResult['organPatterns']
  ): number {
    let confidence = 0;

    // Element detection confidence
    const maxElementScore = Math.max(...Object.values(elementalState.elementScores));
    if (maxElementScore > 0) confidence += Math.min(0.3, maxElementScore * 0.05);

    // Spirit detection confidence
    if (spiritState.disturbedSpirits.length > 0) {
      confidence += spiritState.disturbedSpirits[0].confidence * 0.3;
    }

    // Organ pattern confidence
    if (organPatterns.length > 0) {
      confidence += organPatterns[0].confidence * 0.4;
    }

    return Math.min(0.95, confidence);
  }

  private determineTherapeuticFocus(
    elementalState: TCMExtractionResult['elementalState'],
    spiritState: TCMExtractionResult['spiritState'],
    organPatterns: TCMExtractionResult['organPatterns'],
    heartKidneyAxis: TCMExtractionResult['heartKidneyAxis']
  ): string[] {
    const focus: string[] = [];

    // Heart-Kidney axis is priority
    if (!heartKidneyAxis.balanced) {
      focus.push('Restore Heart-Kidney communication (descend fire, ascend water)');
    }

    // Primary organ pattern
    if (organPatterns.length > 0) {
      const primary = organPatterns[0];
      const element = FIVE_ELEMENTS[primary.element];
      focus.push(`Address ${primary.pattern} through ${element.yinOrgan} support`);
    }

    // Disturbed spirits
    if (spiritState.disturbedSpirits.length > 0) {
      const primarySpirit = spiritState.disturbedSpirits[0];
      focus.push(`Calm and settle the ${primarySpirit.spirit}`);
    }

    // Element deficiency
    if (elementalState.deficient) {
      const element = FIVE_ELEMENTS[elementalState.deficient];
      focus.push(`Nourish ${elementalState.deficient} element (${element.yinOrgan})`);
    }

    // Element stagnation
    if (elementalState.stagnant) {
      focus.push(`Move stagnant ${elementalState.stagnant} Qi`);
    }

    return focus;
  }
}

export const tcmStateExtractor = new TCMStateExtractor();
