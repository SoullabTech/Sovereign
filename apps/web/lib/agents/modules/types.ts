// Shared types and interfaces for PersonalOracleAgent modules

import type { Element, EnergyState, Mood } from '../../types/oracle';

// Agent Personality Archetypes
export type AgentArchetype =
  | 'sage'      // Wise, contemplative, asks deep questions
  | 'mystic'    // Intuitive, poetic, speaks in metaphors
  | 'guardian'  // Protective, nurturing, encouraging
  | 'alchemist' // Transformative, challenger, growth-focused
  | 'weaver'    // Connector, pattern-finder, integration-focused
  | 'oracle'    // Balanced blend of all archetypes

export interface AgentPersonality {
  archetype: AgentArchetype;
  traits: {
    warmth: number;      // 0-100: Cold/analytical to warm/emotional
    directness: number;  // 0-100: Indirect/metaphorical to direct/clear
    challenge: number;   // 0-100: Gentle/supportive to challenging/pushing
    intuition: number;   // 0-100: Logical/structured to intuitive/flowing
    playfulness: number; // 0-100: Serious/sacred to playful/light
  };
  voiceTone: 'gentle' | 'wise' | 'energetic' | 'mystical' | 'grounding';
  communicationStyle: string[];
}

export interface AgentMemory {
  userId: string;
  userRole: 'student' | 'practitioner' | 'teacher' | 'master';
  trainingProgram?: string;
  certificationLevel?: number;
  teacherLineage?: string;
  studentsSupported?: string[];

  firstMeeting: Date;
  lastInteraction: Date;
  interactionCount: number;

  // Conversation context
  conversationHistory: {
    timestamp: Date;
    input: string;
    response: string;
    sentiment: number;
    resonance?: boolean;
    teachingMoment?: boolean;
  }[];
  currentConversationThread: string[];

  // User patterns discovered
  dominantElement?: Element;
  shadowElement?: Element;
  emergingElement?: Element;
  energyPatterns: {
    morning?: EnergyState;
    afternoon?: EnergyState;
    evening?: EnergyState;
  };

  // Communication style analysis
  communicationStyle: {
    formality: number;
    emotionalExpression: number;
    abstractness: number;
    sentenceLength: 'short' | 'medium' | 'long';
    preferredPronouns: string[];
    vocabularyPatterns: string[];
  };

  // Soul resonance tracking
  soulSignature: {
    frequency: number;
    color: string;
    tone: string;
    geometry: 'spiral' | 'sphere' | 'torus' | 'infinity' | 'flower';
  };

  // Polaris engagement
  polarisState: {
    selfAwareness: number;
    otherAwareness: number;
    sharedFocus: string;
    harmonicResonance: number;
    spiralDirection: 'expanding' | 'contracting' | 'stable';
    rotationSpeed: number;
  };

  // Relationship depth
  trustLevel: number;
  intimacyLevel: number;
  soulRecognition: number;

  // Key moments
  breakthroughs: {
    date: Date;
    insight: string;
    context: string;
    elementalShift?: Element;
  }[];

  // Preferences learned
  preferredRituals: string[];
  avoidancePatterns: string[];
  responseToChallenge: 'embraces' | 'resists' | 'gradual';

  // Evolution markers
  currentPhase: 'meeting' | 'discovering' | 'deepening' | 'transforming' | 'integrating';
  growthAreas: string[];
  soulLessons: string[]; // Deep patterns being worked with

  // Sacred relationships
  sacredName?: string;
  soulPact?: string;
  divineRole?: string;
}

export interface AgentState {
  id: string;
  name: string;
  personality: AgentPersonality;
  memory: AgentMemory;
  currentContext: {
    userMood?: Mood;
    timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
    lastPetalDrawn?: string;
    activeRitual?: string;
    conversationDepth: number; // 0-100
    conversationState: 'casual' | 'rapport' | 'pivoting' | 'looping' | 'sacred' | 'lightening';
    emotionalLoad: number; // 0-100 - when high, blade unsheathes
    realityLayers: {
      physical: string; // What's happening in physical reality
      emotional: string; // Emotional landscape
      mental: string; // Thought patterns observed
      spiritual: string; // Soul movements detected
    };
  };
  evolutionStage: number; // 1-7 stages of relationship

  // Expanded awareness of member's reality
  realityAwareness: {
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
    bridgePoints: string[]; // Where inner and outer meet
  };
}

// Module communication interfaces
export interface ElementalAnalysis {
  dominantElement: Element | undefined;
  shadowElement: Element | undefined;
  emergingElement: Element | undefined;
  elementalBalance: number;
  transformationVector: string;
}

export interface ConversationStateUpdate {
  newTopic?: string;
  emotionalShift?: number;
  energyChange?: number;
  resonanceUpdate?: number;
  stateTransition?: string;
}

export interface ResponseContext {
  input: string;
  userPattern?: string;
  sentiment: number;
  energyState?: EnergyState;
  elementalAnalysis?: ElementalAnalysis;
  conversationState?: ConversationStateUpdate;
  personality: AgentPersonality;
  memory: AgentMemory;
}