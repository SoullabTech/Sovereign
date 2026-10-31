/**
 * Profile consent contracts: actual matrix/proxy/handlers and identity-claim
 * checks; session resolution, PostgreSQL and youth policy are mocked here.
 * These are not physical PostgreSQL or browser acceptance receipts.
 */
import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { query } from '@/lib/db/postgres';
import { resolveSessionCredentialAuthority } from '@/lib/auth/sessionCredentialAuthority';
import { checkYouthAdmission } from '@/lib/youth/youthAdmissionGate';
import { matchRule } from '@/config/accessMatrix';
import { proxy } from '@/proxy';
import { GET, PUT } from '../profile/route';

jest.mock('next/headers', () => ({ cookies: jest.fn() }));
jest.mock('@/lib/db/postgres', () => ({ query: jest.fn() }));
jest.mock('@/lib/auth/sessionCredentialAuthority', () => ({ resolveSessionCredentialAuthority: jest.fn() }));
jest.mock('@/lib/youth/youthAdmissionGate', () => ({ checkYouthAdmission: jest.fn() }));
jest.mock('@/lib/writersStudio/admissionServer', () => ({
  writerStudioAdmissionForMember: jest.fn(async () => ({ allowed: false, code: 'FICTIONAL_NOT_INVITED' })),
}));

const cookieStore = cookies as jest.Mock;
const database = query as jest.Mock;
const resolveAuthority = resolveSessionCredentialAuthority as jest.Mock;
const youthAdmission = checkYouthAdmission as jest.Mock;
const ALICE = '22222222-2222-4222-8222-222222222222';
const BOB = '33333333-3333-4333-8333-333333333333';
const PATH = '/api/members/profile';
const aliceRow = {
  id: ALICE, username: 'fictional_alice', name: 'Fictional Alice',
  email: 'alice@example.invalid', astrology_consent: 'declined',
};

function request(options: {
  method?: string;
  body?: unknown;
  raw?: string;
  headers?: Record<string, string>;
  pathname?: string;
} = {}) {
  const method = options.method ?? 'PUT';
  const req = new NextRequest(`https://writer.invalid${options.pathname ?? PATH}`, {
    method,
    headers: {
      origin: 'https://writer.invalid',
      'sec-fetch-site': 'same-origin',
      'content-type': 'application/json',
      cookie: 'maia_session=fictional-alice-session',
      ...options.headers,
    },
    ...(method === 'GET' || method === 'HEAD' ? {} : {
      body: options.raw ?? JSON.stringify(options.body === undefined
        ? { astrologyConsent: 'declined' } : options.body),
    }),
  });
  cookieStore.mockResolvedValue(req.cookies);
  return req;
}

describe('exact protected profile route admission', () => {
  const oldMode = process.env.ACCESS_CONTROL_MODE;
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.ACCESS_CONTROL_MODE = 'strict';
    resolveAuthority.mockResolvedValue({ ok: true, memberId: ALICE, tier: 'free', roles: ['member'] });
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });
  afterEach(() => {
    if (oldMode === undefined) delete process.env.ACCESS_CONTROL_MODE;
    else process.env.ACCESS_CONTROL_MODE = oldMode;
    jest.restoreAllMocks();
  });

  it.each(['GET', 'PUT'])('admits authenticated %s using only verified identity', async (method) => {
    expect(matchRule(PATH)).toMatchObject({ exact: PATH, minTier: 'free', methods: ['GET', 'PUT'] });
    expect(matchRule(PATH)).not.toHaveProperty('public', true);
    const response = await proxy(request({ method, headers: {
      'x-access-authed': 'true', 'x-access-member-id': BOB,
      'x-access-tier': 'pro', 'x-access-roles': 'admin',
    } }));
    expect(response.headers.get('x-middleware-next')).toBe('1');
    expect(response.headers.get('x-middleware-request-x-access-member-id')).toBe(ALICE);
    expect(response.headers.get('x-middleware-request-x-access-tier')).toBe('free');
    expect(response.headers.get('x-middleware-request-x-access-roles')).toBe('member');
  });

  it.each(['GET', 'PUT'])('refuses anonymous %s despite a bare member claim', async (method) => {
    resolveAuthority.mockResolvedValue({ ok: false, reason: 'no_credential' });
    const response = await proxy(request({ method, headers: { cookie: '', 'x-member-id': ALICE } }));
    expect(response.status).toBe(401);
    expect(response.headers.get('x-middleware-next')).toBeNull();
  });

  it.each(['HEAD', 'POST', 'PATCH', 'DELETE', 'OPTIONS'])('refuses unlisted %s before authority lookup', async (method) => {
    const response = await proxy(request({ method }));
    expect(response.status).toBe(405);
    expect(response.headers.get('allow')).toBe('GET, PUT');
    expect(resolveAuthority).not.toHaveBeenCalled();
  });

  it.each([`${PATH}-extra`, `${PATH}/child`])('keeps neighboring path %s unmapped', async (pathname) => {
    expect(matchRule(pathname)).toBeNull();
    expect((await proxy(request({ pathname }))).status).toBe(404);
  });
});

describe('session-owned profile consent handlers', () => {
  const oldCapacitor = process.env.CAPACITOR_BUILD;
  const oldOrigins = process.env.AUTH_ALLOWED_ORIGINS;
  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.CAPACITOR_BUILD;
    delete process.env.AUTH_ALLOWED_ORIGINS;
    resolveAuthority.mockResolvedValue({ ok: true, memberId: ALICE, tier: 'free', roles: ['member'] });
    database.mockResolvedValue({ rows: [{ ...aliceRow }], rowCount: 1 });
    youthAdmission.mockReturnValue({ ok: true });
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });
  afterEach(() => {
    if (oldCapacitor === undefined) delete process.env.CAPACITOR_BUILD;
    else process.env.CAPACITOR_BUILD = oldCapacitor;
    if (oldOrigins === undefined) delete process.env.AUTH_ALLOWED_ORIGINS;
    else process.env.AUTH_ALLOWED_ORIGINS = oldOrigins;
    jest.restoreAllMocks();
  });

  it('reads Alice through her verified session despite a Bob query claim', async () => {
    const response = await GET(request({ method: 'GET', pathname: `${PATH}?memberId=${BOB}` }));
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ id: ALICE, astrologyConsent: 'declined' });
    expect(database).toHaveBeenCalledWith(expect.stringContaining('WHERE m.id = $1'), [ALICE]);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
  });

  it.each([ALICE, BOB])('updates only the verified member %s and confirms the returned row', async (memberId) => {
    resolveAuthority.mockResolvedValue({ ok: true, memberId, tier: 'free', roles: ['member'] });
    database.mockResolvedValue({ rows: [{ ...aliceRow, id: memberId }], rowCount: 1 });
    const response = await PUT(request());
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ success: true, profile: { id: memberId, astrology_consent: 'declined' } });
    expect(database).toHaveBeenCalledWith(expect.stringMatching(/WHERE id = \$1\s+RETURNING/), [memberId, 'declined']);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
  });

  it('accepts an agreeing compatibility claim without using it as authority', async () => {
    expect((await PUT(request({ body: { memberId: ALICE, astrologyConsent: 'declined' } }))).status).toBe(200);
    expect(database.mock.calls[0][1][0]).toBe(ALICE);
  });

  it.each(['memberId', 'id'])('refuses a foreign body %s before database work', async (key) => {
    const response = await PUT(request({ body: { [key]: BOB, astrologyConsent: 'declined' } }));
    expect(response.status).toBe(403);
    expect(database).not.toHaveBeenCalled();
  });

  it.each(['x-member-id', 'x-maia-member-id'])('preserves direct-handler refusal of conflicting %s', async (header) => {
    const response = await PUT(request({ headers: { [header]: BOB } }));
    expect(response.status).toBe(401);
    expect(database).not.toHaveBeenCalled();
  });

  it('preserves refusal of a conflicting compatibility identity cookie', async () => {
    const response = await PUT(request({ headers: { cookie: `maia_session=fictional-alice-session; maia_member_id=${BOB}` } }));
    expect(response.status).toBe(401);
    expect(database).not.toHaveBeenCalled();
  });

  it.each(['no_credential', 'invalid_session', 'credential_conflict'])('refuses denied session resolution %s', async (reason) => {
    resolveAuthority.mockResolvedValue({ ok: false, reason });
    const response = await PUT(request({ headers: { 'x-session-token': 'fictional-other-session' } }));
    expect(response.status).toBe(401);
    expect(database).not.toHaveBeenCalled();
  });

  it('refuses cross-origin mutation before credential or database work', async () => {
    const response = await PUT(request({ headers: { origin: 'https://foreign.invalid', 'sec-fetch-site': 'cross-site' } }));
    expect(response.status).toBe(403);
    expect(resolveAuthority).not.toHaveBeenCalled();
    expect(database).not.toHaveBeenCalled();
    expect(response.headers.get('cache-control')).toBe('private, no-store');
  });

  it.each([null, [], 'not an object', 7])('refuses non-object input %j', async (body) => {
    expect((await PUT(request({ body }))).status).toBe(400);
    expect(database).not.toHaveBeenCalled();
  });

  it('refuses malformed JSON', async () => {
    expect((await PUT(request({ raw: '{broken' }))).status).toBe(400);
    expect(database).not.toHaveBeenCalled();
  });

  it.each([null, 7, {}, ['declined'], 'other'])('refuses invalid consent %j', async (astrologyConsent) => {
    expect((await PUT(request({ body: { astrologyConsent } }))).status).toBe(400);
    expect(database).not.toHaveBeenCalled();
  });

  it('refuses email-identity replacement without a verified change flow', async () => {
    const response = await PUT(request({ body: { email: 'bob@example.invalid', astrologyConsent: 'declined' } }));
    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ code: 'EMAIL_CHANGE_REQUIRES_VERIFICATION' });
    expect(database).not.toHaveBeenCalled();
  });

  it('retains the youth admission refusal before any birth or consent update', async () => {
    youthAdmission.mockReturnValue({ ok: false, status: 403, code: 'FICTIONAL_YOUTH_REFUSED', error: 'Youth admission required' });
    const response = await PUT(request({ body: { birthData: { date: '2015-01-01' }, astrologyConsent: 'opted_in' } }));
    expect(youthAdmission).toHaveBeenCalledWith('2015-01-01');
    expect(response.status).toBe(403);
    expect(await response.json()).toMatchObject({ code: 'FICTIONAL_YOUTH_REFUSED' });
    expect(database).not.toHaveBeenCalled();
  });

  it('keeps birth data and explicit opt-in in one parameterized member update', async () => {
    database.mockResolvedValue({ rows: [{ ...aliceRow, astrology_consent: 'opted_in' }], rowCount: 1 });
    const response = await PUT(request({ body: {
      birthData: { date: '1990-01-01', time: '12:00', location: { lat: 1, lng: 2, name: 'Fictional Place', timezone: 'Etc/UTC' } },
      astrologyConsent: 'opted_in',
    } }));
    expect(response.status).toBe(200);
    expect(database).toHaveBeenCalledTimes(1);
    expect(database.mock.calls[0][1]).toEqual([ALICE, '1990-01-01', '12:00', 1, 2, 'Fictional Place', 'Etc/UTC', 'opted_in']);
  });

  it('preserves explicit null birth-date clearing under the existing youth policy', async () => {
    const response = await PUT(request({ body: {
      birthData: { date: null }, astrologyConsent: 'declined',
    } }));
    expect(youthAdmission).toHaveBeenCalledWith(null);
    expect(response.status).toBe(200);
    expect(database.mock.calls[0][1]).toEqual([ALICE, null, 'declined']);
  });

  it('delegates numeric birth-date refusal to the existing youth policy', async () => {
    youthAdmission.mockReturnValue({ ok: false, status: 400, code: 'FICTIONAL_INVALID_BIRTH_DATE', error: 'Invalid birth date' });
    const response = await PUT(request({ body: {
      birthData: { date: 42 }, astrologyConsent: 'opted_in',
    } }));
    expect(youthAdmission).toHaveBeenCalledWith(42);
    expect(response.status).toBe(400);
    expect(database).not.toHaveBeenCalled();
  });

  it.each([{ birthData: [] }, { birthData: 'bad' }, { birthData: { location: [] } }])('refuses malformed birth shape %j', async (body) => {
    expect((await PUT(request({ body: { ...body, astrologyConsent: 'opted_in' } }))).status).toBe(400);
    expect(database).not.toHaveBeenCalled();
  });

  it('reports zero updated rows as 404, never success', async () => {
    database.mockResolvedValue({ rows: [], rowCount: 0 });
    const response = await PUT(request());
    expect(response.status).toBe(404);
    expect(await response.json()).not.toHaveProperty('success', true);
  });

  it('reports database failure as 503, never success', async () => {
    database.mockRejectedValue(new Error('fictional connection refused'));
    const response = await PUT(request());
    expect(response.status).toBe(503);
    expect(response.headers.get('retry-after')).toBe('5');
    expect(await response.json()).not.toHaveProperty('success', true);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
  });

  it('reports unavailable session verification without attempting a write', async () => {
    resolveAuthority.mockRejectedValue(new Error('fictional authority unavailable'));
    const response = await PUT(request());
    expect(response.status).toBe(503);
    expect(database).not.toHaveBeenCalled();
  });
});
