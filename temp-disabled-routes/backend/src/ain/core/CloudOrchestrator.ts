/**
 * Cloud Orchestrator Base Class
 * Extended base agent for cloud-based services with pub/sub capabilities
 */

import { EventEmitter } from "events";
import { BaseAgent } from "../../core/agents/baseAgent";
import { SpiralogicEvent, ElementalService, EventHandler } from "../types";

export class CloudOrchestrator extends EventEmitter {
  protected serviceId: string;
  protected elementalService?: ElementalService;
  private baseAgent: BaseAgent;

  constructor(serviceId: string, elementalService?: ElementalService) {
    super();
    this.serviceId = serviceId;
    this.elementalService = elementalService;
    this.baseAgent = new BaseAgent();

    // Set reasonable max listeners for cloud services
    this.setMaxListeners(1000);
  }

  /**
   * Publish event to the pub/sub system
   */
  async publish(eventType: string, payload: any): Promise<void> {
    const event: SpiralogicEvent = {
      id: `${this.serviceId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      source: this.elementalService || ElementalService.Aether,
      type: eventType as any,
      payload: {
        content: payload,
        metadata: {
          processed_at: "cloud",
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
   * Subscribe to all events
   */
  subscribeToAll(pattern: string, handler: EventHandler): void {
    // Simple pattern matching - for production would use proper pattern matching
    if (pattern === "*") {
      this.onAny(handler);
    } else {
      this.on(pattern, handler);
    }
  }

  /**
   * Listen to any event
   */
  private onAny(handler: EventHandler): void {
    const originalEmit = this.emit.bind(this);
    this.emit = (event: string, ...args: any[]) => {
      handler(args[0]);
      return originalEmit(event, ...args);
    };
  }

  /**
   * Process query using base agent
   */
  async processQuery(query: string) {
    return this.baseAgent.processQuery(query);
  }
}
