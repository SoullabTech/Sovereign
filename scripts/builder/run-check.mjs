#!/usr/bin/env node
/**
 * jarvis run-check — structured deterministic verification wrapper (Horizon III, Unit 4).
 *
 * WHY THIS EXISTS
 *   Delegation results are not evidence until independently verified (`AIN_RESULT_CONTRACT.md`
 *   §"Claude's review contract" — worker claim ≠ verification result). Without this wrapper,
 *   "verified" means an LLM reads raw terminal output and judges pass/fail — exactly the
 *   failure mode §4 of the MVJ proof directive forbids ("Do not make an LLM interpret raw
 *   terminal output to determine whether a deterministic command passed").
 *
 * WHAT IT IS NOT
 *   Not a test framework. Not a CI system. It runs ONE named or ad-hoc command, captures its
 *   exit code, and returns a structured PASS/FAIL — nothing interprets the output to decide.
 *
 * REGISTRY (built-in named checks — extend deliberately, not by convention-guessing)
 *   typecheck   npm run typecheck            (no-regression gate, see CLAUDE.md)
 *   lint        npm run lint
 *
 * AD-HOC (for verification_commands from a delegation packet, e.g. `node x/y.test.js`)
 *   --cmd "<shell command>"   run exactly this, in --cwd if given
 *
 * Usage
 *   node scripts/builder/run-check.mjs typecheck [--cwd <dir>] [--json]
 *   node scripts/builder/run-check.mjs proving-case-add-fn --cmd "node scripts/x/add.test.js" \
 *        --cwd <worktree> --work-unit proving-case-add-fn [--json]
 *
 * Exit code mirrors the underlying command: 0 PASS, non-zero FAIL. Wrapper-level errors
 * (unknown check, bad invocation) exit 2, distinct from a check that legitimately failed.
 */
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REGISTRY = {
  typecheck: 'npm run typecheck',
  lint: 'npm run lint',
};

const args = process.argv.slice(2);
const flag = (n) => args.includes(n);
const opt = (n, d = null) => { const i = args.indexOf(n); return i !== -1 && args[i + 1] ? args[i + 1] : d; };

const name = args[0];
if (!name || name.startsWith('--')) {
  console.error('usage: run-check.mjs <name> [--cmd "<command>"] [--cwd <dir>] [--work-unit <id>] [--sha <sha>] [--json]');
  console.error(`  built-in checks: ${Object.keys(REGISTRY).join(', ')}`);
  process.exit(2);
}

const cwd = opt('--cwd') || process.cwd();
if (!existsSync(cwd)) {
  console.error(`🛑 --cwd does not exist: ${cwd}`);
  process.exit(2);
}

const command = opt('--cmd') || REGISTRY[name];
if (!command) {
  console.error(`🛑 unknown check '${name}' — no --cmd given and not in the built-in registry.`);
  console.error(`   built-in checks: ${Object.keys(REGISTRY).join(', ')}`);
  console.error(`   for a one-off (e.g. a delegation packet's verification_commands), pass --cmd`);
  process.exit(2);
}

const workUnit = opt('--work-unit');
const shaAtRun = opt('--sha')
  || spawnSync('git', ['rev-parse', '--short', 'HEAD'], { cwd, encoding: 'utf8' }).stdout?.trim()
  || null;

const startedAt = new Date().toISOString();
const t0 = Date.now();

// Run through the shell — commands here are AUTHORED (registry) or supplied by the caller
// who already owns the packet's authority boundary; this wrapper adds no new trust surface.
const proc = spawnSync(command, { cwd, shell: true, encoding: 'utf8' });

const endedAt = new Date().toISOString();
const durationMs = Date.now() - t0;
const exitCode = proc.status ?? (proc.signal ? 128 : 1);
const passed = exitCode === 0;

// Bounded output capture — a check must never re-flood the context it was built to protect.
const OUTPUT_CAP = 4000;
const clip = (s) => {
  if (!s) return '';
  return s.length > OUTPUT_CAP
    ? s.slice(0, OUTPUT_CAP) + `\n… [${s.length - OUTPUT_CAP} more chars truncated]`
    : s;
};

const result = {
  check: name,
  command,
  cwd,
  work_unit: workUnit,
  sha: shaAtRun,
  started_at: startedAt,
  ended_at: endedAt,
  duration_ms: durationMs,
  exit_code: exitCode,
  status: passed ? 'PASS' : 'FAIL',
  // stdout/stderr are EVIDENCE, not the verdict — the verdict is exit_code above, computed
  // before any of this string ever exists. Nothing here is interpreted to decide pass/fail.
  stdout: clip(proc.stdout),
  stderr: clip(proc.stderr),
};

if (flag('--json')) {
  console.log(JSON.stringify(result, null, 2));
} else {
  console.log(`run-check ${name}  [${result.status}]`);
  console.log(`  command    ${command}`);
  console.log(`  cwd        ${cwd}`);
  if (workUnit) console.log(`  work_unit  ${workUnit}`);
  console.log(`  sha        ${shaAtRun ?? 'UNKNOWN'}`);
  console.log(`  duration   ${durationMs}ms   exit=${exitCode}`);
  if (!passed && result.stderr) {
    console.log(`  stderr (tail):`);
    console.log('    ' + result.stderr.split('\n').slice(-15).join('\n    '));
  }
}

process.exit(exitCode);
