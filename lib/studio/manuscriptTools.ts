/**
 * Safe replace for the Writer Canvas.
 *
 * Outline, mapping and find already live in app/writers-studio/canvas/
 * manuscriptMap.ts — this module deliberately does not restate any of it. It
 * adds the one instrument that was missing, and only that.
 *
 * The load-bearing rule: replace takes RANGES the writer has already been
 * shown, never a query. There is no path that searches and replaces in one
 * step, so what changes is always what was previewed, and a stale search
 * cannot edit a draft that has moved underneath it.
 */

/** A range the writer was shown — the shape both DraftHit and a selection satisfy. */
export interface Range {
  start: number;
  end: number;
}

/**
 * Replace exactly the given ranges, applied from the end backwards so earlier
 * offsets stay valid. Overlapping or out-of-bounds ranges throw rather than
 * producing garbage, and the input text is never mutated.
 */
export function replaceRanges(
  content: string,
  ranges: Range[],
  replacement: string,
): { next: string; replaced: number } {
  const ordered = [...ranges].sort((a, b) => a.start - b.start);
  for (let i = 1; i < ordered.length; i += 1) {
    if (ordered[i].start < ordered[i - 1].end) {
      throw new Error('Overlapping ranges');
    }
  }
  let next = content;
  for (let i = ordered.length - 1; i >= 0; i -= 1) {
    const { start, end } = ordered[i];
    if (start < 0 || end > content.length || end < start) throw new Error('Range out of bounds');
    next = next.slice(0, start) + replacement + next.slice(end);
  }
  return { next, replaced: ordered.length };
}

/**
 * How the line will read afterwards. A count is not enough: "replace 412
 * occurrences" needs to show the writer what they are agreeing to.
 */
export function replacePreview(
  hit: { before: string; after: string },
  replacement: string,
): string {
  return `${hit.before}${replacement}${hit.after}`;
}
