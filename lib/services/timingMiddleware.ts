/**
 * MAIA Conversation Timing Middleware
 * Tracks and optimizes conversational pacing without touching core logic
 */

interface TimingMetrics {
  userId: string;
  sessionId: string;
  inputStart: number;
  inputEnd: number;
  responseStart: number;
  responseEnd: number;
  silenceDuration: number;
  responseLatency: number;
  responseDuration: number;
  totalDuration: number;
  transcript?: string;
  responsePreview?: string;
}

interface UserPacingProfile {
  userId: string;
  averagePauseDuration: number;
  preferredSilence: number;
  lastUpdateTime: number;
  sampleCount: number;
  recentPauses: number[];
}

class ConversationTimingService {
  private metrics: Map<string, TimingMetrics[]> = new Map();
  private userProfiles: Map<string, UserPacingProfile> = new Map();
  private activeTimings: Map<string, Partial<TimingMetrics>> = new Map();

  // Configuration
  private config = {
    minSilenceDuration: 500,    // Minimum pause before responding (ms)
    maxSilenceDuration: 2000,   // Maximum pause before responding (ms)
    adaptiveLearningRate: 0.3,  // How quickly to adapt to user patterns
    metricsRetentionDays: 7,    // How long to keep metrics
    pauseBufferEnabled: true,   // Whether to use adaptive pausing
    logToConsole: true,         // Console logging
    logToFile: false,           // File logging (requires backend)
    healthCheckThreshold: 5000  // Alert if response takes >5s
  };

  /**
   * Start tracking a new input
   */
  startInput(userId: string, sessionId: string, transcript?: string): string {
    const timingId = `${userId}-${Date.now()}`;

    this.activeTimings.set(timingId, {
      userId,
      sessionId,
      inputStart: Date.now(),
      transcript
    });

    if (this.config.logToConsole) {
      console.log(`⏱️ [TIMING] Input started for ${userId}`);
    }

    return timingId;
  }

  /**
   * Mark input as complete
   */
  endInput(timingId: string): void {
    const timing = this.activeTimings.get(timingId);
    if (timing) {
      timing.inputEnd = Date.now();

      if (this.config.logToConsole) {
        const duration = timing.inputEnd - (timing.inputStart || 0);
        console.log(`⏱️ [TIMING] Input ended after ${duration}ms`);
      }
    }
  }

  /**
   * Calculate adaptive pause duration for a user
   */
  async getAdaptivePause(userId: string): Promise<number> {
    if (!this.config.pauseBufferEnabled) {
      return this.config.minSilenceDuration;
    }

    const profile = this.userProfiles.get(userId);

    if (!profile || profile.sampleCount < 3) {
      // Default pause for new users
      return 800;
    }

    // Use weighted average of recent pauses
    const recentAvg = profile.recentPauses.reduce((a, b) => a + b, 0) / profile.recentPauses.length;
    const adaptedPause = Math.round(
      profile.preferredSilence * (1 - this.config.adaptiveLearningRate) +
      recentAvg * this.config.adaptiveLearningRate
    );

    // Clamp to configured bounds
    return Math.max(
      this.config.minSilenceDuration,
      Math.min(this.config.maxSilenceDuration, adaptedPause)
    );
  }

  /**
   * Apply adaptive pause before responding
   */
  async applyAdaptivePause(userId: string, timingId: string): Promise<void> {
    const pauseDuration = await this.getAdaptivePause(userId);

    if (this.config.logToConsole) {
      console.log(`⏱️ [TIMING] Applying ${pauseDuration}ms pause for ${userId}`);
    }

    // Mark when we start waiting
    const timing = this.activeTimings.get(timingId);
    if (timing) {
      timing.responseStart = Date.now() + pauseDuration;
    }

    return new Promise(resolve => setTimeout(resolve, pauseDuration));
  }

  /**
   * Mark response as started
   */
  startResponse(timingId: string, responsePreview?: string): void {
    const timing = this.activeTimings.get(timingId);
    if (timing) {
      if (!timing.responseStart) {
        timing.responseStart = Date.now();
      }
      timing.responsePreview = responsePreview?.substring(0, 50);

      // Calculate silence duration
      if (timing.inputEnd) {
        timing.silenceDuration = timing.responseStart - timing.inputEnd;
        timing.responseLatency = timing.silenceDuration;

        if (this.config.logToConsole) {
          console.log(`⏱️ [TIMING] Response starting after ${timing.silenceDuration}ms silence`);
        }
      }
    }
  }

  /**
   * Mark response as complete and log metrics
   */
  endResponse(timingId: string): TimingMetrics | null {
    const timing = this.activeTimings.get(timingId);
    if (!timing || !timing.inputStart) return null;

    const completed: TimingMetrics = {
      userId: timing.userId!,
      sessionId: timing.sessionId!,
      inputStart: timing.inputStart,
      inputEnd: timing.inputEnd || timing.inputStart,
      responseStart: timing.responseStart || Date.now(),
      responseEnd: Date.now(),
      silenceDuration: timing.silenceDuration || 0,
      responseLatency: timing.responseLatency || 0,
      responseDuration: Date.now() - (timing.responseStart || Date.now()),
      totalDuration: Date.now() - timing.inputStart,
      transcript: timing.transcript,
      responsePreview: timing.responsePreview
    };

    // Store metrics
    const userMetrics = this.metrics.get(completed.userId) || [];
    userMetrics.push(completed);
    this.metrics.set(completed.userId, userMetrics);

    // Update user profile
    this.updateUserProfile(completed);

    // Log metrics
    this.logMetrics(completed);

    // Health check
    this.performHealthCheck(completed);

    // Cleanup
    this.activeTimings.delete(timingId);

    return completed;
  }

  /**
   * Update user's pacing profile based on new metrics
   */
  private updateUserProfile(metrics: TimingMetrics): void {
    const profile = this.userProfiles.get(metrics.userId) || {
      userId: metrics.userId,
      averagePauseDuration: 800,
      preferredSilence: 800,
      lastUpdateTime: Date.now(),
      sampleCount: 0,
      recentPauses: []
    };

    // Add to recent pauses (keep last 10)
    profile.recentPauses.push(metrics.silenceDuration);
    if (profile.recentPauses.length > 10) {
      profile.recentPauses.shift();
    }

    // Update averages
    profile.sampleCount++;
    profile.averagePauseDuration =
      (profile.averagePauseDuration * (profile.sampleCount - 1) + metrics.silenceDuration) / profile.sampleCount;

    // Update preferred silence (adaptive)
    profile.preferredSilence = Math.round(
      profile.preferredSilence * (1 - this.config.adaptiveLearningRate) +
      metrics.silenceDuration * this.config.adaptiveLearningRate
    );

    profile.lastUpdateTime = Date.now();

    this.userProfiles.set(metrics.userId, profile);
  }

  /**
   * Log timing metrics
   */
  private logMetrics(metrics: TimingMetrics): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      user: metrics.userId,
      session: metrics.sessionId,
      silence_ms: metrics.silenceDuration,
      latency_ms: metrics.responseLatency,
      response_ms: metrics.responseDuration,
      total_ms: metrics.totalDuration,
      transcript_preview: metrics.transcript?.substring(0, 30),
      response_preview: metrics.responsePreview
    };

    if (this.config.logToConsole) {
      console.log('📊 [TIMING METRICS]', JSON.stringify(logEntry, null, 2));
    }

    if (this.config.logToFile) {
      // Send to backend for file logging
      this.sendToBackend(logEntry);
    }
  }

  /**
   * Check for performance issues
   */
  private performHealthCheck(metrics: TimingMetrics): void {
    if (metrics.totalDuration > this.config.healthCheckThreshold) {
      console.warn(`⚠️ [TIMING ALERT] Slow response detected: ${metrics.totalDuration}ms total`);

      // Could trigger alerts, fallback modes, etc.
      this.handleSlowResponse(metrics);
    }

    if (metrics.silenceDuration > this.config.maxSilenceDuration) {
      console.warn(`⚠️ [TIMING ALERT] Long silence detected: ${metrics.silenceDuration}ms`);
    }
  }

  /**
   * Handle slow response scenarios
   */
  private handleSlowResponse(metrics: TimingMetrics): void {
    // Could implement fallback strategies here
    // e.g., switch to faster model, reduce response complexity, etc.
  }

  /**
   * Send metrics to backend for persistent logging
   */
  private async sendToBackend(logEntry: any): Promise<void> {
    try {
      await fetch('/api/timing/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logEntry)
      });
    } catch (error) {
      console.error('Failed to send timing metrics to backend:', error);
    }
  }

  /**
   * Get summary statistics for a user
   */
  getUserStats(userId: string): any {
    const userMetrics = this.metrics.get(userId) || [];
    const profile = this.userProfiles.get(userId);

    if (userMetrics.length === 0) {
      return null;
    }

    const avgSilence = userMetrics.reduce((sum, m) => sum + m.silenceDuration, 0) / userMetrics.length;
    const avgResponse = userMetrics.reduce((sum, m) => sum + m.responseDuration, 0) / userMetrics.length;
    const avgTotal = userMetrics.reduce((sum, m) => sum + m.totalDuration, 0) / userMetrics.length;

    return {
      userId,
      sampleCount: userMetrics.length,
      averageSilence: Math.round(avgSilence),
      averageResponse: Math.round(avgResponse),
      averageTotal: Math.round(avgTotal),
      preferredPause: profile?.preferredSilence || 800,
      lastInteraction: userMetrics[userMetrics.length - 1]?.responseEnd || null
    };
  }

  /**
   * Clear old metrics to prevent memory bloat
   */
  cleanupOldMetrics(): void {
    const cutoffTime = Date.now() - (this.config.metricsRetentionDays * 24 * 60 * 60 * 1000);

    this.metrics.forEach((userMetrics, userId) => {
      const filtered = userMetrics.filter(m => m.responseEnd > cutoffTime);
      if (filtered.length > 0) {
        this.metrics.set(userId, filtered);
      } else {
        this.metrics.delete(userId);
      }
    });
  }

  /**
   * Configure the timing service
   */
  configure(config: Partial<typeof this.config>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): typeof this.config {
    return { ...this.config };
  }
}

// Singleton instance
export const timingService = new ConversationTimingService();

// React hook for easy integration
export function useConversationTiming(userId: string, sessionId: string) {
  const [timingId, setTimingId] = React.useState<string | null>(null);
  const [metrics, setMetrics] = React.useState<TimingMetrics | null>(null);
  const [stats, setStats] = React.useState<any>(null);

  const startInput = React.useCallback((transcript?: string) => {
    const id = timingService.startInput(userId, sessionId, transcript);
    setTimingId(id);
    return id;
  }, [userId, sessionId]);

  const endInput = React.useCallback(() => {
    if (timingId) {
      timingService.endInput(timingId);
    }
  }, [timingId]);

  const applyPause = React.useCallback(async () => {
    if (timingId) {
      await timingService.applyAdaptivePause(userId, timingId);
    }
  }, [userId, timingId]);

  const startResponse = React.useCallback((preview?: string) => {
    if (timingId) {
      timingService.startResponse(timingId, preview);
    }
  }, [timingId]);

  const endResponse = React.useCallback(() => {
    if (timingId) {
      const m = timingService.endResponse(timingId);
      if (m) {
        setMetrics(m);
        setStats(timingService.getUserStats(userId));
      }
      setTimingId(null);
    }
  }, [timingId, userId]);

  React.useEffect(() => {
    // Load initial stats
    setStats(timingService.getUserStats(userId));

    // Cleanup old metrics periodically
    const cleanup = setInterval(() => {
      timingService.cleanupOldMetrics();
    }, 60 * 60 * 1000); // Every hour

    return () => clearInterval(cleanup);
  }, [userId]);

  return {
    startInput,
    endInput,
    applyPause,
    startResponse,
    endResponse,
    metrics,
    stats,
    timingId
  };
}

// Export for global access
export default timingService;