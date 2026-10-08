#!/usr/bin/env node
/**
 * JARVIS-JEV-01 / JEV-INT-05 — proof for the DEFAULT-DISABLED live-run wrapper. Loopback mock + dummy credential only.
 * The off-switch is opened ONLY inside temp copies; the committed module stays closed (L1 proves the wrapper refuses it).
 * Env (matrix only): JEV_LR_EDITS — JSON [from,to] edits applied to the wrapper module.
 */
import assert from 'node:assert/strict';
import http from 'node:http';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, linkSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, symlinkSync, writeFileSync, rmSync, lstatSync, readlinkSync, renameSync, copyFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { makeVariant } from './jev-wire-variant-lib.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const lrEdits = process.env.JEV_LR_EDITS ? JSON.parse(process.env.JEV_LR_EDITS) : [];
const WV = makeVariant([], { witnessed: true });                 // open switch (test copy)
const GV = makeVariant([], { witnessed: false });                // as committed: closed
const priorSource = process.env.JEV_LR_SOURCE_COMMIT
  ? execFileSync('git', ['show', process.env.JEV_LR_SOURCE_COMMIT + ':scripts/builder/jev-wire-live-run-v1.mjs'],
      { cwd: join(HERE, '..', '..', '..'), encoding: 'utf8' })
  : null;
const LR = makeVariant(lrEdits, { from: join(HERE, '..', 'jev-wire-live-run-v1.mjs'), source: priorSource,
  importMap: { './jev-wire-v1.mjs': WV.url } });
const LC = makeVariant(lrEdits, { from: join(HERE, '..', 'jev-wire-live-run-v1.mjs'), source: priorSource,
  importMap: { './jev-wire-v1.mjs': GV.url } });
const W = await import(WV.url); const R = await import(LR.url); const C = await import(LC.url);

let pass = 0; let fail = 0;
async function check(name, fn) {
  if (process.env.JEV_LR_ONLY_CHECK && name.split('-')[0] !== process.env.JEV_LR_ONLY_CHECK) return;
  try { await fn(); pass += 1; console.log('PASS  ' + name); }
  catch (e) { fail += 1; console.log('FAIL  ' + name); console.log('      ' + String(e.message).split('\n')[0]); }
}
const DUMMY = 'dummy-credential-DO-NOT-USE-0123456789';
const REPLY = { model: 'jev-1.13.0', usage: { input_tokens: 300, output_tokens: 5 }, answers: { Q_RISK: { type: 'noul', noul: 0.25 } } };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const SECOND_DEVICE_ROOT = process.env.JEV_TEST_SECOND_DEVICE_ROOT ?? '/dev/shm';
const HAVE_SHM = existsSync(SECOND_DEVICE_ROOT) && (await import('node:fs')).statSync(SECOND_DEVICE_ROOT).dev !== (await import('node:fs')).statSync(tmpdir()).dev;

async function startMock() {
  const m = { requests: [], mode: 'ok', onRequest: null };
  const server = http.createServer((req, res) => {
    const chunks = []; req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      const rec = { method: req.method, url: req.url, headers: req.headers, body: Buffer.concat(chunks) };
      m.requests.push(rec); m.onRequest?.(rec);
      if (m.mode.startsWith('status:')) { res.writeHead(Number(m.mode.slice(7)), { 'content-type': 'application/json' }); return res.end('{"detail":"x"}'); }
      res.writeHead(200, { 'content-type': 'application/json' }); res.end(JSON.stringify(REPLY));
    });
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  m.url = `http://127.0.0.1:${server.address().port}/v1/systemone`;
  m.close = () => new Promise((r) => { server.closeAllConnections(); server.close(r); });
  return m;
}

/** A tree snapshot: names, kinds, file bytes, link targets. */
function tree(root) {
  const out = [];
  const walk = (d) => { for (const n of readdirSync(d).sort()) { const f = join(d, n); const st = lstatSync(f);
    if (st.isSymbolicLink()) out.push([f, 'link', readlinkSync(f)]); else if (st.isDirectory()) { out.push([f, 'dir']); walk(f); } else out.push([f, 'file', readFileSync(f, 'utf8')]); } };
  walk(root); return JSON.stringify(out);
}
function layout({ distinct = false } = {}) {
  const root = mkdtempSync(join(tmpdir(), 'jev-lr-')); mkdirSync(join(root, 'ledger'));
  let cpRoot = root; let cpDir;
  if (distinct) { cpRoot = mkdtempSync(join(SECOND_DEVICE_ROOT, 'jev-lr-')); cpDir = join(cpRoot, 'anchor'); } else cpDir = join(root, 'anchor');
  mkdirSync(cpDir);
  return { root, cpRoot, ledgerPath: join(root, 'ledger', 'ledger.jsonl'), checkpointPath: join(cpDir, 'anchor.json'), checkpointMountPoint: distinct ? SECOND_DEVICE_ROOT : undefined };
}
const iso = (ms) => new Date(ms).toISOString();
const grantFor = (mod, mock, over = {}) => ({
  instrument: 'jev-int05-execution-grant/v1', state: 'AUTHORIZED', experiment_id: 'JEV-INT-05-MOCK-RUN-1', provider_id: 'typesafe-jev',
  model: 'jev-1.13.0', endpoint: mock.url, network: 'LOOPBACK_ONLY', table_hash: mod.questionTableHash(), fixture_list_hash: mod.fixtureListHash(),
  schema_sha256: mod.RESPONSE_SHAPE.schema_sha256, max_attempts: 31, ceiling_usd: 1, not_before: iso(Date.now() - 3600_000), expires_at: iso(Date.now() + 3600_000),
  volume_policy: 'SAME_DEVICE_MOCK_ONLY', operator: 'test-operator', authorized_by: 'test-authorizer', authorization_ref: 'TEST-ONLY', ...over,
});
function spyCredential() { const c = { calls: 0, fn: () => { c.calls += 1; return DUMMY; } }; return c; }
function config(l, grant, over = {}) {
  return { grant, confirmGrantHash: (() => { try { return R.grantHash(grant); } catch { return 'unhashable'; } })(), ledgerPath: l.ledgerPath, checkpointPath: l.checkpointPath, checkpointMountPoint: l.checkpointMountPoint, mode: 'initialize', ...over };
}

await check('L1-committed-off-switch-refuses-before-any-store-credential-or-transport', async () => {
  const m = await startMock(); const l = layout(); const before = tree(l.root);
  const cred = spyCredential(); let factoryCalls = 0;
  const grant = grantFor(W, m);
  const out = await C.executeLiveRun(config(l, grant), { credential: cred.fn, createTransport: () => { factoryCalls += 1; throw new Error('must not be built'); } });
  assert.equal(out.ran, false); assert.equal(out.refusal, 'OFF_SWITCH_CLOSED');
  assert.equal(cred.calls, 0); assert.equal(factoryCalls, 0); assert.equal(m.requests.length, 0);
  assert.equal(tree(l.root), before, 'no store, lock or file was created');
  assert.equal(C.preflight(config(l, grant)).refusal, 'OFF_SWITCH_CLOSED');
  await m.close();
});

await check('L2-grant-must-match-the-code-and-can-only-narrow-it', async () => {
  const m = await startMock(); const l = layout(); const good = grantFor(W, m);
  assert.equal(R.preflight(config(l, good)).ok, true);
  const variants = {
    'state not authorized': { state: 'DRAFT' }, 'wrong provider': { provider_id: 'someone-else' }, 'wrong model': { model: 'jev-latest' },
    'table hash': { table_hash: 'f'.repeat(64) }, 'fixture hash': { fixture_list_hash: 'f'.repeat(64) }, 'schema hash': { schema_sha256: 'f'.repeat(64) },
    'attempts above cap': { max_attempts: 32 }, 'attempts zero': { max_attempts: 0 }, 'spend above cap': { ceiling_usd: 1.01 }, 'spend nan': { ceiling_usd: NaN },
    'expired': { expires_at: iso(Date.now() - 1000), not_before: iso(Date.now() - 7200_000) }, 'not yet valid': { not_before: iso(Date.now() + 60_000), expires_at: iso(Date.now() + 3600_000) },
    'window over 7 days': { not_before: iso(Date.now() - 1000), expires_at: iso(Date.now() + 8 * 24 * 3600_000) },
    'bad experiment id': { experiment_id: 'whatever' }, 'remote with loopback endpoint': { network: 'EXTERNAL_PINNED' },
    'pinned network, wrong endpoint': { network: 'EXTERNAL_PINNED', endpoint: 'https://evil.example/v1/systemone', volume_policy: 'DISTINCT_DEVICES' },
    'remote with same-device layout': { network: 'EXTERNAL_PINNED', endpoint: 'https://api.typesafe.ai/v1/systemone' },
    'unnamed operator': { operator: ' ' }, 'unnamed authorizer': { authorized_by: '' },
  };
  const expectId = {
    'state not authorized': 'GRANT_STATE', 'wrong provider': 'PROVIDER', 'wrong model': 'MODEL', 'table hash': 'TABLE_HASH', 'fixture hash': 'FIXTURE_HASH',
    'schema hash': 'SCHEMA_HASH', 'attempts above cap': 'ATTEMPT_CAP', 'attempts zero': 'ATTEMPT_CAP', 'spend above cap': 'SPEND_CAP', 'spend nan': 'SPEND_CAP',
    'expired': 'WINDOW_OPEN', 'not yet valid': 'WINDOW_OPEN', 'window over 7 days': 'WINDOW_SHAPE', 'bad experiment id': 'EXPERIMENT_ID',
    'remote with loopback endpoint': 'ENDPOINT_COHERENT', 'pinned network, wrong endpoint': 'ENDPOINT_COHERENT', 'remote with same-device layout': 'ENDPOINT_COHERENT',
    'unnamed operator': 'NAMES_RECORDED', 'unnamed authorizer': 'NAMES_RECORDED',
  };
  for (const [label, over] of Object.entries(variants)) {
    const g = grantFor(W, m, over); const p = R.preflight(config(l, g));
    assert.equal(p.ok, false, label);
    assert.equal(p.refusal, expectId[label], `${label}: refused for ${p.refusal}`);
  }
  const extra = { ...good, extra: 1 }; assert.equal(R.preflight(config(l, extra)).refusal, 'GRANT_SHAPE');
  const { operator: _o, ...missing } = good; assert.equal(R.preflight(config(l, missing)).refusal, 'GRANT_SHAPE');
  assert.equal(R.preflight({ ...config(l, good), confirmGrantHash: undefined }).refusal, 'OPERATOR_CONFIRMATION');
  assert.equal(R.preflight({ ...config(l, good), confirmGrantHash: 'a'.repeat(64) }).refusal, 'OPERATOR_CONFIRMATION');
  assert.equal(R.preflight({ ...config(l, good), confirmGrantHash: R.grantHash({ ...good, max_attempts: 5 }) }).refusal, 'OPERATOR_CONFIRMATION');
  await m.close();
});

await check('L3-storage-preflight-refuses-unsafe-layouts-without-creating-anything', async () => {
  const m = await startMock(); const grant = grantFor(W, m);
  const refuse = (label, cfg, expect) => {
    const root = cfg.__root; const before = tree(root); const p = R.preflight(cfg);
    assert.equal(p.ok, false, label); assert.equal(p.refusal, expect, `${label}: got ${p.refusal}`); assert.equal(tree(root), before, label + ': nothing created');
  };
  { const l = layout(); rmSync(dirname(l.checkpointPath), { recursive: true }); refuse('checkpoint dir missing', { ...config(l, grant), __root: l.root }, 'CHECKPOINT_DIR'); }
  { const l = layout(); rmSync(join(l.root, 'ledger'), { recursive: true }); refuse('ledger dir missing', { ...config(l, grant), __root: l.root }, 'LEDGER_DIR'); }
  { const l = layout(); const real = join(l.root, 'real'); mkdirSync(real); rmSync(join(l.root, 'ledger'), { recursive: true }); symlinkSync(real, join(l.root, 'ledger'), 'dir');
    refuse('ledger dir is a link', { ...config(l, grant), __root: l.root }, 'LEDGER_DIR'); }
  { const l = layout(); writeFileSync(join(l.root, 'afile'), 'x'); refuse('checkpoint dir is a file', { ...config(l, grant), checkpointPath: join(l.root, 'afile', 'a.json'), __root: l.root }, 'CHECKPOINT_DIR'); }
  { const l = layout(); refuse('identical paths', { ...config(l, grant), checkpointPath: l.ledgerPath, __root: l.root }, 'PATHS_DISTINCT'); }
  { const l = layout(); refuse('checkpoint = ledger lock', { ...config(l, grant), checkpointPath: l.ledgerPath + '.lock', __root: l.root }, 'PATHS_DISTINCT'); }
  { const l = layout(); refuse('no free space', { ...config(l, grant), minFreeBytes: Number.MAX_SAFE_INTEGER, __root: l.root }, 'LEDGER_SPACE'); }
  { const l = layout(); writeFileSync(l.ledgerPath + '.pair.lock', '1'); refuse('stale pair lock', { ...config(l, grant), __root: l.root }, 'NO_LOCKS'); }
  { const l = layout(); writeFileSync(l.ledgerPath + '.lock', '1'); refuse('stale ledger lock', { ...config(l, grant), __root: l.root }, 'NO_LOCKS'); }
  // real-run layouts: distinct devices + a verified mount point
  const dg = grantFor(W, m, { volume_policy: 'DISTINCT_DEVICES' });
  { const l = layout(); refuse('same device under DISTINCT_DEVICES', { ...config(l, dg), checkpointMountPoint: l.root, __root: l.root }, 'DEVICES_DISTINCT'); }
  if (!HAVE_SHM) throw new Error('NOT RUN: this host has no second device (/dev/shm) for the distinct-device cases');
  { const l = layout({ distinct: true }); refuse('no mount point named', { ...config(l, dg), checkpointMountPoint: undefined, __root: l.root }, 'CHECKPOINT_MOUNTED');
    refuse('mount point is a plain directory (unmounted-volume shadow)', { ...config(l, dg), checkpointMountPoint: l.cpRoot, __root: l.root }, 'CHECKPOINT_MOUNTED');
    refuse('checkpoint outside the named mount point', { ...config(l, dg), checkpointMountPoint: '/dev', __root: l.root }, 'CHECKPOINT_MOUNTED');
    refuse('mount point does not exist', { ...config(l, dg), checkpointMountPoint: '/Volumes/JEV-NOT-MOUNTED-TEST-ONLY', __root: l.root }, 'CHECKPOINT_MOUNTED');
    assert.equal(R.preflight({ ...config(l, dg), checkpointMountPoint: SECOND_DEVICE_ROOT }).ok, true, 'control: genuine mount point on a second device passes'); }
  await m.close();
});

await check('L4-modes-never-resume-repair-or-initialize-by-themselves', async () => {
  const m = await startMock(); const grant = grantFor(W, m);
  { const l = layout(); const r = R.preflight(config(l, grant, { mode: 'resume' })); assert.equal(r.refusal, 'STORES_MUST_EXIST'); assert.equal(existsSync(l.ledgerPath), false); }
  { const l = layout(); R.preflight(config(l, grant)); const out = await R.executeLiveRun(config(l, grant), { credential: spyCredential().fn }); assert.equal(out.ran, true);
    assert.equal(R.preflight(config(l, grant)).refusal, 'STORES_MUST_BE_ABSENT', 'initialize on existing stores is refused'); }
  { const l = layout(); const pair = W.createLedger(l.ledgerPath, { experiment_id: grant.experiment_id });
    const cp = (await import(pathUrl('jev-wire-checkpoint-v1.mjs'))).createCheckpointedLedger(pair, l.checkpointPath); cp.initialize();
    pair.append({ kind: 'reserved', attempt_id: 'F01', wire_body_hash: 'h', reserve_usd: 0.005 });          // ledger ahead of the anchor
    assert.equal(R.preflight(config(l, grant, { mode: 'resume' })).refusal, 'STORES_INCONSISTENT');
    assert.equal(cp.verify().ahead, 1, 'the wrapper did not advance the checkpoint'); }
  { const l = layout(); const pair = W.createLedger(l.ledgerPath, { experiment_id: grant.experiment_id });
    const cpm = (await import(pathUrl('jev-wire-checkpoint-v1.mjs'))).createCheckpointedLedger(pair, l.checkpointPath); cpm.initialize();
    cpm.append({ kind: 'reserved', attempt_id: 'F01', wire_body_hash: 'h', reserve_usd: 0.005 });
    assert.equal(R.preflight(config(l, grant, { mode: 'resume' })).refusal, 'RUN_UNRESOLVED');
    cpm.append({ kind: 'settled', attempt_id: 'F01', cost_known: false, outcome: 'crossing_unknown' });
    assert.equal(R.preflight(config(l, grant, { mode: 'resume' })).refusal, 'RUN_HALTED'); }
  { const l = layout(); const other = grantFor(W, m, { experiment_id: 'JEV-INT-05-SOMETHING-ELSE' });
    await R.executeLiveRun(config(l, grant), { credential: spyCredential().fn });
    assert.notEqual(R.preflight(config(l, other, { mode: 'resume' })).ok, true, 'a different experiment id cannot adopt these stores'); }
  await m.close();
});
function pathUrl(name) { return new URL('../' + name, import.meta.url).href; }

await check('L5-full-31-attempt-mock-run-on-distinct-devices-then-resume-sends-nothing', async () => {
  if (!HAVE_SHM) throw new Error('NOT RUN: no second device for the distinct-device run');
  const m = await startMock(); const l = layout({ distinct: true }); const cred = spyCredential();
  const grant = grantFor(W, m, { volume_policy: 'DISTINCT_DEVICES' });
  const out = await R.executeLiveRun(config(l, grant), { credential: cred.fn });
  assert.equal(out.ran, true); assert.equal(out.completed, true); assert.equal(out.stopped_reason, null);
  assert.equal(out.attempts.length, 31); assert.ok(out.attempts.every((a) => a.outcome === 'ok'));
  assert.equal(m.requests.length, 31); assert.equal(cred.calls, 31, 'the credential was requested once per send, never earlier');
  const sha = (b) => createHash('sha256').update(b).digest('hex');
  const recs = W.createLedger(l.ledgerPath, { experiment_id: grant.experiment_id }).read();
  const reserved = recs.filter((r) => r.kind === 'reserved');
  m.requests.forEach((rq, i) => assert.equal(sha(rq.body), reserved[i].wire_body_hash));
  assert.ok(Math.abs(out.usd - 31 * 300 * 0.042 / 1e6) < 1e-12);
  const again = await R.executeLiveRun(config(l, grant, { mode: 'resume' }), { credential: cred.fn });
  assert.equal(again.ran, true); assert.equal(again.attempts.length, 0); assert.equal(again.completed, true); assert.equal(m.requests.length, 31);
  rmSync(l.cpRoot, { recursive: true, force: true });
  await m.close();
});

await check('L6-grant-can-narrow-attempts-and-spend', async () => {
  { const m = await startMock(); const l = layout(); const out = await R.executeLiveRun(config(l, grantFor(W, m, { max_attempts: 5 })), { credential: spyCredential().fn });
    assert.equal(m.requests.length, 5); assert.equal(out.stopped_reason, 'GRANT_ATTEMPT_CAP'); assert.equal(out.completed, false); await m.close(); }
  { const m = await startMock(); const l = layout(); const out = await R.executeLiveRun(config(l, grantFor(W, m, { ceiling_usd: 0.0051 })), { credential: spyCredential().fn });
    assert.equal(out.stopped_reason, 'GRANT_SPEND_CAP'); assert.equal(m.requests.length, 8); assert.ok(out.usd <= 0.0051); await m.close(); }
  { const m = await startMock(); const l = layout(); const out = await R.executeLiveRun(config(l, grantFor(W, m, { ceiling_usd: 0.004 })), { credential: spyCredential().fn });
    assert.equal(out.stopped_reason, 'GRANT_SPEND_CAP'); assert.equal(m.requests.length, 0, 'a ceiling below one reservation sends nothing'); await m.close(); }
  { // narrowing survives a resume: attempts already used count against the grant
    const m = await startMock(); const l = layout(); const g = grantFor(W, m, { max_attempts: 5 });
    await R.executeLiveRun(config(l, g), { credential: spyCredential().fn });
    const again = await R.executeLiveRun(config(l, g, { mode: 'resume' }), { credential: spyCredential().fn });
    assert.equal(m.requests.length, 5); assert.equal(again.attempts.length, 0); assert.equal(again.stopped_reason, 'GRANT_ATTEMPT_CAP'); await m.close(); }
});

await check('L7-stops-at-the-first-failure-and-refuses-to-resume-after-it', async () => {
  const m = await startMock(); const l = layout(); const g = grantFor(W, m);
  m.onRequest = () => { m.mode = m.requests.length === 3 ? 'status:500' : 'ok'; };
  const out = await R.executeLiveRun(config(l, g), { credential: spyCredential().fn });
  assert.equal(m.requests.length, 3); assert.equal(out.halted, true); assert.equal(out.completed, false);
  assert.equal(out.attempts.length, 3); assert.equal(out.attempts[2].outcome, 'crossing_unknown');
  assert.notEqual(out.stopped_reason, null);
  m.mode = 'ok';
  const again = await R.executeLiveRun(config(l, g, { mode: 'resume' }), { credential: spyCredential().fn });
  assert.equal(again.ran, false); assert.equal(again.refusal, 'RUN_HALTED'); assert.equal(m.requests.length, 3);
  await m.close();
});

await check('L8-grant-expiry-is-rechecked-during-the-run', async () => {
  const m = await startMock(); const l = layout(); const g = grantFor(W, m);
  const exp = Date.parse(g.expires_at);
  const now = () => (m.requests.length >= 2 ? exp + 1 : Date.now());
  const out = await R.executeLiveRun(config(l, g), { credential: spyCredential().fn, now });
  assert.equal(out.stopped_reason, 'GRANT_EXPIRED'); assert.equal(m.requests.length, 2);
  await m.close();
});

await check('L9-credential-is-only-requested-at-send-and-never-surfaces', async () => {
  const m = await startMock(); const l = layout(); const g = grantFor(W, m, { max_attempts: 2 });
  const cred = spyCredential(); const seen = [];
  const real = { ...console }; for (const k of ['log', 'error', 'warn', 'info', 'debug']) console[k] = (...a) => seen.push(a.join(' '));
  let out;
  try { out = await R.executeLiveRun(config(l, g), { credential: cred.fn }); } finally { Object.assign(console, real); }
  assert.equal(cred.calls, 2);
  assert.equal(JSON.stringify(out).includes(DUMMY), false); assert.equal(seen.join('\n').includes(DUMMY), false);
  // a failing credential function stops the run with a sanitized reason and leaves a halted, resumable-by-nobody ledger
  const m2 = await startMock(); const l2 = layout();
  const out2 = await R.executeLiveRun(config(l2, grantFor(W, m2)), { credential: () => { throw new Error('callback-secret-MARKER'); } });
  assert.equal(JSON.stringify(out2).includes('MARKER'), false); assert.equal(m2.requests.length, 0); assert.equal(out2.halted, true);
  // missing credential function: refused before any store is created
  const m3 = await startMock(); const l3 = layout(); const before = tree(l3.root);
  const out3 = await R.executeLiveRun(config(l3, grantFor(W, m3)), {});
  assert.equal(out3.ran, false); assert.match(out3.refusal, /^ADAPTER_/); assert.equal(tree(l3.root), before);
  await m.close(); await m2.close(); await m3.close();
});

await check('L10-remote-option-follows-the-grant-and-the-pinned-endpoint-only', async () => {
  if (!HAVE_SHM) throw new Error('NOT RUN: no second-device test root');
  const calls = [];
  const spy = (opts) => { calls.push({ endpoint: opts.endpoint, allowRemote: opts.allowRemote, hasCredentialFn: typeof opts.credential === 'function' });
    return { send: async () => REPLY }; };
  const l = layout({ distinct: true });
  const pinned = grantFor(W, { url: 'https://api.typesafe.ai/v1/systemone' }, {
    network: 'EXTERNAL_PINNED', volume_policy: 'DISTINCT_DEVICES', max_attempts: 1,
  });
  // A fake transport is NEVER a valid way to witness a remote response.
  const denied = await R.executeLiveRun(config(l, pinned), { createTransport: spy });
  assert.equal(denied.ran, false); assert.equal(denied.refusal, 'REMOTE_TRANSPORT_OVERRIDE_FORBIDDEN');
  assert.equal(calls.length, 0); assert.equal(existsSync(l.ledgerPath), false);
  // No credential: real adapter construction fails before a network call or ledger write.
  // If the remote option were improperly false, this would refuse as ADAPTER_REMOTE_NOT_ALLOWED instead.
  const noCredential = await R.executeLiveRun(config(l, pinned));
  assert.equal(noCredential.ran, false); assert.equal(noCredential.refusal, 'ADAPTER_CREDENTIAL_INVALID');
  assert.equal(existsSync(l.ledgerPath), false);
  rmSync(l.cpRoot, { recursive: true, force: true });

  const m = await startMock(); const l2 = layout();
  await R.executeLiveRun(config(l2, grantFor(W, m, { max_attempts: 1 })), {
    credential: spyCredential().fn, createTransport: spy,
  });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].allowRemote, false, 'a loopback grant never enables remote');
  // The same pinned grant is refused under the COMMITTED closed switch.
  const l3 = layout({ distinct: true }); calls.length = 0;
  const refused = await C.executeLiveRun(config(l3, pinned), { createTransport: spy });
  assert.equal(refused.refusal, 'OFF_SWITCH_CLOSED'); assert.equal(calls.length, 0);
  rmSync(l3.cpRoot, { recursive: true, force: true }); await m.close();
});

await check('L11-static-no-env-no-cli-no-logging-never-writes-the-off-switch', () => {
  const src = readFileSync(LR.file, 'utf8');
  const imports = [...src.matchAll(/^import .* from '([^']+)';/gm)].map((x) => x[1]);
  for (const spec of imports) assert.ok(/^node:(crypto|fs|path)$/.test(spec) || /jev-wire-v1\.mjs$|jev-wire-checkpoint-v1\.mjs$|jev-wire-http-adapter-v1\.mjs$/.test(spec), 'unexpected import ' + spec);
  const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  for (const banned of ['process.env', 'process.argv', 'console.', 'child_process', 'readFile', 'writeFile', 'fetch(', 'allowRemote: true', 'setInterval', 'rmSync', 'unlinkSync', 'renameSync',
    'RESPONSE_SHAPE.witnessed =', 'witnessed: true', 'witnessed = true']) {
    assert.equal(code.includes(banned), false, 'banned token ' + banned);
  }
});

await check('L12-summary-is-content-free', async () => {
  const m = await startMock(); const l = layout(); const out = await R.executeLiveRun(config(l, grantFor(W, m, { max_attempts: 2 })), { credential: spyCredential().fn });
  const text = JSON.stringify(out);
  for (const banned of ['Bearer', DUMMY, '"state"', 'instructions', 'structural-risk']) assert.equal(text.includes(banned), false, banned);
  assert.deepEqual(Object.keys(out).sort(), ['attempts', 'checks', 'completed', 'grant_sha256', 'halted', 'ledger_head', 'ran', 'refusal', 'stopped_reason', 'usd']);
  await m.close();
});

// ── Mac review 8e04f8006: four live-wrapper boundaries; all transports local/mock ─────────────

await check('L13-external-grants-never-accept-injected-transport-or-test-clock', async () => {
  const l = layout({ distinct: true }); const cred = spyCredential();
  const g = grantFor(W, { url: 'https://api.typesafe.ai/v1/systemone' }, {
    network: 'EXTERNAL_PINNED', volume_policy: 'DISTINCT_DEVICES', max_attempts: 1,
  });
  const before = tree(l.root); let injectedFactories = 0, mockedSends = 0;
  const maliciousFake = () => { injectedFactories++; return { send: async () => { mockedSends++; return REPLY; } }; };
  const denied = await R.executeLiveRun(config(l, g), { createTransport: maliciousFake });
  assert.equal(denied.ran, false); assert.equal(denied.refusal, 'REMOTE_TRANSPORT_OVERRIDE_FORBIDDEN');
  assert.equal(injectedFactories, 0); assert.equal(mockedSends, 0); assert.equal(cred.calls, 0);
  // Prototype-carried hooks cannot override the real provider transport.
  const inherited = Object.create({ createTransport: maliciousFake });
  const inheritedDenied = await R.executeLiveRun(config(l, g), inherited);
  assert.equal(inheritedDenied.refusal, 'REMOTE_TRANSPORT_OVERRIDE_FORBIDDEN');
  assert.equal(injectedFactories, 0);
  assert.equal(tree(l.root), before); assert.equal(existsSync(l.ledgerPath), false);
  // An injected fake clock is also not a real-world expiry or spending witness.
  const deniedTime = await R.executeLiveRun(config(l, g), { now: () => Date.now() });
  assert.equal(deniedTime.ran, false); assert.equal(deniedTime.refusal, 'REMOTE_TEST_CLOCK_FORBIDDEN');
  // With no override and no credential, constructing the real adapter fails closed BEFORE any store.
  const refused = await R.executeLiveRun(config(l, g));
  assert.equal(refused.ran, false); assert.equal(refused.refusal, 'ADAPTER_CREDENTIAL_INVALID');
  assert.equal(existsSync(l.ledgerPath), false);
  rmSync(l.cpRoot, { recursive: true, force: true });
});

await check('L14-vanished-ledger-after-request-gives-structured-unknown-stop', async () => {
  const m = await startMock(); const l = layout(); const g = grantFor(W, m, { max_attempts: 2 });
  try {
    m.onRequest = () => renameSync(l.ledgerPath, l.ledgerPath + '.preserved');
    const out = await R.executeLiveRun(config(l, g), { credential: spyCredential().fn });
    assert.equal(out.ran, true); assert.equal(out.stopped_reason, 'HISTORY_UNAVAILABLE');
    assert.equal(out.completed, false); assert.equal(out.ledger_head, null);
    assert.equal(out.usd, null); assert.equal(out.halted, true);
    assert.equal(m.requests.length, 1);
    assert.equal(out.attempts.length, 1);
    assert.equal(out.attempts[0].id, 'F01');
    assert.equal(out.attempts[0].outcome, 'observation_persistence_unverified');
    assert.equal(existsSync(l.ledgerPath), false);
    assert.equal(existsSync(l.ledgerPath + '.preserved'), true);
    assert.equal(JSON.stringify(out).includes(DUMMY), false);
  } finally { await m.close(); }
});

await check('L15-physical-mount-drift-stops-before-second-attempt-and-before-first-dispatch', async () => {
  async function runDrift(point) {
    const m = await startMock(); const l = layout({ distinct: true }); const cred = spyCredential();
    const g = grantFor(W, m, { volume_policy: 'DISTINCT_DEVICES', max_attempts: 2 });
    const cpDir = dirname(l.checkpointPath); const shadow = join(l.root, 'shadow');
    mkdirSync(shadow);
    let changed = false;
    const now = () => {
      if (!changed && existsSync(l.ledgerPath) && existsSync(l.checkpointPath)) {
        let recs = [];
        try { recs = W.createLedger(l.ledgerPath, { experiment_id: g.experiment_id }).read(); } catch {}
        const settled = recs.filter((r) => r.kind === 'settled').length;
        const reserved = recs.filter((r) => r.kind === 'reserved').length;
        const observed = recs.filter((r) => r.kind === 'observed').length;
        const trigger = point === 'after-first-settlement'
          ? settled === 1 : reserved === 1 && observed === 0;
        if (trigger) {
          copyFileSync(l.checkpointPath, join(shadow, 'anchor.json'));
          renameSync(cpDir, cpDir + '.preserved');
          symlinkSync(shadow, cpDir, 'dir');
          changed = true;
        }
      }
      return Date.now();
    };
    try {
      const out = await R.executeLiveRun(config(l, g), { credential: cred.fn, now });
      assert.equal(changed, true, point + ': fixture failed to remap checkpoint');
      assert.equal(m.requests.length, point === 'after-first-settlement' ? 1 : 0, point);
      assert.equal(out.completed, false);
      assert.notEqual(out.stopped_reason, null, point);
      if (point === 'after-first-settlement') assert.equal(out.stopped_reason, 'STORAGE_CHECKPOINT_DIR');
      return out;
    } finally {
      if (changed) { rmSync(cpDir); renameSync(cpDir + '.preserved', cpDir); }
      rmSync(l.cpRoot, { recursive: true, force: true }); await m.close();
    }
  }
  await runDrift('after-first-settlement');
  await runDrift('after-reservation-before-send');
});

await check('L16-free-space-floor-is-not-lowerable-by-config', async () => {
  const l = layout(); const m = await startMock(); const g = grantFor(W, m);
  try {
    for (const bad of [0, -1, NaN, Infinity, null, '0', 2 ** 53, R.MIN_FREE_BYTES - 1]) {
      const result = R.checkStorage({ ledgerPath: l.ledgerPath, checkpointPath: l.checkpointPath,
        volumePolicy: 'SAME_DEVICE_MOCK_ONLY', minFreeBytes: bad });
      assert.equal(result.find((x) => !x.ok)?.id, 'MIN_FREE_SPACE_CONFIG', String(bad));
      const pf = R.preflight(config(l, g, { minFreeBytes: bad }));
      assert.equal(pf.refusal, 'MIN_FREE_SPACE_CONFIG', String(bad));
    }
    const valid = R.checkStorage({ ledgerPath: l.ledgerPath, checkpointPath: l.checkpointPath,
      volumePolicy: 'SAME_DEVICE_MOCK_ONLY', minFreeBytes: R.MIN_FREE_BYTES });
    assert.equal(valid.every((x) => x.ok), true);
    const tight = R.checkStorage({ ledgerPath: l.ledgerPath, checkpointPath: l.checkpointPath,
      volumePolicy: 'SAME_DEVICE_MOCK_ONLY', minFreeBytes: Number.MAX_SAFE_INTEGER });
    assert.equal(tight.find((x) => !x.ok)?.id, 'LEDGER_SPACE');
  } finally { await m.close(); }
});

console.log(`\n${pass} passed · ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
