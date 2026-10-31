import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { resolveSessionCredentialAuthority } from './sessionCredentialAuthority';

/**
 * Resolve request identity from verified session credentials only.
 *
 * Web cookies and Safari/iOS headers are co-equal transports. If both are
 * supplied, both must be valid and name the same member. A bare identity claim
 * never authenticates anyone, and every supplied claim must agree with the
 * verified member.
 */
export async function getMemberIdFromRequest(request: NextRequest): Promise<string | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get('maia_session');
  const headerPresented = request.headers.has('x-session-token');

  const authority = await resolveSessionCredentialAuthority([
    { source: 'cookie', presented: cookie !== undefined, value: cookie?.value },
    {
      source: 'header',
      presented: headerPresented,
      value: request.headers.get('x-session-token'),
    },
  ]);
  if (!authority.ok) return null;

  const claims = [
    request.headers.get('x-member-id'),
    request.headers.get('x-maia-member-id'),
    cookieStore.get('maia_member_id')?.value,
  ].filter((claim): claim is string => Boolean(claim));

  if (claims.some((claim) => claim !== authority.memberId)) {
    console.warn(
      '[auth] member identity claim does not match authenticated session — rejecting possible impersonation attempt',
    );
    return null;
  }

  return authority.memberId;
}

/**
 * Resolve an explicit session token for transports such as EventSource/SSE.
 */
export async function getMemberIdFromSessionToken(
  token: string | null | undefined,
): Promise<string | null> {
  const authority = await resolveSessionCredentialAuthority([
    {
      source: 'explicit',
      presented: token !== null && token !== undefined,
      value: token,
    },
  ]);
  return authority.ok ? authority.memberId : null;
}
