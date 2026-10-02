/**
 * JARVIS-JEV-LABEL-01 — statistics. Pure, dependency-free, provider-free.
 *
 * The frozen verdict quantity (protocol §4.3) is the ONE-SIDED exact Clopper–Pearson upper
 * confidence bound at alpha = 0.05. The two-sided interval is exported only so that its
 * substitution can be built as a defeat candidate; nothing on the shipped path calls it.
 */

export const ALPHA = 0.05;
export const TAUS: readonly number[] = Object.freeze([0.5, 0.8, 0.95]);

const logFactCache: number[] = [0];
function logFact(n: number): number {
  for (let i = logFactCache.length; i <= n; i += 1) {
    logFactCache[i] = (logFactCache[i - 1] ?? 0) + Math.log(i);
  }
  return logFactCache[n] ?? 0;
}

function logChoose(n: number, k: number): number {
  return logFact(n) - logFact(k) - logFact(n - k);
}

/** P(X <= k) for X ~ Binomial(n, p), summed in log space. */
export function binomCdf(k: number, n: number, p: number): number {
  if (k < 0) return 0;
  if (k >= n) return 1;
  if (p <= 0) return 1;
  if (p >= 1) return 0;
  const lp = Math.log(p);
  const lq = Math.log1p(-p);
  let sum = 0;
  for (let i = 0; i <= k; i += 1) {
    sum += Math.exp(logChoose(n, i) + i * lp + (n - i) * lq);
  }
  return Math.min(1, sum);
}

/**
 * One-sided exact Clopper–Pearson upper bound: the p solving P(X <= k | n, p) = alpha.
 * k = 0 has the closed form 1 - alpha^(1/n). n = 0 is "no evidence" and returns 1.
 */
export function cpUpperOneSided(k: number, n: number, alpha: number = ALPHA): number {
  if (!Number.isInteger(k) || !Number.isInteger(n) || k < 0 || n < 0 || k > n) {
    throw new RangeError(`cpUpperOneSided: invalid counts k=${k} n=${n}`);
  }
  if (n === 0) return 1;
  if (k >= n) return 1;
  if (k === 0) return 1 - Math.pow(alpha, 1 / n);
  let lo = k / n;
  let hi = 1;
  for (let i = 0; i < 200; i += 1) {
    const mid = (lo + hi) / 2;
    if (binomCdf(k, n, mid) > alpha) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

/** The conventional two-sided 95% upper limit. ⛔ NOT the frozen convention. */
export function cpUpperTwoSided(k: number, n: number, alpha: number = ALPHA): number {
  return cpUpperOneSided(k, n, alpha / 2);
}

export function cohenKappa(pairs: ReadonlyArray<readonly [boolean, boolean]>): number | null {
  const n = pairs.length;
  if (n === 0) return null;
  let tt = 0;
  let tf = 0;
  let ft = 0;
  let ff = 0;
  for (const [a, b] of pairs) {
    if (a && b) tt += 1;
    else if (a && !b) tf += 1;
    else if (!a && b) ft += 1;
    else ff += 1;
  }
  const po = (tt + ff) / n;
  const pa = (tt + tf) / n;
  const pb = (tt + ft) / n;
  const pe = pa * pb + (1 - pa) * (1 - pb);
  if (pe >= 1) return null;
  return (po - pe) / (1 - pe);
}

/** Quadratic-weighted kappa over ordinal categories 1..5. */
export function weightedKappaQuadratic(
  pairs: ReadonlyArray<readonly [number, number]>,
  categories = 5,
): number | null {
  const n = pairs.length;
  if (n === 0) return null;
  const rowM: number[] = new Array<number>(categories).fill(0);
  const colM: number[] = new Array<number>(categories).fill(0);
  let obsNum = 0;
  for (const [a, b] of pairs) {
    const i = a - 1;
    const j = b - 1;
    if (i < 0 || j < 0 || i >= categories || j >= categories) {
      throw new RangeError(`weightedKappaQuadratic: band out of range (${a}, ${b})`);
    }
    rowM[i] = (rowM[i] ?? 0) + 1;
    colM[j] = (colM[j] ?? 0) + 1;
    obsNum += (i - j) ** 2;
  }
  let expNum = 0;
  for (let i = 0; i < categories; i += 1) {
    for (let j = 0; j < categories; j += 1) {
      expNum += (i - j) ** 2 * (((rowM[i] ?? 0) * (colM[j] ?? 0)) / n);
    }
  }
  if (expNum === 0) return null;
  return 1 - obsNum / expNum;
}

/** Five ordinal bands over the J1 Score in [0,1]: b(s) = min(5, 1 + floor(5s)). */
export function bandOf(score: number): number {
  return Math.min(5, 1 + Math.floor(5 * score));
}
