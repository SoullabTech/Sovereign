/**
 * In-place message injection — the rule that decides whether a room's handoff
 * actually sends.
 *
 * A room (e.g. a kept reflection) can hand a member-composed message into the
 * canonical conversation without moving the member to /maia. Two properties
 * have to hold, and both are decided here so they can be tested apart from the
 * 10k-line conversation surface:
 *
 *  1. A re-render never resends. React re-runs effects on every dependency
 *     identity change; without a nonce, an unchanged message would be sent
 *     repeatedly and the member would watch their own words duplicate.
 *
 *  2. The SAME text can be sent again when the member asks for it. Deduping on
 *     text would silently swallow a deliberate second send — the member says
 *     "discuss this" twice and the second one vanishes. The nonce, minted per
 *     member gesture, is what makes a resend explicit.
 *
 * This decides only WHETHER to send. It never clears, replaces, or reorders the
 * transcript: injection appends to the running conversation (contrast the seed
 * channel in lib/maia/seedPrompt, which starts a fresh one on navigation).
 */

export interface InjectedMessage {
  text: string;
  nonce: number;
}

export interface InjectionDecision {
  /** Send this text now. */
  send: boolean;
  /** The nonce to record as handled (null when nothing was consumed). */
  nonce: number | null;
  /** Trimmed payload — only present when send is true. */
  text?: string;
}

/**
 * @param lastNonce the nonce already handled by this conversation, or null
 * @param injected  the current injected message, or null/undefined when none
 */
export function decideInjection(
  lastNonce: number | null,
  injected: InjectedMessage | null | undefined,
): InjectionDecision {
  if (!injected) return { send: false, nonce: null };

  const { text, nonce } = injected;
  if (typeof nonce !== 'number' || !Number.isFinite(nonce)) {
    return { send: false, nonce: null };
  }
  // Already handled — this is a re-render, not a new gesture.
  if (lastNonce === nonce) return { send: false, nonce: null };

  const payload = typeof text === 'string' ? text.trim() : '';
  // An empty gesture is still consumed: recording the nonce stops a later
  // re-render from re-evaluating it, and there is nothing to send either way.
  if (!payload) return { send: false, nonce };

  return { send: true, nonce, text: payload };
}
