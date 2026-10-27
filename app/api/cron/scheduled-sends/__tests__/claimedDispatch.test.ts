import { beforeEach, afterEach, describe, expect, it, jest } from '@jest/globals';
import { NextRequest } from 'next/server';
const dbQuery = jest.fn<(...args: unknown[]) => Promise<any>>();
const mockSend = jest.fn<(...args: unknown[]) => Promise<any>>();
jest.mock('@/lib/db/postgres', () => ({
  __esModule: true,
  default: { query: (...args: unknown[]) => dbQuery(...args) },
}));
jest.mock('@/lib/comms/emailRouter', () => ({
  EmailRouter: jest.fn().mockImplementation(() => ({
    send: (...args: unknown[]) => mockSend(...args),
  })),
}));
import { GET } from '../route';
const ENV = { ...process.env };
const claim = {
  id: 'aaaa', claim_token: 'claimed-token', practitioner_id: 'practitioner',
  recipient_email: 'member@example.invalid', subject: 'Synthetic reminder',
  body: 'Synthetic content', practitioner_name: 'Operator',
  practitioner_email: 'operator@example.invalid',
};
const req = (authorized = true) => new NextRequest(
  'https://soullab.life/api/cron/scheduled-sends', {
    headers: authorized ? { authorization: 'Bearer test-cron-secret' } : {},
  }
);
beforeEach(() => {
  process.env.CRON_SECRET = 'test-cron-secret';
  process.env.NODE_ENV = 'test';
  dbQuery.mockReset();
  mockSend.mockReset();
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});
afterEach(() => {
  process.env = ENV;
  jest.restoreAllMocks();
});
describe('F3: no duplicate or unsanctioned scheduled mail', () => {
  it('refuses unauthenticated cron without touching queued records', async () => {
    const r = await GET(req(false));
    expect(r.status).toBe(401);
    expect(dbQuery).not.toHaveBeenCalled();
    expect(mockSend).not.toHaveBeenCalled();
  });
  it('does not send any row if the atomic claim returns none', async () => {
    dbQuery.mockResolvedValue({ rows: [] });
    const r = await GET(req());
    expect(r.status).toBe(200);
    expect((await r.json()).processed).toBe(0);
    expect(dbQuery.mock.calls[0][0]).toContain('FOR UPDATE SKIP LOCKED');
    expect(dbQuery.mock.calls[0][0]).toContain("status = 'sending'");
    expect(mockSend).not.toHaveBeenCalled();
  });
  it('settles only an owner-held claim after SMTP acceptance', async () => {
    dbQuery.mockResolvedValueOnce({ rows: [claim] })
      .mockResolvedValueOnce({ rowCount: 1, rows: [{ id: claim.id }] });
    mockSend.mockResolvedValueOnce({ success: true, id: 'smtp-message-1', provider: 'managed' });
    const r = await GET(req());
    expect(r.status).toBe(200);
    expect((await r.json()).sent).toBe(1);
    expect(mockSend).toHaveBeenCalledTimes(1);
    const settlement = String(dbQuery.mock.calls[1][0]);
    expect(settlement).toContain('claim_token = $2');
    expect(settlement).toContain("status = 'sending'");
    expect(dbQuery.mock.calls[1][1]).toEqual(['aaaa', 'claimed-token', 'managed', 'smtp-message-1']);
  });
  it('quarantines a provider refusal and never retries the same claim', async () => {
    dbQuery.mockResolvedValueOnce({ rows: [claim] })
      .mockResolvedValueOnce({ rowCount: 1 });
    mockSend.mockResolvedValueOnce({ success: false, failureKind: 'provider_error' });
    const r = await GET(req());
    expect((await r.json()).failed).toBe(1);
    expect(String(dbQuery.mock.calls[1][0])).toContain("status = 'indeterminate'");
    expect(mockSend).toHaveBeenCalledTimes(1);
  });
  it('does not claim success if the settlement lost its lease', async () => {
    dbQuery.mockResolvedValueOnce({ rows: [claim] })
      .mockResolvedValueOnce({ rowCount: 0, rows: [] });
    mockSend.mockResolvedValueOnce({ success: true, id: 'accepted-but-lease-lost', provider: 'managed' });
    const r = await GET(req());
    expect((await r.json()).sent).toBe(0);
    expect((await Promise.resolve(mockSend.mock.calls)).length).toBe(1);
  });
});
