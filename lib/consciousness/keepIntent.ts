// lib/consciousness/keepIntent.ts
// KEEP-INTENT-01 / T1A-J5 — deterministic recognition of Keep-adjacent member acts.
// No model calls. No side effects. No persistence.
//
// ═══════════════════════════════════════════════════════════════════════════
// MEMBER-ACT AUTHORITY CONTRACT
//
//   UNDERSTAND   Recognition names what the member expressed.
//   FACILITATE   The House may offer only the affordance belonging to that act.
//   COMMIT       Only a separately authorized substrate may persist/resume it.
//
// Recognition must never silently collapse one governed act into another.
// KEEP and CONTINUE are distinct. Availability may affect execution; it may not
// redefine member meaning. The recognizer deliberately remains non-consuming so
// relational speech still reaches MAIA and receives a reply.
// ═══════════════════════════════════════════════════════════════════════════

export type RecognizedMemberAct = 'keep' | 'continue' | 'open_keep';
export type IntentResolution = 'resolved' | 'ambiguous' | 'ordinary';

export interface RecognizedActMatch {
  act: RecognizedMemberAct;
  /** The exact normalized phrase that supported this recognition. */
  matched: string;
}

export interface KeepIntentResult {
  resolution: IntentResolution;
  /** Ordered by the member's utterance; one entry per distinct governed act. */
  acts: readonly RecognizedActMatch[];
}

const ORDINARY: KeepIntentResult = { resolution: 'ordinary', acts: [] };

type Span = { phrase: string; start: number; end: number };
type ActSpan = Span & { act: RecognizedMemberAct };

/**
 * Explicit commands to open the Keep surface. These name Keep as a thing to be
 * opened; they are interface requests, not persistence acts.
 */
const OPEN_KEEP_PHRASES = [
  'open keep',
  'open the keep',
  'open up keep',
  'bring up keep',
  'show me keep',
  'show keep',
  'keep function',
  'keep panel',
  'i want to keep something',
  'i want to keep some things',
  'i would like to keep something',
  "i'd like to keep something",
];

/** The member deliberately asks to persist selected present material. */
const KEEP_MATERIAL_PHRASES = [
  'keep this',
  'keep that moment',
  'keep this moment',
  'keeping this',
  'mark this',
  'mark that moment',
  'remember this moment',
  'remember this exchange',
  'remember this part',
  'save this moment',
  'save this part',
  'hold onto this',
  'hold on to this',
  'bookmark this',
];

/**
 * Ordinary constructions that happen to contain a positive Keep substring.
 * These remain lexical guards for KEEP only. CONTINUE is positively recognized
 * as its own act; it is never implemented by expanding this blacklist.
 */
const FALSE_FRIENDS = [
  'keep this up',
  'keep this going',
  'keep that up',
  'keep that going',
  'keep this in mind',
  'keep that in mind',
  'keep this door open',
  'keep this to yourself',
  'keep this between us',
  'keep this brief',
  'keep this short',
  'keep this simple',
  'mark this as read',
];

/**
 * CONTINUE means leave / return to a conversational thread across a boundary.
 * It does NOT mean every request to keep talking in the present encounter.
 * Positive patterns are intentionally bounded to deictic thread-like language.
 */
const CONTINUE_PATTERNS: readonly RegExp[] = [
  /\bkeep (?:this|that)(?: (?:question|thread|conversation|topic|issue|thought))? open\b/g,
  /\bleave (?:this|that)(?: (?:question|thread|conversation|topic|issue|thought))? open\b/g,
  /\bcome back to (?:this|that)(?: (?:question|thread|conversation|topic|issue|thought))?\b/g,
  /\breturn to (?:this|that)(?: (?:question|thread|conversation|topic|issue|thought))?\b/g,
];

/** Normalize for matching: lowercase, collapse whitespace, strip curly quotes. */
function normalize(message: string): string {
  return message
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function phraseOccurrences(text: string, phrase: string): Span[] {
  const spans: Span[] = [];
  let at = text.indexOf(phrase);
  while (at !== -1) {
    spans.push({ phrase, start: at, end: at + phrase.length });
    at = text.indexOf(phrase, at + 1);
  }
  return spans;
}

function spanOverlaps(a: Pick<Span, 'start' | 'end'>, b: Pick<Span, 'start' | 'end'>): boolean {
  return a.start < b.end && b.start < a.end;
}

function occurrenceIsInsideFalseFriend(text: string, span: Span): boolean {
  return FALSE_FRIENDS.some((ff) =>
    phraseOccurrences(text, ff).some((guard) => span.start >= guard.start && span.end <= guard.end),
  );
}

function findPhraseSpan(text: string, phrases: readonly string[]): Span | null {
  // Preserve KEEP-INTENT-01 reporting behavior: prefer the longest supported
  // phrase, then its earliest usable occurrence.
  const ordered = [...phrases].sort((a, b) => b.length - a.length);
  for (const phrase of ordered) {
    const hit = phraseOccurrences(text, phrase)[0];
    if (hit) return hit;
  }
  return null;
}

function findContinueSpans(text: string): Span[] {
  const spans: Span[] = [];
  for (const pattern of CONTINUE_PATTERNS) {
    pattern.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(text)) !== null) {
      spans.push({ phrase: match[0], start: match.index, end: match.index + match[0].length });
      if (match[0].length === 0) pattern.lastIndex += 1;
    }
  }
  return spans.sort((a, b) => a.start - b.start || b.end - b.start - (a.end - a.start));
}

function findKeepSpan(text: string, continueSpans: readonly Span[]): Span | null {
  const ordered = [...KEEP_MATERIAL_PHRASES].sort((a, b) => b.length - a.length);
  for (const phrase of ordered) {
    for (const span of phraseOccurrences(text, phrase)) {
      if (occurrenceIsInsideFalseFriend(text, span)) continue;
      // A CONTINUE phrase such as "keep this question open" contains the bytes
      // "keep this". The larger governed act owns that occurrence.
      if (continueSpans.some((continuation) => spanOverlaps(span, continuation))) continue;
      return span;
    }
  }
  return null;
}

function firstSpan(text: string, pattern: RegExp): Span | null {
  pattern.lastIndex = 0;
  const match = pattern.exec(text);
  if (!match) return null;
  return { phrase: match[0], start: match.index, end: match.index + match[0].length };
}

function toResult(spans: ActSpan[]): KeepIntentResult {
  if (spans.length === 0) return ORDINARY;

  const ordered = [...spans].sort((a, b) => a.start - b.start);
  const seen = new Set<RecognizedMemberAct>();
  const acts: RecognizedActMatch[] = [];
  for (const span of ordered) {
    if (seen.has(span.act)) continue;
    seen.add(span.act);
    acts.push({ act: span.act, matched: span.phrase });
  }
  return { resolution: 'resolved', acts };
}

/**
 * Recognize Keep-adjacent governed member acts in an utterance.
 *
 * The historical function name is retained to keep this repair bounded. Its
 * result is now multi-act because a member may author both KEEP and CONTINUE in
 * one sentence. The recognizer opens nothing, writes nothing, and knows nothing
 * about Sanctuary; callers own execution boundaries.
 */
export function detectKeepIntent(message: string): KeepIntentResult {
  if (!message) return ORDINARY;
  const text = normalize(message);

  // An explicit request to open the House surface remains the operational
  // reading of phrases such as "open Keep so I can keep this". Opening the
  // surface itself persists nothing.
  const open = findPhraseSpan(text, OPEN_KEEP_PHRASES);
  if (open) return toResult([{ ...open, act: 'open_keep' }]);

  const continueSpans = findContinueSpans(text);
  const keepSpan = findKeepSpan(text, continueSpans);

  // "Keep this and leave it open" authors two acts. "Leave it open" alone is
  // context-dependent and therefore not promoted into CONTINUE by this bounded
  // recognizer; paired with an explicit Keep referent, its referent is clear.
  if (keepSpan && continueSpans.length === 0) {
    const compoundContinue = firstSpan(text, /\bleave it open\b/g);
    if (compoundContinue) continueSpans.push(compoundContinue);
  }

  const spans: ActSpan[] = [];
  if (keepSpan) spans.push({ ...keepSpan, act: 'keep' });
  if (continueSpans[0]) spans.push({ ...continueSpans[0], act: 'continue' });

  return toResult(spans);
}
