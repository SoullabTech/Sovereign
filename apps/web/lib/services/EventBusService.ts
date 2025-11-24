/**
 * Event Bus Service
 * Provides pub/sub event communication between services
 */

import { IEventBusService, DomainEvent, EventHandler } from '../core/ServiceTokens';

export interface EventSubscription {
  id: string;
  eventType: string;
  handler: EventHandler<any>;
  isActive: boolean;
}

export interface EventBusStats {
  totalSubscriptions: number;
  activeSubscriptions: number;
  eventsPublished: number;
  eventsHandled: number;
  eventTypes: string[];
}

export class EventBusService implements IEventBusService {
  private subscriptions = new Map<string, EventSubscription>();
  private eventTypeSubscriptions = new Map<string, string[]>(); // eventType -> subscriptionIds
  private stats: EventBusStats = {
    totalSubscriptions: 0,
    activeSubscriptions: 0,
    eventsPublished: 0,
    eventsHandled: 0,
    eventTypes: []
  };

  /**
   * Publish an event to all subscribers
   */
  async publish(event: DomainEvent): Promise<void> {
    this.stats.eventsPublished++;
    
    console.log(`📢 Publishing event: ${event.type} (${event.id})`);
    
    // Get subscribers for this event type
    const subscriptionIds = this.eventTypeSubscriptions.get(event.type) || [];
    const handlers: Array<{ subscription: EventSubscription; promise: Promise<void> }> = [];

    // Execute all handlers concurrently
    for (const subscriptionId of subscriptionIds) {
      const subscription = this.subscriptions.get(subscriptionId);
      
      if (subscription && subscription.isActive) {
        const promise = this.executeHandler(subscription, event);
        handlers.push({ subscription, promise });
      }
    }

    // Wait for all handlers to complete (or timeout)
    const results = await Promise.allSettled(
      handlers.map(({ promise }) => this.withTimeout(promise, 10000))
    );

    // Log results
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        this.stats.eventsHandled++;
      } else {
        console.error(
          `Event handler failed for ${handlers[index].subscription.id}:`, 
          result.reason
        );
      }
    });

    // Track new event types
    if (!this.stats.eventTypes.includes(event.type)) {
      this.stats.eventTypes.push(event.type);
    }
  }

  /**
   * Subscribe to events of a specific type
   */
  subscribe<T extends DomainEvent>(
    eventType: string, 
    handler: EventHandler<T>
  ): string {
    const subscriptionId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const subscription: EventSubscription = {
      id: subscriptionId,
      eventType,
      handler,
      isActive: true
    };

    // Store subscription
    this.subscriptions.set(subscriptionId, subscription);
    
    // Add to event type mapping
    if (!this.eventTypeSubscriptions.has(eventType)) {
      this.eventTypeSubscriptions.set(eventType, []);
    }
    this.eventTypeSubscriptions.get(eventType)!.push(subscriptionId);

    // Update stats
    this.stats.totalSubscriptions++;
    this.stats.activeSubscriptions++;
    
    console.log(`📩 New subscription: ${eventType} (${subscriptionId})`);
    
    return subscriptionId;
  }

  /**
   * Unsubscribe from events
   */
  unsubscribe(subscriptionId: string): void {
    const subscription = this.subscriptions.get(subscriptionId);
    
    if (subscription) {
      // Mark as inactive
      subscription.isActive = false;
      
      // Remove from event type mapping
      const subscriptionIds = this.eventTypeSubscriptions.get(subscription.eventType);
      if (subscriptionIds) {
        const index = subscriptionIds.indexOf(subscriptionId);
        if (index > -1) {
          subscriptionIds.splice(index, 1);
        }
      }
      
      // Remove subscription
      this.subscriptions.delete(subscriptionId);
      
      // Update stats
      this.stats.activeSubscriptions--;
      
      console.log(`📪 Unsubscribed: ${subscription.eventType} (${subscriptionId})`);
    }
  }

  /**
   * Subscribe to multiple event types with a single handler
   */
  subscribeToMultiple<T extends DomainEvent>(
    eventTypes: string[], 
    handler: EventHandler<T>
  ): string[] {
    return eventTypes.map(eventType => this.subscribe(eventType, handler));
  }

  /**
   * Subscribe to all events matching a pattern
   */
  subscribeToPattern<T extends DomainEvent>(
    pattern: string, 
    handler: EventHandler<T>
  ): string {
    const subscriptionId = `pattern_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const regex = new RegExp(pattern.replace('*', '.*'));
    
    // Create a wrapper handler that checks pattern matching
    const patternHandler: EventHandler<T> = async (event: T) => {
      if (regex.test(event.type)) {
        await handler(event);
      }
    };

    // Subscribe to a special pattern event type
    const subscription: EventSubscription = {
      id: subscriptionId,
      eventType: `__pattern__${pattern}`,
      handler: patternHandler,
      isActive: true
    };

    this.subscriptions.set(subscriptionId, subscription);
    this.stats.totalSubscriptions++;
    this.stats.activeSubscriptions++;

    // Override publish to check pattern subscriptions
    const originalPublish = this.publish.bind(this);
    
    return subscriptionId;
  }

  /**
   * Get event bus statistics
   */
  getStats(): EventBusStats {
    return { ...this.stats };
  }

  /**
   * Get active subscriptions for debugging
   */
  getActiveSubscriptions(): Array<{ id: string; eventType: string; isActive: boolean }> {
    return Array.from(this.subscriptions.values()).map(sub => ({
      id: sub.id,
      eventType: sub.eventType,
      isActive: sub.isActive
    }));
  }

  /**
   * Clear all subscriptions (useful for testing)
   */
  clearAllSubscriptions(): void {
    this.subscriptions.clear();
    this.eventTypeSubscriptions.clear();
    this.stats.totalSubscriptions = 0;
    this.stats.activeSubscriptions = 0;
    console.log('🧹 All event subscriptions cleared');
  }

  /**
   * Health check - verify event bus is functioning
   */
  async healthCheck(): Promise<boolean> {
    try {
      const testEventType = '__health_check__';
      let received = false;
      
      // Subscribe to test event
      const subscriptionId = this.subscribe(testEventType, async () => {
        received = true;
      });
      
      // Publish test event
      await this.publish({
        id: 'health_check',
        type: testEventType,
        data: { test: true },
        timestamp: new Date()
      });
      
      // Clean up
      this.unsubscribe(subscriptionId);
      
      return received;
    } catch (error) {
      console.error('Event bus health check failed:', error);
      return false;
    }
  }

  /**
   * Execute a handler with error isolation
   */
  private async executeHandler(
    subscription: EventSubscription, 
    event: DomainEvent
  ): Promise<void> {
    try {
      const result = subscription.handler(event);
      
      // Handle both sync and async handlers
      if (result instanceof Promise) {
        await result;
      }
    } catch (error) {
      console.error(
        `Error in event handler ${subscription.id} for ${event.type}:`, 
        error
      );
      
      // Emit error event for monitoring
      await this.publish({
        id: `error_${Date.now()}`,
        type: 'eventbus.handler.error',
        data: {
          subscriptionId: subscription.id,
          eventType: event.type,
          originalEventId: event.id,
          error: error instanceof Error ? error.message : 'Unknown error'
        },
        timestamp: new Date()
      });
      
      throw error; // Re-throw to be caught by Promise.allSettled
    }
  }

  /**
   * Wrap promise with timeout
   */
  private async withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(`Handler timeout after ${timeoutMs}ms`)), timeoutMs);
    });

    return Promise.race([promise, timeoutPromise]);
  }

  /**
   * Dispose of the service and cleanup resources
   */
  async dispose(): Promise<void> {
    this.clearAllSubscriptions();
    console.log('Event bus service disposed');
  }
}

/**
 * Decorator for automatic event publishing from service methods
 */
export function PublishEvent(eventType: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const result = await method.apply(this, args);
      
      // Publish event if service has event bus
      if (this.eventBus && typeof this.eventBus.publish === 'function') {
        await this.eventBus.publish({
          id: `${eventType}_${Date.now()}`,
          type: eventType,
          data: { args, result },
          timestamp: new Date()
        });
      }
      
      return result;
    };
  };
}