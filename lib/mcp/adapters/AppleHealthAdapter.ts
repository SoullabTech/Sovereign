/**
 * Apple Health MCP Adapter for MAIA-SOVEREIGN
 *
 * Provides live access to Apple Health data via MCP protocol.
 * Integrates with consciousness systems for biometric correlation.
 *
 * Benefits over XML export:
 * - Real-time data access (no manual export needed)
 * - Automatic sync during sessions
 * - Consciousness event generation for memory lattice
 *
 * Uses: Momentum Apple Health MCP Server
 * https://github.com/themomentum/apple-health-mcp
 */

import { EventEmitter } from 'events';
import type {
  MCPToolResult,
  HRVReading,
  SleepSession,
  AppleHealthData,
} from '../types';
import { getMCPClientManager } from '../MCPClientManager';

// Types matching existing HealthDataImporter for compatibility
export interface HeartRateReading {
  value: number;
  startDate: Date;
  endDate: Date;
  context?: 'resting' | 'active' | 'workout' | 'recovery';
}

export interface RespiratoryReading {
  value: number;
  startDate: Date;
  endDate: Date;
}

export interface HealthMetricsSummary {
  hrv: {
    latest: HRVReading | null;
    average7Days: number | null;
    trend: 'improving' | 'stable' | 'declining' | 'unknown';
  };
  heartRate: {
    restingAverage: number | null;
    current: number | null;
  };
  sleep: {
    lastNight: SleepSession | null;
    average7Days: number | null;
    qualityScore: number | null;
  };
  respiratory: {
    average: number | null;
  };
  readinessScore: number;
  coherenceIndicators: {
    nervous_system_balance: number;
    recovery_state: number;
    stress_resilience: number;
  };
}

export interface ConsciousnessHealthCorrelation {
  readinessScore: number;
  optimalForDeepWork: boolean;
  suggestedMode: 'reflective' | 'active' | 'restorative';
  biometricContext: string;
}

/**
 * Apple Health MCP Adapter
 * Provides consciousness-aware health data access
 */
export class AppleHealthAdapter extends EventEmitter {
  private manager = getMCPClientManager();
  private cache = new Map<string, { data: unknown; timestamp: number }>();
  private cacheTimeout = 30000; // 30 seconds

  constructor() {
    super();
  }

  /**
   * Check if Apple Health MCP is connected
   */
  isConnected(): boolean {
    return this.manager.isConnected('appleHealth');
  }

  /**
   * Get available tools from the Apple Health MCP server
   */
  async getAvailableTools(): Promise<string[]> {
    const allTools = this.manager.getAllTools();
    const healthTools = allTools.get('appleHealth');
    return healthTools?.map(t => t.name) || [];
  }

  /**
   * Get HRV data for the past N days
   */
  async getHRVData(days: number = 7): Promise<HRVReading[]> {
    const cacheKey = `hrv_${days}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached as HRVReading[];

    try {
      const result = await this.manager.callTool('appleHealth', {
        name: 'get_hrv_data',
        arguments: { days },
      });

      const readings = this.parseHRVResult(result);
      this.setCache(cacheKey, readings);
      this.emit('data', { type: 'hrv', data: readings });
      return readings;
    } catch (error) {
      console.error('[AppleHealthAdapter] Failed to get HRV data:', error);
      return [];
    }
  }

  /**
   * Get heart rate data for the past N days
   */
  async getHeartRateData(days: number = 7): Promise<HeartRateReading[]> {
    const cacheKey = `heartRate_${days}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached as HeartRateReading[];

    try {
      const result = await this.manager.callTool('appleHealth', {
        name: 'get_heart_rate_data',
        arguments: { days },
      });

      const readings = this.parseHeartRateResult(result);
      this.setCache(cacheKey, readings);
      this.emit('data', { type: 'heartRate', data: readings });
      return readings;
    } catch (error) {
      console.error('[AppleHealthAdapter] Failed to get heart rate data:', error);
      return [];
    }
  }

  /**
   * Get sleep data for the past N days
   */
  async getSleepData(days: number = 7): Promise<SleepSession[]> {
    const cacheKey = `sleep_${days}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached as SleepSession[];

    try {
      const result = await this.manager.callTool('appleHealth', {
        name: 'get_sleep_data',
        arguments: { days },
      });

      const sessions = this.parseSleepResult(result);
      this.setCache(cacheKey, sessions);
      this.emit('data', { type: 'sleep', data: sessions });
      return sessions;
    } catch (error) {
      console.error('[AppleHealthAdapter] Failed to get sleep data:', error);
      return [];
    }
  }

  /**
   * Get respiratory rate data
   */
  async getRespiratoryData(days: number = 7): Promise<RespiratoryReading[]> {
    const cacheKey = `respiratory_${days}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached as RespiratoryReading[];

    try {
      const result = await this.manager.callTool('appleHealth', {
        name: 'get_respiratory_rate',
        arguments: { days },
      });

      const readings = this.parseRespiratoryResult(result);
      this.setCache(cacheKey, readings);
      this.emit('data', { type: 'respiratory', data: readings });
      return readings;
    } catch (error) {
      console.error('[AppleHealthAdapter] Failed to get respiratory data:', error);
      return [];
    }
  }

  /**
   * Get comprehensive health metrics summary
   * This is the main method for consciousness integration
   */
  async getHealthSummary(): Promise<HealthMetricsSummary> {
    const cacheKey = 'summary';
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached as HealthMetricsSummary;

    // Fetch all data in parallel
    const [hrvData, heartRateData, sleepData, respiratoryData] = await Promise.all([
      this.getHRVData(7),
      this.getHeartRateData(7),
      this.getSleepData(7),
      this.getRespiratoryData(7),
    ]);

    const summary = this.calculateSummary(hrvData, heartRateData, sleepData, respiratoryData);
    this.setCache(cacheKey, summary);
    this.emit('summary', summary);
    return summary;
  }

  /**
   * Get consciousness-health correlation for Oracle context
   * This provides actionable insights for MAIA to use during sessions
   */
  async getConsciousnessCorrelation(): Promise<ConsciousnessHealthCorrelation> {
    const summary = await this.getHealthSummary();

    const readinessScore = summary.readinessScore;
    const optimalForDeepWork = readinessScore >= 70 &&
      summary.coherenceIndicators.nervous_system_balance >= 0.6;

    let suggestedMode: 'reflective' | 'active' | 'restorative';
    if (readinessScore >= 70) {
      suggestedMode = 'reflective'; // High coherence - good for deep work
    } else if (readinessScore >= 50) {
      suggestedMode = 'active'; // Moderate - good for engaged work
    } else {
      suggestedMode = 'restorative'; // Low - prioritize recovery
    }

    const biometricContext = this.generateBiometricContext(summary);

    return {
      readinessScore,
      optimalForDeepWork,
      suggestedMode,
      biometricContext,
    };
  }

  /**
   * Subscribe to real-time health updates
   * Polls at specified interval and emits events
   */
  startRealTimeUpdates(intervalMs: number = 60000): void {
    const poll = async () => {
      try {
        // Clear cache to get fresh data
        this.cache.clear();
        const summary = await this.getHealthSummary();
        this.emit('update', summary);
      } catch (error) {
        this.emit('error', error);
      }
    };

    // Initial poll
    poll();

    // Set up interval
    const interval = setInterval(poll, intervalMs);

    // Store for cleanup
    (this as unknown as { _updateInterval: ReturnType<typeof setInterval> })._updateInterval = interval;
  }

  /**
   * Stop real-time updates
   */
  stopRealTimeUpdates(): void {
    const self = this as unknown as { _updateInterval?: ReturnType<typeof setInterval> };
    if (self._updateInterval) {
      clearInterval(self._updateInterval);
      delete self._updateInterval;
    }
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  private getFromCache(key: string): unknown | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  private setCache(key: string, data: unknown): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  private parseHRVResult(result: MCPToolResult): HRVReading[] {
    if (result.isError || !result.content) return [];

    try {
      const textContent = result.content.find(c => c.type === 'text');
      if (!textContent?.text) return [];

      const data = JSON.parse(textContent.text);
      if (!Array.isArray(data)) return [];

      return data.map((item: Record<string, unknown>) => ({
        rmssd: Number(item.value || item.rmssd || 0),
        timestamp: new Date(item.timestamp as string || item.startDate as string || Date.now()),
        context: item.context as 'resting' | 'active' | 'sleep' | undefined,
      }));
    } catch {
      return [];
    }
  }

  private parseHeartRateResult(result: MCPToolResult): HeartRateReading[] {
    if (result.isError || !result.content) return [];

    try {
      const textContent = result.content.find(c => c.type === 'text');
      if (!textContent?.text) return [];

      const data = JSON.parse(textContent.text);
      if (!Array.isArray(data)) return [];

      return data.map((item: Record<string, unknown>) => ({
        value: Number(item.value || item.bpm || 0),
        startDate: new Date(item.startDate as string || item.timestamp as string || Date.now()),
        endDate: new Date(item.endDate as string || item.timestamp as string || Date.now()),
        context: item.context as HeartRateReading['context'],
      }));
    } catch {
      return [];
    }
  }

  private parseSleepResult(result: MCPToolResult): SleepSession[] {
    if (result.isError || !result.content) return [];

    try {
      const textContent = result.content.find(c => c.type === 'text');
      if (!textContent?.text) return [];

      const data = JSON.parse(textContent.text);
      if (!Array.isArray(data)) return [];

      return data.map((item: Record<string, unknown>) => ({
        startTime: new Date(item.startTime as string || item.startDate as string || Date.now()),
        endTime: new Date(item.endTime as string || item.endDate as string || Date.now()),
        duration: Number(item.duration || item.durationMinutes || 0),
        stages: {
          rem: Number((item.stages as Record<string, unknown>)?.rem || 0),
          core: Number((item.stages as Record<string, unknown>)?.core || 0),
          deep: Number((item.stages as Record<string, unknown>)?.deep || 0),
          awake: Number((item.stages as Record<string, unknown>)?.awake || 0),
        },
        quality: Number(item.quality || item.qualityScore || 0),
      }));
    } catch {
      return [];
    }
  }

  private parseRespiratoryResult(result: MCPToolResult): RespiratoryReading[] {
    if (result.isError || !result.content) return [];

    try {
      const textContent = result.content.find(c => c.type === 'text');
      if (!textContent?.text) return [];

      const data = JSON.parse(textContent.text);
      if (!Array.isArray(data)) return [];

      return data.map((item: Record<string, unknown>) => ({
        value: Number(item.value || item.breathsPerMinute || 0),
        startDate: new Date(item.startDate as string || item.timestamp as string || Date.now()),
        endDate: new Date(item.endDate as string || item.timestamp as string || Date.now()),
      }));
    } catch {
      return [];
    }
  }

  private calculateSummary(
    hrvData: HRVReading[],
    heartRateData: HeartRateReading[],
    sleepData: SleepSession[],
    respiratoryData: RespiratoryReading[]
  ): HealthMetricsSummary {
    // HRV analysis
    const latestHRV = hrvData[0] || null;
    const hrvValues = hrvData.map(r => r.rmssd).filter(v => v > 0);
    const hrvAverage = hrvValues.length > 0
      ? hrvValues.reduce((a, b) => a + b, 0) / hrvValues.length
      : null;
    const hrvTrend = this.calculateTrend(hrvValues);

    // Heart rate analysis
    const restingReadings = heartRateData.filter(r => r.context === 'resting');
    const restingAverage = restingReadings.length > 0
      ? restingReadings.reduce((a, b) => a + b.value, 0) / restingReadings.length
      : null;
    const currentHR = heartRateData[0]?.value || null;

    // Sleep analysis
    const lastNight = sleepData[0] || null;
    const sleepDurations = sleepData.map(s => s.duration).filter(d => d > 0);
    const sleepAverage = sleepDurations.length > 0
      ? sleepDurations.reduce((a, b) => a + b, 0) / sleepDurations.length
      : null;
    const sleepQuality = lastNight ? this.calculateSleepQuality(lastNight) : null;

    // Respiratory analysis
    const respValues = respiratoryData.map(r => r.value).filter(v => v > 0);
    const respAverage = respValues.length > 0
      ? respValues.reduce((a, b) => a + b, 0) / respValues.length
      : null;

    // Calculate readiness score
    const readinessScore = this.calculateReadinessScore(
      latestHRV?.rmssd || null,
      restingAverage,
      sleepQuality,
      lastNight?.duration || null
    );

    // Calculate coherence indicators
    const coherenceIndicators = this.calculateCoherenceIndicators(
      latestHRV?.rmssd || null,
      restingAverage,
      sleepQuality
    );

    return {
      hrv: {
        latest: latestHRV,
        average7Days: hrvAverage,
        trend: hrvTrend,
      },
      heartRate: {
        restingAverage,
        current: currentHR,
      },
      sleep: {
        lastNight,
        average7Days: sleepAverage,
        qualityScore: sleepQuality,
      },
      respiratory: {
        average: respAverage,
      },
      readinessScore,
      coherenceIndicators,
    };
  }

  private calculateTrend(values: number[]): 'improving' | 'stable' | 'declining' | 'unknown' {
    if (values.length < 3) return 'unknown';

    const recentAvg = values.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
    const olderAvg = values.slice(-3).reduce((a, b) => a + b, 0) / 3;

    const change = (recentAvg - olderAvg) / olderAvg;

    if (change > 0.1) return 'improving';
    if (change < -0.1) return 'declining';
    return 'stable';
  }

  private calculateSleepQuality(sleep: SleepSession): number {
    let quality = 50; // Baseline

    // Duration component (0-30 points)
    if (sleep.duration >= 420) quality += 30; // 7+ hours
    else if (sleep.duration >= 360) quality += 20; // 6+ hours
    else if (sleep.duration >= 300) quality += 10; // 5+ hours

    // Deep sleep component (0-20 points)
    const deepRatio = sleep.stages.deep / sleep.duration;
    if (deepRatio >= 0.2) quality += 20;
    else if (deepRatio >= 0.15) quality += 15;
    else if (deepRatio >= 0.1) quality += 10;

    return Math.min(100, quality);
  }

  private calculateReadinessScore(
    hrv: number | null,
    restingHR: number | null,
    sleepQuality: number | null,
    sleepDuration: number | null
  ): number {
    let score = 50; // Baseline

    // HRV component (0-30 points)
    if (hrv !== null) {
      if (hrv > 60) score += 30;
      else if (hrv > 45) score += 25;
      else if (hrv > 30) score += 15;
      else score += 5;
    }

    // Resting HR component (0-20 points)
    if (restingHR !== null) {
      if (restingHR < 55) score += 20;
      else if (restingHR < 65) score += 15;
      else if (restingHR < 75) score += 10;
      else score += 5;
    }

    // Sleep quality component (0-25 points)
    if (sleepQuality !== null) {
      score += (sleepQuality / 100) * 25;
    }

    // Sleep duration bonus (0-10 points)
    if (sleepDuration !== null && sleepDuration >= 420) {
      score += 10;
    }

    return Math.min(100, Math.max(0, Math.round(score)));
  }

  private calculateCoherenceIndicators(
    hrv: number | null,
    restingHR: number | null,
    sleepQuality: number | null
  ): HealthMetricsSummary['coherenceIndicators'] {
    // Nervous system balance (HRV-based)
    let nervousSystemBalance = 0.5;
    if (hrv !== null) {
      nervousSystemBalance = Math.min(1, hrv / 80);
    }

    // Recovery state (sleep + resting HR)
    let recoveryState = 0.5;
    if (sleepQuality !== null) {
      recoveryState = sleepQuality / 100;
    }
    if (restingHR !== null && restingHR < 65) {
      recoveryState = Math.min(1, recoveryState + 0.2);
    }

    // Stress resilience (combination)
    const stressResilience = (nervousSystemBalance + recoveryState) / 2;

    return {
      nervous_system_balance: Number(nervousSystemBalance.toFixed(2)),
      recovery_state: Number(recoveryState.toFixed(2)),
      stress_resilience: Number(stressResilience.toFixed(2)),
    };
  }

  private generateBiometricContext(summary: HealthMetricsSummary): string {
    const parts: string[] = [];

    if (summary.hrv.latest) {
      const hrvLabel = summary.hrv.latest.rmssd > 50 ? 'balanced' :
        summary.hrv.latest.rmssd > 30 ? 'moderate' : 'low';
      parts.push(`HRV ${hrvLabel} (${Math.round(summary.hrv.latest.rmssd)}ms)`);
    }

    if (summary.sleep.lastNight) {
      const hours = Math.round(summary.sleep.lastNight.duration / 60 * 10) / 10;
      parts.push(`${hours}h sleep last night`);
    }

    if (summary.heartRate.restingAverage) {
      parts.push(`resting HR ${Math.round(summary.heartRate.restingAverage)}bpm`);
    }

    parts.push(`readiness ${summary.readinessScore}%`);

    return parts.join(', ');
  }
}

// Singleton instance
let instance: AppleHealthAdapter | null = null;

export function getAppleHealthAdapter(): AppleHealthAdapter {
  if (!instance) {
    instance = new AppleHealthAdapter();
  }
  return instance;
}

export function resetAppleHealthAdapter(): void {
  if (instance) {
    instance.stopRealTimeUpdates();
    instance = null;
  }
}
