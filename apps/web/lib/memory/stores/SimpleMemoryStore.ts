/**
 * Simple In-Memory Store for Memory System
 * Beta implementation without external dependencies
 */

import { 
  MemoryStore, 
  CoreMemory, 
  WorkingMemory, 
  RecallMemory, 
  ArchivalMemory 
} from '../core/MemoryCore';

export class SimpleMemoryStore implements MemoryStore {
  private coreMemories = new Map<string, CoreMemory>();
  private workingMemories = new Map<string, WorkingMemory>();
  private recallMemories = new Map<string, RecallMemory>();
  private archivalMemories = new Map<string, ArchivalMemory>();

  // Core memory operations
  async getCoreMemory(userId: string): Promise<CoreMemory> {
    const memory = this.coreMemories.get(userId);
    if (!memory) {
      throw new Error(`Core memory not found for user: ${userId}`);
    }
    return memory;
  }

  async updateCoreMemory(userId: string, updates: Partial<CoreMemory>): Promise<void> {
    const existing = this.coreMemories.get(userId);
    if (existing) {
      this.coreMemories.set(userId, { ...existing, ...updates });
    } else {
      this.coreMemories.set(userId, updates as CoreMemory);
    }
  }

  // Working memory operations
  async getWorkingMemory(conversationId: string): Promise<WorkingMemory> {
    return this.workingMemories.get(conversationId) || {
      conversationId,
      messages: [],
      currentTopic: '',
      emotionalContext: {
        mood: 'neutral',
        energy: 'emerging',
        intensity: 50
      }
    };
  }

  async updateWorkingMemory(conversationId: string, memory: WorkingMemory): Promise<void> {
    this.workingMemories.set(conversationId, memory);
  }

  async clearWorkingMemory(conversationId: string): Promise<void> {
    this.workingMemories.delete(conversationId);
  }

  // Recall memory operations
  async addRecallMemory(memory: RecallMemory): Promise<void> {
    this.recallMemories.set(memory.id, memory);
  }

  async searchRecallMemory(query: {
    userId: string;
    embedding?: number[];
    type?: RecallMemory['type'];
    startDate?: Date;
    endDate?: Date;
    minImportance?: number;
    limit?: number;
  }): Promise<RecallMemory[]> {
    let results = Array.from(this.recallMemories.values())
      .filter(memory => memory.userId === query.userId);

    // Filter by type
    if (query.type) {
      results = results.filter(memory => memory.type === query.type);
    }

    // Filter by date range
    if (query.startDate) {
      results = results.filter(memory => memory.timestamp >= query.startDate!);
    }
    if (query.endDate) {
      results = results.filter(memory => memory.timestamp <= query.endDate!);
    }

    // Filter by importance
    if (query.minImportance) {
      results = results.filter(memory => memory.importance >= query.minImportance!);
    }

    // Simple semantic search using embedding cosine similarity
    if (query.embedding) {
      results = results
        .map(memory => ({
          memory,
          similarity: this.cosineSimilarity(query.embedding!, memory.embedding)
        }))
        .sort((a, b) => b.similarity - a.similarity)
        .map(item => item.memory);
    } else {
      // Sort by importance and recency if no embedding
      results = results.sort((a, b) => {
        const importanceDiff = b.importance - a.importance;
        if (importanceDiff !== 0) return importanceDiff;
        return b.timestamp.getTime() - a.timestamp.getTime();
      });
    }

    // Apply limit
    const limit = query.limit || 10;
    return results.slice(0, limit);
  }

  async updateRecallImportance(memoryId: string, importance: number): Promise<void> {
    const memory = this.recallMemories.get(memoryId);
    if (memory) {
      memory.importance = importance;
      memory.accessCount += 1;
      memory.lastAccessed = new Date();
    }
  }

  // Archival memory operations
  async archiveMemories(userId: string, startDate: Date, endDate: Date): Promise<void> {
    const memoriesToArchive = Array.from(this.recallMemories.values())
      .filter(memory => 
        memory.userId === userId &&
        memory.timestamp >= startDate &&
        memory.timestamp <= endDate
      );

    if (memoriesToArchive.length === 0) return;

    // Create archival memory
    const archivalMemory: ArchivalMemory = {
      id: `archive_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      period: { start: startDate, end: endDate },
      summary: this.createArchiveSummary(memoriesToArchive),
      keyInsights: this.extractKeyInsights(memoriesToArchive),
      dominantThemes: this.extractDominantThemes(memoriesToArchive),
      elementalBalance: this.calculateElementalBalance(memoriesToArchive),
      emotionalJourney: this.createEmotionalJourney(memoriesToArchive),
      compressedData: JSON.stringify(memoriesToArchive)
    };

    this.archivalMemories.set(archivalMemory.id, archivalMemory);

    // Remove original memories
    memoriesToArchive.forEach(memory => {
      this.recallMemories.delete(memory.id);
    });
  }

  async getArchivalSummary(userId: string, period?: {start: Date; end: Date}): Promise<ArchivalMemory[]> {
    let results = Array.from(this.archivalMemories.values())
      .filter(archive => archive.userId === userId);

    if (period) {
      results = results.filter(archive => 
        archive.period.start >= period.start && archive.period.end <= period.end
      );
    }

    return results.sort((a, b) => b.period.end.getTime() - a.period.end.getTime());
  }

  // Helper methods
  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB)) || 0;
  }

  private createArchiveSummary(memories: RecallMemory[]): string {
    const types = new Set(memories.map(m => m.type));
    const timespan = memories.length > 0 ? 
      `${memories[0].timestamp.toDateString()} - ${memories[memories.length - 1].timestamp.toDateString()}` : 
      'Unknown period';
    
    return `Archive of ${memories.length} memories from ${timespan}. Types: ${Array.from(types).join(', ')}.`;
  }

  private extractKeyInsights(memories: RecallMemory[]): string[] {
    return memories
      .filter(m => m.type === 'insight' || m.importance > 80)
      .map(m => m.summary)
      .slice(0, 5);
  }

  private extractDominantThemes(memories: RecallMemory[]): string[] {
    // Simple keyword extraction
    const words = new Map<string, number>();
    memories.forEach(memory => {
      memory.content.toLowerCase()
        .split(/\W+/)
        .filter(word => word.length > 4)
        .forEach(word => {
          words.set(word, (words.get(word) || 0) + 1);
        });
    });

    return Array.from(words.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word);
  }

  private calculateElementalBalance(memories: RecallMemory[]): Record<string, number> {
    const balance: Record<string, number> = {
      fire: 0, water: 0, earth: 0, air: 0, aether: 0
    };

    memories.forEach(memory => {
      const element = memory.emotionalSignature.element;
      if (element in balance) {
        balance[element]++;
      }
    });

    const total = Object.values(balance).reduce((sum, count) => sum + count, 0);
    if (total > 0) {
      Object.keys(balance).forEach(key => {
        balance[key] = (balance[key] / total) * 100;
      });
    }

    return balance;
  }

  private createEmotionalJourney(memories: RecallMemory[]): Array<{date: Date; mood: string; energy: string}> {
    return memories
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
      .map(memory => ({
        date: memory.timestamp,
        mood: memory.emotionalSignature.mood,
        energy: memory.emotionalSignature.energy
      }));
  }
}