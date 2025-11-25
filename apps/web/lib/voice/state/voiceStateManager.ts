/**
 * Voice State Manager
 *
 * Tracks MAIA's breath cycle through distinct states:
 * silence → inhale → hold → exhale → settling → silence
 *
 * Emits state changes for holoflower visualization and system coordination.
 */

import type { Element } from '../modulation/elementalVoices';

export type VoiceState = 'silence' | 'inhale' | 'hold' | 'exhale' | 'settling';

export interface VoiceStateData {
  state: VoiceState;
  phase: Element;
  amplitude: number;        // 0.0 - 1.0 (current sound level)
  spectralCentroid: number; // Hz (brightness of sound)
  breathProgress: number;   // 0.0 - 1.0 (progress through current breath cycle)
  phiPosition: number;      // 0.0 - 2.618 (position in phi spiral, 0 to φ²)
  timestamp: number;        // Unix timestamp of state change
}

type StateChangeListener = (state: VoiceStateData) => void;

/**
 * VoiceStateManager
 * Singleton service managing voice state transitions
 */
export class VoiceStateManager {
  private currentState: VoiceStateData;
  private listeners: Set<StateChangeListener> = new Set();
  private breathStartTime = 0;
  private breathDuration = 1618; // Default phi breath cycle (ms)

  constructor() {
    this.currentState = {
      state: 'silence',
      phase: 'aether',
      amplitude: 0,
      spectralCentroid: 0,
      breathProgress: 0,
      phiPosition: 0,
      timestamp: Date.now(),
    };
  }

  /**
   * Get current voice state
   */
  getState(): VoiceStateData {
    return { ...this.currentState };
  }

  /**
   * Transition to a new state
   */
  transition(newState: VoiceState, phase?: Element): void {
    const now = Date.now();

    // Update breath cycle tracking
    if (newState === 'inhale') {
      this.breathStartTime = now;
    }

    this.currentState = {
      ...this.currentState,
      state: newState,
      phase: phase || this.currentState.phase,
      timestamp: now,
    };

    console.log(`🌬️ [VoiceState] ${this.currentState.state.toUpperCase()} (${this.currentState.phase})`);

    this.notifyListeners();
  }

  /**
   * Update amplitude and spectral data (called during audio playback)
   */
  updateAudioData(amplitude: number, spectralCentroid?: number): void {
    const now = Date.now();

    // Calculate breath progress
    const elapsed = now - this.breathStartTime;
    const progress = Math.min(1.0, elapsed / this.breathDuration);

    // Calculate phi position (0 to φ² ≈ 2.618)
    const PHI = 1.618033988749;
    const phiPosition = progress * PHI * PHI;

    this.currentState = {
      ...this.currentState,
      amplitude,
      spectralCentroid: spectralCentroid || this.currentState.spectralCentroid,
      breathProgress: progress,
      phiPosition,
      timestamp: now,
    };

    this.notifyListeners();
  }

  /**
   * Set breath cycle duration
   */
  setBreathDuration(durationMs: number): void {
    this.breathDuration = durationMs;
  }

  /**
   * Get breath cycle duration
   */
  getBreathDuration(): number {
    return this.breathDuration;
  }

  /**
   * Subscribe to state changes
   */
  subscribe(listener: StateChangeListener): () => void {
    this.listeners.add(listener);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all listeners of state change
   */
  private notifyListeners(): void {
    const stateSnapshot = { ...this.currentState };
    this.listeners.forEach(listener => {
      try {
        listener(stateSnapshot);
      } catch (error) {
        console.error('Error in VoiceStateManager listener:', error);
      }
    });
  }

  /**
   * Check if currently speaking
   */
  isSpeaking(): boolean {
    return this.currentState.state === 'exhale';
  }

  /**
   * Check if currently listening
   */
  isListening(): boolean {
    return this.currentState.state === 'inhale';
  }

  /**
   * Check if in silence/rest
   */
  isSilent(): boolean {
    return this.currentState.state === 'silence';
  }

  /**
   * Reset to silence
   */
  reset(): void {
    this.transition('silence', 'aether');
    this.breathStartTime = 0;
  }
}

// Singleton instance
export const voiceStateManager = new VoiceStateManager();
