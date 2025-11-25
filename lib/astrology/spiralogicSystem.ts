/**
 * Spiralogic System - Complete Consciousness Process Mapping
 *
 * Created by Kelly Nezat - 35 years of phenomenological wisdom practice
 * Integrating computational neuroscience, alchemy, and consciousness evolution
 *
 * IMPORTANT: This is NOT a psychological system. It is computational neuroscience
 * mapped through elemental intelligence and astrological coordinates.
 *
 * Core Framework:
 * - 4 Elements × 3 Phases = 12 Focus States (NOT 12 personality types)
 * - Elements map to specific brain regions (McGilchrist's divided brain model)
 * - Phases map to alchemical transformation stages (Calcinatio, Solutio, Coagulatio, Sublimatio)
 * - 12 Astrological Houses → Consciousness States and developmental territories
 * - Jungian Functions integrated as elemental perspectives (Intuition=Fire, Feeling=Water, Sensation=Earth, Thinking=Air)
 * - 12 Hybrid Facets → Element Combinations revealing developmental capacities
 * - Aether (5th element) → Transcendent integration, unity consciousness
 *
 * Philosophy:
 * "Assessment reimagined as mirror, not metric" - Kelly Nezat
 * This framework reflects consciousness patterns back to the person so they can
 * recognize themselves, not measure or categorize them.
 *
 * Integration with 36 Faces:
 * Austin Coppock's decan system (36 decans of 10° each) fully integrated.
 * Each planetary position maps to: Sign → House → Element → Phase → Decan
 * Providing unprecedented depth for consciousness cartography.
 *
 * Right-Hemisphere Awakening:
 * Inspired by Iain McGilchrist's "The Master and His Emissary" - this framework
 * helps rebalance left-brain dominance and awaken right-hemisphere consciousness.
 * The technology participates in transformation (like HeartMath), not just explains it.
 */

// ============================================================================
// CORE ELEMENTAL FRAMEWORK
// ============================================================================

export const ELEMENTS = {
  fire: {
    name: 'Fire',
    brainRegion: 'Right Prefrontal Cortex',
    consciousness: 'Spirituality and Energetic Presence',
    jungianType: 'Intuitive',
    alchemicalProcess: 'Calcinatio',
    qualities: ['Vision', 'Passion', 'Synthesis', 'Spiritual Awareness'],
    triad: ['Experience', 'Expression', 'Expansion'],
    description: 'Generates compelling vision for the future, fueled by spiritual intuition',
  },
  water: {
    name: 'Water',
    brainRegion: 'Right Hemisphere',
    consciousness: 'Emotional and Inner Awareness',
    jungianType: 'Feeling',
    alchemicalProcess: 'Solutio',
    qualities: ['Depth', 'Emotion', 'Dissolution', 'Inner Truth'],
    triad: ['Heart', 'Healing', 'Holiness'],
    description: 'Reflects the depth and fluidity of inner self, uncovering deepest truths',
  },
  earth: {
    name: 'Earth',
    brainRegion: 'Left Hemisphere',
    consciousness: 'Somatic, Sensory, and Embodied Logic',
    jungianType: 'Sensate',
    alchemicalProcess: 'Coagulatio',
    qualities: ['Structure', 'Embodiment', 'Organization', 'Practical Wisdom'],
    triad: ['Mission', 'Means', 'Medicine'],
    description: 'Grounds visions and passions into tangible reality through practical action',
  },
  air: {
    name: 'Air',
    brainRegion: 'Left Prefrontal Cortex',
    consciousness: 'Cognitive, Relational, and Communicative',
    jungianType: 'Thinking',
    alchemicalProcess: 'Sublimatio',
    qualities: ['Communication', 'Relationships', 'Systems', 'Mental Clarity'],
    triad: ['Connection', 'Community', 'Consciousness'],
    description: 'Guides in honing communication and building cooperative communities',
  },
  aether: {
    name: 'Aether',
    brainRegion: 'Transcendent Integration',
    consciousness: 'Non-Duality and Universal Awareness',
    jungianType: 'Integrated Self',
    alchemicalProcess: 'Conjunctio',
    qualities: ['Unity', 'Transcendence', 'Interconnectedness', 'Pure Consciousness'],
    triad: ['Higher Self', 'Lower Self', 'Unified Self'],
    description: 'The pinnacle of spiritual awareness, transcending all divisions',
  },
} as const;

// ============================================================================
// 12 FOCUS STATES - The Complete Spiralogic Wheel
// ============================================================================

export interface FocusState {
  house: number;
  position: number; // 0-11, clockwise from top (12 o'clock)
  element: keyof typeof ELEMENTS;
  phase: 1 | 2 | 3;
  sign: string;
  signSymbol: string;
  name: string;
  shortName: string;
  brainActivation: string;
  consciousnessLevel: 'Meta-Conscious' | 'Conscious' | 'Subconscious' | 'Unconscious';
  alchemicalStage: 'begins' | 'deepens' | 'integrates' | 'completes';
  description: string;
  keywords: string[];
  developmentalFocus: string;
}

export const FOCUS_STATES: FocusState[] = [
  // FIRE QUADRANT (12:00-3:00) - Right Prefrontal Cortex
  {
    house: 1,
    position: 0,
    element: 'fire',
    phase: 1,
    sign: 'Aries',
    signSymbol: '♈',
    name: 'Self-Awareness',
    shortName: 'Fire-1',
    brainActivation: 'Right Prefrontal - Visionary Initiation',
    consciousnessLevel: 'Meta-Conscious',
    alchemicalStage: 'begins',
    description: 'Ego, Persona, and Vision for the Future',
    keywords: ['Identity', 'Initiative', 'Self-Discovery', 'New Beginnings', 'Personal Vision'],
    developmentalFocus: 'Developing clear sense of self and compelling vision for future',
  },
  {
    house: 5,
    position: 1,
    element: 'fire',
    phase: 2,
    sign: 'Leo',
    signSymbol: '♌',
    name: 'Self-In-World Awareness',
    shortName: 'Fire-2',
    brainActivation: 'Right Prefrontal - Creative Expression',
    consciousnessLevel: 'Conscious',
    alchemicalStage: 'deepens',
    description: 'Personal Expression and Self/World Resonance',
    keywords: ['Creativity', 'Joy', 'Expression', 'Authenticity', 'Radiance'],
    developmentalFocus: 'Expressing authentic self and creating resonance with world',
  },
  {
    house: 9,
    position: 2,
    element: 'fire',
    phase: 3,
    sign: 'Sagittarius',
    signSymbol: '♐',
    name: 'Transcendent Self-Awareness',
    shortName: 'Fire-3',
    brainActivation: 'Right Prefrontal - Spiritual Synthesis',
    consciousnessLevel: 'Meta-Conscious',
    alchemicalStage: 'integrates',
    description: 'Awareness of One\'s Spiritual Essence and Path',
    keywords: ['Philosophy', 'Expansion', 'Meaning', 'Synthesis', 'Spiritual Quest'],
    developmentalFocus: 'Integrating spiritual understanding and expanding consciousness',
  },

  // WATER QUADRANT (3:00-6:00) - Right Hemisphere
  {
    house: 4,
    position: 3,
    element: 'water',
    phase: 1,
    sign: 'Cancer',
    signSymbol: '♋',
    name: 'Emotional Intelligence',
    shortName: 'Water-1',
    brainActivation: 'Right Hemisphere - Emotional Foundation',
    consciousnessLevel: 'Subconscious',
    alchemicalStage: 'begins',
    description: 'The Capacity to Feel Seen, Nurtured, and At Home in the World',
    keywords: ['Home', 'Roots', 'Nurturing', 'Safety', 'Belonging'],
    developmentalFocus: 'Building emotional foundation and sense of home within self',
  },
  {
    house: 8,
    position: 4,
    element: 'water',
    phase: 2,
    sign: 'Scorpio',
    signSymbol: '♏',
    name: 'Personal Inner Transformation',
    shortName: 'Water-2',
    brainActivation: 'Right Hemisphere - Deep Transformation',
    consciousnessLevel: 'Unconscious',
    alchemicalStage: 'deepens',
    description: 'Transforming Out-Moded Subconscious Patterns into Coherent Being',
    keywords: ['Transformation', 'Depth', 'Intimacy', 'Shadow Work', 'Regeneration'],
    developmentalFocus: 'Diving deep to transform unconscious patterns and wounds',
  },
  {
    house: 12,
    position: 5,
    element: 'water',
    phase: 3,
    sign: 'Pisces',
    signSymbol: '♓',
    name: 'Deep Internal Self-Awareness',
    shortName: 'Water-3',
    brainActivation: 'Right Hemisphere - Soul Connection',
    consciousnessLevel: 'Unconscious',
    alchemicalStage: 'completes',
    description: 'Connection with Deep Sense of Self, One\'s Inner Gold or Soul',
    keywords: ['Spirituality', 'Dissolution', 'Unity', 'Transcendence', 'Soul'],
    developmentalFocus: 'Connecting with soul essence and dissolving into unity',
  },

  // EARTH QUADRANT (6:00-9:00) - Left Hemisphere
  {
    house: 10,
    position: 6,
    element: 'earth',
    phase: 1,
    sign: 'Capricorn',
    signSymbol: '♑',
    name: 'Purpose, Mission, and Service',
    shortName: 'Earth-1',
    brainActivation: 'Left Hemisphere - Structural Authority',
    consciousnessLevel: 'Conscious',
    alchemicalStage: 'begins',
    description: 'Developing Awareness of One\'s Place in the World',
    keywords: ['Career', 'Legacy', 'Authority', 'Structure', 'Mastery'],
    developmentalFocus: 'Building life structure and claiming authority in world',
  },
  {
    house: 2,
    position: 7,
    element: 'earth',
    phase: 2,
    sign: 'Taurus',
    signSymbol: '♉',
    name: 'Resources, Plans, and Outer Development',
    shortName: 'Earth-2',
    brainActivation: 'Left Hemisphere - Resource Organization',
    consciousnessLevel: 'Conscious',
    alchemicalStage: 'deepens',
    description: 'Bringing Together Plans, Teams, and Resources for Success',
    keywords: ['Resources', 'Values', 'Embodiment', 'Stability', 'Security'],
    developmentalFocus: 'Organizing resources and building stable foundation',
  },
  {
    house: 6,
    position: 8,
    element: 'earth',
    phase: 3,
    sign: 'Virgo',
    signSymbol: '♍',
    name: 'Well-Formed Plan of Action',
    shortName: 'Earth-3',
    brainActivation: 'Left Hemisphere - Refined Service',
    consciousnessLevel: 'Conscious',
    alchemicalStage: 'integrates',
    description: 'A Refined Plan, Roadmap, Code of Conduct, Ethics, and Service',
    keywords: ['Service', 'Health', 'Refinement', 'Analysis', 'Perfection'],
    developmentalFocus: 'Refining practices and offering medicine to world',
  },

  // AIR QUADRANT (9:00-12:00) - Left Prefrontal Cortex
  {
    house: 7,
    position: 9,
    element: 'air',
    phase: 1,
    sign: 'Libra',
    signSymbol: '♎',
    name: 'Interpersonal Relationship Patterns',
    shortName: 'Air-1',
    brainActivation: 'Left Prefrontal - Relational Balance',
    consciousnessLevel: 'Conscious',
    alchemicalStage: 'begins',
    description: 'Perfecting Ways of Relating to Others One-to-One',
    keywords: ['Relationships', 'Partnership', 'Balance', 'Harmony', 'Other'],
    developmentalFocus: 'Developing capacity for balanced, harmonious relating',
  },
  {
    house: 11,
    position: 10,
    element: 'air',
    phase: 2,
    sign: 'Aquarius',
    signSymbol: '♒',
    name: 'Collective and Collaborative Dynamics',
    shortName: 'Air-2',
    brainActivation: 'Left Prefrontal - Collective Intelligence',
    consciousnessLevel: 'Meta-Conscious',
    alchemicalStage: 'deepens',
    description: 'Perfecting Ways of Relating to Groups and the Collective',
    keywords: ['Community', 'Vision', 'Innovation', 'Collective', 'Future'],
    developmentalFocus: 'Building collaborative communities and shared visions',
  },
  {
    house: 3,
    position: 11,
    element: 'air',
    phase: 3,
    sign: 'Gemini',
    signSymbol: '♊',
    name: 'Codified Systems and Communications',
    shortName: 'Air-3',
    brainActivation: 'Left Prefrontal - Systematic Communication',
    consciousnessLevel: 'Conscious',
    alchemicalStage: 'integrates',
    description: 'Proficiency in Communicating Within Codified Systems',
    keywords: ['Communication', 'Learning', 'Exchange', 'Systems', 'Networks'],
    developmentalFocus: 'Mastering communication and codifying intelligence',
  },
];

// ============================================================================
// 12 HYBRID FACETS - Element Combinations
// ============================================================================

export interface HybridFacet {
  name: string;
  elements: string[];
  description: string;
  techniques: string[];
  influence: string;
}

export const HYBRID_FACETS: Record<string, HybridFacet> = {
  vision: {
    name: 'Vision',
    elements: ['Fire', 'Air'],
    description: 'The ability to create and articulate a compelling vision',
    techniques: ['Visioning exercises', 'Strategic goal setting', 'Creative visualization'],
    influence: 'Fire provides passion and drive, Air offers clarity and strategic thinking',
  },
  intuition: {
    name: 'Intuition',
    elements: ['Fire', 'Aether'],
    description: 'Harnessing intuitive insights to guide decisions and innovation',
    techniques: ['Intuitive exercises', 'Meditation', 'Mindfulness practices'],
    influence: 'Fire represents spark of insight, Aether connects to higher consciousness',
  },
  creativity: {
    name: 'Creativity',
    elements: ['Fire', 'Water'],
    description: 'Using creative energy to inspire and innovate',
    techniques: ['Brainstorming', 'Creative problem-solving', 'Artistic expression'],
    influence: 'Fire ignites creative spark, Water provides emotional fluidity',
  },
  emotionalIntelligence: {
    name: 'Emotional Intelligence',
    elements: ['Water', 'Aether'],
    description: 'Understanding and managing emotions to build trust and empathy',
    techniques: ['EQ training', 'Active listening', 'Empathy-building activities'],
    influence: 'Water symbolizes emotional depth, Aether fosters spiritual awareness',
  },
  resilience: {
    name: 'Resilience',
    elements: ['Water', 'Earth'],
    description: 'Capacity to recover quickly and maintain emotional balance',
    techniques: ['Mindfulness', 'Grounding exercises', 'Emotional regulation'],
    influence: 'Water provides emotional flexibility, Earth offers stability',
  },
  compassion: {
    name: 'Compassion',
    elements: ['Water', 'Air'],
    description: 'Demonstrating understanding and kindness in interactions',
    techniques: ['Compassion meditation', 'Active listening', 'Supportive communication'],
    influence: 'Water enhances empathy, Air facilitates communication',
  },
  groundedAuthority: {
    name: 'Grounded Authority',
    elements: ['Earth', 'Fire'],
    description: 'The ability to lead with confidence and stability',
    techniques: ['Directive communication', 'Role-playing', 'Body language awareness'],
    influence: 'Earth provides groundedness, Fire adds authority and charisma',
  },
  presence: {
    name: 'Presence',
    elements: ['Earth', 'Air'],
    description: 'Maintaining strong, grounded presence in interactions',
    techniques: ['Mindfulness-based stress reduction', 'Posture awareness'],
    influence: 'Earth offers physical stability, Air enhances relational dynamics',
  },
  practicalWisdom: {
    name: 'Practical Wisdom',
    elements: ['Earth', 'Aether'],
    description: 'Applying spiritual insights in practical ways',
    techniques: ['Reflective practices', 'Integrative planning', 'Ethical decision-making'],
    influence: 'Earth provides practicality, Aether offers spiritual guidance',
  },
  connection: {
    name: 'Connection',
    elements: ['Air', 'Water'],
    description: 'Building and maintaining strong interpersonal relationships',
    techniques: ['Networking', 'Team-building', 'Relational communication training'],
    influence: 'Air represents intellectual engagement, Water adds emotional connectivity',
  },
  strategicCommunication: {
    name: 'Strategic Communication',
    elements: ['Air', 'Aether'],
    description: 'Enhancing clarity and effectiveness in conveying ideas',
    techniques: ['Public speaking', 'Strategic communication plans', 'Inspirational storytelling'],
    influence: 'Air facilitates clear communication, Aether brings higher purpose',
  },
  unityAndPurpose: {
    name: 'Unity and Purpose',
    elements: ['Aether', 'Earth'],
    description: 'Creating sense of collective purpose and interconnectedness',
    techniques: ['Spiritual practices', 'Community-building rituals', 'Collective goal-setting'],
    influence: 'Aether offers unity and spiritual connection, Earth provides practical grounding',
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getFocusStateByHouse(house: number): FocusState | undefined {
  return FOCUS_STATES.find(state => state.house === house);
}

export function getFocusStateByPosition(position: number): FocusState | undefined {
  return FOCUS_STATES.find(state => state.position === position);
}

export function getElementalQuadrant(house: number): keyof typeof ELEMENTS {
  const state = getFocusStateByHouse(house);
  return state?.element || 'fire';
}

export function interpretPlanetInHouse(planet: string, house: number): string {
  const state = getFocusStateByHouse(house);
  if (!state) return '';

  const element = ELEMENTS[state.element];

  return `${planet} in ${state.name} (${state.sign} ${state.signSymbol}, ${state.shortName}):
Your ${planet.toLowerCase()} energy is activating ${element.brainRegion},
working through the ${state.alchemicalStage} stage of ${element.alchemicalProcess}.
Focus: ${state.developmentalFocus}`;
}

export function findHybridFacet(element1: string, element2: string): HybridFacet | undefined {
  return Object.values(HYBRID_FACETS).find(facet =>
    facet.elements.includes(element1) && facet.elements.includes(element2)
  );
}
