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
import type { TransactionClient } from '@/lib/db/postgres';
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
  | 'conflicting_credentials'
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
  /** Transaction-scoped, server-read expiry for a final pre-enqueue clock check. */
  sessionExpiresAt?: Date;
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
 * Resolve BOTH presented web/mobile session credentials, never just the first
 * token's presence. A failed cookie may yield to a validated Safari header,
 * but two VALID tokens naming different members fail closed.
 *
 * Only the caller's server-side validator can grant identity. Token contents,
 * raw request headers and cookie values never appear in logs or return values.
 * SSE query-token selection remains outside this helper and is unchanged.
 */
export async function resolveConsistentSessionCredentials<Row extends { member_id: string }>(
  cookieToken: string | null | undefined,
  headerToken: string | null | undefined,
  validate: (token: string) => Promise<Row | null | undefined>,
): Promise<
  | { member: Row; source: 'cookie' | 'header' }
  | { member: null; reason: 'no_credential' | 'invalid_session' | 'conflicting_credentials' }
> {
  const cookie = cookieToken || null;
  const header = headerToken || null;
  if (!cookie && !header) return { member: null, reason: 'no_credential' };

  const cookieMember = cookie ? await validate(cookie) : null;
  const headerMember = header
    ? (header === cookie ? cookieMember : await validate(header))
    : null;

  if (cookieMember && headerMember && cookieMember.member_id !== headerMember.member_id) {
    return { member: null, reason: 'conflicting_credentials' };
  }
  if (cookieMember) return { member: cookieMember, source: 'cookie' };
  if (headerMember) return { member: headerMember, source: 'header' };
  return { member: null, reason: 'invalid_session' };
}

/**
 * Derive authenticated identity, roles, and tier from a validated session.
 *
 * Fails closed at every step. A request that presents no credential, an invalid
 * or expired or revoked token, an identity claim that disagrees with the
 * session, or a session naming a member row that no longer exists, all resolve
 * to the same least-privilege answer: unauthenticated, no roles, free tier.
 */
/**
 * Shared authority implementation for both ordinary requests and a short-lived
 * read/emit transaction. Only the supplied transaction client may be used for
 * its authentication reads; that keeps its row locks meaningful.
 */
export async function deriveVerifiedAccess(req: NextRequest): Promise<VerifiedAccess> {
  return deriveVerifiedAccessCore(req);
}

/**
 * Stage A prototype: the exact same credential/claim authority as ordinary
 * deriveVerifiedAccess, but with all valid source-session rows locked until the
 * owning database transaction exits. Do not use outside transaction(callback).
 */
export async function deriveVerifiedAccessInTransaction(
  req: NextRequest,
  tx: TransactionClient,
): Promise<VerifiedAccess> {
  return deriveVerifiedAccessCore(req, tx);
}

async function deriveVerifiedAccessCore(
  req: NextRequest,
  tx?: TransactionClient,
): Promise<VerifiedAccess> {
  const cookieToken = req.cookies.get('maia_session')?.value || null;
  const headerToken = req.headers.get('x-session-token');

  // Preserve existing SSE/EventSource query-token behavior exactly: it is
  // considered only when NO cookie or header credential was presented.
  // In particular, a stale cookie never falls through to a URL query token.
  const existingQueryToken = !cookieToken && !headerToken
    ? readSessionCredential(req)
    : null;
  const providedHeaderOrQuery = headerToken || existingQueryToken;
  if (!cookieToken && !providedHeaderOrQuery) return denied('no_credential');

  type AccessRow = {
    member_id: string;
    tier: string | null;
    roles: unknown;
    expires_at?: Date;
  };
  let resolved: Awaited<ReturnType<typeof resolveConsistentSessionCredentials<AccessRow>>>;
  try {
    // A shared transaction must acquire locks in one deterministic token
    // order. Otherwise cookie-A/header-B and header-B/cookie-A could invert
    // row-lock ordering and deadlock during concurrent session revocation.
    const verifiedByToken = new Map<string, AccessRow | null>();
    const validate = async (token: string): Promise<AccessRow | null> => {
      const statement = tx
        ? `SELECT s.member_id, m.tier, m.roles, s.expires_at
             FROM auth_sessions s
             JOIN members m ON m.id = s.member_id
            WHERE s.session_token = $1
              AND s.revoked = FALSE
              AND s.expires_at > clock_timestamp()
            LIMIT 1
            FOR SHARE OF s, m`
        : `SELECT s.member_id, m.tier, m.roles
             FROM auth_sessions s
             JOIN members m ON m.id = s.member_id
            WHERE s.session_token = $1
              AND s.revoked = FALSE
              AND s.expires_at > NOW()
            LIMIT 1`;
      const result = tx
        ? await tx.query<AccessRow>(statement, [token])
        : await query<AccessRow>(statement, [token]);
      return result.rows[0] ?? null;
    };
    if (tx) {
      const sortedTokens = [...new Set([cookieToken, providedHeaderOrQuery]
        .filter((value): value is string => Boolean(value)))].sort();
      for (const token of sortedTokens) {
        verifiedByToken.set(token, await validate(token));
      }
    }
    resolved = await resolveConsistentSessionCredentials<AccessRow>(
      cookieToken,
      providedHeaderOrQuery,
      (token) => tx ? Promise.resolve(verifiedByToken.get(token) ?? null) : validate(token),
    );
  } catch {
    // Never turn unavailable SQL or row-lock errors into authority.
    console.error('[auth-boundary] session validation unavailable');
    return denied('invalid_session');
  }

  if (!resolved.member) return denied(resolved.reason);
  const row = resolved.member;
  // The wall clock can cross expiration even while UPDATE revocation is
  // blocked by row locks. The caller MUST additionally check this immediately
  // before synchronous enqueue, while the transaction is still open.
  if (tx && (!(row.expires_at instanceof Date) ||
      !Number.isFinite(row.expires_at.getTime()) ||
      row.expires_at.getTime() <= Date.now())) {
    return denied('invalid_session');
  }

  // Every supplied member-ID assertion must agree with the verified member.
  // Checking only the FIRST assertion would let a later conflicting assertion
  // survive into an application handler that chooses a different precedence.
  const claims = [
    req.headers.get('x-member-id'),
    req.headers.get('x-maia-member-id'),
    req.cookies.get('maia_member_id')?.value,
  ];
  if (claims.some((claim) => claim && claim !== row.member_id)) {
    console.warn('[auth-boundary] member identity claim mismatch — refusing');
    return denied('claim_mismatch');
  }

  return {
    authenticated: true,
    memberId: row.member_id,
    tier: normalizeTier(row.tier),
    roles: normalizeRoles(row.roles),
    ...(tx && row.expires_at ? { sessionExpiresAt: row.expires_at } : {}),
  };
}
