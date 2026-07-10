/**
 * extractQuotes — quote finding for a body of writing, in two provenance classes.
 *
 * Works on any prose: soul portraits, manuscripts, journal entries, transcripts.
 *
 * 1. `extractQuotes` — quotes FROM THE WORK ITSELF. The LLM only *proposes*
 *    candidates; this module *authorizes* them by locating each one verbatim in
 *    the source text. Anything the model paraphrased, "improved," or invented
 *    is rejected — a quote is only returned if it exists, character-for-character,
 *    in the writing itself (modulo whitespace and curly-quote normalization, in
 *    which case the returned text is the source's own characters at the located
 *    span, never the model's rendering). This keeps extraction on the mirror
 *    side of the Mirror Invariant: the author's language is surfaced, never
 *    synthesized.
 *
 * 2. `suggestCanonQuotes` — famous quotes FROM THE WORLD'S CANON (poets,
 *    mystics, scientists, authors) that resonate with the writing. These CANNOT
 *    be verified in code, and misattribution is the classic LLM failure mode
 *    (invented Rumi, internet Einstein). So the authorization step becomes
 *    honest labeling: every canon quote carries `provenance` — 'curated' only
 *    when it matches the hand-curated FIELD_QUOTES corpus, otherwise
 *    'model-attributed' — plus the model's attribution confidence. The caveat
 *    travels with the assertion; nothing is presented as verified that isn't.
 *    Where possible each canon quote is also anchored to a verbatim-verified
 *    passage of the member's own writing, so resonance is grounded in THIS
 *    work, not generic.
 *
 * Usage:
 *   const own   = await extractQuotes(manuscript, { maxQuotes: 7 });
 *   const canon = await suggestCanonQuotes(manuscript, { maxQuotes: 5 });
 */

import { getLLMProvider, ModelTier } from '@/lib/consciousness/LLMProvider';
import { FIELD_QUOTES } from '@/lib/studio/fieldQuotes';

export interface ExtractedQuote {
  /** Exact text as it appears in the source (source characters, not the model's). */
  text: string;
  /** Character offset of the quote's first character in the source. */
  start: number;
  /** Character offset just past the quote's last character. */
  end: number;
  /** Surrounding source text (~one sentence either side) for placement when weaving. */
  context: string;
  /** The model's one-line account of why this passage carries weight. Interpretive — not the author's words. */
  resonance: string;
  /** Model-assigned strength 1–10, used only for ranking candidates. */
  score: number;
}

export interface RejectedCandidate {
  /** What the model proposed. */
  text: string;
  reason: 'not-found-verbatim' | 'too-short' | 'too-long' | 'overlaps-stronger-quote';
}

export interface QuoteExtractionResult {
  quotes: ExtractedQuote[];
  rejected: RejectedCandidate[];
  /** How many chunks the source was split into for the LLM pass. */
  chunkCount: number;
  /** Which provider actually served the extraction ('anthropic' | 'ollama' | 'mixed'). */
  provider: string;
}

export interface ExtractQuotesOptions {
  /** Maximum quotes to return after ranking (default 7). */
  maxQuotes?: number;
  /** Optional steer, e.g. "moments where the writer names a turning point". */
  guidance?: string;
  /** What kind of writing this is — shapes what "powerful" means (default 'general'). */
  kind?: 'soul-portrait' | 'manuscript' | 'journal' | 'general';
  /** LLM tier (default 'core'). */
  tier?: ModelTier;
  /** Reject candidates shorter than this many words (default 4). */
  minWords?: number;
  /** Reject candidates longer than this many words (default 80). */
  maxWords?: number;
}

const CHUNK_TARGET_CHARS = 20_000;
const CONTEXT_RADIUS_CHARS = 240;
const CANDIDATES_PER_CHUNK = 10;

const KIND_FRAMING: Record<NonNullable<ExtractQuotesOptions['kind']>, string> = {
  'soul-portrait':
    'This is a soul portrait — a reflective piece about a person. Powerful quotes are lines where the writing names something essential, turns, or lands with unusual weight.',
  manuscript:
    'This is a manuscript. Powerful quotes are lines that could stand alone — a thesis distilled, an image that carries the argument, a sentence a reader would underline.',
  journal:
    'This is personal journaling. Powerful quotes are moments of truth-telling in the writer\'s own voice — recognitions, turns, questions that open something. Prefer the writer\'s plainest, most direct lines over ornate ones.',
  general:
    'Powerful quotes are lines that could stand alone: distilled, alive, and true to the writing\'s own voice.',
};

/**
 * Extract verified verbatim quotes from a body of writing.
 * Never throws on LLM/parse trouble — degrades to fewer (or zero) quotes.
 */
export async function extractQuotes(
  text: string,
  options: ExtractQuotesOptions = {}
): Promise<QuoteExtractionResult> {
  const {
    maxQuotes = 7,
    guidance,
    kind = 'general',
    tier = 'core',
    minWords = 4,
    maxWords = 80,
  } = options;

  const source = text ?? '';
  if (source.trim().length === 0) {
    return { quotes: [], rejected: [], chunkCount: 0, provider: 'none' };
  }

  const chunks = chunkByParagraph(source, CHUNK_TARGET_CHARS);
  const normalized = buildNormalizedIndex(source);

  const rejected: RejectedCandidate[] = [];
  const verified: ExtractedQuote[] = [];
  const providers = new Set<string>();

  for (const chunk of chunks) {
    let candidates: Array<{ quote: string; why: string; score: number }> = [];
    try {
      const llm = await getLLMProvider().generateSimple({
        tier,
        systemPrompt: buildSystemPrompt(kind, guidance, minWords, maxWords),
        messages: [{ role: 'user', content: chunk }],
        maxTokens: 2000,
        temperature: 0.4,
      });
      providers.add(llm.provider);
      candidates = parseCandidates(llm.text);
    } catch (error) {
      console.error('[analysis] quote-extraction chunk failed', error);
      continue;
    }

    for (const candidate of candidates) {
      const proposed = (candidate.quote || '').trim();
      if (!proposed) continue;

      const wordCount = proposed.split(/\s+/).length;
      if (wordCount < minWords) {
        rejected.push({ text: proposed, reason: 'too-short' });
        continue;
      }
      if (wordCount > maxWords) {
        rejected.push({ text: proposed, reason: 'too-long' });
        continue;
      }

      const span = locateVerbatim(source, normalized, proposed);
      if (!span) {
        rejected.push({ text: proposed, reason: 'not-found-verbatim' });
        continue;
      }

      verified.push({
        text: span.text,
        start: span.start,
        end: span.end,
        context: extractContext(source, span.start, span.end),
        resonance: (candidate.why || '').trim(),
        score: clampScore(candidate.score),
      });
    }
  }

  const { kept, dropped } = dedupeOverlaps(verified);
  rejected.push(
    ...dropped.map((q) => ({ text: q.text, reason: 'overlaps-stronger-quote' as const }))
  );

  const quotes = kept
    .sort((a, b) => b.score - a.score)
    .slice(0, maxQuotes)
    .sort((a, b) => a.start - b.start);

  const provider =
    providers.size === 0 ? 'none' : providers.size === 1 ? [...providers][0] : 'mixed';

  console.log(
    `[analysis] quote-extraction { chunks: ${chunks.length}, candidates: ${
      verified.length + rejected.length
    }, verified: ${kept.length}, returned: ${quotes.length}, rejected: ${
      rejected.length
    }, provider: ${provider} }`
  );

  return { quotes, rejected, chunkCount: chunks.length, provider };
}

// ---------------------------------------------------------------------------
// Canon quotes — famous lines that resonate with the writing
// ---------------------------------------------------------------------------

export interface CanonQuote {
  /** The quote as the model rendered it (or the curated corpus's exact text when provenance is 'curated'). */
  text: string;
  author: string;
  /** Source work, if the model can name it. Absence is a weaker attribution signal. */
  work?: string;
  /** Why this line speaks to this particular piece of writing. Interpretive. */
  resonance: string;
  /**
   * A verbatim-verified passage of the member's own writing this quote resonates
   * with — grounds the suggestion in THIS work. Absent if the model's anchor
   * phrase could not be located in the source.
   */
  anchor?: { text: string; start: number; end: number };
  /** The model's own attribution confidence. 'medium' = weave with care, verify first. */
  confidence: 'high' | 'medium';
  /**
   * 'curated' — matches the hand-curated FIELD_QUOTES corpus (verified by curation).
   * 'model-attributed' — the attribution is the model's claim, NOT verified.
   *   Check author + work before publishing.
   */
  provenance: 'curated' | 'model-attributed';
}

export interface CanonQuoteResult {
  quotes: CanonQuote[];
  provider: string;
}

export interface SuggestCanonQuotesOptions {
  /** Maximum suggestions to return (default 5). */
  maxQuotes?: number;
  /** Optional steer, e.g. "mystics and poets only, no scientists". */
  guidance?: string;
  kind?: ExtractQuotesOptions['kind'];
  tier?: ModelTier;
}

/** How much of the writing the canon pass reads. Long texts send head + tail. */
const CANON_INPUT_BUDGET_CHARS = 24_000;

/**
 * Suggest famous quotes (authors, poets, mystics, scientists…) that resonate
 * with a body of writing. Attributions are NOT verifiable in code — each result
 * carries its provenance and confidence so the caveat travels with the quote.
 * Never throws on LLM/parse trouble — degrades to fewer (or zero) suggestions.
 */
export async function suggestCanonQuotes(
  text: string,
  options: SuggestCanonQuotesOptions = {}
): Promise<CanonQuoteResult> {
  const { maxQuotes = 5, guidance, kind = 'general', tier = 'core' } = options;

  const source = text ?? '';
  if (source.trim().length === 0) {
    return { quotes: [], provider: 'none' };
  }

  const normalized = buildNormalizedIndex(source);
  const excerpt = excerptForCanon(source);

  let provider = 'none';
  let candidates: CanonCandidate[] = [];
  try {
    const llm = await getLLMProvider().generateSimple({
      tier,
      systemPrompt: buildCanonSystemPrompt(kind, guidance, maxQuotes),
      messages: [{ role: 'user', content: excerpt }],
      maxTokens: 3000,
      temperature: 0.5,
    });
    provider = llm.provider;
    candidates = parseCanonCandidates(llm.text);
  } catch (error) {
    console.error('[analysis] canon-quotes failed', error);
    return { quotes: [], provider };
  }

  const quotes: CanonQuote[] = [];
  let disclaimed = 0;
  for (const candidate of candidates) {
    if (quotes.length >= maxQuotes) break;
    const quoteText = (candidate.quote || '').trim();
    const author = (candidate.author || '').trim();
    if (!quoteText || !author) continue;

    // Models sometimes emit an entry and then disclaim it in "why" — honor the disclaimer.
    if (
      /\b(does not|doesn'?t) (genuinely |quite |really )?(fit|speak|belong|resonate|land)|omitt?ing|omit (it|this)|skipping|removing (it|this)|not a genuine|too loose/i.test(
        candidate.why || ''
      )
    ) {
      disclaimed++;
      continue;
    }

    // Anchor the suggestion to the member's own writing where possible.
    let anchor: CanonQuote['anchor'];
    if (candidate.anchor) {
      const span = locateVerbatim(source, normalized, candidate.anchor);
      if (span) anchor = span;
    }

    // "work: Attributed/unknown/..." is an admission of no source — drop the
    // pseudo-source and downgrade confidence so the caveat travels with the quote.
    const rawWork = candidate.work?.trim();
    const hasRealWork = !!rawWork && !NON_SOURCES.test(rawWork);
    const curated = matchCurated(quoteText);
    quotes.push({
      text: curated ? curated.text : quoteText,
      author: curated?.by ?? author,
      work: hasRealWork ? rawWork : undefined,
      resonance: (candidate.why || '').trim(),
      anchor,
      confidence:
        candidate.confidence === 'medium' || (!hasRealWork && !curated) ? 'medium' : 'high',
      provenance: curated ? 'curated' : 'model-attributed',
    });
  }

  console.log(
    `[analysis] canon-quotes { candidates: ${candidates.length}, disclaimed: ${disclaimed}, suggested: ${
      quotes.length
    }, anchored: ${quotes.filter((q) => q.anchor).length}, curated: ${
      quotes.filter((q) => q.provenance === 'curated').length
    }, provider: ${provider} }`
  );

  return { quotes, provider };
}

interface CanonCandidate {
  quote: string;
  author: string;
  work?: string;
  why: string;
  anchor?: string;
  confidence?: string;
}

function buildCanonSystemPrompt(
  kind: NonNullable<ExtractQuotesOptions['kind']>,
  guidance: string | undefined,
  maxQuotes: number
): string {
  return [
    'You suggest famous quotes — from authors, poets, mystics, scientists, philosophers — that genuinely resonate with a piece of writing you are given. The quotes will be woven into or alongside the writing, so they must speak to what THIS writing is actually doing, not merely share a topic.',
    KIND_FRAMING[kind],
    guidance ? `Additional steer from the requester: ${guidance}` : '',
    '',
    `Return up to ${maxQuotes} suggestions as a JSON array, nothing else — no prose, no code fences:`,
    '[{"quote": "...", "author": "...", "work": "...", "why": "...", "anchor": "...", "confidence": "high"}]',
    '',
    'Rules — attribution honesty is the hard constraint:',
    '- Only include quotes you are confident are REAL and CORRECTLY attributed. Wrong attribution is worse than no quote.',
    '- Never include lines commonly misattributed on the internet (fake Rumi, fake Einstein, fake Buddha) unless you can name the actual source work.',
    '- "work" is the source text if you know it; omit the field if you do not. A named work is a stronger attribution.',
    '- "confidence" is "high" only when you are sure of both wording and attribution; otherwise "medium".',
    '- Prefer older, well-documented, public-domain sources when quality is equal.',
    '- "anchor" is a short phrase (5–15 words) copied EXACTLY, character for character, from the writing — the passage this quote resonates with.',
    '- "why" is ONE short sentence (under 25 words) on the resonance between the quote and this writing.',
    '- Fewer true resonances beat many loose ones. If nothing genuinely fits, return [].',
    '- Decide whether an entry fits BEFORE writing it. If you realize mid-entry that it does not fit, OMIT the entry entirely — never emit an entry whose "why" disclaims it.',
  ]
    .filter(Boolean)
    .join('\n');
}

function parseCanonCandidates(raw: string): CanonCandidate[] {
  const parsed = parseJsonArrayLoosely(raw);
  if (!parsed) {
    console.warn(
      `[analysis] canon-quotes: unparseable LLM output — head: ${JSON.stringify(
        raw.slice(0, 120)
      )} tail: ${JSON.stringify(raw.slice(-160))}`
    );
    return [];
  }
  return parsed.filter(
    (item) => item && typeof item.quote === 'string' && typeof item.author === 'string'
  );
}

/**
 * Extract a JSON array from LLM output: skips fences/prose, unwraps
 * {"quotes": [...]}-style objects, and repairs output truncated mid-array by
 * walking the text with a string-aware state machine and cutting back to the
 * last complete array element (immune to ']' or '}' inside quote strings).
 */
function parseJsonArrayLoosely(raw: string): any[] | null {
  const text = raw.trim();
  const start = text.indexOf('[');
  const objStart = text.indexOf('{');

  // Object wrapper before any array: {"quotes": [...]}
  if (objStart !== -1 && (start === -1 || objStart < start)) {
    const objEnd = text.lastIndexOf('}');
    if (objEnd > objStart) {
      try {
        const obj = JSON.parse(text.slice(objStart, objEnd + 1));
        const arr = Array.isArray(obj) ? obj : Object.values(obj).find(Array.isArray);
        if (Array.isArray(arr)) return arr;
      } catch {
        // fall through to array handling
      }
    }
  }

  if (start === -1) return null;

  // Walk from '[', tracking string/escape state and nesting depth. Record the
  // position after each complete top-level element; a clean ']' at depth 1 is
  // the true end of the array.
  let depth = 0;
  let inString = false;
  let escaped = false;
  let lastElementEnd = -1;
  for (let i = start; i < text.length; i++) {
    const c = text[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (c === '\\') escaped = true;
      else if (c === '"') inString = false;
      continue;
    }
    if (c === '"') inString = true;
    else if (c === '[' || c === '{') depth++;
    else if (c === '}') {
      depth--;
      if (depth === 1) lastElementEnd = i; // a top-level element just closed
    } else if (c === ']') {
      depth--;
      if (depth === 0) {
        try {
          const arr = JSON.parse(text.slice(start, i + 1));
          if (Array.isArray(arr)) return arr;
        } catch {
          // malformed despite balanced brackets — fall through to repair
        }
        break;
      }
    }
  }

  // Truncation repair: close the array after the last complete element.
  if (lastElementEnd > start) {
    try {
      const arr = JSON.parse(`${text.slice(start, lastElementEnd + 1)}]`);
      if (Array.isArray(arr)) return arr;
    } catch {
      // give up
    }
  }
  return null;
}

/** "work" values that are really an admission of no source. */
const NON_SOURCES = /^(attributed|unknown|various|uncertain|unsourced|n\/a|traditional)\b/i;

/** Head + tail excerpt so very long manuscripts still fit the canon pass. */
function excerptForCanon(source: string): string {
  if (source.length <= CANON_INPUT_BUDGET_CHARS) return source;
  const half = Math.floor(CANON_INPUT_BUDGET_CHARS / 2);
  return `${source.slice(0, half)}\n\n[… middle of the text omitted …]\n\n${source.slice(-half)}`;
}

/** Match a proposed quote against the hand-curated corpus (normalized compare). */
function matchCurated(proposed: string): { text: string; by: string | null } | null {
  const needle = buildNormalizedIndex(proposed).norm.trim();
  if (!needle) return null;
  for (const fq of FIELD_QUOTES) {
    if (buildNormalizedIndex(fq.text).norm.trim() === needle) {
      return { text: fq.text, by: fq.by };
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Prompt + parsing
// ---------------------------------------------------------------------------

function buildSystemPrompt(
  kind: NonNullable<ExtractQuotesOptions['kind']>,
  guidance: string | undefined,
  minWords: number,
  maxWords: number
): string {
  return [
    'You select powerful quotes from a piece of writing. You do not write, edit, or improve anything.',
    KIND_FRAMING[kind],
    guidance ? `Additional steer from the requester: ${guidance}` : '',
    '',
    `Return up to ${CANDIDATES_PER_CHUNK} quotes as a JSON array, nothing else — no prose, no code fences:`,
    '[{"quote": "...", "why": "...", "score": 7}]',
    '',
    'Rules:',
    `- "quote" must be copied EXACTLY, character for character, from the text: same words, same punctuation, same capitalization. Never paraphrase, trim words from the middle, or fix anything. Quotes that are not exact copies will be discarded.`,
    `- Each quote is a contiguous passage of ${minWords}–${maxWords} words. Complete sentences or complete clauses only.`,
    '- "why" is one short sentence on what makes the line carry weight.',
    '- "score" is 1–10 for how strongly the line stands alone.',
    '- Fewer strong quotes beat many weak ones. If nothing qualifies, return [].',
  ]
    .filter(Boolean)
    .join('\n');
}

function parseCandidates(raw: string): Array<{ quote: string; why: string; score: number }> {
  const stripped = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '');
  // Grab the outermost JSON array even if the model added prose around it.
  const start = stripped.indexOf('[');
  const end = stripped.lastIndexOf(']');
  if (start === -1 || end === -1 || end <= start) return [];
  try {
    const parsed = JSON.parse(stripped.slice(start, end + 1));
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item) => item && typeof item.quote === 'string')
      .map((item) => ({
        quote: item.quote,
        why: typeof item.why === 'string' ? item.why : '',
        score: typeof item.score === 'number' ? item.score : 5,
      }));
  } catch {
    console.warn('[analysis] quote-extraction: unparseable LLM output, skipping chunk');
    return [];
  }
}

function clampScore(score: number): number {
  if (!Number.isFinite(score)) return 5;
  return Math.min(10, Math.max(1, Math.round(score)));
}

// ---------------------------------------------------------------------------
// Verbatim location — the authorization step
// ---------------------------------------------------------------------------

interface NormalizedIndex {
  /** Lowercased, quote-normalized, whitespace-collapsed rendering of the source. */
  norm: string;
  /** map[i] = offset in the original source of the character behind norm[i]. */
  map: number[];
}

const CHAR_NORMALIZATION: Record<string, string> = {
  '‘': "'", // ‘
  '’': "'", // ’
  '“': '"', // “
  '”': '"', // ”
  '–': '-', // –
  '—': '-', // —
  '…': '...', // … (expands; handled below)
};

function buildNormalizedIndex(source: string): NormalizedIndex {
  const chars: string[] = [];
  const map: number[] = [];
  let prevSpace = false;
  for (let i = 0; i < source.length; i++) {
    let c = CHAR_NORMALIZATION[source[i]] ?? source[i];
    if (/\s/.test(c)) {
      if (prevSpace) continue;
      c = ' ';
      prevSpace = true;
    } else {
      prevSpace = false;
    }
    // A source char may normalize to several chars (e.g. … → ...): map each back to i.
    for (const out of c.toLowerCase()) {
      chars.push(out);
      map.push(i);
    }
  }
  return { norm: chars.join(''), map };
}

function locateVerbatim(
  source: string,
  index: NormalizedIndex,
  proposed: string
): { text: string; start: number; end: number } | null {
  // Fast path: exact substring.
  const exact = source.indexOf(proposed);
  if (exact !== -1) {
    return { text: proposed, start: exact, end: exact + proposed.length };
  }

  // Tolerant path: match under normalization, then return the SOURCE's own span.
  const needle = buildNormalizedIndex(proposed).norm.trim();
  if (needle.length === 0) return null;
  const at = index.norm.indexOf(needle);
  if (at === -1) return null;

  const start = index.map[at];
  const end = index.map[at + needle.length - 1] + 1;
  return { text: source.slice(start, end), start, end };
}

// ---------------------------------------------------------------------------
// Chunking, context, dedupe
// ---------------------------------------------------------------------------

function chunkByParagraph(source: string, targetChars: number): string[] {
  if (source.length <= targetChars) return [source];
  const paragraphs = source.split(/(?<=\n)\s*\n/);
  const chunks: string[] = [];
  let current = '';
  for (const paragraph of paragraphs) {
    if (current.length + paragraph.length > targetChars && current.length > 0) {
      chunks.push(current);
      current = '';
    }
    current += paragraph;
    // A single paragraph larger than the target ships as its own oversized chunk.
    if (current.length > targetChars) {
      chunks.push(current);
      current = '';
    }
  }
  if (current.trim().length > 0) chunks.push(current);
  return chunks;
}

function extractContext(source: string, start: number, end: number): string {
  const from = Math.max(0, start - CONTEXT_RADIUS_CHARS);
  const to = Math.min(source.length, end + CONTEXT_RADIUS_CHARS);
  let context = source.slice(from, to).replace(/\s+/g, ' ').trim();
  if (from > 0) context = `…${context}`;
  if (to < source.length) context = `${context}…`;
  return context;
}

function dedupeOverlaps(quotes: ExtractedQuote[]): {
  kept: ExtractedQuote[];
  dropped: ExtractedQuote[];
} {
  const byStrength = [...quotes].sort(
    (a, b) => b.score - a.score || b.text.length - a.text.length
  );
  const kept: ExtractedQuote[] = [];
  const dropped: ExtractedQuote[] = [];
  for (const quote of byStrength) {
    const overlaps = kept.some((k) => quote.start < k.end && k.start < quote.end);
    if (overlaps) dropped.push(quote);
    else kept.push(quote);
  }
  return { kept, dropped };
}
