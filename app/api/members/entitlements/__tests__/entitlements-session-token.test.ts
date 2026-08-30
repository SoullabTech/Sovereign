/**
 * ENTITLEMENTS AUTH CONTRACT — COMPANION-01A step 2.
 *
 * THE GAP. MAIA Desktop authenticates with `x-session-token`, the canonical
 * credential the Safari/iOS path already uses when cookies are blocked. 259 API
 * routes accept it via `getMemberIdFromRequest`. This route did not — it read
 * cookies only, through `getCurrentSession()`.
 *
 * It was the single server gap in the Companion's first slice, and House
 * depends on it: capability-computed navigation reads entitlements, so a
 * Desktop that could not read them would have to hardcode which doors exist or
 * mint a Desktop-only identity route. Both are forbidden by the ruling.
 *
 * WHAT THESE PROVE. That the header is a second TRANSPORT, not a second way to
 * be someone: the cookie path is untouched and still runs first, a token is
 * validated against auth_sessions by the canonical resolver, and a bare
 * `x-member-id` assertion still resolves nobody.
 */
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

const mockGetCurrentSession = jest.fn<() => Promise<{ memberId: string } | null>>();
const mockFromToken = jest.fn<(t: string | null | undefined) => Promise<string | null>>();
const mockResolve = jest.fn<(id: string) => Promise<Set<string>>>();

jest.mock('@/lib/auth/serverSessions', () => ({
  getCurrentSession: () => mockGetCurrentSession(),
}));
jest.mock('@/lib/auth/getMemberFromRequest', () => ({
  getMemberIdFromSessionToken: (t: string | null | undefined) => mockFromToken(t),
}));
jest.mock('@/lib/auth/entitlements', () => ({
  resolveEntitlements: (id: string) => mockResolve(id),
}));

const MEMBER = 'ce284751-e457-42f6-89b6-bc07d0876682';
const ENTS = new Set(['labs.preview']);

/** Minimal NextRequest stand-in: the route reads exactly one header. */
function req(headers: Record<string, string> = {}) {
  return {
    headers: { get: (k: string) => headers[k.toLowerCase()] ?? null },
  } as unknown as import('next/server').NextRequest;
}

async function callGet(r: ReturnType<typeof req>) {
  const { GET } = await import('../route');
  return GET(r);
}

describe('entitlements auth contract', () => {
  beforeEach(() => {
    jest.resetModules();
    mockGetCurrentSession.mockReset();
    mockFromToken.mockReset();
    mockResolve.mockReset();
    mockResolve.mockResolvedValue(ENTS);
  });

  it('cookie session still resolves — unchanged behaviour', async () => {
    mockGetCurrentSession.mockResolvedValue({ memberId: MEMBER });
    const res = await callGet(req());
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ entitlements: ['labs.preview'] });
    expect(mockResolve).toHaveBeenCalledWith(MEMBER);
  });

  it('cookie session takes precedence — the token path is not even consulted', async () => {
    mockGetCurrentSession.mockResolvedValue({ memberId: MEMBER });
    await callGet(req({ 'x-session-token': 'some-other-token' }));
    expect(mockFromToken).not.toHaveBeenCalled();
  });

  it('x-session-token resolves the SAME member and the same entitlements', async () => {
    mockGetCurrentSession.mockResolvedValue(null);
    mockFromToken.mockResolvedValue(MEMBER);
    const res = await callGet(req({ 'x-session-token': 'valid-token' }));
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ entitlements: ['labs.preview'] });
    expect(mockFromToken).toHaveBeenCalledWith('valid-token');
    expect(mockResolve).toHaveBeenCalledWith(MEMBER);
  });

  it('an invalid token is unauthorized', async () => {
    mockGetCurrentSession.mockResolvedValue(null);
    mockFromToken.mockResolvedValue(null);
    const res = await callGet(req({ 'x-session-token': 'revoked-or-expired' }));
    expect(res.status).toBe(401);
    expect(mockResolve).not.toHaveBeenCalled();
  });

  it('no credential at all is unauthorized — existing behaviour', async () => {
    mockGetCurrentSession.mockResolvedValue(null);
    mockFromToken.mockResolvedValue(null);
    const res = await callGet(req());
    expect(res.status).toBe(401);
  });

  it('a bare x-member-id assertion resolves nobody', async () => {
    // ⛔ The forbidden shortcut. An identity claim is not a credential; only a
    // token validated against auth_sessions resolves a member.
    mockGetCurrentSession.mockResolvedValue(null);
    mockFromToken.mockResolvedValue(null);
    const res = await callGet(req({ 'x-member-id': MEMBER }));
    expect(res.status).toBe(401);
    expect(mockFromToken).toHaveBeenCalledWith(null);
    expect(mockResolve).not.toHaveBeenCalled();
  });
});
