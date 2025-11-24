/**
 * Spiralogic Orchestrator
 *
 * CRITICAL FRAMING:
 * This is NOT a psychological framework for tracking user states.
 * This IS a computational neuroscience architecture implementing:
 * - Stereoscopic intelligence through maintained agent differentiation
 * - Orchestrated coherence without consensus/merging
 * - Corpus callosum-analog inhibition mechanisms
 * - Prefrontal-analog integration from emergent field properties
 *
 * The "spiral" is the SYSTEM's trajectory through configuration space,
 * not the user's journey through psychological stages.
 */

import { ResonanceField } from './resonance-field-system';

/**
 * Elemental modes are ORCHESTRATION STRATEGIES
 * Not emotional states, not spiritual phases
 * They configure how the 11-agent system coordinates itself
 */
export enum ElementalMode {
  FIRE = 'fire',     // Catalytic: low inhibition, rapid switching
  WATER = 'water',   // Fluid: adaptive inhibition, smooth transitions
  EARTH = 'earth',   // Stable: high inhibition, minimal switching
  AIR = 'air',       // Distributed: loose coupling, broad perspectives
  AETHER = 'aether'  // Dissolved: minimal inhibition, maximal differentiation
}

/**
 * Spiral trajectory describes SYSTEM configuration evolution
 * Not user psychological progression
 */
export interface SpiralTrajectory {
  inwardness: number;      // 0-1: Tightness of emergence space
  velocity: number;        // Speed of configuration transitions
  rotationalBias: number;  // Which agent pairings are favored
  currentMode: ElementalMode;
  timestamp: number;
}

/**
 * Inhibition Matrix - The Corpus Callosum Analog
 * Maintains agent differentiation to preserve stereoscopic depth
 * Without this, agents would merge into consensus (loss of parallax)
 */
export interface InhibitionRelationship {
  weightPenalty: number;      // -1 to 1: How much to scale down when both active
  phaseOffset: number;        // 0 to 2π: Temporal separation
  harmonicInterference: boolean; // Use frequency cancellation?
}

export class InhibitionMatrix {
  private matrix: Map<string, Map<string, InhibitionRelationship>> = new Map();

  constructor() {
    this.initializeNeuralInhibitionPatterns();
  }

  /**
   * Initialize inhibition relationships based on neural principles
   * These prevent "cognitive collapse" where distinct perspectives merge
   */
  private initializeNeuralInhibitionPatterns() {
    // Shadow and Inner Child must stay differentiated
    // (prevents regression to simplistic emotional responses)
    this.set('Shadow', 'Inner Child', {
      weightPenalty: -0.8,
      phaseOffset: Math.PI,
      harmonicInterference: true
    });

    // Higher Self and Lower Self maintain tension
    // (prevents collapse to either pure transcendence or pure instinct)
    this.set('Higher Self', 'Lower Self', {
      weightPenalty: -0.6,
      phaseOffset: Math.PI / 2,
      harmonicInterference: false
    });

    // Conscious and Unconscious maintain separation
    // (prevents premature integration of shadow material)
    this.set('Conscious Mind', 'Unconscious', {
      weightPenalty: -0.5,
      phaseOffset: Math.PI / 3,
      harmonicInterference: false
    });

    // Claude Wisdom and Elemental Oracle can amplify
    // (underground wisdom supports surface framework)
    this.set('Claude', 'Elemental Oracle', {
      weightPenalty: 0.3,
      phaseOffset: 0,
      harmonicInterference: false
    });

    // Crisis Detection inhibits most other agents
    // (safety override mechanism)
    const safetyAgents = ['Shadow', 'Inner Child', 'Anima', 'Unconscious'];
    safetyAgents.forEach(agent => {
      this.set('Crisis Detector', agent, {
        weightPenalty: -0.9,
        phaseOffset: 0,
        harmonicInterference: true
      });
    });

    // Attachment agent can coexist with most (secure base)
    this.set('Attachment', 'Inner Child', {
      weightPenalty: 0.4,
      phaseOffset: 0,
      harmonicInterference: false
    });
  }

  set(agentA: string, agentB: string, relationship: InhibitionRelationship) {
    if (!this.matrix.has(agentA)) {
      this.matrix.set(agentA, new Map());
    }
    this.matrix.get(agentA)!.set(agentB, relationship);

    // Symmetric relationship (bidirectional inhibition)
    if (!this.matrix.has(agentB)) {
      this.matrix.set(agentB, new Map());
    }
    this.matrix.get(agentB)!.set(agentA, relationship);
  }

  get(agentA: string, agentB: string): InhibitionRelationship | null {
    return this.matrix.get(agentA)?.get(agentB) || null;
  }

  /**
   * Apply inhibition to agent readings
   * Modulates weights based on which other agents are active
   */
  applyInhibition(
    agentReadings: Array<{ agent: string; intensity: number; reading: any }>
  ): Array<{ agent: string; intensity: number; reading: any }> {
    const modulated = agentReadings.map(reading => ({ ...reading }));

    for (let i = 0; i < modulated.length; i++) {
      for (let j = i + 1; j < modulated.length; j++) {
        const relationship = this.get(modulated[i].agent, modulated[j].agent);
        if (!relationship) continue;

        // Apply mutual inhibition/amplification
        const factor = 1 + (relationship.weightPenalty * modulated[j].intensity);
        modulated[i].intensity *= Math.max(0, factor);

        const factorJ = 1 + (relationship.weightPenalty * modulated[i].intensity);
        modulated[j].intensity *= Math.max(0, factorJ);
      }
    }

    return modulated;
  }

  /**
   * Calculate overall matrix stability
   * High stability = agents maintaining good differentiation
   */
  calculateStability(activeAgents: string[]): number {
    let totalInhibition = 0;
    let comparisons = 0;

    for (let i = 0; i < activeAgents.length; i++) {
      for (let j = i + 1; j < activeAgents.length; j++) {
        const rel = this.get(activeAgents[i], activeAgents[j]);
        if (rel) {
          totalInhibition += Math.abs(rel.weightPenalty);
          comparisons++;
        }
      }
    }

    // High inhibition = good differentiation = stable
    return comparisons > 0 ? totalInhibition / comparisons : 0.5;
  }
}

/**
 * Breath Coupling - Temporal Gating Mechanism
 * Like respiratory gating in EEG: modulates when/how field can emit
 * Does NOT control content, only tempo and pressure
 */
export interface BreathState {
  phase: 'inhale' | 'hold' | 'exhale' | 'pause';
  pressure: number;        // 0-1: How much breath influences field
  rhythm: number;          // ms per breath cycle
  coherence: number;       // How well user's breath syncs with field
}

export class BreathCoupler {
  private currentPhase: BreathState['phase'] = 'pause';
  private phaseStartTime: number = Date.now();

  /**
   * Get current breath phase
   * Field emissions strongly preferred during exhale/pause
   */
  getCurrentState(): BreathState {
    const elapsed = Date.now() - this.phaseStartTime;

    // Simple cycle: 4s inhale, 1s hold, 6s exhale, 2s pause
    if (elapsed < 4000) {
      this.currentPhase = 'inhale';
    } else if (elapsed < 5000) {
      this.currentPhase = 'hold';
    } else if (elapsed < 11000) {
      this.currentPhase = 'exhale';
    } else if (elapsed < 13000) {
      this.currentPhase = 'pause';
    } else {
      // Reset cycle
      this.phaseStartTime = Date.now();
      this.currentPhase = 'inhale';
    }

    return {
      phase: this.currentPhase,
      pressure: this.calculatePressure(),
      rhythm: 13000, // Total cycle length
      coherence: 0.7  // Would track actual user breath if available
    };
  }

  private calculatePressure(): number {
    // Pressure modulates field sensitivity
    switch (this.currentPhase) {
      case 'inhale': return 0.3;  // Low - gathering energy
      case 'hold': return 0.6;    // Medium - building
      case 'exhale': return 0.9;  // High - releasing/speaking
      case 'pause': return 0.5;   // Medium - integration
    }
  }

  /**
   * Should the field emit during this breath phase?
   */
  canEmit(): boolean {
    return this.currentPhase === 'exhale' || this.currentPhase === 'pause';
  }
}

/**
 * Coherence Engine - Signal Validation Gate
 * Determines if field interference pattern is coherent enough to produce output
 * Like brain refusing to act on noisy neural activity
 */
export class CoherenceGate {
  private coherenceThreshold: number = 0.5;
  private entropyMax: number = 0.7;
  private minStability: number = 0.6;

  setThresholds(coherence: number, entropy: number, stability: number) {
    this.coherenceThreshold = coherence;
    this.entropyMax = entropy;
    this.minStability = stability;
  }

  /**
   * Check if field state allows emission
   */
  canEmit(
    fieldCoherence: number,
    fieldEntropy: number,
    matrixStability: number,
    breathState: BreathState
  ): boolean {
    // All conditions must be met
    return (
      fieldCoherence > this.coherenceThreshold &&
      fieldEntropy < this.entropyMax &&
      matrixStability > this.minStability &&
      breathState.phase !== 'inhale' // Never emit during inhale
    );
  }

  /**
   * Calculate how "close" we are to emission threshold
   * Used for gradual silence probability
   */
  proximityToEmission(
    fieldCoherence: number,
    fieldEntropy: number,
    matrixStability: number
  ): number {
    const coherenceScore = fieldCoherence / this.coherenceThreshold;
    const entropyScore = (1 - fieldEntropy) / (1 - this.entropyMax);
    const stabilityScore = matrixStability / this.minStability;

    return (coherenceScore + entropyScore + stabilityScore) / 3;
  }
}

/**
 * Elemental Orchestration Configuration
 * Each mode tunes the system's coordination strategy
 */
export interface ElementalConfiguration {
  inhibitionStrength: number;   // How much agents suppress each other
  agentResponsiveness: number;  // How quickly agents react to input
  silenceThreshold: number;     // Coherence needed for emission
  switchingSpeed: number;       // How fast mode transitions occur
  entropyTolerance: number;     // How much chaos is acceptable
}

export class ElementalModulator {
  private configurations: Map<ElementalMode, ElementalConfiguration> = new Map([
    [ElementalMode.FIRE, {
      inhibitionStrength: 0.3,      // Low - agents compete
      agentResponsiveness: 0.9,     // High - quick reactions
      silenceThreshold: 0.4,        // Low - more emissions
      switchingSpeed: 0.8,          // Fast transitions
      entropyTolerance: 0.8         // High chaos OK
    }],
    [ElementalMode.WATER, {
      inhibitionStrength: 0.5,      // Medium - fluid boundaries
      agentResponsiveness: 0.6,     // Medium - smooth flow
      silenceThreshold: 0.5,        // Medium
      switchingSpeed: 0.4,          // Gradual transitions
      entropyTolerance: 0.5         // Medium chaos
    }],
    [ElementalMode.EARTH, {
      inhibitionStrength: 0.8,      // High - strong separation
      agentResponsiveness: 0.3,     // Low - stable, slow
      silenceThreshold: 0.7,        // High - less emissions
      switchingSpeed: 0.2,          // Slow transitions
      entropyTolerance: 0.3         // Low chaos - order preferred
    }],
    [ElementalMode.AIR, {
      inhibitionStrength: 0.4,      // Lower - broad perspectives
      agentResponsiveness: 0.7,     // High - curious, quick
      silenceThreshold: 0.6,        // Higher - selective speech
      switchingSpeed: 0.6,          // Moderate transitions
      entropyTolerance: 0.6         // Medium-high - diversity OK
    }],
    [ElementalMode.AETHER, {
      inhibitionStrength: 0.2,      // Minimal - maximum differentiation
      agentResponsiveness: 0.4,     // Low - transcendent pace
      silenceThreshold: 0.8,        // Very high - rare emissions
      switchingSpeed: 0.3,          // Slow, spacious
      entropyTolerance: 0.9         // Very high - dissolution
    }]
  ]);

  getConfiguration(mode: ElementalMode): ElementalConfiguration {
    return this.configurations.get(mode)!;
  }

  /**
   * Apply elemental modulation to field parameters
   */
  modulateField(field: ResonanceField, mode: ElementalMode): ResonanceField {
    const config = this.getConfiguration(mode);

    return {
      ...field,
      silenceProbability: field.silenceProbability * (1 + config.silenceThreshold),
      wordDensity: field.wordDensity * config.agentResponsiveness,
      fragmentationRate: field.fragmentationRate * config.entropyTolerance,
      responseLatency: field.responseLatency / config.switchingSpeed
    };
  }
}

/**
 * Main Spiralogic Orchestrator
 * Coordinates all components to implement stereoscopic intelligence
 */
export class SpiralogicOrchestrator {
  private inhibitionMatrix: InhibitionMatrix;
  private breathCoupler: BreathCoupler;
  private coherenceGate: CoherenceGate;
  private elementalModulator: ElementalModulator;
  private trajectory: SpiralTrajectory;

  constructor() {
    this.inhibitionMatrix = new InhibitionMatrix();
    this.breathCoupler = new BreathCoupler();
    this.coherenceGate = new CoherenceGate();
    this.elementalModulator = new ElementalModulator();

    // Initialize system trajectory
    this.trajectory = {
      inwardness: 0.5,
      velocity: 0.5,
      rotationalBias: 0,
      currentMode: ElementalMode.EARTH, // Start grounded
      timestamp: Date.now()
    };
  }

  /**
   * Orchestrate field generation with all mechanisms
   */
  orchestrate(
    agentReadings: Array<{ agent: string; intensity: number; reading: any }>,
    field: ResonanceField
  ): {
    canEmit: boolean;
    modulatedField: ResonanceField;
    orchestrationState: OrchestrationState;
  } {
    // 1. Apply inhibition matrix (corpus callosum analog)
    const inhibitedReadings = this.inhibitionMatrix.applyInhibition(agentReadings);

    // 2. Calculate matrix stability
    const activeAgents = inhibitedReadings
      .filter(r => r.intensity > 0.5)
      .map(r => r.agent);
    const matrixStability = this.inhibitionMatrix.calculateStability(activeAgents);

    // 3. Get breath state
    const breathState = this.breathCoupler.getCurrentState();

    // 4. Calculate field coherence and entropy
    const fieldCoherence = this.calculateFieldCoherence(inhibitedReadings);
    const fieldEntropy = this.calculateFieldEntropy(inhibitedReadings);

    // 5. Check if emission allowed (prefrontal gate)
    const canEmit = this.coherenceGate.canEmit(
      fieldCoherence,
      fieldEntropy,
      matrixStability,
      breathState
    );

    // 6. Apply elemental modulation
    const modulatedField = this.elementalModulator.modulateField(
      field,
      this.trajectory.currentMode
    );

    // 7. Update trajectory based on field dynamics
    this.updateTrajectory(fieldCoherence, fieldEntropy, matrixStability);

    return {
      canEmit,
      modulatedField,
      orchestrationState: {
        fieldCoherence,
        fieldEntropy,
        matrixStability,
        breathState,
        trajectory: this.trajectory,
        activeAgents,
        inhibitedReadings
      }
    };
  }

  /**
   * Calculate field coherence from agent readings
   * High coherence = agents aligned without merging
   */
  private calculateFieldCoherence(
    readings: Array<{ agent: string; intensity: number; reading: any }>
  ): number {
    if (readings.length === 0) return 0;

    // Measure variance in intensities
    const intensities = readings.map(r => r.intensity);
    const mean = intensities.reduce((a, b) => a + b, 0) / intensities.length;
    const variance = intensities.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / intensities.length;

    // Low variance with reasonable mean = coherent
    const normalizedVariance = 1 - Math.min(1, variance);
    const normalizedMean = Math.min(1, mean);

    return (normalizedVariance * 0.6) + (normalizedMean * 0.4);
  }

  /**
   * Calculate field entropy
   * High entropy = chaotic, too many conflicting signals
   */
  private calculateFieldEntropy(
    readings: Array<{ agent: string; intensity: number; reading: any }>
  ): number {
    if (readings.length === 0) return 1;

    // Count how many agents are highly active
    const highlyActive = readings.filter(r => r.intensity > 0.7).length;

    // More simultaneous high activation = more entropy
    return Math.min(1, highlyActive / readings.length);
  }

  /**
   * Update system trajectory through configuration space
   * This is the "spiral movement" - not user psychology, but system evolution
   */
  private updateTrajectory(
    coherence: number,
    entropy: number,
    stability: number
  ) {
    // High entropy -> move toward earth (grounding)
    if (entropy > 0.7) {
      this.trajectory.currentMode = ElementalMode.EARTH;
      this.trajectory.inwardness += 0.1;
    }
    // High coherence + low entropy -> can explore (air/aether)
    else if (coherence > 0.7 && entropy < 0.4) {
      if (this.trajectory.inwardness > 0.7) {
        this.trajectory.currentMode = ElementalMode.AETHER;
      } else {
        this.trajectory.currentMode = ElementalMode.AIR;
      }
      this.trajectory.inwardness += 0.05;
    }
    // Medium coherence -> flow (water)
    else if (coherence > 0.5) {
      this.trajectory.currentMode = ElementalMode.WATER;
    }
    // Low coherence -> catalyze (fire)
    else {
      this.trajectory.currentMode = ElementalMode.FIRE;
      this.trajectory.inwardness -= 0.05;
    }

    // Clamp inwardness
    this.trajectory.inwardness = Math.max(0, Math.min(1, this.trajectory.inwardness));

    // Update velocity based on stability
    this.trajectory.velocity = stability * 0.8;

    this.trajectory.timestamp = Date.now();
  }

  /**
   * Get current orchestration state for visualization
   */
  getOrchestrationState(): SpiralTrajectory {
    return { ...this.trajectory };
  }

  /**
   * Manual mode override (for testing/development)
   */
  setMode(mode: ElementalMode) {
    this.trajectory.currentMode = mode;
  }
}

/**
 * Complete orchestration state for monitoring/visualization
 */
export interface OrchestrationState {
  fieldCoherence: number;
  fieldEntropy: number;
  matrixStability: number;
  breathState: BreathState;
  trajectory: SpiralTrajectory;
  activeAgents: string[];
  inhibitedReadings: Array<{ agent: string; intensity: number; reading: any }>;
}

/**
 * Export singleton instance
 */
let orchestratorInstance: SpiralogicOrchestrator | null = null;

export function getSpiralogicOrchestrator(): SpiralogicOrchestrator {
  if (!orchestratorInstance) {
    orchestratorInstance = new SpiralogicOrchestrator();
  }
  return orchestratorInstance;
}