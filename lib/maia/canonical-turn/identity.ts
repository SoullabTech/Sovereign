/**
 * resolveCanonicalIdentity — the ONLY producer of MemberIdentity. Spec §4.1 (G4).
 *
 * Wraps exactly one resolver: lib/auth/getMemberFromRequest.getMemberIdFromRequest —
 * identity derived only from an auth_sessions-backed credential; a bare x-member-id /
 * body userId is never identity (AUTH_POSTURE_X_MEMBER_ID_2026-07-11 §4; refusal R03).
 *
 * Two locks:
 *   type   — VerifiedMemberId is branded; a string cannot be passed as one.
 *   runtime — every MemberIdentity this module returns is registered in a module-private
 *             WeakSet; the constructor accepts only minted identities (isMintedIdentity).
 *
 * No request body is read here. Anonymous and guest are legitimate states, not failures.
 */

import type { NextRequest } from 'next/server';
import { getMemberIdFromRequest } from '../../auth/getMemberFromRequest';
import { memberRef } from '../../privacy/memberRef';
import type { MemberIdentity, VerifiedMemberId } from './types';

const MINTED = new WeakSet<object>();

function mint<T extends MemberIdentity>(identity: T): T {
  const frozen = Object.freeze(identity);
  MINTED.add(frozen);
  return frozen;
}

/** True iff this object was produced by this module (runtime half of G4). */
export function isMintedIdentity(identity: unknown): identity is MemberIdentity {
  return typeof identity === 'object' && identity !== null && MINTED.has(identity);
}

export interface ResolveIdentityOptions {
  /** Server-side fallback key for an unverified caller in rooms that admit guests. */
  readonly guestKey?: string;
  /** Stable anonymous marker (between/chat `anon:<sessionId>`). */
  readonly anonRef?: string;
}

/**
 * Resolve the identity for this request. Verified when the session credential resolves;
 * otherwise `guest` (if a guestKey is supplied), else `anonymous`.
 */
export async function resolveCanonicalIdentity(
  req: NextRequest,
  opts: ResolveIdentityOptions = {},
): Promise<MemberIdentity> {
  const verified = await getMemberIdFromRequest(req);
  if (verified) {
    return mint({
      status: 'verified',
      memberId: verified as VerifiedMemberId,
      memberRef: memberRef(verified),
    });
  }
  if (opts.guestKey) return mint({ status: 'guest', guestKey: opts.guestKey });
  return mint({ status: 'anonymous', anonRef: opts.anonRef ?? 'anonymous' });
}
