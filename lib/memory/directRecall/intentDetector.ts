/**
 * intentDetector.ts — Direct Recall Intent Detection
 *
 * Detects when a member is asking for something specific they saved,
 * as opposed to making a general conversational statement.
 *
 * Conservative by design: false negatives (missing a recall intent)
 * are preferable to false positives (intercepting a normal message).
 *
 * Also manages ephemeral pending recall state — the ref offered on the
 * first turn, held until the member confirms on the next turn.
 */

import type { MemoryObjectRef } from './types';

// ─── Pending recall state ─────────────────────────────────────────────────────
// Ephemeral: survives server lifetime, not restarts. Fine for v1.
// Key: memberId. Value: the top ref offered to the member.
export const pendingRecalls = new Map<string, MemoryObjectRef>();

// ─── Direct recall patterns ───────────────────────────────────────────────────
// Each pattern is tested case-insensitively against the full message.
// Ordered from most specific to most general to reduce false positives.

const RECALL_PATTERNS: RegExp[] = [
  /\bpull up\b/i,
  /\bbring back\b/i,
  /\bshow me my (keep|note|memory|save|capture|record)\b/i,
  /\bfind my (keep|note|memory|save|capture|record)\b/i,
  /\bget my (keep|note|memory|save|capture|record)\b/i,
  /\blook up my\b/i,
  /\bwhat did i (save|capture|note|write|record|keep) about\b/i,
  /\bthe keep about\b/i,
  /\bmy keep about\b/i,
  /\bretrieve my\b/i,
  /\brecall (what|that|the|my)\b/i,
  /\bfind the (keep|note|memory|save|capture) (about|on|for)\b/i,
];

// ─── Confirmation patterns ────────────────────────────────────────────────────
// Detected on the NEXT turn after a recall offer, to trigger materialization.

const CONFIRMATION_PATTERNS: RegExp[] = [
  /^\s*yes\b/i,
  /\bshow (me )?(the )?(full|it|text|content|all)\b/i,
  /\bbring it up\b/i,
  /\bfull text\b/i,
  /\byes please\b/i,
  /\bplease show\b/i,
  /\bshow full\b/i,
  /^(ok|okay|sure|yep|yeah|go ahead|please)\s*[.!]?\s*$/i,
];

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Returns whether the message expresses a direct recall intent,
 * and the query string to pass to locateMemoryObjects.
 *
 * The query is the full message — the resolver tokenizes it and
 * discards noise tokens, so passing the whole message is correct.
 */
export function detectDirectRecallIntent(message: string): {
  isRecall: boolean;
  query: string;
} {
  const trimmed = message.trim();
  const isRecall = RECALL_PATTERNS.some((re) => re.test(trimmed));
  return { isRecall, query: trimmed };
}

/**
 * Returns whether the message is a confirmation of a previously offered recall.
 * Only meaningful when pendingRecalls.has(memberId) is also true.
 */
export function detectConfirmationIntent(message: string): boolean {
  const trimmed = message.trim();
  return CONFIRMATION_PATTERNS.some((re) => re.test(trimmed));
}
