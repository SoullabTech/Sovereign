// Unified Memory Interface for all memory systems in the application

import { AgentMemory } from './types';

export interface MemoryQuery {
  userId?: string;
  agentId?: string;
  timeRange?: {
    start: Date;
    end: Date;
  };
  topic?: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
  limit?: number;
}

export interface MemoryEntry {
  id: string;
  timestamp: Date;
  type: 'conversation' | 'breakthrough' | 'pattern' | 'relationship' | 'sacred';
  content: any;
  metadata?: Record<string, any>;
}

export interface MemoryStore {
  // Core operations
  save(entry: Omit<MemoryEntry, 'id'>): Promise<string>;
  retrieve(id: string): Promise<MemoryEntry | null>;
  query(params: MemoryQuery): Promise<MemoryEntry[]>;
  update(id: string, updates: Partial<MemoryEntry>): Promise<boolean>;
  delete(id: string): Promise<boolean>;

  // Batch operations
  saveBatch(entries: Omit<MemoryEntry, 'id'>[]): Promise<string[]>;
  retrieveBatch(ids: string[]): Promise<MemoryEntry[]>;
}

export interface UnifiedMemory {
  // Store management
  registerStore(name: string, store: MemoryStore): void;
  getStore(name: string): MemoryStore | undefined;

  // Unified operations across all stores
  saveToAll(entry: Omit<MemoryEntry, 'id'>): Promise<Record<string, string>>;
  queryAll(params: MemoryQuery): Promise<Record<string, MemoryEntry[]>>;

  // Memory synthesis
  synthesize(userId: string): Promise<{
    patterns: string[];
    insights: string[];
    evolution: string;
  }>;

  // Agent-specific memory operations
  saveAgentMemory(agentId: string, memory: AgentMemory): Promise<void>;
  loadAgentMemory(agentId: string): Promise<AgentMemory | null>;

  // Cross-referencing
  findRelated(entryId: string, maxResults?: number): Promise<MemoryEntry[]>;
  findSimilar(content: any, maxResults?: number): Promise<MemoryEntry[]>;
}

// Memory adapter for different storage backends
export abstract class MemoryAdapter implements MemoryStore {
  abstract save(entry: Omit<MemoryEntry, 'id'>): Promise<string>;
  abstract retrieve(id: string): Promise<MemoryEntry | null>;
  abstract query(params: MemoryQuery): Promise<MemoryEntry[]>;
  abstract update(id: string, updates: Partial<MemoryEntry>): Promise<boolean>;
  abstract delete(id: string): Promise<boolean>;

  async saveBatch(entries: Omit<MemoryEntry, 'id'>[]): Promise<string[]> {
    return Promise.all(entries.map(e => this.save(e)));
  }

  async retrieveBatch(ids: string[]): Promise<MemoryEntry[]> {
    const results = await Promise.all(ids.map(id => this.retrieve(id)));
    return results.filter(r => r !== null) as MemoryEntry[];
  }
}

// Concrete implementation of UnifiedMemory
export class UnifiedMemorySystem implements UnifiedMemory {
  private stores: Map<string, MemoryStore> = new Map();

  registerStore(name: string, store: MemoryStore): void {
    this.stores.set(name, store);
  }

  getStore(name: string): MemoryStore | undefined {
    return this.stores.get(name);
  }

  async saveToAll(entry: Omit<MemoryEntry, 'id'>): Promise<Record<string, string>> {
    const results: Record<string, string> = {};

    for (const [name, store] of this.stores) {
      try {
        results[name] = await store.save(entry);
      } catch (error) {
        console.error(`Failed to save to ${name}:`, error);
        results[name] = 'error';
      }
    }

    return results;
  }

  async queryAll(params: MemoryQuery): Promise<Record<string, MemoryEntry[]>> {
    const results: Record<string, MemoryEntry[]> = {};

    for (const [name, store] of this.stores) {
      try {
        results[name] = await store.query(params);
      } catch (error) {
        console.error(`Failed to query ${name}:`, error);
        results[name] = [];
      }
    }

    return results;
  }

  async synthesize(userId: string): Promise<{
    patterns: string[];
    insights: string[];
    evolution: string;
  }> {
    const allMemories = await this.queryAll({ userId });
    const patterns: Set<string> = new Set();
    const insights: Set<string> = new Set();

    // Analyze memories across all stores
    for (const [storeName, memories] of Object.entries(allMemories)) {
      for (const memory of memories) {
        // Extract patterns based on memory type
        if (memory.type === 'pattern' && memory.content) {
          patterns.add(typeof memory.content === 'string' ? memory.content : JSON.stringify(memory.content));
        }

        if (memory.type === 'breakthrough' && memory.content?.insight) {
          insights.add(memory.content.insight);
        }
      }
    }

    // Determine evolution stage based on memory count and types
    const totalMemories = Object.values(allMemories).reduce((sum, mems) => sum + mems.length, 0);
    const evolution = totalMemories < 10 ? 'nascent' :
                     totalMemories < 50 ? 'awakening' :
                     totalMemories < 100 ? 'expanding' :
                     totalMemories < 500 ? 'integrated' : 'transcendent';

    return {
      patterns: Array.from(patterns),
      insights: Array.from(insights),
      evolution
    };
  }

  async saveAgentMemory(agentId: string, memory: AgentMemory): Promise<void> {
    const store = this.stores.get('agent');
    if (!store) {
      throw new Error('Agent memory store not registered');
    }

    await store.save({
      timestamp: new Date(),
      type: 'conversation',
      content: memory,
      metadata: { agentId, userId: memory.userId }
    });
  }

  async loadAgentMemory(agentId: string): Promise<AgentMemory | null> {
    const store = this.stores.get('agent');
    if (!store) {
      return null;
    }

    const memories = await store.query({ agentId, limit: 1 });
    return memories.length > 0 ? memories[0].content as AgentMemory : null;
  }

  async findRelated(entryId: string, maxResults: number = 10): Promise<MemoryEntry[]> {
    // This would use vector similarity in production
    // For now, returning empty array
    return [];
  }

  async findSimilar(content: any, maxResults: number = 10): Promise<MemoryEntry[]> {
    // This would use vector similarity in production
    // For now, returning empty array
    return [];
  }
}

// Singleton instance
let _unifiedMemory: UnifiedMemorySystem | null = null;

export const getUnifiedMemory = (): UnifiedMemorySystem => {
  if (!_unifiedMemory) {
    _unifiedMemory = new UnifiedMemorySystem();
  }
  return _unifiedMemory;
};