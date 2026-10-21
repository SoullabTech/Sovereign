import { beforeEach, afterEach, describe, expect, it, jest } from '@jest/globals';
import { NextRequest } from 'next/server';

const mockQueryOne = jest.fn<(...args: unknown[]) => Promise<unknown>>();
const mockLimiter = jest.fn<(...args: unknown[]) => Promise<unknown>>();
const mockSend = jest.fn<(...args: unknown[]) => Promise<unknown>>();
jest.mock('@/lib/database/postgres', () => ({
  queryOne: (...args: unknown[]) => mockQueryOne(...args),
  query: jest.fn(),
}));
jest.mock('@/lib/auth/rateLimiter', () => ({
  checkRateLimit: (...args: unknown[]) => mockLimiter(...args),
  getClientIP: jest.fn(() => '192.0.2.19'),
  buildRateLimitHeaders: jest.fn(() => ({ 'Retry-After': '90' })),
}));
jest.mock('@/lib/email/sendEmail', () => ({
  sendEmail: (...args: unknown[]) => mockSend(...args),
}));
jest.mock('@/lib/auth/verifiedAccess', () => ({
  deriveVerifiedAccess: jest.fn(),
}));
import { POST } from '../route';
const request = (body: unknown) => new NextRequest('https://soullab.life/api/feedback', {
  method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body),
});
const payload = { category: 'problem', message: 'A private feedback note <sensitive> & personal', userName: 'Person <script>' };
const ORIGINAL = { ...process.env };
beforeEach(() => {
  mockQueryOne.mockReset();
  mockLimiter.mockReset();
  mockSend.mockReset();
  mockQueryOne.mockResolvedValue({ id: 42 });
  mockLimiter.mockResolvedValue({ allowed: true });
  mockSend.mockResolvedValue({ success: true, id: 'msg-1' });
  process.env.TWILIO_ACCOUNT_SID = 'mock-sid';
  process.env.TWILIO_AUTH_TOKEN = 'mock-token';
  process.env.TWILIO_FROM_NUMBER = '+12025550111';
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => {
  process.env = { ...ORIGINAL };
  jest.restoreAllMocks();
});
describe('F2: public feedback has no cost-bearing SMS egress', () => {
  it('rate-limits before persistence or notification', async () => {
    mockLimiter.mockResolvedValue({ allowed: false });
    const network = jest.spyOn(global, 'fetch');
    const response = await POST(request(payload));
    expect(response.status).toBe(429);
    expect(mockQueryOne).not.toHaveBeenCalled();
    expect(mockSend).not.toHaveBeenCalled();
    expect(network).not.toHaveBeenCalled();
    expect(mockLimiter).toHaveBeenCalledWith('192.0.2.19', 'ip', '/api/feedback:post');
  });
  it('accepts feedback without Twilio even if credentials are present', async () => {
    const network = jest.spyOn(global, 'fetch');
    const response = await POST(request(payload));
    expect(response.status).toBe(200);
    expect(mockQueryOne).toHaveBeenCalledTimes(1);
    expect(mockSend).toHaveBeenCalledTimes(1);
    expect(network).not.toHaveBeenCalled();
    const outgoing = mockSend.mock.calls[0][0] as { html: string };
    expect(outgoing.html).toContain('&lt;sensitive&gt;');
    expect(outgoing.html).not.toContain('<script>');
  });
  it('does not print submitted feedback or identifying name to container logs', async () => {
    await POST(request(payload));
    const traces = [jest.mocked(console.log).mock.calls, jest.mocked(console.warn).mock.calls,
      jest.mocked(console.error).mock.calls].flat();
    const text = JSON.stringify(traces);
    expect(text).not.toContain('private feedback note');
    expect(text).not.toContain('Person <script>');
  });
});
