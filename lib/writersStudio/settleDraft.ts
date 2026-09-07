/**
 * SETTLE — the one way a client act names the draft state it is acting on.
 *
 * Two gestures now take the writer's draft to the server and say "this exact
 * version": Keep a version, and Export. Both need the same three steps, and
 * both fail the same way if they skip one:
 *
 *   1  flush the pending autosave
 *   2  wait until nothing is unsaved, or REFUSE
 *   3  read the version the save lane has actually had acknowledged
 *
 * ⛔ Step 3 is only meaningful AFTER step 2. The queue's version advances as
 * saves are acknowledged, so reading it while a save is in flight names a
 * version that is about to stop being true — and the server, told that
 * version, would agree with a claim the writer never made.
 *
 * ⛔ Step 2 refuses rather than proceeding. A kept version that silently omits
 * the sentence typed two seconds ago is worse than no version, because the
 * member has been told their work is held; an exported book that silently
 * omits it is worse still, because it leaves the room. Both would succeed.
 * Nothing would raise. This is the failure mode the timeout exists to convert
 * into a refusal the writer can see.
 *
 * Pure but for the clock: `now` and `sleep` are injected so the refusal path
 * is testable without waiting four real seconds for it.
 */

export interface SettleTarget {
  /** Send the debounced edit now rather than when its timer fires. */
  flushPending: () => void;
  /** True while any text is staged, queued, in flight, or conflicted. */
  hasUnsavedWork: () => boolean;
  /** The draft version last acknowledged BY THE SERVER. Read after settling. */
  currentRevisionId: () => number;
}

export type Settled =
  | { readonly ok: true; readonly version: number }
  /** The queue did not go quiet in time. Nothing was sent. */
  | { readonly ok: false; readonly reason: 'unsettled' };

export const SETTLE_TIMEOUT_MS = 4000;
export const SETTLE_POLL_MS = 50;

export async function settleDraft(
  target: SettleTarget,
  opts: {
    timeoutMs?: number;
    pollMs?: number;
    now?: () => number;
    sleep?: (ms: number) => Promise<void>;
  } = {},
): Promise<Settled> {
  const timeoutMs = opts.timeoutMs ?? SETTLE_TIMEOUT_MS;
  const pollMs = opts.pollMs ?? SETTLE_POLL_MS;
  const now = opts.now ?? (() => Date.now());
  const sleep = opts.sleep ?? ((ms: number) => new Promise<void>((r) => setTimeout(r, ms)));

  target.flushPending();

  const deadline = now() + timeoutMs;
  while (target.hasUnsavedWork()) {
    if (now() > deadline) return { ok: false, reason: 'unsettled' };
    await sleep(pollMs);
  }

  return { ok: true, version: target.currentRevisionId() };
}
