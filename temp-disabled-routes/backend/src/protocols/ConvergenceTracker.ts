/**
 * Convergence Tracker for Maya's Looping Protocol
 * Measures understanding accuracy and determines when to stop looping
 * Balances depth-seeking with conversation flow
 */

import { ElementalArchetype } from '../../../web/lib/types/elemental';
import { LoopingState, LoopingIntensity } from './LoopingProtocol';

export interface ConvergenceMetrics {
  semanticAlignment: number;      // 0-1: How well meanings align
  emotionalResonance: number;     // 0-1: Emotional accuracy
  archetyptalClarity: number;     // 0-1: Archetype pattern clarity
  elementalCoherence: number;     // 0-1: Elemental signal strength
  userConfirmation: number;       // 0-1: Explicit user agreement
  overallConvergence: number;     // 0-1: Weighted average
}

export interface ConvergenceThresholds {
  minimum: number;                // Below this, must continue looping
  optimal: number;                // Target convergence level
  sufficient: number;             // Good enough to proceed
  maximum: number;                // Perfect understanding
}

export interface ConvergenceHistory {
  iteration: number;
  metrics: ConvergenceMetrics;
  userFeedback: string;
  timestamp: Date;
}

/**
 * Different threshold configurations based on looping intensity
 */
export const CONVERGENCE_THRESHOLDS: Record<LoopingIntensity, ConvergenceThresholds> = {
  [LoopingIntensity.LIGHT]: {
    minimum: 0.3,
    optimal: 0.6,
    sufficient: 0.5,
    maximum: 0.8
  },
  [LoopingIntensity.FULL]: {
    minimum: 0.4,
    optimal: 0.75,
    sufficient: 0.65,
    maximum: 0.9
  },
  [LoopingIntensity.SACRED]: {
    minimum: 0.5,
    optimal: 0.9,
    sufficient: 0.85,
    maximum: 0.95
  }
};

/**
 * Main convergence tracking class
 */
export class ConvergenceTracker {
  private history: ConvergenceHistory[] = [];
  private thresholds: ConvergenceThresholds;

  constructor(intensity: LoopingIntensity = LoopingIntensity.FULL) {
    this.thresholds = CONVERGENCE_THRESHOLDS[intensity];
  }

  /**
   * Calculate comprehensive convergence metrics
   */
  calculateConvergence(
    state: LoopingState,
    userFeedback?: string
  ): ConvergenceMetrics {
    const semanticAlignment = this.calculateSemanticAlignment(state, userFeedback);
    const emotionalResonance = this.calculateEmotionalResonance(state);
    const archetyptalClarity = this.calculateArchetypalClarity(state);
    const elementalCoherence = this.calculateElementalCoherence(state);
    const userConfirmation = this.calculateUserConfirmation(userFeedback);

    // Weighted average based on what's most important
    const weights = {
      semantic: 0.3,
      emotional: 0.25,
      archetypal: 0.15,
      elemental: 0.15,
      confirmation: 0.15
    };

    const overallConvergence =
      semanticAlignment * weights.semantic +
      emotionalResonance * weights.emotional +
      archetyptalClarity * weights.archetypal +
      elementalCoherence * weights.elemental +
      userConfirmation * weights.confirmation;

    const metrics: ConvergenceMetrics = {
      semanticAlignment,
      emotionalResonance,
      archetyptalClarity,
      elementalCoherence,
      userConfirmation,
      overallConvergence
    };

    // Track history
    this.history.push({
      iteration: state.loopCount,
      metrics,
      userFeedback: userFeedback || '',
      timestamp: new Date()
    });

    return metrics;
  }

  /**
   * Determine if looping should continue based on convergence
   */
  shouldContinueLooping(
    metrics: ConvergenceMetrics,
    loopCount: number,
    maxLoops: number
  ): boolean {
    // Stop if max loops reached
    if (loopCount >= maxLoops) {
      return false;
    }

    // Continue if below minimum threshold
    if (metrics.overallConvergence < this.thresholds.minimum) {
      return true;
    }

    // Stop if reached optimal threshold
    if (metrics.overallConvergence >= this.thresholds.optimal) {
      return false;
    }

    // Check trend - if improving, continue; if plateaued, stop
    const trend = this.calculateConvergenceTrend();
    if (trend < 0.05 && loopCount > 1) {
      // Convergence has plateaued
      return false;
    }

    // Continue if still improving and below optimal
    return true;
  }

  /**
   * Get recommended action based on convergence state
   */
  getRecommendedAction(metrics: ConvergenceMetrics): 'loop' | 'deepen' | 'transition' | 'complete' {
    if (metrics.overallConvergence < this.thresholds.sufficient) {
      return 'loop'; // Continue clarifying
    }

    if (metrics.overallConvergence < this.thresholds.optimal) {
      return 'deepen'; // Good enough to deepen but could be better
    }

    if (metrics.overallConvergence < this.thresholds.maximum) {
      return 'transition'; // Ready to move forward
    }

    return 'complete'; // Perfect understanding achieved
  }

  /**
   * Analyze convergence patterns to detect issues
   */
  analyzeConvergencePattern(): {
    pattern: 'improving' | 'plateaued' | 'declining' | 'oscillating';
    recommendation: string;
  } {
    if (this.history.length < 2) {
      return {
        pattern: 'improving',
        recommendation: 'Continue current approach'
      };
    }

    const recent = this.history.slice(-3);
    const convergences = recent.map(h => h.metrics.overallConvergence);

    // Check for improvement
    const improving = convergences.every((val, i) =>
      i === 0 || val >= convergences[i - 1]
    );

    // Check for plateau
    const variance = this.calculateVariance(convergences);
    const plateaued = variance < 0.01;

    // Check for decline
    const declining = convergences.every((val, i) =>
      i === 0 || val < convergences[i - 1]
    );

    // Check for oscillation
    const oscillating = variance > 0.1 && !improving && !declining;

    if (improving) {
      return {
        pattern: 'improving',
        recommendation: 'Continue current looping approach'
      };
    }

    if (plateaued) {
      return {
        pattern: 'plateaued',
        recommendation: 'Consider transitioning or trying different questions'
      };
    }

    if (declining) {
      return {
        pattern: 'declining',
        recommendation: 'Return to previous understanding or reset'
      };
    }

    return {
      pattern: 'oscillating',
      recommendation: 'Stabilize by focusing on one aspect at a time'
    };
  }

  // Private calculation methods

  private calculateSemanticAlignment(
    state: LoopingState,
    userFeedback?: string
  ): number {
    if (!userFeedback) return 0.5; // Neutral if no feedback

    const positiveSigns = ['yes', 'exactly', 'that\'s it', 'correct', 'right'];
    const negativeSigns = ['no', 'not', 'wrong', 'different', 'actually'];

    const lowerFeedback = userFeedback.toLowerCase();

    // Check for positive confirmation
    const hasPositive = positiveSigns.some(sign => lowerFeedback.includes(sign));
    const hasNegative = negativeSigns.some(sign => lowerFeedback.includes(sign));

    if (hasPositive && !hasNegative) return 0.9;
    if (hasNegative && !hasPositive) return 0.3;
    if (hasPositive && hasNegative) return 0.6; // Mixed signals

    // Check adjustment history for improvement
    const adjustmentCount = state.adjustmentHistory.length;
    if (adjustmentCount === 0) return 0.5;

    // Each successful adjustment improves alignment
    return Math.min(0.4 + (adjustmentCount * 0.15), 0.85);
  }

  private calculateEmotionalResonance(state: LoopingState): number {
    const { elemental, archetypal } = state.depthInference;

    // Strong elemental signal indicates good emotional resonance
    let resonance = elemental.intensity;

    // Shadow work indicates deep emotional engagement
    if (archetypal.shadowAspect) {
      resonance += 0.2;
    }

    // Water element particularly important for emotional resonance
    if (elemental.element === ElementalArchetype.WATER) {
      resonance *= 1.2;
    }

    return Math.min(resonance, 1.0);
  }

  private calculateArchetypalClarity(state: LoopingState): number {
    const { archetypal } = state.depthInference;

    // Base clarity on confidence
    let clarity = archetypal.confidence;

    // Evolution phase affects clarity
    switch (archetypal.evolutionPhase) {
      case 'transcending':
        clarity *= 1.2;
        break;
      case 'integrating':
        clarity *= 1.1;
        break;
      case 'developing':
        clarity *= 1.0;
        break;
      case 'emerging':
        clarity *= 0.9;
        break;
      default:
        clarity *= 0.8;
    }

    return Math.min(clarity, 1.0);
  }

  private calculateElementalCoherence(state: LoopingState): number {
    const { elemental } = state.depthInference;

    // Base coherence on intensity
    let coherence = elemental.intensity;

    // Multiple keywords increase coherence
    coherence += Math.min(elemental.keywords.length * 0.1, 0.3);

    // Matching elemental mode increases coherence
    if (elemental.element === state.elementalMode) {
      coherence *= 1.15;
    }

    return Math.min(coherence, 1.0);
  }

  private calculateUserConfirmation(userFeedback?: string): number {
    if (!userFeedback) return 0.5;

    const strongPositive = ['yes exactly', 'that\'s it', 'perfect', 'absolutely'];
    const positive = ['yes', 'right', 'correct', 'true'];
    const neutral = ['maybe', 'sort of', 'kind of', 'partially'];
    const negative = ['no', 'not quite', 'wrong', 'not really'];
    const strongNegative = ['completely wrong', 'not at all', 'totally off'];

    const lowerFeedback = userFeedback.toLowerCase();

    // Check from strongest to weakest
    if (strongPositive.some(phrase => lowerFeedback.includes(phrase))) return 1.0;
    if (strongNegative.some(phrase => lowerFeedback.includes(phrase))) return 0.0;
    if (positive.some(word => lowerFeedback.includes(word))) return 0.8;
    if (negative.some(word => lowerFeedback.includes(word))) return 0.2;
    if (neutral.some(word => lowerFeedback.includes(word))) return 0.5;

    // Default to neutral
    return 0.5;
  }

  private calculateConvergenceTrend(): number {
    if (this.history.length < 2) return 0;

    const recent = this.history.slice(-3);
    const convergences = recent.map(h => h.metrics.overallConvergence);

    // Calculate average change
    let totalChange = 0;
    for (let i = 1; i < convergences.length; i++) {
      totalChange += convergences[i] - convergences[i - 1];
    }

    return totalChange / (convergences.length - 1);
  }

  private calculateVariance(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
    return squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
  }

  /**
   * Generate insight about convergence state for debugging
   */
  generateConvergenceReport(): string {
    if (this.history.length === 0) {
      return 'No convergence data yet';
    }

    const latest = this.history[this.history.length - 1];
    const pattern = this.analyzeConvergencePattern();

    return `
Convergence Report:
- Overall: ${(latest.metrics.overallConvergence * 100).toFixed(1)}%
- Semantic: ${(latest.metrics.semanticAlignment * 100).toFixed(1)}%
- Emotional: ${(latest.metrics.emotionalResonance * 100).toFixed(1)}%
- Archetypal: ${(latest.metrics.archetyptalClarity * 100).toFixed(1)}%
- Elemental: ${(latest.metrics.elementalCoherence * 100).toFixed(1)}%
- User Confirmation: ${(latest.metrics.userConfirmation * 100).toFixed(1)}%

Pattern: ${pattern.pattern}
Recommendation: ${pattern.recommendation}
Iterations: ${this.history.length}
    `.trim();
  }

  /**
   * Reset tracker for new conversation
   */
  reset(): void {
    this.history = [];
  }

  /**
   * Get convergence history for analysis
   */
  getHistory(): ConvergenceHistory[] {
    return [...this.history];
  }
}

/**
 * Factory function for creating convergence tracker
 */
export function createConvergenceTracker(intensity: LoopingIntensity): ConvergenceTracker {
  return new ConvergenceTracker(intensity);
}