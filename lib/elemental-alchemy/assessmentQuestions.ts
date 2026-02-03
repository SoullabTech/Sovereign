/**
 * ELEMENTAL ALCHEMY ASSESSMENT
 *
 * 15 questions (3 per element) to discover your dominant element.
 * Based on Kelly Nezat's "Elemental Alchemy: The Ancient Art of Living a Phenomenal Life"
 */

export type ElementKey = 'fire' | 'water' | 'earth' | 'air' | 'aether';

export interface AssessmentOption {
  text: string;
  element: ElementKey;
}

export interface AssessmentQuestion {
  id: number;
  question: string;
  options: AssessmentOption[];
}

export interface ElementalResult {
  dominant: ElementKey;
  secondary: ElementKey;
  balance: Record<ElementKey, number>;
  shadowAspects: string[];
  strengths: string[];
  recommendedPractices: string[];
  bookChapters: number[];
}

// Shadow aspects by element (from the book)
export const SHADOW_ASPECTS: Record<ElementKey, string[]> = {
  fire: [
    'Burnout from overextension',
    'Impulsiveness without reflection',
    'Aggression masking insecurity',
    'Scattered energy lacking focus',
    'Spiritual bypassing of practical matters'
  ],
  water: [
    'Emotional overwhelm and flooding',
    'Manipulation through emotional leverage',
    'Stagnation in comfort zones',
    'Victimhood narratives',
    'Emotional avoidance through intellectualizing'
  ],
  earth: [
    'Rigidity and resistance to change',
    'Materialism over meaning',
    'Stagnation disguised as stability',
    'Over-attachment to outcomes',
    'Excessive caution blocking growth'
  ],
  air: [
    'Overthinking and analysis paralysis',
    'Disconnection from body and feelings',
    'Intellectual arrogance',
    'Superficial engagement',
    'Scattered attention'
  ],
  aether: [
    'Dissociation from practical reality',
    'Spiritual bypassing of emotions',
    'Ungroundedness and floating',
    'Escapism into transcendence',
    'False unity masking unresolved conflict'
  ]
};

// Strengths by element
export const ELEMENT_STRENGTHS: Record<ElementKey, string[]> = {
  fire: [
    'Visionary leadership',
    'Transformative energy',
    'Passionate inspiration',
    'Creative ignition',
    'Spiritual courage'
  ],
  water: [
    'Emotional intelligence',
    'Intuitive wisdom',
    'Compassionate presence',
    'Healing capacity',
    'Depth of feeling'
  ],
  earth: [
    'Grounded stability',
    'Practical manifestation',
    'Patient persistence',
    'Reliable consistency',
    'Material wisdom'
  ],
  air: [
    'Clear communication',
    'Intellectual insight',
    'Perspective flexibility',
    'Social connection',
    'Mental agility'
  ],
  aether: [
    'Unity consciousness',
    'Transcendent awareness',
    'Integration capacity',
    'Infinite potential',
    'Spiritual synthesis'
  ]
};

// Recommended book chapters by dominant element
export const ELEMENT_CHAPTERS: Record<ElementKey, number[]> = {
  fire: [5, 6, 7, 8],      // Fire chapters
  water: [9, 10, 11],      // Water chapters
  earth: [12, 13, 14],     // Earth chapters
  air: [15, 16],           // Air chapters
  aether: [17, 18]         // Aether chapters
};

// Recommended practices by element
export const ELEMENT_PRACTICES: Record<ElementKey, string[]> = {
  fire: [
    'Candle Meditation',
    'Creative Visualization',
    'Physical Movement',
    'Artistic Expression'
  ],
  water: [
    'Emotional Intelligence Practice',
    'Deep Immersion Journaling',
    'Shadow Work Integration',
    'Emotional Release'
  ],
  earth: [
    'Mission Clarification',
    'Resource Planning',
    'Embodied Gardening',
    'Practical Skill Building'
  ],
  air: [
    'Vision Meditation',
    'Intellectual Exploration',
    'Shared Dialogue',
    'Intention Setting'
  ],
  aether: [
    'Inner Silence Practice',
    'Unity Meditation',
    'Integrated Reflection',
    'Elemental Awareness Journey'
  ]
};

// Element metadata
export const ELEMENT_INFO: Record<ElementKey, {
  name: string;
  color: string;
  gradient: string;
  yogicPath: string;
  description: string;
}> = {
  fire: {
    name: 'Fire',
    color: 'orange',
    gradient: 'from-orange-500 to-red-600',
    yogicPath: 'Kriya Yoga',
    description: 'Transformation, vision, passion, and spiritual energy'
  },
  water: {
    name: 'Water',
    color: 'blue',
    gradient: 'from-blue-500 to-cyan-600',
    yogicPath: 'Bhakti Yoga',
    description: 'Emotional depth, intuition, healing, and flow'
  },
  earth: {
    name: 'Earth',
    color: 'green',
    gradient: 'from-green-500 to-emerald-600',
    yogicPath: 'Karma Yoga',
    description: 'Stability, groundedness, manifestation, and discipline'
  },
  air: {
    name: 'Air',
    color: 'sky',
    gradient: 'from-sky-500 to-blue-600',
    yogicPath: 'Jnana Yoga',
    description: 'Communication, intellect, perspective, and connection'
  },
  aether: {
    name: 'Aether',
    color: 'purple',
    gradient: 'from-purple-500 to-pink-600',
    yogicPath: 'Integration',
    description: 'Unity, transcendence, infinite potential, and wholeness'
  }
};

/**
 * 15 Assessment Questions
 * Each question has 5 options, one for each element.
 * Options are shuffled when displayed.
 */
export const ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
  // Question Set 1: How you approach challenges
  {
    id: 1,
    question: 'When facing a significant challenge, your first instinct is to:',
    options: [
      { text: 'Take bold action and transform the situation', element: 'fire' },
      { text: 'Tune into your feelings and trust your intuition', element: 'water' },
      { text: 'Create a practical plan with concrete steps', element: 'earth' },
      { text: 'Analyze from multiple perspectives before deciding', element: 'air' },
      { text: 'Step back and see the bigger pattern at play', element: 'aether' }
    ]
  },
  {
    id: 2,
    question: 'In moments of stress, you typically:',
    options: [
      { text: 'Feel an urgent need to take action and make changes', element: 'fire' },
      { text: 'Need time alone to process your emotions', element: 'water' },
      { text: 'Focus on what you can control and stabilize', element: 'earth' },
      { text: 'Talk it through with others or write about it', element: 'air' },
      { text: 'Meditate or seek a higher perspective', element: 'aether' }
    ]
  },
  {
    id: 3,
    question: 'When something goes wrong, your natural response is:',
    options: [
      { text: 'See it as fuel for transformation and growth', element: 'fire' },
      { text: 'Allow yourself to feel it fully before moving forward', element: 'water' },
      { text: 'Assess the damage and begin rebuilding', element: 'earth' },
      { text: 'Understand why it happened through analysis', element: 'air' },
      { text: 'Trust that everything is unfolding as it should', element: 'aether' }
    ]
  },

  // Question Set 2: What energizes you
  {
    id: 4,
    question: 'You feel most energized when:',
    options: [
      { text: 'Pursuing a passionate vision or creative project', element: 'fire' },
      { text: 'Connecting deeply with someone you care about', element: 'water' },
      { text: 'Making tangible progress on meaningful work', element: 'earth' },
      { text: 'Learning something new or having great conversation', element: 'air' },
      { text: 'Experiencing moments of profound unity or insight', element: 'aether' }
    ]
  },
  {
    id: 5,
    question: 'Your ideal way to recharge is:',
    options: [
      { text: 'Dancing, exercise, or creative expression', element: 'fire' },
      { text: 'Being near water or having a good cry', element: 'water' },
      { text: 'Gardening, cooking, or working with your hands', element: 'earth' },
      { text: 'Reading, journaling, or meaningful discussions', element: 'air' },
      { text: 'Meditation, silence, or contemplating the stars', element: 'aether' }
    ]
  },
  {
    id: 6,
    question: 'What draws you most to spiritual practice:',
    options: [
      { text: 'The transformative power and inner fire it ignites', element: 'fire' },
      { text: 'The emotional healing and heart opening', element: 'water' },
      { text: 'The grounding discipline and embodied presence', element: 'earth' },
      { text: 'The wisdom teachings and expanded understanding', element: 'air' },
      { text: 'The connection to something greater than yourself', element: 'aether' }
    ]
  },

  // Question Set 3: How you relate to others
  {
    id: 7,
    question: 'In relationships, you most value:',
    options: [
      { text: 'Passion, inspiration, and shared vision', element: 'fire' },
      { text: 'Emotional intimacy and deep understanding', element: 'water' },
      { text: 'Reliability, commitment, and shared building', element: 'earth' },
      { text: 'Intellectual connection and communication', element: 'air' },
      { text: 'Spiritual partnership and soul recognition', element: 'aether' }
    ]
  },
  {
    id: 8,
    question: 'When supporting a friend in crisis, you:',
    options: [
      { text: 'Help them see possibilities and ignite their courage', element: 'fire' },
      { text: 'Hold space for their feelings with compassion', element: 'water' },
      { text: 'Offer practical help and steady presence', element: 'earth' },
      { text: 'Help them think through options and perspectives', element: 'air' },
      { text: 'Remind them of the bigger picture and their purpose', element: 'aether' }
    ]
  },
  {
    id: 9,
    question: 'In group settings, you naturally:',
    options: [
      { text: 'Lead, inspire, and energize others', element: 'fire' },
      { text: 'Attune to the emotional atmosphere and nurture', element: 'water' },
      { text: 'Organize, plan, and ensure things get done', element: 'earth' },
      { text: 'Facilitate discussion and bridge different views', element: 'air' },
      { text: 'Hold the vision and sense the group\'s potential', element: 'aether' }
    ]
  },

  // Question Set 4: Your inner landscape
  {
    id: 10,
    question: 'Your inner world is most characterized by:',
    options: [
      { text: 'Visions, dreams, and creative fire', element: 'fire' },
      { text: 'Rich emotional currents and intuitive knowing', element: 'water' },
      { text: 'Sensory awareness and embodied presence', element: 'earth' },
      { text: 'Constant thinking, ideas, and mental activity', element: 'air' },
      { text: 'Spacious awareness and subtle perception', element: 'aether' }
    ]
  },
  {
    id: 11,
    question: 'When making important decisions, you rely most on:',
    options: [
      { text: 'Your vision of what could be', element: 'fire' },
      { text: 'Your gut feelings and emotional wisdom', element: 'water' },
      { text: 'Practical considerations and past experience', element: 'earth' },
      { text: 'Logical analysis and gathered information', element: 'air' },
      { text: 'Inner knowing that transcends thought', element: 'aether' }
    ]
  },
  {
    id: 12,
    question: 'You feel most like yourself when:',
    options: [
      { text: 'Passionately pursuing what matters to you', element: 'fire' },
      { text: 'In deep connection with your authentic feelings', element: 'water' },
      { text: 'Grounded in your body and present moment', element: 'earth' },
      { text: 'Expressing your ideas and being understood', element: 'air' },
      { text: 'Experiencing the unity underlying all things', element: 'aether' }
    ]
  },

  // Question Set 5: Your growth edge
  {
    id: 13,
    question: 'Your greatest strength is also your edge. Which resonates most?',
    options: [
      { text: 'Your passion can become burnout or aggression', element: 'fire' },
      { text: 'Your sensitivity can become overwhelm or manipulation', element: 'water' },
      { text: 'Your stability can become rigidity or stagnation', element: 'earth' },
      { text: 'Your thinking can become disconnection or paralysis', element: 'air' },
      { text: 'Your transcendence can become escapism or bypassing', element: 'aether' }
    ]
  },
  {
    id: 14,
    question: 'The lesson you most need to learn is:',
    options: [
      { text: 'Sustainable pacing and channeling energy wisely', element: 'fire' },
      { text: 'Healthy boundaries while staying open-hearted', element: 'water' },
      { text: 'Flexibility and openness to change', element: 'earth' },
      { text: 'Grounding ideas in feeling and action', element: 'air' },
      { text: 'Staying engaged with practical reality', element: 'aether' }
    ]
  },
  {
    id: 15,
    question: 'If you could develop one quality more fully, it would be:',
    options: [
      { text: 'Visionary courage and transformative power', element: 'fire' },
      { text: 'Emotional wisdom and compassionate depth', element: 'water' },
      { text: 'Grounded patience and practical manifestation', element: 'earth' },
      { text: 'Clear communication and intellectual insight', element: 'air' },
      { text: 'Unity consciousness and transcendent awareness', element: 'aether' }
    ]
  }
];

/**
 * Calculate elemental assessment results
 */
export function calculateResults(answers: Record<number, ElementKey>): ElementalResult {
  // Count scores for each element
  const scores: Record<ElementKey, number> = {
    fire: 0,
    water: 0,
    earth: 0,
    air: 0,
    aether: 0
  };

  Object.values(answers).forEach(element => {
    scores[element]++;
  });

  // Calculate percentages
  const total = Object.values(scores).reduce((a, b) => a + b, 0);
  const balance: Record<ElementKey, number> = {
    fire: Math.round((scores.fire / total) * 100),
    water: Math.round((scores.water / total) * 100),
    earth: Math.round((scores.earth / total) * 100),
    air: Math.round((scores.air / total) * 100),
    aether: Math.round((scores.aether / total) * 100)
  };

  // Find dominant and secondary elements
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]) as [ElementKey, number][];
  const dominant = sorted[0][0];
  const secondary = sorted[1][0];

  // Get shadow aspects (top 2 from dominant element)
  const shadowAspects = SHADOW_ASPECTS[dominant].slice(0, 2);

  // Get strengths (top 3 from dominant element)
  const strengths = ELEMENT_STRENGTHS[dominant].slice(0, 3);

  // Get recommended practices
  const recommendedPractices = ELEMENT_PRACTICES[dominant];

  // Get recommended book chapters
  const bookChapters = ELEMENT_CHAPTERS[dominant];

  return {
    dominant,
    secondary,
    balance,
    shadowAspects,
    strengths,
    recommendedPractices,
    bookChapters
  };
}

/**
 * Shuffle array (for randomizing option order)
 */
export function shuffleOptions(options: AssessmentOption[]): AssessmentOption[] {
  const shuffled = [...options];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
