#!/usr/bin/env node
/**
 * JARVIS Unit 11 — persistent local runtime service
 * ═══════════════════════════════════════════════════════════════════════════
 * The operating doorway to the Units 7–10 control plane. Starting JARVIS no
 * longer requires opening Claude Code: this process runs on loopback, accepts a
 * bounded work packet over HTTP, and drives the proven pipeline through the seam
 * in jarvis-runtime-pipeline.mjs. It holds no delegation logic of its own.
 *
 *   lifecycle   STARTING · READY · DEGRADED · STOPPING · STOPPED
 *   API         GET /health · POST /runs · GET /runs · GET /runs/:id
 *               POST /runs/:id/cancel · GET /events (SSE)
 *   boundary    loopback only · JSON only · 256 KB cap · schema-validated packets
 *               no shell endpoint · no exec endpoint · no filesystem-path endpoint
 *
 * Usage:  jarvis-runtime.mjs start [--port 8787] [--host 127.0.0.1]
 *         jarvis-runtime.mjs status
 */

import http from 'node:http';
import { execFile, execFileSync } from 'node:child_process';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import {
  initStore, newRunId, nowISO, saveRun, loadRun, listRuns, appendEvent,
  writeRuntimeRecord, readRuntimeRecord, clearRuntimeRecord, reconcileOrphanedRuns,
} from './jarvis-runtime-store.mjs';
import {
  executeRun, isLegalTransition, RUN_STATES, TERMINAL_STATES, REPO_ROOT,
  validatePacket, checkAuthority,
} from './jarvis-runtime-pipeline.mjs';
import {
  admitRequest, publicAdmission, objectiveView, ADMISSION,
} from './jarvis-principal.mjs';

/**
 * §5/§6 — when set, a bare packet is no longer mapped to the local operator and
 * every request must declare a principal. Off by default so existing operator
 * tooling (the Unit 12 Desktop) keeps working; this is the switch a future
 * bridge deployment turns on.
 */
const REQUIRE_PRINCIPAL = process.env.JARVIS_REQUIRE_PRINCIPAL === '1';

// ── §3 local-only boundary ───────────────────────────────────────────────────
/** Loopback literals only. A hostname is not evidence of a loopback interface. */
export const LOOPBACK_HOSTS = new Set(['127.0.0.1', '::1', 'localhost']);

export function assertLoopback(host) {
  if (!LOOPBACK_HOSTS.has(String(host))) {
    const e = new Error(`NON_LOOPBACK_BIND_REFUSED: refusing to bind '${host}'. ` +
      `Unit 11 is local-only; external exposure requires an explicit governance unit.`);
    e.code = 'NON_LOOPBACK_BIND_REFUSED';
    throw e;
  }
  return host;
}

export const MAX_BODY_BYTES = Number(process.env.JARVIS_RUNTIME_MAX_BODY || 256 * 1024);
const QUEUE_POLL_MS = Number(process.env.JARVIS_RUNTIME_QUEUE_POLL_MS || 10_000);
const EVENT_BUFFER = 500;
const IN_FLIGHT = ['VALIDATING', 'CONTEXT_ROUTING', 'READY_FOR_WORKER', 'RUNNING',
  'VALIDATING_RESULT', 'VERIFYING_EVIDENCE'];

const version = () => {
  try {
    return execFileSync('git', ['-C', REPO_ROOT, 'rev-parse', '--short', 'HEAD'],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch { return 'unknown'; }
};

const workerHealth = () => new Promise((resolve) => {
  execFile('node', [path.join(REPO_ROOT, 'scripts', 'builder', 'jarvis-local-worker.mjs'), 'health'],
    { timeout: 15000 }, (err, stdout) => {
      try {
        const j = JSON.parse(stdout);
        // Model names are local inventory, not secrets — but the count is all the API needs.
        resolve({ available: !!j.ok, host: j.host ?? null, models: (j.models || []).length,
                  latency_ms: j.latency_ms ?? null, reason: j.ok ? null : (j.reason ?? 'unavailable') });
      } catch {
        resolve({ available: false, host: null, models: 0, latency_ms: null,
                  reason: err ? 'worker health probe failed' : 'unparseable health output' });
      }
    });
});

/**
 * `spawnDelegate` is the proof harness's only injection point (see
 * __tests__/jarvis-runtime-proof.mjs). Omitted in every real invocation, where the
 * pipeline spawns scripts/ain-delegate.sh itself.
 */
export function createRuntime({ host = '127.0.0.1', port = 8787, spawnDelegate = undefined } = {}) {
  assertLoopback(host);
  initStore();

  const rt = {
    runtime_id: `rt-${randomBytes(4).toString('hex')}`,
    pid: process.pid,
    state: 'STARTING',
    started_at: nowISO(),
    version: version(),
    repository: REPO_ROOT,
    host, port,
    last_error: null,
    worker: { available: false, reason: 'not probed yet' },
  };

  const events = [];            // bounded ring buffer, telemetry only
  const subscribers = new Set(); // SSE responses
  const children = new Map();    // run_id -> child process (for §4 cancel)
  const cancelled = new Set();
  const queue = [];              // run ids awaiting dispatch
  let active = null;             // one worker at a time; Builder capacity is the real gate
  let pollTimer = null;

  function emit(type, data = {}) {
    const ev = appendEvent({ type, runtime_id: rt.runtime_id, ...data });
    events.push(ev);
    if (events.length > EVENT_BUFFER) events.shift();
    const frame = `event: ${type}\ndata: ${JSON.stringify(ev)}\n\n`;
    for (const res of subscribers) { try { res.write(frame); } catch { subscribers.delete(res); } }
    return ev;
  }

  function transition(run, state, patch = {}) {
    if (!RUN_STATES.includes(state)) throw new Error(`unknown run state '${state}'`);
    if (run.state !== state && !isLegalTransition(run.state, state)) {
      const err = new Error(`ILLEGAL_TRANSITION ${run.state} → ${state}`);
      emit('run.illegal_transition', { run_id: run.run_id, from: run.state, to: state });
      throw err;
    }
    const from = run.state;
    run.state = state;
    Object.assign(run, patch);
    run.history = run.history || [];
    run.history.push({ at: nowISO(), from, to: state, ...(patch.failure_class ? { failure_class: patch.failure_class } : {}) });
    if (TERMINAL_STATES.includes(state)) run.finished_at = nowISO();
    saveRun(run);
    emit('run.state_changed', { run_id: run.run_id, from, to: state, failure_class: run.failure_class ?? null });
    if (state === 'VERIFIED') emit('run.verified', { run_id: run.run_id, citations: run.verification?.valid ?? 0 });
    if (state === 'ESCALATION_REQUIRED') emit('run.escalation_required', { run_id: run.run_id, failure_class: run.failure_class });
    if (state === 'FAILED') emit('run.failed', { run_id: run.run_id, failure_class: run.failure_class });
    return run;
  }

  const ctx = {
    transition,
    emit,
    spawnDelegate,
    cancelled: (run) => cancelled.has(run.run_id),
    registerChild: (run, child) => { if (child) children.set(run.run_id, child); else children.delete(run.run_id); },
  };

  async function dispatch(runId) {
    const run = loadRun(runId);
    if (!run || TERMINAL_STATES.includes(run.state)) return;
    active = runId;
    try {
      await executeRun(run, ctx);
      // still QUEUED means capacity refused it; leave it queued for the next poll
      if (run.state === 'QUEUED' && !queue.includes(runId)) queue.push(runId);
    } catch (e) {
      rt.last_error = { at: nowISO(), message: String(e.message).slice(0, 300) };
      try { transition(run, 'FAILED', { failure_class: 'RUNTIME_ERROR', failure_detail: String(e.message).slice(0, 300), disposition: 'FAILED' }); }
      catch { /* already terminal */ }
    } finally {
      active = null;
      children.delete(runId);
      drain();
    }
  }

  function drain() {
    if (active || rt.state === 'STOPPING' || rt.state === 'STOPPED') return;
    const next = queue.shift();
    if (next) setImmediate(() => dispatch(next));
  }

  // ── HTTP ───────────────────────────────────────────────────────────────────
  const json = (res, code, body) => {
    const s = JSON.stringify(body, null, 2);
    res.writeHead(code, { 'content-type': 'application/json; charset=utf-8',
                          'content-length': Buffer.byteLength(s), 'cache-control': 'no-store' });
    res.end(s);
  };

  function readBody(req, res) {
    return new Promise((resolve) => {
      let size = 0; const chunks = [];
      req.on('data', (c) => {
        size += c.length;
        if (size > MAX_BODY_BYTES) {
          json(res, 413, { error: 'REQUEST_TOO_LARGE', max_bytes: MAX_BODY_BYTES });
          req.destroy();
          resolve(null);
          return;
        }
        chunks.push(c);
      });
      req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
      req.on('error', () => resolve(null));
    });
  }

  const publicRun = (r) => r && ({
    run_id: r.run_id, work_unit_id: r.packet?.work_unit_id, state: r.state,
    // §8 — enough for a caller to know WHAT BOUNDED WORK this run answers,
    // without exposing the packet body, member content, or any credential.
    ...objectiveView(r),
    ...(publicAdmission(r.admission) ?? {}),
    // Always present, even for pre-Unit-14 runs, so a caller never has to
    // distinguish "field missing" from "value absent".
    request_id: r.request_id ?? r.admission?.request_id ?? null,
    operation_class: r.operation_class ?? r.admission?.operation_class ?? null,
    execution_sha: r.context?.execution_head ?? r.packet?.canonical_sha ?? null,
    disposition: r.disposition ?? null, failure_class: r.failure_class ?? null,
    failure_detail: r.failure_detail ?? null, blocked: r.blocked ?? null,
    created_at: r.created_at, updated_at: r.updated_at, finished_at: r.finished_at ?? null,
    worktree: r.worktree ?? null, worker: r.worker ?? null, context: r.context ?? null,
    result: r.result ?? null, verification: r.verification ?? null,
    audit: { packet_path: r.packet_path ?? null, result_path: r.result_path ?? null, log_path: r.log_path ?? null },
    history: r.history ?? [],
  });

  const server = http.createServer(async (req, res) => {
    let url;
    try { url = new URL(req.url, `http://${host}:${port}`); } catch { return json(res, 400, { error: 'BAD_REQUEST' }); }
    const seg = url.pathname.split('/').filter(Boolean);

    // GET /health
    if (req.method === 'GET' && url.pathname === '/health') {
      const w = await workerHealth();
      rt.worker = w;
      if (rt.state === 'READY' || rt.state === 'DEGRADED') rt.state = w.available ? 'READY' : 'DEGRADED';
      const idx = listRuns({ limit: 10_000 });
      return json(res, 200, {
        runtime_id: rt.runtime_id, state: rt.state, pid: rt.pid, version: rt.version,
        repository: rt.repository, address: `http://${host}:${port}`, loopback_only: true,
        started_at: rt.started_at, uptime_s: Math.round((Date.now() - new Date(rt.started_at)) / 1000),
        worker: w,
        runs: {
          active: active ? 1 : 0,
          queued: queue.length,
          in_flight: idx.runs.filter((r) => IN_FLIGHT.includes(r.state)).length,
          total: idx.total,
        },
        last_error: rt.last_error,
      });
    }

    // GET /events  (SSE)
    if (req.method === 'GET' && url.pathname === '/events') {
      res.writeHead(200, { 'content-type': 'text/event-stream', 'cache-control': 'no-store', connection: 'keep-alive' });
      res.write(`event: runtime.ready\ndata: ${JSON.stringify({ runtime_id: rt.runtime_id, state: rt.state })}\n\n`);
      subscribers.add(res);
      const ka = setInterval(() => { try { res.write(': keep-alive\n\n'); } catch { /* closed */ } }, 20_000);
      req.on('close', () => { clearInterval(ka); subscribers.delete(res); });
      return;
    }

    // POST /runs
    if (req.method === 'POST' && url.pathname === '/runs') {
      const ct = String(req.headers['content-type'] || '');
      if (!ct.includes('application/json')) {
        return json(res, 415, { error: 'UNSUPPORTED_MEDIA_TYPE', expected: 'application/json' });
      }
      const raw = await readBody(req, res);
      if (raw === null) return;
      let body;
      try { body = JSON.parse(raw); }
      catch { return json(res, 400, { error: 'PACKET_SCHEMA_INVALID', errors: ['body is not valid JSON'] }); }

      // Two accepted shapes. A bare packet is a legacy operator submission (the
      // Unit 12 Desktop and every existing tool); an enveloped body declares a
      // principal and its delegation. `work_unit_id` at the top level is the
      // discriminator because it is required on every packet and never appears
      // on an envelope.
      const enveloped = body && typeof body === 'object' && !Array.isArray(body)
        && body.work_unit_id === undefined && typeof body.packet === 'object';
      const packet = enveloped ? body.packet : body;
      const envelope = enveloped ? body : null;

      // Well-formedness is prior to authority: a malformed packet is a bad
      // request no matter who sent it, and answering 403 there would tell a
      // caller their authority was the problem when it was not.
      const v = validatePacket(packet);
      if (!v.ok) return json(res, 400, { error: v.failure_class, errors: v.errors });

      // §1 — principal → delegation → admission, decided BEFORE anything is
      // queued or dispatched. Authority is never inferred from the fact that
      // the caller could reach this socket.
      const adm = admitRequest({
        envelope,
        packet,
        now: nowISO(),
        requirePrincipal: REQUIRE_PRINCIPAL,
      });
      if (!adm.ok) {
        // §6 — a typed admission disposition, never a generic execution failure.
        const code = adm.disposition === ADMISSION.REFUSE_UNSUPPORTED_OPERATION ? 422 : 403;
        return json(res, code, { error: adm.disposition, detail: adm.reason });
      }

      // Packet-level authority (declared lane, write-requesting keys) complements
      // principal-level admission; both must hold.
      const auth = checkAuthority(packet);
      if (!auth.ok) return json(res, 403, { error: auth.failure_class, detail: auth.detail });

      const run = {
        run_id: newRunId(), created_at: nowISO(), state: 'QUEUED', packet,
        runtime_id: rt.runtime_id, runtime_version: rt.version,
        // §10 — the objective and its request id are recorded on the run at
        // admission, so a result can never be attributed to the wrong request.
        request_id: adm.admission.request_id,
        objective: adm.admission.objective,
        operation_class: adm.admission.operation_class,
        admission: adm.admission,
        disposition: null, failure_class: null, history: [{ at: nowISO(), from: null, to: 'QUEUED' }],
      };
      saveRun(run);
      emit('run.created', {
        run_id: run.run_id, request_id: run.request_id, work_unit_id: packet.work_unit_id,
        lane: packet.execution_lane, principal_type: adm.admission.principal_type,
      });
      queue.push(run.run_id);
      drain();
      // 202: the RUNTIME accepted it. Worker capacity is a separate fact (§9).
      return json(res, 202, { run_id: run.run_id, request_id: run.request_id, state: 'QUEUED',
                              objective: run.objective, operation_class: run.operation_class,
                              accepted_by: rt.runtime_id,
                              note: 'runtime accepted; worker capacity is evaluated at dispatch' });
    }

    // GET /runs
    if (req.method === 'GET' && url.pathname === '/runs') {
      const limit = Math.min(100, Math.max(1, Number(url.searchParams.get('limit') || 25)));
      const offset = Math.max(0, Number(url.searchParams.get('offset') || 0));
      const idx = listRuns({ limit, offset });
      return json(res, 200, { total: idx.total, limit, offset, runs: idx.runs.map(publicRun) });
    }

    // GET /runs/:id   ·   POST /runs/:id/cancel
    if (seg[0] === 'runs' && seg[1]) {
      const run = loadRun(seg[1]);
      if (!run) return json(res, 404, { error: 'RUN_NOT_FOUND', run_id: seg[1] });

      if (req.method === 'GET' && seg.length === 2) return json(res, 200, publicRun(run));

      if (req.method === 'POST' && seg[2] === 'cancel' && seg.length === 3) {
        if (TERMINAL_STATES.includes(run.state)) {
          return json(res, 409, { error: 'RUN_ALREADY_TERMINAL', state: run.state });
        }
        cancelled.add(run.run_id);
        const child = children.get(run.run_id);
        if (child) { try { child.kill('SIGTERM'); } catch { /* already gone */ } }
        const i = queue.indexOf(run.run_id);
        if (i > -1) queue.splice(i, 1);
        try { transition(run, 'CANCELLED', { disposition: 'CANCELLED', cancelled_at: nowISO() }); }
        catch (e) { return json(res, 409, { error: 'CANCEL_REFUSED', detail: e.message }); }
        return json(res, 200, publicRun(loadRun(run.run_id)));
      }
      return json(res, 405, { error: 'METHOD_NOT_ALLOWED' });
    }

    // Deliberately absent: no /exec, no /shell, no /files, no arbitrary-path read.
    return json(res, 404, { error: 'NOT_FOUND', endpoints: ['GET /health', 'POST /runs', 'GET /runs',
      'GET /runs/:id', 'POST /runs/:id/cancel', 'GET /events'] });
  });

  async function start() {
    const reconciled = reconcileOrphanedRuns(IN_FLIGHT);
    if (reconciled.length) emit('runtime.reconciled', { runs: reconciled });
    await new Promise((resolve, reject) => {
      server.once('error', reject);
      server.listen(port, host, resolve);
    });
    const addr = server.address();
    rt.port = typeof addr === 'object' && addr ? addr.port : port;
    rt.worker = await workerHealth();
    rt.state = rt.worker.available ? 'READY' : 'DEGRADED';
    writeRuntimeRecord({ ...rt, address: `http://${host}:${rt.port}` });
    emit('runtime.ready', { state: rt.state, address: `http://${host}:${rt.port}`, version: rt.version });
    pollTimer = setInterval(drain, QUEUE_POLL_MS);
    if (pollTimer.unref) pollTimer.unref();
    return rt;
  }

  async function stop() {
    rt.state = 'STOPPING';
    emit('runtime.stopping', {});
    if (pollTimer) clearInterval(pollTimer);
    for (const [, child] of children) { try { child.kill('SIGTERM'); } catch { /* gone */ } }
    for (const res of subscribers) { try { res.end(); } catch { /* gone */ } }
    subscribers.clear();
    await new Promise((resolve) => server.close(resolve));
    rt.state = 'STOPPED';
    clearRuntimeRecord();
    return rt;
  }

  return { rt, server, start, stop, emit, transition, get address() { return `http://${host}:${rt.port}`; },
           _queue: queue, _events: events };
}

// ── CLI ──────────────────────────────────────────────────────────────────────
const argv = process.argv.slice(2);
const opt = (n, d) => { const i = argv.indexOf(n); return i > -1 ? argv[i + 1] : d; };

if (argv[0] === 'start') {
  const runtime = createRuntime({ host: opt('--host', process.env.JARVIS_RUNTIME_HOST || '127.0.0.1'),
                                  port: Number(opt('--port', process.env.JARVIS_RUNTIME_PORT || 8787)) });
  await runtime.start();
  console.log(JSON.stringify({ runtime_id: runtime.rt.runtime_id, state: runtime.rt.state,
                               address: runtime.address, pid: process.pid, version: runtime.rt.version }, null, 2));
  const shutdown = async () => { await runtime.stop(); process.exit(0); };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
} else if (argv[0] === 'status') {
  const rec = readRuntimeRecord();
  if (!rec) { console.log(JSON.stringify({ state: 'STOPPED', reason: 'no runtime record' }, null, 2)); process.exit(1); }
  let alive = false;
  try { process.kill(rec.pid, 0); alive = true; } catch { alive = false; }
  console.log(JSON.stringify({ ...rec, process_alive: alive,
    state: alive ? rec.state : 'STOPPED (record is stale — process gone)' }, null, 2));
  process.exit(alive ? 0 : 1);
} else if (argv[0]) {
  console.error('usage: jarvis-runtime.mjs <start|status> [--host 127.0.0.1] [--port 8787]');
  process.exit(4);
}
