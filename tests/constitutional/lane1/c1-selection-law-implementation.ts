/**
 * CONTINUITY-REMAINDER-01 · ACT 4 implementation witness.
 *
 * The governing oracles were frozen BEFORE implementation at bde5b57b2 in
 * c1-selection-law-acceptance.ts. This file does not define a new law; it applies
 * that already-frozen seven-case acceptance shape to the production candidate.
 */
import assert from 'node:assert/strict';
import frozen from './l1-frozen-production-corpus.json';
import { recoverViaBridge } from '../../../lib/maia/continuity/sessionBridge';

interface Ex { index: number; userMessage: string; maiaResponse: string }
interface Input { probe: string; activePrefix: Ex[]; displaced: Ex[] }
interface Case { name: string; input: Input; expect: (got: number[]) => boolean; law: string }

const MARKER = 22;
const ALT = 13;
const all = frozen.corpus as Ex[];
const clone = (xs: Ex[]) => xs.map(e => ({ ...e }));
const by = (xs: Ex[], i: number) => xs.find(e => e.index === i)!;
const tok = (t: string) => t.toLowerCase().replace(/[^a-z0-9\s'-]/g, ' ')
  .split(/\s+/).filter(x => x.length > 2);

function split(history: Ex[], probe: string, aperture: number): Input {
  return { probe, activePrefix: history.slice(-aperture), displaced: history.slice(0, -aperture) };
}
const p1History = clone(all.filter(e => e.index < 40));
const P1: Case = {
  name: 'P1 · faithful pre-turn original bridge',
  input: split(p1History, frozen.probe, frozen.servedAperture),
  expect: g => g.includes(MARKER), law: `must recover ${MARKER}`,
};

const W1_PROBE = 'what was that phrase I mentioned earlier?';
const p2History = clone(all);
const P2: Case = {
  name: 'P2 · production paraphrase', input: split(p2History, W1_PROBE, 4),
  expect: g => g.includes(MARKER) && !g.includes(27),
  law: `must recover ${MARKER} and reject assistant-carried echo 27`,
};

const markerTokens = new Set(tok(by(all, MARKER).userMessage));
const n1History = clone(p2History);
{
  const e = by(n1History, 39);
  const raw = e.userMessage.split(/\s+/);
  const moved = raw.filter(t => markerTokens.has(t));
  e.userMessage = raw.filter(t => !markerTokens.has(t)).join(' ');
  e.maiaResponse = `${e.maiaResponse} ${moved.join(' ')}`.trim();
}
const N1: Case = {
  name: 'N1 · object anchors assistant-only', input: split(n1History, W1_PROBE, 4),
  expect: g => g.length === 0, law: 'assistant-only object anchors must force abstention',
};
const n2History = clone(p1History);
for (const [slot, src] of [[38, 13], [39, 19]] as const) {
  const dst = by(n2History, slot), repl = by(all, src);
  dst.userMessage = repl.userMessage; dst.maiaResponse = repl.maiaResponse;
}
const N2: Case = {
  name: 'N2 · single opaque ask / no prior retrieval episode',
  input: split(n2History, frozen.probe, frozen.servedAperture),
  expect: g => g.length === 0, law: 'must abstain',
};

const n3History = clone(p2History);
{
  const dst = by(n3History, 40), repl = by(all, 13);
  dst.userMessage = repl.userMessage; dst.maiaResponse = repl.maiaResponse;
}
const N3: Case = {
  name: 'N3 · ordinary turn breaks retrieval episode', input: split(n3History, W1_PROBE, 4),
  expect: g => g.length === 0, law: 'must not jump across the ordinary turn',
};

const n4History = clone(p2History);
for (const slot of [20, 21]) by(n4History, slot).userMessage = by(all, MARKER).userMessage;
const N4: Case = {
  name: 'N4 · too many maximum-coverage targets', input: split(n4History, W1_PROBE, 4),
  expect: g => g.length === 0, law: 'ambiguity must abstain, not index-cut',
};
const altBase = p2History.filter(e => e.index <= 36);
const df = new Map<string, number>();
for (const e of altBase) {
  for (const t of new Set(tok(e.userMessage))) df.set(t, (df.get(t) ?? 0) + 1);
}
const altToken = tok(by(all, ALT).userMessage).find(t => df.get(t) === 1);
assert.ok(altToken, 'P3 construction requires a member-unique token at ALT');
const p3History = clone(p2History);
by(p3History, 40).userMessage = `remember ${altToken}`;
const P3: Case = {
  name: 'P3 · nearest grounded prior ask wins', input: split(p3History, W1_PROBE, 4),
  expect: g => g.includes(ALT) && !g.includes(MARKER),
  law: `must recover nearer grounded target ${ALT}, not older ${MARKER}`,
};

assert.deepEqual(P1.input.activePrefix.map(e => e.index), [37, 38, 39], 'P1 must be pre-turn');
assert.deepEqual(P2.input.activePrefix.map(e => e.index), [37, 38, 39, 40], 'P2 must mirror CORE');

const cases = [P1, P2, P3, N1, N2, N3, N4];
let pass = 0, fail = 0;
for (const c of cases) {
  const result = recoverViaBridge(c.input);
  const got = result.kind === 'recovered' ? result.exchanges.map(e => e.index) : [];
  const ok = c.expect(got);
  if (ok) pass++; else fail++;
  console.log(`${ok ? '✅' : '❌'} ${c.name} — ${c.law} · got [${got}]`);
}
console.log(`ACT 4 IMPLEMENTATION: ${pass} passed · ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
