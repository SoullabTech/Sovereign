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

// ── 5c.2 — PARTIAL MATCHES ────────────────────────────────────────────────
// The dangerous failure here is not "no match". It is a PARTIAL match: the
// sanitiser rewrites enough of the address to satisfy a
// `not.toContain(WHOLE_ADDRESS)` assertion while a fragment of the local part
// walks out into stdout. Every case below leaked a fragment, or leaked
// entirely, under 9331da1.
//
// Each is asserted character by character, not against the whole address, so a
// future regex that half-matches cannot pass.
describe('no FRAGMENT of the local part survives', () => {
  /**
   * Truncation leaves a PREFIX (match started late) or a SUFFIX (match ended
   * early), so those are what is checked — every prefix and every suffix of the
   * local part, down to two characters.
   *
   * Two, not one: a single character is not evidence. `<redacted@example.com>`
   * legitimately contains `o` (in `.com`), so a one-character check fails on
   * correct output. Arbitrary interior substrings are out for the same reason —
   * `co` and `om` are both in `.com`.
   *
   * Checked against the sanitised address ALONE, with no surrounding prose, so
   * a fragment can never be attributed to the words around it.
   */
  const noFragmentOf = (localPart: string, input: string) => {
    const bare = redactEmails(input.slice(input.indexOf(localPart)));
    for (let i = 2; i <= localPart.length; i++) {
      expect(bare).not.toContain(localPart.slice(0, i));      // left truncation
      expect(bare).not.toContain(localPart.slice(-i));        // right truncation
    }
    return redactEmails(input);
  };

  // An apostrophe is valid atext. Excluding it from the local-part character
  // class truncated the match and left `o'` in the log.
  it("removes an apostrophe local part (o'connor)", () => {
    expect(noFragmentOf("o'connor", "Invalid recipient o'connor@example.com")).toBe(
      'Invalid recipient <redacted@example.com>'
    );
  });

  // Full RFC atext stress case — same apostrophe cause, worse fragment.
  it('removes a full RFC-atext local part', () => {
    const local = "weird!#$%&'*+-/=?^_`{|}~";
    expect(noFragmentOf(local, `Invalid recipient ${local}@example.com`)).toBe(
      'Invalid recipient <redacted@example.com>'
    );
  });

  // Requiring a dot in the domain meant single-label destinations did not match
  // at all, and the local part passed through untouched.
  it('removes a single-label domain address (foo@localhost)', () => {
    expect(noFragmentOf('foo', 'Invalid recipient foo@localhost')).toBe(
      'Invalid recipient <redacted@localhost>'
    );
  });

  // RFC 5321 address literals. Requiring the domain to start with an
  // alphanumeric meant these did not match either.
  it('removes a bracketed address literal', () => {
    expect(noFragmentOf('foo', 'Invalid recipient foo@[192.168.0.1]')).toBe(
      'Invalid recipient <redacted@[192.168.0.1]>'
    );
  });
});

// The boundary is a privacy rule, not a validator. Eating a stray quotation
// mark costs nothing; leaving `o'` behind is a real leak. Direction of error
// is asserted so a later "tidier" regex cannot quietly reverse it.
describe('over-redaction is the intended direction of error', () => {
  it('eats a wrapping single quote rather than truncating the local part', () => {
    const out = redactEmails("recipient 'a.real.person@example.com' rejected");
    expect(out).not.toContain('a.real.person');
    expect(out).toContain('rejected');
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
