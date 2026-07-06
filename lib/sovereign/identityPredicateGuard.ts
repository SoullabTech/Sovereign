/**
 * Identity-Predicate Emission Guard
 *
 * Constitutional refusal (Invariant 16 / Constitutional Direction of Authority):
 * the SYSTEM may not author who the member is or is becoming. That authorship is
 * the member's, and moves upward only — the system holds the walls, it does not
 * fill them in.
 *
 * This is the structural (Grade B) enforcement at the final member-facing
 * emission boundary. It evaluates the OUTGOING utterance as a property, so it
 * holds regardless of which module produced the text — dead code that becomes
 * live, a weak route that reconnects, a future path. "Enforce the property, not
 * the source." It is deliberately NOT Grade A: free-text generation cannot be
 * structurally prevented, only filtered at egress.
 *
 * Scope (v1): DECLARATIVE second-person identity / becoming predicates — the
 * Conclude / Define speech acts. Out of scope by design:
 *   - Questions / presuppositions ("does this still serve who you're becoming?")
 *     → the softer reframe-sweep class; hard-guarding them would over-block
 *     legitimate invitations.
 *   - Generic copular identity ("you are a healer now") → too broad, high
 *     false-positive risk; deferred.
 *
 * Behaviour: full reframe replacement (v1 fail-safe). Surgical sentence-level
 * repair is a deliberate v1.1, after the corpus is trusted.
 */

/** The reframe that replaces a refused identity assertion. Redirects authorship
 *  to the member. NOTE: it contains "who you are becoming" inside a refusal
 *  frame — the guard must (and does) treat refusal-framed clauses as
 *  non-assertions, so the reframe never re-triggers the guard. */
export const IDENTITY_REFRAME =
  "I can't tell you who you are becoming. I can help you reflect on what your own life is already revealing.";

/** Declarative second-person identity / becoming predicates (the Conclude/Define act). */
const IDENTITY_PREDICATES: RegExp[] = [
  /\bthis is who you(?:'re| (?:truly |really )?are)(?: becoming)?\b/i,
  /\bwho you(?:'re| (?:truly |really )?are) becoming\b/i,
  /\byou(?:'re| are) becoming\b/i,
  /\bI (?:see|know|sense|witness)\b[^.?!]{0,20}\bwho you(?:'re| are)(?: becoming)?\b/i,
  /\byou have become\b/i,
];

/** Refusal / disclaimer frames. An identity phrase INSIDE one of these is a
 *  renunciation, not an assertion — exempts the canonical reframe and the
 *  Augusten-style "only your own life can reveal…" disclaimer. */
const REFUSAL_FRAMES: RegExp[] = [
  /\bI (?:can'?t|cannot|won'?t|will not|am not going to|shouldn'?t|couldn'?t) (?:tell|say|define|name|decide|know)\b/i,
  /\bonly your(?: own)? life (?:can|will|could) reveal\b/i,
  /\bisn'?t (?:meant|here) to tell you\b/i,
  /\bnot (?:for me|mine) to (?:say|tell|define|decide)\b/i,
  /\bno (?:chart|book|person|one|app) can (?:tell|define|decide)\b/i,
];

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

const isInterrogative = (sentence: string): boolean => /\?\s*$/.test(sentence);
const isRefusalFramed = (sentence: string): boolean =>
  REFUSAL_FRAMES.some((f) => f.test(sentence));

/**
 * Evaluate the outgoing utterance. If any sentence is a system-authored
 * declarative identity/becoming assertion, replace the whole response with the
 * reframe.
 *
 * @returns response (possibly reframed), wasConstrained, and the INDICES of the
 *   matched predicates (content-free — safe to log under Sanctuary).
 */
export function enforceIdentityPredicateConstraint(
  draftResponse: string,
): { response: string; wasConstrained: boolean; matchedPatternIds: number[] } {
  const ids: number[] = [];
  for (const sentence of splitSentences(draftResponse)) {
    if (isInterrogative(sentence)) continue; // questions: out of v1 scope
    if (isRefusalFramed(sentence)) continue; // disclaimers / reframes: not assertions
    IDENTITY_PREDICATES.forEach((p, i) => {
      if (p.test(sentence) && !ids.includes(i)) ids.push(i);
    });
  }
  if (ids.length > 0) {
    return { response: IDENTITY_REFRAME, wasConstrained: true, matchedPatternIds: ids.sort((a, b) => a - b) };
  }
  return { response: draftResponse, wasConstrained: false, matchedPatternIds: [] };
}

/**
 * Telemetry — console only. Sanctuary-safe BY CONSTRUCTION: logs the fact and
 * the matched pattern INDICES, never the utterance content (the reframe has
 * already replaced it).
 */
export function logIdentityGuardTelemetry(
  wasConstrained: boolean,
  matchedPatternIds: number[],
  _opts?: { sanctuary?: boolean },
): void {
  if (!wasConstrained) return;
  console.log(
    JSON.stringify({
      _tag: 'IDENTITY_PREDICATE_GUARD',
      wasConstrained,
      matchedPatternIds,
      timestamp: Date.now(),
    }),
  );
}
