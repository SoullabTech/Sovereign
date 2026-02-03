// @ts-nocheck
/**
 * ASK THE BOOK SERVICE
 *
 * Allows users to directly query specific chapters of Elemental Alchemy
 * Different from ambient loading - this is explicit, user-requested wisdom
 */

import { loadElementChapter, BookSection } from '../knowledge/ElementalAlchemyBookLoader';
import { detectElementsAll, generateDetectionReport } from '../knowledge/SemanticChapterDetector';

export type BookQuery = {
  query: string;
  requestedElement?: 'fire' | 'water' | 'earth' | 'air' | 'aether' | 'spiralogic';
  userId: string;
  timestamp: string;
};

export type BookResponse = {
  query: string;
  detectedThemes: string[];
  loadedChapters: Array<{
    element: string;
    title: string;
    excerpt: string; // First 500 words
    relevance: number; // 0-1
  }>;
  fullTeaching?: string; // Complete chapter content
  suggestedQuestions: string[];
  relatedPractices: string[];
  timestamp: string;
};

/**
 * Process "Ask the Book" query
 */
export async function askTheBook(query: BookQuery): Promise<BookResponse> {
  const { query: userQuery, requestedElement, userId, timestamp } = query;

  // Detect themes in the query
  const detectionReport = generateDetectionReport(userQuery);

  // Determine which chapter(s) to load
  let chaptersToLoad: Array<'fire' | 'water' | 'earth' | 'air' | 'aether' | 'spiralogic'> = [];

  if (requestedElement) {
    // User explicitly requested a chapter
    chaptersToLoad = [requestedElement];
  } else {
    // Use semantic detection
    chaptersToLoad = detectionReport.recommendedChapters as any[];
  }

  if (chaptersToLoad.length === 0) {
    // No specific element detected, return general guidance
    return {
      query: userQuery,
      detectedThemes: [],
      loadedChapters: [],
      suggestedQuestions: [
        'What element am I most curious about? (Fire, Water, Earth, Air, or Aether)',
        'Where am I in my transformation journey right now?',
        'What shadow pattern am I noticing?'
      ],
      relatedPractices: [
        'Try asking about a specific element',
        'Describe your current experience more fully',
        'Name what you\'re feeling or experiencing'
      ],
      timestamp: new Date().toISOString()
    };
  }

  // Load chapter sections
  const loadedChapters: any /* TODO: specify type */[] = [];
  let fullTeaching = '';

  for (const element of chaptersToLoad.slice(0, 2)) { // Max 2 chapters
    const section = await loadElementChapter(element);
    if (section) {
      const excerpt = section.content.substring(0, 2000); // ~500 words
      loadedChapters.push({
        element,
        title: section.chapterTitle,
        excerpt,
        relevance: detectionReport.themes.find(t => t.element === element)?.confidence || 0.5
      });

      // Use first chapter as full teaching
      if (loadedChapters.length === 1) {
        fullTeaching = section.content;
      }
    }
  }

  // Generate suggested questions based on loaded chapters
  const suggestedQuestions = generateSuggestedQuestions(chaptersToLoad[0], userQuery);
  const relatedPractices = generateRelatedPractices(chaptersToLoad[0]);

  // Log the query for analytics
  logBookQuery(userId, userQuery, chaptersToLoad, detectionReport);

  return {
    query: userQuery,
    detectedThemes: detectionReport.themes.map(t => `${t.element} (${(t.confidence * 100).toFixed(0)}%)`),
    loadedChapters,
    fullTeaching,
    suggestedQuestions,
    relatedPractices,
    timestamp: new Date().toISOString()
  };
}

/**
 * Generate contextual questions based on the chapter and user query
 */
function generateSuggestedQuestions(
  element: 'fire' | 'water' | 'earth' | 'air' | 'aether' | 'spiralogic',
  userQuery: string
): string[] {
  const elementQuestions = {
    fire: [
      'What vision is trying to emerge through me?',
      'Where is my creative fire burning unsustainably?',
      'What needs to be released to make space for true inspiration?',
      'How can I honor my creative sovereignty without burning out?'
    ],
    water: [
      'What emotions are asking to be felt right now?',
      'Where am I drowning vs. flowing in my emotional life?',
      'What healing wants to move through me?',
      'How can I hold space for my feelings without being overwhelmed?'
    ],
    earth: [
      'What grounds me and helps me feel present?',
      'Where am I stuck vs. patiently cultivating?',
      'How do I embody this wisdom in practical ways?',
      'What practices help me stay connected to my body?'
    ],
    air: [
      'What new perspective is trying to emerge?',
      'Where am I overthinking vs. gaining clarity?',
      'How can I communicate this understanding to others?',
      'What mental patterns are ready to shift?'
    ],
    aether: [
      'How am I experiencing unity consciousness?',
      'What integration is happening across all elements?',
      'Where is wholeness present in my life?',
      'How can I serve from a place of integration?'
    ],
    spiralogic: [
      'Where am I in my spiral journey right now?',
      'Am I in an inward, stillness, or outward phase?',
      'What facet am I moving through?',
      'What is this cycle teaching me?'
    ]
  };

  return elementQuestions[element] || elementQuestions.fire;
}

/**
 * Generate related practices for the element
 */
function generateRelatedPractices(
  element: 'fire' | 'water' | 'earth' | 'air' | 'aether' | 'spiralogic'
): string[] {
  const elementPractices = {
    fire: [
      'Vision journaling: Write your truest vision without censoring',
      'Creative rest: Schedule intentional pauses between creation cycles',
      'Discernment practice: Ask "Is this mine or borrowed?"'
    ],
    water: [
      'Emotional body scan: Feel and name emotions in your body',
      'Water ritual: Release stuck emotions through crying, bathing, or movement',
      'Boundary practice: Notice where you take on others\' feelings'
    ],
    earth: [
      'Grounding meditation: Connect with your body and the earth',
      'Nature practice: Spend time in nature without agenda',
      'Somatic practice: Dance, yoga, or body-based movement'
    ],
    air: [
      'Mindfulness practice: Observe thoughts without attachment',
      'Breath work: Conscious breathing to clear mental fog',
      'Writing practice: Journal to clarify and communicate insights'
    ],
    aether: [
      'Witnessing practice: Observe all elements within you',
      'Unity meditation: Experience interconnection',
      'Sacred service: Serve from wholeness, not depletion'
    ],
    spiralogic: [
      'Spiral reflection: Journal your current phase',
      'Pattern recognition: Notice what\'s cycling back',
      'Integration practice: Weave together past and present learning'
    ]
  };

  return elementPractices[element] || elementPractices.fire;
}

/**
 * Log query for analytics
 */
function logBookQuery(
  userId: string,
  query: string,
  chapters: string[],
  detectionReport: any
): void {
  // This would connect to analytics system
  console.log('📖 [ASK THE BOOK]', {
    userId,
    query: query.substring(0, 100),
    chaptersLoaded: chapters,
    detectionSummary: detectionReport.summary,
    timestamp: new Date().toISOString()
  });

  // TODO: Send to analytics database when implemented
}

/**
 * Get popular queries (for suggestions)
 */
export async function getPopularQueries(limit: number = 10): Promise<string[]> {
  // TODO: Implement when analytics DB is ready
  // For now, return curated examples
  return [
    'What does the book say about burnout?',
    'How do I work with emotional overwhelm?',
    'What is the Fire phase about?',
    'Help me understand the spiral process',
    'What practices ground me in my body?',
    'How do I know if I\'m spiritually bypassing?',
    'What is the Water-2 facet teaching?',
    'How do all the elements work together?',
    'What is alchemical transformation?',
    'How do I integrate shadow and light?'
  ];
}

/**
 * Get chapter summary (for browse mode)
 */
export async function getChapterSummary(
  element: 'fire' | 'water' | 'earth' | 'air' | 'aether' | 'spiralogic'
): Promise<{
  element: string;
  title: string;
  summary: string;
  keyThemes: string[];
  shadowPatterns: string[];
  goldMedicine: string[];
}> {
  const summaries = {
    fire: {
      element: 'Fire',
      title: 'The Element of Spirit and Energy',
      summary: 'Fire is the spark of vision, creativity, and spiritual energy. It represents our capacity for transformation, inspiration, and purpose. The Fire chapter explores how to work with creative energy sustainably, recognize when we\'re burning out, and cultivate sacred discernment.',
      keyThemes: [
        'Vision and purpose',
        'Creative sovereignty',
        'Sustainable inspiration',
        'Spiritual discernment'
      ],
      shadowPatterns: [
        'Burnout from over-giving creative energy',
        'Manic creation without grounding',
        'Spiritual bypassing',
        'Scattered energy across too many visions'
      ],
      goldMedicine: [
        'Sustainable creative practice',
        'Paced creativity with rest cycles',
        'Grounded vision',
        'Focused creative sovereignty'
      ]
    },
    water: {
      element: 'Water',
      title: 'The Depths of Emotional Intelligence',
      summary: 'Water is the realm of emotions, healing, and depth. It teaches us to flow with our feelings, develop emotional intelligence, and become healing presences without drowning in overwhelm. The Water chapter guides us through the depths of emotional experience.',
      keyThemes: [
        'Emotional depth and sensitivity',
        'Healing and purification',
        'Emotional flow and intelligence',
        'Compassionate boundaries'
      ],
      shadowPatterns: [
        'Drowning in emotional overwhelm',
        'Stuck in sadness, unable to flow',
        'Over-empathy, taking on others\' emotions',
        'Emotional bypassing'
      ],
      goldMedicine: [
        'Emotional fluency',
        'Healthy emotional processing',
        'Compassionate boundaries',
        'Healing without depletion'
      ]
    },
    earth: {
      element: 'Earth',
      title: 'The Element of Embodied Living',
      summary: 'Earth is grounding, manifestation, and embodiment. It teaches us to root in our bodies, be present with what is, and patiently tend our growth. The Earth chapter explores how to manifest wisdom in practical form.',
      keyThemes: [
        'Grounding and embodiment',
        'Practical manifestation',
        'Patient cultivation',
        'Abundant harvest'
      ],
      shadowPatterns: [
        'Stuck, rigid, can\'t move forward',
        'Impatience, forcing growth',
        'Hoarding, attachment to form',
        'Disconnection from body'
      ],
      goldMedicine: [
        'Embodied presence',
        'Patient tending',
        'Generous abundance',
        'Somatic wisdom'
      ]
    },
    air: {
      element: 'Air',
      title: 'The Element of Intellect and Mind',
      summary: 'Air is clarity, communication, and connection. It represents our capacity for understanding, teaching, and bridging different perspectives. The Air chapter guides us to think clearly and communicate wisely.',
      keyThemes: [
        'Mental clarity',
        'Inspired communication',
        'Bridging understanding',
        'Wisdom teaching'
      ],
      shadowPatterns: [
        'Overthinking, analysis paralysis',
        'Disconnection from body and feeling',
        'Spiritual bypassing through intellect',
        'Mental fog and confusion'
      ],
      goldMedicine: [
        'Clear thinking',
        'Embodied communication',
        'Bridge building',
        'Integrated wisdom sharing'
      ]
    },
    aether: {
      element: 'Aether',
      title: 'The Quintessential Harmony',
      summary: 'Aether is unity, integration, and wholeness. It represents the synthesis of all elements and the experience of unity consciousness. The Aether chapter explores how to hold all parts in awareness.',
      keyThemes: [
        'Unity consciousness',
        'Elemental integration',
        'Wholeness and synthesis',
        'Transcendent service'
      ],
      shadowPatterns: [
        'Spiritual bypassing',
        'Dissociation from reality',
        'Using unity to avoid particularity',
        'Ungrounded transcendence'
      ],
      goldMedicine: [
        'Grounded transcendence',
        'Unity in diversity',
        'Integrated wholeness',
        'Service from fullness'
      ]
    },
    spiralogic: {
      element: 'Spiralogic',
      title: 'The Torus of Change',
      summary: 'Spiralogic is the process of transformation itself - the spiral journey through regression, progression, and integration. It teaches us that growth is cyclical, not linear, and that we return to familiar themes at deeper levels.',
      keyThemes: [
        'Spiral evolution',
        'Regression and progression',
        'Cyclical development',
        'Toroidal flow'
      ],
      shadowPatterns: [
        'Linear thinking about growth',
        'Shame about "going backwards"',
        'Rushing through cycles',
        'Avoiding necessary regression'
      ],
      goldMedicine: [
        'Trust in spiral timing',
        'Honor regression as deepening',
        'Patience with the process',
        'Cyclical wisdom'
      ]
    }
  };

  return summaries[element];
}
