/**
 * Coherence Detector
 *
 * Analyzes HRV and other biometric data to determine coherence state
 * Maps to TransformationalPresence states (dialogue/patient/scribe)
 */

import type { ParsedHealthData, HRVReading } from './HealthDataImporter';
import type { PresenceState } from '@/components/nlp/TransformationalPresence';

export interface CoherenceState {
  level: 'low' | 'medium' | 'high' | 'peak';
  score: number; // 0-100
  trend: 'rising' | 'stable' | 'falling';
  suggestedPresenceState: PresenceState;
  confidence: number; // 0-1 (how confident we are in this assessment)
}

export class CoherenceDetector {
  private hrvHistory: HRVReading[] = [];
  private readonly maxHistoryMinutes = 60; // Keep 1 hour of data

  /**
   * Add HRV reading to history
   */
  addReading(hrv: HRVReading): void {
    this.hrvHistory.push(hrv);

    // Keep only recent readings
    const cutoff = Date.now() - this.maxHistoryMinutes * 60 * 1000;
    this.hrvHistory = this.hrvHistory.filter(
      r => r.startDate.getTime() > cutoff
    );

    // Sort by time (newest last)
    this.hrvHistory.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  }

  /**
   * Load history from ParsedHealthData
   */
  loadHistory(data: ParsedHealthData, windowMinutes: number = 60): void {
    const cutoff = Date.now() - windowMinutes * 60 * 1000;
    this.hrvHistory = data.hrv
      .filter(r => r.startDate.getTime() > cutoff)
      .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  }

  /**
   * Analyze current coherence state
   *
   * Based on:
   * - Latest HRV value (higher = better coherence)
   * - HRV trend (rising, stable, falling)
   * - HRV variability (stable HRV = sustained coherence)
   */
  analyzeCoherence(): CoherenceState {
    if (this.hrvHistory.length === 0) {
      // No data - return neutral state
      return {
        level: 'medium',
        score: 50,
        trend: 'stable',
        suggestedPresenceState: 'dialogue',
        confidence: 0
      };
    }

    const latest = this.hrvHistory[this.hrvHistory.length - 1].value;
    const values = this.hrvHistory.map(r => r.value);

    // Calculate statistics
    const average = values.reduce((sum, v) => sum + v, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - average, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    // Trend detection
    let trend: 'rising' | 'stable' | 'falling' = 'stable';
    let confidence = Math.min(1, this.hrvHistory.length / 10); // More data = more confidence

    if (this.hrvHistory.length >= 5) {
      const recentCount = Math.min(10, Math.floor(this.hrvHistory.length / 2));
      const recentValues = values.slice(-recentCount);
      const olderValues = values.slice(0, -recentCount);

      if (olderValues.length > 0) {
        const recentAvg = recentValues.reduce((s, v) => s + v, 0) / recentValues.length;
        const olderAvg = olderValues.reduce((s, v) => s + v, 0) / olderValues.length;

        if (recentAvg > olderAvg * 1.15) {
          trend = 'rising';
          confidence = Math.min(1, confidence * 1.2); // Higher confidence in rising trend
        } else if (recentAvg < olderAvg * 0.85) {
          trend = 'falling';
          confidence = Math.min(1, confidence * 1.2);
        }
      }
    }

    // Coherence level classification
    // Based on typical HRV ranges (ms):
    // < 20ms: Very low (stressed, fatigued, sick)
    // 20-40ms: Low to medium (normal daily life)
    // 40-60ms: Good (relaxed, recovered)
    // 60-80ms: High (very relaxed, meditative)
    // > 80ms: Peak (deep meditation, athletes)

    let level: 'low' | 'medium' | 'high' | 'peak';
    let score: number;

    if (latest < 25) {
      level = 'low';
      score = Math.max(0, latest * 2); // 0-50
    } else if (latest < 45) {
      level = 'medium';
      score = 50 + (latest - 25) * 1.5; // 50-80
    } else if (latest < 65) {
      level = 'high';
      score = 80 + (latest - 45) * 0.75; // 80-95
    } else {
      level = 'peak';
      score = Math.min(100, 95 + (latest - 65) * 0.15); // 95-100
    }

    // Adjust score based on stability (low variance = better)
    const stabilityBonus = Math.max(0, 5 - (stdDev / average) * 10);
    score = Math.min(100, score + stabilityBonus);

    // Suggest presence state based on coherence
    const suggestedPresenceState = this.mapCoherenceToPresenceState(level, trend, latest);

    return {
      level,
      score: Math.round(score),
      trend,
      suggestedPresenceState,
      confidence
    };
  }

  /**
   * Map coherence state to TransformationalPresence state
   *
   * Logic:
   * - Low coherence or falling → Dialogue (gentle, grounding)
   * - Medium/rising coherence → Patient (depth work)
   * - High/peak coherence → Scribe (witnessing)
   */
  private mapCoherenceToPresenceState(
    level: 'low' | 'medium' | 'high' | 'peak',
    trend: 'rising' | 'stable' | 'falling',
    latestHRV: number
  ): PresenceState {
    // Falling coherence → Always suggest Dialogue (gentle support)
    if (trend === 'falling') {
      return 'dialogue';
    }

    // Low coherence → Dialogue (build foundation)
    if (level === 'low') {
      return 'dialogue';
    }

    // Peak coherence → Scribe (witnessing available)
    if (level === 'peak') {
      return 'scribe';
    }

    // High coherence + stable/rising → Scribe
    if (level === 'high' && trend !== 'falling') {
      return 'scribe';
    }

    // Medium coherence + rising strongly → Patient
    if (level === 'medium' && trend === 'rising' && latestHRV > 35) {
      return 'patient';
    }

    // Default: Patient (middle path, good for most work)
    return 'patient';
  }

  /**
   * Get session improvement
   * Compare beginning vs. end of session HRV
   */
  getSessionImprovement(sessionStartTime: Date): {
    improvement: number; // Percentage change
    startHRV: number | null;
    endHRV: number | null;
  } {
    const sessionReadings = this.hrvHistory.filter(
      r => r.startDate >= sessionStartTime
    );

    if (sessionReadings.length < 2) {
      return {
        improvement: 0,
        startHRV: null,
        endHRV: null
      };
    }

    // Compare first half vs. second half
    const midpoint = Math.floor(sessionReadings.length / 2);
    const firstHalf = sessionReadings.slice(0, midpoint);
    const secondHalf = sessionReadings.slice(midpoint);

    const startHRV = firstHalf.reduce((sum, r) => sum + r.value, 0) / firstHalf.length;
    const endHRV = secondHalf.reduce((sum, r) => sum + r.value, 0) / secondHalf.length;

    const improvement = ((endHRV - startHRV) / startHRV) * 100;

    return {
      improvement: Math.round(improvement),
      startHRV: Math.round(startHRV * 10) / 10,
      endHRV: Math.round(endHRV * 10) / 10
    };
  }

  /**
   * Should we suggest state transition?
   * Only suggest if confidence is high and change is significant
   */
  shouldSuggestTransition(
    currentState: PresenceState,
    coherence: CoherenceState
  ): boolean {
    // Don't suggest if we don't have enough data
    if (coherence.confidence < 0.5) {
      return false;
    }

    // Don't suggest if already in suggested state
    if (currentState === coherence.suggestedPresenceState) {
      return false;
    }

    // Strong suggestions (high confidence)
    if (coherence.confidence > 0.8) {
      return true;
    }

    // Medium confidence: only suggest for strong signals
    if (coherence.level === 'low' && coherence.trend === 'falling') {
      // Definitely suggest Dialogue if crashing
      return true;
    }

    if (coherence.level === 'peak' && currentState !== 'scribe') {
      // Definitely suggest Scribe if in peak state
      return true;
    }

    // Otherwise, don't interrupt
    return false;
  }

  /**
   * Get human-readable coherence description
   */
  getCoherenceDescription(coherence: CoherenceState): string {
    const { level, trend } = coherence;

    const levelDescriptions = {
      low: 'activated',
      medium: 'balanced',
      high: 'coherent',
      peak: 'deeply coherent'
    };

    const trendDescriptions = {
      rising: 'building',
      stable: 'stable',
      falling: 'releasing'
    };

    return `${levelDescriptions[level]} and ${trendDescriptions[trend]}`;
  }
}

// Export singleton
export const coherenceDetector = new CoherenceDetector();
