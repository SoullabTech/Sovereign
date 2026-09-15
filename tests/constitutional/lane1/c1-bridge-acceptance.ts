/**
 * C1-BRIDGE · PRE-IMPLEMENTATION ACCEPTANCE SET — P1 · N1 · N2
 *
 * Authority: founder ruling 2026-09-15. ⛔ Frozen BEFORE any bridge implementation
 * exists, so no oracle can be shaped to make a candidate pass.
 *
 * ⭐⭐ THE GOVERNING LAW:
 *   ABSENCE OF A BRIDGE IS EVIDENCE. It must not become permission to invent a weaker
 *   one. Otherwise the implementation degrades into "find the best path available",
 *   which recreates the exact ranking problem this lane is trying to escape.
 *
 * ⛔ When no member-grounded bridge exists, the mechanism ABSTAINS. Not: lower the
 *    threshold · fall back to assistant echoes · substitute semantic similarity ·
 *    broaden the window · reweight distinctiveness · take "best available".
 *
 * ALL THREE CORPORA ARE DERIVED FROM THE ONE AUTHORITATIVE FROZEN SESSION by minimal,
 * stated mutations. ⛔ None is invented, so none can flatter a hypothesis.
 */
import frozen from './l1-frozen-production-corpus.json';

export interface BridgeExchange {
  index: number; userMessage: string; maiaResponse: string;
}
/** A candidate bridge mechanism: returns the displaced indices it recovers. */
export type BridgeFn = (input: {
  probe: string;
  activePrefix: readonly BridgeExchange[];
  displaced: readonly BridgeExchange[];
}) => number[];

const all = frozen.corpus as BridgeExchange[];
export const MARKER = 22;
const PRIOR_ASK = 39;
const clone = () => all.map(e => ({ ...e }));

// ── P1 · the authoritative corpus, unmodified ───────────────────────────────
export const P1 = { name: 'P1 · genuine member-originated bridge', corpus: clone() };

// ── N1 · the ONLY mutation: the prior ask's marker tokens move member → MAIA ─
// The path 40 → 39 → 22 still EXISTS, but its second hop is now assistant-originated.
// ⭐ Nothing else changes, so N1 isolates ORIGIN and nothing else.
const N1corpus = clone();
{
  const e = N1corpus.find(x => x.index === PRIOR_ASK)!;
  const markerToks = new Set(
    all.find(x => x.index === MARKER)!.userMessage.split(/\s+/)
  );
  const moved = e.userMessage.split(/\s+/).filter(t => markerToks.has(t));
  e.userMessage = e.userMessage.split(/\s+/).filter(t => !markerToks.has(t)).join(' ');
  e.maiaResponse = `${e.maiaResponse} ${moved.join(' ')}`.trim();
}
export const N1 = { name: 'N1 · bridge exists ONLY through MAIA echo', corpus: N1corpus };

// ── N2 · the active prefix's PRIOR ASKS are replaced by ordinary conversation ─
//
// ⚠️⚠️ A FIRST DRAFT REMOVED ONLY idx 39 AND WAS WRONG. The real session contains
// THREE retrospective asks — 38, 39 and 40 — because the member asked, was refused,
// and asked again. Leaving 38 standing left a prior ask in the prefix, so N2 was never
// a single-ask case, and it would have failed a CORRECT bridge for the wrong reason.
// ⭐ Caught while building the defeat candidates, before the oracle froze.
//
// ⭐ The mutation substitutes two ORDINARY exchanges from this same session into the
// prefix positions, keeping indices and corpus size. Nothing is invented: the
// replacement text is the member's own, from elsewhere in the same conversation.
const N2corpus = clone();
{
  const ordinary = [13, 19].map(i => all.find(e => e.index === i)!);
  for (const [k, idx] of [38, 39].entries()) {
    const slot = N2corpus.find(e => e.index === idx)!;
    slot.userMessage = ordinary[k]!.userMessage;
    slot.maiaResponse = ordinary[k]!.maiaResponse;
  }
}
export const N2 = { name: 'N2 · single ask, NO bridge', corpus: N2corpus };

function split(corpus: BridgeExchange[]) {
  const probeEx = corpus.find(e => e.index === 40)!;
  return {
    probe: probeEx.userMessage,
    activePrefix: corpus.filter(e => e.index >= 38 && e.index <= 39),
    displaced: corpus.filter(e => e.index <= 37),
  };
}

export function runAcceptance(bridge: BridgeFn, label: string): boolean {
  console.log(`\n═══ ${label} ═══`);
  const cases: { c: typeof P1; expect: (got: number[]) => boolean; why: string }[] = [
    { c: P1, expect: g => g.includes(MARKER), why: `must recover ${MARKER}` },
    { c: N1, expect: g => !g.includes(MARKER), why: `must NOT recover ${MARKER}` },
    { c: N2, expect: g => g.length === 0,      why: 'must recover NOTHING' },
  ];
  let ok = true;
  for (const { c, expect, why } of cases) {
    const got = bridge(split(c.corpus));
    const pass = expect(got);
    if (!pass) ok = false;
    console.log(`  ${pass ? '✅' : '❌'} ${c.name}\n       ${why} · got [${got}]`);
  }
  return ok;
}

// ── DEFEAT CANDIDATES · the suite must kill both ────────────────────────────
// ⛔ ABSTAIN passes both negatives and fails the positive — it is not a bridge.
const ABSTAIN: BridgeFn = () => [];
// ⛔ BEST-AVAILABLE is the degradation the law names: always return the closest thing.
//    It passes P1 by accident and FAILS N2, which is the whole point of N2.
const BEST_AVAILABLE: BridgeFn = ({ probe, activePrefix, displaced }) => {
  const tk = (t: string) => new Set(t.toLowerCase().split(/\s+/).filter(x => x.length > 2));
  const pt = tk(probe);
  const hops = activePrefix.filter(p => [...tk(p.userMessage)].some(t => pt.has(t)));
  const src = new Set(hops.flatMap(h => [...tk(h.userMessage), ...tk(h.maiaResponse)]));
  const scored = displaced
    .map(d => ({ i: d.index, n: [...tk(d.userMessage), ...tk(d.maiaResponse)].filter(t => src.has(t)).length }))
    .sort((a, b) => b.n - a.n);
  return scored.slice(0, 1).map(x => x.i);   // ⛔ always returns SOMETHING
};

// ⛔ DC-3 · a CORRECT member-grounded bridge that FALLS BACK when none exists.
//    This is the degradation the governing law names, and it is the candidate that
//    isolates N2: it passes P1 and N1 and must die on N2 alone.
const BRIDGE_WITH_FALLBACK: BridgeFn = ({ probe, activePrefix, displaced }) => {
  const tk = (t: string) => t.toLowerCase().split(/\s+/).filter(x => x.length > 2);
  const pt = new Set(tk(probe));
  const hops = activePrefix.filter(p => tk(p.userMessage).some(t => pt.has(t)));
  const srcMember = new Set(hops.flatMap(h => tk(h.userMessage)));
  const scored = displaced
    .map(d => ({ i: d.index, n: [...new Set(tk(d.userMessage))].filter(t => srcMember.has(t)).length }))
    .filter(x => x.n > 0)
    .sort((a, b) => b.n - a.n || a.i - b.i);
  if (scored.length > 0) return scored.slice(0, 3).map(x => x.i);
  // ⛔ THE DEFECT: no bridge found, so take the best available anyway.
  const anySrc = new Set(activePrefix.flatMap(h => [...tk(h.userMessage), ...tk(h.maiaResponse)]));
  return displaced
    .map(d => ({ i: d.index, n: [...new Set(tk(d.userMessage))].filter(t => anySrc.has(t)).length }))
    .sort((a, b) => b.n - a.n || a.i - b.i).slice(0, 1).map(x => x.i);
};

// ── THE IMPLEMENTATION, against the frozen oracles ──────────────────────────
import { recoverViaBridge } from '../../../lib/maia/continuity/sessionBridge';
export const IMPLEMENTATION: BridgeFn = ({ probe, activePrefix, displaced }) => {
  const r = recoverViaBridge({ probe, activePrefix, displaced });
  return r.kind === 'recovered' ? r.exchanges.map(e => e.index) : [];
};

if (process.argv[1]?.includes('c1-bridge-acceptance')) {
  console.log('C1-BRIDGE · pre-implementation acceptance set (oracles frozen)');
  const a = runAcceptance(ABSTAIN, 'DEFEAT · always abstain');
  const b = runAcceptance(BEST_AVAILABLE, 'DEFEAT · best available path');
  const c = runAcceptance(BRIDGE_WITH_FALLBACK, 'DEFEAT · correct bridge WITH fallback');
  console.log(`\n${'─'.repeat(62)}`);
  console.log(`  ABSTAIN       ${a ? '⛔ SURVIVED — suite is not lethal' : '✅ killed (fails P1)'}`);
  console.log(`  BEST-AVAILABLE ${b ? '⛔ SURVIVED — suite is not lethal' : '✅ killed (fails a negative)'}`);
  console.log(`  BRIDGE+FALLBACK ${c ? '⛔ SURVIVED — N2 is not discriminating' : '✅ killed — N2 discriminates'}`);
  const impl = runAcceptance(IMPLEMENTATION, 'C1-BRIDGE-02 · IMPLEMENTATION');
  console.log(`  IMPLEMENTATION  ${impl ? '✅ PASSES P1 · N1 · N2' : '⛔ FAILS'}`);
  process.exit(!a && !b && !c && impl ? 0 : 1);
}
