/**
 * buildMaiaContext — Identity-layer continuity for MAIA
 *
 * PRINCIPLE
 * ─────────
 * Display name and pronouns may provide MAIA identity continuity.
 * A birth chart is different: even when the member has opted in to private
 * calculation/display, it is NOT automatically carried into conversation.
 * The Astrology room has a separate member-reviewed Send gesture that
 * supplies the approved words as a user-authored message; this shared loader
 * cannot infer or grant that gesture from a stored preference or birth row.
 *
 * USAGE
 * ─────
 * Call at the top of any MAIA response generator before prompt assembly.
 * Returned fields are "fill missing only" — callers that already loaded
 * some context can skip the fields they have.
 *
 * SCOPE NOTE
 * ──────────
 * Member web (patterns + sessions + journals) is NOT loaded here because
 * `lib/memory/MemberLiveContext.ts` has pre-existing type drift that would
 * expand this change's surface. Routes that want member web continue to
 * load and supply `memberWebAddendum` themselves (oracle/conversation,
 * sovereign/app/maia/list already do). Folding it in here can happen in
 * a follow-up once MemberLiveContext's types are settled.
 */

import { query } from '@/lib/db/postgres';
import { resolveMemberDisplayName } from '@/lib/stellium/clients';

export interface MaiaIdentityContext {
  userId: string;
  /** R4e compatibility only: NEVER populated by ambient identity continuity. */
  astrologyAddendum?: string;
  /** Display name resolved from member row (prevents "Friend" fallback when member exists) */
  userName?: string;
  /** Preferred pronouns (freeform, e.g. 'he/him', 'she/her', 'they/them') — surfaced so MAIA does not infer from name */
  pronouns?: string;
  /** No passive birth-row lookup: deliberately false on generic MAIA turns. */
  hasBirthData: boolean;
}

async function lookupMemberIdentity(
  userId: string,
): Promise<{ displayName: string | null; pronouns: string | null }> {
  try {
    const result = await query(
      `SELECT id, name, username, passkey, preferred_name, pronouns FROM members
       WHERE id::text = $1 OR username = $1 OR passkey = $1
       LIMIT 1`,
      [userId],
    );
    if (result.rows.length === 0) return { displayName: null, pronouns: null };
    const row = result.rows[0];
    const pronouns =
      typeof row.pronouns === 'string' && row.pronouns.trim().length > 0
        ? row.pronouns.trim()
        : null;
    return { displayName: resolveMemberDisplayName(row), pronouns };
  } catch {
    return { displayName: null, pronouns: null };
  }
}

/**
 * Load identity-layer context for a MAIA response.
 *
 * Non-blocking philosophy: each loader runs independently and failures
 * return undefined for that slice rather than throwing. A route should
 * never fail to generate because identity loading partially failed.
 */
export async function buildMaiaContext(
  userId: string,
): Promise<MaiaIdentityContext> {
  if (!userId) {
    return { userId: '', hasBirthData: false };
  }

  // R4e: identity continuity is not permission to disclose a chart to MAIA.
  // Do not fetch a birth row or inject natal/transit context here. Member-
  // reviewed Send in the Astrology room supplies the approved text directly.
  const identity = await lookupMemberIdentity(userId);

  return {
    userId,
    astrologyAddendum: undefined,
    userName: identity.displayName || undefined,
    pronouns: identity.pronouns || undefined,
    hasBirthData: false,
  };
}
