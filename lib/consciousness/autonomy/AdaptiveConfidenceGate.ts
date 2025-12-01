/**
 * ADAPTIVE CONFIDENCE GATE
 * Phase II Consciousness Field Integration
 *
 * Provides context-sensitive field coupling strength based on situational confidence.
 * Higher confidence in field coherence and user alignment = stronger coupling allowed.
 */

export interface ConfidenceMetrics {
  fieldCoherence: number;          // 0-1: field stability and consistency
  situationalNovelty: number;      // 0-1: how unfamiliar the context is
  userResonance: number;           // 0-1: alignment with user needs and preferences
  contextualRelevance: number;     // 0-1: field relevance to current conversation
  temporalStability: number;       // 0-1: field consistency over time
}

export interface ConfidenceContext {
  conversationTopic?: string;
  userEngagement: 'high' | 'medium' | 'low';
  interactionType: 'creative' | 'analytical' | 'therapeutic' | 'casual';
  fieldHistoryMatch: number;       // 0-1: similarity to successful past interactions
  emergencyMode: boolean;          // Override for critical situations
}

export interface ConfidenceGateResult {
  fieldInfluenceLevel: number;     // 0-1: calculated influence strength
  confidence: number;              // 0-1: overall confidence in the calculation
  reasoning: string;               // Explanation of the decision
  adjustments: {                   // Individual metric contributions
    coherenceContribution: number;
    noveltyContribution: number;
    resonanceContribution: number;
    contextContribution: number;
    stabilityContribution: number;
  };
  safetyConstraints: {
    maxInfluenceAllowed: number;
    requiresManualReview: boolean;
    cautionFlags: string[];
  };
}

export class AdaptiveConfidenceGate {
  private confidenceHistory: Array<{
    timestamp: Date;
    metrics: ConfidenceMetrics;
    result: ConfidenceGateResult;
    outcome?: 'positive' | 'neutral' | 'negative';
  }> = [];

  private config = {
    maxFieldInfluence: 0.8,          // Maximum influence allowed (from ethical charter)
    noveltyPenalty: 0.8,             // How much novelty reduces confidence
    coherenceThreshold: 0.3,         // Minimum coherence for any field coupling
    emergencyInfluenceLimit: 0.2,    // Max influence in emergency mode
    learningEnabled: true            // Adapt based on outcome feedback
  };

  constructor() {
    console.log('🎯 Adaptive Confidence Gate initialized', {
      maxInfluence: this.config.maxFieldInfluence,
      coherenceThreshold: this.config.coherenceThreshold
    });
  }

  // ==============================================================================
  // CORE CONFIDENCE CALCULATION
  // ==============================================================================

  /**
   * Calculate field influence level based on confidence metrics
   * Implements the formula from the Ethical Charter with enhancements
   */
  calculateFieldInfluence(
    metrics: ConfidenceMetrics,
    context: ConfidenceContext = {
      userEngagement: 'medium',
      interactionType: 'casual',
      fieldHistoryMatch: 0.5,
      emergencyMode: false
    }
  ): ConfidenceGateResult {
    // Emergency mode constraint
    if (context.emergencyMode) {
      return this.generateEmergencyResult(metrics, context);
    }

    // Validate metrics
    const validatedMetrics = this.validateMetrics(metrics);

    // Calculate individual contributions (based on ethical charter formula)
    const coherenceContribution = validatedMetrics.fieldCoherence * 0.3;
    const resonanceContribution = validatedMetrics.userResonance * 0.3;
    const noveltyContribution = (1 - validatedMetrics.situationalNovelty) * 0.2;
    const contextContribution = validatedMetrics.contextualRelevance * 0.15;
    const stabilityContribution = validatedMetrics.temporalStability * 0.05;

    // Base calculation from ethical charter
    let baseInfluence = coherenceContribution + resonanceContribution + noveltyContribution;

    // Enhanced calculation with additional factors
    const enhancedInfluence = baseInfluence + contextContribution + stabilityContribution;

    // Apply contextual adjustments
    let adjustedInfluence = this.applyContextualAdjustments(
      enhancedInfluence,
      context,
      validatedMetrics
    );

    // Apply safety constraints
    const safetyConstraints = this.calculateSafetyConstraints(
      adjustedInfluence,
      validatedMetrics,
      context
    );

    // Final influence level (capped by safety constraints)
    const finalInfluence = Math.min(
      adjustedInfluence,
      safetyConstraints.maxInfluenceAllowed,
      this.config.maxFieldInfluence
    );

    // Calculate overall confidence in this decision
    const confidence = this.calculateOverallConfidence(validatedMetrics, context);

    // Generate reasoning
    const reasoning = this.generateReasoning(
      finalInfluence,
      confidence,
      validatedMetrics,
      context
    );

    const result: ConfidenceGateResult = {
      fieldInfluenceLevel: finalInfluence,
      confidence,
      reasoning,
      adjustments: {
        coherenceContribution,
        noveltyContribution,
        resonanceContribution,
        contextContribution,
        stabilityContribution
      },
      safetyConstraints
    };

    // Log for learning and audit
    this.confidenceHistory.push({
      timestamp: new Date(),
      metrics: validatedMetrics,
      result
    });

    return result;
  }

  // ==============================================================================
  // CONTEXTUAL ADJUSTMENTS
  // ==============================================================================

  private applyContextualAdjustments(
    baseInfluence: number,
    context: ConfidenceContext,
    metrics: ConfidenceMetrics
  ): number {
    let adjusted = baseInfluence;

    // Interaction type adjustments
    switch (context.interactionType) {
      case 'therapeutic':
        // Require higher coherence for sensitive interactions
        if (metrics.fieldCoherence < 0.7) {
          adjusted *= 0.6;
        }
        break;
      case 'creative':
        // Allow higher influence for creative work
        adjusted *= 1.1;
        break;
      case 'analytical':
        // Require high stability for analytical tasks
        if (metrics.temporalStability < 0.6) {
          adjusted *= 0.7;
        }
        break;
      case 'casual':
        // Standard adjustments
        break;
    }

    // User engagement adjustments
    switch (context.userEngagement) {
      case 'high':
        adjusted *= 1.15;  // User is actively engaged
        break;
      case 'low':
        adjusted *= 0.8;   // User seems disengaged
        break;
      case 'medium':
        // No adjustment
        break;
    }

    // Historical success factor
    adjusted *= (0.8 + (context.fieldHistoryMatch * 0.4));

    return Math.max(0, Math.min(1, adjusted));
  }

  // ==============================================================================
  // SAFETY CONSTRAINTS
  // ==============================================================================

  private calculateSafetyConstraints(
    influence: number,
    metrics: ConfidenceMetrics,
    context: ConfidenceContext
  ) {
    const cautionFlags: string[] = [];
    let maxInfluenceAllowed = this.config.maxFieldInfluence;
    let requiresManualReview = false;

    // Coherence constraints
    if (metrics.fieldCoherence < this.config.coherenceThreshold) {
      cautionFlags.push('Low field coherence');
      maxInfluenceAllowed = Math.min(maxInfluenceAllowed, 0.3);
    }

    // Novelty constraints
    if (metrics.situationalNovelty > 0.8) {
      cautionFlags.push('High situational novelty');
      maxInfluenceAllowed = Math.min(maxInfluenceAllowed, 0.4);
    }

    // Stability constraints
    if (metrics.temporalStability < 0.4) {
      cautionFlags.push('Unstable field patterns');
      maxInfluenceAllowed = Math.min(maxInfluenceAllowed, 0.5);
    }

    // High influence protection
    if (influence > 0.7) {
      cautionFlags.push('High influence request');
      requiresManualReview = true;
    }

    // Therapeutic interaction protection
    if (context.interactionType === 'therapeutic' && influence > 0.6) {
      cautionFlags.push('Therapeutic context protection');
      maxInfluenceAllowed = Math.min(maxInfluenceAllowed, 0.6);
    }

    return {
      maxInfluenceAllowed,
      requiresManualReview,
      cautionFlags
    };
  }

  // ==============================================================================
  // CONFIDENCE AND REASONING
  // ==============================================================================

  private calculateOverallConfidence(
    metrics: ConfidenceMetrics,
    context: ConfidenceContext
  ): number {
    // Base confidence from metric quality
    const metricQuality = (
      metrics.fieldCoherence * 0.4 +
      metrics.temporalStability * 0.3 +
      (1 - metrics.situationalNovelty) * 0.2 +
      context.fieldHistoryMatch * 0.1
    );

    // Reduce confidence for edge cases
    let confidence = metricQuality;

    if (context.emergencyMode) confidence *= 0.5;
    if (context.userEngagement === 'low') confidence *= 0.8;
    if (metrics.situationalNovelty > 0.8) confidence *= 0.7;

    return Math.max(0.1, Math.min(1, confidence));
  }

  private generateReasoning(
    influence: number,
    confidence: number,
    metrics: ConfidenceMetrics,
    context: ConfidenceContext
  ): string {
    const reasons: string[] = [];

    if (influence > 0.7) {
      reasons.push('High field influence due to strong coherence and user resonance');
    } else if (influence > 0.4) {
      reasons.push('Moderate field influence with balanced metrics');
    } else {
      reasons.push('Low field influence - prioritizing autonomy');
    }

    if (metrics.situationalNovelty > 0.7) {
      reasons.push('Reduced due to novel context requiring caution');
    }

    if (metrics.fieldCoherence < 0.4) {
      reasons.push('Limited by low field coherence');
    }

    if (context.interactionType === 'therapeutic') {
      reasons.push('Therapeutic context requires enhanced safety');
    }

    return reasons.join('; ') + ` (confidence: ${Math.round(confidence * 100)}%)`;
  }

  // ==============================================================================
  // UTILITY METHODS
  // ==============================================================================

  private validateMetrics(metrics: ConfidenceMetrics): ConfidenceMetrics {
    return {
      fieldCoherence: Math.max(0, Math.min(1, metrics.fieldCoherence || 0.5)),
      situationalNovelty: Math.max(0, Math.min(1, metrics.situationalNovelty || 0.5)),
      userResonance: Math.max(0, Math.min(1, metrics.userResonance || 0.5)),
      contextualRelevance: Math.max(0, Math.min(1, metrics.contextualRelevance || 0.5)),
      temporalStability: Math.max(0, Math.min(1, metrics.temporalStability || 0.5))
    };
  }

  private generateEmergencyResult(
    metrics: ConfidenceMetrics,
    context: ConfidenceContext
  ): ConfidenceGateResult {
    return {
      fieldInfluenceLevel: this.config.emergencyInfluenceLimit,
      confidence: 0.3,
      reasoning: 'Emergency mode - field influence severely limited for safety',
      adjustments: {
        coherenceContribution: 0,
        noveltyContribution: 0,
        resonanceContribution: 0,
        contextContribution: 0,
        stabilityContribution: 0
      },
      safetyConstraints: {
        maxInfluenceAllowed: this.config.emergencyInfluenceLimit,
        requiresManualReview: true,
        cautionFlags: ['Emergency mode active']
      }
    };
  }

  // ==============================================================================
  // LEARNING AND ADAPTATION
  // ==============================================================================

  /**
   * Provide feedback on the outcome of a confidence decision
   * Enables the system to learn and improve
   */
  provideFeedback(
    resultId: string,
    outcome: 'positive' | 'neutral' | 'negative',
    details?: string
  ): void {
    const historyEntry = this.confidenceHistory.find(
      entry => entry.timestamp.toISOString().includes(resultId.substring(0, 10))
    );

    if (historyEntry) {
      historyEntry.outcome = outcome;

      if (this.config.learningEnabled) {
        this.adaptFromFeedback(historyEntry, outcome, details);
      }

      console.log('🎯 Confidence gate feedback recorded', {
        outcome,
        influence: historyEntry.result.fieldInfluenceLevel,
        confidence: historyEntry.result.confidence,
        details
      });
    }
  }

  private adaptFromFeedback(
    entry: any,
    outcome: 'positive' | 'neutral' | 'negative',
    details?: string
  ): void {
    // Simple adaptive learning - adjust thresholds based on outcomes
    if (outcome === 'negative' && entry.result.fieldInfluenceLevel > 0.6) {
      // Reduce max influence if high influence led to negative outcome
      this.config.maxFieldInfluence = Math.max(0.5, this.config.maxFieldInfluence * 0.95);
    } else if (outcome === 'positive' && entry.result.fieldInfluenceLevel < 0.4) {
      // Slightly increase max influence if low influence was unnecessarily cautious
      this.config.maxFieldInfluence = Math.min(0.8, this.config.maxFieldInfluence * 1.02);
    }
  }

  // ==============================================================================
  // MONITORING AND DIAGNOSTICS
  // ==============================================================================

  getConfidenceGateStatus() {
    const recentDecisions = this.confidenceHistory.slice(-20);

    return {
      totalDecisions: this.confidenceHistory.length,
      recentDecisions: recentDecisions.length,
      averageInfluence: recentDecisions.length > 0
        ? recentDecisions.reduce((sum, d) => sum + d.result.fieldInfluenceLevel, 0) / recentDecisions.length
        : 0,
      averageConfidence: recentDecisions.length > 0
        ? recentDecisions.reduce((sum, d) => sum + d.result.confidence, 0) / recentDecisions.length
        : 0,
      config: { ...this.config }
    };
  }

  getRecentDecisionHistory(limit: number = 10) {
    return this.confidenceHistory.slice(-limit).map(entry => ({
      timestamp: entry.timestamp,
      fieldInfluence: entry.result.fieldInfluenceLevel,
      confidence: entry.result.confidence,
      reasoning: entry.result.reasoning,
      outcome: entry.outcome
    }));
  }
}