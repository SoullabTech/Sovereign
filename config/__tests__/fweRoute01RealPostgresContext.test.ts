/**
 * FWE-ROUTE-01 · Class A / real PostgreSQL 17, FICTIONAL MEMBERS ONLY.
 *
 * Executes the actual strict proxy + context GET handler with genuine
 * parameterized PostgreSQL reads. next/headers.cookies() is the only injected
 * Next request-context adapter; no real browser, production database or user.
 *
 * Explicit test opt-in and private Unix socket required. A disposable
 * PostgreSQL cluster must be created/stopped by the attended operator.
 */
import { afterAll, beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { NextRequest } from 'next/server';
import { Pool } from 'pg';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const A = '11111111-1111-4111-8111-111111111111';
const B = '22222222-2222-4222-8222-222222222222';
const M = '44444444-4444-4444-8444-444444444444';
const D = '55555555-5555-4555-8555-555555555555';
const S = '66666666-6666-4666-8666-666666666666';
const OWN = 'FWE01_POSTGRES_FICTIONAL_COOKIE_A';
const SAFARI = 'FWE01_POSTGRES_FICTIONAL_SAFARI_A';
const FOREIGN = 'FWE01_POSTGRES_FICTIONAL_B';
const REVOKED = 'FWE01_POSTGRES_FICTIONAL_REVOKED';
const EXPIRED = 'FWE01_POSTGRES_FICTIONAL_EXPIRED';
const TARGET = '/api/writers-studio/rebuild/context';
const FICTITIOUS_TEXT = 'FICTIONAL AUTHOR A — already saved text.';

let mockPool: Pool;
let mockCookieToken: string | null = null;
const initialMode = process.env.ACCESS_CONTROL_MODE;

jest.mock('next/headers', () => ({
  __esModule: true,
  cookies: async () => ({
    get: (name: string) =>
      name === 'maia_session' && mockCookieToken
        ? { name, value: mockCookieToken }
        : undefined,
  }),
}));
jest.mock('@/lib/db/postgres', () => ({
  __esModule: true,
  query: (sql: string, params?: unknown[]) =>
    mockPool.query(sql, params as unknown[] | undefined),
}));

import { proxy } from '../../proxy';
import { GET as actualContextGET } from '../../app/api/writers-studio/rebuild/context/route';

function request(opts: {
  cookie?: string; safari?: string; claim?: string;
  manuscript?: string; route?: string;
} = {}) {
  const { cookie, safari, claim, route } = opts;
  const target = route ?? (TARGET + '?manuscriptId=' + (opts.manuscript ?? M));
  const headers = new Headers({ host: 'soullab.life' });
  if (cookie) headers.set('cookie', 'maia_session=' + cookie);
  if (safari) headers.set('x-session-token', safari);
  if (claim) headers.set('x-member-id', claim);
  return new NextRequest('https://soullab.life' + target, { method: 'GET', headers });
}
async function serve(req: NextRequest) {
  mockCookieToken = req.cookies.get('maia_session')?.value ?? null;
  const ingress = await proxy(req);
  const allowed = ingress.status === 200 &&
    ingress.headers.get('x-middleware-next') === '1';
  if (!allowed) return { proxyStatus: ingress.status, handlerStatus: null, body: null };
  const response = await actualContextGET(req);
  return {
    proxyStatus: ingress.status,
    handlerStatus: response.status,
    body: await response.json() as Record<string, unknown>,
  };
}

const gated = process.env.FWE_ROUTE01_PG_WITNESS === '1' ? describe : describe.skip;
gated('FWE-ROUTE-01 genuine fictional PostgreSQL + strict proxy', () => {
  beforeAll(async () => {
    const socket = process.env.FWE_ROUTE01_PG_SOCKET;
    if (!socket ||
        !/^\/private\/tmp\/soullab-fwe-route01-pg-20261019\.[a-zA-Z0-9]+\/socket$/.test(socket) ||
        process.env.FWE_ROUTE01_PG_DB !== 'fwe_route01_fictional' ||
        process.env.CI !== 'true' || process.env.DATABASE_URL ||
        process.env.SMTP_HOST || process.env.OPENAI_API_KEY ||
        process.env.ANTHROPIC_API_KEY || process.env.CAPACITOR_BUILD) {
      throw new Error('FWE-ROUTE-01 refused unsafe environment');
    }
    const base = 'ffcab520e346cf2d7cee1f293e509c68afc44ab3';
    execFileSync('git', ['merge-base', '--is-ancestor', base, 'HEAD']);
    const fixedSource = [
      ['proxy.ts', '0c9f42abc46bd55e67b1857d4864e0a42574d2e6'],
      ['app/api/writers-studio/rebuild/context/route.ts',
        '9e6886ac00f218325c21690e3cf87713b92e7421'],
      ['lib/auth/verifiedAccess.ts', '4d03b40ca72ed60cd1ee8d831c1602d382136b02'],
      ['lib/auth/getMemberFromRequest.ts', '0c5a40d4a7d88aa493fe4222fc34fe12f90a0d0b'],
    ] as const;
    for (const [path, sha] of fixedSource) {
      const bytes = readFileSync(path);
      const hash = createHash('sha1')
        .update('blob ' + bytes.length + '\0').update(bytes).digest('hex');
      expect(hash).toBe(sha);
    }
    mockPool = new Pool({
      host: socket, port: 55493, database: 'fwe_route01_fictional',
      user: 'soullab', max: 3, connectionTimeoutMillis: 2000,
    });
    const proof = await mockPool.query(
      'SELECT current_database() AS db, inet_server_addr() IS NULL AS local, current_setting($1)::integer AS version',
      ['server_version_num'],
    );
    if (proof.rows[0]?.db !== 'fwe_route01_fictional' ||
        proof.rows[0]?.local !== true || proof.rows[0]?.version < 170000) {
      throw new Error('FWE-ROUTE-01 refused nonfictional or TCP database');
    }
    const schema = [
      'CREATE TABLE members (id uuid PRIMARY KEY, tier text, roles text[])',
      'CREATE TABLE auth_sessions (session_token text PRIMARY KEY, member_id uuid NOT NULL REFERENCES members(id), revoked boolean NOT NULL DEFAULT false, expires_at timestamptz NOT NULL)',
      'CREATE TABLE member_manuscripts (id uuid PRIMARY KEY, member_id uuid NOT NULL REFERENCES members(id), title text NOT NULL)',
      'CREATE TABLE manuscript_working_drafts (id uuid PRIMARY KEY, manuscript_id uuid NOT NULL REFERENCES member_manuscripts(id), member_id uuid NOT NULL REFERENCES members(id), version integer NOT NULL, updated_at timestamptz NOT NULL, section_addressable_at timestamptz)',
      'CREATE TABLE working_draft_revisions (draft_id uuid NOT NULL REFERENCES manuscript_working_drafts(id), revision_number integer NOT NULL)',
      'CREATE TABLE manuscript_sections (id uuid PRIMARY KEY, heading text, heading_depth integer, heading_signal text)',
      'CREATE TABLE manuscript_draft_sections (id uuid PRIMARY KEY, draft_id uuid NOT NULL REFERENCES manuscript_working_drafts(id), source_section_id uuid, position integer NOT NULL, text text NOT NULL)',
    ];
    for (const statement of schema) await mockPool.query(statement);
    await mockPool.query(
      'INSERT INTO members(id,tier,roles) VALUES ($1,$2,$3),($4,$5,$6)',
      [A, 'free', ['member'], B, 'free', ['member']],
    );
    for (const [token, member, modifier] of [
      [OWN, A, 'active'], [SAFARI, A, 'active'], [FOREIGN, B, 'active'],
      [REVOKED, A, 'revoked'], [EXPIRED, A, 'expired'],
    ]) {
      await mockPool.query(
        'INSERT INTO auth_sessions(session_token,member_id,revoked,expires_at) VALUES ($1,$2,$3,NOW()+$4::interval)',
        [token, member, modifier === 'revoked', modifier === 'expired' ? '-1 hour' : '1 hour'],
      );
    }
    await mockPool.query(
      'INSERT INTO member_manuscripts(id,member_id,title) VALUES($1,$2,$3)',
      [M, A, 'Fictional Chapter'],
    );
    await mockPool.query(
      'INSERT INTO manuscript_working_drafts(id,manuscript_id,member_id,version,updated_at,section_addressable_at) VALUES($1,$2,$3,2,NOW(),NOW())',
      [D,M,A],
    );
    await mockPool.query(
      'INSERT INTO working_draft_revisions(draft_id,revision_number) VALUES($1,2)', [D],
    );
    await mockPool.query(
      'INSERT INTO manuscript_draft_sections(id,draft_id,source_section_id,position,text) VALUES($1,$2,NULL,0,$3)',
      [S,D,FICTITIOUS_TEXT],
    );
  }, 15000);

  afterAll(async () => {
    if (mockPool) await mockPool.end();
    if (initialMode === undefined) delete process.env.ACCESS_CONTROL_MODE;
    else process.env.ACCESS_CONTROL_MODE = initialMode;
  });

  beforeEach(() => {
    process.env.ACCESS_CONTROL_MODE = 'strict';
    mockCookieToken = null;
  });

  it('the exact owned manuscript returns genuine SQL-backed section-aware state', async () => {
    const r = await serve(request({ cookie: OWN }));
    expect(r.proxyStatus).toBe(200);
    expect(r.handlerStatus).toBe(200);
    expect(r.body?.state).toBe('section_aware');
    expect(r.body?.manuscriptId).toBe(M);
    expect(r.body?.version).toBe(2);
    const sections = r.body?.sections as Array<{ body: string }>;
    expect(sections[0].body).toBe(FICTITIOUS_TEXT);
  });

  it('Safari session header is independently validated by both server boundaries', async () => {
    const r = await serve(request({ safari: SAFARI }));
    expect(r.proxyStatus).toBe(200);
    expect(r.handlerStatus).toBe(200);
  });

  it('foreign manuscript is refused 404 AFTER the member B passes outer proxy', async () => {
    const r = await serve(request({ safari: FOREIGN }));
    expect(r.proxyStatus).toBe(200);
    expect(r.handlerStatus).toBe(404);
    expect(r.body?.error).toBe('not_found');
  });

  it.each([REVOKED, EXPIRED, 'NOT_VALID'])(
    'revoked, expired and unknown sessions are denied by strict proxy: %s',
    async token => {
      const r = await serve(request({ safari: token }));
      expect(r.proxyStatus).toBe(401);
      expect(r.handlerStatus).toBeNull();
    },
  );

  it('forged B identity with valid A Safari credential refuses access', async () => {
    const r = await serve(request({ safari: SAFARI, claim: B }));
    expect(r.proxyStatus).toBe(401);
  });

  it('no session receives 401 before any handler reads', async () => {
    const r = await serve(request());
    expect(r.proxyStatus).toBe(401);
    expect(r.handlerStatus).toBeNull();
  });

  it('adjacent unmapped endpoint is still refused under strict mode', async () => {
    const r = await serve(request({
      cookie: OWN, route: '/api/writers-studio/rebuild/context-extra?manuscriptId=' + M,
    }));
    expect(r.proxyStatus).toBe(404);
    expect(r.handlerStatus).toBeNull();
  });
});
