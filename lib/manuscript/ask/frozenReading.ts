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
    `SELECT p.id, p.manuscript_id, p.interpretation, p.reviewed, p.review_revision,
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
    reviewed: row.reviewed as ReviewedStructure,
    reviewRevision: Number(row.review_revision),
    interpretationInputHash: row.interpretation_input_hash as string,
    sectionTopologyHash: row.section_topology_hash as string,
    readerProvenance: (row.reader_provenance as unknown) ?? null,
    adoptedAt: (row.adopted_at as Date | null) ?? null,
  };
}

/** Headings and positions for the Work. No bodies, by construction. */
export async function loadSectionHeads(manuscriptId: string): Promise<SectionHead[]> {
  const r = await query(
    `SELECT id, position, heading FROM manuscript_sections
      WHERE manuscript_id = $1 ORDER BY position`, [manuscriptId]);
  return r.rows.map((s: Record<string, unknown>) => ({
    id: s.id as string,
    position: Number(s.position),
    heading: (s.heading as string | null) ?? null,
  }));
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
export async function measureNow(manuscriptId: string): Promise<{
  sectionTopologyHash: string | null;
  newestProposalId: string | null;
  interpretationInputHash: null;
}> {
  const heads = await loadSectionHeads(manuscriptId);
  return {
    sectionTopologyHash: sectionTopologyHash(
      heads.map((h) => ({ ...h, body: '' })) as never),
    newestProposalId: await newestProposalId(manuscriptId),
    interpretationInputHash: null,
  };
}
