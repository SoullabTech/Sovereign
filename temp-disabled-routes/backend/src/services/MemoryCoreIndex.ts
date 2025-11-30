/**
 * 🧠 MemoryCoreIndex - Unified Soul Memory OS (Production Version)
 * 
 * Simplified production-ready version that works without all dependencies
 * Provides a unified interface with graceful degradation
 */

import { logger } from '../utils/logger';

// Type definitions
export type MemoryType = 
  | 'conversation'
  | 'insight'
  | 'breakthrough'
  | 'ritual'
  | 'journal'
  | 'dream'
  | 'reflection'
  | 'synchronicity'
  | 'pattern'
  | 'voice'
  | 'vision';

export interface MemoryMetadata {
  userId: string;
  sessionId?: string;
  element?: 'air' | 'fire' | 'water' | 'earth' | 'aether';
  emotionalState?: string;
  ritualPhase?: string;
  archetype?: string;
  source?: string;
  responseType?: string;
  relatedQuery?: string;
  [key: string]: any;
}

export interface MemoryEntry {
  id: string;
  userId: string;
  type: MemoryType;
  content: string;
  metadata: MemoryMetadata;
  timestamp: Date;
  relevance?: number;
}

export interface MemoryContext {
  query: string;
  userId: string;
  sessionId?: string;
  element?: 'air' | 'fire' | 'water' | 'earth' | 'aether';
  limit?: number;
  includeRituals?: boolean;
  includeReflections?: boolean;
  includeSynchronicities?: boolean;
}

export interface MemorySearchResult {
  results: MemoryEntry[];
  patterns: string[];
  summary?: string;
}

/**
 * Simplified Memory Core Index for Production
 */
export class MemoryCoreIndex {
  // In-memory storage for basic functionality
  private memories: Map<string, MemoryEntry[]> = new Map();
  private sessionMemories: Map<string, MemoryEntry[]> = new Map();
  private patterns: Map<string, string[]> = new Map();
  
  constructor() {
    logger.info('🧠 MemoryCoreIndex initialized (production mode)');
  }

  /**
   * Store a memory
   */
  async remember(
    content: string,
    type: MemoryType,
    metadata: MemoryMetadata,
    userId: string
  ): Promise<MemoryEntry> {
    const memoryId = `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const memory: MemoryEntry = {
      id: memoryId,
      userId,
      type,
      content,
      metadata,
      timestamp: new Date()
    };

    // Store in user memories
    const userMemories = this.memories.get(userId) || [];
    userMemories.push(memory);
    this.memories.set(userId, userMemories);

    // Store in session memories if sessionId provided
    if (metadata.sessionId) {
      const sessionKey = `${userId}_${metadata.sessionId}`;
      const sessionMems = this.sessionMemories.get(sessionKey) || [];
      sessionMems.push(memory);
      this.sessionMemories.set(sessionKey, sessionMems);
    }

    // Detect patterns
    this.detectPatterns(userId, content, type);

    logger.debug(`💾 Stored ${type} memory for user ${userId}`);
    return memory;
  }

  /**
   * Recall relevant memories
   */
  async recall(context: MemoryContext): Promise<MemorySearchResult> {
    const { userId, query, limit = 5, sessionId } = context;
    
    // Get user memories
    const userMemories = this.memories.get(userId) || [];
    
    // Get session memories if available
    let sessionMems: MemoryEntry[] = [];
    if (sessionId) {
      const sessionKey = `${userId}_${sessionId}`;
      sessionMems = this.sessionMemories.get(sessionKey) || [];
    }

    // Combine and sort by relevance (simple text matching for now)
    const allMemories = [...userMemories, ...sessionMems];
    const uniqueMemories = this.deduplicateMemories(allMemories);
    
    // Simple relevance scoring based on query terms
    const scoredMemories = uniqueMemories.map(mem => ({
      ...mem,
      relevance: this.calculateRelevance(mem, query, context)
    }));

    // Sort by relevance and recency
    scoredMemories.sort((a, b) => {
      const scoreDiff = (b.relevance || 0) - (a.relevance || 0);
      if (Math.abs(scoreDiff) > 0.1) return scoreDiff;
      return b.timestamp.getTime() - a.timestamp.getTime();
    });

    // Get top memories
    const topMemories = scoredMemories.slice(0, limit);

    // Get patterns for this user
    const userPatterns = this.patterns.get(userId) || [];

    // Generate summary
    const summary = this.generateSummary(topMemories);

    return {
      results: topMemories,
      patterns: userPatterns.slice(0, 3),
      summary
    };
  }

  /**
   * Calculate relevance score
   */
  private calculateRelevance(
    memory: MemoryEntry,
    query: string,
    context: MemoryContext
  ): number {
    let score = 0;
    
    // Query term matching
    const queryTerms = query.toLowerCase().split(/\s+/);
    const contentLower = memory.content.toLowerCase();
    
    for (const term of queryTerms) {
      if (contentLower.includes(term)) {
        score += 0.3;
      }
    }

    // Type preference
    if (context.includeRituals && memory.type === 'ritual') score += 0.2;
    if (context.includeReflections && memory.type === 'reflection') score += 0.2;
    if (context.includeSynchronicities && memory.type === 'synchronicity') score += 0.3;

    // Element matching
    if (context.element && memory.metadata.element === context.element) {
      score += 0.2;
    }

    // Recency bonus (memories from last 24 hours)
    const hoursSince = (Date.now() - memory.timestamp.getTime()) / (1000 * 60 * 60);
    if (hoursSince < 24) score += 0.1;
    if (hoursSince < 1) score += 0.2;

    // Session continuity
    if (context.sessionId && memory.metadata.sessionId === context.sessionId) {
      score += 0.3;
    }

    return Math.min(score, 1.0);
  }

  /**
   * Detect patterns in memories
   */
  private detectPatterns(userId: string, content: string, type: MemoryType): void {
    const userPatterns = this.patterns.get(userId) || [];
    
    // Simple pattern detection
    const patterns: string[] = [];
    
    // Elemental patterns
    if (content.match(/\b(fire|passion|energy|transform)/i)) {
      patterns.push('Fire element emerging');
    }
    if (content.match(/\b(water|flow|emotion|feel)/i)) {
      patterns.push('Water element flowing');
    }
    if (content.match(/\b(earth|ground|stable|practical)/i)) {
      patterns.push('Earth element grounding');
    }
    if (content.match(/\b(air|thought|idea|clarity)/i)) {
      patterns.push('Air element clarifying');
    }
    
    // Growth patterns
    if (content.match(/\b(grow|evolve|change|transform|shift)/i)) {
      patterns.push('Transformation in progress');
    }
    if (content.match(/\b(realize|understand|see|clarity|insight)/i)) {
      patterns.push('Awakening insights');
    }
    
    // Add unique patterns
    for (const pattern of patterns) {
      if (!userPatterns.includes(pattern)) {
        userPatterns.push(pattern);
      }
    }
    
    // Keep only recent patterns (last 10)
    this.patterns.set(userId, userPatterns.slice(-10));
  }

  /**
   * Generate summary of memories
   */
  private generateSummary(memories: MemoryEntry[]): string {
    if (memories.length === 0) {
      return 'Beginning a new journey of discovery.';
    }

    const types = memories.map(m => m.type);
    const uniqueTypes = [...new Set(types)];
    
    if (uniqueTypes.includes('breakthrough')) {
      return 'Recent breakthroughs are illuminating your path.';
    }
    if (uniqueTypes.includes('synchronicity')) {
      return 'Meaningful synchronicities are weaving through your experience.';
    }
    if (uniqueTypes.includes('ritual')) {
      return 'Sacred rituals are anchoring your transformation.';
    }
    
    return `Continuing our exploration through ${uniqueTypes.join(', ')}.`;
  }

  /**
   * Deduplicate memories
   */
  private deduplicateMemories(memories: MemoryEntry[]): MemoryEntry[] {
    const seen = new Set<string>();
    return memories.filter(mem => {
      if (seen.has(mem.id)) return false;
      seen.add(mem.id);
      return true;
    });
  }

  /**
   * Get memory statistics
   */
  async getStats(userId: string): Promise<{
    totalMemories: number;
    byType: Record<MemoryType, number>;
    patterns: string[];
    recentActivity: Date | null;
  }> {
    const userMemories = this.memories.get(userId) || [];
    const userPatterns = this.patterns.get(userId) || [];
    
    const byType: Record<string, number> = {};
    let recentActivity: Date | null = null;
    
    for (const mem of userMemories) {
      byType[mem.type] = (byType[mem.type] || 0) + 1;
      if (!recentActivity || mem.timestamp > recentActivity) {
        recentActivity = mem.timestamp;
      }
    }
    
    return {
      totalMemories: userMemories.length,
      byType: byType as Record<MemoryType, number>,
      patterns: userPatterns,
      recentActivity
    };
  }

  /**
   * Clear session memories (for privacy)
   */
  async clearSession(userId: string, sessionId: string): Promise<void> {
    const sessionKey = `${userId}_${sessionId}`;
    this.sessionMemories.delete(sessionKey);
    logger.info(`🧹 Cleared session memories for ${sessionKey}`);
  }
}