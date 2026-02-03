/**
 * Tarot Drawing Logic
 * Card selection, shuffling, and reading generation
 */

import {
  TarotCard,
  TarotReading,
  TarotSpread,
  DrawnCard,
  SpreadPosition,
  ElementalSignature,
  DivinationRitual
} from '../core/types';
import { MAJOR_ARCANA, getMajorArcana } from './major-arcana';
import { MINOR_ARCANA, getMinorArcana } from './minor-arcana';
import { getSpread, SPREADS } from './spreads';

/**
 * Complete deck (78 cards)
 */
export const FULL_DECK: TarotCard[] = [...MAJOR_ARCANA, ...MINOR_ARCANA];

/**
 * Fisher-Yates shuffle algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Determine if a card is reversed (approximately 50% chance)
 */
function determineReversed(): boolean {
  return Math.random() < 0.5;
}

/**
 * Shuffle the deck
 */
export function shuffleDeck(deck: TarotCard[] = FULL_DECK): TarotCard[] {
  // Multiple shuffles for better randomization
  let shuffled = shuffleArray(deck);
  shuffled = shuffleArray(shuffled);
  shuffled = shuffleArray(shuffled);
  return shuffled;
}

/**
 * Draw a single card from the deck
 */
export function drawSingleCard(
  deck: TarotCard[] = FULL_DECK,
  allowReversals: boolean = true
): DrawnCard {
  const shuffled = shuffleDeck(deck);
  const card = shuffled[0];
  const isReversed = allowReversals ? determineReversed() : false;

  return {
    card,
    position: {
      name: 'The Card',
      description: 'Your guidance',
      index: 0
    },
    isReversed,
    interpretation: isReversed ? card.reversedMeaning : card.uprightMeaning
  };
}

/**
 * Draw multiple cards for a spread
 */
export function drawCards(
  spread: TarotSpread,
  deck: TarotCard[] = FULL_DECK,
  allowReversals: boolean = true
): DrawnCard[] {
  const shuffled = shuffleDeck(deck);
  const drawnCards: DrawnCard[] = [];

  for (let i = 0; i < spread.cardCount; i++) {
    const card = shuffled[i];
    const position = spread.positions[i];
    const isReversed = allowReversals ? determineReversed() : false;

    drawnCards.push({
      card,
      position,
      isReversed,
      interpretation: isReversed ? card.reversedMeaning : card.uprightMeaning
    });
  }

  return drawnCards;
}

/**
 * Calculate elemental balance from drawn cards
 */
export function calculateElementalBalance(drawnCards: DrawnCard[]): ElementalSignature {
  const balance: ElementalSignature = {
    fire: 0,
    water: 0,
    earth: 0,
    air: 0,
    aether: 0
  };

  for (const { card, isReversed } of drawnCards) {
    const element = card.element;
    const weight = isReversed ? 0.5 : 1; // Reversed cards have diminished elemental influence

    switch (element) {
      case 'fire':
        balance.fire += weight;
        break;
      case 'water':
        balance.water += weight;
        break;
      case 'earth':
        balance.earth += weight;
        break;
      case 'air':
        balance.air += weight;
        break;
      case 'aether':
        balance.aether += weight;
        break;
    }
  }

  // Normalize to 0-1 range
  const total = balance.fire + balance.water + balance.earth + balance.air + balance.aether;
  if (total > 0) {
    balance.fire /= total;
    balance.water /= total;
    balance.earth /= total;
    balance.air /= total;
    balance.aether /= total;
  }

  return balance;
}

/**
 * Get dominant element from drawn cards
 */
export function getDominantElement(drawnCards: DrawnCard[]): string {
  const balance = calculateElementalBalance(drawnCards);
  const elements = Object.entries(balance) as [string, number][];
  elements.sort((a, b) => b[1] - a[1]);
  return elements[0][0];
}

/**
 * Generate soul insight from the reading
 */
function generateSoulInsight(drawnCards: DrawnCard[], query: string): string {
  const majorArcana = drawnCards.filter(d => d.card.arcana === 'major');
  const reversedCount = drawnCards.filter(d => d.isReversed).length;
  const dominantElement = getDominantElement(drawnCards);

  let insight = '';

  // Major arcana presence
  if (majorArcana.length > drawnCards.length / 2) {
    insight += 'This reading carries profound significance. The Major Arcana cards speak to larger life themes and soul-level transformations. ';
  } else if (majorArcana.length > 0) {
    insight += `The presence of ${majorArcana.map(d => d.card.name).join(', ')} highlights important spiritual dimensions to consider. `;
  }

  // Reversal interpretation
  if (reversedCount === 0) {
    insight += 'All cards appear upright, suggesting clear, direct energy flowing toward manifestation. ';
  } else if (reversedCount > drawnCards.length / 2) {
    insight += 'Many reversed cards indicate internal work, blocked energy, or invitation to deeper reflection before action. ';
  }

  // Elemental theme
  const elementInsights: Record<string, string> = {
    fire: 'The fire element dominates, calling for passionate action, creativity, and bold initiative.',
    water: 'Water flows through this reading, inviting emotional depth, intuition, and nurturing connection.',
    earth: 'Earth grounds this reading in practical matters, material concerns, and patient building.',
    air: 'Air currents bring intellectual clarity, communication needs, and new perspectives.',
    aether: 'Spirit pervades this reading, suggesting transcendence, higher purpose, and sacred connection.'
  };

  insight += elementInsights[dominantElement] || '';

  return insight;
}

/**
 * Generate ritual suggestion for the reading
 */
function generateRitual(drawnCards: DrawnCard[], spread: TarotSpread): DivinationRitual {
  const dominantElement = getDominantElement(drawnCards);
  const majorCards = drawnCards.filter(d => d.card.arcana === 'major');

  const elementMaterials: Record<string, string[]> = {
    fire: ['Red or orange candle', 'Matches or lighter', 'Dried herbs for burning'],
    water: ['Bowl of water', 'Blue candle', 'Sea salt'],
    earth: ['Stones or crystals', 'Green candle', 'Soil or sand'],
    air: ['Incense', 'Yellow candle', 'Feather or bell'],
    aether: ['White candle', 'Clear quartz', 'Sacred oil']
  };

  const elementSteps: Record<string, string[]> = {
    fire: [
      'Light the candle and feel its warmth.',
      'Write one action step from the reading on paper.',
      'Safely burn the paper to release your intention.',
      'Sit with the flame, visualizing your goal manifesting.'
    ],
    water: [
      'Fill the bowl with water and add a pinch of salt.',
      'Gaze into the water while reviewing each card\'s message.',
      'Speak an emotion you wish to release into the water.',
      'Pour the water outside or down the drain with gratitude.'
    ],
    earth: [
      'Hold a stone in your hands and breathe deeply.',
      'Place the cards you drew around the stone in their positions.',
      'Touch each card and speak its guidance aloud.',
      'Carry the stone with you as a reminder of the reading.'
    ],
    air: [
      'Light the incense and watch the smoke rise.',
      'Speak the key message from each card into the smoke.',
      'Ring a bell or chime to seal the reading.',
      'Take three deep breaths to integrate the wisdom.'
    ],
    aether: [
      'Anoint your third eye with the sacred oil.',
      'Hold the clear quartz to your heart.',
      'Meditate on the cards\' combined message for 5-10 minutes.',
      'Record any visions or insights in your journal.'
    ]
  };

  const focusCard = majorCards.length > 0 ? majorCards[0].card : drawnCards[0].card;

  return {
    name: `${spread.name} Integration`,
    duration: spread.cardCount * 5 + 10,
    materials: [
      'Your drawn tarot cards',
      'Journal and pen',
      ...(elementMaterials[dominantElement] || elementMaterials.aether)
    ],
    steps: [
      'Create sacred space by clearing and centering yourself.',
      'Lay out the cards in the spread pattern.',
      ...(elementSteps[dominantElement] || elementSteps.aether),
      'Journal key insights and any guidance that emerged.',
      'Thank the cards and close the space.'
    ],
    intention: `Integrate the wisdom of ${focusCard.name} and the ${spread.name} reading`,
    bestTiming: focusCard.astrological || 'When you feel called',
    element: dominantElement as any,
    archetype: focusCard.name
  };
}

/**
 * Generate guidance text combining all position interpretations
 */
function generateGuidance(drawnCards: DrawnCard[], spread: TarotSpread): string {
  const lines = drawnCards.map(({ card, position, isReversed }) => {
    const direction = isReversed ? '(Reversed)' : '';
    return `**${position.name}** — ${card.name} ${direction}\n${isReversed ? card.reversedMeaning : card.uprightMeaning}`;
  });

  return lines.join('\n\n');
}

/**
 * Perform a complete tarot reading
 */
export function performReading(
  query: string,
  spreadKey: string,
  allowReversals: boolean = true,
  deck: TarotCard[] = FULL_DECK
): TarotReading {
  const spread = getSpread(spreadKey);
  if (!spread) {
    throw new Error(`Unknown spread: ${spreadKey}`);
  }

  const drawnCards = drawCards(spread, deck, allowReversals);

  return {
    query,
    spread,
    drawnCards,
    insight: generateSoulInsight(drawnCards, query),
    soulGuidance: generateGuidance(drawnCards, spread),
    ritual: generateRitual(drawnCards, spread),
    timestamp: new Date()
  };
}

/**
 * Perform a single card daily draw
 */
export function dailyDraw(allowReversals: boolean = true): TarotReading {
  return performReading(
    'What guidance does today hold?',
    'single',
    allowReversals
  );
}

/**
 * Perform a three-card reading
 */
export function threeCardReading(
  query: string,
  spreadType: 'three-card' | 'mind-body-spirit' = 'three-card',
  allowReversals: boolean = true
): TarotReading {
  return performReading(query, spreadType, allowReversals);
}

/**
 * Perform a Celtic Cross reading
 */
export function celticCrossReading(
  query: string,
  allowReversals: boolean = true
): TarotReading {
  return performReading(query, 'celtic-cross', allowReversals);
}

/**
 * Get the daily card based on date (consistent per day)
 */
export function getDailyCard(date: Date = new Date()): TarotCard {
  const dayOfYear = Math.floor(
    (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000
  );
  const cardIndex = dayOfYear % FULL_DECK.length;
  return FULL_DECK[cardIndex];
}

/**
 * Get card by ID
 */
export function getCardById(id: string): TarotCard | undefined {
  return FULL_DECK.find(card => card.id === id);
}

/**
 * Search cards by keyword
 */
export function searchCards(keyword: string): TarotCard[] {
  const lowerKeyword = keyword.toLowerCase();
  return FULL_DECK.filter(card =>
    card.name.toLowerCase().includes(lowerKeyword) ||
    card.keywords.some(k => k.toLowerCase().includes(lowerKeyword)) ||
    card.uprightMeaning.toLowerCase().includes(lowerKeyword) ||
    card.soulGuidance.toLowerCase().includes(lowerKeyword)
  );
}

/**
 * Get cards by element
 */
export function getCardsByElement(element: string): TarotCard[] {
  return FULL_DECK.filter(card => card.element === element);
}

/**
 * Get Major Arcana only deck
 */
export function getMajorArcanaOnlyDeck(): TarotCard[] {
  return MAJOR_ARCANA;
}

/**
 * Get Minor Arcana only deck
 */
export function getMinorArcanaOnlyDeck(): TarotCard[] {
  return MINOR_ARCANA;
}

export default {
  performReading,
  dailyDraw,
  threeCardReading,
  celticCrossReading,
  drawSingleCard,
  drawCards,
  shuffleDeck,
  getDailyCard,
  getCardById,
  searchCards,
  getCardsByElement,
  calculateElementalBalance,
  getDominantElement,
  FULL_DECK
};
