/**
 * Soul Memory System - Core Architecture
 * Using MemGPT patterns with SQLite (upgradeable to Redis)
 */

import { EventEmitter } from 'events';
import type { Element, Mood, EnergyState } from '@/lib/types/oracle';

// Memory types following MemGPT architecture
export interface CoreMemory {
  // Human information (immutable facts about user)
  human: {
    name: string;
    element: Element;
    archetype: string;
    createdAt: Date;
    metadata: Record<string, any>;
  };
  
  // Persona information (Maya's evolving personality)
  persona: {
    currentArchetype: string;
    trustLevel: number;
    relationshipPhase: 'discovering' | 'bonding' | 'deepening' | 'transcending';
    personalityTraits: Record<string, number>;
    voiceProfile: string;
  };
}

export interface WorkingMemory {
  // Current conversation context
  conversationId: string;
  messages: Array<{
    role: 'user' | 'maya';
    content: string;
    timestamp: Date;
    embedding?: number[];
  }>;
  currentTopic: string;
  emotionalContext: {
    mood: Mood;
    energy: EnergyState;
    intensity: number;
  };
}

export interface RecallMemory {
  // Searchable long-term memory
  id: string;
  userId: string;
  type: 'conversation' | 'reflection' | 'ritual' | 'insight' | 'dream' | 'synchronicity';
  content: string;
  summary: string;
  embedding: number[]; // Vector embedding for semantic search
  timestamp: Date;
  associations: string[]; // Related memory IDs
  emotionalSignature: {
    mood: Mood;
    energy: EnergyState;
    element: Element;
  };
  importance: number; // 0-100
  accessCount: number;
  lastAccessed: Date;
  metadata: Record<string, any>;
}

export interface ArchivalMemory {
  // Compressed, rarely accessed memories
  id: string;
  userId: string;
  period: {
    start: Date;
    end: Date;
  };
  summary: string;
  keyInsights: string[];
  dominantThemes: string[];
  elementalBalance: Record<Element, number>;
  emotionalJourney: Array<{date: Date; mood: Mood; energy: EnergyState}>;
  compressedData: string; // JSON string of full data
}

// Memory storage interface (can be implemented with SQLite or Redis)
export interface MemoryStore {
  // Core memory operations
  getCoreMemory(userId: string): Promise<CoreMemory>;
  updateCoreMemory(userId: string, updates: Partial<CoreMemory>): Promise<void>;
  
  // Working memory operations
  getWorkingMemory(conversationId: string): Promise<WorkingMemory>;
  updateWorkingMemory(conversationId: string, memory: WorkingMemory): Promise<void>;
  clearWorkingMemory(conversationId: string): Promise<void>;
  
  // Recall memory operations
  addRecallMemory(memory: RecallMemory): Promise<void>;
  searchRecallMemory(query: {
    userId: string;
    embedding?: number[];
    type?: RecallMemory['type'];
    startDate?: Date;
    endDate?: Date;
    minImportance?: number;
    limit?: number;
  }): Promise<RecallMemory[]>;
  updateRecallImportance(memoryId: string, importance: number): Promise<void>;
  
  // Archival memory operations
  archiveMemories(userId: string, startDate: Date, endDate: Date): Promise<void>;
  getArchivalSummary(userId: string, period?: {start: Date; end: Date}): Promise<ArchivalMemory[]>;
}

// Memory Manager - Orchestrates all memory operations
export class MemoryManager extends EventEmitter {
  private store: MemoryStore;
  private embedder: EmbeddingService;
  private compressor: MemoryCompressor;
  
  constructor(
    store: MemoryStore,
    embedder: EmbeddingService,
    compressor: MemoryCompressor
  ) {
    super();
    this.store = store;
    this.embedder = embedder;
    this.compressor = compressor;
  }
  
  // Initialize memory for new user
  async initializeUser(userId: string, name: string): Promise<void> {
    const coreMemory: CoreMemory = {
      human: {
        name,
        element: 'aether', // Start neutral
        archetype: 'seeker',
        createdAt: new Date(),
        metadata: {}
      },
      persona: {
        currentArchetype: 'mystic',
        trustLevel: 0,
        relationshipPhase: 'discovering',
        personalityTraits: {
          warmth: 50,
          directness: 50,
          intuition: 50,
          playfulness: 50,
          wisdom: 50
        },
        voiceProfile: 'mystic'
      }
    };
    
    await this.store.updateCoreMemory(userId, coreMemory);
    this.emit('user:initialized', { userId, coreMemory });
  }
  
  // Process and store new memory
  async recordMemory(
    userId: string,
    content: string,
    type: RecallMemory['type'],
    metadata?: Record<string, any>
  ): Promise<void> {
    // Generate embedding for semantic search
    const embedding = await this.embedder.embed(content);
    
    // Extract summary
    const summary = await this.compressor.summarize(content);
    
    // Find associated memories
    const associations = await this.findAssociations(userId, embedding);
    
    // Determine importance based on various factors
    const importance = this.calculateImportance(content, type, associations);
    
    const memory: RecallMemory = {
      id: `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      type,
      content,
      summary,
      embedding,
      timestamp: new Date(),
      associations: associations.map(a => a.id),
      emotionalSignature: {
        mood: metadata?.mood || 'neutral',
        energy: metadata?.energy || 'emerging',
        element: metadata?.element || 'aether'
      },
      importance,
      accessCount: 0,
      lastAccessed: new Date(),
      metadata: metadata || {}
    };
    
    await this.store.addRecallMemory(memory);
    this.emit('memory:recorded', { userId, memory });
    
    // Check if archival is needed
    await this.checkArchivalNeeds(userId);
  }
  
  // Retrieve relevant memories for context
  async recall(
    userId: string,
    query: string,
    limit: number = 5
  ): Promise<RecallMemory[]> {
    const queryEmbedding = await this.embedder.embed(query);
    
    const memories = await this.store.searchRecallMemory({
      userId,
      embedding: queryEmbedding,
      limit
    });
    
    // Update access counts
    for (const memory of memories) {
      await this.store.updateRecallImportance(
        memory.id,
        Math.min(100, memory.importance + 1)
      );
    }
    
    this.emit('memory:recalled', { userId, count: memories.length });
    
    return memories;
  }
  
  // Get conversation context
  async getConversationContext(conversationId: string): Promise<WorkingMemory> {
    return this.store.getWorkingMemory(conversationId);
  }
  
  // Update conversation context
  async updateConversation(
    conversationId: string,
    message: {role: 'user' | 'maya'; content: string}
  ): Promise<void> {
    const workingMemory = await this.store.getWorkingMemory(conversationId);
    
    // Add message with embedding
    const embedding = await this.embedder.embed(message.content);
    workingMemory.messages.push({
      ...message,
      timestamp: new Date(),
      embedding
    });
    
    // Keep only recent messages in working memory
    if (workingMemory.messages.length > 20) {
      // Move older messages to recall memory
      const oldMessages = workingMemory.messages.splice(0, 10);
      const conversationChunk = oldMessages
        .map(m => `${m.role}: ${m.content}`)
        .join('\n');
      
      await this.recordMemory(
        conversationId.split('_')[0], // Extract userId
        conversationChunk,
        'conversation',
        { conversationId }
      );
    }
    
    await this.store.updateWorkingMemory(conversationId, workingMemory);
  }
  
  // Find associated memories using embeddings
  private async findAssociations(
    userId: string,
    embedding: number[],
    threshold: number = 0.7
  ): Promise<RecallMemory[]> {
    const candidates = await this.store.searchRecallMemory({
      userId,
      embedding,
      limit: 10
    });
    
    // Filter by similarity threshold
    return candidates.filter(memory => {
      const similarity = this.cosineSimilarity(embedding, memory.embedding);
      return similarity > threshold;
    });
  }
  
  // Calculate importance score
  private calculateImportance(
    content: string,
    type: RecallMemory['type'],
    associations: RecallMemory[]
  ): number {
    let importance = 50; // Base importance
    
    // Type-based importance
    const typeWeights: Record<RecallMemory['type'], number> = {
      insight: 80,
      synchronicity: 90,
      ritual: 70,
      dream: 75,
      reflection: 60,
      conversation: 40
    };
    importance = typeWeights[type] || importance;
    
    // Adjust based on content length and complexity
    if (content.length > 500) importance += 10;
    if (content.includes('breakthrough') || content.includes('realization')) importance += 15;
    if (content.includes('transform') || content.includes('shift')) importance += 10;
    
    // Boost if highly connected
    if (associations.length > 3) importance += 10;
    
    return Math.min(100, importance);
  }
  
  // Check if memories need archival
  private async checkArchivalNeeds(userId: string): Promise<void> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const oldMemories = await this.store.searchRecallMemory({
      userId,
      endDate: thirtyDaysAgo,
      limit: 100
    });
    
    if (oldMemories.length > 50) {
      // Archive memories older than 30 days
      await this.store.archiveMemories(userId, new Date(0), thirtyDaysAgo);
      this.emit('memory:archived', { userId, count: oldMemories.length });
    }
  }
  
  // Calculate cosine similarity between vectors
  private cosineSimilarity(a: number[], b: number[]): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
  
  // Get memory statistics
  async getMemoryStats(userId: string): Promise<{
    totalMemories: number;
    memoryTypes: Record<RecallMemory['type'], number>;
    averageImportance: number;
    mostAccessedMemories: RecallMemory[];
    emotionalProfile: Record<Mood, number>;
  }> {
    const allMemories = await this.store.searchRecallMemory({
      userId,
      limit: 1000
    });
    
    const stats = {
      totalMemories: allMemories.length,
      memoryTypes: {} as Record<RecallMemory['type'], number>,
      averageImportance: 0,
      mostAccessedMemories: [] as RecallMemory[],
      emotionalProfile: {} as Record<Mood, number>
    };
    
    // Calculate statistics
    let totalImportance = 0;
    allMemories.forEach(memory => {
      stats.memoryTypes[memory.type] = (stats.memoryTypes[memory.type] || 0) + 1;
      totalImportance += memory.importance;
      
      const mood = memory.emotionalSignature.mood;
      stats.emotionalProfile[mood] = (stats.emotionalProfile[mood] || 0) + 1;
    });
    
    stats.averageImportance = totalImportance / allMemories.length;
    stats.mostAccessedMemories = allMemories
      .sort((a, b) => b.accessCount - a.accessCount)
      .slice(0, 5);
    
    return stats;
  }
}

// Embedding service interface
export interface EmbeddingService {
  embed(text: string): Promise<number[]>;
  embedBatch(texts: string[]): Promise<number[][]>;
}

// Memory compression service
export interface MemoryCompressor {
  summarize(text: string): Promise<string>;
  compress(memories: RecallMemory[]): Promise<string>;
  decompress(compressed: string): Promise<RecallMemory[]>;
}