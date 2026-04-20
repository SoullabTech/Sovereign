/**
 * buildMaiaContext — Identity-layer continuity for MAIA
 *
 * PRINCIPLE
 * ─────────
 * Natal chart and display name are IDENTITY-LAYER continuity, not
 * feature-layer invocations. They must be present in every MAIA
 * generation path by default — not gated behind explicit invocation,
 * not left to individual routes to remember to load.
 *
 * This solves the context-fragmentation class of bugs where a conversation
 * flowing through a newer/alternative route (voice, sovereign, etc.)
 * silently loses the natal chart that the original oracle route loaded,
 * causing MAIA to ask for birth data that is already on file.
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

import { getAstrologyContextForUser } from '@/lib/services/maiaAstrologyContextService';
import { query } from '@/lib/db/postgres';
import { resolveMemberDisplayName } from '@/lib/stellium/clients';

export interface MaiaIdentityContext {
  userId: string;
  /** Natal chart + current transits + celestial events, pre-formatted for prompt injection */
  astrologyAddendum?: string;
  /** Display name resolved from member row (prevents "Friend" fallback when member exists) */
  userName?: string;
  /** Whether birth data is on file — callers may log this for observability */
  hasBirthData: boolean;
}

async function lookupMemberDisplayName(userId: string): Promise<string | null> {
  try {
    const result = await query(
      `SELECT id, name, username, passkey, preferred_name FROM members
       WHERE id::text = $1 OR username = $1 OR passkey = $1
       LIMIT 1`,
      [userId],
    );
    if (result.rows.length === 0) return null;
    return resolveMemberDisplayName(result.rows[0]);
  } catch {
    return null;
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

  const [astrologyContext, displayName] = await Promise.all([
    getAstrologyContextForUser(userId).catch((err) => {
      console.warn('[buildMaiaContext] astrology load failed:', err);
      return null;
    }),
    lookupMemberDisplayName(userId),
  ]);

  const astrologyAddendum = astrologyContext?.formattedContext || undefined;

  return {
    userId,
    astrologyAddendum,
    userName: displayName || undefined,
    hasBirthData: astrologyContext?.hasBirthData ?? false,
  };
}
