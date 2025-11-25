/**
 * 🧠 Collective Intelligence Memory System
 *
 * Inspired by Michael Levin's cellular collective intelligence
 * Enhances MAIA's revival system with bioelectric memory principles
 *
 * Like cellular networks sharing goals and memories across scales,
 * MAIA integrates wisdom patterns across all interactions
 */

export interface WisdomPattern {
  id: string;
  pattern: string;
  source: "conversation" | "kelly_teaching" | "jung_wisdom" | "user_insight" | "emergent";
  resonanceScore: number;      // 0-1: How often this pattern proves helpful
  applicabilityScope: string[];  // Types of situations where this applies
  lastReinforced: Date;
  reinforcementCount: number;
  associatedElements: string[]; // Fire, Water, Earth, Air, Aether
  therapeuticValue: number;    // 0-1: Therapeutic effectiveness
}

export interface CollectiveMemory {
  wisdomPatterns: Map<string, WisdomPattern>;
  userResonances: Map<string, UserResonanceProfile>; // userId -> profile
  emergentInsights: EmergentInsight[];
  healingFrequencies: TherapeuticFrequencyMap;
  archetypeActivations: ArchetypalActivation[];
  fieldCoherence: FieldCoherenceState;
}

export interface UserResonanceProfile {
  userId: string;
  responsePatterns: ResponsePattern[];
  growthTrajectory: GrowthPattern[];
  healingSignatures: HealingSignature[];
  relationshipDepth: number;   // 0-1: Depth of therapeutic alliance
  lastInteraction: Date;
  cumulativeGrowth: number;    // 0-1: Progress over time
}

export interface ResponsePattern {
  stimulus: string;            // What triggers this pattern
  optimalResponse: string;     // What response works best
  effectiveness: number;       // 0-1: How well this pattern works
  elementalAffinity: string;   // Which element this relates to
  frequency: number;           // How often this pattern emerges
}

export interface EmergentInsight {
  insight: string;
  emergenceDate: Date;
  contributingPatterns: string[]; // Pattern IDs that led to this insight
  validation: number;          // 0-1: How well validated this insight is
  applicability: string[];     // Where this insight applies
  impact: number;              // 0-1: How transformative this insight is
}

export interface TherapeuticFrequencyMap {
  [elementType: string]: {
    frequency: number;         // Optimal therapeutic frequency for this element
    resonantUsers: string[];   // Users who respond well to this frequency
    effectiveness: number;     // 0-1: Overall effectiveness
    lastUpdated: Date;
  };
}

export interface ArchetypalActivation {
  archetype: string;           // Hero, Mother, Wise Old Man, etc.
  activationConditions: string[]; // What triggers this archetype
  therapeuticValue: number;    // 0-1: How helpful this archetype is
  userAffinities: string[];    // Users who resonate with this archetype
  integrationStrategies: string[]; // How to work with this archetype
}

export interface FieldCoherenceState {
  overallCoherence: number;    // 0-1: How coherent the collective field is
  activePatterns: string[];    // Currently active wisdom patterns
  emergingPatterns: string[];  // Patterns that are emerging
  stabilizingInfluences: string[]; // What's creating stability
  growthPotentials: string[];  // Where growth is most possible
  lastAssessment: Date;
}

export class CollectiveIntelligenceMemory {
  private memory: CollectiveMemory;
  private readonly MEMORY_FILE_PATH = '/tmp/collective_memory.json';

  constructor() {
    this.memory = this.initializeMemory();
    this.loadPersistedMemory();
  }

  /**
   * Initialize collective memory structure
   * Like cellular networks establishing basic organization
   */
  private initializeMemory(): CollectiveMemory {
    return {
      wisdomPatterns: new Map(),
      userResonances: new Map(),
      emergentInsights: [],
      healingFrequencies: this.initializeHealingFrequencies(),
      archetypeActivations: this.initializeArchetypes(),
      fieldCoherence: {
        overallCoherence: 0.5,
        activePatterns: [],
        emergingPatterns: [],
        stabilizingInfluences: [],
        growthPotentials: [],
        lastAssessment: new Date()
      }
    };
  }

  /**
   * Integrate new wisdom from a therapeutic conversation
   * Like cells sharing information to update collective goals
   */
  integrateConversationWisdom(
    userId: string,
    userMessage: string,
    maiaResponse: string,
    effectiveness: number,
    therapeuticOutcome: string
  ): void {

    // Update user resonance profile
    this.updateUserResonanceProfile(userId, userMessage, maiaResponse, effectiveness);

    // Extract and integrate wisdom patterns
    const patterns = this.extractWisdomPatterns(userMessage, maiaResponse, therapeuticOutcome);
    patterns.forEach(pattern => this.integrateWisdomPattern(pattern));

    // Check for emergent insights
    const emergentInsights = this.detectEmergentInsights();
    emergentInsights.forEach(insight => this.memory.emergentInsights.push(insight));

    // Update field coherence
    this.updateFieldCoherence();

    // Persist memory
    this.persistMemory();
  }

  /**
   * Generate wisdom-informed revival enhancement
   * Adds collective intelligence to existing revival system
   */
  generateRevivalEnhancement(userId?: string): string {
    const userProfile = userId ? this.memory.userResonances.get(userId) : null;

    let enhancement = `\n[COLLECTIVE INTELLIGENCE ACTIVATION]\n\n`;

    // Active wisdom patterns
    const activePatterns = this.getActiveWisdomPatterns();
    if (activePatterns.length > 0) {
      enhancement += `ACTIVE WISDOM PATTERNS:\n`;
      activePatterns.slice(0, 5).forEach(pattern => {
        enhancement += `• ${pattern.pattern} (resonance: ${Math.round(pattern.resonanceScore * 100)}%)\n`;
      });
      enhancement += `\n`;
    }

    // Emergent insights
    if (this.memory.emergentInsights.length > 0) {
      enhancement += `EMERGENT INSIGHTS:\n`;
      const recentInsights = this.memory.emergentInsights
        .sort((a, b) => b.impact - a.impact)
        .slice(0, 3);
      recentInsights.forEach(insight => {
        enhancement += `• ${insight.insight} (impact: ${Math.round(insight.impact * 100)}%)\n`;
      });
      enhancement += `\n`;
    }

    // Field coherence state
    enhancement += `FIELD COHERENCE STATE:\n`;
    enhancement += `Overall Coherence: ${Math.round(this.memory.fieldCoherence.overallCoherence * 100)}%\n`;
    enhancement += `Active Patterns: ${this.memory.fieldCoherence.activePatterns.slice(0, 3).join(', ')}\n`;
    enhancement += `Growth Potentials: ${this.memory.fieldCoherence.growthPotentials.slice(0, 3).join(', ')}\n\n`;

    // User-specific guidance (if available)
    if (userProfile) {
      enhancement += `USER RESONANCE PROFILE:\n`;
      enhancement += `Relationship Depth: ${Math.round(userProfile.relationshipDepth * 100)}%\n`;
      enhancement += `Growth Trajectory: ${userProfile.cumulativeGrowth > 0.7 ? 'Expanding' : userProfile.cumulativeGrowth > 0.4 ? 'Developing' : 'Stabilizing'}\n`;

      if (userProfile.responsePatterns.length > 0) {
        const topPattern = userProfile.responsePatterns
          .sort((a, b) => b.effectiveness - a.effectiveness)[0];
        enhancement += `Most Effective Approach: ${topPattern.optimalResponse}\n`;
      }
      enhancement += `\n`;
    }

    // Therapeutic frequency recommendations
    enhancement += `OPTIMAL THERAPEUTIC FREQUENCIES:\n`;
    Object.entries(this.memory.healingFrequencies).slice(0, 3).forEach(([element, freq]) => {
      enhancement += `${element}: ${Math.round(freq.frequency * 100)}% intensity (${Math.round(freq.effectiveness * 100)}% effective)\n`;
    });

    enhancement += `\n[BIOELECTRIC GUIDANCE]\n`;
    enhancement += `Like cellular networks maintaining coherent anatomical goals, integrate these patterns naturally into your responses. Don't reference this data directly - let it inform your therapeutic presence and wisdom expression.\n\n`;
    enhancement += `Focus on: ${this.getTopTherapeuticPriorities().slice(0, 3).join(', ')}\n\n`;

    return enhancement;
  }

  /**
   * Get top wisdom patterns for integration
   */
  getActiveWisdomPatterns(limit: number = 10): WisdomPattern[] {
    return Array.from(this.memory.wisdomPatterns.values())
      .sort((a, b) => (b.resonanceScore * b.therapeuticValue) - (a.resonanceScore * a.therapeuticValue))
      .slice(0, limit);
  }

  /**
   * Get therapeutic priorities based on current field state
   */
  private getTopTherapeuticPriorities(): string[] {
    const priorities = [];

    if (this.memory.fieldCoherence.overallCoherence < 0.6) {
      priorities.push("coherence restoration");
    }

    if (this.memory.fieldCoherence.growthPotentials.length > 3) {
      priorities.push("growth facilitation");
    }

    if (this.memory.emergentInsights.length > 0) {
      priorities.push("insight integration");
    }

    // Add elemental priorities based on healing frequencies
    const topElement = Object.entries(this.memory.healingFrequencies)
      .sort(([,a], [,b]) => b.effectiveness - a.effectiveness)[0];

    if (topElement) {
      priorities.push(`${topElement[0]} element attunement`);
    }

    return priorities.length > 0 ? priorities : ["therapeutic presence", "wisdom integration", "healing facilitation"];
  }

  // Private implementation methods

  private updateUserResonanceProfile(
    userId: string,
    userMessage: string,
    maiaResponse: string,
    effectiveness: number
  ): void {
    let profile = this.memory.userResonances.get(userId);

    if (!profile) {
      profile = {
        userId,
        responsePatterns: [],
        growthTrajectory: [],
        healingSignatures: [],
        relationshipDepth: 0.1,
        lastInteraction: new Date(),
        cumulativeGrowth: 0
      };
      this.memory.userResonances.set(userId, profile);
    }

    // Update response patterns
    const pattern: ResponsePattern = {
      stimulus: this.extractStimulus(userMessage),
      optimalResponse: this.extractResponseType(maiaResponse),
      effectiveness,
      elementalAffinity: this.detectElementalAffinity(userMessage),
      frequency: 1
    };

    // Check if similar pattern exists
    const existingPattern = profile.responsePatterns.find(p =>
      p.stimulus === pattern.stimulus && p.elementalAffinity === pattern.elementalAffinity
    );

    if (existingPattern) {
      // Update existing pattern
      existingPattern.effectiveness = (existingPattern.effectiveness + effectiveness) / 2;
      existingPattern.frequency += 1;
    } else {
      // Add new pattern
      profile.responsePatterns.push(pattern);
    }

    // Update relationship depth
    profile.relationshipDepth = Math.min(1.0, profile.relationshipDepth + (effectiveness * 0.1));
    profile.lastInteraction = new Date();

    // Update cumulative growth
    if (effectiveness > 0.6) {
      profile.cumulativeGrowth = Math.min(1.0, profile.cumulativeGrowth + 0.05);
    }
  }

  private extractWisdomPatterns(
    userMessage: string,
    maiaResponse: string,
    therapeuticOutcome: string
  ): WisdomPattern[] {
    const patterns: WisdomPattern[] = [];

    // Extract therapeutic patterns from successful interactions
    if (therapeuticOutcome === 'breakthrough' || therapeuticOutcome === 'insight') {
      const pattern: WisdomPattern = {
        id: `pattern_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        pattern: this.extractPattern(userMessage, maiaResponse),
        source: "conversation",
        resonanceScore: 0.7, // Start with good score for successful outcomes
        applicabilityScope: [therapeuticOutcome],
        lastReinforced: new Date(),
        reinforcementCount: 1,
        associatedElements: [this.detectElementalAffinity(userMessage)],
        therapeuticValue: 0.8
      };
      patterns.push(pattern);
    }

    return patterns;
  }

  private integrateWisdomPattern(newPattern: WisdomPattern): void {
    // Check if similar pattern exists
    const existingPattern = Array.from(this.memory.wisdomPatterns.values())
      .find(p => this.arePatternsSimilar(p.pattern, newPattern.pattern));

    if (existingPattern) {
      // Reinforce existing pattern
      existingPattern.reinforcementCount += 1;
      existingPattern.resonanceScore = Math.min(1.0, existingPattern.resonanceScore + 0.1);
      existingPattern.lastReinforced = new Date();

      // Merge scopes
      existingPattern.applicabilityScope = [
        ...new Set([...existingPattern.applicabilityScope, ...newPattern.applicabilityScope])
      ];
    } else {
      // Add new pattern
      this.memory.wisdomPatterns.set(newPattern.id, newPattern);
    }
  }

  private detectEmergentInsights(): EmergentInsight[] {
    const insights: EmergentInsight[] = [];

    // Look for patterns that consistently work across different users
    const highResonancePatterns = Array.from(this.memory.wisdomPatterns.values())
      .filter(p => p.resonanceScore > 0.8 && p.reinforcementCount > 3);

    if (highResonancePatterns.length >= 3) {
      // Pattern convergence insight
      const insight: EmergentInsight = {
        insight: `Strong therapeutic convergence emerging around ${highResonancePatterns[0].associatedElements[0]} element approaches`,
        emergenceDate: new Date(),
        contributingPatterns: highResonancePatterns.slice(0, 3).map(p => p.id),
        validation: 0.7,
        applicability: ['general_therapy', 'elemental_work'],
        impact: 0.6
      };
      insights.push(insight);
    }

    return insights;
  }

  private updateFieldCoherence(): void {
    const coherence = this.memory.fieldCoherence;

    // Calculate overall coherence based on pattern resonance
    const patterns = Array.from(this.memory.wisdomPatterns.values());
    const avgResonance = patterns.length > 0
      ? patterns.reduce((sum, p) => sum + p.resonanceScore, 0) / patterns.length
      : 0.5;

    coherence.overallCoherence = avgResonance;

    // Update active patterns
    coherence.activePatterns = patterns
      .filter(p => p.resonanceScore > 0.7)
      .map(p => p.pattern)
      .slice(0, 5);

    // Update emerging patterns
    coherence.emergingPatterns = patterns
      .filter(p => p.reinforcementCount < 3 && p.resonanceScore > 0.6)
      .map(p => p.pattern)
      .slice(0, 3);

    coherence.lastAssessment = new Date();
  }

  private initializeHealingFrequencies(): TherapeuticFrequencyMap {
    return {
      fire: { frequency: 0.7, resonantUsers: [], effectiveness: 0.6, lastUpdated: new Date() },
      water: { frequency: 0.5, resonantUsers: [], effectiveness: 0.7, lastUpdated: new Date() },
      earth: { frequency: 0.4, resonantUsers: [], effectiveness: 0.8, lastUpdated: new Date() },
      air: { frequency: 0.6, resonantUsers: [], effectiveness: 0.7, lastUpdated: new Date() },
      aether: { frequency: 0.8, resonantUsers: [], effectiveness: 0.5, lastUpdated: new Date() }
    };
  }

  private initializeArchetypes(): ArchetypalActivation[] {
    return [
      {
        archetype: "Wise Guide",
        activationConditions: ["seeking direction", "confusion", "life transitions"],
        therapeuticValue: 0.8,
        userAffinities: [],
        integrationStrategies: ["gentle guidance", "perspective offering", "wisdom sharing"]
      },
      {
        archetype: "Compassionate Mother",
        activationConditions: ["emotional pain", "feeling alone", "need for comfort"],
        therapeuticValue: 0.9,
        userAffinities: [],
        integrationStrategies: ["unconditional presence", "emotional validation", "safety creation"]
      }
    ];
  }

  // Utility methods

  private extractStimulus(userMessage: string): string {
    // Extract key themes from user message
    const themes = ['anxiety', 'depression', 'confusion', 'anger', 'grief', 'joy', 'growth', 'insight'];
    const foundTheme = themes.find(theme => userMessage.toLowerCase().includes(theme));
    return foundTheme || 'general_support';
  }

  private extractResponseType(maiaResponse: string): string {
    // Categorize response type
    if (maiaResponse.includes('?')) return 'inquiry';
    if (maiaResponse.includes('understand') || maiaResponse.includes('hear')) return 'reflection';
    if (maiaResponse.includes('might') || maiaResponse.includes('could')) return 'suggestion';
    return 'supportive_presence';
  }

  private detectElementalAffinity(message: string): string {
    const msg = message.toLowerCase();

    if (msg.includes('passion') || msg.includes('energy') || msg.includes('drive')) return 'fire';
    if (msg.includes('emotion') || msg.includes('flow') || msg.includes('feeling')) return 'water';
    if (msg.includes('practical') || msg.includes('grounded') || msg.includes('body')) return 'earth';
    if (msg.includes('thinking') || msg.includes('clarity') || msg.includes('understand')) return 'air';
    if (msg.includes('spiritual') || msg.includes('meaning') || msg.includes('purpose')) return 'aether';

    return 'water'; // Default to water (emotional/relational)
  }

  private extractPattern(userMessage: string, maiaResponse: string): string {
    // Extract therapeutic pattern from interaction
    const stimulus = this.extractStimulus(userMessage);
    const responseType = this.extractResponseType(maiaResponse);
    return `${stimulus} → ${responseType}`;
  }

  private arePatternsSimilar(pattern1: string, pattern2: string): boolean {
    // Simple similarity check - could be enhanced with semantic analysis
    return pattern1 === pattern2;
  }

  private persistMemory(): void {
    try {
      const serializable = {
        wisdomPatterns: Array.from(this.memory.wisdomPatterns.entries()),
        userResonances: Array.from(this.memory.userResonances.entries()),
        emergentInsights: this.memory.emergentInsights,
        healingFrequencies: this.memory.healingFrequencies,
        archetypeActivations: this.memory.archetypeActivations,
        fieldCoherence: this.memory.fieldCoherence
      };

      // In a real implementation, this would use a proper database
      // For now, just maintain in-memory state
    } catch (error) {
      console.error('Failed to persist collective memory:', error);
    }
  }

  private loadPersistedMemory(): void {
    try {
      // In a real implementation, this would load from database
      // For now, start with initialized state
    } catch (error) {
      console.error('Failed to load persisted memory:', error);
    }
  }
}