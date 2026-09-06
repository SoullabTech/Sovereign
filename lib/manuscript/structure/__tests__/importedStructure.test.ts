/**
 * WS2-08A — arrived depth folds into a tree; nothing is guessed.
 */

import {
  deriveImportedStructure,
  validateImportedStructure,
  importedUnitId,
  type DepthedSection,
} from '../importedStructure';
import type { ReviewedUnit } from '../review';

const sec = (i: number, heading: string | null, depth: 1 | 2 | 3 | null): DepthedSection => ({
  id: `s${i}`,
  position: i,
  heading,
  headingDepth: depth,
});

const shape = (u: ReviewedUnit): unknown => ({
  title: u.title,
  from: u.fromSectionId,
  to: u.toSectionId,
  children: u.children.map(shape),
});

describe('deriveImportedStructure', () => {
  it('nests ## under # and ### under ##, each unit running to the next heading of its depth or shallower', () => {
    const sections = [
      sec(0, 'Chapter 1', 1),
      sec(1, 'Opening', 2),
      sec(2, 'The First Movement', 2),
      sec(3, 'A smaller passage', 3),
      sec(4, 'Another passage', 3),
      sec(5, 'Closing', 2),
      sec(6, 'Chapter 2', 1),
      sec(7, 'Only', 2),
    ];
    const out = deriveImportedStructure(sections);
    expect(out.unplacedSectionIds).toEqual([]);
    expect(out.explicitCount).toBe(8);
    expect(out.unclassifiedCount).toBe(0);
    expect(out.maxDepth).toBe(3);
    expect(out.units.map(shape)).toEqual([
      {
        title: 'Chapter 1', from: 's0', to: 's5',
        children: [
          { title: 'Opening', from: 's1', to: 's1', children: [] },
          {
            title: 'The First Movement', from: 's2', to: 's4',
            children: [
              { title: 'A smaller passage', from: 's3', to: 's3', children: [] },
              { title: 'Another passage', from: 's4', to: 's4', children: [] },
            ],
          },
          { title: 'Closing', from: 's5', to: 's5', children: [] },
        ],
      },
      {
        title: 'Chapter 2', from: 's6', to: 's7',
        children: [{ title: 'Only', from: 's7', to: 's7', children: [] }],
      },
    ]);
    expect(validateImportedStructure(out, sections)).toBeNull();
  });

  it('never promotes an unclassified boundary: 185 ALL-CAPS cuts produce zero units, all unplaced', () => {
    const sections = Array.from({ length: 185 }, (_, i) => sec(i, `HEADING ${i}`, null));
    const out = deriveImportedStructure(sections);
    expect(out.units).toEqual([]);
    expect(out.unplacedSectionIds).toHaveLength(185);
    expect(out.explicitCount).toBe(0);
    expect(out.unclassifiedCount).toBe(185);
    expect(out.maxDepth).toBe(0);
    expect(validateImportedStructure(out, sections)).toBeNull();
  });

  it('keeps unclassified boundaries inside the explicit unit that is open, extending its run', () => {
    const sections = [
      sec(0, null, null),               // untitled preamble
      sec(1, 'Fire', 1),
      sec(2, 'THE SACRED FLAME', null),  // caps boundary: stays in Fire
      sec(3, 'Kindling', 2),
      sec(4, 'EMBERS', null),            // caps boundary: stays in Kindling and Fire
      sec(5, 'Water', 1),
    ];
    const out = deriveImportedStructure(sections);
    expect(out.unplacedSectionIds).toEqual(['s0']);
    expect(out.units.map(shape)).toEqual([
      {
        title: 'Fire', from: 's1', to: 's4',
        children: [{ title: 'Kindling', from: 's3', to: 's4', children: [] }],
      },
      { title: 'Water', from: 's5', to: 's5', children: [] },
    ]);
    expect(out.unclassifiedCount).toBe(2);
    expect(validateImportedStructure(out, sections)).toBeNull();
  });

  it('nests a depth jump exactly as written, and a deeper heading before any shallower one stands at the root', () => {
    const sections = [
      sec(0, 'Deep first', 2),
      sec(1, 'Top', 1),
      sec(2, 'Jump', 3),
      sec(3, 'Back', 2),
    ];
    const out = deriveImportedStructure(sections);
    expect(out.units.map(shape)).toEqual([
      { title: 'Deep first', from: 's0', to: 's0', children: [] },
      {
        title: 'Top', from: 's1', to: 's3',
        children: [
          { title: 'Jump', from: 's2', to: 's2', children: [] },
          { title: 'Back', from: 's3', to: 's3', children: [] },
        ],
      },
    ]);
    expect(validateImportedStructure(out, sections)).toBeNull();
  });

  it('is deterministic in the rows alone and mints ids from section ids; kind is never invented', () => {
    const sections = [sec(0, 'Chapter One', 1), sec(1, 'Part', 2)];
    const a = deriveImportedStructure(sections);
    const b = deriveImportedStructure([...sections].reverse());
    expect(a).toEqual(b);
    expect(a.units[0].id).toBe(importedUnitId('s0'));
    expect(a.units[0].kind).toBeNull();
    expect(a.units[0].children[0].kind).toBeNull();
  });
});
