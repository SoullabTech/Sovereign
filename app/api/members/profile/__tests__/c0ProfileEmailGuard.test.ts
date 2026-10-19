/** C0 isolated fictional account regression: current email is not profile-editable. */
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { NextRequest } from 'next/server';

const SESSION_MEMBER = '11111111-1111-4111-8111-111111111111';
const WRONG_MEMBER = '22222222-2222-4222-8222-222222222222';
const mockCookieSession: { value: string | null } = { value: null };
const mockCookieMember: { value: string | null } = { value: null };

jest.mock('next/headers', () => ({
  cookies: async () => ({
    get: (key: string) => {
      if (key === 'maia_session' && mockCookieSession.value) return { value: mockCookieSession.value };
      if (key === 'maia_member_id' && mockCookieMember.value) return { value: mockCookieMember.value };
      return undefined;
    },
  }),
}));

const mockQuery = jest.fn<(sql: string, args?: unknown[]) => Promise<{ rows: unknown[]; rowCount: number }>>();
jest.mock('@/lib/db/postgres', () => ({
  query: (sql: string, args?: unknown[]) => mockQuery(sql, args),
}));
jest.mock('@/lib/youth/youthAdmissionGate', () => ({
  checkYouthAdmission: () => ({ ok: true }),
}));

import { PUT } from '../route';

function request(body: unknown, token?: string, memberClaim?: string): NextRequest {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['x-session-token'] = token; // Safari/iPhone ITP fallback
  if (memberClaim) headers['x-member-id'] = memberClaim;
  return new NextRequest('https://example.invalid/api/members/profile', {
    method: 'PUT', headers, body: JSON.stringify(body),
  });
}
function writes() {
  return mockQuery.mock.calls.filter(([sql]) => /UPDATE\s+members/i.test(sql));
}
beforeEach(() => {
  mockCookieSession.value = null;
  mockCookieMember.value = null;
  mockQuery.mockReset();
  mockQuery.mockImplementation(async (sql, args) => {
    if (/FROM\s+auth_sessions/i.test(sql)) {
      const token = String(args?.[0] || '');
      return { rows: ['fictional-cookie-token', 'fictional-safari-token'].includes(token) ? [{ member_id: SESSION_MEMBER }] : [], rowCount: 1 };
    }
    if (/UPDATE\s+members/i.test(sql)) {
      return { rows: [{ id: SESSION_MEMBER, name: 'Fictional Member', email: 'on-file@example.invalid' }], rowCount: 1 };
    }
    throw new Error('Unexpected database statement in fictional C0 test');
  });
});

describe('C0 member profile — email not writable', () => {
  it.each([
    ['replacement', { email: 'attacker@example.invalid' }],
    ['null', { email: null }],
    ['empty', { email: '' }],
    ['unchanged', { email: 'on-file@example.invalid' }],
    ['mixed', { email: 'replacement@example.invalid', name: 'Must not be saved' }],
    ['mixed birth data', { email: null, birthData: { date: '1984-04-04' } }],
  ])('rejects an explicit %s email property without any member update', async (_label, body) => {
    mockCookieSession.value = 'fictional-cookie-token';
    const response = await PUT(request(body));
    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toMatchObject({ code: 'EMAIL_CHANGE_REQUIRES_VERIFICATION' });
    expect(writes()).toHaveLength(0);
  });

  it('saves ordinary profile fields using a cookie-backed desktop session', async () => {
    mockCookieSession.value = 'fictional-cookie-token';
    const response = await PUT(request({ name: 'Fictional Member', preferredName: 'Fictional', bio: 'Synthetic only' }));
    expect(response.status).toBe(200);
    expect(writes()).toHaveLength(1);
    expect(writes()[0][0]).not.toMatch(/\bemail\s*=/i);
    expect(writes()[0][1]).toContain(SESSION_MEMBER);
  });

  it('preserves Safari/iPhone header-session profile updates and birth data', async () => {
    const response = await PUT(request({ birthData: { date: '1984-04-04' } }, 'fictional-safari-token'));
    expect(response.status).toBe(200);
    expect(writes()).toHaveLength(1);
    expect(writes()[0][0]).not.toMatch(/\bemail\s*=/i);
  });

  it('saves astrology consent without writing account email', async () => {
    mockCookieSession.value = 'fictional-cookie-token';
    const response = await PUT(request({ astrologyConsent: 'declined' }));
    expect(response.status).toBe(200);
    expect(writes()).toHaveLength(1);
    expect(writes()[0][0]).not.toMatch(/\bemail\s*=/i);
  });

  it('denies revoked or fake sessions before account changes', async () => {
    const response = await PUT(request({ name: 'Should not be saved' }, 'invalid-session-token'));
    expect(response.status).toBe(401);
    expect(writes()).toHaveLength(0);
  });

  it('rejects caller-claimed member mismatch even with a valid session', async () => {
    const response = await PUT(request({ name: 'No impersonation' }, 'fictional-safari-token', WRONG_MEMBER));
    expect(response.status).toBe(401);
    expect(writes()).toHaveLength(0);
  });

  it('rejects malformed non-object payload without partial writes', async () => {
    mockCookieSession.value = 'fictional-cookie-token';
    for (const body of [null, [], 'string']) {
      const response = await PUT(request(body));
      expect(response.status).toBe(400);
    }
    expect(writes()).toHaveLength(0);
  });
});
