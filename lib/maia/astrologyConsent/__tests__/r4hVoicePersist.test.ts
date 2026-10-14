import { NextRequest } from 'next/server';
import { POST } from '@/app/api/voice/persist/route';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { assertR4gOrdinarySession, R4gSessionHeld } from '../r4gOrdinarySessionGate';
import { TurnsStore } from '@/lib/memory/stores/TurnsStore';
import { ensureSession, addConversationExchange } from '@/lib/sovereign/sessionManager';
import { cookies } from 'next/headers';

jest.mock('@/lib/auth/getMemberFromRequest', () => ({ getMemberIdFromRequest: jest.fn() }));
jest.mock('../r4gOrdinarySessionGate', () => {
  class Held extends Error {}
  return { R4gSessionHeld: Held, assertR4gOrdinarySession: jest.fn() };
});
jest.mock('@/lib/memory/stores/TurnsStore', () => ({
  TurnsStore: { addExchange: jest.fn(), addTurn: jest.fn() },
}));
jest.mock('@/lib/sovereign/sessionManager', () => ({
  ensureSession: jest.fn(), addConversationExchange: jest.fn(),
}));
jest.mock('next/headers', () => ({ cookies: jest.fn() }));
jest.mock('@/lib/provenance/consentState', () => ({ recordConsentState: jest.fn() }));

const member = 'aaaaaaaa-0000-4000-8000-000000000001';
const auth = getMemberIdFromRequest as jest.Mock;
const guard = assertR4gOrdinarySession as jest.Mock;
const turns = TurnsStore.addExchange as jest.Mock;
const session = ensureSession as jest.Mock;
const persisted = addConversationExchange as jest.Mock;
const browserCookies = cookies as jest.Mock;

const request = (sessionId: string, claim: string = member) =>
  new NextRequest('http://localhost/api/voice/persist', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      userId: claim, sessionId, userMessage: 'FICTIONAL_MEMBER_TURN',
      assistantMessage: 'FICTIONAL_MAIA_RESPONSE',
    }),
  });

beforeEach(() => {
  auth.mockReset().mockResolvedValue(member);
  guard.mockReset().mockResolvedValue(undefined);
  turns.mockReset().mockResolvedValue(undefined);
  session.mockReset().mockResolvedValue({ id: 'fictional-ordinary' });
  persisted.mockReset().mockResolvedValue(undefined);
  browserCookies.mockReset().mockResolvedValue({ get: () => null });
});

describe('R4H authenticated voice write origin (fictional)', () => {
  it('refuses protected voice transcripts before session or memory writes', async () => {
    guard.mockRejectedValue(new R4gSessionHeld());
    const response = await POST(request('fictional-protected-session'));
    expect(response.status).toBe(403);
    expect(session).not.toHaveBeenCalled();
    expect(turns).not.toHaveBeenCalled();
    expect(persisted).not.toHaveBeenCalled();
  });
  it('rejects a stale claimed chart ID even if voice cookie is ordinary', async () => {
    browserCookies.mockResolvedValue({ get: (key: string) =>
      key === 'maia_sid' ? { value: 'ordinary-cookie-session' } : null });
    guard.mockRejectedValue(new R4gSessionHeld());
    const response = await POST(request('astrology-pro-preview-old'));
    expect(response.status).toBe(403);
    expect(guard).toHaveBeenCalledWith('ordinary-cookie-session', 'astrology-pro-preview-old');
    expect(session).not.toHaveBeenCalled();
  });
  it('preserves permitted ordinary voice conversation persistence', async () => {
    const response = await POST(request('ordinary-session'));
    expect(response.status).toBe(200);
    expect(guard).toHaveBeenCalledWith('ordinary-session', 'ordinary-session');
    expect(turns).toHaveBeenCalledTimes(1);
    expect(persisted).toHaveBeenCalledTimes(1);
    expect(session).toHaveBeenCalledTimes(1);
  });
  it('denies a forged member claim before touching private memory', async () => {
    const response = await POST(request('ordinary-session', 'other-member'));
    expect(response.status).toBe(403);
    expect(guard).not.toHaveBeenCalled();
    expect(turns).not.toHaveBeenCalled();
  });
  it('does not treat a missing security registry as permission', async () => {
    guard.mockRejectedValue(new Error('fictional security registry not installed'));
    const response = await POST(request('ordinary-session'));
    expect(response.status).toBe(503);
    expect(session).not.toHaveBeenCalled();
  });
});
