import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { fingerprintMailReference } from '../fingerprint';

const ENV = { ...process.env };
beforeEach(() => {
  process.env = { ...ENV, EMAIL_LEDGER_FINGERPRINT_KEY: 's'.repeat(64) };
});
afterEach(() => {
  process.env = ENV;
});

describe('mail references never expose recipients or access credentials', () => {
  it('replaces a recipient email with a stable keyed pseudonym', () => {
    const raw = 'recipient.person@example.com';
    const a = fingerprintMailReference('beta-invite', raw);
    expect(a).toMatch(/^hmac-v\d+:[a-f0-9]{64}$/);
    expect(a).not.toContain(raw);
    expect(fingerprintMailReference('beta-invite', raw)).toBe(a);
  });

  it('domain separates two purposes and two secrets', () => {
    const raw = 'one-time-gift-passkey';
    const a = fingerprintMailReference('gift-bead', raw);
    const b = fingerprintMailReference('beta-invite', raw);
    const c = fingerprintMailReference('gift-bead', raw + '2');
    expect(a).not.toEqual(b);
    expect(a).not.toEqual(c);
    expect(a).not.toContain(raw);
  });

  it('fails closed without private HMAC key', () => {
    delete process.env.EMAIL_LEDGER_FINGERPRINT_KEY;
    expect(fingerprintMailReference('gift-bead', 'a')).toBeNull();
  });

  it('rejects an unsanctioned namespace rather than making a key', () => {
    expect(fingerprintMailReference('gift-bead\r\nBcc: evil@example.com', 'x')).toBeNull();
  });
});
