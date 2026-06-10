/**
 * Member selection in the private-channel create flow.
 *
 * POST /api/team/channels accepts an optional `memberIds` roster chosen at
 * creation time. This test pins the community-boundary contract:
 *   - public channel: memberIds ignored (no roster seeded) — visible to all
 *   - private channel: selected members seeded, creator always owner
 *   - creator id and malformed (non-UUID) ids are filtered from the seed
 *   - private + empty roster: still creates, owner only, nobody else seeded
 *
 * DB + auth are mocked; we assert on the exact SQL the handler issues.
 */
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { NextRequest } from 'next/server';

const CREATOR = '11111111-1111-4111-8111-111111111111';
const ALICE = '22222222-2222-4222-8222-222222222222';
const BOB = '33333333-3333-4333-8333-333333333333';

const mockQuery =
  jest.fn<(sql: string, params?: unknown[]) => Promise<{ rows: unknown[]; rowCount: number }>>();
jest.mock('@/lib/db/postgres', () => ({
  __esModule: true,
  default: { query: (sql: string, params?: unknown[]) => mockQuery(sql, params) },
  query: (sql: string, params?: unknown[]) => mockQuery(sql, params),
}));

// POST never calls listChannels; stub the module so its transitive deps don't load.
jest.mock('@/lib/team/ChannelService', () => ({ __esModule: true, listChannels: jest.fn() }));

const mockGetMemberId = jest.fn<() => Promise<string | null>>();
jest.mock('@/lib/auth/getMemberFromRequest', () => ({
  __esModule: true,
  getMemberIdFromRequest: () => mockGetMemberId(),
}));

import { POST } from '../channels/route';

function req(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/team/channels', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const SEED_SQL = /SELECT \$1, m\.id, 'member'/; // the roster-seed insert
const OWNER_SQL = /VALUES \(\$1, \$2, 'owner', \$2\)/; // creator-as-owner insert

const seedCall = () => mockQuery.mock.calls.find(c => SEED_SQL.test(c[0] as string));
const ownerCall = () => mockQuery.mock.calls.find(c => OWNER_SQL.test(c[0] as string));
const seedIds = () => (seedCall()![1] as unknown[])[2] as string[];

beforeEach(() => {
  mockQuery.mockReset();
  mockGetMemberId.mockReset();
  mockGetMemberId.mockResolvedValue(CREATOR);
  mockQuery.mockResolvedValue({ rows: [{ id: 'new-channel', slug: 'x' }], rowCount: 1 });
});

describe('POST /api/team/channels — roster at creation', () => {
  it('public channel ignores memberIds (no roster seeded), creator still owner', async () => {
    const res = await POST(req({ slug: 'general-chat', name: 'General Chat', isPrivate: false, memberIds: [ALICE, BOB] }));
    expect(res.status).toBe(201);
    expect(ownerCall()).toBeTruthy();
    expect(seedCall()).toBeUndefined();
  });

  it('private channel seeds selected members; creator excluded from the seed', async () => {
    const res = await POST(req({ slug: 'secret', name: 'Secret', isPrivate: true, memberIds: [ALICE, BOB, CREATOR] }));
    expect(res.status).toBe(201);
    expect(ownerCall()).toBeTruthy();
    expect(seedCall()).toBeTruthy();
    const ids = seedIds();
    expect(ids).toEqual(expect.arrayContaining([ALICE, BOB]));
    expect(ids).not.toContain(CREATOR);
    expect(ids).toHaveLength(2);
  });

  it('drops malformed / non-UUID ids and dedupes', async () => {
    const res = await POST(req({ slug: 'secret2', name: 'Secret2', isPrivate: true, memberIds: [ALICE, 'not-a-uuid', '', 42, ALICE] }));
    expect(res.status).toBe(201);
    expect(seedIds()).toEqual([ALICE]);
  });

  it('private channel with empty roster creates, owner only, nobody seeded', async () => {
    const res = await POST(req({ slug: 'solo', name: 'Solo', isPrivate: true, memberIds: [] }));
    expect(res.status).toBe(201);
    expect(ownerCall()).toBeTruthy();
    expect(seedCall()).toBeUndefined();
  });

  it('rejects unauthenticated requests before touching the DB', async () => {
    mockGetMemberId.mockResolvedValue(null);
    const res = await POST(req({ slug: 'x', name: 'X', isPrivate: true, memberIds: [ALICE] }));
    expect(res.status).toBe(401);
    expect(mockQuery).not.toHaveBeenCalled();
  });
});
