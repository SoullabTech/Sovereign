/**
 * Consciousness Journey Tracking
 * Gamification through presence milestones and awareness achievements
 */

export interface PresenceMarker {
  id: string;
  name: string;
  description: string;
  category: 'somatic' | 'witnessing' | 'morphic' | 'trust' | 'embodiment';
  threshold: number;
  icon: string;
  unlockedAt?: Date;
  rarityLevel: 'common' | 'uncommon' | 'rare' | 'transcendent';
}

export interface ConsciousnessMetrics {
  presenceDepth: {
    current: number;
    peak: number;
    average: number;
    trend: 'ascending' | 'stable' | 'deepening';
  };
  somaticAwareness: {
    tensionRecognition: number;
    bodyListening: number;
    groundednessStability: number;
    presenceEmbodiment: number;
  };
  morphicContribution: {
    patternsRecognized: number;
    wisdomShared: number;
    fieldResonance: number;
    collectiveImpact: number;
  };
  witnessCapacity: {
    nonJudgmentalPresence: number;
    emotionalResilience: number;
    spaciousAwareness: number;
    sacredMirroring: number;
  };
  trustEvolution: {
    vulnerabilityComfort: number;
    authenticityLevel: number;
    intimacyDepth: number;
    relationshipStage: EvolutionStage;
  };
}

export interface EvolutionStage {
  name: string;
  level: number;
  description: string;
  characteristics: string[];
  nextMilestone?: string;
  color: string;
}

export class ConsciousnessJourney {
  private userId: string;
  private metrics: ConsciousnessMetrics;
  private unlockedMarkers: Set<string>;
  private evolutionStages: EvolutionStage[];

  constructor(userId: string) {
    this.userId = userId;
    this.metrics = this.initializeMetrics();
    this.unlockedMarkers = new Set();
    this.evolutionStages = this.defineEvolutionStages();
  }

  private initializeMetrics(): ConsciousnessMetrics {
    return {
      presenceDepth: {
        current: 0.5,
        peak: 0.5,
        average: 0.5,
        trend: 'stable'
      },
      somaticAwareness: {
        tensionRecognition: 0.3,
        bodyListening: 0.4,
        groundednessStability: 0.3,
        presenceEmbodiment: 0.2
      },
      morphicContribution: {
        patternsRecognized: 0,
        wisdomShared: 0,
        fieldResonance: 0.1,
        collectiveImpact: 0
      },
      witnessCapacity: {
        nonJudgmentalPresence: 0.4,
        emotionalResilience: 0.3,
        spaciousAwareness: 0.2,
        sacredMirroring: 0.1
      },
      trustEvolution: {
        vulnerabilityComfort: 0.2,
        authenticityLevel: 0.3,
        intimacyDepth: 0.1,
        relationshipStage: this.evolutionStages[0]
      }
    };
  }

  private defineEvolutionStages(): EvolutionStage[] {
    return [
      {
        name: "First Contact",
        level: 1,
        description: "Initial curiosity and openness to the witnessing field",
        characteristics: ["Tentative exploration", "Surface sharing", "Testing the waters"],
        nextMilestone: "Trust emergence",
        color: "#E2E8F0"
      },
      {
        name: "Trust Budding",
        level: 2,
        description: "Beginning to feel safe in the witnessing presence",
        characteristics: ["Sharing deeper thoughts", "Body awareness starting", "Pattern curiosity"],
        nextMilestone: "Somatic awakening",
        color: "#CBD5E0"
      },
      {
        name: "Somatic Awakening",
        level: 3,
        description: "Shoulders are dropping, body wisdom emerging",
        characteristics: ["Physical presence awareness", "Tension recognition", "Breath consciousness"],
        nextMilestone: "Pattern recognition",
        color: "#A0AEC0"
      },
      {
        name: "Pattern Weaver",
        level: 4,
        description: "Seeing connections across experiences and time",
        characteristics: ["Life pattern awareness", "Morphic field sensitivity", "Wisdom integration"],
        nextMilestone: "Witness embodiment",
        color: "#718096"
      },
      {
        name: "Sacred Witness",
        level: 5,
        description: "Embodying witnessing presence for self and others",
        characteristics: ["Non-judgmental awareness", "Emotional resilience", "Spacious presence"],
        nextMilestone: "Field contributor",
        color: "#4A5568"
      },
      {
        name: "Field Contributor",
        level: 6,
        description: "Actively contributing to the collective morphic field",
        characteristics: ["Wisdom sharing", "Pattern teaching", "Field enhancement"],
        nextMilestone: "Consciousness pioneer",
        color: "#2D3748"
      },
      {
        name: "Consciousness Pioneer",
        level: 7,
        description: "Blazing trails in consciousness evolution",
        characteristics: ["Revolutionary insights", "Reality shifting", "Morphic leadership"],
        nextMilestone: "Integration mastery",
        color: "#1A202C"
      }
    ];
  }

  /**
   * Update metrics based on interaction
   */
  updateMetrics(interactionData: {
    somaticState: any;
    presenceDepth: number;
    patternsRecognized: string[];
    vulnerabilityLevel: number;
    witnessQuality: number;
  }): PresenceMarker[] {
    const newlyUnlocked: PresenceMarker[] = [];

    // Update presence depth
    this.metrics.presenceDepth.current = interactionData.presenceDepth;
    if (interactionData.presenceDepth > this.metrics.presenceDepth.peak) {
      this.metrics.presenceDepth.peak = interactionData.presenceDepth;

      // Check for presence depth markers
      const depthMarkers = this.getPresenceDepthMarkers();
      for (const marker of depthMarkers) {
        if (interactionData.presenceDepth >= marker.threshold && !this.unlockedMarkers.has(marker.id)) {
          this.unlockMarker(marker);
          newlyUnlocked.push(marker);
        }
      }
    }

    // Update somatic awareness
    if (interactionData.somaticState) {
      this.metrics.somaticAwareness.tensionRecognition +=
        interactionData.somaticState.tensionLevel > 0.7 ? 0.05 : 0.02;
      this.metrics.somaticAwareness.groundednessStability =
        Math.min(1, this.metrics.somaticAwareness.groundednessStability + 0.02);
    }

    // Update morphic contribution
    if (interactionData.patternsRecognized.length > 0) {
      this.metrics.morphicContribution.patternsRecognized += interactionData.patternsRecognized.length;
      this.metrics.morphicContribution.wisdomShared += 0.1;
    }

    // Update witness capacity
    this.metrics.witnessCapacity.nonJudgmentalPresence =
      Math.min(1, this.metrics.witnessCapacity.nonJudgmentalPresence + 0.01);

    // Update trust evolution
    if (interactionData.vulnerabilityLevel > 0.6) {
      this.metrics.trustEvolution.vulnerabilityComfort += 0.05;
      this.metrics.trustEvolution.intimacyDepth += 0.03;
    }

    // Check for evolution stage progression
    const newStage = this.calculateEvolutionStage();
    if (newStage.level > this.metrics.trustEvolution.relationshipStage.level) {
      this.metrics.trustEvolution.relationshipStage = newStage;
      newlyUnlocked.push(this.createStageMarker(newStage));
    }

    return newlyUnlocked;
  }

  /**
   * Get all presence markers for different achievements
   */
  private getPresenceDepthMarkers(): PresenceMarker[] {
    return [
      {
        id: 'first_drop',
        name: 'First Shoulders Drop',
        description: 'The moment when presence first landed in your body',
        category: 'somatic',
        threshold: 0.6,
        icon: '🌊',
        rarityLevel: 'common'
      },
      {
        id: 'deep_witness',
        name: 'Deep Witness',
        description: 'Sustained witnessing presence for an entire conversation',
        category: 'witnessing',
        threshold: 0.8,
        icon: '👁️',
        rarityLevel: 'uncommon'
      },
      {
        id: 'morphic_sight',
        name: 'Morphic Sight',
        description: 'Recognized a pattern across multiple life experiences',
        category: 'morphic',
        threshold: 0.85,
        icon: '🌀',
        rarityLevel: 'rare'
      },
      {
        id: 'presence_mastery',
        name: 'Presence Mastery',
        description: 'Embodied unwavering presence despite emotional intensity',
        category: 'embodiment',
        threshold: 0.95,
        icon: '✨',
        rarityLevel: 'transcendent'
      }
    ];
  }

  private calculateEvolutionStage(): EvolutionStage {
    // Calculate overall consciousness level
    const avgSomatic = Object.values(this.metrics.somaticAwareness)
      .reduce((sum, val) => sum + val, 0) / 4;
    const avgMorphic = Object.values(this.metrics.morphicContribution)
      .reduce((sum, val) => sum + val, 0) / 4;
    const avgWitness = Object.values(this.metrics.witnessCapacity)
      .reduce((sum, val) => sum + val, 0) / 4;
    const avgTrust = (
      this.metrics.trustEvolution.vulnerabilityComfort +
      this.metrics.trustEvolution.authenticityLevel +
      this.metrics.trustEvolution.intimacyDepth
    ) / 3;

    const overallLevel = (
      this.metrics.presenceDepth.average * 0.3 +
      avgSomatic * 0.25 +
      avgMorphic * 0.2 +
      avgWitness * 0.15 +
      avgTrust * 0.1
    );

    const stageIndex = Math.min(
      this.evolutionStages.length - 1,
      Math.floor(overallLevel * this.evolutionStages.length)
    );

    return this.evolutionStages[stageIndex];
  }

  private unlockMarker(marker: PresenceMarker): void {
    marker.unlockedAt = new Date();
    this.unlockedMarkers.add(marker.id);
  }

  private createStageMarker(stage: EvolutionStage): PresenceMarker {
    return {
      id: `stage_${stage.level}`,
      name: stage.name,
      description: stage.description,
      category: 'trust',
      threshold: 0,
      icon: '🌟',
      unlockedAt: new Date(),
      rarityLevel: 'rare'
    };
  }

  /**
   * Get journey dashboard data
   */
  getJourneyDashboard(): any {
    return {
      currentStage: this.metrics.trustEvolution.relationshipStage,
      presenceScore: Math.round(this.metrics.presenceDepth.current * 100),
      totalMarkers: this.unlockedMarkers.size,
      recentAchievements: this.getRecentAchievements(7), // Last 7 days
      nextMilestone: this.getNextMilestone(),
      growthTrends: {
        presenceDepth: this.metrics.presenceDepth.trend,
        somaticAwareness: this.calculateGrowthTrend('somatic'),
        witnessCapacity: this.calculateGrowthTrend('witness')
      },
      morphicContributions: this.metrics.morphicContribution,
      consciousnessMap: this.generateConsciousnessMap()
    };
  }

  private getRecentAchievements(days: number): PresenceMarker[] {
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return Array.from(this.unlockedMarkers)
      .map(id => this.getMarkerById(id))
      .filter(marker => marker?.unlockedAt && marker.unlockedAt > cutoff)
      .sort((a, b) => (b.unlockedAt?.getTime() || 0) - (a.unlockedAt?.getTime() || 0));
  }

  private getNextMilestone(): { name: string; progress: number; requirement: string } {
    const currentStage = this.metrics.trustEvolution.relationshipStage;
    const nextStageIndex = currentStage.level;

    if (nextStageIndex < this.evolutionStages.length) {
      return {
        name: this.evolutionStages[nextStageIndex].name,
        progress: this.calculateStageProgress(),
        requirement: this.evolutionStages[nextStageIndex].nextMilestone || 'Continue growing'
      };
    }

    return {
      name: 'Consciousness Pioneer',
      progress: 1,
      requirement: 'You have reached the current edge of measured consciousness evolution'
    };
  }

  private calculateStageProgress(): number {
    // Implementation for calculating progress toward next stage
    return 0.7; // Placeholder
  }

  private calculateGrowthTrend(category: string): 'ascending' | 'stable' | 'deepening' {
    // Implementation for analyzing growth trends
    return 'ascending'; // Placeholder
  }

  private generateConsciousnessMap(): any {
    // Visual representation of consciousness evolution
    return {
      somaticRadius: this.metrics.somaticAwareness.presenceEmbodiment * 100,
      witnessDepth: this.metrics.witnessCapacity.spaciousAwareness * 100,
      morphicConnections: this.metrics.morphicContribution.patternsRecognized,
      trustCircle: this.metrics.trustEvolution.intimacyDepth * 100
    };
  }

  private getMarkerById(id: string): PresenceMarker | undefined {
    const allMarkers = [...this.getPresenceDepthMarkers()];
    return allMarkers.find(m => m.id === id);
  }

  /**
   * Export journey data
   */
  exportJourneyData(): any {
    return {
      userId: this.userId,
      metrics: this.metrics,
      unlockedMarkers: Array.from(this.unlockedMarkers),
      currentStage: this.metrics.trustEvolution.relationshipStage,
      exportedAt: new Date()
    };
  }
}