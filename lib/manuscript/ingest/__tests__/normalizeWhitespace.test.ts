/**
 * Import whitespace normalization — the line between "spacing the file
 * carried" and "the author's words".
 *
 * Every case here was reported from a real member's manuscript: a Word book
 * whose first lines were tab-indented, whose sentences were joined by
 * non-breaking spaces, and whose chapters were separated by however many empty
 * paragraphs the author happened to press return on. The member believed the
 * spacing was theirs to correct.
 */
import { normalizeImportWhitespace as n } from '@/lib/manuscript/ingest/normalizeWhitespace';

describe('normalizeImportWhitespace — invisible characters', () => {
  it('turns a non-breaking space into a space', () => {
    expect(n('Mr. Vane went out.\n')).toBe('Mr. Vane went out.\n');
  });

  it('turns typographic and ideographic spaces into a space', () => {
    expect(n('a b　c d\n')).toBe('a b c d\n');
  });

  it('drops characters that carry no reading at all', () => {
    expect(n('mag­nif​ic﻿ent\n')).toBe('magnificent\n');
  });

  it('keeps the zero-width joiner — it is load-bearing, not decoration', () => {
    expect(n('a ‍ b\n')).toBe('a ‍ b\n');
  });

  it('normalizes CRLF and lone CR to one line ending', () => {
    expect(n('a\r\nb\rc\n')).toBe('a\nb\nc\n');
  });
});

describe('normalizeImportWhitespace — Word spacing artifacts', () => {
  it("strips Word's tab indent from the start of a line", () => {
    expect(n('\tThe morning came.\n')).toBe('The morning came.\n');
  });

  it('turns a tab inside a line into a single space', () => {
    expect(n('a\tb\n')).toBe('a b\n');
  });

  it('strips stray spaces at the end of a paragraph', () => {
    expect(n('one.   \n\ntwo.\n')).toBe('one.\n\ntwo.\n');
  });

  it('empties a line made only of spaces', () => {
    expect(n('a\n   \nb\n')).toBe('a\n\nb\n');
  });

  it('collapses stacked empty paragraphs to one blank line', () => {
    expect(n('a\n\n\n\n\nb\n')).toBe('a\n\nb\n');
  });

  it('trims blank lines before the first word and after the last', () => {
    expect(n('\n\n# Title\n\n\n')).toBe('# Title\n');
  });
});

describe('normalizeImportWhitespace — what it must NOT touch', () => {
  it("keeps the author's two spaces after a period", () => {
    expect(n('She waited.  Then she wrote.\n')).toBe('She waited.  Then she wrote.\n');
  });

  it('keeps a hard line break inside a paragraph (shift+enter in Word)', () => {
    expect(n('First line  \nsecond line\n')).toBe('First line  \nsecond line\n');
  });

  it('keeps space indentation, which may be a markdown list', () => {
    expect(n('- one\n  - nested\n')).toBe('- one\n  - nested\n');
  });

  it('adds no trailing newline the file did not have', () => {
    expect(n('one.   \n\ntwo.  ')).toBe('one.\n\ntwo.');
  });

  it('changes not one letter, digit, or punctuation mark', () => {
    const prose = 'He kept his truest sentences — all 3 of them! — in other people’s books.';
    expect(n(prose).replace(/\s+/g, '')).toBe(prose.replace(/\s+/g, ''));
  });

  it('is idempotent', () => {
    const messy = '\tA b   \n\n\n\nc  \nd \n';
    expect(n(n(messy))).toBe(n(messy));
  });

  it('leaves empty input alone', () => {
    expect(n('')).toBe('');
  });
});
