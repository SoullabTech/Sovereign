/**
 * Unified Memory Interface
 * Bridges all memory systems into one coherent interface
 */

import { EventEmitter } from 'events';
import { AnamnesisField, MemoryLayer } from './AnamnesisField';
import { PersonalOracleAgent } from '../agents/PersonalOracleAgent';
import { MainOracleAgent } from '../agents/MainOracleAgent';
import type { Element, Mood, EnergyState } from '../types/oracle';

/**
 * Memory Query Interface
 */
export interface MemoryQuery {
  query: string;
  userId?: string;
  layers?: MemoryLayer[];
  timeRange?: { start: Date; end: Date };
  elements?: Element[];
  moods?: Mood[];
  minImportance?: number;
  includeCollective?: boolean;
  includeArchetypal?: boolean;
  limit?: number;
}

/**
 * Memory Response Interface
 */
export interface MemoryResponse {
  memories: {
    layer: MemoryLayer;
    content: string;
    metadata: any;
    relevance: number;
  }[];
  insights: string[];
  patterns: {
    personal: string[];
    collective: string[];
    archetypal: string[];
  };
  suggestions: {
    rituals?: any[];
    navigation?: any[];
    practices?: any[];
  };
  resonance: {
    personal: number;
    collective: number;
    archetypal: number;
  };
}

/**
 * Unified Memory Interface
 */
export class UnifiedMemoryInterface extends EventEmitter {
  private field: AnamnesisField;
  private personalAgents: Map<string, PersonalOracleAgent> = new Map();
  private mainOracle?: MainOracleAgent;
  
  constructor(field: AnamnesisField) {
    super();
    this.field = field;
  }
  
  /**
   * Connect PersonalOracleAgent to memory field
   */
  connectPersonalAgent(userId: string, agent: PersonalOracleAgent) {
    this.personalAgents.set(userId, agent);
    
    // Subscribe to agent events
    agent.on('interaction', async (data) => {
      await this.processAgentInteraction(userId, data);
    });
    
    agent.on('insight', async (insight) => {
      await this.recordInsight(userId, insight);
    });
    
    agent.on('breakthrough', async (breakthrough) => {
      await this.recordBreakthrough(userId, breakthrough);
    });
    
    this.emit('agent:connected', { userId, type: 'personal' });
  }
  
  /**
   * Connect MainOracleAgent to memory field
   */
  connectMainOracle(oracle: MainOracleAgent) {
    this.mainOracle = oracle;
    
    // Subscribe to collective events
    oracle.on('pattern:detected', async (pattern) => {
      await this.processCollectivePattern(pattern);
    });
    
    oracle.on('archetype:activated', async (archetype) => {
      await this.activateArchetype(archetype);
    });
    
    oracle.on('synchronicity:detected', async (sync) => {
      await this.processSynchronicity(sync);
    });
    
    this.emit('agent:connected', { type: 'main' });
  }
  
  /**
   * Query memories across all layers
   */
  async query(params: MemoryQuery): Promise<MemoryResponse> {
    const layers = params.layers || [
      MemoryLayer.IMMEDIATE,
      MemoryLayer.EPISODIC,
      MemoryLayer.SEMANTIC
    ];
    
    const allMemories = [];
    const insights = [];
    const patterns = {
      personal: [],
      collective: [],
      archetypal: []
    };
    
    // Query each requested layer
    for (const layer of layers) {
      const layerMemories = await this.queryLayer(layer, params);
      allMemories.push(...layerMemories);
    }
    
    // Sort by relevance
    allMemories.sort((a, b) => b.relevance - a.relevance);
    
    // Limit results
    const limitedMemories = allMemories.slice(0, params.limit || 20);
    
    // Extract patterns
    if (params.userId) {
      patterns.personal = await this.extractPersonalPatterns(params.userId, limitedMemories);
    }
    
    if (params.includeCollective) {
      patterns.collective = await this.extractCollectivePatterns(limitedMemories);
    }
    
    if (params.includeArchetypal) {
      patterns.archetypal = await this.extractArchetypalPatterns(limitedMemories);
    }
    
    // Generate insights
    insights.push(...await this.generateInsights(limitedMemories, patterns));
    
    // Calculate resonance
    const resonance = await this.calculateResonance(limitedMemories, patterns);
    
    // Generate suggestions
    const suggestions = await this.generateSuggestions(limitedMemories, patterns, resonance);
    
    return {
      memories: limitedMemories,
      insights,
      patterns,
      suggestions,
      resonance
    };
  }
  
  /**
   * Query specific memory layer
   */
  private async queryLayer(layer: MemoryLayer, params: MemoryQuery): Promise<any[]> {
    switch (layer) {
      case MemoryLayer.IMMEDIATE:
        return this.queryImmediate(params);
      
      case MemoryLayer.EPISODIC:
        return this.queryEpisodic(params);
      
      case MemoryLayer.SEMANTIC:
        return this.querySemantic(params);
      
      case MemoryLayer.COLLECTIVE:
        return this.queryCollective(params);
      
      case MemoryLayer.ARCHETYPAL:
        return this.queryArchetypal(params);
      
      default:
        return [];
    }
  }
  
  /**
   * Query immediate memory (Mem0)
   */
  private async queryImmediate(params: MemoryQuery): Promise<any[]> {
    // Implementation would query Mem0
    return [];
  }
  
  /**
   * Query episodic memory
   */
  private async queryEpisodic(params: MemoryQuery): Promise<any[]> {
    // Implementation would query personal experiences
    return [];
  }
  
  /**
   * Query semantic memory
   */
  private async querySemantic(params: MemoryQuery): Promise<any[]> {
    // Implementation would query knowledge base
    return [];
  }
  
  /**
   * Query collective memory
   */
  private async queryCollective(params: MemoryQuery): Promise<any[]> {
    // Implementation would query collective patterns
    return [];
  }
  
  /**
   * Query archetypal memory
   */
  private async queryArchetypal(params: MemoryQuery): Promise<any[]> {
    // Implementation would query archetypal patterns
    return [];
  }
  
  /**
   * Process agent interaction
   */
  private async processAgentInteraction(userId: string, data: any) {
    await this.field.process(
      userId,
      data.input,
      {
        sessionId: data.sessionId,
        mood: data.mood,
        energy: data.energy,
        element: data.element,
        conversationHistory: data.history
      }
    );
  }
  
  /**
   * Record insight
   */
  private async recordInsight(userId: string, insight: any) {
    await this.field.process(
      userId,
      insight.content,
      {
        sessionId: `insight_${Date.now()}`,
        mood: insight.mood,
        energy: insight.energy,
        element: insight.element
      }
    );
    
    this.emit('insight:recorded', { userId, insight });
  }
  
  /**
   * Record breakthrough
   */
  private async recordBreakthrough(userId: string, breakthrough: any) {
    await this.field.process(
      userId,
      breakthrough.content,
      {
        sessionId: `breakthrough_${Date.now()}`,
        mood: 'radiant',
        energy: 'radiant',
        element: breakthrough.element
      }
    );
    
    this.emit('breakthrough:recorded', { userId, breakthrough });
  }
  
  /**
   * Process collective pattern
   */
  private async processCollectivePattern(pattern: any) {
    // Distribute to relevant personal agents
    for (const [userId, agent] of this.personalAgents) {
      if (this.isPatternRelevant(pattern, agent)) {
        agent.receiveCollectiveInsight(pattern);
      }
    }
    
    this.emit('pattern:distributed', pattern);
  }
  
  /**
   * Activate archetype
   */
  private async activateArchetype(archetype: any) {
    // Notify all agents of archetype activation
    for (const [userId, agent] of this.personalAgents) {
      agent.notifyArchetypeActivation(archetype);
    }
    
    this.emit('archetype:distributed', archetype);
  }
  
  /**
   * Process synchronicity
   */
  private async processSynchronicity(sync: any) {
    // Find connected users
    const connectedUsers = this.findSynchronicityConnections(sync);
    
    // Notify connected users
    for (const userId of connectedUsers) {
      const agent = this.personalAgents.get(userId);
      if (agent) {
        agent.notifySynchronicity(sync);
      }
    }
    
    this.emit('synchronicity:processed', sync);
  }
  
  /**
   * Extract personal patterns
   */
  private async extractPersonalPatterns(userId: string, memories: any[]): Promise<string[]> {
    const patterns = [];
    
    // Analyze memories for patterns
    const themes = this.extractThemes(memories);
    const recurring = this.findRecurring(memories);
    
    patterns.push(...themes, ...recurring);
    
    return patterns;
  }
  
  /**
   * Extract collective patterns
   */
  private async extractCollectivePatterns(memories: any[]): Promise<string[]> {
    const patterns = [];
    
    // Find patterns that appear across multiple users
    const crossUserPatterns = this.findCrossUserPatterns(memories);
    
    patterns.push(...crossUserPatterns);
    
    return patterns;
  }
  
  /**
   * Extract archetypal patterns
   */
  private async extractArchetypalPatterns(memories: any[]): Promise<string[]> {
    const patterns = [];
    
    // Identify universal themes
    const universalThemes = this.findUniversalThemes(memories);
    
    patterns.push(...universalThemes);
    
    return patterns;
  }
  
  /**
   * Generate insights from memories and patterns
   */
  private async generateInsights(memories: any[], patterns: any): Promise<string[]> {
    const insights = [];
    
    // Personal insights
    if (patterns.personal.length > 3) {
      insights.push(`You're exploring themes of ${patterns.personal.slice(0, 3).join(', ')}`);
    }
    
    // Collective insights
    if (patterns.collective.length > 0) {
      insights.push(`This resonates with collective patterns around ${patterns.collective[0]}`);
    }
    
    // Archetypal insights
    if (patterns.archetypal.length > 0) {
      insights.push(`The ${patterns.archetypal[0]} archetype is active in your journey`);
    }
    
    return insights;
  }
  
  /**
   * Calculate resonance
   */
  private async calculateResonance(memories: any[], patterns: any): Promise<any> {
    return {
      personal: this.calculatePersonalResonance(memories),
      collective: this.calculateCollectiveResonance(patterns.collective),
      archetypal: this.calculateArchetypalResonance(patterns.archetypal)
    };
  }
  
  /**
   * Generate suggestions
   */
  private async generateSuggestions(
    memories: any[],
    patterns: any,
    resonance: any
  ): Promise<any> {
    const suggestions: any = {};
    
    // Ritual suggestions
    if (resonance.archetypal > 70) {
      suggestions.rituals = [{
        name: 'Archetypal Integration Ritual',
        reason: 'Your archetypal resonance is high'
      }];
    }
    
    // Navigation suggestions
    if (resonance.collective > 60) {
      suggestions.navigation = [{
        route: '/community',
        reason: 'Connect with others on similar journeys'
      }];
    }
    
    // Practice suggestions
    if (patterns.personal.includes('transformation')) {
      suggestions.practices = [{
        name: 'Daily Transformation Practice',
        reason: 'Support your transformation process'
      }];
    }
    
    return suggestions;
  }
  
  // Helper methods
  private isPatternRelevant(pattern: any, agent: PersonalOracleAgent): boolean {
    const profile = agent.getUserProfile();
    return pattern.elements?.includes(profile.element) || 
           pattern.archetypes?.includes(profile.archetype);
  }
  
  private findSynchronicityConnections(sync: any): string[] {
    const connected = [];
    
    for (const [userId, agent] of this.personalAgents) {
      const profile = agent.getUserProfile();
      if (sync.elements?.includes(profile.element)) {
        connected.push(userId);
      }
    }
    
    return connected;
  }
  
  private extractThemes(memories: any[]): string[] {
    // Simple theme extraction
    const themes = new Set<string>();
    
    memories.forEach(m => {
      if (m.metadata?.theme) themes.add(m.metadata.theme);
    });
    
    return Array.from(themes);
  }
  
  private findRecurring(memories: any[]): string[] {
    // Find recurring patterns
    const counts: Record<string, number> = {};
    
    memories.forEach(m => {
      const key = m.metadata?.pattern || m.metadata?.theme;
      if (key) {
        counts[key] = (counts[key] || 0) + 1;
      }
    });
    
    return Object.entries(counts)
      .filter(([_, count]) => count > 2)
      .map(([pattern]) => pattern);
  }
  
  private findCrossUserPatterns(memories: any[]): string[] {
    // Find patterns across users
    const userPatterns: Record<string, Set<string>> = {};
    
    memories.forEach(m => {
      const userId = m.metadata?.userId;
      const pattern = m.metadata?.pattern;
      
      if (userId && pattern) {
        if (!userPatterns[pattern]) userPatterns[pattern] = new Set();
        userPatterns[pattern].add(userId);
      }
    });
    
    return Object.entries(userPatterns)
      .filter(([_, users]) => users.size > 2)
      .map(([pattern]) => pattern);
  }
  
  private findUniversalThemes(memories: any[]): string[] {
    const universalThemes = [
      'transformation', 'shadow', 'light', 'journey',
      'death', 'rebirth', 'love', 'fear', 'wisdom'
    ];
    
    const found = [];
    
    const allText = memories.map(m => m.content).join(' ').toLowerCase();
    
    universalThemes.forEach(theme => {
      if (allText.includes(theme)) {
        found.push(theme);
      }
    });
    
    return found;
  }
  
  private calculatePersonalResonance(memories: any[]): number {
    return Math.min(100, memories.length * 10);
  }
  
  private calculateCollectiveResonance(patterns: string[]): number {
    return Math.min(100, patterns.length * 20);
  }
  
  private calculateArchetypalResonance(patterns: string[]): number {
    return Math.min(100, patterns.length * 25);
  }
}

/**
 * Create unified memory interface
 */
export async function createUnifiedMemoryInterface(): Promise<UnifiedMemoryInterface> {
  const { initializeAnamnesisField } = await import('./AnamnesisField');
  const field = await initializeAnamnesisField();
  
  return new UnifiedMemoryInterface(field);
}