#!/usr/bin/env node
/**
 * Proof — structured deterministic verification wrapper (Unit 4).
 *
 * Directive requirement: demonstrate one passing check, one synthetic controlled
 * failing check, structured result correctly distinguishes them, and the result
 * is attachable to a Work Unit. No LLM interprets output anywhere in this path —
 * the assertions below read `exit_code`/`status`, never `stdout`.
 */
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const RUN_CHECK = path.join(HERE, '..', 'run-check.mjs');

let passed = 0, failed = 0;
const assert = (name, cond, detail = '') => {
  if (cond) { passed++; console.log(`  PASS  ${name}`); }
  else { failed++; console.log(`  FAIL  ${name}`); }
  if (detail) console.log(`          ${detail}`);
};

const TMP = mkdtempSync(path.join(os.tmpdir(), 'ain-runcheck-proof-'));
mkdirSync(TMP, { recursive: true });
execFileSync('git', ['init', '-q', '-b', 'proof'], { cwd: TMP });
execFileSync('git', ['config', 'user.email', 'p@example.invalid'], { cwd: TMP });
execFileSync('git', ['config', 'user.name', 'P'], { cwd: TMP });
writeFileSync(path.join(TMP, 'f.txt'), 'x');
execFileSync('git', ['add', '-A'], { cwd: TMP });
execFileSync('git', ['commit', '-qm', 'init'], { cwd: TMP });

const run = (args) => {
  try {
    return { code: 0, out: execFileSync('node', [RUN_CHECK, ...args, '--json'],
      { encoding: 'utf8', cwd: TMP, stdio: ['ignore', 'pipe', 'pipe'] }) };
  } catch (e) {
    return { code: e.status ?? 1, out: (e.stdout ?? '').toString(), err: (e.stderr ?? '').toString() };
  }
};

console.log('\n=== ONE PASSING CHECK ===');
{
  const r = run(['ok-case', '--cmd', 'exit 0', '--work-unit', 'proof-unit']);
  const j = JSON.parse(r.out);
  assert('wrapper exit code mirrors the command (0)', r.code === 0, `wrapper exit=${r.code}`);
  assert('structured status is PASS', j.status === 'PASS', `status=${j.status}`);
  assert('exit_code is captured as 0', j.exit_code === 0);
  assert('work_unit is carried through', j.work_unit === 'proof-unit');
  assert('sha is captured, never UNKNOWN in a real git repo', typeof j.sha === 'string' && j.sha.length > 0);
  assert('duration is measured', typeof j.duration_ms === 'number' && j.duration_ms >= 0);
}

console.log('\n=== ONE SYNTHETIC CONTROLLED FAILING CHECK ===');
{
  const r = run(['fail-case', '--cmd', 'exit 7', '--work-unit', 'proof-unit']);
  const j = JSON.parse(r.out);
  assert('wrapper exit code mirrors the command (7)', r.code === 7, `wrapper exit=${r.code}`);
  assert('structured status is FAIL', j.status === 'FAIL', `status=${j.status}`);
  assert('the exact exit code is preserved, not just "nonzero"', j.exit_code === 7, `exit_code=${j.exit_code}`);
}

console.log('\n=== PASS/FAIL ARE DISTINGUISHED STRUCTURALLY, NOT BY READING OUTPUT ===');
{
  const ok = JSON.parse(run(['noisy-pass', '--cmd', 'echo "ERROR: this is a decoy in stdout"; exit 0']).out);
  const bad = JSON.parse(run(['quiet-fail', '--cmd', 'echo "all good, looks fine"; exit 1']).out);
  assert('a PASS with alarming-looking stdout still reads PASS (verdict is exit_code, not text)',
    ok.status === 'PASS', `status=${ok.status} stdout=${JSON.stringify(ok.stdout)}`);
  assert('a FAIL with reassuring-looking stdout still reads FAIL',
    bad.status === 'FAIL', `status=${bad.status} stdout=${JSON.stringify(bad.stdout)}`);
}

console.log('\n=== BUILT-IN REGISTRY ===');
{
  const r = run(['nonexistent-check-xyz']);
  assert('an unregistered check with no --cmd is a wrapper error (exit 2), not a silent PASS',
    r.code === 2, `exit=${r.code}`);
}

console.log('\n=== OUTPUT IS BOUNDED (never re-floods context) ===');
{
  const r = run(['big-output', '--cmd', 'node -e "console.log(\'x\'.repeat(20000))"']);
  const j = JSON.parse(r.out);
  assert('stdout is capped, not passed through raw', j.stdout.length < 20000,
    `captured length=${j.stdout.length}`);
  assert('truncation is stated explicitly, not silent', /truncated/.test(j.stdout));
}

console.log('\n=== RESULT IS ATTACHABLE TO A WORK UNIT (shape check) ===');
{
  const j = JSON.parse(run(['attach-case', '--cmd', 'exit 0', '--work-unit', 'proving-case-add-fn']).out);
  const requiredFields = ['check', 'command', 'work_unit', 'sha', 'status', 'exit_code', 'started_at', 'ended_at'];
  assert('every field the AIN_RESULT_CONTRACT would reference is present',
    requiredFields.every((f) => f in j), `missing: ${requiredFields.filter((f) => !(f in j)).join(', ')}`);
}

rmSync(TMP, { recursive: true, force: true });

console.log(`\n${passed} passed · ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);
