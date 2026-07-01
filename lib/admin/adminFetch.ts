/**
 * Shared admin client fetch.
 *
 * Admin API routes are guarded server-side by `isAdminRequest` (lib/admin/requireAdmin.ts):
 * they require the `LABTOOLS_ADMIN_PASSWORD` presented in the `x-admin-password` header.
 * This helper is the single client-side seam that injects that header, sourcing the
 * password from `localStorage['soullab_admin_secret']` (the one persisted key already
 * used by the admin video tools).
 *
 * INTERIM ("raw-password injection now"): the admin password rides as a raw header from
 * localStorage. This is weaker than a session token (XSS-readable, sent every request) but
 * matches the existing seam and restores the dashboards the route guards fail-closed.
 * The future hardening (mint a short-lived admin session token at /api/admin/auth and send
 * that instead) changes ONLY this file — that is the point of centralizing it here.
 */

const ADMIN_PW_KEY = 'soullab_admin_secret';

function browser(): boolean {
  return typeof window !== 'undefined';
}

export function getAdminPassword(): string | null {
  if (!browser()) return null;
  try {
    return window.localStorage.getItem(ADMIN_PW_KEY);
  } catch {
    return null;
  }
}

export function storeAdminPassword(pwd: string): void {
  if (!browser()) return;
  try {
    window.localStorage.setItem(ADMIN_PW_KEY, pwd);
  } catch {
    /* localStorage unavailable (private mode etc.) — non-fatal */
  }
}

export function clearAdminPassword(): void {
  if (!browser()) return;
  try {
    window.localStorage.removeItem(ADMIN_PW_KEY);
  } catch {
    /* non-fatal */
  }
}

export function hasAdminPassword(): boolean {
  return getAdminPassword() !== null && getAdminPassword() !== '';
}

function getSessionToken(): string | null {
  if (!browser()) return null;
  try {
    return window.localStorage.getItem('maia_session_token');
  } catch {
    return null;
  }
}

/**
 * fetch() wrapper that attaches auth headers for /api/admin/* routes.
 * Sends x-session-token (member session path — no password needed for admin_role members)
 * and falls back to x-admin-password from localStorage for the shared-password path.
 */
export async function adminFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  const sessionToken = getSessionToken();
  if (sessionToken && !headers.has('x-session-token')) {
    headers.set('x-session-token', sessionToken);
  }
  const pwd = getAdminPassword();
  if (pwd && !headers.has('x-admin-password')) {
    headers.set('x-admin-password', pwd);
  }
  return fetch(path, { ...init, headers });
}
