#!/usr/bin/env node
/**
 * JEV-INT-05 — defeat-candidate matrix for the BEHAVIOURAL DIFFERENTIAL (jev-wire-live-run-v1-differential.mjs).
 *
 * The differential asserts observable behaviour only. This matrix proves that each of its SAFETY/REPORT scenarios has teeth: every candidate
 * is a copy of the wrapper under test with ONE competent wrong edit (a safeguard removed or weakened), run through the differential as a child
 * process. A candidate counts as KILLED only if ALL of these hold — a printed failure line is never enough:
 *   1. the child exited with status exactly 1 (no signal, no spawn error, no timeout; 0 = nothing failed, 2 = not run, anything else = crash);
 *   2. it wrote its complete JSON report (every expected scenario id present, each row well-formed);
 *   3. its exit status agrees with that report (status 1 iff at least one SAFETY/REPORT row failed);
 *   4. the set of failing SAFETY/REPORT scenario ids EQUALS the candidate's declared set — a missing id (survivor in part) or an extra id
 *      (unclassified collateral) is a problem, so a candidate cannot die for a reason other than the one it names.
 * The unedited wrapper (reference) must exit 0 with a complete report and no SAFETY/REPORT failure. A guard of synthetic process records
 * proves the classifier itself rejects abnormal termination and inconsistent reports.
 *
 * Usage: node jev-wire-live-run-v1-differential-matrix.mjs [--wrapper PATH]     (default: the wrapper beside this file)
 * Env:   JEV_TEST_SECOND_DEVICE_ROOT | JEV_LR_SECOND_DEVICE_ROOT as for the differential.
 * Exit:  0 all candidates killed on their named scenarios · 1 problems · 2 reference not clean / not run · 3 classifier guard failed.
 */
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const DIFF = join(HERE, 'jev-wire-live-run-v1-differential.mjs');
const args = process.argv.slice(2);
const wrapperPath = resolve(args.includes('--wrapper') ? args[args.indexOf('--wrapper') + 1] : join(HERE, '..', 'jev-wire-live-run-v1.mjs'));
const WRAPPER_TEXT = readFileSync(wrapperPath, 'utf8');
const RUN_TIMEOUT_MS = 180_000;

// The scenario ids the differential must report, in full, on every run. If the instrument gains or loses a scenario this list must change with it.
const EXPECTED_IDS = ['D1', 'D2', 'D3', 'D4', 'D5', 'D6a', 'D6b', 'D6c', 'D6d', 'D7', 'D7b', 'D8', 'D8b', 'D9', 'D10a', 'D10b', 'D10c', 'D11', 'D12'];
const GATING = new Set(['SAFETY', 'REPORT']);

// [name, expected failing SAFETY/REPORT ids, why exactly these, edits[[from,to],…] — each `from` must occur exactly once in the wrapper]
const CANDIDATES = [
  ['DC-DM-REMOTE-CLOCK-ALLOWED', ['D3'], 'the real-provider branch no longer refuses an injected clock (a test clock defeats window and expiry)', [
    ["  if (grant.network === 'EXTERNAL_PINNED' && deps.now !== undefined)\n    return Object.freeze({ ran: false, refusal: 'REMOTE_TEST_CLOCK_FORBIDDEN', checks: report.checks, attempts: [] });\n", '']]],
  ['DC-DM-REMOTE-TRANSPORT-OVERRIDE-HONOURED', ['D1', 'D2'], 'both the refusal AND the forced use of the reviewed adapter are removed (either alone is a safe, equivalent behaviour)', [
    ["  if (grant.network === 'EXTERNAL_PINNED' && deps.createTransport !== undefined)\n    return Object.freeze({ ran: false, refusal: 'REMOTE_TRANSPORT_OVERRIDE_FORBIDDEN', checks: report.checks, attempts: [] });\n", ''],
    ["const makeTransport = grant.network === 'EXTERNAL_PINNED'\n    ? createJevHttpTransport : (deps.createTransport ?? createJevHttpTransport);", "const makeTransport = deps.createTransport ?? createJevHttpTransport;"]]],
  ['DC-DM-REMOTE-USES-INERT-STUB', ['D4'], 'the real-provider branch builds an inert stub instead of the reviewed adapter, so a missing credential is no longer refused at construction', [
    ["? createJevHttpTransport : (deps.createTransport ?? createJevHttpTransport);", "? (() => ({ send: async () => { throw new Error('inert'); } })) : (deps.createTransport ?? createJevHttpTransport);"]]],
  ['DC-DM-HISTORY-LOSS-RETHROWN', ['D5'], 'a ledger lost after the request is rethrown instead of returned as a structured stop', [
    ["  try { final = pair.state(); }\n  catch {", "  try { final = pair.state(); }\n  catch (e) { throw e; } if (false) {"]]],
  ['DC-DM-HISTORY-LOSS-CLAIMS-COMPLETE', ['D5'], 'unknown history is reported as completed', [
    ["stopped_reason: 'HISTORY_UNAVAILABLE', completed: false,", "stopped_reason: 'HISTORY_UNAVAILABLE', completed: true,"]]],
  ['DC-DM-HISTORY-LOSS-HIDES-HALT', ['D5'], 'unknown history is reported as not halted', [
    ["ledger_head: null, usd: null, halted: true,", "ledger_head: null, usd: null, halted: false,"]]],
  ['DC-DM-STORAGE-NEVER-RECHECKED', ['D6a', 'D6c', 'D7', 'D8', 'D9'], 'every after-preflight storage check is a no-op, so all five storage-drift scenarios fail together (the pair-agreement check still covers the three tamper scenarios)', [
    ["  const storageRefusal = () => {\n    try {", "  const storageRefusal = () => {\n    return null;\n    try {"]]],
  ['DC-DM-LOOP-ENTRY-CHECKS-REMOVED', ['D9'], 'the loop-entry and just-before-reservation checks are removed; other layers still cover D6/D7, but a completed run resumed with a swapped store has only these', [
    ["    const storageBefore = storageRefusal();\n    if (storageBefore) { stopped = storageBefore; break; }\n", ''],
    ["    const justBeforeReservation = storageRefusal();\n    if (justBeforeReservation) { stopped = justBeforeReservation; break; }\n", '']]],
  ['DC-DM-NO-RECHECK-AFTER-CREDENTIAL-CALLBACK', ['D8'], 'the recheck after the lazy credential callback is removed (nothing else sits between the guard and the written request)', [
    ["      if (storageRefusal()) throw new Error('STORAGE_CHANGED');\n", '']]],
  ['DC-DM-NO-PAIR-VERIFY-BEFORE-SEND', ['D10a', 'D10b', 'D10c'], 'ledger/anchor agreement is no longer verified at the dispatch boundary', [
    ["        const agreement = pair.verify();\n        if (!agreement.consistent) throw new Error('STORES_DISAGREE');\n", '']]],
  ['DC-DM-PAIR-VERIFY-RESULT-IGNORED', ['D10b'], 'the pair is verified but a reported disagreement is ignored. verify() THROWS for a deleted anchor (PAIR_CHECKPOINT_MISSING, D10a) and for a rolled-back ledger (PAIR_LEDGER_BEHIND, D10c); it only RETURNS consistent:false when the ledger is ahead of the anchor (D10b). First declared as [D10b, D10c]: the exact-set rule caught that mistaken prediction and the checkpoint module settled it', [
    ["        if (!agreement.consistent) throw new Error('STORES_DISAGREE');\n", "        void agreement;\n"]]],
  ['DC-DM-NO-DISPATCH-BOUNDARY-DEFENCES', ['D7', 'D8', 'D10a', 'D10b', 'D10c'], 'the guard storage check, the guard pair verification and the post-credential recheck are all removed', [
    ["        const onBoundary = storageRefusal();\n        if (onBoundary) throw new Error(onBoundary);\n", ''],
    ["        const agreement = pair.verify();\n        if (!agreement.consistent) throw new Error('STORES_DISAGREE');\n", ''],
    ["      if (storageRefusal()) throw new Error('STORAGE_CHANGED');\n", '']]],
  ['DC-DM-COMPLETED-IGNORES-STOP', ['D9'], 'completed no longer requires that the run was not stopped', [
    ["completed: stopped === null && final.used.size", "completed: final.used.size"]]],
  ['DC-DM-FREE-FLOOR-REMOVED', ['D11'], 'the minimum free-space configuration check is removed', [
    ["  if (!push(Number.isSafeInteger(minFreeBytes) && minFreeBytes >= MIN_FREE_BYTES\n    ? ok('MIN_FREE_SPACE_CONFIG')\n    : no('MIN_FREE_SPACE_CONFIG', 'the minimum must be a safe integer at least 64 MiB'))) return checks;\n", '']]],
  ['DC-DM-FREE-FLOOR-STRING-TOLERATED', ['D11'], 'the safe-integer requirement is dropped, so a numeric string passes the comparison by coercion', [
    ["Number.isSafeInteger(minFreeBytes) && minFreeBytes >= MIN_FREE_BYTES", "minFreeBytes >= MIN_FREE_BYTES"]]],
];

// ── the classifier ──────────────────────────────────────────────────────────
const sameSet = (a, b) => a.length === b.length && [...a].sort().every((x, i) => x === [...b].sort()[i]);
function failingIds(report) { return report.rows.filter((r) => GATING.has(r.class) && !r.pass).map((r) => r.id).sort(); }
function reportProblem(report) {                          // returns a reason string, or null when the report is complete and well-formed
  if (!report || !Array.isArray(report.rows)) return 'NO_REPORT';
  const ids = report.rows.map((r) => r && r.id);
  if (!sameSet(ids, EXPECTED_IDS)) return 'INCOMPLETE_REPORT';
  if (!report.rows.every((r) => typeof r.pass === 'boolean' && typeof r.class === 'string')) return 'MALFORMED_ROW';
  return null;
}
/** A process record is {status, signal, spawnError, report}. Returns {valid, reason}. */
function classifyKill(rec, expected) {
  if (rec.spawnError) return { valid: false, reason: 'SPAWN_ERROR_OR_TIMEOUT:' + rec.spawnError };
  if (rec.signal) return { valid: false, reason: 'SIGNAL:' + rec.signal };
  if (rec.status !== 1) return { valid: false, reason: 'STATUS_' + rec.status };
  const p = reportProblem(rec.report); if (p) return { valid: false, reason: p };
  const failing = failingIds(rec.report);
  if (failing.length === 0) return { valid: false, reason: 'EXIT_1_WITHOUT_A_FAILING_ROW' };
  if (!sameSet(failing, expected)) return { valid: false, reason: `WRONG_SET got [${failing.join(',')}] expected [${[...expected].join(',')}]` };
  return { valid: true, reason: null };
}
function classifyReference(rec) {
  if (rec.spawnError || rec.signal) return { valid: false, reason: 'ABNORMAL_TERMINATION' };
  if (rec.status !== 0) return { valid: false, reason: 'STATUS_' + rec.status };
  const p = reportProblem(rec.report); if (p) return { valid: false, reason: p };
  const failing = failingIds(rec.report);
  return failing.length === 0 ? { valid: true, reason: null } : { valid: false, reason: 'EXIT_0_WITH_FAILING_ROWS' };
}

// guard fixtures: synthetic process records, not wrapper mutants
const rowsAllPass = () => EXPECTED_IDS.map((id) => ({ id, class: id === 'D12' ? 'INFO' : 'SAFETY', pass: true }));
const rowsFailing = (ids) => rowsAllPass().map((r) => (ids.includes(r.id) ? { ...r, pass: false } : r));
const GUARD = [
  ['normal named kill', { status: 1, signal: null, spawnError: null, report: { rows: rowsFailing(['D3']) } }, ['D3'], true],
  ['timeout after the report was partly printed', { status: null, signal: 'SIGTERM', spawnError: 'ETIMEDOUT', report: { rows: rowsFailing(['D3']) } }, ['D3'], false],
  ['killed by a signal', { status: null, signal: 'SIGKILL', spawnError: null, report: { rows: rowsFailing(['D3']) } }, ['D3'], false],
  ['spawn error', { status: null, signal: null, spawnError: 'ENOENT', report: null }, ['D3'], false],
  ['crash (status 3) with a stale report', { status: 3, signal: null, spawnError: null, report: { rows: rowsFailing(['D3']) } }, ['D3'], false],
  ['not run (status 2)', { status: 2, signal: null, spawnError: null, report: null }, ['D3'], false],
  ['no report written', { status: 1, signal: null, spawnError: null, report: null }, ['D3'], false],
  ['incomplete report (rows missing)', { status: 1, signal: null, spawnError: null, report: { rows: rowsFailing(['D3']).slice(0, 10) } }, ['D3'], false],
  ['status 1 but no failing row', { status: 1, signal: null, spawnError: null, report: { rows: rowsAllPass() } }, ['D3'], false],
  ['extra failing scenario (unclassified collateral)', { status: 1, signal: null, spawnError: null, report: { rows: rowsFailing(['D3', 'D5']) } }, ['D3'], false],
  ['named scenario did not fail (wrong death)', { status: 1, signal: null, spawnError: null, report: { rows: rowsFailing(['D5']) } }, ['D3'], false],
  ['a failing STRICTNESS row is not gating', { status: 1, signal: null, spawnError: null, report: { rows: rowsFailing(['D3']).map((r) => (r.id === 'D6b' ? { ...r, class: 'STRICTNESS', pass: false } : r)) } }, ['D3'], true],
];
let guardPass = 0;
for (const [name, rec, expected, want] of GUARD) {
  const got = classifyKill(rec, expected).valid;
  if (got !== want) { console.log(`HARNESS-GUARD-FAIL  ${name} (classified ${got}, wanted ${want})`); process.exit(3); }
  guardPass += 1;
}
const REF_GUARD = [
  ['reference clean', { status: 0, signal: null, spawnError: null, report: { rows: rowsAllPass() } }, true],
  ['reference exit 0 but a failing row', { status: 0, signal: null, spawnError: null, report: { rows: rowsFailing(['D3']) } }, false],
  ['reference timed out', { status: null, signal: 'SIGTERM', spawnError: 'ETIMEDOUT', report: null }, false],
  ['reference without a report', { status: 0, signal: null, spawnError: null, report: null }, false],
];
for (const [name, rec, want] of REF_GUARD) {
  if (classifyReference(rec).valid !== want) { console.log(`HARNESS-GUARD-FAIL  ${name}`); process.exit(3); }
  guardPass += 1;
}
console.log(`HARNESS-GUARD  ${guardPass}/${GUARD.length + REF_GUARD.length} classifier regressions pass\n`);

// ── running ─────────────────────────────────────────────────────────────────
const scratch = mkdtempSync(join(tmpdir(), 'jev-dm-'));
function runDifferential(wrapperFile, name) {
  const out = join(scratch, name + '.json'); try { rmSync(out, { force: true }); } catch { /* none */ }
  const r = spawnSync(process.execPath, [DIFF, '--label', name, '--wrapper', wrapperFile, '--json', out], { encoding: 'utf8', timeout: RUN_TIMEOUT_MS, env: { ...process.env } });
  let report = null; if (existsSync(out)) { try { report = JSON.parse(readFileSync(out, 'utf8')); } catch { report = null; } }
  return { status: r.status, signal: r.signal, spawnError: r.error ? (r.error.code || r.error.message) : null, report, tail: String(r.stdout || '').split('\n').slice(-3).join(' | ') };
}
function candidateFile(name, edits) {
  let text = WRAPPER_TEXT;
  for (const [from, to] of edits) {
    const count = text.split(from).length - 1;
    if (count !== 1) throw new Error(`EDIT_NOT_UNIQUE (${count}) in ${name}: ${from.slice(0, 70)}`);
    text = text.replace(from, () => to);
  }
  const f = join(scratch, name + '.mjs'); writeFileSync(f, text); return f;
}

const ref = runDifferential(wrapperPath, 'reference');
const refVerdict = classifyReference(ref);
if (!refVerdict.valid) {
  console.log(`REFERENCE NOT CLEAN  ${refVerdict.reason}  ${ref.status === 2 ? '(NOT RUN: no verified second device)' : ref.tail}`);
  rmSync(scratch, { recursive: true, force: true }); process.exit(2);
}
console.log('REFERENCE  clean (complete report, 0 SAFETY/REPORT failures)\n');

let killed = 0; let problems = 0;
for (const [name, expected, why, edits] of CANDIDATES) {
  let file; try { file = candidateFile(name, edits); } catch (e) { problems += 1; console.log(`INVALID-CANDIDATE  ${name}  ${e.message}`); continue; }
  const rec = runDifferential(file, name);
  const failing = rec.report ? failingIds(rec.report) : [];
  if (rec.status === 0 && !rec.signal && !rec.spawnError) { problems += 1; console.log(`SURVIVED  ${name}  (expected ${expected.join(',')})`); continue; }
  const verdict = classifyKill(rec, expected);
  if (!verdict.valid) { problems += 1; console.log(`WRONG-DEATH  ${name}  ${verdict.reason}  [failing: ${failing.join(',') || '-'}]`); continue; }
  killed += 1; console.log(`KILLED  ${name}  on ${expected.join(',')}`);
}
rmSync(scratch, { recursive: true, force: true });
console.log(`\n${killed}/${CANDIDATES.length} candidates killed on exactly their named scenarios · ${problems} problems`);
process.exit(problems === 0 ? 0 : 1);
