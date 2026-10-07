#!/usr/bin/env node
/**
 * JEV-INT-05 — the eight independently reviewed findings (S1 S2 D1 T1 D2 D3 D4 D5) as executable
 * reproductions. Fake transports only; the response-shape gate is opened ONLY inside temp copies.
 *
 *   node jev-wire-v1-findings-repro.mjs old   # module at reviewed commit 12890c6fb  → every finding must REPRODUCE
 *   node jev-wire-v1-findings-repro.mjs new   # module in the working tree           → none may reproduce
 */
import assert from 'node:assert/strict';
import { execFileSync, spawn } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, unlinkSync, writeFileSync, appendFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { makeVariant } from './jev-wire-variant-lib.mjs';

const mode = process.argv[2];
if (!['old', 'new'].includes(mode)) { console.error('usage: old|new'); process.exit(2); }
const REVIEWED = '12890c6fba9e8820188387e7be3ccb81367a785e';
const repo = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const source = mode === 'old'
  ? execFileSync('git', ['show', `${REVIEWED}:scripts/builder/jev-wire-v1.mjs`], { cwd: repo, encoding: 'utf8' })
  : null;
const V = makeVariant([], { witnessed: true, source });
const W = await import(V.url);
const scratch = () => mkdtempSync(join(tmpdir(), 'jev-repro-'));
const NEW = mode === 'new';
const P = 0.3731;                                           // distinctive, so persistence is greppable
const resp = (extra = {}) => NEW
  ? { model: 'jev-1.13.0', usage: { input_tokens: 300, output_tokens: 5 }, answers: { Q_RISK: { type: 'noul', noul: P } }, ...extra }
  : { model: 'jev-1.13.0', usage: { input_tokens: 300 }, questions: { Q_RISK: { type: 'noul', noul: P } }, ...extra };
const ledgerAt = (path) => { const l = W.createLedger(path); if (NEW && !existsSync(path)) l.initialize(); return l; };
const fake = (h) => { const t = { calls: 0, send: async (b, o) => { t.calls += 1; return h(b, o); } }; return t; };

const rows = [];
const row = (id, reproduced, note) => { rows.push({ id, reproduced }); console.log(`${reproduced ? 'REPRODUCED    ' : 'not reproduced'}  ${id}  ${note}`); };

// S1 — the documented `answers` envelope must be parseable
{
  const documented = { model: 'jev-1.13.0', usage: { input_tokens: 300, output_tokens: 5 }, answers: { Q_RISK: { type: 'noul', noul: P } } };
  row('S1-documented-answer-envelope', W.parseNativeResponse(documented, 'Q_RISK').ok === false, 'documented `answers` response refused');
}
// S2 — the parser must be closed
{
  const extras = [resp({ extra: 1 }),
    NEW ? resp({ answers: { Q_RISK: { type: 'noul', noul: P }, Q_DEPTH: { type: 'noul', noul: 0.9 } } })
      : resp({ questions: { Q_RISK: { type: 'noul', noul: P }, Q_DEPTH: { type: 'noul', noul: 0.9 } } }),
    NEW ? resp({ answers: { Q_RISK: { type: 'noul', noul: P, confidence: 0.9 } } })
      : resp({ questions: { Q_RISK: { type: 'noul', noul: P, confidence: 0.9 } } })];
  row('S2-nonclosed-response-parser', extras.some((r) => W.parseNativeResponse(r, 'Q_RISK').ok === true), 'extra root / extra answer / confidence accepted');
}
// D1 — the observation must be on disk before success is reported
{
  const path = join(scratch(), 'l.jsonl'); const l = ledgerAt(path);
  const r = await W.runAttempt({ attemptId: 'F01', ledger: l, transport: fake(() => resp()) });
  assert.ok(r.sent);
  row('D1-observation-not-persisted', !readFileSync(path, 'utf8').includes(String(P)), `returned ${r.outcome}; probability absent from disk`);
}
// D2 — restart after an ambiguous crash must not send again
const CHILD = `
const [url, path, attemptId, mode, marker, isNew] = process.argv.slice(1);
const fs = await import('node:fs'); const W = await import(url);
const ledger = W.createLedger(path);
if (mode === 'send') {
  if (isNew === '1') { const rif = ledger.reserveIfAllowed; ledger.reserveIfAllowed = (rec, gate) => rif(rec, (s) => { const o = gate(s); Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 250); return o; }); }
  else { const st = ledger.state; ledger.state = () => { const o = st(); Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 250); return o; }; }
}
const transport = { send: async () => {
  if (mode === 'exit') process.exit(41);
  fs.appendFileSync(marker, attemptId + '\\n'); await new Promise((r) => setTimeout(r, 300));
  return isNew === '1' ? { model: 'jev-1.13.0', usage: { input_tokens: 9, output_tokens: 1 }, answers: { Q_RISK: { type: 'noul', noul: 0.4 } } }
                       : { model: 'jev-1.13.0', usage: { input_tokens: 9 }, questions: { Q_RISK: { type: 'noul', noul: 0.4 } } };
} };
const r = await W.runAttempt({ attemptId, ledger, transport });
console.log(JSON.stringify({ sent: r.sent, reason: r.reason }));
`;
const child = (args) => new Promise((resolve) => {
  const c = spawn(process.execPath, ['--input-type=module', '-e', CHILD, ...args]);
  let out = ''; c.stdout.on('data', (d) => { out += d; }); c.stderr.on('data', () => {});
  c.on('close', (code) => resolve({ code, out }));
});
{
  const dir = scratch(); const path = join(dir, 'l.jsonl'); ledgerAt(path);
  await child([V.url, path, 'F01', 'exit', join(dir, 'm'), NEW ? '1' : '0']);
  const t = fake(() => resp());
  const r = await W.runAttempt({ attemptId: 'F02', ledger: W.createLedger(path), transport: t });
  row('D2-resume-after-ambiguous-crash', t.calls === 1, `next attempt sent=${r.sent}${r.reason ? ' reason=' + r.reason : ''}`);
}
// D3 — a valid-JSON but invalid ledger event must not be ignored
{
  const path = join(scratch(), 'l.jsonl'); const l = ledgerAt(path);
  let line = { kind: 'bogus_event' };
  if (NEW) { const last = l.read().at(-1); const body = { kind: 'bogus_event', seq: 1, prev: last.hash }; line = { ...body, hash: W.sha256Hex(W.canonicalJson(body)) }; }
  appendFileSync(path, JSON.stringify(line) + '\n');
  const t = fake(() => resp());
  await W.runAttempt({ attemptId: 'F01', ledger: W.createLedger(path), transport: t });
  row('D3-valid-json-invalid-ledger', t.calls === 1, 'invalid event ignored; send proceeded');
}
// D4 — a vanished ledger must not read as a fresh experiment
{
  const path = join(scratch(), 'l.jsonl'); const t = fake(() => resp());
  await W.runAttempt({ attemptId: 'F01', ledger: ledgerAt(path), transport: t });
  unlinkSync(path);
  await W.runAttempt({ attemptId: 'F01', ledger: W.createLedger(path), transport: t });
  row('D4-missing-ledger-allows-replay', t.calls === 2, `same attempt sent ${t.calls}×`);
}
// D5 — two processes must not both dispatch the same attempt
{
  const dir = scratch(); const path = join(dir, 'l.jsonl'); const marker = join(dir, 'm'); ledgerAt(path);
  await Promise.all([0, 1].map(() => child([V.url, path, 'F01', 'send', marker, NEW ? '1' : '0'])));
  const sends = existsSync(marker) ? readFileSync(marker, 'utf8').trim().split('\n').filter(Boolean).length : 0;
  row('D5-two-process-same-attempt-race', sends === 2, `${sends} send(s) from 2 processes`);
}
// T1 — a transport that never resolves must not hang the runner
{
  const path = join(scratch(), 'l.jsonl'); const l = ledgerAt(path);
  const hung = { send: () => new Promise(() => {}) };
  const out = await Promise.race([W.runAttempt({ attemptId: 'F01', ledger: l, transport: hung, timeoutMs: 100 }),
    new Promise((r) => setTimeout(() => r('HUNG'), 800))]);
  row('T1-never-settling-transport', out === 'HUNG', out === 'HUNG' ? 'runner still waiting after 800 ms' : `returned ${out.outcome}`);
}

const reproduced = rows.filter((r) => r.reproduced).length;
console.log(`\n${mode}: ${reproduced}/${rows.length} findings reproduce`);
const ok = mode === 'old' ? reproduced === rows.length : reproduced === 0;
console.log(ok ? `EXPECTATION MET (${mode === 'old' ? 'old candidate fails all eight' : 'repair fails none'})` : 'EXPECTATION NOT MET');
process.exit(ok ? 0 : 1);
