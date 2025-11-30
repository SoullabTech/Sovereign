/**
 * SHIFt Scoring Engine
 * 
 * Maps extracted features to facet scores and infers phase.
 * Implements transparent rules with future ML capability.
 */

import {
  SHIFtFeatures,
  FacetScore,
  ElementalProfile,
  PhaseInference,
  Phase,
  Element,
  SPIRALOGIC_FACETS,
  ExplicitScore,
  BlendingConfig,
  SHIFtAlert
} from '../types/shift';
import { logger } from '../utils/logger';

export class SHIFtScoringEngine {
  private readonly blendingConfig: BlendingConfig = {
    explicitWeight: 0.65,
    decayHalfLifeDays: 120,
    conflictThreshold: 25
  };

  // Population statistics for normalization (would be dynamic in production)
  private readonly populationStats = {
    means: {
      meaningDensity: 0.15,
      actionCommitmentCount: 1.5,
      coherenceMarkers: 0.12,
      routineLanguage: 0.18,
      metaReferences: 0.08,
      valuesHits: 2.0
    },
    stdevs: {
      meaningDensity: 0.1,
      actionCommitmentCount: 1.2,
      coherenceMarkers: 0.08,
      routineLanguage: 0.12,
      metaReferences: 0.06,
      valuesHits: 1.5
    }
  };

  /**
   * Score all facets from features
   */
  scoreFacets(features: SHIFtFeatures): Record<string, FacetScore> {
    const scores: Record<string, FacetScore> = {};
    
    // Score each facet
    scores['F1_Meaning'] = this.scoreF1_Meaning(features);
    scores['F2_Courage'] = this.scoreF2_Courage(features);
    scores['E1_Coherence'] = this.scoreE1_Coherence(features);
    scores['E2_Grounding'] = this.scoreE2_Grounding(features);
    scores['W1_Attunement'] = this.scoreW1_Attunement(features);
    scores['W2_Belonging'] = this.scoreW2_Belonging(features);
    scores['A1_Reflection'] = this.scoreA1_Reflection(features);
    scores['A2_Adaptability'] = this.scoreA2_Adaptability(features);
    scores['AE1_Values'] = this.scoreAE1_Values(features);
    scores['AE2_Fulfillment'] = this.scoreAE2_Fulfillment(features);
    scores['C1_Integration'] = this.scoreC1_Integration(features);
    scores['C2_Integrity'] = this.scoreC2_Integrity(features);
    
    return scores;
  }

  /**
   * Calculate elemental profile from facet scores
   */
  calculateElementalProfile(facetScores: Record<string, FacetScore>): ElementalProfile {
    const elements: Record<Element, number[]> = {
      fire: [],
      earth: [],
      water: [],
      air: [],
      aether: []
    };
    
    // Group scores by element
    Object.entries(facetScores).forEach(([code, score]) => {
      const facet = SPIRALOGIC_FACETS[code];
      if (facet && elements[facet.element]) {
        elements[facet.element].push(score.score);
      }
    });
    
    // Calculate means
    const profile: ElementalProfile = {
      fire: this.mean(elements.fire),
      earth: this.mean(elements.earth),
      water: this.mean(elements.water),
      air: this.mean(elements.air),
      aether: this.mean(elements.aether),
      confidence: this.calculateOverallConfidence(facetScores)
    };
    
    return profile;
  }

  /**
   * Infer phase from facet scores
   */
  inferPhase(facetScores: Record<string, FacetScore>): PhaseInference {
    // Calculate phase logits based on facet configurations
    const logits: Record<Phase, number> = {
      initiation: 
        facetScores['F1_Meaning'].score * 1.2 +
        facetScores['F2_Courage'].score * 1.1 +
        facetScores['A2_Adaptability'].score * 0.8 -
        facetScores['E2_Grounding'].score * 0.5,
      
      grounding:
        facetScores['E1_Coherence'].score * 1.2 +
        facetScores['E2_Grounding'].score * 1.3 +
        facetScores['C1_Integration'].score * 0.9 -
        facetScores['A2_Adaptability'].score * 0.4,
      
      collaboration:
        facetScores['W1_Attunement'].score * 1.2 +
        facetScores['W2_Belonging'].score * 1.3 +
        facetScores['C2_Integrity'].score * 0.8,
      
      transformation:
        facetScores['A1_Reflection'].score * 1.1 +
        facetScores['A2_Adaptability'].score * 1.2 +
        facetScores['F2_Courage'].score * 0.9,
      
      completion:
        facetScores['AE1_Values'].score * 1.2 +
        facetScores['AE2_Fulfillment'].score * 1.3 +
        facetScores['E1_Coherence'].score * 0.8
    };
    
    // Apply softmax with temperature
    const temperature = 12;
    const expLogits = Object.entries(logits).map(([phase, logit]) => ({
      phase: phase as Phase,
      exp: Math.exp(logit / temperature)
    }));
    
    const sumExp = expLogits.reduce((sum, { exp }) => sum + exp, 0);
    const probabilities = expLogits.map(({ phase, exp }) => ({
      phase,
      prob: exp / sumExp
    }));
    
    // Sort by probability
    probabilities.sort((a, b) => b.prob - a.prob);
    
    return {
      primary: probabilities[0].phase,
      primaryConfidence: probabilities[0].prob,
      secondary: probabilities[1].phase,
      secondaryConfidence: probabilities[1].prob,
      logits
    };
  }

  /**
   * Blend implicit and explicit scores
   */
  blendScores(
    implicit: FacetScore,
    explicit: ExplicitScore | undefined,
    currentDate: Date = new Date()
  ): FacetScore {
    if (!explicit) return implicit;
    
    // Calculate time-decayed weight for explicit score
    const daysSinceExplicit = Math.floor(
      (currentDate.getTime() - explicit.takenAt.getTime()) / (1000 * 60 * 60 * 24)
    );
    const decayedWeight = this.blendingConfig.explicitWeight * 
      Math.exp(-daysSinceExplicit / this.blendingConfig.decayHalfLifeDays);
    
    // Blend scores
    const blendedScore = decayedWeight * explicit.score + 
                        (1 - decayedWeight) * implicit.score;
    
    // Check for calibration need
    const delta = Math.abs(explicit.score - implicit.score);
    const needsCalibration = delta > this.blendingConfig.conflictThreshold;
    
    return {
      ...implicit,
      score: blendedScore,
      source: 'blended',
      evidenceWeights: {
        ...implicit.evidenceWeights,
        explicit: decayedWeight,
        implicit: 1 - decayedWeight,
        calibrationNeeded: needsCalibration ? 1 : 0
      }
    };
  }

  /**
   * Detect alerts based on scores
   */
  detectAlerts(
    facetScores: Record<string, FacetScore>,
    previousScores?: Record<string, FacetScore>
  ): SHIFtAlert[] {
    const alerts: SHIFtAlert[] = [];
    
    // Low grounding alert
    if (facetScores['E2_Grounding'].score < 35) {
      alerts.push({
        code: 'low_grounding',
        severity: 'warning',
        message: 'Your grounding practices have weakened',
        recommendation: 'Try one 5-minute anchor each morning for three days.',
        facetsAffected: ['E2_Grounding']
      });
    }
    
    // Avoidance spike
    if (previousScores) {
      const currentAvoidance = 100 - facetScores['F2_Courage'].score;
      const previousAvoidance = 100 - previousScores['F2_Courage'].score;
      if (currentAvoidance > previousAvoidance * 1.3) {
        alerts.push({
          code: 'avoidance_spike',
          severity: 'action',
          message: 'Noticing increased avoidance patterns',
          recommendation: 'Name one small truth aloud today.',
          facetsAffected: ['F2_Courage']
        });
      }
    }
    
    // Phase transition
    // (Would implement based on phase history)
    
    return alerts;
  }

  // Individual facet scoring methods

  private scoreF1_Meaning(features: SHIFtFeatures): FacetScore {
    const weights = {
      meaningDensity: 0.6,
      valuesHits: 0.2,
      wholenessRefs: 0.2
    };
    
    const rawScore = 
      this.normalize(features.conversational.meaningDensity, 'meaningDensity') * weights.meaningDensity +
      this.normalize(features.conversational.valuesHits, 'valuesHits') * weights.valuesHits +
      features.conversational.wholenessReferences * weights.wholenessRefs;
    
    return {
      code: 'F1_Meaning',
      score: Math.round(rawScore * 100),
      confidence: this.calculateConfidence(features),
      delta7d: 0, // Would calculate from history
      evidenceWeights: weights,
      source: 'implicit'
    };
  }

  private scoreF2_Courage(features: SHIFtFeatures): FacetScore {
    const weights = {
      truthNaming: 0.5,
      actionCommitment: 0.3,
      integrityRepair: 0.2
    };
    
    const rawScore = 
      (features.conversational.truthNaming ? 1 : 0) * weights.truthNaming +
      this.normalize(features.conversational.actionCommitmentCount, 'actionCommitmentCount') * weights.actionCommitment +
      (features.conversational.integrityRepair ? 1 : 0) * weights.integrityRepair;
    
    return {
      code: 'F2_Courage',
      score: Math.round(rawScore * 100),
      confidence: this.calculateConfidence(features),
      delta7d: 0,
      evidenceWeights: weights,
      source: 'implicit'
    };
  }

  private scoreE1_Coherence(features: SHIFtFeatures): FacetScore {
    const weights = {
      coherenceRefs: 0.6,
      metaRefs: 0.2,
      tasksDone: 0.2
    };
    
    const rawScore = 
      this.normalize(features.conversational.coherenceMarkers, 'coherenceMarkers') * weights.coherenceRefs +
      this.normalize(features.conversational.metaReferences, 'metaReferences') * weights.metaRefs +
      features.behavioral.tasksCompletionRate * weights.tasksDone;
    
    return {
      code: 'E1_Coherence',
      score: Math.round(rawScore * 100),
      confidence: this.calculateConfidence(features),
      delta7d: 0,
      evidenceWeights: weights,
      source: 'implicit'
    };
  }

  private scoreE2_Grounding(features: SHIFtFeatures): FacetScore {
    const weights = {
      routineRefs: 0.5,
      streakDays: 0.3,
      ontimeRate: 0.2
    };
    
    const rawScore = 
      this.normalize(features.conversational.routineLanguage, 'routineLanguage') * weights.routineRefs +
      Math.min(1, features.behavioral.streakDays / 30) * weights.streakDays +
      features.behavioral.ontimeRate * weights.ontimeRate;
    
    return {
      code: 'E2_Grounding',
      score: Math.round(rawScore * 100),
      confidence: this.calculateConfidence(features),
      delta7d: 0,
      evidenceWeights: weights,
      source: 'implicit'
    };
  }

  private scoreW1_Attunement(features: SHIFtFeatures): FacetScore {
    const weights = {
      affectReg: 0.6,
      sentimentVar: 0.2,
      lexicalVar: 0.2
    };
    
    const rawScore = 
      features.conversational.affectRegulationOk * weights.affectReg +
      features.contentQuality.sentimentVariance * weights.sentimentVar +
      Math.min(1, features.contentQuality.readabilityVariance / 20) * weights.lexicalVar;
    
    return {
      code: 'W1_Attunement',
      score: Math.round(rawScore * 100),
      confidence: this.calculateConfidence(features),
      delta7d: 0,
      evidenceWeights: weights,
      source: 'implicit'
    };
  }

  private scoreW2_Belonging(features: SHIFtFeatures): FacetScore {
    const weights = {
      reciprocity: 0.5,
      rituals: 0.3,
      helpSeek: 0.2
    };
    
    const rawScore = 
      features.conversational.reciprocityIndex * weights.reciprocity +
      Math.min(1, features.behavioral.ritualsLast7Days / 3) * weights.rituals +
      (features.behavioral.helpSeekingAppropriate ? 1 : 0.5) * weights.helpSeek;
    
    return {
      code: 'W2_Belonging',
      score: Math.round(rawScore * 100),
      confidence: this.calculateConfidence(features),
      delta7d: 0,
      evidenceWeights: weights,
      source: 'implicit'
    };
  }

  private scoreA1_Reflection(features: SHIFtFeatures): FacetScore {
    const weights = {
      metaRefs: 0.6,
      journals: 0.2,
      readability: 0.2
    };
    
    const rawScore = 
      this.normalize(features.conversational.metaReferences, 'metaReferences') * weights.metaRefs +
      Math.min(1, features.behavioral.journalsLast7Days / 5) * weights.journals +
      (1 - Math.min(1, features.contentQuality.readabilityVariance / 50)) * weights.readability;
    
    return {
      code: 'A1_Reflection',
      score: Math.round(rawScore * 100),
      confidence: this.calculateConfidence(features),
      delta7d: 0,
      evidenceWeights: weights,
      source: 'implicit'
    };
  }

  private scoreA2_Adaptability(features: SHIFtFeatures): FacetScore {
    const weights = {
      reframing: 0.6,
      avoidance: -0.4
    };
    
    // Simplified - would analyze reframing patterns in production
    const reframingFreq = features.conversational.metaReferences * 0.8;
    
    const rawScore = Math.max(0,
      reframingFreq * weights.reframing +
      (1 - features.contentQuality.avoidanceScore) * Math.abs(weights.avoidance)
    );
    
    return {
      code: 'A2_Adaptability',
      score: Math.round(rawScore * 100),
      confidence: this.calculateConfidence(features),
      delta7d: 0,
      evidenceWeights: weights,
      source: 'implicit'
    };
  }

  private scoreAE1_Values(features: SHIFtFeatures): FacetScore {
    const weights = {
      valuesHits: 0.6,
      integrityRepair: 0.2,
      tasksDone: 0.2
    };
    
    const rawScore = 
      this.normalize(features.conversational.valuesHits, 'valuesHits') * weights.valuesHits +
      (features.conversational.integrityRepair ? 1 : 0) * weights.integrityRepair +
      features.behavioral.tasksCompletionRate * weights.tasksDone;
    
    return {
      code: 'AE1_Values',
      score: Math.round(rawScore * 100),
      confidence: this.calculateConfidence(features),
      delta7d: 0,
      evidenceWeights: weights,
      source: 'implicit'
    };
  }

  private scoreAE2_Fulfillment(features: SHIFtFeatures): FacetScore {
    const weights = {
      wholeness: 0.6,
      meaning: 0.2,
      gratitude: 0.2
    };
    
    // Simplified gratitude detection
    const gratitudeTokens = features.conversational.reciprocityIndex * 0.5;
    
    const rawScore = 
      features.conversational.wholenessReferences * weights.wholeness +
      features.conversational.meaningDensity * weights.meaning +
      gratitudeTokens * weights.gratitude;
    
    return {
      code: 'AE2_Fulfillment',
      score: Math.round(rawScore * 100),
      confidence: this.calculateConfidence(features),
      delta7d: 0,
      evidenceWeights: weights,
      source: 'implicit'
    };
  }

  private scoreC1_Integration(features: SHIFtFeatures): FacetScore {
    const weights = {
      integrationCommit: 0.6,
      streakDays: 0.2,
      rituals: 0.2
    };
    
    const rawScore = 
      (features.conversational.integrationCommitment ? 1 : 0) * weights.integrationCommit +
      Math.min(1, features.behavioral.streakDays / 21) * weights.streakDays +
      Math.min(1, features.behavioral.ritualsLast7Days / 5) * weights.rituals;
    
    return {
      code: 'C1_Integration',
      score: Math.round(rawScore * 100),
      confidence: this.calculateConfidence(features),
      delta7d: 0,
      evidenceWeights: weights,
      source: 'implicit'
    };
  }

  private scoreC2_Integrity(features: SHIFtFeatures): FacetScore {
    const weights = {
      integrityRepair: 0.5,
      deedWordMatch: 0.3,
      actionCommit: 0.2
    };
    
    // Simplified deed-word match (would track promises in production)
    const deedWordMatch = features.behavioral.tasksCompletionRate * 0.8;
    
    const rawScore = 
      (features.conversational.integrityRepair ? 1 : 0) * weights.integrityRepair +
      deedWordMatch * weights.deedWordMatch +
      Math.min(1, features.conversational.actionCommitmentCount / 3) * weights.actionCommit;
    
    return {
      code: 'C2_Integrity',
      score: Math.round(rawScore * 100),
      confidence: this.calculateConfidence(features),
      delta7d: 0,
      evidenceWeights: weights,
      source: 'implicit'
    };
  }

  // Helper methods

  private normalize(value: number, metric: string): number {
    const mean = this.populationStats.means[metric as keyof typeof this.populationStats.means] || 0;
    const stdev = this.populationStats.stdevs[metric as keyof typeof this.populationStats.stdevs] || 1;
    
    // Z-score normalization, clamped to 0-1
    const zScore = (value - mean) / stdev;
    return Math.max(0, Math.min(1, (zScore + 2) / 4)); // Map [-2, 2] to [0, 1]
  }

  private calculateConfidence(features: SHIFtFeatures): number {
    // Base confidence on data coverage
    const hasConversational = Object.values(features.conversational).some(v => v !== 0);
    const hasBehavioral = Object.values(features.behavioral).some(v => v !== 0);
    const hasContent = Object.values(features.contentQuality).some(v => v !== 0);
    
    const coverage = [hasConversational, hasBehavioral, hasContent].filter(Boolean).length / 3;
    return Math.max(0.3, coverage); // Minimum 30% confidence
  }

  private calculateOverallConfidence(facetScores: Record<string, FacetScore>): number {
    const confidences = Object.values(facetScores).map(s => s.confidence);
    return this.mean(confidences);
  }

  private mean(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }
}