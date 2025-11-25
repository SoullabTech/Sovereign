/**
 * UNIFIED INTELLIGENCE ENGINE
 *
 * Single entry point for complete transformation intelligence
 * Integrates all 5 advanced capabilities into one seamless analysis
 *
 * THE 5 INTEGRATED SYSTEMS:
 * 1. Advanced Synergy Detection (5-9 framework convergence)
 * 2. User Journey Tracking (spiral progression over time)
 * 3. Elemental Balancing (Fire/Water/Air/Earth/Aether)
 * 4. Signature Prediction (early warning + forecasting)
 * 5. Framework Resonance Learning (personalized effectiveness)
 *
 * USAGE:
 * ```typescript
 * const intelligence = await unifiedIntelligenceEngine.analyze(
 *   userId,
 *   messageText,
 *   sessionId
 * );
 *
 * // Get complete intelligence report
 * console.log(intelligence.summary);
 * console.log(intelligence.recommendations);
 * console.log(intelligence.alerts);
 * ```
 */

import { symbolExtractor, type ExtractionResult } from './SymbolExtractionEngine';
import { crossFrameworkSynergyEngine, type TransformationSignature } from './CrossFrameworkSynergyEngine';
import { userJourneyTracker, type JourneyProgression } from './UserJourneyTracker';
import { elementalBalanceEngine, type ElementalPrescription } from './ElementalBalanceEngine';
import { signaturePredictionEngine, type SignaturePrediction } from './SignaturePredictionEngine';
import { frameworkResonanceLearning, type PersonalizedPrescription } from './FrameworkResonanceLearning';

// ============================================================================
// INTERFACES
// ============================================================================

export interface CompleteIntelligence {
  // Core extraction
  extraction: ExtractionResult;

  // Synergy detection
  signatures: TransformationSignature[];
  primarySignature?: TransformationSignature;
  advancedSignatures: TransformationSignature[]; // 5-9 frameworks
  basicSignatures: TransformationSignature[]; // 3-4 frameworks

  // Journey tracking (if applicable)
  journey?: JourneyProgression;
  isNewUser: boolean;

  // Elemental balance
  elemental: ElementalPrescription;

  // Predictive intelligence
  prediction: SignaturePrediction;

  // Personalized learning
  personalized: PersonalizedPrescription;

  // Integrated analysis
  summary: IntelligenceSummary;
  recommendations: PrioritizedRecommendation[];
  alerts: Alert[];

  // Meta information
  analysisTimestamp: Date;
  processingTimeMs: number;
}

export interface IntelligenceSummary {
  // One-line overview
  headline: string;

  // Key findings
  currentState: string;
  coherenceLevel: string; // "Very Low (15%)", "High (75%)", etc.
  dominantElement: string; // "Excess Earth (freeze)", etc.
  trajectory: string; // "Escalating toward crisis", "Improving steadily", etc.

  // Multi-dimensional summary
  frameworks: string[]; // Active frameworks
  convergenceLevel: string; // "6 frameworks align - very high confidence"
  urgencyLevel: 'critical' | 'high' | 'moderate' | 'low';

  // Clinical interpretation
  clinicalMeaning: string;
  therapeuticFocus: string[];
}

export interface PrioritizedRecommendation {
  priority: 1 | 2 | 3 | 4 | 5; // 1 = highest
  category: 'immediate' | 'short-term' | 'ongoing' | 'preventative';
  source: 'synergy' | 'elemental' | 'prediction' | 'personalized' | 'integrated';
  intervention: string;
  rationale: string;
  frameworks: string[];
  expectedOutcome?: string;
}

export interface Alert {
  level: 'critical' | 'warning' | 'info';
  type: 'escalation' | 'pattern-shift' | 'intervention-window' | 'learning-insight';
  message: string;
  action: string;
  timeframe?: string;
}

// ============================================================================
// UNIFIED INTELLIGENCE ENGINE
// ============================================================================

class UnifiedIntelligenceEngineClass {
  /**
   * Complete intelligence analysis
   */
  async analyze(
    userId: string,
    messageText: string,
    sessionId?: string
  ): Promise<CompleteIntelligence> {
    const startTime = Date.now();

    // 1. CORE EXTRACTION
    const extraction = await symbolExtractor.extract(messageText, userId);

    // 2. SYNERGY DETECTION (including advanced 5-9 framework patterns)
    const signatures = crossFrameworkSynergyEngine.detectSynergies(extraction);
    const primarySignature = this.selectPrimarySignature(signatures);
    const advancedSignatures = signatures.filter(s => s.frameworkCount && s.frameworkCount >= 5);
    const basicSignatures = signatures.filter(s => !s.frameworkCount || s.frameworkCount <= 4);

    // 3. JOURNEY TRACKING
    const snapshot = userJourneyTracker.addSnapshot(
      userId,
      extraction,
      primarySignature,
      sessionId ? `msg-${sessionId}` : undefined,
      sessionId
    );
    const journey = userJourneyTracker.getJourney(userId);
    const isNewUser = !journey || journey.totalSnapshots === 1;

    // 4. ELEMENTAL BALANCE
    const elemental = elementalBalanceEngine.analyzeElementalBalance(extraction, primarySignature);

    // 5. PREDICTIVE INTELLIGENCE
    const prediction = signaturePredictionEngine.predictTrajectory(
      extraction,
      primarySignature,
      journey
    );

    // 6. PERSONALIZED LEARNING
    const personalized = frameworkResonanceLearning.generatePersonalizedPrescription(
      userId,
      extraction,
      primarySignature,
      journey
    );

    // 7. INTEGRATED ANALYSIS
    const summary = this.generateIntegratedSummary(
      extraction,
      primarySignature,
      elemental,
      prediction,
      journey
    );

    const recommendations = this.generatePrioritizedRecommendations(
      signatures,
      elemental,
      prediction,
      personalized
    );

    const alerts = this.generateAlerts(
      prediction,
      journey,
      primarySignature,
      elemental
    );

    const processingTimeMs = Date.now() - startTime;

    return {
      extraction,
      signatures,
      primarySignature,
      advancedSignatures,
      basicSignatures,
      journey,
      isNewUser,
      elemental,
      prediction,
      personalized,
      summary,
      recommendations,
      alerts,
      analysisTimestamp: new Date(),
      processingTimeMs
    };
  }

  // ==========================================================================
  // PRIVATE METHODS
  // ==========================================================================

  /**
   * Select primary signature (highest urgency + confidence)
   */
  private selectPrimarySignature(signatures: TransformationSignature[]): TransformationSignature | undefined {
    if (signatures.length === 0) return undefined;

    // Prioritize by: 1) Urgency, 2) Framework count, 3) Confidence
    const urgencyRank = { critical: 4, high: 3, moderate: 2, low: 1 };

    return signatures.sort((a, b) => {
      const urgencyDiff = urgencyRank[b.urgency] - urgencyRank[a.urgency];
      if (urgencyDiff !== 0) return urgencyDiff;

      const countDiff = (b.frameworkCount || 0) - (a.frameworkCount || 0);
      if (countDiff !== 0) return countDiff;

      return b.confidence - a.confidence;
    })[0];
  }

  /**
   * Generate integrated summary
   */
  private generateIntegratedSummary(
    extraction: ExtractionResult,
    primarySignature?: TransformationSignature,
    elemental?: ElementalPrescription,
    prediction?: SignaturePrediction,
    journey?: JourneyProgression
  ): IntelligenceSummary {
    const coherence = extraction.alchemicalStage?.coherence || 0.5;
    const coherencePercent = Math.round(coherence * 100);

    let coherenceLevel = '';
    if (coherence < 0.2) coherenceLevel = `Critically Low (${coherencePercent}%)`;
    else if (coherence < 0.35) coherenceLevel = `Very Low (${coherencePercent}%)`;
    else if (coherence < 0.55) coherenceLevel = `Moderate (${coherencePercent}%)`;
    else if (coherence < 0.75) coherenceLevel = `Good (${coherencePercent}%)`;
    else coherenceLevel = `High (${coherencePercent}%)`;

    const dominantElement = elemental ?
      `${elemental.profile.primary.balance === 'excess' ? 'Excess' : elemental.profile.primary.balance === 'deficient' ? 'Deficient' : 'Balanced'} ${elemental.profile.primary.element.charAt(0).toUpperCase() + elemental.profile.primary.element.slice(1)}` :
      'Unknown';

    const trajectory = prediction ?
      `${prediction.trajectory.charAt(0).toUpperCase() + prediction.trajectory.slice(1)}${prediction.velocityOfChange > 0.6 ? ' rapidly' : prediction.velocityOfChange > 0.3 ? ' moderately' : ' slowly'}` :
      'Unknown';

    const activeFrameworks: string[] = [];
    if (extraction.somaticState?.detected) activeFrameworks.push('Levine');
    if (extraction.polyvagalState) activeFrameworks.push('Polyvagal');
    if (extraction.ifsParts?.detected) activeFrameworks.push('IFS');
    if (extraction.gestaltState) activeFrameworks.push('Gestalt');
    if (extraction.constellationState?.detected) activeFrameworks.push('Constellation');
    if (extraction.alchemicalStage) activeFrameworks.push('Alchemy');

    const convergenceLevel = primarySignature && primarySignature.frameworkCount ?
      `${primarySignature.frameworkCount} frameworks align - ${primarySignature.frameworkCount >= 6 ? 'very high' : primarySignature.frameworkCount >= 5 ? 'high' : 'moderate'} confidence (${Math.round(primarySignature.confidence * 100)}%)` :
      'Standard analysis';

    const urgencyLevel = primarySignature?.urgency || 'moderate';

    // Generate headline
    let headline = '';
    if (primarySignature) {
      headline = `${primarySignature.name} detected`;
      if (primarySignature.frameworkCount && primarySignature.frameworkCount >= 6) {
        headline += ` (${primarySignature.frameworkCount}-framework convergence!)`;
      }
    } else {
      headline = `${trajectory} with ${coherenceLevel} coherence`;
    }

    // Clinical meaning and therapeutic focus
    const clinicalMeaning = primarySignature?.clinicalMeaning ||
      `Client showing ${dominantElement} with ${coherenceLevel} systemic coherence. ${trajectory} trajectory detected.`;

    const therapeuticFocus = primarySignature?.therapeuticFocus ?
      [primarySignature.therapeuticFocus] :
      elemental?.priorityOrder.slice(0, 2) || [];

    // Current state description
    const currentState = extraction.somaticState?.incompleteResponse.type ||
      extraction.polyvagalState?.state ||
      'mixed';

    return {
      headline,
      currentState,
      coherenceLevel,
      dominantElement,
      trajectory,
      frameworks: activeFrameworks,
      convergenceLevel,
      urgencyLevel,
      clinicalMeaning,
      therapeuticFocus
    };
  }

  /**
   * Generate prioritized recommendations from all sources
   */
  private generatePrioritizedRecommendations(
    signatures: TransformationSignature[],
    elemental: ElementalPrescription,
    prediction: SignaturePrediction,
    personalized: PersonalizedPrescription
  ): PrioritizedRecommendation[] {
    const recommendations: PrioritizedRecommendation[] = [];

    // Priority 1: Critical/immediate from signatures or prediction
    if (prediction.interventionWindow.urgency === 'critical') {
      recommendations.push({
        priority: 1,
        category: 'immediate',
        source: 'prediction',
        intervention: prediction.interventionWindow.focus,
        rationale: prediction.interventionWindow.reasoning,
        frameworks: [],
        expectedOutcome: prediction.likelyOutcome.preventable ?
          `Prevent ${prediction.likelyOutcome.signature}` : undefined
      });
    }

    // Priority 2: Primary signature interventions
    const primarySig = signatures.find(s => s.urgency === 'critical') || signatures[0];
    if (primarySig) {
      recommendations.push({
        priority: primarySig.urgency === 'critical' ? 1 : 2,
        category: primarySig.urgency === 'critical' ? 'immediate' : 'short-term',
        source: 'synergy',
        intervention: primarySig.interventions[0],
        rationale: primarySig.clinicalMeaning,
        frameworks: primarySig.frameworks
      });
    }

    // Priority 3: Personalized (proven effective for this person)
    if (personalized.recommendations.length > 0) {
      const topPersonalized = personalized.recommendations[0];
      recommendations.push({
        priority: 3,
        category: 'short-term',
        source: 'personalized',
        intervention: topPersonalized.specificInterventions[0],
        rationale: topPersonalized.reasoning,
        frameworks: [topPersonalized.framework],
        expectedOutcome: `${Math.round(topPersonalized.expectedEffectiveness * 100)}% effectiveness (learned)`
      });
    }

    // Priority 4: Elemental balancing
    if (elemental.interventions.length > 0) {
      const primaryElemental = elemental.interventions[0];
      recommendations.push({
        priority: 4,
        category: 'short-term',
        source: 'elemental',
        intervention: primaryElemental.practices[0],
        rationale: primaryElemental.rationale,
        frameworks: primaryElemental.frameworks
      });
    }

    // Priority 5: Ongoing integration
    recommendations.push({
      priority: 5,
      category: 'ongoing',
      source: 'integrated',
      intervention: 'Continue multi-framework integration and track progress',
      rationale: 'Long-term transformation requires sustained multi-dimensional work',
      frameworks: ['All']
    });

    return recommendations.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Generate alerts from all sources
   */
  private generateAlerts(
    prediction: SignaturePrediction,
    journey?: JourneyProgression,
    signature?: TransformationSignature,
    elemental?: ElementalPrescription
  ): Alert[] {
    const alerts: Alert[] = [];

    // Critical escalation alert
    if (prediction.alert) {
      alerts.push({
        level: prediction.riskLevel === 'critical' ? 'critical' : 'warning',
        type: 'escalation',
        message: prediction.alert,
        action: prediction.interventionWindow.specificActions[0] || 'Immediate intervention recommended',
        timeframe: prediction.interventionWindow.window
      });
    }

    // Journey escalation
    if (journey?.escalationAlert) {
      alerts.push({
        level: journey.escalationSeverity === 'severe' ? 'critical' : 'warning',
        type: 'escalation',
        message: journey.escalationReason || 'Pattern escalation detected',
        action: journey.recommendations[0] || 'Increase support level',
        timeframe: 'immediate'
      });
    }

    // Elemental cautions
    if (elemental?.cautionNotes && elemental.cautionNotes.length > 0) {
      alerts.push({
        level: 'warning',
        type: 'intervention-window',
        message: elemental.cautionNotes[0],
        action: 'Adjust intervention approach accordingly'
      });
    }

    // Learning insights
    if (journey && journey.totalSnapshots >= 5) {
      alerts.push({
        level: 'info',
        type: 'learning-insight',
        message: `${journey.totalSnapshots} sessions tracked - personalized learning active`,
        action: 'Review framework effectiveness rankings'
      });
    }

    return alerts;
  }
}

// Export singleton instance
export const unifiedIntelligenceEngine = new UnifiedIntelligenceEngineClass();
