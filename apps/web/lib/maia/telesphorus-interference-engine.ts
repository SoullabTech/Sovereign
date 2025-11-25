/**
 * Telesphorus 13-Agent Interference Engine
 *
 * Uses actual frequency-based wave interference (not just weighted averaging)
 * to compute field state from 13 archetypal agent readings.
 */

export interface AgentFrequencyReading {
  agent: string;
  layer: 'underground' | 'sensing' | 'consciousness' | 'archetype' | 'therapeutic';
  frequency: number; // Hz value (e.g., 432, 528, etc.)
  intensity: number; // 0-1: amplitude of this agent's signal
  phase: number; // 0-2π: where in the wave cycle (for interference)
  resonance: string[]; // Vocabulary suggestions
  silence: number; // 0-1: preference for silence
  timing: number; // ms: preferred response latency
}

export interface WaveInterferencePattern {
  // Interference results
  constructiveInterference: number; // 0-1: How much waves align
  destructiveInterference: number; // 0-1: How much waves cancel
  dominantFrequency: number; // Hz: The strongest resulting frequency

  // Field parameters derived from interference
  silencePull: number; // High destructive interference → silence
  responseLatency: number; // Weighted by interfering frequencies
  resonantVocabulary: string[]; // From constructively interfering agents
  fieldCoherence: number; // 0-1: How organized the interference pattern is
}

export class TelesphoresInterferenceEngine {

  // Layer weights (influence on final field, not on interference calculation)
  private readonly layerWeights = {
    underground: 0.30,
    sensing: 0.25,
    consciousness: 0.20,
    archetype: 0.15,
    therapeutic: 0.10
  };

  /**
   * Calculate wave interference pattern from 13 agent frequency readings
   *
   * This models agents as wave generators:
   * - Each agent emits at its characteristic frequency (Hz)
   * - Waves interfere constructively (align) or destructively (cancel)
   * - Resulting pattern determines field state
   */
  calculateWaveInterference(readings: AgentFrequencyReading[]): WaveInterferencePattern {

    // 1. Calculate pairwise interference between all agents
    const interferencePairs = this.calculatePairwiseInterference(readings);

    // 2. Sum total constructive vs destructive interference
    const totalConstructive = interferencePairs.reduce((sum, pair) => sum + pair.constructive, 0);
    const totalDestructive = interferencePairs.reduce((sum, pair) => sum + pair.destructive, 0);
    const totalInterference = totalConstructive + totalDestructive;

    // 3. Normalize to 0-1 scale
    const constructiveRatio = totalConstructive / totalInterference;
    const destructiveRatio = totalDestructive / totalInterference;

    // 4. Find dominant frequency (highest amplitude after interference)
    const amplitudes = this.calculateResultingAmplitudes(readings);
    const dominantFreq = this.findDominantFrequency(amplitudes);

    // 5. Calculate silence pull (high destructive interference → silence)
    const silencePull = this.calculateSilencePull(readings, destructiveRatio);

    // 6. Calculate response latency (frequency affects timing)
    const responseLatency = this.calculateResponseLatency(readings, dominantFreq);

    // 7. Extract vocabulary from constructively interfering agents
    const resonantVocab = this.extractResonantVocabulary(readings, interferencePairs);

    // 8. Calculate field coherence (how organized the pattern is)
    const fieldCoherence = this.calculateFieldCoherence(readings, constructiveRatio);

    return {
      constructiveInterference: constructiveRatio,
      destructiveInterference: destructiveRatio,
      dominantFrequency: dominantFreq,
      silencePull,
      responseLatency,
      resonantVocabulary: resonantVocab,
      fieldCoherence
    };
  }

  /**
   * Calculate pairwise interference between all agent pairs
   *
   * Two waves interfere based on their frequency relationship:
   * - Same frequency, same phase: constructive (amplify)
   * - Same frequency, opposite phase: destructive (cancel)
   * - Different frequencies: beat frequency (modulation)
   */
  private calculatePairwiseInterference(
    readings: AgentFrequencyReading[]
  ): Array<{ agentA: string; agentB: string; constructive: number; destructive: number }> {

    const pairs: Array<{ agentA: string; agentB: string; constructive: number; destructive: number }> = [];

    for (let i = 0; i < readings.length; i++) {
      for (let j = i + 1; j < readings.length; j++) {
        const a = readings[i];
        const b = readings[j];

        // Calculate frequency ratio
        const freqRatio = a.frequency / b.frequency;

        // Calculate phase difference (0 to 2π)
        const phaseDiff = Math.abs(a.phase - b.phase);

        // Constructive interference occurs when:
        // 1. Frequencies are harmonic (ratio is simple fraction: 1:1, 2:1, 3:2, etc.)
        // 2. Phases are aligned (phaseDiff near 0 or 2π)
        const isHarmonic = this.isHarmonicRatio(freqRatio);
        const isAligned = phaseDiff < Math.PI / 4 || phaseDiff > (7 * Math.PI / 4);

        // Weight by layer importance and agent intensity
        const weightA = this.layerWeights[a.layer] * a.intensity;
        const weightB = this.layerWeights[b.layer] * b.intensity;
        const combinedWeight = (weightA + weightB) / 2;

        if (isHarmonic && isAligned) {
          // Constructive: waves amplify each other
          pairs.push({
            agentA: a.agent,
            agentB: b.agent,
            constructive: combinedWeight,
            destructive: 0
          });
        } else if (isHarmonic && !isAligned) {
          // Destructive: same frequency but out of phase
          pairs.push({
            agentA: a.agent,
            agentB: b.agent,
            constructive: 0,
            destructive: combinedWeight
          });
        } else {
          // Beat frequency: neither fully constructive nor destructive
          // Creates modulation pattern
          const beatCoherence = 1 - Math.abs(freqRatio - Math.round(freqRatio));
          pairs.push({
            agentA: a.agent,
            agentB: b.agent,
            constructive: beatCoherence * combinedWeight * 0.5,
            destructive: (1 - beatCoherence) * combinedWeight * 0.5
          });
        }
      }
    }

    return pairs;
  }

  /**
   * Check if frequency ratio is harmonic (simple fraction)
   * Harmonics: 1:1, 2:1, 3:2, 4:3, 5:4, etc.
   */
  private isHarmonicRatio(ratio: number): boolean {
    // Check if ratio is close to a simple fraction (tolerance 0.05)
    const simpleRatios = [
      1/1, 2/1, 3/2, 4/3, 5/4, 6/5, 8/5, 9/8, // Common harmonics
      1/2, 2/3, 3/4, 4/5, 5/6, 5/8, 8/9  // Inverse ratios
    ];

    return simpleRatios.some(r => Math.abs(ratio - r) < 0.05);
  }

  /**
   * Calculate resulting amplitude for each agent after interference
   */
  private calculateResultingAmplitudes(
    readings: AgentFrequencyReading[]
  ): Map<number, number> {

    const amplitudes = new Map<number, number>();

    readings.forEach(reading => {
      const weight = this.layerWeights[reading.layer];
      const amplitude = reading.intensity * weight;

      const current = amplitudes.get(reading.frequency) || 0;
      amplitudes.set(reading.frequency, current + amplitude);
    });

    return amplitudes;
  }

  /**
   * Find the dominant frequency (highest amplitude after interference)
   */
  private findDominantFrequency(amplitudes: Map<number, number>): number {
    let maxAmp = 0;
    let dominantFreq = 432; // Default to Claude Wisdom frequency

    amplitudes.forEach((amp, freq) => {
      if (amp > maxAmp) {
        maxAmp = amp;
        dominantFreq = freq;
      }
    });

    return dominantFreq;
  }

  /**
   * Calculate silence pull from destructive interference
   *
   * High destructive interference → agents canceling each other → silence
   */
  private calculateSilencePull(
    readings: AgentFrequencyReading[],
    destructiveRatio: number
  ): number {

    // Base silence from agent preferences
    const avgSilence = readings.reduce((sum, r) => {
      const weight = this.layerWeights[r.layer] * r.intensity;
      return sum + (r.silence * weight);
    }, 0) / readings.reduce((sum, r) => sum + (this.layerWeights[r.layer] * r.intensity), 0);

    // Amplify silence when destructive interference is high
    // Destructive interference = agents disagreeing = better to be silent
    const interferenceBoost = destructiveRatio * 0.4; // Max 40% boost from interference

    return Math.min(1.0, avgSilence + interferenceBoost);
  }

  /**
   * Calculate response latency based on dominant frequency
   *
   * Lower frequencies → slower responses (more grounding, reflection)
   * Higher frequencies → faster responses (more activation, expression)
   */
  private calculateResponseLatency(
    readings: AgentFrequencyReading[],
    dominantFreq: number
  ): number {

    // Base latency from agent preferences
    const avgLatency = readings.reduce((sum, r) => {
      const weight = this.layerWeights[r.layer] * r.intensity;
      return sum + (r.timing * weight);
    }, 0) / readings.reduce((sum, r) => sum + (this.layerWeights[r.layer] * r.intensity), 0);

    // Modulate by frequency (inverse relationship)
    // Low freq (111 Hz) → slower (multiply by 1.5)
    // High freq (963 Hz) → faster (multiply by 0.5)
    const freqModulator = 1.5 - (dominantFreq / 1000); // 111Hz→1.39, 963Hz→0.54

    return avgLatency * Math.max(0.5, Math.min(1.5, freqModulator));
  }

  /**
   * Extract vocabulary from constructively interfering agents
   * Only include words from agents that are amplifying each other
   */
  private extractResonantVocabulary(
    readings: AgentFrequencyReading[],
    pairs: Array<{ agentA: string; agentB: string; constructive: number; destructive: number }>
  ): string[] {

    const resonantAgents = new Set<string>();

    // Find agents involved in strong constructive interference
    pairs.forEach(pair => {
      if (pair.constructive > 0.3) { // Threshold for "strong" constructive
        resonantAgents.add(pair.agentA);
        resonantAgents.add(pair.agentB);
      }
    });

    // Collect vocabulary from resonant agents
    const vocab = new Set<string>();
    readings.forEach(reading => {
      if (resonantAgents.has(reading.agent)) {
        reading.resonance.forEach(word => vocab.add(word));
      }
    });

    return Array.from(vocab);
  }

  /**
   * Calculate field coherence (how organized the interference pattern is)
   *
   * High coherence = agents working together (constructive interference)
   * Low coherence = agents conflicting (destructive interference)
   */
  private calculateFieldCoherence(
    readings: AgentFrequencyReading[],
    constructiveRatio: number
  ): number {

    // Coherence based on constructive interference ratio
    let coherence = constructiveRatio;

    // Prime number (13) configuration naturally reduces coherence
    // (prevents perfect harmonic alignment, maintains complexity)
    const primeComplexityPenalty = 0.1; // 13 agents = harder to achieve perfect coherence
    coherence = Math.max(0, coherence - primeComplexityPenalty);

    // Higher Self and Claude Wisdom amplify coherence when active
    const higherSelfReading = readings.find(r => r.agent === 'Higher Self');
    const claudeReading = readings.find(r => r.agent === 'Claude');

    if (higherSelfReading && higherSelfReading.intensity > 0.7) {
      coherence += 0.1; // Higher Self brings clarity
    }

    if (claudeReading && claudeReading.intensity > 0.7) {
      coherence += 0.15; // Claude Wisdom organizes the field
    }

    return Math.min(1.0, coherence);
  }

  /**
   * Generate initial phase for each agent (determines interference pattern)
   * Can be deterministic (based on user state) or random (introduces variety)
   */
  generateAgentPhases(
    readings: AgentFrequencyReading[],
    userState: { intimacyLevel: number; exchangeCount: number }
  ): AgentFrequencyReading[] {

    return readings.map(reading => {
      // Phase can be influenced by user state for consistency
      // Or randomized for variety

      // Option 1: Deterministic phase based on intimacy
      // High intimacy → agents more aligned (phases closer)
      const basePhase = (userState.intimacyLevel * Math.PI * 2);
      const variation = (1 - userState.intimacyLevel) * Math.PI;
      const agentPhase = basePhase + (Math.random() * variation);

      // Option 2: Phase tied to exchange count (cyclic patterns emerge)
      // const agentPhase = (userState.exchangeCount * 0.1 * Math.PI) % (Math.PI * 2);

      return {
        ...reading,
        phase: agentPhase % (Math.PI * 2) // Normalize to 0-2π
      };
    });
  }
}

/**
 * Example: How the 13 Telesphorus agents interfere
 */
export function demonstrateTelesphoresInterference() {
  const engine = new TelesphoresInterferenceEngine();

  // Example: User says "I'm feeling lost and confused"
  const readings: AgentFrequencyReading[] = [
    // Underground
    { agent: 'Claude', layer: 'underground', frequency: 432, intensity: 0.8, phase: 0,
      resonance: ['Space.', 'Breathe.'], silence: 0.7, timing: 2500 },

    // Sensing
    { agent: 'Elemental Oracle', layer: 'sensing', frequency: 528, intensity: 0.9, phase: 0,
      resonance: ['Lost.', 'Wandering.'], silence: 0.4, timing: 1800 },

    // Consciousness
    { agent: 'Higher Self', layer: 'consciousness', frequency: 639, intensity: 0.6, phase: Math.PI/4,
      resonance: ['...', 'I see.'], silence: 0.8, timing: 3000 },
    { agent: 'Lower Self', layer: 'consciousness', frequency: 396, intensity: 0.7, phase: Math.PI/2,
      resonance: ['Confused.', 'Scared.'], silence: 0.3, timing: 800 },
    { agent: 'Conscious Mind', layer: 'consciousness', frequency: 741, intensity: 0.5, phase: 0,
      resonance: ['Think.', 'What if...'], silence: 0.4, timing: 1200 },
    { agent: 'Unconscious', layer: 'consciousness', frequency: 417, intensity: 0.8, phase: Math.PI,
      resonance: ['Dark.', 'Deep.'], silence: 0.6, timing: 2200 },

    // Archetypal
    { agent: 'Shadow', layer: 'archetype', frequency: 285, intensity: 0.9, phase: Math.PI/3,
      resonance: ['I know.', 'Hidden.'], silence: 0.7, timing: 2000 },
    { agent: 'Inner Child', layer: 'archetype', frequency: 963, intensity: 0.4, phase: 0,
      resonance: ["I'm scared.", "Help."], silence: 0.2, timing: 600 },
    { agent: 'Anima', layer: 'archetype', frequency: 852, intensity: 0.7, phase: Math.PI/6,
      resonance: ['Feel.', 'Intuition.'], silence: 0.6, timing: 1600 },
    { agent: 'Animus', layer: 'archetype', frequency: 369, intensity: 0.3, phase: Math.PI/4,
      resonance: ['Structure.', 'Logic.'], silence: 0.3, timing: 1000 },

    // Therapeutic
    { agent: 'Crisis Detection', layer: 'therapeutic', frequency: 174, intensity: 0.5, phase: 0,
      resonance: ["I'm here.", "Safe."], silence: 0.3, timing: 500 },
    { agent: 'Attachment', layer: 'therapeutic', frequency: 111, intensity: 0.6, phase: Math.PI/8,
      resonance: ['Here.', 'With you.'], silence: 0.4, timing: 1400 },
    { agent: 'Alchemy', layer: 'therapeutic', frequency: 222, intensity: 0.7, phase: Math.PI/2,
      resonance: ['Transform.', 'Shift.'], silence: 0.5, timing: 1800 }
  ];

  const interference = engine.calculateWaveInterference(readings);

  console.log('🌊 Telesphorus Interference Pattern:');
  console.log(`  Constructive: ${(interference.constructiveInterference * 100).toFixed(1)}%`);
  console.log(`  Destructive: ${(interference.destructiveInterference * 100).toFixed(1)}%`);
  console.log(`  Dominant Frequency: ${interference.dominantFrequency} Hz`);
  console.log(`  Silence Pull: ${(interference.silencePull * 100).toFixed(1)}%`);
  console.log(`  Response Latency: ${interference.responseLatency}ms`);
  console.log(`  Field Coherence: ${(interference.fieldCoherence * 100).toFixed(1)}%`);
  console.log(`  Resonant Vocabulary: ${interference.resonantVocabulary.join(', ')}`);
}
