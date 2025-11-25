/**
 * Factory helpers for PersonalOracleAgent
 * Centralizes default state creation to reduce drift and improve maintainability
 */

import type { AgentState, AgentMemory, AgentPersonality, Element } from './types';

/**
 * Creates a default AgentMemory for a new user
 */
export function createDefaultAgentMemory(userId: string): AgentMemory {
  return {
    userId,
    userRole: 'student',
    certificationLevel: 0,
    firstMeeting: new Date(),
    lastInteraction: new Date(),
    interactionCount: 0,
    conversationHistory: [],
    currentConversationThread: [],

    communicationStyle: {
      formality: 50,
      emotionalExpression: 50,
      abstractness: 50,
      sentenceLength: 'medium',
      preferredPronouns: [],
      vocabularyPatterns: []
    },

    soulSignature: {
      frequency: 432, // Healing frequency
      color: 'violet',
      tone: 'A',
      geometry: 'spiral'
    },

    polarisState: {
      selfAwareness: 50,
      otherAwareness: 50,
      sharedFocus: 'presence',
      harmonicResonance: 0,
      spiralDirection: 'stable',
      rotationSpeed: 1
    },

    trustLevel: 0,
    intimacyLevel: 0,
    soulRecognition: 0,
    breakthroughs: [],
    preferredRituals: [],
    avoidancePatterns: [],
    responseToChallenge: 'gradual',
    currentPhase: 'meeting',
    growthAreas: [],
    soulLessons: [],
    energyPatterns: {},

    // Elemental properties start undefined
    dominantElement: undefined,
    shadowElement: undefined
  };
}

/**
 * Creates a default AgentPersonality for initial interactions
 */
export function createDefaultAgentPersonality(): AgentPersonality {
  return {
    archetype: 'oracle',
    traits: {
      warmth: 70,
      directness: 50,
      challenge: 30,
      intuition: 60,
      playfulness: 40
    },
    voiceTone: 'gentle',
    communicationStyle: [
      'curious',
      'reflective',
      'supportive',
      'insightful'
    ]
  };
}

/**
 * Factory function to create a complete default AgentState
 * Use this instead of manually duplicating initialization
 */
export function createDefaultAgentState(userId: string, name: string = 'Your Oracle'): AgentState {
  const timeOfDay = getCurrentTimeOfDay();

  return {
    id: `oracle-${userId}-${Date.now()}`,
    name,
    personality: createDefaultAgentPersonality(),
    memory: createDefaultAgentMemory(userId),

    currentContext: {
      timeOfDay,
      conversationDepth: 0,
      conversationState: 'casual',
      emotionalLoad: 0,
      realityLayers: {
        physical: 'entering sacred space',
        emotional: 'curiosity and openness',
        mental: 'questioning and seeking',
        spiritual: 'soul stirring'
      }
    },

    evolutionStage: 1,

    realityAwareness: {
      innerWorld: {
        currentFocus: 'discovering',
        shadowWork: [],
        gifts: [],
        wounds: []
      },
      outerWorld: {
        challenges: [],
        opportunities: [],
        relationships: [],
        purpose: 'emerging'
      },
      bridgePoints: []
    }
  };
}

/**
 * Helper to get current time of day
 */
function getCurrentTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
  const hour = new Date().getHours();
  if (hour < 6) return 'night';
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  if (hour < 22) return 'evening';
  return 'night';
}

/**
 * Factory to evolve personality based on interaction patterns
 */
export function evolvePersonality(
  currentPersonality: AgentPersonality,
  responseToChallenge: 'gradual' | 'embraces' | 'resists',
  interactionCount: number
): AgentPersonality {
  const evolved = { ...currentPersonality };

  // Gradually adjust traits based on user responses
  if (responseToChallenge === 'embraces') {
    evolved.traits.challenge = Math.min(100, evolved.traits.challenge + 1);
  } else if (responseToChallenge === 'resists') {
    evolved.traits.challenge = Math.max(0, evolved.traits.challenge - 1);
    evolved.traits.warmth = Math.min(100, evolved.traits.warmth + 1);
  }

  // Evolve archetype at certain milestones
  if (interactionCount > 50 && evolved.traits.challenge > 60) {
    evolved.archetype = 'challenger';
  } else if (interactionCount > 50 && evolved.traits.warmth > 80) {
    evolved.archetype = 'nurturer';
  } else if (interactionCount > 100 && evolved.traits.intuition > 80) {
    evolved.archetype = 'mystic';
  }

  return evolved;
}

/**
 * Factory to determine conversation phase based on interaction count
 */
export function determinePhase(interactionCount: number): string {
  if (interactionCount > 50) return 'integrating';
  if (interactionCount > 30) return 'transforming';
  if (interactionCount > 15) return 'deepening';
  if (interactionCount > 5) return 'discovering';
  return 'meeting';
}

/**
 * Factory to calculate trust progression
 */
export function calculateTrustProgression(
  currentTrust: number,
  interactionQuality: 'positive' | 'neutral' | 'challenging'
): number {
  const progressionRates = {
    positive: 2,
    neutral: 1,
    challenging: 0.5
  };

  return Math.min(100, currentTrust + progressionRates[interactionQuality]);
}

/**
 * Factory to detect elemental dominance from patterns
 */
export function detectDominantElement(
  keywords: string[],
  energyPatterns: Record<string, string>
): Element | undefined {
  const elementScores: Record<Element, number> = {
    fire: 0,
    water: 0,
    earth: 0,
    air: 0,
    aether: 0
  };

  // Analyze keywords for elemental patterns
  const elementKeywords = {
    fire: ['passion', 'energy', 'action', 'motivation', 'drive', 'power', 'creative'],
    water: ['emotion', 'feeling', 'flow', 'intuition', 'healing', 'cleansing', 'receptive'],
    earth: ['ground', 'practical', 'stable', 'foundation', 'security', 'growth', 'material'],
    air: ['think', 'idea', 'communicate', 'clarity', 'inspiration', 'freedom', 'mental'],
    aether: ['spirit', 'consciousness', 'unity', 'transcend', 'divine', 'sacred', 'eternal']
  };

  for (const [element, patterns] of Object.entries(elementKeywords)) {
    for (const keyword of keywords) {
      if (patterns.some(pattern => keyword.toLowerCase().includes(pattern))) {
        elementScores[element as Element]++;
      }
    }
  }

  // Find dominant element
  const maxScore = Math.max(...Object.values(elementScores));
  if (maxScore === 0) return undefined;

  return Object.entries(elementScores)
    .find(([_, score]) => score === maxScore)?.[0] as Element;
}