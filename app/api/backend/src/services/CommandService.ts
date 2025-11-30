// CQRS Command Side - Soul Memory System
// Handles all write operations and state changes

import { EventService } from "../events/EventService";
import { MemoryItem } from "../../types/memory";
import { logger } from "../../utils/logger";

export interface CreateMemoryCommand {
  userId: string;
  content: string;
  element?: string;
  sourceAgent?: string;
  confidence?: number;
  metadata?: Record<string, any>;
}

export interface UpdateMemoryCommand {
  id: string;
  userId: string;
  updates: Partial<MemoryItem>;
}

export interface DeleteMemoryCommand {
  id: string;
  userId: string;
}

export class SoulMemoryCommandService {
  private eventService: EventService;

  constructor() {
    this.eventService = new EventService();
  }

  async createMemory(
    command: CreateMemoryCommand,
  ): Promise<{ id: string; success: boolean }> {
    try {
      const memoryId = this.generateMemoryId();

      // Emit domain event for memory creation
      await this.eventService.emit("memory.created", {
        id: memoryId,
        ...command,
        timestamp: new Date().toISOString(),
      });

      logger.info("Memory created successfully", {
        memoryId,
        userId: command.userId,
      });
      return { id: memoryId, success: true };
    } catch (error) {
      logger.error("Failed to create memory", { error, command });
      throw new Error(
        `Memory creation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  async updateMemory(
    command: UpdateMemoryCommand,
  ): Promise<{ success: boolean }> {
    try {
      await this.eventService.emit("memory.updated", {
        ...command,
        timestamp: new Date().toISOString(),
      });

      logger.info("Memory updated successfully", {
        memoryId: command.id,
        userId: command.userId,
      });
      return { success: true };
    } catch (error) {
      logger.error("Failed to update memory", { error, command });
      throw new Error(
        `Memory update failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  async deleteMemory(
    command: DeleteMemoryCommand,
  ): Promise<{ success: boolean }> {
    try {
      await this.eventService.emit("memory.deleted", {
        ...command,
        timestamp: new Date().toISOString(),
      });

      logger.info("Memory deleted successfully", {
        memoryId: command.id,
        userId: command.userId,
      });
      return { success: true };
    } catch (error) {
      logger.error("Failed to delete memory", { error, command });
      throw new Error(
        `Memory deletion failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  private generateMemoryId(): string {
    return `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const soulMemoryCommandService = new SoulMemoryCommandService();
