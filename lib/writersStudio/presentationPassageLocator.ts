/**
 * Craft selection → exact Source code-point coordinates.
 *
 * Display normalization (PDF hard wraps, CRLF and page folios) must never
 * rewrite an author's stored section or silently invent a selection.
 * Search only the comparable reader text and insist on a unique match.
 */
// A bare number is authored text unless verified import-page provenance says
// otherwise. No caller currently supplies such proof; never guess a folio.

/** Whitespace normalization only; authored letters and punctuation are exact. */
function comparableText(text: string): string {
  const points: string[] = [];
  let pendingSpace = false;
  for (const point of Array.from(text)) {
    if (/\s/u.test(point)) {
      pendingSpace = true;
      continue;
    }
    if (pendingSpace && points.length) points.push(' ');
    points.push(point);
    pendingSpace = false;
  }
  return points.join('');
}

/**
 * Create the displayed comparable sequence AND an offset for every visible
 * code point in the ORIGINAL string (not a CRLF-normalized copy).
 */
function sourceComparable(body: string): {
  comparable: string;
  rawOffsets: number[];
} {
  const raw = Array.from(body);
  const visible: string[] = [];
  const offsets: number[] = [];
  let pendingSpace = false;
  for (let at = 0; at < raw.length; at += 1) {
    const point = raw[at]!;
    if (/\s/u.test(point)) {
      pendingSpace = true;
      continue;
    }
    if (pendingSpace && visible.length) {
      visible.push(' ');
      offsets.push(at);
    }
    visible.push(point);
    offsets.push(at);
    pendingSpace = false;
  }
  return { comparable: visible.join(''), rawOffsets: offsets };
}

export function locateUniquePresentationPassage(
  body: string,
  visibleSelection: string,
): { start: number; end: number } | null {
  if (!body || !visibleSelection) return null;
  const needle = comparableText(visibleSelection);
  if (!needle) return null;
  const { comparable, rawOffsets } = sourceComparable(body);

  const first = comparable.indexOf(needle);
  if (first < 0 || comparable.indexOf(needle, first + 1) >= 0) {
    // Unmatched or visually duplicated text has no authority to move focus.
    return null;
  }
  const startIndex = Array.from(comparable.slice(0, first)).length;
  const length = Array.from(needle).length;
  const rawStart = rawOffsets[startIndex];
  const rawEnd = rawOffsets[startIndex + length - 1];
  if (rawStart === undefined || rawEnd === undefined) return null;
  return { start: rawStart, end: rawEnd + 1 };
}
