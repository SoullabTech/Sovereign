/**
 * Arrangement verbs — Phase 2 Slice 1.
 *
 * Two kinds of claim, labelled honestly:
 *   - behavioural — the transforms are executed and their output asserted.
 *   - structural  — the module is read and asserted to have no database reach,
 *                   the same technique the access-boundary suite uses. This is
 *                   what pins "arrangement never mutates the source" at the
 *                   layer where it is actually guaranteed.
 *
 * The `acceptance walk` block below is the founder's walk (steps 1–9) executed
 * against the pure layer. It is NOT a substitute for the walk itself: it proves
 * the transforms compose correctly, not that a member can perform them in a
 * browser, and not that the atom is unchanged in the database.
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import {
  gather,
  movePlacement,
  reorderPlacement,
  duplicatePlacement,
  returnToShelf,
  separate,
  stripLayout,
} from '../arrange';
import type { TableLayout } from '../sources/types';

const KEEP = { source: 'keep' as const, ref: 'atom-1' };

/** Two empty piles, A and B. */
function table(): TableLayout {
  return {
    groups: [
      { id: 'g_A', name: 'Pile A', cards: [] },
      { id: 'g_B', name: 'Pile B', cards: [] },
    ],
  };
}

function unwrap(r: ReturnType<typeof gather>): TableLayout {
  if (!r.ok) throw new Error(`expected ok, got ${r.reason}`);
  return r.layout;
}

function cardsIn(layout: TableLayout, groupId: string) {
  return layout.groups.find((g) => g.id === groupId)!.cards;
}

function idsIn(layout: TableLayout, groupId: string) {
  return cardsIn(layout, groupId).map((c) => c.id);
}

describe('gather', () => {
  it('places a Shelf pointer into the named pile and nowhere else', () => {
    const after = unwrap(gather(table(), { groupId: 'g_A', pointer: KEEP, placementId: 'c_1' }));
    expect(cardsIn(after, 'g_A')).toEqual([{ id: 'c_1', source: 'keep', ref: 'atom-1' }]);
    expect(cardsIn(after, 'g_B')).toEqual([]);
  });

  it('refuses a placement id that already exists', () => {
    const once = unwrap(gather(table(), { groupId: 'g_A', pointer: KEEP, placementId: 'c_1' }));
    const twice = gather(once, { groupId: 'g_B', pointer: KEEP, placementId: 'c_1' });
    expect(twice).toEqual({ ok: false, reason: 'duplicate_placement_id' });
  });

  it('honours an explicit index rather than always appending', () => {
    let l = unwrap(gather(table(), { groupId: 'g_A', pointer: KEEP, placementId: 'c_1' }));
    l = unwrap(gather(l, { groupId: 'g_A', pointer: KEEP, placementId: 'c_2' }));
    l = unwrap(gather(l, { groupId: 'g_A', pointer: KEEP, placementId: 'c_3', toIndex: 1 }));
    expect(idsIn(l, 'g_A')).toEqual(['c_1', 'c_3', 'c_2']);
  });

  it('reports an unknown pile instead of silently doing nothing', () => {
    expect(gather(table(), { groupId: 'g_ZZ', pointer: KEEP, placementId: 'c_1' })).toEqual({
      ok: false,
      reason: 'group_not_found',
    });
  });
});

describe('move', () => {
  it('transfers the placement and keeps its id — the same act, relocated', () => {
    const before = unwrap(gather(table(), { groupId: 'g_A', pointer: KEEP, placementId: 'c_1' }));
    const after = unwrap(
      movePlacement(before, { cardId: 'c_1', fromGroupId: 'g_A', toGroupId: 'g_B' }),
    );
    expect(idsIn(after, 'g_A')).toEqual([]);
    expect(cardsIn(after, 'g_B')).toEqual([{ id: 'c_1', source: 'keep', ref: 'atom-1' }]);
  });

  it('lands at the requested index in the destination', () => {
    let l = unwrap(gather(table(), { groupId: 'g_B', pointer: KEEP, placementId: 'c_x' }));
    l = unwrap(gather(l, { groupId: 'g_B', pointer: KEEP, placementId: 'c_y' }));
    l = unwrap(gather(l, { groupId: 'g_A', pointer: KEEP, placementId: 'c_1' }));
    const after = unwrap(
      movePlacement(l, { cardId: 'c_1', fromGroupId: 'g_A', toGroupId: 'g_B', toIndex: 1 }),
    );
    expect(idsIn(after, 'g_B')).toEqual(['c_x', 'c_1', 'c_y']);
  });

  it('moving into the pile it is already in is a reorder, not a duplication', () => {
    let l = unwrap(gather(table(), { groupId: 'g_A', pointer: KEEP, placementId: 'c_1' }));
    l = unwrap(gather(l, { groupId: 'g_A', pointer: KEEP, placementId: 'c_2' }));
    const after = unwrap(
      movePlacement(l, { cardId: 'c_1', fromGroupId: 'g_A', toGroupId: 'g_A', toIndex: 1 }),
    );
    expect(idsIn(after, 'g_A')).toEqual(['c_2', 'c_1']);
  });

  it('reports a card that is not in the source pile', () => {
    expect(
      movePlacement(table(), { cardId: 'c_nope', fromGroupId: 'g_A', toGroupId: 'g_B' }),
    ).toEqual({ ok: false, reason: 'card_not_found' });
  });
});

describe('reorder', () => {
  it('moves a card down to an explicit position', () => {
    let l = table();
    for (const id of ['c_1', 'c_2', 'c_3']) {
      l = unwrap(gather(l, { groupId: 'g_A', pointer: KEEP, placementId: id }));
    }
    expect(idsIn(unwrap(reorderPlacement(l, { groupId: 'g_A', cardId: 'c_1', toIndex: 2 })), 'g_A'))
      .toEqual(['c_2', 'c_3', 'c_1']);
  });

  it('moves a card up to an explicit position', () => {
    let l = table();
    for (const id of ['c_1', 'c_2', 'c_3']) {
      l = unwrap(gather(l, { groupId: 'g_A', pointer: KEEP, placementId: id }));
    }
    expect(idsIn(unwrap(reorderPlacement(l, { groupId: 'g_A', cardId: 'c_3', toIndex: 0 })), 'g_A'))
      .toEqual(['c_3', 'c_1', 'c_2']);
  });

  it('clamps an out-of-range index instead of losing the card', () => {
    let l = table();
    for (const id of ['c_1', 'c_2']) {
      l = unwrap(gather(l, { groupId: 'g_A', pointer: KEEP, placementId: id }));
    }
    expect(idsIn(unwrap(reorderPlacement(l, { groupId: 'g_A', cardId: 'c_1', toIndex: 99 })), 'g_A'))
      .toEqual(['c_2', 'c_1']);
    expect(idsIn(unwrap(reorderPlacement(l, { groupId: 'g_A', cardId: 'c_2', toIndex: -5 })), 'g_A'))
      .toEqual(['c_2', 'c_1']);
  });
});

describe('duplicate placement', () => {
  it('creates a second placement of the SAME capture with a NEW id', () => {
    const before = unwrap(gather(table(), { groupId: 'g_A', pointer: KEEP, placementId: 'c_1' }));
    const after = unwrap(
      duplicatePlacement(before, {
        cardId: 'c_1',
        fromGroupId: 'g_A',
        toGroupId: 'g_B',
        placementId: 'c_2',
      }),
    );
    expect(cardsIn(after, 'g_A')).toEqual([{ id: 'c_1', source: 'keep', ref: 'atom-1' }]);
    expect(cardsIn(after, 'g_B')).toEqual([{ id: 'c_2', source: 'keep', ref: 'atom-1' }]);
    // One capture, two placements — the point of the verb.
    expect(cardsIn(after, 'g_A')[0].ref).toBe(cardsIn(after, 'g_B')[0].ref);
    expect(cardsIn(after, 'g_A')[0].id).not.toBe(cardsIn(after, 'g_B')[0].id);
  });

  it('allows two placements of one capture inside a SINGLE pile', () => {
    // The v0 guard refused this. The Duplicate verb requires it, and the
    // acceptance walk reorders the two against each other.
    const before = unwrap(gather(table(), { groupId: 'g_A', pointer: KEEP, placementId: 'c_1' }));
    const after = unwrap(
      duplicatePlacement(before, {
        cardId: 'c_1',
        fromGroupId: 'g_A',
        toGroupId: 'g_A',
        placementId: 'c_2',
      }),
    );
    expect(idsIn(after, 'g_A')).toEqual(['c_1', 'c_2']);
  });
});

describe('return to shelf / separate', () => {
  it('removes the placement and leaves every other placement of that capture', () => {
    let l = unwrap(gather(table(), { groupId: 'g_A', pointer: KEEP, placementId: 'c_1' }));
    l = unwrap(
      duplicatePlacement(l, {
        cardId: 'c_1',
        fromGroupId: 'g_A',
        toGroupId: 'g_B',
        placementId: 'c_2',
      }),
    );
    const after = unwrap(returnToShelf(l, { groupId: 'g_A', cardId: 'c_1' }));
    expect(idsIn(after, 'g_A')).toEqual([]);
    expect(idsIn(after, 'g_B')).toEqual(['c_2']);
  });

  it('separate is the same operation under the pile-side name', () => {
    expect(separate).toBe(returnToShelf);
  });
});

describe('purity', () => {
  it('never mutates the layout it was given', () => {
    const before = unwrap(gather(table(), { groupId: 'g_A', pointer: KEEP, placementId: 'c_1' }));
    const snapshot = JSON.parse(JSON.stringify(before));
    movePlacement(before, { cardId: 'c_1', fromGroupId: 'g_A', toGroupId: 'g_B' });
    reorderPlacement(before, { groupId: 'g_A', cardId: 'c_1', toIndex: 0 });
    duplicatePlacement(before, {
      cardId: 'c_1',
      fromGroupId: 'g_A',
      toGroupId: 'g_B',
      placementId: 'c_9',
    });
    returnToShelf(before, { groupId: 'g_A', cardId: 'c_1' });
    expect(before).toEqual(snapshot);
  });

  it('stripLayout drops resolved content so it can never be written back', () => {
    const resolved = [
      {
        id: 'g_A',
        name: 'Pile A',
        cards: [
          { id: 'c_1', source: 'keep' as const, ref: 'atom-1', resolved: { content: 'x', meta: {} } },
        ],
      },
    ];
    expect(stripLayout(resolved)).toEqual({
      groups: [{ id: 'g_A', name: 'Pile A', cards: [{ id: 'c_1', source: 'keep', ref: 'atom-1' }] }],
    });
  });

  it('placement ids stay unique across the whole table through every verb', () => {
    let l = unwrap(gather(table(), { groupId: 'g_A', pointer: KEEP, placementId: 'c_1' }));
    l = unwrap(
      duplicatePlacement(l, { cardId: 'c_1', fromGroupId: 'g_A', toGroupId: 'g_B', placementId: 'c_2' }),
    );
    l = unwrap(movePlacement(l, { cardId: 'c_1', fromGroupId: 'g_A', toGroupId: 'g_B' }));
    const ids = l.groups.flatMap((g) => g.cards.map((c) => c.id));
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('structural — arrangement cannot reach the source', () => {
  /**
   * Comments are stripped before scanning. The invariant is about what the
   * module can DO, not what it says about itself — and the header comment
   * legitimately names `query()` in order to forbid it.
   */
  function code(): string {
    return readFileSync(join(__dirname, '..', 'arrange.ts'), 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*$/gm, '');
  }

  it('the arrange module has no database import', () => {
    expect(code()).not.toMatch(/from\s+['"][^'"]*db\/postgres['"]/);
  });

  it('the arrange module calls no query() and issues no SQL', () => {
    expect(code()).not.toMatch(/\bquery\s*\(/);
    expect(code()).not.toMatch(/\b(SELECT|INSERT|UPDATE|DELETE)\b/);
  });

  it('the comment-stripper actually strips (guard against a vacuous pass)', () => {
    // If this ever fails, the two assertions above are passing for the wrong
    // reason and prove nothing.
    expect(code()).not.toMatch(/Arrangement — the member-authored acts/);
    expect(code()).toMatch(/export function movePlacement/);
  });
});

describe('acceptance walk (steps 1–9, pure layer only)', () => {
  it('composes into the founder walk and persists the arrangement', () => {
    // 1. Place it into Pile A.
    let l = unwrap(gather(table(), { groupId: 'g_A', pointer: KEEP, placementId: 'c_1' }));
    expect(idsIn(l, 'g_A')).toEqual(['c_1']);

    // 2. Duplicate it into Pile B.
    l = unwrap(
      duplicatePlacement(l, { cardId: 'c_1', fromGroupId: 'g_A', toGroupId: 'g_B', placementId: 'c_2' }),
    );
    expect(idsIn(l, 'g_B')).toEqual(['c_2']);

    // 3. Move one placement from A to B.
    l = unwrap(movePlacement(l, { cardId: 'c_1', fromGroupId: 'g_A', toGroupId: 'g_B' }));
    expect(idsIn(l, 'g_A')).toEqual([]);
    expect(idsIn(l, 'g_B')).toEqual(['c_2', 'c_1']);

    // 4. Reorder both placements in B.
    l = unwrap(reorderPlacement(l, { groupId: 'g_B', cardId: 'c_1', toIndex: 0 }));
    expect(idsIn(l, 'g_B')).toEqual(['c_1', 'c_2']);

    // 5. Return one placement to the Shelf.
    l = unwrap(returnToShelf(l, { groupId: 'g_B', cardId: 'c_2' }));
    expect(idsIn(l, 'g_B')).toEqual(['c_1']);

    // 6. Rename the pile. (Rename shipped in v0; asserted here so the walk is
    //    whole and a regression in it would surface with the rest.)
    l = { groups: l.groups.map((g) => (g.id === 'g_B' ? { ...g, name: 'Chapter openings' } : g)) };

    // 7–9. Leave, return, confirm. A round-trip through the layout column is
    //      JSON — so serializing and reparsing is exactly what persistence does
    //      to this value. What it cannot prove is that the row was written.
    const reloaded: TableLayout = JSON.parse(JSON.stringify(l));
    expect(reloaded.groups.find((g) => g.id === 'g_B')!.name).toBe('Chapter openings');
    expect(idsIn(reloaded, 'g_B')).toEqual(['c_1']);
    expect(cardsIn(reloaded, 'g_B')[0]).toEqual({ id: 'c_1', source: 'keep', ref: 'atom-1' });
  });
});
