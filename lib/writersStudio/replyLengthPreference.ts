/**
 * The writer's own choice of how long MAIA's replies should be (founder direction
 * 2026-11-05: "some want more and some need less").
 *
 * ⛔ Set ONLY by the writer pressing "Shorter" or "Say more" — never inferred from how
 *    they write, and never a judgement about them (ATTUNEMENT_DIRECTIVE).
 * ⭐ A per-device convenience in this browser, not a server-side profile. Absent, MAIA
 *    fits each reply to the request in front of her.
 */
import type { ReplyLength } from '@/lib/writersStudio/editorialDepth';

const KEY = 'ws.replyLength';

export function readReplyLength(): ReplyLength | null {
  try {
    const v = typeof window === 'undefined' ? null : window.localStorage.getItem(KEY);
    return v === 'shorter' || v === 'fuller' ? v : null;
  } catch {
    return null;
  }
}

export function chooseReplyLength(choice: ReplyLength): void {
  try { window.localStorage.setItem(KEY, choice); } catch { /* the choice still applies to this turn */ }
}

/** The request field, present only when the writer has chosen. */
export function replyLengthField(): { replyLength: ReplyLength } | Record<string, never> {
  const v = readReplyLength();
  return v ? { replyLength: v } : {};
}
