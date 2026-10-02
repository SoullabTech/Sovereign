/**
 * WS-CONVERGENCE-01 · C6R1 — INLINE EDITORIAL MARKUP.
 *
 * ⭐ What this replaces and why. `comparisonSpan()` finds one common prefix and
 * one common suffix and calls everything between them a single replacement, so
 * two small wording changes in one paragraph render as one struck-out block
 * followed by a near-identical block. Truthful, and unusable — the member is
 * shown a REPORT ABOUT their paragraph instead of their paragraph marked up.
 *
 * ⭐ This module marks the page instead: unchanged words stay ordinary prose,
 * and each proposed change sits in the place it actually occurs. Because the
 * changes are now separable, the member may take some and leave others — which
 * is the difference between accepting MAIA's rewrite and doing their own
 * revision with her help.
 *
 * ⛔ COMPOSING IS NOT A SECOND PROPOSAL SYSTEM. Taking a subset produces text
 * the MEMBER authored, which goes through the existing member-version route.
 * The proposal chain, the authorization and Undo are untouched.
 */

/** Code points, so surrogate pairs and combining marks survive intact. */
const points = (s: string) => Array.from(s);

/**
 * Words and the runs of separators between them, both kept as tokens so that
 * rejoining is exact. ⛔ Never normalises: whitespace the author chose is
 * authored material, and a diff that tidies it has already edited the page.
 */
export function tokenize(text: string): string[] {
  const out: string[] = [];
  let buf = '';
  let inWord: boolean | null = null;
  for (const ch of points(text)) {
    const word = !/\s/.test(ch);
    if (inWord === null || word === inWord) { buf += ch; inWord = word; continue; }
    out.push(buf); buf = ch; inWord = word;
  }
  if (buf) out.push(buf);
  return out;
}

export type SegmentKind = 'same' | 'del' | 'ins';

export interface Segment {
  readonly kind: SegmentKind;
  readonly text: string;
  /** Stable within one (original, proposed) pair. Identifies ONE change. */
  readonly editId: number | null;
  /** True when this segment overlaps text the member has not put in play. */
  readonly protectedSpan: boolean;
}

/** Longest common subsequence over tokens. Passage-sized inputs only. */
function lcs(a: readonly string[], b: readonly string[]): number[][] {
  const m = a.length, n = b.length;
  const d: number[][] = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0));
  for (let i = m - 1; i >= 0; i -= 1)
    for (let j = n - 1; j >= 0; j -= 1)
      d[i]![j] = a[i] === b[j] ? d[i + 1]![j + 1]! + 1 : Math.max(d[i + 1]![j]!, d[i]![j + 1]!);
  return d;
}

/**
 * ⭐ Segments in manuscript order. Adjacent del/ins runs share one `editId`, so
 * *replacing these words with those* is ONE decision for the member rather than
 * two — a deletion and an insertion the member must mentally pair up.
 */
export function editorialSegments(original: string, proposed: string): Segment[] {
  const a = tokenize(original), b = tokenize(proposed);
  const d = lcs(a, b);
  const raw: Array<{ kind: SegmentKind; text: string }> = [];
  const push = (kind: SegmentKind, text: string) => {
    const last = raw[raw.length - 1];
    if (last && last.kind === kind) { last.text += text; return; }
    raw.push({ kind, text });
  };
  let i = 0, j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) { push('same', a[i]!); i += 1; j += 1; }
    else if (d[i + 1]![j]! >= d[i]![j + 1]!) { push('del', a[i]!); i += 1; }
    else { push('ins', b[j]!); j += 1; }
  }
  while (i < a.length) { push('del', a[i]!); i += 1; }
  while (j < b.length) { push('ins', b[j]!); j += 1; }

  /* One editId per contiguous run of change, so a del immediately followed by
     an ins is a single *use this wording instead* decision. */
  const spans = protectedSpans(original);
  let editId = 0, inChange = false, cursor = 0;
  return raw.map(({ kind, text }) => {
    if (kind === 'same') {
      /* ⭐ Whitespace between two changed words does not end the change. Without
         this, "rarely exist separately," -> "continually move in relationship,"
         is SIX marks the member must reassemble into one thought; with it, it is
         one phrase-level edit — which is what a teacher's pen actually does. */
      if (!/^\s+$/.test(text)) inChange = false;
      cursor += points(text).length;
      return { kind, text, editId: null, protectedSpan: false };
    }
    if (!inChange) { editId += 1; inChange = true; }
    /* A deletion consumes original text and can therefore sit inside a
       protected span; an insertion is located at the cursor. */
    const from = cursor;
    const to = kind === 'del' ? cursor + points(text).length : cursor;
    if (kind === 'del') cursor = to;
    return {
      kind, text, editId,
      protectedSpan: spans.some((s) => (kind === 'del' ? from < s.end && to > s.start
                                                       : from > s.start && from < s.end)),
    };
  });
}

export interface ProtectedSpan { readonly start: number; readonly end: number }

/**
 * ⚠️⚠️ A PARTIAL INSTRUMENT, AND IT MUST BE READ AS ONE.
 *
 * The manuscript type system does carry `Block { type: 'quote', content,
 * attribution }` — but that block never reaches this path. `ingest/segment.ts`
 * flattens a section to `body` text before any row exists, and the only
 * consumer of the block adapter is a render script. So there is NO quotation
 * identity upstream of here to preserve: it can only be RE-DETECTED, and
 * detection is inference.
 *
 * ⭐ What this therefore is: a conservative syntactic detector over paired
 * quotation marks. It is ⛔ NOT quote custody, and nothing may report it as
 * such. It fails closed in the direction that matters — a false positive
 * refuses a lawful edit, which is recoverable; a false negative leaves the
 * defect, which is why the real repair is member-declared or ingest-preserved
 * spans, and that is a separate lane.
 */
export function protectedSpans(text: string): ProtectedSpan[] {
  const out: ProtectedSpan[] = [];
  const pts = points(text);
  const open: Record<string, string> = { '“': '”', '"': '"', '‘': '’' };
  let start: number | null = null, closer = '';
  for (let k = 0; k < pts.length; k += 1) {
    const ch = pts[k]!;
    if (start === null && ch in open) { start = k; closer = open[ch]!; continue; }
    if (start !== null && ch === closer) { out.push({ start, end: k + 1 }); start = null; }
  }
  return out;
}

/**
 * ⛔ THE ADOPTION GUARD. A proposal that alters even one character inside a
 * detected quotation is refused whole — ⛔ never silently trimmed to the part
 * that was allowed, because a quotation edited down to its lawful remainder is
 * still a quotation the source did not write.
 */
export function altersProtectedText(original: string, proposed: string): boolean {
  return editorialSegments(original, proposed).some((s) => s.protectedSpan);
}

/**
 * ⭐ The member's own revision, built from the changes they chose. Unselected
 * changes fall back to the ORIGINAL words, so declining MAIA is not an edit.
 * ⛔ Protected segments are never composable and never included.
 */
export function composeSelected(
  segments: readonly Segment[],
  selected: ReadonlySet<number>,
): string {
  let out = '';
  for (const s of segments) {
    if (s.kind === 'same') { out += s.text; continue; }
    if (s.protectedSpan) { if (s.kind === 'del') out += s.text; continue; }
    const take = s.editId !== null && selected.has(s.editId);
    if (s.kind === 'del' && !take) out += s.text;
    if (s.kind === 'ins' && take) out += s.text;
  }
  return out;
}

/** Every change the member could act on, in manuscript order. */
export function editIds(segments: readonly Segment[]): number[] {
  const seen = new Set<number>();
  for (const s of segments)
    if (s.editId !== null && !s.protectedSpan) seen.add(s.editId);
  return [...seen].sort((x, y) => x - y);
}
