/**
 * Resolve every session credential presented by one request into one authority.
 *
 * A request may legitimately carry the same session through more than one
 * transport (cookie, Safari/iOS header, or SSE query token). Priority order is
 * not authority: every presented credential must be non-empty, current, and
 * resolve to the same member. One invalid or conflicting credential fails the
 * whole request closed.
 *
 * Session-token values are never logged or returned.
 */
import { query } from '@/lib/db/postgres';

export type PresentedSessionCredential = Readonly<{
  source: 'cookie' | 'header' | 'query' | 'explicit';
  presented: boolean;
  value: string | null | undefined;
}>;

export type SessionCredentialFailureReason =
  | 'no_credential'
  | 'invalid_session'
  | 'credential_conflict';

export type SessionCredentialAuthority =
  | Readonly<{
      ok: true;
      memberId: string;
      tier: string | null;
      roles: unknown;
    }>
  | Readonly<{
      ok: false;
      reason: SessionCredentialFailureReason;
    }>;

const MAX_SESSION_TOKEN_LENGTH = 4096;
const INVALID = Symbol('invalid-session-credential');

type AuthorityRow = {
  member_id: string;
  tier: string | null;
  roles: unknown;
};

function normalizedCredential(
  credential: PresentedSessionCredential,
): string | null | typeof INVALID {
  if (!credential.presented) return null;
  if (typeof credential.value !== 'string') return INVALID;
  if (
    credential.value.length === 0 ||
    credential.value.length > MAX_SESSION_TOKEN_LENGTH ||
    credential.value.trim() !== credential.value
  ) {
    return INVALID;
  }
  return credential.value;
}

/**
 * Validate all supplied credentials. Database failures intentionally propagate
 * to the caller, which decides whether to return unauthenticated or unavailable.
 */
export async function resolveSessionCredentialAuthority(
  credentials: readonly PresentedSessionCredential[],
): Promise<SessionCredentialAuthority> {
  const tokens: string[] = [];
  for (const credential of credentials) {
    const value = normalizedCredential(credential);
    if (value === INVALID) return { ok: false, reason: 'invalid_session' };
    if (value !== null && !tokens.includes(value)) tokens.push(value);
  }

  if (tokens.length === 0) return { ok: false, reason: 'no_credential' };

  let authority: AuthorityRow | null = null;
  for (const token of tokens) {
    const result = await query<AuthorityRow>(
      `SELECT s.member_id, m.tier, m.roles
         FROM auth_sessions s
         JOIN members m ON m.id = s.member_id
        WHERE s.session_token = $1
          AND s.revoked = FALSE
          AND s.expires_at > NOW()
        LIMIT 1`,
      [token],
    );
    const row = result.rows[0];
    if (!row) return { ok: false, reason: 'invalid_session' };
    if (authority && authority.member_id !== row.member_id) {
      return { ok: false, reason: 'credential_conflict' };
    }
    authority ??= row;
  }

  if (!authority) return { ok: false, reason: 'invalid_session' };
  return {
    ok: true,
    memberId: authority.member_id,
    tier: authority.tier,
    roles: authority.roles,
  };
}
