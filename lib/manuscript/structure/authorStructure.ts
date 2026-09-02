/**
 * WS2-06A — AuthorStructureCommand. The member makes a reviewed reading the
 * Work's structure.
 *
 * THE DECISIVE SENTENCE. Review may shape a possible structure; only an explicit
 * member act may make that structure part of the Work. MAIA may prepare the
 * threshold but may never cross it. Everything below follows from it.
 *
 * ROLLBACK DISCIPLINE — DECLARED, because the two available disciplines give
 * materially different guarantees and a proof is only reviewable if it says
 * which one it tests.
 *
 *     THIS COMMAND VALIDATES FULLY BEFORE ANY WRITE.
 *
 * Not "throws so the transaction rolls back". The command is split in two:
 * `planAuthoredStructure` is pure, total, and decides EVERY refusal; `writePlan`
 * returns void and has no refusal path at all. A refusal therefore cannot be
 * discovered after a write, because by the time any INSERT runs there is nothing
 * left that could refuse. `transaction()` in lib/db/postgres.ts COMMITs on a
 * normal callback return and rolls back only on a throw — so a command that
 * returned a refusal mid-insert would commit a partial outline while reporting
 * failure. That is the defect this shape makes unreachable.
 * (Specimen: WS2-06A adversarial review §2 D1 — evidence, not authority.)
 *
 * THE WHOLE TREE IS VALIDATED, NOT EACH UNIT SEPARATELY. `validateReviewed` runs
 * against the CURRENT draft sections before the plan exists. Per-unit range
 * resolution cannot substitute for it: resolving a run one unit at a time
 * normalises an inverted range instead of refusing it, and can see neither
 * sibling overlap nor child-outside-parent. Every structural refusal is typed
 * and reaches the member as itself — never as a 500 from the deferred contiguity
 * trigger or the sibling-order constraint standing in for validation.
 * (Specimen: review §2 D2, §2 D3.)
 *
 * WHAT THE ADOPTED ROWS SAY ABOUT AUTHORSHIP. `origin = 'member'`, with
 * `adopted_from_proposal_id` + `adopted_from_review_unit_key` naming what the
 * member was answering. MAIA proposed; the member reviewed; the member performed
 * the act that made it structure. The rows record the member. The provenance
 * pair is not a claim that MAIA authored anything — it is what makes the room
 * able to say the writer authored this structure FROM that reading.
 *
 * `adopted_from_id` IS NOT WRITTEN. It belongs to the abandoned model in which
 * proposals were `origin = 'proposed'` rows in this table. It survives only
 * because canonicalFingerprint.ts selects it.
 *
 * NOTHING IS SUPPLIED BY THE CALLER. The tree comes from the stored `reviewed`
 * of the proposal the member names, re-read inside the transaction. A client
 * that could post a tree could make canonical a structure nobody reviewed.
 *
 * INTO AN EMPTY CANONICAL STRUCTURE ONLY. Replacement is the sharpest danger in
 * this unit and is not designed.
 */

import { transaction, type TransactionClient } from '@/lib/db/postgres';
import { sectionTopologyHash } from './evidence';
import { validateReviewed, type ReviewedStructure, type ReviewedUnit, type OrderedSection } from './review';

/**
 * The five ways a reviewed tree can fail against the current sections. Each is
 * a member-facing refusal in its own right — GATE 2 forbids collapsing them into
 * one opaque code or letting the database decide them.
 */
export const STRUCTURAL_REFUSALS = [
  'unknown_section',
  'inverted_range',
  'overlapping_siblings',
  'child_outside_parent',
  'duplicate_unit_id',
] as const;
export type StructuralRefusal = (typeof STRUCTURAL_REFUSALS)[number];

export type AuthorStructureRefusal =
  | 'not_found'
  /** The member's screen was built from a different revision than the stored one. */
  | 'stale_revision'
  | 'already_adopted'
  /** The writable pieces or their order changed: the reading is no longer about this book. */
  | 'topology_changed'
  /** Authored structure already exists. Writing over it would be replacement. */
  | 'structure_exists'
  /** A `none` reading, or a reviewed shape with no divisions. */
  | 'nothing_to_adopt'
  | StructuralRefusal;

export interface AuthoredUnitPlan {
  /** Proposal-internal key of the reviewed unit this division comes from. */
  reviewUnitKey: string;
  title: string | null;
  kind: string | null;
  /** 0-based among siblings. */
  position: number;
  /** Every draft section in this unit's run, ordered. */
  sectionIds: string[];
  children: AuthoredUnitPlan[];
}

export interface AuthoredStructurePlan {
  units: AuthoredUnitPlan[];
  unitCount: number;
  /** Distinct sections that end up in some division. */
  sectionCount: number;
}

export type PlanResult =
  | { status: 'ok'; plan: AuthoredStructurePlan }
  | { status: 'refused'; refusal: AuthorStructureRefusal; detail?: string };

export type AuthorStructureResult =
  | { status: 'ok'; proposalId: string; adoptedReviewRevision: number; unitCount: number; sectionCount: number }
  | { status: 'refused'; refusal: AuthorStructureRefusal; detail?: string };

const refuse = (refusal: AuthorStructureRefusal, detail?: string): { status: 'refused'; refusal: AuthorStructureRefusal; detail?: string } =>
  detail ? { status: 'refused', refusal, detail } : { status: 'refused', refusal };

const isStructural = (r: string): r is StructuralRefusal =>
  (STRUCTURAL_REFUSALS as readonly string[]).includes(r);

/**
 * PURE AND TOTAL. Decides every refusal this command can make about the reading
 * itself, and otherwise returns a complete plan. No database, no clock, no
 * caller-supplied structure.
 *
 * This is the whole of GATE 1's guarantee: if this returns `ok`, nothing that
 * follows may refuse, so no refusal can be discovered after a write.
 */
export function planAuthoredStructure(
  reviewed: ReviewedStructure | null | undefined,
  sections: readonly OrderedSection[],
): PlanResult {
  if (!reviewed || !Array.isArray(reviewed.units) || reviewed.units.length === 0) {
    /* A `none` reading reached here honestly: MAIA found no stable larger
       structure. Inventing a single enclosing division would be the system
       authoring structure. */
    return refuse('nothing_to_adopt');
  }

  /* GATE 2. The whole tree, against the sections as they are now. */
  const invalid = validateReviewed(reviewed.units, sections);
  if (invalid) {
    if (!isStructural(invalid.refusal)) {
      /* validateReviewed grew a refusal this command does not translate. Fail
         loudly rather than mapping an unknown refusal onto a member-facing one
         that means something else. */
      throw new Error(
        `[WS2-06A] unhandled reviewed-structure refusal "${invalid.refusal}"; ` +
        `add it to STRUCTURAL_REFUSALS with a deliberate member-facing meaning`);
    }
    return refuse(invalid.refusal, invalid.detail);
  }

  const ordered = [...sections].sort((a, b) => a.position - b.position);
  const index = new Map(ordered.map((s, i) => [s.id, i]));
  const placed = new Set<string>();
  let unitCount = 0;

  const planLevel = (units: readonly ReviewedUnit[]): AuthoredUnitPlan[] | StructuralRefusal =>
    units.reduce<AuthoredUnitPlan[] | StructuralRefusal>((acc, u, i) => {
      if (!Array.isArray(acc)) return acc;
      const a = index.get(u.fromSectionId);
      const b = index.get(u.toSectionId);
      /* Unreachable: validateReviewed established both ids and their order.
         Kept because the alternative to a refusal here is a silently wrong run,
         and this costs nothing before any write. */
      if (a === undefined || b === undefined) return 'unknown_section';
      if (a > b) return 'inverted_range';

      const sectionIds = ordered.slice(a, b + 1).map((s) => s.id);
      for (const id of sectionIds) placed.add(id);
      unitCount += 1;

      const children = planLevel(u.children);
      if (!Array.isArray(children)) return children;

      acc.push({
        reviewUnitKey: u.id,
        title: u.title?.trim() || null,
        kind: u.kind?.trim() || null,
        position: i,
        sectionIds,
        children,
      });
      return acc;
    }, []);

  const units = planLevel(reviewed.units);
  if (!Array.isArray(units)) return refuse(units);

  return { status: 'ok', plan: { units, unitCount, sectionCount: placed.size } };
}

/**
 * The write half. Returns void: it has no refusal path, by construction. Any
 * failure here is a database error and THROWS, so `transaction()` rolls back.
 */
async function writePlan(
  tx: TransactionClient,
  manuscriptId: string,
  proposalId: string,
  units: readonly AuthoredUnitPlan[],
  parentId: string | null,
): Promise<void> {
  for (const u of units) {
    const inserted = await tx.query<{ id: string }>(
      `INSERT INTO manuscript_structure_units
         (manuscript_id, parent_id, position, kind, title, origin,
          adopted_from_proposal_id, adopted_from_review_unit_key)
       VALUES ($1, $2, $3, $4, $5, 'member', $6, $7)
       RETURNING id`,
      [manuscriptId, parentId, u.position, u.kind, u.title, proposalId, u.reviewUnitKey]);
    const id = inserted.rows[0].id;

    /* A child's run lies inside its parent's — established by validateReviewed,
       not assumed here — so inserting children after the parent moves those
       sections from the parent to the child, which is the membership the
       reviewed tree describes. Delete-then-insert because the primary key is
       (unit_id, draft_section_id): a section changing units is two rows. */
    await tx.query(
      `DELETE FROM manuscript_structure_members WHERE draft_section_id = ANY($1::uuid[])`,
      [u.sectionIds]);
    await tx.query(
      `INSERT INTO manuscript_structure_members (unit_id, draft_section_id)
       SELECT $1, unnest($2::uuid[])`,
      [id, u.sectionIds]);

    await writePlan(tx, manuscriptId, proposalId, u.children, id);
  }
}

/**
 * Make the reviewed structure of one proposal the Work's canonical structure.
 *
 * Every refusal is decided before the first write. The whole act is one
 * transaction.
 */
export async function authorStructureFromProposal(
  manuscriptId: string,
  memberId: string,
  proposalId: string,
  expectedReviewRevision: number,
): Promise<AuthorStructureResult> {
  return transaction(async (tx) => {
    /* Serialises against a concurrent adoption of a different proposal, which
       the unique partial index would otherwise decide by whoever committed. */
    const owned = await tx.query(
      `SELECT 1 FROM member_manuscripts WHERE id = $1 AND member_id = $2 FOR UPDATE`,
      [manuscriptId, memberId]);
    if (owned.rows.length === 0) return refuse('not_found');

    const p = await tx.query<{
      reviewed: ReviewedStructure; review_revision: number;
      section_topology_hash: string; adopted_at: Date | null;
    }>(
      `SELECT reviewed, review_revision, section_topology_hash, adopted_at
         FROM manuscript_structure_proposals
        WHERE id = $1 AND manuscript_id = $2
        FOR UPDATE`,
      [proposalId, manuscriptId]);
    if (p.rows.length === 0) return refuse('not_found');
    const row = p.rows[0];

    if (row.adopted_at !== null) return refuse('already_adopted');

    /* The revision the member's screen was built from. Authoring a different
       one would make canonical a structure they never saw. */
    if (Number(row.review_revision) !== expectedReviewRevision) {
      return refuse('stale_revision', `stored revision ${row.review_revision}`);
    }

    const draft = await tx.query<{ id: string }>(
      `SELECT d.id FROM manuscript_working_drafts d
        WHERE d.manuscript_id = $1 AND d.section_addressable_at IS NOT NULL`,
      [manuscriptId]);
    if (draft.rows.length === 0) return refuse('not_found');

    const sec = await tx.query<{ id: string; position: number; heading: string | null }>(
      `SELECT s.id, s.position, ms.heading
         FROM manuscript_draft_sections s
         LEFT JOIN manuscript_sections ms ON ms.id = s.source_section_id
        WHERE s.draft_id = $1 ORDER BY s.position ASC`,
      [draft.rows[0].id]);
    const sections = sec.rows.map((s) => ({
      id: s.id, position: Number(s.position), heading: s.heading,
    }));

    /* THE HARD GATE. If the writable pieces or their order changed, this reading
       is no longer about this book. interpretation_input_hash is deliberately
       NOT this gate — a rewritten body is a soft signal the member is told
       about, not a reason to refuse their act. */
    if (sectionTopologyHash(sections) !== row.section_topology_hash) {
      return refuse('topology_changed');
    }

    /* Into an EMPTY canonical structure. Anything else is replacement. Counts
       every unit of the manuscript: filtering by origin would trust a value
       nothing writes to keep rows out of this gate. */
    const existing = await tx.query<{ n: string }>(
      `SELECT count(*) AS n FROM manuscript_structure_units WHERE manuscript_id = $1`,
      [manuscriptId]);
    if (Number(existing.rows[0].n) > 0) return refuse('structure_exists');

    /* LAST REFUSAL POINT. Everything after this line only writes or throws. */
    const planned = planAuthoredStructure(row.reviewed, sections);
    if (planned.status === 'refused') return planned;

    await writePlan(tx, manuscriptId, proposalId, planned.plan.units, null);

    await tx.query(
      `UPDATE manuscript_structure_proposals
          SET adopted_at = now(), adopted_review_revision = $1
        WHERE id = $2`,
      [expectedReviewRevision, proposalId]);

    return {
      status: 'ok' as const,
      proposalId,
      adoptedReviewRevision: expectedReviewRevision,
      unitCount: planned.plan.unitCount,
      sectionCount: planned.plan.sectionCount,
    };
  });
}
