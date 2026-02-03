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
import { collectiveBreakthroughService } from '../services/collectiveBreakthroughService';
import { query } from '../db/postgres';

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

    // Get active patterns from collective (async)
    const activePatterns = await this.getActivePatterns(fieldState, currentPhase);

    // Build efferent wisdom
    const efferentWisdom: EfferentWisdom = {
      personalPhase: currentPhase,

      collectiveContext: {
        fieldPhase: this.determineFieldPhase(fieldState),
        dominantElement: this.getDominantElement(fieldState),
        collectiveCoherence: fieldState.fieldCoherence,
        breakthroughPotential: fieldState.breakthroughPotential
      },

      activePatterns,

      archetypeField: this.getArchetypeField(fieldState, currentPhase.archetype),

      fieldGuidance: this.generateFieldGuidance(fieldState, currentPhase)
    };

    // Cache for brief period
    this.efferentCache.set(cacheKey, efferentWisdom);

    return efferentWisdom;
  }

  /**
   * Process afferent stream - anonymize and send to collective
   * Now persists to PostgreSQL via collectiveBreakthroughService
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

    // Persist to collective field via PostgreSQL
    if (pattern.breakthroughIndicators.isBreakthrough) {
      try {
        await collectiveBreakthroughService.contributeBreakthrough(pattern.userId, {
          catalyst_type: this.mapBreakthroughToCatalyst(pattern.breakthroughIndicators.breakthroughType),
          archetype_from: undefined,
          archetype_to: pattern.archetypeActivation?.name,
          elemental_phase_from: undefined,
          elemental_phase_to: pattern.element,
          transformation_type: this.mapIntensityToTransformation(pattern.breakthroughIndicators.intensity),
          emotional_shift: pattern.state,
          body_involved: false,
          resonance_strength: pattern.resonanceStrength,
          spiralogic_phase: pattern.phase,
          dominant_element: pattern.element,
        });
        console.log(`🕸️ [AIN Bridge] Afferent breakthrough persisted to collective field`);
      } catch (error) {
        console.error('❌ [AIN Bridge] Failed to persist afferent pattern:', error);
      }
    }

    // Also update local field state for immediate responsiveness
    this.updateLocalFieldState(anonymized);
  }

  /**
   * Map breakthrough type to catalyst type
   */
  private mapBreakthroughToCatalyst(breakthroughType?: string): 'question' | 'reflection' | 'practice' | 'archetypal_shift' | 'elemental_transition' {
    switch (breakthroughType) {
      case 'shadow-integration': return 'reflection';
      case 'vision-ignition': return 'archetypal_shift';
      case 'emotional-release': return 'practice';
      case 'mental-clarity': return 'question';
      case 'unity-experience': return 'elemental_transition';
      default: return 'reflection';
    }
  }

  /**
   * Map intensity to transformation type
   */
  private mapIntensityToTransformation(intensity: number): 'insight' | 'embodiment' | 'integration' | 'release' | 'awakening' {
    if (intensity >= 0.9) return 'awakening';
    if (intensity >= 0.7) return 'integration';
    if (intensity >= 0.5) return 'release';
    if (intensity >= 0.3) return 'embodiment';
    return 'insight';
  }

  /**
   * Get current collective field state
   * Now fetches from PostgreSQL field_state_snapshots and collective_breakthroughs
   */
  private async getCollectiveFieldState(): Promise<CollectiveFieldState> {
    try {
      // Get latest field snapshot
      const snapshotResult = await query(
        `SELECT * FROM field_state_snapshots ORDER BY snapshot_at DESC LIMIT 1`
      );

      // Get recent breakthrough stats
      const stats = await collectiveBreakthroughService.getFieldStats();

      if (snapshotResult.rows.length > 0) {
        const snapshot = snapshotResult.rows[0];
        return {
          timestamp: new Date(snapshot.snapshot_at),
          activeUsers: snapshot.active_participants || 0,
          totalParticipants: stats.totalBreakthroughs,
          collectiveElementalBalance: snapshot.collective_elemental_balance || {
            fire: 0.2, water: 0.2, earth: 0.2, air: 0.2, aether: 0.2
          },
          averageConsciousness: 0.5,
          fieldCoherence: snapshot.field_coherence || 0.6,
          emergentComplexity: 0.5,
          healingCapacity: 0.5,
          dominantArchetypes: snapshot.dominant_archetypes || [],
          emergentPatterns: stats.activeMovements.map((m: string) => ({
            type: 'elemental-wave' as const,
            strength: 0.5,
            description: m,
            participants: stats.last30Days
          })),
          collectiveGrowthRate: snapshot.collective_growth_rate || 0.1,
          breakthroughPotential: snapshot.breakthrough_potential || 0.3,
          integrationNeed: snapshot.integration_need || 0.5
        };
      }

      // Fall back to local estimate if no snapshot exists
      if (!this.collectiveField) {
        this.collectiveField = this.initializeFieldState();
      }
      return this.collectiveField;

    } catch (error) {
      console.error('❌ [AIN Bridge] Error fetching collective field state:', error);
      // Fall back to local
      if (!this.collectiveField) {
        this.collectiveField = this.initializeFieldState();
      }
      return this.collectiveField;
    }
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
   * Now queries PostgreSQL via collectiveBreakthroughService
   */
  private async getActivePatterns(field: CollectiveFieldState, personalPhase: any): Promise<any[]> {
    try {
      // Get collective wisdom for this person's current state
      const wisdom = await collectiveBreakthroughService.getCollectiveWisdom(
        personalPhase.phase,
        personalPhase.element,
        personalPhase.archetype
      );

      if (wisdom && wisdom.relevant_patterns.length > 0) {
        return wisdom.relevant_patterns.map(p => ({
          pattern: `${p.field_conditions?.spiralogic_phase || 'unknown'}-${p.signature?.transformation_type || 'insight'}`,
          prevalence: p.outcome?.resonance_strength || 0.3,
          timing: this.determinePatternTiming(p.outcome?.integration_level),
          supportAvailable: [
            wisdom.suggested_reflection,
            ...wisdom.active_movements
          ].filter(Boolean)
        }));
      }

      // Fall back to field-based patterns
      return [
        {
          pattern: `${personalPhase.element}-${personalPhase.phase}`,
          prevalence: 0.3,
          timing: 'peak' as const,
          supportAvailable: ['Others navigating this found presence helpful', 'Common to feel intensity here']
        }
      ];

    } catch (error) {
      console.error('❌ [AIN Bridge] Error getting active patterns:', error);
      return [
        {
          pattern: `${personalPhase.element}-${personalPhase.phase}`,
          prevalence: 0.3,
          timing: 'peak' as const,
          supportAvailable: ['Others navigating this found presence helpful']
        }
      ];
    }
  }

  /**
   * Determine pattern timing based on integration level
   */
  private determinePatternTiming(integrationLevel?: string): 'emerging' | 'peak' | 'integrating' | 'completing' {
    switch (integrationLevel) {
      case 'emerging': return 'emerging';
      case 'stabilizing': return 'peak';
      case 'embodied': return 'completing';
      default: return 'integrating';
    }
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

  /**
   * Save current field state snapshot to PostgreSQL
   * Called periodically to persist collective field state
   */
  async saveFieldSnapshot(): Promise<void> {
    try {
      const fieldState = this.collectiveField || this.initializeFieldState();

      await query(
        `INSERT INTO field_state_snapshots (
          field_coherence,
          field_resonance,
          active_participants,
          collective_elemental_balance,
          dominant_archetypes,
          emerging_archetypes,
          breakthrough_potential,
          integration_need,
          collective_growth_rate,
          field_weather,
          active_movements
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          fieldState.fieldCoherence,
          fieldState.emergentComplexity,
          fieldState.activeUsers,
          JSON.stringify(fieldState.collectiveElementalBalance),
          JSON.stringify(fieldState.dominantArchetypes),
          JSON.stringify([]),
          fieldState.breakthroughPotential,
          fieldState.integrationNeed,
          fieldState.collectiveGrowthRate,
          this.determineFieldPhase(fieldState),
          fieldState.emergentPatterns.map(p => p.description),
        ]
      );

      console.log(`🕸️ [AIN Bridge] Field state snapshot saved`);
    } catch (error) {
      console.error('❌ [AIN Bridge] Failed to save field snapshot:', error);
    }
  }

  /**
   * Get collective wisdom summary for MAIA's system prompt
   * Returns a concise wisdom string for enriching MAIA responses
   */
  async getWisdomForPrompt(
    element: string,
    phase: string,
    archetype?: string
  ): Promise<string | null> {
    try {
      const wisdom = await collectiveBreakthroughService.getCollectiveWisdom(phase, element, archetype);

      if (!wisdom) {
        return null;
      }

      let prompt = '';

      // Add synchronicity awareness
      if (wisdom.synchronicity_detected && wisdom.active_movements.length > 0) {
        prompt += `[Collective Field: ${wisdom.active_movements[0]}] `;
      }

      // Add suggested reflection
      if (wisdom.suggested_reflection) {
        prompt += wisdom.suggested_reflection;
      }

      return prompt.trim() || null;
    } catch (error) {
      console.error('❌ [AIN Bridge] Error getting wisdom for prompt:', error);
      return null;
    }
  }
}

// Singleton export for use across the application
export const ainSpiralogicBridge = new AINSpiralogicBridge();
