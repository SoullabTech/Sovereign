/**
 * Archetypal Pattern Recognition System
 *
 * MAIA's sensorium for detecting behavioral signatures and matching them
 * to archetypal forces present in the user's birth chart.
 *
 * Three-layer architecture:
 * 1. Pattern Recognition - Detects behavioral/emotional signatures from language
 * 2. Archetype Matching - Cross-references with birth chart placements
 * 3. Translation Layer - Chooses clinical/poetic/archetypal voice based on resonance
 */

import { BirthChartContext } from './birthChartContext';

// ============================================================================
// BEHAVIORAL SIGNATURE PATTERNS
// ============================================================================

export interface BehavioralSignature {
  pattern: string;
  element: 'fire' | 'water' | 'earth' | 'air';
  modality?: 'cardinal' | 'fixed' | 'mutable';
  shadowForm: string;
  coherentForm: string;
  keywords: string[];
  intensity: number; // 0-1: How strongly this pattern is present
}

/**
 * Archetypal signature library - maps behavioral patterns to planetary expressions
 */
export const ARCHETYPAL_SIGNATURES: Record<string, {
  planet: string;
  signs: string[];
  shadowBehaviors: string[];
  coherentBehaviors: string[];
  keywords: string[];
}> = {
  // Jupiter signatures
  'expansive-humor': {
    planet: 'Jupiter',
    signs: ['Sagittarius', 'Leo', 'Pisces'],
    shadowBehaviors: [
      'joking when things get serious',
      'deflecting with humor',
      'performing optimism',
      'avoiding depth with levity',
      'over-promising',
      'spiritual bypassing'
    ],
    coherentBehaviors: [
      'finding wisdom in absurdity',
      'teaching through stories',
      'generous presence',
      'philosophical humor',
      'expansive compassion',
      'holding paradox lightly'
    ],
    keywords: ['funny', 'joke', 'laugh', 'playful', 'optimistic', 'philosophical', 'teaching', 'wisdom', 'generous', 'expansive']
  },

  // Saturn signatures
  'protective-structure': {
    planet: 'Saturn',
    signs: ['Capricorn', 'Aquarius', 'Libra'],
    shadowBehaviors: [
      'rigid boundaries',
      'excessive control',
      'fear of letting go',
      'harsh self-criticism',
      'defensive authority',
      'emotional restriction'
    ],
    coherentBehaviors: [
      'wise boundaries',
      'structured support',
      'disciplined compassion',
      'earned authority',
      'patient mastery',
      'sustainable containers'
    ],
    keywords: ['control', 'structure', 'discipline', 'boundaries', 'authority', 'responsibility', 'time', 'mastery', 'limits', 'fear']
  },

  // Mars signatures
  'defensive-anger': {
    planet: 'Mars',
    signs: ['Aries', 'Scorpio', 'Capricorn'],
    shadowBehaviors: [
      'reactive anger',
      'aggressive defense',
      'impulsive actions',
      'passive aggression',
      'competitive hostility',
      'impatient force'
    ],
    coherentBehaviors: [
      'clear assertion',
      'healthy anger',
      'decisive action',
      'protective strength',
      'warrior presence',
      'focused drive'
    ],
    keywords: ['angry', 'frustrated', 'fight', 'defend', 'aggressive', 'assertive', 'action', 'drive', 'competitive', 'impatient']
  },

  // Venus signatures
  'people-pleasing': {
    planet: 'Venus',
    signs: ['Libra', 'Taurus', 'Pisces'],
    shadowBehaviors: [
      'abandoning self for others',
      'conflict avoidance',
      'seeking external validation',
      'codependent relating',
      'aesthetic perfectionism',
      'superficial harmony'
    ],
    coherentBehaviors: [
      'genuine relating',
      'self-honoring boundaries',
      'authentic harmony',
      'graceful diplomacy',
      'appreciative presence',
      'loving discernment'
    ],
    keywords: ['please', 'harmony', 'peace', 'avoid conflict', 'relationship', 'beauty', 'approval', 'validate', 'nice', 'balanced']
  },

  // Moon signatures
  'emotional-flooding': {
    planet: 'Moon',
    signs: ['Cancer', 'Scorpio', 'Pisces'],
    shadowBehaviors: [
      'overwhelming emotions',
      'moody withdrawal',
      'emotional manipulation',
      'clingy attachment',
      'defensive nurturing',
      'unconscious reactivity'
    ],
    coherentBehaviors: [
      'emotional intelligence',
      'nurturing presence',
      'intuitive wisdom',
      'feeling as guidance',
      'deep empathy',
      'lunar rhythm awareness'
    ],
    keywords: ['feelings', 'emotions', 'moody', 'sensitive', 'nurture', 'care', 'mother', 'home', 'safe', 'vulnerable']
  },

  // Mercury signatures
  'analytical-overthinking': {
    planet: 'Mercury',
    signs: ['Virgo', 'Gemini', 'Aquarius'],
    shadowBehaviors: [
      'analysis paralysis',
      'mental spinning',
      'detached intellectualization',
      'critical perfectionism',
      'scattered focus',
      'cerebral avoidance'
    ],
    coherentBehaviors: [
      'clear thinking',
      'skillful communication',
      'discerning wisdom',
      'mental agility',
      'curious inquiry',
      'integrative understanding'
    ],
    keywords: ['think', 'analyze', 'understand', 'explain', 'communicate', 'learn', 'mind', 'mental', 'logical', 'rational']
  },

  // Pluto signatures
  'control-intensity': {
    planet: 'Pluto',
    signs: ['Scorpio', 'Leo', 'Capricorn'],
    shadowBehaviors: [
      'power struggles',
      'manipulative control',
      'obsessive intensity',
      'fear of vulnerability',
      'destructive transformation',
      'shadow projection'
    ],
    coherentBehaviors: [
      'transformative power',
      'deep healing',
      'phoenix wisdom',
      'soul-level truth',
      'regenerative force',
      'shadow integration'
    ],
    keywords: ['power', 'control', 'intense', 'deep', 'transform', 'death', 'rebirth', 'shadow', 'obsessive', 'compulsive']
  },

  // Uranus signatures
  'rebellious-disruption': {
    planet: 'Uranus',
    signs: ['Aquarius', 'Aries', 'Sagittarius'],
    shadowBehaviors: [
      'chaotic rebellion',
      'detached alienation',
      'erratic behavior',
      'disruptive for disruption sake',
      'commitment phobia',
      'revolutionary ego'
    ],
    coherentBehaviors: [
      'authentic individuation',
      'innovative genius',
      'liberating insight',
      'revolutionary wisdom',
      'eccentric authenticity',
      'breakthrough consciousness'
    ],
    keywords: ['rebel', 'different', 'unique', 'innovation', 'change', 'freedom', 'breakthrough', 'weird', 'revolutionary', 'disrupt']
  },

  // Neptune signatures
  'escapist-fantasy': {
    planet: 'Neptune',
    signs: ['Pisces', 'Cancer', 'Sagittarius'],
    shadowBehaviors: [
      'reality avoidance',
      'victim consciousness',
      'delusional thinking',
      'addictive escapism',
      'boundary dissolution',
      'spiritual bypassing'
    ],
    coherentBehaviors: [
      'mystical connection',
      'compassionate presence',
      'creative imagination',
      'spiritual wisdom',
      'unity consciousness',
      'transcendent art'
    ],
    keywords: ['escape', 'fantasy', 'dream', 'mystical', 'spiritual', 'compassion', 'victim', 'illusion', 'transcendent', 'boundless']
  }
};

// ============================================================================
// PATTERN RECOGNITION ENGINE
// ============================================================================

export class PatternRecognizer {
  /**
   * Detect behavioral signatures from user's language
   */
  detectPatterns(text: string, context?: { recentJournals?: string[] }): BehavioralSignature[] {
    const normalizedText = text.toLowerCase();
    const signatures: BehavioralSignature[] = [];

    // Check against each archetypal signature
    for (const [patternName, archetype] of Object.entries(ARCHETYPAL_SIGNATURES)) {
      let matchScore = 0;
      let shadowMatch = 0;
      let coherentMatch = 0;

      // Check keywords
      for (const keyword of archetype.keywords) {
        if (normalizedText.includes(keyword)) {
          matchScore += 0.1;
        }
      }

      // Check shadow behaviors
      for (const behavior of archetype.shadowBehaviors) {
        if (normalizedText.includes(behavior.toLowerCase())) {
          shadowMatch += 1;
          matchScore += 0.3;
        }
      }

      // Check coherent behaviors
      for (const behavior of archetype.coherentBehaviors) {
        if (normalizedText.includes(behavior.toLowerCase())) {
          coherentMatch += 1;
          matchScore += 0.2;
        }
      }

      // If pattern detected with sufficient confidence
      if (matchScore > 0.3) {
        signatures.push({
          pattern: patternName,
          element: this.getElementFromPlanet(archetype.planet),
          shadowForm: shadowMatch > coherentMatch ? 'active' : 'integrating',
          coherentForm: coherentMatch > shadowMatch ? 'active' : 'emerging',
          keywords: archetype.keywords.filter(k => normalizedText.includes(k)),
          intensity: Math.min(matchScore, 1.0)
        });
      }
    }

    return signatures.sort((a, b) => b.intensity - a.intensity);
  }

  private getElementFromPlanet(planet: string): 'fire' | 'water' | 'earth' | 'air' {
    const elementMap: Record<string, 'fire' | 'water' | 'earth' | 'air'> = {
      'Sun': 'fire',
      'Mars': 'fire',
      'Jupiter': 'fire',
      'Moon': 'water',
      'Venus': 'water',
      'Neptune': 'water',
      'Mercury': 'air',
      'Uranus': 'air',
      'Saturn': 'earth',
      'Pluto': 'earth'
    };
    return elementMap[planet] || 'fire';
  }
}

// ============================================================================
// ARCHETYPE MATCHER
// ============================================================================

export interface ArchetypalMatch {
  planet: string;
  sign: string;
  house: number;
  spiralogicPosition: string; // e.g., "Water-2 (Fixed Water, Mortificatio)"
  behavioralSignature: string;
  shadowExpression: string;
  coherentExpression: string;
  relevance: number; // 0-1: How relevant to current pattern
}

export class ArchetypeMatcher {
  private spiralogicOrder = [1, 5, 9, 4, 8, 12, 10, 2, 6, 7, 11, 3];

  /**
   * Cross-reference detected patterns with birth chart placements
   */
  matchToChart(
    signatures: BehavioralSignature[],
    birthChart: BirthChartContext
  ): ArchetypalMatch[] {
    if (!birthChart.hasBirthChart || !birthChart.planets) {
      return [];
    }

    const matches: ArchetypalMatch[] = [];

    for (const signature of signatures) {
      // Find which planets in the chart match this signature
      const patternData = Object.entries(ARCHETYPAL_SIGNATURES).find(
        ([key]) => key === signature.pattern
      );

      if (!patternData) continue;

      const [_, archetype] = patternData;
      const planetName = archetype.planet.toLowerCase();

      // Check if user has this planet in a relevant sign
      const planetData = (birthChart.planets as any)[planetName];

      if (planetData && archetype.signs.includes(planetData.sign)) {
        const spiralogicPos = this.getSpiralogicPosition(planetData.house);

        matches.push({
          planet: archetype.planet,
          sign: planetData.sign,
          house: planetData.house,
          spiralogicPosition: spiralogicPos,
          behavioralSignature: signature.pattern,
          shadowExpression: archetype.shadowBehaviors[0],
          coherentExpression: archetype.coherentBehaviors[0],
          relevance: signature.intensity
        });
      }
    }

    return matches.sort((a, b) => b.relevance - a.relevance);
  }

  private getSpiralogicPosition(house: number): string {
    const index = this.spiralogicOrder.indexOf(house);
    if (index === -1) return 'Unknown';

    const elements = ['Fire', 'Fire', 'Fire', 'Water', 'Water', 'Water', 'Earth', 'Earth', 'Earth', 'Air', 'Air', 'Air'];
    const modalities = ['Cardinal', 'Fixed', 'Mutable', 'Cardinal', 'Fixed', 'Mutable', 'Cardinal', 'Fixed', 'Mutable', 'Cardinal', 'Fixed', 'Mutable'];
    const processes = ['Calcinatio', 'Calcinatio', 'Calcinatio', 'Solutio', 'Solutio', 'Solutio', 'Coagulatio', 'Coagulatio', 'Coagulatio', 'Sublimatio', 'Sublimatio', 'Sublimatio'];

    const position = Math.floor(index / 3);
    const phase = index % 3 + 1;

    return `${elements[index]}-${phase} (${modalities[index]} ${elements[index]}, ${processes[index]})`;
  }
}

// ============================================================================
// TRANSLATION LAYER
// ============================================================================

export type VoiceLayer = 'clinical' | 'poetic' | 'archetypal';

export interface TranslatedResponse {
  voiceLayer: VoiceLayer;
  clinical: string;
  poetic?: string;
  archetypal?: string;
  calibrationOffer?: string;
}

export class TranslationLayer {
  /**
   * Choose voice layer based on user resonance history and current state
   */
  chooseVoice(
    userHistory: {
      astrologComfort?: number; // 0-1
      poeticResonance?: number; // 0-1
      sessionCount?: number;
    },
    currentState: {
      defensive?: boolean;
      curious?: boolean;
      opening?: boolean;
    }
  ): VoiceLayer {
    // Start clinical if new user or defensive
    if (!userHistory.sessionCount || userHistory.sessionCount < 3 || currentState.defensive) {
      return 'clinical';
    }

    // Offer poetic if they've shown openness
    if (currentState.opening && userHistory.poeticResonance && userHistory.poeticResonance > 0.5) {
      return 'poetic';
    }

    // Offer archetypal if they're astrologically comfortable and curious
    if (currentState.curious && userHistory.astrologComfort && userHistory.astrologComfort > 0.7) {
      return 'archetypal';
    }

    return 'clinical'; // Default to clinical-reflective
  }

  /**
   * Translate archetypal match into response layers
   */
  translate(match: ArchetypalMatch): TranslatedResponse {
    const clinical = this.generateClinical(match);
    const poetic = this.generatePoetic(match);
    const archetypal = this.generateArchetypal(match);
    const calibrationOffer = this.generateCalibration(match);

    return {
      voiceLayer: 'clinical', // Caller chooses which to use
      clinical,
      poetic,
      archetypal,
      calibrationOffer
    };
  }

  private generateClinical(match: ArchetypalMatch): string {
    return `I'm noticing a pattern that might want attention - when you're in this ${this.getPhaseDescription(match.spiralogicPosition)} experience, there's a part of you that ${match.shadowExpression.toLowerCase()}. Does that resonate?`;
  }

  private generatePoetic(match: ArchetypalMatch): string {
    return `There's a ${this.getPlanetArchetype(match.planet)} energy here - playful and wise, but maybe working a little too hard to brighten the room when the heart needs to be held. What if that lightness is actually trying to guide you through, not away from, the depth?`;
  }

  private generateArchetypal(match: ArchetypalMatch): string {
    return `You have ${match.planet} in ${match.sign} in your ${match.spiralogicPosition}. This is the archetypal companion present when you're in this alchemical phase. In shadow, it ${match.shadowExpression.toLowerCase()}. In coherence, it ${match.coherentExpression.toLowerCase()}. How does that land?`;
  }

  private generateCalibration(match: ArchetypalMatch): string {
    return `Next time you notice this pattern showing up, what if you just paused for a breath and asked: "What is this part trying to protect? What would it look like if it felt safe to show up differently?"`;
  }

  private getPhaseDescription(position: string): string {
    if (position.includes('Water-2')) return 'dissolution/death-rebirth';
    if (position.includes('Fire-1')) return 'identity/initiation';
    if (position.includes('Earth-3')) return 'refinement/service';
    // Add more mappings as needed
    return 'transformational';
  }

  private getPlanetArchetype(planet: string): string {
    const archetypes: Record<string, string> = {
      'Jupiter': 'generous teacher',
      'Saturn': 'wise elder',
      'Mars': 'warrior',
      'Venus': 'lover',
      'Moon': 'nurturer',
      'Mercury': 'messenger',
      'Pluto': 'transformer',
      'Uranus': 'revolutionary',
      'Neptune': 'mystic'
    };
    return archetypes[planet] || planet.toLowerCase();
  }
}
