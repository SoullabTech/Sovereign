/**
 * WS2-05B step 4 - correcting a reading.
 */

import {
  toReviewed, applyReviewOperation, validateReviewed, reviewDiff, findUnit,
  mintMemberUnitId, type ReviewedStructure, type OrderedSection,
} from '../review';
import { assignUnitIds, type ProposedUnitDraft } from '../interpret';

const sections: OrderedSection[] = Array.from({ length: 12 }, (_, i) => ({
  id: `s${i}`, position: i,
}));
const sid = (i: number) => `s${i}`;

const draft = (
  from: number, to: number, title: string, children: ProposedUnitDraft[] = [],
): ProposedUnitDraft => ({
  title, kind: null, fromSectionId: sid(from), toSectionId: sid(to),
  children, rationale: `MAIA on ${title}`, evidenceRefs: [], uncertainty: [],
});

const proposed = () => assignUnitIds([
  draft(0, 5, 'Opening', [draft(0, 2, 'First'), draft(3, 5, 'Second')]),
  draft(6, 11, 'Return'),
]);

const start = (): ReviewedStructure => ({ units: toReviewed(proposed()) });
const apply = (r: ReviewedStructure, op: Parameters<typeof applyReviewOperation>[1]) =>
  applyReviewOperation(r, op, sections);

describe('the member\'s copy carries no claim of MAIA\'s', () => {
  it('rationale, evidence and uncertainty do not travel into it', () => {
    const r = start();
    const serialised = JSON.stringify(r);
    /* Otherwise a moved boundary would arrive carrying her reasoning for a
       boundary she never proposed. */
    expect(serialised).not.toMatch(/"(rationale|evidenceRefs|uncertainty)"/);
    expect(serialised).toContain('MAIA on'.slice(0, 0) || 'Opening');
  });

  it('but the ids survive, so the two halves pair', () => {
    const p = proposed();
    const r = toReviewed(p);
    expect(r.map((u) => u.id)).toEqual(p.map((u) => u.id));
    expect(r[0].children.map((u) => u.id)).toEqual(p[0].children.map((u) => u.id));
  });
});

describe('operations', () => {
  it('renames, and refuses a division with no name at all', () => {
    const id = start().units[0].id;
    const ok = apply(start(), { op: 'rename', unitId: id, title: 'Fire', kind: 'Movement' });
    expect(ok.status === 'ok' && ok.reviewed.units[0].title).toBe('Fire');
    const bad = apply(start(), { op: 'rename', unitId: id, title: '  ', kind: null });
    expect(bad.status === 'refused' && bad.refusal).toBe('empty_name');
  });

  it('moves a boundary', () => {
    const r = start();
    const second = r.units[0].children[1].id;
    const out = apply(r, { op: 'set-boundary', unitId: second, toSectionId: sid(4) });
    expect(out.status === 'ok' && out.reviewed.units[0].children[1].toSectionId).toBe(sid(4));
  });

  it('refuses a boundary change that would make a SIBLING overlap', () => {
    /* The post-image is judged, not the unit touched: widening "First" collides
       with "Second", which was not the unit being edited. */
    const r = start();
    const first = r.units[0].children[0].id;
    const out = apply(r, { op: 'set-boundary', unitId: first, toSectionId: sid(4) });
    expect(out.status === 'refused' && out.refusal).toBe('overlapping_siblings');
  });

  it('refuses a boundary change that escapes the parent', () => {
    const r = start();
    const second = r.units[0].children[1].id;
    const out = apply(r, { op: 'set-boundary', unitId: second, toSectionId: sid(9) });
    expect(out.status === 'refused' && out.refusal).toBe('child_outside_parent');
  });

  it('refuses a move into its own descendant', () => {
    const r = start();
    const cycle = apply(r, {
      op: 'reparent', unitId: r.units[0].id, parentId: r.units[0].children[0].id, index: 0,
    });
    expect(cycle.status === 'refused' && cycle.refusal).toBe('would_cycle');
  });

  it('refuses promotion while the parent still spans the child', () => {
    /* Opening covers 0-5. Promoting First (0-2) out of it would put two
       divisions over the same sections. The refusal names the cause rather
       than reporting a collision the member cannot act on. */
    const r = start();
    const out = apply(r, {
      op: 'reparent', unitId: r.units[0].children[0].id, parentId: null, index: 0,
    });
    expect(out.status === 'refused' && out.refusal).toBe('parent_still_spans_child');
  });

  it('promote moves a division out AND shrinks its parent, in one gesture', () => {
    /* Plain reparenting out is a dead end in a ranges model: shrink the parent
       first and the child is outside it, promote first and the parent spans it.
       Both refusals are correct; together they are unreachable. So promote is
       one operation that makes both edits. */
    const r = start();
    const out = apply(r, { op: 'promote', unitId: r.units[0].children[0].id });
    expect(out.status).toBe('ok');
    if (out.status !== 'ok') return;
    expect(out.reviewed.units.map((u) => u.title)).toEqual(['Opening', 'First', 'Return']);
    /* Opening gave up 0-2 and now begins where First ended. */
    expect(out.reviewed.units[0].fromSectionId).toBe(sid(3));
    expect(out.reviewed.units[0].children).toHaveLength(1);
  });

  it('promote refuses a child in the MIDDLE, which would split the parent', () => {
    const r = start();
    /* Widen Opening to 0-8 so Second (3-5) sits strictly inside it. */
    const wide = apply(r, { op: 'remove', unitId: r.units[1].id });
    expect(wide.status).toBe('ok');
    if (wide.status !== 'ok') return;
    const grown = apply(wide.reviewed, {
      op: 'set-boundary', unitId: wide.reviewed.units[0].id, toSectionId: sid(8),
    });
    expect(grown.status).toBe('ok');
    if (grown.status !== 'ok') return;
    const out = apply(grown.reviewed, {
      op: 'promote', unitId: grown.reviewed.units[0].children[1].id,
    });
    expect(out.status === 'refused' && out.refusal).toBe('child_splits_parent');
  });

  it('promote refuses when it would leave the parent holding nothing', () => {
    const r = start();
    const only = apply(r, { op: 'remove', unitId: r.units[0].children[1].id });
    expect(only.status).toBe('ok');
    if (only.status !== 'ok') return;
    const shrink = apply(only.reviewed, {
      op: 'set-boundary', unitId: only.reviewed.units[0].id, toSectionId: sid(2),
    });
    expect(shrink.status).toBe('ok');
    if (shrink.status !== 'ok') return;
    const out = apply(shrink.reviewed, {
      op: 'promote', unitId: shrink.reviewed.units[0].children[0].id,
    });
    expect(out.status === 'refused' && out.refusal).toBe('parent_would_be_empty');
  });

  it('removes only leaves, exactly as authored structure does', () => {
    const r = start();
    const held = apply(r, { op: 'remove', unitId: r.units[0].id });
    expect(held.status === 'refused' && held.refusal).toBe('unit_has_children');
    const leaf = apply(r, { op: 'remove', unitId: r.units[1].id });
    expect(leaf.status === 'ok' && leaf.reviewed.units).toHaveLength(1);
  });

  it('adds a division of the member\'s own, with an id that says so', () => {
    const r = start();
    /* 6-11 is Return; put the new one where nothing sits. Remove Return first. */
    const cleared = apply(r, { op: 'remove', unitId: r.units[1].id });
    expect(cleared.status).toBe('ok');
    if (cleared.status !== 'ok') return;
    const out = apply(cleared.reviewed, {
      op: 'add', parentId: null, index: 1, title: 'Mine', kind: null,
      fromSectionId: sid(6), toSectionId: sid(11),
    });
    expect(out.status).toBe('ok');
    if (out.status !== 'ok') return;
    const added = out.reviewed.units.find((u) => u.title === 'Mine')!;
    /* `m` rather than `p`: the record says at a glance which divisions came
       from the reading and which the member wrote. */
    expect(added.id).toMatch(/^m\d+$/);
  });

  it('chooses an alternative, which is how an ambiguous reading becomes editable', () => {
    const empty: ReviewedStructure = { units: [] };
    const out = apply(empty, {
      op: 'choose-alternative', label: 'by movement',
      units: assignUnitIds([draft(0, 5, 'One'), draft(6, 11, 'Two')]),
    });
    expect(out.status === 'ok' && out.reviewed.chosenAlternative).toBe('by movement');
    expect(out.status === 'ok' && out.reviewed.units).toHaveLength(2);
  });
});

describe('validation', () => {
  it('refuses a section this draft does not hold', () => {
    expect(validateReviewed(
      [{ id: 'p1', title: 'x', kind: null, fromSectionId: 'ghost', toSectionId: sid(1), children: [] }],
      sections,
    )?.refusal).toBe('unknown_section');
  });

  it('refuses a duplicate unit id', () => {
    const dup = { id: 'p1', title: 'x', kind: null, fromSectionId: sid(0), toSectionId: sid(1), children: [] };
    const other = { ...dup, fromSectionId: sid(3), toSectionId: sid(4) };
    expect(validateReviewed([dup, other], sections)?.refusal).toBe('duplicate_unit_id');
  });

  it('passes a well-formed tree', () => {
    expect(validateReviewed(start().units, sections)).toBeNull();
  });
});

describe('reviewDiff pairs by id', () => {
  it('a rename is a change, not a removal and an addition', () => {
    const p = proposed();
    const r = toReviewed(p);
    r[1].title = 'Renamed';
    const d = reviewDiff(p, r);
    expect(d.changed).toHaveLength(1);
    expect(d.changed[0].proposed.title).toBe('Return');
    expect(d.changed[0].reviewed.title).toBe('Renamed');
    expect(d.added).toHaveLength(0);
    expect(d.removed).toHaveLength(0);
  });

  it('names what the member added and what they took out', () => {
    const p = proposed();
    const r = toReviewed(p);
    r.pop();
    r.push({ id: mintMemberUnitId(r), title: 'Mine', kind: null,
      fromSectionId: sid(6), toSectionId: sid(11), children: [] });
    const d = reviewDiff(p, r);
    expect(d.added.map((u) => u.title)).toEqual(['Mine']);
    expect(d.removed.map((u) => u.title)).toEqual(['Return']);
  });

  it('reports nothing changed when nothing was', () => {
    const p = proposed();
    const d = reviewDiff(p, toReviewed(p));
    expect(d).toEqual({ added: [], removed: [], changed: [], unchanged: 4 });
  });
});

describe('nothing here can author structure', () => {
  it('the module does not reach the structure service', () => {
    /* The sovereignty boundary, checked rather than promised: review reshapes a
       proposal and only adoption may write units. */
    const raw: string = require('fs').readFileSync(
      require('path').join(__dirname, '..', 'review.ts'), 'utf8');
    /* Comments stripped first: this file DESCRIBES the boundary it must not
       cross, and a naive scan finds its own explanation of the rule. */
    const code = raw.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
    expect(code).not.toMatch(/structureService|manuscript_structure_units|manuscript_structure_members/);
  });

  it('findUnit reaches a nested unit without a path', () => {
    const r = start();
    const deep = r.units[0].children[1].id;
    expect(findUnit(r.units, deep)?.parent?.id).toBe(r.units[0].id);
  });
});
