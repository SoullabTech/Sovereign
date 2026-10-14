import { query, transaction } from '@/lib/db/postgres';
import {
  issueR4fGrant, consumeR4fGrant, revokeR4fGrant, isR4fProtectedSession,
  R4fDenied,
} from '../r4fGrantStore';
import { sha256Exact, hmacPassageExact } from '../r4fPolicy';

jest.mock('@/lib/db/postgres', () => ({
  query: jest.fn(), transaction: jest.fn(),
}));
const mockQuery = query as jest.Mock;
const mockTransaction = transaction as jest.Mock;

const member = 'aaaaaaaa-0000-4000-8000-000000000001';
const text = 'FICTIONAL CHART: Mars in Virgo. What do I recognize?';

beforeEach(() => {
  process.env.ASTRO_R4F_PASSAGE_HMAC_KEY = 'fictional-test-secret-32-bytes-abcdefghijklmnopqrstuvwxyz';
  mockQuery.mockReset();
  mockTransaction.mockReset();
});

describe('R4F server-owned grant storage (fictional, mocked DB)', () => {
  it('issues only when current chart consent is opted in, saves digests only', async () => {
    const txQuery = jest.fn()
      .mockResolvedValueOnce({ rows: [{ astrology_consent: 'opted_in' }] })
      .mockResolvedValueOnce({ rows: [{ expires_at: new Date('2026-10-13T20:05:00.000Z') }] });
    mockTransaction.mockImplementation((fn: any) => fn({ query: txQuery }));

    const receipt = await issueR4fGrant(member, text);
    expect(receipt.scope).toBe('conversation_only');
    expect(receipt.token).toBeTruthy();
    expect(receipt.sessionId).toBeTruthy();
    expect(receipt.expiresAt).toBe('2026-10-13T20:05:00.000Z');
    expect(txQuery).toHaveBeenCalledTimes(2);
    expect(txQuery.mock.calls[0][0]).toContain('FOR SHARE');
    expect(txQuery.mock.calls[1][0]).toContain("interval '5 minutes'");
    const params = txQuery.mock.calls[1][1];
    expect(params).toContain(hmacPassageExact(text, process.env.ASTRO_R4F_PASSAGE_HMAC_KEY!));
    expect(params).toContain(sha256Exact(receipt.token));
    expect(params).not.toContain(text);
    expect(params).not.toContain(receipt.token);
  });

  it('rejects declined consent without minting a grant row', async () => {
    const txQuery = jest.fn().mockResolvedValueOnce({
      rows: [{ astrology_consent: 'declined' }],
    });
    mockTransaction.mockImplementation((fn: any) => fn({ query: txQuery }));
    await expect(issueR4fGrant(member, text)).rejects.toMatchObject({
      name: 'R4fDenied', code: 'chart_consent_required',
    });
    expect(txQuery).toHaveBeenCalledTimes(1);
  });
  it('refuses issuance when HMAC secret unavailable', async () => {
    delete process.env.ASTRO_R4F_PASSAGE_HMAC_KEY;
    await expect(issueR4fGrant(member, text)).rejects.toMatchObject({
      code: 'passage_key_unavailable',
    });
    expect(mockTransaction).not.toHaveBeenCalled();
  });

  it('consumes once with single atomic DB transition and rejects replay', async () => {
    const receipt = 'opaque-test-grant-abcdefghijklmnopqrstuvwxyz123456';
    mockQuery
      .mockResolvedValueOnce({ rows: [{ session_id: 'fictional-private-session' }] })
      .mockResolvedValueOnce({ rows: [] });
    const once = await consumeR4fGrant(member, text, receipt);
    expect(once.sessionId).toBe('fictional-private-session');
    await expect(consumeR4fGrant(member, text, receipt)).rejects.toMatchObject({
      code: 'grant_unavailable',
    });
    const sql = mockQuery.mock.calls[0][0] as string;
    const params = mockQuery.mock.calls[0][1];
    expect(sql).toContain("g.status = 'issued'");
    expect(sql).toContain("astrology_consent = 'opted_in'");
    expect(sql).toContain('g.expires_at > clock_timestamp()');
    expect(params).toEqual([member, sha256Exact(receipt), hmacPassageExact(text, process.env.ASTRO_R4F_PASSAGE_HMAC_KEY!)]);
    expect(params).not.toContain(text);
    expect(params).not.toContain(receipt);
  });

  it('blocks invalid token and unapproved body before any DB access', async () => {
    await expect(consumeR4fGrant(member, text, 'short')).rejects.toBeInstanceOf(R4fDenied);
    await expect(consumeR4fGrant(member, '', 'x'.repeat(40))).rejects.toBeInstanceOf(R4fDenied);
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it('revokes issued or consumed while retaining durable origin for retrieval', async () => {
    mockQuery.mockResolvedValueOnce({ rowCount: 1 }).mockResolvedValueOnce({ rows: [{}] });
    expect(await revokeR4fGrant(member, 'fictional-private-session')).toBe(true);
    expect(mockQuery.mock.calls[0][0]).toContain("status IN ('issued', 'consumed')");
    expect(await isR4fProtectedSession(member, 'fictional-private-session')).toBe(true);
    expect(mockQuery.mock.calls[1][0]).toContain('astro_maia_transfer_grants');
  });
});
