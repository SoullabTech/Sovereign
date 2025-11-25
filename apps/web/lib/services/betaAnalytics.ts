import { sessionStorage, SessionData } from './sessionStorage';

interface BetaMetrics {
  totalSessions: number;
  uniqueUsers: number;
  averageSessionsPerUser: number;
  elementalDistribution: Record<string, number>;
  spiralProgress: Record<string, number>;
  commonReflections: string[];
  userEngagement: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  sessionTimeline: Array<{
    date: string;
    count: number;
  }>;
}

interface UserJourney {
  userId: string;
  sessions: SessionData[];
  elementalEvolution: Array<{
    timestamp: string;
    dominant: string;
    balance: Record<string, number>;
  }>;
  spiralPath: Array<{
    timestamp: string;
    element: string;
    stage: number;
  }>;
  insights: {
    dominantElement: string;
    currentStage: string;
    growthPattern: string;
  };
}

class BetaAnalyticsService {
  constructor(private storage = sessionStorage) {}

  async collectBetaMetrics(): Promise<BetaMetrics | null> {
    try {
      // This would typically query Supabase directly for aggregate data
      // For now, we'll simulate with available methods
      console.log('[BetaAnalytics] Collecting beta metrics...');

      // Mock implementation - replace with actual Supabase queries
      const metrics: BetaMetrics = {
        totalSessions: 0,
        uniqueUsers: 0,
        averageSessionsPerUser: 0,
        elementalDistribution: {},
        spiralProgress: {},
        commonReflections: [],
        userEngagement: {
          daily: 0,
          weekly: 0,
          monthly: 0
        },
        sessionTimeline: []
      };

      return metrics;
    } catch (error) {
      console.error('[BetaAnalytics] Failed to collect metrics:', error);
      return null;
    }
  }

  async trackUserJourney(userId: string): Promise<UserJourney | null> {
    try {
      const sessions = await this.storage.getUserSessions(userId, 100);

      if (!sessions || sessions.length === 0) {
        return null;
      }

      const elementalEvolution = this.analyzeElementalEvolution(sessions);
      const spiralPath = this.analyzeSpiralPath(sessions);
      const insights = this.generateInsights(elementalEvolution, spiralPath);

      return {
        userId,
        sessions,
        elementalEvolution,
        spiralPath,
        insights
      };
    } catch (error) {
      console.error('[BetaAnalytics] Failed to track user journey:', error);
      return null;
    }
  }

  private analyzeElementalEvolution(sessions: SessionData[]): UserJourney['elementalEvolution'] {
    return sessions.map(session => {
      const elements = session.elements || {};
      const dominant = Object.entries(elements)
        .sort(([, a], [, b]) => (b as number) - (a as number))[0]?.[0] || 'balanced';

      return {
        timestamp: session.metadata?.timestamp || new Date().toISOString(),
        dominant,
        balance: elements as Record<string, number>
      };
    });
  }

  private analyzeSpiralPath(sessions: SessionData[]): UserJourney['spiralPath'] {
    return sessions
      .filter(s => s.spiral_stage)
      .map(session => ({
        timestamp: session.metadata?.timestamp || new Date().toISOString(),
        element: session.spiral_stage!.element,
        stage: session.spiral_stage!.stage
      }));
  }

  private generateInsights(
    evolution: UserJourney['elementalEvolution'],
    path: UserJourney['spiralPath']
  ): UserJourney['insights'] {
    // Calculate dominant element
    const elementCounts: Record<string, number> = {};
    evolution.forEach(e => {
      elementCounts[e.dominant] = (elementCounts[e.dominant] || 0) + 1;
    });
    const dominantElement = Object.entries(elementCounts)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || 'balanced';

    // Determine current stage
    const latestStage = path[path.length - 1];
    const currentStage = latestStage
      ? `${latestStage.element}-${latestStage.stage}`
      : 'beginning';

    // Analyze growth pattern
    const stages = path.map(p => p.stage);
    const avgStage = stages.reduce((a, b) => a + b, 0) / stages.length;
    const growthPattern = avgStage > 2 ? 'integrative' :
                         avgStage > 1.5 ? 'deepening' :
                         'exploratory';

    return {
      dominantElement,
      currentStage,
      growthPattern
    };
  }

  async generateBetaReport(): Promise<string> {
    try {
      const metrics = await this.collectBetaMetrics();

      if (!metrics) {
        return 'Unable to generate beta report - no metrics available';
      }

      const report = `
# Beta Session Analytics Report
Generated: ${new Date().toISOString()}

## Overview
- Total Sessions: ${metrics.totalSessions}
- Unique Users: ${metrics.uniqueUsers}
- Avg Sessions/User: ${metrics.averageSessionsPerUser.toFixed(2)}

## Engagement
- Daily Active: ${metrics.userEngagement.daily}
- Weekly Active: ${metrics.userEngagement.weekly}
- Monthly Active: ${metrics.userEngagement.monthly}

## Elemental Distribution
${Object.entries(metrics.elementalDistribution)
  .map(([element, count]) => `- ${element}: ${count}`)
  .join('\n')}

## Spiral Progress
${Object.entries(metrics.spiralProgress)
  .map(([stage, count]) => `- ${stage}: ${count}`)
  .join('\n')}

## Common Reflections
${metrics.commonReflections.slice(0, 5)
  .map((r, i) => `${i + 1}. ${r}`)
  .join('\n')}
`;

      return report;
    } catch (error) {
      console.error('[BetaAnalytics] Failed to generate report:', error);
      return 'Error generating beta report';
    }
  }

  async exportBetaData(format: 'json' | 'csv' = 'json'): Promise<string | null> {
    try {
      const metrics = await this.collectBetaMetrics();

      if (!metrics) {
        return null;
      }

      if (format === 'json') {
        return JSON.stringify(metrics, null, 2);
      }

      // CSV export would go here
      return null;
    } catch (error) {
      console.error('[BetaAnalytics] Failed to export data:', error);
      return null;
    }
  }
}

// Export singleton
export const betaAnalytics = new BetaAnalyticsService();

// Export types
export type { BetaMetrics, UserJourney };