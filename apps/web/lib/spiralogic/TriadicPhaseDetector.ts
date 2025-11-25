/**
 * 🌀 TRIADIC PHASE DETECTOR
 *
 * Detects the three-state alchemical process within each element:
 * - Fire: Activating → Amplifying → Adapting
 * - Water: Sensing → Merging → Transcending
 * - Earth: Discipline → Stability → Adaptation
 * - Air: Balance → Concept → Exchange
 * - Aether: Emanation → Elevation → Equilibrium
 *
 * Correlates with astrological triadic architecture:
 * - Cardinal (Ingress/Source) - Ignition, condensation of intent
 * - Fixed (Integration/Crucible) - Containment, refinement under pressure
 * - Mutable (Egress/Distillation) - Release, transmission to next element
 *
 * Based on Chapter 10 of Elemental Alchemy by Kelly Nezat
 */

export type TriadicPhase = 'cardinal' | 'fixed' | 'mutable';
export type ElementalState = {
  fire: 'activating' | 'amplifying' | 'adapting';
  water: 'sensing' | 'merging' | 'transcending';
  earth: 'discipline' | 'stability' | 'adaptation';
  air: 'balance' | 'concept' | 'exchange';
  aether: 'emanation' | 'elevation' | 'equilibrium';
};

export interface TriadicDetection {
  element: 'fire' | 'water' | 'earth' | 'air' | 'aether';
  phase: TriadicPhase;
  state: string; // Specific elemental state
  confidence: number;
  indicators: string[];
  astrologicalCorrelation?: {
    modality: 'cardinal' | 'fixed' | 'mutable';
    sign?: string;
  };
  guidance: string;
}

/**
 * Language patterns that indicate each triadic phase
 */
const PHASE_PATTERNS = {
  cardinal: {
    keywords: [
      'starting', 'begin', 'new', 'initiate', 'spark', 'launch', 'ignite',
      'first', 'fresh', 'emerge', 'arise', 'birth', 'dawn', 'seed',
      'want to', 'feel called', 'vision', 'impulse', 'urge'
    ],
    energetics: ['urgency', 'impulse', 'initiation', 'ignition', 'conception']
  },

  fixed: {
    keywords: [
      'deepening', 'intensifying', 'containing', 'holding', 'sustaining',
      'pressure', 'refining', 'concentrating', 'focused', 'committed',
      'staying with', 'sitting in', 'enduring', 'persisting', 'building'
    ],
    energetics: ['intensity', 'depth', 'commitment', 'refinement', 'crucible']
  },

  mutable: {
    keywords: [
      'releasing', 'sharing', 'transmitting', 'teaching', 'completing',
      'dissolving', 'transforming', 'transitioning', 'adapting', 'flowing',
      'ready to share', 'want to tell', 'passing on', 'moving on', 'shifting'
    ],
    energetics: ['adaptation', 'transmission', 'release', 'completion', 'distillation']
  }
};

/**
 * Element-specific state indicators
 */
const ELEMENTAL_STATE_PATTERNS = {
  fire: {
    activating: ['spark', 'ignite', 'breakthrough', 'vision', 'passion arising', 'creative urge', 'new idea', 'inspired'],
    amplifying: ['burning bright', 'full force', 'expressing', 'performing', 'manifesting', 'shining', 'radiating'],
    adapting: ['sharing vision', 'teaching', 'passing the torch', 'inspiring others', 'transmission', 'completing the fire']
  },

  water: {
    sensing: ['feeling into', 'emotional awareness', 'intuitive hit', 'sensing something', 'emotion arising', 'heart opening'],
    merging: ['deep feeling', 'emotional immersion', 'flowing with', 'surrendering', 'letting go', 'crying', 'grief work'],
    transcending: ['emotional clarity', 'healed', 'forgiveness', 'peace', 'emotional wisdom', 'teaching from heart']
  },

  earth: {
    discipline: ['starting practice', 'building routine', 'grounding', 'committing to', 'structure', 'foundation'],
    stability: ['steady practice', 'consistent', 'embodied', 'rooted', 'stable', 'patient', 'enduring'],
    adaptation: ['practical wisdom', 'know what works', 'teach the practice', 'refined method', 'mastered', 'skilled']
  },

  air: {
    balance: ['seeking perspective', 'confused', 'questioning', 'exploring ideas', 'considering options', 'weighing'],
    concept: ['clarity', 'understanding', 'insight', 'mental breakthrough', 'seeing pattern', 'making sense'],
    exchange: ['want to discuss', 'sharing ideas', 'teaching', 'communicating', 'connecting concepts', 'explaining']
  },

  aether: {
    emanation: ['mystical', 'unity', 'oneness', 'divine', 'sacred moment', 'transcendent', 'touching infinity'],
    elevation: ['expanded awareness', 'cosmic consciousness', 'seeing the whole', 'unity vision', 'enlightenment'],
    equilibrium: ['integration', 'wholeness', 'all elements harmonized', 'balanced', 'complete', 'embodied divinity']
  }
};

export class TriadicPhaseDetector {
  /**
   * Detect triadic phase from conversation text and element
   */
  detectPhase(
    text: string,
    dominantElement: 'fire' | 'water' | 'earth' | 'air' | 'aether',
    conversationHistory?: any[]
  ): TriadicDetection {
    const textLower = text.toLowerCase();

    // Detect triadic phase (cardinal/fixed/mutable)
    const phaseScores = {
      cardinal: 0,
      fixed: 0,
      mutable: 0
    };

    // Score each phase based on language patterns
    for (const [phase, patterns] of Object.entries(PHASE_PATTERNS)) {
      const keywords = patterns.keywords;
      for (const keyword of keywords) {
        if (textLower.includes(keyword)) {
          phaseScores[phase as TriadicPhase] += 1;
        }
      }
    }

    // Determine dominant phase
    const detectedPhase = (Object.entries(phaseScores)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'cardinal') as TriadicPhase;

    // Detect specific elemental state
    const elementalStates = ELEMENTAL_STATE_PATTERNS[dominantElement];
    const stateScores: Record<string, number> = {};

    for (const [state, patterns] of Object.entries(elementalStates)) {
      stateScores[state] = 0;
      for (const pattern of patterns) {
        if (textLower.includes(pattern)) {
          stateScores[state] += 1;
        }
      }
    }

    const detectedState = Object.entries(stateScores)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || Object.keys(elementalStates)[0];

    // Calculate confidence based on pattern matches
    const totalMatches = Object.values(phaseScores).reduce((a, b) => a + b, 0) +
                        Object.values(stateScores).reduce((a, b) => a + b, 0);
    const confidence = Math.min(totalMatches / 5, 1.0);

    // Gather indicators
    const indicators = this.gatherIndicators(textLower, detectedPhase, detectedState);

    // Generate guidance
    const guidance = this.generateGuidance(dominantElement, detectedPhase, detectedState);

    // Astrological correlation
    const astrologicalCorrelation = this.getAstrologicalCorrelation(dominantElement, detectedPhase);

    return {
      element: dominantElement,
      phase: detectedPhase,
      state: detectedState,
      confidence,
      indicators,
      astrologicalCorrelation,
      guidance
    };
  }

  /**
   * Gather specific indicators found in text
   */
  private gatherIndicators(text: string, phase: TriadicPhase, state: string): string[] {
    const indicators: string[] = [];

    // Check phase patterns
    const phasePatterns = PHASE_PATTERNS[phase];
    for (const keyword of phasePatterns.keywords) {
      if (text.includes(keyword)) {
        indicators.push(`Phase: "${keyword}"`);
      }
    }

    return indicators.slice(0, 5); // Limit to top 5
  }

  /**
   * Generate guidance for current phase and state
   */
  private generateGuidance(
    element: 'fire' | 'water' | 'earth' | 'air' | 'aether',
    phase: TriadicPhase,
    state: string
  ): string {
    const phaseGuidance = {
      cardinal: "This is the ignition phase - honor the newness and urgency without rushing to completion.",
      fixed: "You're in the crucible - stay with the intensity and let the pressure refine what's emerging.",
      mutable: "This wants to be shared - you're ready to transmit what you've learned to others."
    };

    const elementalGuidance: Record<string, Record<string, string>> = {
      fire: {
        activating: "Fire is sparking vision - what wants to be born through you?",
        amplifying: "Fire is burning bright - express this creative force fully!",
        adapting: "Fire is ready to inspire - who needs to see your light?"
      },
      water: {
        sensing: "Water is awakening - what emotional truth is surfacing?",
        merging: "Water is flowing deeply - surrender to this healing current.",
        transcending: "Water has brought wisdom - what clarity emerged from the depths?"
      },
      earth: {
        discipline: "Earth is calling for commitment - what practice wants to ground you?",
        stability: "Earth is holding steady - trust the patience of embodied knowing.",
        adaptation: "Earth has brought mastery - share this practical wisdom."
      },
      air: {
        balance: "Air is seeking clarity - explore perspectives without forcing answers.",
        concept: "Air has brought insight - what mental pattern just revealed itself?",
        exchange: "Air wants connection - who would benefit from this understanding?"
      },
      aether: {
        emanation: "Aether is touching infinity - witness this sacred moment without grasping.",
        elevation: "Aether is expanding awareness - you're seeing from cosmic perspective.",
        equilibrium: "Aether has brought integration - all elements are harmonizing in wholeness."
      }
    };

    return `${phaseGuidance[phase]} ${elementalGuidance[element]?.[state] || ''}`;
  }

  /**
   * Map phase to astrological correlation
   */
  private getAstrologicalCorrelation(
    element: 'fire' | 'water' | 'earth' | 'air' | 'aether',
    phase: TriadicPhase
  ): { modality: TriadicPhase; sign?: string } {
    const astroMap: Record<string, Record<TriadicPhase, string>> = {
      fire: {
        cardinal: 'Aries', // Ignition
        fixed: 'Leo',     // Selfhood
        mutable: 'Sagittarius' // Transmission
      },
      water: {
        cardinal: 'Cancer', // Containment
        fixed: 'Scorpio',  // Intensity
        mutable: 'Pisces'  // Dissolution
      },
      earth: {
        cardinal: 'Capricorn', // Structure
        fixed: 'Taurus',      // Embodiment
        mutable: 'Virgo'      // Refinement
      },
      air: {
        cardinal: 'Libra',    // Relation
        fixed: 'Aquarius',    // Abstraction
        mutable: 'Gemini'     // Exchange
      },
      aether: {
        cardinal: 'Unity arising',
        fixed: 'Unity deepening',
        mutable: 'Unity integrating'
      }
    };

    return {
      modality: phase,
      sign: astroMap[element]?.[phase]
    };
  }

  /**
   * Detect phase transitions - when someone is moving from one phase to another
   */
  detectTransition(
    currentDetection: TriadicDetection,
    previousDetections: TriadicDetection[]
  ): {
    isTransitioning: boolean;
    from?: TriadicPhase;
    to?: TriadicPhase;
    significance: 'minor' | 'major' | 'elemental-shift';
  } | null {
    if (!previousDetections.length) return null;

    const lastDetection = previousDetections[previousDetections.length - 1];

    // Check if phase changed
    if (currentDetection.phase !== lastDetection.phase) {
      // Mutable → Cardinal is a major transition (new element often)
      const isMajor = lastDetection.phase === 'mutable' && currentDetection.phase === 'cardinal';

      // Also check if element changed
      const elementChanged = currentDetection.element !== lastDetection.element;

      return {
        isTransitioning: true,
        from: lastDetection.phase,
        to: currentDetection.phase,
        significance: elementChanged ? 'elemental-shift' : (isMajor ? 'major' : 'minor')
      };
    }

    return null;
  }
}
