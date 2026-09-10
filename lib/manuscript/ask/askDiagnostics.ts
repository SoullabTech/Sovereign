/**
 * Why a structured call did not answer — kept internally, never shown.
 *
 * THE DEFECT THIS REPAIRS. `askMaiaDevelopmental` collapsed every failure to the
 * single word `unreachable`: the structured router's refusal identity was
 * discarded at `if (!outcome.ok)`, and unexpected exceptions were discarded by a
 * bare `catch`. On 2026-09-10 a duplicated `ANTHROPIC_API_KEY` produced a 217-char
 * header; the provider knew precisely what was wrong and the operator saw one
 * word. That is not a sovereignty property. It is lost observability, and it cost
 * an afternoon.
 *
 * WHAT THIS DOES NOT CHANGE.
 *   - member-facing semantics: the Ask still refuses as `unreachable`
 *   - protocol and authority: no retry, no fallback provider, no changed
 *     disclosure behaviour, no changed may_cross rules
 *   - the returned outcome shape: this seam LOGS, it does not widen any type,
 *     so no field can leak into an API response by being spread
 *
 * ⛔ SECRETS AND PROSE ARE NEVER LOGGED. A provider exception is arbitrary text
 * from outside this system. It is redacted and then bounded before it is written,
 * in that order, so a truncated credential cannot survive as a fragment. THE CAP
 * IS THE PROSE DEFENCE: we would rather lose the tail of a diagnostic than
 * discover that logs had quietly become a second manuscript store.
 *
 * Authority: founder ruling 2026-09-10 (narrow diagnostic repair, authorized
 * before REVISION-COLLABORATION-01 GENERATE PROPOSALS).
 */

/** Longest cause we will write. Deliberately short. */
const CAUSE_MAX = 240;

/** Credential shapes, redacted by pattern rather than by hoping none appear. */
const REDACTIONS: readonly (readonly [RegExp, string])[] = [
  [/sk-ant-[A-Za-z0-9_\-]+/g, 'sk-ant-[REDACTED]'],
  [/\bBearer\s+\S+/gi, 'Bearer [REDACTED]'],
  [/\b[A-Za-z0-9_\-]{40,}\b/g, '[REDACTED-TOKEN]'],
];

/**
 * Bounded, credential-free rendering of an arbitrary provider cause.
 *
 * Redaction runs BEFORE truncation on purpose: truncating first could leave the
 * head of a key in place with nothing left to match against.
 */
export function sanitizeCause(detail: unknown): string {
  if (detail === undefined || detail === null) return '(none)';
  const raw = detail instanceof Error ? detail.message : String(detail);
  let out = raw;
  for (const [pattern, replacement] of REDACTIONS) out = out.replace(pattern, replacement);
  out = out.replace(/\s+/g, ' ').trim();
  if (out.length === 0) return '(empty)';
  return out.length > CAUSE_MAX ? `${out.slice(0, CAUSE_MAX)}…[truncated]` : out;
}

/**
 * A provider request id, when the SDK attached one. Best effort and never
 * required: its absence is reported as absence, not guessed at.
 */
export function requestIdOf(err: unknown): string | undefined {
  if (typeof err !== 'object' || err === null) return undefined;
  const bag = err as Record<string, unknown>;
  for (const key of ['request_id', 'requestID', 'requestId']) {
    const v = bag[key];
    if (typeof v === 'string' && v.length > 0 && v.length <= 128) return v;
  }
  return undefined;
}

export interface AskDiagnostic {
  /** Where in the pipeline the answer was lost. */
  stage: 'structured_inference';
  /** The router's own refusal identity, or `exception` for an unexpected throw. */
  refusal: string;
  /** The pinned model. Known without asking the provider anything. */
  model: string;
  /** Redacted, bounded. Never prose, never a credential. */
  cause: string;
  requestId?: string;
}

/** The one discoverable line. Marker is stable; grep for it. */
export const ASK_DIAGNOSTIC_MARKER = '[MAIA/ask] structured-refusal';

export function formatAskDiagnostic(d: AskDiagnostic): string {
  const parts = [
    `stage=${d.stage}`,
    `refusal=${d.refusal}`,
    `model=${d.model}`,
    d.requestId ? `request_id=${d.requestId}` : 'request_id=(none)',
    `cause=${d.cause}`,
  ];
  return `${ASK_DIAGNOSTIC_MARKER} ${parts.join(' ')}`;
}

export function logAskDiagnostic(d: AskDiagnostic): void {
  // eslint-disable-next-line no-console
  console.warn(formatAskDiagnostic(d));
}
