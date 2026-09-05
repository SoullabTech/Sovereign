/**
 * Myers greedy diff — exact equality only. No similarity, no scoring.
 *
 * Written here because the repo has no diff dependency and WS2-04A must not
 * acquire one for a read-only measurement. Operates on any array of comparable
 * items, so one routine serves both the line pass and the character refinement.
 *
 * O(ND), and both passes run on inputs whose edit distance is small relative to
 * their length — exactly the case Myers is efficient for.
 */

export type Op =
  | { type: 'eq'; aStart: number; aEnd: number; bStart: number; bEnd: number }
  | { type: 'del'; aStart: number; aEnd: number; bAt: number }
  | { type: 'ins'; bStart: number; bEnd: number; aAt: number };

export function diff<T>(a: readonly T[], b: readonly T[]): Op[] {
  // Trim identical ends first: cheap, and it is what keeps D small.
  let pre = 0;
  while (pre < a.length && pre < b.length && a[pre] === b[pre]) pre++;
  let suf = 0;
  while (
    suf < a.length - pre &&
    suf < b.length - pre &&
    a[a.length - 1 - suf] === b[b.length - 1 - suf]
  ) suf++;

  const ops: Op[] = [];
  if (pre > 0) ops.push({ type: 'eq', aStart: 0, aEnd: pre, bStart: 0, bEnd: pre });
  ops.push(...core(a.slice(pre, a.length - suf), b.slice(pre, b.length - suf), pre));
  if (suf > 0) {
    ops.push({
      type: 'eq',
      aStart: a.length - suf, aEnd: a.length,
      bStart: b.length - suf, bEnd: b.length,
    });
  }
  return coalesce(ops);
}

function core<T>(a: readonly T[], b: readonly T[], off: number): Op[] {
  const N = a.length;
  const M = b.length;
  if (N === 0 && M === 0) return [];
  if (N === 0) return [{ type: 'ins', bStart: off, bEnd: off + M, aAt: off }];
  if (M === 0) return [{ type: 'del', aStart: off, aEnd: off + N, bAt: off }];

  const v = new Map<number, number>([[1, 0]]);
  const trace: Map<number, number>[] = [];
  for (let d = 0; d <= N + M; d++) {
    trace.push(new Map(v));
    for (let k = -d; k <= d; k += 2) {
      const left = v.get(k - 1) ?? -1;
      const right = v.get(k + 1) ?? -1;
      let x = k === -d || (k !== d && left < right) ? right : left + 1;
      let y = x - k;
      while (x < N && y < M && a[x] === b[y]) { x++; y++; }
      v.set(k, x);
      if (x >= N && y >= M) return backtrack(trace, d, off, N, M);
    }
  }
  return [];
}

function backtrack(
  trace: Map<number, number>[], d0: number, off: number, N: number, M: number,
): Op[] {
  const out: Op[] = [];
  let x = N;
  let y = M;
  for (let d = d0; d > 0; d--) {
    const v = trace[d];
    const k = x - y;
    const left = v.get(k - 1) ?? -1;
    const right = v.get(k + 1) ?? -1;
    const down = k === -d || (k !== d && left < right);
    const kPrev = down ? k + 1 : k - 1;
    const xStart = v.get(kPrev) ?? 0;
    const yStart = xStart - kPrev;
    const xMid = down ? xStart : xStart + 1;
    const yMid = xMid - k;

    if (x > xMid) {
      out.push({
        type: 'eq',
        aStart: off + xMid, aEnd: off + x,
        bStart: off + yMid, bEnd: off + y,
      });
    }
    if (down) out.push({ type: 'ins', bStart: off + yStart, bEnd: off + yMid, aAt: off + xStart });
    else out.push({ type: 'del', aStart: off + xStart, aEnd: off + xMid, bAt: off + yStart });

    x = xStart;
    y = yStart;
  }
  if (x > 0) out.push({ type: 'eq', aStart: off, aEnd: off + x, bStart: off, bEnd: off + y });
  return out.reverse();
}

function coalesce(ops: Op[]): Op[] {
  const out: Op[] = [];
  for (const op of ops) {
    const last = out[out.length - 1];
    if (last?.type === 'eq' && op.type === 'eq' && last.aEnd === op.aStart) {
      last.aEnd = op.aEnd; last.bEnd = op.bEnd; continue;
    }
    if (last?.type === 'del' && op.type === 'del' && last.aEnd === op.aStart) {
      last.aEnd = op.aEnd; continue;
    }
    if (last?.type === 'ins' && op.type === 'ins' && last.bEnd === op.bStart) {
      last.bEnd = op.bEnd; continue;
    }
    out.push({ ...op } as Op);
  }
  return out;
}
