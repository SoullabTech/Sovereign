/**
 * Breakthrough Trajectory Prediction Engine
 * Predicts when and how breakthroughs are likely to occur based on
 * spiral positioning, alchemical operations, and historical patterns
 */

import { AlchemicalOperation } from './AlchemicalOperationDetector';
import { SpiralTrajectory, ElementalMode } from './SpiralogicOrchestrator';

export interface BreakthroughPrediction {
  probability: number; // 0-1
  timeframe: string;
  type: BreakthroughType;
  triggerFactors: string[];
  readinessScore: number; // 0-1
  blockers: string[];
  accelerators: string[];
  nextLikelyBreakthrough: Date | null;
  confidenceLevel: 'low' | 'medium' | 'high';
}

export enum BreakthroughType {
  COGNITIVE = 'cognitive',           // Mental understanding shifts
  EMOTIONAL = 'emotional',           // Emotional release/integration
  ENERGETIC = 'energetic',          // Energy system activation
  RELATIONAL = 'relational',        // Relationship pattern shifts
  CREATIVE = 'creative',            // Creative expression breakthrough
  SOMATIC = 'somatic',              // Body-based realization
  SPIRITUAL = 'spiritual',          // Transcendent awareness
  SHADOW = 'shadow',                // Shadow integration
  ALCHEMICAL = 'alchemical'         // Complete operation completion
}

export interface SpiralPatternAnalysis {
  currentPattern: SpiralPatternType;
  patternMaturity: number; // 0-1
  cyclePosition: number; // 0-1 within current pattern
  emergentComplexity: number; // How much new complexity is emerging
  selfSimilarity: number; // How much this pattern repeats at different scales
  coherenceLevel: number; // How well-organized the pattern is
  transitionProbability: number; // Likelihood of transitioning to next pattern
}

export enum SpiralPatternType {
  INITIATION = 'initiation',         // Beginning new cycle
  EXPLORATION = 'exploration',       // Active learning/testing
  CRISIS = 'crisis',                 // Challenge/breakdown phase
  INTEGRATION = 'integration',       // Synthesis and stabilization
  MASTERY = 'mastery',              // Skillful application
  TEACHING = 'teaching',            // Sharing/mentoring phase
  TRANSCENDENCE = 'transcendence'    // Moving beyond current level
}

export interface BreakthroughIndicators {
  intensity: number; // 0-1
  frequency: number; // Events per week
  synchronicity: number; // Meaningful coincidences
  resistanceLevel: number; // How much resistance is present
  energyVolatility: number; // How unstable energy feels
  dreamActivity: number; // Symbolic/prophetic dream frequency
  relationshipTension: number; // Conflicts in relationships
  creativeDrive: number; // Urge to create/express
}

export class BreakthroughTrajectoryEngine {

  /**
   * Main prediction method
   */
  predictBreakthrough(
    alchemicalOperation: AlchemicalOperation,
    trajectory: SpiralTrajectory,
    indicators: BreakthroughIndicators,
    historicalData?: any[]
  ): BreakthroughPrediction {

    const readinessScore = this.calculateReadinessScore(indicators, trajectory);
    const probability = this.calculateBreakthroughProbability(
      alchemicalOperation,
      trajectory,
      indicators,
      readinessScore
    );

    const type = this.predictBreakthroughType(alchemicalOperation, indicators);
    const timeframe = this.estimateTimeframe(probability, readinessScore, trajectory);
    const triggerFactors = this.identifyTriggerFactors(indicators, alchemicalOperation);
    const blockers = this.identifyBlockers(indicators, trajectory);
    const accelerators = this.identifyAccelerators(indicators, trajectory);
    const nextDate = this.predictNextBreakthrough(probability, timeframe);
    const confidence = this.calculateConfidence(historicalData, indicators);

    return {
      probability,
      timeframe,
      type,
      triggerFactors,
      readinessScore,
      blockers,
      accelerators,
      nextLikelyBreakthrough: nextDate,
      confidenceLevel: confidence
    };
  }

  /**
   * Analyze spiral patterns at multiple scales
   */
  analyzeSpiralPattern(
    trajectory: SpiralTrajectory,
    alchemicalOperation: AlchemicalOperation,
    recentHistory: any[]
  ): SpiralPatternAnalysis {

    const currentPattern = this.identifyCurrentPattern(trajectory, alchemicalOperation);
    const maturity = this.calculatePatternMaturity(trajectory, recentHistory);
    const cyclePosition = this.calculateCyclePosition(currentPattern, trajectory);
    const complexity = this.measureEmergentComplexity(recentHistory);
    const similarity = this.calculateSelfSimilarity(recentHistory);
    const coherence = this.measureCoherence(trajectory);
    const transitionProb = this.calculateTransitionProbability(
      currentPattern,
      maturity,
      trajectory
    );

    return {
      currentPattern,
      patternMaturity: maturity,
      cyclePosition,
      emergentComplexity: complexity,
      selfSimilarity: similarity,
      coherenceLevel: coherence,
      transitionProbability: transitionProb
    };
  }

  /**
   * Calculate readiness for breakthrough
   */
  private calculateReadinessScore(
    indicators: BreakthroughIndicators,
    trajectory: SpiralTrajectory
  ): number {
    // High intensity + high volatility + moderate resistance = high readiness
    const intensityWeight = indicators.intensity * 0.3;
    const volatilityWeight = indicators.energyVolatility * 0.2;
    const resistanceWeight = (1 - indicators.resistanceLevel) * 0.2; // Less resistance = more ready
    const synchronicityWeight = indicators.synchronicity * 0.15;
    const creativeDriveWeight = indicators.creativeDrive * 0.15;

    return Math.min(1, intensityWeight + volatilityWeight + resistanceWeight +
                      synchronicityWeight + creativeDriveWeight);
  }

  /**
   * Calculate probability of breakthrough occurring
   */
  private calculateBreakthroughProbability(
    operation: AlchemicalOperation,
    trajectory: SpiralTrajectory,
    indicators: BreakthroughIndicators,
    readiness: number
  ): number {
    // Base probability based on alchemical operation
    const operationProbs = {
      [AlchemicalOperation.CALCINATION]: 0.3,     // Breaking down = potential breakthrough
      [AlchemicalOperation.SOLUTIO]: 0.4,        // Emotional release often catalyzes
      [AlchemicalOperation.SEPARATIO]: 0.2,      // Discernment phase, less volatile
      [AlchemicalOperation.CONJUNCTIO]: 0.7,     // Integration often brings insights
      [AlchemicalOperation.FERMENTATION]: 0.5,   // Creative bubbling
      [AlchemicalOperation.DISTILLATION]: 0.6,   // Refinement can precipitate clarity
      [AlchemicalOperation.COAGULATION]: 0.3     // Stabilizing, less breakthrough-prone
    };

    let baseProbability = operationProbs[operation] || 0.4;

    // Adjust based on trajectory
    if (trajectory.velocity > 0.7) baseProbability += 0.2; // High velocity
    if (trajectory.inwardness > 0.8) baseProbability += 0.1; // Deep introspection

    // Factor in indicators
    const indicatorBoost = (
      indicators.synchronicity * 0.3 +
      indicators.dreamActivity * 0.2 +
      indicators.relationshipTension * 0.1 + // Tension can catalyze
      indicators.intensity * 0.2
    );

    // Combine with readiness
    const finalProb = (baseProbability + indicatorBoost) * readiness;

    return Math.min(0.95, Math.max(0.05, finalProb)); // Keep between 5-95%
  }

  /**
   * Predict most likely breakthrough type
   */
  private predictBreakthroughType(
    operation: AlchemicalOperation,
    indicators: BreakthroughIndicators
  ): BreakthroughType {

    // Different operations tend toward different breakthrough types
    const operationTendencies = {
      [AlchemicalOperation.CALCINATION]: [BreakthroughType.COGNITIVE, BreakthroughType.SHADOW],
      [AlchemicalOperation.SOLUTIO]: [BreakthroughType.EMOTIONAL, BreakthroughType.SOMATIC],
      [AlchemicalOperation.SEPARATIO]: [BreakthroughType.COGNITIVE, BreakthroughType.SPIRITUAL],
      [AlchemicalOperation.CONJUNCTIO]: [BreakthroughType.RELATIONAL, BreakthroughType.CREATIVE],
      [AlchemicalOperation.FERMENTATION]: [BreakthroughType.CREATIVE, BreakthroughType.ENERGETIC],
      [AlchemicalOperation.DISTILLATION]: [BreakthroughType.SPIRITUAL, BreakthroughType.COGNITIVE],
      [AlchemicalOperation.COAGULATION]: [BreakthroughType.SOMATIC, BreakthroughType.ALCHEMICAL]
    };

    const tendencies = operationTendencies[operation] || [BreakthroughType.COGNITIVE];

    // Adjust based on indicators
    if (indicators.creativeDrive > 0.7) return BreakthroughType.CREATIVE;
    if (indicators.relationshipTension > 0.7) return BreakthroughType.RELATIONAL;
    if (indicators.dreamActivity > 0.7) return BreakthroughType.SPIRITUAL;
    if (indicators.energyVolatility > 0.8) return BreakthroughType.ENERGETIC;

    // Default to first tendency
    return tendencies[0];
  }

  /**
   * Estimate timeframe for breakthrough
   */
  private estimateTimeframe(
    probability: number,
    readiness: number,
    trajectory: SpiralTrajectory
  ): string {

    const urgency = probability * readiness * trajectory.velocity;

    if (urgency > 0.8) return '1-3 days';
    if (urgency > 0.6) return '1-2 weeks';
    if (urgency > 0.4) return '2-4 weeks';
    if (urgency > 0.2) return '1-3 months';
    return '3+ months';
  }

  /**
   * Identify factors that could trigger breakthrough
   */
  private identifyTriggerFactors(
    indicators: BreakthroughIndicators,
    operation: AlchemicalOperation
  ): string[] {
    const factors: string[] = [];

    if (indicators.synchronicity > 0.6) {
      factors.push('High synchronicity - pay attention to meaningful coincidences');
    }

    if (indicators.dreamActivity > 0.6) {
      factors.push('Increased dream activity - symbolic content is emerging');
    }

    if (indicators.relationshipTension > 0.5) {
      factors.push('Relationship dynamics shifting - projections being withdrawn');
    }

    if (indicators.creativeDrive > 0.6) {
      factors.push('Creative energy building - expression may catalyze breakthrough');
    }

    // Operation-specific triggers
    if (operation === AlchemicalOperation.SOLUTIO && indicators.intensity > 0.7) {
      factors.push('Emotional intensity at peak - release may precipitate insight');
    }

    if (operation === AlchemicalOperation.FERMENTATION && indicators.energyVolatility > 0.6) {
      factors.push('Energy volatility suggests creative breakthrough brewing');
    }

    return factors;
  }

  /**
   * Identify what might be blocking breakthrough
   */
  private identifyBlockers(
    indicators: BreakthroughIndicators,
    trajectory: SpiralTrajectory
  ): string[] {
    const blockers: string[] = [];

    if (indicators.resistanceLevel > 0.7) {
      blockers.push('High resistance - fear or control patterns may be blocking flow');
    }

    if (trajectory.velocity < 0.3) {
      blockers.push('Low spiral velocity - stagnation or avoidance present');
    }

    if (indicators.frequency < 0.3) {
      blockers.push('Low event frequency - insufficient pressure for breakthrough');
    }

    if (indicators.intensity < 0.4 && indicators.energyVolatility < 0.4) {
      blockers.push('Low intensity and volatility - system may be too stable');
    }

    return blockers;
  }

  /**
   * Identify what could accelerate breakthrough
   */
  private identifyAccelerators(
    indicators: BreakthroughIndicators,
    trajectory: SpiralTrajectory
  ): string[] {
    const accelerators: string[] = [];

    if (indicators.creativeDrive > 0.5) {
      accelerators.push('Follow creative impulses - expression can catalyze breakthrough');
    }

    if (indicators.synchronicity > 0.5) {
      accelerators.push('Pay attention to synchronicities - they may guide timing');
    }

    if (trajectory.currentMode === ElementalMode.FIRE) {
      accelerators.push('Fire energy active - vigorous practices may accelerate process');
    }

    if (indicators.dreamActivity > 0.5) {
      accelerators.push('Work with dream content - unconscious material is available');
    }

    accelerators.push('Reduce resistance through surrender practices');
    accelerators.push('Increase energetic pressure through focused intention');

    return accelerators;
  }

  /**
   * Predict next breakthrough date
   */
  private predictNextBreakthrough(probability: number, timeframe: string): Date | null {
    if (probability < 0.3) return null;

    const now = new Date();
    let daysToAdd = 30; // Default

    if (timeframe.includes('1-3 days')) daysToAdd = 2;
    else if (timeframe.includes('1-2 weeks')) daysToAdd = 10;
    else if (timeframe.includes('2-4 weeks')) daysToAdd = 21;
    else if (timeframe.includes('1-3 months')) daysToAdd = 60;
    else daysToAdd = 120;

    const targetDate = new Date(now);
    targetDate.setDate(targetDate.getDate() + daysToAdd);
    return targetDate;
  }

  /**
   * Calculate confidence in prediction
   */
  private calculateConfidence(
    historicalData?: any[],
    indicators?: BreakthroughIndicators
  ): 'low' | 'medium' | 'high' {
    // More data = higher confidence
    if (!historicalData || historicalData.length < 5) return 'low';

    if (historicalData.length > 20 && indicators &&
        (indicators.intensity > 0.6 || indicators.synchronicity > 0.6)) {
      return 'high';
    }

    return 'medium';
  }

  // Additional pattern analysis methods...

  private identifyCurrentPattern(
    trajectory: SpiralTrajectory,
    operation: AlchemicalOperation
  ): SpiralPatternType {
    // Pattern identification logic based on trajectory and operation
    if (trajectory.velocity < 0.3) return SpiralPatternType.CRISIS;
    if (trajectory.inwardness > 0.8) return SpiralPatternType.INTEGRATION;
    if (operation === AlchemicalOperation.CALCINATION) return SpiralPatternType.INITIATION;
    return SpiralPatternType.EXPLORATION; // Default
  }

  private calculatePatternMaturity(trajectory: SpiralTrajectory, history: any[]): number {
    // Calculate how mature/complete the current pattern is
    return trajectory.inwardness; // Simplified
  }

  private calculateCyclePosition(pattern: SpiralPatternType, trajectory: SpiralTrajectory): number {
    // Where in the cycle are we? 0 = beginning, 1 = completion
    return trajectory.velocity; // Simplified
  }

  private measureEmergentComplexity(history: any[]): number {
    // How much new complexity is emerging?
    return Math.min(1, history.length / 20); // Simplified
  }

  private calculateSelfSimilarity(history: any[]): number {
    // How much this pattern repeats at different scales
    return 0.7; // Simplified - would analyze actual patterns
  }

  private measureCoherence(trajectory: SpiralTrajectory): number {
    // How well-organized/coherent is the current pattern?
    return (trajectory.velocity + trajectory.inwardness) / 2;
  }

  private calculateTransitionProbability(
    pattern: SpiralPatternType,
    maturity: number,
    trajectory: SpiralTrajectory
  ): number {
    // Likelihood of transitioning to next pattern phase
    return maturity * trajectory.velocity;
  }
}

export const breakthroughEngine = new BreakthroughTrajectoryEngine();