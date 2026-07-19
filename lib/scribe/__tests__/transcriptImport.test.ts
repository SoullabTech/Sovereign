// Session Studio Step 1 — transcript import parser.
// The load-bearing property throughout: attribution is preserved when
// supplied and NEVER invented when absent.

import { parseTranscript, estimateDurationMs, assignOffsets, MAX_IMPORT_CHARS } from '../transcriptImport';

describe('parseTranscript — labeled turns', () => {
  it('parses "Name: text" turns and preserves labels verbatim', () => {
    const r = parseTranscript('Alice: Hello there.\nBob: Hi Alice.\nAlice: How have you been?');
    expect(r.turns).toHaveLength(3);
    expect(r.turns.map(t => t.label)).toEqual(['Alice', 'Bob', 'Alice']);
    expect(r.turns[0].text).toBe('Hello there.');
    expect(r.speakerLabels).toEqual(['Alice', 'Bob']);
    expect(r.timestampsSupplied).toBe(false);
  });

  it('merges continuation lines into the current turn', () => {
    const r = parseTranscript('Alice: This thought\ncontinues on the next line.\nBob: Reply.');
    expect(r.turns).toHaveLength(2);
    expect(r.turns[0].text).toBe('This thought continues on the next line.');
  });

  it('parses [mm:ss] timestamp prefixes on labeled turns', () => {
    const r = parseTranscript('[01:30] Alice: First.\n[02:45] Bob: Second.');
    expect(r.turns.map(t => t.atMs)).toEqual([90_000, 165_000]);
    expect(r.timestampsSupplied).toBe(true);
  });

  it('parses hh:mm:ss timestamps', () => {
    const r = parseTranscript('[1:02:03] Alice: Deep in.');
    expect(r.turns[0].atMs).toBe(3_723_000);
  });

  it('applies a timestamp-only line to the following turn (VTT-adjacent paste)', () => {
    const r = parseTranscript('12:34\nAlice: After the stamp.');
    expect(r.turns[0].atMs).toBe(754_000);
    expect(r.turns[0].label).toBe('Alice');
  });

  it('parses Otter-style "Name  12:34" headers with the paragraph below', () => {
    const r = parseTranscript('Alice  12:34\nWhat she said in that stretch.\nBob  13:00\nHis reply.');
    expect(r.turns).toHaveLength(2);
    expect(r.turns[0]).toMatchObject({ label: 'Alice', atMs: 754_000, text: 'What she said in that stretch.' });
    expect(r.turns[1]).toMatchObject({ label: 'Bob', atMs: 780_000 });
  });
});

describe('parseTranscript — never invent attribution', () => {
  it('plain prose gets label=null paragraph turns — no labels fabricated', () => {
    const r = parseTranscript('First paragraph of an unlabeled memoir.\n\nSecond paragraph, still nobody named.');
    expect(r.turns).toHaveLength(2);
    expect(r.turns.every(t => t.label === null)).toBe(true);
    expect(r.speakerLabels).toEqual([]);
  });

  it('does not treat prose containing a colon as a speaker label', () => {
    const r = parseTranscript(
      'The thing she kept coming back to was this: nothing had actually been decided.'
    );
    expect(r.turns).toHaveLength(1);
    expect(r.turns[0].label).toBeNull();
  });

  it('does not treat URLs or clock readings as labels', () => {
    const r = parseTranscript('https://example.com: not a speaker\n12:34: also not a speaker');
    expect(r.turns.every(t => t.label === null)).toBe(true);
    expect(r.speakerLabels).toEqual([]);
  });
});

describe('parseTranscript — bounds and edge cases', () => {
  it('returns zero turns for whitespace-only input', () => {
    expect(parseTranscript('   \n\n  ').turns).toHaveLength(0);
  });

  it('throws on inputs beyond the character limit', () => {
    expect(() => parseTranscript('x'.repeat(MAX_IMPORT_CHARS + 1))).toThrow(/exceeds/);
  });

  it('handles CRLF input', () => {
    const r = parseTranscript('Alice: One.\r\nBob: Two.\r\n');
    expect(r.turns).toHaveLength(2);
  });
});

describe('assignOffsets — document order is preserved in storage', () => {
  const t = (atMs: number | null) => ({ label: null, text: 'x', atMs });

  it('uses supplied timestamps directly when fully timestamped', () => {
    expect(assignOffsets([t(10_000), t(42_000), t(135_000)])).toEqual([10_000, 42_000, 135_000]);
  });

  it('keeps un-timestamped turns AFTER the preceding timestamped turn (mixed documents)', () => {
    // [00:10] A / [00:42] B / (no ts) C / [02:15] D — C must sit between B and D.
    const offsets = assignOffsets([t(10_000), t(42_000), t(null), t(135_000)]);
    expect(offsets[2]).toBeGreaterThan(offsets[1]);
    expect(offsets[3]).toBeGreaterThan(offsets[2]);
    expect(offsets).toEqual([...offsets].sort((a, b) => a - b));
  });

  it('remains strictly monotonic even when supplied timestamps go backwards', () => {
    const offsets = assignOffsets([t(60_000), t(30_000), t(90_000)]);
    expect(offsets[1]).toBeGreaterThan(offsets[0]);
    expect(offsets[2]).toBeGreaterThan(offsets[1]);
  });

  it('spaces fully un-timestamped turns by the fallback step from zero', () => {
    expect(assignOffsets([t(null), t(null), t(null)], 1_000)).toEqual([0, 1_000, 2_000]);
  });
});

describe('estimateDurationMs', () => {
  it('estimates from word count at conversational pace with a 60s floor', () => {
    expect(estimateDurationMs([{ label: null, text: 'short', atMs: null }])).toBe(60_000);
    const words = Array(300).fill('word').join(' ');
    // 300 words at 150wpm ≈ 2 minutes
    expect(estimateDurationMs([{ label: null, text: words, atMs: null }])).toBe(120_000);
  });
});
