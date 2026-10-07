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
  const byId = new Map<number, {
    id: number;
    start: number;
    end: number;
    from: string;
    to: string;
    protectedSpan: boolean;
    firstSeen: number;
  }>();
  let cursor = 0;
  let order = 0;

  for (const segment of segments) {
    if (segment.kind === 'same') {
      cursor += points(segment.text).length;
      continue;
    }
    if (segment.editId === null) continue;

    const existing = byId.get(segment.editId) ?? {
      id: segment.editId,
      start: cursor,
      end: cursor,
      from: '',
      to: '',
      protectedSpan: false,
      firstSeen: order++,
    };

    if (segment.kind === 'del') {
      if (!existing.from) existing.start = cursor;
      existing.from += segment.text;
      cursor += points(segment.text).length;
      existing.end = cursor;
    } else {
      existing.to += segment.text;
    }
    existing.protectedSpan = existing.protectedSpan || segment.protectedSpan;
    byId.set(segment.editId, existing);
  }

  return [...byId.values()]
    .sort((a, b) => a.start - b.start || a.firstSeen - b.firstSeen)
    .map(({ firstSeen: _firstSeen, ...edit }) => edit);
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
