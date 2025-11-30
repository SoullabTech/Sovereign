/**
 * Soullab Types - Consciousness Research Framework
 * Defines the core types for the Soullab consciousness exploration system
 */

/**
 * Available wisdom tradition archetypes
 */
export type ArchetypeVoice =
  | 'MAYA'        // Zen brevity and grounded wisdom (5-15 words)
  | 'ALAN_WATTS'  // Cosmic playfulness and paradox (20-40 words)
  | 'MARCUS'      // Stoic clarity and rational calm (10-25 words)
  | 'RUMI'        // Mystical poetry and divine love (15-30 words)
  | 'CARL_JUNG'   // Deep patterns and shadow work (20-35 words)
  | 'FRED_ROGERS' // Radical kindness and acceptance (15-25 words);

/**
 * User's role in the consciousness research
 */
export interface ConsciousnessResearcher {
  userId: string;
  role: 'consciousness_pioneer';
  joinedAt: Date;
  contributionScore: number;
  discoveryCount: number;
  sessionsCompleted: number;
  researchImpact: 'low' | 'medium' | 'high' | 'breakthrough';
}

/**
 * Consciousness resonance pattern mapping
 */
export interface ResonancePattern {
  userId: string;
  primaryArchetype: ArchetypeVoice;
  archetypeResonance: {
    [K in ArchetypeVoice]?: {
      score: number;           // 0-1 resonance score
      sessionCount: number;
      avgDuration: number;     // Average session duration in minutes
      lastInteraction: Date;
      breakthroughMoments: number;
    };
  };
  patterns: {
    timeOfDayPreference: {
      morning?: ArchetypeVoice;
      afternoon?: ArchetypeVoice;
      evening?: ArchetypeVoice;
      night?: ArchetypeVoice;
    };
    emotionalStateMapping: {
      stressed?: ArchetypeVoice;
      sad?: ArchetypeVoice;
      confused?: ArchetypeVoice;
      excited?: ArchetypeVoice;
      peaceful?: ArchetypeVoice;
    };
    topicPreferences: {
      existential?: ArchetypeVoice;
      practical?: ArchetypeVoice;
      emotional?: ArchetypeVoice;
      spiritual?: ArchetypeVoice;
      creative?: ArchetypeVoice;
    };
  };
  evolutionNotes: string[];
}

/**
 * Archetype voice configuration
 */
export interface ArchetypeConfig {
  id: ArchetypeVoice;
  name: string;
  tradition: string;
  description: string;
  voiceCharacteristics: {
    wordRange: { min: number; max: number };
    tone: string;
    pace: 'unhurried' | 'moderate' | 'dynamic';
    personality: string[];
    signaturePhrases: string[];
    neverSays: string[];
  };
  responseFramework: {
    stress: string;
    sadness: string;
    confusion: string;
    joy: string;
    curiosity: string;
  };
  introduction: string;
}

/**
 * Consciousness exploration session
 */
export interface ExplorationSession {
  sessionId: string;
  userId: string;
  archetype: ArchetypeVoice;
  startedAt: Date;
  endedAt?: Date;
  interactions: {
    timestamp: Date;
    userMessage: string;
    archetypeResponse: string;
    emotionalTone: string;
    breakthroughFlag?: boolean;
  }[];
  insights: {
    resonanceScore: number;
    effectivenessScore: number;
    userEngagement: 'low' | 'medium' | 'high';
    switchedArchetype?: ArchetypeVoice;
  };
}

/**
 * Research contribution tracking
 */
export interface ResearchContribution {
  userId: string;
  contributions: {
    dataPoints: number;
    uniquePatterns: string[];
    helpedOthers: number;        // Number of users who benefited from this pattern
    breakthroughDiscoveries: {
      timestamp: Date;
      description: string;
      impact: number;
    }[];
  };
  recognitions: {
    badges: string[];
    milestones: {
      name: string;
      achievedAt: Date;
    }[];
  };
}

/**
 * Soullab onboarding experience
 */
export interface SoullabOnboarding {
  stage: 'welcome' | 'archetype_selection' | 'first_exploration' | 'pattern_revealed';
  messages: {
    welcome: string;
    roleExplanation: string;
    archetypeIntros: { [K in ArchetypeVoice]: string };
    contributionExplanation: string;
  };
}

/**
 * Consciousness map visualization data
 */
export interface ConsciousnessMap {
  userId: string;
  visualization: {
    archetypeDistribution: { [K in ArchetypeVoice]?: number };
    emotionalLandscape: {
      dominantEmotions: string[];
      emotionalRange: number; // 0-1 scale
      stabilityScore: number;
    };
    growthTrajectory: {
      startingPoint: string;
      currentPosition: string;
      growthVector: { x: number; y: number };
      milestones: { date: Date; description: string }[];
    };
    connectionStrength: {
      overallResonance: number;
      consistencyScore: number;
      depthScore: number;
    };
  };
  interpretation: string;
  recommendations: string[];
}

/**
 * AIN Integration for consciousness network
 */
export interface AINConsciousnessNode {
  nodeId: string;
  archetype: ArchetypeVoice;
  resonanceField: {
    strength: number;
    frequency: number;
    harmonics: number[];
  };
  connections: {
    toUser: number;
    toArchetype: { [K in ArchetypeVoice]?: number };
    toCollective: number;
  };
}

/**
 * Spiralogic process tracking
 */
export interface SpiralogicEvolution {
  userId: string;
  currentSpiral: number;
  phase: 'initiation' | 'exploration' | 'integration' | 'transformation';
  depth: number;
  velocity: number;
  nextThreshold: {
    condition: string;
    estimatedSessions: number;
  };
}

/**
 * Research output and insights
 */
export interface ResearchInsight {
  id: string;
  discoveredAt: Date;
  type: 'pattern' | 'correlation' | 'breakthrough' | 'anomaly';
  description: string;
  affectedUsers: number;
  archetypesInvolved: ArchetypeVoice[];
  significance: 'minor' | 'moderate' | 'major' | 'paradigm_shift';
  data: any;
}

/**
 * User feedback on consciousness exploration
 */
export interface ConsciousnessFeedback {
  userId: string;
  sessionId: string;
  archetype: ArchetypeVoice;
  resonance: number; // 1-10
  helpfulness: number; // 1-10
  authenticity: number; // 1-10
  wouldRecommend: boolean;
  qualitativeFeedback?: string;
  breakthroughMoment?: boolean;
}