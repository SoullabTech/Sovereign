/**
 * Maya Memory Orchestration Manager - STUB
 *
 * This module previously orchestrated Mem0, LangChain, and Sesame clients.
 * Now using postgres-only architecture via DevelopmentalMemory and TurnsStore.
 *
 * @deprecated Use lib/memory/DevelopmentalMemory.ts and lib/memory/stores/TurnsStore.ts instead
 */

// Core Types - preserved for compatibility
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
  oracleHistory: any[];
  archetypalLeanings: string[];
  growthMetrics: any;
}

export interface ArchetypalContext {
  dominantArchetype: string;
  elementalResonance: any;
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
  valence: number;
  arousal: number;
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

export interface MemoryOrchestratorConfig {
  mem0?: { apiKey: string; endpoint: string };
  langchain?: { vectorStore: string; embedder: string };
  sesame?: { endpoint: string; apiKey?: string };
  journal?: { database: string; connectionString: string };
}

/**
 * @deprecated Use postgres-native memory stores instead
 */
export class MemoryOrchestrator {
  constructor(_config?: MemoryOrchestratorConfig) {
    console.warn('[MemoryOrchestrator] DEPRECATED - use postgres-native memory stores');
  }

  async buildContext(
    _userId: string,
    _userInput: string,
    _options: MemoryOptions = {}
  ): Promise<MemoryContext> {
    return {
      session: [],
      journals: [],
      longTerm: null,
      symbolic: null,
      shadow: null,
      metadata: {
        timestamp: new Date(),
        phase: 'initiation',
        emotionalState: { valence: 0, arousal: 0.5, dominantEmotion: 'neutral' },
        memoryQuality: 'minimal'
      }
    };
  }

  async updateMemoryStores(
    _userId: string,
    _userInput: string,
    _mayaResponse: string
  ): Promise<void> {
    // No-op - use TurnsStore.addExchange() instead
  }
}
