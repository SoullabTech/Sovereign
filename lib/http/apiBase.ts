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
  const url = '/api/health';
  console.log('[ios-debug] pinging health endpoint:', apiUrl(url));
  try {
    // Use apiFetch for consistent behavior on native
    const r = await apiFetch(url, { method: 'GET' });
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

    // Use apiFetch for consistent auth handling (adds x-member-id on native)
    const response = await apiFetch(`/api/members/profile?${queryParam}`, {
      method: 'GET',
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

/**
 * Check if we're running in a native Capacitor environment
 */
export function isNativeCapacitor(): boolean {
  return (
    typeof window !== 'undefined' &&
    (window as any).Capacitor &&
    (window as any).Capacitor.isNativePlatform?.()
  );
}

/**
 * Enhanced fetch for API calls - uses CapacitorHttp on native platforms
 *
 * For Capacitor/iOS apps:
 * - Uses CapacitorHttp directly to bypass Capacitor's fetch interceptor
 * - Always adds x-member-id header for auth (cookies don't work cross-origin)
 *
 * For web:
 * - Uses standard fetch with credentials: 'include'
 *
 * Usage:
 *   import { apiFetch } from '@/lib/http/apiBase';
 *   const response = await apiFetch('/api/sovereign/app/maia', {
 *     method: 'POST',
 *     body: JSON.stringify({ message: 'hello' }),
 *   });
 */
export async function apiFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = apiUrl(path);
  const method = (options.method || 'GET').toUpperCase();

  // For native Capacitor: use CapacitorHttp directly (bypasses fetch interceptor)
  if (isNativeCapacitor()) {
    return apiFetchNative(url, method, options);
  }

  // For web: use standard fetch
  return apiFetchWeb(url, options);
}

/**
 * Native Capacitor implementation using CapacitorHttp
 * This bypasses the fetch interceptor and uses native iOS/Android networking
 */
async function apiFetchNative(
  url: string,
  method: string,
  options: RequestInit
): Promise<Response> {
  // Dynamic import to avoid loading Capacitor on web
  const { CapacitorHttp } = await import('@capacitor/core');

  // Build headers object
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Copy existing headers
  if (options.headers) {
    const existingHeaders = options.headers as HeadersInit;
    if (existingHeaders instanceof Headers) {
      existingHeaders.forEach((value, key) => {
        headers[key] = value;
      });
    } else if (Array.isArray(existingHeaders)) {
      existingHeaders.forEach(([key, value]) => {
        headers[key] = value;
      });
    } else {
      Object.entries(existingHeaders).forEach(([key, value]) => {
        if (value) headers[key] = value;
      });
    }
  }

  // ALWAYS add x-member-id for Capacitor (cookies don't work cross-origin)
  const memberId = getValidMemberId();
  if (memberId) {
    headers['x-member-id'] = memberId;
    console.log('[apiFetch/native] Using CapacitorHttp with x-member-id:', memberId.slice(0, 8) + '...');
  } else {
    console.warn('[apiFetch/native] No valid member ID - auth may fail. URL:', url);
  }

  // Parse body if it's a string (likely JSON)
  let data: any = undefined;
  if (options.body) {
    if (typeof options.body === 'string') {
      try {
        data = JSON.parse(options.body);
      } catch {
        data = options.body;
      }
    } else {
      data = options.body;
    }
  }

  console.log(`[apiFetch/native] ${method} ${url}`);

  try {
    let nativeResponse;

    // CapacitorHttp has different methods for different HTTP verbs
    const requestOptions = {
      url,
      headers,
      data,
    };

    switch (method) {
      case 'GET':
        nativeResponse = await CapacitorHttp.get(requestOptions);
        break;
      case 'POST':
        nativeResponse = await CapacitorHttp.post(requestOptions);
        break;
      case 'PUT':
        nativeResponse = await CapacitorHttp.put(requestOptions);
        break;
      case 'PATCH':
        nativeResponse = await CapacitorHttp.patch(requestOptions);
        break;
      case 'DELETE':
        nativeResponse = await CapacitorHttp.delete(requestOptions);
        break;
      default:
        nativeResponse = await CapacitorHttp.request({ ...requestOptions, method });
    }

    console.log(`[apiFetch/native] Response status: ${nativeResponse.status}`);

    // Convert CapacitorHttp response to standard Response object
    // CapacitorHttp returns { status, headers, data }
    const responseBody = typeof nativeResponse.data === 'string'
      ? nativeResponse.data
      : JSON.stringify(nativeResponse.data);

    return new Response(responseBody, {
      status: nativeResponse.status,
      statusText: nativeResponse.status >= 200 && nativeResponse.status < 300 ? 'OK' : 'Error',
      headers: new Headers(nativeResponse.headers || {}),
    });
  } catch (error) {
    console.error('[apiFetch/native] Request failed:', error);
    // Return a Response-like error so callers can handle it consistently
    return new Response(JSON.stringify({ error: 'Network request failed', details: String(error) }), {
      status: 0,
      statusText: 'Network Error',
    });
  }
}

/**
 * Web implementation using standard fetch
 */
async function apiFetchWeb(url: string, options: RequestInit): Promise<Response> {
  // Build headers - start with existing headers
  const headers = new Headers(options.headers);

  // Ensure Content-Type is set for POST/PUT requests with body
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  return fetch(url, {
    ...options,
    headers,
    credentials: 'include',
    mode: 'cors',
  });
}

// Expose apiFetch for console debugging
if (typeof window !== 'undefined') {
  (window as any).__apiFetch = apiFetch;
}
