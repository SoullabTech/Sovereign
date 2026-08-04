import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { parseModelJson } from '../parseModelJson';

describe('parseModelJson', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => vi.restoreAllMocks());

  it('parses clean JSON', () => {
    expect(parseModelJson('{"a":1}', 't')).toEqual({ a: 1 });
  });

  it('strips markdown fences', () => {
    expect(parseModelJson('```json\n{"a":1}\n```', 't')).toEqual({ a: 1 });
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
});
