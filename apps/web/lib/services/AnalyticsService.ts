/**
 * Unified Analytics Service
 * Consolidates analytics tracking, emotional analysis, and archetype insights
 */

import { 
  IAnalyticsService,
  IDatabaseService,
  IEventBusService,
  AnalyticsEvent,
  EmotionalAnalysis,
  ArchetypeInsight,
  EmotionalState,
  ServiceTokens 
} from '../core/ServiceTokens';
import { ServiceContainer } from '../core/ServiceContainer';

export interface AnalyticsConfig {
  enableRealTimeTracking: boolean;
  batchSize: number;
  flushInterval: number;
  enableEmotionalAnalysis: boolean;
  enableArchetypeTracking: boolean;
}

export interface ArchetypeGrowthData {
  archetype: string;
  previousScore: number;
  currentScore: number;
  growth: number;
  confidence: number;
}

export interface UserAnalyticsSummary {
  userId: string;
  timeframe: string;
  totalEvents: number;
  emotionalTrend: 'improving' | 'stable' | 'concerning';
  dominantArchetype: string;
  archetypeGrowth: Record<string, number>;
  engagementScore: number;
  lastActive: Date;
}

export class AnalyticsService implements IAnalyticsService {
  private config: AnalyticsConfig;
  private eventBatch: AnalyticsEvent[] = [];
  private flushTimer?: NodeJS.Timeout;

  constructor(
    private container: ServiceContainer,
    config?: Partial<AnalyticsConfig>
  ) {
    this.config = {
      enableRealTimeTracking: true,
      batchSize: 100,
      flushInterval: 30000, // 30 seconds
      enableEmotionalAnalysis: true,
      enableArchetypeTracking: true,
      ...config
    };

    this.startBatchFlushTimer();
  }

  /**
   * Track an analytics event
   */
  async trackEvent(userId: string, event: AnalyticsEvent): Promise<void> {
    try {
      const enrichedEvent: AnalyticsEvent = {
        ...event,
        userId: event.userId || userId,
        timestamp: event.timestamp || new Date(),
        data: {
          ...event.data,
          sessionId: this.getCurrentSessionId(userId),
          userAgent: this.getUserAgent(),
          platform: 'web'
        }
      };

      if (this.config.enableRealTimeTracking) {
        // Store immediately for real-time analytics
        await this.storeEvent(enrichedEvent);
      } else {
        // Add to batch for periodic flush
        this.eventBatch.push(enrichedEvent);
        
        if (this.eventBatch.length >= this.config.batchSize) {
          await this.flushEventBatch();
        }
      }

      // Publish event for real-time subscribers
      const eventBus = await this.container.resolve(ServiceTokens.EventBusService);
      await eventBus.publish({
        id: `analytics_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'analytics.event.tracked',
        userId,
        data: enrichedEvent,
        timestamp: new Date()
      });

      // Trigger specialized analysis based on event type
      await this.handleSpecializedAnalysis(enrichedEvent);

    } catch (error) {
      console.error('Analytics tracking error:', error);
      // Don&apos;t throw - analytics should never break the user experience
    }
  }

  /**
   * Get emotional analysis for a user
   */
  async getEmotionalAnalysis(userId: string, timeframe: string = '7d'): Promise<EmotionalAnalysis> {
    const databaseService = await this.container.resolve(ServiceTokens.DatabaseService);
    const timeframeDate = this.getTimeframeDate(timeframe);

    // Get emotional events within timeframe
    const emotionalEvents = await databaseService.query<any>(
      `SELECT data, timestamp FROM analytics_events 
       WHERE user_id = ? AND type IN ('emotion.analysis', 'conversation.completed') 
       AND timestamp >= ? 
       ORDER BY timestamp DESC`,
      [userId, timeframeDate.toISOString()]
    );

    if (emotionalEvents.length === 0) {
      return {
        current: { valence: 0, arousal: 0.5, dominance: 0.5, confidence: 0 },
        trend: 'stable',
        insights: ['No recent emotional data available']
      };
    }

    // Calculate current emotional state (weighted average of recent events)
    const currentState = this.calculateCurrentEmotionalState(emotionalEvents);
    
    // Determine trend by comparing first half vs second half of timeframe
    const trend = this.calculateEmotionalTrend(emotionalEvents);
    
    // Generate insights
    const insights = this.generateEmotionalInsights(currentState, emotionalEvents);

    return {
      current: currentState,
      trend,
      insights
    };
  }

  /**
   * Get archetype insights for a user
   */
  async getArchetypeInsights(userId: string, timeframe: string = '7d'): Promise<ArchetypeInsight[]> {
    const databaseService = await this.container.resolve(ServiceTokens.DatabaseService);
    const timeframeDate = this.getTimeframeDate(timeframe);

    // Get archetype activation events
    const archetypeEvents = await databaseService.query<any>(
      `SELECT data, timestamp FROM analytics_events 
       WHERE user_id = ? AND type LIKE 'archetype.%' 
       AND timestamp >= ? 
       ORDER BY timestamp DESC`,
      [userId, timeframeDate.toISOString()]
    );

    // Group by archetype and calculate insights
    const archetypeData = this.groupArchetypeData(archetypeEvents);
    const insights: ArchetypeInsight[] = [];

    for (const [archetype, events] of Object.entries(archetypeData)) {
      const strength = this.calculateArchetypeStrength(events);
      const growth = this.calculateArchetypeGrowth(events);
      const themes = this.extractArchetypeThemes(events);
      const guidance = this.generateArchetypeGuidance(archetype, strength, growth);

      insights.push({
        archetype,
        strength,
        growth,
        themes,
        guidance
      });
    }

    // Sort by strength and return top insights
    return insights
      .sort((a, b) => b.strength - a.strength)
      .slice(0, 6); // Top 6 archetypes
  }

  /**
   * Get comprehensive user analytics summary
   */
  async getUserAnalyticsSummary(userId: string, timeframe: string = '30d'): Promise<UserAnalyticsSummary> {
    const databaseService = await this.container.resolve(ServiceTokens.DatabaseService);
    const timeframeDate = this.getTimeframeDate(timeframe);

    // Get all events for user in timeframe
    const events = await databaseService.query<any>(
      `SELECT type, data, timestamp FROM analytics_events 
       WHERE user_id = ? AND timestamp >= ? 
       ORDER BY timestamp DESC`,
      [userId, timeframeDate.toISOString()]
    );

    // Calculate engagement score
    const engagementScore = this.calculateEngagementScore(events, timeframe);
    
    // Get emotional trend
    const emotionalAnalysis = await this.getEmotionalAnalysis(userId, timeframe);
    
    // Get archetype insights
    const archetypeInsights = await this.getArchetypeInsights(userId, timeframe);
    const dominantArchetype = archetypeInsights[0]?.archetype || 'Seeker';
    
    // Calculate archetype growth
    const archetypeGrowth: Record<string, number> = {};
    archetypeInsights.forEach(insight => {
      archetypeGrowth[insight.archetype] = insight.growth;
    });

    return {
      userId,
      timeframe,
      totalEvents: events.length,
      emotionalTrend: emotionalAnalysis.trend,
      dominantArchetype,
      archetypeGrowth,
      engagementScore,
      lastActive: events.length > 0 ? new Date(events[0].timestamp) : new Date()
    };
  }

  /**
   * Get analytics for multiple users (collective insights)
   */
  async getCollectiveAnalytics(timeframe: string = '7d'): Promise<any> {
    const databaseService = await this.container.resolve(ServiceTokens.DatabaseService);
    const timeframeDate = this.getTimeframeDate(timeframe);

    // Get aggregated data
    const results = await Promise.all([
      // Total events
      databaseService.query(
        'SELECT COUNT(*) as count FROM analytics_events WHERE timestamp >= ?',
        [timeframeDate.toISOString()]
      ),
      
      // Archetype distribution
      databaseService.query(
        `SELECT JSON_EXTRACT(data, '$.archetype') as archetype, COUNT(*) as count 
         FROM analytics_events 
         WHERE type LIKE 'archetype.%' AND timestamp >= ?
         GROUP BY JSON_EXTRACT(data, '$.archetype')
         ORDER BY count DESC`,
        [timeframeDate.toISOString()]
      ),
      
      // Active users
      databaseService.query(
        'SELECT COUNT(DISTINCT user_id) as count FROM analytics_events WHERE timestamp >= ?',
        [timeframeDate.toISOString()]
      )
    ]);

    const archetypeDistribution: Record<string, number> = {};
    results[1].forEach((row: any) => {
      if (row.archetype) {
        archetypeDistribution[row.archetype] = row.count;
      }
    });

    return {
      timeframe,
      totalEvents: results[0][0].count,
      activeUsers: results[2][0].count,
      archetypeDistribution,
      dominantArchetype: Object.entries(archetypeDistribution)
        .sort(([, a], [, b]) => b - a)[0]?.[0] || 'Seeker'
    };
  }

  /**
   * Store individual event in database
   */
  private async storeEvent(event: AnalyticsEvent): Promise<void> {
    const databaseService = await this.container.resolve(ServiceTokens.DatabaseService);
    
    await databaseService.execute(
      `INSERT INTO analytics_events (id, user_id, type, data, timestamp)
       VALUES (?, ?, ?, ?, ?)`,
      [
        `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        event.userId,
        event.type,
        JSON.stringify(event.data),
        event.timestamp.toISOString()
      ]
    );
  }

  /**
   * Flush batch of events to database
   */
  private async flushEventBatch(): Promise<void> {
    if (this.eventBatch.length === 0) return;

    const databaseService = await this.container.resolve(ServiceTokens.DatabaseService);
    
    await databaseService.transaction(async (tx) => {
      for (const event of this.eventBatch) {
        await tx.execute(
          `INSERT INTO analytics_events (id, user_id, type, data, timestamp)
           VALUES (?, ?, ?, ?, ?)`,
          [
            `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            event.userId,
            event.type,
            JSON.stringify(event.data),
            event.timestamp.toISOString()
          ]
        );
      }
    });

    console.log(`📊 Flushed ${this.eventBatch.length} analytics events`);
    this.eventBatch = [];
  }

  /**
   * Handle specialized analysis for specific event types
   */
  private async handleSpecializedAnalysis(event: AnalyticsEvent): Promise<void> {
    switch (event.type) {
      case 'conversation.completed':
        if (this.config.enableEmotionalAnalysis) {
          await this.analyzeConversationEmotion(event);
        }
        if (this.config.enableArchetypeTracking) {
          await this.analyzeConversationArchetypes(event);
        }
        break;
        
      case 'daimonic.encounter.triggered':
        await this.analyzeDaimonicEncounter(event);
        break;
    }
  }

  /**
   * Analyze emotional content of conversation
   */
  private async analyzeConversationEmotion(event: AnalyticsEvent): Promise<void> {
    if (event.data.emotionalState) {
      await this.trackEvent(event.userId, {
        type: 'emotion.analysis',
        userId: event.userId,
        data: {
          emotionalState: event.data.emotionalState,
          conversationId: event.data.conversationId,
          source: 'conversation'
        },
        timestamp: event.timestamp
      });
    }
  }

  /**
   * Analyze archetype activation in conversation
   */
  private async analyzeConversationArchetypes(event: AnalyticsEvent): Promise<void> {
    if (event.data.archetypeActivation) {
      for (const [archetype, activation] of Object.entries(event.data.archetypeActivation)) {
        if (typeof activation === 'number' && activation > 0.1) {
          await this.trackEvent(event.userId, {
            type: 'archetype.activation',
            userId: event.userId,
            data: {
              archetype,
              activation,
              conversationId: event.data.conversationId,
              source: 'conversation'
            },
            timestamp: event.timestamp
          });
        }
      }
    }
  }

  /**
   * Analyze daimonic encounter
   */
  private async analyzeDaimonicEncounter(event: AnalyticsEvent): Promise<void> {
    await this.trackEvent(event.userId, {
      type: 'archetype.daimonic_encounter',
      userId: event.userId,
      data: {
        archetype: event.data.archetype,
        activation: 1.0, // Daimonic encounters represent maximum archetype activation
        encounterId: event.data.encounterId
      },
      timestamp: event.timestamp
    });
  }

  // Helper methods for calculations
  
  private getTimeframeDate(timeframe: string): Date {
    const now = new Date();
    const match = timeframe.match(/(\d+)([hdwmy])/);
    
    if (!match) return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // Default to 7 days
    
    const amount = parseInt(match[1]);
    const unit = match[2];
    
    switch (unit) {
      case 'h': return new Date(now.getTime() - amount * 60 * 60 * 1000);
      case 'd': return new Date(now.getTime() - amount * 24 * 60 * 60 * 1000);
      case 'w': return new Date(now.getTime() - amount * 7 * 24 * 60 * 60 * 1000);
      case 'm': return new Date(now.getTime() - amount * 30 * 24 * 60 * 60 * 1000);
      case 'y': return new Date(now.getTime() - amount * 365 * 24 * 60 * 60 * 1000);
      default: return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
  }

  private calculateCurrentEmotionalState(events: any[]): EmotionalState {
    if (events.length === 0) {
      return { valence: 0, arousal: 0.5, dominance: 0.5, confidence: 0 };
    }

    let totalValence = 0;
    let totalArousal = 0;
    let totalDominance = 0;
    let count = 0;

    events.forEach(event => {
      const data = JSON.parse(event.data);
      if (data.emotionalState) {
        totalValence += data.emotionalState.valence || 0;
        totalArousal += data.emotionalState.arousal || 0.5;
        totalDominance += data.emotionalState.dominance || 0.5;
        count++;
      }
    });

    return {
      valence: count > 0 ? totalValence / count : 0,
      arousal: count > 0 ? totalArousal / count : 0.5,
      dominance: count > 0 ? totalDominance / count : 0.5,
      confidence: Math.min(count / 10, 1) // Confidence increases with more data points
    };
  }

  private calculateEmotionalTrend(events: any[]): 'improving' | 'stable' | 'concerning' {
    if (events.length < 4) return 'stable';

    const midpoint = Math.floor(events.length / 2);
    const firstHalf = events.slice(midpoint);
    const secondHalf = events.slice(0, midpoint);

    const firstAvg = this.calculateCurrentEmotionalState(firstHalf).valence;
    const secondAvg = this.calculateCurrentEmotionalState(secondHalf).valence;

    const difference = secondAvg - firstAvg;

    if (difference > 0.1) return 'improving';
    if (difference < -0.1) return 'concerning';
    return 'stable';
  }

  private generateEmotionalInsights(state: EmotionalState, events: any[]): string[] {
    const insights: string[] = [];

    if (state.valence > 0.3) {
      insights.push('Your emotional state shows positive trends');
    } else if (state.valence < -0.3) {
      insights.push('Recent interactions suggest processing challenging emotions');
    }

    if (state.arousal > 0.7) {
      insights.push('High energy and engagement levels detected');
    } else if (state.arousal < 0.3) {
      insights.push('Calm and reflective energy patterns observed');
    }

    if (state.confidence < 0.5) {
      insights.push('More interaction data would improve emotional insights');
    }

    return insights.length > 0 ? insights : ['Emotional patterns are within normal ranges'];
  }

  private groupArchetypeData(events: any[]): Record<string, any[]> {
    const grouped: Record<string, any[]> = {};
    
    events.forEach(event => {
      const data = JSON.parse(event.data);
      if (data.archetype) {
        if (!grouped[data.archetype]) {
          grouped[data.archetype] = [];
        }
        grouped[data.archetype].push({ ...data, timestamp: event.timestamp });
      }
    });

    return grouped;
  }

  private calculateArchetypeStrength(events: any[]): number {
    if (events.length === 0) return 0;
    
    const totalActivation = events.reduce((sum, event) => sum + (event.activation || 0), 0);
    return Math.min(totalActivation / events.length, 1);
  }

  private calculateArchetypeGrowth(events: any[]): number {
    if (events.length < 2) return 0;

    const recentEvents = events.slice(0, Math.ceil(events.length / 2));
    const olderEvents = events.slice(Math.ceil(events.length / 2));

    const recentAvg = this.calculateArchetypeStrength(recentEvents);
    const olderAvg = this.calculateArchetypeStrength(olderEvents);

    return (recentAvg - olderAvg) * 100; // Return as percentage
  }

  private extractArchetypeThemes(events: any[]): string[] {
    const themes = new Set<string>();
    events.forEach(event => {
      if (event.themes && Array.isArray(event.themes)) {
        event.themes.forEach((theme: string) => themes.add(theme));
      }
    });
    return Array.from(themes).slice(0, 3); // Top 3 themes
  }

  private generateArchetypeGuidance(archetype: string, strength: number, growth: number): string {
    const guidanceTemplates = {
      Hero: 'Your heroic nature calls for courageous action and facing challenges head-on',
      Sage: 'Wisdom-seeking energy suggests focusing on learning and understanding',
      Creator: 'Creative forces are strong - time to build and express your vision',
      Lover: 'Connection and emotional depth are your current pathways to growth',
      Seeker: 'Your searching nature indicates readiness for new explorations and meaning',
      Shadow: 'Shadow work presents opportunities for integration and wholeness'
    };

    let baseGuidance = guidanceTemplates[archetype as keyof typeof guidanceTemplates] || 'Your archetype brings unique gifts to explore';

    if (growth > 20) {
      baseGuidance += ' - significant growth is occurring';
    } else if (growth < -20) {
      baseGuidance += ' - consider rekindling this aspect of yourself';
    }

    return baseGuidance;
  }

  private calculateEngagementScore(events: any[], timeframe: string): number {
    const conversationEvents = events.filter(e => e.type.startsWith('conversation.'));
    const daimonicEvents = events.filter(e => e.type.startsWith('daimonic.'));
    const memoryEvents = events.filter(e => e.type.startsWith('memory.'));

    // Weight different types of engagement
    const score = (conversationEvents.length * 3) + 
                  (daimonicEvents.length * 5) + 
                  (memoryEvents.length * 2);

    // Normalize based on timeframe
    const timeframeDays = this.getTimeframeDays(timeframe);
    return Math.min(score / timeframeDays, 100); // Max 100 points
  }

  private getTimeframeDays(timeframe: string): number {
    const match = timeframe.match(/(\d+)([hdwmy])/);
    if (!match) return 7;
    
    const amount = parseInt(match[1]);
    const unit = match[2];
    
    switch (unit) {
      case 'h': return amount / 24;
      case 'd': return amount;
      case 'w': return amount * 7;
      case 'm': return amount * 30;
      case 'y': return amount * 365;
      default: return 7;
    }
  }

  private getCurrentSessionId(userId: string): string {
    // In a real implementation, would track user sessions
    return `session_${Date.now()}`;
  }

  private getUserAgent(): string {
    return typeof navigator !== 'undefined' ? navigator.userAgent : 'server';
  }

  private startBatchFlushTimer(): void {
    if (this.config.enableRealTimeTracking) return;
    
    this.flushTimer = setInterval(async () => {
      await this.flushEventBatch();
    }, this.config.flushInterval);
  }

  /**
   * Dispose of the service and cleanup resources
   */
  async dispose(): Promise<void> {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    
    // Flush any remaining events
    await this.flushEventBatch();
    
    console.log('Analytics service disposed');
  }
}