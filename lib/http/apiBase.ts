/**
 * API Base URL Helper
 *
 * For web: uses relative paths (e.g., /api/journal/quick)
 * For Capacitor/mobile: uses hosted backend URL
 *
 * Set NEXT_PUBLIC_API_BASE_URL for mobile builds:
 *   NEXT_PUBLIC_API_BASE_URL=https://your-domain.com CAPACITOR_BUILD=1 npm run build
 */

/**
 * Get the API base URL - bulletproof for Capacitor
 * Falls back to https://soullab.life if env var didn't inline
 */
export function apiBaseUrl(): string {
  // Next will inline NEXT_PUBLIC_* at build time for client bundles,
  // but if it ends up empty for any reason, we hard-fallback for Capacitor.
  const envBase = (process.env.NEXT_PUBLIC_API_BASE_URL || "").trim();

  // If the env var exists, trust it
  if (envBase) return envBase.replace(/\/+$/, "");

  // Capacitor iOS/Android fallback (prevents relative /api calls breaking)
  const isCapacitor =
    typeof window !== "undefined" &&
    (window as any).Capacitor &&
    (window as any).Capacitor.isNativePlatform?.();

  if (isCapacitor) return "https://soullab.life";

  // Web dev fallback: allow relative in browser
  return "";
}

// Legacy export for backwards compatibility
export const API_BASE = apiBaseUrl();

// [ios-debug] Log the resolved API_BASE at module load
if (typeof window !== 'undefined') {
  console.log('[ios-debug] apiBaseUrl resolved:', apiBaseUrl() || '(relative)');
}

/**
 * Convert a relative API path to full URL for mobile apps
 * @param path - API path like "/api/journal/quick/list"
 * @returns Full URL if in Capacitor, otherwise the original path for web
 */
export function apiUrl(path: string): string {
  const base = apiBaseUrl();
  if (!base) return path; // web relative ok
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Ping health endpoint to test connectivity (iOS debugging)
 * Call from console: window.__pingHealth?.()
 */
export async function pingHealth(): Promise<void> {
  const url = apiUrl('/api/health');
  console.log('[ios-debug] pinging health endpoint:', url);
  try {
    const r = await fetch(url, { method: 'GET', mode: 'cors', credentials: 'include' });
    const t = await r.text();
    console.log('[ios-debug] health response:', r.status, t.slice(0, 200));
    alert(`Health ${r.status}: ${t.slice(0, 200)}`);
  } catch (err) {
    console.error('[ios-debug] health ping failed:', err);
    alert(`Health FAILED: ${String(err)}`);
  }
}

// Expose to window for console debugging
if (typeof window !== 'undefined') {
  (window as any).__pingHealth = pingHealth;
  (window as any).__apiBase = API_BASE;
}

/**
 * UUID validation regex (v4 format)
 */
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Check if a string is a valid UUID
 * Rejects local_* fallback IDs that can't be used with the server
 */
export function isValidUUID(id: string | null | undefined): boolean {
  if (!id) return false;
  return UUID_REGEX.test(id);
}

/**
 * Check if a member ID is valid for server API calls
 * Returns false for local_* fallback IDs
 */
export function isValidMemberId(memberId: string | null | undefined): boolean {
  if (!memberId) return false;
  // Reject local fallback IDs
  if (memberId.startsWith('local_')) {
    console.warn('[auth] Detected local fallback ID - user needs to re-authenticate:', memberId);
    return false;
  }
  return isValidUUID(memberId);
}

/**
 * Get the current member ID from localStorage, or null if invalid
 * Use this before making member API calls
 */
export function getValidMemberId(): string | null {
  if (typeof window === 'undefined') return null;

  try {
    const betaUser = localStorage.getItem('beta_user');
    if (!betaUser) return null;

    const userData = JSON.parse(betaUser);
    const memberId = userData.id || userData.memberId;

    if (!isValidMemberId(memberId)) {
      console.warn('[auth] Invalid member ID in localStorage - clearing poisoned auth state');
      // Clear the poisoned auth state
      localStorage.removeItem('beta_user');
      localStorage.removeItem('explorerId');
      localStorage.removeItem('explorerName');
      localStorage.removeItem('signup_completed');
      return null;
    }

    return memberId;
  } catch {
    return null;
  }
}

/**
 * Check if user needs to re-authenticate (has invalid/local ID)
 */
export function needsReauth(): boolean {
  return getValidMemberId() === null;
}

/**
 * Identity Healing Response
 */
export interface HealedIdentity {
  id: string;
  name: string;
  username: string;
  preferredName?: string;
}

/**
 * Heal identity by fetching canonical values from server
 * Call this on app boot to self-repair bad local state (like local_* IDs)
 *
 * Returns the healed identity or null if healing failed
 */
export async function healIdentity(): Promise<HealedIdentity | null> {
  if (typeof window === 'undefined') return null;

  try {
    // Get current stored ID (even if it's bad, we need it to attempt fetch)
    const betaUser = localStorage.getItem('beta_user');
    if (!betaUser) {
      console.log('[healIdentity] No stored user - nothing to heal');
      return null;
    }

    const userData = JSON.parse(betaUser);
    const storedId = userData.id || userData.memberId;
    const storedUsername = userData.username;

    // If ID is already valid UUID, try to refresh from server anyway
    // If ID is local_*, we need username to look up the real record
    if (!storedId && !storedUsername) {
      console.warn('[healIdentity] No ID or username stored - clearing invalid state');
      clearAuthState();
      return null;
    }

    // Try to fetch profile - prefer username if ID looks bad
    const useUsername = storedId?.startsWith('local_') || !isValidUUID(storedId);
    const queryParam = useUsername && storedUsername
      ? `username=${encodeURIComponent(storedUsername)}`
      : `id=${encodeURIComponent(storedId)}`;

    console.log('[healIdentity] Attempting to heal identity via:', queryParam);

    const response = await fetch(apiUrl(`/api/members/profile?${queryParam}`), {
      method: 'GET',
      mode: 'cors',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.warn('[healIdentity] Server rejected identity:', response.status, errorData);

      if (errorData.needsReauth || response.status === 404) {
        clearAuthState();
      }
      return null;
    }

    const profile = await response.json();

    if (!profile.id || !isValidUUID(profile.id)) {
      console.warn('[healIdentity] Server returned invalid profile:', profile);
      return null;
    }

    // Success! Update local storage with canonical server values
    const healedData = {
      ...userData,
      id: profile.id,
      memberId: profile.id,
      name: profile.name || profile.preferredName || userData.name,
      username: profile.username || userData.username,
      preferredName: profile.preferredName,
      email: profile.email,
      onboarded: profile.onboarded,
    };

    localStorage.setItem('beta_user', JSON.stringify(healedData));

    // Also update legacy keys that other parts of the app might read
    localStorage.setItem('explorerId', profile.id);
    if (profile.name || profile.preferredName) {
      localStorage.setItem('explorerName', profile.preferredName || profile.name);
    }

    console.log('[healIdentity] Identity healed successfully:', {
      id: profile.id,
      name: profile.name,
      username: profile.username,
    });

    return {
      id: profile.id,
      name: profile.name || profile.preferredName || '',
      username: profile.username || '',
      preferredName: profile.preferredName,
    };
  } catch (error) {
    console.error('[healIdentity] Failed to heal identity:', error);
    return null;
  }
}

/**
 * Clear all auth-related local storage (for poisoned states)
 */
export function clearAuthState(): void {
  if (typeof window === 'undefined') return;

  console.warn('[auth] Clearing poisoned auth state');
  localStorage.removeItem('beta_user');
  localStorage.removeItem('explorerId');
  localStorage.removeItem('explorerName');
  localStorage.removeItem('signup_completed');
  localStorage.removeItem('maia_session_version');
}

// Expose healIdentity for console debugging
if (typeof window !== 'undefined') {
  (window as any).__healIdentity = healIdentity;
  (window as any).__clearAuthState = clearAuthState;
}
