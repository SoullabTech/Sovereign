/**
 * WS2-ENCOUNTER-01 · E2 §1A — "read whole" must mean whole.
 *
 * Founder ruling 2026-09-08:
 *
 *   Encounter may computationally partition the text, but it may not silently
 *   sample the Work and present partial observation as whole-Work attention.
 *
 * Windows are TRANSPORT MECHANICS. They are not sections, chapters, units, or
 * inferred hierarchy, and nothing downstream may read them as structure — that
 * would be Encounter deciding the shape of the book before the writer saw it,
 * which is the thing §1 refuses.
 *
 * Coverage is asserted rather than assumed: the windows are checked to cover
 * every code point of the draft exactly once in order (overlap is added for
 * context but never counted as coverage). A Work that cannot be covered is
 * REFUSED, never sampled.
 */

export interface ReadWindow {
  readonly startCodePoint: number;
  readonly endCodePoint: number;
  /** Includes `overlap` code points of preceding context; coverage ignores it. */
  readonly text: string;
  readonly contextStartCodePoint: number;
}

export interface Traversal {
  readonly windows: readonly ReadWindow[];
  /** True only when the windows demonstrably cover the whole draft. */
  readonly complete: boolean;
}

/**
 * Partition into ordered windows covering the entire draft.
 *
 * Code points, not UTF-16 units: a manuscript with emoji or astral characters
 * must not have its anchors silently shifted by surrogate pairs.
 */
export function traverseWhole(
  text: string,
  opts: { windowSize?: number; overlap?: number } = {},
): Traversal {
  const points = Array.from(text);
  const size = Math.max(1, opts.windowSize ?? 12000);
  const overlap = Math.max(0, Math.min(opts.overlap ?? 400, size - 1));

  const windows: ReadWindow[] = [];
  for (let start = 0; start < points.length; start += size) {
    const end = Math.min(start + size, points.length);
    const contextStart = Math.max(0, start - overlap);
    windows.push({
      startCodePoint: start,
      endCodePoint: end,
      contextStartCodePoint: contextStart,
      text: points.slice(contextStart, end).join(''),
    });
  }

  /* An empty draft is covered trivially and truthfully. */
  if (points.length === 0) return { windows: [], complete: true };

  let cursor = 0;
  let complete = true;
  for (const w of windows) {
    if (w.startCodePoint !== cursor) { complete = false; break; }
    cursor = w.endCodePoint;
  }
  if (cursor !== points.length) complete = false;

  return { windows, complete };
}
