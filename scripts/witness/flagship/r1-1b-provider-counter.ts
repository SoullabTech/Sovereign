/**
 * R1-1B — PROVIDER-CALL COUNTER. Every request that reaches it is a cognition attempt.
 * The witness `next dev` points ANTHROPIC_BASE_URL here; the walk requires the count to be ZERO.
 * ⛔ Answers nothing useful (500) — no controlled inference exists in R1-1B; Review must never ask.
 */
import { createServer } from 'node:http';
import { appendFileSync } from 'node:fs';
const PORT = Number(process.env.COUNTER_PORT ?? '4498');
const LOG = process.env.COUNTER_LOG ?? '/tmp/r1-1b-provider-hits.log';
createServer((req, res) => {
  appendFileSync(LOG, `${new Date().toISOString()} ${req.method} ${req.url}\n`);
  res.writeHead(500, { 'content-type': 'application/json' }); res.end('{"error":"r1-1b witness: no provider may be reached"}');
}).listen(PORT, '127.0.0.1', () => { console.log(`provider counter on 127.0.0.1:${PORT} → ${LOG}`); });
