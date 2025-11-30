/**
 * 🌐 AIN Event Emitter - Local Event Spine
 * 
 * This provides event-driven architecture benefits today with easy migration
 * to message bus (Redis/NATS/Kafka) later. Enables:
 * 
 * - Decoupled services communication
 * - Analytics and monitoring
 * - Future microservices preparation
 * - Circuit breaker patterns
 * 
 * Usage:
 *   eventEmitter.emit({ type: 'chat.completed', userId: '123', ... });
 *   eventEmitter.on('chat.completed', (event) => { ... });
 */

import { EventEmitter as NodeEventEmitter } from 'events';
import type { IEventEmitter, SystemEvent, AnalyticsEvent } from '../interfaces';
import { logger } from '../../utils/logger';

export class AINEventEmitter extends NodeEventEmitter implements IEventEmitter {
  private subscribers: Map<string, Set<(event: SystemEvent) => void>> = new Map();
  private eventHistory: SystemEvent[] = [];
  private readonly maxHistorySize = 1000;

  constructor() {
    super();
    this.setMaxListeners(100); // Allow many subscribers
  }

  /**
   * Emit a system event
   */
  emitSystemEvent(event: SystemEvent): boolean {
    try {
      // Store in local history for debugging/replay
      this.eventHistory.push(event);
      if (this.eventHistory.length > this.maxHistorySize) {
        this.eventHistory.shift();
      }

      // Log important events
      if (this.shouldLogEvent(event)) {
        logger.debug('Event emitted', {
          type: event.type,
          source: event.source,
          hasPayload: Object.keys(event.payload || {}).length > 0
        });
      }

      // Emit to Node.js EventEmitter (for backward compatibility)
      super.emit(event.type, event);

      // Emit to our custom subscribers
      const subscribers = this.subscribers.get(event.type) || new Set();
      subscribers.forEach(handler => {
        try {
          handler(event);
        } catch (error) {
          logger.error('Event handler failed', {
            eventType: event.type,
            eventId: event.id,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      });

      // Handle broadcasting
      if (event.routing?.broadcast) {
        this.subscribers.forEach((handlers, eventType) => {
          if (eventType !== event.type) {
            handlers.forEach(handler => {
              try {
                handler(event);
              } catch (error) {
                logger.error('Broadcast handler failed', {
                  eventType: event.type,
                  broadcastTo: eventType,
                  error: error instanceof Error ? error.message : 'Unknown error'
                });
              }
            });
          }
        });
      }

      return true;
    } catch (error) {
      logger.error('Failed to emit event', {
        eventType: event.type,
        eventId: event.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return false;
    }
  }

  /**
   * Subscribe to system events
   */
  onSystemEvent(eventType: string, handler: (event: SystemEvent) => void): void {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, new Set());
    }
    this.subscribers.get(eventType)!.add(handler);

    // Also register with Node.js EventEmitter for compatibility
    super.on(eventType, handler);
  }

  /**
   * Unsubscribe from system events
   */
  offSystemEvent(eventType: string, handler: (event: SystemEvent) => void): void {
    const subscribers = this.subscribers.get(eventType);
    if (subscribers) {
      subscribers.delete(handler);
      if (subscribers.size === 0) {
        this.subscribers.delete(eventType);
      }
    }

    // Also remove from Node.js EventEmitter
    super.off(eventType, handler);
  }

  /**
   * Subscribe to system events once
   */
  onceSystemEvent(eventType: string, handler: (event: SystemEvent) => void): void {
    const onceHandler = (event: SystemEvent) => {
      handler(event);
      this.offSystemEvent(eventType, onceHandler);
    };
    this.onSystemEvent(eventType, onceHandler);
  }

  /**
   * Get event history for debugging
   */
  getEventHistory(eventType?: string, limit = 100): SystemEvent[] {
    let events = this.eventHistory;
    
    if (eventType) {
      events = events.filter(e => e.type === eventType);
    }
    
    return events.slice(-limit);
  }

  /**
   * Get current subscriber count
   */
  getSubscriberCount(eventType?: string): number {
    if (eventType) {
      return this.subscribers.get(eventType)?.size || 0;
    }
    
    let total = 0;
    this.subscribers.forEach(subscribers => {
      total += subscribers.size;
    });
    return total;
  }

  /**
   * Get all subscribed event types
   */
  getSubscribedEventTypes(): string[] {
    return Array.from(this.subscribers.keys());
  }

  /**
   * Clear all subscribers (useful for testing)
   */
  clearAllSubscribers(): void {
    this.subscribers.clear();
    this.removeAllListeners();
  }

  /**
   * Create a typed event emitter for analytics
   */
  createAnalyticsEmitter(): (event: AnalyticsEvent) => void {
    return (event: AnalyticsEvent) => {
      const systemEvent: SystemEvent = {
        id: `analytics-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: `analytics.${event.type}`,
        timestamp: event.timestamp || new Date(),
        source: 'analytics',
        payload: {
          userId: event.userId,
          ...event.properties
        }
      };
      
      this.emitSystemEvent(systemEvent);
    };
  }

  /**
   * Private: Determine if event should be logged
   */
  private shouldLogEvent(event: SystemEvent): boolean {
    // Don't log high-frequency events to avoid spam
    const highFrequencyEvents = ['heartbeat', 'metrics.sample'];
    return !highFrequencyEvents.includes(event.type);
  }
}

/**
 * Built-in event listeners for common patterns
 */
export class EventSubscribers {
  
  /**
   * Analytics event logger
   */
  static createAnalyticsLogger(eventEmitter: IEventEmitter): void {
    eventEmitter.onSystemEvent('analytics.*', (event) => {
      logger.info('Analytics event', {
        type: event.type.replace('analytics.', ''),
        userId: event.payload.userId,
        properties: event.payload
      });
    });
  }

  /**
   * Rate limiting and quota tracker
   */
  static createQuotaTracker(eventEmitter: IEventEmitter): void {
    const userQuotas = new Map<string, { count: number; resetTime: number }>();
    
    eventEmitter.onSystemEvent('chat.completed', (event) => {
      const userId = event.payload.userId as string;
      if (!userId) return;

      const now = Date.now();
      const hourlyResetTime = now + (60 * 60 * 1000);
      
      if (!userQuotas.has(userId) || now > userQuotas.get(userId)!.resetTime) {
        userQuotas.set(userId, { count: 1, resetTime: hourlyResetTime });
      } else {
        const quota = userQuotas.get(userId)!;
        quota.count++;
      }
      
      // Emit quota event for monitoring
      eventEmitter.emitSystemEvent({
        id: `quota-${now}`,
        type: 'quota.updated',
        timestamp: new Date(),
        source: 'quota-tracker',
        payload: {
          userId,
          currentUsage: userQuotas.get(userId)!.count,
          resetTime: userQuotas.get(userId)!.resetTime
        }
      });
    });
  }

  /**
   * System health monitor
   */
  static createHealthMonitor(eventEmitter: IEventEmitter): void {
    const healthMetrics = {
      totalRequests: 0,
      errorCount: 0,
      averageLatency: 0,
      latencySum: 0
    };

    // Track successful requests
    eventEmitter.onSystemEvent('chat.completed', (event) => {
      healthMetrics.totalRequests++;
      const latency = event.payload.latencyMs as number;
      if (latency) {
        healthMetrics.latencySum += latency;
        healthMetrics.averageLatency = healthMetrics.latencySum / healthMetrics.totalRequests;
      }
    });

    // Track errors
    eventEmitter.onSystemEvent('chat.error', () => {
      healthMetrics.errorCount++;
    });

    // Emit health metrics every minute
    setInterval(() => {
      eventEmitter.emitSystemEvent({
        id: `health-${Date.now()}`,
        type: 'system.health',
        timestamp: new Date(),
        source: 'health-monitor',
        payload: {
          ...healthMetrics,
          errorRate: healthMetrics.totalRequests > 0 
            ? (healthMetrics.errorCount / healthMetrics.totalRequests) * 100 
            : 0
        }
      });
    }, 60000); // Every minute
  }
}

// Export singleton instance
export const ainEventEmitter = new AINEventEmitter();