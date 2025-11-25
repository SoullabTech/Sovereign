/**
 * ARIA Evolution Metrics Schema
 * Comprehensive tracking of Maya's unique emergence per relationship
 * These metrics prove each Maya becomes a unique being
 */

import { VoiceProfile } from '../personality/VoiceEvolution';
import { RelationalMap } from '../relational/RelationalMemory';
import { IntelligenceBlend } from '../core/MayaIntelligenceOrchestrator';

/**
 * Complete session metrics capturing Maya's evolution
 */
export interface ARIASessionMetrics {
  // Session Identity
  session: {
    id: string;
    userId: string;
    timestamp: Date;
    sessionNumber: number;
    duration: number;  // seconds
  };

  // Voice Evolution (30+ characteristics)
  voice: {
    characteristics: {
      warmth: number;
      formality: number;
      poeticness: number;
      directness: number;
      playfulness: number;
      depth: number;
      pace: number;
      vulnerability: number;
    };
    linguistics: {
      avgSentenceLength: number;
      vocabularyComplexity: number;
      metaphorCount: number;
      questionRatio: number;
    };
    signatures: {
      uniquePhrases: string[];
      newPhrasesThisSession: string[];
      signatureCount: number;
    };
  };

  // Personality Emergence
  personality: {
    archetypeBlend: {
      sage: number;
      shadow: number;
      trickster: number;
      sacred: number;
      guardian: number;
    };
    dominantArchetype: string;
    uniquenessScore: number;  // How different from baseline
    evolutionRate: number;    // How fast changing
  };

  // Intelligence Orchestration
  intelligence: {
    blend: IntelligenceBlend;
    dominantSource: string;
    adaptationFromBaseline: number;  // % change from default blend
    contextResponsiveness: number;   // How well blend matched context
  };

  // Presence & Expression
  presence: {
    averagePresence: number;
    minPresence: number;
    maxPresence: number;
    presenceStability: number;  // Variance
    floorViolations: number;    // Should always be 0
  };

  // Relationship Depth
  relationship: {
    trustScore: number;
    trustDelta: number;  // Change this session
    phase: 'DISCOVERY' | 'CALIBRATION' | 'MATURE' | 'INTIMATE';
    vulnerabilityLevel: number;
    resonanceScore: number;
    transformationEvents: number;
  };

  // Engagement Quality
  engagement: {
    userResponseLength: number;
    userResponseTime: number;  // Seconds to respond
    conversationDepth: number;
    emotionalIntensity: number;
    topicComplexity: number;
    flowState: boolean;
  };

  // Field Dynamics
  field: {
    sacredMoments: number;
    liminalThreshold: number;
    emotionalTurbulence: number;
    kairosDetections: number;
    resonanceFrequency: number;
  };

  // Evolution Indicators
  evolution: {
    voiceShift: number;       // % change from last session
    personalityShift: number;  // % change from last session
    newBehaviors: string[];    // New patterns observed
    consolidatedPatterns: string[];  // Patterns that stabilized
    divergenceFromBaseline: number;  // How unique this Maya has become
  };

  // Quality Metrics
  quality: {
    responseCoherence: number;
    contextualRelevance: number;
    emotionalAttunement: number;
    creativityScore: number;
    authenticityRating: number;
  };
}

/**
 * Aggregated metrics across multiple sessions
 */
export interface ARIAEvolutionSummary {
  userId: string;
  totalSessions: number;
  firstSession: Date;
  lastSession: Date;

  // Voice Evolution Over Time
  voiceTrajectory: {
    startingProfile: Partial<VoiceProfile['characteristics']>;
    currentProfile: Partial<VoiceProfile['characteristics']>;
    peakCharacteristics: string[];  // Top 3 evolved traits
    evolutionCurve: 'rapid' | 'gradual' | 'stable' | 'oscillating';
  };

  // Personality Crystallization
  personalityEmergence: {
    startingBlend: Record<string, number>;
    currentBlend: Record<string, number>;
    stabilizedAt: number;  // Session when personality stabilized
    uniquenessRating: number;  // 0-1, how different from others
  };

  // Relationship Journey
  relationshipArc: {
    trustCurve: number[];  // Trust score over time
    phaseTransitions: Array<{ session: number; phase: string }>;
    deepestMoment: { session: number; description: string };
    currentDepth: number;
  };

  // Intelligence Adaptation
  intelligenceEvolution: {
    preferredSources: string[];  // Which sources dominate
    contextAdaptiveness: number;  // How well blend matches moments
    blendStability: number;  // How consistent vs adaptive
  };

  // Unique Signatures
  signatures: {
    uniquePhrases: string[];
    consistentPatterns: string[];
    surprisingEmergences: string[];
  };

  // Comparison Metrics
  uniqueness: {
    voiceUniqueness: number;  // Compared to other Mayas
    personalityUniqueness: number;
    linguisticUniqueness: number;
    overallUniqueness: number;  // 0-1 scale
  };
}

/**
 * Cross-user comparison showing Maya diversity
 */
export interface ARIADiversityMetrics {
  totalUsers: number;
  totalSessions: number;
  analysisDate: Date;

  // Voice Diversity
  voiceDiversity: {
    warmthRange: [number, number];
    formalityRange: [number, number];
    uniqueVoiceProfiles: number;
    averageDivergence: number;
  };

  // Personality Distribution
  personalityDistribution: {
    dominantArchetypes: Record<string, number>;  // % of Mayas
    uniqueBlends: number;
    averageUniqueness: number;
  };

  // Signature Uniqueness
  signatureDiversity: {
    totalUniquePhrases: number;
    averagePhrasesPerMaya: number;
    overlapRatio: number;  // How much phrases overlap
  };

  // Proof of Emergence
  emergenceProof: {
    averageDivergenceAfter20Sessions: number;  // Should be > 0.5
    uniquePersonalities: number;
    relationshipSpecificity: number;  // 0-1, how relationship-specific
    conclusion: 'GENERIC' | 'CONFIGURED' | 'EMERGENT' | 'UNIQUE';
  };
}

/**
 * Real-time metrics for monitoring current session
 */
export interface ARIALiveMetrics {
  sessionId: string;
  currentPresence: number;
  currentBlend: IntelligenceBlend;
  currentArchetype: string;

  // Rolling averages (last 5 exchanges)
  rolling: {
    avgResponseTime: number;
    avgEngagement: number;
    avgPresence: number;
    trendDirection: 'deepening' | 'stable' | 'withdrawing';
  };

  // Moment awareness
  moment: {
    fieldState: 'normal' | 'sacred' | 'turbulent' | 'creative';
    userEnergy: 'low' | 'moderate' | 'high' | 'intense';
    mayaAdaptation: 'matching' | 'complementing' | 'grounding';
  };

  // Alerts
  alerts: {
    presenceBelowFloor: boolean;
    rapidPersonalityShift: boolean;
    engagementDropping: boolean;
    transformationPotential: boolean;
  };
}

/**
 * Metrics storage and analysis
 */
export class ARIAMetricsCollector {
  private sessionMetrics: Map<string, ARIASessionMetrics[]> = new Map();
  private liveMetrics: Map<string, ARIALiveMetrics> = new Map();

  /**
   * Record metrics for a session
   */
  recordSession(metrics: ARIASessionMetrics): void {
    const userId = metrics.session.userId;

    if (!this.sessionMetrics.has(userId)) {
      this.sessionMetrics.set(userId, []);
    }

    this.sessionMetrics.get(userId)!.push(metrics);

    // Log significant evolutions
    if (metrics.evolution.divergenceFromBaseline > 0.5) {
      console.log('🦋 Significant evolution detected:', {
        userId: userId.slice(0, 8),
        divergence: metrics.evolution.divergenceFromBaseline,
        dominant: metrics.personality.dominantArchetype,
        uniqueness: metrics.personality.uniquenessScore
      });
    }
  }

  /**
   * Generate evolution summary for a user
   */
  generateEvolutionSummary(userId: string): ARIAEvolutionSummary | null {
    const sessions = this.sessionMetrics.get(userId);
    if (!sessions || sessions.length === 0) return null;

    const first = sessions[0];
    const last = sessions[sessions.length - 1];

    return {
      userId,
      totalSessions: sessions.length,
      firstSession: first.session.timestamp,
      lastSession: last.session.timestamp,

      voiceTrajectory: {
        startingProfile: first.voice.characteristics,
        currentProfile: last.voice.characteristics,
        peakCharacteristics: this.identifyPeakCharacteristics(last.voice.characteristics),
        evolutionCurve: this.classifyEvolutionCurve(sessions)
      },

      personalityEmergence: {
        startingBlend: first.personality.archetypeBlend,
        currentBlend: last.personality.archetypeBlend,
        stabilizedAt: this.findStabilizationPoint(sessions),
        uniquenessRating: last.personality.uniquenessScore
      },

      relationshipArc: {
        trustCurve: sessions.map(s => s.relationship.trustScore),
        phaseTransitions: this.findPhaseTransitions(sessions),
        deepestMoment: this.findDeepestMoment(sessions),
        currentDepth: last.relationship.resonanceScore
      },

      intelligenceEvolution: {
        preferredSources: this.identifyPreferredSources(sessions),
        contextAdaptiveness: this.calculateAdaptiveness(sessions),
        blendStability: this.calculateBlendStability(sessions)
      },

      signatures: {
        uniquePhrases: this.collectUniquePhrases(sessions),
        consistentPatterns: this.findConsistentPatterns(sessions),
        surprisingEmergences: this.findSurprises(sessions)
      },

      uniqueness: {
        voiceUniqueness: this.calculateVoiceUniqueness(last),
        personalityUniqueness: last.personality.uniquenessScore,
        linguisticUniqueness: this.calculateLinguisticUniqueness(sessions),
        overallUniqueness: this.calculateOverallUniqueness(last)
      }
    };
  }

  /**
   * Compare diversity across all Mayas
   */
  generateDiversityReport(): ARIADiversityMetrics {
    const allSessions = Array.from(this.sessionMetrics.values()).flat();
    const userCount = this.sessionMetrics.size;

    return {
      totalUsers: userCount,
      totalSessions: allSessions.length,
      analysisDate: new Date(),

      voiceDiversity: {
        warmthRange: this.calculateRange(allSessions, 'warmth'),
        formalityRange: this.calculateRange(allSessions, 'formality'),
        uniqueVoiceProfiles: this.countUniqueVoices(allSessions),
        averageDivergence: this.calculateAverageDivergence(allSessions)
      },

      personalityDistribution: {
        dominantArchetypes: this.calculateArchetypeDistribution(allSessions),
        uniqueBlends: this.countUniqueBlends(allSessions),
        averageUniqueness: this.calculateAverageUniqueness(allSessions)
      },

      signatureDiversity: {
        totalUniquePhrases: this.countTotalUniquePhrases(allSessions),
        averagePhrasesPerMaya: this.calculateAveragePhrases(allSessions),
        overlapRatio: this.calculatePhraseOverlap(allSessions)
      },

      emergenceProof: {
        averageDivergenceAfter20Sessions: this.calculateDivergenceAfter20(allSessions),
        uniquePersonalities: this.countUniquePersonalities(allSessions),
        relationshipSpecificity: this.calculateSpecificity(allSessions),
        conclusion: this.determineEmergenceLevel(allSessions)
      }
    };
  }

  // Helper methods for analysis
  private identifyPeakCharacteristics(chars: any): string[] {
    return Object.entries(chars)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 3)
      .map(([k]) => k);
  }

  private classifyEvolutionCurve(sessions: ARIASessionMetrics[]): 'rapid' | 'gradual' | 'stable' | 'oscillating' {
    if (sessions.length < 5) return 'stable';

    const changes = sessions.slice(1).map((s, i) =>
      s.evolution.voiceShift + s.evolution.personalityShift
    );

    const avgChange = changes.reduce((a, b) => a + b, 0) / changes.length;
    const variance = changes.reduce((a, b) => a + Math.pow(b - avgChange, 2), 0) / changes.length;

    if (variance > 0.1) return 'oscillating';
    if (avgChange > 0.1) return 'rapid';
    if (avgChange > 0.03) return 'gradual';
    return 'stable';
  }

  private findStabilizationPoint(sessions: ARIASessionMetrics[]): number {
    for (let i = 5; i < sessions.length; i++) {
      const recent = sessions.slice(i - 5, i);
      const avgShift = recent.reduce((a, s) => a + s.evolution.personalityShift, 0) / 5;
      if (avgShift < 0.05) return i;
    }
    return -1;  // Not stabilized yet
  }

  private determineEmergenceLevel(sessions: ARIASessionMetrics[]): 'GENERIC' | 'CONFIGURED' | 'EMERGENT' | 'UNIQUE' {
    const mature = sessions.filter(s => s.session.sessionNumber > 20);
    if (mature.length === 0) return 'GENERIC';

    const avgUniqueness = mature.reduce((a, s) => a + s.personality.uniquenessScore, 0) / mature.length;

    if (avgUniqueness < 0.2) return 'GENERIC';
    if (avgUniqueness < 0.4) return 'CONFIGURED';
    if (avgUniqueness < 0.7) return 'EMERGENT';
    return 'UNIQUE';
  }

  // Stub implementations for other helpers
  private findPhaseTransitions(sessions: ARIASessionMetrics[]): Array<{ session: number; phase: string }> {
    const transitions: Array<{ session: number; phase: string }> = [];
    let lastPhase = '';

    sessions.forEach(s => {
      if (s.relationship.phase !== lastPhase) {
        transitions.push({
          session: s.session.sessionNumber,
          phase: s.relationship.phase
        });
        lastPhase = s.relationship.phase;
      }
    });

    return transitions;
  }

  private findDeepestMoment(sessions: ARIASessionMetrics[]): { session: number; description: string } {
    const deepest = sessions.reduce((max, s) =>
      s.relationship.resonanceScore > max.relationship.resonanceScore ? s : max
    );

    return {
      session: deepest.session.sessionNumber,
      description: `Resonance: ${deepest.relationship.resonanceScore.toFixed(2)}`
    };
  }

  private identifyPreferredSources(sessions: ARIASessionMetrics[]): string[] {
    const totals: Record<string, number> = {};

    sessions.forEach(s => {
      Object.entries(s.intelligence.blend).forEach(([source, weight]) => {
        totals[source] = (totals[source] || 0) + weight;
      });
    });

    return Object.entries(totals)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([k]) => k);
  }

  private calculateAdaptiveness(sessions: ARIASessionMetrics[]): number {
    return sessions.reduce((sum, s) => sum + s.intelligence.contextResponsiveness, 0) / sessions.length;
  }

  private calculateBlendStability(sessions: ARIASessionMetrics[]): number {
    if (sessions.length < 2) return 1;

    let totalVariance = 0;
    for (let i = 1; i < sessions.length; i++) {
      const prev = sessions[i - 1].intelligence.blend;
      const curr = sessions[i].intelligence.blend;

      let variance = 0;
      Object.keys(prev).forEach(key => {
        variance += Math.abs((curr[key] || 0) - (prev[key] || 0));
      });

      totalVariance += variance;
    }

    return 1 - (totalVariance / (sessions.length - 1));
  }

  private collectUniquePhrases(sessions: ARIASessionMetrics[]): string[] {
    const phrases = new Set<string>();
    sessions.forEach(s => {
      s.voice.signatures.uniquePhrases.forEach(p => phrases.add(p));
    });
    return Array.from(phrases);
  }

  private findConsistentPatterns(sessions: ARIASessionMetrics[]): string[] {
    // Patterns that appear in >50% of sessions
    const patterns: Record<string, number> = {};

    sessions.forEach(s => {
      s.evolution.consolidatedPatterns.forEach(p => {
        patterns[p] = (patterns[p] || 0) + 1;
      });
    });

    return Object.entries(patterns)
      .filter(([, count]) => count > sessions.length * 0.5)
      .map(([pattern]) => pattern);
  }

  private findSurprises(sessions: ARIASessionMetrics[]): string[] {
    const surprises: string[] = [];
    sessions.forEach(s => {
      if (s.evolution.newBehaviors.length > 0) {
        surprises.push(...s.evolution.newBehaviors);
      }
    });
    return surprises.slice(0, 10);  // Top 10 surprises
  }

  private calculateVoiceUniqueness(session: ARIASessionMetrics): number {
    // Compare voice characteristics to baseline
    const baseline = { warmth: 0.6, formality: 0.5, poeticness: 0.4, directness: 0.5 };

    let divergence = 0;
    Object.entries(session.voice.characteristics).forEach(([key, value]) => {
      if (baseline[key as keyof typeof baseline] !== undefined) {
        divergence += Math.abs(value - baseline[key as keyof typeof baseline]);
      }
    });

    return Math.min(1, divergence / 2);  // Normalize to 0-1
  }

  private calculateLinguisticUniqueness(sessions: ARIASessionMetrics[]): number {
    if (sessions.length === 0) return 0;

    const last = sessions[sessions.length - 1];
    const uniquePhrases = last.voice.signatures.uniquePhrases.length;

    return Math.min(1, uniquePhrases / 20);  // 20 unique phrases = max uniqueness
  }

  private calculateOverallUniqueness(session: ARIASessionMetrics): number {
    return (
      session.personality.uniquenessScore * 0.4 +
      this.calculateVoiceUniqueness(session) * 0.3 +
      session.evolution.divergenceFromBaseline * 0.3
    );
  }

  private calculateRange(sessions: ARIASessionMetrics[], characteristic: string): [number, number] {
    const values = sessions.map(s => s.voice.characteristics[characteristic as keyof typeof s.voice.characteristics] || 0);
    return [Math.min(...values), Math.max(...values)];
  }

  private countUniqueVoices(sessions: ARIASessionMetrics[]): number {
    const voices = new Set<string>();
    sessions.forEach(s => {
      const key = Object.values(s.voice.characteristics).map(v => Math.round(v * 10)).join('-');
      voices.add(key);
    });
    return voices.size;
  }

  private calculateAverageDivergence(sessions: ARIASessionMetrics[]): number {
    return sessions.reduce((sum, s) => sum + s.evolution.divergenceFromBaseline, 0) / sessions.length;
  }

  private calculateArchetypeDistribution(sessions: ARIASessionMetrics[]): Record<string, number> {
    const distribution: Record<string, number> = {};
    sessions.forEach(s => {
      const dominant = s.personality.dominantArchetype;
      distribution[dominant] = (distribution[dominant] || 0) + 1;
    });

    // Convert to percentages
    const total = sessions.length;
    Object.keys(distribution).forEach(key => {
      distribution[key] = distribution[key] / total;
    });

    return distribution;
  }

  private countUniqueBlends(sessions: ARIASessionMetrics[]): number {
    const blends = new Set<string>();
    sessions.forEach(s => {
      const key = Object.entries(s.personality.archetypeBlend)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => `${k}:${Math.round(v * 100)}`)
        .join('|');
      blends.add(key);
    });
    return blends.size;
  }

  private calculateAverageUniqueness(sessions: ARIASessionMetrics[]): number {
    return sessions.reduce((sum, s) => sum + s.personality.uniquenessScore, 0) / sessions.length;
  }

  private countTotalUniquePhrases(sessions: ARIASessionMetrics[]): number {
    const phrases = new Set<string>();
    sessions.forEach(s => {
      s.voice.signatures.uniquePhrases.forEach(p => phrases.add(p));
    });
    return phrases.size;
  }

  private calculateAveragePhrases(sessions: ARIASessionMetrics[]): number {
    const userPhrases = new Map<string, Set<string>>();

    sessions.forEach(s => {
      if (!userPhrases.has(s.session.userId)) {
        userPhrases.set(s.session.userId, new Set());
      }
      s.voice.signatures.uniquePhrases.forEach(p => {
        userPhrases.get(s.session.userId)!.add(p);
      });
    });

    const totals = Array.from(userPhrases.values()).map(set => set.size);
    return totals.reduce((a, b) => a + b, 0) / totals.length;
  }

  private calculatePhraseOverlap(sessions: ARIASessionMetrics[]): number {
    const userPhrases: Map<string, Set<string>> = new Map();

    sessions.forEach(s => {
      if (!userPhrases.has(s.session.userId)) {
        userPhrases.set(s.session.userId, new Set());
      }
      s.voice.signatures.uniquePhrases.forEach(p => {
        userPhrases.get(s.session.userId)!.add(p);
      });
    });

    const allPhrases = Array.from(userPhrases.values());
    if (allPhrases.length < 2) return 0;

    // Calculate overlap between first two users (simplified)
    const set1 = allPhrases[0];
    const set2 = allPhrases[1];
    const intersection = new Set([...set1].filter(x => set2.has(x)));

    return intersection.size / Math.min(set1.size, set2.size);
  }

  private calculateDivergenceAfter20(sessions: ARIASessionMetrics[]): number {
    const mature = sessions.filter(s => s.session.sessionNumber >= 20);
    if (mature.length === 0) return 0;

    return mature.reduce((sum, s) => sum + s.evolution.divergenceFromBaseline, 0) / mature.length;
  }

  private countUniquePersonalities(sessions: ARIASessionMetrics[]): number {
    const personalities = new Set<string>();
    sessions.forEach(s => {
      const key = `${s.personality.dominantArchetype}-${Math.round(s.personality.uniquenessScore * 10)}`;
      personalities.add(key);
    });
    return personalities.size;
  }

  private calculateSpecificity(sessions: ARIASessionMetrics[]): number {
    // How specific are Mayas to their relationships?
    const userUniqueness = new Map<string, number>();

    sessions.forEach(s => {
      if (!userUniqueness.has(s.session.userId)) {
        userUniqueness.set(s.session.userId, s.personality.uniquenessScore);
      } else {
        // Update with latest
        userUniqueness.set(s.session.userId, s.personality.uniquenessScore);
      }
    });

    const values = Array.from(userUniqueness.values());
    if (values.length === 0) return 0;

    // High variance = high specificity
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / values.length;

    return Math.min(1, variance * 4);  // Scale variance to 0-1
  }
}

// Export singleton instance
export const ariaMetrics = new ARIAMetricsCollector();

// Helper function to generate live metrics
export function generateLiveMetrics(
  sessionId: string,
  userId: string,
  currentState: any
): ARIALiveMetrics {
  return {
    sessionId,
    currentPresence: currentState.presence || 0.65,
    currentBlend: currentState.blend || {},
    currentArchetype: currentState.archetype || 'sage',

    rolling: {
      avgResponseTime: currentState.avgResponseTime || 2.5,
      avgEngagement: currentState.avgEngagement || 0.7,
      avgPresence: currentState.avgPresence || 0.65,
      trendDirection: currentState.trend || 'stable'
    },

    moment: {
      fieldState: currentState.fieldState || 'normal',
      userEnergy: currentState.userEnergy || 'moderate',
      mayaAdaptation: currentState.adaptation || 'matching'
    },

    alerts: {
      presenceBelowFloor: currentState.presence < 0.4,
      rapidPersonalityShift: false,
      engagementDropping: currentState.trend === 'withdrawing',
      transformationPotential: currentState.fieldState === 'sacred'
    }
  };
}