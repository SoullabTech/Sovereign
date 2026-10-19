/**
 * Stage Q client-security candidate: browser-only sign-out.
 *
 * A successful fetch is NOT proof of server revocation. This helper checks the
 * structured result and handles a Safari localStorage bearer separately from
 * its HttpOnly cookie. Do not call this from Capacitor/native clients.
 *
 * There is deliberately no public API for signing out ALL devices here.
 */
import { clearAuthState, isNativeCapacitor } from '@/lib/http/apiBase';
import { Capacitor } from '@capacitor/core';

type SignOutWireResponse = {
  success?: unknown;
  localCookiesCleared?: unknown;
  serverSessionRevoked?: unknown;
};

export type WebSignOutOutcome =
  | { kind: 'complete'; confirmedRevocations: number; headerCredentialChecked: boolean }
  | { kind: 'incomplete'; detail: string; confirmedRevocations: number; cookieClearingConfirmed: boolean };

type ResponseLike = Pick<Response, 'status' | 'ok' | 'json'>;
export type SignOutTransport = (path: string, options: RequestInit) => Promise<ResponseLike>;

type Attempt =
  | { ok: true; revoked: boolean }
  | { ok: false; detail: string; cookieClearingConfirmed: boolean };

const SIGNOUT_PATH = '/api/members/signout';

async function requestOne(
  transport: SignOutTransport,
  headerToken?: string,
): Promise<Attempt> {
  try {
    const response = await transport(SIGNOUT_PATH, {
      method: 'POST',
      // Explicit web-only transport. Never follow a redirect to an HTML login
      // page and mistake an HTTP 200 for a successful sign-out.
      credentials: 'same-origin',
      mode: 'same-origin',
      redirect: 'error',
      cache: 'no-store',
      ...(headerToken ? { headers: { 'x-session-token': headerToken } } : {}),
    });
    let body: SignOutWireResponse | null = null;
    try {
      body = await response.json() as SignOutWireResponse;
    } catch {
      return { ok: false, detail: 'The sign-out response could not be verified.', cookieClearingConfirmed: false };
    }
    // Only the reviewed 503 response explicitly reports cookie expiration
    // without server revocation. A malformed/foreign response is not proof.
    const cookieClearingConfirmed =
      response.status === 503 && body?.success === false &&
      body.localCookiesCleared === true && body.serverSessionRevoked === false;
    if (
      response.status !== 200 || !response.ok ||
      body?.success !== true ||
      body.localCookiesCleared !== true ||
      typeof body.serverSessionRevoked !== 'boolean'
    ) {
      if (response.status === 403) {
        return { ok: false, detail: 'Sign-out was refused by the browser security boundary. The HttpOnly cookie may still be active.', cookieClearingConfirmed: false };
      }
      if (response.status === 409) {
        return { ok: false, detail: 'Conflicting session credentials were refused. The HttpOnly cookie may still be active.', cookieClearingConfirmed: false };
      }
      if (response.status === 503) {
        return { ok: false, detail: 'Server revocation is unavailable. The server reported clearing browser cookies, but the old session may remain valid.', cookieClearingConfirmed };
      }
      return { ok: false, detail: 'Soullab could not confirm that the server session ended.', cookieClearingConfirmed: false };
    }
    return { ok: true, revoked: body.serverSessionRevoked };
  } catch {
    // A network error cannot prove that a POST did not reach the server.
    return { ok: false, detail: 'The connection ended without confirmation. The HttpOnly cookie and server session may remain active.', cookieClearingConfirmed: false };
  }
}

/**
 * Confirm the web cookie first, then independently check any locally stored
 * Safari bearer. Each request is same-origin and is examined for the exact
 * server response contract. No raw session token is logged or returned.
 *
 * A second 200 with serverSessionRevoked:false means the bearer had no
 * unrevoked matching row at that moment; it is NOT proof of a new revocation.
 */
export async function signOutWebCredentials(
  transport: SignOutTransport,
  headerToken: string | null,
): Promise<WebSignOutOutcome> {
  const cookie = await requestOne(transport);
  if (!cookie.ok) {
    return { kind: 'incomplete', detail: cookie.detail, confirmedRevocations: 0, cookieClearingConfirmed: cookie.cookieClearingConfirmed };
  }
  const cookieRevocations = cookie.revoked ? 1 : 0;
  if (headerToken) {
    const header = await requestOne(transport, headerToken);
    if (!header.ok) {
      return {
        kind: 'incomplete',
        detail: 'The browser cookie was processed, but the stored session token could not be verified. ' + header.detail,
        confirmedRevocations: cookieRevocations,
        cookieClearingConfirmed: true,
      };
    }
    return {
      kind: 'complete',
      confirmedRevocations: cookieRevocations + (header.revoked ? 1 : 0),
      headerCredentialChecked: true,
    };
  }
  return { kind: 'complete', confirmedRevocations: cookieRevocations, headerCredentialChecked: false };
}

/** Browser wrapper; no native-origin exception and no implicit API base fallback. */
export async function signOutCurrentBrowserSession(): Promise<WebSignOutOutcome> {
  if (typeof window === 'undefined') {
    return { kind: 'incomplete', detail: 'Browser sign-out is not available here.', confirmedRevocations: 0, cookieClearingConfirmed: false };
  }
  if (isNativeCapacitor() || Capacitor.isNativePlatform()) {
    return {
      kind: 'incomplete',
      detail: 'Native app session revocation is not yet qualified. The server session and native cookies may remain active.',
      confirmedRevocations: 0,
      cookieClearingConfirmed: false,
    };
  }
  let headerToken: string | null;
  try {
    headerToken = window.localStorage.getItem('maia_session_token');
  } catch {
    return {
      kind: 'incomplete',
      detail: 'The browser session store could not be inspected. Server sign-out is unconfirmed.',
      confirmedRevocations: 0,
      cookieClearingConfirmed: false,
    };
  }
  return signOutWebCredentials((path, init) => fetch(path, init), headerToken);
}

/**
 * An explicit local exit, not proof of durable server revocation. The sign-in
 * entry displays a warning when "incomplete" is true. Return false if local
 * cleanup failed rather than falsely claiming this device was cleared.
 */
export function leaveThisBrowser(incomplete: boolean, cookieClearingConfirmed: boolean): boolean {
  // JavaScript cannot remove an HttpOnly cookie. Never claim local-only exit
  // after a 403/409/network loss that may have left the cookie intact.
  if (!cookieClearingConfirmed || typeof window === 'undefined') return false;
  try {
    clearAuthState();
    for (const key of ['userName', 'displayName', 'userTier']) {
      window.localStorage.removeItem(key);
    }
    window.sessionStorage.clear();
    window.localStorage.setItem('maia_signed_out', '1');
    window.localStorage.setItem('maia_signed_out_at', String(Date.now()));
  } catch {
    return false;
  }
  window.location.replace(incomplete ? '/signin?signout=unconfirmed' : '/signin?from=signout');
  return true;
}
