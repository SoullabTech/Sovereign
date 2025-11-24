/**
 * Silence Detection System
 * Extracted from MayaHybridVoiceSystem for better separation of concerns
 */

export interface SilenceDetectorConfig {
  silenceThresholdMs: number;
  minSpeechLength?: number;
}

export interface SilenceDetectorCallbacks {
  onSilenceDetected?: (transcript: string) => void;
  onSpeechDetected?: () => void;
}

export class SilenceDetector {
  private config: SilenceDetectorConfig;
  private callbacks: SilenceDetectorCallbacks;
  private silenceTimer: NodeJS.Timeout | null = null;
  private lastSpeechTime: number = 0;
  private accumulatedTranscript: string = '';
  private isActive: boolean = false;

  constructor(config: SilenceDetectorConfig, callbacks: SilenceDetectorCallbacks = {}) {
    this.config = {
      minSpeechLength: 3,
      ...config,
    };
    this.callbacks = callbacks;
  }

  start(): void {
    this.isActive = true;
    this.lastSpeechTime = Date.now();
  }

  stop(): void {
    this.isActive = false;
    this.clearTimer();
    this.reset();
  }

  onSpeech(transcript: string, isFinal: boolean): void {
    if (!this.isActive) return;

    this.lastSpeechTime = Date.now();
    this.callbacks.onSpeechDetected?.();

    if (isFinal) {
      this.accumulatedTranscript += ' ' + transcript;
      this.resetTimer();
    }
  }

  private resetTimer(): void {
    this.clearTimer();

    this.silenceTimer = setTimeout(() => {
      this.handleSilenceDetected();
    }, this.config.silenceThresholdMs);
  }

  private handleSilenceDetected(): void {
    const transcript = this.accumulatedTranscript.trim();

    if (transcript.length >= (this.config.minSpeechLength || 3)) {
      console.log(`🤫 Silence detected after ${this.config.silenceThresholdMs}ms`);
      this.callbacks.onSilenceDetected?.(transcript);
      this.reset();
    }
  }

  private clearTimer(): void {
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }
  }

  private reset(): void {
    this.accumulatedTranscript = '';
    this.lastSpeechTime = 0;
  }

  getAccumulatedTranscript(): string {
    return this.accumulatedTranscript.trim();
  }

  getTimeSinceLastSpeech(): number {
    return Date.now() - this.lastSpeechTime;
  }

  isWaitingForSilence(): boolean {
    return this.silenceTimer !== null;
  }

  updateConfig(newConfig: Partial<SilenceDetectorConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  destroy(): void {
    this.stop();
  }
}