#!/usr/bin/env node
/**
 * JEV-INT-05 — defeat-candidate matrix for the DEFAULT-DISABLED live-run wrapper. Each candidate is the smallest competent
 * WRONG edit of the wrapper. It must die on its NAMED check — not crash, hang or time out unnamed.
 */
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const PROOF = join(dirname(fileURLToPath(import.meta.url)), 'jev-wire-live-run-v1-proof.mjs');

const CANDIDATES = [
  ['DC-LR-IGNORES-OFF-SWITCH', 'L1', [["if (RESPONSE_SHAPE.witnessed !== true) return stop(", "if (false) return stop("]]],
  ['DC-LR-GRANT-SHAPE-LOOSE', 'L2', [["Object.keys(o).length === GRANT_MEMBERS.length && ", ""]]],
  ['DC-LR-STATE-UNCHECKED', 'L2', [["grant.state === 'AUTHORIZED' ? ok('GRANT_STATE')", "true ? ok('GRANT_STATE')"]]],
  ['DC-LR-SPEND-ABOVE-CODE-CAP', 'L2', [[" && grant.ceiling_usd <= BUDGET.ceiling_usd", ""]]],
  ['DC-LR-ATTEMPTS-ABOVE-CODE-CAP', 'L2', [[" && grant.max_attempts <= BUDGET.max_attempts", ""]]],
  ['DC-LR-WINDOW-UNBOUNDED', 'L2', [[" && to - from <= MAX_WINDOW_MS", ""]]],
  ['DC-LR-WINDOW-NOT-CHECKED', 'L2', [["t >= from && t < to ? ok('WINDOW_OPEN')", "true ? ok('WINDOW_OPEN')"]]],
  ['DC-LR-TABLE-HASH-UNBOUND', 'L2', [["grant.table_hash === questionTableHash() ? ok('TABLE_HASH')", "true ? ok('TABLE_HASH')"]]],
  ['DC-LR-REMOTE-WITH-MOCK-VOLUMES', 'L2', [["grant.volume_policy === 'SAME_DEVICE_MOCK_ONLY' && grant.network !== 'LOOPBACK_ONLY'", "false"], ["grant.endpoint === PINNED_ENDPOINT && grant.volume_policy === 'DISTINCT_DEVICES'", "grant.endpoint === PINNED_ENDPOINT"]]],
  ['DC-LR-ENDPOINT-NOT-PINNED', 'L2', [["grant.endpoint === PINNED_ENDPOINT && grant.volume_policy === 'DISTINCT_DEVICES'", "grant.volume_policy === 'DISTINCT_DEVICES'"]]],
  ['DC-LR-NAMES-OPTIONAL', 'L2', [["['operator', 'authorized_by', 'authorization_ref'].every(", "['operator', 'authorized_by', 'authorization_ref'].some(("], ["typeof grant[k] === 'string' && grant[k].trim() !== '')", "typeof grant[k] === 'string' && grant[k].trim() !== ''))"]]],
  ['DC-LR-CONFIRMATION-SKIPPED', 'L2', [["if (confirmGrantHash !== h) return stop(", "if (false) return stop("]]],
  ['DC-LR-MOUNT-UNVERIFIED', 'L3', [["    if (!push(mounted ? ok('CHECKPOINT_MOUNTED')", "    if (!push(true ? ok('CHECKPOINT_MOUNTED')"]]],
  ['DC-LR-SAME-DEVICE-REAL-RUN', 'L3', [["lDev !== cDev ? ok('DEVICES_DISTINCT')", "true ? ok('DEVICES_DISTINCT')"]]],
  ['DC-LR-LOW-SPACE-ACCEPTED', 'L3', [["free >= minFreeBytes ? ok(id)", "true ? ok(id)"]]],
  ['DC-LR-STALE-LOCK-IGNORED', 'L3', [["!existsSync(ledgerPath + '.lock') && !existsSync(ledgerPath + '.pair.lock')", "true"]]],
  ['DC-LR-DIR-LINK-ACCEPTED', 'L3', [["const l = lstatSync(path); return l.isDirectory() && !l.isSymbolicLink();", "const l = statSync(path); return l.isDirectory();"]]],
  ['DC-LR-INITIALIZE-OVER-EXISTING', 'L4', [["if (ledgerThere || cpThere) return stop(", "if (false) return stop("]]],
  ['DC-LR-RESUME-WITHOUT-STORES', 'L4', [["if (!ledgerThere || !cpThere) return stop(", "if (false) return stop("]]],
  ['DC-LR-RESUME-IGNORES-DISAGREEMENT', 'L4', [["if (!v.consistent) return stop(", "if (false) return stop("]]],
  ['DC-LR-RESUME-IGNORES-UNRESOLVED', 'L4', [["if (s.unresolved.length) return stop(", "if (false) return stop("]]],
  ['DC-LR-RESUME-IGNORES-HALT', 'L4', [["if (s.halted) return stop(", "if (false) return stop("]]],
  ['DC-LR-ATTEMPT-CAP-IGNORED', 'L6', [["if (before.attempts >= grant.max_attempts) {", "if (false) {"]]],
  ['DC-LR-SPEND-CAP-IGNORED', 'L6', [["if (before.usd + BUDGET.reserve_usd > grant.ceiling_usd) {", "if (false) {"]]],
  ['DC-LR-SPEND-CAP-OMITS-RESERVE', 'L6', [["before.usd + BUDGET.reserve_usd > grant.ceiling_usd", "before.usd > grant.ceiling_usd"]]],
  ['DC-LR-CONTINUES-AFTER-FAILURE', 'L7', [["if (r.outcome !== 'ok') { stopped = r.reason ?? r.outcome ?? 'NOT_SENT'; break; }", "if (r.outcome !== 'ok') { stopped = r.reason ?? r.outcome ?? 'NOT_SENT'; }"]]],
  ['DC-LR-EXPIRY-ONLY-AT-START', 'L8', [["if (now() >= Date.parse(grant.expires_at)) {", "if (false) {"]]],
  ['DC-LR-REMOTE-ALWAYS-ALLOWED', 'L10', [["allowRemote: grant.network === 'EXTERNAL_PINNED'", "allowRemote: true"]]],
  ['DC-LR-REMOTE-NEVER-FOLLOWS-GRANT', 'L10', [["allowRemote: grant.network === 'EXTERNAL_PINNED'", "allowRemote: false"]]],
  ['DC-LR-CREDENTIAL-PREFETCHED', 'L9', [["credential: deps.credential, allowRemote", "credential: (() => { const k = deps.credential?.(); return () => k; })(), allowRemote"]]],
  ['DC-LR-READS-ENVIRONMENT', 'L11', [["export const GRANT_INSTRUMENT", "const _k = process.env.JEV_KEY;\nexport const GRANT_INSTRUMENT"]]],
  ['DC-LR-LOGS-PROGRESS', 'L11', [["    attempts.push(Object.freeze(", "    console.log('attempt', id);\n    attempts.push(Object.freeze("]]],
  ['DC-LR-SUMMARY-CARRIES-GRANT', 'L12', [["ran: true, refusal: null, checks: report.checks,", "ran: true, refusal: null, grant, checks: report.checks,"]]],
  // ── Mac review 8e04f8006 (LW1–LW4) ──
  ['DC-LR-INJECTION-UNDER-REMOTE-GRANT', 'L13', [["    if (deps.createTransport !== undefined) throw new Error('TRANSPORT_INJECTION_REFUSED');\n", ""]]],
  ['DC-LR-HISTORY-LOSS-THROWS', 'L14', [["    historyLost = true; stopped = 'HISTORY_UNAVAILABLE';\n  }", "    throw new Error('LEDGER_NOT_INITIALIZED');\n  }"]]],
  ['DC-LR-STORAGE-ONLY-AT-PREFLIGHT', 'L15', [["  const storageSame = () => verifyStorageIdentity(identity, { ledgerPath, checkpointPath, minFreeBytes: minFree });", "  const storageSame = () => true;"]]],
  ['DC-LR-NO-DISPATCH-RECHECK', 'L15', [["    if (!storageSame()) { dispatchRefused = true; return Promise.reject(new Error('STORAGE_CHANGED')); }\n", ""]]],
  ['DC-LR-NO-PREATTEMPT-RECHECK', 'L15', [["      if (!storageSame()) { stopped = 'STORAGE_CHANGED'; break; }\n", ""]]],
  ['DC-LR-IDENTITY-DEVICE-ONLY', 'L15', [["return realpathSync(d) === c.real && st.dev === c.dev && st.ino === c.ino;", "return st.dev === c.dev;"]]],
  ['DC-LR-RECHECK-DEVICE-NOT-VERIFIED', 'L15', [
    ["    if (!dirOk(ledgerDir) || !dirOk(cpDir)) return false;\n", ""],
    ["return realpathSync(d) === c.real && st.dev === c.dev && st.ino === c.ino;", "return true;"],
    ["      if (snap.ledger.dev === statSync(cpDir).dev) return false;\n", ""],
    ["      if (statSync(mp).dev === statSync(dirname(mp)).dev || statSync(mp).dev !== statSync(cpDir).dev) return false;\n", ""]]],
  ['DC-LR-FREE-FLOOR-LOWERABLE', 'L16', [["Number.isSafeInteger(minFreeBytes) && minFreeBytes >= MIN_FREE_BYTES\n", "Number.isFinite(minFreeBytes) && minFreeBytes >= 0\n"]]],
  ['DC-LR-FREE-FLOOR-NOT-ENFORCED', 'L16', [["Number.isSafeInteger(minFreeBytes) && minFreeBytes >= MIN_FREE_BYTES\n", "true\n"]]],
];

function run(edits) {
  const env = { ...process.env };
  if (edits.length) env.JEV_LR_EDITS = JSON.stringify(edits); else delete env.JEV_LR_EDITS;
  const r = spawnSync(process.execPath, [PROOF], { encoding: 'utf8', env, timeout: 280000 });
  const fails = [...(r.stdout || '').matchAll(/^FAIL  (\S+)/gm)].map((m) => m[1]);
  return { status: r.status, fails, tail: (((r.stderr || '') + '') + ((r.stdout || '').slice(-200))).split('\n').slice(0, 3).join(' | ') };
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
