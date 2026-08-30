/**
 * The two id namespaces. Both are uuids on an object with a heading and a
 * position, so nothing about their shape prevents the wrong one being wired —
 * only where the rows come from.
 */

import { navigableRows, rowsShareIdentityWith } from '../outlineRows';
import type { EditableSection } from '@/lib/manuscript/sections/saveSection';

const writeState: EditableSection[] = [
  { id: 'draft-sec-0', position: 0, heading: 'Chapter One', body: 'aaa', editable: true },
  { id: 'draft-sec-1', position: 1, heading: 'Chapter Two', body: 'bb', editable: true },
];

/** What GET /api/sovereign/manuscripts/[id] returns — the Source identity. */
const sourceRows = [
  { id: 'source-sec-0', position: 0, heading: 'Chapter One', chars: 3 },
  { id: 'source-sec-1', position: 1, heading: 'Chapter Two', chars: 2 },
];

describe('navigable outline rows', () => {
  it('carries the DRAFT section id as the navigation identity', () => {
    expect(navigableRows(writeState).map((r) => r.id)).toEqual(['draft-sec-0', 'draft-sec-1']);
  });

  it('takes heading text from provenance but never its identity', () => {
    const rows = navigableRows(writeState);
    expect(rows[0].heading).toBe('Chapter One');   // same words as the Source row
    expect(rows[0].id).not.toBe(sourceRows[0].id); // different identity
  });

  it('reports extent from the editable body', () => {
    expect(navigableRows(writeState).map((r) => r.chars)).toEqual([3, 2]);
  });

  it('THE WIRING GUARD: Source rows do not share identity with the write state', () => {
    // This is the mistake the guard exists to catch. The rows look right,
    // render right, and every click would miss.
    expect(rowsShareIdentityWith(sourceRows, writeState)).toBe(false);
    expect(rowsShareIdentityWith(navigableRows(writeState), writeState)).toBe(true);
  });

  it('a row count that matches is not enough — identity is checked', () => {
    const decoy = writeState.map((s, i) => ({ ...sourceRows[i], position: s.position }));
    expect(decoy).toHaveLength(writeState.length);
    expect(rowsShareIdentityWith(decoy, writeState)).toBe(false);
  });
});
