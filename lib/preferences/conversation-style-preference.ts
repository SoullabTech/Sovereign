/**
 * User preference management for conversation style
 * Stores locally for now, can be moved to database later
 */

import { ConversationMode, DEFAULT_CONVERSATION_STYLE } from '@/lib/types/conversation-style';

const STORAGE_KEY = 'maya_conversation_style';

export class ConversationStylePreference {
  /**
   * Get the user's preferred conversation style
   */
  static get(): ConversationMode {
    if (typeof window === 'undefined') {
      return DEFAULT_CONVERSATION_STYLE;
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && ['her', 'classic', 'adaptive'].includes(stored)) {
        return stored as ConversationMode;
      }
    } catch (error) {
      console.warn('Could not read conversation style preference:', error);
    }

    return DEFAULT_CONVERSATION_STYLE;
  }

  /**
   * Set the user's preferred conversation style
   */
  static set(mode: ConversationMode): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch (error) {
      console.error('Could not save conversation style preference:', error);
    }
  }

  /**
   * Clear the preference (revert to default)
   */
  static clear(): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Could not clear conversation style preference:', error);
    }
  }
}