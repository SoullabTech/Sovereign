import { orderOutline, anchorOf, drawnSectionIds, type OutlineEntry } from '../outlineOrder';
import type { StructureNodeDTO } from '../structureClient';

const sections = Array.from({ length: 10 }, (_, i) => ({ id: `s${i}`, position: i }));
const pos = new Map(sections.map((s) => [s.id, s.position]));

const unit = (
  id: string,
  own: string[],
  children: StructureNodeDTO[] = [],
): StructureNodeDTO => ({
  id, kind: null, title: id, origin: 'member', position: 0, children,
  sectionIds: own,
  derivedSectionIds: [...own, ...children.flatMap((c) => c.derivedSectionIds)]
    .sort((a, b) => (pos.get(a) ?? 0) - (pos.get(b) ?? 0)),
  contiguous: true,
});

/** The column as a reader would see it: section positions and unit titles. */
const shape = (entries: readonly OutlineEntry[]): string[] =>
  entries.map((e) => (e.kind === 'section' ? String(e.position) : `[${e.node.title}]`));

describe('book order is authoritative', () => {
  it('places a division where its earliest section is, not first', () => {
    /* The 05A defect: Fire 42-69 rendered above 0-41. */
    const fire = unit('Fire', ['s4', 's5', 's6']);
    const o = orderOutline([fire], sections);
    expect(shape(o.entries)).toEqual(['0', '1', '2', '3', '[Fire]', '7', '8', '9']);
  });

  it('interleaves two divisions with the unplaced material between them', () => {
    const a = unit('A', ['s1', 's2']);
    const b = unit('B', ['s7', 's8']);
    const o = orderOutline([b, a], sections);
    expect(shape(o.entries)).toEqual(['0', '[A]', '3', '4', '5', '6', '[B]', '9']);
  });

  it('anchors a parent by a section held only by its child', () => {
    const child = unit('Chapter', ['s2', 's3']);
    const part = unit('Part', ['s5'], [child]);
    const o = orderOutline([part], sections);
    expect(shape(o.entries)).toEqual(['0', '1', '[Part]', '4', '6', '7', '8', '9']);
    const inside = o.entries.find((e) => e.kind === 'unit');
    expect(inside && inside.kind === 'unit' && shape(inside.entries))
      .toEqual(['[Chapter]', '5']);
  });

  it('orders a unit\'s own sections against its children by position', () => {
    const child = unit('Late', ['s8']);
    const part = unit('Part', ['s1'], [child]);
    const o = orderOutline([part], sections);
    const p = o.entries.find((e) => e.kind === 'unit');
    expect(p && p.kind === 'unit' && shape(p.entries)).toEqual(['1', '[Late]']);
  });
});

describe('an empty division is given no position', () => {
  it('is held aside rather than guessed into the column', () => {
    const named = unit('Just named', []);
    const fire = unit('Fire', ['s4', 's5']);
    const o = orderOutline([named, fire], sections);
    expect(shape(o.entries)).toEqual(['0', '1', '2', '3', '[Fire]', '6', '7', '8', '9']);
    expect(o.empty.map((u) => u.title)).toEqual(['Just named']);
  });

  it('an empty child is held aside within its parent, not hoisted', () => {
    const emptyChild = unit('Empty', []);
    const part = unit('Part', ['s2', 's3'], [emptyChild]);
    const o = orderOutline([part], sections);
    expect(o.empty).toEqual([]);
    const p = o.entries.find((e) => e.kind === 'unit');
    expect(p && p.kind === 'unit' && p.empty.map((u) => u.title)).toEqual(['Empty']);
  });

  it('anchorOf is null for a unit holding nothing', () => {
    expect(anchorOf(unit('X', []), pos)).toBeNull();
  });
});

describe('nothing is drawn twice and nothing is dropped', () => {
  it('every section appears exactly once, in book order', () => {
    const child = unit('Chapter', ['s2', 's3']);
    const part = unit('Part', ['s4'], [child]);
    const other = unit('Other', ['s8']);
    const drawn = drawnSectionIds(orderOutline([part, other], sections));
    expect(drawn).toEqual(sections.map((s) => s.id));
    expect(new Set(drawn).size).toBe(drawn.length);
  });

  it('a book with no divisions renders exactly as the flat list', () => {
    const o = orderOutline([], sections);
    expect(drawnSectionIds(o)).toEqual(sections.map((s) => s.id));
    expect(o.entries.every((e) => e.kind === 'section')).toBe(true);
  });

  it('a section the draft no longer has is not invented into the column', () => {
    const ghost = unit('Ghost', ['s3', 'gone']);
    const o = orderOutline([ghost], sections);
    expect(drawnSectionIds(o)).not.toContain('gone');
    expect(drawnSectionIds(o)).toContain('s3');
  });
});
