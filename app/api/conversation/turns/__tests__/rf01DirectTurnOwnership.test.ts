/** RF01 S0-A2 — actual direct conversation-turn GET/POST with invented actors. */
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { NextRequest } from 'next/server';
const A = '11111111-1111-4111-8111-111111111111';
const B = '22222222-2222-4222-8222-222222222222';

const mockQuery = jest.fn<(...args: any[]) => Promise<any>>();
const mockOwnership = jest.fn<(sid: string, member: string) => Promise<void>>();
const mockAdd = jest.fn<(...args: any[]) => Promise<any>>();
jest.mock('@/lib/db/postgres', () => ({
  query: (...a: any[]) => mockQuery(...a),
}));
jest.mock('@/lib/auth/getMemberFromRequest', () => ({
  getMemberIdFromRequest: async (req: NextRequest) =>
    req.headers.get('x-session-token') === 'actor-a' ? A : null,
}));
jest.mock('@/lib/sovereign/memberSessionOwnership', () => {
  const actual = jest.requireActual<any>('@/lib/sovereign/memberSessionOwnership');
  return { ...actual, requireExistingOwnedSession: (id: string, actor: string) => mockOwnership(id, actor) };
});
jest.mock('@/lib/memory/stores/TurnsStore', () => ({
  TurnsStore: { addExchange: (...a: any[]) => mockAdd(...a) },
  ExchangeIdentityConflict: class ExchangeIdentityConflict extends Error {},
}));
jest.mock('@/lib/provenance/consentState', () => ({
  recordConsentState: jest.fn(),
}));
import { GET, POST } from '../route';
import { SessionOwnershipRefusal } from '@/lib/sovereign/memberSessionOwnership';

const req = (path: string, method = 'GET', body?: unknown, token = 'actor-a') =>
  new NextRequest('https://soullab.life' + path, {
    method,
    headers: {
      ...(token ? { 'x-session-token': token } : {}),
      ...(body ? { 'content-type': 'application/json' } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

beforeEach(() => {
  mockQuery.mockReset();
  mockOwnership.mockReset();
  mockAdd.mockReset();
  mockQuery.mockImplementation(async () => ({ rows: [] }));
  mockOwnership.mockImplementation(async id => {
    if (id === 'foreign') throw new SessionOwnershipRefusal('SESSION_NOT_OWNED');
  });
  mockAdd.mockImplementation(async () => undefined);
});

describe('direct session turn ownership', () => {
  it('refuses unauthenticated GET before any member data read', async () => {
    const res = await GET(req('/api/conversation/turns?sessionId=mine','GET',undefined,''));
    expect(res.status).toBe(401);
    expect(mockQuery).not.toHaveBeenCalled();
  });
  it('refuses foreign GET before reading transcript', async () => {
    const res = await GET(req('/api/conversation/turns?sessionId=foreign'));
    expect(res.status).toBe(409);
    expect(mockQuery).not.toHaveBeenCalled();
  });
  it('authorized session GET uses verified member plus session ID', async () => {
    const res = await GET(req('/api/conversation/turns?sessionId=mine'));
    expect(res.status).toBe(200);
    expect(mockOwnership).toHaveBeenCalledWith('mine', A);
    expect(mockQuery.mock.calls[0][1]).toEqual([A, 'mine']);
  });
  it('cross-session GET admits only rows from sessions owned by member', async () => {
    const res = await GET(req('/api/conversation/turns'));
    expect(res.status).toBe(200);
    expect(String(mockQuery.mock.calls[0][0])).toContain('maia_sessions.member_id = $1');
    expect(mockQuery.mock.calls[0][1]).toEqual([A]);
  });
  it('refuses foreign client POST before any turn persistence', async () => {
    const res = await POST(req('/api/conversation/turns','POST', {
      userId:A,sessionId:'foreign',userMessage:'fiction',assistantMessage:'fiction',
    }));
    expect(res.status).toBe(409);
    expect(mockAdd).not.toHaveBeenCalled();
  });
  it('refuses missing session ID for a persistent turn', async () => {
    const res = await POST(req('/api/conversation/turns','POST', {
      userId:A,userMessage:'fiction',assistantMessage:'fiction',
    }));
    expect(res.status).toBe(400);
    expect(mockAdd).not.toHaveBeenCalled();
  });
  it('owned regular client POST writes only under verified member', async () => {
    const res = await POST(req('/api/conversation/turns','POST', {
      userId:A,sessionId:'mine',userMessage:'fiction',assistantMessage:'fiction',
    }));
    expect(res.status).toBe(200);
    expect(mockOwnership).toHaveBeenCalledWith('mine', A);
    expect(mockAdd).toHaveBeenCalledTimes(1);
    expect(mockAdd.mock.calls[0][1]).toBe(A);
  });
  it('an owned Sanctuary POST cannot write a normal turn', async () => {
    const res = await POST(req('/api/conversation/turns','POST', {
      userId:A,sessionId:'mine',userMessage:'fiction',assistantMessage:'fiction',
      isSanctuary:true,
    }));
    expect(res.status).toBe(200);
    expect(mockAdd).not.toHaveBeenCalled();
  });
  it('reports missing persistence infrastructure as failed, not saved', async () => {
    mockAdd.mockImplementation(async () => {
      throw new Error('relation conversation_turns does not exist');
    });
    const res = await POST(req('/api/conversation/turns','POST', {
      userId:A,sessionId:'mine',userMessage:'fiction',assistantMessage:'fiction',
    }));
    expect(res.status).toBe(503);
    expect((await res.json()).success).toBe(false);
  });
  it('refuses foreign member claim before owner query', async () => {
    const res = await POST(req('/api/conversation/turns','POST', {
      userId:B,sessionId:'mine',userMessage:'fiction',assistantMessage:'fiction',
    }));
    expect(res.status).toBe(403);
    expect(mockOwnership).not.toHaveBeenCalled();
  });
});
