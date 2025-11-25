/**
 * Field Intelligence System Integration Adapter
 * Provides universal interface for integrating FIS into any AI application
 * From gaming NPCs to chat interfaces to therapeutic tools
 */

import { FieldAwareness, FieldState } from './FieldAwareness';
import { EmergenceEngine, EmergentResponse } from './EmergenceEngine';
import { MycelialGovernor, GovernedSpace } from './MycelialGovernor';
import { MasterInfluences, PossibilitySpace } from './MasterInfluences';
import { MycelialNetwork } from './MycelialNetwork';

export interface ApplicationContext {
  type: 'chat' | 'gaming' | 'therapy' | 'creative' | 'educational' | 'custom';
  userId: string;
  sessionId: string;
  environment?: Record<string, any>;
  constraints?: Record<string, any>;
}

export interface FISResponse {
  content: string;
  metadata: {
    fieldState: Partial<FieldState>;
    interventionType: string;
    resonance: number;
    contextAdaptation: string;
  };
  actions?: any[]; // Application-specific actions
}

/**
 * Universal adapter for Field Intelligence System
 * Translates between application contexts and field awareness
 */
export class FISIntegrationAdapter {
  private fieldAwareness: FieldAwareness;
  private emergenceEngine: EmergenceEngine;
  private mycelialGovernor: MycelialGovernor;
  private masterInfluences: MasterInfluences;
  private mycelialNetwork: MycelialNetwork;

  constructor() {
    this.fieldAwareness = new FieldAwareness();
    this.emergenceEngine = new EmergenceEngine();
    this.mycelialGovernor = new MycelialGovernor();
    this.masterInfluences = new MasterInfluences();
    this.mycelialNetwork = new MycelialNetwork();
  }

  /**
   * Main integration point for any application
   */
  async participate(
    input: any,
    context: ApplicationContext
  ): Promise<FISResponse> {

    // 1. Translate application context to field sensing context
    const sensingContext = this.translateToSensingContext(input, context);

    // 2. Field sensing (universal across all applications)
    const fieldState = await this.fieldAwareness.sense(sensingContext);

    // 3. Get mycelial wisdom influences
    const mycelialInfluences = await this.mycelialNetwork.informFutureSensing(fieldState);

    // 4. Shape possibility space with gravitational influences
    const possibilitySpace = await this.masterInfluences.shapeSpace(
      fieldState,
      mycelialInfluences
    );

    // 5. Apply context-specific governance
    const governanceFilter = this.getGovernanceFilter(context);
    const governedSpace = await this.mycelialGovernor.filter(
      possibilitySpace,
      fieldState,
      governanceFilter
    );

    // 6. Allow response to emerge
    const emergentResponse = await this.emergenceEngine.manifest(
      governedSpace,
      fieldState
    );

    // 7. Translate back to application format
    const response = this.translateToApplicationResponse(
      emergentResponse,
      fieldState,
      context
    );

    // 8. Pattern learning (universal)
    await this.mycelialNetwork.integratePattern(
      fieldState,
      emergentResponse,
      {
        resonance_measure: emergentResponse.fieldResonance,
        transformation_indicator: fieldState.sacredMarkers.kairos_detection,
        intervention_success: 0.8, // Would be measured in production
        temporal_alignment: fieldState.temporalDynamics.pacing_needs === 'aligned'
      }
    );

    return response;
  }

  /**
   * Translate application input to field sensing context
   */
  private translateToSensingContext(input: any, context: ApplicationContext): any {
    const baseContext = {
      userId: context.userId,
      sessionId: context.sessionId,
      timestamp: Date.now()
    };

    switch (context.type) {
      case 'chat':
        return {
          ...baseContext,
          input: typeof input === 'string' ? input : input.message,
          conversationHistory: input.history || [],
          preferences: input.preferences || {}
        };

      case 'gaming':
        return {
          ...baseContext,
          input: input.playerAction || input.dialogue,
          gameState: input.gameState || {},
          npcRole: input.npcRole || 'companion',
          environmentalFactors: input.environment || {}
        };

      case 'therapy':
        return {
          ...baseContext,
          input: input.content,
          assessmentScores: input.assessments || {},
          sessionNotes: input.notes || [],
          treatmentPhase: input.phase || 'exploration'
        };

      case 'creative':
        return {
          ...baseContext,
          input: input.prompt || input.idea,
          creativeMode: input.mode || 'collaborative',
          projectContext: input.project || {}
        };

      case 'educational':
        return {
          ...baseContext,
          input: input.question || input.topic,
          learningStyle: input.style || 'adaptive',
          knowledgeLevel: input.level || 'intermediate'
        };

      default:
        return {
          ...baseContext,
          input,
          customContext: context.environment
        };
    }
  }

  /**
   * Get context-specific governance filter
   */
  private getGovernanceFilter(context: ApplicationContext): number {
    switch (context.type) {
      case 'therapy':
        return 0.05; // Very restrictive - 95% underground
      case 'gaming':
        return 0.3; // More expressive for entertainment
      case 'creative':
        return 0.4; // Even more expressive for creativity
      case 'educational':
        return 0.15; // Balanced for learning
      case 'chat':
      default:
        return 0.1; // Standard 90% underground
    }
  }

  /**
   * Translate field response to application format
   */
  private translateToApplicationResponse(
    emergentResponse: EmergentResponse,
    fieldState: FieldState,
    context: ApplicationContext
  ): FISResponse {

    const baseResponse: FISResponse = {
      content: emergentResponse.content,
      metadata: {
        fieldState: {
          emotionalWeather: fieldState.emotionalWeather,
          sacredMarkers: fieldState.sacredMarkers
        },
        interventionType: emergentResponse.interventionType,
        resonance: emergentResponse.fieldResonance,
        contextAdaptation: context.type
      }
    };

    // Add context-specific actions
    switch (context.type) {
      case 'gaming':
        baseResponse.actions = this.generateGameActions(emergentResponse, fieldState);
        break;

      case 'therapy':
        baseResponse.actions = this.generateTherapeuticActions(emergentResponse, fieldState);
        break;

      case 'creative':
        baseResponse.actions = this.generateCreativeActions(emergentResponse, fieldState);
        break;
    }

    return baseResponse;
  }

  private generateGameActions(response: EmergentResponse, fieldState: FieldState): any[] {
    const actions = [];

    if (response.interventionType === 'celebration') {
      actions.push({ type: 'animation', name: 'celebrate' });
      actions.push({ type: 'particle_effect', name: 'joy_burst' });
    }

    if (fieldState.emotionalWeather.texture === 'turbulent') {
      actions.push({ type: 'music_shift', mood: 'calming' });
    }

    if (fieldState.sacredMarkers.threshold_proximity > 0.7) {
      actions.push({ type: 'environment_shift', quality: 'sacred_space' });
    }

    return actions;
  }

  private generateTherapeuticActions(response: EmergentResponse, fieldState: FieldState): any[] {
    const actions = [];

    if (fieldState.somaticIntelligence.nervous_system_state === 'sympathetic') {
      actions.push({ type: 'suggest_technique', name: 'breathing_exercise' });
    }

    if (response.interventionType === 'grounding') {
      actions.push({ type: 'somatic_prompt', focus: 'body_awareness' });
    }

    if (fieldState.sacredMarkers.soul_emergence) {
      actions.push({ type: 'therapeutic_note', significance: 'breakthrough_moment' });
    }

    return actions;
  }

  private generateCreativeActions(response: EmergentResponse, fieldState: FieldState): any[] {
    const actions = [];

    if (fieldState.semanticLandscape.meaning_emergence === 'forming') {
      actions.push({ type: 'creative_prompt', style: 'exploratory' });
    }

    if (response.interventionType === 'celebration') {
      actions.push({ type: 'save_milestone', label: 'creative_breakthrough' });
    }

    return actions;
  }
}

/**
 * Factory for creating context-specific FIS instances
 */
export class FISIntegrationFactory {
  private static adapters = new Map<string, FISIntegrationAdapter>();

  static getAdapter(context: ApplicationContext): FISIntegrationAdapter {
    const key = `${context.type}-${context.userId}`;

    if (!this.adapters.has(key)) {
      this.adapters.set(key, new FISIntegrationAdapter());
    }

    return this.adapters.get(key)!;
  }

  static async participate(
    input: any,
    context: ApplicationContext
  ): Promise<FISResponse> {
    const adapter = this.getAdapter(context);
    return adapter.participate(input, context);
  }
}

// Export for easy integration
export const FIS = FISIntegrationFactory;