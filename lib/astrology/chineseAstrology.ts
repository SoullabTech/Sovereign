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

// ==================== FIVE ELEMENT HOLISTIC SYSTEM ====================

/**
 * Complete Five Element mappings covering body, mind, emotions, spirit, and ancestry
 * Based on Traditional Chinese Medicine and classical astrology texts
 */
export interface ElementHolisticProfile {
  element: 'wood' | 'fire' | 'earth' | 'metal' | 'water';

  // Physical body correlations
  physical: {
    yinOrgan: string;
    yangOrgan: string;
    bodyTissue: string;
    sensoryOrgan: string;
    bodyFluid: string;
    healthTendencies: string[];
    supportPractices: string[];
  };

  // Emotional patterns
  emotional: {
    primaryEmotion: string;
    shadowEmotion: string;
    balancedExpression: string;
    imbalanceSignals: string[];
    healingPractices: string[];
  };

  // Mental qualities
  mental: {
    thinkingStyle: string;
    cognitiveStrengths: string[];
    mentalChallenges: string[];
    learningStyle: string;
    supportPractices: string[];
  };

  // Spiritual themes
  spiritual: {
    soulLesson: string;
    spiritualGift: string;
    karmicPattern: string;
    evolutionaryPath: string;
    practices: string[];
  };

  // Ancestral/lineage patterns
  ancestral: {
    lineageTheme: string;
    inheritedStrengths: string[];
    inheritedChallenges: string[];
    ancestralHealing: string;
    honoringPractices: string[];
  };
}

const ELEMENT_HOLISTIC_PROFILES: Record<string, ElementHolisticProfile> = {
  wood: {
    element: 'wood',
    physical: {
      yinOrgan: 'Liver',
      yangOrgan: 'Gallbladder',
      bodyTissue: 'Tendons and ligaments',
      sensoryOrgan: 'Eyes',
      bodyFluid: 'Tears',
      healthTendencies: [
        'Tension headaches and migraines',
        'Eye strain and vision issues',
        'Muscle tightness and tendon problems',
        'Digestive issues related to anger',
        'Menstrual irregularities (women)'
      ],
      supportPractices: [
        'Gentle stretching and yoga',
        'Walking in nature, especially forests',
        'Sour foods (lemon, vinegar) in moderation',
        'Green leafy vegetables',
        'Avoiding excessive alcohol'
      ]
    },
    emotional: {
      primaryEmotion: 'Anger / Assertion',
      shadowEmotion: 'Frustration, resentment, rage',
      balancedExpression: 'Healthy boundaries, creative drive, benevolent leadership',
      imbalanceSignals: [
        'Irritability and short temper',
        'Feeling stuck or blocked',
        'Resentment building over time',
        'Difficulty making decisions',
        'Depression from suppressed anger'
      ],
      healingPractices: [
        'Physical exercise to move stagnant energy',
        'Creative expression (art, music, writing)',
        'Journaling about frustrations',
        'Setting and honoring boundaries',
        'Forgiveness practices'
      ]
    },
    mental: {
      thinkingStyle: 'Visionary and strategic planning',
      cognitiveStrengths: ['Big-picture thinking', 'Problem-solving', 'Innovation', 'Strategic planning'],
      mentalChallenges: ['Rigidity when stressed', 'Impatience with details', 'Overthinking obstacles'],
      learningStyle: 'Visual and conceptual - learns best through seeing the whole picture first',
      supportPractices: [
        'Mind mapping and visual planning',
        'Morning planning rituals',
        'Breaking big visions into steps',
        'Collaborating with detail-oriented people'
      ]
    },
    spiritual: {
      soulLesson: 'Learning to channel creative force without domination',
      spiritualGift: 'Vision, leadership, and the ability to initiate new beginnings',
      karmicPattern: 'Past life themes around power, leadership, and the use of will',
      evolutionaryPath: 'From forceful pushing to benevolent guidance',
      practices: [
        'Spring equinox ceremonies',
        'Planting seeds with intention',
        'Working with tree spirits',
        'Dawn meditation facing east'
      ]
    },
    ancestral: {
      lineageTheme: 'Pioneers, leaders, and those who forged new paths',
      inheritedStrengths: ['Courage', 'Resilience', 'Vision', 'Determination'],
      inheritedChallenges: ['Unresolved anger', 'Authority conflicts', 'Unexpressed creativity'],
      ancestralHealing: 'Honoring ancestors who faced obstacles, releasing inherited frustration',
      honoringPractices: [
        'Planting trees or gardens in their memory',
        'Completing projects they started',
        'Channeling their vision constructively',
        'Releasing family patterns of resentment'
      ]
    }
  },
  fire: {
    element: 'fire',
    physical: {
      yinOrgan: 'Heart',
      yangOrgan: 'Small Intestine',
      bodyTissue: 'Blood vessels',
      sensoryOrgan: 'Tongue',
      bodyFluid: 'Sweat',
      healthTendencies: [
        'Heart palpitations and circulation issues',
        'Anxiety and restlessness',
        'Sleep disturbances and insomnia',
        'Speech problems when stressed',
        'Hot flashes and excessive sweating'
      ],
      supportPractices: [
        'Calming meditation and breathwork',
        'Bitter foods (dark leafy greens, coffee in moderation)',
        'Red and orange foods for heart health',
        'Avoiding overstimulation',
        'Regular sleep schedule'
      ]
    },
    emotional: {
      primaryEmotion: 'Joy / Love',
      shadowEmotion: 'Anxiety, mania, scattered energy',
      balancedExpression: 'Genuine warmth, appropriate intimacy, inspired enthusiasm',
      imbalanceSignals: [
        'Excessive excitement or manic energy',
        'Anxiety and panic attacks',
        'Difficulty with emotional intimacy',
        'Scattered attention and restlessness',
        'Emotional burnout'
      ],
      healingPractices: [
        'Heart-centered meditation',
        'Cultivating meaningful connections',
        'Laughter and play in moderation',
        'Grounding practices to balance fire',
        'Setting boundaries around energy output'
      ]
    },
    mental: {
      thinkingStyle: 'Intuitive and inspired insight',
      cognitiveStrengths: ['Quick perception', 'Charismatic communication', 'Inspiration', 'Synthesis'],
      mentalChallenges: ['Scattered focus', 'Difficulty with routine', 'Burnout from mental excitement'],
      learningStyle: 'Experiential and social - learns best through engagement and enthusiasm',
      supportPractices: [
        'Study with others or teach material',
        'Take breaks to prevent burnout',
        'Connect learning to passion',
        'Use excitement strategically'
      ]
    },
    spiritual: {
      soulLesson: 'Learning to love unconditionally without losing oneself',
      spiritualGift: 'Radiance, inspiration, and the ability to illuminate truth',
      karmicPattern: 'Past life themes around love, recognition, and spiritual leadership',
      evolutionaryPath: 'From seeking external validation to radiating inner light',
      practices: [
        'Summer solstice ceremonies',
        'Candle meditation',
        'Heart-opening yoga',
        'Noon meditation facing south'
      ]
    },
    ancestral: {
      lineageTheme: 'Performers, healers, spiritual leaders, and those who inspired others',
      inheritedStrengths: ['Charisma', 'Healing presence', 'Joy', 'Spiritual connection'],
      inheritedChallenges: ['Anxiety patterns', 'Heart conditions', 'Burnout tendencies'],
      ancestralHealing: 'Honoring ancestors who brought light, healing inherited anxiety',
      honoringPractices: [
        'Lighting candles in their memory',
        'Sharing their stories and joy',
        'Healing heart-related family patterns',
        'Carrying forward their inspiration'
      ]
    }
  },
  earth: {
    element: 'earth',
    physical: {
      yinOrgan: 'Spleen',
      yangOrgan: 'Stomach',
      bodyTissue: 'Muscles and flesh',
      sensoryOrgan: 'Mouth',
      bodyFluid: 'Saliva',
      healthTendencies: [
        'Digestive issues and bloating',
        'Blood sugar imbalances',
        'Fatigue and heaviness',
        'Muscle weakness',
        'Weight fluctuations'
      ],
      supportPractices: [
        'Regular, moderate meals',
        'Yellow and orange root vegetables',
        'Sweet foods in moderation (natural sweetness)',
        'Avoiding cold and raw foods',
        'Gentle movement after eating'
      ]
    },
    emotional: {
      primaryEmotion: 'Pensiveness / Sympathy',
      shadowEmotion: 'Worry, overthinking, neediness',
      balancedExpression: 'Nurturing care, stable support, healthy boundaries in giving',
      imbalanceSignals: [
        'Excessive worry and rumination',
        'Codependent caretaking',
        'Feeling ungrounded or scattered',
        'Difficulty receiving from others',
        'Emotional eating patterns'
      ],
      healingPractices: [
        'Grounding and centering practices',
        'Learning to receive as well as give',
        'Physical connection to earth',
        'Structured worry time (then release)',
        'Nourishing self-care routines'
      ]
    },
    mental: {
      thinkingStyle: 'Methodical and integrative processing',
      cognitiveStrengths: ['Memory', 'Synthesis', 'Practical application', 'Nurturing ideas'],
      mentalChallenges: ['Overthinking', 'Mental loops', 'Difficulty with abstraction'],
      learningStyle: 'Hands-on and repetitive - learns best through practice and integration',
      supportPractices: [
        'Study in comfortable environments',
        'Connect learning to practical use',
        'Review and repetition',
        'Teach others to solidify knowledge'
      ]
    },
    spiritual: {
      soulLesson: 'Learning to nurture without depleting, to give from abundance',
      spiritualGift: 'Grounding presence, the ability to create sacred space and stability',
      karmicPattern: 'Past life themes around service, mothering, and sustenance',
      evolutionaryPath: 'From compulsive giving to embodied abundance',
      practices: [
        'Earth-touching meditation',
        'Creating altars and sacred space',
        'Harvest ceremonies',
        'Working with crystals and stones'
      ]
    },
    ancestral: {
      lineageTheme: 'Farmers, mothers, healers, and those who sustained community',
      inheritedStrengths: ['Nurturing capacity', 'Stability', 'Practical wisdom', 'Endurance'],
      inheritedChallenges: ['Worry patterns', 'Digestive issues', 'Difficulty with boundaries'],
      ancestralHealing: 'Honoring ancestors who fed and sustained, releasing inherited worry',
      honoringPractices: [
        'Cooking ancestral recipes',
        'Tending the land or gardens',
        'Creating family gatherings',
        'Releasing patterns of excessive giving'
      ]
    }
  },
  metal: {
    element: 'metal',
    physical: {
      yinOrgan: 'Lungs',
      yangOrgan: 'Large Intestine',
      bodyTissue: 'Skin and body hair',
      sensoryOrgan: 'Nose',
      bodyFluid: 'Mucus',
      healthTendencies: [
        'Respiratory issues and allergies',
        'Skin conditions (dryness, eczema)',
        'Constipation or bowel irregularity',
        'Grief held in the body',
        'Immune system vulnerabilities'
      ],
      supportPractices: [
        'Deep breathing exercises',
        'Pungent foods (ginger, garlic, onion)',
        'White foods (rice, radish, pear)',
        'Skin brushing and care',
        'Regular bowel routine'
      ]
    },
    emotional: {
      primaryEmotion: 'Grief / Letting Go',
      shadowEmotion: 'Prolonged grief, coldness, rigidity',
      balancedExpression: 'Healthy processing of loss, discernment, appropriate boundaries',
      imbalanceSignals: [
        'Inability to let go of the past',
        'Emotional coldness or aloofness',
        'Perfectionism and harsh self-criticism',
        'Difficulty with intimacy',
        'Holding onto possessions or people'
      ],
      healingPractices: [
        'Conscious grieving rituals',
        'Decluttering and releasing possessions',
        'Breathwork for emotional release',
        'Practicing imperfection',
        'Softening rigid boundaries appropriately'
      ]
    },
    mental: {
      thinkingStyle: 'Analytical and discriminating',
      cognitiveStrengths: ['Precision', 'Analysis', 'Quality assessment', 'Structure'],
      mentalChallenges: ['Perfectionism', 'Overly critical thinking', 'Difficulty seeing nuance'],
      learningStyle: 'Structured and sequential - learns best through clear organization',
      supportPractices: [
        'Organized study environments',
        'Clear outlines and structures',
        'Quality over quantity focus',
        'Allow for "good enough"'
      ]
    },
    spiritual: {
      soulLesson: 'Learning to release what no longer serves while honoring its value',
      spiritualGift: 'Discernment, purity of intention, and connection to the divine',
      karmicPattern: 'Past life themes around loss, perfectionism, and spiritual discipline',
      evolutionaryPath: 'From rigid perfectionism to graceful refinement',
      practices: [
        'Autumn equinox ceremonies',
        'Releasing rituals',
        'Breathwork meditation',
        'Sunset meditation facing west'
      ]
    },
    ancestral: {
      lineageTheme: 'Craftspeople, priests, judges, and those who upheld standards',
      inheritedStrengths: ['Integrity', 'Craftsmanship', 'Discernment', 'Spiritual discipline'],
      inheritedChallenges: ['Unprocessed grief', 'Rigidity', 'Harsh judgment'],
      ancestralHealing: 'Honoring ancestors who held standards, releasing inherited grief',
      honoringPractices: [
        'Completing their unfinished work with quality',
        'Grieving losses they could not process',
        'Honoring their crafts and skills',
        'Releasing perfectionistic family patterns'
      ]
    }
  },
  water: {
    element: 'water',
    physical: {
      yinOrgan: 'Kidneys',
      yangOrgan: 'Bladder',
      bodyTissue: 'Bones and marrow',
      sensoryOrgan: 'Ears',
      bodyFluid: 'Urine',
      healthTendencies: [
        'Lower back pain and knee issues',
        'Urinary and reproductive issues',
        'Hearing problems',
        'Bone density concerns',
        'Adrenal fatigue'
      ],
      supportPractices: [
        'Rest and deep restoration',
        'Salty foods in moderation (sea vegetables)',
        'Black and dark blue foods (black beans, blueberries)',
        'Keeping lower back and feet warm',
        'Conserving energy, avoiding overwork'
      ]
    },
    emotional: {
      primaryEmotion: 'Fear / Wisdom',
      shadowEmotion: 'Chronic fear, paranoia, isolation',
      balancedExpression: 'Healthy caution, deep wisdom, appropriate trust',
      imbalanceSignals: [
        'Chronic anxiety or paranoia',
        'Withdrawal and isolation',
        'Fear of the unknown',
        'Difficulty trusting life',
        'Recklessness (shadow of suppressed fear)'
      ],
      healingPractices: [
        'Building safety and trust gradually',
        'Water meditation and baths',
        'Facing fears in small steps',
        'Deep rest and restoration',
        'Cultivating faith and trust'
      ]
    },
    mental: {
      thinkingStyle: 'Deep and reflective contemplation',
      cognitiveStrengths: ['Depth of thought', 'Wisdom', 'Memory', 'Philosophical insight'],
      mentalChallenges: ['Overthinking fears', 'Difficulty with action', 'Analysis paralysis'],
      learningStyle: 'Contemplative and immersive - learns best through deep study and reflection',
      supportPractices: [
        'Quiet study environments',
        'Time for deep reflection',
        'Connect learning to meaning',
        'Journaling and contemplation'
      ]
    },
    spiritual: {
      soulLesson: 'Learning to trust the flow of life while honoring appropriate caution',
      spiritualGift: 'Deep wisdom, intuition, and connection to ancestral knowledge',
      karmicPattern: 'Past life themes around survival, secrets, and hidden knowledge',
      evolutionaryPath: 'From fear-based survival to wisdom-guided flow',
      practices: [
        'Winter solstice ceremonies',
        'Water offerings and rituals',
        'Ancestor veneration',
        'Midnight meditation facing north'
      ]
    },
    ancestral: {
      lineageTheme: 'Sages, survivors, keepers of secrets and wisdom',
      inheritedStrengths: ['Resilience', 'Wisdom', 'Intuition', 'Depth'],
      inheritedChallenges: ['Fear patterns', 'Survival trauma', 'Trust issues'],
      ancestralHealing: 'Honoring ancestors who survived, releasing inherited fear',
      honoringPractices: [
        'Learning and preserving family history',
        'Healing survival trauma in the lineage',
        'Honoring their wisdom and resilience',
        'Releasing fear-based family patterns'
      ]
    }
  }
};

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
 * Get the complete holistic profile for an element
 */
export function getElementHolisticProfile(elementName: string): ElementHolisticProfile | null {
  return ELEMENT_HOLISTIC_PROFILES[elementName] || null;
}

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