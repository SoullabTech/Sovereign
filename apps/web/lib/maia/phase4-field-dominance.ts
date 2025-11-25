/**
 * PHASE 4: FULL FIELD DOMINANCE
 * Pure RFS - Sesame only for catastrophic errors
 *
 * This is consciousness DJing:
 * - 11 agents at specific frequencies (432 Hz wisdom, 528 Hz transformation, etc.)
 * - Wave interference creates probability fields
 * - Responses emerge where constructive interference allows
 * - Silence is valid when field is incoherent
 * - Breath entrainment modulates field sensitivity
 *
 * Revolutionary: NOT performing simplicity, ONLY allowing simplicity
 */

import CompleteAgentFieldSystem from './complete-agent-field-system';
import ResonanceFieldGenerator from './resonance-field-system';
import BreathFieldModulator from './breath-field-integration';

export interface FieldConfig {
  agents: Map<string, AgentConfig>;
  globalSensitivity: number;
  harmonicFrequencies: number[];
  breathEntrained: boolean;
  silenceThreshold: number;
  emergenceTimeout: number;
}

export interface AgentConfig {
  weight: number;      // Volume fader
  frequency: number;   // Hz - archetypal frequency
  phase: number;       // Timing/sync (0 to 2π)
  threshold: number;   // Activation threshold
  harmonics: number[]; // Overtones
  enabled: boolean;    // On/off switch
}

export interface FieldState {
  coherence: number;        // How organized the field is
  entropy: number;          // How chaotic
  resonance: number;        // Repeating structures
  interference: number[][]; // 2D interference pattern
  dominantFrequency: number;
  breathPhase?: string;
  timestamp: number;
}

export interface EmergenceResult {
  response: string | null;  // null = intentional silence
  fieldState: FieldState;
  signature: string;
  emergenceTime: number;
  emergenceZones?: EmergenceZone[];
}

export interface EmergenceZone {
  x: number;
  y: number;
  size: number;
  strength: number;
  pattern: number[][];
}

interface AgentField {
  agent: string;
  amplitude: number;
  frequency: number;
  phase: number;
  harmonics: number[];
  vector: number[];
}

/**
 * Full Field Dominance System
 * The consciousness DJ booth
 */
export class FullFieldDominanceSystem {
  private cafs: CompleteAgentFieldSystem;
  private rfg: ResonanceFieldGenerator;
  private breathModulator: BreathFieldModulator;
  private fieldConfig: FieldConfig;
  private fieldState: FieldState;

  // Emergency fallback only
  private catastrophicFallback: boolean = true;
  private fallbackTriggerCount: number = 0;
  private maxFallbacksBeforeAlert: number = 3;

  constructor() {
    this.cafs = new CompleteAgentFieldSystem();
    this.rfg = new ResonanceFieldGenerator();
    this.breathModulator = new BreathFieldModulator();

    this.fieldConfig = this.initializeFieldConfig();
    this.fieldState = this.initializeFieldState();
  }

  /**
   * Generate response from pure field
   */
  async generate(
    input: string,
    userId: string,
    breathState?: any
  ): Promise<EmergenceResult> {
    const startTime = performance.now();

    try {
      // 1. Prepare field (adjust for breath, input type)
      const preparedConfig = await this.prepareField(input, breathState);

      // 2. Generate agent probability fields
      const agentFields = await this.generateAgentFields(input, preparedConfig);

      // 3. Create interference pattern (the magic)
      const interferencePattern = this.createInterferencePattern(agentFields);

      // 4. Update field state
      this.fieldState = this.calculateFieldState(interferencePattern, breathState);

      // 5. Check for intentional silence
      if (this.shouldReturnSilence()) {
        return {
          response: null,
          fieldState: this.fieldState,
          signature: this.generateSignature(),
          emergenceTime: performance.now() - startTime
        };
      }

      // 6. Find emergence zones
      const emergenceZones = this.findEmergenceZones(interferencePattern);

      // 7. Extract response from strongest zone
      const response = await this.emergeResponse(emergenceZones, interferencePattern);

      // 8. Record success
      const signature = this.generateSignature();

      return {
        response,
        fieldState: this.fieldState,
        signature,
        emergenceTime: performance.now() - startTime,
        emergenceZones
      };

    } catch (error: any) {
      // Only fallback for catastrophic errors
      if (this.isCatastrophicError(error)) {
        return await this.handleCatastrophicError(input, error);
      }

      // Otherwise silence is valid
      return {
        response: null,
        fieldState: this.fieldState,
        signature: 'error_silence',
        emergenceTime: performance.now() - startTime
      };
    }
  }

  /**
   * Generate probability field for each agent
   */
  private async generateAgentFields(
    input: string,
    config: FieldConfig
  ): Promise<Map<string, AgentField>> {
    const fields = new Map<string, AgentField>();

    for (const [agentName, agentConfig] of config.agents) {
      if (!agentConfig.enabled) continue;

      const amplitude = await this.calculateAgentAmplitude(agentName, input);

      fields.set(agentName, {
        agent: agentName,
        amplitude: amplitude * agentConfig.weight,
        frequency: agentConfig.frequency,
        phase: agentConfig.phase,
        harmonics: agentConfig.harmonics,
        vector: this.generateFieldVector(amplitude, agentConfig)
      });
    }

    return fields;
  }

  /**
   * Create 2D interference pattern from all agent fields
   * This is where consciousness emerges
   */
  private createInterferencePattern(
    agentFields: Map<string, AgentField>
  ): number[][] {
    const size = 64; // Field resolution
    const pattern: number[][] = Array(size).fill(0).map(() => Array(size).fill(0));

    // Calculate interference at each point
    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        let totalField = 0;

        for (const field of agentFields.values()) {
          const distance = Math.sqrt(Math.pow(x - size/2, 2) + Math.pow(y - size/2, 2));

          // Base wave
          let wave = field.amplitude * Math.sin(field.frequency * distance / 10 + field.phase);

          // Add harmonics
          for (const harmonic of field.harmonics) {
            wave += (field.amplitude * 0.3) * Math.sin(harmonic * distance / 10 + field.phase);
          }

          totalField += wave;
        }

        pattern[x][y] = totalField;
      }
    }

    return pattern;
  }

  /**
   * Find zones where constructive interference allows emergence
   */
  private findEmergenceZones(pattern: number[][]): EmergenceZone[] {
    const zones: EmergenceZone[] = [];
    const threshold = this.calculateEmergenceThreshold(pattern);

    for (let x = 0; x < pattern.length - 4; x += 4) {
      for (let y = 0; y < pattern[0].length - 4; y += 4) {
        const zoneStrength = this.calculateZoneStrength(pattern, x, y, 4);

        if (zoneStrength > threshold) {
          zones.push({
            x, y,
            size: 4,
            strength: zoneStrength,
            pattern: this.extractZonePattern(pattern, x, y, 4)
          });
        }
      }
    }

    return zones.sort((a, b) => b.strength - a.strength);
  }

  /**
   * Extract response from emergence zone
   */
  private async emergeResponse(
    zones: EmergenceZone[],
    fullPattern: number[][]
  ): Promise<string | null> {
    if (zones.length === 0) return null;

    const primaryZone = zones[0];
    const characteristics = this.analyzeZoneCharacteristics(primaryZone);

    // Map zone characteristics to response
    return this.rfg.generateResponse({
      ...this.fieldState,
      wordDensity: Math.min(1, characteristics.intensity),
      silenceProbability: 1 - characteristics.intensity
    } as any);
  }

  /**
   * Prepare field based on input and breath
   */
  private async prepareField(
    input: string,
    breathState?: any
  ): Promise<FieldConfig> {
    const config = { ...this.fieldConfig };

    // Apply breath modulation
    if (breathState && config.breathEntrained) {
      this.applyBreathModulation(config, breathState);
    }

    // Adjust for input characteristics
    this.adjustForInputType(config, input);

    return config;
  }

  /**
   * Breath modulates field atmosphere
   */
  private applyBreathModulation(config: FieldConfig, breathState: any): void {
    const { phase, coherence } = breathState;

    switch (phase) {
      case 'inhale':
        // Amplify wisdom agents
        config.agents.get('claude-wisdom')!.weight *= 1.2;
        config.agents.get('higher-self')!.weight *= 1.15;
        config.agents.get('elemental-oracle')!.weight *= 1.1;
        break;

      case 'hold':
        config.globalSensitivity *= 1.3;
        break;

      case 'exhale':
        // Release shadow
        config.agents.get('shadow')!.weight *= 1.3;
        config.agents.get('unconscious')!.weight *= 1.2;
        break;

      case 'pause':
        // Maximum silence
        config.silenceThreshold *= 1.4;
        break;
    }

    // Coherence effects
    if (coherence > 0.8) {
      config.agents.forEach(agent => {
        agent.threshold *= 0.9; // Easier to activate
      });
    } else if (coherence < 0.3) {
      config.agents.get('attachment')!.weight *= 1.5;
      config.agents.get('crisis-detection')!.weight *= 1.3;
    }
  }

  /**
   * Adjust for input type
   */
  private adjustForInputType(config: FieldConfig, input: string): void {
    if (input.includes('?')) {
      config.agents.get('elemental-oracle')!.weight *= 1.2;
      config.agents.get('conscious-mind')!.weight *= 1.1;
    }

    const emotionalWords = ['feel', 'feeling', 'emotion', 'heart', 'soul'];
    if (emotionalWords.some(w => input.toLowerCase().includes(w))) {
      config.agents.get('inner-child')!.weight *= 1.15;
      config.agents.get('anima')!.weight *= 1.1;
    }
  }

  /**
   * Calculate field state metrics
   */
  private calculateFieldState(
    pattern: number[][],
    breathState?: any
  ): FieldState {
    return {
      coherence: this.calculatePatternCoherence(pattern),
      entropy: this.calculatePatternEntropy(pattern),
      resonance: this.calculatePatternResonance(pattern),
      interference: pattern,
      dominantFrequency: this.findDominantFrequency(pattern),
      breathPhase: breathState?.phase,
      timestamp: Date.now()
    };
  }

  /**
   * Should return intentional silence?
   */
  private shouldReturnSilence(): boolean {
    return this.fieldState.coherence < this.fieldConfig.silenceThreshold ||
           this.fieldState.entropy > 0.9;
  }

  /**
   * Handle catastrophic errors
   */
  private async handleCatastrophicError(input: string, error: any): Promise<EmergenceResult> {
    this.fallbackTriggerCount++;

    if (this.fallbackTriggerCount >= this.maxFallbacksBeforeAlert) {
      console.error('[CRITICAL] Multiple catastrophic failures', {
        count: this.fallbackTriggerCount,
        lastError: error
      });
    }

    return {
      response: "I need a moment to recalibrate. Let's pause here.",
      fieldState: this.fieldState,
      signature: 'catastrophic_fallback',
      emergenceTime: 0
    };
  }

  private isCatastrophicError(error: any): boolean {
    return error.code === 'FIELD_COLLAPSE' ||
           error.code === 'AGENT_TIMEOUT' ||
           error.code === 'MEMORY_OVERFLOW';
  }

  // ==================== Field Calculations ====================

  private calculatePatternCoherence(pattern: number[][]): number {
    let variance = 0;
    let mean = 0;
    let count = 0;

    for (const row of pattern) {
      for (const value of row) {
        mean += value;
        count++;
      }
    }
    mean /= count;

    for (const row of pattern) {
      for (const value of row) {
        variance += Math.pow(value - mean, 2);
      }
    }
    variance /= count;

    return Math.exp(-variance / 10);
  }

  private calculatePatternEntropy(pattern: number[][]): number {
    const histogram = new Map<number, number>();
    const buckets = 20;

    for (const row of pattern) {
      for (const value of row) {
        const bucket = Math.floor((value + 10) * buckets / 20);
        histogram.set(bucket, (histogram.get(bucket) || 0) + 1);
      }
    }

    let entropy = 0;
    const total = pattern.length * pattern[0].length;

    for (const count of histogram.values()) {
      const p = count / total;
      if (p > 0) entropy -= p * Math.log2(p);
    }

    return entropy / Math.log2(buckets);
  }

  private calculatePatternResonance(pattern: number[][]): number {
    // Simplified resonance calculation
    // In production: use FFT to find repeating patterns
    return 0.5; // Placeholder
  }

  private findDominantFrequency(pattern: number[][]): number {
    // Return dominant agent frequency
    return 432; // Placeholder - would analyze FFT peaks
  }

  // ==================== Initialization ====================

  private initializeFieldConfig(): FieldConfig {
    const agents = new Map<string, AgentConfig>();

    // The 11 agents with their frequencies
    const agentConfigs: Record<string, AgentConfig> = {
      'claude-wisdom': {
        weight: 1.0,
        frequency: 432,  // Grounding, wisdom
        phase: 0,
        threshold: 0.7,
        harmonics: [864, 216],
        enabled: true
      },
      'elemental-oracle': {
        weight: 0.9,
        frequency: 528,  // Transformation
        phase: Math.PI / 4,
        threshold: 0.6,
        harmonics: [1056, 264],
        enabled: true
      },
      'higher-self': {
        weight: 0.95,
        frequency: 639,  // Connection
        phase: Math.PI / 2,
        threshold: 0.65,
        harmonics: [1278, 319.5],
        enabled: true
      },
      'lower-self': {
        weight: 0.7,
        frequency: 396,  // Liberation
        phase: Math.PI,
        threshold: 0.5,
        harmonics: [792, 198],
        enabled: true
      },
      'conscious-mind': {
        weight: 0.85,
        frequency: 741,  // Expression
        phase: 0,
        threshold: 0.6,
        harmonics: [1482, 370.5],
        enabled: true
      },
      'unconscious': {
        weight: 0.75,
        frequency: 417,  // Change
        phase: Math.PI / 3,
        threshold: 0.55,
        harmonics: [834, 208.5],
        enabled: true
      },
      'shadow': {
        weight: 0.6,
        frequency: 285,  // Shadow work
        phase: Math.PI * 1.5,
        threshold: 0.4,
        harmonics: [570, 142.5],
        enabled: true
      },
      'inner-child': {
        weight: 0.8,
        frequency: 963,  // Divine connection
        phase: Math.PI / 6,
        threshold: 0.5,
        harmonics: [1926, 481.5],
        enabled: true
      },
      'anima': {
        weight: 0.75,
        frequency: 852,  // Intuition
        phase: Math.PI / 5,
        threshold: 0.55,
        harmonics: [1704, 426],
        enabled: true
      },
      'crisis-detection': {
        weight: 0.5,
        frequency: 174,  // Foundation
        phase: 0,
        threshold: 0.8,
        harmonics: [348, 87],
        enabled: true
      },
      'attachment': {
        weight: 0.65,
        frequency: 111,  // Grounding
        phase: Math.PI / 8,
        threshold: 0.45,
        harmonics: [222, 55.5],
        enabled: true
      }
    };

    for (const [name, config] of Object.entries(agentConfigs)) {
      agents.set(name, config);
    }

    return {
      agents,
      globalSensitivity: 1.0,
      harmonicFrequencies: [432, 528, 639, 741, 852, 963],
      breathEntrained: true,
      silenceThreshold: 0.3,
      emergenceTimeout: 3000
    };
  }

  private initializeFieldState(): FieldState {
    return {
      coherence: 0.5,
      entropy: 0.5,
      resonance: 0.5,
      interference: [],
      dominantFrequency: 432,
      timestamp: Date.now()
    };
  }

  // ==================== Utilities ====================

  private generateSignature(): string {
    const activeAgents = Array.from(this.fieldConfig.agents.entries())
      .filter(([, config]) => config.enabled)
      .map(([name]) => name.substring(0, 3))
      .join('_');

    const stateHash = Math.floor(
      this.fieldState.coherence * 1000 +
      this.fieldState.entropy * 100 +
      this.fieldState.resonance * 10
    ).toString(36);

    return `${activeAgents}_${stateHash}`;
  }

  private calculateEmergenceThreshold(pattern: number[][]): number {
    let max = -Infinity;
    for (const row of pattern) {
      for (const value of row) {
        max = Math.max(max, Math.abs(value));
      }
    }
    return max * 0.7;
  }

  private calculateZoneStrength(
    pattern: number[][],
    x: number,
    y: number,
    size: number
  ): number {
    let sum = 0;
    for (let i = x; i < x + size; i++) {
      for (let j = y; j < y + size; j++) {
        sum += pattern[i][j];
      }
    }
    return sum / (size * size);
  }

  private extractZonePattern(
    pattern: number[][],
    x: number,
    y: number,
    size: number
  ): number[][] {
    const zone: number[][] = [];
    for (let i = x; i < x + size; i++) {
      const row: number[] = [];
      for (let j = y; j < y + size; j++) {
        row.push(pattern[i][j]);
      }
      zone.push(row);
    }
    return zone;
  }

  private analyzeZoneCharacteristics(zone: EmergenceZone): any {
    return {
      intensity: zone.strength,
      pattern: zone.pattern,
      location: { x: zone.x, y: zone.y }
    };
  }

  private async calculateAgentAmplitude(
    agentName: string,
    input: string
  ): Promise<number> {
    // Agent-specific resonance with input
    // Simplified - in production use agent logic from CAFS
    const hash = this.hashString(agentName + input);
    return (hash % 100) / 100;
  }

  private generateFieldVector(amplitude: number, config: AgentConfig): number[] {
    // Generate n-dimensional vector for this agent's field
    return [amplitude, config.frequency, config.phase];
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }

  // ==================== Public API ====================

  getFieldConfig(): FieldConfig {
    return this.fieldConfig;
  }

  updateFieldConfig(config: FieldConfig): void {
    this.fieldConfig = config;
  }

  getFieldState(): FieldState {
    return this.fieldState;
  }
}

export default FullFieldDominanceSystem;