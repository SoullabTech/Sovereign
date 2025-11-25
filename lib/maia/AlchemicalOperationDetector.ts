/**
 * Alchemical Operation Detector
 * Detects which alchemical operation a member is currently experiencing
 * Based on psychospiritual metrics, elemental states, and spiral trajectory
 */

import { PsychospiritualMetricsEngine } from '../metrics/PsychospiritualMetricsEngine';
import { ElementalMode, SpiralTrajectory } from './SpiralogicOrchestrator';

export enum AlchemicalOperation {
  CALCINATION = 'calcination',     // Burning away the false
  SOLUTIO = 'solutio',             // Dissolution, emotional release
  SEPARATIO = 'separatio',         // Discernment, discrimination
  CONJUNCTIO = 'conjunctio',       // Union, integration
  FERMENTATION = 'fermentation',   // Putrefaction and new life
  DISTILLATION = 'distillation',   // Refinement, purification
  COAGULATION = 'coagulation'      // Crystallization, embodiment
}

export interface AlchemicalStatus {
  currentOperation: AlchemicalOperation;
  operationDescription: string;
  typicalDuration: string;
  progressIndicators: string[];
  whatToExpectNext: string;
  elementalCirculation: {
    currentElement: 'Earth' | 'Water' | 'Fire' | 'Air';
    direction: 'ascending' | 'descending';
    completionPercentage: number;
  };
  emergencePatterns: string[];
  supportingPractices: string[];
}

export interface AlchemicalMetrics {
  volatility: number;          // How much change/chaos
  integration: number;         // How well things are integrating
  shadowActivity: number;      // How active shadow material is
  emotionalIntensity: number;  // Current emotional charge
  phaseStability: number;      // How stable current phase is
  breakthroughProximity: number; // How close to breakthrough
}

export class AlchemicalOperationDetector {
  private metricsEngine: PsychospiritualMetricsEngine;

  constructor(metricsEngine: PsychospiritualMetricsEngine) {
    this.metricsEngine = metricsEngine;
  }

  /**
   * Main detection method - determines current alchemical operation
   */
  detectCurrentOperation(
    userId: string,
    trajectory: SpiralTrajectory
  ): AlchemicalStatus | null {
    const snapshot = this.metricsEngine.generateComprehensiveSnapshot(userId);
    if (!snapshot) return null;

    const metrics = this.extractAlchemicalMetrics(snapshot);
    const operation = this.classifyOperation(metrics, trajectory);

    return this.generateAlchemicalStatus(operation, metrics, trajectory);
  }

  /**
   * Extract relevant metrics for alchemical analysis
   */
  private extractAlchemicalMetrics(snapshot: any): AlchemicalMetrics {
    return {
      volatility: snapshot.emotionalLandscape?.volatilityIndex || 0,
      integration: snapshot.shadowIntegration?.integrationScore || 0,
      shadowActivity: this.calculateShadowActivity(snapshot),
      emotionalIntensity: this.calculateEmotionalIntensity(snapshot),
      phaseStability: this.calculatePhaseStability(snapshot),
      breakthroughProximity: this.calculateBreakthroughProximity(snapshot)
    };
  }

  /**
   * Classify which alchemical operation is currently active
   */
  private classifyOperation(
    metrics: AlchemicalMetrics,
    trajectory: SpiralTrajectory
  ): AlchemicalOperation {
    const { volatility, integration, shadowActivity, emotionalIntensity, phaseStability, breakthroughProximity } = metrics;

    // CALCINATION: High volatility + Fire element + Breaking down patterns
    if (volatility > 0.7 && trajectory.currentMode === ElementalMode.FIRE && integration < 0.4) {
      return AlchemicalOperation.CALCINATION;
    }

    // SOLUTIO: High emotional intensity + Water element + Dissolution
    if (emotionalIntensity > 0.6 && trajectory.currentMode === ElementalMode.WATER && volatility > 0.5) {
      return AlchemicalOperation.SOLUTIO;
    }

    // SEPARATIO: High discernment + Air element + Sorting/organizing
    if (trajectory.currentMode === ElementalMode.AIR && phaseStability > 0.6 && volatility < 0.4) {
      return AlchemicalOperation.SEPARATIO;
    }

    // CONJUNCTIO: Rising integration + Multiple elements active
    if (integration > 0.6 && phaseStability > 0.5 && breakthroughProximity > 0.6) {
      return AlchemicalOperation.CONJUNCTIO;
    }

    // FERMENTATION: Shadow active + Creative emergence + Composting old
    if (shadowActivity > 0.5 && volatility > 0.4 && trajectory.velocity > 0.6) {
      return AlchemicalOperation.FERMENTATION;
    }

    // DISTILLATION: High stability + Refinement + Purification
    if (phaseStability > 0.7 && integration > 0.7 && emotionalIntensity < 0.3) {
      return AlchemicalOperation.DISTILLATION;
    }

    // COAGULATION: High integration + Earth element + Embodying new patterns
    if (integration > 0.8 && trajectory.currentMode === ElementalMode.EARTH && phaseStability > 0.8) {
      return AlchemicalOperation.COAGULATION;
    }

    // Default: Most likely operation based on dominant factors
    if (volatility > 0.5) {
      return emotionalIntensity > volatility ? AlchemicalOperation.SOLUTIO : AlchemicalOperation.CALCINATION;
    }
    if (integration > 0.6) {
      return AlchemicalOperation.CONJUNCTIO;
    }
    return AlchemicalOperation.FERMENTATION; // Default creative/transformative state
  }

  /**
   * Generate comprehensive alchemical status
   */
  private generateAlchemicalStatus(
    operation: AlchemicalOperation,
    metrics: AlchemicalMetrics,
    trajectory: SpiralTrajectory
  ): AlchemicalStatus {
    const operationData = this.getOperationData(operation);
    const circulation = this.calculateElementalCirculation(metrics, trajectory);
    const patterns = this.identifyEmergencePatterns(operation, metrics);
    const practices = this.recommendSupportingPractices(operation, metrics);

    return {
      currentOperation: operation,
      operationDescription: operationData.description,
      typicalDuration: operationData.duration,
      progressIndicators: this.generateProgressIndicators(operation, metrics),
      whatToExpectNext: operationData.nextPhase,
      elementalCirculation: circulation,
      emergencePatterns: patterns,
      supportingPractices: practices
    };
  }

  /**
   * Calculate current elemental circulation
   */
  private calculateElementalCirculation(
    metrics: AlchemicalMetrics,
    trajectory: SpiralTrajectory
  ) {
    const elementMap = {
      [ElementalMode.EARTH]: 'Earth',
      [ElementalMode.WATER]: 'Water',
      [ElementalMode.FIRE]: 'Fire',
      [ElementalMode.AIR]: 'Air',
      [ElementalMode.AETHER]: 'Air' // Aether maps to refined Air
    } as const;

    // Direction based on inwardness trend
    const direction = trajectory.inwardness > 0.5 ? 'ascending' : 'descending';

    // Completion based on phase stability and integration
    const completionPercentage = Math.round(
      ((metrics.phaseStability + metrics.integration) / 2) * 100
    );

    return {
      currentElement: elementMap[trajectory.currentMode],
      direction,
      completionPercentage: Math.min(95, Math.max(5, completionPercentage))
    };
  }

  /**
   * Calculate shadow activity level
   */
  private calculateShadowActivity(snapshot: any): number {
    const shadowWork = snapshot.shadowIntegration?.shadowWorkFrequency || 0;
    const suppressedArchetypes = snapshot.shadowIntegration?.suppressedArchetypes?.length || 0;
    const volatility = snapshot.emotionalLandscape?.volatilityIndex || 0;

    return Math.min(1, (shadowWork * 0.4 + suppressedArchetypes * 0.1 + volatility * 0.5));
  }

  /**
   * Calculate emotional intensity
   */
  private calculateEmotionalIntensity(snapshot: any): number {
    const volatility = snapshot.emotionalLandscape?.volatilityIndex || 0;
    const drift = snapshot.emotionalLandscape?.emotionalDrift || 0;

    return Math.min(1, (volatility * 0.7 + drift * 0.3));
  }

  /**
   * Calculate phase stability
   */
  private calculatePhaseStability(snapshot: any): number {
    return snapshot.spiralogicPhase?.phaseCompletionQuality || 0.5;
  }

  /**
   * Calculate breakthrough proximity
   */
  private calculateBreakthroughProximity(snapshot: any): number {
    const growthVelocity = snapshot.growthIndex?.growthVelocity || 0;
    const integration = snapshot.shadowIntegration?.integrationScore || 0;
    const phaseCompletion = snapshot.spiralogicPhase?.phaseCompletionQuality || 0;

    return (growthVelocity * 0.3 + integration * 0.4 + phaseCompletion * 0.3);
  }

  /**
   * Get operation-specific data
   */
  private getOperationData(operation: AlchemicalOperation) {
    const operationMap = {
      [AlchemicalOperation.CALCINATION]: {
        description: "You're in a burning away phase where false patterns and outdated structures are being dissolved through the fire of awareness.",
        duration: "2-4 weeks",
        nextPhase: "This intensity will give way to a more fluid, emotional processing phase (Solutio)"
      },
      [AlchemicalOperation.SOLUTIO]: {
        description: "You're in a dissolving phase where emotions flow freely and old wounds surface to be cleansed and released.",
        duration: "3-6 weeks",
        nextPhase: "You'll move into a discrimination phase where you'll sort what to keep and what to release (Separatio)"
      },
      [AlchemicalOperation.SEPARATIO]: {
        description: "You're in a discernment phase where you're sorting through insights, separating what serves from what doesn't.",
        duration: "2-3 weeks",
        nextPhase: "The pieces you've sorted will begin to recombine in new, more integrated ways (Conjunctio)"
      },
      [AlchemicalOperation.CONJUNCTIO]: {
        description: "You're in a sacred union phase where previously separated aspects of yourself are integrating into greater wholeness.",
        duration: "1-3 weeks",
        nextPhase: "This integration will then ferment into new creative possibilities (Fermentation)"
      },
      [AlchemicalOperation.FERMENTATION]: {
        description: "You're in a creative fermentation phase where new possibilities are bubbling up from the compost of old patterns.",
        duration: "3-8 weeks",
        nextPhase: "This creative chaos will refine into clearer vision and purpose (Distillation)"
      },
      [AlchemicalOperation.DISTILLATION]: {
        description: "You're in a refinement phase where the essence of your growth is being distilled into wisdom and clarity.",
        duration: "2-4 weeks",
        nextPhase: "This refined essence will crystallize into new embodied ways of being (Coagulation)"
      },
      [AlchemicalOperation.COAGULATION]: {
        description: "You're in an embodiment phase where insights and growth are crystallizing into new, stable patterns in your life.",
        duration: "4-12 weeks",
        nextPhase: "Once this integration is complete, a new cycle of burning away will begin (Calcination)"
      }
    };

    return operationMap[operation];
  }

  /**
   * Generate progress indicators for current operation
   */
  private generateProgressIndicators(operation: AlchemicalOperation, metrics: AlchemicalMetrics): string[] {
    const baseIndicators = {
      [AlchemicalOperation.CALCINATION]: [
        `Volatility level: ${Math.round(metrics.volatility * 100)}%`,
        "Old patterns breaking down",
        "Increased sensitivity to what's not working"
      ],
      [AlchemicalOperation.SOLUTIO]: [
        `Emotional intensity: ${Math.round(metrics.emotionalIntensity * 100)}%`,
        "Emotions flowing more freely",
        "Past memories and feelings surfacing"
      ],
      [AlchemicalOperation.SEPARATIO]: [
        `Phase stability: ${Math.round(metrics.phaseStability * 100)}%`,
        "Increased clarity and discernment",
        "Sorting through insights and realizations"
      ],
      [AlchemicalOperation.CONJUNCTIO]: [
        `Integration score: ${Math.round(metrics.integration * 100)}%`,
        "Different aspects of self coming together",
        "Feeling more whole and unified"
      ],
      [AlchemicalOperation.FERMENTATION]: [
        `Shadow activity: ${Math.round(metrics.shadowActivity * 100)}%`,
        "Creative ideas bubbling up",
        "Unexpected insights and connections"
      ],
      [AlchemicalOperation.DISTILLATION]: [
        `Clarity increasing`,
        "Essence being refined",
        "Greater focus and purpose"
      ],
      [AlchemicalOperation.COAGULATION]: [
        `Integration: ${Math.round(metrics.integration * 100)}%`,
        "New patterns stabilizing",
        "Growth becoming embodied"
      ]
    };

    return baseIndicators[operation];
  }

  /**
   * Identify emergence patterns for current operation
   */
  private identifyEmergencePatterns(operation: AlchemicalOperation, metrics: AlchemicalMetrics): string[] {
    // Pattern recognition based on operation type and metrics
    const patterns: string[] = [];

    if (metrics.volatility > 0.6) {
      patterns.push("Rapid dissolution of old structures creating space for emergence");
    }
    if (metrics.breakthroughProximity > 0.7) {
      patterns.push("Breakthrough momentum building - major shift approaching");
    }
    if (metrics.shadowActivity > 0.5) {
      patterns.push("Previously unconscious material becoming available for integration");
    }
    if (metrics.integration > 0.6) {
      patterns.push("Separated aspects beginning to weave together into new coherence");
    }

    return patterns.length > 0 ? patterns : ["Natural cyclical transformation unfolding"];
  }

  /**
   * Recommend supporting practices for current operation
   */
  private recommendSupportingPractices(operation: AlchemicalOperation, metrics: AlchemicalMetrics): string[] {
    const practiceMap = {
      [AlchemicalOperation.CALCINATION]: [
        "Fire-based practices: vigorous movement, breathwork",
        "Release rituals: writing and burning what no longer serves",
        "Physical expression of intensity through exercise or dance"
      ],
      [AlchemicalOperation.SOLUTIO]: [
        "Water-based practices: baths, swimming, tears",
        "Emotional processing: journaling, therapy, sharing",
        "Flow states: creative expression, music, movement"
      ],
      [AlchemicalOperation.SEPARATIO]: [
        "Air-based practices: meditation, breath work",
        "Mental clarity: organizing thoughts, list-making",
        "Discernment practices: decision-making, boundary-setting"
      ],
      [AlchemicalOperation.CONJUNCTIO]: [
        "Integration practices: dreamwork, active imagination",
        "Relationship work: connecting with others authentically",
        "Synthesis: bringing together disparate parts of life"
      ],
      [AlchemicalOperation.FERMENTATION]: [
        "Creative practices: art, writing, innovation",
        "Patience with the process: allowing things to unfold",
        "Shadow work: exploring what's been rejected or hidden"
      ],
      [AlchemicalOperation.DISTILLATION]: [
        "Refinement practices: editing, simplifying, focusing",
        "Essence work: identifying core values and purposes",
        "Purification: removing distractions and non-essentials"
      ],
      [AlchemicalOperation.COAGULATION]: [
        "Earth-based practices: grounding, stability, routine",
        "Embodiment: bringing insights into daily life",
        "Manifestation: creating concrete results from inner work"
      ]
    };

    return practiceMap[operation];
  }
}

export const alchemicalDetector = new AlchemicalOperationDetector(new PsychospiritualMetricsEngine());