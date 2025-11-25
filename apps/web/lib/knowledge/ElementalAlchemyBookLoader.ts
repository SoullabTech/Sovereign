/**
 * ELEMENTAL ALCHEMY BOOK LOADER
 *
 * Loads relevant sections from Kelly's book for MAIA to synthesize from
 * This gives MAIA access to the actual teachings, not just framework structure
 */

import fs from 'fs';
import path from 'path';

// Book location
const BOOK_PATH = '/Users/soullab/MAIA-PAI/uploads/library/ain_conversations/Elemental Alchemy_ The Ancient Art of Living a Phenomenal Life.md';

// Chapter line numbers (exact locations from book)
const CHAPTER_LOCATIONS = {
  // Foundational / Metaphysical Setup
  introduction: { start: 99, chapter: 0, title: 'Introduction - Rediscovering and Balancing Self' },
  journey: { start: 155, chapter: 1, title: 'The Journey Begins' },
  spiralogic: { start: 177, chapter: 2, title: 'The Torus of Change (Spiralogic Process)' },
  trinity: { start: 193, chapter: 3, title: 'Trinity and Toroidal Flow' },
  wholeness: { start: 209, chapter: 4, title: 'The Elements of Wholeness' },

  // Elemental Chapters
  fire: { start: 1872, chapter: 5, title: 'Fire - The Element of Spirit and Energy' },
  water: { start: 2396, chapter: 6, title: 'Water - The Depths of Emotional Intelligence and Transformation' },
  earth: { start: 2764, chapter: 7, title: 'Earth - The Element of Embodied Living' },
  air: { start: 3188, chapter: 8, title: 'Air - The Element of the Intellect and Mind' },
  aether: { start: 3714, chapter: 9, title: 'Aether – The Quintessential Harmony in the Elemental Dance' }
};

interface BookSection {
  element: string;
  content: string;
  chapterTitle: string;
  wordCount: number;
}

/**
 * Load a specific element chapter from the book
 * Returns ~1000-2000 words to keep context manageable
 */
export async function loadElementChapter(element: 'fire' | 'water' | 'earth' | 'air' | 'aether' | 'spiralogic' | 'introduction'): Promise<BookSection | null> {
  try {
    // Check if file exists
    if (!fs.existsSync(BOOK_PATH)) {
      console.warn(`⚠️ [BOOK] Elemental Alchemy book not found at ${BOOK_PATH}`);
      return null;
    }

    // Read entire book
    const bookContent = fs.readFileSync(BOOK_PATH, 'utf-8');
    const lines = bookContent.split('\n');

    // Get chapter location
    const location = CHAPTER_LOCATIONS[element];
    if (!location) {
      console.warn(`⚠️ [BOOK] Unknown element: ${element}`);
      return null;
    }

    // Extract chapter content (start + ~500 lines for ~2000 words)
    const startLine = location.start;
    const endLine = Math.min(startLine + 500, lines.length);
    const chapterLines = lines.slice(startLine, endLine);
    const content = chapterLines.join('\n');

    // Word count
    const wordCount = content.split(/\s+/).length;

    console.log(`📖 [BOOK] Loaded ${element} chapter: ${wordCount} words from ${location.chapterTitle}`);

    return {
      element,
      content,
      chapterTitle: location.chapterTitle,
      wordCount
    };

  } catch (error) {
    console.error(`❌ [BOOK] Error loading ${element} chapter:`, error);
    return null;
  }
}

/**
 * Load book sections based on conversation context
 * Detects which elements are being discussed and loads relevant chapters
 */
export async function loadRelevantTeachings(userMessage: string, conversationContext?: any): Promise<string> {
  const message = userMessage.toLowerCase();

  // Detect which elements are being discussed
  const elementsToLoad: Array<'fire' | 'water' | 'earth' | 'air' | 'aether' | 'spiralogic'> = [];

  // Fire keywords
  if (message.match(/fire|vision|spiritual|creativity|intuition|fire1|fire2|fire3/i)) {
    elementsToLoad.push('fire');
  }

  // Water keywords
  if (message.match(/water|emotion|feeling|depth|shadow|water1|water2|water3/i)) {
    elementsToLoad.push('water');
  }

  // Earth keywords
  if (message.match(/earth|ground|body|manifest|practical|earth1|earth2|earth3/i)) {
    elementsToLoad.push('earth');
  }

  // Air keywords
  if (message.match(/air|mind|thought|communication|clarity|air1|air2|air3/i)) {
    elementsToLoad.push('air');
  }

  // Aether keywords
  if (message.match(/aether|integration|wholeness|unity|transcendent/i)) {
    elementsToLoad.push('aether');
  }

  // Spiralogic keywords
  if (message.match(/spiral|spiralogic|regression|progression|phase|cycle/i)) {
    elementsToLoad.push('spiralogic');
  }

  // If no specific elements detected, don't load anything (keep context light)
  if (elementsToLoad.length === 0) {
    return '';
  }

  // Load the first detected element (to keep context manageable)
  // In future, could load multiple but that increases token cost
  const primaryElement = elementsToLoad[0];
  const section = await loadElementChapter(primaryElement);

  if (!section) {
    return '';
  }

  // Format for MAIA's context
  return `
## ELEMENTAL ALCHEMY TEACHINGS - ${section.chapterTitle}

The following is from Kelly Nezat's book "Elemental Alchemy: The Ancient Art of Living a Phenomenal Life."
This is provided for you to SYNTHESIZE FROM, not to quote or cite. Speak from the understanding these teachings give you.

---

${section.content}

---

Remember: Synthesize this wisdom into your own voice. Don't cite "the book says" - speak AS someone who has learned these teachings.
`;
}

/**
 * Simpler version: Just load a specific element's core teaching
 * Use this for oracle interpretations where we know the element
 */
export async function getElementTeaching(element: 'fire' | 'water' | 'earth' | 'air' | 'aether'): Promise<string> {
  const section = await loadElementChapter(element);

  if (!section) {
    return '';
  }

  return `
## ${element.toUpperCase()} TEACHINGS FROM ELEMENTAL ALCHEMY

${section.content.substring(0, 3000)}

(Teachings from Kelly's Elemental Alchemy book - synthesize from this understanding)
`;
}
