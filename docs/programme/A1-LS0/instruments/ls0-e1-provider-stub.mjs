// A1-LS0 · E1 deterministic local stub at the structured-model transport boundary.
// Packet §4: no provider or network call; named in evidence; no scenario claims
// to test model behaviour. The app's Anthropic SDK is pointed here through
// ANTHROPIC_BASE_URL. Every request is REFUSED (HTTP 400) so no inference ever
// runs. Only method, path and body size are logged; the body — which may carry
// synthetic manuscript text — is never written anywhere.
// Usage: node ls0-e1-provider-stub.mjs <port> <log_file>
import http from 'node:http';
import fs from 'node:fs';

const port = Number(process.argv[2]);
const log = process.argv[3];
fs.writeFileSync(log, '');

http.createServer((req, res) => {
  let bytes = 0;
  req.on('data', (c) => { bytes += c.length; });
  req.on('end', () => {
    fs.appendFileSync(log, JSON.stringify({ at: new Date().toISOString(), method: req.method, path: req.url, bodyBytes: bytes }) + '\n');
    res.writeHead(400, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ type: 'error', error: { type: 'invalid_request_error', message: 'ls0-e1 stub: inference refused by design' } }));
  });
}).listen(port, '127.0.0.1');
