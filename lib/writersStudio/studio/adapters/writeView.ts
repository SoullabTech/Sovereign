/**
 * FLAGSHIP-RUNTIME-CONVERGENCE-01 / C1A — Write view adapters.
 *
 * ⭐ PURE. Each function SELECTS, COUNTS or SHAPES what the host already holds
 * as source truth into the props `WriteFrame` renders.
 *
 *   ⛔ never fetches · ⛔ never generates · ⛔ never infers · ⛔ never ranks
 *   ⛔ mints no id · ⛔ manufactures no `kind` · ⛔ no `epigraph` · ⛔ no label
 *   ⛔ chooses no Work: `workTitle` is passed in, explicit, by the host
 *
 * ⭐ STRING CONSERVATION, the law the matrix enforces: every string in an
 * adapter's output is one of its input strings, verbatim. A heading that is
 * `null` in the manuscript is ABSENT in the view — never "Chapter", never
 * "Untitled", never a number with a section sign in front of it.
 *
 * Inputs are the shared domain types (`RebuildSection`, `ChapterSpan`) —
 * ⛔ not `RebuildStudioClient`'s private state.
 */

import type { ChapterSpan, RebuildSection } from '../../rebuild/model';

export interface WritePlaceView {
  readonly work: string;
  readonly chapter?: string;
  readonly place?: string;
}

export interface WriteHeadingView {
  readonly chapterTitle?: string;
}

export interface WriteFootView {
  readonly chapterLabel?: string;
  readonly words: number;
}

/** The crumb: Work → chapter (the span's own root heading) → section heading. */
export function toWritePlace(input: {
  readonly workTitle: string;
  readonly section: RebuildSection | null;
  readonly span: ChapterSpan | null;
}): WritePlaceView {
  const out: { work: string; chapter?: string; place?: string } = { work: input.workTitle };
  const chapter = input.span?.root.heading;
  if (chapter) out.chapter = chapter;
  const place = input.section?.heading;
  if (place && place !== chapter) out.place = place;
  return out;
}

/** The heading above the body: the chapter root's own heading, or nothing. */
export function toWriteHeading(span: ChapterSpan | null): WriteHeadingView {
  const title = span?.root.heading;
  return title ? { chapterTitle: title } : {};
}

/** Word count over the bodies the host supplies. A count, not a judgment. */
export function countWords(bodies: readonly string[]): number {
  let n = 0;
  for (const b of bodies) {
    const m = b.match(/\S+/g);
    if (m) n += m.length;
  }
  return n;
}

export function toWriteFoot(input: {
  readonly span: ChapterSpan | null;
  readonly bodies: readonly string[];
}): WriteFootView {
  const label = input.span?.root.heading;
  const words = countWords(input.bodies);
  return label ? { chapterLabel: label, words } : { words };
}
