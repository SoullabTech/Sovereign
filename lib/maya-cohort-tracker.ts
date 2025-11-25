import { supabase } from './supabase/client';

export type CohortType = 
  | 'contemplative-practitioners'
  | 'ai-curious'
  | 'seeking-exploration'
  | 'therapy-adjacent'
  | 'creative-professionals'
  | 'tech-early-adopters'
  | 'unclassified';

export interface CohortProfile {
  cohortId: CohortType;
  characteristics: {
    meditationExperience: boolean;
    therapyBackground: boolean;
    techSavvy: number; // 1-5
    uncertaintyTolerance: number; // 1-5
    preferredDepth: 'surface' | 'middle' | 'deep';
    primaryMotivation: string;
  };
  behaviorPatterns: {
    avgSessionLength: number;
    returnRate: number;
    escapeHatchFrequency: number;
    densityPreference: 'haiku' | 'flowing' | 'spacious';
    modeShiftFrequency: number;
  };
}

export interface SessionMetrics {
  userId: string;
  sessionId: string;
  cohort: CohortType;
  startTime: Date;
  endTime?: Date;
  metrics: {
    messageCount: number;
    avgResponseTime: number;
    depthChanges: number;
    densityChanges: number;
    escapeHatches: number;
    presenceRequests: number;
    completionType: 'natural' | 'abrupt' | 'timeout' | 'ongoing';
    engagementScore: number; // 0-100
    resonanceIndicators: {
      longPauses: number;
      deepShares: number;
      gratitudeExpressions: number;
      returnToTopics: number;
    };
  };
  qualitativeMarkers: {
    hadBreakthrough: boolean;
    expressedFrustration: boolean;
    requestedMoreStructure: boolean;
    enteredFlowState: boolean;
  };
}

export class CohortTracker {
  private cohortAssignments: Map<string, CohortType> = new Map();
  private sessionMetrics: Map<string, SessionMetrics> = new Map();

  async assignCohort(
    userId: string,
    onboardingResponses: Record<string, any>
  ): Promise<CohortType> {
    
    let cohort: CohortType = 'unclassified';
    const scores = {
      'contemplative-practitioners': 0,
      'ai-curious': 0,
      'seeking-exploration': 0,
      'therapy-adjacent': 0,
      'creative-professionals': 0,
      'tech-early-adopters': 0
    };

    // Analyze onboarding responses
    const practices = onboardingResponses['practice-background'] || [];
    const intention = onboardingResponses['intention'];
    const comfortLevel = onboardingResponses['comfort-level'];
    const depth = onboardingResponses['depth-preference'];

    // Score for contemplative practitioners
    if (practices.includes('Meditation or mindfulness')) scores['contemplative-practitioners'] += 3;
    if (practices.includes('Spiritual practices')) scores['contemplative-practitioners'] += 2;
    if (depth === 'deep') scores['contemplative-practitioners'] += 1;
    if (comfortLevel >= 4) scores['contemplative-practitioners'] += 1;

    // Score for therapy-adjacent
    if (practices.includes('Therapy or counseling')) scores['therapy-adjacent'] += 3;
    if (intention === 'process') scores['therapy-adjacent'] += 2;
    if (practices.includes('Journaling or self-reflection')) scores['therapy-adjacent'] += 1;

    // Score for seeking-exploration
    if (intention === 'explore') scores['seeking-exploration'] += 3;
    if (comfortLevel >= 3) scores['seeking-exploration'] += 1;
    if (!practices.includes('None of these')) scores['seeking-exploration'] += 1;

    // Score for creative professionals
    if (practices.includes('Creative expression')) scores['creative-professionals'] += 3;
    if (depth === 'deep' || depth === 'balanced') scores['creative-professionals'] += 1;

    // Score for AI-curious (default moderate score)
    scores['ai-curious'] = 2;
    if (practices.includes('None of these')) scores['ai-curious'] += 2;

    // Find highest scoring cohort
    let maxScore = 0;
    for (const [cohortType, score] of Object.entries(scores)) {
      if (score > maxScore) {
        maxScore = score;
        cohort = cohortType as CohortType;
      }
    }

    // Store assignment
    this.cohortAssignments.set(userId, cohort);
    
    // Persist to database
    await this.persistCohortAssignment(userId, cohort, onboardingResponses);
    
    return cohort;
  }

  async trackSession(
    userId: string,
    sessionId: string,
    metrics: Partial<SessionMetrics['metrics']>
  ): Promise<void> {
    const cohort = this.cohortAssignments.get(userId) || 'unclassified';
    
    const existing = this.sessionMetrics.get(sessionId) || {
      userId,
      sessionId,
      cohort,
      startTime: new Date(),
      metrics: {
        messageCount: 0,
        avgResponseTime: 0,
        depthChanges: 0,
        densityChanges: 0,
        escapeHatches: 0,
        presenceRequests: 0,
        completionType: 'ongoing' as const,
        engagementScore: 0,
        resonanceIndicators: {
          longPauses: 0,
          deepShares: 0,
          gratitudeExpressions: 0,
          returnToTopics: 0
        }
      },
      qualitativeMarkers: {
        hadBreakthrough: false,
        expressedFrustration: false,
        requestedMoreStructure: false,
        enteredFlowState: false
      }
    };

    // Update metrics
    existing.metrics = { ...existing.metrics, ...metrics };
    
    // Calculate engagement score
    existing.metrics.engagementScore = this.calculateEngagementScore(existing.metrics);
    
    this.sessionMetrics.set(sessionId, existing);
    
    // Persist updates periodically
    if (existing.metrics.messageCount % 10 === 0) {
      await this.persistSessionMetrics(existing);
    }
  }

  private calculateEngagementScore(metrics: SessionMetrics['metrics']): number {
    let score = 50; // Base score
    
    // Positive indicators
    score += Math.min(metrics.messageCount * 2, 20); // Up to 20 points for messages
    score += metrics.resonanceIndicators.deepShares * 5; // 5 points per deep share
    score += metrics.resonanceIndicators.gratitudeExpressions * 3; // 3 points per gratitude
    score += metrics.resonanceIndicators.returnToTopics * 2; // 2 points per return
    
    // Negative indicators
    score -= metrics.escapeHatches * 10; // -10 per escape hatch
    score -= metrics.depthChanges > 5 ? (metrics.depthChanges - 5) * 2 : 0; // Penalty for too many changes
    
    // Normalize to 0-100
    return Math.max(0, Math.min(100, score));
  }

  async analyzeCohortPatterns(
    startDate: Date,
    endDate: Date
  ): Promise<Record<CohortType, any>> {
    const { data, error } = await supabase
      .from('session_metrics')
      .select('*')
      .gte('start_time', startDate.toISOString())
      .lte('start_time', endDate.toISOString());

    if (error) {
      console.error('Failed to fetch cohort data:', error);
      return {} as Record<CohortType, any>;
    }

    const cohortAnalysis: Record<string, any> = {};
    
    // Group by cohort
    const cohortGroups = data.reduce((acc, session) => {
      const cohort = session.cohort || 'unclassified';
      if (!acc[cohort]) acc[cohort] = [];
      acc[cohort].push(session);
      return acc;
    }, {} as Record<string, any[]>);

    // Analyze each cohort
    for (const [cohort, sessions] of Object.entries(cohortGroups)) {
      const analysis = {
        totalSessions: sessions.length,
        uniqueUsers: new Set(sessions.map(s => s.user_id)).size,
        avgSessionLength: this.average(sessions.map(s => s.metrics.messageCount)),
        avgEngagement: this.average(sessions.map(s => s.metrics.engagementScore)),
        escapeHatchRate: this.average(sessions.map(s => s.metrics.escapeHatches)),
        completionRates: {
          natural: sessions.filter(s => s.metrics.completionType === 'natural').length,
          abrupt: sessions.filter(s => s.metrics.completionType === 'abrupt').length
        },
        depthPreferences: {
          surface: sessions.filter(s => s.metrics.depthChanges === 0).length,
          dynamic: sessions.filter(s => s.metrics.depthChanges > 2).length
        },
        qualitativeInsights: {
          breakthroughRate: sessions.filter(s => s.qualitativeMarkers?.hadBreakthrough).length / sessions.length,
          frustrationRate: sessions.filter(s => s.qualitativeMarkers?.expressedFrustration).length / sessions.length,
          flowStateRate: sessions.filter(s => s.qualitativeMarkers?.enteredFlowState).length / sessions.length
        }
      };
      
      cohortAnalysis[cohort] = analysis;
    }

    return cohortAnalysis as Record<CohortType, any>;
  }

  private average(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    return numbers.reduce((a, b) => a + b, 0) / numbers.length;
  }

  async getRecommendations(cohort: CohortType): Promise<string[]> {
    const recommendations: string[] = [];
    
    switch(cohort) {
      case 'contemplative-practitioners':
        recommendations.push('Enable deeper presence modes');
        recommendations.push('Reduce explanation text');
        recommendations.push('Increase silence comfort');
        break;
        
      case 'therapy-adjacent':
        recommendations.push('Offer gentle structure options');
        recommendations.push('Include validation phrases');
        recommendations.push('Monitor for therapy-seeking language');
        break;
        
      case 'ai-curious':
        recommendations.push('Provide subtle education about witness model');
        recommendations.push('Include optional "how this works" explanations');
        recommendations.push('Track novelty responses');
        break;
        
      case 'seeking-exploration':
        recommendations.push('Emphasize open-ended questions');
        recommendations.push('Celebrate uncertainty');
        recommendations.push('Offer diverse exploration paths');
        break;
    }
    
    return recommendations;
  }

  private async persistCohortAssignment(
    userId: string,
    cohort: CohortType,
    onboardingData: Record<string, any>
  ): Promise<void> {
    try {
      await supabase.from('user_cohorts').upsert({
        user_id: userId,
        cohort_type: cohort,
        onboarding_data: onboardingData,
        assigned_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to persist cohort assignment:', error);
    }
  }

  private async persistSessionMetrics(metrics: SessionMetrics): Promise<void> {
    try {
      await supabase.from('session_metrics').upsert({
        session_id: metrics.sessionId,
        user_id: metrics.userId,
        cohort: metrics.cohort,
        start_time: metrics.startTime,
        end_time: metrics.endTime,
        metrics: metrics.metrics,
        qualitative_markers: metrics.qualitativeMarkers
      });
    } catch (error) {
      console.error('Failed to persist session metrics:', error);
    }
  }

  // Generate cohort comparison report
  async generateCohortReport(): Promise<string> {
    const analysis = await this.analyzeCohortPatterns(
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
      new Date()
    );

    let report = '# Maya Beta Cohort Analysis\n\n';
    
    for (const [cohort, data] of Object.entries(analysis)) {
      report += `## ${cohort}\n`;
      report += `- Sessions: ${data.totalSessions}\n`;
      report += `- Users: ${data.uniqueUsers}\n`;
      report += `- Avg Engagement: ${data.avgEngagement.toFixed(1)}/100\n`;
      report += `- Escape Hatch Rate: ${data.escapeHatchRate.toFixed(2)}\n`;
      report += `- Flow State Rate: ${(data.qualitativeInsights.flowStateRate * 100).toFixed(1)}%\n`;
      report += `- Breakthrough Rate: ${(data.qualitativeInsights.breakthroughRate * 100).toFixed(1)}%\n\n`;
    }

    report += '## Key Insights\n';
    report += this.generateInsights(analysis);

    return report;
  }

  private generateInsights(analysis: Record<string, any>): string {
    const insights: string[] = [];
    
    // Find cohort with highest engagement
    let maxEngagement = 0;
    let maxCohort = '';
    for (const [cohort, data] of Object.entries(analysis)) {
      if (data.avgEngagement > maxEngagement) {
        maxEngagement = data.avgEngagement;
        maxCohort = cohort;
      }
    }
    insights.push(`- Highest engagement: ${maxCohort} (${maxEngagement.toFixed(1)}/100)`);
    
    // Find cohort with most escape hatches
    let maxEscapes = 0;
    let escapeCohort = '';
    for (const [cohort, data] of Object.entries(analysis)) {
      if (data.escapeHatchRate > maxEscapes) {
        maxEscapes = data.escapeHatchRate;
        escapeCohort = cohort;
      }
    }
    if (maxEscapes > 1) {
      insights.push(`- ${escapeCohort} needs more structure (${maxEscapes.toFixed(1)} escape hatches/session)`);
    }
    
    return insights.join('\n');
  }
}