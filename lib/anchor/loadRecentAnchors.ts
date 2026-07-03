/**
 * MEMBER-AUTHORED CONTINUITY — Daily Anchor loader (ambient surfacing path).
 *
 * Loads the member's own words verbatim from member_daily_anchors.
 * No paraphrasing. No system interpretation. No inference.
 *
 * Returns most-recent-first, limited to recent days.
 *
 * STANDING-CONSENT GATE (load-bearing — do not relax):
 *   This loader feeds AMBIENT surfacing (the anchor context block injected into
 *   MAIA's prompt every turn). Ambient surfacing requires member standing
 *   consent: the WHERE clause admits ONLY anchors the member has opted in to
 *   surface (surface_preference IN ('contextual_doorway','ritual_review_opt_in')).
 *   `member_pulled` (the default) is structurally excluded here — those anchors
 *   surface only when the member explicitly pulls them, never ambiently.
 *
 *   The eligibility to surface must originate from a MEMBER act, not a deployment
 *   flag. MAIA_ANCHOR_CONTEXT_ENABLED remains a kill-switch only; this predicate
 *   is the consent source. This is enforced structurally (SQL predicate), not by
 *   prompt discipline, and is proven by the refusal registry (R08).
 *
 *   This gate scopes to AMBIENT surfacing only. The member reviewing their OWN
 *   anchors (/api/anchor/recent) is member-initiated and returns all anchors
 *   regardless of preference — that is not ambient surfacing.
 *
 * See:
 *   - docs/canon/SPIRAL_CONTINUITY_ENGINE.md §7 (reflection is invitable, never
 *     ambient) — the canonical grounding for this gate
 *   - lib/anchor/surfacePreference.ts (value vocabulary, mirrors atoms)
 *   - tests/constitutional/refusal-registry/refusal-08-anchor-consent-gated-surfacing.ts
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
         AND surface_preference IN ('contextual_doorway', 'ritual_review_opt_in')
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
