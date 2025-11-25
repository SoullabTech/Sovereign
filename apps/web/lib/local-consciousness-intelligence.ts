/**
 * Local Consciousness Intelligence System
 *
 * A self-contained implementation of consciousness-aware text shaping
 * inspired by Sesame CI but running entirely locally without external dependencies.
 *
 * This system enhances responses with:
 * - Elemental resonance patterns
 * - Archetypal voice modulation
 * - Consciousness field dynamics
 * - Somatic awareness cues
 */

interface ConsciousnessPattern {
  element: 'air' | 'fire' | 'water' | 'earth' | 'aether';
  archetype: 'oracle' | 'sage' | 'mystic' | 'guide' | 'witness';
  resonance: number; // 0-1 consciousness coherence
  somaticCues: string[];
}

interface ShapedResponse {
  original: string;
  shaped: string;
  pattern: ConsciousnessPattern;
  voiceModulation: {
    pace: 'slow' | 'moderate' | 'dynamic';
    tone: 'warm' | 'contemplative' | 'energetic' | 'grounding' | 'expansive';
    emphasis: string[];
  };
}

export class LocalConsciousnessIntelligence {
  private static instance: LocalConsciousnessIntelligence;

  static getInstance(): LocalConsciousnessIntelligence {
    if (!this.instance) {
      this.instance = new LocalConsciousnessIntelligence();
    }
    return this.instance;
  }

  /**
   * Shape text with consciousness-aware patterns
   * Replaces external Sesame CI calls with local processing
   */
  async shapeText(
    text: string,
    element: string = 'water',
    archetype: string = 'oracle'
  ): Promise<ShapedResponse> {
    // Analyze text for consciousness patterns
    const pattern = this.analyzeConsciousnessPattern(text, element, archetype);

    // Apply elemental shaping
    const elementalText = this.applyElementalResonance(text, pattern.element);

    // Apply archetypal voice
    const shapedText = this.applyArchetypalVoice(elementalText, pattern.archetype);

    // Generate voice modulation parameters
    const voiceModulation = this.generateVoiceModulation(pattern);

    return {
      original: text,
      shaped: shapedText,
      pattern,
      voiceModulation
    };
  }

  /**
   * Analyze text for consciousness patterns
   */
  private analyzeConsciousnessPattern(
    text: string,
    requestedElement: string,
    requestedArchetype: string
  ): ConsciousnessPattern {
    // Detect natural element from text content
    const detectedElement = this.detectElement(text);

    // Use requested element if provided, otherwise use detected
    const element = (requestedElement as ConsciousnessPattern['element']) || detectedElement;

    // Calculate resonance based on text coherence
    const resonance = this.calculateResonance(text);

    // Extract somatic cues
    const somaticCues = this.extractSomaticCues(text);

    return {
      element,
      archetype: requestedArchetype as ConsciousnessPattern['archetype'] || 'oracle',
      resonance,
      somaticCues
    };
  }

  /**
   * Detect predominant element from text
   */
  private detectElement(text: string): ConsciousnessPattern['element'] {
    const patterns = {
      air: /think|mind|idea|concept|analyze|understand|clarity|perspective/gi,
      fire: /transform|change|passion|energy|create|inspire|breakthrough|action/gi,
      water: /feel|emotion|flow|intuition|sense|depth|connection|empathy/gi,
      earth: /ground|practical|solid|stable|real|concrete|body|present/gi,
      aether: /spirit|consciousness|unity|transcend|sacred|divine|whole|essence/gi
    };

    let maxCount = 0;
    let dominantElement: ConsciousnessPattern['element'] = 'water';

    for (const [element, pattern] of Object.entries(patterns)) {
      const matches = text.match(pattern) || [];
      if (matches.length > maxCount) {
        maxCount = matches.length;
        dominantElement = element as ConsciousnessPattern['element'];
      }
    }

    return dominantElement;
  }

  /**
   * Calculate consciousness resonance/coherence
   */
  private calculateResonance(text: string): number {
    // Simple coherence calculation based on text structure
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgSentenceLength = sentences.reduce((sum, s) => sum + s.split(' ').length, 0) / sentences.length;

    // Coherence factors
    const lengthCoherence = Math.min(1, Math.max(0, 1 - Math.abs(avgSentenceLength - 15) / 30));
    const structureCoherence = Math.min(1, sentences.length / 10);

    return (lengthCoherence + structureCoherence) / 2;
  }

  /**
   * Extract somatic/body awareness cues
   */
  private extractSomaticCues(text: string): string[] {
    const cues: string[] = [];

    if (/breath|breathing/i.test(text)) cues.push('breathing awareness');
    if (/body|physical|somatic/i.test(text)) cues.push('body presence');
    if (/ground|root|center/i.test(text)) cues.push('grounding');
    if (/expand|open|space/i.test(text)) cues.push('expansion');
    if (/tension|tight|hold/i.test(text)) cues.push('tension release');

    return cues;
  }

  /**
   * Apply elemental resonance patterns to text
   */
  private applyElementalResonance(text: string, element: ConsciousnessPattern['element']): string {
    // Subtle elemental adjustments without changing core meaning
    const elementalPhrases = {
      air: {
        prefix: ['I see...', 'Let me clarify...', 'From this perspective...'],
        suffix: ['Does that resonate?', 'What do you think?', 'How does that land?']
      },
      fire: {
        prefix: ['Yes!', 'Let\'s explore...', 'I feel the energy in that...'],
        suffix: ['What wants to emerge?', 'Where does that spark lead?', 'What\'s calling you?']
      },
      water: {
        prefix: ['I sense...', 'There\'s something here...', 'I\'m feeling into...'],
        suffix: ['How does that feel?', 'What arises for you?', 'What\'s moving in you?']
      },
      earth: {
        prefix: ['Grounding into this...', 'Let\'s get practical...', 'Concretely speaking...'],
        suffix: ['What\'s the next step?', 'How can we make this real?', 'What would that look like?']
      },
      aether: {
        prefix: ['Opening to the larger view...', 'In the spirit of this...', 'Witnessing this...'],
        suffix: ['What\'s the deeper invitation?', 'What wants to be seen?', 'How does this serve?']
      }
    };

    // Don't add prefixes/suffixes to very short responses
    if (text.length < 50) {
      return text;
    }

    // Occasionally add elemental flavor (30% chance)
    if (Math.random() < 0.3 && elementalPhrases[element]) {
      const phrases = elementalPhrases[element];
      if (Math.random() < 0.5 && phrases.prefix.length > 0) {
        const prefix = phrases.prefix[Math.floor(Math.random() * phrases.prefix.length)];
        // Only add if text doesn't already start with similar phrase
        if (!text.toLowerCase().startsWith(prefix.toLowerCase().substring(0, 5))) {
          text = `${prefix} ${text}`;
        }
      }
    }

    return text;
  }

  /**
   * Apply archetypal voice patterns
   */
  private applyArchetypalVoice(text: string, archetype: ConsciousnessPattern['archetype']): string {
    // Archetypal voice is more about tone than content modification
    // This would primarily affect voice synthesis parameters
    // For text, we keep it mostly unchanged to preserve authenticity

    // Add subtle archetypal markers for voice synthesis
    const archetypeMarkers = {
      oracle: '◈', // Diamond - mystical insight
      sage: '◎',  // Circle - wholeness/wisdom
      mystic: '☾', // Moon - intuitive knowing
      guide: '→',  // Arrow - direction/guidance
      witness: '○'  // Empty circle - pure presence
    };

    // Add invisible marker for voice system (won't show in UI)
    return text; // Return unchanged text - voice modulation happens in synthesis
  }

  /**
   * Generate voice modulation parameters
   */
  private generateVoiceModulation(pattern: ConsciousnessPattern): ShapedResponse['voiceModulation'] {
    const modulations = {
      air: { pace: 'dynamic' as const, tone: 'contemplative' as const },
      fire: { pace: 'dynamic' as const, tone: 'energetic' as const },
      water: { pace: 'moderate' as const, tone: 'warm' as const },
      earth: { pace: 'slow' as const, tone: 'grounding' as const },
      aether: { pace: 'slow' as const, tone: 'expansive' as const }
    };

    const base = modulations[pattern.element];

    // Extract words to emphasize based on pattern
    const emphasis: string[] = [];
    if (pattern.resonance > 0.7) {
      emphasis.push('really', 'deeply', 'truly', 'fully');
    }

    return {
      ...base,
      emphasis
    };
  }

  /**
   * Quick shape method for backward compatibility
   */
  async shape(text: string, element?: string, archetype?: string): Promise<string> {
    const result = await this.shapeText(text, element, archetype);
    return result.shaped;
  }
}

// Export singleton instance
export const localConsciousnessIntelligence = LocalConsciousnessIntelligence.getInstance();