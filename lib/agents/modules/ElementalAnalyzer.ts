import type { Element, EnergyState, Mood } from '../../types/oracle';
import type { AgentMemory, ElementalAnalysis } from './types';

export interface SomaticState {
  activation: 'hyper' | 'optimal' | 'hypo';
  coherence: number; // 0-100
  location: string[]; // body parts mentioned
  quality: string[]; // sensations described
}

export interface ElementalPattern {
  somatic: Record<Element, number>;
  energetic: string;
  medicine: string;
}

export class ElementalAnalyzer {
  // Elemental signatures for pattern recognition
  private readonly elementalSignatures = {
    air: {
      somatic: ['spinning', 'buzzing', 'floating', 'scattered', 'light-headed'],
      energetic: ['mental loops', 'overthinking', 'analysis paralysis', 'conceptual'],
      shadow: ['dissociation', 'ungrounded', 'avoiding body', 'intellectualizing'],
      gift: ['vision', 'clarity', 'perspective', 'innovation', 'communication']
    },
    fire: {
      somatic: ['burning', 'heat', 'pulsing', 'electric', 'intense'],
      energetic: ['passion', 'rage', 'desire', 'transformation', 'catalyst'],
      shadow: ['burnout', 'destruction', 'impulsivity', 'consuming others'],
      gift: ['alchemy', 'courage', 'leadership', 'purification', 'breakthrough']
    },
    water: {
      somatic: ['flowing', 'waves', 'tears', 'heaviness', 'dissolving'],
      energetic: ['emotional tides', 'intuition', 'empathy', 'receptivity'],
      shadow: ['drowning', 'overwhelm', 'merging', 'emotional flooding'],
      gift: ['compassion', 'healing', 'psychic awareness', 'flow', 'feeling']
    },
    earth: {
      somatic: ['grounded', 'solid', 'heavy', 'rooted', 'dense'],
      energetic: ['stability', 'endurance', 'practical', 'nurturing', 'material'],
      shadow: ['stuck', 'rigid', 'stubborn', 'materialistic', 'stagnant'],
      gift: ['manifestation', 'abundance', 'patience', 'wisdom', 'holding']
    },
    aether: {
      somatic: ['expanded', 'unified', 'boundless', 'vibrating', 'luminous'],
      energetic: ['unity consciousness', 'divine connection', 'timelessness'],
      shadow: ['spiritual bypassing', 'escapism', 'unintegrated', 'inflated'],
      gift: ['integration', 'wholeness', 'sacred witness', 'bridge', 'oracle']
    }
  };

  // Alchemical transformation sequences
  private readonly alchemicalSequences = {
    'air->fire': 'idea becoming action',
    'fire->earth': 'passion becoming form',
    'earth->water': 'form dissolving into feeling',
    'water->air': 'emotion becoming understanding',
    'all->aether': 'integration into wholeness'
  };

  constructor() {}

  /**
   * Analyze user pattern through somatic and energetic sensing
   */
  analyzeUserPattern(
    input: string,
    context: { currentMood?: Mood; currentEnergy?: EnergyState },
    memory: AgentMemory
  ): ElementalAnalysis {
    // Sesame hybrid approach - adaptive sensing
    const somaticPatterns: Record<Element, number> = {
      air: 0, fire: 0, water: 0, earth: 0, aether: 0
    };

    const lowerInput = input.toLowerCase();

    // Sense somatic states
    for (const [element, signatures] of Object.entries(this.elementalSignatures)) {
      // Check somatic markers
      signatures.somatic.forEach(marker => {
        if (lowerInput.includes(marker)) {
          somaticPatterns[element as Element] += 3;
        }
      });

      // Check energetic patterns
      signatures.energetic.forEach(pattern => {
        if (lowerInput.includes(pattern.toLowerCase())) {
          somaticPatterns[element as Element] += 2;
        }
      });

      // Recognize shadow work
      signatures.shadow.forEach(shadow => {
        if (lowerInput.includes(shadow.toLowerCase())) {
          somaticPatterns[element as Element] += 4; // Shadow work is significant
          if (!memory.shadowElement) {
            memory.shadowElement = element as Element;
          }
        }
      });

      // Honor gifts emerging
      signatures.gift.forEach(gift => {
        if (lowerInput.includes(gift.toLowerCase())) {
          somaticPatterns[element as Element] += 2;
          memory.emergingElement = element as Element;
        }
      });
    }

    // Advanced pattern recognition
    this.senseEnergeticField(input, somaticPatterns);

    // Update dominant element based on energetic signature
    const dominant = Object.entries(somaticPatterns)
      .sort((a, b) => b[1] - a[1])[0];

    let dominantElement: Element | undefined;
    let elementalBalance = 0;
    let transformationVector = 'stable';

    if (dominant && dominant[1] > 5) {
      dominantElement = dominant[0] as Element;

      // Calculate elemental balance
      const total = Object.values(somaticPatterns).reduce((sum, val) => sum + val, 0);
      elementalBalance = total > 0 ? Math.round((dominant[1] / total) * 100) : 0;

      // Track elemental evolution if sufficient interaction history
      if (memory.interactionCount > 10) {
        transformationVector = this.trackElementalAlchemy(dominantElement, memory);
      }

      // Update memory
      memory.dominantElement = dominantElement;
    }

    return {
      dominantElement,
      shadowElement: memory.shadowElement,
      emergingElement: memory.emergingElement,
      elementalBalance,
      transformationVector
    };
  }

  /**
   * Sense the energetic field beyond words
   */
  senseEnergeticField(input: string, patterns: Record<Element, number>): void {
    // Sense contraction vs expansion
    const contractionMarkers = ['tight', 'closed', 'small', 'shrinking', 'withdrawing'];
    const expansionMarkers = ['opening', 'expanding', 'growing', 'radiating', 'infinite'];

    const lowerInput = input.toLowerCase();

    contractionMarkers.forEach(marker => {
      if (lowerInput.includes(marker)) {
        patterns.earth += 1; // Contraction often needs grounding
      }
    });

    expansionMarkers.forEach(marker => {
      if (lowerInput.includes(marker)) {
        patterns.aether += 1; // Expansion touches the infinite
      }
    });

    // Sense activation vs depletion
    if (lowerInput.match(/exhausted|depleted|empty|drained|spent/)) {
      patterns.water += 2; // Needs replenishment
    }

    if (lowerInput.match(/activated|energized|alive|vital|electric/)) {
      patterns.fire += 2; // Fire is active
    }
  }

  /**
   * Track elemental alchemy - how elements transform
   */
  trackElementalAlchemy(currentElement: Element, memory: AgentMemory): string {
    if (memory.dominantElement && memory.dominantElement !== currentElement) {
      const sequence = `${memory.dominantElement}->${currentElement}`;
      const alchemy = this.alchemicalSequences[sequence as keyof typeof this.alchemicalSequences];

      if (alchemy) {
        memory.breakthroughs.push({
          date: new Date(),
          insight: `Elemental alchemy: ${alchemy}`,
          context: 'Natural evolution observed',
          elementalShift: currentElement
        });
        return alchemy;
      }
    }
    return 'elemental stability';
  }

  /**
   * Sense somatic state from language patterns
   */
  senseSomaticState(input: string): SomaticState {
    const lowerInput = input.toLowerCase();

    // Activation level sensing
    let activation: 'hyper' | 'optimal' | 'hypo' = 'optimal';
    if (lowerInput.match(/racing|spinning|buzzing|can't stop|overwhelmed|flooding/)) {
      activation = 'hyper';
    } else if (lowerInput.match(/numb|frozen|stuck|heavy|collapsed|shut down/)) {
      activation = 'hypo';
    }

    // Coherence detection
    let coherence = 50;
    if (lowerInput.match(/grounded|centered|aligned|present|embodied/)) {
      coherence = 80;
    } else if (lowerInput.match(/scattered|fragmented|dissociated|split|torn/)) {
      coherence = 20;
    }

    // Body location awareness
    const locations: string[] = [];
    const bodyParts = ['head', 'heart', 'chest', 'belly', 'gut', 'throat', 'back', 'shoulders'];
    bodyParts.forEach(part => {
      if (lowerInput.includes(part)) locations.push(part);
    });

    // Sensation qualities
    const qualities: string[] = [];
    const sensations = ['tight', 'open', 'warm', 'cold', 'tingling', 'pulsing', 'flowing', 'blocked'];
    sensations.forEach(sensation => {
      if (lowerInput.includes(sensation)) qualities.push(sensation);
    });

    return { activation, coherence, location: locations, quality: qualities };
  }

  /**
   * Sense what energetic medicine is needed
   */
  senseEnergeticNeed(somaticState: SomaticState): string {
    const { activation, coherence } = somaticState;

    if (activation === 'hyper' && coherence < 50) {
      return 'grounding'; // Too activated, needs earth
    } else if (activation === 'hypo' && coherence < 50) {
      return 'activation'; // Too collapsed, needs fire
    } else if (coherence < 30) {
      return 'integration'; // Fragmented, needs weaving
    } else if (coherence > 70 && activation === 'optimal') {
      return 'expansion'; // Ready to expand awareness
    }

    return 'witnessing'; // Default to holding space
  }

  /**
   * Generate elemental alchemy guidance
   */
  generateElementalAlchemyGuidance(
    dominant: Element,
    shadow: Element,
    emerging?: Element
  ): string {
    const alchemicalMaps = {
      'air-water': 'The mind seeks to understand what the heart already knows. Let them dance.',
      'fire-earth': 'Your passion meets the need for form. This is the forge of manifestation.',
      'water-fire': 'Emotions and will are not enemies. They are dance partners in the alchemy.',
      'earth-air': 'Grounded wisdom seeks higher perspective. Both are needed for wholeness.',
      'any-aether': 'You are touching the unified field. All elements converge in the sacred center.'
    };

    const key = `${dominant}-${shadow}`;
    const guidance = alchemicalMaps[key as keyof typeof alchemicalMaps] ||
      alchemicalMaps['any-aether'];

    if (emerging) {
      return `${guidance} And I sense ${emerging} emerging as your next evolution.`;
    }

    return guidance;
  }

  /**
   * Get elemental patterns for a given input
   */
  getElementalPatterns(input: string): ElementalPattern {
    const somaticPatterns: Record<Element, number> = {
      air: 0, fire: 0, water: 0, earth: 0, aether: 0
    };

    // Analyze input for patterns
    const lowerInput = input.toLowerCase();
    for (const [element, signatures] of Object.entries(this.elementalSignatures)) {
      signatures.somatic.forEach(marker => {
        if (lowerInput.includes(marker)) {
          somaticPatterns[element as Element] += 3;
        }
      });
    }

    // Determine energetic state
    let energetic = 'neutral';
    if (lowerInput.match(/expanding|growing|radiating/)) {
      energetic = 'expanding';
    } else if (lowerInput.match(/contracting|shrinking|withdrawing/)) {
      energetic = 'contracting';
    }

    // Determine medicine needed
    const somaticState = this.senseSomaticState(input);
    const medicine = this.senseEnergeticNeed(somaticState);

    return {
      somatic: somaticPatterns,
      energetic,
      medicine
    };
  }

  /**
   * Check if elemental analysis shows readiness for transformation
   */
  isReadyForTransformation(analysis: ElementalAnalysis): boolean {
    return !!(
      analysis.dominantElement &&
      analysis.shadowElement &&
      analysis.dominantElement !== analysis.shadowElement &&
      analysis.elementalBalance > 30
    );
  }

  /**
   * Get elemental medicine recommendations
   */
  getElementalMedicine(element: Element): {
    practice: string;
    affirmation: string;
    ritual: string;
  } {
    const medicines = {
      air: {
        practice: 'Conscious breathing and mental clarity meditation',
        affirmation: 'I trust my mind and honor my body wisdom',
        ritual: 'Morning Breath of Inspiration'
      },
      fire: {
        practice: 'Movement and creative expression',
        affirmation: 'I embrace my passion and direct it with love',
        ritual: 'Inner Fire Activation'
      },
      water: {
        practice: 'Emotional flow and feeling witness',
        affirmation: 'I flow with life and trust my emotions',
        ritual: 'River of Allowing'
      },
      earth: {
        practice: 'Grounding and manifestation work',
        affirmation: 'I am rooted in presence and abundant in being',
        ritual: 'Garden of Self-Care'
      },
      aether: {
        practice: 'Integration and wholeness meditation',
        affirmation: 'I am the bridge between all worlds',
        ritual: 'Cosmic Bridge Meditation'
      }
    };

    return medicines[element];
  }
}