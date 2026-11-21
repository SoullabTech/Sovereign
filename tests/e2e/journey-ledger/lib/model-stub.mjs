#!/usr/bin/env node
/**
 * Loopback stand-in for the model provider. The app is started with ANTHROPIC_BASE_URL pointing here, so any step that
 * would call a model reaches THIS process, never a real provider. It records one JSON line per call (method, path, model;
 * never the prompt) and answers with an error that tells the SDK not to retry. The walker reads the log to know whether
 * a control it pressed needed MAIA: such a control is NOT RUN in slice 1 (there is no MAIA step), never PASS.
 *
 *   node model-stub.mjs <port> <logfile>
 */
import http from 'node:http';
import fs from 'node:fs';

const port = Number(process.argv[2]);
const log = process.argv[3];
if (!port || !log) { console.error('usage: model-stub.mjs <port> <logfile>'); process.exit(64); }
fs.writeFileSync(log, '');

const server = http.createServer((req, res) => {
  const chunks = [];
  req.on('data', c => chunks.push(c));
  req.on('end', () => {
    let model = null;
    try { model = JSON.parse(Buffer.concat(chunks).toString('utf8')).model ?? null; } catch { /* not JSON */ }
    fs.appendFileSync(log, JSON.stringify({ at: new Date().toISOString(), method: req.method, path: req.url, model }) + '\n');
    res.writeHead(503, { 'content-type': 'application/json', 'x-should-retry': 'false' });
    res.end(JSON.stringify({ type: 'error', error: { type: 'overloaded_error', message: 'journey-ledger stub: slice 1 has no MAIA step' } }));
  });
});
server.listen(port, '127.0.0.1', () => console.log(`model stub listening on 127.0.0.1:${port}`));
for (const sig of ['SIGTERM', 'SIGINT']) process.on(sig, () => server.close(() => process.exit(0)));
