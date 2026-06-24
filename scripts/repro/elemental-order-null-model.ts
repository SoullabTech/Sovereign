/**
 * Elemental Order — Null-Model Simulation ("build the ruler")
 * ----------------------------------------------------------------------------
 * Companion to docs/lenses/ELEMENTAL_ORDER_PROBE_PREREGISTRATION_2026-06-09.md
 *
 * This does NOT answer "does the elemental order carry information." A simulation
 * only knows the assumptions you build into it; it never touches a real life.
 * Its job is the opposite: to build the BAR that real member data must clear.
 *
 * The honest null is not "zero correlation." It is the correlation produced by
 * the CONFOUND alone: sicker members tend to present in a more scrambled order
 * AND tend to have worse outcomes — so match-score and outcome look correlated
 * even when the order is purely decorative. This script shows:
 *
 *   [1] The confound alone fakes a RAW match×outcome correlation
 *       -> a raw correlation is NOT evidence the order matters.
 *   [2] The SEVERITY-CONTROLLED (partial) correlation under the null
 *       -> its one-sided 95% edge is the BAR your real data must beat.
 *   [3] POWER: how many members you need to detect a real order effect.
 *
 * Model (all toy units): order is DECORATIVE under the null (orderEffect = 0).
 *   severity ~ N(0,1)
 *   matchScore = -confound * severity + noise      (sicker -> more scrambled -> lower match)
 *   outcome    = -sevToOutcome * severity
 *                + orderEffect * matchScore         (the TRUE order signal; 0 under null)
 *                + noise                            (higher outcome = more coherent progress)
 *
 * Run:  npx tsx scripts/repro/elemental-order-null-model.ts
 *   (or: ts-node scripts/repro/elemental-order-null-model.ts)
 *
 * Tune the CONFIG block to your practice (N, plausible effect size, confound strength)
 * and re-run. Nothing here uses real member data — it is a self-contained ruler.
 */

// ---------- tiny dependency-free stats ----------

function randn(): number {
  // Box–Muller
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function mean(a: number[]): number {
  return a.reduce((s, x) => s + x, 0) / a.length;
}

function pearson(x: number[], y: number[]): number {
  const mx = mean(x);
  const my = mean(y);
  let num = 0;
  let dx = 0;
  let dy = 0;
  for (let i = 0; i < x.length; i++) {
    const a = x[i] - mx;
    const b = y[i] - my;
    num += a * b;
    dx += a * a;
    dy += b * b;
  }
  return num / Math.sqrt(dx * dy);
}

/** Partial correlation of x,y controlling for z. */
function partialCorr(x: number[], y: number[], z: number[]): number {
  const rxy = pearson(x, y);
  const rxz = pearson(x, z);
  const ryz = pearson(y, z);
  return (rxy - rxz * ryz) / Math.sqrt((1 - rxz * rxz) * (1 - ryz * ryz));
}

function quantile(values: number[], q: number): number {
  const s = [...values].sort((a, b) => a - b);
  const pos = (s.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  return s[base + 1] !== undefined ? s[base] + rest * (s[base + 1] - s[base]) : s[base];
}

// ---------- the model ----------

interface Params {
  nMembers: number;
  confound: number;        // severity -> scramble. 0 = no confound. The reason raw corr lies.
  sevToOutcome: number;    // severity -> worse outcome.
  orderEffect: number;     // TRUE effect of matching canonical order on outcome. 0 = decorative (null).
  noise: number;
}

/** One synthetic cohort -> its raw and severity-controlled match×outcome correlations. */
function simulateCohort(p: Params): { raw: number; partial: number } {
  const sev: number[] = [];
  const match: number[] = [];
  const out: number[] = [];
  for (let i = 0; i < p.nMembers; i++) {
    const s = randn();
    const m = -p.confound * s + p.noise * randn();
    const o = -p.sevToOutcome * s + p.orderEffect * m + p.noise * randn();
    sev.push(s);
    match.push(m);
    out.push(o);
  }
  return { raw: pearson(match, out), partial: partialCorr(match, out, sev) };
}

/** One-sided 95% null bar for the PARTIAL correlation, at a given N. */
function nullBarAtN(base: Params, n: number, nSims: number, q = 0.95): number {
  const partials: number[] = [];
  const p: Params = { ...base, nMembers: n, orderEffect: 0 };
  for (let i = 0; i < nSims; i++) partials.push(simulateCohort(p).partial);
  return quantile(partials, q);
}

/** Fraction of cohorts whose partial correlation clears the N-specific null bar. */
function powerAtN(base: Params, n: number, orderEffect: number, nSims: number): number {
  const bar = nullBarAtN(base, n, nSims);
  const p: Params = { ...base, nMembers: n, orderEffect };
  let hits = 0;
  for (let i = 0; i < nSims; i++) if (simulateCohort(p).partial > bar) hits++;
  return hits / nSims;
}

// ---------- report ----------

const f = (x: number) => x.toFixed(3);

function main(): void {
  // ============ CONFIG — tune to your practice ============
  const N = 120;            // members you can code
  const nSims = 5000;       // simulated cohorts
  const confound = 0.5;     // severity -> scramble (set 0 to see the unconfounded null)
  const sevToOutcome = 0.6; // severity -> worse outcome
  const noise = 1.0;
  const plausibleEffects = [0.1, 0.2, 0.3]; // small / moderate / large true order effects
  const sampleSizes = [60, 120, 250, 500];
  // ========================================================

  const base: Params = { nMembers: N, confound, sevToOutcome, orderEffect: 0, noise };

  const raws: number[] = [];
  const partials: number[] = [];
  for (let i = 0; i < nSims; i++) {
    const r = simulateCohort(base);
    raws.push(r.raw);
    partials.push(r.partial);
  }

  const rawMean = mean(raws);
  const rawLo = quantile(raws, 0.025);
  const rawHi = quantile(raws, 0.975);
  const parLo = quantile(partials, 0.025);
  const parHi = quantile(partials, 0.975);
  const bar = quantile(partials, 0.95);

  console.log('\n=== Elemental Order — Null-Model Simulation ===');
  console.log(`N=${N} members, ${nSims} cohorts, severity->scramble confound=${confound}`);
  console.log('(order is DECORATIVE in every run below — there is no real signal)\n');

  console.log('[1] RAW match x outcome correlation under the NULL:');
  console.log(`    mean ${f(rawMean)},  95% interval [${f(rawLo)}, ${f(rawHi)}]`);
  console.log('    -> the confound ALONE makes match-score and outcome look related.');
  console.log('    -> a raw correlation in this band is NOT evidence the order matters.\n');

  console.log('[2] SEVERITY-CONTROLLED (partial) correlation under the NULL:');
  console.log(`    95% interval [${f(parLo)}, ${f(parHi)}]`);
  console.log(`    one-sided 95% BAR = ${f(bar)}`);
  console.log(`    -> THIS is the ruler. Your real data's partial correlation (at N=${N})`);
  console.log(`       must exceed ${f(bar)} to be a signal rather than chance + confound.\n`);

  console.log('[3] POWER — IF the order genuinely carries information (orderEffect > 0):');
  console.log('    fraction of cohorts whose partial correlation clears the N-specific null bar.\n');
  const header = ['effect \\ N', ...sampleSizes.map((n) => String(n).padStart(6))].join('  ');
  console.log('    ' + header);
  for (const eff of plausibleEffects) {
    const row = sampleSizes.map((n) => (powerAtN(base, n, eff, nSims) * 100).toFixed(0).padStart(5) + '%');
    console.log('    ' + String(eff).padEnd(10) + '  ' + row.join('  '));
  }

  console.log('\nReading it:');
  console.log('  - If [1] is well away from zero but [2] straddles zero, the confound was faking');
  console.log('    the raw signal — exactly why the PARTIAL correlation is the test, not the raw.');
  console.log('  - Use [2]\'s BAR as the threshold your real-data partial correlation must beat.');
  console.log('  - Use [3] to pick the N you need before the natural-variation analysis is worth running.');
  console.log('  - A real-data partial correlation inside [2]\'s interval is a first-class result:');
  console.log('    here, the order behaves as convention, not grammar. The work loses nothing by it.\n');
}

main();
