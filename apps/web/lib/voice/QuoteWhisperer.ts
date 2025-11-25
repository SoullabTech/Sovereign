/**
 * 🎭 Quote Whisperer
 *
 * Delivers perfectly-timed quotes that land like soul touches
 * Uses memory to know when user welcomes wisdom whispers
 *
 * Design: Quotes should feel like gifts, not interruptions
 */

import type { Archetype } from './conversation/AffectDetector';
import type { AINMemoryPayload } from '@/lib/memory/AINMemoryPayload';

export interface Quote {
  text: string;
  author: string;
  archetype: Archetype;
  theme: string;           // "slowness", "mystery", "depth", "vision"
  emotionalTone: string;   // "contemplative", "catalytic", "tender"
}

/**
 * Elemental Quote Library
 * Curated wisdom that resonates with each archetype
 */
export const ELEMENTAL_QUOTES: Record<Archetype, Quote[]> = {
  Fire: [
    {
      text: "The cave you fear to enter holds the treasure you seek.",
      author: "Joseph Campbell",
      archetype: "Fire",
      theme: "courage",
      emotionalTone: "catalytic"
    },
    {
      text: "What you seek is seeking you.",
      author: "Rumi",
      archetype: "Fire",
      theme: "calling",
      emotionalTone: "catalytic"
    },
    {
      text: "The wound is the place where the Light enters you.",
      author: "Rumi",
      archetype: "Fire",
      theme: "transformation",
      emotionalTone: "tender"
    }
  ],

  Water: [
    {
      text: "The cure for the pain is in the pain.",
      author: "Rumi",
      archetype: "Water",
      theme: "depth",
      emotionalTone: "contemplative"
    },
    {
      text: "You have to go down before you can come up.",
      author: "Clarissa Pinkola Estés",
      archetype: "Water",
      theme: "descent",
      emotionalTone: "tender"
    },
    {
      text: "What is to give light must endure burning.",
      author: "Viktor Frankl",
      archetype: "Water",
      theme: "transformation",
      emotionalTone: "contemplative"
    }
  ],

  Earth: [
    {
      text: "How we spend our days is, of course, how we spend our lives.",
      author: "Annie Dillard",
      archetype: "Earth",
      theme: "practice",
      emotionalTone: "grounded"
    },
    {
      text: "The only way out is through.",
      author: "Robert Frost",
      archetype: "Earth",
      theme: "perseverance",
      emotionalTone: "grounded"
    },
    {
      text: "One thing at a time, all things in succession. That which grows fast withers as rapidly; that which grows slowly endures.",
      author: "Josiah Gilbert Holland",
      archetype: "Earth",
      theme: "patience",
      emotionalTone: "grounded"
    }
  ],

  Air: [
    {
      text: "We don't see things as they are, we see them as we are.",
      author: "Anaïs Nin",
      archetype: "Air",
      theme: "perspective",
      emotionalTone: "illuminating"
    },
    {
      text: "The eye sees only what the mind is prepared to comprehend.",
      author: "Robertson Davies",
      archetype: "Air",
      theme: "awareness",
      emotionalTone: "illuminating"
    },
    {
      text: "Between stimulus and response there is a space. In that space is our power to choose our response.",
      author: "Viktor Frankl",
      archetype: "Air",
      theme: "freedom",
      emotionalTone: "illuminating"
    }
  ],

  Aether: [
    {
      text: "When you slow things down, you notice more. And when you notice more, it becomes more beautiful.",
      author: "David Lynch",
      archetype: "Aether",
      theme: "slowness",
      emotionalTone: "contemplative"
    },
    {
      text: "Be patient toward all that is unsolved in your heart and try to love the questions themselves.",
      author: "Rainer Maria Rilke",
      archetype: "Aether",
      theme: "mystery",
      emotionalTone: "contemplative"
    },
    {
      text: "The quieter you become, the more you can hear.",
      author: "Ram Dass",
      archetype: "Aether",
      theme: "silence",
      emotionalTone: "contemplative"
    },
    {
      text: "Not all those who wander are lost.",
      author: "J.R.R. Tolkien",
      archetype: "Aether",
      theme: "mystery",
      emotionalTone: "contemplative"
    }
  ]
};

/**
 * Should a quote be whispered right now?
 * Based on memory, archetype, and conversation context
 */
export function shouldWhisperQuote(
  memory: AINMemoryPayload,
  archetype: Archetype,
  conversationDepth: number
): boolean {
  // Check if user appreciates quotes
  if (!memory.preferences.quoteAppreciation) return false;

  // Check if we've shared too many quotes recently
  const recentQuotes = memory.quotesShared.filter(q => {
    const hoursSince = (Date.now() - q.timestamp.getTime()) / (1000 * 60 * 60);
    return hoursSince < 24;
  });

  if (recentQuotes.length >= 3) return false; // Max 3 quotes per day

  // Only whisper in deeper conversations (depth > 5)
  if (conversationDepth < 5) return false;

  // Random chance (30% when conditions are met)
  return Math.random() < 0.3;
}

/**
 * Select perfect quote for current context
 */
export function selectQuote(
  archetype: Archetype,
  memory: AINMemoryPayload,
  userInput?: string
): Quote | null {
  const quotes = ELEMENTAL_QUOTES[archetype];

  // Filter out recently shared quotes
  const recentQuoteTexts = memory.quotesShared.map(q => q.quote);
  const availableQuotes = quotes.filter(q => !recentQuoteTexts.includes(q.text));

  if (availableQuotes.length === 0) return null;

  // If user input provided, try to match theme
  if (userInput) {
    const userLower = userInput.toLowerCase();

    // Theme matching
    const themeMatch = availableQuotes.find(q => {
      if (q.theme === 'slowness' && /slow|pause|rest|time/.test(userLower)) return true;
      if (q.theme === 'depth' && /deep|feel|pain|hurt/.test(userLower)) return true;
      if (q.theme === 'mystery' && /don't know|uncertain|lost|wonder/.test(userLower)) return true;
      if (q.theme === 'courage' && /fear|scared|afraid|risk/.test(userLower)) return true;
      return false;
    });

    if (themeMatch) return themeMatch;
  }

  // Random selection from available
  return availableQuotes[Math.floor(Math.random() * availableQuotes.length)];
}

/**
 * Format quote for delivery
 * Returns formatted string ready to append to response
 */
export function formatQuote(quote: Quote, style: 'subtle' | 'poetic' | 'direct' = 'subtle'): string {
  switch (style) {
    case 'subtle':
      // Just the quote, whispered
      return `\n\n"${quote.text}"\n— ${quote.author}`;

    case 'poetic':
      // With pause before
      return `\n\n...\n\n"${quote.text}"\n— ${quote.author}`;

    case 'direct':
      // With soft intro
      return `\n\nThere's a line that comes to mind: "${quote.text}" — ${quote.author}`;
  }
}

/**
 * Whisper quote if conditions are right
 * Returns enriched text or original text
 */
export function whisperQuote(
  responseText: string,
  memory: AINMemoryPayload,
  archetype: Archetype,
  conversationDepth: number,
  userInput?: string
): { text: string; quoteShared: Quote | null } {
  // Check if we should whisper
  if (!shouldWhisperQuote(memory, archetype, conversationDepth)) {
    return { text: responseText, quoteShared: null };
  }

  // Select quote
  const quote = selectQuote(archetype, memory, userInput);
  if (!quote) {
    return { text: responseText, quoteShared: null };
  }

  // Format and append
  const formattedQuote = formatQuote(quote, 'subtle');
  const enrichedText = responseText + formattedQuote;

  return { text: enrichedText, quoteShared: quote };
}

/**
 * Get all quotes for a specific theme
 * Useful for ritual suggestions
 */
export function getQuotesByTheme(theme: string): Quote[] {
  const allQuotes = Object.values(ELEMENTAL_QUOTES).flat();
  return allQuotes.filter(q => q.theme === theme);
}

/**
 * Get David Lynch quote specifically
 * For special moments of slowness/beauty
 */
export function getDavidLynchQuote(): Quote {
  return ELEMENTAL_QUOTES.Aether.find(q => q.author === 'David Lynch')!;
}

/**
 * Example Usage:
 *
 * const { text, quoteShared } = whisperQuote(
 *   maiaResponse,
 *   memory,
 *   'Aether',
 *   conversationDepth: 7,
 *   userInput: "Everything feels so rushed lately"
 * );
 *
 * // If conditions right, might return:
 * "I hear that. Life moves fast...
 *
 * "When you slow things down, you notice more. And when you notice more, it becomes more beautiful."
 * — David Lynch"
 */
