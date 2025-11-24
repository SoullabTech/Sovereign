/**
 * Hybrid Agent Base Class
 * Agent that can process both at edge and cloud with intelligent routing
 */

import { EventEmitter } from "events";
import { BaseAgent } from "../../core/agents/baseAgent";
import { SpiralogicEvent, ElementalService, EventHandler } from "../types";

export class HybridAgent extends EventEmitter {
  protected serviceId: string;
  protected elementalService?: ElementalService;
  private baseAgent: BaseAgent;

  constructor(serviceId: string, elementalService?: ElementalService) {
    super();
    this.serviceId = serviceId;
    this.elementalService = elementalService;
    this.baseAgent = new BaseAgent();

    // Set reasonable max listeners for hybrid services
    this.setMaxListeners(500);
  }

  /**
   * Publish event to the pub/sub system
   */
  async publish(eventType: string, payload: any): Promise<void> {
    const event: SpiralogicEvent = {
      id: `${this.serviceId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      source: this.elementalService || ElementalService.Air,
      type: eventType as any,
      payload: {
        content: payload,
        metadata: {
          processed_at: "hybrid",
          intensity: 1.0,
        },
        elemental_signature: {
          fire: 0.2,
          water: 0.2,
          earth: 0.2,
          air: 0.2,
          aether: 0.2,
        },
      },
      routing: {
        priority: "medium",
        broadcast: false,
      },
    };

    this.emit(eventType, event);
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
   * Process query using base agent
   */
  async processQuery(query: string) {
    return this.baseAgent.processQuery(query);
  }

  /**
   * Request cloud processing for complex operations
   */
  async requestCloudProcessing(operation: string, data: any): Promise<void> {
    await this.publish("cloud.processing.request", {
      operation,
      data,
      requesting_service: this.serviceId,
      timestamp: Date.now(),
    });
  }
}
