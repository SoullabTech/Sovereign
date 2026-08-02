/**
 * Arrangement — the member-authored acts on a Table layout.
 *
 * Phase 2 Slice 1 ("complete the verb set"). Every act a member can perform on
 * the Table is a pure transform of `workbench_tables.layout` and lives here:
 *
 *   gather    — place a Shelf pointer into a pile
 *   move      — transfer one placement from pile A to pile B
 *   reorder   — change the order of placements within one pile
 *   duplicate — a second placement of the same {source, ref} in another pile
 *   return    — remove the placement; the source stays searchable on the Shelf
 *
 * WHY THIS MODULE HAS NO DATABASE IMPORT
 * --------------------------------------
 * That absence is the invariant, not an accident. Arrangement changes where a
 * member has *put* something. It never changes the thing itself. A member may
 * move, duplicate, or return a Keep a hundred times and the underlying atom —
 * its text, its `return_preference`, its sanctuary posture, its status — is
 * untouched, because nothing in this file can reach it. Adding a `query()`
 * import here would break that guarantee silently, so don't.
 *
 * IDENTITY: PLACEMENT vs POINTER
 * ------------------------------
 * `CardPointer.id` identifies a PLACEMENT — one act of putting something
 * somewhere. `{source, ref}` identifies the POINTED-AT capture. These are
 * deliberately different:
 *
 *   - placement ids are unique across the whole table
 *   - {source, ref} is NOT unique — that is what makes Duplicate placement a
 *     real act rather than a no-op
 *
 * Slice 1 deliberately removes the v0 guard that refused a second placement of
 * the same {source, ref} inside one group. That guard predated the Duplicate
 * verb and now contradicts it: the acceptance walk requires two placements of
 * one Keep inside a single pile, then reorders them against each other.
 *
 * SEPARATE vs RETURN TO SHELF
 * ---------------------------
 * The Phase 2 verb list names both. As layout operations they are the same
 * operation — remove the placement, leave the capture alone — named from two
 * points of view: *Separate* from the pile's, *Return to Shelf* from the
 * member's. One function serves both; `separate` is exported as a named alias
 * so calling code can say which act it means. If lived use later shows these
 * are genuinely different (e.g. Separate meaning "out of the pile but still on
 * the table"), that needs an ungrouped region in the layout — a real change to
 * the layout contract, not a second copy of this function.
 *
 * The Shelf is not a second storage location. It is the retrievable source
 * field. Returning to Shelf removes an arrangement fact; it stores nothing.
 */

import type { CardPointer, TableGroup, TableLayout } from './sources/types';

export type ArrangeFailure =
  | 'group_not_found'
  | 'card_not_found'
  | 'duplicate_placement_id';

export type ArrangeResult =
  | { ok: true; layout: TableLayout }
  | { ok: false; reason: ArrangeFailure };

/** A fresh placement id. One act of placing = one id. */
export function newPlacementId(): string {
  return `c_${crypto.randomUUID()}`;
}

/**
 * Normalize a layout down to pointers only.
 *
 * The GET route hands back groups whose cards carry resolved content. That
 * resolved content must never be written back into the layout column — the
 * layout stores pointers, and content is resolved per read. Every write path
 * goes through here so that stripping is not re-implemented (and forgotten)
 * at each call site.
 */
export function stripLayout(groups: ReadonlyArray<{
  id: string;
  name: string;
  cards: ReadonlyArray<{ id: string; source: CardPointer['source']; ref: string }>;
}>): TableLayout {
  return {
    groups: groups.map((g) => ({
      id: g.id,
      name: g.name,
      cards: g.cards.map((c) => ({ id: c.id, source: c.source, ref: c.ref })),
    })),
  };
}

// ── internals ────────────────────────────────────────────────────────────────

function findGroup(layout: TableLayout, groupId: string): TableGroup | undefined {
  return layout.groups.find((g) => g.id === groupId);
}

/** Insert at `index`, clamped to the ends. Undefined index appends. */
function insertAt<T>(list: readonly T[], item: T, index?: number): T[] {
  const next = [...list];
  const at = index === undefined ? next.length : Math.max(0, Math.min(index, next.length));
  next.splice(at, 0, item);
  return next;
}

function mapGroups(
  layout: TableLayout,
  fn: (g: TableGroup) => TableGroup,
): TableLayout {
  return { groups: layout.groups.map(fn) };
}

function allPlacementIds(layout: TableLayout): string[] {
  return layout.groups.flatMap((g) => g.cards.map((c) => c.id));
}

// ── the verbs ────────────────────────────────────────────────────────────────

/**
 * Gather — place a Shelf pointer into a pile.
 *
 * The member is asserting "this belongs here". A second gather of the same
 * capture into the same pile is a legitimate second placement, not an error.
 */
export function gather(
  layout: TableLayout,
  args: {
    groupId: string;
    pointer: Pick<CardPointer, 'source' | 'ref'>;
    placementId: string;
    toIndex?: number;
  },
): ArrangeResult {
  if (!findGroup(layout, args.groupId)) return { ok: false, reason: 'group_not_found' };
  if (allPlacementIds(layout).includes(args.placementId)) {
    return { ok: false, reason: 'duplicate_placement_id' };
  }

  const placement: CardPointer = {
    id: args.placementId,
    source: args.pointer.source,
    ref: args.pointer.ref,
  };

  return {
    ok: true,
    layout: mapGroups(layout, (g) =>
      g.id === args.groupId
        ? { ...g, cards: insertAt(g.cards, placement, args.toIndex) }
        : g,
    ),
  };
}

/**
 * Move — transfer one placement from group A to group B.
 *
 * The placement keeps its id: it is the same act of placing, relocated. Moving
 * within one group is a reorder, and is delegated so both paths agree.
 */
export function movePlacement(
  layout: TableLayout,
  args: { cardId: string; fromGroupId: string; toGroupId: string; toIndex?: number },
): ArrangeResult {
  const from = findGroup(layout, args.fromGroupId);
  const to = findGroup(layout, args.toGroupId);
  if (!from || !to) return { ok: false, reason: 'group_not_found' };

  const placement = from.cards.find((c) => c.id === args.cardId);
  if (!placement) return { ok: false, reason: 'card_not_found' };

  if (args.fromGroupId === args.toGroupId) {
    return reorderPlacement(layout, {
      groupId: args.fromGroupId,
      cardId: args.cardId,
      toIndex: args.toIndex ?? from.cards.length - 1,
    });
  }

  return {
    ok: true,
    layout: mapGroups(layout, (g) => {
      if (g.id === args.fromGroupId) {
        return { ...g, cards: g.cards.filter((c) => c.id !== args.cardId) };
      }
      if (g.id === args.toGroupId) {
        return { ...g, cards: insertAt(g.cards, { ...placement }, args.toIndex) };
      }
      return g;
    }),
  };
}

/**
 * Reorder — change the order of placements within one group.
 *
 * `toIndex` is the position in the list as the member sees it once the card has
 * been lifted out, so moving a card down by one behaves the way dragging does.
 */
export function reorderPlacement(
  layout: TableLayout,
  args: { groupId: string; cardId: string; toIndex: number },
): ArrangeResult {
  const group = findGroup(layout, args.groupId);
  if (!group) return { ok: false, reason: 'group_not_found' };

  const current = group.cards.findIndex((c) => c.id === args.cardId);
  if (current === -1) return { ok: false, reason: 'card_not_found' };

  const without = group.cards.filter((c) => c.id !== args.cardId);
  const moved = insertAt(without, { ...group.cards[current] }, args.toIndex);

  return {
    ok: true,
    layout: mapGroups(layout, (g) => (g.id === args.groupId ? { ...g, cards: moved } : g)),
  };
}

/**
 * Duplicate placement — a NEW placement id pointing at the same {source, ref}.
 *
 * One capture, genuinely in two piles at once. Nothing about the capture is
 * copied: both placements are pointers at the same row, so there is exactly one
 * underlying object and no version of it can drift from another.
 */
export function duplicatePlacement(
  layout: TableLayout,
  args: {
    cardId: string;
    fromGroupId: string;
    toGroupId: string;
    placementId: string;
    toIndex?: number;
  },
): ArrangeResult {
  const from = findGroup(layout, args.fromGroupId);
  if (!from) return { ok: false, reason: 'group_not_found' };
  if (!findGroup(layout, args.toGroupId)) return { ok: false, reason: 'group_not_found' };

  const original = from.cards.find((c) => c.id === args.cardId);
  if (!original) return { ok: false, reason: 'card_not_found' };
  if (allPlacementIds(layout).includes(args.placementId)) {
    return { ok: false, reason: 'duplicate_placement_id' };
  }

  return gather(layout, {
    groupId: args.toGroupId,
    pointer: { source: original.source, ref: original.ref },
    placementId: args.placementId,
    toIndex: args.toIndex,
  });
}

/**
 * Return to Shelf — remove the placement from the table.
 *
 * This is the whole operation. The capture remains exactly where it was, fully
 * searchable on the Shelf, because it was never moved onto the table in the
 * first place — only pointed at.
 */
export function returnToShelf(
  layout: TableLayout,
  args: { groupId: string; cardId: string },
): ArrangeResult {
  const group = findGroup(layout, args.groupId);
  if (!group) return { ok: false, reason: 'group_not_found' };
  if (!group.cards.some((c) => c.id === args.cardId)) {
    return { ok: false, reason: 'card_not_found' };
  }

  return {
    ok: true,
    layout: mapGroups(layout, (g) =>
      g.id === args.groupId
        ? { ...g, cards: g.cards.filter((c) => c.id !== args.cardId) }
        : g,
    ),
  };
}

/**
 * Separate — remove a card from a pile without deleting or altering the
 * underlying capture. Same layout operation as Return to Shelf, named from the
 * pile's point of view. See the header note on why this is an alias and not a
 * second implementation.
 */
export const separate = returnToShelf;

/** Human-readable reason, for surfacing in the Room's status line. */
export function describeFailure(reason: ArrangeFailure): string {
  switch (reason) {
    case 'group_not_found':
      return 'That pile is no longer on the table.';
    case 'card_not_found':
      return 'That card is no longer in this pile.';
    case 'duplicate_placement_id':
      return 'That placement already exists.';
  }
}
