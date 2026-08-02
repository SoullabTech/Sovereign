/**
 * Workbench access boundary — the narrow amendment to ARCHITECTURE §8.
 *
 * §8 lists "Founder-only" as a sovereignty invariant enforced by
 * requireFounder() in every workbench route and page layout. That invariant is
 * amended for exactly three routes and no others. These tests pin the shape of
 * that amendment so it cannot widen by accident.
 *
 * Two kinds of claim, labelled honestly:
 *   - behavioural — sourcesForRole() is executed and its result asserted.
 *   - source-level — the route files are read and their gate asserted, the same
 *     technique the refusal registry uses. This proves which gate is wired
 *     without standing up Next's request pipeline in jest.
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { sourcesForRole, sourceKindsForRole, getSource } from '../sources';

const ROOT = join(__dirname, '..', '..', '..');
const read = (p: string) => readFileSync(join(ROOT, p), 'utf8');

const AMENDED = [
  'app/api/book-studio/workbench/shelf/route.ts',
  'app/api/book-studio/workbench/tables/route.ts',
  'app/api/book-studio/workbench/tables/[id]/route.ts',
];

const STILL_FOUNDER_ONLY = [
  'app/api/book-studio/drafts/from-group/route.ts',
  'app/api/book-studio/workbench/uploads/route.ts',
  'app/api/book-studio/workbench/uploads/[id]/route.ts',
  'app/api/book-studio/workbench/uploads/[id]/file/route.ts',
];

describe('role → searchable sources (behavioural)', () => {
  it('a member may search Keeps and nothing else', () => {
    expect(sourceKindsForRole('member')).toEqual(['keep']);
  });

  it('the founder keeps exactly the Slice 1 source set — no behaviour change', () => {
    expect(sourceKindsForRole('founder')).toEqual(['uploaded']);
  });

  it('a member cannot reach `uploaded` — intersecting a request with the role set cannot widen it', () => {
    // This mirrors the route: role set first, then narrow by ?source=.
    const requested = 'uploaded';
    const permitted = sourcesForRole('member').filter((s) => s.kind === requested);
    expect(permitted).toEqual([]);
  });

  it('narrowing to a permitted source still works', () => {
    const permitted = sourcesForRole('member').filter((s) => s.kind === 'keep');
    expect(permitted.map((s) => s.kind)).toEqual(['keep']);
  });

  it('getSource resolves any registered adapter, so a placed card never loses its content', () => {
    // Resolution is deliberately broader than search: an arranger must not lose
    // a card they already placed because their searchable set changed.
    expect(getSource('keep')).not.toBeNull();
    expect(getSource('uploaded')).not.toBeNull();
  });

  it('adapters that would conflate source-native ids with canonical atoms stay unregistered', () => {
    // ideas / journals / decisions: source row and atom are different objects,
    // and ARCHITECTURE §5 vs the 2026-05-26 Keep ruling are unreconciled there.
    expect(getSource('ideas')).toBeNull();
    expect(getSource('journals')).toBeNull();
    expect(getSource('decisions')).toBeNull();
  });
});

describe('which routes the amendment touched (source-level)', () => {
  it.each(AMENDED)('%s admits an authenticated arranger', (p) => {
    const src = read(p);
    expect(src).toMatch(/requireArranger\(\)/);
    expect(src).not.toMatch(/requireFounder\(\)/);
  });

  it.each(STILL_FOUNDER_ONLY)('%s remains founder-gated at the server', (p) => {
    const src = read(p);
    expect(src).toMatch(/requireFounder\(\)/);
    expect(src).not.toMatch(/requireArranger\(\)/);
  });

  it('the shelf route derives its source set from the caller role, not the query string', () => {
    const src = read(AMENDED[0]);
    expect(src).toMatch(/sourcesForRole\(\s*auth\.role\s*\)/);
    // The request may only filter within that set.
    expect(src).toMatch(/sources\s*=\s*sources\.filter\(/);
    expect(src).not.toMatch(/enabledSources\(\)/);
  });

  it('every amended route still scopes its rows to the caller', () => {
    for (const p of AMENDED.slice(1)) {
      expect(read(p)).toMatch(/arranger_id\s*=\s*\$\d/);
    }
  });
});

describe('member surface (source-level)', () => {
  const page = () => read('app/maia/workbench/page.tsx');

  it('requires a session and sends anonymous visitors to sign in', () => {
    expect(page()).toMatch(/getCurrentSession\(\)/);
    expect(page()).toMatch(/redirect\('\/signin\?next=\/maia\/workbench'\)/);
  });

  it('hides upload and graduation', () => {
    expect(page()).toMatch(/canUpload=\{false\}/);
    expect(page()).toMatch(/canGraduate=\{false\}/);
  });

  it('scopes its table to the session member', () => {
    expect(page()).toMatch(/findOrCreateTable\(session\.memberId\)/);
    expect(page()).toMatch(/arranger_id = \$1/);
  });

  it('adds no model call — the room stays silent (ARCHITECTURE §8)', () => {
    const src = page();
    expect(src).not.toMatch(/anthropic|openai|claude|generateText|completion/i);
  });
});

describe('the founder surface is untouched', () => {
  it('still gates on requireFounder and passes no member-surface props', () => {
    const src = read('app/book-studio/workbench/page.tsx');
    expect(src).toMatch(/requireFounder\(\)/);
    expect(src).not.toMatch(/canUpload|canGraduate/);
  });

  it('room affordances default to on, so the founder render is unchanged', () => {
    const src = read('components/book-studio/workbench/Room.tsx');
    expect(src).toMatch(/canUpload = true/);
    expect(src).toMatch(/canGraduate = true/);
  });
});

describe('lib/workbench contains no model calls at all (ARCHITECTURE §8: absence is auditable)', () => {
  // Prose is allowed to NAME inference — the point is that no code performs it.
  const codeOnly = (p: string) =>
    read(p)
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/(^|[^:])\/\/.*$/gm, '$1');

  it.each([
    'lib/workbench/sources/keep.ts',
    'lib/workbench/sources/index.ts',
    'lib/workbench/access.ts',
    'lib/workbench/sanctuary.ts',
  ])('%s', (p) => {
    const src = codeOnly(p);
    expect(src).not.toMatch(/@anthropic-ai|\bopenai\b|generateText|createCompletion|embeddings?\(/i);
    expect(src).not.toMatch(/\bcluster\w*\(|\binfer[A-Z]\w*\(/);
  });
});
