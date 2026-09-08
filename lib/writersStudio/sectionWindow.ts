/**
 * WS-WHOLE-MANUSCRIPT-01 · F-1 — which sections are mounted, decided purely.
 *
 * 262 live editors are not mounted at once, so the continuous view keeps a
 * window around the viewport. That makes eviction a routine event, and eviction
 * is where words are lost: a section whose editor leaves the DOM takes whatever
 * was typed into it unless the exact visible body was captured first.
 *
 * The capture itself is `captureForUnmount`. What lives here is the decision —
 * kept pure so the one rule that protects a writer mid-sentence can be
 * falsified without a browser, a scroll, or a layout engine.
 *
 * ⭐ THE FOCUSED SECTION IS PINNED. It stays mounted even when its geometry
 * leaves the nominal window, until focus moves away. Without that, a fast scroll
 * or a browser layout shift could unmount the node holding the writer's caret
 * while they are still typing into it — and "we captured first" is no comfort
 * when the editor vanishes mid-sentence. Geometry is a hint; focus is a fact.
 */

export interface WindowInput {
  /** How many sections the manuscript has. */
  total: number;
  /** First and last section index the viewport currently covers, inclusive. */
  firstVisible: number;
  lastVisible: number;
  /** Sections kept mounted beyond each edge, so scrolling does not flicker. */
  overscan: number;
  /** The section holding the caret, if any. Pinned regardless of geometry. */
  focusedIndex: number | null;
}

const clamp = (n: number, lo: number, hi: number) => Math.min(Math.max(n, lo), hi);

/** The contiguous geometric window: what the viewport covers, plus overscan. */
export function windowRange(input: WindowInput): { from: number; to: number } {
  const { total, firstVisible, lastVisible, overscan } = input;
  if (total <= 0) return { from: 0, to: -1 };
  const last = total - 1;
  return {
    from: clamp(Math.min(firstVisible, lastVisible) - overscan, 0, last),
    to: clamp(Math.max(firstVisible, lastVisible) + overscan, 0, last),
  };
}

/**
 * Every index that should be mounted: the geometric window, plus the focused
 * section wherever it is.
 *
 * The focused index may therefore be non-contiguous with the rest — a writer who
 * scrolls far from where they are typing keeps exactly one distant editor alive.
 * That is intended, and cheaper than the alternative of losing their caret.
 */
export function mountedIndices(input: WindowInput): Set<number> {
  const { from, to } = windowRange(input);
  const mounted = new Set<number>();
  for (let i = from; i <= to; i += 1) mounted.add(i);
  const focused = input.focusedIndex;
  if (focused !== null && focused >= 0 && focused < input.total) mounted.add(focused);
  return mounted;
}

/**
 * Which currently-mounted sections are about to leave.
 *
 * ⛔ EVERY INDEX THIS RETURNS MUST BE CAPTURED BEFORE ITS EDITOR UNMOUNTS. That
 * is the whole reason this is a separate, named function rather than a filter
 * inlined into a render: the caller has one list to walk, and forgetting to walk
 * it is a visible omission rather than an invisible one.
 */
export function evictedIndices(
  currentlyMounted: Iterable<number>,
  next: WindowInput,
): number[] {
  const keep = mountedIndices(next);
  const leaving: number[] = [];
  for (const i of currentlyMounted) if (!keep.has(i)) leaving.push(i);
  return leaving.sort((a, b) => a - b);
}
