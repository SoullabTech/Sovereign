/**
 * The emailed "reset link" door is retired: POST /api/members/reset-password
 * must answer identically for every address, touch no data, send no mail and
 * log no address. Before this change a real member got a 502 (mail refused by
 * the managed boundary) while an unknown address got 200, which told any caller
 * whether an email belongs to a member.
 */
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import fs from 'fs';
import path from 'path';

type QueryResult = { rows: unknown[]; rowCount?: number };
const mockQuery = jest.fn<(sql: string, params?: unknown[]) => Promise<QueryResult>>();
jest.mock('@/lib/db/postgres', () => ({
  query: (sql: string, params?: unknown[]) => mockQuery(sql, params),
}));

const mockSendEmail = jest.fn<(...args: unknown[]) => Promise<unknown>>();
jest.mock('@/lib/email/sendEmail', () => ({
  sendEmail: (...args: unknown[]) => mockSendEmail(...args),
  SENDERS: { noreply: 'noreply@soullab.life' },
}));

jest.mock('@/lib/auth/rateLimiter', () => ({
  checkRateLimit: jest.fn(async () => ({ allowed: true })),
  getClientIP: jest.fn(() => '127.0.0.1'),
  buildRateLimitHeaders: jest.fn(() => ({})),
}));
jest.mock('@/lib/auth/passwordUtils', () => ({ hashPassword: jest.fn(async () => 'hashed') }));

import { NextRequest } from 'next/server';
import { POST } from '../reset-password/route';

const call = (email: unknown) =>
  POST(
    new NextRequest('http://localhost/api/members/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
      headers: { 'Content-Type': 'application/json' },
    })
  );

describe('POST /api/members/reset-password (retired)', () => {
  beforeEach(() => {
    mockQuery.mockReset();
    mockSendEmail.mockReset();
    // A member exists for this address; the old route would have used it.
    mockQuery.mockResolvedValue({ rows: [{ id: 'm-1', name: 'Someone', username: 'someone' }] });
  });

  it('answers identically for a member and a stranger', async () => {
    const a = await call('member@example.com');
    const b = await call('nobody@example.com');
    expect(a.status).toBe(200);
    expect(b.status).toBe(200);
    expect(await a.json()).toEqual(await b.json());
  });

  it('reads no member, writes no token and sends no mail', async () => {
    await call('member@example.com');
    expect(mockQuery).not.toHaveBeenCalled();
    expect(mockSendEmail).not.toHaveBeenCalled();
  });

  it('logs no email address', async () => {
    const spies = [jest.spyOn(console, 'log'), jest.spyOn(console, 'error'), jest.spyOn(console, 'warn')];
    await call('member@example.com');
    for (const s of spies) {
      expect(JSON.stringify(s.mock.calls)).not.toContain('member@example.com');
      s.mockRestore();
    }
  });

  it('points the caller at the sign-in code', async () => {
    const body = await (await call('member@example.com')).json();
    expect(body.signInPath).toBe('/signin?method=code');
  });

  it('the route source no longer sends mail or mints tokens', () => {
    const src = fs.readFileSync(path.resolve(__dirname, '../reset-password/route.ts'), 'utf8');
    expect(src).not.toMatch(/sendEmail\(/);
    expect(src).not.toMatch(/INSERT INTO password_reset_tokens/);
  });
});
