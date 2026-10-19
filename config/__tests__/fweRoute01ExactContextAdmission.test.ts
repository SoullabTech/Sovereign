/**
 * FWE-ROUTE-01 · Class A / fictional strict ingress acceptance.
 *
 * Actual unchanged proxy(), shared access matrix, verifiedAccess, and
 * manuscript-context GET source. PostgreSQL results below are fictional
 * in-memory fixtures, not a live database, installed image or real member.
 *
 * The only runtime change under review is an exact member route declaration
 * in config/accessMatrix.ts. No broad Studio admission is permitted.
 */
import { afterAll, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { NextRequest } from 'next/server';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const A = '11111111-1111-4111-8111-111111111111';
const B = '22222222-2222-4222-8222-222222222222';
const MANUSCRIPT = '44444444-4444-4444-8444-444444444444';
const DRAFT = '55555555-5555-4555-8555-555555555555';
const SECTION = '66666666-6666-4666-8666-666666666666';
const TOKEN_A = 'FWE01_FICTIONAL_MEMBER_A_SESSION';
const TOKEN_B = 'FWE01_FICTIONAL_MEMBER_B_SESSION';
const TOKEN_REVOKED = 'FWE01_FICTIONAL_REVOKED_SESSION';
const TOKEN_EXPIRED = 'FWE01_FICTIONAL_EXPIRED_SESSION';
const TARGET = '/api/writers-studio/rebuild/context';

type SqlResult = { rows: Record<string, unknown>[] };
const mockQuery = jest.fn<(sql: string, params?: unknown[]) => Promise<SqlResult>>();
let mockCookieToken: string | null = null;

jest.mock('@/lib/db/postgres', () => ({
  __esModule: true,
  query: (sql: string, params?: unknown[]) => mockQuery(sql, params),
}));
jest.mock('next/headers', () => ({
  __esModule: true,
  cookies: async () => ({
    get: (name: string) =>
      name === 'maia_session' && mockCookieToken
        ? { name, value: mockCookieToken }
        : undefined,
  }),
}));

import { checkAccess, matchRule } from '../accessMatrix';
import { proxy } from '../../proxy';
import * as realContextRoute from '../../app/api/writers-studio/rebuild/context/route';

const initialAccessMode = process.env.ACCESS_CONTROL_MODE;
const initialRootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN;
const timestamp = new Date('2026-10-19T12:00:00.000Z');

function request(options: {
  route?: string;
  tokenCookie?: string;
  tokenHeader?: string;
  claim?: string;
  method?: 'GET' | 'POST';
} = {}): NextRequest {
  const {
    route = TARGET + '?manuscriptId=' + MANUSCRIPT,
    tokenCookie,
    tokenHeader,
    claim,
    method = 'GET',
  } = options;
  const headers = new Headers({ host: 'soullab.life' });
  if (tokenCookie) headers.set('cookie', 'maia_session=' + tokenCookie);
  if (tokenHeader) headers.set('x-session-token', tokenHeader);
  if (claim) headers.set('x-member-id', claim);
  return new NextRequest('https://soullab.life' + route, { method, headers });
}

function isForwarded(response: Response) {
  return response.status === 200 &&
    response.headers.get('x-middleware-next') === '1';
}

async function openContext(req: NextRequest) {
  mockCookieToken = req.cookies.get('maia_session')?.value ?? null;
  const edge = await proxy(req);
  if (!isForwarded(edge)) return { edge, content: null };
  const response = await realContextRoute.GET(req);
  return {
    edge,
    content: { status: response.status, data: await response.json() as Record<string, unknown> },
  };
}

beforeEach(() => {
  process.env.ACCESS_CONTROL_MODE = 'strict';
  delete process.env.NEXT_PUBLIC_ROOT_DOMAIN;
  mockCookieToken = null;
  mockQuery.mockReset();
  mockQuery.mockImplementation(async (sql, args) => {
    const text = String(sql);
    const token = args?.[0];
    if (/FROM auth_sessions s/i.test(text)) {
      if (token === TOKEN_A) {
        return { rows: [{ member_id: A, tier: 'free', roles: ['member'] }] };
      }
      if (token === TOKEN_B) {
        return { rows: [{ member_id: B, tier: 'free', roles: ['member'] }] };
      }
      return { rows: [] };
    }
    if (/FROM auth_sessions/i.test(text)) {
      const member = token === TOKEN_A ? A : token === TOKEN_B ? B : null;
      return { rows: member ? [{ member_id: member }] : [] };
    }
    if (/FROM member_manuscripts/i.test(text)) {
      const owned = args?.[0] === MANUSCRIPT && args?.[1] === A;
      return { rows: owned ? [{ id: MANUSCRIPT, title: 'Fictional work' }] : [] };
    }
    if (/FROM manuscript_working_drafts/i.test(text)) {
      const owned = args?.[0] === MANUSCRIPT && args?.[1] === A;
      return { rows: owned ? [{
        id: DRAFT,
        version: '2',
        updated_at: timestamp,
        section_addressable_at: timestamp,
      }] : [] };
    }
    if (/FROM working_draft_revisions/i.test(text)) {
      return { rows: args?.[0] === DRAFT ? [{ revision_number: 2 }] : [] };
    }
    if (/FROM manuscript_draft_sections ds/i.test(text)) {
      return { rows: args?.[0] === DRAFT ? [{
        draft_section_id: SECTION,
        source_section_id: null,
        position: 0,
        text: 'Fictional member-authored passage.',
        heading: null,
        heading_depth: null,
        heading_signal: null,
      }] : [] };
    }
    throw new Error('Unexpected FWE-ROUTE-01 fictional SQL shape');
  });
});

afterAll(() => {
  if (initialAccessMode === undefined) delete process.env.ACCESS_CONTROL_MODE;
  else process.env.ACCESS_CONTROL_MODE = initialAccessMode;
  if (initialRootDomain === undefined) delete process.env.NEXT_PUBLIC_ROOT_DOMAIN;
  else process.env.NEXT_PUBLIC_ROOT_DOMAIN = initialRootDomain;
});

describe('one exact route, no inherited breadth', () => {
  it('declares the one nonpublic authenticated rule, without roles or prefix', () => {
    const rule = matchRule(TARGET);
    expect(rule).toBeTruthy();
    expect(rule?.exact).toBe(TARGET);
    expect(rule?.prefix).toBeUndefined();
    expect(rule?.regex).toBeUndefined();
    expect(rule?.public).not.toBe(true);
    expect(rule?.minTier).toBe('free');
    expect(rule?.rolesAnyOf).toBeUndefined();
  });

  it('the existing context module exports GET but no POST/PUT/PATCH/DELETE handlers', () => {
    expect(typeof realContextRoute.GET).toBe('function');
    const exports = realContextRoute as unknown as Record<string, unknown>;
    for (const method of ['POST', 'PUT', 'PATCH', 'DELETE']) {
      expect(exports[method]).toBeUndefined();
    }
    // The matrix is pathname-only; any method-specific outer guarantee would
    // require a separate Class A contract. No such guarantee is claimed here.
    const source = readFileSync(resolve(process.cwd(),
      'app/api/writers-studio/rebuild/context/route.ts'), 'utf8');
    expect(source).toContain('export async function GET(');
    expect(source).not.toMatch(/export async function (POST|PUT|PATCH|DELETE)\(/);
  });

  it('allows an authenticated free member in strict mode', () => {
    expect(checkAccess(TARGET, 'free', ['member'], true).allowed).toBe(true);
  });

  it('refuses anonymous, stale and role/tier-only assertions without a session', () => {
    const denied = checkAccess(TARGET, 'pro', ['admin'], false);
    expect(denied).toMatchObject({ allowed: false, reason: 'unauthenticated' });
  });

  it.each([
    '/api/writers-studio/rebuild/',
    '/api/writers-studio/rebuild/contextual',
    '/api/writers-studio/rebuild/context/extra',
    '/api/writers-studio/rebuild/future',
    '/api/writers-studio/focus',
    '/api/writers-studio/unknown',
    '/api/writers-studio',
  ])('does not authorize adjacent path %s', (pathname) => {
    expect(matchRule(pathname)).toBeNull();
    expect(checkAccess(pathname, 'free', ['member'], true))
      .toMatchObject({ allowed: false, reason: 'no-rule-match', unmapped: true });
  });

  it('preserves editorial/sovereign and H1 admission policies', () => {
    for (const path of [
      '/api/writers-studio/editorial/thread',
      '/api/sovereign/manuscripts',
      '/api/sovereign/manuscripts/' + MANUSCRIPT + '/sections/' + SECTION,
      '/api/house-studio/admission',
    ]) {
      expect(checkAccess(path, 'free', ['member'], true).allowed).toBe(true);
      expect(checkAccess(path, 'free', ['member'], false).allowed).toBe(false);
    }
  });

  it('the existing strict default remains a refusal, not permissive inheritance', () => {
    const unknown = checkAccess('/api/fwe01-unknown-route', 'pro', ['admin'], true);
    expect(unknown).toMatchObject({ allowed: false, reason: 'no-rule-match', unmapped: true });
  });
});

describe('real proxy ingress plus unchanged member-scoped context GET', () => {
  it('rejects signed-out GET at the proxy before any database query', async () => {
    const { edge, content } = await openContext(request());
    expect(edge.status).toBe(401);
    expect(content).toBeNull();
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it('accepts fictional member A cookie and returns ONLY owned manuscript', async () => {
    const { edge, content } = await openContext(request({ tokenCookie: TOKEN_A }));
    expect(isForwarded(edge)).toBe(true);
    expect(edge.headers.get('x-middleware-request-x-access-member-id')).toBe(A);
    expect(content?.status).toBe(200);
    expect(content?.data.state).toBe('section_aware');
    expect(content?.data.manuscriptId).toBe(MANUSCRIPT);
    expect(content?.data.version).toBe(2);
    const sections = content?.data.sections as Array<{body:string,editable:boolean}>;
    expect(sections).toHaveLength(1);
    expect(sections[0].body).toBe('Fictional member-authored passage.');
    expect(sections[0].editable).toBe(true);
  });

  it('accepts valid Safari x-session-token with no cookie', async () => {
    const { edge, content } = await openContext(request({ tokenHeader: TOKEN_A }));
    expect(isForwarded(edge)).toBe(true);
    expect(content?.status).toBe(200);
    expect(content?.data.manuscriptId).toBe(MANUSCRIPT);
  });

  it('rejects a revoked, expired, invalid or unknown fictional session', async () => {
    for (const token of [TOKEN_REVOKED, TOKEN_EXPIRED, 'NOT_A_SESSION']) {
      const { edge, content } = await openContext(request({ tokenHeader: token }));
      expect(edge.status).toBe(401);
      expect(content).toBeNull();
    }
  });

  it('preserves existing cookie-first authority: stale cookie does not fall through to Safari header', async () => {
    const { edge, content } = await openContext(
      request({ tokenCookie: TOKEN_REVOKED, tokenHeader: TOKEN_A }));
    expect(edge.status).toBe(401);
    expect(content).toBeNull();
  });

  it('rejects forged identity claim despite valid credential', async () => {
    const { edge, content } = await openContext(
      request({ tokenHeader: TOKEN_A, claim: B }));
    expect(edge.status).toBe(401);
    expect(content).toBeNull();
  });

  it('denies a member-ID claim without a server session', async () => {
    const { edge } = await openContext(request({ claim: A }));
    expect(edge.status).toBe(401);
  });

  it('allows member B through outer auth but real GET returns 404 on A manuscript', async () => {
    const { edge, content } = await openContext(request({ tokenCookie: TOKEN_B }));
    expect(isForwarded(edge)).toBe(true);
    expect(content?.status).toBe(404);
    expect(content?.data.error).toBe('not_found');
    const sql = mockQuery.mock.calls.map(args => String(args[0]));
    expect(sql.some(line => line.includes('FROM member_manuscripts'))).toBe(true);
    expect(sql.some(line => line.includes('FROM manuscript_draft_sections'))).toBe(false);
  });

  it('still refuses missing manuscript ID at the real handler', async () => {
    const { edge, content } = await openContext(
      request({ route: TARGET, tokenCookie: TOKEN_A }));
    expect(isForwarded(edge)).toBe(true);
    expect(content?.status).toBe(400);
    expect(content?.data.error).toBe('manuscriptId is required');
  });

  it('preserves the existing URL-token distinction: proxy may recognize _t, but the context handler refuses query-only access', async () => {
    // The pinned canonical auth reader still recognizes a generic ?_t token
    // at outer ingress. The member-context handler authenticates ONLY its
    // web cookie or Safari header; opening this new exact route must not
    // expose any manuscript through URL bearer alone.
    const { edge, content } = await openContext(request({
      route: TARGET + '?manuscriptId=' + MANUSCRIPT + '&_t=' + TOKEN_A,
    }));
    expect(isForwarded(edge)).toBe(true);
    expect(content?.status).toBe(401);
    expect(content?.data.error).toBe('unauthenticated');
  });

  it('client-forged derived roles and tier without a session cannot unlock the route', async () => {
    const req = new NextRequest('https://soullab.life' + TARGET, {
      method: 'GET',
      headers: {
        host: 'soullab.life',
        'x-access-authed': 'true',
        'x-access-member-id': A,
        'x-access-roles': 'admin',
        'x-access-tier': 'pro',
        'x-maia-tier': 'pro',
      },
    });
    expect((await proxy(req)).status).toBe(401);
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it('keeps adjacent paths denied by actual proxy under strict mode', async () => {
    for (const route of [
      '/api/writers-studio/rebuild/context/next',
      '/api/writers-studio/rebuild/unknown',
      '/api/writers-studio/focus',
    ]) {
      const res = await proxy(request({ route, tokenCookie: TOKEN_A }));
      expect(res.status).toBe(404);
      const payload = await res.json() as Record<string, unknown>;
      expect(payload.message).toBe('This route is not configured in the access matrix.');
    }
  });
});
