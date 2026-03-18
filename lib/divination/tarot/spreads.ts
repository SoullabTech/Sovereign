/**
 * Tarot Spreads
 * Configuration for various tarot spread layouts
 */

import { TarotSpread, SpreadPosition, Element } from '../core/types';

/**
 * Single Card - Daily Guidance
 */
export const SINGLE_CARD_SPREAD: TarotSpread = {
  name: 'Single Card',
  description: 'A simple daily guidance draw for clarity and focus',
  cardCount: 1,
  positions: [
    {
      name: 'The Message',
      description: 'Your guidance for the moment',
      index: 0
    }
  ],
  purpose: 'Daily guidance, quick answers, meditation focus',
  difficulty: 'beginner'
};

/**
 * Three Card Spread - Past/Present/Future
 */
export const THREE_CARD_SPREAD: TarotSpread = {
  name: 'Three Card',
  description: 'Classic past, present, and future timeline reading',
  cardCount: 3,
  positions: [
    {
      name: 'Past',
      description: 'Influences from the past affecting the situation',
      index: 0
    },
    {
      name: 'Present',
      description: 'Current energies and circumstances',
      index: 1
    },
    {
      name: 'Future',
      description: 'Likely outcome based on current trajectory',
      index: 2
    }
  ],
  purpose: 'Timeline readings, situation overview',
  difficulty: 'beginner'
};

/**
 * Three Card Spread - Mind/Body/Spirit
 */
export const MIND_BODY_SPIRIT_SPREAD: TarotSpread = {
  name: 'Mind, Body, Spirit',
  description: 'Holistic view of your current state across three dimensions',
  cardCount: 3,
  positions: [
    {
      name: 'Mind',
      description: 'Your mental state, thoughts, and intellectual concerns',
      index: 0
    },
    {
      name: 'Body',
      description: 'Physical health, material matters, and practical concerns',
      index: 1
    },
    {
      name: 'Spirit',
      description: 'Soul guidance, spiritual lessons, and higher purpose',
      index: 2
    }
  ],
  purpose: 'Self-reflection, wellness check-in',
  difficulty: 'beginner'
};

/**
 * Five Card Cross - Elemental Spread
 */
export const ELEMENTAL_CROSS_SPREAD: TarotSpread = {
  name: 'Elemental Cross',
  description: 'Balance reading using the five elements',
  cardCount: 5,
  positions: [
    {
      name: 'Fire - Passion',
      description: 'Your will, drive, and creative energy',
      index: 0,
      element: 'fire'
    },
    {
      name: 'Water - Emotion',
      description: 'Your emotional landscape and intuition',
      index: 1,
      element: 'water'
    },
    {
      name: 'Air - Mind',
      description: 'Your thoughts, communication, and mental clarity',
      index: 2,
      element: 'air'
    },
    {
      name: 'Earth - Foundation',
      description: 'Your stability, resources, and practical matters',
      index: 3,
      element: 'earth'
    },
    {
      name: 'Aether - Spirit',
      description: 'Your soul guidance and spiritual integration',
      index: 4,
      element: 'aether'
    }
  ],
  purpose: 'Elemental balance, comprehensive life review',
  difficulty: 'intermediate'
};

/**
 * Relationship Spread - Five Cards
 */
export const RELATIONSHIP_SPREAD: TarotSpread = {
  name: 'Relationship',
  description: 'Explore the dynamics between you and another',
  cardCount: 5,
  positions: [
    {
      name: 'You',
      description: 'Your energy and approach in the relationship',
      index: 0
    },
    {
      name: 'The Other',
      description: 'Their energy and approach in the relationship',
      index: 1
    },
    {
      name: 'The Connection',
      description: 'The nature of your bond and what unites you',
      index: 2
    },
    {
      name: 'Challenge',
      description: 'Obstacles or tensions to navigate',
      index: 3
    },
    {
      name: 'Potential',
      description: 'Where this relationship can grow',
      index: 4
    }
  ],
  purpose: 'Romantic relationships, friendships, partnerships',
  difficulty: 'intermediate'
};

/**
 * Shadow Work Spread - Six Cards
 */
export const SHADOW_WORK_SPREAD: TarotSpread = {
  name: 'Shadow Work',
  description: 'Explore unconscious patterns and hidden aspects of self',
  cardCount: 6,
  positions: [
    {
      name: 'The Mask',
      description: 'What you show to the world',
      index: 0
    },
    {
      name: 'The Shadow',
      description: 'What you hide from yourself and others',
      index: 1
    },
    {
      name: 'The Root',
      description: 'Origin of this shadow pattern',
      index: 2
    },
    {
      name: 'The Gift',
      description: 'Strength hidden within the shadow',
      index: 3
    },
    {
      name: 'The Integration',
      description: 'How to embrace and transform this energy',
      index: 4
    },
    {
      name: 'The Wholeness',
      description: 'The integrated self that emerges',
      index: 5
    }
  ],
  purpose: 'Deep psychological work, self-discovery',
  difficulty: 'advanced'
};

/**
 * Chakra Spread - Seven Cards
 */
export const CHAKRA_SPREAD: TarotSpread = {
  name: 'Chakra',
  description: 'Energy center reading from root to crown',
  cardCount: 7,
  positions: [
    {
      name: 'Root - Muladhara',
      description: 'Security, survival, grounding, physical vitality',
      index: 0,
      element: 'earth'
    },
    {
      name: 'Sacral - Svadhisthana',
      description: 'Creativity, pleasure, emotions, relationships',
      index: 1,
      element: 'water'
    },
    {
      name: 'Solar Plexus - Manipura',
      description: 'Personal power, will, self-esteem, confidence',
      index: 2,
      element: 'fire'
    },
    {
      name: 'Heart - Anahata',
      description: 'Love, compassion, connection, healing',
      index: 3,
      element: 'air'
    },
    {
      name: 'Throat - Vishuddha',
      description: 'Communication, expression, truth, authenticity',
      index: 4,
      element: 'aether'
    },
    {
      name: 'Third Eye - Ajna',
      description: 'Intuition, insight, vision, perception',
      index: 5,
      element: 'aether'
    },
    {
      name: 'Crown - Sahasrara',
      description: 'Spiritual connection, enlightenment, unity',
      index: 6,
      element: 'aether'
    }
  ],
  purpose: 'Energy healing, chakra balancing, spiritual health',
  difficulty: 'intermediate'
};

/**
 * Celtic Cross - Ten Cards
 */
export const CELTIC_CROSS_SPREAD: TarotSpread = {
  name: 'Celtic Cross',
  description: 'The classic comprehensive spread for deep inquiry',
  cardCount: 10,
  positions: [
    {
      name: 'Present',
      description: 'Your current situation and central issue',
      index: 0
    },
    {
      name: 'Challenge',
      description: 'What crosses you - the immediate challenge',
      index: 1
    },
    {
      name: 'Foundation',
      description: 'The basis of the situation, underlying influences',
      index: 2
    },
    {
      name: 'Recent Past',
      description: 'Events or influences just passed',
      index: 3
    },
    {
      name: 'Crown',
      description: 'Best possible outcome, conscious goals',
      index: 4
    },
    {
      name: 'Near Future',
      description: 'What is coming into being',
      index: 5
    },
    {
      name: 'Self',
      description: 'Your attitude and approach to the situation',
      index: 6
    },
    {
      name: 'Environment',
      description: 'External influences, how others see you',
      index: 7
    },
    {
      name: 'Hopes & Fears',
      description: 'Your hopes and fears about the outcome',
      index: 8
    },
    {
      name: 'Outcome',
      description: 'The likely outcome based on current trajectory',
      index: 9
    }
  ],
  purpose: 'Deep inquiry, complex situations, comprehensive guidance',
  difficulty: 'advanced'
};

/**
 * Year Ahead Spread - Thirteen Cards
 */
export const YEAR_AHEAD_SPREAD: TarotSpread = {
  name: 'Year Ahead',
  description: 'One card for each month plus an overall theme',
  cardCount: 13,
  positions: [
    {
      name: 'Theme of the Year',
      description: 'The overarching energy guiding this year',
      index: 0
    },
    {
      name: 'Month 1',
      description: 'First month energy and focus',
      index: 1
    },
    {
      name: 'Month 2',
      description: 'Second month energy and focus',
      index: 2
    },
    {
      name: 'Month 3',
      description: 'Third month energy and focus',
      index: 3
    },
    {
      name: 'Month 4',
      description: 'Fourth month energy and focus',
      index: 4
    },
    {
      name: 'Month 5',
      description: 'Fifth month energy and focus',
      index: 5
    },
    {
      name: 'Month 6',
      description: 'Sixth month energy and focus',
      index: 6
    },
    {
      name: 'Month 7',
      description: 'Seventh month energy and focus',
      index: 7
    },
    {
      name: 'Month 8',
      description: 'Eighth month energy and focus',
      index: 8
    },
    {
      name: 'Month 9',
      description: 'Ninth month energy and focus',
      index: 9
    },
    {
      name: 'Month 10',
      description: 'Tenth month energy and focus',
      index: 10
    },
    {
      name: 'Month 11',
      description: 'Eleventh month energy and focus',
      index: 11
    },
    {
      name: 'Month 12',
      description: 'Twelfth month energy and focus',
      index: 12
    }
  ],
  purpose: 'Annual planning, birthday readings, new year guidance',
  difficulty: 'advanced'
};

/**
 * Decision Spread - Five Cards
 */
export const DECISION_SPREAD: TarotSpread = {
  name: 'Decision',
  description: 'Clarity for choosing between two paths',
  cardCount: 5,
  positions: [
    {
      name: 'The Situation',
      description: 'The heart of the decision you face',
      index: 0
    },
    {
      name: 'Path A',
      description: 'Energy and outcome of the first choice',
      index: 1
    },
    {
      name: 'Path B',
      description: 'Energy and outcome of the second choice',
      index: 2
    },
    {
      name: 'Hidden Factor',
      description: 'Something you may not be considering',
      index: 3
    },
    {
      name: 'Soul Guidance',
      description: 'What your higher self advises',
      index: 4
    }
  ],
  purpose: 'Major decisions, crossroads, weighing options',
  difficulty: 'intermediate'
};

/**
 * Career Spread - Six Cards
 */
export const CAREER_SPREAD: TarotSpread = {
  name: 'Career Path',
  description: 'Guidance for professional development and work life',
  cardCount: 6,
  positions: [
    {
      name: 'Current Position',
      description: 'Where you are in your career now',
      index: 0
    },
    {
      name: 'Skills & Strengths',
      description: 'What you bring to your professional life',
      index: 1
    },
    {
      name: 'Challenges',
      description: 'Obstacles to navigate in your career',
      index: 2
    },
    {
      name: 'Opportunity',
      description: 'An opening or possibility to pursue',
      index: 3
    },
    {
      name: 'Action to Take',
      description: 'Practical steps to move forward',
      index: 4
    },
    {
      name: 'Potential Outcome',
      description: 'Where this path could lead',
      index: 5
    }
  ],
  purpose: 'Career planning, job decisions, professional growth',
  difficulty: 'intermediate'
};

/**
 * Spiralogic Spread — Five-card transformation reading
 * Maps the Spiralogic elemental cycle as phases of inner movement.
 * Distinct from Elemental Cross: positions describe the transformation
 * process, not life domains. Earth → Water → Fire → Air → Aether
 * mirrors dissolution → activation → integration in spiral form.
 */
export const SPIRALOGIC_SPREAD: TarotSpread = {
  name: 'Spiralogic',
  description: 'A five-element reading through the spiral of transformation',
  cardCount: 5,
  positions: [
    {
      name: 'Earth — What is grounding you',
      description: 'What wants embodiment right now. What is becoming real, stable, and present in your life.',
      index: 0,
      element: 'earth'
    },
    {
      name: 'Water — What is moving through you',
      description: 'What is dissolving, feeling its way forward, or seeking release. The psychic undertow beneath the surface.',
      index: 1,
      element: 'water'
    },
    {
      name: 'Fire — What is calling you forward',
      description: 'What wants to activate, ignite, or be chosen. The will beginning to organize itself.',
      index: 2,
      element: 'fire'
    },
    {
      name: 'Air — What you are beginning to see',
      description: 'The perspective that is clarifying. The witness. What the mind is finally able to perceive.',
      index: 3,
      element: 'air'
    },
    {
      name: 'Aether — Where the spiral is taking you',
      description: 'The integration this cycle is moving toward. What is completing and what is beginning again at a deeper octave.',
      index: 4,
      element: 'aether'
    }
  ],
  purpose: 'Transformation process, inner cycle mapping, Spiralogic orientation',
  difficulty: 'intermediate'
};

/**
 * All available spreads
 */
export const SPREADS: Record<string, TarotSpread> = {
  'single': SINGLE_CARD_SPREAD,
  'spiralogic': SPIRALOGIC_SPREAD,
  'three-card': THREE_CARD_SPREAD,
  'mind-body-spirit': MIND_BODY_SPIRIT_SPREAD,
  'elemental': ELEMENTAL_CROSS_SPREAD,
  'relationship': RELATIONSHIP_SPREAD,
  'shadow-work': SHADOW_WORK_SPREAD,
  'chakra': CHAKRA_SPREAD,
  'celtic-cross': CELTIC_CROSS_SPREAD,
  'year-ahead': YEAR_AHEAD_SPREAD,
  'decision': DECISION_SPREAD,
  'career': CAREER_SPREAD
};

/**
 * Get spread by key
 */
export function getSpread(key: string): TarotSpread | undefined {
  return SPREADS[key];
}

/**
 * Get all spreads for a difficulty level
 */
export function getSpreadsByDifficulty(difficulty: 'beginner' | 'intermediate' | 'advanced'): TarotSpread[] {
  return Object.values(SPREADS).filter(spread => spread.difficulty === difficulty);
}

/**
 * Get spreads by card count
 */
export function getSpreadsByCardCount(minCards: number, maxCards?: number): TarotSpread[] {
  return Object.values(SPREADS).filter(spread => {
    if (maxCards) {
      return spread.cardCount >= minCards && spread.cardCount <= maxCards;
    }
    return spread.cardCount >= minCards;
  });
}

export default SPREADS;
