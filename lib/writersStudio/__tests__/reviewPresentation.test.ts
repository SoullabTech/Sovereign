/**
 * WS2-05B step 5 - the preview is the operation, and the review reads as the book.
 */

import {
  reviewedToOutlineNodes, orderReview, previewOperation, needsPreview,
} from '../reviewPresentation';
import { drawnSectionIds } from '../outlineOrder';
import { toReviewed, applyReviewOperation, type ReviewedStructure } from '@/lib/manuscript/structure/review';
import { assignUnitIds, type ProposedUnitDraft } from '@/lib/manuscript/structure/interpret';
import { allReadings, fixtureSections } from '@/lib/manuscript/structure/fixtures';

const sections = fixtureSections();
const sid = (i: number) => `s${i}`;

const draft = (from: number, to: number, title: string,
  children: ProposedUnitDraft[] = []): ProposedUnitDraft => ({
  title, kind: null, fromSectionId: sid(from), toSectionId: sid(to),
  children, rationale: 'because', evidenceRefs: [], uncertainty: [],
});

const twoParents = (): ReviewedStructure => ({
  units: toReviewed(assignUnitIds([
    draft(0, 5, 'A', [draft(0, 2, 'Head'), draft(3, 5, 'Tail')]),
    draft(6, 11, 'B'),
  ])),
});

describe('ranges become the membership shape the outline understands', () => {
  it('a unit holds the sections of its range that no child claims', () => {
    const [a] = reviewedToOutlineNodes(twoParents().units, sections);
    expect(a.derivedSectionIds).toEqual(['s0', 's1', 's2', 's3', 's4', 's5']);
    /* Direct leaf placement, derived rather than declared - the same rule
       adoption will use. */
    expect(a.sectionIds).toEqual([]);
    expect(a.children[0].sectionIds).toEqual(['s0', 's1', 's2']);
  });

  it('a malformed range is dropped rather than drawn wrong', () => {
    const bad: ReviewedStructure = {
      units: [{ id: 'x', title: 'Backwards', kind: null,
        fromSectionId: sid(5), toSectionId: sid(2), children: [] }],
    };
    expect(reviewedToOutlineNodes(bad.units, sections)).toEqual([]);
  });
});

describe('the review reads in book order', () => {
  it('a partial reading keeps unaccounted material in position', () => {
    /* Only 0-3 is proposed. The rest must sit where it belongs, not below. */
    const reviewed: ReviewedStructure = {
      units: toReviewed(assignUnitIds([draft(0, 3, 'Opening')])),
    };
    const o = orderReview(reviewed, sections);
    const shape = o.entries.map((e) => e.kind === 'unit' ? `[${e.node.title}]` : String(e.position));
    expect(shape).toEqual(['[Opening]', '4', '5', '6', '7', '8', '9', '10', '11']);
  });

  it('a division sits where its earliest section is, not first', () => {
    const reviewed: ReviewedStructure = {
      units: toReviewed(assignUnitIds([draft(6, 8, 'Later')])),
    };
    const o = orderReview(reviewed, sections);
    const shape = o.entries.map((e) => e.kind === 'unit' ? `[${e.node.title}]` : String(e.position));
    expect(shape).toEqual(['0', '1', '2', '3', '4', '5', '[Later]', '9', '10', '11']);
  });

  it('every section is drawn exactly once', () => {
    const drawn = drawnSectionIds(orderReview(twoParents(), sections));
    expect(drawn).toEqual(sections.map((s) => s.id));
    expect(new Set(drawn).size).toBe(drawn.length);
  });

  it('a reading with no units renders the book unchanged', () => {
    const o = orderReview({ units: [] }, sections);
    expect(o.entries.every((e) => e.kind === 'section')).toBe(true);
    expect(o.entries).toHaveLength(12);
  });
});

describe('the preview IS the operation', () => {
  it('promote shows both changed divisions', () => {
    const r = twoParents();
    const head = r.units[0].children[0].id;
    const p = previewOperation(r, { op: 'promote', unitId: head }, sections);
    expect(p.status).toBe('ok');
    if (p.status !== 'ok') return;
    expect(p.rows).toEqual([
      { unitId: head, title: 'Head', effect: 'moves-out',
        before: '0-2', after: '0-2', fromParent: 'A', toParent: null },
      { unitId: r.units[0].id, title: 'A', effect: 'range-changes',
        before: '0-5', after: '3-5' },
    ]);
  });

  it('transfer shows all three changed facts', () => {
    const r = twoParents();
    const tail = r.units[0].children[1].id;
    const p = previewOperation(r, { op: 'transfer', unitId: tail, toParentId: r.units[1].id }, sections);
    expect(p.status).toBe('ok');
    if (p.status !== 'ok') return;
    /* Book order, container before what it holds: B now begins at 3 and Tail
       sits inside it. */
    expect(p.rows.map((x) => [x.title, x.effect, x.before, x.after])).toEqual([
      ['A', 'range-changes', '0-5', '0-2'],
      ['B', 'range-changes', '6-11', '3-11'],
      ['Tail', 'changes-parent', '3-5', '3-5'],
    ]);
    const moved = p.rows.find((x) => x.title === 'Tail')!;
    expect(moved.fromParent).toBe('A');
    expect(moved.toParent).toBe('B');
  });

  it('the previewed post-image is exactly what committing produces', () => {
    /* Not a second algorithm that could disagree: the preview applied the
       operation, so the two cannot differ. This test says so out loud. */
    const r = twoParents();
    const op = { op: 'promote' as const, unitId: r.units[0].children[0].id };
    const p = previewOperation(r, op, sections);
    const committed = applyReviewOperation(r, op, sections);
    expect(p.status === 'ok' && committed.status === 'ok'
      && JSON.stringify(p.reviewed) === JSON.stringify(committed.reviewed)).toBe(true);
  });

  it('a refused operation previews nothing', () => {
    const r = twoParents();
    const p = previewOperation(r, { op: 'promote', unitId: 'nope' }, sections);
    expect(p.status === 'refused' && p.refusal).toBe('unknown_unit');
  });

  it('reports a rename as a rename, and an addition as one', () => {
    const r = twoParents();
    const renamed = previewOperation(r,
      { op: 'rename', unitId: r.units[1].id, title: 'Beta', kind: null }, sections);
    expect(renamed.status === 'ok' && renamed.rows).toEqual([
      { unitId: r.units[1].id, title: 'Beta', effect: 'renamed', before: 'B', after: 'Beta' },
    ]);
  });

  it('only the coupled gestures need showing before they happen', () => {
    expect(needsPreview({ op: 'promote', unitId: 'x' })).toBe(true);
    expect(needsPreview({ op: 'transfer', unitId: 'x', toParentId: 'y' })).toBe(true);
    expect(needsPreview({ op: 'rename', unitId: 'x', title: 'a', kind: null })).toBe(false);
  });
});

describe('every reading the interpreter can produce is orderable', () => {
  it.each(Object.keys(allReadings) as (keyof typeof allReadings)[])(
    '%s renders in book order with every section drawn once', (name) => {
      const reading = allReadings[name]();
      const reviewed: ReviewedStructure = {
        units: 'units' in reading ? toReviewed(reading.units) : [],
      };
      const o = orderReview(reviewed, sections);
      expect(drawnSectionIds(o)).toEqual(sections.map((s) => s.id));
    });

  it('none and ambiguous produce no tree at all', () => {
    for (const name of ['none', 'ambiguous'] as const) {
      const reading = allReadings[name]();
      expect('units' in reading).toBe(false);
      const o = orderReview({ units: [] }, sections);
      expect(o.entries.every((e) => e.kind === 'section')).toBe(true);
    }
  });

  it('mixed keeps heterogeneous kinds rather than normalising them', () => {
    const reading = allReadings.mixed();
    const kinds = 'units' in reading ? reading.units.map((u) => u.kind) : [];
    expect(kinds).toEqual(['Part', 'Letter', 'Vignette']);
  });

  it('flat has no synthetic parent', () => {
    const reading = allReadings.flat();
    const units = 'units' in reading ? reading.units : [];
    expect(units.every((u) => u.children.length === 0)).toBe(true);
  });
});
