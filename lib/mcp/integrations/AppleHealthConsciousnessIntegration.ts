/**
 * Apple Health Consciousness Integration for MAIA-SOVEREIGN
 *
 * Bridges Apple Health MCP data with MAIA's consciousness systems:
 * - Injects biometric context into Oracle conversations
 * - Stores health events in ConsciousnessMemoryLattice
 * - Publishes to EventBus for real-time awareness
 * - Calculates consciousness-health correlations
 *
 * Usage in Oracle:
 *   const healthContext = await healthIntegration.getOracleContext(userId);
 *   // Include healthContext in conversation for biometric-aware responses
 */

import { EventEmitter } from 'events';
import {
  getAppleHealthAdapter,
  type HealthMetricsSummary,
  type ConsciousnessHealthCorrelation,
} from '../adapters/AppleHealthAdapter';
import { getMCPClientManager } from '../MCPClientManager';

export interface OracleHealthContext {
  available: boolean;
  summary?: string;
  readinessScore?: number;
  suggestedApproach?: string;
  detailedMetrics?: HealthMetricsSummary;
  correlation?: ConsciousnessHealthCorrelation;
  lastUpdated?: Date;
}

export interface HealthConsciousnessEvent {
  id: string;
  userId: string;
  type: 'health_update' | 'readiness_change' | 'coherence_shift';
  data: {
    readinessScore: number;
    coherenceIndicators: HealthMetricsSummary['coherenceIndicators'];
    biometricContext: string;
  };
  timestamp: Date;
}

/**
 * Apple Health Consciousness Integration
 * Connects biometric data with MAIA's awareness systems
 */
export class AppleHealthConsciousnessIntegration extends EventEmitter {
  private adapter = getAppleHealthAdapter();
  private manager = getMCPClientManager();
  private lastSummary: HealthMetricsSummary | null = null;
  private lastUpdateTime: Date | null = null;
  private isPolling = false;

  constructor() {
    super();

    // Listen for adapter updates
    this.adapter.on('summary', (summary: HealthMetricsSummary) => {
      this.handleSummaryUpdate(summary);
    });

    this.adapter.on('error', (error: Error) => {
      console.error('[HealthIntegration] Adapter error:', error);
      this.emit('error', error);
    });
  }

  /**
   * Initialize the integration
   * Call this when MAIA starts a session
   */
  async initialize(): Promise<boolean> {
    try {
      // Ensure MCP manager is initialized
      await this.manager.initialize();

      // Check if Apple Health is connected
      if (!this.manager.isConnected('appleHealth')) {
        console.log('[HealthIntegration] Apple Health MCP not connected');
        return false;
      }

      // Get initial data
      await this.refresh();

      console.log('[HealthIntegration] Initialized successfully');
      return true;
    } catch (error) {
      console.error('[HealthIntegration] Failed to initialize:', error);
      return false;
    }
  }

  /**
   * Get context for Oracle conversations
   * This is the main method for injecting health awareness into MAIA
   */
  async getOracleContext(userId: string): Promise<OracleHealthContext> {
    // Check if connected
    if (!this.manager.isConnected('appleHealth')) {
      return { available: false };
    }

    // Refresh if stale (older than 5 minutes)
    if (!this.lastSummary || !this.lastUpdateTime ||
        Date.now() - this.lastUpdateTime.getTime() > 5 * 60 * 1000) {
      await this.refresh();
    }

    if (!this.lastSummary) {
      return { available: false };
    }

    const correlation = await this.adapter.getConsciousnessCorrelation();

    return {
      available: true,
      summary: this.generateContextSummary(this.lastSummary, correlation),
      readinessScore: this.lastSummary.readinessScore,
      suggestedApproach: this.getSuggestedApproach(correlation),
      detailedMetrics: this.lastSummary,
      correlation,
      lastUpdated: this.lastUpdateTime || undefined,
    };
  }

  /**
   * Generate a natural language summary for Oracle context
   */
  private generateContextSummary(
    summary: HealthMetricsSummary,
    correlation: ConsciousnessHealthCorrelation
  ): string {
    const parts: string[] = [];

    // Overall state
    if (summary.readinessScore >= 70) {
      parts.push('User shows high readiness and nervous system balance.');
    } else if (summary.readinessScore >= 50) {
      parts.push('User shows moderate readiness.');
    } else {
      parts.push('User may benefit from restorative practices today.');
    }

    // HRV insight
    if (summary.hrv.latest) {
      const hrv = summary.hrv.latest.rmssd;
      if (hrv > 50) {
        parts.push('HRV indicates good parasympathetic tone and stress resilience.');
      } else if (hrv > 30) {
        parts.push('HRV is moderate - balanced but not optimal.');
      } else {
        parts.push('HRV suggests elevated stress or recovery needs.');
      }

      if (summary.hrv.trend === 'improving') {
        parts.push('HRV trend is improving over the past week.');
      } else if (summary.hrv.trend === 'declining') {
        parts.push('HRV has been declining - consider recovery focus.');
      }
    }

    // Sleep insight
    if (summary.sleep.lastNight) {
      const hours = Math.round(summary.sleep.lastNight.duration / 60 * 10) / 10;
      if (hours >= 7) {
        parts.push(`Good sleep last night (${hours}h).`);
      } else if (hours >= 5) {
        parts.push(`Moderate sleep last night (${hours}h).`);
      } else {
        parts.push(`Limited sleep last night (${hours}h) - may affect processing.`);
      }
    }

    // Suggested mode
    parts.push(`Suggested session approach: ${correlation.suggestedMode}.`);

    return parts.join(' ');
  }

  /**
   * Get suggested approach for the session
   */
  private getSuggestedApproach(correlation: ConsciousnessHealthCorrelation): string {
    switch (correlation.suggestedMode) {
      case 'reflective':
        return 'Good conditions for deep reflection, shadow work, or complex processing. The nervous system is balanced and ready for depth.';
      case 'active':
        return 'Good conditions for engaged dialogue, planning, or creative work. Energy is available but may not sustain intense introspection.';
      case 'restorative':
        return 'Prioritize gentle, supportive dialogue. Consider grounding practices, simple check-ins, or rest. The system is signaling need for recovery.';
      default:
        return 'Proceed with awareness of current state.';
    }
  }

  /**
   * Refresh health data
   */
  async refresh(): Promise<void> {
    try {
      this.lastSummary = await this.adapter.getHealthSummary();
      this.lastUpdateTime = new Date();
      this.emit('refreshed', this.lastSummary);
    } catch (error) {
      console.error('[HealthIntegration] Failed to refresh:', error);
    }
  }

  /**
   * Start periodic polling for real-time awareness
   * Useful for long sessions where state may change
   */
  startPolling(intervalMs: number = 5 * 60 * 1000): void {
    if (this.isPolling) return;

    this.isPolling = true;
    this.adapter.startRealTimeUpdates(intervalMs);
  }

  /**
   * Stop periodic polling
   */
  stopPolling(): void {
    if (!this.isPolling) return;

    this.isPolling = false;
    this.adapter.stopRealTimeUpdates();
  }

  /**
   * Handle summary updates from adapter
   * Detects significant changes and emits consciousness events
   */
  private handleSummaryUpdate(summary: HealthMetricsSummary): void {
    const previousReadiness = this.lastSummary?.readinessScore ?? 0;
    const currentReadiness = summary.readinessScore;

    this.lastSummary = summary;
    this.lastUpdateTime = new Date();

    // Detect significant readiness change (>15 points)
    if (Math.abs(currentReadiness - previousReadiness) > 15) {
      const event: HealthConsciousnessEvent = {
        id: `health-${Date.now()}`,
        userId: 'system', // Would be replaced with actual userId in context
        type: 'readiness_change',
        data: {
          readinessScore: currentReadiness,
          coherenceIndicators: summary.coherenceIndicators,
          biometricContext: `Readiness changed from ${previousReadiness} to ${currentReadiness}`,
        },
        timestamp: new Date(),
      };

      this.emit('consciousnessEvent', event);
    }

    this.emit('update', summary);
  }

  /**
   * Get the current cached summary
   */
  getCachedSummary(): HealthMetricsSummary | null {
    return this.lastSummary;
  }

  /**
   * Check if health data is available
   */
  isAvailable(): boolean {
    return this.manager.isConnected('appleHealth') && this.lastSummary !== null;
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    this.stopPolling();
    this.removeAllListeners();
  }
}

// Singleton instance
let instance: AppleHealthConsciousnessIntegration | null = null;

export function getAppleHealthConsciousnessIntegration(): AppleHealthConsciousnessIntegration {
  if (!instance) {
    instance = new AppleHealthConsciousnessIntegration();
  }
  return instance;
}

export function resetAppleHealthConsciousnessIntegration(): void {
  if (instance) {
    instance.dispose();
    instance = null;
  }
}
