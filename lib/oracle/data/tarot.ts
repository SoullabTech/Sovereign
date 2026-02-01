/**
 * Tarot Card Data - Complete 78 Card Deck
 *
 * 22 Major Arcana + 56 Minor Arcana (14 cards x 4 suits)
 * Each card includes upright and reversed meanings
 */

export interface TarotCard {
  id: string;
  name: string;
  arcana: 'major' | 'minor';
  suit?: 'wands' | 'cups' | 'swords' | 'pentacles';
  number?: number;
  keywords: string[];
  upright: string;
  reversed: string;
  element?: 'fire' | 'water' | 'air' | 'earth' | 'spirit';
  archetype?: string;
  shadowAspect?: string;
}

// Major Arcana (22 cards)
export const MAJOR_ARCANA: TarotCard[] = [
  {
    id: 'fool',
    name: 'The Fool',
    arcana: 'major',
    number: 0,
    keywords: ['beginnings', 'innocence', 'spontaneity', 'leap of faith'],
    upright: 'New beginnings, innocence, spontaneity, a free spirit. You stand at the edge of a great adventure, unburdened by past failures or future fears.',
    reversed: 'Holding back, recklessness, risk-taking without awareness. Fear of the unknown keeps you from taking the leap.',
    element: 'air',
    archetype: 'The Innocent',
    shadowAspect: 'Foolishness without wisdom, naivety that invites harm'
  },
  {
    id: 'magician',
    name: 'The Magician',
    arcana: 'major',
    number: 1,
    keywords: ['manifestation', 'power', 'action', 'resourcefulness'],
    upright: 'Manifestation, resourcefulness, power, inspired action. All the tools you need are before you. Channel your will into reality.',
    reversed: 'Manipulation, poor planning, untapped talents. Power used for selfish ends or gifts left dormant.',
    element: 'air',
    archetype: 'The Creator',
    shadowAspect: 'The Trickster who deceives self and others'
  },
  {
    id: 'high-priestess',
    name: 'The High Priestess',
    arcana: 'major',
    number: 2,
    keywords: ['intuition', 'mystery', 'subconscious', 'inner voice'],
    upright: 'Intuition, sacred knowledge, divine feminine, the subconscious mind. Trust what you know beyond knowing.',
    reversed: 'Secrets, disconnected from intuition, withdrawal. The inner voice is muffled by noise or fear.',
    element: 'water',
    archetype: 'The Mystic',
    shadowAspect: 'Hidden manipulation, passive aggression'
  },
  {
    id: 'empress',
    name: 'The Empress',
    arcana: 'major',
    number: 3,
    keywords: ['abundance', 'nurturing', 'fertility', 'nature'],
    upright: 'Femininity, beauty, nature, nurturing, abundance. Life wants to grow through you. Create, nourish, bloom.',
    reversed: "Creative block, dependence on others, emptiness. The garden is neglected; self-care abandoned.",
    element: 'earth',
    archetype: 'The Mother',
    shadowAspect: 'Smothering love, over-identification with nurturing role'
  },
  {
    id: 'emperor',
    name: 'The Emperor',
    arcana: 'major',
    number: 4,
    keywords: ['authority', 'structure', 'control', 'fatherhood'],
    upright: 'Authority, establishment, structure, a father figure. Build the container that holds your vision. Lead with strength and wisdom.',
    reversed: 'Domination, excessive control, lack of discipline. Power without heart becomes tyranny.',
    element: 'fire',
    archetype: 'The Father',
    shadowAspect: 'Rigidity, authoritarianism, emotional unavailability'
  },
  {
    id: 'hierophant',
    name: 'The Hierophant',
    arcana: 'major',
    number: 5,
    keywords: ['tradition', 'conformity', 'morality', 'ethics'],
    upright: 'Spiritual wisdom, religious beliefs, conformity, tradition. Seek the teachings that have stood the test of time.',
    reversed: 'Personal beliefs, freedom, challenging the status quo. The old forms no longer serve; forge your own path.',
    element: 'earth',
    archetype: 'The Teacher',
    shadowAspect: 'Dogmatism, empty ritual, spiritual bypass'
  },
  {
    id: 'lovers',
    name: 'The Lovers',
    arcana: 'major',
    number: 6,
    keywords: ['love', 'harmony', 'relationships', 'choices'],
    upright: 'Love, harmony, relationships, values alignment, choices. The heart knows what the mind debates. Choose from wholeness.',
    reversed: 'Self-love, disharmony, imbalance, misalignment of values. Inner conflict projects onto relationships.',
    element: 'air',
    archetype: 'The Beloved',
    shadowAspect: 'Codependence, loss of self in other'
  },
  {
    id: 'chariot',
    name: 'The Chariot',
    arcana: 'major',
    number: 7,
    keywords: ['control', 'willpower', 'success', 'determination'],
    upright: 'Control, willpower, success, action, determination. Harness opposing forces. Move forward with focused intention.',
    reversed: 'Self-discipline lacking, opposition, lack of direction. The horses pull in different directions; inner conflict stalls progress.',
    element: 'water',
    archetype: 'The Warrior',
    shadowAspect: 'Aggression, forcing outcomes, running over others'
  },
  {
    id: 'strength',
    name: 'Strength',
    arcana: 'major',
    number: 8,
    keywords: ['courage', 'patience', 'compassion', 'influence'],
    upright: 'Strength, courage, persuasion, influence, compassion. True power is gentle. Tame the lion with love, not force.',
    reversed: 'Inner strength, self-doubt, low energy. The beast within feels unmanageable; patience wears thin.',
    element: 'fire',
    archetype: 'The Healer',
    shadowAspect: 'Suppressed rage, false gentleness'
  },
  {
    id: 'hermit',
    name: 'The Hermit',
    arcana: 'major',
    number: 9,
    keywords: ['soul-searching', 'introspection', 'solitude', 'guidance'],
    upright: 'Soul-searching, introspection, being alone, inner guidance. Withdraw to find what cannot be found in the crowd.',
    reversed: 'Isolation, loneliness, withdrawal. Solitude becomes avoidance; the lamp is hidden under a bushel.',
    element: 'earth',
    archetype: 'The Sage',
    shadowAspect: 'Isolation as escape, spiritual elitism'
  },
  {
    id: 'wheel-of-fortune',
    name: 'Wheel of Fortune',
    arcana: 'major',
    number: 10,
    keywords: ['change', 'cycles', 'fate', 'turning point'],
    upright: 'Good luck, karma, life cycles, destiny, a turning point. The wheel turns. What rises will fall; what falls will rise.',
    reversed: 'Bad luck, resistance to change, breaking cycles. Fighting the current exhausts you; surrender to the rhythm.',
    element: 'fire',
    archetype: 'The Weaver',
    shadowAspect: 'Fatalism, blaming fate for choices'
  },
  {
    id: 'justice',
    name: 'Justice',
    arcana: 'major',
    number: 11,
    keywords: ['fairness', 'truth', 'cause and effect', 'law'],
    upright: 'Justice, fairness, truth, cause and effect, law. Every action has a consequence. Align with truth; accept accountability.',
    reversed: 'Unfairness, lack of accountability, dishonesty. The scales are tipped; truth is obscured.',
    element: 'air',
    archetype: 'The Judge',
    shadowAspect: 'Harsh judgment, self-righteousness'
  },
  {
    id: 'hanged-man',
    name: 'The Hanged Man',
    arcana: 'major',
    number: 12,
    keywords: ['surrender', 'letting go', 'new perspective', 'sacrifice'],
    upright: 'Pause, surrender, letting go, new perspectives. Hang suspended between worlds. What you release creates space for revelation.',
    reversed: 'Delays, resistance, stalling, indecision. Clinging to the old view blocks the new sight.',
    element: 'water',
    archetype: 'The Martyr',
    shadowAspect: 'Victim mentality, passive resistance'
  },
  {
    id: 'death',
    name: 'Death',
    arcana: 'major',
    number: 13,
    keywords: ['endings', 'change', 'transformation', 'transition'],
    upright: 'Endings, change, transformation, transition. Something must die for something new to be born. Let go completely.',
    reversed: 'Resistance to change, personal transformation, inner purging. The old skin clings; the new self struggles to emerge.',
    element: 'water',
    archetype: 'The Transformer',
    shadowAspect: 'Clinging to what is dead, fear of endings'
  },
  {
    id: 'temperance',
    name: 'Temperance',
    arcana: 'major',
    number: 14,
    keywords: ['balance', 'moderation', 'patience', 'purpose'],
    upright: 'Balance, moderation, patience, purpose. Pour between opposites. Find the middle way that honors both.',
    reversed: 'Imbalance, excess, self-healing, realignment. The mixture is off; recalibration needed.',
    element: 'fire',
    archetype: 'The Alchemist',
    shadowAspect: 'Over-moderation, fear of extremes, blandness'
  },
  {
    id: 'devil',
    name: 'The Devil',
    arcana: 'major',
    number: 15,
    keywords: ['shadow self', 'attachment', 'addiction', 'materialism'],
    upright: 'Shadow self, attachment, addiction, restriction, sexuality. Face what binds you. The chains are looser than they appear.',
    reversed: 'Releasing limiting beliefs, exploring dark thoughts, detachment. Breaking free from self-imposed bondage.',
    element: 'earth',
    archetype: 'The Shadow',
    shadowAspect: 'Denial of shadow, projection onto others'
  },
  {
    id: 'tower',
    name: 'The Tower',
    arcana: 'major',
    number: 16,
    keywords: ['sudden change', 'upheaval', 'revelation', 'awakening'],
    upright: 'Sudden change, upheaval, chaos, revelation, awakening. Lightning strikes the false structure. Truth demolishes illusion.',
    reversed: 'Personal transformation, fear of change, averting disaster. The tower trembles but has not yet fallen.',
    element: 'fire',
    archetype: 'The Destroyer',
    shadowAspect: 'Clinging to crumbling structures, denial of necessary destruction'
  },
  {
    id: 'star',
    name: 'The Star',
    arcana: 'major',
    number: 17,
    keywords: ['hope', 'faith', 'renewal', 'spirituality'],
    upright: 'Hope, faith, purpose, renewal, spirituality. After the storm, stars emerge. Trust returns; healing begins.',
    reversed: 'Lack of faith, despair, self-trust issues. The light seems distant; hope feels naive.',
    element: 'air',
    archetype: 'The Guide',
    shadowAspect: 'Blind optimism, spiritual bypass'
  },
  {
    id: 'moon',
    name: 'The Moon',
    arcana: 'major',
    number: 18,
    keywords: ['illusion', 'fear', 'anxiety', 'subconscious'],
    upright: 'Illusion, fear, anxiety, subconscious, intuition. Navigate by uncertain light. Trust the path even when you cannot see it clearly.',
    reversed: 'Release of fear, repressed emotion, inner confusion. The fog lifts; what was hidden becomes clear.',
    element: 'water',
    archetype: 'The Dreamer',
    shadowAspect: 'Delusion, deception, getting lost in fantasy'
  },
  {
    id: 'sun',
    name: 'The Sun',
    arcana: 'major',
    number: 19,
    keywords: ['joy', 'success', 'celebration', 'positivity'],
    upright: 'Positivity, fun, warmth, success, vitality. Bask in the light. Joy is not naive; it is hard-won wisdom.',
    reversed: 'Inner child wounded, feeling down, overly optimistic. The light is dimmed but not extinguished.',
    element: 'fire',
    archetype: 'The Child',
    shadowAspect: 'Forced positivity, denial of darkness'
  },
  {
    id: 'judgement',
    name: 'Judgement',
    arcana: 'major',
    number: 20,
    keywords: ['reflection', 'reckoning', 'awakening', 'renewal'],
    upright: 'Judgement, rebirth, inner calling, absolution. The trumpet sounds. Rise to meet your highest self.',
    reversed: 'Self-doubt, inner critic, ignoring the call. The summons goes unanswered; the reckoning delayed.',
    element: 'fire',
    archetype: 'The Reborn',
    shadowAspect: 'Self-condemnation, inability to forgive self'
  },
  {
    id: 'world',
    name: 'The World',
    arcana: 'major',
    number: 21,
    keywords: ['completion', 'integration', 'accomplishment', 'travel'],
    upright: 'Completion, integration, accomplishment, travel. The dance completes the circle. Wholeness achieved; new cycle begins.',
    reversed: 'Seeking personal closure, short-cuts, delays. The circle is not yet complete; some piece remains.',
    element: 'earth',
    archetype: 'The Dancer',
    shadowAspect: 'Fear of completion, staying in process forever'
  }
];

// Minor Arcana suits
const SUITS: Array<{ suit: TarotCard['suit']; element: TarotCard['element']; domain: string }> = [
  { suit: 'wands', element: 'fire', domain: 'passion, creativity, will, ambition' },
  { suit: 'cups', element: 'water', domain: 'emotions, relationships, intuition, love' },
  { suit: 'swords', element: 'air', domain: 'mind, conflict, truth, communication' },
  { suit: 'pentacles', element: 'earth', domain: 'material world, work, health, finances' }
];

// Card meanings by number (applies to all suits)
const NUMBER_MEANINGS: Record<number, { theme: string; upright: string; reversed: string }> = {
  1: { theme: 'New beginnings', upright: 'Pure potential, new opportunity, inspiration', reversed: 'Blocked energy, missed opportunity, false start' },
  2: { theme: 'Balance', upright: 'Partnership, duality, decision point', reversed: 'Imbalance, indecision, disharmony' },
  3: { theme: 'Growth', upright: 'Expansion, creativity, collaboration', reversed: 'Lack of growth, scattered energy, delays' },
  4: { theme: 'Stability', upright: 'Foundation, structure, security', reversed: 'Rigidity, stagnation, instability' },
  5: { theme: 'Conflict', upright: 'Challenge, change, competition', reversed: 'Avoiding conflict, inner turmoil, recovery' },
  6: { theme: 'Harmony', upright: 'Balance restored, generosity, reciprocity', reversed: 'Imbalance, one-sided giving, selfishness' },
  7: { theme: 'Assessment', upright: 'Reflection, evaluation, patience required', reversed: 'Impatience, poor assessment, lack of vision' },
  8: { theme: 'Mastery', upright: 'Skill, movement, rapid change', reversed: 'Delays, frustration, scattered efforts' },
  9: { theme: 'Fruition', upright: 'Attainment, satisfaction, near completion', reversed: 'Unfulfillment, disappointment, almost there' },
  10: { theme: 'Completion', upright: 'Culmination, ending, legacy', reversed: 'Burden, resistance to closure, incomplete cycles' }
};

// Court card archetypes
const COURT_CARDS: Record<string, { role: string; maturity: string; upright: string; reversed: string }> = {
  page: { role: 'Messenger', maturity: 'Youth/Student', upright: 'New ideas, curiosity, learning, messages', reversed: 'Immaturity, lack of direction, bad news' },
  knight: { role: 'Warrior', maturity: 'Young Adult', upright: 'Action, adventure, pursuit, energy', reversed: 'Recklessness, haste, aggression, restlessness' },
  queen: { role: 'Nurturer', maturity: 'Mature Feminine', upright: 'Nurturing, intuitive, creative, receptive', reversed: 'Insecurity, dependence, smothering, moody' },
  king: { role: 'Leader', maturity: 'Mature Masculine', upright: 'Authority, mastery, leadership, control', reversed: 'Tyranny, rigidity, manipulation, weakness' }
};

// Generate Minor Arcana cards
function generateMinorArcana(): TarotCard[] {
  const cards: TarotCard[] = [];

  for (const { suit, element, domain } of SUITS) {
    // Number cards (Ace through 10)
    for (let num = 1; num <= 10; num++) {
      const numMeaning = NUMBER_MEANINGS[num];
      const name = num === 1 ? `Ace of ${capitalize(suit!)}` : `${num} of ${capitalize(suit!)}`;

      cards.push({
        id: `${suit}-${num}`,
        name,
        arcana: 'minor',
        suit,
        number: num,
        element,
        keywords: [numMeaning.theme.toLowerCase(), suit!, element!],
        upright: `${numMeaning.upright} in the realm of ${domain}.`,
        reversed: `${numMeaning.reversed} in matters of ${domain}.`
      });
    }

    // Court cards
    for (const [rank, courtMeaning] of Object.entries(COURT_CARDS)) {
      cards.push({
        id: `${suit}-${rank}`,
        name: `${capitalize(rank)} of ${capitalize(suit!)}`,
        arcana: 'minor',
        suit,
        element,
        keywords: [courtMeaning.role.toLowerCase(), rank, suit!, element!],
        upright: `${courtMeaning.upright}. A ${courtMeaning.maturity} energy bringing ${domain}.`,
        reversed: `${courtMeaning.reversed}. ${courtMeaning.maturity} energy blocked or misdirected in ${domain}.`
      });
    }
  }

  return cards;
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Complete deck
export const MINOR_ARCANA = generateMinorArcana();
export const TAROT_DECK: TarotCard[] = [...MAJOR_ARCANA, ...MINOR_ARCANA];

// Spread configurations
export interface SpreadPosition {
  name: string;
  meaning: string;
}

export interface SpreadConfig {
  id: string;
  name: string;
  cardCount: number;
  positions: SpreadPosition[];
}

export const SPREADS: Record<string, SpreadConfig> = {
  single: {
    id: 'single',
    name: 'Single Card',
    cardCount: 1,
    positions: [
      { name: 'The Message', meaning: 'The essential wisdom for this moment' }
    ]
  },
  'three-card': {
    id: 'three-card',
    name: 'Three-Card Spread',
    cardCount: 3,
    positions: [
      { name: 'Past', meaning: 'What has led to this moment' },
      { name: 'Present', meaning: 'The current situation' },
      { name: 'Future', meaning: 'What is emerging' }
    ]
  },
  'celtic-cross': {
    id: 'celtic-cross',
    name: 'Celtic Cross',
    cardCount: 10,
    positions: [
      { name: 'Present', meaning: 'The heart of the matter' },
      { name: 'Challenge', meaning: 'What crosses you' },
      { name: 'Foundation', meaning: 'The root of the situation' },
      { name: 'Recent Past', meaning: 'What is passing away' },
      { name: 'Crown', meaning: 'What you are working towards' },
      { name: 'Near Future', meaning: 'What is approaching' },
      { name: 'Self', meaning: 'How you see yourself' },
      { name: 'Environment', meaning: 'External influences' },
      { name: 'Hopes/Fears', meaning: 'Your inner landscape' },
      { name: 'Outcome', meaning: 'The likely resolution' }
    ]
  }
};

// Helper functions
export function drawCards(count: number, allowReversed: boolean = true): Array<TarotCard & { reversed: boolean; position?: SpreadPosition }> {
  const shuffled = [...TAROT_DECK].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map(card => ({
    ...card,
    reversed: allowReversed ? Math.random() > 0.5 : false
  }));
}

export function getSpread(spreadId: string): SpreadConfig | undefined {
  return SPREADS[spreadId];
}

export function drawSpread(spreadId: string, allowReversed: boolean = true): Array<TarotCard & { reversed: boolean; position: SpreadPosition }> {
  const spread = SPREADS[spreadId];
  if (!spread) return [];

  const cards = drawCards(spread.cardCount, allowReversed);
  return cards.map((card, index) => ({
    ...card,
    position: spread.positions[index]
  }));
}
