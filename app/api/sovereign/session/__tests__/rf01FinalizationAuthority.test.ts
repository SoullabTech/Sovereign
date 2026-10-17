/**
 * RF01 S0-A2 — real finalize HTTP handler, with fictional authorization and
 * finalizer service mock. Service/DB behavior has separate physical PG tests.
 */
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { NextRequest } from 'next/server';
import { SessionOwnershipRefusal } from '@/lib/sovereign/memberSessionOwnership';

const A = '11111111-1111-4111-8111-111111111111';
const B = '22222222-2222-4222-8222-222222222222';
const mockFinalize = jest.fn<(opts: any) => Promise<any>>();
jest.mock('@/lib/auth/getMemberFromRequest', () => ({
  getMemberIdFromRequest: async (r: NextRequest) =>
    r.cookies.get('maia_session')?.value === 'actor-a' ||
    r.headers.get('x-session-token') === 'actor-a' ? A : null,
  getMemberIdFromSessionToken: async (t: string) =>
    t === 'actor-a' ? A : t === 'actor-b' ? B : null,
}));
jest.mock('@/lib/sovereign/sessionFinalizer', () => ({
  finalizeSession: (opts: unknown) => mockFinalize(opts),
}));
import { POST } from '../finalize/route';

const req = (body: unknown, token = 'actor-a', cookie?: string) => new NextRequest(
  'https://soullab.life/api/sovereign/session/finalize',
  {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(token ? { 'x-session-token': token } : {}),
      ...(cookie ? { cookie: 'maia_session=' + cookie } : {}),
    },
    body: JSON.stringify(body),
  },
);

beforeEach(() => {
  mockFinalize.mockReset();
  mockFinalize.mockImplementation(async () => ({ ok: true, sanctuary: false, queued: false }));
});

describe('RF01 owned finalization HTTP gate', () => {
  it('refuses unauthenticated submission before invoking the service', async () => {
    const response = await POST(req({ memberId: B, sessionId: 'a', isSanctuary: false }, ''));
    expect(response.status).toBe(401);
    expect(mockFinalize).not.toHaveBeenCalled();
  });
  it('refuses a member-ID claim conflicting with the verified actor', async () => {
    const response = await POST(req({ memberId: B, sessionId: 'a', isSanctuary: false }));
    expect(response.status).toBe(403);
    expect(mockFinalize).not.toHaveBeenCalled();
  });
  it('refuses a missing session ID', async () => {
    const response = await POST(req({ isSanctuary: false }));
    expect(response.status).toBe(400);
    expect(mockFinalize).not.toHaveBeenCalled();
  });
  it('refuses implicit privacy posture', async () => {
    const response = await POST(req({ memberId: A, sessionId: 'a' }));
    expect(response.status).toBe(400);
    expect(mockFinalize).not.toHaveBeenCalled();
  });
  it('passes the verified actor to owned ordinary finalization', async () => {
    const response = await POST(req({ memberId: A, sessionId: 'a', isSanctuary: false }));
    expect(response.status).toBe(200);
    expect(mockFinalize).toHaveBeenCalledWith({
      memberId: A, sessionId: 'a', isSanctuary: false, endedAt: null,
    });
  });
  it('reports foreign sessions as a protected refusal', async () => {
    mockFinalize.mockImplementation(async () => {
      throw new SessionOwnershipRefusal('SESSION_NOT_OWNED');
    });
    const response = await POST(req({ memberId: A, sessionId: 'foreign', isSanctuary: false }));
    expect(response.status).toBe(409);
    expect((await response.json()).ok).toBe(false);
  });
  it('does not claim Sanctuary deletion succeeded when held', async () => {
    mockFinalize.mockImplementation(async () => ({
      ok: false, sanctuary: true, error: 'SANCTUARY_FINALIZATION_AWAITS_TURN_LEVEL_POLICY',
    }));
    const response = await POST(req({ memberId: A, sessionId: 'a', isSanctuary: true }));
    expect(response.status).toBe(409);
    expect((await response.json()).ok).toBe(false);
  });
  it('refuses two different valid web/native credentials', async () => {
    const response = await POST(req({ memberId: A, sessionId: 'a', isSanctuary: false },
      'actor-b', 'actor-a'));
    expect(response.status).toBe(403);
    expect(mockFinalize).not.toHaveBeenCalled();
  });
});
