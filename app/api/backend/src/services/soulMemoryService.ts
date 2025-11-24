/**
 * Soul Memory Service - Minimal Implementation
 * Uses our new SoulMemorySystem
 */

import { SoulMemorySystem, Memory, MemoryType, ElementalType } from "../memory/SoulMemorySystem";
import { logger } from "../utils/logger";

export class SoulMemoryService {
  private memorySystems: Map<string, SoulMemorySystem> = new Map();

  constructor() {
    logger.info("Soul Memory Service initialized");
  }

  async getOrCreateMemorySystem(userId: string): Promise<SoulMemorySystem> {
    if (!this.memorySystems.has(userId)) {
      const memorySystem = new SoulMemorySystem({
        userId,
        storageType: "sqlite",
        databasePath: `./soul_memory_${userId}.db`,
        memoryDepth: 100,
      });

      await memorySystem.initialize();
      this.memorySystems.set(userId, memorySystem);
      logger.info(`Created new Soul Memory System for user: ${userId}`);
    }

    return this.memorySystems.get(userId)!;
  }

  async storeOracleExchange(
    userId: string,
    userMessage: string,
    oracleResponse: string,
    metadata?: {
      element?: ElementalType;
      emotionalTone?: string;
      shadowContent?: boolean;
      transformationMarker?: boolean;
      sessionId?: string;
    },
  ): Promise<Memory> {
    const memorySystem = await this.getOrCreateMemorySystem(userId);

    return memorySystem.storeMemory({
      userId,
      type: "oracle_exchange",
      content: userMessage,
      element: metadata?.element || "aether",
      emotionalTone: metadata?.emotionalTone,
      shadowContent: metadata?.shadowContent || false,
      transformationMarker: metadata?.transformationMarker || false,
      oracleResponse,
      metadata: {
        sessionId: metadata?.sessionId,
        timestamp: new Date().toISOString(),
      },
    });
  }

  async getUserMemories(
    userId: string,
    options?: {
      type?: MemoryType;
      element?: ElementalType;
      limit?: number;
      sacred?: boolean;
      transformations?: boolean;
      dateRange?: { start: Date; end: Date };
    },
  ): Promise<Memory[]> {
    const memorySystem = await this.getOrCreateMemorySystem(userId);
    return memorySystem.retrieveMemories(userId, options);
  }

  async getSacredMoments(
    userId: string,
    limit: number = 10,
  ): Promise<Memory[]> {
    const memorySystem = await this.getOrCreateMemorySystem(userId);
    return memorySystem.getSacredMoments(userId, limit);
  }

  async getTransformationJourney(userId: string) {
    const memorySystem = await this.getOrCreateMemorySystem(userId);
    return memorySystem.getTransformationJourney(userId);
  }

  async getActiveArchetypes(userId: string) {
    const memorySystem = await this.getOrCreateMemorySystem(userId);
    return memorySystem.getActiveArchetypes(userId);
  }

  async searchMemories(
    userId: string,
    query: string,
    options?: {
      topK?: number;
      memoryTypes?: MemoryType[];
      includeArchetypal?: boolean;
    },
  ): Promise<Memory[]> {
    const memorySystem = await this.getOrCreateMemorySystem(userId);
    return memorySystem.semanticSearch(userId, query, options);
  }

  async cleanup(): Promise<void> {
    for (const [userId, memorySystem] of this.memorySystems) {
      await memorySystem.closeDatabase();
    }
    this.memorySystems.clear();
    logger.info("Soul Memory Service cleaned up");
  }
}

// Export singleton instance
export const soulMemoryService = new SoulMemoryService();
export default soulMemoryService;