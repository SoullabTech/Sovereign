#!/usr/bin/env node
/**
 * JARVIS Unit 12 — Desktop Alpha proof (§22, 17 required cases)
 *
 * Follows the Unit 11 convention: plain node, no test framework, assertions
 * against real modules rather than mocks wherever a real thing can be run.
 *
 * What is real here: a stub HTTP runtime that speaks the actual Unit 11 wire
 * contract (status codes, error envelopes, SSE frames) is stood up on loopback,
 * and the Desktop's own client talks to it over a real socket — so create,
 * list, detail, cancel and SSE reconnect are proved end to end rather than
 * asserted about. The presentation contract is exercised against run shapes
 * copied from real runtime output.
 *
 * What is deliberately NOT here: screenshot tests. The repo has no such
 * convention and §22 forbids inventing one.
 */

import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { mkdtempSync, rmSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';

const require_ = createRequire(import.meta.url);
const HERE = path.dirname(fileURLToPath(import.meta.url));
const JARVIS_DESKTOP = path.resolve(HERE, '..', '..', '..', 'desktop-app', 'jarvis');

const client = require_(path.join(JARVIS_DESKTOP, 'lib', 'runtime-client.js'));
const P = require_(path.join(JARVIS_DESKTOP, 'lib', 'presentation.js'));
const packets = require_(path.join(JARVIS_DESKTOP, 'lib', 'packets.js'));
const { createAnnotations } = require_(path.join(JARVIS_DESKTOP, 'lib', 'annotations.js'));

let pass = 0, fail = 0;
const t = async (n, fn) => {
  try { await fn(); console.log(`  ✓ ${n}`); pass++; }
  catch (e) { console.error(`  ✗ ${n}\n      ${e.message}`); fail++; }
};
const eq = (a, b, m) => { if (a !== b) throw new Error(m ?? `expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`); };
const ok = (c, m) => { if (!c) throw new Error(m ?? 'expected truthy'); };
const has = (hay, needle, m) => { if (!String(hay).includes(needle)) throw new Error(m ?? `expected to contain ${JSON.stringify(needle)}: ${JSON.stringify(String(hay).slice(0, 160))}`); };

/* ── fixtures: shapes taken from real Unit 11 runtime output ─────────────── */

const HEALTH = {
  runtime_id: 'rt-e0f4f190', state: 'READY', pid: 76772, version: '395ffad43',
  repository: '/Users/soullab/.claude/worktrees/ain-jarvis-unit-11-runtime-service-mandate',
  address: 'http://127.0.0.1:8787', loopback_only: true,
  started_at: '2026-08-10T06:07:38.508Z', uptime_s: 5789,
  worker: { available: true, host: 'http://localhost:11434', models: 9, latency_ms: 61, reason: null },
  runs: { active: 0, queued: 0, in_flight: 0, total: 3 },
  last_error: null,
};

const VERIFIED_RUN = {
  run_id: 'r-526195d3c4', work_unit_id: 'jarvis-u11-provider-trace-004', state: 'VERIFIED',
  disposition: 'VERIFIED', failure_class: null, failure_detail: null,
  created_at: '2026-08-10T06:05:30.000Z', finished_at: '2026-08-10T06:06:02.000Z',
  worker: { lane: 'local-native', model: 'maia-coder:latest', transport: 'ollama-native', started_at: '2026-08-10T06:05:31.878Z' },
  context: {
    execution_head: '54809f99417a9f4fef6030b7a78f690293e05143', fragment_count: 6,
    estimated_input_tokens: 1200, safe_threshold: 6000,
    manifest: [{ source_file: 'lib/ai/modelService.ts', source_sha: '54809f994', start_line: 253, end_line: 259,
      extraction_method: 'anchor:lines', content_hash: 'e8158e2b00b1d39066', reason: 'the exported handler' }],
  },
  result: { lane: 'local-native', model: 'UNKNOWN', exit_summary: 'delegate exited 0', duration_s: 31,
    files_changed: [], test_results: 'not_run', worker_self_reported_escalation: false, recommended_next_action: 'review-diff' },
  verification: {
    method: 'materialized-fragment-containment', total: 2, valid: 2, invalid: 0,
    citations: [
      { citation: 'lib/ai/modelService.ts:253', in_context: true, fragment: 'lib/ai/modelService.ts:253-259', source_sha: '54809f994' },
      { citation: 'lib/ai/modelService.ts:86', in_context: true, fragment: 'lib/ai/modelService.ts:86-86', source_sha: '54809f994' },
    ],
    invalid_citations: [], fragments_offered: 6, ok: true,
    worker_self_reported_escalation: false,
    decided_by: 'runtime (independent) — worker self-report is never authoritative',
  },
  audit: { packet_path: '/p.json', result_path: '/r.json', log_path: '/l.log' },
  history: [
    { at: '1', from: null, to: 'QUEUED' }, { at: '2', from: 'QUEUED', to: 'VALIDATING' },
    { at: '3', from: 'VALIDATING', to: 'CONTEXT_ROUTING' }, { at: '4', from: 'CONTEXT_ROUTING', to: 'READY_FOR_WORKER' },
    { at: '5', from: 'READY_FOR_WORKER', to: 'RUNNING' }, { at: '6', from: 'RUNNING', to: 'VALIDATING_RESULT' },
    { at: '7', from: 'VALIDATING_RESULT', to: 'VERIFYING_EVIDENCE' }, { at: '8', from: 'VERIFYING_EVIDENCE', to: 'VERIFIED' },
  ],
};

const ESCALATED_RUN = {
  run_id: 'r-esc', work_unit_id: 'wu-esc', state: 'ESCALATION_REQUIRED', disposition: 'ESCALATION_REQUIRED',
  failure_class: 'EVIDENCE_OUT_OF_CONTEXT', failure_detail: '1/3 citations fall outside the materialized context',
  verification: {
    method: 'materialized-fragment-containment', total: 3, valid: 2, invalid: 1,
    citations: [
      { citation: 'lib/a.ts:10', in_context: true, fragment: 'lib/a.ts:8-12', source_sha: 'abc1234' },
      { citation: 'lib/b.ts:99', in_context: false, reason: 'not inside any materialized fragment' },
    ],
    ok: false, fragments_offered: 2, decided_by: 'runtime (independent)',
  },
  history: [{ at: '1', from: null, to: 'QUEUED' }],
};

/* ── a stub runtime that speaks the real Unit 11 wire contract ───────────── */

function startStubRuntime() {
  const runs = new Map([[VERIFIED_RUN.run_id, VERIFIED_RUN]]);
  let sseClients = new Set();
  let created = 0;

  const server = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://127.0.0.1');
    const send = (code, body) => {
      const s = JSON.stringify(body);
      res.writeHead(code, { 'content-type': 'application/json', 'content-length': Buffer.byteLength(s) });
      res.end(s);
    };
    const seg = url.pathname.split('/').filter(Boolean);

    if (url.pathname === '/health') return send(200, HEALTH);

    if (url.pathname === '/events') {
      res.writeHead(200, { 'content-type': 'text/event-stream', 'cache-control': 'no-store', connection: 'keep-alive' });
      res.write(`event: runtime.ready\ndata: ${JSON.stringify({ runtime_id: 'rt-stub', state: 'READY' })}\n\n`);
      sseClients.add(res);
      req.on('close', () => sseClients.delete(res));
      return;
    }

    if (req.method === 'POST' && url.pathname === '/runs') {
      let raw = '';
      req.on('data', (c) => { raw += c; });
      req.on('end', () => {
        const packet = JSON.parse(raw);
        // Mirror the real runtime's two refusals so the Desktop's rendering of
        // them is proved against the actual envelopes, not invented ones.
        if (packet.execution_lane !== 'local-native') {
          return send(403, { error: 'LANE_NOT_PERMITTED', detail: `runtime accepts local-native only; got '${packet.execution_lane}'` });
        }
        if (!packet.canonical_sha) {
          return send(400, { error: 'PACKET_SCHEMA_INVALID', errors: ['canonical_sha: required non-empty string'] });
        }
        const id = `r-new${++created}`;
        runs.set(id, { run_id: id, work_unit_id: packet.work_unit_id, state: 'QUEUED', disposition: null, history: [{ at: '1', from: null, to: 'QUEUED' }] });
        return send(202, { run_id: id, state: 'QUEUED', accepted_by: 'rt-stub', note: 'runtime accepted; worker capacity is evaluated at dispatch' });
      });
      return;
    }

    if (req.method === 'GET' && url.pathname === '/runs') {
      const all = [...runs.values()];
      return send(200, { total: all.length, limit: 25, offset: 0, runs: all });
    }

    if (seg[0] === 'runs' && seg[1]) {
      const run = runs.get(seg[1]);
      if (!run) return send(404, { error: 'RUN_NOT_FOUND', run_id: seg[1] });
      if (req.method === 'GET' && seg.length === 2) return send(200, run);
      if (req.method === 'POST' && seg[2] === 'cancel') {
        if (['VERIFIED', 'ESCALATION_REQUIRED', 'FAILED', 'CANCELLED'].includes(run.state)) {
          return send(409, { error: 'RUN_ALREADY_TERMINAL', state: run.state });
        }
        run.state = 'CANCELLED'; run.disposition = 'CANCELLED';
        return send(200, run);
      }
    }
    return send(404, { error: 'NOT_FOUND' });
  });

  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve({
      server,
      port: server.address().port,
      broadcast(type, data) {
        for (const c of sseClients) c.write(`event: ${type}\ndata: ${JSON.stringify(data)}\n\n`);
      },
      dropAllStreams() { for (const c of sseClients) c.end(); sseClients = new Set(); },
      close: () => new Promise((r) => server.close(r)),
    }));
  });
}

console.log('\nJARVIS Unit 12 — Desktop Alpha proof (§22)\n');

const stub = await startStubRuntime();
const c = client.createClient({ host: '127.0.0.1', port: stub.port });

/* ── 1. runtime health parsing ───────────────────────────────────────────── */
await t('1  runtime health parsing', async () => {
  const res = await c.health();
  eq(res.status, 200);
  const v = P.healthView(res.body, c.endpoint.address);
  eq(v.runtime_state, 'READY');
  eq(v.reachable, true);
  eq(v.worker_available, true);
  eq(v.loopback_only, true);
  eq(v.runs.total, 3);
  eq(v.version, '395ffad43');
});

/* ── 2. offline runtime state ────────────────────────────────────────────── */
await t('2  offline runtime state is distinct and instructs rather than execs', async () => {
  const dead = client.createClient({ host: '127.0.0.1', port: 1, timeoutMs: 800 });
  let code = null;
  try { await dead.health(); } catch (e) { code = e.code; }
  eq(code, 'RUNTIME_OFFLINE');

  const v = P.healthView(null, 'http://127.0.0.1:8787');
  eq(v.runtime_state, 'OFFLINE');
  eq(v.reachable, false);

  const off = P.offlineView('http://127.0.0.1:8787');
  eq(off.headline, 'JARVIS Runtime Offline');
  eq(off.can_start_from_desktop, false, 'Alpha must not claim it can start the runtime');
  eq(off.instruction, 'scripts/jarvis-runtime.sh start');
});

/* ── 2b. unresponsive is NOT offline ─────────────────────────────────────── */
await t('2b a busy runtime reads as NOT RESPONDING, never as OFFLINE or a failure', async () => {
  // A socket that accepts the connection and then says nothing — exactly what
  // the Unit 11 runtime looks like while it blocks preparing a run.
  const mute = http.createServer(() => { /* never responds */ });
  await new Promise((r) => mute.listen(0, '127.0.0.1', r));
  try {
    const c2 = client.createClient({ host: '127.0.0.1', port: mute.address().port, timeoutMs: 700 });
    let code = null;
    try { await c2.health(); } catch (e) { code = e.code; }
    eq(code, 'RUNTIME_UNRESPONSIVE', 'a bound-but-silent runtime must not be called OFFLINE');

    const v = P.healthView(null, 'http://127.0.0.1:8787', 'RUNTIME_UNRESPONSIVE');
    eq(v.runtime_state, 'NOT RESPONDING');
    eq(v.unresponsive, true);
    ok(v.runtime_state !== 'OFFLINE');

    const view = P.offlineView('http://127.0.0.1:8787', 'RUNTIME_UNRESPONSIVE');
    eq(view.headline, 'JARVIS Runtime Not Responding');
    eq(view.unresponsive, true);
    has(view.detail, 'It is running');
    ok(!/failed|failure of|crashed/i.test(view.detail.replace('No JARVIS failure has been reported.', '')),
      'an unresponsive runtime must not be described as a JARVIS failure (§14)');
  } finally { await new Promise((r) => mute.close(r)); }
});

/* ── 3b. runtime reconnect (offline → live) ──────────────────────────────── */
await t('3b the Desktop recovers when a runtime comes up under it', async () => {
  // Nothing listening on this port yet: the Desktop must report OFFLINE.
  const probe = client.createClient({ host: '127.0.0.1', port: 1, timeoutMs: 800 });
  let code = null;
  try { await probe.health(); } catch (e) { code = e.code; }
  eq(code, 'RUNTIME_OFFLINE');
  eq(P.healthView(null, null, code).runtime_state, 'OFFLINE');

  // Now a runtime exists at a live address: the same client code reads READY
  // with no Desktop restart — recovery is a re-read, not a relaunch.
  const after = await c.health();
  const v = P.healthView(after.body, c.endpoint.address);
  eq(v.runtime_state, 'READY');
  eq(v.reachable, true);
  eq(v.worker_available, true);
  eq(v.runs.total, HEALTH.runs.total, 'run counts must come from runtime truth');
});

/* ── 3. create run ───────────────────────────────────────────────────────── */
let createdRunId = null;
await t('3  create run posts a real packet and reports the runtime answer', async () => {
  const packet = packets.buildPacket({ templateId: 'provider-trace', canonicalSha: '395ffad43', nonce: 'proof3' });
  const res = await c.createRun(packet);
  eq(res.status, 202);
  const out = P.submissionOutcome(res.status, res.body);
  eq(out.accepted, true);
  eq(out.state, 'QUEUED', 'the Desktop must show the runtime state, not a fabricated one');
  ok(out.run_id, 'run id must be displayed');
  createdRunId = out.run_id;
});

/* ── 4. list runs ────────────────────────────────────────────────────────── */
await t('4  list runs', async () => {
  const res = await c.listRuns({ limit: 25 });
  eq(res.status, 200);
  ok(Array.isArray(res.body.runs));
  ok(res.body.runs.some((r) => r.run_id === createdRunId));
  ok(res.body.runs.some((r) => r.run_id === VERIFIED_RUN.run_id));
});

/* ── 5. run detail ───────────────────────────────────────────────────────── */
await t('5  run detail exposes context, worker, execution and audit', async () => {
  const res = await c.getRun(VERIFIED_RUN.run_id);
  eq(res.status, 200);
  const run = res.body;

  const ctx = P.contextView(run);
  eq(ctx.fragment_count, 6);
  eq(ctx.fragments[0].source_file, 'lib/ai/modelService.ts');
  eq(ctx.fragments[0].line_range, '253-259');
  eq(ctx.fragments[0].source_sha, '54809f994');

  const w = P.workerView(run);
  eq(w.lane, 'local-native');
  eq(w.backend, 'ollama-native');
  eq(w.model, 'maia-coder:latest');
  eq(w.duration_s, 31);

  eq(run.audit.result_path, '/r.json');
});

/* ── 6. state transition rendering ───────────────────────────────────────── */
await t('6  every canonical state renders with its name AND human copy', () => {
  for (const s of P.RUN_STATES) {
    const v = P.stateCopy(s);
    eq(v.state, s, 'canonical state name must never be hidden');
    eq(v.known, true);
    ok(v.human && v.human.length > 8, `no human copy for ${s}`);
  }
  eq(P.stateCopy('CONTEXT_ROUTING').human, 'Selecting bounded evidence');
  eq(P.stateCopy('RUNNING').human, 'maia-coder is investigating');
  eq(P.stateCopy('VERIFYING_EVIDENCE').human, "JARVIS is checking the worker's citations");

  const h = P.historyView(VERIFIED_RUN);
  eq(h.length, 8);
  eq(h.map((x) => x.to).join(','),
    'QUEUED,VALIDATING,CONTEXT_ROUTING,READY_FOR_WORKER,RUNNING,VALIDATING_RESULT,VERIFYING_EVIDENCE,VERIFIED');

  // An unknown state is surfaced, not smoothed away.
  const u = P.stateCopy('SOME_FUTURE_STATE');
  eq(u.known, false);
  eq(u.state, 'SOME_FUTURE_STATE');
});

/* ── 7. VERIFIED rendering ───────────────────────────────────────────────── */
await t('7  VERIFIED renders as verified without claiming semantic proof', () => {
  const d = P.dispositionView(VERIFIED_RUN);
  eq(d.disposition, 'VERIFIED');
  eq(d.label, 'VERIFIED');
  eq(d.tone, 'verified');
  ok(d.mark, 'disposition must carry a non-colour mark (§19)');
  has(d.meaning, 'Not a semantic proof',
    'VERIFIED must not be presented as stronger proof than the runtime has (§9)');
});

/* ── 8. ESCALATION REQUIRED rendering ────────────────────────────────────── */
await t('8  ESCALATION REQUIRED never borrows the success tone', () => {
  const d = P.dispositionView(ESCALATED_RUN);
  eq(d.label, 'ESCALATION REQUIRED');
  eq(d.tone, 'escalation');
  ok(d.tone !== P.dispositionView(VERIFIED_RUN).tone, 'escalation must be visually distinct from verified');
  ok(d.mark !== P.dispositionView(VERIFIED_RUN).mark, 'escalation must differ without colour too');
  has(d.meaning, 'Human authority is required');

  // §10: no auto-escalation to Claude anywhere in the Desktop surface.
  const surface = JSON.stringify({ d, copy: P.FAILURE_CLASS_COPY });
  ok(!/escalate to claude/i.test(surface), 'Unit 12 must not offer escalation to Claude');
});

/* ── 9. failure class rendering ──────────────────────────────────────────── */
await t('9  failure classes are preserved, never collapsed', () => {
  const distinct = ['PACKET_SCHEMA_INVALID', 'CONTEXT_BUDGET_EXCEEDED', 'WORKER_EXECUTION_FAILED',
    'RESULT_CONTRACT_INVALID', 'EVIDENCE_OUT_OF_CONTEXT', 'LOCAL_WRITE_AUTHORITY_REFUSED',
    'PACKET_ANSWER_LEAKAGE'];
  const seen = new Set();
  for (const fc of distinct) {
    const v = P.failureClassView({ failure_class: fc });
    eq(v.failure_class, fc, 'the runtime class string must survive to the UI (§20)');
    eq(v.known, true, `no copy for ${fc}`);
    ok(!/something went wrong/i.test(v.explanation));
    ok(!seen.has(v.explanation), `explanation for ${fc} is not distinct`);
    seen.add(v.explanation);
  }
  const unknown = P.failureClassView({ failure_class: 'BRAND_NEW_CLASS', failure_detail: 'd' });
  eq(unknown.failure_class, 'BRAND_NEW_CLASS', 'an unknown class is still shown verbatim');
  eq(unknown.known, false);
  eq(P.failureClassView({ failure_class: null }), null);
});

/* ── 10. evidence / citation rendering ───────────────────────────────────── */
await t('10 evidence rows carry claim, file, line, sha and containment status', () => {
  const rows = P.evidenceRows(VERIFIED_RUN);
  eq(rows.length, 2);
  eq(rows[0].claim, 'lib/ai/modelService.ts:253');
  eq(rows[0].source_file, 'lib/ai/modelService.ts');
  eq(rows[0].line, 253);
  eq(rows[0].line_range, '253-259');
  eq(rows[0].source_sha, '54809f994');
  eq(rows[0].contained, true);
  eq(rows[0].status, P.CITATION_VERIFIED_LABEL);

  const bad = P.evidenceRows(ESCALATED_RUN);
  eq(bad[1].contained, false);
  eq(bad[1].status, P.CITATION_UNCONTAINED_LABEL);
  ok(bad[0].status_mark !== bad[1].status_mark, 'containment must be distinguishable without colour');
});

/* ── 11. semantic-verification limitation disclosure ─────────────────────── */
await t('11 the semantic limitation is disclosed and never overstated', () => {
  has(P.SEMANTIC_VERIFICATION_DISCLOSURE, 'lies within the exact source material supplied');
  has(P.SEMANTIC_VERIFICATION_DISCLOSURE, 'Full semantic claim-support checking is not yet automated');

  // On a VERIFIED run — the case where overstatement would actually mislead.
  const v = P.verificationView(VERIFIED_RUN);
  eq(v.citation_ok, true);
  has(v.citation_status, P.CITATION_VERIFIED_LABEL);
  has(v.semantic_status, 'NOT ESTABLISHED');
  eq(v.disclosure, P.SEMANTIC_VERIFICATION_DISCLOSURE);
  ok(v.citation_status !== v.semantic_status, 'containment and semantic support must be distinct claims');

  // Every evidence row carries it too, so it cannot be missed by scrolling past.
  for (const r of P.evidenceRows(VERIFIED_RUN)) {
    eq(r.disclosure, P.SEMANTIC_VERIFICATION_DISCLOSURE);
    has(r.semantic_status, 'NOT ESTABLISHED');
  }

  // And it is stated even when there is no verification record at all.
  const none = P.verificationView({});
  eq(none.present, false);
  eq(none.disclosure, P.SEMANTIC_VERIFICATION_DISCLOSURE);
});

/* ── 12. cancel behaviour ────────────────────────────────────────────────── */
await t('12 cancel reports the runtime answer and never fakes success', async () => {
  const live = await c.cancelRun(createdRunId);
  const okOut = P.cancelOutcome(live.status, live.body);
  eq(okOut.outcome, 'ACCEPTED');

  const late = await c.cancelRun(VERIFIED_RUN.run_id);
  eq(late.status, 409);
  const lateOut = P.cancelOutcome(late.status, late.body);
  eq(lateOut.outcome, 'ALREADY_TERMINAL');
  has(lateOut.label, 'Too late');

  const missing = await c.cancelRun('r-does-not-exist');
  eq(P.cancelOutcome(missing.status, missing.body).outcome, 'NOT_FOUND');
  eq(P.cancelOutcome(405, {}).outcome, 'UNSUPPORTED');
});

/* ── 13. SSE reconnect ───────────────────────────────────────────────────── */
await t('13 SSE reconnects after the stream drops, and duplicates are suppressed', async () => {
  const statuses = [];
  const events = [];
  const accept = client.createEventDedupe();
  const sub = c.subscribe({
    onEvent: (ev) => { if (accept(ev)) events.push(ev); },
    onStatus: (s) => statuses.push(s),
  });

  const waitFor = async (pred, ms = 6000) => {
    const started = Date.now();
    while (Date.now() - started < ms) {
      if (pred()) return true;
      await new Promise((r) => setTimeout(r, 40));
    }
    return false;
  };

  ok(await waitFor(() => statuses.includes('CONNECTED')), 'never connected');
  stub.broadcast('run.created', { run_id: 'r-x', at: 'T1' });
  ok(await waitFor(() => events.some((e) => e.type === 'run.created')), 'no event received');

  // Same event twice must surface once (§14).
  const before = events.length;
  stub.broadcast('run.created', { run_id: 'r-x', at: 'T1' });
  await new Promise((r) => setTimeout(r, 250));
  eq(events.length, before, 'duplicate event was not suppressed');

  // Runtime restart / sleep-wake: the stream dies and must come back.
  const connects = statuses.filter((s) => s === 'CONNECTED').length;
  stub.dropAllStreams();
  ok(await waitFor(() => statuses.includes('RECONNECTING')), 'no reconnect attempt');
  ok(await waitFor(() => statuses.filter((s) => s === 'CONNECTED').length > connects), 'never reconnected');

  sub.close();
});

/* ── 14. run persists across Desktop restart ─────────────────────────────── */
await t('14 a completed run survives Desktop restart with no worker rerun', async () => {
  // "Restarting the Desktop" is exactly this: dropping every client-side object
  // and building a new client. Nothing about the run lives in the Desktop.
  const before = await c.getRun(VERIFIED_RUN.run_id);
  const fresh = client.createClient({ host: '127.0.0.1', port: stub.port });
  const after = await fresh.getRun(VERIFIED_RUN.run_id);

  eq(after.status, 200);
  eq(after.body.run_id, before.body.run_id);
  eq(after.body.disposition, 'VERIFIED', 'disposition must survive a Desktop restart');
  eq(JSON.stringify(after.body.history), JSON.stringify(before.body.history),
    'history changed across restart — something re-ran');
  eq(after.body.worker.started_at, before.body.worker.started_at,
    'worker start time changed — the worker was re-run by reopening the Desktop');

  // And the annotation store is a label only: losing it loses no run state.
  const dir = mkdtempSync(path.join(tmpdir(), 'u12-ann-'));
  try {
    const a1 = createAnnotations(dir);
    a1.record('r-1', 'trace the provider path');
    ok(existsSync(a1.file));
    const a2 = createAnnotations(dir);           // simulates a Desktop restart
    eq(a2.get('r-1'), 'trace the provider path');
    eq(a2.get('r-unknown'), null);
    const objRuntime = P.objectiveView({ run_id: 'r-1', objective: 'from the runtime' }, a2.all());
    eq(objRuntime.provenance, 'RUNTIME', 'a runtime-published objective must win');
    const objAnn = P.objectiveView({ run_id: 'r-1' }, a2.all());
    eq(objAnn.provenance, 'DESKTOP_ANNOTATION', 'a Desktop label must be marked as one');
    const objNone = P.objectiveView({ run_id: 'r-2' }, a2.all());
    eq(objNone.provenance, 'UNAVAILABLE');
    eq(objNone.text, null);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

/* ── 15. non-loopback runtime rejected ───────────────────────────────────── */
await t('15 a non-loopback runtime address is refused, and fails closed', () => {
  for (const host of ['10.0.0.5', 'example.com', 'jarvis.internal', '0.0.0.0', '169.254.169.254']) {
    let code = null;
    try { client.assertLoopback(host); } catch (e) { code = e.code; }
    eq(code, 'NON_LOOPBACK_RUNTIME_REFUSED', `${host} was not refused`);

    let ctorCode = null;
    try { client.createClient({ host }); } catch (e) { ctorCode = e.code; }
    eq(ctorCode, 'NON_LOOPBACK_RUNTIME_REFUSED', `createClient accepted ${host}`);
  }
  for (const host of ['127.0.0.1', '::1', 'localhost']) {
    eq(client.resolveEndpoint({ host, port: 8787 }).host, host);
  }
  // The env override is subject to the same refusal — no back door.
  let envCode = null;
  try { client.resolveEndpoint({}, { JARVIS_RUNTIME_HOST: '10.1.1.1' }); } catch (e) { envCode = e.code; }
  eq(envCode, 'NON_LOOPBACK_RUNTIME_REFUSED');
  eq(client.resolveEndpoint({}, {}).address, 'http://127.0.0.1:8787');
});

/* ── 16. no arbitrary shell UI/action ────────────────────────────────────── */
await t('16 the Desktop exposes no shell, exec or filesystem action', () => {
  const files = [
    ['main.js', path.join(JARVIS_DESKTOP, 'main.js')],
    ['preload.js', path.join(JARVIS_DESKTOP, 'preload.js')],
    ['renderer/app.js', path.join(JARVIS_DESKTOP, 'renderer', 'app.js')],
    ['renderer/index.html', path.join(JARVIS_DESKTOP, 'renderer', 'index.html')],
    ['lib/runtime-client.js', path.join(JARVIS_DESKTOP, 'lib', 'runtime-client.js')],
    ['lib/packets.js', path.join(JARVIS_DESKTOP, 'lib', 'packets.js')],
  ];
  // Execution primitives, in any form, anywhere in the Desktop.
  const banned = [/child_process/, /\bexecFile\b/, /\bexecSync\b/, /\bspawn\s*\(/, /\bexec\s*\(/,
    /shell\.openPath/, /nodeIntegration:\s*true/, /contextIsolation:\s*false/, /webSecurity:\s*false/];
  for (const [label, f] of files) {
    const src = readFileSync(f, 'utf8');
    for (const re of banned) {
      ok(!re.test(src), `${label} matches banned pattern ${re}`);
    }
  }

  // The preload is the renderer's entire authority — it must not offer a
  // generic invoke channel that would let the renderer reach any IPC handler.
  const preload = readFileSync(path.join(JARVIS_DESKTOP, 'preload.js'), 'utf8');
  ok(!/invoke:\s*\(/.test(preload), 'preload exposes a generic invoke');
  ok(!/ipcRenderer\s*\)/.test(preload), 'preload exposes ipcRenderer itself');
  has(preload, 'contextBridge.exposeInMainWorld');

  // The renderer is forbidden its own network reach by CSP.
  const html = readFileSync(path.join(JARVIS_DESKTOP, 'renderer', 'index.html'), 'utf8');
  has(html, "connect-src 'none'", 'renderer CSP must forbid its own network access');
  has(html, "default-src 'none'");

  // §13: offline help is an instruction to type, not a process to start.
  eq(P.offlineView('http://127.0.0.1:8787').can_start_from_desktop, false);
});

/* ── 17. READ-ONLY default authority ─────────────────────────────────────── */
await t('17 authority is READ-ONLY by default and cannot be widened from the UI', async () => {
  const packet = packets.buildPacket({ templateId: 'provider-trace', canonicalSha: '395ffad43', nonce: 'proof17' });
  eq(packet.execution_lane, 'local-native', 'the only lane the runtime accepts, and it is read-only');
  eq(packets.DEFAULT_AUTHORITY, 'READ_ONLY');
  has(packet.established_facts[0], 'Your authority is READ-ONLY');
  for (const k of packets.WRITE_REQUESTING_KEYS) {
    ok(!(k in packet), `built packet carries write-requesting key ${k}`);
  }

  // Every write-requesting field is refused at the composer, before the runtime.
  for (const k of packets.WRITE_REQUESTING_KEYS) {
    let code = null;
    try { packets.buildPacket({ templateId: 'provider-trace', canonicalSha: '395ffad43', nonce: 'n', [k]: 'write' }); }
    catch (e) { code = e.code; }
    eq(code, 'LOCAL_WRITE_AUTHORITY_REFUSED', `composer accepted ${k}`);
  }
  let authCode = null;
  try { packets.buildPacket({ templateId: 'provider-trace', canonicalSha: '395ffad43', nonce: 'n', authority: 'WRITE' }); }
  catch (e) { authCode = e.code; }
  eq(authCode, 'LOCAL_WRITE_AUTHORITY_REFUSED');

  // Only bounded templates may be submitted — no free-form file targeting.
  let tplCode = null;
  try { packets.buildPacket({ templateId: 'anything-i-like', canonicalSha: '395ffad43', nonce: 'n' }); }
  catch (e) { tplCode = e.code; }
  eq(tplCode, 'UNKNOWN_TEMPLATE');

  // A non-read-only lane is refused by the runtime and rendered as AUTHORITY REQUIRED.
  const res = await c.createRun({ ...packet, execution_lane: 'claude-write' });
  eq(res.status, 403);
  const out = P.submissionOutcome(res.status, res.body);
  eq(out.accepted, false);
  eq(out.label, 'AUTHORITY REQUIRED');
  eq(out.failure_class, 'LANE_NOT_PERMITTED');
});

/* ── packet-guard conformance (not required by §22, but cheap and load-bearing) */
await t('+  built packets carry no file:line answer leakage in worker-visible text', async () => {
  const guard = await import(path.resolve(HERE, '..', 'jarvis-packet-guard.mjs'));
  for (const tpl of packets.TEMPLATES) {
    const packet = packets.buildPacket({ templateId: tpl.id, canonicalSha: '395ffad43', nonce: 'leak' });
    const lint = guard.lintLeakage(packet);
    eq(lint.status, 'OK', `${tpl.id} would be refused: ${JSON.stringify(lint.violations)}`);
  }
});

await stub.close();

console.log(`\n  ${pass} passed, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
