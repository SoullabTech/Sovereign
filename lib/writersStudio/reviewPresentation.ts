/**
 * WS2-05B step 5 - presenting a reading for review.
 *
 * TWO RULES CARRY THIS FILE.
 *
 * ONE ORDERING. The review reads in book order through the SAME primitive the
 * canonical outline uses (`orderOutline`), reached by translating ranges into
 * the membership shape it understands. A second ordering implementation would
 * eventually disagree with the first, and the member would meet the
 * disagreement rather than the book.
 *
 * ONE ENGINE. A preview is produced by ACTUALLY APPLYING the operation and
 * describing the difference - never by a separate routine that predicts what
 * the operation would do. A prediction that can disagree with the commit is
 * worse than no preview, because it is believed.
 *
 * ATOMIC DOES NOT MEAN HIDDEN. `promote` and `transfer` each change several
 * coupled range facts, and the member sees all of them before committing. The
 * parent's boundary moving is part of the gesture, not a side effect of it.
 *
 * A MALFORMED PROPOSAL IS REFUSED, NEVER TIDIED. The first version dropped a
 * division whose range would not resolve and rendered what remained - which
 * would show the member a CLEANER Work than the one actually stored, and lose a
 * division without saying so. That is the omission failure this programme has
 * refused everywhere else, arriving through the display rather than the data.
 * `orderReview` validates first and returns a refusal the surface can state.
 */

import { orderOutline, type OrderedOutline } from './outlineOrder';
import type { StructureNodeDTO } from './structureClient';
import {
  applyReviewOperation, validateReviewed,
  type ReviewedStructure, type ReviewedUnit, type ReviewOperation,
  type ReviewContext, type OrderedSection, type ReviewRefusal,
} from '@/lib/manuscript/structure/review';

/* -- ranges into the shape the outline understands ----------------------- */

/** A structure that cannot be drawn. Thrown, never swallowed. */
export class MalformedReviewedStructure extends Error {
  constructor(readonly unitId: string, readonly why: string) {
    super(`unit ${unitId}: ${why}`);
  }
}

/**
 * A reviewed unit spans a RANGE; 05A's outline thinks in MEMBERSHIPS.
 *
 * The translation is the same rule adoption will need in step 6: a unit's own
 * sections are those in its range that no child claims - direct leaf placement,
 * derived rather than declared. Building it here means the review surface and
 * the eventual canonical structure are ordered by identical logic, so what the
 * member reviews is the shape they will get.
 *
 * CALLERS MUST VALIDATE FIRST. Given a unit whose range does not resolve this
 * THROWS rather than skipping it: a drawing routine that quietly omits what it
 * cannot draw produces a picture of a book that does not exist. `orderReview`
 * is the entry point that validates and refuses in one piece.
 */
export function reviewedToOutlineNodes(
  units: readonly ReviewedUnit[],
  sections: readonly OrderedSection[],
): StructureNodeDTO[] {
  const ordered = [...sections].sort((a, b) => a.position - b.position);
  const position = new Map(ordered.map((s) => [s.id, s.position]));

  const build = (u: ReviewedUnit): StructureNodeDTO => {
    const from = position.get(u.fromSectionId);
    const to = position.get(u.toSectionId);
    if (from === undefined) throw new MalformedReviewedStructure(u.id, 'unknown start section');
    if (to === undefined) throw new MalformedReviewedStructure(u.id, 'unknown end section');
    if (from > to) throw new MalformedReviewedStructure(u.id, 'range runs backwards');

    const children = u.children.map(build);
    const claimed = new Set<string>();
    for (const c of children) c.derivedSectionIds.forEach((id) => claimed.add(id));

    const derived = ordered
      .filter((s) => s.position >= from && s.position <= to)
      .map((s) => s.id);

    return {
      id: u.id,
      kind: u.kind,
      title: u.title,
      origin: 'proposed',
      position: 0,
      children,
      sectionIds: derived.filter((id) => !claimed.has(id)),
      derivedSectionIds: derived,
      /* A range is contiguous by construction. The flag exists because the
         canonical node type carries it; here it is always true, and if it ever
         were not, the range itself would be malformed. */
      contiguous: true,
    };
  };

  return units.map(build);
}

export type PresentationResult =
  | { status: 'ok'; outline: OrderedOutline }
  | { status: 'refused'; refusal: ReviewRefusal; detail?: string };

/**
 * The review column, in manuscript order, with everything unclaimed in place -
 * or a refusal the surface can state.
 *
 * Validation runs BEFORE translation, over the whole structure, so a malformed
 * CHILD refuses the display as surely as a malformed root. The earlier version
 * would have dropped the child and drawn its parent, which is the more
 * dangerous of the two failures: the Work would look organised, and the missing
 * division would be invisible precisely because it was missing.
 */
export function orderReview(
  reviewed: ReviewedStructure,
  sections: readonly OrderedSection[],
): PresentationResult {
  const bad = validateReviewed(reviewed.units, sections);
  if (bad) return { status: 'refused', ...bad };
  return {
    status: 'ok',
    outline: orderOutline(reviewedToOutlineNodes(reviewed.units, sections), sections),
  };
}

/* -- the post-image a gesture will produce ------------------------------- */

export type ChangeEffect =
  | 'added'
  | 'removed'
  | 'range-changes'
  | 'moves-out'
  | 'changes-parent'
  | 'renamed';

export interface ChangeRow {
  unitId: string;
  title: string | null;
  effect: ChangeEffect;
  /** Human-facing positions, e.g. "0-5". Null when the unit did not exist. */
  before: string | null;
  after: string | null;
  /** For a parent change, what it moved out of and into. */
  fromParent?: string | null;
  toParent?: string | null;
}

export type PreviewResult =
  | { status: 'ok'; rows: ChangeRow[]; reviewed: ReviewedStructure }
  | { status: 'refused'; refusal: ReviewRefusal; detail?: string };

interface Flat { unit: ReviewedUnit; parent: ReviewedUnit | null; depth: number }

function flatten(units: readonly ReviewedUnit[], parent: ReviewedUnit | null = null,
  depth = 0, into = new Map<string, Flat>()): Map<string, Flat> {
  for (const u of units) {
    into.set(u.id, { unit: u, parent, depth });
    flatten(u.children, u, depth + 1, into);
  }
  return into;
}

/**
 * What this gesture will do, computed by doing it.
 *
 * The returned `reviewed` is the exact post-image the commit will produce, so a
 * caller may render the preview and then send the same operation with
 * confidence that the two agree - because they are the same computation.
 */
export function previewOperation(
  current: ReviewedStructure,
  op: ReviewOperation,
  sections: readonly OrderedSection[],
  context: ReviewContext = {},
): PreviewResult {
  const applied = applyReviewOperation(current, op, sections, context);
  if (applied.status === 'refused') return applied;

  const position = new Map(sections.map((s) => [s.id, s.position]));
  const span = (u: ReviewedUnit): string =>
    `${position.get(u.fromSectionId) ?? '?'}-${position.get(u.toSectionId) ?? '?'}`;

  const before = flatten(current.units);
  const after = flatten(applied.reviewed.units);
  const rows: (ChangeRow & { sortAt: number; sortDepth: number })[] = [];
  const at = (u: ReviewedUnit) => position.get(u.fromSectionId) ?? 0;

  for (const [id, a] of after) {
    const b = before.get(id);
    if (!b) {
      rows.push({ unitId: id, title: a.unit.title, effect: 'added',
        before: null, after: span(a.unit), sortAt: at(a.unit), sortDepth: a.depth });
      continue;
    }
    const rangeMoved = b.unit.fromSectionId !== a.unit.fromSectionId
      || b.unit.toSectionId !== a.unit.toSectionId;
    const parentMoved = (b.parent?.id ?? null) !== (a.parent?.id ?? null);

    if (parentMoved) {
      rows.push({
        unitId: id, title: a.unit.title,
        effect: a.parent === null ? 'moves-out' : 'changes-parent',
        before: span(b.unit), after: span(a.unit),
        fromParent: b.parent?.title ?? null,
        toParent: a.parent?.title ?? null,
        sortAt: at(a.unit), sortDepth: a.depth,
      });
    } else if (rangeMoved) {
      rows.push({ unitId: id, title: a.unit.title, effect: 'range-changes',
        before: span(b.unit), after: span(a.unit),
        sortAt: at(a.unit), sortDepth: a.depth });
    } else if (b.unit.title !== a.unit.title || b.unit.kind !== a.unit.kind) {
      rows.push({ unitId: id, title: a.unit.title, effect: 'renamed',
        before: b.unit.title, after: a.unit.title,
        sortAt: at(a.unit), sortDepth: a.depth });
    }
  }

  for (const [id, b] of before) {
    if (!after.has(id)) {
      rows.push({ unitId: id, title: b.unit.title, effect: 'removed',
        before: span(b.unit), after: null,
        sortAt: at(b.unit), sortDepth: b.depth });
    }
  }

  /* Book order, so the preview reads like the column it describes - and where
     two rows begin at the same section, the CONTAINER before what it holds,
     which is how the outline draws them. Sorting on the numbers rather than
     relying on traversal order, because a tie decided by Map insertion is a
     coincidence rather than a rule. */
  rows.sort((x, y) => x.sortAt - y.sortAt || x.sortDepth - y.sortDepth);

  return {
    status: 'ok',
    rows: rows.map(({ sortAt, sortDepth, ...row }) => row),
    reviewed: applied.reviewed,
  };
}

/**
 * Whether a gesture is consequential enough to be shown before it happens.
 *
 * Renaming a division changes one thing the member just typed. Promoting or
 * transferring one changes SEVERAL divisions, only one of which they named -
 * and that is exactly the case where a surface must state the whole
 * consequence rather than perform most of it quietly.
 */
export function needsPreview(op: ReviewOperation): boolean {
  return op.op === 'promote' || op.op === 'transfer';
}
