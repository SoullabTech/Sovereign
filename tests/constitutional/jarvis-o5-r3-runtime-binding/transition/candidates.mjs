/**
 * C6A AUTHORIZED TRANSITION INTEGRITY — the REAL subject and its DEFEAT CANDIDATES.
 * Each candidate replaces exactly ONE decision of the shipped judge with a plausible, wrong one, pinned as code.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { ROOT } from './falsifiers.mjs';

const TI = await import(pathToFileURL(path.join(ROOT, 'scripts/witness/o5-r3-transition-integrity.mjs')).href);

export const REAL = Object.freeze({ capture: TI.captureGoverned, judge: TI.judgeTransition });
const variant = (over) => {
  const D = Object.freeze({ ...TI.DECISIONS, ...over });
  return Object.freeze({ capture: D.capture, judge: TI.judgeTransitionWith(D) });
};
const sha = (b) => 'sha256:' + crypto.createHash('sha256').update(b).digest('hex');

/** Whole-home capture: the overbroad scope the founder's refinement forbids. */
function captureWholeHome(home) {
  const files = {};
  const walk = (abs) => { for (const e of fs.readdirSync(abs, { withFileTypes: true })) { const p = path.join(abs, e.name); if (e.isDirectory()) walk(p); else if (e.isFile()) { const b = fs.readFileSync(p); files[path.relative(home, p)] = { size: b.length, sha: sha(b) }; } } };
  walk(home);
  return { files };
}

export const TI_CANDIDATES = [
  {
    id: 'DC-TI1', named: 'TI-2 two lease generations added',
    collateral: { 'TI-10 a skipped generation number': 'irreducible: judging only the latest generation cannot see how many were added or skipped' },
    law: 'count-insensitive: only the latest generation is judged, however many appeared',
    subject: variant({ newGenerationLawful: (b, a) => { const added = a.filter((g) => !b.includes(g)); return added.length ? { ok: true, gen: Math.max(...added) } : { ok: false, detail: 'no new generation' }; } }),
  },
  {
    id: 'DC-TI2', named: 'TI-3 historical lease bytes rewritten or removed', collateral: {},
    law: 'history by name: an earlier generation that still exists is taken as unchanged',
    subject: variant({ historyUnchanged: (_b, now) => !!now }),
  },
  {
    id: 'DC-TI3', named: 'TI-4 two Work Unit ledgers touched', collateral: {},
    law: 'one per store: the limit is applied to each grant store separately',
    subject: variant({ changedLedgers: (grown, created) => {
      const by = {};
      for (const rel of [...grown, ...created]) (by[path.dirname(rel)] ??= []).push(rel);
      return Object.values(by).sort((x, y) => y.length - x.length)[0] ?? [];
    } }),
  },
  {
    id: 'DC-TI4', named: 'TI-5 an existing grant entry mutated rather than appended', collateral: {},
    law: 'size-only append check: a ledger that did not shrink is taken as appended',
    subject: variant({ appendOnly: (b, now) => (!now ? { ok: false, rule: 'T4', detail: 'ledger removed' }
      : now.length < b.size ? { ok: false, rule: 'T4', detail: 'ledger shortened' } : { ok: true, grew: now.length > b.size }) }),
  },
  {
    id: 'DC-TI5', named: 'TI-6 the new generation is not held by this incarnation', collateral: {},
    law: 'pid-only identity: the right pid on the right host is taken as this Desktop, whatever the incarnation',
    subject: variant({ heldByThisIncarnation: (r, gen, b) => !!r && r.released !== true && r.generation === gen && r.host === b.host && r.pid === b.pid }),
  },
  {
    id: 'DC-TI6', named: 'TI-7 an unrelated governed artifact changed', collateral: {},
    law: 'ledgers-and-lease only: quarantine, locks and temp files are not looked at',
    subject: variant({ otherUnchanged: () => true }),
  },
  {
    id: 'DC-TI7', named: 'TI-11 non-governed state is out of scope', collateral: {},
    law: 'whole-home scope: any change anywhere in the delegation home fails the transition',
    subject: variant({ capture: captureWholeHome }),
  },
  {
    id: 'DC-TI8', named: 'TI-8 a ledger shortened or removed', collateral: {},
    law: 'shrink tolerated: a shortened ledger is read as a compaction, not a rewrite',
    subject: variant({ appendOnly: (b, now) => {
      if (!now) return { ok: false, rule: 'T4', detail: 'ledger removed' };
      if (now.length < b.size) return { ok: true, grew: false };
      return TI.DECISIONS.appendOnly(b, now);
    } }),
  },
  {
    id: 'DC-TI9', named: 'TI-4 two Work Unit ledgers touched', collateral: {},
    law: 'new ledgers uncounted: only growth of an existing ledger counts as a change',
    subject: variant({ changedLedgers: (grown) => grown }),
  },
  {
    id: 'DC-TI10', named: 'TI-9 no acquisition inside the transition', collateral: {},
    law: 'acquisition optional: with no new generation, the latest existing generation stands in for it',
    subject: variant({ newGenerationLawful: (b, a) => (a.every((g) => b.includes(g)) && a.length ? { ok: true, gen: Math.max(...a) } : TI.DECISIONS.newGenerationLawful(b, a)) }),
  },
  {
    id: 'DC-TI11', named: 'TI-10 a skipped generation number', collateral: {},
    law: 'numbering unchecked: any single new generation is accepted, wherever it lands',
    subject: variant({ newGenerationLawful: (b, a) => { const added = a.filter((g) => !b.includes(g)); return added.length === 1 ? { ok: true, gen: added[0] } : { ok: false, detail: `${added.length} new` }; } }),
  },
  {
    id: 'DC-TI12', named: 'TI-1 a single authorized transition passes',
    collateral: { 'TI-11 non-governed state is out of scope': 'irreducible: its lawful scenario carries the one authorized append, which this reading forbids' },
    law: 'lease-only transition: "nothing else changed" read as forbidding the authorized ledger change itself',
    subject: variant({ maxChangedLedgers: 0 }),
  },
];
