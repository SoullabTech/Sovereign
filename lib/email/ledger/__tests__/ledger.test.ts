/**
 * MAIL-02 acceptance controls.
 *
 * Two axes, never collapsed:
 *   state          what do we KNOW happened?
 *   failure_class  why did it fail?
 */
import { describe, it, expect, beforeEach } from '@jest/globals';
import { stateForFailure, scrubMetadata } from '../index';
import {
  fingerprintRecipient, normalizeRecipient, isFingerprintConfigured,
} from '../fingerprint';
import {
  ledgerWriteFailuresTotal, resetLedgerWriteFailures, recordLedgerWriteFailure,
} from '../metrics';

const KEY = 'a'.repeat(64);
const ENV = { ...process.env };
beforeEach(() => {
  process.env = { ...ENV, EMAIL_LEDGER_FINGERPRINT_KEY: KEY, EMAIL_LEDGER_FINGERPRINT_KEY_VERSION: '1' };
  resetLedgerWriteFailures();
});

describe('state mapping — what we know vs why it failed', () => {
  it('a provider-issued message id is the ONLY thing that means accepted', () => {
    // stateForFailure is only reached on failure; acceptance is decided by the
    // presence of an id at the boundary. Nothing here can return 'accepted'.
    for (const kind of ['quota_exceeded', 'exception', 'no_message_id', undefined]) {
      expect(stateForFailure(kind)).not.toBe('accepted');
    }
  });

  it('no_message_id is INDETERMINATE — the vendor said nothing usable', () => {
    expect(stateForFailure('no_message_id')).toBe('indeterminate');
  });

  it('THE CORRECTION: a transport exception is INDETERMINATE, not refused', () => {
    // A network/DNS/timeout throw may have died AFTER the provider received and
    // acted on the request. Calling that 'refused' asserts knowledge we do not
    // have, in exactly the case where a duplicate send is most likely.
    expect(stateForFailure('exception')).toBe('indeterminate');
  });

  it('known terminal non-sends are refused', () => {
    for (const kind of [
      'quota_exceeded', 'rate_limited', 'provider_auth',
      'provider_config', 'invalid_recipient', 'provider_error', 'not_configured',
    ]) {
      expect(stateForFailure(kind)).toBe('refused');
    }
  });

  it('an unrecognised failure kind is refused, never silently accepted', () => {
    expect(stateForFailure('something_new')).toBe('refused');
    expect(stateForFailure(undefined)).toBe('refused');
  });

  it('NEGATIVE CONTROL: mapping exception to refused would fail this suite', () => {
    const wrong = (k: string) => (k === 'no_message_id' ? 'indeterminate' : 'refused');
    expect(wrong('exception')).toBe('refused');
    expect(stateForFailure('exception')).not.toBe(wrong('exception'));
  });
});

describe('recipient fingerprint — keyed, versioned, never unsalted', () => {
  it('is stable for the same address under one key', () => {
    expect(fingerprintRecipient('a@example.com')).toEqual(fingerprintRecipient('a@example.com'));
  });

  it('normalises case and surrounding whitespace', () => {
    expect(normalizeRecipient('  A@Example.COM ')).toBe('a@example.com');
    expect(fingerprintRecipient('A@Example.com')?.fingerprint)
      .toBe(fingerprintRecipient('a@example.com')?.fingerprint);
  });

  it('does NOT strip plus-tags or dots — that is a provider policy, not ours', () => {
    expect(fingerprintRecipient('a+tag@example.com')?.fingerprint)
      .not.toBe(fingerprintRecipient('a@example.com')?.fingerprint);
  });

  it('THE PROPERTY: the key changes the fingerprint — it is not an unsalted digest', () => {
    const withKeyA = fingerprintRecipient('a@example.com')?.fingerprint;
    process.env.EMAIL_LEDGER_FINGERPRINT_KEY = 'b'.repeat(64);
    const withKeyB = fingerprintRecipient('a@example.com')?.fingerprint;
    expect(withKeyA).not.toBe(withKeyB);

    // And specifically: it is not SHA-256 of the address, which is what an
    // unsalted scheme would produce and what a dictionary attack would invert.
    const { createHash } = require('crypto');
    const unsalted = createHash('sha256').update('a@example.com').digest('hex');
    expect(withKeyA).not.toBe(unsalted);
    expect(withKeyB).not.toBe(unsalted);
  });

  it('rotating the key bumps the recorded version', () => {
    expect(fingerprintRecipient('a@example.com')?.keyVersion).toBe(1);
    process.env.EMAIL_LEDGER_FINGERPRINT_KEY_VERSION = '2';
    expect(fingerprintRecipient('a@example.com')?.keyVersion).toBe(2);
  });

  it('REFUSES to fingerprint without a key rather than falling back to unsalted', () => {
    delete process.env.EMAIL_LEDGER_FINGERPRINT_KEY;
    expect(isFingerprintConfigured()).toBe(false);
    expect(fingerprintRecipient('a@example.com')).toBeNull();
  });

  it('never returns the plaintext address', () => {
    const fp = fingerprintRecipient('a@example.com');
    expect(fp?.fingerprint).not.toContain('@');
    expect(fp?.fingerprint).not.toContain('example');
    expect(fp?.fingerprint).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe('metadata scrubbing — secrets must not reach durable storage', () => {
  it('drops keys that could carry a secret or an address', () => {
    const scrubbed = scrubMetadata({
      severity: 'high',
      authCode: '123456',
      inviteToken: 'tok_abc',
      recipientEmail: 'a@example.com',
      magicLink: 'https://x/y',
      passcode: 'hunter2',
      subject: 'Your code',
      surface: 'signin',
    });
    expect(scrubbed).toEqual({ severity: 'high', surface: 'signin' });
  });

  it('is case-insensitive and substring-based — a new caller cannot slip one past it', () => {
    expect(scrubMetadata({ USER_PASSWORD: 'x', someTokenThing: 'y' })).toEqual({});
  });

  it('CONTROL: harmless operational labels survive', () => {
    expect(scrubMetadata({ campaign: 'beta', count: '12' })).toEqual({ campaign: 'beta', count: '12' });
  });
});

describe('dropped ledger writes are counted OUT OF BAND', () => {
  it('counts failures the ledger itself cannot record', () => {
    expect(ledgerWriteFailuresTotal()).toBe(0);
    recordLedgerWriteFailure('open', new Error('connection refused'));
    recordLedgerWriteFailure('settle', new Error('connection refused'));
    expect(ledgerWriteFailuresTotal()).toBe(2);
  });

  it('never throws — a failure to record a failure must not become a third failure', () => {
    expect(() => recordLedgerWriteFailure('open', null)).not.toThrow();
    expect(() => recordLedgerWriteFailure('open', { weird: true })).not.toThrow();
  });
});
