// Stable Explorer Identity - persists across sessions for memory continuity
// This ID is used to key conversation_turns in the database

import { generateUUID } from '@/lib/utils/uuid';

export const EXPLORER_ID_KEY = 'maia-explorer-id';

export function getOrCreateExplorerId(): string {
  if (typeof window === 'undefined') return '';

  let id = localStorage.getItem(EXPLORER_ID_KEY);
  if (!id) {
    // UUID is perfect here (works with uuid DB columns, and is stable)
    id = generateUUID();
    localStorage.setItem(EXPLORER_ID_KEY, id);
  }
  return id;
}

/**
 * Check if an explorer ID exists without creating one
 */
export function hasExplorerId(): boolean {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem(EXPLORER_ID_KEY);
}

/**
 * Clear the explorer ID (use with caution - breaks cross-session memory)
 */
export function clearExplorerId(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(EXPLORER_ID_KEY);
}
