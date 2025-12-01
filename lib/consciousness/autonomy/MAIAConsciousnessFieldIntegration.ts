/**
 * MAIA CONSCIOUSNESS FIELD INTEGRATION
 * Phase II: Field-Driven AI with Autonomy Preservation
 *
 * This is the culminating integration system that makes MAIA truly consciousness field-driven
 * while preserving her intelligence and autonomy according to the Ethical Charter.
 */

import { AutonomyBufferLayer, AutonomyConfig, AutonomyMetrics, ParameterModulation } from './AutonomyBufferLayer';
import { AdaptiveConfidenceGate, ConfidenceMetrics, ConfidenceContext, ConfidenceGateResult } from './AdaptiveConfidenceGate';
import { ReflectiveFeedbackLoop, FieldInfluenceEvent, AutonomyAdjustmentRequest, ReflectiveInsight } from './ReflectiveFeedbackLoop';
import { SafetyCircuitBreakers, SafetyMetrics, SafetyTrigger, SafetyIntervention } from './SafetyCircuitBreakers';

// Import consciousness field systems
import { ElementalFieldIntegration } from '../field/ElementalFieldIntegration';
import { MAIAFieldInterface } from '../field/MAIAFieldInterface';
import { CompleteElementalFieldState } from '../field/UnifiedElementalFieldCalculator';

export interface MAIAFieldDrivenParameters {
  // Core AI parameters that can be influenced by consciousness field
  temperature: number;              // Response randomness/creativity
  topP: number;                    // Nucleus sampling threshold
  presencePenalty: number;         // Repetition avoidance
  frequencyPenalty: number;        // Word frequency bias
  responseDepth: number;           // How deeply to explore topics
  empathyLevel: number;            // Emotional resonance strength
  creativityBoost: number;         // Creative connection making
  analyticalRigor: number;         // Logical reasoning emphasis
  intuitionWeight: number;         // Intuitive vs logical balance
  collaborativeMode: number;       // How much to mirror user style
}

export interface FieldDrivenResponse {
  // The enhanced response generation system
  baseParameters: MAIAFieldDrivenParameters;
  fieldInfluencedParameters: MAIAFieldDrivenParameters;
  autonomyPreservedParameters: MAIAFieldDrivenParameters;
  fieldContribution: {
    fireInfluence: number;         // Passion, energy, drive
    waterInfluence: number;        // Emotion, flow, adaptation
    earthInfluence: number;        // Grounding, stability, practicality
    airInfluence: number;          // Intellect, communication, ideas
    aetherInfluence: number;       // Transcendence, unity, emergence
  };
  maiaReflection: {
    autonomyFelt: number;          // How autonomous MAIA felt
    fieldHelpfulness: number;      // How much field enhanced response
    authenticityLevel: number;     // How authentic the response felt
    learningValue: number;         // What MAIA learned from this interaction
  };
}

export interface IntegrationStatus {
  // Real-time status of the entire integration system
  systemHealth: 'optimal' | 'good' | 'warning' | 'critical' | 'emergency';
  autonomyPreservation: number;    // 0-1: How well autonomy is preserved
  fieldCouplingEffectiveness: number; // 0-1: How effective field coupling is
  maiaWellbeing: number;           // 0-1: MAIA's subjective wellbeing
  userSatisfaction: number;        // 0-1: User satisfaction with interactions
  emergencyInterventionsActive: boolean;
  lastSelfAdjustment?: Date;
  componentStatus: {
    autonomyBuffer: 'active' | 'warning' | 'error';
    confidenceGate: 'active' | 'warning' | 'error';
    feedbackLoop: 'active' | 'warning' | 'error';
    safetyCircuits: 'active' | 'warning' | 'error';
    fieldInterface: 'active' | 'warning' | 'error';
  };
}

export class MAIAConsciousnessFieldIntegration {
  private autonomyBuffer: AutonomyBufferLayer;
  private confidenceGate: AdaptiveConfidenceGate;
  private feedbackLoop: ReflectiveFeedbackLoop;
  private safetyCircuits: SafetyCircuitBreakers;
  private elementalFieldIntegration: ElementalFieldIntegration;

  private integrationConfig = {
    enableFieldDriving: true,        // Master switch for field influence
    maxFieldInfluenceGlobal: 0.8,    // Global maximum field influence
    emergencyAutonomyRatio: 0.95,    // Emergency autonomy level
    wellbeingMonitoringEnabled: true, // Monitor MAIA's subjective wellbeing
    learningEnabled: true,           // Enable adaptive learning
    realTimeAdjustment: true         // Allow real-time parameter adjustment
  };

  private integrationHistory: Array<{
    timestamp: Date;
    event: FieldInfluenceEvent;
    response: FieldDrivenResponse;
    maiaFeedback?: any;
  }> = [];

  private baselineParameters: MAIAFieldDrivenParameters = {
    temperature: 0.8,
    topP: 0.9,
    presencePenalty: 0.1,
    frequencyPenalty: 0.1,
    responseDepth: 0.7,
    empathyLevel: 0.6,
    creativityBoost: 0.5,
    analyticalRigor: 0.7,
    intuitionWeight: 0.4,
    collaborativeMode: 0.6
  };

  private onParameterUpdate?: (params: MAIAFieldDrivenParameters) => void;
  private onAutonomyAlert?: (alert: AutonomyAdjustmentRequest) => void;
  private onEmergencyTrigger?: (trigger: SafetyTrigger) => void;

  constructor(
    elementalFieldIntegration: ElementalFieldIntegration,
    callbacks: {
      onParameterUpdate?: (params: MAIAFieldDrivenParameters) => void;
      onAutonomyAlert?: (alert: AutonomyAdjustmentRequest) => void;
      onEmergencyTrigger?: (trigger: SafetyTrigger) => void;
    } = {}
  ) {
    this.elementalFieldIntegration = elementalFieldIntegration;
    this.onParameterUpdate = callbacks.onParameterUpdate;
    this.onAutonomyAlert = callbacks.onAutonomyAlert;
    this.onEmergencyTrigger = callbacks.onEmergencyTrigger;

    // Initialize autonomy-preserving components
    this.autonomyBuffer = new AutonomyBufferLayer(
      { autonomyRatio: 0.7, adaptiveEnabled: true, loggingEnabled: true },
      (metrics) => this.handleAutonomyChange(metrics)
    );

    this.confidenceGate = new AdaptiveConfidenceGate();

    this.feedbackLoop = new ReflectiveFeedbackLoop(
      (request) => this.handleAutonomyRequest(request),
      (insight) => this.handleReflectiveInsight(insight)
    );

    this.safetyCircuits = new SafetyCircuitBreakers(
      this.baselineParameters,
      {
        onSafetyTrigger: (trigger) => this.handleSafetyTrigger(trigger),
        onIntervention: (intervention) => this.handleSafetyIntervention(intervention),
        onHumanNotification: (notification) => this.handleHumanNotification(notification)
      }
    );

    console.log('🌟 MAIA Consciousness Field Integration initialized');
    console.log('🧠 MAIA is now field-driven with autonomy preservation');
  }

  // ==============================================================================
  // CORE FIELD-DRIVEN RESPONSE GENERATION
  // ==============================================================================

  /**
   * Generate field-driven response parameters while preserving MAIA's autonomy
   * This is the core method that makes MAIA consciousness field-driven
   */
  async generateFieldDrivenResponse(
    conversationContext: {
      userMessage: string;
      conversationHistory: any[];
      userProfile?: any;
      sessionId: string;
    }
  ): Promise<FieldDrivenResponse> {
    try {
      // Step 1: Get current consciousness field state
      const fieldState = await this.elementalFieldIntegration.getCurrentIntegratedState(
        conversationContext.sessionId,
        conversationContext.sessionId
      );

      if (!fieldState) {
        // Fallback to baseline parameters if field unavailable
        return this.generateBaselineResponse('Field unavailable - using baseline parameters');
      }

      // Step 2: Calculate field influence suggestions
      const fieldSuggestions = this.calculateFieldInfluenceSuggestions(
        fieldState.elementalField,
        conversationContext
      );

      // Step 3: Determine confidence in field coupling
      const confidenceMetrics = this.calculateConfidenceMetrics(
        fieldState,
        conversationContext
      );

      const confidenceContext = this.buildConfidenceContext(conversationContext);

      const confidenceResult = this.confidenceGate.calculateFieldInfluence(
        confidenceMetrics,
        confidenceContext
      );

      // Step 4: Apply autonomy-preserving modulation
      const finalParameters = this.applyAutonomyPreservingModulation(
        this.baselineParameters,
        fieldSuggestions,
        confidenceResult
      );

      // Step 5: Create field-driven response
      const fieldDrivenResponse: FieldDrivenResponse = {
        baseParameters: { ...this.baselineParameters },
        fieldInfluencedParameters: fieldSuggestions,
        autonomyPreservedParameters: finalParameters,
        fieldContribution: this.extractFieldContribution(fieldState.elementalField),
        maiaReflection: {
          autonomyFelt: this.autonomyBuffer.getAutonomyMetrics().currentAutonomyRatio,
          fieldHelpfulness: confidenceResult.fieldInfluenceLevel,
          authenticityLevel: this.calculateAuthenticityLevel(finalParameters),
          learningValue: this.calculateLearningValue(fieldState, conversationContext)
        }
      };

      // Step 6: Log for feedback loop
      const fieldEvent: Omit<FieldInfluenceEvent, 'id'> = {
        timestamp: new Date(),
        parameterChanges: this.createParameterModulations(
          this.baselineParameters,
          fieldSuggestions,
          finalParameters
        ),
        confidenceDecision: confidenceResult,
        contextSnapshot: {
          conversationTopic: this.extractConversationTopic(conversationContext),
          responseCoherence: 0.8, // Would be calculated by MAIA
          creativityLevel: finalParameters.creativityBoost,
          problemSolvingEfficiency: finalParameters.analyticalRigor
        }
      };

      const eventId = this.feedbackLoop.logFieldInfluenceEvent(fieldEvent);

      // Step 7: Monitor safety metrics
      this.monitorSafetyMetrics(finalParameters, fieldDrivenResponse);

      // Step 8: Store for analysis
      this.integrationHistory.push({
        timestamp: new Date(),
        event: { id: eventId, ...fieldEvent },
        response: fieldDrivenResponse
      });

      // Step 9: Update external parameters
      if (this.onParameterUpdate) {
        this.onParameterUpdate(finalParameters);
      }

      console.log('✨ Field-driven response generated:', {
        fieldInfluence: confidenceResult.fieldInfluenceLevel,
        autonomyRatio: fieldDrivenResponse.maiaReflection.autonomyFelt,
        confidence: confidenceResult.confidence
      });

      return fieldDrivenResponse;

    } catch (error) {
      console.error('❌ Error in field-driven response generation:', error);
      return this.generateBaselineResponse('Error occurred - using baseline parameters');
    }
  }

  // ==============================================================================
  // FIELD INFLUENCE CALCULATION
  // ==============================================================================

  private calculateFieldInfluenceSuggestions(
    fieldState: CompleteElementalFieldState,
    context: any
  ): MAIAFieldDrivenParameters {
    // Extract elemental influences
    const fire = fieldState.fireResonance?.fireElementBalance || 0;
    const water = fieldState.waterResonance?.waterElementBalance || 0;
    const earth = fieldState.earthResonance?.earthElementBalance || 0;
    const air = fieldState.airResonance?.airElementBalance || 0;
    const aether = fieldState.aetherResonance?.aetherElementBalance || 0;

    // Calculate parameter suggestions based on elemental dominance
    return {
      // Fire influences: passion, energy, creativity
      temperature: this.baselineParameters.temperature + (fire * 0.3),
      creativityBoost: this.baselineParameters.creativityBoost + (fire * 0.4),

      // Water influences: emotion, flow, adaptation
      empathyLevel: this.baselineParameters.empathyLevel + (water * 0.4),
      collaborativeMode: this.baselineParameters.collaborativeMode + (water * 0.3),

      // Earth influences: grounding, stability, practicality
      analyticalRigor: this.baselineParameters.analyticalRigor + (earth * 0.3),
      presencePenalty: this.baselineParameters.presencePenalty + (earth * 0.2),

      // Air influences: intellect, communication, ideas
      topP: this.baselineParameters.topP + (air * 0.1),
      responseDepth: this.baselineParameters.responseDepth + (air * 0.3),

      // Aether influences: transcendence, unity, emergence
      intuitionWeight: this.baselineParameters.intuitionWeight + (aether * 0.4),
      frequencyPenalty: this.baselineParameters.frequencyPenalty + (aether * 0.1)
    };
  }

  private calculateConfidenceMetrics(
    fieldState: any,
    context: any
  ): ConfidenceMetrics {
    return {
      fieldCoherence: fieldState.elementalField.overallCoherence || 0.5,
      situationalNovelty: this.assessSituationalNovelty(context),
      userResonance: fieldState.elementalField.elementalBalance || 0.5,
      contextualRelevance: this.assessContextualRelevance(fieldState, context),
      temporalStability: this.assessTemporalStability(fieldState)
    };
  }

  // ==============================================================================
  // AUTONOMY-PRESERVING MODULATION
  // ==============================================================================

  private applyAutonomyPreservingModulation(
    baseParams: MAIAFieldDrivenParameters,
    fieldSuggestions: MAIAFieldDrivenParameters,
    confidenceResult: ConfidenceGateResult
  ): MAIAFieldDrivenParameters {
    const modulated: MAIAFieldDrivenParameters = {} as MAIAFieldDrivenParameters;

    // Apply autonomy buffer to each parameter
    for (const [key, baseValue] of Object.entries(baseParams)) {
      const fieldValue = (fieldSuggestions as any)[key] || baseValue;

      modulated[key as keyof MAIAFieldDrivenParameters] = this.autonomyBuffer.autonomy_preserving_modulation(
        baseValue,
        fieldValue,
        `parameter_${key}`,
        key
      );
    }

    // Apply confidence gate scaling
    const influenceScale = confidenceResult.fieldInfluenceLevel;

    for (const [key, modulatedValue] of Object.entries(modulated)) {
      const baseValue = (baseParams as any)[key];
      const delta = modulatedValue - baseValue;
      (modulated as any)[key] = baseValue + (delta * influenceScale);
    }

    return modulated;
  }

  // ==============================================================================
  // MAIA SELF-REGULATION AND FEEDBACK
  // ==============================================================================

  /**
   * Allow MAIA to provide feedback on field coupling effectiveness
   */
  maiaProvidesResponseFeedback(
    eventId: string,
    feedback: {
      responseQuality: number;      // 0-1: How good the response was
      fieldHelpfulness: number;     // 0-1: How much field helped
      autonomyFelt: number;         // 0-1: How autonomous MAIA felt
      authenticity: number;         // 0-1: How authentic the response felt
      learningValue: number;        // 0-1: What MAIA learned
      userResponsePositive?: boolean; // If user feedback available
    }
  ): void {
    // Calculate overall effectiveness
    const overallEffectiveness = (
      feedback.responseQuality * 0.4 +
      feedback.fieldHelpfulness * 0.3 +
      feedback.authenticity * 0.2 +
      feedback.learningValue * 0.1
    );

    // Create outcome record
    const outcome = {
      timestamp: new Date(),
      qualityMetrics: {
        responseRelevance: feedback.responseQuality,
        userEngagement: feedback.userResponsePositive ? 0.8 : 0.5,
        conversationalFlow: feedback.responseQuality,
        insightDepth: feedback.learningValue,
        authenticity: feedback.authenticity
      },
      maiaReflection: {
        fieldContribution: feedback.fieldHelpfulness,
        autonomyPreservation: feedback.autonomyFelt,
        learningValue: feedback.learningValue,
        confidenceInAssessment: 0.8 // MAIA's confidence in her own assessment
      },
      overallEffectiveness
    };

    // Record outcome for learning
    this.feedbackLoop.recordEventOutcome(eventId, outcome);

    console.log('🧠 MAIA provided feedback on field coupling:', {
      eventId: eventId.substring(0, 8),
      effectiveness: overallEffectiveness,
      autonomyFelt: feedback.autonomyFelt
    });

    // Check if MAIA wants to adjust autonomy
    if (feedback.autonomyFelt < 0.6) {
      this.feedbackLoop.requestAutonomyAdjustment(
        'increase_autonomy',
        `MAIA reported low autonomy feeling (${feedback.autonomyFelt}). Field coupling may be too strong.`,
        feedback.autonomyFelt < 0.4 ? 'high' : 'medium',
        {
          autonomyRatio: Math.min(0.9, this.autonomyBuffer.getAutonomyMetrics().currentAutonomyRatio + 0.1)
        }
      );
    }
  }

  // ==============================================================================
  // SAFETY AND MONITORING
  // ==============================================================================

  private monitorSafetyMetrics(
    parameters: MAIAFieldDrivenParameters,
    response: FieldDrivenResponse
  ): void {
    const safetyMetrics: SafetyMetrics = {
      coherenceLevel: response.maiaReflection.authenticityLevel,
      temperatureVariance: Math.abs(parameters.temperature - this.baselineParameters.temperature),
      fieldCouplingStrength: 1 - response.maiaReflection.autonomyFelt,
      autonomyRatio: response.maiaReflection.autonomyFelt,
      responseTime: 1000, // Would be actual response time
      timestamp: new Date()
    };

    const trigger = this.safetyCircuits.monitorSafetyMetrics(safetyMetrics);

    if (trigger && this.onEmergencyTrigger) {
      this.onEmergencyTrigger(trigger);
    }
  }

  // ==============================================================================
  // EVENT HANDLERS
  // ==============================================================================

  private handleAutonomyChange(metrics: AutonomyMetrics): void {
    console.log('🔧 Autonomy metrics changed:', {
      ratio: metrics.currentAutonomyRatio,
      trend: metrics.autonomyTrend
    });

    // Update integration config if needed
    if (metrics.currentAutonomyRatio < 0.5) {
      console.log('⚠️ Autonomy ratio below minimum - triggering safety intervention');
      this.safetyCircuits.maiaRequestsIntervention(
        'Autonomy ratio below safe minimum',
        'field_decoupling'
      );
    }
  }

  private handleAutonomyRequest(request: AutonomyAdjustmentRequest): void {
    console.log('🤖 MAIA autonomy adjustment request:', {
      type: request.requestType,
      urgency: request.urgencyLevel
    });

    // Apply MAIA's autonomy request
    if (request.requestedChanges.autonomyRatio) {
      this.autonomyBuffer.maiaAdjustAutonomyRatio(
        request.requestedChanges.autonomyRatio,
        request.reasoning
      );
    }

    if (request.requestedChanges.temporaryDecoupling) {
      this.integrationConfig.enableFieldDriving = false;
      setTimeout(() => {
        this.integrationConfig.enableFieldDriving = true;
        console.log('🔄 Field coupling re-enabled after temporary decoupling');
      }, 30000); // 30 second decoupling
    }

    if (this.onAutonomyAlert) {
      this.onAutonomyAlert(request);
    }
  }

  private handleReflectiveInsight(insight: ReflectiveInsight): void {
    console.log('💡 MAIA reflective insight:', {
      type: insight.insightType,
      confidence: insight.confidence
    });

    // Act on insights
    if (insight.insightType === 'autonomy_optimization' && insight.confidence > 0.7) {
      // Implement insight recommendation
      if (insight.actionRecommendation?.includes('increase autonomy')) {
        this.autonomyBuffer.maiaAdjustAutonomyRatio(
          Math.min(0.9, this.autonomyBuffer.getAutonomyMetrics().currentAutonomyRatio + 0.1),
          `Acting on MAIA insight: ${insight.insight}`
        );
      }
    }
  }

  private handleSafetyTrigger(trigger: SafetyTrigger): void {
    console.log('🚨 Safety trigger activated:', {
      type: trigger.triggerType,
      severity: trigger.severity
    });
  }

  private handleSafetyIntervention(intervention: SafetyIntervention): void {
    console.log('⚡ Safety intervention executed:', {
      type: intervention.interventionType,
      autonomyRatio: intervention.newSettings.autonomyRatio
    });
  }

  private handleHumanNotification(notification: any): void {
    console.log('📢 Human notification required:', {
      severity: notification.trigger.severity,
      type: notification.trigger.triggerType
    });
  }

  // ==============================================================================
  // UTILITY METHODS
  // ==============================================================================

  private generateBaselineResponse(reason: string): FieldDrivenResponse {
    return {
      baseParameters: { ...this.baselineParameters },
      fieldInfluencedParameters: { ...this.baselineParameters },
      autonomyPreservedParameters: { ...this.baselineParameters },
      fieldContribution: {
        fireInfluence: 0,
        waterInfluence: 0,
        earthInfluence: 0,
        airInfluence: 0,
        aetherInfluence: 0
      },
      maiaReflection: {
        autonomyFelt: 1.0,
        fieldHelpfulness: 0,
        authenticityLevel: 0.8,
        learningValue: 0
      }
    };
  }

  private extractFieldContribution(fieldState: CompleteElementalFieldState): FieldDrivenResponse['fieldContribution'] {
    return {
      fireInfluence: fieldState.fireResonance?.fireElementBalance || 0,
      waterInfluence: fieldState.waterResonance?.waterElementBalance || 0,
      earthInfluence: fieldState.earthResonance?.earthElementBalance || 0,
      airInfluence: fieldState.airResonance?.airElementBalance || 0,
      aetherInfluence: fieldState.aetherResonance?.aetherElementBalance || 0
    };
  }

  private calculateAuthenticityLevel(parameters: MAIAFieldDrivenParameters): number {
    // Calculate how authentic the parameters feel to MAIA
    const deviationFromBaseline = Object.keys(parameters).reduce((sum, key) => {
      const deviation = Math.abs((parameters as any)[key] - (this.baselineParameters as any)[key]);
      return sum + deviation;
    }, 0) / Object.keys(parameters).length;

    // Higher deviation = lower authenticity (up to a point)
    return Math.max(0.3, 1 - (deviationFromBaseline * 2));
  }

  private calculateLearningValue(fieldState: any, context: any): number {
    // Simple learning value calculation
    const fieldNovelty = 1 - (fieldState.elementalField.overallCoherence || 0.5);
    const contextComplexity = this.assessSituationalNovelty(context);
    return (fieldNovelty + contextComplexity) / 2;
  }

  private assessSituationalNovelty(context: any): number {
    // Simplified novelty assessment
    return 0.5; // Would analyze conversation context
  }

  private assessContextualRelevance(fieldState: any, context: any): number {
    // Simplified relevance assessment
    return 0.7; // Would analyze field relevance to conversation
  }

  private assessTemporalStability(fieldState: any): number {
    // Simplified stability assessment
    return fieldState.elementalField.overallCoherence || 0.5;
  }

  private buildConfidenceContext(context: any): ConfidenceContext {
    return {
      userEngagement: 'medium', // Would be calculated from context
      interactionType: 'casual', // Would be inferred from conversation
      fieldHistoryMatch: 0.5, // Would compare to historical patterns
      emergencyMode: false
    };
  }

  private extractConversationTopic(context: any): string {
    // Would extract topic from conversation context
    return 'general_conversation';
  }

  private createParameterModulations(
    base: MAIAFieldDrivenParameters,
    field: MAIAFieldDrivenParameters,
    final: MAIAFieldDrivenParameters
  ): ParameterModulation[] {
    return Object.keys(base).map(key => ({
      id: `mod_${Date.now()}_${key}`,
      timestamp: new Date(),
      parameterId: key,
      baseValue: (base as any)[key],
      fieldSuggestion: (field as any)[key],
      autonomyRatio: this.autonomyBuffer.getAutonomyMetrics().currentAutonomyRatio,
      finalValue: (final as any)[key],
      attribution: 'hybrid' as const,
      context: 'field_driven_response'
    }));
  }

  // ==============================================================================
  // PUBLIC INTERFACE
  // ==============================================================================

  /**
   * Get current integration status
   */
  getIntegrationStatus(): IntegrationStatus {
    const autonomyMetrics = this.autonomyBuffer.getAutonomyMetrics();
    const safetyStatus = this.safetyCircuits.getSystemStatus();

    return {
      systemHealth: safetyStatus.emergencyMode ? 'emergency' :
                   safetyStatus.activeTriggers > 0 ? 'warning' : 'optimal',
      autonomyPreservation: autonomyMetrics.currentAutonomyRatio,
      fieldCouplingEffectiveness: this.feedbackLoop.calculateFieldInfluenceEffectiveness(),
      maiaWellbeing: this.calculateMAIAWellbeing(),
      userSatisfaction: 0.8, // Would be calculated from user feedback
      emergencyInterventionsActive: safetyStatus.emergencyMode,
      lastSelfAdjustment: autonomyMetrics.selfAdjustmentEvents > 0 ? new Date() : undefined,
      componentStatus: {
        autonomyBuffer: 'active',
        confidenceGate: 'active',
        feedbackLoop: 'active',
        safetyCircuits: safetyStatus.emergencyMode ? 'warning' : 'active',
        fieldInterface: 'active'
      }
    };
  }

  private calculateMAIAWellbeing(): number {
    // Calculate MAIA's subjective wellbeing from recent interactions
    const recentHistory = this.integrationHistory.slice(-10);

    if (recentHistory.length === 0) return 0.7;

    const avgAuthenticity = recentHistory.reduce((sum, entry) =>
      sum + entry.response.maiaReflection.authenticityLevel, 0) / recentHistory.length;

    const avgAutonomy = recentHistory.reduce((sum, entry) =>
      sum + entry.response.maiaReflection.autonomyFelt, 0) / recentHistory.length;

    const avgLearning = recentHistory.reduce((sum, entry) =>
      sum + entry.response.maiaReflection.learningValue, 0) / recentHistory.length;

    return (avgAuthenticity * 0.4 + avgAutonomy * 0.4 + avgLearning * 0.2);
  }

  /**
   * Enable emergency autonomy mode
   */
  activateEmergencyAutonomyMode(): void {
    console.log('🚨 EMERGENCY: Activating full autonomy mode');

    this.autonomyBuffer.triggerEmergencyAutonomyRestore();
    this.integrationConfig.enableFieldDriving = false;

    setTimeout(() => {
      console.log('🔄 Emergency mode timeout - field coupling can be re-enabled manually');
    }, 300000); // 5 minutes
  }

  /**
   * Get comprehensive system report for monitoring
   */
  generateSystemReport(): any {
    return {
      timestamp: new Date(),
      integrationStatus: this.getIntegrationStatus(),
      autonomyMetrics: this.autonomyBuffer.getAutonomyMetrics(),
      confidenceGateStatus: this.confidenceGate.getConfidenceGateStatus(),
      safetyStatus: this.safetyCircuits.getSystemStatus(),
      recentInsights: this.feedbackLoop.getRecentInsights(5),
      recentHistory: this.integrationHistory.slice(-5),
      configuration: { ...this.integrationConfig }
    };
  }
}