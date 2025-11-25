/**
 * Type definitions for PersonalOracleAgent
 * Resolves TypeScript errors for missing properties
 */

// Element type (adjust import path if defined elsewhere)
export type Element = 'fire' | 'water' | 'earth' | 'air' | 'aether';

export interface AgentMemory {
  userId: string;
  userRole: string;
  certificationLevel: number;
  firstMeeting: Date;
  lastInteraction: Date;
  interactionCount: number;

  // Conversation history & context
  conversationHistory: string[];
  currentConversationThread: string[];

  // Communication preferences
  communicationStyle: {
    formality: number;
    emotionalExpression: number;
    abstractness: number;
    sentenceLength: 'short' | 'medium' | 'long';
    preferredPronouns: string[];
    vocabularyPatterns: string[];
  };

  // Soul / symbolic resonance
  soulSignature: {
    frequency: number;
    color: string;
    tone: string;
    geometry: string;
  };

  polarisState: {
    selfAwareness: number;
    otherAwareness: number;
    sharedFocus: string;
    harmonicResonance: number;
    spiralDirection: 'stable' | 'expanding' | 'contracting';
    rotationSpeed: number;
  };

  // Relational development
  trustLevel: number;
  intimacyLevel: number;
  soulRecognition: number;
  breakthroughs: string[];
  preferredRituals: string[];
  avoidancePatterns: string[];
  responseToChallenge: 'gradual' | 'embraces' | 'resists';
  currentPhase: string;
  growthAreas: string[];
  soulLessons: string[];

  // Energy patterns by time of day or context
  energyPatterns: {
    morning?: string;
    afternoon?: string;
    evening?: string;
    night?: string;
    [key: string]: string | undefined;
  };

  // Elemental mapping (FIXED: was missing)
  dominantElement?: Element;
  shadowElement?: Element;
}

export interface AgentPersonality {
  archetype: 'oracle' | 'guide' | 'challenger' | 'nurturer' | 'mystic';
  traits: {
    warmth: number;
    directness: number;
    challenge: number;
    intuition: number;
    playfulness: number;
  };
  voiceTone: 'gentle' | 'firm' | 'playful' | 'mystical' | 'neutral';
  communicationStyle: string[];
}

export interface AgentArchetype {
  name: string;
  element: Element;
  strengths: string[];
  shadows: string[];
  gifts: string[];
}

export interface RealityAwareness {
  innerWorld: {
    currentFocus: string;
    shadowWork: string[];
    gifts: string[];
    wounds: string[];
  };
  outerWorld: {
    challenges: string[];
    opportunities: string[];
    relationships: string[];
    purpose: string;
  };
  bridgePoints: string[];
}

export interface CurrentContext {
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  conversationDepth: number;
  conversationState: 'casual' | 'rapport' | 'deep' | 'integration';
  emotionalLoad: number;
  realityLayers: {
    physical: string;
    emotional: string;
    mental: string;
    spiritual: string;
  };
  userMood?: Mood;
  lastPetalDrawn?: string;
}

export interface AgentState {
  id: string;
  name: string;
  personality: AgentPersonality;
  memory: AgentMemory;
  currentContext: CurrentContext;
  evolutionStage: number;
  realityAwareness: RealityAwareness;
}

// Supporting types
export interface Mood {
  energy: number;
  valence: number;
  clarity: number;
  presence: number;
}

export interface EnergyState {
  level: number;
  quality: 'scattered' | 'focused' | 'flowing' | 'blocked' | 'radiant';
  elementalBalance: {
    fire: number;
    water: number;
    earth: number;
    air: number;
    aether: number;
  };
}

// Process interaction context (FIXED: properly typed)
export interface InteractionContext {
  currentPetal?: string;
  currentMood?: Mood;
  currentEnergy?: EnergyState;
  previousInteractions?: number;
  userPreferences?: Record<string, any>;
  currentPhase?: string;
}

// Response types
export interface OracleResponse {
  response: string;
  suggestions?: string[];
  ritual?: string;
  reflection?: string;
  element?: Element;
  archetype?: string;
  confidence?: number;
  metadata?: {
    sessionId?: string;
    symbols?: string[];
    phase?: string;
    recommendations?: string[];
    nextSteps?: string[];
  };
}