// Stable Explorer Identity - persists across sessions for memory continuity
// This ID is used to key conversation_turns in the database

import { generateUUID } from '@/lib/utils/uuid';

export const EXPLORER_ID_KEY = 'maia-explorer-id';

export function getOrCreateExplorerId(): string {
  if (typeof window === 'undefined') return '';

  // Check all identity sources in priority order:
  // 1. Authenticated member ID from sign-in (most authoritative)
  // 2. Legacy beta user ID
  // 3. Previously generated maia-explorer-id
  // 4. Generate new UUID as last resort
  let id = localStorage.getItem('explorerId')
        || localStorage.getItem('betaUserId')
        || localStorage.getItem(EXPLORER_ID_KEY);

  if (!id) {
    // UUID is perfect here (works with uuid DB columns, and is stable)
    id = generateUUID();
  }

  // Always sync to maia-explorer-id for consistency
  localStorage.setItem(EXPLORER_ID_KEY, id);
  return id;
}

/**
 * Check if an explorer ID exists without creating one
 */
export function hasExplorerId(): boolean {
  if (typeof window === 'undefined') return false;
  return !!(localStorage.getItem('explorerId')
         || localStorage.getItem('betaUserId')
         || localStorage.getItem(EXPLORER_ID_KEY));
}

/**
 * Clear the explorer ID (use with caution - breaks cross-session memory)
 */
export function clearExplorerId(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(EXPLORER_ID_KEY);
}
