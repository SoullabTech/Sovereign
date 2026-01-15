/**
 * Build Health Monitor
 *
 * Tracks runtime errors and health status to alert developer
 * before users report issues. Runs server-side only.
 */

interface ErrorEntry {
  timestamp: number;
  message: string;
  source?: string;
}

interface AlertConfig {
  warningThreshold: number; // Errors per window to trigger warning
  criticalThreshold: number; // Errors per window to trigger critical
  windowMs: number; // Sliding window duration
  cooldownMs: number; // Minimum time between alerts
  baseUrl?: string;
  alertToken?: string;
}

interface HealthStatus {
  healthy: boolean;
  errorRate: number; // Errors per minute
  errorsInWindow: number;
  lastError: ErrorEntry | null;
  uptime: number;
  lastAlertSent: number | null;
  consecutiveHealthFailures: number;
}

const DEFAULT_CONFIG: AlertConfig = {
  warningThreshold: 5, // 5 errors in 5 minutes = warning
  criticalThreshold: 20, // 20 errors in 5 minutes = critical
  windowMs: 5 * 60 * 1000, // 5 minute window
  cooldownMs: 5 * 60 * 1000, // 5 minute cooldown between alerts
};

class BuildHealthMonitor {
  private errors: ErrorEntry[] = [];
  private config: AlertConfig;
  private lastAlertTime: number = 0;
  private startTime: number = Date.now();
  private consecutiveHealthFailures: number = 0;
  private isInitialized: boolean = false;

  constructor(config: Partial<AlertConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Initialize with environment config (call in server startup)
   */
  initialize(baseUrl?: string, alertToken?: string): void {
    this.config.baseUrl = baseUrl || process.env.BASE_URL || "https://soullab.life";
    this.config.alertToken = alertToken || process.env.INTERNAL_ALERT_TOKEN || "";
    this.isInitialized = true;
    console.log("[BuildHealthMonitor] Initialized");
  }

  /**
   * Record an error occurrence
   */
  recordError(message: string, source?: string): void {
    const entry: ErrorEntry = {
      timestamp: Date.now(),
      message: message.substring(0, 500), // Limit message length
      source,
    };

    this.errors.push(entry);
    this.pruneOldErrors();
    this.checkThresholds();
  }

  /**
   * Record a health check failure
   */
  recordHealthFailure(): void {
    this.consecutiveHealthFailures++;

    // Alert after 3 consecutive failures
    if (this.consecutiveHealthFailures === 3) {
      this.sendAlert(
        "warning",
        `Health check failed ${this.consecutiveHealthFailures} times consecutively`
      );
    }

    // Critical alert after 5 consecutive failures
    if (this.consecutiveHealthFailures === 5) {
      this.sendAlert(
        "critical",
        `Health check failed ${this.consecutiveHealthFailures} times - service may be down`
      );
    }
  }

  /**
   * Record a successful health check
   */
  recordHealthSuccess(): void {
    if (this.consecutiveHealthFailures >= 3) {
      // Service recovered - send info alert
      this.sendAlert(
        "info",
        `Service recovered after ${this.consecutiveHealthFailures} health check failures`
      );
    }
    this.consecutiveHealthFailures = 0;
  }

  /**
   * Get current health status
   */
  getStatus(): HealthStatus {
    this.pruneOldErrors();
    const errorsInWindow = this.errors.length;
    const windowMinutes = this.config.windowMs / 60000;
    const errorRate = errorsInWindow / windowMinutes;

    return {
      healthy: errorsInWindow < this.config.warningThreshold && this.consecutiveHealthFailures < 3,
      errorRate: Math.round(errorRate * 100) / 100,
      errorsInWindow,
      lastError: this.errors[this.errors.length - 1] || null,
      uptime: Date.now() - this.startTime,
      lastAlertSent: this.lastAlertTime || null,
      consecutiveHealthFailures: this.consecutiveHealthFailures,
    };
  }

  /**
   * Remove errors outside the sliding window
   */
  private pruneOldErrors(): void {
    const cutoff = Date.now() - this.config.windowMs;
    this.errors = this.errors.filter((e) => e.timestamp > cutoff);
  }

  /**
   * Check if we've exceeded alert thresholds
   */
  private checkThresholds(): void {
    const errorsInWindow = this.errors.length;

    if (errorsInWindow >= this.config.criticalThreshold) {
      this.sendAlert(
        "critical",
        `Error rate critical: ${errorsInWindow} errors in ${this.config.windowMs / 60000} minutes`
      );
    } else if (errorsInWindow >= this.config.warningThreshold) {
      this.sendAlert(
        "warning",
        `Error rate elevated: ${errorsInWindow} errors in ${this.config.windowMs / 60000} minutes`
      );
    }
  }

  /**
   * Send an alert if cooldown has elapsed
   */
  private async sendAlert(
    severity: "critical" | "warning" | "info",
    message: string
  ): Promise<void> {
    // Check cooldown (critical alerts bypass for escalation)
    const now = Date.now();
    if (severity !== "critical" && now - this.lastAlertTime < this.config.cooldownMs) {
      return;
    }

    if (!this.isInitialized || !this.config.alertToken) {
      console.warn("[BuildHealthMonitor] Not initialized, cannot send alert:", message);
      return;
    }

    this.lastAlertTime = now;

    try {
      const response = await fetch(`${this.config.baseUrl}/api/build/alert`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-internal-token": this.config.alertToken,
        },
        body: JSON.stringify({
          severity,
          message,
          source: "BuildHealthMonitor",
          details: {
            errorRate: this.getStatus().errorRate,
            errorsInWindow: this.errors.length,
            uptime: Date.now() - this.startTime,
          },
        }),
      });

      if (!response.ok) {
        console.error("[BuildHealthMonitor] Alert send failed:", response.status);
      }
    } catch (error) {
      console.error("[BuildHealthMonitor] Alert send error:", error);
    }
  }

  /**
   * Reset the monitor (useful for testing)
   */
  reset(): void {
    this.errors = [];
    this.lastAlertTime = 0;
    this.consecutiveHealthFailures = 0;
    this.startTime = Date.now();
  }
}

// Singleton instance for server-side use
export const buildHealthMonitor = new BuildHealthMonitor();

// Export class for custom instances
export { BuildHealthMonitor };
export type { HealthStatus, AlertConfig, ErrorEntry };
