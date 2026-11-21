/**
 * MAIA VOICE — ECHO GUARD DECISION SEAM.
 *
 * WHY THIS EXISTS
 *   A beta tester reported (2026-11-18): "I have talked for minutes at a time
 *   and it appears she is listening as text of what I say is transcribing but
 *   then it's gone and she says — I am here —".
 *
 *   The cause was an echo guard in ContinuousConversation that blocked a member
 *   turn when the transcript contained any of a static list of English phrases
 *   — 'yes', 'pause', 'i notice', 'what does', 'quality of' — and was under 15
 *   words. Substring matched, so 'yes' fired inside "eyes". Nine of ten
 *   ordinary utterances were discarded. The member's words were deleted and no
 *   turn was ever sent; MAIA, given nothing, answered with bare presence.
 *
 * WHAT ACTUALLY PREVENTS ECHO
 *   Input is already dropped at the recognition handler while MAIA is speaking
 *   (two guards on isSpeakingRef). Any transcript reaching this decision was
 *   therefore captured while MAIA was SILENT. The only echo this seam can still
 *   catch is TAIL echo: audio that was in flight as speech ended.
 *
 *   So the comparison is against WHAT MAIA ACTUALLY SAID, inside a bounded
 *   window after speech ended — the same shape as the dedup checks beside it,
 *   which compare against what was actually last sent within 1–2 seconds. A
 *   static word list cannot distinguish a member from a machine, because
 *   members say these words too.
 *
 * THE ASYMMETRY THAT GOVERNS THIS SEAM
 *   A false block deletes a person's speech silently and tells them "I am
 *   here." A false pass sends MAIA a stray fragment of her own sentence, which
 *   she can handle and the member can see. These costs are not equal, and this
 *   decision is deliberately biased toward letting speech through.
 */

export const ECHO_DECISION = Object.freeze({
  SEND: 'SEND',
  BLOCK_AS_ECHO: 'BLOCK_AS_ECHO',
});

/**
 * How long after MAIA's speech ends tail echo remains plausible. Beyond this,
 * audio reaching the microphone is the member. Deliberately short.
 */
export const ECHO_TAIL_WINDOW_MS = 1500;

/** Overlap at which a transcript is treated as MAIA's own words coming back. */
export const ECHO_SIMILARITY_THRESHOLD = 0.8;

export interface EchoDecisionInput {
  /** The member transcript about to be sent. */
  transcript: string;
  /** What MAIA actually last spoke, if anything. */
  maiaLastUtterance: string | null | undefined;
  /** Milliseconds since MAIA's speech ended. null when MAIA has not spoken. */
  msSinceMaiaSpokeEnded: number | null | undefined;
}

export interface EchoDecision {
  decision: typeof ECHO_DECISION[keyof typeof ECHO_DECISION];
  /** Overlap actually measured, when one was. Null when no comparison ran. */
  similarity: number | null;
  reason: string;
}

const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();

/** Fraction of the transcript's words that appear in MAIA's utterance. */
export function overlapAgainstUtterance(transcript: string, utterance: string): number {
  const t = normalize(transcript);
  const u = normalize(utterance);
  if (!t || !u) return 0;
  const uWords = new Set(u.split(' '));
  const tWords = t.split(' ');
  const hits = tWords.filter((w) => uWords.has(w)).length;
  return hits / tWords.length;
}

/**
 * THE DECISION. Pure. No I/O, no clock, no DOM — every input is passed in, so
 * every case is reachable in a test.
 *
 * Blocks only when ALL of these hold:
 *   1. MAIA actually spoke (there is an utterance to compare against), AND
 *   2. speech ended within the tail window, AND
 *   3. the transcript substantially overlaps WHAT SHE SAID.
 *
 * Anything else is the member speaking, and is sent.
 */
export function decideEcho(input: EchoDecisionInput): EchoDecision {
  const send = (reason: string, similarity: number | null = null): EchoDecision =>
    ({ decision: ECHO_DECISION.SEND, similarity, reason });

  const transcript = (input.transcript ?? '').trim();
  if (!transcript) return send('empty transcript — nothing to decide');

  const utterance = (input.maiaLastUtterance ?? '').trim();
  if (!utterance) return send('MAIA has not spoken — no echo is possible');

  const since = input.msSinceMaiaSpokeEnded;
  if (typeof since !== 'number' || !Number.isFinite(since) || since < 0) {
    // Unknown timing cannot be treated as "just spoke". Failing closed here
    // would mean deleting member speech on missing telemetry.
    return send('speech timing unknown — not treated as the tail window');
  }
  if (since > ECHO_TAIL_WINDOW_MS) {
    return send(`${since}ms since MAIA spoke — beyond the ${ECHO_TAIL_WINDOW_MS}ms tail window`);
  }

  const similarity = overlapAgainstUtterance(transcript, utterance);
  if (similarity >= ECHO_SIMILARITY_THRESHOLD) {
    return {
      decision: ECHO_DECISION.BLOCK_AS_ECHO,
      similarity,
      reason: `matches MAIA's own last utterance (${similarity.toFixed(2)}) within ${since}ms of her speech ending`,
    };
  }
  return send(`does not match MAIA's last utterance (${similarity.toFixed(2)})`, similarity);
}
