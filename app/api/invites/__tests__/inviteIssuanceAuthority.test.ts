/**
 * WS2 · INVITE ISSUANCE AUTHORITY — the other half of the admission invariant.
 *
 *   registration requires an authorized invite
 *   AND
 *   an authorized invite can only be issued by its AUTHENTICATED issuer.
 *
 * Without the second half, closing the prefix bypass only changed
 *
 *   invent a prefix → register
 * into
 *   name an eligible memberId → anonymously mint a real invite → register
 *
 * which is still an admission bypass. All three routes took `memberId` from the
 * request body or query string, and the access matrix never mapped
 * `/api/invites/*`, whose unmapped default is permissive unless
 * ACCESS_CONTROL_MODE=strict — which production does not set.
 */

const mockQuery = jest.fn();
const mockGetMemberId = jest.fn();

jest.mock('@/lib/db/postgres', () => ({
  __esModule: true,
  default: { query: (s: string, p?: unknown[]) => mockQuery(s, p) },
  query: (s: string, p?: unknown[]) => mockQuery(s, p),
}));
jest.mock('@/lib/auth/getMemberFromRequest', () => ({
  __esModule: true,
  getMemberIdFromRequest: (r: unknown) => mockGetMemberId(r),
}));

import { NextRequest } from 'next/server';
import { POST as createInvite } from '../create/route';
import { GET as listInvites } from '../list/route';
import { POST as revokeInvite } from '../revoke/route';
import { matchRule } from '@/config/accessMatrix';

const A = 'member-A';
const B = 'member-B';

const post = (url: string, body: unknown) =>
  new NextRequest(`https://soullab.life${url}`, {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body),
  });
const get = (url: string) => new NextRequest(`https://soullab.life${url}`);

/** A is eligible to invite; the invite in play belongs to B. */
function eligible(owner = A) {
  mockQuery.mockImplementation((sql: string) => {
    if (/FROM members WHERE id/i.test(sql)) {
      return Promise.resolve({ rows: [{ id: owner, username: 'a', name: 'A', invites_remaining: 10, can_invite_after: null, invite_tier: 'standard' }], rowCount: 1 });
    }
    if (/FROM invites\b/i.test(sql) && /created_by/i.test(sql)) {
      return Promise.resolve({ rows: [{ id: 'inv-B', passkey: 'SOULLAB-X', status: 'pending', created_by: B }], rowCount: 1 });
    }
    return Promise.resolve({ rows: [], rowCount: 1 });
  });
}

beforeEach(() => { mockQuery.mockReset(); mockGetMemberId.mockReset(); });

describe('anonymous callers are refused', () => {
  beforeEach(() => mockGetMemberId.mockResolvedValue(null));

  it('create is refused', async () => {
    eligible();
    const res = await createInvite(post('/api/invites/create', { memberId: A }));
    expect(res.status).toBe(401);
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it('list is refused', async () => {
    eligible();
    const res = await listInvites(get('/api/invites/list?memberId=' + A));
    expect(res.status).toBe(401);
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it('revoke is refused', async () => {
    eligible();
    const res = await revokeInvite(post('/api/invites/revoke', { memberId: B, inviteId: 'inv-B' }));
    expect(res.status).toBe(401);
    expect(mockQuery).not.toHaveBeenCalled();
  });
});

describe('a supplied member id carries no authority', () => {
  beforeEach(() => mockGetMemberId.mockResolvedValue(A));

  it('create cannot spend B allowance — the server reads A', async () => {
    eligible();
    await createInvite(post('/api/invites/create', { memberId: B, intendedName: 'x' }));
    const memberLookups = mockQuery.mock.calls.filter(([sql]) => /FROM members WHERE id/i.test(sql as string));
    expect(memberLookups.length).toBeGreaterThan(0);
    for (const [, params] of memberLookups) expect((params as string[])[0]).toBe(A);
    for (const [, params] of mockQuery.mock.calls) {
      if (Array.isArray(params)) expect(params).not.toContain(B);
    }
  });

  it('list cannot read B invites — every query is scoped to A', async () => {
    eligible();
    await listInvites(get('/api/invites/list?memberId=' + B));
    expect(mockQuery).toHaveBeenCalled();
    for (const [, params] of mockQuery.mock.calls) {
      if (Array.isArray(params)) {
        expect(params).not.toContain(B);
        expect(params).toContain(A);
      }
    }
  });

  it('revoke cannot revoke B invite — ownership is compared against A', async () => {
    eligible();
    const res = await revokeInvite(post('/api/invites/revoke', { memberId: B, inviteId: 'inv-B' }));
    expect(res.status).toBe(403);
    expect(mockQuery.mock.calls.filter(([sql]) => /UPDATE invites/i.test(sql as string))).toHaveLength(0);
  });
});

describe('the authenticated issuer can still work', () => {
  beforeEach(() => mockGetMemberId.mockResolvedValue(A));

  it('create succeeds when A is eligible', async () => {
    eligible();
    const res = await createInvite(post('/api/invites/create', { intendedName: 'Tester' }));
    expect(res.status).toBe(200);
    expect(mockQuery.mock.calls.some(([sql]) => /INSERT INTO invites/i.test(sql as string))).toBe(true);
  });

  it('revoke succeeds on A own pending invite', async () => {
    mockQuery.mockImplementation((sql: string) => {
      if (/FROM invites\b/i.test(sql) && /created_by/i.test(sql)) {
        return Promise.resolve({ rows: [{ id: 'inv-A', passkey: 'SOULLAB-Y', status: 'pending', created_by: A }], rowCount: 1 });
      }
      return Promise.resolve({ rows: [], rowCount: 1 });
    });
    const res = await revokeInvite(post('/api/invites/revoke', { inviteId: 'inv-A' }));
    expect(res.status).toBe(200);
  });
});

describe('the boundary is declared, not inherited', () => {
  it.each(['/api/invites/create', '/api/invites/list', '/api/invites/revoke'])(
    '%s is mapped in the access matrix', (path) => {
      const rule = matchRule(path);
      expect(rule).not.toBeNull();
      expect(rule?.minTier).toBe('free');
    },
  );

  it('no invite route reads an identity from the request payload', () => {
    const { readFileSync } = require('fs');
    for (const f of ['create', 'list', 'revoke']) {
      const src = readFileSync(`app/api/invites/${f}/route.ts`, 'utf8')
        .replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
      expect(src).toMatch(/getMemberIdFromRequest\(/);
      expect(src).not.toMatch(/searchParams\.get\('memberId'\)/);
      expect(src).not.toMatch(/\{\s*memberId\s*[,}]/);
    }
  });

  it('the client sends no member id to the invite API', () => {
    const { readFileSync } = require('fs');
    const src = readFileSync('components/invites/InviteManager.tsx', 'utf8');
    expect(src).not.toMatch(/invites\/list\?memberId=/);
    expect(src).not.toMatch(/JSON\.stringify\(\{\s*memberId/);
  });
});
