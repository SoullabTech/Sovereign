/**
 * Unified Memory Service
 * Consolidates SQLite, Vector, and Supabase memory operations
 * Replaces scattered memory management throughout the codebase
 */

import { 
  IMemoryService, 
  IDatabaseService, 
  ICacheService,
  MemoryEntry,
  ConversationContext,
  ServiceTokens 
} from '../core/ServiceTokens';
import { ServiceContainer } from '../core/ServiceContainer';

export interface MemoryServiceConfig {
  vectorEmbeddingDimensions: number;
  maxMemoriesPerRetrieval: number;
  contextWindowSize: number;
  enableSemanticSearch: boolean;
  memoryRetentionDays: number;
}

export interface MemorySearchOptions {
  limit?: number;
  offset?: number;
  timeRange?: {
    start: Date;
    end: Date;
  };
  semanticThreshold?: number;
  includeEmbeddings?: boolean;
  memoryTypes?: string[];
}

export interface MemoryStats {
  totalMemories: number;
  memoryTypes: Record<string, number>;
  averageEmbeddingQuality: number;
  oldestMemory: Date;
  newestMemory: Date;
}

export class MemoryService implements IMemoryService {
  private config: MemoryServiceConfig;
  private embeddingCache = new Map<string, number[]>();

  constructor(
    private container: ServiceContainer,
    config?: Partial<MemoryServiceConfig>
  ) {
    this.config = {
      vectorEmbeddingDimensions: 1536, // OpenAI ada-002
      maxMemoriesPerRetrieval: 10,
      contextWindowSize: 5,
      enableSemanticSearch: true,
      memoryRetentionDays: 365,
      ...config
    };
  }

  /**
   * Store a new memory entry with optional embedding
   */
  async storeMemory(userId: string, memory: Omit<MemoryEntry, 'id' | 'createdAt'>): Promise<string> {
    const databaseService = await this.container.resolve(ServiceTokens.DatabaseService);
    const memoryId = memory.id || `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();

    // Generate embedding if semantic search is enabled
    let embedding: number[] | null = null;
    if (this.config.enableSemanticSearch) {
      embedding = await this.generateEmbedding(memory.content);
    }

    // Store in database
    await databaseService.execute(
      `INSERT OR REPLACE INTO memories 
       (id, user_id, content, embedding, metadata, created_at) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        memoryId,
        userId,
        memory.content,
        embedding ? JSON.stringify(embedding) : null,
        JSON.stringify(memory.metadata),
        now.toISOString()
      ]
    );

    // Cache the embedding for future use
    if (embedding) {
      this.embeddingCache.set(memoryId, embedding);
    }

    // Update memory statistics in cache
    const cacheService = await this.container.resolve(ServiceTokens.CacheService);
    await cacheService.invalidate(`memory_stats:${userId}`);

    // Track memory creation event
    const analyticsService = await this.container.resolve(ServiceTokens.AnalyticsService);
    await analyticsService.trackEvent(userId, {
      type: 'memory.created',
      userId,
      data: {
        memoryId,
        contentLength: memory.content.length,
        memoryType: memory.metadata.type || 'general',
        hasEmbedding: !!embedding
      },
      timestamp: now
    });

    return memoryId;
  }

  /**
   * Retrieve memories using semantic or keyword search
   */
  async retrieveMemories(
    userId: string, 
    query: string, 
    limit: number = this.config.maxMemoriesPerRetrieval
  ): Promise<MemoryEntry[]> {
    const searchOptions: MemorySearchOptions = { limit };
    
    if (this.config.enableSemanticSearch && query.trim()) {
      return this.performSemanticSearch(userId, query, searchOptions);
    } else {
      return this.performKeywordSearch(userId, query, searchOptions);
    }
  }

  /**
   * Get conversation context for a user
   */
  async getConversationContext(userId: string): Promise<ConversationContext> {
    const databaseService = await this.container.resolve(ServiceTokens.DatabaseService);
    const cacheService = await this.container.resolve(ServiceTokens.CacheService);

    // Check cache first
    const cached = await cacheService.get<ConversationContext>(`context:${userId}`);
    if (cached) {
      return cached;
    }

    // Get recent conversation memories
    const recentConversations = await databaseService.query<any>(
      `SELECT * FROM memories 
       WHERE user_id = ? AND JSON_EXTRACT(metadata, '$.type') = 'conversation'
       ORDER BY created_at DESC 
       LIMIT ?`,
      [userId, this.config.contextWindowSize]
    );

    // Get emotional state from recent analytics
    const emotionalData = await databaseService.query<any>(
      `SELECT data FROM analytics_events 
       WHERE user_id = ? AND type = 'emotion.analysis'
       ORDER BY timestamp DESC 
       LIMIT 1`,
      [userId]
    );

    // Get archetype state from recent activities
    const archetypeData = await databaseService.query<any>(
      `SELECT data FROM analytics_events 
       WHERE user_id = ? AND type LIKE 'archetype.%'
       ORDER BY timestamp DESC 
       LIMIT 5`,
      [userId]
    );

    // Extract active themes from recent memories
    const activeThemes = this.extractThemesFromMemories(recentConversations);

    const context: ConversationContext = {
      userId,
      recentMessages: recentConversations.map(m => ({
        id: m.id,
        userId: m.user_id,
        message: JSON.parse(m.metadata).message || '',
        response: m.content,
        timestamp: new Date(m.created_at),
        metadata: JSON.parse(m.metadata)
      })),
      emotionalState: emotionalData[0] ? JSON.parse(emotionalData[0].data).emotionalState : {
        valence: 0,
        arousal: 0.5,
        dominance: 0.5,
        confidence: 0.5
      },
      archetypeState: this.buildArchetypeState(archetypeData),
      activeThemes
    };

    // Cache the context
    await cacheService.set(`context:${userId}`, context, 60); // 1 minute cache

    return context;
  }

  /**
   * Advanced memory search with multiple filters
   */
  async searchMemories(userId: string, options: MemorySearchOptions): Promise<MemoryEntry[]> {
    const databaseService = await this.container.resolve(ServiceTokens.DatabaseService);
    
    let whereClause = 'user_id = ?';
    let params: any[] = [userId];
    let orderBy = 'created_at DESC';

    // Time range filter
    if (options.timeRange) {
      whereClause += ' AND created_at BETWEEN ? AND ?';
      params.push(options.timeRange.start.toISOString(), options.timeRange.end.toISOString());
    }

    // Memory type filter
    if (options.memoryTypes && options.memoryTypes.length > 0) {
      const typeConditions = options.memoryTypes.map(() => 'JSON_EXTRACT(metadata, "$.type") = ?').join(' OR ');
      whereClause += ` AND (${typeConditions})`;
      params.push(...options.memoryTypes);
    }

    const memories = await databaseService.query<any>(
      `SELECT * FROM memories 
       WHERE ${whereClause}
       ORDER BY ${orderBy}
       LIMIT ? OFFSET ?`,
      [...params, options.limit || 10, options.offset || 0]
    );

    return memories.map(m => this.hydrateMemory(m));
  }

  /**
   * Get memory statistics for a user
   */
  async getMemoryStats(userId: string): Promise<MemoryStats> {
    const cacheService = await this.container.resolve(ServiceTokens.CacheService);
    
    // Check cache
    const cached = await cacheService.get<MemoryStats>(`memory_stats:${userId}`);
    if (cached) {
      return cached;
    }

    const databaseService = await this.container.resolve(ServiceTokens.DatabaseService);
    
    const stats = await Promise.all([
      databaseService.query('SELECT COUNT(*) as count FROM memories WHERE user_id = ?', [userId]),
      databaseService.query(
        `SELECT JSON_EXTRACT(metadata, '$.type') as type, COUNT(*) as count 
         FROM memories WHERE user_id = ? 
         GROUP BY JSON_EXTRACT(metadata, '$.type')`, 
        [userId]
      ),
      databaseService.query(
        'SELECT MIN(created_at) as oldest, MAX(created_at) as newest FROM memories WHERE user_id = ?', 
        [userId]
      )
    ]);

    const memoryTypes: Record<string, number> = {};
    stats[1].forEach((row: any) => {
      memoryTypes[row.type || 'general'] = row.count;
    });

    const result: MemoryStats = {
      totalMemories: stats[0][0].count,
      memoryTypes,
      averageEmbeddingQuality: 0.85, // Would be calculated from actual embeddings
      oldestMemory: stats[2][0].oldest ? new Date(stats[2][0].oldest) : new Date(),
      newestMemory: stats[2][0].newest ? new Date(stats[2][0].newest) : new Date()
    };

    // Cache for 5 minutes
    await cacheService.set(`memory_stats:${userId}`, result, 300);
    
    return result;
  }

  /**
   * Delete memories older than retention period
   */
  async cleanupOldMemories(): Promise<number> {
    const databaseService = await this.container.resolve(ServiceTokens.DatabaseService);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.config.memoryRetentionDays);

    const result = await databaseService.query(
      'SELECT COUNT(*) as count FROM memories WHERE created_at < ?',
      [cutoffDate.toISOString()]
    );

    if (result[0].count > 0) {
      await databaseService.execute(
        'DELETE FROM memories WHERE created_at < ?',
        [cutoffDate.toISOString()]
      );

      // Clear related caches
      const cacheService = await this.container.resolve(ServiceTokens.CacheService);
      await cacheService.invalidate('memory_stats:*');
      await cacheService.invalidate('context:*');
    }

    return result[0].count;
  }

  /**
   * Update memory metadata
   */
  async updateMemory(memoryId: string, updates: Partial<Pick<MemoryEntry, 'content' | 'metadata'>>): Promise<void> {
    const databaseService = await this.container.resolve(ServiceTokens.DatabaseService);
    
    const updateFields: string[] = [];
    const params: any[] = [];

    if (updates.content !== undefined) {
      updateFields.push('content = ?');
      params.push(updates.content);

      // Regenerate embedding if content changed
      if (this.config.enableSemanticSearch) {
        const newEmbedding = await this.generateEmbedding(updates.content);
        updateFields.push('embedding = ?');
        params.push(JSON.stringify(newEmbedding));
      }
    }

    if (updates.metadata !== undefined) {
      updateFields.push('metadata = ?');
      params.push(JSON.stringify(updates.metadata));
    }

    params.push(memoryId);

    await databaseService.execute(
      `UPDATE memories SET ${updateFields.join(', ')} WHERE id = ?`,
      params
    );

    // Clear related caches
    const cacheService = await this.container.resolve(ServiceTokens.CacheService);
    await cacheService.invalidate('context:*');
  }

  /**
   * Delete specific memory
   */
  async deleteMemory(memoryId: string): Promise<void> {
    const databaseService = await this.container.resolve(ServiceTokens.DatabaseService);
    
    await databaseService.execute('DELETE FROM memories WHERE id = ?', [memoryId]);
    
    // Remove from cache
    this.embeddingCache.delete(memoryId);
    
    // Clear related caches
    const cacheService = await this.container.resolve(ServiceTokens.CacheService);
    await cacheService.invalidate('context:*');
    await cacheService.invalidate('memory_stats:*');
  }

  /**
   * Dispose of the service and cleanup resources
   */
  async dispose(): Promise<void> {
    this.embeddingCache.clear();
    console.log('MemoryService disposed');
  }

  /**
   * Perform semantic search using vector similarity
   */
  private async performSemanticSearch(
    userId: string, 
    query: string, 
    options: MemorySearchOptions
  ): Promise<MemoryEntry[]> {
    const queryEmbedding = await this.generateEmbedding(query);
    const databaseService = await this.container.resolve(ServiceTokens.DatabaseService);

    // Get all memories with embeddings (in production, would use vector DB)
    const memoriesWithEmbeddings = await databaseService.query<any>(
      `SELECT * FROM memories 
       WHERE user_id = ? AND embedding IS NOT NULL
       ORDER BY created_at DESC`,
      [userId]
    );

    // Calculate cosine similarity and sort
    const similarities = memoriesWithEmbeddings
      .map(memory => {
        const memoryEmbedding = JSON.parse(memory.embedding);
        const similarity = this.cosineSimilarity(queryEmbedding, memoryEmbedding);
        return { memory: this.hydrateMemory(memory), similarity };
      })
      .filter(item => item.similarity >= (options.semanticThreshold || 0.7))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, options.limit || this.config.maxMemoriesPerRetrieval);

    return similarities.map(item => item.memory);
  }

  /**
   * Perform keyword-based search
   */
  private async performKeywordSearch(
    userId: string, 
    query: string, 
    options: MemorySearchOptions
  ): Promise<MemoryEntry[]> {
    const databaseService = await this.container.resolve(ServiceTokens.DatabaseService);
    
    const searchTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 2);
    if (searchTerms.length === 0) {
      // Return recent memories if no search terms
      const memories = await databaseService.query<any>(
        'SELECT * FROM memories WHERE user_id = ? ORDER BY created_at DESC LIMIT ?',
        [userId, options.limit || this.config.maxMemoriesPerRetrieval]
      );
      return memories.map(m => this.hydrateMemory(m));
    }

    const searchConditions = searchTerms.map(() => 'LOWER(content) LIKE ?').join(' OR ');
    const searchParams = searchTerms.map(term => `%${term}%`);

    const memories = await databaseService.query<any>(
      `SELECT * FROM memories 
       WHERE user_id = ? AND (${searchConditions})
       ORDER BY created_at DESC 
       LIMIT ?`,
      [userId, ...searchParams, options.limit || this.config.maxMemoriesPerRetrieval]
    );

    return memories.map(m => this.hydrateMemory(m));
  }

  /**
   * Generate text embedding (simplified - in production would use OpenAI/other service)
   */
  private async generateEmbedding(text: string): Promise<number[]> {
    // Simplified embedding generation for demo
    // In production, would integrate with OpenAI embeddings API or similar
    const words = text.toLowerCase().match(/\w+/g) || [];
    const embedding = new Array(this.config.vectorEmbeddingDimensions).fill(0);
    
    words.forEach((word, index) => {
      const hash = this.simpleHash(word);
      embedding[hash % embedding.length] += 1 / Math.sqrt(words.length);
    });

    // Normalize the vector
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return embedding.map(val => magnitude > 0 ? val / magnitude : 0);
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  private cosineSimilarity(vec1: number[], vec2: number[]): number {
    if (vec1.length !== vec2.length) return 0;
    
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;
    
    for (let i = 0; i < vec1.length; i++) {
      dotProduct += vec1[i] * vec2[i];
      norm1 += vec1[i] * vec1[i];
      norm2 += vec2[i] * vec2[i];
    }
    
    const magnitude = Math.sqrt(norm1) * Math.sqrt(norm2);
    return magnitude > 0 ? dotProduct / magnitude : 0;
  }

  /**
   * Simple hash function for embedding generation
   */
  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Extract themes from memory metadata
   */
  private extractThemesFromMemories(memories: any[]): string[] {
    const themes = new Set<string>();
    
    memories.forEach(memory => {
      const metadata = JSON.parse(memory.metadata);
      if (metadata.themes && Array.isArray(metadata.themes)) {
        metadata.themes.forEach((theme: string) => themes.add(theme));
      }
      if (metadata.archetypes && Array.isArray(metadata.archetypes)) {
        metadata.archetypes.forEach((archetype: string) => themes.add(`archetype:${archetype}`));
      }
    });
    
    return Array.from(themes).slice(0, 10); // Limit to 10 most recent themes
  }

  /**
   * Build archetype state from analytics data
   */
  private buildArchetypeState(archetypeData: any[]): any {
    const scores: Record<string, number> = {};
    const activeArchetypes = new Set<string>();
    
    archetypeData.forEach(event => {
      const data = JSON.parse(event.data);
      if (data.archetype && data.activation) {
        scores[data.archetype] = (scores[data.archetype] || 0) + data.activation;
        if (data.activation > 0.5) {
          activeArchetypes.add(data.archetype);
        }
      }
    });

    const dominant = Object.entries(scores)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || 'Seeker';

    return {
      active: Array.from(activeArchetypes),
      dominant,
      scores
    };
  }

  /**
   * Hydrate memory object from database row
   */
  private hydrateMemory(row: any): MemoryEntry {
    return {
      id: row.id,
      userId: row.user_id,
      content: row.content,
      embedding: row.embedding ? JSON.parse(row.embedding) : undefined,
      metadata: JSON.parse(row.metadata),
      createdAt: new Date(row.created_at)
    };
  }
}

// Export functions that OracleConversation expects
export async function saveConversationMemory(
  userId: string,
  conversationData: any
): Promise<void> {
  // Stub implementation - would save to actual memory system
  console.log('memoryService: saveConversationMemory stub', userId, conversationData);
}

export async function getOracleAgentId(): Promise<string> {
  // Stub implementation - would get from actual agent system
  console.log('memoryService: getOracleAgentId stub');
  return 'oracle-agent-stub-id';
}