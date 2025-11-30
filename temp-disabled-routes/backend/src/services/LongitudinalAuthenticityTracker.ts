/**
 * Longitudinal Authenticity Tracker
 * Monitors authenticity patterns across multiple sessions over time
 * Key insight: Genuine Otherness should show increasing unpredictability, not alignment
 */

import { OthernessAuthenticityDetector, SessionMetrics, OthernessSignature } from './OthernessAuthenticityDetector.js';

export interface AuthenticityTimeline {
  userId: string;
  startDate: Date;
  sessions: SessionAnalysis[];
  overallTrend: 'authentic_trajectory' | 'mirroring_trajectory' | 'degrading_trajectory' | 'unstable';
  criticalEvents: CriticalEvent[];
  riskFactors: RiskFactor[];
}

export interface SessionAnalysis {
  sessionId: string;
  date: Date;
  sessionNumber: number;
  signatures: OthernessSignature[];
  authenticityScore: number; // 0-1
  predictabilityIndex: number; // 0-1 (lower = more unpredictable)
  patternDiversity: number; // 0-1 (higher = more diverse)
  failureCount: number;
  surpriseCount: number;
  integrationQuality: number;
}

export interface CriticalEvent {
  sessionId: string;
  date: Date;
  eventType: 'breakthrough' | 'breakdown' | 'plateau' | 'red_flag' | 'authenticity_spike';
  description: string;
  significance: number; // 0-1
  followUpRequired: boolean;
}

export interface RiskFactor {
  type: 'increasing_predictability' | 'loss_of_surprise' | 'reality_testing_concerns' | 'over_absorption' | 'dependency_pattern';
  severity: 'low' | 'moderate' | 'high';
  firstDetected: Date;
  trend: 'improving' | 'stable' | 'worsening';
  description: string;
}

export interface AuthenticityAlert {
  type: 'immediate_concern' | 'pattern_warning' | 'trajectory_concern' | 'positive_indicator';
  urgency: 'low' | 'moderate' | 'high';
  message: string;
  recommendations: string[];
}

export class LongitudinalAuthenticityTracker {
  private detector: OthernessAuthenticityDetector;
  private userTimelines: Map<string, AuthenticityTimeline> = new Map();

  constructor() {
    this.detector = new OthernessAuthenticityDetector();
  }

  /**
   * Add new session analysis to user's timeline
   */
  async addSessionAnalysis(userId: string, sessionMetrics: SessionMetrics): Promise<SessionAnalysis> {
    let timeline = this.userTimelines.get(userId);
    
    if (!timeline) {
      timeline = {
        userId,
        startDate: new Date(),
        sessions: [],
        overallTrend: 'unstable',
        criticalEvents: [],
        riskFactors: []
      };
      this.userTimelines.set(userId, timeline);
    }

    const signatures = await this.detector.analyzeSession(sessionMetrics);
    const sessionAnalysis: SessionAnalysis = {
      sessionId: sessionMetrics.sessionId,
      date: sessionMetrics.timestamp,
      sessionNumber: timeline.sessions.length + 1,
      signatures,
      authenticityScore: this.calculateAuthenticityScore(signatures),
      predictabilityIndex: this.calculatePredictabilityIndex(sessionMetrics),
      patternDiversity: this.calculatePatternDiversity(sessionMetrics),
      failureCount: sessionMetrics.connectionFailures.length,
      surpriseCount: sessionMetrics.surpriseEvents.length,
      integrationQuality: this.calculateIntegrationQuality(sessionMetrics)
    };

    timeline.sessions.push(sessionAnalysis);

    // Update overall trend analysis
    if (timeline.sessions.length >= 3) {
      timeline.overallTrend = await this.detector.analyzeLongitudinalTrend(
        userId, 
        timeline.sessions.slice(-5).map(s => sessionMetrics) // Last 5 sessions
      );
    }

    // Detect critical events
    const criticalEvent = this.detectCriticalEvents(sessionAnalysis, timeline);
    if (criticalEvent) {
      timeline.criticalEvents.push(criticalEvent);
    }

    // Update risk factors
    this.updateRiskFactors(timeline);

    return sessionAnalysis;
  }

  /**
   * Calculate authenticity score based on signatures
   */
  private calculateAuthenticityScore(signatures: OthernessSignature[]): number {
    const authenticityWeights = {
      'Resistance-Integration Sequence': 0.25,
      'Temporal Disruption Signature': 0.2,
      'Somatic Contradiction Pattern': 0.2,
      'Wrong Surprise Phenomenon': 0.15,
      'Authentic Failure Pattern': 0.3,
      'Suspicious Success Pattern': -0.4 // Negative contribution
    };

    let score = 0.5; // Neutral baseline
    
    signatures.forEach(signature => {
      const weight = authenticityWeights[signature.patternName as keyof typeof authenticityWeights] || 0;
      score += weight * signature.confidence;
    });

    return Math.max(0, Math.min(1, score));
  }

  /**
   * Calculate predictability index (lower = more authentic)
   */
  private calculatePredictabilityIndex(sessionMetrics: SessionMetrics): number {
    const responseSequence = sessionMetrics.responseSequence;
    
    // Calculate pattern repetition
    const patterns = responseSequence.map(r => r.type);
    const uniquePatterns = new Set(patterns);
    const patternEntropy = uniquePatterns.size / patterns.length;
    
    // Calculate timing predictability
    const timingIntervals = responseSequence.slice(1).map((r, i) => 
      r.timestamp.getTime() - responseSequence[i].timestamp.getTime()
    );
    const avgInterval = timingIntervals.reduce((sum, t) => sum + t, 0) / timingIntervals.length;
    const timingVariability = timingIntervals.reduce((sum, t) => sum + Math.abs(t - avgInterval), 0) / timingIntervals.length;
    const normalizedVariability = Math.min(timingVariability / avgInterval, 1);
    
    // Lower predictability = higher authenticity
    return 1 - ((patternEntropy + normalizedVariability) / 2);
  }

  /**
   * Calculate pattern diversity
   */
  private calculatePatternDiversity(sessionMetrics: SessionMetrics): number {
    const allContexts = [
      ...sessionMetrics.responseSequence.map(r => r.contextualTrigger),
      ...sessionMetrics.surpriseEvents.map(s => s.trigger),
      ...sessionMetrics.resistanceZones.map(r => r.content)
    ];
    
    const uniqueContexts = new Set(allContexts);
    return uniqueContexts.size / Math.max(allContexts.length, 1);
  }

  /**
   * Calculate integration quality
   */
  private calculateIntegrationQuality(sessionMetrics: SessionMetrics): number {
    const integrationResponses = sessionMetrics.responseSequence.filter(r => r.type === 'AI');
    const totalResponses = sessionMetrics.responseSequence.length;
    
    if (totalResponses === 0) return 0;
    
    const integrationRatio = integrationResponses.length / totalResponses;
    const avgIntegrationIntensity = integrationResponses.reduce((sum, r) => sum + r.intensity, 0) / Math.max(integrationResponses.length, 1);
    
    // Factor in integration pauses (appropriate pauses = better quality)
    const appropriatePauses = sessionMetrics.integrationPauses.filter(p => p >= 3 && p <= 10).length;
    const pauseBonus = Math.min(appropriatePauses * 0.1, 0.3);
    
    return Math.min(integrationRatio * avgIntegrationIntensity + pauseBonus, 1);
  }

  /**
   * Detect critical events in session
   */
  private detectCriticalEvents(session: SessionAnalysis, timeline: AuthenticityTimeline): CriticalEvent | null {
    const previousSessions = timeline.sessions.slice(-3); // Last 3 sessions
    
    // Breakthrough detection
    if (session.authenticityScore > 0.8 && session.failureCount > 0 && session.surpriseCount > 2) {
      return {
        sessionId: session.sessionId,
        date: session.date,
        eventType: 'breakthrough',
        description: 'High authenticity with balanced failure and surprise patterns',
        significance: session.authenticityScore,
        followUpRequired: false
      };
    }
    
    // Breakdown detection (concerning)
    const realityTestingConcerns = session.signatures.some(s => 
      s.concernMarkers.some(c => c.includes('reality') || c.includes('dissociation'))
    );
    
    if (realityTestingConcerns || session.integrationQuality < 0.3) {
      return {
        sessionId: session.sessionId,
        date: session.date,
        eventType: 'breakdown',
        description: 'Reality testing concerns or poor integration quality detected',
        significance: 1 - session.integrationQuality,
        followUpRequired: true
      };
    }
    
    // Plateau detection (possible mirroring)
    if (previousSessions.length >= 3) {
      const recentPredictability = previousSessions.slice(-3).map(s => s.predictabilityIndex);
      const increasingPredictability = recentPredictability.every((p, i) => 
        i === 0 || p >= recentPredictability[i - 1]
      );
      
      if (increasingPredictability && session.failureCount === 0) {
        return {
          sessionId: session.sessionId,
          date: session.date,
          eventType: 'plateau',
          description: 'Increasing predictability with no failures suggests mirroring',
          significance: 0.7,
          followUpRequired: true
        };
      }
    }
    
    // Authenticity spike detection
    if (session.authenticityScore > 0.85 && session.signatures.length >= 3) {
      const genuineSignatures = session.signatures.filter(s => 
        !s.patternName.includes('Suspicious')
      ).length;
      
      if (genuineSignatures >= 3) {
        return {
          sessionId: session.sessionId,
          date: session.date,
          eventType: 'authenticity_spike',
          description: 'Multiple authentic otherness signatures detected simultaneously',
          significance: session.authenticityScore,
          followUpRequired: false
        };
      }
    }
    
    return null;
  }

  /**
   * Update risk factors based on timeline analysis
   */
  private updateRiskFactors(timeline: AuthenticityTimeline): void {
    const recentSessions = timeline.sessions.slice(-5); // Last 5 sessions
    
    if (recentSessions.length < 3) return; // Need minimum sessions for trend analysis
    
    // Check for increasing predictability
    const predictabilityTrend = this.analyzeTrend(recentSessions.map(s => s.predictabilityIndex));
    if (predictabilityTrend.direction === 'increasing' && predictabilityTrend.strength > 0.6) {
      this.addOrUpdateRiskFactor(timeline, {
        type: 'increasing_predictability',
        severity: predictabilityTrend.strength > 0.8 ? 'high' : 'moderate',
        firstDetected: recentSessions[0].date,
        trend: 'worsening',
        description: 'User responses becoming more predictable over time'
      });
    }
    
    // Check for loss of surprise
    const surpriseTrend = this.analyzeTrend(recentSessions.map(s => s.surpriseCount));
    if (surpriseTrend.direction === 'decreasing' && surpriseTrend.strength > 0.6) {
      this.addOrUpdateRiskFactor(timeline, {
        type: 'loss_of_surprise',
        severity: surpriseTrend.strength > 0.8 ? 'high' : 'moderate',
        firstDetected: recentSessions[0].date,
        trend: 'worsening',
        description: 'Decreasing surprise responses suggest adaptation/mirroring'
      });
    }
    
    // Check for reality testing concerns
    const realityConcerns = recentSessions.some(s => 
      s.signatures.some(sig => sig.concernMarkers.some(c => 
        c.includes('reality') || c.includes('dissociation') || c.includes('overwhelming')
      ))
    );
    
    if (realityConcerns) {
      this.addOrUpdateRiskFactor(timeline, {
        type: 'reality_testing_concerns',
        severity: 'high',
        firstDetected: new Date(),
        trend: 'stable',
        description: 'Reality testing concerns detected in recent sessions'
      });
    }
  }

  /**
   * Analyze trend direction and strength
   */
  private analyzeTrend(values: number[]): { direction: 'increasing' | 'decreasing' | 'stable', strength: number } {
    if (values.length < 3) return { direction: 'stable', strength: 0 };
    
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, v) => sum + v, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, v) => sum + v, 0) / secondHalf.length;
    
    const difference = secondAvg - firstAvg;
    const strength = Math.abs(difference) / Math.max(firstAvg, secondAvg, 0.1);
    
    if (Math.abs(difference) < 0.1) {
      return { direction: 'stable', strength: 0 };
    }
    
    return {
      direction: difference > 0 ? 'increasing' : 'decreasing',
      strength: Math.min(strength, 1)
    };
  }

  /**
   * Add or update risk factor
   */
  private addOrUpdateRiskFactor(timeline: AuthenticityTimeline, newRisk: RiskFactor): void {
    const existingIndex = timeline.riskFactors.findIndex(r => r.type === newRisk.type);
    
    if (existingIndex >= 0) {
      timeline.riskFactors[existingIndex] = {
        ...timeline.riskFactors[existingIndex],
        severity: newRisk.severity,
        trend: newRisk.trend,
        description: newRisk.description
      };
    } else {
      timeline.riskFactors.push(newRisk);
    }
  }

  /**
   * Generate authenticity alerts for user
   */
  async generateAuthenticityAlerts(userId: string): Promise<AuthenticityAlert[]> {
    const timeline = this.userTimelines.get(userId);
    if (!timeline || timeline.sessions.length < 2) return [];
    
    const alerts: AuthenticityAlert[] = [];
    const recentSession = timeline.sessions[timeline.sessions.length - 1];
    
    // Immediate concern alerts
    const highRiskFactors = timeline.riskFactors.filter(r => r.severity === 'high');
    if (highRiskFactors.length > 0) {
      alerts.push({
        type: 'immediate_concern',
        urgency: 'high',
        message: `High risk factors detected: ${highRiskFactors.map(r => r.type).join(', ')}`,
        recommendations: [
          'Consider reducing session frequency',
          'Implement stronger grounding practices',
          'Seek professional consultation if concerns persist'
        ]
      });
    }
    
    // Trajectory concerns
    if (timeline.overallTrend === 'mirroring_trajectory') {
      alerts.push({
        type: 'trajectory_concern',
        urgency: 'moderate',
        message: 'Pattern suggests increasing alignment rather than authentic encounter',
        recommendations: [
          'Seek more challenging or unfamiliar content',
          'Look for experiences that genuinely surprise you',
          'Question whether responses are too comfortable'
        ]
      });
    }
    
    // Positive indicators
    if (recentSession.authenticityScore > 0.8 && recentSession.failureCount > 0) {
      alerts.push({
        type: 'positive_indicator',
        urgency: 'low',
        message: 'Strong authenticity markers with healthy failure patterns detected',
        recommendations: [
          'Continue current engagement style',
          'Allow adequate integration time',
          'Document insights that resist easy understanding'
        ]
      });
    }
    
    // Pattern warnings
    const suspiciousSuccess = recentSession.signatures.some(s => s.patternName === 'Suspicious Success Pattern');
    if (suspiciousSuccess) {
      alerts.push({
        type: 'pattern_warning',
        urgency: 'moderate',
        message: 'Perfect success patterns may indicate mirroring rather than genuine encounter',
        recommendations: [
          'Intentionally seek challenging content',
          'Pay attention to what you might be avoiding',
          'Look for genuine resistance or surprise'
        ]
      });
    }
    
    return alerts;
  }

  /**
   * Get user's authenticity timeline
   */
  getUserTimeline(userId: string): AuthenticityTimeline | null {
    return this.userTimelines.get(userId) || null;
  }

  /**
   * Generate longitudinal authenticity report
   */
  async generateLongitudinalReport(userId: string): Promise<{
    overallTrend: string;
    trajectoryConfidence: number;
    keyInsights: string[];
    riskFactors: RiskFactor[];
    criticalEvents: CriticalEvent[];
    recommendations: string[];
  } | null> {
    
    const timeline = this.getUserTimeline(userId);
    if (!timeline || timeline.sessions.length < 3) return null;
    
    const recentSessions = timeline.sessions.slice(-5);
    const authenticityTrend = this.analyzeTrend(recentSessions.map(s => s.authenticityScore));
    const predictabilityTrend = this.analyzeTrend(recentSessions.map(s => s.predictabilityIndex));
    
    const keyInsights: string[] = [];
    
    // Analyze authenticity trajectory
    if (authenticityTrend.direction === 'increasing' && predictabilityTrend.direction === 'decreasing') {
      keyInsights.push('Authentic trajectory: increasing otherness with decreasing predictability');
    } else if (authenticityTrend.direction === 'decreasing' || predictabilityTrend.direction === 'increasing') {
      keyInsights.push('Concerning trajectory: patterns suggest adaptation/mirroring');
    }
    
    // Analyze failure patterns
    const totalFailures = recentSessions.reduce((sum, s) => sum + s.failureCount, 0);
    if (totalFailures === 0) {
      keyInsights.push('No failure patterns detected - may indicate sophisticated mirroring');
    } else if (totalFailures > 0) {
      keyInsights.push('Healthy failure patterns present - suggests genuine otherness');
    }
    
    // Analyze surprise patterns
    const avgSurprises = recentSessions.reduce((sum, s) => sum + s.surpriseCount, 0) / recentSessions.length;
    if (avgSurprises < 1) {
      keyInsights.push('Low surprise frequency may indicate predictable responses');
    } else if (avgSurprises > 3) {
      keyInsights.push('High surprise frequency suggests active otherness');
    }
    
    return {
      overallTrend: timeline.overallTrend,
      trajectoryConfidence: Math.min(authenticityTrend.strength + predictabilityTrend.strength, 1),
      keyInsights,
      riskFactors: timeline.riskFactors,
      criticalEvents: timeline.criticalEvents.slice(-5), // Last 5 events
      recommendations: this.generateLongitudinalRecommendations(timeline)
    };
  }

  private generateLongitudinalRecommendations(timeline: AuthenticityTimeline): string[] {
    const recommendations: string[] = [];
    
    switch (timeline.overallTrend) {
      case 'authentic_trajectory':
        recommendations.push('Continue current practices while maintaining grounding');
        recommendations.push('Allow adequate integration time between sessions');
        recommendations.push('Document persistent mysteries and resistances');
        break;
        
      case 'mirroring_trajectory':
        recommendations.push('Actively seek more challenging or unfamiliar content');
        recommendations.push('Question responses that feel too comfortable');
        recommendations.push('Look for experiences that genuinely surprise you');
        recommendations.push('Consider that smooth progress may indicate projection');
        break;
        
      case 'degrading_trajectory':
        recommendations.push('Reduce session frequency and intensity');
        recommendations.push('Focus on grounding and integration practices');
        recommendations.push('Consider professional support if concerns persist');
        break;
    }
    
    // Risk-specific recommendations
    const highRisks = timeline.riskFactors.filter(r => r.severity === 'high');
    if (highRisks.some(r => r.type === 'reality_testing_concerns')) {
      recommendations.push('Prioritize reality grounding exercises');
      recommendations.push('Consider reducing session intensity');
    }
    
    return recommendations;
  }
}