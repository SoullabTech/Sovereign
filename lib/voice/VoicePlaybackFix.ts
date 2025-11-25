/**
 * Fix for "Not speaking because" issue
 * Ensures voice always plays when audio is available
 */

export interface VoicePlaybackConfig {
  voiceMode?: 'voice' | 'text' | 'chat';
  autoplay?: boolean;
  forcePlay?: boolean;
  audioUrl?: string;
  audioData?: string;
}

/**
 * Check if voice should play and log reason if not
 */
export function shouldPlayVoice(config: VoicePlaybackConfig): {
  shouldPlay: boolean;
  reason?: string
} {
  // Force play if explicitly requested
  if (config.forcePlay) {
    return { shouldPlay: true };
  }

  // Check if audio is available
  if (!config.audioUrl && !config.audioData) {
    return {
      shouldPlay: false,
      reason: 'No audio available (audioUrl and audioData both missing)'
    };
  }

  // Check if in voice mode (default to true for backward compatibility)
  if (config.voiceMode !== undefined && config.voiceMode !== 'voice') {
    return {
      shouldPlay: false,
      reason: `Not in voice mode (current mode: ${config.voiceMode})`
    };
  }

  // Check autoplay setting (default to true)
  if (config.autoplay === false) {
    return {
      shouldPlay: false,
      reason: 'Autoplay disabled'
    };
  }

  // All checks passed
  return { shouldPlay: true };
}

/**
 * Play audio with proper error handling
 */
export async function playVoiceAudio(
  audioElement: HTMLAudioElement,
  config: VoicePlaybackConfig
): Promise<{ success: boolean; error?: string }> {
  try {
    // Set audio source
    if (config.audioUrl) {
      audioElement.src = config.audioUrl;
    } else if (config.audioData) {
      const audioBlob = base64ToBlob(config.audioData, 'audio/mpeg');
      audioElement.src = URL.createObjectURL(audioBlob);
    }

    // Attempt to play
    await audioElement.play();

    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Unknown playback error'
    };
  }
}

/**
 * Convert base64 to Blob
 */
function base64ToBlob(base64: string, type: string): Blob {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);

  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }

  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type });
}

/**
 * Complete voice playback handler with fixes
 */
export class VoicePlaybackHandler {
  private audioElement: HTMLAudioElement;
  private isPlaying = false;

  constructor(audioElement?: HTMLAudioElement) {
    this.audioElement = audioElement || new Audio();
  }

  /**
   * Play voice with automatic fallback
   */
  async play(config: VoicePlaybackConfig): Promise<void> {
    const check = shouldPlayVoice(config);

    if (!check.shouldPlay) {
      console.log('⚠️ Not speaking because:', check.reason);
      return;
    }

    // Attempt playback
    const result = await playVoiceAudio(this.audioElement, config);

    if (result.success) {
      this.isPlaying = true;
      console.log('🔊 Voice playback started');
    } else {
      console.error('❌ Voice playback failed:', result.error);

      // Fallback to Web Speech API if available
      if ('speechSynthesis' in window && config.audioData) {
        this.fallbackToWebSpeech(atob(config.audioData));
      }
    }
  }

  /**
   * Fallback to Web Speech API
   */
  private fallbackToWebSpeech(text: string): void {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    utterance.volume = 0.8;

    speechSynthesis.speak(utterance);
    console.log('🎤 Fallback to Web Speech API');
  }

  /**
   * Stop playback
   */
  stop(): void {
    this.audioElement.pause();
    this.audioElement.currentTime = 0;
    this.isPlaying = false;
  }

  /**
   * Check if currently playing
   */
  getIsPlaying(): boolean {
    return this.isPlaying;
  }
}