/**
 * SPIRALOGIC ARCHETYPAL LIBRARY
 *
 * A unified field theory of human consciousness and development.
 * Maps archetypes across:
 * - Astrology (signs, planets, houses)
 * - Psychology (Jung, Erikson, Maslow, developmental models)
 * - Mythology (Hero's Journey, cultural archetypes)
 * - Neuroscience (McGilchrist's divided brain)
 * - Culture (learning styles, temperaments, life stages)
 *
 * This library shows how ALL these frameworks describe the same elemental
 * patterns of consciousness evolution through Fire, Water, Earth, and Air.
 *
 * Created over 34 years of research and development.
 * Author: Kelly Beard
 * Integration: MAIA Archetypal Intelligence Network
 */

import { SpiralogicElement } from './spiralogicMapping';

// ============== CORE TYPES ==============

export interface ArchetypalCorrelation {
  element: SpiralogicElement;
  modality: 'cardinal' | 'fixed' | 'mutable';
  sign?: string;
  facetName: string;
  archetypes: {
    mythological?: string[];
    jungian?: string[];
    psychological?: string[];
    cultural?: string[];
    heroicFigures?: string[];
  };
  developmentalStages?: {
    erikson?: string;
    piaget?: string;
    kohlberg?: string;
    maslow?: string;
  };
  learningStyle?: string;
  temperament?: string;
  literaryGenre?: string;
  teamStage?: string;
  lifeStage?: string;
}

// ============== ZODIAC ARCHETYPAL CORRELATIONS ==============

export const ZODIAC_ARCHETYPES: Record<string, ArchetypalCorrelation> = {
  // FIRE SIGNS
  aries: {
    element: 'fire',
    modality: 'cardinal',
    sign: 'Aries',
    facetName: 'The Initiator',
    archetypes: {
      mythological: ['Prometheus', 'Mars (God of War)'],
      jungian: ['The Hero', 'The Warrior'],
      psychological: ['DISC: Dominance'],
      cultural: ['Joan of Arc', 'King Arthur', 'Achilles'],
      heroicFigures: ['The Pioneer', 'The Trailblazer'],
    },
    developmentalStages: {
      erikson: 'Trust vs. Mistrust',
      piaget: 'Sensorimotor',
      maslow: 'Physiological Needs',
    },
    learningStyle: 'Kinesthetic',
    temperament: 'Choleric',
    literaryGenre: 'Action/Adventure',
    teamStage: 'Forming',
    lifeStage: 'Youth',
  },

  leo: {
    element: 'fire',
    modality: 'fixed',
    sign: 'Leo',
    facetName: 'The Sustainer',
    archetypes: {
      mythological: ['Phoenix', 'Apollo', 'Amaterasu'],
      jungian: ['The Father', 'The Sun King'],
      psychological: ['DISC: Steadiness'],
      cultural: ['Queen Elizabeth I', 'Tony Stark/Iron Man'],
      heroicFigures: ['The Creator', 'The Sovereign'],
    },
    developmentalStages: {
      erikson: 'Industry vs. Inferiority',
      piaget: 'Concrete Operational',
    },
    learningStyle: 'Kinesthetic',
    temperament: 'Choleric',
    literaryGenre: 'Epic/Drama',
    teamStage: 'Norming (Fire sustains)',
    lifeStage: 'Youth (sustained)',
  },

  sagittarius: {
    element: 'fire',
    modality: 'mutable',
    sign: 'Sagittarius',
    facetName: 'The Explorer',
    archetypes: {
      mythological: ['Odysseus', 'Centaur (Chiron)'],
      jungian: ['The Seeker', 'The Sage'],
      psychological: ['DISC: Influence'],
      cultural: ['Amelia Earhart', 'Marco Polo', 'Zheng He', 'Han Solo'],
      heroicFigures: ['The Philosopher', 'The Adventurer'],
    },
    developmentalStages: {
      erikson: 'Identity vs. Role Confusion',
      piaget: 'Formal Operational',
      kohlberg: 'Post-Conventional',
      maslow: 'Self-Actualization (pursuit)',
    },
    learningStyle: 'Kinesthetic',
    temperament: 'Choleric',
    literaryGenre: 'Adventure/Quest',
    teamStage: 'Performing (adapts)',
    lifeStage: 'Youth',
  },

  // WATER SIGNS
  cancer: {
    element: 'water',
    modality: 'cardinal',
    sign: 'Cancer',
    facetName: 'The Nurturer',
    archetypes: {
      mythological: ['Demeter', 'Kuan Yin'],
      jungian: ['The Great Mother', 'The Caregiver'],
      psychological: ['Bowlby: Attachment Theory'],
      cultural: ['Mother Teresa', 'Princess Maha Chakri Sirindhorn'],
      heroicFigures: ['The Protector', 'The Healer'],
    },
    developmentalStages: {
      erikson: 'Autonomy vs. Shame and Doubt',
      maslow: 'Belongingness and Love Needs',
    },
    learningStyle: 'Aural',
    temperament: 'Phlegmatic',
    literaryGenre: 'Romance/Drama',
    teamStage: 'Forming (emotional)',
    lifeStage: 'Young Adulthood',
  },

  scorpio: {
    element: 'water',
    modality: 'fixed',
    sign: 'Scorpio',
    facetName: 'The Transformer',
    archetypes: {
      mythological: ['Hades', 'Phoenix (rebirth)', 'Medusa'],
      jungian: ['The Shadow', 'The Alchemist'],
      psychological: ['DISC: Conscientiousness', 'Jung: Shadow Integration'],
      cultural: ['Walter White (Breaking Bad)', 'Severus Snape'],
      heroicFigures: ['The Magician', 'The Shaman'],
    },
    developmentalStages: {
      erikson: 'Generativity vs. Stagnation',
    },
    learningStyle: 'Aural',
    temperament: 'Phlegmatic',
    literaryGenre: 'Psychological Thriller/Mystery',
    teamStage: 'Storming',
    lifeStage: 'Young Adulthood',
  },

  pisces: {
    element: 'water',
    modality: 'mutable',
    sign: 'Pisces',
    facetName: 'The Mystic',
    archetypes: {
      mythological: ['Fisher King', 'Neptune', 'Lady of the Lake'],
      jungian: ['The Anima/Animus', 'The Mystic'],
      psychological: ['Maslow: Self-Actualization', 'Transpersonal Psychology'],
      cultural: ['Rumi', 'St. Teresa of Avila', 'The Dude (Big Lebowski)'],
      heroicFigures: ['The Dreamer', 'The Visionary'],
    },
    developmentalStages: {
      erikson: 'Integrity vs. Despair',
      maslow: 'Self-Transcendence',
    },
    learningStyle: 'Aural',
    temperament: 'Phlegmatic',
    literaryGenre: 'Spiritual/Mystical',
    teamStage: 'Performing (surrenders)',
    lifeStage: 'Elder Years',
  },

  // EARTH SIGNS
  capricorn: {
    element: 'earth',
    modality: 'cardinal',
    sign: 'Capricorn',
    facetName: 'The Builder',
    archetypes: {
      mythological: ['Saturn/Cronus', 'Atlas'],
      jungian: ['The Builder', 'The Ruler'],
      psychological: ['Goal Setting (NLP)', 'Builder Strategy'],
      cultural: ['Abraham Lincoln', 'Michelle Obama'],
      heroicFigures: ['The Executive', 'The Administrator'],
    },
    developmentalStages: {
      erikson: 'Initiative vs. Guilt',
      piaget: 'Formal Operational',
    },
    learningStyle: 'Read/Write',
    temperament: 'Melancholic',
    literaryGenre: 'Historical/Political',
    teamStage: 'Norming',
    lifeStage: 'Midlife',
  },

  taurus: {
    element: 'earth',
    modality: 'fixed',
    sign: 'Taurus',
    facetName: 'The Stabilizer',
    archetypes: {
      mythological: ['Hephaestus', 'Gaia (Earth Mother)'],
      jungian: ['The Earth Mother', 'The Craftsman'],
      psychological: ['DISC: Steadiness', 'Stabilizer Strategy (NLP)'],
      cultural: ['The Gardener', 'The Craftsperson'],
      heroicFigures: ['The Sustainer', 'The Preserver'],
    },
    developmentalStages: {
      erikson: 'Generativity vs. Stagnation',
      maslow: 'Safety Needs',
    },
    learningStyle: 'Read/Write',
    temperament: 'Melancholic',
    literaryGenre: 'Realism',
    teamStage: 'Norming (stabilizes)',
    lifeStage: 'Midlife',
  },

  virgo: {
    element: 'earth',
    modality: 'mutable',
    sign: 'Virgo',
    facetName: 'The Analyzer',
    archetypes: {
      mythological: ['Hermes (analytical aspect)', 'Athena (wisdom)'],
      jungian: ['The Sage', 'The Analyst'],
      psychological: ['DISC: Conscientiousness', 'Analyzer Strategy (NLP)'],
      cultural: ['Sherlock Holmes', 'Marie Curie'],
      heroicFigures: ['The Scholar', 'The Perfectionist'],
    },
    developmentalStages: {
      erikson: 'Industry vs. Inferiority',
      piaget: 'Concrete Operational',
      kohlberg: 'Conventional',
    },
    learningStyle: 'Read/Write',
    temperament: 'Melancholic',
    literaryGenre: 'Mystery/Detective',
    teamStage: 'Performing (refines)',
    lifeStage: 'Midlife',
  },

  // AIR SIGNS
  libra: {
    element: 'air',
    modality: 'cardinal',
    sign: 'Libra',
    facetName: 'The Harmonizer',
    archetypes: {
      mythological: ['Themis (Justice)', 'Aphrodite (harmony)'],
      jungian: ['The Lover', 'The Diplomat'],
      psychological: ['DISC: Influence', 'Harmonizer Strategy (NLP)'],
      cultural: ['Nelson Mandela', 'Malala Yousafzai'],
      heroicFigures: ['The Peacemaker', 'The Mediator'],
    },
    developmentalStages: {
      erikson: 'Intimacy vs. Isolation',
      maslow: 'Belongingness and Love Needs',
    },
    learningStyle: 'Visual',
    temperament: 'Sanguine',
    literaryGenre: 'Romance/Social Commentary',
    teamStage: 'Forming (connects)',
    lifeStage: 'Young Adulthood',
  },

  aquarius: {
    element: 'air',
    modality: 'fixed',
    sign: 'Aquarius',
    facetName: 'The Innovator',
    archetypes: {
      mythological: ['Prometheus (innovation)', 'Uranus'],
      jungian: ['The Trickster', 'The Rebel'],
      psychological: ['DISC: Dominance (leadership)', 'Innovator Strategy (NLP)'],
      cultural: ['Nikola Tesla', 'Rosa Parks', 'Steve Jobs'],
      heroicFigures: ['The Revolutionary', 'The Visionary'],
    },
    developmentalStages: {
      erikson: 'Identity vs. Role Confusion',
      maslow: 'Esteem Needs',
    },
    learningStyle: 'Visual',
    temperament: 'Sanguine',
    literaryGenre: 'Science Fiction/Utopian',
    teamStage: 'Storming (challenges)',
    lifeStage: 'Youth (revolutionary)',
  },

  gemini: {
    element: 'air',
    modality: 'mutable',
    sign: 'Gemini',
    facetName: 'The Communicator',
    archetypes: {
      mythological: ['Mercury/Hermes (messenger)', 'Loki (trickster)'],
      jungian: ['The Magician (through words)', 'The Messenger'],
      psychological: ['DISC: Influence', 'Communicator Strategy (NLP)'],
      cultural: ['Shakespeare', 'Oprah Winfrey'],
      heroicFigures: ['The Storyteller', 'The Teacher'],
    },
    developmentalStages: {
      erikson: 'Initiative vs. Guilt',
      piaget: 'Formal Operational',
      maslow: 'Esteem Needs (recognition)',
    },
    learningStyle: 'Visual',
    temperament: 'Sanguine',
    literaryGenre: 'Comedy/Satire',
    teamStage: 'Performing (communicates)',
    lifeStage: 'Youth',
  },
};

// ============== HERO'S JOURNEY MAPPING ==============

export const HEROS_JOURNEY_STAGES = {
  fire: {
    stage1: {
      name: 'Answering the Call',
      description: 'The spark of transformation - leaving the familiar behind',
      archetypes: ['The Reluctant Hero', 'The Chosen One'],
    },
    stage2: {
      name: 'Rising to the Challenge',
      description: 'Confronting initial obstacles with determination',
      archetypes: ['The Warrior', 'The Challenger'],
    },
    stage3: {
      name: 'Crossing the Threshold',
      description: 'Committing fully to the journey into the unknown',
      archetypes: ['The Adventurer', 'The Explorer'],
    },
  },
  water: {
    stage1: {
      name: 'The Guides - Connecting to Inner Guidance',
      description: 'Sources of wisdom beyond ego through mentors and intuition',
      archetypes: ['The Mentor', 'The Wise Old Man/Woman'],
    },
    stage2: {
      name: 'The Demons - Facing Inner Challenges',
      description: 'Confronting inner fears, doubts, and shadows',
      archetypes: ['The Shadow', 'The Adversary'],
    },
    stage3: {
      name: 'The Elixir Discovered - Discovering Your Inner Gold',
      description: 'Emotional and intuitive breakthrough - discovering true power',
      archetypes: ['The Alchemist', 'The Transformer'],
    },
  },
  earth: {
    stage1: {
      name: 'The Directive - Planting the Seed of Service/Mission',
      description: 'Recognizing how the elixir serves a larger purpose',
      archetypes: ['The Servant', 'The Mission-Driven'],
    },
    stage2: {
      name: 'The Resources - Germinating a New Way Forward',
      description: 'Gathering resources, knowledge, and alliances',
      archetypes: ['The Builder', 'The Organizer'],
    },
    stage3: {
      name: 'The Elixir Refined - Refining Your Medicine',
      description: 'Honing and perfecting wisdom/skills for sharing',
      archetypes: ['The Master', 'The Craftsperson'],
    },
  },
  air: {
    stage1: {
      name: 'The Guardians - Connecting with Soul',
      description: 'Solidifying connection with higher self and others soul to soul',
      archetypes: ['The Guide', 'The Spiritual Teacher'],
    },
    stage2: {
      name: 'The Return - Coming Together in Community',
      description: 'Returning to community with new wisdom to integrate',
      archetypes: ['The Elder', 'The Wisdom Keeper'],
    },
    stage3: {
      name: 'The Healing/Transformation - Transforming Our World',
      description: 'Applying journey lessons to enact broader healing',
      archetypes: ['The Healer', 'The World Changer'],
    },
  },
};

// ============== ELEMENTAL FACET COMBINATIONS (For Aspects) ==============

export const ELEMENTAL_COMBINATIONS = {
  'fire-air': {
    facet: 'Vision',
    description: 'The ability to create and articulate a compelling vision',
    qualities: 'Passion + Clarity',
    examples: ['Visionary Leaders', 'Inspired Teachers', 'Creative Directors'],
  },
  'fire-aether': {
    facet: 'Intuition',
    description: 'Harnessing intuitive insights to guide decisions',
    qualities: 'Insight + Higher Consciousness',
    examples: ['Mystic Visionaries', 'Prophets', 'Spiritual Innovators'],
  },
  'fire-water': {
    facet: 'Creativity',
    description: 'Using creative energy to inspire and innovate',
    qualities: 'Spark + Emotional Fluidity',
    examples: ['Artists', 'Poets', 'Musicians'],
  },
  'water-aether': {
    facet: 'Emotional Intelligence',
    description: 'Understanding and managing emotions to build trust and empathy',
    qualities: 'Depth + Spiritual Awareness',
    examples: ['Empaths', 'Healers', 'Counselors'],
  },
  'water-earth': {
    facet: 'Resilience',
    description: 'The capacity to recover from difficulties and maintain balance',
    qualities: 'Flexibility + Stability',
    examples: ['Survivors', 'Endurance Athletes', 'Caregivers'],
  },
  'water-air': {
    facet: 'Compassion',
    description: 'Demonstrating understanding and kindness in interactions',
    qualities: 'Empathy + Communication',
    examples: ['Therapists', 'Social Workers', 'Mediators'],
  },
  'earth-fire': {
    facet: 'Grounded Authority',
    description: 'The ability to lead with confidence and stability',
    qualities: 'Grounding + Charisma',
    examples: ['CEOs', 'Military Leaders', 'Project Managers'],
  },
  'earth-air': {
    facet: 'Presence',
    description: 'Maintaining a strong, grounded presence in interactions',
    qualities: 'Physical Stability + Relational Clarity',
    examples: ['Teachers', 'Coaches', 'Facilitators'],
  },
  'earth-aether': {
    facet: 'Practical Wisdom',
    description: 'Applying spiritual insights in practical ways',
    qualities: 'Practicality + Spiritual Guidance',
    examples: ['Spiritual Teachers', 'Mindfulness Instructors', 'Wisdom Keepers'],
  },
  'air-water': {
    facet: 'Connection',
    description: 'Building and maintaining strong interpersonal relationships',
    qualities: 'Intellectual Engagement + Emotional Connectivity',
    examples: ['Diplomats', 'Community Organizers', 'Network Builders'],
  },
  'air-aether': {
    facet: 'Strategic Communication',
    description: 'Enhancing clarity and effectiveness in conveying ideas',
    qualities: 'Clear Communication + Higher Purpose',
    examples: ['Inspirational Speakers', 'Writers', 'Philosophers'],
  },
  'aether-earth': {
    facet: 'Unity and Purpose',
    description: 'Creating collective purpose and interconnectedness',
    qualities: 'Spiritual Connection + Practical Grounding',
    examples: ['Spiritual Leaders', 'Community Founders', 'Systems Thinkers'],
  },
};

// ============== UTILITY FUNCTIONS ==============

/**
 * Get archetypal correlations for a zodiac sign
 */
export function getZodiacArchetype(sign: string): ArchetypalCorrelation | undefined {
  return ZODIAC_ARCHETYPES[sign.toLowerCase()];
}

/**
 * Get Hero's Journey stage for an element and stage number
 */
export function getHerosJourneyStage(element: SpiralogicElement, stageNum: 1 | 2 | 3) {
  if (element === 'aether') return null;
  const stages = HEROS_JOURNEY_STAGES[element];
  return stages?.[`stage${stageNum}` as keyof typeof stages];
}

/**
 * Get elemental combination facet (for planetary aspects)
 */
export function getElementalCombination(element1: SpiralogicElement, element2: SpiralogicElement) {
  const key = [element1, element2].sort().join('-');
  return ELEMENTAL_COMBINATIONS[key as keyof typeof ELEMENTAL_COMBINATIONS];
}

/**
 * Get all archetypes for a specific element
 */
export function getArchetypesForElement(element: SpiralogicElement) {
  return Object.values(ZODIAC_ARCHETYPES).filter(arch => arch.element === element);
}

/**
 * Generate archetypal description for a planetary placement
 * @param planet - Planet name
 * @param sign - Zodiac sign
 * @param house - House number (1-12)
 */
export function generateArchetypalDescription(
  planet: string,
  sign: string,
  house: number
): string {
  const zodiacArch = getZodiacArchetype(sign);
  if (!zodiacArch) return '';

  const descriptions: string[] = [];

  // Add mythological correlation
  if (zodiacArch.archetypes.mythological && zodiacArch.archetypes.mythological.length > 0) {
    descriptions.push(
      `Mythologically resonates with ${zodiacArch.archetypes.mythological.slice(0, 2).join(' and ')}`
    );
  }

  // Add Jungian archetype
  if (zodiacArch.archetypes.jungian && zodiacArch.archetypes.jungian.length > 0) {
    descriptions.push(
      `Embodies the ${zodiacArch.archetypes.jungian[0]} archetype`
    );
  }

  // Add developmental stage if relevant
  if (zodiacArch.developmentalStages?.erikson) {
    descriptions.push(
      `Developmentally aligned with ${zodiacArch.developmentalStages.erikson} (Erikson)`
    );
  }

  return descriptions.join('. ');
}
