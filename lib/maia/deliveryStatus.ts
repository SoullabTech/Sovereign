// Delivery state for member turns — the honest "did this reach MAIA?" marker.
//
// Recovery seam, Pattern A (Kelly ruling 2026-07-24): the member completed the
// act of sending; the system may have failed to complete *delivery*. The message
// bubble already represents authorship correctly — these helpers give it a
// truthful delivery state so the member can resend the exact turn they authored.
//
// Persistence (Kelly ruling 2026-11-19, replacing the 2026-07-24 live-only rule):
// the 'failed' marker and its reason are saved on this device with the turn the app
// already stores, so "Not delivered to MAIA" survives reopening. 'retrying'
// ("Sending…") is never saved. No delivery state is sent to the server, and no
// text is stored beyond what the conversation cache already holds. An undelivered
// turn is excluded from the history sent to MAIA until it is actually delivered.

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

/** Remove both delivery markers from every turn. */
export function stripDelivery<T extends HasDelivery>(
  messages: T[],
): Omit<T, 'deliveryStatus' | 'failureReason'>[] {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return messages.map(({ deliveryStatus, failureReason, ...rest }) => rest);
}

/**
 * Shape turns for on-device storage. A 'failed' marker and reason are kept. A
 * 'retrying' turn has no confirmed delivery, so it is stored as failed ('error')
 * rather than as "Sending…" (which could never resolve after a reload) or as
 * delivered (which might be untrue). Resending is safe: it reuses the exchange id.
 */
export function persistableDelivery<T extends HasDelivery>(messages: T[]): T[] {
  return messages.map((m) => {
    if (m.deliveryStatus === 'failed') return m;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { deliveryStatus, failureReason, ...rest } = m;
    if (deliveryStatus === 'retrying') {
      return { ...rest, deliveryStatus: 'failed' as const, failureReason: 'error' as const } as T;
    }
    return rest as T;
  });
}

/**
 * Keep undelivered turns out of the history sent to MAIA. The current copy of a turn
 * decides its status, so a restored failed turn that is being resent is included.
 */
export function excludeUndelivered<T extends HasDelivery>(
  historical: T[],
  current: T[],
): { historical: T[]; current: T[] } {
  const currentById = new Map(current.filter((m) => m.id).map((m) => [m.id, m]));
  const isFailed = (m: T) => (currentById.get(m.id) ?? m).deliveryStatus === 'failed';
  return {
    historical: historical.filter((m) => !isFailed(m)),
    current: current.filter((m) => m.deliveryStatus !== 'failed'),
  };
}

type Timed = HasDelivery & { role?: string; text?: string; timestamp?: string | Date | number };

/**
 * When server history replaces the device's copy, keep the device's undelivered
 * turns visible, placed by time. Only a 'server' or 'error' failure may have been
 * accepted before it failed; if the server holds that same member text, it did
 * receive it, so the turn is not shown a second time as undelivered. Network,
 * offline, maintenance and sign-in failures never reached the server and are kept.
 */
export function mergeUndeliveredIntoServerHistory<T extends Timed>(server: T[], local: T[]): T[] {
  const norm = (s?: string) => (s ?? '').trim();
  const serverMemberTexts = new Set(server.filter((m) => m.role === 'user').map((m) => norm(m.text)));
  const mayHaveArrived = (m: T) => m.failureReason === 'server' || m.failureReason === 'error';
  const undelivered = local.filter(
    (m) =>
      m.deliveryStatus === 'failed' &&
      !(mayHaveArrived(m) && serverMemberTexts.has(norm(m.text))),
  );
  if (undelivered.length === 0) return server;
  const time = (m: T) => {
    const t = new Date(m.timestamp ?? 0).getTime();
    return Number.isNaN(t) ? 0 : t;
  };
  return [...server, ...undelivered]
    .map((m, i) => ({ m, i }))
    .sort((a, b) => time(a.m) - time(b.m) || a.i - b.i)
    .map(({ m }) => m);
}
