/**
 * Authorization tests for POST /api/members/password.
 *
 * Defect (fixed): the route took `memberId` from the request body and wrote
 * `UPDATE members SET password_hash = ... WHERE id = <body memberId>` with no
 * authentication of any kind, so any caller could set any member's password.
 *
 * The member is now derived from the verified session. These tests lock that
 * in: the cases marked "TAKEOVER" are the ones that previously FALSE-PASSED.
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import type { NextRequest } from 'next/server';
import { existsSync } from 'node:fs';
import path from 'node:path';

const SESSION_MEMBER = '11111111-1111-4111-8111-111111111111';
const VICTIM_MEMBER = '22222222-2222-4222-8222-222222222222';

// --- Mocks (registered before the route is imported) ---
const mockGetMemberIdFromRequest =
  jest.fn<(request: NextRequest) => Promise<string | null>>();
jest.mock('@/lib/auth/getMemberFromRequest', () => ({
  __esModule: true,
  getMemberIdFromRequest: (request: NextRequest) =>
    mockGetMemberIdFromRequest(request),
}));

const mockQuery =
  jest.fn<(sql: string, params?: unknown[]) => Promise<{ rows: unknown[] }>>();
jest.mock('@/lib/db/postgres', () => ({
  __esModule: true,
  default: { query: (sql: string, params?: unknown[]) => mockQuery(sql, params) },
  query: (sql: string, params?: unknown[]) => mockQuery(sql, params),
}));

jest.mock('@/lib/auth/passwordUtils', () => ({
  __esModule: true,
  hashPassword: async (pw: string) => `hashed:${pw}`,
}));

import { POST } from '../route';

function reqWith(body: unknown): NextRequest {
  return {
    json: async () => body,
    headers: new Headers(),
  } as unknown as NextRequest;
}

/** Every UPDATE issued against members, with its bound params. */
function memberUpdates() {
  return mockQuery.mock.calls.filter(
    ([sql]) => typeof sql === 'string' && /UPDATE\s+members/i.test(sql),
  );
}

beforeEach(() => {
  mockGetMemberIdFromRequest.mockReset();
  mockQuery.mockReset();
  mockQuery.mockResolvedValue({ rows: [{ id: SESSION_MEMBER }] });
});

describe('POST /api/members/password — authorization', () => {
  it('TAKEOVER: an unauthenticated caller is rejected and writes nothing', async () => {
    mockGetMemberIdFromRequest.mockResolvedValue(null);

    const res = await POST(
      reqWith({ memberId: VICTIM_MEMBER, newPassword: 'newpassword123' }),
    );

    expect(res.status).toBe(401);
    expect(memberUpdates()).toHaveLength(0);
  });

  it('TAKEOVER: member A cannot change member B\'s password', async () => {
    mockGetMemberIdFromRequest.mockResolvedValue(SESSION_MEMBER);

    const res = await POST(
      reqWith({ memberId: VICTIM_MEMBER, newPassword: 'newpassword123' }),
    );

    expect(res.status).toBe(403);
    expect(memberUpdates()).toHaveLength(0);
  });

  it('never binds a body-supplied member id to the UPDATE', async () => {
    mockGetMemberIdFromRequest.mockResolvedValue(SESSION_MEMBER);

    await POST(reqWith({ newPassword: 'newpassword123' }));

    const updates = memberUpdates();
    expect(updates).toHaveLength(1);
    const params = updates[0][1] as unknown[];
    expect(params).toContain(SESSION_MEMBER);
    expect(params).not.toContain(VICTIM_MEMBER);
  });

  it('allows the authenticated member to change their own password', async () => {
    mockGetMemberIdFromRequest.mockResolvedValue(SESSION_MEMBER);

    const res = await POST(reqWith({ newPassword: 'newpassword123' }));

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ success: true });
    expect(memberUpdates()).toHaveLength(1);
  });

  it('allows a body member id that matches the session (existing client behavior)', async () => {
    mockGetMemberIdFromRequest.mockResolvedValue(SESSION_MEMBER);

    const res = await POST(
      reqWith({ memberId: SESSION_MEMBER, newPassword: 'newpassword123' }),
    );

    expect(res.status).toBe(200);
    expect(memberUpdates()).toHaveLength(1);
  });

  it('still enforces the minimum password length for an authenticated member', async () => {
    mockGetMemberIdFromRequest.mockResolvedValue(SESSION_MEMBER);

    const res = await POST(reqWith({ newPassword: 'short' }));

    expect(res.status).toBe(400);
    expect(memberUpdates()).toHaveLength(0);
  });

  it('rejects a missing password without writing', async () => {
    mockGetMemberIdFromRequest.mockResolvedValue(SESSION_MEMBER);

    const res = await POST(reqWith({}));

    expect(res.status).toBe(400);
    expect(memberUpdates()).toHaveLength(0);
  });
});

/**
 * `/api/members/set-password` accepted `{ email, newPassword }` and replaced the
 * password of whoever owned that email, with no authentication and no token. It
 * had no callers. It was removed rather than gated: there is no legitimate
 * caller to preserve, and the token-verified flow at
 * `/api/members/reset-password` already covers forgotten passwords.
 *
 * The App Router resolves routes from the filesystem, so the absence of the
 * route module IS the proof that the endpoint is neither routable nor
 * executable. This test fails if anyone reintroduces the file.
 */
describe('POST /api/members/set-password — removed', () => {
  const routeDir = path.join(__dirname, '..', '..', 'set-password');

  it('the unauthenticated set-password route is not routable', () => {
    expect(existsSync(routeDir)).toBe(false);
    for (const ext of ['ts', 'tsx', 'js', 'jsx']) {
      expect(existsSync(path.join(routeDir, `route.${ext}`))).toBe(false);
    }
  });

  it('the route module cannot be imported', async () => {
    await expect(import('../../set-password/route')).rejects.toThrow();
  });
});
