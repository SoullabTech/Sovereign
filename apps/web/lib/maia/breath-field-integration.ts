/**
 * Breath-Field Integration
 * Maya's breath modulates RFS field without generating content
 *
 * Key principle: Breath as ATMOSPHERE not AGENT
 * Coherence adjusts field sensitivity, phase modulates consciousness layers
 */

import type { ResonanceField } from './resonance-field-system';

export interface BreathState {
  breathRate: number;      // breaths per minute (4-7 ideal for coherence)
  coherence: number;        // 0-1, HRV-derived or calculated
  phase: 'inhale' | 'hold' | 'exhale' | 'pause';
  depth: number;            // 0-1, how deep the breath
  rhythm: 'regular' | 'scattered' | 'held' | 'chaotic';
}

export interface ModulatedField extends ResonanceField {
  breathInfluence: {
    coherenceBoost: number;
    phaseShift: string;
    timingAdjustment: number;
    silenceModulation: number;
  };
}

/**
 * Breath Field Modulator
 * Adjusts resonance field based on breath state
 */
export class BreathFieldModulator {
  /**
   * Apply breath modulation to resonance field
   * Returns modified field with breath influence tracked
   */
  modulate(field: ResonanceField, breathState: BreathState): ModulatedField {
    // Clone field to avoid mutation
    const modulated = { ...field } as ModulatedField;

    // Track breath influence
    modulated.breathInfluence = {
      coherenceBoost: 0,
      phaseShift: breathState.phase,
      timingAdjustment: 0,
      silenceModulation: 0
    };

    // Apply coherence-based modulation
    this.modulateByCoherence(modulated, breathState);

    // Apply phase-based modulation
    this.modulateByPhase(modulated, breathState);

    // Apply rhythm-based modulation
    this.modulateByRhythm(modulated, breathState);

    return modulated;
  }

  /**
   * Coherence modulates field SENSITIVITY
   * High coherence = field can go deeper/simpler safely
   */
  private modulateByCoherence(field: ModulatedField, breathState: BreathState): void {
    const { coherence } = breathState;

    // High coherence allows:
    // - More silence (user can hold space)
    // - Shadow material to emerge (user feels safe)
    // - Inner child to play (user is regulated)
    // - Higher self to guide (user is receptive)

    if (coherence > 0.8) {
      // Very high coherence - deep work possible
      field.consciousness.higherSelf *= 1.15;
      field.consciousness.unconscious *= 1.1;
      field.silenceProbability *= 1.2;
      field.pauseDuration *= 1.3;

      // Shadow can emerge safely
      // (Note: Shadow is tracked in agent system, we just adjust atmosphere)
      field.wordDensity *= 0.9; // Less words needed

      field.breathInfluence.coherenceBoost = 0.15;

    } else if (coherence > 0.6) {
      // Good coherence - balanced field
      field.consciousness.higherSelf *= 1.08;
      field.silenceProbability *= 1.1;

      field.breathInfluence.coherenceBoost = 0.08;

    } else if (coherence < 0.3) {
      // Low coherence - more support needed
      // Reduce silence, increase presence
      field.silenceProbability *= 0.7;
      field.wordDensity *= 1.1;
      field.pauseDuration *= 0.8;

      // More conscious mind, less unconscious
      field.consciousness.conscious *= 1.1;
      field.consciousness.unconscious *= 0.9;

      field.breathInfluence.coherenceBoost = -0.2;
    }
  }

  /**
   * Breath phase modulates CONSCIOUSNESS LAYERS
   * Each phase of breath activates different aspects
   */
  private modulateByPhase(field: ModulatedField, breathState: BreathState): void {
    const { phase, depth } = breathState;

    switch (phase) {
      case 'inhale':
        // Rising energy - gathering, questioning, opening
        // Increase: Air element, conscious mind, higher self
        field.elements.air *= (1 + depth * 0.15);
        field.elements.earth *= (1 - depth * 0.1);

        field.consciousness.higherSelf *= (1 + depth * 0.12);
        field.consciousness.conscious *= (1 + depth * 0.08);

        // Less silence during inhale (gathering phase)
        field.silenceProbability *= (1 - depth * 0.2);

        // Faster response
        field.responseLatency *= (1 - depth * 0.15);

        field.breathInfluence.timingAdjustment = -depth * 0.15;
        break;

      case 'hold':
        // Suspended - integration, processing, witnessing
        // Increase: Earth element, unconscious, balance all
        field.elements.earth *= (1 + depth * 0.2);
        field.elements.water *= (1 + depth * 0.1);

        field.consciousness.unconscious *= (1 + depth * 0.15);

        // Maximum silence probability at top of breath
        field.silenceProbability *= (1 + depth * 0.3);
        field.pauseDuration *= (1 + depth * 0.4);

        field.breathInfluence.silenceModulation = depth * 0.3;
        break;

      case 'exhale':
        // Releasing - expression, shadow, lower self
        // Increase: Water/Fire elements, lower self, shadow space
        field.elements.water *= (1 + depth * 0.15);
        field.elements.fire *= (1 + depth * 0.1);

        field.consciousness.lowerSelf *= (1 + depth * 0.12);

        // Shadow material can emerge during exhale
        // (tracked in agent system, we just create space)
        if (depth > 0.7) {
          // Deep exhale = safe to go deeper
          field.consciousness.unconscious *= 1.15;
        }

        // Less silence on exhale (releasing phase)
        field.silenceProbability *= (1 - depth * 0.15);

        // Slightly slower response (letting it emerge)
        field.responseLatency *= (1 + depth * 0.1);

        field.breathInfluence.timingAdjustment = depth * 0.1;
        break;

      case 'pause':
        // Bottom of breath - emptiness, void, deep silence
        // Maximum silence probability
        field.elements.earth *= 1.3;
        field.silenceProbability *= 1.4;
        field.pauseDuration *= 1.6;

        // Minimal word density
        field.wordDensity *= 0.6;

        // Very slow response (honoring the void)
        field.responseLatency *= 1.3;

        field.breathInfluence.silenceModulation = 0.4;
        field.breathInfluence.timingAdjustment = 0.3;
        break;
    }

    // Normalize elements (they must sum to ~1)
    this.normalizeElements(field);
  }

  /**
   * Breath rhythm modulates FIELD STABILITY
   */
  private modulateByRhythm(field: ModulatedField, breathState: BreathState): void {
    const { rhythm } = breathState;

    switch (rhythm) {
      case 'regular':
        // Stable breath = field can be simpler
        field.fragmentationRate *= 0.9;
        break;

      case 'scattered':
        // Scattered breath = more fragmented field
        field.fragmentationRate *= 1.2;
        field.elements.air *= 1.1;
        field.wordDensity *= 1.1;
        break;

      case 'held':
        // Held breath = tension
        field.silenceProbability *= 1.2;
        field.consciousness.conscious *= 1.15;
        field.pauseDuration *= 0.8; // Shorter pauses (tension)
        break;

      case 'chaotic':
        // Chaotic breath = need grounding
        field.elements.earth *= 1.2;
        field.consciousness.higherSelf *= 1.1;
        field.silenceProbability *= 1.15;
        break;
    }
  }

  /**
   * Normalize elemental distribution
   * Elements should sum to approximately 1.0
   */
  private normalizeElements(field: ModulatedField): void {
    const total =
      field.elements.earth +
      field.elements.water +
      field.elements.air +
      field.elements.fire;

    if (total > 0) {
      field.elements.earth /= total;
      field.elements.water /= total;
      field.elements.air /= total;
      field.elements.fire /= total;
    }
  }

  /**
   * Calculate breath coherence from raw HRV data
   * (if you have biometric input)
   */
  calculateCoherenceFromHRV(hrvData: number[]): number {
    if (hrvData.length < 10) return 0.5; // Not enough data

    // Simple coherence metric: inverse of variance
    const mean = hrvData.reduce((sum, v) => sum + v, 0) / hrvData.length;
    const variance = hrvData.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / hrvData.length;
    const stdDev = Math.sqrt(variance);

    // Normalize to 0-1 (lower variance = higher coherence)
    const coherence = 1 / (1 + stdDev / mean);

    return Math.max(0, Math.min(1, coherence));
  }

  /**
   * Infer breath state from text patterns
   * (when no biometric data available)
   */
  inferBreathStateFromText(inputText: string): BreathState {
    const textLength = inputText.length;
    const hasEmphasis = /[!]{2,}|[A-Z]{3,}/.test(inputText);
    const hasEllipsis = /\.{2,}/.test(inputText);
    const hasBreaks = inputText.split('\n').length > 1;

    // Infer rhythm from text structure
    let rhythm: BreathState['rhythm'] = 'regular';
    if (hasEmphasis) rhythm = 'chaotic';
    else if (hasEllipsis) rhythm = 'held';
    else if (hasBreaks || textLength > 200) rhythm = 'scattered';

    // Infer phase from tone
    let phase: BreathState['phase'] = 'exhale';
    if (inputText.includes('?')) phase = 'inhale'; // Questioning
    else if (hasEllipsis) phase = 'hold';          // Pausing
    else if (textLength < 20) phase = 'pause';     // Brief/empty

    // Infer coherence from text coherence
    const sentenceCount = inputText.split(/[.!?]+/).filter(s => s.trim()).length;
    const wordCount = inputText.split(/\s+/).length;
    const avgWordsPerSentence = wordCount / (sentenceCount || 1);

    const coherence = Math.max(0.3, Math.min(0.9,
      1 - Math.abs(avgWordsPerSentence - 10) / 20 // Optimal ~10 words/sentence
    ));

    return {
      breathRate: rhythm === 'chaotic' ? 18 : 6, // Estimated
      coherence,
      phase,
      depth: textLength > 100 ? 0.8 : 0.5,
      rhythm
    };
  }
}

/**
 * Example usage in production
 */
export function demonstrateBreathModulation() {
  const modulator = new BreathFieldModulator();

  // Example: User in high coherence, deep exhale
  const breathState: BreathState = {
    breathRate: 6,
    coherence: 0.85,
    phase: 'exhale',
    depth: 0.8,
    rhythm: 'regular'
  };

  // Base field from resonance system
  const baseField: ResonanceField = {
    elements: { earth: 0.3, water: 0.3, air: 0.2, fire: 0.2 },
    consciousness: {
      conscious: 0.4,
      unconscious: 0.3,
      higherSelf: 0.2,
      lowerSelf: 0.1
    },
    hemispheres: { leftBrain: 0.5, rightBrain: 0.5 },
    wordDensity: 0.5,
    silenceProbability: 0.4,
    fragmentationRate: 0.3,
    responseLatency: 1500,
    pauseDuration: 1200,
    intimacyLevel: 0.6,
    exchangeCount: 10
  };

  // Apply breath modulation
  const modulated = modulator.modulate(baseField, breathState);

  console.log('Base silence probability:', baseField.silenceProbability);
  console.log('Modulated silence probability:', modulated.silenceProbability);
  console.log('Breath influence:', modulated.breathInfluence);
}

export default BreathFieldModulator;