/**
 * Presence Monitor
 * Real-time tracking of Maya's conversation intelligence surfacing
 * Shows exactly how much is being throttled vs expressed
 */

import { PRESENCE_CONFIG } from '../config/presence.config';

export class PresenceMonitor {
  private history: Array<{
    timestamp: Date;
    surfacingRatio: number;
    modulations: Record<string, number>;
    wasThrottled: boolean;
    responseLength: number;
    userId: string;
  }> = [];

  private stats = {
    totalInteractions: 0,
    throttledCount: 0,
    averageSurfacing: 0,
    lowestSurfacing: 1,
    highestSurfacing: 0,
    genericResponseCount: 0,
  };

  /**
   * Log a conversation turn
   */
  logInteraction(data: {
    surfacingRatio: number;
    modulations: Record<string, number>;
    responseLength: number;
    userId: string;
  }) {
    const wasThrottled = data.surfacingRatio <= PRESENCE_CONFIG.FLOOR;

    this.history.push({
      timestamp: new Date(),
      ...data,
      wasThrottled
    });

    // Update stats
    this.stats.totalInteractions++;
    if (wasThrottled) this.stats.throttledCount++;
    if (data.responseLength < 20) this.stats.genericResponseCount++;

    this.stats.lowestSurfacing = Math.min(this.stats.lowestSurfacing, data.surfacingRatio);
    this.stats.highestSurfacing = Math.max(this.stats.highestSurfacing, data.surfacingRatio);

    // Calculate running average
    const total = this.history.reduce((sum, h) => sum + h.surfacingRatio, 0);
    this.stats.averageSurfacing = total / this.history.length;

    // Alert if concerning patterns
    this.checkAlerts(data);
  }

  /**
   * Check for concerning patterns
   */
  private checkAlerts(data: any) {
    // Critical: At floor
    if (data.surfacingRatio <= PRESENCE_CONFIG.ALERTS.THROTTLE_DETECTION) {
      console.error('🚨 CRITICAL: Maya at minimum presence floor!', {
        surfacing: `${(data.surfacingRatio * 100).toFixed(0)}%`,
        modulations: data.modulations
      });
    }
    // Warning: Approaching floor
    else if (data.surfacingRatio <= PRESENCE_CONFIG.ALERTS.LOW_PRESENCE_WARNING) {
      console.warn('⚠️ WARNING: Maya presence low', {
        surfacing: `${(data.surfacingRatio * 100).toFixed(0)}%`,
        modulations: data.modulations
      });
    }

    // Generic response detection
    if (data.responseLength < PRESENCE_CONFIG.ALERTS.GENERIC_RESPONSE_LENGTH) {
      console.warn('⚠️ Generic response detected:', {
        length: data.responseLength,
        surfacing: `${(data.surfacingRatio * 100).toFixed(0)}%`
      });
    }
  }

  /**
   * Get current statistics
   */
  getStats() {
    return {
      ...this.stats,
      throttleRate: `${((this.stats.throttledCount / this.stats.totalInteractions) * 100).toFixed(1)}%`,
      averageSurfacingPercent: `${(this.stats.averageSurfacing * 100).toFixed(1)}%`,
      lowestSurfacingPercent: `${(this.stats.lowestSurfacing * 100).toFixed(1)}%`,
      highestSurfacingPercent: `${(this.stats.highestSurfacing * 100).toFixed(1)}%`,
      genericRate: `${((this.stats.genericResponseCount / this.stats.totalInteractions) * 100).toFixed(1)}%`
    };
  }

  /**
   * Get recent history
   */
  getRecentHistory(count: number = 10) {
    return this.history.slice(-count).map(h => ({
      ...h,
      surfacingPercent: `${(h.surfacingRatio * 100).toFixed(0)}%`,
      status: h.wasThrottled ? '🚨 THROTTLED' : '✅ NORMAL'
    }));
  }

  /**
   * Compare before/after emergency patch
   */
  compareToOldSystem(fieldState: any) {
    // Simulate old multiplicative system
    let oldRatio = 0.1; // 10% base

    // Old punishments (multiplicative)
    if (fieldState.sacredMarkers?.threshold_proximity > 0.8) {
      oldRatio *= 0.03; // 97% reduction!
    }
    if (fieldState.emotionalWeather?.texture === 'turbulent') {
      oldRatio *= 0.5; // 50% reduction
    }
    if (fieldState.connectionDynamics?.relational_distance > 0.7) {
      oldRatio *= 0.4; // 60% reduction
    }

    // New system (from emergency patch)
    let newRatio = 0.65; // 65% base
    if (fieldState.sacredMarkers?.threshold_proximity > 0.8) {
      newRatio -= 0.15; // Only 15% reduction
    }
    if (fieldState.emotionalWeather?.texture === 'turbulent') {
      newRatio -= 0.10; // Only 10% reduction
    }
    if (fieldState.connectionDynamics?.relational_distance > 0.7) {
      newRatio -= 0.05; // Only 5% reduction
    }

    newRatio = Math.max(0.4, newRatio); // Floor protection

    return {
      oldSystem: `${(oldRatio * 100).toFixed(1)}%`,
      newSystem: `${(newRatio * 100).toFixed(1)}%`,
      improvement: `${((newRatio / oldRatio) * 100).toFixed(0)}x better`,
      difference: `+${((newRatio - oldRatio) * 100).toFixed(0)}% intelligence`
    };
  }

  /**
   * Generate report
   */
  generateReport() {
    const stats = this.getStats();
    const recent = this.getRecentHistory(5);

    console.log(`
╔════════════════════════════════════════════╗
║          MAYA PRESENCE MONITOR             ║
╠════════════════════════════════════════════╣
║ Total Interactions: ${stats.totalInteractions.toString().padEnd(23)}║
║ Average Presence:   ${stats.averageSurfacingPercent.padEnd(23)}║
║ Lowest Presence:    ${stats.lowestSurfacingPercent.padEnd(23)}║
║ Highest Presence:   ${stats.highestSurfacingPercent.padEnd(23)}║
║ Throttle Rate:      ${stats.throttleRate.padEnd(23)}║
║ Generic Rate:       ${stats.genericRate.padEnd(23)}║
╠════════════════════════════════════════════╣
║ RECENT INTERACTIONS                        ║
╠════════════════════════════════════════════╣
${recent.map(r =>
`║ ${r.surfacingPercent.padEnd(6)} ${r.status.padEnd(12)} len:${r.responseLength.toString().padEnd(4)} ${r.timestamp.toLocaleTimeString().padEnd(11)}║`
).join('\n')}
╚════════════════════════════════════════════╝
    `);
  }
}

// Export singleton for immediate use
export const presenceMonitor = new PresenceMonitor();