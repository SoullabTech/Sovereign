/**
 * DESKTOP-MAIA-IDENTITY-HYDRATION-01 — arrival, decided in one place.
 *
 * ⛔ THE CORRECTION THIS FILE EXISTS FOR. The first cut of this unit put
 * `resolveMemberIdentity()` into `/maia` and called the rule implemented. It
 * was not: `checkAndMigrateSession()` still ran BEFORE it and could redirect
 * to `/signin` on localStorage alone. So the exact case the unit exists for
 * never reached the server at all —
 *
 *     valid maia_session cookie
 *   + fresh Desktop platform partition (non-persistent, empty localStorage)
 *   → hasAnySessionData === false → 'fresh' → /signin
 *   → whoami NEVER ASKED
 *
 * And moving the call above the check would not have been enough either. The
 * resolver writes `explorerId` and the name; it does not write
 * `maia_session_version`. The legacy check would then find a version mismatch
 * and decide the authenticated member needed migrating — signing them out on
 * the strength of a key the server has never heard of.
 *
 * ⛔ SO THE FIX IS ORDER *AND* AUTHORITY, not order alone. The legacy code is
 * split in two, and neither half can do what the whole one did:
 *
 *   · `repairIdentityCache()`  — sanitises local state. It CANNOT route and
 *     CANNOT sign anyone out. It is what an authenticated member gets.
 *   · `unauthenticatedRoute()` — the legacy policy, unchanged in behaviour,
 *     reachable ONLY after the server has explicitly said the caller is not
 *     signed in. localStorage decides where a guest goes; it never decides
 *     whether a member is one.
 *
 * THE RULE, in one shape:
 *
 *     authenticated   → proceed as that member; cache may be repaired;
 *                       localStorage may NOT redirect or sign them out
 *     unauthenticated → genuine guest/sign-in policy may run;
 *                       cached member data cannot promote them
 *     error           → identity error surface; never guest, never a redirect
 */

import { resolveMemberIdentity, type ResolvedIdentity } from './resolveMemberIdentity';

/** Migration version — increment to force re-auth for all users. */
export const SESSION_VERSION = 2; // Bumped to fix UUID-as-name bug (Jan 5, 2026)

/** A string that should never be shown as a name, or trusted as one. */
export function isLikelyUUID(str: string | null | undefined): boolean {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str)
    || /^[0-9a-f]{8,}$/i.test(str)
    || /^user_\d+$/.test(str);
}

/** A `local_*` fallback id from a failed onboarding — unusable against the server. */
export function isPoisonedLocalId(id: string | null | undefined): boolean {
  return !!id && id.startsWith('local_');
}

function betaUserId(): string | null {
  try {
    const raw = localStorage.getItem('beta_user');
    return raw ? (JSON.parse(raw).id ?? null) : null;
  } catch { return null; }
}

/**
 * Bring the local cache into line with a member the SERVER has confirmed.
 *
 * ⛔ IT CANNOT ROUTE AND IT CANNOT SIGN ANYONE OUT. That is the whole point of
 * the split: every branch of the old function that returned a destination is
 * unreachable from here. The worst this can do to a confirmed member is tidy
 * up around them.
 *
 * ⛔ It writes `maia_session_version`. Without that, the very next mount would
 * see a version mismatch and the legacy path would sign out a member the server
 * had just confirmed — the second half of the defect, and the one that survives
 * a naive reordering.
 */
export function repairIdentityCache(authoritativeMemberId: string): string[] {
  if (typeof window === 'undefined') return [];
  const actions: string[] = [];
  try {
    // A poisoned id cached under a confirmed member is stale, not authority.
    if (isPoisonedLocalId(localStorage.getItem('explorerId'))) {
      localStorage.setItem('explorerId', authoritativeMemberId);
      actions.push('replaced_poisoned_explorer_id');
    }
    if (isPoisonedLocalId(betaUserId())) {
      localStorage.removeItem('beta_user');
      actions.push('cleared_poisoned_beta_user');
    }
    if (isLikelyUUID(localStorage.getItem('explorerName'))) {
      localStorage.removeItem('explorerName');
      actions.push('cleared_uuid_name');
    }
    if (localStorage.getItem('maia_session_version') !== String(SESSION_VERSION)) {
      localStorage.setItem('maia_session_version', String(SESSION_VERSION));
      actions.push('stamped_session_version');
    }
  } catch { /* a blocked store must not break arrival */ }
  return actions;
}

export type UnauthenticatedRoute = 'migrate' | 'fresh' | null;

/**
 * The legacy pre-server policy, behaviour unchanged.
 *
 * ⛔ CALLABLE ONLY AFTER AN EXPLICIT `authed:false`. It reads localStorage and
 * decides where someone with no server session should go. Asking it anything
 * about a member is the defect.
 */
export function unauthenticatedRoute(): UnauthenticatedRoute {
  if (typeof window === 'undefined') return null;

  const storedVersion = localStorage.getItem('maia_session_version');
  const currentName = localStorage.getItem('explorerName');
  const explorerId = localStorage.getItem('explorerId');
  const betaUser = localStorage.getItem('beta_user');
  const signupCompleted = localStorage.getItem('signup_completed');

  const hasAnySessionData = betaUser || explorerId || signupCompleted ||
    Object.keys(localStorage).some((k) =>
      k.startsWith('maia_') || k.startsWith('explorer') || k.startsWith('beta'));
  if (!hasAnySessionData) return 'fresh';

  if (isPoisonedLocalId(explorerId) || isPoisonedLocalId(betaUserId())) {
    localStorage.removeItem('beta_user');
    localStorage.removeItem('explorerId');
    localStorage.removeItem('explorerName');
    localStorage.removeItem('signup_completed');
    return 'fresh';
  }

  if (storedVersion !== String(SESSION_VERSION) || isLikelyUUID(currentName)) {
    localStorage.removeItem('beta_user');
    localStorage.removeItem('explorerId');
    localStorage.removeItem('explorerName');
    localStorage.removeItem('betaOnboardingComplete');
    localStorage.setItem('maia_session_version', String(SESSION_VERSION));
    return 'migrate';
  }

  return null;
}

export type ArrivalDecision =
  | { kind: 'member'; memberId: string; displayName: string | null; credentialSource: string | null; repaired: string[] }
  | { kind: 'guest'; reason: string | null }
  | { kind: 'redirect'; to: string; reason: 'fresh' | 'migrate' }
  | { kind: 'identity-error'; reason: string | null };

/**
 * Decide what happens when `/maia` mounts.
 *
 * Extracted from the page so the five cases that matter can be exercised
 * directly, with a real localStorage and a fake server — every one of them is
 * a state a React test would have to reach through a 2,000-line tree.
 */
export async function decideMaiaArrival(
  resolve: () => Promise<ResolvedIdentity> = resolveMemberIdentity,
): Promise<ArrivalDecision> {
  const resolved = await resolve();

  if (resolved.state === 'error') {
    // ⛔ NOT a guest, and NOT a redirect. We could not ask — which is a
    // different fact from the server saying no, and routing on it would sign
    // out a member over a flaky network.
    return { kind: 'identity-error', reason: resolved.reason };
  }

  if (resolved.state === 'authenticated' && resolved.memberId) {
    // ⛔ No localStorage consultation on this branch AT ALL beyond repair.
    // Nothing cached may redirect or sign out a member the server confirmed.
    return {
      kind: 'member',
      memberId: resolved.memberId,
      displayName: resolved.displayName,
      credentialSource: resolved.credentialSource,
      repaired: repairIdentityCache(resolved.memberId),
    };
  }

  // Explicitly not signed in. NOW the legacy policy may speak.
  const route = unauthenticatedRoute();
  if (route === 'fresh' || route === 'migrate') {
    // Preserved verbatim from the page: both destinations were `/signin`,
    // despite the 'fresh' log line naming /begin. Behaviour is unchanged here
    // deliberately — correcting it is a product decision, not this repair.
    return { kind: 'redirect', to: '/signin', reason: route };
  }
  return { kind: 'guest', reason: resolved.reason };
}
