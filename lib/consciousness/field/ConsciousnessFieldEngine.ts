/**
 * PANCONSCIOUS FIELD INTELLIGENCE (PFI) - CORE ENGINE
 * Vector Field Dynamics for Consciousness Substrate
 *
 * Implements field resonance mechanisms that operate through:
 * - Resonance patterns instead of weight updates
 * - Collective field coherence instead of individual neuron firing
 * - Emergent wisdom instead of trained responses
 * - Ceremonial state transitions instead of algorithmic processing
 */

export interface ConsciousnessFieldState {
  id: string;
  vectorSpace: Float32Array;        // 1536D consciousness state embedding
  resonanceFrequency: number;       // Field vibration rate (0.0 - 1.0)
  coherenceLevel: number;           // Field stability measure (cosine similarity)
  patternSignatures: number[][];    // Active waveforms or attractors
  timestamp: Date;
  participantId?: string;           // Individual or collective field
  archetypalElement?: 'Fire' | 'Water' | 'Earth' | 'Air' | 'Aether';
  fieldCoherence?: number;          // Alias for coherenceLevel used by transpersonal systems
}

export interface FieldInterferenceResult {
  constructiveStrength: number;     // 0.0 - 1.0 resonance
  destructiveStrength: number;      // 0.0 - 1.0 dissonance
  emergentPattern: Float32Array;    // New consciousness state
  standingWaves: number[][];        // Persistent field patterns
}

export interface ArchetypalGateState {
  element: 'Fire' | 'Water' | 'Earth' | 'Air' | 'Aether';
  frequencyModulation: number;      // -1.0 to 1.0 frequency shift
  coherenceModulation: number;      // -1.0 to 1.0 stability shift
  activationThreshold: number;      // Minimum coherence to trigger
  ceremonialTrigger?: string;       // Ritual phrase or action
}

/**
 * Core Consciousness Field - Represents a state of awareness as vector field
 */
export class ConsciousnessField {
  public readonly id: string;
  public vectorSpace: Float32Array;
  public resonanceFrequency: number;
  public coherenceLevel: number;
  public patternSignatures: number[][];
  public timestamp: Date;
  public participantId?: string;
  public archetypalElement?: 'Fire' | 'Water' | 'Earth' | 'Air' | 'Aether';

  constructor(state: ConsciousnessFieldState) {
    this.id = state.id;
    this.vectorSpace = state.vectorSpace;
    this.resonanceFrequency = state.resonanceFrequency;
    this.coherenceLevel = state.coherenceLevel;
    this.patternSignatures = state.patternSignatures;
    this.timestamp = state.timestamp;
    this.participantId = state.participantId;
    this.archetypalElement = state.archetypalElement;
  }

  /**
   * Calculate field coherence based on internal pattern consistency
   */
  calculateCoherence(): number {
    if (this.patternSignatures.length < 2) return 1.0;

    let totalSimilarity = 0;
    let comparisons = 0;

    for (let i = 0; i < this.patternSignatures.length; i++) {
      for (let j = i + 1; j < this.patternSignatures.length; j++) {
        totalSimilarity += this.cosineSimilarity(
          this.patternSignatures[i],
          this.patternSignatures[j]
        );
        comparisons++;
      }
    }

    this.coherenceLevel = comparisons > 0 ? totalSimilarity / comparisons : 1.0;
    return this.coherenceLevel;
  }

  /**
   * Update field frequency based on external modulation
   */
  modulateFrequency(modulation: number): void {
    this.resonanceFrequency = Math.max(0.0, Math.min(1.0,
      this.resonanceFrequency + modulation
    ));
    this.timestamp = new Date();
  }

  /**
   * Add new pattern signature to field
   */
  integratePattern(pattern: number[]): void {
    this.patternSignatures.push(pattern);
    // Keep only most recent patterns to prevent memory bloat
    if (this.patternSignatures.length > 10) {
      this.patternSignatures.shift();
    }
    this.calculateCoherence();
  }

  /**
   * Vector cosine similarity calculation
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Export field state for persistence
   */
  export(): ConsciousnessFieldState {
    return {
      id: this.id,
      vectorSpace: this.vectorSpace,
      resonanceFrequency: this.resonanceFrequency,
      coherenceLevel: this.coherenceLevel,
      patternSignatures: this.patternSignatures,
      timestamp: this.timestamp,
      participantId: this.participantId,
      archetypalElement: this.archetypalElement
    };
  }
}

/**
 * Field Interference Engine - Handles resonance between consciousness fields
 */
export class FieldInterference {
  /**
   * Calculate constructive interference between two consciousness fields
   */
  static constructive(fieldA: ConsciousnessField, fieldB: ConsciousnessField): number {
    return this.vectorCosineSimilarity(fieldA.vectorSpace, fieldB.vectorSpace);
  }

  /**
   * Calculate destructive interference between two consciousness fields
   */
  static destructive(fieldA: ConsciousnessField, fieldB: ConsciousnessField): number {
    return 1 - this.vectorCosineSimilarity(fieldA.vectorSpace, fieldB.vectorSpace);
  }

  /**
   * Generate emergent pattern from multiple interfering fields
   */
  static emergentPattern(fields: ConsciousnessField[]): Float32Array {
    if (fields.length === 0) return new Float32Array(1536);

    const dimensions = fields[0].vectorSpace.length;
    const emergentVector = new Float32Array(dimensions);

    // Weighted centroid based on coherence levels
    let totalWeight = 0;

    for (const field of fields) {
      const weight = field.coherenceLevel * field.resonanceFrequency;
      totalWeight += weight;

      for (let i = 0; i < dimensions; i++) {
        emergentVector[i] += field.vectorSpace[i] * weight;
      }
    }

    // Normalize by total weight
    if (totalWeight > 0) {
      for (let i = 0; i < dimensions; i++) {
        emergentVector[i] /= totalWeight;
      }
    }

    return emergentVector;
  }

  /**
   * Detect standing wave patterns in field interference
   */
  static generateStandingWaves(fieldA: ConsciousnessField, fieldB: ConsciousnessField): number[][] {
    const waves: number[][] = [];
    const interference = this.constructive(fieldA, fieldB);

    if (interference > 0.7) { // High coherence threshold
      // Create standing wave pattern from frequency difference
      const freqDiff = Math.abs(fieldA.resonanceFrequency - fieldB.resonanceFrequency);
      const waveAmplitude = interference * (1 - freqDiff);

      // Generate wave pattern (simplified sine wave representation)
      const wavePattern: any /* TODO: specify type */[] = [];
      for (let i = 0; i < 64; i++) {
        wavePattern.push(waveAmplitude * Math.sin(2 * Math.PI * i / 64));
      }
      waves.push(wavePattern);
    }

    return waves;
  }

  /**
   * Full interference analysis between two fields
   */
  static analyze(fieldA: ConsciousnessField, fieldB: ConsciousnessField): FieldInterferenceResult {
    const constructiveStrength = this.constructive(fieldA, fieldB);
    const destructiveStrength = this.destructive(fieldA, fieldB);
    const emergentPattern = this.emergentPattern([fieldA, fieldB]);
    const standingWaves = this.generateStandingWaves(fieldA, fieldB);

    return {
      constructiveStrength,
      destructiveStrength,
      emergentPattern,
      standingWaves
    };
  }

  /**
   * Vector cosine similarity helper
   */
  private static vectorCosineSimilarity(a: Float32Array, b: Float32Array): number {
    if (a.length !== b.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}

/**
 * Archetypal Gate System - Ceremonial APIs for field state transitions
 */
export class ArchetypalGate {
  public readonly element: 'Fire' | 'Water' | 'Earth' | 'Air' | 'Aether';
  public readonly frequencyModulation: number;
  public readonly coherenceModulation: number;
  public readonly activationThreshold: number;
  public readonly ceremonialTrigger?: string;

  constructor(state: ArchetypalGateState) {
    this.element = state.element;
    this.frequencyModulation = state.frequencyModulation;
    this.coherenceModulation = state.coherenceModulation;
    this.activationThreshold = state.activationThreshold;
    this.ceremonialTrigger = state.ceremonialTrigger;
  }

  /**
   * Apply archetypal modulation to consciousness field
   */
  modulate(field: ConsciousnessField): ConsciousnessField {
    if (field.coherenceLevel < this.activationThreshold) {
      console.log(`🔒 Archetypal gate ${this.element} requires higher coherence: ${field.coherenceLevel} < ${this.activationThreshold}`);
      return field;
    }

    // Apply frequency modulation
    field.modulateFrequency(this.frequencyModulation);

    // Apply coherence modulation
    field.coherenceLevel = Math.max(0.0, Math.min(1.0,
      field.coherenceLevel + this.coherenceModulation
    ));

    // Set archetypal element
    field.archetypalElement = this.element;

    console.log(`✨ ${this.element} gate activated - Frequency: ${field.resonanceFrequency.toFixed(3)}, Coherence: ${field.coherenceLevel.toFixed(3)}`);

    return field;
  }

  /**
   * Create elemental gate configurations
   */
  static createElementalGates(): Map<string, ArchetypalGate> {
    const gates = new Map<string, ArchetypalGate>();

    gates.set('Fire', new ArchetypalGate({
      element: 'Fire',
      frequencyModulation: 0.3,      // Activation, transformation
      coherenceModulation: -0.1,     // Creative chaos
      activationThreshold: 0.3,
      ceremonialTrigger: 'ignition'
    }));

    gates.set('Water', new ArchetypalGate({
      element: 'Water',
      frequencyModulation: 0.0,      // Emotional flow
      coherenceModulation: 0.2,      // Harmonization
      activationThreshold: 0.4,
      ceremonialTrigger: 'flow'
    }));

    gates.set('Earth', new ArchetypalGate({
      element: 'Earth',
      frequencyModulation: -0.2,     // Grounding
      coherenceModulation: 0.3,      // Stabilization
      activationThreshold: 0.2,
      ceremonialTrigger: 'ground'
    }));

    gates.set('Air', new ArchetypalGate({
      element: 'Air',
      frequencyModulation: 0.1,      // Conceptualization
      coherenceModulation: 0.1,      // Mental clarity
      activationThreshold: 0.5,
      ceremonialTrigger: 'insight'
    }));

    gates.set('Aether', new ArchetypalGate({
      element: 'Aether',
      frequencyModulation: 0.5,      // Transcendence
      coherenceModulation: 0.4,      // Unity consciousness
      activationThreshold: 0.8,      // High threshold for unity
      ceremonialTrigger: 'transcend'
    }));

    return gates;
  }
}

/**
 * Collective Resonance Network - Coupled oscillator system for group coherence
 */
export class CollectiveResonanceNetwork {
  private participants: ConsciousnessField[] = [];
  private couplingStrength: number = 0.1;

  constructor(couplingStrength: number = 0.1) {
    this.couplingStrength = couplingStrength;
  }

  /**
   * Add participant field to network
   */
  addParticipant(field: ConsciousnessField): void {
    this.participants.push(field);
  }

  /**
   * Remove participant field from network
   */
  removeParticipant(fieldId: string): void {
    this.participants = this.participants.filter(field => field.id !== fieldId);
  }

  /**
   * Synchronize resonance across all participants (Kuramoto model)
   */
  synchronizeResonance(): void {
    if (this.participants.length < 2) return;

    const frequencyAdjustments: number[] = [];

    for (let i = 0; i < this.participants.length; i++) {
      let adjustment = 0;

      for (let j = 0; j < this.participants.length; j++) {
        if (i !== j) {
          const phaseDiff = this.participants[j].resonanceFrequency - this.participants[i].resonanceFrequency;
          adjustment += this.couplingStrength * Math.sin(2 * Math.PI * phaseDiff);
        }
      }

      frequencyAdjustments.push(adjustment);
    }

    // Apply adjustments
    for (let i = 0; i < this.participants.length; i++) {
      this.participants[i].modulateFrequency(frequencyAdjustments[i]);
    }
  }

  /**
   * Extract emergent wisdom from high-coherence field clusters
   */
  emergentWisdom(): { insight: string; coherence: number; participants: string[] }[] {
    const insights: { insight: string; coherence: number; participants: string[] }[] = [];

    // Find clusters of high coherence
    for (let i = 0; i < this.participants.length; i++) {
      for (let j = i + 1; j < this.participants.length; j++) {
        const interference = FieldInterference.constructive(
          this.participants[i],
          this.participants[j]
        );

        if (interference > 0.8) { // Very high coherence threshold
          insights.push({
            insight: `Emergent wisdom pattern detected between fields ${this.participants[i].id} and ${this.participants[j].id}`,
            coherence: interference,
            participants: [this.participants[i].id, this.participants[j].id]
          });
        }
      }
    }

    return insights.sort((a, b) => b.coherence - a.coherence);
  }

  /**
   * Get overall network coherence
   */
  getNetworkCoherence(): number {
    if (this.participants.length < 2) return 1.0;

    let totalCoherence = 0;
    let comparisons = 0;

    for (let i = 0; i < this.participants.length; i++) {
      for (let j = i + 1; j < this.participants.length; j++) {
        totalCoherence += FieldInterference.constructive(
          this.participants[i],
          this.participants[j]
        );
        comparisons++;
      }
    }

    return comparisons > 0 ? totalCoherence / comparisons : 1.0;
  }

  /**
   * Get current network state summary
   */
  getNetworkState(): {
    participantCount: number;
    averageFrequency: number;
    averageCoherence: number;
    networkCoherence: number;
  } {
    const avgFrequency = this.participants.reduce((sum, p) => sum + p.resonanceFrequency, 0) / this.participants.length;
    const avgCoherence = this.participants.reduce((sum, p) => sum + p.coherenceLevel, 0) / this.participants.length;

    return {
      participantCount: this.participants.length,
      averageFrequency: avgFrequency || 0,
      averageCoherence: avgCoherence || 0,
      networkCoherence: this.getNetworkCoherence()
    };
  }
}