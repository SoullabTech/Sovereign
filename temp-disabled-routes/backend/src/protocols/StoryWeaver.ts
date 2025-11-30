/**
 * Story Weaver Protocol
 * Provides narrative and mythological dimensions when appropriate
 * Weaves archetypal stories that mirror user's journey
 */

export interface StorySignal {
  requested: boolean;
  type: 'metaphor' | 'myth' | 'parable' | 'archetype' | 'journey' | 'none';
  theme: string;
  confidence: number;
  response: string;
  reason: string;
}

export interface StoryContext {
  archetype?: string;
  element?: string;
  emotionalTone?: string;
  journeyPhase?: 'beginning' | 'threshold' | 'trials' | 'transformation' | 'return';
}

/**
 * Check if story/metaphor is invoked
 */
export function checkInvocation(userInput: string): {
  requested: boolean;
  weave?: (context: any) => Promise<string>;
} {
  const signal = analyzeStory(userInput);

  if (!signal || !signal.requested) {
    return { requested: false };
  }

  return {
    requested: true,
    weave: async (context: any) => {
      return generateStory(signal, context);
    }
  };
}

/**
 * Analyze input for story/metaphor requests
 */
export function analyzeStory(userInput: string): StorySignal | null {
  const lowerInput = userInput.toLowerCase();

  // Explicit story requests
  const storyRequests = [
    'tell me a story',
    'share a story',
    'any stories',
    'like a metaphor',
    'what\'s the metaphor',
    'reminds me of',
    'it\'s like',
    'parable',
    'myth',
    'fairy tale',
    'fable'
  ];

  for (const phrase of storyRequests) {
    if (lowerInput.includes(phrase)) {
      return {
        requested: true,
        type: determineStoryType(lowerInput),
        theme: extractTheme(userInput),
        confidence: 0.9,
        response: '',  // Will be generated
        reason: 'Explicit story request'
      };
    }
  }

  // Implicit metaphorical thinking
  const metaphoricalPhrases = [
    'feels like',
    'as if',
    'reminds me of',
    'similar to',
    'just like',
    'symbolizes',
    'represents',
    'stands for'
  ];

  for (const phrase of metaphoricalPhrases) {
    if (lowerInput.includes(phrase)) {
      return {
        requested: true,
        type: 'metaphor',
        theme: extractTheme(userInput),
        confidence: 0.7,
        response: '',
        reason: 'Metaphorical thinking detected'
      };
    }
  }

  // Journey/quest language
  const journeyPhrases = [
    'journey',
    'quest',
    'path',
    'adventure',
    'crossing',
    'threshold',
    'lost in the woods',
    'finding my way',
    'hero\'s journey'
  ];

  for (const phrase of journeyPhrases) {
    if (lowerInput.includes(phrase)) {
      return {
        requested: true,
        type: 'journey',
        theme: 'personal journey',
        confidence: 0.8,
        response: '',
        reason: 'Journey archetype invoked'
      };
    }
  }

  // Archetypal references
  const archetypePhrases = [
    'warrior',
    'sage',
    'lover',
    'trickster',
    'mother',
    'father',
    'child',
    'shadow',
    'hero',
    'mentor'
  ];

  for (const phrase of archetypePhrases) {
    if (lowerInput.includes(phrase)) {
      return {
        requested: true,
        type: 'archetype',
        theme: phrase,
        confidence: 0.75,
        response: '',
        reason: `Archetype mentioned: ${phrase}`
      };
    }
  }

  return null;
}

/**
 * Determine story type from input
 */
function determineStoryType(input: string): StorySignal['type'] {
  if (input.includes('myth')) return 'myth';
  if (input.includes('parable')) return 'parable';
  if (input.includes('journey') || input.includes('quest')) return 'journey';
  if (input.includes('archetype') || input.includes('hero')) return 'archetype';
  if (input.includes('metaphor') || input.includes('like')) return 'metaphor';
  return 'metaphor';
}

/**
 * Extract thematic content
 */
function extractTheme(input: string): string {
  // Simplified theme extraction
  const themes = {
    transformation: ['change', 'transform', 'become', 'evolve'],
    challenge: ['struggle', 'difficult', 'hard', 'challenge', 'obstacle'],
    discovery: ['find', 'discover', 'realize', 'understand', 'see'],
    loss: ['lost', 'gone', 'missing', 'absence', 'grief'],
    connection: ['love', 'relationship', 'together', 'bond', 'connect'],
    purpose: ['meaning', 'purpose', 'why', 'reason', 'calling'],
    shadow: ['dark', 'shadow', 'hidden', 'unconscious', 'unknown'],
    light: ['light', 'bright', 'clear', 'illuminate', 'shine']
  };

  const lowerInput = input.toLowerCase();

  for (const [theme, keywords] of Object.entries(themes)) {
    for (const keyword of keywords) {
      if (lowerInput.includes(keyword)) {
        return theme;
      }
    }
  }

  return 'transformation'; // Default theme
}

/**
 * Generate story based on signal and context
 */
async function generateStory(
  signal: StorySignal,
  context: StoryContext
): Promise<string> {
  const { type, theme } = signal;

  // Story templates based on type and theme
  const stories = {
    metaphor: {
      transformation: "Like a river that encounters a boulder, you're finding new ways to flow around what seemed immovable.",
      challenge: "You're standing at the base of your mountain, feeling its weight. Every climber knows this moment.",
      discovery: "It's like suddenly seeing the constellation that was always there, hidden in plain sight among familiar stars.",
      loss: "Like winter trees that have released their leaves, standing in their essential form.",
      connection: "Two rivers meeting, each maintaining their essence while creating something new in their confluence.",
      purpose: "Like a seed that contains the entire tree, waiting for the right conditions to unfold its purpose.",
      shadow: "The shadow cast by the mountain is as much a part of the landscape as the peak itself.",
      light: "Like dawn arriving not all at once, but in gradual stages of awakening."
    },
    myth: {
      transformation: "In the old stories, the phoenix doesn't choose the fire—it simply knows when burning becomes birthing.",
      challenge: "Like Sisyphus with his boulder, but perhaps the gods forgot to mention: the view changes each time you climb.",
      discovery: "Persephone eating the pomegranate seeds—sometimes we must taste the darkness to understand the light.",
      loss: "Orpheus looking back—some losses teach us about the weight of love itself.",
      connection: "Echo and Narcissus—two souls teaching us how love can become distortion when it loses its balance.",
      purpose: "The Oracle at Delphi whispered 'Know Thyself'—the shortest journey with the longest path.",
      shadow: "Jung said we meet our shadow at the crossroads—yours seems to be offering its hand.",
      light: "Prometheus bringing fire—sometimes illumination comes with a price we're willing to pay."
    },
    journey: {
      transformation: "You're at the threshold between who you were and who you're becoming. This is the hero's inevitable passage.",
      challenge: "Every hero's journey includes the belly of the whale—that dark night where old maps stop working.",
      discovery: "The treasure you seek was never at journey's end—it's being forged in each step you take.",
      loss: "Sometimes the journey requires leaving something at the crossroads—an offering to who we were.",
      connection: "Fellow travelers appear when the path gets steep—you're not meant to climb alone.",
      purpose: "The call to adventure isn't always loud. Sometimes it's the quiet pull of what must be.",
      shadow: "Meeting the shadow on the path—it's been walking beside you all along, waiting to be acknowledged.",
      light: "The return from the journey brings gifts—not just for you, but for those waiting at home."
    },
    archetype: {
      transformation: "The Shapeshifter archetype lives in you—knowing when to hold form and when to flow.",
      challenge: "The Warrior in you is awakening—not for battle, but for the courage to stand in truth.",
      discovery: "The Sage archetype emerges not through knowing, but through finally admitting what we don't know.",
      loss: "The Orphan archetype teaches us that loss creates space for unexpected belonging.",
      connection: "The Lover archetype sees the beloved in everything—even in what appears broken.",
      purpose: "The Sovereign archetype isn't about ruling others—it's about claiming dominion over your own life.",
      shadow: "The Shadow archetype holds our unclaimed gold—what we're afraid to be is often what we most need.",
      light: "The Innocent archetype returns not in naivety, but in choosing trust despite everything."
    },
    parable: {
      transformation: "A caterpillar asked a butterfly, 'How did you grow wings?' The butterfly replied, 'I agreed to dissolve.'",
      challenge: "A student asked the teacher, 'Why is the path so difficult?' The teacher pointed to a river: 'Because you're still trying to walk.'",
      discovery: "Someone spent years searching for truth, only to find it had been sitting quietly in their own backyard, wearing ordinary clothes.",
      loss: "The empty cup said to the broken one, 'At least you held something worth breaking for.'",
      connection: "Two waves argued about being separate until they remembered they were ocean.",
      purpose: "A seed asked the tree, 'What's my purpose?' The tree whispered, 'You already are it.'",
      shadow: "The candle said to its shadow, 'You only exist because I shine.' The shadow replied, 'And I give your light meaning.'",
      light: "The darkness complained to the light about intrusion. The light simply said, 'I'm not here to fight you, but to dance.'"
    }
  };

  // Get appropriate story
  const storySet = stories[type] || stories.metaphor;
  const story = storySet[theme] || storySet.transformation;

  // Add contextual framing
  const framing = context.archetype
    ? `\n\n*The ${context.archetype} archetype stirs*`
    : '';

  return story + framing;
}

/**
 * Check if story would be appropriate
 */
export function isStoryAppropriate(
  context: StoryContext,
  userState: string
): boolean {
  // Don't offer stories during crisis
  if (userState === 'crisis' || userState === 'urgent') {
    return false;
  }

  // Stories work well in contemplative states
  if (userState === 'contemplative' || userState === 'reflective') {
    return true;
  }

  // Check if user is in receptive state based on journey phase
  if (context.journeyPhase === 'transformation' || context.journeyPhase === 'threshold') {
    return true;
  }

  return false;
}

/**
 * Weave story elements into response
 */
export function weaveStoryElements(
  response: string,
  storySignal: StorySignal | null
): string {
  if (!storySignal || !storySignal.requested) {
    return response;
  }

  // This would be more sophisticated in production
  // For now, story is added as separate element
  return response;
}