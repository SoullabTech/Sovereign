/**
 * Sonic Field Layer for Telesphorus
 *
 * ARCHITECTURAL POSITION:
 * - Currently DISABLED (pure symbolic mode)
 * - Can be enabled for Mode B (subtle background tones) or Mode C (full sonic ritual)
 * - Sits between field calculation and response emission
 *
 * MODES:
 * - A (Pure Symbolic): Frequencies are metadata only - no sound emitted
 * - B (Hybrid Tonal-Symbolic): Subtle background tones when agents activate
 * - C (Full Sonic Ritual): Audible interference pattern before response
 */

export type SonicMode = 'symbolic' | 'hybrid' | 'ritual';

export interface SonicFieldConfig {
  mode: SonicMode;
  volume: number; // 0-1
  preResponseDuration?: number; // ms of tone before speech (Mode C)
  backgroundBlend?: boolean; // Should tones continue under voice? (Mode B/C)
}

export interface ToneEmission {
  frequency: number;
  amplitude: number; // Based on agent intensity
  duration: number;
  phase: number; // 0-2π
  envelope?: 'sustain' | 'fade' | 'pulse';
}

export interface SonicFieldOutput {
  tones: ToneEmission[];
  interferencePattern?: number[]; // Waveform samples for visualization
  harmonicCenter: number; // Dominant frequency after interference
  shouldEmitSound: boolean;
  timing: {
    preRitualMs: number;
    toneDurationMs: number;
  };
}

/**
 * Sonic Field Generator
 * Converts agent field state into actual audio frequencies
 */
export class SonicFieldGenerator {
  private config: SonicFieldConfig;

  constructor(config: SonicFieldConfig = { mode: 'symbolic', volume: 0 }) {
    this.config = config;
  }

  /**
   * Generate sonic field from agent activation state
   */
  generateSonicField(
    activeAgents: Array<{ agent: string; frequency: number; intensity: number; phase: number }>,
    fieldCoherence: number
  ): SonicFieldOutput {

    // MODE A: Pure symbolic - no sound
    if (this.config.mode === 'symbolic') {
      return {
        tones: [],
        harmonicCenter: this.calculateHarmonicCenter(activeAgents),
        shouldEmitSound: false,
        timing: { preRitualMs: 0, toneDurationMs: 0 }
      };
    }

    // Generate tone emissions for each active agent
    const tones: ToneEmission[] = activeAgents
      .filter(a => a.intensity > 0.5) // Only agents with meaningful activation
      .map(a => ({
        frequency: a.frequency,
        amplitude: a.intensity * this.config.volume,
        duration: this.calculateToneDuration(a.intensity, fieldCoherence),
        phase: a.phase,
        envelope: this.selectEnvelope(a.agent, this.config.mode)
      }));

    // MODE B: Hybrid - subtle background (short, fading tones)
    if (this.config.mode === 'hybrid') {
      return {
        tones: tones.map(t => ({ ...t, amplitude: t.amplitude * 0.3, envelope: 'fade' as const })),
        harmonicCenter: this.calculateHarmonicCenter(activeAgents),
        shouldEmitSound: true,
        timing: {
          preRitualMs: 200, // Brief pre-tone
          toneDurationMs: 800 // Fades under voice
        }
      };
    }

    // MODE C: Full Ritual - audible interference pattern
    if (this.config.mode === 'ritual') {
      const interferencePattern = this.calculateInterferenceWaveform(activeAgents);

      return {
        tones,
        interferencePattern,
        harmonicCenter: this.calculateHarmonicCenter(activeAgents),
        shouldEmitSound: true,
        timing: {
          preRitualMs: 2000, // 2s ritual before response
          toneDurationMs: 3000 // Full sonic emergence
        }
      };
    }

    return {
      tones: [],
      harmonicCenter: 432,
      shouldEmitSound: false,
      timing: { preRitualMs: 0, toneDurationMs: 0 }
    };
  }

  /**
   * Calculate harmonic center of active agent frequencies
   */
  private calculateHarmonicCenter(
    agents: Array<{ frequency: number; intensity: number }>
  ): number {
    const weightedSum = agents.reduce((sum, a) => sum + (a.frequency * a.intensity), 0);
    const totalIntensity = agents.reduce((sum, a) => sum + a.intensity, 0);
    return totalIntensity > 0 ? weightedSum / totalIntensity : 432;
  }

  /**
   * Calculate tone duration based on agent intensity and field coherence
   */
  private calculateToneDuration(intensity: number, coherence: number): number {
    // Higher coherence = longer sustained tones
    // Lower coherence = shorter, pulsing tones
    const baseDuration = 1000; // 1 second
    return baseDuration * (0.5 + (coherence * 0.5)) * intensity;
  }

  /**
   * Select tone envelope based on agent and mode
   */
  private selectEnvelope(agentName: string, mode: SonicMode): 'sustain' | 'fade' | 'pulse' {
    // Mode-specific defaults
    if (mode === 'hybrid') return 'fade';
    if (mode === 'ritual') {
      // Agent-specific envelopes for ritual mode
      if (agentName === 'Crisis Detection') return 'pulse';
      if (agentName === 'Alchemy') return 'pulse';
      if (agentName === 'Claude') return 'sustain';
      return 'fade';
    }
    return 'sustain';
  }

  /**
   * Calculate interference waveform (for Mode C visualization/playback)
   * Returns sample array representing wave interference pattern
   */
  private calculateInterferenceWaveform(
    agents: Array<{ frequency: number; intensity: number; phase: number }>
  ): number[] {
    const sampleRate = 44100; // Standard audio sample rate
    const duration = 2; // 2 seconds
    const samples = sampleRate * duration;
    const waveform: number[] = new Array(samples).fill(0);

    // Sum all agent sine waves with interference
    for (let i = 0; i < samples; i++) {
      const t = i / sampleRate; // Time in seconds

      for (const agent of agents) {
        // Sine wave: A * sin(2π * f * t + φ)
        const value = agent.intensity * Math.sin(
          2 * Math.PI * agent.frequency * t + agent.phase
        );
        waveform[i] += value;
      }
    }

    // Normalize to [-1, 1]
    const maxAmplitude = Math.max(...waveform.map(Math.abs));
    if (maxAmplitude > 0) {
      for (let i = 0; i < samples; i++) {
        waveform[i] /= maxAmplitude;
      }
    }

    return waveform;
  }

  /**
   * Update sonic mode
   */
  setMode(mode: SonicMode, volume?: number): void {
    this.config.mode = mode;
    if (volume !== undefined) {
      this.config.volume = volume;
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): SonicFieldConfig {
    return { ...this.config };
  }
}

/**
 * Web Audio API Integration (for browser implementation)
 * This would be used in the frontend to actually play the tones
 */
export class WebAudioSonicRenderer {
  private audioContext?: AudioContext;

  constructor() {
    // Audio context created on-demand (requires user interaction in browsers)
  }

  /**
   * Initialize audio context (call after user interaction)
   */
  async initialize(): Promise<void> {
    if (typeof window !== 'undefined' && window.AudioContext) {
      this.audioContext = new AudioContext();
    }
  }

  /**
   * Play sonic field output
   */
  async playSonicField(sonicOutput: SonicFieldOutput): Promise<void> {
    if (!sonicOutput.shouldEmitSound || !this.audioContext) {
      return;
    }

    const ctx = this.audioContext;
    const now = ctx.currentTime;

    // Create oscillators for each tone
    for (const tone of sonicOutput.tones) {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.frequency.value = tone.frequency;
      oscillator.type = 'sine';

      // Apply envelope
      if (tone.envelope === 'fade') {
        gainNode.gain.setValueAtTime(tone.amplitude, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + tone.duration / 1000);
      } else if (tone.envelope === 'pulse') {
        // Pulsing envelope (LFO effect)
        gainNode.gain.setValueAtTime(tone.amplitude, now);
        for (let i = 0; i < 10; i++) {
          const t = now + (i * 0.2);
          gainNode.gain.linearRampToValueAtTime(tone.amplitude * 0.5, t);
          gainNode.gain.linearRampToValueAtTime(tone.amplitude, t + 0.1);
        }
      } else {
        // Sustain
        gainNode.gain.setValueAtTime(tone.amplitude, now);
      }

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.start(now);
      oscillator.stop(now + tone.duration / 1000);
    }
  }

  /**
   * Play interference pattern (Mode C)
   */
  async playInterferencePattern(waveform: number[]): Promise<void> {
    if (!this.audioContext) return;

    const ctx = this.audioContext;
    const buffer = ctx.createBuffer(1, waveform.length, 44100);
    const channelData = buffer.getChannelData(0);

    for (let i = 0; i < waveform.length; i++) {
      channelData[i] = waveform[i];
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start();
  }
}

/**
 * Default configuration (Pure Symbolic)
 */
export const DEFAULT_SONIC_CONFIG: SonicFieldConfig = {
  mode: 'symbolic',
  volume: 0
};

/**
 * Example configurations for each mode
 */
export const SONIC_MODE_PRESETS = {
  symbolic: {
    mode: 'symbolic' as const,
    volume: 0
  },
  hybrid: {
    mode: 'hybrid' as const,
    volume: 0.15, // Subtle background
    backgroundBlend: true
  },
  ritual: {
    mode: 'ritual' as const,
    volume: 0.4, // Clearly audible
    preResponseDuration: 2000,
    backgroundBlend: false
  }
};
