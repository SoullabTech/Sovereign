/**
 * Complete Tarot Deck - 78 Cards
 *
 * Major Arcana (22 cards): The Fool through The World
 * Minor Arcana (56 cards): Wands, Cups, Swords, Pentacles
 *
 * Each card includes upright and reversed meanings,
 * keywords, elemental associations, and archetypal themes.
 */

export interface TarotCardData {
  id: string;
  name: string;
  number: number;
  arcana: 'major' | 'minor';
  suit?: 'wands' | 'cups' | 'swords' | 'pentacles';
  element?: 'fire' | 'water' | 'air' | 'earth' | 'spirit';
  keywords: string[];
  uprightMeaning: string;
  reversedMeaning: string;
  archetype?: string;
  astrological?: string;
  numerology?: string;
  symbolism: string;
}

// Major Arcana - The Fool's Journey
export const MAJOR_ARCANA: TarotCardData[] = [
  {
    id: 'major-0',
    name: 'The Fool',
    number: 0,
    arcana: 'major',
    element: 'air',
    keywords: ['beginnings', 'innocence', 'spontaneity', 'free spirit', 'leap of faith'],
    uprightMeaning: 'New beginnings, innocence, spontaneity, a free spirit. You are at the start of a journey, unburdened by past experiences. Trust in the universe and take a leap of faith.',
    reversedMeaning: 'Holding back, recklessness, risk-taking without thought. Fear is preventing you from taking necessary risks. Consider whether caution serves you or limits you.',
    archetype: 'The Innocent',
    astrological: 'Uranus',
    numerology: '0 - Infinite potential, the void before creation',
    symbolism: 'The white rose represents purity, the small dog loyalty and protection, the cliff edge the leap into the unknown.'
  },
  {
    id: 'major-1',
    name: 'The Magician',
    number: 1,
    arcana: 'major',
    element: 'air',
    keywords: ['manifestation', 'resourcefulness', 'power', 'inspired action', 'willpower'],
    uprightMeaning: 'Manifestation, resourcefulness, power, inspired action. You have all the tools you need to succeed. Channel your willpower and focus to create your reality.',
    reversedMeaning: 'Manipulation, poor planning, untapped talents. Your gifts may be misused or dormant. Reconnect with your authentic power.',
    archetype: 'The Magus',
    astrological: 'Mercury',
    numerology: '1 - Unity, new beginnings, individual will',
    symbolism: 'The infinity symbol above represents eternal wisdom, the four suit symbols on the table show mastery of all elements.'
  },
  {
    id: 'major-2',
    name: 'The High Priestess',
    number: 2,
    arcana: 'major',
    element: 'water',
    keywords: ['intuition', 'sacred knowledge', 'divine feminine', 'subconscious', 'mystery'],
    uprightMeaning: 'Intuition, sacred knowledge, divine feminine, the subconscious mind. Trust your inner voice. Secrets will be revealed when the time is right.',
    reversedMeaning: 'Secrets, disconnected from intuition, withdrawal. You may be ignoring your inner wisdom or keeping important information hidden.',
    archetype: 'The Mystic',
    astrological: 'Moon',
    numerology: '2 - Duality, balance, partnership with the divine',
    symbolism: 'The veil between the pillars conceals sacred mysteries, the crescent moon at her feet represents intuition and cycles.'
  },
  {
    id: 'major-3',
    name: 'The Empress',
    number: 3,
    arcana: 'major',
    element: 'earth',
    keywords: ['femininity', 'beauty', 'nature', 'nurturing', 'abundance', 'creativity'],
    uprightMeaning: 'Femininity, beauty, nature, nurturing, abundance. Creative energy flows through you. This is a time of growth, fertility, and sensual pleasure.',
    reversedMeaning: 'Creative block, dependence on others, emptiness. You may be neglecting self-care or experiencing disconnection from your creative power.',
    archetype: 'The Mother',
    astrological: 'Venus',
    numerology: '3 - Creation, expression, growth',
    symbolism: 'The wheat represents abundance, the forest behind shows connection to nature, the Venus symbol marks her throne.'
  },
  {
    id: 'major-4',
    name: 'The Emperor',
    number: 4,
    arcana: 'major',
    element: 'fire',
    keywords: ['authority', 'structure', 'control', 'fatherhood', 'stability', 'leadership'],
    uprightMeaning: 'Authority, structure, control, fatherhood. Establish order and take command of your situation. Leadership and strategic thinking are favored.',
    reversedMeaning: 'Domination, excessive control, rigidity. Authority may be abused or lacking. Find balance between structure and flexibility.',
    archetype: 'The Father',
    astrological: 'Aries',
    numerology: '4 - Foundation, stability, order',
    symbolism: 'The throne of stone represents solid authority, rams heads symbolize Aries energy, the orb and scepter show worldly power.'
  },
  {
    id: 'major-5',
    name: 'The Hierophant',
    number: 5,
    arcana: 'major',
    element: 'earth',
    keywords: ['spiritual wisdom', 'tradition', 'conformity', 'morality', 'ethics', 'teaching'],
    uprightMeaning: 'Spiritual wisdom, religious beliefs, conformity, tradition. Seek guidance from established institutions or mentors. Honor sacred traditions.',
    reversedMeaning: 'Personal beliefs, freedom, challenging the status quo. Question outdated traditions. Find your own spiritual path.',
    archetype: 'The Teacher',
    astrological: 'Taurus',
    numerology: '5 - Change within structure, spiritual law',
    symbolism: 'The triple crown represents mind, body, spirit mastery. The crossed keys unlock heaven and earth wisdom.'
  },
  {
    id: 'major-6',
    name: 'The Lovers',
    number: 6,
    arcana: 'major',
    element: 'air',
    keywords: ['love', 'harmony', 'relationships', 'values alignment', 'choices', 'union'],
    uprightMeaning: 'Love, harmony, relationships, values alignment, choices. A significant relationship or choice is before you. Follow your heart while honoring your values.',
    reversedMeaning: 'Self-love, disharmony, imbalance, misalignment of values. Heal the relationship with yourself before seeking union with others.',
    archetype: 'The Beloved',
    astrological: 'Gemini',
    numerology: '6 - Harmony, balance, responsibility in relationships',
    symbolism: 'The angel Raphael blesses the union, the Tree of Knowledge and Tree of Life represent the integration of wisdom and vitality.'
  },
  {
    id: 'major-7',
    name: 'The Chariot',
    number: 7,
    arcana: 'major',
    element: 'water',
    keywords: ['control', 'willpower', 'success', 'determination', 'victory', 'direction'],
    uprightMeaning: 'Control, willpower, success, determination. Harness opposing forces and direct them toward your goal. Victory through discipline and focus.',
    reversedMeaning: 'Self-discipline issues, opposition, lack of direction. Inner conflicts are slowing your progress. Realign your will.',
    archetype: 'The Warrior',
    astrological: 'Cancer',
    numerology: '7 - Spiritual victory, inner reflection in action',
    symbolism: 'The sphinxes represent opposing forces (conscious/unconscious) that must be mastered. The starry canopy connects to celestial guidance.'
  },
  {
    id: 'major-8',
    name: 'Strength',
    number: 8,
    arcana: 'major',
    element: 'fire',
    keywords: ['strength', 'courage', 'persuasion', 'influence', 'compassion', 'inner power'],
    uprightMeaning: 'Strength, courage, persuasion, influence, compassion. True strength comes from within—through patience, love, and gentle persuasion rather than force.',
    reversedMeaning: 'Inner strength, self-doubt, low energy, raw emotion. Reconnect with your inner reservoir of courage and compassion.',
    archetype: 'The Healer',
    astrological: 'Leo',
    numerology: '8 - Power, infinity, karmic balance',
    symbolism: 'The woman gently closes the lion\'s mouth, showing that love conquers fear. The infinity symbol shows eternal spiritual strength.'
  },
  {
    id: 'major-9',
    name: 'The Hermit',
    number: 9,
    arcana: 'major',
    element: 'earth',
    keywords: ['soul-searching', 'introspection', 'inner guidance', 'solitude', 'wisdom'],
    uprightMeaning: 'Soul-searching, introspection, being alone, inner guidance. Withdraw from the noise of the world to find your inner light. Wisdom comes through contemplation.',
    reversedMeaning: 'Isolation, loneliness, withdrawal. Solitude has become isolation. Seek meaningful connection while maintaining inner wisdom.',
    archetype: 'The Sage',
    astrological: 'Virgo',
    numerology: '9 - Completion, wisdom, humanitarian service',
    symbolism: 'The lantern illuminates the path with the light of wisdom, the staff represents authority gained through experience.'
  },
  {
    id: 'major-10',
    name: 'Wheel of Fortune',
    number: 10,
    arcana: 'major',
    element: 'fire',
    keywords: ['good luck', 'karma', 'life cycles', 'destiny', 'turning point', 'change'],
    uprightMeaning: 'Good luck, karma, life cycles, destiny, a turning point. The wheel is turning in your favor. Embrace change as part of life\'s natural rhythm.',
    reversedMeaning: 'Bad luck, resistance to change, breaking cycles. You may be fighting against natural change. Accept impermanence.',
    archetype: 'The Fates',
    astrological: 'Jupiter',
    numerology: '10/1 - Completion and new beginning, karmic cycles',
    symbolism: 'The wheel contains alchemical symbols and Hebrew letters spelling YHVH and TARO. The sphinx represents wisdom through change.'
  },
  {
    id: 'major-11',
    name: 'Justice',
    number: 11,
    arcana: 'major',
    element: 'air',
    keywords: ['justice', 'fairness', 'truth', 'cause and effect', 'law', 'balance'],
    uprightMeaning: 'Justice, fairness, truth, cause and effect. The consequences of past actions are coming due. Act with integrity and accept accountability.',
    reversedMeaning: 'Unfairness, lack of accountability, dishonesty. Injustice may be present. Seek truth and be honest with yourself.',
    archetype: 'The Judge',
    astrological: 'Libra',
    numerology: '11 - Master number, spiritual justice, illumination',
    symbolism: 'The scales weigh all actions, the sword cuts through illusion to truth. The purple veil hides the mysteries of karmic law.'
  },
  {
    id: 'major-12',
    name: 'The Hanged Man',
    number: 12,
    arcana: 'major',
    element: 'water',
    keywords: ['pause', 'surrender', 'letting go', 'new perspectives', 'sacrifice', 'waiting'],
    uprightMeaning: 'Pause, surrender, letting go, new perspectives. Suspend action and see the world differently. What seems like sacrifice may be liberation.',
    reversedMeaning: 'Delays, resistance, stalling. You may be resisting a necessary pause or avoiding a different perspective.',
    archetype: 'The Martyr',
    astrological: 'Neptune',
    numerology: '12/3 - Sacrifice leading to spiritual creation',
    symbolism: 'The figure hangs willingly, halo showing enlightenment through surrender. The living tree represents growth through stillness.'
  },
  {
    id: 'major-13',
    name: 'Death',
    number: 13,
    arcana: 'major',
    element: 'water',
    keywords: ['endings', 'change', 'transformation', 'transition', 'release', 'renewal'],
    uprightMeaning: 'Endings, change, transformation, transition. Something must end for the new to begin. This is a profound transformation, not literal death.',
    reversedMeaning: 'Resistance to change, personal transformation, inner purging. You may be clinging to what no longer serves you.',
    archetype: 'The Transformer',
    astrological: 'Scorpio',
    numerology: '13/4 - Death and rebirth leading to new foundation',
    symbolism: 'The skeleton shows that death comes to all equally. The white rose represents purity of the transformation. The rising sun promises rebirth.'
  },
  {
    id: 'major-14',
    name: 'Temperance',
    number: 14,
    arcana: 'major',
    element: 'fire',
    keywords: ['balance', 'moderation', 'patience', 'purpose', 'alchemy', 'healing'],
    uprightMeaning: 'Balance, moderation, patience, purpose. Blend opposing forces harmoniously. Practice patience and find the middle path.',
    reversedMeaning: 'Imbalance, excess, self-healing needed, realignment. You may be going to extremes. Seek equilibrium within.',
    archetype: 'The Alchemist',
    astrological: 'Sagittarius',
    numerology: '14/5 - Alchemical transformation through balance',
    symbolism: 'The angel pours water between cups, representing the flow between conscious and unconscious. One foot in water, one on land shows balance.'
  },
  {
    id: 'major-15',
    name: 'The Devil',
    number: 15,
    arcana: 'major',
    element: 'earth',
    keywords: ['shadow self', 'attachment', 'addiction', 'restriction', 'sexuality', 'bondage'],
    uprightMeaning: 'Shadow self, attachment, addiction, restriction, sexuality. Examine what binds you. The chains are loose—you can free yourself when ready.',
    reversedMeaning: 'Releasing limiting beliefs, exploring dark thoughts, detachment. You are ready to break free from what has held you.',
    archetype: 'The Shadow',
    astrological: 'Capricorn',
    numerology: '15/6 - Shadow work in relationships and self',
    symbolism: 'The inverted pentagram represents material over spiritual. The loose chains show bondage is self-imposed and can be released.'
  },
  {
    id: 'major-16',
    name: 'The Tower',
    number: 16,
    arcana: 'major',
    element: 'fire',
    keywords: ['sudden change', 'upheaval', 'chaos', 'revelation', 'awakening', 'breakthrough'],
    uprightMeaning: 'Sudden change, upheaval, chaos, revelation, awakening. Structures built on false foundations must fall. This destruction clears the way for truth.',
    reversedMeaning: 'Personal transformation, fear of change, averting disaster. The tower may fall internally rather than externally. Embrace necessary change.',
    archetype: 'The Destroyer',
    astrological: 'Mars',
    numerology: '16/7 - Spiritual awakening through destruction',
    symbolism: 'Lightning represents divine intervention and sudden illumination. The crown being knocked off shows ego dissolution. Figures fall into the unknown.'
  },
  {
    id: 'major-17',
    name: 'The Star',
    number: 17,
    arcana: 'major',
    element: 'air',
    keywords: ['hope', 'faith', 'purpose', 'renewal', 'spirituality', 'inspiration'],
    uprightMeaning: 'Hope, faith, purpose, renewal, spirituality. After the storm comes peace. Trust in the universe and let hope guide you forward.',
    reversedMeaning: 'Lack of faith, despair, self-trust issues, disconnection. Reconnect with your sense of hope and purpose.',
    archetype: 'The Guide',
    astrological: 'Aquarius',
    numerology: '17/8 - Spiritual power and cosmic connection',
    symbolism: 'The large star represents the soul, surrounded by seven smaller stars for the chakras. Water poured on land and into the pool nourishes both conscious and unconscious.'
  },
  {
    id: 'major-18',
    name: 'The Moon',
    number: 18,
    arcana: 'major',
    element: 'water',
    keywords: ['illusion', 'fear', 'anxiety', 'subconscious', 'intuition', 'dreams'],
    uprightMeaning: 'Illusion, fear, anxiety, subconscious, intuition. Things are not as they seem. Navigate by your inner light through this uncertain terrain.',
    reversedMeaning: 'Release of fear, repressed emotions, inner confusion. Illusions are dissolving. Trust what your intuition reveals.',
    archetype: 'The Dreamer',
    astrological: 'Pisces',
    numerology: '18/9 - Completion of emotional/intuitive cycle',
    symbolism: 'The moon\'s face shows both aspects of the psyche. The dog and wolf represent tamed and wild instincts. The crayfish emerges from the unconscious depths.'
  },
  {
    id: 'major-19',
    name: 'The Sun',
    number: 19,
    arcana: 'major',
    element: 'fire',
    keywords: ['positivity', 'fun', 'warmth', 'success', 'vitality', 'joy', 'truth'],
    uprightMeaning: 'Positivity, fun, warmth, success, vitality. The sun shines on your endeavors. Embrace joy, celebrate life, and share your radiance.',
    reversedMeaning: 'Inner child, feeling down, overly optimistic. Your inner light may be dimmed. Reconnect with innocent joy.',
    archetype: 'The Child',
    astrological: 'Sun',
    numerology: '19/1 - New beginning in full consciousness',
    symbolism: 'The child rides freely, representing innocence regained. Sunflowers turn toward the source of life. The red banner shows vital life force.'
  },
  {
    id: 'major-20',
    name: 'Judgement',
    number: 20,
    arcana: 'major',
    element: 'fire',
    keywords: ['judgement', 'rebirth', 'inner calling', 'absolution', 'renewal', 'reckoning'],
    uprightMeaning: 'Judgement, rebirth, inner calling, absolution. Heed the call to rise up and embrace your higher purpose. A spiritual awakening is at hand.',
    reversedMeaning: 'Self-doubt, inner critic, ignoring the call. You may be judging yourself too harshly or ignoring an important calling.',
    archetype: 'The Awakener',
    astrological: 'Pluto',
    numerology: '20/2 - Divine partnership, answering the call',
    symbolism: 'Gabriel\'s trumpet calls souls to rise. The figures emerging from coffins represent resurrection and answering the higher call.'
  },
  {
    id: 'major-21',
    name: 'The World',
    number: 21,
    arcana: 'major',
    element: 'earth',
    keywords: ['completion', 'integration', 'accomplishment', 'travel', 'wholeness', 'fulfillment'],
    uprightMeaning: 'Completion, integration, accomplishment, travel. A major cycle is complete. Celebrate your achievements and prepare for the next journey.',
    reversedMeaning: 'Seeking personal closure, short-cuts, delays. The completion you seek is close but not yet achieved. Persist.',
    archetype: 'The Dancer',
    astrological: 'Saturn',
    numerology: '21/3 - Complete creative expression',
    symbolism: 'The dancing figure holds wands of power. The wreath represents victory and wholeness. The four creatures are the fixed signs—completion of the zodiac.'
  }
];

// Minor Arcana - Wands (Fire)
export const WANDS: TarotCardData[] = [
  {
    id: 'wands-ace',
    name: 'Ace of Wands',
    number: 1,
    arcana: 'minor',
    suit: 'wands',
    element: 'fire',
    keywords: ['inspiration', 'new opportunities', 'growth', 'potential', 'creativity'],
    uprightMeaning: 'Inspiration, new opportunities, growth, potential. A spark of creative fire ignites. Seize this new beginning with passion and enthusiasm.',
    reversedMeaning: 'An emerging idea, lack of direction, distractions, delays. The creative spark may be blocked. Clear obstacles to let it flow.',
    symbolism: 'The hand emerging from clouds offers divine inspiration. Green leaves show life force and growth potential.'
  },
  {
    id: 'wands-2',
    name: 'Two of Wands',
    number: 2,
    arcana: 'minor',
    suit: 'wands',
    element: 'fire',
    keywords: ['planning', 'decisions', 'discovery', 'progress', 'vision'],
    uprightMeaning: 'Planning, making decisions, discovery, progress. You stand at a crossroads with the world in your hands. Plan your next bold move.',
    reversedMeaning: 'Personal goals, inner alignment, fear of unknown, lack of planning. Turn your vision inward before expanding outward.',
    symbolism: 'The figure holds a globe, representing world mastery. Looking out to sea shows contemplation of future expansion.'
  },
  {
    id: 'wands-3',
    name: 'Three of Wands',
    number: 3,
    arcana: 'minor',
    suit: 'wands',
    element: 'fire',
    keywords: ['expansion', 'foresight', 'overseas opportunities', 'progress', 'exploration'],
    uprightMeaning: 'Expansion, foresight, overseas opportunities. Your ships are coming in. Plans set in motion are bearing fruit. Expand your horizons.',
    reversedMeaning: 'Playing small, lack of foresight, unexpected delays. Obstacles may delay expansion. Review your long-term strategy.',
    symbolism: 'Ships on the horizon represent ventures sent forth returning with abundance. The elevated viewpoint shows expanded perspective.'
  },
  {
    id: 'wands-4',
    name: 'Four of Wands',
    number: 4,
    arcana: 'minor',
    suit: 'wands',
    element: 'fire',
    keywords: ['celebration', 'joy', 'harmony', 'relaxation', 'homecoming', 'community'],
    uprightMeaning: 'Celebration, joy, harmony, relaxation, homecoming. A milestone deserves celebration. Gather with loved ones and honor your achievements.',
    reversedMeaning: 'Personal celebration, inner harmony, conflict with others, transition. Find peace within even if external celebrations are delayed.',
    symbolism: 'The garland-decorated wands form a welcoming gateway. Figures celebrate beneath, showing community joy and achievement.'
  },
  {
    id: 'wands-5',
    name: 'Five of Wands',
    number: 5,
    arcana: 'minor',
    suit: 'wands',
    element: 'fire',
    keywords: ['conflict', 'competition', 'tension', 'diversity', 'disagreement'],
    uprightMeaning: 'Conflict, competition, tension, diversity. Healthy competition sharpens you, but avoid unnecessary battles. Channel conflict constructively.',
    reversedMeaning: 'Inner conflict, conflict avoidance, tension release. Internal struggles may be more significant than external ones.',
    symbolism: 'Five figures clash wands, but no one is injured—this is competitive play, not war. Diverse approaches create creative tension.'
  },
  {
    id: 'wands-6',
    name: 'Six of Wands',
    number: 6,
    arcana: 'minor',
    suit: 'wands',
    element: 'fire',
    keywords: ['success', 'public recognition', 'progress', 'self-confidence', 'victory'],
    uprightMeaning: 'Success, public recognition, progress, self-confidence. Victory is yours and others recognize your achievement. Accept acclaim gracefully.',
    reversedMeaning: 'Private achievement, personal definition of success, fall from grace. Success may be internal or delayed. Define victory for yourself.',
    symbolism: 'The rider wears a victory wreath and is celebrated by crowds. The horse shows mastery of animal instincts in service of achievement.'
  },
  {
    id: 'wands-7',
    name: 'Seven of Wands',
    number: 7,
    arcana: 'minor',
    suit: 'wands',
    element: 'fire',
    keywords: ['challenge', 'competition', 'perseverance', 'defense', 'maintaining control'],
    uprightMeaning: 'Challenge, competition, perseverance. You hold the high ground but must defend it. Stand firm in your convictions despite opposition.',
    reversedMeaning: 'Exhaustion, giving up, overwhelmed. The battle may be wearing you down. Know when to defend and when to retreat.',
    symbolism: 'The figure defends elevated position against six wands below. The mismatched shoes suggest being caught off-guard but still fighting.'
  },
  {
    id: 'wands-8',
    name: 'Eight of Wands',
    number: 8,
    arcana: 'minor',
    suit: 'wands',
    element: 'fire',
    keywords: ['movement', 'fast-paced change', 'action', 'alignment', 'air travel'],
    uprightMeaning: 'Movement, fast-paced change, action, air travel. Things are moving quickly now. Strike while the iron is hot. Swift progress is indicated.',
    reversedMeaning: 'Delays, frustration, resisting change, internal alignment. Momentum may be slowed. Use this pause to ensure proper alignment.',
    symbolism: 'Eight wands fly through clear sky—no obstacles to movement. The open landscape shows unimpeded progress.'
  },
  {
    id: 'wands-9',
    name: 'Nine of Wands',
    number: 9,
    arcana: 'minor',
    suit: 'wands',
    element: 'fire',
    keywords: ['resilience', 'courage', 'persistence', 'test of faith', 'boundaries'],
    uprightMeaning: 'Resilience, courage, persistence, boundaries. You are battle-weary but not defeated. One final push will see you through. Protect your boundaries.',
    reversedMeaning: 'Inner resources, struggle, overwhelm, defensive. Drawing on reserves. Know when persistence becomes stubbornness.',
    symbolism: 'The bandaged figure leans on a wand, guarding against further attacks. Eight wands behind show battles already survived.'
  },
  {
    id: 'wands-10',
    name: 'Ten of Wands',
    number: 10,
    arcana: 'minor',
    suit: 'wands',
    element: 'fire',
    keywords: ['burden', 'extra responsibility', 'hard work', 'completion', 'duty'],
    uprightMeaning: 'Burden, extra responsibility, hard work. You carry a heavy load, perhaps more than necessary. The destination is near—persevere.',
    reversedMeaning: 'Doing it all, carrying the burden, delegation, release. Consider what can be released or delegated. Martyrdom serves no one.',
    symbolism: 'The figure struggles under ten heavy wands but moves toward town. The burden is temporary, and rest is near.'
  },
  {
    id: 'wands-page',
    name: 'Page of Wands',
    number: 11,
    arcana: 'minor',
    suit: 'wands',
    element: 'fire',
    keywords: ['exploration', 'excitement', 'freedom', 'discovery', 'new ideas'],
    uprightMeaning: 'Exploration, excitement, freedom. A message of inspiration arrives or a young fire spirit enters your life. Embrace new adventures.',
    reversedMeaning: 'Newly-formed ideas, redirecting energy, self-limiting beliefs. Creative spark needs nurturing. Don\'t dismiss ideas prematurely.',
    symbolism: 'The young figure examines the wand with curiosity, representing the student of fire energy, eager to explore.'
  },
  {
    id: 'wands-knight',
    name: 'Knight of Wands',
    number: 12,
    arcana: 'minor',
    suit: 'wands',
    element: 'fire',
    keywords: ['energy', 'passion', 'adventure', 'impulsiveness', 'action'],
    uprightMeaning: 'Energy, passion, adventure, impulsiveness. Charge forward with courage and enthusiasm. This is a time for bold action, not careful planning.',
    reversedMeaning: 'Passion project, haste, scattered energy, delays. Impulsive energy needs direction. Channel fire without burning out.',
    symbolism: 'The knight charges forward on a rearing horse, salamanders (fire creatures) decorate the armor, showing mastery of fire energy in action.'
  },
  {
    id: 'wands-queen',
    name: 'Queen of Wands',
    number: 13,
    arcana: 'minor',
    suit: 'wands',
    element: 'fire',
    keywords: ['courage', 'confidence', 'independence', 'social butterfly', 'determination'],
    uprightMeaning: 'Courage, confidence, independence, determination. Embody the fiery queen—bold, creative, and magnetically attractive. Lead with warmth and authority.',
    reversedMeaning: 'Self-respect, self-confidence, introverted, re-establishing sense of self. Your fire may be turned inward. Reconnect with your inner radiance.',
    symbolism: 'The queen holds a sunflower (vitality) and wand (creative power). The black cat represents her intuitive, mysterious side.'
  },
  {
    id: 'wands-king',
    name: 'King of Wands',
    number: 14,
    arcana: 'minor',
    suit: 'wands',
    element: 'fire',
    keywords: ['leadership', 'vision', 'entrepreneur', 'honor', 'big picture'],
    uprightMeaning: 'Natural-born leader, vision, entrepreneur, honor. Command with integrity and inspire others. Your vision can become reality through bold leadership.',
    reversedMeaning: 'Impulsiveness, haste, ruthless, high expectations. Leadership may be overbearing or misdirected. Lead with wisdom, not just will.',
    symbolism: 'The king sits ready for action, salamanders and lions symbolize mastery of fire energy. The crown shows earned authority.'
  }
];

// Minor Arcana - Cups (Water)
export const CUPS: TarotCardData[] = [
  {
    id: 'cups-ace',
    name: 'Ace of Cups',
    number: 1,
    arcana: 'minor',
    suit: 'cups',
    element: 'water',
    keywords: ['love', 'new relationships', 'compassion', 'creativity', 'emotional beginning'],
    uprightMeaning: 'Love, new relationships, compassion, creativity. The cup overflows with emotional and spiritual abundance. Open your heart to receive.',
    reversedMeaning: 'Self-love, intuition, repressed emotions. Turn the cup inward first. Fill your own vessel before offering to others.',
    symbolism: 'The hand offers a chalice from which five streams flow (the senses). The dove represents the Holy Spirit descending into matter.'
  },
  {
    id: 'cups-2',
    name: 'Two of Cups',
    number: 2,
    arcana: 'minor',
    suit: 'cups',
    element: 'water',
    keywords: ['unified love', 'partnership', 'mutual attraction', 'connection', 'harmony'],
    uprightMeaning: 'Unified love, partnership, mutual attraction. Two hearts meet in perfect harmony. A sacred connection forms or deepens.',
    reversedMeaning: 'Self-love, break-ups, disharmony, distrust. The connection may need healing or the focus should turn to self-partnership first.',
    symbolism: 'Two figures exchange cups in a marriage-like ritual. The caduceus above shows the alchemical union of opposites.'
  },
  {
    id: 'cups-3',
    name: 'Three of Cups',
    number: 3,
    arcana: 'minor',
    suit: 'cups',
    element: 'water',
    keywords: ['celebration', 'friendship', 'creativity', 'collaborations', 'community'],
    uprightMeaning: 'Celebration, friendship, creativity, community. Gather with kindred spirits to celebrate life. Creative collaboration brings joy.',
    reversedMeaning: 'Independence, alone time, hard work, cliques. You may need solitude or feel excluded from the celebration. Honor your need for space.',
    symbolism: 'Three maidens dance in celebration, cups raised high. The harvest at their feet shows abundance shared in community.'
  },
  {
    id: 'cups-4',
    name: 'Four of Cups',
    number: 4,
    arcana: 'minor',
    suit: 'cups',
    element: 'water',
    keywords: ['meditation', 'contemplation', 'apathy', 're-evaluation', 'discontent'],
    uprightMeaning: 'Meditation, contemplation, apathy, re-evaluation. A new opportunity is offered but may go unnoticed. Look beyond current discontent.',
    reversedMeaning: 'Retreat, withdrawal, checking in with yourself. The contemplation turns inward. Use this time for genuine self-reflection.',
    symbolism: 'The figure sits under a tree, arms crossed, missing the cup being offered from the clouds. Three cups before go unappreciated.'
  },
  {
    id: 'cups-5',
    name: 'Five of Cups',
    number: 5,
    arcana: 'minor',
    suit: 'cups',
    element: 'water',
    keywords: ['regret', 'failure', 'disappointment', 'pessimism', 'grief'],
    uprightMeaning: 'Regret, failure, disappointment, pessimism. Grief is natural but don\'t let it blind you to what remains. Two cups still stand.',
    reversedMeaning: 'Personal setbacks, self-forgiveness, moving on. The time for mourning passes. Turn toward what remains.',
    symbolism: 'The cloaked figure mourns three spilled cups, not seeing two upright cups behind. The bridge offers a path forward.'
  },
  {
    id: 'cups-6',
    name: 'Six of Cups',
    number: 6,
    arcana: 'minor',
    suit: 'cups',
    element: 'water',
    keywords: ['revisiting the past', 'childhood memories', 'innocence', 'joy', 'nostalgia'],
    uprightMeaning: 'Revisiting the past, childhood memories, innocence, joy. Sweet memories surface. Reconnect with innocent happiness and share simple kindness.',
    reversedMeaning: 'Living in the past, forgiveness, lacking playfulness. Nostalgia may become escape. Bring childlike joy into the present.',
    symbolism: 'A child offers a cup of flowers to another, representing pure giving. The old house shows the comfort of the past.'
  },
  {
    id: 'cups-7',
    name: 'Seven of Cups',
    number: 7,
    arcana: 'minor',
    suit: 'cups',
    element: 'water',
    keywords: ['fantasy', 'illusion', 'wishful thinking', 'choices', 'imagination'],
    uprightMeaning: 'Fantasy, illusion, wishful thinking, choices. Many options appear—some real, some illusion. Discern fantasy from genuine opportunity.',
    reversedMeaning: 'Alignment, personal values, clarity. Illusions fade and true choices become clear. Ground dreams in reality.',
    symbolism: 'Seven cups float in clouds, each containing different visions—some desirable, some dangerous. Not all that glitters is gold.'
  },
  {
    id: 'cups-8',
    name: 'Eight of Cups',
    number: 8,
    arcana: 'minor',
    suit: 'cups',
    element: 'water',
    keywords: ['disappointment', 'abandonment', 'withdrawal', 'escapism', 'searching'],
    uprightMeaning: 'Disappointment, abandonment, walking away. Something once valued no longer satisfies. The courage to leave opens new paths.',
    reversedMeaning: 'Trying one more time, indecision, fear of change. You may not be ready to leave or need to try once more. Honor your process.',
    symbolism: 'The figure walks away from eight stacked cups under an eclipse moon. The mountain path shows the difficult journey ahead.'
  },
  {
    id: 'cups-9',
    name: 'Nine of Cups',
    number: 9,
    arcana: 'minor',
    suit: 'cups',
    element: 'water',
    keywords: ['contentment', 'satisfaction', 'gratitude', 'wish fulfilled', 'pleasure'],
    uprightMeaning: 'Contentment, satisfaction, gratitude, wish fulfilled. The "wish card"—emotional satisfaction is yours. Enjoy this moment of fulfillment.',
    reversedMeaning: 'Inner happiness, materialism, dissatisfaction. True satisfaction comes from within. Examine what brings genuine fulfillment.',
    symbolism: 'The satisfied figure sits before nine cups arranged in an arc of abundance. The smile shows contentment achieved.'
  },
  {
    id: 'cups-10',
    name: 'Ten of Cups',
    number: 10,
    arcana: 'minor',
    suit: 'cups',
    element: 'water',
    keywords: ['divine love', 'bliss', 'family', 'harmony', 'alignment', 'happiness'],
    uprightMeaning: 'Divine love, blissful relationships, harmony, alignment. The rainbow promise of lasting emotional fulfillment. Joy shared multiplies.',
    reversedMeaning: 'Disconnection, misaligned values, struggling relationships. The ideal may feel distant. Realign with your heart\'s true values.',
    symbolism: 'A family celebrates beneath a rainbow of ten cups. The home in the distance shows stability and belonging achieved.'
  },
  {
    id: 'cups-page',
    name: 'Page of Cups',
    number: 11,
    arcana: 'minor',
    suit: 'cups',
    element: 'water',
    keywords: ['creative opportunities', 'intuitive messages', 'curiosity', 'possibility'],
    uprightMeaning: 'Creative opportunities, intuitive messages, curiosity. A message of the heart arrives, perhaps unexpectedly. Stay open to emotional surprises.',
    reversedMeaning: 'New ideas, doubting intuition, creative blocks, emotional immaturity. Your inner voice speaks—are you listening?',
    symbolism: 'The young figure is surprised by a fish emerging from the cup—unexpected messages from the unconscious arrive.'
  },
  {
    id: 'cups-knight',
    name: 'Knight of Cups',
    number: 12,
    arcana: 'minor',
    suit: 'cups',
    element: 'water',
    keywords: ['creativity', 'romance', 'charm', 'imagination', 'beauty'],
    uprightMeaning: 'Creativity, romance, charm, imagination. The romantic knight arrives bearing emotional gifts. Follow your heart\'s calling.',
    reversedMeaning: 'Overactive imagination, unrealistic, jealousy. Romantic idealism may cloud judgment. Ground dreams in emotional reality.',
    symbolism: 'The knight rides slowly, cup extended like a grail offering. The winged helmet shows imagination in service of the heart.'
  },
  {
    id: 'cups-queen',
    name: 'Queen of Cups',
    number: 13,
    arcana: 'minor',
    suit: 'cups',
    element: 'water',
    keywords: ['compassion', 'calm', 'comfort', 'intuition', 'emotional security'],
    uprightMeaning: 'Compassionate, calm, comfortable in your own space. The master of emotional intelligence. Trust your deep intuition.',
    reversedMeaning: 'Inner feelings, self-care, self-love, codependency. Emotional boundaries may need strengthening. Nurture yourself first.',
    symbolism: 'The queen gazes at her ornate cup, which she alone can see inside. The angels on her throne show spiritual support.'
  },
  {
    id: 'cups-king',
    name: 'King of Cups',
    number: 14,
    arcana: 'minor',
    suit: 'cups',
    element: 'water',
    keywords: ['emotional balance', 'control', 'generosity', 'diplomacy', 'wisdom'],
    uprightMeaning: 'Emotionally balanced, compassionate, diplomatic. Master emotions without suppressing them. Lead with wisdom and empathy.',
    reversedMeaning: 'Self-compassion, emotional manipulation, moodiness. Emotional control may be excessive or lacking. Find the middle way.',
    symbolism: 'The king sits calmly on the turbulent sea, showing mastery over emotions. The fish and ship show unconscious and conscious navigation.'
  }
];

// Minor Arcana - Swords (Air)
export const SWORDS: TarotCardData[] = [
  {
    id: 'swords-ace',
    name: 'Ace of Swords',
    number: 1,
    arcana: 'minor',
    suit: 'swords',
    element: 'air',
    keywords: ['breakthrough', 'clarity', 'sharp mind', 'truth', 'new ideas'],
    uprightMeaning: 'Breakthrough, clarity, sharp mind, truth. A flash of insight cuts through confusion. Speak and act with clarity and conviction.',
    reversedMeaning: 'Inner clarity, re-thinking, clouded judgment. Mental fog needs clearing before action. Seek truth within.',
    symbolism: 'The hand holds a sword crowned with laurels and palms—victory through truth. The mountains show challenges overcome by clarity.'
  },
  {
    id: 'swords-2',
    name: 'Two of Swords',
    number: 2,
    arcana: 'minor',
    suit: 'swords',
    element: 'air',
    keywords: ['difficult decisions', 'weighing options', 'avoidance', 'stalemate', 'denial'],
    uprightMeaning: 'Difficult decisions, weighing options, stalemate. You block yourself from seeing the truth. Remove the blindfold and choose.',
    reversedMeaning: 'Indecision, confusion, information overload, releasing blocks. The stalemate breaks—be ready to act.',
    symbolism: 'The blindfolded figure balances two swords, the sea behind held at bay. Self-imposed blindness prevents resolution.'
  },
  {
    id: 'swords-3',
    name: 'Three of Swords',
    number: 3,
    arcana: 'minor',
    suit: 'swords',
    element: 'air',
    keywords: ['heartbreak', 'emotional pain', 'sorrow', 'grief', 'hurt'],
    uprightMeaning: 'Heartbreak, emotional pain, sorrow, grief. The heart is pierced by harsh truths. Allow yourself to grieve—pain acknowledged can heal.',
    reversedMeaning: 'Negative self-talk, releasing pain, forgiveness, optimism. The swords withdraw. Healing begins.',
    symbolism: 'Three swords pierce a heart against storm clouds. The rain shows cleansing tears. Truth hurts but liberates.'
  },
  {
    id: 'swords-4',
    name: 'Four of Swords',
    number: 4,
    arcana: 'minor',
    suit: 'swords',
    element: 'air',
    keywords: ['rest', 'relaxation', 'meditation', 'contemplation', 'recuperation'],
    uprightMeaning: 'Rest, relaxation, meditation, recuperation. The battle pauses—take sanctuary. Mental rest restores your edge.',
    reversedMeaning: 'Exhaustion, burn-out, deep contemplation, stagnation. Rest is not optional. Honor your need for recovery.',
    symbolism: 'The knight lies in repose in a church, three swords above, one below. Sacred rest after battle.'
  },
  {
    id: 'swords-5',
    name: 'Five of Swords',
    number: 5,
    arcana: 'minor',
    suit: 'swords',
    element: 'air',
    keywords: ['conflict', 'disagreements', 'competition', 'defeat', 'winning at all costs'],
    uprightMeaning: 'Conflict, disagreements, defeat, winning at all costs. Victory may be hollow. Consider if the battle is worth the cost.',
    reversedMeaning: 'Reconciliation, resolution, releasing conflict, forgiveness. The conflict ends. Choose peace over pride.',
    symbolism: 'The victor collects swords while others walk away defeated. The stormy sky questions whether this victory is worth celebrating.'
  },
  {
    id: 'swords-6',
    name: 'Six of Swords',
    number: 6,
    arcana: 'minor',
    suit: 'swords',
    element: 'air',
    keywords: ['transition', 'leaving behind', 'moving on', 'travel', 'recovery'],
    uprightMeaning: 'Transition, change, leaving behind, moving on. The journey toward calmer waters begins. Release what no longer serves.',
    reversedMeaning: 'Personal transition, resistance, unfinished business. The departure is delayed. Address what holds you back.',
    symbolism: 'A ferryman guides figures to calmer shores, six swords stand in the boat. Leaving troubles behind requires carrying some baggage.'
  },
  {
    id: 'swords-7',
    name: 'Seven of Swords',
    number: 7,
    arcana: 'minor',
    suit: 'swords',
    element: 'air',
    keywords: ['betrayal', 'deception', 'getting away with something', 'strategy', 'cunning'],
    uprightMeaning: 'Betrayal, deception, strategy, stealth. Someone may be acting with hidden motives—possibly yourself. Examine your integrity.',
    reversedMeaning: 'Self-deception, coming clean, confession, conscience. Secrets weigh heavily. Truth, though difficult, brings freedom.',
    symbolism: 'The figure steals five swords, leaving two behind, looking back with a sly expression. Deception rarely succeeds completely.'
  },
  {
    id: 'swords-8',
    name: 'Eight of Swords',
    number: 8,
    arcana: 'minor',
    suit: 'swords',
    element: 'air',
    keywords: ['imprisonment', 'entrapment', 'self-victimization', 'restriction', 'blindness'],
    uprightMeaning: 'Imprisonment, entrapment, self-victimization. The bonds are not as tight as they appear. Your thoughts imprison you—change them.',
    reversedMeaning: 'Self-acceptance, new perspective, freedom, release. The blindfold falls. You see the path to freedom.',
    symbolism: 'A bound, blindfolded figure stands among swords—but her feet are free and the bindings loose. Self-imposed limitations.'
  },
  {
    id: 'swords-9',
    name: 'Nine of Swords',
    number: 9,
    arcana: 'minor',
    suit: 'swords',
    element: 'air',
    keywords: ['anxiety', 'worry', 'fear', 'depression', 'nightmares'],
    uprightMeaning: 'Anxiety, worry, fear, nightmares. The mind torments itself in darkness. These fears feel real but may be exaggerated.',
    reversedMeaning: 'Inner turmoil, deep-seated fears, releasing worry, hope. Dawn approaches. Seek help if anxiety overwhelms.',
    symbolism: 'The figure sits up in bed, head in hands, nine swords on the wall. The quilt shows roses (hope) and astrological symbols (cosmic perspective).'
  },
  {
    id: 'swords-10',
    name: 'Ten of Swords',
    number: 10,
    arcana: 'minor',
    suit: 'swords',
    element: 'air',
    keywords: ['painful endings', 'deep wounds', 'betrayal', 'loss', 'rock bottom'],
    uprightMeaning: 'Painful endings, deep wounds, betrayal, loss. This is the end—and from endings come beginnings. The sunrise promises renewal.',
    reversedMeaning: 'Recovery, regeneration, resisting an inevitable end, improvement. The worst is over. Healing begins now.',
    symbolism: 'Ten swords pierce the fallen figure, but dawn breaks on the horizon. Overkill—this ending, though painful, is complete.'
  },
  {
    id: 'swords-page',
    name: 'Page of Swords',
    number: 11,
    arcana: 'minor',
    suit: 'swords',
    element: 'air',
    keywords: ['curiosity', 'restlessness', 'mental energy', 'new ideas', 'thirst for knowledge'],
    uprightMeaning: 'Curiosity, restlessness, mental energy. A message requiring swift action or a mentally sharp young person arrives. Stay alert.',
    reversedMeaning: 'Self-expression, all talk no action, scattered energy, haste. Mental energy needs grounding. Think before speaking.',
    symbolism: 'The young figure holds a sword aloft, ready for anything, hair and clouds blown by wind. Mental vigilance personified.'
  },
  {
    id: 'swords-knight',
    name: 'Knight of Swords',
    number: 12,
    arcana: 'minor',
    suit: 'swords',
    element: 'air',
    keywords: ['ambitious', 'action-oriented', 'driven', 'fast-thinking', 'assertive'],
    uprightMeaning: 'Ambitious, action-oriented, driven, fast-thinking. Charge toward your goal with clarity and determination. Swift action is favored.',
    reversedMeaning: 'Restless, unfocused, burnout, hasty decisions. The charge may be misdirected. Pause to aim before firing.',
    symbolism: 'The knight charges full speed, sword raised, into storm winds. Butterflies and birds on the armor show transformation through thought.'
  },
  {
    id: 'swords-queen',
    name: 'Queen of Swords',
    number: 13,
    arcana: 'minor',
    suit: 'swords',
    element: 'air',
    keywords: ['independent', 'unbiased', 'clear boundaries', 'direct communication', 'perceptive'],
    uprightMeaning: 'Independent, unbiased, clear boundaries, perceptive. Cut through illusion with razor truth. Communicate directly with compassion.',
    reversedMeaning: 'Overly-emotional, easily influenced, cold-hearted, cruel. The sword may wound rather than clarify. Balance truth with kindness.',
    symbolism: 'The queen raises her sword, the other hand extended in reception. The butterfly crown shows transformation through clear seeing.'
  },
  {
    id: 'swords-king',
    name: 'King of Swords',
    number: 14,
    arcana: 'minor',
    suit: 'swords',
    element: 'air',
    keywords: ['intellectual power', 'authority', 'truth', 'clear-thinking', 'judgment'],
    uprightMeaning: 'Intellectual power, authority, truth, clear thinking. Command through wisdom and justice. Your judgment is called upon.',
    reversedMeaning: 'Quiet power, inner truth, misuse of power, manipulation. Authority may be corrupted or turned inward. Seek truth, not victory.',
    symbolism: 'The king sits on his throne, sword upright, butterflies and sylphs decorating his throne. Mastery of mind and reason.'
  }
];

// Minor Arcana - Pentacles (Earth)
export const PENTACLES: TarotCardData[] = [
  {
    id: 'pentacles-ace',
    name: 'Ace of Pentacles',
    number: 1,
    arcana: 'minor',
    suit: 'pentacles',
    element: 'earth',
    keywords: ['opportunity', 'prosperity', 'new venture', 'abundance', 'manifestation'],
    uprightMeaning: 'A new financial or career opportunity, manifestation, abundance. The seed of material prosperity is offered. Plant it wisely.',
    reversedMeaning: 'Lost opportunity, lack of planning, scarcity mindset. The opportunity may be missed or requires inner abundance first.',
    symbolism: 'The hand offers a golden pentacle above a flourishing garden with an archway to mountains. Material and spiritual prosperity intertwined.'
  },
  {
    id: 'pentacles-2',
    name: 'Two of Pentacles',
    number: 2,
    arcana: 'minor',
    suit: 'pentacles',
    element: 'earth',
    keywords: ['balance', 'adaptability', 'time management', 'prioritization', 'flexibility'],
    uprightMeaning: 'Balance, adaptability, time management, flexibility. Juggle responsibilities with grace. Life requires constant rebalancing.',
    reversedMeaning: 'Over-committed, disorganization, reprioritization needed. Too many balls in the air. Some must be set down.',
    symbolism: 'The figure dances while juggling two pentacles in an infinity loop. Ships ride rough seas behind—adaptation to life\'s ups and downs.'
  },
  {
    id: 'pentacles-3',
    name: 'Three of Pentacles',
    number: 3,
    arcana: 'minor',
    suit: 'pentacles',
    element: 'earth',
    keywords: ['teamwork', 'collaboration', 'learning', 'implementation', 'craftsmanship'],
    uprightMeaning: 'Teamwork, collaboration, building, learning. Skilled work earns recognition. Collaborate with others who complement your abilities.',
    reversedMeaning: 'Disharmony, misalignment, working alone, lack of growth. The team may not be functioning. Examine collaborative dynamics.',
    symbolism: 'A craftsman shows his work to two others in an abbey. The three pentacles are integrated into the architecture—skill made manifest.'
  },
  {
    id: 'pentacles-4',
    name: 'Four of Pentacles',
    number: 4,
    arcana: 'minor',
    suit: 'pentacles',
    element: 'earth',
    keywords: ['saving money', 'security', 'conservatism', 'scarcity', 'control'],
    uprightMeaning: 'Saving, security, conservation, control. Protecting what you have is wise, but not at the cost of living. Balance security with generosity.',
    reversedMeaning: 'Over-spending, greed, self-protection, releasing control. Grip loosens—for better or worse. Examine your relationship with security.',
    symbolism: 'The figure clutches pentacles protectively, one on head, two underfoot, one embraced. The city behind is at a distance—isolation through hoarding.'
  },
  {
    id: 'pentacles-5',
    name: 'Five of Pentacles',
    number: 5,
    arcana: 'minor',
    suit: 'pentacles',
    element: 'earth',
    keywords: ['financial loss', 'poverty', 'lack mindset', 'isolation', 'worry'],
    uprightMeaning: 'Financial loss, poverty, isolation, worry. Hard times test us. Help is available—look up and seek the light in the window.',
    reversedMeaning: 'Recovery, spiritual poverty, isolation ending, positive changes. The worst passes. Healing and help arrive.',
    symbolism: 'Two figures pass a lit church window in snow, oblivious to potential sanctuary. Suffering need not be faced alone.'
  },
  {
    id: 'pentacles-6',
    name: 'Six of Pentacles',
    number: 6,
    arcana: 'minor',
    suit: 'pentacles',
    element: 'earth',
    keywords: ['giving', 'receiving', 'sharing wealth', 'generosity', 'charity'],
    uprightMeaning: 'Giving and receiving, generosity, charity, sharing wealth. Give when you can, receive when offered. Balance flows both ways.',
    reversedMeaning: 'Self-care, unpaid debts, strings attached, inequality. Examine the dynamics of giving and receiving. Is exchange fair?',
    symbolism: 'A merchant weighs coins to give to the needy. The scales show balance, but also the power dynamic between giver and receiver.'
  },
  {
    id: 'pentacles-7',
    name: 'Seven of Pentacles',
    number: 7,
    arcana: 'minor',
    suit: 'pentacles',
    element: 'earth',
    keywords: ['long-term view', 'sustainable results', 'perseverance', 'investment', 'patience'],
    uprightMeaning: 'Long-term view, perseverance, investment, patience. Seeds planted are growing. Assess progress and adjust course if needed.',
    reversedMeaning: 'Limited success, lack of growth, impatience, shortcuts. Results may disappoint. Review your investment of time and energy.',
    symbolism: 'The farmer leans on his hoe, evaluating seven pentacles growing on a bush. The work of patience and cultivation.'
  },
  {
    id: 'pentacles-8',
    name: 'Eight of Pentacles',
    number: 8,
    arcana: 'minor',
    suit: 'pentacles',
    element: 'earth',
    keywords: ['apprenticeship', 'education', 'quality', 'engagement', 'skill development'],
    uprightMeaning: 'Apprenticeship, skill development, attention to detail. Master your craft through dedicated practice. Quality over speed.',
    reversedMeaning: 'Self-development, perfectionism, lacking ambition, misdirected activity. The work may be uninspired. Reconnect with purpose.',
    symbolism: 'The craftsman works diligently, each pentacle showing increasing skill. The distant town shows withdrawal from distraction for mastery.'
  },
  {
    id: 'pentacles-9',
    name: 'Nine of Pentacles',
    number: 9,
    arcana: 'minor',
    suit: 'pentacles',
    element: 'earth',
    keywords: ['abundance', 'luxury', 'self-sufficiency', 'financial independence', 'success'],
    uprightMeaning: 'Abundance, luxury, self-sufficiency, success. You have created beauty and prosperity through your own efforts. Enjoy it.',
    reversedMeaning: 'Self-worth, overinvestment in work, financial setbacks. Success may come at a cost. Value yourself beyond achievements.',
    symbolism: 'The elegant figure stands in a vineyard of abundance, a falcon on her arm showing mastery of instincts. Self-made prosperity.'
  },
  {
    id: 'pentacles-10',
    name: 'Ten of Pentacles',
    number: 10,
    arcana: 'minor',
    suit: 'pentacles',
    element: 'earth',
    keywords: ['wealth', 'financial security', 'family', 'long-term success', 'legacy'],
    uprightMeaning: 'Wealth, financial security, family, legacy. Generational prosperity is established or inherited. Consider what you leave behind.',
    reversedMeaning: 'Financial failure, loneliness, loss, family disputes. Wealth may not bring happiness. Examine what truly constitutes prosperity.',
    symbolism: 'Three generations gather at a family estate, ten pentacles forming the Tree of Life pattern. Lasting prosperity across time.'
  },
  {
    id: 'pentacles-page',
    name: 'Page of Pentacles',
    number: 11,
    arcana: 'minor',
    suit: 'pentacles',
    element: 'earth',
    keywords: ['manifestation', 'financial opportunity', 'skill development', 'ambition'],
    uprightMeaning: 'Manifestation, financial opportunity, skill development. A message about resources or a studious young person arrives. Set practical goals.',
    reversedMeaning: 'Lack of progress, procrastination, missed opportunity, learning from failure. Ground your ambitions in practical action.',
    symbolism: 'The young figure studies a pentacle intently, surrounded by a plowed field ready for planting. Practical dreams require work.'
  },
  {
    id: 'pentacles-knight',
    name: 'Knight of Pentacles',
    number: 12,
    arcana: 'minor',
    suit: 'pentacles',
    element: 'earth',
    keywords: ['hard work', 'productivity', 'routine', 'conservatism', 'methodical'],
    uprightMeaning: 'Hard work, productivity, routine, methodical approach. Slow and steady wins the race. Your persistence will be rewarded.',
    reversedMeaning: 'Self-discipline, boredom, perfectionism, obsessiveness. Work may have become drudgery. Find meaning in the mundane.',
    symbolism: 'The knight sits on a stationary horse, contemplating a pentacle. The plowed field shows patient cultivation over flash.'
  },
  {
    id: 'pentacles-queen',
    name: 'Queen of Pentacles',
    number: 13,
    arcana: 'minor',
    suit: 'pentacles',
    element: 'earth',
    keywords: ['nurturing', 'practical', 'creature comforts', 'financial security', 'grounded'],
    uprightMeaning: 'Nurturing, practical, providing, grounded. Create sanctuary and tend to physical needs. Abundance flows through your care.',
    reversedMeaning: 'Financial independence, self-care, work-home balance, neglecting self. Nurture yourself as well as others.',
    symbolism: 'The queen sits in a flourishing garden, rabbit at her feet (fertility), pentacle cradled lovingly. Earth mother energy manifest.'
  },
  {
    id: 'pentacles-king',
    name: 'King of Pentacles',
    number: 14,
    arcana: 'minor',
    suit: 'pentacles',
    element: 'earth',
    keywords: ['wealth', 'business', 'leadership', 'security', 'abundance', 'discipline'],
    uprightMeaning: 'Wealth, business, leadership, security, discipline. Master of the material realm. Lead through practical wisdom and generosity.',
    reversedMeaning: 'Financially inept, obsessed with wealth, stubborn, materialism. Power may corrupt or be mismanaged. Ground in values beyond money.',
    symbolism: 'The king sits amid symbols of abundance—castle, grapes, bulls. His robe shows prosperity earned through wisdom and discipline.'
  }
];

// Complete deck
export const FULL_TAROT_DECK: TarotCardData[] = [
  ...MAJOR_ARCANA,
  ...WANDS,
  ...CUPS,
  ...SWORDS,
  ...PENTACLES
];

// Helper functions
export function getCardById(id: string): TarotCardData | undefined {
  return FULL_TAROT_DECK.find(card => card.id === id);
}

export function drawRandomCards(count: number, allowReversed: boolean = true): Array<TarotCardData & { reversed: boolean }> {
  const shuffled = [...FULL_TAROT_DECK].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map(card => ({
    ...card,
    reversed: allowReversed ? Math.random() > 0.5 : false
  }));
}

export function getCardsByArcana(arcana: 'major' | 'minor'): TarotCardData[] {
  return FULL_TAROT_DECK.filter(card => card.arcana === arcana);
}

export function getCardsBySuit(suit: 'wands' | 'cups' | 'swords' | 'pentacles'): TarotCardData[] {
  return FULL_TAROT_DECK.filter(card => card.suit === suit);
}

// Spread position meanings
export const SPREAD_POSITIONS = {
  'single-card': [
    { position: 1, name: 'The Message', description: 'Your guidance for this moment' }
  ],
  'three-card': [
    { position: 1, name: 'Past', description: 'What has led to this moment' },
    { position: 2, name: 'Present', description: 'Your current situation' },
    { position: 3, name: 'Future', description: 'Where this path leads' }
  ],
  'celtic-cross': [
    { position: 1, name: 'Present', description: 'Your current situation' },
    { position: 2, name: 'Challenge', description: 'What crosses you' },
    { position: 3, name: 'Foundation', description: 'The basis of the matter' },
    { position: 4, name: 'Recent Past', description: 'What is passing away' },
    { position: 5, name: 'Crown', description: 'What could be achieved' },
    { position: 6, name: 'Near Future', description: 'What is approaching' },
    { position: 7, name: 'Self', description: 'Your attitude and approach' },
    { position: 8, name: 'Environment', description: 'External influences' },
    { position: 9, name: 'Hopes/Fears', description: 'Your inner desires and worries' },
    { position: 10, name: 'Outcome', description: 'The final result' }
  ]
};
