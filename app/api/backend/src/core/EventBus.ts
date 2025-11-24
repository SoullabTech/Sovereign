/**
 * EventBus - Decoupled Service Communication
 * Foundation for architectural simplification
 * Eliminates circular dependencies between services
 */

import { EventPayload, SystemError } from './TypeRegistry.js';

export interface EventHandler<T = any> {
  (event: EventPayload & { data: T }): Promise<void> | void;
}

export interface EventSubscription {
  id: string;
  eventType: string;
  handler: EventHandler;
  priority: number; // Higher numbers execute first
  once: boolean; // Auto-unsubscribe after first execution
  filter?: (event: EventPayload) => boolean;
}

export interface EventBusMetrics {
  totalEvents: number;
  eventsByType: Record<string, number>;
  averageProcessingTime: number;
  errorCount: number;
  subscriptionCount: number;
  activeListeners: Record<string, number>;
}

export class EventBus {
  private subscriptions: Map<string, EventSubscription[]> = new Map();
  private globalSubscriptions: EventSubscription[] = [];
  private metrics: EventBusMetrics = {
    totalEvents: 0,
    eventsByType: {},
    averageProcessingTime: 0,
    errorCount: 0,
    subscriptionCount: 0,
    activeListeners: {}
  };
  private processingTimes: number[] = [];
  private maxProcessingTimes = 1000; // Keep last 1000 times for averaging

  constructor(
    private options: {
      maxRetries?: number;
      retryDelay?: number;
      enableMetrics?: boolean;
      logErrors?: boolean;
    } = {}
  ) {
    this.options = {
      maxRetries: 3,
      retryDelay: 1000,
      enableMetrics: true,
      logErrors: true,
      ...options
    };
  }

  /**
   * Subscribe to specific event type
   */
  subscribe<T = any>(
    eventType: string,
    handler: EventHandler<T>,
    options: {
      priority?: number;
      once?: boolean;
      filter?: (event: EventPayload) => boolean;
    } = {}
  ): string {
    const subscription: EventSubscription = {
      id: this.generateId(),
      eventType,
      handler: handler as EventHandler,
      priority: options.priority || 0,
      once: options.once || false,
      filter: options.filter
    };

    const typeSubscriptions = this.subscriptions.get(eventType) || [];
    typeSubscriptions.push(subscription);
    typeSubscriptions.sort((a, b) => b.priority - a.priority); // Higher priority first
    this.subscriptions.set(eventType, typeSubscriptions);

    this.metrics.subscriptionCount++;
    this.metrics.activeListeners[eventType] = (this.metrics.activeListeners[eventType] || 0) + 1;

    return subscription.id;
  }

  /**
   * Subscribe to all events (global listener)
   */
  subscribeGlobal<T = any>(
    handler: EventHandler<T>,
    options: {
      priority?: number;
      once?: boolean;
      filter?: (event: EventPayload) => boolean;
    } = {}
  ): string {
    const subscription: EventSubscription = {
      id: this.generateId(),
      eventType: '*',
      handler: handler as EventHandler,
      priority: options.priority || 0,
      once: options.once || false,
      filter: options.filter
    };

    this.globalSubscriptions.push(subscription);
    this.globalSubscriptions.sort((a, b) => b.priority - a.priority);

    this.metrics.subscriptionCount++;

    return subscription.id;
  }

  /**
   * Unsubscribe from events
   */
  unsubscribe(subscriptionId: string): boolean {
    // Check type-specific subscriptions
    for (const [eventType, subscriptions] of this.subscriptions.entries()) {
      const index = subscriptions.findIndex(sub => sub.id === subscriptionId);
      if (index !== -1) {
        subscriptions.splice(index, 1);
        if (subscriptions.length === 0) {
          this.subscriptions.delete(eventType);
          delete this.metrics.activeListeners[eventType];
        } else {
          this.metrics.activeListeners[eventType]--;
        }
        this.metrics.subscriptionCount--;
        return true;
      }
    }

    // Check global subscriptions
    const globalIndex = this.globalSubscriptions.findIndex(sub => sub.id === subscriptionId);
    if (globalIndex !== -1) {
      this.globalSubscriptions.splice(globalIndex, 1);
      this.metrics.subscriptionCount--;
      return true;
    }

    return false;
  }

  /**
   * Emit event to all subscribers
   */
  async emit<T = any>(
    eventType: string,
    data: T,
    metadata: Record<string, any> = {}
  ): Promise<void> {
    const event: EventPayload & { data: T } = {
      type: eventType,
      userId: metadata.userId || 'system',
      sessionId: metadata.sessionId,
      timestamp: new Date(),
      properties: metadata.properties || {},
      metadata: {
        ...metadata,
        eventBusId: this.generateId()
      },
      data
    };

    const startTime = Date.now();

    try {
      await this.processEvent(event);
    } catch (error) {
      this.handleError(error as Error, event);
    } finally {
      if (this.options.enableMetrics) {
        this.updateMetrics(eventType, Date.now() - startTime);
      }
    }
  }

  /**
   * Emit event and wait for specific response
   */
  async request<TRequest = any, TResponse = any>(
    eventType: string,
    data: TRequest,
    options: {
      timeout?: number;
      responseType?: string;
      metadata?: Record<string, any>;
    } = {}
  ): Promise<TResponse> {
    const requestId = this.generateId();
    const responseType = options.responseType || `${eventType}:response`;
    const timeout = options.timeout || 30000; // 30 seconds default

    return new Promise<TResponse>((resolve, reject) => {
      const timeoutHandle = setTimeout(() => {
        this.unsubscribe(subscriptionId);
        reject(new Error(`Request timeout after ${timeout}ms`));
      }, timeout);

      const subscriptionId = this.subscribe(
        responseType,
        (responseEvent) => {
          if (responseEvent.metadata?.requestId === requestId) {
            clearTimeout(timeoutHandle);
            this.unsubscribe(subscriptionId);
            resolve(responseEvent.data);
          }
        },
        { once: true }
      );

      // Emit the request
      this.emit(eventType, data, {
        ...options.metadata,
        requestId,
        responseType
      }).catch(error => {
        clearTimeout(timeoutHandle);
        this.unsubscribe(subscriptionId);
        reject(error);
      });
    });
  }

  /**
   * Process event through all relevant subscribers
   */
  private async processEvent(event: EventPayload): Promise<void> {
    const specificSubscriptions = this.subscriptions.get(event.type) || [];
    const allSubscriptions = [...specificSubscriptions, ...this.globalSubscriptions];

    // Filter subscriptions
    const eligibleSubscriptions = allSubscriptions.filter(sub => {
      return !sub.filter || sub.filter(event);
    });

    // Process subscriptions in parallel
    const promises = eligibleSubscriptions.map(subscription => 
      this.processSubscription(subscription, event)
    );

    await Promise.allSettled(promises);

    // Remove 'once' subscriptions
    this.removeOnceSubscriptions(eligibleSubscriptions);
  }

  /**
   * Process individual subscription with retry logic
   */
  private async processSubscription(
    subscription: EventSubscription, 
    event: EventPayload,
    retryCount: number = 0
  ): Promise<void> {
    try {
      await subscription.handler(event);
    } catch (error) {
      if (retryCount < (this.options.maxRetries || 0)) {
        await this.delay(this.options.retryDelay || 1000);
        return this.processSubscription(subscription, event, retryCount + 1);
      } else {
        this.handleSubscriptionError(error as Error, subscription, event);
      }
    }
  }

  /**
   * Remove subscriptions marked as 'once'
   */
  private removeOnceSubscriptions(processedSubscriptions: EventSubscription[]): void {
    const onceSubscriptions = processedSubscriptions.filter(sub => sub.once);
    onceSubscriptions.forEach(sub => this.unsubscribe(sub.id));
  }

  /**
   * Handle processing errors
   */
  private handleError(error: Error, event: EventPayload): void {
    this.metrics.errorCount++;

    if (this.options.logErrors) {
      console.error(`EventBus error processing ${event.type}:`, error);
    }

    // Emit error event (but don't process if it would cause recursion)
    if (event.type !== 'system:error') {
      this.emit('system:error', {
        originalEvent: event,
        error: {
          message: error.message,
          stack: error.stack,
          timestamp: new Date()
        }
      } as SystemError);
    }
  }

  /**
   * Handle subscription-specific errors
   */
  private handleSubscriptionError(
    error: Error, 
    subscription: EventSubscription, 
    event: EventPayload
  ): void {
    if (this.options.logErrors) {
      console.error(`EventBus subscription error (${subscription.id}) for ${event.type}:`, error);
    }

    // Consider unsubscribing problematic handlers after repeated failures
    // This could be enhanced with a failure tracking system
  }

  /**
   * Update metrics
   */
  private updateMetrics(eventType: string, processingTime: number): void {
    this.metrics.totalEvents++;
    this.metrics.eventsByType[eventType] = (this.metrics.eventsByType[eventType] || 0) + 1;

    // Track processing times for averaging
    this.processingTimes.push(processingTime);
    if (this.processingTimes.length > this.maxProcessingTimes) {
      this.processingTimes.shift();
    }

    // Calculate average processing time
    this.metrics.averageProcessingTime = 
      this.processingTimes.reduce((sum, time) => sum + time, 0) / this.processingTimes.length;
  }

  /**
   * Get current metrics
   */
  getMetrics(): EventBusMetrics {
    return { ...this.metrics };
  }

  /**
   * Get subscription count by event type
   */
  getSubscriptionCount(eventType?: string): number {
    if (eventType) {
      const typeSubscriptions = this.subscriptions.get(eventType)?.length || 0;
      return typeSubscriptions;
    }
    return this.metrics.subscriptionCount;
  }

  /**
   * List all active event types
   */
  getActiveEventTypes(): string[] {
    return Array.from(this.subscriptions.keys());
  }

  /**
   * Clear all subscriptions
   */
  clear(): void {
    this.subscriptions.clear();
    this.globalSubscriptions.length = 0;
    this.metrics.subscriptionCount = 0;
    this.metrics.activeListeners = {};
  }

  /**
   * Pause event processing
   */
  private paused = false;
  private pendingEvents: Array<() => Promise<void>> = [];

  pause(): void {
    this.paused = true;
  }

  resume(): void {
    this.paused = false;
    
    // Process pending events
    const events = [...this.pendingEvents];
    this.pendingEvents.length = 0;
    
    events.forEach(eventProcessor => {
      eventProcessor().catch(error => this.handleError(error, {} as EventPayload));
    });
  }

  isPaused(): boolean {
    return this.paused;
  }

  /**
   * Utility methods
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Event Bus Patterns for Daimonic System

export class DaimonicEventBus extends EventBus {
  constructor() {
    super({
      maxRetries: 2,
      retryDelay: 500,
      enableMetrics: true,
      logErrors: true
    });

    // Set up system event handlers
    this.setupSystemHandlers();
  }

  private setupSystemHandlers(): void {
    // Handle manifestation events
    this.subscribe('daimonic:manifestation', async (event) => {
      // Trigger gap analysis
      await this.emit('synaptic:analyze', event.data, {
        triggeredBy: event.metadata?.eventBusId
      });
    });

    // Handle gap analysis completion
    this.subscribe('synaptic:gap_mapped', async (event) => {
      // Check for emergence potential
      await this.emit('emergence:evaluate', event.data, {
        triggeredBy: event.metadata?.eventBusId
      });
    });

    // Handle emergence events
    this.subscribe('emergence:detected', async (event) => {
      // Run authenticity validation
      await this.emit('validation:authenticate', event.data, {
        triggeredBy: event.metadata?.eventBusId
      });

      // Update collective field
      await this.emit('collective:update', event.data, {
        triggeredBy: event.metadata?.eventBusId
      });
    });

    // Handle validation results
    this.subscribe('validation:complete', async (event) => {
      // Generate narrative elements
      await this.emit('narrative:generate', event.data, {
        triggeredBy: event.metadata?.eventBusId
      });
    });

    // Handle system errors with graceful degradation
    this.subscribe('system:error', async (event) => {
      console.warn('System error in daimonic processing:', event.data);
      
      // Could implement fallback mechanisms here
      // For now, just log and continue
    });
  }

  /**
   * High-level methods for common daimonic operations
   */

  async triggerDaimonicEncounter(
    userId: string,
    sessionId: string,
    encounterData: any
  ): Promise<void> {
    await this.emit('daimonic:encounter_start', encounterData, {
      userId,
      sessionId
    });
  }

  async reportManifestation(
    userId: string,
    sessionId: string,
    manifestation: any
  ): Promise<void> {
    await this.emit('daimonic:manifestation', manifestation, {
      userId,
      sessionId
    });
  }

  async requestValidation(
    userId: string,
    sessionId: string,
    validationData: any
  ): Promise<any> {
    return this.request('validation:authenticate', validationData, {
      responseType: 'validation:result',
      timeout: 10000,
      metadata: { userId, sessionId }
    });
  }

  async updateCollectiveField(
    patternData: any
  ): Promise<void> {
    await this.emit('collective:field_update', patternData);
  }

  async generateNarrative(
    userId: string,
    sessionId: string,
    narrativeContext: any
  ): Promise<any> {
    return this.request('narrative:generate', narrativeContext, {
      responseType: 'narrative:result',
      timeout: 5000,
      metadata: { userId, sessionId }
    });
  }
}

// Singleton instance for system use
export const daimonicEventBus = new DaimonicEventBus();

// Event type constants
export const DAIMONIC_EVENTS = {
  // Manifestation Events
  MANIFESTATION_DETECTED: 'daimonic:manifestation',
  ENCOUNTER_START: 'daimonic:encounter_start',
  ENCOUNTER_END: 'daimonic:encounter_end',
  
  // Synaptic Events  
  GAP_DETECTED: 'synaptic:gap_detected',
  GAP_MAPPED: 'synaptic:gap_mapped',
  BRIDGING_ATTEMPTED: 'synaptic:bridging_attempted',
  TRANSMISSION_QUALITY_CHANGE: 'synaptic:transmission_change',
  
  // Emergence Events
  EMERGENCE_DETECTED: 'emergence:detected',
  EMERGENCE_EVALUATED: 'emergence:evaluated',
  SYNTHESIS_OCCURRED: 'emergence:synthesis',
  
  // Validation Events
  VALIDATION_REQUESTED: 'validation:authenticate',
  VALIDATION_COMPLETE: 'validation:complete',
  AUTHENTICITY_ALERT: 'validation:authenticity_alert',
  
  // Collective Events
  COLLECTIVE_UPDATE: 'collective:update',
  FIELD_STATUS_CHANGE: 'collective:field_change',
  SYNCHRONICITY_DETECTED: 'collective:synchronicity',
  
  // Narrative Events
  NARRATIVE_GENERATE: 'narrative:generate',
  NARRATIVE_COMPLETE: 'narrative:complete',
  
  // Integration Events
  INTEGRATION_ATTEMPTED: 'integration:attempted',
  INTEGRATION_SUCCESS: 'integration:success',
  INTEGRATION_FAILURE: 'integration:failure',
  
  // System Events
  SYSTEM_ERROR: 'system:error',
  SERVICE_STATUS: 'system:service_status',
  METRICS_UPDATE: 'system:metrics'
} as const;

export type DaimonicEventType = typeof DAIMONIC_EVENTS[keyof typeof DAIMONIC_EVENTS];