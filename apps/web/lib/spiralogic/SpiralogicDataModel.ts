/**
 * Comprehensive Spiralogic 12-Facet Data Model
 * This is the authoritative source for all Spiralogic facet metadata
 * Used across check-ins, journals, visualizations, and MAIA interactions
 */

export type Element = 'fire' | 'water' | 'earth' | 'air';
export type Phase = 'vector' | 'circle' | 'spiral';
export type CrystalFocus = 'career' | 'spiritual' | 'relational' | 'health' | 'creative' | 'general';

export interface SpiralogicFacet {
  id: number;
  code: string;                    // Unique facet code (AIN, NEINE, etc.)
  name: string;                     // Full descriptive name
  shortTitle: string;               // Brief caption for UI
  focusState: string;               // "I Experience", "My Heart", etc.
  element: Element;
  elementNumber: number;            // 1, 2, or 3 within element
  phase: Phase;                     // Vector, Circle, or Spiral
  angle: number;                    // Position on holoflower (0-360°)

  // Visual properties
  color: string;                    // Primary color for this facet
  gradient: {
    from: string;
    to: string;
  };
  symbol: string;                   // Emoji or icon representation

  // Content and meaning
  description: string;              // Full description of facet
  keyQuestion: string;              // Primary reflection question
  deeperMeaning: string;           // Esoteric/deeper interpretation
  affirmation: string;             // Positive affirmation
  shadow: string;                  // Shadow aspect to be aware of

  // Crystal and remedies
  crystal: string;                 // Associated crystal/stone
  crystalProperties: string;       // Crystal healing properties
  essence: string;                 // Flower or vibrational essence

  // Practices and integration
  practices: string[];             // Suggested practices
  journalPrompts: string[];        // Multiple journal prompts
  bodyFocus: string;               // Body area/chakra association

  // Archetypal associations
  archetype: string;               // Jungian or mythological archetype
  mythology: string;               // Associated myth or story

  // Relationship to other facets
  complements: string[];           // Facet codes that complement
  tensions: string[];              // Facet codes that create tension
  evolution: {
    from: string;                   // Previous facet in evolution
    to: string;                     // Next facet in evolution
  };
}

/**
 * Complete 12-Facet Spiralogic Dataset
 * Ordered by elemental progression: Fire → Water → Earth → Air
 */
export const SPIRALOGIC_FACETS: SpiralogicFacet[] = [
  // ═══════════════════════════════════════════════════════════════
  // FIRE ELEMENT - Spiritual, Intuitive Intelligence
  // ═══════════════════════════════════════════════════════════════

  {
    id: 1,
    code: 'FEU',
    name: 'Self-Awareness',
    shortTitle: 'Ignite Will',
    focusState: 'I Experience',
    element: 'fire',
    elementNumber: 1,
    phase: 'vector',
    angle: 30,
    color: '#FF6B6B',
    gradient: { from: '#FF6B6B', to: '#FF8E53' },
    symbol: '🔥',

    description: 'Ego, Persona, Free Will, and Vision for the Future. The spark of consciousness that initiates all transformation.',
    keyQuestion: 'What does your intuition frequently tell you about your path?',
    deeperMeaning: 'Creating a clear and compelling future through personal identity and vision. This is where the soul ignites its purpose.',
    affirmation: 'I am a divine spark of consciousness, creating my reality with intention.',
    shadow: 'Ego inflation, disconnection from collective wisdom, spiritual bypassing.',

    crystal: 'Carnelian',
    crystalProperties: 'Activates sacral chakra, enhances creativity and courage, grounds spiritual vision into action.',
    essence: 'Wild Rose - for apathy and resignation, igniting enthusiasm for life.',

    practices: [
      'Morning sun gazing meditation',
      'Candle flame meditation',
      'Creative visualization of desired future',
      'Fire breath (Breath of Fire) practice'
    ],
    journalPrompts: [
      'What vision for my future excites me most deeply?',
      'How does my ego serve my highest purpose?',
      'What aspects of my identity are ready for transformation?',
      'Where in my life do I need more sacred fire?'
    ],
    bodyFocus: 'Solar Plexus - seat of personal power and will',

    archetype: 'The Magician/Prometheus',
    mythology: 'The stealing of fire from the gods - consciousness awakening to its creative power.',

    complements: ['AIN', 'CHEN'],
    tensions: ['IEVE', 'NEINE'],
    evolution: { from: 'ZWOIF', to: 'VUNV' }
  },

  {
    id: 2,
    code: 'VUNV',
    name: 'Self-In-World',
    shortTitle: 'Transform Trials',
    focusState: 'I Express',
    element: 'fire',
    elementNumber: 2,
    phase: 'circle',
    angle: 60,
    color: '#FF8E53',
    gradient: { from: '#FF8E53', to: '#FFA500' },
    symbol: '✨',

    description: 'Play, Personal Expression, Self/World Resonance. Alchemizing inner fire through creative action.',
    keyQuestion: 'In what ways do you creatively express your individuality?',
    deeperMeaning: 'Bringing inner vision to outer expression and refining through feedback. The dance between self and world.',
    affirmation: 'I express my authentic self with joy and receive the world\'s reflection with grace.',
    shadow: 'Performance anxiety, inauthenticity, addiction to external validation.',

    crystal: 'Citrine',
    crystalProperties: 'Manifestation stone, transforms negative energy, enhances self-expression and confidence.',
    essence: 'Larch - for lack of confidence and fear of failure.',

    practices: [
      'Ecstatic dance or movement',
      'Creative arts without judgment',
      'Improvisation exercises',
      'Sacred play and spontaneity'
    ],
    journalPrompts: [
      'How does the world mirror my inner state?',
      'What wants to be expressed through me today?',
      'Where am I holding back my authentic expression?',
      'How can I alchemize challenges into creative fuel?'
    ],
    bodyFocus: 'Sacral Chakra - center of creativity and emotional expression',

    archetype: 'The Artist/Dionysus',
    mythology: 'The divine child at play, creating worlds through imagination.',

    complements: ['ZWEI', 'ALVE'],
    tensions: ['AGHT', 'CHEN'],
    evolution: { from: 'FEU', to: 'ZECH' }
  },

  {
    id: 3,
    code: 'ZECH',
    name: 'Transcendent Self',
    shortTitle: 'Radiate Light',
    focusState: 'I Expand',
    element: 'fire',
    elementNumber: 3,
    phase: 'spiral',
    angle: 90,
    color: '#FFA500',
    gradient: { from: '#FFA500', to: '#FFD700' },
    symbol: '🌟',

    description: 'Spiritual Essence, Path, and Expansive Development. Radiating your unique light into the world.',
    keyQuestion: 'How do you actively work on your spiritual growth?',
    deeperMeaning: 'Growing spiritually wise through fulfilling vision while resonating with universal consciousness.',
    affirmation: 'I am a radiant being of light, expanding into my infinite potential.',
    shadow: 'Spiritual materialism, guru complex, disconnection from earthly responsibilities.',

    crystal: 'Clear Quartz',
    crystalProperties: 'Master healer, amplifies energy and intention, connects to higher consciousness.',
    essence: 'Star of Bethlehem - for spiritual shock and awakening.',

    practices: [
      'Merkaba meditation',
      'Light body activation',
      'Chanting and toning',
      'Sacred geometry contemplation'
    ],
    journalPrompts: [
      'What is my unique spiritual gift to the world?',
      'How can I shine more brightly without dimming others?',
      'What spiritual teachings am I here to embody?',
      'Where is my expansion calling me next?'
    ],
    bodyFocus: 'Crown Chakra - connection to divine consciousness',

    archetype: 'The Sage/Phoenix',
    mythology: 'The phoenix rising from ashes - spiritual transformation through trials.',

    complements: ['AIRE', 'ZWOIF'],
    tensions: ['IEVE', 'CHEN'],
    evolution: { from: 'VUNV', to: 'IEVE' }
  },

  // ═══════════════════════════════════════════════════════════════
  // WATER ELEMENT - Emotional, Psychic Intelligence
  // ═══════════════════════════════════════════════════════════════

  {
    id: 4,
    code: 'IEVE',
    name: 'Emotional Intelligence',
    shortTitle: 'Open to Flow',
    focusState: 'My Heart',
    element: 'water',
    elementNumber: 1,
    phase: 'vector',
    angle: 120,
    color: '#4A90E2',
    gradient: { from: '#4A90E2', to: '#5DA3FA' },
    symbol: '💧',

    description: 'Capacity to feel seen, nurtured, and at home. Surrendering to emotional currents.',
    keyQuestion: 'How would you evaluate your emotional intelligence and capacity for feeling?',
    deeperMeaning: 'Discovering what emotionally resonates and connecting with inner truth through feeling.',
    affirmation: 'I trust the wisdom of my emotions and flow with life\'s currents.',
    shadow: 'Emotional overwhelm, codependency, inability to set boundaries.',

    crystal: 'Moonstone',
    crystalProperties: 'Enhances intuition, emotional balance, feminine wisdom, lunar consciousness.',
    essence: 'Walnut - for protection during times of change and emotional transition.',

    practices: [
      'Water meditation by streams or ocean',
      'Emotional release through crying',
      'Dream journaling',
      'Lunar cycle tracking'
    ],
    journalPrompts: [
      'What emotions am I avoiding feeling fully?',
      'How can I create more emotional safety for myself?',
      'What does my heart truly long for?',
      'Where do I need to surrender control?'
    ],
    bodyFocus: 'Heart Chakra - center of love and emotional connection',

    archetype: 'The Lover/Aphrodite',
    mythology: 'Venus born from sea foam - beauty and love emerging from emotional depths.',

    complements: ['NEINE', 'FEU'],
    tensions: ['ZECH', 'AIN'],
    evolution: { from: 'ZECH', to: 'AGHT' }
  },

  {
    id: 5,
    code: 'AGHT',
    name: 'Inner Transformation',
    shortTitle: 'Deepen Intuition',
    focusState: 'My Healing',
    element: 'water',
    elementNumber: 2,
    phase: 'circle',
    angle: 150,
    color: '#5DA3FA',
    gradient: { from: '#5DA3FA', to: '#7BB7FF' },
    symbol: '🌊',

    description: 'Transforming subconscious patterns into coherence. Deep psychic healing work.',
    keyQuestion: 'What outdated emotional patterns do you wish to transform?',
    deeperMeaning: 'Inner transformation through facing shadows and releasing emotional blocks.',
    affirmation: 'I courageously explore my depths and transform pain into wisdom.',
    shadow: 'Wallowing in trauma, victim consciousness, emotional manipulation.',

    crystal: 'Labradorite',
    crystalProperties: 'Transformation stone, reveals hidden truths, protects during shadow work.',
    essence: 'Holly - for jealousy, envy, and suspicion blocking love.',

    practices: [
      'Shadow work journaling',
      'Breathwork for emotional release',
      'Inner child healing',
      'Water fasting or cleansing'
    ],
    journalPrompts: [
      'What shadow aspects am I ready to integrate?',
      'How have my wounds become my medicine?',
      'What patterns from my lineage am I healing?',
      'Where do I need deeper self-compassion?'
    ],
    bodyFocus: 'Sacral Chakra - seat of emotional memory and trauma',

    archetype: 'The Alchemist/Persephone',
    mythology: 'Descent to the underworld - transformation through darkness.',

    complements: ['VUNV', 'ALVE'],
    tensions: ['AIN', 'CHEN'],
    evolution: { from: 'IEVE', to: 'NEINE' }
  },

  {
    id: 6,
    code: 'NEINE',
    name: 'Deep Self-Awareness',
    shortTitle: 'Emotional Wisdom',
    focusState: 'My Holiness',
    element: 'water',
    elementNumber: 3,
    phase: 'spiral',
    angle: 180,
    color: '#7BB7FF',
    gradient: { from: '#7BB7FF', to: '#9DD1FF' },
    symbol: '💎',

    description: 'Connection with inner gold, soul essence. Finding the treasure in the depths.',
    keyQuestion: 'How connected do you feel with your innermost sacred self?',
    deeperMeaning: 'Discovering inner truth and the golden seed as gift to the world.',
    affirmation: 'I am a sacred vessel of divine wisdom, holding space for all emotions.',
    shadow: 'Spiritual bypassing of emotions, dissociation, emotional superiority.',

    crystal: 'Aquamarine',
    crystalProperties: 'Courage to speak truth, emotional clarity, connection to divine feminine.',
    essence: 'Rock Rose - for terror and panic, finding courage in crisis.',

    practices: [
      'Sacred bathing rituals',
      'Womb or hara meditation',
      'Emotional alchemy practices',
      'Deep listening to inner wisdom'
    ],
    journalPrompts: [
      'What is the gold hidden in my emotional depths?',
      'How do my emotions serve as sacred messengers?',
      'What holy wisdom emerges from my feeling nature?',
      'How can I honor the sacred waters within?'
    ],
    bodyFocus: 'Third Eye - intuitive sight and psychic awareness',

    archetype: 'The High Priestess/Oracle',
    mythology: 'The Oracle at Delphi - divine wisdom through intuitive knowing.',

    complements: ['IEVE', 'AIRE'],
    tensions: ['FEU', 'ZWEI'],
    evolution: { from: 'AGHT', to: 'CHEN' }
  },

  // ═══════════════════════════════════════════════════════════════
  // EARTH ELEMENT - Somatic, Embodied Intelligence
  // ═══════════════════════════════════════════════════════════════

  {
    id: 7,
    code: 'CHEN',
    name: 'Purpose & Mission',
    shortTitle: 'Ground Purpose',
    focusState: 'The Mission',
    element: 'earth',
    elementNumber: 1,
    phase: 'vector',
    angle: 210,
    color: '#8B7355',
    gradient: { from: '#8B7355', to: '#A0826D' },
    symbol: '🌍',

    description: 'Developing awareness of place in the world. Grounding vision into form.',
    keyQuestion: 'How would you define your purpose or mission in life?',
    deeperMeaning: 'Grounding inner visions into workable form and service to the greater whole.',
    affirmation: 'I am grounded in my purpose and committed to manifesting my mission.',
    shadow: 'Rigidity, workaholism, materialism, disconnection from spirit.',

    crystal: 'Black Tourmaline',
    crystalProperties: 'Grounding and protection, transmutes negative energy, enhances physical vitality.',
    essence: 'Oak - for those who struggle on despite exhaustion.',

    practices: [
      'Walking meditation in nature',
      'Gardening or earth connection',
      'Body scanning and somatic awareness',
      'Creating physical altars or sacred space'
    ],
    journalPrompts: [
      'What is my sacred work in this lifetime?',
      'How can I ground my spiritual insights into practical action?',
      'What legacy do I want to leave?',
      'Where do I need more structure and discipline?'
    ],
    bodyFocus: 'Root Chakra - foundation and survival instincts',

    archetype: 'The Builder/Saturn',
    mythology: 'Master builder of temples - creating sacred structures in physical reality.',

    complements: ['FEU', 'ALVE'],
    tensions: ['AGHT', 'VUNV'],
    evolution: { from: 'NEINE', to: 'ALVE' }
  },

  {
    id: 8,
    code: 'ALVE',
    name: 'Resources & Plans',
    shortTitle: 'Nurture Growth',
    focusState: 'The Means',
    element: 'earth',
    elementNumber: 2,
    phase: 'circle',
    angle: 240,
    color: '#A0826D',
    gradient: { from: '#A0826D', to: '#CD853F' },
    symbol: '🌱',

    description: 'Bringing together teams and resources for success. Cultivating sustainable foundations.',
    keyQuestion: 'What resources do you need to succeed in your mission?',
    deeperMeaning: 'Building resources and support systems to manifest dreams into reality.',
    affirmation: 'I attract and cultivate all resources needed for my highest good.',
    shadow: 'Scarcity mindset, hoarding, manipulation of resources, greed.',

    crystal: 'Green Aventurine',
    crystalProperties: 'Prosperity and growth, heart healing, opportunity and luck.',
    essence: 'Olive - for exhaustion and depletion of resources.',

    practices: [
      'Abundance meditation',
      'Resource mapping and planning',
      'Gratitude practices for what you have',
      'Creating supportive routines'
    ],
    journalPrompts: [
      'What resources am I not recognizing?',
      'How can I better nurture what I\'ve planted?',
      'Where do I need to ask for support?',
      'What sustainable practices will support my growth?'
    ],
    bodyFocus: 'Solar Plexus - personal power and resource management',

    archetype: 'The Gardener/Demeter',
    mythology: 'Demeter\'s abundance - the earth mother providing sustenance.',

    complements: ['VUNV', 'ZWEI'],
    tensions: ['NEINE', 'AIN'],
    evolution: { from: 'CHEN', to: 'ZWOIF' }
  },

  {
    id: 9,
    code: 'ZWOIF',
    name: 'Refined Medicine',
    shortTitle: 'Manifest Abundance',
    focusState: 'The Medicine',
    element: 'earth',
    elementNumber: 3,
    phase: 'spiral',
    angle: 270,
    color: '#CD853F',
    gradient: { from: '#CD853F', to: '#DEB887' },
    symbol: '🌾',

    description: 'Ethics, service, and refined plan of action. Perfecting offerings as medicine for the world.',
    keyQuestion: 'How do you give back to society and the planet?',
    deeperMeaning: 'Perfecting offerings as well-formed gifts to the world, embodying sacred service.',
    affirmation: 'My life is medicine for the world, offered with love and mastery.',
    shadow: 'Martyrdom, burnout, attachment to outcomes, savior complex.',

    crystal: 'Tiger\'s Eye',
    crystalProperties: 'Courage and right action, discernment, grounded spirituality.',
    essence: 'Vine - for dominating and inflexible leadership.',

    practices: [
      'Service meditation',
      'Ethical review of actions',
      'Craft mastery and skill development',
      'Earth offering ceremonies'
    ],
    journalPrompts: [
      'What medicine am I here to offer the world?',
      'How can I refine my gifts to serve more effectively?',
      'Where is my service needed most?',
      'What does ethical success look like for me?'
    ],
    bodyFocus: 'Hands - instruments of creation and service',

    archetype: 'The Healer/Chiron',
    mythology: 'The wounded healer - transforming wounds into medicine for others.',

    complements: ['ZECH', 'AIRE'],
    tensions: ['IEVE', 'ZWEI'],
    evolution: { from: 'ALVE', to: 'AIN' }
  },

  // ═══════════════════════════════════════════════════════════════
  // AIR ELEMENT - Mental, Relational, Communicative Intelligence
  // ═══════════════════════════════════════════════════════════════

  {
    id: 10,
    code: 'AIN',
    name: 'Interpersonal',
    shortTitle: 'Breathe Connection',
    focusState: 'This Connection',
    element: 'air',
    elementNumber: 1,
    phase: 'vector',
    angle: 300,
    color: '#87CEEB',
    gradient: { from: '#87CEEB', to: '#ADD8E6' },
    symbol: '🤝',

    description: 'Perfecting one-to-one relationships. Understanding how relating reflects inner organization.',
    keyQuestion: 'How would you describe your interpersonal patterns?',
    deeperMeaning: 'Understanding how we relate reflects our inner organization and consciousness.',
    affirmation: 'I breathe love into all my connections and receive wisdom from each encounter.',
    shadow: 'Projection, manipulation, isolation, fear of intimacy.',

    crystal: 'Blue Lace Agate',
    crystalProperties: 'Gentle communication, peace in relationships, throat chakra healing.',
    essence: 'Chicory - for possessive and conditionally loving relationships.',

    practices: [
      'Conscious communication practice',
      'Mirror work with relationships',
      'Breath synchronization with others',
      'Loving-kindness meditation'
    ],
    journalPrompts: [
      'What do my relationships mirror about my inner world?',
      'How can I bring more presence to my connections?',
      'What patterns repeat in my relationships?',
      'Where do I need clearer boundaries?'
    ],
    bodyFocus: 'Throat Chakra - authentic communication and expression',

    archetype: 'The Diplomat/Libra',
    mythology: 'The scales of justice - finding balance in relationship.',

    complements: ['FEU', 'ZWEI'],
    tensions: ['AGHT', 'IEVE'],
    evolution: { from: 'ZWOIF', to: 'ZWEI' }
  },

  {
    id: 11,
    code: 'ZWEI',
    name: 'Collective Dynamics',
    shortTitle: 'Weave Community',
    focusState: 'This Community',
    element: 'air',
    elementNumber: 2,
    phase: 'circle',
    angle: 330,
    color: '#ADD8E6',
    gradient: { from: '#ADD8E6', to: '#B0E0E6' },
    symbol: '👥',

    description: 'Relating to groups and collective paradigms. Building conscious community.',
    keyQuestion: 'How do you contribute to group dynamics and collective consciousness?',
    deeperMeaning: 'Building conscious collectives through authentic connection and shared vision.',
    affirmation: 'I weave threads of connection that strengthen the whole tapestry.',
    shadow: 'Groupthink, mob mentality, loss of individual identity, cult dynamics.',

    crystal: 'Sodalite',
    crystalProperties: 'Group harmony, rational thought, truth-seeking in community.',
    essence: 'Beech - for intolerance and criticism of others.',

    practices: [
      'Group meditation or prayer',
      'Circle work and council',
      'Community service',
      'Studying group dynamics'
    ],
    journalPrompts: [
      'What is my role in the collective?',
      'How can I maintain individuality within community?',
      'What communities am I called to serve?',
      'Where do I need to speak truth to the group?'
    ],
    bodyFocus: 'Heart-Throat Bridge - connecting feeling with expression in groups',

    archetype: 'The Networker/Mercury',
    mythology: 'Hermes the messenger - weaving connections between worlds.',

    complements: ['AIN', 'ALVE'],
    tensions: ['NEINE', 'ZWOIF'],
    evolution: { from: 'AIN', to: 'AIRE' }
  },

  {
    id: 12,
    code: 'AIRE',
    name: 'Codified Systems',
    shortTitle: 'Synthesize Wisdom',
    focusState: 'This Consciousness',
    element: 'air',
    elementNumber: 3,
    phase: 'spiral',
    angle: 0,
    color: '#B0E0E6',
    gradient: { from: '#B0E0E6', to: '#E0F7FA' },
    symbol: '📡',

    description: 'Elevated communications and formal systems. Codifying wisdom into clear intelligence.',
    keyQuestion: 'How proficient are you in formal communications and systems thinking?',
    deeperMeaning: 'Codifying wisdom into clear and concise intelligence that serves evolution.',
    affirmation: 'I synthesize complexity into clarity and share wisdom with precision.',
    shadow: 'Intellectual arrogance, analysis paralysis, disconnection from feeling.',

    crystal: 'Fluorite',
    crystalProperties: 'Mental clarity, order from chaos, integration of spiritual and mental.',
    essence: 'White Chestnut - for repetitive thoughts and mental chatter.',

    practices: [
      'Sacred geometry study',
      'Systems mapping',
      'Teaching or writing practice',
      'Meditation on universal laws'
    ],
    journalPrompts: [
      'What wisdom am I called to codify and share?',
      'How can I make complex truth more accessible?',
      'What systems need updating or evolution?',
      'Where does my mind serve my highest purpose?'
    ],
    bodyFocus: 'Crown-Third Eye Bridge - downloading and translating higher wisdom',

    archetype: 'The Teacher/Thoth',
    mythology: 'Thoth the scribe - recording divine wisdom for humanity.',

    complements: ['ZECH', 'NEINE'],
    tensions: ['FEU', 'CHEN'],
    evolution: { from: 'ZWEI', to: 'FEU' }
  }
];

/**
 * Crystal Focus Mapping
 * Maps each crystal focus to relevant facets
 */
export const CRYSTAL_FOCUS_MAPPING: Record<CrystalFocus, string[]> = {
  career: ['CHEN', 'ALVE', 'ZWOIF', 'AIN', 'ZWEI', 'AIRE'],
  spiritual: ['FEU', 'VUNV', 'ZECH', 'NEINE', 'AIRE'],
  relational: ['IEVE', 'AGHT', 'NEINE', 'AIN', 'ZWEI'],
  health: ['CHEN', 'ALVE', 'IEVE', 'AGHT'],
  creative: ['FEU', 'VUNV', 'ZECH', 'ZWEI', 'AIRE'],
  general: ['FEU', 'VUNV', 'ZECH', 'IEVE', 'AGHT', 'NEINE', 'CHEN', 'ALVE', 'ZWOIF', 'AIN', 'ZWEI', 'AIRE']
};

/**
 * Elemental Descriptions
 * Core qualities of each element
 */
export const ELEMENTAL_QUALITIES = {
  fire: {
    name: 'Fire',
    quality: 'Spiritual & Intuitive',
    keywords: ['Vision', 'Passion', 'Transformation', 'Will', 'Spirit'],
    description: 'The realm of spirit, vision, and creative will. Fire represents our divine spark and capacity for transformation.',
    practices: ['Candle meditation', 'Sun gazing', 'Creative visualization', 'Ecstatic dance'],
    chakras: ['Solar Plexus', 'Crown']
  },
  water: {
    name: 'Water',
    quality: 'Emotional & Psychic',
    keywords: ['Feeling', 'Intuition', 'Flow', 'Healing', 'Dreams'],
    description: 'The realm of emotions, intuition, and psychic awareness. Water represents our feeling nature and capacity for deep knowing.',
    practices: ['Dream work', 'Emotional release', 'Water meditation', 'Moon rituals'],
    chakras: ['Sacral', 'Heart', 'Third Eye']
  },
  earth: {
    name: 'Earth',
    quality: 'Somatic & Material',
    keywords: ['Grounding', 'Manifestation', 'Resources', 'Service', 'Form'],
    description: 'The realm of physical manifestation and embodied wisdom. Earth represents our capacity to ground vision into reality.',
    practices: ['Walking meditation', 'Gardening', 'Body scanning', 'Craftsmanship'],
    chakras: ['Root', 'Solar Plexus']
  },
  air: {
    name: 'Air',
    quality: 'Mental & Relational',
    keywords: ['Communication', 'Connection', 'Thought', 'Systems', 'Synthesis'],
    description: 'The realm of mind, communication, and relationship. Air represents our capacity for connection and understanding.',
    practices: ['Breathwork', 'Conscious communication', 'Study', 'Group work'],
    chakras: ['Throat', 'Heart', 'Crown']
  }
};

/**
 * Phase Descriptions
 * The three phases of development
 */
export const PHASE_QUALITIES = {
  vector: {
    name: 'Vector',
    quality: 'Initiation & Direction',
    keywords: ['Beginning', 'Direction', 'Impulse', 'Cardinal', 'Leadership'],
    description: 'The initiating force that sets direction. Vector represents the first impulse of creation and new beginnings.',
    archetype: 'The Pioneer',
    season: 'Spring/New Moon'
  },
  circle: {
    name: 'Circle',
    quality: 'Integration & Process',
    keywords: ['Integration', 'Process', 'Stability', 'Fixed', 'Persistence'],
    description: 'The integrating force that develops and stabilizes. Circle represents the process of refinement and integration.',
    archetype: 'The Builder',
    season: 'Summer/Full Moon'
  },
  spiral: {
    name: 'Spiral',
    quality: 'Transformation & Completion',
    keywords: ['Transformation', 'Completion', 'Evolution', 'Mutable', 'Wisdom'],
    description: 'The transforming force that completes and evolves. Spiral represents mastery and preparation for the next cycle.',
    archetype: 'The Sage',
    season: 'Autumn/Dark Moon'
  }
};

/**
 * Helper Functions
 */

// Get facet by code
export function getFacetByCode(code: string): SpiralogicFacet | undefined {
  return SPIRALOGIC_FACETS.find(f => f.code === code);
}

// Get facets by element
export function getFacetsByElement(element: Element): SpiralogicFacet[] {
  return SPIRALOGIC_FACETS.filter(f => f.element === element);
}

// Get facets by phase
export function getFacetsByPhase(phase: Phase): SpiralogicFacet[] {
  return SPIRALOGIC_FACETS.filter(f => f.phase === phase);
}

// Get facets for crystal focus
export function getFacetsForCrystalFocus(focus: CrystalFocus): SpiralogicFacet[] {
  const codes = CRYSTAL_FOCUS_MAPPING[focus];
  return SPIRALOGIC_FACETS.filter(f => codes.includes(f.code));
}

// Calculate elemental balance from values
export function calculateElementalBalance(facetValues: { code: string; value: number }[]): Record<Element, number> {
  const balance: Record<Element, number> = { fire: 0, water: 0, earth: 0, air: 0 };

  facetValues.forEach(({ code, value }) => {
    const facet = getFacetByCode(code);
    if (facet) {
      balance[facet.element] += value;
    }
  });

  // Normalize to 0-10 scale (3 facets per element)
  Object.keys(balance).forEach(element => {
    balance[element as Element] = balance[element as Element] / 3;
  });

  return balance;
}

// Calculate phase progression from values
export function calculatePhaseProgression(facetValues: { code: string; value: number }[]): Record<Phase, number> {
  const progression: Record<Phase, number> = { vector: 0, circle: 0, spiral: 0 };

  facetValues.forEach(({ code, value }) => {
    const facet = getFacetByCode(code);
    if (facet) {
      progression[facet.phase] += value;
    }
  });

  // Normalize to 0-10 scale (4 facets per phase)
  Object.keys(progression).forEach(phase => {
    progression[phase as Phase] = progression[phase as Phase] / 4;
  });

  return progression;
}

// Get complementary facets
export function getComplementaryFacets(code: string): SpiralogicFacet[] {
  const facet = getFacetByCode(code);
  if (!facet) return [];

  return facet.complements
    .map(c => getFacetByCode(c))
    .filter((f): f is SpiralogicFacet => f !== undefined);
}

// Get tension facets
export function getTensionFacets(code: string): SpiralogicFacet[] {
  const facet = getFacetByCode(code);
  if (!facet) return [];

  return facet.tensions
    .map(c => getFacetByCode(c))
    .filter((f): f is SpiralogicFacet => f !== undefined);
}

// Generate personalized insight based on facet values
export function generatePersonalizedInsight(
  facetValues: { code: string; value: number }[],
  crystalFocus?: CrystalFocus
): string {
  const highestFacets = facetValues
    .sort((a, b) => b.value - a.value)
    .slice(0, 3);

  const lowestFacets = facetValues
    .sort((a, b) => a.value - b.value)
    .slice(0, 3);

  const elementBalance = calculateElementalBalance(facetValues);
  const dominantElement = Object.entries(elementBalance)
    .sort(([, a], [, b]) => b - a)[0][0] as Element;

  const phaseProgression = calculatePhaseProgression(facetValues);
  const dominantPhase = Object.entries(phaseProgression)
    .sort(([, a], [, b]) => b - a)[0][0] as Phase;

  let insight = `Your energy signature shows strong ${dominantElement} with ${dominantPhase} phase activation. `;

  const topFacet = getFacetByCode(highestFacets[0].code);
  if (topFacet) {
    insight += `Your ${topFacet.name} (${topFacet.code}) is radiating powerfully, suggesting ${topFacet.deeperMeaning}. `;
  }

  const lowFacet = getFacetByCode(lowestFacets[0].code);
  if (lowFacet) {
    insight += `Consider bringing attention to ${lowFacet.name} (${lowFacet.code}) through ${lowFacet.practices[0]}. `;
  }

  if (crystalFocus && crystalFocus !== 'general') {
    insight += `With your ${crystalFocus} crystal focus, pay special attention to `;
    const relevantFacets = getFacetsForCrystalFocus(crystalFocus);
    const relevantValues = facetValues.filter(v =>
      relevantFacets.some(f => f.code === v.code)
    );
    const avgValue = relevantValues.reduce((sum, v) => sum + v.value, 0) / relevantValues.length;

    if (avgValue > 7) {
      insight += `maintaining the strong foundation you've built. `;
    } else if (avgValue > 4) {
      insight += `continuing to develop these areas with consistent practice. `;
    } else {
      insight += `gently nurturing these aspects of your journey. `;
    }
  }

  return insight;
}

// Export type guards
export function isValidElement(element: string): element is Element {
  return ['fire', 'water', 'earth', 'air'].includes(element);
}

export function isValidPhase(phase: string): phase is Phase {
  return ['vector', 'circle', 'spiral'].includes(phase);
}

export function isValidCrystalFocus(focus: string): focus is CrystalFocus {
  return ['career', 'spiritual', 'relational', 'health', 'creative', 'general'].includes(focus);
}