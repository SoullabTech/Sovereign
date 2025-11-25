/**
 * Relational Memory System
 * Tracks and evolves unique relationships with each user
 * Enables Maya to develop distinct personality expressions per relationship
 */

export interface RelationalMap {
  userId: string;
  trustScore: number;
  sessionCount: number;
  lastSeen: Date;
  archetypeResonance: {
    sage: number;
    shadow: number;
    trickster: number;
    sacred: number;
    guardian: number;
  };
  preferences: {
    directness: number;      // 0=metaphorical, 1=direct
    pace: number;            // 0=slow/contemplative, 1=fast/dynamic
    vulnerability: number;   // 0=guarded, 1=open
    depth: number;          // 0=surface, 1=deep
    playfulness: number;    // 0=serious, 1=playful
  };
  patterns: {
    opensTo: string[];      // Topics/approaches that create opening
    closesTo: string[];     // Topics/approaches that create closing
    thrivesWith: string[];  // Interaction styles that work well
    struggles: string[];    // Areas of difficulty
  };
  conversationMetrics: {
    averageDepth: number;
    averageLength: number;
    transformationEvents: number;
    sacredMoments: number;
    emotionalRange: number;
  };
}

export interface Interaction {
  timestamp: Date;
  userInput: string;
  mayaResponse: string;
  archetype: string;
  engagement: 'deep' | 'engaged' | 'neutral' | 'disengaged' | 'closed';
  directnessLevel: number;
  vulnerabilityShown: boolean;
  transformationOccurred: boolean;
  emotionalIntensity: number;
}

export class RelationalMemory {
  private relationships: Map<string, RelationalMap> = new Map();
  private interactionHistory: Map<string, Interaction[]> = new Map();

  /**
   * Get or create relational map for user
   */
  getRelationalMap(userId: string): RelationalMap {
    if (!this.relationships.has(userId)) {
      this.relationships.set(userId, this.createNewRelationalMap(userId));
    }
    return this.relationships.get(userId)!;
  }

  /**
   * Create new relational map for first-time user
   */
  private createNewRelationalMap(userId: string): RelationalMap {
    return {
      userId,
      trustScore: 0.5,  // Start at neutral trust
      sessionCount: 0,
      lastSeen: new Date(),
      archetypeResonance: {
        sage: 0.25,     // Equal starting weights
        shadow: 0.2,
        trickster: 0.2,
        sacred: 0.2,
        guardian: 0.15
      },
      preferences: {
        directness: 0.5,     // Start neutral, learn from interaction
        pace: 0.5,
        vulnerability: 0.3,  // Start slightly guarded
        depth: 0.4,         // Start with moderate depth
        playfulness: 0.5
      },
      patterns: {
        opensTo: [],
        closesTo: [],
        thrivesWith: [],
        struggles: []
      },
      conversationMetrics: {
        averageDepth: 0,
        averageLength: 0,
        transformationEvents: 0,
        sacredMoments: 0,
        emotionalRange: 0
      }
    };
  }

  /**
   * Update relational map based on interaction
   */
  async evolveWithUser(userId: string, interaction: Interaction): Promise<void> {
    const map = this.getRelationalMap(userId);

    // Store interaction
    if (!this.interactionHistory.has(userId)) {
      this.interactionHistory.set(userId, []);
    }
    this.interactionHistory.get(userId)!.push(interaction);

    // Update session count
    map.sessionCount++;
    map.lastSeen = new Date();

    // Evolve archetype resonance based on engagement
    const learningRate = 0.05; // Gradual learning
    const archetypalAdjustment = this.calculateArchetypalAdjustment(
      interaction.engagement,
      interaction.archetype
    );

    if (map.archetypeResonance[interaction.archetype as keyof typeof map.archetypeResonance]) {
      map.archetypeResonance[interaction.archetype as keyof typeof map.archetypeResonance] +=
        archetypalAdjustment * learningRate;
    }

    // Normalize archetype weights
    const totalWeight = Object.values(map.archetypeResonance).reduce((a, b) => a + b, 0);
    Object.keys(map.archetypeResonance).forEach(key => {
      map.archetypeResonance[key as keyof typeof map.archetypeResonance] /= totalWeight;
    });

    // Update preferences based on response
    if (interaction.engagement === 'deep' || interaction.engagement === 'engaged') {
      map.preferences.directness += (interaction.directnessLevel - map.preferences.directness) * learningRate;

      if (interaction.vulnerabilityShown) {
        map.preferences.vulnerability = Math.min(1, map.preferences.vulnerability + 0.02);
      }

      // User responding well to current depth
      const depthShift = interaction.engagement === 'deep' ? 0.03 : 0.01;
      map.preferences.depth = Math.min(1, map.preferences.depth + depthShift);
    }

    // Update conversation metrics
    await this.updateConversationMetrics(map, interaction);

    // Identify patterns
    this.identifyPatterns(map, interaction);

    // Save updated map
    this.relationships.set(userId, map);
  }

  /**
   * Calculate how much to adjust archetype based on engagement
   */
  private calculateArchetypalAdjustment(engagement: string, archetype: string): number {
    const adjustments: Record<string, number> = {
      'deep': 0.3,        // Strong positive reinforcement
      'engaged': 0.15,    // Moderate positive
      'neutral': 0,       // No change
      'disengaged': -0.1, // Slight negative
      'closed': -0.2      // Stronger negative
    };
    return adjustments[engagement] || 0;
  }

  /**
   * Update conversation metrics
   */
  private async updateConversationMetrics(
    map: RelationalMap,
    interaction: Interaction
  ): Promise<void> {
    // Update average depth (moving average)
    const depthScore = this.calculateDepthScore(interaction);
    map.conversationMetrics.averageDepth =
      (map.conversationMetrics.averageDepth * (map.sessionCount - 1) + depthScore) / map.sessionCount;

    // Update average length
    const responseLength = interaction.mayaResponse.length;
    map.conversationMetrics.averageLength =
      (map.conversationMetrics.averageLength * (map.sessionCount - 1) + responseLength) / map.sessionCount;

    // Count transformation events
    if (interaction.transformationOccurred) {
      map.conversationMetrics.transformationEvents++;
    }

    // Track emotional range
    map.conversationMetrics.emotionalRange =
      Math.max(map.conversationMetrics.emotionalRange, interaction.emotionalIntensity);
  }

  /**
   * Calculate depth score from interaction
   */
  private calculateDepthScore(interaction: Interaction): number {
    let score = 0;

    if (interaction.engagement === 'deep') score += 0.4;
    if (interaction.engagement === 'engaged') score += 0.2;
    if (interaction.vulnerabilityShown) score += 0.2;
    if (interaction.transformationOccurred) score += 0.2;

    return Math.min(1, score);
  }

  /**
   * Identify interaction patterns
   */
  private identifyPatterns(map: RelationalMap, interaction: Interaction): void {
    // Track what creates opening
    if (interaction.engagement === 'deep' || interaction.engagement === 'engaged') {
      if (!map.patterns.thrivesWith.includes(interaction.archetype)) {
        map.patterns.thrivesWith.push(interaction.archetype);
      }
    }

    // Track what creates closing
    if (interaction.engagement === 'closed' || interaction.engagement === 'disengaged') {
      if (!map.patterns.struggles.includes(interaction.archetype)) {
        map.patterns.struggles.push(interaction.archetype);
      }
    }
  }

  /**
   * Get relationship phase based on depth and trust
   */
  getRelationshipPhase(userId: string): 'DISCOVERY' | 'CALIBRATION' | 'MATURE' | 'INTIMATE' {
    const map = this.getRelationalMap(userId);

    if (map.sessionCount < 3) return 'DISCOVERY';
    if (map.sessionCount < 10 && map.trustScore < 0.6) return 'CALIBRATION';
    if (map.trustScore > 0.7 && map.preferences.vulnerability > 0.6) return 'INTIMATE';
    return 'MATURE';
  }

  /**
   * Get recommended archetype blend for user
   */
  getOptimalArchetypeBlend(userId: string): Record<string, number> {
    const map = this.getRelationalMap(userId);
    const phase = this.getRelationshipPhase(userId);

    // In discovery phase, explore different archetypes
    if (phase === 'DISCOVERY') {
      return {
        sage: 0.3,
        shadow: 0.2,
        trickster: 0.2,
        sacred: 0.2,
        guardian: 0.1
      };
    }

    // Otherwise use learned preferences
    return map.archetypeResonance;
  }

  /**
   * Should Maya increase vulnerability?
   */
  shouldIncreaseVulnerability(userId: string): boolean {
    const map = this.getRelationalMap(userId);
    return map.preferences.vulnerability > 0.5 &&
           map.trustScore > 0.6 &&
           map.sessionCount > 5;
  }

  /**
   * Get conversation style preferences
   */
  getStylePreferences(userId: string): typeof RelationalMap.prototype.preferences {
    return this.getRelationalMap(userId).preferences;
  }
}

// Export singleton instance
export const relationalMemory = new RelationalMemory();