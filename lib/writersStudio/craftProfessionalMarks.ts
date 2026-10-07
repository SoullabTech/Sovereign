import type { CraftDecision, CraftWorkingEdit } from './craftWorkingCopy';

export type ProfessionalMarkKind =
  | 'delete'
  | 'insert'
  | 'replace'
  | 'transpose-from'
  | 'transpose-to'
  | 'add-space'
  | 'close-up'
  | 'paragraph'
  | 'no-paragraph'
  | 'caps'
  | 'lowercase'
  | 'stet';

export interface ProfessionalMark {
  readonly kind: ProfessionalMarkKind;
  readonly symbol: string;
  readonly label: string;
}

const clean = (text: string) => text.replace(/\s+/g, ' ').trim();
const lettersOnly = (text: string) => text.replace(/[^\p{L}\p{N}]+/gu, '');

function movePeer(
  edit: CraftWorkingEdit,
  edits: readonly CraftWorkingEdit[],
): 'from' | 'to' | null {
  const from = clean(edit.from);
  const to = clean(edit.to);
  if (from && edits.some((other) =>
    other.id !== edit.id
    && clean(other.to) === from
    && !clean(other.from))) return 'from';
  if (to && edits.some((other) =>
    other.id !== edit.id
    && clean(other.from) === to
    && !clean(other.to))) return 'to';
  return null;
}

export function professionalMarkFor(
  edit: CraftWorkingEdit,
  edits: readonly CraftWorkingEdit[],
  decision?: CraftDecision,
): ProfessionalMark {
  if (decision?.mode === 'original') {
    return { kind: 'stet', symbol: 'STET', label: 'keep original' };
  }

  const moved = movePeer(edit, edits);
  if (moved === 'from') {
    return { kind: 'transpose-from', symbol: 'TR↗', label: 'move from here' };
  }
  if (moved === 'to') {
    return { kind: 'transpose-to', symbol: '↘TR', label: 'move to here' };
  }

  const from = edit.from;
  const to = edit.to;
  const fromClean = clean(from);
  const toClean = clean(to);

  if (/\n\s*\n/.test(to) && !/\n\s*\n/.test(from)) {
    return { kind: 'paragraph', symbol: '¶', label: 'new paragraph' };
  }
  if (/\n\s*\n/.test(from) && !/\n\s*\n/.test(to)) {
    return { kind: 'no-paragraph', symbol: 'No ¶', label: 'run in / no paragraph' };
  }

  if (from && /^\s+$/.test(from) && !to) {
    return { kind: 'close-up', symbol: '⌒', label: 'close up space' };
  }
  if (!from && to && /^\s+$/.test(to)) {
    return { kind: 'add-space', symbol: '#', label: 'add space' };
  }

  if (
    fromClean
    && toClean
    && lettersOnly(fromClean).toLocaleLowerCase() === lettersOnly(toClean).toLocaleLowerCase()
    && fromClean !== toClean
  ) {
    const alpha = lettersOnly(toClean);
    if (alpha && alpha === alpha.toLocaleUpperCase()) {
      return { kind: 'caps', symbol: 'CAPS', label: 'set in capitals' };
    }
    if (alpha && alpha === alpha.toLocaleLowerCase()) {
      return { kind: 'lowercase', symbol: 'lc', label: 'set lowercase' };
    }
  }

  if (from && !to) return { kind: 'delete', symbol: 'DEL', label: 'delete' };
  if (!from && to) return { kind: 'insert', symbol: 'INS', label: 'insert' };
  return { kind: 'replace', symbol: 'REP', label: 'replace' };
}
