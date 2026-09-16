/**
 * CONTINUITY-REMAINDER-01 · ACT 3 · PRE-IMPLEMENTATION selection-law oracles.
 *
 * Frozen BEFORE any replacement bridge implementation. All cases derive from the
 * authoritative content-free production corpus by minimal stated mutations.
 * Serving snapshots use PRE-TURN history; the current probe is never inserted into
 * its own history (ACT 1 §A).
 */
import assert from 'node:assert/strict';
import frozen from './l1-frozen-production-corpus.json';
import { retrospectiveDemand } from '../../../lib/maia/continuity/sessionRecovery';

interface Ex { index: number; userMessage: string; maiaResponse: string }
interface Input { probe: string; activePrefix: Ex[]; displaced: Ex[] }
type Candidate = (i: Input) => number[];
interface Case { name: string; input: Input; expect: (got: number[]) => boolean; law: string }

const MARKER = 22;
const ALT = 13;
const MAX = 3;
const all = frozen.corpus as Ex[];
const clone = (xs: Ex[]) => xs.map(e => ({ ...e }));
const by = (xs: Ex[], i: number) => xs.find(e => e.index === i)!;
const SW = new Set([
  'a','an','the','and','or','but','if','of','to','in','on','at','by','for','with',
  'about','as','is','are','was','were','be','been','being','it','its','this','that',
  'these','those','i','you','we','they','he','she','me','my','your','our','their',
  'do','does','did','have','has','had','not','no','so','than','then','there','here',
  'what','which','who','whom','when','where','why','how','can','could','would',
  'should','will','just','from','up','out','into','over','again','more','some','any',
  'all','very','really','like','get','got','know','think','one','thing','things',
]);
const RETRIEVAL = new Set([
  'remember','remembered','recall','recalled','forget','forgot','forgotten',
  'earlier','previously','before','ago','back','start','started','beginning','last',
  'said','say','saying','told','tell','telling','mention','mentioned','mentioning',
  'shared','share','sharing','gave','give','given','brought','talked','discussed',
  'phrase','word','words','conversation','chat','thread','something','anything',
]);
const tok = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s'-]/g, ' ')
  .split(/\s+/).filter(t => t.length > 2 && !SW.has(t));
const uniq = (xs: string[]) => [...new Set(xs)];
const split = (history: Ex[], probe: string, aperture: number): Input => ({
  probe,
  activePrefix: history.slice(-aperture),
  displaced: history.slice(0, Math.max(0, history.length - aperture)),
});
function groundedAnchors(e: Ex, displaced: Ex[], originBlind = false): string[] {
  const priorMember = new Set(displaced.flatMap(d => tok(d.userMessage)));
  const sourceText = originBlind ? `${e.userMessage} ${e.maiaResponse}` : e.userMessage;
  return uniq(tok(sourceText).filter(t => !RETRIEVAL.has(t)))
    .filter(t => priorMember.has(t));
}

function model(input: Input, opts: {
  originBlind?: boolean; targetOriginBlind?: boolean; fallback?: boolean; cutAmbiguity?: boolean; oldest?: boolean;
} = {}): number[] {
  const episode: Ex[] = [];
  for (const e of [...input.activePrefix].reverse()) {
    if (retrospectiveDemand(e.userMessage) <= 0) break;
    episode.push(e);
  }
  const sources = episode.map(e => ({ e, a: groundedAnchors(e, input.displaced, opts.originBlind) }))
    .filter(x => x.a.length > 0);
  const source = opts.oldest ? sources[sources.length - 1] : sources[0];
  if (!source) return opts.fallback ? [input.displaced[0]?.index ?? -1].filter(i => i >= 0) : [];
  const anchors = new Set(source.a);
  const scored = input.displaced.map(e => ({
    i: e.index,
    n: uniq(tok(opts.targetOriginBlind ? e.userMessage + " " + e.maiaResponse : e.userMessage)).filter(t => anchors.has(t)).length,
  }));
  const max = Math.max(0, ...scored.map(x => x.n));
  if (max <= 0) return opts.fallback ? [input.displaced[0]?.index ?? -1].filter(i => i >= 0) : [];
  const top = scored.filter(x => x.n === max).sort((a, b) => a.i - b.i);
  if (top.length > MAX && !opts.cutAmbiguity) return [];
  return top.slice(0, MAX).map(x => x.i);
}
const CURRENT_FAILED: Candidate = ({ probe, activePrefix, displaced }) => {
  const pt = new Set(tok(probe));
  const candidates = new Map<number, { n: number; via: number }>();
  for (const h of activePrefix) {
    if (!tok(h.userMessage).some(t => pt.has(t))) continue;
    const carriers = new Set(tok(h.userMessage).filter(t => !pt.has(t)));
    for (const d of displaced) {
      const n = uniq(tok(d.userMessage)).filter(t => carriers.has(t)).length;
      if (n <= 0) continue;
      const old = candidates.get(d.index);
      if (!old || n > old.n) candidates.set(d.index, { n, via: h.index });
    }
  }
  return [...candidates.entries()]
    .sort((a, b) => b[1].n - a[1].n || a[0] - b[0])
    .slice(0, MAX).map(([i]) => i);
};

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
  expect: g => g.includes(MARKER) && !g.includes(27), law: `must recover 22 and reject assistant-carried echo 27`,
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
  expect: g => g.length === 0, law: `assistant-only object anchors must force abstention`,
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
for (const e of altBase) for (const t of new Set(tok(e.userMessage))) df.set(t, (df.get(t) ?? 0) + 1);
const altToken = tok(by(all, ALT).userMessage).find(t => df.get(t) === 1);
assert.ok(altToken, 'P3 construction requires a member-unique token at ALT');
const p3History = clone(p2History);
by(p3History, 40).userMessage = `remember ${altToken}`;
const P3: Case = {
  name: 'P3 · nearest grounded prior ask wins', input: split(p3History, W1_PROBE, 4),
  expect: g => g.includes(ALT) && !g.includes(MARKER),
  law: `must recover nearer grounded target ${ALT}, not older ${MARKER}`,
};

const CASES = [P1, P2, P3, N1, N2, N3, N4];
assert.deepEqual(P1.input.activePrefix.map(e => e.index), [37, 38, 39], 'P1 must be pre-turn');
assert.deepEqual(P2.input.activePrefix.map(e => e.index), [37, 38, 39, 40], 'P2 must mirror CORE');
assert.equal(
  tok(W1_PROBE).some(t => new Set(tok(by(p2History, 39).userMessage)).has(t)),
  false,
  'P2 must preserve the production fact: W1 has zero exact HOP-1 overlap with source 39',
);

const ABSTAIN: Candidate = () => [];
const ORIGIN_BLIND: Candidate = i => model(i, { originBlind: true });
const TARGET_ORIGIN_BLIND: Candidate = i => model(i, { targetOriginBlind: true });
const FALLBACK: Candidate = i => model(i, { fallback: true });
const CUT_AMBIGUITY: Candidate = i => model(i, { cutAmbiguity: true });
const OLDEST_SOURCE: Candidate = i => model(i, { oldest: true });
const REFERENCE_LAW: Candidate = i => model(i);

function run(candidate: Candidate, label: string): boolean {
  console.log(`\n═══ ${label} ═══`);
  let ok = true;
  for (const c of CASES) {
    const got = candidate(c.input);
    const pass = c.expect(got);
    ok = ok && pass;
    console.log(`  ${pass ? '✅' : '❌'} ${c.name}\n       ${c.law} · got [${got}]`);
  }
  return ok;
}
if (process.argv[1]?.includes('c1-selection-law-acceptance')) {
  console.log('CONTINUITY-REMAINDER-01 · ACT 3 · frozen selection-law oracles');
  const reference = run(REFERENCE_LAW, 'REFERENCE LAW · construction witness');
  const mutants = [
    ['DEFEAT · always abstain', ABSTAIN],
    ['DEFEAT · current exact-token bridge', CURRENT_FAILED],
    ['DEFEAT · source origin blind', ORIGIN_BLIND],
    ['DEFEAT · target origin blind', TARGET_ORIGIN_BLIND],
    ['DEFEAT · bridge with fallback', FALLBACK],
    ['DEFEAT · ambiguity cut by position', CUT_AMBIGUITY],
    ['DEFEAT · oldest grounded source', OLDEST_SOURCE],
  ] as const;
  const survived: string[] = [];
  for (const [name, fn] of mutants) if (run(fn, name)) survived.push(name);
  console.log(`\n${'─'.repeat(72)}`);
  console.log(`REFERENCE LAW  ${reference ? '✅ all seven oracles coherent' : '⛔ construction failure'}`);
  console.log(`DEFEAT SET     ${survived.length === 0 ? '✅ all killed' : `⛔ survived: ${survived.join(', ')}`}`);
  process.exit(reference && survived.length === 0 ? 0 : 1);
}
