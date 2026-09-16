/**
 * @jest-environment node
 *
 * SOURCE-CUSTODY-PII-01 · R1.6 — query parameters are described, never printed.
 *
 * `lib/db/postgres.ts` logged raw `params` on every query error. Callers pass
 * submitted passkeys, emails and member ids, so a database fault was a
 * credential- and PII-disclosure path into logs.
 *
 * ⭐ T4 IS THE MUTANT. It runs the same proposition against the old behaviour —
 * logging `params` directly — and REQUIRES it to fail. Without it, T1–T3 would
 * pass just as happily against a redactor that did nothing to a value the test
 * happened not to check.
 */
import { describeParams } from '../postgres';

const SECRET = 'SOULLAB-A-REAL-LOOKING-CREDENTIAL-VALUE';
const EMAIL = 'someone@example.com';

describe('R1.6 · query parameter redaction', () => {
  test('T1 — no string value survives into the description', () => {
    const described = describeParams([SECRET, EMAIL, 'short']);
    expect(described).not.toContain(SECRET);
    expect(described).not.toContain(EMAIL);
    expect(described).not.toContain('short');
  });

  test('T2 — shape is preserved well enough to debug', () => {
    const described = describeParams([SECRET, 42, null, true, new Date(), ['a', 'b']]);
    expect(described).toContain(`string(${SECRET.length})`);
    expect(described).toContain('number');
    expect(described).toContain('null');
    expect(described).toContain('boolean(true)');
    expect(described).toContain('date');
    expect(described).toContain('array(2)');
  });

  test('T3 — equal values correlate, different values do not', () => {
    const a = describeParams([SECRET]);
    const b = describeParams([SECRET]);
    const c = describeParams([SECRET + 'X']);
    expect(a).toBe(b); // same value → same digest, so logs can be correlated
    expect(a).not.toBe(c); // different value → different digest
  });

  test('T4 — MUTANT: the pre-repair behaviour fails this suite', () => {
    const oldBehaviour = (params: unknown[]) => String(params);
    expect(oldBehaviour([SECRET, EMAIL])).toContain(SECRET);
    expect(oldBehaviour([SECRET, EMAIL])).toContain(EMAIL);
  });

  test('T5 — empty and absent parameter lists are handled', () => {
    expect(describeParams([])).toBe('(none)');
    expect(describeParams(undefined as unknown as unknown[])).toBe('(none)');
  });

  test('T6 — a digest is a prefix, not a reversible encoding', () => {
    const described = describeParams([SECRET]);
    const digest = described.match(/#([0-9a-f]+)/)?.[1] ?? '';
    expect(digest).toHaveLength(8);
  });
});
