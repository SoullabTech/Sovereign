/**
 * Soul Portrait — Stage 1 owner-scoping verifier (cross-practitioner leak refusal).
 *
 * Proves the load-bearing Stage 1 refusal: a practitioner can NEVER read another
 * practitioner's Soul Portrait through the store. Every read accessor filters by
 * owner_member_id; there is no unscoped read path.
 *
 * How it falsifies: the DB mock is a tiny in-memory soul_portraits table that applies
 * the owner filter IFF the accessor's SQL scopes by owner_member_id. If a future edit
 * drops `AND owner_member_id = $N` from an accessor, the mock stops filtering → the
 * wrong-owner read returns a row → these tests fail loudly.
 *
 * Run: npx jest __tests__/soul-portrait-owner-scoping.test.ts
 */

const OWNER_A = 'owner-aaaa';
const OWNER_B = 'owner-bbbb';

const ROWS: any[] = [
  {
    id: 'portrait-A', slug: 'a-11111111', owner_member_id: OWNER_A,
    subject_member_id: null, subject_person_id: null, subject_is_minor: false,
    portrait_kind: 'gift', consent_state: 'pending', published_at: null,
    immutable_text: { person: { name: 'Client of A' } }, created_at: '2026-07-04T00:00:00Z',
  },
  {
    id: 'portrait-B', slug: 'b-22222222', owner_member_id: OWNER_B,
    subject_member_id: null, subject_person_id: null, subject_is_minor: false,
    portrait_kind: 'gift', consent_state: 'pending', published_at: null,
    immutable_text: { person: { name: 'Client of B' } }, created_at: '2026-07-04T00:00:00Z',
  },
];

// An accessor is owner-scoped iff its SQL constrains owner_member_id.
const scopesByOwner = (sql: string) => /owner_member_id\s*=\s*\$\d+/i.test(sql);

const mockQueryOne = jest.fn(async (sql: string, params: any[]) => {
  // id/slug predicate is params[0]; owner predicate (when scoped) is params[1].
  let rows = ROWS.filter((r) => r.id === params[0] || r.slug === params[0]);
  if (scopesByOwner(sql)) rows = rows.filter((r) => r.owner_member_id === params[1]);
  return rows[0] ?? null;
});

const mockQuery = jest.fn(async (sql: string, params: any[]) => {
  let rows = [...ROWS];
  if (scopesByOwner(sql)) rows = rows.filter((r) => r.owner_member_id === params[0]);
  return { rows };
});

jest.mock('@/lib/db/postgres', () => ({
  query: (...args: any[]) => (mockQuery as any)(...args),
  queryOne: (...args: any[]) => (mockQueryOne as any)(...args),
}));

import {
  getOwnedPortrait,
  getOwnedPortraitBySlug,
  listOwnedPortraits,
} from '@/lib/soulPortrait/portraitStore';
import * as store from '@/lib/soulPortrait/portraitStore';

beforeEach(() => jest.clearAllMocks());

describe('Soul Portrait — Stage 1 owner-scoping (cross-practitioner leak refusal)', () => {
  it('an owner reads their OWN portrait by id', async () => {
    const p = await getOwnedPortrait('portrait-A', OWNER_A);
    expect(p?.id).toBe('portrait-A');
    expect(p?.ownerMemberId).toBe(OWNER_A);
  });

  it('FAIL CLOSED: practitioner B cannot read practitioner A’s portrait by id', async () => {
    const leaked = await getOwnedPortrait('portrait-A', OWNER_B);
    expect(leaked).toBeNull();
  });

  it('FAIL CLOSED: practitioner B cannot read practitioner A’s portrait by slug', async () => {
    const leaked = await getOwnedPortraitBySlug('a-11111111', OWNER_B);
    expect(leaked).toBeNull();
  });

  it('a list is scoped to the caller — never another practitioner’s rows', async () => {
    const bList = await listOwnedPortraits(OWNER_B);
    expect(bList.map((p) => p.id)).toEqual(['portrait-B']);
    expect(bList.some((p) => p.ownerMemberId === OWNER_A)).toBe(false);

    const aList = await listOwnedPortraits(OWNER_A);
    expect(aList.map((p) => p.id)).toEqual(['portrait-A']);
  });

  it('every read accessor sends an owner-scoped query to the DB (structural)', async () => {
    await getOwnedPortrait('portrait-A', OWNER_A);
    await getOwnedPortraitBySlug('a-11111111', OWNER_A);
    await listOwnedPortraits(OWNER_A);
    const allSql = [...mockQueryOne.mock.calls, ...mockQuery.mock.calls].map((c) => String(c[0]));
    expect(allSql.length).toBeGreaterThan(0);
    for (const sql of allSql) expect(scopesByOwner(sql)).toBe(true);
  });

  it('Grade A: no unscoped read accessor is exported from the store', () => {
    // If a future change reintroduces an unscoped reader, this fails on purpose —
    // tighten it to owner-scoped, or (for Gate 4 delivery) add a *consent*-scoped
    // accessor with its own verifier, never an unscoped one.
    expect((store as any).getPortraitById).toBeUndefined();
    expect((store as any).getPortraitBySlug).toBeUndefined();
  });
});
