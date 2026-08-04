import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { parseModelJson } from '../parseModelJson';

describe('parseModelJson', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => vi.restoreAllMocks());

  // Strict-first: conforming output must take the unmodified JSON.parse path and
  // leave no trace. If normalization ever became the ordinary route, a degrading
  // prompt contract would stop being visible. These two assertions are what keep
  // the resilience layer an exception rather than the definition of "valid".
  it('parses clean JSON strictly, without invoking normalization', () => {
    const parse = vi.spyOn(JSON, 'parse');
    expect(parseModelJson('{"a":1}', 't')).toEqual({ a: 1 });
    // The FIRST parse attempt must be the untouched input. Asserting only that
    // no warning fired would still pass if normalization silently became the
    // ordinary route; this asserts the strict attempt actually happened first.
    expect(parse).toHaveBeenCalledTimes(1);
    expect(parse.mock.calls[0][0]).toBe('{"a":1}');
    expect(console.warn).not.toHaveBeenCalled();
  });

  it('strips markdown fences without invoking normalization', () => {
    expect(parseModelJson('```json\n{"a":1}\n```', 't')).toEqual({ a: 1 });
    expect(console.warn).not.toHaveBeenCalled();
  });

  // The production failure: the output contract demonstrated `], // 6-8 key
  // placements`, and the model echoed the comment back.
  it('recovers the production failure — a line comment after a property value', () => {
    const raw = '{\n "natalPlacements": [ {"body":"Sun"} ] // 6-8 key placements\n, "natalSynthesis": "x"\n}';
    expect(() => JSON.parse(raw)).toThrow(/Expected ',' or '}' after property value/);
    expect(parseModelJson(raw, 't')).toEqual({
      natalPlacements: [{ body: 'Sun' }],
      natalSynthesis: 'x',
    });
    // Recovery succeeds, but it does not erase the evidence that it was needed:
    // the draft is usable AND the output is still recorded as contract-nonconforming.
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('needed noise-stripping'),
    );
  });

  it('strips a comment that follows a comma', () => {
    expect(parseModelJson('{"a": [1], // 3-4\n "b": 2}', 't')).toEqual({ a: [1], b: 2 });
  });

  it('strips block comments and trailing commas', () => {
    expect(parseModelJson('{"a": 1, /* note */ "b": [1,2,],}', 't')).toEqual({ a: 1, b: [1, 2] });
  });

  it('never mangles // or /* inside prose values', () => {
    const raw = '{"body":"a path // a fork /* not a comment */ onward","n":1}';
    expect(parseModelJson(raw, 't')).toEqual({
      body: 'a path // a fork /* not a comment */ onward',
      n: 1,
    });
  });

  it('leaves escaped quotes inside prose intact', () => {
    expect(parseModelJson('{"body":"she said \\"yes\\" // ok"}', 't')).toEqual({
      body: 'she said "yes" // ok',
    });
  });

  it('still throws on genuinely malformed output, and logs the window', () => {
    const raw = `{"body": "he said "yes" to it", "n": 1}`;
    expect(() => parseModelJson(raw, 'soul-portrait/generate')).toThrow(SyntaxError);
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('[soul-portrait/generate] unparseable model JSON'),
    );
  });

  // The log exists to show what broke the parse, not to record what the model
  // wrote about a person. A portrait draft must not reach container logs.
  it('never logs the prose itself — only the structure around the failure', () => {
    const secret = 'Cece carries a rare and unmistakable grief';
    const raw = `{"openingLetter": "${secret}", "n": "x" "y"}`;
    expect(() => parseModelJson(raw, 'soul-portrait/generate')).toThrow(SyntaxError);

    const logged = (console.error as any).mock.calls[0][0] as string;
    expect(logged).not.toContain(secret);
    expect(logged).not.toContain('Cece');
    expect(logged).not.toContain('grief');
    // Structure survives: the key names and the offending quote boundary.
    // (The window is JSON.stringify'd into the log line, so quotes are escaped.)
    expect(logged).toContain('openingLetter');
    expect(logged).toContain('\\"·\\" \\"·\\"');
    // The value's length is all that remains of the prose.
    expect(logged).toContain('·'.repeat(secret.length));
  });
});
