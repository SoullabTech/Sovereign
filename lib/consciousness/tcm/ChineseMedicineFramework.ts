/**
 * Traditional Chinese Medicine Framework
 *
 * Bridges TCM with Western psychological frameworks for cross-system synthesis.
 * Enables practitioners to see patterns through multiple wisdom traditions.
 *
 * Core Systems:
 * - Wu Xing (Five Elements): Wood, Fire, Earth, Metal, Water
 * - Zang-Fu (Organ Theory): Yin/Yang organ pairs
 * - Wu Shen (Five Spirits): Shen, Hun, Po, Yi, Zhi
 * - Eight Principles: Yin/Yang, Interior/Exterior, Cold/Hot, Deficiency/Excess
 * - Pathogenic Factors: Wind, Cold, Summer Heat, Dampness, Dryness, Fire
 */

// ─────────────────────────────────────────────────────────────────────────────
// Five Elements (Wu Xing) - Core System
// ─────────────────────────────────────────────────────────────────────────────

export type TCMElement = 'wood' | 'fire' | 'earth' | 'metal' | 'water';

export interface ElementCorrespondences {
  element: TCMElement;
  chineseName: string;
  yinOrgan: string;        // Zang (solid)
  yangOrgan: string;       // Fu (hollow)
  emotion: string;         // Primary emotion when balanced
  emotionExcess: string;   // When element is in excess
  emotionDeficiency: string; // When element is deficient
  spirit: string;          // Wu Shen spirit
  sense: string;           // Sense organ
  tissue: string;          // Body tissue governed
  color: string;           // Diagnostic color
  sound: string;           // Voice quality
  odor: string;            // Body odor
  taste: string;           // Flavor affinity
  season: string;
  climate: string;         // Pathogenic climate
  direction: string;
  time: string;            // Peak hours (organ clock)
  lifeStage: string;
  virtue: string;          // De (virtue) when balanced
}

export const FIVE_ELEMENTS: Record<TCMElement, ElementCorrespondences> = {
  wood: {
    element: 'wood',
    chineseName: '木 (Mù)',
    yinOrgan: 'Liver (肝 Gān)',
    yangOrgan: 'Gallbladder (膽 Dǎn)',
    emotion: 'healthy assertion',
    emotionExcess: 'anger, rage, frustration',
    emotionDeficiency: 'depression, lack of direction',
    spirit: 'Hun (魂) - Ethereal Soul',
    sense: 'eyes/vision',
    tissue: 'sinews/tendons',
    color: 'green',
    sound: 'shouting',
    odor: 'rancid',
    taste: 'sour',
    season: 'spring',
    climate: 'wind',
    direction: 'east',
    time: '11pm-3am (Gallbladder 11-1, Liver 1-3)',
    lifeStage: 'birth/childhood',
    virtue: 'benevolence (仁 Rén)'
  },
  fire: {
    element: 'fire',
    chineseName: '火 (Huǒ)',
    yinOrgan: 'Heart (心 Xīn)',
    yangOrgan: 'Small Intestine (小腸 Xiǎo Cháng)',
    emotion: 'joy, love, connection',
    emotionExcess: 'mania, excessive excitement',
    emotionDeficiency: 'lack of joy, emotional flatness',
    spirit: 'Shen (神) - Spirit/Mind',
    sense: 'tongue/speech',
    tissue: 'blood vessels',
    color: 'red',
    sound: 'laughing',
    odor: 'scorched',
    taste: 'bitter',
    season: 'summer',
    climate: 'heat',
    direction: 'south',
    time: '11am-3pm (Heart 11-1, SI 1-3)',
    lifeStage: 'youth/growth',
    virtue: 'propriety (禮 Lǐ)'
  },
  earth: {
    element: 'earth',
    chineseName: '土 (Tǔ)',
    yinOrgan: 'Spleen (脾 Pí)',
    yangOrgan: 'Stomach (胃 Wèi)',
    emotion: 'pensiveness, caring, empathy',
    emotionExcess: 'worry, overthinking, rumination',
    emotionDeficiency: 'inability to nurture self/others',
    spirit: 'Yi (意) - Intellect/Intention',
    sense: 'mouth/taste',
    tissue: 'flesh/muscles',
    color: 'yellow',
    sound: 'singing',
    odor: 'fragrant/sweet',
    taste: 'sweet',
    season: 'late summer',
    climate: 'dampness',
    direction: 'center',
    time: '7am-11am (Stomach 7-9, Spleen 9-11)',
    lifeStage: 'maturity',
    virtue: 'integrity (信 Xìn)'
  },
  metal: {
    element: 'metal',
    chineseName: '金 (Jīn)',
    yinOrgan: 'Lung (肺 Fèi)',
    yangOrgan: 'Large Intestine (大腸 Dà Cháng)',
    emotion: 'appropriate grief, letting go',
    emotionExcess: 'prolonged grief, inability to let go',
    emotionDeficiency: 'emotional numbness, detachment',
    spirit: 'Po (魄) - Corporeal Soul',
    sense: 'nose/smell',
    tissue: 'skin/body hair',
    color: 'white',
    sound: 'weeping',
    odor: 'rotten',
    taste: 'pungent/spicy',
    season: 'autumn',
    climate: 'dryness',
    direction: 'west',
    time: '3am-7am (Lung 3-5, LI 5-7)',
    lifeStage: 'harvest/decline',
    virtue: 'righteousness (義 Yì)'
  },
  water: {
    element: 'water',
    chineseName: '水 (Shuǐ)',
    yinOrgan: 'Kidney (腎 Shèn)',
    yangOrgan: 'Bladder (膀胱 Páng Guāng)',
    emotion: 'appropriate caution, wisdom',
    emotionExcess: 'fear, paranoia, terror',
    emotionDeficiency: 'recklessness, foolhardiness',
    spirit: 'Zhi (志) - Will/Willpower',
    sense: 'ears/hearing',
    tissue: 'bones/marrow',
    color: 'black/dark blue',
    sound: 'groaning',
    odor: 'putrid',
    taste: 'salty',
    season: 'winter',
    climate: 'cold',
    direction: 'north',
    time: '3pm-7pm (Bladder 3-5, Kidney 5-7)',
    lifeStage: 'old age/death',
    virtue: 'wisdom (智 Zhì)'
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Element Cycles
// ─────────────────────────────────────────────────────────────────────────────

export const GENERATION_CYCLE: Record<TCMElement, TCMElement> = {
  wood: 'fire',   // Wood feeds Fire
  fire: 'earth',  // Fire creates Earth (ash)
  earth: 'metal', // Earth bears Metal
  metal: 'water', // Metal collects Water
  water: 'wood'   // Water nourishes Wood
};

export const CONTROL_CYCLE: Record<TCMElement, TCMElement> = {
  wood: 'earth',  // Wood controls Earth (roots)
  fire: 'metal',  // Fire controls Metal (melts)
  earth: 'water', // Earth controls Water (dams)
  metal: 'wood',  // Metal controls Wood (cuts)
  water: 'fire'   // Water controls Fire (extinguishes)
};

export const INSULT_CYCLE: Record<TCMElement, TCMElement> = {
  // Reverse of control - when controlled element rebels
  earth: 'wood',
  metal: 'fire',
  water: 'earth',
  wood: 'metal',
  fire: 'water'
};

// ─────────────────────────────────────────────────────────────────────────────
// Five Spirits (Wu Shen) - Psychological Core
// ─────────────────────────────────────────────────────────────────────────────

export interface SpiritState {
  spirit: string;
  chineseName: string;
  element: TCMElement;
  organ: string;
  nature: string;
  functions: string[];
  balancedExpression: string[];
  disturbedExpression: string[];
  therapeuticApproach: string[];
  // Cross-framework correlations
  jungianCorrelation: string;
  ifsCorrelation: string;
  polyvagalCorrelation: string;
  somaticCorrelation: string;
}

export const FIVE_SPIRITS: Record<string, SpiritState> = {
  shen: {
    spirit: 'Shen',
    chineseName: '神',
    element: 'fire',
    organ: 'Heart',
    nature: 'The Emperor - consciousness, awareness, presence',
    functions: [
      'Houses consciousness and awareness',
      'Governs mental activity and cognition',
      'Controls emotional responsiveness',
      'Manifests in the eyes (brightness)',
      'Coordinates all other spirits'
    ],
    balancedExpression: [
      'Clear thinking, good memory',
      'Appropriate emotional responses',
      'Peaceful sleep, vivid but not disturbing dreams',
      'Bright eyes, radiant complexion',
      'Joyful connection with others'
    ],
    disturbedExpression: [
      'Anxiety, restlessness, insomnia',
      'Confused thinking, poor memory',
      'Inappropriate emotional responses',
      'Mania or depression',
      'Dull eyes, disturbed speech'
    ],
    therapeuticApproach: [
      'Calm and anchor the Shen',
      'Nourish Heart blood and yin',
      'Clear Heart fire if excess',
      'Restore Heart-Kidney axis'
    ],
    jungianCorrelation: 'Ego consciousness, Self connection',
    ifsCorrelation: 'Self-energy, the witnessing presence',
    polyvagalCorrelation: 'Ventral vagal - social engagement',
    somaticCorrelation: 'Presence, groundedness, orientation'
  },
  hun: {
    spirit: 'Hun',
    chineseName: '魂',
    element: 'wood',
    organ: 'Liver',
    nature: 'The Ethereal Soul - dreams, vision, creativity',
    functions: [
      'Gives the mind capacity to plan and dream',
      'Houses imagination and creativity',
      'Provides sense of direction and purpose',
      'Roams at night, creating dreams',
      'Survives death, returns to heaven'
    ],
    balancedExpression: [
      'Clear life direction and purpose',
      'Rich dream life with meaning',
      'Creativity and imagination',
      'Flexibility and adaptability',
      'Healthy assertion and boundaries'
    ],
    disturbedExpression: [
      'Aimlessness, lack of direction',
      'Nightmares, sleep disturbances',
      'Depression, creative block',
      'Anger, rage, frustration',
      'Inability to make decisions'
    ],
    therapeuticApproach: [
      'Smooth Liver Qi, resolve stagnation',
      'Anchor the Hun at night',
      'Nourish Liver blood',
      'Clear Liver fire if rising'
    ],
    jungianCorrelation: 'Anima/Animus, creative unconscious',
    ifsCorrelation: 'Parts carrying vision, blocked creativity',
    polyvagalCorrelation: 'Sympathetic - mobilization (fight/flight)',
    somaticCorrelation: 'Incomplete fight response, jaw/shoulder tension'
  },
  po: {
    spirit: 'Po',
    chineseName: '魄',
    element: 'metal',
    organ: 'Lung',
    nature: 'The Corporeal Soul - instinct, sensation, attachment',
    functions: [
      'Animates the body at birth',
      'Governs physical sensations',
      'Manages autonomic functions',
      'Provides instinctual responses',
      'Returns to earth at death'
    ],
    balancedExpression: [
      'Healthy physical vitality',
      'Clear sensory perception',
      'Appropriate grief and letting go',
      'Strong immune response',
      'Healthy skin and boundaries'
    ],
    disturbedExpression: [
      'Physical numbness or hypersensitivity',
      'Prolonged or stuck grief',
      'Skin conditions, respiratory issues',
      'Weak boundaries, taking on others\' energy',
      'Excessive attachment to the physical'
    ],
    therapeuticApproach: [
      'Strengthen Lung Qi',
      'Clear grief and release attachment',
      'Strengthen Wei Qi (defensive)',
      'Support breathing and embodiment'
    ],
    jungianCorrelation: 'Body-Self, somatic unconscious',
    ifsCorrelation: 'Firefighters (quick somatic reactions)',
    polyvagalCorrelation: 'Dorsal vagal - freeze, shutdown',
    somaticCorrelation: 'Breath holding, chest collapse, freeze'
  },
  yi: {
    spirit: 'Yi',
    chineseName: '意',
    element: 'earth',
    organ: 'Spleen',
    nature: 'The Intellect - thought, intention, nourishment',
    functions: [
      'Governs thinking and studying',
      'Holds intention and focus',
      'Transforms information into understanding',
      'Connects to nourishment and mothering',
      'Creates a sense of home and center'
    ],
    balancedExpression: [
      'Clear thinking, good concentration',
      'Ability to study and learn',
      'Healthy self-nourishment',
      'Feeling centered and grounded',
      'Appropriate concern for others'
    ],
    disturbedExpression: [
      'Worry, rumination, overthinking',
      'Obsessive thoughts, mental fog',
      'Eating disorders, digestive issues',
      'Feeling ungrounded, homeless',
      'Codependency, over-caring'
    ],
    therapeuticApproach: [
      'Strengthen Spleen Qi',
      'Transform dampness',
      'Regulate Earth element',
      'Establish healthy nourishment patterns'
    ],
    jungianCorrelation: 'Thinking function, Mother complex',
    ifsCorrelation: 'Managers (controlling, worrying parts)',
    polyvagalCorrelation: 'Mixed state - worry loop',
    somaticCorrelation: 'Gut tension, digestive holding, center collapse'
  },
  zhi: {
    spirit: 'Zhi',
    chineseName: '志',
    element: 'water',
    organ: 'Kidney',
    nature: 'The Will - drive, determination, primal essence',
    functions: [
      'Houses willpower and determination',
      'Stores ancestral essence (Jing)',
      'Provides constitutional strength',
      'Governs fear and survival instinct',
      'Connects to destiny and purpose'
    ],
    balancedExpression: [
      'Strong willpower and determination',
      'Appropriate caution without fear',
      'Deep reserves of energy',
      'Connection to ancestral wisdom',
      'Sense of destiny and purpose'
    ],
    disturbedExpression: [
      'Fear, phobias, terror',
      'Lack of willpower, giving up easily',
      'Exhaustion, depleted reserves',
      'Disconnection from roots',
      'Existential anxiety, groundlessness'
    ],
    therapeuticApproach: [
      'Tonify Kidney essence',
      'Calm fear, anchor the spirit',
      'Strengthen ancestral connection',
      'Restore Heart-Kidney axis'
    ],
    jungianCorrelation: 'Collective unconscious, ancestral patterns',
    ifsCorrelation: 'Exiles (carrying primal wounds)',
    polyvagalCorrelation: 'Dorsal collapse from overwhelming fear',
    somaticCorrelation: 'Lower back weakness, cold, contracted'
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Eight Principles (Ba Gang)
// ─────────────────────────────────────────────────────────────────────────────

export interface EightPrinciplesState {
  yinYang: 'yin' | 'yang' | 'balanced';
  interiorExterior: 'interior' | 'exterior' | 'half-interior-half-exterior';
  coldHot: 'cold' | 'hot' | 'neutral';
  deficiencyExcess: 'deficiency' | 'excess' | 'mixed';
}

export const EIGHT_PRINCIPLES_CORRELATIONS = {
  yin: {
    qualities: ['cold', 'interior', 'deficiency', 'chronic', 'quiet'],
    polyvagal: 'dorsal vagal - shutdown, conservation',
    somatic: 'hypoarousal, collapse, cold extremities',
    jungian: 'introversion, unconscious processes'
  },
  yang: {
    qualities: ['hot', 'exterior', 'excess', 'acute', 'active'],
    polyvagal: 'sympathetic - mobilization, fight/flight',
    somatic: 'hyperarousal, heat, tension',
    jungian: 'extraversion, conscious drive'
  },
  interior: {
    meaning: 'Pattern affecting Zang-Fu organs, deeper issues',
    psychological: 'Core wounds, deeply held patterns'
  },
  exterior: {
    meaning: 'Pattern affecting surface, acute onset',
    psychological: 'Recent triggers, surface reactions'
  },
  cold: {
    signs: ['pale face', 'cold limbs', 'slow movement', 'desire for warmth'],
    psychological: 'Withdrawal, depression, shutdown',
    polyvagal: 'Dorsal vagal freeze'
  },
  hot: {
    signs: ['red face', 'thirst', 'restlessness', 'aversion to heat'],
    psychological: 'Agitation, inflammation, mania',
    polyvagal: 'Sympathetic hyperarousal'
  },
  deficiency: {
    signs: ['fatigue', 'weak voice', 'spontaneous sweating', 'pale tongue'],
    psychological: 'Depletion, burnout, lack of resources',
    somatic: 'Collapsed posture, weak voice, fatigue'
  },
  excess: {
    signs: ['robust build', 'strong voice', 'forceful pulse', 'thick tongue coating'],
    psychological: 'Overwhelm, too much (emotion, stimulation, demands)',
    somatic: 'Tension, pressure, held energy'
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Pathogenic Factors (Liu Yin) - External Causes
// ─────────────────────────────────────────────────────────────────────────────

export interface PathogenicFactor {
  name: string;
  chineseName: string;
  nature: string;
  physicalSigns: string[];
  emotionalPattern: string;
  psychologicalCorrelation: string;
  therapeuticPrinciple: string;
}

export const PATHOGENIC_FACTORS: Record<string, PathogenicFactor> = {
  wind: {
    name: 'Wind',
    chineseName: '風 (Fēng)',
    nature: 'Sudden onset, changeable, affects upper body, causes movement',
    physicalSigns: ['sudden symptoms', 'migrating pain', 'tremors', 'tics', 'itching'],
    emotionalPattern: 'Rapid mood changes, instability, feeling "blown about"',
    psychologicalCorrelation: 'Anxiety, dissociation, feeling ungrounded',
    therapeuticPrinciple: 'Expel wind, calm and anchor'
  },
  cold: {
    name: 'Cold',
    chineseName: '寒 (Hán)',
    nature: 'Contracts, slows, causes pain, depletes Yang',
    physicalSigns: ['chills', 'cold limbs', 'pale complexion', 'contracted muscles'],
    emotionalPattern: 'Withdrawal, emotional coldness, shutdown',
    psychologicalCorrelation: 'Depression, freeze response, isolation',
    therapeuticPrinciple: 'Warm and tonify Yang, dispel cold'
  },
  summerHeat: {
    name: 'Summer Heat',
    chineseName: '暑 (Shǔ)',
    nature: 'Extreme heat, depletes Qi and fluids, only in summer',
    physicalSigns: ['high fever', 'profuse sweating', 'thirst', 'exhaustion'],
    emotionalPattern: 'Burnout, overexertion, pushing too hard',
    psychologicalCorrelation: 'Exhaustion from chronic hyperarousal',
    therapeuticPrinciple: 'Clear heat, replenish fluids, rest'
  },
  dampness: {
    name: 'Dampness',
    chineseName: '濕 (Shī)',
    nature: 'Heavy, turbid, lingering, sinks downward, hard to resolve',
    physicalSigns: ['heavy limbs', 'foggy head', 'bloating', 'mucus', 'sluggishness'],
    emotionalPattern: 'Stuck, heavy, foggy thinking, rumination',
    psychologicalCorrelation: 'Depression with heaviness, mental fog, stuck patterns',
    therapeuticPrinciple: 'Transform dampness, strengthen Spleen'
  },
  dryness: {
    name: 'Dryness',
    chineseName: '燥 (Zào)',
    nature: 'Depletes fluids, affects Lung and skin',
    physicalSigns: ['dry skin', 'dry throat', 'dry cough', 'cracked lips'],
    emotionalPattern: 'Brittle emotions, lack of flow, rigidity',
    psychologicalCorrelation: 'Emotional brittleness, inability to cry, rigidity',
    therapeuticPrinciple: 'Moisten and nourish fluids'
  },
  fire: {
    name: 'Fire',
    chineseName: '火 (Huǒ)',
    nature: 'Extreme heat, rises upward, consumes fluids, causes agitation',
    physicalSigns: ['high fever', 'red face', 'thirst', 'irritability', 'bleeding'],
    emotionalPattern: 'Rage, mania, intense agitation',
    psychologicalCorrelation: 'Uncontained anger, manic states, inflammation',
    therapeuticPrinciple: 'Clear fire, cool blood, calm spirit'
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Cross-Framework Mappings
// ─────────────────────────────────────────────────────────────────────────────

export interface TCMCrossFrameworkMapping {
  tcmPattern: string;
  element: TCMElement;
  organ: string;
  spirit: string;
  // Western correlations
  jungian: string[];
  ifs: string[];
  polyvagal: string[];
  somatic: string[];
  gestalt: string[];
  attachment: string[];
  existential: string[];
  alchemical: string[];
}

export const TCM_CROSS_FRAMEWORK_PATTERNS: TCMCrossFrameworkMapping[] = [
  {
    tcmPattern: 'Liver Qi Stagnation',
    element: 'wood',
    organ: 'Liver',
    spirit: 'Hun',
    jungian: ['Shadow constellation', 'Blocked anima/animus', 'Creative repression'],
    ifs: ['Exiled anger parts', 'Manager suppression of assertive parts'],
    polyvagal: ['Trapped sympathetic - incomplete fight response'],
    somatic: ['Jaw tension', 'Shoulder rigidity', 'Sighing', 'Rib-side tension'],
    gestalt: ['Retroflection', 'Introjection of "don\'t be angry"'],
    attachment: ['Anxious attachment with suppressed protest'],
    existential: ['Blocked authenticity', 'Unlived life'],
    alchemical: ['Blocked Calcinatio', 'Incomplete Separatio']
  },
  {
    tcmPattern: 'Heart Blood Deficiency',
    element: 'fire',
    organ: 'Heart',
    spirit: 'Shen',
    jungian: ['Weak ego-Self axis', 'Derealization'],
    ifs: ['Exile overwhelm', 'Self energy depleted'],
    polyvagal: ['Unstable ventral access', 'Oscillating states'],
    somatic: ['Palpitations', 'Startles easily', 'Shallow breath'],
    gestalt: ['Confluence', 'Weak contact function'],
    attachment: ['Anxious attachment', 'Fear of abandonment'],
    existential: ['Loss of meaning', 'Disconnection from joy'],
    alchemical: ['Depleted Rubedo', 'Lost gold']
  },
  {
    tcmPattern: 'Kidney Yang Deficiency',
    element: 'water',
    organ: 'Kidney',
    spirit: 'Zhi',
    jungian: ['Weak connection to collective unconscious', 'Ancestral disconnection'],
    ifs: ['Collapsed system', 'Exile overwhelm', 'No Self energy'],
    polyvagal: ['Chronic dorsal vagal', 'Freeze/shutdown'],
    somatic: ['Cold extremities', 'Low back weakness', 'Exhaustion'],
    gestalt: ['Devitalization', 'Weak boundary function'],
    attachment: ['Avoidant collapse', 'Giving up on connection'],
    existential: ['Existential groundlessness', 'Loss of will'],
    alchemical: ['Nigredo without fire', 'Stagnant prima materia']
  },
  {
    tcmPattern: 'Spleen Qi Deficiency with Dampness',
    element: 'earth',
    organ: 'Spleen',
    spirit: 'Yi',
    jungian: ['Mother complex', 'Negative nourishment patterns'],
    ifs: ['Manager parts in worry loop', 'Self-care exile'],
    polyvagal: ['Mixed state', 'Neither mobilized nor safe'],
    somatic: ['Digestive holding', 'Heavy limbs', 'Foggy head'],
    gestalt: ['Introjection', 'Swallowed beliefs about worth'],
    attachment: ['Preoccupied with caretaking others', 'Self-neglect'],
    existential: ['Searching for meaning through nurturing others'],
    alchemical: ['Stuck Coagulatio', 'Unable to transform nourishment']
  },
  {
    tcmPattern: 'Lung Qi Deficiency with Grief',
    element: 'metal',
    organ: 'Lung',
    spirit: 'Po',
    jungian: ['Incomplete mourning', 'Anima/animus loss'],
    ifs: ['Grief-carrying exiles', 'Protector preventing letting go'],
    polyvagal: ['Dorsal collapse', 'Breath restriction'],
    somatic: ['Shallow breathing', 'Chest collapse', 'Weak voice'],
    gestalt: ['Deflection from present', 'Holding onto past'],
    attachment: ['Prolonged grief response', 'Attachment to lost object'],
    existential: ['Facing mortality', 'Meaning through loss'],
    alchemical: ['Incomplete Mortificatio', 'Stuck in death phase']
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// Heart-Kidney Axis - Critical Relationship
// ─────────────────────────────────────────────────────────────────────────────

export const HEART_KIDNEY_AXIS = {
  name: 'Heart-Kidney (Shaoyin) Axis',
  chineseName: '心腎相交 (Xīn Shèn Xiāng Jiāo)',
  description: 'Fire (Heart) and Water (Kidney) must communicate for health',
  balanced: {
    signs: ['Peaceful sleep', 'Clear mind', 'Warm body/calm heart'],
    psychological: 'Grounded presence, conscious connection to depths',
    spirits: 'Shen (consciousness) anchored by Zhi (will/essence)'
  },
  imbalanced: {
    signs: ['Insomnia', 'Anxiety', 'Heat above/cold below', 'Palpitations'],
    psychological: 'Anxiety, dissociation, ungrounded consciousness',
    pattern: 'Fire and Water not communicating'
  },
  therapeuticPrinciple: 'Descend Heart fire, ascend Kidney water',
  crossFramework: {
    polyvagal: 'Ventral-dorsal balance, neither hyperaroused nor collapsed',
    jungian: 'Ego-Self axis, conscious-unconscious communication',
    somatic: 'Upper-lower body integration, grounded presence',
    ifs: 'Self-energy able to access both protectors and exiles'
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Helper Functions
// ─────────────────────────────────────────────────────────────────────────────

export function getElementFromOrgan(organ: string): TCMElement | null {
  const organToElement: Record<string, TCMElement> = {
    liver: 'wood', gallbladder: 'wood',
    heart: 'fire', 'small intestine': 'fire',
    spleen: 'earth', stomach: 'earth',
    lung: 'metal', 'large intestine': 'metal',
    kidney: 'water', bladder: 'water'
  };
  return organToElement[organ.toLowerCase()] || null;
}

export function getSpiritFromElement(element: TCMElement): SpiritState {
  const elementToSpirit: Record<TCMElement, string> = {
    wood: 'hun',
    fire: 'shen',
    earth: 'yi',
    metal: 'po',
    water: 'zhi'
  };
  return FIVE_SPIRITS[elementToSpirit[element]];
}

export function getGeneratingElement(element: TCMElement): TCMElement {
  const generating: Record<TCMElement, TCMElement> = {
    wood: 'water',  // Water generates Wood
    fire: 'wood',   // Wood generates Fire
    earth: 'fire',  // Fire generates Earth
    metal: 'earth', // Earth generates Metal
    water: 'metal'  // Metal generates Water
  };
  return generating[element];
}

export function getControllingElement(element: TCMElement): TCMElement {
  const controlling: Record<TCMElement, TCMElement> = {
    wood: 'metal',  // Metal controls Wood
    fire: 'water',  // Water controls Fire
    earth: 'wood',  // Wood controls Earth
    metal: 'fire',  // Fire controls Metal
    water: 'earth'  // Earth controls Water
  };
  return controlling[element];
}

/**
 * Map Spiralogic element to TCM element
 */
export function mapSpiralogicToTCM(spiralogicElement: string): TCMElement {
  const mapping: Record<string, TCMElement> = {
    fire: 'fire',
    water: 'water',
    earth: 'earth',
    air: 'wood',    // Air (communication, movement) → Wood (growth, movement)
    aether: 'metal' // Aether (structure, transcendence) → Metal (structure, letting go)
  };
  return mapping[spiralogicElement.toLowerCase()] || 'earth';
}

/**
 * Map TCM element to Spiralogic element
 */
export function mapTCMToSpiralogic(tcmElement: TCMElement): string {
  const mapping: Record<TCMElement, string> = {
    wood: 'air',
    fire: 'fire',
    earth: 'earth',
    metal: 'aether',
    water: 'water'
  };
  return mapping[tcmElement];
}
