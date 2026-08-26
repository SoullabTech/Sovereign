/**
 * Line diff for comparing two versions of a draft.
 *
 * Pure, no dependency. Line-level rather than word-level on purpose: a writer
 * comparing two versions of a chapter wants to see WHICH PARAGRAPHS moved, not
 * a confetti of intra-sentence marks. Prose is edited in paragraphs.
 *
 * Classic LCS over lines, with a guard: on very large inputs the quadratic
 * table is refused rather than run, and the caller is told the comparison was
 * too large instead of the tab freezing.
 */

export type ChangeKind = 'same' | 'added' | 'removed';

export interface DiffLine {
  kind: ChangeKind;
  text: string;
  /** 1-indexed line number in the older version, when it exists there. */
  beforeLine: number | null;
  /** 1-indexed line number in the newer version, when it exists there. */
  afterLine: number | null;
}

export interface DiffResult {
  lines: DiffLine[];
  added: number;
  removed: number;
  /** True when the inputs were too large to compare and nothing was computed. */
  tooLarge: boolean;
}

/** Above this many lines on either side, the LCS table is not worth building. */
export const MAX_DIFF_LINES = 4000;

export function diffLines(before: string, after: string): DiffResult {
  const a = before.split('\n');
  const b = after.split('\n');

  if (a.length > MAX_DIFF_LINES || b.length > MAX_DIFF_LINES) {
    return { lines: [], added: 0, removed: 0, tooLarge: true };
  }

  // lcs[i][j] = length of the longest common subsequence of a[i:] and b[j:].
  const lcs: number[][] = Array.from({ length: a.length + 1 }, () =>
    new Array<number>(b.length + 1).fill(0),
  );
  for (let i = a.length - 1; i >= 0; i -= 1) {
    for (let j = b.length - 1; j >= 0; j -= 1) {
      lcs[i][j] = a[i] === b[j] ? lcs[i + 1][j + 1] + 1 : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
    }
  }

  const lines: DiffLine[] = [];
  let added = 0;
  let removed = 0;
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      lines.push({ kind: 'same', text: a[i], beforeLine: i + 1, afterLine: j + 1 });
      i += 1;
      j += 1;
    } else if (lcs[i + 1][j] >= lcs[i][j + 1]) {
      lines.push({ kind: 'removed', text: a[i], beforeLine: i + 1, afterLine: null });
      removed += 1;
      i += 1;
    } else {
      lines.push({ kind: 'added', text: b[j], beforeLine: null, afterLine: j + 1 });
      added += 1;
      j += 1;
    }
  }
  while (i < a.length) {
    lines.push({ kind: 'removed', text: a[i], beforeLine: i + 1, afterLine: null });
    removed += 1;
    i += 1;
  }
  while (j < b.length) {
    lines.push({ kind: 'added', text: b[j], beforeLine: null, afterLine: j + 1 });
    added += 1;
    j += 1;
  }

  return { lines, added, removed, tooLarge: false };
}

/**
 * Collapse long runs of unchanged lines, keeping a little either side of every
 * change. A comparison of two versions of a 200-page book is mostly identical;
 * showing all of it buries the three paragraphs that actually moved.
 *
 * A collapsed run is REPORTED, never silently dropped.
 */
export interface DiffHunk {
  kind: 'lines' | 'collapsed';
  lines: DiffLine[];
  /** For a collapsed run: how many unchanged lines it stands for. */
  count: number;
}

export const CONTEXT_LINES = 3;

export function toHunks(lines: DiffLine[], context: number = CONTEXT_LINES): DiffHunk[] {
  const keep = new Array<boolean>(lines.length).fill(false);
  lines.forEach((line, index) => {
    if (line.kind === 'same') return;
    for (let k = index - context; k <= index + context; k += 1) {
      if (k >= 0 && k < lines.length) keep[k] = true;
    }
  });

  const hunks: DiffHunk[] = [];
  let run: DiffLine[] = [];
  let collapsed = 0;
  const flushRun = () => {
    if (run.length > 0) {
      hunks.push({ kind: 'lines', lines: run, count: run.length });
      run = [];
    }
  };
  const flushCollapsed = () => {
    if (collapsed > 0) {
      hunks.push({ kind: 'collapsed', lines: [], count: collapsed });
      collapsed = 0;
    }
  };

  lines.forEach((line, index) => {
    if (keep[index]) {
      flushCollapsed();
      run.push(line);
    } else {
      flushRun();
      collapsed += 1;
    }
  });
  flushRun();
  flushCollapsed();
  return hunks;
}
