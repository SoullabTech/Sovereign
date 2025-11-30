/**
 * Wake Word Activation System
 * Enables "Hey Maya" instant sacred access
 */

import { logger } from '../utils/logger';

interface WakeWordConfig {
  primaryPhrases: string[];
  micActivationTime: number; // ms to keep mic open
  silenceThreshold: number;  // ms of silence before closing
  confidence: number;         // 0-1 wake word detection confidence
}

export class WakeWordActivation {
  private config: WakeWordConfig = {
    primaryPhrases: [
      'hey maya',
      'hello maya',
      'maya',
      'ok maya',
      'good morning maya',
      'good evening maya'
    ],
    micActivationTime: 10000,  // 10 seconds active listening
    silenceThreshold: 3000,    // 3 seconds silence = done
    confidence: 0.7            // 70% confidence threshold
  };

  private isListening = false;
  private activeSession: string | null = null;
  private silenceTimer: NodeJS.Timeout | null = null;

  /**
   * Initialize wake word detection
   */
  async initialize(): Promise<void> {
    logger.info('Wake word activation system initializing', {
      phrases: this.config.primaryPhrases,
      confidence: this.config.confidence
    });

    // Initialize audio stream monitoring
    await this.setupAudioStream();

    // Start continuous listening
    this.startListening();
  }

  /**
   * Setup audio stream with VAD (Voice Activity Detection)
   */
  private async setupAudioStream(): Promise<void> {
    try {
      // Using Web Audio API for browser
      // For native app, use platform-specific audio APIs

      if (typeof window !== 'undefined' && window.navigator?.mediaDevices) {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            sampleRate: 16000
          }
        });

        await this.processAudioStream(stream);
      } else {
        // Server-side or native implementation
        logger.info('Setting up native audio stream');
        // Implementation depends on platform (Electron, React Native, etc.)
      }
    } catch (error) {
      logger.error('Failed to setup audio stream', { error });
    }
  }

  /**
   * Process continuous audio stream for wake word
   */
  private async processAudioStream(stream: MediaStream): Promise<void> {
    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();

    source.connect(analyser);
    analyser.fftSize = 2048;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const processFrame = () => {
      if (!this.isListening) return;

      analyser.getByteTimeDomainData(dataArray);

      // Check for voice activity
      const hasVoice = this.detectVoiceActivity(dataArray);

      if (hasVoice && !this.activeSession) {
        this.handlePotentialWakeWord(dataArray);
      }

      if (this.activeSession) {
        this.handleActiveSession(hasVoice);
      }

      // Continue processing
      requestAnimationFrame(processFrame);
    };

    processFrame();
  }

  /**
   * Detect voice activity in audio buffer
   */
  private detectVoiceActivity(dataArray: Uint8Array): boolean {
    // Calculate RMS (Root Mean Square) for volume detection
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      const normalized = (dataArray[i] - 128) / 128;
      sum += normalized * normalized;
    }
    const rms = Math.sqrt(sum / dataArray.length);

    // Voice detected if RMS above threshold
    return rms > 0.01; // Adjust threshold based on testing
  }

  /**
   * Handle potential wake word detection
   */
  private async handlePotentialWakeWord(audioBuffer: Uint8Array): Promise<void> {
    // Send to wake word detection model
    const detected = await this.detectWakeWord(audioBuffer);

    if (detected.confidence >= this.config.confidence) {
      this.activateMicrophone(detected.phrase);
    }
  }

  /**
   * Detect wake word using ML model or service
   */
  private async detectWakeWord(audioBuffer: Uint8Array): Promise<{
    detected: boolean;
    confidence: number;
    phrase: string;
  }> {
    // Options:
    // 1. Use Picovoice Porcupine for on-device
    // 2. Use Google Cloud Speech-to-Text
    // 3. Use Azure Speech Services
    // 4. Use custom TensorFlow.js model

    // Placeholder for Porcupine integration
    try {
      // const porcupine = await Porcupine.create(accessKey, keywords);
      // const keywordIndex = porcupine.process(audioBuffer);

      // Simulated detection for now
      const simulatedConfidence = Math.random();

      return {
        detected: simulatedConfidence > 0.7,
        confidence: simulatedConfidence,
        phrase: 'hey maya'
      };
    } catch (error) {
      logger.error('Wake word detection failed', { error });
      return { detected: false, confidence: 0, phrase: '' };
    }
  }

  /**
   * Activate microphone for user input
   */
  private activateMicrophone(wakePhrase: string): void {
    logger.info('Wake word detected, activating microphone', {
      phrase: wakePhrase,
      timestamp: new Date().toISOString()
    });

    // Generate session ID
    this.activeSession = `session_${Date.now()}`;

    // Emit activation event
    this.emitActivation();

    // Start silence timer
    this.resetSilenceTimer();

    // Play subtle activation sound
    this.playActivationSound();
  }

  /**
   * Handle active listening session
   */
  private handleActiveSession(hasVoice: boolean): void {
    if (hasVoice) {
      // Reset silence timer when voice detected
      this.resetSilenceTimer();
    }
  }

  /**
   * Reset silence detection timer
   */
  private resetSilenceTimer(): void {
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
    }

    this.silenceTimer = setTimeout(() => {
      this.deactivateMicrophone('silence_timeout');
    }, this.config.silenceThreshold);
  }

  /**
   * Deactivate microphone and end session
   */
  private deactivateMicrophone(reason: string): void {
    logger.info('Deactivating microphone', {
      session: this.activeSession,
      reason,
      duration: this.getSessionDuration()
    });

    // Clear session
    this.activeSession = null;

    // Clear timers
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }

    // Play subtle deactivation sound
    this.playDeactivationSound();

    // Emit deactivation event
    this.emitDeactivation();
  }

  /**
   * Emit activation event for UI/system response
   */
  private emitActivation(): void {
    // Emit custom event for UI to respond
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('maya:activated', {
        detail: {
          session: this.activeSession,
          timestamp: Date.now()
        }
      }));
    }

    // For native/server implementation
    // this.eventEmitter.emit('activated', { session: this.activeSession });
  }

  /**
   * Emit deactivation event
   */
  private emitDeactivation(): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('maya:deactivated', {
        detail: {
          session: this.activeSession,
          timestamp: Date.now()
        }
      }));
    }
  }

  /**
   * Play activation sound
   */
  private playActivationSound(): void {
    // Subtle chime or vibration
    if (typeof window !== 'undefined' && window.Audio) {
      // Use data URI for embedded sound or load from asset
      const audio = new Audio('/sounds/maya-wake.mp3');
      audio.volume = 0.3;
      audio.play().catch(e => logger.warn('Could not play activation sound', { error: e }));
    }

    // Haptic feedback on mobile
    if (typeof window !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(50); // Subtle 50ms vibration
    }
  }

  /**
   * Play deactivation sound
   */
  private playDeactivationSound(): void {
    if (typeof window !== 'undefined' && window.Audio) {
      const audio = new Audio('/sounds/maya-sleep.mp3');
      audio.volume = 0.2;
      audio.play().catch(e => logger.warn('Could not play deactivation sound', { error: e }));
    }
  }

  /**
   * Get session duration for analytics
   */
  private getSessionDuration(): number {
    if (!this.activeSession) return 0;
    const sessionStart = parseInt(this.activeSession.split('_')[1]);
    return Date.now() - sessionStart;
  }

  /**
   * Start continuous listening
   */
  startListening(): void {
    this.isListening = true;
    logger.info('Wake word detection started');
  }

  /**
   * Stop listening
   */
  stopListening(): void {
    this.isListening = false;
    this.deactivateMicrophone('manual_stop');
    logger.info('Wake word detection stopped');
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<WakeWordConfig>): void {
    this.config = { ...this.config, ...config };
    logger.info('Wake word config updated', { config: this.config });
  }

  /**
   * Get current status
   */
  getStatus(): {
    isListening: boolean;
    hasActiveSession: boolean;
    sessionId: string | null;
  } {
    return {
      isListening: this.isListening,
      hasActiveSession: !!this.activeSession,
      sessionId: this.activeSession
    };
  }
}

// Export singleton instance
export const wakeWordSystem = new WakeWordActivation();