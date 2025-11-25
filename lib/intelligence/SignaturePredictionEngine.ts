/**
 * TRANSFORMATION SIGNATURE PREDICTION ENGINE
 *
 * Predicts where client is heading BEFORE patterns fully manifest
 * Early detection → Preventative care → Better outcomes
 *
 * CAPABILITIES:
 * 1. Trajectory Detection: Based on current state + history, where are they going?
 * 2. Early Warning Signs: Detect subtle shifts that precede major changes
 * 3. Intervention Windows: When is the best time to intervene?
 * 4. Pattern Completion: If trajectory continues, what's the likely outcome?
 * 5. Risk Scoring: Escalation vs improvement probability
 *
 * PREDICTION PRINCIPLES:
 * - Coherence trajectory (descending → likely collapse)
 * - State progression (hyperarousal → freeze → dissociation)
 * - Framework shifts (managers exhausted → firefighters → exiles)
 * - Velocity of change (rapid drop = imminent crisis)
 * - Historical patterns (does this match known trajectories?)
 *
 * CLINICAL VALUE:
 * - Catch problems before they become crises
 * - Optimize intervention timing
 * - Track if healing is sustainable or fragile
 * - Alert when patterns indicate regression
 * - Validate progress is genuine vs temporary
 */

import type { ExtractionResult } from './SymbolExtractionEngine';
import type { TransformationSignature } from './CrossFrameworkSynergyEngine';
import type { JourneyProgression } from './UserJourneyTracker';

// ============================================================================
// INTERFACES
// ============================================================================

export type PredictionConfidence = 'very-high' | 'high' | 'moderate' | 'low';
export type TrajectoryDirection = 'escalating' | 'improving' | 'stable' | 'oscillating' | 'unknown';
export type InterventionWindow = 'immediate' | 'soon' | 'moderate' | 'not-urgent';

export interface EarlyWarningSign {
  indicator: string;
  significance: 'critical' | 'important' | 'notable';
  description: string;
  frameworks: string[];
}

export interface PredictedOutcome {
  signature: string; // What signature will likely manifest
  timeframe: '1-2 sessions' | '3-5 sessions' | '6+ sessions' | 'imminent';
  probability: number; // 0-1
  confidence: PredictionConfidence;
  rationale: string;
  preventable: boolean; // Can intervention change this outcome?
}

export interface InterventionRecommendation {
  window: InterventionWindow;
  urgency: 'critical' | 'high' | 'moderate' | 'low';
  focus: string;
  reasoning: string;
  specificActions: string[];
}

export interface SignaturePrediction {
  detected: boolean;

  // Current trajectory
  trajectory: TrajectoryDirection;
  velocityOfChange: number; // How fast things are changing (0-1)
  momentum: 'accelerating' | 'steady' | 'decelerating';

  // Early warning signs
  earlyWarnings: EarlyWarningSign[];
  riskLevel: 'critical' | 'high' | 'moderate' | 'low';

  // Predicted outcomes
  likelyOutcome: PredictedOutcome;
  alternativeOutcomes: PredictedOutcome[];

  // Intervention guidance
  interventionWindow: InterventionRecommendation;

  // Pattern analysis
  patternCompletion: number; // 0-1, how far into a known pattern
  patternType?: string; // e.g., "descending-spiral", "breakthrough", "regression"

  // Summary
  summary: string;
  alert?: string; // Critical alerts
}

// ============================================================================
// PREDICTION ENGINE
// ============================================================================

class SignaturePredictionEngineClass {
  /**
   * Predict transformation trajectory
   */
  predictTrajectory(
    currentExtraction: ExtractionResult,
    currentSignature?: TransformationSignature,
    journey?: JourneyProgression
  ): SignaturePrediction {
    // Determine trajectory direction
    const trajectory = this.determineTrajectory(currentExtraction, journey);

    // Calculate velocity of change
    const velocityOfChange = this.calculateVelocity(currentExtraction, journey);

    // Determine momentum
    const momentum = this.determineMomentum(journey, velocityOfChange);

    // Detect early warning signs
    const earlyWarnings = this.detectEarlyWarnings(currentExtraction, journey);

    // Calculate risk level
    const riskLevel = this.calculateRiskLevel(trajectory, earlyWarnings, velocityOfChange);

    // Predict likely outcome
    const likelyOutcome = this.predictLikelyOutcome(
      currentExtraction,
      currentSignature,
      trajectory,
      journey
    );

    // Generate alternative outcomes
    const alternativeOutcomes = this.generateAlternativeOutcomes(
      currentExtraction,
      trajectory,
      likelyOutcome
    );

    // Determine intervention window
    const interventionWindow = this.determineInterventionWindow(
      riskLevel,
      trajectory,
      velocityOfChange,
      likelyOutcome
    );

    // Analyze pattern completion
    const patternAnalysis = this.analyzePatternCompletion(currentExtraction, journey);

    // Generate summary
    const summary = this.generatePredictionSummary({
      trajectory,
      velocityOfChange,
      riskLevel,
      likelyOutcome,
      earlyWarnings
    });

    // Generate alert if needed
    const alert = this.generateAlert(riskLevel, likelyOutcome, interventionWindow);

    return {
      detected: true,
      trajectory,
      velocityOfChange,
      momentum,
      earlyWarnings,
      riskLevel,
      likelyOutcome,
      alternativeOutcomes,
      interventionWindow,
      patternCompletion: patternAnalysis.completion,
      patternType: patternAnalysis.type,
      summary,
      alert
    };
  }

  // ==========================================================================
  // TRAJECTORY ANALYSIS
  // ==========================================================================

  /**
   * Determine trajectory direction
   */
  private determineTrajectory(
    extraction: ExtractionResult,
    journey?: JourneyProgression
  ): TrajectoryDirection {
    if (!journey || journey.totalSnapshots < 2) {
      // Not enough history - analyze current state only
      const coherence = extraction.alchemicalStage?.coherence || 0.5;
      const hasFreeze = extraction.somaticState?.incompleteResponse.type === 'freeze';
      const hasDorsal = extraction.polyvagalState?.state === 'dorsal';

      if ((hasFreeze || hasDorsal) && coherence < 0.25) return 'escalating';
      if (coherence > 0.7) return 'improving';
      return 'unknown';
    }

    // Use journey data
    if (journey.coherenceTrend === 'descending') return 'escalating';
    if (journey.coherenceTrend === 'ascending') return 'improving';
    if (journey.coherenceTrend === 'oscillating') return 'oscillating';
    return 'stable';
  }

  /**
   * Calculate velocity of change (how fast things are moving)
   */
  private calculateVelocity(
    extraction: ExtractionResult,
    journey?: JourneyProgression
  ): number {
    if (!journey || journey.totalSnapshots < 2) return 0.3; // Default moderate

    // Look at recent coherence changes
    const recentHistory = journey.coherenceHistory.slice(-3);
    if (recentHistory.length < 2) return 0.3;

    const changes = [];
    for (let i = 1; i < recentHistory.length; i++) {
      changes.push(Math.abs(recentHistory[i] - recentHistory[i - 1]));
    }

    const avgChange = changes.reduce((sum, c) => sum + c, 0) / changes.length;

    // Scale: 0-0.1 = slow, 0.1-0.2 = moderate, 0.2+ = fast
    return Math.min(avgChange * 5, 1.0);
  }

  /**
   * Determine momentum (accelerating/steady/decelerating)
   */
  private determineMomentum(
    journey?: JourneyProgression,
    velocity?: number
  ): 'accelerating' | 'steady' | 'decelerating' {
    if (!journey || journey.totalSnapshots < 3) return 'steady';

    const history = journey.coherenceHistory;
    const last3 = history.slice(-3);

    if (last3.length < 3) return 'steady';

    const change1 = Math.abs(last3[1] - last3[0]);
    const change2 = Math.abs(last3[2] - last3[1]);

    if (change2 > change1 * 1.3) return 'accelerating';
    if (change2 < change1 * 0.7) return 'decelerating';
    return 'steady';
  }

  // ==========================================================================
  // EARLY WARNING DETECTION
  // ==========================================================================

  /**
   * Detect early warning signs
   */
  private detectEarlyWarnings(
    extraction: ExtractionResult,
    journey?: JourneyProgression
  ): EarlyWarningSign[] {
    const warnings: EarlyWarningSign[] = [];

    // Warning: Coherence dropping
    if (journey && journey.coherenceTrend === 'descending') {
      warnings.push({
        indicator: 'Descending coherence trend',
        significance: journey.coherenceChange < -0.15 ? 'critical' : 'important',
        description: `Coherence has dropped ${(Math.abs(journey.coherenceChange) * 100).toFixed(0)}% across recent sessions`,
        frameworks: ['Alchemy', 'Spiralogic']
      });
    }

    // Warning: Manager exhaustion
    const hasExhaustedManagers = extraction.ifsParts?.parts.some(
      p => p.type === 'manager' && p.indicator.includes('exhausted')
    );
    if (hasExhaustedManagers) {
      warnings.push({
        indicator: 'Manager exhaustion detected',
        significance: 'important',
        description: 'Protective managers are exhausted. Risk of firefighters taking over or system collapse.',
        frameworks: ['IFS']
      });
    }

    // Warning: Freeze with low coherence
    const hasFreeze = extraction.somaticState?.incompleteResponse.type === 'freeze';
    const coherence = extraction.alchemicalStage?.coherence || 0.5;
    if (hasFreeze && coherence < 0.3) {
      warnings.push({
        indicator: 'Freeze state with low coherence',
        significance: 'critical',
        description: 'Body in freeze with low systemic coherence. High risk of dorsal collapse.',
        frameworks: ['Levine', 'Polyvagal', 'Alchemy']
      });
    }

    // Warning: Dissociation indicators
    const hasDissociation = extraction.somaticState?.incompleteResponse.indicators?.some(
      ind => ind.includes('dissociat')
    );
    if (hasDissociation) {
      warnings.push({
        indicator: 'Dissociation present',
        significance: 'critical',
        description: 'Client showing dissociative symptoms. Connection to body/present being lost.',
        frameworks: ['Levine', 'Polyvagal']
      });
    }

    // Warning: State volatility
    if (journey && journey.stateChanges / journey.totalSnapshots > 0.6) {
      warnings.push({
        indicator: 'High state volatility',
        significance: 'important',
        description: `Dominant state changed ${journey.stateChanges} times across ${journey.totalSnapshots} sessions. System unstable.`,
        frameworks: ['Spiralogic']
      });
    }

    // Warning: Systemic entanglement + freeze
    if (extraction.constellationState?.systemicEntanglement.detected && hasFreeze) {
      warnings.push({
        indicator: 'Systemic burden with freeze',
        significance: 'important',
        description: 'Carrying family system burden while in freeze. Double immobilization.',
        frameworks: ['Family Constellation', 'Levine']
      });
    }

    // Warning: Firefighters active with exiles
    const hasFirefighters = extraction.ifsParts?.parts.some(p => p.type === 'firefighter');
    const hasExiles = extraction.ifsParts?.parts.some(p => p.type === 'exile');
    if (hasFirefighters && hasExiles) {
      warnings.push({
        indicator: 'Firefighters protecting exiles',
        significance: 'notable',
        description: 'System in protection mode. Firefighters blocking access to wounded parts.',
        frameworks: ['IFS']
      });
    }

    return warnings;
  }

  /**
   * Calculate overall risk level
   */
  private calculateRiskLevel(
    trajectory: TrajectoryDirection,
    warnings: EarlyWarningSign[],
    velocity: number
  ): 'critical' | 'high' | 'moderate' | 'low' {
    const criticalWarnings = warnings.filter(w => w.significance === 'critical').length;
    const importantWarnings = warnings.filter(w => w.significance === 'important').length;

    if (criticalWarnings >= 2 || (criticalWarnings >= 1 && velocity > 0.6)) return 'critical';
    if (criticalWarnings >= 1 || importantWarnings >= 2) return 'high';
    if (trajectory === 'escalating' || importantWarnings >= 1) return 'moderate';
    return 'low';
  }

  // ==========================================================================
  // OUTCOME PREDICTION
  // ==========================================================================

  /**
   * Predict likely outcome if trajectory continues
   */
  private predictLikelyOutcome(
    extraction: ExtractionResult,
    signature?: TransformationSignature,
    trajectory?: TrajectoryDirection,
    journey?: JourneyProgression
  ): PredictedOutcome {
    const coherence = extraction.alchemicalStage?.coherence || 0.5;
    const hasFreeze = extraction.somaticState?.incompleteResponse.type === 'freeze';
    const hasDorsal = extraction.polyvagalState?.state === 'dorsal';
    const hasDissociation = extraction.somaticState?.incompleteResponse.indicators?.some(
      ind => ind.includes('dissociat')
    );

    // Pattern: Escalating toward collapse
    if (trajectory === 'escalating') {
      if (hasDissociation || (hasDorsal && coherence < 0.2)) {
        return {
          signature: 'Complete Dorsal Collapse',
          timeframe: 'imminent',
          probability: 0.85,
          confidence: 'very-high',
          rationale: 'Already showing dissociation and dorsal shutdown with very low coherence. Pattern indicates imminent collapse without intervention.',
          preventable: true
        };
      }

      if (hasFreeze && coherence < 0.3) {
        return {
          signature: 'Systemic Shutdown',
          timeframe: '1-2 sessions',
          probability: 0.75,
          confidence: 'high',
          rationale: 'Freeze state with descending coherence. If trajectory continues, likely progression to full dorsal collapse.',
          preventable: true
        };
      }

      return {
        signature: 'Crisis State',
        timeframe: '3-5 sessions',
        probability: 0.65,
        confidence: 'moderate',
        rationale: 'Descending trajectory detected. Without intervention, likely escalation to crisis.',
        preventable: true
      };
    }

    // Pattern: Improving toward integration
    if (trajectory === 'improving') {
      if (coherence > 0.7) {
        return {
          signature: 'Integration & Emergence',
          timeframe: '3-5 sessions',
          probability: 0.70,
          confidence: 'high',
          rationale: 'Ascending trajectory with high coherence. Pattern indicates movement toward integration.',
          preventable: false
        };
      }

      return {
        signature: 'Stabilization',
        timeframe: '3-5 sessions',
        probability: 0.65,
        confidence: 'moderate',
        rationale: 'Improving trajectory. Likely continued stabilization if progress maintained.',
        preventable: false
      };
    }

    // Pattern: Oscillating (unstable)
    if (trajectory === 'oscillating') {
      return {
        signature: 'Continued Instability',
        timeframe: '3-5 sessions',
        probability: 0.70,
        confidence: 'moderate',
        rationale: 'High volatility in states. Pattern suggests continued oscillation without stabilizing intervention.',
        preventable: true
      };
    }

    // Pattern: Stable
    return {
      signature: 'Maintained Baseline',
      timeframe: '6+ sessions',
      probability: 0.60,
      confidence: 'moderate',
      rationale: 'Stable pattern. Likely to maintain current state unless new stressor introduced.',
      preventable: false
    };
  }

  /**
   * Generate alternative possible outcomes
   */
  private generateAlternativeOutcomes(
    extraction: ExtractionResult,
    trajectory: TrajectoryDirection,
    likelyOutcome: PredictedOutcome
  ): PredictedOutcome[] {
    const alternatives: PredictedOutcome[] = [];

    // If escalating, show intervention outcome
    if (trajectory === 'escalating' && likelyOutcome.preventable) {
      alternatives.push({
        signature: 'Stabilized with Intervention',
        timeframe: '1-2 sessions',
        probability: 0.70,
        confidence: 'high',
        rationale: 'With immediate nervous system regulation and co-regulation, trajectory can be reversed.',
        preventable: false
      });
    }

    // If improving, show potential regression
    if (trajectory === 'improving') {
      alternatives.push({
        signature: 'Regression if Pushed Too Fast',
        timeframe: '1-2 sessions',
        probability: 0.40,
        confidence: 'moderate',
        rationale: 'If therapeutic pace is too fast or new trauma triggered, risk of regression.',
        preventable: true
      });
    }

    // If stable, show breakthrough potential
    if (trajectory === 'stable') {
      alternatives.push({
        signature: 'Breakthrough with Deepening Work',
        timeframe: '3-5 sessions',
        probability: 0.50,
        confidence: 'moderate',
        rationale: 'Stability provides window for deeper integration work. Potential breakthrough if client ready.',
        preventable: false
      });
    }

    return alternatives;
  }

  // ==========================================================================
  // INTERVENTION GUIDANCE
  // ==========================================================================

  /**
   * Determine intervention window
   */
  private determineInterventionWindow(
    riskLevel: 'critical' | 'high' | 'moderate' | 'low',
    trajectory: TrajectoryDirection,
    velocity: number,
    outcome: PredictedOutcome
  ): InterventionRecommendation {
    // Critical risk
    if (riskLevel === 'critical') {
      return {
        window: 'immediate',
        urgency: 'critical',
        focus: 'Safety and nervous system stabilization',
        reasoning: 'Critical risk detected. Immediate intervention required to prevent collapse.',
        specificActions: [
          'Co-regulation and safety establishment',
          'Slow down therapeutic pace',
          'Orient to present moment and resources',
          'Consider increasing session frequency',
          'Assess need for additional support'
        ]
      };
    }

    // High risk
    if (riskLevel === 'high' || (trajectory === 'escalating' && velocity > 0.5)) {
      return {
        window: 'soon',
        urgency: 'high',
        focus: 'Stabilization and pattern interruption',
        reasoning: 'High risk with escalating trajectory. Intervention needed soon to prevent crisis.',
        specificActions: [
          'Address nervous system dysregulation',
          'Work with protective parts (IFS)',
          'Titrate exposure to difficult material',
          'Strengthen resources and supports'
        ]
      };
    }

    // Moderate risk
    if (riskLevel === 'moderate') {
      return {
        window: 'moderate',
        urgency: 'moderate',
        focus: 'Pattern awareness and skill building',
        reasoning: 'Moderate risk. Window for preventative work before escalation.',
        specificActions: [
          'Increase client awareness of patterns',
          'Build regulation skills',
          'Address underlying dynamics',
          'Monitor closely for changes'
        ]
      };
    }

    // Low risk
    return {
      window: 'not-urgent',
      urgency: 'low',
      focus: 'Deepening and integration',
      reasoning: 'Low risk. Opportunity for deeper therapeutic work.',
      specificActions: [
        'Continue current approach',
        'Consider deepening work if client ready',
        'Explore integration opportunities',
        'Maintain therapeutic momentum'
      ]
    };
  }

  // ==========================================================================
  // PATTERN ANALYSIS
  // ==========================================================================

  /**
   * Analyze pattern completion (how far into a known pattern)
   */
  private analyzePatternCompletion(
    extraction: ExtractionResult,
    journey?: JourneyProgression
  ): { completion: number; type?: string } {
    // Known pattern: Descending spiral (hyperarousal → freeze → dissociation)
    if (journey && journey.coherenceTrend === 'descending') {
      const statePath = journey.statePath || [];
      const hasHyperarousal = statePath.some(s => s.includes('hyperarousal'));
      const hasFreeze = statePath.some(s => s.includes('freeze'));
      const hasDissociation = statePath.some(s => s.includes('dissociation'));

      if (hasDissociation) {
        return { completion: 0.9, type: 'descending-spiral' };
      }
      if (hasFreeze) {
        return { completion: 0.6, type: 'descending-spiral' };
      }
      if (hasHyperarousal) {
        return { completion: 0.3, type: 'descending-spiral' };
      }
    }

    // Known pattern: Breakthrough (stable → ventral → integration)
    if (journey && journey.coherenceTrend === 'ascending') {
      const coherence = extraction.alchemicalStage?.coherence || 0.5;
      if (coherence > 0.8) {
        return { completion: 0.8, type: 'breakthrough' };
      }
      if (coherence > 0.6) {
        return { completion: 0.5, type: 'breakthrough' };
      }
      return { completion: 0.2, type: 'breakthrough' };
    }

    return { completion: 0.0 };
  }

  // ==========================================================================
  // SUMMARY GENERATION
  // ==========================================================================

  /**
   * Generate prediction summary
   */
  private generatePredictionSummary(data: {
    trajectory: TrajectoryDirection;
    velocityOfChange: number;
    riskLevel: string;
    likelyOutcome: PredictedOutcome;
    earlyWarnings: EarlyWarningSign[];
  }): string {
    const { trajectory, velocityOfChange, riskLevel, likelyOutcome, earlyWarnings } = data;

    const velocityDesc = velocityOfChange > 0.6 ? 'rapid' : velocityOfChange > 0.3 ? 'moderate' : 'slow';

    let summary = `Trajectory: ${trajectory.toUpperCase()} with ${velocityDesc} velocity. `;
    summary += `Risk level: ${riskLevel.toUpperCase()}. `;
    summary += `${earlyWarnings.length} early warning sign(s) detected. `;
    summary += `Likely outcome if pattern continues: ${likelyOutcome.signature} (${(likelyOutcome.probability * 100).toFixed(0)}% probability, ${likelyOutcome.timeframe}).`;

    return summary;
  }

  /**
   * Generate alert if critical
   */
  private generateAlert(
    riskLevel: string,
    outcome: PredictedOutcome,
    intervention: InterventionRecommendation
  ): string | undefined {
    if (riskLevel === 'critical' || outcome.timeframe === 'imminent') {
      return `🚨 CRITICAL ALERT: ${outcome.signature} likely within ${outcome.timeframe}. ${intervention.reasoning}`;
    }

    if (riskLevel === 'high' && intervention.window === 'soon') {
      return `⚠️ HIGH RISK: ${outcome.signature} predicted within ${outcome.timeframe}. Intervention recommended soon.`;
    }

    return undefined;
  }
}

// Export singleton instance
export const signaturePredictionEngine = new SignaturePredictionEngineClass();
