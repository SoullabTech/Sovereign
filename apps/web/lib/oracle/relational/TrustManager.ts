/**
 * Trust Manager
 * Builds and tracks trust scores for each user relationship
 * Trust modulates presence (always positive, never punitive)
 */

import { FieldState } from '../field/FieldAwareness';
import { PRESENCE_CONFIG } from '../config/presence.config';

export interface TrustSignals {
  sharedVulnerability: boolean;
  returnedAfterAbsence: boolean;
  conversationDepth: number; // 0-1
  emotionalResonance: number; // 0-1
  questionQuality: number; // 0-1 (depth of questions)
  silenceComfort: number; // 0-1 (comfort with pauses)
  consistentEngagement: boolean;
}

export interface UserTrustProfile {
  userId: string;
  trustScore: number; // 0-1
  sessionCount: number;
  lastSeen: Date;
  trustHistory: Array<{
    timestamp: Date;
    score: number;
    reason: string;
  }>;
  signals: TrustSignals;
}

export type RelationshipPhase = 'DISCOVERY' | 'CALIBRATION' | 'MATURE';

export class TrustManager {
  private trustProfiles = new Map<string, UserTrustProfile>();

  /**
   * Get or create trust profile for user
   */
  getUserProfile(userId: string): UserTrustProfile {
    if (!this.trustProfiles.has(userId)) {
      this.trustProfiles.set(userId, {
        userId,
        trustScore: 0.5, // Start neutral
        sessionCount: 0,
        lastSeen: new Date(),
        trustHistory: [],
        signals: {
          sharedVulnerability: false,
          returnedAfterAbsence: false,
          conversationDepth: 0,
          emotionalResonance: 0,
          questionQuality: 0,
          silenceComfort: 0,
          consistentEngagement: false
        }
      });
    }
    return this.trustProfiles.get(userId)!;
  }

  /**
   * Update trust based on conversation dynamics
   */
  updateTrust(
    userId: string,
    fieldState: FieldState,
    responseEngagement: 'high' | 'medium' | 'low'
  ): number {
    const profile = this.getUserProfile(userId);
    const oldTrust = profile.trustScore;

    // Incremental trust building based on field state
    let trustDelta = 0;

    // Vulnerability builds trust faster
    if (fieldState.emotionalWeather.density > 0.7) {
      trustDelta += 0.02;
      profile.signals.sharedVulnerability = true;
    }

    // Sacred moments build deep trust
    if (fieldState.sacredMarkers.threshold_proximity > 0.7) {
      trustDelta += 0.03;
    }

    // Good conversation flow
    if (fieldState.connectionDynamics.resonance_frequency > 0.7) {
      trustDelta += 0.01;
      profile.signals.conversationDepth = fieldState.semanticLandscape.depth_gradient;
    }

    // Engagement response
    if (responseEngagement === 'high') {
      trustDelta += 0.02;
    } else if (responseEngagement === 'low') {
      trustDelta -= 0.01; // Slight decrease, recoverable
    }

    // Return after absence shows commitment
    const hoursSinceLastSeen = (Date.now() - profile.lastSeen.getTime()) / (1000 * 60 * 60);
    if (hoursSinceLastSeen > 24) {
      trustDelta += 0.03;
      profile.signals.returnedAfterAbsence = true;
    }

    // Update trust score with bounds
    profile.trustScore = Math.max(0, Math.min(1, profile.trustScore + trustDelta));

    // Log trust change
    if (trustDelta !== 0) {
      profile.trustHistory.push({
        timestamp: new Date(),
        score: profile.trustScore,
        reason: this.explainTrustChange(trustDelta, fieldState)
      });
    }

    // Update session tracking
    profile.sessionCount++;
    profile.lastSeen = new Date();

    console.log(`🤝 Trust updated for ${userId}:`, {
      oldTrust: oldTrust.toFixed(2),
      newTrust: profile.trustScore.toFixed(2),
      delta: trustDelta.toFixed(3),
      sessionCount: profile.sessionCount
    });

    return profile.trustScore;
  }

  /**
   * Get trust score for a user
   */
  getTrustScore(userId: string): number {
    const profile = this.getUserProfile(userId);
    return profile.trustScore;
  }

  /**
   * Calculate trust-based presence multiplier
   * Trust always INCREASES presence, never decreases
   */
  calculateTrustMultiplier(userId: string): number {
    const profile = this.getUserProfile(userId);

    // Trust multiplier ranges from 0.9x to 1.3x
    // Even zero trust only reduces by 10%, not 90%
    const multiplier = 0.9 + (0.4 * profile.trustScore);

    console.log(`🎯 Trust multiplier for ${userId}: ${multiplier.toFixed(2)}x`, {
      trustScore: profile.trustScore.toFixed(2),
      sessions: profile.sessionCount
    });

    return multiplier;
  }

  /**
   * Get relationship phase based on session count and trust
   */
  getRelationshipPhase(userId: string): RelationshipPhase {
    const profile = this.getUserProfile(userId);

    // Phase based on sessions, but trust can accelerate
    if (profile.sessionCount < 5) {
      // High trust can skip to calibration faster
      return profile.trustScore > 0.7 ? 'CALIBRATION' : 'DISCOVERY';
    } else if (profile.sessionCount < 20) {
      // High trust can reach maturity faster
      return profile.trustScore > 0.8 ? 'MATURE' : 'CALIBRATION';
    }

    return 'MATURE';
  }

  /**
   * Get phase-based governance ratio
   */
  getGovernanceRatio(userId: string): {
    framework: number;
    responsive: number;
  } {
    const phase = this.getRelationshipPhase(userId);

    switch (phase) {
      case 'DISCOVERY':
        return { framework: 0.70, responsive: 0.30 };
      case 'CALIBRATION':
        return { framework: 0.40, responsive: 0.60 };
      case 'MATURE':
        return { framework: 0.10, responsive: 0.90 };
    }
  }

  /**
   * Check if user has established trust patterns
   */
  hasTrustPattern(userId: string, pattern: keyof TrustSignals): boolean {
    const profile = this.getUserProfile(userId);
    return !!profile.signals[pattern];
  }

  /**
   * Explain trust change for transparency
   */
  private explainTrustChange(delta: number, fieldState: FieldState): string {
    const reasons = [];

    if (fieldState.emotionalWeather.density > 0.7) {
      reasons.push('vulnerability shared');
    }
    if (fieldState.sacredMarkers.threshold_proximity > 0.7) {
      reasons.push('sacred moment');
    }
    if (fieldState.connectionDynamics.resonance_frequency > 0.7) {
      reasons.push('strong resonance');
    }

    return reasons.join(', ') || 'gradual building';
  }

  /**
   * Get trust insights for monitoring
   */
  getTrustInsights(userId: string) {
    const profile = this.getUserProfile(userId);
    const phase = this.getRelationshipPhase(userId);
    const multiplier = this.calculateTrustMultiplier(userId);

    return {
      userId,
      trustScore: profile.trustScore,
      trustPercentage: `${(profile.trustScore * 100).toFixed(0)}%`,
      sessionCount: profile.sessionCount,
      phase,
      presenceMultiplier: `${multiplier.toFixed(2)}x`,
      signals: profile.signals,
      recentHistory: profile.trustHistory.slice(-5)
    };
  }
}

// Export singleton for immediate use
export const trustManager = new TrustManager();