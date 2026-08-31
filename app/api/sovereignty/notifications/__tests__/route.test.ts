/**
 * System notifications — operator-surface authorization.
 *
 * The defect: both handlers ran with no guard at all. GET exposed internal ops
 * state to anonymous callers, and POST was an unauthenticated GLOBAL write —
 * `{ markAllRead: true }` cleared every unread operator alert, letting anyone
 * silently suppress the sovereignty signal the monitor exists to raise.
 *
 * `system_notifications` has no member column, so this is deliberately NOT a
 * member-scoped surface (see the route header). The guard therefore proves an
 * OPERATOR boundary, not member ownership.
 *
 * `isAdminRequest` is intentionally NOT mocked: the credential contract is the
 * thing under test. Handlers are called DIRECTLY — middleware is not in the
 * path and contributes nothing to the security proof.
 */

jest.mock('@/lib/db/postgres', () => ({
  __esModule: true,
  default: { query: jest.fn() },
}));

import { GET, POST } from '../route';
import db from '@/lib/db/postgres';

const mockQuery = (db as unknown as { query: jest.Mock }).query;

const PASSWORD = 'correct-horse-battery-staple';
const URL_BASE = 'https://soullab.life/api/sovereignty/notifications';

/**
 * Request stub that RECORDS every header name the code consults, so we can
 * prove which authorization inputs are — and are not — trusted.
 */
function req(headers: Record<string, string> = {}, opts: { url?: string; body?: unknown } = {}) {
  const asked: string[] = [];
  const lower = Object.fromEntries(
    Object.entries(headers).map(([k, v]) => [k.toLowerCase(), v]),
  );
  return {
    url: opts.url ?? URL_BASE,
    headers: {
      get: (name: string) => {
        asked.push(name.toLowerCase());
        return lower[name.toLowerCase()] ?? null;
      },
    },
    json: async () => opts.body ?? {},
    __asked: asked,
  } as never;
}

const asked = (r: unknown) => (r as unknown as { __asked: string[] }).__asked;

const ORIGINAL_PASSWORD = process.env.LABTOOLS_ADMIN_PASSWORD;

beforeEach(() => {
  jest.clearAllMocks();
  process.env.LABTOOLS_ADMIN_PASSWORD = PASSWORD;
  mockQuery.mockResolvedValue({ rows: [] });
});

afterAll(() => {
  if (ORIGINAL_PASSWORD === undefined) delete process.env.LABTOOLS_ADMIN_PASSWORD;
  else process.env.LABTOOLS_ADMIN_PASSWORD = ORIGINAL_PASSWORD;
});

describe('unauthenticated callers are refused', () => {
  it('1. GET with no credential returns 401', async () => {
    const res = await GET(req());
    expect(res.status).toBe(401);
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it('2. POST with no credential returns 401', async () => {
    const res = await POST(req({}, { body: { markAllRead: true } }));
    expect(res.status).toBe(401);
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it('GET leaks no rows in the refusal body', async () => {
    const res = await GET(req());
    expect(await res.json()).toMatchObject({ notifications: [] });
  });
});

describe('3. incorrect credentials are refused', () => {
  it('a wrong x-admin-password fails', async () => {
    const res = await GET(req({ 'x-admin-password': 'wrong' }));
    expect(res.status).toBe(401);
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it('a wrong bearer token fails', async () => {
    const res = await POST(
      req({ authorization: 'Bearer wrong' }, { body: { markAllRead: true } }),
    );
    expect(res.status).toBe(401);
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it('an empty credential does not pass', async () => {
    const res = await GET(req({ 'x-admin-password': '' }));
    expect(res.status).toBe(401);
  });

  it('fails CLOSED when LABTOOLS_ADMIN_PASSWORD is unset, even with a header', async () => {
    delete process.env.LABTOOLS_ADMIN_PASSWORD;
    const getRes = await GET(req({ 'x-admin-password': 'anything' }));
    const postRes = await POST(
      req({ 'x-admin-password': 'anything' }, { body: { markAllRead: true } }),
    );
    expect(getRes.status).toBe(401);
    expect(postRes.status).toBe(401);
    expect(mockQuery).not.toHaveBeenCalled();
  });
});

describe('4. valid admin credentials permit GET', () => {
  it('returns rows via x-admin-password', async () => {
    mockQuery.mockResolvedValue({ rows: [{ id: 'n1', type: 'tts_sovereignty_alert' }] });
    const res = await GET(req({ 'x-admin-password': PASSWORD }));
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ count: 1 });
  });

  it('the Bearer form is accepted too', async () => {
    const res = await GET(req({ authorization: `Bearer ${PASSWORD}` }));
    expect(res.status).toBe(200);
    expect(mockQuery).toHaveBeenCalled();
  });

  it('query filters still apply once authorized', async () => {
    await GET(
      req({ 'x-admin-password': PASSWORD }, { url: `${URL_BASE}?type=tts_sovereignty_alert` }),
    );
    const [sql, params] = mockQuery.mock.calls[0];
    expect(String(sql)).toMatch(/FROM system_notifications/);
    expect(params).toContain('tts_sovereignty_alert');
  });
});

describe('5. valid admin credentials permit markAllRead', () => {
  it('the global update runs only for an authorized caller', async () => {
    const res = await POST(
      req({ 'x-admin-password': PASSWORD }, { body: { markAllRead: true } }),
    );
    expect(res.status).toBe(200);
    expect(String(mockQuery.mock.calls[0][0])).toMatch(
      /UPDATE system_notifications SET read = TRUE/,
    );
  });

  it('marking a single notification read is permitted', async () => {
    const res = await POST(
      req({ 'x-admin-password': PASSWORD }, { body: { id: 'n1' } }),
    );
    expect(res.status).toBe(200);
    expect(mockQuery.mock.calls[0][1]).toEqual(['n1']);
  });

  it('an authorized request with no action is a 400, not a silent write', async () => {
    const res = await POST(req({ 'x-admin-password': PASSWORD }, { body: {} }));
    expect(res.status).toBe(400);
    expect(mockQuery).not.toHaveBeenCalled();
  });
});

describe('6. no member-identity or role path is consulted', () => {
  const FORBIDDEN = ['x-member-id', 'x-maia-roles', 'x-maia-tier', 'maia_member_id'];

  it('GET never reads a member-id or role header', async () => {
    const r = req({
      'x-admin-password': PASSWORD,
      'x-member-id': 'member-123',
      'x-maia-roles': 'admin,founder',
      'x-maia-tier': 'founder',
    });
    await GET(r);
    for (const header of FORBIDDEN) expect(asked(r)).not.toContain(header);
  });

  it('POST never reads a member-id or role header', async () => {
    const r = req(
      {
        'x-admin-password': PASSWORD,
        'x-member-id': 'member-123',
        'x-maia-roles': 'admin,founder',
      },
      { body: { markAllRead: true } },
    );
    await POST(r);
    for (const header of FORBIDDEN) expect(asked(r)).not.toContain(header);
  });

  it('a spoofed role header alone does NOT authorize — it is not an auth input', async () => {
    const getRes = await GET(
      req({ 'x-maia-roles': 'admin,founder', 'x-maia-tier': 'founder', 'x-member-id': 'm1' }),
    );
    const postRes = await POST(
      req(
        { 'x-maia-roles': 'admin,founder', 'x-member-id': 'm1' },
        { body: { markAllRead: true } },
      ),
    );
    expect(getRes.status).toBe(401);
    expect(postRes.status).toBe(401);
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it('no SQL is scoped to a member — this surface is not member-owned', async () => {
    await GET(req({ 'x-admin-password': PASSWORD }));
    await POST(req({ 'x-admin-password': PASSWORD }, { body: { markAllRead: true } }));
    for (const call of mockQuery.mock.calls) {
      expect(String(call[0])).not.toMatch(/member_id|user_id/i);
    }
  });
});

describe('structural — the guard cannot be quietly dropped', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const src: string = require('fs').readFileSync(
    require('path').join(__dirname, '../route.ts'),
    'utf8',
  );

  it('both handlers gate on isAdminRequest', () => {
    expect(src.match(/isAdminRequest\(request\)/g) ?? []).toHaveLength(2);
  });

  it('authorization is not delegated to middleware role headers', () => {
    // These header names DO appear in the file — but only as prose explaining
    // why they are not trusted. Strip comments: what matters is that no role
    // or member header is ever READ.
    const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
    expect(code).not.toMatch(/x-maia-roles|x-maia-tier|x-member-id/i);
  });
});
