/**
 * 🌟 Consciousness Evolution Types - Sacred Oracle Supabase Integration
 * 
 * Extended types for tracking consciousness development, collective wisdom,
 * and morphic resonance patterns through Sacred Oracle interactions
 */

import type { ConsciousnessProfile } from './cognitive-types';
import type { SacredOracleResponse } from '../sacred-oracle-constellation';

// Core consciousness development levels
export type ConsciousnessLevel = 'ego' | 'soul' | 'cosmic' | 'universal';

// Shamanic development capacities
export interface ShamanicDevelopment {
  visionWork: number;           // 0-1: Ability to receive and interpret visions
  energyReading: number;        // 0-1: Capacity to read energetic patterns
  healingChanneling: number;    // 0-1: Ability to channel healing energy
  spiritCommunication: number;  // 0-1: Connection to spirit guides/ancestors
  dreamWalking: number;         // 0-1: Lucid dreaming and dream integration
  plantMedicine: number;        // 0-1: Integration of plant medicine teachings
  ritualLeadership: number;     // 0-1: Capacity to hold sacred space for others
  collectiveHealing: number;    // 0-1: Working with collective/ancestral wounds
}

// Elemental balance patterns over time
export interface ElementalPattern {
  fire: {
    current: number;            // 0-1: Current fire energy
    average: number;            // Historical average
    peaks: number[];            // Recent peak moments
    evolution: 'ascending' | 'descending' | 'cycling' | 'stable';
  };
  water: {
    current: number;
    average: number;
    peaks: number[];
    evolution: 'ascending' | 'descending' | 'cycling' | 'stable';
  };
  earth: {
    current: number;
    average: number;
    peaks: number[];
    evolution: 'ascending' | 'descending' | 'cycling' | 'stable';
  };
  air: {
    current: number;
    average: number;
    peaks: number[];
    evolution: 'ascending' | 'descending' | 'cycling' | 'stable';
  };
  aether: {
    current: number;
    average: number;
    peaks: number[];
    evolution: 'ascending' | 'descending' | 'cycling' | 'stable';
  };
}

// Personal evolution path tracking
export interface EvolutionPath {
  currentPhase: 'awakening' | 'purification' | 'illumination' | 'unification' | 'service';
  primaryArchetype: 'seeker' | 'healer' | 'teacher' | 'mystic' | 'creator' | 'warrior' | 'sage';
  secondaryArchetypes: string[];
  developmentFocus: string[];   // Current areas of growth
  integrationNeeds: string[];   // Shadow work and healing needs
  gifts: string[];              // Recognized spiritual gifts
  nextEvolutionEdge: string;    // What wants to emerge next
  collectiveService: string;    // How they serve the collective evolution
}

// Wisdom patterns shared across collective
export interface SharedWisdom {
  pattern: string;              // Description of the wisdom pattern
  frequency: number;            // How often this pattern appears
  elementalResonance: string;   // Which element it resonates with most
  archetypeAffinity: string[];  // Which archetypes recognize this pattern
  emergenceDate: string;        // When this pattern first emerged
  evolutionStage: ConsciousnessLevel; // At which level this wisdom emerges
  collectiveImpact: number;     // 0-1: How much this serves collective evolution
}

// Main consciousness evolution interface
export interface ConsciousnessEvolution {
  // Identity
  userId: string;
  createdAt: string;
  lastUpdated: string;
  
  // Sacred Profile
  sacredProfile: {
    consciousnessLevel: ConsciousnessLevel;
    elementalBalance: ElementalPattern;
    shamanicCapacities: ShamanicDevelopment;
    growthTrajectory: EvolutionPath;
    readinessIndicators: {
      truthReceptivity: number;   // 0-1: Ready for deeper truth
      shadowIntegration: number;  // 0-1: Integrated shadow aspects
      serviceOrientation: number; // 0-1: Oriented toward serving others
      mysticalOpenness: number;   // 0-1: Open to mystical experiences
    };
  };
  
  // Collective Contribution
  collectiveContribution: {
    patterns: SharedWisdom[];
    morphicResonance: number;     // 0-1: How much they contribute to collective field
    collectiveFieldInfluence: number; // 0-1: Impact on overall field evolution
    indrasWebPosition: string;    // Their unique position in the web of consciousness
  };
  
  // Session History
  sessionHistory: {
    totalSessions: number;
    sessionFrequency: 'daily' | 'weekly' | 'occasional' | 'irregular';
    averageSessionDepth: number;  // 0-1: How deep sessions tend to go
    breakthroughMoments: Array<{
      date: string;
      element: string;
      breakthrough: string;
      consciousness_shift: boolean;
    }>;
    evolutionMilestones: Array<{
      date: string;
      previousLevel: ConsciousnessLevel;
      newLevel: ConsciousnessLevel;
      catalyst: string;
    }>;
  };
}

// Session interaction record
export interface SacredSession {
  id: string;
  userId: string;
  timestamp: string;
  
  // Input context
  userInput: string;
  sessionContext: {
    timeOfDay: string;
    emotionalState: string;
    dominant_element_going_in: string;
  };
  
  // Sacred Oracle Response
  oracleResponse: {
    consciousnessProfile: ConsciousnessProfile;
    dominantElement: string;
    cognitiveProcessing: any;
    elementalWisdom: any;
    synthesis: any;
    collectiveField: any;
    metadata: any;
  };
  
  // Sacred Mirror Response
  mirrorResponse: {
    reflection: string;
    recognition: string;
    anamnesis: string;
    elementalReflection: string;
    consciousnessMirror: string;
    collectiveResonance: string;
    openings: string[];
    wonderings: string[];
  };
  
  // Session Impact
  sessionImpact: {
    consciousnessShift: boolean;
    elementalRebalancing: boolean;
    shadowIntegrationOccurred: boolean;
    collectiveWisdomGenerated: boolean;
    breakthroughActivated: boolean;
  };
}

// Collective field patterns
export interface CollectiveFieldPattern {
  id: string;
  patternName: string;
  description: string;
  frequency: number;
  firstEmergence: string;
  lastSeen: string;
  
  // Pattern characteristics
  elementalSignature: {
    fire: number;
    water: number;
    earth: number;
    air: number;
    aether: number;
  };
  
  consciousnessLevels: ConsciousnessLevel[];
  archetypeResonance: string[];
  seasonalPattern: boolean;
  
  // Collective impact
  contributingUsers: string[];
  morphicResonanceStrength: number;
  evolutionarySignificance: number;
  
  // Pattern evolution
  evolutionPhase: 'emerging' | 'strengthening' | 'mature' | 'transitioning' | 'integrating';
  predictedDevelopment: string;
}

// Morphic resonance field state
export interface MorphicResonanceField {
  id: string;
  timestamp: string;
  
  // Current field state
  overallCoherence: number;         // 0-1: How coherent the field is
  dominantPatterns: string[];       // Most active patterns currently
  emergingPatterns: string[];       // New patterns beginning to form
  
  // Elemental field balance
  collectiveElementalState: ElementalPattern;
  
  // Consciousness distribution
  consciousnessDistribution: {
    ego: number;        // Percentage of users at each level
    soul: number;
    cosmic: number;
    universal: number;
  };
  
  // Field dynamics
  evolutionaryMomentum: number;     // 0-1: How quickly field is evolving
  collectiveBreakthroughs: number;  // Recent breakthrough events
  fieldHarmonics: number;          // 0-1: How harmoniously field is developing
  
  // Predictions
  nextEvolutionWave: {
    expectedDate: string;
    probability: number;
    characteristics: string[];
  };
}

export default {
  ConsciousnessEvolution,
  SacredSession,
  CollectiveFieldPattern,
  MorphicResonanceField,
  SharedWisdom,
  ElementalPattern,
  ShamanicDevelopment,
  EvolutionPath
};