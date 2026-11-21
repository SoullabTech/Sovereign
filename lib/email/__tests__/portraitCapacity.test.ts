import { beforeEach, afterEach, describe, expect, it, jest } from '@jest/globals';

const mockSql = jest.fn<(...args: any[]) => Promise<any>>();
jest.mock('@/lib/db/postgres', () => ({
  transaction: async (callback: (client: any) => Promise<any>) =>
    callback({ query: (...args: any[]) => mockSql(...args) }),
}));
jest.mock('@/lib/email/ledger/fingerprint', () => ({
  fingerprintRecipient: (_address: string) => ({ fingerprint: 'f'.repeat(64), keyVersion: 1 }),
}));
import { reserveManagedPortraitSend, PORTRAIT_MAIL_PURPOSE } from '../portraitCapacity';

const PORTRAIT = '620d37e9-afbf-4e52-80c5-5ce9c7aceade';
const OWNER = '9ba11e1c-b849-4474-ad10-a788341e4815';
const fresh = {
  purpose: PORTRAIT_MAIL_PURPOSE,
  from: 'Soullab <noreply@soullab.life>',
  to: 'fictional@example.com',
  proof: {
    portraitId: PORTRAIT, ownerMemberId: OWNER,
    recipientConsentAttested: true, subjectShareAttested: true,
    consentSource: 'verbal' as const,
  },
};
let owned = true;
let consent = 'set';
let counts = { minute: '0', day: '0', actor_day: '0', recipient_day: '0' };
let error = false;

beforeEach(() => {
  jest.clearAllMocks();
  process.env.SOUL_PORTRAIT_SMTP_ENABLED = 'true';
  owned = true; consent = 'set'; error = false;
  counts = { minute: '0', day: '0', actor_day: '0', recipient_day: '0' };
  mockSql.mockImplementation(async (sql: any) => {
    if (error) throw new Error('synthetic database outage');
    const q = String(sql);
    if (q.includes('FROM soul_portraits')) return { rows: owned ? [{ id: PORTRAIT }] : [] };
    if (q.includes('FROM soul_portrait_consents')) return { rows: [{ action: consent }] };
    if (q.includes('FROM soul_portrait_delivery_attestations')) return { rows: [counts] };
    if (q.includes('INSERT INTO soul_portrait_delivery_attestations')) return { rows: [{ id: 'fixture-row' }] };
    return { rows: [] };
  });
});
afterEach(() => { delete process.env.SOUL_PORTRAIT_SMTP_ENABLED; });

describe('Soul Portrait P2 capacity: fail closed, separate from P0 (synthetic)', () => {
  it('is dark by default and does not touch DB', async () => {
    delete process.env.SOUL_PORTRAIT_SMTP_ENABLED;
    expect((await reserveManagedPortraitSend(fresh)).admitted).toBe(false);
    expect(mockSql).not.toHaveBeenCalled();
  });
  it('refuses missing recipient attestation and unknown purpose', async () => {
    expect((await reserveManagedPortraitSend({
      ...fresh, proof: { ...fresh.proof, recipientConsentAttested: false },
    })).admitted).toBe(false);
    expect((await reserveManagedPortraitSend({ ...fresh, purpose: 'auth:email-code' })).admitted).toBe(false);
    expect(mockSql).not.toHaveBeenCalled();
  });
  it('refuses a second recipient, forged sender or malformed mailbox', async () => {
    expect((await reserveManagedPortraitSend({ ...fresh, to: ['one@example.com', 'two@example.com'] })).admitted).toBe(false);
    expect((await reserveManagedPortraitSend({ ...fresh, from: 'attacker@example.com' })).admitted).toBe(false);
    expect((await reserveManagedPortraitSend({ ...fresh, to: 'not-an-email' })).admitted).toBe(false);
    expect(mockSql).not.toHaveBeenCalled();
  });
  it('refuses nonowned portrait and revoked governing consent', async () => {
    owned = false;
    expect((await reserveManagedPortraitSend(fresh)).admitted).toBe(false);
    expect(mockSql.mock.calls.some(call => String(call[0]).includes('INSERT INTO soul_portrait'))).toBe(false);
    owned = true; consent = 'revoke';
    expect((await reserveManagedPortraitSend(fresh)).admitted).toBe(false);
    expect(mockSql.mock.calls.some(call => String(call[0]).includes('INSERT INTO soul_portrait'))).toBe(false);
  });
  it('uses a separate P2 namespace and never spends a P0 email-code challenge', async () => {
    const result = await reserveManagedPortraitSend(fresh);
    expect(result).toEqual({ admitted: true });
    const sql = mockSql.mock.calls.map(c => String(c[0])).join('\n');
    expect(sql).toContain('pg_advisory_xact_lock(1179796564, 2)');
    expect(sql).not.toContain('auth_email_challenges');
    const record = mockSql.mock.calls.find(c => String(c[0]).includes('INSERT INTO soul_portrait_delivery_attestations'));
    expect(record).toBeDefined();
    expect(JSON.stringify(record)).not.toContain('fictional@example.com');
    expect(JSON.stringify(record)).toContain('f'.repeat(64));
  });
  it('refuses exhausted global, actor and recipient limits', async () => {
    for (const k of ['minute', 'day', 'actor_day', 'recipient_day'] as const) {
      counts = { minute: '0', day: '0', actor_day: '0', recipient_day: '0' };
      counts[k] = { minute: '3', day: '30', actor_day: '10', recipient_day: '5' }[k];
      const result = await reserveManagedPortraitSend(fresh);
      expect(result).toEqual(expect.objectContaining({ admitted: false, kind: 'rate_limited' }));
    }
    expect(mockSql.mock.calls.some(c => String(c[0]).includes('INSERT INTO soul_portrait'))).toBe(false);
  });
  it('fails closed on DB errors without leaking details', async () => {
    error = true;
    const result = await reserveManagedPortraitSend(fresh);
    expect(result).toEqual(expect.objectContaining({ admitted: false, kind: 'provider_config' }));
    expect(JSON.stringify(result)).not.toContain('synthetic database outage');
  });
});
