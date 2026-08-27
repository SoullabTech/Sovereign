/**
 * AUTH-BOUNDARY-04A — hostile proofs for /api/members/migrate-data.
 *
 * This route runs `UPDATE <table> SET user_id = $new WHERE user_id = $old`
 * across ~30 tables. It MOVES data; the source loses what the destination gains.
 * So the cases below check two different things and must not be conflated:
 *
 *   REFUSED  — the correct status code came back
 *   INERT    — no UPDATE was issued
 *
 * A route that returns 403 and still writes has passed the first and failed the
 * second. The `expectNoWrites()` helper asserts the second explicitly, because
 * the status code alone cannot.
 */
import { NextRequest } from 'next/server';

const CALLER = 'aaaaaaaa-0000-4000-8000-000000000001';
const VICTIM = 'bbbbbbbb-0000-4000-8000-000000000002';
const ANON_EXPLORER = 'explorer-local-9f3a';
const SESSION_CALLER = 'session-token-for-caller';

let cookieJar: Record<string, string> = {};

jest.mock('next/headers', () => ({
  cookies: async () => ({
    get: (n: string) => (cookieJar[n] ? { value: cookieJar[n] } : undefined),
  }),
  headers: async () => ({ get: () => null }),
}));

const queryMock = jest.fn(async (sql: string, params: unknown[] = []) => {
  if (/FROM auth_sessions/i.test(sql)) {
    return params[0] === SESSION_CALLER ? { rows: [{ member_id: CALLER }] } : { rows: [] };
  }
  // Member existence — CALLER and VICTIM are members; the explorer id is not.
  if (/SELECT id FROM members WHERE id/i.test(sql)) {
    const id = params[0];
    return { rows: id === CALLER || id === VICTIM ? [{ id }] : [] };
  }
  if (/information_schema.columns/i.test(sql)) return { rows: [{ column_name: 'user_id' }] };
  if (/SELECT COUNT\(\*\)/i.test(sql)) return { rows: [{ count: '7' }] };
  return { rows: [] };
});

jest.mock('@/lib/db/postgres', () => ({ query: (...a: unknown[]) => queryMock(...(a as [string, unknown[]])) }));

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { POST, GET } = require('../migrate-data/route');

const URL_BASE = 'https://soullab.life/api/members/migrate-data';

function post(body: unknown, headers: Record<string, string> = {}): NextRequest {
  return new NextRequest(URL_BASE, {
    method: 'POST',
    headers: { host: 'soullab.life', 'content-type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });
}

/** The invariant a status code cannot express: nothing was moved. */
function expectNoWrites() {
  const writes = queryMock.mock.calls.filter(([sql]) => /^\s*UPDATE\s/i.test(sql as string));
  expect(writes).toHaveLength(0);
}

beforeEach(() => {
  cookieJar = {};
  queryMock.mockClear();
});

describe('AUTH-BOUNDARY-04A · migrate-data POST', () => {
  it('refuses an unauthenticated caller, and moves nothing', async () => {
    // The removed primitive: no credential at all, both ids chosen by the caller.
    const res = await POST(post({ oldUserId: VICTIM, newUserId: ANON_EXPLORER }));
    expect(res.status).toBe(401);
    expectNoWrites();
  });

  it('refuses a verified caller migrating INTO someone else', async () => {
    // Destination is not the caller — this is the hand-my-data-to-a-third-party
    // direction, and it is closed even though the caller is genuine.
    cookieJar['maia_session'] = SESSION_CALLER;
    const res = await POST(post({ oldUserId: ANON_EXPLORER, newUserId: VICTIM }));
    expect(res.status).toBe(403);
    expectNoWrites();
  });

  it('refuses a verified caller draining ANOTHER MEMBER into themselves', async () => {
    // Destination is legitimately the caller; the source is a real person. This
    // is the case rule 2 alone would have let through, which is why rule 3 exists.
    cookieJar['maia_session'] = SESSION_CALLER;
    const res = await POST(post({ oldUserId: VICTIM, newUserId: CALLER }));
    expect(res.status).toBe(403);
    expectNoWrites();
  });

  it('refuses a forged x-member-id claiming to be the destination', async () => {
    // No session; the header names the caller. The resolver refuses to identify
    // anyone, so this dies at rule 1 rather than reaching the ownership rules.
    const res = await POST(post({ oldUserId: ANON_EXPLORER, newUserId: CALLER }, { 'x-member-id': CALLER }));
    expect(res.status).toBe(401);
    expectNoWrites();
  });

  it('allows the legitimate case: anonymous explorer data into the caller', async () => {
    // The capability this route exists for must survive the repair.
    cookieJar['maia_session'] = SESSION_CALLER;
    const res = await POST(post({ oldUserId: ANON_EXPLORER, newUserId: CALLER }));
    expect(res.status).toBe(200);
    const writes = queryMock.mock.calls.filter(([sql]) => /^\s*UPDATE\s/i.test(sql as string));
    expect(writes.length).toBeGreaterThan(0);
    // And it moved data TO the caller, FROM the explorer — never the reverse.
    for (const [, params] of writes) {
      expect((params as string[])[0]).toBe(CALLER);
      expect((params as string[])[1]).toBe(ANON_EXPLORER);
    }
  });
});

describe('AUTH-BOUNDARY-04A · migrate-data GET was a census oracle', () => {
  it('refuses an unauthenticated preview', async () => {
    const res = await GET(new NextRequest(`${URL_BASE}?oldUserId=${VICTIM}`, { headers: { host: 'soullab.life' } }));
    expect(res.status).toBe(401);
  });

  it('refuses a verified caller previewing another member’s row counts', async () => {
    // Row counts across ~30 tables are a disclosure in their own right.
    cookieJar['maia_session'] = SESSION_CALLER;
    const res = await GET(new NextRequest(`${URL_BASE}?oldUserId=${VICTIM}`, { headers: { host: 'soullab.life' } }));
    expect(res.status).toBe(403);
  });

  it('allows previewing an anonymous source', async () => {
    cookieJar['maia_session'] = SESSION_CALLER;
    const res = await GET(new NextRequest(`${URL_BASE}?oldUserId=${ANON_EXPLORER}`, { headers: { host: 'soullab.life' } }));
    expect(res.status).toBe(200);
  });

  it('allows previewing the caller’s own id', async () => {
    cookieJar['maia_session'] = SESSION_CALLER;
    const res = await GET(new NextRequest(`${URL_BASE}?oldUserId=${CALLER}`, { headers: { host: 'soullab.life' } }));
    expect(res.status).toBe(200);
  });
});
