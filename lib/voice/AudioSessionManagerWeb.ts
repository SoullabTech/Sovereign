/**
 * AudioSessionManagerWeb - Web fallback for the AudioSessionManager plugin
 *
 * Provides no-op implementations for development on non-iOS platforms.
 */

import { WebPlugin } from '@capacitor/core';
import type {
  AudioSessionManagerPlugin,
  PrepareForListeningResult,
  PrepareForSpeakingResult,
  StopAllAudioResult,
  AudioDiagnostics,
} from './AudioSessionManager';

export class AudioSessionManagerWeb
  extends WebPlugin
  implements AudioSessionManagerPlugin
{
  async prepareForListening(): Promise<PrepareForListeningResult> {
    console.log('[AudioSessionManagerWeb] prepareForListening (web fallback)');
    return {
      success: true,
      state: 'listening',
      sampleRate: 44100,
      inputChannels: 1,
    };
  }

  async prepareForSpeaking(): Promise<PrepareForSpeakingResult> {
    console.log('[AudioSessionManagerWeb] prepareForSpeaking (web fallback)');
    return {
      success: true,
      state: 'speaking',
    };
  }

  async stopAllAudio(): Promise<StopAllAudioResult> {
    console.log('[AudioSessionManagerWeb] stopAllAudio (web fallback)');
    return {
      success: true,
      state: 'idle',
    };
  }

  async getAudioDiagnostics(): Promise<AudioDiagnostics> {
    console.log('[AudioSessionManagerWeb] getAudioDiagnostics (web fallback)');
    return {
      currentState: 'idle',
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
}
