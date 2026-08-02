/**
 * Workbench access — the narrow amendment to WORKBENCH_ARCHITECTURE_v0 §8.
 *
 * §8 lists "Founder-only" as a sovereignty invariant, enforced by
 * requireFounder() in every workbench route and page layout. That invariant
 * is amended here, narrowly and only here:
 *
 *   An authenticated member may reach their OWN private Workbench data.
 *
 * What this does NOT authorize (§1 "out of v0 entirely" still holds):
 *   - shared or multi-user tables
 *   - collaborative access to anyone else's table
 *   - graduation into drafts (from-group stays requireFounder())
 *   - uploads (uploads/* routes stay requireFounder())
 *   - source adapters beyond `keep` for members
 *   - any change to the founder Workbench's existing data or behaviour
 *
 * Scoping is not a new mechanism: every workbench query already filters on
 * `arranger_id = auth.memberId`. Returning a member's own id from this helper
 * therefore confines them to their own rows by the same clause that confines
 * the founder to theirs. There is no cross-arranger read path to close.
 *
 * `role` exists so callers can vary the SOURCE SET by caller — not to vary
 * the row scope. See sourcesForRole() in lib/workbench/sources.
 */

import { getCurrentSession } from '@/lib/auth/serverSessions';
import { requireFounder } from '@/lib/founder/founderAuth';

export type ArrangerRole = 'founder' | 'member';

export type ArrangerAuthResult =
  | { ok: true; memberId: string; role: ArrangerRole }
  | { ok: false; status: 401 | 403; error: string };

/**
 * Authenticated arranger — founder or member — scoped to their own data.
 *
 * Founder is checked first so the founder keeps the exact source set and
 * behaviour they had before this amendment.
 */
export async function requireArranger(): Promise<ArrangerAuthResult> {
  const founder = await requireFounder();
  if (founder.ok) {
    return { ok: true, memberId: founder.memberId, role: 'founder' };
  }

  // 401 from requireFounder means no session at all — not a role failure.
  if (founder.status === 401) {
    return { ok: false, status: 401, error: 'Authentication required' };
  }

  const session = await getCurrentSession();
  if (!session?.memberId) {
    return { ok: false, status: 401, error: 'Authentication required' };
  }

  return { ok: true, memberId: session.memberId, role: 'member' };
}
