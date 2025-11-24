/**
 * CONVERSATIONAL RHYTHM TRACKER
 * The "Liquid Layer" - Real-time temporal pattern sensing
 *
 * Tracks the rhythm and pacing of conversation to enable
 * breath-synchronized, field-coherent interactions.
 *
 * This is Phase 1 of the Liquid AI + AIN integration.
 */

// Debug logging (toggle with FIELD_DEBUG=1)
const FIELD_DEBUG = process.env.FIELD_DEBUG === '1' || process.env.NEXT_PUBLIC_FIELD_DEBUG === '1';
const dbg = (...args: any[]) => {
  if (FIELD_DEBUG) console.log('🌊 [FIELD]', ...args);
};

export interface RhythmMetrics {
  wordsPerMinute: number;
  averagePauseDuration: number;
  utteranceDuration: number;
  turntakingLatency: number;
  conversationTempo: 'slow' | 'medium' | 'fast';
  rhythmCoherence: number;
  breathAlignment: number;
  silenceComfort: number;
  responsePressure: number;
  lastUtteranceTimestamp: number;
  conversationStartTime: number;
  totalUtterances: number;
}

export interface RhythmEvent {
  type: 'speech_start' | 'speech_end' | 'silence_start' | 'silence_end';
  timestamp: number;
  duration?: number;
  wordCount?: number;
}

export class ConversationalRhythm {
  private metrics: RhythmMetrics;
  private eventHistory: RhythmEvent[] = [];
  private silenceStartTime: number | null = null;
  private speechStartTime: number | null = null;
  private utteranceDurations: number[] = [];
  private pauseDurations: number[] = [];
  private turntakingLatencies: number[] = [];
  private onMetricsUpdate?: (metrics: RhythmMetrics) => void;

  constructor(onMetricsUpdate?: (metrics: RhythmMetrics) => void) {
    this.onMetricsUpdate = onMetricsUpdate;
    this.metrics = this.getDefaultMetrics();
  }

  private getDefaultMetrics(): RhythmMetrics {
    return {
      wordsPerMinute: 0,
      averagePauseDuration: 0,
      utteranceDuration: 0,
      turntakingLatency: 0,
      conversationTempo: 'medium',
      rhythmCoherence: 0.5,
      breathAlignment: 0.5,
      silenceComfort: 0.5,
      responsePressure: 0.5,
      lastUtteranceTimestamp: Date.now(),
      conversationStartTime: Date.now(),
      totalUtterances: 0
    };
  }

  onSpeechStart(): void {
    const now = Date.now();
    this.speechStartTime = now;

    if (this.silenceStartTime) {
      const silenceDuration = now - this.silenceStartTime;
      this.pauseDurations.push(silenceDuration);
      this.silenceStartTime = null;
      this.updateSilenceComfort(silenceDuration);
    }

    this.recordEvent({
      type: 'speech_start',
      timestamp: now
    });
  }

  onSpeechEnd(transcript: string): void {
    const now = Date.now();

    if (this.speechStartTime) {
      const duration = now - this.speechStartTime;
      const wordCount = transcript.trim().split(/\s+/).length;

      this.utteranceDurations.push(duration);
      this.metrics.utteranceDuration = duration;
      this.metrics.totalUtterances++;

      if (duration > 0) {
        const wpm = (wordCount / (duration / 1000)) * 60;
        this.metrics.wordsPerMinute = wpm;
      }

      this.recordEvent({
        type: 'speech_end',
        timestamp: now,
        duration,
        wordCount
      });

      this.speechStartTime = null;
    }

    this.silenceStartTime = now;
    this.metrics.lastUtteranceTimestamp = now;
    this.updateMetrics();
  }

  onMAIAResponse(): void {
    const now = Date.now();
    const latency = now - this.metrics.lastUtteranceTimestamp;
    this.turntakingLatencies.push(latency);

    if (this.turntakingLatencies.length > 0) {
      this.metrics.turntakingLatency =
        this.turntakingLatencies.reduce((a, b) => a + b, 0) / this.turntakingLatencies.length;
    }

    this.updateMetrics();
  }

  private updateMetrics(): void {
    if (this.pauseDurations.length > 0) {
      this.metrics.averagePauseDuration =
        this.pauseDurations.reduce((a, b) => a + b, 0) / this.pauseDurations.length;
    }

    this.metrics.conversationTempo = this.calculateTempo();
    this.metrics.rhythmCoherence = this.calculateCoherence();
    this.metrics.breathAlignment = this.calculateBreathAlignment();
    this.metrics.responsePressure = this.calculateResponsePressure();

    if (this.onMetricsUpdate) {
      this.onMetricsUpdate(this.metrics);
    }
  }

  private calculateTempo(): 'slow' | 'medium' | 'fast' {
    const wpm = this.metrics.wordsPerMinute;
    if (wpm < 100) return 'slow';
    if (wpm < 150) return 'medium';
    return 'fast';
  }

  private calculateCoherence(): number {
    if (this.utteranceDurations.length < 3) return 0.5;

    const mean = this.utteranceDurations.reduce((a, b) => a + b, 0) / this.utteranceDurations.length;
    const variance = this.utteranceDurations.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / this.utteranceDurations.length;
    const stdDev = Math.sqrt(variance);

    return Math.max(0, Math.min(1, 1 - (stdDev / mean)));
  }

  private calculateBreathAlignment(): number {
    const targetBreathCycle = 4000;

    if (this.pauseDurations.length < 3) return 0.5;

    const avgPause = this.metrics.averagePauseDuration;
    const deviation = Math.abs(avgPause - targetBreathCycle);

    return Math.max(0, Math.min(1, 1 - (deviation / targetBreathCycle)));
  }

  private updateSilenceComfort(silenceDuration: number): void {
    const comfortThreshold = 3000;

    if (silenceDuration < 1000) {
      this.metrics.silenceComfort = Math.max(0, this.metrics.silenceComfort - 0.1);
    } else if (silenceDuration > comfortThreshold) {
      this.metrics.silenceComfort = Math.min(1, this.metrics.silenceComfort + 0.1);
    }
  }

  private calculateResponsePressure(): number {
    if (this.turntakingLatencies.length === 0) return 0.5;

    const avgLatency = this.metrics.turntakingLatency;

    if (avgLatency < 2000) return 0.8;
    if (avgLatency > 5000) return 0.2;
    return 0.5;
  }

  private recordEvent(event: RhythmEvent): void {
    this.eventHistory.push(event);

    if (this.eventHistory.length > 100) {
      this.eventHistory.shift();
    }
  }

  getMetrics(): RhythmMetrics {
    return { ...this.metrics };
  }

  getOptimalResponseDelay(): number {
    const basedelay = this.metrics.averagePauseDuration * 0.7;

    if (this.metrics.conversationTempo === 'fast') {
      return Math.max(500, basedelay * 0.8);
    } else if (this.metrics.conversationTempo === 'slow') {
      return Math.min(3000, basedelay * 1.2);
    }

    return Math.max(800, Math.min(2500, basedelay));
  }

  reset(): void {
    this.metrics = this.getDefaultMetrics();
    this.eventHistory = [];
    this.utteranceDurations = [];
    this.pauseDurations = [];
    this.turntakingLatencies = [];
    this.silenceStartTime = null;
    this.speechStartTime = null;
  }
}
