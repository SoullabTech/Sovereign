/**
 * WS2-05B step 4 - correcting a reading, without authoring anything.
 *
 * NOTHING HERE TOUCHES CANONICAL STRUCTURE. Every operation reshapes the
 * member's copy of a proposal. `manuscript_structure_units` and
 * `manuscript_structure_members` are not imported, not written, not consulted.
 * Only adoption crosses that line.
 *
 * UNITS ARE ADDRESSED BY ID, NEVER BY PATH. A path like `[0,2]` means a
 * different division the moment anything before it moves - the same failure
 * mode as `s=22` in a URL, and the same answer: give the thing an identity and
 * name it. Ids are minted when the interpretation is copied into the member's
 * half, because that is the moment a reading becomes something they can edit.
 *
 * THE GRAMMAR MATCHES 05A. Removal is leaf-only here too, and a division is
 * moved out with an explicit gesture rather than silently promoted when its
 * parent goes. A member should not have to learn that the same word means two
 * different things before and after they accept a proposal.
 *
 * RANGES, NOT MEMBERSHIPS. A proposed unit spans `from`..`to`, so it is
 * contiguous by construction - the invariant 05A enforces with a deferred
 * trigger cannot be violated by a well-formed proposal. What review must guard
 * is siblings overlapping and children escaping their parent.
 *
 * THE MEMBER'S SHAPE CARRIES NO CLAIM OF MAIA'S. `rationale`, `evidenceRefs`
 * and `uncertainty` belong to the interpretation and stay there, frozen. If
 * they travelled into the reviewed copy, then the moment a member moved a
 * boundary the record would carry MAIA's reasoning attached to a boundary she
 * never proposed - a mutated claim wearing her name. Instead the surface shows
 * both, paired by id:
 *
 *     unit p7   MAIA proposed    Fire 57-68, because the vocabulary concentrates
 *               your structure   Fire 42-69
 *
 * and the difference is visibly authorship.
 */

import type { ProposedUnit } from './interpret';

export interface ReviewedUnit {
  /**
   * The interpretation's id for a unit MAIA proposed, so the two halves pair;
   * a fresh one for a unit the member added.
   */
  id: string;
  title: string | null;
  kind: string | null;
  fromSectionId: string;
  toSectionId: string;
  children: ReviewedUnit[];
}

export interface ReviewedStructure {
  units: ReviewedUnit[];
  /** Set when the member picked one alternative of an ambiguous reading. */
  chosenAlternative?: string;
}

export interface OrderedSection { id: string; position: number }

export type ReviewOperation =
  | { op: 'rename'; unitId: string; title: string | null; kind: string | null }
  | { op: 'set-boundary'; unitId: string; fromSectionId?: string; toSectionId?: string }
  | { op: 'reparent'; unitId: string; parentId: string | null; index: number }
  | { op: 'remove'; unitId: string }
  /**
   * Move a division out one level, shrinking its parent to what remains.
   *
   * WHY THIS IS ITS OWN OPERATION AND NOT A REPARENT. In a ranges model,
   * plain reparenting out is UNREACHABLE: shrink the parent first and the
   * child is outside it; promote first and the parent still spans it. Both
   * refusals are correct and together they are a dead end. So promotion is one
   * gesture that makes both edits, and says so - rather than an interface that
   * quietly performs the second edit behind the first.
   */
  | { op: 'promote'; unitId: string }
  | { op: 'add'; parentId: string | null; index: number;
      title: string | null; kind: string | null;
      fromSectionId: string; toSectionId: string }
  /**
   * Take up one alternative of an ambiguous reading, BY IDENTITY ONLY.
   *
   * The first version carried the units themselves, which would have let a
   * client say "I chose alternative X" while supplying a tree of its own -
   * the authority hole removed from adoption, recreated one stage earlier. The
   * caller resolves the id against the IMMUTABLE interpretation and passes the
   * resolved alternatives in as context; nothing structural comes off the wire.
   */
  | { op: 'choose-alternative'; alternativeId: string }
  /**
   * Move a nested division from one parent to the adjacent one.
   *
   * Atomic for the same reason `promote` is. Doing it in steps is unreachable:
   * shrink the source and the child escapes it; move it first and the source
   * still spans it while the target does not; widen the target first and it
   * overlaps the source. One authorial statement - "this belongs to that one
   * instead" - necessarily changes three coupled range facts, so it is one
   * gesture whose whole post-image the surface can show.
   */
  | { op: 'transfer'; unitId: string; toParentId: string };

export type ReviewRefusal =
  | 'unknown_unit'
  | 'unknown_parent'
  | 'unknown_section'
  | 'inverted_range'
  | 'overlapping_siblings'
  | 'child_outside_parent'
  | 'unit_has_children'
  | 'would_cycle'
  | 'duplicate_unit_id'
  | 'parent_still_spans_child'
  | 'child_splits_parent'
  | 'parent_would_be_empty'
  | 'not_nested'
  | 'unknown_alternative'
  | 'unknown_operation'
  | 'parents_not_adjacent'
  | 'not_at_the_shared_edge'
  | 'empty_name';

/**
 * What the caller supplies from the IMMUTABLE interpretation, never from the
 * request. Keeps identity-only operations resolvable without letting a client
 * hand in structure.
 */
export interface ReviewContext {
  alternatives?: readonly { id: string; label: string; units: readonly ProposedUnit[] }[];
}

export type ReviewResult =
  | { status: 'ok'; reviewed: ReviewedStructure }
  | { status: 'refused'; refusal: ReviewRefusal; detail?: string };

const refuse = (refusal: ReviewRefusal, detail?: string): ReviewResult =>
  ({ status: 'refused', refusal, detail });

/* -- minting ids ---------------------------------------------------------- */

/**
 * A fresh id for a unit the member ADDS, distinct from every id the
 * interpretation minted.
 *
 * `m` rather than `p`, so a stored proposal says at a glance which divisions
 * came from the reading and which the member wrote themselves - before any
 * comparison is run.
 */
export function mintMemberUnitId(existing: readonly ReviewedUnit[]): string {
  const seen = new Set<string>();
  const walk = (l: readonly ReviewedUnit[]) => {
    for (const u of l) { seen.add(u.id); walk(u.children); }
  };
  walk(existing);
  let n = 1;
  while (seen.has(`m${n}`)) n++;
  return `m${n}`;
}

/**
 * Copy an interpretation's units into the member's editable half.
 *
 * IDS SURVIVE. That is what makes the audit legible later: the same `p7` on
 * both sides, rather than two changing JSON objects and a guess about whether
 * they are the same division.
 */
export function toReviewed(units: readonly ProposedUnit[]): ReviewedUnit[] {
  return units.map((u) => ({
    id: u.id,
    title: u.title, kind: u.kind,
    fromSectionId: u.fromSectionId, toSectionId: u.toSectionId,
    children: toReviewed(u.children),
  }));
}

/* -- reading the tree ----------------------------------------------------- */

export function findUnit(
  units: readonly ReviewedUnit[],
  id: string,
): { unit: ReviewedUnit; siblings: ReviewedUnit[]; parent: ReviewedUnit | null } | null {
  const walk = (
    list: ReviewedUnit[],
    parent: ReviewedUnit | null,
  ): ReturnType<typeof findUnit> => {
    for (const u of list) {
      if (u.id === id) return { unit: u, siblings: list, parent };
      const found = walk(u.children, u);
      if (found) return found;
    }
    return null;
  };
  return walk(units as ReviewedUnit[], null);
}

function descendantIds(u: ReviewedUnit, into = new Set<string>()): Set<string> {
  into.add(u.id);
  u.children.forEach((c) => descendantIds(c, into));
  return into;
}

const clone = (r: ReviewedStructure): ReviewedStructure => structuredClone(r);

/* -- validation ----------------------------------------------------------- */

/**
 * Judge the whole post-image, not the unit that was touched.
 *
 * A boundary change moves one unit and can make its SIBLING overlap it; a
 * reparent changes two levels at once. A check scoped to the edited unit would
 * miss both, which is the same lesson 05A learned about placement.
 */
export function validateReviewed(
  units: readonly ReviewedUnit[],
  sections: readonly OrderedSection[],
): { refusal: ReviewRefusal; detail?: string } | null {
  const position = new Map(sections.map((s) => [s.id, s.position]));
  let found: { refusal: ReviewRefusal; detail?: string } | null = null;

  const rangeOf = (u: ReviewedUnit): [number, number] | null => {
    const a = position.get(u.fromSectionId);
    const b = position.get(u.toSectionId);
    if (a === undefined) { found ??= { refusal: 'unknown_section', detail: u.fromSectionId }; return null; }
    if (b === undefined) { found ??= { refusal: 'unknown_section', detail: u.toSectionId }; return null; }
    if (a > b) { found ??= { refusal: 'inverted_range', detail: u.title ?? u.id }; return null; }
    return [a, b];
  };

  const level = (list: readonly ReviewedUnit[]) => {
    const ranges: { r: [number, number]; u: ReviewedUnit }[] = [];
    for (const u of list) {
      const r = rangeOf(u);
      if (!r) return;
      for (const c of u.children) {
        const cr = rangeOf(c);
        if (cr && (cr[0] < r[0] || cr[1] > r[1])) {
          found ??= { refusal: 'child_outside_parent', detail: c.title ?? c.id };
        }
      }
      ranges.push({ r, u });
      level(u.children);
    }
    ranges.sort((x, y) => x.r[0] - y.r[0]);
    for (let i = 1; i < ranges.length; i++) {
      if (ranges[i].r[0] <= ranges[i - 1].r[1]) {
        found ??= {
          refusal: 'overlapping_siblings',
          detail: `${ranges[i - 1].u.title ?? ranges[i - 1].u.id} / ${ranges[i].u.title ?? ranges[i].u.id}`,
        };
      }
    }
  };

  level(units);
  if (found) return found;

  /* Ids must be unique, or an operation naming one would edit whichever the
     tree walk reached first - silently, and differently each time the tree is
     reshaped. */
  const seen = new Set<string>();
  const unique = (l: readonly ReviewedUnit[]): boolean => {
    for (const u of l) {
      if (seen.has(u.id)) { found = { refusal: 'duplicate_unit_id', detail: u.id }; return false; }
      seen.add(u.id);
      if (!unique(u.children)) return false;
    }
    return true;
  };
  unique(units);
  return found;
}

/* -- the operations ------------------------------------------------------- */

export function applyReviewOperation(
  reviewed: ReviewedStructure,
  op: ReviewOperation,
  sections: readonly OrderedSection[],
  context: ReviewContext = {},
): ReviewResult {
  const next = clone(reviewed);

  switch (op.op) {
    case 'rename': {
      const title = op.title?.trim() || null;
      const kind = op.kind?.trim() || null;
      /* A division with neither is a row the member cannot identify. Refusing
         is kinder than rendering a blank one. */
      if (!title && !kind) return refuse('empty_name');
      const at = findUnit(next.units, op.unitId);
      if (!at) return refuse('unknown_unit', op.unitId);
      at.unit.title = title;
      at.unit.kind = kind;
      break;
    }

    case 'set-boundary': {
      const at = findUnit(next.units, op.unitId);
      if (!at) return refuse('unknown_unit', op.unitId);
      if (op.fromSectionId !== undefined) at.unit.fromSectionId = op.fromSectionId;
      if (op.toSectionId !== undefined) at.unit.toSectionId = op.toSectionId;
      break;
    }

    case 'reparent': {
      const at = findUnit(next.units, op.unitId);
      if (!at) return refuse('unknown_unit', op.unitId);
      /* A unit cannot be moved inside itself or anything it holds. The tree
         would still serialise; it would simply never be readable again. */
      if (op.parentId && descendantIds(at.unit).has(op.parentId)) {
        return refuse('would_cycle');
      }
      let target: ReviewedUnit[];
      if (op.parentId === null) target = next.units;
      else {
        const p = findUnit(next.units, op.parentId);
        if (!p) return refuse('unknown_parent', op.parentId);
        target = p.unit.children;
      }
      /* PROMOTION NEEDS THE PARENT'S BOUNDARY TO MOVE FIRST.
         A unit spans a range, so a parent still covering 0-5 overlaps a child
         promoted out of it at 0-2. The generic overlap refusal would be true
         and useless - it names a collision without saying what to do - so the
         case is detected here and reported as itself.
         Deliberately NOT auto-shrinking the parent: that is an edit to a
         division the member did not name, and 05A already ruled against the
         interface making one as a side effect of another gesture. */
      if (at.parent && op.parentId !== at.parent.id) {
        const pos = new Map(sections.map((x) => [x.id, x.position]));
        const pFrom = pos.get(at.parent.fromSectionId);
        const pTo = pos.get(at.parent.toSectionId);
        const cFrom = pos.get(at.unit.fromSectionId);
        const cTo = pos.get(at.unit.toSectionId);
        if (pFrom !== undefined && pTo !== undefined && cFrom !== undefined && cTo !== undefined
            && cFrom >= pFrom && cTo <= pTo) {
          return refuse('parent_still_spans_child', at.parent.title ?? at.parent.id);
        }
      }
      at.siblings.splice(at.siblings.indexOf(at.unit), 1);
      target.splice(Math.max(0, Math.min(op.index, target.length)), 0, at.unit);
      break;
    }

    case 'promote': {
      const at = findUnit(next.units, op.unitId);
      if (!at) return refuse('unknown_unit', op.unitId);
      if (!at.parent) return refuse('not_nested');

      const ordered = [...sections].sort((a, b) => a.position - b.position);
      const idx = new Map(ordered.map((x, i) => [x.id, i]));
      const pFrom = idx.get(at.parent.fromSectionId);
      const pTo = idx.get(at.parent.toSectionId);
      const cFrom = idx.get(at.unit.fromSectionId);
      const cTo = idx.get(at.unit.toSectionId);
      if (pFrom === undefined || pTo === undefined || cFrom === undefined || cTo === undefined) {
        return refuse('unknown_section');
      }

      /* A child in the MIDDLE cannot be promoted: what remains of the parent
         would be two stretches, which is the discontinuity this whole
         programme refuses. The member moves a boundary first. */
      if (cFrom > pFrom && cTo < pTo) return refuse('child_splits_parent', at.parent.title ?? at.parent.id);
      if (cFrom === pFrom && cTo === pTo) return refuse('parent_would_be_empty', at.parent.title ?? at.parent.id);

      /* BOOK ORDER DECIDES WHERE IT LANDS, mechanically:
           a promoted PREFIX child sits BEFORE its former parent
           a promoted SUFFIX child sits AFTER it
         Always inserting after was the first version, and it put 0-2 below a
         parent that now starts at 3 - undoing R1's invariant in the one place
         nobody would look for it. */
      const wasPrefix = cFrom === pFrom;
      if (wasPrefix) at.parent.fromSectionId = ordered[cTo + 1].id;
      else at.parent.toSectionId = ordered[cFrom - 1].id;

      const grandparent = findUnit(next.units, at.parent.id);
      const target = grandparent?.siblings ?? next.units;
      at.siblings.splice(at.siblings.indexOf(at.unit), 1);
      const parentAt = target.indexOf(at.parent);
      const insertAt = parentAt < 0 ? target.length : (wasPrefix ? parentAt : parentAt + 1);
      target.splice(insertAt, 0, at.unit);
      break;
    }

    case 'remove': {
      const at = findUnit(next.units, op.unitId);
      if (!at) return refuse('unknown_unit', op.unitId);
      /* Leaf-only, exactly as in authored structure. Removing a division that
         holds others would either destroy them or silently promote them, and
         both are edits the member did not ask for. */
      if (at.unit.children.length > 0) return refuse('unit_has_children');
      at.siblings.splice(at.siblings.indexOf(at.unit), 1);
      break;
    }

    case 'add': {
      const title = op.title?.trim() || null;
      const kind = op.kind?.trim() || null;
      if (!title && !kind) return refuse('empty_name');
      const unit: ReviewedUnit = {
        id: mintMemberUnitId(next.units), title, kind,
        fromSectionId: op.fromSectionId, toSectionId: op.toSectionId,
        children: [],
      };
      let target: ReviewedUnit[];
      if (op.parentId === null) target = next.units;
      else {
        const p = findUnit(next.units, op.parentId);
        if (!p) return refuse('unknown_parent', op.parentId);
        target = p.unit.children;
      }
      target.splice(Math.max(0, Math.min(op.index, target.length)), 0, unit);
      break;
    }

    case 'choose-alternative': {
      /* An ambiguous reading has no structure until the member picks one. The
         units come from the stored interpretation, resolved by id. */
      const chosen = context.alternatives?.find((a) => a.id === op.alternativeId);
      if (!chosen) return refuse('unknown_alternative', op.alternativeId);
      next.units = toReviewed(chosen.units);
      next.chosenAlternative = chosen.label;
      break;
    }

    case 'transfer': {
      const at = findUnit(next.units, op.unitId);
      if (!at) return refuse('unknown_unit', op.unitId);
      if (!at.parent) return refuse('not_nested');
      const to = findUnit(next.units, op.toParentId);
      if (!to) return refuse('unknown_parent', op.toParentId);

      const ordered = [...sections].sort((a, b) => a.position - b.position);
      const idx = new Map(ordered.map((x, i) => [x.id, i]));
      const num = (id: string) => idx.get(id);
      const [sFrom, sTo] = [num(at.parent.fromSectionId), num(at.parent.toSectionId)];
      const [tFrom, tTo] = [num(to.unit.fromSectionId), num(to.unit.toSectionId)];
      const [cFrom, cTo] = [num(at.unit.fromSectionId), num(at.unit.toSectionId)];
      if ([sFrom, sTo, tFrom, tTo, cFrom, cTo].some((n) => n === undefined)) {
        return refuse('unknown_section');
      }

      /* The two parents must touch, or the sections between them belong to
         neither and the transfer would silently claim them. */
      const sourceFirst = sTo! + 1 === tFrom!;
      const targetFirst = tTo! + 1 === sFrom!;
      if (!sourceFirst && !targetFirst) return refuse('parents_not_adjacent');

      /* And the child must sit AT the edge they share, or the source would be
         left in two pieces. */
      if (sourceFirst && cTo !== sTo) return refuse('not_at_the_shared_edge');
      if (targetFirst && cFrom !== sFrom) return refuse('not_at_the_shared_edge');
      if (cFrom === sFrom && cTo === sTo) return refuse('parent_would_be_empty');

      if (sourceFirst) {
        at.parent.toSectionId = ordered[cFrom! - 1].id;
        to.unit.fromSectionId = at.unit.fromSectionId;
      } else {
        at.parent.fromSectionId = ordered[cTo! + 1].id;
        to.unit.toSectionId = at.unit.toSectionId;
      }
      at.siblings.splice(at.siblings.indexOf(at.unit), 1);
      to.unit.children.splice(sourceFirst ? 0 : to.unit.children.length, 0, at.unit);
      break;
    }

    default:
      /* Defence in depth behind the HTTP parser. Without this an unknown
         discriminant fell through every case, validated an unchanged tree and
         returned success - a no-op reported as a completed gesture. */
      return refuse('unknown_operation', String((op as { op?: unknown }).op));
  }

  const bad = validateReviewed(next.units, sections);
  if (bad) return { status: 'refused', ...bad };
  return { status: 'ok', reviewed: next };
}

/**
 * What the member changed, PAIRED BY ID against what was proposed.
 *
 * Not inferred from an `edited` flag the reviewed copy would have to carry:
 * the interpretation is frozen and the reviewed copy is present, so the
 * difference is computable rather than remembered. A unit whose id is absent
 * from the reading was added by the member; one absent from the review was
 * removed by them; one on both sides whose title, kind or boundaries differ
 * was changed by them.
 */
export interface ReviewDelta {
  added: ReviewedUnit[];
  removed: ProposedUnit[];
  changed: { id: string; proposed: ProposedUnit; reviewed: ReviewedUnit }[];
  unchanged: number;
}

export function reviewDiff(
  original: readonly ProposedUnit[],
  reviewed: readonly ReviewedUnit[],
): ReviewDelta {
  const flatP = new Map<string, ProposedUnit>();
  const gatherP = (l: readonly ProposedUnit[]) => {
    for (const u of l) { flatP.set(u.id, u); gatherP(u.children); }
  };
  gatherP(original);

  const flatR = new Map<string, ReviewedUnit>();
  const gatherR = (l: readonly ReviewedUnit[]) => {
    for (const u of l) { flatR.set(u.id, u); gatherR(u.children); }
  };
  gatherR(reviewed);

  const added: ReviewedUnit[] = [];
  const changed: ReviewDelta['changed'] = [];
  let unchanged = 0;
  for (const [id, r] of flatR) {
    const p = flatP.get(id);
    if (!p) { added.push(r); continue; }
    if (p.title !== r.title || p.kind !== r.kind
        || p.fromSectionId !== r.fromSectionId || p.toSectionId !== r.toSectionId) {
      changed.push({ id, proposed: p, reviewed: r });
    } else unchanged++;
  }
  const removed = [...flatP.values()].filter((p) => !flatR.has(p.id));
  return { added, removed, changed, unchanged };
}
