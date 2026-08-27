/**
 * TTS text sanitization — what MAIA speaks aloud, as distinct from what she writes.
 *
 * Extracted from `app/api/voice/stream-conversation/route.ts` on 2026-08-27 so
 * it can be tested. A Next.js App Router route file may only export HTTP verbs
 * and route config, so a helper living there is unreachable from a test — and
 * this one had a defect in production that no test could have caught while it
 * stayed private.
 *
 * The defect: MAIA read shell commands aloud, backticks included. A response
 * containing a fenced code block was synthesized verbatim as "backtick backtick
 * backtick bash docker compose up dash d dash dash build". The JSON and
 * metadata rules never matched it, because a code fence is neither.
 *
 * ⭐ The written text is untouched. This governs the SPOKEN form only: the
 * member reads the command on screen and hears the prose around it.
 */

/**
 * Sanitize text before sending to TTS.
 * Removes metadata blocks, JSON fragments, and other non-speakable content.
 * Defense-in-depth: even if ClaudeService filters, this guarantees clean input.
 */
export function sanitizeForTts(input: string): string {
  if (!input) return '';

  let s = input;

  // ── Code and markdown must never be spoken ──────────────────────────────
  //
  // MAIA was reading shell commands aloud, backticks included: a response
  // containing a fenced block was synthesized verbatim as "backtick backtick
  // backtick bash docker compose up dash d dash dash build". The JSON and
  // metadata rules below never matched it, because a code fence is neither.
  //
  // The TEXT still shows the code on screen — only the SPOKEN form drops it.
  // The member reads the command and hears the prose around it, which is what
  // was meant all along.
  //
  // ⛔ Order matters: fenced blocks first. Run the inline-code rule first and
  // it eats the fence delimiters as if they were spans, leaving the code body
  // behind as bare speakable text — the exact defect, harder to see.
  s = s.replace(/```[\s\S]*?```/g, ' ');
  // An unterminated fence (streaming can split one mid-chunk) — drop the tail
  // rather than speak it.
  s = s.replace(/```[\s\S]*$/g, ' ');
  // Indented code blocks: four+ spaces at line start, whole line.
  s = s.replace(/^[ \t]{4,}\S.*$/gm, ' ');
  // Inline spans: keep the word, drop the backticks. `af_kore` reads fine;
  // "backtick af underscore kore backtick" does not.
  s = s.replace(/`([^`\n]*)`/g, '$1');
  // Any stray backtick left over.
  s = s.replace(/`/g, '');
  // ATX headers: keep the words, drop the hashes.
  s = s.replace(/^#{1,6}[ \t]+/gm, '');
  // Emphasis markers spoken as "asterisk asterisk".
  s = s.replace(/\*\*([^*]*)\*\*/g, '$1');
  s = s.replace(/__([^_]*)__/g, '$1');
  s = s.replace(/(^|\s)\*([^*\n]+)\*(?=\s|$)/g, '$1$2');
  // Markdown links: speak the label, not the URL.
  s = s.replace(/\[([^\]]*)\]\(([^)]*)\)/g, '$1');
  // Horizontal rules.
  s = s.replace(/^\s*([-*_])\1{2,}\s*$/gm, ' ');

  // Remove full metadata blocks
  s = s.replace(/---SOUL_METADATA---[\s\S]*?---END_METADATA---/g, '');

  // Remove JSON objects that sometimes leak as "sentences"
  s = s.replace(/\{[\s\S]*?\}/g, '');

  // Remove JSON arrays
  s = s.replace(/\[[\s\S]*?\]/g, '');

  // Remove orphan JSON fragments at start/end
  s = s.replace(/^[\s\d,}\]]+/, '');
  s = s.replace(/[\s\d,{\[]+$/, '');

  // Collapse whitespace and trim
  s = s.replace(/\s+/g, ' ').trim();

  return s;
}
