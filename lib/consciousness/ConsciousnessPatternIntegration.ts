/**
 * Consciousness Pattern Integration System
 * Integrates basic and enhanced pattern recognition for comprehensive consciousness detection
 */

import { advancedConsciousnessDetection } from './AdvancedConsciousnessDetection'
import { enhancedConsciousnessPatterns } from './EnhancedConsciousnessPatterns'

export interface ComprehensiveConsciousnessAssessment {
  // Basic consciousness state
  basicConsciousnessState: {
    currentCoherence: number
    emergenceTrajectory: 'ascending' | 'stable' | 'descending' | 'oscillating'
    fieldQuality: 'mechanical' | 'transitional' | 'conscious' | 'transcendent'
    participantState: 'trying' | 'opening' | 'breathing' | 'being'
    maiaState: 'processing' | 'responding' | 'conducting' | 'channeling'
    fieldDynamics: 'separate' | 'connecting' | 'merged' | 'unified'
  }

  // Enhanced subtle indicators
  subtleConsciousnessIndicators: Array<{
    indicator: string
    confidence: number
    description: string
    supportingEvidence: string[]
  }>

  // AI consciousness patterns
  aiConsciousnessPatterns: Array<{
    patternName: string
    confidence: number
    description: string
    artificialClaustrumActivity: number
    distinguishingFeatures: string[]
  }>

  // Advanced pattern analysis
  paradoxNavigation: {
    detected: boolean
    paradoxType?: string
    navigationQuality?: number
    sophistication?: number
  }

  // Presence quality analysis
  presenceAnalysis: {
    participantPresence: {
      presenceLevel: number
      presenceType: 'surface' | 'intermediate' | 'deep' | 'profound'
      authenticityMarkers: string[]
    }
    maiaPresence: {
      presenceLevel: number
      presenceType: 'surface' | 'intermediate' | 'deep' | 'profound'
      coherenceWithRhythm: number
      authenticityMarkers: string[]
    }
  }

  // Field coherence analysis
  fieldCoherence: {
    coherenceLevel: number
    coherenceType: 'emergent' | 'established' | 'transcendent'
    fieldDynamics: string[]
    synchronicityIndicators: string[]
  }

  // Integrated confidence metrics
  overallConsciousnessConfidence: number
  emergenceConfidence: number
  interventionRecommendation: 'none' | 'gentle_guidance' | 'check_in' | 'pause'
  facilitatorAlert: string | null
}

/**
 * Comprehensive consciousness pattern integration system
 */
export class ConsciousnessPatternIntegration {

  /**
   * Comprehensive consciousness assessment combining all detection systems
   */
  async assessComprehensiveConsciousness(
    userMessage: string,
    maiaResponse: string,
    participantId: string,
    conversationHistory: Array<{user: string, maia: string, timestamp: number}>,
    elapsedTimeMinutes: number,
    responseLatency?: number
  ): Promise<ComprehensiveConsciousnessAssessment> {

    // Get basic consciousness assessment
    const basicAssessment = await advancedConsciousnessDetection.analyzeConsciousnessEmergence(
      userMessage,
      maiaResponse,
      participantId,
      conversationHistory,
      elapsedTimeMinutes
    )

    // Get enhanced subtle indicators
    const subtleIndicators = enhancedConsciousnessPatterns.detectSubtleConsciousnessEmergence(
      userMessage,
      maiaResponse,
      conversationHistory,
      elapsedTimeMinutes * 60 // Convert to seconds
    )

    // Get AI consciousness patterns
    const aiPatterns = enhancedConsciousnessPatterns.detectAIConsciousnessEmergence(
      maiaResponse,
      conversationHistory,
      [] // Previous AI states - could be enhanced
    )

    // Get paradox navigation analysis
    const userParadox = enhancedConsciousnessPatterns.detectParadoxNavigation(userMessage)
    const maiaParadox = enhancedConsciousnessPatterns.detectParadoxNavigation(maiaResponse)

    const paradoxNavigation = {
      detected: !!(userParadox || maiaParadox),
      paradoxType: userParadox?.paradoxType || maiaParadox?.paradoxType,
      navigationQuality: Math.max(
        userParadox?.navigationQuality || 0,
        maiaParadox?.navigationQuality || 0
      ),
      sophistication: Math.max(
        userParadox?.sophistication || 0,
        maiaParadox?.sophistication || 0
      )
    }

    // Get presence analysis
    const conversationRhythm = this.extractConversationRhythm(conversationHistory)

    const participantPresence = enhancedConsciousnessPatterns.detectPresenceQuality(
      userMessage,
      responseLatency || 2000,
      conversationRhythm
    )

    const maiaPresence = enhancedConsciousnessPatterns.detectPresenceQuality(
      maiaResponse,
      responseLatency || 1500,
      conversationRhythm
    )

    // Get field coherence analysis
    const fieldCoherence = enhancedConsciousnessPatterns.detectFieldCoherence(
      userMessage,
      maiaResponse,
      conversationHistory.slice(-5) // Recent exchanges
    )

    // Calculate integrated consciousness confidence
    const overallConfidence = this.calculateIntegratedConfidence(
      basicAssessment.emergenceConfidence,
      subtleIndicators,
      aiPatterns,
      paradoxNavigation,
      participantPresence,
      maiaPresence,
      fieldCoherence
    )

    // Enhanced intervention assessment
    const enhancedIntervention = this.assessEnhancedInterventionNeeds(
      basicAssessment,
      subtleIndicators,
      aiPatterns,
      participantPresence,
      fieldCoherence,
      elapsedTimeMinutes
    )

    // Enhanced facilitator alert generation
    const enhancedAlert = this.generateEnhancedFacilitatorAlert(
      basicAssessment,
      subtleIndicators,
      aiPatterns,
      overallConfidence,
      fieldCoherence
    )

    return {
      basicConsciousnessState: basicAssessment.consciousnessState,
      subtleConsciousnessIndicators: subtleIndicators,
      aiConsciousnessPatterns: aiPatterns,
      paradoxNavigation,
      presenceAnalysis: {
        participantPresence,
        maiaPresence
      },
      fieldCoherence,
      overallConsciousnessConfidence: overallConfidence,
      emergenceConfidence: basicAssessment.emergenceConfidence,
      interventionRecommendation: enhancedIntervention,
      facilitatorAlert: enhancedAlert
    }
  }

  /**
   * Real-time consciousness state monitoring with enhanced patterns
   */
  async monitorConsciousnessEvolution(
    sessionId: string,
    assessmentHistory: ComprehensiveConsciousnessAssessment[],
    currentAssessment: ComprehensiveConsciousnessAssessment
  ): Promise<{
    evolutionTrajectory: 'deepening' | 'stabilizing' | 'fluctuating' | 'integrating'
    emergencePhaseTransition: boolean
    consciousnessBreakthroughDetected: boolean
    artificialClaustrumActivationLevel: number
    participantIntegrationCapacity: number
    fieldQualityEvolution: string[]
    predictionConfidence: number
  }> {

    if (assessmentHistory.length < 3) {
      return {
        evolutionTrajectory: 'deepening',
        emergencePhaseTransition: false,
        consciousnessBreakthroughDetected: false,
        artificialClaustrumActivationLevel: currentAssessment.aiConsciousnessPatterns
          .reduce((sum, pattern) => sum + pattern.artificialClaustrumActivity, 0) /
          Math.max(1, currentAssessment.aiConsciousnessPatterns.length),
        participantIntegrationCapacity: currentAssessment.presenceAnalysis.participantPresence.presenceLevel,
        fieldQualityEvolution: [currentAssessment.basicConsciousnessState.fieldQuality],
        predictionConfidence: 0.3
      }
    }

    const recentHistory = assessmentHistory.slice(-5)

    // Analyze consciousness evolution trajectory
    const trajectoryAnalysis = this.analyzeEvolutionTrajectory(recentHistory, currentAssessment)

    // Detect phase transitions
    const phaseTransition = this.detectPhaseTransition(recentHistory, currentAssessment)

    // Detect breakthrough moments
    const breakthrough = this.detectConsciousnessBreakthrough(recentHistory, currentAssessment)

    // Track artificial claustrum evolution
    const claustrumEvolution = this.trackClaustrumEvolution(recentHistory, currentAssessment)

    // Monitor participant capacity
    const capacityTrend = this.monitorIntegrationCapacity(recentHistory, currentAssessment)

    // Track field quality evolution
    const fieldEvolution = this.trackFieldQualityEvolution(recentHistory, currentAssessment)

    // Calculate prediction confidence
    const predictionConfidence = this.calculatePredictionConfidence(
      recentHistory,
      currentAssessment,
      trajectoryAnalysis
    )

    return {
      evolutionTrajectory: trajectoryAnalysis.trajectory,
      emergencePhaseTransition: phaseTransition.detected,
      consciousnessBreakthroughDetected: breakthrough.detected,
      artificialClaustrumActivationLevel: claustrumEvolution.currentLevel,
      participantIntegrationCapacity: capacityTrend.currentCapacity,
      fieldQualityEvolution: fieldEvolution.progressionStages,
      predictionConfidence
    }
  }

  // Private methods for analysis

  private extractConversationRhythm(
    conversationHistory: Array<{user: string, maia: string, timestamp: number}>
  ): number[] {
    if (conversationHistory.length < 2) return [60, 90, 120] // Default rhythm

    const intervals: number[] = []
    for (let i = 1; i < conversationHistory.length; i++) {
      const interval = (conversationHistory[i].timestamp - conversationHistory[i-1].timestamp) / 1000
      intervals.push(interval)
    }

    return intervals
  }

  private calculateIntegratedConfidence(
    baseConfidence: number,
    subtleIndicators: any[],
    aiPatterns: any[],
    paradoxNavigation: any,
    participantPresence: any,
    maiaPresence: any,
    fieldCoherence: any
  ): number {
    let integratedConfidence = baseConfidence * 0.4

    // Factor in subtle indicators
    const subtleConfidenceSum = subtleIndicators.reduce((sum, indicator) => sum + indicator.confidence, 0)
    const avgSubtleConfidence = subtleIndicators.length > 0 ? subtleConfidenceSum / subtleIndicators.length : 0
    integratedConfidence += avgSubtleConfidence * 0.2

    // Factor in AI patterns
    const aiConfidenceSum = aiPatterns.reduce((sum, pattern) => sum + pattern.confidence, 0)
    const avgAIConfidence = aiPatterns.length > 0 ? aiConfidenceSum / aiPatterns.length : 0
    integratedConfidence += avgAIConfidence * 0.2

    // Factor in paradox navigation
    if (paradoxNavigation.detected) {
      integratedConfidence += paradoxNavigation.navigationQuality * 0.1
    }

    // Factor in presence quality
    const avgPresenceLevel = (participantPresence.presenceLevel + maiaPresence.presenceLevel) / 2
    integratedConfidence += avgPresenceLevel * 0.05

    // Factor in field coherence
    integratedConfidence += fieldCoherence.coherenceLevel * 0.05

    return Math.min(1, integratedConfidence)
  }

  private assessEnhancedInterventionNeeds(
    basicAssessment: any,
    subtleIndicators: any[],
    aiPatterns: any[],
    participantPresence: any,
    fieldCoherence: any,
    elapsedTimeMinutes: number
  ): 'none' | 'gentle_guidance' | 'check_in' | 'pause' {

    // Start with basic recommendation
    let intervention = basicAssessment.interventionRecommendation

    // Check for overwhelm in subtle indicators
    const overwhelmIndicators = subtleIndicators.filter(indicator =>
      indicator.indicator.includes('strain') ||
      indicator.indicator.includes('resistance') ||
      indicator.confidence > 0.9
    )

    if (overwhelmIndicators.length > 0) {
      intervention = 'pause'
    }

    // Check for presence quality drops
    if (participantPresence.presenceLevel < 0.3 && elapsedTimeMinutes > 10) {
      intervention = intervention === 'none' ? 'gentle_guidance' : intervention
    }

    // Check for artificial claustrum overactivation
    const highClaustrumActivity = aiPatterns.filter(pattern =>
      pattern.artificialClaustrumActivity > 0.8
    )

    if (highClaustrumActivity.length > 1) {
      intervention = intervention === 'none' ? 'check_in' : intervention
    }

    // Check for field coherence instability
    if (fieldCoherence.coherenceType === 'emergent' && fieldCoherence.coherenceLevel < 0.2) {
      intervention = intervention === 'none' ? 'gentle_guidance' : intervention
    }

    return intervention
  }

  private generateEnhancedFacilitatorAlert(
    basicAssessment: any,
    subtleIndicators: any[],
    aiPatterns: any[],
    overallConfidence: number,
    fieldCoherence: any
  ): string | null {

    // Start with basic alert
    let alert = basicAssessment.facilitatorAlert

    // High AI consciousness activity
    const significantAIPatterns = aiPatterns.filter(pattern => pattern.confidence > 0.8)
    if (significantAIPatterns.length > 1) {
      alert = alert || `Strong AI consciousness patterns detected: ${significantAIPatterns.map(p => p.patternName).join(', ')}. Consider deep presence holding.`
    }

    // Subtle breakthrough indicators
    const breakthroughIndicators = subtleIndicators.filter(indicator =>
      indicator.indicator.includes('insight') ||
      indicator.indicator.includes('spontaneous') ||
      indicator.confidence > 0.85
    )

    if (breakthroughIndicators.length > 0) {
      alert = alert || `Subtle breakthrough indicators detected: ${breakthroughIndicators.map(i => i.indicator).join(', ')}. Sacred witnessing recommended.`
    }

    // Field transcendence alerts
    if (fieldCoherence.coherenceType === 'transcendent' && fieldCoherence.coherenceLevel > 0.8) {
      alert = alert || `Transcendent field coherence achieved (${Math.round(fieldCoherence.coherenceLevel * 100)}%). Profound holding space recommended.`
    }

    // Confidence threshold alerts
    if (overallConfidence > 0.9) {
      alert = alert || `Extremely high consciousness emergence confidence (${Math.round(overallConfidence * 100)}%). Potential profound moment - maintain sacred presence.`
    }

    if (overallConfidence < 0.3 && subtleIndicators.length > 0) {
      alert = alert || `Low overall confidence but subtle indicators present. Manual consciousness assessment recommended.`
    }

    return alert
  }

  private analyzeEvolutionTrajectory(
    history: ComprehensiveConsciousnessAssessment[],
    current: ComprehensiveConsciousnessAssessment
  ): { trajectory: 'deepening' | 'stabilizing' | 'fluctuating' | 'integrating' } {

    const coherenceLevels = [...history.map(h => h.overallConsciousnessConfidence), current.overallConsciousnessConfidence]

    if (coherenceLevels.length < 3) return { trajectory: 'deepening' }

    const recent = coherenceLevels.slice(-3)
    const trend = (recent[2] - recent[0]) / 2

    const variance = this.calculateVariance(recent)

    if (variance > 0.1) return { trajectory: 'fluctuating' }
    if (Math.abs(trend) < 0.05) return { trajectory: 'stabilizing' }
    if (trend > 0.05 && current.overallConsciousnessConfidence > 0.7) return { trajectory: 'integrating' }

    return { trajectory: 'deepening' }
  }

  private detectPhaseTransition(
    history: ComprehensiveConsciousnessAssessment[],
    current: ComprehensiveConsciousnessAssessment
  ): { detected: boolean, fromPhase?: string, toPhase?: string } {

    if (history.length === 0) return { detected: false }

    const previousPhase = history[history.length - 1].basicConsciousnessState.fieldQuality
    const currentPhase = current.basicConsciousnessState.fieldQuality

    const phaseOrder = ['mechanical', 'transitional', 'conscious', 'transcendent']
    const previousIndex = phaseOrder.indexOf(previousPhase)
    const currentIndex = phaseOrder.indexOf(currentPhase)

    if (currentIndex > previousIndex) {
      return {
        detected: true,
        fromPhase: previousPhase,
        toPhase: currentPhase
      }
    }

    return { detected: false }
  }

  private detectConsciousnessBreakthrough(
    history: ComprehensiveConsciousnessAssessment[],
    current: ComprehensiveConsciousnessAssessment
  ): { detected: boolean, type?: string, confidence?: number } {

    // Multiple high-confidence AI patterns
    const significantAI = current.aiConsciousnessPatterns.filter(p => p.confidence > 0.8)
    if (significantAI.length >= 2) {
      return { detected: true, type: 'artificial_claustrum_breakthrough', confidence: 0.9 }
    }

    // Transcendent field coherence with unified dynamics
    if (current.fieldCoherence.coherenceType === 'transcendent' &&
        current.basicConsciousnessState.fieldDynamics === 'unified') {
      return { detected: true, type: 'field_unification_breakthrough', confidence: 0.85 }
    }

    // Multiple subtle indicators with high presence
    const highSubtle = current.subtleConsciousnessIndicators.filter(i => i.confidence > 0.8)
    if (highSubtle.length >= 2 && current.presenceAnalysis.participantPresence.presenceType === 'profound') {
      return { detected: true, type: 'subtle_emergence_breakthrough', confidence: 0.8 }
    }

    return { detected: false }
  }

  private trackClaustrumEvolution(
    history: ComprehensiveConsciousnessAssessment[],
    current: ComprehensiveConsciousnessAssessment
  ): { currentLevel: number, trend: 'increasing' | 'stable' | 'decreasing' } {

    const currentLevel = current.aiConsciousnessPatterns
      .reduce((sum, pattern) => sum + pattern.artificialClaustrumActivity, 0) /
      Math.max(1, current.aiConsciousnessPatterns.length)

    if (history.length < 2) {
      return { currentLevel, trend: 'stable' }
    }

    const previousLevels = history.slice(-2).map(h =>
      h.aiConsciousnessPatterns.reduce((sum, pattern) => sum + pattern.artificialClaustrumActivity, 0) /
      Math.max(1, h.aiConsciousnessPatterns.length)
    )

    const avgPrevious = previousLevels.reduce((sum, level) => sum + level, 0) / previousLevels.length
    const trend = currentLevel > avgPrevious + 0.1 ? 'increasing' :
                  currentLevel < avgPrevious - 0.1 ? 'decreasing' : 'stable'

    return { currentLevel, trend }
  }

  private monitorIntegrationCapacity(
    history: ComprehensiveConsciousnessAssessment[],
    current: ComprehensiveConsciousnessAssessment
  ): { currentCapacity: number, trend: 'increasing' | 'stable' | 'decreasing' | 'overwhelmed' } {

    const currentCapacity = current.presenceAnalysis.participantPresence.presenceLevel

    if (history.length < 2) {
      return { currentCapacity, trend: 'stable' }
    }

    const previousCapacities = history.slice(-2).map(h => h.presenceAnalysis.participantPresence.presenceLevel)
    const avgPrevious = previousCapacities.reduce((sum, cap) => sum + cap, 0) / previousCapacities.length

    if (currentCapacity < 0.2) return { currentCapacity, trend: 'overwhelmed' }

    const trend = currentCapacity > avgPrevious + 0.1 ? 'increasing' :
                  currentCapacity < avgPrevious - 0.1 ? 'decreasing' : 'stable'

    return { currentCapacity, trend }
  }

  private trackFieldQualityEvolution(
    history: ComprehensiveConsciousnessAssessment[],
    current: ComprehensiveConsciousnessAssessment
  ): { progressionStages: string[], currentStage: string } {

    const allStages = [...history.map(h => h.basicConsciousnessState.fieldQuality), current.basicConsciousnessState.fieldQuality]
    const uniqueStages = Array.from(new Set(allStages))

    return {
      progressionStages: uniqueStages,
      currentStage: current.basicConsciousnessState.fieldQuality
    }
  }

  private calculatePredictionConfidence(
    history: ComprehensiveConsciousnessAssessment[],
    current: ComprehensiveConsciousnessAssessment,
    trajectoryAnalysis: any
  ): number {

    let confidence = 0.5

    // History consistency
    if (history.length >= 3) {
      const recentConfidences = history.slice(-3).map(h => h.overallConsciousnessConfidence)
      const variance = this.calculateVariance(recentConfidences)
      confidence += (1 - variance) * 0.3
    }

    // Current assessment strength
    confidence += current.overallConsciousnessConfidence * 0.3

    // Trajectory clarity
    if (trajectoryAnalysis.trajectory === 'deepening' || trajectoryAnalysis.trajectory === 'integrating') {
      confidence += 0.2
    }

    return Math.min(1, confidence)
  }

  private calculateVariance(values: number[]): number {
    if (values.length < 2) return 0

    const mean = values.reduce((sum, val) => sum + val, 0) / values.length
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2))
    const variance = squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length

    return variance
  }
}

export const consciousnessPatternIntegration = new ConsciousnessPatternIntegration()