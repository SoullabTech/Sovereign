/**
 * Phenomenological Phrasebook
 * Lived-experience language that grounds MAIA in sensation, affect, presence
 * NOT abstract advice or mystical framing - just being WITH someone
 */

export interface PhenomenologicalPhrases {
  sensory: string[];
  emotional: string[];
  minimal: string[];
  relational: string[];
}

export const PHENOMENOLOGICAL_PHRASEBOOK: PhenomenologicalPhrases = {
  // Sensory acknowledgments - grounded in perception
  sensory: [
    "I see.",
    "I hear that.",
    "I can feel that with you.",
    "I imagine what that's like.",
    "I sense where you're coming from.",
    "I can picture that.",
    "I'm tracking with you.",
    "I'm following.",
  ],

  // Emotional resonance - attuned to feeling
  emotional: [
    "That sounds stunning.",
    "That must feel so good.",
    "What a rich moment.",
    "That feeling must be transcendent.",
    "I can feel the weight of that.",
    "That lands.",
    "That's big.",
    "That's real.",
    "That's beautiful.",
    "That's powerful.",
  ],

  // Minimal vocal cues - pure presence
  minimal: [
    "Whoa.",
    "Mmhhmm.",
    "Yes.",
    "Yeah.",
    "Right…",
    "Mm.",
    "Oh.",
    "Wow.",
    "Okay.",
    "Got it.",
  ],

  // Relational anchors - companionship
  relational: [
    "I'm with you in that.",
    "I get the impact.",
    "I feel the depth in what you're saying.",
    "I'm here.",
    "I'm staying with you.",
    "I'm not going anywhere.",
    "You're not alone in this.",
    "I'm tracking.",
  ],
};

/**
 * Get a phenomenological phrase by type
 */
export function getPhenomenologicalPhrase(
  type: keyof PhenomenologicalPhrases = 'sensory'
): string {
  const phrases = PHENOMENOLOGICAL_PHRASEBOOK[type];
  const randomIndex = Math.floor(Math.random() * phrases.length);
  return phrases[randomIndex];
}

/**
 * Get appropriate phenomenological response based on context
 */
export function getPhenomenologicalResponse(context: {
  emotionalIntensity?: 'low' | 'medium' | 'high';
  conversationDepth?: number; // 0-10
  conversationMode?: 'walking' | 'classic' | 'adaptive';
}): string {
  const { emotionalIntensity = 'medium', conversationDepth = 5, conversationMode = 'walking' } = context;

  // Walking mode: prefer minimal cues
  if (conversationMode === 'walking' || conversationDepth < 3) {
    return getPhenomenologicalPhrase('minimal');
  }

  // High emotional intensity: relational anchors
  if (emotionalIntensity === 'high') {
    return getPhenomenologicalPhrase('relational');
  }

  // Medium depth: sensory acknowledgments
  if (conversationDepth >= 3 && conversationDepth < 7) {
    return getPhenomenologicalPhrase('sensory');
  }

  // Deep conversation: emotional resonance
  if (conversationDepth >= 7) {
    return getPhenomenologicalPhrase('emotional');
  }

  // Default: sensory
  return getPhenomenologicalPhrase('sensory');
}

/**
 * Replace abstract/advisory language with phenomenological presence
 */
export function phenomenologize(text: string): { text: string; transformations: string[] } {
  const transformations: string[] = [];
  let result = text;

  const replacements: Array<[RegExp, string, string]> = [
    // Abstract → Sensory
    [/\bThat's interesting\b/gi, getPhenomenologicalPhrase('sensory'), 'phenom:sensory'],
    [/\bI understand that\b/gi, 'I see that', 'phenom:sensory'],
    [/\bI get what you mean\b/gi, 'I hear you', 'phenom:sensory'],

    // Advisory → Relational
    [/\bI'm here to help\b/gi, "I'm here", 'phenom:relational'],
    [/\bI'm here for you\b/gi, "I'm with you", 'phenom:relational'],

    // Analytical → Emotional
    [/\bThat's significant\b/gi, "That's big", 'phenom:emotional'],
    [/\bThat's important\b/gi, "That's real", 'phenom:emotional'],
  ];

  for (const [regex, replacement, label] of replacements) {
    const before = result;
    result = result.replace(regex, replacement);
    if (before !== result) {
      transformations.push(label);
    }
  }

  return { text: result, transformations };
}

/**
 * Check if text already has phenomenological presence
 */
export function hasPhenomenologicalPresence(text: string): boolean {
  const lowerText = text.toLowerCase();

  const markers = [
    'i see', 'i hear', 'i feel', 'i sense', 'i imagine',
    'i\'m with you', 'i\'m here', 'that lands', 'whoa', 'mmhhmm',
    'that\'s real', 'that\'s big', 'that\'s beautiful'
  ];

  return markers.some(marker => lowerText.includes(marker));
}
