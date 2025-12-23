/**
 * Spatial Soundscape Engine - Journey Page Phase 4
 *
 * Generative ambient soundscape that responds to:
 * - Five-element energy ratios (Earth, Water, Fire, Air, Aether)
 * - Thread activation state
 * - Collective coherence levels
 * - User interaction events
 *
 * Uses Tone.js for synthesis and spatial audio.
 *
 * Phase: 4.4-C Phase 4 (Interaction & Narrative Integration)
 * Created: December 23, 2024
 */

import * as Tone from 'tone';

// ============================================================================
// Types
// ============================================================================

export interface ElementRatios {
  earth: number;  // 0-1
  water: number;  // 0-1
  fire: number;   // 0-1
  air: number;    // 0-1
  aether: number; // 0-1
}

export interface SoundscapeConfig {
  /** Master volume (-60 to 0 dB) */
  masterVolume: number;

  /** Enable spatial panning */
  spatialEnabled: boolean;

  /** Reverb amount (0-1) */
  reverbMix: number;

  /** Base frequency (Hz) */
  baseFrequency: number;
}

export type SoundscapeEvent =
  | 'threadClick'
  | 'threadHover'
  | 'coherenceShift'
  | 'elementTransition';

// ============================================================================
// Soundscape Engine Class
// ============================================================================

/**
 * SpatialSoundscape
 *
 * Manages the generative audio layer for the Journey Page.
 * Creates a living sonic field that evolves with the visualization.
 *
 * @example
 * ```tsx
 * const soundscape = new SpatialSoundscape();
 * await soundscape.initialize();
 *
 * // Update with element ratios
 * soundscape.updateElements({
 *   earth: 0.2,
 *   water: 0.3,
 *   fire: 0.1,
 *   air: 0.25,
 *   aether: 0.15,
 * });
 *
 * // Trigger event
 * soundscape.playEvent('threadClick', { frequency: 440 });
 *
 * // Clean up
 * soundscape.dispose();
 * ```
 */
export class SpatialSoundscape {
  // Configuration
  private config: SoundscapeConfig;

  // Audio Context State
  private isInitialized = false;
  private isPlaying = false;

  // Tone.js Components
  private masterGain: Tone.Gain | null = null;
  private reverb: Tone.Reverb | null = null;
  private panner: Tone.Panner3D | null = null;

  // Element Synths (one per element)
  private earthSynth: Tone.Synth | null = null;
  private waterSynth: Tone.Synth | null = null;
  private fireSynth: Tone.Synth | null = null;
  private airSynth: Tone.Synth | null = null;
  private aetherSynth: Tone.Synth | null = null;

  // Background Drone
  private droneSynth: Tone.AMSynth | null = null;

  // Event Synth (for clicks/interactions)
  private eventSynth: Tone.FMSynth | null = null;

  // Current element ratios
  private elementRatios: ElementRatios = {
    earth: 0.2,
    water: 0.2,
    fire: 0.2,
    air: 0.2,
    aether: 0.2,
  };

  // ============================================================================
  // Constructor
  // ============================================================================

  constructor(config: Partial<SoundscapeConfig> = {}) {
    this.config = {
      masterVolume: -20,
      spatialEnabled: true,
      reverbMix: 0.3,
      baseFrequency: 110, // A2
      ...config,
    };
  }

  // ============================================================================
  // Initialization
  // ============================================================================

  /**
   * Initialize the audio context and create all synths.
   * Must be called after user interaction (browser autoplay policy).
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Start Tone.js context
      await Tone.start();
      console.log('[Soundscape] Audio context started');

      // Create master gain
      this.masterGain = new Tone.Gain(
        Tone.gainToDb(this.config.masterVolume)
      ).toDestination();

      // Create reverb
      this.reverb = new Tone.Reverb({
        decay: 4,
        wet: this.config.reverbMix,
      }).connect(this.masterGain);

      // Create spatial panner
      if (this.config.spatialEnabled) {
        this.panner = new Tone.Panner3D({
          positionX: 0,
          positionY: 0,
          positionZ: 0,
          panningModel: 'HRTF',
        }).connect(this.reverb);
      }

      // Create element synths
      await this.createElementSynths();

      // Create drone synth
      this.droneSynth = new Tone.AMSynth({
        harmonicity: 2,
        oscillator: { type: 'sine' },
        envelope: { attack: 4, decay: 0, sustain: 1, release: 8 },
        modulation: { type: 'sine' },
        modulationEnvelope: { attack: 0.5, decay: 0, sustain: 1, release: 0.5 },
      }).connect(this.getOutputNode());

      // Create event synth
      this.eventSynth = new Tone.FMSynth({
        harmonicity: 3,
        modulationIndex: 10,
        oscillator: { type: 'sine' },
        envelope: { attack: 0.01, decay: 0.5, sustain: 0, release: 0.5 },
        modulation: { type: 'square' },
        modulationEnvelope: { attack: 0.01, decay: 0.2, sustain: 0, release: 0.1 },
      }).connect(this.getOutputNode());

      this.isInitialized = true;
      console.log('[Soundscape] Initialized successfully');
    } catch (error) {
      console.error('[Soundscape] Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Create individual synths for each element with unique timbres.
   */
  private async createElementSynths(): Promise<void> {
    const output = this.getOutputNode();

    // 🫀 Earth - Deep, grounded sine wave
    this.earthSynth = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 2, decay: 0, sustain: 1, release: 4 },
      volume: -12,
    }).connect(output);

    // 💧 Water - Flowing triangle wave
    this.waterSynth = new Tone.Synth({
      oscillator: { type: 'triangle' },
      envelope: { attack: 1.5, decay: 0, sustain: 1, release: 3 },
      volume: -14,
    }).connect(output);

    // 🔥 Fire - Sharp sawtooth
    this.fireSynth = new Tone.Synth({
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.5, decay: 0, sustain: 1, release: 2 },
      volume: -16,
    }).connect(output);

    // 🌬️ Air - Breathy square wave
    this.airSynth = new Tone.Synth({
      oscillator: { type: 'square' },
      envelope: { attack: 1, decay: 0, sustain: 1, release: 2.5 },
      volume: -15,
    }).connect(output);

    // ✨ Aether - Ethereal pulse
    this.aetherSynth = new Tone.Synth({
      oscillator: { type: 'pulse', width: 0.2 },
      envelope: { attack: 3, decay: 0, sustain: 1, release: 5 },
      volume: -13,
    }).connect(output);
  }

  /**
   * Get the current output node (panner or reverb).
   */
  private getOutputNode(): Tone.ToneAudioNode {
    return this.panner || this.reverb!;
  }

  // ============================================================================
  // Playback Control
  // ============================================================================

  /**
   * Start the background soundscape.
   */
  async start(): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('[Soundscape] Must initialize before starting');
    }

    if (this.isPlaying) return;

    // Start drone
    this.droneSynth?.triggerAttack(this.config.baseFrequency);

    // Start element synths with initial frequencies
    this.updateElementFrequencies();

    this.isPlaying = true;
    console.log('[Soundscape] Started');
  }

  /**
   * Stop the background soundscape.
   */
  stop(): void {
    if (!this.isPlaying) return;

    // Release all notes
    this.droneSynth?.triggerRelease();
    this.earthSynth?.triggerRelease();
    this.waterSynth?.triggerRelease();
    this.fireSynth?.triggerRelease();
    this.airSynth?.triggerRelease();
    this.aetherSynth?.triggerRelease();

    this.isPlaying = false;
    console.log('[Soundscape] Stopped');
  }

  // ============================================================================
  // Element Updates
  // ============================================================================

  /**
   * Update element energy ratios.
   * Smoothly transitions frequencies and volumes.
   */
  updateElements(ratios: Partial<ElementRatios>): void {
    if (!this.isInitialized) return;

    // Merge with current ratios
    this.elementRatios = {
      ...this.elementRatios,
      ...ratios,
    };

    // Update frequencies and volumes
    this.updateElementFrequencies();
    this.updateElementVolumes();
  }

  /**
   * Update synth frequencies based on element ratios.
   * Each element has a unique harmonic relationship to the base frequency.
   */
  private updateElementFrequencies(): void {
    const { baseFrequency } = this.config;
    const { earth, water, fire, air, aether } = this.elementRatios;

    // Earth: Root (1x base)
    const earthFreq = baseFrequency * (1 + earth * 0.1);
    this.earthSynth?.frequency.rampTo(earthFreq, 2);

    // Water: Perfect Fifth (1.5x base)
    const waterFreq = baseFrequency * 1.5 * (1 + water * 0.1);
    this.waterSynth?.frequency.rampTo(waterFreq, 2);

    // Fire: Major Third (1.25x base)
    const fireFreq = baseFrequency * 1.25 * (1 + fire * 0.15);
    this.fireSynth?.frequency.rampTo(fireFreq, 2);

    // Air: Major Seventh (1.875x base)
    const airFreq = baseFrequency * 1.875 * (1 + air * 0.12);
    this.airSynth?.frequency.rampTo(airFreq, 2);

    // Aether: Octave + Fifth (3x base)
    const aetherFreq = baseFrequency * 3 * (1 + aether * 0.08);
    this.aetherSynth?.frequency.rampTo(aetherFreq, 2);

    // Trigger notes if playing
    if (this.isPlaying) {
      if (earth > 0.05 && !this.earthSynth?.envelope.value) {
        this.earthSynth?.triggerAttack(earthFreq);
      }
      if (water > 0.05 && !this.waterSynth?.envelope.value) {
        this.waterSynth?.triggerAttack(waterFreq);
      }
      if (fire > 0.05 && !this.fireSynth?.envelope.value) {
        this.fireSynth?.triggerAttack(fireFreq);
      }
      if (air > 0.05 && !this.airSynth?.envelope.value) {
        this.airSynth?.triggerAttack(airFreq);
      }
      if (aether > 0.05 && !this.aetherSynth?.envelope.value) {
        this.aetherSynth?.triggerAttack(aetherFreq);
      }
    }
  }

  /**
   * Update synth volumes based on element ratios.
   */
  private updateElementVolumes(): void {
    const { earth, water, fire, air, aether } = this.elementRatios;

    // Map ratios to decibel values (-60 to -10 dB)
    const mapToDb = (ratio: number) => -60 + ratio * 50;

    this.earthSynth?.volume.rampTo(mapToDb(earth), 1);
    this.waterSynth?.volume.rampTo(mapToDb(water), 1);
    this.fireSynth?.volume.rampTo(mapToDb(fire), 1);
    this.airSynth?.volume.rampTo(mapToDb(air), 1);
    this.aetherSynth?.volume.rampTo(mapToDb(aether), 1);
  }

  // ============================================================================
  // Event Sounds
  // ============================================================================

  /**
   * Play a sound for interaction events (clicks, hovers, etc).
   */
  playEvent(
    event: SoundscapeEvent,
    options: { frequency?: number; duration?: number } = {}
  ): void {
    if (!this.isInitialized || !this.eventSynth) return;

    const { frequency = 440, duration = 0.3 } = options;

    switch (event) {
      case 'threadClick':
        // Bright chime
        this.eventSynth.triggerAttackRelease(frequency, duration);
        break;

      case 'threadHover':
        // Subtle ping
        this.eventSynth.triggerAttackRelease(frequency * 2, duration * 0.5);
        break;

      case 'coherenceShift':
        // Harmonic swell
        this.eventSynth.triggerAttackRelease(frequency * 1.5, duration * 2);
        break;

      case 'elementTransition':
        // Ascending arpeggio
        [1, 1.25, 1.5, 2].forEach((mult, i) => {
          setTimeout(() => {
            this.eventSynth?.triggerAttackRelease(
              frequency * mult,
              duration * 0.5
            );
          }, i * 100);
        });
        break;
    }
  }

  // ============================================================================
  // Spatial Audio
  // ============================================================================

  /**
   * Update the position of the sound source in 3D space.
   * Coordinates should match Three.js camera space.
   */
  updateSpatialPosition(x: number, y: number, z: number): void {
    if (!this.panner) return;

    this.panner.positionX.rampTo(x, 0.5);
    this.panner.positionY.rampTo(y, 0.5);
    this.panner.positionZ.rampTo(z, 0.5);
  }

  // ============================================================================
  // Configuration
  // ============================================================================

  /**
   * Update master volume.
   */
  setVolume(db: number): void {
    if (!this.masterGain) return;
    this.masterGain.gain.rampTo(Tone.gainToDb(db), 0.5);
  }

  /**
   * Update reverb mix.
   */
  setReverbMix(mix: number): void {
    if (!this.reverb) return;
    this.reverb.wet.rampTo(mix, 1);
  }

  // ============================================================================
  // Lifecycle
  // ============================================================================

  /**
   * Clean up all audio resources.
   */
  dispose(): void {
    if (!this.isInitialized) return;

    this.stop();

    // Dispose all synths
    this.earthSynth?.dispose();
    this.waterSynth?.dispose();
    this.fireSynth?.dispose();
    this.airSynth?.dispose();
    this.aetherSynth?.dispose();
    this.droneSynth?.dispose();
    this.eventSynth?.dispose();

    // Dispose effects
    this.panner?.dispose();
    this.reverb?.dispose();
    this.masterGain?.dispose();

    this.isInitialized = false;
    console.log('[Soundscape] Disposed');
  }

  // ============================================================================
  // Getters
  // ============================================================================

  get initialized(): boolean {
    return this.isInitialized;
  }

  get playing(): boolean {
    return this.isPlaying;
  }

  get currentElements(): ElementRatios {
    return { ...this.elementRatios };
  }
}

// ============================================================================
// Singleton Instance (Optional)
// ============================================================================

let globalSoundscape: SpatialSoundscape | null = null;

/**
 * Get the global soundscape instance.
 * Creates one if it doesn't exist.
 */
export function getSoundscape(config?: Partial<SoundscapeConfig>): SpatialSoundscape {
  if (!globalSoundscape) {
    globalSoundscape = new SpatialSoundscape(config);
  }
  return globalSoundscape;
}

/**
 * Dispose the global soundscape instance.
 */
export function disposeSoundscape(): void {
  if (globalSoundscape) {
    globalSoundscape.dispose();
    globalSoundscape = null;
  }
}
