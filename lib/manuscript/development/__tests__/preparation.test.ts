/**
 * DEVELOP PREPARATION — the resolver, falsified without a database.
 *
 * The defect being held closed: a Work with a full Source outline and a
 * pre-2026-09-02 working draft resolved, from DEVELOP's point of view, as
 * indistinguishable from a Work with nothing in it. These tests assert that
 * each state is REACHED and NAMED separately, and that the two states which
 * offer an act are exactly the two where an act is possible.
 */

jest.mock('@/lib/db/postgres', () => ({ query: jest.fn(), transaction: jest.fn() }));

import { query } from '@/lib/db/postgres';
import { resolveDevelopPreparation } from '../preparation';
import { composeCurrent } from '@/lib/manuscript/sections/composers';

const mockQuery = query as jest.Mock;
const MEMBER = '11111111-1111-1111-1111-111111111111';
const MS = '22222222-2222-2222-2222-222222222222';

const SOURCE = [
  { id: 'aaaaaaaa-0000-0000-0000-000000000001', heading: 'One', body: 'First body line.\nSecond line.' },
  { id: 'aaaaaaaa-0000-0000-0000-000000000002', heading: 'Two', body: 'Another body.' },
];

/** Answer the resolver's two queries by shape. */
function db(opts: {
  source: typeof SOURCE;
  draft: null | { content: string; version: number; addressable: boolean; draftSections: number };
}) {
  mockQuery.mockImplementation(async (sql: string) => {
    if (/FROM manuscript_sections s/.test(sql)) return { rows: opts.source };
    if (/FROM manuscript_working_drafts d/.test(sql)) {
      return {
        rows: opts.draft
          ? [{
              id: 'dddddddd-0000-0000-0000-000000000001',
              content: opts.draft.content,
              version: String(opts.draft.version),
              section_addressable_at: opts.draft.addressable ? new Date() : null,
              draft_sections: String(opts.draft.draftSections),
            }]
          : [],
      };
    }
    throw new Error(`unexpected SQL: ${sql}`);
  });
}

beforeEach(() => jest.clearAllMocks());

it('a partitioned draft is READY — capture will read it', async () => {
  db({ source: SOURCE, draft: { content: composeCurrent(SOURCE), version: 4, addressable: true, draftSections: 2 } });
  expect(await resolveDevelopPreparation(MS, MEMBER)).toEqual({ kind: 'ready', draftSections: 2 });
});

it('a Work with Source and no draft is NO_DRAFT, and says how many sections it has', async () => {
  db({ source: SOURCE, draft: null });
  expect(await resolveDevelopPreparation(MS, MEMBER)).toEqual({ kind: 'no_draft', sourceSections: 2 });
});

it('an unedited legacy draft is CONVERTIBLE and not diverged', async () => {
  db({ source: SOURCE, draft: { content: composeCurrent(SOURCE), version: 1, addressable: false, draftSections: 0 } });
  const state = await resolveDevelopPreparation(MS, MEMBER);
  expect(state.kind).toBe('convertible');
  if (state.kind !== 'convertible') throw new Error('unreachable');
  expect(state.diverged).toBe(false);
  expect(state.divergence.resolved).toBe(state.divergence.boundaries);
  expect(state.disclosure).toMatch(/^[0-9a-f]{64}$/);
});

/**
 * THE PRODUCTION CASE. A body edit inside a section leaves every boundary
 * exactly where it was — so the draft is convertible, AND the member is owed
 * the disclosure that their words have changed since import.
 */
it('a legacy draft edited in the body is CONVERTIBLE and diverged, with boundaries all located', async () => {
  const edited = composeCurrent(SOURCE).replace('Second line.', 'Second line, rewritten by the author.');
  db({ source: SOURCE, draft: { content: edited, version: 9, addressable: false, draftSections: 0 } });
  const state = await resolveDevelopPreparation(MS, MEMBER);
  expect(state.kind).toBe('convertible');
  if (state.kind !== 'convertible') throw new Error('unreachable');
  expect(state.diverged).toBe(true);
  expect(state.divergence.classification).toBe('EDITED');
  expect(state.divergence.resolved).toBe(state.divergence.boundaries);
  expect(state.divergence.bodyLinesChanged).toBeGreaterThan(0);
});

/** ⛔ A MOVED BOUNDARY IS NEVER OFFERED. Nobody can confirm a guess. */
it('a legacy draft whose heading was rewritten is UNRESOLVABLE, with no offer', async () => {
  const moved = composeCurrent(SOURCE).replace('Two', 'Chapter Two — Renamed');
  db({ source: SOURCE, draft: { content: moved, version: 3, addressable: false, draftSections: 0 } });
  const state = await resolveDevelopPreparation(MS, MEMBER);
  expect(state.kind).toBe('unresolvable');
  if (state.kind !== 'unresolvable') throw new Error('unreachable');
  expect(state).not.toHaveProperty('disclosure');
});

it('an addressable draft holding no sections is INDETERMINATE, never ready', async () => {
  db({ source: SOURCE, draft: { content: 'x', version: 1, addressable: true, draftSections: 0 } });
  expect((await resolveDevelopPreparation(MS, MEMBER)).kind).toBe('indeterminate');
});

it('a Work with no Source sections is NO_SOURCE', async () => {
  db({ source: [], draft: null });
  expect(await resolveDevelopPreparation(MS, MEMBER)).toEqual({ kind: 'no_source' });
});

/** The digest names the state that was shown: a save changes it. */
it('the disclosure changes when the draft changes', async () => {
  db({ source: SOURCE, draft: { content: composeCurrent(SOURCE), version: 1, addressable: false, draftSections: 0 } });
  const a = await resolveDevelopPreparation(MS, MEMBER);
  db({ source: SOURCE, draft: { content: composeCurrent(SOURCE), version: 2, addressable: false, draftSections: 0 } });
  const b = await resolveDevelopPreparation(MS, MEMBER);
  if (a.kind !== 'convertible' || b.kind !== 'convertible') throw new Error('unreachable');
  expect(a.disclosure).not.toBe(b.disclosure);
});
