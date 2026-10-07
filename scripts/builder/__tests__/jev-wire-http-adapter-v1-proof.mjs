#!/usr/bin/env node
/**
 * JARVIS-JEV-01 / JEV-INT-05 — proof for the INACTIVE HTTP adapter against a LOOPBACK mock only.
 * No provider is contacted; credentials are dummies; the runner's response-shape gate is opened only in temp copies.
 * Env (matrix only): JEV_AD_EDITS — JSON [from,to] edits applied to the adapter module.
 */
import assert from 'node:assert/strict';
import http from 'node:http';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { makeVariant } from './jev-wire-variant-lib.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const adEdits = process.env.JEV_AD_EDITS ? JSON.parse(process.env.JEV_AD_EDITS) : [];
const WV = makeVariant([], { witnessed: true });
const GV = makeVariant([], { witnessed: false });
const CV = makeVariant([], { from: join(HERE, '..', 'jev-wire-checkpoint-v1.mjs') });
const AV = makeVariant(adEdits, { from: join(HERE, '..', 'jev-wire-http-adapter-v1.mjs') });
const W = await import(WV.url); const G = await import(GV.url); const CK = await import(CV.url); const AD = await import(AV.url);

let pass = 0; let fail = 0;
async function check(name, fn) {
  try { await fn(); pass += 1; console.log('PASS  ' + name); }
  catch (e) { fail += 1; console.log('FAIL  ' + name); console.log('      ' + String(e.message).split('\n')[0]); }
}
const DUMMY = 'dummy-credential-DO-NOT-USE-0123456789';
const sha = (b) => createHash('sha256').update(b).digest('hex');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const scratch = () => mkdtempSync(join(tmpdir(), 'jev-ad-'));
const REPLY = { model: 'jev-1.13.0', usage: { input_tokens: 300, output_tokens: 5 }, answers: { Q_RISK: { type: 'noul', noul: 0.25 } } };

/** Loopback mock of the hosted service. Records everything it is sent. */
async function startMock() {
  const m = { requests: [], other: 0, mode: 'ok', reply: () => REPLY, clientGone: 0, lateWrites: [], sockets: new Set() };
  const server = http.createServer((req, res) => {
    if (req.url === '/other') { m.other += 1; res.writeHead(200, { 'content-type': 'application/json' }); return res.end('{}'); }
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('close', () => { m.clientGone += 1; });
    req.on('end', () => {
      const rec = { method: req.method, url: req.url, headers: req.headers, body: Buffer.concat(chunks) };
      m.requests.push(rec);
      m.onRequest?.(rec);
      const mode = m.mode; const json = { 'content-type': 'application/json' };
      if (mode === 'ok') { const b = JSON.stringify(m.reply(rec)); res.writeHead(200, json); return res.end(b); }
      if (mode === 'bad-json') { res.writeHead(200, json); return res.end('{not json'); }
      if (mode === 'text') { res.writeHead(200, { 'content-type': 'text/plain' }); return res.end(JSON.stringify(REPLY)); }
      if (mode.startsWith('status:')) { res.writeHead(Number(mode.slice(7)), json); return res.end('{"detail":"SERVER-SECRET-BODY"}'); }
      if (mode.startsWith('redirect:')) { res.writeHead(Number(mode.slice(9)), { location: `http://127.0.0.1:${server.address().port}/other` }); return res.end(); }
      if (mode === 'stall-headers') return;                                   // never answers
      if (mode === 'stall-body') { res.writeHead(200, json); res.write('{"mod'); return; }
      if (mode === 'trickle') { res.writeHead(200, json); res.write('{'); const t = setInterval(() => { if (res.destroyed || res.writableEnded) return clearInterval(t); res.write(' '); }, 40); res.on('close', () => clearInterval(t)); return; }
      if (mode.startsWith('late:')) { setTimeout(() => { m.lateWrites.push({ destroyed: req.socket.destroyed }); try { res.writeHead(200, json); res.end(JSON.stringify(REPLY)); } catch { /* gone */ } }, Number(mode.slice(5))); return; }
      if (mode === 'huge') { res.writeHead(200, json); return res.end('{"pad":"' + 'x'.repeat(200_000) + '"}'); }
      if (mode === 'truncated') { res.writeHead(200, { ...json, 'content-length': '1000' }); res.write('{"a"'); setTimeout(() => req.socket.destroy(), 20); return; }
    });
  });
  server.on('connection', (s) => { m.sockets.add(s); s.on('close', () => m.sockets.delete(s)); });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  m.port = server.address().port; m.url = `http://127.0.0.1:${m.port}/v1/systemone`;
  m.close = () => new Promise((r) => { server.closeAllConnections(); server.close(r); });
  return m;
}
const mkTransport = (m, over = {}) => AD.createJevHttpTransport({ endpoint: m.url, credential: DUMMY, timeoutMs: 2000, ...over });
const plan = (id) => W.planAttempt(id);
const codeOf = async (p) => { try { await p; return null; } catch (e) { return e; } };
const bounded = (p, ms = 2500) => Promise.race([p, sleep(ms).then(() => 'HUNG')]);

function stores() {
  const root = scratch(); mkdirSync(join(root, 'ledger')); mkdirSync(join(root, 'anchor'));
  const ledgerPath = join(root, 'ledger', 'ledger.jsonl'); const cpPath = join(root, 'anchor', 'anchor.json');
  const open = () => CK.createCheckpointedLedger(W.createLedger(ledgerPath), cpPath);
  const pair = open(); pair.initialize();
  return { root, ledgerPath, cpPath, open, pair };
}
const run = (pair, id, transport, extra = {}) => W.runAttempt({ attemptId: id, ledger: pair, transport, ...extra });

// ── configuration safety ─────────────────────────────────────────────────

await check('A1-endpoint-and-credential-policy-fail-closed', () => {
  const ok = { credential: DUMMY };
  for (const endpoint of ['http://api.typesafe.ai/v1/systemone', 'https://api.typesafe.ai/v1/systemone', 'https://example.com/v1/systemone', 'http://10.0.0.5:8080/x', 'not a url', 'file:///etc/passwd']) {
    assert.throws(() => AD.createJevHttpTransport({ endpoint, ...ok }), /ADAPTER_/, endpoint);          // default: no remote at all
  }
  for (const endpoint of ['http://api.typesafe.ai/v1/systemone', 'https://api.typesafe.ai/other', 'https://api.typesafe.ai:8443/v1/systemone', 'https://evil.example/v1/systemone',
    'https://user:pw@api.typesafe.ai/v1/systemone', 'https://api.typesafe.ai/v1/systemone?x=1']) {
    assert.throws(() => AD.createJevHttpTransport({ endpoint, allowRemote: true, ...ok }), /ADAPTER_/, 'pinned: ' + endpoint);
  }
  assert.doesNotThrow(() => AD.createJevHttpTransport({ endpoint: 'https://api.typesafe.ai/v1/systemone', allowRemote: true, ...ok }));  // construction only; nothing is sent
  assert.doesNotThrow(() => AD.createJevHttpTransport({ endpoint: 'http://127.0.0.1:9/x', ...ok }));
  for (const credential of [undefined, '', 'has space', 'new\nline', 42]) {
    assert.throws(() => AD.createJevHttpTransport({ endpoint: 'http://127.0.0.1:9/x', credential }), /ADAPTER_CREDENTIAL_INVALID/, String(credential));
  }
});

await check('A1b-function-credential-is-validated-at-send-and-opens-no-connection-when-bad', async () => {
  const m = await startMock(); const p = plan('F01');
  for (const bad of ['', 'a b', 'x\ny', undefined, 7]) {
    const e = await codeOf(AD.createJevHttpTransport({ endpoint: m.url, credential: () => bad }).send(p.bodyJson, { bodyHash: p.bodyHash }));
    assert.equal(e.message, 'ADAPTER_CREDENTIAL_INVALID');
  }
  assert.equal(m.requests.length, 0);
  await m.close();
});

await check('A2-sends-the-exact-bytes-with-a-bearer-and-verifies-the-recorded-hash', async () => {
  const m = await startMock();
  const p = plan('F01');
  const out = await mkTransport(m).send(p.bodyJson, { bodyHash: p.bodyHash });
  assert.deepEqual(out, REPLY);
  const r = m.requests[0];
  assert.equal(r.method, 'POST'); assert.equal(r.url, '/v1/systemone');
  assert.equal(r.body.toString('utf8'), p.bodyJson); assert.equal(sha(r.body), p.bodyHash);
  assert.equal(r.headers.authorization, 'Bearer ' + DUMMY);
  assert.equal(r.headers['content-type'], 'application/json'); assert.equal(Number(r.headers['content-length']), r.body.length);
  assert.deepEqual(JSON.parse(r.body.toString('utf8')), p.body);                                              // nothing added, nothing changed
  // bytes that do not hash to the recorded value never reach the network
  const before = m.requests.length;
  const e = await codeOf(mkTransport(m).send(p.bodyJson + ' ', { bodyHash: p.bodyHash }));
  assert.equal(e.message, 'ADAPTER_BODY_HASH_MISMATCH'); assert.equal(m.requests.length, before);
  assert.equal((await codeOf(mkTransport(m).send('', {}))).message, 'ADAPTER_BODY_INVALID');
  await m.close();
});

// ── reply handling ───────────────────────────────────────────────────────

await check('A3-malformed-and-non-json-replies-are-refused', async () => {
  const m = await startMock();
  const p = plan('F01');
  for (const [mode, code] of [['bad-json', 'ADAPTER_BAD_JSON'], ['text', 'ADAPTER_CONTENT_TYPE'], ['huge', 'ADAPTER_RESPONSE_TOO_LARGE'], ['truncated', 'ADAPTER_RESPONSE_INCOMPLETE']]) {
    m.mode = mode;
    const e = await codeOf(mkTransport(m).send(p.bodyJson, { bodyHash: p.bodyHash }));
    assert.ok(e, mode); assert.equal(e.message, code, mode);
  }
  await m.close();
});

await check('A4-http-errors-are-single-shot-and-carry-only-a-status', async () => {
  const m = await startMock();
  const p = plan('F01'); const secrets = [];
  for (const status of [400, 401, 422, 429, 500, 503]) {
    m.mode = 'status:' + status; const before = m.requests.length;
    const e = await codeOf(mkTransport(m).send(p.bodyJson, { bodyHash: p.bodyHash }));
    assert.equal(e.message, 'ADAPTER_HTTP_ERROR'); assert.equal(e.status, status);
    assert.equal(m.requests.length, before + 1, `status ${status}: exactly one request (no retry)`);
    secrets.push(e.message, JSON.stringify(e), String(e.stack));
  }
  assert.equal(secrets.join('\n').includes('SERVER-SECRET-BODY'), false);
  await m.close();
});

await check('A5-redirects-are-refused-not-followed', async () => {
  const m = await startMock(); const p = plan('F01');
  for (const code of [301, 302, 307, 308]) {
    m.mode = 'redirect:' + code;
    const e = await codeOf(mkTransport(m).send(p.bodyJson, { bodyHash: p.bodyHash }));
    assert.equal(e.message, 'ADAPTER_REDIRECT_REFUSED', String(code));
  }
  assert.equal(m.other, 0, 'the redirect target was never contacted');
  assert.equal(m.requests.length, 4);
  await m.close();
});

// ── time, cancellation, late arrivals ────────────────────────────────────

await check('A6-deadline-covers-connection-headers-AND-the-whole-response-body', async () => {
  const m = await startMock(); const p = plan('F01');
  for (const mode of ['stall-headers', 'stall-body', 'trickle']) {
    m.mode = mode; const gone = m.clientGone; const t0 = Date.now();
    const e = await bounded(codeOf(mkTransport(m, { timeoutMs: 250 }).send(p.bodyJson, { bodyHash: p.bodyHash })));
    const dt = Date.now() - t0;
    assert.notEqual(e, 'HUNG', mode + ': the call outlived its deadline');
    assert.equal(e.message, 'ADAPTER_TIMEOUT', mode); assert.ok(dt >= 230 && dt < 1500, `${mode}: ${dt}ms`);
    await sleep(80); assert.ok(m.clientGone > gone, mode + ': socket destroyed, server saw the client leave');
  }
  await m.close();
});

await check('A7-runner-abort-signal-destroys-the-request', async () => {
  const m = await startMock(); const p = plan('F01'); m.mode = 'stall-body';
  const ac = new AbortController(); const gone = m.clientGone;
  const pending = codeOf(mkTransport(m, { timeoutMs: 30_000 }).send(p.bodyJson, { signal: ac.signal, bodyHash: p.bodyHash }));
  await sleep(120); ac.abort();
  const settled = await bounded(pending);
  assert.notEqual(settled, 'HUNG', 'the abort signal was ignored');
  assert.equal(settled.message, 'ADAPTER_ABORTED');
  await sleep(80); assert.ok(m.clientGone > gone);
  const before = m.requests.length;
  const pre = new AbortController(); pre.abort();
  assert.equal((await codeOf(mkTransport(m).send(p.bodyJson, { signal: pre.signal }))).message, 'ADAPTER_ABORTED');
  assert.equal(m.requests.length, before, 'a pre-aborted call opens no connection');
  await m.close();
});

await check('A8-late-responses-cannot-arrive-after-settlement', async () => {
  const m = await startMock(); const p = plan('F01'); m.mode = 'late:400';
  const e = await codeOf(mkTransport(m, { timeoutMs: 120 }).send(p.bodyJson, { bodyHash: p.bodyHash }));
  assert.equal(e.message, 'ADAPTER_TIMEOUT');
  await sleep(600);
  assert.equal(m.lateWrites.length, 1);
  assert.equal(m.lateWrites[0].destroyed, true, 'the socket was already destroyed when the server tried to answer late');
  await m.close();
});

// ── secrets ─────────────────────────────────────────────────────────────

await check('A9-credential-never-appears-in-errors-or-output', async () => {
  const m = await startMock(); const p = plan('F01'); const seen = [];
  const real = { log: console.log, error: console.error, warn: console.warn, info: console.info, debug: console.debug };
  for (const k of Object.keys(real)) console[k] = (...a) => seen.push(a.join(' '));
  try {
    for (const mode of ['status:401', 'bad-json', 'redirect:302', 'stall-headers', 'text']) {
      m.mode = mode;
      const e = await codeOf(mkTransport(m, { timeoutMs: 120 }).send(p.bodyJson, { bodyHash: p.bodyHash }));
      seen.push(e.message, JSON.stringify(e), String(e.stack));
    }
    const bad = await codeOf(mkTransport(m).send(p.bodyJson + 'x', { bodyHash: p.bodyHash }));
    seen.push(bad.message, String(bad.stack));
  } finally { Object.assign(console, real); }
  const text = seen.join('\n');
  assert.equal(text.includes(DUMMY), false); assert.equal(/bearer\s/i.test(text), false);
  await m.close();
});

// ── composition with the approved runner and the checkpoint ──────────────

await check('A10-composes-with-runner-and-checkpoint-for-all-31-approved-attempts', async () => {
  const m = await startMock(); const s = stores(); const snapshots = [];
  m.onRequest = () => {                                           // what the checkpoint and ledger say at the moment a request ARRIVES
    const cp = JSON.parse(readFileSync(s.cpPath, 'utf8')); const recs = W.createLedger(s.ledgerPath).read(); const last = recs[recs.length - 1];
    snapshots.push({ cpHead: cp.head, cpSeq: cp.seq, lastKind: last.kind, lastHash: last.hash, lastSeq: last.seq, wire: last.wire_body_hash });
  };
  const transport = mkTransport(m);
  for (const id of W.fixtureAttemptIds()) {
    const r = await run(s.pair, id, transport);
    assert.equal(r.outcome, 'ok', id);
    assert.equal(r.observation.p_yes, 0.25);
  }
  assert.equal(m.requests.length, 31); assert.equal(snapshots.length, 31);
  const recs = W.createLedger(s.ledgerPath).read();
  const reserved = recs.filter((r) => r.kind === 'reserved'); const observed = recs.filter((r) => r.kind === 'observed'); const settled = recs.filter((r) => r.kind === 'settled');
  assert.equal(reserved.length, 31); assert.equal(observed.length, 31); assert.equal(settled.length, 31);
  m.requests.forEach((rq, i) => {
    assert.equal(sha(rq.body), reserved[i].wire_body_hash, 'request bytes hash to the recorded pre-send hash #' + i);
    assert.equal(snapshots[i].lastKind, 'reserved'); assert.equal(snapshots[i].cpHead, snapshots[i].lastHash);
    assert.equal(snapshots[i].wire, reserved[i].wire_body_hash);
  });
  const cp = JSON.parse(readFileSync(s.cpPath, 'utf8')); assert.equal(cp.head, recs[recs.length - 1].hash);
  assert.ok(observed.every((o) => o.observation.p_yes === 0.25 && o.observation.billable_input_tokens === 300 && o.observation.output_tokens === 5));
  const cost = settled.reduce((a, r) => a + r.cost_usd, 0);
  assert.ok(Math.abs(cost - 31 * 300 * 0.042 / 1e6) < 1e-12, 'accounting: ' + cost);
  assert.equal(s.open().verify().consistent, true);
  const again = await run(s.open(), 'F01', transport);
  assert.equal(again.sent, false); assert.equal(again.reason, 'ATTEMPT_ALREADY_USED'); assert.equal(m.requests.length, 31);
  await m.close();
});

await check('A11-every-failure-mode-stops-the-experiment-without-a-duplicate-request', async () => {
  const modes = [
    ['status:500', {}], ['status:429', {}], ['bad-json', {}], ['text', {}], ['redirect:302', {}], ['truncated', {}],
    ['stall-headers', { timeoutMs: 150 }], ['stall-body', { timeoutMs: 150 }], ['trickle', { timeoutMs: 150 }],
    ['wrong-shape', {}],
  ];
  for (const [mode, over] of modes) {
    const m = await startMock(); const s = stores();
    if (mode === 'wrong-shape') m.reply = () => ({ ...REPLY, extra: true }); else m.mode = mode;
    const t = mkTransport(m, over);
    const r = await run(s.pair, 'F01', t, { timeoutMs: 2000 });
    assert.ok(['crossing_unknown', 'response_refused'].includes(r.outcome), `${mode}: ${r.outcome}`);
    const st = W.createLedger(s.ledgerPath).state();
    assert.equal(st.halted, true, mode);
    if (r.outcome === 'crossing_unknown') {
      const settled = W.createLedger(s.ledgerPath).read().find((x) => x.kind === 'settled');
      assert.equal(settled.cost_known, false, mode + ': uncertain delivery keeps its reservation');
      assert.equal(st.usd, W.BUDGET.reserve_usd, mode);
    }
    const next = await run(s.open(), 'F02', t);
    assert.equal(next.sent, false, mode); assert.equal(next.reason, 'HALTED', mode);
    assert.equal(m.requests.length, 1, `${mode}: no duplicate request and no next attempt`);
    await m.close();
  }
});

await check('A12-runner-deadline-aborts-a-slow-adapter-and-leaves-no-late-arrival', async () => {
  const m = await startMock(); const s = stores(); m.mode = 'late:500';
  const gone = m.clientGone;
  const r = await run(s.pair, 'F01', mkTransport(m, { timeoutMs: 30_000 }), { timeoutMs: 120 });   // the RUNNER's deadline fires first
  assert.equal(r.outcome, 'crossing_unknown'); assert.equal(r.reason, 'TIMEOUT');
  await sleep(700);
  assert.ok(m.clientGone > gone); assert.equal(m.lateWrites[0].destroyed, true);
  const kinds = W.createLedger(s.ledgerPath).read().map((x) => x.kind);
  assert.deepEqual(kinds, ['init', 'reserved', 'settled', 'halted']);                              // the late answer was never recorded
  assert.equal(m.requests.length, 1);
  await m.close();
});

await check('A13-adapter-stays-inactive-behind-the-committed-gate', async () => {
  const m = await startMock(); const s = stores();
  const spy = { calls: 0, send: async () => { spy.calls += 1; return REPLY; } };
  const live = CK.createCheckpointedLedger(G.createLedger(s.ledgerPath), s.cpPath);        // the COMMITTED module (witnessed: false)
  const r = await G.runAttempt({ attemptId: 'F01', ledger: live, transport: mkTransport(m) });
  assert.equal(r.sent, false); assert.equal(r.reason, 'RESPONSE_SHAPE_UNWITNESSED');
  assert.equal(m.requests.length, 0);
  assert.equal(G.RESPONSE_SHAPE.witnessed, false);
  assert.equal(spy.calls, 0);
  await m.close();
});

await check('A14-static-no-environment-no-files-no-logging-no-retry-no-live-activation', async () => {
  const src = readFileSync(AV.file, 'utf8');
  const imports = [...src.matchAll(/^import .* from '([^']+)';/gm)].map((x) => x[1]);
  for (const spec of imports) assert.ok(/^node:(http|https|crypto)$/.test(spec) || /jev-wire-v1\.mjs$/.test(spec), 'unexpected import ' + spec);
  const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  for (const banned of ['process.env', 'console.', 'fetch(', 'readFile', 'writeFile', 'setInterval', 'keepAlive', 'maxRedirects', 'followRedirect', 'redirect:', 'retry', 'allowRemote: true']) {
    assert.equal(code.includes(banned), false, 'banned token ' + banned);
  }
  const repoRoot = join(HERE, '..', '..', '..');
  const { execFileSync } = await import('node:child_process');
  let out = '';
  try { out = execFileSync('git', ['grep', '-l', 'allowRemote: true', '--', 'scripts', 'lib', 'app', 'components'], { cwd: repoRoot, encoding: 'utf8' }); } catch { /* exit 1 = no match */ }
  const hits = out.split('\n').filter(Boolean).filter((f) => !f.includes('__tests__'));
  assert.deepEqual(hits, [], 'nothing in the product tree activates the remote endpoint');
});

console.log(`\n${pass} passed · ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
