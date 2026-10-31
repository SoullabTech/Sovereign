/**
 * Server-side session authentication.
 *
 * A web cookie and Safari/iOS header are alternate transports for the same
 * authority. When both are present, both must be valid and resolve to the same
 * member; no priority-order fallback may hide a conflicting credential.
 */
import { cookies, headers } from 'next/headers';
import { resolveSessionCredentialAuthority } from './sessionCredentialAuthority';

/** Require one verified member or throw AUTH_REQUIRED. */
export async function requireMemberId(): Promise<string> {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const cookie = cookieStore.get('maia_session');
  const headerPresented = headerStore.has('x-session-token');

  const authority = await resolveSessionCredentialAuthority([
    { source: 'cookie', presented: cookie !== undefined, value: cookie?.value },
    {
      source: 'header',
      presented: headerPresented,
      value: headerStore.get('x-session-token'),
    },
  ]);
  if (!authority.ok) throw new Error('AUTH_REQUIRED');

  const claims = [
    headerStore.get('x-member-id'),
    headerStore.get('x-maia-member-id'),
    cookieStore.get('maia_member_id')?.value,
  ].filter((claim): claim is string => Boolean(claim));
  if (claims.some((claim) => claim !== authority.memberId)) {
    throw new Error('AUTH_REQUIRED');
  }

  return authority.memberId;
}

/** Get member ID if authenticated, otherwise null. */
export async function getMemberIdIfAuthenticated(): Promise<string | null> {
  try {
    return await requireMemberId();
  } catch {
    return null;
  }
}

/** Check whether the current request has valid authentication. */
export async function isAuthenticated(): Promise<boolean> {
  return (await getMemberIdIfAuthenticated()) !== null;
}
