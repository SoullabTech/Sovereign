// lib/agents/elemental/ArchetypeAgent.ts
// Base class for all elemental archetypal agents

"use strict";

export interface ArchetypeMemory {
  type: string;
  content: string;
  energy?: string;
  timestamp: Date;
  userId?: string;
}

export interface ArchetypeResponse {
  content: string;
  element: string;
  energy?: string;
  guidance?: string;
}

/**
 * Base class for elemental archetypal agents
 */
export abstract class ArchetypeAgent {
  protected element: string;
  protected memories: ArchetypeMemory[] = [];

  constructor(element: string) {
    this.element = element;
  }

  /**
   * Process input through elemental consciousness
   */
  abstract async process(
    input: string,
    context?: any[]
  ): Promise<ArchetypeResponse>;

  /**
   * Store elemental memory
   */
  protected storeMemory(memory: ArchetypeMemory): void {
    this.memories.push({
      ...memory,
      timestamp: memory.timestamp || new Date(),
    });
  }

  /**
   * Retrieve recent memories
   */
  protected getRecentMemories(limit: number = 5): ArchetypeMemory[] {
    return this.memories.slice(-limit);
  }

  /**
   * Get element identifier
   */
  public getElement(): string {
    return this.element;
  }
}