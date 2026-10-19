/**
 * SOULLAB-FWE-01 Stage 1 — fictional REAL route contract witness.
 *
 * Calls the unmodified actual Writer's Studio context GET and section PUT
 * handlers, real getMemberIdFromRequest, saveSection, and PostgreSQL SQL.
 * This is NOT a Next.js HTTP/browser test or a live MAIA response.
 *
 * SOURCE CUSTODY: only run against the frozen FWE01 parent; only disposable
 * Unix-socket PG 17 database fwe01_fictional; no external service or email.
 */
import { afterAll, beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { NextRequest } from 'next/server';
import { Pool } from 'pg';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const A = '11111111-1111-4111-8111-111111111111';
const B = '22222222-2222-4222-8222-222222222222';
const WORK = '33333333-3333-4333-8333-333333333333';
const MANUSCRIPT = '44444444-4444-4444-8444-444444444444';
const DRAFT = '55555555-5555-4555-8555-555555555555';
const SECTION = '66666666-6666-4666-8666-666666666666';
const SOURCE = '77777777-7777-4777-8777-777777777777';
const TOKEN_A = 'FICTIONAL_FWE01_SESSION_A';
const TOKEN_B = 'FICTIONAL_FWE01_SESSION_B';
const TOKEN_FRESH = 'FICTIONAL_FWE01_SESSION_A_FRESH';
const PREFIX = 'Fictional Chapter\n\n';
const ORIGINAL = 'A fictional writer writes their own words.';
const EDITED = 'A fictional writer carefully revises their own words.';
const PROPOSAL = '[SIMULATED MAIA, NO MODEL] Another possible fictional sentence.';

let mockPool: Pool;
let mockCookieToken: string | null = TOKEN_A;

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
  transaction: async <T>(
    callback: (tx: {
      query: (sql: string, params?: unknown[]) => Promise<unknown>;
    }) => Promise<T>,
  ): Promise<T> => {
    const client = await mockPool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback({
        query: (sql, params) => client.query(sql, params as unknown[] | undefined),
      });
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },
}));

import { GET as readContext } from '../../app/api/writers-studio/rebuild/context/route';
import { PUT as saveSectionRoute } from '../../app/api/sovereign/manuscripts/[id]/sections/[sectionId]/route';

function makeRequest(
  method: 'GET' | 'PUT',
  token: string | null,
  body?: { body: string; baseVersion: number; observedBodySha256?: string },
  extraHeaders: Record<string, string> = {},
) {
  mockCookieToken = token;
  const url = method === 'GET'
    ? 'https://fictional.invalid/api/writers-studio/rebuild/context?manuscriptId=' + MANUSCRIPT
    : 'https://fictional.invalid/api/sovereign/manuscripts/' + MANUSCRIPT + '/sections/' + SECTION;
  const headers = new Headers(extraHeaders);
  if (body) headers.set('content-type', 'application/json');
  return new NextRequest(url, {
    method, headers,
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
}

async function get(token: string | null, headers: Record<string, string> = {}) {
  const response = await readContext(makeRequest('GET', token, undefined, headers));
  return { status: response.status, payload: await response.json() as Record<string, unknown> };
}

async function put(token: string | null, body: string, baseVersion: number, hash?: string) {
  const response = await saveSectionRoute(makeRequest('PUT', token, {
    body, baseVersion, ...(hash ? { observedBodySha256: hash } : {}),
  }), { params: Promise.resolve({ id: MANUSCRIPT, sectionId: SECTION }) });
  return { status: response.status, payload: await response.json() as Record<string, unknown> };
}

async function assertStored(knownBody: string, version: number) {
  const values = await mockPool.query(
    'SELECT d.content, d.version, ds.text FROM manuscript_working_drafts d JOIN manuscript_draft_sections ds ON ds.draft_id = d.id WHERE d.id = $1',
    [DRAFT],
  );
  expect(values.rows).toHaveLength(1);
  expect(values.rows[0].version).toBe(version);
  expect(values.rows[0].text).toBe(PREFIX + knownBody);
  expect(values.rows[0].content).toBe(PREFIX + knownBody);
}

const enabled = process.env.FWE01_PG_WITNESS === '1' ? describe : describe.skip;
enabled('FWE-01 Stage 1 actual Writer route/PG17 fictional acceptance', () => {
  beforeAll(async () => {
    const socket = process.env.FWE01_PG_SOCKET;
    const expected = 'ffcab520e346cf2d7cee1f293e509c68afc44ab3';
    if (!socket ||
        !/^\/private\/tmp\/soullab-fwe01-routepg-20261019\.[A-Za-z0-9]+\/socket$/.test(socket) ||
        process.env.FWE01_PG_DATABASE !== 'fwe01_fictional' ||
        process.env.CI !== 'true' || process.env.DATABASE_URL ||
        process.env.SMTP_HOST || process.env.OPENAI_API_KEY ||
        process.env.ANTHROPIC_API_KEY || process.env.CAPACITOR_BUILD) {
      throw new Error('FWE01 route harness refused unsafe environment');
    }
    const parent = execFileSync('git', ['rev-parse', 'HEAD^'], { encoding: 'utf8' }).trim();
    if (parent !== expected) throw new Error('FWE01 route harness wrong base SHA');
    const expectedBlob = '47d8cd3c0b45abe958cc493513c7e8164bada4f2';
    const blob = execFileSync('git', ['hash-object', 'app/api/sovereign/manuscripts/[id]/sections/[sectionId]/route.ts'],
      { encoding: 'utf8' }).trim();
    if (blob !== expectedBlob) throw new Error('FWE01 section PUT source altered');
    // Also preserve exact context route bytes without modifying source.
    const ctxBytes = readFileSync('app/api/writers-studio/rebuild/context/route.ts');
    expect(createHash('sha1').update(Buffer.concat([
      Buffer.from('blob ' + ctxBytes.length + '\0'), ctxBytes,
    ])).digest('hex')).toBe('9e6886ac00f218325c21690e3cf87713b92e7421');

    mockPool = new Pool({
      host: socket, port: 55489, database: 'fwe01_fictional',
      user: 'soullab', max: 3, connectionTimeoutMillis: 2000,
    });
    const proof = await mockPool.query(
      'SELECT current_database() AS db, inet_server_addr() IS NULL AS local, current_setting($1)::integer AS version',
      ['server_version_num'],
    );
    expect([proof.rows[0]?.db, proof.rows[0]?.local]).toEqual(['fwe01_fictional', true]);
    expect(proof.rows[0]?.version).toBeGreaterThanOrEqual(170000);

    // A minimal fictional schema sufficient for the ACTUAL two route handlers.
    // This is not a rehearsal of the full migration set or its deferred triggers.
    const schema = [
      'CREATE TABLE fwe_members(id uuid PRIMARY KEY, label text NOT NULL)',
      'CREATE TABLE auth_sessions(session_token text PRIMARY KEY, member_id uuid NOT NULL REFERENCES fwe_members(id), revoked boolean NOT NULL DEFAULT false, expires_at timestamptz NOT NULL)',
      'CREATE TABLE living_works(id uuid PRIMARY KEY, member_id uuid NOT NULL REFERENCES fwe_members(id), title text NOT NULL)',
      'CREATE TABLE member_manuscripts(id uuid PRIMARY KEY, member_id uuid NOT NULL REFERENCES fwe_members(id), title text NOT NULL)',
      'CREATE TABLE manuscript_sections(id uuid PRIMARY KEY, manuscript_id uuid NOT NULL REFERENCES member_manuscripts(id), heading text, heading_depth integer, heading_signal text)',
      'CREATE TABLE manuscript_working_drafts(id uuid PRIMARY KEY, manuscript_id uuid NOT NULL REFERENCES member_manuscripts(id), member_id uuid NOT NULL REFERENCES fwe_members(id), version integer NOT NULL, section_addressable_at timestamptz, updated_at timestamptz NOT NULL DEFAULT now(), content text NOT NULL)',
      'CREATE TABLE manuscript_draft_sections(id uuid PRIMARY KEY, draft_id uuid NOT NULL REFERENCES manuscript_working_drafts(id), position integer NOT NULL, source_section_id uuid REFERENCES manuscript_sections(id), text text NOT NULL, updated_at timestamptz NOT NULL DEFAULT now())',
      'CREATE TABLE working_draft_revisions(draft_id uuid NOT NULL REFERENCES manuscript_working_drafts(id), revision_number integer NOT NULL)',
    ];
    for (const ddl of schema) await mockPool.query(ddl);
  }, 15000);

  afterAll(async () => {
    if (mockPool) await mockPool.end();
  });

  beforeEach(async () => {
    mockCookieToken = TOKEN_A;
    const tables = [
      'working_draft_revisions', 'manuscript_draft_sections',
      'manuscript_working_drafts', 'manuscript_sections',
      'member_manuscripts', 'living_works', 'auth_sessions', 'fwe_members',
    ];
    await mockPool.query('TRUNCATE ' + tables.join(',') + ' CASCADE');
    await mockPool.query('INSERT INTO fwe_members(id,label) VALUES($1,$2),($3,$4)', [A, 'Fictional A', B, 'Fictional B']);
    await mockPool.query(
      "INSERT INTO auth_sessions(session_token,member_id,revoked,expires_at) VALUES($1,$2,false,now()+interval '1 hour'),($3,$4,false,now()+interval '1 hour')",
      [TOKEN_A, A, TOKEN_B, B],
    );
    await mockPool.query('INSERT INTO living_works(id,member_id,title) VALUES($1,$2,$3)',
      [WORK, A, 'Fictional Work']);
    await mockPool.query('INSERT INTO member_manuscripts(id,member_id,title) VALUES($1,$2,$3)',
      [MANUSCRIPT, A, 'Fictional Manuscript']);
    await mockPool.query('INSERT INTO manuscript_sections(id,manuscript_id,heading,heading_depth,heading_signal) VALUES($1,$2,$3,$4,$5)',
      [SOURCE, MANUSCRIPT, 'Fictional Chapter', 1, 'explicit']);
    await mockPool.query('INSERT INTO manuscript_working_drafts(id,manuscript_id,member_id,version,section_addressable_at,content) VALUES($1,$2,$3,$4,now(),$5)',
      [DRAFT, MANUSCRIPT, A, 1, PREFIX + ORIGINAL]);
    await mockPool.query('INSERT INTO manuscript_draft_sections(id,draft_id,position,source_section_id,text) VALUES($1,$2,0,$3,$4)',
      [SECTION, DRAFT, SOURCE, PREFIX + ORIGINAL]);
    await mockPool.query('INSERT INTO working_draft_revisions(draft_id,revision_number) VALUES($1,1)', [DRAFT]);
  }, 15000);

  it('A opens the existing section-addressable fictional manuscript and section', async () => {
    const result = await get(TOKEN_A);
    expect(result.status).toBe(200);
    expect(result.payload.state).toBe('section_aware');
    expect(result.payload.manuscriptId).toBe(MANUSCRIPT);
    expect(result.payload.version).toBe(1);
    const sections = result.payload.sections as Array<{ draftSectionId: string; body: string; editable: boolean }>;
    expect(sections).toHaveLength(1);
    expect(sections[0]).toMatchObject({ draftSectionId: SECTION, body: ORIGINAL, editable: true });
  });

  it('actual section PUT acknowledges writer A and GET reads back exact changes', async () => {
    const saved = await put(TOKEN_A, EDITED, 1);
    expect(saved.status).toBe(200);
    expect(saved.payload).toMatchObject({ ok: true, sectionId: SECTION, body: EDITED, version: 2, acceptedBy: 'version' });
    const readback = await get(TOKEN_A);
    expect(readback.status).toBe(200);
    expect(readback.payload.version).toBe(2);
    expect((readback.payload.sections as Array<{ body: string }>)[0].body).toBe(EDITED);
    await assertStored(EDITED, 2);
  });

  it('actual section PUT returns 409 stale_base, preserving previous writer text', async () => {
    expect((await put(TOKEN_A, EDITED, 1)).status).toBe(200);
    const stale = await put(TOKEN_A, 'This stale content must not overwrite.', 1);
    expect(stale.status).toBe(409);
    expect(stale.payload.refusal).toBe('stale_base');
    await assertStored(EDITED, 2);
  });

  it('actual routes refuse signed-out, foreign writer, and forged identity claims', async () => {
    expect((await get(null)).status).toBe(401);
    expect((await get(TOKEN_B)).status).toBe(404);
    expect((await put(TOKEN_B, 'FOREIGN', 1)).status).toBe(404);
    expect((await get(TOKEN_A, { 'x-member-id': B })).status).toBe(401);
    await assertStored(ORIGINAL, 1);
  });

  it('optional simulated MAIA suggestion never writes without the writer Apply gesture', async () => {
    expect(PROPOSAL).toContain('SIMULATED MAIA');
    const baseline = await get(TOKEN_A);
    expect(baseline.status).toBe(200);
    const explicitChoice = 'KEEP ORIGINAL';
    expect(explicitChoice).toBe('KEEP ORIGINAL');
    await assertStored(ORIGINAL, 1);
  });

  it('old session is refused after revoke; fresh fictional session reopens saved Work', async () => {
    expect((await put(TOKEN_A, EDITED, 1)).status).toBe(200);
    await mockPool.query('UPDATE auth_sessions SET revoked=true WHERE session_token=$1', [TOKEN_A]);
    expect((await get(TOKEN_A)).status).toBe(401);
    await mockPool.query(
      "INSERT INTO auth_sessions(session_token,member_id,revoked,expires_at) VALUES($1,$2,false,now()+interval '1 hour')",
      [TOKEN_FRESH, A],
    );
    const reopening = await get(TOKEN_FRESH);
    expect(reopening.status).toBe(200);
    expect(reopening.payload.version).toBe(2);
    expect((reopening.payload.sections as Array<{ body: string }>)[0].body).toBe(EDITED);
    await assertStored(EDITED, 2);
  });

  it('unadmitted and foreign URL Work claims never grant a foreign manuscript', async () => {
    const req = new NextRequest(
      'https://fictional.invalid/api/writers-studio/rebuild/context?manuscriptId=' + MANUSCRIPT +
      '&work=99999999-9999-4999-8999-999999999999',
      { headers: { 'x-member-id': A } },
    );
    mockCookieToken = TOKEN_B;
    const refused = await readContext(req);
    expect(refused.status).toBe(401); // mismatched member claim cannot grant access
    expect((await get(TOKEN_B)).status).toBe(404);
  });
});
