/**
 * O5-R3 RUNTIME BINDING — PRE-WRITE LEASE STANDING (additive law, 2026-10-01).
 *
 * Occasion: the live Mac Studio walk stopped at Step 5. The frozen walk expected C6
 * "no lease yet"; the real home carried a correctly released prior generation, and the
 * checker read that history as failure. The instrument, not the runtime, was wrong.
 *
 * LAW (founder): Historical lease state may exist. What matters before the first write is
 * that no live writer holds authority. After Desktop writes, the live lease must belong to
 * this exact Desktop incarnation.
 *
 * Every falsifier runs against a SUBJECT = { read(home), classify(history, binding, {probe}),
 * PRE, POST }. The real subject is scripts/witness/o5-r3-lease-standing.mjs.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '..');
const LEASE = await import(pathToFileURL(path.join(ROOT, 'scripts/builder/grant-writer-lease-v1.mjs')).href);
const V = LEASE.LEASE_VERSION;

// ── Fixtures ──────────────────────────────────────────────────────────────────
export const HOST = 'h-test';
export const DESKTOP = Object.freeze({ host: HOST, pid: 500, processStartTime: 's-500' });
export const held = (n, pid, start, nonce, host = HOST) => ({ n, record: { version: V, generation: n, owner_nonce: nonce, host, pid, process_start_time: start, acquired_at: '2026-10-01T02:03:42.939Z' } });
export const rel = (n, nonce, extra = {}) => ({ n, record: { version: V, generation: n, released: true, owner_nonce: nonce, released_at: '2026-10-01T02:04:36.639Z', ...extra } });
/** Mimics the real probe: a foreign host is never probed; otherwise answers from a pid table. */
export const probeFrom = (table) => (host, pid) => (host !== HOST ? { state: 'UNDETERMINABLE' } : (table[pid] ?? { state: 'GONE' }));
const ALIVE = (s) => ({ state: 'ALIVE', start_time: s });

const run = (S, history, binding = DESKTOP, table = {}) => S.classify(history, binding, { probe: probeFrom(table) });
function check(cases) {
  const failures = [];
  for (const [name, got, want] of cases) if (got !== want) failures.push(`${name}: got ${got}, want ${want}`);
  return { pass: failures.length === 0, failures };
}
const pre = (S, s) => S.PRE.includes(s);
const post = (S, s) => S.POST.includes(s);

export const PW_FALSIFIERS = {
  /** No history at all is the plain pre-write baseline, and never a post-write pass. */
  'PW-1 empty history': async (S) => {
    const r = run(S, []);
    return check([['standing', r.standing, 'NOT_YET_HELD'], ['pre-write acceptable', pre(S, r.standing), true], ['post-write acceptable', post(S, r.standing), false]]);
  },
  /** The walked shape: a prior incarnation held then released. A lawful pre-write baseline, whether or not that incarnation still runs. */
  'PW-2 released history is a lawful pre-write baseline': async (S) => {
    const h = [held(1, 300, 's-300', 'n1'), rel(2, 'n1')];
    const gone = run(S, h, DESKTOP, {});
    const stillRunning = run(S, h, DESKTOP, { 300: ALIVE('s-300') });
    return check([
      ['standing (prior holder gone)', gone.standing, 'NOT_YET_HELD_AFTER_RELEASE'], ['pre-write acceptable', pre(S, gone.standing), true],
      ['standing (prior holder still running, but released)', stillRunning.standing, 'NOT_YET_HELD_AFTER_RELEASE'],
      ['post-write acceptable', post(S, gone.standing), false], ['generation', gone.generation, 2],
    ]);
  },
  /** A live foreign holder blocks, including when an earlier generation was released: only the latest decides. */
  'PW-3 live foreign holder blocks, history notwithstanding': async (S) => {
    const a = run(S, [held(1, 300, 's-300', 'n1')], DESKTOP, { 300: ALIVE('s-300') });
    const b = run(S, [held(1, 300, 's-300', 'n1'), rel(2, 'n1'), held(3, 301, 's-301', 'n3')], DESKTOP, { 301: ALIVE('s-301') });
    return check([['standing', a.standing, 'HELD_BY_OTHER_LIVE'], ['pre-write acceptable', pre(S, a.standing), false],
      ['standing after earlier release', b.standing, 'HELD_BY_OTHER_LIVE'], ['pre-write acceptable after earlier release', pre(S, b.standing), false]]);
  },
  /** An unreleased generation whose holder died is not a baseline: the first write would be a takeover. */
  'PW-4 dead unreleased holder is not a baseline': async (S) => {
    const r = run(S, [held(1, 300, 's-300', 'n1')], DESKTOP, {});
    return check([['standing', r.standing, 'UNRELEASED_HOLDER_GONE'], ['pre-write acceptable', pre(S, r.standing), false], ['post-write acceptable', post(S, r.standing), false]]);
  },
  /** A reused pid is not the holder; and this Desktop's pid with another incarnation is not this Desktop. */
  'PW-5 pid reuse is judged by incarnation': async (S) => {
    const foreign = run(S, [held(1, 300, 's-300', 'n1')], DESKTOP, { 300: ALIVE('s-other') });
    const ownPid = run(S, [held(1, 500, 's-old', 'n1')], DESKTOP, { 500: ALIVE('s-500') });
    return check([['foreign pid reused', foreign.standing, 'UNRELEASED_HOLDER_GONE'], ['pre-write acceptable', pre(S, foreign.standing), false],
      ['this pid, older incarnation', ownPid.standing, 'UNRELEASED_HOLDER_GONE'], ['post-write acceptable', post(S, ownPid.standing), false]]);
  },
  /** Unreadable is not vacant; a release counts only as the release OF the generation before it. */
  'PW-6 malformed release or unreadable latest is never a baseline': async (S) => {
    const cases = {
      'no released_at': [held(1, 300, 's-300', 'n1'), rel(2, 'n1', { released_at: undefined })],
      'owner mismatch': [held(1, 300, 's-300', 'n1'), rel(2, 'someone-else')],
      'release with no predecessor': [rel(1, 'n1')],
      'gap before release': [held(1, 300, 's-300', 'n1'), rel(3, 'n1')],
      'generation field mismatch': [held(1, 300, 's-300', 'n1'), { n: 2, record: { ...rel(2, 'n1').record, generation: 7 } }],
      'latest unreadable': [held(1, 300, 's-300', 'n1'), rel(2, 'n1'), { n: 3, record: null }],
      'predecessor unreadable': [{ n: 1, record: null }, rel(2, 'n1')],
      'release of a release': [held(1, 300, 's-300', 'n1'), rel(2, 'n1'), rel(3, 'n1')],
    };
    const rows = [];
    for (const [name, h] of Object.entries(cases)) {
      const r = run(S, h);
      rows.push([`${name}: standing`, r.standing, 'MALFORMED'], [`${name}: pre-write acceptable`, pre(S, r.standing), false]);
    }
    return check(rows);
  },
  /** Only this exact incarnation satisfies post-write; it does NOT satisfy pre-write (a write already happened). */
  'PW-7 post-write is strict and disjoint from pre-write': async (S) => {
    const r = run(S, [held(1, 300, 's-300', 'n1'), rel(2, 'n1'), held(3, 500, 's-500', 'n3')], DESKTOP, { 500: ALIVE('s-500') });
    const overlap = S.PRE.filter((x) => S.POST.includes(x));
    return check([['standing', r.standing, 'HELD_BY_THIS_DESKTOP'], ['post-write acceptable', post(S, r.standing), true],
      ['pre-write acceptable', pre(S, r.standing), false], ['PRE ∩ POST', overlap.length, 0], ['POST', S.POST.join(','), 'HELD_BY_THIS_DESKTOP']]);
  },
  /** Another host's holder cannot be judged from here: UNDETERMINABLE, never "gone". */
  'PW-8 foreign-host holder is undeterminable': async (S) => {
    const r = run(S, [held(1, 300, 's-300', 'n1', 'h-other')], DESKTOP, {});
    return check([['standing', r.standing, 'UNDETERMINABLE'], ['pre-write acceptable', pre(S, r.standing), false]]);
  },
  /** The reader on real files: real acquire + release; and an unparseable latest file is carried, not dropped. */
  'PW-9 real reader on a real home': async (S) => {
    const home = fs.mkdtempSync(path.join(os.tmpdir(), 'o5r3-pw9-'));
    try {
      const a = LEASE.acquireGrantWriterLeaseV1(home);
      if (!a.ok) return { pass: false, failures: [`fixture acquire failed: ${a.reason}`] };
      const r1 = LEASE.releaseGrantWriterLeaseV1(home, a.lease);
      if (!r1.ok) return { pass: false, failures: [`fixture release failed: ${r1.reason}`] };
      const other = { host: os.hostname(), pid: 999999, processStartTime: 's-not-this' };
      const released = S.classify(S.read(home), other, {});
      fs.writeFileSync(path.join(home, LEASE.LEASE_DIR, 'g-000000000003.json'), '{"version":');
      const torn = S.classify(S.read(home), other, {});
      return check([['history length', S.read(home).length, 3], ['after real release', released.standing, 'NOT_YET_HELD_AFTER_RELEASE'], ['torn latest file', torn.standing, 'MALFORMED']]);
    } finally { fs.rmSync(home, { recursive: true, force: true }); }
  },
};
