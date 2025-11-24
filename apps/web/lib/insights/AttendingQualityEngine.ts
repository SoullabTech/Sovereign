/**
 * Attending Quality Engine
 * Calculates metrics for presence, coherence, and conscious awareness quality
 * Based on biometric coherence, conversation depth, and behavioral patterns
 */

import { biometricStorage, type ParsedHealthData } from '../biometrics/BiometricStorage';
import { fascialHealthStorage } from '../biometrics/FascialHealthTracker';
import { calculateElementalCoherence } from '../biometrics/ElementalCoherenceCalculator';

export interface AttendingQualitySnapshot {
  id?: number;
  timestamp: Date;
  userId: string;

  // Core metrics (0-100 scale for display)
  coherence: number;      // How integrated/unified awareness is
  presence: number;       // How embodied/grounded consciousness is
  overallAttending: number; // Combined quality score

  // Supporting data
  trajectory: 'improving' | 'declining' | 'stable';
  hrvCoherence?: number;
  fasciaScore?: number;
  conversationDepth?: number;
}

export interface AttendingQualityMetrics {
  currentCoherence: number;
  currentPresence: number;
  currentOverall: number;
  trajectory: 'improving' | 'declining' | 'stable';
  history: AttendingQualitySnapshot[];
  weeklyAverage: {
    coherence: number;
    presence: number;
    overall: number;
  };
}

class AttendingQualityStorage {
  private dbName = 'maia_attending_quality';
  private storeName = 'snapshots';
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, {
            keyPath: 'id',
            autoIncrement: true
          });
          store.createIndex('userId', 'userId', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  async recordSnapshot(snapshot: AttendingQualitySnapshot): Promise<number> {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.add(snapshot);

      request.onsuccess = () => resolve(request.result as number);
      request.onerror = () => reject(request.error);
    });
  }

  async getSnapshots(userId: string, daysBack: number = 30): Promise<AttendingQualitySnapshot[]> {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('userId');
      const request = index.getAll(userId);

      request.onsuccess = () => {
        const allSnapshots = request.result as AttendingQualitySnapshot[];
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysBack);

        const recentSnapshots = allSnapshots
          .filter(s => new Date(s.timestamp) >= cutoffDate)
          .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

        resolve(recentSnapshots);
      };
      request.onerror = () => reject(request.error);
    });
  }
}

export const attendingQualityStorage = new AttendingQualityStorage();

/**
 * Attending Quality Calculator
 * Synthesizes multiple data sources to compute attending quality metrics
 */
export class AttendingQualityCalculator {

  /**
   * Calculate current attending quality from available data sources
   */
  async calculateCurrent(userId: string): Promise<AttendingQualitySnapshot> {
    const timestamp = new Date();

    // Get biometric data
    const healthData = await biometricStorage.getLatestHealthData();
    const fasciaAssessments = await fascialHealthStorage.getAssessments(userId, 7).catch(() => []);
    const latestFascia = fasciaAssessments[fasciaAssessments.length - 1];

    // Calculate elemental coherence (gives us integrated metrics)
    const elementalCoherence = calculateElementalCoherence(healthData, latestFascia);

    // Calculate coherence (how unified awareness is)
    const coherence = this.calculateCoherence(healthData, latestFascia, elementalCoherence);

    // Calculate presence (how grounded/embodied)
    const presence = this.calculatePresence(healthData, latestFascia, elementalCoherence);

    // Overall attending is weighted combination
    const overallAttending = Math.round((coherence * 0.5 + presence * 0.5));

    // Calculate trajectory by comparing to recent history
    const history = await attendingQualityStorage.getSnapshots(userId, 7);
    const trajectory = this.calculateTrajectory(overallAttending, history);

    const snapshot: AttendingQualitySnapshot = {
      timestamp,
      userId,
      coherence,
      presence,
      overallAttending,
      trajectory,
      hrvCoherence: healthData?.hrv?.rmssd || undefined,
      fasciaScore: latestFascia?.mobility || undefined
    };

    // Store this snapshot
    await attendingQualityStorage.recordSnapshot(snapshot);

    return snapshot;
  }

  /**
   * Get full metrics including history
   */
  async getMetrics(userId: string, daysBack: number = 30): Promise<AttendingQualityMetrics> {
    const current = await this.calculateCurrent(userId);
    const history = await attendingQualityStorage.getSnapshots(userId, daysBack);

    // Calculate weekly averages
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weeklySnapshots = history.filter(s => new Date(s.timestamp) >= weekAgo);

    const weeklyAverage = weeklySnapshots.length > 0 ? {
      coherence: Math.round(weeklySnapshots.reduce((sum, s) => sum + s.coherence, 0) / weeklySnapshots.length),
      presence: Math.round(weeklySnapshots.reduce((sum, s) => sum + s.presence, 0) / weeklySnapshots.length),
      overall: Math.round(weeklySnapshots.reduce((sum, s) => sum + s.overallAttending, 0) / weeklySnapshots.length)
    } : {
      coherence: current.coherence,
      presence: current.presence,
      overall: current.overallAttending
    };

    return {
      currentCoherence: current.coherence,
      currentPresence: current.presence,
      currentOverall: current.overallAttending,
      trajectory: current.trajectory,
      history,
      weeklyAverage
    };
  }

  /**
   * Calculate coherence score (0-100)
   * Coherence = how well-integrated and unified consciousness is
   */
  private calculateCoherence(
    healthData: ParsedHealthData | null,
    fasciaData: any,
    elementalCoherence: any
  ): number {
    let score = 50; // Baseline

    // HRV coherence (cardiac coherence = emotional regulation)
    if (healthData?.hrv?.rmssd) {
      const hrvScore = Math.min(100, (healthData.hrv.rmssd / 50) * 100);
      score += (hrvScore - 50) * 0.3;
    }

    // Elemental balance (how balanced the elements are)
    score += (elementalCoherence.balance - 50) * 0.4;

    // Fascia intuition clarity (consciousness antenna function)
    if (fasciaData?.intuitionClarity) {
      score += (fasciaData.intuitionClarity * 10 - 50) * 0.3;
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Calculate presence score (0-100)
   * Presence = how embodied and grounded consciousness is
   */
  private calculatePresence(
    healthData: ParsedHealthData | null,
    fasciaData: any,
    elementalCoherence: any
  ): number {
    let score = 50; // Baseline

    // Respiratory rate (grounding indicator - slower = more present)
    if (healthData?.respiratory?.rate) {
      const optimalRate = 12; // Breaths per minute
      const rateScore = Math.max(0, 100 - Math.abs(healthData.respiratory.rate - optimalRate) * 5);
      score += (rateScore - 50) * 0.3;
    }

    // Fascial mobility (physical embodiment)
    if (fasciaData?.mobility) {
      score += (fasciaData.mobility * 10 - 50) * 0.4;
    }

    // Earth element strength (grounding energy)
    score += (elementalCoherence.earth - 50) * 0.3;

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Calculate trajectory by comparing current to recent history
   */
  private calculateTrajectory(
    currentScore: number,
    history: AttendingQualitySnapshot[]
  ): 'improving' | 'declining' | 'stable' {
    if (history.length < 3) return 'stable';

    // Compare to average of last 7 days
    const recentAvg = history
      .slice(-7)
      .reduce((sum, s) => sum + s.overallAttending, 0) / Math.min(7, history.length);

    const diff = currentScore - recentAvg;

    if (diff > 5) return 'improving';
    if (diff < -5) return 'declining';
    return 'stable';
  }

  /**
   * Generate mock data for development/testing
   */
  async generateMockData(userId: string, days: number = 30): Promise<void> {
    const now = new Date();

    for (let i = 0; i < days; i++) {
      const timestamp = new Date(now);
      timestamp.setDate(timestamp.getDate() - (days - i));

      // Create somewhat realistic oscillating patterns
      const dayOfWeek = timestamp.getDay();
      const baseCoherence = 70 + Math.sin(i / 7) * 10 + (Math.random() - 0.5) * 5;
      const basePresence = 75 + Math.cos(i / 5) * 12 + (Math.random() - 0.5) * 5;

      // Weekends tend to be higher
      const weekendBoost = (dayOfWeek === 0 || dayOfWeek === 6) ? 5 : 0;

      const coherence = Math.max(0, Math.min(100, Math.round(baseCoherence + weekendBoost)));
      const presence = Math.max(0, Math.min(100, Math.round(basePresence + weekendBoost)));
      const overallAttending = Math.round((coherence + presence) / 2);

      const snapshot: AttendingQualitySnapshot = {
        timestamp,
        userId,
        coherence,
        presence,
        overallAttending,
        trajectory: 'stable'
      };

      await attendingQualityStorage.recordSnapshot(snapshot);
    }
  }
}

export const attendingQualityCalculator = new AttendingQualityCalculator();
