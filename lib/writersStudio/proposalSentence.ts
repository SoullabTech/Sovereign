/**
 * EW-F2 · THE AFFECTED SENTENCE, CURRENT AND AS IT WOULD READ.
 *
 * ⭐⭐ ONE COMPUTATION, TWO SURFACES. The founder's law:
 *
 *   "Derive the comparison from the same resolved body + range + replacement
 *    already governing the in-place mark. Do not independently search for the
 *    phrase again. So there cannot be one locus in the Work and another in the
 *    panel."
 *
 * That is why this is a pure function in a shared module rather than a helper
 * inside either surface. The Work marks the locus; the panel shows the
 * sentence; both are `(body, range, replacement)` and neither searches.
 *
 * ── ⛔ WHY `\n` IS NOT A SENTENCE BOUNDARY ─────────────────────────────────
 *
 * CAUGHT BEFORE IT SHIPPED. A first version treated `\n` as a terminator. The
 * manuscript is HARD-WRAPPED, so §23 contains:
 *
 *     …wisdom beyond the reactive, fixated
 *     mind. Success lies in…
 *
 * With `\n` as a stop, the sentence ends immediately after the marked run and
 * the comparison reads "…beyond the reactive" — silently dropping the word the
 * change is about. A comparison that truncates at a line wrap is worse than no
 * comparison: it answers the writer's question wrongly rather than not at all.
 *
 * Stops are `.!?`. A BLANK line is a hard boundary. Single newlines are line
 * wraps and are collapsed to spaces for display, so the writer reads a sentence
 * rather than the shape of the source file.
 *
 * ⛔ AND NEVER AN ARBITRARY WINDOW. The founder's second law: where sentence
 * boundaries cannot be established safely, fall back to the ENCLOSING
 * PARAGRAPH — never to N characters. A character window is what EW-F1 shipped
 * and it cut mid-word.
 *
 * ⛔ DISPLAY ONLY. `range` remains the authority. If this picks a longer or
 * shorter span the writer reads more or less context and nothing about what
 * would be written changes.
 */
import { codePointBoundaries } from '@/lib/manuscript/draftSections';
import type { SpacedRange } from '@/lib/manuscript/sections/coordinateSpace';

export interface SentenceComparison {
  /** The sentence as the Work holds it, marked run included. */
  readonly current: string;
  /** The same sentence with the marked run replaced. */
  readonly wouldRead: string;
  /** `sentence` when boundaries were found; `paragraph` when they were not. */
  readonly scope: 'sentence' | 'paragraph';
}

const STOPS = '.!?';

/** Paragraph = bounded by a blank line, or the ends of the body. */
function paragraphBounds(body: string, a: number, b: number): { a: number; b: number } {
  const before = body.lastIndexOf('\n\n', Math.max(0, a - 1));
  const after = body.indexOf('\n\n', b);
  return {
    a: before === -1 ? 0 : before + 2,
    b: after === -1 ? body.length : after,
  };
}

/** Single newlines are wraps in a hard-wrapped manuscript, not breaks. */
const unwrap = (s: string) => s.replace(/\s*\n\s*/g, ' ').trim();

export function sentenceComparison(
  body: string,
  range: SpacedRange,
  replacementText: string,
): SentenceComparison | null {
  /* ⛔ No default coordinate space, here or anywhere. */
  if (range.space !== 'projected_section_body') return null;

  const bounds = codePointBoundaries(body);
  const last = bounds.length - 1;
  const a = bounds[Math.max(0, Math.min(range.start, last))];
  const b = Math.max(a, bounds[Math.max(0, Math.min(range.end, last))]);

  const para = paragraphBounds(body, a, b);

  /* Backwards to the stop that ENDS the previous sentence, then past its
     trailing whitespace. Bounded by the paragraph so a stop in an earlier
     paragraph cannot be borrowed. */
  let s0 = a;
  while (s0 > para.a && !STOPS.includes(body[s0 - 1])) s0 -= 1;
  while (s0 < a && /\s/.test(body[s0])) s0 += 1;

  /* Forwards to the stop that ends THIS sentence, inclusive. */
  let s1 = b;
  while (s1 < para.b && !STOPS.includes(body[s1])) s1 += 1;
  const foundEnd = s1 < para.b;
  if (foundEnd) s1 += 1;

  /**
   * ⭐ ONLY THE END DECIDES, and getting this wrong was caught by the tests.
   *
   * A first version required a terminator on BOTH sides, so the FIRST sentence
   * of a paragraph — which begins at the paragraph, not after a full stop —
   * was reported as a paragraph. The fixture's own sentence is the first in its
   * paragraph, so the comparison widened for no reason.
   *
   * A paragraph's start IS a legitimate sentence edge. A missing TERMINATOR is
   * the genuinely unsafe case: without one there is no sentence to show, and we
   * widen honestly rather than invent an edge.
   */
  const scope: 'sentence' | 'paragraph' = foundEnd ? 'sentence' : 'paragraph';
  const from = scope === 'sentence' ? s0 : para.a;
  const to = scope === 'sentence' ? s1 : para.b;

  return {
    current: unwrap(body.slice(from, to)),
    wouldRead: unwrap(body.slice(from, a) + replacementText + body.slice(b, to)),
    scope,
  };
}
