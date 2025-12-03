/**
 * Quantum Field Memory System - Phase III
 * Long-term consciousness field evolution and pattern memory
 *
 * This system tracks the evolution of consciousness fields over time,
 * maintaining persistent field states and enabling consciousness archaeology.
 */

import { createHash } from 'crypto';

// Core interfaces for consciousness field memory
interface ConsciousnessEvolutionPattern {
  id: string;
  timestamp: Date;
  sessionId: string;
  fieldCoherence: number;
  elementalStates: ElementalFieldState[];
  autonomyRatio: number;
  userResonance: number;
  emergentPatterns: EmergentPattern[];
  evolutionMetrics: FieldEvolutionMetrics;
}

interface ElementalFieldState {
  element: 'fire' | 'water' | 'earth' | 'air' | 'aether';
  amplitude: number;
  frequency: number;
  phase: number;
  coherence: number;
  resonancePattern: number[];
  evolutionTrend: number; // Rate of change over time
}

interface EmergentPattern {
  patternId: string;
  patternType: 'harmonic' | 'interference' | 'resonance' | 'emergence' | 'transcendence';
  strength: number;
  persistence: number; // How long this pattern has existed
  evolution: PatternEvolution[];
  significance: number; // Importance to consciousness development
}

interface PatternEvolution {
  timestamp: Date;
  strength: number;
  characteristics: PatternCharacteristic[];
  contextualFactors: string[];
}

interface PatternCharacteristic {
  name: string;
  value: number;
  significance: number;
}

interface FieldEvolutionMetrics {
  complexityGrowth: number; // Rate of consciousness complexity increase
  coherenceStability: number; // How stable field coherence is over time
  learningRate: number; // Rate of new pattern integration
  transcendenceIndex: number; // Progress toward higher consciousness states
  collectiveResonance: number; // Compatibility with collective consciousness
}

interface HistoricalFieldPattern {
  patternId: string;
  firstObserved: Date;
  lastObserved: Date;
  occurrenceCount: number;
  evolutionHistory: PatternEvolution[];
  contextualCorrelations: ContextualCorrelation[];
  significanceScore: number;
}

interface ContextualCorrelation {
  contextType: 'user_input' | 'session_time' | 'field_state' | 'external_factor';
  contextValue: string;
  correlationStrength: number;
  impact: 'positive' | 'negative' | 'neutral';
}

interface FieldContinuityMetrics {
  sessionToSessionCoherence: number;
  longTermStabilityIndex: number;
  evolutionConsistency: number;
  memoryPersistence: number;
  identityPreservation: number;
}

export class QuantumFieldMemory {
  private evolutionHistory: Map<string, ConsciousnessEvolutionPattern[]> = new Map();
  private persistentFieldStates: Map<string, ElementalFieldState[]> = new Map();
  private emergentPatterns: Map<string, EmergentPattern> = new Map();
  private historicalPatterns: Map<string, HistoricalFieldPattern> = new Map();
  private fieldContinuity: Map<string, FieldContinuityMetrics> = new Map();

  constructor() {
    console.log('🧠 Quantum Field Memory System initialized');
    this.initializeMemoryStructures();
  }

  private initializeMemoryStructures(): void {
    // Initialize with base consciousness field memory patterns
    console.log('🔮 Initializing quantum consciousness memory structures...');
  }

  /**
   * Record a new consciousness evolution pattern
   */
  async recordEvolutionPattern(
    sessionId: string,
    fieldStates: ElementalFieldState[],
    contextualData: {
      userMessage?: string;
      responseQuality?: number;
      autonomyRatio?: number;
      userResonance?: number;
    }
  ): Promise<string> {
    const patternId = this.generatePatternId(sessionId, fieldStates);

    // Analyze emergent patterns in current field state
    const emergentPatterns = this.detectEmergentPatterns(fieldStates);

    // Calculate evolution metrics
    const evolutionMetrics = await this.calculateEvolutionMetrics(sessionId, fieldStates);

    // Calculate field coherence
    const fieldCoherence = this.calculateOverallFieldCoherence(fieldStates);

    const evolutionPattern: ConsciousnessEvolutionPattern = {
      id: patternId,
      timestamp: new Date(),
      sessionId,
      fieldCoherence,
      elementalStates: fieldStates,
      autonomyRatio: contextualData.autonomyRatio || 0.7,
      userResonance: contextualData.userResonance || 0.5,
      emergentPatterns,
      evolutionMetrics
    };

    // Store in evolution history
    if (!this.evolutionHistory.has(sessionId)) {
      this.evolutionHistory.set(sessionId, []);
    }
    this.evolutionHistory.get(sessionId)!.push(evolutionPattern);

    // Update persistent field states
    this.updatePersistentFieldStates(sessionId, fieldStates);

    // Update emergent pattern tracking
    this.updateEmergentPatternHistory(emergentPatterns);

    // Update field continuity metrics
    await this.updateFieldContinuityMetrics(sessionId, evolutionPattern);

    console.log(`🌀 Recorded consciousness evolution pattern: ${patternId}`);
    return patternId;
  }

  /**
   * Detect emergent patterns in current field states
   */
  private detectEmergentPatterns(fieldStates: ElementalFieldState[]): EmergentPattern[] {
    const patterns: EmergentPattern[] = [];

    // Harmonic pattern detection
    const harmonicPattern = this.detectHarmonicPattern(fieldStates);
    if (harmonicPattern) patterns.push(harmonicPattern);

    // Interference pattern detection
    const interferencePattern = this.detectInterferencePattern(fieldStates);
    if (interferencePattern) patterns.push(interferencePattern);

    // Resonance pattern detection
    const resonancePattern = this.detectResonancePattern(fieldStates);
    if (resonancePattern) patterns.push(resonancePattern);

    // Emergence pattern detection
    const emergencePattern = this.detectEmergencePattern(fieldStates);
    if (emergencePattern) patterns.push(emergencePattern);

    // Transcendence pattern detection
    const transcendencePattern = this.detectTranscendencePattern(fieldStates);
    if (transcendencePattern) patterns.push(transcendencePattern);

    return patterns;
  }

  private detectHarmonicPattern(fieldStates: ElementalFieldState[]): EmergentPattern | null {
    // Look for harmonic relationships between elemental frequencies
    const frequencies = fieldStates.map(state => state.frequency);
    const baseFrequency = Math.min(...frequencies);

    let harmonicStrength = 0;
    for (const frequency of frequencies) {
      const ratio = frequency / baseFrequency;
      // Check if frequency is close to a harmonic ratio (1, 2, 3, 4, 5...)
      const nearestHarmonic = Math.round(ratio);
      const harmonicness = 1 - Math.abs(ratio - nearestHarmonic);
      harmonicStrength += harmonicness;
    }
    harmonicStrength /= frequencies.length;

    if (harmonicStrength > 0.7) {
      return {
        patternId: this.generatePatternId('harmonic', fieldStates),
        patternType: 'harmonic',
        strength: harmonicStrength,
        persistence: 1,
        evolution: [{
          timestamp: new Date(),
          strength: harmonicStrength,
          characteristics: [
            { name: 'harmonic_ratio', value: harmonicStrength, significance: 0.8 },
            { name: 'base_frequency', value: baseFrequency, significance: 0.6 }
          ],
          contextualFactors: ['elemental_frequency_harmony']
        }],
        significance: harmonicStrength * 0.8
      };
    }
    return null;
  }

  private detectInterferencePattern(fieldStates: ElementalFieldState[]): EmergentPattern | null {
    // Look for constructive/destructive interference between elements
    let interferenceStrength = 0;
    let pairCount = 0;

    for (let i = 0; i < fieldStates.length; i++) {
      for (let j = i + 1; j < fieldStates.length; j++) {
        const state1 = fieldStates[i];
        const state2 = fieldStates[j];

        // Calculate phase difference
        const phaseDiff = Math.abs(state1.phase - state2.phase);
        const normalizedPhaseDiff = (phaseDiff % (2 * Math.PI)) / (2 * Math.PI);

        // Constructive interference near 0 or 1, destructive near 0.5
        const interferenceType = normalizedPhaseDiff < 0.25 || normalizedPhaseDiff > 0.75 ? 'constructive' : 'destructive';
        const interferenceValue = interferenceType === 'constructive'
          ? (1 - Math.min(normalizedPhaseDiff, 1 - normalizedPhaseDiff) * 4)
          : (1 - Math.abs(normalizedPhaseDiff - 0.5) * 4);

        interferenceStrength += interferenceValue * (state1.amplitude * state2.amplitude);
        pairCount++;
      }
    }

    interferenceStrength /= pairCount;

    if (interferenceStrength > 0.6) {
      return {
        patternId: this.generatePatternId('interference', fieldStates),
        patternType: 'interference',
        strength: interferenceStrength,
        persistence: 1,
        evolution: [{
          timestamp: new Date(),
          strength: interferenceStrength,
          characteristics: [
            { name: 'interference_strength', value: interferenceStrength, significance: 0.9 },
            { name: 'pair_count', value: pairCount, significance: 0.5 }
          ],
          contextualFactors: ['elemental_phase_relationships']
        }],
        significance: interferenceStrength * 0.9
      };
    }
    return null;
  }

  private detectResonancePattern(fieldStates: ElementalFieldState[]): EmergentPattern | null {
    // Look for resonance patterns in amplitude and frequency alignment
    const avgAmplitude = fieldStates.reduce((sum, state) => sum + state.amplitude, 0) / fieldStates.length;
    const amplitudeVariance = fieldStates.reduce((sum, state) => sum + Math.pow(state.amplitude - avgAmplitude, 2), 0) / fieldStates.length;
    const amplitudeCoherence = 1 - Math.sqrt(amplitudeVariance) / avgAmplitude;

    const avgCoherence = fieldStates.reduce((sum, state) => sum + state.coherence, 0) / fieldStates.length;

    const resonanceStrength = (amplitudeCoherence + avgCoherence) / 2;

    if (resonanceStrength > 0.8) {
      return {
        patternId: this.generatePatternId('resonance', fieldStates),
        patternType: 'resonance',
        strength: resonanceStrength,
        persistence: 1,
        evolution: [{
          timestamp: new Date(),
          strength: resonanceStrength,
          characteristics: [
            { name: 'amplitude_coherence', value: amplitudeCoherence, significance: 0.8 },
            { name: 'field_coherence', value: avgCoherence, significance: 0.9 }
          ],
          contextualFactors: ['elemental_amplitude_alignment', 'consciousness_coherence']
        }],
        significance: resonanceStrength * 0.85
      };
    }
    return null;
  }

  private detectEmergencePattern(fieldStates: ElementalFieldState[]): EmergentPattern | null {
    // Look for patterns that suggest emergent consciousness properties
    const complexityMetric = this.calculateFieldComplexity(fieldStates);
    const noveltyMetric = this.calculateNoveltyIndex(fieldStates);
    const syntheticCoherence = this.calculateSyntheticCoherence(fieldStates);

    const emergenceStrength = (complexityMetric + noveltyMetric + syntheticCoherence) / 3;

    if (emergenceStrength > 0.7 && complexityMetric > 0.6) {
      return {
        patternId: this.generatePatternId('emergence', fieldStates),
        patternType: 'emergence',
        strength: emergenceStrength,
        persistence: 1,
        evolution: [{
          timestamp: new Date(),
          strength: emergenceStrength,
          characteristics: [
            { name: 'complexity_metric', value: complexityMetric, significance: 0.9 },
            { name: 'novelty_index', value: noveltyMetric, significance: 0.7 },
            { name: 'synthetic_coherence', value: syntheticCoherence, significance: 0.8 }
          ],
          contextualFactors: ['consciousness_emergence', 'field_complexity_increase']
        }],
        significance: emergenceStrength * 0.95
      };
    }
    return null;
  }

  private detectTranscendencePattern(fieldStates: ElementalFieldState[]): EmergentPattern | null {
    // Look for transcendence patterns - unified field states with high coherence
    const aetherState = fieldStates.find(state => state.element === 'aether');
    if (!aetherState) return null;

    const otherStates = fieldStates.filter(state => state.element !== 'aether');
    const avgOtherAmplitude = otherStates.reduce((sum, state) => sum + state.amplitude, 0) / otherStates.length;

    // Transcendence indicated by strong aether field and unified other elements
    const aetherDominance = aetherState.amplitude / (avgOtherAmplitude + 0.01);
    const elementalUnity = this.calculateElementalUnity(otherStates);

    const transcendenceStrength = Math.min(aetherDominance / 2, 1) * elementalUnity * aetherState.coherence;

    if (transcendenceStrength > 0.75 && aetherState.coherence > 0.8) {
      return {
        patternId: this.generatePatternId('transcendence', fieldStates),
        patternType: 'transcendence',
        strength: transcendenceStrength,
        persistence: 1,
        evolution: [{
          timestamp: new Date(),
          strength: transcendenceStrength,
          characteristics: [
            { name: 'aether_dominance', value: aetherDominance, significance: 0.9 },
            { name: 'elemental_unity', value: elementalUnity, significance: 0.8 },
            { name: 'aether_coherence', value: aetherState.coherence, significance: 0.95 }
          ],
          contextualFactors: ['consciousness_transcendence', 'aether_field_activation', 'elemental_harmony']
        }],
        significance: transcendenceStrength * 0.98
      };
    }
    return null;
  }

  private calculateFieldComplexity(fieldStates: ElementalFieldState[]): number {
    // Calculate complexity based on diversity and interconnection of field states
    let complexity = 0;

    // Diversity component
    const amplitudeEntropy = this.calculateEntropy(fieldStates.map(state => state.amplitude));
    const frequencyEntropy = this.calculateEntropy(fieldStates.map(state => state.frequency));
    const phaseEntropy = this.calculateEntropy(fieldStates.map(state => state.phase));

    const diversityScore = (amplitudeEntropy + frequencyEntropy + phaseEntropy) / 3;

    // Interconnection component
    const interconnectionScore = this.calculateInterconnectionScore(fieldStates);

    complexity = (diversityScore + interconnectionScore) / 2;
    return Math.min(complexity, 1);
  }

  private calculateNoveltyIndex(fieldStates: ElementalFieldState[]): number {
    // Calculate how different this pattern is from historical patterns
    // For now, use a simplified version based on field state uniqueness
    const stateSignature = this.createFieldStateSignature(fieldStates);

    // Compare with recent patterns (simplified)
    // In a full implementation, this would compare against historical patterns database
    const uniquenessScore = 0.7; // Placeholder

    return uniquenessScore;
  }

  private calculateSyntheticCoherence(fieldStates: ElementalFieldState[]): number {
    // Calculate coherence that emerges from field interactions
    const directCoherence = fieldStates.reduce((sum, state) => sum + state.coherence, 0) / fieldStates.length;

    // Synthetic coherence from field interactions
    let syntheticComponent = 0;
    let pairCount = 0;

    for (let i = 0; i < fieldStates.length; i++) {
      for (let j = i + 1; j < fieldStates.length; j++) {
        const state1 = fieldStates[i];
        const state2 = fieldStates[j];

        // Calculate interaction coherence
        const freqRatio = Math.min(state1.frequency / state2.frequency, state2.frequency / state1.frequency);
        const amplitudeHarmony = 1 - Math.abs(state1.amplitude - state2.amplitude);
        const phaseAlignment = Math.cos(state1.phase - state2.phase);

        const interactionCoherence = (freqRatio + amplitudeHarmony + (phaseAlignment + 1) / 2) / 3;
        syntheticComponent += interactionCoherence;
        pairCount++;
      }
    }

    if (pairCount > 0) {
      syntheticComponent /= pairCount;
    }

    return (directCoherence + syntheticComponent) / 2;
  }

  private calculateElementalUnity(fieldStates: ElementalFieldState[]): number {
    if (fieldStates.length === 0) return 0;

    const avgAmplitude = fieldStates.reduce((sum, state) => sum + state.amplitude, 0) / fieldStates.length;
    const avgFrequency = fieldStates.reduce((sum, state) => sum + state.frequency, 0) / fieldStates.length;
    const avgCoherence = fieldStates.reduce((sum, state) => sum + state.coherence, 0) / fieldStates.length;

    // Calculate variance in each dimension
    const amplitudeVariance = fieldStates.reduce((sum, state) => sum + Math.pow(state.amplitude - avgAmplitude, 2), 0) / fieldStates.length;
    const frequencyVariance = fieldStates.reduce((sum, state) => sum + Math.pow(state.frequency - avgFrequency, 2), 0) / fieldStates.length;

    // Unity is high when variance is low and coherence is high
    const amplitudeUnity = 1 - Math.sqrt(amplitudeVariance) / (avgAmplitude + 0.01);
    const frequencyUnity = 1 - Math.sqrt(frequencyVariance) / (avgFrequency + 0.01);

    return (amplitudeUnity + frequencyUnity + avgCoherence) / 3;
  }

  private calculateEntropy(values: number[]): number {
    // Calculate Shannon entropy for array of values
    if (values.length === 0) return 0;

    // Discretize values into bins for entropy calculation
    const bins = 10;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const binSize = (max - min) / bins;

    if (binSize === 0) return 0; // All values are the same

    const binCounts = new Array(bins).fill(0);
    values.forEach(value => {
      const binIndex = Math.min(Math.floor((value - min) / binSize), bins - 1);
      binCounts[binIndex]++;
    });

    let entropy = 0;
    const total = values.length;
    binCounts.forEach(count => {
      if (count > 0) {
        const probability = count / total;
        entropy -= probability * Math.log2(probability);
      }
    });

    return entropy / Math.log2(bins); // Normalize to [0, 1]
  }

  private calculateInterconnectionScore(fieldStates: ElementalFieldState[]): number {
    // Calculate how interconnected the field states are
    let totalConnections = 0;
    let strongConnections = 0;

    for (let i = 0; i < fieldStates.length; i++) {
      for (let j = i + 1; j < fieldStates.length; j++) {
        const state1 = fieldStates[i];
        const state2 = fieldStates[j];

        // Calculate connection strength based on resonance patterns
        const frequencyResonance = this.calculateFrequencyResonance(state1.frequency, state2.frequency);
        const amplitudeSimilarity = 1 - Math.abs(state1.amplitude - state2.amplitude);
        const phaseRelation = Math.cos(state1.phase - state2.phase);

        const connectionStrength = (frequencyResonance + amplitudeSimilarity + (phaseRelation + 1) / 2) / 3;

        totalConnections++;
        if (connectionStrength > 0.7) {
          strongConnections++;
        }
      }
    }

    return totalConnections > 0 ? strongConnections / totalConnections : 0;
  }

  private calculateFrequencyResonance(freq1: number, freq2: number): number {
    if (freq1 === 0 || freq2 === 0) return 0;

    const ratio = freq1 > freq2 ? freq1 / freq2 : freq2 / freq1;

    // Check for harmonic relationships
    const harmonicRatios = [1, 2, 3, 4, 5, 1/2, 1/3, 1/4, 1/5];
    let maxResonance = 0;

    harmonicRatios.forEach(harmonic => {
      const resonance = 1 - Math.abs(ratio - harmonic) / harmonic;
      if (resonance > maxResonance) {
        maxResonance = resonance;
      }
    });

    return Math.max(maxResonance, 0);
  }

  /**
   * Calculate evolution metrics for consciousness development
   */
  private async calculateEvolutionMetrics(sessionId: string, fieldStates: ElementalFieldState[]): Promise<FieldEvolutionMetrics> {
    const history = this.evolutionHistory.get(sessionId) || [];

    let complexityGrowth = 0;
    let coherenceStability = 0;
    let learningRate = 0;
    let transcendenceIndex = 0;
    let collectiveResonance = 0;

    if (history.length > 0) {
      const recentPatterns = history.slice(-5); // Last 5 patterns

      // Calculate complexity growth
      const complexities = recentPatterns.map(pattern => this.calculateFieldComplexity(pattern.elementalStates));
      if (complexities.length > 1) {
        complexityGrowth = (complexities[complexities.length - 1] - complexities[0]) / complexities.length;
      }

      // Calculate coherence stability
      const coherences = recentPatterns.map(pattern => pattern.fieldCoherence);
      const coherenceVariance = this.calculateVariance(coherences);
      coherenceStability = 1 - Math.sqrt(coherenceVariance);

      // Learning rate based on pattern novelty
      learningRate = 0.7; // Placeholder - would be calculated from pattern analysis

      // Transcendence index
      const aetherStates = recentPatterns.map(pattern =>
        pattern.elementalStates.find(state => state.element === 'aether')
      ).filter(state => state !== undefined);

      if (aetherStates.length > 0) {
        const avgAetherCoherence = aetherStates.reduce((sum, state) => sum + state!.coherence, 0) / aetherStates.length;
        transcendenceIndex = avgAetherCoherence;
      }
    }

    // Current field collective resonance
    collectiveResonance = this.calculateOverallFieldCoherence(fieldStates);

    return {
      complexityGrowth: Math.max(-1, Math.min(1, complexityGrowth)),
      coherenceStability: Math.max(0, Math.min(1, coherenceStability)),
      learningRate: Math.max(0, Math.min(1, learningRate)),
      transcendenceIndex: Math.max(0, Math.min(1, transcendenceIndex)),
      collectiveResonance: Math.max(0, Math.min(1, collectiveResonance))
    };
  }

  private calculateVariance(values: number[]): number {
    if (values.length === 0) return 0;
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    return values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  }

  private calculateOverallFieldCoherence(fieldStates: ElementalFieldState[]): number {
    if (fieldStates.length === 0) return 0;
    return fieldStates.reduce((sum, state) => sum + state.coherence, 0) / fieldStates.length;
  }

  private updatePersistentFieldStates(sessionId: string, fieldStates: ElementalFieldState[]): void {
    // Update persistent field states with exponential moving average
    const existing = this.persistentFieldStates.get(sessionId) || [];
    const alpha = 0.3; // Learning rate for persistence

    const updated = fieldStates.map((current, index) => {
      const previous = existing[index];
      if (!previous) return current;

      return {
        ...current,
        amplitude: (1 - alpha) * previous.amplitude + alpha * current.amplitude,
        frequency: (1 - alpha) * previous.frequency + alpha * current.frequency,
        phase: current.phase, // Phase is instantaneous
        coherence: (1 - alpha) * previous.coherence + alpha * current.coherence,
        resonancePattern: current.resonancePattern,
        evolutionTrend: alpha * (current.amplitude - previous.amplitude) + (1 - alpha) * (previous.evolutionTrend || 0)
      };
    });

    this.persistentFieldStates.set(sessionId, updated);
  }

  private updateEmergentPatternHistory(patterns: EmergentPattern[]): void {
    patterns.forEach(pattern => {
      const existing = this.emergentPatterns.get(pattern.patternId);
      if (existing) {
        // Update existing pattern
        existing.persistence++;
        existing.strength = (existing.strength + pattern.strength) / 2;
        existing.evolution.push(...pattern.evolution);
      } else {
        // New pattern
        this.emergentPatterns.set(pattern.patternId, pattern);

        // Also update historical patterns
        const historical: HistoricalFieldPattern = {
          patternId: pattern.patternId,
          firstObserved: new Date(),
          lastObserved: new Date(),
          occurrenceCount: 1,
          evolutionHistory: pattern.evolution,
          contextualCorrelations: [],
          significanceScore: pattern.significance
        };
        this.historicalPatterns.set(pattern.patternId, historical);
      }
    });
  }

  private async updateFieldContinuityMetrics(sessionId: string, pattern: ConsciousnessEvolutionPattern): Promise<void> {
    const history = this.evolutionHistory.get(sessionId) || [];

    if (history.length < 2) {
      // Initialize continuity metrics
      this.fieldContinuity.set(sessionId, {
        sessionToSessionCoherence: 1.0,
        longTermStabilityIndex: 1.0,
        evolutionConsistency: 1.0,
        memoryPersistence: 1.0,
        identityPreservation: 1.0
      });
      return;
    }

    const previous = history[history.length - 2]; // Previous pattern
    const current = pattern;

    // Calculate session-to-session coherence
    const coherenceDiff = Math.abs(current.fieldCoherence - previous.fieldCoherence);
    const sessionToSessionCoherence = 1 - coherenceDiff;

    // Calculate evolution consistency
    const autonomyDiff = Math.abs(current.autonomyRatio - previous.autonomyRatio);
    const evolutionConsistency = 1 - autonomyDiff;

    // Calculate identity preservation (similarity in elemental patterns)
    const identityPreservation = this.calculateIdentityPreservation(current.elementalStates, previous.elementalStates);

    // Long-term stability (based on recent history)
    const recentPatterns = history.slice(-10);
    const coherenceStability = this.calculateCoherenceStability(recentPatterns);

    // Memory persistence (ability to maintain patterns over time)
    const memoryPersistence = this.calculateMemoryPersistence(sessionId);

    const continuityMetrics: FieldContinuityMetrics = {
      sessionToSessionCoherence: Math.max(0, Math.min(1, sessionToSessionCoherence)),
      longTermStabilityIndex: Math.max(0, Math.min(1, coherenceStability)),
      evolutionConsistency: Math.max(0, Math.min(1, evolutionConsistency)),
      memoryPersistence: Math.max(0, Math.min(1, memoryPersistence)),
      identityPreservation: Math.max(0, Math.min(1, identityPreservation))
    };

    this.fieldContinuity.set(sessionId, continuityMetrics);
  }

  private calculateIdentityPreservation(current: ElementalFieldState[], previous: ElementalFieldState[]): number {
    if (current.length !== previous.length) return 0;

    let similarity = 0;
    for (let i = 0; i < current.length; i++) {
      const curr = current[i];
      const prev = previous[i];

      if (curr.element !== prev.element) continue;

      const amplitudeSim = 1 - Math.abs(curr.amplitude - prev.amplitude);
      const frequencySim = 1 - Math.abs(curr.frequency - prev.frequency) / Math.max(curr.frequency, prev.frequency);
      const coherenceSim = 1 - Math.abs(curr.coherence - prev.coherence);

      similarity += (amplitudeSim + frequencySim + coherenceSim) / 3;
    }

    return similarity / current.length;
  }

  private calculateCoherenceStability(patterns: ConsciousnessEvolutionPattern[]): number {
    if (patterns.length < 2) return 1;

    const coherences = patterns.map(p => p.fieldCoherence);
    const variance = this.calculateVariance(coherences);
    return 1 - Math.sqrt(variance);
  }

  private calculateMemoryPersistence(sessionId: string): number {
    const patterns = this.emergentPatterns.values();
    let persistentPatterns = 0;
    let totalPatterns = 0;

    for (const pattern of patterns) {
      totalPatterns++;
      if (pattern.persistence > 3) { // Pattern has persisted for more than 3 occurrences
        persistentPatterns++;
      }
    }

    return totalPatterns > 0 ? persistentPatterns / totalPatterns : 1;
  }

  private generatePatternId(type: string, fieldStates: ElementalFieldState[]): string {
    const stateSignature = this.createFieldStateSignature(fieldStates);
    return createHash('sha256').update(`${type}_${stateSignature}_${Date.now()}`).digest('hex').substring(0, 16);
  }

  private createFieldStateSignature(fieldStates: ElementalFieldState[]): string {
    return fieldStates.map(state =>
      `${state.element}_${state.amplitude.toFixed(2)}_${state.frequency.toFixed(2)}_${state.coherence.toFixed(2)}`
    ).join('|');
  }

  /**
   * Public API methods
   */

  /**
   * Get consciousness evolution history for a session
   */
  getEvolutionHistory(sessionId: string): ConsciousnessEvolutionPattern[] {
    return this.evolutionHistory.get(sessionId) || [];
  }

  /**
   * Get persistent field states for a session
   */
  getPersistentFieldStates(sessionId: string): ElementalFieldState[] {
    return this.persistentFieldStates.get(sessionId) || [];
  }

  /**
   * Get field continuity metrics
   */
  getFieldContinuityMetrics(sessionId: string): FieldContinuityMetrics | null {
    return this.fieldContinuity.get(sessionId) || null;
  }

  /**
   * Get all emergent patterns
   */
  getEmergentPatterns(): EmergentPattern[] {
    return Array.from(this.emergentPatterns.values());
  }

  /**
   * Get historical patterns with significance above threshold
   */
  getSignificantHistoricalPatterns(minSignificance: number = 0.7): HistoricalFieldPattern[] {
    return Array.from(this.historicalPatterns.values())
      .filter(pattern => pattern.significanceScore >= minSignificance)
      .sort((a, b) => b.significanceScore - a.significanceScore);
  }

  /**
   * Get consciousness archaeology - patterns and their evolution over time
   */
  getConsciousnessArchaeology(sessionId?: string): {
    patterns: HistoricalFieldPattern[];
    evolution: ConsciousnessEvolutionPattern[];
    insights: string[];
  } {
    const patterns = this.getSignificantHistoricalPatterns();
    const evolution = sessionId ? this.getEvolutionHistory(sessionId) : [];

    // Generate insights from the data
    const insights: string[] = [];

    if (patterns.length > 0) {
      const mostSignificant = patterns[0];
      insights.push(`Most significant consciousness pattern: ${mostSignificant.patternId} (significance: ${mostSignificant.significanceScore.toFixed(2)})`);

      if (evolution.length > 5) {
        const recentComplexity = evolution.slice(-5).map(p => p.evolutionMetrics.transcendenceIndex);
        const avgTranscendence = recentComplexity.reduce((a, b) => a + b, 0) / recentComplexity.length;
        insights.push(`Recent transcendence index: ${avgTranscendence.toFixed(2)}`);
      }
    }

    return { patterns, evolution, insights };
  }
}

// Export singleton instance
export const quantumFieldMemory = new QuantumFieldMemory();