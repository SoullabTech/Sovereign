/**
 * API Base URL Helper
 *
 * For web: uses relative paths (e.g., /api/journal/quick)
 * For Capacitor/mobile: uses hosted backend URL
 *
 * Set NEXT_PUBLIC_API_BASE_URL for mobile builds:
 *   NEXT_PUBLIC_API_BASE_URL=https://your-domain.com CAPACITOR_BUILD=1 npm run build
 */

// Hard fallback for iOS/Capacitor - NEVER use relative /api on mobile
const FALLBACK_API_BASE_URL = 'https://soullab.life';

// Build information stamp - populated during build or defaults
export const BUILD_STAMP = {
  commit: process.env.NEXT_PUBLIC_GIT_COMMIT || 'dev',
  timestamp: process.env.NEXT_PUBLIC_BUILD_TIME || new Date().toISOString(),
  version: process.env.NEXT_PUBLIC_VERSION || '1.1.0',
};

/**
 * Get the API base URL - bulletproof for Capacitor
 * Falls back to https://soullab.life if env var didn't inline
 *
 * CRITICAL: On iOS/Capacitor static builds, /api routes don't exist locally.
 * We MUST detect iOS and force the real API URL, even if Capacitor.isNativePlatform() lies.
 */
export function apiBaseUrl(): string {
  const env = (process.env.NEXT_PUBLIC_API_BASE_URL || "").trim();

  // If env is set, always trust it.
  if (env) return env.replace(/\/+$/, "");

  // LOCAL DEVELOPMENT: Use relative paths (same-origin) for localhost
  // This prevents cross-origin cookie issues when running dev server locally
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return ''; // Same-origin API calls
    }
  }

  // Absolute fallback (do NOT allow empty)
  // This ensures iOS, Capacitor, and any edge case always gets the real API
  return "https://soullab.life";
}

// Legacy export for backwards compatibility
export const API_BASE = apiBaseUrl();

// Log the resolved API_BASE at module load
if (typeof window !== 'undefined') {
  console.log('[apiBase] loaded, base:', apiBaseUrl());
}

/**
 * Convert a relative API path to full URL for mobile apps
 * @param path - API path like "/api/journal/quick/list"
 * @returns Full URL if in Capacitor, otherwise the original path for web
 */
export function apiUrl(path: string): string {
  const base = apiBaseUrl().replace(/\/+$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
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
    // Fast path: check direct memberId key first (set by storeSession)
    const directId = localStorage.getItem('memberId');
    if (directId && isValidMemberId(directId)) {
      return directId;
    }

    // Also check explorerId (legacy key)
    const explorerId = localStorage.getItem('explorerId');
    if (explorerId && isValidMemberId(explorerId)) {
      return explorerId;
    }

    // Fall back to beta_user JSON
    const betaUser = localStorage.getItem('beta_user');
    if (!betaUser) return null;

    const userData = JSON.parse(betaUser);
    const memberId = userData.id || userData.memberId;

    if (!isValidMemberId(memberId)) {
      console.warn('[auth] Invalid member ID in localStorage - clearing poisoned auth state');
      // Clear the poisoned auth state
      localStorage.removeItem('beta_user');
      localStorage.removeItem('explorerId');
      localStorage.removeItem('memberId');
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
  localStorage.removeItem('memberId');
  localStorage.removeItem('explorerId');
  localStorage.removeItem('explorerName');
  localStorage.removeItem('signup_completed');
  localStorage.removeItem('maia_session_version');
  localStorage.removeItem('maia_session_token'); // Safari/iOS header-based auth
}

// Expose healIdentity for console debugging
if (typeof window !== 'undefined') {
  (window as any).__healIdentity = healIdentity;
  (window as any).__clearAuthState = clearAuthState;
}

/**
 * Check if we're running in a native Capacitor environment
 * Uses multiple detection methods because Capacitor.isNativePlatform() can lie
 */
export function isNativeCapacitor(): boolean {
  if (typeof window === 'undefined') return false;

  // Check 1: Capacitor global exists and says native
  const hasCapacitorNative =
    (window as any).Capacitor &&
    (window as any).Capacitor.isNativePlatform?.();

  if (hasCapacitorNative) return true;

  // Check 2: iOS user agent (WKWebView) - THIS IS SUFFICIENT for iOS detection
  // Even without Capacitor global (e.g., loading from web server in WKWebView)
  const isIOSUserAgent =
    typeof navigator !== 'undefined' &&
    /iPhone|iPad|iPod/i.test(navigator.userAgent);

  // iOS user agent alone means we're on iOS - treat as native for API purposes
  // This ensures apiFetch uses the correct API base even when Capacitor JS isn't loaded
  if (isIOSUserAgent) {
    console.log('[isNativeCapacitor] iOS detected via user agent');
    return true;
  }

  // Check 3: URL indicates we're in a Capacitor context
  const isCapacitorScheme =
    window.location.protocol === 'capacitor:' ||
    window.location.protocol === 'ionic:';

  if (isCapacitorScheme) {
    console.log('[isNativeCapacitor] Capacitor scheme detected');
    return true;
  }

  return false;
}

/**
 * Check if browser is Safari (needs header-based auth due to ITP)
 * Safari blocks cookies in cross-origin and third-party contexts
 */
export function isSafari(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;

  const ua = navigator.userAgent;
  // Safari but not Chrome (Chrome on iOS reports Safari in UA)
  const isSafariBrowser = /Safari/i.test(ua) && !/Chrome|CriOS|Chromium/i.test(ua);
  // Also check for iOS WebView (WKWebView) which has same cookie restrictions
  const isIOSWebView = /iPhone|iPad|iPod/i.test(ua) && !/Safari/i.test(ua);

  return isSafariBrowser || isIOSWebView;
}

/**
 * Get session token from localStorage (for header-based auth)
 */
function getSessionToken(): string | null {
  if (typeof window === 'undefined') return null;

  try {
    // Check for session token (set during signin)
    const sessionToken = localStorage.getItem('maia_session_token');
    if (sessionToken) return sessionToken;

    return null;
  } catch {
    return null;
  }
}

/**
 * Enhanced fetch for API calls - handles Safari ITP cookie blocking
 *
 * For Safari/iOS (cookies blocked by ITP):
 * - Adds x-session-token header from localStorage
 * - Falls back to x-member-id if no session token
 *
 * For other browsers:
 * - Uses standard fetch with credentials: 'include'
 *
 * For Capacitor/iOS native:
 * - Uses CapacitorHttp with x-member-id header
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
  console.log('[apiFetch]', options.method || 'GET', url);

  // Check if we need header-based auth (Safari or iOS)
  const needsHeaderAuth = isSafari() || isNativeCapacitor();

  if (needsHeaderAuth) {
    return apiFetchWithHeaders(url, options);
  }

  // Standard web fetch with cookies
  return apiFetchWeb(url, options);
}

/**
 * Fetch with header-based authentication (for Safari/iOS)
 * Adds session token or member ID to headers when cookies won't work
 */
async function apiFetchWithHeaders(url: string, options: RequestInit): Promise<Response> {
  const headers = new Headers(options.headers);

  // Debug: log resolved URL for iOS verification
  console.log('[apiFetch/safari] Resolved URL:', url);

  // Ensure Content-Type is set for requests with body
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  // Add session token header (required for server-side validation)
  const sessionToken = getSessionToken();
  if (sessionToken) {
    headers.set('x-session-token', sessionToken);
    console.log('[apiFetch/safari] x-session-token present:', true);
  } else {
    // No session token - auth will fail on protected endpoints
    // x-member-id alone is no longer accepted (security fix)
    console.warn('[apiFetch/safari] x-session-token present:', false, '- user may need to re-authenticate');
  }

  return fetch(url, {
    ...options,
    headers,
    credentials: 'include', // Still try cookies, but headers are the real auth
    mode: 'cors',
  });
}

/**
 * Native Capacitor implementation using CapacitorHttp
 * This bypasses the fetch interceptor and uses native iOS/Android networking
 * Note: Currently unused - apiFetchWithHeaders handles both Safari and native
 */
async function apiFetchNative(
  url: string,
  method: string,
  options: RequestInit
): Promise<Response> {
  // Dynamic import to avoid loading Capacitor on web
  const { CapacitorHttp } = await import('@capacitor/core');

  // Build headers object - only set Content-Type when there's a body
  const headers: Record<string, string> = {};
  if (options.body) {
    headers['Content-Type'] = 'application/json';
  }

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

  // Add session token header (required for server-side validation)
  const sessionToken = getSessionToken();
  if (sessionToken) {
    headers['x-session-token'] = sessionToken;
    console.log('[apiFetch/native] Using CapacitorHttp with x-session-token');
  } else {
    // No session token - auth will fail on protected endpoints
    // x-member-id alone is no longer accepted (security fix)
    console.warn('[apiFetch/native] No session token - user may need to re-authenticate');
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
