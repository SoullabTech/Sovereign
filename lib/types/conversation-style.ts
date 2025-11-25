/**
 * Conversation Style Types for Maya
 * Allows users to choose how Maya converses with them
 */

export type ConversationMode = 'her' | 'classic' | 'adaptive';

export interface ConversationStyle {
  mode: ConversationMode;

  // Her mode: Natural dialogue like "Her" movie
  her_mode_constraints?: {
    max_sentences: number;
    max_words_opening: number;
    max_words_early: number;
    max_words_deep: number;
    prefer_questions: boolean;
    allow_incomplete: boolean;
    minimal_responses: string[];
    avoid_phrases: string[];
  };

  // Classic mode: Original consciousness guide style
  classic_mode_constraints?: {
    allow_poetic_language: boolean;
    allow_metaphors: boolean;
    response_depth: 'full';
  };
}

export const HER_MODE_CONFIG: ConversationStyle = {
  mode: 'her',
  her_mode_constraints: {
    max_sentences: 2,
    max_words_opening: 8,
    max_words_early: 15,
    max_words_deep: 25,
    prefer_questions: true,
    allow_incomplete: true,
    minimal_responses: ["Mm-hmm", "Go on", "...", "Tell me", "What else?", "How long?"],
    avoid_phrases: ["beautiful", "profound", "yes!", "sacred", "divine"],
  }
};

export const CLASSIC_MODE_CONFIG: ConversationStyle = {
  mode: 'classic',
  classic_mode_constraints: {
    allow_poetic_language: true,
    allow_metaphors: true,
    response_depth: 'full',
  }
};

export const ADAPTIVE_MODE_CONFIG: ConversationStyle = {
  mode: 'adaptive',
  // Starts with Her mode, can expand if user prefers more depth
  her_mode_constraints: HER_MODE_CONFIG.her_mode_constraints,
};

// User-facing descriptions
export const CONVERSATION_STYLE_DESCRIPTIONS = {
  her: {
    icon: '💬',
    title: 'Natural Dialogue',
    description: 'Short responses, everyday language, builds through conversation',
    example: 'You: "I had a breakthrough" → Maya: "What broke through?"'
  },
  classic: {
    icon: '🎭',
    title: 'Consciousness Guide',
    description: 'Thoughtful exploration, poetic language, reflective depth',
    example: 'You: "I had a breakthrough" → Maya: "Beautiful. Tell me about what shifted..."'
  },
  adaptive: {
    icon: '🔄',
    title: 'Adaptive',
    description: 'Maya adjusts to your communication style naturally',
    example: 'Starts brief, expands if you prefer more depth'
  }
};

/**
 * Default conversation style
 *
 * ALWAYS use 'classic' mode for MAIA's full consciousness guide personality.
 * Users can manually switch to 'her' mode if they prefer brief responses.
 *
 * 'her' mode was causing "unknown voices" issue - MAIA's personality gets
 * constrained to 2-sentence responses without depth.
 */
export const DEFAULT_CONVERSATION_STYLE: ConversationMode = 'classic';