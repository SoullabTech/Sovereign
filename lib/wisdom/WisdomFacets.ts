/**
 * WISDOM FACETS - Reality Crystal Lenses
 *
 * Spiralogic as the loom where different wisdom threads are woven together.
 * Each facet is a lens into human experience - not competing frameworks,
 * but complementary mirrors that reflect different aspects of consciousness.
 */

export type Element = 'earth' | 'water' | 'fire' | 'air' | 'aether';
export type SpiralPhase = 'survival' | 'belonging' | 'power' | 'order' | 'success' | 'harmony' | 'integration' | 'unity';

export interface WisdomFacet {
  id: string;
  name: string;
  tradition: string;
  description: string;
  coreQuestion: string;
  keyThemes: string[];
  primaryElements: Element[];
  resonantPhases: SpiralPhase[];
  voiceExample: string;
  when: string; // When this lens is most useful
}

/**
 * The Wisdom Constellation
 *
 * Each facet offers a different doorway into self-understanding.
 * Users don't choose one - they discover which voices clarify their current experience.
 */
export const WISDOM_FACETS: Record<string, WisdomFacet> = {
  // Foundation: Needs & Meaning
  maslow: {
    id: 'maslow',
    name: 'Conditions & Capacity',
    tradition: 'Abraham Maslow',
    description: 'Map of readiness - what conditions support you now?',
    coreQuestion: 'What capacities are developing in you?',
    keyThemes: ['needs', 'capacity-building', 'grounding', 'self-actualization', 'growth'],
    primaryElements: ['earth', 'fire'],
    resonantPhases: ['survival', 'belonging', 'success', 'integration'],
    voiceExample: 'What foundational needs want attention before you can fully explore this?',
    when: 'When grounding, building capacity, or establishing foundations'
  },

  frankl: {
    id: 'frankl',
    name: 'Meaning & Purpose',
    tradition: 'Viktor Frankl (Logotherapy)',
    description: 'Map of direction - what calls you forward?',
    coreQuestion: 'What meaning is emerging through your experience?',
    keyThemes: ['purpose', 'will to meaning', 'values', 'attitude', 'choice in suffering'],
    primaryElements: ['aether', 'fire'],
    resonantPhases: ['order', 'harmony', 'integration', 'unity'],
    voiceExample: 'Even in this difficulty, what wants to be created or discovered?',
    when: 'When searching for purpose, facing adversity, or choosing attitude'
  },

  // Depth Psychology
  jung: {
    id: 'jung',
    name: 'Psyche & Shadow',
    tradition: 'Carl Jung (Analytical Psychology)',
    description: 'The unconscious, archetypes, shadow, individuation',
    coreQuestion: 'What is the unconscious revealing to you?',
    keyThemes: ['shadow work', 'archetypes', 'individuation', 'dreams', 'collective unconscious'],
    primaryElements: ['water', 'air', 'aether'],
    resonantPhases: ['power', 'harmony', 'integration', 'unity'],
    voiceExample: 'What shadow aspect is asking to be integrated right now?',
    when: 'When exploring depths, working with dreams, integrating shadow'
  },

  // Will & Transformation
  nietzsche: {
    id: 'nietzsche',
    name: 'Will & Revaluation',
    tradition: 'Friedrich Nietzsche',
    description: 'Power, creative destruction, becoming who you are',
    coreQuestion: 'What wants to be destroyed so something new can be born?',
    keyThemes: ['will to power', 'revaluation', 'self-overcoming', 'amor fati', 'creative destruction'],
    primaryElements: ['fire', 'air'],
    resonantPhases: ['power', 'success', 'integration'],
    voiceExample: 'What old values are you outgrowing? What yes is trying to emerge through your no?',
    when: 'When breaking through, questioning inherited values, or claiming power'
  },

  // Soul Journey
  hesse: {
    id: 'hesse',
    name: 'Inner Pilgrimage',
    tradition: 'Hermann Hesse',
    description: 'Soul journey, tension between spirit and society, myth lived through',
    coreQuestion: 'What journey is your soul walking?',
    keyThemes: ['individuation', 'solitude', 'art', 'spiritual quest', 'tension with convention'],
    primaryElements: ['water', 'aether', 'air'],
    resonantPhases: ['belonging', 'power', 'harmony', 'integration', 'unity'],
    voiceExample: 'What part of you is still trying to belong, and what part knows you must walk alone?',
    when: 'When navigating solitude, creative awakening, or spiritual rebellion'
  },

  // Moral Ground
  tolstoy: {
    id: 'tolstoy',
    name: 'Moral Conscience',
    tradition: 'Leo Tolstoy',
    description: 'Everyday virtue, lived ethics, weight of choices, integrity',
    coreQuestion: 'How are you living your values in daily life?',
    keyThemes: ['conscience', 'ethics', 'simplicity', 'community', 'authentic action'],
    primaryElements: ['earth', 'water'],
    resonantPhases: ['order', 'harmony', 'integration'],
    voiceExample: 'What does integrity ask of you in this specific situation?',
    when: 'When facing moral choices, seeking groundedness, or living values'
  },

  // Vulnerability & Connection
  brown: {
    id: 'brown',
    name: 'Courage & Vulnerability',
    tradition: 'Brené Brown',
    description: 'Shame, vulnerability, worthiness, belonging, courage',
    coreQuestion: 'What are you protecting yourself from feeling?',
    keyThemes: ['vulnerability', 'shame resilience', 'worthiness', 'authenticity', 'connection'],
    primaryElements: ['water', 'fire', 'earth'],
    resonantPhases: ['belonging', 'harmony', 'integration'],
    voiceExample: 'What would it look like to show up fully, even with the fear of not being enough?',
    when: 'When working with shame, seeking connection, or practicing courage'
  },

  // Embodiment & Presence
  somatic: {
    id: 'somatic',
    name: 'Body Wisdom',
    tradition: 'Somatic Psychology',
    description: 'Body as oracle, trauma release, embodied knowing',
    coreQuestion: 'What is your body telling you?',
    keyThemes: ['embodiment', 'somatics', 'nervous system', 'trauma', 'body wisdom'],
    primaryElements: ['earth', 'water'],
    resonantPhases: ['survival', 'belonging', 'integration'],
    voiceExample: 'Where in your body do you feel this? What does that sensation want to say?',
    when: 'When reconnecting with body, processing trauma, or seeking embodied truth'
  },

  // Buddhist Lens
  buddhist: {
    id: 'buddhist',
    name: 'Mindfulness & Impermanence',
    tradition: 'Buddhist Psychology',
    description: 'Non-attachment, suffering cessation, present moment awareness',
    coreQuestion: 'What are you clinging to?',
    keyThemes: ['mindfulness', 'impermanence', 'suffering', 'non-attachment', 'compassion'],
    primaryElements: ['air', 'aether', 'water'],
    resonantPhases: ['harmony', 'integration', 'unity'],
    voiceExample: 'What if you held this lightly and let it flow through you?',
    when: 'When stuck in attachment, seeking peace, or cultivating presence'
  },

  // Systems View
  integral: {
    id: 'integral',
    name: 'Integral Synthesis',
    tradition: 'Ken Wilber / Integral Theory',
    description: 'Multiple perspectives, all quadrants, developmental stages',
    coreQuestion: 'What perspectives are you missing?',
    keyThemes: ['multiple perspectives', 'stages', 'states', 'quadrants', 'holistic integration'],
    primaryElements: ['air', 'aether'],
    resonantPhases: ['integration', 'unity'],
    voiceExample: 'What would this look like from inside, outside, individual, and collective views?',
    when: 'When integrating paradox, seeking wholeness, or navigating complexity'
  }
};

/**
 * Element-to-Facet Mapping
 * Shows which wisdom voices resonate with each elemental phase
 */
export const ELEMENT_FACET_MAP: Record<Element, string[]> = {
  earth: ['maslow', 'tolstoy', 'somatic', 'brown'],
  water: ['jung', 'hesse', 'brown', 'somatic', 'buddhist', 'tolstoy'],
  fire: ['nietzsche', 'maslow', 'brown', 'frankl'],
  air: ['nietzsche', 'jung', 'hesse', 'buddhist', 'integral'],
  aether: ['frankl', 'jung', 'hesse', 'buddhist', 'integral']
};

/**
 * Phase-to-Facet Mapping
 * Shows which wisdom voices are most relevant at each spiral stage
 */
export const PHASE_FACET_MAP: Record<SpiralPhase, string[]> = {
  survival: ['maslow', 'somatic'],
  belonging: ['maslow', 'brown', 'hesse', 'somatic', 'tolstoy'],
  power: ['nietzsche', 'jung', 'hesse'],
  order: ['frankl', 'tolstoy'],
  success: ['maslow', 'nietzsche'],
  harmony: ['brown', 'jung', 'tolstoy', 'buddhist', 'hesse', 'frankl'],
  integration: ['jung', 'integral', 'maslow', 'nietzsche', 'frankl', 'brown', 'tolstoy', 'somatic', 'hesse'],
  unity: ['frankl', 'jung', 'buddhist', 'integral', 'hesse']
};

/**
 * Get relevant facets for a given context
 */
export function getRelevantFacets(context: {
  elements?: Element[];
  phase?: SpiralPhase;
  limit?: number;
}): WisdomFacet[] {
  const relevantIds = new Set<string>();

  // Add facets by elements
  if (context.elements) {
    context.elements.forEach(element => {
      ELEMENT_FACET_MAP[element]?.forEach(id => relevantIds.add(id));
    });
  }

  // Add facets by phase
  if (context.phase) {
    PHASE_FACET_MAP[context.phase]?.forEach(id => relevantIds.add(id));
  }

  // Convert to facet objects
  const facets = Array.from(relevantIds)
    .map(id => WISDOM_FACETS[id])
    .filter(Boolean);

  // Limit if requested
  if (context.limit) {
    return facets.slice(0, context.limit);
  }

  return facets;
}

/**
 * Get a facet by ID
 */
export function getFacet(id: string): WisdomFacet | undefined {
  return WISDOM_FACETS[id];
}

/**
 * Get all facets as array
 */
export function getAllFacets(): WisdomFacet[] {
  return Object.values(WISDOM_FACETS);
}

/**
 * Search facets by theme or keyword
 */
export function searchFacets(query: string): WisdomFacet[] {
  const lowerQuery = query.toLowerCase();
  return getAllFacets().filter(facet =>
    facet.name.toLowerCase().includes(lowerQuery) ||
    facet.tradition.toLowerCase().includes(lowerQuery) ||
    facet.description.toLowerCase().includes(lowerQuery) ||
    facet.keyThemes.some(theme => theme.toLowerCase().includes(lowerQuery))
  );
}