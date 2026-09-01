/**
 * WS2-06A — the member makes a reviewed reading canonical.
 *
 * THE DECISIVE SENTENCE: the member may make the reviewed structure canonical;
 * MAIA may never cross that boundary for them. Everything here follows from it.
 *
 * WHAT THE ADOPTED ROWS SAY ABOUT AUTHORSHIP. Adopted units are written
 * `origin = 'member'` with `adopted_from_id = NULL`. MAIA proposed, the member
 * reviewed, and the member authored the canonical structure by performing this
 * act — so the rows record the member, and the proposal records what they were
 * answering.
 *
 * `adopted_from_id` BELONGS TO AN ABANDONED MODEL and is NOT populated by
 * adoption. Migration 20260830000002 expected proposals to live in
 * `manuscript_structure_units` as `origin = 'proposed'` rows, which is why that
 * column is a self-reference; 05B instead put proposals in their own table as
 * JSONB, whose reviewed unit ids ('p1', 'p3') are proposal-internal and are not
 * unit uuids. Nothing writes `origin = 'proposed'`. That migration's comment is
 * left exactly as it stands — it accurately records what 05A expected — and this
 * file is the superseding authority.
 *
 * WHAT PROVENANCE IS AND IS NOT PRESERVED. Adoption-level, deliberately:
 *
 *     proposal ─ frozen interpretation · frozen reader provenance
 *                · reviewed revision N · adopted_at · adopted_review_revision = N
 *     canonical ─ ordinary member-authored units
 *
 * That answers "which reviewed proposal did the member make canonical, and at
 * what revision". It does NOT answer "which canonical uuid descended from
 * reviewed unit p3" — no identity mapping is persisted, and after later human
 * edits that lineage could not be reconstructed honestly. Per-unit descent is a
 * separate design decision if it is ever genuinely needed, and would be an
 * explicit mapping record — never a misuse of `adopted_from_id`.
 *
 * INTO AN EMPTY CANONICAL STRUCTURE ONLY. No replacement semantics, no merging
 * algorithm. The database already refuses a second adoption per manuscript
 * (a unique partial index), and this refuses adoption over authored units that
 * already exist. Replacement is the sharpest danger in this unit and is not
 * designed.
 *
 * NOTHING IS SUPPLIED BY THE CALLER. The tree comes from the stored `reviewed`
 * of the proposal the member names, re-read inside the transaction. A client
 * that could post a tree could write a structure no one reviewed.
 */

import { transaction, type TransactionClient } from '@/lib/db/postgres';
import { sectionTopologyHash } from './evidence';
import { sectionRun } from './tree';
import type { ReviewedStructure, ReviewedUnit } from './review';

export type AdoptRefusal =
  | 'not_found'
  /** The member's screen was built from a different revision than the stored one. */
  | 'stale_revision'
  | 'already_adopted'
  /** The writable pieces or their order changed: the proposal is no longer about this book. */
  | 'topology_changed'
  /** Authored structure already exists. Adopting over it would be replacement. */
  | 'structure_exists'
  /** A `none` reading, or a reviewed shape with no divisions. There is nothing to make canonical. */
  | 'nothing_to_adopt'
  | 'unknown_section';

export type AdoptResult =
  | { status: 'ok'; unitsCreated: number; sectionsPlaced: number; adoptedReviewRevision: number }
  | { status: 'refused'; refusal: AdoptRefusal; detail?: string };

const refuse = (refusal: AdoptRefusal, detail?: string): AdoptResult =>
  detail ? { status: 'refused', refusal, detail } : { status: 'refused', refusal };

interface ProposalRow {
  reviewed: ReviewedStructure;
  review_revision: number;
  section_topology_hash: string;
  adopted_at: Date | null;
}

/** Depth-first, parents before children, so a child always has a parent id. */
async function insertUnits(
  tx: TransactionClient,
  manuscriptId: string,
  units: readonly ReviewedUnit[],
  parentId: string | null,
  sections: readonly { id: string; position: number }[],
  counters: { units: number; placed: Set<string> },
): Promise<AdoptRefusal | null> {
  for (let i = 0; i < units.length; i += 1) {
    const u = units[i];
    const run = sectionRun(u.fromSectionId, u.toSectionId, sections);
    if (!run.ok) return 'unknown_section';

    const inserted = await tx.query<{ id: string }>(
      `INSERT INTO manuscript_structure_units
         (manuscript_id, parent_id, position, kind, title, origin, adopted_from_id)
       VALUES ($1, $2, $3, $4, $5, 'member', NULL)
       RETURNING id`,
      [manuscriptId, parentId, i, u.kind?.trim() || null, u.title?.trim() || null]);
    const id = inserted.rows[0].id;
    counters.units += 1;

    /* A child's run lies inside its parent's, so inserting children after the
       parent moves those sections from the parent to the child — which is the
       membership the reviewed tree describes. Delete-then-insert for the same
       reason placeSections does it: the primary key is (unit_id,
       draft_section_id), so a section changing units is two different rows. */
    await tx.query(
      `DELETE FROM manuscript_structure_members WHERE draft_section_id = ANY($1::uuid[])`,
      [run.ids]);
    await tx.query(
      `INSERT INTO manuscript_structure_members (unit_id, draft_section_id)
       SELECT $1, unnest($2::uuid[])`,
      [id, run.ids]);
    /* A Set, not a running total: a child re-places the subset of its parent's
       run that belongs to it, so summing writes would report more sections than
       the Work has. What the caller is told is how many sections ended up in a
       division. */
    for (const id of run.ids) counters.placed.add(id);

    const bad = await insertUnits(tx, manuscriptId, u.children, id, sections, counters);
    if (bad) return bad;
  }
  return null;
}

/**
 * Make the reviewed structure of one proposal the Work's canonical structure.
 *
 * Every refusal writes NOTHING. The whole act is one transaction, so a refusal
 * discovered after the first insert leaves no half-adopted outline behind.
 */
export async function adoptProposal(
  manuscriptId: string,
  memberId: string,
  proposalId: string,
  reviewRevision: number,
): Promise<AdoptResult> {
  return transaction(async (tx) => {
    /* Serialises against a concurrent adoption of a different proposal, which
       the unique index would otherwise decide by whoever committed first. */
    const owned = await tx.query(
      `SELECT 1 FROM member_manuscripts WHERE id = $1 AND member_id = $2 FOR UPDATE`,
      [manuscriptId, memberId]);
    if (owned.rows.length === 0) return refuse('not_found');

    const p = await tx.query<ProposalRow>(
      `SELECT reviewed, review_revision, section_topology_hash, adopted_at
         FROM manuscript_structure_proposals
        WHERE id = $1 AND manuscript_id = $2
        FOR UPDATE`,
      [proposalId, manuscriptId]);
    if (p.rows.length === 0) return refuse('not_found');
    const row = p.rows[0];

    if (row.adopted_at !== null) return refuse('already_adopted');

    /* The revision the member's screen was built from. Adopting a different one
       would make canonical a structure they never saw. */
    if (Number(row.review_revision) !== reviewRevision) {
      return refuse('stale_revision', `stored revision ${row.review_revision}`);
    }

    const draft = await tx.query<{ id: string }>(
      `SELECT d.id FROM manuscript_working_drafts d
        WHERE d.manuscript_id = $1 AND d.section_addressable_at IS NOT NULL`,
      [manuscriptId]);
    if (draft.rows.length === 0) return refuse('not_found');

    /* The same shape the reader was given, heading included — so the hash is
       computed over a real HeadedSection rather than a value cast into one. */
    const sec = await tx.query<{ id: string; position: number; heading: string | null }>(
      `SELECT s.id, s.position, ms.heading
         FROM manuscript_draft_sections s
         LEFT JOIN manuscript_sections ms ON ms.id = s.source_section_id
        WHERE s.draft_id = $1 ORDER BY s.position ASC`,
      [draft.rows[0].id]);
    const sections = sec.rows.map((s) => ({
      id: s.id, position: Number(s.position), heading: s.heading,
    }));

    /* THE HARD GATE. If the writable pieces or their order changed, this
       proposal is no longer about this book. The migration is explicit that
       interpretation_input_hash is NOT this gate — a rewritten body is a soft
       signal the member is told about, not a reason to refuse their act. */
    if (sectionTopologyHash(sections) !== row.section_topology_hash) {
      return refuse('topology_changed');
    }

    /* Adoption is into an EMPTY canonical structure. Anything else is
       replacement, which is not designed. */
    const existing = await tx.query<{ n: string }>(
      `SELECT count(*) AS n FROM manuscript_structure_units
        WHERE manuscript_id = $1 AND origin <> 'proposed'`,
      [manuscriptId]);
    if (Number(existing.rows[0].n) > 0) return refuse('structure_exists');

    const reviewed = row.reviewed;
    if (!reviewed || !Array.isArray(reviewed.units) || reviewed.units.length === 0) {
      /* A `none` reading reached here honestly: MAIA found no stable larger
         structure. There is nothing to make canonical, and inventing a single
         wrapper division would be the system authoring structure. */
      return refuse('nothing_to_adopt');
    }

    const counters = { units: 0, placed: new Set<string>() };
    const bad = await insertUnits(tx, manuscriptId, reviewed.units, null, sections, counters);
    if (bad) return refuse(bad);

    await tx.query(
      `UPDATE manuscript_structure_proposals
          SET adopted_at = now(), adopted_review_revision = $1
        WHERE id = $2`,
      [reviewRevision, proposalId]);

    return {
      status: 'ok' as const,
      unitsCreated: counters.units,
      sectionsPlaced: counters.placed.size,
      adoptedReviewRevision: reviewRevision,
    };
  });
}
