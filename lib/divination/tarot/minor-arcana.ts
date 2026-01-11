/**
 * Minor Arcana - The 56 Pip and Court Cards
 * Four suits representing the elements and everyday experiences
 */

import { TarotCard, TarotSuit, Element } from '../core/types';

// Element mappings for suits
const SUIT_ELEMENTS: Record<TarotSuit, Element> = {
  wands: 'fire',
  cups: 'water',
  swords: 'air',
  pentacles: 'earth'
};

// Suit keywords
const SUIT_THEMES: Record<TarotSuit, string[]> = {
  wands: ['passion', 'action', 'creativity', 'willpower', 'inspiration'],
  cups: ['emotions', 'relationships', 'intuition', 'feelings', 'love'],
  swords: ['intellect', 'truth', 'conflict', 'decisions', 'communication'],
  pentacles: ['material', 'work', 'health', 'finances', 'manifestation']
};

// Decan correspondences (for numbered cards 2-10)
const DECAN_CORRESPONDENCES: Record<TarotSuit, string[]> = {
  wands: [
    '', '', // Ace and placeholder
    'Mars in Aries', 'Sun in Aries', 'Venus in Aries',
    'Saturn in Leo', 'Jupiter in Leo', 'Mars in Leo',
    'Mercury in Sagittarius', 'Moon in Sagittarius', 'Saturn in Sagittarius'
  ],
  cups: [
    '', '',
    'Venus in Cancer', 'Mercury in Cancer', 'Moon in Cancer',
    'Saturn in Scorpio', 'Mars in Scorpio', 'Sun in Scorpio',
    'Jupiter in Pisces', 'Moon in Pisces', 'Mars in Pisces'
  ],
  swords: [
    '', '',
    'Moon in Libra', 'Saturn in Libra', 'Jupiter in Libra',
    'Venus in Aquarius', 'Mercury in Aquarius', 'Moon in Aquarius',
    'Jupiter in Gemini', 'Mars in Gemini', 'Sun in Gemini'
  ],
  pentacles: [
    '', '',
    'Jupiter in Capricorn', 'Mars in Capricorn', 'Sun in Capricorn',
    'Venus in Taurus', 'Moon in Taurus', 'Saturn in Taurus',
    'Mercury in Virgo', 'Sun in Virgo', 'Venus in Virgo'
  ]
};

// Card meanings by suit and number
interface CardMeaning {
  upright: string;
  reversed: string;
  keywords: string[];
  soulGuidance: string;
}

const WANDS_MEANINGS: Record<number, CardMeaning> = {
  1: {
    upright: 'New beginnings in creativity and passion. A spark of inspiration ignites. Take inspired action.',
    reversed: 'Delays in new projects, lack of motivation, creative blocks.',
    keywords: ['inspiration', 'potential', 'creation', 'willpower', 'new venture'],
    soulGuidance: 'The Ace of Wands is pure creative fire. What lights you up? Follow that spark.'
  },
  2: {
    upright: 'Planning, making decisions about the future, looking ahead. Personal power grows.',
    reversed: 'Fear of the unknown, lack of planning, playing it safe.',
    keywords: ['planning', 'decisions', 'discovery', 'progress', 'vision'],
    soulGuidance: 'Stand at the crossroads with confidence. The world awaits your choice.'
  },
  3: {
    upright: 'Expansion, growth, overseas opportunities. Your ships come in.',
    reversed: 'Delays in plans, frustration with lack of progress, limited vision.',
    keywords: ['expansion', 'foresight', 'leadership', 'enterprise', 'growth'],
    soulGuidance: 'Your vision is ready to expand. Look to distant horizons for opportunities.'
  },
  4: {
    upright: 'Celebration, harmony, home, community. A foundation is established.',
    reversed: 'Transition, change in relationships, feeling unwelcome.',
    keywords: ['celebration', 'harmony', 'homecoming', 'community', 'stability'],
    soulGuidance: 'Celebrate what you have built. Community and home provide your foundation.'
  },
  5: {
    upright: 'Conflict, competition, disagreements. Different opinions clash.',
    reversed: 'Avoiding conflict, inner conflict, compromise.',
    keywords: ['conflict', 'competition', 'tension', 'diversity', 'struggle'],
    soulGuidance: 'Conflict can clarify. Engage honestly with opposing views to find truth.'
  },
  6: {
    upright: 'Victory, success, recognition. Public acknowledgment of achievement.',
    reversed: 'Ego, fall from grace, delayed success.',
    keywords: ['victory', 'success', 'recognition', 'triumph', 'pride'],
    soulGuidance: 'Your efforts are recognized. Accept victory with grace and share the honor.'
  },
  7: {
    upright: 'Challenge, competition, perseverance. Hold your ground.',
    reversed: 'Giving up, overwhelmed, feeling defensive.',
    keywords: ['challenge', 'perseverance', 'competition', 'defense', 'courage'],
    soulGuidance: 'Stand firm in what you believe. Your position is worth defending.'
  },
  8: {
    upright: 'Rapid movement, swift changes, things taking off quickly.',
    reversed: 'Delays, frustration, waiting, slowing down.',
    keywords: ['movement', 'speed', 'progress', 'change', 'momentum'],
    soulGuidance: 'Events accelerate. Stay aligned with your purpose as things move fast.'
  },
  9: {
    upright: 'Resilience, perseverance, testing of faith. Almost there.',
    reversed: 'Paranoia, defensiveness, stubbornness, giving up.',
    keywords: ['resilience', 'courage', 'persistence', 'boundaries', 'endurance'],
    soulGuidance: 'You have been tested and remain standing. This final trial builds unshakeable strength.'
  },
  10: {
    upright: 'Burden, responsibility, hard work, stress from overcommitment.',
    reversed: 'Releasing burdens, delegating, inability to delegate.',
    keywords: ['burden', 'responsibility', 'stress', 'hard work', 'overload'],
    soulGuidance: 'You carry too much. Consider what you can release or share with others.'
  },
  11: { // Page
    upright: 'New ideas, curiosity, enthusiasm for learning. A message about creativity.',
    reversed: 'Lack of direction, procrastination, empty promises.',
    keywords: ['exploration', 'enthusiasm', 'discovery', 'messages', 'potential'],
    soulGuidance: 'Approach life with curiosity and enthusiasm. New creative adventures call.'
  },
  12: { // Knight
    upright: 'Action, adventure, impulsiveness. Pursuing passions with energy.',
    reversed: 'Haste, scattered energy, delays, frustration.',
    keywords: ['action', 'adventure', 'energy', 'passion', 'impulsiveness'],
    soulGuidance: 'Channel your passionate energy. Move boldly but with awareness.'
  },
  13: { // Queen
    upright: 'Courage, determination, confidence. Warmth and vitality.',
    reversed: 'Jealousy, selfishness, demanding, temperamental.',
    keywords: ['confidence', 'warmth', 'determination', 'independence', 'vibrancy'],
    soulGuidance: 'Your warmth and confidence inspire others. Lead with your authentic fire.'
  },
  14: { // King
    upright: 'Leadership, vision, entrepreneurial spirit. Big-picture thinking.',
    reversed: 'Impulsiveness, ruthlessness, high expectations, overbearing.',
    keywords: ['leadership', 'vision', 'boldness', 'charisma', 'honor'],
    soulGuidance: 'Step into visionary leadership. Your fire can illuminate the path for many.'
  }
};

const CUPS_MEANINGS: Record<number, CardMeaning> = {
  1: {
    upright: 'New feelings, emotional beginnings, intuition. Love flows.',
    reversed: 'Blocked emotions, emptiness, emotional loss.',
    keywords: ['love', 'intuition', 'emotion', 'creativity', 'new feelings'],
    soulGuidance: 'A new emotional beginning is possible. Open your heart to receive.'
  },
  2: {
    upright: 'Partnership, unity, attraction. Two hearts connect.',
    reversed: 'Imbalance in relationships, broken communication, distrust.',
    keywords: ['partnership', 'attraction', 'unity', 'connection', 'harmony'],
    soulGuidance: 'True partnership requires both giving and receiving equally.'
  },
  3: {
    upright: 'Celebration, friendship, community. Joy shared multiplies.',
    reversed: 'Overindulgence, gossip, isolation.',
    keywords: ['celebration', 'friendship', 'collaboration', 'community', 'joy'],
    soulGuidance: 'Celebrate with those you love. Shared joy nourishes the soul.'
  },
  4: {
    upright: 'Meditation, contemplation, apathy. Need to look within.',
    reversed: 'Motivation returns, new perspective, moving forward.',
    keywords: ['contemplation', 'apathy', 'reevaluation', 'withdrawal', 'meditation'],
    soulGuidance: 'What you are seeking may not be found outside. Look within.'
  },
  5: {
    upright: 'Loss, grief, disappointment. Focus on what remains.',
    reversed: 'Acceptance, moving on, finding peace.',
    keywords: ['loss', 'grief', 'disappointment', 'sorrow', 'regret'],
    soulGuidance: 'Grief is love with nowhere to go. Honor what was lost, then look to what remains.'
  },
  6: {
    upright: 'Nostalgia, childhood memories, innocence. Past joy remembered.',
    reversed: 'Living in the past, unrealistic memories.',
    keywords: ['nostalgia', 'memories', 'innocence', 'reunion', 'childhood'],
    soulGuidance: 'Sweet memories remind us of our essence. Visit but don\'t live in the past.'
  },
  7: {
    upright: 'Fantasy, illusion, choices. Many options, not all real.',
    reversed: 'Alignment, clarity, making choices.',
    keywords: ['choices', 'fantasy', 'illusion', 'wishful thinking', 'imagination'],
    soulGuidance: 'Not all that glitters is gold. Distinguish fantasy from true desire.'
  },
  8: {
    upright: 'Walking away, leaving behind, searching for more.',
    reversed: 'Stagnation, fear of change, trying one more time.',
    keywords: ['departure', 'withdrawal', 'searching', 'disappointment', 'abandonment'],
    soulGuidance: 'Sometimes you must leave what no longer nourishes to find what does.'
  },
  9: {
    upright: 'Contentment, satisfaction, wishes fulfilled. Emotional fulfillment.',
    reversed: 'Dissatisfaction, greed, complacency.',
    keywords: ['satisfaction', 'contentment', 'wishes', 'fulfillment', 'gratitude'],
    soulGuidance: 'Your heart\'s desires are fulfilled. Bask in gratitude for this abundance.'
  },
  10: {
    upright: 'Harmony, happiness, alignment. Family and emotional fulfillment.',
    reversed: 'Broken family, misaligned values, disconnection.',
    keywords: ['harmony', 'happiness', 'family', 'fulfillment', 'peace'],
    soulGuidance: 'Emotional completion and family harmony are yours. This is lasting joy.'
  },
  11: {
    upright: 'Creative opportunities, curiosity about feelings. Emotional messenger.',
    reversed: 'Emotional immaturity, creative blocks, bad news.',
    keywords: ['creativity', 'intuition', 'sensitivity', 'messages', 'dreams'],
    soulGuidance: 'Trust your intuitive impressions. An emotional message arrives.'
  },
  12: {
    upright: 'Romance, charm, imagination. Following the heart.',
    reversed: 'Moodiness, unrealistic expectations, jealousy.',
    keywords: ['romance', 'imagination', 'charm', 'idealism', 'beauty'],
    soulGuidance: 'Follow your heart but stay grounded. Romance calls you to adventure.'
  },
  13: {
    upright: 'Compassion, calm, comfort. Emotional intelligence.',
    reversed: 'Martyrdom, insecurity, dependence.',
    keywords: ['compassion', 'intuition', 'calm', 'nurturing', 'sensitivity'],
    soulGuidance: 'Your emotional depth allows you to hold space for others. Trust your heart.'
  },
  14: {
    upright: 'Emotional balance, diplomacy, compassion. Wise in matters of the heart.',
    reversed: 'Manipulation, moodiness, detachment.',
    keywords: ['compassion', 'diplomacy', 'wisdom', 'balance', 'generosity'],
    soulGuidance: 'Lead with heart intelligence. Your emotional mastery benefits all.'
  }
};

const SWORDS_MEANINGS: Record<number, CardMeaning> = {
  1: {
    upright: 'Breakthrough, clarity, new ideas. Mental clarity cuts through confusion.',
    reversed: 'Confusion, chaos, lack of clarity, miscommunication.',
    keywords: ['clarity', 'breakthrough', 'truth', 'new ideas', 'mental power'],
    soulGuidance: 'Mental clarity pierces through confusion. Use this power wisely.'
  },
  2: {
    upright: 'Difficult decisions, stalemate, avoidance. Balance opposing views.',
    reversed: 'Confusion, information overload, indecision.',
    keywords: ['indecision', 'stalemate', 'denial', 'blocked emotions', 'avoidance'],
    soulGuidance: 'Refusing to choose is itself a choice. Face the decision with open eyes.'
  },
  3: {
    upright: 'Heartbreak, sorrow, grief. Pain that must be felt.',
    reversed: 'Recovery, forgiveness, releasing pain.',
    keywords: ['heartbreak', 'sorrow', 'grief', 'pain', 'suffering'],
    soulGuidance: 'This pain is real but not permanent. Feel it fully to move through it.'
  },
  4: {
    upright: 'Rest, recovery, contemplation. Time out to heal.',
    reversed: 'Restlessness, burnout, stagnation.',
    keywords: ['rest', 'recovery', 'contemplation', 'recuperation', 'solitude'],
    soulGuidance: 'Rest is not weakness. Take time to recover and process.'
  },
  5: {
    upright: 'Conflict, disagreements, competition. Winning at others\' expense.',
    reversed: 'Reconciliation, making amends, moving on.',
    keywords: ['conflict', 'defeat', 'loss', 'betrayal', 'self-interest'],
    soulGuidance: 'What do you gain by winning if others lose? Consider the cost of conflict.'
  },
  6: {
    upright: 'Transition, moving on, travel. Leaving difficulties behind.',
    reversed: 'Stagnation, unfinished business, inability to move on.',
    keywords: ['transition', 'change', 'travel', 'moving on', 'healing'],
    soulGuidance: 'It\'s time to move toward calmer waters. Leave what troubled you behind.'
  },
  7: {
    upright: 'Deception, strategy, cunning. Not everything is as it seems.',
    reversed: 'Confession, conscience, coming clean.',
    keywords: ['deception', 'strategy', 'cunning', 'theft', 'betrayal'],
    soulGuidance: 'Be aware of hidden agendas - in others and yourself. Choose integrity.'
  },
  8: {
    upright: 'Restriction, imprisonment, victim mentality. Feeling trapped.',
    reversed: 'Freedom, release, finding solutions.',
    keywords: ['restriction', 'imprisonment', 'helplessness', 'fear', 'self-victimization'],
    soulGuidance: 'Your bonds are looser than you think. Open your eyes to freedom.'
  },
  9: {
    upright: 'Anxiety, worry, fear. The mind creates suffering.',
    reversed: 'Hope, releasing anxiety, coping with stress.',
    keywords: ['anxiety', 'worry', 'fear', 'depression', 'nightmares'],
    soulGuidance: 'The demons of the night are largely imaginary. Dawn is coming.'
  },
  10: {
    upright: 'Painful endings, rock bottom, betrayal. The end of a difficult cycle.',
    reversed: 'Recovery, regeneration, resisting an inevitable end.',
    keywords: ['ending', 'pain', 'betrayal', 'rock bottom', 'defeat'],
    soulGuidance: 'This is the end, but endings make way for new beginnings. The worst is over.'
  },
  11: {
    upright: 'Curiosity, thirst for knowledge, new ideas. Vigilant and alert.',
    reversed: 'Deception, manipulation, all talk no action.',
    keywords: ['curiosity', 'vigilance', 'communication', 'ideas', 'spying'],
    soulGuidance: 'Stay alert and curious. Information is power when used wisely.'
  },
  12: {
    upright: 'Action, impulsiveness, ambition. Charging forward.',
    reversed: 'Recklessness, impatience, unfocused energy.',
    keywords: ['action', 'ambition', 'speed', 'assertiveness', 'impatience'],
    soulGuidance: 'Your mental energy drives you forward. Channel it with purpose.'
  },
  13: {
    upright: 'Independence, unbiased judgment, clear boundaries. Intellectual power.',
    reversed: 'Cold-heartedness, cruelty, bitterness.',
    keywords: ['independence', 'perception', 'clarity', 'discernment', 'directness'],
    soulGuidance: 'Your clarity cuts through illusion. Use discernment with compassion.'
  },
  14: {
    upright: 'Clear thinking, authority, truth. Mental mastery.',
    reversed: 'Manipulation, cruelty, abuse of power.',
    keywords: ['authority', 'intellect', 'truth', 'ethics', 'judgment'],
    soulGuidance: 'Wield the sword of truth with integrity. Mental power carries great responsibility.'
  }
};

const PENTACLES_MEANINGS: Record<number, CardMeaning> = {
  1: {
    upright: 'New financial opportunity, manifestation, abundance. Seeds planted.',
    reversed: 'Missed opportunity, lack of planning, poor financial management.',
    keywords: ['opportunity', 'manifestation', 'prosperity', 'new venture', 'abundance'],
    soulGuidance: 'A new opportunity for material manifestation appears. Plant wisely.'
  },
  2: {
    upright: 'Balance, juggling priorities, adaptability. Managing multiple concerns.',
    reversed: 'Overwhelmed, disorganized, financial difficulty.',
    keywords: ['balance', 'adaptability', 'flexibility', 'juggling', 'time management'],
    soulGuidance: 'Life requires flexibility. Balance your resources with grace.'
  },
  3: {
    upright: 'Teamwork, collaboration, building. Initial stages of success.',
    reversed: 'Lack of teamwork, disorganization, poor planning.',
    keywords: ['teamwork', 'collaboration', 'learning', 'building', 'effort'],
    soulGuidance: 'Mastery comes through dedicated practice and collaboration.'
  },
  4: {
    upright: 'Conservation, security, possessiveness. Holding on to what you have.',
    reversed: 'Greed, materialism, overspending.',
    keywords: ['security', 'conservation', 'stability', 'control', 'possessiveness'],
    soulGuidance: 'Security has value, but holding too tight creates its own prison.'
  },
  5: {
    upright: 'Financial loss, poverty, isolation. Feeling left out in the cold.',
    reversed: 'Recovery, improvement, spiritual poverty.',
    keywords: ['hardship', 'loss', 'isolation', 'poverty', 'struggle'],
    soulGuidance: 'Material lack can reveal spiritual wealth. Help is available if you ask.'
  },
  6: {
    upright: 'Generosity, charity, giving and receiving. Sharing abundance.',
    reversed: 'Debt, selfishness, one-sided charity.',
    keywords: ['generosity', 'charity', 'sharing', 'giving', 'prosperity'],
    soulGuidance: 'The flow of abundance requires both giving and receiving. Be generous.'
  },
  7: {
    upright: 'Long-term view, sustainable results, patience with growth.',
    reversed: 'Lack of long-term vision, limited success, impatience.',
    keywords: ['perseverance', 'investment', 'patience', 'reward', 'growth'],
    soulGuidance: 'Seeds take time to grow. Trust the process and tend your garden.'
  },
  8: {
    upright: 'Skill, craftsmanship, quality. Mastery through dedication.',
    reversed: 'Perfectionism, lack of motivation, shortcuts.',
    keywords: ['apprenticeship', 'craftsmanship', 'skill', 'diligence', 'mastery'],
    soulGuidance: 'Excellence comes through dedicated practice. Master your craft.'
  },
  9: {
    upright: 'Luxury, self-sufficiency, financial independence. Enjoying the fruits.',
    reversed: 'Self-worth issues, material attachment, superficiality.',
    keywords: ['abundance', 'luxury', 'self-sufficiency', 'accomplishment', 'independence'],
    soulGuidance: 'You have created abundance through your efforts. Enjoy it without guilt.'
  },
  10: {
    upright: 'Wealth, legacy, family. Long-term success and inheritance.',
    reversed: 'Financial failure, loneliness, family disputes.',
    keywords: ['wealth', 'inheritance', 'family', 'legacy', 'stability'],
    soulGuidance: 'Material success finds its meaning in what you pass on to future generations.'
  },
  11: {
    upright: 'New opportunity, study, skill development. Grounded new beginnings.',
    reversed: 'Lack of progress, procrastination, missed opportunity.',
    keywords: ['opportunity', 'study', 'manifestation', 'new skills', 'ambition'],
    soulGuidance: 'A tangible opportunity for growth appears. Study and develop new skills.'
  },
  12: {
    upright: 'Hard work, routine, patience. Steady progress toward goals.',
    reversed: 'Workaholic, lack of progress, perfectionism.',
    keywords: ['efficiency', 'routine', 'conservatism', 'methodical', 'patience'],
    soulGuidance: 'Steady, methodical progress creates lasting results. Trust the process.'
  },
  13: {
    upright: 'Abundance, security, practicality. Creating a comfortable home.',
    reversed: 'Self-centeredness, smothering, work-home imbalance.',
    keywords: ['abundance', 'security', 'practicality', 'nurturing', 'domesticity'],
    soulGuidance: 'You create abundance and security for those you love. Your home is your sanctuary.'
  },
  14: {
    upright: 'Abundance, security, discipline. Material mastery achieved.',
    reversed: 'Materialism, stubbornness, workaholism.',
    keywords: ['abundance', 'discipline', 'control', 'success', 'wealth'],
    soulGuidance: 'You have achieved material mastery. Use your resources to create lasting good.'
  }
};

/**
 * Generate Minor Arcana cards for a suit
 */
function generateSuitCards(suit: TarotSuit): TarotCard[] {
  const element = SUIT_ELEMENTS[suit];
  const meanings = suit === 'wands' ? WANDS_MEANINGS :
                   suit === 'cups' ? CUPS_MEANINGS :
                   suit === 'swords' ? SWORDS_MEANINGS :
                   PENTACLES_MEANINGS;

  const cards: TarotCard[] = [];

  for (let num = 1; num <= 14; num++) {
    const meaning = meanings[num];
    let name: string;
    let symbolism: string[];

    if (num === 1) {
      name = `Ace of ${capitalize(suit)}`;
      symbolism = ['hand from cloud', 'single symbol', 'pure elemental energy'];
    } else if (num <= 10) {
      name = `${numberToWord(num)} of ${capitalize(suit)}`;
      symbolism = [`${num} ${suit}`, 'scene', 'figures'];
    } else if (num === 11) {
      name = `Page of ${capitalize(suit)}`;
      symbolism = ['young figure', 'single symbol', 'message'];
    } else if (num === 12) {
      name = `Knight of ${capitalize(suit)}`;
      symbolism = ['mounted figure', 'action', 'movement'];
    } else if (num === 13) {
      name = `Queen of ${capitalize(suit)}`;
      symbolism = ['seated figure', 'throne', 'receptive'];
    } else {
      name = `King of ${capitalize(suit)}`;
      symbolism = ['enthroned figure', 'authority', 'mastery'];
    }

    cards.push({
      id: `minor-${suit}-${num}`,
      name,
      arcana: 'minor',
      suit,
      number: num,
      element,
      keywords: meaning.keywords,
      uprightMeaning: meaning.upright,
      reversedMeaning: meaning.reversed,
      soulGuidance: meaning.soulGuidance,
      symbolism,
      decanCorrespondence: num >= 2 && num <= 10 ? DECAN_CORRESPONDENCES[suit][num] : undefined,
      numerology: num <= 10 ? getNumerologyMeaning(num) : undefined
    });
  }

  return cards;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function numberToWord(n: number): string {
  const words = ['', 'Ace', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'];
  return words[n] || String(n);
}

function getNumerologyMeaning(n: number): string {
  const meanings: Record<number, string> = {
    1: 'New beginnings, potential, unity',
    2: 'Duality, balance, partnership',
    3: 'Creation, growth, expression',
    4: 'Structure, stability, foundation',
    5: 'Change, conflict, adaptation',
    6: 'Harmony, responsibility, balance',
    7: 'Reflection, assessment, wisdom',
    8: 'Power, movement, achievement',
    9: 'Completion, fulfillment, culmination',
    10: 'End of cycle, renewal, legacy'
  };
  return meanings[n] || '';
}

// Generate all Minor Arcana
export const MINOR_ARCANA: TarotCard[] = [
  ...generateSuitCards('wands'),
  ...generateSuitCards('cups'),
  ...generateSuitCards('swords'),
  ...generateSuitCards('pentacles')
];

/**
 * Get cards by suit
 */
export function getCardsBySuit(suit: TarotSuit): TarotCard[] {
  return MINOR_ARCANA.filter(card => card.suit === suit);
}

/**
 * Get card by suit and number
 */
export function getMinorArcana(suit: TarotSuit, number: number): TarotCard | undefined {
  return MINOR_ARCANA.find(card => card.suit === suit && card.number === number);
}

/**
 * Get all pip cards (Ace-10)
 */
export function getPipCards(): TarotCard[] {
  return MINOR_ARCANA.filter(card => card.number && card.number <= 10);
}

/**
 * Get all court cards (Page, Knight, Queen, King)
 */
export function getCourtCards(): TarotCard[] {
  return MINOR_ARCANA.filter(card => card.number && card.number > 10);
}

/**
 * Get cards by element
 */
export function getCardsByElement(element: Element): TarotCard[] {
  return MINOR_ARCANA.filter(card => card.element === element);
}

export default MINOR_ARCANA;
