/**
 * iOS Voice Compatibility Fix
 * Handles iOS Safari audio restrictions and WebKit limitations
 */

export class IOSVoiceHandler {
  private static instance: IOSVoiceHandler;
  private audioContext?: AudioContext;
  private isUnlocked = false;
  private pendingAudio: HTMLAudioElement[] = [];

  private constructor() {
    this.setupIOSAudioUnlock();
  }

  static getInstance(): IOSVoiceHandler {
    if (!IOSVoiceHandler.instance) {
      IOSVoiceHandler.instance = new IOSVoiceHandler();
    }
    return IOSVoiceHandler.instance;
  }

  /**
   * Check if device is iOS
   */
  static isIOS(): boolean {
    if (typeof window === 'undefined') return false;

    return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
           (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  }

  /**
   * Setup iOS audio unlock on first user interaction
   */
  private setupIOSAudioUnlock() {
    if (!IOSVoiceHandler.isIOS()) return;

    const unlockAudio = async () => {
      if (this.isUnlocked) return;

      try {
        // Create audio context if needed
        if (!this.audioContext) {
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          this.audioContext = new AudioContextClass();
        }

        // Resume audio context (required for iOS)
        if (this.audioContext.state === 'suspended') {
          await this.audioContext.resume();
        }

        // Play silent audio to unlock
        const silentAudio = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=');
        silentAudio.volume = 0.1;

        await silentAudio.play();
        silentAudio.pause();

        this.isUnlocked = true;
        console.log('✅ iOS audio unlocked');

        // Play any pending audio
        this.playPendingAudio();

        // Remove listeners after unlock
        document.removeEventListener('touchstart', unlockAudio);
        document.removeEventListener('click', unlockAudio);
      } catch (error) {
        console.error('Failed to unlock iOS audio:', error);
      }
    };

    // Add listeners for user interaction
    document.addEventListener('touchstart', unlockAudio, { once: true });
    document.addEventListener('click', unlockAudio, { once: true });
  }

  /**
   * Play audio with iOS compatibility
   */
  async playAudio(audio: HTMLAudioElement): Promise<void> {
    if (!IOSVoiceHandler.isIOS()) {
      return audio.play();
    }

    if (!this.isUnlocked) {
      // Queue audio for later
      this.pendingAudio.push(audio);
      console.log('⏳ Audio queued - waiting for user interaction');
      return;
    }

    try {
      // Set up audio for iOS
      audio.setAttribute('playsinline', 'true');
      audio.setAttribute('webkit-playsinline', 'true');

      // iOS needs volume to be set after user gesture
      audio.volume = 0.8;

      await audio.play();
    } catch (error: any) {
      if (error.name === 'NotAllowedError') {
        // Queue for retry after user interaction
        this.pendingAudio.push(audio);
        console.log('⏳ Audio playback blocked - need user interaction');
      } else {
        throw error;
      }
    }
  }

  /**
   * Play any pending audio after unlock
   */
  private async playPendingAudio() {
    while (this.pendingAudio.length > 0) {
      const audio = this.pendingAudio.shift();
      if (audio) {
        try {
          await audio.play();
        } catch (error) {
          console.error('Failed to play pending audio:', error);
        }
      }
    }
  }

  /**
   * Create audio element with iOS optimizations
   */
  createAudioElement(src: string): HTMLAudioElement {
    const audio = new Audio(src);

    if (IOSVoiceHandler.isIOS()) {
      // iOS-specific attributes
      audio.setAttribute('playsinline', 'true');
      audio.setAttribute('webkit-playsinline', 'true');
      audio.preload = 'auto';

      // Lower volume initially (iOS restriction)
      audio.volume = 0.5;
    }

    return audio;
  }

  /**
   * Get audio context (creates if needed)
   */
  getAudioContext(): AudioContext | undefined {
    if (!this.audioContext && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioContextClass();
    }
    return this.audioContext;
  }

  /**
   * Check if audio is ready to play
   */
  isAudioReady(): boolean {
    return !IOSVoiceHandler.isIOS() || this.isUnlocked;
  }
}

/**
 * Helper function to handle voice playback with iOS compatibility
 */
export async function playVoiceWithIOSSupport(
  audioUrl: string,
  options?: {
    volume?: number;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (error: any) => void;
  }
): Promise<void> {
  const handler = IOSVoiceHandler.getInstance();

  try {
    const audio = handler.createAudioElement(audioUrl);

    if (options?.volume !== undefined) {
      audio.volume = Math.min(options.volume, 0.8); // iOS max safe volume
    }

    if (options?.onStart) {
      audio.addEventListener('play', options.onStart);
    }

    if (options?.onEnd) {
      audio.addEventListener('ended', options.onEnd);
    }

    if (options?.onError) {
      audio.addEventListener('error', options.onError);
    }

    await handler.playAudio(audio);

    return new Promise((resolve, reject) => {
      audio.addEventListener('ended', () => resolve());
      audio.addEventListener('error', reject);
    });
  } catch (error) {
    console.error('Voice playback error:', error);
    if (options?.onError) {
      options.onError(error);
    }
    throw error;
  }
}

/**
 * Check if voice is available on current platform
 */
export function isVoiceAvailable(): boolean {
  if (typeof window === 'undefined') return false;

  // Check for basic audio support
  const hasAudioSupport = 'Audio' in window;

  // Check for speech synthesis (fallback)
  const hasSpeechSynthesis = 'speechSynthesis' in window;

  // Check for audio context
  const hasAudioContext = 'AudioContext' in window || 'webkitAudioContext' in window;

  return hasAudioSupport || hasSpeechSynthesis || hasAudioContext;
}

/**
 * Get fallback voice for iOS if API voice fails
 */
export function getIOSFallbackVoice(text: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!window.speechSynthesis) {
      reject(new Error('Speech synthesis not available'));
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);

    // Try to find a good female voice for Maya
    const voices = window.speechSynthesis.getVoices();
    const preferredVoices = ['Samantha', 'Victoria', 'Karen', 'Moira', 'Tessa'];

    for (const name of preferredVoices) {
      const voice = voices.find(v => v.name.includes(name));
      if (voice) {
        utterance.voice = voice;
        break;
      }
    }

    // iOS-friendly settings
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    utterance.volume = 0.8;

    utterance.onend = () => resolve();
    utterance.onerror = (error) => reject(error);

    window.speechSynthesis.speak(utterance);
  });
}

export default IOSVoiceHandler;