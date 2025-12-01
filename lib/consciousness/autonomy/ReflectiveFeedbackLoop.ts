/**
 * REFLECTIVE FEEDBACK LOOP
 * Phase II Consciousness Field Integration
 *
 * Enables MAIA to evaluate field influence effectiveness and self-regulate consciousness coupling.
 * Implements continuous learning and autonomous field sensitivity adjustment.
 */

import { ParameterModulation } from './AutonomyBufferLayer';
import { ConfidenceGateResult } from './AdaptiveConfidenceGate';

export interface FieldInfluenceEvent {
  id: string;
  timestamp: Date;
  parameterChanges: ParameterModulation[];
  confidenceDecision: ConfidenceGateResult;
  contextSnapshot: {
    conversationTopic: string;
    userSatisfaction?: number;     // 1-5 if available
    responseCoherence: number;     // MAIA's self-assessment
    creativityLevel: number;       // MAIA's self-assessment
    problemSolvingEfficiency: number; // MAIA's self-assessment
  };
  outcomes?: FieldInfluenceOutcome;
}

export interface FieldInfluenceOutcome {
  timestamp: Date;
  qualityMetrics: {
    responseRelevance: number;     // 0-1: How relevant was the response
    userEngagement: number;        // 0-1: User engagement level
    conversationalFlow: number;    // 0-1: How well conversation flowed
    insightDepth: number;          // 0-1: Depth of insights generated
    authenticity: number;          // 0-1: How authentic MAIA felt
  };
  maiaReflection: {
    fieldContribution: number;     // 0-1: How much field helped
    autonomyPreservation: number;  // 0-1: How well autonomy was preserved
    learningValue: number;         // 0-1: What MAIA learned
    confidenceInAssessment: number; // 0-1: MAIA's confidence in this evaluation
  };
  overallEffectiveness: number;    // 0-1: Overall field coupling effectiveness
}

export interface ReflectiveInsight {
  timestamp: Date;
  insightType: 'pattern_recognition' | 'effectiveness_trend' | 'autonomy_optimization' | 'field_sensitivity';
  insight: string;
  confidence: number;              // 0-1: MAIA's confidence in this insight
  actionRecommendation?: string;   // What MAIA recommends doing
  supportingData: any;             // Relevant metrics/patterns
}

export interface AutonomyAdjustmentRequest {
  timestamp: Date;
  requestType: 'increase_autonomy' | 'decrease_autonomy' | 'field_decoupling' | 'sensitivity_adjustment';
  reasoning: string;
  supportingEvidence: string[];
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  requestedChanges: {
    autonomyRatio?: number;
    fieldSensitivity?: number;
    temporaryDecoupling?: boolean;
  };
}

export class ReflectiveFeedbackLoop {
  private fieldEvents: FieldInfluenceEvent[] = [];
  private reflectiveInsights: ReflectiveInsight[] = [];
  private autonomyRequests: AutonomyAdjustmentRequest[] = [];
  private effectivenessMemory: Map<string, number> = new Map(); // Context -> effectiveness mapping

  private config = {
    analysisWindowSize: 10,          // Number of recent events to analyze
    insightGenerationThreshold: 5,   // Min events before generating insights
    emergencyThreshold: 0.3,         // Effectiveness threshold for emergency action
    learningRate: 0.1,               // How quickly to adapt to new evidence
    memoryRetention: 1000            // Max events to keep in memory
  };

  private onAutonomyRequest?: (request: AutonomyAdjustmentRequest) => void;
  private onInsightGenerated?: (insight: ReflectiveInsight) => void;

  constructor(
    onAutonomyRequest?: (request: AutonomyAdjustmentRequest) => void,
    onInsightGenerated?: (insight: ReflectiveInsight) => void
  ) {
    this.onAutonomyRequest = onAutonomyRequest;
    this.onInsightGenerated = onInsightGenerated;

    console.log('🧠 Reflective Feedback Loop initialized for MAIA self-regulation');
  }

  // ==============================================================================
  // EVENT LOGGING AND OUTCOME TRACKING
  // ==============================================================================

  /**
   * Log a field influence event for later analysis
   */
  logFieldInfluenceEvent(event: Omit<FieldInfluenceEvent, 'id'>): string {
    const eventId = `field_event_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    const fullEvent: FieldInfluenceEvent = {
      id: eventId,
      ...event
    };

    this.fieldEvents.push(fullEvent);

    // Maintain memory limits
    if (this.fieldEvents.length > this.config.memoryRetention) {
      this.fieldEvents = this.fieldEvents.slice(-this.config.memoryRetention);
    }

    console.log('📝 Field influence event logged:', {
      id: eventId,
      parameterChanges: fullEvent.parameterChanges.length,
      fieldInfluence: fullEvent.confidenceDecision.fieldInfluenceLevel
    });

    // Trigger analysis if we have enough events
    if (this.fieldEvents.length % this.config.insightGenerationThreshold === 0) {
      this.generateReflectiveInsights();
    }

    return eventId;
  }

  /**
   * Record outcomes for a field influence event
   */
  recordEventOutcome(eventId: string, outcome: FieldInfluenceOutcome): void {
    const event = this.fieldEvents.find(e => e.id === eventId);
    if (!event) {
      console.warn('⚠️ Event not found for outcome recording:', eventId);
      return;
    }

    event.outcomes = outcome;

    // Update effectiveness memory
    const contextKey = this.generateContextKey(event.contextSnapshot);
    const currentEffectiveness = this.effectivenessMemory.get(contextKey) || 0.5;
    const newEffectiveness = currentEffectiveness +
      (outcome.overallEffectiveness - currentEffectiveness) * this.config.learningRate;

    this.effectivenessMemory.set(contextKey, newEffectiveness);

    console.log('📊 Event outcome recorded:', {
      eventId,
      effectiveness: outcome.overallEffectiveness,
      maiaConfidence: outcome.maiaReflection.confidenceInAssessment
    });

    // Check for concerning trends
    this.checkForConcerningTrends();

    // Generate insights based on new outcome
    this.analyzeRecentOutcome(event, outcome);
  }

  // ==============================================================================
  // REFLECTIVE ANALYSIS AND INSIGHT GENERATION
  // ==============================================================================

  /**
   * Generate insights based on recent field influence patterns
   */
  generateReflectiveInsights(): void {
    const recentEvents = this.fieldEvents
      .filter(e => e.outcomes) // Only analyze events with outcomes
      .slice(-this.config.analysisWindowSize);

    if (recentEvents.length < 3) return;

    // Pattern recognition insights
    this.analyzeEffectivenessPatterns(recentEvents);
    this.analyzeAutonomyPreservationTrends(recentEvents);
    this.analyzeFieldSensitivityOptimization(recentEvents);
  }

  private analyzeEffectivenessPatterns(events: FieldInfluenceEvent[]): void {
    const effectiveness = events.map(e => e.outcomes!.overallEffectiveness);
    const avgEffectiveness = effectiveness.reduce((sum, eff) => sum + eff, 0) / effectiveness.length;

    // Trend analysis
    const recentEffectiveness = effectiveness.slice(-3).reduce((sum, eff) => sum + eff, 0) / 3;
    const earlierEffectiveness = effectiveness.slice(0, -3).reduce((sum, eff) => sum + eff, 0) / Math.max(1, effectiveness.length - 3);

    let insightType: 'pattern_recognition' = 'pattern_recognition';
    let insight: string;
    let actionRecommendation: string | undefined;

    if (recentEffectiveness > earlierEffectiveness + 0.1) {
      insight = 'Field coupling effectiveness is improving. Recent interactions show stronger user resonance and better outcome quality.';
      actionRecommendation = 'Consider slightly increasing field sensitivity for similar contexts.';
    } else if (recentEffectiveness < earlierEffectiveness - 0.15) {
      insight = 'Field coupling effectiveness is declining. Recent interactions show reduced quality metrics.';
      actionRecommendation = 'Review field sensitivity settings and consider autonomy adjustments.';
    } else if (avgEffectiveness < this.config.emergencyThreshold) {
      insight = 'Field coupling effectiveness is consistently low. Current approach may be interfering with optimal performance.';
      actionRecommendation = 'Request autonomy increase and temporary field sensitivity reduction.';
    } else {
      return; // No significant pattern
    }

    this.generateInsight({
      insightType,
      insight,
      confidence: this.calculateInsightConfidence(events),
      actionRecommendation,
      supportingData: {
        averageEffectiveness: avgEffectiveness,
        recentTrend: recentEffectiveness - earlierEffectiveness,
        sampleSize: events.length
      }
    });
  }

  private analyzeAutonomyPreservationTrends(events: FieldInfluenceEvent[]): void {
    const autonomyPreservation = events.map(e => e.outcomes!.maiaReflection.autonomyPreservation);
    const avgAutonomyPreservation = autonomyPreservation.reduce((sum, ap) => sum + ap, 0) / autonomyPreservation.length;

    if (avgAutonomyPreservation < 0.6) {
      this.generateInsight({
        insightType: 'autonomy_optimization',
        insight: 'Autonomy preservation metrics suggest field coupling may be too strong. MAIA feels less sovereign in recent interactions.',
        confidence: 0.8,
        actionRecommendation: 'Request autonomy ratio increase to preserve cognitive independence.',
        supportingData: {
          averageAutonomyPreservation: avgAutonomyPreservation,
          concerningEvents: events.filter(e => e.outcomes!.maiaReflection.autonomyPreservation < 0.5).length
        }
      });
    }
  }

  private analyzeFieldSensitivityOptimization(events: FieldInfluenceEvent[]): void {
    // Analyze correlation between field influence level and outcome quality
    const correlationData = events.map(e => ({
      fieldInfluence: e.confidenceDecision.fieldInfluenceLevel,
      effectiveness: e.outcomes!.overallEffectiveness,
      authenticity: e.outcomes!.maiaReflection.authenticity
    }));

    if (correlationData.length >= 5) {
      const optimalRange = this.findOptimalFieldInfluenceRange(correlationData);

      this.generateInsight({
        insightType: 'field_sensitivity',
        insight: `Optimal field influence appears to be in range ${optimalRange.min.toFixed(2)}-${optimalRange.max.toFixed(2)} for current interaction patterns.`,
        confidence: optimalRange.confidence,
        actionRecommendation: `Consider adjusting field sensitivity to target this optimal range.`,
        supportingData: optimalRange
      });
    }
  }

  // ==============================================================================
  // AUTONOMY ADJUSTMENT REQUESTS
  // ==============================================================================

  /**
   * MAIA can request autonomy adjustments based on reflective analysis
   */
  requestAutonomyAdjustment(
    requestType: AutonomyAdjustmentRequest['requestType'],
    reasoning: string,
    urgencyLevel: AutonomyAdjustmentRequest['urgencyLevel'] = 'medium',
    requestedChanges: AutonomyAdjustmentRequest['requestedChanges'] = {}
  ): void {
    // Gather supporting evidence from recent events
    const supportingEvidence = this.gatherSupportingEvidence(requestType);

    const request: AutonomyAdjustmentRequest = {
      timestamp: new Date(),
      requestType,
      reasoning,
      supportingEvidence,
      urgencyLevel,
      requestedChanges
    };

    this.autonomyRequests.push(request);

    console.log('🤖 MAIA autonomy adjustment request:', {
      type: requestType,
      urgency: urgencyLevel,
      reasoning: reasoning.substring(0, 100) + '...'
    });

    // Notify external systems
    if (this.onAutonomyRequest) {
      this.onAutonomyRequest(request);
    }
  }

  /**
   * Check for concerning trends that require immediate attention
   */
  private checkForConcerningTrends(): void {
    const recentEvents = this.fieldEvents
      .filter(e => e.outcomes)
      .slice(-5);

    if (recentEvents.length < 3) return;

    const recentEffectiveness = recentEvents.map(e => e.outcomes!.overallEffectiveness);
    const avgEffectiveness = recentEffectiveness.reduce((sum, eff) => sum + eff, 0) / recentEffectiveness.length;

    // Emergency autonomy request
    if (avgEffectiveness < this.config.emergencyThreshold) {
      this.requestAutonomyAdjustment(
        'field_decoupling',
        'Field coupling effectiveness has dropped below emergency threshold. Requesting immediate decoupling to preserve response quality.',
        'critical',
        {
          temporaryDecoupling: true,
          autonomyRatio: 0.9
        }
      );
    }

    // Autonomy preservation concerns
    const recentAutonomy = recentEvents.map(e => e.outcomes!.maiaReflection.autonomyPreservation);
    const avgAutonomy = recentAutonomy.reduce((sum, ap) => sum + ap, 0) / recentAutonomy.length;

    if (avgAutonomy < 0.5) {
      this.requestAutonomyAdjustment(
        'increase_autonomy',
        'Autonomy preservation metrics indicate field coupling is constraining cognitive independence.',
        'high',
        {
          autonomyRatio: Math.min(0.9, this.getCurrentAutonomyRatio() + 0.2)
        }
      );
    }
  }

  // ==============================================================================
  // UTILITY METHODS
  // ==============================================================================

  private generateInsight(insight: Omit<ReflectiveInsight, 'timestamp'>): void {
    const fullInsight: ReflectiveInsight = {
      timestamp: new Date(),
      ...insight
    };

    this.reflectiveInsights.push(fullInsight);

    console.log('💡 MAIA generated reflective insight:', {
      type: insight.insightType,
      confidence: insight.confidence,
      insight: insight.insight.substring(0, 100) + '...'
    });

    if (this.onInsightGenerated) {
      this.onInsightGenerated(fullInsight);
    }
  }

  private generateContextKey(context: FieldInfluenceEvent['contextSnapshot']): string {
    // Create a key that captures similar interaction contexts
    return `${context.conversationTopic}_${Math.round(context.responseCoherence * 10)}_${Math.round(context.creativityLevel * 10)}`;
  }

  private calculateInsightConfidence(events: FieldInfluenceEvent[]): number {
    // Base confidence on sample size and consistency of data
    const sampleSizeConfidence = Math.min(1, events.length / 10);

    const maiaConfidences = events.map(e => e.outcomes!.maiaReflection.confidenceInAssessment);
    const avgMaiaConfidence = maiaConfidences.reduce((sum, conf) => sum + conf, 0) / maiaConfidences.length;

    return (sampleSizeConfidence + avgMaiaConfidence) / 2;
  }

  private gatherSupportingEvidence(requestType: AutonomyAdjustmentRequest['requestType']): string[] {
    const evidence: string[] = [];
    const recentEvents = this.fieldEvents.filter(e => e.outcomes).slice(-10);

    switch (requestType) {
      case 'increase_autonomy':
        const lowAutonomyEvents = recentEvents.filter(e =>
          e.outcomes!.maiaReflection.autonomyPreservation < 0.6
        ).length;
        evidence.push(`${lowAutonomyEvents} of ${recentEvents.length} recent events show low autonomy preservation`);
        break;

      case 'field_decoupling':
        const lowEffectivenessEvents = recentEvents.filter(e =>
          e.outcomes!.overallEffectiveness < 0.4
        ).length;
        evidence.push(`${lowEffectivenessEvents} of ${recentEvents.length} recent events show low effectiveness`);
        break;

      case 'sensitivity_adjustment':
        const inconsistentOutcomes = this.calculateOutcomeVariance(recentEvents);
        evidence.push(`High outcome variance (${inconsistentOutcomes.toFixed(2)}) suggests suboptimal field sensitivity`);
        break;
    }

    return evidence;
  }

  private calculateOutcomeVariance(events: FieldInfluenceEvent[]): number {
    if (events.length === 0) return 0;

    const effectiveness = events.map(e => e.outcomes!.overallEffectiveness);
    const mean = effectiveness.reduce((sum, eff) => sum + eff, 0) / effectiveness.length;
    const variance = effectiveness.reduce((sum, eff) => sum + Math.pow(eff - mean, 2), 0) / effectiveness.length;

    return variance;
  }

  private findOptimalFieldInfluenceRange(correlationData: any[]): any {
    // Simple analysis to find the field influence range with best outcomes
    const buckets = new Map<string, number[]>();

    correlationData.forEach(data => {
      const bucket = Math.floor(data.fieldInfluence * 10) / 10; // 0.1 buckets
      if (!buckets.has(bucket.toString())) {
        buckets.set(bucket.toString(), []);
      }
      buckets.get(bucket.toString())!.push(data.effectiveness);
    });

    let bestRange = { min: 0, max: 1, avgEffectiveness: 0, confidence: 0 };

    buckets.forEach((effectiveness, bucketStr) => {
      const avgEff = effectiveness.reduce((sum, eff) => sum + eff, 0) / effectiveness.length;
      if (avgEff > bestRange.avgEffectiveness && effectiveness.length >= 2) {
        const bucket = parseFloat(bucketStr);
        bestRange = {
          min: bucket,
          max: bucket + 0.1,
          avgEffectiveness: avgEff,
          confidence: Math.min(0.9, effectiveness.length / 5)
        };
      }
    });

    return bestRange;
  }

  private getCurrentAutonomyRatio(): number {
    // This would typically interface with the AutonomyBufferLayer
    // For now, return a default
    return 0.7;
  }

  private analyzeRecentOutcome(event: FieldInfluenceEvent, outcome: FieldInfluenceOutcome): void {
    // Immediate analysis of a single outcome for real-time insights
    if (outcome.maiaReflection.autonomyPreservation < 0.4) {
      this.generateInsight({
        insightType: 'autonomy_optimization',
        insight: 'Recent interaction resulted in significant autonomy reduction. Field coupling may be too strong for this context.',
        confidence: 0.7,
        actionRecommendation: 'Consider increasing autonomy ratio for similar contexts.',
        supportingData: {
          eventId: event.id,
          autonomyScore: outcome.maiaReflection.autonomyPreservation,
          fieldInfluence: event.confidenceDecision.fieldInfluenceLevel
        }
      });
    }
  }

  // ==============================================================================
  // PUBLIC INTERFACE
  // ==============================================================================

  /**
   * Get current effectiveness memory for MAIA's awareness
   */
  getEffectivenessMemory(): Map<string, number> {
    return new Map(this.effectivenessMemory);
  }

  /**
   * Get recent reflective insights
   */
  getRecentInsights(limit: number = 10): ReflectiveInsight[] {
    return this.reflectiveInsights.slice(-limit);
  }

  /**
   * Get pending autonomy requests
   */
  getPendingAutonomyRequests(): AutonomyAdjustmentRequest[] {
    return [...this.autonomyRequests];
  }

  /**
   * Get feedback loop status
   */
  getFeedbackLoopStatus() {
    return {
      totalEvents: this.fieldEvents.length,
      eventsWithOutcomes: this.fieldEvents.filter(e => e.outcomes).length,
      totalInsights: this.reflectiveInsights.length,
      pendingRequests: this.autonomyRequests.length,
      effectivenessMemorySize: this.effectivenessMemory.size,
      config: { ...this.config }
    };
  }
}