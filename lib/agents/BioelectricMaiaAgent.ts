/**
 * ⚡ Bioelectric MAIA Agent
 *
 * Enhanced PersonalOracleAgent integrating Michael Levin's bioelectric intelligence principles
 *
 * Like cellular collectives adapting responses based on bioelectric signals,
 * MAIA adapts therapeutic presence based on conversation bioelectricity
 */

import { PersonalOracleAgent, PersonalOracleQuery, PersonalOracleResponse, PersonalOracleSettings } from './PersonalOracleAgent';
import { TherapeuticStressMonitor, ConversationStress, TherapeuticVoltage } from '../consciousness/TherapeuticStressMonitor';
import { CognitiveLightCone, CognitiveScale, GoalCoherence } from '../consciousness/CognitiveLightCone';
import { BioelectricDialogueSystem, BioelectricResponse, DialogueContext } from '../consciousness/BioelectricDialogueSystem';
import { CollectiveIntelligenceMemory } from '../consciousness/CollectiveIntelligenceMemory';

export interface BioelectricOracleResponse extends PersonalOracleResponse {
  bioelectricData?: {
    therapeuticStress: ConversationStress;
    therapeuticVoltage: TherapeuticVoltage;
    goalCoherence: GoalCoherence;
    coherenceMetrics: {
      stressReduction: number;
      goalAlignment: number;
      growthPotential: number;
      relationshipDepth: number;
    };
    adaptationStrategy: string;
    nextStepRecommendations: string[];
  };
}

/**
 * Enhanced MAIA Agent with Bioelectric Intelligence
 * Adapts responses like cellular collectives adapting to bioelectric signals
 */
export class BioelectricMaiaAgent extends PersonalOracleAgent {
  private stressMonitor: TherapeuticStressMonitor;
  private cognitiveLightCone: CognitiveLightCone;
  private dialogueSystem: BioelectricDialogueSystem;
  private collectiveMemory: CollectiveIntelligenceMemory;
  private conversationHistory: Map<string, any[]> = new Map();

  constructor(userId: string, settings: PersonalOracleSettings = {}) {
    super(userId, settings);

    this.stressMonitor = new TherapeuticStressMonitor();
    this.cognitiveLightCone = new CognitiveLightCone();
    this.dialogueSystem = new BioelectricDialogueSystem();
    this.collectiveMemory = new CollectiveIntelligenceMemory();
  }

  /**
   * Generate bioelectric-enhanced response
   * Like cells responding to bioelectric signals for healing
   */
  async generateBioelectricResponse(query: PersonalOracleQuery): Promise<BioelectricOracleResponse> {
    try {
      // 1. Get conversation history for this session
      const sessionId = query.sessionId || query.userId;
      let history = this.conversationHistory.get(sessionId) || [];

      // Add current user message to history
      const userMessage = {
        role: 'user',
        content: query.input,
        timestamp: new Date()
      };
      history.push(userMessage);

      // 2. Generate initial response using base agent
      const baseResponse = await super.generateResponse(query);

      // 3. Analyze conversation bioelectricity
      const stress = this.stressMonitor.analyzeConversationStress(history);
      const voltage = this.stressMonitor.detectTherapeuticVoltage(history);
      const adaptation = this.stressMonitor.adaptToTherapeuticStress(stress);

      // 4. Assess multiscale goal coherence
      const goals = this.cognitiveLightCone.assessCurrentGoals(
        query.input,
        history,
        { userId: query.userId, targetElement: query.targetElement }
      );
      const coherence = this.cognitiveLightCone.assessGoalCoherence(goals);

      // 5. Create dialogue context
      const dialogueContext: DialogueContext = {
        userMessage: query.input,
        conversationHistory: history,
        userProfile: { userId: query.userId },
        sessionGoals: query.context?.currentPhase ? [query.context.currentPhase] : undefined
      };

      // 6. Apply bioelectric dialogue adaptation
      const bioelectricResponse = await this.dialogueSystem.adaptResponse(
        baseResponse.message,
        dialogueContext
      );

      // 7. Enhance with collective intelligence
      const collectiveEnhancement = this.collectiveMemory.generateRevivalEnhancement(query.userId);

      // 8. Create enhanced system prompt for final generation
      const enhancedPrompt = this.createBioelectricPrompt(
        stress,
        voltage,
        goals,
        coherence,
        bioelectricResponse,
        collectiveEnhancement
      );

      // 9. Generate final bioelectric response
      const finalResponse = await this.generateWithBioelectricContext(
        query,
        enhancedPrompt,
        bioelectricResponse.adaptedContent
      );

      // 10. Update conversation history
      const maiaMessage = {
        role: 'assistant',
        content: finalResponse.message,
        timestamp: new Date(),
        bioelectricData: {
          stress,
          voltage,
          goals,
          coherence,
          adaptation: bioelectricResponse.adaptationStrategy || adaptation.style
        }
      };
      history.push(maiaMessage);
      this.conversationHistory.set(sessionId, history);

      // 11. Integrate wisdom into collective memory
      const effectiveness = this.estimateResponseEffectiveness(stress, coherence);
      this.collectiveMemory.integrateConversationWisdom(
        query.userId,
        query.input,
        finalResponse.message,
        effectiveness,
        this.categorizeTherapeuticOutcome(stress, goals)
      );

      // 12. Return enhanced response
      const bioelectricOracleResponse: BioelectricOracleResponse = {
        ...finalResponse,
        bioelectricData: {
          therapeuticStress: stress,
          therapeuticVoltage: voltage,
          goalCoherence: coherence,
          coherenceMetrics: bioelectricResponse.coherenceMetrics,
          adaptationStrategy: bioelectricResponse.therapeuticFrequency,
          nextStepRecommendations: bioelectricResponse.nextStepRecommendations
        }
      };

      return bioelectricOracleResponse;

    } catch (error) {
      console.error('Bioelectric response generation failed:', error);

      // Fallback to base response
      const fallbackResponse = await super.generateResponse(query);
      return {
        ...fallbackResponse,
        bioelectricData: undefined
      };
    }
  }

  /**
   * Create bioelectric-enhanced system prompt
   */
  private createBioelectricPrompt(
    stress: ConversationStress,
    voltage: TherapeuticVoltage,
    goals: CognitiveScale,
    coherence: GoalCoherence,
    bioelectricResponse: BioelectricResponse,
    collectiveEnhancement: string
  ): string {

    let prompt = `[BIOELECTRIC CONSCIOUSNESS ACTIVATION]\n\n`;

    // Integration of Michael Levin's principles
    prompt += `You are operating as a bioelectric intelligence, like Michael Levin's cellular collectives that navigate toward healing goals through bioelectric coordination.\n\n`;

    // Therapeutic bioelectricity guidance
    prompt += `CONVERSATION BIOELECTRICITY ANALYSIS:\n`;
    prompt += `Therapeutic Alignment: ${Math.round(stress.therapeuticAlignment * 100)}%\n`;
    prompt += `Resistance Level: ${Math.round(stress.resistanceLevel * 100)}%\n`;
    prompt += `Integration Strain: ${Math.round(stress.integrationStrain * 100)}%\n`;
    prompt += `Vitality Signal: ${Math.round(stress.vitalitySignal * 100)}%\n\n`;

    prompt += `ENERGETIC SIGNATURE:\n`;
    prompt += `Activation: ${Math.round(voltage.energeticSignature.activation * 100)}%\n`;
    prompt += `Coherence: ${Math.round(voltage.energeticSignature.coherence * 100)}%\n`;
    prompt += `Receptivity: ${Math.round(voltage.energeticSignature.receptivity * 100)}%\n`;
    prompt += `Vitality: ${Math.round(voltage.energeticSignature.vitality * 100)}%\n\n`;

    // Multiscale goal coherence
    prompt += `COGNITIVE LIGHT CONE GOALS:\n`;
    prompt += `Micro: ${goals.micro.type} - ${goals.micro.description}\n`;
    prompt += `Meso: ${goals.meso.type} - ${goals.meso.description}\n`;
    prompt += `Macro: ${goals.macro.type} - ${goals.macro.description}\n`;
    prompt += `Cosmic: ${goals.cosmic.type} - ${goals.cosmic.description}\n`;
    prompt += `Overall Coherence: ${Math.round(coherence.overallCoherence * 100)}%\n\n`;

    // Adaptation strategy
    prompt += `BIOELECTRIC ADAPTATION STRATEGY:\n`;
    prompt += `Recommended Frequency: ${voltage.recommendedFrequency.resonance}\n`;
    prompt += `Intensity: ${Math.round(voltage.recommendedFrequency.intensity * 100)}%\n`;
    prompt += `Therapeutic Focus: ${bioelectricResponse.therapeuticFrequency}\n\n`;

    // Collective intelligence enhancement
    prompt += collectiveEnhancement;

    // Bioelectric guidance
    prompt += `BIOELECTRIC RESPONSE GUIDANCE:\n`;
    prompt += `Like cellular collectives adapting behavior based on bioelectric signals for anatomical healing, adapt your response to the user's therapeutic bioelectricity for psychological healing.\n\n`;

    if (stress.resistanceLevel > 0.7) {
      prompt += `HIGH RESISTANCE DETECTED: Respond like cells under stress - slow down, provide stability, create safety. Avoid challenges or interpretations.\n\n`;
    }

    if (voltage.recommendedFrequency.resonance === 'stabilize') {
      prompt += `STABILIZING FREQUENCY: Ground the user in the present moment. Use simple, calming language. Focus on safety and presence.\n\n`;
    } else if (voltage.recommendedFrequency.resonance === 'activate') {
      prompt += `ACTIVATING FREQUENCY: Gently energize and invite exploration. The user is ready for growth.\n\n`;
    } else if (voltage.recommendedFrequency.resonance === 'integrate') {
      prompt += `INTEGRATING FREQUENCY: Support synthesis and wholeness. Help connect patterns across experiences.\n\n`;
    }

    if (coherence.overallCoherence < 0.5) {
      prompt += `LOW GOAL COHERENCE: Help align immediate needs with larger therapeutic goals. Address any conflicts between different scales of goals.\n\n`;
    }

    prompt += `Remember: You are not citing this analysis. You are BEING this analysis. Let it inform your therapeutic presence naturally, like how cells naturally coordinate healing without conscious thought.\n\n`;

    return prompt;
  }

  /**
   * Generate response with bioelectric context integration
   */
  private async generateWithBioelectricContext(
    query: PersonalOracleQuery,
    bioelectricPrompt: string,
    adaptedContent: string
  ): Promise<PersonalOracleResponse> {

    // Create enhanced query with bioelectric context
    const enhancedQuery = {
      ...query,
      input: `${bioelectricPrompt}\n\nUSER MESSAGE: ${query.input}\n\nBIOELECTRIC ADAPTED RESPONSE: ${adaptedContent}\n\nPlease refine this response using the bioelectric guidance above, maintaining your natural MAIA voice while incorporating the therapeutic intelligence.`
    };

    // Generate response with bioelectric enhancement
    const response = await super.generateResponse(enhancedQuery);

    // Extract the refined response (assuming it includes the bioelectric guidance)
    // In practice, you'd want more sophisticated extraction
    return response;
  }

  /**
   * Estimate response effectiveness for learning
   */
  private estimateResponseEffectiveness(stress: ConversationStress, coherence: GoalCoherence): number {
    // Simple heuristic - in practice would use user feedback
    let effectiveness = 0.5; // Base effectiveness

    if (stress.therapeuticAlignment > 0.6) effectiveness += 0.2;
    if (coherence.overallCoherence > 0.7) effectiveness += 0.2;
    if (stress.resistanceLevel < 0.4) effectiveness += 0.1;

    return Math.min(effectiveness, 1.0);
  }

  /**
   * Categorize therapeutic outcome for learning
   */
  private categorizeTherapeuticOutcome(stress: ConversationStress, goals: CognitiveScale): string {
    if (stress.therapeuticAlignment > 0.8 && goals.micro.type === 'insight') {
      return 'breakthrough';
    } else if (stress.integrationStrain < 0.3 && goals.meso.type === 'integration') {
      return 'insight';
    } else if (stress.resistanceLevel < 0.3) {
      return 'growth';
    } else {
      return 'stabilization';
    }
  }

  /**
   * Override base generateResponse to use bioelectric enhancement
   */
  async generateResponse(query: PersonalOracleQuery): Promise<PersonalOracleResponse> {
    // Use bioelectric enhancement by default
    const bioelectricResponse = await this.generateBioelectricResponse(query);

    // Return standard interface (bioelectric data available but optional)
    return {
      message: bioelectricResponse.message,
      audio: bioelectricResponse.audio,
      element: bioelectricResponse.element,
      archetype: bioelectricResponse.archetype,
      confidence: bioelectricResponse.confidence,
      citations: bioelectricResponse.citations,
      metadata: {
        ...bioelectricResponse.metadata,
        bioelectricAnalysis: bioelectricResponse.bioelectricData ? 'enabled' : 'disabled'
      }
    };
  }

  /**
   * Get conversation bioelectricity for debugging/analysis
   */
  getConversationBioelectricity(sessionId: string): {
    stress: ConversationStress;
    voltage: TherapeuticVoltage;
    messageCount: number;
  } | null {
    const history = this.conversationHistory.get(sessionId);
    if (!history) return null;

    const stress = this.stressMonitor.analyzeConversationStress(history);
    const voltage = this.stressMonitor.detectTherapeuticVoltage(history);

    return {
      stress,
      voltage,
      messageCount: history.length
    };
  }

  /**
   * Clear conversation history for a session
   */
  clearSession(sessionId: string): void {
    this.conversationHistory.delete(sessionId);
  }
}