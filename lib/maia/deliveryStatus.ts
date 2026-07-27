// Delivery state for member turns — the honest "did this reach MAIA?" marker.
//
// Recovery seam, Pattern A (Kelly ruling 2026-07-24): the member completed the
// act of sending; the system may have failed to complete *delivery*. The message
// bubble already represents authorship correctly — these helpers give it a
// truthful delivery state so the member can resend the exact turn they authored.
//
// Constitutional boundary: this is retained ONLY in live component state. It is
// NOT durable draft storage and must never be persisted as one (tier-1 preserve,
// not tier-2/3 persist — see docs/ux/MOBILE_TEXT_EXPERIENCE_AUDIT.md §5 C2).

export type DeliveryStatus = 'failed' | 'retrying';
export type DeliveryFailureReason =
  | 'network'
  | 'server'
  | 'maintenance'
  | 'auth'
  | 'error';

/** Minimal shape these helpers operate on — any message-like object with an id. */
export interface HasDelivery {
  id: string;
  deliveryStatus?: DeliveryStatus;
  failureReason?: DeliveryFailureReason;
}

/**
 * Mark one turn as failed-to-deliver. Pure — returns a new array; the target
 * message object is replaced, all others are referentially unchanged.
 */
export function markFailed<T extends HasDelivery>(
  messages: T[],
  id: string,
  reason: DeliveryFailureReason,
): T[] {
  return messages.map((m) =>
    m.id === id ? { ...m, deliveryStatus: 'failed' as const, failureReason: reason } : m,
  );
}

/** Mark one turn as retrying (a guarded resend is in flight). Clears the prior reason. */
export function markRetrying<T extends HasDelivery>(messages: T[], id: string): T[] {
  return messages.map((m) =>
    m.id === id ? { ...m, deliveryStatus: 'retrying' as const, failureReason: undefined } : m,
  );
}

/**
 * Clear the in-flight retry marker once the server has accepted the turn.
 *
 * OWNERSHIP CONTRACT: clears ONLY a turn currently in the 'retrying' state — the
 * transient state an in-flight retry set on *itself*. It will NEVER erase a
 * 'failed' marker, which belongs to a settled (possibly newer) attempt. This makes
 * the ownership explicit in the helper rather than relying on the caller: a
 * late-resolving attempt cannot clear a failure marker owned by a different or
 * superseded attempt. A first send (no marker) is a no-op, so this is safe to call
 * unconditionally on every successful send.
 */
export function clearDelivery<T extends HasDelivery>(messages: T[], id: string): T[] {
  return messages.map((m) =>
    m.id === id && m.deliveryStatus === 'retrying'
      ? { ...m, deliveryStatus: undefined, failureReason: undefined }
      : m,
  );
}

/** True when a resend for this id must be refused (already in flight). */
export function isRetryInFlight<T extends HasDelivery>(messages: T[], id: string): boolean {
  const m = messages.find((x) => x.id === id);
  return m?.deliveryStatus === 'retrying';
}

/**
 * Remove delivery markers before persistence. They are live UI state only, so a
 * reload must never resurrect a stuck "retrying" spinner or a stale "failed"
 * marker from storage.
 */
export function stripDelivery<T extends HasDelivery>(
  messages: T[],
): Omit<T, 'deliveryStatus' | 'failureReason'>[] {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return messages.map(({ deliveryStatus, failureReason, ...rest }) => rest);
}
