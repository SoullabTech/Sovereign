// Holoflower Complete Schema - 12 Petals + 3 Aether Facets
// Living map of elemental evolution through Spiralogic stages

export interface Facet {
  element: string;
  stage: number;
  facet: string;
  essence: string;
  keywords: string[];
  archetype: string;
  practice: string;
  color: string;
  focusState: string;
  learningStyle: string;
  keyQuestions: string[];
  symbol: string;
  shadow?: string;
  blessing?: string;
}

export const facets: Record<string, Facet> = {
  // ============================================
  // FIRE QUADRANT - Action & Transformation
  // ============================================
  
  Fire1: {
    element: "Fire",
    stage: 1,
    facet: "Spark",
    essence: "Ignition, vision, initiation of creative force",
    keywords: ["ignition", "vision", "initiation", "courage"],
    archetype: "The Initiator",
    practice: "Light a candle with intention for something you want to begin",
    color: "#FF6B35",
    focusState: "Spark of Creation",
    learningStyle: "Experiential ignition",
    keyQuestions: [
      "What wants to be ignited in your life?",
      "Where do you feel the spark of new possibility?"
    ],
    symbol: "🔥",
    shadow: "Impulsivity without direction",
    blessing: "Courage to begin"
  },

  Fire2: {
    element: "Fire",
    stage: 2,
    facet: "Blaze",
    essence: "Passion, creation, sustained momentum",
    keywords: ["passion", "creation", "momentum", "intensity"],
    archetype: "The Creator",
    practice: "Create something with your hands today, let passion guide the making",
    color: "#FF9558",
    focusState: "Creative Fire",
    learningStyle: "Passionate creation",
    keyQuestions: [
      "What are you passionate about creating?",
      "How do you sustain your creative fire?"
    ],
    symbol: "🔥",
    shadow: "Burnout from unsustained intensity",
    blessing: "Power of sustained creation"
  },

  Fire3: {
    element: "Fire",
    stage: 3,
    facet: "Phoenix",
    essence: "Rebirth, mastery, transformation through destruction",
    keywords: ["rebirth", "mastery", "transformation", "renewal"],
    archetype: "The Phoenix",
    practice: "Release what no longer serves through conscious letting go",
    color: "#FFB87B",
    focusState: "Sacred Transformation",
    learningStyle: "Transformative mastery",
    keyQuestions: [
      "What needs to die for something new to be born?",
      "How do you embrace transformation?"
    ],
    symbol: "🔥",
    shadow: "Destructive tendencies",
    blessing: "Sacred renewal and rebirth"
  },

  // ============================================
  // WATER QUADRANT - Emotion & Flow
  // ============================================
  
  Water1: {
    element: "Water",
    stage: 1,
    facet: "Droplet",
    essence: "Curiosity, first feeling, receptivity to emotion",
    keywords: ["curiosity", "receptivity", "feeling", "openness"],
    archetype: "The Sensitive",
    practice: "Cup water in your hands and bless it with your intention",
    color: "#4A90E2",
    focusState: "First Touch of Feeling",
    learningStyle: "Emotional receptivity",
    keyQuestions: [
      "What feelings are gently arising?",
      "How can you be more receptive to your emotions?"
    ],
    symbol: "💧",
    shadow: "Emotional overwhelm",
    blessing: "Gentle emotional opening"
  },

  Water2: {
    element: "Water",
    stage: 2,
    facet: "Flow",
    essence: "Surrender, connection, intuitive navigation",
    keywords: ["surrender", "connection", "intuition", "flow"],
    archetype: "The Empath",
    practice: "Move with music, letting your body flow without direction",
    color: "#5BA0F2",
    focusState: "Intuitive Flow",
    learningStyle: "Flowing connection",
    keyQuestions: [
      "Where are you being called to surrender?",
      "How does intuition guide your flow?"
    ],
    symbol: "💧",
    shadow: "Loss of self in others",
    blessing: "Trust in natural flow"
  },

  Water3: {
    element: "Water",
    stage: 3,
    facet: "Ocean",
    essence: "Unity, depth, emotional wisdom",
    keywords: ["unity", "depth", "wisdom", "vastness"],
    archetype: "The Mystic",
    practice: "Sit by water and listen to its ancient wisdom",
    color: "#6BB0FF",
    focusState: "Oceanic Unity",
    learningStyle: "Deep emotional wisdom",
    keyQuestions: [
      "What truth lies in your depths?",
      "How do you embrace emotional vastness?"
    ],
    symbol: "💧",
    shadow: "Drowning in depth",
    blessing: "Infinite emotional wisdom"
  },

  // ============================================
  // EARTH QUADRANT - Grounding & Manifestation
  // ============================================
  
  Earth1: {
    element: "Earth",
    stage: 1,
    facet: "Seed",
    essence: "Potential, patience, grounding into possibility",
    keywords: ["potential", "patience", "grounding", "beginning"],
    archetype: "The Gardener",
    practice: "Plant a seed or intention in soil, water it daily",
    color: "#8B7355",
    focusState: "Sacred Potential",
    learningStyle: "Patient cultivation",
    keyQuestions: [
      "What seeds are you planting?",
      "How do you practice sacred patience?"
    ],
    symbol: "🌱",
    shadow: "Stagnation and inertia",
    blessing: "Sacred patience and trust"
  },

  Earth2: {
    element: "Earth",
    stage: 2,
    facet: "Root",
    essence: "Foundation, nourishment, steady growth",
    keywords: ["foundation", "nourishment", "growth", "stability"],
    archetype: "The Builder",
    practice: "Walk barefoot on earth, feeling your roots deepen",
    color: "#A0845C",
    focusState: "Rooted Foundation",
    learningStyle: "Grounded building",
    keyQuestions: [
      "What foundations are you building?",
      "How do you nourish your roots?"
    ],
    symbol: "🌱",
    shadow: "Rigidity and inflexibility",
    blessing: "Deep unshakeable stability"
  },

  Earth3: {
    element: "Earth",
    stage: 3,
    facet: "Mountain",
    essence: "Permanence, achievement, lasting legacy",
    keywords: ["permanence", "achievement", "legacy", "solidity"],
    archetype: "The Mountain",
    practice: "Build a small cairn as a prayer for permanence",
    color: "#B59963",
    focusState: "Eternal Presence",
    learningStyle: "Embodied mastery",
    keyQuestions: [
      "What legacy are you creating?",
      "How do you embody mountain presence?"
    ],
    symbol: "🌱",
    shadow: "Immobility and stubbornness",
    blessing: "Eternal grounded presence"
  },

  // ============================================
  // AIR QUADRANT - Mind & Communication
  // ============================================
  
  Air1: {
    element: "Air",
    stage: 1,
    facet: "Whisper",
    essence: "Inquiry, perspective, lightness of being",
    keywords: ["inquiry", "perspective", "lightness", "curiosity"],
    archetype: "The Questioner",
    practice: "Write a question and release it to the wind",
    color: "#A8DADC",
    focusState: "Gentle Inquiry",
    learningStyle: "Curious exploration",
    keyQuestions: [
      "What questions are arising?",
      "How can you bring more lightness?"
    ],
    symbol: "🌬️",
    shadow: "Mental distraction",
    blessing: "Fresh perspective"
  },

  Air2: {
    element: "Air",
    stage: 2,
    facet: "Wind",
    essence: "Movement, communication, clarity of thought",
    keywords: ["movement", "communication", "clarity", "connection"],
    archetype: "The Messenger",
    practice: "Speak your truth aloud to the open air",
    color: "#B8E6E8",
    focusState: "Clear Communication",
    learningStyle: "Articulate expression",
    keyQuestions: [
      "What needs to be communicated?",
      "How can you bring more clarity?"
    ],
    symbol: "🌬️",
    shadow: "Detachment from feeling",
    blessing: "Crystal clear seeing"
  },

  Air3: {
    element: "Air",
    stage: 3,
    facet: "Sky",
    essence: "Freedom, vision, expansive truth",
    keywords: ["freedom", "vision", "truth", "expansion"],
    archetype: "The Visionary",
    practice: "Breathe into vast space, expanding your vision",
    color: "#C8F2F4",
    focusState: "Infinite Vision",
    learningStyle: "Visionary expansion",
    keyQuestions: [
      "What vision calls you forward?",
      "How do you embrace infinite possibility?"
    ],
    symbol: "🌬️",
    shadow: "Disconnection from ground",
    blessing: "Infinite visionary perspective"
  },

  // ============================================
  // AETHER CENTER - Transcendent Non-Dual States
  // ============================================
  
  Aether1: {
    element: "Aether",
    stage: 1,
    facet: "Expansive Nature",
    essence: "Exploring and expressing the Self within existence, transcendent expansion",
    keywords: ["transcendence", "mystery", "exploration", "expression"],
    archetype: "The Mystery",
    practice: "Open yourself to one act of expansive expression — write, sing, or simply allow presence to flow outward",
    color: "#E0E0E0",
    focusState: "The Mystery – Expansive Nature",
    learningStyle: "Transcendent Exploration",
    keyQuestions: [
      "How would you describe your experience of exploring and expressing your Self within existence?",
      "What helps you touch the vastness beyond your personal identity?"
    ],
    symbol: "✨",
    shadow: "Lost in expansion",
    blessing: "Sacred mystery unfolding"
  },

  Aether2: {
    element: "Aether",
    stage: 2,
    facet: "Contractive Nature",
    essence: "Witnessing and evolving through experience; drawing wisdom from contraction",
    keywords: ["witnessing", "evolution", "transformation", "depth"],
    archetype: "The Witness",
    practice: "Pause and reflect on a recent experience — what hidden teaching is contracting you into wisdom?",
    color: "#CCCCCC",
    focusState: "The Revelation – Profound Growth",
    learningStyle: "Witnessing and Evolving",
    keyQuestions: [
      "Can you recall a moment of significant growth that came from simply witnessing?",
      "How do you allow contraction to become wisdom rather than resistance?"
    ],
    symbol: "🌀",
    shadow: "Collapsed into density",
    blessing: "Wisdom through witnessing"
  },

  Aether3: {
    element: "Aether",
    stage: 3,
    facet: "Stillness",
    essence: "Passive witnessing, the infinite within the finite, sacred in the profane",
    keywords: ["stillness", "silence", "sacred", "infinite"],
    archetype: "The Silent One",
    practice: "Sit in stillness for five minutes today — notice how the ordinary glows with the sacred",
    color: "#FFFFFF",
    focusState: "The Stillness – Passive Witnessing",
    learningStyle: "Stillness & Awareness",
    keyQuestions: [
      "How do you embrace stillness in your daily life?",
      "Where do you find the infinite within the finite?"
    ],
    symbol: "⭕",
    shadow: "Empty void",
    blessing: "Sacred wholeness"
  }
};

// Helper function to get facet by element and stage
export function getFacet(element: string, stage: number): Facet | undefined {
  const key = `${element}${stage}`;
  return facets[key];
}

// Helper function to detect if input has transcendent qualities
export function hasTranscendentQualities(text: string): boolean {
  const transcendentMarkers = [
    'meditation', 'stillness', 'silence', 'witness', 'awareness',
    'consciousness', 'presence', 'being', 'non-dual', 'unity',
    'oneness', 'void', 'emptiness', 'fullness', 'infinite',
    'eternal', 'timeless', 'spacious', 'boundless', 'transcend',
    'mystery', 'sacred', 'divine', 'source', 'essence',
    'awakening', 'enlightenment', 'liberation', 'surrender',
    'dissolve', 'merge', 'expand', 'contract', 'breathe'
  ];
  
  const lowerText = text.toLowerCase();
  return transcendentMarkers.some(marker => lowerText.includes(marker));
}

// Get all facets for a specific element
export function getElementFacets(element: string): Facet[] {
  return Object.values(facets).filter(f => 
    f.element.toLowerCase() === element.toLowerCase()
  );
}

// Get color for element (for visualization)
export function getElementColor(element: string, stage?: number): string {
  if (stage) {
    const facet = getFacet(element, stage);
    return facet?.color || '#808080';
  }
  
  // Return base color for element
  const elementColors: Record<string, string> = {
    Fire: '#FF6B35',
    Water: '#4A90E2',
    Earth: '#8B7355',
    Air: '#A8DADC',
    Aether: '#E0E0E0'
  };
  
  return elementColors[element] || '#808080';
}