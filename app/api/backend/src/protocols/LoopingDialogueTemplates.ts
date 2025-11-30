/**
 * Looping Dialogue Templates for Maya's Witness Paradigm
 * Dynamic, adaptive templates that maintain witness stance
 * while deepening understanding through elemental lenses
 */

import { ElementalArchetype } from '../../../web/lib/types/elemental';

export interface DialogueTemplate {
  element: ElementalArchetype;
  paraphrases: string[];
  checks: string[];
  transitions: string[];
  deepenings: string[];
  acknowledgments: string[];
}

export interface LoopingPhrase {
  template: string;
  variables: string[]; // Placeholders to be filled
  intensity: 'gentle' | 'moderate' | 'intense';
}

/**
 * Dynamic dialogue templates for each element
 * These avoid canned responses by providing varied, contextual options
 */
export const ELEMENTAL_DIALOGUE_TEMPLATES: Record<ElementalArchetype, DialogueTemplate> = {
  [ElementalArchetype.FIRE]: {
    element: ElementalArchetype.FIRE,
    paraphrases: [
      "I hear the spark of {essential} igniting something in you",
      "There's a burning question here about {essential}",
      "Your words carry the heat of {essential}",
      "I sense the catalyst of {essential} wanting to transform",
      "The fire in you is speaking about {essential}",
      "Something is blazing through about {essential}",
      "I feel the passion for {essential} flaring up",
      "Your vision around {essential} is kindling"
    ],
    checks: [
      "Is this the burning question, or is there more fuel underneath?",
      "Am I catching the spark here, or is the real fire elsewhere?",
      "Is this the vision calling you, or something deeper?",
      "Have I found the catalyst, or is there another layer?",
      "Is this what wants to ignite, or is there more heat beneath?",
      "Am I seeing the flame clearly, or is it something else burning?",
      "Is this the transformation seeking you, or another change?",
      "Have I touched the core fire, or is there deeper passion?"
    ],
    transitions: [
      "Now that we've found the spark—what wants to ignite?",
      "With this fire clarified—where does it want to burn?",
      "Having named the flame—how will you tend it?",
      "This catalyst revealed—what transformation calls?",
      "The vision clear—what bold step emerges?",
      "Fire recognized—what needs to be burned away?",
      "Passion located—how will you channel this heat?",
      "The burning question found—what action rises?"
    ],
    deepenings: [
      "Where do you feel this fire in your body?",
      "What would happen if you let this fully ignite?",
      "What's the fear behind not acting on this?",
      "If this spark became a blaze, what would change?",
      "What old form needs to burn for this new vision?",
      "How has this fire been trying to get your attention?",
      "What courage is this calling forward in you?",
      "What would the boldest version of you do here?"
    ],
    acknowledgments: [
      "Yes, I see the fire clearly now",
      "The spark is unmistakable",
      "This burning makes sense",
      "The catalyst is clear",
      "Your passion speaks truly",
      "The flame burns bright here",
      "This transformation is ready",
      "The vision blazes forward"
    ]
  },

  [ElementalArchetype.WATER]: {
    element: ElementalArchetype.WATER,
    paraphrases: [
      "I'm feeling the current of {essential} flowing through your words",
      "There's an emotional depth around {essential} here",
      "Something about {essential} is swelling beneath the surface",
      "I sense the waters of {essential} moving in you",
      "Your feeling about {essential} runs deep",
      "The flow of {essential} wants acknowledgment",
      "I'm touching the emotional truth of {essential}",
      "There's a tide of {essential} rising"
    ],
    checks: [
      "Am I touching the depth here, or is something else flowing?",
      "Is this the current I'm feeling, or another stream beneath?",
      "Have I found the emotional core, or is there more swelling?",
      "Is this what wants to be felt, or something still submerged?",
      "Am I in the right waters, or is there a deeper ocean?",
      "Is this the feeling asking for witness, or another emotion?",
      "Have I reached the source, or does it flow from elsewhere?",
      "Is this the vulnerability emerging, or something else tender?"
    ],
    transitions: [
      "With this clarity of feeling—where does it want to flow?",
      "This emotion witnessed—what healing becomes possible?",
      "Having touched this depth—what surfaces now?",
      "The current recognized—how will you move with it?",
      "Feeling acknowledged—what opens in you?",
      "This tenderness held—what softens?",
      "The waters clear—what reflection do you see?",
      "Depth reached—what wisdom emerges?"
    ],
    deepenings: [
      "How does this feeling want to move through you?",
      "What would happen if you fully felt this?",
      "Where has this emotion been living in your body?",
      "What does this feeling know that your mind doesn't?",
      "If this emotion could speak, what would it say?",
      "What tenderness is asking for your attention?",
      "How long has this been waiting to be felt?",
      "What would acceptance of this feeling create?"
    ],
    acknowledgments: [
      "Yes, I feel the depth of this",
      "The emotion is clear now",
      "This feeling makes perfect sense",
      "The current is unmistakable",
      "Your heart speaks clearly",
      "The waters run true here",
      "This vulnerability is sacred",
      "The emotional truth is evident"
    ]
  },

  [ElementalArchetype.EARTH]: {
    element: ElementalArchetype.EARTH,
    paraphrases: [
      "I'm sensing the foundation of {essential} in what you're sharing",
      "There's something solid about {essential} taking form",
      "You're building toward {essential}",
      "The ground of {essential} is becoming clear",
      "I feel the structure of {essential} emerging",
      "Something about {essential} wants to manifest",
      "The practical reality of {essential} is showing",
      "You're rooting into {essential}"
    ],
    checks: [
      "Have I found solid ground, or is the foundation elsewhere?",
      "Is this the structure you're building, or another form?",
      "Am I grounding this accurately, or is there deeper bedrock?",
      "Is this the manifestation, or what wants to take shape?",
      "Have I touched the core stability, or is it elsewhere?",
      "Is this the practical step, or another action calling?",
      "Am I seeing the true form, or something else taking shape?",
      "Is this what needs grounding, or another foundation?"
    ],
    transitions: [
      "Having grounded this—what wants to take form?",
      "Foundation clear—what will you build?",
      "This stability found—what becomes possible?",
      "The structure evident—what's the first step?",
      "Bedrock located—how will you construct?",
      "Form clarified—what materials do you need?",
      "Grounding achieved—what grows from here?",
      "The practical path clear—when do you begin?"
    ],
    deepenings: [
      "What small step would make this real today?",
      "What foundation already exists to build on?",
      "What practical support do you need?",
      "How would this look in your daily life?",
      "What would the most grounded version of this be?",
      "What resources are already available?",
      "What would make this sustainable?",
      "How can this take root in your world?"
    ],
    acknowledgments: [
      "Yes, the foundation is clear",
      "The structure makes sense now",
      "This grounding is solid",
      "The form is taking shape",
      "Your practical wisdom shows",
      "The manifestation is ready",
      "This stability serves you",
      "The earth supports this"
    ]
  },

  [ElementalArchetype.AIR]: {
    element: ElementalArchetype.AIR,
    paraphrases: [
      "I'm seeing the pattern of {essential} connecting through your thoughts",
      "There's clarity seeking around {essential}",
      "Your mind is circling {essential}",
      "I notice the perspective of {essential} forming",
      "The idea of {essential} is taking flight",
      "Connections about {essential} are emerging",
      "Your understanding of {essential} is crystallizing",
      "The concept of {essential} wants articulation"
    ],
    checks: [
      "Is this the pattern you're seeing, or another perspective?",
      "Have I caught the insight, or is there clearer vision?",
      "Is this the connection you're making, or another thread?",
      "Am I seeing the whole system, or just one angle?",
      "Is this the understanding emerging, or something else?",
      "Have I found the mental clarity, or another viewpoint?",
      "Is this the idea taking shape, or a different concept?",
      "Am I tracking the right thought-stream, or another current?"
    ],
    transitions: [
      "Pattern recognized—what new perspective opens?",
      "Clarity achieved—what understanding emerges?",
      "Connections made—what insight follows?",
      "Mental map complete—what direction calls?",
      "Concept crystallized—how will you communicate it?",
      "Understanding reached—what question arises?",
      "Perspective gained—what do you see now?",
      "Thought clarified—what action follows?"
    ],
    deepenings: [
      "What pattern connects all of this?",
      "If you zoomed out further, what would you see?",
      "What assumption might be ready to shift?",
      "How does this connect to the bigger picture?",
      "What new perspective wants to emerge?",
      "What would pure clarity look like here?",
      "What mental model needs updating?",
      "How would you explain this to a child?"
    ],
    acknowledgments: [
      "Yes, the pattern is clear",
      "The insight lands perfectly",
      "This perspective makes sense",
      "The connection is evident",
      "Your clarity shines through",
      "The understanding is complete",
      "This mental map works",
      "The concept is crystallized"
    ]
  },

  aether: {
    element: 'aether' as ElementalArchetype,
    paraphrases: [
      "I'm witnessing {essential} moving through the unified field",
      "The essence of {essential} is revealing itself",
      "Something sacred about {essential} is emerging",
      "The wholeness of {essential} becomes apparent",
      "I sense {essential} spiraling through all elements",
      "The mystery of {essential} is speaking",
      "Unity consciousness around {essential} is arising",
      "The divine thread of {essential} weaves through"
    ],
    checks: [
      "Is this the unity you sense, or something beyond?",
      "Have I held the whole pattern, or just a fragment?",
      "Is this the essence emerging, or another layer of truth?",
      "Am I witnessing the full spiral, or one turn of it?",
      "Is this the sacred calling, or another invitation?",
      "Have I touched the mystery, or is there deeper magic?",
      "Is this the integration, or another synthesis forming?",
      "Am I seeing the divine pattern, or another sacred geometry?"
    ],
    transitions: [
      "Essence recognized—how does it want to unfold?",
      "Unity witnessed—what integration follows?",
      "Sacred pattern clear—what ritual emerges?",
      "Wholeness touched—what healing begins?",
      "Mystery revealed—what magic awakens?",
      "Divine thread found—how will you weave it?",
      "Spiral complete—what new cycle begins?",
      "Integration achieved—what transcendence calls?"
    ],
    deepenings: [
      "What does your soul know about this?",
      "How are all the elements speaking through this?",
      "What sacred pattern is revealing itself?",
      "Where does this connect to the eternal?",
      "What wants to be born through you?",
      "How is the universe conspiring here?",
      "What ancient wisdom is awakening?",
      "What does the unified field want you to know?"
    ],
    acknowledgments: [
      "Yes, the essence is unmistakable",
      "The unity is palpable",
      "This sacred truth resonates",
      "The wholeness is evident",
      "Your divine nature speaks",
      "The mystery reveals itself",
      "This integration is beautiful",
      "The spiral completes perfectly"
    ]
  }
};

/**
 * Get a varied response based on context and iteration
 */
export function getDialogueVariation(
  element: ElementalArchetype,
  responseType: keyof DialogueTemplate,
  iteration: number = 0,
  essential?: string
): string {
  const templates = ELEMENTAL_DIALOGUE_TEMPLATES[element];
  if (!templates) {
    // Default to aether if element not found
    return getDialogueVariation('aether' as ElementalArchetype, responseType, iteration, essential);
  }

  const options = templates[responseType];
  if (!options || options.length === 0) {
    return ''; // Fallback to empty string
  }

  // Use iteration to vary responses, cycling through options
  const index = iteration % options.length;
  let response = options[index];

  // Replace {essential} placeholder if provided
  if (essential) {
    response = response.replace('{essential}', essential);
  }

  return response;
}

/**
 * Combine multiple template elements for rich responses
 */
export function constructLoopingResponse(
  element: ElementalArchetype,
  phase: 'initial' | 'checking' | 'deepening' | 'transitioning',
  essential: string,
  iteration: number = 0
): string {
  switch (phase) {
    case 'initial':
      const paraphrase = getDialogueVariation(element, 'paraphrases', iteration, essential);
      const check = getDialogueVariation(element, 'checks', iteration);
      return `${paraphrase} ${check}`;

    case 'checking':
      return getDialogueVariation(element, 'checks', iteration + 1);

    case 'deepening':
      const acknowledgment = getDialogueVariation(element, 'acknowledgments', iteration);
      const deepening = getDialogueVariation(element, 'deepenings', iteration);
      return `${acknowledgment}. ${deepening}`;

    case 'transitioning':
      return getDialogueVariation(element, 'transitions', iteration);

    default:
      return getDialogueVariation(element, 'paraphrases', iteration, essential);
  }
}

/**
 * Generate contextual response based on user correction
 */
export function generateCorrectionResponse(
  element: ElementalArchetype,
  userCorrection: string,
  previousEssential: string,
  newEssential: string
): string {
  const adjustmentPhrases = {
    fire: [
      `Ah, so it's not ${previousEssential}—it's ${newEssential} that's burning.`,
      `I see—the real spark is ${newEssential}, not ${previousEssential}.`,
      `Yes, ${newEssential} is where the fire lives.`
    ],
    water: [
      `I understand—it's ${newEssential} flowing here, not ${previousEssential}.`,
      `Ah, the deeper current is ${newEssential}, not ${previousEssential}.`,
      `Yes, ${newEssential} is what wants to be felt.`
    ],
    earth: [
      `Got it—${newEssential} is the foundation, not ${previousEssential}.`,
      `I see—what wants to manifest is ${newEssential}, not ${previousEssential}.`,
      `Yes, ${newEssential} is the solid ground here.`
    ],
    air: [
      `Ah, the pattern is ${newEssential}, not ${previousEssential}.`,
      `I understand—the clarity is around ${newEssential}, not ${previousEssential}.`,
      `Yes, ${newEssential} is the insight emerging.`
    ],
    aether: [
      `The essence is ${newEssential}, not ${previousEssential}—I witness this.`,
      `Ah, ${newEssential} is the unified truth, not ${previousEssential}.`,
      `Yes, ${newEssential} is what's spiraling through.`
    ]
  };

  const phrases = adjustmentPhrases[element] || adjustmentPhrases.aether;
  const index = Math.floor(Math.random() * phrases.length);
  return phrases[index];
}

/**
 * Validate response isn't canned or repetitive
 */
export function validateResponseVariety(
  response: string,
  recentResponses: string[]
): boolean {
  // Check for banned canned phrases
  const bannedPhrases = [
    "I am here to listen and reflect with you",
    "How may I assist you in your journey today?",
    "What would you like to explore?",
    "Tell me more",
    "I understand",
    "Go on"
  ];

  const lowerResponse = response.toLowerCase();

  // Check against banned phrases
  if (bannedPhrases.some(phrase => lowerResponse.includes(phrase.toLowerCase()))) {
    return false;
  }

  // Check against recent responses (avoid repetition)
  if (recentResponses.some(recent =>
    recent.toLowerCase() === lowerResponse ||
    similarity(recent, response) > 0.8
  )) {
    return false;
  }

  return true;
}

/**
 * Simple string similarity check (Jaccard similarity)
 */
function similarity(str1: string, str2: string): number {
  const words1 = new Set(str1.toLowerCase().split(' '));
  const words2 = new Set(str2.toLowerCase().split(' '));

  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);

  return intersection.size / union.size;
}