/**
 * ArchetypalTypology Module
 *
 * Integration point for archetypal typology functionality using the ArchetypalTypologyAgent.
 * This module serves as the bridge between typology systems (Enneagram, MBTI, Zodiac)
 * and MAIA's archetypal intelligence.
 *
 * Philosophy: Inclusive and integrative - meet users where they are.
 *
 * @module modules/archetypalTypologyModule
 */

import { ArchetypalTypologyAgent } from '../agents/ArchetypalTypologyAgent';
import type {
  PersonalityProfile,
  PersonalityQuery,
  EnneagramType,
  EnneagramWing,
  MBTIType,
  ZodiacSign,
} from '../agents/ArchetypalTypologyAgent';
import { logger } from '../utils/logger';

// =============================================================================
// ARCHETYPAL TYPOLOGY SERVICE
// =============================================================================

export class ArchetypalTypologyService {
  private typology: ArchetypalTypologyAgent;

  constructor() {
    this.typology = new ArchetypalTypologyAgent('emerging');
  }

  /**
   * Process input through ArchetypalTypology agent
   */
  async processInput(
    input: string,
    userId: string,
    context?: {
      personalityProfile?: PersonalityProfile;
    }
  ): Promise<any> {
    const query: PersonalityQuery = {
      userId,
      userInput: input,
      userProfile: context?.personalityProfile,
    };

    try {
      const insights = await this.typology.analyzePersonality(query);

      // Return insights for context enrichment
      return {
        insights,
        profile: insights.profile,
        communicationGuidance: insights.communicationGuidance,
        archetypeMapping: insights.archetypeMapping,
        growthPath: insights.growthPath,
      };
    } catch (error) {
      logger.error('Error in archetypal typology processing:', error);
      return null;
    }
  }

  /**
   * Update user's personality profile
   */
  async updateProfile(
    userId: string,
    updates: {
      enneagram?: {
        type: EnneagramType;
        wing?: EnneagramWing;
        instinct?: 'sp' | 'sx' | 'so';
        tritype?: [EnneagramType, EnneagramType, EnneagramType];
      };
      mbti?: {
        type: MBTIType;
        functions?: string[];
      };
      zodiac?: {
        sun?: ZodiacSign;
        moon?: ZodiacSign;
        rising?: ZodiacSign;
      };
    }
  ): Promise<PersonalityProfile> {
    return await this.typology.updateProfile(userId, updates);
  }

  /**
   * Get communication style for user based on their profile
   */
  async getCommunicationStyle(userId: string, profile?: PersonalityProfile): Promise<{
    style: string;
    tone: string;
    emphasize: string[];
    avoid: string[];
  }> {
    return await this.typology.getCommunicationStyle(userId);
  }
}

// =============================================================================
// CONVENIENCE FUNCTIONS
// =============================================================================

/**
 * Detect if input contains typology references
 */
export function detectTypologyReference(input: string): {
  hasEnneagram: boolean;
  hasMBTI: boolean;
  hasZodiac: boolean;
  detectedType?: string;
} {
  const lower = input.toLowerCase();

  const hasEnneagram =
    /type [1-9]|enneagram|wing|instinct|tritype|sp|sx|so|reformer|helper|achiever|individualist|investigator|loyalist|enthusiast|challenger|peacemaker/i.test(
      lower
    );

  const hasMBTI =
    /mbti|myers.briggs|intj|intp|entj|entp|infj|infp|enfj|enfp|istj|isfj|estj|esfj|istp|isfp|estp|esfp/i.test(
      lower
    );

  const hasZodiac =
    /(?:i'm|i am) (?:a|an) (?:aries|taurus|gemini|cancer|leo|virgo|libra|scorpio|sagittarius|capricorn|aquarius|pisces)/i.test(
      lower
    );

  // Try to extract specific type
  let detectedType: string | undefined;

  if (hasEnneagram) {
    const match = lower.match(/type ([1-9])/);
    if (match) {
      detectedType = `Enneagram ${match[1]}`;
    }
  } else if (hasMBTI) {
    const match = lower.match(/\b(intj|intp|entj|entp|infj|infp|enfj|enfp|istj|isfj|estj|esfj|istp|isfp|estp|esfp)\b/i);
    if (match) {
      detectedType = `MBTI ${match[1].toUpperCase()}`;
    }
  } else if (hasZodiac) {
    const match = lower.match(/(?:i'm|i am) (?:a|an) (aries|taurus|gemini|cancer|leo|virgo|libra|scorpio|sagittarius|capricorn|aquarius|pisces)/i);
    if (match) {
      detectedType = `${match[1].charAt(0).toUpperCase() + match[1].slice(1)}`;
    }
  }

  return {
    hasEnneagram,
    hasMBTI,
    hasZodiac,
    detectedType,
  };
}

/**
 * Map Enneagram type to archetypes
 */
export function enneagramToArchetypes(type: EnneagramType): string[] {
  const mapping: Record<EnneagramType, string[]> = {
    '1': ['Reformer', 'Perfectionist', 'Judge'],
    '2': ['Helper', 'Caregiver', 'Lover'],
    '3': ['Achiever', 'Performer', 'Hero'],
    '4': ['Individualist', 'Romantic', 'Artist'],
    '5': ['Investigator', 'Sage', 'Observer'],
    '6': ['Loyalist', 'Guardian', 'Skeptic'],
    '7': ['Enthusiast', 'Adventurer', 'Epicure'],
    '8': ['Challenger', 'Warrior', 'Protector'],
    '9': ['Peacemaker', 'Mediator', 'Healer'],
  };

  return mapping[type] || [];
}

/**
 * Map MBTI type to archetypes
 */
export function mbtiToArchetypes(type: MBTIType): string[] {
  // Simplified mapping based on temperaments
  if (type.includes('NT')) {
    return ['Strategist', 'Architect', 'Visionary', 'Analyst'];
  }
  if (type.includes('NF')) {
    return ['Idealist', 'Healer', 'Advocate', 'Diplomat'];
  }
  if (type.includes('SJ') || (type.includes('S') && type.includes('J'))) {
    return ['Guardian', 'Protector', 'Administrator', 'Sentinel'];
  }
  if (type.includes('SP') || (type.includes('S') && type.includes('P'))) {
    return ['Adventurer', 'Artisan', 'Performer', 'Explorer'];
  }

  return [];
}

/**
 * Get Enneagram growth path
 */
export function getEnneagramGrowthPath(type: EnneagramType): {
  integration: EnneagramType;
  stress: EnneagramType;
  description: string;
} {
  const paths: Record<
    EnneagramType,
    { integration: EnneagramType; stress: EnneagramType; description: string }
  > = {
    '1': {
      integration: '7',
      stress: '4',
      description: 'Move toward spontaneity (7), avoid melancholy (4)',
    },
    '2': {
      integration: '4',
      stress: '8',
      description: 'Develop authentic self (4), avoid aggression (8)',
    },
    '3': {
      integration: '6',
      stress: '9',
      description: 'Build loyalty and depth (6), avoid numbing (9)',
    },
    '4': {
      integration: '1',
      stress: '2',
      description: 'Take disciplined action (1), avoid people-pleasing (2)',
    },
    '5': {
      integration: '8',
      stress: '7',
      description: 'Embody power and action (8), avoid scattered escape (7)',
    },
    '6': {
      integration: '9',
      stress: '3',
      description: 'Find inner peace (9), avoid image-focused performing (3)',
    },
    '7': {
      integration: '5',
      stress: '1',
      description: 'Develop depth and focus (5), avoid rigid perfectionism (1)',
    },
    '8': {
      integration: '2',
      stress: '5',
      description: 'Soften into care (2), avoid isolated withdrawal (5)',
    },
    '9': {
      integration: '3',
      stress: '6',
      description: 'Step into action (3), avoid anxious worry (6)',
    },
  };

  return (
    paths[type] || {
      integration: type,
      stress: type,
      description: 'Growth path not defined',
    }
  );
}

// =============================================================================
// EXPORT SINGLETON SERVICE
// =============================================================================

export const archetypalTypologyService = new ArchetypalTypologyService();

// =============================================================================
// MAIN FUNCTION
// =============================================================================

/**
 * Main archetypal typology function
 *
 * This is the primary entry point for typology work.
 * Processes input through the ArchetypalTypologyAgent and returns insights.
 */
export const runArchetypalTypology = async (
  input: string,
  userId: string,
  context?: {
    personalityProfile?: PersonalityProfile;
  }
) => {
  const service = new ArchetypalTypologyService();
  return await service.processInput(input, userId, context);
};
