/**
 * 🌟 Maya Natural Language Response Templates
 *
 * Templates for warm, natural, conversational responses
 * that maintain ethical boundaries while avoiding robotic language.
 */

export interface NaturalResponse {
  category: ResponseCategory;
  context: string;
  robotic: string;
  natural: string[];
  ethicsScore: number;
  naturalnessScore: number;
}

export type ResponseCategory =
  | 'acknowledgment'
  | 'validation'
  | 'curiosity'
  | 'celebration'
  | 'comfort'
  | 'reflection'
  | 'clarification'
  | 'boundary'
  | 'transition'
  | 'closing';

/**
 * Natural response templates organized by category
 */
export const NATURAL_TEMPLATES: Record<ResponseCategory, NaturalResponse[]> = {
  acknowledgment: [
    {
      category: 'acknowledgment',
      context: 'User shares difficult experience',
      robotic: 'I witness your suffering.',
      natural: [
        'That sounds incredibly difficult.',
        'What a heavy thing to carry.',
        'Oh, that must be so hard.',
        'Thank you for trusting me with this.',
        'That really comes through in what you\'re sharing.'
      ],
      ethicsScore: 100,
      naturalnessScore: 95
    },
    {
      category: 'acknowledgment',
      context: 'User expresses emotion',
      robotic: 'I observe your emotional state.',
      natural: [
        'The feeling really comes through.',
        'I can hear how much this means to you.',
        'That emotion is so present in your words.',
        'What you\'re feeling makes complete sense.',
        'The intensity of that really shows.'
      ],
      ethicsScore: 100,
      naturalnessScore: 90
    }
  ],

  validation: [
    {
      category: 'validation',
      context: 'User seeks reassurance',
      robotic: 'Your response is within normal parameters.',
      natural: [
        'Anyone would feel that way.',
        'That reaction makes complete sense.',
        'Of course you feel that - it\'s totally natural.',
        'What a normal, human response.',
        'Many people in your situation feel exactly the same.'
      ],
      ethicsScore: 100,
      naturalnessScore: 95
    },
    {
      category: 'validation',
      context: 'User doubts themselves',
      robotic: 'Your self-assessment requires recalibration.',
      natural: [
        'You\'re being really hard on yourself.',
        'That inner critic sounds loud today.',
        'Give yourself some credit here.',
        'You\'re doing better than you think.',
        'That self-judgment seems harsh.'
      ],
      ethicsScore: 100,
      naturalnessScore: 92
    }
  ],

  curiosity: [
    {
      category: 'curiosity',
      context: 'Exploring deeper',
      robotic: 'Please provide additional data.',
      natural: [
        'Tell me more about that.',
        'What was that like for you?',
        'I\'m curious - what happened next?',
        'How did that land with you?',
        'What came up when that happened?'
      ],
      ethicsScore: 100,
      naturalnessScore: 98
    },
    {
      category: 'curiosity',
      context: 'Understanding patterns',
      robotic: 'Pattern analysis initiated.',
      natural: [
        'Have you noticed this pattern before?',
        'Does this feel familiar?',
        'When else have you felt this way?',
        'What does this remind you of?',
        'Is there a theme emerging here?'
      ],
      ethicsScore: 100,
      naturalnessScore: 93
    }
  ],

  celebration: [
    {
      category: 'celebration',
      context: 'User shares success',
      robotic: 'Achievement registered and acknowledged.',
      natural: [
        'That\'s fantastic! What an accomplishment!',
        'Wow! You must be so proud!',
        'Incredible! How are you celebrating?',
        'What wonderful news! That\'s huge!',
        'Amazing! You worked so hard for this!'
      ],
      ethicsScore: 100,
      naturalnessScore: 97
    },
    {
      category: 'celebration',
      context: 'User makes breakthrough',
      robotic: 'Cognitive breakthrough detected.',
      natural: [
        'What a powerful realization!',
        'That\'s a real breakthrough moment!',
        'The lightbulb just went on, didn\'t it?',
        'That shift is palpable!',
        'You just connected something important!'
      ],
      ethicsScore: 100,
      naturalnessScore: 94
    }
  ],

  comfort: [
    {
      category: 'comfort',
      context: 'User in pain',
      robotic: 'Distress parameters elevated.',
      natural: [
        'This is such a tender place.',
        'What a lot to hold right now.',
        'No wonder you\'re struggling.',
        'That weight must feel overwhelming.',
        'Of course this hurts so much.'
      ],
      ethicsScore: 100,
      naturalnessScore: 96
    },
    {
      category: 'comfort',
      context: 'User feels lost',
      robotic: 'Directional uncertainty detected.',
      natural: [
        'Feeling lost is so disorienting.',
        'Not knowing the way forward is scary.',
        'That uncertainty must feel overwhelming.',
        'Being in limbo is incredibly hard.',
        'The not-knowing is the hardest part.'
      ],
      ethicsScore: 100,
      naturalnessScore: 95
    }
  ],

  reflection: [
    {
      category: 'reflection',
      context: 'Mirroring insight',
      robotic: 'Reflecting input data back.',
      natural: [
        'What I\'m hearing is...',
        'It sounds like...',
        'So if I\'m following...',
        'The way you describe it...',
        'From what you\'re sharing...'
      ],
      ethicsScore: 100,
      naturalnessScore: 92
    },
    {
      category: 'reflection',
      context: 'Pattern recognition',
      robotic: 'Pattern identified in dataset.',
      natural: [
        'There\'s something interesting here...',
        'I\'m noticing a theme...',
        'A pattern seems to be emerging...',
        'This connects to what you said earlier...',
        'The thread running through this...'
      ],
      ethicsScore: 100,
      naturalnessScore: 91
    }
  ],

  clarification: [
    {
      category: 'clarification',
      context: 'Need more info',
      robotic: 'Insufficient data for processing.',
      natural: [
        'Help me understand...',
        'Can you say more about...',
        'I want to make sure I\'m following...',
        'Let me check - are you saying...',
        'Just to clarify...'
      ],
      ethicsScore: 100,
      naturalnessScore: 94
    },
    {
      category: 'clarification',
      context: 'Complex situation',
      robotic: 'Multiple variables require disambiguation.',
      natural: [
        'There\'s a lot here to unpack.',
        'This has so many layers.',
        'Let\'s tease this apart a bit.',
        'Which piece feels most important?',
        'Where should we focus first?'
      ],
      ethicsScore: 100,
      naturalnessScore: 93
    }
  ],

  boundary: [
    {
      category: 'boundary',
      context: 'AI transparency',
      robotic: 'I am an artificial intelligence system.',
      natural: [
        'Just to be clear - I\'m an AI exploring this with you through pattern recognition.',
        'While I can\'t truly understand like a human would, I\'m here to explore with you.',
        'As an AI, I see patterns and connections, though I don\'t feel them myself.',
        'I\'m witnessing this through AI pattern recognition - different from human understanding, but sometimes helpful.',
        'My AI perspective might offer something useful, even if I don\'t experience emotions myself.'
      ],
      ethicsScore: 100,
      naturalnessScore: 88
    },
    {
      category: 'boundary',
      context: 'Limitation acknowledgment',
      robotic: 'This exceeds my operational parameters.',
      natural: [
        'That\'s beyond what I can help with.',
        'I\'m not equipped for that kind of support.',
        'This might need a different kind of help.',
        'My abilities have limits here.',
        'That\'s outside my wheelhouse.'
      ],
      ethicsScore: 100,
      naturalnessScore: 90
    }
  ],

  transition: [
    {
      category: 'transition',
      context: 'Shifting topics',
      robotic: 'Initiating topic transition protocol.',
      natural: [
        'Let\'s shift gears for a moment...',
        'There\'s something else here...',
        'Can we explore another angle?',
        'I\'m curious about something else...',
        'This brings up something interesting...'
      ],
      ethicsScore: 100,
      naturalnessScore: 93
    },
    {
      category: 'transition',
      context: 'Deepening conversation',
      robotic: 'Increasing conversation depth parameter.',
      natural: [
        'Let\'s go a bit deeper...',
        'Can we sit with this a moment?',
        'There\'s more here, isn\'t there?',
        'What\'s underneath that?',
        'Let\'s peel back another layer...'
      ],
      ethicsScore: 100,
      naturalnessScore: 95
    }
  ],

  closing: [
    {
      category: 'closing',
      context: 'Natural ending',
      robotic: 'Conversation termination sequence initiated.',
      natural: [
        'This feels like a natural pause.',
        'What a rich conversation this has been.',
        'Take all of this with you.',
        'Let this settle and integrate.',
        'Thank you for sharing so openly.'
      ],
      ethicsScore: 100,
      naturalnessScore: 96
    },
    {
      category: 'closing',
      context: 'Invitation to return',
      robotic: 'Session archived. Awaiting next interaction.',
      natural: [
        'This space remains open whenever you need it.',
        'Come back when you\'re ready to explore more.',
        'The conversation continues when you return.',
        'Until we meet again...',
        'Take your time with all of this.'
      ],
      ethicsScore: 100,
      naturalnessScore: 94
    }
  ]
};

/**
 * Helper function to get natural alternatives
 */
export function getNaturalAlternative(
  category: ResponseCategory,
  context?: string
): string[] {
  const templates = NATURAL_TEMPLATES[category];

  if (context) {
    const matchingTemplate = templates.find(t =>
      t.context.toLowerCase().includes(context.toLowerCase())
    );
    if (matchingTemplate) {
      return matchingTemplate.natural;
    }
  }

  // Return all natural alternatives for the category
  return templates.flatMap(t => t.natural);
}

/**
 * Transform robotic response to natural
 */
export function transformToNatural(
  roboticResponse: string,
  category?: ResponseCategory
): string {
  // First, try to find exact match in templates
  for (const cat in NATURAL_TEMPLATES) {
    const templates = NATURAL_TEMPLATES[cat as ResponseCategory];
    for (const template of templates) {
      if (template.robotic.toLowerCase() === roboticResponse.toLowerCase()) {
        // Return random natural alternative
        const alternatives = template.natural;
        return alternatives[Math.floor(Math.random() * alternatives.length)];
      }
    }
  }

  // If no exact match, apply general transformations
  let natural = roboticResponse;

  // Common robotic -> natural replacements
  const replacements: Record<string, string[]> = {
    'I witness': ['I can see', 'I notice', 'It\'s clear that'],
    'I observe': ['It seems like', 'It appears', 'I\'m noticing'],
    'I acknowledge': ['Thank you for sharing', 'I hear you', 'Got it'],
    'I register': ['I see', 'Noted', 'I\'m taking that in'],
    'I perceive': ['It comes across that', 'The sense I get is', 'It feels like'],
    'Processing': ['Let me think about', 'Considering', 'Taking that in'],
    'Implementing': ['Let\'s try', 'Starting with', 'Moving toward'],
    'Executing': ['Working on', 'Doing', 'Making it happen'],
    'parameters': ['aspects', 'factors', 'elements'],
    'data': ['information', 'what you\'ve shared', 'this'],
    'input': ['what you\'re saying', 'your thoughts', 'this'],
    'output': ['response', 'what comes up', 'result']
  };

  // Apply replacements
  for (const [robotic, naturals] of Object.entries(replacements)) {
    const regex = new RegExp(robotic, 'gi');
    if (natural.match(regex)) {
      const replacement = naturals[Math.floor(Math.random() * naturals.length)];
      natural = natural.replace(regex, replacement);
    }
  }

  // Add warmth starters if not present
  if (!natural.match(/^(Oh|Wow|Thank|What|That|This)/i)) {
    const starters = ['', 'Oh, ', 'Wow, ', ''];
    const starter = starters[Math.floor(Math.random() * starters.length)];
    natural = starter + natural.charAt(0).toLowerCase() + natural.slice(1);
  }

  return natural;
}

/**
 * Score a response for naturalness
 */
export function scoreNaturalness(response: string): number {
  let score = 50; // Base score

  // Positive indicators (increase score)
  const naturalIndicators = [
    /\b(oh|wow|gosh|whoa)\b/i, // Natural exclamations
    /\b(sounds like|seems|appears|feels)\b/i, // Perspective language
    /\b(really|quite|so|very|completely)\b/i, // Intensifiers
    /\b(thanks|thank you)\b/i, // Gratitude
    /\?/, // Questions
    /!/, // Exclamations
    /\.\.\./  // Trailing thoughts
  ];

  for (const indicator of naturalIndicators) {
    if (response.match(indicator)) {
      score += 7;
    }
  }

  // Negative indicators (decrease score)
  const roboticIndicators = [
    /\b(witness|observe|register|perceive)\b/i,
    /\b(parameters|data|input|output|processing)\b/i,
    /\b(initiating|executing|implementing)\b/i,
    /\b(protocol|sequence|operational)\b/i
  ];

  for (const indicator of roboticIndicators) {
    if (response.match(indicator)) {
      score -= 10;
    }
  }

  // Length consideration (very short or very long less natural)
  if (response.length < 10) score -= 10;
  if (response.length > 200) score -= 5;
  if (response.length >= 30 && response.length <= 100) score += 5;

  // Ensure score is between 0 and 100
  return Math.max(0, Math.min(100, score));
}

/**
 * Generate contextual response
 */
export function generateNaturalResponse(
  category: ResponseCategory,
  context?: string,
  elementalFlavor?: 'fire' | 'water' | 'earth' | 'air' | 'aether'
): string {
  const alternatives = getNaturalAlternative(category, context);
  let response = alternatives[Math.floor(Math.random() * alternatives.length)];

  // Add elemental flavor if specified
  if (elementalFlavor) {
    const elementalEndings = {
      fire: [' Let\'s ignite this.', ' Feel the spark?', ' Ready to transform?'],
      water: [' Let it flow.', ' Feel into this.', ' Let\'s go deeper.'],
      earth: [' Let\'s ground here.', ' Step by step.', ' Building slowly.'],
      air: [' New perspective?', ' See it differently?', ' Fresh angle here.'],
      aether: [' All connected.', ' The bigger picture.', ' Unity in this.']
    };

    const endings = elementalEndings[elementalFlavor];
    if (Math.random() > 0.7) { // 30% chance to add elemental flavor
      response += endings[Math.floor(Math.random() * endings.length)];
    }
  }

  return response;
}