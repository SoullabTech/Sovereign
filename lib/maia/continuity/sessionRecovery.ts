/**
 * L1 · CURRENT-SESSION-RECOVERY-01 — recovering the temporal middle.
 *
 * Authority: founder ruling 2026-09-15 — "OPEN L1 · CURRENT-SESSION-RECOVERY-01 for
 * implementation and same-day deployment, FAST/CORE only."
 * Record:    docs/programme/JARVIS-CONTINUITY-LANE1_SILVER_CEDAR_FALSIFIER_2026-09-15.md
 *
 * THE DEFECT. Every cross-session carrier excludes the current session by SQL
 * predicate (`session_id <> $2`), and the in-session aperture is the most recent
 * 3/4/5 exchanges. So turns 1..N-10 of the conversation MAIA is currently in have
 * NO carrier at all — she has better access to last week's conversation than to the
 * beginning of this one. A6 made her truthful about that gap. L1 narrows it.
 *
 * ⛔ THIS MODULE IS PURE. No I/O, no database, no cross-session reach, no summaries,
 *    no inference about the member. It scores candidates the caller already holds.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * ONE MECHANISM, NOT TWO DETECTORS — the architectural obligation.
 *
 * The pinned acceptance requires BOTH reference forms to be served by one general
 * mechanism, because an implementation that special-cases the opaque form passes the
 * behavioural probes while shipping half a contract:
 *
 *   OPAQUE    "what was that phrase I gave you earlier?"   ← no semantic clue at all
 *   SEMANTIC  "what was I saying earlier about rootedness?" ← topic carries the clue
 *
 * Both are served by ONE additive score, evaluated identically for every candidate:
 *
 *   score = retrospectiveDemand(utterance)
 *         × ( W_OVERLAP · idfOverlap(utterance, exchange)
 *           + W_DISTINCT · distinctiveness(exchange) )
 *
 * ⭐ When the utterance shares content with the sought material, `idfOverlap`
 *    dominates and the topical exchange wins. When it shares nothing — the opaque
 *    case — overlap is ~0 for EVERY candidate, so `distinctiveness` decides, and the
 *    most unusual thing the member said is exactly what "that phrase" refers to.
 *
 * ⛔ `retrospectiveDemand` is a MULTIPLICATIVE GATE, never a branch. There is no `if`
 *    on question phrasing selecting between retrieval strategies, because there is
 *    only one strategy. Every candidate traverses the identical path; only the inputs
 *    differ. That is the property the architectural guard asserts.
 *
 * ⭐ The gate is also the no-echo guarantee: ordinary conversation carries no
 *    retrospective demand, so the whole score collapses to zero and nothing is
 *    recovered. Recovery is not a background behaviour that occasionally helps; it
 *    fires only when the member reaches backwards.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const RECOVERY_SOURCE = 'current-session-recovery' as const;

/** A completed exchange from THIS session that the tier aperture does not carry. */
export interface DisplacedExchange {
  /** Durable identity. `exchange_id` where present, else a stable positional key. */
  readonly exchangeKey: string;
  /** 0-based position in this session's paired sequence. */
  readonly index: number;
  readonly timestamp: string;
  readonly userMessage: string;
  readonly maiaResponse: string;
}

export interface RecoveredExchange extends DisplacedExchange {
  /** Provenance: primary evidence from this session, never a summary or inference. */
  readonly source: typeof RECOVERY_SOURCE;
  readonly score: number;
}

/** At most this many exchanges are recovered. Small on purpose: 1–3, never 30. */
export const MAX_RECOVERED = 3;

/** Below this, nothing is recovered. Guards against ordinary-conversation echo. */
export const RECOVERY_SCORE_FLOOR = 0.12;

const W_OVERLAP = 0.75;
const W_DISTINCT = 0.25;

const STOPWORDS = new Set([
  'a','an','the','and','or','but','if','of','to','in','on','at','by','for','with',
  'about','as','is','are','was','were','be','been','being','it','its','this','that',
  'these','those','i','you','we','they','he','she','me','my','your','our','their',
  'do','does','did','have','has','had','not','no','so','than','then','there','here',
  'what','which','who','whom','when','where','why','how','can','could','would',
  'should','will','just','from','up','out','into','over','again','more','some','any',
  'all','very','really','like','get','got','know','think','one','thing','things',
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 2 && !STOPWORDS.has(t));
}

/**
 * Inverse document frequency over THIS SESSION only.
 *
 * ⭐ The corpus is the conversation itself, which is what makes "distinctive" mean
 * "unusual for this member in this conversation" rather than "rare in English".
 * `silver cedar` scores high here because it was said once in thirty-nine exchanges.
 */
function buildIdf(documents: string[]): Map<string, number> {
  const df = new Map<string, number>();
  for (const doc of documents) {
    for (const token of new Set(tokenize(doc))) {
      df.set(token, (df.get(token) ?? 0) + 1);
    }
  }
  const n = Math.max(1, documents.length);
  const idf = new Map<string, number>();
  for (const [token, count] of df) {
    idf.set(token, Math.log((n + 1) / (count + 1)) + 1);
  }
  return idf;
}

/**
 * How strongly this utterance reaches BACKWARDS, in [0, 1].
 *
 * ⛔ Not a classifier and not a branch — a continuous multiplier. Its only job is to
 * keep recovery silent during ordinary forward conversation.
 */
export function retrospectiveDemand(utterance: string): number {
  const t = ` ${utterance.toLowerCase().replace(/[^a-z0-9\s']/g, ' ').replace(/\s+/g, ' ')} `;

  // Deictic reach: words that point at an unnamed earlier moment.
  const DEIXIS = [
    ' earlier ',' before ',' previously ',' back then ',' at the start ',
    ' beginning ',' a while ago ',' just now ',' last time ',
  ];
  // Reference to prior speech acts, by either party.
  const SPEECH = [
    ' you said ',' i said ',' i told you ',' you told me ',' we talked ',
    ' we discussed ',' i mentioned ',' you mentioned ',' i gave you ',
    ' i shared ',' we were saying ',' i brought up ',
  ];
  // Retrieval requests.
  const ASK = [
    ' what was ',' what were ',' remind me ',' do you remember ',' remember ',
    ' recall ',' bring back ',' go back ',
  ];

  let signal = 0;
  if (DEIXIS.some(p => t.includes(p))) signal += 0.5;
  if (SPEECH.some(p => t.includes(p))) signal += 0.35;
  if (ASK.some(p => t.includes(p))) signal += 0.35;

  return Math.min(1, signal);
}

function idfMass(tokens: string[], idf: Map<string, number>): number {
  return tokens.reduce((sum, tok) => sum + (idf.get(tok) ?? 0), 0);
}

/** Shared-content weight between utterance and exchange, normalized to [0, 1]. */
function idfOverlap(
  utteranceTokens: string[],
  exchangeTokens: Set<string>,
  idf: Map<string, number>
): number {
  const total = idfMass(utteranceTokens, idf);
  if (total <= 0) return 0;
  const shared = utteranceTokens.filter(tok => exchangeTokens.has(tok));
  return Math.min(1, idfMass(shared, idf) / total);
}

/**
 * How unusual the MEMBER'S OWN words in this exchange are, within this session.
 *
 * ⭐ Member words only. MAIA's replies are longer and more varied, and would swamp
 * the signal — and it is the member's language the member reaches back for.
 */
function distinctiveness(
  memberTokens: string[],
  idf: Map<string, number>,
  maxIdf: number
): number {
  if (memberTokens.length === 0 || maxIdf <= 0) return 0;
  const top = [...new Set(memberTokens)]
    .map(tok => idf.get(tok) ?? 0)
    .sort((a, b) => b - a)
    .slice(0, 3);
  if (top.length === 0) return 0;
  const mean = top.reduce((a, b) => a + b, 0) / top.length;
  return Math.min(1, mean / maxIdf);
}

/**
 * Select the displaced exchanges worth bringing back for THIS utterance.
 *
 * `corpus` is every exchange in the session (aperture included) so that "distinctive"
 * is measured against the whole conversation, not only the part being searched.
 */
export function recoverDisplacedExchanges(input: {
  utterance: string;
  displaced: readonly DisplacedExchange[];
  corpus: readonly { userMessage: string; maiaResponse: string }[];
  maxRecovered?: number;
  scoreFloor?: number;
}): RecoveredExchange[] {
  const { utterance, displaced, corpus } = input;
  const maxRecovered = input.maxRecovered ?? MAX_RECOVERED;
  const scoreFloor = input.scoreFloor ?? RECOVERY_SCORE_FLOOR;

  if (displaced.length === 0 || maxRecovered <= 0) return [];

  const demand = retrospectiveDemand(utterance);
  if (demand <= 0) return []; // ⭐ the no-echo guarantee, evaluated once

  const documents = corpus.map(e => `${e.userMessage} ${e.maiaResponse}`);
  const idf = buildIdf(documents.length > 0 ? documents : displaced.map(d => d.userMessage));
  const maxIdf = Math.max(0, ...idf.values());

  const utteranceTokens = tokenize(utterance);

  const scored = displaced.map(ex => {
    const memberTokens = tokenize(ex.userMessage);
    const exchangeTokens = new Set([...memberTokens, ...tokenize(ex.maiaResponse)]);
    const overlap = idfOverlap(utteranceTokens, exchangeTokens, idf);
    const distinct = distinctiveness(memberTokens, idf, maxIdf);
    const score = demand * (W_OVERLAP * overlap + W_DISTINCT * distinct);
    return { ...ex, source: RECOVERY_SOURCE, score } satisfies RecoveredExchange;
  });

  return scored
    .filter(e => e.score >= scoreFloor)
    .sort((a, b) => (b.score - a.score) || (a.index - b.index))
    .slice(0, maxRecovered)
    .sort((a, b) => a.index - b.index); // chronological for the prompt
}

/**
 * Render recovered material as PRIMARY EVIDENCE, with its provenance visible.
 *
 * ⛔ Never presented as MAIA's recollection or as a summary. It is stated as what was
 * actually said, earlier in this same conversation, recovered because the member
 * reached for it.
 */
export function formatRecoveredForPrompt(recovered: readonly RecoveredExchange[]): string {
  if (recovered.length === 0) return '';
  const lines = recovered.map(
    e =>
      `  [exchange ${e.index + 1} of this conversation]\n` +
      `  Member: ${e.userMessage}\n` +
      `  You: ${e.maiaResponse}`
  );
  return (
    `RECOVERED FROM EARLIER IN THIS CONVERSATION (primary record, not summary or recollection)\n` +
    `The member's message appears to reach back to something said earlier here, so the ` +
    `exchange${recovered.length === 1 ? '' : 's'} below ${recovered.length === 1 ? 'was' : 'were'} ` +
    `retrieved verbatim from this session's durable record and ${recovered.length === 1 ? 'is' : 'are'} ` +
    `now present in your working context.\n` +
    lines.join('\n') +
    `\nGuidance: treat the above as something that demonstrably happened in this ` +
    `conversation — quote or refer to it directly rather than asking the member to ` +
    `reconstruct it, and do not describe it as a memory you are unsure of.`
  );
}
