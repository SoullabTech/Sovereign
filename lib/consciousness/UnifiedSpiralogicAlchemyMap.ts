/**
 * UNIFIED SPIRALOGIC-ALCHEMY INTEGRATION MAPPING
 *
 * Creates the complete synthesis between:
 * - 12-Phase Spiralogic Journey (from Kelly's book)
 * - Classical Alchemical Stages (Nigredo, Albedo, Citrinitas, Rubedo, Quinta Essentia)
 * - Elemental Intelligence (Fire, Water, Earth, Air, Aether)
 * - Cardinal/Fixed/Mutable Qualities
 * - Spiral Dynamics (Inward, Stillness, Outward)
 *
 * This is THE ROSETTA STONE for consciousness transformation in MAIA.
 */

import { Element, Phase, ElementQuality } from './spiralogic-core';

export type AlchemicalStage = 'nigredo' | 'albedo' | 'citrinitas' | 'rubedo' | 'quinta_essentia';
export type SpiralDirection = 'inward' | 'stillness' | 'outward' | 'synthesis';

/**
 * Complete unified mapping for each facet
 */
export interface UnifiedFacetMapping {
  // Identity
  facetId: string;                    // "Fire-1", "Water-2", etc.
  facetNumber: number;                // 1-12

  // Spiralogic attributes
  element: Element;
  phase: Phase;
  quality: ElementQuality;

  // Alchemical stage
  alchemicalStage: AlchemicalStage;
  alchemicalColor: string;            // Black, White, Yellow, Red, Prismatic

  // Spiral dynamics
  spiralDirection: SpiralDirection;
  spiralPhaseDescription: string;

  // Consciousness characteristics
  consciousnessLevel: 1 | 2 | 3 | 4 | 5;  // Depth requirement
  consciousnessFocus: string;

  // Book teachings
  bookChapter: 'fire' | 'water' | 'earth' | 'air' | 'aether' | 'spiralogic';
  developmentalTheme: string;
  shadowPattern: string;
  goldMedicine: string;

  // Practical guidance
  typicalQuestions: string[];
  healingPractices: string[];
  integrationTasks: string[];
}

/**
 * THE COMPLETE 12-PHASE UNIFIED MAP
 *
 * This is the synthesis of:
 * - Kelly's Elemental Alchemy book structure
 * - Traditional alchemical stages
 * - Spiral consciousness development
 */
export const UNIFIED_FACET_MAP: UnifiedFacetMapping[] = [
  // =============================================
  // FIRE TRIAD - NIGREDO (Blackening/Shadow Work)
  // =============================================

  {
    facetId: 'Fire-1',
    facetNumber: 1,
    element: 'Fire',
    phase: 1,
    quality: 'Cardinal',

    alchemicalStage: 'nigredo',
    alchemicalColor: 'Black',

    spiralDirection: 'inward',
    spiralPhaseDescription: 'Confronting the shadow, entering the void',

    consciousnessLevel: 1,
    consciousnessFocus: 'Recognition of shadow and unconscious patterns',

    bookChapter: 'fire',
    developmentalTheme: 'First spark of vision emerging from darkness',
    shadowPattern: 'Manic creation without grounding, spiritual bypassing',
    goldMedicine: 'Sacred discernment of true purpose',

    typicalQuestions: [
      'What is my vision trying to show me?',
      'What am I avoiding by staying in motion?',
      'Where is my fire burning unsustainably?'
    ],
    healingPractices: [
      'Shadow journaling',
      'Slowing down to feel',
      'Grounding practices before creating'
    ],
    integrationTasks: [
      'Name one shadow pattern',
      'Pause before starting new projects',
      'Check: Is this sustainable?'
    ]
  },

  {
    facetId: 'Fire-2',
    facetNumber: 2,
    element: 'Fire',
    phase: 2,
    quality: 'Fixed',

    alchemicalStage: 'nigredo',
    alchemicalColor: 'Black',

    spiralDirection: 'stillness',
    spiralPhaseDescription: 'Burning away false identities, purification by fire',

    consciousnessLevel: 2,
    consciousnessFocus: 'Burning away false identities and attachments',

    bookChapter: 'fire',
    developmentalTheme: 'Refining vision through trial by fire',
    shadowPattern: 'Burnout from over-giving creative energy',
    goldMedicine: 'Sustainable inspiration, paced creativity',

    typicalQuestions: [
      'What needs to burn away?',
      'Which visions are truly mine vs. borrowed?',
      'How can I sustain this fire without burning out?'
    ],
    healingPractices: [
      'Rest as sacred practice',
      'Discernment exercises',
      'Energy boundary setting'
    ],
    integrationTasks: [
      'Release one project that isn\'t truly yours',
      'Build in rest between creation cycles',
      'Practice saying "not yet" to new ideas'
    ]
  },

  {
    facetId: 'Fire-3',
    facetNumber: 3,
    element: 'Fire',
    phase: 3,
    quality: 'Mutable',

    alchemicalStage: 'nigredo',
    alchemicalColor: 'Black transitioning to White',

    spiralDirection: 'outward',
    spiralPhaseDescription: 'Embracing the creative void, emerging with purified vision',

    consciousnessLevel: 2,
    consciousnessFocus: 'Embracing the void and creative potential',

    bookChapter: 'fire',
    developmentalTheme: 'Mastery of creative power, sustainable radiance',
    shadowPattern: 'Scattered energy, too many visions',
    goldMedicine: 'Focused creative sovereignty',

    typicalQuestions: [
      'What is my ONE true vision?',
      'How do I radiate without depleting?',
      'What creative practice sustains me?'
    ],
    healingPractices: [
      'Creative rituals',
      'Vision clarification',
      'Energy cultivation practices'
    ],
    integrationTasks: [
      'Commit to ONE primary vision',
      'Create a sustainable creative practice',
      'Share your light without burning out'
    ]
  },

  // =============================================
  // WATER TRIAD - ALBEDO (Whitening/Purification)
  // =============================================

  {
    facetId: 'Water-1',
    facetNumber: 4,
    element: 'Water',
    phase: 1,
    quality: 'Cardinal',

    alchemicalStage: 'albedo',
    alchemicalColor: 'White',

    spiralDirection: 'inward',
    spiralPhaseDescription: 'Descending into emotional depths',

    consciousnessLevel: 3,
    consciousnessFocus: 'Purification and emotional clarity',

    bookChapter: 'water',
    developmentalTheme: 'Opening to emotional depth and sensitivity',
    shadowPattern: 'Drowning in feelings, emotional overwhelm',
    goldMedicine: 'Emotional fluency and discernment',

    typicalQuestions: [
      'What am I really feeling?',
      'Where am I drowning vs. flowing?',
      'What emotions need to be felt and released?'
    ],
    healingPractices: [
      'Emotional somatic practices',
      'Crying as release',
      'Water meditation'
    ],
    integrationTasks: [
      'Name and feel three emotions today',
      'Journal emotional patterns',
      'Allow yourself to cry'
    ]
  },

  {
    facetId: 'Water-2',
    facetNumber: 5,
    element: 'Water',
    phase: 2,
    quality: 'Fixed',

    alchemicalStage: 'albedo',
    alchemicalColor: 'White',

    spiralDirection: 'stillness',
    spiralPhaseDescription: 'Becoming the still pond, emotional integration',

    consciousnessLevel: 3,
    consciousnessFocus: 'Integration of emotional wisdom',

    bookChapter: 'water',
    developmentalTheme: 'Developing emotional flow and intelligence',
    shadowPattern: 'Stuck in sadness, unable to move emotions',
    goldMedicine: 'Emotional flow, healthy processing',

    typicalQuestions: [
      'How do I move stuck emotions?',
      'Where am I holding vs. processing?',
      'What helps me flow again?'
    ],
    healingPractices: [
      'Movement practices',
      'Breathwork',
      'Emotional release rituals'
    ],
    integrationTasks: [
      'Move one stuck emotion',
      'Practice emotional boundaries',
      'Flow with what is'
    ]
  },

  {
    facetId: 'Water-3',
    facetNumber: 6,
    element: 'Water',
    phase: 3,
    quality: 'Mutable',

    alchemicalStage: 'albedo',
    alchemicalColor: 'White transitioning to Yellow',

    spiralDirection: 'outward',
    spiralPhaseDescription: 'Becoming the healing waters for others',

    consciousnessLevel: 3,
    consciousnessFocus: 'Healing relational patterns',

    bookChapter: 'water',
    developmentalTheme: 'Emotional wisdom and healing presence',
    shadowPattern: 'Over-empathy, taking on others\' emotions',
    goldMedicine: 'Compassionate boundaries, healing without drowning',

    typicalQuestions: [
      'How can I be present without drowning?',
      'Where are my emotional boundaries?',
      'How do I heal without depleting?'
    ],
    healingPractices: [
      'Boundary practices',
      'Energetic clearing',
      'Compassion with discernment'
    ],
    integrationTasks: [
      'Practice one clear boundary',
      'Hold space without taking on',
      'Offer healing from fullness'
    ]
  },

  // =============================================
  // EARTH TRIAD - CITRINITAS (Yellowing/Awakening)
  // =============================================

  {
    facetId: 'Earth-1',
    facetNumber: 7,
    element: 'Earth',
    phase: 1,
    quality: 'Cardinal',

    alchemicalStage: 'citrinitas',
    alchemicalColor: 'Yellow',

    spiralDirection: 'inward',
    spiralPhaseDescription: 'Taking root, establishing foundation',

    consciousnessLevel: 4,
    consciousnessFocus: 'Grounding wisdom in practical form',

    bookChapter: 'earth',
    developmentalTheme: 'Grounding in body and practical reality',
    shadowPattern: 'Stuck, rigid, can\'t move forward',
    goldMedicine: 'Embodied presence, practical wisdom',

    typicalQuestions: [
      'What grounds me?',
      'How do I embody this wisdom?',
      'Where do I take root?'
    ],
    healingPractices: [
      'Somatic practices',
      'Nature connection',
      'Body-based meditation'
    ],
    integrationTasks: [
      'Establish one grounding practice',
      'Connect with physical body daily',
      'Create practical structure'
    ]
  },

  {
    facetId: 'Earth-2',
    facetNumber: 8,
    element: 'Earth',
    phase: 2,
    quality: 'Fixed',

    alchemicalStage: 'citrinitas',
    alchemicalColor: 'Yellow',

    spiralDirection: 'stillness',
    spiralPhaseDescription: 'Cultivating with patience, tending growth',

    consciousnessLevel: 4,
    consciousnessFocus: 'Manifestation of integrated understanding',

    bookChapter: 'earth',
    developmentalTheme: 'Patient cultivation and growth',
    shadowPattern: 'Impatience, forcing growth, over-controlling',
    goldMedicine: 'Patient tending, trust in natural timing',

    typicalQuestions: [
      'What needs patient tending?',
      'Where am I forcing vs. allowing?',
      'How do I trust the process?'
    ],
    healingPractices: [
      'Gardening/tending',
      'Patience practices',
      'Seasonal rhythms'
    ],
    integrationTasks: [
      'Tend something with patience',
      'Release control of timing',
      'Trust natural unfolding'
    ]
  },

  {
    facetId: 'Earth-3',
    facetNumber: 9,
    element: 'Earth',
    phase: 3,
    quality: 'Mutable',

    alchemicalStage: 'citrinitas',
    alchemicalColor: 'Yellow transitioning to Red',

    spiralDirection: 'outward',
    spiralPhaseDescription: 'Harvest time, manifestation complete',

    consciousnessLevel: 4,
    consciousnessFocus: 'Embodiment of transformed consciousness',

    bookChapter: 'earth',
    developmentalTheme: 'Manifestation mastery, abundant harvest',
    shadowPattern: 'Hoarding, attachment to form, materialism',
    goldMedicine: 'Generous abundance, embodied wisdom',

    typicalQuestions: [
      'What is ready to harvest?',
      'How do I share this abundance?',
      'What form serves the whole?'
    ],
    healingPractices: [
      'Gratitude practices',
      'Generosity',
      'Releasing attachment'
    ],
    integrationTasks: [
      'Harvest and share',
      'Give from abundance',
      'Embody the wisdom'
    ]
  },

  // =============================================
  // AIR TRIAD - RUBEDO (Reddening/Integration)
  // =============================================

  {
    facetId: 'Air-1',
    facetNumber: 10,
    element: 'Air',
    phase: 1,
    quality: 'Cardinal',

    alchemicalStage: 'rubedo',
    alchemicalColor: 'Red',

    spiralDirection: 'outward',
    spiralPhaseDescription: 'Rising perspective, seeing the whole',

    consciousnessLevel: 5,
    consciousnessFocus: 'Communication of integrated wisdom',

    bookChapter: 'air',
    developmentalTheme: 'Mental clarity and fresh perspective',
    shadowPattern: 'Overthinking, analysis paralysis, disconnection',
    goldMedicine: 'Clear thinking, inspired communication',

    typicalQuestions: [
      'What new perspective is emerging?',
      'How do I share this understanding?',
      'Where does clarity want to flow?'
    ],
    healingPractices: [
      'Mindfulness',
      'Breath practices',
      'Writing/teaching'
    ],
    integrationTasks: [
      'Write down key insights',
      'Share one teaching',
      'Practice clear communication'
    ]
  },

  {
    facetId: 'Air-2',
    facetNumber: 11,
    element: 'Air',
    phase: 2,
    quality: 'Fixed',

    alchemicalStage: 'rubedo',
    alchemicalColor: 'Red',

    spiralDirection: 'outward',
    spiralPhaseDescription: 'Bridging worlds, translating wisdom',

    consciousnessLevel: 5,
    consciousnessFocus: 'Service and teaching through connection',

    bookChapter: 'air',
    developmentalTheme: 'Connecting and integrating all perspectives',
    shadowPattern: 'Spiritual bypassing through intellect',
    goldMedicine: 'Embodied wisdom communication',

    typicalQuestions: [
      'How do I bridge understanding?',
      'What connections am I seeing?',
      'How does this serve the whole?'
    ],
    healingPractices: [
      'Teaching',
      'Dialogue',
      'Community building'
    ],
    integrationTasks: [
      'Teach what you\'ve learned',
      'Build bridges',
      'Serve through communication'
    ]
  },

  // =============================================
  // AETHER - QUINTA ESSENTIA (Fifth Essence/Unity)
  // =============================================

  {
    facetId: 'Aether-1',
    facetNumber: 12,
    element: 'Aether',
    phase: 1,
    quality: 'Cardinal', // All qualities unified

    alchemicalStage: 'quinta_essentia',
    alchemicalColor: 'Prismatic (All Colors)',

    spiralDirection: 'synthesis',
    spiralPhaseDescription: 'Integration of all elements, unity consciousness',

    consciousnessLevel: 5,
    consciousnessFocus: 'Unity consciousness and transcendent service',

    bookChapter: 'aether',
    developmentalTheme: 'Wholeness, integration of all elements',
    shadowPattern: 'Spiritual bypassing, dissociation from reality',
    goldMedicine: 'Grounded transcendence, unity in diversity',

    typicalQuestions: [
      'How am I the whole expressing through a unique form?',
      'Where is unity consciousness present?',
      'How do I serve from wholeness?'
    ],
    healingPractices: [
      'Unity meditation',
      'Witnessing practice',
      'Sacred service'
    ],
    integrationTasks: [
      'Hold all parts in awareness',
      'Serve from wholeness',
      'Be the integration'
    ]
  }
];

/**
 * HELPER FUNCTIONS
 */

// Get mapping by facet number (1-12)
export function getFacetByNumber(facetNumber: number): UnifiedFacetMapping | undefined {
  return UNIFIED_FACET_MAP.find(f => f.facetNumber === facetNumber);
}

// Get mapping by facet ID ("Fire-1", etc.)
export function getFacetById(facetId: string): UnifiedFacetMapping | undefined {
  return UNIFIED_FACET_MAP.find(f => f.facetId === facetId);
}

// Get all facets for an element
export function getFacetsByElement(element: Element): UnifiedFacetMapping[] {
  return UNIFIED_FACET_MAP.filter(f => f.element === element);
}

// Get all facets for an alchemical stage
export function getFacetsByAlchemicalStage(stage: AlchemicalStage): UnifiedFacetMapping[] {
  return UNIFIED_FACET_MAP.filter(f => f.alchemicalStage === stage);
}

// Get current facet by element and phase
export function getFacetByElementAndPhase(element: Element, phase: Phase): UnifiedFacetMapping | undefined {
  return UNIFIED_FACET_MAP.find(f => f.element === element && f.phase === phase);
}

// Get next facet in the spiral
export function getNextFacet(currentFacet: UnifiedFacetMapping): UnifiedFacetMapping | undefined {
  const nextNumber = (currentFacet.facetNumber % 12) + 1;
  return getFacetByNumber(nextNumber);
}

// Get previous facet in the spiral
export function getPreviousFacet(currentFacet: UnifiedFacetMapping): UnifiedFacetMapping | undefined {
  const prevNumber = currentFacet.facetNumber === 1 ? 12 : currentFacet.facetNumber - 1;
  return getFacetByNumber(prevNumber);
}

/**
 * CONSCIOUSNESS EVOLUTION TRACKING
 */

export interface ConsciousnessJourneyPosition {
  currentFacet: UnifiedFacetMapping;
  progressInFacet: number; // 0-1
  spiralLevel: number; // How many complete spirals (1-N)
  totalFacetsCompleted: number;
  alchemicalStageProgress: {
    nigredo: number; // 0-1
    albedo: number;
    citrinitas: number;
    rubedo: number;
    quinta_essentia: number;
  };
}

// Calculate alchemical stage progress based on facets completed
export function calculateAlchemicalProgress(facetsCompleted: number[]): ConsciousnessJourneyPosition['alchemicalStageProgress'] {
  const completedFacets = new Set(facetsCompleted);

  return {
    nigredo: [1, 2, 3].filter(f => completedFacets.has(f)).length / 3,
    albedo: [4, 5, 6].filter(f => completedFacets.has(f)).length / 3,
    citrinitas: [7, 8, 9].filter(f => completedFacets.has(f)).length / 3,
    rubedo: [10, 11].filter(f => completedFacets.has(f)).length / 2,
    quinta_essentia: completedFacets.has(12) ? 1 : 0
  };
}

/**
 * WISDOM INTEGRATION
 */

// Get recommended practices for current facet
export function getRecommendedPractices(facet: UnifiedFacetMapping): {
  healing: string[];
  integration: string[];
  questions: string[];
} {
  return {
    healing: facet.healingPractices,
    integration: facet.integrationTasks,
    questions: facet.typicalQuestions
  };
}

// Get shadow/gold medicine for facet
export function getShadowGoldTeachings(facet: UnifiedFacetMapping): {
  shadow: string;
  gold: string;
  theme: string;
} {
  return {
    shadow: facet.shadowPattern,
    gold: facet.goldMedicine,
    theme: facet.developmentalTheme
  };
}

/**
 * COMPLETE JOURNEY VISUALIZATION
 */
export function getJourneyOverview(): string {
  let overview = '# THE COMPLETE SPIRALOGIC-ALCHEMY JOURNEY\n\n';

  const stages = {
    nigredo: [1, 2, 3],
    albedo: [4, 5, 6],
    citrinitas: [7, 8, 9],
    rubedo: [10, 11],
    quinta_essentia: [12]
  };

  for (const [stage, facetNumbers] of Object.entries(stages)) {
    const facets = facetNumbers.map(n => getFacetByNumber(n)!);
    overview += `## ${stage.toUpperCase()} - ${facets[0].alchemicalColor}\n`;
    overview += `**Spiral Direction**: ${facets[0].spiralDirection}\n\n`;

    for (const facet of facets) {
      overview += `### ${facet.facetId} - ${facet.quality}\n`;
      overview += `- **Theme**: ${facet.developmentalTheme}\n`;
      overview += `- **Shadow**: ${facet.shadowPattern}\n`;
      overview += `- **Gold**: ${facet.goldMedicine}\n`;
      overview += `- **Consciousness**: ${facet.consciousnessFocus}\n\n`;
    }
  }

  return overview;
}

/**
 * Export the complete map
 */
export { UNIFIED_FACET_MAP as default };