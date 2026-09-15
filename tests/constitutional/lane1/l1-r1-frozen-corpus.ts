/**
 * R1 · the authoritative C1 test — the frozen PRODUCTION corpus.
 *
 * ⭐ CONTROL FIRST. The deployed scorer must reproduce [2,3,36] on this corpus. If it
 * does not, the freeze is not faithful and NOTHING downstream of it may be believed —
 * the repair is not even run.
 *
 * ⛔ No tuning between the control and the R1 run.
 */
import corpusJson from './l1-frozen-production-corpus.json';
// The deployed scorer is materialized from git at run time so the control can never
// drift from what production actually shipped:
//   git show e57ca1ba:lib/maia/continuity/sessionRecovery.ts \
//     > tests/constitutional/lane1/_deployed-scorer.ts
import * as deployed from './_deployed-scorer';
import * as repaired from '../../../lib/maia/continuity/sessionRecovery';

const all = corpusJson.corpus.map(e => ({
  exchangeKey: `k${e.index}`, index: e.index,
  timestamp: new Date(1_700_000_000_000 + e.index * 60_000).toISOString(),
  userMessage: e.userMessage, maiaResponse: e.maiaResponse,
}));
const [lo, hi] = corpusJson.displacedRange as [number, number];
const displaced = all.slice(lo, hi + 1);
const probe = corpusJson.probe;
const MARKER = corpusJson.markerIndex;
const EXPECT = corpusJson.deployedScorerSelected as number[];

const run = (m: typeof repaired) =>
  m.recoverDisplacedExchanges({ utterance: probe, displaced, corpus: all }).map(e => e.index);

console.log(`corpus ${all.length} · displaced ${lo}..${hi} · marker ${MARKER}`);
console.log(`probe  "${probe}"`);

const ctl = run(deployed as unknown as typeof repaired);
const ctlOk = JSON.stringify(ctl) === JSON.stringify(EXPECT);
console.log(`\nCONTROL · deployed scorer → [${ctl}]   expected [${EXPECT}]`);
console.log(ctlOk
  ? '  ✅ FREEZE IS FAITHFUL — it reproduces the production failure exactly'
  : '  ❌ FREEZE REJECTED as non-faithful — repair NOT tested');

if (!ctlOk) process.exit(1);

const rep = run(repaired);
const r1 = rep.includes(MARKER);
console.log(`\nR1 · repaired scorer → [${rep}]`);
console.log(r1
  ? `  ✅ R1 PASS — marker ${MARKER} recovered from the real production corpus`
  : `  ❌ R1 FAIL — marker ${MARKER} absent; C1 repair rejected`);

process.exit(r1 ? 0 : 1);
