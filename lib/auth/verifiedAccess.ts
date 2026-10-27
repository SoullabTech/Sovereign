/**
 * AUTH-BOUNDARY-01 — server-derived identity, roles, and tier.
 *
 * Client assertions are never authority. Every presented session transport is
 * validated, and multiple credentials must all resolve to the same member.
 */
import type { NextRequest } from 'next/server';
import type { Role, Tier } from '@/config/accessMatrix';
import { resolveSessionCredentialAuthority } from './sessionCredentialAuthority';

const VALID_TIERS: readonly string[] = ['free', 'personal', 'pro'];
const VALID_ROLES: readonly string[] = [
  'admin', 'steward', 'curator', 'practitioner', 'partner', 'member',
];

export {
  CLIENT_ASSERTABLE_IDENTITY_HEADERS,
  readSessionCredential,
  hasSessionCredential,
  stripClientIdentityAssertions,
} from './identityAssertions';

export type AccessDenialReason =
  | 'no_credential'
  | 'invalid_session'
  | 'credential_conflict'
  | 'claim_mismatch'
  | 'member_missing';

export interface VerifiedAccess {
  authenticated: boolean;
  memberId: string | null;
  tier: Tier;
  roles: Role[];
  reason?: AccessDenialReason;
}

function denied(reason: AccessDenialReason): VerifiedAccess {
  return { authenticated: false, memberId: null, tier: 'free', roles: [], reason };
}

function normalizeTier(raw: unknown): Tier {
  return typeof raw === 'string' && VALID_TIERS.includes(raw) ? (raw as Tier) : 'free';
}

function normalizeRoles(raw: unknown): Role[] {
  if (!Array.isArray(raw)) return ['member'];
  const roles = raw.filter(
    (role): role is Role => typeof role === 'string' && VALID_ROLES.includes(role),
  );
  return roles.length > 0 ? roles : ['member'];
}

export async function deriveVerifiedAccess(req: NextRequest): Promise<VerifiedAccess> {
  const cookie = req.cookies.get('maia_session');
  const headerPresented = req.headers.has('x-session-token');
  let queryPresented = false;
  let queryToken: string | null = null;
  try {
    const url = new URL(req.url);
    queryPresented = url.searchParams.has('_t');
    queryToken = url.searchParams.get('_t');
  } catch {
    // A malformed URL contributes no query credential. Cookie/header authority
    // still proceeds through the same fail-closed resolver.
  }

  let authority;
  try {
    authority = await resolveSessionCredentialAuthority([
      { source: 'cookie', presented: cookie !== undefined, value: cookie?.value },
      {
        source: 'header',
        presented: headerPresented,
        value: req.headers.get('x-session-token'),
      },
      { source: 'query', presented: queryPresented, value: queryToken },
    ]);
  } catch {
    console.error('[auth-boundary] session validation failed');
    return denied('invalid_session');
  }
  if (!authority.ok) return denied(authority.reason);

  const claims = [
    req.headers.get('x-member-id'),
    req.headers.get('x-maia-member-id'),
    req.cookies.get('maia_member_id')?.value,
  ].filter((claim): claim is string => Boolean(claim));
  if (claims.some((claim) => claim !== authority.memberId)) {
    console.warn(
      '[auth-boundary] identity claim does not match authenticated session — refusing possible impersonation attempt',
    );
    return denied('claim_mismatch');
  }

  return {
    authenticated: true,
    memberId: authority.memberId,
    tier: normalizeTier(authority.tier),
    roles: normalizeRoles(authority.roles),
  };
}
