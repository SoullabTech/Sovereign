/**
 * Neuropod Safety Predictor
 *
 * Predicts overwhelm BEFORE it becomes subjectively distressing using topological
 * defect metrics and field geometry from Andres Gomez Emilsson's research.
 *
 * Key insight: Overwhelm is not just "too much intensity" - it's when the
 * consciousness field is fragmenting faster than it can integrate (defects
 * proliferating faster than they annihilate).
 *
 * Distinguishes:
 * - Good intensity: High coherence, low defects (e.g., 5-MeO-DMT unity)
 * - Overwhelm: Fragmented field, high defects (e.g., too much DMT too fast)
 *
 * Based on:
 * - Topological defect theory
 * - Psychedelic thermodynamics
 * - Field shear stress (Symmetry Theory of Valence)
 */

import type { CoherenceSnapshot } from './coherenceTracker';

// ============================================================================
// Types
// ============================================================================

export interface OverwhelmPrediction {
  riskScore: number; // 0-1 (0 = safe, 1 = imminent overwhelm)
  timeToOverwhelm: number | null; // Seconds until predicted overwhelm (null if safe)
  recommendation: 'proceed' | 'reduce_intensity' | 'pause' | 'stop';
  reasoning: string[];
  interventionSuggested: EmergencyInterventionType | null;
}

export type EmergencyInterventionType =
  | 'gentle_fade' // Reduce intensity over 60s
  | 'immediate_calm' // Jump to CALM state
  | 'emergency_stop'; // Stop session entirely

export interface SafetyThresholds {
  // Topological
  maxDefectDensity: number; // Defects per unit area
  minAnnihilationRate: number; // Hz (must be resolving faster than creating)
  maxDefectAcceleration: number; // Change in defect count per second^2

  // Field geometry
  minFieldAlignment: number; // Below this = sheared field = pain
  maxShearStress: number; // Above this = overwhelm

  // Thermodynamic
  maxTemperatureGradient: number; // Rate of heating (per minute)
  minFreeEnergy: number; // Below this = system too constrained

  // Coherence
  minGlobalSynchrony: number; // Below this = fragmented
  maxCoherenceVariance: number; // Too much oscillation = unstable

  // Temporal
  maxTimeDilationFactor: number; // Phenomenal time running too fast
}

export const DEFAULT_SAFETY_THRESHOLDS: SafetyThresholds = {
  // Topological (calibrated from QRI 5-MeO-DMT research)
  maxDefectDensity: 0.3, // 30% of field has defects
  minAnnihilationRate: 0.1, // At least 10% defects resolving per second
  maxDefectAcceleration: 0.5, // Defects accelerating > 0.5/s² = bad

  // Field geometry
  minFieldAlignment: 0.3, // Below 30% alignment = suffering
  maxShearStress: 0.7, // Above 70% shear = overwhelm

  // Thermodynamic
  maxTemperatureGradient: 0.15, // No more than 0.15 temp units/minute
  minFreeEnergy: -0.5, // System shouldn't be too constrained

  // Coherence
  minGlobalSynchrony: 0.2, // Below 20% = too fragmented
  maxCoherenceVariance: 0.3, // Coherence shouldn't oscillate > ±0.3

  // Temporal
  maxTimeDilationFactor: 5.0, // 5x speedup is safe limit
};

export interface SafetyHistory {
  snapshots: CoherenceSnapshot[];
  predictions: OverwhelmPrediction[];
  interventions: SafetyIntervention[];
}

export interface SafetyIntervention {
  timestamp: number;
  type: EmergencyInterventionType;
  reason: string;
  preInterventionRisk: number;
  successful: boolean;
}

// ============================================================================
// Safety Predictor Class
// ============================================================================

export class SafetyPredictor {
  private thresholds: SafetyThresholds;
  private history: SafetyHistory;

  constructor(thresholds: Partial<SafetyThresholds> = {}) {
    this.thresholds = { ...DEFAULT_SAFETY_THRESHOLDS, ...thresholds };
    this.history = {
      snapshots: [],
      predictions: [],
      interventions: [],
    };
  }

  /**
   * Main prediction function: analyze coherence snapshot and predict overwhelm
   */
  predictOverwhelm(snapshot: CoherenceSnapshot): OverwhelmPrediction {
    this.history.snapshots.push(snapshot);

    // Keep history limited to last 60 snapshots (~1 minute at 1 Hz)
    if (this.history.snapshots.length > 60) {
      this.history.snapshots.shift();
    }

    const reasoning: string[] = [];
    let riskScore = 0;
    let interventionSuggested: EmergencyInterventionType | null = null;

    // 1. Topological Risk Assessment
    const topologicalRisk = this.assessTopologicalRisk(snapshot, reasoning);
    riskScore += topologicalRisk * 0.4; // 40% weight

    // 2. Field Geometry Risk
    const geometryRisk = this.assessGeometryRisk(snapshot, reasoning);
    riskScore += geometryRisk * 0.3; // 30% weight

    // 3. Thermodynamic Risk
    const thermodynamicRisk = this.assessThermodynamicRisk(snapshot, reasoning);
    riskScore += thermodynamicRisk * 0.2; // 20% weight

    // 4. Coherence Stability Risk
    const coherenceRisk = this.assessCoherenceRisk(snapshot, reasoning);
    riskScore += coherenceRisk * 0.1; // 10% weight

    // Clamp to 0-1
    riskScore = Math.max(0, Math.min(1, riskScore));

    // Estimate time to overwhelm (if trending)
    const timeToOverwhelm = this.estimateTimeToOverwhelm(riskScore);

    // Determine recommendation
    let recommendation: OverwhelmPrediction['recommendation'];

    if (riskScore < 0.3) {
      recommendation = 'proceed';
    } else if (riskScore < 0.6) {
      recommendation = 'reduce_intensity';
      interventionSuggested = 'gentle_fade';
    } else if (riskScore < 0.85) {
      recommendation = 'pause';
      interventionSuggested = 'immediate_calm';
    } else {
      recommendation = 'stop';
      interventionSuggested = 'emergency_stop';
    }

    const prediction: OverwhelmPrediction = {
      riskScore,
      timeToOverwhelm,
      recommendation,
      reasoning,
      interventionSuggested,
    };

    this.history.predictions.push(prediction);

    return prediction;
  }

  /**
   * Assess topological risk (defect proliferation)
   */
  private assessTopologicalRisk(snapshot: CoherenceSnapshot, reasoning: string[]): number {
    const topo = snapshot.topological;
    let risk = 0;

    // 1. Defect density
    if (topo.defectDensity > this.thresholds.maxDefectDensity) {
      const excess = (topo.defectDensity - this.thresholds.maxDefectDensity) / this.thresholds.maxDefectDensity;
      risk += Math.min(0.5, excess * 0.5); // Up to 50% risk
      reasoning.push(
        `⚠️ Topological defect density high: ${(topo.defectDensity * 100).toFixed(0)}% (threshold: ${(this.thresholds.maxDefectDensity * 100).toFixed(0)}%)`
      );
    }

    // 2. Annihilation rate (critical: are defects resolving?)
    if (topo.defectAnnihilationRate < this.thresholds.minAnnihilationRate) {
      risk += 0.3; // 30% risk if defects not resolving
      reasoning.push(
        `❌ Defects not annihilating fast enough: ${topo.defectAnnihilationRate.toFixed(2)} Hz (need: ${this.thresholds.minAnnihilationRate} Hz)`
      );
    }

    // 3. Defect acceleration (are they proliferating?)
    if (this.history.snapshots.length >= 5) {
      const acceleration = this.calculateDefectAcceleration();
      if (acceleration > this.thresholds.maxDefectAcceleration) {
        risk += 0.4; // 40% risk if accelerating
        reasoning.push(
          `🚨 Defects proliferating: acceleration ${acceleration.toFixed(2)}/s² (threshold: ${this.thresholds.maxDefectAcceleration}/s²)`
        );
      }
    }

    return Math.min(1, risk);
  }

  /**
   * Calculate second derivative of defect count (acceleration)
   */
  private calculateDefectAcceleration(): number {
    const recent = this.history.snapshots.slice(-5);
    if (recent.length < 3) return 0;

    // Simple numerical differentiation
    const counts = recent.map((s) => s.topological.phaseVortexCount);
    const dt = 1; // Assume 1 second between snapshots

    // First derivative (velocity)
    const velocities = [];
    for (let i = 1; i < counts.length; i++) {
      velocities.push((counts[i] - counts[i - 1]) / dt);
    }

    // Second derivative (acceleration)
    const accelerations = [];
    for (let i = 1; i < velocities.length; i++) {
      accelerations.push((velocities[i] - velocities[i - 1]) / dt);
    }

    // Return most recent acceleration
    return accelerations[accelerations.length - 1] || 0;
  }

  /**
   * Assess field geometry risk (Symmetry Theory of Valence)
   */
  private assessGeometryRisk(snapshot: CoherenceSnapshot, reasoning: string[]): number {
    const topo = snapshot.topological;
    let risk = 0;

    // 1. Field alignment (low = sheared field = suffering)
    if (topo.fieldAlignmentScore < this.thresholds.minFieldAlignment) {
      const deficit = (this.thresholds.minFieldAlignment - topo.fieldAlignmentScore) / this.thresholds.minFieldAlignment;
      risk += Math.min(0.6, deficit * 0.6); // Up to 60% risk
      reasoning.push(
        `😣 Field lines sheared (suffering): alignment ${(topo.fieldAlignmentScore * 100).toFixed(0)}% (need: ${(this.thresholds.minFieldAlignment * 100).toFixed(0)}%)`
      );
    }

    // 2. Shear stress (high = overwhelm)
    if (topo.fieldShearStress > this.thresholds.maxShearStress) {
      const excess = (topo.fieldShearStress - this.thresholds.maxShearStress) / (1 - this.thresholds.maxShearStress);
      risk += Math.min(0.5, excess * 0.5); // Up to 50% risk
      reasoning.push(
        `🌀 Field shear stress high: ${(topo.fieldShearStress * 100).toFixed(0)}% (threshold: ${(this.thresholds.maxShearStress * 100).toFixed(0)}%)`
      );
    }

    return Math.min(1, risk);
  }

  /**
   * Assess thermodynamic risk (heating too fast, free energy)
   */
  private assessThermodynamicRisk(snapshot: CoherenceSnapshot, reasoning: string[]): number {
    const thermo = snapshot.thermodynamic;
    let risk = 0;

    // 1. Temperature gradient (thermal shock)
    if (this.history.snapshots.length >= 2) {
      const gradient = this.calculateTemperatureGradient();
      if (gradient > this.thresholds.maxTemperatureGradient) {
        risk += 0.5; // 50% risk for thermal shock
        reasoning.push(
          `🔥 Heating too rapidly: ${gradient.toFixed(3)}/min (threshold: ${this.thresholds.maxTemperatureGradient}/min) - THERMAL SHOCK`
        );
      }
    }

    // 2. Free energy (too constrained)
    if (thermo.freeEnergyEstimate < this.thresholds.minFreeEnergy) {
      risk += 0.3; // 30% risk if system too constrained
      reasoning.push(
        `⚡ Free energy too low: ${thermo.freeEnergyEstimate.toFixed(2)} (threshold: ${this.thresholds.minFreeEnergy}) - system overly constrained`
      );
    }

    return Math.min(1, risk);
  }

  /**
   * Calculate temperature gradient (rate of change per minute)
   */
  private calculateTemperatureGradient(): number {
    if (this.history.snapshots.length < 2) return 0;

    const current = this.history.snapshots[this.history.snapshots.length - 1];
    const previous = this.history.snapshots[this.history.snapshots.length - 2];

    const dt = (current.timestamp - previous.timestamp) / 1000 / 60; // Convert to minutes
    const dT = current.thermodynamic.consciousnessTemperature - previous.thermodynamic.consciousnessTemperature;

    return dT / dt;
  }

  /**
   * Assess coherence stability risk
   */
  private assessCoherenceRisk(snapshot: CoherenceSnapshot, reasoning: string[]): number {
    const phase = snapshot.phaseCoupling;
    let risk = 0;

    // 1. Global synchrony too low (fragmented)
    if (phase.globalSynchrony < this.thresholds.minGlobalSynchrony) {
      const deficit = (this.thresholds.minGlobalSynchrony - phase.globalSynchrony) / this.thresholds.minGlobalSynchrony;
      risk += Math.min(0.4, deficit * 0.4); // Up to 40% risk
      reasoning.push(
        `🔀 Global synchrony low: ${(phase.globalSynchrony * 100).toFixed(0)}% (threshold: ${(this.thresholds.minGlobalSynchrony * 100).toFixed(0)}%) - field fragmented`
      );
    }

    // 2. Coherence variance (too unstable)
    if (this.history.snapshots.length >= 10) {
      const variance = this.calculateCoherenceVariance();
      if (variance > this.thresholds.maxCoherenceVariance) {
        risk += 0.3; // 30% risk for instability
        reasoning.push(
          `📊 Coherence unstable: variance ${variance.toFixed(2)} (threshold: ${this.thresholds.maxCoherenceVariance})`
        );
      }
    }

    return Math.min(1, risk);
  }

  /**
   * Calculate variance in global synchrony over recent history
   */
  private calculateCoherenceVariance(): number {
    const recent = this.history.snapshots.slice(-10);
    const values = recent.map((s) => s.phaseCoupling.globalSynchrony);

    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;

    return Math.sqrt(variance); // Return standard deviation
  }

  /**
   * Estimate time to overwhelm (extrapolation)
   */
  private estimateTimeToOverwhelm(currentRisk: number): number | null {
    if (currentRisk < 0.3 || this.history.predictions.length < 5) {
      return null; // Safe or not enough data
    }

    // Linear extrapolation of risk trajectory
    const recentPredictions = this.history.predictions.slice(-5);
    const risks = recentPredictions.map((p) => p.riskScore);

    // Calculate rate of change
    let sumDelta = 0;
    for (let i = 1; i < risks.length; i++) {
      sumDelta += risks[i] - risks[i - 1];
    }
    const avgRateOfChange = sumDelta / (risks.length - 1);

    if (avgRateOfChange <= 0) {
      return null; // Risk is stable or decreasing
    }

    // Time to reach 1.0 (overwhelm)
    const timeToOverwhelm = (1.0 - currentRisk) / avgRateOfChange;

    // Convert to seconds (assuming 1 prediction per second)
    return Math.max(0, timeToOverwhelm);
  }

  /**
   * Record intervention
   */
  recordIntervention(
    type: EmergencyInterventionType,
    reason: string,
    preInterventionRisk: number
  ): void {
    this.history.interventions.push({
      timestamp: Date.now(),
      type,
      reason,
      preInterventionRisk,
      successful: false, // Will be updated later
    });
  }

  /**
   * Mark intervention as successful
   */
  markInterventionSuccessful(): void {
    const lastIntervention = this.history.interventions[this.history.interventions.length - 1];
    if (lastIntervention) {
      lastIntervention.successful = true;
    }
  }

  /**
   * Get safety analytics for session review
   */
  getSafetyAnalytics(): {
    totalPredictions: number;
    avgRiskScore: number;
    maxRiskScore: number;
    interventionCount: number;
    successfulInterventions: number;
    riskTrajectory: { time: number; risk: number }[];
  } {
    const predictions = this.history.predictions;
    const interventions = this.history.interventions;

    const avgRisk = predictions.reduce((sum, p) => sum + p.riskScore, 0) / predictions.length || 0;
    const maxRisk = Math.max(...predictions.map((p) => p.riskScore), 0);

    const riskTrajectory = predictions.map((p, i) => ({
      time: i, // Simplified: index as proxy for time
      risk: p.riskScore,
    }));

    return {
      totalPredictions: predictions.length,
      avgRiskScore: avgRisk,
      maxRiskScore: maxRisk,
      interventionCount: interventions.length,
      successfulInterventions: interventions.filter((i) => i.successful).length,
      riskTrajectory,
    };
  }

  /**
   * Reset history (for new session)
   */
  reset(): void {
    this.history = {
      snapshots: [],
      predictions: [],
      interventions: [],
    };
  }
}

// ============================================================================
// Export
// ============================================================================

export const safetyPredictor = new SafetyPredictor();
