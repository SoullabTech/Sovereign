/**
 * Real-Time Biometric Service
 *
 * Provides live biometric data streaming to MAIA interface
 *
 * Features:
 * - Polls IndexedDB for new data (every 30 seconds)
 * - Broadcasts updates via EventEmitter pattern
 * - Calculates coherence trends in real-time
 * - Recommends presence mode adjustments
 */

import { biometricStorage } from './BiometricStorage';
import type { ParsedHealthData, HRVReading, HeartRateReading } from './HealthDataImporter';

export interface BiometricUpdate {
  timestamp: Date;
  hrv?: number;
  heartRate?: number;
  respiratoryRate?: number;
  coherenceLevel: number; // 0.0 - 1.0
  coherenceTrend: 'rising' | 'stable' | 'falling';
  recommendedMode: 'dialogue' | 'patient' | 'scribe';
  readinessScore: number; // 0-100
}

type BiometricListener = (update: BiometricUpdate) => void;

export class RealtimeBiometricService {
  private listeners: BiometricListener[] = [];
  private pollingInterval: NodeJS.Timeout | null = null;
  private lastUpdate: BiometricUpdate | null = null;
  private previousHRV: number[] = []; // Track last 5 HRV readings for trend
  private isPolling = false;

  /**
   * Start polling for biometric updates
   */
  start(intervalMs: number = 30000) {
    if (this.pollingInterval) {
      console.warn('⚠️ Biometric service already started');
      return;
    }

    console.log('💓 Starting real-time biometric service');

    // Initial check
    this.checkForUpdates();

    // Poll every intervalMs
    this.pollingInterval = setInterval(() => {
      this.checkForUpdates();
    }, intervalMs);
  }

  /**
   * Stop polling
   */
  stop() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
      console.log('💤 Stopped biometric service');
    }
  }

  /**
   * Subscribe to biometric updates
   */
  subscribe(listener: BiometricListener): () => void {
    this.listeners.push(listener);

    // Send current state immediately if available
    if (this.lastUpdate) {
      listener(this.lastUpdate);
    }

    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Get latest biometric update
   */
  getLatest(): BiometricUpdate | null {
    return this.lastUpdate;
  }

  /**
   * Check for new biometric data and broadcast updates
   */
  private async checkForUpdates() {
    if (this.isPolling) return; // Prevent concurrent polls

    this.isPolling = true;

    try {
      const hasData = await biometricStorage.hasHealthData();
      if (!hasData) {
        this.isPolling = false;
        return;
      }

      const healthData = await biometricStorage.getLatestHealthData();
      if (!healthData) {
        this.isPolling = false;
        return;
      }

      // Get most recent readings
      const latestHRV = healthData.hrv[0];
      const latestHR = healthData.heartRate.find(r => r.context === 'resting') || healthData.heartRate[0];
      const latestResp = healthData.respiratory[0];

      // Calculate coherence level from HRV
      const coherenceLevel = this.calculateCoherenceLevel(latestHRV?.value);

      // Track HRV trend
      if (latestHRV) {
        this.previousHRV.unshift(latestHRV.value);
        if (this.previousHRV.length > 5) this.previousHRV.pop();
      }

      const coherenceTrend = this.calculateTrend();
      const recommendedMode = this.getRecommendedMode(coherenceLevel, coherenceTrend);
      const readinessScore = this.calculateReadinessScore(healthData);

      const update: BiometricUpdate = {
        timestamp: new Date(),
        hrv: latestHRV?.value,
        heartRate: latestHR?.value,
        respiratoryRate: latestResp?.value,
        coherenceLevel,
        coherenceTrend,
        recommendedMode,
        readinessScore
      };

      // Only broadcast if data has changed
      const hasChanged = !this.lastUpdate ||
        this.lastUpdate.hrv !== update.hrv ||
        this.lastUpdate.heartRate !== update.heartRate ||
        this.lastUpdate.coherenceLevel !== update.coherenceLevel;

      if (hasChanged) {
        console.log('💓 New biometric update:', {
          hrv: update.hrv,
          heartRate: update.heartRate,
          coherence: coherenceLevel.toFixed(2),
          mode: recommendedMode
        });

        this.lastUpdate = update;
        this.broadcast(update);
      }

    } catch (error) {
      console.error('❌ Error checking biometric updates:', error);
    } finally {
      this.isPolling = false;
    }
  }

  /**
   * Calculate coherence level from HRV
   * Based on HeartMath research and HRV norms
   */
  private calculateCoherenceLevel(hrv?: number): number {
    if (!hrv) return 0.5; // Default balanced

    // HRV coherence mapping (age-adjusted for adults 25-60)
    // High HRV = high coherence (parasympathetic dominant)
    if (hrv > 80) return 0.95; // Exceptional
    if (hrv > 60) return 0.80; // High
    if (hrv > 40) return 0.60; // Good
    if (hrv > 25) return 0.40; // Fair
    if (hrv > 15) return 0.25; // Low
    return 0.15; // Very low (stressed/fatigued)
  }

  /**
   * Calculate HRV trend (rising, stable, falling)
   */
  private calculateTrend(): 'rising' | 'stable' | 'falling' {
    if (this.previousHRV.length < 3) return 'stable';

    const recent = this.previousHRV.slice(0, 2);
    const older = this.previousHRV.slice(2, 4);

    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;

    const change = ((recentAvg - olderAvg) / olderAvg) * 100;

    if (change > 10) return 'rising';
    if (change < -10) return 'falling';
    return 'stable';
  }

  /**
   * Get recommended presence mode based on coherence
   */
  private getRecommendedMode(
    coherenceLevel: number,
    trend: 'rising' | 'stable' | 'falling'
  ): 'dialogue' | 'patient' | 'scribe' {
    // Adjust recommendation based on trend
    let adjustedCoherence = coherenceLevel;
    if (trend === 'rising') adjustedCoherence += 0.1;
    if (trend === 'falling') adjustedCoherence -= 0.1;

    // Map to presence modes
    if (adjustedCoherence >= 0.7) {
      return 'scribe'; // High coherence → witnessing mode (12s breath)
    } else if (adjustedCoherence >= 0.4) {
      return 'patient'; // Medium → patient inquiry (8s breath)
    } else {
      return 'dialogue'; // Low → gentle support (4s breath)
    }
  }

  /**
   * Calculate readiness score (0-100)
   */
  private calculateReadinessScore(data: ParsedHealthData): number {
    let score = 50; // Baseline

    // HRV component (0-40 points)
    const recentHRV = data.hrv[0];
    if (recentHRV) {
      if (recentHRV.value > 60) score += 40;
      else if (recentHRV.value > 40) score += 30;
      else if (recentHRV.value > 25) score += 20;
      else score += 10;
    }

    // Sleep component (0-30 points)
    const lastSleep = data.sleep[0];
    if (lastSleep) {
      if (lastSleep.durationHours > 7) score += 20;
      else if (lastSleep.durationHours > 6) score += 15;
      else score += 5;

      // Bonus for deep sleep
      if (lastSleep.stages?.deep && lastSleep.stages.deep > 1.5) {
        score += 10;
      }
    }

    // Resting heart rate component (0-20 points)
    const restingHR = data.heartRate.find(r => r.context === 'resting');
    if (restingHR) {
      if (restingHR.value < 55) score += 20;
      else if (restingHR.value < 65) score += 15;
      else if (restingHR.value < 75) score += 10;
      else score += 5;
    }

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Broadcast update to all listeners
   */
  private broadcast(update: BiometricUpdate) {
    this.listeners.forEach(listener => {
      try {
        listener(update);
      } catch (error) {
        console.error('Error in biometric listener:', error);
      }
    });
  }

  /**
   * Manually inject biometric data (for webhook/shortcuts)
   */
  async injectUpdate(data: {
    hrv?: number;
    heartRate?: number;
    respiratoryRate?: number;
  }) {
    console.log('💉 Injecting biometric data:', data);

    const coherenceLevel = this.calculateCoherenceLevel(data.hrv);

    if (data.hrv) {
      this.previousHRV.unshift(data.hrv);
      if (this.previousHRV.length > 5) this.previousHRV.pop();
    }

    const coherenceTrend = this.calculateTrend();
    const recommendedMode = this.getRecommendedMode(coherenceLevel, coherenceTrend);

    const update: BiometricUpdate = {
      timestamp: new Date(),
      hrv: data.hrv,
      heartRate: data.heartRate,
      respiratoryRate: data.respiratoryRate,
      coherenceLevel,
      coherenceTrend,
      recommendedMode,
      readinessScore: 75 // Simplified for injected data
    };

    this.lastUpdate = update;
    this.broadcast(update);
  }
}

// Singleton instance
export const realtimeBiometricService = new RealtimeBiometricService();
