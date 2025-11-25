/**
 * mem0 integration adapter for MAIA Consciousness Lattice
 * Provides compatibility with mem0's memory persistence and retrieval
 */

import { MemoryKeeper } from '../memory-keeper';
import { VectorEmbeddingService } from '../vector-embeddings';
import { RepositoryFactory, IRepository } from '../database/repository';
import { Memory } from '../database/entities';

/**
 * mem0-compatible memory interface
 */
export interface Mem0Memory {
  id: string;
  user_id: string;
  content: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  embedding?: number[];
}

/**
 * mem0-compatible search result
 */
export interface Mem0SearchResult {
  memory: Mem0Memory;
  score: number;
}

/**
 * mem0 configuration
 */
export interface Mem0Config {
  api_key?: string;
  org_id?: string;
  project_id?: string;
  version?: string;
}

/**
 * Adapter to make MemoryKeeper compatible with mem0
 */
export class Mem0Adapter {
  private memoryKeeper: MemoryKeeper;
  private embeddingService: VectorEmbeddingService;
  private repository: IRepository<Memory>;
  private config: Mem0Config;

  constructor(
    memoryKeeper: MemoryKeeper,
    embeddingService: VectorEmbeddingService,
    config?: Mem0Config
  ) {
    this.memoryKeeper = memoryKeeper;
    this.embeddingService = embeddingService;
    this.repository = RepositoryFactory.createRepository<Memory>('memories');
    this.config = config || {};
  }

  /**
   * Add a memory (mem0 compatible)
   */
  async add(
    content: string,
    user_id: string,
    metadata?: Record<string, any>
  ): Promise<Mem0Memory> {
    // Generate embedding
    const embedding = await this.embeddingService.getEmbedding(content);

    // Store in both MemoryKeeper and repository
    await this.memoryKeeper.storeEpisodic(user_id, {
      content,
      metadata,
      embedding
    });

    // Create database record
    const memory = await this.repository.create({
      userId: user_id,
      type: 'episodic',
      content: { text: content, ...metadata },
      embedding,
      resonance: 0.5,
      connections: [],
      metadata
    });

    // Convert to mem0 format
    return this.toMem0Format(memory);
  }

  /**
   * Get a memory by ID
   */
  async get(memory_id: string): Promise<Mem0Memory | null> {
    const memory = await this.repository.findById(memory_id);
    return memory ? this.toMem0Format(memory) : null;
  }

  /**
   * Get all memories for a user
   */
  async get_all(user_id: string, limit?: number): Promise<Mem0Memory[]> {
    const memories = await this.repository.findMany(
      [{ field: 'userId', operator: '=', value: user_id }],
      { limit: limit || 100, orderBy: 'createdAt', order: 'desc' }
    );

    return memories.map(m => this.toMem0Format(m));
  }

  /**
   * Search memories
   */
  async search(
    query: string,
    user_id?: string,
    limit?: number
  ): Promise<Mem0SearchResult[]> {
    // Get all relevant memories
    let memories: Memory[];
    if (user_id) {
      memories = await this.repository.findMany(
        [{ field: 'userId', operator: '=', value: user_id }]
      );
    } else {
      memories = await this.repository.findMany();
    }

    if (memories.length === 0) {
      return [];
    }

    // Find similar memories using embeddings
    const candidates = memories
      .filter(m => m.content && typeof m.content === 'object' && m.content.text)
      .map(m => m.content.text as string);

    const similarities = await this.embeddingService.findSimilar(
      query,
      candidates,
      limit || 10
    );

    // Map back to memories with scores
    const results: Mem0SearchResult[] = [];
    for (const similarity of similarities) {
      const memory = memories.find(m =>
        m.content && m.content.text === similarity.text
      );
      if (memory) {
        results.push({
          memory: this.toMem0Format(memory),
          score: similarity.score
        });
      }
    }

    return results;
  }

  /**
   * Update a memory
   */
  async update(memory_id: string, content: string): Promise<Mem0Memory | null> {
    const existing = await this.repository.findById(memory_id);
    if (!existing) return null;

    // Generate new embedding
    const embedding = await this.embeddingService.getEmbedding(content);

    // Update in repository
    const updated = await this.repository.update(memory_id, {
      content: { ...existing.content, text: content },
      embedding
    });

    return this.toMem0Format(updated);
  }

  /**
   * Delete a memory
   */
  async delete(memory_id: string): Promise<boolean> {
    return await this.repository.delete(memory_id);
  }

  /**
   * Delete all memories for a user
   */
  async delete_all(user_id: string): Promise<number> {
    const memories = await this.repository.findMany([
      { field: 'userId', operator: '=', value: user_id }
    ]);

    let deleted = 0;
    for (const memory of memories) {
      if (await this.repository.delete(memory.id!)) {
        deleted++;
      }
    }

    // Also clear from MemoryKeeper
    this.memoryKeeper.clearUserMemories(user_id);

    return deleted;
  }

  /**
   * Get memory history for a user
   */
  async history(user_id: string, memory_id?: string): Promise<any[]> {
    // This would track memory versions/edits
    // For now, return the current state
    if (memory_id) {
      const memory = await this.get(memory_id);
      return memory ? [memory] : [];
    }

    return await this.get_all(user_id);
  }

  /**
   * Reset all memories (careful!)
   */
  async reset(): Promise<void> {
    RepositoryFactory.clearAll();
    this.embeddingService.clearCache();
  }

  /**
   * Convert Memory to mem0 format
   */
  private toMem0Format(memory: Memory): Mem0Memory {
    return {
      id: memory.id!,
      user_id: memory.userId,
      content: typeof memory.content === 'object' && memory.content.text
        ? memory.content.text
        : JSON.stringify(memory.content),
      metadata: memory.metadata || {},
      created_at: memory.createdAt?.toISOString() || new Date().toISOString(),
      updated_at: memory.updatedAt?.toISOString() || new Date().toISOString(),
      embedding: memory.embedding
    };
  }
}

/**
 * mem0 client interface for external API integration
 */
export class Mem0Client {
  private adapter: Mem0Adapter;
  private apiEndpoint?: string;

  constructor(
    adapter: Mem0Adapter,
    apiEndpoint?: string
  ) {
    this.adapter = adapter;
    this.apiEndpoint = apiEndpoint;
  }

  /**
   * Sync local memories with mem0 cloud
   */
  async sync(user_id: string): Promise<void> {
    if (!this.apiEndpoint) {
      throw new Error('API endpoint not configured for sync');
    }

    // Get local memories
    const localMemories = await this.adapter.get_all(user_id);

    // Send to mem0 cloud
    const response = await fetch(`${this.apiEndpoint}/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id,
        memories: localMemories
      })
    });

    if (!response.ok) {
      throw new Error(`Sync failed: ${response.statusText}`);
    }
  }

  /**
   * Import memories from mem0 cloud
   */
  async import(user_id: string): Promise<number> {
    if (!this.apiEndpoint) {
      throw new Error('API endpoint not configured for import');
    }

    const response = await fetch(`${this.apiEndpoint}/export/${user_id}`);
    if (!response.ok) {
      throw new Error(`Import failed: ${response.statusText}`);
    }

    const data = await response.json();
    const memories = data.memories || [];

    let imported = 0;
    for (const memory of memories) {
      await this.adapter.add(
        memory.content,
        user_id,
        memory.metadata
      );
      imported++;
    }

    return imported;
  }
}

/**
 * Factory for creating mem0-compatible components
 */
export class Mem0IntegrationFactory {
  /**
   * Create mem0 adapter
   */
  static createAdapter(
    memoryKeeper: MemoryKeeper,
    embeddingService: VectorEmbeddingService,
    config?: Mem0Config
  ): Mem0Adapter {
    return new Mem0Adapter(memoryKeeper, embeddingService, config);
  }

  /**
   * Create mem0 client with cloud sync
   */
  static createClient(
    memoryKeeper: MemoryKeeper,
    embeddingService: VectorEmbeddingService,
    apiEndpoint?: string,
    config?: Mem0Config
  ): Mem0Client {
    const adapter = this.createAdapter(memoryKeeper, embeddingService, config);
    return new Mem0Client(adapter, apiEndpoint);
  }

  /**
   * Create complete mem0 integration
   */
  static createIntegration(options: {
    memoryKeeper: MemoryKeeper;
    embeddingService: VectorEmbeddingService;
    apiEndpoint?: string;
    config?: Mem0Config;
  }) {
    const adapter = this.createAdapter(
      options.memoryKeeper,
      options.embeddingService,
      options.config
    );

    const client = new Mem0Client(adapter, options.apiEndpoint);

    return {
      adapter,
      client,
      // Convenience methods
      add: adapter.add.bind(adapter),
      search: adapter.search.bind(adapter),
      get: adapter.get.bind(adapter),
      update: adapter.update.bind(adapter),
      delete: adapter.delete.bind(adapter)
    };
  }
}