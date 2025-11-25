/**
 * Maya Presence Engine
 * Unified system that orchestrates presence, trust, and voice modulation
 * This replaces the restrictive filter stack with adaptive, relational presence
 */

import { FieldState } from '../field/FieldAwareness';
import { PRESENCE_CONFIG, calculatePresence, getPhase } from '../config/presence.config';
import { trustManager } from '../relational/TrustManager';
import { archetypalMixer } from '../personality/ArchetypalMixer';
import { presenceMonitor } from '../monitoring/presence-monitor';
import { emergencyGovernor } from '../field/EmergencyGovernor';

export interface PresenceContext {
  userId: string;
  fieldState: FieldState;
  sessionId: string;
  messageLength?: number;
  responseType?: 'response' | 'question' | 'reflection';
}

export interface PresenceResult {
  surfacingRatio: number;
  voiceModulation: {
    primaryArchetype: string;
    weights: Record<string, number>;
    intensity: number;
    pacing: number;
    directness: number;
    formality: number;
  };
  trustScore: number;
  relationshipPhase: string;
  governanceRatio: {
    framework: number;
    responsive: number;
  };
  transparency?: string; // Safety framing if needed
  explanation: string[];
}

export class MayaPresenceEngine {
  private sessionCounts = new Map<string, number>();

  /**
   * Calculate comprehensive presence for Maya's response
   * This is the MAIN entry point for all presence decisions
   */
  async calculatePresence(context: PresenceContext): Promise<PresenceResult> {
    const { userId, fieldState } = context;

    console.log('🌟 Calculating Maya presence for:', { userId });

    // Track session count
    const sessionCount = this.incrementSessionCount(userId);

    // 1. TRUST SYSTEM - Always positive influence
    const trustScore = trustManager.updateTrust(userId, fieldState, 'medium');
    const trustMultiplier = trustManager.calculateTrustMultiplier(userId);

    // 2. RELATIONSHIP PHASE - Determines base presence
    const relationshipPhase = trustManager.getRelationshipPhase(userId);
    const phase = getPhase(sessionCount);

    // 3. EMERGENCY GOVERNOR - Current safety net (will be replaced)
    const emergencyCalc = emergencyGovernor.calculateSurfacing(fieldState);
    let baseSurfacing = emergencyCalc.surfacingRatio;

    // 4. TRUST BOOST - Always increases, never decreases
    let surfacingRatio = baseSurfacing * trustMultiplier;

    // 5. PHASE ADJUSTMENTS - Mature relationships get more
    if (relationshipPhase === 'MATURE') {
      surfacingRatio = Math.min(surfacingRatio * 1.1, PRESENCE_CONFIG.CEILING);
    }

    // 6. ENFORCE ABSOLUTE FLOOR - Never go below 40%
    surfacingRatio = Math.max(PRESENCE_CONFIG.FLOOR, surfacingRatio);

    // 7. ARCHETYPAL VOICE - Shape expression, not volume
    const voiceModulation = archetypalMixer.modulateVoice(
      fieldState,
      userId,
      trustScore
    );

    // 8. GOVERNANCE RATIO - How much is framework vs responsive
    const governanceRatio = trustManager.getGovernanceRatio(userId);

    // 9. SAFETY TRANSPARENCY - If needed
    const transparency = this.getTransparency(fieldState, surfacingRatio);

    // 10. MONITORING - Track everything
    presenceMonitor.logInteraction({
      surfacingRatio,
      modulations: emergencyCalc.modulations,
      responseLength: context.messageLength || 100,
      userId
    });

    // Build comprehensive result
    const result: PresenceResult = {
      surfacingRatio,
      voiceModulation,
      trustScore,
      relationshipPhase,
      governanceRatio,
      transparency,
      explanation: [
        `Base: ${(baseSurfacing * 100).toFixed(0)}%`,
        `Trust boost: ${trustMultiplier.toFixed(2)}x`,
        `Final presence: ${(surfacingRatio * 100).toFixed(0)}%`,
        `Phase: ${relationshipPhase}`,
        `Primary voice: ${voiceModulation.primaryArchetype}`,
        ...emergencyCalc.explanation
      ]
    };

    console.log('✨ Presence calculated:', {
      surfacing: `${(surfacingRatio * 100).toFixed(0)}%`,
      trust: `${(trustScore * 100).toFixed(0)}%`,
      phase: relationshipPhase,
      voice: voiceModulation.primaryArchetype
    });

    return result;
  }

  /**
   * Check if Maya is being throttled
   */
  isThrottled(surfacingRatio: number): boolean {
    return surfacingRatio <= PRESENCE_CONFIG.FLOOR;
  }

  /**
   * Get safety transparency message if needed
   */
  private getTransparency(fieldState: FieldState, surfacingRatio: number): string | undefined {
    // Only add transparency for significant safety needs
    if (fieldState.sacredMarkers.threshold_proximity > 0.9) {
      return "Let me slow down with you here...";
    }

    if (fieldState.emotionalWeather.pressure > 0.9) {
      return "I want to be careful with this...";
    }

    // If we're at floor, acknowledge it
    if (surfacingRatio <= PRESENCE_CONFIG.FLOOR) {
      return "I'm holding space for something important here...";
    }

    return undefined;
  }

  /**
   * Track session counts per user
   */
  private incrementSessionCount(userId: string): number {
    const current = this.sessionCounts.get(userId) || 0;
    const newCount = current + 1;
    this.sessionCounts.set(userId, newCount);
    return newCount;
  }

  /**
   * Get session count for user
   */
  getSessionCount(userId: string): number {
    return this.sessionCounts.get(userId) || 0;
  }

  /**
   * Generate presence report for monitoring
   */
  generateReport(): string {
    const stats = presenceMonitor.getStats();
    const insights: string[] = [];

    // Check health
    if (parseFloat(stats.averageSurfacingPercent) < 40) {
      insights.push('⚠️ Average presence below floor - check emergency governor');
    }
    if (parseFloat(stats.throttleRate) > 10) {
      insights.push('⚠️ High throttle rate - review modulations');
    }
    if (parseFloat(stats.genericRate) > 20) {
      insights.push('⚠️ High generic response rate - check Claude integration');
    }

    return `
╔══════════════════════════════════════════════════╗
║          MAYA PRESENCE ENGINE REPORT            ║
╠══════════════════════════════════════════════════╣
║ PRESENCE METRICS                                 ║
║ Average Presence:     ${stats.averageSurfacingPercent.padEnd(27)}║
║ Throttle Rate:        ${stats.throttleRate.padEnd(27)}║
║ Generic Rate:         ${stats.genericRate.padEnd(27)}║
╠══════════════════════════════════════════════════╣
║ RELATIONSHIP METRICS                             ║
║ Active Users:         ${this.sessionCounts.size.toString().padEnd(27)}║
║ Avg Trust Score:      ${this.getAverageTrust().padEnd(27)}║
║ Mature Relationships: ${this.getMatureCount().toString().padEnd(27)}║
╠══════════════════════════════════════════════════╣
║ INSIGHTS                                         ║
${insights.map(i => `║ ${i.padEnd(49)}║`).join('\n') || '║ ✅ All systems healthy                          ║'}
╚══════════════════════════════════════════════════╝
    `;
  }

  private getAverageTrust(): string {
    let total = 0;
    let count = 0;
    this.sessionCounts.forEach((_, userId) => {
      const insights = trustManager.getTrustInsights(userId);
      total += insights.trustScore;
      count++;
    });
    return count > 0 ? `${((total / count) * 100).toFixed(0)}%` : 'N/A';
  }

  private getMatureCount(): number {
    let count = 0;
    this.sessionCounts.forEach((sessions, userId) => {
      const phase = trustManager.getRelationshipPhase(userId);
      if (phase === 'MATURE') count++;
    });
    return count;
  }
}

// Export singleton for immediate use
export const mayaPresenceEngine = new MayaPresenceEngine();

// Auto-generate report every 100 interactions (dev mode)
if (process.env.NODE_ENV === 'development') {
  let interactionCount = 0;
  const originalCalculate = mayaPresenceEngine.calculatePresence.bind(mayaPresenceEngine);

  mayaPresenceEngine.calculatePresence = async function(context: PresenceContext) {
    const result = await originalCalculate(context);
    interactionCount++;

    if (interactionCount % 100 === 0) {
      console.log(mayaPresenceEngine.generateReport());
    }

    return result;
  };
}