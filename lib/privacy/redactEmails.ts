/**
 * Strip recipient addresses out of text that is about to cross the logging
 * boundary.
 *
 * WHY THIS EXISTS
 *   AUTH-5c redacted five log sites that interpolated a member's email address
 *   into container stdout, including the transport-level `logSend` in
 *   lib/email/sendEmail.ts. Every one of those sites now emits `memberRef()` or
 *   nothing — and the address could still walk straight back in through the
 *   provider's own error prose, which those same log lines carry verbatim:
 *
 *     { toRef: 'b2f0cb91122b', error: 'Invalid recipient a.real.person@example.com' }
 *
 *   The provider echoes back the address it rejected. Nothing in the five
 *   redactions touches that string, so the leak survives all of them. The
 *   refusal test that existed did not catch it because it modelled a quota
 *   message, which contains no address.
 *
 * WHAT IS PRESERVED, AND WHY
 *   The prose itself is kept, minus the address. Provider wording is the field
 *   that carried the actionable detail during the 2026-08-24 incident ("The
 *   from address is not verified" is a different operator action from "quota
 *   exceeded"), and dropping it wholesale would trade one blind spot for
 *   another. Only the address is removed.
 *
 *   The DOMAIN is retained: `<redacted@example.com>`. A domain is a portion of
 *   the supplied address, so this is deliberately NOT a claim that no part of
 *   the address survives. It is coarse, it is what deliverability triage
 *   actually reads, and lib/email/sendEmail.ts already logs it as its own
 *   `domain` field. Retaining it here keeps the two consistent.
 *
 * THE BOUNDARY THIS ENFORCES — stated precisely
 *   No full recipient address and no recipient LOCAL-PART reaches operational
 *   stdout. Recipient DOMAIN may be retained as coarse deliverability metadata.
 *
 *   That is narrower than "no member-supplied address reaches stdout", which is
 *   the wording AUTH-5c originally used and which the tests never actually
 *   asserted. The wording is corrected to what is true.
 *
 * SCOPE
 *   Operational stdout only. Durable records that are SUPPOSED to hold an
 *   identified address — `magic_link_tokens`, `beta_waitlist`,
 *   `onboarding_events` — are a separate retention question and are untouched.
 */

/**
 * Addresses as they appear inside prose.
 *
 * DELIBERATELY OVER-INCLUSIVE. This is a privacy boundary, not a validator.
 * The governing rule: if something looks enough like an address for a provider
 * to have echoed it as a recipient, over-redact rather than preserve part of
 * the local identity. Eating a stray quotation mark costs nothing; leaving
 * `o'` behind is a real leak.
 *
 * That rule was learned twice, from cases the earlier regexes half-matched —
 * a partial match is worse than no match, because it silently satisfies a
 * `not.toContain(WHOLE_ADDRESS)` assertion while a fragment of the local part
 * survives:
 *
 *   o'connor@example.com                  -> `o'` survived (apostrophe excluded)
 *   weird!#$%&'*+-/=?^_`{|}~@example.com  -> `weird!#$%&'` survived (same cause)
 *   foo@localhost                         -> untouched (domain required a dot)
 *   foo@[192.168.0.1]                     -> untouched (domain required a letter)
 *
 * LOCAL PART, quoted form first:
 *   1. `"anything"@domain` — RFC 5321 permits a quoted local part, and it may
 *      contain SPACES, which the unquoted branch cannot see (it must exclude
 *      whitespace or it would swallow the surrounding prose).
 *   2. Everything up to whitespace or the punctuation that actually WRAPS an
 *      address in prose: <> () [] , ; : and the double quote. Apostrophe is NOT
 *      excluded — it is valid atext, and excluding it truncated the match. If a
 *      provider wraps an address in single quotes we now eat the quote too;
 *      that is the intended direction of the error.
 *
 * DOMAIN:
 *   1. A bracketed literal `[192.168.0.1]` / `[IPv6:...]` — RFC 5321 address
 *      literals, which providers do echo in rejection prose.
 *   2. Otherwise dot-separated labels, with the dot OPTIONAL — so `localhost`
 *      and other single-label destinations match. `invalid_recipient` prose is
 *      by definition about malformed addresses; a matcher that only accepted
 *      well-formed ones would miss the class most likely to carry an address.
 */
const ADDRESS_IN_TEXT =
  /(?:"[^"\n]*"|[^\s<>()[\],;:"]+)@(?:\[[^\]\s]*\]|[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)*)/g;

/**
 * Replace every email address in `text` with `<redacted@domain>`.
 *
 * Returns the input unchanged when there is nothing to redact, and handles
 * absent values so call sites do not have to branch.
 */
export function redactEmails(text: string): string;
export function redactEmails(text: string | undefined): string | undefined;
export function redactEmails(text: string | null): string | null;
export function redactEmails(text: string | null | undefined): string | null | undefined {
  if (text === null || text === undefined) return text;
  return text.replace(ADDRESS_IN_TEXT, (match) => {
    const at = match.lastIndexOf('@');
    const domain = match.slice(at + 1);
    return `<redacted@${domain}>`;
  });
}
