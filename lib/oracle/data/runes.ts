/**
 * Elder Futhark Runes - 24 Rune Data
 *
 * The Elder Futhark is the oldest form of runic alphabets,
 * divided into three aettir (families) of 8 runes each.
 */

export interface Rune {
  id: string;
  name: string;
  letter: string;
  unicode: string;
  meaning: string;
  aett: 'freya' | 'heimdall' | 'tyr';
  aettNumber: number; // 1-8 within the aett
  element: 'fire' | 'water' | 'air' | 'earth' | 'ice';
  keywords: string[];
  upright: string;
  merkstave: string; // reversed meaning
  mythology: string;
  practical: string;
  spiritual: string;
}

export interface RuneSpread {
  id: string;
  name: string;
  runeCount: number;
  positions: Array<{
    name: string;
    meaning: string;
  }>;
}

// Freya's Aett (First Family) - Runes 1-8
// Associated with creation, fertility, and wealth
const FREYAS_AETT: Rune[] = [
  {
    id: 'fehu',
    name: 'Fehu',
    letter: 'F',
    unicode: 'ᚠ',
    meaning: 'Cattle/Wealth',
    aett: 'freya',
    aettNumber: 1,
    element: 'fire',
    keywords: ['wealth', 'abundance', 'luck', 'prosperity', 'energy'],
    upright: 'Material prosperity, earned income, luck. Wealth is flowing toward you. Use it wisely and share generously.',
    merkstave: 'Loss of property, financial setback, greed. Wealth slipping away or becoming an obsession. Reassess your relationship with material things.',
    mythology: 'Connected to the primal fire of creation and the wealth of cattle in Norse society.',
    practical: 'Financial gain, new opportunities, career advancement.',
    spiritual: 'Creative fire, life force energy, abundance consciousness.'
  },
  {
    id: 'uruz',
    name: 'Uruz',
    letter: 'U',
    unicode: 'ᚢ',
    meaning: 'Aurochs/Strength',
    aett: 'freya',
    aettNumber: 2,
    element: 'earth',
    keywords: ['strength', 'vitality', 'health', 'courage', 'endurance'],
    upright: 'Raw power, physical strength, health, courage. The wild ox charges forward. Summon your primal strength.',
    merkstave: 'Weakness, illness, lack of motivation. Vital force is blocked or depleted. Time to rest and restore.',
    mythology: 'The aurochs was a massive wild ox, symbol of untamed nature and primal power.',
    practical: 'Physical health improvements, strength to overcome obstacles.',
    spiritual: 'Life force, kundalini energy, personal power.'
  },
  {
    id: 'thurisaz',
    name: 'Thurisaz',
    letter: 'TH',
    unicode: 'ᚦ',
    meaning: 'Thorn/Giant',
    aett: 'freya',
    aettNumber: 3,
    element: 'fire',
    keywords: ['protection', 'defense', 'conflict', 'catharsis', 'regeneration'],
    upright: 'Protection, defense against enemies, breakthrough. The thorn protects and pierces. A catalyst for change.',
    merkstave: 'Danger, defenselessness, betrayal. Barriers without purpose, aggression turned inward. Beware of thorns in your path.',
    mythology: 'Associated with Thor and the frost giants. The hammer that both destroys and protects.',
    practical: 'Protection from harm, defensive action needed, conflict resolution.',
    spiritual: 'Facing shadow, transformative destruction, protective boundaries.'
  },
  {
    id: 'ansuz',
    name: 'Ansuz',
    letter: 'A',
    unicode: 'ᚨ',
    meaning: 'God/Mouth',
    aett: 'freya',
    aettNumber: 4,
    element: 'air',
    keywords: ['communication', 'wisdom', 'signals', 'inspiration', 'speech'],
    upright: 'Divine communication, wisdom, signals from the universe. Odin speaks. Listen for messages and speak your truth.',
    merkstave: 'Miscommunication, delusion, manipulation. Words twisted or unheard. Beware of deception, including self-deception.',
    mythology: "Odin's rune. He hung on Yggdrasil for nine nights to gain the wisdom of the runes.",
    practical: 'Important communications, advice worth heeding, interviews and presentations.',
    spiritual: 'Divine inspiration, channeling wisdom, connection to ancestors.'
  },
  {
    id: 'raidho',
    name: 'Raidho',
    letter: 'R',
    unicode: 'ᚱ',
    meaning: 'Ride/Journey',
    aett: 'freya',
    aettNumber: 5,
    element: 'air',
    keywords: ['journey', 'movement', 'rhythm', 'direction', 'travel'],
    upright: 'Journey, movement, rhythm of life. The road calls. Travel—physical, mental, or spiritual—brings growth.',
    merkstave: 'Disruption, standstill, wrong direction. The journey is blocked or you have lost your way. Recalibrate.',
    mythology: "Thor's chariot riding across the sky. The cosmic order and right action.",
    practical: 'Travel plans, relocation, vehicles, taking the right path.',
    spiritual: 'Soul journey, life path alignment, karmic direction.'
  },
  {
    id: 'kenaz',
    name: 'Kenaz',
    letter: 'K',
    unicode: 'ᚲ',
    meaning: 'Torch/Knowledge',
    aett: 'freya',
    aettNumber: 6,
    element: 'fire',
    keywords: ['knowledge', 'illumination', 'creativity', 'transformation', 'vision'],
    upright: 'Illumination, knowledge, creativity. The torch reveals what was hidden. Understanding dawns; create with clarity.',
    merkstave: 'Darkness, ignorance, false hope. The light is blocked or misleading. What you see may not be true.',
    mythology: 'The controlled fire of the forge and hearth, transformation through craft.',
    practical: 'Learning, creative projects, clarity on a problem, technical skill.',
    spiritual: 'Inner light, enlightenment, kundalini awakening.'
  },
  {
    id: 'gebo',
    name: 'Gebo',
    letter: 'G',
    unicode: 'ᚷ',
    meaning: 'Gift',
    aett: 'freya',
    aettNumber: 7,
    element: 'air',
    keywords: ['gift', 'partnership', 'exchange', 'generosity', 'balance'],
    upright: 'Gifts, partnerships, exchange. A gift creates a bond. Give and receive with open heart; balance is key.',
    merkstave: 'Gebo has no merkstave—the gift is always present, though its nature may vary. Consider what is being exchanged.',
    mythology: 'The sacred exchange between humans and gods, the bond of reciprocity.',
    practical: 'Contracts, partnerships, gifts received or given, mutual benefit.',
    spiritual: 'Sacrifice and offering, sacred reciprocity, divine gifts.'
  },
  {
    id: 'wunjo',
    name: 'Wunjo',
    letter: 'W/V',
    unicode: 'ᚹ',
    meaning: 'Joy',
    aett: 'freya',
    aettNumber: 8,
    element: 'earth',
    keywords: ['joy', 'harmony', 'prosperity', 'fellowship', 'ecstasy'],
    upright: 'Joy, harmony, prosperity. True happiness found. Clan fellowship, wishes fulfilled, bliss.',
    merkstave: 'Sorrow, strife, alienation. Joy is blocked or fleeting. Disharmony in relationships or within self.',
    mythology: 'The joy of the clan gathering, the fellowship of the hall.',
    practical: 'Celebrations, good news, harmonious relationships, wishes granted.',
    spiritual: 'Spiritual bliss, alignment with true will, soul satisfaction.'
  }
];

// Heimdall's Aett (Second Family) - Runes 9-16
// Associated with transformation, challenge, and growth
const HEIMDALLS_AETT: Rune[] = [
  {
    id: 'hagalaz',
    name: 'Hagalaz',
    letter: 'H',
    unicode: 'ᚺ',
    meaning: 'Hail',
    aett: 'heimdall',
    aettNumber: 1,
    element: 'ice',
    keywords: ['disruption', 'change', 'destruction', 'awakening', 'trial'],
    upright: 'Disruption, uncontrolled forces, trial. Hail destroys and clears. What seems destructive prepares the ground for new growth.',
    merkstave: 'Hagalaz has no merkstave—its nature is already challenging. The storm comes regardless; how you respond matters.',
    mythology: 'The bridge between worlds, Heimdall watching at the edge of chaos.',
    practical: 'Unexpected disruption, natural disasters, plans overturned.',
    spiritual: 'Cosmic pattern, necessary destruction, shamanic death.'
  },
  {
    id: 'nauthiz',
    name: 'Nauthiz',
    letter: 'N',
    unicode: 'ᚾ',
    meaning: 'Need/Necessity',
    aett: 'heimdall',
    aettNumber: 2,
    element: 'fire',
    keywords: ['need', 'constraint', 'necessity', 'resistance', 'survival'],
    upright: 'Need, constraint, necessity. Friction creates fire. Constraints force innovation; need drives growth.',
    merkstave: 'Poverty, hardship, deprivation. Needs unmet, resources scarce. Endure and find what is truly necessary.',
    mythology: 'The need-fire kindled in desperation, survival through scarcity.',
    practical: 'Financial constraints, delays, making do with less.',
    spiritual: 'Soul lessons through hardship, karmic necessity, shadow work.'
  },
  {
    id: 'isa',
    name: 'Isa',
    letter: 'I',
    unicode: 'ᛁ',
    meaning: 'Ice',
    aett: 'heimdall',
    aettNumber: 3,
    element: 'ice',
    keywords: ['standstill', 'ice', 'ego', 'self', 'waiting'],
    upright: 'Standstill, ice, concentration. All is frozen. A time to wait, not act. Preserve energy; clarity comes in stillness.',
    merkstave: 'Isa has no merkstave—it is already a rune of stopping. Ego may be the obstacle. What are you frozen by?',
    mythology: 'The primordial ice of Niflheim, stillness before creation.',
    practical: 'Delays, waiting period, cooling off, preservation.',
    spiritual: 'Meditation, ego examination, the self as barrier and bridge.'
  },
  {
    id: 'jera',
    name: 'Jera',
    letter: 'J/Y',
    unicode: 'ᛃ',
    meaning: 'Year/Harvest',
    aett: 'heimdall',
    aettNumber: 4,
    element: 'earth',
    keywords: ['harvest', 'cycle', 'reward', 'patience', 'timing'],
    upright: 'Harvest, cycles, reward for effort. Reap what you have sown. Patience brings fruition; honor the seasons.',
    merkstave: 'Jera has no merkstave—the cycle turns regardless. Are you planting or harvesting? Know your season.',
    mythology: 'The eternal return, the wheel of the year, seasonal festivals.',
    practical: 'Rewards arriving, project completion, cyclical timing.',
    spiritual: 'Karmic return, understanding life cycles, patience as practice.'
  },
  {
    id: 'eihwaz',
    name: 'Eihwaz',
    letter: 'E/EI',
    unicode: 'ᛇ',
    meaning: 'Yew Tree',
    aett: 'heimdall',
    aettNumber: 5,
    element: 'earth',
    keywords: ['endurance', 'protection', 'death', 'rebirth', 'connection'],
    upright: 'Endurance, protection, connection between worlds. The yew bridges life and death. Transformation through ordeal.',
    merkstave: 'Eihwaz has no merkstave—it already spans opposites. Death and life are one process. What must end?',
    mythology: 'The yew tree of the dead, Yggdrasil, shamanic journeying between worlds.',
    practical: 'Major life transitions, protection during change, resilience.',
    spiritual: 'Death/rebirth mysteries, ancestor connection, spiritual endurance.'
  },
  {
    id: 'perthro',
    name: 'Perthro',
    letter: 'P',
    unicode: 'ᛈ',
    meaning: 'Lot Cup/Mystery',
    aett: 'heimdall',
    aettNumber: 6,
    element: 'water',
    keywords: ['mystery', 'fate', 'secrets', 'divination', 'chance'],
    upright: 'Mystery, fate, hidden things revealed. The runes are cast. Secrets emerge; trust the process of revelation.',
    merkstave: 'Stagnation, loneliness, hidden illness. Secrets kept too long become toxic. What are you hiding from yourself?',
    mythology: 'The well of Wyrd, the Norns casting fate, the mystery of divination itself.',
    practical: 'Unexpected information, games of chance, hidden factors.',
    spiritual: 'Fate and free will, oracular wisdom, the mystery of existence.'
  },
  {
    id: 'algiz',
    name: 'Algiz',
    letter: 'Z',
    unicode: 'ᛉ',
    meaning: 'Elk/Protection',
    aett: 'heimdall',
    aettNumber: 7,
    element: 'air',
    keywords: ['protection', 'defense', 'awakening', 'sanctuary', 'connection'],
    upright: 'Protection, sanctuary, divine connection. The elk raises its antlers. You are protected; reach toward the divine.',
    merkstave: 'Hidden danger, vulnerability, disconnection. Protection is weakened. Beware of those who would take advantage.',
    mythology: 'The Valkyries, divine protection, the rainbow bridge to the gods.',
    practical: 'Protection needed or granted, safe haven, lucky escape.',
    spiritual: 'Higher self connection, spiritual protection, awakening.'
  },
  {
    id: 'sowilo',
    name: 'Sowilo',
    letter: 'S',
    unicode: 'ᛊ',
    meaning: 'Sun',
    aett: 'heimdall',
    aettNumber: 8,
    element: 'fire',
    keywords: ['sun', 'success', 'vitality', 'guidance', 'victory'],
    upright: 'Sun, success, life force. The sun always rises. Victory, vitality, and guidance. Follow your inner light.',
    merkstave: 'Sowilo has no merkstave—the sun cannot be reversed. But ask: are you following true light or false brilliance?',
    mythology: "The sun's chariot, guided victory, the light that defeats darkness.",
    practical: 'Success, achievement, health, clear direction.',
    spiritual: 'Enlightenment, soul purpose, divine guidance.'
  }
];

// Tyr's Aett (Third Family) - Runes 17-24
// Associated with society, justice, and higher purpose
const TYRS_AETT: Rune[] = [
  {
    id: 'tiwaz',
    name: 'Tiwaz',
    letter: 'T',
    unicode: 'ᛏ',
    meaning: 'Tyr/Victory',
    aett: 'tyr',
    aettNumber: 1,
    element: 'air',
    keywords: ['justice', 'honor', 'leadership', 'victory', 'sacrifice'],
    upright: "Justice, honor, leadership. Tyr's arrow points upward. Victory through sacrifice; lead with integrity.",
    merkstave: 'Injustice, defeat, cowardice. Honor compromised, leadership failed. What truth are you avoiding?',
    mythology: 'Tyr sacrificed his hand to bind the wolf Fenrir. The god of just war and honorable sacrifice.',
    practical: 'Legal matters, competition, leadership roles, doing the right thing.',
    spiritual: 'Spiritual warrior, self-sacrifice for higher good, cosmic justice.'
  },
  {
    id: 'berkano',
    name: 'Berkano',
    letter: 'B',
    unicode: 'ᛒ',
    meaning: 'Birch/Birth',
    aett: 'tyr',
    aettNumber: 2,
    element: 'earth',
    keywords: ['birth', 'growth', 'fertility', 'renewal', 'nurturing'],
    upright: 'Birth, growth, fertility. The birch puts forth new leaves. New beginnings, nurturing energy, gentle growth.',
    merkstave: 'Sterility, stagnation, family troubles. Growth is blocked; nurturing absent. What needs tending?',
    mythology: 'The birch goddess, the renewal of spring, feminine mysteries.',
    practical: 'Pregnancy, new projects, family matters, healing.',
    spiritual: 'Rebirth, mother goddess energy, sanctuary creation.'
  },
  {
    id: 'ehwaz',
    name: 'Ehwaz',
    letter: 'E',
    unicode: 'ᛖ',
    meaning: 'Horse',
    aett: 'tyr',
    aettNumber: 3,
    element: 'earth',
    keywords: ['partnership', 'movement', 'trust', 'loyalty', 'progress'],
    upright: 'Partnership, movement, trust. Horse and rider move as one. Progress through cooperation; trust your allies.',
    merkstave: 'Mistrust, betrayal, restlessness. Partnership strained, movement blocked. Who can you truly rely on?',
    mythology: "Odin's eight-legged horse Sleipnir, the bond between horse and rider.",
    practical: 'Travel, vehicles, partnerships, teamwork.',
    spiritual: 'Soul journey, shamanic travel, trusted guides.'
  },
  {
    id: 'mannaz',
    name: 'Mannaz',
    letter: 'M',
    unicode: 'ᛗ',
    meaning: 'Man/Humanity',
    aett: 'tyr',
    aettNumber: 4,
    element: 'air',
    keywords: ['humanity', 'self', 'community', 'cooperation', 'mortality'],
    upright: 'Humanity, the self, cooperation. We are mirrors to each other. Know yourself through community; share your gifts.',
    merkstave: 'Isolation, selfishness, mortality. Disconnected from humanity or self. What makes you human?',
    mythology: 'Ask and Embla, the first humans, created from driftwood by the gods.',
    practical: 'Social situations, self-improvement, human resources.',
    spiritual: 'Self-knowledge, human nature, the divine in the mortal.'
  },
  {
    id: 'laguz',
    name: 'Laguz',
    letter: 'L',
    unicode: 'ᛚ',
    meaning: 'Water/Lake',
    aett: 'tyr',
    aettNumber: 5,
    element: 'water',
    keywords: ['water', 'intuition', 'flow', 'dreams', 'emotion'],
    upright: 'Water, intuition, flow. Follow the current. Trust your dreams; let emotions flow and cleanse.',
    merkstave: 'Fear, confusion, drowning. Emotions overwhelming; intuition blocked. Seek solid ground.',
    mythology: 'The waters of life, the well of memory, the ocean of the unconscious.',
    practical: 'Intuitive decisions, dreams, emotional matters, water-related.',
    spiritual: 'Psychic ability, deep unconscious, purification.'
  },
  {
    id: 'ingwaz',
    name: 'Ingwaz',
    letter: 'NG',
    unicode: 'ᛝ',
    meaning: 'Ing/Fertility',
    aett: 'tyr',
    aettNumber: 6,
    element: 'earth',
    keywords: ['fertility', 'completion', 'potential', 'gestation', 'home'],
    upright: 'Fertility, completion, internal growth. The seed contains the tree. Potential gestates; completion approaches.',
    merkstave: 'Ingwaz has no merkstave—potential is always present. What is growing in you, seen or unseen?',
    mythology: 'The fertility god Ing/Freyr, the sacred marriage, abundance.',
    practical: 'Fertility, completion of projects, home and hearth.',
    spiritual: 'Spiritual gestation, potential actualized, sacred sexuality.'
  },
  {
    id: 'dagaz',
    name: 'Dagaz',
    letter: 'D',
    unicode: 'ᛞ',
    meaning: 'Day/Dawn',
    aett: 'tyr',
    aettNumber: 7,
    element: 'fire',
    keywords: ['breakthrough', 'awakening', 'clarity', 'transformation', 'balance'],
    upright: 'Breakthrough, awakening, day dawning. Light comes after darkness. Transformation complete; see with new eyes.',
    merkstave: 'Dagaz has no merkstave—day and night are one cycle. The dawn comes for all. Are you ready for the light?',
    mythology: 'The eternal balance of day and night, the moment of transformation.',
    practical: 'Breakthrough moments, clarity arriving, timing is right.',
    spiritual: 'Enlightenment, awakening, paradox resolved.'
  },
  {
    id: 'othala',
    name: 'Othala',
    letter: 'O',
    unicode: 'ᛟ',
    meaning: 'Heritage/Ancestral Property',
    aett: 'tyr',
    aettNumber: 8,
    element: 'earth',
    keywords: ['heritage', 'inheritance', 'home', 'ancestors', 'tradition'],
    upright: 'Heritage, inheritance, home. The ancestral hall awaits. Honor your roots; what you inherit shapes what you become.',
    merkstave: 'Homelessness, exile, prejudice. Cut off from roots, traditions perverted. What have you abandoned or been cast out from?',
    mythology: 'The ancestral lands, the hall of the clan, inherited wyrd.',
    practical: 'Property, inheritance, family traditions, belonging.',
    spiritual: 'Ancestral wisdom, karmic inheritance, spiritual lineage.'
  }
];

// Complete Elder Futhark
export const ELDER_FUTHARK: Rune[] = [...FREYAS_AETT, ...HEIMDALLS_AETT, ...TYRS_AETT];

// Spread configurations
export const RUNE_SPREADS: Record<string, RuneSpread> = {
  single: {
    id: 'single',
    name: 'Single Rune',
    runeCount: 1,
    positions: [
      { name: 'The Rune', meaning: 'The essence of your inquiry' }
    ]
  },
  'three-norns': {
    id: 'three-norns',
    name: 'Three Norns',
    runeCount: 3,
    positions: [
      { name: 'Urd (Past)', meaning: 'What has been, the roots of the situation' },
      { name: 'Verdandi (Present)', meaning: 'What is becoming, the present moment' },
      { name: 'Skuld (Future)', meaning: 'What shall be, the potential outcome' }
    ]
  },
  'elemental-cross': {
    id: 'elemental-cross',
    name: 'Elemental Cross',
    runeCount: 5,
    positions: [
      { name: 'Center', meaning: 'The heart of the matter' },
      { name: 'East (Air)', meaning: 'Thoughts and communication' },
      { name: 'South (Fire)', meaning: 'Passion and will' },
      { name: 'West (Water)', meaning: 'Emotions and intuition' },
      { name: 'North (Earth)', meaning: 'Material concerns and grounding' }
    ]
  },
  'week-ahead': {
    id: 'week-ahead',
    name: 'Week Ahead',
    runeCount: 7,
    positions: [
      { name: 'Sunday', meaning: "The week's theme" },
      { name: 'Monday', meaning: 'Emotions and intuition' },
      { name: 'Tuesday', meaning: 'Action and conflict' },
      { name: 'Wednesday', meaning: 'Communication and wisdom' },
      { name: 'Thursday', meaning: 'Expansion and abundance' },
      { name: 'Friday', meaning: 'Love and relationships' },
      { name: 'Saturday', meaning: 'Limitations and lessons' }
    ]
  }
};

// Helper functions
export function drawRunes(count: number, allowMerkstave: boolean = true): Array<Rune & { merkstave: boolean }> {
  const shuffled = [...ELDER_FUTHARK].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map(rune => ({
    ...rune,
    // Some runes have no merkstave (reversed meaning)
    merkstave: allowMerkstave && !['gebo', 'hagalaz', 'isa', 'jera', 'eihwaz', 'sowilo', 'ingwaz', 'dagaz'].includes(rune.id)
      ? Math.random() > 0.5
      : false
  }));
}

export function getSpread(spreadId: string): RuneSpread | undefined {
  return RUNE_SPREADS[spreadId];
}

export function drawRuneSpread(spreadId: string, allowMerkstave: boolean = true): Array<Rune & { merkstave: boolean; position: { name: string; meaning: string } }> {
  const spread = RUNE_SPREADS[spreadId];
  if (!spread) return [];

  const runes = drawRunes(spread.runeCount, allowMerkstave);
  return runes.map((rune, index) => ({
    ...rune,
    position: spread.positions[index]
  }));
}

export function getRuneByName(name: string): Rune | undefined {
  return ELDER_FUTHARK.find(r => r.name.toLowerCase() === name.toLowerCase() || r.id === name.toLowerCase());
}

export function getRunesByAett(aett: Rune['aett']): Rune[] {
  return ELDER_FUTHARK.filter(r => r.aett === aett);
}
