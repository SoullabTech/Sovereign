'use client';

/**
 * Single admin client auth path (Tier-2 consolidation, raw-password injection).
 *
 * The admin password — validated server-side against LABTOOLS_ADMIN_PASSWORD by
 * isAdminRequest (lib/admin/requireAdmin.ts) — is held in sessionStorage and
 * injected as the `x-admin-password` header ONLY on same-origin /api/admin/*
 * requests.
 *
 * Discipline:
 *  - sessionStorage only (origin-scoped, cleared on tab close); set exclusively
 *    by the admin UI gate (components/admin/AdminAuthGate).
 *  - header injected ONLY for paths starting with `/api/admin/` — it never
 *    leaks to other endpoints, public surfaces, or cross-origin requests.
 *  - never logged or rendered.
 *
 * This replaces the prior fragmented model: bespoke per-page `x-admin-password`
 * fields and the retired `maia_admin_token` flow. One admin client path.
 */

const ADMIN_PW_KEY = 'maia_admin_pw';

export function getAdminPassword(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.sessionStorage.getItem(ADMIN_PW_KEY);
  } catch {
    return null;
  }
}

export function setAdminPassword(pw: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(ADMIN_PW_KEY, pw);
  } catch {
    /* sessionStorage unavailable */
  }
}

export function clearAdminPassword(): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.removeItem(ADMIN_PW_KEY);
  } catch {
    /* noop */
  }
}

export function hasAdminPassword(): boolean {
  return !!getAdminPassword();
}

/**
 * fetch() wrapper that injects the admin password as `x-admin-password` for
 * same-origin /api/admin/* calls only. Use for ALL admin dashboard API calls
 * instead of bare fetch().
 */
export async function adminFetch(
  input: string,
  init: RequestInit = {},
): Promise<Response> {
  const headers = new Headers(init.headers ?? {});
  const pw = getAdminPassword();
  // Same-origin admin API only: a relative path under /api/admin/.
  const isAdminApi = typeof input === 'string' && input.startsWith('/api/admin/');
  if (pw && isAdminApi) {
    headers.set('x-admin-password', pw);
  }
  return fetch(input, { ...init, headers });
}
