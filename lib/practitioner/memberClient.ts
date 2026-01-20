/**
 * Client-side member helpers for Practitioner OS
 *
 * Phase 3 house style: centralize member ID access so future auth swap is trivial.
 * Currently uses localStorage (dev mode), later will read from server session.
 */

export function getDevMemberId(): string | null {
  if (typeof window === 'undefined') return null;

  // First try cookie (set by signin)
  const cookieMatch = document.cookie.match(/maia_member_id=([^;]+)/);
  if (cookieMatch) {
    return cookieMatch[1];
  }

  // Fallback to localStorage (legacy beta_user)
  try {
    const raw = localStorage.getItem('beta_user');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.id ?? null;
  } catch {
    return null;
  }
}

export function withMemberHeader(memberId: string | null): HeadersInit {
  return memberId ? { 'x-member-id': memberId } : {};
}

/**
 * Combined fetch helper for practitioner API calls
 */
export async function practitionerFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const memberId = getDevMemberId();
  if (!memberId) {
    throw new Error('Not authenticated');
  }

  const res = await fetch(path, {
    ...options,
    headers: {
      ...withMemberHeader(memberId),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return res.json();
}
