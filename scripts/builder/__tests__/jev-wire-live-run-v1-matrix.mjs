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
  ['DC-LR-CREDENTIAL-PREFETCHED', 'L9', [[
    `  const credential = typeof deps.credential === 'function'
    ? () => {
      const key = deps.credential();
      if (storageRefusal()) throw new Error('STORAGE_CHANGED');
      return key;
    }
    : deps.credential;`,
    "  const credential = typeof deps.credential === 'function' ? deps.credential() : deps.credential;"
  ]]],
  ['DC-LR-READS-ENVIRONMENT', 'L11', [["export const GRANT_INSTRUMENT", "const _k = process.env.JEV_KEY;\nexport const GRANT_INSTRUMENT"]]],
  ['DC-LR-LOGS-PROGRESS', 'L11', [["    attempts.push(Object.freeze({ id, sent: r.sent, outcome: r.outcome ?? null, reason: r.reason ?? null }));", "    console.log('attempt', id);\n    attempts.push(Object.freeze({ id, sent: r.sent, outcome: r.outcome ?? null, reason: r.reason ?? null }));"]]],
  ['DC-LR-SUMMARY-CARRIES-GRANT', 'L12', [[`    stopped_reason: stopped,
    completed:`,
     `    grant, stopped_reason: stopped,
    completed:`]]],
  // ── independent Mac review 8e04f8006: live-wrapper-only corrections ──
  ['DC-LR-REMOTE-FAKE-TRANSPORT-ALLOWED', 'L13', [
    ["  if (grant.network === 'EXTERNAL_PINNED' && deps.createTransport !== undefined)", "  if (false && deps.createTransport !== undefined)"],
    [`  const makeTransport = grant.network === 'EXTERNAL_PINNED'
    ? createJevHttpTransport : (deps.createTransport ?? createJevHttpTransport);`,
     "  const makeTransport = deps.createTransport ?? createJevHttpTransport;"]]],
  ['DC-LR-REMOTE-TEST-CLOCK-ALLOWED', 'L13', [[
    "  if (grant.network === 'EXTERNAL_PINNED' && deps.now !== undefined)",
    "  if (false && deps.now !== undefined)"]]],
  ['DC-LR-LEDGER-LOSS-THROWS', 'L14', [[
    `  catch {
    // A missing/unreadable ledger after crossing is NOT a successful completion.`,
    `  catch {
    throw new Error('LEDGER_NOT_INITIALIZED');
    // A missing/unreadable ledger after crossing is NOT a successful completion.`]]],
  ['DC-LR-HISTORY-UNKNOWN-CLAIMED-COMPLETE', 'L14', [[
    "stopped_reason: 'HISTORY_UNAVAILABLE', completed: false,",
    "stopped_reason: 'HISTORY_UNAVAILABLE', completed: true,"]]],
  ['DC-LR-MOUNT-IDENTITY-ONLY-AT-PREFLIGHT', 'L15', [[
    `  const storageRefusal = () => {
    try {`,
    `  const storageRefusal = () => { return null;
    try {`]]],
  ['DC-LR-FREE-SPACE-FLOOR-DISABLED', 'L16', [[
    "Number.isSafeInteger(minFreeBytes) && minFreeBytes >= MIN_FREE_BYTES",
    "Number.isSafeInteger(minFreeBytes) && minFreeBytes >= 0"]]],
  ['DC-LR-FREE-SPACE-NONFINITE-TOLERATED', 'L16', [[
    "Number.isSafeInteger(minFreeBytes) && minFreeBytes >= MIN_FREE_BYTES",
    "typeof minFreeBytes === 'number' && minFreeBytes >= MIN_FREE_BYTES"]]],
  ['DC-LR-PHYSICAL-SEND-GUARD-BYPASSED', 'L15', [
    [`    const storageBefore = storageRefusal();
    if (storageBefore) { stopped = storageBefore; break; }`,
     `    const storageBefore = null;
    if (storageBefore) { stopped = storageBefore; break; }`],
    ["    const justBeforeReservation = storageRefusal();",
     "    const justBeforeReservation = null;"],
    ["    const after = storageRefusal();",
     "    const after = null;"],
    ["        const onBoundary = storageRefusal();",
     "        const onBoundary = null;"]]],
];

function run(edits, onlyCheck = null) {
  const env = { ...process.env };
  if (edits.length) env.JEV_LR_EDITS = JSON.stringify(edits); else delete env.JEV_LR_EDITS;
  if (onlyCheck) env.JEV_LR_ONLY_CHECK = onlyCheck; else delete env.JEV_LR_ONLY_CHECK;
  const r = spawnSync(process.execPath, [PROOF], { encoding: 'utf8', env, timeout: 60000 });
  const fails = [...(r.stdout || '').matchAll(/^FAIL  (\S+)/gm)].map((m) => m[1]);
  const summary = (r.stdout || '').match(/(\d+) passed · (\d+) failed/);
  return { status: r.status, signal: r.signal, timeout: r.error?.message || null, fails,
    summary: summary ? { pass: Number(summary[1]), fail: Number(summary[2]) } : null,
    tail: (((r.stderr || '') + '') + ((r.stdout || '').slice(-200))).split('\n').slice(0, 3).join(' | ') };
}

function validNamedKill(out, expected) {
  const onName = out.fails.some((f) => f.startsWith(expected + '-'));
  return onName && out.status === 1 && !out.signal && !out.timeout && !!out.summary
    && out.summary.pass === 0 && out.summary.fail === 1 && out.fails.length === 1;
}

// Harness-classifier regressions. These are synthetic process-result records, not wrapper mutants.
// A printed named failure is never enough: timeout, signal, spawn error, or incomplete proof output
// must be classified as an invalid kill so a broken harness cannot make the matrix look stronger.
const HARNESS_CLASSIFIER_CASES = [
  ['normal named assertion failure', { status: 1, signal: null, timeout: null, fails: ['L2-example'], summary: { pass: 0, fail: 1 } }, true],
  ['timeout after named failure', { status: null, signal: 'SIGTERM', timeout: 'ETIMEDOUT', fails: ['L2-example'], summary: { pass: 0, fail: 1 } }, false],
  ['signal after named failure', { status: null, signal: 'SIGTERM', timeout: null, fails: ['L2-example'], summary: { pass: 0, fail: 1 } }, false],
  ['spawn error after named failure text', { status: null, signal: null, timeout: 'ENOENT', fails: ['L2-example'], summary: { pass: 0, fail: 1 } }, false],
  ['incomplete proof output', { status: 1, signal: null, timeout: null, fails: ['L2-example'], summary: null }, false],
];
let harnessGuardPass = 0;
for (const [name, sample, expected] of HARNESS_CLASSIFIER_CASES) {
  const actual = validNamedKill(sample, 'L2');
  if (actual !== expected) { console.log(`HARNESS-GUARD-FAIL  ${name}`); process.exit(3); }
  harnessGuardPass += 1;
}
console.log(`HARNESS-GUARD  ${harnessGuardPass}/${HARNESS_CLASSIFIER_CASES.length} classifier regressions pass\n`);

const ref = run([]);
if (ref.status !== 0 || ref.fails.length || ref.summary?.pass !== 16 || ref.summary?.fail !== 0) { console.log('REFERENCE NOT CLEAN', ref); process.exit(2); }
console.log('REFERENCE  clean (0 failed)\n');
let killed = 0; let problems = 0;
for (const [name, expected, edits] of CANDIDATES) {
  const out = run(edits, expected);
  const onName = out.fails.some((f) => f.startsWith(expected + '-'));
  const collateral = out.fails.filter((f) => !f.startsWith(expected + '-'));
  if (out.status === 0) { problems += 1; console.log(`SURVIVED  ${name}  (expected ${expected})`); continue; }
  if (!validNamedKill(out, expected)) {
    problems += 1;
    console.log(`WRONG-DEATH  ${name}  expected ${expected}, got [${out.fails.join(', ') || out.tail}]`);
    continue;
  }
  killed += 1;
  console.log(`KILLED  ${name}  on ${expected}` + (collateral.length ? `   collateral: ${collateral.join(', ')}` : ''));
}
console.log(`\n${killed}/${CANDIDATES.length} candidates killed on their named check · ${problems} problems`);
process.exit(problems === 0 ? 0 : 1);
