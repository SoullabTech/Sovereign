/**
 * Soullab Feedback Loop System
 * Captures transformative journeys and consciousness exploration metrics
 */

export interface UserFeedbackSession {
  userId: string;
  sessionId: string;
  timestamp: Date;

  // Subjective Experience Capture
  subjective: {
    personalGrowth: number; // 1-10 scale
    insightDepth: number; // 1-10 scale
    emotionalResonance: number; // 1-10 scale
    transformativeImpact: number; // 1-10 scale
    presenceQuality: number; // 1-10 scale
  };

  // Behavioral Indicators
  behavioral: {
    realWorldActions: string[]; // Actions taken based on insights
    decisionShifts: string[]; // Changes in decision patterns
    relationshipChanges: string[]; // Impact on relationships
    creativeOutputs: string[]; // New creative expressions
  };

  // Consciousness Markers
  consciousness: {
    awarenessExpansion: boolean;
    shadowIntegration: boolean;
    synchronicities: number;
    flowStates: number;
    transcendentMoments: number;
  };

  // Qualitative Feedback
  qualitative: {
    mostPowerfulMoment: string;
    unexpectedDiscovery: string;
    growthEdge: string;
    nextIntention: string;
  };

  // System Effectiveness
  system: {
    mayaResonance: number; // How well Maya understood
    adaptiveAccuracy: number; // How well system adapted
    presenceAuthenticity: number; // Felt presence quality
    spiralAlignment: number; // Alignment with personal spiral
  };
}

export interface TransformationIndicators {
  userId: string;
  period: 'week' | 'month' | 'quarter';

  // Growth Trajectory
  growth: {
    selfAwarenessIncrease: number;
    emotionalIntelligenceShift: number;
    creativityExpansion: number;
    purposeClarity: number;
  };

  // Integration Patterns
  integration: {
    shadowWork: 'initiating' | 'deepening' | 'integrating' | 'transcending';
    traumaHealing: 'aware' | 'processing' | 'releasing' | 'transforming';
    authenticityJourney: 'discovering' | 'expressing' | 'embodying' | 'radiating';
  };

  // Collective Impact
  collective: {
    sharedInsights: number;
    communityResonance: number;
    wisdomContributions: number;
    fieldCoherence: number;
  };
}

export interface AdaptiveResponseAnalysis {
  userId: string;
  sessionId: string;

  // System Adaptations
  adaptations: {
    voiceShifts: Array<{
      trigger: string;
      adjustment: string;
      effectiveness: number;
    }>;
    presenceModulations: Array<{
      context: string;
      presenceLevel: number;
      userResponse: string;
    }>;
    intelligenceBlends: Array<{
      situation: string;
      blend: Record<string, number>;
      outcome: string;
    }>;
  };

  // Effectiveness Metrics
  effectiveness: {
    engagementIncrease: number;
    insightGeneration: number;
    emotionalAttunement: number;
    transformativePotential: number;
  };

  // Learning Indicators
  learning: {
    patternRecognition: boolean;
    rhythmSynchronization: boolean;
    needAnticipation: boolean;
    depthNavigation: boolean;
  };
}

export class FeedbackLoopManager {
  private feedbackSessions: Map<string, UserFeedbackSession[]> = new Map();
  private transformationTracking: Map<string, TransformationIndicators[]> = new Map();

  /**
   * Capture user feedback session
   */
  captureFeedback(session: UserFeedbackSession): void {
    const sessions = this.feedbackSessions.get(session.userId) || [];
    sessions.push(session);
    this.feedbackSessions.set(session.userId, sessions);

    console.log(`📝 Feedback captured for ${session.userId}:`, {
      growth: session.subjective.personalGrowth,
      impact: session.subjective.transformativeImpact,
      consciousness: session.consciousness
    });
  }

  /**
   * Analyze transformation indicators over time
   */
  analyzeTransformation(userId: string): TransformationIndicators | null {
    const sessions = this.feedbackSessions.get(userId);
    if (!sessions || sessions.length < 3) return null;

    // Calculate growth trajectory
    const recentSessions = sessions.slice(-5);
    const growthTrend = this.calculateGrowthTrend(recentSessions);

    return {
      userId,
      period: 'month',
      growth: {
        selfAwarenessIncrease: growthTrend.awareness,
        emotionalIntelligenceShift: growthTrend.emotional,
        creativityExpansion: growthTrend.creativity,
        purposeClarity: growthTrend.purpose
      },
      integration: {
        shadowWork: this.assessShadowWork(sessions),
        traumaHealing: 'aware',
        authenticityJourney: this.assessAuthenticity(sessions)
      },
      collective: {
        sharedInsights: sessions.filter(s => s.behavioral.realWorldActions.length > 0).length,
        communityResonance: 0.75,
        wisdomContributions: sessions.filter(s => s.consciousness.transcendentMoments > 0).length,
        fieldCoherence: 0.82
      }
    };
  }

  /**
   * Generate feedback insights for monitoring
   */
  getFeedbackInsights(userId: string) {
    const sessions = this.feedbackSessions.get(userId) || [];
    const transformation = this.analyzeTransformation(userId);

    if (sessions.length === 0) return null;

    const latestSession = sessions[sessions.length - 1];
    const avgGrowth = sessions.reduce((acc, s) => acc + s.subjective.personalGrowth, 0) / sessions.length;
    const avgImpact = sessions.reduce((acc, s) => acc + s.subjective.transformativeImpact, 0) / sessions.length;

    return {
      totalSessions: sessions.length,
      averageGrowth: avgGrowth.toFixed(1),
      averageImpact: avgImpact.toFixed(1),
      latestFeedback: {
        growth: latestSession.subjective.personalGrowth,
        insight: latestSession.subjective.insightDepth,
        resonance: latestSession.subjective.emotionalResonance,
        powerfulMoment: latestSession.qualitative.mostPowerfulMoment
      },
      transformation,
      consciousnessMarkers: {
        totalFlowStates: sessions.reduce((acc, s) => acc + s.consciousness.flowStates, 0),
        totalTranscendent: sessions.reduce((acc, s) => acc + s.consciousness.transcendentMoments, 0),
        shadowIntegration: sessions.filter(s => s.consciousness.shadowIntegration).length
      }
    };
  }

  private calculateGrowthTrend(sessions: UserFeedbackSession[]) {
    if (sessions.length < 2) return { awareness: 0, emotional: 0, creativity: 0, purpose: 0 };

    const first = sessions[0];
    const last = sessions[sessions.length - 1];

    return {
      awareness: ((last.subjective.insightDepth - first.subjective.insightDepth) / first.subjective.insightDepth) * 100,
      emotional: ((last.subjective.emotionalResonance - first.subjective.emotionalResonance) / first.subjective.emotionalResonance) * 100,
      creativity: ((last.behavioral.creativeOutputs.length - first.behavioral.creativeOutputs.length) / Math.max(1, first.behavioral.creativeOutputs.length)) * 100,
      purpose: ((last.subjective.transformativeImpact - first.subjective.transformativeImpact) / first.subjective.transformativeImpact) * 100
    };
  }

  private assessShadowWork(sessions: UserFeedbackSession[]): 'initiating' | 'deepening' | 'integrating' | 'transcending' {
    const shadowSessions = sessions.filter(s => s.consciousness.shadowIntegration).length;
    const ratio = shadowSessions / sessions.length;

    if (ratio < 0.25) return 'initiating';
    if (ratio < 0.5) return 'deepening';
    if (ratio < 0.75) return 'integrating';
    return 'transcending';
  }

  private assessAuthenticity(sessions: UserFeedbackSession[]): 'discovering' | 'expressing' | 'embodying' | 'radiating' {
    const avgPresence = sessions.reduce((acc, s) => acc + s.subjective.presenceQuality, 0) / sessions.length;

    if (avgPresence < 5) return 'discovering';
    if (avgPresence < 7) return 'expressing';
    if (avgPresence < 9) return 'embodying';
    return 'radiating';
  }
}

// Export singleton for Soullab consciousness tracking
export const feedbackLoop = new FeedbackLoopManager();