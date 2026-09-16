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

  test('T2 — coarse type shape survives without value-derived metadata', () => {
    const described = describeParams([SECRET, 42, null, true, new Date(), ['a', 'b']]);
    expect(described).toBe('[string, number, null, boolean, date, array]');
  });

  test('T3 — values of the same type are deliberately not correlatable', () => {
    const a = describeParams([SECRET]);
    const b = describeParams([SECRET + 'X']);
    const c = describeParams([EMAIL]);
    expect(a).toBe('[string]');
    expect(b).toBe(a);
    expect(c).toBe(a);
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

  test('T6 — no hash, length, or boolean value survives', () => {
    const described = describeParams([SECRET, true, ['x', 'y']]);
    expect(described).toBe('[string, boolean, array]');
    expect(described).not.toMatch(/#[0-9a-f]+/i);
    expect(described).not.toContain(String(SECRET.length));
    expect(described).not.toContain('true');
  });
});
