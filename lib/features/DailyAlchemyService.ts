/**
 * DAILY ALCHEMY SERVICE
 *
 * Delivers bite-sized elemental teachings throughout the day
 * Morning prompts, midday excerpts, evening integration questions
 * Aligned with user's current facet or rotating through elements
 */

import { loadElementChapter } from '../knowledge/ElementalAlchemyBookLoader';
import { UNIFIED_FACET_MAP, getFacetByNumber } from '../consciousness/UnifiedSpiralogicAlchemyMap';
import { Element } from '../consciousness/spiralogic-core';

export type DailyAlchemyType = 'morning' | 'midday' | 'evening';

export interface DailyAlchemyTeaching {
  type: DailyAlchemyType;
  element: Element;
  facetId?: string;
  title: string;
  content: string;
  practice?: string;
  reflection?: string;
  timestamp: string;
  dayOfYear: number;
}

/**
 * Get today's alchemy teaching
 */
export async function getDailyAlchemy(
  userId: string,
  type: DailyAlchemyType,
  options?: {
    useCurrentFacet?: boolean; // Use user's current journey facet
    forceElement?: Element; // Override element selection
  }
): Promise<DailyAlchemyTeaching> {
  const now = new Date();
  const dayOfYear = getDayOfYear(now);

  // Determine which element/facet to use
  let element: Element;
  let facetId: string | undefined;

  if (options?.forceElement) {
    element = options.forceElement;
  } else if (options?.useCurrentFacet) {
    // Get user's current facet from journey tracker
    const { currentFacetNumber } = await getUserCurrentFacet(userId);
    const facet = getFacetByNumber(currentFacetNumber);
    element = facet!.element;
    facetId = facet!.facetId;
  } else {
    // Rotate through elements based on day of year
    element = getElementForDay(dayOfYear);
  }

  // Generate teaching based on type
  switch (type) {
    case 'morning':
      return await generateMorningPrompt(element, facetId, dayOfYear);
    case 'midday':
      return await generateMiddayExcerpt(element, facetId, dayOfYear);
    case 'evening':
      return await generateEveningReflection(element, facetId, dayOfYear);
  }
}

/**
 * Morning: Elemental intention prompt
 */
async function generateMorningPrompt(
  element: Element,
  facetId: string | undefined,
  dayOfYear: number
): Promise<DailyAlchemyTeaching> {
  const prompts = MORNING_PROMPTS[element];
  const promptIndex = dayOfYear % prompts.length;
  const selectedPrompt = prompts[promptIndex];

  return {
    type: 'morning',
    element,
    facetId,
    title: `Morning ${element} Reflection`,
    content: selectedPrompt.prompt,
    practice: selectedPrompt.practice,
    reflection: selectedPrompt.question,
    timestamp: new Date().toISOString(),
    dayOfYear
  };
}

/**
 * Midday: Book excerpt
 */
async function generateMiddayExcerpt(
  element: Element,
  facetId: string | undefined,
  dayOfYear: number
): Promise<DailyAlchemyTeaching> {
  // Load chapter for element
  const elementChapter = element === 'Aether' ? 'aether' : element.toLowerCase() as any;
  const section = await loadElementChapter(elementChapter);

  if (!section) {
    return {
      type: 'midday',
      element,
      facetId,
      title: `Midday ${element} Wisdom`,
      content: `Today, reflect on the element of ${element}. What does this element reveal to you?`,
      timestamp: new Date().toISOString(),
      dayOfYear
    };
  }

  // Extract a meaningful excerpt (roughly 200-300 words)
  const lines = section.content.split('\n').filter(l => l.trim().length > 0);

  // Find a good starting point based on day
  const startLineIndex = (dayOfYear * 7) % Math.max(lines.length - 20, 1);
  const excerpt = lines.slice(startLineIndex, startLineIndex + 15).join('\n');

  return {
    type: 'midday',
    element,
    facetId,
    title: `Midday Teaching: ${section.chapterTitle}`,
    content: excerpt.substring(0, 500) + '...',
    reflection: `How does this ${element} teaching apply to your life today?`,
    timestamp: new Date().toISOString(),
    dayOfYear
  };
}

/**
 * Evening: Integration question
 */
async function generateEveningReflection(
  element: Element,
  facetId: string | undefined,
  dayOfYear: number
): Promise<DailyAlchemyTeaching> {
  const reflections = EVENING_REFLECTIONS[element];
  const reflectionIndex = dayOfYear % reflections.length;
  const selectedReflection = reflections[reflectionIndex];

  return {
    type: 'evening',
    element,
    facetId,
    title: `Evening ${element} Integration`,
    content: selectedReflection.prompt,
    reflection: selectedReflection.question,
    practice: selectedReflection.practice,
    timestamp: new Date().toISOString(),
    dayOfYear
  };
}

/**
 * Get all three teachings for today
 */
export async function getTodaysAlchemy(
  userId: string,
  options?: {
    useCurrentFacet?: boolean;
  }
): Promise<{
  morning: DailyAlchemyTeaching;
  midday: DailyAlchemyTeaching;
  evening: DailyAlchemyTeaching;
}> {
  const [morning, midday, evening] = await Promise.all([
    getDailyAlchemy(userId, 'morning', options),
    getDailyAlchemy(userId, 'midday', options),
    getDailyAlchemy(userId, 'evening', options)
  ]);

  return { morning, midday, evening };
}

/**
 * Helper: Get element for day (cycles through all 5)
 */
function getElementForDay(dayOfYear: number): Element {
  const elements: Element[] = ['Fire', 'Water', 'Earth', 'Air', 'Aether'];
  return elements[dayOfYear % 5];
}

/**
 * Helper: Get day of year (1-365)
 */
function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

/**
 * Helper: Get user's current facet (from journey tracker)
 */
async function getUserCurrentFacet(userId: string): Promise<{ currentFacetNumber: number }> {
  // TODO: Integrate with ElementalJourneyTracker
  // For now, return Fire-1 as default
  return { currentFacetNumber: 1 };
}

/**
 * MORNING PROMPTS by Element
 */
const MORNING_PROMPTS: Record<Element, Array<{ prompt: string; practice: string; question: string }>> = {
  Fire: [
    {
      prompt: 'As you awaken, feel the spark of new possibility igniting within you. Today carries the potential for creative transformation.',
      practice: 'Light a candle and set an intention for what wants to be created through you today.',
      question: 'What vision is calling to me this morning?'
    },
    {
      prompt: 'Fire is the element of purification. What no longer serves you that you can release today?',
      practice: 'Write down one thing to let go of, then burn the paper (safely) or tear it up.',
      question: 'What am I ready to release to make space for new inspiration?'
    },
    {
      prompt: 'Your creative fire is sacred. How can you honor it today without burning yourself out?',
      practice: 'Check in with your energy levels. Plan one creative act and one rest period.',
      question: 'How can I create sustainably today?'
    },
    {
      prompt: 'The morning sun rises with consistent radiance. How can you shine your light without forcing?',
      practice: 'Spend 5 minutes in sunlight (or visualize it), absorbing its steady warmth.',
      question: 'Where can I let my natural light shine today?'
    },
    {
      prompt: 'Fire transforms. What is being transformed in you right now?',
      practice: 'Journal about one area of your life that feels like it\'s in the fire.',
      question: 'What is this transformation teaching me?'
    }
  ],

  Water: [
    {
      prompt: 'Like water, you have the capacity to flow around obstacles. What needs your flexibility today?',
      practice: 'Drink a glass of water mindfully, feeling it flow into and through you.',
      question: 'Where am I rigid that I could practice flow?'
    },
    {
      prompt: 'Emotions are the water of consciousness. What feelings are present this morning?',
      practice: 'Name three emotions you\'re experiencing. Don\'t judge them, just notice.',
      question: 'What are my emotions telling me today?'
    },
    {
      prompt: 'Water cleanses and renews. What needs to be washed away to reveal your clarity?',
      practice: 'Take a mindful shower or wash your face, visualizing emotional release.',
      question: 'What am I ready to cleanse today?'
    },
    {
      prompt: 'Deep waters hold wisdom. What is your emotional depth trying to show you?',
      practice: 'Sit quietly and feel into any emotional undercurrent present.',
      question: 'What wisdom lives beneath the surface?'
    },
    {
      prompt: 'Water seeks its own level. How can you honor your emotional truth today?',
      practice: 'Check in with yourself: "What do I really feel about ___?"',
      question: 'Where am I out of integrity with my feelings?'
    }
  ],

  Earth: [
    {
      prompt: 'You are rooted in this body, this earth, this moment. Feel your connection to ground.',
      practice: 'Stand barefoot (or imagine it). Feel the earth supporting you.',
      question: 'How am I being supported today?'
    },
    {
      prompt: 'Earth teaches patience. What are you cultivating that needs time to grow?',
      practice: 'Identify one thing you\'re tending. Trust its natural timing.',
      question: 'Where am I forcing growth instead of allowing it?'
    },
    {
      prompt: 'Your body is earth. How does it feel this morning?',
      practice: 'Do a body scan. Notice sensations without judgment.',
      question: 'What is my body telling me?'
    },
    {
      prompt: 'Manifestation requires grounding vision in practical action. What one small step can you take today?',
      practice: 'Choose one concrete action aligned with your larger vision.',
      question: 'What practical step grounds my vision today?'
    },
    {
      prompt: 'Earth is abundance. What are you grateful for in this moment?',
      practice: 'List five things you have right now (body, breath, shelter, etc.)',
      question: 'How can I live from abundance rather than scarcity today?'
    }
  ],

  Air: [
    {
      prompt: 'Clear your mental space like the morning air. What thoughts need to be released?',
      practice: 'Take 5 conscious breaths. With each exhale, release one thought.',
      question: 'What mental clutter can I release today?'
    },
    {
      prompt: 'Fresh perspective is available in this new day. What can you see differently?',
      practice: 'Look at a familiar situation from a completely new angle.',
      question: 'What becomes possible with fresh eyes?'
    },
    {
      prompt: 'Communication is air made conscious. What needs to be spoken today?',
      practice: 'Identify one truth that wants to be communicated.',
      question: 'What truth am I holding back?'
    },
    {
      prompt: 'Your breath connects you to all of life. Feel that connection.',
      practice: '10 conscious breaths, feeling your connection to the air around you.',
      question: 'How am I connected to the whole?'
    },
    {
      prompt: 'Mental clarity is like a clear sky. What clouds your thinking?',
      practice: 'Notice what creates mental fog for you today.',
      question: 'What brings me clarity?'
    }
  ],

  Aether: [
    {
      prompt: 'You are the space in which all elements arise. Rest in that awareness.',
      practice: 'Sit in stillness. Notice you are the awareness holding all experience.',
      question: 'What am I before thought, feeling, sensation?'
    },
    {
      prompt: 'Integration is the work of aether. How are all parts of you working together today?',
      practice: 'Notice fire, water, earth, and air within you. Feel them as one.',
      question: 'Where am I fragmented? Where am I whole?'
    },
    {
      prompt: 'Sacred presence is always available. Can you feel it now?',
      practice: 'Pause. Drop into this moment. Feel the sacred ordinary.',
      question: 'What is sacred about this ordinary moment?'
    },
    {
      prompt: 'You are both the wave and the ocean. The part and the whole.',
      practice: 'Feel your unique expression AND your connection to all.',
      question: 'How am I both separate and connected?'
    },
    {
      prompt: 'Transcendence isn\'t somewhere else. It\'s here, in this breath, this moment.',
      practice: 'Be exactly where you are with full presence.',
      question: 'What happens when I stop seeking and start being?'
    }
  ]
};

/**
 * EVENING REFLECTIONS by Element
 */
const EVENING_REFLECTIONS: Record<Element, Array<{ prompt: string; question: string; practice: string }>> = {
  Fire: [
    {
      prompt: 'As the day draws to a close, reflect on the creative fire that moved through you.',
      question: 'What was created through me today?',
      practice: 'Acknowledge one thing you brought into being, however small.'
    },
    {
      prompt: 'Did you honor your creative fire without burning yourself out?',
      question: 'Where did I give too much? Where did I hold back appropriately?',
      practice: 'Adjust tomorrow based on today\'s energy patterns.'
    },
    {
      prompt: 'What visions arose today? Which ones are truly yours?',
      question: 'Which ideas came from my authentic creative source?',
      practice: 'Write down one true vision to tend.'
    }
  ],

  Water: [
    {
      prompt: 'The day\'s emotional waters have flowed. What do they reveal?',
      question: 'What did my emotions teach me today?',
      practice: 'Journal about one emotional experience from today.'
    },
    {
      prompt: 'Did you allow feelings to flow, or did you dam them up?',
      question: 'Where did I allow flow? Where did I resist?',
      practice: 'Release any held emotions through breath, tears, or movement.'
    },
    {
      prompt: 'Healing happens in presence. What healed today?',
      question: 'Where did I experience emotional healing or release?',
      practice: 'Acknowledge your emotional courage today.'
    }
  ],

  Earth: [
    {
      prompt: 'What did you ground in practical reality today?',
      question: 'What concrete steps did I take toward manifestation?',
      practice: 'Celebrate one practical accomplishment.'
    },
    {
      prompt: 'Did you honor your body\'s needs today?',
      question: 'How well did I listen to my body?',
      practice: 'Stretch, move, or rest as your body requests.'
    },
    {
      prompt: 'Earth teaches presence. How present were you today?',
      question: 'When was I most embodied and present?',
      practice: 'Return to your body now. Feel your feet on the ground.'
    }
  ],

  Air: [
    {
      prompt: 'What new perspectives emerged today?',
      question: 'What did I see differently than before?',
      practice: 'Write down one insight or realization.'
    },
    {
      prompt: 'Did your communications create connection or separation?',
      question: 'Where did I communicate clearly? Where was I unclear?',
      practice: 'Note one way to communicate more clearly tomorrow.'
    },
    {
      prompt: 'Mental clarity comes from stillness. How still was your mind today?',
      question: 'When was my mind clearest?',
      practice: 'Take 5 breaths to clear mental clutter before sleep.'
    }
  ],

  Aether: [
    {
      prompt: 'You are the witness of your day. What did you observe?',
      question: 'What did I notice from witnessing awareness?',
      practice: 'Review the day as if watching a film. No judgment.'
    },
    {
      prompt: 'How integrated were you today? How fragmented?',
      question: 'Where did all parts of me work together?',
      practice: 'Feel into wholeness before sleep.'
    },
    {
      prompt: 'Sacred presence was available all day. Where did you find it?',
      question: 'What moments felt sacred or holy?',
      practice: 'Rest in gratitude for those moments.'
    }
  ]
};

/**
 * Get week's alchemy plan (7 days)
 */
export async function getWeeklyAlchemyPlan(
  userId: string,
  options?: { useCurrentFacet?: boolean }
): Promise<Array<{
  date: string;
  element: Element;
  morning: string;
  midday: string;
  evening: string;
}>> {
  const plan: any /* TODO: specify type */[] = [];
  const today = new Date();

  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);

    const dayOfYear = getDayOfYear(date);
    const element = getElementForDay(dayOfYear);

    // Get brief summaries
    const morningPrompts = MORNING_PROMPTS[element];
    const eveningReflections = EVENING_REFLECTIONS[element];

    plan.push({
      date: date.toISOString().split('T')[0],
      element,
      morning: morningPrompts[dayOfYear % morningPrompts.length].prompt.substring(0, 100) + '...',
      midday: `Teaching from ${element} chapter`,
      evening: eveningReflections[dayOfYear % eveningReflections.length].prompt.substring(0, 100) + '...'
    });
  }

  return plan;
}
