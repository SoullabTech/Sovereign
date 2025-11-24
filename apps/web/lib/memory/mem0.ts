/**
 * mem0 - Persistent Memory System for MAIA
 * Stores user's symbolic journey, archetypal evolution, and emotional threads
 *
 * Storage: In-memory with optional Redis/SQLite backend
 */

export interface MemoryEntry {
  id: string;
  userId: string;
  type: 'symbol' | 'archetype' | 'emotion' | 'insight' | 'pattern';
  content: string;
  metadata: {
    symbol?: string;
    archetype?: string;
    emotion?: string;
    intensity?: number;
    context?: string;
    relatedEntries?: string[];
  };
  timestamp: string;
  source: 'journal' | 'conversation' | 'ritual' | 'dream';
}

export interface MemoryQuery {
  userId: string;
  type?: MemoryEntry['type'];
  symbol?: string;
  archetype?: string;
  emotion?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}

export interface MemoryThread {
  threadId: string;
  userId: string;
  theme: string;
  entries: MemoryEntry[];
  startDate: string;
  lastUpdate: string;
  significance: number;
}

class Mem0 {
  private memories: Map<string, MemoryEntry[]>;
  private threads: Map<string, MemoryThread>;

  constructor() {
    this.memories = new Map();
    this.threads = new Map();
  }

  async appendMemory(userId: string, memory: Omit<MemoryEntry, 'id' | 'userId' | 'timestamp'>): Promise<MemoryEntry> {
    const entry: MemoryEntry = {
      id: `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      timestamp: new Date().toISOString(),
      ...memory
    };

    const userMemories = this.memories.get(userId) || [];
    userMemories.push(entry);
    this.memories.set(userId, userMemories);

    await this.detectAndUpdateThreads(userId, entry);

    return entry;
  }

  async getMemory(userId: string, query?: MemoryQuery): Promise<MemoryEntry[]> {
    let userMemories = this.memories.get(userId) || [];

    if (query) {
      if (query.type) {
        userMemories = userMemories.filter(m => m.type === query.type);
      }
      if (query.symbol) {
        userMemories = userMemories.filter(m => m.metadata.symbol === query.symbol);
      }
      if (query.archetype) {
        userMemories = userMemories.filter(m => m.metadata.archetype === query.archetype);
      }
      if (query.emotion) {
        userMemories = userMemories.filter(m => m.metadata.emotion === query.emotion);
      }
      if (query.startDate) {
        userMemories = userMemories.filter(m => new Date(m.timestamp) >= query.startDate!);
      }
      if (query.endDate) {
        userMemories = userMemories.filter(m => new Date(m.timestamp) <= query.endDate!);
      }
      if (query.limit) {
        userMemories = userMemories.slice(-query.limit);
      }
    }

    return userMemories.sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  async queryMemory(userId: string, naturalLanguageQuery: string): Promise<{
    memories: MemoryEntry[];
    summary: string;
  }> {
    const allMemories = this.memories.get(userId) || [];

    const keywords = this.extractKeywords(naturalLanguageQuery);

    const relevantMemories = allMemories.filter(memory => {
      const searchText = `${memory.content} ${memory.metadata.symbol} ${memory.metadata.archetype} ${memory.metadata.emotion}`.toLowerCase();
      return keywords.some(keyword => searchText.includes(keyword));
    });

    const summary = this.generateMemorySummary(relevantMemories, naturalLanguageQuery);

    return {
      memories: relevantMemories.slice(0, 10),
      summary
    };
  }

  async getThreads(userId: string): Promise<MemoryThread[]> {
    const userThreadKey = `threads_${userId}`;
    const allThreads = Array.from(this.threads.values()).filter(t => t.userId === userId);

    return allThreads.sort((a, b) => b.significance - a.significance);
  }

  async getRecentPatterns(userId: string, days: number = 30): Promise<{
    recurringSymbols: Array<{ symbol: string; count: number; lastSeen: string }>;
    dominantArchetypes: Array<{ archetype: string; count: number }>;
    emotionalTrends: Array<{ emotion: string; count: number; avgIntensity: number }>;
  }> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const recentMemories = await this.getMemory(userId, {
      userId,
      startDate: cutoffDate
    });

    const symbolCounts = new Map<string, { count: number; lastSeen: string }>();
    const archetypeCounts = new Map<string, number>();
    const emotionData = new Map<string, { count: number; totalIntensity: number }>();

    recentMemories.forEach(mem => {
      if (mem.metadata.symbol) {
        const existing = symbolCounts.get(mem.metadata.symbol) || { count: 0, lastSeen: mem.timestamp };
        symbolCounts.set(mem.metadata.symbol, {
          count: existing.count + 1,
          lastSeen: new Date(mem.timestamp) > new Date(existing.lastSeen) ? mem.timestamp : existing.lastSeen
        });
      }

      if (mem.metadata.archetype) {
        archetypeCounts.set(
          mem.metadata.archetype,
          (archetypeCounts.get(mem.metadata.archetype) || 0) + 1
        );
      }

      if (mem.metadata.emotion) {
        const existing = emotionData.get(mem.metadata.emotion) || { count: 0, totalIntensity: 0 };
        emotionData.set(mem.metadata.emotion, {
          count: existing.count + 1,
          totalIntensity: existing.totalIntensity + (mem.metadata.intensity || 0.5)
        });
      }
    });

    return {
      recurringSymbols: Array.from(symbolCounts.entries())
        .map(([symbol, data]) => ({ symbol, ...data }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
      dominantArchetypes: Array.from(archetypeCounts.entries())
        .map(([archetype, count]) => ({ archetype, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5),
      emotionalTrends: Array.from(emotionData.entries())
        .map(([emotion, data]) => ({
          emotion,
          count: data.count,
          avgIntensity: data.totalIntensity / data.count
        }))
        .sort((a, b) => b.count - a.count)
    };
  }

  async getSymbolicNarrative(userId: string, symbol: string): Promise<{
    firstAppearance: MemoryEntry | null;
    recentMentions: MemoryEntry[];
    evolution: string;
  }> {
    const symbolMemories = await this.getMemory(userId, {
      userId,
      symbol
    });

    if (symbolMemories.length === 0) {
      return {
        firstAppearance: null,
        recentMentions: [],
        evolution: 'This symbol has not yet appeared in your journey.'
      };
    }

    const sorted = symbolMemories.sort((a, b) =>
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    const evolution = this.generateSymbolicEvolutionNarrative(sorted, symbol);

    return {
      firstAppearance: sorted[0],
      recentMentions: sorted.slice(-5).reverse(),
      evolution
    };
  }

  private async detectAndUpdateThreads(userId: string, newEntry: MemoryEntry): Promise<void> {
    const existingThreads = await this.getThreads(userId);

    let threadFound = false;
    for (const thread of existingThreads) {
      if (this.isRelatedToThread(newEntry, thread)) {
        thread.entries.push(newEntry);
        thread.lastUpdate = newEntry.timestamp;
        thread.significance += 0.1;
        this.threads.set(thread.threadId, thread);
        threadFound = true;
        break;
      }
    }

    if (!threadFound && this.isSignificant(newEntry)) {
      const newThread: MemoryThread = {
        threadId: `thread_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        theme: newEntry.metadata.symbol || newEntry.metadata.archetype || 'Unnamed',
        entries: [newEntry],
        startDate: newEntry.timestamp,
        lastUpdate: newEntry.timestamp,
        significance: 0.5
      };
      this.threads.set(newThread.threadId, newThread);
    }
  }

  private isRelatedToThread(entry: MemoryEntry, thread: MemoryThread): boolean {
    return thread.entries.some(threadEntry =>
      threadEntry.metadata.symbol === entry.metadata.symbol ||
      threadEntry.metadata.archetype === entry.metadata.archetype
    );
  }

  private isSignificant(entry: MemoryEntry): boolean {
    return (entry.metadata.intensity || 0) > 0.6 ||
           entry.type === 'insight' ||
           entry.type === 'pattern';
  }

  private extractKeywords(query: string): string[] {
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'about', 'have', 'has', 'had', 'i', 'my'];
    return query
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.includes(word));
  }

  private generateMemorySummary(memories: MemoryEntry[], query: string): string {
    if (memories.length === 0) {
      return "No memories found matching your query.";
    }

    const symbols = new Set(memories.map(m => m.metadata.symbol).filter(Boolean));
    const archetypes = new Set(memories.map(m => m.metadata.archetype).filter(Boolean));

    return `Found ${memories.length} memory threads. ${symbols.size > 0 ? `Symbols present: ${Array.from(symbols).join(', ')}.` : ''} ${archetypes.size > 0 ? `Archetypes: ${Array.from(archetypes).join(', ')}.` : ''}`;
  }

  private generateSymbolicEvolutionNarrative(memories: MemoryEntry[], symbol: string): string {
    if (memories.length === 1) {
      return `The ${symbol} appeared once in your journey.`;
    }

    const firstDate = new Date(memories[0].timestamp).toLocaleDateString();
    const lastDate = new Date(memories[memories.length - 1].timestamp).toLocaleDateString();
    const span = memories.length;

    return `The ${symbol} first appeared on ${firstDate} and has emerged ${span} times since, most recently on ${lastDate}. This symbol is weaving through your narrative.`;
  }

  async clearMemory(userId: string): Promise<void> {
    this.memories.delete(userId);
    const userThreads = await this.getThreads(userId);
    userThreads.forEach(thread => this.threads.delete(thread.threadId));
  }
}

export const mem0 = new Mem0();