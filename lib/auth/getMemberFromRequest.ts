import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { query } from '@/lib/db/postgres';
import { resolveConsistentSessionCredentials } from './verifiedAccess';

/**
 * Resolve the member ID for a request from a VERIFIED credential only.
 *
 * Identity is derived from an `auth_sessions`-backed session token — never from
 * a bare identity assertion. The `x-member-id` header and the `maia_member_id`
 * cookie are treated as unverified *claims*: they are honored only when they
 * match the member resolved from the session, and a mismatch is rejected as a
 * possible impersonation attempt.
 *
 * Credential sources (in priority order):
 * 1. `maia_session` cookie    → auth_sessions lookup (web)
 * 2. `x-session-token` header  → auth_sessions lookup (Safari/iOS, cookies
 *    blocked by ITP — set by apiFetch from localStorage `maia_session_token`)
 *
 * SECURITY: A previous version trusted `x-member-id` / `maia_member_id` after a
 * mere existence check (`SELECT id FROM members WHERE id = $1`). Because member
 * UUIDs are exposed to clients (e.g. as `senderId`), any caller could set the
 * header to a known member id and impersonate that member — reading and writing
 * their team channels, DMs, and other member-scoped data. That vector is
 * removed here. This mirrors the hardening already applied to
 * `requireMemberId` in `lib/auth/session.ts` and the pattern used by
 * `lib/scribe/scribeAuth.ts`.
 *
 * Returns the verified member ID, or `null` if there is no valid session.
 */
export async function getMemberIdFromRequest(request: NextRequest): Promise<string | null> {
  const cookieStore = await cookies();
  const cookieToken = cookieStore.get('maia_session')?.value || null;
  const headerToken = request.headers.get('x-session-token');

  // Compare the independently validated cookie and Safari/iOS header. A bad
  // cookie must not mask a legitimate header; two valid but DIFFERENT member
  // identities must refuse rather than choose by request order.
  const resolved = await resolveConsistentSessionCredentials<{ member_id: string }>(
    cookieToken,
    headerToken,
    async (token) => {
      const memberId = await memberIdForSessionToken(token);
      return memberId ? { member_id: memberId } : null;
    },
  );
  if (!resolved.member) return null;

  // Bare identity assertions are never authority. All present claims must
  // match the same server-verified member, not merely the first claim found.
  const claims = [
    request.headers.get('x-member-id'),
    request.headers.get('x-maia-member-id'),
    cookieStore.get('maia_member_id')?.value,
  ];
  if (claims.some((claim) => claim && claim !== resolved.member.member_id)) {
    console.warn('[auth] member identity claim mismatch — refusing');
    return null;
  }

  return resolved.member.member_id;
}

/**
 * Resolve the member ID backing a session token, for transports that cannot
 * send headers or cookies (e.g. EventSource/SSE passing `?_t=<token>`).
 *
 * Validates against `auth_sessions` exactly like the cookie/header paths above,
 * so a query-param token is no weaker than a header token. Returns `null` for a
 * missing, empty, or invalid token.
 */
export async function getMemberIdFromSessionToken(token: string | null | undefined): Promise<string | null> {
  if (!token) return null;
  return memberIdForSessionToken(token);
}

/**
 * Look up the member ID for a session token.
 * Read-only (does not bump last_active_at). Identical predicate to
 * `validateSessionToken` in `lib/auth/session.ts`.
 */
async function memberIdForSessionToken(token: string): Promise<string | null> {
  const result = await query<{ member_id: string }>(
    `SELECT member_id
       FROM auth_sessions
      WHERE session_token = $1
        AND revoked = FALSE
        AND expires_at > NOW()
      LIMIT 1`,
    [token]
  );
  return result.rows[0]?.member_id ?? null;
}
