/**
 * WS-WORK-CONTINUITY · A2 — mechanical quote fidelity (pure).
 *
 * A prompt cannot be falsified; this can. Any span MAIA puts in quotation marks that is at least
 * QUOTE_FLOOR characters long must occur (whitespace/quote-style normalised) in text she was actually
 * given this turn, or in the conversation's own words. ⛔ This checks that a QUOTE EXISTS in the sources.
 * It does not check that her claim ABOUT the quote is true, and it does not check paraphrase or counts.
 */
export const QUOTE_FLOOR = 25;

const norm = (s: string): string => s
  .normalize('NFKC').replace(/[\u200B-\u200D\u2060\uFEFF]/g, '').replace(/[*_`~]/g, '')
  .replace(/[‘’‛]/g, "'").replace(/[“”‟]/g, '"')
  .replace(/[–—]/g, '-').replace(/…/g, '...').replace(/\.\s\.\s\./g, '...').replace(/--+/g, '-').replace(/[\[\]]/g, '')
  .replace(/\s+/g, ' ').trim().toLowerCase();

/** Spans inside straight or curly double quotes. Single quotes are skipped (apostrophes make them ambiguous). */
export function quotedSpans(answer: string): string[] {
  const out: string[] = [];
  /* An ODD number of straight quotes (inches, a stray mark) cannot be paired reliably and would turn MAIA's own prose into a "quote":
     only curly-paired and straight spans of a balanced answer are examined. */
  const straight = (answer.match(/"/g) ?? []).length;
  const pattern = straight % 2 === 1 ? /“([^“”]{1,2000})”/g : /["“]([^"“”]{1,2000})["”]/g;
  for (const m of answer.matchAll(pattern)) out.push(m[1]);
  for (const m of answer.matchAll(/«([^«»]{1,2000})»/g)) out.push(m[1]);
  // block quotes: consecutive `>` lines are one quoted span
  for (const m of answer.matchAll(/(?:^>[^\n]*(?:\n|$))+/gm)) out.push(m[0].replace(/^>\s?/gm, ''));
  return out;
}

export interface FidelityResult { readonly ok: boolean; readonly ungrounded: readonly string[] }

export function checkQuoteFidelity(answer: string, sources: readonly string[]): FidelityResult {
  const hay = sources.map(norm).join('\n');
  const ungrounded: string[] = [];
  for (const span of quotedSpans(answer)) {
    const n = norm(span).replace(/^\.\.\.|\.\.\.$/g, '').trim();
    if (n.length < QUOTE_FLOOR) continue;
    // an ellipsis inside a quote splits it into fragments, each of which must be grounded
    const parts = n.split(/\s*\.\.\.\s*/).filter((p) => p.length >= QUOTE_FLOOR);
    if (parts.some((p) => !hay.includes(p))) ungrounded.push(span);
  }
  return { ok: ungrounded.length === 0, ungrounded };
}

export const NO_TEXT_ANSWER =
  'I started to quote wording that is not in the text I have in front of me, so I won’t. '
  + 'If you tell me where to look, or let me read the passage again, I can answer from the page itself.';

export const CORRECTION_NOTE =
  'CORRECTION: your previous draft put these quotations in quotation marks, but they do not appear in the text you were given: '
  + 'QUOTES. Answer again. Quote only words that appear in the supplied text or in this conversation; otherwise paraphrase, or say you do not have the text.';
