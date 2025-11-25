export interface PersonalStats {
  timeframe: string;
  totalSessions: number;
  archetypeGrowth: Record<string, number>;
  encounters: Record<string, number>;
  emotionalAverage: {
    valence: number;
    arousal: number;
    dominance: number;
  };
  peakHours: number[];
  dominantArchetype: string;
  recentBreakthroughs: string[];
  integrationScore: number;
}

export interface FieldPosition {
  type: 'harmonious' | 'counterpoint' | 'pioneering' | 'stabilizing';
  strength: number; // 0-1
  description: string;
  guidance: string;
}

export interface TemporalAlignment {
  sharedHours: number[];
  uniqueHours: number[];
  resonanceStrength: number; // 0-1
  description: string;
}

export interface ArchetypalComparison {
  archetype: string;
  personalGrowth: number;
  collectiveAverage: number;
  variance: number;
  position: 'leading' | 'aligned' | 'emerging' | 'contrasting';
  insight: string;
}

export interface CrossNarrativeData {
  fieldPosition: FieldPosition;
  temporalAlignment: TemporalAlignment;
  archetypalComparisons: ArchetypalComparison[];
  emotionalResonance: {
    alignment: number; // -1 to 1
    description: string;
    guidance: string;
  };
  integrationContext: {
    personalScore: number;
    fieldAverage: number;
    position: string;
    insight: string;
  };
  mythicReflection: string;
}

export class CrossNarrativeService {
  private static instance: CrossNarrativeService;

  static getInstance(): CrossNarrativeService {
    if (!CrossNarrativeService.instance) {
      CrossNarrativeService.instance = new CrossNarrativeService();
    }
    return CrossNarrativeService.instance;
  }

  generateCrossNarrative(personal: PersonalStats, collective: any): CrossNarrativeData {
    const fieldPosition = this.analyzeFieldPosition(personal, collective);
    const temporalAlignment = this.analyzeTemporalAlignment(personal, collective);
    const archetypalComparisons = this.compareArchetypes(personal, collective);
    const emotionalResonance = this.analyzeEmotionalResonance(personal, collective);
    const integrationContext = this.analyzeIntegrationContext(personal, collective);
    const mythicReflection = this.generateMythicReflection(
      fieldPosition, 
      temporalAlignment, 
      archetypalComparisons
    );

    return {
      fieldPosition,
      temporalAlignment,
      archetypalComparisons,
      emotionalResonance,
      integrationContext,
      mythicReflection
    };
  }

  private analyzeFieldPosition(personal: PersonalStats, collective: any): FieldPosition {
    const personalDominant = personal.dominantArchetype;
    const collectiveDominant = Object.entries(collective.archetypeDistribution)
      .sort(([,a], [,b]) => (b as number) - (a as number))[0][0];

    const personalGrowth = personal.archetypeGrowth[personalDominant];
    const totalCollective = Object.values(collective.archetypeDistribution).reduce((a: number, b: number) => a + b, 0);
    const collectivePercent = (collective.archetypeDistribution[personalDominant] / totalCollective) * 100;

    let type: FieldPosition['type'];
    let strength: number;
    let description: string;
    let guidance: string;

    if (personalDominant === collectiveDominant) {
      // Harmonious alignment
      type = 'harmonious';
      strength = 0.8 + (Math.random() * 0.2);
      description = `Your ${personalDominant} essence flows in perfect harmony with the collective tide. You are part of the great convergence, amplifying what the field most needs.`;
      guidance = "Trust this alignment. Your personal work serves the collective healing, and the field&apos;s movement supports your transformation.";
    } else if (personalGrowth > collectivePercent + 20) {
      // Leading/pioneering
      type = 'pioneering';
      strength = 0.7 + (Math.random() * 0.2);
      description = `Your ${personalDominant} energy pioneers new territory while the field focuses on ${collectiveDominant}. You are a wayshower, opening paths for others.`;
      guidance = "Your pioneering spirit serves the future. Continue developing this archetype - the field will eventually follow where you lead.";
    } else if (personalGrowth < collectivePercent - 20) {
      // Stabilizing/grounding
      type = 'stabilizing';
      strength = 0.6 + (Math.random() * 0.3);
      description = `While the field surges toward ${collectiveDominant}, your ${personalDominant} provides essential grounding. You anchor what others might overlook.`;
      guidance = "Your stabilizing presence is medicine. The collective needs your grounding energy to maintain balance during transformation.";
    } else {
      // Counterpoint
      type = 'counterpoint';
      strength = 0.5 + (Math.random() * 0.4);
      description = `Your ${personalDominant} offers a thoughtful counterpoint to the field's ${collectiveDominant} movement. This creative tension serves the greater wholeness.`;
      guidance = "Embrace this productive tension. The field needs both the dominant current and its complement for complete transformation.";
    }

    return { type, strength, description, guidance };
  }

  private analyzeTemporalAlignment(personal: PersonalStats, collective: any): TemporalAlignment {
    const collectivePeakHours = this.extractCollectivePeakHours(collective.temporalInsights.peakHours);
    const sharedHours = personal.peakHours.filter(hour => collectivePeakHours.includes(hour));
    const uniqueHours = personal.peakHours.filter(hour => !collectivePeakHours.includes(hour));
    
    const resonanceStrength = sharedHours.length / personal.peakHours.length;
    
    let description: string;
    if (resonanceStrength > 0.7) {
      description = "Your peak transformation hours align beautifully with the collective rhythm. You tap into the same temporal current flowing through many others, creating mutual amplification.";
    } else if (resonanceStrength > 0.3) {
      description = "You share some peak hours with the collective while maintaining your unique rhythm. This partial alignment offers both community support and individual depth.";
    } else {
      description = "Your peak hours dance to a different temporal beat than the collective. This unique rhythm gives you deeper, less crowded access to archetypal energies.";
    }

    return {
      sharedHours,
      uniqueHours,
      resonanceStrength,
      description
    };
  }

  private extractCollectivePeakHours(peakHourRanges: string[]): number[] {
    const hours: number[] = [];
    peakHourRanges.forEach(range => {
      if (range.includes('8am') || range.includes('8-9')) hours.push(8, 9);
      if (range.includes('7pm') || range.includes('19') || range.includes('7-9')) hours.push(19, 20, 21);
      if (range.includes('9pm') || range.includes('21')) hours.push(21);
    });
    return [...new Set(hours)];
  }

  private compareArchetypes(personal: PersonalStats, collective: any): ArchetypalComparison[] {
    const comparisons: ArchetypalComparison[] = [];
    const totalCollective = Object.values(collective.archetypeDistribution).reduce((a: number, b: number) => a + b, 0);

    Object.entries(personal.archetypeGrowth).forEach(([archetype, personalGrowth]) => {
      const collectiveCount = collective.archetypeDistribution[archetype] || 0;
      const collectiveAverage = (collectiveCount / totalCollective) * 100;
      const variance = (personalGrowth as number) - collectiveAverage;
      
      let position: ArchetypalComparison['position'];
      let insight: string;

      if (variance > 25) {
        position = 'leading';
        insight = `Your ${archetype} development significantly leads the field. You&apos;re pioneering this archetypal territory.`;
      } else if (variance > -10 && variance < 10) {
        position = 'aligned';
        insight = `Your ${archetype} growth moves in harmony with the collective current. You're part of the shared evolution.`;
      } else if (variance < -25) {
        position = 'emerging';
        insight = `Your ${archetype} has room for growth. The field's strength here offers learning opportunities.`;
      } else {
        position = 'contrasting';
        insight = `Your ${archetype} development offers a different perspective from the collective focus.`;
      }

      comparisons.push({
        archetype,
        personalGrowth: personalGrowth as number,
        collectiveAverage: Math.round(collectiveAverage),
        variance: Math.round(variance),
        position,
        insight
      });
    });

    return comparisons.sort((a, b) => Math.abs(b.variance) - Math.abs(a.variance));
  }

  private analyzeEmotionalResonance(personal: PersonalStats, collective: any): any {
    // Simulate collective emotional averages
    const collectiveEmotional = {
      valence: 0.65,
      arousal: 0.55,
      dominance: 0.60
    };

    const personalEmotional = personal.emotionalAverage;
    
    const alignment = 1 - (
      Math.abs(personalEmotional.valence - collectiveEmotional.valence) +
      Math.abs(personalEmotional.arousal - collectiveEmotional.arousal) +
      Math.abs(personalEmotional.dominance - collectiveEmotional.dominance)
    ) / 3;

    let description: string;
    let guidance: string;

    if (alignment > 0.8) {
      description = "Your emotional signature resonates deeply with the collective field. You feel what others feel, creating natural empathy and connection.";
      guidance = "Use this emotional attunement to serve as a bridge between individual and collective healing.";
    } else if (alignment > 0.5) {
      description = "Your emotional pattern harmonizes with the field while maintaining your unique signature. You offer both resonance and fresh perspective.";
      guidance = "Your balanced emotional position allows you to both support the collective and offer needed contrasts.";
    } else {
      description = "Your emotional signature provides a distinct counterpoint to the collective frequency. This difference is medicine.";
      guidance = personalEmotional.valence > collectiveEmotional.valence ? 
        "Your natural optimism serves as uplifting medicine during collective shadow periods." :
        "Your grounded realism offers stability when the collective gets overenthusiastic.";
    }

    return {
      alignment,
      description,
      guidance
    };
  }

  private analyzeIntegrationContext(personal: PersonalStats, collective: any): any {
    const personalScore = personal.integrationScore;
    const fieldAverage = parseInt(collective.growthTrends.integrationRate.replace('%', ''));
    
    let position: string;
    let insight: string;

    if (personalScore > fieldAverage + 15) {
      position = 'Integration Leader';
      insight = 'Your high integration score makes you a natural anchor point for others crossing similar thresholds.';
    } else if (personalScore < fieldAverage - 15) {
      position = 'Deep Processor';
      insight = 'Your thorough integration approach honors the need for sustainable, lasting transformation over speed.';
    } else {
      position = 'Collective Flow';
      insight = 'Your integration pace moves harmoniously with the collective rhythm of transformation.';
    }

    return {
      personalScore,
      fieldAverage,
      position,
      insight
    };
  }

  private generateMythicReflection(
    fieldPosition: FieldPosition, 
    temporalAlignment: TemporalAlignment,
    archetypalComparisons: ArchetypalComparison[]
  ): string {
    const dominant = archetypalComparisons[0];
    const positionDescriptions = {
      harmonious: 'In the great symphony of consciousness, your voice blends seamlessly with the collective song',
      counterpoint: 'Your unique melodic line weaves through the collective harmony, adding necessary complexity',
      pioneering: 'You walk ahead of the group, creating new pathways for others to follow',
      stabilizing: 'You anchor the collective flight, ensuring the transformation remains grounded'
    };

    const timeDescription = temporalAlignment.resonanceStrength > 0.5 ? 
      'moving in rhythm with the greater pulse' : 
      'following your own sacred timing';

    return `🌟 ${positionDescriptions[fieldPosition.type]}, ${timeDescription}. Your ${dominant.archetype} essence ${
      dominant.position === 'leading' ? 'blazes trails for the collective' :
      dominant.position === 'aligned' ? 'flows with the collective current' :
      dominant.position === 'emerging' ? 'opens to the collective wisdom' :
      'offers medicine to the collective need'
    }. In this eternal dance between individual and collective becoming, you are exactly where you need to be.`;
  }
}

export default CrossNarrativeService;