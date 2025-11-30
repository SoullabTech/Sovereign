// Event Sourcing Service for Soul Memory System
// Handles domain events and event streaming

import { EventEmitter } from "events";
import { supabase } from "../../lib/supabaseClient";
import { logger } from "../../utils/logger";

export interface DomainEvent {
  id: string;
  type: string;
  aggregateId: string;
  aggregateType: string;
  data: Record<string, any>;
  metadata: {
    timestamp: string;
    userId?: string;
    version: number;
  };
}

export class EventService extends EventEmitter {
  private eventStore: Map<string, DomainEvent[]> = new Map();

  async emit(eventType: string, data: Record<string, any>): Promise<void> {
    try {
      const event: DomainEvent = {
        id: this.generateEventId(),
        type: eventType,
        aggregateId: data.id || data.userId,
        aggregateType: this.getAggregateType(eventType),
        data,
        metadata: {
          timestamp: new Date().toISOString(),
          userId: data.userId,
          version: await this.getNextVersion(data.id || data.userId),
        },
      };

      // Store in event log table
      await this.persistEvent(event);

      // Store in memory for immediate access
      const aggregateEvents = this.eventStore.get(event.aggregateId) || [];
      aggregateEvents.push(event);
      this.eventStore.set(event.aggregateId, aggregateEvents);

      // Emit for real-time subscribers
      super.emit(eventType, event);
      super.emit("*", event); // Global listener

      logger.info("Domain event emitted", {
        eventType,
        aggregateId: event.aggregateId,
      });

      // Apply event to read model
      await this.applyEventToReadModel(event);
    } catch (error) {
      logger.error("Failed to emit event", { error, eventType, data });
      throw error;
    }
  }

  async getEventsForAggregate(aggregateId: string): Promise<DomainEvent[]> {
    try {
      // Try memory first
      const cachedEvents = this.eventStore.get(aggregateId);
      if (cachedEvents) {
        return cachedEvents;
      }

      // Fallback to database
      const { data, error } = await supabase
        .from("event_log")
        .select("*")
        .eq("aggregate_id", aggregateId)
        .order("metadata->version", { ascending: true });

      if (error) {
        throw new Error(`Failed to load events: ${error.message}`);
      }

      const events = data || [];
      this.eventStore.set(aggregateId, events);
      return events;
    } catch (error) {
      logger.error("Failed to get events for aggregate", {
        error,
        aggregateId,
      });
      throw error;
    }
  }

  private async persistEvent(event: DomainEvent): Promise<void> {
    try {
      const { error } = await supabase.from("event_log").insert({
        id: event.id,
        type: event.type,
        aggregate_id: event.aggregateId,
        aggregate_type: event.aggregateType,
        data: event.data,
        metadata: event.metadata,
      });

      if (error) {
        throw new Error(`Event persistence failed: ${error.message}`);
      }
    } catch (error) {
      logger.error("Failed to persist event", { error, event });
      throw error;
    }
  }

  private async applyEventToReadModel(event: DomainEvent): Promise<void> {
    try {
      switch (event.type) {
        case "memory.created":
          await this.handleMemoryCreated(event);
          break;
        case "memory.updated":
          await this.handleMemoryUpdated(event);
          break;
        case "memory.deleted":
          await this.handleMemoryDeleted(event);
          break;
        default:
          logger.warn("Unknown event type", { eventType: event.type });
      }
    } catch (error) {
      logger.error("Failed to apply event to read model", { error, event });
      // Don't throw - event was persisted successfully
    }
  }

  private async handleMemoryCreated(event: DomainEvent): Promise<void> {
    const { data } = event;
    await supabase.from("memories").insert({
      id: data.id,
      user_id: data.userId,
      content: data.content,
      element: data.element,
      source_agent: data.sourceAgent,
      confidence: data.confidence,
      metadata: data.metadata,
      symbols: data.symbols || [],
      created_at: event.metadata.timestamp,
      updated_at: event.metadata.timestamp,
    });
  }

  private async handleMemoryUpdated(event: DomainEvent): Promise<void> {
    const { data } = event;
    await supabase
      .from("memories")
      .update({
        ...data.updates,
        updated_at: event.metadata.timestamp,
      })
      .eq("id", data.id)
      .eq("user_id", data.userId);
  }

  private async handleMemoryDeleted(event: DomainEvent): Promise<void> {
    const { data } = event;
    await supabase
      .from("memories")
      .delete()
      .eq("id", data.id)
      .eq("user_id", data.userId);
  }

  private async getNextVersion(aggregateId: string): Promise<number> {
    const events = await this.getEventsForAggregate(aggregateId);
    return events.length + 1;
  }

  private getAggregateType(eventType: string): string {
    if (eventType.startsWith("memory.")) return "Memory";
    return "Unknown";
  }

  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const eventService = new EventService();
