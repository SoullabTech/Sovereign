/**
 * STUDIO-A-LA-CARTE-01 Phase 3 — the doorway sign-up API. The invitation is the gate, enforced here.
 */
const query = jest.fn();
const txQuery = jest.fn();
jest.mock('@/lib/db/postgres', () => ({
  query: (...a: unknown[]) => query(...a),
  transaction: async (cb: (tx: { query: typeof txQuery }) => unknown) => cb({ query: txQuery }),
}));
jest.mock('@/lib/auth/passwordUtils', () => ({ hashPassword: async () => 'hashed' }));
const createSession = jest.fn();
jest.mock('@/lib/auth/serverSessions', () => ({
  createSession: (...a: unknown[]) => createSession(...a),
  setSessionCookie: jest.fn(),
  setAccessCookies: jest.fn(),
}));
const logAuthEvent = jest.fn();
jest.mock('@/lib/security/authAudit', () => ({ logAuthEvent: (...a: unknown[]) => logAuthEvent(...a) }));

import { NextRequest } from 'next/server';
import { POST as register } from '@/app/api/doorway/register/route';
import { POST as check } from '@/app/api/doorway/check/route';
import { hashInvitedEmail } from '@/lib/studios/doorwayInvitations';

const post = (url: string, body: unknown) =>
  new NextRequest(`https://writer.soullab.life${url}`, { method: 'POST', body: JSON.stringify(body) });
const good = { studio: 'writer', code: 'WRITER-7KQ2-M9XD-4HTP', name: 'Ada', email: 'ada@example.com', password: 'longenough' };

const saved = process.env.STUDIO_DOORWAYS_ENABLED;
beforeEach(() => {
  jest.resetAllMocks();
  process.env.STUDIO_DOORWAYS_ENABLED = 'true';
  query.mockResolvedValue({ rows: [] });
  createSession.mockResolvedValue({ sessionToken: 't', expiresAt: new Date(Date.now() + 1e6) });
});
afterAll(() => {
  if (saved === undefined) delete process.env.STUDIO_DOORWAYS_ENABLED;
  else process.env.STUDIO_DOORWAYS_ENABLED = saved;
});

it('⭐ switch off: both routes 404 and touch nothing', async () => {
  delete process.env.STUDIO_DOORWAYS_ENABLED;
  expect((await register(post('/api/doorway/register', good))).status).toBe(404);
  expect((await check(post('/api/doorway/check', good))).status).toBe(404);
  expect(query).not.toHaveBeenCalled();
  expect(txQuery).not.toHaveBeenCalled();
});

it('⭐ a code that does not claim refuses with 403 and creates no member', async () => {
  txQuery.mockImplementation(async (sql: string) => (sql.includes('UPDATE studio_doorway_invitations') ? { rows: [] } : { rows: [] }));
  const res = await register(post('/api/doorway/register', good));
  expect(res.status).toBe(403);
  expect(txQuery.mock.calls.some(([sql]) => String(sql).includes('INSERT INTO members'))).toBe(false);
  expect(createSession).not.toHaveBeenCalled();
});

it('the claim is scoped to this studio and the hashed code, never the raw code', async () => {
  txQuery.mockResolvedValue({ rows: [] });
  await register(post('/api/doorway/register', good));
  const [, params] = txQuery.mock.calls[0];
  expect(params[1]).toBe('writer');
  expect(params[0]).toMatch(/^[0-9a-f]{64}$/);
  expect(JSON.stringify(txQuery.mock.calls)).not.toContain('7KQ2');
});

it('⭐ the claim is bound to the invited email (hash only), so a code cannot claim someone else\'s address', async () => {
  txQuery.mockResolvedValue({ rows: [] });
  await register(post('/api/doorway/register', { ...good, email: ' Ada@Example.com ' }));
  const [sql, params] = txQuery.mock.calls[0];
  expect(String(sql)).toContain('email_sha256 = $3');
  expect(params[2]).toBe(hashInvitedEmail('ada@example.com'));
  expect(JSON.stringify(txQuery.mock.calls)).not.toContain('ada@example.com');
});

it('a code used with a different email is refused, says why, and creates no member', async () => {
  txQuery.mockImplementation(async (_sql: string, p: unknown[]) =>
    String(_sql).includes('UPDATE studio_doorway_invitations') && p[2] === hashInvitedEmail('ada@example.com')
      ? { rows: [{ id: 7 }] } : { rows: [] });
  const res = await register(post('/api/doorway/register', { ...good, email: 'someone.else@example.com' }));
  expect(res.status).toBe(403);
  expect((await res.json()).error).toMatch(/email address your invitation was sent to/);
  expect(txQuery.mock.calls.some(([sql]) => String(sql).includes('INSERT INTO members'))).toBe(false);
});

it('an unknown studio is refused before any lookup', async () => {
  const res = await register(post('/api/doorway/register', { ...good, studio: 'maia' }));
  expect(res.status).toBe(403);
  expect(query).not.toHaveBeenCalled();
});

it('an email that already has an account is sent to sign in, not forked', async () => {
  query.mockResolvedValue({ rows: [{ id: 'existing' }] });
  const res = await register(post('/api/doorway/register', good));
  expect(res.status).toBe(409);
  expect((await res.json()).signIn).toBe(true);
  expect(txQuery).not.toHaveBeenCalled();
});

it('a good code creates a normal member, records the door, and sends them to the Studio', async () => {
  txQuery.mockImplementation(async (sql: string) => {
    if (sql.includes('UPDATE studio_doorway_invitations')) return { rows: [{ id: 7 }] };
    if (sql.includes('INSERT INTO members')) return { rows: [{ id: 'm1', username: 'ada', name: 'Ada', tier: 'free', roles: ['member'] }] };
    return { rows: [] };
  });
  const res = await register(post('/api/doorway/register', good));
  expect(res.status).toBe(200);
  const body = await res.json();
  expect(body.next).toBe('/writers-studio');
  const memberInsert = txQuery.mock.calls.find(([sql]) => String(sql).includes('INSERT INTO members'))!;
  expect(memberInsert[1][0]).toMatch(/^STUDIO-WRITER-[A-Z2-9]{8}$/);
  expect(txQuery.mock.calls.some(([sql, p]) => String(sql).includes('studio_doorway_redemptions') && p[0] === 7 && p[1] === 'm1' && p[2] === 'writer')).toBe(true);
  expect(body.signedIn).toBe(true);
  expect(logAuthEvent).toHaveBeenCalledWith(expect.objectContaining({ action: 'register_success', memberId: 'm1' }), expect.anything());
});

it('⭐ account created but session failed: reports signedIn false and sends them to sign in, not to the Studio', async () => {
  txQuery.mockImplementation(async (sql: string) => {
    if (sql.includes('UPDATE studio_doorway_invitations')) return { rows: [{ id: 7 }] };
    if (sql.includes('INSERT INTO members')) return { rows: [{ id: 'm1', username: 'ada', name: 'Ada', tier: 'free', roles: ['member'] }] };
    return { rows: [] };
  });
  createSession.mockRejectedValue(new Error('sessions down'));
  const res = await register(post('/api/doorway/register', good));
  expect(res.status).toBe(200);
  const body = await res.json();
  expect(body.signedIn).toBe(false);
  expect(body.session).toBeUndefined();
  expect(body.next).toBe('/signin?next=%2Fwriters-studio');
});

it('check answers only { valid } and never takes a use', async () => {
  query.mockResolvedValue({ rows: [{ ok: 1 }] });
  const res = await check(post('/api/doorway/check', { studio: 'writer', code: good.code }));
  expect(await res.json()).toEqual({ valid: true });
  expect(String(query.mock.calls[0][0])).toMatch(/^\s*SELECT/);
});

describe('an invitation that carries a Writer\'s Studio beta grant (founder choice 2026-11-13)', () => {
  const until = new Date('2027-11-13T23:59:59Z');
  const claimWith = (row: Record<string, unknown>) =>
    txQuery.mockImplementation(async (sql: string) => {
      if (sql.includes('UPDATE studio_doorway_invitations')) return { rows: [{ id: 7, ...row }] };
      if (sql.includes('INSERT INTO members')) return { rows: [{ id: 'm1', username: 'ada', name: 'Ada', tier: 'free', roles: ['member'] }] };
      return { rows: [] };
    });

  it('⭐ writes the dated grant in the same transaction, attributed to the issuer, and reports its end date', async () => {
    claimWith({ beta_grant_until: until, beta_grant_cohort: 'beta-2026', issuer_member_id: 'f1' });
    const res = await register(post('/api/doorway/register', good));
    expect(res.status).toBe(200);
    const grant = txQuery.mock.calls.find(([sql]) => String(sql).includes('INSERT INTO writers_studio_beta_grant_events'));
    expect(grant).toBeDefined();
    expect(grant![1]).toEqual(['m1', until, 'beta-2026', 'f1', 'Studio doorway invitation #7']);
    expect((await res.json()).betaGrantUntil).toBe(until.toISOString());
  });

  it('an invitation without a grant writes none', async () => {
    claimWith({ beta_grant_until: null, beta_grant_cohort: null, issuer_member_id: null });
    const res = await register(post('/api/doorway/register', good));
    expect(res.status).toBe(200);
    expect(txQuery.mock.calls.some(([sql]) => String(sql).includes('writers_studio_beta_grant_events'))).toBe(false);
    expect((await res.json()).betaGrantUntil).toBeNull();
  });

  it('⭐ only Writer\'s Studio invitations can carry it (another studio never writes a Writer grant)', async () => {
    claimWith({ beta_grant_until: until, beta_grant_cohort: null, issuer_member_id: 'f1' });
    await register(post('/api/doorway/register', { ...good, studio: 'sound' }));
    expect(txQuery.mock.calls.some(([sql]) => String(sql).includes('writers_studio_beta_grant_events'))).toBe(false);
  });

  it('the claim refuses an invitation whose grant date has already passed', async () => {
    txQuery.mockResolvedValue({ rows: [] });
    await register(post('/api/doorway/register', good));
    expect(String(txQuery.mock.calls[0][0])).toContain('beta_grant_until IS NULL OR beta_grant_until > now()');
  });
});

