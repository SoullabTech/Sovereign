/**
 * Memory Integration Layer
 * Weaves memory into PersonalOracleAgent and MainOracleAgent
 * Creates a unified consciousness field
 */

import { EventEmitter } from 'events';
import { PersonalOracleAgent } from '@/lib/agents/PersonalOracleAgent';
import { MainOracleAgent } from '@/lib/agents/MainOracleAgent';
import { MemoryManager, RecallMemory, CoreMemory } from '../core/MemoryCore';
import { SQLiteMemoryStore } from '../stores/SQLiteMemoryStore';
import { LlamaIndexService } from '../semantic/LlamaIndexService';
import { OpenAIEmbedder } from '../embeddings/OpenAIEmbedder';
import { MemoryCompressorService } from '../compression/MemoryCompressor';
import type { Element, Mood, EnergyState } from '@/lib/types/oracle';

/**
 * Augmented PersonalOracleAgent with Full Memory Integration
 */
export class MemoryAugmentedPersonalOracle extends PersonalOracleAgent {
  private memoryManager: MemoryManager;
  private semanticIndex: LlamaIndexService;
  private conversationId: string;
  private memoryContext: RecallMemory[] = [];
  
  constructor(
    userId: string,
    memoryManager: MemoryManager,
    semanticIndex: LlamaIndexService
  ) {
    super(userId);
    this.memoryManager = memoryManager;
    this.semanticIndex = semanticIndex;
    this.conversationId = `${userId}_${Date.now()}`;
    this.initializeMemory();
  }
  
  private async initializeMemory() {
    try {
      // Load core memory
      const coreMemory = await this.memoryManager.getCoreMemory(this.userId);
      
      // Sync personality from memory
      this.state.personality = {
        ...this.state.personality,
        archetype: coreMemory.persona.currentArchetype,
        traits: coreMemory.persona.personalityTraits
      };
      
      // Load user profile from memory
      this.userProfile = {
        ...this.userProfile,
        element: coreMemory.human.element,
        archetype: coreMemory.human.archetype,
        trustLevel: coreMemory.persona.trustLevel
      };
      
      // Load recent memories for context
      this.memoryContext = await this.memoryManager.recall(
        this.userId,
        'recent interactions',
        10
      );
    } catch (error) {
      // Initialize new user memory if not exists
      await this.memoryManager.initializeUser(
        this.userId,
        this.userProfile.name || 'Seeker'
      );
    }
  }
  
  // Override processInteraction to include memory
  async processInteraction(
    input: string,
    context: {
      currentPetal?: string;
      currentMood?: Mood;
      currentEnergy?: EnergyState;
    }
  ): Promise<{
    response: string;
    suggestions?: string[];
    ritual?: string;
    reflection?: string;
    memories?: RecallMemory[];
  }> {
    // Recall relevant memories
    const relevantMemories = await this.memoryManager.recall(
      this.userId,
      input,
      5
    );
    
    // Search semantic index for related wisdom
    const semanticResults = await this.semanticIndex.search({
      query: input,
      userId: this.userId,
      filters: {
        element: context.currentPetal as Element,
        type: 'wisdom'
      }
    });
    
    // Update working memory
    await this.memoryManager.updateConversation(this.conversationId, {
      role: 'user',
      content: input
    });
    
    // Generate response with memory context
    const memoryContext = this.formatMemoryContext(relevantMemories, semanticResults);
    const enhancedInput = memoryContext ? `${memoryContext}\n\nUser: ${input}` : input;
    
    // Process with base agent
    const result = await super.processInteraction(enhancedInput, context);
    
    // Store Maya's response in memory
    await this.memoryManager.updateConversation(this.conversationId, {
      role: 'maya',
      content: result.response
    });
    
    // Record significant moments
    if (this.isSignificant(input, result.response)) {
      await this.memoryManager.recordMemory(
        this.userId,
        `User: ${input}\nMaya: ${result.response}`,
        'conversation',
        {
          mood: context.currentMood,
          energy: context.currentEnergy,
          element: context.currentPetal || 'aether',
          significance: 'high'
        }
      );
    }
    
    // Update core memory if trust increased
    if (this.detectTrustIncrease(input, result.response)) {
      await this.updateTrustLevel(5);
    }
    
    return {
      ...result,
      memories: relevantMemories
    };
  }
  
  // Format memory context for response generation
  private formatMemoryContext(
    memories: RecallMemory[],
    semanticResults: any[]
  ): string {
    if (memories.length === 0 && semanticResults.length === 0) {
      return '';
    }
    
    let context = 'Relevant context from our journey:\n';
    
    // Add memory summaries
    memories.forEach(memory => {
      const timeAgo = this.getTimeAgo(memory.timestamp);
      context += `- ${timeAgo}: ${memory.summary}\n`;
    });
    
    // Add semantic wisdom
    if (semanticResults.length > 0) {
      context += '\nRelevant wisdom:\n';
      semanticResults.forEach(result => {
        context += `- ${result.content}\n`;
      });
    }
    
    return context;
  }
  
  // Detect if interaction is significant
  private isSignificant(input: string, response: string): boolean {
    const significantPatterns = [
      'breakthrough', 'realize', 'transform', 'shift',
      'understand', 'insight', 'important', 'profound',
      'thank you', 'helped me', 'changed', 'different'
    ];
    
    const combined = (input + response).toLowerCase();
    return significantPatterns.some(pattern => combined.includes(pattern));
  }
  
  // Detect trust increase signals
  private detectTrustIncrease(input: string, response: string): boolean {
    const trustSignals = [
      'thank you', 'helpful', 'understand me', 'exactly',
      'you get it', 'appreciate', 'perfect', 'yes!'
    ];
    
    return trustSignals.some(signal => input.toLowerCase().includes(signal));
  }
  
  // Update trust level and sync with memory
  async updateTrustLevel(delta: number) {
    this.userProfile.trustLevel = Math.min(100, this.userProfile.trustLevel + delta);
    
    await this.memoryManager.updateCoreMemory(this.userId, {
      persona: {
        trustLevel: this.userProfile.trustLevel,
        relationshipPhase: this.getRelationshipPhase()
      }
    } as any);
  }
  
  // Get relationship phase based on trust
  private getRelationshipPhase(): 'discovering' | 'bonding' | 'deepening' | 'transcending' {
    const trust = this.userProfile.trustLevel;
    if (trust < 25) return 'discovering';
    if (trust < 50) return 'bonding';
    if (trust < 75) return 'deepening';
    return 'transcending';
  }
  
  // Record insight
  async recordInsight(content: string, metadata?: any) {
    await this.memoryManager.recordMemory(
      this.userId,
      content,
      'insight',
      {
        ...metadata,
        element: this.userProfile.element,
        archetype: this.userProfile.archetype
      }
    );
  }
  
  // Record ritual completion
  async recordRitual(ritualName: string, experience: string, effectiveness: number) {
    await this.memoryManager.recordMemory(
      this.userId,
      `Ritual: ${ritualName}\nExperience: ${experience}`,
      'ritual',
      {
        ritualName,
        effectiveness,
        element: this.userProfile.element
      }
    );
  }
  
  // Record dream or synchronicity
  async recordSynchronicity(content: string, type: 'dream' | 'synchronicity') {
    await this.memoryManager.recordMemory(
      this.userId,
      content,
      type,
      {
        element: this.userProfile.element,
        timestamp: new Date()
      }
    );
  }
  
  // Get memory statistics
  async getMemoryProfile() {
    return this.memoryManager.getMemoryStats(this.userId);
  }
  
  // Helper: time ago formatting
  private getTimeAgo(date: Date): string {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  }
}

/**
 * Collective Memory Integration for MainOracleAgent AIN
 */
export class CollectiveMemoryField extends EventEmitter {
  private memoryManagers: Map<string, MemoryManager> = new Map();
  private collectiveIndex: LlamaIndexService;
  private mainOracle: MainOracleAgent;
  
  constructor(
    mainOracle: MainOracleAgent,
    collectiveIndex: LlamaIndexService
  ) {
    super();
    this.mainOracle = mainOracle;
    this.collectiveIndex = collectiveIndex;
    this.initializeCollectiveField();
  }
  
  private async initializeCollectiveField() {
    // Subscribe to MainOracle's afferent stream
    this.mainOracle.on('afferent:received', async (data) => {
      await this.processAfferentMemory(data);
    });
    
    // Subscribe to collective insights
    this.mainOracle.on('insight:emerged', async (insight) => {
      await this.distributeCollectiveInsight(insight);
    });
  }
  
  // Process incoming memory from individual agents
  private async processAfferentMemory(data: {
    userId: string;
    type: string;
    content: any;
  }) {
    // Index in collective semantic space
    await this.collectiveIndex.index({
      id: `collective_${Date.now()}`,
      content: data.content,
      metadata: {
        userId: data.userId,
        type: data.type,
        timestamp: new Date(),
        anonymized: true // Privacy protection
      }
    });
    
    // Detect patterns across users
    const pattern = await this.detectCollectivePattern(data);
    if (pattern) {
      this.emit('pattern:detected', pattern);
      
      // Feed back to MainOracle
      this.mainOracle.processCollectivePattern(pattern);
    }
  }
  
  // Detect patterns in collective memory
  private async detectCollectivePattern(data: any): Promise<any> {
    // Search for similar memories across users
    const similar = await this.collectiveIndex.search({
      query: data.content,
      filters: {
        type: data.type,
        anonymized: true
      },
      limit: 20
    });
    
    // If many users have similar experiences, it's a pattern
    if (similar.length > 5) {
      const uniqueUsers = new Set(similar.map(s => s.metadata.userId));
      
      if (uniqueUsers.size > 3) {
        return {
          type: 'collective_resonance',
          theme: this.extractTheme(similar),
          affectedUsers: uniqueUsers.size,
          strength: similar.length / uniqueUsers.size,
          element: this.dominantElement(similar)
        };
      }
    }
    
    return null;
  }
  
  // Distribute collective insights back to individuals
  private async distributeCollectiveInsight(insight: {
    type: string;
    content: string;
    relevantElements: Element[];
  }) {
    // Find users who would benefit from this insight
    const relevantUsers = await this.findRelevantUsers(insight);
    
    for (const userId of relevantUsers) {
      const manager = this.getOrCreateMemoryManager(userId);
      
      // Record as collective wisdom
      await manager.recordMemory(
        userId,
        insight.content,
        'insight',
        {
          source: 'collective',
          type: insight.type,
          elements: insight.relevantElements
        }
      );
    }
  }
  
  // Find users relevant to an insight
  private async findRelevantUsers(insight: any): Promise<string[]> {
    const results = await this.collectiveIndex.search({
      query: insight.content,
      filters: {
        elements: insight.relevantElements
      },
      limit: 50
    });
    
    const userSet = new Set<string>();
    results.forEach(r => {
      if (r.metadata.userId) {
        userSet.add(r.metadata.userId);
      }
    });
    
    return Array.from(userSet);
  }
  
  // Get or create memory manager for user
  private getOrCreateMemoryManager(userId: string): MemoryManager {
    if (!this.memoryManagers.has(userId)) {
      const store = new SQLiteMemoryStore();
      const embedder = new OpenAIEmbedder();
      const compressor = new MemoryCompressorService();
      
      const manager = new MemoryManager(store, embedder, compressor);
      this.memoryManagers.set(userId, manager);
    }
    
    return this.memoryManagers.get(userId)!;
  }
  
  // Extract theme from similar memories
  private extractTheme(memories: any[]): string {
    // Simple keyword extraction
    const words: Record<string, number> = {};
    
    memories.forEach(m => {
      const tokens = m.content.toLowerCase().split(/\W+/);
      tokens.forEach(token => {
        if (token.length > 4) {
          words[token] = (words[token] || 0) + 1;
        }
      });
    });
    
    const topWords = Object.entries(words)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([word]) => word);
    
    return topWords.join(' ');
  }
  
  // Find dominant element
  private dominantElement(memories: any[]): Element {
    const elements: Record<Element, number> = {
      air: 0, fire: 0, water: 0, earth: 0, aether: 0
    };
    
    memories.forEach(m => {
      if (m.metadata?.element) {
        elements[m.metadata.element as Element]++;
      }
    });
    
    return Object.entries(elements)
      .sort((a, b) => b[1] - a[1])[0][0] as Element;
  }
  
  // Generate collective report
  async generateCollectiveReport(): Promise<{
    totalMemories: number;
    activeUsers: number;
    dominantThemes: string[];
    elementalBalance: Record<Element, number>;
    collectiveInsights: any[];
  }> {
    const allMemories = await this.collectiveIndex.getAll();
    const users = new Set(allMemories.map(m => m.metadata.userId));
    
    // Extract themes
    const themes = this.extractTheme(allMemories);
    
    // Calculate elemental balance
    const elementalBalance: Record<Element, number> = {
      air: 0, fire: 0, water: 0, earth: 0, aether: 0
    };
    
    allMemories.forEach(m => {
      if (m.metadata?.element) {
        elementalBalance[m.metadata.element as Element]++;
      }
    });
    
    // Get recent insights
    const insights = allMemories
      .filter(m => m.metadata.type === 'insight')
      .slice(-10);
    
    return {
      totalMemories: allMemories.length,
      activeUsers: users.size,
      dominantThemes: themes.split(' '),
      elementalBalance,
      collectiveInsights: insights
    };
  }
}

/**
 * Factory for creating memory-augmented agents
 */
export class MemoryAgentFactory {
  private memoryStore: SQLiteMemoryStore;
  private semanticIndex: LlamaIndexService;
  private embedder: OpenAIEmbedder;
  private compressor: MemoryCompressorService;
  private collectiveField?: CollectiveMemoryField;
  
  constructor() {
    this.memoryStore = new SQLiteMemoryStore();
    this.embedder = new OpenAIEmbedder();
    this.compressor = new MemoryCompressorService();
    this.semanticIndex = new LlamaIndexService(this.embedder);
  }
  
  // Create memory-augmented PersonalOracleAgent
  async createPersonalOracle(userId: string): Promise<MemoryAugmentedPersonalOracle> {
    const memoryManager = new MemoryManager(
      this.memoryStore,
      this.embedder,
      this.compressor
    );
    
    return new MemoryAugmentedPersonalOracle(
      userId,
      memoryManager,
      this.semanticIndex
    );
  }
  
  // Initialize collective memory field with MainOracle
  async initializeCollectiveField(mainOracle: MainOracleAgent): Promise<CollectiveMemoryField> {
    this.collectiveField = new CollectiveMemoryField(
      mainOracle,
      this.semanticIndex
    );
    
    return this.collectiveField;
  }
  
  // Get collective field instance
  getCollectiveField(): CollectiveMemoryField | undefined {
    return this.collectiveField;
  }
}