/**
 * Neuropod Psychoactivation Engine
 *
 * Generates binaural beats, haptic patterns, and light modulation based on:
 * - Evidence-based protocols (protocolLibrary.ts)
 * - Real-time coherence feedback (coherenceTracker.ts)
 * - Safety constraints (safetyPredictor.ts)
 * - ASSR (Auditory Steady-State Response) validation
 *
 * Core innovation: Closed-loop adaptation
 * - Measure: ASSR phase-locking, coherence changes
 * - Adapt: Adjust stimulus if target not reached
 * - Safety: Override if risk score too high
 *
 * Based on: NEUROPOD_PSYCHOACTIVATION_EVIDENCE_BASE.md
 */

import type { PsychoactivationOutput, StimulusProtocol } from './protocolLibrary';
import type { CoherenceSnapshot } from './coherenceTracker';
import type { OverwhelmPrediction } from './safetyPredictor';

// ============================================================================
// TYPES
// ============================================================================

export interface ASSRMetrics {
  // Auditory Steady-State Response metrics
  modulationFrequency: number;      // Target frequency (e.g., 10 Hz, 40 Hz)
  phaseLockingValue: number;        // 0-1, how strongly brain locks to stimulus
  spectralSNR: number;              // Signal-to-noise ratio at modulation frequency
  interTrialCoherence: number;      // Consistency of phase across trials
  entrainmentDetected: boolean;     // PLV > 0.3 threshold
}

export interface PsychoactivationState {
  elapsedSeconds: number;
  currentOutput: PsychoactivationOutput;
  assrMetrics?: ASSRMetrics;        // If EEG available
  coherenceSnapshot: CoherenceSnapshot;
  safetyPrediction: OverwhelmPrediction;
  targetReached: boolean;
  adaptationHistory: AdaptationEvent[];
}

export interface AdaptationEvent {
  timestamp: number;
  reason: string;
  action: 'increase-intensity' | 'decrease-intensity' | 'maintain' | 'stop';
  adjustedParams?: Partial<PsychoactivationOutput>;
}

export interface SafetyIntensityCaps {
  maxAudioAmplitude: number;        // 0-1 (maps to SPL cap at hardware layer)
  maxHapticAmplitude: number;       // 0-1 (maps to vibration g-force cap)
  maxLightIntensity: number;        // 0-1 (maps to lux cap)
  maxModulationFrequency: number;   // Hz (avoid epileptogenic rates)
}

// Hardware-enforced limits (ALWAYS applied)
export const HARDWARE_SAFETY_CAPS: SafetyIntensityCaps = {
  maxAudioAmplitude: 0.85,          // 85 dB SPL max (OSHA safe)
  maxHapticAmplitude: 0.75,         // 1.5g max (comfortable, non-injurious)
  maxLightIntensity: 0.6,           // 500 lux max
  maxModulationFrequency: 50,       // No >50 Hz light modulation (epilepsy safety)
};

// ============================================================================
// PSYCHOACTIVATION ENGINE
// ============================================================================

export class PsychoactivationEngine {
  private protocol: StimulusProtocol;
  private state: PsychoactivationState;
  private startTime: number;

  constructor(protocol: StimulusProtocol) {
    this.protocol = protocol;
    this.startTime = Date.now();

    // Initialize with protocol stimulus (apply safety caps immediately)
    this.state = {
      elapsedSeconds: 0,
      currentOutput: this.applySafetyCaps(protocol.stimulus),
      targetReached: false,
      adaptationHistory: [],
    } as PsychoactivationState;
  }

  // =========================================================================
  // MAIN LOOP: Called every second during session
  // =========================================================================

  public tick(
    coherenceSnapshot: CoherenceSnapshot,
    safetyPrediction: OverwhelmPrediction,
    assrMetrics?: ASSRMetrics
  ): PsychoactivationOutput {
    this.state.elapsedSeconds = (Date.now() - this.startTime) / 1000;
    this.state.coherenceSnapshot = coherenceSnapshot;
    this.state.safetyPrediction = safetyPrediction;
    this.state.assrMetrics = assrMetrics;

    // 1. Safety check (highest priority)
    if (safetyPrediction.recommendation === 'stop') {
      return this.emergencyStop(safetyPrediction.reasoning);
    }

    if (safetyPrediction.recommendation === 'pause') {
      return this.shiftToCalm(safetyPrediction.reasoning);
    }

    if (safetyPrediction.recommendation === 'reduce_intensity') {
      return this.reduceIntensity(safetyPrediction.reasoning);
    }

    // 2. Check if target reached
    this.state.targetReached = this.evaluateTarget(coherenceSnapshot);

    // 3. Adapt stimulus based on response
    return this.adaptStimulus();
  }

  // =========================================================================
  // SAFETY INTERVENTIONS
  // =========================================================================

  private emergencyStop(reason: string): PsychoactivationOutput {
    console.log('🚨 EMERGENCY STOP:', reason);

    this.state.adaptationHistory.push({
      timestamp: this.state.elapsedSeconds,
      reason: `Emergency stop: ${reason}`,
      action: 'stop',
    });

    // Return silence + gentle grounding
    return this.applySafetyCaps({
      audio: {
        carrierLeft: 200,
        carrierRight: 200,     // No binaural beat
        amplitude: 0.1,        // Very gentle
        soundscape: 'nature',
      },
      haptic: {
        frequency: 0.1,        // Slow grounding pulses
        amplitude: 0.2,
        pattern: 'pulsed',
      },
      light: {
        color: 'amber',
        intensity: 0.1,        // Dim
      },
    });
  }

  private shiftToCalm(reason: string): PsychoactivationOutput {
    console.log('⚠️ SHIFTING TO CALM:', reason);

    this.state.adaptationHistory.push({
      timestamp: this.state.elapsedSeconds,
      reason: `Pause intervention: ${reason}`,
      action: 'decrease-intensity',
    });

    // Return CALM protocol stimulus (breath-paced grounding)
    return this.applySafetyCaps({
      audio: {
        carrierLeft: 200,
        carrierRight: 200,
        amplitude: 0.3,
        soundscape: 'nature',
      },
      haptic: {
        frequency: 0.1,
        amplitude: 0.3,
        pattern: 'breath-synced',
        breathTiming: {
          inhale: 4,
          hold1: 2,
          exhale: 6,
          hold2: 2,
        },
      },
      light: {
        color: 'amber',
        intensity: 0.2,
      },
    });
  }

  private reduceIntensity(reason: string): PsychoactivationOutput {
    console.log('⚠️ REDUCING INTENSITY:', reason);

    // Reduce current stimulus amplitude by 30%
    const reduced: PsychoactivationOutput = {
      audio: {
        ...this.state.currentOutput.audio,
        amplitude: this.state.currentOutput.audio.amplitude * 0.7,
      },
      haptic: {
        ...this.state.currentOutput.haptic,
        amplitude: this.state.currentOutput.haptic.amplitude * 0.7,
      },
      light: {
        ...this.state.currentOutput.light,
        intensity: this.state.currentOutput.light.intensity * 0.7,
      },
    };

    this.state.adaptationHistory.push({
      timestamp: this.state.elapsedSeconds,
      reason: `Gentle fade: ${reason}`,
      action: 'decrease-intensity',
      adjustedParams: reduced,
    });

    this.state.currentOutput = this.applySafetyCaps(reduced);
    return this.state.currentOutput;
  }

  // =========================================================================
  // TARGET EVALUATION (Did protocol achieve expected coherence change?)
  // =========================================================================

  private evaluateTarget(snapshot: CoherenceSnapshot): boolean {
    const expected = this.protocol.expectedChanges;
    const validation = this.protocol.validation;

    // Extract current metric value
    let currentValue = 0;
    const metric = validation.primaryMetric;

    if (metric === 'alphaPower') {
      currentValue = snapshot.phaseCoupling.alphaPower;
    } else if (metric === 'gammaPower') {
      currentValue = snapshot.phaseCoupling.gammaPower;
    } else if (metric === 'globalSynchrony') {
      currentValue = snapshot.phaseCoupling.globalSynchrony;
    } else if (metric === 'spectralEntropy') {
      currentValue = snapshot.thermodynamic.eegSpectralEntropy;
    }

    // Check if within target range
    const targetRange = expected[metric as keyof typeof expected];
    if (targetRange && typeof targetRange === 'object' && 'target' in targetRange) {
      const inRange = currentValue >= targetRange.min && currentValue <= targetRange.max;
      return inRange;
    }

    return false;
  }

  // =========================================================================
  // ADAPTIVE STIMULUS MODULATION
  // =========================================================================

  private adaptStimulus(): PsychoactivationOutput {
    // If target reached and safe, maintain current output
    if (this.state.targetReached && this.state.safetyPrediction.riskScore < 0.3) {
      this.state.adaptationHistory.push({
        timestamp: this.state.elapsedSeconds,
        reason: 'Target reached; maintaining stimulus',
        action: 'maintain',
      });
      return this.state.currentOutput;
    }

    // If ASSR entrainment is weak, try increasing amplitude
    if (this.state.assrMetrics && !this.state.assrMetrics.entrainmentDetected) {
      return this.increaseForEntrainment();
    }

    // If target not reached but safe, consider increasing intensity
    if (!this.state.targetReached && this.state.safetyPrediction.riskScore < 0.2) {
      return this.increaseIntensity();
    }

    // Default: maintain
    return this.state.currentOutput;
  }

  private increaseForEntrainment(): PsychoactivationOutput {
    const assrMetrics = this.state.assrMetrics!;
    const currentAmplitude = this.state.currentOutput.audio.amplitude;

    // Only increase if below max safety cap
    if (currentAmplitude >= this.protocol.safety.maxIntensity) {
      console.log('⚠️ ASSR entrainment weak, but already at max safe intensity');
      return this.state.currentOutput;
    }

    // Increase by 15%
    const increased: PsychoactivationOutput = {
      ...this.state.currentOutput,
      audio: {
        ...this.state.currentOutput.audio,
        amplitude: Math.min(currentAmplitude * 1.15, this.protocol.safety.maxIntensity),
      },
    };

    console.log(
      `📈 ASSR entrainment weak (PLV ${assrMetrics.phaseLockingValue.toFixed(2)}). Increasing amplitude: ${currentAmplitude.toFixed(2)} → ${increased.audio.amplitude.toFixed(2)}`
    );

    this.state.adaptationHistory.push({
      timestamp: this.state.elapsedSeconds,
      reason: `ASSR PLV ${assrMetrics.phaseLockingValue.toFixed(2)} < 0.3 (entrainment threshold)`,
      action: 'increase-intensity',
      adjustedParams: increased,
    });

    this.state.currentOutput = this.applySafetyCaps(increased);
    return this.state.currentOutput;
  }

  private increaseIntensity(): PsychoactivationOutput {
    const currentAmplitude = this.state.currentOutput.audio.amplitude;

    if (currentAmplitude >= this.protocol.safety.maxIntensity) {
      console.log('⚠️ Target not reached, but already at max safe intensity. User may be non-responder.');
      return this.state.currentOutput;
    }

    const increased: PsychoactivationOutput = {
      audio: {
        ...this.state.currentOutput.audio,
        amplitude: Math.min(currentAmplitude * 1.1, this.protocol.safety.maxIntensity),
      },
      haptic: {
        ...this.state.currentOutput.haptic,
        amplitude: Math.min(this.state.currentOutput.haptic.amplitude * 1.1, this.protocol.safety.maxIntensity),
      },
      light: this.state.currentOutput.light, // Don't auto-increase light (epilepsy caution)
    };

    this.state.adaptationHistory.push({
      timestamp: this.state.elapsedSeconds,
      reason: 'Target not reached; safe to increase',
      action: 'increase-intensity',
      adjustedParams: increased,
    });

    this.state.currentOutput = this.applySafetyCaps(increased);
    return this.state.currentOutput;
  }

  // =========================================================================
  // SAFETY CAPS (Hardware-enforced limits)
  // =========================================================================

  private applySafetyCaps(output: PsychoactivationOutput): PsychoactivationOutput {
    return {
      audio: {
        ...output.audio,
        amplitude: Math.min(output.audio.amplitude, HARDWARE_SAFETY_CAPS.maxAudioAmplitude),
      },
      haptic: {
        ...output.haptic,
        amplitude: Math.min(output.haptic.amplitude, HARDWARE_SAFETY_CAPS.maxHapticAmplitude),
      },
      light: {
        ...output.light,
        intensity: Math.min(output.light.intensity, HARDWARE_SAFETY_CAPS.maxLightIntensity),
        modulation: output.light.modulation
          ? {
              ...output.light.modulation,
              frequency: Math.min(output.light.modulation.frequency, HARDWARE_SAFETY_CAPS.maxModulationFrequency),
            }
          : undefined,
      },
    };
  }

  // =========================================================================
  // ASSR VALIDATION (Measure entrainment strength)
  // =========================================================================

  public static computeASSR(
    eegSignal: number[],
    modulationFrequency: number,
    samplingRate: number = 256
  ): ASSRMetrics {
    // Simplified ASSR computation (real implementation would use FFT + phase analysis)

    // 1. FFT to get power spectrum
    const spectrum = this.fft(eegSignal);

    // 2. Find peak at modulation frequency
    const binIndex = Math.round((modulationFrequency / samplingRate) * spectrum.length);
    const signalPower = spectrum[binIndex];

    // 3. Estimate noise floor (average of nearby bins, excluding peak)
    const noiseBins = [binIndex - 2, binIndex - 1, binIndex + 1, binIndex + 2].filter(
      (i) => i >= 0 && i < spectrum.length
    );
    const noisePower = noiseBins.reduce((sum, i) => sum + spectrum[i], 0) / noiseBins.length;

    // 4. SNR = signal / noise
    const snr = signalPower / (noisePower + 1e-10); // Avoid divide by zero

    // 5. Phase-locking value (simplified: map SNR to 0-1 PLV)
    // Real implementation would compute inter-trial phase coherence
    const plv = Math.min(snr / 10, 1.0); // Heuristic: SNR of 10 = perfect locking

    // 6. Entrainment detected if PLV > 0.3 (standard threshold from literature)
    const entrainmentDetected = plv > 0.3;

    return {
      modulationFrequency,
      phaseLockingValue: plv,
      spectralSNR: snr,
      interTrialCoherence: plv, // Simplified (same as PLV for this implementation)
      entrainmentDetected,
    };
  }

  // Simplified FFT (real implementation would use a library like fft-js)
  private static fft(signal: number[]): number[] {
    // Placeholder: return power spectrum
    // Real implementation: use FFT algorithm
    const n = signal.length;
    const spectrum = new Array(n / 2).fill(0);

    // Simplified: just return magnitude spectrum
    // In production, use proper FFT library
    for (let k = 0; k < n / 2; k++) {
      let real = 0;
      let imag = 0;
      for (let t = 0; t < n; t++) {
        const angle = (-2 * Math.PI * k * t) / n;
        real += signal[t] * Math.cos(angle);
        imag += signal[t] * Math.sin(angle);
      }
      spectrum[k] = Math.sqrt(real * real + imag * imag) / n;
    }

    return spectrum;
  }

  // =========================================================================
  // STATE EXPORT (For logging / research)
  // =========================================================================

  public getState(): PsychoactivationState {
    return this.state;
  }

  public getAdaptationHistory(): AdaptationEvent[] {
    return this.state.adaptationHistory;
  }
}

// ============================================================================
// BINAURAL BEAT GENERATOR (Audio output)
// ============================================================================

export class BinauralBeatGenerator {
  private audioContext: AudioContext | null = null;
  private leftOscillator: OscillatorNode | null = null;
  private rightOscillator: OscillatorNode | null = null;
  private leftGain: GainNode | null = null;
  private rightGain: GainNode | null = null;
  private merger: ChannelMergerNode | null = null;

  public start(output: PsychoactivationOutput['audio']): void {
    if (typeof window === 'undefined') {
      // Server-side: cannot generate audio
      console.warn('BinauralBeatGenerator: Cannot generate audio in server environment');
      return;
    }

    this.stop(); // Stop any existing tones

    this.audioContext = new AudioContext();

    // Left ear oscillator
    this.leftOscillator = this.audioContext.createOscillator();
    this.leftOscillator.frequency.value = output.carrierLeft;
    this.leftOscillator.type = 'sine';

    this.leftGain = this.audioContext.createGain();
    this.leftGain.gain.value = output.amplitude;

    // Right ear oscillator
    this.rightOscillator = this.audioContext.createOscillator();
    this.rightOscillator.frequency.value = output.carrierRight;
    this.rightOscillator.type = 'sine';

    this.rightGain = this.audioContext.createGain();
    this.rightGain.gain.value = output.amplitude;

    // Merge into stereo
    this.merger = this.audioContext.createChannelMerger(2);

    this.leftOscillator.connect(this.leftGain);
    this.leftGain.connect(this.merger, 0, 0);

    this.rightOscillator.connect(this.rightGain);
    this.rightGain.connect(this.merger, 0, 1);

    this.merger.connect(this.audioContext.destination);

    // Start oscillators
    this.leftOscillator.start();
    this.rightOscillator.start();

    console.log(
      `🎵 Binaural beat started: ${output.carrierLeft} Hz (L) + ${output.carrierRight} Hz (R) = ${Math.abs(output.carrierLeft - output.carrierRight)} Hz beat`
    );
  }

  public updateAmplitude(amplitude: number): void {
    if (this.leftGain && this.rightGain) {
      this.leftGain.gain.value = amplitude;
      this.rightGain.gain.value = amplitude;
    }
  }

  public stop(): void {
    if (this.leftOscillator) {
      this.leftOscillator.stop();
      this.leftOscillator = null;
    }
    if (this.rightOscillator) {
      this.rightOscillator.stop();
      this.rightOscillator = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

// ============================================================================
// USAGE EXAMPLE
// ============================================================================

/**
 * Example: Real-time session with ASSR validation
 *
 * ```typescript
 * import { PsychoactivationEngine } from './psychoactivationEngine';
 * import { ALPHA_RELAXATION } from './protocolLibrary';
 * import { coherenceTracker } from './coherenceTracker';
 * import { safetyPredictor } from './safetyPredictor';
 *
 * const engine = new PsychoactivationEngine(ALPHA_RELAXATION);
 * const beatGenerator = new BinauralBeatGenerator();
 *
 * // Start session
 * beatGenerator.start(engine.getState().currentOutput.audio);
 *
 * // Every second (1 Hz loop)
 * setInterval(async () => {
 *   const eegData = await getEEGData(); // From OpenBCI
 *
 *   // Compute coherence metrics
 *   const snapshot = coherenceTracker.computeCoherence(eegData);
 *
 *   // Predict safety risk
 *   const prediction = safetyPredictor.predictOverwhelm(snapshot);
 *
 *   // Compute ASSR (entrainment strength)
 *   const assrMetrics = PsychoactivationEngine.computeASSR(
 *     eegData[0].signal,  // Use frontal electrode
 *     10,                 // Target 10 Hz alpha beat
 *     256                 // Sampling rate
 *   );
 *
 *   // Tick engine (returns adapted output)
 *   const output = engine.tick(snapshot, prediction, assrMetrics);
 *
 *   // Update audio if changed
 *   beatGenerator.updateAmplitude(output.audio.amplitude);
 *
 *   // Log ASSR status
 *   console.log(`ASSR PLV: ${assrMetrics.phaseLockingValue.toFixed(2)}, Entrained: ${assrMetrics.entrainmentDetected}`);
 * }, 1000);
 * ```
 */
