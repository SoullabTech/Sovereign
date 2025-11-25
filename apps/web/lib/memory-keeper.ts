import { EventEmitter } from 'events';
import { VectorEmbeddingService } from './vector-embeddings';

interface MemoryPattern {
  id: string;
  type: 'episodic' | 'semantic' | 'somatic' | 'morphic' | 'soul';
  content: any;
  timestamp: number;
  userId?: string;
  resonance: number;
  connections: string[];
}

interface SoulMemory {
  essence: string;
  gifts: string[];
  wounds: string[];
  purpose: string;
  journey: Map<string, any>;
}

interface SomaticMemory {
  bodyState: string;
  tension: Map<string, number>;
  flow: Map<string, number>;
  groundedness: number;
  openness: number;
}

export class MemoryKeeper extends EventEmitter {
  private episodicMemory: Map<string, MemoryPattern[]>;
  private semanticMemory: Map<string, MemoryPattern>;
  private somaticMemory: Map<string, SomaticMemory>;
  private morphicField: Map<string, MemoryPattern>;
  private soulRecords: Map<string, SoulMemory>;
  private connectionGraph: Map<string, Set<string>>;
  private embeddingService: VectorEmbeddingService;
  private semanticIndex: Map<string, number[]>; // Memory ID to embedding

  constructor(options?: { openaiApiKey?: string }) {
    super();
    this.episodicMemory = new Map();
    this.semanticMemory = new Map();
    this.somaticMemory = new Map();
    this.morphicField = new Map();
    this.soulRecords = new Map();
    this.connectionGraph = new Map();
    this.semanticIndex = new Map();
    this.embeddingService = new VectorEmbeddingService({
      openaiApiKey: options?.openaiApiKey,
      dimension: 384
    });
    this.initializeMorphicField();
  }

  private initializeMorphicField(): void {
    // Pre-load universal patterns
    const universalPatterns = [
      {
        id: 'hero_journey',
        pattern: 'The call to adventure and return transformed',
        resonance: 0.9
      },
      {
        id: 'dark_night',
        pattern: 'Dissolution before breakthrough',
        resonance: 0.85
      },
      {
        id: 'sacred_wound',
        pattern: "Where we're wounded, we can heal others",
        resonance: 0.88
      },
      {
        id: 'mirror_recognition',
        pattern: 'What triggers us teaches us',
        resonance: 0.82
      },
      {
        id: 'cycles_return',
        pattern: 'Spiraling evolution through familiar territory',
        resonance: 0.87
      }
    ];

    universalPatterns.forEach(pattern => {
      this.morphicField.set(pattern.id, {
        id: pattern.id,
        type: 'morphic',
        content: pattern,
        timestamp: Date.now(),
        resonance: pattern.resonance,
        connections: []
      });
    });
  }

  /**
   * Store episodic memory for a user with semantic indexing
   */
  async storeEpisodic(userId: string, memory: any): Promise<void> {
    const pattern: MemoryPattern = {
      id: `episodic_${Date.now()}_${Math.random()}`,
      type: 'episodic',
      content: memory,
      timestamp: Date.now(),
      userId,
      resonance: this.calculateResonance(memory),
      connections: await this.findConnections(memory)
    };

    if (!this.episodicMemory.has(userId)) {
      this.episodicMemory.set(userId, []);
    }

    const userMemories = this.episodicMemory.get(userId)!;
    userMemories.push(pattern);

    // Generate and store embedding for semantic search
    const memoryText = this.extractTextFromMemory(memory);
    const embedding = await this.embeddingService.getEmbedding(memoryText);
    this.semanticIndex.set(pattern.id, embedding);

    // Intelligent memory compression instead of simple truncation
    if (userMemories.length > 100) {
      await this.compressOldMemories(userId, userMemories);
    }

    this.updateConnectionGraph(pattern);
    this.emit('memory_stored', { type: 'episodic', pattern });
  }

  /**
   * Store semantic knowledge
   */
  async storeSemantic(concept: string, knowledge: any): Promise<void> {
    const pattern: MemoryPattern = {
      id: `semantic_${concept}`,
      type: 'semantic',
      content: knowledge,
      timestamp: Date.now(),
      resonance: this.calculateResonance(knowledge),
      connections: await this.findConnections(knowledge)
    };

    this.semanticMemory.set(concept, pattern);
    this.updateConnectionGraph(pattern);
    this.emit('memory_stored', { type: 'semantic', pattern });
  }

  /**
   * Store somatic state
   */
  async storeSomatic(userId: string, bodyState: SomaticMemory): Promise<void> {
    this.somaticMemory.set(userId, bodyState);
    this.emit('memory_stored', { type: 'somatic', userId, bodyState });
  }

  /**
   * Store morphic pattern
   */
  async storeMorphicPattern(pattern: any): Promise<void> {
    const morphicPattern: MemoryPattern = {
      id: `morphic_${Date.now()}`,
      type: 'morphic',
      content: pattern,
      timestamp: Date.now(),
      resonance: pattern.resonance || 0.5,
      connections: []
    };

    this.morphicField.set(morphicPattern.id, morphicPattern);
    this.emit('morphic_pattern_detected', morphicPattern);
  }

  /**
   * Store soul memory
   */
  async storeSoulMemory(userId: string, soulData: Partial<SoulMemory>): Promise<void> {
    const existing = this.soulRecords.get(userId) || {
      essence: '',
      gifts: [],
      wounds: [],
      purpose: '',
      journey: new Map()
    };

    const updated: SoulMemory = {
      ...existing,
      ...soulData
    };

    this.soulRecords.set(userId, updated);
    this.emit('soul_memory_updated', { userId, memory: updated });
  }

  /**
   * Retrieve episodic memories using semantic search
   */
  async retrieveEpisodic(userId: string, context: string): Promise<Map<string, any>> {
    const memories = this.episodicMemory.get(userId) || [];
    if (memories.length === 0) {
      return new Map();
    }

    // Get context embedding
    const contextEmbedding = await this.embeddingService.getEmbedding(context);

    // Calculate semantic similarity for each memory
    const memoriesWithScores: Array<[string, any, number]> = [];

    for (const memory of memories) {
      const memoryEmbedding = this.semanticIndex.get(memory.id);
      if (!memoryEmbedding) continue;

      // Calculate cosine similarity
      const similarity = this.cosineSimilarity(contextEmbedding, memoryEmbedding);

      // Combine with recency factor
      const recencyScore = Math.exp(-(Date.now() - memory.timestamp) / (7 * 24 * 60 * 60 * 1000)); // Decay over 7 days
      const finalScore = similarity * 0.7 + recencyScore * 0.3;

      if (finalScore > 0.3) {
        memoriesWithScores.push([memory.id, { ...memory, relevance: finalScore }, finalScore]);
      }
    }

    // Sort by score and take top 10
    memoriesWithScores.sort((a, b) => b[2] - a[2]);
    const topMemories = memoriesWithScores.slice(0, 10);

    const result = new Map<string, any>();
    topMemories.forEach(([id, memory]) => {
      result.set(id, memory);
    });

    return result;
  }

  /**
   * Retrieve semantic knowledge
   */
  async retrieveSemantic(context: string): Promise<Map<string, any>> {
    const relevant = new Map<string, any>();
    const contextWords = context.toLowerCase().split(' ');

    this.semanticMemory.forEach((memory, concept) => {
      if (contextWords.some(word => concept.toLowerCase().includes(word))) {
        relevant.set(concept, memory);
      }
    });

    return relevant;
  }

  /**
   * Retrieve somatic state
   */
  async retrieveSomatic(userId: string): Promise<Map<string, any>> {
    const state = this.somaticMemory.get(userId);
    const result = new Map<string, any>();

    if (state) {
      result.set('current', state);
      result.set('baseline', this.getSomaticBaseline());
    }

    return result;
  }

  /**
   * Retrieve morphic patterns
   */
  async retrieveMorphic(context: string): Promise<Map<string, any>> {
    const patterns = new Map<string, any>();
    const contextLower = context.toLowerCase();

    this.morphicField.forEach((pattern, id) => {
      // Check if context resonates with universal patterns
      const resonance = this.calculateMorphicResonance(contextLower, pattern);
      if (resonance > 0.4) {
        patterns.set(id, {
          ...pattern,
          currentResonance: resonance
        });
      }
    });

    return patterns;
  }

  /**
   * Retrieve soul memory
   */
  async retrieveSoul(userId: string): Promise<Map<string, any>> {
    const soul = this.soulRecords.get(userId);
    const result = new Map<string, any>();

    if (soul) {
      result.set('essence', soul.essence);
      result.set('gifts', soul.gifts);
      result.set('wounds', soul.wounds);
      result.set('purpose', soul.purpose);
      result.set('journey', soul.journey);
    }

    return result;
  }

  /**
   * Get user history for oracle selection
   */
  async getUserHistory(userId: string): Promise<any> {
    const episodic = this.episodicMemory.get(userId) || [];
    const soul = this.soulRecords.get(userId);

    // Analyze patterns in episodic memory
    const oracleInteractions = episodic.filter(m =>
      m.content.oracle !== undefined
    );

    const oraclePreference = this.determineOraclePreference(oracleInteractions);

    return {
      preferredOracle: oraclePreference,
      soulEssence: soul?.essence,
      interactionCount: episodic.length,
      lastInteraction: episodic[episodic.length - 1]?.timestamp
    };
  }

  private determineOraclePreference(interactions: MemoryPattern[]): string {
    const counts = new Map<string, number>();

    interactions.forEach(interaction => {
      const oracle = interaction.content.oracle;
      counts.set(oracle, (counts.get(oracle) || 0) + 1);
    });

    let maxCount = 0;
    let preferred = 'Maya'; // Default

    counts.forEach((count, oracle) => {
      if (count > maxCount) {
        maxCount = count;
        preferred = oracle;
      }
    });

    return preferred;
  }

  private calculateResonance(content: any): number {
    // Calculate resonance based on content depth and complexity
    let resonance = 0.5;

    if (typeof content === 'object') {
      const keys = Object.keys(content);
      resonance += Math.min(keys.length * 0.05, 0.3);
    }

    if (content.emotional_depth) {
      resonance += content.emotional_depth * 0.2;
    }

    return Math.min(resonance, 1);
  }

  private async findConnections(content: any): Promise<string[]> {
    const connections: string[] = [];

    // Find connections to existing memories
    if (typeof content === 'object' && content.tags) {
      content.tags.forEach((tag: string) => {
        connections.push(`tag:${tag}`);
      });
    }

    return connections;
  }

  private updateConnectionGraph(pattern: MemoryPattern): void {
    if (!this.connectionGraph.has(pattern.id)) {
      this.connectionGraph.set(pattern.id, new Set());
    }

    pattern.connections.forEach(connection => {
      this.connectionGraph.get(pattern.id)!.add(connection);

      if (!this.connectionGraph.has(connection)) {
        this.connectionGraph.set(connection, new Set());
      }
      this.connectionGraph.get(connection)!.add(pattern.id);
    });
  }

  /**
   * Calculate cosine similarity between vectors
   */
  private cosineSimilarity(vec1: number[], vec2: number[]): number {
    if (!vec1 || !vec2 || vec1.length !== vec2.length) return 0;

    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < vec1.length; i++) {
      dotProduct += vec1[i] * vec2[i];
      norm1 += vec1[i] * vec1[i];
      norm2 += vec2[i] * vec2[i];
    }

    norm1 = Math.sqrt(norm1);
    norm2 = Math.sqrt(norm2);

    if (norm1 === 0 || norm2 === 0) return 0;
    return dotProduct / (norm1 * norm2);
  }

  /**
   * Extract text from memory content for embedding
   */
  private extractTextFromMemory(memory: any): string {
    if (typeof memory === 'string') return memory;
    if (typeof memory === 'object') {
      const parts: string[] = [];
      if (memory.text) parts.push(memory.text);
      if (memory.emotion) parts.push(`emotion: ${memory.emotion}`);
      if (memory.theme) parts.push(`theme: ${memory.theme}`);
      if (memory.content) parts.push(memory.content);
      return parts.join(' ');
    }
    return JSON.stringify(memory);
  }

  /**
   * Compress old memories intelligently
   */
  private async compressOldMemories(userId: string, memories: MemoryPattern[]): Promise<void> {
    // Sort by importance (resonance * recency)
    const scored = memories.map(m => ({
      memory: m,
      score: m.resonance * Math.exp(-(Date.now() - m.timestamp) / (30 * 24 * 60 * 60 * 1000))
    }));

    scored.sort((a, b) => b.score - a.score);

    // Keep top 80 memories, compress rest
    const toKeep = scored.slice(0, 80).map(s => s.memory);
    const toCompress = scored.slice(80).map(s => s.memory);

    if (toCompress.length > 0) {
      // Create summary of compressed memories
      const summary = this.createMemorySummary(toCompress);
      const compressedPattern: MemoryPattern = {
        id: `compressed_${Date.now()}`,
        type: 'episodic',
        content: summary,
        timestamp: Date.now(),
        userId,
        resonance: 0.5,
        connections: []
      };

      // Update memory list
      const updatedMemories = [...toKeep, compressedPattern];
      this.episodicMemory.set(userId, updatedMemories);

      // Clean up semantic index for compressed memories
      toCompress.forEach(m => this.semanticIndex.delete(m.id));

      this.emit('memories_compressed', { userId, count: toCompress.length });
    }
  }

  /**
   * Create summary of memories for compression
   */
  private createMemorySummary(memories: MemoryPattern[]): any {
    const themes = new Set<string>();
    const emotions = new Set<string>();
    let totalResonance = 0;

    memories.forEach(m => {
      if (m.content.theme) themes.add(m.content.theme);
      if (m.content.emotion) emotions.add(m.content.emotion);
      totalResonance += m.resonance;
    });

    return {
      type: 'compressed_summary',
      count: memories.length,
      dateRange: {
        start: Math.min(...memories.map(m => m.timestamp)),
        end: Math.max(...memories.map(m => m.timestamp))
      },
      themes: Array.from(themes),
      emotions: Array.from(emotions),
      averageResonance: totalResonance / memories.length,
      compressed: true
    };
  }

  private calculateRelevance(content: any, contextWords: string[]): number {
    if (!content) return 0;

    const contentStr = JSON.stringify(content).toLowerCase();
    let matches = 0;

    contextWords.forEach(word => {
      if (contentStr.includes(word)) {
        matches++;
      }
    });

    return matches / contextWords.length;
  }

  private getSomaticBaseline(): SomaticMemory {
    return {
      bodyState: 'relaxed',
      tension: new Map([
        ['shoulders', 0.3],
        ['neck', 0.2],
        ['jaw', 0.1],
        ['chest', 0.2],
        ['belly', 0.1]
      ]),
      flow: new Map([
        ['breath', 0.7],
        ['energy', 0.6],
        ['circulation', 0.8]
      ]),
      groundedness: 0.7,
      openness: 0.6
    };
  }

  private calculateMorphicResonance(context: string, pattern: MemoryPattern): number {
    const patternContent = JSON.stringify(pattern.content).toLowerCase();
    const contextWords = context.split(' ');

    let resonance = pattern.resonance * 0.5; // Base from pattern

    // Check for thematic alignment
    contextWords.forEach(word => {
      if (patternContent.includes(word)) {
        resonance += 0.1;
      }
    });

    // Check for archetypal triggers
    const archetypes = ['journey', 'shadow', 'transform', 'awaken', 'return', 'wound', 'gift'];
    archetypes.forEach(archetype => {
      if (context.includes(archetype)) {
        resonance += 0.05;
      }
    });

    return Math.min(resonance, 1);
  }

  /**
   * Clear all memories for a user
   */
  clearUserMemories(userId: string): void {
    this.episodicMemory.delete(userId);
    this.somaticMemory.delete(userId);
    this.soulRecords.delete(userId);
    this.emit('memories_cleared', { userId });
  }
}