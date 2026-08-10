#!/usr/bin/env node
/**
 * JARVIS Unit 11 — typed local runtime client (§15)
 * ═══════════════════════════════════════════════════════════════════════════
 * The next unit (a desktop access point) should not re-derive HTTP details, and
 * no future client should be able to reach a non-loopback JARVIS by accident.
 * This is the whole client contract — six calls, no framework, no dependencies.
 *
 * @typedef {Object} RuntimeHealth
 * @property {string} runtime_id
 * @property {'STARTING'|'READY'|'DEGRADED'|'STOPPING'|'STOPPED'} state
 * @property {number} pid
 * @property {string} version
 * @property {{available:boolean, models:number, reason:(string|null)}} worker
 * @property {{active:number, queued:number, in_flight:number, total:number}} runs
 *
 * @typedef {Object} RunView
 * @property {string} run_id
 * @property {string} work_unit_id
 * @property {'QUEUED'|'VALIDATING'|'CONTEXT_ROUTING'|'READY_FOR_WORKER'|'RUNNING'|'VALIDATING_RESULT'|'VERIFYING_EVIDENCE'|'VERIFIED'|'ESCALATION_REQUIRED'|'FAILED'|'CANCELLED'} state
 * @property {string|null} disposition
 * @property {string|null} failure_class
 * @property {{reason:string, active:number, limit:number}|null} blocked
 * @property {{total:number, valid:number, invalid:number, ok:boolean}|null} verification
 * @property {{packet_path:string|null, result_path:string|null, log_path:string|null}} audit
 */

const LOOPBACK = /^https?:\/\/(127\.0\.0\.1|\[::1\]|localhost)(:\d+)?$/;

export function createClient({ baseUrl = 'http://127.0.0.1:8787', fetchImpl = fetch } = {}) {
  const base = baseUrl.replace(/\/$/, '');
  if (!LOOPBACK.test(base)) {
    throw new Error(`NON_LOOPBACK_CLIENT_REFUSED: '${base}' is not a loopback address. ` +
      `JARVIS Unit 11 is local-only by mandate.`);
  }

  async function call(method, pathname, body) {
    const res = await fetchImpl(`${base}${pathname}`, {
      method,
      headers: body === undefined ? {} : { 'content-type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const text = await res.text();
    let json = null;
    try { json = text ? JSON.parse(text) : null; } catch { /* non-JSON body */ }
    if (!res.ok) {
      const err = new Error(`${method} ${pathname} → ${res.status} ${json?.error ?? ''}`.trim());
      err.status = res.status; err.body = json;
      throw err;
    }
    return json;
  }

  return {
    baseUrl: base,
    /** @returns {Promise<RuntimeHealth>} */
    health: () => call('GET', '/health'),
    /** @returns {Promise<{run_id:string, state:string}>} */
    createRun: (packet) => call('POST', '/runs', packet),
    /** @returns {Promise<RunView>} */
    getRun: (id) => call('GET', `/runs/${encodeURIComponent(id)}`),
    /** @returns {Promise<{total:number, runs:RunView[]}>} */
    listRuns: ({ limit = 25, offset = 0 } = {}) => call('GET', `/runs?limit=${limit}&offset=${offset}`),
    /** @returns {Promise<RunView>} */
    cancelRun: (id) => call('POST', `/runs/${encodeURIComponent(id)}/cancel`),

    /**
     * Server-Sent Events. Returns an unsubscribe function.
     * Telemetry only — never treat an event as the audit artifact (§6).
     */
    async subscribe(onEvent, { signal } = {}) {
      const ctrl = new AbortController();
      if (signal) signal.addEventListener('abort', () => ctrl.abort());
      const res = await fetchImpl(`${base}/events`, { headers: { accept: 'text/event-stream' }, signal: ctrl.signal });
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let buf = '';
      (async () => {
        try {
          for (;;) {
            const { done, value } = await reader.read();
            if (done) break;
            buf += dec.decode(value, { stream: true });
            let i;
            while ((i = buf.indexOf('\n\n')) > -1) {
              const frame = buf.slice(0, i); buf = buf.slice(i + 2);
              const type = /^event: (.+)$/m.exec(frame)?.[1];
              const data = /^data: (.+)$/m.exec(frame)?.[1];
              if (type && data) { try { onEvent({ type, ...JSON.parse(data) }); } catch { /* malformed frame */ } }
            }
          }
        } catch { /* aborted or closed */ }
      })();
      return () => ctrl.abort();
    },

    /** Convenience: poll until the run reaches a terminal state. */
    async waitForRun(id, { timeoutMs = 900_000, pollMs = 2000 } = {}) {
      const terminal = ['VERIFIED', 'ESCALATION_REQUIRED', 'FAILED', 'CANCELLED'];
      const t0 = Date.now();
      for (;;) {
        const run = await this.getRun(id);
        if (terminal.includes(run.state)) return run;
        if (Date.now() - t0 > timeoutMs) throw new Error(`waitForRun: timed out in state ${run.state}`);
        await new Promise((r) => setTimeout(r, pollMs));
      }
    },
  };
}

export default createClient;
