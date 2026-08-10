'use strict';
/**
 * JARVIS Unit 12 — Desktop runtime client (§1, §5, §11, §14, §18)
 *
 * The Desktop is a CLIENT of the Unit 11 runtime. This module is the only place
 * in the Desktop that speaks to it, and it speaks over loopback HTTP only.
 *
 * It deliberately implements NONE of: packet validation, context routing, worker
 * dispatch, verification, Builder claims, result contracts, run persistence.
 * Those are runtime responsibilities (§1). What lives here is transport:
 * request/response, an SSE subscription that reconnects, and a hard refusal to
 * address anything that is not a loopback literal (§18).
 */

const http = require('node:http');

/** Loopback literals only. A hostname is not evidence of a loopback interface. */
const LOOPBACK_HOSTS = new Set(['127.0.0.1', '::1', 'localhost']);

const DEFAULT_HOST = '127.0.0.1';
const DEFAULT_PORT = 8787;

/**
 * @throws {Error} code NON_LOOPBACK_RUNTIME_REFUSED — fails closed, never falls
 *   back to a default. Alpha has no configurable public runtime URL (§18).
 */
function assertLoopback(host) {
  if (!LOOPBACK_HOSTS.has(String(host))) {
    const e = new Error(
      `NON_LOOPBACK_RUNTIME_REFUSED: refusing to address '${host}'. ` +
      'JARVIS Desktop Alpha talks to the local runtime only; a non-loopback ' +
      'runtime address requires an explicit governance unit.',
    );
    e.code = 'NON_LOOPBACK_RUNTIME_REFUSED';
    throw e;
  }
  return host;
}

/** Resolve the runtime endpoint. Host may be overridden but is always asserted. */
function resolveEndpoint(opts = {}, env = process.env) {
  const host = assertLoopback(opts.host ?? env.JARVIS_RUNTIME_HOST ?? DEFAULT_HOST);
  const port = Number(opts.port ?? env.JARVIS_RUNTIME_PORT ?? DEFAULT_PORT);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    const e = new Error(`INVALID_RUNTIME_PORT: '${port}'`);
    e.code = 'INVALID_RUNTIME_PORT';
    throw e;
  }
  return { host, port, address: `http://${host}:${port}` };
}

/**
 * A transport failure is a distinct fact from a runtime rejection (§20) — and
 * "nothing is listening" is a distinct fact from "it is listening but did not
 * answer in time".
 *
 * This distinction is load-bearing, not pedantry. The Unit 11 runtime performs
 * synchronous git and Builder-session work while preparing a run, which blocks
 * its event loop: the socket stays bound and connectable, but no response comes
 * back for as long as that setup takes. Reporting that as OFFLINE would tell the
 * operator the runtime is down while it is in fact mid-run — the Desktop would
 * be dramatizing rather than revealing system truth (§14).
 */
const OFFLINE_CODES = new Set(['ECONNREFUSED', 'ENOTFOUND', 'EHOSTUNREACH', 'ENETUNREACH', 'EADDRNOTAVAIL']);

function transportError(cause, { timedOut = false } = {}) {
  const offline = !timedOut && OFFLINE_CODES.has(cause?.code);
  const code = offline ? 'RUNTIME_OFFLINE' : 'RUNTIME_UNRESPONSIVE';
  const e = new Error(offline
    ? `RUNTIME_OFFLINE: ${cause?.message ?? 'nothing is listening on the local runtime address'}`
    : `RUNTIME_UNRESPONSIVE: ${cause?.message ?? 'the local runtime accepted the connection but did not answer in time'}`);
  e.code = code;
  e.cause = cause;
  return e;
}

function createClient(opts = {}) {
  const endpoint = resolveEndpoint(opts);
  // Generous by design: the runtime blocks its event loop while materializing a
  // run's worktree and context, and a request issued during that window is not
  // evidence of a problem — it is evidence of work in progress.
  const timeoutMs = Number(opts.timeoutMs ?? 45_000);

  function request(method, path, body) {
    return new Promise((resolve, reject) => {
      let timedOut = false;
      const payload = body === undefined ? null : Buffer.from(JSON.stringify(body), 'utf8');
      const req = http.request({
        host: endpoint.host,
        port: endpoint.port,
        method,
        path,
        headers: {
          accept: 'application/json',
          ...(payload ? { 'content-type': 'application/json', 'content-length': payload.length } : {}),
        },
      }, (res) => {
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => {
          const text = Buffer.concat(chunks).toString('utf8');
          let json = null;
          try { json = text ? JSON.parse(text) : null; } catch { /* non-JSON body is reported as-is */ }
          resolve({ status: res.statusCode, body: json, text });
        });
      });
      req.setTimeout(timeoutMs, () => {
        timedOut = true;
        req.destroy(new Error(`the runtime did not answer within ${timeoutMs}ms`));
      });
      req.on('error', (e) => reject(transportError(e, { timedOut })));
      if (payload) req.write(payload);
      req.end();
    });
  }

  return {
    endpoint,

    /** GET /health — the runtime's own account of itself (§12). */
    health: () => request('GET', '/health'),

    /** GET /runs — durable history is authoritative, not Desktop state (§15). */
    listRuns: ({ limit = 25, offset = 0 } = {}) =>
      request('GET', `/runs?limit=${encodeURIComponent(limit)}&offset=${encodeURIComponent(offset)}`),

    /** GET /runs/:id */
    getRun: (id) => request('GET', `/runs/${encodeURIComponent(id)}`),

    /** POST /runs — the runtime accepts or refuses. No optimistic completion (§5). */
    createRun: (packet) => request('POST', '/runs', packet),

    /** POST /runs/:id/cancel — the runtime decides; the Desktop reports (§11). */
    cancelRun: (id) => request('POST', `/runs/${encodeURIComponent(id)}/cancel`),

    /**
     * GET /events (SSE). Notification, never truth (§14) — every handler is
     * expected to re-fetch REST state. Reconnects with bounded backoff and
     * reports its own connection status so the UI can say what it actually is.
     */
    subscribe({ onEvent, onStatus } = {}) {
      let closed = false;
      let attempt = 0;
      let req = null;
      let timer = null;

      const status = (s, detail) => { try { onStatus?.(s, detail); } catch { /* UI errors are not transport errors */ } };

      const connect = () => {
        if (closed) return;
        req = http.get({
          host: endpoint.host,
          port: endpoint.port,
          path: '/events',
          headers: { accept: 'text/event-stream' },
        }, (res) => {
          if (res.statusCode !== 200) {
            res.resume();
            return retry(`runtime answered ${res.statusCode} on /events`);
          }
          attempt = 0;
          status('CONNECTED');
          res.setEncoding('utf8');
          let buf = '';
          res.on('data', (chunk) => {
            buf += chunk;
            let i;
            while ((i = buf.indexOf('\n\n')) !== -1) {
              const frame = buf.slice(0, i);
              buf = buf.slice(i + 2);
              const parsed = parseFrame(frame);
              if (parsed) { try { onEvent?.(parsed); } catch { /* see above */ } }
            }
          });
          res.on('end', () => retry('runtime closed the event stream'));
          res.on('error', (e) => retry(e.message));
        });
        req.on('error', (e) => retry(e.message));
      };

      const retry = (detail) => {
        if (closed) return;
        // Sleep/wake and runtime restart both land here. Backoff is bounded so a
        // laptop that wakes after hours reconnects within seconds, not minutes.
        const delay = Math.min(15_000, 500 * 2 ** Math.min(attempt++, 5));
        status('RECONNECTING', detail);
        clearTimeout(timer);
        timer = setTimeout(connect, delay);
      };

      connect();
      return {
        close() {
          closed = true;
          clearTimeout(timer);
          try { req?.destroy(); } catch { /* already gone */ }
          status('CLOSED');
        },
      };
    },
  };
}

/** Parse one SSE frame into { type, data }. Comments/keep-alives yield null. */
function parseFrame(frame) {
  let type = 'message';
  const dataLines = [];
  for (const line of frame.split('\n')) {
    if (!line || line.startsWith(':')) continue;
    if (line.startsWith('event:')) type = line.slice(6).trim();
    else if (line.startsWith('data:')) dataLines.push(line.slice(5).trim());
  }
  if (!dataLines.length) return null;
  let data = null;
  try { data = JSON.parse(dataLines.join('\n')); } catch { return null; }
  return { type, data };
}

/**
 * Duplicate suppression for the event stream (§14). The runtime replays nothing
 * on reconnect, but a UI restart plus an in-flight frame can deliver the same
 * event twice; identity is (type, run_id, at).
 */
function createEventDedupe(capacity = 500) {
  const seen = new Set();
  const order = [];
  return function accept(ev) {
    if (!ev || typeof ev !== 'object') return false;
    const d = ev.data ?? {};
    const key = `${ev.type}|${d.run_id ?? ''}|${d.at ?? ''}|${d.state ?? ''}`;
    if (seen.has(key)) return false;
    seen.add(key);
    order.push(key);
    if (order.length > capacity) seen.delete(order.shift());
    return true;
  };
}

module.exports = {
  LOOPBACK_HOSTS,
  DEFAULT_HOST,
  DEFAULT_PORT,
  assertLoopback,
  resolveEndpoint,
  createClient,
  createEventDedupe,
  parseFrame,
};
