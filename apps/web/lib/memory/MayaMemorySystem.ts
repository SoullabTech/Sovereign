/**
 * Maya Memory System - Contextual Intelligence Layer
 * Powered by Mem0 for persistent memory across sessions
 */

// import { MemoryClient } from 'mem0ai'; // TODO: Add to package.json
const MemoryClient: any = {}; // Temporary stub
import { EventEmitter } from 'events';

interface MemoryContext {
  userId: string;
  sessionId: string;
  elementalContext?: string;
  emotionalState?: string;
  conversationStage?: string;
}

interface MemoryEntry {
  content: string;
  timestamp: Date;
  context: MemoryContext;
  relevanceScore?: number;
}

export class MayaMemorySystem extends EventEmitter {
  private client: MemoryClient;
  private memoryCache: Map<string, MemoryEntry[]>;
  private contextWindow: number = 20; // Default context size

  constructor() {
    super();
    this.memoryCache = new Map();
    this.initializeMemory();
  }

  private async initializeMemory() {
    try {
      if (!process.env.MEM0_API_KEY) {
        console.warn('⚠️ MEM0_API_KEY not found - running in degraded mode');
        return;
      }

      this.client = new MemoryClient({
        apiKey: process.env.MEM0_API_KEY,
      });

      console.log('✅ Maya Memory System initialized');
      this.emit('memory:ready');
    } catch (error) {
      console.error('❌ Memory initialization failed:', error);
      this.emit('memory:error', error);
    }
  }

  /**
   * Store a memory with full context
   */
  async remember(
    content: string,
    context: MemoryContext
  ): Promise<void> {
    try {
      // Store in Mem0
      if (this.client) {
        await this.client.add(content, {
          user_id: context.userId,
          metadata: {
            sessionId: context.sessionId,
            elementalContext: context.elementalContext,
            emotionalState: context.emotionalState,
            conversationStage: context.conversationStage,
            timestamp: new Date().toISOString(),
          },
        });
      }

      // Update local cache
      const key = `${context.userId}:${context.sessionId}`;
      const memories = this.memoryCache.get(key) || [];
      memories.push({
        content,
        timestamp: new Date(),
        context,
      });
      this.memoryCache.set(key, memories);

      this.emit('memory:stored', { content, context });
    } catch (error) {
      console.error('Failed to store memory:', error);
      this.emit('memory:error', error);
    }
  }

  /**
   * Retrieve relevant memories for current context
   */
  async recall(
    context: MemoryContext,
    query?: string
  ): Promise<MemoryEntry[]> {
    try {
      if (!this.client) {
        // Fallback to cache-only mode
        return this.getFromCache(context);
      }

      // Search memories with Mem0
      const memories = await this.client.search(query || '', {
        user_id: context.userId,
        limit: this.contextWindow,
      });

      // Transform and enhance with local context
      const enhancedMemories = memories.map((mem: any) => ({
        content: mem.memory,
        timestamp: new Date(mem.created_at),
        context: {
          ...context,
          ...mem.metadata,
        },
        relevanceScore: mem.score,
      }));

      this.emit('memory:recalled', { count: enhancedMemories.length });
      return enhancedMemories;
    } catch (error) {
      console.error('Failed to recall memories:', error);
      return this.getFromCache(context);
    }
  }

  /**
   * Get conversation history for continuity
   */
  async getConversationHistory(
    userId: string,
    sessionId: string,
    limit: number = 10
  ): Promise<string[]> {
    const memories = await this.recall({
      userId,
      sessionId,
    });

    return memories
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit)
      .map(m => m.content);
  }

  /**
   * Analyze patterns in memory for insights
   */
  async analyzePatterns(userId: string): Promise<{
    dominantElements: string[];
    emotionalTrends: string[];
    growthMarkers: string[];
  }> {
    const allMemories = await this.recall({ userId, sessionId: 'all' });

    // Simple pattern analysis (can be enhanced with ML)
    const elements = new Map<string, number>();
    const emotions = new Map<string, number>();

    allMemories.forEach(memory => {
      if (memory.context.elementalContext) {
        elements.set(
          memory.context.elementalContext,
          (elements.get(memory.context.elementalContext) || 0) + 1
        );
      }
      if (memory.context.emotionalState) {
        emotions.set(
          memory.context.emotionalState,
          (emotions.get(memory.context.emotionalState) || 0) + 1
        );
      }
    });

    return {
      dominantElements: Array.from(elements.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(e => e[0]),
      emotionalTrends: Array.from(emotions.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(e => e[0]),
      growthMarkers: this.identifyGrowthMarkers(allMemories),
    };
  }

  /**
   * Clear session-specific memories (privacy)
   */
  async clearSession(userId: string, sessionId: string): Promise<void> {
    const key = `${userId}:${sessionId}`;
    this.memoryCache.delete(key);
    
    if (this.client) {
      // Mem0 doesn't have direct session clearing, so we mark as archived
      await this.remember('Session ended and cleared', {
        userId,
        sessionId,
        conversationStage: 'completed',
      });
    }

    this.emit('memory:cleared', { userId, sessionId });
  }

  private getFromCache(context: MemoryContext): MemoryEntry[] {
    const key = `${context.userId}:${context.sessionId}`;
    return this.memoryCache.get(key) || [];
  }

  private identifyGrowthMarkers(memories: MemoryEntry[]): string[] {
    // Simple heuristic for growth detection
    const markers: string[] = [];
    
    const stages = memories
      .map(m => m.context.conversationStage)
      .filter(Boolean);

    if (stages.includes('transformation')) {
      markers.push('Transformation acknowledged');
    }
    if (stages.includes('integration')) {
      markers.push('Integration in progress');
    }
    if (stages.filter(s => s === 'reflection').length > 3) {
      markers.push('Deep reflection pattern');
    }

    return markers;
  }

  /**
   * Get memory system status
   */
  getStatus(): {
    initialized: boolean;
    cacheSize: number;
    contextWindow: number;
    degradedMode: boolean;
  } {
    return {
      initialized: !!this.client,
      cacheSize: this.memoryCache.size,
      contextWindow: this.contextWindow,
      degradedMode: !process.env.MEM0_API_KEY,
    };
  }
}

// Singleton instance
export const mayaMemory = new MayaMemorySystem();