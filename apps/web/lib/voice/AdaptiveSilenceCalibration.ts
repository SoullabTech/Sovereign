/**
 * Adaptive Silence Calibration
 *
 * MAIA learns your natural conversation rhythm by observing:
 * - How long you pause between thoughts
 * - How quickly you respond after she speaks
 * - Whether you prefer quick exchanges or contemplative dialogue
 *
 * The system adjusts timing organically over 3-5 exchanges,
 * creating a conversation that breathes with your natural cadence.
 */

interface ConversationMetrics {
  // User speech patterns
  avgPauseDuration: number;        // Average pause between your sentences
  avgResponseDelay: number;        // How quickly you respond after MAIA
  avgSpeakingSpeed: number;        // Words per minute

  // Learning progress
  sampleCount: number;             // Number of exchanges observed
  lastUpdateTime: number;          // Timestamp of last calibration

  // Calibrated timings
  silenceThreshold: number;        // How long to wait before processing
  cooldownDuration: number;        // Delay before reactivating mic

  // Mood indicators
  isContemplative: boolean;        // Long pauses, slower speech
  isEnergetic: boolean;            // Quick responses, faster speech
}

interface TimingBoundaries {
  minSilence: number;              // Never go below this (1200ms)
  maxSilence: number;              // Never exceed this (5000ms)
  minCooldown: number;             // Minimum mic restart delay (800ms)
  maxCooldown: number;             // Maximum mic restart delay (3000ms)
}

const BOUNDARIES: TimingBoundaries = {
  minSilence: 1200,
  maxSilence: 5000,
  minCooldown: 800,
  maxCooldown: 3000
};

const DEFAULT_METRICS: ConversationMetrics = {
  avgPauseDuration: 2000,          // Start with 2s pauses
  avgResponseDelay: 2500,          // Start with 2.5s response delay
  avgSpeakingSpeed: 150,           // Assume ~150 wpm average
  sampleCount: 0,
  lastUpdateTime: Date.now(),
  silenceThreshold: 2500,          // Default: balanced
  cooldownDuration: 2000,          // Default: balanced
  isContemplative: false,
  isEnergetic: false
};

export class AdaptiveSilenceCalibration {
  private static instance: AdaptiveSilenceCalibration;
  private metrics: ConversationMetrics;
  private readonly LEARNING_RATE = 0.25; // How quickly to adapt (0-1, lower = smoother)
  private readonly MIN_SAMPLES = 3;       // Wait for 3 exchanges before adapting
  private readonly SESSION_KEY = 'maia_conversation_rhythm';

  private userSpeechStart: number = 0;
  private userSpeechEnd: number = 0;
  private maiaSpeechEnd: number = 0;
  private pauseHistory: number[] = [];
  private responseDelayHistory: number[] = [];

  private constructor() {
    this.metrics = this.loadFromStorage() || { ...DEFAULT_METRICS };
    console.log('🎵 [AdaptiveCalibration] Initialized with metrics:', this.metrics);
  }

  static getInstance(): AdaptiveSilenceCalibration {
    if (!AdaptiveSilenceCalibration.instance) {
      AdaptiveSilenceCalibration.instance = new AdaptiveSilenceCalibration();
    }
    return AdaptiveSilenceCalibration.instance;
  }

  /**
   * Call when user starts speaking
   */
  onUserSpeechStart(): void {
    this.userSpeechStart = Date.now();

    // If MAIA just finished speaking, track response delay
    if (this.maiaSpeechEnd > 0) {
      const responseDelay = this.userSpeechStart - this.maiaSpeechEnd;
      if (responseDelay > 0 && responseDelay < 10000) { // Sanity check: < 10s
        this.responseDelayHistory.push(responseDelay);
        console.log('📊 Response delay:', responseDelay, 'ms');
      }
    }
  }

  /**
   * Call when user stops speaking
   */
  onUserSpeechEnd(transcript: string): void {
    this.userSpeechEnd = Date.now();

    // Calculate speaking speed (words per minute)
    if (this.userSpeechStart > 0) {
      const durationMs = this.userSpeechEnd - this.userSpeechStart;
      const durationMin = durationMs / 60000;
      const wordCount = transcript.trim().split(/\s+/).length;
      const wpm = wordCount / durationMin;

      if (wpm > 30 && wpm < 300) { // Sanity check: reasonable speaking speed
        this.metrics.avgSpeakingSpeed = this.smoothUpdate(
          this.metrics.avgSpeakingSpeed,
          wpm,
          this.LEARNING_RATE
        );
        console.log('🗣️ Speaking speed:', Math.round(wpm), 'wpm');
      }
    }
  }

  /**
   * Call when MAIA finishes speaking
   */
  onMaiaSpeechEnd(): void {
    this.maiaSpeechEnd = Date.now();
  }

  /**
   * Call when user pauses mid-conversation (interim results)
   * This helps detect natural pause patterns
   */
  onUserPause(pauseDurationMs: number): void {
    if (pauseDurationMs > 300 && pauseDurationMs < 8000) { // Ignore very short/long pauses
      this.pauseHistory.push(pauseDurationMs);
      console.log('⏸️ Pause detected:', pauseDurationMs, 'ms');
    }
  }

  /**
   * Call after each complete exchange to recalibrate
   */
  calibrate(): void {
    this.metrics.sampleCount++;

    // Wait for minimum samples before adapting
    if (this.metrics.sampleCount < this.MIN_SAMPLES) {
      console.log(`🌱 [AdaptiveCalibration] Learning... (${this.metrics.sampleCount}/${this.MIN_SAMPLES})`);
      return;
    }

    // Calculate average pause duration from recent history
    if (this.pauseHistory.length > 0) {
      const avgPause = this.calculateMovingAverage(this.pauseHistory);
      this.metrics.avgPauseDuration = this.smoothUpdate(
        this.metrics.avgPauseDuration,
        avgPause,
        this.LEARNING_RATE
      );
      // Keep only recent pauses (last 5)
      this.pauseHistory = this.pauseHistory.slice(-5);
    }

    // Calculate average response delay
    if (this.responseDelayHistory.length > 0) {
      const avgDelay = this.calculateMovingAverage(this.responseDelayHistory);
      this.metrics.avgResponseDelay = this.smoothUpdate(
        this.metrics.avgResponseDelay,
        avgDelay,
        this.LEARNING_RATE
      );
      // Keep only recent delays (last 5)
      this.responseDelayHistory = this.responseDelayHistory.slice(-5);
    }

    // Detect conversation mood
    this.detectMood();

    // Adjust timings based on learned patterns
    this.adjustTimings();

    // Persist to storage
    this.saveToStorage();

    console.log('✨ [AdaptiveCalibration] Calibrated:', {
      silenceThreshold: Math.round(this.metrics.silenceThreshold),
      cooldownDuration: Math.round(this.metrics.cooldownDuration),
      mood: this.metrics.isContemplative ? 'contemplative' :
            this.metrics.isEnergetic ? 'energetic' : 'balanced',
      samples: this.metrics.sampleCount
    });
  }

  /**
   * Detect conversation mood from patterns
   */
  private detectMood(): void {
    const avgPause = this.metrics.avgPauseDuration;
    const avgSpeed = this.metrics.avgSpeakingSpeed;
    const avgResponse = this.metrics.avgResponseDelay;

    // Contemplative: longer pauses, slower speech, delayed responses
    this.metrics.isContemplative =
      avgPause > 2500 && avgSpeed < 130 && avgResponse > 3000;

    // Energetic: shorter pauses, faster speech, quick responses
    this.metrics.isEnergetic =
      avgPause < 1500 && avgSpeed > 170 && avgResponse < 2000;

    console.log('🎭 Mood detected:', {
      contemplative: this.metrics.isContemplative,
      energetic: this.metrics.isEnergetic,
      avgPause: Math.round(avgPause),
      avgSpeed: Math.round(avgSpeed),
      avgResponse: Math.round(avgResponse)
    });
  }

  /**
   * Adjust silence threshold and cooldown based on learned patterns
   */
  private adjustTimings(): void {
    // Silence threshold: based on pause duration + 20% buffer
    const targetSilence = this.metrics.avgPauseDuration * 1.2;
    this.metrics.silenceThreshold = this.clamp(
      targetSilence,
      BOUNDARIES.minSilence,
      BOUNDARIES.maxSilence
    );

    // Cooldown: based on response delay - 30% (they don't need all that time)
    const targetCooldown = this.metrics.avgResponseDelay * 0.7;
    this.metrics.cooldownDuration = this.clamp(
      targetCooldown,
      BOUNDARIES.minCooldown,
      BOUNDARIES.maxCooldown
    );

    // Mood-based adjustments
    if (this.metrics.isContemplative) {
      // Add extra breathing room for contemplative conversations
      this.metrics.silenceThreshold = Math.min(
        this.metrics.silenceThreshold * 1.15,
        BOUNDARIES.maxSilence
      );
      this.metrics.cooldownDuration = Math.min(
        this.metrics.cooldownDuration * 1.1,
        BOUNDARIES.maxCooldown
      );
    } else if (this.metrics.isEnergetic) {
      // Tighten timing for energetic conversations
      this.metrics.silenceThreshold = Math.max(
        this.metrics.silenceThreshold * 0.9,
        BOUNDARIES.minSilence
      );
      this.metrics.cooldownDuration = Math.max(
        this.metrics.cooldownDuration * 0.85,
        BOUNDARIES.minCooldown
      );
    }
  }

  /**
   * Get current calibrated silence threshold
   */
  getSilenceThreshold(): number {
    return Math.round(this.metrics.silenceThreshold);
  }

  /**
   * Get current calibrated cooldown duration
   */
  getCooldownDuration(): number {
    return Math.round(this.metrics.cooldownDuration);
  }

  /**
   * Get current conversation metrics (for debugging)
   */
  getMetrics(): ConversationMetrics {
    return { ...this.metrics };
  }

  /**
   * Soft reset - return to defaults while keeping learned preferences
   * Use when user seems to be switching tempo mid-session
   */
  softReset(): void {
    console.log('🔄 [AdaptiveCalibration] Soft reset - rhythm renewal');

    // Keep learned averages but reset mood
    this.metrics.isContemplative = false;
    this.metrics.isEnergetic = false;
    this.metrics.sampleCount = Math.floor(this.metrics.sampleCount / 2); // Partial reset

    // Clear recent history but keep long-term patterns
    this.pauseHistory = [];
    this.responseDelayHistory = [];

    // Recalibrate toward balanced defaults
    this.metrics.silenceThreshold = this.smoothUpdate(
      this.metrics.silenceThreshold,
      2500,
      0.5 // Faster blend back to defaults
    );
    this.metrics.cooldownDuration = this.smoothUpdate(
      this.metrics.cooldownDuration,
      2000,
      0.5
    );

    this.saveToStorage();
  }

  /**
   * Hard reset - completely forget learned patterns
   */
  hardReset(): void {
    console.log('🔄 [AdaptiveCalibration] Hard reset - starting fresh');
    this.metrics = { ...DEFAULT_METRICS };
    this.pauseHistory = [];
    this.responseDelayHistory = [];
    this.userSpeechStart = 0;
    this.userSpeechEnd = 0;
    this.maiaSpeechEnd = 0;
    localStorage.removeItem(this.SESSION_KEY);
  }

  // ========== Utility Methods ==========

  /**
   * Exponential moving average for smooth updates
   */
  private smoothUpdate(current: number, target: number, alpha: number): number {
    return current * (1 - alpha) + target * alpha;
  }

  /**
   * Calculate moving average from array
   */
  private calculateMovingAverage(values: number[]): number {
    if (values.length === 0) return 0;
    const sum = values.reduce((acc, val) => acc + val, 0);
    return sum / values.length;
  }

  /**
   * Clamp value between min and max
   */
  private clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }

  /**
   * Save metrics to localStorage
   */
  private saveToStorage(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(this.metrics));
    } catch (err) {
      console.warn('Failed to save conversation rhythm:', err);
    }
  }

  /**
   * Load metrics from localStorage
   */
  private loadFromStorage(): ConversationMetrics | null {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem(this.SESSION_KEY);
      if (stored) {
        const metrics = JSON.parse(stored);
        console.log('💾 [AdaptiveCalibration] Loaded previous rhythm:', metrics);
        return metrics;
      }
    } catch (err) {
      console.warn('Failed to load conversation rhythm:', err);
    }
    return null;
  }
}

export default AdaptiveSilenceCalibration;
