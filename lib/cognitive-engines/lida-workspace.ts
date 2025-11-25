// lib/cognitive-engines/lida-workspace.ts
/**
 * LIDA Workspace - Global Workspace Model for Conscious Attention
 * Based on Stan Franklin's LIDA architecture for conscious attention processing
 * Integrates with Spiralogic consciousness framework
 */

interface PerceptualCue {
  content: string;
  type: 'spiritual' | 'emotional' | 'cognitive' | 'somatic' | 'archetypal';
  intensity: number;
  relevance: number;
  elementalResonance: Element[];
  consciousnessLevel: number;
}

interface AttentionState {
  focusedContent: PerceptualCue[];
  attentionIntensity: number;
  globalBroadcast: boolean;
  consciousThreshold: number;
  elementalBalance: ElementalBalance;
  archetypalActivation: ArchetypalActivation;
}

interface ElementalBalance {
  fire: number;    // 0-1: Vision, breakthrough, catalytic energy
  water: number;   // 0-1: Emotion, intuition, flow
  earth: number;   // 0-1: Grounding, embodiment, stability  
  air: number;     // 0-1: Clarity, communication, insight
  aether: number;  // 0-1: Transcendence, mystery, archetypal wisdom
}

interface ArchetypalActivation {
  sage: number;        // Wise teacher, philosophical guidance
  oracle: number;      // Prophetic insight, divination
  healer: number;      // Emotional healing, sacred medicine
  warrior: number;     // Courageous action, protective strength
  lover: number;       // Heart opening, connection, passion
  creator: number;     // Artistic expression, innovation
  innocent: number;    // Purity, wonder, fresh perspective
  explorer: number;    // Adventure, discovery, boundary expansion
  ruler: number;       // Leadership, organization, authority
  caregiver: number;   // Nurturing, service, compassion
  jester: number;      // Humor, lightness, perspective shifting
  magician: number;    // Transformation, manifestation, alchemy
}

export class LIDAWorkspace {
  private consciousThreshold: number = 0.6; // Threshold for conscious awareness
  private maxAttentionItems: number = 7;    // Miller's magic number ±2
  private decayRate: number = 0.95;         // Attention decay over time
  
  // Spiritual/consciousness-aware processing patterns
  private spiritualPatterns = {
    seeking: ['lost', 'searching', 'meaning', 'purpose', 'direction', 'path'],
    awakening: ['awareness', 'consciousness', 'awakening', 'enlightenment', 'realization'],
    shadow: ['dark', 'hidden', 'fear', 'shame', 'rejection', 'suppressed'],
    integration: ['wholeness', 'balance', 'harmony', 'integration', 'unity'],
    transcendence: ['beyond', 'transcend', 'spiritual', 'divine', 'sacred', 'mystical']
  };

  private emotionalPatterns = {
    joy: ['happy', 'joy', 'bliss', 'ecstatic', 'celebration', 'gratitude'],
    sadness: ['sad', 'grief', 'loss', 'mourning', 'melancholy', 'sorrow'],
    anger: ['angry', 'rage', 'fury', 'frustration', 'irritation', 'resentment'],
    fear: ['afraid', 'fear', 'anxiety', 'worry', 'panic', 'terror'],
    surprise: ['surprised', 'amazed', 'shocked', 'wonder', 'awe', 'astonishment']
  };

  private archetypalPatterns = {
    sage: ['wisdom', 'knowledge', 'understanding', 'teaching', 'philosophy'],
    oracle: ['prophecy', 'divination', 'vision', 'foresight', 'intuition'],
    healer: ['healing', 'medicine', 'recovery', 'restoration', 'wellness'],
    warrior: ['courage', 'battle', 'strength', 'protection', 'defense'],
    lover: ['love', 'passion', 'connection', 'intimacy', 'relationship'],
    creator: ['create', 'art', 'innovation', 'imagination', 'expression'],
    innocent: ['pure', 'innocent', 'wonder', 'childlike', 'fresh'],
    explorer: ['adventure', 'explore', 'discover', 'journey', 'quest'],
    ruler: ['leadership', 'authority', 'control', 'organize', 'command'],
    caregiver: ['care', 'nurture', 'service', 'help', 'support'],
    jester: ['humor', 'joke', 'laugh', 'play', 'lighthearted'],
    magician: ['magic', 'transform', 'manifest', 'alchemy', 'miracle']
  };

  /**
   * Main LIDA processing: Focus conscious attention on most relevant perceptual cues
   */
  async focusConsciousAttention(
    userInput: string,
    consciousnessProfile: ConsciousnessProfile
  ): Promise<AttentionState> {
    
    // 1. Extract perceptual cues from input
    const perceptualCues = this.extractPerceptualCues(userInput, consciousnessProfile);
    
    // 2. Competition for conscious attention (global workspace)
    const competitionResults = this.globalWorkspaceCompetition(
      perceptualCues, 
      consciousnessProfile
    );
    
    // 3. Focus attention on winning cues
    const focusedContent = this.selectConsciousContent(
      competitionResults,
      consciousnessProfile.consciousnessLevel
    );
    
    // 4. Calculate elemental balance from focused content
    const elementalBalance = this.calculateElementalBalance(focusedContent);
    
    // 5. Determine archetypal activation
    const archetypalActivation = this.calculateArchetypalActivation(focusedContent);
    
    // 6. Determine if global broadcast should occur
    const globalBroadcast = this.shouldBroadcastGlobally(
      focusedContent,
      consciousnessProfile.consciousnessLevel
    );

    return {
      focusedContent,
      attentionIntensity: this.calculateAttentionIntensity(focusedContent),
      globalBroadcast,
      consciousThreshold: this.consciousThreshold,
      elementalBalance,
      archetypalActivation
    };
  }

  /**
   * Extract perceptual cues from user input with consciousness awareness
   */
  private extractPerceptualCues(
    input: string,
    consciousness: ConsciousnessProfile
  ): PerceptualCue[] {
    const cues: PerceptualCue[] = [];
    const inputLower = input.toLowerCase();
    const words = inputLower.split(/\s+/);
    
    // Extract spiritual cues
    for (const [category, patterns] of Object.entries(this.spiritualPatterns)) {
      const matches = patterns.filter(pattern => inputLower.includes(pattern));
      if (matches.length > 0) {
        cues.push({
          content: `Spiritual theme: ${category} (${matches.join(', ')})`,
          type: 'spiritual',
          intensity: matches.length * 0.8,
          relevance: this.calculateRelevance(category, consciousness),
          elementalResonance: this.getElementalResonance(category),
          consciousnessLevel: consciousness.consciousnessLevel
        });
      }
    }
    
    // Extract emotional cues  
    for (const [emotion, patterns] of Object.entries(this.emotionalPatterns)) {
      const matches = patterns.filter(pattern => inputLower.includes(pattern));
      if (matches.length > 0) {
        cues.push({
          content: `Emotional state: ${emotion} (${matches.join(', ')})`,
          type: 'emotional',
          intensity: matches.length * 0.9,
          relevance: this.calculateEmotionalRelevance(emotion, consciousness),
          elementalResonance: this.getEmotionalElementalResonance(emotion),
          consciousnessLevel: consciousness.consciousnessLevel
        });
      }
    }
    
    // Extract archetypal cues
    for (const [archetype, patterns] of Object.entries(this.archetypalPatterns)) {
      const matches = patterns.filter(pattern => inputLower.includes(pattern));
      if (matches.length > 0) {
        cues.push({
          content: `Archetypal activation: ${archetype} (${matches.join(', ')})`,
          type: 'archetypal',
          intensity: matches.length * 0.7,
          relevance: this.calculateArchetypalRelevance(archetype, consciousness),
          elementalResonance: this.getArchetypalElementalResonance(archetype),
          consciousnessLevel: consciousness.consciousnessLevel
        });
      }
    }
    
    // Extract cognitive complexity cues
    const cognitiveComplexity = this.assessCognitiveComplexity(words);
    if (cognitiveComplexity.level > 0.3) {
      cues.push({
        content: `Cognitive complexity: ${cognitiveComplexity.description}`,
        type: 'cognitive',
        intensity: cognitiveComplexity.level,
        relevance: cognitiveComplexity.level * consciousness.consciousnessLevel,
        elementalResonance: ['air'], // Air element for mental clarity
        consciousnessLevel: consciousness.consciousnessLevel
      });
    }
    
    return cues;
  }

  /**
   * Global workspace competition - cues compete for conscious attention
   */
  private globalWorkspaceCompetition(
    cues: PerceptualCue[],
    consciousness: ConsciousnessProfile
  ): PerceptualCue[] {
    
    // Calculate competition scores based on intensity, relevance, and consciousness alignment
    const scoredCues = cues.map(cue => ({
      ...cue,
      competitionScore: this.calculateCompetitionScore(cue, consciousness)
    }));
    
    // Sort by competition score (highest first)
    scoredCues.sort((a, b) => b.competitionScore - a.competitionScore);
    
    // Apply consciousness threshold - only cues above threshold can win
    const consciousThreshold = this.consciousThreshold * consciousness.consciousnessLevel;
    
    return scoredCues.filter(cue => cue.competitionScore >= consciousThreshold);
  }

  /**
   * Select content that reaches conscious awareness
   */
  private selectConsciousContent(
    competitionResults: PerceptualCue[],
    consciousnessLevel: number
  ): PerceptualCue[] {
    
    // Adjust max attention based on consciousness level
    // Higher consciousness = can hold more complexity in awareness
    const adjustedMaxAttention = Math.floor(
      this.maxAttentionItems * (0.5 + consciousnessLevel * 0.5)
    );
    
    return competitionResults.slice(0, adjustedMaxAttention);
  }

  /**
   * Calculate elemental balance from conscious content
   */
  private calculateElementalBalance(focusedContent: PerceptualCue[]): ElementalBalance {
    const balance: ElementalBalance = {
      fire: 0, water: 0, earth: 0, air: 0, aether: 0
    };
    
    let totalIntensity = 0;
    
    focusedContent.forEach(cue => {
      cue.elementalResonance.forEach(element => {
        balance[element] += cue.intensity;
        totalIntensity += cue.intensity;
      });
    });
    
    // Normalize to 0-1 range
    if (totalIntensity > 0) {
      Object.keys(balance).forEach(element => {
        balance[element as Element] = balance[element as Element] / totalIntensity;
      });
    }
    
    return balance;
  }

  /**
   * Calculate archetypal activation from conscious content
   */
  private calculateArchetypalActivation(focusedContent: PerceptualCue[]): ArchetypalActivation {
    const activation: ArchetypalActivation = {
      sage: 0, oracle: 0, healer: 0, warrior: 0, lover: 0, creator: 0,
      innocent: 0, explorer: 0, ruler: 0, caregiver: 0, jester: 0, magician: 0
    };
    
    focusedContent.forEach(cue => {
      if (cue.type === 'archetypal') {
        // Extract archetype from content
        const archetypalMatch = cue.content.match(/archetypal activation: (\w+)/);
        if (archetypalMatch) {
          const archetype = archetypalMatch[1] as keyof ArchetypalActivation;
          if (activation[archetype] !== undefined) {
            activation[archetype] += cue.intensity;
          }
        }
      }
    });
    
    return activation;
  }

  /**
   * Calculate competition score for global workspace
   */
  private calculateCompetitionScore(
    cue: PerceptualCue,
    consciousness: ConsciousnessProfile
  ): number {
    let score = 0;
    
    // Base score from intensity and relevance
    score += cue.intensity * 0.4;
    score += cue.relevance * 0.4;
    
    // Consciousness level alignment bonus
    const consciousnessAlignment = Math.abs(cue.consciousnessLevel - consciousness.consciousnessLevel);
    score += (1 - consciousnessAlignment) * 0.2;
    
    // Elemental resonance bonus if matches user's dominant element
    if (cue.elementalResonance.includes(consciousness.dominantElement)) {
      score += 0.15;
    }
    
    // Type-specific bonuses based on consciousness level
    if (consciousness.consciousnessLevel > 0.7 && cue.type === 'spiritual') {
      score += 0.1; // Higher consciousness values spiritual content more
    }
    
    if (consciousness.consciousnessLevel < 0.4 && cue.type === 'emotional') {
      score += 0.1; // Lower consciousness focuses more on emotional processing
    }
    
    return Math.min(score, 1.0); // Cap at 1.0
  }

  /**
   * Helper methods for pattern matching and scoring
   */
  private calculateRelevance(category: string, consciousness: ConsciousnessProfile): number {
    // Spiritual themes more relevant to higher consciousness levels
    const baseRelevance = 0.5;
    const consciousnessBonus = consciousness.consciousnessLevel * 0.4;
    
    // Specific category bonuses
    const categoryBonuses = {
      seeking: consciousness.spiralPhase === 'seeking_truth' ? 0.3 : 0,
      awakening: consciousness.spiralPhase === 'awakening' ? 0.3 : 0,
      integration: consciousness.spiralPhase === 'transparent_prism' ? 0.3 : 0,
      transcendence: consciousness.spiralPhase === 'integral_spiral' ? 0.3 : 0
    };
    
    return Math.min(
      baseRelevance + consciousnessBonus + (categoryBonuses[category] || 0),
      1.0
    );
  }

  private getElementalResonance(category: string): Element[] {
    const elementalMappings = {
      seeking: ['air', 'fire'],
      awakening: ['aether', 'fire'],
      shadow: ['water', 'earth'],
      integration: ['earth', 'aether'],
      transcendence: ['aether', 'air']
    };
    
    return elementalMappings[category] || ['air'];
  }

  private getEmotionalElementalResonance(emotion: string): Element[] {
    const emotionalElementMappings = {
      joy: ['fire', 'air'],
      sadness: ['water', 'earth'],
      anger: ['fire', 'water'],
      fear: ['earth', 'water'],
      surprise: ['air', 'aether']
    };
    
    return emotionalElementMappings[emotion] || ['water'];
  }

  private getArchetypalElementalResonance(archetype: string): Element[] {
    const archetypalElementMappings = {
      sage: ['air', 'aether'],
      oracle: ['aether', 'water'],
      healer: ['water', 'earth'],
      warrior: ['fire', 'earth'],
      lover: ['water', 'fire'],
      creator: ['fire', 'air'],
      innocent: ['air', 'water'],
      explorer: ['air', 'fire'],
      ruler: ['fire', 'earth'],
      caregiver: ['water', 'earth'],
      jester: ['air', 'fire'],
      magician: ['aether', 'fire']
    };
    
    return archetypalElementMappings[archetype] || ['air'];
  }

  private assessCognitiveComplexity(words: string[]): { level: number; description: string } {
    const complexWords = words.filter(word => word.length > 7).length;
    const abstractConcepts = words.filter(word => 
      ['consciousness', 'transcendence', 'integration', 'archetypal', 'metaphysical'].includes(word)
    ).length;
    
    const level = Math.min((complexWords + abstractConcepts * 2) / words.length, 1.0);
    
    const descriptions = [
      'Simple, concrete language',
      'Moderate complexity',
      'Complex, abstract thinking',
      'Highly sophisticated discourse'
    ];
    
    const descriptionIndex = Math.floor(level * (descriptions.length - 1));
    
    return {
      level,
      description: descriptions[descriptionIndex]
    };
  }

  private calculateEmotionalRelevance(emotion: string, consciousness: ConsciousnessProfile): number {
    // All emotions are relevant, but intensity varies by consciousness level
    const baseRelevance = 0.6;
    
    // Higher consciousness can process difficult emotions more effectively
    const difficultEmotions = ['anger', 'fear', 'sadness'];
    if (difficultEmotions.includes(emotion)) {
      return baseRelevance + (consciousness.consciousnessLevel * 0.3);
    }
    
    return baseRelevance + 0.2;
  }

  private calculateArchetypalRelevance(archetype: string, consciousness: ConsciousnessProfile): number {
    // Higher consciousness levels resonate more with archetypal content
    const baseRelevance = 0.4;
    const consciousnessBonus = consciousness.consciousnessLevel * 0.5;
    
    // Check if matches user's primary archetype
    const primaryArchetypeBonus = 
      consciousness.archetypalProfile?.primaryArchetype === archetype ? 0.2 : 0;
    
    return Math.min(baseRelevance + consciousnessBonus + primaryArchetypeBonus, 1.0);
  }

  private calculateAttentionIntensity(focusedContent: PerceptualCue[]): number {
    if (focusedContent.length === 0) return 0;
    
    const averageIntensity = focusedContent.reduce((sum, cue) => sum + cue.intensity, 0) / focusedContent.length;
    const contentVolumeBonus = Math.min(focusedContent.length / this.maxAttentionItems, 1.0) * 0.2;
    
    return Math.min(averageIntensity + contentVolumeBonus, 1.0);
  }

  private shouldBroadcastGlobally(
    focusedContent: PerceptualCue[],
    consciousnessLevel: number
  ): boolean {
    // Global broadcast occurs when:
    // 1. High-intensity spiritual or archetypal content
    // 2. Strong emotional content
    // 3. High consciousness level with complex content
    
    const highIntensityContent = focusedContent.some(cue => 
      cue.intensity > 0.8 && (cue.type === 'spiritual' || cue.type === 'archetypal')
    );
    
    const strongEmotionalContent = focusedContent.some(cue =>
      cue.intensity > 0.7 && cue.type === 'emotional'
    );
    
    const complexHighConsciousnessContent = 
      consciousnessLevel > 0.7 && focusedContent.length >= 5;
    
    return highIntensityContent || strongEmotionalContent || complexHighConsciousnessContent;
  }
}

// Export singleton instance with lazy loading
let _lidaWorkspace: LIDAWorkspace | null = null;
export const getLIDAWorkspace = (): LIDAWorkspace => {
  if (!_lidaWorkspace) {
    _lidaWorkspace = new LIDAWorkspace();
  }
  return _lidaWorkspace;
};