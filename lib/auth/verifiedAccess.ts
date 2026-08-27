/**
 * AUTH-BOUNDARY-01 — server-side derivation of identity, roles, and tier.
 *
 * THE INVARIANT THIS MODULE EXISTS TO ENFORCE
 * -------------------------------------------
 * Client-supplied identity / role / tier headers are NEVER authentication.
 *
 * `x-member-id`, `x-maia-member-id`, `x-maia-roles`, `x-maia-tier` and the
 * whole `x-access-*` family are attacker-controlled strings on any request that
 * did not originate from our own trusted edge. They may be read as *claims*.
 * They may never be read as *authority*.
 *
 * Authority comes from exactly one place: a session token validated against
 * `auth_sessions`, and the `members` row that session names. Roles and tier are
 * columns on that row (migration 20260120000002_members_access_control.sql) —
 * they are read from the database, never from the caller.
 *
 * WHY THIS IS A SEPARATE MODULE FROM THE MIDDLEWARE
 * ------------------------------------------------
 * `middleware.ts` runs on the Edge runtime and cannot use the Node postgres
 * driver, so it cannot validate a session at all. That is a structural limit,
 * not an oversight. The consequence is stated plainly in the middleware and
 * restated here: **the middleware is a coarse gate, not the authority.** It can
 * observe that no credential was presented and refuse early. It cannot confirm
 * that a presented credential is real, and it must therefore never manufacture
 * a grant that a downstream handler would treat as proof.
 *
 * This module is that proof, and it runs in the Node runtime where the database
 * is reachable.
 *
 * RELATIONSHIP TO EXISTING HARDENING
 * ----------------------------------
 * `lib/auth/getMemberFromRequest.ts` already resolves *identity* this way
 * (AUTH-01-C/D). This module reuses that exact predicate and extends it to the
 * *authorization* facts — roles and tier — which had no server-derived source
 * before. It does not replace or weaken any existing resolver.
 */

import type { NextRequest } from 'next/server';
import { query } from '@/lib/db/postgres';
import type { Role, Tier } from '@/config/accessMatrix';
import { readSessionCredential } from './identityAssertions';

const VALID_TIERS: readonly string[] = ['free', 'personal', 'pro'];
const VALID_ROLES: readonly string[] = [
  'admin',
  'steward',
  'curator',
  'practitioner',
  'partner',
  'member',
];

// The client-assertable surface and the credential readers live in the
// dependency-free module so the Edge middleware can import them without
// pulling in the postgres driver. Re-exported here so a Node-runtime caller
// has a single import site for the whole boundary.
export {
  CLIENT_ASSERTABLE_IDENTITY_HEADERS,
  readSessionCredential,
  hasSessionCredential,
  stripClientIdentityAssertions,
} from './identityAssertions';

export type AccessDenialReason =
  | 'no_credential'
  | 'invalid_session'
  | 'claim_mismatch'
  | 'member_missing';

export interface VerifiedAccess {
  /** True only when a session token was validated against `auth_sessions`. */
  authenticated: boolean;
  /** The member the validated session names. Null when unauthenticated. */
  memberId: string | null;
  /** Read from `members.tier`. Defaults to the least privilege on any failure. */
  tier: Tier;
  /** Read from `members.roles`. Empty when unauthenticated — never `['member']`. */
  roles: Role[];
  /** Why authority was refused. Absent when `authenticated` is true. */
  reason?: AccessDenialReason;
}

/** The least-privilege result. Every failure path returns this shape. */
function denied(reason: AccessDenialReason): VerifiedAccess {
  return { authenticated: false, memberId: null, tier: 'free', roles: [], reason };
}

function normalizeTier(raw: unknown): Tier {
  return typeof raw === 'string' && VALID_TIERS.includes(raw) ? (raw as Tier) : 'free';
}

function normalizeRoles(raw: unknown): Role[] {
  if (!Array.isArray(raw)) return ['member'];
  const roles = raw.filter(
    (r): r is Role => typeof r === 'string' && VALID_ROLES.includes(r),
  );
  // A member row with no recognizable role is still a member. An unrecognized
  // role string is dropped rather than passed through — an unknown role must
  // never widen access by surviving into a `rolesAnyOf` comparison.
  return roles.length > 0 ? roles : ['member'];
}

/**
 * Derive authenticated identity, roles, and tier from a validated session.
 *
 * Fails closed at every step. A request that presents no credential, an invalid
 * or expired or revoked token, an identity claim that disagrees with the
 * session, or a session naming a member row that no longer exists, all resolve
 * to the same least-privilege answer: unauthenticated, no roles, free tier.
 */
export async function deriveVerifiedAccess(req: NextRequest): Promise<VerifiedAccess> {
  const token = readSessionCredential(req);
  if (!token) return denied('no_credential');

  let row: { member_id: string; tier: string | null; roles: unknown } | undefined;
  try {
    const result = await query<{ member_id: string; tier: string | null; roles: unknown }>(
      `SELECT s.member_id, m.tier, m.roles
         FROM auth_sessions s
         JOIN members m ON m.id = s.member_id
        WHERE s.session_token = $1
          AND s.revoked = FALSE
          AND s.expires_at > NOW()
        LIMIT 1`,
      [token],
    );
    row = result.rows[0];
  } catch (error) {
    // A database failure must not become an access grant.
    console.error('[auth-boundary] session validation failed:', error);
    return denied('invalid_session');
  }

  if (!row) return denied('invalid_session');

  // An identity claim, if present, must agree with the session. A mismatch is
  // an impersonation attempt, not a preference to resolve — same rule as
  // `lib/auth/getMemberFromRequest.ts`.
  const claimedMemberId =
    req.headers.get('x-member-id') ||
    req.headers.get('x-maia-member-id') ||
    req.cookies.get('maia_member_id')?.value ||
    null;

  if (claimedMemberId && claimedMemberId !== row.member_id) {
    console.warn(
      '[auth-boundary] identity claim does not match authenticated session — refusing (possible impersonation attempt)',
    );
    return denied('claim_mismatch');
  }

  return {
    authenticated: true,
    memberId: row.member_id,
    tier: normalizeTier(row.tier),
    roles: normalizeRoles(row.roles),
  };
}
