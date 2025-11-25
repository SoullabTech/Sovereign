/**
 * Session Timer - Therapeutic Time Container
 *
 * Tracks session time and provides context for MAIA's time-aware responses.
 * Mirrors the therapeutic practice of holding temporal boundaries.
 */

export type SessionPhase = 'opening' | 'exploration' | 'integration' | 'closure' | 'complete';

export interface SessionTimeContext {
  elapsedMinutes: number;
  remainingMinutes: number;
  totalMinutes: number;
  phase: SessionPhase;
  phaseDescription: string;
  systemPromptContext: string;
}

export interface SessionTimerConfig {
  durationMinutes: number;
  onPhaseChange?: (phase: SessionPhase) => void;
  onTimeWarning?: (minutesRemaining: number) => void;
  onComplete?: () => void;
}

export class SessionTimer {
  private startTime: Date;
  private durationMs: number;
  private intervalId: NodeJS.Timeout | null = null;
  private config: SessionTimerConfig;
  private lastPhase: SessionPhase = 'opening';
  private warningsIssued: Set<number> = new Set();

  constructor(config: SessionTimerConfig, startTime?: Date) {
    this.startTime = startTime || new Date();
    this.durationMs = config.durationMinutes * 60 * 1000;
    this.config = config;
  }

  /**
   * Create a timer from saved session data (for restoration)
   */
  static fromSavedData(
    startTime: Date,
    durationMinutes: number,
    totalExtensionMinutes: number,
    config: Omit<SessionTimerConfig, 'durationMinutes'>
  ): SessionTimer {
    const timer = new SessionTimer(
      { ...config, durationMinutes: durationMinutes + totalExtensionMinutes },
      startTime
    );
    return timer;
  }

  /**
   * Get start time (for persistence)
   */
  getStartTime(): Date {
    return this.startTime;
  }

  /**
   * Get original duration in minutes (for persistence)
   */
  getDurationMinutes(): number {
    return Math.floor(this.durationMs / 60000);
  }

  /**
   * Start the timer with automatic phase tracking
   */
  start(updateIntervalMs: number = 30000): void {
    // Check immediately
    this.checkPhaseAndWarnings();

    // Then check periodically (default every 30 seconds)
    this.intervalId = setInterval(() => {
      this.checkPhaseAndWarnings();
    }, updateIntervalMs);
  }

  /**
   * Stop the timer
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Get current time context for MAIA's system prompt
   */
  getTimeContext(): SessionTimeContext {
    const elapsed = Date.now() - this.startTime.getTime();
    const elapsedMinutes = Math.floor(elapsed / 60000);
    const remainingMinutes = Math.max(0, this.config.durationMinutes - elapsedMinutes);
    const phase = this.getCurrentPhase(elapsedMinutes);

    return {
      elapsedMinutes,
      remainingMinutes,
      totalMinutes: this.config.durationMinutes,
      phase,
      phaseDescription: this.getPhaseDescription(phase, elapsedMinutes, remainingMinutes),
      systemPromptContext: this.getSystemPromptContext(phase, elapsedMinutes, remainingMinutes)
    };
  }

  /**
   * Extend session time (when client needs more time)
   */
  extend(additionalMinutes: number): void {
    this.durationMs += additionalMinutes * 60 * 1000;
    console.log(`⏰ Session extended by ${additionalMinutes} minutes`);
  }

  /**
   * Determine session phase based on elapsed time
   */
  private getCurrentPhase(elapsedMinutes: number): SessionPhase {
    const duration = this.config.durationMinutes;
    const percentComplete = (elapsedMinutes / duration) * 100;

    if (elapsedMinutes >= duration) return 'complete';
    if (percentComplete >= 85) return 'closure';      // Last 15% (7.5 min of 50)
    if (percentComplete >= 70) return 'integration';  // 70-85% (35-42 min of 50)
    if (percentComplete >= 20) return 'exploration';  // 20-70% (10-35 min of 50)
    return 'opening';                                  // First 20% (0-10 min of 50)
  }

  /**
   * Get phase-specific description for UI display
   */
  private getPhaseDescription(phase: SessionPhase, elapsed: number, remaining: number): string {
    switch (phase) {
      case 'opening':
        return 'Opening - Establishing presence';
      case 'exploration':
        return 'Exploration - Deep dive supported';
      case 'integration':
        return 'Integration - Beginning to metabolize';
      case 'closure':
        return `Closure - ${remaining} minutes remaining`;
      case 'complete':
        return 'Session complete';
    }
  }

  /**
   * Generate system prompt context based on time phase
   * This is injected into MAIA's consciousness
   */
  private getSystemPromptContext(phase: SessionPhase, elapsed: number, remaining: number): string {
    const total = this.config.durationMinutes;

    switch (phase) {
      case 'opening':
        return `[TEMPORAL CONTEXT: Beginning of session (${elapsed} minutes elapsed / ${total} minute container).
Full depth available. This is opening time - establish presence, attune, follow emergence.
You have plenty of time to explore whatever wants to be known.]`;

      case 'exploration':
        return `[TEMPORAL CONTEXT: Mid-session (${elapsed} minutes elapsed / ${total} minute container).
Core working time. Full exploration available. Deep dive supported.
This is the heart of the session - trust the process and stay with what's alive.]`;

      case 'integration':
        return `[TEMPORAL CONTEXT: Integration phase (${elapsed} minutes elapsed / ${total} minute container, ${remaining} minutes remaining).
Begin gentle metabolization. If new material emerges, acknowledge and offer to explore next time.
Start weaving threads together. Avoid opening unexplored depths - focus on integration of what's already alive.
You're beginning to sense toward closure, but not rushed.]`;

      case 'closure':
        return `[TEMPORAL CONTEXT: Closing time (${elapsed} minutes elapsed / ${total} minute container, ${remaining} minutes remaining).
Bring conversation toward natural completion. Summarize, affirm, offer grounding.
If something urgent emerges, acknowledge it and offer to hold it for next time.
Help them carry today's work forward. Model that endings can be safe and intentional.
Natural closure - not abrupt cutoff. The container is being honored.]`;

      case 'complete':
        return `[TEMPORAL CONTEXT: Session time complete (${total} minutes).
Offer graceful ending: "It feels like a natural place to pause for today..."
Provide option to extend if truly needed, but default to honoring the container.
Affirm the work done today. This boundary is part of the therapeutic holding.]`;
    }
  }

  /**
   * Check for phase changes and issue warnings
   */
  private checkPhaseAndWarnings(): void {
    const context = this.getTimeContext();

    // Phase change detection
    if (context.phase !== this.lastPhase) {
      console.log(`⏰ Session phase: ${this.lastPhase} → ${context.phase}`);
      this.config.onPhaseChange?.(context.phase);
      this.lastPhase = context.phase;
    }

    // Time warnings (10 min, 5 min, 2 min, 0 min)
    const warningThresholds = [10, 5, 2, 0];
    for (const threshold of warningThresholds) {
      if (
        context.remainingMinutes <= threshold &&
        !this.warningsIssued.has(threshold)
      ) {
        this.warningsIssued.add(threshold);
        this.config.onTimeWarning?.(threshold);

        if (threshold === 0) {
          this.config.onComplete?.();
        }
      }
    }
  }
}

/**
 * Preset session durations (in minutes)
 */
export const SESSION_PRESETS = {
  quick: { minutes: 20, label: '20 min - Quick Check-in' },
  standard: { minutes: 50, label: '50 min - Standard Session' },
  extended: { minutes: 75, label: '75 min - Extended Session' },
  deep: { minutes: 90, label: '90 min - Deep Work' },
} as const;

/**
 * Format time remaining for display
 */
export function formatTimeRemaining(minutes: number): string {
  if (minutes === 0) return 'Time complete';
  if (minutes === 1) return '1 minute';
  if (minutes < 60) return `${minutes} minutes`;

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
  return `${hours}h ${mins}m`;
}
