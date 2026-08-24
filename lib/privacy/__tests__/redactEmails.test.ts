/**
 * REDACT EMAILS — the sanitiser at the operational-stdout boundary.
 *
 * Introduced by AUTH-5c.1 after 5c redacted five log sites and left one escape
 * hatch open: the provider's own error prose, which those same lines carry
 * verbatim, and which contains the address the provider rejected.
 *
 * THE BOUNDARY. No full address and no LOCAL-PART survives. The DOMAIN does,
 * deliberately — it is coarse, it is what deliverability triage reads, and
 * lib/email/sendEmail already logs it as its own field.
 */
import { describe, it, expect } from '@jest/globals';
import { redactEmails } from '../redactEmails';

describe('the local part never survives', () => {
  it('removes an address a provider echoed back', () => {
    const out = redactEmails('Invalid recipient a.real.person@example.com');
    expect(out).not.toContain('a.real.person');
    expect(out).toBe('Invalid recipient <redacted@example.com>');
  });

  it('removes every address when the message names more than one', () => {
    const out = redactEmails('from noreply@soullab.life to a.real.person@example.com failed');
    expect(out).not.toContain('a.real.person');
    expect(out).not.toContain('noreply');
    expect(out).toBe('from <redacted@soullab.life> to <redacted@example.com> failed');
  });

  it('removes addresses in the punctuation providers actually use', () => {
    for (const wrapped of [
      '<a.real.person@example.com>',
      '"a.real.person@example.com"',
      'recipient (a.real.person@example.com) rejected',
      'to=a.real.person@example.com,',
      'address: a.real.person@example.com.',
    ]) {
      expect(redactEmails(wrapped)).not.toContain('a.real.person');
    }
  });

  it('removes plus-addressed and subdomained forms', () => {
    expect(redactEmails('a.real.person+signup@mail.example.co.uk')).toBe(
      '<redacted@mail.example.co.uk>'
    );
  });

  // `invalid_recipient` messages are, by definition, ABOUT malformed addresses.
  // A sanitiser that only matched well-formed ones would miss the exact class
  // of message most likely to carry an address.
  it('removes malformed addresses too', () => {
    expect(redactEmails('Invalid recipient a.real.person@@example.com')).not.toContain('a.real.person');
    expect(redactEmails('Invalid recipient "weird name"@example.com')).not.toContain('weird name');
  });
});

describe('what is deliberately kept', () => {
  it('keeps the domain as coarse deliverability metadata', () => {
    expect(redactEmails('Invalid recipient a@example.com')).toContain('example.com');
  });

  it('keeps the prose, which is the operator signal', () => {
    expect(redactEmails('The from address is not verified')).toBe(
      'The from address is not verified'
    );
  });

  it('leaves a bare domain alone', () => {
    expect(redactEmails('Domain example.com is not verified')).toBe(
      'Domain example.com is not verified'
    );
  });
});

describe('call sites do not have to branch', () => {
  it('passes through absent values', () => {
    expect(redactEmails(undefined)).toBeUndefined();
    expect(redactEmails(null)).toBeNull();
    expect(redactEmails('')).toBe('');
  });
});
