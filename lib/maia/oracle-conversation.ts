/**
 * Oracle Conversation Integration for MAIA
 *
 * Weaves oracle readings into natural dialogue, making divination
 * feel like part of an organic conversation rather than a separate tool.
 */

import {
  castIChing,
  getDailyHexagram,
  IChingReading,
  Hexagram,
  performReading as performTarotReading,
  dailyDraw,
  threeCardReading,
  TarotReading,
  DrawnCard,
  castRunes,
  dailyRuneDraw,
  nornsReading,
  RuneReading,
  DrawnRune,
  getDailyOracleGuidance,
  DailyOracleGuidance
} from '@/lib/divination';
import { OracleIntentType, detectOracleIntent, recommendOracleMethod } from './oracle-intent';

export interface OracleConversationContext {
  userId?: string;
  userName?: string;
  currentElement?: string;
  recentReadings?: Array<{
    method: string;
    timestamp: Date;
    summary: string;
  }>;
  emotionalState?: string;
  lifeFocus?: string;
}

export interface OracleResponse {
  type: 'reading' | 'offer' | 'insight';
  content: string;           // The conversational response
  readingData?: any;         // The raw reading data for UI rendering
  followUp?: string;         // A follow-up question or invitation
  shouldSave?: boolean;      // Whether to save this reading to memory
}

/**
 * Generate a conversational oracle response based on detected intent
 */
export async function generateOracleResponse(
  message: string,
  intent: ReturnType<typeof detectOracleIntent>,
  context: OracleConversationContext
): Promise<OracleResponse> {
  const { type, query, suggestedSpread, shouldOffer } = intent;

  // If we should offer rather than deliver, create an offer response
  if (shouldOffer && type === 'general-guidance') {
    return generateGuidanceOffer(message, context);
  }

  if (shouldOffer && type === 'unified') {
    return generateOracleChoiceOffer(query || message, context);
  }

  // Generate actual reading based on type
  switch (type) {
    case 'iching':
      return generateIChingResponse(query || message, context);
    case 'tarot':
      return generateTarotResponse(query || message, suggestedSpread, context);
    case 'runes':
      return generateRunesResponse(query || message, suggestedSpread, context);
    case 'daily':
      return generateDailyResponse(context);
    case 'unified':
      return generateUnifiedResponse(query || message, context);
    default:
      return {
        type: 'insight',
        content: "I sense you might be seeking guidance. Would you like to consult the oracle?",
        followUp: "I can offer the I Ching for questions of change, Tarot for matters of the heart and psyche, or the Runes for questions of fate and action."
      };
  }
}

/**
 * Generate I Ching reading response in MAIA's voice
 */
async function generateIChingResponse(
  query: string,
  context: OracleConversationContext
): Promise<OracleResponse> {
  const reading = castIChing(query, 'yarrow');
  const userName = context.userName || 'dear one';

  let content = `${userName}, I've consulted the Book of Changes for you.\n\n`;
  content += `**Hexagram ${reading.primaryHexagram.number}: ${reading.primaryHexagram.englishName}**\n`;
  content += `*${reading.primaryHexagram.keyword}*\n\n`;
  content += `${reading.insight}\n\n`;

  if (reading.changingLines.length > 0) {
    content += `The changing lines (${reading.changingLines.join(', ')}) indicate movement and transformation. `;
    if (reading.transformedHexagram) {
      content += `Your situation is evolving toward **${reading.transformedHexagram.englishName}** - ${reading.transformedHexagram.keyword}.\n\n`;
    }
  }

  content += `**Guidance:** ${reading.soulGuidance}`;

  const followUp = reading.changingLines.length > 0
    ? "Would you like me to explore what these changing lines mean for your specific situation?"
    : "How does this resonate with what you're experiencing?";

  return {
    type: 'reading',
    content,
    readingData: reading,
    followUp,
    shouldSave: true
  };
}

/**
 * Generate Tarot reading response in MAIA's voice
 */
async function generateTarotResponse(
  query: string,
  spreadType: string | undefined,
  context: OracleConversationContext
): Promise<OracleResponse> {
  // Default to three-card for conversational readings
  const spread = spreadType || 'three-card';
  let reading: TarotReading;

  if (spread === 'single' || spread === 'daily') {
    reading = dailyDraw(query);
  } else if (spread === 'three-card') {
    reading = threeCardReading(query);
  } else {
    reading = performTarotReading(query, spread);
  }

  const userName = context.userName || 'beloved';

  let content = `${userName}, the cards have spoken.\n\n`;
  content += `**${reading.spread.name}**\n\n`;

  for (const drawn of reading.drawnCards) {
    const reversedNote = drawn.isReversed ? ' (Reversed)' : '';
    content += `**${drawn.position.name}**: ${drawn.card.name}${reversedNote}\n`;
    content += `*${drawn.interpretation}*\n\n`;
  }

  content += `**Soul Guidance:** ${reading.soulGuidance}`;

  const hasReversed = reading.drawnCards.some(c => c.isReversed);
  const followUp = hasReversed
    ? "I notice some reversed cards in your spread. These often point to internal work or blocked energies. Shall we explore what they're illuminating?"
    : "What stands out to you most in this reading?";

  return {
    type: 'reading',
    content,
    readingData: reading,
    followUp,
    shouldSave: true
  };
}

/**
 * Generate Runes reading response in MAIA's voice
 */
async function generateRunesResponse(
  query: string,
  spreadType: string | undefined,
  context: OracleConversationContext
): Promise<OracleResponse> {
  let reading: RuneReading;

  switch (spreadType) {
    case 'norns':
      reading = nornsReading(query);
      break;
    case 'elements':
      reading = castRunes(query, 'Elemental Cross');
      break;
    default:
      reading = dailyRuneDraw(query);
  }

  const userName = context.userName || 'seeker';

  let content = `${userName}, the runes have been cast.\n\n`;
  content += `**${reading.spread.name}**\n\n`;

  for (const drawn of reading.drawnRunes) {
    const reversedNote = drawn.isReversed ? ' (Merkstave)' : '';
    content += `**${drawn.position.name}**: ${drawn.rune.symbol} ${drawn.rune.name}${reversedNote}\n`;
    content += `*${drawn.interpretation}*\n\n`;
  }

  content += `**The Runes Speak:** ${reading.soulGuidance}`;

  const hasMerkstave = reading.drawnRunes.some(r => r.isReversed);
  const followUp = hasMerkstave
    ? "Some runes appear in merkstave (reversed). The ancestors often use this to point toward shadow work or blocked energies. What challenges are you facing?"
    : "The runes weave a story. What threads connect to your current journey?";

  return {
    type: 'reading',
    content,
    readingData: reading,
    followUp,
    shouldSave: true
  };
}

/**
 * Generate daily oracle guidance response
 */
async function generateDailyResponse(
  context: OracleConversationContext
): Promise<OracleResponse> {
  const guidance = getDailyOracleGuidance();
  const userName = context.userName || 'dear one';

  let content = `Good ${getTimeOfDay()}, ${userName}. Here is your oracle guidance for today.\n\n`;

  content += `**I Ching**: Hexagram ${guidance.hexagram.number} - ${guidance.hexagram.englishName}\n`;
  content += `*${guidance.hexagram.keyword}*\n\n`;

  content += `**Tarot**: ${guidance.card.name}\n`;
  content += `*${guidance.card.keywords.slice(0, 3).join(', ')}*\n\n`;

  content += `**Rune**: ${guidance.rune.symbol} ${guidance.rune.name}\n`;
  content += `*${guidance.rune.meaning}*\n\n`;

  content += `**Combined Insight**: ${guidance.combinedInsight}\n\n`;
  content += `**Focus for Today**: ${guidance.recommendedFocus}`;

  return {
    type: 'reading',
    content,
    readingData: guidance,
    followUp: "Which of these symbols calls to you most strongly today?",
    shouldSave: true
  };
}

/**
 * Generate unified cross-system response
 */
async function generateUnifiedResponse(
  query: string,
  context: OracleConversationContext
): Promise<OracleResponse> {
  // Get recommendation for which oracle to use
  const recommendation = recommendOracleMethod(query);

  // Cast the recommended oracle
  switch (recommendation.recommended) {
    case 'iching':
      return generateIChingResponse(query, context);
    case 'tarot':
      return generateTarotResponse(query, 'three-card', context);
    case 'runes':
      return generateRunesResponse(query, 'norns', context);
    default:
      return generateTarotResponse(query, 'three-card', context);
  }
}

/**
 * Generate an offer for guidance when user seems to need it
 */
function generateGuidanceOffer(
  message: string,
  context: OracleConversationContext
): OracleResponse {
  const userName = context.userName || '';
  const recommendation = recommendOracleMethod(message);

  let content = `I sense you may be at a crossroads${userName ? `, ${userName}` : ''}. `;
  content += `${recommendation.reason}\n\n`;
  content += `Would you like me to consult the ${formatOracleName(recommendation.recommended)} for insight into this?`;

  return {
    type: 'offer',
    content,
    followUp: `I could also offer ${recommendation.alternatives.map(formatOracleName).join(' or ')} if you prefer.`
  };
}

/**
 * Generate oracle choice offer
 */
function generateOracleChoiceOffer(
  query: string,
  context: OracleConversationContext
): OracleResponse {
  const userName = context.userName || '';

  let content = `I can consult the oracles for you${userName ? `, ${userName}` : ''}.\n\n`;
  content += `**I Ching** - The Book of Changes illuminates questions of transformation and right timing.\n`;
  content += `**Tarot** - The cards mirror your inner landscape and reveal hidden patterns.\n`;
  content += `**Runes** - The Elder Futhark speaks of fate, will, and ancestral wisdom.\n\n`;
  content += `Which oracle calls to you?`;

  return {
    type: 'offer',
    content,
    followUp: "Or I can offer a unified reading drawing from all three traditions."
  };
}

/**
 * Format oracle type to display name
 */
function formatOracleName(type: OracleIntentType): string {
  switch (type) {
    case 'iching':
      return 'I Ching';
    case 'tarot':
      return 'Tarot';
    case 'runes':
      return 'Runes';
    case 'unified':
      return 'unified oracle';
    default:
      return 'oracle';
  }
}

/**
 * Get time of day greeting
 */
function getTimeOfDay(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

/**
 * Generate a brief oracle insight for embedding in other responses
 * (When oracle wisdom might enhance a non-oracle conversation)
 */
export function generateOracleEmbedding(
  topic: string,
  context: OracleConversationContext
): string {
  // Get daily guidance elements
  const guidance = getDailyOracleGuidance();

  // Find relevant connection
  const topicLower = topic.toLowerCase();

  // Match by elemental theme
  if (topicLower.includes('change') || topicLower.includes('transition')) {
    return `The I Ching's ${guidance.hexagram.englishName} speaks to this: "${guidance.hexagram.keyword}".`;
  }

  if (topicLower.includes('emotion') || topicLower.includes('feel')) {
    return `Today's ${guidance.card.name} offers insight: "${guidance.card.soulGuidance}".`;
  }

  if (topicLower.includes('action') || topicLower.includes('decision')) {
    return `The rune ${guidance.rune.name} (${guidance.rune.symbol}) whispers: "${guidance.rune.soulGuidance}".`;
  }

  return '';
}

/**
 * Check if a reading should be saved to the user's consciousness map
 */
export function shouldSaveReading(
  reading: IChingReading | TarotReading | RuneReading,
  context: OracleConversationContext
): boolean {
  // Always save if user is logged in
  if (context.userId) return true;

  // Check for significant readings
  if ('changingLines' in reading && reading.changingLines.length >= 3) {
    return true;  // Multiple changing lines = significant
  }

  if ('drawnCards' in reading) {
    const majorArcana = reading.drawnCards.filter(c => c.card.arcana === 'major');
    if (majorArcana.length >= 2) return true;  // Multiple major arcana = significant
  }

  return false;
}

export default {
  generateOracleResponse,
  generateOracleEmbedding,
  shouldSaveReading
};
