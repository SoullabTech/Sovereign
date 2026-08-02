/**
 * Arrangement leaves the source alone — Phase 2 Slice 1, criteria 10–12.
 *
 * The acceptance walk ends with three claims that are about what CANNOT happen:
 *
 *   10. the atom is byte-for-byte unchanged
 *   11. return_preference, sanctuary posture, source detail and status unchanged
 *   12. no MAIA request or model call occurs
 *
 * A walk can only ever show these held on that occasion. These tests are the
 * complementary claim — that there is no code path from this surface that could
 * make them false — by reading the surface's own source, the same technique the
 * access-boundary suite uses.
 *
 * Labelled honestly: this is STRUCTURAL evidence. It proves the writes and the
 * calls are absent from the code. It does not prove the walk was performed, and
 * it is not a substitute for observing the row afterwards.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const ROOT = join(__dirname, '..', '..', '..');
const read = (p: string) => readFileSync(join(ROOT, p), 'utf8');

/** Comments stripped — the invariant is about what the code does, not says. */
const code = (p: string) =>
  read(p)
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '');

/** Every file a member's arrangement acts can execute. */
const ARRANGEMENT_SURFACE = [
  'lib/workbench/arrange.ts',
  'lib/workbench/sources/keep.ts',
  'app/api/book-studio/workbench/shelf/route.ts',
  'app/api/book-studio/workbench/tables/route.ts',
  'app/api/book-studio/workbench/tables/[id]/route.ts',
];

const WORKBENCH_COMPONENTS = [
  'components/book-studio/workbench/Room.tsx',
  'components/book-studio/workbench/Table.tsx',
  'components/book-studio/workbench/Group.tsx',
  'components/book-studio/workbench/Shelf.tsx',
  'components/book-studio/workbench/Card.tsx',
];

/**
 * Tables the member's captures live in. Arrangement may READ these and must
 * never write them. `workbench_tables` is deliberately absent — that is the
 * arrangement itself, and writing it is the entire point of the slice.
 */
const SOURCE_TABLES = ['member_memory_atoms', 'workbench_uploads'];

describe('criteria 10 & 11 — no arrangement path writes a source row', () => {
  for (const file of ARRANGEMENT_SURFACE) {
    for (const table of SOURCE_TABLES) {
      it(`${file} never writes ${table}`, () => {
        const src = code(file);
        expect(src).not.toMatch(new RegExp(`INSERT\\s+INTO\\s+${table}`, 'i'));
        expect(src).not.toMatch(new RegExp(`UPDATE\\s+${table}`, 'i'));
        expect(src).not.toMatch(new RegExp(`DELETE\\s+FROM\\s+${table}`, 'i'));
      });
    }
  }

  it('the Keep adapter reads and does nothing else', () => {
    const src = code('lib/workbench/sources/keep.ts');
    expect(src).toMatch(/SELECT/i);
    expect(src).not.toMatch(/\b(INSERT|UPDATE|DELETE)\b/i);
  });

  it('the only table the arrangement routes write is workbench_tables', () => {
    const writes = ARRANGEMENT_SURFACE.flatMap((f) =>
      [...code(f).matchAll(/(?:INSERT\s+INTO|UPDATE|DELETE\s+FROM)\s+([a-z_]+)/gi)].map(
        (m) => m[1].toLowerCase(),
      ),
    );
    expect([...new Set(writes)].sort()).toEqual(['workbench_tables']);
  });

  it('guard against a vacuous pass — the matcher does find the write it allows', () => {
    // If this fails, the assertions above are passing because the regex never
    // matches anything, not because the writes are absent.
    const src = code('app/api/book-studio/workbench/tables/[id]/route.ts');
    expect(src).toMatch(/UPDATE\s+workbench_tables/i);
  });
});

describe('criterion 12 — the arrangement surface calls no MAIA and no model', () => {
  const FORBIDDEN_ENDPOINTS = [
    /\/api\/oracle/,
    /\/api\/sovereign/,
    /\/api\/maia/,
    /\/api\/between/,
  ];

  for (const file of WORKBENCH_COMPONENTS) {
    it(`${file} requests no MAIA endpoint`, () => {
      const src = code(file);
      for (const endpoint of FORBIDDEN_ENDPOINTS) {
        expect(src).not.toMatch(endpoint);
      }
    });
  }

  it('no arrangement file imports an inference client', () => {
    for (const file of [...ARRANGEMENT_SURFACE, ...WORKBENCH_COMPONENTS]) {
      const src = code(file);
      expect(src).not.toMatch(/@anthropic-ai/);
      expect(src).not.toMatch(/from\s+['"][^'"]*(maiaService|maiaVoice|conductor)['"]/);
    }
  });

  it('every fetch from the Room targets the workbench or book-studio API', () => {
    const urls = [...code('components/book-studio/workbench/Room.tsx').matchAll(/fetch\(\s*[`'"]([^`'"]+)/g)]
      .map((m) => m[1]);
    expect(urls.length).toBeGreaterThan(0);
    for (const url of urls) {
      expect(url).toMatch(/^\/api\/book-studio\//);
    }
  });
});
