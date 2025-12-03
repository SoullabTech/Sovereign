/**
 * Maya Voice Handler with Feedback Prevention
 * Manages TTS playback and audio queue for seamless voice responses
 * Integrated with VoiceFeedbackPrevention to prevent echo loops
 */

import {
  VoiceFeedbackPrevention,
  playAudioWithFeedbackPrevention
} from './voice-feedback-prevention';

export interface VoiceConfig {
  voice?: string;
  speed?: number;
  model?: 'tts-1' | 'tts-1-hd';
  pace?: string;
  tone?: string;
  energy?: string;
}

export interface MayaResponse {
  message: string;
  element?: string;
  duration?: number;
  voiceConfig?: VoiceConfig;
}

export class MayaVoiceHandler {
  private audioQueue: HTMLAudioElement[] = [];
  private isPlaying = false;
  private currentAudio: HTMLAudioElement | null = null;
  private onPlayingChange?: (isPlaying: boolean) => void;
  private onError?: (error: Error) => void;
  private feedbackPrevention: VoiceFeedbackPrevention;

  constructor(options?: {
    onPlayingChange?: (isPlaying: boolean) => void;
    onError?: (error: Error) => void;
  }) {
    this.onPlayingChange = options?.onPlayingChange;
    this.onError = options?.onError;

    // Initialize feedback prevention system
    this.feedbackPrevention = VoiceFeedbackPrevention.getInstance();

    // Listen for user interruptions
    if (typeof window !== 'undefined') {
      window.addEventListener('maya-voice-interrupted', () => {
        this.handleInterruption();
      });
    }
  }

  /**
   * Speak Maya's response with TTS
   */
  async speakResponse(
    text: string,
    voiceConfig?: VoiceConfig
  ): Promise<void> {
    try {
      // Don't speak empty or very short responses
      if (!text || text.length < 2) {
        console.warn('Text too short for TTS:', text);
        return;
      }

      // Call TTS API
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voice: voiceConfig?.voice || 'alloy',
          speed: voiceConfig?.speed || 1.0,
          model: voiceConfig?.model || 'tts-1'
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'TTS generation failed');
      }

      // Create audio from response
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      // Configure audio
      audio.volume = 0.8; // Slightly lower volume for comfort
      audio.playbackRate = 1.0; // Can be adjusted based on element/mood

      // Add to queue and play
      await this.playAudio(audio);

    } catch (error) {
      console.error('TTS failed:', error);
      if (this.onError) {
        this.onError(error instanceof Error ? error : new Error('TTS failed'));
      }
      throw error;
    }
  }

  /**
   * Process Maya's response and speak it
   */
  async processMayaResponse(response: MayaResponse): Promise<void> {
    const { message, voiceConfig } = response;

    // Apply element-based voice adjustments
    const adjustedConfig = this.adjustVoiceForElement(
      voiceConfig || {},
      response.element
    );

    await this.speakResponse(message, adjustedConfig);
  }

  /**
   * Adjust voice config based on elemental response
   */
  private adjustVoiceForElement(
    config: VoiceConfig,
    element?: string
  ): VoiceConfig {
    switch (element) {
      case 'fire':
        return {
          ...config,
          speed: config.speed || 1.1,
          voice: config.voice || 'nova' // Energetic voice
        };
      case 'water':
        return {
          ...config,
          speed: config.speed || 0.95,
          voice: config.voice || 'alloy' // Calm, flowing voice
        };
      case 'earth':
        return {
          ...config,
          speed: config.speed || 0.9,
          voice: config.voice || 'onyx' // Grounded voice
        };
      case 'air':
        return {
          ...config,
          speed: config.speed || 1.05,
          voice: config.voice || 'shimmer' // Light, curious voice
        };
      case 'aether':
        return {
          ...config,
          speed: config.speed || 0.85,
          voice: config.voice || 'fable' // Mysterious voice
        };
      default:
        return {
          ...config,
          voice: config.voice || 'alloy'
        };
    }
  }

  /**
   * Handle user interruption of Maya's speech
   */
  private handleInterruption(): void {
    console.log('🛑 [MAYA] User interrupted - stopping all audio');
    this.stopAll();
  }

  /**
   * Play audio with queue management and feedback prevention
   */
  private async playAudio(audio: HTMLAudioElement): Promise<void> {
    // Use feedback prevention system for audio playback
    this.feedbackPrevention.registerAudioElement(audio);
    this.audioQueue.push(audio);

    if (!this.isPlaying) {
      await this.processQueue();
    }
  }

  /**
   * Process audio queue with feedback prevention
   */
  private async processQueue(): Promise<void> {
    if (this.audioQueue.length === 0) {
      this.isPlaying = false;
      this.currentAudio = null;
      if (this.onPlayingChange) {
        this.onPlayingChange(false);
      }
      return;
    }

    this.isPlaying = true;
    if (this.onPlayingChange) {
      this.onPlayingChange(true);
    }

    const audio = this.audioQueue.shift()!;
    this.currentAudio = audio;

    try {
      // Use feedback prevention helper for proper playback
      await playAudioWithFeedbackPrevention(audio);

      // Clean up and continue to next item
      URL.revokeObjectURL(audio.src);
      this.currentAudio = null;

      // Process next in queue
      await this.processQueue();

    } catch (error) {
      console.error('Audio playback error with feedback prevention:', error);

      // Clean up on error
      URL.revokeObjectURL(audio.src);
      this.currentAudio = null;

      if (this.onError) {
        this.onError(error instanceof Error ? error : new Error('Audio playback failed'));
      }

      // Continue with queue even on error
      await this.processQueue();
    }
  }

  /**
   * Stop all audio playback with feedback prevention cleanup
   */
  stopAll(): void {
    // Stop current audio
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      URL.revokeObjectURL(this.currentAudio.src);

      // Unregister from feedback prevention system
      this.feedbackPrevention.unregisterAudioElement(this.currentAudio);
    }

    // Clear queue and clean up feedback prevention
    this.audioQueue.forEach(audio => {
      try {
        audio.pause();
        URL.revokeObjectURL(audio.src);
        this.feedbackPrevention.unregisterAudioElement(audio);
      } catch (error) {
        // Audio might already be cleaned up
      }
    });
    this.audioQueue = [];

    this.isPlaying = false;
    this.currentAudio = null;

    if (this.onPlayingChange) {
      this.onPlayingChange(false);
    }

    // Dispatch maya voice end event to ensure proper state cleanup
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('maya-voice-end'));
    }
  }

  /**
   * Pause current playback
   */
  pause(): void {
    if (this.currentAudio && !this.currentAudio.paused) {
      this.currentAudio.pause();
    }
  }

  /**
   * Resume current playback
   */
  resume(): void {
    if (this.currentAudio && this.currentAudio.paused) {
      this.currentAudio.play().catch(console.error);
    }
  }

  /**
   * Check if currently playing
   */
  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  /**
   * Get queue length
   */
  getQueueLength(): number {
    return this.audioQueue.length;
  }
}

// Singleton instance for global use
let globalInstance: MayaVoiceHandler | null = null;

export function getMayaVoiceHandler(): MayaVoiceHandler {
  if (!globalInstance) {
    globalInstance = new MayaVoiceHandler();
  }
  return globalInstance;
}