import { describe, it, expect, beforeEach, jest } from '@jest/globals';
const A = '11111111-1111-4111-8111-111111111111';
const B = '22222222-2222-4222-8222-222222222222';
const S = 'fictional-session-a';
const X = '44444444-4444-4444-8444-444444444444';

type ConsentRow = {
  member_id: string; session_id: string; posture: string;
  resolved_from: string; resolved_at: Date;
};
const records = new Map<string, ConsentRow>();
const mockQuery = jest.fn<(sql: string, params: unknown[]) => Promise<{rows: unknown[]}>>();
jest.mock('@/lib/db/postgres', () => ({
  query: (sql: string, params: unknown[]) => mockQuery(sql, params),
}));
import {
  establishExplicitTurnConsent, verifyExplicitTurnConsent,
  validExchangeId, EXPLICIT_PREFLIGHT_SOURCE, MAX_PREFLIGHT_AGE_MS,
} from '../explicitTurnConsent';

beforeEach(() => {
  records.clear();
  mockQuery.mockReset();
  mockQuery.mockImplementation(async (sql, params) => {
    const id = String(params[0]);
    if (sql.includes('INSERT INTO runtime_consent_state')) {
      if (records.has(id)) return { rows: [] };
      records.set(id, {
        member_id: String(params[1]), session_id: String(params[2]),
        posture: String(params[3]), resolved_from: String(params[4]),
        resolved_at: new Date(),
      });
      return { rows: [{ request_id: id }] };
    }
    if (sql.includes('FROM runtime_consent_state')) {
      const r = records.get(id);
      return { rows: r ? [r] : [] };
    }
    throw new Error('FICTIONAL_UNEXPECTED_SQL');
  });
});

describe('RF01 explicit server-custodied turn consent', () => {
  it('requires a valid UUID exchange ID', () => {
    expect(validExchangeId(X)).toBe(true);
    expect(validExchangeId('fake-id')).toBe(false);
  });
  it('rejects implied Continuity before any database operation', async () => {
    const r = await establishExplicitTurnConsent({
      memberId:A, sessionId:S, exchangeId:X, privacyChoice:'continuity',
    });
    expect(r).toMatchObject({ok:false,code:'REMEMBRANCE_CONSENT_REQUIRED'});
    expect(mockQuery).not.toHaveBeenCalled();
  });
  it('records a fresh explicit Continuity choice, then verifies it', async () => {
    const r = await establishExplicitTurnConsent({
      memberId:A,sessionId:S,exchangeId:X,privacyChoice:'continuity',
      explicitRemembrance:true,
    });
    expect(r).toEqual({ok:true,sanctuary:false});
    expect(records.get(X)?.resolved_from).toBe(EXPLICIT_PREFLIGHT_SOURCE);
    expect(await verifyExplicitTurnConsent({
      memberId:A,sessionId:S,exchangeId:X,sanctuary:false,
    })).toEqual({ok:true});
  });
  it('allows a separately chosen Sanctuary turn without remembrance grant', async () => {
    const r = await establishExplicitTurnConsent({
      memberId:A,sessionId:S,exchangeId:X,privacyChoice:'sanctuary',
    });
    expect(r).toEqual({ok:true,sanctuary:true});
    expect(await verifyExplicitTurnConsent({
      memberId:A,sessionId:S,exchangeId:X,sanctuary:true,
    })).toEqual({ok:true});
  });
  it('absent preflight never means ordinary', async () => {
    expect(await verifyExplicitTurnConsent({
      memberId:A,sessionId:S,exchangeId:X,sanctuary:false,
    })).toMatchObject({ok:false,code:'CONSENT_RECEIPT_REQUIRED'});
  });
  it('cross-member, cross-session and changed-posture reuse fail', async () => {
    await establishExplicitTurnConsent({
      memberId:A,sessionId:S,exchangeId:X,privacyChoice:'sanctuary',
    });
    for (const next of [
      {memberId:B,sessionId:S,exchangeId:X,sanctuary:true},
      {memberId:A,sessionId:'other-session',exchangeId:X,sanctuary:true},
      {memberId:A,sessionId:S,exchangeId:X,sanctuary:false},
    ]) {
      expect(await verifyExplicitTurnConsent(next))
        .toMatchObject({ok:false,code:'CONSENT_IDENTITY_CONFLICT'});
    }
  });
  it('exact retry reuses the first immutable receipt', async () => {
    const args={memberId:A,sessionId:S,exchangeId:X,privacyChoice:'continuity' as const,explicitRemembrance:true};
    expect((await establishExplicitTurnConsent(args)).ok).toBe(true);
    expect((await establishExplicitTurnConsent(args)).ok).toBe(true);
    expect(records.size).toBe(1);
  });
  it('a conflicting request cannot reclassify a prior receipt', async () => {
    await establishExplicitTurnConsent({
      memberId:A,sessionId:S,exchangeId:X,privacyChoice:'sanctuary',
    });
    const r=await establishExplicitTurnConsent({
      memberId:A,sessionId:S,exchangeId:X,privacyChoice:'continuity',
      explicitRemembrance:true,
    });
    expect(r).toMatchObject({ok:false,code:'CONSENT_IDENTITY_CONFLICT'});
  });
  it('audit-only request-meta receipts are not explicit choices', async () => {
    records.set(X,{member_id:A,session_id:S,posture:'normal',
      resolved_from:'request-meta',resolved_at:new Date()});
    expect(await verifyExplicitTurnConsent({
      memberId:A,sessionId:S,exchangeId:X,sanctuary:false,
    })).toMatchObject({ok:false,code:'CONSENT_IDENTITY_CONFLICT'});
  });
  it('old consent receipts do not authorize a new delayed Send', async () => {
    records.set(X,{member_id:A,session_id:S,posture:'normal',
      resolved_from:EXPLICIT_PREFLIGHT_SOURCE,
      resolved_at:new Date(Date.now()-MAX_PREFLIGHT_AGE_MS-1000)});
    expect(await verifyExplicitTurnConsent({
      memberId:A,sessionId:S,exchangeId:X,sanctuary:false,
    })).toMatchObject({ok:false,code:'CONSENT_RECEIPT_EXPIRED'});
  });
  it('database errors fail closed, without processing a turn', async () => {
    mockQuery.mockImplementation(async()=>{throw new Error('FICTIONAL_POSTGRES_DOWN')});
    expect(await establishExplicitTurnConsent({
      memberId:A,sessionId:S,exchangeId:X,privacyChoice:'sanctuary',
    })).toMatchObject({ok:false,code:'CONSENT_UNAVAILABLE'});
    expect(await verifyExplicitTurnConsent({
      memberId:A,sessionId:S,exchangeId:X,sanctuary:true,
    })).toMatchObject({ok:false,code:'CONSENT_UNAVAILABLE'});
  });
});
