/**
 * Restart authority — pure decision logic for TURN_COMPLETE → NEXT_LISTEN.
 *
 * THE P0 THIS ENCODES (2026-08-26)
 * --------------------------------
 * `ContinuousConversation` has declared since its first commit that "ONLY
 * requestRestart() can move from IDLE → ARMING → LISTENING". That function did
 * not exist — the name appeared exactly once, in the comment asserting the rule
 * — while five call sites started recognition directly and two re-arm paths each
 * decided "continue" from a different five-condition predicate.
 *
 * The failure that produced: `authorityGuard` refuses every restart unless
 * micState is IDLE or ERROR, and the post-TTS handler returned the mic to IDLE
 * only from PLAYING_TTS. A turn that ended in SUBMITTING or WAITING_FOR_TTS left
 * micState pinned at a value the guard rejects, so every later restart —
 * INCLUDING an explicit user tap — was blocked for the rest of the session.
 * MAIA answered once and went dead, on PWA and iOS alike, and tapping did
 * nothing because the tap was refused by the same guard.
 *
 * Both halves live here so they can be proven without a browser, a microphone,
 * or a device: normalization is keyed on the SET of turn-complete states, and
 * the continuation policy is one function instead of two disagreeing gates.
 */

export type MicStateName =
  | 'IDLE' | 'ARMING' | 'LISTENING' | 'CAPTURING' | 'SUBMITTING'
  | 'WAITING_FOR_TTS' | 'PLAYING_TTS' | 'INTERRUPTED' | 'ERROR';

export type RestartSourceName =
  | 'user_tap'
  | 'maia_stopped_speaking'
  | 'recognition_stopped'
  | 'interruption_end'
  | 'foreground_resume';

/**
 * States a turn may legitimately END in, from which the mic must be recoverable.
 *
 * LISTENING and CAPTURING are deliberately absent: those mean capture is live,
 * and normalizing them would stomp an in-progress utterance.
 */
export const TURN_COMPLETE_RECOVERABLE: ReadonlySet<MicStateName> = new Set<MicStateName>([
  'PLAYING_TTS',
  'WAITING_FOR_TTS',
  'SUBMITTING',
  'ARMING',
  'ERROR',
  'INTERRUPTED',
]);

/**
 * Should this state be returned to IDLE so a restart can be admitted?
 *
 * @param isStarting true when a start is genuinely in progress — an ARMING that
 *        is real, not stale. Only ARMING consults it.
 */
export function shouldNormalizeToIdle(state: MicStateName, isStarting: boolean): boolean {
  if (state === 'IDLE') return false;
  if (state === 'LISTENING' || state === 'CAPTURING') return false;
  if (!TURN_COMPLETE_RECOVERABLE.has(state)) return false;
  if (state === 'ARMING' && isStarting) return false;
  return true;
}

export interface RestartPolicyInput {
  source: RestartSourceName;
  /** HANDS_FREE active. False ⇒ push-to-talk. */
  handsFree: boolean;
  isSpeaking: boolean;
  isProcessing: boolean;
  /** A restart request is already deciding/starting. */
  requestInFlight: boolean;
  forceOverride?: boolean;
}

export interface RestartDecision {
  allowed: boolean;
  reason?: string;
}

/**
 * The single continuation policy. One function, so PWA and iOS cannot drift into
 * answering "should we listen again?" differently — which is exactly what the two
 * pre-existing gates did.
 *
 * An explicit user tap outranks continuation bookkeeping: in push-to-talk the mic
 * staying off after MAIA is by design, but the NEXT TAP must always be honoured.
 * "Push-to-talk" is not a licence for the button to stop working.
 */
export function restartPolicy(input: RestartPolicyInput): RestartDecision {
  const isUserTap = input.source === 'user_tap';

  // Re-entrancy is absolute: it protects against two starts racing, and a user
  // tap must not be allowed to double-start either.
  if (input.requestInFlight) return { allowed: false, reason: 'request_in_flight' };

  if (input.forceOverride) return { allowed: true };

  if (input.isSpeaking) return { allowed: false, reason: 'maia_speaking' };
  if (input.isProcessing) return { allowed: false, reason: 'processing' };

  // Push-to-talk declines AUTOMATIC continuation, never an explicit gesture.
  if (!isUserTap && !input.handsFree) {
    return { allowed: false, reason: 'push_to_talk_awaits_tap' };
  }

  return { allowed: true };
}

/**
 * Latches an explicit user tap is permitted to clear.
 *
 * A gesture that a stale flag silently swallows is indistinguishable from a dead
 * app. `isStarting` is cleared only when nothing is actually arming — otherwise a
 * tap during a real arming sequence would clear the latch guarding it.
 */
export function staleLatchesToClearForTap(args: {
  restartInFlight: boolean;
  isStarting: boolean;
  micState: MicStateName;
}): Array<'restartInFlight' | 'isStarting'> {
  const out: Array<'restartInFlight' | 'isStarting'> = [];
  if (args.restartInFlight) out.push('restartInFlight');
  if (args.isStarting && args.micState !== 'ARMING') out.push('isStarting');
  return out;
}
