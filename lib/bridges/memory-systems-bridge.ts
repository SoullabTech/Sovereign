/**
 * MEMORY SYSTEMS BRIDGE
 *
 * Integrates multiple memory layers:
 * - Anamnesis (Deep recall and pattern memory)
 * - Session Memory (Conversation continuity)
 * - Pattern Memory (Life pattern recognition)
 * - Collective Memory (Shared wisdom pool)
 * - Working Memory (Active context)
 */

import * as fs from 'fs';
import * as path from 'path';

export interface MemoryConfig {
  persistencePath: string;
  maxMemorySize: number;
  compressionEnabled: boolean;
  autoSaveInterval: number;
}

export interface MemoryQuery {
  input: string;
  patterns?: string[];
  depth?: number;
  timeRange?: TimeRange;
  memoryType?: MemoryType;
}

export interface MemoryResult {
  memories: Memory[];
  patterns: Pattern[];
  count: number;
  depth: number;
  relevance: number;
}

export interface Memory {
  id: string;
  timestamp: number;
  content: string;
  type: MemoryType;
  tags: string[];
  associations: string[];
  emotionalValence: number;
  importance: number;
  accessed: number;
}

export interface Pattern {
  id: string;
  pattern: string;
  frequency: number;
  contexts: string[];
  emergence: number;
  archetype?: string;
}

export interface TimeRange {
  start?: number;
  end?: number;
  relative?: string; // 'recent', 'today', 'week', 'month'
}

export type MemoryType =
  | 'anamnesis' // Deep archetypal memories
  | 'session' // Current conversation
  | 'pattern' // Recognized patterns
  | 'collective' // Shared wisdom
  | 'working' // Active context
  | 'episodic' // Specific events
  | 'semantic'; // Facts and concepts

export class MemorySystemsBridge {
  private config: MemoryConfig;
  private memories: Map<string, Memory> = new Map();
  private patterns: Map<string, Pattern> = new Map();
  private sessionMemory: Memory[] = [];
  private workingMemory: Set<string> = new Set();
  private lastSaveTime: number = 0;
  private initialized: boolean = false;

  // Memory layer connections
  private anamnesisLayer: AnamnesisLayer;
  private patternRecognizer: PatternRecognizer;
  private collectiveMemory: CollectiveMemoryPool;

  constructor(config?: Partial<MemoryConfig>) {
    this.config = {
      persistencePath: process.env.MEMORY_PATH || './memory',
      maxMemorySize: 100000,
      compressionEnabled: true,
      autoSaveInterval: 300000, // 5 minutes
      ...config
    };

    this.anamnesisLayer = new AnamnesisLayer();
    this.patternRecognizer = new PatternRecognizer();
    this.collectiveMemory = new CollectiveMemoryPool();
  }

  /**
   * Connect all memory systems
   */
  async connectAll(): Promise<void> {
    console.log('🧠 Connecting Memory Systems...');

    await this.connectAnamnesis();
    await this.connectSessionMemory();
    await this.connectPatternMemory();
    await this.connectCollectiveMemory();
    await this.loadPersistedMemory();

    this.setupAutoSave();
    this.initialized = true;

    console.log('  ✓ All memory systems connected');
  }

  /**
   * Connect Anamnesis deep memory system
   */
  async connectAnamnesis(): Promise<void> {
    console.log('  Connecting Anamnesis layer...');
    await this.anamnesisLayer.initialize();
  }

  /**
   * Connect session memory for conversation continuity
   */
  async connectSessionMemory(): Promise<void> {
    console.log('  Connecting session memory...');
    this.sessionMemory = [];
  }

  /**
   * Connect pattern recognition memory
   */
  async connectPatternMemory(): Promise<void> {
    console.log('  Connecting pattern recognition...');
    await this.patternRecognizer.initialize();
  }

  /**
   * Connect collective memory pool
   */
  async connectCollectiveMemory(): Promise<void> {
    console.log('  Connecting collective memory...');
    await this.collectiveMemory.initialize();
  }

  /**
   * Recall memories based on query
   */
  async recall(query: MemoryQuery): Promise<MemoryResult> {
    console.log('💭 Recalling relevant memories...');

    // Search across all memory types
    const anamnesisMemories = await this.anamnesisLayer.recall(query);
    const sessionMemories = this.recallSessionMemory(query);
    const patternMemories = await this.patternRecognizer.findPatterns(query);
    const collectiveMemories = await this.collectiveMemory.query(query);

    // Combine all memories
    const allMemories = [
      ...anamnesisMemories,
      ...sessionMemories,
      ...patternMemories,
      ...collectiveMemories
    ];

    // Detect patterns across memories
    const patterns = this.detectPatterns(allMemories, query);

    // Calculate recall depth
    const depth = this.calculateRecallDepth(allMemories, patterns);

    // Calculate relevance
    const relevance = this.calculateRelevance(allMemories, query);

    // Update working memory with most relevant
    this.updateWorkingMemory(allMemories);

    return {
      memories: allMemories.slice(0, query.depth || 10),
      patterns,
      count: allMemories.length,
      depth,
      relevance
    };
  }

  /**
   * Store new memory
   */
  async store(content: string, type: MemoryType, metadata?: any): Promise<Memory> {
    const memory: Memory = {
      id: this.generateMemoryId(),
      timestamp: Date.now(),
      content,
      type,
      tags: metadata?.tags || [],
      associations: metadata?.associations || [],
      emotionalValence: metadata?.emotionalValence || 0,
      importance: metadata?.importance || 0.5,
      accessed: 1
    };

    // Store in appropriate layer
    switch (type) {
      case 'anamnesis':
        await this.anamnesisLayer.store(memory);
        break;
      case 'session':
        this.sessionMemory.push(memory);
        break;
      case 'pattern':
        await this.patternRecognizer.storePattern(memory);
        break;
      case 'collective':
        await this.collectiveMemory.contribute(memory);
        break;
      default:
        this.memories.set(memory.id, memory);
    }

    // Check for emerging patterns
    await this.checkEmergingPatterns(memory);

    return memory;
  }

  /**
   * Recall from session memory
   */
  private recallSessionMemory(query: MemoryQuery): Memory[] {
    const relevant: Memory[] = [];
    const searchTerms = query.input.toLowerCase().split(/\s+/);

    this.sessionMemory.forEach(memory => {
      const content = memory.content.toLowerCase();
      const relevance = searchTerms.filter(term => content.includes(term)).length;

      if (relevance > 0) {
        memory.accessed++;
        relevant.push(memory);
      }
    });

    return relevant;
  }

  /**
   * Detect patterns across memories
   */
  private detectPatterns(memories: Memory[], query: MemoryQuery): Pattern[] {
    const patterns: Pattern[] = [];
    const contentMap = new Map<string, number>();

    // Extract recurring themes
    memories.forEach(memory => {
      const words = memory.content.toLowerCase().split(/\s+/);
      words.forEach(word => {
        if (word.length > 4) {
          contentMap.set(word, (contentMap.get(word) || 0) + 1);
        }
      });
    });

    // Find significant patterns
    contentMap.forEach((frequency, pattern) => {
      if (frequency >= 3) {
        patterns.push({
          id: this.generatePatternId(),
          pattern,
          frequency,
          contexts: memories
            .filter(m => m.content.toLowerCase().includes(pattern))
            .map(m => m.id),
          emergence: frequency / memories.length,
          archetype: this.identifyArchetype(pattern)
        });
      }
    });

    // Add recognized life patterns
    const lifePatterns = this.patternRecognizer.getLifePatterns(memories);
    patterns.push(...lifePatterns);

    return patterns;
  }

  /**
   * Check for emerging patterns
   */
  private async checkEmergingPatterns(memory: Memory): Promise<void> {
    // Analyze recent memories for emerging patterns
    const recentMemories = Array.from(this.memories.values())
      .filter(m => Date.now() - m.timestamp < 3600000) // Last hour
      .concat(this.sessionMemory.slice(-10));

    const patterns = this.detectPatterns(recentMemories, {
      input: memory.content
    });

    // Store significant patterns
    patterns
      .filter(p => p.emergence > 0.3)
      .forEach(pattern => {
        this.patterns.set(pattern.id, pattern);
      });
  }

  /**
   * Calculate recall depth
   */
  private calculateRecallDepth(memories: Memory[], patterns: Pattern[]): number {
    if (memories.length === 0) return 0;

    const avgImportance = memories.reduce((sum, m) => sum + m.importance, 0) / memories.length;
    const patternBonus = Math.min(patterns.length * 0.1, 0.3);
    const diversityBonus = this.calculateDiversityBonus(memories);

    return Math.min(avgImportance + patternBonus + diversityBonus, 1.0);
  }

  /**
   * Calculate diversity bonus
   */
  private calculateDiversityBonus(memories: Memory[]): number {
    const types = new Set(memories.map(m => m.type));
    return types.size * 0.05;
  }

  /**
   * Calculate relevance score
   */
  private calculateRelevance(memories: Memory[], query: MemoryQuery): number {
    if (memories.length === 0) return 0;

    const searchTerms = query.input.toLowerCase().split(/\s+/);
    let totalRelevance = 0;

    memories.forEach(memory => {
      const content = memory.content.toLowerCase();
      const matches = searchTerms.filter(term => content.includes(term)).length;
      totalRelevance += matches / searchTerms.length;
    });

    return Math.min(totalRelevance / memories.length, 1.0);
  }

  /**
   * Update working memory with most relevant items
   */
  private updateWorkingMemory(memories: Memory[]): void {
    this.workingMemory.clear();

    memories
      .sort((a, b) => b.importance - a.importance)
      .slice(0, 7) // Miller's Law: 7±2 items
      .forEach(memory => {
        this.workingMemory.add(memory.id);
      });
  }

  /**
   * Identify archetype for pattern
   */
  private identifyArchetype(pattern: string): string | undefined {
    const archetypes = {
      transform: 'Transformer',
      create: 'Creator',
      destroy: 'Destroyer',
      love: 'Lover',
      fear: 'Shadow',
      wisdom: 'Sage',
      power: 'Ruler',
      journey: 'Hero',
      care: 'Caregiver',
      play: 'Jester',
      order: 'Creator',
      chaos: 'Outlaw'
    };

    for (const [key, archetype] of Object.entries(archetypes)) {
      if (pattern.includes(key)) {
        return archetype;
      }
    }

    return undefined;
  }

  /**
   * Load persisted memory
   */
  private async loadPersistedMemory(): Promise<void> {
    const memoryFile = path.join(this.config.persistencePath, 'memory.json');

    if (fs.existsSync(memoryFile)) {
      try {
        const data = fs.readFileSync(memoryFile, 'utf-8');
        const saved = JSON.parse(data);

        // Restore memories
        if (saved.memories) {
          saved.memories.forEach((m: Memory) => this.memories.set(m.id, m));
        }

        // Restore patterns
        if (saved.patterns) {
          saved.patterns.forEach((p: Pattern) => this.patterns.set(p.id, p));
        }

        console.log(`  Loaded ${this.memories.size} memories and ${this.patterns.size} patterns`);
      } catch (error) {
        console.error('Failed to load persisted memory:', error);
      }
    }
  }

  /**
   * Save memory to disk
   */
  private async saveMemory(): Promise<void> {
    if (!fs.existsSync(this.config.persistencePath)) {
      fs.mkdirSync(this.config.persistencePath, { recursive: true });
    }

    const memoryFile = path.join(this.config.persistencePath, 'memory.json');

    const data = {
      memories: Array.from(this.memories.values()),
      patterns: Array.from(this.patterns.values()),
      timestamp: Date.now()
    };

    fs.writeFileSync(memoryFile, JSON.stringify(data, null, 2));
    this.lastSaveTime = Date.now();
  }

  /**
   * Setup auto-save
   */
  private setupAutoSave(): void {
    setInterval(() => {
      this.saveMemory().catch(console.error);
    }, this.config.autoSaveInterval);
  }

  /**
   * Generate unique memory ID
   */
  private generateMemoryId(): string {
    return `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique pattern ID
   */
  private generatePatternId(): string {
    return `pat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get working memory contents
   */
  getWorkingMemory(): Memory[] {
    return Array.from(this.workingMemory)
      .map(id => this.memories.get(id))
      .filter(m => m !== undefined) as Memory[];
  }

  /**
   * Clear session memory
   */
  clearSession(): void {
    this.sessionMemory = [];
    this.workingMemory.clear();
  }

  /**
   * Get memory statistics
   */
  getStats(): any {
    return {
      totalMemories: this.memories.size,
      sessionMemories: this.sessionMemory.length,
      patterns: this.patterns.size,
      workingMemory: this.workingMemory.size,
      lastSave: this.lastSaveTime
    };
  }
}

/**
 * ANAMNESIS LAYER - Deep archetypal recall
 */
class AnamnesisLayer {
  private archetypeMemories: Map<string, Memory[]> = new Map();

  async initialize(): Promise<void> {
    // Initialize archetypal memory structures
    const archetypes = [
      'Hero',
      'Shadow',
      'Anima/Animus',
      'Self',
      'Wise Old Man/Woman',
      'Trickster',
      'Mother',
      'Father'
    ];

    archetypes.forEach(archetype => {
      this.archetypeMemories.set(archetype, []);
    });
  }

  async recall(query: MemoryQuery): Promise<Memory[]> {
    const memories: Memory[] = [];

    // Search through archetypal memories
    this.archetypeMemories.forEach((archetypeMemories, archetype) => {
      const relevant = archetypeMemories.filter(m =>
        m.content.toLowerCase().includes(query.input.toLowerCase())
      );
      memories.push(...relevant);
    });

    return memories;
  }

  async store(memory: Memory): Promise<void> {
    // Categorize by archetype
    const archetype = this.identifyArchetype(memory.content);
    if (archetype && this.archetypeMemories.has(archetype)) {
      this.archetypeMemories.get(archetype)!.push(memory);
    }
  }

  private identifyArchetype(content: string): string | undefined {
    // Simplified archetype identification
    const patterns = {
      Hero: /journey|quest|challenge|overcome/i,
      Shadow: /dark|hidden|fear|unconscious/i,
      'Wise Old Man/Woman': /wisdom|guide|mentor|sage/i,
      Trickster: /chaos|play|disrupt|transform/i
    };

    for (const [archetype, pattern] of Object.entries(patterns)) {
      if (pattern.test(content)) {
        return archetype;
      }
    }

    return undefined;
  }
}

/**
 * PATTERN RECOGNIZER - Life pattern identification
 */
class PatternRecognizer {
  private lifePatterns: Map<string, Pattern> = new Map();

  async initialize(): Promise<void> {
    // Initialize common life patterns
    const patterns = [
      'Seeker',
      'Threshold Walker',
      'Shadow Worker',
      'Healer',
      'Creator',
      'Destroyer',
      'Lover',
      'Warrior'
    ];

    patterns.forEach(pattern => {
      this.lifePatterns.set(pattern, {
        id: `life_${pattern.toLowerCase()}`,
        pattern,
        frequency: 0,
        contexts: [],
        emergence: 0
      });
    });
  }

  async findPatterns(query: MemoryQuery): Promise<Memory[]> {
    // Find memories that match life patterns
    return [];
  }

  async storePattern(memory: Memory): Promise<void> {
    // Store pattern-related memory
  }

  getLifePatterns(memories: Memory[]): Pattern[] {
    const patterns: Pattern[] = [];

    // Analyze memories for life patterns
    this.lifePatterns.forEach((pattern, name) => {
      const matches = memories.filter(m =>
        m.content.toLowerCase().includes(name.toLowerCase())
      );

      if (matches.length > 0) {
        patterns.push({
          ...pattern,
          frequency: matches.length,
          contexts: matches.map(m => m.id),
          emergence: matches.length / memories.length
        });
      }
    });

    return patterns;
  }
}

/**
 * COLLECTIVE MEMORY POOL - Shared wisdom
 */
class CollectiveMemoryPool {
  private collectiveWisdom: Memory[] = [];

  async initialize(): Promise<void> {
    // Initialize with seed collective wisdom
    this.collectiveWisdom = [];
  }

  async query(query: MemoryQuery): Promise<Memory[]> {
    // Query collective wisdom
    return this.collectiveWisdom.filter(m =>
      m.content.toLowerCase().includes(query.input.toLowerCase())
    );
  }

  async contribute(memory: Memory): Promise<void> {
    // Add to collective pool if significant
    if (memory.importance > 0.7) {
      this.collectiveWisdom.push(memory);
    }
  }
}

export default MemorySystemsBridge;