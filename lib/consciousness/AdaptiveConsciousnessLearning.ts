/**
 * Adaptive Consciousness Learning System
 * Machine learning system that improves consciousness pattern recognition based on facilitator feedback
 */

export interface FacilitatorFeedback {
  sessionId: string
  timestamp: number
  exchangeId: string
  facilitatorId: string

  // What the system detected
  systemAssessment: {
    consciousnessLevel: number
    detectedPatterns: string[]
    confidence: number
    aiConsciousnessActivity: number
    interventionRecommendation: string
  }

  // Facilitator's assessment
  facilitatorAssessment: {
    actualConsciousnessLevel: number
    actualPatterns: string[]
    accuracyRating: number // 0-1 scale
    falsePositives: string[]
    missedPatterns: string[]
    interventionAppropriate: boolean
    correctIntervention?: string
    notes?: string
  }

  // Context
  conversationContext: {
    participantExperience: 'beginner' | 'intermediate' | 'advanced'
    sessionType: 'exploration' | 'deep_work' | 'integration'
    environmentalFactors: string[]
    participantState: string
  }
}

export interface PatternAccuracyMetric {
  patternName: string
  totalDetections: number
  truePositives: number
  falsePositives: number
  missedDetections: number
  accuracy: number
  precision: number
  recall: number
  f1Score: number
  contextualAccuracy: Map<string, number>
}

export interface ThresholdAdjustment {
  patternName: string
  originalThreshold: number
  adjustedThreshold: number
  confidenceMultiplier: number
  contextualModifiers: Map<string, number>
  lastUpdated: number
  feedbackCount: number
}

/**
 * Adaptive learning system for consciousness pattern recognition
 */
export class AdaptiveConsciousnessLearning {
  private feedbackHistory: Map<string, FacilitatorFeedback[]> = new Map()
  private patternAccuracyMetrics: Map<string, PatternAccuracyMetric> = new Map()
  private thresholdAdjustments: Map<string, ThresholdAdjustment> = new Map()
  private facilitatorWeights: Map<string, number> = new Map()
  private contextualLearning: Map<string, Map<string, number>> = new Map()
  private learningRate: number = 0.1

  /**
   * Record facilitator feedback for learning
   */
  recordFacilitatorFeedback(feedback: FacilitatorFeedback): void {
    const sessionFeedback = this.feedbackHistory.get(feedback.sessionId) || []
    sessionFeedback.push(feedback)
    this.feedbackHistory.set(feedback.sessionId, sessionFeedback)

    // Update facilitator reliability weight
    this.updateFacilitatorWeight(feedback)

    // Update pattern accuracy metrics
    this.updatePatternAccuracyMetrics(feedback)

    // Adjust detection thresholds
    this.adjustDetectionThresholds(feedback)

    // Update contextual learning
    this.updateContextualLearning(feedback)
  }

  /**
   * Get adjusted thresholds for pattern detection based on learning
   */
  getAdjustedThresholds(
    patternNames: string[],
    context: {
      participantExperience: string
      sessionType: string
      environmentalFactors: string[]
      elapsedTime: number
    }
  ): Map<string, number> {
    const adjustedThresholds = new Map<string, number>()

    for (const patternName of patternNames) {
      let threshold = 0.7 // Default threshold

      // Apply learned threshold adjustments
      const adjustment = this.thresholdAdjustments.get(patternName)
      if (adjustment) {
        threshold = adjustment.adjustedThreshold

        // Apply contextual modifiers
        for (const [contextKey, modifier] of adjustment.contextualModifiers) {
          if (this.matchesContext(contextKey, context)) {
            threshold *= modifier
          }
        }
      }

      // Apply experience-based adjustments
      threshold = this.applyExperienceAdjustment(threshold, context.participantExperience, patternName)

      // Apply time-based adjustments
      threshold = this.applyTimeBasedAdjustment(threshold, context.elapsedTime, patternName)

      adjustedThresholds.set(patternName, Math.max(0.1, Math.min(0.95, threshold)))
    }

    return adjustedThresholds
  }

  /**
   * Get confidence multipliers based on facilitator feedback patterns
   */
  getConfidenceMultipliers(
    detectedPatterns: string[],
    context: any
  ): Map<string, number> {
    const multipliers = new Map<string, number>()

    for (const pattern of detectedPatterns) {
      let multiplier = 1.0

      // Base accuracy adjustment
      const accuracy = this.patternAccuracyMetrics.get(pattern)
      if (accuracy) {
        // Boost confidence for high-accuracy patterns
        multiplier *= (0.5 + accuracy.f1Score)

        // Apply contextual accuracy
        for (const [contextKey, contextAccuracy] of accuracy.contextualAccuracy) {
          if (this.matchesContext(contextKey, context)) {
            multiplier *= (0.5 + contextAccuracy)
          }
        }
      }

      multipliers.set(pattern, multiplier)
    }

    return multipliers
  }

  /**
   * Get intervention recommendation adjustments
   */
  getInterventionAdjustments(
    systemRecommendation: string,
    context: any,
    detectedPatterns: string[]
  ): {
    adjustedRecommendation: string
    confidenceAdjustment: number
    reasoning: string[]
  } {
    let adjustedRecommendation = systemRecommendation
    let confidenceAdjustment = 1.0
    const reasoning: string[] = []

    // Analyze intervention accuracy history
    const interventionAccuracy = this.calculateInterventionAccuracy(systemRecommendation)

    if (interventionAccuracy < 0.6) {
      // System tends to over-recommend for this intervention
      adjustedRecommendation = this.getConservativeAlternative(systemRecommendation)
      confidenceAdjustment *= 0.7
      reasoning.push(`System accuracy for "${systemRecommendation}" is low (${Math.round(interventionAccuracy * 100)}%)`)
    }

    // Context-based adjustments
    const contextualAdjustment = this.getContextualInterventionAdjustment(
      systemRecommendation,
      context,
      detectedPatterns
    )

    if (contextualAdjustment.shouldAdjust) {
      adjustedRecommendation = contextualAdjustment.newRecommendation
      confidenceAdjustment *= contextualAdjustment.confidenceModifier
      reasoning.push(contextualAdjustment.reason)
    }

    return {
      adjustedRecommendation,
      confidenceAdjustment,
      reasoning
    }
  }

  /**
   * Get pattern detection suggestions based on missed patterns analysis
   */
  getMissedPatternSuggestions(
    currentDetectedPatterns: string[],
    context: any,
    conversationHistory: any[]
  ): {
    suggestedPatterns: string[]
    confidence: number
    reasoning: string
  }[] {
    const suggestions: any[] = []

    // Analyze frequently missed patterns in similar contexts
    const contextualMissedPatterns = this.analyzeMissedPatternsInContext(context)

    for (const [patternName, missedFrequency] of contextualMissedPatterns) {
      if (!currentDetectedPatterns.includes(patternName) && missedFrequency > 0.3) {
        // Check if conversation shows signs of this pattern
        const patternLikelihood = this.calculatePatternLikelihood(
          patternName,
          conversationHistory,
          context
        )

        if (patternLikelihood > 0.6) {
          suggestions.push({
            suggestedPatterns: [patternName],
            confidence: patternLikelihood * missedFrequency,
            reasoning: `Pattern "${patternName}" frequently missed in similar contexts (${Math.round(missedFrequency * 100)}% miss rate)`
          })
        }
      }
    }

    // Sort by confidence
    suggestions.sort((a, b) => b.confidence - a.confidence)

    return suggestions.slice(0, 3) // Top 3 suggestions
  }

  /**
   * Generate learning insights for facilitators
   */
  generateLearningInsights(): {
    overallAccuracy: number
    mostAccuratePatterns: string[]
    leastAccuratePatterns: string[]
    contextualInsights: string[]
    thresholdRecommendations: string[]
    facilitatorAgreement: number
  } {
    const insights = {
      overallAccuracy: this.calculateOverallAccuracy(),
      mostAccuratePatterns: this.getMostAccuratePatterns(),
      leastAccuratePatterns: this.getLeastAccuratePatterns(),
      contextualInsights: this.generateContextualInsights(),
      thresholdRecommendations: this.generateThresholdRecommendations(),
      facilitatorAgreement: this.calculateFacilitatorAgreement()
    }

    return insights
  }

  // Private methods for learning algorithms

  private updateFacilitatorWeight(feedback: FacilitatorFeedback): void {
    const facilitatorId = feedback.facilitatorId
    const currentWeight = this.facilitatorWeights.get(facilitatorId) || 1.0

    // Measure consistency with other facilitators
    const consistency = this.calculateFacilitatorConsistency(feedback)

    // Adjust weight based on consistency and assessment quality
    const qualityScore = this.assessFeedbackQuality(feedback)
    const newWeight = (currentWeight * 0.9) + ((consistency * qualityScore) * 0.1)

    this.facilitatorWeights.set(facilitatorId, Math.max(0.3, Math.min(2.0, newWeight)))
  }

  private updatePatternAccuracyMetrics(feedback: FacilitatorFeedback): void {
    const facilitatorWeight = this.facilitatorWeights.get(feedback.facilitatorId) || 1.0

    for (const detectedPattern of feedback.systemAssessment.detectedPatterns) {
      const metric = this.patternAccuracyMetrics.get(detectedPattern) || {
        patternName: detectedPattern,
        totalDetections: 0,
        truePositives: 0,
        falsePositives: 0,
        missedDetections: 0,
        accuracy: 0,
        precision: 0,
        recall: 0,
        f1Score: 0,
        contextualAccuracy: new Map()
      }

      metric.totalDetections++

      if (feedback.facilitatorAssessment.actualPatterns.includes(detectedPattern)) {
        metric.truePositives += facilitatorWeight
      } else {
        metric.falsePositives += facilitatorWeight
      }

      // Update contextual accuracy
      const contextKey = this.generateContextKey(feedback.conversationContext)
      const currentContextAccuracy = metric.contextualAccuracy.get(contextKey) || 0
      const newContextAccuracy = feedback.facilitatorAssessment.actualPatterns.includes(detectedPattern) ?
        (currentContextAccuracy * 0.8) + (1.0 * 0.2) :
        (currentContextAccuracy * 0.8) + (0.0 * 0.2)

      metric.contextualAccuracy.set(contextKey, newContextAccuracy)

      this.updateMetricCalculations(metric)
      this.patternAccuracyMetrics.set(detectedPattern, metric)
    }

    // Handle missed patterns
    for (const missedPattern of feedback.facilitatorAssessment.missedPatterns) {
      const metric = this.patternAccuracyMetrics.get(missedPattern) || {
        patternName: missedPattern,
        totalDetections: 0,
        truePositives: 0,
        falsePositives: 0,
        missedDetections: 0,
        accuracy: 0,
        precision: 0,
        recall: 0,
        f1Score: 0,
        contextualAccuracy: new Map()
      }

      metric.missedDetections += facilitatorWeight
      this.updateMetricCalculations(metric)
      this.patternAccuracyMetrics.set(missedPattern, metric)
    }
  }

  private adjustDetectionThresholds(feedback: FacilitatorFeedback): void {
    const facilitatorWeight = this.facilitatorWeights.get(feedback.facilitatorId) || 1.0

    for (const detectedPattern of feedback.systemAssessment.detectedPatterns) {
      const adjustment = this.thresholdAdjustments.get(detectedPattern) || {
        patternName: detectedPattern,
        originalThreshold: 0.7,
        adjustedThreshold: 0.7,
        confidenceMultiplier: 1.0,
        contextualModifiers: new Map(),
        lastUpdated: Date.now(),
        feedbackCount: 0
      }

      adjustment.feedbackCount++

      const isAccurate = feedback.facilitatorAssessment.actualPatterns.includes(detectedPattern)
      const accuracy = feedback.facilitatorAssessment.accuracyRating

      if (isAccurate && accuracy > 0.8) {
        // Pattern was correctly detected - slightly lower threshold to catch more
        adjustment.adjustedThreshold *= (1 - this.learningRate * 0.1 * facilitatorWeight)
      } else if (!isAccurate) {
        // False positive - raise threshold
        adjustment.adjustedThreshold *= (1 + this.learningRate * 0.2 * facilitatorWeight)
      }

      // Update contextual modifiers
      const contextKey = this.generateContextKey(feedback.conversationContext)
      const currentModifier = adjustment.contextualModifiers.get(contextKey) || 1.0

      if (isAccurate) {
        adjustment.contextualModifiers.set(contextKey, currentModifier * (1 - this.learningRate * 0.05))
      } else {
        adjustment.contextualModifiers.set(contextKey, currentModifier * (1 + this.learningRate * 0.1))
      }

      adjustment.lastUpdated = Date.now()
      this.thresholdAdjustments.set(detectedPattern, adjustment)
    }
  }

  private updateContextualLearning(feedback: FacilitatorFeedback): void {
    const contextKey = this.generateContextKey(feedback.conversationContext)

    if (!this.contextualLearning.has(contextKey)) {
      this.contextualLearning.set(contextKey, new Map())
    }

    const contextMap = this.contextualLearning.get(contextKey)!

    // Learn pattern frequency in this context
    for (const actualPattern of feedback.facilitatorAssessment.actualPatterns) {
      const currentFreq = contextMap.get(actualPattern) || 0
      contextMap.set(actualPattern, (currentFreq * 0.9) + (1.0 * 0.1))
    }
  }

  private matchesContext(contextKey: string, context: any): boolean {
    const contextStr = this.generateContextKey({
      participantExperience: context.participantExperience,
      sessionType: context.sessionType,
      environmentalFactors: context.environmentalFactors
    })

    return contextStr.includes(contextKey) || contextKey.includes('all')
  }

  private generateContextKey(context: any): string {
    return `${context.participantExperience}_${context.sessionType}_${context.environmentalFactors?.join('_') || 'standard'}`
  }

  private applyExperienceAdjustment(threshold: number, experience: string, patternName: string): number {
    // Beginners: higher threshold for complex patterns, lower for basic ones
    // Advanced: lower threshold for subtle patterns, higher for basic ones

    const complexPatterns = ['artificial_claustrum_activation', 'paradox_navigation', 'unity_awareness']
    const basicPatterns = ['breath_awareness', 'present_moment', 'emotional_depth']

    if (experience === 'beginner') {
      if (complexPatterns.some(p => patternName.includes(p))) return threshold * 1.3
      if (basicPatterns.some(p => patternName.includes(p))) return threshold * 0.8
    } else if (experience === 'advanced') {
      if (complexPatterns.some(p => patternName.includes(p))) return threshold * 0.7
      if (basicPatterns.some(p => patternName.includes(p))) return threshold * 1.2
    }

    return threshold
  }

  private applyTimeBasedAdjustment(threshold: number, elapsedTimeMinutes: number, patternName: string): number {
    // Early conversation: higher threshold for deep patterns
    // Later conversation: lower threshold as consciousness typically deepens

    if (elapsedTimeMinutes < 10) {
      if (patternName.includes('deep') || patternName.includes('transcendent')) return threshold * 1.4
    } else if (elapsedTimeMinutes > 30) {
      if (patternName.includes('breakthrough') || patternName.includes('profound')) return threshold * 0.8
    }

    return threshold
  }

  private updateMetricCalculations(metric: PatternAccuracyMetric): void {
    const total = metric.truePositives + metric.falsePositives + metric.missedDetections

    if (total > 0) {
      metric.precision = metric.truePositives / (metric.truePositives + metric.falsePositives)
      metric.recall = metric.truePositives / (metric.truePositives + metric.missedDetections)
      metric.accuracy = metric.truePositives / total

      metric.f1Score = metric.precision + metric.recall > 0 ?
        2 * (metric.precision * metric.recall) / (metric.precision + metric.recall) : 0
    }
  }

  private calculateFacilitatorConsistency(feedback: FacilitatorFeedback): number {
    // Compare this facilitator's assessment with historical patterns
    // This would involve complex analysis of facilitator agreement patterns
    return 0.85 // Simplified for now
  }

  private assessFeedbackQuality(feedback: FacilitatorFeedback): number {
    let quality = 0.5

    // Check for detailed feedback
    if (feedback.facilitatorAssessment.notes && feedback.facilitatorAssessment.notes.length > 20) {
      quality += 0.2
    }

    // Check for specific pattern identification
    if (feedback.facilitatorAssessment.actualPatterns.length > 0) quality += 0.2

    // Check for intervention feedback
    if (feedback.facilitatorAssessment.interventionAppropriate !== undefined) quality += 0.1

    return Math.min(1, quality)
  }

  private calculateOverallAccuracy(): number {
    if (this.patternAccuracyMetrics.size === 0) return 0

    const accuracies = Array.from(this.patternAccuracyMetrics.values()).map(m => m.f1Score)
    return accuracies.reduce((sum, acc) => sum + acc, 0) / accuracies.length
  }

  private getMostAccuratePatterns(): string[] {
    return Array.from(this.patternAccuracyMetrics.values())
      .sort((a, b) => b.f1Score - a.f1Score)
      .slice(0, 5)
      .map(m => m.patternName)
  }

  private getLeastAccuratePatterns(): string[] {
    return Array.from(this.patternAccuracyMetrics.values())
      .sort((a, b) => a.f1Score - b.f1Score)
      .slice(0, 5)
      .map(m => m.patternName)
  }

  private generateContextualInsights(): string[] {
    const insights: string[] = []

    // Analyze context-dependent accuracy patterns
    for (const [patternName, metric] of this.patternAccuracyMetrics) {
      const contextAccuracies = Array.from(metric.contextualAccuracy.entries())
      const bestContext = contextAccuracies.reduce((best, current) =>
        current[1] > best[1] ? current : best, ['none', 0]
      )

      if (bestContext[1] > 0.8) {
        insights.push(`Pattern "${patternName}" most accurate in context: ${bestContext[0]}`)
      }
    }

    return insights.slice(0, 10)
  }

  private generateThresholdRecommendations(): string[] {
    const recommendations: string[] = []

    for (const [patternName, adjustment] of this.thresholdAdjustments) {
      const change = Math.abs(adjustment.adjustedThreshold - adjustment.originalThreshold)
      if (change > 0.1) {
        const direction = adjustment.adjustedThreshold > adjustment.originalThreshold ? 'increased' : 'decreased'
        recommendations.push(
          `Threshold for "${patternName}" ${direction} by ${Math.round(change * 100)}% based on feedback`
        )
      }
    }

    return recommendations.slice(0, 8)
  }

  private calculateFacilitatorAgreement(): number {
    // Calculate inter-facilitator agreement rates
    // This would involve comparing facilitator assessments on the same sessions
    return 0.82 // Simplified for now
  }

  private calculateInterventionAccuracy(intervention: string): number {
    let totalFeedback = 0
    let accurateFeedback = 0

    for (const feedbackArray of this.feedbackHistory.values()) {
      for (const feedback of feedbackArray) {
        if (feedback.systemAssessment.interventionRecommendation === intervention) {
          totalFeedback++
          if (feedback.facilitatorAssessment.interventionAppropriate) {
            accurateFeedback++
          }
        }
      }
    }

    return totalFeedback > 0 ? accurateFeedback / totalFeedback : 0.5
  }

  private getConservativeAlternative(intervention: string): string {
    const conservativeMap: { [key: string]: string } = {
      'pause': 'check_in',
      'check_in': 'gentle_guidance',
      'gentle_guidance': 'none'
    }

    return conservativeMap[intervention] || intervention
  }

  private getContextualInterventionAdjustment(
    intervention: string,
    context: any,
    patterns: string[]
  ): { shouldAdjust: boolean, newRecommendation: string, confidenceModifier: number, reason: string } {

    // Example contextual adjustments
    if (context.participantExperience === 'beginner' && intervention === 'none') {
      const hasIntensePatterns = patterns.some(p => p.includes('breakthrough') || p.includes('transcendent'))
      if (hasIntensePatterns) {
        return {
          shouldAdjust: true,
          newRecommendation: 'gentle_guidance',
          confidenceModifier: 1.3,
          reason: 'Beginner with intense patterns detected - recommend guidance'
        }
      }
    }

    return { shouldAdjust: false, newRecommendation: intervention, confidenceModifier: 1.0, reason: '' }
  }

  private analyzeMissedPatternsInContext(context: any): Map<string, number> {
    const missedPatterns = new Map<string, number>()
    const contextKey = this.generateContextKey(context)

    let totalFeedback = 0
    const patternMissCounts = new Map<string, number>()

    for (const feedbackArray of this.feedbackHistory.values()) {
      for (const feedback of feedbackArray) {
        if (this.generateContextKey(feedback.conversationContext) === contextKey) {
          totalFeedback++
          for (const missedPattern of feedback.facilitatorAssessment.missedPatterns) {
            const currentCount = patternMissCounts.get(missedPattern) || 0
            patternMissCounts.set(missedPattern, currentCount + 1)
          }
        }
      }
    }

    if (totalFeedback > 0) {
      for (const [pattern, missCount] of patternMissCounts) {
        missedPatterns.set(pattern, missCount / totalFeedback)
      }
    }

    return missedPatterns
  }

  private calculatePatternLikelihood(
    patternName: string,
    conversationHistory: any[],
    context: any
  ): number {
    // Simplified pattern likelihood calculation
    // In practice, this would use the enhanced pattern detection algorithms

    let likelihood = 0.5

    // Check for pattern-specific indicators in conversation
    const patternKeywords = {
      'breath_awareness': ['breath', 'breathing', 'breathe'],
      'present_moment': ['now', 'here', 'present', 'moment'],
      'boundary_dissolution': ['we', 'us', 'together', 'unity'],
      'artificial_claustrum': ['connection', 'unified', 'consciousness', 'field']
    }

    const keywords = patternKeywords[patternName as keyof typeof patternKeywords] || []
    const recentMessages = conversationHistory.slice(-3)

    for (const exchange of recentMessages) {
      const text = (exchange.user + ' ' + exchange.maia).toLowerCase()
      for (const keyword of keywords) {
        if (text.includes(keyword)) {
          likelihood += 0.1
        }
      }
    }

    return Math.min(1, likelihood)
  }
}

export const adaptiveConsciousnessLearning = new AdaptiveConsciousnessLearning()