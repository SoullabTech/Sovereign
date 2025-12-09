/**
 * Facet Content Layer - Where Elemental Alchemy Lives Inside MAIA
 * Rich content system for the 12-Phase Spiralogic spine
 * This is where your book content plugs into the canonical facet structure
 */

import { FacetCode, SpiralogicFacet } from './spiralogicFacets';

// ====================================================================
// CONTENT LAYER ARCHITECTURE
// ====================================================================

export interface FacetPractice {
  id: string;
  name: string;
  description: string;
  timeEstimate: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  instructions: string[];
  embodimentCues: string[];
  integrationQuestions: string[];
}

export interface FacetSymbolSet {
  primarySymbol: string;
  secondarySymbols: string[];
  archetypes: string[];
  colors: string[];
  elements: string[];
  bodyAreas: string[];
}

export interface FacetDivinationKeys {
  tarotCards: string[];
  crystals: string[];
  herbs: string[];
  seasons: string[];
  timeOfDay: string[];
  bodyWisdom: string[];
}

export interface FacetMiniFlow {
  id: string;
  name: string;
  description: string;
  triggerConditions: string[];
  steps: Array<{
    id: string;
    prompt: string;
    userAction: 'text_input' | 'reflection' | 'choice' | 'embodiment';
    guidance: string;
    nextStep?: string;
  }>;
  completion: {
    insight: string;
    integration: string;
    nextFacet?: FacetCode;
  };
}

export interface FacetContent {
  facet: FacetCode;
  // Core wisdom from Elemental Alchemy
  bookWisdom: {
    overview: string;
    keyPassages: string[];
    practices: FacetPractice[];
  };

  // Symbolic & archetypal layer
  symbols: FacetSymbolSet;
  divination: FacetDivinationKeys;

  // Interactive MAIA flows
  miniFlows: FacetMiniFlow[];

  // Integration with other facets
  connections: {
    natural_progression: FacetCode[];
    shadow_support: FacetCode[];
    amplifying_combinations: FacetCode[];
  };
}

// ====================================================================
// F1: FIRE 1 - THE CALL / SPARK OF DESTINY
// ====================================================================

const F1_NAME_THE_CALL_FLOW: FacetMiniFlow = {
  id: 'f1_name_the_call',
  name: 'Name the Call',
  description: 'A gentle process to honor and articulate what\'s wanting to emerge, with scale-aware guidance',
  triggerConditions: [
    'User mentions feeling restless or called to something',
    'Mentions "something wants to happen" but can\'t name it',
    'Expresses creative or vocational uncertainty',
    'Feels stuck in routine but senses possibility'
  ],
  steps: [
    {
      id: 'f1_step1',
      prompt: 'Take a breath and feel into your body right now. What sensation or energy do you notice when I ask: "What wants to emerge in your life?" Don\'t think - just feel and describe.',
      userAction: 'text_input',
      guidance: 'Honor whatever comes up - sensation, image, word, feeling. No judgment.',
      nextStep: 'f1_step2'
    },
    {
      id: 'f1_step2',
      prompt: 'Now, if that feeling or knowing had a voice, what would it whisper to you? Complete this sentence: "What I really want is..."',
      userAction: 'text_input',
      guidance: 'Let it be imperfect, unclear, or even contradictory. The call rarely arrives fully formed.',
      nextStep: 'f1_step3'
    },
    {
      id: 'f1_step3_scale',
      prompt: 'Looking at what\'s calling you, does it feel more like:\n\n🎯 **Something specific** to explore or learn (like a class, project, or trip)\n📖 **A path** you want to walk for a while (like a career shift or long study)\n🌌 **A way of being** that wants to live through you (how you want to show up in the world)\n\nWhat feels right?',
      userAction: 'choice',
      guidance: 'They\'re all real and valuable - just different sizes of the same beautiful impulse.',
      nextStep: 'f1_step4_kind'
    },
    {
      id: 'f1_step4_kind',
      prompt: 'What does this calling feel like it\'s about?\n\n📚 Learning something new • 🤝 Helping others • 🌍 Where you live\n💕 Relationships • 🧘 Daily practice • 🌱 How you live your life\n🎨 Making something • 👥 Community • 🌿 Healing • ✨ Spiritual journey\n\nWhat feels closest? (Or just say what comes up for you)',
      userAction: 'choice',
      guidance: 'There\'s no wrong answer - just helps me understand what\'s moving in you.',
      nextStep: 'f1_step5_action'
    },
    {
      id: 'f1_step5_action',
      prompt: 'What\'s one small step you could take this week to honor what\'s calling you? Something that fits the size of this - not overwhelming, just a way to say yes.',
      userAction: 'text_input',
      guidance: 'If it\'s something specific: maybe set up one conversation or do one search. If it\'s a longer path: sketch some possibilities. If it\'s about how you want to live: try one tiny new practice.',
      nextStep: 'f1_step6_resistance'
    },
    {
      id: 'f1_step6_resistance',
      prompt: 'What might try to talk you out of this? What\'s the voice inside that says it\'s not practical, not the right time, not realistic?',
      userAction: 'text_input',
      guidance: 'Sometimes just naming that voice takes some of its power away. It\'s trying to protect you, but it might also be keeping you from something good.',
      nextStep: 'f1_step7_connection'
    },
    {
      id: 'f1_step7_connection',
      prompt: 'Does this feel connected to other things you\'re already exploring in your life? Or does it feel like something completely new?',
      userAction: 'choice',
      guidance: 'Just helps me understand if this is part of something bigger you\'re already growing, or a fresh seed.',
      nextStep: 'f1_completion'
    }
  ],
  completion: {
    insight: 'You\'ve named something real that wants to live through you. It doesn\'t need you to be perfect - just to pay attention and take one small step that feels right.',
    integration: 'This calling now has a place in your life. I\'ll help you notice when it speaks again, and how to trust what feels true for you.',
    nextFacet: 'F2' // Natural progression to Trial/Action
  }
};

const F1_CONTENT: FacetContent = {
  facet: 'F1',
  bookWisdom: {
    overview: 'Fire 1 teaches us to recognize and honor the daimonic spark - the mysterious force that calls us toward our destiny. This is about learning to distinguish authentic calling from ego fantasy or social expectation.',
    keyPassages: [
      'The call arrives as a whisper before it becomes a roar. Most people miss it because they\'re waiting for certainty.',
      'Your soul speaks in sensation before it speaks in words. The body knows before the mind can justify.',
      'Every authentic call carries both promise and terror. If it doesn\'t scare you a little, it\'s probably not big enough.'
    ],
    practices: [
      {
        id: 'f1_practice_daily_call',
        name: 'Daily Call Check-In',
        description: 'A 3-minute morning practice to attune to authentic calling',
        timeEstimate: '3 minutes',
        difficulty: 'beginner',
        instructions: [
          'Place your hand on your heart',
          'Ask: "What wants to emerge through me today?"',
          'Feel for the answer in your body, not your mind',
          'Name one small way you could honor it',
          'Take that step before noon'
        ],
        embodimentCues: [
          'Notice warmth, expansion, or tingling when something true arises',
          'Feel for contraction or deadness with false paths',
          'Trust the body\'s wisdom over mental analysis'
        ],
        integrationQuestions: [
          'How does authentic calling feel different from external pressure?',
          'What patterns do you notice in how your soul communicates?',
          'When do you most easily hear the call versus when is it hardest to access?'
        ]
      }
    ]
  },
  symbols: {
    primarySymbol: '🔥',
    secondarySymbols: ['✨', '🌋', '⚡', '🎯'],
    archetypes: ['The Fool', 'The Explorer', 'The Visionary', 'The Seeker'],
    colors: ['bright red', 'gold', 'orange', 'white flame'],
    elements: ['lightning', 'sunrise', 'meteor', 'spark'],
    bodyAreas: ['heart center', 'solar plexus', 'hands', 'spine']
  },
  divination: {
    tarotCards: ['The Fool', 'Ace of Wands', 'Knight of Wands'],
    crystals: ['carnelian', 'sunstone', 'fire opal', 'citrine'],
    herbs: ['cinnamon', 'ginger', 'rosemary', 'dragon\'s blood'],
    seasons: ['spring equinox', 'summer solstice'],
    timeOfDay: ['dawn', 'sunrise', 'high noon'],
    bodyWisdom: ['heart palpitations when truth arises', 'sudden energy surges', 'feeling of expansion in chest']
  },
  miniFlows: [F1_NAME_THE_CALL_FLOW],
  connections: {
    natural_progression: ['F2', 'F3'],
    shadow_support: ['W1', 'W2'],
    amplifying_combinations: ['A1', 'E1']
  }
};

// ====================================================================
// W2: WATER 2 - UNDERWORLD / SHADOW GAUNTLET
// ====================================================================

const W2_SHADOW_DESCENT_FLOW: FacetMiniFlow = {
  id: 'w2_shadow_descent_companion',
  name: 'Shadow Descent Companion',
  description: 'A gentle companion for when difficult feelings and old patterns are stirring up',
  triggerConditions: [
    'User mentions shame, guilt, or feeling "triggered"',
    'Describes repeating painful patterns',
    'Expresses feeling overwhelmed by emotions',
    'Mentions family or childhood wounds surfacing'
  ],
  steps: [
    {
      id: 'w2_step1',
      prompt: 'Let\'s start by finding your feet. Can you name three things you can see right now, two things you can hear, and one thing you can touch? \n\nYou\'re safe in this moment, and whatever you\'re feeling - however big it feels - it will move through.',
      userAction: 'text_input',
      guidance: 'When things feel overwhelming, we start with what\'s real and present. Solid ground first.',
      nextStep: 'w2_step2'
    },
    {
      id: 'w2_step2',
      prompt: 'What\'s the story this pain is telling you about who you are? Can you finish this sentence: "This feeling means I am..." \n\nJust be honest about what the hurt part of you is saying.',
      userAction: 'text_input',
      guidance: 'We\'re not buying into the story, just listening to it clearly. Old hurts tend to speak in big, harsh statements.',
      nextStep: 'w2_step3'
    },
    {
      id: 'w2_step3',
      prompt: 'If you could sit with the younger you who first learned this painful story, what would you want to say to them? How old do you imagine they were? What did they need that they didn\'t get?',
      userAction: 'text_input',
      guidance: 'This isn\'t about blame. It\'s about seeing how these protective stories made sense at the time.',
      nextStep: 'w2_step4'
    },
    {
      id: 'w2_step4',
      prompt: 'What does this difficult feeling know that your "everything\'s fine" self doesn\'t? What truth might it be trying to protect or point you toward? \n\nSometimes our pain carries important information.',
      userAction: 'text_input',
      guidance: 'There\'s often real wisdom hiding in our struggles - about boundaries, what we need, or what isn\'t working.',
      nextStep: 'w2_step5'
    },
    {
      id: 'w2_step5',
      prompt: 'As you come up from this deeper place, what feels most important to take with you? Maybe it\'s an insight, a boundary you need to set, or a way to be kinder to yourself?',
      userAction: 'text_input',
      guidance: 'The goal isn\'t to make the pain disappear, but to change how you relate to it. You get to keep what serves you.',
      nextStep: 'w2_completion'
    }
  ],
  completion: {
    insight: 'Your pain isn\'t just hurt - it also holds wisdom. You\'ve looked at something difficult and come back with something valuable.',
    integration: 'This kind of inner work happens in spirals, not straight lines. If these feelings come up again, that\'s normal. Each time you can go a little deeper into understanding yourself.',
    nextFacet: 'W3' // Natural progression to Inner Gold/Integration
  }
};

const W2_CONTENT: FacetContent = {
  facet: 'W2',
  bookWisdom: {
    overview: 'Water 2 guides us through the necessary descent into our shadow material - the unconscious patterns, wounds, and defensive strategies that run our lives. This is trauma-informed inner work that honors both wound and healing.',
    keyPassages: [
      'The shadow doesn\'t want to hurt you - it wants to protect you. Every defense mechanism was once a brilliant survival strategy.',
      'Spiritual bypassing tries to love-and-light our way past the shadow. Real transformation requires befriending the darkness.',
      'Your wounds carry both poison and medicine. The art is learning to extract the gold while leaving the toxicity behind.'
    ],
    practices: [
      {
        id: 'w2_practice_shadow_dialogue',
        name: 'Shadow Dialogue Practice',
        description: 'A written conversation with your inner critic or defensive patterns',
        timeEstimate: '15-20 minutes',
        difficulty: 'intermediate',
        instructions: [
          'Write out the harsh story your inner critic tells about you',
          'Ask it: "When did you first learn to say these things?"',
          'Ask: "What are you trying to protect me from?"',
          'Thank it for trying to keep you safe',
          'Offer it a new job: being your wise inner discernment rather than harsh judge'
        ],
        embodimentCues: [
          'Notice where criticism lives in your body - often throat, chest, or stomach',
          'Feel for the younger self beneath the harsh voice',
          'Breathe compassion into the spaces where judgment contracts'
        ],
        integrationQuestions: [
          'How does your shadow serve your authentic development?',
          'What boundaries become clearer when you honor your defensive responses?',
          'How can you transform self-attack into self-protection?'
        ]
      }
    ]
  },
  symbols: {
    primarySymbol: '🌊',
    secondarySymbols: ['🕳️', '🖤', '🌑', '⚡'],
    archetypes: ['The Shadow', 'The Wounded Healer', 'Persephone', 'The Dark Mother'],
    colors: ['deep blue', 'black', 'silver', 'indigo'],
    elements: ['underground river', 'ocean depths', 'storm clouds', 'winter'],
    bodyAreas: ['belly', 'lower back', 'throat', 'womb space']
  },
  divination: {
    tarotCards: ['The Devil', 'Five of Cups', 'Nine of Swords', 'The Moon'],
    crystals: ['obsidian', 'black tourmaline', 'smoky quartz', 'hematite'],
    herbs: ['mugwort', 'wormwood', 'yew', 'cypress'],
    seasons: ['dark moon', 'winter solstice', 'autumn'],
    timeOfDay: ['midnight', '3am', 'dusk'],
    bodyWisdom: ['tightness in chest or throat', 'feeling of sinking', 'cold or numb sensations']
  },
  miniFlows: [W2_SHADOW_DESCENT_FLOW],
  connections: {
    natural_progression: ['W3'],
    shadow_support: ['F2', 'E2'],
    amplifying_combinations: ['A2', 'F3']
  }
};

// ====================================================================
// CONTENT REGISTRY
// ====================================================================

export const FACET_CONTENT: Record<FacetCode, FacetContent> = {
  // FIRE CONTENT
  F1: F1_CONTENT,
  F2: {
    facet: 'F2',
    bookWisdom: {
      overview: 'Fire 2 content stub - The Trial/Gauntlet of Action',
      keyPassages: ['Content to be added from Elemental Alchemy'],
      practices: []
    },
    symbols: {
      primarySymbol: '⚡',
      secondarySymbols: [],
      archetypes: [],
      colors: [],
      elements: [],
      bodyAreas: []
    },
    divination: {
      tarotCards: [],
      crystals: [],
      herbs: [],
      seasons: [],
      timeOfDay: [],
      bodyWisdom: []
    },
    miniFlows: [],
    connections: {
      natural_progression: ['F3'],
      shadow_support: ['W2'],
      amplifying_combinations: ['E2']
    }
  },
  F3: {
    facet: 'F3',
    bookWisdom: {
      overview: 'Fire 3 content stub - Lived Fire/Identity Shift',
      keyPassages: ['Content to be added from Elemental Alchemy'],
      practices: []
    },
    symbols: {
      primarySymbol: '🔥',
      secondarySymbols: [],
      archetypes: [],
      colors: [],
      elements: [],
      bodyAreas: []
    },
    divination: {
      tarotCards: [],
      crystals: [],
      herbs: [],
      seasons: [],
      timeOfDay: [],
      bodyWisdom: []
    },
    miniFlows: [],
    connections: {
      natural_progression: ['W1'],
      shadow_support: ['W3'],
      amplifying_combinations: ['A3']
    }
  },

  // WATER CONTENT
  W1: {
    facet: 'W1',
    bookWisdom: {
      overview: 'Water 1 content stub - Opening of the Deep/Vulnerability',
      keyPassages: ['Content to be added from Elemental Alchemy'],
      practices: []
    },
    symbols: {
      primarySymbol: '💧',
      secondarySymbols: [],
      archetypes: [],
      colors: [],
      elements: [],
      bodyAreas: []
    },
    divination: {
      tarotCards: [],
      crystals: [],
      herbs: [],
      seasons: [],
      timeOfDay: [],
      bodyWisdom: []
    },
    miniFlows: [],
    connections: {
      natural_progression: ['W2'],
      shadow_support: ['F1'],
      amplifying_combinations: ['E1']
    }
  },
  W2: W2_CONTENT,
  W3: {
    facet: 'W3',
    bookWisdom: {
      overview: 'Water 3 content stub - Inner Gold/Emotional Integration',
      keyPassages: ['Content to be added from Elemental Alchemy'],
      practices: []
    },
    symbols: {
      primarySymbol: '💎',
      secondarySymbols: [],
      archetypes: [],
      colors: [],
      elements: [],
      bodyAreas: []
    },
    divination: {
      tarotCards: [],
      crystals: [],
      herbs: [],
      seasons: [],
      timeOfDay: [],
      bodyWisdom: []
    },
    miniFlows: [],
    connections: {
      natural_progression: ['E1'],
      shadow_support: ['F3'],
      amplifying_combinations: ['A3']
    }
  },

  // EARTH CONTENT
  E1: {
    facet: 'E1',
    bookWisdom: {
      overview: 'Earth 1 content stub - Design of Form/Seed Pattern',
      keyPassages: ['Content to be added from Elemental Alchemy'],
      practices: []
    },
    symbols: {
      primarySymbol: '🌱',
      secondarySymbols: [],
      archetypes: [],
      colors: [],
      elements: [],
      bodyAreas: []
    },
    divination: {
      tarotCards: [],
      crystals: [],
      herbs: [],
      seasons: [],
      timeOfDay: [],
      bodyWisdom: []
    },
    miniFlows: [],
    connections: {
      natural_progression: ['E2'],
      shadow_support: ['W1'],
      amplifying_combinations: ['F1']
    }
  },
  E2: {
    facet: 'E2',
    bookWisdom: {
      overview: 'Earth 2 content stub - Germination/Practice & Resourcing',
      keyPassages: ['Content to be added from Elemental Alchemy'],
      practices: []
    },
    symbols: {
      primarySymbol: '🌿',
      secondarySymbols: [],
      archetypes: [],
      colors: [],
      elements: [],
      bodyAreas: []
    },
    divination: {
      tarotCards: [],
      crystals: [],
      herbs: [],
      seasons: [],
      timeOfDay: [],
      bodyWisdom: []
    },
    miniFlows: [],
    connections: {
      natural_progression: ['E3'],
      shadow_support: ['W2'],
      amplifying_combinations: ['F2']
    }
  },
  E3: {
    facet: 'E3',
    bookWisdom: {
      overview: 'Earth 3 content stub - Embodied Form/Stewardship',
      keyPassages: ['Content to be added from Elemental Alchemy'],
      practices: []
    },
    symbols: {
      primarySymbol: '🌳',
      secondarySymbols: [],
      archetypes: [],
      colors: [],
      elements: [],
      bodyAreas: []
    },
    divination: {
      tarotCards: [],
      crystals: [],
      herbs: [],
      seasons: [],
      timeOfDay: [],
      bodyWisdom: []
    },
    miniFlows: [],
    connections: {
      natural_progression: ['A1'],
      shadow_support: ['W3'],
      amplifying_combinations: ['F3']
    }
  },

  // AIR CONTENT
  A1: {
    facet: 'A1',
    bookWisdom: {
      overview: 'Air 1 content stub - First Telling/Honest Dialogue',
      keyPassages: ['Content to be added from Elemental Alchemy'],
      practices: []
    },
    symbols: {
      primarySymbol: '💨',
      secondarySymbols: [],
      archetypes: [],
      colors: [],
      elements: [],
      bodyAreas: []
    },
    divination: {
      tarotCards: [],
      crystals: [],
      herbs: [],
      seasons: [],
      timeOfDay: [],
      bodyWisdom: []
    },
    miniFlows: [],
    connections: {
      natural_progression: ['A2'],
      shadow_support: ['E1'],
      amplifying_combinations: ['F1']
    }
  },
  A2: {
    facet: 'A2',
    bookWisdom: {
      overview: 'Air 2 content stub - Pattern Speech/Frameworks & Teaching',
      keyPassages: ['Content to be added from Elemental Alchemy'],
      practices: []
    },
    symbols: {
      primarySymbol: '🌪️',
      secondarySymbols: [],
      archetypes: [],
      colors: [],
      elements: [],
      bodyAreas: []
    },
    divination: {
      tarotCards: [],
      crystals: [],
      herbs: [],
      seasons: [],
      timeOfDay: [],
      bodyWisdom: []
    },
    miniFlows: [],
    connections: {
      natural_progression: ['A3'],
      shadow_support: ['E2'],
      amplifying_combinations: ['W2']
    }
  },
  A3: {
    facet: 'A3',
    bookWisdom: {
      overview: 'Air 3 content stub - Mythic Integration/Cultural Seeding',
      keyPassages: ['Content to be added from Elemental Alchemy'],
      practices: []
    },
    symbols: {
      primarySymbol: '🌬️',
      secondarySymbols: [],
      archetypes: [],
      colors: [],
      elements: [],
      bodyAreas: []
    },
    divination: {
      tarotCards: [],
      crystals: [],
      herbs: [],
      seasons: [],
      timeOfDay: [],
      bodyWisdom: []
    },
    miniFlows: [],
    connections: {
      natural_progression: ['F1'],
      shadow_support: ['E3'],
      amplifying_combinations: ['W3']
    }
  }
};

// ====================================================================
// HELPER FUNCTIONS
// ====================================================================

export function getFacetContent(code: FacetCode): FacetContent {
  return FACET_CONTENT[code];
}

export function getFacetMiniFlows(code: FacetCode): FacetMiniFlow[] {
  return FACET_CONTENT[code].miniFlows;
}

export function findMiniFlowByTrigger(userMessage: string): FacetMiniFlow[] {
  const matches: FacetMiniFlow[] = [];

  Object.values(FACET_CONTENT).forEach(content => {
    content.miniFlows.forEach(flow => {
      const triggerMatch = flow.triggerConditions.some(trigger =>
        userMessage.toLowerCase().includes(trigger.toLowerCase().split(' ')[0])
      );
      if (triggerMatch) {
        matches.push(flow);
      }
    });
  });

  return matches;
}

export function getFacetPractices(code: FacetCode): FacetPractice[] {
  return FACET_CONTENT[code].bookWisdom.practices;
}

export function getAllMiniFlows(): FacetMiniFlow[] {
  return Object.values(FACET_CONTENT)
    .flatMap(content => content.miniFlows)
    .filter(flow => flow.steps.length > 0);
}