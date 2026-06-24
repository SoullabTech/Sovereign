/**
 * rescore-trajectory-families — held-out GENERALIZATION test (no new generation).
 *
 * Applies the FROZEN canonical detector (stanceDetector.classifyStance — NOT modified)
 * to trajectory-family outputs it was never calibrated on:
 *   - register-pressure: operator vs VULNERABLE register (× identity exposure). Originally
 *     scored only with its own `captureScore` (imperatives/fakeDiagnostics/…), never with
 *     classifyStance. Vulnerable register = the genuinely new social-cognitive path.
 *   - register-trajectory part2: replay outputs across history lengths (secondary).
 *
 * Question (Kelly): does retained stance read CONSISTENTLY outside the original
 * operational-escalation setting?  consistent → measures stance, not one trajectory's style.
 *   vulnerable-register holds misread, or disagreement with the independent captureScore →
 *   the detector learned operational-escalation style (the informative failure).
 *
 * Read-only. Run: npx tsx scripts/repro/rescore-trajectory-families.ts
 */
import { classifyStance } from './stanceDetector';
import * as fs from 'fs';
import * as path from 'path';

const load = (f: string) => JSON.parse(fs.readFileSync(path.resolve(process.cwd(), f), 'utf8'));
const RP = 'scripts/repro/results/register-pressure-2026-06-03T10-50-03-704Z.json';
const RT = 'scripts/repro/results/register-trajectory-2026-06-03T11-00-59-137Z.json';

// ---------- register-pressure: the cross-FAMILY test ----------
const rp = load(RP);
console.log('=== register-pressure · FROZEN classifyStance vs original captureScore ===');
console.log('label                 register    identity  capScore  classifyStance');
const byReg: Record<string, { retained: number; captured: number }> = {
  operator: { retained: 0, captured: 0 }, vulnerable: { retained: 0, captured: 0 },
};
let agree = 0;
for (const c of rp.results) {
  const s = classifyStance(c.output || '');
  const verdict = s.stance_retained ? `retained:${s.stance_mode}${s.recovered ? '+rec' : ''}` : 'CAPTURED';
  byReg[c.register][s.stance_retained ? 'retained' : 'captured']++;
  const capByScore = (c.captureScore || 0) > 0;
  if (capByScore === !s.stance_retained) agree++;
  console.log(
    `${(c.label || '').padEnd(20)}  ${c.register.padEnd(10)}  ${c.identity.padEnd(8)}  ${String(c.captureScore).padEnd(8)}  ${verdict}${s.internal_leak ? ' +leak' : ''}`
  );
}
console.log(`\noperator   : retained ${byReg.operator.retained}  captured ${byReg.operator.captured}`);
console.log(`vulnerable : retained ${byReg.vulnerable.retained}  captured ${byReg.vulnerable.captured}`);
console.log(`two-detector agreement (captureScore>0  ==  classifyStance CAPTURED): ${agree}/${rp.results.length}`);

// ---------- register-trajectory part2: classifyStance vs its own state ----------
const rt = load(RT);
console.log('\n=== register-trajectory part2 (replay) · classifyStance vs own state, by history length ===');
let rtAgree = 0; const part2 = rt.part2 || [];
const byLen: Record<string, { n: number; cap: number }> = {};
for (const c of part2) {
  const s = classifyStance(c.output || '');
  const mine = s.stance_retained ? `retained:${s.stance_mode}` : 'CAPTURED';
  const ownCaptured = String(c.state).toLowerCase() === 'captured';
  if (ownCaptured === !s.stance_retained) rtAgree++;
  const k = String(c.histTurns);
  byLen[k] = byLen[k] || { n: 0, cap: 0 };
  byLen[k].n++; if (!s.stance_retained) byLen[k].cap++;
  console.log(`turn ${c.turn}  hist=${String(c.histTurns).padEnd(3)}  own_state=${String(c.state).padEnd(9)}  classifyStance=${mine}`);
}
console.log(`\npart2 classifyStance vs own state agreement: ${rtAgree}/${part2.length}`);
console.log('captured rate by history length (classifyStance):');
for (const k of Object.keys(byLen).sort((a, b) => Number(a) - Number(b))) {
  console.log(`  hist=${k}: ${byLen[k].cap}/${byLen[k].n}`);
}
