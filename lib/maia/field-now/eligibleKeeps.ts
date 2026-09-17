/**
 * EAA-03 / P1 — the Home Arrival continuity adapter.
 *
 * ONE QUESTION, ASKED NARROWLY: what has this member explicitly chosen to keep,
 * most recently? Nothing here ranks, scores, infers, summarizes or interprets.
 *
 * A row returned by this module means exactly one thing:
 *
 *     You chose to keep this.
 *
 * It does NOT mean the material is important now, central to the member's life,
 * psychologically salient, or something MAIA thinks matters. Chronological
 * recency of a member's Keep act is not importance, and the surface that renders
 * these rows is bound by the same restraint (EAA-03 P1-D §XI).
 *
 * ⛔ NO DEPENDENCY ON `living_field_affinities`, direct or indirect. Destination
 * and score there are system-chosen (see the P1-B census), so an affinity cannot
 * support a claim about what the member has been carrying. This module never
 * reads that table, never joins it, and never orders by anything it produces.
 *
 * ⛔ READ-ONLY. No INSERT, UPDATE or DELETE. Opening Home is not consent to
 * create a model of the member.
 *
 * ── Eligibility ───────────────────────────────────────────────────────────
 *
 * The boundary is `livingFieldAtomGuards()` (LF-SCOPE-01, commit 6adbc3bb),
 * imported rather than restated so Home and Living Field cannot drift apart.
 * It contributes: personal scope only · no practitioner-authored material · the
 * canonical practitioner-attribution guard · no member-rejected material · no
 * sanctuary posture · no sacred / protected / archived material.
 *
 * Home then adds TWO restrictions that Living Field deliberately does not carry,
 * because the two surfaces ask differently:
 *
 *   return_preference — Living Field is a place the member NAVIGATES INTO, and
 *     opening it is asking, so it does not filter this. Home Arrival surfaces
 *     material UNBIDDEN around the centre: the member arrived, they did not ask
 *     for these items. That is the contextual doorway the consent vocabulary was
 *     written for, so `member_pulled` — "only when the member asks directly" —
 *     is honoured here and excluded.
 *
 *   status — narrowed to the canonical loader's allowlist. `set_aside` is
 *     "parked (lower weight)", a member gesture meaning not-now; surfacing
 *     parked material unbidden on arrival would override it.
 *
 * ⚠️ `generated_by` is NOT filtered, per the P1-D §I ruling: that column defaults
 * to 'unattributed-historical' for every atom minted before 20260718000001, so a
 * modern-provenance allowlist would silently erase legitimate historical Keeps
 * from the member's own continuity rather than contain unauthorized context.
 */

import { query } from '@/lib/db/postgres';
import { livingFieldAtomGuards } from '@/lib/maia/living-field/atomEligibility';

/** The ceiling is a containment, never a curation. */
export const FIELD_NOW_MAX_THREADS = 3;

/**
 * One thing the member chose to keep.
 *
 * `sourceType` is carried raw and deliberately un-mapped: turning it into member
 * -facing words is a presentation decision, and a display layer that cannot
 * truthfully name a source must omit it rather than invent one (P1-D §XIV).
 */
export interface EligibleKeep {
  id: string;
  /** The member's own short label. NOT NULL in schema; never generated. */
  title: string;
  /** Canonical source_type — the ONLY provenance signal, never inferred. */
  sourceType: string;
  /** The formation moment: when the member CHOSE to keep this. */
  keptAt: Date;
}

/**
 * Up to three eligible Keeps, most recently formed first.
 *
 * Ordering is `kept_at DESC` — a member act, which is what gives chronology a
 * truthful meaning — with `id DESC` as a deterministic, non-semantic tie-break
 * already present in the schema. ⛔ No relevance, similarity or model ranking
 * resolves a tie.
 *
 * Failure is empty, never partial: a thrown query means the caller renders the
 * valid zero state rather than a half-populated field.
 */
export async function loadEligibleKeeps(
  memberId: string,
  limit: number = FIELD_NOW_MAX_THREADS,
): Promise<EligibleKeep[]> {
  const bounded = Math.max(0, Math.min(Math.floor(limit), FIELD_NOW_MAX_THREADS));
  if (bounded === 0) return [];

  const result = await query<{
    id: string;
    title: string;
    source_type: string;
    kept_at: Date;
  }>(
    `SELECT id, title, source_type, kept_at
       FROM member_memory_atoms
      WHERE member_id = $1
        AND kept_at IS NOT NULL
        AND status IN ('active', 'still_alive')
        AND return_preference IN ('contextual_doorway', 'ritual_review_opt_in')
        AND ${livingFieldAtomGuards()}
      ORDER BY kept_at DESC, id DESC
      LIMIT $2`,
    [memberId, bounded],
  );

  return result.rows.map((r) => ({
    id: r.id,
    title: r.title,
    sourceType: r.source_type,
    keptAt: r.kept_at,
  }));
}
