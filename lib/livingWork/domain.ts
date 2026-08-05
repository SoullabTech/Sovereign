/**
 * Living Work — domain model (Phase 2, Slice 1).
 *
 * The Studio's governing object, ratified 2026-08-01. A Living Work is a
 * member-authored body of material, inquiry, decisions, and expressions that may
 * exist before any single form and may give rise to many forms over time.
 *
 * A manuscript is one expression of a Living Work — not its identity.
 *
 * This module is pure: no database, no I/O, no callers yet. It exists so the
 * ratified guards are expressed as code that can be tested before anything is
 * wired to them. Schema: database/migrations/20260801000001_living_works.sql
 * Instrument: docs/architecture/LIVING_WORK_ONTOLOGY_RATIFICATION_INSTRUMENT_2026-07-31.md
 */

export interface LivingWork {
  id: string;
  memberId: string;
  /**
   * The member's own words, and OPTIONAL. Never generated, never inferred,
   * never demanded early.
   *
   * `null` means the work exists but has not yet been named — identity and
   * recognition are different moments (ledger D-16). It is not a status to be
   * managed; it is the absence of an act that has not happened yet.
   */
  title: string | null;
  purpose: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Open by design. Narrowing this to the types built today would re-narrow the
 * ontology that was just ratified — a workbook, a course, a retreat and a
 * framework are expressions too, whether or not the Studio can yet hold them.
 */
export type ExpressionType = string;

/** A member's declaration that an expression belongs to a Living Work. */
export interface ExpressionMembership {
  id: string;
  livingWorkId: string;
  expressionType: ExpressionType;
  expressionId: string;
  /** Guard 1: who declared it. Never absent, never a system actor. */
  declaredBy: string;
  declaredAt: string;
}

/** What a caller must supply to declare a membership. */
export interface Declaration {
  livingWorkId: string;
  expressionType: ExpressionType;
  expressionId: string;
  /** The member performing the declaration. */
  declaredBy: string;
}

export type Refusal =
  | 'no_declaring_member'
  | 'not_the_owner'
  | 'missing_expression'
  | 'missing_living_work'
  | 'blank_expression_type'
  | 'missing_material'
  | 'blank_material_type';

/**
 * Guard 1 — *nothing enters a Living Work without the member's declaration.*
 *
 * The check that matters is the second one: **the declaring member must own the
 * Living Work.** Without it, "a member declared this" could be satisfied by any
 * member, or by a background process running under someone's id. Ownership is
 * what makes the declaration the member's own act rather than merely an act with
 * a member's name attached.
 */
export function refuseDeclaration(
  d: Partial<Declaration>,
  work: Pick<LivingWork, 'id' | 'memberId'> | null
): Refusal | null {
  if (!d.declaredBy) return 'no_declaring_member';
  if (!work) return 'missing_living_work';
  if (work.memberId !== d.declaredBy) return 'not_the_owner';
  if (!d.expressionId) return 'missing_expression';
  if (!d.expressionType || d.expressionType.trim().length === 0) return 'blank_expression_type';
  return null;
}

/**
 * A member's declaration that a thing FEEDS a Living Work (a belonging).
 * Sibling of ExpressionMembership — same declaration grammar, different
 * relationship: an expression is a form of the work; a material feeds it.
 * Ruled in the Work Continuity Layer first slice, 2026-08-05.
 */
export interface Belonging {
  livingWorkId: string;
  materialType: string;
  materialId: string;
  /** The member's own sentence, OPTIONAL — an unwritten sentence is a correct
      state (Materials walk M2), never a gap to fill or generate. */
  relationshipSentence: string | null;
  declaredBy: string;
}

/**
 * Guard 1, applied to belongings — *nothing feeds a Living Work without the
 * member's declaration.* The crossing is the consent event; ownership of the
 * work is what makes the crossing the member's own act.
 */
export function refuseBelonging(
  b: Partial<Belonging>,
  work: Pick<LivingWork, 'id' | 'memberId'> | null
): Refusal | null {
  if (!b.declaredBy) return 'no_declaring_member';
  if (!work) return 'missing_living_work';
  if (work.memberId !== b.declaredBy) return 'not_the_owner';
  if (!b.materialId) return 'missing_material';
  if (!b.materialType || b.materialType.trim().length === 0) return 'blank_material_type';
  return null;
}

/**
 * A blank sentence is the absence of a sentence, not an error — the member
 * simply has not said (or chose not to say) what this feeds. Normalized to
 * null so "unwritten" has exactly one representation.
 */
export function normalizeSentence(sentence: string | null | undefined): string | null {
  if (sentence === null || sentence === undefined) return null;
  const t = sentence.trim();
  return t.length === 0 ? null : sentence;
}

/**
 * Guard 2 — *the Studio may notice what is gathering; it may not pronounce what
 * the work is becoming.*
 *
 * A Living Work carries only what a member wrote. This is the list of things the
 * system must never author. It is exported so a future contributor adding a
 * column has to delete a line here first, and see why.
 */
export const NEVER_AUTHORED_BY_THE_SYSTEM = [
  'title',
  'purpose',
  'type',
  'theme',
  'summary',
  'status',
  'phase',
  'relationships',
] as const;

/**
 * A Living Work is never created on a member's behalf — not on signup, not on
 * first import, not as a side effect of any other act. This is a statement of
 * the rule, kept next to the model rather than in a document, because the
 * temptation to "helpfully" create one arrives at implementation time.
 */
export const CREATION_REQUIRES_A_MEMBER_ACT = true as const;

/**
 * A title, once given, must be real. This does NOT make a title required —
 * `null` is a legitimate state — it stops the column sliding from "not yet
 * named" into "named with nothing", which would be a name the member never
 * gave.
 */
export function refuseTitle(title: string | null | undefined): 'blank_title' | null {
  if (title === null || title === undefined) return null; // not yet named
  return title.trim().length === 0 ? 'blank_title' : null;
}
