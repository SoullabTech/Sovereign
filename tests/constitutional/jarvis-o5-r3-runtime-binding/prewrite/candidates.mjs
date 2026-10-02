/**
 * PRE-WRITE LEASE STANDING — the REAL subject and its DEFEAT CANDIDATES.
 * Each candidate replaces exactly one decision with a plausible, wrong one, pinned as code.
 */
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { ROOT } from './falsifiers.mjs';

const ST = await import(pathToFileURL(path.join(ROOT, 'scripts/witness/o5-r3-lease-standing.mjs')).href);

export const REAL = Object.freeze({
  read: ST.readLeaseHistory, classify: ST.classifyLeaseStanding,
  PRE: ST.PRE_WRITE_ACCEPTABLE, POST: ST.POST_WRITE_ACCEPTABLE,
});
const with_ = (over) => Object.freeze({ ...REAL, ...over });
const latestHeld = (h) => { const r = h[h.length - 1]?.record; return r && r.released !== true ? r : null; };

export const PW_CANDIDATES = [
  {
    id: 'DC-PW1', named: 'PW-2 released history is a lawful pre-write baseline', collateral: {},
    law: 'the walked checker: only an EMPTY home is a pre-write baseline, so the witness depends on the home never having been used',
    subject: with_({ PRE: Object.freeze(['NOT_YET_HELD']) }),
  },
  {
    id: 'DC-PW2', named: 'PW-3 live foreign holder blocks, history notwithstanding',
    collateral: {
      'PW-6 malformed release or unreadable latest is never a baseline': 'irreducible: judging only up to the last release hides every later generation, a torn one included',
      'PW-7 post-write is strict and disjoint from pre-write': 'irreducible: the same rule hides this Desktop\'s own later generation',
      'PW-9 real reader on a real home': 'irreducible: the torn generation 3 lies after the real release, so the rule hides it',
    },
    law: 'any release in history vouches for vacancy: history is judged up to its last release, ignoring later generations',
    subject: with_({ classify: (h, b, o) => { const i = h.map((g) => g.record?.released === true).lastIndexOf(true); return REAL.classify(i >= 0 ? h.slice(0, i + 1) : h, b, o); } }),
  },
  {
    id: 'DC-PW3', named: 'PW-5 pid reuse is judged by incarnation', collateral: {},
    law: 'pid-only liveness: a live pid is the holder, and the binding pid is this Desktop, whatever the incarnation',
    subject: with_({ classify: (h, b, o = {}) => {
      const r = latestHeld(h);
      if (!r) return REAL.classify(h, b, o);
      const probe = (host, pid) => { const p = o.probe(host, pid); return p.state === 'ALIVE' ? { ...p, start_time: r.process_start_time } : p; };
      const binding = r.pid === b.pid ? { ...b, processStartTime: r.process_start_time } : b;
      return REAL.classify(h, binding, { probe });
    } }),
  },
  {
    id: 'DC-PW4', named: 'PW-4 dead unreleased holder is not a baseline', collateral: {},
    law: 'a dead holder is as good as released: an unreleased generation whose pid is gone reads as vacancy',
    subject: with_({ classify: (h, b, o) => { const r = REAL.classify(h, b, o); return r.standing === 'UNRELEASED_HOLDER_GONE' && !/PID_REUSED/.test(r.detail) ? { ...r, standing: 'NOT_YET_HELD_AFTER_RELEASE' } : r; } }),
  },
  {
    id: 'DC-PW5', named: 'PW-6 malformed release or unreadable latest is never a baseline', collateral: {},
    law: 'lenient release: released === true is enough, whatever it releases and whenever',
    subject: with_({ classify: (h, b, o) => { const last = h[h.length - 1]; return last?.record?.released === true ? { standing: 'NOT_YET_HELD_AFTER_RELEASE', generation: last.n, detail: 'released' } : REAL.classify(h, b, o); } }),
  },
  {
    id: 'DC-PW6', named: 'PW-6 malformed release or unreadable latest is never a baseline',
    collateral: { 'PW-9 real reader on a real home': 'irreducible: PW-9 tears the latest file on disk, which this rule must read as vacant' },
    law: 'unreadable means vacant: a latest generation that cannot be parsed reads as no lease',
    subject: with_({ classify: (h, b, o) => (h.length && !h[h.length - 1].record ? { standing: 'NOT_YET_HELD', generation: 0, detail: 'unreadable read as empty' } : REAL.classify(h, b, o)) }),
  },
  {
    id: 'DC-PW7', named: 'PW-7 post-write is strict and disjoint from pre-write',
    collateral: {
      'PW-1 empty history': 'irreducible: PW-1 asserts the empty baseline is not a post-write pass, which is exactly what this candidate grants',
      'PW-2 released history is a lawful pre-write baseline': 'irreducible: the same, for the released baseline',
    },
    law: 'admission accepts any non-blocking standing: a never-written baseline passes the post-write C6',
    subject: with_({ POST: Object.freeze(['HELD_BY_THIS_DESKTOP', 'NOT_YET_HELD', 'NOT_YET_HELD_AFTER_RELEASE']) }),
  },
  {
    id: 'DC-PW8', named: 'PW-8 foreign-host holder is undeterminable', collateral: {},
    law: 'host ignored: a holder recorded on another host is probed by pid here, and a local miss reads as dead',
    subject: with_({ classify: (h, b, o = {}) => {
      const r = latestHeld(h);
      if (!r) return REAL.classify(h, b, o);
      return REAL.classify(h, { ...b, host: r.host }, { probe: (_host, pid) => o.probe(b.host, pid) });
    } }),
  },
  {
    id: 'DC-PW10', named: 'PW-1 empty history', collateral: {},
    law: 'absence is unknown: a home with no lease directory is not yet judgeable, so a never-used home blocks its first writer',
    subject: with_({ classify: (h, b, o) => (h.length ? REAL.classify(h, b, o) : { standing: 'UNDETERMINABLE', generation: 0, detail: 'no history' }) }),
  },
  {
    id: 'DC-PW9', named: 'PW-9 real reader on a real home', collateral: {},
    law: 'the reader drops unparseable generation files, so a torn latest generation silently disappears',
    subject: with_({ read: (home) => REAL.read(home).filter((g) => g.record !== null) }),
  },
];
