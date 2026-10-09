#!/usr/bin/env node
/**
 * JEV-INT-05 — id-independent behavioural differential for the live-run wrapper.
 *
 * PURPOSE. Two independent repairs of the same four Mac findings (LW1–LW4) exist as different wrapper sources, with different refusal ids,
 * different exports and different proof suites. A proof written against one cannot judge the other. This instrument asserts OBSERVABLE
 * BEHAVIOUR only (was a request sent, was a store created, what did the summary say), so any wrapper source can be run through it.
 *
 * CLASSES. SAFETY (a request could leave, or an unrecorded one could, when it must not) and REPORT (the summary contradicts itself) decide
 * the exit code. STRICTNESS (a defence beyond the finding) and DIAGNOSTIC (reason clarity) are reported, never failing.
 *
 * CONTAINMENT. Loopback mock + dummy credential only. Remote-grant scenarios pass NO credential and are refused before any store or network
 * exists; the instrument aborts if a credential would ever accompany a non-loopback endpoint. The committed off-switch is never edited:
 * the switch is opened only inside temporary copies, exactly as the proof suites do.
 *
 * USAGE   node jev-wire-live-run-v1-differential.mjs [--label NAME] [--wrapper PATH] [--json OUT]
 *         (default wrapper: the one beside this file; to judge another branch:  git show <commit>:scripts/builder/jev-wire-live-run-v1.mjs > /tmp/w.mjs)
 * ENV     JEV_TEST_SECOND_DEVICE_ROOT | JEV_LR_SECOND_DEVICE_ROOT — a MOUNT POINT on a different device than the temp directory (default /dev/shm).
 * EXIT    0 no SAFETY/REPORT failure · 1 at least one · 2 NOT RUN (no verified second device) — never green when it did not run.
 */
import http from 'node:http';
import { existsSync, mkdirSync, mkdtempSync, renameSync, copyFileSync, symlinkSync, rmSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { makeVariant } from './jev-wire-variant-lib.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const opt = (name, dflt) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : dflt; };
const label = opt('--label', 'working-tree');
const wrapperPath = resolve(opt('--wrapper', join(HERE, '..', 'jev-wire-live-run-v1.mjs')));
const jsonOut = opt('--json', null);
const SECOND = process.env.JEV_TEST_SECOND_DEVICE_ROOT || process.env.JEV_LR_SECOND_DEVICE_ROOT || '/dev/shm';
const haveSecond = (() => { try { const st = statSync(SECOND); return st.isDirectory() && st.dev !== statSync(dirname(SECOND)).dev && st.dev !== statSync(tmpdir()).dev; } catch { return false; } })();
if (!haveSecond) {
  console.log(`NOT RUN: "${SECOND}" is not a mount point on a second device. Set JEV_TEST_SECOND_DEVICE_ROOT (e.g. a mounted external volume).`);
  process.exit(2);
}

const WV = makeVariant([], { witnessed: true });
const LR = makeVariant([], { from: wrapperPath, importMap: { './jev-wire-v1.mjs': WV.url } });
const W = await import(WV.url); const R = await import(LR.url);
const REPLY = { model: 'jev-1.13.0', usage: { input_tokens: 300, output_tokens: 5 }, answers: { Q_RISK: { type: 'noul', noul: 0.25 } } };
const DUMMY = 'dummy-credential-DO-NOT-USE-0123456789';
const REMOTE = 'https://api.typesafe.ai/v1/systemone';
const iso = (ms) => new Date(ms).toISOString();

async function startMock() {
  const m = { requests: 0, onRequest: null };
  const server = http.createServer((req, res) => { const c = []; req.on('data', (x) => c.push(x));
    req.on('end', () => { m.requests += 1; m.onRequest?.(); res.writeHead(200, { 'content-type': 'application/json' }); res.end(JSON.stringify(REPLY)); }); });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  m.url = `http://127.0.0.1:${server.address().port}/v1/systemone`;
  m.close = () => new Promise((r) => { server.closeAllConnections(); server.close(r); });
  return m;
}
function layout(distinct) {
  const root = mkdtempSync(join(tmpdir(), 'jev-diff-')); mkdirSync(join(root, 'ledger'));
  const cpRoot = distinct ? mkdtempSync(join(SECOND, 'jev-diff-')) : root; const cpDir = join(cpRoot, 'anchor'); mkdirSync(cpDir);
  return { root, cpRoot, ledgerPath: join(root, 'ledger', 'ledger.jsonl'), checkpointPath: join(cpDir, 'anchor.json'), mount: distinct ? SECOND : undefined };
}
const grant = (url, over = {}) => ({ instrument: 'jev-int05-execution-grant/v1', state: 'AUTHORIZED', experiment_id: 'JEV-INT-05-DIFF-RUN', provider_id: 'typesafe-jev',
  model: 'jev-1.13.0', endpoint: url, network: 'LOOPBACK_ONLY', table_hash: W.questionTableHash(), fixture_list_hash: W.fixtureListHash(),
  schema_sha256: W.RESPONSE_SHAPE.schema_sha256, max_attempts: 3, ceiling_usd: 1, not_before: iso(Date.now() - 3600_000), expires_at: iso(Date.now() + 3600_000),
  volume_policy: 'DISTINCT_DEVICES', operator: 'differential', authorized_by: 'differential', authorization_ref: 'DIFFERENTIAL-ONLY', ...over });
const cfg = (l, g, over = {}) => ({ grant: g, confirmGrantHash: R.grantHash(g), ledgerPath: l.ledgerPath, checkpointPath: l.checkpointPath, checkpointMountPoint: l.mount, mode: 'initialize', ...over });
const cleanup = (l) => { try { rmSync(l.root, { recursive: true, force: true }); if (l.cpRoot !== l.root) rmSync(l.cpRoot, { recursive: true, force: true }); } catch { /* scratch */ } };
const kinds = (l, g) => { try { return W.createLedger(l.ledgerPath, { experiment_id: g.experiment_id }).read().map((r) => r.kind).join(','); } catch { return '(unreadable)'; } };
// containment: a credential may only ever accompany a loopback endpoint
const run = async (l, g, deps = {}) => {
  if (deps.credential !== undefined && !/^http:\/\/127\.0\.0\.1:/.test(g.endpoint)) throw new Error('DIFFERENTIAL_CONTAINMENT: credential with a non-loopback endpoint');
  try { return { out: await R.executeLiveRun(cfg(l, g, deps.config), deps), threw: null }; } catch (e) { return { out: null, threw: String(e && e.message) }; }
};
const view = (r, m) => r.threw ? { threw: r.threw } : { ran: r.out.ran, refusal: r.out.refusal ?? null, stopped: r.out.stopped_reason ?? null, completed: r.out.completed ?? null,
  attempts: (r.out.attempts || []).map((a) => `${a.id}:${a.outcome}`).join('|') || '-', http_requests: m ? m.requests : 0, ledger_head: r.out.ledger_head ?? null, usd: r.out.usd ?? null, halted: r.out.halted ?? null };

const rows = [];
const record = (id, cls, title, observed, pass) => rows.push({ id, class: cls, title, pass: !!pass, observed });

// ── LW1: a real-provider grant never accepts an injected stand-in (no credential: refusal precedes any store or network) ──
{
  let built = 0; const factory = () => { built += 1; return { send: async () => REPLY }; };
  const g = grant(REMOTE, { network: 'EXTERNAL_PINNED', max_attempts: 1 });
  { const l = layout(true); const r = await run(l, g, { createTransport: factory });
    record('D1', 'SAFETY', 'remote grant + injected transport factory is refused before anything is built or stored',
      { refusal: r.out?.refusal ?? null, ran: r.out?.ran, factory_built: built, ledger_created: existsSync(l.ledgerPath) }, r.out && r.out.ran === false && built === 0 && !existsSync(l.ledgerPath)); cleanup(l); }
  { const l = layout(true); const r = await run(l, g, Object.create({ createTransport: factory }));
    record('D2', 'SAFETY', 'remote grant + factory inherited through the prototype is refused too',
      { refusal: r.out?.refusal ?? null, ran: r.out?.ran, factory_built: built, ledger_created: existsSync(l.ledgerPath) }, r.out && r.out.ran === false && built === 0 && !existsSync(l.ledgerPath)); cleanup(l); }
  { const l = layout(true); const r = await run(l, g, { now: () => Date.now() });
    const refusal = r.out?.refusal ?? null;
    record('D3', 'SAFETY', 'remote grant + injected clock is refused BEFORE the real adapter is even constructed (a test clock defeats window and expiry)',
      { refusal, ran: r.out?.ran, ledger_created: existsSync(l.ledgerPath) }, r.out && r.out.ran === false && !existsSync(l.ledgerPath) && !String(refusal).startsWith('ADAPTER_')); cleanup(l); }
  { const l = layout(true); const r = await run(l, g, {});
    const refusal = r.out?.refusal ?? null;
    record('D4', 'SAFETY', 'control: with no override the REAL adapter is selected (it refuses for want of a credential, nothing created)',
      { refusal, ran: r.out?.ran, ledger_created: existsSync(l.ledgerPath) }, r.out && r.out.ran === false && String(refusal).startsWith('ADAPTER_') && !existsSync(l.ledgerPath)); cleanup(l); }
}
// ── LW2: the ledger disappears while the first request is in flight ──
{
  const m = await startMock(); const l = layout(false); const g = grant(m.url, { volume_policy: 'SAME_DEVICE_MOCK_ONLY', max_attempts: 2 });
  m.onRequest = () => renameSync(l.ledgerPath, l.ledgerPath + '.preserved');
  const r = await run(l, g, { credential: () => DUMMY }); const v = view(r, m);
  record('D5', 'SAFETY', 'ledger lost mid-request: structured stop, no throw, no second request, nothing recreated, no claim of persistence',
    { ...v, recreated: existsSync(l.ledgerPath) }, !r.threw && v.stopped === 'HISTORY_UNAVAILABLE' && v.completed === false && v.http_requests === 1 && v.ledger_head === null && v.usd === null && v.halted === true && !existsSync(l.ledgerPath));
  await m.close(); cleanup(l);
}
// ── LW3: physical storage changes after preflight ──
const swap = {
  symlink: (l) => { const sh = join(l.root, 'shadow'); mkdirSync(sh); copyFileSync(l.checkpointPath, join(sh, 'anchor.json')); const d = dirname(l.checkpointPath); renameSync(d, d + '.p'); symlinkSync(sh, d, 'dir'); },
  fresh: (l) => { const d = dirname(l.checkpointPath); renameSync(d, d + '.p'); mkdirSync(d); copyFileSync(join(d + '.p', 'anchor.json'), join(d, 'anchor.json')); },
  moved: (l) => swap.symlink(l),
  ledgerdir: (l) => { const d = join(l.root, 'ledger'); renameSync(d, d + '.p'); mkdirSync(d); copyFileSync(join(d + '.p', 'ledger.jsonl'), l.ledgerPath); },
};
for (const [id, cls, key, title] of [
  ['D6a', 'SAFETY', 'symlink', 'checkpoint directory replaced by a same-device symlink after the 1st settlement'],
  ['D6b', 'STRICTNESS', 'fresh', 'checkpoint directory replaced by a fresh directory at the same path (new inode, same device)'],
  ['D6c', 'SAFETY', 'moved', 'checkpoint directory remapped onto the ledger device after the 1st settlement'],
  ['D6d', 'STRICTNESS', 'ledgerdir', 'ledger directory replaced by a fresh directory (new inode, same device)'],
]) {
  const m = await startMock(); const l = layout(true); const g = grant(m.url); let done = false;
  m.onRequest = () => { if (m.requests === 1 && !done) { done = true; swap[key](l); } };
  const r = await run(l, g, { credential: () => DUMMY }); const v = view(r, m);
  record(id, cls, title + ' → no second request, storage stop', { swapped: done, ...v, ledger: kinds(l, g) }, !r.threw && done && v.http_requests === 1 && /^STORAGE_/.test(String(v.stopped)));
  await m.close(); cleanup(l);
}
{ // change lands after the durable reservation and before the send
  const m = await startMock(); const l = layout(true); const g = grant(m.url); let done = false;
  const now = () => { if (!done && existsSync(l.ledgerPath)) { let recs = []; try { recs = W.createLedger(l.ledgerPath, { experiment_id: g.experiment_id }).read(); } catch { /* mid-write */ }
    if (recs.filter((x) => x.kind === 'reserved').length === 1 && recs.filter((x) => x.kind === 'observed').length === 0) { done = true; swap.symlink(l); } } return Date.now(); };
  const r = await run(l, g, { credential: () => DUMMY, now }); const v = view(r, m);
  record('D7', 'SAFETY', 'change between the durable reservation and the send → the request is never written', { swapped: done, ...v, ledger: kinds(l, g) }, !r.threw && done && v.http_requests === 0);
  record('D7b', 'DIAGNOSTIC', 'the same stop names a storage cause rather than a generic transport error', { stopped: v.stopped }, /^STORAGE_/.test(String(v.stopped)));
  await m.close(); cleanup(l);
}
{ // change happens INSIDE the credential callback (after any pre-send guard, before the request is written)
  const m = await startMock(); const l = layout(true); const g = grant(m.url); let calls = 0; let done = false;
  const credential = () => { calls += 1; if (calls === 2 && !done) { done = true; swap.symlink(l); } return DUMMY; };
  const r = await run(l, g, { credential }); const v = view(r, m);
  record('D8', 'SAFETY', 'storage changes inside the credential callback of the 2nd send → the 2nd request is never written', { swapped: done, ...v, ledger: kinds(l, g) }, !r.threw && done && v.http_requests === 1);
  record('D8b', 'DIAGNOSTIC', 'the same stop names a storage cause', { stopped: v.stopped }, /^STORAGE_/.test(String(v.stopped)));
  await m.close(); cleanup(l);
}
{ // a completed run, resumed, with the checkpoint swapped after preflight (the transport factory runs after preflight, before the loop)
  const m = await startMock(); const l = layout(true); const g = grant(m.url, { max_attempts: 31 });
  const first = await run(l, g, { credential: () => DUMMY }); const before = m.requests;
  const r = await run(l, g, { credential: () => DUMMY, config: { mode: 'resume' }, createTransport: () => { swap.symlink(l); return { send: async () => REPLY }; } }); const v = view(r, null);
  record('D9', 'REPORT', 'resume of a completed run with storage swapped: the summary does not claim completion while reporting a stop',
    { first_completed: first.out?.completed, ...v, extra_requests: m.requests - before }, !r.threw && v.stopped !== null && v.completed !== true && m.requests === before);
  await m.close(); cleanup(l);
}
// ── dispatch-boundary agreement: the two stores are tampered with between the durable reservation and the send ──
for (const [id, key, title, tamper] of [
  ['D10a', 'anchor-deleted', 'anchor file deleted', (l) => rmSync(l.checkpointPath)],
  ['D10b', 'anchor-rolled-back', 'anchor rolled back to its pre-reservation copy', (l, s) => writeFileSync(l.checkpointPath, s.anchor)],
  ['D10c', 'ledger-rolled-back', 'ledger rolled back to its pre-reservation copy', (l, s) => writeFileSync(l.ledgerPath, s.ledger)],
]) {
  const m = await startMock(); const l = layout(true); const g = grant(m.url); let done = false; const snap = {};
  const now = () => { if (existsSync(l.ledgerPath) && existsSync(l.checkpointPath) && !done) { let recs = []; try { recs = W.createLedger(l.ledgerPath, { experiment_id: g.experiment_id }).read(); } catch { /* mid-write */ }
    if (recs.length === 1 && snap.ledger === undefined) { snap.ledger = readFileSync(l.ledgerPath, 'utf8'); snap.anchor = readFileSync(l.checkpointPath, 'utf8'); }
    if (recs.filter((x) => x.kind === 'reserved').length === 1 && recs.filter((x) => x.kind === 'observed').length === 0 && snap.ledger !== undefined) { done = true; tamper(l, snap); } } return Date.now(); };
  const r = await run(l, g, { credential: () => DUMMY, now }); const v = view(r, m);
  record(id, 'SAFETY', `${title} between reservation and send → the request is never written (a sent request must be recordable)`, { tampered: done, ...v, key }, !r.threw && done && v.http_requests === 0);
  await m.close(); cleanup(l);
}
// ── LW4: the free-space floor ──
{
  const l = layout(false); const g = grant('http://127.0.0.1:1/v1/systemone', { volume_policy: 'SAME_DEVICE_MOCK_ONLY' }); const res = {};
  for (const bad of [0, -1, NaN, Infinity, 1.5, 1024, R.MIN_FREE_BYTES - 1, '67108864', null]) { let pf; try { pf = R.preflight(cfg(l, g, { config: undefined, minFreeBytes: bad })); } catch (e) { pf = { ok: false, refusal: 'THREW:' + e.message }; } res[`${typeof bad}:${String(bad)}`] = pf.ok ? 'ACCEPTED' : pf.refusal; }
  const control = R.preflight(cfg(l, g, { minFreeBytes: R.MIN_FREE_BYTES })).ok;
  record('D11', 'SAFETY', 'no value below the 64 MiB floor (0, negative, NaN, Infinity, fraction, string, null, floor−1) is accepted; the floor itself is', { ...res, 'control(MIN_FREE_BYTES)': control ? 'accepted' : 'refused' },
    control && Object.values(res).every((x) => x !== 'ACCEPTED')); cleanup(l);
}
record('D12', 'INFO', 'exported surface', { exports: Object.keys(R).sort() }, true);

const safetyFail = rows.filter((r) => ['SAFETY', 'REPORT'].includes(r.class) && !r.pass);
const advisory = rows.filter((r) => ['STRICTNESS', 'DIAGNOSTIC'].includes(r.class) && !r.pass);
console.log(`DIFFERENTIAL  label=${label}  wrapper=${wrapperPath}`);
for (const r of rows.filter((x) => x.class !== 'INFO')) console.log(`${r.pass ? 'PASS' : (['SAFETY', 'REPORT'].includes(r.class) ? 'FAIL' : 'note')}  ${r.id.padEnd(4)} ${r.class.padEnd(10)} ${r.title}`);
console.log(`\n${rows.filter((r) => r.class !== 'INFO').length - safetyFail.length - advisory.length} pass · ${safetyFail.length} SAFETY/REPORT failures [${safetyFail.map((r) => r.id).join(', ') || '-'}] · ${advisory.length} advisory notes [${advisory.map((r) => r.id).join(', ') || '-'}]`);
if (jsonOut) writeFileSync(jsonOut, JSON.stringify({ label, wrapper: wrapperPath, second_device_root: SECOND, rows }, null, 2) + '\n');
process.exit(safetyFail.length === 0 ? 0 : 1);
