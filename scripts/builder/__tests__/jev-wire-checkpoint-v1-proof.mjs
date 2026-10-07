#!/usr/bin/env node
/**
 * JARVIS-JEV-01 / JEV-INT-05 — external-checkpoint proof. Fake transports only; no network, credential or provider.
 * The response-shape gate is opened only inside temp copies. Env (matrix only):
 *   JEV_WIRE_EDITS / JEV_CK_EDITS   JSON arrays of [from,to] edits for the wire module / checkpoint module.
 */
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { existsSync, linkSync, mkdirSync, mkdtempSync, lstatSync, readdirSync, readFileSync, readlinkSync, renameSync, rmSync, statSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { makeVariant } from './jev-wire-variant-lib.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const wireEdits = process.env.JEV_WIRE_EDITS ? JSON.parse(process.env.JEV_WIRE_EDITS) : [];
const ckEdits = process.env.JEV_CK_EDITS ? JSON.parse(process.env.JEV_CK_EDITS) : [];
const WV = makeVariant(wireEdits, { witnessed: true });
const CV = makeVariant(ckEdits, { from: join(HERE, '..', 'jev-wire-checkpoint-v1.mjs') });
const W = await import(WV.url);
const CK = await import(CV.url);

let pass = 0; let fail = 0;
async function check(name, fn) {
  try { await fn(); pass += 1; console.log('PASS  ' + name); }
  catch (e) { fail += 1; console.log('FAIL  ' + name); console.log('      ' + String(e.message).split('\n')[0]); }
}
const scratch = () => mkdtempSync(join(tmpdir(), 'jev-ck-'));
const okResponse = (over = {}) => ({
  model: 'jev-1.13.0', usage: { input_tokens: 300, output_tokens: 5 },
  answers: { Q_RISK: { type: 'noul', noul: 0.25 } }, ...over,
});
function fake(handler = () => okResponse()) {
  const t = { calls: 0, send: async (b, o) => { t.calls += 1; return handler(b, o, t); } };
  return t;
}
/** Two stores on two separate directories. */
function stores(opts = {}) {
  const root = scratch();
  const ledgerDir = join(root, 'ledger'); const cpDir = join(root, 'anchor');
  mkdirSync(ledgerDir); mkdirSync(cpDir);
  const ledgerPath = join(ledgerDir, 'ledger.jsonl'); const cpPath = join(cpDir, 'anchor.json');
  const open = (o = {}) => CK.createCheckpointedLedger(W.createLedger(ledgerPath), cpPath, o);
  const pair = open(opts);
  return { root, ledgerDir, cpDir, ledgerPath, cpPath, open, pair };
}
const readCp = (p) => JSON.parse(readFileSync(p, 'utf8'));
const lastOf = (ledgerPath) => { const r = W.createLedger(ledgerPath).read(); return r[r.length - 1]; };
const run = (pair, id, transport, extra = {}) => W.runAttempt({ attemptId: id, ledger: pair, transport, ...extra });

await check('K1-lifecycle-reservation-and-outcomes-are-anchored-before-they-matter', async () => {
  const s = stores(); s.pair.initialize();
  let atSend;
  const t = fake(() => {
    const cp = readCp(s.cpPath); const last = lastOf(s.ledgerPath);
    atSend = { seq: cp.seq, head: cp.head, kind: last.kind, lastSeq: last.seq, lastHash: last.hash };
    return okResponse();
  });
  const r = await run(s.pair, 'F01', t);
  assert.equal(r.outcome, 'ok');
  assert.equal(atSend.kind, 'reserved');                       // the request left only after the checkpoint covered the reservation
  assert.equal(atSend.seq, atSend.lastSeq); assert.equal(atSend.head, atSend.lastHash);
  const end = lastOf(s.ledgerPath); const cp = readCp(s.cpPath);
  assert.equal(end.kind, 'settled'); assert.equal(cp.seq, end.seq); assert.equal(cp.head, end.hash);   // "ok" only after the outcome is anchored
  assert.equal(r.ledger_head, end.hash);
  // normal resumption: brand-new objects, same stores, next attempt proceeds; used attempt stays used
  const again = s.open();
  assert.equal((await run(again, 'F02', t)).outcome, 'ok');
  assert.equal((await run(s.open(), 'F01', t)).reason, 'ATTEMPT_ALREADY_USED');
  assert.equal(s.open().verify().consistent, true);
});

await check('K2-checkpoint-is-bound-to-this-initialization-and-experiment', () => {
  const s = stores(); s.pair.initialize();
  const cp = readCp(s.cpPath); const first = W.createLedger(s.ledgerPath).read()[0];
  assert.equal(cp.format, 'jev-wire-checkpoint/v1');
  assert.equal(cp.instance_id, first.hash);
  assert.equal(cp.experiment_id, 'JEV-INT-05-SYNTHETIC-Q_RISK-1');
  assert.equal(cp.table_hash, W.createLedger(s.ledgerPath).identity.table_hash);
  assert.equal(cp.fixture_list_hash, W.fixtureListHash());
  assert.equal(cp.schema_sha256, W.RESPONSE_SHAPE.schema_sha256);
  assert.deepEqual(cp.caps, { max_attempts: 31, ceiling_usd: 1, reserve_usd: 0.005 });
});

await check('K3-missing-checkpoint-never-resets-history-or-permissions', async () => {
  const s = stores(); s.pair.initialize();
  const t = fake();
  await run(s.pair, 'F01', t);
  rmSync(s.cpPath);
  const r = await run(s.open(), 'F02', t);
  assert.equal(r.sent, false); assert.equal(r.reason, 'PAIR_CHECKPOINT_MISSING'); assert.equal(t.calls, 1);
  assert.throws(() => s.open().establishCheckpoint(), /PAIR_CANNOT_ESTABLISH_OVER_HISTORY/);
  assert.equal(existsSync(s.cpPath), false);                      // nothing was recreated over recorded history
  assert.equal(W.createLedger(s.ledgerPath).state().used.has('F01'), true);
  // only a crash between the two stores of INITIALIZATION is establishable, and only over the lone init record
  const f = stores(); W.createLedger(f.ledgerPath).initialize();
  assert.throws(() => f.open().verify(), /PAIR_CHECKPOINT_MISSING/);
  f.open().establishCheckpoint();
  assert.equal(f.open().verify().consistent, true);
});

await check('K4-truncated-ledger-is-refused', async () => {
  const s = stores(); s.pair.initialize();
  const t = fake();
  await run(s.pair, 'F01', t); await run(s.open(), 'F02', t);
  const lines = readFileSync(s.ledgerPath, 'utf8').trimEnd().split('\n');
  writeFileSync(s.ledgerPath, lines.slice(0, 3).join('\n') + '\n');          // a valid prefix: init, reserved, observed
  const r = await run(s.open(), 'F03', t);
  assert.equal(r.sent, false); assert.equal(r.reason, 'PAIR_LEDGER_BEHIND'); assert.equal(t.calls, 2);
});

await check('K5-replaced-reinitialized-and-repeat-initialization-are-refused', async () => {
  const s = stores(); s.pair.initialize();
  const t = fake();
  await run(s.pair, 'F01', t);
  rmSync(s.ledgerPath);
  const r0 = await run(s.open(), 'F01', t);
  assert.equal(r0.reason, 'PAIR_LEDGER_MISSING'); assert.equal(t.calls, 1);
  W.createLedger(s.ledgerPath).initialize();                                  // somebody re-initializes the ledger alone
  const r1 = await run(s.open(), 'F01', t);
  assert.equal(r1.sent, false); assert.match(r1.reason, /PAIR_INSTANCE_MISMATCH|PAIR_LEDGER_BEHIND/); assert.equal(t.calls, 1);
  assert.throws(() => s.open().initialize(), /PAIR_ALREADY_INITIALIZED/);
  // replaced by a DIFFERENT initialization that has regrown to the same length: only identity/divergence can tell
  const g = stores(); g.pair.initialize();
  const tg = fake();
  await run(g.pair, 'F01', tg);
  rmSync(g.ledgerPath);
  const plain = W.createLedger(g.ledgerPath); plain.initialize();
  assert.equal((await W.runAttempt({ attemptId: 'F01', ledger: plain, transport: fake() })).outcome, 'ok');
  assert.equal(W.createLedger(g.ledgerPath).read().length, 4);
  const tg2 = fake();
  const rg = await run(g.open(), 'F02', tg2);
  assert.equal(rg.sent, false); assert.match(rg.reason, /PAIR_INSTANCE_MISMATCH|PAIR_LEDGER_DIVERGES/); assert.equal(tg2.calls, 0);
  const onlyCp = stores(); onlyCp.pair.initialize(); rmSync(onlyCp.ledgerPath);
  assert.throws(() => onlyCp.open().initialize(), /PAIR_ALREADY_INITIALIZED/);
  const onlyLedger = stores(); W.createLedger(onlyLedger.ledgerPath).initialize();
  assert.throws(() => onlyLedger.open().initialize(), /PAIR_ALREADY_INITIALIZED/);
  const twice = stores(); twice.pair.initialize();
  assert.throws(() => twice.open().initialize(), /PAIR_ALREADY_INITIALIZED/);
});

await check('K6-ledger-diverging-at-the-anchor-is-refused', async () => {
  const s = stores(); s.pair.initialize();
  const t = fake();
  await run(s.pair, 'F01', t);
  const recs = W.createLedger(s.ledgerPath).read(); const cp = readCp(s.cpPath);
  // same initialization, valid chain, but a different record where the anchor points
  const fork = recs.slice(0, cp.seq);
  const body = { kind: 'halted', reason: 'FORK', at: 1, seq: cp.seq, prev: fork[fork.length - 1].hash };
  fork.push({ ...body, hash: W.sha256Hex(W.canonicalJson(body)) });
  writeFileSync(s.ledgerPath, fork.map((r) => JSON.stringify(r)).join('\n') + '\n');
  const t2 = fake();
  const r = await run(s.open(), 'F02', t2);
  assert.equal(r.sent, false); assert.equal(r.reason, 'PAIR_LEDGER_DIVERGES'); assert.equal(t2.calls, 0);
});

await check('K7-corrupt-or-mismatched-checkpoint-is-refused', async () => {
  const s = stores(); s.pair.initialize();
  const t = fake();
  const original = readFileSync(s.cpPath, 'utf8');
  const tampered = JSON.parse(original); tampered.caps.max_attempts = 120;     // hash no longer matches
  writeFileSync(s.cpPath, JSON.stringify(tampered) + '\n');
  assert.equal((await run(s.open(), 'F01', t)).reason, 'PAIR_CHECKPOINT_CORRUPT');
  writeFileSync(s.cpPath, '{"format":');
  assert.equal((await run(s.open(), 'F01', t)).reason, 'PAIR_CHECKPOINT_CORRUPT');
  writeFileSync(s.cpPath, original);
  const other = CK.createCheckpointedLedger(W.createLedger(s.ledgerPath, { experiment_id: 'ANOTHER-EXPERIMENT' }), s.cpPath);
  assert.equal((await run(other, 'F01', t)).reason, 'PAIR_BINDING_MISMATCH');
  assert.equal(t.calls, 0);
  assert.equal((await run(s.open(), 'F01', t)).outcome, 'ok');                // untouched files still work
});

await check('K8-unavailable-checkpoint-storage-means-zero-sends', async () => {
  const a = stores(); a.pair.initialize();
  renameSync(a.cpDir, a.cpDir + '.unmounted');                                // the volume goes away
  const t = fake();
  const r = await run(a.open(), 'F01', t);
  assert.equal(r.sent, false); assert.equal(r.reason, 'PAIR_CHECKPOINT_UNAVAILABLE'); assert.equal(t.calls, 0);
  // the volume is lost AFTER the ledger write of the reservation: nothing leaves, the reservation is preserved
  const b = stores({ hooks: {} }); b.pair.initialize();
  const hooked = b.open({ hooks: { afterLedgerAppend: (k) => { if (k === 'reserved') renameSync(b.cpDir, b.cpDir + '.gone'); } } });
  const t2 = fake();
  const r2 = await run(hooked, 'F01', t2);
  assert.equal(r2.sent, false); assert.equal(r2.reason, 'PAIR_CHECKPOINT_UNAVAILABLE'); assert.equal(t2.calls, 0);
  renameSync(b.cpDir + '.gone', b.cpDir);                                     // volume returns
  assert.equal(b.open().verify().ahead, 1);                                   // ledger holds the reservation; anchor is behind
  assert.equal((await run(b.open(), 'F02', t2)).reason, 'PAIR_CHECKPOINT_BEHIND');
  b.open().resume();                                                          // deliberate act
  const r3 = await run(b.open(), 'F02', t2);
  assert.equal(r3.reason, 'UNRESOLVED_ATTEMPT'); assert.equal(t2.calls, 0);   // ambiguity kept; F01 is never re-sent
  assert.equal((await run(b.open(), 'F01', t2)).sent, false);
});

const CHILD = `
import { appendFileSync } from 'node:fs';
const [wireUrl, ckUrl, ledgerPath, cpPath, attemptId, point, marker] = process.argv.slice(1);
const W = await import(wireUrl); const CK = await import(ckUrl);
const hooks = {
  afterLedgerAppend: (k) => { if (point === 'ledger:' + k) process.exit(47); },
  afterCheckpoint: (k) => { if (point === 'cp:' + k) process.exit(47); },
};
const pair = CK.createCheckpointedLedger(W.createLedger(ledgerPath), cpPath, { hooks });
if (attemptId === 'INIT') { pair.initialize(); process.exit(0); }
const transport = { send: async () => { appendFileSync(marker, attemptId + '\\n'); return { model: 'jev-1.13.0', usage: { input_tokens: 9, output_tokens: 1 }, answers: { Q_RISK: { type: 'noul', noul: 0.4 } } }; } };
await W.runAttempt({ attemptId, ledger: pair, transport });
`;
const child = (args) => new Promise((resolve) => {
  const c = spawn(process.execPath, ['--input-type=module', '-e', CHILD, ...args]);
  c.stdout.on('data', () => {}); c.stderr.on('data', () => {});
  c.on('close', (status) => resolve({ status }));
});
/** A process lost inside the pair lock leaves it behind. That must be a refusal until a human inspects and removes it. */
async function inspectAndClearStaleLock(s) {
  const lock = s.ledgerPath + '.pair.lock';
  assert.equal(existsSync(lock), true, 'the crash left the pair lock behind');
  const t = fake();
  const r = await run(s.open(), 'F02', t);
  assert.equal(r.sent, false); assert.equal(r.reason, 'PAIR_LOCK_HELD'); assert.equal(t.calls, 0);
  assert.equal(existsSync(lock), true, 'the lock was not deleted automatically');
  rmSync(lock);                                                              // the deliberate, human act
}
const sentCount = (marker) => (existsSync(marker) ? readFileSync(marker, 'utf8').trim().split('\n').filter(Boolean).length : 0);

await check('K9-process-loss-between-the-two-stores-is-never-reconciled-silently', async () => {
  const cases = [
    // [exit point, expected status after restart, expected reason for next attempt, sends during child]
    ['ledger:reserved', 1, 'PAIR_CHECKPOINT_BEHIND', 0, 'UNRESOLVED_ATTEMPT'],
    ['cp:reserved', 0, 'UNRESOLVED_ATTEMPT', 0, 'UNRESOLVED_ATTEMPT'],
    ['ledger:observed', 1, 'PAIR_CHECKPOINT_BEHIND', 1, 'UNRESOLVED_ATTEMPT'],
    ['cp:observed', 0, 'UNRESOLVED_ATTEMPT', 1, 'UNRESOLVED_ATTEMPT'],
    ['ledger:settled', 1, 'PAIR_CHECKPOINT_BEHIND', 1, null],              // a clean success: resumable after the explicit act
  ];
  for (const [point, ahead, reason, childSends, afterResume] of cases) {
    const s = stores(); s.pair.initialize(); const marker = join(s.root, 'sent.txt');
    const c = await child([WV.url, CV.url, s.ledgerPath, s.cpPath, 'F01', point, marker]);
    assert.equal(c.status, 47, point);
    assert.equal(sentCount(marker), childSends, point + ': sends before the loss');
    await inspectAndClearStaleLock(s);
    assert.equal(s.open().verify().ahead, ahead, point + ': ahead');
    const t = fake();
    const r = await run(s.open(), 'F02', t);
    assert.equal(r.sent, false, point); assert.equal(r.reason, reason, point); assert.equal(t.calls, 0, point);
    if (ahead > 0) {
      assert.equal(s.open().resume().advanced, true, point);
      assert.equal(s.open().verify().consistent, true, point);
    }
    const r2 = await run(s.open(), 'F02', t);
    if (afterResume) { assert.equal(r2.sent, false, point); assert.equal(r2.reason, afterResume, point); assert.equal(t.calls, 0, point); }
    else { assert.equal(r2.outcome, 'ok', point); assert.equal(t.calls, 1, point); }
    assert.equal((await run(s.open(), 'F01', t)).sent, false, point + ': F01 is never re-sent');
  }
  // crash between the two stores of initialization
  const f = stores(); const marker = join(f.root, 'm');
  assert.equal((await child([WV.url, CV.url, f.ledgerPath, f.cpPath, 'INIT', 'ledger:init', marker])).status, 47);
  await inspectAndClearStaleLock(f);
  assert.throws(() => f.open().verify(), /PAIR_CHECKPOINT_MISSING/);
  assert.throws(() => f.open().initialize(), /PAIR_ALREADY_INITIALIZED/);
  f.open().establishCheckpoint();
  assert.equal(f.open().verify().consistent, true);
});

await check('K10-resume-is-explicit-idempotent-and-refuses-over-inconsistency', async () => {
  const s = stores(); s.pair.initialize();
  assert.deepEqual(s.open().resume(), { advanced: false, seq: 0 });
  const marker = join(s.root, 'm');
  await child([WV.url, CV.url, s.ledgerPath, s.cpPath, 'F01', 'ledger:reserved', marker]);
  await inspectAndClearStaleLock(s);
  assert.equal(s.open().resume().advanced, true);
  assert.equal(s.open().resume().advanced, false);
  rmSync(s.ledgerPath);
  assert.throws(() => s.open().resume(), /PAIR_LEDGER_MISSING/);
});

await check('K11-stale-locks-are-refusals-never-deleted-never-bypassed', async () => {
  const s = stores(); s.pair.initialize();
  const pairLock = s.ledgerPath + '.pair.lock'; const baseLock = s.ledgerPath + '.lock';
  const t = fake();
  writeFileSync(pairLock, '99999');
  assert.equal((await run(s.open(), 'F01', t)).reason, 'PAIR_LOCK_HELD');
  assert.equal(existsSync(pairLock), true); assert.equal(t.calls, 0);
  rmSync(pairLock);
  writeFileSync(baseLock, '99999');
  const r = await run(s.open(), 'F01', t);
  assert.equal(r.sent, false); assert.equal(r.reason, 'LOCK_HELD');
  assert.equal(existsSync(baseLock), true); assert.equal(t.calls, 0);
  rmSync(baseLock);
  assert.equal((await run(s.open(), 'F01', t)).outcome, 'ok');                // an inspected, removed lock → normal resumption
});

await check('K12-checkpoint-failure-after-the-outcome-write-is-not-completion', async () => {
  const s = stores(); s.pair.initialize();
  const hooked = s.open({ hooks: { afterLedgerAppend: (k) => { if (k === 'observed') renameSync(s.cpDir, s.cpDir + '.gone'); } } });
  const t = fake();
  const r = await run(hooked, 'F01', t);
  assert.notEqual(r.outcome, 'ok'); assert.equal(r.outcome, 'observation_persisted_checkpoint_failed'); assert.equal(r.observation, undefined);
  assert.equal(W.createLedger(s.ledgerPath).read().some((x) => x.kind === 'observed'), true);   // the evidence is on disk, not lost
  const t2 = fake();
  assert.equal((await run(s.open(), 'F02', t2)).sent, false);                                   // volume still away
  renameSync(s.cpDir + '.gone', s.cpDir);
  assert.equal((await run(s.open(), 'F02', t2)).reason, 'PAIR_CHECKPOINT_BEHIND');
  assert.equal(t2.calls, 0);
});

await check('K13-static-no-network-no-credential-no-lock-deletion-but-its-own', () => {
  const src = readFileSync(CV.file, 'utf8');
  const imports = [...src.matchAll(/^import .* from '([^']+)';/gm)].map((m) => m[1]);
  for (const spec of imports) assert.ok(/^node:(fs|path)$/.test(spec) || /jev-wire-v1\.mjs$/.test(spec), 'unexpected import ' + spec);
  const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  for (const banned of ['fetch(', 'node:http', 'node:https', 'node:net', 'process.env', 'apiKey', 'api_key', 'Authorization', 'admitJevResponse']) {
    assert.equal(code.includes(banned), false, 'banned token ' + banned);
  }
  assert.equal((code.match(/unlinkSync\(/g) || []).length, 1, 'only the pair lock may be unlinked, and only by its holder');
  assert.ok(code.includes('unlinkSync(pairLockPath)'));
});

// ── Mac review 352b840c: C1 persistence classification · C2 colliding storage paths ───────────────────────────

await check('K14-persistence-is-established-by-the-ledger-not-by-the-error-name', async () => {
  const scenarios = {
    'checkpoint missing at response time': (s) => rmSync(s.cpPath),
    'checkpoint volume unavailable at response time': (s) => renameSync(s.cpDir, s.cpDir + '.away'),
    'pair lock held at response time': (s) => writeFileSync(s.ledgerPath + '.pair.lock', '99999'),
  };
  for (const [label, disturb] of Object.entries(scenarios)) {
    const s = stores(); s.pair.initialize();
    const r = await run(s.pair, 'F01', fake(() => { disturb(s); return okResponse(); }));
    assert.equal(r.sent, true, label); assert.notEqual(r.outcome, 'ok', label);
    assert.equal(r.outcome, 'observation_not_persisted', `${label}: must not claim the answer is stored`);
    assert.equal(r.observation, undefined, label);
    const kinds = W.createLedger(s.ledgerPath).read().map((x) => x.kind);
    assert.deepEqual(kinds, ['init', 'reserved'], `${label}: ledger holds no observation`);
  }
  // counterpart: written, then anchoring fails → persisted-but-unanchored (K12 pins the same boundary)
  const p = stores(); p.pair.initialize();
  const hooked = p.open({ hooks: { afterLedgerAppend: (k) => { if (k === 'observed') renameSync(p.cpDir, p.cpDir + '.gone'); } } });
  assert.equal((await run(hooked, 'F01', fake())).outcome, 'observation_persisted_checkpoint_failed');
  // the ledger itself cannot be read to settle the question → say so, never guess
  const u = stores(); u.pair.initialize();
  const blind = { ...u.pair, append: (rec) => { if (rec.kind === 'observed') throw new Error('PAIR_CHECKPOINT_UNAVAILABLE'); return u.pair.append(rec); },
    read: () => { throw new Error('LEDGER_CORRUPT'); } };
  assert.equal((await run(blind, 'F01', fake())).outcome, 'observation_persistence_unverified');
});

await check('K15-colliding-storage-paths-are-rejected-before-any-mutation', async () => {
  const mk = () => { const root = scratch(); mkdirSync(join(root, 'a')); mkdirSync(join(root, 'b')); return root; };
  const build = (l, c) => () => CK.createCheckpointedLedger(W.createLedger(l), c);
  const snapshot = (root) => JSON.stringify([readdirSync(root).sort(), readdirSync(join(root, 'a')).sort(), readdirSync(join(root, 'b')).sort()]);
  const cases = (root) => ({
    'identical paths': [join(root, 'a', 'x'), join(root, 'a', 'x')],
    'ledger equals checkpoint temp path': [join(root, 'a', 'x.tmp'), join(root, 'a', 'x')],
    'checkpoint equals ledger lock': [join(root, 'a', 'x'), join(root, 'a', 'x.lock')],
    'checkpoint equals pair lock': [join(root, 'a', 'x'), join(root, 'a', 'x.pair.lock')],
    'checkpoint temp equals ledger lock': [join(root, 'a', 'x.lock'), join(root, 'a', 'x.lock.tmp').replace(/\.tmp$/, '')],
    'dot-segment alias of the same file': [join(root, 'a', 'x'), join(root, 'a', 'b', '..', 'x')],
  });
  for (const [label, [l, c]] of Object.entries(cases(mk()))) {
    const root = dirname(dirname(l)); mkdirSync(join(dirname(l), 'b'), { recursive: true });
    const before = snapshot(root);
    assert.throws(build(l, c), /PAIR_PATH_COLLISION/, label);
    assert.equal(snapshot(root), before, label + ': nothing created or changed');
  }
  // symlinked directory resolving to the ledger's directory
  { const root = mk(); symlinkSync(join(root, 'a'), join(root, 'b', 'link'), 'dir');
    assert.throws(build(join(root, 'a', 'x'), join(root, 'b', 'link', 'x')), /PAIR_PATH_COLLISION/, 'symlinked directory'); }
  // existing files that are the same inode (hard link, file symlink)
  { const root = mk(); const l = join(root, 'a', 'x'); writeFileSync(l, 'ledger');
    linkSync(l, join(root, 'b', 'h')); assert.throws(build(l, join(root, 'b', 'h')), /PAIR_PATH_COLLISION/, 'hard link');
    symlinkSync(l, join(root, 'b', 's')); assert.throws(build(l, join(root, 'b', 's')), /PAIR_PATH_COLLISION/, 'file symlink');
    assert.equal(readFileSync(l, 'utf8'), 'ledger'); }
  // initialize() on a collision never reports success or touches the ledger path
  { const root = mk(); const p = join(root, 'a', 'x'); let threw = false;
    try { CK.createCheckpointedLedger(W.createLedger(p), p).initialize(); } catch { threw = true; }
    assert.equal(threw, true); assert.equal(existsSync(p), false); }
  // valid layouts are untouched: separate volumes' directories, and the same directory with distinct names
  { const root = mk(); const ok1 = CK.createCheckpointedLedger(W.createLedger(join(root, 'a', 'l.jsonl')), join(root, 'b', 'anchor.json'));
    ok1.initialize(); assert.equal(ok1.verify().consistent, true);
    const ok2 = CK.createCheckpointedLedger(W.createLedger(join(root, 'a', 'l2.jsonl')), join(root, 'a', 'anchor2.json'));
    ok2.initialize(); assert.equal(ok2.verify().consistent, true); }
});

// ── Mac review 04e3a2db: dangling symbolic links are inspected as objects ─────────────────────────────────

/** Everything observable about a tree: names, kinds, regular-file bytes, link targets. */
function treeState(root) {
  const out = [];
  const walk = (dir) => {
    for (const name of readdirSync(dir).sort()) {
      const full = join(dir, name); const st = lstatSync(full);
      if (st.isSymbolicLink()) out.push([full.slice(root.length), 'link', readlinkSync(full)]);
      else if (st.isDirectory()) { out.push([full.slice(root.length), 'dir']); walk(full); }
      else out.push([full.slice(root.length), 'file', readFileSync(full, 'utf8')]);
    }
  };
  walk(root);
  return JSON.stringify(out);
}

await check('K16-dangling-symlinks-are-refused-before-any-lock-or-store-mutation', async () => {
  const layout = () => { const root = scratch(); mkdirSync(join(root, 'a')); mkdirSync(join(root, 'b'));
    return { root, L: join(root, 'a', 'ledger.jsonl'), C: join(root, 'b', 'anchor.json') }; };
  const refuse = (label, { root, L, C }) => {
    const before = treeState(root);
    let init = false;
    assert.throws(() => { const pair = CK.createCheckpointedLedger(W.createLedger(L), C); init = true; pair.initialize(); }, /PAIR_PATH_COLLISION/, label);
    assert.equal(init, false, label + ': refused at construction, before any operation');
    assert.equal(treeState(root), before, label + ': bytes, entries and link targets unchanged');
  };
  { const x = layout(); symlinkSync(x.L, x.C + '.tmp'); refuse('checkpoint temp -> not-yet-created ledger', x); }
  { const x = layout(); symlinkSync(x.C + '.tmp', x.L); refuse('ledger -> not-yet-created checkpoint temp', x); }
  // neighbours of the same family: links where only plain files may exist, and dangling store links
  { const x = layout(); symlinkSync(join(x.root, 'nowhere'), x.L + '.pair.lock'); refuse('pair lock is a link', x); }
  { const x = layout(); symlinkSync(join(x.root, 'nowhere'), x.L + '.lock'); refuse('ledger lock is a link', x); }
  { const x = layout(); symlinkSync(join(x.root, 'nowhere'), x.C); refuse('checkpoint is a dangling link', x); }
  { const x = layout(); symlinkSync(join(x.root, 'nowhere'), x.L); refuse('ledger is a dangling link', x); }
  { const x = layout(); writeFileSync(join(x.root, 'sentinel'), 'keep me'); symlinkSync(join(x.root, 'sentinel'), x.C + '.tmp'); refuse('checkpoint temp -> unrelated existing file', x); }
  { const x = layout(); symlinkSync(x.C, x.L); writeFileSync(x.C, 'x'); refuse('ledger -> existing checkpoint', x); }
  // the non-clobbering guarantee also holds if a link appears AFTER the preflight (between ledger write and anchor write)
  { const x = layout(); const sentinel = join(x.root, 'sentinel'); writeFileSync(sentinel, 'keep me');
    const racy = CK.createCheckpointedLedger(W.createLedger(x.L), x.C, { hooks: { afterLedgerAppend: (k) => { if (k === 'init') symlinkSync(sentinel, x.C + '.tmp'); } } });
    assert.throws(() => racy.initialize(), /PAIR_CHECKPOINT_UNAVAILABLE/);
    assert.equal(readFileSync(sentinel, 'utf8'), 'keep me', 'the write did not follow the link'); }
  // controls: plain stale temp file and the two valid layouts are unaffected
  { const x = layout(); writeFileSync(x.C + '.tmp', 'stale'); const ok = CK.createCheckpointedLedger(W.createLedger(x.L), x.C);
    ok.initialize(); assert.equal(ok.verify().consistent, true); }
});

console.log(`\n${pass} passed · ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
