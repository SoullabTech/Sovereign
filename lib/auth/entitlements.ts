/**
 * Entitlements — the entitlement layer (Stewardship Model).
 *
 * An *entitlement* is a resolved capability a session may exercise. Gates and
 * executors check entitlements, never `tier`/`role` directly. This generalizes
 * the live `members.tester` proto-entitlement (see lib/auth/tester.ts) into a
 * named, resolvable set.
 *
 * Scope note: this is the NEW entitlement layer. The legacy tier-feature
 * resolver in `lib/entitlements.ts` (member_settings.circle_tier) is a separate,
 * pre-existing concern and is intentionally NOT touched here; reconciling the
 * two is deferred (brand-first).
 *
 * Naming (Kelly directive): entitlement keys are capacity/authority-shaped
 * (`labs.preview`, `labs.longitudinal`, `continuity.retention`, `operational.self`,
 * …), NEVER feature/surface-shaped (not `labs.fieldLab`, not `can_use_labs`).
 * Target resolver shape: Member → Delegated Authorities → Constitutional
 * Obligations → Entitlements → UI/API. `members.tester` is the *transitional*
 * proto-source for `labs.preview` only — the gate Field Lab uses today — kept
 * verbatim here for zero behavior change, not the final resolver model.
 * (Founding Circle is a designation/patronage axis and must NEVER appear here.)
 *
 * Zero-behavior-change anchor: `labs.preview` is present iff
 * `isMemberTester(memberId)`.
 */

import { getCurrentSession } from '@/lib/auth/serverSessions';
import { isMemberTester } from '@/lib/auth/tester';

/** Known entitlement keys. Grows as surfaces adopt the entitlement layer. */
export type EntitlementKey = 'labs.preview';

export type EntitlementSet = ReadonlySet<EntitlementKey>;

/**
 * Resolve the entitlement set for a member.
 *
 * `labs.preview` is the generalization of the tester proto-entitlement — it is
 * present iff the member is a tester. (When new entitlements are added, resolve
 * each from its own source; do NOT collapse them onto tier.)
 */
export async function resolveEntitlements(memberId: string): Promise<EntitlementSet> {
  const set = new Set<EntitlementKey>();
  if (await isMemberTester(memberId)) set.add('labs.preview');
  return set;
}

export function hasEntitlement(set: EntitlementSet, key: EntitlementKey): boolean {
  return set.has(key);
}

export type RequireEntitlementResult =
  | { ok: true; memberId: string; entitlements: EntitlementSet }
  | { ok: false; reason: 'signed-out' | 'denied'; memberId: string | null };

/**
 * Server gate: resolve the current session's entitlements and require `key`.
 * Returns a discriminated result; the caller turns it into a 401/403 as fits.
 *
 * NOTE: Field Lab is client-gated today (a render branch via <PreviewGate>);
 * it has no server enforcement, and adding one would be a behavior change. This
 * helper is the server primitive for FUTURE surfaces that need real enforcement
 * — it is intentionally NOT wired into Field Lab in this increment.
 */
export async function requireEntitlement(
  key: EntitlementKey,
): Promise<RequireEntitlementResult> {
  const session = await getCurrentSession();
  if (!session) return { ok: false, reason: 'signed-out', memberId: null };
  const entitlements = await resolveEntitlements(session.memberId);
  if (!hasEntitlement(entitlements, key)) {
    return { ok: false, reason: 'denied', memberId: session.memberId };
  }
  return { ok: true, memberId: session.memberId, entitlements };
}
