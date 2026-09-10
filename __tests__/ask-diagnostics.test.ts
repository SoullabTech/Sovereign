/**
 * Falsifiers for the diagnostic seam (founder ruling 2026-09-10).
 *
 * Each of these must go RED against a plausible wrong implementation:
 *   - a sanitizer that passes text through           -> secret tests fail
 *   - one that truncates before redacting            -> fragment test fails
 *   - one that widens the returned outcome           -> shape test fails
 */
import {
  sanitizeCause,
  requestIdOf,
  formatAskDiagnostic,
  ASK_DIAGNOSTIC_MARKER,
} from '../lib/manuscript/ask/askDiagnostics';

describe('sanitizeCause — credentials never reach a log', () => {
  it('redacts an Anthropic key', () => {
    const out = sanitizeCause('401 unauthorized for sk-ant-api03-AbC123_def-456XYZ');
    expect(out).not.toContain('AbC123');
    expect(out).toContain('sk-ant-[REDACTED]');
  });

  it('redacts a bearer credential', () => {
    const out = sanitizeCause('request failed: Bearer abc.def.ghi');
    expect(out).not.toContain('abc.def.ghi');
    expect(out).toContain('Bearer [REDACTED]');
  });

  it('redacts a long opaque token even in an unknown shape', () => {
    const token = 'Q'.repeat(64);
    const out = sanitizeCause(`unexpected header value ${token}`);
    expect(out).not.toContain(token);
    expect(out).toContain('[REDACTED-TOKEN]');
  });

  it('redacts BEFORE truncating, so no token fragment survives the cap', () => {
    /* THE DISCRIMINATING CASE, and it is narrower than it first looks.
       `sk-ant-...` survives either order, because the pattern still matches a
       truncated head. The length-based rule does NOT: a 64-char token cut to 20
       characters by an early truncation no longer matches {40,} and would be
       written to the log verbatim. So the token is positioned to straddle the
       cap. A truncate-then-redact implementation FAILS this test. */
    const token = 'Q'.repeat(64);
    const out = sanitizeCause(`${'x'.repeat(214)} ${token}`);
    expect(out).not.toContain('QQQQQQQQQQQQQQQQQQQQ');
    expect(out).toContain('[REDACTED-TOKEN]');
  });
});

describe('sanitizeCause — bounded, so logs never become a manuscript store', () => {
  it('caps long causes', () => {
    const out = sanitizeCause('word '.repeat(500));
    expect(out.length).toBeLessThanOrEqual(240 + '…[truncated]'.length);
    expect(out.endsWith('…[truncated]')).toBe(true);
  });

  it('collapses newlines so one cause is one line', () => {
    expect(sanitizeCause('a\nb\r\nc')).toBe('a b c');
  });

  it('reports absence as absence rather than inventing a cause', () => {
    expect(sanitizeCause(undefined)).toBe('(none)');
    expect(sanitizeCause(null)).toBe('(none)');
    expect(sanitizeCause('   ')).toBe('(empty)');
  });

  it('reads an Error by message, not by stack', () => {
    const err = new Error('provider timed out');
    expect(sanitizeCause(err)).toBe('provider timed out');
  });
});

describe('requestIdOf', () => {
  it('finds a request id when the SDK attached one', () => {
    expect(requestIdOf({ request_id: 'req_123' })).toBe('req_123');
    expect(requestIdOf({ requestID: 'req_456' })).toBe('req_456');
  });

  it('returns undefined rather than guessing', () => {
    expect(requestIdOf({})).toBeUndefined();
    expect(requestIdOf(null)).toBeUndefined();
    expect(requestIdOf('req_789')).toBeUndefined();
    expect(requestIdOf({ request_id: 'x'.repeat(200) })).toBeUndefined();
  });
});

describe('formatAskDiagnostic — the refusal identity is preserved', () => {
  it('carries the router refusal, not the member-facing word', () => {
    const line = formatAskDiagnostic({
      stage: 'structured_inference',
      refusal: 'provider_unavailable',
      model: 'claude-opus-5',
      cause: 'connection reset',
    });
    expect(line).toContain(ASK_DIAGNOSTIC_MARKER);
    expect(line).toContain('refusal=provider_unavailable');
    expect(line).toContain('model=claude-opus-5');
    expect(line).not.toContain('unreachable');
  });

  it('says request_id=(none) rather than omitting the field', () => {
    const line = formatAskDiagnostic({
      stage: 'structured_inference',
      refusal: 'not_configured',
      model: 'claude-opus-5',
      cause: '(none)',
    });
    expect(line).toContain('request_id=(none)');
  });
});
