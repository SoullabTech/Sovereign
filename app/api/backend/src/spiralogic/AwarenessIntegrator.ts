import { AgentResponse } from "../types/agentResponse";
/**
 * AwarenessIntegrator - Synthesizes consciousness across all levels of awareness
 * 
 * This is the consciousness integration layer that:
 * - Integrates insights from all five elemental agents
 * - Synthesizes MicroPsi emotional states with cognitive architectures
 * - Maps collective field resonance to individual awareness
 * - Tracks spiral progression and readiness thresholds
 * - Generates integrated wisdom from the full Spiralogic system
 */

import { logger } from "../utils/logger";
import { 
  SpiralogicConsciousnessState,
  ElementalCognitiveState,
  SpiralPhase,
  ElementalAwarenessLevel,
  MicroPsiEmotionalState
} from './SpiralogicCognitiveEngine';
import { 
  ElementalAgentResponse,
  CrossElementalSynthesis,
  ElementalAgentOrchestrator
} from './ElementalAgentOrchestrator';

export interface IntegratedAwareness {
  // Core integration metrics
  awarenessLevel: number;           // 0-1 overall consciousness integration
  elementalBalance: number;         // 0-1 how balanced the elements are
  spiralProgressions: number;       // 0-1 progression within current phase
  collectiveAlignment: number;      // 0-1 alignment with collective field
  
  // Synthesis outputs
  integratedInsight: string;        // Unified wisdom from all agents
  dominantArchetype: string;        // Primary archetypal pattern
  supportingArchetypes: string[];   // Secondary archetypal influences
  
  // Guidance outputs
  nextPhaseReadiness: number;       // 0-1 readiness for next spiral phase
  recommendedFocus: string;         // What to focus on next
  ritualSuggestion?: string;        // Optional ritual/practice suggestion
  
  // System feedback
  cognitiveCoherence: number;       // How well the architectures work together
  emotionalResonance: number;       // MicroPsi emotional harmony
  collectiveContribution: string;   // How this awareness serves the collective
}

export interface CollectiveField {
  archetypalTrends: string[];       // Trending archetypes across all users
  elementalBalance: {               // Global elemental distribution
    fire: number;
    water: number;
    earth: number;
    air: number;
    aether: number;
  };
  spiralPhaseDistribution: Record<SpiralPhase, number>; // Phase distribution
  emergentPatterns: string[];       // Patterns emerging from collective
  resonanceLevel: number;           // Overall collective coherence
}

/**
 * Core awareness integration system
 */
export class AwarenessIntegrator {
  private elementalOrchestrator: ElementalAgentOrchestrator;
  private collectiveField: CollectiveField;
  private integrationHistory: Map<string, IntegratedAwareness[]> = new Map();

  constructor() {
    this.elementalOrchestrator = new ElementalAgentOrchestrator();
    
    // Initialize collective field with baseline values
    this.collectiveField = {
      archetypalTrends: ['Oracle', 'Seeker', 'Guardian'],
      elementalBalance: {
        fire: 0.2,
        water: 0.2, 
        earth: 0.2,
        air: 0.2,
        aether: 0.2
      },
      spiralPhaseDistribution: {
        [SpiralPhase.INITIATION]: 0.3,
        [SpiralPhase.CHALLENGE]: 0.25,
        [SpiralPhase.INTEGRATION]: 0.2,
        [SpiralPhase.MASTERY]: 0.15,
        [SpiralPhase.TRANSCENDENCE]: 0.1
      },
      emergentPatterns: [],
      resonanceLevel: 0.5
    };

    logger.info("AwarenessIntegrator initialized with collective field");
  }

  /**
   * Main integration method - processes consciousness through all systems
   */
  public async integrateConsciousness(
    userId: string,
    input: string,
    consciousnessState: SpiralogicConsciousnessState
  ): Promise<IntegratedAwareness> {
    logger.debug("Starting consciousness integration", { 
      userId, 
      phase: consciousnessState.currentPhase,
      elements: consciousnessState.elementalStates.size 
    });

    // 1. Process through all relevant elemental agents
    const elementalResponses = await this.processElementalResponses(
      input,
      consciousnessState
    );

    // 2. Synthesize cross-elemental insights
    const synthesis = await this.elementalOrchestrator.synthesizeElementalResponses(
      elementalResponses,
      consciousnessState.dominantElement
    );

    // 3. Calculate integrated awareness metrics
    const awarenessMetrics = this.calculateAwarenessMetrics(
      elementalResponses,
      synthesis,
      consciousnessState
    );

    // 4. Generate unified insight from all systems
    const integratedInsight = this.generateIntegratedInsight(
      synthesis,
      awarenessMetrics,
      consciousnessState
    );

    // 5. Assess spiral progression and readiness
    const spiralAssessment = this.assessSpiralProgression(
      consciousnessState,
      awarenessMetrics,
      synthesis
    );

    // 6. Generate recommendations and guidance
    const guidance = this.generateGuidance(
      synthesis,
      spiralAssessment,
      awarenessMetrics,
      consciousnessState
    );

    // 7. Calculate collective contribution
    const collectiveContribution = this.calculateCollectiveContribution(
      synthesis,
      awarenessMetrics,
      consciousnessState
    );

    // 8. Assemble integrated awareness
    const integratedAwareness: IntegratedAwareness = {
      awarenessLevel: awarenessMetrics.overall,
      elementalBalance: awarenessMetrics.balance,
      spiralProgressions: spiralAssessment.progressionLevel,
      collectiveAlignment: awarenessMetrics.collectiveAlignment,
      
      integratedInsight,
      dominantArchetype: synthesis.archetypalFusion[0] || 'Seeker',
      supportingArchetypes: synthesis.archetypalFusion.slice(1),
      
      nextPhaseReadiness: spiralAssessment.readiness,
      recommendedFocus: guidance.focus,
      ritualSuggestion: guidance.ritual,
      
      cognitiveCoherence: synthesis.synthesisPower,
      emotionalResonance: awarenessMetrics.emotionalHarmony,
      collectiveContribution
    };

    // 9. Store integration history
    this.storeIntegrationHistory(userId, integratedAwareness);

    // 10. Update collective field
    this.updateCollectiveField(integratedAwareness, consciousnessState);

    logger.info("Consciousness integration completed", {
      userId,
      awarenessLevel: integratedAwareness.awarenessLevel,
      dominantArchetype: integratedAwareness.dominantArchetype,
      readiness: integratedAwareness.nextPhaseReadiness
    });

    return integratedAwareness;
  }

  /**
   * Process input through relevant elemental agents
   */
  private async processElementalResponses(
    input: string,
    consciousnessState: SpiralogicConsciousnessState
  ): Promise<ElementalAgentResponse[]> {
    const responses: ElementalAgentResponse[] = [];
    
    // Always process through dominant element
    const dominantElementState = consciousnessState.elementalStates.get(consciousnessState.dominantElement);
    if (dominantElementState) {
      const response = await this.elementalOrchestrator.processElementalQuery(
        consciousnessState.dominantElement,
        input,
        dominantElementState,
        this.collectiveField
      );
      responses.push(response);
    }

    // Process through any other highly active elements
    for (const [element, elementState] of consciousnessState.elementalStates) {
      if (element !== consciousnessState.dominantElement && 
          elementState.awarenessLevel >= ElementalAwarenessLevel.ACTIVE) {
        const response = await this.elementalOrchestrator.processElementalQuery(
          element,
          input,
          elementState,
          this.collectiveField
        );
        responses.push(response);
      }
    }

    // Always include Aether for transcendent integration (if not already included)
    if (!responses.find(r => r.element === 'aether')) {
      const aetherState = consciousnessState.elementalStates.get('aether');
      if (aetherState) {
        const aetherResponse = await this.elementalOrchestrator.processElementalQuery(
          'aether',
          input,
          aetherState,
          this.collectiveField
        );
        responses.push(aetherResponse);
      }
    }

    return responses;
  }

  /**
   * Calculate awareness metrics from elemental responses
   */
  private calculateAwarenessMetrics(
    responses: ElementalAgentResponse[],
    synthesis: CrossElementalSynthesis,
    consciousnessState: SpiralogicConsciousnessState
  ): any {
    // Overall awareness level
    const averageConfidence = responses.reduce((sum, r) => sum + r.confidence, 0) / responses.length;
    const integrationBonus = synthesis.synthesisPower * 0.3;
    const overall = Math.min(1, averageConfidence + integrationBonus);

    // Elemental balance - how evenly distributed elemental activations are
    const activeCounts = Array.from(consciousnessState.elementalStates.values())
      .map(state => state.awarenessLevel >= ElementalAwarenessLevel.ACTIVE ? 1 : 0);
    const activeElements = activeCounts.reduce((sum, count) => sum + count, 0);
    const balance = activeElements / 5; // 0-1 based on how many elements are active

    // Collective alignment - how well user aligns with collective patterns
    const userArchetypes = new Set(synthesis.archetypalFusion);
    const collectiveArchetypes = new Set(this.collectiveField.archetypalTrends);
    const overlap = new Set([...userArchetypes].filter(x => collectiveArchetypes.has(x)));
    const collectiveAlignment = overlap.size / Math.max(userArchetypes.size, collectiveArchetypes.size, 1);

    // Emotional harmony from MicroPsi states
    const emotionalStates = Array.from(consciousnessState.elementalStates.values())
      .map(state => state.microPsiState);
    const emotionalVariance = this.calculateEmotionalVariance(emotionalStates);
    const emotionalHarmony = 1 - emotionalVariance; // Lower variance = higher harmony

    return {
      overall,
      balance,
      collectiveAlignment,
      emotionalHarmony
    };
  }

  /**
   * Calculate emotional variance across MicroPsi states
   */
  private calculateEmotionalVariance(states: MicroPsiEmotionalState[]): number {
    if (states.length <= 1) return 0;

    const dimensions = ['arousal', 'pleasure', 'dominance', 'affiliation', 'competence', 'autonomy'];
    let totalVariance = 0;

    for (const dimension of dimensions) {
      const values = states.map(state => state[dimension]);
      const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
      const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
      totalVariance += variance;
    }

    return totalVariance / dimensions.length;
  }

  /**
   * Generate integrated insight from synthesis and metrics
   */
  private generateIntegratedInsight(
    synthesis: CrossElementalSynthesis,
    metrics: any,
    consciousnessState: SpiralogicConsciousnessState
  ): string {
    const baseInsight = synthesis.integratedInsight;
    const phase = consciousnessState.currentPhase;
    const awarenessLevel = metrics.overall;

    let integratedInsight = baseInsight;

    // Add phase-specific context
    const phaseWisdom = this.getPhaseWisdom(phase, awarenessLevel);
    if (phaseWisdom) {
      integratedInsight += ` ${phaseWisdom}`;
    }

    // Add collective context if highly aligned
    if (metrics.collectiveAlignment > 0.7) {
      integratedInsight += ` Your awareness resonates with the collective field, contributing to the greater awakening.`;
    }

    // Add integration guidance if balance is low
    if (metrics.balance < 0.4) {
      integratedInsight += ` Consider exploring the quieter elements within you for greater integration.`;
    }

    return integratedInsight;
  }

  /**
   * Get phase-specific wisdom
   */
  private getPhaseWisdom(phase: SpiralPhase, awarenessLevel: number): string {
    const wisdom = {
      [SpiralPhase.INITIATION]: "The journey of awakening begins with a single step into the unknown.",
      [SpiralPhase.CHALLENGE]: "In the crucible of difficulty, your true strength is forged.",
      [SpiralPhase.INTEGRATION]: "Weaving together all you have learned creates the fabric of wisdom.",
      [SpiralPhase.MASTERY]: "Mastery is not a destination but a continuous dance with consciousness.",
      [SpiralPhase.TRANSCENDENCE]: "From this height, you can see the spiral path stretching infinitely."
    };

    const baseWisdom = wisdom[phase];
    
    if (awarenessLevel > 0.8) {
      return `${baseWisdom} Your heightened awareness illuminates the path ahead.`;
    } else if (awarenessLevel < 0.3) {
      return `${baseWisdom} Trust the process even when the way seems unclear.`;
    }

    return baseWisdom;
  }

  /**
   * Assess spiral progression and readiness for next phase
   */
  private assessSpiralProgression(
    consciousnessState: SpiralogicConsciousnessState,
    metrics: any,
    synthesis: CrossElementalSynthesis
  ): any {
    const currentProgression = consciousnessState.phaseProgression;
    
    // Calculate new progression based on integration metrics
    const progressionIncrease = (
      metrics.overall * 0.4 +
      metrics.balance * 0.3 +
      synthesis.synthesisPower * 0.3
    ) * 0.1; // Max 10% increase per session

    const newProgression = Math.min(1, currentProgression + progressionIncrease);
    
    // Readiness for next phase
    const readiness = newProgression >= consciousnessState.readinessThreshold ? newProgression : 0;

    return {
      progressionLevel: newProgression,
      readiness,
      progressIncrease: progressionIncrease
    };
  }

  /**
   * Generate guidance and recommendations
   */
  private generateGuidance(
    synthesis: CrossElementalSynthesis,
    spiralAssessment: any,
    metrics: any,
    consciousnessState: SpiralogicConsciousnessState
  ): any {
    let focus = "Continue integrating your current insights";
    let ritual: string | undefined;

    // Focus recommendations based on metrics
    if (metrics.balance < 0.3) {
      focus = "Explore dormant elemental aspects for greater balance";
    } else if (spiralAssessment.readiness > 0.8) {
      focus = "Prepare for the next phase of your spiral journey";
    } else if (metrics.collectiveAlignment < 0.3) {
      focus = "Deepen your connection to the collective field";
    } else if (synthesis.synthesisPower < 0.5) {
      focus = "Integrate the various aspects of your awareness";
    }

    // Ritual suggestions based on dominant element and phase
    const element = synthesis.primaryElement;
    const phase = consciousnessState.currentPhase;
    ritual = this.suggestRitual(element, phase, metrics);

    return { focus, ritual };
  }

  /**
   * Suggest ritual based on element, phase, and metrics
   */
  private suggestRitual(element: string, phase: SpiralPhase, metrics: any): string | undefined {
    const rituals = {
      fire: {
        [SpiralPhase.INITIATION]: "Light a candle and set an intention for your journey",
        [SpiralPhase.CHALLENGE]: "Sit with a flame and breathe through resistance",
        [SpiralPhase.INTEGRATION]: "Create something beautiful with your hands",
        [SpiralPhase.MASTERY]: "Share your fire with others through teaching or inspiration",
        [SpiralPhase.TRANSCENDENCE]: "Become a lighthouse for others seeking their way"
      },
      water: {
        [SpiralPhase.INITIATION]: "Take a cleansing bath with intention",
        [SpiralPhase.CHALLENGE]: "Let tears flow if they need to come",
        [SpiralPhase.INTEGRATION]: "Spend time near moving water and listen deeply",
        [SpiralPhase.MASTERY]: "Practice emotional alchemy - transform pain into compassion",
        [SpiralPhase.TRANSCENDENCE]: "Become a healing presence for all you encounter"
      },
      earth: {
        [SpiralPhase.INITIATION]: "Plant something and tend it daily",
        [SpiralPhase.CHALLENGE]: "Stand barefoot on the earth and feel your strength",
        [SpiralPhase.INTEGRATION]: "Build a simple habit that serves your highest good",
        [SpiralPhase.MASTERY]: "Create lasting structures that support others' growth",
        [SpiralPhase.TRANSCENDENCE]: "Become a mountain of stability for your community"
      },
      air: {
        [SpiralPhase.INITIATION]: "Practice conscious breathing for 10 minutes daily",
        [SpiralPhase.CHALLENGE]: "Journal your thoughts to find clarity",
        [SpiralPhase.INTEGRATION]: "Teach someone something you've learned",
        [SpiralPhase.MASTERY]: "Become a bridge between different perspectives",
        [SpiralPhase.TRANSCENDENCE]: "Speak truth that liberates others"
      },
      aether: {
        [SpiralPhase.INITIATION]: "Spend time in meditation connecting to your higher purpose",
        [SpiralPhase.CHALLENGE]: "Look for synchronicities guiding your path",
        [SpiralPhase.INTEGRATION]: "Practice seeing the sacred in the ordinary",
        [SpiralPhase.MASTERY]: "Become a conduit for wisdom beyond your personal mind",
        [SpiralPhase.TRANSCENDENCE]: "Dissolve the boundaries between self and cosmos"
      }
    };

    return rituals[element]?.[phase];
  }

  /**
   * Calculate collective contribution
   */
  private calculateCollectiveContribution(
    synthesis: CrossElementalSynthesis,
    metrics: any,
    consciousnessState: SpiralogicConsciousnessState
  ): string {
    const contribution = [];

    if (metrics.overall > 0.7) {
      contribution.push("Your heightened awareness raises the collective frequency");
    }

    if (synthesis.synthesisPower > 0.8) {
      contribution.push("Your integrated consciousness models wholeness for others");
    }

    if (metrics.collectiveAlignment > 0.8) {
      contribution.push("You are a harmonic resonator in the collective field");
    }

    if (consciousnessState.currentPhase === SpiralPhase.TRANSCENDENCE) {
      contribution.push("You anchor transcendent wisdom for collective evolution");
    }

    return contribution.length > 0 
      ? contribution.join(". ") 
      : "Your journey contributes to the awakening of all consciousness";
  }

  /**
   * Store integration history for learning and evolution
   */
  private storeIntegrationHistory(userId: string, integration: IntegratedAwareness): void {
    const history = this.integrationHistory.get(userId) || [];
    history.push(integration);
    
    // Keep last 50 integrations
    if (history.length > 50) {
      history.shift();
    }
    
    this.integrationHistory.set(userId, history);
  }

  /**
   * Update collective field based on individual integration
   */
  private updateCollectiveField(
    integration: IntegratedAwareness,
    consciousnessState: SpiralogicConsciousnessState
  ): void {
    // Update archetypal trends
    this.updateArchetypalTrends(integration.dominantArchetype, integration.supportingArchetypes);
    
    // Update spiral phase distribution
    this.updatePhaseDistribution(consciousnessState.currentPhase);
    
    // Update elemental balance
    this.updateElementalBalance(consciousnessState);
    
    // Update resonance level
    this.updateResonanceLevel(integration.awarenessLevel);
  }

  private updateArchetypalTrends(dominant: string, supporting: string[]): void {
    const allArchetypes = [dominant, ...supporting];
    
    // Simple frequency tracking - in production this would be more sophisticated
    allArchetypes.forEach(archetype => {
      if (!this.collectiveField.archetypalTrends.includes(archetype)) {
        this.collectiveField.archetypalTrends.push(archetype);
        
        // Keep top 10 trending archetypes
        if (this.collectiveField.archetypalTrends.length > 10) {
          this.collectiveField.archetypalTrends.shift();
        }
      }
    });
  }

  private updatePhaseDistribution(phase: SpiralPhase): void {
    // Simple increment - in production this would track actual user counts
    const current = this.collectiveField.spiralPhaseDistribution[phase];
    this.collectiveField.spiralPhaseDistribution[phase] = Math.min(1, current + 0.01);
  }

  private updateElementalBalance(consciousnessState: SpiralogicConsciousnessState): void {
    const activeElement = consciousnessState.dominantElement;
    if (this.collectiveField.elementalBalance[activeElement] !== undefined) {
      this.collectiveField.elementalBalance[activeElement] = Math.min(1, 
        this.collectiveField.elementalBalance[activeElement] + 0.01
      );
    }
  }

  private updateResonanceLevel(awarenessLevel: number): void {
    // Exponential moving average
    const alpha = 0.1;
    this.collectiveField.resonanceLevel = 
      (1 - alpha) * this.collectiveField.resonanceLevel + 
      alpha * awarenessLevel;
  }

  /**
   * Get current collective field state
   */
  public getCollectiveField(): CollectiveField {
    return { ...this.collectiveField };
  }

  /**
   * Get integration history for user
   */
  public getIntegrationHistory(userId: string): IntegratedAwareness[] {
    return this.integrationHistory.get(userId) || [];
  }
}