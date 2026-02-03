// Stable Explorer Identity - persists across sessions for memory continuity
// This ID is used to key conversation_turns in the database

import { generateUUID } from '@/lib/utils/uuid';

export const EXPLORER_ID_KEY = 'maia-explorer-id';

// UUID format regex (8-4-4-4-12 hex pattern, any version)
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Check if an ID is a valid member identifier (must be UUID, not placeholder)
function isValidMemberId(id: string | null): boolean {
  if (!id) return false;
  // Filter out placeholder/guest IDs
  if (id === 'guest' || id.startsWith('guest_') || id === 'anonymous') return false;
  // Must be a valid UUID (prevents "test-user-123" or legacy string IDs)
  return UUID_REGEX.test(id);
}

export function getOrCreateExplorerId(): string {
  if (typeof window === 'undefined') return '';

  // Check all identity sources in priority order:
  // 1. Authenticated member ID from sign-in (most authoritative)
  // 2. Member ID from beta_user JSON (auth system)
  // 3. Legacy beta user ID
  // 4. Previously generated maia-explorer-id
  // 5. Generate new UUID as last resort

  // Priority 1: Direct explorerId (if it's a real member ID, not "guest")
  const explorerId = localStorage.getItem('explorerId');
  if (isValidMemberId(explorerId)) {
    localStorage.setItem(EXPLORER_ID_KEY, explorerId!);
    return explorerId!;
  }

  // Priority 2: Extract from beta_user JSON (contains authenticated member data)
  const betaUser = localStorage.getItem('beta_user');
  if (betaUser) {
    try {
      const userData = JSON.parse(betaUser);
      if (isValidMemberId(userData.id)) {
        // Sync the valid ID to explorerId for future lookups
        localStorage.setItem('explorerId', userData.id);
        localStorage.setItem(EXPLORER_ID_KEY, userData.id);
        console.log('🔄 [Identity] Synced member ID from beta_user:', userData.id);
        return userData.id;
      }
    } catch (e) {
      // Invalid JSON, continue
    }
  }

  // Priority 3: Legacy betaUserId
  const betaUserId = localStorage.getItem('betaUserId');
  if (isValidMemberId(betaUserId)) {
    localStorage.setItem(EXPLORER_ID_KEY, betaUserId!);
    return betaUserId!;
  }

  // Priority 4: Previously generated maia-explorer-id
  const maiaExplorerId = localStorage.getItem(EXPLORER_ID_KEY);
  if (isValidMemberId(maiaExplorerId)) {
    return maiaExplorerId!;
  }

  // Priority 5: Generate new UUID as last resort
  const newId = generateUUID();
  localStorage.setItem(EXPLORER_ID_KEY, newId);
  return newId;
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
