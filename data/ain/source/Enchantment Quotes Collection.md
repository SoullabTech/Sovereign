/**
 * Enchantment Quotes Collection
 * 
 * Curated quotes for correcting misenchantment and fostering authentic wonder.
 * Organized by themes that support re-enchantment: imagination, perception, 
 * mystery, consciousness, and sacred connection.
 */

export interface EnchantmentQuote {
  text: string;
  author: string;
  category: 'imagination' | 'perception' | 'reality' | 'mystery' | 'wholeness' | 
           'individuation' | 'unity' | 'energy' | 'shadow' | 'courage' | 
           'purpose' | 'flow' | 'love' | 'healing' | 'spirit' | 'connection' | 
           'intuition' | 'inner_power' | 'consciousness' | 'harmony' | 
           'wisdom' | 'choice' | 'relationship' | 'existence';
  source?: string;
  era?: string;
}

export const ENCHANTMENT_QUOTES: EnchantmentQuote[] = [
  // Core Blake quote that inspired this system
  {
    text: "But to the eyes of the man of imagination, nature is imagination itself.",
    author: "William Blake",
    category: "imagination",
    era: "Romantic"
  },
  
  // Imagination & Creativity
  {
    text: "The world is but a canvas to our imagination.",
    author: "Henry David Thoreau",
    category: "imagination",
    era: "Transcendentalist"
  },
  {
    text: "Everything you can imagine is real.",
    author: "Pablo Picasso",
    category: "imagination",
    era: "Modern"
  },
  {
    text: "Imagination is more important than knowledge. For knowledge is limited, whereas imagination embraces the entire world.",
    author: "Albert Einstein",
    category: "imagination",
    era: "Modern"
  },

  // Perception & Seeing
  {
    text: "The world is full of magic things, patiently waiting for our senses to grow sharper.",
    author: "W.B. Yeats",
    category: "perception",
    era: "Modern"
  },
  {
    text: "The real voyage of discovery consists not in seeking new landscapes, but in having new eyes.",
    author: "Marcel Proust",
    category: "perception",
    era: "Modern"
  },

  // Mystery & Wonder
  {
    text: "The most beautiful thing we can experience is the mysterious. It is the source of all true art and science.",
    author: "Albert Einstein",
    category: "mystery",
    era: "Modern"
  },
  {
    text: "The universe is not only stranger than we imagine, it is stranger than we can imagine.",
    author: "J.B.S. Haldane",
    category: "mystery",
    era: "Modern"
  },
  {
    text: "The mystical is not how the world is, but that it is.",
    author: "Ludwig Wittgenstein",
    category: "existence",
    era: "Modern"
  },

  // Consciousness & Being
  {
    text: "We are the universe becoming conscious of itself.",
    author: "Carl Sagan",
    category: "consciousness",
    era: "Contemporary"
  },
  {
    text: "We are not human beings having a spiritual experience. We are spiritual beings having a human experience.",
    author: "Pierre Teilhard de Chardin",
    category: "spirit",
    era: "Modern"
  },

  // Integration & Wholeness
  {
    text: "The privilege of a lifetime is to become who you truly are.",
    author: "Carl Jung",
    category: "individuation",
    era: "Modern"
  },
  {
    text: "Everything that irritates us about others can lead us to an understanding of ourselves.",
    author: "Carl Jung",
    category: "shadow",
    era: "Modern"
  },
  {
    text: "The wound is the place where the Light enters you.",
    author: "Rumi",
    category: "healing",
    era: "Classical"
  },

  // Add more as needed...
];

export function getQuotesByCategory(category: EnchantmentQuote['category']): EnchantmentQuote[] {
  return ENCHANTMENT_QUOTES.filter(quote => quote.category === category);
}

export function getRandomQuote(): EnchantmentQuote {
  return ENCHANTMENT_QUOTES[Math.floor(Math.random() * ENCHANTMENT_QUOTES.length)];
}

export function getQuoteForMoment(): EnchantmentQuote {
  // Select quote based on time of day or other contextual factors
  const hour = new Date().getHours();
  
  if (hour < 6) return getQuotesByCategory('mystery')[0];
  if (hour < 12) return getQuotesByCategory('imagination')[0];
  if (hour < 18) return getQuotesByCategory('consciousness')[0];
  return getQuotesByCategory('wisdom')[0];
}