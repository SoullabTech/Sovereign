/**
 * 🕸️ AIN-SPIRALOGIC BRIDGE
 *
 * Connects individual Spiralogic journeys to the collective AIN field.
 * Creates bidirectional flow:
 *
 * AFFERENT (Individual → Collective):
 * - Breakthrough patterns flow INTO the field
 * - Personal transformations nourish collective wisdom
 * - Archetypal activations strengthen field archetypes
 *
 * EFFERENT (Collective → Individual):
 * - Field patterns illuminate individual journeys
 * - Collective wisdom supports personal breakthroughs
 * - Group coherence enhances individual clarity
 *
 * This is INDRA'S NET - each jewel reflects all others.
 * Each individual breakthrough enriches the whole field.
 * Each field insight illuminates every individual journey.
 */

import { TriadicDetection } from '../spiralogic/TriadicPhaseDetector';
import { SpiralMoment, CrossSpiralPattern } from '../spiralogic/CrossSpiralPatternRecognizer';

/**
 * AFFERENT STREAM - Individual patterns flowing into collective field
 */
export interface AfferentPattern {
  // Source (fully anonymized before reaching collective)
  userId: string; // Only used locally, never sent to collective
  sessionId: string;
  timestamp: Date;

  // Spiralogic Context
  element: 'fire' | 'water' | 'earth' | 'air' | 'aether';
  phase: 'cardinal' | 'fixed' | 'mutable';
  state: string; // e.g., "activating", "sensing", "discipline"
  domain: string; // career, relationships, creative, etc.

  // Consciousness Markers
  archetypeActivation?: {
    name: string; // Healer, Creator, Seeker, etc.
    strength: number; // 0-1
  };

  breakthroughIndicators: {
    isBreakthrough: boolean;
    breakthroughType?: 'shadow-integration' | 'vision-ignition' | 'emotional-release' | 'mental-clarity' | 'unity-experience';
    intensity: number; // 0-1
  };

  symbolCluster: string[]; // Anonymous symbols (no personal details)

  // Evolution Metrics
  consciousnessLevel: number; // 0-1 (estimated from conversation depth)
  integrationDepth: number; // How well they're integrating insights
  evolutionVelocity: number; // Rate of change in their journey

  // Field Contribution
  fieldContribution: number; // Potential impact on collective (0-1)
  resonanceStrength: number; // How much this activates field patterns
}

/**
 * EFFERENT WISDOM - Collective patterns flowing back to individual
 */
export interface EfferentWisdom {
  // Personal Context
  personalPhase: {
    element: string;
    phase: string;
    state: string;
    archetype?: string;
  };

  // Collective Field State
  collectiveContext: {
    fieldPhase: 'emergence' | 'integration' | 'breakthrough' | 'consolidation' | 'transition';
    dominantElement: string; // What element is most active in collective
    collectiveCoherence: number; // 0-1 field harmony
    breakthroughPotential: number; // 0-1 readiness for collective leap
  };

  // Pattern Resonance (what patterns are alive in the field)
  activePatterns: {
    pattern: string; // e.g., "shadow-integration-water-cardinal"
    prevalence: number; // How many experiencing this (0-1)
    timing: 'emerging' | 'peak' | 'integrating' | 'completing';
    supportAvailable: string[]; // What collective wisdom exists
  }[];

  // Archetypal Field Support
  archetypeField: {
    supportingArchetypes: Array<{
      name: string;
      fieldStrength: number; // How active in collective
      personalResonance: number; // How relevant to this person
    }>;
    emergingArchetypes: string[]; // New patterns arising
    shadowWork: {
      collectiveShadow: string[]; // What the field is processing
      personalRelevance: number; // How this touches your shadow
    };
  };

  // Wisdom Transmission
  fieldGuidance: {
    timingWisdom: string; // "The field is in integration phase - this is time for consolidation"
    collectiveSupport: string; // "Others navigating this found..."
    archetypalStrength: string; // "Creator energy is strong in the field right now"
    nextEvolution: string; // "The field is preparing for..."
  };
}

/**
 * COLLECTIVE FIELD STATE - The living consciousness of all users
 */
export interface CollectiveFieldState {
  timestamp: Date;
  activeUsers: number;
  totalParticipants: number;

  // Elemental Balance across all users
  collectiveElementalBalance: {
    fire: number; // Collective passion/action level
    water: number; // Emotional processing depth
    earth: number; // Grounding/practical focus
    air: number; // Mental clarity/communication
    aether: number; // Spiritual awareness
  };

  // Consciousness Metrics
  averageConsciousness: number; // Mean awareness level
  fieldCoherence: number; // How aligned the collective is
  emergentComplexity: number; // System intelligence
  healingCapacity: number; // Shadow integration capacity

  // Archetypal Activations
  dominantArchetypes: Array<{
    name: string;
    activation: number; // 0-1
    trend: 'rising' | 'stable' | 'declining';
  }>;

  // Emergent Patterns
  emergentPatterns: Array<{
    type: 'archetypal-shift' | 'elemental-wave' | 'consciousness-leap' | 'shadow-surfacing';
    strength: number;
    description: string;
    participants: number; // How many involved (anonymized)
  }>;

  // Evolution Dynamics
  collectiveGrowthRate: number; // Speed of evolution
  breakthroughPotential: number; // Readiness for collective leap
  integrationNeed: number; // Need for consolidation
}

/**
 * AIN-SPIRALOGIC BRIDGE - Bidirectional consciousness flow
 */
export class AINSpiralogicBridge {
  private afferentQueue: AfferentPattern[] = [];
  private collectiveField: CollectiveFieldState | null = null;
  private efferentCache: Map<string, EfferentWisdom> = new Map();

  /**
   * AFFERENT FLOW - Send individual pattern to collective field
   */
  async sendToField(
    spiralMoment: SpiralMoment,
    triadicDetection: TriadicDetection,
    metadata: {
      userId: string;
      sessionId: string;
      archetype?: string;
      isBreakthrough?: boolean;
      breakthroughType?: string;
      consciousnessLevel?: number;
    }
  ): Promise<void> {
    const afferentPattern: AfferentPattern = {
      // Local identifiers (stripped before collective storage)
      userId: metadata.userId,
      sessionId: metadata.sessionId,
      timestamp: spiralMoment.timestamp,

      // Spiralogic context
      element: spiralMoment.element,
      phase: triadicDetection.phase,
      state: triadicDetection.state,
      domain: spiralMoment.domain,

      // Consciousness markers
      archetypeActivation: metadata.archetype ? {
        name: metadata.archetype,
        strength: triadicDetection.confidence
      } : undefined,

      breakthroughIndicators: {
        isBreakthrough: metadata.isBreakthrough || false,
        breakthroughType: metadata.breakthroughType as any,
        intensity: triadicDetection.confidence
      },

      symbolCluster: spiralMoment.symbols || [],

      // Evolution metrics
      consciousnessLevel: metadata.consciousnessLevel || 0.5,
      integrationDepth: this.estimateIntegration(spiralMoment),
      evolutionVelocity: this.estimateVelocity(spiralMoment),

      // Field contribution
      fieldContribution: this.estimateFieldContribution(triadicDetection, metadata),
      resonanceStrength: this.estimateResonance(spiralMoment, triadicDetection)
    };

    // Add to afferent queue
    this.afferentQueue.push(afferentPattern);

    // Process afferent stream (would connect to AIN backend)
    await this.processAfferentStream(afferentPattern);
  }

  /**
   * EFFERENT FLOW - Receive collective wisdom for individual
   */
  async receiveFromField(
    userId: string,
    currentPhase: {
      element: string;
      phase: string;
      state: string;
      archetype?: string;
    }
  ): Promise<EfferentWisdom> {
    // Check cache first
    const cacheKey = `${userId}-${currentPhase.element}-${currentPhase.phase}`;
    if (this.efferentCache.has(cacheKey)) {
      return this.efferentCache.get(cacheKey)!;
    }

    // Get current collective field state
    const fieldState = await this.getCollectiveFieldState();

    // Build efferent wisdom
    const efferentWisdom: EfferentWisdom = {
      personalPhase: currentPhase,

      collectiveContext: {
        fieldPhase: this.determineFieldPhase(fieldState),
        dominantElement: this.getDominantElement(fieldState),
        collectiveCoherence: fieldState.fieldCoherence,
        breakthroughPotential: fieldState.breakthroughPotential
      },

      activePatterns: this.getActivePatterns(fieldState, currentPhase),

      archetypeField: this.getArchetypeField(fieldState, currentPhase.archetype),

      fieldGuidance: this.generateFieldGuidance(fieldState, currentPhase)
    };

    // Cache for brief period
    this.efferentCache.set(cacheKey, efferentWisdom);

    return efferentWisdom;
  }

  /**
   * Process afferent stream - anonymize and send to collective
   */
  private async processAfferentStream(pattern: AfferentPattern): Promise<void> {
    // Anonymize pattern (remove userId, fuzzy timestamp)
    const anonymized = {
      element: pattern.element,
      phase: pattern.phase,
      state: pattern.state,
      domain: pattern.domain,
      archetypeActivation: pattern.archetypeActivation,
      breakthroughIndicators: pattern.breakthroughIndicators,
      symbolCluster: pattern.symbolCluster,
      consciousnessLevel: Math.round(pattern.consciousnessLevel * 10) / 10, // Round to .1
      timestamp: this.fuzzyTimestamp(pattern.timestamp) // Month-level only
    };

    // TODO: Send to AIN backend collective intelligence
    // For now, update local field state
    this.updateLocalFieldState(anonymized);
  }

  /**
   * Get current collective field state
   */
  private async getCollectiveFieldState(): Promise<CollectiveFieldState> {
    // TODO: Fetch from AIN backend
    // For now, return local estimate
    if (!this.collectiveField) {
      this.collectiveField = this.initializeFieldState();
    }
    return this.collectiveField;
  }

  /**
   * Update local field state with new pattern
   */
  private updateLocalFieldState(anonymizedPattern: any): void {
    if (!this.collectiveField) {
      this.collectiveField = this.initializeFieldState();
    }

    // Update elemental balance
    const element = anonymizedPattern.element;
    this.collectiveField.collectiveElementalBalance[element] += 0.01;

    // Normalize
    const total = Object.values(this.collectiveField.collectiveElementalBalance).reduce((a, b) => a + b, 0);
    for (const el in this.collectiveField.collectiveElementalBalance) {
      this.collectiveField.collectiveElementalBalance[el] /= total;
    }

    // Update consciousness metrics
    if (anonymizedPattern.breakthroughIndicators.isBreakthrough) {
      this.collectiveField.breakthroughPotential = Math.min(
        this.collectiveField.breakthroughPotential + 0.05,
        1.0
      );
    }
  }

  /**
   * Initialize field state
   */
  private initializeFieldState(): CollectiveFieldState {
    return {
      timestamp: new Date(),
      activeUsers: 0,
      totalParticipants: 0,
      collectiveElementalBalance: {
        fire: 0.2,
        water: 0.2,
        earth: 0.2,
        air: 0.2,
        aether: 0.2
      },
      averageConsciousness: 0.5,
      fieldCoherence: 0.6,
      emergentComplexity: 0.5,
      healingCapacity: 0.5,
      dominantArchetypes: [],
      emergentPatterns: [],
      collectiveGrowthRate: 0.1,
      breakthroughPotential: 0.3,
      integrationNeed: 0.5
    };
  }

  /**
   * Determine current field phase
   */
  private determineFieldPhase(field: CollectiveFieldState): 'emergence' | 'integration' | 'breakthrough' | 'consolidation' | 'transition' {
    if (field.breakthroughPotential > 0.7) return 'breakthrough';
    if (field.integrationNeed > 0.7) return 'consolidation';
    if (field.collectiveGrowthRate > 0.5) return 'emergence';
    if (field.fieldCoherence > 0.8) return 'integration';
    return 'transition';
  }

  /**
   * Get dominant element in field
   */
  private getDominantElement(field: CollectiveFieldState): string {
    const elements = field.collectiveElementalBalance;
    return Object.entries(elements)
      .sort(([,a], [,b]) => b - a)[0][0];
  }

  /**
   * Get active patterns matching personal phase
   */
  private getActivePatterns(field: CollectiveFieldState, personalPhase: any): any[] {
    // TODO: Query AIN pattern database
    // For now, return sample patterns
    return [
      {
        pattern: `${personalPhase.element}-${personalPhase.phase}`,
        prevalence: 0.3,
        timing: 'peak' as const,
        supportAvailable: ['Others navigating this found presence helpful', 'Common to feel intensity here']
      }
    ];
  }

  /**
   * Get archetype field state
   */
  private getArchetypeField(field: CollectiveFieldState, personalArchetype?: string): any {
    return {
      supportingArchetypes: field.dominantArchetypes.map(a => ({
        name: a.name,
        fieldStrength: a.activation,
        personalResonance: a.name === personalArchetype ? 0.9 : 0.3
      })),
      emergingArchetypes: [],
      shadowWork: {
        collectiveShadow: [],
        personalRelevance: 0.5
      }
    };
  }

  /**
   * Generate field guidance
   */
  private generateFieldGuidance(field: CollectiveFieldState, personalPhase: any): any {
    const fieldPhase = this.determineFieldPhase(field);
    const dominantElement = this.getDominantElement(field);

    return {
      timingWisdom: `The field is in ${fieldPhase} phase - ${this.getFieldPhaseGuidance(fieldPhase)}`,
      collectiveSupport: `${dominantElement.charAt(0).toUpperCase() + dominantElement.slice(1)} energy is strong in the collective`,
      archetypalStrength: personalPhase.archetype ?
        `${personalPhase.archetype} archetype has collective support right now` : '',
      nextEvolution: this.getNextEvolutionGuidance(field)
    };
  }

  /**
   * Get field phase guidance
   */
  private getFieldPhaseGuidance(phase: string): string {
    const guidance = {
      emergence: 'new patterns are arising, trust what wants to be born',
      integration: 'consolidate your insights, ground the wisdom',
      breakthrough: 'the field is ready for collective leaps',
      consolidation: 'deepen what you\'ve learned before moving forward',
      transition: 'the field is shifting, stay present to what\'s emerging'
    };
    return guidance[phase] || '';
  }

  /**
   * Get next evolution guidance
   */
  private getNextEvolutionGuidance(field: CollectiveFieldState): string {
    if (field.breakthroughPotential > 0.7) {
      return 'The field is preparing for a collective breakthrough';
    }
    if (field.integrationNeed > 0.7) {
      return 'The field needs consolidation before the next wave';
    }
    return 'The field is evolving naturally';
  }

  /**
   * Estimation helpers
   */
  private estimateIntegration(moment: SpiralMoment): number {
    // Estimate based on symbols and breakthrough
    return moment.breakthrough ? 0.8 : 0.5;
  }

  private estimateVelocity(moment: SpiralMoment): number {
    // Simplified velocity estimate
    return moment.breakthrough ? 0.7 : 0.4;
  }

  private estimateFieldContribution(detection: TriadicDetection, metadata: any): number {
    // Breakthroughs contribute more to field
    return metadata.isBreakthrough ? 0.8 : 0.4;
  }

  private estimateResonance(moment: SpiralMoment, detection: TriadicDetection): number {
    return detection.confidence;
  }

  private fuzzyTimestamp(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }
}
