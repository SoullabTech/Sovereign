/**
 * Development Session Persistence
 *
 * Preserves MAIA's conversation state through hot module replacement (HMR)
 * during active development. Prevents personality degradation when making
 * visual changes that trigger component reloads.
 *
 * USAGE:
 * Add to OracleConversation component:
 *
 * ```typescript
 * const persistedState = useDevSessionPersistence({
 *   messages,
 *   conversationStyle,
 *   userName
 * });
 *
 * // On mount, restore if available
 * useEffect(() => {
 *   if (persistedState) {
 *     setMessages(persistedState.messages);
 *     setConversationStyle(persistedState.conversationStyle);
 *   }
 * }, []);
 * ```
 */

import { useEffect, useRef } from 'react';
import { DEV_MODE } from '@/lib/constants/dev-mode';

interface ConversationState {
  messages: any[];
  conversationStyle: string;
  userName?: string;
  timestamp: number;
}

const STORAGE_KEY = 'dev_maia_session_backup';
const MAX_AGE_MS = 5 * 60 * 1000; // 5 minutes - don't restore very old sessions

/**
 * Hook to persist and restore MAIA conversation state during development
 */
export function useDevSessionPersistence(currentState: {
  messages: any[];
  conversationStyle: string;
  userName?: string;
}) {
  const savedStateRef = useRef<ConversationState | null>(null);
  const hasRestoredRef = useRef(false);

  // Only run in development
  if (!DEV_MODE) {
    return null;
  }

  // On mount: Try to restore previous session
  useEffect(() => {
    if (hasRestoredRef.current) return;

    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const state: ConversationState = JSON.parse(saved);

        // Check if state is recent enough
        const age = Date.now() - state.timestamp;
        if (age < MAX_AGE_MS) {
          console.log('🔄 Restoring MAIA session from before HMR reload');
          console.log(`   - ${state.messages.length} messages`);
          console.log(`   - Style: ${state.conversationStyle}`);
          console.log(`   - Age: ${Math.round(age / 1000)}s`);

          savedStateRef.current = state;
          hasRestoredRef.current = true;
        } else {
          console.log('⏰ Previous MAIA session too old, starting fresh');
          sessionStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch (error) {
      console.error('Failed to restore MAIA session:', error);
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  // Continuously save current state (debounced)
  useEffect(() => {
    // Skip if no messages yet
    if (currentState.messages.length === 0) {
      return;
    }

    // Debounce: Only save every 2 seconds to avoid excessive writes
    const timeoutId = setTimeout(() => {
      try {
        const stateToSave: ConversationState = {
          messages: currentState.messages,
          conversationStyle: currentState.conversationStyle,
          userName: currentState.userName,
          timestamp: Date.now()
        };

        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));

        console.log('💾 Saved MAIA session state (in case of HMR)');
      } catch (error) {
        console.error('Failed to save MAIA session:', error);
      }
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [currentState.messages, currentState.conversationStyle, currentState.userName]);

  // Return saved state on first call (for restoration)
  return savedStateRef.current;
}

/**
 * Clear persisted development session
 * (useful when intentionally starting fresh)
 */
export function clearDevSession() {
  if (!DEV_MODE) return;

  try {
    sessionStorage.removeItem(STORAGE_KEY);
    console.log('🗑️ Cleared dev session backup');
  } catch (error) {
    console.error('Failed to clear dev session:', error);
  }
}
