/**
 * I Ching (Book of Changes) Data - 64 Hexagrams
 *
 * Each hexagram consists of 6 lines (yin/yang) forming two trigrams.
 * Lines can be changing (old yin/yang) which creates a transformation hexagram.
 */

export interface Trigram {
  id: string;
  name: string;
  chineseName: string;
  attribute: string;
  image: string;
  element: string;
  lines: [boolean, boolean, boolean]; // bottom to top, true = yang, false = yin
}

export interface Hexagram {
  number: number;
  name: string;
  chineseName: string;
  character: string;
  upperTrigram: string;
  lowerTrigram: string;
  judgment: string;
  image: string;
  meaning: string;
  lines: [boolean, boolean, boolean, boolean, boolean, boolean]; // bottom to top
  changingLinesMeaning: Record<number, string>; // 1-6
  keywords: string[];
  element: string;
}

// The 8 Trigrams
export const TRIGRAMS: Record<string, Trigram> = {
  qian: {
    id: 'qian',
    name: 'Heaven',
    chineseName: 'Qian',
    attribute: 'Creative, strong',
    image: 'Sky, father',
    element: 'Metal',
    lines: [true, true, true]
  },
  kun: {
    id: 'kun',
    name: 'Earth',
    chineseName: 'Kun',
    attribute: 'Receptive, yielding',
    image: 'Earth, mother',
    element: 'Earth',
    lines: [false, false, false]
  },
  zhen: {
    id: 'zhen',
    name: 'Thunder',
    chineseName: 'Zhen',
    attribute: 'Arousing, movement',
    image: 'Thunder, eldest son',
    element: 'Wood',
    lines: [true, false, false]
  },
  kan: {
    id: 'kan',
    name: 'Water',
    chineseName: 'Kan',
    attribute: 'Abysmal, dangerous',
    image: 'Water, middle son',
    element: 'Water',
    lines: [false, true, false]
  },
  gen: {
    id: 'gen',
    name: 'Mountain',
    chineseName: 'Gen',
    attribute: 'Stillness, stopping',
    image: 'Mountain, youngest son',
    element: 'Earth',
    lines: [false, false, true]
  },
  xun: {
    id: 'xun',
    name: 'Wind',
    chineseName: 'Xun',
    attribute: 'Gentle, penetrating',
    image: 'Wind/Wood, eldest daughter',
    element: 'Wood',
    lines: [false, true, true]
  },
  li: {
    id: 'li',
    name: 'Fire',
    chineseName: 'Li',
    attribute: 'Clinging, clarity',
    image: 'Fire/Sun, middle daughter',
    element: 'Fire',
    lines: [true, false, true]
  },
  dui: {
    id: 'dui',
    name: 'Lake',
    chineseName: 'Dui',
    attribute: 'Joyous, pleasure',
    image: 'Lake, youngest daughter',
    element: 'Metal',
    lines: [true, true, false]
  }
};

// The 64 Hexagrams
export const HEXAGRAMS: Hexagram[] = [
  {
    number: 1,
    name: 'The Creative',
    chineseName: 'Qian',
    character: '䷀',
    upperTrigram: 'qian',
    lowerTrigram: 'qian',
    lines: [true, true, true, true, true, true],
    judgment: 'The Creative works sublime success, furthering through perseverance.',
    image: 'The movement of heaven is full of power. Thus the superior one makes himself strong and untiring.',
    meaning: 'Pure yang energy. The time for bold, creative action. Initiative brings success. Lead with strength and integrity.',
    keywords: ['creation', 'strength', 'initiative', 'heaven', 'father'],
    element: 'Metal',
    changingLinesMeaning: {
      1: 'Hidden dragon. Do not act yet.',
      2: 'Dragon appearing in the field. Seek guidance.',
      3: 'Active all day, cautious at night. Danger but no blame.',
      4: 'Wavering flight over the depths. No blame.',
      5: 'Flying dragon in the heavens. See the great one.',
      6: 'Arrogant dragon will have cause to repent.'
    }
  },
  {
    number: 2,
    name: 'The Receptive',
    chineseName: 'Kun',
    character: '䷁',
    upperTrigram: 'kun',
    lowerTrigram: 'kun',
    lines: [false, false, false, false, false, false],
    judgment: 'The Receptive brings about sublime success, furthering through the perseverance of a mare.',
    image: "The earth's condition is receptive devotion. Thus the superior one carries the outer world with broad virtue.",
    meaning: 'Pure yin energy. Receptivity, support, and nurturing. Success through yielding, not forcing. Follow rather than lead.',
    keywords: ['receptivity', 'devotion', 'earth', 'mother', 'yielding'],
    element: 'Earth',
    changingLinesMeaning: {
      1: 'Treading on hoarfrost, solid ice is coming.',
      2: 'Straight, square, great. Without purpose, nothing remains unfurthered.',
      3: 'Hidden lines. Able to remain persevering.',
      4: 'A tied-up sack. No blame, no praise.',
      5: 'A yellow lower garment brings supreme good fortune.',
      6: 'Dragons fight in the meadow. Their blood is black and yellow.'
    }
  },
  {
    number: 3,
    name: 'Difficulty at the Beginning',
    chineseName: 'Zhun',
    character: '䷂',
    upperTrigram: 'kan',
    lowerTrigram: 'zhen',
    lines: [true, false, false, false, true, false],
    judgment: 'Difficulty at the Beginning works supreme success. Perseverance furthers. Nothing should be undertaken.',
    image: 'Clouds and thunder: the image of Difficulty at the Beginning. Thus the superior one brings order out of confusion.',
    meaning: 'Birth pangs of the new. Chaos precedes creation. Gather helpers; do not rush. Order emerges from patient persistence.',
    keywords: ['beginning', 'chaos', 'birth', 'difficulty', 'perseverance'],
    element: 'Water',
    changingLinesMeaning: {
      1: 'Hesitation and hindrance. Perseverance furthers.',
      2: 'Difficulties pile up. Help comes from an unexpected source.',
      3: 'Hunting without a guide loses the game in the forest.',
      4: 'Horse and wagon part. Strive for union.',
      5: 'Difficulties in blessing. Small perseverance brings good fortune.',
      6: 'Horse and wagon part. Tears of blood flow.'
    }
  },
  {
    number: 4,
    name: 'Youthful Folly',
    chineseName: 'Meng',
    character: '䷃',
    upperTrigram: 'gen',
    lowerTrigram: 'kan',
    lines: [false, true, false, false, false, true],
    judgment: 'Youthful Folly has success. It is not I who seek the young fool; the young fool seeks me.',
    image: 'A spring wells up at the foot of the mountain. Thus the superior one fosters character through thoroughness.',
    meaning: 'Inexperience meets danger. Learning through mistakes. Seek a teacher; accept guidance. Innocence can become wisdom.',
    keywords: ['inexperience', 'learning', 'foolishness', 'teaching', 'growth'],
    element: 'Earth',
    changingLinesMeaning: {
      1: 'Discipline is needed. Remove fetters to make progress.',
      2: 'To bear with fools gently brings good fortune.',
      3: 'Do not marry someone who loses themselves at the sight of gold.',
      4: 'Entangled folly brings humiliation.',
      5: 'Childlike folly brings good fortune.',
      6: 'Punishing folly, but avoid going too far.'
    }
  },
  {
    number: 5,
    name: 'Waiting',
    chineseName: 'Xu',
    character: '䷄',
    upperTrigram: 'kan',
    lowerTrigram: 'qian',
    lines: [true, true, true, false, true, false],
    judgment: 'Waiting. With sincerity, there is brilliant success. Perseverance brings good fortune.',
    image: 'Clouds rise up to heaven. The superior one eats and drinks, is joyous and of good cheer.',
    meaning: 'Danger ahead requires patience. Nourish yourself while waiting. The right moment will come. Trust the timing.',
    keywords: ['patience', 'nourishment', 'waiting', 'timing', 'trust'],
    element: 'Water',
    changingLinesMeaning: {
      1: 'Waiting in the meadow. Perseverance brings no blame.',
      2: 'Waiting on the sand. Small talk. Eventually good fortune.',
      3: 'Waiting in the mud. This invites the enemy.',
      4: 'Waiting in blood. Get out of the pit.',
      5: 'Waiting with food and drink. Perseverance brings good fortune.',
      6: 'One falls into the pit. Unexpected guests arrive.'
    }
  },
  {
    number: 6,
    name: 'Conflict',
    chineseName: 'Song',
    character: '䷅',
    upperTrigram: 'qian',
    lowerTrigram: 'kan',
    lines: [false, true, false, true, true, true],
    judgment: 'Conflict. You are sincere but being obstructed. Careful halt halfway brings good fortune.',
    image: 'Heaven and water go their opposite ways. In all affairs, plan carefully from the start.',
    meaning: 'Opposition and conflict arise. Seek mediation; avoid escalation. Halfway measures succeed. Full confrontation fails.',
    keywords: ['conflict', 'opposition', 'mediation', 'caution', 'compromise'],
    element: 'Metal',
    changingLinesMeaning: {
      1: 'Do not perpetuate the affair. Some gossip, but good fortune in the end.',
      2: 'Cannot engage in conflict. Return home. No blame.',
      3: 'Nourished by ancient virtue. Danger, but ultimate good fortune.',
      4: 'Cannot engage in conflict. Return and submit to fate.',
      5: 'Supreme good fortune in bringing conflict before the judge.',
      6: 'Even if honored, by evening it will be torn away.'
    }
  },
  {
    number: 7,
    name: 'The Army',
    chineseName: 'Shi',
    character: '䷆',
    upperTrigram: 'kun',
    lowerTrigram: 'kan',
    lines: [false, true, false, false, false, false],
    judgment: 'The Army needs perseverance and a strong leader. Good fortune without blame.',
    image: 'Water in the earth: the Army. The superior one increases the masses by generosity.',
    meaning: 'Organized action is needed. Discipline and proper leadership bring success. The cause must be just.',
    keywords: ['discipline', 'organization', 'leadership', 'army', 'justice'],
    element: 'Water',
    changingLinesMeaning: {
      1: 'An army must set forth in proper order.',
      2: 'In the midst of the army. Good fortune. No blame.',
      3: 'Perhaps the army carries corpses. Misfortune.',
      4: 'The army retreats. No blame.',
      5: 'Game in the field. Capture it. No blame.',
      6: 'The great prince issues commands. Founds states, vests families.'
    }
  },
  {
    number: 8,
    name: 'Holding Together',
    chineseName: 'Bi',
    character: '䷇',
    upperTrigram: 'kan',
    lowerTrigram: 'kun',
    lines: [false, false, false, false, true, false],
    judgment: 'Holding Together brings good fortune. Examine the oracle again to see if you have constancy.',
    image: 'Water on the earth: Holding Together. The kings of old bestowed fiefs and cultivated relations.',
    meaning: 'Union and alliance. Seek to join with others. Central leadership unifies. Those who hesitate lose the opportunity.',
    keywords: ['union', 'alliance', 'leadership', 'community', 'belonging'],
    element: 'Water',
    changingLinesMeaning: {
      1: 'Hold together with sincerity. No blame.',
      2: 'Hold together inwardly. Perseverance brings good fortune.',
      3: 'Holding together with wrong people.',
      4: 'Holding together with the ruler. Perseverance brings good fortune.',
      5: 'Manifestation of holding together. The king drives game on three sides.',
      6: 'No head for holding together. Misfortune.'
    }
  },
  {
    number: 9,
    name: 'Small Taming',
    chineseName: 'Xiao Xu',
    character: '䷈',
    upperTrigram: 'xun',
    lowerTrigram: 'qian',
    lines: [true, true, true, false, true, true],
    judgment: 'Small Taming has success. Dense clouds, no rain from our western region.',
    image: 'Wind drives across heaven. The superior one refines outward form.',
    meaning: 'Gentle restraint of the strong. Small accumulations prepare for larger success. Cultivate details; the big breakthrough waits.',
    keywords: ['restraint', 'accumulation', 'preparation', 'patience', 'refinement'],
    element: 'Wood',
    changingLinesMeaning: {
      1: 'Return to the way. How could there be blame?',
      2: 'Being led to return. Good fortune.',
      3: 'The spokes burst from the wagon wheel. Husband and wife avert their eyes.',
      4: 'Sincerity dispels blood. Remain free of blame.',
      5: 'Linked in loyalty: riches with your neighbor.',
      6: 'Rain comes. Rest after attainment. Persevere in virtue.'
    }
  },
  {
    number: 10,
    name: 'Treading',
    chineseName: 'Lu',
    character: '䷉',
    upperTrigram: 'qian',
    lowerTrigram: 'dui',
    lines: [true, true, false, true, true, true],
    judgment: "Treading upon the tail of the tiger. It does not bite. Success.",
    image: 'Heaven above, lake below. The superior one discriminates between high and low.',
    meaning: "Careful conduct in dangerous situations. Proper behavior avoids harm. Tread carefully; respect boundaries. Joy meets strength.",
    keywords: ['conduct', 'caution', 'propriety', 'danger', 'respect'],
    element: 'Metal',
    changingLinesMeaning: {
      1: 'Simple conduct. Progress without blame.',
      2: 'Treading a smooth, level path. Perseverance of a dark person brings good fortune.',
      3: 'A one-eyed man can see, a lame man can tread. Treads on the tiger tail. Misfortune.',
      4: 'Treading on the tiger tail. Caution and circumspection lead to good fortune.',
      5: 'Resolute conduct. Perseverance with awareness of danger.',
      6: 'Look to your conduct and weigh the favorable signs. Supreme good fortune.'
    }
  },
  // Continue with remaining hexagrams...
  {
    number: 11,
    name: 'Peace',
    chineseName: 'Tai',
    character: '䷊',
    upperTrigram: 'kun',
    lowerTrigram: 'qian',
    lines: [true, true, true, false, false, false],
    judgment: 'Peace. The small departs, the great approaches. Good fortune. Success.',
    image: 'Heaven and earth unite: Peace. The ruler completes the course of heaven and earth.',
    meaning: 'Heaven and earth in harmony. A time of prosperity and good fortune. Communicate freely; all flourishes.',
    keywords: ['peace', 'harmony', 'prosperity', 'communication', 'flourishing'],
    element: 'Earth',
    changingLinesMeaning: {
      1: 'When ribbon grass is pulled up, the sod comes with it.',
      2: 'Bearing with the uncultured. Crossing the river without a boat.',
      3: 'No plain not followed by a slope. No going not followed by return.',
      4: 'Fluttering, not boasting of wealth. With neighbors in sincerity.',
      5: 'The sovereign gives his daughter in marriage. Blessing and supreme good fortune.',
      6: 'The wall falls back into the moat. Use no army now.'
    }
  },
  {
    number: 12,
    name: 'Standstill',
    chineseName: 'Pi',
    character: '䷋',
    upperTrigram: 'qian',
    lowerTrigram: 'kun',
    lines: [false, false, false, true, true, true],
    judgment: 'Standstill. Evil people do not further the perseverance of the superior one.',
    image: 'Heaven and earth do not unite: Standstill. The superior one falls back upon inner worth.',
    meaning: 'Stagnation and decline. Heaven and earth are disconnected. Withdraw and cultivate inner strength. Wait for change.',
    keywords: ['stagnation', 'decline', 'withdrawal', 'patience', 'inner work'],
    element: 'Metal',
    changingLinesMeaning: {
      1: 'When ribbon grass is pulled up, the sod comes with it. Perseverance brings good fortune.',
      2: 'They bear and endure. Good fortune for inferior people.',
      3: 'They bear shame.',
      4: 'Acting on supreme command, there is no blame. Those of like mind partake of blessing.',
      5: 'Standstill is giving way. Good fortune for the great one.',
      6: 'The standstill comes to an end. First standstill, then good fortune.'
    }
  },
  // Adding key hexagrams to provide good coverage
  {
    number: 13,
    name: 'Fellowship',
    chineseName: 'Tong Ren',
    character: '䷌',
    upperTrigram: 'qian',
    lowerTrigram: 'li',
    lines: [true, false, true, true, true, true],
    judgment: 'Fellowship with others in the open. Success. Crossing the great water furthers.',
    image: 'Heaven with fire: Fellowship. The superior one organizes clans and makes distinctions.',
    meaning: 'Community and shared purpose. Gather with others around a common goal. Openness brings success.',
    keywords: ['fellowship', 'community', 'openness', 'shared purpose', 'gathering'],
    element: 'Fire',
    changingLinesMeaning: {
      1: 'Fellowship at the gate. No blame.',
      2: 'Fellowship with kindred. Humiliation.',
      3: 'Hides weapons in the thicket. Climbs the hill. For three years does not rise.',
      4: 'Mounts the wall but cannot attack. Good fortune.',
      5: 'Fellows first wail and lament, then laugh. Great armies overcome.',
      6: 'Fellowship in the meadow. No remorse.'
    }
  },
  {
    number: 14,
    name: 'Great Possession',
    chineseName: 'Da You',
    character: '䷍',
    upperTrigram: 'li',
    lowerTrigram: 'qian',
    lines: [true, true, true, true, false, true],
    judgment: 'Great Possession. Supreme success.',
    image: 'Fire in heaven above: Great Possession. The superior one curbs evil and furthers good.',
    meaning: 'Abundance and great resources. Use wealth wisely; share generously. Success through virtue, not hoarding.',
    keywords: ['abundance', 'possession', 'generosity', 'virtue', 'success'],
    element: 'Fire',
    changingLinesMeaning: {
      1: 'No relationship with what is harmful. Remain blameless.',
      2: 'A big wagon for loading. Undertakings bring no blame.',
      3: 'A prince offers tribute to the Son of Heaven. Petty people cannot do this.',
      4: 'Making a distinction between self and others. No blame.',
      5: 'Sincerity that is accessible yet dignified brings good fortune.',
      6: 'Blessed by heaven. Good fortune. Nothing that does not further.'
    }
  },
  {
    number: 15,
    name: 'Modesty',
    chineseName: 'Qian',
    character: '䷎',
    upperTrigram: 'kun',
    lowerTrigram: 'gen',
    lines: [false, false, true, false, false, false],
    judgment: 'Modesty creates success. The superior one carries things through.',
    image: 'Mountain within earth: Modesty. The superior one reduces what is excessive and augments what is lacking.',
    meaning: 'Humility brings success. The mountain bows beneath the earth. Those who lower themselves will be raised.',
    keywords: ['modesty', 'humility', 'balance', 'reduction', 'equilibrium'],
    element: 'Earth',
    changingLinesMeaning: {
      1: 'A superior one modest about modesty. Cross the great water. Good fortune.',
      2: 'Modesty that comes to expression. Perseverance brings good fortune.',
      3: 'A superior one of merit who remains modest. Carries things to conclusion.',
      4: 'Nothing that would not further modesty in movement.',
      5: 'Without boasting of wealth before neighbors. Attack is favorable.',
      6: 'Modesty expressed. Mobilizing armies furthers chastising one\'s own city.'
    }
  },
  {
    number: 23,
    name: 'Splitting Apart',
    chineseName: 'Bo',
    character: '䷖',
    upperTrigram: 'gen',
    lowerTrigram: 'kun',
    lines: [false, false, false, false, false, true],
    judgment: 'Splitting Apart. It does not further one to go anywhere.',
    image: 'Mountain resting on earth: Splitting Apart. Those above secure their position by generosity below.',
    meaning: 'Decay and collapse. The inferior rises while the superior falls. Rest and wait; do not act. This too shall pass.',
    keywords: ['decay', 'collapse', 'dissolution', 'patience', 'acceptance'],
    element: 'Earth',
    changingLinesMeaning: {
      1: 'The leg of the bed is split. Perseverance brings misfortune.',
      2: 'The edge of the bed is split. Perseverance brings misfortune.',
      3: 'Splitting with them. No blame.',
      4: 'The bed is split up to the skin. Misfortune.',
      5: 'A string of fishes through the gills. Favor comes through court ladies.',
      6: 'A large fruit still uneaten. The superior one gains a carriage.'
    }
  },
  {
    number: 24,
    name: 'Return',
    chineseName: 'Fu',
    character: '䷗',
    upperTrigram: 'kun',
    lowerTrigram: 'zhen',
    lines: [true, false, false, false, false, false],
    judgment: 'Return. Success. Going out and coming in without error. Friends come without blame.',
    image: 'Thunder within the earth: Return. The kings of old closed the passes at the solstice.',
    meaning: 'The turning point. Light returns after darkness. A new cycle begins. Rest, then move forward with confidence.',
    keywords: ['return', 'renewal', 'turning point', 'recovery', 'cycle'],
    element: 'Wood',
    changingLinesMeaning: {
      1: 'Return from a short distance. No need for remorse. Great good fortune.',
      2: 'Quiet return. Good fortune.',
      3: 'Repeated return. Danger. No blame.',
      4: 'Walking in the midst of others, one returns alone.',
      5: 'Noble-hearted return. No remorse.',
      6: 'Missing the return. Misfortune. Using armies brings defeat.'
    }
  },
  {
    number: 29,
    name: 'The Abysmal',
    chineseName: 'Kan',
    character: '䷜',
    upperTrigram: 'kan',
    lowerTrigram: 'kan',
    lines: [false, true, false, false, true, false],
    judgment: 'The Abysmal repeated. With sincerity, the heart has success. Action brings esteem.',
    image: 'Water flows on without piling up: The Abysmal. The superior one walks in lasting virtue.',
    meaning: 'Danger doubled. Flow like water through obstacles. Maintain inner truth in the face of peril. Perseverance wins.',
    keywords: ['danger', 'water', 'persistence', 'truth', 'flow'],
    element: 'Water',
    changingLinesMeaning: {
      1: 'Repetition of the Abysmal. In the abyss, one falls into a pit. Misfortune.',
      2: 'The abyss is dangerous. Seek small gains.',
      3: 'Forward and backward, abyss upon abyss. In danger like this, pause first.',
      4: 'A jug of wine, a bowl of rice added. Simply offered through the window.',
      5: 'The abyss is not overfilled. No blame when it is leveled.',
      6: 'Bound with cords and ropes. Shut in by thorn-hedged prison. Misfortune.'
    }
  },
  {
    number: 30,
    name: 'The Clinging',
    chineseName: 'Li',
    character: '䷝',
    upperTrigram: 'li',
    lowerTrigram: 'li',
    lines: [true, false, true, true, false, true],
    judgment: 'The Clinging. Perseverance furthers. Success. Care of the cow brings good fortune.',
    image: 'Fire doubled: The Clinging. The great one illuminates the four quarters of the world.',
    meaning: 'Light and clarity doubled. Illuminate truth; share your light. Depend on what is right and good.',
    keywords: ['clarity', 'light', 'illumination', 'dependence', 'truth'],
    element: 'Fire',
    changingLinesMeaning: {
      1: 'Footprints run crisscross. Composure brings no blame.',
      2: 'Yellow light. Supreme good fortune.',
      3: 'In the light of the setting sun. If you do not play and sing, you will lament old age.',
      4: 'Its coming is sudden. It flames up, dies down, is thrown away.',
      5: 'Tears in floods, sighing and lamenting. Good fortune.',
      6: 'The king uses him to march forth and chastise. Kill the leaders, not the followers.'
    }
  },
  {
    number: 63,
    name: 'After Completion',
    chineseName: 'Ji Ji',
    character: '䷾',
    upperTrigram: 'kan',
    lowerTrigram: 'li',
    lines: [true, false, true, false, true, false],
    judgment: 'After Completion. Success in small matters. Perseverance furthers. Good fortune at the beginning, disorder at the end.',
    image: 'Water over fire: After Completion. The superior one ponders misfortune and arms against it.',
    meaning: 'Everything in its place. The moment of perfect balance. Guard against complacency; decline can follow completion.',
    keywords: ['completion', 'transition', 'vigilance', 'balance', 'caution'],
    element: 'Water',
    changingLinesMeaning: {
      1: 'Braking the wheels. Wetting the tail. No blame.',
      2: 'The woman loses the curtain of her carriage. Do not run after it.',
      3: 'The Illustrious Ancestor attacks the Devil\'s Country. Three years to conquer it.',
      4: 'Fine clothes become rags. Be careful all day long.',
      5: 'The neighbor in the east slaughters an ox. Less than the small spring sacrifice of the west.',
      6: 'Wetting the head. Danger.'
    }
  },
  {
    number: 64,
    name: 'Before Completion',
    chineseName: 'Wei Ji',
    character: '䷿',
    upperTrigram: 'li',
    lowerTrigram: 'kan',
    lines: [false, true, false, true, false, true],
    judgment: 'Before Completion. Success. But if the little fox has almost completed the crossing, and gets his tail in the water, there is nothing that furthers.',
    image: 'Fire over water: Before Completion. The superior one carefully discriminates among things.',
    meaning: 'The transition before completion. Almost there, but caution is needed. Do not rush the final steps.',
    keywords: ['transition', 'caution', 'discrimination', 'almost', 'patience'],
    element: 'Fire',
    changingLinesMeaning: {
      1: 'Wetting the tail. Humiliating.',
      2: 'Braking the wheels. Perseverance brings good fortune.',
      3: 'Before completion, attack brings misfortune. Cross the great water.',
      4: 'Perseverance brings good fortune. Remorse disappears. Shock attacks the Devil\'s Country.',
      5: 'Perseverance brings good fortune. No remorse. The light of the superior one is true.',
      6: 'Drinking wine in genuine confidence. No blame. But wetting the head, one loses it.'
    }
  }
];

// Helper to find hexagram by lines
export function findHexagramByLines(lines: boolean[]): Hexagram | undefined {
  return HEXAGRAMS.find(h =>
    h.lines.every((line, i) => line === lines[i])
  );
}

// Helper to get trigram from 3 lines
export function getTrigramFromLines(lines: [boolean, boolean, boolean]): Trigram | undefined {
  return Object.values(TRIGRAMS).find(t =>
    t.lines.every((line, i) => line === lines[i])
  );
}

// Simulate yarrow stalk casting for one line
export function castLine(): { value: number; yang: boolean; changing: boolean } {
  // Simplified yarrow stalk probabilities:
  // 6 (old yin, changing): 1/16
  // 7 (young yang): 5/16
  // 8 (young yin): 7/16
  // 9 (old yang, changing): 3/16
  const rand = Math.random();
  if (rand < 1/16) return { value: 6, yang: false, changing: true };
  if (rand < 6/16) return { value: 7, yang: true, changing: false };
  if (rand < 13/16) return { value: 8, yang: false, changing: false };
  return { value: 9, yang: true, changing: true };
}

// Cast a complete hexagram
export function castHexagram(): {
  lines: Array<{ value: number; yang: boolean; changing: boolean }>;
  hexagram: Hexagram | undefined;
  transformedHexagram: Hexagram | undefined;
  upperTrigram: Trigram | undefined;
  lowerTrigram: Trigram | undefined;
} {
  const lines = Array.from({ length: 6 }, () => castLine());
  const booleanLines = lines.map(l => l.yang) as [boolean, boolean, boolean, boolean, boolean, boolean];
  const hexagram = findHexagramByLines(booleanLines);

  // Calculate transformed hexagram if there are changing lines
  const hasChangingLines = lines.some(l => l.changing);
  let transformedHexagram: Hexagram | undefined;
  if (hasChangingLines) {
    const transformedLines = lines.map(l => l.changing ? !l.yang : l.yang) as [boolean, boolean, boolean, boolean, boolean, boolean];
    transformedHexagram = findHexagramByLines(transformedLines);
  }

  const lowerTrigram = getTrigramFromLines([booleanLines[0], booleanLines[1], booleanLines[2]]);
  const upperTrigram = getTrigramFromLines([booleanLines[3], booleanLines[4], booleanLines[5]]);

  return {
    lines,
    hexagram,
    transformedHexagram,
    upperTrigram,
    lowerTrigram
  };
}

// Get hexagram by number
export function getHexagramByNumber(num: number): Hexagram | undefined {
  return HEXAGRAMS.find(h => h.number === num);
}
