/**
 * RETURN-RELATIONSHIP · PHASE B — finding the editorial relationships that
 * already exist on a passage.
 *
 * ⭐⭐ THE GAP PHASE A FOUND, AND IT IS EXACTLY ONE READ. Every editorial read in
 * canonical takes a `threadId` the caller already has — six reads by identity,
 * zero by section. So a relationship could be opened and re-entered from a URL,
 * and never FOUND. Returning tomorrow with a fresh URL opened a SECOND
 * relationship on the same passage and showed nothing of the first.
 *
 * ⛔ NO NEW TABLE, COLUMN OR MIGRATION. Every field below was already stored by
 * the acts that came before; nothing had ever read them back by section.
 *
 * ── ⛔ WHAT THIS DELIBERATELY DOES NOT DO ─────────────────────────────────
 *
 *     ORDER BY opened_at DESC LIMIT 1   ⛔ "most recent" is the RETURN-LOCUS
 *                                          defect in a new place
 *     the only one with turns           ⛔ activity is not intent
 *     the only one with versions        ⛔ nor is authorship
 *     one relationship per passage      ⛔ plurality is LAWFUL — two exchanges
 *                                          may freeze different passages or
 *                                          pursue different questions
 *
 * ⭐ It returns every relationship, whole, and lets the surface — and through it
 * the writer — decide. The store already said so about the other subject:
 * *"many threads per anchor are lawful … this exists so a surface can OFFER to
 * resume one rather than being structurally unable to make a second, which is
 * presentation policy and deliberately not enforced here."*
 *
 * ── ⭐ AND THE CHOOSING LAW IS NOT REIMPLEMENTED HERE ─────────────────────
 *
 * `observationDialogueResume` already holds it — `resumeDecision` /
 * `sendMode`, pure and proven, including the `unavailable` state that refuses
 * to round *could not find out* to *there are none*. ⛔ A second copy of that
 * law is a second thing that can drift. This module supplies the SUBJECT; that
 * module supplies the DECISION.
 */

import { query } from '@/lib/db/postgres';
import { locusIsAdoptable } from '../proposalChain/legacyLocus';
import type { VerifiedIdentity } from './turn';

/**
 * ⭐ One relationship, in terms a writer can recognise.
 *
 * ⛔ THE FROZEN PASSAGE IS THE POINT. A chooser listing thread identifiers would
 * ask her to recognise a UUID — the failure Reader-04 removed from MAIA's prose,
 * reappearing in the interface. What distinguishes two exchanges on one chapter
 * is *which words they are about*.
 */
export interface EditorialRelationship {
  readonly threadId: string;
  readonly chainId: string;
  readonly sectionId: string;
  /** The writer's own heading, or `null`. ⛔ Never a manufactured name. */
  readonly sectionLabel: string | null;
  /** ⭐ The passage this exchange froze, as it stood when it opened. */
  readonly locusText: string;
  readonly openedAt: string;
  /** ⛔ `null` when nothing has been said yet — a different fact from "just opened". */
  readonly lastSpokeAt: string | null;
  readonly turnCount: number;
  readonly versionCount: number;
  /**
   * ⚠️ Pre-alignment locus: readable and comparable, ⛔ never adoptable.
   *
   * ⭐ IT IS STILL OFFERED FOR RESUMPTION. Withholding it would hide a real
   * exchange because one future act is unavailable — its history does not
   * disappear.
   */
  readonly legacyLocus: boolean;
}

/**
 * ⭐ Every editorial relationship on one draft section, owned by this member.
 *
 * ⛔ ORDERED ASCENDING BY `opened_at`, AND THAT IS PRESENTATION ONLY. Ascending
 * deliberately: with `DESC` the newest exchange would sit at the top of the
 * list, and a surface — or a reader of this code — would be one careless step
 * from treating position as precedence. ⛔ No `LIMIT`, and no row is marked.
 */
export async function editorialRelationshipsForSection(
  identity: VerifiedIdentity, sectionId: string,
): Promise<readonly EditorialRelationship[]> {
  const r = await query<{
    thread_id: string; chain_id: string; section_id: string; heading: string | null;
    expected_text: string; opened_at: Date; last_spoke_at: Date | null;
    turn_count: string; version_count: string;
  }>(
    /* ⭐ ONE STATEMENT. Counts and the last spoken moment are aggregates over
       the same snapshot the row came from — two round trips could report a turn
       count from one moment and a timestamp from another. */
    `SELECT th.id            AS thread_id,
            c.id             AS chain_id,
            c.target_section_id AS section_id,
            ms.heading,
            c.expected_text,
            th.opened_at,
            (SELECT MAX(u.created_at) FROM ask_turns u WHERE u.thread_id = th.id)
                             AS last_spoke_at,
            (SELECT COUNT(*) FROM ask_turns u WHERE u.thread_id = th.id)
                             AS turn_count,
            (SELECT COUNT(*) FROM proposal_versions v WHERE v.chain_id = c.id)
                             AS version_count
       FROM ask_threads th
       JOIN proposal_chains c ON c.id = th.proposal_chain_id
       LEFT JOIN manuscript_draft_sections ds ON ds.id = c.target_section_id
       LEFT JOIN manuscript_sections ms ON ms.id = ds.source_section_id
      WHERE th.member_id = $2
        AND c.target_section_id = $1
      ORDER BY th.opened_at ASC`,
    [sectionId, identity.memberId]);

  return r.rows.map((x) => ({
    threadId: x.thread_id,
    chainId: x.chain_id,
    sectionId: x.section_id,
    sectionLabel: x.heading,
    locusText: x.expected_text,
    openedAt: new Date(x.opened_at).toISOString(),
    lastSpokeAt: x.last_spoke_at === null ? null : new Date(x.last_spoke_at).toISOString(),
    turnCount: Number(x.turn_count),
    versionCount: Number(x.version_count),
    /* ⭐ The same pure predicate the adoption seam and the thread read ask, so
       listing needs no second read and the three can never disagree. */
    legacyLocus: !locusIsAdoptable(x.expected_text, x.heading),
  }));
}
