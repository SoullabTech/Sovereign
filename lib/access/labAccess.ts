/**
 * Lab Tools access — who may enter the internal laboratory.
 *
 * WHY THIS IS NOT requireFounder() (founder ruling 2026-09-04):
 *
 * /labtools was gated on requireFounder(), so the only way to admit a founding
 * member to Lab Tools was to add them to FOUNDER_MEMBER_IDS. That allowlist is
 * not a Lab Tools list — it is the authority for founder-PRIVATE surfaces:
 * the /api/founder/* console (contacts, tasks, signals, rollout, content),
 * Book Studio drafts, workbench uploads, the render pipeline. Adding a
 * founding member there to get them through the Lab Tools door would hand them
 * the founder's private correspondence and unpublished manuscript drafts as a
 * side effect.
 *
 * The ruling: don't misclassify someone as the founder to get them through a
 * gate. Two authorities, named for what they actually are:
 *
 *   FOUNDER_MEMBER_IDS     the founder — founder-private surfaces
 *   LAB_ACCESS_MEMBER_IDS  founding members — the internal laboratory
 *
 * Founders are included automatically (the sets are unioned), so the founder is
 * never listed twice and can never be locked out of the lab by an omission
 * here. Membership of the lab list confers NOTHING beyond Lab Tools: it is
 * read by this module alone.
 *
 * CONFIGURATION — comma-separated member UUIDs, alongside FOUNDER_MEMBER_IDS
 * in the production env on minisforum:
 *
 *   LAB_ACCESS_MEMBER_IDS=<uuid>,<uuid>
 *
 * FAILS CLOSED, like the founder allowlist: if neither var is set, nobody
 * passes. Forgetting to configure it must refuse, never admit.
 *
 * ⚠️ This module answers WHO MAY ENTER. It does not make Lab Tools a member
 * surface: /labtools remains the internal development and research
 * environment, ruled out of the House
 * (lib/navigation/houseDispositions.ts → labtools). A member capability
 * belongs on a member surface, not behind this door — which is exactly why
 * Reflections was moved out to /reflections rather than admitted through here.
 */

import { getCurrentSession } from '@/lib/auth/serverSessions';
import { isFounderMemberId } from '@/lib/founder/founderAuth';

const LAB_ACCESS_MEMBER_IDS: ReadonlySet<string> = new Set(
  (process.env.LAB_ACCESS_MEMBER_IDS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
);

export type LabAccessResult =
  | { ok: true; memberId: string }
  | { ok: false; status: 401 | 403; error: string };

/** Founders always have lab access; listed founding members do too. */
export function hasLabAccess(memberId: string): boolean {
  return isFounderMemberId(memberId) || LAB_ACCESS_MEMBER_IDS.has(memberId);
}

/**
 * Check whether the current request may enter Lab Tools.
 * Mirrors requireFounder()'s shape so a layout can swap one for the other.
 */
export async function requireLabAccess(): Promise<LabAccessResult> {
  const session = await getCurrentSession();

  if (!session?.memberId) {
    return { ok: false, status: 401, error: 'Authentication required' };
  }

  if (!hasLabAccess(session.memberId)) {
    return { ok: false, status: 403, error: 'Lab Tools access required' };
  }

  return { ok: true, memberId: session.memberId };
}

/**
 * For diagnostics — how many ids are configured for lab access, founders
 * included. Never returns the ids themselves.
 */
export function getLabAccessAllowlistSize(): number {
  return LAB_ACCESS_MEMBER_IDS.size;
}
