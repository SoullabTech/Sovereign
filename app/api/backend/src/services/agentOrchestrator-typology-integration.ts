/**
 * ArchetypalTypology Integration with Agent Orchestrator
 *
 * Provides typology-aware communication and archetypal understanding:
 * - Enneagram type recognition and response calibration
 * - MBTI preference understanding
 * - Zodiac archetypal theme reference
 * - Translation between typology systems
 *
 * Philosophy: Inclusive and integrative - meet users where they are.
 *
 * @module services/agentOrchestrator-typology-integration
 */

import { ArchetypalTypologyAgent } from '../agents/ArchetypalTypologyAgent';
import type {
  PersonalityQuery,
  PersonalityProfile,
  PersonalityInsight,
} from '../agents/ArchetypalTypologyAgent';
import { logger } from '../utils/logger';

// =============================================================================
// ARCHETYPAL TYPOLOGY WRAPPER
// =============================================================================

export class ArchetypalTypologyWrapper {
  private typology: ArchetypalTypologyAgent;

  constructor() {
    this.typology = new ArchetypalTypologyAgent('emerging');
  }

  /**
   * Process query through ArchetypalTypology lens
   */
  async processQuery(query: string, context?: any): Promise<any> {
    const userId = context?.userId || 'anonymous';

    // Build personality query
    const personalityQuery: PersonalityQuery = {
      userId,
      userInput: query,
      userProfile: context?.personalityProfile,
    };

    // Analyze personality indicators
    const insight = await this.typology.analyzePersonality(personalityQuery);

    // If no insights detected, return null (not archetypal typology territory)
    if (insight.insights.length === 0 && !context?.personalityProfile) {
      return null;
    }

    // Return insights for communication calibration
    return {
      personalityInsights: insight,
      communicationGuidance: insight.communicationGuidance,
      archetypeMapping: insight.archetypeMapping,
      growthPath: insight.growthPath,
    };
  }

  /**
   * Get communication style for user based on personality profile
   */
  async getCommunicationStyle(userId: string, profile?: PersonalityProfile): Promise<any> {
    if (!profile) {
      // TODO: Fetch from database
      return {
        style: 'Balanced and adaptive',
        tone: 'Warm yet clear',
        emphasize: ['Authenticity', 'Clarity', 'Respect'],
        avoid: ['Manipulation', 'Dishonesty', 'Dismissiveness'],
      };
    }

    return await this.typology.getCommunicationStyle(userId);
  }
}

// =============================================================================
// ROUTING LOGIC
// =============================================================================

/**
 * Should route to ArchetypalTypology?
 *
 * Route when:
 * - User mentions Enneagram type (e.g., "I'm a Type 4")
 * - User mentions MBTI (e.g., "I'm an INFJ")
 * - User mentions zodiac sign (e.g., "I'm a Scorpio")
 * - User asking about personality type
 * - User profile has typology information (calibrate communication)
 */
export function shouldRouteToTypology(input: string, context?: any): boolean {
  const lower = input.toLowerCase();

  // Enneagram indicators
  if (
    /type [1-9]|enneagram|wing|instinct|tritype|sp|sx|so|self-pres|sexual|social/i.test(lower)
  ) {
    logger.info('ArchetypalTypology routing: Enneagram mention detected');
    return true;
  }

  // MBTI indicators
  if (
    /mbti|myers.briggs|intj|intp|entj|entp|infj|infp|enfj|enfp|istj|isfj|estj|esfj|istp|isfp|estp|esfp/i.test(
      lower
    )
  ) {
    logger.info('ArchetypalTypology routing: MBTI mention detected');
    return true;
  }

  // Zodiac indicators (when asking about personality, not divination)
  if (
    /(?:i'm|i am) (?:a|an) (?:aries|taurus|gemini|cancer|leo|virgo|libra|scorpio|sagittarius|capricorn|aquarius|pisces)/i.test(
      lower
    )
  ) {
    logger.info('ArchetypalTypology routing: Zodiac personality reference detected');
    return true;
  }

  // Personality type questions
  if (/what.(?:type|personality)|my (?:type|personality)/i.test(lower)) {
    logger.info('ArchetypalTypology routing: Personality type question detected');
    return true;
  }

  // Context has personality profile (calibrate communication)
  if (context?.personalityProfile) {
    logger.info('ArchetypalTypology: Personality profile in context, calibrating communication');
    return true;
  }

  return false;
}

/**
 * Register ArchetypalTypology agent with orchestrator
 */
export function registerArchetypalTypologyAgent(registry: Map<string, any>): void {
  const wrapper = new ArchetypalTypologyWrapper();

  registry.set('archetypal-typology', {
    name: 'ArchetypalTypology',
    description: 'Understands Enneagram, MBTI, zodiac, and other personality typology systems',
    processQuery: (query: string, context?: any) => wrapper.processQuery(query, context),
  });

  logger.info('🧬 ArchetypalTypology agent registered');
}

// =============================================================================
// COMMUNICATION CALIBRATION
// =============================================================================

/**
 * Calibrate communication based on user's personality profile
 *
 * This is called by orchestrator to adapt MAIA's voice to user's type
 */
export async function calibrateCommunication(
  userId: string,
  profile?: PersonalityProfile
): Promise<{
  style: string;
  tone: string;
  emphasize: string[];
  avoid: string[];
}> {
  const wrapper = new ArchetypalTypologyWrapper();
  return await wrapper.getCommunicationStyle(userId, profile);
}

/**
 * Translate between typology systems
 *
 * Example: Type 4 Enneagram → INFP → Individualist/Romantic archetype
 */
export function translateTypologies(input: {
  enneagram?: string;
  mbti?: string;
  archetype?: string;
}): {
  enneagram?: string;
  mbti?: string;
  archetypes: string[];
  description: string;
} {
  // Type 4 translations
  if (input.enneagram === '4' || input.mbti === 'INFP') {
    return {
      enneagram: '4',
      mbti: 'INFP',
      archetypes: ['Individualist', 'Romantic', 'Artist', 'Seeker'],
      description:
        'The authentic individual who feels deeply, seeks meaning, and longs to be truly seen. Values uniqueness, depth, and emotional truth.',
    };
  }

  // Type 8 translations
  if (input.enneagram === '8' || input.mbti === 'ENTJ') {
    return {
      enneagram: '8',
      mbti: 'ENTJ',
      archetypes: ['Challenger', 'Warrior', 'Protector', 'Leader'],
      description:
        'The strong protector who takes charge, confronts injustice, and refuses vulnerability. Values strength, autonomy, and direct truth.',
    };
  }

  // Type 5 translations
  if (input.enneagram === '5' || input.mbti === 'INTP') {
    return {
      enneagram: '5',
      mbti: 'INTP',
      archetypes: ['Investigator', 'Observer', 'Sage', 'Analyst'],
      description:
        'The perceptive thinker who seeks to understand, conserve energy, and maintain autonomy. Values knowledge, competence, and independence.',
    };
  }

  // Type 2 translations
  if (input.enneagram === '2' || input.mbti === 'ENFJ') {
    return {
      enneagram: '2',
      mbti: 'ENFJ',
      archetypes: ['Helper', 'Caregiver', 'Lover', 'Nurturer'],
      description:
        'The generous heart who seeks connection through helping, loves deeply, and needs to be needed. Values relationship, care, and being appreciated.',
    };
  }

  // Type 1 translations
  if (input.enneagram === '1' || input.mbti === 'ISTJ') {
    return {
      enneagram: '1',
      mbti: 'ISTJ',
      archetypes: ['Reformer', 'Perfectionist', 'Judge', 'Guardian'],
      description:
        'The principled improver who seeks to do things right, maintains standards, and feels responsible for making things better. Values integrity, correctness, and improvement.',
    };
  }

  // Type 7 translations
  if (input.enneagram === '7' || input.mbti === 'ENFP') {
    return {
      enneagram: '7',
      mbti: 'ENFP',
      archetypes: ['Enthusiast', 'Adventurer', 'Epicure', 'Explorer'],
      description:
        'The joyful adventurer who seeks new experiences, avoids pain, and keeps options open. Values freedom, possibility, and joy.',
    };
  }

  // Type 6 translations
  if (input.enneagram === '6' || input.mbti === 'ISFJ') {
    return {
      enneagram: '6',
      mbti: 'ISFJ',
      archetypes: ['Loyalist', 'Guardian', 'Skeptic', 'Defender'],
      description:
        'The loyal guardian who seeks security, questions authority, and protects what matters. Values safety, loyalty, and trustworthiness.',
    };
  }

  // Type 3 translations
  if (input.enneagram === '3' || input.mbti === 'ESTJ') {
    return {
      enneagram: '3',
      mbti: 'ESTJ',
      archetypes: ['Achiever', 'Performer', 'Hero', 'Executive'],
      description:
        'The accomplished achiever who succeeds, adapts to win, and seeks admiration. Values success, efficiency, and recognition.',
    };
  }

  // Type 9 translations
  if (input.enneagram === '9' || input.mbti === 'INFJ') {
    return {
      enneagram: '9',
      mbti: 'INFJ',
      archetypes: ['Peacemaker', 'Mediator', 'Healer', 'Harmonizer'],
      description:
        'The peaceful mediator who seeks harmony, avoids conflict, and sees all sides. Values peace, acceptance, and unity.',
    };
  }

  // Default: return what was provided
  return {
    enneagram: input.enneagram,
    mbti: input.mbti,
    archetypes: input.archetype ? [input.archetype] : [],
    description: 'Typology translation not available for this combination.',
  };
}

// =============================================================================
// EXAMPLE USAGE
// =============================================================================

/**
 * Example: User mentions Enneagram type
 *
 * User: "I'm a Type 4 and I feel so misunderstood."
 *
 * Flow:
 * 1. shouldRouteToTypology() → true (detects "Type 4")
 * 2. processQuery() → analyzes Enneagram 4 indicators
 * 3. Returns communication guidance + archetype mapping
 * 4. MAIA responds with Type 4-calibrated voice
 * 5. Bridges to archetypal shadow work
 */

/**
 * Example: User mentions MBTI
 *
 * User: "As an INTJ, I struggle with people's emotions."
 *
 * Flow:
 * 1. shouldRouteToTypology() → true (detects "INTJ")
 * 2. processQuery() → analyzes MBTI Thinking preference
 * 3. Returns: Emphasize logic, avoid dismissing emotions
 * 4. MAIA responds: "INTJ's dominant Introverted Intuition sees patterns,
 *    but inferior Extraverted Feeling struggles with emotional navigation.
 *    Not a flaw—just less developed territory. The growth edge for INTJ
 *    is developing feeling function without abandoning thinking strength."
 */
