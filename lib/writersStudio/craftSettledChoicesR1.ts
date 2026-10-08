import type { CraftKeptSpan } from './craftFocusR1';
import { craftWorkingEdits } from './craftWorkingCopy';

/** Version-bound editorial decisions, never inferred from unchanged wording. */
export function parseCraftKeptSpans(value: unknown): readonly CraftKeptSpan[] | null {
  if (!Array.isArray(value) || value.length > 500) return null;
  const out: CraftKeptSpan[] = [];
  for (const entry of value) {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)
      || Object.keys(entry).some(k => !['start', 'end', 'text'].includes(k))) return null;
    const { start, end, text } = entry as CraftKeptSpan;
    if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start < 0 || end < start
      || typeof text !== 'string' || Array.from(text).length !== end - start || text.length > 200_000) return null;
    out.push({ start, end, text });
  }
  out.sort((a, b) => a.start - b.start || a.end - b.end);
  if (out.some((span, index) => index > 0 && (out[index - 1]!.end > span.start || (out[index - 1]!.start === span.start && out[index - 1]!.end === span.end)))) return null;
  return out;
}

/** Source offsets are code points. A decision cannot certify words that the
 * saved working version actually replaces, deletes, or inserts inside. */
export function verifiedCraftKeptSpans(original: string, wording: string, value: unknown): readonly CraftKeptSpan[] | null {
  const kept = parseCraftKeptSpans(value);
  if (!kept) return null;
  const source = Array.from(original);
  const edits = craftWorkingEdits(original, wording);
  for (const span of kept) {
    if (span.end > source.length || source.slice(span.start, span.end).join('') !== span.text) return null;
    if (edits.some(edit => (edit.start < span.end && edit.end > span.start) || (span.start === span.end && edit.start <= span.start && edit.end >= span.end))) return null;
  }
  return kept;
}

export function sameCraftKeptSpans(a: readonly CraftKeptSpan[] = [], b: readonly CraftKeptSpan[] = []): boolean {
  const left = parseCraftKeptSpans(a), right = parseCraftKeptSpans(b);
  return left !== null && right !== null && JSON.stringify(left) === JSON.stringify(right);
}
