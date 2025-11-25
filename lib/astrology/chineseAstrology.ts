/**
 * Chinese Astrology System
 *
 * Integrates 12 zodiac animals, 5 elements, and yin/yang cycles
 * Based on lunar calendar and 60-year cycle (Sexagenary cycle)
 */

export interface ChineseZodiacAnimal {
  name: string;
  chineseName: string;
  symbol: string;
  element: 'fire' | 'earth' | 'metal' | 'water' | 'wood';
  archetype: string;
  characteristics: string[];
  strengths: string[];
  challenges: string[];
  description: string;
  compatibility: string[];
  incompatible: string[];
  luckyNumbers: number[];
  luckyColors: string[];
  direction: string;
  season: string;
}

export interface ChineseElement {
  name: 'wood' | 'fire' | 'earth' | 'metal' | 'water';
  chineseName: string;
  nature: 'yin' | 'yang';
  characteristics: string[];
  personality: string;
  color: string;
  season: string;
  direction: string;
}

export interface ChineseBirthProfile {
  animal: ChineseZodiacAnimal;
  element: ChineseElement;
  yinYang: 'yin' | 'yang';
  year: number;
  cyclePosition: number; // 1-60 in the Sexagenary cycle
  horoscope: string;
  lifeTheme: string;
  spiralogicConnection: {
    element: 'fire' | 'water' | 'earth' | 'air' | 'aether';
    pathway: string;
    integration: string;
  };
}

// Chinese Zodiac Animals (12-year cycle)
const ZODIAC_ANIMALS: ChineseZodiacAnimal[] = [
  {
    name: 'Rat',
    chineseName: '鼠',
    symbol: '🐭',
    element: 'water',
    archetype: 'The Pioneer',
    characteristics: ['clever', 'resourceful', 'versatile', 'quick-witted'],
    strengths: ['adaptable', 'charming', 'industrious', 'sociable'],
    challenges: ['restless', 'opportunistic', 'critical', 'manipulative'],
    description: 'Quick-witted and resourceful, the Rat is a natural leader with exceptional adaptability and charm.',
    compatibility: ['Dragon', 'Monkey', 'Ox'],
    incompatible: ['Horse', 'Rooster', 'Rabbit'],
    luckyNumbers: [2, 3],
    luckyColors: ['blue', 'gold', 'green'],
    direction: 'North',
    season: 'Winter'
  },
  {
    name: 'Ox',
    chineseName: '牛',
    symbol: '🐂',
    element: 'earth',
    archetype: 'The Builder',
    characteristics: ['reliable', 'strong', 'determined', 'honest'],
    strengths: ['patient', 'methodical', 'dependable', 'ambitious'],
    challenges: ['stubborn', 'narrow-minded', 'materialistic', 'demanding'],
    description: 'Steady and reliable, the Ox builds lasting foundations through patience, hard work, and unwavering determination.',
    compatibility: ['Rat', 'Snake', 'Rooster'],
    incompatible: ['Tiger', 'Dragon', 'Sheep'],
    luckyNumbers: [1, 9],
    luckyColors: ['red', 'blue', 'purple'],
    direction: 'North-Northeast',
    season: 'Winter-Spring'
  },
  {
    name: 'Tiger',
    chineseName: '虎',
    symbol: '🐅',
    element: 'wood',
    archetype: 'The Warrior',
    characteristics: ['brave', 'competitive', 'unpredictable', 'confident'],
    strengths: ['courageous', 'passionate', 'generous', 'charismatic'],
    challenges: ['impulsive', 'rebellious', 'short-tempered', 'reckless'],
    description: 'Fierce and passionate, the Tiger charges through life with courage, inspiring others through bold action.',
    compatibility: ['Dragon', 'Horse', 'Pig'],
    incompatible: ['Ox', 'Snake', 'Monkey'],
    luckyNumbers: [1, 3, 4],
    luckyColors: ['orange', 'gray', 'white'],
    direction: 'East-Northeast',
    season: 'Spring'
  },
  {
    name: 'Rabbit',
    chineseName: '兔',
    symbol: '🐰',
    element: 'wood',
    archetype: 'The Diplomat',
    characteristics: ['gentle', 'quiet', 'elegant', 'kind'],
    strengths: ['compassionate', 'modest', 'merciful', 'cautious'],
    challenges: ['moody', 'detached', 'superficial', 'melancholic'],
    description: 'Graceful and compassionate, the Rabbit brings peace and harmony through gentle wisdom and emotional intelligence.',
    compatibility: ['Sheep', 'Monkey', 'Dog', 'Pig'],
    incompatible: ['Rat', 'Dragon', 'Rooster'],
    luckyNumbers: [3, 4, 9],
    luckyColors: ['pink', 'red', 'purple', 'blue'],
    direction: 'East',
    season: 'Spring'
  },
  {
    name: 'Dragon',
    chineseName: '龙',
    symbol: '🐉',
    element: 'earth',
    archetype: 'The Visionary',
    characteristics: ['energetic', 'intelligent', 'enthusiastic', 'charismatic'],
    strengths: ['confident', 'ambitious', 'brave', 'romantic'],
    challenges: ['arrogant', 'impatient', 'critical', 'unpredictable'],
    description: 'Majestic and powerful, the Dragon soars with vision and charisma, inspiring transformation and breakthrough.',
    compatibility: ['Rat', 'Tiger', 'Snake'],
    incompatible: ['Ox', 'Rabbit', 'Dog'],
    luckyNumbers: [1, 6, 7],
    luckyColors: ['gold', 'silver', 'hoary'],
    direction: 'East-Southeast',
    season: 'Spring-Summer'
  },
  {
    name: 'Snake',
    chineseName: '蛇',
    symbol: '🐍',
    element: 'fire',
    archetype: 'The Mystic',
    characteristics: ['wise', 'enigmatic', 'intuitive', 'sophisticated'],
    strengths: ['philosophical', 'organized', 'intelligent', 'graceful'],
    challenges: ['jealous', 'suspicious', 'sly', 'fickle'],
    description: 'Mysterious and wise, the Snake moves with ancient knowledge and deep intuition, transforming through inner wisdom.',
    compatibility: ['Ox', 'Dragon', 'Rooster'],
    incompatible: ['Tiger', 'Monkey', 'Pig'],
    luckyNumbers: [2, 8, 9],
    luckyColors: ['black', 'red', 'yellow'],
    direction: 'South-Southeast',
    season: 'Summer'
  },
  {
    name: 'Horse',
    chineseName: '马',
    symbol: '🐴',
    element: 'fire',
    archetype: 'The Free Spirit',
    characteristics: ['animated', 'active', 'energetic', 'independent'],
    strengths: ['cheerful', 'skillful', 'perceptive', 'talented'],
    challenges: ['impatient', 'hot-blooded', 'reckless', 'changeable'],
    description: 'Wild and free, the Horse gallops toward adventure with infectious enthusiasm and unbridled passion for life.',
    compatibility: ['Tiger', 'Sheep', 'Dog'],
    incompatible: ['Rat', 'Ox', 'Rabbit'],
    luckyNumbers: [2, 3, 7],
    luckyColors: ['yellow', 'green'],
    direction: 'South',
    season: 'Summer'
  },
  {
    name: 'Sheep',
    chineseName: '羊',
    symbol: '🐑',
    element: 'earth',
    archetype: 'The Artist',
    characteristics: ['tender', 'polite', 'filial', 'clever'],
    strengths: ['creative', 'compassionate', 'generous', 'mild'],
    challenges: ['indecisive', 'timid', 'vain', 'pessimistic'],
    description: 'Gentle and creative, the Sheep nurtures beauty and harmony through artistic expression and emotional sensitivity.',
    compatibility: ['Rabbit', 'Horse', 'Monkey', 'Pig'],
    incompatible: ['Ox', 'Tiger', 'Dog'],
    luckyNumbers: [3, 4, 5],
    luckyColors: ['green', 'red', 'purple'],
    direction: 'South-Southwest',
    season: 'Summer-Autumn'
  },
  {
    name: 'Monkey',
    chineseName: '猴',
    symbol: '🐒',
    element: 'metal',
    archetype: 'The Trickster',
    characteristics: ['witty', 'intelligent', 'versatile', 'lively'],
    strengths: ['innovative', 'mischievous', 'clever', 'flexible'],
    challenges: ['restless', 'snobbish', 'deceptive', 'manipulative'],
    description: 'Clever and adaptable, the Monkey swings through life with wit and innovation, solving problems through creative intelligence.',
    compatibility: ['Rat', 'Rabbit', 'Sheep', 'Snake'],
    incompatible: ['Tiger', 'Snake', 'Pig'],
    luckyNumbers: [1, 8],
    luckyColors: ['white', 'blue', 'gold'],
    direction: 'West-Southwest',
    season: 'Autumn'
  },
  {
    name: 'Rooster',
    chineseName: '鸡',
    symbol: '🐓',
    element: 'metal',
    archetype: 'The Herald',
    characteristics: ['honest', 'energetic', 'intelligent', 'flamboyant'],
    strengths: ['confident', 'punctual', 'responsible', 'capable'],
    challenges: ['arrogant', 'boastful', 'selfish', 'eccentric'],
    description: 'Proud and punctual, the Rooster announces dawn with confidence, bringing order and precision to chaotic situations.',
    compatibility: ['Ox', 'Snake'],
    incompatible: ['Rat', 'Rabbit', 'Horse', 'Dog'],
    luckyNumbers: [5, 7, 8],
    luckyColors: ['gold', 'brown', 'yellow'],
    direction: 'West',
    season: 'Autumn'
  },
  {
    name: 'Dog',
    chineseName: '狗',
    symbol: '🐕',
    element: 'earth',
    archetype: 'The Guardian',
    characteristics: ['loyal', 'responsible', 'reliable', 'honest'],
    strengths: ['faithful', 'honest', 'responsible', 'reliable'],
    challenges: ['anxious', 'pessimistic', 'critical', 'conservative'],
    description: 'Loyal and protective, the Dog guards what matters most with unwavering devotion and moral integrity.',
    compatibility: ['Rabbit', 'Horse', 'Tiger'],
    incompatible: ['Dragon', 'Sheep', 'Rooster'],
    luckyNumbers: [3, 4, 9],
    luckyColors: ['red', 'green', 'purple'],
    direction: 'West-Northwest',
    season: 'Autumn-Winter'
  },
  {
    name: 'Pig',
    chineseName: '猪',
    symbol: '🐷',
    element: 'water',
    archetype: 'The Healer',
    characteristics: ['generous', 'compassionate', 'diligent', 'honest'],
    strengths: ['optimistic', 'honest', 'responsible', 'reliable'],
    challenges: ['naive', 'gullible', 'sluggish', 'short-tempered'],
    description: 'Generous and healing, the Pig offers abundance and comfort, nurturing others through unconditional love and generosity.',
    compatibility: ['Tiger', 'Rabbit', 'Sheep'],
    incompatible: ['Snake', 'Monkey'],
    luckyNumbers: [2, 5, 8],
    luckyColors: ['yellow', 'gray', 'brown', 'gold'],
    direction: 'North-Northwest',
    season: 'Winter'
  }
];

// Chinese Elements (5-element cycle)
const CHINESE_ELEMENTS: ChineseElement[] = [
  {
    name: 'wood',
    chineseName: '木',
    nature: 'yang',
    characteristics: ['growth', 'creativity', 'flexibility', 'cooperation'],
    personality: 'Idealistic, ethical, and nurturing with strong growth orientation',
    color: 'green',
    season: 'spring',
    direction: 'east'
  },
  {
    name: 'fire',
    chineseName: '火',
    nature: 'yang',
    characteristics: ['passion', 'leadership', 'dynamism', 'warmth'],
    personality: 'Charismatic, passionate, and energetic with natural leadership abilities',
    color: 'red',
    season: 'summer',
    direction: 'south'
  },
  {
    name: 'earth',
    chineseName: '土',
    nature: 'yin',
    characteristics: ['stability', 'reliability', 'practicality', 'nurturing'],
    personality: 'Grounded, reliable, and practical with natural healing abilities',
    color: 'yellow',
    season: 'late summer',
    direction: 'center'
  },
  {
    name: 'metal',
    chineseName: '金',
    nature: 'yin',
    characteristics: ['structure', 'determination', 'precision', 'strength'],
    personality: 'Disciplined, organized, and precise with strong moral principles',
    color: 'white',
    season: 'autumn',
    direction: 'west'
  },
  {
    name: 'water',
    chineseName: '水',
    nature: 'yin',
    characteristics: ['adaptability', 'wisdom', 'intuition', 'flow'],
    personality: 'Intuitive, wise, and adaptable with deep emotional intelligence',
    color: 'black/blue',
    season: 'winter',
    direction: 'north'
  }
];

/**
 * Calculate Chinese zodiac animal based on year
 * Note: Chinese New Year starts between Jan 21 - Feb 20, so early year births may be previous animal
 */
export function getChineseZodiacAnimal(year: number): ChineseZodiacAnimal {
  // Base year for calculations (Year of the Rat)
  const baseYear = 1924; // Year of the Rat in 20th century
  const animalIndex = (year - baseYear) % 12;
  return ZODIAC_ANIMALS[animalIndex < 0 ? animalIndex + 12 : animalIndex];
}

/**
 * Calculate Chinese element based on year (2-year cycles)
 */
export function getChineseElement(year: number): ChineseElement {
  // Elements cycle every 2 years, starting with Wood
  const elementCycle = ['wood', 'wood', 'fire', 'fire', 'earth', 'earth', 'metal', 'metal', 'water', 'water'];
  const elementIndex = (year - 1924) % 10;
  const elementName = elementCycle[elementIndex < 0 ? elementIndex + 10 : elementIndex] as 'wood' | 'fire' | 'earth' | 'metal' | 'water';
  return CHINESE_ELEMENTS.find(e => e.name === elementName)!;
}

/**
 * Determine yin/yang nature of year
 */
export function getYinYang(year: number): 'yin' | 'yang' {
  return year % 2 === 0 ? 'yang' : 'yin';
}

/**
 * Calculate position in 60-year Sexagenary cycle
 */
export function getSexagenaryPosition(year: number): number {
  return ((year - 1924) % 60) + 1;
}

/**
 * Map Chinese elements to Spiralogic elements
 */
function mapToSpiralogicElement(chineseElement: string): { element: 'fire' | 'water' | 'earth' | 'air' | 'aether', pathway: string } {
  const mapping = {
    wood: { element: 'air' as const, pathway: 'Growth and Communication' },
    fire: { element: 'fire' as const, pathway: 'Vision and Passion' },
    earth: { element: 'earth' as const, pathway: 'Grounding and Manifestation' },
    metal: { element: 'aether' as const, pathway: 'Structure and Transcendence' },
    water: { element: 'water' as const, pathway: 'Flow and Emotion' }
  };
  return mapping[chineseElement as keyof typeof mapping] || mapping.earth;
}

/**
 * Calculate complete Chinese astrology profile
 */
export function calculateChineseBirthProfile(birthDate: Date): ChineseBirthProfile {
  const year = birthDate.getFullYear();

  // Adjust for Chinese New Year (simplified - assumes Jan 1 start)
  // In a full implementation, you'd calculate exact Chinese New Year dates
  const adjustedYear = year;

  const animal = getChineseZodiacAnimal(adjustedYear);
  const element = getChineseElement(adjustedYear);
  const yinYang = getYinYang(adjustedYear);
  const cyclePosition = getSexagenaryPosition(adjustedYear);

  const spiralogicConnection = mapToSpiralogicElement(element.name);

  return {
    animal,
    element,
    yinYang,
    year: adjustedYear,
    cyclePosition,
    horoscope: `${element.name.charAt(0).toUpperCase() + element.name.slice(1)} ${animal.name}`,
    lifeTheme: `The ${animal.archetype} walking the ${element.name} path`,
    spiralogicConnection: {
      ...spiralogicConnection,
      integration: `Your Chinese ${element.name} ${animal.name} energy flows through the Spiralogic ${spiralogicConnection.element} pathway, bridging ancient Eastern wisdom with modern consciousness work.`
    }
  };
}

/**
 * Get compatibility analysis between two Chinese signs
 */
export function getCompatibilityAnalysis(sign1: ChineseBirthProfile, sign2: ChineseBirthProfile): {
  compatibility: 'excellent' | 'good' | 'moderate' | 'challenging';
  analysis: string;
  strengths: string[];
  challenges: string[];
} {
  const isCompatible = sign1.animal.compatibility.includes(sign2.animal.name);
  const isIncompatible = sign1.animal.incompatible.includes(sign2.animal.name);

  // Element compatibility (generative/destructive cycles)
  const elementCycles = {
    wood: { generates: 'fire', destroys: 'earth' },
    fire: { generates: 'earth', destroys: 'metal' },
    earth: { generates: 'metal', destroys: 'water' },
    metal: { generates: 'water', destroys: 'wood' },
    water: { generates: 'wood', destroys: 'fire' }
  };

  const element1 = sign1.element.name;
  const element2 = sign2.element.name;
  const elementCompatible = elementCycles[element1].generates === element2 || elementCycles[element2].generates === element1;
  const elementConflict = elementCycles[element1].destroys === element2 || elementCycles[element2].destroys === element1;

  let compatibility: 'excellent' | 'good' | 'moderate' | 'challenging';

  if (isCompatible && elementCompatible) compatibility = 'excellent';
  else if (isCompatible || elementCompatible) compatibility = 'good';
  else if (isIncompatible || elementConflict) compatibility = 'challenging';
  else compatibility = 'moderate';

  return {
    compatibility,
    analysis: `${sign1.animal.name} and ${sign2.animal.name} have ${compatibility} compatibility, with ${element1} and ${element2} elements ${elementCompatible ? 'supporting' : elementConflict ? 'challenging' : 'neutral to'} each other.`,
    strengths: [
      ...(isCompatible ? [`Natural harmony between ${sign1.animal.name} and ${sign2.animal.name}`] : []),
      ...(elementCompatible ? [`${element1} and ${element2} elements support each other's growth`] : [])
    ],
    challenges: [
      ...(isIncompatible ? [`Potential tension between ${sign1.animal.name} and ${sign2.animal.name} energies`] : []),
      ...(elementConflict ? [`${element1} and ${element2} elements may create friction`] : [])
    ]
  };
}

/**
 * Get current year's Chinese astrology energy
 */
export function getCurrentYearEnergy(): ChineseBirthProfile {
  const currentYear = new Date().getFullYear();
  return calculateChineseBirthProfile(new Date(currentYear, 0, 1));
}