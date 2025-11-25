/**
 * Voice Feedback Prevention System
 * Prevents Maya from hearing and responding to her own voice
 */

export class VoiceFeedbackPrevention {
  private static instance: VoiceFeedbackPrevention;
  private isMayaSpeaking = false;
  private recognitionInstances = new Set<any>();
  private audioElements = new Set<HTMLAudioElement>();
  private speechSynthesis: SpeechSynthesis | null = null;

  private constructor() {
    this.initializeListeners();
  }

  static getInstance(): VoiceFeedbackPrevention {
    if (!VoiceFeedbackPrevention.instance) {
      VoiceFeedbackPrevention.instance = new VoiceFeedbackPrevention();
    }
    return VoiceFeedbackPrevention.instance;
  }

  /**
   * Initialize event listeners for Maya's speaking state
   */
  private initializeListeners() {
    if (typeof window === 'undefined') return;

    // Listen for Maya voice start
    window.addEventListener('maya-voice-start', () => {
      console.log('🔇 Maya started speaking - muting microphone');
      this.setMayaSpeaking(true);
    });

    // Listen for Maya voice end
    window.addEventListener('maya-voice-end', () => {
      console.log('🎤 Maya finished speaking - unmuting microphone');
      // Add a small delay before re-enabling mic to ensure audio has finished
      setTimeout(() => {
        this.setMayaSpeaking(false);
      }, 500);
    });

    // Track speech synthesis
    if ('speechSynthesis' in window) {
      this.speechSynthesis = window.speechSynthesis;
    }
  }

  /**
   * Register a speech recognition instance
   */
  registerRecognition(recognition: any) {
    this.recognitionInstances.add(recognition);

    // Override the original start method
    const originalStart = recognition.start.bind(recognition);
    recognition.start = () => {
      if (this.isMayaSpeaking) {
        console.log('⏸️ Delaying recognition start - Maya is speaking');
        // Queue the start for when Maya finishes
        const checkInterval = setInterval(() => {
          if (!this.isMayaSpeaking) {
            clearInterval(checkInterval);
            originalStart();
          }
        }, 100);
      } else {
        originalStart();
      }
    };

    // Track when recognition is actually running
    recognition.addEventListener('start', () => {
      if (this.isMayaSpeaking) {
        console.log('⚠️ Recognition started while Maya speaking - ABORTING immediately');
        // Use abort() instead of stop() for immediate termination
        if (recognition.abort) {
          recognition.abort();
        } else {
          recognition.stop();
        }
      }
    });

    // Auto-restart after Maya finishes speaking
    recognition.addEventListener('end', () => {
      if (!this.isMayaSpeaking) {
        // Recognition ended naturally, not due to Maya speaking
        return;
      }

      // Queue restart for when Maya finishes
      const restartCheck = setInterval(() => {
        if (!this.isMayaSpeaking) {
          clearInterval(restartCheck);
          try {
            recognition.start();
            console.log('🔄 Recognition restarted after Maya finished');
          } catch (error) {
            console.error('Failed to restart recognition:', error);
          }
        }
      }, 100);
    });
  }

  /**
   * Register an audio element (for Maya's voice)
   */
  registerAudioElement(audio: HTMLAudioElement) {
    this.audioElements.add(audio);

    // Track play and end events
    audio.addEventListener('play', () => {
      this.setMayaSpeaking(true);
    });

    audio.addEventListener('ended', () => {
      // Check if any other audio is still playing
      const anyPlaying = Array.from(this.audioElements).some(a => !a.paused);
      if (!anyPlaying) {
        setTimeout(() => this.setMayaSpeaking(false), 300);
      }
    });

    audio.addEventListener('pause', () => {
      const anyPlaying = Array.from(this.audioElements).some(a => !a.paused);
      if (!anyPlaying) {
        this.setMayaSpeaking(false);
      }
    });
  }

  /**
   * Set Maya's speaking state and stop/start recognition accordingly
   */
  private setMayaSpeaking(speaking: boolean) {
    const wasSpeaking = this.isMayaSpeaking;
    this.isMayaSpeaking = speaking;

    if (speaking && !wasSpeaking) {
      // Maya just started speaking - stop all recognition
      this.stopAllRecognition();
    } else if (!speaking && wasSpeaking) {
      // Maya just finished - can restart recognition
      // This is handled by the recognition's end event listener
    }

    // Broadcast state change
    window.dispatchEvent(new CustomEvent('maya-speaking-state', {
      detail: { isSpeaking: speaking }
    }));
  }

  /**
   * Stop all registered speech recognition
   */
  private stopAllRecognition() {
    this.recognitionInstances.forEach(recognition => {
      try {
        if (recognition.abort) {
          recognition.abort(); // Immediately stop without triggering end event
        } else {
          recognition.stop();
        }
        console.log('🛑 Stopped recognition while Maya speaks');
      } catch (error) {
        // Recognition might not be active
      }
    });
  }

  /**
   * Check if Maya is currently speaking
   */
  isSpeaking(): boolean {
    // Check audio elements
    const audioPlaying = Array.from(this.audioElements).some(audio => !audio.paused);

    // Check speech synthesis
    const synthSpeaking = this.speechSynthesis?.speaking || false;

    return this.isMayaSpeaking || audioPlaying || synthSpeaking;
  }

  /**
   * 🛑 INTERRUPT: Stop Maya immediately when user starts speaking
   * This allows natural conversation flow where user can interrupt
   */
  interruptMaya() {
    console.log('🛑 [INTERRUPT] User started speaking - stopping MAIA immediately');

    // Stop all audio elements
    this.audioElements.forEach(audio => {
      try {
        audio.pause();
        audio.currentTime = 0;
        console.log('  ✓ Stopped audio playback');
      } catch (error) {
        // Audio might already be stopped
      }
    });

    // Stop speech synthesis
    if (this.speechSynthesis) {
      try {
        this.speechSynthesis.cancel();
        console.log('  ✓ Cancelled speech synthesis');
      } catch (error) {
        // Synthesis might not be active
      }
    }

    // Dispatch custom event for other components (like MaiaVoiceSystem)
    window.dispatchEvent(new CustomEvent('maya-voice-interrupted', {
      detail: { reason: 'user_started_speaking' }
    }));

    // Mark as not speaking
    this.isMayaSpeaking = false;

    console.log('  ✅ MAIA interrupted successfully');
  }

  /**
   * Clean up audio element when done
   */
  unregisterAudioElement(audio: HTMLAudioElement) {
    this.audioElements.delete(audio);
  }

  /**
   * Clean up recognition instance
   */
  unregisterRecognition(recognition: any) {
    this.recognitionInstances.delete(recognition);
  }
}

/**
 * Helper function to wrap audio playback with feedback prevention
 */
export function playAudioWithFeedbackPrevention(audio: HTMLAudioElement): Promise<void> {
  const prevention = VoiceFeedbackPrevention.getInstance();
  prevention.registerAudioElement(audio);

  return new Promise((resolve, reject) => {
    audio.addEventListener('ended', () => {
      prevention.unregisterAudioElement(audio);
      resolve();
    }, { once: true });

    audio.addEventListener('error', (error) => {
      prevention.unregisterAudioElement(audio);
      reject(error);
    }, { once: true });

    // Dispatch event before playing
    window.dispatchEvent(new Event('maya-voice-start'));

    // Enhanced error logging for iOS/iPhone Chrome debugging
    audio.play().catch((error) => {
      console.error('❌ Audio playback failed:', {
        errorName: error?.name,
        errorMessage: error?.message,
        audioSrc: audio.src?.substring(0, 50) + '...',
        audioReadyState: audio.readyState,
        audioNetworkState: audio.networkState,
        audioError: audio.error,
        userAgent: navigator.userAgent
      });
      reject(error);
    });
  });
}

/**
 * Helper to wrap speech synthesis with feedback prevention
 */
export function speakWithFeedbackPrevention(utterance: SpeechSynthesisUtterance): void {
  window.dispatchEvent(new Event('maya-voice-start'));

  utterance.addEventListener('end', () => {
    window.dispatchEvent(new Event('maya-voice-end'));
  }, { once: true });

  utterance.addEventListener('error', () => {
    window.dispatchEvent(new Event('maya-voice-end'));
  }, { once: true });

  window.speechSynthesis.speak(utterance);
}

export default VoiceFeedbackPrevention;