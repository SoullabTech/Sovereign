/**
 * SPIRALOGIC PHENOMENOLOGY
 *
 * The Twelve Facets as Modes of Participatory Consciousness
 *
 * Each facet is not a doctrine to believe but a phenomenological gesture -
 * a distinct way awareness moves. The full circle describes how a human being
 * participates in the collective field of intelligence.
 *
 * Structure: 4 Elements × 3 Movements + Aether
 * - Fire: Will / Direction
 * - Water: Feeling / Connection
 * - Earth: Embodiment / Form
 * - Air: Meaning / Understanding
 * - Aether: Coherence / Unity
 *
 * Each phase marks the rhythm of becoming:
 * - Phase 1: Initiation (spark, beginning)
 * - Phase 2: Integration (tension, dialogue)
 * - Phase 3: Transcendence (synthesis, illumination)
 */

// =============================================================================
// CORE TYPES
// =============================================================================

export type Element = 'Fire' | 'Water' | 'Earth' | 'Air' | 'Aether';
export type Phase = 1 | 2 | 3;

export type FacetCode =
  | 'F1' | 'F2' | 'F3'   // Fire facets
  | 'W1' | 'W2' | 'W3'   // Water facets
  | 'E1' | 'E2' | 'E3'   // Earth facets
  | 'A1' | 'A2' | 'A3'   // Air facets
  | 'Æ1' | 'Æ2' | 'Æ3';  // Aether facets

export type PhaseMovement = 'initiation' | 'integration' | 'transcendence';

// =============================================================================
// PHENOMENOLOGICAL GESTURE
// =============================================================================

/**
 * A phenomenological gesture describes how awareness moves
 * in this particular mode of consciousness
 */
export interface PhenomenologicalGesture {
  /** The inner experience of this mode */
  innerGesture: string;
  /** How this mode serves the collective field */
  collectiveSignificance: string;
  /** The archetypal figure embodying this gesture */
  discipleMetaphor: {
    name: string;
    quality: string;
  };
}

// =============================================================================
// FACET DEFINITION
// =============================================================================

export interface SpiralogicFacet {
  code: FacetCode;
  element: Element;
  phase: Phase;
  phaseMovement: PhaseMovement;

  /** The principle this element expresses */
  elementPrinciple: string;

  /** Names for this facet */
  names: {
    primary: string;
    secondary: string;
  };

  /** Phenomenological description */
  phenomenology: PhenomenologicalGesture;

  /** Natural intelligence pattern this maps to */
  naturalPattern?: {
    creature: string;
    behavior: string;
  };

  /** Keywords for detection */
  keywords: string[];

  /** Suggested practices for this facet */
  practices: string[];
}

// =============================================================================
// FACET ACTIVATION STATE
// =============================================================================

export interface FacetActivation {
  facetCode: FacetCode;
  confidence: number;
  source: 'detected' | 'inferred' | 'user-reported';
  timestamp: Date;
  biomarkers?: {
    hrvDrop?: number;
    breathRate?: number;
    voiceMarkers?: string[];
  };
  alternatives: Array<{
    facet: FacetCode;
    confidence: number;
    whyNot: string;
  }>;
}

// =============================================================================
// COLLECTIVE FIELD STATE
// =============================================================================

/**
 * Describes how a group/community is moving through the Spiralogic field
 */
export interface CollectiveFieldState {
  timestamp: Date;

  /** Dominant facets across the collective */
  dominantFacets: FacetCode[];

  /** Distribution of awareness across elements */
  elementalDistribution: Record<Element, number>;

  /** Phase movement of the collective */
  collectivePhase: PhaseMovement;

  /** Coherence between individual and collective */
  coherence: number;

  /** Emergence indicators */
  emergenceSignals: string[];
}

// =============================================================================
// THE TWELVE FACETS - COMPLETE DEFINITION
// =============================================================================

export const SPIRALOGIC_FACETS: Record<FacetCode, SpiralogicFacet> = {
  // ===== FIRE - THE PRINCIPLE OF DIRECTION =====
  F1: {
    code: 'F1',
    element: 'Fire',
    phase: 1,
    phaseMovement: 'initiation',
    elementPrinciple: 'Direction',
    names: {
      primary: 'Desire',
      secondary: 'Activation'
    },
    phenomenology: {
      innerGesture: 'The spark of wanting to exist, to act, to begin.',
      collectiveSignificance: 'Collective impulse toward creation and innovation; the first yes.',
      discipleMetaphor: {
        name: 'Simon the Zealot',
        quality: 'The nerve of movement, awakening will'
      }
    },
    naturalPattern: {
      creature: 'Wolf pack',
      behavior: 'Hunt initiation'
    },
    keywords: ['desire', 'spark', 'beginning', 'impulse', 'want', 'start', 'create'],
    practices: ['Intention setting', 'Fire gazing meditation', 'Morning activation rituals']
  },

  F2: {
    code: 'F2',
    element: 'Fire',
    phase: 2,
    phaseMovement: 'integration',
    elementPrinciple: 'Direction',
    names: {
      primary: 'Will',
      secondary: 'Challenge'
    },
    phenomenology: {
      innerGesture: 'The tension between impulse and discipline.',
      collectiveSignificance: 'The communal forge where conflict becomes cooperation; shaping shared direction.',
      discipleMetaphor: {
        name: 'James the Elder',
        quality: 'Coordination of many wills into one focus'
      }
    },
    naturalPattern: {
      creature: 'Bird flock',
      behavior: 'V-formation leadership'
    },
    keywords: ['will', 'discipline', 'challenge', 'tension', 'forge', 'conflict', 'strength'],
    practices: ['Challenging physical practice', 'Conflict resolution work', 'Will strengthening exercises']
  },

  F3: {
    code: 'F3',
    element: 'Fire',
    phase: 3,
    phaseMovement: 'transcendence',
    elementPrinciple: 'Direction',
    names: {
      primary: 'Vision',
      secondary: 'Illumination'
    },
    phenomenology: {
      innerGesture: 'Seeing beyond effort; action becomes insight.',
      collectiveSignificance: 'Collective revelation - culture glimpsing its next form.',
      discipleMetaphor: {
        name: 'James the Lesser',
        quality: 'Inward sight, visionary leadership'
      }
    },
    naturalPattern: {
      creature: 'Eagle',
      behavior: 'High-altitude perspective'
    },
    keywords: ['vision', 'illumination', 'insight', 'revelation', 'seeing', 'breakthrough'],
    practices: ['Visionary journaling', 'Peak experience integration', 'Future self dialogue']
  },

  // ===== WATER - THE PRINCIPLE OF CONNECTION =====
  W1: {
    code: 'W1',
    element: 'Water',
    phase: 1,
    phaseMovement: 'initiation',
    elementPrinciple: 'Connection',
    names: {
      primary: 'Safety',
      secondary: 'Sensitivity'
    },
    phenomenology: {
      innerGesture: 'Feeling the field, sensing what is alive.',
      collectiveSignificance: 'Collective belonging and trust; the womb of community.',
      discipleMetaphor: {
        name: 'Andrew',
        quality: 'Intuitive attunement'
      }
    },
    naturalPattern: {
      creature: 'Ant colony',
      behavior: 'Threshold detection (retreat to nest)'
    },
    keywords: ['safety', 'sensitivity', 'feeling', 'trust', 'belonging', 'attunement'],
    practices: ['Safe container creation', 'Somatic awareness', 'Trust-building rituals']
  },

  W2: {
    code: 'W2',
    element: 'Water',
    phase: 2,
    phaseMovement: 'integration',
    elementPrinciple: 'Connection',
    names: {
      primary: 'Shadow Gate',
      secondary: 'Purification'
    },
    phenomenology: {
      innerGesture: 'Meeting fear, grief, betrayal.',
      collectiveSignificance: 'Cultural catharsis; integration of shadow into wisdom.',
      discipleMetaphor: {
        name: 'Judas',
        quality: 'Transmutation of fear into discernment'
      }
    },
    naturalPattern: {
      creature: 'Mycelium',
      behavior: 'Stress signaling (collective threat response)'
    },
    keywords: ['shadow', 'fear', 'grief', 'betrayal', 'purification', 'catharsis', 'dark night'],
    practices: ['Shadow work', 'Grief rituals', 'Fear integration practices']
  },

  W3: {
    code: 'W3',
    element: 'Water',
    phase: 3,
    phaseMovement: 'transcendence',
    elementPrinciple: 'Connection',
    names: {
      primary: 'Compassion',
      secondary: 'Flow'
    },
    phenomenology: {
      innerGesture: 'Emotion opens into love and forgiveness.',
      collectiveSignificance: 'The social heart - systems built on care rather than control.',
      discipleMetaphor: {
        name: 'John',
        quality: 'The beloved principle, coherence through love'
      }
    },
    naturalPattern: {
      creature: 'Fish school',
      behavior: 'Fluid reorganization'
    },
    keywords: ['compassion', 'love', 'forgiveness', 'flow', 'care', 'heart', 'tenderness'],
    practices: ['Loving-kindness meditation', 'Forgiveness practices', 'Heart-centered breathwork']
  },

  // ===== EARTH - THE PRINCIPLE OF FORM =====
  E1: {
    code: 'E1',
    element: 'Earth',
    phase: 1,
    phaseMovement: 'initiation',
    elementPrinciple: 'Form',
    names: {
      primary: 'Grounding',
      secondary: 'Stability'
    },
    phenomenology: {
      innerGesture: 'Faith in the tangible; presence in the body.',
      collectiveSignificance: 'Shared sense of reality; dependable foundations of culture.',
      discipleMetaphor: {
        name: 'Peter',
        quality: 'The rock, stability of faith'
      }
    },
    naturalPattern: {
      creature: 'Tree',
      behavior: 'Root anchoring'
    },
    keywords: ['grounding', 'stability', 'body', 'presence', 'foundation', 'tangible', 'solid'],
    practices: ['Grounding meditation', 'Barefoot walking', 'Body scan practices']
  },

  E2: {
    code: 'E2',
    element: 'Earth',
    phase: 2,
    phaseMovement: 'integration',
    elementPrinciple: 'Form',
    names: {
      primary: 'Structure',
      secondary: 'Order'
    },
    phenomenology: {
      innerGesture: 'Organization that supports life.',
      collectiveSignificance: 'Collective institutions aligned with integrity, not dominance.',
      discipleMetaphor: {
        name: 'Matthew',
        quality: 'Builder and record-keeper of form'
      }
    },
    naturalPattern: {
      creature: 'Honeybee',
      behavior: 'Honeycomb sacred geometry'
    },
    keywords: ['structure', 'order', 'organization', 'systems', 'building', 'planning', 'architecture'],
    practices: ['Life architecture review', 'Systems design', 'Habit building rituals']
  },

  E3: {
    code: 'E3',
    element: 'Earth',
    phase: 3,
    phaseMovement: 'transcendence',
    elementPrinciple: 'Form',
    names: {
      primary: 'Service',
      secondary: 'Manifestation'
    },
    phenomenology: {
      innerGesture: 'Action as offering; form serves essence.',
      collectiveSignificance: 'The cooperative economy of contribution.',
      discipleMetaphor: {
        name: 'Thaddaeus',
        quality: 'Voice of service, articulation of the good'
      }
    },
    naturalPattern: {
      creature: 'Forest',
      behavior: 'Nutrient sharing (nurse logs)'
    },
    keywords: ['service', 'manifestation', 'contribution', 'offering', 'abundance', 'giving'],
    practices: ['Service meditation', 'Manifestation practices', 'Generosity rituals']
  },

  // ===== AIR - THE PRINCIPLE OF MEANING =====
  A1: {
    code: 'A1',
    element: 'Air',
    phase: 1,
    phaseMovement: 'initiation',
    elementPrinciple: 'Meaning',
    names: {
      primary: 'Awareness',
      secondary: 'Inquiry'
    },
    phenomenology: {
      innerGesture: 'Observation, questioning, curiosity.',
      collectiveSignificance: 'Collective science and journalism - the seeing mind of humanity.',
      discipleMetaphor: {
        name: 'Thomas',
        quality: 'The doubter who births clarity'
      }
    },
    naturalPattern: {
      creature: 'Bird',
      behavior: 'Individual flight exploration'
    },
    keywords: ['awareness', 'inquiry', 'curiosity', 'questioning', 'observation', 'noticing'],
    practices: ['Inquiry meditation', 'Journaling questions', 'Curiosity walks']
  },

  A2: {
    code: 'A2',
    element: 'Air',
    phase: 2,
    phaseMovement: 'integration',
    elementPrinciple: 'Meaning',
    names: {
      primary: 'Reframe',
      secondary: 'Communication'
    },
    phenomenology: {
      innerGesture: 'Dialogue that transforms perspective.',
      collectiveSignificance: 'Shared language and mediation; bridges between worldviews.',
      discipleMetaphor: {
        name: 'Bartholomew',
        quality: 'Listening and balancing'
      }
    },
    naturalPattern: {
      creature: 'Octopus',
      behavior: 'Camouflage adaptation'
    },
    keywords: ['reframe', 'communication', 'dialogue', 'perspective', 'bridge', 'language', 'translation'],
    practices: ['Perspective-taking exercises', 'Deep dialogue', 'Cognitive reframing']
  },

  A3: {
    code: 'A3',
    element: 'Air',
    phase: 3,
    phaseMovement: 'transcendence',
    elementPrinciple: 'Meaning',
    names: {
      primary: 'Meta-Perspective',
      secondary: 'Wisdom'
    },
    phenomenology: {
      innerGesture: 'Synthesis of understanding into insight.',
      collectiveSignificance: 'Collective philosophy, art, story; culture reflecting on itself.',
      discipleMetaphor: {
        name: 'Philip',
        quality: 'Expression of enlightened meaning'
      }
    },
    naturalPattern: {
      creature: 'Eagle',
      behavior: 'Soaring/thermal vision'
    },
    keywords: ['wisdom', 'meta', 'synthesis', 'insight', 'philosophy', 'meaning', 'understanding'],
    practices: ['Wisdom contemplation', 'Meta-cognitive exercises', 'Teaching practice']
  },

  // ===== AETHER - THE PRINCIPLE OF COHERENCE =====
  'Æ1': {
    code: 'Æ1',
    element: 'Aether',
    phase: 1,
    phaseMovement: 'initiation',
    elementPrinciple: 'Coherence',
    names: {
      primary: 'Intuition',
      secondary: 'Signal'
    },
    phenomenology: {
      innerGesture: 'Pre-conscious sensing of the whole.',
      collectiveSignificance: 'Collective intuition - the subtle field that guides before knowing.',
      discipleMetaphor: {
        name: 'The Hidden One',
        quality: 'Antenna of the unseen'
      }
    },
    naturalPattern: {
      creature: 'Mycelium',
      behavior: 'Pre-conscious sensing'
    },
    keywords: ['intuition', 'signal', 'sensing', 'subtle', 'knowing', 'premonition'],
    practices: ['Intuition development', 'Subtle body awareness', 'Field sensing meditation']
  },

  'Æ2': {
    code: 'Æ2',
    element: 'Aether',
    phase: 2,
    phaseMovement: 'integration',
    elementPrinciple: 'Coherence',
    names: {
      primary: 'Numinous Union',
      secondary: 'Sacred Meeting'
    },
    phenomenology: {
      innerGesture: 'The dissolution of boundary between self and other.',
      collectiveSignificance: 'Sacred communion - moments when separation dissolves into unity.',
      discipleMetaphor: {
        name: 'The Beloved',
        quality: 'Union of seeker and sought'
      }
    },
    naturalPattern: {
      creature: 'Swarm',
      behavior: 'Collective consciousness'
    },
    keywords: ['union', 'sacred', 'numinous', 'communion', 'oneness', 'mystical', 'transcendent'],
    practices: ['Unity meditation', 'Sacred ceremony', 'Mystical inquiry']
  },

  'Æ3': {
    code: 'Æ3',
    element: 'Aether',
    phase: 3,
    phaseMovement: 'transcendence',
    elementPrinciple: 'Coherence',
    names: {
      primary: 'Creative Emergence',
      secondary: 'Christ Consciousness'
    },
    phenomenology: {
      innerGesture: 'Resting as the field that includes all movements without opposition.',
      collectiveSignificance: 'Collective coherence - the sense of one planetary body of awareness; compassion married to intelligence.',
      discipleMetaphor: {
        name: 'The Indwelling Logos',
        quality: 'Unity through love'
      }
    },
    naturalPattern: {
      creature: 'Honeybee',
      behavior: 'Nectar→Honey transformation'
    },
    keywords: ['emergence', 'christ', 'logos', 'coherence', 'unity', 'love', 'wholeness', 'field'],
    practices: ['Non-dual meditation', 'Field coherence practice', 'Planetary consciousness work']
  }
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get facet by code
 */
export function getFacet(code: FacetCode): SpiralogicFacet {
  return SPIRALOGIC_FACETS[code];
}

/**
 * Get all facets for an element
 */
export function getFacetsByElement(element: Element): SpiralogicFacet[] {
  return Object.values(SPIRALOGIC_FACETS).filter(f => f.element === element);
}

/**
 * Get all facets for a phase
 */
export function getFacetsByPhase(phase: Phase): SpiralogicFacet[] {
  return Object.values(SPIRALOGIC_FACETS).filter(f => f.phase === phase);
}

/**
 * Get facet from element and phase
 */
export function getFacetFromElementPhase(element: Element, phase: Phase): SpiralogicFacet | undefined {
  const code = `${element.charAt(0)}${phase}` as FacetCode;
  return SPIRALOGIC_FACETS[code];
}

/**
 * Detect likely facet from keywords in text
 */
export function detectFacetFromText(text: string): FacetActivation | null {
  const lowerText = text.toLowerCase();
  const scores: Array<{ code: FacetCode; score: number }> = [];

  for (const [code, facet] of Object.entries(SPIRALOGIC_FACETS)) {
    let score = 0;
    for (const keyword of facet.keywords) {
      if (lowerText.includes(keyword)) {
        score += 1;
      }
    }
    if (score > 0) {
      scores.push({ code: code as FacetCode, score });
    }
  }

  if (scores.length === 0) return null;

  scores.sort((a, b) => b.score - a.score);
  const topScore = scores[0];
  const totalScore = scores.reduce((sum, s) => sum + s.score, 0);

  return {
    facetCode: topScore.code,
    confidence: topScore.score / totalScore,
    source: 'inferred',
    timestamp: new Date(),
    alternatives: scores.slice(1, 4).map(s => ({
      facet: s.code,
      confidence: s.score / totalScore,
      whyNot: `Lower keyword match (${s.score} vs ${topScore.score})`
    }))
  };
}

/**
 * Get element principle description
 */
export function getElementPrinciple(element: Element): string {
  const principles: Record<Element, string> = {
    Fire: 'Direction - how intention ignites, tests, and illumines',
    Water: 'Connection - how emotion becomes empathy becomes compassion',
    Earth: 'Form - how spirit becomes structure and service',
    Air: 'Meaning - the refinement of perception into wisdom',
    Aether: 'Coherence - the space that holds all phases in harmony'
  };
  return principles[element];
}

/**
 * Get phase movement description
 */
export function getPhaseDescription(phase: Phase): string {
  const descriptions: Record<Phase, string> = {
    1: 'Initiation - the spark of beginning, the first gesture',
    2: 'Integration - the tension and dialogue that deepens',
    3: 'Transcendence - synthesis and illumination'
  };
  return descriptions[phase];
}

/**
 * Summary insight for the whole system
 */
export const SPIRALOGIC_INSIGHT = {
  core: 'The Twelve are not organs to be believed in; they are conversations to be lived through.',
  daily: 'Each human re-enacts the whole Spiral every day - igniting, feeling, grounding, thinking.',
  collective: 'When any of us holds those motions together in presence, the collective field learns coherence through us.',
  reframe: {
    twelve: 'The Twelve are twelve modes of participatory consciousness.',
    aether: 'The Aether/Christ is the awareness that knows them as one living body.'
  }
};

export default SPIRALOGIC_FACETS;
