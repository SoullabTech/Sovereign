/**
 * WISDOM QUOTES
 *
 * A growing collection of quotes from wisdom keepers, organized by voice.
 * These can be surfaced synchronistically based on user's constellation,
 * current element, phase, or specific life situations.
 */

import type { Element, SpiralPhase } from './WisdomFacets';

export interface WisdomQuote {
  id: string;
  voice: string; // Matches facet ID
  text: string;
  source?: string;
  elements?: Element[]; // Which elements this quote speaks to
  phases?: SpiralPhase[]; // Which phases this quote resonates with
  themes?: string[]; // Contextual themes
}

export const WISDOM_QUOTES: WisdomQuote[] = [
  // Maslow
  {
    id: 'maslow-1',
    voice: 'maslow',
    text: 'What is necessary to change a person is to change his awareness of himself.',
    source: 'Toward a Psychology of Being',
    elements: ['earth', 'aether'],
    phases: ['harmony', 'integration'],
    themes: ['self-awareness', 'growth', 'transformation']
  },
  {
    id: 'maslow-2',
    voice: 'maslow',
    text: 'One can choose to go back toward safety or forward toward growth. Growth must be chosen again and again; fear must be overcome again and again.',
    source: 'Toward a Psychology of Being',
    elements: ['fire', 'earth'],
    phases: ['power', 'success'],
    themes: ['courage', 'choice', 'fear']
  },

  // Frankl
  {
    id: 'frankl-1',
    voice: 'frankl',
    text: 'Between stimulus and response there is a space. In that space is our power to choose our response. In our response lies our growth and our freedom.',
    elements: ['aether', 'air'],
    phases: ['integration', 'unity', 'harmony'],
    themes: ['freedom', 'choice', 'consciousness']
  },
  {
    id: 'frankl-2',
    voice: 'frankl',
    text: 'When we are no longer able to change a situation, we are challenged to change ourselves.',
    source: 'Man\'s Search for Meaning',
    elements: ['fire', 'aether'],
    phases: ['power', 'integration'],
    themes: ['adversity', 'transformation', 'attitude']
  },
  {
    id: 'frankl-3',
    voice: 'frankl',
    text: 'Those who have a \'why\' to live, can bear with almost any \'how\'.',
    source: 'Man\'s Search for Meaning',
    elements: ['aether', 'fire'],
    phases: ['order', 'integration'],
    themes: ['purpose', 'meaning', 'resilience']
  },

  // Jung
  {
    id: 'jung-1',
    voice: 'jung',
    text: 'Until you make the unconscious conscious, it will direct your life and you will call it fate.',
    elements: ['water', 'air'],
    phases: ['harmony', 'integration'],
    themes: ['unconscious', 'awareness', 'fate']
  },
  {
    id: 'jung-2',
    voice: 'jung',
    text: 'The meeting of two personalities is like the contact of two chemical substances: if there is any reaction, both are transformed.',
    elements: ['water', 'fire'],
    phases: ['belonging', 'integration'],
    themes: ['relationship', 'transformation', 'connection']
  },
  {
    id: 'jung-3',
    voice: 'jung',
    text: 'The privilege of a lifetime is to become who you truly are.',
    elements: ['aether', 'fire'],
    phases: ['integration', 'unity'],
    themes: ['individuation', 'authenticity', 'becoming']
  },
  {
    id: 'jung-4',
    voice: 'jung',
    text: 'One does not become enlightened by imagining figures of light, but by making the darkness conscious.',
    elements: ['water', 'aether'],
    phases: ['power', 'harmony', 'integration'],
    themes: ['shadow', 'enlightenment', 'consciousness']
  },

  // Nietzsche
  {
    id: 'nietzsche-1',
    voice: 'nietzsche',
    text: 'He who has a why to live can bear almost any how.',
    source: 'Twilight of the Idols',
    elements: ['fire', 'aether'],
    phases: ['power', 'order'],
    themes: ['purpose', 'will', 'endurance']
  },
  {
    id: 'nietzsche-2',
    voice: 'nietzsche',
    text: 'You must be ready to burn yourself in your own flame; how could you rise anew if you have not first become ashes?',
    elements: ['fire'],
    phases: ['power', 'integration'],
    themes: ['transformation', 'destruction', 'rebirth']
  },
  {
    id: 'nietzsche-3',
    voice: 'nietzsche',
    text: 'Become who you are.',
    source: 'Thus Spoke Zarathustra',
    elements: ['fire', 'aether'],
    phases: ['power', 'success', 'integration'],
    themes: ['authenticity', 'becoming', 'will']
  },

  // Hesse
  {
    id: 'hesse-1',
    voice: 'hesse',
    text: 'I have been and still am a seeker, but I have ceased to question stars and books; I have begun to listen to the teaching my blood whispers to me.',
    source: 'Demian',
    elements: ['water', 'earth'],
    phases: ['integration', 'unity'],
    themes: ['inner knowing', 'embodiment', 'seeking']
  },
  {
    id: 'hesse-2',
    voice: 'hesse',
    text: 'Some of us think holding on makes us strong, but sometimes it is letting go.',
    elements: ['water', 'air'],
    phases: ['harmony', 'integration'],
    themes: ['release', 'strength', 'surrender']
  },
  {
    id: 'hesse-3',
    voice: 'hesse',
    text: 'Within you there is a stillness and a sanctuary to which you can retreat at any time and be yourself.',
    source: 'Siddhartha',
    elements: ['aether', 'water'],
    phases: ['harmony', 'unity'],
    themes: ['solitude', 'peace', 'self']
  },

  // Tolstoy
  {
    id: 'tolstoy-1',
    voice: 'tolstoy',
    text: 'Everyone thinks of changing the world, but no one thinks of changing himself.',
    elements: ['earth', 'fire'],
    phases: ['order', 'harmony', 'integration'],
    themes: ['change', 'responsibility', 'action']
  },
  {
    id: 'tolstoy-2',
    voice: 'tolstoy',
    text: 'The two most powerful warriors are patience and time.',
    source: 'War and Peace',
    elements: ['earth', 'water'],
    phases: ['order', 'harmony'],
    themes: ['patience', 'time', 'wisdom']
  },
  {
    id: 'tolstoy-3',
    voice: 'tolstoy',
    text: 'True life is lived when tiny changes occur.',
    elements: ['earth'],
    phases: ['order', 'integration'],
    themes: ['simplicity', 'change', 'practice']
  },

  // Brené Brown
  {
    id: 'brown-1',
    voice: 'brown',
    text: 'Vulnerability is not winning or losing; it\'s having the courage to show up and be seen when we have no control over the outcome.',
    source: 'Daring Greatly',
    elements: ['water', 'fire'],
    phases: ['belonging', 'harmony'],
    themes: ['vulnerability', 'courage', 'authenticity']
  },
  {
    id: 'brown-2',
    voice: 'brown',
    text: 'Owning our story and loving ourselves through that process is the bravest thing that we\'ll ever do.',
    source: 'The Gifts of Imperfection',
    elements: ['water', 'earth'],
    phases: ['belonging', 'harmony', 'integration'],
    themes: ['self-love', 'story', 'courage']
  },
  {
    id: 'brown-3',
    voice: 'brown',
    text: 'You are imperfect, you are wired for struggle, but you are worthy of love and belonging.',
    source: 'The Gifts of Imperfection',
    elements: ['water', 'earth'],
    phases: ['belonging', 'harmony'],
    themes: ['worthiness', 'imperfection', 'belonging']
  },

  // Buddhist / Mindfulness
  {
    id: 'buddhist-1',
    voice: 'buddhist',
    text: 'The root of suffering is attachment.',
    elements: ['air', 'water'],
    phases: ['harmony', 'integration', 'unity'],
    themes: ['attachment', 'suffering', 'release']
  },
  {
    id: 'buddhist-2',
    voice: 'buddhist',
    text: 'Peace comes from within. Do not seek it without.',
    elements: ['aether', 'water'],
    phases: ['harmony', 'unity'],
    themes: ['peace', 'inner work', 'seeking']
  },
  {
    id: 'buddhist-3',
    voice: 'buddhist',
    text: 'The present moment is the only time over which we have dominion.',
    source: 'Thich Nhat Hanh',
    elements: ['air', 'earth'],
    phases: ['harmony', 'integration'],
    themes: ['presence', 'now', 'mindfulness']
  },

  // Somatic
  {
    id: 'somatic-1',
    voice: 'somatic',
    text: 'The body keeps the score.',
    source: 'Bessel van der Kolk',
    elements: ['earth', 'water'],
    phases: ['survival', 'belonging', 'integration'],
    themes: ['trauma', 'body', 'memory']
  },
  {
    id: 'somatic-2',
    voice: 'somatic',
    text: 'Trauma is not what happens to you. Trauma is what happens inside you as a result of what happened to you.',
    source: 'Gabor Maté',
    elements: ['earth', 'water'],
    phases: ['survival', 'belonging', 'harmony'],
    themes: ['trauma', 'healing', 'inner experience']
  },

  // Integral
  {
    id: 'integral-1',
    voice: 'integral',
    text: 'Everyone is right. More specifically, everyone—including me—has some important pieces of truth, and all of those pieces need to be honored, cherished, and included in a more gracious, spacious, and compassionate embrace.',
    source: 'Ken Wilber',
    elements: ['air', 'aether'],
    phases: ['integration', 'unity'],
    themes: ['perspectives', 'inclusion', 'truth']
  },
  {
    id: 'integral-2',
    voice: 'integral',
    text: 'The more perspectives you can take, the more you can see. The more you can see, the more you can include. The more you can include, the more you can care for.',
    source: 'Ken Wilber',
    elements: ['air', 'aether'],
    phases: ['integration', 'unity'],
    themes: ['perspective', 'care', 'wholeness']
  }
];

/**
 * Get a random quote from a specific voice
 */
export function getQuoteByVoice(voiceId: string): WisdomQuote | null {
  const quotes = WISDOM_QUOTES.filter(q => q.voice === voiceId);
  if (quotes.length === 0) return null;
  return quotes[Math.floor(Math.random() * quotes.length)];
}

/**
 * Get quotes relevant to current element
 */
export function getQuotesByElement(element: Element, limit: number = 3): WisdomQuote[] {
  const quotes = WISDOM_QUOTES.filter(q =>
    q.elements?.includes(element)
  );
  return shuffleArray(quotes).slice(0, limit);
}

/**
 * Get quotes relevant to current phase
 */
export function getQuotesByPhase(phase: SpiralPhase, limit: number = 3): WisdomQuote[] {
  const quotes = WISDOM_QUOTES.filter(q =>
    q.phases?.includes(phase)
  );
  return shuffleArray(quotes).slice(0, limit);
}

/**
 * Get quotes from user's selected voices
 */
export function getQuotesFromConstellation(voiceIds: string[], limit: number = 3): WisdomQuote[] {
  const quotes = WISDOM_QUOTES.filter(q => voiceIds.includes(q.voice));
  return shuffleArray(quotes).slice(0, limit);
}

/**
 * Get a contextual quote based on multiple factors
 */
export function getContextualQuote(context: {
  voiceIds?: string[];
  element?: Element;
  phase?: SpiralPhase;
  themes?: string[];
}): WisdomQuote | null {
  let relevantQuotes = [...WISDOM_QUOTES];

  // Filter by voices if provided
  if (context.voiceIds && context.voiceIds.length > 0) {
    relevantQuotes = relevantQuotes.filter(q => context.voiceIds!.includes(q.voice));
  }

  // Boost quotes that match element
  if (context.element) {
    const elementMatches = relevantQuotes.filter(q => q.elements?.includes(context.element!));
    if (elementMatches.length > 0) {
      relevantQuotes = elementMatches;
    }
  }

  // Boost quotes that match phase
  if (context.phase) {
    const phaseMatches = relevantQuotes.filter(q => q.phases?.includes(context.phase!));
    if (phaseMatches.length > 0) {
      relevantQuotes = phaseMatches;
    }
  }

  // Boost quotes that match themes
  if (context.themes && context.themes.length > 0) {
    const themeMatches = relevantQuotes.filter(q =>
      q.themes?.some(theme => context.themes!.includes(theme))
    );
    if (themeMatches.length > 0) {
      relevantQuotes = themeMatches;
    }
  }

  if (relevantQuotes.length === 0) return null;

  // Return random from relevant quotes
  return relevantQuotes[Math.floor(Math.random() * relevantQuotes.length)];
}

/**
 * Shuffle array helper
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}