/**
 * API Base URL Helper
 *
 * For web: uses relative paths (e.g., /api/journal/quick)
 * For Capacitor/mobile: uses hosted backend URL
 *
 * Set NEXT_PUBLIC_API_BASE_URL for mobile builds:
 *   NEXT_PUBLIC_API_BASE_URL=https://your-domain.com CAPACITOR_BUILD=1 npm run build
 */

import { withTimeout } from '@/lib/utils/withTimeout';
import { pushVoiceDebug } from '@/lib/voice/voiceDebugBus';

// Hard fallback for iOS/Capacitor - NEVER use relative /api on mobile
const FALLBACK_API_BASE_URL = 'https://soullab.life';

// Endpoints whose auth outcome is surfaced to the on-device VOICE TRACE overlay
// (not just console) so a single Keep/Capture tap tells us whether the request
// carried the member ID and session token. Native device walk, 2026-07-27.
const AUTH_TRACE_PATHS = [
  '/api/sovereign/episodes/mark',
  '/api/capsules/from-chat-window',
  '/api/psyche/conversational-keep',
];

// Hard ceiling for native HTTP requests. Capacitor's URLSession defaults are
// generous (60s connect / 60s data on iOS); this explicit cap ensures a
// silently stalled native bridge surfaces a labeled timeout instead of
// trapping the WebView in "thinking" forever.
const NATIVE_HTTP_TIMEOUT_MS = 30_000;

// Build identity — inlined at BUILD TIME by next.config.js (NEXT_PUBLIC_BUILD_*).
// Truthful by construction: an un-inlined value reads 'UNSTAMPED', never a
// fabricated 'dev' SHA and never a runtime `new Date()` (which would report the
// moment the page was opened, not the moment the build was produced). An
// unstamped build must LOOK unstamped. The commit/timestamp/version keys are
// retained for the existing AccountSettings consumer.
const UNSTAMPED = 'UNSTAMPED';
export const BUILD_STAMP = {
  commit: process.env.NEXT_PUBLIC_BUILD_SHA || UNSTAMPED,
  branch: process.env.NEXT_PUBLIC_BUILD_BRANCH || UNSTAMPED,
  // Full ISO timestamp captured when the build / dev-server started — NOT per-request.
  timestamp: process.env.NEXT_PUBLIC_BUILD_TIME || UNSTAMPED,
  buildMode: process.env.NEXT_PUBLIC_BUILD_MODE || UNSTAMPED,
  version: process.env.NEXT_PUBLIC_VERSION || '1.1.0',
  // The API target explicitly pinned at build time. 'UNSET' means the build did
  // not pin a target and apiBaseUrl() will use its runtime fallback — the
  // diagnostics surface (/diag) flags this loudly.
  apiTargetDeclared: process.env.NEXT_PUBLIC_API_BASE_URL || 'UNSET',
} as const;

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

  // Native platform check — MUST come before protocol/hostname checks.
  // Android Capacitor presents window.location as `https://localhost` (with
  // androidScheme=https), which slips through the protocol-based detection
  // below and falls into the localhost dev-server branch. iOS Capacitor
  // presents `capacitor://localhost` so the protocol check catches it.
  // Without this guard, Android API calls go to https://localhost/api/*
  // and hit Capacitor's WebViewLocalServer, which returns the SPA fallback
  // HTML — causing res.json() to fail with "Unexpected token '<'".
  // Surfaced by Tara on Samsung tablet 2026-05-14.
  if (typeof window !== 'undefined') {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { Capacitor } = require('@capacitor/core');
      if (Capacitor?.isNativePlatform?.()) {
        console.log('[apiBaseUrl] Capacitor native platform — using soullab.life');
        return "https://soullab.life";
      }
    } catch {
      // @capacitor/core not available (web build) — fall through to heuristics
    }
  }

  // LOCAL DEVELOPMENT: Use relative paths (same-origin) for localhost
  // This prevents cross-origin cookie issues when running dev server locally
  // BUT: Capacitor uses capacitor://localhost which has hostname="localhost"
  // so we must check the protocol first
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;

    // Capacitor/native uses capacitor:// or ionic:// or file:// protocol
    // These MUST use absolute URLs to the real API server
    // (Retained as fallback in case @capacitor/core can't be loaded above.)
    if (protocol === 'capacitor:' || protocol === 'ionic:' || protocol === 'file:') {
      console.log('[apiBaseUrl] Native protocol detected:', protocol, '- using soullab.life');
      return "https://soullab.life";
    }

    // Only use relative paths for actual localhost dev server (http:// or https://)
    if ((protocol === 'http:' || protocol === 'https:') &&
        (hostname === 'localhost' || hostname === '127.0.0.1')) {
      return ''; // Same-origin API calls for local dev
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
    const displayName = (profile.preferredName || profile.name || '').trim();
    if (displayName) {
      localStorage.setItem('explorerName', displayName);
      // CRITICAL: Also set explorerPreferredName — getInitialUserData() checks this first
      localStorage.setItem('explorerPreferredName', displayName);
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
 *
 * IMPORTANT: This must be exhaustive. Any leftover identity key can
 * trigger rehydration loops where the app thinks the user is still signed in.
 */
export function clearAuthState(): void {
  if (typeof window === 'undefined') return;

  console.warn('[auth] Clearing auth state for clean signout');

  // Primary session
  localStorage.removeItem('beta_user');
  localStorage.removeItem('beta_users'); // Legacy plaintext store

  // Member identity
  localStorage.removeItem('memberId');
  localStorage.removeItem('soullab_member');
  localStorage.removeItem('member_profile');

  // Explorer identity (all variants)
  localStorage.removeItem('explorerId');
  localStorage.removeItem('explorerName');
  localStorage.removeItem('explorerPreferredName');

  // Onboarding state
  localStorage.removeItem('betaOnboardingComplete');
  localStorage.removeItem('signup_completed');

  // Session markers
  localStorage.removeItem('maia_session_version');
  localStorage.removeItem('maia_session_token'); // Safari/iOS header-based auth
  localStorage.removeItem('maia_session_id');
  localStorage.removeItem('maia_session_date');

  // Ownership of the cached defaultMemoryMode ends with the session. The
  // cached settings themselves are left alone (device-local voice/display
  // prefs); only the claim that they belong to a member is withdrawn, so the
  // next member must re-prove it via server hydration (SANCTUARY-MEMBER-SCOPE-01).
  localStorage.removeItem('maia_account_settings_owner');
}

// Expose healIdentity for console debugging
if (typeof window !== 'undefined') {
  (window as any).__healIdentity = healIdentity;
  (window as any).__clearAuthState = clearAuthState;
}

/**
 * Check if we're running in a native Capacitor environment
 *
 * IMPORTANT: Do NOT use user agent detection here - it can't distinguish
 * Safari PWA users from WKWebView in a native app. Safari users visiting
 * soullab.life should be treated as web users, not native.
 *
 * For Safari ITP cookie issues, use isSafari() instead (separate concern).
 */
export function isNativeCapacitor(): boolean {
  if (typeof window === 'undefined') return false;

  // Check 1: Capacitor.isNativePlatform() is the authoritative check
  // Only returns true when running inside an actual native Capacitor app
  const cap = (window as any).Capacitor;
  if (cap && typeof cap.isNativePlatform === 'function' && cap.isNativePlatform()) {
    return true;
  }

  // Check 2: URL scheme indicates Capacitor context (file:// in WKWebView, capacitor://, ionic://)
  const protocol = window.location.protocol;
  if (protocol === 'capacitor:' || protocol === 'ionic:' || protocol === 'file:') {
    console.log('[isNativeCapacitor] Native scheme detected:', protocol);
    return true;
  }

  // NOT native - this includes Safari PWA users on iOS
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
 * Get or create a stable visitor ID for anonymous usage tracking.
 * This ID persists in localStorage so Free tier limits actually accumulate.
 *
 * Format: anon_<8-char-uuid> (stable across requests for the same browser/device)
 */
const VISITOR_ID_KEY = 'maia_visitor_id';

export function getOrCreateVisitorId(): string {
  if (typeof window === 'undefined') {
    // Server-side: return a placeholder that backend will ignore
    return 'server_render';
  }

  try {
    const existing = localStorage.getItem(VISITOR_ID_KEY);
    if (existing && existing.startsWith('anon_')) {
      return existing;
    }

    // Generate new stable visitor ID (16 hex chars for collision safety at scale)
    const newId = `anon_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`;
    localStorage.setItem(VISITOR_ID_KEY, newId);
    console.log('[visitor] Created stable visitor ID:', newId);
    return newId;
  } catch {
    // localStorage blocked (private mode, etc) - generate per-session ID
    // This is better than nothing, at least accumulates within a single session
    return `anon_session_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`;
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
 * Shell context header:
 * - When sessionStorage['field_shell'] === '1', adds X-App-Shell: field
 *   so the server can enforce the Field/Studio boundary.
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

  // Inject X-App-Shell: field when running in Field shell context.
  // Set sessionStorage['field_shell'] = '1' at Field boot to activate.
  // This enables server-side enforcement of the Field/Studio boundary.
  if (typeof window !== 'undefined' && sessionStorage.getItem('field_shell') === '1') {
    const existingHeaders = options.headers instanceof Headers
      ? options.headers
      : new Headers(options.headers as HeadersInit);
    existingHeaders.set('X-App-Shell', 'field');
    options = { ...options, headers: existingHeaders };
  }

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
  // IMPORTANT: Do NOT set Content-Type for FormData — the browser must set it
  // automatically with the correct multipart boundary string
  if (options.body && !headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  // Add session token header (for session-based auth routes)
  const sessionToken = getSessionToken();
  if (sessionToken) {
    headers.set('x-session-token', sessionToken);
    console.log('[apiFetch/safari] x-session-token present:', true);
  } else {
    console.log('[apiFetch/safari] x-session-token present:', false);
  }

  // Add member ID header (for routes using getMemberIdFromRequest)
  // This ensures compatibility with voice routes and other legacy auth
  const memberId = getValidMemberId();
  if (memberId) {
    headers.set('x-member-id', memberId);
    console.log('[apiFetch/safari] x-member-id present:', true);
  } else {
    console.log('[apiFetch/safari] x-member-id present:', false);
  }

  // Add stable visitor ID for anonymous usage tracking (Free tier limits)
  // This ensures usage accumulates properly even for non-authenticated users
  const visitorId = getOrCreateVisitorId();
  if (visitorId && visitorId !== 'server_render') {
    headers.set('x-maia-anon-id', visitorId);
  }

  // Keep/Capture auth diagnostic: surface member/session presence + response
  // status to the VOICE TRACE overlay for the traced endpoints only (no flood).
  const tracedAuth = AUTH_TRACE_PATHS.some((p) => url.includes(p));
  const shortPath = tracedAuth ? url.replace(/^https?:\/\/[^/]+/, '').split('?')[0] : '';
  if (tracedAuth) {
    pushVoiceDebug(`${options.method || 'GET'} ${shortPath} · member:${memberId ? 'y' : 'n'} session:${sessionToken ? 'y' : 'n'}`);
  }

  const res = await fetch(url, {
    ...options,
    headers,
    credentials: 'include', // Still try cookies, but headers are the real auth
    mode: 'cors',
  });

  if (tracedAuth) {
    pushVoiceDebug(`${shortPath} → ${res.status}${res.status === 401 ? ' Unauthorized' : ''}`);
  }

  return res;
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

  // Add stable visitor ID for anonymous usage tracking (Free tier limits)
  const visitorId = getOrCreateVisitorId();
  if (visitorId && visitorId !== 'server_render') {
    headers['x-maia-anon-id'] = visitorId;
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

    // Dispatch the verb but don't await yet — race against the timeout so
    // every native HTTP failure names itself (e.g., "CapacitorHttp POST
    // https://soullab.life/api/... timed out after 30000ms") instead of
    // hanging the WebView indefinitely.
    let nativeCall: Promise<any>;
    switch (method) {
      case 'GET':
        nativeCall = CapacitorHttp.get(requestOptions);
        break;
      case 'POST':
        nativeCall = CapacitorHttp.post(requestOptions);
        break;
      case 'PUT':
        nativeCall = CapacitorHttp.put(requestOptions);
        break;
      case 'PATCH':
        nativeCall = CapacitorHttp.patch(requestOptions);
        break;
      case 'DELETE':
        nativeCall = CapacitorHttp.delete(requestOptions);
        break;
      default:
        nativeCall = CapacitorHttp.request({ ...requestOptions, method });
    }
    nativeResponse = await withTimeout(
      nativeCall,
      NATIVE_HTTP_TIMEOUT_MS,
      `CapacitorHttp ${method} ${url}`
    );

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
  // IMPORTANT: Do NOT set Content-Type for FormData — the browser must set it
  // automatically with the correct multipart boundary string
  if (options.body && !headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  // Add stable visitor ID for anonymous usage tracking (Free tier limits)
  const visitorId = getOrCreateVisitorId();
  if (visitorId && visitorId !== 'server_render') {
    headers.set('x-maia-anon-id', visitorId);
  }

  // ALSO add x-member-id header as fallback for cookie issues
  // Some browsers (Safari, cross-origin) don't reliably send cookies
  const memberId = getValidMemberId();
  if (memberId) {
    headers.set('x-member-id', memberId);
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
