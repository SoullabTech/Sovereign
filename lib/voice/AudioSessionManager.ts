/**
 * AudioSessionManager - TypeScript wrapper for the native iOS AudioSessionManager plugin
 *
 * This module provides a type-safe interface to manage iOS audio sessions,
 * ensuring TTS and speech recognition never fight over the audio session.
 */

import { Capacitor, registerPlugin } from '@capacitor/core';

// ============================================================================
// Types
// ============================================================================

export type AudioState = 'idle' | 'listening' | 'speaking' | 'transitioning';

export interface PrepareForListeningResult {
  success: boolean;
  state: 'listening';
  sampleRate: number;
  inputChannels: number;
}

export interface PrepareForSpeakingResult {
  success: boolean;
  state: 'speaking';
}

export interface StopAllAudioResult {
  success: boolean;
  state: 'idle';
}

export interface AudioInput {
  portName: string;
  portType: string;
  uid: string;
}

export interface AudioDiagnostics {
  currentState: AudioState;
  category: string;
  mode: string;
  isOtherAudioPlaying: boolean;
  sampleRate: number;
  inputAvailable: boolean;
  inputDataSource?: string;
  outputDataSource?: string;
  inputNumberOfChannels: number;
  outputNumberOfChannels: number;
  preferredSampleRate: number;
  inputLatency: number;
  outputLatency: number;
  availableInputs: AudioInput[];
}

export interface AudioSessionManagerPlugin {
  prepareForListening(): Promise<PrepareForListeningResult>;
  prepareForSpeaking(): Promise<PrepareForSpeakingResult>;
  stopAllAudio(): Promise<StopAllAudioResult>;
  getAudioDiagnostics(): Promise<AudioDiagnostics>;
}

// ============================================================================
// Plugin Registration
// ============================================================================

const AudioSessionManagerPlugin = registerPlugin<AudioSessionManagerPlugin>(
  'AudioSessionManager',
  {
    // Web fallback - no-op implementations for development
    web: () =>
      import('./AudioSessionManagerWeb').then((m) => new m.AudioSessionManagerWeb()),
  }
);

// ============================================================================
// VoiceController - High-level wrapper with state management
// ============================================================================

/**
 * VoiceController provides a high-level interface for managing voice I/O.
 * It ensures proper sequencing of audio mode transitions and provides
 * callbacks for state changes.
 */
class VoiceControllerImpl {
  private currentState: AudioState = 'idle';
  private stateListeners: Set<(state: AudioState) => void> = new Set();
  private isNative: boolean;

  constructor() {
    this.isNative = Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios';
  }

  /**
   * Get the current audio state
   */
  getState(): AudioState {
    return this.currentState;
  }

  /**
   * Check if we're on a native iOS platform
   */
  isNativeIOS(): boolean {
    return this.isNative;
  }

  /**
   * Subscribe to state changes
   */
  onStateChange(callback: (state: AudioState) => void): () => void {
    this.stateListeners.add(callback);
    return () => this.stateListeners.delete(callback);
  }

  private notifyStateChange(newState: AudioState) {
    this.currentState = newState;
    this.stateListeners.forEach((listener) => {
      try {
        listener(newState);
      } catch (e) {
        console.error('[VoiceController] State listener error:', e);
      }
    });
  }

  /**
   * Prepare for listening (speech recognition)
   * This performs a full audio teardown before configuring for input.
   */
  async prepareForListening(): Promise<boolean> {
    if (!this.isNative) {
      console.log('[VoiceController] Not on iOS, skipping native audio session prep');
      this.notifyStateChange('listening');
      return true;
    }

    try {
      this.notifyStateChange('transitioning');
      console.log('[VoiceController] Preparing for listening...');

      const result = await AudioSessionManagerPlugin.prepareForListening();

      if (result.success) {
        this.notifyStateChange('listening');
        console.log(
          `[VoiceController] Ready to listen. Sample rate: ${result.sampleRate}, Channels: ${result.inputChannels}`
        );
        return true;
      } else {
        this.notifyStateChange('idle');
        console.error('[VoiceController] Failed to prepare for listening');
        return false;
      }
    } catch (error) {
      this.notifyStateChange('idle');
      console.error('[VoiceController] prepareForListening error:', error);
      return false;
    }
  }

  /**
   * Prepare for speaking (TTS)
   * This performs a full audio teardown before configuring for output.
   */
  async prepareForSpeaking(): Promise<boolean> {
    if (!this.isNative) {
      console.log('[VoiceController] Not on iOS, skipping native audio session prep');
      this.notifyStateChange('speaking');
      return true;
    }

    try {
      this.notifyStateChange('transitioning');
      console.log('[VoiceController] Preparing for speaking...');

      const result = await AudioSessionManagerPlugin.prepareForSpeaking();

      if (result.success) {
        this.notifyStateChange('speaking');
        console.log('[VoiceController] Ready to speak');
        return true;
      } else {
        this.notifyStateChange('idle');
        console.error('[VoiceController] Failed to prepare for speaking');
        return false;
      }
    } catch (error) {
      this.notifyStateChange('idle');
      console.error('[VoiceController] prepareForSpeaking error:', error);
      return false;
    }
  }

  /**
   * Stop all audio and return to idle state
   */
  async stopAllAudio(): Promise<void> {
    if (!this.isNative) {
      this.notifyStateChange('idle');
      return;
    }

    try {
      console.log('[VoiceController] Stopping all audio...');
      await AudioSessionManagerPlugin.stopAllAudio();
      this.notifyStateChange('idle');
      console.log('[VoiceController] Audio stopped');
    } catch (error) {
      console.error('[VoiceController] stopAllAudio error:', error);
      this.notifyStateChange('idle');
    }
  }

  /**
   * Get diagnostic information about the current audio state
   */
  async getDiagnostics(): Promise<AudioDiagnostics | null> {
    if (!this.isNative) {
      return {
        currentState: this.currentState,
        category: 'web',
        mode: 'default',
        isOtherAudioPlaying: false,
        sampleRate: 44100,
        inputAvailable: true,
        inputNumberOfChannels: 1,
        outputNumberOfChannels: 2,
        preferredSampleRate: 44100,
        inputLatency: 0,
        outputLatency: 0,
        availableInputs: [{ portName: 'Web Audio', portType: 'web', uid: 'web' }],
      };
    }

    try {
      return await AudioSessionManagerPlugin.getAudioDiagnostics();
    } catch (error) {
      console.error('[VoiceController] getDiagnostics error:', error);
      return null;
    }
  }

  /**
   * Log current audio diagnostics for debugging
   */
  async logDiagnostics(): Promise<void> {
    const diagnostics = await this.getDiagnostics();
    if (diagnostics) {
      console.log('[VoiceController] Audio Diagnostics:', JSON.stringify(diagnostics, null, 2));
    }
  }
}

// Export singleton instance
export const VoiceController = new VoiceControllerImpl();

// Export the raw plugin for advanced usage
export { AudioSessionManagerPlugin };
