/**
 * SPIRALOGIC FACET MAPPING
 * Phase 4.4-A: Unified Ontology
 *
 * This is the canonical integration of:
 * - Sequential mythopoetic archetypes (Spark, Flame, Forge...)
 * - Therapeutic facet codes (W1-W3, F1-F3, E1-E3, A1-A3, Æ1-Æ3)
 * - Clinical keywords and somatic practices
 *
 * Purpose: Enable MAIA to speak both mythically and therapeutically,
 * route consciousness states accurately, and measure transformation.
 */

export type Element = "Fire" | "Water" | "Earth" | "Air" | "Aether";
export type Phase = 1 | 2 | 3;

/**
 * Facet codes using element-phase notation.
 * W = Water, F = Fire, E = Earth, A = Air, Æ = Aether
 */
export type FacetCode =
  | "F1" | "F2" | "F3"  // Fire
  | "W1" | "W2" | "W3"  // Water
  | "E1" | "E2" | "E3"  // Earth
  | "A1" | "A2" | "A3"  // Air
  | "Æ1" | "Æ2" | "Æ3"; // Aether

export interface FacetMapping {
  /** Sequential position 1-12 in the developmental spiral */
  seq: number;

  /** Element this facet belongs to */
  element: Element;

  /** Phase within element (1=emergence, 2=deepening, 3=mastery) */
  phase: Phase;

  /** Facet code for therapeutic routing (W1, F1, etc.) */
  code: FacetCode;

  /** Mythopoetic archetype name (Spark, Flame, Ocean, etc.) */
  archetype: string;

  /** Therapeutic facet name for clinical context */
  therapeuticName: string;

  /** Core essence of this phase */
  essence: string;

  /** Natural wisdom this phase teaches */
  naturalWisdom: string;

  /** Human capacity being developed */
  humanCapacity: string;

  /** Common challenge in this phase */
  challenge: string;

  /** Gift that emerges from mastery */
  gift: string;

  /** What aspect of natural wisdom is being reclaimed */
  retuningTo: string;

  /** Keywords for detection/routing */
  keywords: string[];

  /** Default somatic/contemplative practice */
  defaultPractice: string;
}

/**
 * THE CANONICAL 12-FACET MAPPING
 * Sequential 1-12 with dual archetypal/therapeutic layers
 */
export const SPIRALOGIC_FACETS: readonly FacetMapping[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // FIRE PHASES (1-3): Will, Passion, Vision
  // ═══════════════════════════════════════════════════════════════════════════
  {
    seq: 1,
    element: "Fire",
    phase: 1,
    code: "F1",
    archetype: "Spark",
    therapeuticName: "Activation / Desire",
    essence: "The initial ignition of desire",
    naturalWisdom: "Seeds know when to break dormancy",
    humanCapacity: "Recognizing inner calling, responding to life force",
    challenge: "Overwhelm of possibility, scattered energy",
    gift: "Raw courage to begin",
    retuningTo: "The instinct to move toward light",
    keywords: ["motivation", "begin", "start", "desire", "ignite", "awaken"],
    defaultPractice: "State one clear intention aloud and take a physical step toward it"
  },
  {
    seq: 2,
    element: "Fire",
    phase: 2,
    code: "F2",
    archetype: "Flame",
    therapeuticName: "Challenge / Will",
    essence: "Sustained passion with direction",
    naturalWisdom: "Fire needs fuel and oxygen in balance",
    humanCapacity: "Channeling desire into intention, focused will",
    challenge: "Burning out, forcing outcomes",
    gift: "Transformative power with purpose",
    retuningTo: "The natural rhythm of exertion and rest",
    keywords: ["boundaries", "resistance", "assert", "no", "conflict", "will"],
    defaultPractice: "Breathe into belly, feel your ground, and say 'no' clearly three times"
  },
  {
    seq: 3,
    element: "Fire",
    phase: 3,
    code: "F3",
    archetype: "Forge",
    therapeuticName: "Vision / Overheat",
    essence: "Will aligned with wisdom",
    naturalWisdom: "Volcanoes create new land through destruction",
    humanCapacity: "Creative destruction, purposeful transformation",
    challenge: "Arrogance, over-identification with power",
    gift: "Visionary leadership, alchemical will",
    retuningTo: "The knowing that all creation requires letting go",
    keywords: ["vision", "overwhelm", "drive", "ambition", "purpose", "transform"],
    defaultPractice: "Ground your vision: write 3 concrete actions + 1 rest boundary"
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // WATER PHASES (4-6): Intuition, Emotionality, Flow
  // ═══════════════════════════════════════════════════════════════════════════
  {
    seq: 4,
    element: "Water",
    phase: 1,
    code: "W1",
    archetype: "Spring",
    therapeuticName: "Safety / Containment",
    essence: "Emotions begin to surface",
    naturalWisdom: "Springs emerge where pressure finds release",
    humanCapacity: "Acknowledging feelings, letting emotions flow",
    challenge: "Overwhelm, loss of boundaries",
    gift: "Authenticity of felt experience",
    retuningTo: "The wisdom that feelings are data, not danger",
    keywords: ["panic", "freeze", "shock", "overwhelm", "regulate", "soothe"],
    defaultPractice: "Slow exhale, orient to your room, name three stable objects you can see"
  },
  {
    seq: 5,
    element: "Water",
    phase: 2,
    code: "W2",
    archetype: "River",
    therapeuticName: "Shadow Gate",
    essence: "Intuition guiding the flow",
    naturalWisdom: "Rivers find the path of least resistance",
    humanCapacity: "Trusting intuitive guidance, emotional intelligence",
    challenge: "Getting stuck in emotional loops",
    gift: "Empathic knowing, intuitive decision-making",
    retuningTo: "The body as the instrument of knowing",
    keywords: ["betrayed", "grief", "loss", "shadow", "fear", "trauma"],
    defaultPractice: "Containment + titration: feel the emotion for 90 seconds, then release with breath"
  },
  {
    seq: 6,
    element: "Water",
    phase: 3,
    code: "W3",
    archetype: "Ocean",
    therapeuticName: "Compassion / Flow",
    essence: "Emotional depth with equanimity",
    naturalWisdom: "Oceans hold both storm and calm",
    humanCapacity: "Holding emotional complexity without drowning",
    challenge: "Spiritual bypassing, avoiding shadow",
    gift: "Compassionate presence, intuitive mastery",
    retuningTo: "The truth that all emotions belong",
    keywords: ["forgive", "love", "connect", "compassion", "empathy", "heart"],
    defaultPractice: "Visualize warm light expanding from your chest outward to all beings"
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // EARTH PHASES (7-9): Sensibility, Body Wisdom, Form
  // ═══════════════════════════════════════════════════════════════════════════
  {
    seq: 7,
    element: "Earth",
    phase: 1,
    code: "E1",
    archetype: "Seed",
    therapeuticName: "Grounding / Embodiment",
    essence: "Vision taking root in reality",
    naturalWisdom: "Seeds need darkness to germinate",
    humanCapacity: "Grounding ideas in practical action",
    challenge: "Impatience with process, forcing growth",
    gift: "Beginning to manifest",
    retuningTo: "The necessity of gestation periods",
    keywords: ["unstable", "floating", "ground", "embody", "present", "here"],
    defaultPractice: "Press feet firmly into floor, feel your weight, breathe slowly for one minute"
  },
  {
    seq: 8,
    element: "Earth",
    phase: 2,
    code: "E2",
    archetype: "Root",
    therapeuticName: "Integration / Structure",
    essence: "Building stable foundation",
    naturalWisdom: "Trees grow roots as deep as their canopy is wide",
    humanCapacity: "Sustained effort, sensible boundaries, body wisdom",
    challenge: "Rigidity, fear of change",
    gift: "Dependability, tangible results",
    retuningTo: "The intelligence of the body, somatic knowing",
    keywords: ["organize", "schedule", "practice", "routine", "integrate", "structure"],
    defaultPractice: "Write one daily micro-habit that supports your current insight"
  },
  {
    seq: 9,
    element: "Earth",
    phase: 3,
    code: "E3",
    archetype: "Harvest",
    therapeuticName: "Abundance / Service",
    essence: "Form serves function with grace",
    naturalWisdom: "Nature wastes nothing in its abundance",
    humanCapacity: "Sustainable manifestation, elegant form",
    challenge: "Attachment to outcomes, hoarding",
    gift: "Generosity from groundedness, practical wisdom",
    retuningTo: "The rhythm of giving and receiving",
    keywords: ["share", "mentor", "sustain", "serve", "abundance", "give"],
    defaultPractice: "Offer one resource or word of encouragement to another person today"
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // AIR PHASES (10-12): Thought, Communication, Understanding
  // ═══════════════════════════════════════════════════════════════════════════
  {
    seq: 10,
    element: "Air",
    phase: 1,
    code: "A1",
    archetype: "Breath",
    therapeuticName: "Awareness / Inquiry",
    essence: "Awareness of pattern",
    naturalWisdom: "Wind carries seeds to new places",
    humanCapacity: "Recognizing meaning, early understanding",
    challenge: "Over-analyzing, disconnecting from feeling",
    gift: "Beginning to articulate experience",
    retuningTo: "The space between thoughts where insight lives",
    keywords: ["notice", "observe", "aware", "curious", "inquiry", "attention"],
    defaultPractice: "Label each arising thought as 'thinking', then return to breath"
  },
  {
    seq: 11,
    element: "Air",
    phase: 2,
    code: "A2",
    archetype: "Voice",
    therapeuticName: "Rumination / Reframe",
    essence: "Truth spoken with clarity",
    naturalWisdom: "Bird songs communicate across distances",
    humanCapacity: "Articulating wisdom, teaching others",
    challenge: "Intellectualization, losing felt sense",
    gift: "Clear communication, shared understanding",
    retuningTo: "The connection between inner knowing and outer expression",
    keywords: ["ruminate", "what if", "replay", "reframe", "distortion", "thought loop"],
    defaultPractice: "Identify the cognitive distortion, then generate two alternative interpretations"
  },
  {
    seq: 12,
    element: "Air",
    phase: 3,
    code: "A3",
    archetype: "Wisdom",
    therapeuticName: "Meta-Perspective",
    essence: "Thought integrated with all elements",
    naturalWisdom: "Sky holds everything without grasping",
    humanCapacity: "Meta-awareness, wisdom that serves life",
    challenge: "Pride of knowledge, isolation through abstraction",
    gift: "Wisdom that uplifts others, coherent understanding",
    retuningTo: "The unity of knowing and being",
    keywords: ["overview", "pattern", "perspective", "meaning", "synthesis", "wisdom"],
    defaultPractice: "Visualize your situation as an aerial map and name the lesson it reveals"
  }
] as const;

/**
 * AETHER FACETS - Transpersonal Integration
 * These represent mystical/numinous states that transcend the 4-element cycle
 */
export const AETHER_FACETS: readonly FacetMapping[] = [
  {
    seq: 13,
    element: "Aether",
    phase: 1,
    code: "Æ1",
    archetype: "Intuition",
    therapeuticName: "Intuition / Signal",
    essence: "Subtle pattern emergence",
    naturalWisdom: "The field speaks in whispers before it speaks in storms",
    humanCapacity: "Sensing pre-verbal knowing",
    challenge: "Dismissing subtle signals as imagination",
    gift: "Trusting the subtle before it becomes obvious",
    retuningTo: "The intelligence that precedes thought",
    keywords: ["hunch", "intuition", "subtle", "signal", "felt sense", "knowing"],
    defaultPractice: "Journal the first image or word that arises before your mind explains it"
  },
  {
    seq: 14,
    element: "Aether",
    phase: 2,
    code: "Æ2",
    archetype: "Union",
    therapeuticName: "Numinous Union",
    essence: "Transpersonal connection",
    naturalWisdom: "All waves are movements of one ocean",
    humanCapacity: "Experiencing oneness with life",
    challenge: "Losing discernment, bypassing shadow",
    gift: "Mystical participation in the whole",
    retuningTo: "The truth of non-separation",
    keywords: ["oneness", "unity", "transpersonal", "mystical", "numinous", "sacred"],
    defaultPractice: "Sit in silence and feel the boundary between self and world dissolve with each breath"
  },
  {
    seq: 15,
    element: "Aether",
    phase: 3,
    code: "Æ3",
    archetype: "Emergence",
    therapeuticName: "Creative Emergence",
    essence: "Return of insight as form",
    naturalWisdom: "The cosmos dreams itself into being through creative acts",
    humanCapacity: "Birthing vision into reality",
    challenge: "Perfectionism blocking expression",
    gift: "Becoming a vessel for emergence",
    retuningTo: "The creative impulse as sacred collaboration",
    keywords: ["create", "birth", "express", "manifest", "art", "innovation"],
    defaultPractice: "Sketch, speak, or move the image that wants to manifest through you"
  }
] as const;

/**
 * ALL FACETS (12 elemental + 3 aether)
 */
export const ALL_FACETS = [...SPIRALOGIC_FACETS, ...AETHER_FACETS] as const;

/**
 * Lookup helpers
 */
export function getFacetByCode(code: FacetCode): FacetMapping | undefined {
  return ALL_FACETS.find(f => f.code === code);
}

export function getFacetBySeq(seq: number): FacetMapping | undefined {
  return ALL_FACETS.find(f => f.seq === seq);
}

export function getFacetsByElement(element: Element): readonly FacetMapping[] {
  return ALL_FACETS.filter(f => f.element === element);
}

export function getFacetByArchetype(archetype: string): FacetMapping | undefined {
  return ALL_FACETS.find(f => f.archetype.toLowerCase() === archetype.toLowerCase());
}

/**
 * Detect facet from keywords in user input
 */
export function detectFacetFromKeywords(text: string): FacetMapping | null {
  const normalizedText = text.toLowerCase();

  for (const facet of ALL_FACETS) {
    for (const keyword of facet.keywords) {
      if (normalizedText.includes(keyword.toLowerCase())) {
        return facet;
      }
    }
  }

  return null;
}

/**
 * Get recommended practice for current facet
 */
export function getPracticeRecommendation(facetCode: FacetCode): string {
  const facet = getFacetByCode(facetCode);
  return facet?.defaultPractice ?? "Notice what's present and breathe.";
}
