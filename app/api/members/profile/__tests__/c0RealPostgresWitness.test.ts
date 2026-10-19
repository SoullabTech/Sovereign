/**
 * C0 isolated, fictional Postgres witness: real member-session resolver and
 * profile mutation SQL, bound to a private scratch PG17 Unix socket.
 * No production database, mail, or credentials. Opt-in only.
 */
import { afterAll, beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { NextRequest } from 'next/server';
import { Pool } from 'pg';

const A = '11111111-1111-4111-8111-111111111111';
const B = '22222222-2222-4222-8222-222222222222';
const dbWitness = process.env.C0_PG_WITNESS === '1' ? describe : describe.skip;

let cookieSession: string | null = null;
let cookieMemberClaim: string | null = null;
jest.mock('next/headers', () => ({
  cookies: async () => ({
    get: (key: string) => {
      if (key === 'maia_session' && cookieSession) return { value: cookieSession };
      if (key === 'maia_member_id' && cookieMemberClaim) return { value: cookieMemberClaim };
      return undefined;
    },
  }),
}));

type Rows = { rows: Record<string, unknown>[]; rowCount: number | null };
const mockQuery = jest.fn<(sql: string, args?: unknown[]) => Promise<Rows>>();
jest.mock('@/lib/db/postgres', () => ({
  __esModule: true,
  query: (sql: string, args?: unknown[]) => mockQuery(sql, args),
}));

import { PUT as profilePUT } from '../route';
import { POST as passwordPOST } from '@/app/api/members/password/route';

let scratch: Pool;
type RequestOpts = { cookie?: string; cookieClaim?: string; header?: string; claim?: string };
function makeReq(url: string, body: unknown, opts: RequestOpts = {}): NextRequest {
  cookieSession = opts.cookie ?? null;
  cookieMemberClaim = opts.cookieClaim ?? null;
  const headers: Record<string, string> = {
    'content-type': 'application/json',
    origin: 'https://fictional-c0.invalid',
  };
  if (opts.header) headers['x-session-token'] = opts.header;
  if (opts.claim) headers['x-member-id'] = opts.claim;
  return new NextRequest('https://fictional-c0.invalid' + url, {
    method: url.includes('password') ? 'POST' : 'PUT',
    headers,
    body: JSON.stringify(body),
  });
}
const profile = (body: unknown, opts?: RequestOpts) =>
  profilePUT(makeReq('/api/members/profile', body, opts));
const password = (body: unknown, opts?: RequestOpts) =>
  passwordPOST(makeReq('/api/members/password', body, opts));
async function member(id: string) {
  const result = await scratch.query(
    'SELECT id, email, name, password_hash, birth_date, astrology_consent FROM members WHERE id=$1',
    [id],
  );
  return result.rows[0];
}

dbWitness('C0 real PostgreSQL 17 session and account-change isolation', () => {
  beforeAll(async () => {
    const socket = process.env.C0_PG_SOCKET;
    if (!socket || !/^\/(?:private\/)?tmp\/soullab-c0pg-20261018\.[A-Za-z0-9]+\/socket$/.test(socket) ||
      process.env.C0_PG_DATABASE !== 'c0_fictional' ||
      process.env.CI !== 'true' ||
      process.env.DATABASE_URL ||
      process.env.SMTP_HOST ||
      process.env.EMAIL_PROVIDER) {
      throw new Error('C0 Postgres witness refused: scratch-only PG17 and no production-capable environment required');
    }
    scratch = new Pool({
      host: socket, port: 55473, database: 'c0_fictional',
      user: 'soullab', max: 3, connectionTimeoutMillis: 2000,
    });
    const proof = await scratch.query(
      'SELECT current_database() AS db, inet_server_addr() IS NULL AS socket_only, current_setting($1)::integer AS pg_version',
      ['server_version_num'],
    );
    if (proof.rows[0]?.db !== 'c0_fictional' ||
      proof.rows[0]?.socket_only !== true ||
      proof.rows[0]?.pg_version < 170000) {
      throw new Error('C0 Postgres witness refused: unexpected database, transport or version');
    }
    mockQuery.mockImplementation(async (sql, args) =>
      (await scratch.query(sql, args as unknown[] | undefined)) as Rows);
  });

  afterAll(async () => {
    if (scratch) await scratch.end();
  });

  beforeEach(async () => {
    cookieSession = null;
    cookieMemberClaim = null;
    await scratch.query(
      [
        'UPDATE members SET',
        "name = CASE id WHEN $1::uuid THEN 'Fictional Member A' ELSE 'Fictional Member B' END,",
        "email = CASE id WHEN $1::uuid THEN 'original-a@example.invalid' ELSE 'original-b@example.invalid' END,",
        "password_hash = CASE id WHEN $1::uuid THEN 'FICTIONAL_HASH_A' ELSE 'FICTIONAL_HASH_B' END,",
        "preferred_name=NULL, birth_date=NULL, astrology_consent='unknown'",
        'WHERE id = $1 OR id = $2',
      ].join(' '),
      [A, B],
    );
  });

  it('accepts a real PostgreSQL-backed desktop cookie session and only writes ordinary fields', async () => {
    const response = await profile({ name: 'Updated A', preferredName: 'A' }, { cookie: 'FICTIONAL_VALID_COOKIE' });
    expect(response.status).toBe(200);
    expect((await member(A)).name).toBe('Updated A');
    expect((await member(A)).email).toBe('original-a@example.invalid');
    expect((await member(B)).name).toBe('Fictional Member B');
  });

  it('accepts a real PG-backed Safari session header for birth-date edits', async () => {
    const response = await profile({ birthData: { date: '1984-04-04' } }, { header: 'FICTIONAL_VALID_SAFARI' });
    expect(response.status).toBe(200);
    expect(String((await member(A)).birth_date)).toContain('1984');
    expect((await member(A)).email).toBe('original-a@example.invalid');
  });

  it('rejects replaced, unchanged, null, empty and mixed email writes without partial mutation', async () => {
    for (const email of ['intruder@example.invalid', 'original-a@example.invalid', '', null]) {
      const response = await profile({ email, name: 'MUST_NOT_WRITE' }, { cookie: 'FICTIONAL_VALID_COOKIE' });
      expect(response.status).toBe(409);
      expect((await member(A)).name).toBe('Fictional Member A');
      expect((await member(A)).email).toBe('original-a@example.invalid');
    }
  });

  it('denies revoked, expired, forged or missing sessions before account writes', async () => {
    for (const header of ['FICTIONAL_EXPIRED', 'FICTIONAL_REVOKED', 'NOT_A_REAL_SESSION']) {
      expect((await profile({ name: 'MUST_NOT_WRITE' }, { header })).status).toBe(401);
    }
    expect((await profile({ name: 'MUST_NOT_WRITE' })).status).toBe(401);
    expect((await member(A)).name).toBe('Fictional Member A');
  });

  it('rejects a forged x-member-id with a verified Safari header session', async () => {
    const response = await profile({ name: 'MUST_NOT_WRITE' }, { header: 'FICTIONAL_VALID_SAFARI', claim: B });
    expect(response.status).toBe(401);
    expect((await member(A)).name).toBe('Fictional Member A');
    expect((await member(B)).name).toBe('Fictional Member B');
  });

  it('rejects mismatched member cookies despite a valid desktop session', async () => {
    const response = await profile({ name: 'MUST_NOT_WRITE' }, { cookie: 'FICTIONAL_VALID_COOKIE', cookieClaim: B });
    expect(response.status).toBe(401);
    expect((await member(A)).name).toBe('Fictional Member A');
  });

  it('ignores a caller-supplied memberId rather than changing a foreign account', async () => {
    const response = await profile({ memberId: B, name: 'Correctly A' }, { cookie: 'FICTIONAL_VALID_COOKIE' });
    expect(response.status).toBe(200);
    expect((await member(A)).name).toBe('Correctly A');
    expect((await member(B)).name).toBe('Fictional Member B');
  });

  it('denies session-only password mutation against an actual fictional member row', async () => {
    const response = await password({ newPassword: 'FICTIONAL_REPLACEMENT_PASSWORD' }, { cookie: 'FICTIONAL_VALID_COOKIE' });
    expect(response.status).toBe(403);
    expect((await member(A)).password_hash).toBe('FICTIONAL_HASH_A');
    expect((await member(B)).password_hash).toBe('FICTIONAL_HASH_B');
  });

  it('denies Safari header-only password mutation against a fictional member', async () => {
    const response = await password({ newPassword: 'FICTIONAL_REPLACEMENT_PASSWORD' }, { header: 'FICTIONAL_VALID_SAFARI' });
    expect(response.status).toBe(403);
    expect((await member(A)).password_hash).toBe('FICTIONAL_HASH_A');
  });

  it('falls back to a valid Safari header when an expired cookie is present', async () => {
    const response = await profile({ astrologyConsent: 'declined' }, {
      cookie: 'FICTIONAL_EXPIRED', header: 'FICTIONAL_VALID_SAFARI',
    });
    expect(response.status).toBe(200);
    expect((await member(A)).astrology_consent).toBe('declined');
  });
});
