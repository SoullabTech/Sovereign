/**
 * Writers Academy · accuracy witness instrument (2026-11-07).
 *
 * A teaching reply can have the right shape (one idea, a steering question) and still be
 * wrong about the words on the page. The 2c walk saw both: "the sentences get shorter"
 * when the third was the longest, and a misquoted marker. This instrument separates the
 * two by checking a reply against the EXACT passage MAIA was given.
 *
 * What it decides mechanically:
 *  - every quoted span in the reply appears in the passage (after normalising curly quotes,
 *    whitespace, case and a leading/trailing punctuation mark);
 *  - the passage's own sentence facts (word counts, which is longest, whether lengths fall),
 *    so a reader marking a claim about sentence length has the fact beside it.
 *
 * ⛔ What it does NOT decide: whether a claim about sequence, length or effect is true, or
 * whether an interpretation is good. Those are marked by a reader in the record, never by
 * this module. A reply with no quotes passes the quote check vacuously; that says nothing
 * about its accuracy.
 */

export interface SentenceFact {
  index: number;
  text: string;
  words: number;
}

export interface PassageFacts {
  sentences: SentenceFact[];
  longest: number;
  shortest: number;
  strictlyFalling: boolean;
  strictlyRising: boolean;
}

export interface QuoteCheck {
  quote: string;
  faithful: boolean;
}

const OPEN_CLOSE: Array<[string, string]> = [['“', '”'], ['"', '"'], ['‘', '’']];

function normalise(text: string): string {
  return text
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .trim();
}

/** Sentences split on . ! ? followed by space or end, keeping it simple and inspectable. */
export function passageFacts(passage: string): PassageFacts {
  const parts = passage.trim().split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter(Boolean);
  const sentences = parts.map((text, index) => ({
    index: index + 1,
    text,
    words: text.split(/\s+/).filter((w) => /[A-Za-z0-9]/.test(w)).length,
  }));
  const counts = sentences.map((s) => s.words);
  const longest = sentences.reduce((a, b) => (b.words > a.words ? b : a)).index;
  const shortest = sentences.reduce((a, b) => (b.words < a.words ? b : a)).index;
  return {
    sentences,
    longest,
    shortest,
    strictlyFalling: counts.every((n, i) => i === 0 || n < counts[i - 1]!),
    strictlyRising: counts.every((n, i) => i === 0 || n > counts[i - 1]!),
  };
}

/** Spans in double or curly quotes. Single straight quotes are skipped: they are apostrophes
 *  far more often than quotation marks. Spans under two characters are skipped. */
export function quotedSpans(reply: string): string[] {
  const spans: string[] = [];
  for (const [open, close] of OPEN_CLOSE) {
    if (open === '‘') {
      const re = /‘([^‘’]{2,}?)’(?![a-z])/g;
      for (const m of reply.matchAll(re)) spans.push(m[1]!);
      continue;
    }
    const re = new RegExp(`${escape(open)}([^${escape(open)}${escape(close)}]{2,}?)${escape(close)}`, 'g');
    for (const m of reply.matchAll(re)) spans.push(m[1]!);
  }
  return spans;
}

function escape(ch: string): string {
  return ch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** A quote is faithful when each part (split at an ellipsis) appears in the passage. */
export function checkQuotes(reply: string, passage: string): QuoteCheck[] {
  const source = normalise(passage);
  return quotedSpans(reply).map((quote) => {
    const parts = quote.split(/\.\.\.|…/).map((p) => normalise(p).replace(/^[\s.,;:!?'"-]+|[\s.,;:!?'"-]+$/g, '')).filter(Boolean);
    return { quote, faithful: parts.length > 0 && parts.every((p) => source.includes(p)) };
  });
}
