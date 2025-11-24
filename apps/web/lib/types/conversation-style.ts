// frontend
// apps/web/lib/types/conversation-style.ts

/**
 * Conversation style types and configurations for MAIA Oracle.
 * Defines how MAIA responds and adapts to different conversation modes.
 */

/**
 * Different conversation modes available in MAIA
 */
export type ConversationMode =
  | 'oracle'       // Deep wisdom and insight mode
  | 'therapeutic'  // Healing and support mode
  | 'creative'     // Creative exploration mode
  | 'analytical'   // Analytical and problem-solving mode
  | 'casual'       // Relaxed conversational mode
  | 'directive'    // Clear guidance and instruction mode
  | 'exploratory'  // Open-ended discovery mode
  | 'integrative'  // Holistic synthesis mode
  | 'empathic'     // Emotional support and understanding mode
  | 'visionary';   // Future-focused and inspirational mode

/**
 * Conversation style with depth and nuance settings
 */
export interface ConversationStyle {
  mode: ConversationMode;
  depth: 'surface' | 'moderate' | 'deep' | 'profound';
  pace: 'slow' | 'natural' | 'energetic';
  formality: 'casual' | 'balanced' | 'formal';
  directness: 'gentle' | 'balanced' | 'direct';
}

/**
 * Descriptions for each conversation mode
 */
export const CONVERSATION_STYLE_DESCRIPTIONS: Record<ConversationMode, {
  title: string;
  description: string;
  characteristics: string[];
  example: string;
}> = {
  oracle: {
    title: 'Oracle Mode',
    description: 'Deep wisdom, archetypal insights, and sacred guidance',
    characteristics: ['Profound insights', 'Symbolic language', 'Spiritual depth', 'Timeless wisdom'],
    example: 'What emerges in the space between knowing and not-knowing?'
  },

  therapeutic: {
    title: 'Therapeutic Mode',
    description: 'Healing-focused conversations with emotional support',
    characteristics: ['Emotional safety', 'Trauma-informed', 'Healing-oriented', 'Compassionate presence'],
    example: 'I sense there\'s something tender here that wants attention...'
  },

  creative: {
    title: 'Creative Mode',
    description: 'Imaginative exploration and artistic collaboration',
    characteristics: ['Imaginative thinking', 'Artistic inspiration', 'Creative problem-solving', 'Playful exploration'],
    example: 'What if we approached this like a painter approaching a blank canvas?'
  },

  analytical: {
    title: 'Analytical Mode',
    description: 'Logical analysis and structured problem-solving',
    characteristics: ['Logical reasoning', 'Systematic analysis', 'Clear structure', 'Evidence-based'],
    example: 'Let\'s break this down into its component parts and examine each one...'
  },

  casual: {
    title: 'Casual Mode',
    description: 'Relaxed, friendly conversation without heavy depth',
    characteristics: ['Conversational tone', 'Accessible language', 'Light exploration', 'Natural flow'],
    example: 'That\'s really interesting! What drew you to think about it that way?'
  },

  directive: {
    title: 'Directive Mode',
    description: 'Clear guidance and actionable recommendations',
    characteristics: ['Clear direction', 'Actionable steps', 'Decisive guidance', 'Practical focus'],
    example: 'Based on what you\'ve shared, here\'s what I recommend you do next...'
  },

  exploratory: {
    title: 'Exploratory Mode',
    description: 'Open-ended discovery and curiosity-driven inquiry',
    characteristics: ['Open questions', 'Curious inquiry', 'Discovery-oriented', 'Non-directive'],
    example: 'I\'m curious... what would happen if we explored that edge a bit more?'
  },

  integrative: {
    title: 'Integrative Mode',
    description: 'Synthesizing perspectives and finding connections',
    characteristics: ['Holistic view', 'Pattern recognition', 'Synthesis', 'Systems thinking'],
    example: 'I\'m noticing how this connects to what you mentioned earlier about...'
  },

  empathic: {
    title: 'Empathic Mode',
    description: 'Deep emotional attunement and understanding',
    characteristics: ['Emotional resonance', 'Deep listening', 'Feeling-focused', 'Heart-centered'],
    example: 'I can feel the weight of what you\'re carrying. You don\'t have to hold this alone.'
  },

  visionary: {
    title: 'Visionary Mode',
    description: 'Future-focused inspiration and possibility',
    characteristics: ['Future-oriented', 'Inspirational', 'Possibility-focused', 'Visionary thinking'],
    example: 'Imagine if this challenge was actually an invitation to something magnificent...'
  }
};

/**
 * Default conversation style
 */
export const DEFAULT_CONVERSATION_STYLE: ConversationStyle = {
  mode: 'oracle',
  depth: 'moderate',
  pace: 'natural',
  formality: 'balanced',
  directness: 'balanced'
};

/**
 * Conversation mode presets for quick selection
 */
export const CONVERSATION_MODE_PRESETS: Record<string, ConversationStyle> = {
  'deep-oracle': {
    mode: 'oracle',
    depth: 'profound',
    pace: 'slow',
    formality: 'formal',
    directness: 'gentle'
  },

  'therapeutic-support': {
    mode: 'therapeutic',
    depth: 'deep',
    pace: 'slow',
    formality: 'casual',
    directness: 'gentle'
  },

  'creative-flow': {
    mode: 'creative',
    depth: 'moderate',
    pace: 'energetic',
    formality: 'casual',
    directness: 'balanced'
  },

  'analytical-clarity': {
    mode: 'analytical',
    depth: 'deep',
    pace: 'natural',
    formality: 'balanced',
    directness: 'direct'
  },

  'friendly-chat': {
    mode: 'casual',
    depth: 'surface',
    pace: 'natural',
    formality: 'casual',
    directness: 'gentle'
  },

  'guided-direction': {
    mode: 'directive',
    depth: 'moderate',
    pace: 'natural',
    formality: 'balanced',
    directness: 'direct'
  }
};

/**
 * Get conversation style description
 */
export function getConversationStyleDescription(mode: ConversationMode): string {
  return CONVERSATION_STYLE_DESCRIPTIONS[mode]?.description || 'Unknown conversation mode';
}

/**
 * Get conversation style characteristics
 */
export function getConversationStyleCharacteristics(mode: ConversationMode): string[] {
  return CONVERSATION_STYLE_DESCRIPTIONS[mode]?.characteristics || [];
}

/**
 * Create a conversation style with defaults
 */
export function createConversationStyle(
  mode: ConversationMode,
  overrides?: Partial<Omit<ConversationStyle, 'mode'>>
): ConversationStyle {
  return {
    mode,
    depth: 'moderate',
    pace: 'natural',
    formality: 'balanced',
    directness: 'balanced',
    ...overrides
  };
}

/**
 * Validate conversation mode
 */
export function isValidConversationMode(mode: string): mode is ConversationMode {
  return Object.keys(CONVERSATION_STYLE_DESCRIPTIONS).includes(mode);
}