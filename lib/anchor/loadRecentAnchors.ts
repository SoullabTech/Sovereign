/**
 * MEMBER-AUTHORED CONTINUITY — Daily Anchor loader.
 *
 * Loads the member's own words verbatim from member_daily_anchors.
 * No paraphrasing. No system interpretation. No inference.
 *
 * Returns most-recent-first, limited to recent days.
 *
 * See:
 *   - docs/canon/LONGITUDINAL_MEMORY_CATEGORY_GRADIENT.md (form category)
 *   - scripts/maia-simulations/scenarios.json (S1–S6 falsifiability gate)
 */

import { query } from '@/lib/db/postgres';

export interface RecentAnchor {
  date: string;          // YYYY-MM-DD
  promptShown: string;   // the prompt MAIA showed the member that day
  response: string;      // the member's verbatim words — DO NOT paraphrase
  createdAt: string;
}

/**
 * Load up to `limit` recent anchors for a member, ordered most-recent-first.
 *
 * Graceful degradation: returns [] on any error (missing table, missing
 * memberId, query failure). Anchor context is enhancement, not requirement —
 * the conversation must continue even if anchors fail to load.
 */
export async function loadRecentAnchors(
  memberId: string,
  limit: number = 3,
): Promise<RecentAnchor[]> {
  if (!memberId) return [];

  try {
    const result = await query(
      `SELECT
         anchor_date::text AS date,
         prompt_shown,
         response,
         created_at::text AS created_at
       FROM member_daily_anchors
       WHERE member_id = $1
       ORDER BY anchor_date DESC
       LIMIT $2`,
      [memberId, limit],
    );

    return result.rows.map((row: any) => ({
      date: row.date,
      promptShown: row.prompt_shown,
      response: row.response,
      createdAt: row.created_at,
    }));
  } catch (err: any) {
    console.warn(
      '[anchor] loadRecentAnchors failed (graceful degradation):',
      err?.message || err,
    );
    return [];
  }
}
