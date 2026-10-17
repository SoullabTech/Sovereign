/**
 * RF01 S0-B physical PostgreSQL 16: disposable fictional identities ONLY.
 * The harness refuses every other DB URL and requires explicit opt-in.
 */
import { describe, it, expect, beforeAll, beforeEach, afterAll, jest } from '@jest/globals';
import { NextRequest } from 'next/server';
import { randomUUID } from 'node:crypto';
const A = '11111111-1111-4111-8111-111111111111';
const B = '22222222-2222-4222-8222-222222222222';
const S = 's0b-member-a';
const u = new URL(process.env.DATABASE_URL || 'postgresql://invalid:invalid@localhost/');
if (process.env.RF01_S0B_PG16 !== '1' ||
    u.hostname !== '127.0.0.1' || u.port !== '55472' ||
    u.pathname !== '/rf01_s0b_fixture' || u.username !== 'rf01') {
  throw new Error('RF01 S0B refuses every non-disposable PostgreSQL database');
}
jest.mock('@/lib/auth/getMemberFromRequest', () => ({
  getMemberIdFromRequest: async (req: NextRequest) =>
    req.headers.get('x-session-token') === 'fictional-a' ? A :
    req.headers.get('x-session-token') === 'fictional-b' ? B : null,
  getMemberIdFromSessionToken: async (token: string) =>
    token === 'fictional-a' ? A : token === 'fictional-b' ? B : null,
}));
import { query, closePool } from '@/lib/db/postgres';
import { POST } from '@/app/api/sovereign/privacy/turn-consent/route';
import { verifyExplicitTurnConsent, EXPLICIT_PREFLIGHT_SOURCE } from '../explicitTurnConsent';

const req = (body: unknown, actor = 'fictional-a') => new NextRequest(
  'https://soullab.life/api/sovereign/privacy/turn-consent',
  { method: 'POST', headers: {
      'x-session-token': actor, 'Content-Type': 'application/json',
    }, body: JSON.stringify(body) },
);
const input = (privacyChoice: 'continuity'|'sanctuary', exchangeId = randomUUID()) => ({
  memberId: A, sessionId: S, exchangeId, privacyChoice,
  explicitChoice: true,
  ...(privacyChoice === 'continuity' ? { explicitRemembrance: true } : {}),
});
beforeAll(async () => {
  const check = await query<{ db: string; version: number }>(
    "SELECT current_database() AS db, current_setting('server_version_num')::integer AS version",
  );
  expect(check.rows[0].db).toBe('rf01_s0b_fixture');
  expect(check.rows[0].version).toBeGreaterThanOrEqual(160000);
});
beforeEach(async () => {
  await query('DELETE FROM runtime_consent_state');
});
afterAll(async () => { await closePool(); });

describe('RF01 physically verified pre-Send consent', () => {
  it('mints an authenticated normal turn only after explicit remembrance', async () => {
    const body = input('continuity');
    const res = await POST(req(body));
    expect(res.status).toBe(200);
    const record = await query<{ member_id: string; session_id: string; posture: string; resolved_from: string }>(
      'SELECT member_id, session_id, posture, resolved_from FROM runtime_consent_state WHERE request_id=$1',
      [body.exchangeId],
    );
    expect(record.rows[0]).toMatchObject({
      member_id: A, session_id: S, posture: 'normal',
      resolved_from: EXPLICIT_PREFLIGHT_SOURCE,
    });
    expect(await verifyExplicitTurnConsent({
      memberId: A, sessionId: S, exchangeId: body.exchangeId, sanctuary: false,
    })).toEqual({ok: true});
  });
  it('mints a protected turn without granting remembrance', async () => {
    const body = input('sanctuary');
    expect((await POST(req(body))).status).toBe(200);
    expect(await verifyExplicitTurnConsent({
      memberId: A, sessionId: S, exchangeId: body.exchangeId, sanctuary: true,
    })).toEqual({ok: true});
    expect(await verifyExplicitTurnConsent({
      memberId: A, sessionId: S, exchangeId: body.exchangeId, sanctuary: false,
    })).toMatchObject({ok:false,code:'CONSENT_IDENTITY_CONFLICT'});
  });
  it('unverified default / missing explicit choice causes no write', async () => {
    const body = {...input('continuity'), explicitChoice: false};
    expect((await POST(req(body))).status).toBe(428);
    const res=await query<{ count: string }>('SELECT COUNT(*)::text AS count FROM runtime_consent_state');
    expect(res.rows[0].count).toBe('0');
  });
  it('foreign member cannot mint consent against someone else session', async () => {
    const body = {...input('sanctuary'), sessionId: 's0b-member-b'};
    expect((await POST(req(body))).status).toBe(409);
    const res=await query<{ count: string }>('SELECT COUNT(*)::text AS count FROM runtime_consent_state');
    expect(res.rows[0].count).toBe('0');
  });
  it('identical retry cannot mint a second record', async () => {
    const body = input('sanctuary');
    expect((await POST(req(body))).status).toBe(200);
    expect((await POST(req(body))).status).toBe(200);
    const res=await query<{ count: string }>(
      'SELECT COUNT(*)::text AS count FROM runtime_consent_state WHERE request_id=$1',
      [body.exchangeId]);
    expect(res.rows[0].count).toBe('1');
  });
  it('contradictory retry fails and leaves original custody untouched', async () => {
    const body = input('sanctuary');
    expect((await POST(req(body))).status).toBe(200);
    const conflicting = { ...body, privacyChoice: 'continuity', explicitRemembrance: true };
    expect((await POST(req(conflicting))).status).toBe(409);
    const res=await query<{ posture: string }>(
      'SELECT posture FROM runtime_consent_state WHERE request_id=$1', [body.exchangeId]);
    expect(res.rows[0].posture).toBe('sanctuary');
  });
  it('unrelated audit-only consent never authorizes a normal Send', async () => {
    const exchangeId=randomUUID();
    await query(
      'INSERT INTO runtime_consent_state(request_id,member_id,session_id,posture,resolved_from) '+
      'VALUES ($1,$2,$3,$4,$5)',
      [exchangeId,A,S,'normal','request-meta']);
    expect(await verifyExplicitTurnConsent({
      memberId:A,sessionId:S,exchangeId,sanctuary:false,
    })).toMatchObject({ok:false,code:'CONSENT_IDENTITY_CONFLICT'});
  });
  it('stale record cannot be refreshed by repeating the same preflight', async () => {
    const exchangeId=randomUUID();
    await query(
      'INSERT INTO runtime_consent_state(request_id,member_id,session_id,posture,resolved_from,resolved_at) '+
      'VALUES ($1,$2,$3,$4,$5,NOW()-interval \'2 hours\')',
      [exchangeId,A,S,'normal',EXPLICIT_PREFLIGHT_SOURCE]);
    expect((await POST(req(input('continuity',exchangeId)))).status).toBe(503);
    expect(await verifyExplicitTurnConsent({
      memberId:A,sessionId:S,exchangeId,sanctuary:false,
    })).toMatchObject({ok:false,code:'CONSENT_RECEIPT_EXPIRED'});
  });
});
