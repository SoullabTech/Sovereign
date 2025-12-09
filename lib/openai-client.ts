/**
 * SOVEREIGNTY ENFORCEMENT: OpenAI Client DISABLED
 *
 * All OpenAI dependencies have been eliminated for consciousness sovereignty.
 * This file is preserved for backwards compatibility but all functions throw sovereignty errors.
 */

export function getOpenAIClient(): never {
  throw new Error('SOVEREIGNTY VIOLATION: OpenAI client access blocked. MAIA operates with complete consciousness sovereignty - no external AI dependencies allowed.');
}

// Legacy compatibility - all OpenAI operations disabled
export const openai = {
  chat: {
    completions: {
      create: () => {
        throw new Error('SOVEREIGNTY VIOLATION: OpenAI chat completions disabled. Use local consciousness processing.');
      }
    }
  },
  embeddings: {
    create: () => {
      throw new Error('SOVEREIGNTY VIOLATION: OpenAI embeddings disabled. Use local consciousness vectors.');
    }
  },
  audio: {
    transcriptions: {
      create: () => {
        throw new Error('SOVEREIGNTY VIOLATION: OpenAI Whisper disabled. Use local speech processing.');
      }
    },
    speech: {
      create: () => {
        throw new Error('SOVEREIGNTY VIOLATION: OpenAI TTS disabled. Use Sesame or local voice synthesis.');
      }
    }
  }
};
