#!/usr/bin/env node
/**
 * JEV-INT-05 — defeat-candidate matrix for the INACTIVE HTTP adapter. Each candidate is the smallest competent
 * WRONG edit of the adapter. It must die on its NAMED check — not crash, hang or time out unnamed.
 */
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const PROOF = join(dirname(fileURLToPath(import.meta.url)), 'jev-wire-http-adapter-v1-proof.mjs');
const BAIL_DESTROY = "        try { if (response) response.destroy(); } catch { /* already closed */ }\n        try { if (req) req.destroy(); } catch { /* already closed */ }\n";

const CANDIDATES = [
  ['DC-AD-REMOTE-BY-DEFAULT', 'A1', [["  if (allowRemote !== true) throw fail('ADAPTER_REMOTE_NOT_ALLOWED');\n", '']]],
  ['DC-AD-HOST-NOT-PINNED', 'A1', [['u.hostname !== PINNED_REMOTE.hostname', 'false']]],
  ['DC-AD-CONSTRUCTION-CREDENTIAL-UNCHECKED', 'A1', [["  if (typeof credential === 'string' && !/^[\\x21-\\x7e]+$/.test(credential)) throw fail('ADAPTER_CREDENTIAL_INVALID');\n", '']]],
  ['DC-AD-SEND-CREDENTIAL-UNCHECKED', 'A1b', [["    if (typeof key !== 'string' || !/^[\\x21-\\x7e]+$/.test(key)) return Promise.reject(fail('ADAPTER_CREDENTIAL_INVALID'));\n", '']]],
  ['DC-AD-REBUILDS-BODY', 'A2', [["const bytes = Buffer.from(bodyJson, 'utf8');", "const bytes = Buffer.from(JSON.stringify(JSON.parse(bodyJson), null, 1), 'utf8');"]]],
  ['DC-AD-HASH-NOT-CHECKED', 'A2', [["    if (bodyHash !== undefined && sha256(bodyJson) !== bodyHash) return Promise.reject(fail('ADAPTER_BODY_HASH_MISMATCH'));\n", '']]],
  ['DC-AD-NO-CONTENT-TYPE-CHECK', 'A3', [["        if (!/^application\\/json\\b/i.test(String(res.headers['content-type'] || ''))) return bail('ADAPTER_CONTENT_TYPE', { status });\n", '']]],
  ['DC-AD-NO-SIZE-CAP', 'A3', [["          if (size > maxResponseBytes) return bail('ADAPTER_RESPONSE_TOO_LARGE');\n", '']]],
  ['DC-AD-INCOMPLETE-BODY-ACCEPTED', 'A3', [
    ["        res.on('close', () => { if (!res.complete) bail('ADAPTER_RESPONSE_INCOMPLETE'); });\n", ''],
    ["        res.on('error', () => bail('ADAPTER_RESPONSE_INCOMPLETE'));\n", '']]],
  ['DC-AD-HTTP-ERROR-ACCEPTED', 'A4', [["        if (status < 200 || status >= 300) return bail('ADAPTER_HTTP_ERROR', { status });\n", '']]],
  ['DC-AD-RETRIES', 'A4', [["send: (bodyJson, opts) => attempt(bodyJson, opts)", "send: (bodyJson, opts) => attempt(bodyJson, opts).catch(() => attempt(bodyJson, opts))"]]],
  ['DC-AD-FOLLOWS-REDIRECTS', 'A5', [[
    "if (status >= 300 && status < 400) return bail('ADAPTER_REDIRECT_REFUSED', { status });",
    "if (status >= 300 && status < 400) { http.get(res.headers.location, (r2) => { r2.resume(); }).on('error', () => {}); return bail('ADAPTER_REDIRECT_REFUSED', { status }); }"]]],
  ['DC-AD-DEADLINE-ENDS-AT-HEADERS', 'A6', [["        response = res;\n", "        response = res; clearTimeout(timer);\n"]]],
  ['DC-AD-IDLE-ONLY-DEADLINE', 'A6', [["        res.on('data', (chunk) => {\n          size += chunk.length;", "        res.on('data', (chunk) => {\n          arm(); size += chunk.length;"]]],
  ['DC-AD-SOCKET-LEFT-OPEN', 'A6', [[BAIL_DESTROY, '']]],
  ['DC-AD-IGNORES-ABORT-SIGNAL', 'A7', [["      if (signal) signal.addEventListener('abort', onAbort, { once: true });\n", "      void onAbort;\n"]]],
  ['DC-AD-LOGS-CREDENTIAL', 'A9', [["      const bail = (code, extra) => {\n", "      const bail = (code, extra) => {\n        console.error('failed with Authorization: Bearer ' + key);\n"]]],
  ['DC-AD-READS-ENVIRONMENT', 'A14', [["export const PINNED_REMOTE", "const _k = process.env.JEV_KEY;\nexport const PINNED_REMOTE"]]],
];

function run(edits) {
  const env = { ...process.env };
  if (edits.length) env.JEV_AD_EDITS = JSON.stringify(edits); else delete env.JEV_AD_EDITS;
  const r = spawnSync(process.execPath, [PROOF], { encoding: 'utf8', env, timeout: 240000 });
  const fails = [...(r.stdout || '').matchAll(/^FAIL  (\S+)/gm)].map((m) => m[1]);
  return { status: r.status, fails, tail: ((r.stderr || '') + '').split('\n').slice(0, 3).join(' | ') };
}

const ref = run([]);
if (ref.status !== 0 || ref.fails.length) { console.log('REFERENCE NOT CLEAN', ref); process.exit(2); }
console.log('REFERENCE  clean (0 failed)\n');
let killed = 0; let problems = 0;
for (const [name, expected, edits] of CANDIDATES) {
  const out = run(edits);
  const onName = out.fails.some((f) => f.startsWith(expected + '-'));
  const collateral = out.fails.filter((f) => !f.startsWith(expected + '-'));
  if (out.status === 0) { problems += 1; console.log(`SURVIVED  ${name}  (expected ${expected})`); continue; }
  if (!onName) { problems += 1; console.log(`WRONG-DEATH  ${name}  expected ${expected}, got [${out.fails.join(', ') || out.tail}]`); continue; }
  killed += 1;
  console.log(`KILLED  ${name}  on ${expected}` + (collateral.length ? `   collateral: ${collateral.join(', ')}` : ''));
}
console.log(`\n${killed}/${CANDIDATES.length} candidates killed on their named check · ${problems} problems`);
process.exit(problems === 0 ? 0 : 1);
