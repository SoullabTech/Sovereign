import { NextRequest } from 'next/server';
import { GET } from '@/app/api/conversation/turns/route';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { query } from '@/lib/db/postgres';
import { isR4fProtectedSessionById } from '../r4fGrantStore';

jest.mock('@/lib/auth/getMemberFromRequest', () => ({ getMemberIdFromRequest: jest.fn() }));
jest.mock('@/lib/db/postgres', () => ({ query: jest.fn() }));
jest.mock('../r4fGrantStore', () => ({ isR4fProtectedSessionById: jest.fn() }));
jest.mock('@/lib/memory/stores/TurnsStore', () => ({ TurnsStore: { addExchange: jest.fn() } }));

const memberA = 'aaaaaaaa-0000-4000-8000-000000000001';
const memberB = 'bbbbbbbb-0000-4000-8000-000000000002';
const auth = getMemberIdFromRequest as jest.Mock;
const db = query as jest.Mock;
const protectedCheck = isR4fProtectedSessionById as jest.Mock;

const getRequest = (claim: string, session = 'ordinary-session') =>
  new NextRequest('http://localhost/api/conversation/turns?sessionId=' +
    encodeURIComponent(session) + '&userId=' + encodeURIComponent(claim));

beforeEach(() => {
  auth.mockReset();
  db.mockReset();
  protectedCheck.mockReset();
  protectedCheck.mockResolvedValue(false);
});

describe('R4G exact server history admission (fictional members only)', () => {
  it('rejects cross-account session claims without loading content', async () => {
    auth.mockResolvedValue(memberB);
    const response = await GET(getRequest(memberA));
    expect(response.status).toBe(403);
    expect(db).not.toHaveBeenCalled();
    expect(protectedCheck).not.toHaveBeenCalled();
  });

  it('rejects already-protected and legacy Astrology sessions', async () => {
    auth.mockResolvedValue(memberA);
    protectedCheck.mockResolvedValue(true);
    expect((await GET(getRequest(memberA, 'protected-session'))).status).toBe(403);
    protectedCheck.mockClear();
    expect((await GET(getRequest(memberA, 'astrology-pro-preview-' + memberA))).status).toBe(403);
    expect(protectedCheck).not.toHaveBeenCalled();
    expect(db).not.toHaveBeenCalled();
  });

  it('returns ordinary same-member continuity with an authenticated scope assertion', async () => {
    auth.mockResolvedValue(memberA);
    db.mockResolvedValue({ rows: [{ id: 'fictional-1', role: 'user', content: 'FICTIONAL_HELLO' }] });
    const response = await GET(getRequest(memberA));
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toContain('no-store');
    const body = await response.json();
    expect(body.verifiedMemberId).toBe(memberA);
    expect(body.scope).toBe('ordinary');
    expect(body.messages).toHaveLength(1);
  });

  it('fails closed if the protected-session registry is unavailable', async () => {
    auth.mockResolvedValue(memberA);
    protectedCheck.mockRejectedValue(new Error('fictional registry offline'));
    const response = await GET(getRequest(memberA));
    expect(response.status).toBe(500);
    expect(db).not.toHaveBeenCalled();
  });
});
