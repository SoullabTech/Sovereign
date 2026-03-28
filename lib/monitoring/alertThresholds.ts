/**
 * Alert thresholds — Phase 1.5 monitoring.
 *
 * Central config for all sustained-pressure thresholds.
 * Tune these without touching monitor logic.
 *
 * "consecutiveChecks" = how many 60s polls must breach before alerting.
 * "cooldownMinutes" = minimum time between re-sends of the same alert type.
 */

export const ALERT_THRESHOLDS = {
  db: {
    /** Pool waiting > 0 for N consecutive checks = warning */
    waitingWarningChecks: 5,      // 5 min
    /** Pool waiting >= this for N checks = critical */
    waitingCriticalValue: 5,
    waitingCriticalChecks: 5,     // 5 min
    /** Utilization >= this % for N checks = warning */
    utilizationWarningPercent: 85,
    utilizationWarningChecks: 5,  // 5 min
  },

  health: {
    /** 'degraded' for N consecutive checks = warning */
    degradedWarningChecks: 3,     // 3 min
    /** endpoint failure for N consecutive checks = critical */
    failureCriticalChecks: 3,     // 3 min
  },

  memory: {
    /** Heap % > this for N checks = warning */
    warningPercent: 85,
    warningChecks: 5,             // 5 min
    /** Heap % > this for N checks = critical */
    criticalPercent: 92,
    criticalChecks: 3,            // 3 min
  },

  /** Cooldown: don't re-send same alert within this window */
  cooldownMinutes: 30,

  /** Recovery: send recovery notice after this many clean checks */
  recoveryChecks: 10,             // 10 min of clean
} as const;
