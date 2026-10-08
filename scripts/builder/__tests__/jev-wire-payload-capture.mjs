#!/usr/bin/env node
/**
 * JEV-INT-05 — payload capture. Derives, FROM THE ACTUAL IMPLEMENTATION, exactly what the adapter would put on the wire for each of the
 * 31 frozen attempts, by sending to a LOOPBACK capture server with a PLACEHOLDER credential. No provider is contacted, no code is changed.
 * The off-switch is opened only inside a temp copy of the wire module (as the tests do); the committed module stays closed.
 * Usage: node jev-wire-payload-capture.mjs [out.json]
 */
import http from 'node:http';
import { writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { makeVariant } from './jev-wire-variant-lib.mjs';

const WV = makeVariant([], { witnessed: true });
const W = await import(WV.url);
const A = await import(new URL('../jev-wire-http-adapter-v1.mjs', import.meta.url).href);
const C = await import(new URL('../jev-wire-checkpoint-v1.mjs', import.meta.url).href);
const PLACEHOLDER = '<API-KEY-PLACEHOLDER>';
const sha = (b) => createHash('sha256').update(b).digest('hex');
const REPLY = { model: 'jev-1.13.0', usage: { input_tokens: 300, output_tokens: 5 }, answers: { Q_RISK: { type: 'noul', noul: 0.25 } } };

const captured = [];
const server = http.createServer((req, res) => {
  const chunks = []; req.on('data', (c) => chunks.push(c));
  req.on('end', () => {
    captured.push({ method: req.method, path: req.url, httpVersion: req.httpVersion, rawHeaders: req.rawHeaders, body: Buffer.concat(chunks) });
    res.writeHead(200, { 'content-type': 'application/json' }); res.end(JSON.stringify(REPLY));
  });
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const port = server.address().port;
const transport = A.createJevHttpTransport({ endpoint: `http://127.0.0.1:${port}/v1/systemone`, credential: PLACEHOLDER });

const attempts = [];
for (const id of W.fixtureAttemptIds()) {
  const plan = W.planAttempt(id);
  await transport.send(plan.bodyJson, { bodyHash: plan.bodyHash });
  const c = captured.at(-1);
  const hdrs = []; for (let i = 0; i < c.rawHeaders.length; i += 2) hdrs.push([c.rawHeaders[i], c.rawHeaders[i + 1]]);
  attempts.push({ id, method: c.method, path: c.path, headers: hdrs.map(([k, v]) => [k, k.toLowerCase() === 'host' ? '<HOST>' : v]),
    body_bytes: c.body.length, body_sha256: sha(c.body), body_equals_plan_bytes: c.body.equals(Buffer.from(plan.bodyJson, 'utf8')), body: c.body.toString('utf8') });
}

// what the runner records locally for one attempt (via the real runner + real ledger pair, temp dir)
const dir = mkdtempSync(join(tmpdir(), 'jev-payload-')); 
const base = W.createLedger(join(dir, 'ledger.jsonl'), { experiment_id: 'JEV-INT-05-PAYLOAD-DOC' });
const pair = C.createCheckpointedLedger(base, join(dir, 'anchor.json')); pair.initialize();
const out = await W.runAttempt({ attemptId: 'F01', ledger: pair, transport });
const records = base.read().map((r) => ({ kind: r.kind, members: Object.keys(r) }));
const observed = base.read().find((r) => r.kind === 'observed');
await new Promise((r) => server.close(r));

const result = {
  committed_switch_witnessed: (await import(new URL('../jev-wire-v1.mjs', import.meta.url).href)).RESPONSE_SHAPE.witnessed,
  table_hash: W.questionTableHash(), fixture_list_hash: W.fixtureListHash(), attempts_count: attempts.length,
  distinct_bodies: new Set(attempts.map((a) => a.body_sha256)).size,
  all_bodies_match_plan: attempts.every((a) => a.body_equals_plan_bytes),
  attempts, runner_outcome_for_F01: out.outcome, ledger_record_kinds: records, observed_record_example: observed,
};
const text = JSON.stringify(result, null, 2) + '\n';
if (process.argv[2]) writeFileSync(process.argv[2], text); else process.stdout.write(text);
