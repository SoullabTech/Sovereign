/**
 * Neuropod Coherence Tracker
 *
 * Implements coupled oscillator mathematics from Andres Gomez Emilsson (QRI)
 * to track consciousness coherence, topological defects, and thermodynamic state.
 *
 * Based on research:
 * - Coupled oscillator models of consciousness
 * - Topological defect theory (5-MeO-DMT phenomenology)
 * - Psychedelic thermodynamics
 * - Symmetry Theory of Valence
 *
 * References:
 * - https://qualiacomputing.com/
 * - https://opentheory.net/2019/11/neural-annealing/
 * - https://opentheory.net/2017/04/folding-fields/
 */

import { Complex, fft, ifft } from 'fft-js';

// ============================================================================
// Types
// ============================================================================

export interface EEGChannelData {
  channel: string; // 'Fp1', 'Fp2', 'C3', 'C4', 'O1', 'O2', etc.
  timeseries: number[]; // Voltage samples
  samplingRate: number; // Hz (e.g., 256 Hz)
}

export interface EEGBandPowers {
  delta: number; // 0.5-4 Hz
  theta: number; // 4-8 Hz
  alpha: number; // 8-13 Hz
  beta: number; // 13-30 Hz
  gamma: number; // 30-100 Hz
}

export interface PhaseCouplingMetrics {
  frontalParietalCoherence: number; // 0-1
  leftRightHemisphereSync: number; // 0-1
  corticalSubcorticalCoupling: number; // 0-1
  alphaThetaPhaseLock: number; // 0-1 (cross-frequency)
  globalSynchrony: number; // 0-1 (overall)
}

export interface TopologicalMetrics {
  phaseVortexCount: number; // Number of defects
  defectDensity: number; // Per unit area
  defectAnnihilationRate: number; // Hz
  fieldAlignmentScore: number; // 0-1 (1 = perfect alignment = bliss)
  fieldShearStress: number; // 0-1 (high = suffering)
}

export interface ThermodynamicMetrics {
  eegSpectralEntropy: number; // Disorder in spectrum
  freeEnergyEstimate: number; // Variational free energy
  consciousnessTemperature: number; // Metaphorical "heat"
  attractorStrength: number; // Pull toward target state
}

export interface TemporalMetrics {
  tracerLengthEstimate: number; // Seconds (working memory depth)
  timeDilationFactor: number; // Phenomenal/physical ratio
  timeLoopDetected: boolean; // Repetitive cycling
}

export interface ValenceMetrics {
  predictedValence: number; // -1 (pain) to +1 (pleasure)
  coherentBliss: number; // Synchrony → positive
  dissonantStress: number; // Anti-phase → negative
}

export interface CoherenceSnapshot {
  timestamp: number; // Unix timestamp
  elapsedSeconds: number; // Relative to session start
  phaseCoupling: PhaseCouplingMetrics;
  topological: TopologicalMetrics;
  thermodynamic: ThermodynamicMetrics;
  temporal: TemporalMetrics;
  valence: ValenceMetrics;
}

// ============================================================================
// Coherence Tracker Class
// ============================================================================

export class CoherenceTracker {
  private sessionStartTime: number;
  private previousSnapshot: CoherenceSnapshot | null = null;
  private phaseHistory: number[][] = []; // For time loop detection

  constructor(sessionStartTime?: number) {
    this.sessionStartTime = sessionStartTime || Date.now();
  }

  /**
   * Main entry point: compute all coherence metrics from multi-channel EEG
   */
  computeCoherence(eegData: EEGChannelData[]): CoherenceSnapshot {
    const now = Date.now();
    const elapsed = (now - this.sessionStartTime) / 1000;

    // 1. Extract phase information from each channel
    const phaseData = eegData.map((ch) => this.extractPhase(ch));

    // 2. Compute phase coupling metrics
    const phaseCoupling = this.computePhaseCoupling(phaseData, eegData);

    // 3. Compute topological defects
    const topological = this.computeTopologicalMetrics(phaseData);

    // 4. Compute thermodynamic state
    const thermodynamic = this.computeThermodynamicMetrics(eegData, phaseCoupling);

    // 5. Compute temporal phenomenology
    const temporal = this.computeTemporalMetrics(eegData, phaseData);

    // 6. Compute predicted valence
    const valence = this.computeValenceMetrics(phaseCoupling, topological);

    const snapshot: CoherenceSnapshot = {
      timestamp: now,
      elapsedSeconds: elapsed,
      phaseCoupling,
      topological,
      thermodynamic,
      temporal,
      valence,
    };

    this.previousSnapshot = snapshot;
    this.phaseHistory.push(phaseData.map((p) => p.instantaneousPhase));

    // Keep history limited
    if (this.phaseHistory.length > 100) {
      this.phaseHistory.shift();
    }

    return snapshot;
  }

  // ==========================================================================
  // Phase Extraction (Hilbert Transform)
  // ==========================================================================

  private extractPhase(channel: EEGChannelData): {
    channel: string;
    instantaneousPhase: number;
    phaseTimeseries: number[];
    amplitude: number;
  } {
    // Use analytic signal (Hilbert transform) to extract instantaneous phase
    const analytic = this.hilbertTransform(channel.timeseries);
    const phases = analytic.map((c) => Math.atan2(c.im, c.re));
    const amplitudes = analytic.map((c) => Math.sqrt(c.re * c.re + c.im * c.im));

    return {
      channel: channel.channel,
      instantaneousPhase: phases[phases.length - 1], // Most recent
      phaseTimeseries: phases,
      amplitude: amplitudes[amplitudes.length - 1],
    };
  }

  /**
   * Hilbert transform via FFT
   * Returns analytic signal: x(t) + i·H[x(t)]
   */
  private hilbertTransform(signal: number[]): Complex[] {
    const n = signal.length;

    // 1. FFT of signal
    const spectrum = fft(signal.map((x) => [x, 0] as [number, number]));

    // 2. Zero out negative frequencies (classic Hilbert transform)
    for (let i = Math.floor(n / 2) + 1; i < n; i++) {
      spectrum[i] = [0, 0];
    }

    // Double positive frequencies (except DC and Nyquist)
    for (let i = 1; i < Math.floor(n / 2); i++) {
      spectrum[i][0] *= 2;
      spectrum[i][1] *= 2;
    }

    // 3. IFFT to get analytic signal
    const analytic = ifft(spectrum);

    return analytic.map((c) => ({ re: c[0], im: c[1] }));
  }

  // ==========================================================================
  // Phase Coupling Metrics
  // ==========================================================================

  private computePhaseCoupling(
    phaseData: ReturnType<typeof this.extractPhase>[],
    eegData: EEGChannelData[]
  ): PhaseCouplingMetrics {
    // Map channel names to data
    const channelMap = new Map(phaseData.map((p) => [p.channel, p]));

    // Frontal-Parietal coherence (attention/integration)
    const frontalParietalCoherence = this.computeCoherence(
      channelMap.get('Fp1')?.phaseTimeseries || [],
      channelMap.get('O1')?.phaseTimeseries || [] // Using occipital as proxy for parietal
    );

    // Left-Right hemisphere sync
    const leftRightHemisphereSync = this.computeCoherence(
      channelMap.get('C3')?.phaseTimeseries || [],
      channelMap.get('C4')?.phaseTimeseries || []
    );

    // Cortical-subcortical (simplified: just using variance as proxy)
    const corticalSubcorticalCoupling = 0.5; // TODO: Need deeper EEG or fMRI data

    // Alpha-theta cross-frequency phase locking
    const alphaThetaPhaseLock = this.computeCrossFrequencyPhaseLock(eegData);

    // Global synchrony: average of all pairwise coherences
    const globalSynchrony = this.computeGlobalSynchrony(phaseData);

    return {
      frontalParietalCoherence,
      leftRightHemisphereSync,
      corticalSubcorticalCoupling,
      alphaThetaPhaseLock,
      globalSynchrony,
    };
  }

  /**
   * Phase coherence between two timeseries
   * Returns 0-1 (1 = perfectly phase-locked)
   */
  private computeCoherence(phase1: number[], phase2: number[]): number {
    if (phase1.length === 0 || phase2.length === 0) return 0;

    const n = Math.min(phase1.length, phase2.length);
    let sumCos = 0;
    let sumSin = 0;

    for (let i = 0; i < n; i++) {
      const phaseDiff = phase1[i] - phase2[i];
      sumCos += Math.cos(phaseDiff);
      sumSin += Math.sin(phaseDiff);
    }

    // Phase Locking Value (PLV)
    const plv = Math.sqrt((sumCos * sumCos + sumSin * sumSin) / (n * n));
    return plv;
  }

  /**
   * Cross-frequency phase locking (alpha-theta coupling)
   */
  private computeCrossFrequencyPhaseLock(eegData: EEGChannelData[]): number {
    // Simplified: just check if alpha and theta are in phase
    // TODO: Proper n:m phase locking analysis
    return 0.5; // Placeholder
  }

  /**
   * Global synchrony: how synchronized is the entire brain?
   * Andres: 5-MeO-DMT → global synchrony approaches 1.0
   */
  private computeGlobalSynchrony(phaseData: ReturnType<typeof this.extractPhase>[]): number {
    if (phaseData.length < 2) return 0;

    // Compute all pairwise coherences, then average
    let sum = 0;
    let count = 0;

    for (let i = 0; i < phaseData.length; i++) {
      for (let j = i + 1; j < phaseData.length; j++) {
        const coherence = this.computeCoherence(
          phaseData[i].phaseTimeseries,
          phaseData[j].phaseTimeseries
        );
        sum += coherence;
        count++;
      }
    }

    return count > 0 ? sum / count : 0;
  }

  // ==========================================================================
  // Topological Defect Detection
  // ==========================================================================

  /**
   * Detect topological defects (phase vortices / pinwheels)
   *
   * Andres's phenomenology:
   * - 5-MeO-DMT: defects appear, then annihilate → unity
   * - DMT: defects proliferate fractally
   */
  private computeTopologicalMetrics(
    phaseData: ReturnType<typeof this.extractPhase>[]
  ): TopologicalMetrics {
    // Construct 2D phase field (simplified: use spatial layout of electrodes)
    const phaseField = this.constructPhaseField(phaseData);

    // Count vortices (points where phase wraps around 2π)
    const phaseVortexCount = this.countPhaseVortices(phaseField);

    // Density
    const area = phaseField.length * phaseField[0].length;
    const defectDensity = phaseVortexCount / area;

    // Annihilation rate (change in defect count over time)
    const defectAnnihilationRate = this.previousSnapshot
      ? (this.previousSnapshot.topological.phaseVortexCount - phaseVortexCount) /
        (Date.now() - this.previousSnapshot.timestamp) *
        1000 // Convert to Hz
      : 0;

    // Field alignment (how parallel are gradient vectors?)
    const fieldAlignmentScore = this.computeFieldAlignment(phaseField);

    // Shear stress (perpendicular forces)
    const fieldShearStress = 1 - fieldAlignmentScore; // Inverse of alignment

    return {
      phaseVortexCount,
      defectDensity,
      defectAnnihilationRate,
      fieldAlignmentScore,
      fieldShearStress,
    };
  }

  /**
   * Construct 2D phase field from electrode positions
   * Simplified: arrange electrodes in grid
   */
  private constructPhaseField(phaseData: ReturnType<typeof this.extractPhase>[]): number[][] {
    // Simplified 3x3 grid layout (real implementation would use actual electrode positions)
    // Fp1  Fp2
    // C3   Cz   C4
    // O1   Oz   O2

    const channelMap = new Map(phaseData.map((p) => [p.channel, p.instantaneousPhase]));

    const grid = [
      [channelMap.get('Fp1') || 0, channelMap.get('Fp2') || 0],
      [channelMap.get('C3') || 0, channelMap.get('Cz') || 0, channelMap.get('C4') || 0],
      [channelMap.get('O1') || 0, channelMap.get('Oz') || 0, channelMap.get('O2') || 0],
    ];

    return grid;
  }

  /**
   * Count phase vortices (topological defects)
   * A vortex is where phase winds around by 2π when circling a point
   */
  private countPhaseVortices(phaseField: number[][]): number {
    let vortexCount = 0;

    for (let i = 0; i < phaseField.length - 1; i++) {
      for (let j = 0; j < phaseField[i].length - 1; j++) {
        // Check 2x2 plaquette
        const phases = [
          phaseField[i][j],
          phaseField[i][j + 1],
          phaseField[i + 1][j + 1],
          phaseField[i + 1][j],
        ];

        // Compute winding number
        let totalWinding = 0;
        for (let k = 0; k < 4; k++) {
          const dPhi = this.phaseDifference(phases[k], phases[(k + 1) % 4]);
          totalWinding += dPhi;
        }

        // If total winding ≈ ±2π, there's a vortex
        if (Math.abs(totalWinding) > Math.PI) {
          vortexCount++;
        }
      }
    }

    return vortexCount;
  }

  /**
   * Phase difference accounting for wraparound
   */
  private phaseDifference(phi1: number, phi2: number): number {
    let diff = phi2 - phi1;
    // Wrap to [-π, π]
    while (diff > Math.PI) diff -= 2 * Math.PI;
    while (diff < -Math.PI) diff += 2 * Math.PI;
    return diff;
  }

  /**
   * Field alignment score (Symmetry Theory of Valence)
   * High alignment = bliss, low alignment = suffering
   */
  private computeFieldAlignment(phaseField: number[][]): number {
    // Compute gradient field, then measure how parallel vectors are
    // Simplified: just check phase variance (low variance = aligned)

    const allPhases = phaseField.flat();
    const mean = allPhases.reduce((a, b) => a + b, 0) / allPhases.length;
    const variance = allPhases.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / allPhases.length;

    // Convert variance to alignment score (0-1)
    // Low variance = high alignment
    const alignment = Math.exp(-variance / (Math.PI * Math.PI));
    return alignment;
  }

  // ==========================================================================
  // Thermodynamic Metrics
  // ==========================================================================

  private computeThermodynamicMetrics(
    eegData: EEGChannelData[],
    phaseCoupling: PhaseCouplingMetrics
  ): ThermodynamicMetrics {
    // Spectral entropy (disorder)
    const eegSpectralEntropy = this.computeSpectralEntropy(eegData);

    // Free energy (Friston's variational free energy)
    // F = Energy - Temperature · Entropy
    const consciousnessTemperature = this.estimateConsciousnessTemperature(eegData);
    const freeEnergyEstimate = eegSpectralEntropy - consciousnessTemperature * eegSpectralEntropy;

    // Attractor strength (how pulled toward target state)
    const attractorStrength = phaseCoupling.globalSynchrony; // Simplified

    return {
      eegSpectralEntropy,
      freeEnergyEstimate,
      consciousnessTemperature,
      attractorStrength,
    };
  }

  /**
   * Spectral entropy: disorder in frequency spectrum
   * High entropy = lots of frequencies active (hot/chaotic)
   * Low entropy = few dominant frequencies (cool/ordered)
   */
  private computeSpectralEntropy(eegData: EEGChannelData[]): number {
    if (eegData.length === 0) return 0;

    // Average across channels
    const entropies = eegData.map((ch) => {
      const powers = this.computeBandPowers(ch);
      const total = powers.delta + powers.theta + powers.alpha + powers.beta + powers.gamma;

      if (total === 0) return 0;

      // Shannon entropy: H = -Σ p_i log(p_i)
      const probs = [
        powers.delta / total,
        powers.theta / total,
        powers.alpha / total,
        powers.beta / total,
        powers.gamma / total,
      ];

      let entropy = 0;
      for (const p of probs) {
        if (p > 0) {
          entropy -= p * Math.log2(p);
        }
      }

      return entropy;
    });

    return entropies.reduce((a, b) => a + b, 0) / entropies.length;
  }

  /**
   * Consciousness temperature (psychedelic thermodynamics)
   * High temperature = flexible, wobbly, high energy
   * Low temperature = rigid, stable, low energy
   */
  private estimateConsciousnessTemperature(eegData: EEGChannelData[]): number {
    if (eegData.length === 0) return 0;

    // Use high-frequency power as proxy for "heat"
    const avgPowers = eegData.map((ch) => this.computeBandPowers(ch));

    const avgGamma =
      avgPowers.reduce((sum, p) => sum + p.gamma, 0) / avgPowers.length;
    const avgBeta =
      avgPowers.reduce((sum, p) => sum + p.beta, 0) / avgPowers.length;

    // Normalize to 0-1
    const temperature = (avgGamma + avgBeta) / 2; // Simplified
    return Math.min(1, temperature);
  }

  /**
   * Compute band powers from EEG channel
   */
  private computeBandPowers(channel: EEGChannelData): EEGBandPowers {
    const spectrum = fft(channel.timeseries.map((x) => [x, 0] as [number, number]));
    const n = spectrum.length;
    const samplingRate = channel.samplingRate;

    const bandPowers = { delta: 0, theta: 0, alpha: 0, beta: 0, gamma: 0 };

    for (let i = 0; i < n / 2; i++) {
      const freq = (i * samplingRate) / n;
      const power = spectrum[i][0] * spectrum[i][0] + spectrum[i][1] * spectrum[i][1];

      if (freq >= 0.5 && freq < 4) bandPowers.delta += power;
      else if (freq >= 4 && freq < 8) bandPowers.theta += power;
      else if (freq >= 8 && freq < 13) bandPowers.alpha += power;
      else if (freq >= 13 && freq < 30) bandPowers.beta += power;
      else if (freq >= 30 && freq < 100) bandPowers.gamma += power;
    }

    return bandPowers;
  }

  // ==========================================================================
  // Temporal Phenomenology
  // ==========================================================================

  private computeTemporalMetrics(
    eegData: EEGChannelData[],
    phaseData: ReturnType<typeof this.extractPhase>[]
  ): TemporalMetrics {
    // Tracer length (working memory depth)
    // High theta/gamma coupling → longer tracer
    const tracerLengthEstimate = this.estimateTracerLength(eegData);

    // Time dilation (phenomenal / physical time)
    // High alpha blocking → time compression
    const timeDilationFactor = this.estimateTimeDilation(eegData);

    // Time loop detection (repetitive state cycling)
    const timeLoopDetected = this.detectTimeLoop(phaseData);

    return {
      tracerLengthEstimate,
      timeDilationFactor,
      timeLoopDetected,
    };
  }

  /**
   * Estimate tracer length (pseudo-time arrow depth)
   * Andres: psychedelics extend tracer → longer phenomenal "past"
   */
  private estimateTracerLength(eegData: EEGChannelData[]): number {
    // Theta power correlates with working memory
    const avgPowers = eegData.map((ch) => this.computeBandPowers(ch));
    const avgTheta = avgPowers.reduce((sum, p) => sum + p.theta, 0) / avgPowers.length;

    // Return in seconds (baseline ~2s, psychedelic ~10s)
    return 2 + avgTheta * 8; // Simplified scaling
  }

  /**
   * Estimate time dilation factor
   */
  private estimateTimeDilation(eegData: EEGChannelData[]): number {
    // Alpha blocking (low alpha) → subjective speedup
    const avgPowers = eegData.map((ch) => this.computeBandPowers(ch));
    const avgAlpha = avgPowers.reduce((sum, p) => sum + p.alpha, 0) / avgPowers.length;

    // High alpha = slow time, low alpha = fast time
    return 1 + (1 - avgAlpha); // Simplified
  }

  /**
   * Detect time loop (repeating phase patterns)
   * Andres: happens with repetitive music on psychedelics
   */
  private detectTimeLoop(phaseData: ReturnType<typeof this.extractPhase>[]): boolean {
    if (this.phaseHistory.length < 10) return false;

    // Check if recent phases match earlier pattern
    const recent = this.phaseHistory.slice(-5);
    const earlier = this.phaseHistory.slice(-15, -10);

    // Compute correlation
    let sumDiff = 0;
    for (let i = 0; i < Math.min(recent.length, earlier.length); i++) {
      for (let j = 0; j < recent[i].length; j++) {
        sumDiff += Math.abs(this.phaseDifference(recent[i][j], earlier[i][j]));
      }
    }

    const avgDiff = sumDiff / (recent.length * recent[0].length);

    // If average phase difference < π/4, patterns are repeating
    return avgDiff < Math.PI / 4;
  }

  // ==========================================================================
  // Valence Prediction
  // ==========================================================================

  /**
   * Predict phenomenal valence from field geometry
   * Andres's Symmetry Theory of Valence:
   * - Aligned field lines = bliss
   * - Sheared field lines = suffering
   */
  private computeValenceMetrics(
    phaseCoupling: PhaseCouplingMetrics,
    topological: TopologicalMetrics
  ): ValenceMetrics {
    // Coherent bliss: high global synchrony = positive
    const coherentBliss = phaseCoupling.globalSynchrony;

    // Dissonant stress: high shear = negative
    const dissonantStress = topological.fieldShearStress;

    // Predicted valence: balance of coherence vs. dissonance
    const predictedValence = coherentBliss - dissonantStress;

    return {
      predictedValence,
      coherentBliss,
      dissonantStress,
    };
  }
}

// ============================================================================
// Export
// ============================================================================

export const coherenceTracker = new CoherenceTracker();
