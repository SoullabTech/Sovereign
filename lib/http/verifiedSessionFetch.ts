/**
 * Credential-only client fetch for member-owned surfaces.
 *
 * Web uses the httpOnly maia_session cookie. Safari/Capacitor may additionally
 * send the durable x-session-token credential because ITP can withhold cookies.
 * A browser-stored member id is an identity claim, not a credential, and is
 * deliberately never attached here.
 */
import { apiUrl, isNativeCapacitor, isSafari } from './apiBase';

function clientSessionToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const token = window.localStorage.getItem('maia_session_token');
    return token?.trim() || null;
  } catch {
    return null;
  }
}

export async function verifiedSessionFetch(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  const headers = new Headers(options.headers);
  if (options.body && !headers.has('Content-Type') && !(options.body instanceof FormData))
    headers.set('Content-Type', 'application/json');

  if (isSafari() || isNativeCapacitor()) {
    const token = clientSessionToken();
    if (token) headers.set('x-session-token', token);
  }

  // Strip identity assertions even if a caller accidentally supplied one.
  headers.delete('x-member-id');
  headers.delete('x-maia-member-id');
  headers.delete('x-access-member-id');

  return fetch(apiUrl(path), {
    ...options,
    headers,
    credentials: 'include',
    mode: 'cors',
  });
}
