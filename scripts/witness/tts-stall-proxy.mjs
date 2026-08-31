#!/usr/bin/env node
/**
 * VOICE-TTS-REQUEST-DEADLINE-01 — forced-slow provider harness.
 *
 * A local stand-in for api.openai.com that answers slowly on purpose, so the
 * 20s server deadline can be witnessed against a real slow provider rather
 * than a manufactured server condition.
 *
 * It requires NO change to the unit under test: the OpenAI SDK reads its base
 * URL from OPENAI_BASE_URL (node_modules/openai/index.js:72), so pointing the
 * dev server at this proxy is the whole intervention.
 *
 * Two properties make it a faithful model of the 2026-08-31 failure:
 *
 *   1. It stalls, then FORWARDS to the real OpenAI API and returns the real
 *      audio. So if ghost audio ever reaches playback, the member hears MAIA's
 *      actual words — the negative control is audible, not theoretical.
 *
 *   2. It DETACHES from the downstream client. When the route abandons at 20s
 *      and drops the socket, the upstream call still proceeds and still
 *      completes. That is the point: the provider really does finish late,
 *      exactly as it did in production at 589,288ms.
 *
 * The Authorization header is forwarded verbatim from the incoming request.
 * This proxy never reads, stores, or logs the key.
 *
 * Usage — two terminals, both on the Desktop witness machine:
 *
 *   node scripts/witness/tts-stall-proxy.mjs
 *   OPENAI_BASE_URL=http://127.0.0.1:8787/v1 npm run dev -- -p 3117
 *
 * Env:
 *   STALL_MS   delay before forwarding      (default 60000 — 3x the deadline)
 *   PORT       listen port                  (default 8787)
 *   UPSTREAM   real API host                (default https://api.openai.com)
 */
import http from 'node:http';

const STALL_MS = Number(process.env.STALL_MS ?? 60_000);
const PORT = Number(process.env.PORT ?? 8787);
const UPSTREAM = process.env.UPSTREAM ?? 'https://api.openai.com';

const ts = () => new Date().toISOString();
let seq = 0;

const server = http.createServer((req, res) => {
  const id = ++seq;
  const t0 = Date.now();
  const chunks = [];
  req.on('data', (c) => chunks.push(c));
  req.on('end', () => {
    const body = Buffer.concat(chunks);
    console.log(`[stall-proxy #${id}] ${ts()} received ${req.method} ${req.url} bytes=${body.length} — stalling ${STALL_MS}ms`);

    let downstreamGone = false;
    res.on('close', () => {
      if (!res.writableEnded) {
        downstreamGone = true;
        console.log(`[stall-proxy #${id}] ${ts()} downstream DISCONNECTED after ${Date.now() - t0}ms (expected: the 20s deadline fired) — upstream continues`);
      }
    });

    setTimeout(async () => {
      const headers = { ...req.headers };
      delete headers.host;
      delete headers['content-length'];
      try {
        const upstream = await fetch(`${UPSTREAM}${req.url}`, {
          method: req.method,
          headers,
          body: body.length ? body : undefined,
        });
        const buf = Buffer.from(await upstream.arrayBuffer());
        console.log(`[stall-proxy #${id}] ${ts()} UPSTREAM COMPLETED status=${upstream.status} bytes=${buf.length} at +${Date.now() - t0}ms${downstreamGone ? ' — downstream already gone, this audio reaches no one' : ''}`);
        if (downstreamGone) return;
        res.writeHead(upstream.status, {
          'content-type': upstream.headers.get('content-type') ?? 'application/octet-stream',
          'content-length': String(buf.length),
        });
        res.end(buf);
      } catch (err) {
        console.log(`[stall-proxy #${id}] ${ts()} upstream FAILED at +${Date.now() - t0}ms: ${err?.message}`);
        if (downstreamGone) return;
        res.writeHead(502, { 'content-type': 'application/json' });
        res.end(JSON.stringify({ error: 'stall-proxy upstream failure' }));
      }
    }, STALL_MS);
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`[stall-proxy] listening on http://127.0.0.1:${PORT} → ${UPSTREAM}`);
  console.log(`[stall-proxy] stalling every request ${STALL_MS}ms before forwarding`);
  console.log(`[stall-proxy] point the dev server at it with:`);
  console.log(`[stall-proxy]   OPENAI_BASE_URL=http://127.0.0.1:${PORT}/v1 npm run dev -- -p 3117`);
});
