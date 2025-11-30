/**
 * Edge Agent Base Class
 * Lightweight agent for on-device processing
 */

import { EventEmitter } from "events";
import {
  SpiralogicEvent,
  ElementalService,
  EventHandler,
  ProcessingMode,
} from "../types";
import { BaseAgent } from "../../core/agents/baseAgent";

export class EdgeAgent extends BaseAgent {
  protected processingMode: ProcessingMode;
  protected localCache: Map<string, any> = new Map();
  protected offlineMode: boolean = false;

  constructor(serviceId: string, elementalService?: ElementalService) {
    super(serviceId, "edge", elementalService);

    this.processingMode = {
      local_threshold: 0.8, // Process 80% locally
      cloud_escalation: true,
      neuromorphic_compatible: true,
      quantum_ready: false,
    };

    this.setupEdgeOptimizations();
  }

  /**
   * Setup edge-specific optimizations
   */
  private setupEdgeOptimizations() {
    // Optimize for low latency
    this.setMaxListeners(100);

    // Setup local caching
    this.setupLocalCache();

    // Monitor offline status
    this.monitorConnectivity();
  }

  /**
   * Process event with edge-first strategy
   */
  protected async processEvent(event: SpiralogicEvent): Promise<void> {
    const complexity = this.assessComplexity(event);

    if (complexity <= this.processingMode.local_threshold || this.offlineMode) {
      // Process locally
      await this.processLocally(event);
    } else if (this.processingMode.cloud_escalation) {
      // Escalate to cloud
      await this.escalateToCloud(event);
    } else {
      // Best effort local processing
      await this.processLocally(event);
    }
  }

  /**
   * Process event locally at the edge
   */
  protected async processLocally(event: SpiralogicEvent): Promise<void> {
    try {
      const startTime = performance.now();

      // Apply edge processing logic
      const result = await this.edgeProcessingLogic(event);

      const processingTime = performance.now() - startTime;

      // Cache result for offline access
      this.cacheResult(event.id, result);

      // Emit processed event
      await this.publish(this.generateResponseEventType(event), {
        ...result,
        processing: {
          type: "edge",
          latency: processingTime,
          cached: true,
        },
      });
    } catch (error) {
      await this.handleEdgeError(error, event);
    }
  }

  /**
   * Escalate to cloud for complex processing
   */
  protected async escalateToCloud(event: SpiralogicEvent): Promise<void> {
    if (this.offlineMode) {
      // Queue for later cloud processing
      this.queueForCloudProcessing(event);

      // Provide best-effort local response
      await this.processLocally(event);
      return;
    }

    try {
      await this.publish("cloud.escalation", {
        original_event: event,
        escalation_reason: "complexity_threshold_exceeded",
        edge_service: this.serviceId,
        timestamp: Date.now(),
      });
    } catch (error) {
      // Fallback to local processing
      await this.processLocally(event);
    }
  }

  /**
   * Edge-specific processing logic (to be overridden)
   */
  protected async edgeProcessingLogic(event: SpiralogicEvent): Promise<any> {
    // Default edge processing - return simplified response
    return {
      response: "Edge processed response",
      confidence: 0.7,
      elemental_influence: this.calculateElementalInfluence(event),
    };
  }

  /**
   * Assess complexity of event for processing decision
   */
  protected assessComplexity(event: SpiralogicEvent): number {
    let complexity = 0.5; // Base complexity

    // Increase complexity based on content size
    const contentSize = JSON.stringify(event.payload.content).length;
    complexity += Math.min(contentSize / 10000, 0.3);

    // Increase complexity for multi-elemental events
    const elementalCount = Object.values(
      event.payload.elemental_signature,
    ).filter((val) => val > 0.1).length;
    complexity += elementalCount * 0.1;

    // Increase complexity for integration events
    if (event.type.toString().includes("integration")) {
      complexity += 0.2;
    }

    return Math.min(complexity, 1.0);
  }

  /**
   * Setup local caching for offline capability
   */
  private setupLocalCache() {
    // Limit cache size for edge devices
    const MAX_CACHE_SIZE = 1000;

    // Simple LRU eviction
    if (this.localCache.size > MAX_CACHE_SIZE) {
      const firstKey = this.localCache.keys().next().value;
      this.localCache.delete(firstKey);
    }
  }

  /**
   * Monitor connectivity for offline mode
   */
  private monitorConnectivity() {
    // Simple connectivity check
    setInterval(() => {
      this.checkConnectivity();
    }, 30000); // Check every 30 seconds
  }

  /**
   * Check connectivity status
   */
  private async checkConnectivity(): Promise<void> {
    try {
      // Try to reach cloud service
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch("/health", {
        method: "HEAD",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      this.offlineMode = !response.ok;
    } catch (error) {
      this.offlineMode = true;
    }

    if (this.offlineMode) {
      this.emit("offline-mode-activated");
    }
  }

  /**
   * Cache processing result
   */
  protected cacheResult(eventId: string, result: any): void {
    this.localCache.set(eventId, {
      result,
      timestamp: Date.now(),
      ttl: 300000, // 5 minutes
    });
  }

  /**
   * Queue event for cloud processing when online
   */
  protected queueForCloudProcessing(event: SpiralogicEvent): void {
    const queueKey = "cloud-queue";
    let queue = this.localCache.get(queueKey) || [];

    queue.push({
      event,
      queued_at: Date.now(),
    });

    // Limit queue size
    if (queue.length > 100) {
      queue = queue.slice(-100);
    }

    this.localCache.set(queueKey, queue);
  }

  /**
   * Process queued events when connectivity returns
   */
  protected async processQueuedEvents(): Promise<void> {
    const queueKey = "cloud-queue";
    const queue = this.localCache.get(queueKey) || [];

    for (const queuedItem of queue) {
      try {
        await this.escalateToCloud(queuedItem.event);
      } catch (error) {
        console.warn("Failed to process queued event:", error);
      }
    }

    // Clear processed queue
    this.localCache.delete(queueKey);
  }

  /**
   * Handle edge-specific errors
   */
  protected async handleEdgeError(
    error: any,
    event: SpiralogicEvent,
  ): Promise<void> {
    console.error(`Edge processing error in ${this.serviceId}:`, error);

    // Emit error event
    await this.publish("edge.error", {
      error: error.message,
      event_id: event.id,
      service: this.serviceId,
      timestamp: Date.now(),
      recovery_strategy: "local-fallback",
    });

    // Provide fallback response
    await this.publish(this.generateResponseEventType(event), {
      response:
        "Edge processing encountered an error - fallback response provided",
      error: true,
      confidence: 0.3,
    });
  }

  /**
   * Calculate elemental influence for edge processing
   */
  protected calculateElementalInfluence(event: SpiralogicEvent): any {
    const signature = event.payload.elemental_signature;
    const myElement = this.elementalService;

    return {
      primary_element: myElement,
      influence_strength: signature[myElement!] || 0.5,
      elemental_resonance: this.calculateResonance(signature),
    };
  }

  /**
   * Calculate resonance with event
   */
  protected calculateResonance(signature: any): number {
    if (!this.elementalService) return 0.5;

    const myStrength = Number(signature[this.elementalService] || 0);
    const totalStrength: number = (Object.values(signature) as any[]).reduce(
      (sum: number, val: any) => sum + (typeof val === "number" ? val : 0),
      0,
    );

    return totalStrength > 0 ? myStrength / totalStrength : 0.5;
  }

  /**
   * Generate appropriate response event type
   */
  protected generateResponseEventType(event: SpiralogicEvent): string {
    return `${this.elementalService}.response`;
  }

  /**
   * Subscribe to events
   */
  subscribe(eventType: string, handler: EventHandler): void {
    this.on(eventType, handler);
  }

  /**
   * Generate event ID
   */
  generateEventId(): string {
    return `${this.serviceId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Optimize for neuromorphic processing
   */
  protected optimizeForNeuromorphic(): void {
    // Enable spike-based processing mode
    this.processingMode.neuromorphic_compatible = true;

    // Reduce polling, increase event-driven processing
    this.removeAllListeners("poll");
  }

  /**
   * Get edge metrics for monitoring
   */
  getEdgeMetrics(): any {
    return {
      cache_size: this.localCache.size,
      offline_mode: this.offlineMode,
      processing_mode: this.processingMode,
      local_processing_ratio: this.calculateLocalProcessingRatio(),
      average_latency: this.getAverageLatency(),
    };
  }

  /**
   * Calculate percentage of events processed locally
   */
  private calculateLocalProcessingRatio(): number {
    // Simplified calculation - would track actual metrics
    return this.processingMode.local_threshold;
  }

  /**
   * Get average processing latency
   */
  private getAverageLatency(): number {
    // Simplified - would calculate from actual measurements
    return 50; // 50ms average for edge processing
  }
}

export default EdgeAgent;
