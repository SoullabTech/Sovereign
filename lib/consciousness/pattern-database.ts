/**
 * ARCHETYPAL PATTERN DATABASE
 *
 * The living repository of universal consciousness patterns that enables
 * translation across all wisdom systems.
 *
 * "The universal language of consciousness awakening"
 */

import type { ArchetypalPattern, UniversalCode } from './consciousness-translation-engine';

// ==================== FOUNDATIONAL PATTERNS ====================

/**
 * The 12 Primary Archetypal Patterns
 * Based on universal consciousness structures found across all wisdom traditions
 */
export const FOUNDATIONAL_PATTERNS: ArchetypalPattern[] = [
  {
    id: 'innocent',
    name: 'The Innocent',
    description: 'Pure presence, wonder, trust in life\'s unfolding',
    universalSignature: {
      id: 'innocent-essence',
      essence: 'Pure presence and fundamental trust',
      frequency: 0.3,
      polarity: 'receptive',
      element: 'water',
      phase: 'emergence'
    },
    systemMappings: {
      astrology: {
        planets: ['Moon', 'Venus'],
        signs: ['Cancer', 'Pisces'],
        houses: [4, 12],
        dignity: 'exaltation'
      },
      alchemy: {
        element: 'water',
        quality: 'cardinal',
        process: 'solution',
        stage: 'albedo',
        metal: 'silver',
        operation: 'dissolution'
      },
      psychology: {
        jungian: {
          archetype: 'Child',
          function: 'feeling',
          attitude: 'introversion'
        },
        enneagram: {
          type: 9,
          instinct: 'self-preservation'
        }
      },
      spiral: {
        level: 1,
        system: 'beige',
        transition: 'entering',
        gift: 'Natural wisdom'
      },
      somatic: {
        chakra: 2,
        nervousSystem: 'parasympathetic',
        bodyRegion: 'belly and heart',
        movement: 'flowing',
        breath: 'natural',
        sensation: 'warmth'
      },
      mythology: {
        archetype: 'Divine Child',
        journey: 'departure',
        symbol: 'Garden'
      },
      energy: {
        frequency: 0.3,
        meridian: 'heart',
        element: 'water',
        direction: 'center',
        quality: 'receptive'
      }
    },
    transformationVectors: [
      {
        from: 'Naivety and denial',
        to: 'Wise innocence and presence',
        method: 'Gentle awakening with support',
        duration: 60,
        conditions: ['Safety', 'Patience', 'Non-judgment']
      }
    ],
    timingOptimizations: [],
    harmonics: ['sage', 'lover'],
    tensions: ['destroyer', 'rebel']
  },

  {
    id: 'orphan',
    name: 'The Orphan',
    description: 'Vulnerability, seeking belonging, authentic humanity',
    universalSignature: {
      id: 'orphan-essence',
      essence: 'Vulnerable authenticity seeking connection',
      frequency: 0.4,
      polarity: 'receptive',
      element: 'water',
      phase: 'emergence'
    },
    systemMappings: {
      astrology: {
        planets: ['Moon', 'Chiron'],
        signs: ['Cancer', 'Pisces'],
        houses: [4, 8, 12],
        dignity: 'detriment'
      },
      alchemy: {
        element: 'water',
        quality: 'mutable',
        process: 'dissolution',
        stage: 'nigredo',
        metal: 'lead',
        operation: 'putrefaction'
      },
      psychology: {
        jungian: {
          archetype: 'Wounded Healer',
          function: 'feeling',
          attitude: 'introversion'
        },
        enneagram: {
          type: 6,
          instinct: 'social'
        }
      }
    },
    transformationVectors: [
      {
        from: 'Victim consciousness and blame',
        to: 'Compassionate wisdom and resilience',
        method: 'Community support and inner work',
        duration: 90,
        conditions: ['Trusted community', 'Therapeutic support', 'Self-compassion practice']
      }
    ],
    timingOptimizations: [],
    harmonics: ['caregiver', 'hero'],
    tensions: ['innocent', 'ruler']
  },

  {
    id: 'hero',
    name: 'The Hero',
    description: 'Courage, determination, proving worth through action',
    universalSignature: {
      id: 'hero-essence',
      essence: 'Courageous action and proving worthiness',
      frequency: 0.8,
      polarity: 'active',
      element: 'fire',
      phase: 'expansion'
    },
    systemMappings: {
      astrology: {
        planets: ['Mars', 'Sun'],
        signs: ['Aries', 'Leo'],
        houses: [1, 5],
        dignity: 'rulership'
      },
      alchemy: {
        element: 'fire',
        quality: 'cardinal',
        process: 'calcination',
        stage: 'rubedo',
        metal: 'iron',
        operation: 'separation'
      },
      psychology: {
        jungian: {
          archetype: 'Hero',
          function: 'thinking',
          attitude: 'extraversion'
        },
        enneagram: {
          type: 8,
          instinct: 'sexual'
        }
      }
    },
    transformationVectors: [
      {
        from: 'Ego-driven proving and burnout',
        to: 'Service-oriented courage and mastery',
        method: 'Mission clarity and sustainable action',
        duration: 45,
        conditions: ['Clear purpose', 'Supportive community', 'Rest and renewal']
      }
    ],
    timingOptimizations: [],
    harmonics: ['warrior', 'magician'],
    tensions: ['innocent', 'caregiver']
  },

  {
    id: 'caregiver',
    name: 'The Caregiver',
    description: 'Compassion, nurturing, serving others\' wellbeing',
    universalSignature: {
      id: 'caregiver-essence',
      essence: 'Compassionate service and nurturing',
      frequency: 0.6,
      polarity: 'receptive',
      element: 'water',
      phase: 'expansion'
    },
    systemMappings: {
      astrology: {
        planets: ['Moon', 'Venus'],
        signs: ['Cancer', 'Virgo'],
        houses: [4, 6],
        dignity: 'exaltation'
      },
      alchemy: {
        element: 'water',
        quality: 'cardinal',
        process: 'dissolution',
        stage: 'albedo',
        metal: 'silver',
        operation: 'nutrition'
      },
      psychology: {
        jungian: {
          archetype: 'Mother',
          function: 'feeling',
          attitude: 'extraversion'
        },
        enneagram: {
          type: 2,
          instinct: 'social'
        }
      }
    },
    transformationVectors: [
      {
        from: 'Codependency and self-sacrifice',
        to: 'Healthy boundaries and authentic service',
        method: 'Self-care practice and boundary work',
        duration: 75,
        conditions: ['Self-compassion', 'Boundary support', 'Personal fulfillment']
      }
    ],
    timingOptimizations: [],
    harmonics: ['lover', 'sage'],
    tensions: ['destroyer', 'rebel']
  },

  {
    id: 'explorer',
    name: 'The Explorer',
    description: 'Freedom, adventure, discovering new possibilities',
    universalSignature: {
      id: 'explorer-essence',
      essence: 'Freedom-seeking adventure and discovery',
      frequency: 0.7,
      polarity: 'active',
      element: 'air',
      phase: 'expansion'
    },
    systemMappings: {
      astrology: {
        planets: ['Jupiter', 'Uranus'],
        signs: ['Sagittarius', 'Aquarius'],
        houses: [9, 11],
        dignity: 'rulership'
      },
      alchemy: {
        element: 'air',
        quality: 'mutable',
        process: 'sublimation',
        stage: 'citrinitas',
        metal: 'tin',
        operation: 'distillation'
      },
      psychology: {
        jungian: {
          archetype: 'Explorer',
          function: 'intuition',
          attitude: 'extraversion'
        },
        enneagram: {
          type: 7,
          instinct: 'sexual'
        }
      }
    },
    transformationVectors: [
      {
        from: 'Restless escape and avoidance',
        to: 'Purposeful exploration and integration',
        method: 'Grounding practices with adventure',
        duration: 60,
        conditions: ['Adventure opportunities', 'Integration time', 'Community connection']
      }
    ],
    timingOptimizations: [],
    harmonics: ['rebel', 'magician'],
    tensions: ['innocent', 'caregiver']
  },

  {
    id: 'rebel',
    name: 'The Rebel',
    description: 'Revolution, breaking chains, destroying what doesn\'t serve',
    universalSignature: {
      id: 'rebel-essence',
      essence: 'Revolutionary destruction and liberation',
      frequency: 0.9,
      polarity: 'active',
      element: 'fire',
      phase: 'culmination'
    },
    systemMappings: {
      astrology: {
        planets: ['Mars', 'Pluto', 'Uranus'],
        signs: ['Aries', 'Scorpio', 'Aquarius'],
        houses: [1, 8, 11],
        dignity: 'exaltation'
      },
      alchemy: {
        element: 'fire',
        quality: 'fixed',
        process: 'calcination',
        stage: 'nigredo',
        metal: 'iron',
        operation: 'destruction'
      },
      psychology: {
        jungian: {
          archetype: 'Rebel',
          function: 'thinking',
          attitude: 'extraversion'
        },
        enneagram: {
          type: 8,
          instinct: 'social'
        }
      }
    },
    transformationVectors: [
      {
        from: 'Destructive rebellion and anger',
        to: 'Constructive revolution and liberation',
        method: 'Channeling anger into positive change',
        duration: 30,
        conditions: ['Clear cause', 'Constructive outlets', 'Community support']
      }
    ],
    timingOptimizations: [],
    harmonics: ['explorer', 'hero'],
    tensions: ['innocent', 'caregiver']
  },

  {
    id: 'lover',
    name: 'The Lover',
    description: 'Connection, beauty, relationships, emotional intelligence',
    universalSignature: {
      id: 'lover-essence',
      essence: 'Deep connection and emotional beauty',
      frequency: 0.6,
      polarity: 'receptive',
      element: 'water',
      phase: 'culmination'
    },
    systemMappings: {
      astrology: {
        planets: ['Venus'],
        signs: ['Taurus', 'Libra'],
        houses: [2, 7],
        dignity: 'rulership'
      },
      alchemy: {
        element: 'water',
        quality: 'fixed',
        process: 'conjunction',
        stage: 'albedo',
        metal: 'copper',
        operation: 'union'
      },
      psychology: {
        jungian: {
          archetype: 'Lover',
          function: 'feeling',
          attitude: 'extraversion'
        },
        enneagram: {
          type: 2,
          instinct: 'sexual'
        }
      }
    },
    transformationVectors: [
      {
        from: 'Codependency and emotional manipulation',
        to: 'Authentic connection and unconditional love',
        method: 'Heart-opening practices and relationship skills',
        duration: 90,
        conditions: ['Emotional safety', 'Authentic relationships', 'Self-love practice']
      }
    ],
    timingOptimizations: [],
    harmonics: ['caregiver', 'creator'],
    tensions: ['destroyer', 'ruler']
  },

  {
    id: 'creator',
    name: 'The Creator',
    description: 'Imagination, artistic vision, bringing new forms to life',
    universalSignature: {
      id: 'creator-essence',
      essence: 'Creative manifestation and artistic vision',
      frequency: 0.8,
      polarity: 'active',
      element: 'fire',
      phase: 'emergence'
    },
    systemMappings: {
      astrology: {
        planets: ['Sun', 'Venus', 'Neptune'],
        signs: ['Leo', 'Pisces'],
        houses: [5, 12],
        dignity: 'exaltation'
      },
      alchemy: {
        element: 'fire',
        quality: 'fixed',
        process: 'coagulation',
        stage: 'citrinitas',
        metal: 'gold',
        operation: 'creation'
      },
      psychology: {
        jungian: {
          archetype: 'Creator',
          function: 'intuition',
          attitude: 'introversion'
        },
        enneagram: {
          type: 4,
          instinct: 'sexual'
        }
      }
    },
    transformationVectors: [
      {
        from: 'Creative blocks and perfectionism',
        to: 'Flow state and authentic expression',
        method: 'Regular creative practice and self-compassion',
        duration: 45,
        conditions: ['Creative time', 'Supportive environment', 'Permission to experiment']
      }
    ],
    timingOptimizations: [],
    harmonics: ['lover', 'magician'],
    tensions: ['destroyer', 'ruler']
  },

  {
    id: 'destroyer',
    name: 'The Destroyer',
    description: 'Necessary endings, clearing space, transformative death',
    universalSignature: {
      id: 'destroyer-essence',
      essence: 'Necessary destruction and transformative endings',
      frequency: 1.0,
      polarity: 'active',
      element: 'fire',
      phase: 'integration'
    },
    systemMappings: {
      astrology: {
        planets: ['Pluto', 'Saturn'],
        signs: ['Scorpio', 'Capricorn'],
        houses: [8, 10],
        dignity: 'rulership'
      },
      alchemy: {
        element: 'fire',
        quality: 'fixed',
        process: 'calcination',
        stage: 'nigredo',
        metal: 'lead',
        operation: 'mortification'
      },
      psychology: {
        jungian: {
          archetype: 'Shadow',
          function: 'thinking',
          attitude: 'introversion'
        },
        enneagram: {
          type: 8,
          instinct: 'self-preservation'
        }
      }
    },
    transformationVectors: [
      {
        from: 'Destructive rage and nihilism',
        to: 'Sacred clearing and renewal',
        method: 'Shadow work and grief processing',
        duration: 120,
        conditions: ['Professional support', 'Safe container', 'Integration community']
      }
    ],
    timingOptimizations: [],
    harmonics: ['magician', 'ruler'],
    tensions: ['innocent', 'lover', 'creator']
  },

  {
    id: 'ruler',
    name: 'The Ruler',
    description: 'Leadership, responsibility, creating order and structure',
    universalSignature: {
      id: 'ruler-essence',
      essence: 'Responsible leadership and structured order',
      frequency: 0.7,
      polarity: 'active',
      element: 'earth',
      phase: 'culmination'
    },
    systemMappings: {
      astrology: {
        planets: ['Saturn', 'Sun'],
        signs: ['Capricorn', 'Leo'],
        houses: [10, 5],
        dignity: 'rulership'
      },
      alchemy: {
        element: 'earth',
        quality: 'cardinal',
        process: 'coagulation',
        stage: 'rubedo',
        metal: 'gold',
        operation: 'fixation'
      },
      psychology: {
        jungian: {
          archetype: 'King/Queen',
          function: 'thinking',
          attitude: 'extraversion'
        },
        enneagram: {
          type: 1,
          instinct: 'social'
        }
      }
    },
    transformationVectors: [
      {
        from: 'Authoritarian control and rigidity',
        to: 'Wise leadership and flexible structure',
        method: 'Power awareness and servant leadership',
        duration: 90,
        conditions: ['Feedback systems', 'Personal therapy', 'Wisdom mentors']
      }
    ],
    timingOptimizations: [],
    harmonics: ['destroyer', 'sage'],
    tensions: ['rebel', 'lover']
  },

  {
    id: 'magician',
    name: 'The Magician',
    description: 'Transformation, knowledge, bridging worlds, manifestation',
    universalSignature: {
      id: 'magician-essence',
      essence: 'Transformative knowledge and world-bridging',
      frequency: 0.9,
      polarity: 'neutral',
      element: 'aether',
      phase: 'integration'
    },
    systemMappings: {
      astrology: {
        planets: ['Mercury', 'Uranus', 'Neptune'],
        signs: ['Gemini', 'Virgo', 'Aquarius'],
        houses: [3, 6, 11],
        dignity: 'exaltation'
      },
      alchemy: {
        element: 'air',
        quality: 'mutable',
        process: 'sublimation',
        stage: 'citrinitas',
        metal: 'mercury',
        operation: 'transmutation'
      },
      psychology: {
        jungian: {
          archetype: 'Wise Old Man/Woman',
          function: 'intuition',
          attitude: 'introversion'
        },
        enneagram: {
          type: 5,
          instinct: 'self-preservation'
        }
      }
    },
    transformationVectors: [
      {
        from: 'Knowledge hoarding and spiritual bypassing',
        to: 'Integrated wisdom and practical magic',
        method: 'Embodied practice and service',
        duration: 180,
        conditions: ['Regular practice', 'Mentorship', 'Service opportunities']
      }
    ],
    timingOptimizations: [],
    harmonics: ['sage', 'creator'],
    tensions: ['innocent']
  },

  {
    id: 'sage',
    name: 'The Sage',
    description: 'Wisdom, understanding, seeking truth, sharing knowledge',
    universalSignature: {
      id: 'sage-essence',
      essence: 'Truth-seeking wisdom and understanding',
      frequency: 0.8,
      polarity: 'receptive',
      element: 'air',
      phase: 'integration'
    },
    systemMappings: {
      astrology: {
        planets: ['Jupiter', 'Mercury'],
        signs: ['Sagittarius', 'Gemini'],
        houses: [9, 3],
        dignity: 'rulership'
      },
      alchemy: {
        element: 'air',
        quality: 'mutable',
        process: 'sublimation',
        stage: 'albedo',
        metal: 'tin',
        operation: 'illumination'
      },
      psychology: {
        jungian: {
          archetype: 'Senex',
          function: 'thinking',
          attitude: 'introversion'
        },
        enneagram: {
          type: 5,
          instinct: 'self-preservation'
        }
      }
    },
    transformationVectors: [
      {
        from: 'Intellectual arrogance and detachment',
        to: 'Humble wisdom and compassionate teaching',
        method: 'Life experience integration and humility practice',
        duration: 150,
        conditions: ['Life experience', 'Teaching opportunities', 'Humility practice']
      }
    ],
    timingOptimizations: [],
    harmonics: ['magician', 'ruler'],
    tensions: []
  }
];

// ==================== PATTERN RELATIONSHIPS ====================

/**
 * Defines natural harmonic relationships between patterns
 */
export const PATTERN_HARMONICS: Record<string, string[]> = {
  innocent: ['sage', 'lover', 'caregiver'],
  orphan: ['caregiver', 'hero', 'sage'],
  hero: ['warrior', 'magician', 'explorer'],
  caregiver: ['lover', 'sage', 'innocent'],
  explorer: ['rebel', 'magician', 'creator'],
  rebel: ['explorer', 'hero', 'destroyer'],
  lover: ['caregiver', 'creator', 'innocent'],
  creator: ['lover', 'magician', 'explorer'],
  destroyer: ['magician', 'ruler', 'rebel'],
  ruler: ['destroyer', 'sage', 'magician'],
  magician: ['sage', 'creator', 'destroyer'],
  sage: ['magician', 'ruler', 'innocent']
};

/**
 * Defines natural tension relationships between patterns
 */
export const PATTERN_TENSIONS: Record<string, string[]> = {
  innocent: ['destroyer', 'rebel'],
  orphan: ['ruler', 'innocent'],
  hero: ['innocent', 'caregiver'],
  caregiver: ['destroyer', 'rebel', 'hero'],
  explorer: ['innocent', 'caregiver'],
  rebel: ['innocent', 'caregiver'],
  lover: ['destroyer', 'ruler'],
  creator: ['destroyer', 'ruler'],
  destroyer: ['innocent', 'lover', 'creator', 'caregiver'],
  ruler: ['rebel', 'lover', 'creator'],
  magician: ['innocent'],
  sage: []
};

// ==================== PATTERN EVOLUTION PATHS ====================

/**
 * Natural evolution paths showing how patterns develop and integrate
 */
export const EVOLUTION_PATHS: Record<string, string[]> = {
  // Growth paths
  innocent: ['explorer', 'creator', 'sage'],
  orphan: ['hero', 'caregiver', 'sage'],
  hero: ['lover', 'ruler', 'magician'],
  caregiver: ['lover', 'creator', 'sage'],
  explorer: ['creator', 'magician', 'sage'],
  rebel: ['hero', 'magician', 'destroyer'],
  lover: ['creator', 'sage', 'magician'],
  creator: ['magician', 'sage'],
  destroyer: ['magician', 'sage'],
  ruler: ['sage', 'magician'],
  magician: ['sage'],
  sage: ['magician'] // Circular wisdom
};

// ==================== DATABASE CLASS ====================

export class ArchetypalPatternDatabase {
  private patterns: Map<string, ArchetypalPattern> = new Map();
  private harmonics: Map<string, string[]> = new Map();
  private tensions: Map<string, string[]> = new Map();
  private evolutionPaths: Map<string, string[]> = new Map();

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    // Load foundational patterns
    FOUNDATIONAL_PATTERNS.forEach(pattern => {
      this.patterns.set(pattern.id, pattern);
    });

    // Load relationships
    Object.entries(PATTERN_HARMONICS).forEach(([patternId, harmonics]) => {
      this.harmonics.set(patternId, harmonics);
    });

    Object.entries(PATTERN_TENSIONS).forEach(([patternId, tensions]) => {
      this.tensions.set(patternId, tensions);
    });

    Object.entries(EVOLUTION_PATHS).forEach(([patternId, paths]) => {
      this.evolutionPaths.set(patternId, paths);
    });
  }

  // ==================== QUERY METHODS ====================

  getPattern(id: string): ArchetypalPattern | undefined {
    return this.patterns.get(id);
  }

  getAllPatterns(): ArchetypalPattern[] {
    return Array.from(this.patterns.values());
  }

  getPatternsByElement(element: string): ArchetypalPattern[] {
    return this.getAllPatterns().filter(
      pattern => pattern.universalSignature.element === element
    );
  }

  getPatternsByPolarity(polarity: string): ArchetypalPattern[] {
    return this.getAllPatterns().filter(
      pattern => pattern.universalSignature.polarity === polarity
    );
  }

  getPatternsByPhase(phase: string): ArchetypalPattern[] {
    return this.getAllPatterns().filter(
      pattern => pattern.universalSignature.phase === phase
    );
  }

  getHarmonicPatterns(patternId: string): ArchetypalPattern[] {
    const harmonicIds = this.harmonics.get(patternId) || [];
    return harmonicIds.map(id => this.getPattern(id)).filter(Boolean) as ArchetypalPattern[];
  }

  getTensionPatterns(patternId: string): ArchetypalPattern[] {
    const tensionIds = this.tensions.get(patternId) || [];
    return tensionIds.map(id => this.getPattern(id)).filter(Boolean) as ArchetypalPattern[];
  }

  getEvolutionPath(patternId: string): ArchetypalPattern[] {
    const evolutionIds = this.evolutionPaths.get(patternId) || [];
    return evolutionIds.map(id => this.getPattern(id)).filter(Boolean) as ArchetypalPattern[];
  }

  // ==================== SEARCH METHODS ====================

  searchPatterns(query: string): ArchetypalPattern[] {
    const lowercaseQuery = query.toLowerCase();
    return this.getAllPatterns().filter(pattern =>
      pattern.name.toLowerCase().includes(lowercaseQuery) ||
      pattern.description.toLowerCase().includes(lowercaseQuery) ||
      pattern.universalSignature.essence.toLowerCase().includes(lowercaseQuery)
    );
  }

  findSimilarPatterns(patternId: string, threshold: number = 0.7): ArchetypalPattern[] {
    const targetPattern = this.getPattern(patternId);
    if (!targetPattern) return [];

    return this.getAllPatterns()
      .filter(pattern => pattern.id !== patternId)
      .map(pattern => ({
        pattern,
        similarity: this.calculatePatternSimilarity(targetPattern, pattern)
      }))
      .filter(({ similarity }) => similarity >= threshold)
      .sort((a, b) => b.similarity - a.similarity)
      .map(({ pattern }) => pattern);
  }

  private calculatePatternSimilarity(pattern1: ArchetypalPattern, pattern2: ArchetypalPattern): number {
    let similarity = 0;
    let factors = 0;

    const sig1 = pattern1.universalSignature;
    const sig2 = pattern2.universalSignature;

    // Element similarity
    if (sig1.element === sig2.element) {
      similarity += 0.3;
    }
    factors++;

    // Polarity similarity
    if (sig1.polarity === sig2.polarity) {
      similarity += 0.2;
    }
    factors++;

    // Phase similarity
    if (sig1.phase === sig2.phase) {
      similarity += 0.2;
    }
    factors++;

    // Frequency similarity
    const frequencyDiff = Math.abs(sig1.frequency - sig2.frequency);
    similarity += (1 - frequencyDiff) * 0.2;
    factors++;

    // Harmonic relationship
    if (pattern1.harmonics.includes(pattern2.id)) {
      similarity += 0.1;
    }
    factors++;

    return factors > 0 ? similarity : 0;
  }

  // ==================== PATTERN ANALYSIS ====================

  analyzePatternBalance(patterns: string[]): PatternBalanceAnalysis {
    const patternObjects = patterns.map(id => this.getPattern(id)).filter(Boolean) as ArchetypalPattern[];

    // Analyze elemental balance
    const elementCounts = { fire: 0, water: 0, earth: 0, air: 0, aether: 0 };
    const polarityCounts = { active: 0, receptive: 0, neutral: 0 };
    const phaseCounts = { emergence: 0, expansion: 0, culmination: 0, integration: 0 };

    patternObjects.forEach(pattern => {
      const sig = pattern.universalSignature;
      elementCounts[sig.element]++;
      polarityCounts[sig.polarity]++;
      phaseCounts[sig.phase]++;
    });

    return {
      elementBalance: elementCounts,
      polarityBalance: polarityCounts,
      phaseBalance: phaseCounts,
      totalPatterns: patternObjects.length,
      recommendations: this.generateBalanceRecommendations(elementCounts, polarityCounts, phaseCounts)
    };
  }

  private generateBalanceRecommendations(
    elements: Record<string, number>,
    polarities: Record<string, number>,
    phases: Record<string, number>
  ): string[] {
    const recommendations: string[] = [];

    // Check elemental balance
    const totalElements = Object.values(elements).reduce((sum, count) => sum + count, 0);
    if (totalElements > 0) {
      const elementPercentages = Object.entries(elements).map(([element, count]) => ({
        element,
        percentage: count / totalElements
      }));

      // Identify missing or underrepresented elements
      elementPercentages.forEach(({ element, percentage }) => {
        if (percentage === 0) {
          recommendations.push(`Consider integrating ${element} element patterns for more balance`);
        } else if (percentage < 0.1 && totalElements > 3) {
          recommendations.push(`${element} element is underrepresented - explore ${element}-based patterns`);
        } else if (percentage > 0.5) {
          recommendations.push(`${element} element is dominant - consider balancing with other elements`);
        }
      });
    }

    // Check polarity balance
    const totalPolarities = Object.values(polarities).reduce((sum, count) => sum + count, 0);
    if (totalPolarities > 0) {
      const activeRatio = polarities.active / totalPolarities;
      const receptiveRatio = polarities.receptive / totalPolarities;

      if (activeRatio > 0.7) {
        recommendations.push('Consider integrating more receptive patterns for balance');
      } else if (receptiveRatio > 0.7) {
        recommendations.push('Consider integrating more active patterns for dynamic energy');
      }
    }

    return recommendations;
  }
}

// ==================== TYPES ====================

export interface PatternBalanceAnalysis {
  elementBalance: Record<string, number>;
  polarityBalance: Record<string, number>;
  phaseBalance: Record<string, number>;
  totalPatterns: number;
  recommendations: string[];
}

// Export singleton instance
export const patternDatabase = new ArchetypalPatternDatabase();