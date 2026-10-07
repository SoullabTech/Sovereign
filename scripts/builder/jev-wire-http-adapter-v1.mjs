/**
 * JARVIS-JEV-01 / JEV-INT-05 — INACTIVE HTTP adapter for the J1R5-WIRE experiment.
 *
 * STATUS: CANDIDATE. Constructed, tested against a loopback mock only. NOT wired to anything.
 *  - It sends the EXACT serialized body the approved runner hands it; it never parses, rebuilds, extends or
 *    substitutes that body. If the runner passes the recorded pre-send hash, bytes that do not hash to it are refused
 *    before any connection exists.
 *  - Remote endpoints are refused unless `allowRemote === true` AND the endpoint is exactly the pinned production
 *    one (https, api.typesafe.ai, /v1/systemone, no port/credentials/query). No code in this repository enables
 *    the remote option; the runner's committed `RESPONSE_SHAPE.witnessed === false` independently refuses every send.
 *  - No environment reads, no file reads, no logging. The credential is supplied by the caller (a string or a function),
 *    lives only in a closure, appears only in the Authorization header, and is never placed in an error.
 *  - One request per call: no retries, no redirects (3xx is refused, not followed), response size capped, and ONE
 *    deadline that covers connection, headers AND completion of the response body (it is not reset by traffic).
 *  - The runner's abort signal destroys the socket. After any settlement the socket is destroyed, so a late response
 *    cannot arrive anywhere.
 * Failures reject with an Error whose message is a closed code (ADAPTER_*); HTTP failures carry `.status` only.
 */
import http from 'node:http';
import https from 'node:https';
import { createHash } from 'node:crypto';
import { BUDGET } from './jev-wire-v1.mjs';

export const PINNED_REMOTE = Object.freeze({ protocol: 'https:', hostname: 'api.typesafe.ai', pathname: '/v1/systemone' });
export const DEFAULT_MAX_RESPONSE_BYTES = 65_536;
const LOOPBACK_HOSTS = new Set(['127.0.0.1', '::1', '[::1]', 'localhost']);

const fail = (code, extra = {}) => Object.assign(new Error(code), { code, ...extra });
const sha256 = (text) => createHash('sha256').update(text).digest('hex');

function validateEndpoint(endpoint, allowRemote) {
  let u;
  try { u = new URL(endpoint); } catch { throw fail('ADAPTER_ENDPOINT_INVALID'); }
  if (u.protocol !== 'http:' && u.protocol !== 'https:') throw fail('ADAPTER_ENDPOINT_INVALID');
  if (u.username || u.password || u.search || u.hash) throw fail('ADAPTER_ENDPOINT_INVALID');
  if (LOOPBACK_HOSTS.has(u.hostname)) return u;
  if (allowRemote !== true) throw fail('ADAPTER_REMOTE_NOT_ALLOWED');
  if (u.protocol !== PINNED_REMOTE.protocol || u.hostname !== PINNED_REMOTE.hostname
    || u.pathname !== PINNED_REMOTE.pathname || u.port !== '') throw fail('ADAPTER_ENDPOINT_NOT_PINNED');
  return u;
}

export function createJevHttpTransport({
  endpoint, credential, allowRemote = false, timeoutMs = BUDGET.timeout_ms, maxResponseBytes = DEFAULT_MAX_RESPONSE_BYTES,
} = {}) {
  const url = validateEndpoint(endpoint, allowRemote);
  if (typeof credential !== 'string' && typeof credential !== 'function') throw fail('ADAPTER_CREDENTIAL_INVALID');
  if (typeof credential === 'string' && !/^[\x21-\x7e]+$/.test(credential)) throw fail('ADAPTER_CREDENTIAL_INVALID');
  if (!Number.isSafeInteger(timeoutMs) || timeoutMs <= 0) throw fail('ADAPTER_CONFIG_INVALID');
  if (!Number.isSafeInteger(maxResponseBytes) || maxResponseBytes <= 0) throw fail('ADAPTER_CONFIG_INVALID');   // NaN / Infinity / non-integers would disable the bound
  const client = url.protocol === 'https:' ? https : http;

  function attempt(bodyJson, { signal, bodyHash } = {}) {
    if (typeof bodyJson !== 'string' || bodyJson === '') return Promise.reject(fail('ADAPTER_BODY_INVALID'));
    if (bodyHash !== undefined && sha256(bodyJson) !== bodyHash) return Promise.reject(fail('ADAPTER_BODY_HASH_MISMATCH'));
    if (signal && signal.aborted) return Promise.reject(fail('ADAPTER_ABORTED'));   // before any work
    let key; try { key = typeof credential === 'function' ? credential() : credential; } catch { return Promise.reject(fail('ADAPTER_CREDENTIAL_ERROR')); }
    if (signal && signal.aborted) return Promise.reject(fail('ADAPTER_ABORTED'));   // re-check: the credential callback may have cancelled
    if (typeof key !== 'string' || !/^[\x21-\x7e]+$/.test(key)) return Promise.reject(fail('ADAPTER_CREDENTIAL_INVALID'));
    const bytes = Buffer.from(bodyJson, 'utf8');

    return new Promise((resolve, reject) => {
      let settled = false; let timer; let req; let response;
      const done = (settle, value) => {
        if (settled) return;
        settled = true; clearTimeout(timer);
        if (signal) signal.removeEventListener('abort', onAbort);
        settle(value);
      };
      const bail = (code, extra) => {
        try { if (response) response.destroy(); } catch { /* already closed */ }
        try { if (req) req.destroy(); } catch { /* already closed */ }
        done(reject, fail(code, extra));
      };
      const arm = () => { clearTimeout(timer); timer = setTimeout(() => bail('ADAPTER_TIMEOUT'), timeoutMs); };
      const onAbort = () => bail('ADAPTER_ABORTED');
      if (signal) signal.addEventListener('abort', onAbort, { once: true });
      arm();

      req = client.request({
        method: 'POST',
        protocol: url.protocol,
        hostname: url.hostname.replace(/^\[|\]$/g, ''),
        port: url.port || undefined,
        path: url.pathname,
        agent: false,
        headers: {
          'content-type': 'application/json',
          'content-length': String(bytes.length),
          accept: 'application/json',
          authorization: 'Bearer ' + key,
          connection: 'close',
          'user-agent': 'jev-wire-adapter/1',
        },
      }, (res) => {
        response = res;
        const status = res.statusCode || 0;
        if (status >= 300 && status < 400) return bail('ADAPTER_REDIRECT_REFUSED', { status });
        if (status < 200 || status >= 300) return bail('ADAPTER_HTTP_ERROR', { status });
        if (!/^application\/json\b/i.test(String(res.headers['content-type'] || ''))) return bail('ADAPTER_CONTENT_TYPE', { status });
        const chunks = []; let size = 0;
        res.on('data', (chunk) => {
          size += chunk.length;
          if (size > maxResponseBytes) return bail('ADAPTER_RESPONSE_TOO_LARGE');
          chunks.push(chunk);
        });
        res.on('end', () => {
          let value;
          try { value = JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { return bail('ADAPTER_BAD_JSON'); }
          done(resolve, value);
        });
        res.on('close', () => { if (!res.complete) bail('ADAPTER_RESPONSE_INCOMPLETE'); });
        res.on('error', () => bail('ADAPTER_RESPONSE_INCOMPLETE'));
      });
      req.on('error', () => bail('ADAPTER_NETWORK_ERROR'));
      req.end(bytes);
    });
  }

  return Object.freeze({ send: (bodyJson, opts) => attempt(bodyJson, opts) });
}
