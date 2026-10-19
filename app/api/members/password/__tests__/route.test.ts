/** C0 fictional-account tests: session-only credential changes MUST fail closed. */
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import type { NextRequest } from 'next/server';
import { existsSync } from 'node:fs';
import path from 'node:path';

const SESSION_MEMBER = '11111111-1111-4111-8111-111111111111';
const VICTIM_MEMBER = '22222222-2222-4222-8222-222222222222';

const mockGetMemberIdFromRequest =
  jest.fn<(request: NextRequest) => Promise<string | null>>();
jest.mock('@/lib/auth/getMemberFromRequest', () => ({
  __esModule: true,
  getMemberIdFromRequest: (req: NextRequest) => mockGetMemberIdFromRequest(req),
}));

const mockQuery = jest.fn();
jest.mock('@/lib/db/postgres', () => ({
  __esModule: true,
  query: (...args: unknown[]) => mockQuery(...args),
}));

import { POST } from '../route';

function reqWith(body: unknown, headerToken?: string): NextRequest {
  const headers = new Headers();
  if (headerToken) headers.set('x-session-token', headerToken);
  return {
    json: async () => body,
    headers,
  } as unknown as NextRequest;
}
beforeEach(() => {
  mockGetMemberIdFromRequest.mockReset();
  mockQuery.mockReset();
});

describe('POST /api/members/password — C0 refusal', () => {
  it('refuses unauthenticated requests with no account write', async () => {
    mockGetMemberIdFromRequest.mockResolvedValue(null);
    const response = await POST(reqWith({ memberId: VICTIM_MEMBER, newPassword: 'fictional-strong-password' }));
    expect(response.status).toBe(401);
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it('does not allow a valid session to set its own password without fresh authority', async () => {
    mockGetMemberIdFromRequest.mockResolvedValue(SESSION_MEMBER);
    const response = await POST(reqWith({ memberId: SESSION_MEMBER, newPassword: 'fictional-strong-password' }));
    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toMatchObject({
      code: 'PASSWORD_SETUP_REQUIRES_REVERIFICATION',
    });
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it('cannot set another member password even with a valid session', async () => {
    mockGetMemberIdFromRequest.mockResolvedValue(SESSION_MEMBER);
    const response = await POST(reqWith({ memberId: VICTIM_MEMBER, newPassword: 'fictional-strong-password' }));
    expect(response.status).toBe(403);
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it('cannot bypass the refusal with short, absent, or malformed request content', async () => {
    mockGetMemberIdFromRequest.mockResolvedValue(SESSION_MEMBER);
    for (const body of [{ newPassword: 'short' }, {}, null, { newPassword: 1234 }]) {
      const response = await POST(reqWith(body));
      expect(response.status).toBe(403);
    }
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it('supports iOS credential transport without granting write authority', async () => {
    mockGetMemberIdFromRequest.mockResolvedValue(SESSION_MEMBER);
    const req = reqWith({ newPassword: 'fictional-strong-password' }, 'fictional-safari-session');
    const response = await POST(req);
    expect(mockGetMemberIdFromRequest).toHaveBeenCalledWith(req);
    expect(response.status).toBe(403);
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it('fails closed on session lookup failure', async () => {
    mockGetMemberIdFromRequest.mockRejectedValue(new Error('fictional session backend unavailable'));
    const response = await POST(reqWith({ newPassword: 'fictional-strong-password' }));
    expect(response.status).toBe(503);
    expect(mockQuery).not.toHaveBeenCalled();
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
