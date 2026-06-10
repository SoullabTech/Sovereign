import type { NextRequest } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';

/**
 * SECURITY — identity resolution for the MAIA conversation route.
 *
 * The member is resolved ONLY from a verified session credential:
 *   • maia_session cookie     — web (sent same-origin, incl. EventSource)
 *   • x-session-token header  — iOS/Safari via apiFetch (lib/http/apiBase.ts),
 *                               durable in localStorage `maia_session_token`
 * both validated against `auth_sessions` inside getMemberIdFromRequest.
 *
 * A request-body `userId` is deliberately NOT consulted. Member UUIDs are
 * exposed to clients (rendered as senderId, awarenessProfile.userId, etc.), so
 * honoring a body-supplied id would let any caller read AND write another
 * member's memory by sending that member's UUID — the same impersonation class
 * closed centrally in getMemberIdFromRequest (commit 5b4eff3d5). This route was
 * the last identity surface still honoring a request-body fallback.
 *
 * The legacy `userId = memberIdFromAuth || bodyUserId` existed for iOS
 * memory-after-resume; it became unnecessary once apiFetch shipped
 * x-session-token on every native path. A request with no valid session now
 * resolves to null (anonymous / must re-authenticate), never to a body-claimed
 * identity.
 */
export async function resolveMemberIdentity(req: NextRequest): Promise<string | null> {
  return getMemberIdFromRequest(req);
}
