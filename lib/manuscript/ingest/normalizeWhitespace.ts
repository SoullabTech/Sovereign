/**
 * Soullab Press — import whitespace normalization.
 *
 * A manuscript that arrives from Word (or a PDF text layer) carries invisible
 * spacing the author never typed: Word's tab indents, non-breaking spaces from
 * autocorrect, optional (soft) hyphens, stray spaces at the ends of paragraphs,
 * and stacks of empty spacer paragraphs. None of it is the writing. All of it
 * shows up in the writing surface as gaps of inconsistent width, cursor
 * positions past the end of a line, and words that will not wrap — the "weird
 * spacing" a member then spends their writing time hand-correcting, believing
 * it came from their own document.
 *
 * DOCTRINE — this is the narrowest possible reading of "the author's words,
 * unchanged", and it holds the line deliberately:
 *   - Only WHITESPACE is touched. Not one letter, digit, or punctuation mark
 *     is added, removed, or reordered.
 *   - Invisible characters become their visible equivalent (nbsp → space) or
 *     are dropped when they carry no reading at all (zero-width space, BOM,
 *     soft hyphen). The rendered text is identical; its behavior stops being
 *     strange.
 *   - Spacing the author can SEE is left alone: two spaces after a period stay
 *     two spaces, indentation made of spaces stays (it may be a markdown list),
 *     and a hard line break inside a paragraph keeps its two trailing spaces.
 *   - Zero-width JOINER / NON-JOINER (U+200D / U+200C) are NOT stripped: they
 *     are load-bearing inside emoji and in several writing systems. An
 *     invisible character is only removable when it is invisible everywhere.
 *
 * The member still reviews the extracted text in an editable field before
 * anything is saved, so this runs upstream of their judgement, never over it.
 */

/** Spaces that read as a space but do not behave as one. */
const SPACE_LIKE = /[\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]/g;

/**
 * Invisible and non-reading. Soft hyphen (U+00AD) is Word's optional
 * line-break hint; ZWSP/word-joiner/BOM are paste residue.
 */
const NON_READING = /[\u00AD\u200B\u2060\uFEFF]/g;

/**
 * Normalize the whitespace of imported manuscript text. Deterministic, pure,
 * and idempotent: normalize(normalize(x)) === normalize(x).
 */
export function normalizeImportWhitespace(text: string): string {
  if (!text) return text;

  let out = text
    // 1. One line ending. Word, macOS and PDF extractors disagree; the writing
    //    surface only understands \n, and a stray \r renders as a gap.
    .replace(/\r\n?/g, '\n')
    // 2. Invisible whitespace → its visible equivalent, or nothing.
    .replace(SPACE_LIKE, ' ')
    .replace(NON_READING, '')
    // 3. Word's first-line indent arrives as a leading tab. It is paragraph
    //    STYLING, not text — and at the start of a line it also reads as a
    //    markdown code block, which is why an indented paragraph came through
    //    in a monospace slab. Tabs elsewhere become a single space.
    .replace(/^\t+/gm, '')
    .replace(/\t/g, ' ')
    // 4. A line of nothing but spaces is an empty line that does not look like
    //    one. Make it what it is before anything counts blank lines.
    .replace(/^[ ]+$/gm, '');

  // 5. Trailing spaces at the END of a paragraph (before a blank line or the
  //    end of the text) are stray — Word leaves them constantly. Trailing
  //    spaces INSIDE a paragraph are left untouched: two of them are a
  //    markdown hard break, which is exactly how a shift+enter line break in
  //    Word arrives, and dropping them would silently join the author's lines.
  out = out.replace(/[ ]+(?=\n\n)/g, '').replace(/[ ]+(?=\n*$)/g, '');

  // 6. Word's empty spacer paragraphs stack up between chapters, so the gap
  //    before one heading is twice the gap before the next. One blank line
  //    between blocks, everywhere.
  out = out.replace(/\n{3,}/g, '\n\n');

  // 7. Blank lines before the first word and after the last are not spacing
  //    the author chose; they are where the file started and stopped.
  return out.replace(/^\n+/, '').replace(/\n+$/, '\n');
}
