/**
 * O5-R3 RUNTIME BINDING — C6A AUTHORIZED TRANSITION INTEGRITY (additive law RB-A2, 2026-10-01).
 *
 * Occasion: the admission statement claims "a single authorized acquisition"; frozen C8 proves
 * only byte-identity across the refused second writer. Founder ruling (option b): bring the
 * instrument up to the claim with a distinct check; C8 untouched.
 *
 * LAW — from the saved pre-write baseline to the post-write state:
 *   T1 exactly one new lease generation (the next one) · T2 held by this Desktop incarnation ·
 *   T3 prior lease history unchanged · T4 grant ledgers append-only · T5 prior ledger bytes unchanged ·
 *   T6 at most one Work Unit ledger changed · T7 no other governed artifact changed.
 * Scope: the governed roots only, never the whole home.
 *
 * SUBJECT = { capture(home), judge(beforeCapture, home, binding) }. Every fixture is a real home on disk.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '..');
const LEASE = await import(pathToFileURL(path.join(ROOT, 'scripts/builder/grant-writer-lease-v1.mjs')).href);
const V = LEASE.LEASE_VERSION;

export const DESKTOP = Object.freeze({ host: 'h-test', pid: 500, processStartTime: 's-500' });
const CAN = path.join('work-units-v2', 'execution-grants');
const HUM = 'execution-grants';
const genRel = (n) => path.join('grant-writer-lease', `g-${String(n).padStart(12, '0')}.json`);
const held = (n, pid, start, nonce, host = 'h-test') => ({ version: V, generation: n, owner_nonce: nonce, host, pid, process_start_time: start, acquired_at: '2026-10-01T02:03:42.939Z' });
const release = (n, nonce) => ({ version: V, generation: n, released: true, owner_nonce: nonce, released_at: '2026-10-01T02:04:36.639Z' });

/** The walked shape: released history (g1 held, g2 release), two ledgers, unrelated non-governed state. */
function world() {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'o5r3-ti-'));
  const put = (rel, data) => { fs.mkdirSync(path.dirname(path.join(home, rel)), { recursive: true }); fs.writeFileSync(path.join(home, rel), data); };
  put(genRel(1), JSON.stringify(held(1, 300, 's-300', 'n1')));
  put(genRel(2), JSON.stringify(release(2, 'n1')));
  put(path.join(CAN, 'wu-a.jsonl'), '{"event":"ISSUED","grant":{"grant_id":"g-a1"}}\n{"event":"CLAIMED","grant_id":"g-a1"}\n');
  put(path.join(HUM, 'wu-h.jsonl'), '{"event":"ISSUED","grant":{"grant_id":"g-h1"}}\n');
  put(path.join('work-units-v2', 'units', 'wu-a.json'), '{"state":"ROUTED"}\n');
  put('notes.txt', 'operator notes\n');
  const W = {
    home,
    put,
    append: (rel, s) => fs.appendFileSync(path.join(home, rel), s),
    gen: (n, rec) => put(genRel(n), JSON.stringify(rec)),
    rm: (rel) => fs.rmSync(path.join(home, rel)),
    acquire: () => W.gen(3, held(3, 500, 's-500', 'n3')),
    authorizedAppend: () => W.append(path.join(CAN, 'wu-a.jsonl'), '{"event":"ISSUED","grant":{"grant_id":"g-a2"}}\n'),
  };
  return W;
}

async function scenario(S, mutate, setup = () => {}) {
  const W = world();
  try {
    setup(W);
    const before = S.capture(W.home);
    mutate(W);
    return S.judge(before, W.home, DESKTOP);
  } finally { fs.rmSync(W.home, { recursive: true, force: true }); }
}
const rules = (r) => r.violations.map((x) => x.rule);
async function expectPass(S, name, mutate) {
  const r = await scenario(S, mutate);
  return r.ok ? [] : [`${name}: expected PASS, got ${r.violations.map((x) => `${x.rule} ${x.detail}`).join(' | ')}`];
}
async function expectRule(S, name, rule, mutate, setup) {
  const r = await scenario(S, mutate, setup);
  if (r.ok) return [`${name}: expected ${rule}, got PASS`];
  return rules(r).includes(rule) ? [] : [`${name}: expected ${rule}, got ${rules(r).join(',')}`];
}
const result = (failures) => ({ pass: failures.length === 0, failures });

export const TI_FALSIFIERS = {
  /** The lawful walk: one acquisition + one append (or one first ledger) passes. */
  'TI-1 a single authorized transition passes': async (S) => result([
    ...await expectPass(S, 'append to an existing ledger', (W) => { W.acquire(); W.authorizedAppend(); }),
    ...await expectPass(S, 'first ledger for a new Work Unit', (W) => { W.acquire(); W.put(path.join(CAN, 'wu-new.jsonl'), '{"event":"ISSUED"}\n'); }),
  ]),
  'TI-2 two lease generations added': async (S) => result(
    await expectRule(S, 'g3 and g4 both held by this Desktop', 'T1', (W) => { W.acquire(); W.gen(4, held(4, 500, 's-500', 'n4')); W.authorizedAppend(); })),
  'TI-3 historical lease bytes rewritten or removed': async (S) => result([
    ...await expectRule(S, 'g1 rewritten', 'T3', (W) => { W.gen(1, { ...held(1, 300, 's-300', 'n1'), acquired_at: '2026-10-01T09:00:00.000Z' }); W.acquire(); W.authorizedAppend(); }),
    ...await expectRule(S, 'g1 removed', 'T3', (W) => { W.rm(genRel(1)); W.acquire(); W.authorizedAppend(); }),
  ]),
  'TI-4 two Work Unit ledgers touched': async (S) => result([
    ...await expectRule(S, 'one per store (canonical + human)', 'T6', (W) => { W.acquire(); W.authorizedAppend(); W.append(path.join(HUM, 'wu-h.jsonl'), '{"event":"ISSUED"}\n'); }),
    ...await expectRule(S, 'an append plus a new ledger', 'T6', (W) => { W.acquire(); W.authorizedAppend(); W.put(path.join(CAN, 'wu-new.jsonl'), '{"event":"ISSUED"}\n'); }),
  ]),
  'TI-5 an existing grant entry mutated rather than appended': async (S) => result(
    await expectRule(S, 'line 1 rewritten in place, then appended', 'T5', (W) => {
      W.acquire();
      const f = path.join(W.home, CAN, 'wu-a.jsonl');
      fs.writeFileSync(f, fs.readFileSync(f, 'utf8').replace('g-a1"}}', 'g-ZZ"}}') + '{"event":"ISSUED","grant":{"grant_id":"g-a2"}}\n');
    })),
  'TI-6 the new generation is not held by this incarnation': async (S) => result([
    ...await expectRule(S, 'same pid, another incarnation', 'T2', (W) => { W.gen(3, held(3, 500, 's-other', 'n3')); W.authorizedAppend(); }),
    ...await expectRule(S, 'another host', 'T2', (W) => { W.gen(3, held(3, 500, 's-500', 'n3', 'h-other')); W.authorizedAppend(); }),
    ...await expectRule(S, 'a malformed generation with no owner nonce', 'T2', (W) => { const r = held(3, 500, 's-500', 'n3'); delete r.owner_nonce; W.gen(3, r); W.authorizedAppend(); }),
    ...await expectRule(S, 'a release record bearing this Desktop\'s identity', 'T2', (W) => { W.gen(3, { ...held(3, 500, 's-500', 'n3'), released: true }); W.authorizedAppend(); }),
  ]),
  'TI-7 an unrelated governed artifact changed': async (S) => result([
    ...await expectRule(S, 'append lock left behind', 'T7', (W) => { W.acquire(); W.authorizedAppend(); W.put(path.join(CAN, 'wu-a.lock'), ''); }),
    ...await expectRule(S, 'quarantine record appeared', 'T7', (W) => { W.acquire(); W.authorizedAppend(); W.put(path.join('grant-ledger-quarantine', 'canonical', 'wu-a.jsonl'), '{}\n'); }),
    ...await expectRule(S, 'lease temp file left behind', 'T7', (W) => { W.acquire(); W.authorizedAppend(); W.put(path.join('grant-writer-lease', '.g-000000000003.json.tmp-1'), '{}'); }),
  ]),
  'TI-8 a ledger shortened or removed': async (S) => result([
    ...await expectRule(S, 'truncated', 'T4', (W) => { W.acquire(); const f = path.join(W.home, CAN, 'wu-a.jsonl'); fs.truncateSync(f, 10); }),
    ...await expectRule(S, 'removed', 'T4', (W) => { W.acquire(); W.rm(path.join(HUM, 'wu-h.jsonl')); W.authorizedAppend(); }),
  ]),
  /** The transition must CONTAIN the acquisition: a baseline taken after the lease was already held is not pre-write. */
  'TI-9 no acquisition inside the transition': async (S) => result([
    ...await expectRule(S, 'baseline already held by this Desktop, append only', 'T1', (W) => { W.authorizedAppend(); }, (W) => { W.acquire(); }),
    ...await expectRule(S, 'released history, append only', 'T1', (W) => { W.authorizedAppend(); }),
  ]),
  'TI-10 a skipped generation number': async (S) => result(
    await expectRule(S, 'g4 without g3', 'T1', (W) => { W.gen(4, held(4, 500, 's-500', 'n4')); W.authorizedAppend(); })),
  /** Founder refinement: scope is the governed state, never the whole home. */
  'TI-11 non-governed state is out of scope': async (S) => result(
    await expectPass(S, 'unit record and operator notes changed', (W) => {
      W.acquire(); W.authorizedAppend();
      W.put(path.join('work-units-v2', 'units', 'wu-a.json'), '{"state":"RUNNING"}\n'); W.append('notes.txt', 'more\n');
    })),
};
