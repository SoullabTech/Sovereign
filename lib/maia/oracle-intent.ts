/**
 * Oracle Intent Detection for MAIA
 *
 * Detects when a user wants divination guidance in conversation.
 * Identifies specific oracle system requests or general guidance needs.
 */

export type OracleIntentType =
  | 'iching'           // Specific I Ching request
  | 'tarot'            // Specific Tarot request
  | 'runes'            // Specific Runes request
  | 'unified'          // Cross-system reading
  | 'general-guidance' // User needs guidance, oracle might help
  | 'daily'            // Daily guidance request
  | 'none';            // No oracle intent detected

export interface OracleIntent {
  type: OracleIntentType;
  confidence: number;        // 0-1 how confident we are
  query?: string;            // Extracted question for the oracle
  suggestedSpread?: string;  // Suggested spread type
  reason: string;            // Why we detected this intent
  shouldOffer: boolean;      // Should MAIA offer oracle vs. just respond normally
}

// Keywords and phrases that indicate oracle intent
const ICHING_KEYWORDS = [
  'i ching', 'iching', 'yi jing', 'yijing', 'book of changes',
  'hexagram', 'hexagrams', 'trigram', 'trigrams',
  'yarrow', 'yarrow stalks', 'coins method',
  'yin yang', 'changing lines'
];

const TAROT_KEYWORDS = [
  'tarot', 'tarot card', 'tarot cards', 'the cards',
  'draw a card', 'draw cards', 'card reading',
  'major arcana', 'minor arcana',
  'celtic cross', 'three card', 'spread',
  'the fool', 'the magician', 'high priestess', 'empress', 'emperor',
  'hierophant', 'lovers', 'chariot', 'strength', 'hermit',
  'wheel of fortune', 'justice', 'hanged man', 'death',
  'temperance', 'devil', 'tower', 'star', 'moon', 'sun',
  'judgement', 'world'
];

const RUNES_KEYWORDS = [
  'runes', 'rune', 'runic', 'elder futhark', 'futhark',
  'cast runes', 'draw runes', 'rune reading',
  'norns', 'wyrd', 'orlog',
  'fehu', 'uruz', 'thurisaz', 'ansuz', 'raidho', 'kenaz',
  'gebo', 'wunjo', 'hagalaz', 'nauthiz', 'isa', 'jera',
  'eihwaz', 'perthro', 'algiz', 'sowilo', 'tiwaz', 'berkano',
  'ehwaz', 'mannaz', 'laguz', 'ingwaz', 'dagaz', 'othala'
];

const GENERAL_ORACLE_KEYWORDS = [
  'oracle', 'divination', 'divine', 'prophecy',
  'fortune', 'fortune telling', 'reading',
  'guidance', 'wisdom', 'insight'
];

const GUIDANCE_PHRASES = [
  'what should i do',
  'what do you think',
  'i need guidance',
  'i need help deciding',
  'i\'m at a crossroads',
  'i don\'t know what to do',
  'which path should',
  'seeking guidance',
  'need some direction',
  'can you help me understand',
  'what does the universe say',
  'what does fate say',
  'what\'s my destiny',
  'should i',
  'is it time to',
  'will this work out'
];

const DAILY_PHRASES = [
  'daily guidance',
  'today\'s guidance',
  'what does today hold',
  'guidance for today',
  'morning reading',
  'daily card',
  'daily rune',
  'daily hexagram',
  'what should i focus on today'
];

/**
 * Detect if user message contains oracle intent
 */
export function detectOracleIntent(
  message: string,
  conversationContext?: {
    recentTopics?: string[];
    userEmotionalState?: string;
    hasRecentReading?: boolean;
  }
): OracleIntent {
  const normalizedMessage = message.toLowerCase().trim();

  // Check for explicit oracle system requests
  const ichingScore = calculateKeywordScore(normalizedMessage, ICHING_KEYWORDS);
  const tarotScore = calculateKeywordScore(normalizedMessage, TAROT_KEYWORDS);
  const runesScore = calculateKeywordScore(normalizedMessage, RUNES_KEYWORDS);
  const generalOracleScore = calculateKeywordScore(normalizedMessage, GENERAL_ORACLE_KEYWORDS);
  const guidanceScore = calculatePhraseScore(normalizedMessage, GUIDANCE_PHRASES);
  const dailyScore = calculatePhraseScore(normalizedMessage, DAILY_PHRASES);

  // Explicit I Ching request
  if (ichingScore > 0.3) {
    return {
      type: 'iching',
      confidence: Math.min(ichingScore + 0.3, 1),
      query: extractQuery(normalizedMessage, ICHING_KEYWORDS),
      suggestedSpread: undefined,
      reason: 'Explicit I Ching request detected',
      shouldOffer: false  // User explicitly asked, just do it
    };
  }

  // Explicit Tarot request
  if (tarotScore > 0.3) {
    const spreadSuggestion = detectSpreadFromMessage(normalizedMessage);
    return {
      type: 'tarot',
      confidence: Math.min(tarotScore + 0.3, 1),
      query: extractQuery(normalizedMessage, TAROT_KEYWORDS),
      suggestedSpread: spreadSuggestion,
      reason: 'Explicit Tarot request detected',
      shouldOffer: false
    };
  }

  // Explicit Runes request
  if (runesScore > 0.3) {
    return {
      type: 'runes',
      confidence: Math.min(runesScore + 0.3, 1),
      query: extractQuery(normalizedMessage, RUNES_KEYWORDS),
      suggestedSpread: detectRuneSpreadFromMessage(normalizedMessage),
      reason: 'Explicit Runes request detected',
      shouldOffer: false
    };
  }

  // Daily guidance request
  if (dailyScore > 0.4) {
    return {
      type: 'daily',
      confidence: dailyScore,
      query: 'Daily guidance',
      reason: 'Daily guidance request detected',
      shouldOffer: false
    };
  }

  // General oracle request (user wants some form of divination)
  if (generalOracleScore > 0.3) {
    return {
      type: 'unified',
      confidence: generalOracleScore,
      query: extractQuery(normalizedMessage, GENERAL_ORACLE_KEYWORDS),
      reason: 'General oracle/divination request',
      shouldOffer: true  // Offer choices
    };
  }

  // Guidance-seeking behavior (user might benefit from oracle)
  if (guidanceScore > 0.3) {
    // Check emotional state and context
    const shouldOffer = conversationContext?.userEmotionalState !== 'crisis' &&
                       !conversationContext?.hasRecentReading;

    return {
      type: 'general-guidance',
      confidence: guidanceScore * 0.7,  // Lower confidence, just detecting need
      query: message,
      reason: 'User appears to be seeking guidance',
      shouldOffer
    };
  }

  // No oracle intent detected
  return {
    type: 'none',
    confidence: 0,
    reason: 'No oracle intent detected',
    shouldOffer: false
  };
}

/**
 * Calculate keyword match score
 */
function calculateKeywordScore(message: string, keywords: string[]): number {
  let matches = 0;
  let totalWeight = 0;

  for (const keyword of keywords) {
    const weight = keyword.includes(' ') ? 1.5 : 1;  // Multi-word phrases are stronger signals
    totalWeight += weight;

    if (message.includes(keyword)) {
      matches += weight;
    }
  }

  return totalWeight > 0 ? matches / Math.min(totalWeight, 5) : 0;
}

/**
 * Calculate phrase match score
 */
function calculatePhraseScore(message: string, phrases: string[]): number {
  let matches = 0;

  for (const phrase of phrases) {
    if (message.includes(phrase)) {
      matches++;
    }
  }

  return Math.min(matches / 2, 1);  // Cap at 1
}

/**
 * Extract the actual question from the message
 */
function extractQuery(message: string, systemKeywords: string[]): string {
  // Remove oracle-specific keywords to get the core question
  let query = message;

  for (const keyword of systemKeywords) {
    query = query.replace(new RegExp(keyword, 'gi'), '').trim();
  }

  // Clean up common prefixes
  query = query
    .replace(/^(please |can you |could you |i want to |i'd like to |i need )/i, '')
    .replace(/^(ask |consult |get |do |perform |give me )/i, '')
    .replace(/^(a |an |the |my )/i, '')
    .trim();

  return query || message;
}

/**
 * Detect suggested tarot spread from message
 */
function detectSpreadFromMessage(message: string): string | undefined {
  if (message.includes('celtic cross') || message.includes('full reading')) {
    return 'celtic-cross';
  }
  if (message.includes('three card') || message.includes('3 card') ||
      message.includes('past present future')) {
    return 'three-card';
  }
  if (message.includes('single') || message.includes('one card') ||
      message.includes('daily')) {
    return 'single';
  }
  if (message.includes('relationship') || message.includes('love')) {
    return 'relationship';
  }
  return undefined;
}

/**
 * Detect suggested rune spread from message
 */
function detectRuneSpreadFromMessage(message: string): string | undefined {
  if (message.includes('norn') || message.includes('three')) {
    return 'norns';
  }
  if (message.includes('element') || message.includes('cross')) {
    return 'elements';
  }
  if (message.includes('week')) {
    return 'week';
  }
  if (message.includes('single') || message.includes('one')) {
    return 'single';
  }
  return undefined;
}

/**
 * Determine the best oracle method based on the query
 */
export function recommendOracleMethod(
  query: string,
  userPreferences?: {
    favoriteMethod?: OracleIntentType;
    elementalAffinity?: string;
  }
): {
  recommended: OracleIntentType;
  alternatives: OracleIntentType[];
  reason: string;
} {
  const normalizedQuery = query.toLowerCase();

  // Check user preference first
  if (userPreferences?.favoriteMethod &&
      userPreferences.favoriteMethod !== 'none' &&
      userPreferences.favoriteMethod !== 'general-guidance') {
    return {
      recommended: userPreferences.favoriteMethod,
      alternatives: ['tarot', 'iching', 'runes'].filter(m => m !== userPreferences.favoriteMethod) as OracleIntentType[],
      reason: 'Based on your preferred oracle method'
    };
  }

  // Decision/change questions -> I Ching
  if (normalizedQuery.match(/(change|transform|transition|should i|decision|crossroads|choice)/)) {
    return {
      recommended: 'iching',
      alternatives: ['tarot', 'runes'],
      reason: 'The I Ching excels at questions of change and decision-making'
    };
  }

  // Emotional/psychological questions -> Tarot
  if (normalizedQuery.match(/(feel|emotion|relationship|love|heart|soul|psychology|pattern)/)) {
    return {
      recommended: 'tarot',
      alternatives: ['runes', 'iching'],
      reason: 'Tarot illuminates emotional and psychological landscapes'
    };
  }

  // Fate/action questions -> Runes
  if (normalizedQuery.match(/(fate|destiny|action|strength|challenge|warrior|will|power)/)) {
    return {
      recommended: 'runes',
      alternatives: ['iching', 'tarot'],
      reason: 'The runes speak to fate, will, and right action'
    };
  }

  // Default: Tarot is most accessible
  return {
    recommended: 'tarot',
    alternatives: ['iching', 'runes'],
    reason: 'Tarot offers rich symbolic guidance for most questions'
  };
}

export default {
  detectOracleIntent,
  recommendOracleMethod
};
