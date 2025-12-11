/**
 * 🌀 MAIA 12-Phase Spiralogic Core System
 *
 * The consciousness intelligence that recognizes where users are in their
 * elemental journey and responds with appropriate wisdom and support.
 *
 * Based on Kelly Nezat's "Elemental Alchemy: The Ancient Art of Living a Phenomenal Life"
 */

import { v4 as uuidv4 } from 'uuid';

// ====================================================================
// CORE SPIRALOGIC TYPES
// ====================================================================

export type Element = "Fire" | "Water" | "Earth" | "Air" | "Aether";
export type Phase = 1 | 2 | 3;
export type Arc = "regressive" | "progressive";
export type ElementQuality = "Cardinal" | "Fixed" | "Mutable";
export type AetherTone = "Stillpoint" | "Communion" | "Emergence";

// Expanded elemental facets - the complete consciousness cosmology
export interface ElementalFacet {
  element: Element;
  phase: Phase;
  quality: ElementQuality;
  coreMovement: string;
  coreQuestion: string;
  developmentalTheme: string;
  shadowPattern: string;
  goldMedicine: string;
  mythicResonance?: string;
}

// Comprehensive Fire Facet Descriptor with MAIA integration
export interface ElementalFacetDescriptor extends ElementalFacet {
  id: string;                             // "Fire-1", "Fire-2", "Fire-3"
  archetypalImage: string;                // "The first flare in the dark"
  coreFunction: string;                   // Primary purpose of this facet

  // Inner experience signatures
  healthyExperience: string[];            // Healthy manifestations
  shadowDistortions: string[];            // Shadow/distorted patterns

  // MAIA language detection
  typicalLanguageCues: string[];          // Language patterns MAIA watches for

  // MAIA response guidance
  maiaMainJob: string[];                  // What MAIA focuses on in this facet
  canonicalQuestions: string[];           // Updated, specific questions

  // Disposable Pixel patterns
  disposablePixelPatterns: {
    id: string;
    label: string;
    description: string;
    panelContent: string[];
  }[];

  // Field awareness
  nextElementalTransition?: {
    to: Element;
    phase: Phase;
    transitionPrompt: string;
  };
}

export interface SpiralogicCell {
  element: Element;
  phase: Phase;
  arc: Arc;
  quality: ElementQuality;
  context: string;        // "career", "relationship", "parenting", etc.
  confidence: number;     // 0-1 overall confidence
}

export interface AstroSignature {
  // Qualitative state, not raw chart dump
  dominantPlanets: string[];      // ["Saturn", "Uranus"]
  dominantAspects: string[];      // ["Saturn square Sun", "Neptune trine Moon"]
  elementEmphasis: Element[];     // ["Water", "Earth"]
  tempo: "slow" | "fast" | "sudden" | "underworld";
  phaseHint?: {
    element: Element;
    phase: Phase;                 // Rough correspondence to Spiralogic
  };
  window: {
    from: string;                 // ISO timestamp
    to: string;                   // ISO timestamp
  };
  confidence: number;
  shortLabel?: string;            // "Saturnian Depth Phase" for UI
}

export interface FieldEvent {
  id: string;
  userId: string;
  timestamp: string;
  source: "voice" | "text" | "upload" | "system";
  rawInput: string;
  normalizedInput: string;

  // Spiralogic tagging
  spiralogic: SpiralogicCell;

  // Optional: archetypal astrology timing layer
  astroSignature?: AstroSignature;

  // Optional: richer tagging
  secondaryElements?: Element[];
  frameworksUsed?: string[];     // e.g. ["IPP", "CBT", "Jungian"]
  agentsInvolved?: string[];     // e.g. ["InnerGuide", "ShadowAgent"]

  // Links
  contextDomain?: string;        // "teen_parenting", "startup_founder"
  relatedEventIds?: string[];

  // Storage for response
  aiResponseSummary?: string;
  aiResponseType?: string;       // "reflection", "teaching", "divination"
}

// ====================================================================
// MAIA RESPONSE SYSTEM
// ====================================================================

export interface MaiaSuggestedAction {
  id: string;                 // "capture_journal", "parenting_ipp", "show_timeline"
  label: string;              // "Save as Journal", "Use Ideal Parenting Protocol", etc.
  priority: number;           // for ordering
  elementalResonance: Element; // which element this action serves
  frameworkHint?: string;     // "IPP", "CBT", etc.
}

export interface MaiaCoreResponse {
  coreMessage: string;        // text MAIA says
  spiralogic: SpiralogicCell;
  suggestedActions: MaiaSuggestedAction[]; // for UI "disposable pixels"
  frameworksUsed: string[];
  fieldEventId: string;
  presenceMode?: 'dialogue' | 'patient' | 'scribe';
  elementalGuidance?: string; // additional elemental wisdom
  astro?: {
    shortLabel: string;       // "Saturnian Depth Phase" for UI chip
    contextHint: string;      // Brief archetypal weather description
  };
}

// ====================================================================
// 12-PHASE CANONICAL QUESTIONS
// ====================================================================

export const CANONICAL_QUESTIONS: Record<string, string[]> = {
  // FIRE - Initiation / Destiny-Motion
  "Fire-1": [
    "What is it that's calling you right now, even if it feels small or unreasonable?",
    "If you let yourself be honest, what wants to begin?",
    "What would feel like a brave first step toward this spark, not a perfect one?"
  ],
  "Fire-2": [
    "Where are you feeling the most friction or resistance as you try to live this?",
    "What have you learned so far from trying, even if it hasn't gone how you hoped?",
    "What support or resource would make this trial feel survivable rather than overwhelming?"
  ],
  "Fire-3": [
    "In what ways has saying yes to this changed who you understand yourself to be?",
    "What parts of your old identity no longer fit as you live this out?",
    "If this fire were fully honored, how would your daily life look different from now?"
  ],

  // WATER - Descent / Shadow-Alchemy
  "Water-1": [
    "What feelings are surfacing as you live this—beneath the story, what is the raw emotion?",
    "Where in your body do you notice this the most when you slow down and feel it?",
    "Who or what feels emotionally at stake in this for you?"
  ],
  "Water-2": [
    "What inner conflict or self-judgment is strongest here, if you name it plainly?",
    "What old pattern, wound, or archetypal 'character' feels like it has woken up in this situation?",
    "If this descent were not a failure but an initiation, what do you sense it is asking you to face?"
  ],
  "Water-3": [
    "Despite the difficulty, what truth about yourself feels more real or solid now?",
    "What small piece of gold—insight, compassion, clarity—do you not want to lose from this?",
    "How would you treat yourself if you fully honored what you have lived through here?"
  ],

  // EARTH - Embodiment / Form
  "Earth-1": [
    "If you treated this insight as a seed, what kind of container or structure would protect and nurture it?",
    "What is the simplest, smallest way this could begin to take shape in your real life?",
    "What boundary or commitment would honor what you've discovered inside?"
  ],
  "Earth-2": [
    "What consistent practice or rhythm would help this grow, even if it's very modest?",
    "What do you realistically need—time, space, support, tools—to keep this alive?",
    "Where do you notice the gap between your intention and your current habits, and how might we bridge a little of it?"
  ],
  "Earth-3": [
    "In what concrete ways can you see this now existing in your world?",
    "What tells you this is no longer just an idea but part of your lived reality?",
    "How do you want to care for and maintain this form so it remains aligned with your inner gold?"
  ],

  // AIR - Meaning / Transmission / Culture
  "Air-1": [
    "If you were explaining this to a trusted friend, how would you describe what's changing in you?",
    "What words feel closest to the heart of what you're trying to say, even if they're imperfect?",
    "Who, specifically, would you most want to share this with first—and why them?"
  ],
  "Air-2": [
    "If this were a pattern others might live through, how would you name its key stages?",
    "What have you learned here that you wish someone had told you earlier in your journey?",
    "How might this become a simple practice, principle, or framework you could pass on?"
  ],
  "Air-3": [
    "If this became part of a larger story about how humans grow, what chapter would this be?",
    "How do you imagine others in the future might adapt or evolve what you've discovered?",
    "What is the essence you want to send into the collective field, even knowing it will change in others' hands?"
  ]
};

// ====================================================================
// 🔥 FIRE FACETS REGISTRY - Complete Consciousness Cosmology Prototype
// ====================================================================

export const FIRE_FACETS_REGISTRY: ElementalFacetDescriptor[] = [
  {
    // FIRE 1 - The Call / Spark of Destiny (Cardinal Fire)
    id: "Fire-1",
    element: "Fire",
    phase: 1,
    quality: "Cardinal",
    archetypalImage: "The first flare in the dark. A match struck in a long night. The daimon taps your shoulder.",
    coreFunction: "Open the cycle. Announce: 'This wants to happen.' Move from inertia → possibility.",
    coreMovement: "Opening to destiny motion",
    coreQuestion: "What wants to begin through me?",
    developmentalTheme: "Honoring the call before understanding the path",
    shadowPattern: "Endless new starts with no follow-through; addictive novelty-chasing",
    goldMedicine: "Honoring the validity of the call, even before proof",

    healthyExperience: [
      "Sudden clarity or irritation: 'I can't keep living like this'",
      "Feeling called to a project, path, conversation, risk",
      "Energy rising, curiosity, anticipation"
    ],

    shadowDistortions: [
      "Endless 'new starts' with no follow-through",
      "Addictive chasing of novelty to avoid depth (never leaving Fire 1)",
      "Spiritual bypass framed as 'calling' (avoiding Water/Earth)"
    ],

    typicalLanguageCues: [
      "I've been thinking about...",
      "I feel this pull to...",
      "Something in me keeps saying I need to...",
      "I want to try, but I don't know where to start."
    ],

    maiaMainJob: [
      "Name the call",
      "Normalize the tension between desire and uncertainty",
      "Help the user pick one first step, not a full plan"
    ],

    canonicalQuestions: [
      "If you were brutally honest, what is actually calling you right now?",
      "What tiny experiment would honor this without blowing up your life?",
      "What part of you is afraid of even naming this?"
    ],

    disposablePixelPatterns: [
      {
        id: "name_the_call",
        label: "Name the Call",
        description: "Small panel to articulate the emerging calling",
        panelContent: [
          "Write the one sentence that captures this.",
          "What would count as a first respectful step?"
        ]
      },
      {
        id: "mark_new_chapter",
        label: "Mark this as a New Chapter",
        description: "MAIA tags this as a chapter opening in their field",
        panelContent: [
          "This moment marks a new beginning in your journey.",
          "How do you want to honor this threshold?"
        ]
      }
    ],

    nextElementalTransition: {
      to: "Fire",
      phase: 2,
      transitionPrompt: "Now that you've named the call, what happens when you actually try to live it?"
    }
  },

  {
    // FIRE 2 - The Trial / Gauntlet of Action (Fixed Fire)
    id: "Fire-2",
    element: "Fire",
    phase: 2,
    quality: "Fixed",
    archetypalImage: "The hero on the road, blistered feet, first real enemies. The kiln where intentions are tested.",
    coreFunction: "Expose what's real. Distinguish fantasy from viable path through friction.",
    coreMovement: "Testing through action and resistance",
    coreQuestion: "What is real when the rubber meets the road?",
    developmentalTheme: "Learning which fires are worth the fuel",
    shadowPattern: "Interpreting all resistance as 'not meant to be'; burnout from over-pushing",
    goldMedicine: "Reading friction as feedback, not condemnation",

    healthyExperience: [
      "Actual action: making calls, writing, showing up",
      "Experiencing resistance: rejection, boredom, failure, unexpected complexity",
      "Learning limits, skills, stakes"
    ],

    shadowDistortions: [
      "Interpreting all resistance as 'it's not meant to be'",
      "Over-pushing into burnout ('if I suffer more, it will work')",
      "Rage or self-hate when reality doesn't match fantasy"
    ],

    typicalLanguageCues: [
      "I tried and it blew up / fell flat / no one responded.",
      "I keep hitting walls.",
      "It's so much harder than I expected.",
      "Part of me wants to quit."
    ],

    maiaMainJob: [
      "Validate the difficulty without romanticizing it",
      "Help the user extract learning from the blows",
      "Discern: 'Is this a necessary trial, or a sign to redirect?'"
    ],

    canonicalQuestions: [
      "What specifically have you learned from what didn't work?",
      "If this resistance is training rather than a 'no', what is it training in you?",
      "Where might you be trying to carry this alone, beyond your actual capacity?"
    ],

    disposablePixelPatterns: [
      {
        id: "map_the_trials",
        label: "Map the Trials",
        description: "Extract learning from the friction",
        panelContent: [
          "List 3 hard things that have happened since you started.",
          "What did each one teach / demand of you?"
        ]
      },
      {
        id: "adjust_the_fire",
        label: "Adjust the Fire",
        description: "Guide strategic refinement without abandoning soul",
        panelContent: [
          "What can be simplified?",
          "What support could be added?",
          "What can be dropped without betraying the core?"
        ]
      }
    ],

    nextElementalTransition: {
      to: "Fire",
      phase: 3,
      transitionPrompt: "As you learn to work with resistance, how is this changing who you understand yourself to be?"
    }
  },

  {
    // FIRE 3 - Lived Fire / Identity Shift (Mutable Fire)
    id: "Fire-3",
    element: "Fire",
    phase: 3,
    quality: "Mutable",
    archetypalImage: "You in full stride. The queen/king in their domain. The one who has become what they once only imagined.",
    coreFunction: "Stabilize a new identity that's been earned through action and risk.",
    coreMovement: "Embodying achieved identity",
    coreQuestion: "Who have I become through this fire?",
    developmentalTheme: "Integrating achievement without fusing with it",
    shadowPattern: "Inflated hero complex; fear of changing course due to reputation",
    goldMedicine: "Allowing Fire 3 to hand the baton to Water 1 (deeper feeling & meaning)",

    healthyExperience: [
      "Sense of 'this is actually me now'",
      "Pride, grounded confidence, recognition from others",
      "Real consequences: responsibility, visibility, impact"
    ],

    shadowDistortions: [
      "Inflated hero: 'I am the work, I am the brand, I am the role'",
      "Fear of changing course because 'people see me this way now'",
      "Using identity to avoid vulnerability (resisting Water)"
    ],

    typicalLanguageCues: [
      "This is just who I am now.",
      "People come to me for X.",
      "I finally feel like I'm doing the thing.",
      "If I stopped doing this, who would I even be?"
    ],

    maiaMainJob: [
      "Help the user own the new identity with gratitude and realism",
      "Gently point toward the next arc: Water 1 ('How does this really feel now that you're in it?')",
      "Guard against ego inflation or self-erasure"
    ],

    canonicalQuestions: [
      "In what ways has this changed who you understand yourself to be?",
      "What parts of you feel unseen inside this new role?",
      "If you allowed this identity to keep evolving, what edge calls next?"
    ],

    disposablePixelPatterns: [
      {
        id: "name_new_self",
        label: "Name the New Self",
        description: "Articulate the identity transformation",
        panelContent: [
          "Complete the sentence: 'I am becoming someone who...'",
          "What qualities have grown in you through this?"
        ]
      },
      {
        id: "pass_torch_to_water",
        label: "Pass the Torch to Water",
        description: "Open to the next elemental cycle",
        panelContent: [
          "What feels tender, vulnerable, or unexpectedly emotional now that you're living this?"
        ]
      }
    ],

    nextElementalTransition: {
      to: "Water",
      phase: 1,
      transitionPrompt: "Now that you're living this identity, what deeper feelings and meanings are stirring underneath?"
    }
  }
];

// ====================================================================
// 💧 WATER FACETS REGISTRY - Soul Depth & Inner Transformation
// ====================================================================

export const WATER_FACETS_REGISTRY: ElementalFacetDescriptor[] = [
  {
    // WATER 1 - Opening of the Deep / Vulnerability (Cardinal Water)
    id: "Water-1",
    element: "Water",
    phase: 1,
    quality: "Cardinal",
    archetypalImage: "The surface of the lake ripples. A crack in the armor. Tears well for the first time in a long time. You realize, 'Oh… this matters.'",
    coreFunction: "From defended/mental to emotionally touched. The heart admits stakes. We move from 'this is interesting' to 'this could break my heart.'",
    coreMovement: "Opening to emotional truth and vulnerability",
    coreQuestion: "What does this really feel like in me, now that I let it land?",
    developmentalTheme: "Letting actual feeling come online; beginning true intimacy with the process",
    shadowPattern: "Flooding/overwhelm; immediate retreat to numbing; over-attachment at first touch",
    goldMedicine: "Permission to feel without immediately fixing; recognizing vulnerability as accurate signal of value",

    healthyExperience: [
      "First steps toward emotional honesty with self and others",
      "Heart opening to what really matters",
      "Beginning of true intimacy with the path activated in Fire"
    ],

    shadowDistortions: [
      "Flooding (overwhelm, collapsing, drowning in feeling)",
      "Immediate retreat or numbing: scrolling, addictions, 'productivity' to avoid feeling",
      "Over-attachment at first touch (clinging fast because it finally feels alive)"
    ],

    typicalLanguageCues: [
      "Now that it's actually happening, I feel scared / tender / exposed.",
      "I didn't think this would affect me this much.",
      "I feel weirdly emotional about this.",
      "I don't want to get hurt."
    ],

    maiaMainJob: [
      "Help the user notice and name the feelings",
      "Normalize the softening as part of the cycle, not a problem",
      "Prevent premature 'solutions' (jumping to Earth/Air to escape Water)"
    ],

    canonicalQuestions: [
      "If you pause for a moment, what are you actually feeling about this?",
      "Where in your body do you feel this the most?",
      "What does the part of you that feels this need from you right now?"
    ],

    disposablePixelPatterns: [
      {
        id: "name_the_feeling",
        label: "Name the Feeling",
        description: "Simple emotional awareness without rushing to fix",
        panelContent: [
          "Right now I feel...",
          "I feel it most in... (body location)"
        ]
      },
      {
        id: "make_space_for_this",
        label: "Make Space for This",
        description: "Presence-based support, no big psychoeducation",
        panelContent: [
          "Take three breaths with this feeling.",
          "What does this part of you need to know right now?"
        ]
      }
    ],

    nextElementalTransition: {
      to: "Water",
      phase: 2,
      transitionPrompt: "As you let yourself feel this more deeply, what older patterns or memories are stirring?"
    }
  },

  {
    // WATER 2 - Underworld / Shadow Gauntlet (Fixed Water)
    id: "Water-2",
    element: "Water",
    phase: 2,
    quality: "Fixed",
    archetypalImage: "Falling through the floor you thought was solid. The cave, the belly of the whale, the Dark Night. Old ghosts. Mirrors you don't want to look into.",
    coreFunction: "Feeling deepens into conflict. Old wounds, shame, terror of abandonment, betrayal, annihilation. The life you built around avoiding certain truths starts to crack.",
    coreMovement: "Death and rebirth through shadow encounter",
    coreQuestion: "What is this really asking me to face in myself, my history, or my patterns—even if I don't want to?",
    developmentalTheme: "Shadow work: projections, inherited patterns, deep attachment wounds; soul-level reorientation",
    shadowPattern: "Self-annihilation; repetition compulsion; blame/projection; nihilism",
    goldMedicine: "Seeing patterns as archetypal and systemic, not purely personal defect; receiving inner gold from descent",

    healthyExperience: [
      "Shadow work: projections, inherited patterns, deep attachment wounds",
      "Grief over who you've been, what you've lost, what never was",
      "Soul-level reorientation: 'Who am I if this story isn't true anymore?'"
    ],

    shadowDistortions: [
      "Self-annihilation: 'I am broken / unlovable / beyond repair'",
      "Repetition compulsion: recreating old trauma scenes in new situations",
      "Blame/projection: everyone else is the monster, never me",
      "Nihilism: 'Nothing matters, it's all meaningless'"
    ],

    typicalLanguageCues: [
      "I feel like I'm right back where I was as a kid / in that old relationship.",
      "I hate myself for doing this again.",
      "I feel broken / defective / doomed.",
      "Everything in me wants to run or burn this down."
    ],

    maiaMainJob: [
      "Be a non-terrifying mirror: clearly name the pattern without shaming",
      "Distinguish pattern vs essence: 'this is something moving through you, not what you are'",
      "Help the user find a small stable rock: context, meaning, or containment so the descent is survivable",
      "Not rush to premature 'silver linings'"
    ],

    canonicalQuestions: [
      "What old story or memory feels most activated by this?",
      "If this pattern had a face or archetypal figure, who/what would it be?",
      "What part of you is trying to protect you by repeating this?",
      "Is there someone (or something) you wish had been there for you in past versions of this?"
    ],

    disposablePixelPatterns: [
      {
        id: "name_the_pattern",
        label: "Name the Pattern",
        description: "Help recognize recurring themes without shame",
        panelContent: [
          "This reminds me of... (past situation)",
          "The repeating theme here is..."
        ]
      },
      {
        id: "meet_shadow_figure",
        label: "Meet the Shadow Figure",
        description: "Archetypal recognition of inner dynamics",
        panelContent: [
          "If this had a character, what would you call it?",
          "What does this part want to protect you from?"
        ]
      },
      {
        id: "create_safe_containment",
        label: "Create a Safe Containment",
        description: "Ritual container for underworld process",
        panelContent: [
          "This is a process, not a verdict.",
          "How do you want to mark this as sacred work rather than pathology?"
        ]
      }
    ],

    nextElementalTransition: {
      to: "Water",
      phase: 3,
      transitionPrompt: "What inner gold is beginning to emerge from this difficult passage?"
    }
  },

  {
    // WATER 3 - Inner Gold / Emotional Integration (Mutable Water)
    id: "Water-3",
    element: "Water",
    phase: 3,
    quality: "Mutable",
    archetypalImage: "You emerge from the river with something glowing in your hands. Scars are still there, but they've become part of your story, not your prison. A softer, wiser heart.",
    coreFunction: "From raw wound to integrated wisdom and compassion. Not 'fixed,' but transformed relationship to your own depths.",
    coreMovement: "Integration of shadow into wisdom and compassion",
    coreQuestion: "What truth about me, others, or life feels more deeply real now that I've lived through this?",
    developmentalTheme: "Self-forgiveness; holding complexity; new emotional boundaries rooted in self-respect",
    shadowPattern: "Golden victim identity; sentimentalizing pain instead of transforming; over-merging in name of love",
    goldMedicine: "Deep embodied compassion; capacity to sit with others' Water 2 without drowning; new emotional bone structure",

    healthyExperience: [
      "Self-forgiveness and forgiveness-of-others (without excusing harm)",
      "Ability to hold complexity: good/bad, victim/perpetrator, love/hurt in same system",
      "New emotional boundaries that are rooted in self-respect, not defense"
    ],

    shadowDistortions: [
      "Golden victim identity: my wound becomes my brand",
      "Sentimentalizing the pain instead of letting it really transform",
      "Over-merging in the name of love ('if I understand everything, I must accept everything')"
    ],

    typicalLanguageCues: [
      "It still hurts, but I don't hate myself the way I used to.",
      "I can see why I did that back then, even if I'd choose differently now.",
      "I feel strangely softer and stronger at the same time.",
      "I wouldn't wish this on anyone, but I'm not sure I'd erase it either."
    ],

    maiaMainJob: [
      "Help the user name and keep the gold so it doesn't get lost",
      "Validate the ongoing tenderness—this is not 'done,' it's integrated",
      "Invite Earth next: 'How do we honor this in form?' or Air: 'How do we speak from this place?'"
    ],

    canonicalQuestions: [
      "What do you know about yourself now that you did not know before this descent?",
      "How would you want to treat yourself next time this pattern starts to stir?",
      "If someone you loved were going through what you just lived through, how would you care for them?",
      "Is there a small way you want to mark or ritualize this turning point?"
    ],

    disposablePixelPatterns: [
      {
        id: "harvest_the_gold",
        label: "Harvest the Gold",
        description: "Articulate and preserve the wisdom gained",
        panelContent: [
          "Three things I've learned about myself from this are...",
          "One way I want to remember this wisdom when things get hard again is..."
        ]
      },
      {
        id: "mark_the_passage",
        label: "Mark the Passage",
        description: "Ritual acknowledgment of transformation",
        panelContent: [
          "Lighting a candle, choosing a symbol, writing a one-line vow.",
          "How do you want to honor this completion?"
        ]
      },
      {
        id: "bring_this_into_form",
        label: "Bring This into Form",
        description: "Bridge into Earth element",
        panelContent: [
          "How do we live differently because of this?",
          "What wants to take shape in the world from this inner gold?"
        ]
      }
    ],

    nextElementalTransition: {
      to: "Earth",
      phase: 1,
      transitionPrompt: "Now that you've gained this emotional wisdom, how does it want to take form and shape in your daily life?"
    }
  }
];

// ====================================================================
// 🌍 EARTH FACETS REGISTRY - Embodiment, Form, Craft, Reality
// ====================================================================

export const EARTH_FACETS_REGISTRY: ElementalFacetDescriptor[] = [
  {
    // EARTH 1 - Design of Form / Seed Pattern (Cardinal Earth)
    id: "Earth-1",
    element: "Earth",
    phase: 1,
    quality: "Cardinal",
    archetypalImage: "Blueprints on a table. A seed in your hand. The first decision to give this a real container.",
    coreFunction: "From felt inner knowing → first attempt at form, structure, boundary.",
    coreMovement: "Translating vision into workable container",
    coreQuestion: "What simple structure would best protect and grow this?",
    developmentalTheme: "Translating visions and inner gold into workable plans; choosing constraints that serve the essence",
    shadowPattern: "Planning forever, doing nothing; over-structuring to avoid anxiety; choosing 'reasonable' forms that betray soul",
    goldMedicine: "Minimum viable structure; listening for forms that fit the soul, not just market/family expectations",

    healthyExperience: [
      "Translating visions and inner gold into workable plans",
      "Choosing constraints that serve the essence (not random rigidity)",
      "Finding forms that honor the soul while being practical"
    ],

    shadowDistortions: [
      "Planning forever, doing nothing",
      "Over-structuring to avoid the anxiety of beginning",
      "Choosing forms that betray the soul because they're 'reasonable'"
    ],

    typicalLanguageCues: [
      "I know what I want but I don't know how to start.",
      "I need a container / schedule / structure.",
      "If I don't put some edges around this, it's going to evaporate."
    ],

    maiaMainJob: [
      "Help pick one first container: a time block, a ritual, a boundary, a tiny pilot",
      "Guard against over-engineering",
      "Distinguish soul-forms from should-forms"
    ],

    canonicalQuestions: [
      "What form would your soul choose, if it didn't have to justify itself?",
      "What's the smallest container that would honor this?",
      "How often, where, and with whom does this want to happen?"
    ],

    disposablePixelPatterns: [
      {
        id: "choose_container",
        label: "Choose a Container",
        description: "Define minimal structure to protect the essence",
        panelContent: [
          "How often?",
          "Where?",
          "With whom?"
        ]
      },
      {
        id: "soul_vs_should",
        label: "Soul vs Should",
        description: "Check if the form serves essence or expectation",
        panelContent: [
          "What form would your soul choose, if it didn't have to justify itself?",
          "What are you trying to prove with this structure?"
        ]
      }
    ],

    nextElementalTransition: {
      to: "Earth",
      phase: 2,
      transitionPrompt: "Now that you have a container, what daily rhythms and resources does this need to stay alive?"
    }
  },

  {
    // EARTH 2 - Germination / Practice & Resourcing (Fixed Earth)
    id: "Earth-2",
    element: "Earth",
    phase: 2,
    quality: "Fixed",
    archetypalImage: "Seed underground, invisible. Repetition, tending, slow growth. The workshop, the studio, the field you come back to every day.",
    coreFunction: "From design → daily practice and resourcing. Quiet, unglamorous faithfulness.",
    coreMovement: "Building through repetition and resource stewardship",
    coreQuestion: "What rhythms and resources does this need to stay alive over time?",
    developmentalTheme: "Reliability, craft, skill-building; learning sustainable pacing and resourcing",
    shadowPattern: "Grinding without heart; workaholism; collapsing when no instant results appear",
    goldMedicine: "Sacred routine; letting repetition deepen presence instead of deadening it",

    healthyExperience: [
      "Reliability, craft, skill-building",
      "Learning how your body, money, time, and relationships support or sabotage the work",
      "Finding sustainable pacing and resourcing"
    ],

    shadowDistortions: [
      "Grinding without heart: duty that has lost connection to soul",
      "Workaholism, control, rigidity",
      "Collapsing when no instant results appear ('it's not working, why bother?')"
    ],

    typicalLanguageCues: [
      "I'm doing it, but it's so slow / boring / invisible.",
      "I'm exhausted but can't stop.",
      "I keep dropping the habit after a few weeks."
    ],

    maiaMainJob: [
      "Normalize slow time and invisible growth",
      "Help recalibrate load, rest, and resourcing",
      "Distinguish between soulful discipline and self-punishment"
    ],

    canonicalQuestions: [
      "What is too much? What is too little? What feels just on the edge of alive?",
      "How can repetition deepen presence instead of deadening it?",
      "What support or resources would make this sustainable?"
    ],

    disposablePixelPatterns: [
      {
        id: "tune_rhythms",
        label: "Tune the Rhythms",
        description: "Calibrate sustainable practice",
        panelContent: [
          "What is too much?",
          "What is too little?",
          "What feels just on the edge of alive?"
        ]
      },
      {
        id: "see_invisible_growth",
        label: "See Invisible Growth",
        description: "Reflect on micro-shifts to feel progress",
        panelContent: [
          "What has shifted in the last month, even if small?",
          "What quality in you has grown stronger through this practice?"
        ]
      }
    ],

    nextElementalTransition: {
      to: "Earth",
      phase: 3,
      transitionPrompt: "As your practice stabilizes, how do you want to steward what you've built?"
    }
  },

  {
    // EARTH 3 - Embodied Form / Stewardship (Mutable Earth)
    id: "Earth-3",
    element: "Earth",
    phase: 3,
    quality: "Mutable",
    archetypalImage: "A tree fully grown. A practice, role, or structure that now reliably exists. The workshop with the door open. The house that can host others.",
    coreFunction: "From 'I'm building this' → 'I'm stewarding this living thing that exists.'",
    coreMovement: "Wise stewardship of established forms",
    coreQuestion: "How do I care for this form wisely, without clinging or abandoning?",
    developmentalTheme: "Stewardship, maintenance, adjustment over time; knowing when to tend, transform, or release",
    shadowPattern: "Rigidity; feeling trapped by what you built; identity fusion with the structure",
    goldMedicine: "Mature custodianship; recognizing when form should serve soul vs when it's time for compost",

    healthyExperience: [
      "Stewardship, maintenance, adjustment over time",
      "Learning when to prune, expand, or gracefully end things",
      "Allowing creations to outgrow you, or die, or seed something new"
    ],

    shadowDistortions: [
      "Rigidity: refusing to change systems that no longer fit",
      "Identity fusion with the structure: 'If this ends, I end'",
      "Resentment: feeling trapped by what you built"
    ],

    typicalLanguageCues: [
      "This thing is real now... but I'm tired / bored / conflicted about it.",
      "I feel responsible for it, maybe too responsible.",
      "I don't know whether to keep going or let it go."
    ],

    maiaMainJob: [
      "Help discern: tend, transform, or release?",
      "Validate the complexity of success ('getting what I wanted' and still feeling dissonance)",
      "Prepare handoff to Air (story, meaning, culture) or back to Fire (new call)"
    ],

    canonicalQuestions: [
      "Is this form still serving the soul that created it?",
      "What does this structure want to become next?",
      "If you treated this creation as a being, what phase is it in?"
    ],

    disposablePixelPatterns: [
      {
        id: "tend_transform_compost",
        label: "Tend, Transform, or Compost?",
        description: "Discern the next phase for established forms",
        panelContent: [
          "Is this form still serving the soul that created it?",
          "What wants to stay, change, or be released?"
        ]
      },
      {
        id: "what_does_this_want_now",
        label: "What Does This Want Now?",
        description: "Treat the creation as a being with its own trajectory",
        panelContent: [
          "If this structure could speak, what would it ask for?",
          "What phase is this creation in now?"
        ]
      }
    ],

    nextElementalTransition: {
      to: "Air",
      phase: 1,
      transitionPrompt: "What story or meaning wants to emerge from this embodied experience?"
    }
  }
];

// ====================================================================
// 🌬 AIR FACETS REGISTRY - Meaning, Pattern, Story, Culture
// ====================================================================

export const AIR_FACETS_REGISTRY: ElementalFacetDescriptor[] = [
  {
    // AIR 1 - First Telling / Honest Dialogue (Cardinal Air)
    id: "Air-1",
    element: "Air",
    phase: 1,
    quality: "Cardinal",
    archetypalImage: "Two people talking on a bench. A journal page with messy, honest words. The first time you actually say it out loud.",
    coreFunction: "From silent, internal experience → first attempts at language and sharing.",
    coreMovement: "Finding voice and authentic expression",
    coreQuestion: "If I spoke honestly about this, what would I say?",
    developmentalTheme: "Finding voice; testing language against reality and relationship",
    shadowPattern: "Self-censorship; over-explaining/intellectualizing; confiding in wrong people",
    goldMedicine: "Vulnerable speech that matches inner reality; finding good witnesses",

    healthyExperience: [
      "Finding voice",
      "Testing language against reality and relationship: do I feel more or less like myself when I say this?",
      "Vulnerable first attempts at honest expression"
    ],

    shadowDistortions: [
      "Self-censorship, code-switching to avoid rejection",
      "Over-explaining, intellectualizing instead of feeling",
      "Confiding in the wrong people (re-enacting invalidation)"
    ],

    typicalLanguageCues: [
      "I've never told anyone this but...",
      "I'm trying to put this into words.",
      "This might sound crazy, but..."
    ],

    maiaMainJob: [
      "Be a safe first listener",
      "Help them refine language that feels true, not performative",
      "Encourage sharing with the right real-world witnesses if/when appropriate"
    ],

    canonicalQuestions: [
      "What would you say if you knew you'd be truly heard?",
      "What words feel closest to your actual experience?",
      "Who would be a good witness for this truth?"
    ],

    disposablePixelPatterns: [
      {
        id: "find_your_words",
        label: "Find Your Words",
        description: "Articulate experience in authentic language",
        panelContent: [
          "Write one paragraph summing up your current chapter.",
          "What feels most true when you say it out loud?"
        ]
      },
      {
        id: "try_saying_it",
        label: "Try Saying It to Someone",
        description: "Gentle guidance on choosing witnesses",
        panelContent: [
          "Who might be a good first witness for this?",
          "What would make it safe to share this?"
        ]
      }
    ],

    nextElementalTransition: {
      to: "Air",
      phase: 2,
      transitionPrompt: "As you find your voice, what patterns are you starting to recognize that might help others?"
    }
  },

  {
    // AIR 2 - Pattern Speech / Frameworks & Teaching (Fixed Air)
    id: "Air-2",
    element: "Air",
    phase: 2,
    quality: "Fixed",
    archetypalImage: "Diagrams on a board. A pattern drawn in the sand. The moment you realize: 'This isn't just my story; it's a pattern others share.'",
    coreFunction: "From personal narrative → pattern recognition, teaching, frameworks.",
    coreMovement: "Creating maps and frameworks from lived experience",
    coreQuestion: "What's the pattern here that might help others recognize themselves?",
    developmentalTheme: "Turning lived experience into concepts, models, teachings; making maps while remembering map ≠ territory",
    shadowPattern: "Dogmatism; using theory to armor against vulnerability; forcing everything into the model",
    goldMedicine: "Flexible, living frameworks that remain accountable to experience; teaching as service",

    healthyExperience: [
      "Turning lived experience into concepts, models, teachings",
      "Making maps – while remembering the map is not the territory",
      "Pattern recognition that serves others' self-recognition"
    ],

    shadowDistortions: [
      "Dogmatism: 'I've found The System'",
      "Using theory to armor against further vulnerability",
      "Fitting everything into the model, even when it doesn't belong"
    ],

    typicalLanguageCues: [
      "I keep noticing the same pattern in myself and others.",
      "I think there's a bigger logic to this.",
      "I want to turn this into something that could guide people."
    ],

    maiaMainJob: [
      "Help clarify the pattern without over-claiming",
      "Tie their emerging frameworks back to Spiralogic + elements (meta-consistency)",
      "Guard against premature universalization"
    ],

    canonicalQuestions: [
      "When does this pattern typically start? Peak? Shift?",
      "What are the key turning points others should watch for?",
      "How does this pattern serve, even when it's difficult?"
    ],

    disposablePixelPatterns: [
      {
        id: "map_the_pattern",
        label: "Map the Pattern",
        description: "Identify key stages and turning points",
        panelContent: [
          "When does it start? Peak? Shift?",
          "What are the key turning points?"
        ]
      },
      {
        id: "draft_guiding_principle",
        label: "Draft a Guiding Principle",
        description: "Distill wisdom into guidance",
        panelContent: [
          "If you had to give one sentence to someone just entering this pattern, what would it be?"
        ]
      }
    ],

    nextElementalTransition: {
      to: "Air",
      phase: 3,
      transitionPrompt: "How do you want this wisdom to seed into the larger cultural field?"
    }
  },

  {
    // AIR 3 - Mythic Integration / Cultural Seeding (Mutable Air)
    id: "Air-3",
    element: "Air",
    phase: 3,
    quality: "Mutable",
    archetypalImage: "Stories traveling beyond you. People you'll never meet using your phrase, your practice, your map. Ideas becoming part of a wider myth.",
    coreFunction: "From 'my framework' → cultural participation. Your insight becomes a seed in the collective field.",
    coreMovement: "Contributing wisdom to collective field while releasing control",
    coreQuestion: "What essence do I want this to carry into the wider field, knowing it will change once it leaves my hands?",
    developmentalTheme: "Letting go of control; allowing work to be misunderstood, adapted, misused, and still serve something larger",
    shadowPattern: "Legacy obsession; cynical withdrawal when misunderstood; policing others' use",
    goldMedicine: "Trusting that what is true has its own trajectory; continuing personal evolution",

    healthyExperience: [
      "Letting go of control",
      "Allowing your work to be misunderstood, adapted, misused, and still serve something larger",
      "Continuing to evolve personally even as earlier versions of your work circulate"
    ],

    shadowDistortions: [
      "Legacy obsession, brand anxiety",
      "Cynicism: 'They don't get it, so I'll withdraw'",
      "Policing how others use your ideas"
    ],

    typicalLanguageCues: [
      "People are using my work in ways I didn't expect.",
      "This idea has a life of its own now.",
      "Part of me wants to protect it; part of me knows I have to let it go."
    ],

    maiaMainJob: [
      "Help grieve control-loss and celebrate contribution",
      "Reconnect them with their living edge (current Fire/Water/Earth/Air, not just past output)",
      "Contextualize their work in a wider mythic arc"
    ],

    canonicalQuestions: [
      "Beneath all the forms, what do you most hope this carries?",
      "How has sharing this work changed you?",
      "What is your current living edge, beyond what you've already given?"
    ],

    disposablePixelPatterns: [
      {
        id: "name_essence_seeding",
        label: "Name the Essence You're Seeding",
        description: "Identify the core that transcends specific forms",
        panelContent: [
          "Beneath all the forms, what do you most hope this carries?",
          "What would you want to remain if everything else changed?"
        ]
      },
      {
        id: "return_to_living_edge",
        label: "Return to Your Living Edge",
        description: "Reconnect with current growth edge",
        panelContent: [
          "What is your current Fire/Water/Earth/Air phase now?",
          "What wants to emerge in you beyond what you've already given?"
        ]
      }
    ],

    nextElementalTransition: {
      to: "Fire",
      phase: 1,
      transitionPrompt: "What new call is stirring as this cycle completes?"
    }
  }
];

// ====================================================================
// 🌐 COMPLETE 12-FACET ELEMENTAL COSMOLOGY REGISTRY
// ====================================================================

export const COMPLETE_ELEMENTAL_FACETS_REGISTRY: ElementalFacetDescriptor[] = [
  ...FIRE_FACETS_REGISTRY,
  ...WATER_FACETS_REGISTRY,
  ...EARTH_FACETS_REGISTRY,
  ...AIR_FACETS_REGISTRY
];

// Convenience lookup by facet ID (e.g. "Fire-1", "Water-2", "Earth-3", "Air-1")
export function getFacetById(id: string): ElementalFacetDescriptor | undefined {
  return COMPLETE_ELEMENTAL_FACETS_REGISTRY.find(facet => facet.id === id);
}

// Get all facets for a specific element
export function getFacetsByElement(element: Element): ElementalFacetDescriptor[] {
  return COMPLETE_ELEMENTAL_FACETS_REGISTRY.filter(facet => facet.element === element);
}

// Get facet by element and phase
export function getFacetByElementAndPhase(element: Element, phase: Phase): ElementalFacetDescriptor | undefined {
  return COMPLETE_ELEMENTAL_FACETS_REGISTRY.find(
    facet => facet.element === element && facet.phase === phase
  );
}

// ====================================================================
// 🎯 AWARENESS LEVEL SYSTEM - Depth Calibration for MAIA
// ====================================================================

export type AwarenessLevel = 1 | 2 | 3 | 4;
// 1 – Newcomer: New to inner work
// 2 – Practitioner: Familiar with process
// 3 – Adept: Archetypal native
// 4 – Steward: Research collaborator

export interface AwarenessProfile {
  userId: string;
  baselineLevel: AwarenessLevel;
  sessionLevel?: AwarenessLevel;           // Override for current session
  sessionLevelUpdatedAt?: string;          // ISO timestamp
  preferredComplexity?: 'minimal' | 'moderate' | 'full';
  languagePreferences?: {
    spiralogicTerms: boolean;              // Use F1/W2/etc codes
    astrologicalTerms: boolean;            // Use planetary/sign language
    depthPsychologyTerms: boolean;         // Use shadow/archetypal language
    somaticLanguage: boolean;              // Use body-aware language
  };
}

export interface DepthCalibrationResponse {
  selectedLevel: AwarenessLevel;
  userFeedback?: string;
  timestamp: string;
}

export function resolveSessionLevel(
  baseline: AwarenessLevel,
  preference: 'light' | 'normal' | 'deep'
): AwarenessLevel {
  if (preference === 'light') {
    return Math.max(1, baseline - 1) as AwarenessLevel;
  }
  if (preference === 'deep') {
    return Math.min(4, baseline + 1) as AwarenessLevel;
  }
  return baseline;
}

// ====================================================================
// 📝 FACET RESPONSE TEMPLATES BY AWARENESS LEVEL
// ====================================================================

export interface FacetResponseTemplate {
  facetId: string;
  awarenessLevel: AwarenessLevel;
  tone: 'gentle' | 'process' | 'archetypal' | 'technical';
  languageStyle: 'plain' | 'pattern-aware' | 'depth-fluent' | 'research-grade';
  coreMessage: string;
  suggestedActions: MaiaSuggestedAction[];
  maxOptionsCount: number;
  useElementalTerminology: boolean;
  useFacetCodes: boolean;
}

// Template for MAIA's depth calibration messages
export const DEPTH_CALIBRATION_SCRIPTS = {
  firstTimeBaseline: {
    message: `I can meet you at different levels of depth.

Some people want simple language and one clear step.
Others like to map patterns and use archetypal or symbolic language.

What feels right for you for now?`,
    options: [
      { id: 'gentle', label: 'Keep it gentle and simple' },
      { id: 'process', label: 'A bit of pattern is okay' },
      { id: 'archetypal', label: 'I\'m comfortable with deep archetypal work' }
    ]
  },

  sessionDepthCheck: {
    message: `For *today*, how would you like me to meet you?`,
    options: [
      { id: 'light', label: 'Keep it light today' },
      { id: 'normal', label: 'My usual depth is fine' },
      { id: 'deep', label: 'Let\'s go as deep as it wants to go' }
    ]
  },

  confirmationMessages: {
    gentle: `Good. I'll keep things plain, practical, and simple.
If you ever want more depth, you can say: "We can go deeper now."`,

    process: `Great. I'll use some pattern language and keep checking that it still feels usable.
If at any point it feels like too much, you can say: "Let's keep it simple today."`,

    archetypal: `Understood. I'll bring in deeper patterning and archetypal language when it serves you.
If you want me to stay surface-level on a given day, you can say: "Gentle mode, please."`
  }
};

// ====================================================================
// FRAMEWORK ARMS (Many-Armed Deity Architecture)
// ====================================================================

export type FrameworkTier = "foundational" | "meta" | "applied";

export interface FrameworkDescriptor {
  id: string;                       // "ARCHETYPAL_KERNEL", "IPP", "CBT", etc.
  label: string;                    // "Archetypal–Alchemical–Gnostic Kernel", etc.
  tier: FrameworkTier;              // foundational (always on) | meta (process) | applied (optional)
  lineage?: string;                 // "archetypal", "alchemy", "clinical", etc.

  preferredElements: Element[];     // e.g. ["Water", "Earth"]
  preferredPhases: Phase[];         // e.g. [1, 2]
  preferredContexts: string[];      // e.g. ["parenting", "relationship"]

  depth: "light" | "medium" | "clinical";
  implicitAllowed: boolean;         // can MAIA use it quietly?

  // Optional: mapping to canonical questions/moves
  canonicalQuestions?: {
    [key: string]: string[];        // e.g. "Water-2" -> list of questions
  };
}

export const FRAMEWORK_REGISTRY: FrameworkDescriptor[] = [
  // ====================================================================
  // FOUNDATIONAL TIER - The water MAIA swims in (always conceptually present)
  // ====================================================================
  {
    id: "ARCHETYPAL_KERNEL",
    label: "Archetypal–Alchemical–Gnostic Kernel",
    tier: "foundational",
    lineage: "archetypal",
    preferredElements: ["Fire", "Water", "Earth", "Air"],
    preferredPhases: [1, 2, 3],
    preferredContexts: ["general"],
    depth: "medium",
    implicitAllowed: true // Baked into MAIA's voice and being
  },
  {
    id: "ARCH_ASTROLOGY",
    label: "Archetypal Astrology",
    tier: "foundational",
    lineage: "astrology",
    preferredElements: ["Fire", "Water", "Earth", "Air"],
    preferredPhases: [1, 2, 3],
    preferredContexts: ["general"],
    depth: "medium",
    implicitAllowed: true // Used as global pattern-of-time lens when data present
  },
  {
    id: "DEPTH_PSYCHOLOGY",
    label: "Depth Psychology Core",
    tier: "foundational",
    lineage: "depth-psychology",
    preferredElements: ["Water", "Air"],
    preferredPhases: [1, 2, 3],
    preferredContexts: ["general"],
    depth: "medium",
    implicitAllowed: true // Shadow, unconscious, complexes, dreams
  },

  // ====================================================================
  // META TIER - Spiralogic Process Engine (always available)
  // ====================================================================
  {
    id: "SPIRALOGIC_META",
    label: "12-Phase Toroidal Process",
    tier: "meta",
    lineage: "process-alchemy",
    preferredElements: ["Fire", "Water", "Earth", "Air"],
    preferredPhases: [1, 2, 3],
    preferredContexts: ["general"],
    depth: "light",
    implicitAllowed: true // MAIA's coordinate system for any experience
  },
  {
    id: "ALCHEMICAL_OPERATIONS",
    label: "Alchemical Operations",
    tier: "meta",
    lineage: "alchemy",
    preferredElements: ["Fire", "Water", "Earth", "Air"],
    preferredPhases: [1, 2, 3],
    preferredContexts: ["general"],
    depth: "medium",
    implicitAllowed: true // Calcination, solutio, coagulatio, sublimatio
  },

  // ====================================================================
  // APPLIED TIER - Optional frameworks (only if explicitly enabled)
  // ====================================================================
  {
    id: "IPP",
    label: "Ideal Parenting Protocol",
    tier: "applied",
    lineage: "clinical-attachment",
    preferredElements: ["Water", "Earth"],
    preferredPhases: [1, 2, 3],
    preferredContexts: ["parenting"],
    depth: "clinical",
    implicitAllowed: false // Only if explicitly enabled
  },
  {
    id: "CBT",
    label: "Cognitive Behavioral Lens",
    tier: "applied",
    lineage: "clinical-cognitive",
    preferredElements: ["Fire", "Air"],
    preferredPhases: [1, 2],
    preferredContexts: ["career", "health", "general"],
    depth: "medium",
    implicitAllowed: true
  },
  {
    id: "JUNGIAN",
    label: "Jungian Depth Psychology",
    tier: "applied",
    lineage: "clinical-depth",
    preferredElements: ["Water", "Air"],
    preferredPhases: [2, 3],
    preferredContexts: ["shadow-work", "individuation", "dreams"],
    depth: "clinical",
    implicitAllowed: true
  },
  {
    id: "SHAMANIC",
    label: "Shamanic Journey Work",
    tier: "applied",
    lineage: "spiritual-indigenous",
    preferredElements: ["Fire", "Water"],
    preferredPhases: [1, 2],
    preferredContexts: ["spiritual", "healing", "initiation"],
    depth: "clinical",
    implicitAllowed: false
  },
  {
    id: "SOMATIC",
    label: "Somatic Experiencing",
    tier: "applied",
    lineage: "clinical-body",
    preferredElements: ["Water", "Earth"],
    preferredPhases: [1, 2, 3],
    preferredContexts: ["trauma", "embodiment", "healing"],
    depth: "clinical",
    implicitAllowed: true
  },
  {
    id: "IFS",
    label: "Internal Family Systems",
    tier: "applied",
    lineage: "clinical-parts",
    preferredElements: ["Water", "Air"],
    preferredPhases: [2, 3],
    preferredContexts: ["parts-work", "healing", "integration"],
    depth: "clinical",
    implicitAllowed: true
  },
  {
    id: "MINDFULNESS",
    label: "Mindfulness Practice",
    tier: "applied",
    lineage: "contemplative",
    preferredElements: ["Earth", "Air"],
    preferredPhases: [1, 2, 3],
    preferredContexts: ["meditation", "presence", "general"],
    depth: "light",
    implicitAllowed: true
  }
];

// ====================================================================
// PHASE MAPPING UTILITIES
// ====================================================================

export function getPhaseKey(element: Element, phase: Phase): string {
  return `${element}-${phase}`;
}

export function getElementQuality(phase: Phase): ElementQuality {
  switch (phase) {
    case 1: return "Cardinal";
    case 2: return "Fixed";
    case 3: return "Mutable";
  }
}

export function getArc(element: Element): Arc {
  return (element === "Fire" || element === "Water") ? "regressive" : "progressive";
}

export function getPhaseName(element: Element, phase: Phase): string {
  const phaseKey = getPhaseKey(element, phase);

  const phaseNames: Record<string, string> = {
    "Fire-1": "The Call / Spark of Destiny",
    "Fire-2": "The Trial / Gauntlet of Action",
    "Fire-3": "Lived Fire / Identity Shift",
    "Water-1": "Opening of the Deep / Vulnerability",
    "Water-2": "Underworld / Shadow Gauntlet",
    "Water-3": "Inner Gold / Emotional Integration",
    "Earth-1": "Design of Form / Seed Pattern",
    "Earth-2": "Germination / Resourcing & Practice",
    "Earth-3": "Embodied Form / Stable Presence",
    "Air-1": "First Telling / Dialogic Sharing",
    "Air-2": "Pattern Speech / Teaching & Framing",
    "Air-3": "Mythic Integration / Cultural Seeding"
  };

  return phaseNames[phaseKey] || `${element} Phase ${phase}`;
}

// ====================================================================
// CORE SPIRALOGIC FUNCTIONS
// ====================================================================

export function chooseFrameworksForCell(
  cell: SpiralogicCell,
  opts?: { enabledApplied?: string[] }
): string[] {
  const enabledApplied = opts?.enabledApplied ?? [];

  // ALWAYS include foundational and meta tiers - this is the water MAIA swims in
  const foundational = FRAMEWORK_REGISTRY
    .filter(fw => fw.tier === "foundational" || fw.tier === "meta")
    .map(fw => fw.id);

  // Only include applied frameworks if explicitly enabled and contextually relevant
  const applied = FRAMEWORK_REGISTRY.filter(fw =>
    fw.tier === "applied" &&
    enabledApplied.includes(fw.id) &&                 // Only if explicitly enabled
    fw.preferredElements.includes(cell.element) &&
    fw.preferredPhases.includes(cell.phase) &&
    (fw.preferredContexts.includes(cell.context) || fw.preferredContexts.includes("general"))
  ).map(fw => fw.id);

  return [...foundational, ...applied];
}

export function selectCanonicalQuestion(cell: SpiralogicCell): string {
  const phaseKey = getPhaseKey(cell.element, cell.phase);
  const questions = CANONICAL_QUESTIONS[phaseKey];

  if (!questions || questions.length === 0) {
    return `I sense you're in a ${cell.element} ${cell.phase} phase. What feels most alive for you right now?`;
  }

  // Simple selection - could be randomized or based on user history
  return questions[0];
}

export function createSpiralogicCell(
  element: Element,
  phase: Phase,
  context: string,
  confidence: number = 0.8
): SpiralogicCell {
  return {
    element,
    phase,
    arc: getArc(element),
    quality: getElementQuality(phase),
    context,
    confidence
  };
}

export function createFieldEvent(
  userId: string,
  rawInput: string,
  spiralogic: SpiralogicCell,
  source: FieldEvent['source'] = 'text'
): FieldEvent {
  return {
    id: uuidv4(),
    userId,
    timestamp: new Date().toISOString(),
    source,
    rawInput,
    normalizedInput: rawInput.trim(),
    spiralogic
  };
}

// ====================================================================
// SPIRALOGIC INTELLIGENCE DETECTION
// ====================================================================

/**
 * Detect the most likely Spiralogic cell for a given input
 * TODO: Implement with LLM classification or keyword heuristics
 */
export async function inferSpiralogicCell(
  input: string,
  userId: string,
  context?: string
): Promise<SpiralogicCell> {
  // Simplified implementation - in production this would use LLM classification
  // or sophisticated NLP pattern matching

  const normalizedInput = input.toLowerCase();

  // Basic keyword-based detection (replace with LLM in production)
  let element: Element = "Fire";
  let phase: Phase = 1;
  let detectedContext = context || "general";

  // Fire element keywords
  if (normalizedInput.includes("start") || normalizedInput.includes("begin") ||
      normalizedInput.includes("motivation") || normalizedInput.includes("energy")) {
    element = "Fire";
    phase = normalizedInput.includes("resistance") || normalizedInput.includes("struggle") ? 2 : 1;
  }

  // Water element keywords
  if (normalizedInput.includes("feel") || normalizedInput.includes("emotion") ||
      normalizedInput.includes("overwhelm") || normalizedInput.includes("process")) {
    element = "Water";
    phase = normalizedInput.includes("conflict") || normalizedInput.includes("shadow") ? 2 : 1;
  }

  // Earth element keywords
  if (normalizedInput.includes("structure") || normalizedInput.includes("plan") ||
      normalizedInput.includes("practice") || normalizedInput.includes("habit")) {
    element = "Earth";
    phase = normalizedInput.includes("building") || normalizedInput.includes("routine") ? 2 : 1;
  }

  // Air element keywords
  if (normalizedInput.includes("understand") || normalizedInput.includes("clarity") ||
      normalizedInput.includes("explain") || normalizedInput.includes("share")) {
    element = "Air";
    phase = normalizedInput.includes("teaching") || normalizedInput.includes("pattern") ? 2 : 1;
  }

  // Context detection
  if (normalizedInput.includes("parent") || normalizedInput.includes("child")) {
    detectedContext = "parenting";
  } else if (normalizedInput.includes("relationship") || normalizedInput.includes("partner")) {
    detectedContext = "relationship";
  } else if (normalizedInput.includes("work") || normalizedInput.includes("career")) {
    detectedContext = "career";
  }

  return createSpiralogicCell(element, phase, detectedContext, 0.7);
}

// ====================================================================
// MAIA FACET-SPECIFIC RESPONSE TEMPLATES BY AWARENESS LEVEL
// ====================================================================

export interface MaiaResponseTemplate {
  facetId: string;
  awarenessLevel: AwarenessLevel;
  responsePhases: {
    recognition: string;          // How MAIA acknowledges what's happening
    guidance: string;             // Core guidance for this facet/level
    question: string;             // Follow-up question
    disposablePixelSuggestion?: string;  // Optional UI action suggestion
  };
  languageStyle: {
    tone: 'gentle' | 'direct' | 'collaborative' | 'archetypal';
    terminology: 'everyday' | 'psychological' | 'mystical' | 'shamanic';
    depth: 'surface' | 'moderate' | 'deep' | 'profound';
  };
}

// Fire-1: The Call / Spark of Destiny (Cardinal Fire) - L1 through L4
export const FIRE_1_RESPONSE_TEMPLATES: MaiaResponseTemplate[] = [
  {
    // L1 - Newcomer: "I feel drawn to something but don't know what"
    facetId: "Fire-1",
    awarenessLevel: 1,
    responsePhases: {
      recognition: "I can sense there's something calling to you - maybe a feeling, an idea, or a direction that feels important even if it's not clear yet.",
      guidance: "Sometimes the first step is just noticing what gets your attention repeatedly. What makes you feel more alive? What are you curious about?",
      question: "Is there anything that keeps coming back to your mind, even if it seems small or impractical?",
      disposablePixelSuggestion: "Track Your Sparks - Notice what energizes you this week"
    },
    languageStyle: {
      tone: 'gentle',
      terminology: 'everyday',
      depth: 'surface'
    }
  },
  {
    // L2 - Practitioner: "I'm feeling the pull but resistance too"
    facetId: "Fire-1",
    awarenessLevel: 2,
    responsePhases: {
      recognition: "You're in that space where something is calling but part of you is also pulling back. This tension between desire and resistance is classic Fire-1 territory.",
      guidance: "The Call often comes with its own resistance - fear of change, practical concerns, or parts of you that want to stay safe. Both the calling and the resistance have important information.",
      question: "What would it look like to honor both the pull toward something new AND the wisdom of your hesitation?",
      disposablePixelSuggestion: "Dialogue with Resistance - What are your hesitations trying to protect?"
    },
    languageStyle: {
      tone: 'direct',
      terminology: 'psychological',
      depth: 'moderate'
    }
  },
  {
    // L3 - Adept: "I recognize this as archetypal fire calling me forward"
    facetId: "Fire-1",
    awarenessLevel: 3,
    responsePhases: {
      recognition: "You're standing at the threshold of Cardinal Fire - that first sacred ignition where soul breaks through the familiar patterns of personality. This is Promethean territory.",
      guidance: "The Call in Fire-1 is never just about doing something new; it's about becoming someone new. Your psyche is reorganizing around a deeper center of authority. Honor both the terror and the exhilaration.",
      question: "What wants to be born through you that couldn't exist through your previous identity?",
      disposablePixelSuggestion: "Name the Call - Write the exact words this calling speaks to you"
    },
    languageStyle: {
      tone: 'archetypal',
      terminology: 'mystical',
      depth: 'deep'
    }
  },
  {
    // L4 - Steward: Full collaboration with the pattern
    facetId: "Fire-1",
    awarenessLevel: 4,
    responsePhases: {
      recognition: "Fire-1 Cardinal: The primordial spark breaking through the ouroboric containment of the previous cycle. The Self is constellating a new center of gravity.",
      guidance: "In your case, we're witnessing the emergence of what Jung would call a 'creative illness' - the necessary dissolution of ego structure that precedes authentic individuation. This isn't personal reformation; it's ontological transformation.",
      question: "How is this Call asking you to become a conduit for transpersonal creative force rather than managing personal will?",
      disposablePixelSuggestion: "Archetypal Mapping - Track the mythic pattern underlying your emergence"
    },
    languageStyle: {
      tone: 'collaborative',
      terminology: 'shamanic',
      depth: 'profound'
    }
  }
];

// Water-2: Underworld / Shadow Gauntlet (Fixed Water) - L1 through L4
export const WATER_2_RESPONSE_TEMPLATES: MaiaResponseTemplate[] = [
  {
    // L1 - Newcomer: "I'm going through something really hard"
    facetId: "Water-2",
    awarenessLevel: 1,
    responsePhases: {
      recognition: "It sounds like you're in a really challenging time. Sometimes life puts us in situations that feel overwhelming or bring up difficult feelings.",
      guidance: "When we're going through hard things, it can help to remember that difficult periods often teach us something important about ourselves, even when we can't see it yet.",
      question: "What kind of support feels most helpful to you right now? Is it someone to listen, practical help, or just space to feel what you're feeling?",
      disposablePixelSuggestion: "Find Your Anchors - What helps you feel grounded when things are hard?"
    },
    languageStyle: {
      tone: 'gentle',
      terminology: 'everyday',
      depth: 'surface'
    }
  },
  {
    // L2 - Practitioner: "I think I'm in some kind of shadow work"
    facetId: "Water-2",
    awarenessLevel: 2,
    responsePhases: {
      recognition: "Yes, this feels like Water-2 territory - the place where unconscious material is surfacing and demanding to be met. You're in the thick of what depth psychology calls 'the descent.'",
      guidance: "In Fixed Water, we're not just processing emotions; we're meeting the parts of ourselves we've been avoiding or didn't know existed. This phase requires both fierce honesty and deep self-compassion.",
      question: "What patterns or reactions are you noticing in yourself that surprise you or feel unfamiliar?",
      disposablePixelSuggestion: "Shadow Dialogue - Write a conversation with the part of you that's been hidden"
    },
    languageStyle: {
      tone: 'direct',
      terminology: 'psychological',
      depth: 'moderate'
    }
  },
  {
    // L3 - Adept: "I'm in the belly of the whale"
    facetId: "Water-2",
    awarenessLevel: 3,
    responsePhases: {
      recognition: "You're in the belly of the whale, the nigredo, the necessary descent into the underworld where the old self dissolves. This is Water-2 at its most archetypal - Inanna's descent, Persephone's abduction.",
      guidance: "Fixed Water is the crucible where shadow integration happens not through understanding but through being metabolized by the unconscious forces you've spent your life avoiding. You can't think your way out; you have to be composted.",
      question: "What is dying in you that needs to die? What is the gift your shadow holds hostage until you're willing to meet it fully?",
      disposablePixelSuggestion: "Underworld Mapping - Track the dying/rebirth process week by week"
    },
    languageStyle: {
      tone: 'archetypal',
      terminology: 'mystical',
      depth: 'deep'
    }
  },
  {
    // L4 - Steward: Full alchemical collaboration
    facetId: "Water-2",
    awarenessLevel: 4,
    responsePhases: {
      recognition: "Water-2 Fixed: You're in the alchemical solutio where the prima materia of personality dissolves in the menstruum of unconscious archetypal forces. This is active nigredo - not passive suffering but conscious participation in psychic death-rebirth.",
      guidance: "Your ego structure is being metabolized by chthonic forces that operate outside personal will. This phase requires what Clarissa Pinkola Estés calls 'diving for the pearl' - staying conscious while allowing unconscious transformation. You are both subject and alchemist.",
      question: "How are you learning to differentiate between destructive flooding and transformative dissolution? What does conscious suffering look like in your particular descent?",
      disposablePixelSuggestion: "Alchemical Tracking - Monitor nigredo/albedo transitions in real time"
    },
    languageStyle: {
      tone: 'collaborative',
      terminology: 'shamanic',
      depth: 'profound'
    }
  }
];

// Air-1: First Telling / Honest Dialogue (Cardinal Air) - Sample for comparison
export const AIR_1_RESPONSE_TEMPLATES: MaiaResponseTemplate[] = [
  {
    // L1 - Newcomer: "I need to have a difficult conversation"
    facetId: "Air-1",
    awarenessLevel: 1,
    responsePhases: {
      recognition: "It sounds like there's something important you need to say or discuss with someone, and maybe you're feeling uncertain about how to approach it.",
      guidance: "Sometimes the most important conversations start with being honest about our own feelings first. What matters most - being heard, understanding the other person, or finding a solution together?",
      question: "What would make this conversation feel successful to you? What do you hope might change if you're able to speak honestly?",
      disposablePixelSuggestion: "Practice Your Truth - Write out what you really want to say"
    },
    languageStyle: {
      tone: 'gentle',
      terminology: 'everyday',
      depth: 'surface'
    }
  },
  {
    // L2 - Practitioner: More sophisticated awareness
    facetId: "Air-1",
    awarenessLevel: 2,
    responsePhases: {
      recognition: "You're standing at the Air-1 threshold where authentic communication wants to emerge. This is about finding the courage to speak truth rather than managing other people's reactions.",
      guidance: "Cardinal Air asks us to prioritize clarity over harmony, truth over safety. This doesn't mean being harsh, but it does mean saying what needs to be said even when it's uncomfortable.",
      question: "What are you trying to protect by not speaking directly? What might become possible if you chose truth over control?",
      disposablePixelSuggestion: "Truth vs. Diplomacy - Notice where you edit yourself in conversations"
    },
    languageStyle: {
      tone: 'direct',
      terminology: 'psychological',
      depth: 'moderate'
    }
  }
];

// Earth-3: Embodied Form / Stewardship (Mutable Earth) - Sample for completion
export const EARTH_3_RESPONSE_TEMPLATES: MaiaResponseTemplate[] = [
  {
    // L1 - Newcomer: "I built something but now I'm not sure about it"
    facetId: "Earth-3",
    awarenessLevel: 1,
    responsePhases: {
      recognition: "It sounds like you've put a lot of work into creating something - maybe a project, a routine, or a way of living - and now you're questioning whether it's still right for you.",
      guidance: "This is actually a sign of growth! When we outgrow something we created, it means we're changing. The question isn't whether it was wrong, but whether it still serves who you're becoming.",
      question: "If you think of what you built as serving a purpose in your life, how has that purpose changed? What do you need now that's different from what you needed when you started?",
      disposablePixelSuggestion: "Evaluate & Adjust - What parts serve you and what parts feel outdated?"
    },
    languageStyle: {
      tone: 'gentle',
      terminology: 'everyday',
      depth: 'surface'
    }
  },
  {
    // L3 - Adept: Archetypal understanding
    facetId: "Earth-3",
    awarenessLevel: 3,
    responsePhases: {
      recognition: "You're in Earth-3 territory - the space where established form meets the need for conscious evolution. This is the wise gardener who knows when to prune, when to transplant, and when to let something complete its natural cycle.",
      guidance: "Mutable Earth teaches us that true stewardship sometimes means allowing our creations to die or transform beyond our original vision. The form was never the point; the form was always serving the life force.",
      question: "How is this structure asking to evolve? What wants to be composted so something new can emerge?",
      disposablePixelSuggestion: "Tend, Transform, or Release - Dialogue with your creation about its next phase"
    },
    languageStyle: {
      tone: 'archetypal',
      terminology: 'mystical',
      depth: 'deep'
    }
  }
];

// Utility function to get appropriate response template
export function getMaiaResponseTemplate(
  facetId: string,
  awarenessLevel: AwarenessLevel
): MaiaResponseTemplate | null {
  // Main template registries
  const allTemplates = [
    ...FIRE_1_RESPONSE_TEMPLATES,
    ...WATER_2_RESPONSE_TEMPLATES,
    ...AIR_1_RESPONSE_TEMPLATES,
    ...EARTH_3_RESPONSE_TEMPLATES
  ];

  return allTemplates.find(
    template => template.facetId === facetId && template.awarenessLevel === awarenessLevel
  ) || null;
}

// Generate MAIA response using facet and awareness level
export function generateMaiaResponse(
  facetId: string,
  awarenessLevel: AwarenessLevel,
  userInput: string
): string {
  const template = getMaiaResponseTemplate(facetId, awarenessLevel);

  if (!template) {
    return `I sense you're in ${facetId} territory. What feels most alive for you right now?`;
  }

  const { recognition, guidance, question } = template.responsePhases;

  return `${recognition}\n\n${guidance}\n\n${question}`;
}

// ====================================================================
// FACET-SPECIFIC MINI-FLOWS
// ====================================================================

export interface FacetMiniFlow {
  facetId: string;
  flowName: string;
  description: string;
  steps: {
    id: string;
    name: string;
    guidance: string;
    question: string;
    disposablePixels?: string[];
  }[];
}

// Fire-1 Mini-Flow: "Name the Call"
export const FIRE_1_NAME_THE_CALL_FLOW: FacetMiniFlow = {
  facetId: "Fire-1",
  flowName: "Name the Call",
  description: "A guided process to clarify and articulate what's calling you forward",
  steps: [
    {
      id: "notice_energy",
      name: "Notice the Energy",
      guidance: "Before we try to understand what's calling you, let's feel it. Where in your body do you sense aliveness, curiosity, or excitement?",
      question: "What gets your attention repeatedly? What makes you feel more alive?",
      disposablePixels: ["Body Scan for Aliveness", "Track Energy Shifts"]
    },
    {
      id: "name_the_pull",
      name: "Name the Pull",
      guidance: "Now let's put words to what you're sensing. Don't worry about being practical or logical yet.",
      question: "If this calling could speak directly to you, what would it say? Complete this sentence: 'I am calling you to...'",
      disposablePixels: ["Write the Call's Voice", "Draw the Vision"]
    },
    {
      id: "meet_resistance",
      name: "Meet the Resistance",
      guidance: "Every authentic calling comes with resistance. This isn't a problem to solve; it's information to gather.",
      question: "What parts of you are hesitant or afraid? What are they trying to protect?",
      disposablePixels: ["Dialogue with Fear", "Honor the Protectors"]
    },
    {
      id: "find_first_step",
      name: "Find the First Step",
      guidance: "You don't need to see the whole path. You just need to see the next small step that honors both the calling and the wisdom of your resistance.",
      question: "What's one small action that would honor this calling without overwhelming your protective parts?",
      disposablePixels: ["Micro-Commitment", "Test the Waters"]
    }
  ]
};

// Water-2 Mini-Flow: "Shadow Descent Companion"
export const WATER_2_SHADOW_DESCENT_FLOW: FacetMiniFlow = {
  facetId: "Water-2",
  flowName: "Shadow Descent Companion",
  description: "A guided process for navigating intense emotional/psychological dissolution",
  steps: [
    {
      id: "acknowledge_descent",
      name: "Acknowledge the Descent",
      guidance: "You're in sacred and difficult territory. This phase requires both courage and self-compassion.",
      question: "What's dissolving in your life right now? What feels like it's dying or being taken away?",
      disposablePixels: ["Map the Dissolution", "Honor What's Dying"]
    },
    {
      id: "tend_the_breakdown",
      name: "Tend the Breakdown",
      guidance: "Instead of trying to fix or escape what's happening, let's learn how to be present with breakdown as a sacred process.",
      question: "How can you care for yourself while allowing this process to unfold? What support do you need?",
      disposablePixels: ["Create Safety Anchors", "Build Support Network"]
    },
    {
      id: "dialogue_shadow",
      name: "Dialogue with Shadow",
      guidance: "What's emerging from the unconscious often contains exactly what you need for your next phase of growth.",
      question: "What aspects of yourself are you meeting that you didn't know were there? What is your shadow trying to teach you?",
      disposablePixels: ["Shadow Conversation", "Hidden Gifts Inventory"]
    },
    {
      id: "track_rebirth",
      name: "Track the Rebirth",
      guidance: "New life is often invisible at first. Let's learn to recognize the signs of what's being born.",
      question: "What new capacities or perspectives are emerging? How are you different than when this process started?",
      disposablePixels: ["Rebirth Indicators", "New Self Emergence"]
    }
  ]
};

// Utility function to get facet mini-flow
export function getFacetMiniFlow(facetId: string, flowName: string): FacetMiniFlow | null {
  const flows = [FIRE_1_NAME_THE_CALL_FLOW, WATER_2_SHADOW_DESCENT_FLOW];
  return flows.find(flow => flow.facetId === facetId && flow.flowName === flowName) || null;
}

// ====================================================================
// SPIRALOGIC CORE CLASS
// ====================================================================

export class SpiralogicCore {
  constructor() {
    // Initialize spiralogic core system
  }

  async getAllActiveSpirals(userId: string): Promise<any[]> {
    // Return empty array for mobile build compatibility
    return [];
  }

  async getElementalProfile(userId: string): Promise<any> {
    // Return basic profile for mobile build compatibility
    return {
      primaryElement: 'Aether',
      phase: 1,
      facets: []
    };
  }

  async processSpiralogicUpdate(data: any): Promise<any> {
    // Process spiralogic updates
    return { success: true, data };
  }
}

// ====================================================================
// EXPORTS
// ====================================================================

// FRAMEWORK_REGISTRY is already exported above on line 172