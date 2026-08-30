/**
 * WS2-05A — the authored structure, as a tree, with no database in it.
 *
 * Every rule that can be decided from rows alone is decided here, so it can be
 * tested without a cluster and so the transactional service has one job:
 * reading rows, calling these, and writing the result.
 *
 * THE DEFINING PROPERTY OF THIS WHOLE UNIT lives in what this file does NOT
 * contain: no function here takes, returns, or touches a character of the
 * member's text. Structure holds sections by reference. That is why
 * reorganising a book cannot damage it.
 *
 * DIRECT LEAF PLACEMENT. A draft section is joined to the LOWEST authored unit
 * containing it and to no other. A Part's sections are its own placements plus
 * everything under its descendants, DERIVED here by walking the tree. Storing
 * the derivation would create two representations of one hierarchy, and they
 * would disagree the first time either was edited.
 */

/** A unit row, as stored. */
export interface UnitRow {
  id: string;
  parentId: string | null;
  position: number;
  kind: string | null;
  title: string | null;
  origin: 'member' | 'imported' | 'proposed';
}

/** One direct placement. */
export interface MemberRow {
  unitId: string;
  draftSectionId: string;
}

/** A draft section, in draft order. Position is the ordering authority. */
export interface PlaceableSection {
  id: string;
  position: number;
}

export interface StructureNode {
  id: string;
  kind: string | null;
  title: string | null;
  origin: 'member' | 'imported' | 'proposed';
  position: number;
  children: StructureNode[];
  /** Direct placements only, in draft order. */
  sectionIds: string[];
  /**
   * Own placements plus every descendant's, in draft order. Derived, never
   * stored.
   */
  derivedSectionIds: string[];
  /**
   * Whether `derivedSectionIds` is an unbroken run of the draft's positions.
   *
   * REPORTED, NOT ENFORCED. A member placing sections one at a time passes
   * through non-contiguous states on the way to a contiguous one, and refusing
   * mid-edit would make the room fight the writer. But a chapter that has
   * quietly become two disjoint pieces of the book is a fact the writer should
   * be able to see, so it is surfaced rather than smoothed over.
   */
  contiguous: boolean;
}

export interface StructureTree {
  roots: StructureNode[];
  /** Sections in no unit at all, in draft order. Shown, never hidden. */
  unplacedSectionIds: string[];
}

/** A unit id that is not in this manuscript's rows, or a cycle, etc. */
export type TreeRefusal =
  | 'unknown_unit'
  | 'unknown_parent'
  | 'would_cycle'
  | 'unknown_section'
  | 'range_out_of_order';

/**
 * Build the tree. Units order by `position` among siblings; a unit's sections
 * order by their DRAFT position, because the draft is the authority on where
 * text sits, not the order placements happened to be inserted.
 */
export function buildTree(
  units: readonly UnitRow[],
  members: readonly MemberRow[],
  sections: readonly PlaceableSection[],
): StructureTree {
  const draftPos = new Map(sections.map((s) => [s.id, s.position]));
  const byDraftOrder = (a: string, b: string) =>
    (draftPos.get(a) ?? Number.MAX_SAFE_INTEGER) - (draftPos.get(b) ?? Number.MAX_SAFE_INTEGER);

  const direct = new Map<string, string[]>();
  for (const m of members) {
    const list = direct.get(m.unitId);
    if (list) list.push(m.draftSectionId);
    else direct.set(m.unitId, [m.draftSectionId]);
  }
  for (const list of direct.values()) list.sort(byDraftOrder);

  const childrenOf = new Map<string | null, UnitRow[]>();
  for (const u of units) {
    const key = u.parentId;
    const list = childrenOf.get(key);
    if (list) list.push(u);
    else childrenOf.set(key, [u]);
  }
  for (const list of childrenOf.values()) list.sort((a, b) => a.position - b.position);

  const build = (u: UnitRow): StructureNode => {
    const children = (childrenOf.get(u.id) ?? []).map(build);
    const own = direct.get(u.id) ?? [];
    const derived = [...own];
    for (const c of children) derived.push(...c.derivedSectionIds);
    derived.sort(byDraftOrder);
    return {
      id: u.id, kind: u.kind, title: u.title, origin: u.origin, position: u.position,
      children,
      sectionIds: own,
      derivedSectionIds: derived,
      contiguous: isContiguous(derived, draftPos),
    };
  };

  const roots = (childrenOf.get(null) ?? []).map(build);

  const placed = new Set(members.map((m) => m.draftSectionId));
  const unplacedSectionIds = sections
    .filter((s) => !placed.has(s.id))
    .sort((a, b) => a.position - b.position)
    .map((s) => s.id);

  return { roots, unplacedSectionIds };
}

/** An unbroken run of draft positions. Empty and single are contiguous. */
export function isContiguous(
  sectionIds: readonly string[],
  draftPos: ReadonlyMap<string, number>,
): boolean {
  if (sectionIds.length < 2) return true;
  const ps: number[] = [];
  for (const id of sectionIds) {
    const p = draftPos.get(id);
    if (p === undefined) return false;
    ps.push(p);
  }
  ps.sort((a, b) => a - b);
  for (let i = 1; i < ps.length; i++) if (ps[i] !== ps[i - 1] + 1) return false;
  return true;
}

/** Every ancestor id of `unitId`, nearest first. */
export function ancestryOf(unitId: string, units: readonly UnitRow[]): string[] {
  const byId = new Map(units.map((u) => [u.id, u]));
  const out: string[] = [];
  const seen = new Set<string>([unitId]);
  let cur = byId.get(unitId)?.parentId ?? null;
  while (cur !== null && !seen.has(cur)) {
    out.push(cur);
    seen.add(cur);
    cur = byId.get(cur)?.parentId ?? null;
  }
  return out;
}

/**
 * Would reparenting `unitId` under `newParentId` create a cycle?
 *
 * True when the new parent is the unit itself or anywhere beneath it. The
 * database CHECK only refuses self-parenting; a two-unit loop is refused here,
 * before the write.
 */
export function wouldCycle(
  unitId: string,
  newParentId: string | null,
  units: readonly UnitRow[],
): boolean {
  if (newParentId === null) return false;
  if (newParentId === unitId) return true;
  return ancestryOf(newParentId, units).includes(unitId);
}

/**
 * Sibling positions after inserting `unitId` at `index` among `siblings`
 * (which must already exclude it). Returns the full renumbering, 0..n-1, so a
 * move never leaves a gap or a duplicate for the next reader to interpret.
 */
export function renumberSiblings(
  siblings: readonly UnitRow[],
  unitId: string,
  index: number,
): { id: string; position: number }[] {
  const ordered = [...siblings].sort((a, b) => a.position - b.position).map((u) => u.id);
  const at = Math.max(0, Math.min(index, ordered.length));
  ordered.splice(at, 0, unitId);
  return ordered.map((id, i) => ({ id, position: i }));
}

/**
 * The inclusive run of draft sections between two ids, in draft order.
 *
 * Placement takes a RUN rather than a set: the member says "these chapters are
 * Part II" by naming its ends, and contiguity is then true by construction
 * instead of being policed after the fact. Passing the same id twice places
 * exactly one section.
 */
export function sectionRun(
  fromId: string,
  toId: string,
  sections: readonly PlaceableSection[],
): { ok: true; ids: string[] } | { ok: false; refusal: TreeRefusal } {
  const ordered = [...sections].sort((a, b) => a.position - b.position);
  const i = ordered.findIndex((s) => s.id === fromId);
  const j = ordered.findIndex((s) => s.id === toId);
  if (i < 0 || j < 0) return { ok: false, refusal: 'unknown_section' };
  const [lo, hi] = i <= j ? [i, j] : [j, i];
  return { ok: true, ids: ordered.slice(lo, hi + 1).map((s) => s.id) };
}
