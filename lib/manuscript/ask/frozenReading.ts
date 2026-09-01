/**
 * WS2-05B-8B-02c-2 — the reading an Ask conversation reasons from, read-only.
 *
 * WHY THIS EXISTS RATHER THAN `proposalStore.loadProposal`.
 *
 * The Ask runtime must be STRUCTURALLY INCAPABLE of a canonical write, not
 * merely disciplined about it. `proposalStore` exports `updateReviewed`, and
 * `structureService` writes; importing either for a reader would put a writer in
 * the Ask module graph, one dropped `type` keyword away from being reachable.
 * This is the same separation `readerProvenance` already makes so the store can
 * "describe who read a Work without being able to reach the thing that reads".
 *
 * SO EVERY STATEMENT IN THIS FILE IS A SELECT. There is no INSERT, UPDATE or
 * DELETE here and there is no import of anything that has one - which is what
 * the static gate in `__tests__/askRuntimeCannotWrite.test.ts` asserts, and what
 * makes gate 7 a property of the program rather than a promise in a comment.
 *
 * ZERO BODIES. `manuscript_sections.body` is never selected. The opening context
 * of a conversation is the frozen reading, headings and positions - the prose
 * itself was consented for a READING, and a conversation is a new act. 02c-2
 * has no read-request expansion at all, so there is no path by which a body
 * reaches this surface.
 */

import { query } from '@/lib/db/postgres';
import type { StructureInterpretation } from '../structure/interpret';
import type { ReviewedStructure } from '../structure/review';
import { sectionTopologyHash } from '../structure/evidence';

export interface FrozenReading {
  proposalId: string;
  manuscriptId: string;
  interpretation: StructureInterpretation;
  /**
   * What she actually reasoned FROM, frozen with the reading.
   *
   * SUPPLIED BECAUSE THE PROMPT CLAIMS IT. The standing instructions tell her
   * she may draw on "the evidence you recorded at the time"; sending only the
   * interpretation left that a lie, and "why did you put 82 in Water?" would
   * have been answered by fresh rationalisation rather than by what she saw -
   * the exact failure the anchored room exists to prevent. Neither field is a
   * body read: `evidence` is observations over headings and `coverage` is a
   * record of which ids were supplied, not their prose.
   */
  evidence: unknown;
  coverage: unknown;
  reviewed: ReviewedStructure;
  reviewRevision: number;
  interpretationInputHash: string;
  sectionTopologyHash: string;
  readerProvenance: unknown | null;
  adoptedAt: Date | null;
}

/** Headings and positions only. Never `body`. */
export interface SectionHead {
  id: string;
  position: number;
  heading: string | null;
}

/**
 * Load a proposal, scoped to the member who owns the Work.
 *
 * The member scope is in the SQL rather than checked afterwards: a query that
 * can return another member's proposal has already leaked it, whatever the
 * caller does with the row next.
 */
export async function loadFrozenReading(
  manuscriptId: string, proposalId: string, memberId: string,
): Promise<FrozenReading | null> {
  const r = await query(
    `SELECT p.id, p.manuscript_id, p.interpretation, p.evidence, p.coverage,
            p.reviewed, p.review_revision,
            p.interpretation_input_hash, p.section_topology_hash,
            p.reader_provenance, p.adopted_at
       FROM manuscript_structure_proposals p
       JOIN member_manuscripts m ON m.id = p.manuscript_id
      WHERE p.id = $1 AND p.manuscript_id = $2 AND m.member_id = $3
      LIMIT 1`,
    [proposalId, manuscriptId, memberId]);

  const row = r.rows[0];
  if (!row) return null;
  return {
    proposalId: row.id as string,
    manuscriptId: row.manuscript_id as string,
    interpretation: row.interpretation as StructureInterpretation,
    evidence: (row.evidence as unknown) ?? null,
    coverage: (row.coverage as unknown) ?? null,
    reviewed: row.reviewed as ReviewedStructure,
    reviewRevision: Number(row.review_revision),
    interpretationInputHash: row.interpretation_input_hash as string,
    sectionTopologyHash: row.section_topology_hash as string,
    readerProvenance: (row.reader_provenance as unknown) ?? null,
    adoptedAt: (row.adopted_at as Date | null) ?? null,
  };
}

/**
 * Headings and positions for the Work, IN THE IDENTITY THE READING USED.
 *
 * THE ID NAMESPACE IS `manuscript_draft_sections.id`, NOT
 * `manuscript_sections.id`. The reader was run against the section-addressable
 * working draft, so every id inside a frozen division, question or uncertain
 * region is a draft-section id. Reading the source table instead returned a
 * DIFFERENT namespace: the headings handed to MAIA would not match the ids in
 * her own divisions, and `sectionTopologyHash` would report movement whenever
 * the two namespaces merely differ - which is always.
 *
 * This is deliberately the same query the structure/proposals route already
 * makes, including `section_addressable_at IS NOT NULL`, because two seams that
 * are supposed to address the same sections must not be written twice.
 *
 * IT ALSO PROVES OWNERSHIP, through `member_manuscripts.member_id`. That is a
 * property of this query and not a substitute for the route's own unconditional
 * check - an anchor that never reaches here must not thereby skip it.
 *
 * Still no bodies: `manuscript_sections.body` is not selected, and the heading
 * is joined from the source row only.
 */
export async function loadSectionHeads(
  manuscriptId: string, memberId: string,
): Promise<SectionHead[]> {
  const r = await query(
    `SELECT s.id, s.position, ms.heading
       FROM manuscript_draft_sections s
       JOIN manuscript_working_drafts d ON d.id = s.draft_id
       JOIN member_manuscripts m ON m.id = d.manuscript_id
       LEFT JOIN manuscript_sections ms ON ms.id = s.source_section_id
      WHERE d.manuscript_id = $1 AND m.member_id = $2
        AND d.section_addressable_at IS NOT NULL
      ORDER BY s.position ASC`, [manuscriptId, memberId]);
  return r.rows.map((s: Record<string, unknown>) => ({
    id: s.id as string,
    position: Number(s.position),
    heading: (s.heading as string | null) ?? null,
  }));
}

/**
 * Does this Work belong to this member.
 *
 * UNCONDITIONAL AT THE ROUTE, for every anchor. A `work` anchor loads no
 * proposal, so the proposal query - which carries its own member scope - never
 * runs, and without this a request could reach `openThread` having proved only
 * that the caller is SOME member and the id is SOME Work. Ownership is not an
 * incidental property of whichever read happened to occur.
 */
export async function memberOwnsWork(
  manuscriptId: string, memberId: string,
): Promise<boolean> {
  const r = await query(
    `SELECT 1 FROM member_manuscripts WHERE id = $1 AND member_id = $2 LIMIT 1`,
    [manuscriptId, memberId]);
  return r.rows.length > 0;
}

/** The newest proposal for this Work, for the supersession dimension. */
export async function newestProposalId(manuscriptId: string): Promise<string | null> {
  const r = await query(
    `SELECT id FROM manuscript_structure_proposals
      WHERE manuscript_id = $1 ORDER BY created_at DESC LIMIT 1`, [manuscriptId]);
  return (r.rows[0]?.id as string | undefined) ?? null;
}

/**
 * What is true of the Work right now, for `computeStaleness`.
 *
 * `interpretationInputHash` IS DELIBERATELY ABSENT. Computing it requires the
 * section BODIES, and this slice reads none - so the honest report is that the
 * dimension was not measured. It must therefore render as UNKNOWN and never as
 * unchanged, which is exactly the distinction the three-state shape exists to
 * keep. A cheaper stand-in computed from headings alone would be a different
 * measurement wearing the same name.
 */
export async function measureNow(manuscriptId: string, memberId: string): Promise<{
  sectionTopologyHash: string | null;
  newestProposalId: string | null;
  interpretationInputHash: null;
}> {
  const heads = await loadSectionHeads(manuscriptId, memberId);
  return {
    sectionTopologyHash: sectionTopologyHash(
      heads.map((h) => ({ ...h, body: '' })) as never),
    newestProposalId: await newestProposalId(manuscriptId),
    interpretationInputHash: null,
  };
}
