/**
 * Identity Healing System
 *
 * Syncs client-side identity cache with server truth on app startup.
 * Prevents the "local_..." death spiral where bad client state cascades into 500s.
 *
 * Usage:
 *   - Call healIdentity() on app startup, before Settings loads
 *   - Call healIdentity() after any auth action (sign in, sign out)
 *   - Call healIdentity() when recovering from errors
 */

import { EXPLORER_ID_KEY } from './explorerId';

export type HealResult =
  | { status: 'healed'; memberId: string; changes: string[] }
  | { status: 'healthy'; memberId: string }
  | { status: 'offline'; reason: string }
  | { status: 'reauth_required'; reason: string }
  | { status: 'error'; reason: string; correlationId?: string };

interface MemberData {
  id: string;
  username: string;
  name: string | null;
  preferredName: string | null;
  email: string | null;
  onboarded: boolean;
  onboardingStep: string | null;
  circleTier: string;
}

interface MeResponse {
  success?: boolean;
  correlationId?: string;
  action?: 'sync' | 'reauth' | 'clear_and_reauth' | 'retry';
  member?: MemberData;
  error?: string;
  code?: string;
  reason?: string;
  retryAfter?: number;
}

/**
 * Get the best available identity from local storage
 */
function getLocalIdentity(): { id: string | null; source: string } {
  if (typeof window === 'undefined') {
    return { id: null, source: 'ssr' };
  }

  // Priority 1: Direct explorerId
  const explorerId = localStorage.getItem('explorerId');
  if (explorerId && !explorerId.startsWith('local_')) {
    return { id: explorerId, source: 'explorerId' };
  }

  // Priority 2: beta_user.id
  const betaUser = localStorage.getItem('beta_user');
  if (betaUser) {
    try {
      const userData = JSON.parse(betaUser);
      if (userData.id && !userData.id.startsWith('local_')) {
        return { id: userData.id, source: 'beta_user' };
      }
    } catch {
      // Invalid JSON, continue
    }
  }

  // Priority 3: maia-explorer-id
  const maiaExplorerId = localStorage.getItem(EXPLORER_ID_KEY);
  if (maiaExplorerId && !maiaExplorerId.startsWith('local_')) {
    return { id: maiaExplorerId, source: EXPLORER_ID_KEY };
  }

  // No valid identity
  return { id: null, source: 'none' };
}

/**
 * Sync local storage with canonical server data
 */
function syncLocalStorage(member: MemberData): string[] {
  const changes: string[] = [];

  // Update explorerId
  const currentExplorerId = localStorage.getItem('explorerId');
  if (currentExplorerId !== member.id) {
    localStorage.setItem('explorerId', member.id);
    changes.push(`explorerId: ${currentExplorerId} -> ${member.id}`);
  }

  // Update maia-explorer-id
  const currentMaiaId = localStorage.getItem(EXPLORER_ID_KEY);
  if (currentMaiaId !== member.id) {
    localStorage.setItem(EXPLORER_ID_KEY, member.id);
    changes.push(`${EXPLORER_ID_KEY}: ${currentMaiaId} -> ${member.id}`);
  }

  // Update beta_user
  const currentBetaUser = localStorage.getItem('beta_user');
  let betaUserData: Record<string, unknown> = {};
  if (currentBetaUser) {
    try {
      betaUserData = JSON.parse(currentBetaUser);
    } catch {
      // Invalid JSON, will be overwritten
    }
  }

  const newBetaUser = {
    ...betaUserData,
    id: member.id,
    username: member.username,
    name: member.name || betaUserData.name,
    preferredName: member.preferredName || betaUserData.preferredName,
    onboarded: member.onboarded,
  };

  const newBetaUserStr = JSON.stringify(newBetaUser);
  if (currentBetaUser !== newBetaUserStr) {
    localStorage.setItem('beta_user', newBetaUserStr);
    changes.push('beta_user: synced with server');
  }

  // Clean up legacy keys if they have wrong values
  const betaUserId = localStorage.getItem('betaUserId');
  if (betaUserId && betaUserId !== member.id) {
    localStorage.setItem('betaUserId', member.id);
    changes.push(`betaUserId: ${betaUserId} -> ${member.id}`);
  }

  return changes;
}

/**
 * Clear all identity-related local storage
 */
export function clearIdentityCache(): void {
  if (typeof window === 'undefined') return;

  const keys = [
    'explorerId',
    'explorerName',
    EXPLORER_ID_KEY,
    'beta_user',
    'betaUserId',
    'maia_session',
  ];

  keys.forEach(key => localStorage.removeItem(key));
  console.log('[Identity] Cache cleared');
}

/**
 * Heal identity by syncing with server truth
 *
 * Call this:
 *   - On app startup (before Settings loads)
 *   - After sign in/out
 *   - When recovering from errors
 *
 * @param options.timeout - Request timeout in ms (default: 5000)
 * @param options.retries - Number of retries on network failure (default: 1)
 */
export async function healIdentity(options?: {
  timeout?: number;
  retries?: number;
}): Promise<HealResult> {
  const { timeout = 5000, retries = 1 } = options || {};

  if (typeof window === 'undefined') {
    return { status: 'offline', reason: 'Server-side rendering' };
  }

  const { id: localId, source } = getLocalIdentity();

  if (!localId) {
    // No identity to heal - user needs to authenticate
    return { status: 'reauth_required', reason: 'No local identity found' };
  }

  console.log(`[Identity] Healing from ${source}: ${localId.substring(0, 8)}...`);

  let lastError: Error | null = null;
  let attempt = 0;

  while (attempt <= retries) {
    attempt++;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(`/api/members/me?id=${encodeURIComponent(localId)}`, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        },
      });

      clearTimeout(timeoutId);

      const data: MeResponse = await response.json();

      // Handle response based on status code
      if (response.ok && data.success && data.member) {
        // Success - sync local storage
        const changes = syncLocalStorage(data.member);

        if (changes.length > 0) {
          console.log('[Identity] Healed with changes:', changes);
          return {
            status: 'healed',
            memberId: data.member.id,
            changes,
          };
        } else {
          console.log('[Identity] Already healthy');
          return {
            status: 'healthy',
            memberId: data.member.id,
          };
        }
      }

      // Handle specific error codes
      switch (data.action) {
        case 'reauth':
        case 'clear_and_reauth':
          // Server says identity is invalid - clear and require re-auth
          console.warn(`[Identity] Server rejected identity: ${data.reason}`);
          clearIdentityCache();
          return {
            status: 'reauth_required',
            reason: data.reason || 'Identity rejected by server',
          };

        case 'retry':
          // Service unavailable - continue to retry logic
          if (data.retryAfter && attempt <= retries) {
            await new Promise(resolve => setTimeout(resolve, data.retryAfter));
            continue;
          }
          return {
            status: 'offline',
            reason: data.error || 'Service unavailable',
          };

        default:
          // Unknown error
          return {
            status: 'error',
            reason: data.error || `HTTP ${response.status}`,
            correlationId: data.correlationId,
          };
      }
    } catch (error) {
      lastError = error as Error;

      if ((error as Error).name === 'AbortError') {
        console.warn(`[Identity] Request timeout (attempt ${attempt})`);
      } else {
        console.warn(`[Identity] Network error (attempt ${attempt}):`, error);
      }

      // Retry if we have attempts left
      if (attempt <= retries) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        continue;
      }
    }
  }

  // All retries exhausted - run in offline mode
  return {
    status: 'offline',
    reason: lastError?.message || 'Network unavailable',
  };
}

/**
 * Check if we need to heal (has potentially stale identity)
 */
export function needsHealing(): boolean {
  if (typeof window === 'undefined') return false;

  const { id } = getLocalIdentity();
  if (!id) return true;

  // Check for known bad patterns
  if (id.startsWith('local_')) return true;
  if (id.startsWith('guest_')) return true;
  if (id === 'guest' || id === 'anonymous') return true;

  // Check if beta_user is out of sync with explorerId
  const explorerId = localStorage.getItem('explorerId');
  const betaUser = localStorage.getItem('beta_user');
  if (betaUser && explorerId) {
    try {
      const userData = JSON.parse(betaUser);
      if (userData.id !== explorerId) return true;
    } catch {
      return true; // Invalid JSON
    }
  }

  return false;
}
