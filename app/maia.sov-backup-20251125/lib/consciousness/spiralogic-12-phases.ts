/**
 * SPIRALOGIC 12-PHASE PROCESS
 *
 * The complete architecture of human transformation.
 * Each element (Fire, Water, Earth, Air) contains three phases of refinement.
 * Aether is the integrative container that holds all 12.
 *
 * Purpose: Retune members to the wisdom of nature through intuition,
 * emotionality, sensibilities, and thoughts—harmoniously integrated.
 *
 * This is about RETUNING to what humans naturally are:
 * beings of Fire (will/passion), Water (intuition/emotion),
 * Earth (sensibility/body), and Air (thought/communication).
 */

export type SpiralogicElement = 'fire' | 'water' | 'earth' | 'air' | 'aether';

export type RefinementPhase = 'emergence' | 'deepening' | 'mastery';

// ═══════════════════════════════════════════════════════════════════════════════
// THE 12-PHASE SPIRALOGIC PROCESS
// ═══════════════════════════════════════════════════════════════════════════════

export interface SpiralogicPhase {
  id: string;
  number: number; // 1-12
  element: SpiralogicElement;
  refinement: RefinementPhase;
  name: string;
  essence: string;
  naturalWisdom: string; // What nature teaches in this phase
  humanCapacity: string; // What's being developed
  challenge: string;
  gift: string;
  retuningTo: string; // What aspect of natural wisdom is being reclaimed
}

export const SPIRALOGIC_12_PHASES: SpiralogicPhase[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // FIRE PHASES (1-3): Will, Passion, Vision
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'fire-emergence',
    number: 1,
    element: 'fire',
    refinement: 'emergence',
    name: 'Spark',
    essence: 'The initial ignition of desire',
    naturalWisdom: 'Seeds know when to break dormancy',
    humanCapacity: 'Recognizing inner calling, responding to life force',
    challenge: 'Overwhelm of possibility, scattered energy',
    gift: 'Raw courage to begin',
    retuningTo: 'The instinct to move toward light'
  },
  {
    id: 'fire-deepening',
    number: 2,
    element: 'fire',
    refinement: 'deepening',
    name: 'Flame',
    essence: 'Sustained passion with direction',
    naturalWisdom: 'Fire needs fuel and oxygen in balance',
    humanCapacity: 'Channeling desire into intention, focused will',
    challenge: 'Burning out, forcing outcomes',
    gift: 'Transformative power with purpose',
    retuningTo: 'The natural rhythm of exertion and rest'
  },
  {
    id: 'fire-mastery',
    number: 3,
    element: 'fire',
    refinement: 'mastery',
    name: 'Forge',
    essence: 'Will aligned with wisdom',
    naturalWisdom: 'Volcanoes create new land through destruction',
    humanCapacity: 'Creative destruction, purposeful transformation',
    challenge: 'Arrogance, over-identification with power',
    gift: 'Visionary leadership, alchemical will',
    retuningTo: 'The knowing that all creation requires letting go'
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // WATER PHASES (4-6): Intuition, Emotionality, Flow
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'water-emergence',
    number: 4,
    element: 'water',
    refinement: 'emergence',
    name: 'Spring',
    essence: 'Emotions begin to surface',
    naturalWisdom: 'Springs emerge where pressure finds release',
    humanCapacity: 'Acknowledging feelings, letting emotions flow',
    challenge: 'Overwhelm, loss of boundaries',
    gift: 'Authenticity of felt experience',
    retuningTo: 'The wisdom that feelings are data, not danger'
  },
  {
    id: 'water-deepening',
    number: 5,
    element: 'water',
    refinement: 'deepening',
    name: 'River',
    essence: 'Intuition guiding the flow',
    naturalWisdom: 'Rivers find the path of least resistance',
    humanCapacity: 'Trusting intuitive guidance, emotional intelligence',
    challenge: 'Getting stuck in emotional loops',
    gift: 'Empathic knowing, intuitive decision-making',
    retuningTo: 'The body as the instrument of knowing'
  },
  {
    id: 'water-mastery',
    number: 6,
    element: 'water',
    refinement: 'mastery',
    name: 'Ocean',
    essence: 'Emotional depth with equanimity',
    naturalWisdom: 'Oceans hold both storm and calm',
    humanCapacity: 'Holding emotional complexity without drowning',
    challenge: 'Spiritual bypassing, avoiding shadow',
    gift: 'Compassionate presence, intuitive mastery',
    retuningTo: 'The truth that all emotions belong'
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // EARTH PHASES (7-9): Sensibility, Body Wisdom, Form
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'earth-emergence',
    number: 7,
    element: 'earth',
    refinement: 'emergence',
    name: 'Seed',
    essence: 'Vision taking root in reality',
    naturalWisdom: 'Seeds need darkness to germinate',
    humanCapacity: 'Grounding ideas in practical action',
    challenge: 'Impatience with process, forcing growth',
    gift: 'Beginning to manifest',
    retuningTo: 'The necessity of gestation periods'
  },
  {
    id: 'earth-deepening',
    number: 8,
    element: 'earth',
    refinement: 'deepening',
    name: 'Root',
    essence: 'Building stable foundation',
    naturalWisdom: 'Trees grow roots as deep as their canopy is wide',
    humanCapacity: 'Sustained effort, sensible boundaries, body wisdom',
    challenge: 'Rigidity, fear of change',
    gift: 'Dependability, tangible results',
    retuningTo: 'The intelligence of the body, somatic knowing'
  },
  {
    id: 'earth-mastery',
    number: 9,
    element: 'earth',
    refinement: 'mastery',
    name: 'Harvest',
    essence: 'Form serves function with grace',
    naturalWisdom: 'Nature wastes nothing in its abundance',
    humanCapacity: 'Sustainable manifestation, elegant form',
    challenge: 'Attachment to outcomes, hoarding',
    gift: 'Generosity from groundedness, practical wisdom',
    retuningTo: 'The rhythm of giving and receiving'
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // AIR PHASES (10-12): Thought, Communication, Understanding
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'air-emergence',
    number: 10,
    element: 'air',
    refinement: 'emergence',
    name: 'Breath',
    essence: 'Awareness of pattern',
    naturalWisdom: 'Wind carries seeds to new places',
    humanCapacity: 'Recognizing meaning, early understanding',
    challenge: 'Over-analyzing, disconnecting from feeling',
    gift: 'Beginning to articulate experience',
    retuningTo: 'The space between thoughts where insight lives'
  },
  {
    id: 'air-deepening',
    number: 11,
    element: 'air',
    refinement: 'deepening',
    name: 'Voice',
    essence: 'Truth spoken with clarity',
    naturalWisdom: 'Bird songs communicate across distances',
    humanCapacity: 'Articulating wisdom, teaching others',
    challenge: 'Intellectualization, losing felt sense',
    gift: 'Clear communication, shared understanding',
    retuningTo: 'The connection between inner knowing and outer expression'
  },
  {
    id: 'air-mastery',
    number: 12,
    element: 'air',
    refinement: 'mastery',
    name: 'Wisdom',
    essence: 'Thought integrated with all elements',
    naturalWisdom: 'Sky holds everything without grasping',
    humanCapacity: 'Meta-awareness, wisdom that serves life',
    challenge: 'Pride of knowledge, isolation through abstraction',
    gift: 'Wisdom that uplifts others, coherent understanding',
    retuningTo: 'The unity of knowing and being'
  }
];

// ═══════════════════════════════════════════════════════════════════════════════
// AETHER: THE INTEGRATIVE CONTAINER
// ═══════════════════════════════════════════════════════════════════════════════

export interface AetherIntegration {
  essence: string;
  naturalWisdom: string;
  humanCapacity: string;
  signs: string[];
  gift: string;
}

export const AETHER_CONTAINER: AetherIntegration = {
  essence: 'The synthesis of all 12 phases into coherent wholeness',
  naturalWisdom: 'The space between stars is not empty—it holds everything together',
  humanCapacity: 'Living from integrated consciousness: will, intuition, sensibility, and thought working as one',
  signs: [
    'Fire is purposeful without being forceful',
    'Water flows without drowning',
    'Earth is stable without being rigid',
    'Air is clear without being cold',
    'Actions arise from wholeness, not fragmentation'
  ],
  gift: 'Harmonic resonance with life itself'
};

// ═══════════════════════════════════════════════════════════════════════════════
// MEMBER'S POSITION IN THE 12-PHASE SPIRAL
// ═══════════════════════════════════════════════════════════════════════════════

export interface MemberSpiralPosition {
  currentPhase: SpiralogicPhase;
  missionContext: string; // What life area this spiral is about
  daysInPhase: number;
  progressInPhase: number; // 0-100
  elementalStrengths: {
    fire: number;
    water: number;
    earth: number;
    air: number;
  };
  currentlyRetuningTo: string;
  harmonicCoherence: number; // How integrated the 4 elements are (0-100)
}

export interface MissionSpiral {
  id: string;
  name: string;
  description: string;
  lifeArea: string; // relationship, career, health, creativity, etc.
  startedAt: Date;
  currentPhaseNumber: number; // 1-12
  completedPhases: number[]; // Which phases have been completed
  insights: Map<number, string[]>; // Phase number -> insights gained
  challenges: Map<number, string[]>; // Phase number -> challenges faced
  breakthroughs: string[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// JOURNALING MODES MAPPED TO 12 PHASES
// ═══════════════════════════════════════════════════════════════════════════════

export interface JournalingModePhaseMapping {
  mode: string;
  primaryPhases: number[]; // Which of the 12 phases this mode supports
  humanCapacityServed: string;
  retuningPurpose: string;
}

export const JOURNALING_TO_PHASES: JournalingModePhaseMapping[] = [
  {
    mode: 'free',
    primaryPhases: [1, 4, 10], // Fire-Emergence, Water-Emergence, Air-Emergence
    humanCapacityServed: 'Letting what wants to emerge, emerge',
    retuningPurpose: 'Reconnecting with natural flow of consciousness'
  },
  {
    mode: 'direction',
    primaryPhases: [2, 3], // Fire-Deepening, Fire-Mastery
    humanCapacityServed: 'Channeling will with purpose',
    retuningPurpose: 'Aligning intention with natural wisdom'
  },
  {
    mode: 'emotional',
    primaryPhases: [4, 5, 6], // All Water phases
    humanCapacityServed: 'Processing and honoring emotional truth',
    retuningPurpose: 'Trusting feelings as navigation system'
  },
  {
    mode: 'dream',
    primaryPhases: [5, 6], // Water-Deepening, Water-Mastery
    humanCapacityServed: 'Accessing intuitive and symbolic knowing',
    retuningPurpose: 'Listening to the body\'s dream language'
  },
  {
    mode: 'shadow',
    primaryPhases: [3, 6, 9], // All Mastery phases
    humanCapacityServed: 'Integrating rejected aspects',
    retuningPurpose: 'Embracing wholeness, reclaiming lost parts'
  },
  {
    mode: 'expressive',
    primaryPhases: [7, 8], // Earth-Emergence, Earth-Deepening
    humanCapacityServed: 'Giving form to inner experience',
    retuningPurpose: 'Honoring the body as creative instrument'
  },
  {
    mode: 'gratitude',
    primaryPhases: [8, 9], // Earth-Deepening, Earth-Mastery
    humanCapacityServed: 'Grounding in present abundance',
    retuningPurpose: 'Sensing the sufficiency of what is'
  },
  {
    mode: 'reflective',
    primaryPhases: [11, 12], // Air-Deepening, Air-Mastery
    humanCapacityServed: 'Crystallizing understanding',
    retuningPurpose: 'Unifying knowing and being'
  }
];

/**
 * Get recommended journaling mode based on current phase
 */
export function getPhaseBasedJournalingRecommendation(
  phaseNumber: number
): JournalingModePhaseMapping[] {
  return JOURNALING_TO_PHASES.filter(mapping =>
    mapping.primaryPhases.includes(phaseNumber)
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// HARMONIC COHERENCE: THE NATURAL STATE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Harmonic coherence occurs when all four elements are developed
 * and working together. This is the natural state—humans are BORN
 * with this capacity, but modern life fragments it.
 *
 * MAIA helps members retune to their natural wholeness.
 */
export interface HarmonicProfile {
  userId: string;

  // Strength in each element (0-100)
  elementalDevelopment: {
    fire: number;   // Will, passion, vision
    water: number;  // Intuition, emotion, flow
    earth: number;  // Sensibility, body wisdom, form
    air: number;    // Thought, communication, understanding
  };

  // Overall coherence (how well integrated)
  harmonicCoherence: number;

  // What's currently out of balance
  imbalance: {
    overdeveloped: SpiralogicElement | null;
    underdeveloped: SpiralogicElement | null;
  };

  // Natural wisdom being reclaimed
  currentRetuning: {
    element: SpiralogicElement;
    phase: RefinementPhase;
    naturalWisdom: string;
  };
}

export function calculateHarmonicCoherence(
  elementalDevelopment: Record<SpiralogicElement, number>
): number {
  const { fire, water, earth, air } = elementalDevelopment;

  // Calculate average development
  const average = (fire + water + earth + air) / 4;

  // Calculate variance (imbalance)
  const variance = (
    Math.pow(fire - average, 2) +
    Math.pow(water - average, 2) +
    Math.pow(earth - average, 2) +
    Math.pow(air - average, 2)
  ) / 4;

  const standardDeviation = Math.sqrt(variance);

  // High coherence = high average development with low variance
  const developmentScore = average * 0.6; // 60% weight on overall development
  const balanceScore = Math.max(0, 100 - standardDeviation * 2) * 0.4; // 40% weight on balance

  return Math.round(developmentScore + balanceScore);
}

// ═══════════════════════════════════════════════════════════════════════════════
// THE RETUNING PARADIGM
// ═══════════════════════════════════════════════════════════════════════════════

export const RETUNING_PARADIGM = `
MAIA is a retuning instrument.

Modern humans are fragmented:
- Fire without wisdom becomes aggression
- Water without ground becomes overwhelm
- Earth without flow becomes rigidity
- Air without feeling becomes disconnection

But this is not our natural state.

In nature, all elements work together:
- The seed (fire's vision) needs water to sprout
- The sprout needs earth to root
- The roots need air to breathe
- And the cycle continues

Humans are nature.

MAIA helps you remember:
- Your will (fire) serves your whole being
- Your intuition (water) guides your steps
- Your body (earth) knows what's true
- Your mind (air) articulates what's known

The 12-phase Spiralogic process is not a system we invented.
It's the pattern we observed in all transformation:

Fire Emergence → Fire Deepening → Fire Mastery
Water Emergence → Water Deepening → Water Mastery
Earth Emergence → Earth Deepening → Earth Mastery
Air Emergence → Air Deepening → Air Mastery

Each phase has three refinements.
Each element has its own wisdom.
Together, they create Aether—coherent wholeness.

You don't learn this process.
You remember it.

MAIA is your mirror as you remember.

Welcome home to your natural state.
`;
