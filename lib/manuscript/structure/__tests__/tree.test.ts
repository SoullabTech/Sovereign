/**
 * WS2-05A — the tree rules, and the property the whole unit rests on.
 */

import {
  buildTree, isContiguous, ancestryOf, wouldCycle, renumberSiblings, sectionRun,
  type UnitRow, type MemberRow, type PlaceableSection,
} from '../tree';

const sections: PlaceableSection[] = Array.from({ length: 6 }, (_, i) => ({
  id: `s${i}`, position: i,
}));

const unit = (id: string, parentId: string | null, position: number, title: string): UnitRow => ({
  id, parentId, position, kind: 'Chapter', title, origin: 'member',
});

describe('buildTree', () => {
  it('nests by parent_id and orders siblings by position', () => {
    const units = [unit('b', null, 1, 'Two'), unit('a', null, 0, 'One'), unit('a1', 'a', 0, 'One.i')];
    const t = buildTree(units, [], sections);
    expect(t.roots.map((r) => r.id)).toEqual(['a', 'b']);
    expect(t.roots[0].children.map((c) => c.id)).toEqual(['a1']);
  });

  it('orders a unit\'s sections by DRAFT position, not by insertion order', () => {
    const members: MemberRow[] = [
      { unitId: 'a', draftSectionId: 's3' },
      { unitId: 'a', draftSectionId: 's1' },
      { unitId: 'a', draftSectionId: 's2' },
    ];
    const t = buildTree([unit('a', null, 0, 'One')], members, sections);
    expect(t.roots[0].sectionIds).toEqual(['s1', 's2', 's3']);
  });

  it('derives a parent\'s sections from its descendants without storing them twice', () => {
    const units = [unit('p', null, 0, 'Part'), unit('c', 'p', 0, 'Chapter')];
    const members: MemberRow[] = [
      { unitId: 'p', draftSectionId: 's0' },
      { unitId: 'c', draftSectionId: 's1' },
      { unitId: 'c', draftSectionId: 's2' },
    ];
    const t = buildTree(units, members, sections);
    const part = t.roots[0];
    /* Direct placement stays direct: s1 and s2 belong to the chapter alone. */
    expect(part.sectionIds).toEqual(['s0']);
    expect(part.derivedSectionIds).toEqual(['s0', 's1', 's2']);
    expect(part.children[0].sectionIds).toEqual(['s1', 's2']);
  });

  it('shows unplaced sections rather than hiding them', () => {
    const members: MemberRow[] = [{ unitId: 'a', draftSectionId: 's2' }];
    const t = buildTree([unit('a', null, 0, 'One')], members, sections);
    expect(t.unplacedSectionIds).toEqual(['s0', 's1', 's3', 's4', 's5']);
  });

  it('reports a unit that has become two disjoint pieces of the book', () => {
    const members: MemberRow[] = [
      { unitId: 'a', draftSectionId: 's0' },
      { unitId: 'a', draftSectionId: 's4' },
    ];
    const t = buildTree([unit('a', null, 0, 'One')], members, sections);
    /* Reported, not refused: the member is mid-organisation, and the room does
       not fight the writer. But it does not pretend the chapter is whole. */
    expect(t.roots[0].contiguous).toBe(false);
  });

  it('an empty manuscript structure leaves every section unplaced', () => {
    const t = buildTree([], [], sections);
    expect(t.roots).toEqual([]);
    expect(t.unplacedSectionIds).toHaveLength(6);
  });
});

describe('isContiguous', () => {
  const pos = new Map(sections.map((s) => [s.id, s.position]));
  it('is true for empty and single', () => {
    expect(isContiguous([], pos)).toBe(true);
    expect(isContiguous(['s3'], pos)).toBe(true);
  });
  it('is true for an unbroken run given out of order', () => {
    expect(isContiguous(['s3', 's1', 's2'], pos)).toBe(true);
  });
  it('is false across a gap', () => {
    expect(isContiguous(['s1', 's3'], pos)).toBe(false);
  });
  it('is false when a section is not in the draft at all', () => {
    expect(isContiguous(['s1', 'ghost'], pos)).toBe(false);
  });
});

describe('wouldCycle', () => {
  const units = [unit('a', null, 0, 'A'), unit('b', 'a', 0, 'B'), unit('c', 'b', 0, 'C')];
  it('refuses self-parenting', () => expect(wouldCycle('a', 'a', units)).toBe(true));
  it('refuses parenting under a descendant', () => expect(wouldCycle('a', 'c', units)).toBe(true));
  it('permits moving to top level', () => expect(wouldCycle('c', null, units)).toBe(false));
  it('permits an unrelated parent', () => {
    const more = [...units, unit('d', null, 1, 'D')];
    expect(wouldCycle('c', 'd', more)).toBe(false);
  });
  it('terminates on data that is already cyclic', () => {
    const bad = [unit('x', 'y', 0, 'X'), unit('y', 'x', 0, 'Y')];
    /* Stops at the first repeat rather than walking forever. The start unit
       is never in its own ancestry, so the loop is reported as ending there. */
    expect(ancestryOf('x', bad)).toEqual(['y']);
  });
});

describe('renumberSiblings', () => {
  const sibs = [unit('a', null, 0, 'A'), unit('b', null, 1, 'B')];
  it('renumbers 0..n-1 with no gap or duplicate', () => {
    expect(renumberSiblings(sibs, 'new', 1)).toEqual([
      { id: 'a', position: 0 }, { id: 'new', position: 1 }, { id: 'b', position: 2 },
    ]);
  });
  it('clamps an index past the end', () => {
    expect(renumberSiblings(sibs, 'new', 99).at(-1)).toEqual({ id: 'new', position: 2 });
  });
  it('clamps a negative index', () => {
    expect(renumberSiblings(sibs, 'new', -5)[0]).toEqual({ id: 'new', position: 0 });
  });
});

describe('sectionRun', () => {
  it('returns an inclusive run in draft order', () => {
    const r = sectionRun('s1', 's3', sections);
    expect(r).toEqual({ ok: true, ids: ['s1', 's2', 's3'] });
  });
  it('accepts the ends in either order', () => {
    expect(sectionRun('s3', 's1', sections)).toEqual({ ok: true, ids: ['s1', 's2', 's3'] });
  });
  it('places exactly one when both ends are the same', () => {
    expect(sectionRun('s2', 's2', sections)).toEqual({ ok: true, ids: ['s2'] });
  });
  it('refuses an id that is not in this draft', () => {
    expect(sectionRun('s1', 'ghost', sections)).toEqual({ ok: false, refusal: 'unknown_section' });
  });
  it('a run is contiguous by construction', () => {
    const pos = new Map(sections.map((s) => [s.id, s.position]));
    const r = sectionRun('s0', 's5', sections);
    expect(r.ok && isContiguous(r.ids, pos)).toBe(true);
  });
});

describe('the defining property', () => {
  /**
   * Not a behavioural test — a structural one. If a future edit gives any of
   * these functions the ability to return text, this fails, and the person
   * making that edit is told why before it reaches a member's manuscript.
   */
  it('no tree function accepts or returns manuscript text', () => {
    const members: MemberRow[] = [{ unitId: 'a', draftSectionId: 's0' }];
    const t = buildTree([unit('a', null, 0, 'One')], members, sections);
    const serialised = JSON.stringify(t);
    /* Ids and positions only. The word "text" or "body" appearing as a key
       would mean structure had started carrying the writing. */
    expect(serialised).not.toMatch(/"(text|body|content)"/);
  });
});
