/**
 * 📊 Simple Analytics Implementation
 * 
 * Basic analytics service that stores metrics in memory with optional
 * persistence. Can be easily upgraded to dedicated analytics services later.
 */

import type { IAnalytics, AnalyticsEvent, UserMetrics, SystemMetrics } from '../interfaces';
import { logger } from '../../utils/logger';

interface StoredEvent extends AnalyticsEvent {
  id: string;
  timestamp: Date;
}

export class SimpleAnalytics implements IAnalytics {
  private events: StoredEvent[] = [];
  private readonly maxEvents: number;
  private readonly persistenceEnabled: boolean;

  constructor(options: { 
    maxEvents?: number; 
    persistenceEnabled?: boolean; 
  } = {}) {
    this.maxEvents = options.maxEvents || 10000;
    this.persistenceEnabled = options.persistenceEnabled || false;

    // Cleanup old events every hour
    setInterval(() => {
      this.cleanupOldEvents();
    }, 3600000);
  }

  /**
   * Emit an analytics event
   */
  emit(event: AnalyticsEvent): void {
    try {
      const storedEvent: StoredEvent = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: event.timestamp || new Date(),
        ...event
      };

      this.events.push(storedEvent);

      // Maintain max size
      if (this.events.length > this.maxEvents) {
        this.events.shift();
      }

      // Log important events
      if (this.shouldLogEvent(event)) {
        logger.info('Analytics event', {
          type: event.type,
          userId: event.userId,
          properties: event.properties
        });
      }

      // TODO: If persistence is enabled, write to database
      if (this.persistenceEnabled) {
        this.persistEvent(storedEvent);
      }

    } catch (error) {
      logger.error('Failed to emit analytics event', {
        eventType: event.type,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get user metrics for a specific time range
   */
  async getUserMetrics(userId: string, timeRange?: { start: Date; end: Date }): Promise<UserMetrics> {
    try {
      const userEvents = this.events.filter(event => {
        if (event.userId !== userId) return false;
        
        if (timeRange) {
          return event.timestamp >= timeRange.start && event.timestamp <= timeRange.end;
        }
        
        return true;
      });

      // Calculate session metrics
      const chatEvents = userEvents.filter(e => e.type === 'chat.completed');
      const sessionIds = new Set(chatEvents.map(e => e.properties.sessionId as string).filter(Boolean));
      
      // Calculate element preferences
      const elementCounts = new Map<string, number>();
      chatEvents.forEach(event => {
        const element = event.properties.element as string;
        if (element) {
          elementCounts.set(element, (elementCounts.get(element) || 0) + 1);
        }
      });

      const favoriteElements = Array.from(elementCounts.entries())
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([element]) => element);

      // Calculate session lengths (simplified)
      const sessionLengths = Array.from(sessionIds).map(sessionId => {
        const sessionEvents = chatEvents.filter(e => e.properties.sessionId === sessionId);
        return sessionEvents.length;
      });

      const averageSessionLength = sessionLengths.length > 0 
        ? sessionLengths.reduce((sum, len) => sum + len, 0) / sessionLengths.length 
        : 0;

      // Calculate consciousness growth (simplified)
      const consciousnessLevels = chatEvents
        .map(e => e.properties.consciousness_level as number)
        .filter(Boolean);
      
      const consciousnessGrowth = consciousnessLevels.length > 1
        ? consciousnessLevels[consciousnessLevels.length - 1] - consciousnessLevels[0]
        : 0;

      return {
        userId,
        totalSessions: sessionIds.size,
        totalQueries: chatEvents.length,
        averageSessionLength,
        favoriteElements,
        consciousnessGrowth
      };

    } catch (error) {
      logger.error('Failed to get user metrics', { userId, error });
      throw error;
    }
  }

  /**
   * Get system-wide metrics
   */
  async getSystemMetrics(): Promise<SystemMetrics> {
    try {
      const now = new Date();
      const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const recentEvents = this.events.filter(e => e.timestamp >= twentyFourHoursAgo);
      const chatEvents = this.events.filter(e => e.type === 'chat.completed');
      const errorEvents = this.events.filter(e => e.type === 'chat.error');

      // Calculate unique users
      const allUsers = new Set(this.events.map(e => e.userId).filter(Boolean));
      const activeUsers24h = new Set(recentEvents.map(e => e.userId).filter(Boolean));

      // Calculate average response time
      const latencies = chatEvents
        .map(e => e.properties.latencyMs as number)
        .filter(Boolean);
      
      const averageResponseTime = latencies.length > 0
        ? latencies.reduce((sum, lat) => sum + lat, 0) / latencies.length
        : 0;

      // Calculate error rate
      const totalRequests = chatEvents.length + errorEvents.length;
      const errorRate = totalRequests > 0 ? (errorEvents.length / totalRequests) * 100 : 0;

      // Determine system health
      let systemHealth: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
      if (errorRate > 10) systemHealth = 'unhealthy';
      else if (errorRate > 5 || averageResponseTime > 5000) systemHealth = 'degraded';

      return {
        totalUsers: allUsers.size,
        activeUsers24h: activeUsers24h.size,
        totalQueries: chatEvents.length,
        averageResponseTime,
        errorRate,
        systemHealth
      };

    } catch (error) {
      logger.error('Failed to get system metrics', { error });
      throw error;
    }
  }

  /**
   * Get event history for debugging
   */
  getEventHistory(eventType?: string, userId?: string, limit = 100): StoredEvent[] {
    let filteredEvents = this.events;

    if (eventType) {
      filteredEvents = filteredEvents.filter(e => e.type === eventType);
    }

    if (userId) {
      filteredEvents = filteredEvents.filter(e => e.userId === userId);
    }

    return filteredEvents.slice(-limit);
  }

  /**
   * Get analytics statistics
   */
  getStats(): {
    totalEvents: number;
    eventTypes: string[];
    uniqueUsers: number;
    oldestEvent?: Date;
    newestEvent?: Date;
  } {
    const uniqueUsers = new Set(this.events.map(e => e.userId).filter(Boolean));
    const eventTypes = Array.from(new Set(this.events.map(e => e.type)));

    return {
      totalEvents: this.events.length,
      eventTypes,
      uniqueUsers: uniqueUsers.size,
      oldestEvent: this.events[0]?.timestamp,
      newestEvent: this.events[this.events.length - 1]?.timestamp
    };
  }

  /**
   * Private: Should this event be logged?
   */
  private shouldLogEvent(event: AnalyticsEvent): boolean {
    const importantEvents = ['chat.completed', 'chat.error', 'user.registered', 'breakthrough.detected'];
    return importantEvents.includes(event.type);
  }

  /**
   * Private: Persist event to storage (stub for future implementation)
   */
  private async persistEvent(event: StoredEvent): Promise<void> {
    // TODO: Implement database persistence
    // This could write to Supabase events table for permanent storage
  }

  /**
   * Private: Clean up old events to prevent memory bloat
   */
  private cleanupOldEvents(): void {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const initialSize = this.events.length;
    
    this.events = this.events.filter(event => event.timestamp > oneWeekAgo);
    
    const cleaned = initialSize - this.events.length;
    if (cleaned > 0) {
      logger.debug('Analytics cleanup completed', { 
        eventsRemoved: cleaned,
        remainingEvents: this.events.length 
      });
    }
  }
}