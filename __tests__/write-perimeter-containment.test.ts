/**
 * Write-perimeter containment proofs (#721).
 *
 * The defect: /api/conversation/turns (GET + POST) and /api/voice/persist performed
 * NO authentication and took the durable-write / read subject from client input.
 * Confirmed against production 2026-07-24 — GET ?userId=<uuid> → 200, POST {} → 400.
 *
 * These are ROUTE-LEVEL behavioural proofs: the handlers are invoked directly with
 * the auth module mocked, and we assert on status codes and on what reaches the
 * store. They are deliberately NOT regex-over-source assertions — that weakness was
 * called out during the #697 merge gates, where 6 of 10 tests proved only that the
 * source text read correctly.
 *
 * The credential primitive itself (revoked / expired / mismatched-claim rejection in
 * `getMemberIdFromRequest`) is proved against a real database by
 * `scripts/proof-write-perimeter.ts`, not here — jest cannot reach `next/headers`.
 */

const MEMBER_A = '11111111-1111-4111-8111-111111111111';
const MEMBER_B = '22222222-2222-4222-8222-222222222222';

let authedMember: string | null = null;
const addExchange = jest.fn();

jest.mock('@/lib/auth/getMemberFromRequest', () => ({
  getMemberIdFromRequest: jest.fn(async () => authedMember),
}));
jest.mock('@/lib/memory/stores/TurnsStore', () => ({
  TurnsStore: { addExchange: (...a: unknown[]) => addExchange(...a) },
}));
jest.mock('@/lib/db/postgres', () => ({ query: jest.fn(async () => ({ rows: [] })) }));
jest.mock('@/lib/provenance/consentState', () => ({ recordConsentState: jest.fn() }));

import { GET, POST } from '@/app/api/conversation/turns/route';

const req = (url: string, body?: unknown) =>
  ({
    url,
    json: async () => body ?? {},
    headers: new Headers(),
    nextUrl: new URL(url),
  }) as unknown as import('next/server').NextRequest;

const VALID = { userMessage: 'u', assistantMessage: 'a' };

beforeEach(() => {
  authedMember = null;
  addExchange.mockClear();
});

describe('#721 — unauthenticated requests are refused before any write', () => {
  it('POST with a fully valid payload and no credential → 401, zero writes', async () => {
    const res = await POST(req('https://x/api/conversation/turns', { ...VALID, userId: MEMBER_A }));
    expect(res.status).toBe(401);
    expect(addExchange).not.toHaveBeenCalled();
  });

  it('GET with no credential → 401 (was 200 with any userId in production)', async () => {
    const res = await GET(req(`https://x/api/conversation/turns?userId=${MEMBER_A}`));
    expect(res.status).toBe(401);
  });
});

describe('#721 — the write subject is the authenticated member, never the body', () => {
  it('member A authenticated, body claims member B → rejected, never attributed to B', async () => {
    authedMember = MEMBER_A;
    const res = await POST(req('https://x/api/conversation/turns', { ...VALID, userId: MEMBER_B }));
    expect(res.status).toBe(403);
    expect(addExchange).not.toHaveBeenCalled();
  });

  it('GET: member A authenticated, query claims member B → 403, B is never read', async () => {
    authedMember = MEMBER_A;
    const res = await GET(req(`https://x/api/conversation/turns?userId=${MEMBER_B}`));
    expect(res.status).toBe(403);
  });

  it('authenticated write persists under the authenticated member only', async () => {
    authedMember = MEMBER_A;
    const res = await POST(req('https://x/api/conversation/turns', VALID));
    expect(res.status).toBe(200);
    expect(addExchange).toHaveBeenCalledTimes(1);
    // addExchange(posture, userId, sessionId, userMessage, assistantResponse, exchangeId)
    expect(addExchange.mock.calls[0][1]).toBe(MEMBER_A);
  });

  it('a body userId matching the authenticated member is accepted (claim agrees)', async () => {
    authedMember = MEMBER_A;
    const res = await POST(req('https://x/api/conversation/turns', { ...VALID, userId: MEMBER_A }));
    expect(res.status).toBe(200);
    expect(addExchange.mock.calls[0][1]).toBe(MEMBER_A);
  });
});

describe('#721 — containment did not disturb the constitutional invariants', () => {
  it('sanctuary posture still short-circuits before any write, for an authed member', async () => {
    authedMember = MEMBER_A;
    const res = await POST(req('https://x/api/conversation/turns', { ...VALID, isSanctuary: true }));
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ sanctuary: true });
    expect(addExchange).not.toHaveBeenCalled();
  });

  it('sanctuary is evaluated only AFTER authentication (no unauthenticated 200 path)', async () => {
    const res = await POST(req('https://x/api/conversation/turns', { ...VALID, isSanctuary: true }));
    expect(res.status).toBe(401);
  });

  it('#697 exchange identity is still minted and passed to the store', async () => {
    authedMember = MEMBER_A;
    await POST(req('https://x/api/conversation/turns', VALID));
    const exchangeId = addExchange.mock.calls[0][5];
    expect(typeof exchangeId).toBe('string');
    expect(exchangeId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  });

  it('posture is still argument 0 of addExchange (S1 store-boundary contract)', async () => {
    authedMember = MEMBER_A;
    await POST(req('https://x/api/conversation/turns', VALID));
    expect(addExchange.mock.calls[0][0]).toBeDefined();
    expect(addExchange.mock.calls[0][0].sanctuary).toBe(false);
  });
});
