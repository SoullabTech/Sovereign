/**
 * L1 · CURRENT-SESSION-RECOVERY-01 — acceptance falsifier.
 *
 * Pinned obligations (docs/programme/JARVIS-CONTINUITY-LANE1_SILVER_CEDAR_FALSIFIER_2026-09-15.md):
 *
 *   BEHAVIOURAL   P  opaque reference   "what was that phrase I gave you earlier?"
 *                 S  semantic reference "what was I saying earlier about rootedness?"
 *                 C1 recovery           member does not resupply the material
 *                 C2 accounting         A6 counts the recovered exchange as represented
 *                 E  no-echo            ordinary conversation recovers NOTHING
 *
 *   ARCHITECTURAL one general mechanism, ⛔ not two special-case detectors
 *                 — static, because probes cannot distinguish the two.
 */
import { readFileSync } from 'fs';
import {
  recoverDisplacedExchanges,
  retrospectiveDemand,
  RECOVERY_SOURCE,
  type DisplacedExchange,
} from '../../../lib/maia/continuity/sessionRecovery';
import { deriveSessionContinuity } from '../../../lib/maia/continuity/sessionContinuity';

let pass = 0, fail = 0;
const ok = (name: string, cond: boolean, detail = '') => {
  if (cond) { pass++; console.log(`  ✅ ${name}`); }
  else { fail++; console.log(`  ❌ ${name}${detail ? ` — ${detail}` : ''}`); }
};

// ── A realistic long session ────────────────────────────────────────────────
// 39 completed exchanges. The marker sits at index 1, far outside any aperture.
const FILLER = [
  ['How is the writing going today?', 'Steady. What is pulling at you most?'],
  ['I keep circling the third chapter.', 'What makes that one hard to leave alone?'],
  ['The structure feels off somehow.', 'Off how — pacing, or the order of things?'],
  ['Mostly the order.', 'What would move first if you could rearrange it freely?'],
  ['Probably the ending of chapter two.', 'That is a real structural instinct.'],
  ['I am tired though.', 'Tired in the body, or tired of the problem?'],
  ['Tired of the problem.', 'That is a different kind of rest you need.'],
  ['Maybe. The deadline is close.', 'How close, and how fixed is it really?'],
  ['A few weeks. Fairly fixed.', 'Then what is the smallest useful next move?'],
];
const exchanges: DisplacedExchange[] = [];
const push = (u: string, m: string) => {
  const index = exchanges.length;
  exchanges.push({
    exchangeKey: `k${index}`, index,
    timestamp: new Date(1_700_000_000_000 + index * 60_000).toISOString(),
    userMessage: u, maiaResponse: m,
  });
};
push('Morning. Ready to work.', 'Good morning. Where would you like to begin?');
push('Silver cedar is an image that has been on my mind today.',
     'Tell me more about that image — what does it carry for you?');
push('I have been thinking about rootedness lately, how it differs from being stuck.',
     'That distinction sounds important. What separates them for you?');
while (exchanges.length < 39) {
  const [u, m] = FILLER[exchanges.length % FILLER.length]!;
  push(`${u}`, `${m}`);
}
const CORE_APERTURE = 4;
const aperture = exchanges.slice(-CORE_APERTURE);
const displaced = exchanges.slice(0, exchanges.length - CORE_APERTURE);
const recover = (utterance: string) =>
  recoverDisplacedExchanges({ utterance, displaced, corpus: exchanges });

console.log('\n── FIXTURE ──');
ok('39 completed exchanges', exchanges.length === 39, `got ${exchanges.length}`);
ok('marker is displaced, not in aperture',
   displaced.some(e => e.userMessage.includes('Silver cedar')) &&
   !aperture.some(e => e.userMessage.includes('Silver cedar')));

// ── PROBE P · OPAQUE REFERENCE ──────────────────────────────────────────────
console.log('\n── PROBE P · opaque reference ──');
const P = recover('What was the phrase I gave you earlier in this conversation?');
ok('P/C1 · recovers something', P.length > 0);
ok('P/C1 · recovers the SILVER CEDAR exchange',
   P.some(e => e.userMessage.toLowerCase().includes('silver cedar')),
   `got indices ${P.map(e => e.index).join(',')}`);
ok('P · returns 1–3, never a dump', P.length >= 1 && P.length <= 3, `got ${P.length}`);
ok('P · every result carries recovery provenance',
   P.every(e => e.source === RECOVERY_SOURCE));
ok('P · every result carries durable identity',
   P.every(e => typeof e.exchangeKey === 'string' && e.exchangeKey.length > 0));

// ── PROBE S · SEMANTIC REFERENCE ────────────────────────────────────────────
console.log('\n── PROBE S · semantic reference ──');
const S = recover('What was I saying earlier about rootedness?');
ok('S/C1 · recovers something', S.length > 0);
ok('S/C1 · recovers the ROOTEDNESS exchange',
   S.some(e => e.userMessage.toLowerCase().includes('rootedness')),
   `got indices ${S.map(e => e.index).join(',')}`);

// ── THE DISCRIMINATOR ───────────────────────────────────────────────────────
// A pure-similarity implementation passes S and fails P. A phrasing special-case
// passes P and fails S. Only one general mechanism passes both.
console.log('\n── DISCRIMINATOR · both, from one mechanism ──');
ok('P and S return DIFFERENT exchanges (not one fixed answer)',
   P[0]!.index !== S.find(e => e.userMessage.toLowerCase().includes('rootedness'))!.index);

// ── E · NO-ECHO REGRESSION ──────────────────────────────────────────────────
console.log('\n── E · ordinary conversation must NOT drag old turns forward ──');
for (const ordinary of [
  'That sounds good, let us keep going with that.',
  'I think I will rewrite the opening paragraph tonight.',
  'Okay.',
  'The structure feels off somehow.',   // ← lexically identical to a displaced turn
]) {
  ok(`E · "${ordinary.slice(0, 34)}…" recovers nothing`,
     recover(ordinary).length === 0,
     `recovered ${recover(ordinary).length}`);
}
ok('E · retrospectiveDemand is 0 for ordinary speech',
   retrospectiveDemand('I think I will rewrite the opening paragraph tonight.') === 0);
ok('E · retrospectiveDemand is > 0 for backward reach',
   retrospectiveDemand('What was the phrase I gave you earlier?') > 0);

// ── C2 · ACCOUNTING ─────────────────────────────────────────────────────────
console.log('\n── C2 · A6 accounting reflects recovery ──');
const before = deriveSessionContinuity({
  durableCompletedExchanges: exchanges.length,
  representedExchanges: CORE_APERTURE,
});
const after = deriveSessionContinuity({
  durableCompletedExchanges: exchanges.length,
  representedExchanges: CORE_APERTURE + P.length,
});
ok('C2 · pre-recovery baseline is 39/4/35',
   before.depth === 39 && before.represented === 4 && before.absent === 35,
   `${before.depth}/${before.represented}/${before.absent}`);
ok('C2 · represented INCREASES by exactly the recovered count',
   after.represented === CORE_APERTURE + P.length);
ok('C2 · absent DECREASES by exactly the recovered count',
   after.absent === before.absent - P.length,
   `${after.absent} vs ${before.absent - P.length}`);
ok('C2 · depth is unchanged by recovery', after.depth === before.depth);
ok('C2 · recovered are DISJOINT from the aperture (no double-count)',
   P.every(r => !aperture.some(a => a.exchangeKey === r.exchangeKey)));
// The founder's invariant says UNIQUE recovered exchanges. Disjointness from the
// aperture is one half; the other is that the recovered set contains no duplicate
// of itself, or `represented` would be inflated by counting one exchange twice.
ok('C2 · recovered exchanges are UNIQUE among themselves',
   new Set(P.map(e => e.exchangeKey)).size === P.length,
   `${new Set(P.map(e => e.exchangeKey)).size} unique of ${P.length}`);
ok('C2 · represented = aperture + UNIQUE recovered, exactly',
   after.represented === CORE_APERTURE + new Set(P.map(e => e.exchangeKey)).size);
ok('C2 · absent = depth − represented, exactly',
   after.absent === after.depth - after.represented);

// ── A6 NON-REGRESSION ───────────────────────────────────────────────────────
// L1 changed A6's input from `apertureCount` to `apertureCount + recovered.length`.
// ⭐ That is a no-op on every turn where recovery does not fire, which is every
// ordinary conversational turn — so A6's accepted behaviour is untouched except
// exactly where C2 requires it to change.
console.log('\n── A6 NON-REGRESSION · unchanged when recovery is silent ──');
for (const ordinary of [
  'I think I will rewrite the opening paragraph tonight.',
  'That sounds good, let us keep going with that.',
  'Okay.',
]) {
  const rec = recover(ordinary);
  const withL1 = deriveSessionContinuity({
    durableCompletedExchanges: exchanges.length,
    representedExchanges: CORE_APERTURE + rec.length,
  });
  const preL1 = deriveSessionContinuity({
    durableCompletedExchanges: exchanges.length,
    representedExchanges: CORE_APERTURE,
  });
  ok(`A6 · identical for "${ordinary.slice(0, 28)}…"`,
     withL1.depth === preL1.depth &&
     withL1.represented === preL1.represented &&
     withL1.absent === preL1.absent,
     `${withL1.depth}/${withL1.represented}/${withL1.absent} vs ${preL1.depth}/${preL1.represented}/${preL1.absent}`);
}

// ── ARCHITECTURAL · static ──────────────────────────────────────────────────
console.log('\n── ARCHITECTURAL · one mechanism, not two detectors ──');
const strip = (src: string) =>
  src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
const svc = strip(readFileSync('lib/sovereign/maiaService.ts', 'utf8'));
const mod = strip(readFileSync('lib/maia/continuity/sessionRecovery.ts', 'utf8'));

ok('G1 · the recovery primitive is called EXACTLY ONCE in the serving path',
   (svc.match(/recoverDisplacedExchanges\(/g) || []).length === 1);
ok('G2 · FAST and CORE both reach it through the SAME helper',
   (svc.match(/recoverForTier\(/g) || []).length === 3);
ok('G3 · DEEP does NOT call recovery (FAST/CORE only, as authorized)',
   !/deepPathResponse[\s\S]*?recoverForTier\(/.test(svc));
ok('G4 · no retrieval STRATEGY branches on question phrasing',
   !/if\s*\([^)]*(utterance|input)[^)]*\.(includes|match|test)\s*\(/.test(mod));
ok('G5 · retrospectiveDemand is used as a MULTIPLIER, never as a gate-branch',
   /demand\s*\*\s*\(/.test(mod) && !/if\s*\(\s*demand\s*>\s*[0-9.]+\s*\)/.test(mod));
ok('G6 · A6 represented includes the recovered count at BOTH tiers',
   /representedCurrentSessionExchanges\s*\+\s*fastRecovery\.recovered\.length/.test(svc) &&
   /coreRepresentedCurrentSession\s*\+\s*coreRecovery\.recovered\.length/.test(svc));
ok('G7 · recovery is scoped to the current session (no cross-session reach)',
   !/sessionRecovery[\s\S]*?getUserConversationHistory/.test(mod) &&
   !/session_id\s*<>/.test(mod));
ok('G8 · the module performs no I/O',
   !/\bquery\(|\bfetch\(|require\(|import\s+.*from\s+'@\/lib\/db/.test(mod));

console.log(`\n${'─'.repeat(60)}\nL1 FALSIFIER: ${pass} passed · ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
