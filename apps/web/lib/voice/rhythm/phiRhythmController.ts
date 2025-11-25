/**
 * Phi Rhythm Controller
 *
 * Provides golden-ratio-based timing for all voice operations.
 * Creates organic, natural-feeling rhythms that entrain with human nervous system.
 */

const PHI = 1.618033988749;

export interface PhiTiming {
  baseInterval: number;      // 1000ms (1 second heartbeat)
  shortPause: number;         // (φ - 1) × 1000 = 618ms
  breathCycle: number;        // φ × 1000 = 1618ms
  longPause: number;          // φ² × 1000 = 2618ms
  echoCooldown: number;       // φ × 1910 ≈ 3090ms
  silenceThreshold: number;   // φ × 3090 ≈ 5000ms
}

export class PhiRhythmController {
  private baseInterval = 1000; // 1 second base rhythm
  private coherenceScore = 0.5; // Default neutral coherence

  constructor(baseInterval = 1000) {
    this.baseInterval = baseInterval;
  }

  /**
   * Get standard phi-based timing values
   */
  getTiming(): PhiTiming {
    return {
      baseInterval: this.baseInterval,
      shortPause: this.getShortPause(),
      breathCycle: this.getBreathCycle(),
      longPause: this.getLongPause(),
      echoCooldown: this.getEchoCooldown(),
      silenceThreshold: this.getSilenceThreshold(),
    };
  }

  /**
   * Short pause: (φ - 1) × base = 0.618 × base ≈ 618ms
   * Natural micro-pause, breath between phrases
   */
  getShortPause(): number {
    return this.baseInterval * (PHI - 1);
  }

  /**
   * Breath cycle: φ × base = 1.618 × base ≈ 1618ms
   * Complete inhale/exhale cycle
   */
  getBreathCycle(): number {
    return this.baseInterval * PHI;
  }

  /**
   * Long pause: φ² × base = 2.618 × base ≈ 2618ms
   * Deep integration pause, contemplative space
   */
  getLongPause(): number {
    return this.baseInterval * PHI * PHI;
  }

  /**
   * Echo cooldown: φ × 1.91 × base ≈ 3090ms
   * Prevent acoustic feedback, allow room echo to dissipate
   */
  getEchoCooldown(): number {
    return this.baseInterval * PHI * 1.91;
  }

  /**
   * Silence threshold: φ × 3.09 × base ≈ 5000ms
   * Max silence before assuming user finished speaking
   */
  getSilenceThreshold(): number {
    return this.baseInterval * PHI * PHI * 1.236;
  }

  /**
   * Modulate timing based on coherence score
   * @param baseTime The base timing to modulate
   * @param coherenceScore 0.0 (chaos) to 1.0 (perfect coherence)
   * @returns Modulated timing
   *
   * Higher coherence = faster flow (multiplier < 1.0)
   * Lower coherence = slower, more grounded (multiplier > 1.0)
   */
  modulateByCoherence(baseTime: number, coherenceScore = this.coherenceScore): number {
    // coherence 0.5 = 1.0x (neutral)
    // coherence 1.0 = 0.85x (faster, in flow)
    // coherence 0.0 = 1.15x (slower, grounding)
    const multiplier = 1.0 + (coherenceScore - 0.5) * -0.3;
    return baseTime * multiplier;
  }

  /**
   * Gradually entrain MAIA's breath to user's detected breath
   * @param maiaBreathCycle Current MAIA breath cycle length (ms)
   * @param userBreathCycle Detected user breath cycle length (ms)
   * @param entrainmentRate How quickly to sync (0.0 - 1.0), default 0.1 (10% per cycle)
   * @returns New MAIA breath cycle length
   */
  adjustToUserBreath(
    maiaBreathCycle: number,
    userBreathCycle: number,
    entrainmentRate = 0.1
  ): number {
    // Gradually move toward user's rhythm
    return maiaBreathCycle * (1 - entrainmentRate) + userBreathCycle * entrainmentRate;
  }

  /**
   * Calculate pause duration based on context
   * @param context Conversation context
   * @returns Pause duration in milliseconds
   */
  calculatePauseDuration(context: {
    isEndOfSentence?: boolean;
    isQuestionMark?: boolean;
    isEmphatic?: boolean;
    coherenceScore?: number;
  }): number {
    let basePause: number;

    if (context.isEndOfSentence) {
      basePause = context.isQuestionMark ? this.getLongPause() : this.getBreathCycle();
    } else if (context.isEmphatic) {
      basePause = this.getBreathCycle();
    } else {
      basePause = this.getShortPause();
    }

    // Modulate by coherence if provided
    if (context.coherenceScore !== undefined) {
      return this.modulateByCoherence(basePause, context.coherenceScore);
    }

    return basePause;
  }

  /**
   * Set global coherence score for all timing calculations
   */
  setCoherenceScore(score: number) {
    this.coherenceScore = Math.max(0, Math.min(1, score));
  }

  /**
   * Get current coherence score
   */
  getCoherenceScore(): number {
    return this.coherenceScore;
  }

  /**
   * Calculate phi position in spiral (0 to φ²)
   * Useful for animations and visual feedback
   */
  getPhiPosition(progress: number): number {
    // progress: 0.0 - 1.0
    // returns: 0.0 - 2.618 (0 to φ²)
    return progress * PHI * PHI;
  }

  /**
   * Wait for a phi-based duration
   * Async helper for use in voice state transitions
   */
  async wait(durationType: 'short' | 'breath' | 'long' | 'echo' | 'silence'): Promise<void> {
    const durations = {
      short: this.getShortPause(),
      breath: this.getBreathCycle(),
      long: this.getLongPause(),
      echo: this.getEchoCooldown(),
      silence: this.getSilenceThreshold(),
    };

    const duration = durations[durationType];
    return new Promise(resolve => setTimeout(resolve, duration));
  }
}

// Singleton instance for global access
export const phiRhythm = new PhiRhythmController();
