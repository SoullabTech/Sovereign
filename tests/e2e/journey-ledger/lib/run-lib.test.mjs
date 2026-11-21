/**
 * Tests for the shell side of the harness: lib/run-lib.sh (sourced by run.sh) and the parts of run.sh / run.mjs that use it.
 * Run: node --test tests/e2e/journey-ledger/lib/*.test.mjs        (no browser, no database, no stack is started)
 *
 *   F3  the report goes only into a directory that already exists (run.sh and run.mjs refuse otherwise, and create nothing)
 *   F5  a combined run is non-zero if either the ledger or WJ-1 failed (the REAL tail of run.sh is executed, with stubs for the two commands)
 *   F9  the app server starts with an allowlisted environment (nothing of the caller's, the checkout's env-file names blanked)
 *   F10 the Subject a report names says when the instrument or the product is not the code at that SHA
 *
 * Every rule is proved the way the rest of this suite proves its rules: it passes on the conforming function, and each deliberately
 * WRONG candidate (a plausible way to get it wrong, including the behaviour that was there before) must make the same check fail.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import net from 'node:net';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const LIB = path.join(here, 'run-lib.sh');
const RUN_SH = path.join(here, '..', 'run.sh');
const RUN_MJS = path.join(here, '..', 'run.mjs');
const RUN_SH_TEXT = fs.readFileSync(RUN_SH, 'utf8');

/** JL_SHOW_KILLS=1 prints, for every defeat candidate, what the check said was wrong with it: the reason it died, so it can be read. */
const showKill = (name, bad) => { if (process.env.JL_SHOW_KILLS) console.error(`KILL ${name.slice(0, 60)} -> ${bad.length ? bad.map(b => b.slice(0, 110)).slice(0, 3).join(' | ') : '(NOT CAUGHT)'}`); };
/** A candidate must die for the reason it is named for, not merely die: `dies` is a pattern that one of the violations must match. */
const diesFor = (bad, dies, name) => { assert.ok(bad.some(b => dies.test(b)), `"${name}" was caught, but not for its own reason (${dies}); the violations were: ${bad.slice(0, 3).join(' | ')}`); };
// Every directory a test makes is removed when the process exits, whether its assertions passed or threw half way.
const made = [];
const tmp = (tag) => { const d = fs.mkdtempSync(path.join(os.tmpdir(), `jl-${tag}-`)); made.push(d); return d; };
process.on('exit', () => { for (const d of made) { try { fs.rmSync(d, { recursive: true, force: true }); } catch { /* already gone */ } } });
const HOME_DIR = tmp('home');
const cleanEnv = (extra = {}) => ({ PATH: process.env.PATH, HOME: HOME_DIR, GIT_CONFIG_NOSYSTEM: '1', ...extra });
const bash = (script, { env = {}, cwd, args = [] } = {}) => spawnSync('bash', ['-c', script, 'jl', ...args], { encoding: 'utf8', env: cleanEnv(env), cwd });
const sourceLib = (body, env, cwd, args) => bash(`set -Eeuo pipefail; . "${LIB}"; ${body}`, { env, cwd, args });

/** Where the project's node_modules is (the real @next/env is the loader under test). mutants.mjs links one into its copies. */
function findNodeModules() {
  if (process.env.JL_NODE_MODULES) return process.env.JL_NODE_MODULES;
  let d = here;
  for (;;) {
    const c = path.join(d, 'node_modules');
    if (fs.existsSync(path.join(c, '@next', 'env'))) return c;
    const up = path.dirname(d);
    if (up === d) return null;
    d = up;
  }
}
const NODE_MODULES = findNodeModules();

// ===================================================================================================================
// F3: the report directory
// ===================================================================================================================

/** The rule, as violations (empty = obeyed). `defn` optionally redefines jl_report_path (a defeat candidate). */
function reportPathViolations(defn = '') {
  const bad = [];
  const root = tmp('rp');
  const existing = path.join(root, 'out'); fs.mkdirSync(existing);
  const missing = path.join(root, 'nope', 'deeper');
  const call = (p, cwd) => sourceLib(`${defn}\n jl_report_path "$1"`, {}, cwd, [p]);
  let r = call(path.join(existing, 'r.md'));
  if (r.status !== 0 || r.stdout.trim() !== path.join(fs.realpathSync(existing), 'r.md')) bad.push(`an existing directory should give its absolute path, got status ${r.status} ${JSON.stringify(r.stdout)}`);
  r = call('r.md', existing);
  if (r.status !== 0 || r.stdout.trim() !== path.join(fs.realpathSync(existing), 'r.md')) bad.push(`a bare file name should resolve against the current directory, got ${JSON.stringify(r.stdout)}`);
  r = call('../out/r.md', existing);
  if (r.status !== 0 || r.stdout.trim() !== path.join(fs.realpathSync(existing), 'r.md')) bad.push(`a path through .. should resolve, got ${JSON.stringify(r.stdout)}`);
  r = call(path.join(missing, 'r.md'));
  if (r.status === 0) bad.push('a directory that does not exist should be refused (non-zero)');
  if (r.stdout.trim() !== '') bad.push(`a refused path must print nothing, printed ${JSON.stringify(r.stdout)} (the old code printed "/r.md": the file at the filesystem root)`);
  if (fs.existsSync(path.join(root, 'nope'))) bad.push('a refused path must not create the missing directory');
  r = call(existing);
  if (r.status === 0) bad.push('a path that is itself a directory should be refused');
  fs.rmSync(root, { recursive: true, force: true });
  return bad;
}

test('jl_report_path: an existing directory resolves; a missing one is refused, prints nothing and creates nothing', () => {
  assert.deepEqual(reportPathViolations(), []);
});

const REPORT_CANDIDATES = {
  'the code run.sh had: the directory is cd-ed into and, when that fails, the empty result still prefixes the file name (/r.md)': [
    'jl_report_path() { printf "%s/%s\\n" "$(cd -- "$(dirname -- "$1")" 2>/dev/null && pwd)" "$(basename -- "$1")"; }', /does not exist should be refused|must print nothing/],
  'a missing directory is created': [
    'jl_report_path() { mkdir -p -- "$(dirname -- "$1")"; printf "%s/%s\\n" "$(cd -- "$(dirname -- "$1")" && pwd)" "$(basename -- "$1")"; }', /does not exist should be refused|must not create/],
  'the path is echoed back unresolved (a relative path is only relative to wherever the walk later runs)': [
    'jl_report_path() { [ -d "$(dirname -- "$1")" ] || return 1; printf "%s\\n" "$1"; }', /bare file name should resolve|through \.\. should resolve|absolute path/],
};
for (const [name, [defn, dies]] of Object.entries(REPORT_CANDIDATES)) {
  test(`defeat candidate is caught: ${name}`, () => {
    const bad = reportPathViolations(defn); showKill(name, bad);
    assert.notDeepEqual(bad, [], 'the check let a wrong jl_report_path through');
    diesFor(bad, dies, name);
  });
}

/** Three occupied ports, so a run.sh that gets past its argument checks stops at the port precondition (exit 68) instead of booting a stack. */
async function withOccupiedPorts(fn) {
  const servers = []; const ports = [];
  for (let i = 0; i < 3; i += 1) {
    const s = net.createServer(c => c.end());
    await new Promise(r => s.listen(0, '127.0.0.1', r));
    servers.push(s); ports.push(s.address().port);
  }
  try { return await fn(ports); } finally { for (const s of servers) await new Promise(r => s.close(r)); }
}
const runProcess = (cmd, args, opts = {}) => new Promise((resolve) => {
  const p = spawn(cmd, args, { env: cleanEnv(opts.env), cwd: opts.cwd });
  let out = '';
  p.stdout.on('data', d => { out += d; }); p.stderr.on('data', d => { out += d; });
  const timer = setTimeout(() => p.kill('SIGKILL'), 60000);
  p.on('close', (status) => { clearTimeout(timer); resolve({ status, out }); });
});

test('run.sh --report into a directory that does not exist is REFUSED (exit 64) before anything starts, and creates nothing', async () => {
  const root = tmp('runsh');
  const missing = path.join(root, 'no-such-dir');
  await withOccupiedPorts(async ([a, b, c]) => {
    const r = await runProcess('bash', [RUN_SH, '--report', path.join(missing, 'ledger.md'), '--app-port', String(a), '--pg-port', String(b), '--stub-port', String(c)]);
    assert.equal(r.status, 64, `expected the refusal, got exit ${r.status}: ${r.out.slice(0, 300)}`);
    assert.match(r.out, /REFUSED: the report's directory does not exist/);
    assert.equal(fs.existsSync(missing), false);
    assert.equal(fs.existsSync(path.join(root, 'ledger.md')), false);
    // The old behaviour wrote the report to /<basename>; the walk must never name the filesystem root as the report.
    assert.doesNotMatch(r.out, /report is \/ledger\.md/);
  });
  fs.rmSync(root, { recursive: true, force: true });
});

test('run.sh --report into an existing directory is NOT refused for its directory (control: the guard does not over-refuse)', async () => {
  const root = tmp('runsh-ok');
  await withOccupiedPorts(async ([a, b, c]) => {
    const r = await runProcess('bash', [RUN_SH, '--report', path.join(root, 'ledger.md'), '--app-port', String(a), '--pg-port', String(b), '--stub-port', String(c)]);
    assert.notEqual(r.status, 64, `the report directory exists, so this must not be refused for it: ${r.out.slice(0, 300)}`);
    assert.doesNotMatch(r.out, /report's directory does not exist/);
    assert.ok([65, 66, 67, 68].includes(r.status), `it must stop at a precondition, never go on to boot a stack (exit ${r.status}: ${r.out.slice(0, 200)})`);
  });
  fs.rmSync(root, { recursive: true, force: true });
});

test('run.mjs --report into a directory that does not exist is REFUSED (exit 64) and creates nothing (it used to mkdir -p it)', () => {
  const root = tmp('runmjs');
  const missing = path.join(root, 'a', 'b');
  const r = spawnSync(process.execPath, [RUN_MJS, '--report', path.join(missing, 'ledger.md')], { encoding: 'utf8', env: cleanEnv() });
  assert.equal(r.status, 64);
  assert.match(r.stderr, /REFUSED: the report's directory does not exist/);
  assert.equal(fs.existsSync(path.join(root, 'a')), false, 'nothing was created');
  const ok = spawnSync(process.execPath, [RUN_MJS, '--report', path.join(root, 'ledger.md')], { encoding: 'utf8', env: cleanEnv() });
  assert.equal(ok.status, 64, 'still refused, but for the missing stack variables, not for its directory');
  assert.doesNotMatch(ok.stderr, /report's directory/);
  assert.match(ok.stderr, /JL_BASE is not set/);
  fs.rmSync(root, { recursive: true, force: true });
});

// ===================================================================================================================
// F5: the exit code of a combined run
// ===================================================================================================================

/** The rule: non-zero if either part failed; a harness failure code (64+) is kept; otherwise 0. */
const wantExit = (l, w) => (l >= 64 ? l : (l !== 0 || (w !== '' && w !== 0) ? 1 : 0));
const EXIT_CASES = [[0, ''], [1, ''], [0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [64, ''], [68, 0], [68, 1], [70, 1]];

function exitViolations(defn = '') {
  const bad = [];
  for (const [l, w] of EXIT_CASES) {
    const r = sourceLib(`${defn}\n jl_combined_exit ${l} ${w === '' ? '' : w}`);
    const got = Number(r.stdout.trim());
    if (got !== wantExit(l, w)) bad.push(`ledger ${l}, WJ-1 ${w === '' ? 'not run' : w}: want ${wantExit(l, w)}, got ${r.stdout.trim() || r.stderr.trim()}`);
  }
  return bad;
}
test('jl_combined_exit: the run is non-zero if either the ledger or WJ-1 failed; harness failure codes are kept', () => {
  assert.deepEqual(exitViolations(), []);
});
const EXIT_CANDIDATES = {
  'the ledger decides alone (WJ-1 can fail and the run is still 0: the bug)': ['jl_combined_exit() { echo "$1"; }', /ledger 0, WJ-1 1: want 1, got 0/],
  'WJ-1 decides alone (a ledger that does not work is hidden by a green WJ-1)': ['jl_combined_exit() { echo "${2:-0}"; }', /ledger 1, WJ-1 not run: want 1, got 0/],
  'WJ-1 can only fail the run when the ledger also failed': ['jl_combined_exit() { if [ "$1" != 0 ] && [ -n "${2-}" ] && [ "${2-}" != 0 ]; then echo 1; else echo "$1"; fi; }', /ledger 0, WJ-1 1: want 1, got 0/],
  'a WJ-1 failure overwrites a harness failure code (the run reports "does not work" when nothing was walked)': ['jl_combined_exit() { if [ -n "${2-}" ] && [ "${2-}" != 0 ]; then echo 1; else echo "$1"; fi; }', /ledger 68, WJ-1 1: want 68, got 1/],
};
for (const [name, [defn, dies]] of Object.entries(EXIT_CANDIDATES)) {
  test(`defeat candidate is caught: ${name}`, () => {
    const bad = exitViolations(defn); showKill(name, bad);
    assert.notDeepEqual(bad, [], 'the check let a wrong combiner through');
    diesFor(bad, dies, name);
  });
}

/** Run the REAL tail of run.sh (from the WJ-1 step to its last line) with `node` and `npx` stubbed: only the WJ-1 spec's exit code is chosen. */
function runTail({ ledgerRc, wj1Rc, wj1 = 1, wj1Only = 0, defeat = 'none', runSh = RUN_SH_TEXT }) {
  const lines = runSh.split('\n');
  const at = lines.findIndex(l => l === 'if [ "$WJ1" = 1 ]; then');
  assert.ok(at >= 0, 'run.sh no longer has the WJ-1 step this test executes');
  const dir = tmp('tail');
  fs.writeFileSync(path.join(dir, 'tail.sh'), lines.slice(at).join('\n'));
  const script = `set -Eeuo pipefail
. "${LIB}"
HERE=/nonexistent; APP_PORT=1; DEFEAT=${defeat}; WJ1=${wj1}; WJ1_ONLY=${wj1Only}; RC=${ledgerRc}; REPORT=/x.md; RUN=${dir}; PSQL=(true)
node() { return 0; }
npx() { return ${wj1Rc}; }
. "${path.join(dir, 'tail.sh')}"`;
  const r = bash(script);
  fs.rmSync(dir, { recursive: true, force: true });
  return r;
}
test('run.sh tail (executed as written): a ledger that works plus a WJ-1 that FAILED is not exit 0', () => {
  const r = runTail({ ledgerRc: 0, wj1Rc: 1 });
  assert.notEqual(r.status, 0, `the combined run exited 0 with WJ-1 red: ${r.stdout}`);
  assert.equal(r.status, 1);
  assert.match(r.stdout, /WJ-1 exit: 1/);
});
test('run.sh tail (executed as written): the whole table of combined exits', () => {
  for (const [l, w] of [[0, 0], [0, 1], [1, 0], [1, 1], [68, 0], [68, 1]]) {
    const r = runTail({ ledgerRc: l, wj1Rc: w });
    assert.equal(r.status, wantExit(l, w), `ledger ${l}, WJ-1 ${w}: got ${r.status}\n${r.stdout}${r.stderr}`);
  }
});
test('run.sh tail: without --wj1 the exit code is the ledger\'s own; with --wj1-only it is WJ-1\'s', () => {
  for (const l of [0, 1, 68]) assert.equal(runTail({ ledgerRc: l, wj1Rc: 1, wj1: 0 }).status, l);
  assert.equal(runTail({ ledgerRc: 0, wj1Rc: 1, wj1Only: 1 }).status, 1);
  assert.equal(runTail({ ledgerRc: 0, wj1Rc: 0, wj1Only: 1 }).status, 0);
  assert.equal(runTail({ ledgerRc: 0, wj1Rc: 1, wj1Only: 1, defeat: 'bad_password' }).status, 1, 'under a defeat mode the spec\'s non-zero exit is the result');
});
test('defeat candidate is caught: a run.sh whose last line exits with the ledger code alone (the code that was there)', () => {
  const wrong = RUN_SH_TEXT.replace(/FINAL_RC="\$\(jl_combined_exit[^\n]*\n(?:echo[^\n]*\n)?exit "\$FINAL_RC"/, 'exit "$RC"');
  assert.notEqual(wrong, RUN_SH_TEXT, 'the candidate was not built: run.sh no longer ends the way this test expects');
  const r = runTail({ ledgerRc: 0, wj1Rc: 1, runSh: wrong });
  assert.equal(r.status, 0, 'precondition: this wrong tail really does exit 0 with WJ-1 red');
  assert.notEqual(r.status, wantExit(0, 1), 'and the table above would refuse it');
});

// ===================================================================================================================
// F10: the Subject a report names
// ===================================================================================================================

function mkRepo() {
  const dir = tmp('repo');
  const git = (...a) => { const r = spawnSync('git', ['-c', 'user.email=t@example.org', '-c', 'user.name=t', '-c', 'core.hooksPath=/dev/null', '-c', 'commit.gpgsign=false', ...a], { cwd: dir, encoding: 'utf8', env: cleanEnv() }); assert.equal(r.status, 0, `git ${a.join(' ')}: ${r.stderr}`); return r.stdout.trim(); };
  git('init', '-q', '-b', 'work');
  fs.mkdirSync(path.join(dir, 'tests/e2e/journey-ledger/lib'), { recursive: true });
  fs.mkdirSync(path.join(dir, 'app'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'tests/e2e/journey-ledger/README.md'), 'readme\n');
  fs.writeFileSync(path.join(dir, 'tests/e2e/journey-ledger/lib/a.mjs'), 'export const a = 1;\n');
  fs.writeFileSync(path.join(dir, 'app/page.tsx'), 'export default 1;\n');
  fs.writeFileSync(path.join(dir, '.gitignore'), '.next\nnode_modules\n');
  git('add', '-A'); git('commit', '-q', '-m', 'base');
  return { dir, git, sha: git('rev-parse', '--short', 'HEAD') };
}
const subjectOf = (dir, defn = '') => sourceLib(`${defn}\n jl_subject "${dir}"`);
const instrumentCount = (text) => { const m = /instrument: (\d+) file\(s\)/.exec(text); return m ? Number(m[1]) : 0; };
const productCount = (text) => { const m = /product: (\d+) other tracked file\(s\) modified/.exec(text); return m ? Number(m[1]) : 0; };

/** The rule, as violations: [description, mutate(repo), expected {marked, instrument, product}] */
const SUBJECT_CASES = [
  ['a clean checkout is named by its SHA alone', () => {}, { marked: false }],
  ['an unstaged edit to a tracked instrument file marks it', (d) => fs.appendFileSync(path.join(d, 'tests/e2e/journey-ledger/README.md'), 'x\n'), { marked: true, instrument: 1 }],
  ['a STAGED-only edit marks it', (d, git) => { fs.appendFileSync(path.join(d, 'tests/e2e/journey-ledger/lib/a.mjs'), '//x\n'); git('add', 'tests/e2e/journey-ledger/lib/a.mjs'); }, { marked: true, instrument: 1 }],
  ['an UNTRACKED new instrument file marks it', (d) => fs.writeFileSync(path.join(d, 'tests/e2e/journey-ledger/lib/new.mjs'), 'x\n'), { marked: true, instrument: 1 }],
  ['an untracked file in a new instrument subdirectory is counted as a file, not as a directory', (d) => { fs.mkdirSync(path.join(d, 'tests/e2e/journey-ledger/extra')); fs.writeFileSync(path.join(d, 'tests/e2e/journey-ledger/extra/a.mjs'), 'x\n'); fs.writeFileSync(path.join(d, 'tests/e2e/journey-ledger/extra/b.mjs'), 'x\n'); }, { marked: true, instrument: 2 }],
  ['a DELETED tracked instrument file marks it', (d) => fs.rmSync(path.join(d, 'tests/e2e/journey-ledger/lib/a.mjs')), { marked: true, instrument: 1 }],
  ['a modified file and an untracked file are two', (d) => { fs.appendFileSync(path.join(d, 'tests/e2e/journey-ledger/README.md'), 'x\n'); fs.writeFileSync(path.join(d, 'tests/e2e/journey-ledger/lib/new.mjs'), 'x\n'); }, { marked: true, instrument: 2 }],
  ['a modified tracked PRODUCT file marks the product, not the instrument', (d) => fs.appendFileSync(path.join(d, 'app/page.tsx'), '// x\n'), { marked: true, product: 1, instrument: 0 }],
  ['an untracked file elsewhere does not mark it (notes, caches)', (d) => fs.writeFileSync(path.join(d, 'notes.txt'), 'x\n'), { marked: false }],
  ['an ignored directory does not mark it (the walk\'s own .next)', (d) => { fs.mkdirSync(path.join(d, '.next')); fs.writeFileSync(path.join(d, '.next/cache'), 'x\n'); }, { marked: false }],
  ['an instrument change that was COMMITTED is not a dirty marker (the SHA contains it)', (d, git) => { fs.appendFileSync(path.join(d, 'tests/e2e/journey-ledger/README.md'), 'x\n'); git('add', '-A'); git('commit', '-q', '-m', 'more'); }, { marked: false }],
];

function subjectViolations(defn = '') {
  const bad = [];
  for (const [what, mutate, want] of SUBJECT_CASES) {
    const repo = mkRepo();
    mutate(repo.dir, repo.git);
    const sha = repo.git('rev-parse', '--short', 'HEAD');
    const r = subjectOf(repo.dir, defn);
    const line = r.stdout.trim();
    const marked = /\+ uncommitted changes/.test(line);
    if (r.status !== 0) bad.push(`${what}: the function failed (${r.stderr.trim().slice(0, 120)})`);
    else {
      if (!line.startsWith(sha)) bad.push(`${what}: the line must start with the SHA ${sha}: ${line}`);
      if (!/\(work\)$/.test(line)) bad.push(`${what}: the line must end with the branch: ${line}`);
      if (marked !== want.marked) bad.push(`${what}: marked=${marked}, want ${want.marked}: ${line}`);
      // Every count is checked in every case (a file counted as both instrument and product is wrong), the unnamed one being 0.
      if (instrumentCount(line) !== (want.instrument ?? 0)) bad.push(`${what}: instrument count ${instrumentCount(line)}, want ${want.instrument ?? 0}: ${line}`);
      if (productCount(line) !== (want.product ?? 0)) bad.push(`${what}: product count ${productCount(line)}, want ${want.product ?? 0}: ${line}`);
    }
    fs.rmSync(repo.dir, { recursive: true, force: true });
  }
  return bad;
}
test('jl_subject: the SHA, plus an explicit marker whenever the instrument (or product) is not the code at that SHA', () => {
  assert.deepEqual(subjectViolations(), []);
});

const subjectFn = (detect) => `jl_subject() { local root="$1" sha branch; sha="$(git -C "$root" rev-parse --short HEAD)"; branch="$(git -C "$root" rev-parse --abbrev-ref HEAD)"; ${detect}; }`;
const mark = 'printf "%s + uncommitted changes (instrument: 1 file(s) under tests/e2e/journey-ledger differ from HEAD) (%s)\\n" "$sha" "$branch"';
const plain = 'printf "%s (%s)\\n" "$sha" "$branch"';
const SUBJECT_CANDIDATES = {
  'the line run.sh had: the SHA with no marker at all': [subjectFn(plain), /marked=false, want true/],
  'only UNSTAGED tracked changes are noticed (staged and untracked files slip through)': [subjectFn(`if git -C "$root" diff --quiet -- tests/e2e/journey-ledger; then ${plain}; else ${mark}; fi`), /STAGED-only edit marks it: marked=false/],
  'only TRACKED changes are noticed (a new, untracked instrument file slips through)': [subjectFn(`if git -C "$root" diff --quiet HEAD -- tests/e2e/journey-ledger; then ${plain}; else ${mark}; fi`), /UNTRACKED new instrument file marks it: marked=false/],
  'any untracked or modified file ANYWHERE marks the run (notes and caches make every run dirty)': [subjectFn(`if [ -z "$(git -C "$root" status --porcelain --untracked-files=all)" ]; then ${plain}; else ${mark}; fi`), /untracked file elsewhere does not mark it.*marked=true/],
  'ignored files are looked at too (the walk\'s own .next makes every run dirty)': [subjectFn(`if [ -z "$(git -C "$root" status --porcelain --ignored --untracked-files=all -- tests/e2e/journey-ledger .next)" ]; then ${plain}; else ${mark}; fi`), /ignored directory does not mark it.*marked=true/],
};
for (const [name, [defn, dies]] of Object.entries(SUBJECT_CANDIDATES)) {
  test(`defeat candidate is caught: ${name}`, () => {
    const bad = subjectViolations(defn); showKill(name, bad);
    assert.notDeepEqual(bad, [], 'the cases let a wrong subject through');
    diesFor(bad, dies, name);
  });
}

test('run.sh names its Subject BEFORE next dev starts (which rewrites AGENTS.md and next-env.d.ts) and the report header uses it', () => {
  const i = RUN_SH_TEXT.indexOf('SUBJECT="$(jl_subject "$ROOT")"');
  const j = RUN_SH_TEXT.indexOf('echo "[4/6]');
  assert.ok(i > 0, 'run.sh does not compute the Subject with jl_subject');
  assert.ok(j > 0 && i < j, 'the Subject must be read before the app server starts');
  assert.match(RUN_SH_TEXT, /Subject: e\.JL_SUBJECT,/, 'the report header must carry the whole Subject, marker included');
  assert.doesNotMatch(RUN_SH_TEXT, /rev-parse --short HEAD/, 'the unmarked SHA must not come back');
});

// ===================================================================================================================
// F9: the environment the app server starts with
// ===================================================================================================================

const SHADOW_URL = 'postgresql://jl@127.0.0.1:55691/jl_shadow';
const CANARY = 'CANARY-REAL-VALUE-DO-NOT-LEAK';
const POISON = {
  AWS_SECRET_ACCESS_KEY: `${CANARY}-aws`, GITHUB_TOKEN: `${CANARY}-gh`, GH_TOKEN: `${CANARY}-gh2`, RESEND_API_KEY: `${CANARY}-resend`,
  STRIPE_SECRET_KEY: `${CANARY}-stripe`, ANTHROPIC_API_KEY: `${CANARY}-anthropic`, GOOGLE_APPLICATION_CREDENTIALS: '/fictional/adc.json',
  HTTPS_PROXY: 'http://proxy.invalid:1', https_proxy: 'http://proxy.invalid:1', NODE_EXTRA_CA_CERTS: '/fictional/ca.pem',
  CLAUDECODE: '1', AI_AGENT: 'fictional-agent', NODE_OPTIONS: '--stack-trace-limit=77', NODE_PATH: '/fictional/modules',
  DATABASE_URL: 'postgresql://real@prod.invalid/maia', PORT: '1',
};
/** The only names an app server may be started with (flags and blanked env-file names are added by the case). */
const ALLOWED = ['PATH', 'HOME', 'TMPDIR', 'NODE_ENV', 'NEXT_TELEMETRY_DISABLED', 'PORT', 'NODE_OPTIONS', 'DATABASE_URL', 'PGOPTIONS', 'ANTHROPIC_BASE_URL', 'ANTHROPIC_API_KEY'];
const FLAGS = ['WS_BETA_GRANT_MODE=legacy', 'NEXT_PUBLIC_WS_AUTO_READ=1'];

function mkRoot({ envFiles = {}, withModules = true } = {}) {
  const root = tmp('root');
  for (const [f, body] of Object.entries(envFiles)) fs.writeFileSync(path.join(root, f), body);
  if (withModules && NODE_MODULES) fs.symlinkSync(NODE_MODULES, path.join(root, 'node_modules'));
  return root;
}
const ENV_FILES = {
  '.env.local': `JL_CANARY_SECRET=${CANARY}-local\nexport JL_CANARY_EXPORTED="${CANARY}-exported"\nJL_CANARY_MULTILINE="line one\n${CANARY}-line-two"\nDATABASE_URL=postgresql://real@prod.invalid/maia\nANTHROPIC_API_KEY=${CANARY}-from-file\nPORT=1234\n# JL_CANARY_COMMENTED=${CANARY}-commented\n`,
  '.env': `JL_CANARY_BASE=${CANARY}-base\nJL_CANARY_EXPANDED=\${JL_CANARY_BASE}-more\n`,
  '.env.development': `JL_CANARY_DEV=${CANARY}-dev\n`,
  '.env.development.local': `JL_CANARY_DEVLOCAL=${CANARY}-devlocal\n`,
  '.env.production': `JL_NOT_LOADED_IN_DEV=${CANARY}-prod\n`,   // Next does not load this for a development server
};
const BLANKED = ['JL_CANARY_SECRET', 'JL_CANARY_EXPORTED', 'JL_CANARY_MULTILINE', 'JL_CANARY_BASE', 'JL_CANARY_EXPANDED', 'JL_CANARY_DEV', 'JL_CANARY_DEVLOCAL'];

/** Build the app environment with `defn` (optionally a defeat candidate) from a poisoned caller environment, then print what a process started with it sees. */
function appEnvSeenBy(root, defn = '', { loader = false } = {}) {
  const runDir = tmp('rundir');
  const probe = loader
    ? `node -e 'const l=require("@next/env"); l.loadEnvConfig(process.argv[1], true); console.log(JSON.stringify(process.env))' "${root}"`
    : `node -e 'console.log(JSON.stringify(process.env))'`;
  const r = sourceLib(`${defn}
ROOT="${root}"; RUN="${runDir}"; DATABASE_URL="${SHADOW_URL}"; APP_PORT=3651; STUB_PORT=55692; FLAG_ENV=(${FLAGS.map(f => `"${f}"`).join(' ')})
cd "${root}"
jl_build_app_env
env -i "\${JL_APP_ENV[@]}" ${probe}`, POISON);
  fs.rmSync(runDir, { recursive: true, force: true });
  if (r.status !== 0) return { status: r.status, err: r.stderr, env: null, runDir };
  return { status: 0, env: JSON.parse(r.stdout.trim().split('\n').pop()), runDir };
}

function appEnvViolations(defn = '', { withFiles = true } = {}) {
  const bad = [];
  const root = mkRoot({ envFiles: withFiles ? ENV_FILES : {} });
  const seen = appEnvSeenBy(root, defn);
  if (seen.status !== 0) { bad.push(`jl_build_app_env failed: ${seen.err.trim().slice(0, 200)}`); fs.rmSync(root, { recursive: true, force: true }); return bad; }
  const env = seen.env;
  const allowed = new Set([...ALLOWED, ...FLAGS.map(f => f.split('=')[0]), ...(withFiles ? BLANKED : [])]);
  const stray = Object.keys(env).filter(k => !allowed.has(k));
  if (stray.length) bad.push(`variables outside the allowlist reached the app: ${stray.join(', ')}`);
  const leaked = Object.entries(env).filter(([, v]) => String(v).includes(CANARY) || /proxy\.invalid|fictional\/(ca|adc)|stack-trace-limit/.test(String(v))).map(([k]) => k);
  if (leaked.length) bad.push(`values of the caller's (or of an env file's) reached the app: ${leaked.join(', ')}`);
  const want = { PORT: '3651', DATABASE_URL: SHADOW_URL, ANTHROPIC_BASE_URL: 'http://127.0.0.1:55692', ANTHROPIC_API_KEY: 'journey-ledger-fictional-not-a-key', NODE_ENV: 'development', NEXT_TELEMETRY_DISABLED: '1', WS_BETA_GRANT_MODE: 'legacy', NEXT_PUBLIC_WS_AUTO_READ: '1' };
  for (const [k, v] of Object.entries(want)) if (env[k] !== v) bad.push(`${k} should be ${JSON.stringify(v)} but is ${JSON.stringify(env[k])} (a harness value must win over the caller's AND over an env file's)`);
  if (!env.HOME || !env.HOME.startsWith(path.join(os.tmpdir(), 'jl-rundir-'))) bad.push(`HOME should be a throwaway directory under the run dir, is ${JSON.stringify(env.HOME)}`);
  if (!env.TMPDIR || !env.TMPDIR.startsWith(path.join(os.tmpdir(), 'jl-rundir-'))) bad.push(`TMPDIR should be a throwaway directory under the run dir, is ${JSON.stringify(env.TMPDIR)}`);
  if (!/^--max-old-space-size=\d+$/.test(env.NODE_OPTIONS || '')) bad.push(`NODE_OPTIONS should be the harness's heap limit only (not the caller's): ${env.NODE_OPTIONS}`);
  if (env.JL_NOT_LOADED_IN_DEV !== undefined) bad.push('a file Next does not load for a development server was blanked (the list must be exactly what Next loads)');
  if (withFiles) for (const k of BLANKED) if (env[k] !== '') bad.push(`${k} (named in a checkout env file) should reach the app as the empty string, is ${JSON.stringify(env[k])}`);
  fs.rmSync(root, { recursive: true, force: true });
  return bad;
}

const needModules = NODE_MODULES ? {} : { skip: 'no project node_modules/@next/env found (set JL_NODE_MODULES): the real env-file loader cannot be run, so nothing is claimed about it' };

test('jl_build_app_env: nothing of the caller\'s reaches the app, the harness values win, and HOME/TMPDIR are throwaway', needModules, () => {
  assert.deepEqual(appEnvViolations(), []);
});
test('jl_build_app_env: with no env files in the checkout the allowlist is the same and no loader is needed', () => {
  const root = mkRoot({ withModules: false });
  const seen = appEnvSeenBy(root);
  assert.equal(seen.status, 0, seen.err);
  assert.deepEqual(Object.keys(seen.env).filter(k => !new Set([...ALLOWED, ...FLAGS.map(f => f.split('=')[0])]).has(k)), []);
  fs.rmSync(root, { recursive: true, force: true });
});
test('jl_build_app_env: where the checkout has env files and their loader cannot be run, it REFUSES (fails closed), never guesses', () => {
  const root = mkRoot({ envFiles: { '.env.local': 'JL_CANARY_SECRET=x\n' }, withModules: false });
  const seen = appEnvSeenBy(root);
  assert.notEqual(seen.status, 0, 'it started an app it could not vouch for');
  fs.rmSync(root, { recursive: true, force: true });
});
test('the REAL Next env-file loader, run inside the allowlisted environment, finds every canary already defined (empty), so none of the files\' values is applied', needModules, () => {
  const root = mkRoot({ envFiles: ENV_FILES });
  const seen = appEnvSeenBy(root, '', { loader: true });
  assert.equal(seen.status, 0, seen.err);
  for (const k of BLANKED) assert.equal(seen.env[k], '', `${k} was supplied to the app by the loader`);
  assert.equal(seen.env.DATABASE_URL, SHADOW_URL, 'the file\'s DATABASE_URL must not replace the shadow');
  assert.equal(seen.env.ANTHROPIC_API_KEY, 'journey-ledger-fictional-not-a-key');
  assert.equal(seen.env.PORT, '3651');
  assert.equal(seen.env.JL_NOT_LOADED_IN_DEV, undefined);
  assert.ok(!Object.values(seen.env).some(v => String(v).includes(CANARY)), 'a value from an env file is in the app\'s environment');
  fs.rmSync(root, { recursive: true, force: true });
});

for (const f of ['.env.development.local', '.env.local', '.env.development', '.env']) {
  test(`jl_build_app_env: ${f} alone is enough to blank its names (each of the four files Next loads for a development server is read)`, needModules, () => {
    const root = mkRoot({ envFiles: { [f]: `JL_CANARY_ALONE=${CANARY}-alone\n` } });
    const seen = appEnvSeenBy(root, '', { loader: true });
    assert.equal(seen.status, 0, seen.err);
    assert.equal(seen.env.JL_CANARY_ALONE, '', `${f} was not read: its value reached the app`);
    fs.rmSync(root, { recursive: true, force: true });
  });
}

const APP_ENV_BASE = `jl_build_app_env() {
  JL_APP_ENV=(); mkdir -p "$RUN/home" "$RUN/tmp"
  __BLANK__
  JL_APP_ENV+=("PATH=$PATH" "HOME=__HOME__" "TMPDIR=$RUN/tmp" "NODE_ENV=development" "NEXT_TELEMETRY_DISABLED=1" "PORT=$APP_PORT" "NODE_OPTIONS=__NODE_OPTIONS__" "DATABASE_URL=$DATABASE_URL" "PGOPTIONS=-c client_min_messages=warning" "ANTHROPIC_BASE_URL=http://127.0.0.1:$STUB_PORT" "ANTHROPIC_API_KEY=__KEY__")
  JL_APP_ENV+=("\${FLAG_ENV[@]}")
  __AFTER__
}`;
const appEnvFn = ({ blank = '', home = '$RUN/home', nodeOptions = '--max-old-space-size=8192', key = 'journey-ledger-fictional-not-a-key', after = '' } = {}) =>
  APP_ENV_BASE.replace('__BLANK__', blank).replace('__HOME__', home).replace('__NODE_OPTIONS__', nodeOptions).replace('__KEY__', key).replace('__AFTER__', after);
const BLANK_FROM_LIB = 'local names name; names="$(jl_dotenv_names "$ROOT")" || return 1; while IFS= read -r name; do [ -n "$name" ] && JL_APP_ENV+=("$name="); done <<<"$names"';
const APP_ENV_CANDIDATES = {
  'the env-file names are not blanked (a value in .env.local reaches the app)': [appEnvFn({}), /named in a checkout env file\) should reach the app as the empty string/],
  'the env-file names are blanked AFTER the allowlist (an env file that names DATABASE_URL, PORT or the key erases the harness value)': [appEnvFn({ after: BLANK_FROM_LIB }), /(PORT|DATABASE_URL|ANTHROPIC_API_KEY) should be/],
  'the caller\'s API key is passed through': [appEnvFn({ blank: BLANK_FROM_LIB, key: '${ANTHROPIC_API_KEY:-x}' }), /ANTHROPIC_API_KEY should be|reached the app: ANTHROPIC_API_KEY/],
  'the caller\'s HOME is passed through (its credential files stay readable)': [appEnvFn({ blank: BLANK_FROM_LIB, home: '${HOME}' }), /HOME should be a throwaway/],
  'the caller\'s NODE_OPTIONS is passed through (a preload of the caller\'s runs inside the app)': [appEnvFn({ blank: BLANK_FROM_LIB, nodeOptions: '${NODE_OPTIONS:---max-old-space-size=8192}' }), /NODE_OPTIONS should be the harness's heap limit only/],
  'the caller\'s proxy and cloud credentials are passed through': [appEnvFn({ blank: BLANK_FROM_LIB, after: 'JL_APP_ENV+=("HTTPS_PROXY=${HTTPS_PROXY-}" "AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY-}")' }), /outside the allowlist reached the app: HTTPS_PROXY, AWS_SECRET_ACCESS_KEY/],
  'the three env files that development loads are read but .env.local is skipped': [appEnvFn({ blank: 'local name; for name in JL_CANARY_BASE JL_CANARY_EXPANDED JL_CANARY_DEV JL_CANARY_DEVLOCAL; do JL_APP_ENV+=("$name="); done' }), /JL_CANARY_SECRET \(named in a checkout env file\)/],
};
for (const [name, [defn, dies]] of Object.entries(APP_ENV_CANDIDATES)) {
  test(`defeat candidate is caught: ${name}`, needModules, () => {
    const bad = appEnvViolations(defn); showKill(name, bad);
    assert.notDeepEqual(bad, [], 'the check let a wrong environment through');
    diesFor(bad, dies, name);
  });
}
test('control: the candidate scaffold with the conforming blanking is accepted (so the candidates above fail for their one change, not for the scaffold)', needModules, () => {
  assert.deepEqual(appEnvViolations(appEnvFn({ blank: BLANK_FROM_LIB })), []);
});

test('run.sh starts the app server through env -i with JL_APP_ENV, and not through a list of variables to remove', () => {
  assert.match(RUN_SH_TEXT, /setsid env -i "\$\{JL_APP_ENV\[@\]\}" "\$ROOT\/node_modules\/\.bin\/next" dev --webpack/);
  assert.doesNotMatch(RUN_SH_TEXT, /env -u /, 'the inherit-everything-but-these wrapper is back');
  assert.doesNotMatch(RUN_SH_TEXT, /npx next/, 'npx would consult npm\'s config and registry');
  assert.match(RUN_SH_TEXT, /jl_build_app_env \|\| \{ echo "REFUSED:[^}]*exit 71; \}/, 'an environment that could not be built must refuse the run, not start the app anyway');
  const built = RUN_SH_TEXT.indexOf('jl_build_app_env ||');
  const started = RUN_SH_TEXT.indexOf('\nstart_app\n');
  assert.ok(built > 0 && started > built, 'the environment must be built before the app server is started');
});
