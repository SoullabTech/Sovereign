/**
 * Maya Memory Orchestration Manager
 * Unifies all memory layers for deep, contextualized intelligence
 */

import { Mem0Client } from './clients/Mem0Client';
import { LangChainVectorStore } from './clients/LangChainStore';
import { SesameClient } from './clients/SesameClient';
import { JournalDatabase } from './clients/JournalDatabase';
import { MemoryPrioritizer } from './prioritizer';
import { MemoryFallbackHandler } from './fallback';

// Core Types
export interface ConversationTurn {
  role: 'user' | 'maya';
  content: string;
  timestamp: Date;
  emotionalState?: EmotionalVector;
}

export interface JournalEntry {
  id: string;
  userId: string;
  content: string;
  summary: string;
  date: Date;
  tags: string[];
  sentiment: number;
  embedding?: number[];
  relevanceScore?: number;
}

export interface UserProfile {
  userId: string;
  currentPhase: SpiralogicPhase;
  preferences: Record<string, any>;
  oracleHistory: OracleSession[];
  archetypalLeanings: string[];
  growthMetrics: GrowthMetrics;
}

export interface ArchetypalContext {
  dominantArchetype: string;
  elementalResonance: ElementalBalance;
  geometricPattern: string;
  collectiveTheme: string;
}

export interface ShadowEntry {
  content: string;
  pattern: string;
  integrationLevel: number;
  surfaceWhen: 'crisis' | 'requested' | 'pattern-match';
}

export interface EmotionalVector {
  valence: number;  // -1 to 1
  arousal: number;  // 0 to 1
  dominantEmotion: string;
}

export type SpiralogicPhase = 
  | 'initiation'
  | 'exploration' 
  | 'integration'
  | 'mastery'
  | 'transcendence';

export type MemoryQuality = 'full' | 'partial' | 'minimal';

export interface MemoryContext {
  session: ConversationTurn[];
  journals: JournalEntry[];
  longTerm: UserProfile | null;
  symbolic: ArchetypalContext | null;
  shadow: ShadowEntry[] | null;
  metadata: {
    timestamp: Date;
    phase: SpiralogicPhase;
    emotionalState: EmotionalVector;
    memoryQuality: MemoryQuality;
  };
}

export interface MemoryOptions {
  includeShadow?: boolean;
  maxJournals?: number;
  maxSessionTurns?: number;
  priorityWeights?: {
    recency: number;
    relevance: number;
    emotional: number;
    frequency: number;
  };
}

// Main Orchestrator
export class MemoryOrchestrator {
  private mem0Client: Mem0Client;
  private langchain: LangChainVectorStore;
  private sesame: SesameClient;
  private journalDb: JournalDatabase;
  private prioritizer: MemoryPrioritizer;
  private fallbackHandler: MemoryFallbackHandler;
  
  constructor(config: MemoryOrchestratorConfig) {
    this.mem0Client = new Mem0Client(config.mem0);
    this.langchain = new LangChainVectorStore(config.langchain);
    this.sesame = new SesameClient(config.sesame);
    this.journalDb = new JournalDatabase(config.journal);
    this.prioritizer = new MemoryPrioritizer();
    this.fallbackHandler = new MemoryFallbackHandler();
  }
  
  /**
   * Build unified memory context from all sources
   */
  async buildContext(
    userId: string,
    userInput: string,
    options: MemoryOptions = {}
  ): Promise<MemoryContext> {
    const failures: MemorySourceFailure[] = [];
    
    // Parallel fetch with error handling
    const [session, journals, profile, symbolic] = await Promise.allSettled([
      this.getSessionContext(userId, options.maxSessionTurns),
      this.getRelevantJournals(userId, userInput, options.maxJournals),
      this.getLongTermProfile(userId),
      this.getSymbolicEnrichment(userId, userInput)
    ]).then(results => {
      return results.map((result, index) => {
        if (result.status === 'rejected') {
          const sources = ['session', 'journals', 'longTerm', 'symbolic'];
          failures.push({ source: sources[index], error: result.reason });
          return null;
        }
        return result.value;
      });
    });
    
    // Handle failures gracefully
    if (failures.length > 0) {
      console.warn('Memory sources failed:', failures);
      if (failures.length === 4) {
        // Total failure, use fallback
        return this.fallbackHandler.handlePartialFailure(failures);
      }
    }
    
    // Rank and filter memories
    const rankedJournals = journals ? 
      this.prioritizer.rank(journals, userInput, options.priorityWeights) : [];
    
    // Check for shadow relevance (if enabled)
    const shadow = options.includeShadow ? 
      await this.checkShadowRelevance(userId, userInput, { session, journals: rankedJournals }) : 
      null;
    
    // Build final context
    const context: MemoryContext = {
      session: session || [],
      journals: rankedJournals,
      longTerm: profile,
      symbolic,
      shadow,
      metadata: {
        timestamp: new Date(),
        phase: profile?.currentPhase || 'initiation',
        emotionalState: await this.analyzeEmotionalState(userInput),
        memoryQuality: this.assessMemoryQuality({ session, journals: rankedJournals, profile, symbolic })
      }
    };
    
    return context;
  }
  
  /**
   * Get recent conversation history
   */
  private async getSessionContext(
    userId: string, 
    maxTurns = 10
  ): Promise<ConversationTurn[]> {
    // This would connect to your session store (Redis/in-memory)
    const sessions = await this.sessionStore.getRecentTurns(userId, maxTurns);
    return sessions;
  }
  
  /**
   * Retrieve semantically relevant journal entries
   */
  private async getRelevantJournals(
    userId: string,
    query: string,
    limit = 5
  ): Promise<JournalEntry[]> {
    return this.langchain.searchJournals(userId, query, limit);
  }
  
  /**
   * Fetch long-term user profile from Mem0
   */
  private async getLongTermProfile(userId: string): Promise<UserProfile | null> {
    try {
      return await this.mem0Client.getUserProfile(userId);
    } catch (error) {
      console.error('Failed to fetch Mem0 profile:', error);
      return null;
    }
  }
  
  /**
   * Get symbolic/archetypal enrichment from Sesame
   */
  private async getSymbolicEnrichment(
    userId: string,
    input: string
  ): Promise<ArchetypalContext | null> {
    try {
      return await this.sesame.getSymbolicContext(userId, input);
    } catch (error) {
      console.warn('Sesame enrichment unavailable:', error);
      return null;
    }
  }
  
  /**
   * Check if shadow work is relevant to current context
   */
  private async checkShadowRelevance(
    userId: string,
    input: string,
    context: Partial<MemoryContext>
  ): Promise<ShadowEntry[] | null> {
    // Shadow detection logic
    const shadowPatterns = [
      'denial', 'projection', 'repression', 
      'can\'t', 'hate', 'never', 'always'
    ];
    
    const hasPattern = shadowPatterns.some(p => 
      input.toLowerCase().includes(p)
    );
    
    if (!hasPattern) return null;
    
    // Fetch relevant shadow entries
    const shadowEntries = await this.journalDb.getShadowEntries(userId, {
      pattern: 'matching',
      limit: 3
    });
    
    return shadowEntries;
  }
  
  /**
   * Analyze emotional state from input
   */
  private async analyzeEmotionalState(input: string): Promise<EmotionalVector> {
    // This could use a sentiment analysis service or local model
    // For now, simplified implementation
    const emotions = {
      joy: ['happy', 'excited', 'grateful'],
      sadness: ['sad', 'depressed', 'lonely'],
      anger: ['angry', 'frustrated', 'annoyed'],
      fear: ['afraid', 'anxious', 'worried']
    };
    
    let dominantEmotion = 'neutral';
    let valence = 0;
    let arousal = 0.5;
    
    for (const [emotion, keywords] of Object.entries(emotions)) {
      if (keywords.some(k => input.toLowerCase().includes(k))) {
        dominantEmotion = emotion;
        valence = emotion === 'joy' ? 0.8 : -0.6;
        arousal = ['joy', 'anger'].includes(emotion) ? 0.8 : 0.3;
        break;
      }
    }
    
    return { valence, arousal, dominantEmotion };
  }
  
  /**
   * Assess quality of retrieved memory
   */
  private assessMemoryQuality(context: any): MemoryQuality {
    const sources = [
      context.session?.length > 0,
      context.journals?.length > 0,
      context.profile !== null,
      context.symbolic !== null
    ].filter(Boolean).length;
    
    if (sources >= 3) return 'full';
    if (sources >= 2) return 'partial';
    return 'minimal';
  }
  
  /**
   * Update memory stores after response
   */
  async updateMemoryStores(
    userId: string,
    userInput: string,
    mayaResponse: string
  ): Promise<void> {
    // Update session
    await this.sessionStore.addTurn(userId, {
      role: 'user',
      content: userInput,
      timestamp: new Date()
    });
    
    await this.sessionStore.addTurn(userId, {
      role: 'maya',
      content: mayaResponse,
      timestamp: new Date()
    });
    
    // Update long-term memory if significant
    if (this.isSignificantInteraction(userInput, mayaResponse)) {
      await this.mem0Client.updateMemory(
        userId,
        'last_significant_interaction',
        {
          input: userInput,
          response: mayaResponse,
          timestamp: new Date()
        }
      );
    }
  }
  
  private isSignificantInteraction(input: string, response: string): boolean {
    // Check for significance markers
    const significantMarkers = [
      'breakthrough', 'realize', 'understand',
      'pattern', 'always', 'never', 'important'
    ];
    
    return significantMarkers.some(m => 
      input.toLowerCase().includes(m) || 
      response.toLowerCase().includes(m)
    );
  }
}

// Configuration interface
export interface MemoryOrchestratorConfig {
  mem0: {
    apiKey: string;
    endpoint: string;
  };
  langchain: {
    vectorStore: string;
    embedder: string;
  };
  sesame: {
    endpoint: string;
    apiKey?: string;
  };
  journal: {
    database: string;
    connectionString: string;
  };
}