import { editorialSegments } from './editorialDiff';

export type CraftDecision =
  | { readonly mode: 'original' }
  | { readonly mode: 'proposal' }
  | { readonly mode: 'custom'; readonly text: string };

export interface CraftWorkingEdit {
  readonly id: number;
  readonly start: number;
  readonly end: number;
  readonly from: string;
  readonly to: string;
  readonly protectedSpan: boolean;
}

const points = (text: string) => Array.from(text);

/**
 * Convert the inline diff into exact, non-overlapping code-point spans in the
 * writer's original passage. A replacement is one decision even when it
 * contains both deleted and inserted tokens.
 */
export function craftWorkingEdits(
  original: string,
  proposed: string,
): readonly CraftWorkingEdit[] {
  const segments = editorialSegments(original, proposed);
  const source = points(original);
  const target = points(proposed);
  const spans = new Map<number, {
    id: number;
    start: number;
    end: number;
    targetStart: number;
    targetEnd: number;
    protectedSpan: boolean;
  }>();
  let sourceCursor = 0;
  let targetCursor = 0;

  for (const segment of segments) {
    const length = points(segment.text).length;
    if (segment.kind === 'same') {
      sourceCursor += length;
      targetCursor += length;
      continue;
    }
    if (segment.editId === null) continue;
    const span = spans.get(segment.editId) ?? {
      id: segment.editId,
      start: sourceCursor,
      end: sourceCursor,
      targetStart: targetCursor,
      targetEnd: targetCursor,
      protectedSpan: false,
    };
    if (segment.kind === 'del') sourceCursor += length;
    if (segment.kind === 'ins') targetCursor += length;
    span.end = sourceCursor;
    span.targetEnd = targetCursor;
    span.protectedSpan ||= segment.protectedSpan;
    spans.set(segment.editId, span);
  }

  // One edit can span unchanged whitespace between changed words. Slice both
  // exact source intervals: concatenating only del/ins tokens loses those spaces.
  return [...spans.values()].map((span) => ({
    id: span.id,
    start: span.start,
    end: span.end,
    from: source.slice(span.start, span.end).join(''),
    to: target.slice(span.targetStart, span.targetEnd).join(''),
    protectedSpan: span.protectedSpan,
  }));
}

export function initialCraftDecisions(
  edits: readonly CraftWorkingEdit[],
  author: 'maia' | 'member' | null,
): ReadonlyMap<number, CraftDecision> {
  const out = new Map<number, CraftDecision>();
  for (const edit of edits) {
    out.set(edit.id, edit.protectedSpan
      ? { mode: 'original' }
      : author === 'member'
        ? { mode: 'proposal' }
        : { mode: 'original' });
  }
  return out;
}

export function composeCraftWorkingCopy(
  original: string,
  edits: readonly CraftWorkingEdit[],
  decisions: ReadonlyMap<number, CraftDecision>,
): string {
  const source = points(original);
  const ordered = [...edits]
    .filter((edit) => !edit.protectedSpan)
    .sort((a, b) => b.start - a.start || b.end - a.end);

  let output = source;
  for (const edit of ordered) {
    const decision = decisions.get(edit.id) ?? { mode: 'original' as const };
    if (decision.mode === 'original') continue;
    const replacement = decision.mode === 'proposal'
      ? edit.to
      : decision.text;
    output = [
      ...output.slice(0, edit.start),
      ...points(replacement),
      ...output.slice(edit.end),
    ];
  }
  return output.join('');
}

export function decisionCount(
  edits: readonly CraftWorkingEdit[],
  decisions: ReadonlyMap<number, CraftDecision>,
): number {
  return edits.filter((edit) => {
    if (edit.protectedSpan) return false;
    const decision = decisions.get(edit.id);
    return decision?.mode === 'proposal' || decision?.mode === 'custom';
  }).length;
}
