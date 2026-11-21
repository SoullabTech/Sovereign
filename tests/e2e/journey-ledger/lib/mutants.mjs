#!/usr/bin/env node
/**
 * Mutation check for the ledger, the classifier, the pure part of the browser glue (trial.mjs settleKey), the shell helpers and the
 * parts of run.sh / run.mjs / the persona / the README the tests pin: copy the instrument (tests/e2e/journey-ledger) into a temp
 * checkout-shaped directory, break ONE line, run the unit tests against the copy, and require that they fail. A mutant that survives
 * means the tests cannot see that line being wrong.
 *
 *   node tests/e2e/journey-ledger/lib/mutants.mjs        (exit 0 only if every mutant is killed; JL_SHOW_KILLS=1 also names the tests that killed it)
 *
 * The repository copy is never modified. A mutant's file is `ledger` / `classify` / `trial` (lib/<name>.mjs) or a path under the
 * instrument directory (`lib/run-lib.sh`, `run.sh`, `run.mjs`, `personas/p1-first-timer.mjs`, `README.md`).
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const instrument = path.resolve(here, '..');                 // tests/e2e/journey-ledger
const repoRoot = path.resolve(instrument, '..', '..', '..');
const nodeModules = fs.existsSync(path.join(repoRoot, 'node_modules')) ? fs.realpathSync(path.join(repoRoot, 'node_modules')) : null;

/** A checkout-shaped copy: <tmp>/tests/e2e/journey-ledger (a copy of the instrument) and <tmp>/node_modules (a link), so run.sh finds its ROOT. */
function makeCopy(tag) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), `jl-mutant-${tag}-`));
  const dest = path.join(root, 'tests', 'e2e', 'journey-ledger');
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.cpSync(instrument, dest, { recursive: true });
  if (nodeModules) fs.symlinkSync(nodeModules, path.join(root, 'node_modules'));
  return { root, dest };
}
const runTests = (dest, root) => {
  const dir = path.join(dest, 'lib');
  return spawnSync(process.execPath, ['--test', ...fs.readdirSync(dir).filter(f => f.endsWith('.test.mjs')).map(f => path.join(dir, f))],
    { encoding: 'utf8', env: { ...process.env, JL_NODE_MODULES: nodeModules || '' }, cwd: root });
};
const parses = (file) => (file.endsWith('.mjs') ? spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' }).status === 0
  : file.endsWith('.sh') ? spawnSync('bash', ['-n', file], { encoding: 'utf8' }).status === 0 : true);

const MUTANTS = [
  ['ledger', 'M01 NOT RUN no longer blocks "works"', "counts['DEAD END'] === 0 && counts['NOT RUN'] === 0", "counts['DEAD END'] === 0"],
  ['ledger', 'M02 an empty ledger works', "if (rows.length === 0) return { works: false", "if (rows.length === 0) return { works: true"],
  ['ledger', 'M03 a row may end twice', "if (row.settled) throw new Error(`row ${id} already ended as ${row.status}`);", ''],
  ['ledger', 'M04 PASS needs no evidence', "if (typeof evidence !== 'string' || evidence.trim() === '') {", "if (false) {"],
  ['ledger', 'M05 a crashed step does not stop the walk', "      throw e;\n    }\n  }\n\n  note(", "      return { status: NOT_RUN, evidence: 'swallowed' };\n    }\n  }\n\n  note("],
  ['ledger', 'M06 the report always claims works', "lines.push(v.works ? 'VERDICT: works' : `VERDICT: does NOT work (${v.reason})`);", "lines.push('VERDICT: works');"],
  ['ledger', 'M07 the exit code is always 0', "exitCode() { return this.verdict().works ? 0 : 1; }", "exitCode() { return 0; }"],
  ['ledger', 'M08 a planned row starts as PASS', "this.rows.push({ id, title, status: NOT_RUN, evidence: 'planned, not exercised' });\n    return this;\n  }\n\n  /** Insert", "this.rows.push({ id, title, status: PASS, evidence: 'planned, not exercised' });\n    return this;\n  }\n\n  /** Insert"],
  ['classify', 'M10 a blank landing page is fine', "if (text.length < REAL_TEXT_MIN) {", "if (false) {"],
  ['classify', 'M11 a rendered 404 page with words is fine', "const marker = ERROR_MARKERS.find(m => text.toLowerCase().includes(m.toLowerCase()));", "const marker = null;"],
  ['classify', 'M12 a failed request is ignored', "const failed = mine.find(r => r.status >= 400);", "const failed = null;"],
  ['classify', 'M13 a dead link probed as 404 passes when the client rendered text', "if (probe != null && probe >= 400) {", "if (false) {"],
  ['classify', 'M14 a document 4xx/5xx is ignored', "if (doc != null && doc >= 400) {", "if (false) {"],
  ['classify', 'M15 a model call is scored as the page working', "if (o.modelCalls > 0) {", "if (false) {"],
  ['classify', 'M16 a press that does nothing passes', "return { status: DEAD_END, evidence: `${who}: nothing happened", "return { status: PASS, evidence: `${who}: nothing happened"],
  ['classify', 'M17 a bounce to sign-in is fine', "if (/^\\/(signin|invitation-required)(\\/|$)/.test(landedPath) && landedPath !== hrefPath) {", "if (false) {"],
  ['classify', 'M18 a click the page itself blocked is hidden as NOT RUN', "if (o.clickError.kind === 'intercepted-by-page') {", "if (false) {"],
  ['classify', 'M19 a disabled control with no stated reason passes', ": { status: NOT_RUN, evidence: `${who} is disabled on arrival and nothing on it says why", ": { status: PASS, evidence: `${who} is disabled on arrival and nothing on it says why"],
  ['classify', 'M19b a disabled control with no stated reason is called a dead end', ": { status: NOT_RUN, evidence: `${who} is disabled on arrival and nothing on it says why", ": { status: DEAD_END, evidence: `${who} is disabled on arrival and nothing on it says why"],
  ['classify', 'M25 a request still in flight is ignored', "if (o.pendingRequests > 0) {", "if (false) {"],
  ['classify', 'M26 the native file chooser is not seen', "if (o.dialogOpened || o.fileChooserOpened || textChanged", "if (o.dialogOpened || textChanged"],
  ['classify', 'M20 an external link is followed as if it were ours', "if (o.externalHref) {", "if (false) {"],
  ['classify', 'M21 a framework error overlay is ignored', "if (o.overlay) {\n      return { status: DEAD_END, evidence: `${who} led to", "if (false) {\n      return { status: DEAD_END, evidence: `${who} led to"],
  ['classify', 'M23 every inert button is excused as already selected', "if (o.alreadySelected) {", "if (true) {"],
  ['classify', 'M24 the current choice is never excused', "if (o.alreadySelected) {", "if (false) {"],
  ['classify', 'M27 a request that started before the press is credited to it', "t >= 0 && t <= (Number(clickMs) || 0) + ATTRIBUTION_MS", "t <= (Number(clickMs) || 0) + ATTRIBUTION_MS"],
  ['classify', 'M28 a request that began long after the press is credited to it', "t >= 0 && t <= (Number(clickMs) || 0) + ATTRIBUTION_MS", "t >= 0"],
  ['classify', 'M29 a request of unknown start is credited to the press (null reads as 0)', "typeof t === 'number' && Number.isFinite(t) && t >= 0 &&", "t >= 0 &&"],
  ['classify', 'M30 a press on a page that was still moving is credited with what lands next', "if (o.unsettledAtPress) {", "if (false) {"],
  ['classify', 'M31 a failed request that was not the press\'s is blamed on it', "const failed = mine.find(r => r.status >= 400);", "const failed = (o.requests || []).find(r => r.status >= 400);"],
  ['classify', 'M32 any successful request in the window is credited to the press', "const okRequest = mine.find(r => r.status >= 200 && r.status < 400);", "const okRequest = (o.requests || []).find(r => r.status >= 200 && r.status < 400);"],
  ['classify', 'M33 a DEAD END does not say which requests were set aside', "if (out.status === DEAD_END && setAside.length) {", "if (false) {"],
  ['classify', 'M34 the attribution window is wide enough to take in a page beacon', "export const ATTRIBUTION_MS = 500;", "export const ATTRIBUTION_MS = 5000;"],
  ['classify', 'M35 nothing is set aside: every request is the press\'s', "const mine = (o.requests || []).filter(r => isCausedByPress(r, o.clickMs));", "const mine = (o.requests || []).filter(r => true);"],
  ['trial', 'M36 the wait for stillness ignores the address', "return `${s.url}|${s.text.length}|${s.text.slice(0, 200)}|${s.controls}|${s.aria}`;", "return `${s.text.length}|${s.text.slice(0, 200)}|${s.controls}|${s.aria}`;"],
  ['classify', 'M22 a same-page anchor to a missing id passes', ": { status: DEAD_END, evidence: `${who} points at ${o.href}", ": { status: PASS, evidence: `${who} points at ${o.href}"],

  // ---- F4: a walk that crashed is not "works" ----
  ['ledger', 'M09 a harness crash does not block "works" (all rows PASS after the crash)', "if (!crash && counts['DEAD END'] === 0 && counts['NOT RUN'] === 0) {", "if (counts['DEAD END'] === 0 && counts['NOT RUN'] === 0) {"],
  ['ledger', 'M09b runPersona does not record the crash on the ledger', "    ledger.fail(e);\n    ledger.note(", "    ledger.note("],
  ['ledger', 'M09c verdict() does not hand the crash to decide', "this._decide(this.rows, { harnessError: this.harnessError })", "this._decide(this.rows)"],
  ['ledger', 'M09d a crash with an empty message is not a crash', "typeof signals.harnessError === 'string'", "signals.harnessError"],
  ['ledger', 'M09e a crash is dropped from the reason when rows also failed', "  if (crash) parts.push(crash);", "  "],
  // ---- F8: a title that repeats the label is not a reason ----
  ['classify', 'M19c any non-empty explanatory text is a reason', "if (t && !own.has(sameText(t))) return t;", "if (t) return t;"],
  ['classify', 'M19d the repeat is compared case-sensitively', "const sameText = (s) => norm(s).toLowerCase();", "const sameText = (s) => norm(s);"],
  ['classify', 'M19e only the label is compared (visible text and aria-label are ignored)', "const own = new Set([o.label, ...(o.ownNames || [])].map(sameText).filter(Boolean));", "const own = new Set([o.label].map(sameText).filter(Boolean));"],
  ['classify', 'M19f only the old single reason is read (a later explanatory text is ignored)', "for (const r of [...(o.disabledReasons || []), o.disabledReason]) {", "for (const r of [o.disabledReason]) {"],
  // ---- F8f: the names a disabled control gives itself reach the comparison whole, not as clipped to the 80 characters shown ----
  ['trial', 'M19g the names are clipped to the 80 characters shown before they are compared', ".map(clean).filter(Boolean) : [];", ".map(clean).filter(Boolean).map(t => t.slice(0, 80)) : [];"],
  ['trial', 'M19h a label taken from the title is not carried as a name (an icon button whose only name is a long title)', "el.textContent, fullLabel].map(clean)", "el.textContent].map(clean)"],
  ['trial', 'M19i a disabled control carries no names at all', "const names = disabled ? [", "const names = false ? ["],
  ['trial', 'M19j the label is clipped before it is carried as a name', "const fullLabel = clean(el.getAttribute('aria-label') || el.innerText || el.value || el.getAttribute('title') || '');", "const fullLabel = clean(el.getAttribute('aria-label') || el.innerText || el.value || el.getAttribute('title') || '').slice(0, 80);"],
  // ---- F6: only a delivered click is a press ----
  ['classify', 'M37 a click that was refused counts as pressed', "if (obs.pressed === true) return null;", "if (obs.pressed === true || obs.clickError) return null;"],
  ['classify', 'M38 a disabled control is not given its own reason (it falls through to "no click was delivered")', "if (obs.disabled) return 'disabled, so not pressed';", ""],
  ['classify', 'M39 the controls the trial cap left alone are not counted', "if (skippedByCap > 0) {", "if (false) {"],
  ['classify', 'M40 a trial that failed before an observation counts as pressed', "if (!obs) return 'its trial failed before any press';", "if (!obs) return null;"],
  ['classify', 'M41 the sentence says each was pressed even when some were not', "if (t.notPressed === 0) return", "if (true) return"],
  ['classify', 'M42 an unrowed control is told apart by its position', "const k = baseKey(c.key);", "const k = String(c.key);"],
  ['classify', 'M43 a revealed control that has a row is still called unrowed', "if (!rowKeys.has(k) && !seen.has(k)) seen.set(k, c);", "if (!seen.has(k)) seen.set(k, c);"],
  ['classify', 'M44 baseKey keeps the position', "String(key ?? '').replace(/#\\d+$/, '')", "String(key ?? '')"],
  ['personas/p1-first-timer.mjs', 'P01 the walk goes a different depth from the README', "export const MAX_DEPTH = 4;", "export const MAX_DEPTH = 3;"],
  ['personas/p1-first-timer.mjs', 'P02 the header counts controls tried, not pressed', "const tally = tallyPresses(tried.map(x => x.obs), skippedByCap);", "const tally = { pressed: tried.length, notPressed: 0, reasons: '' };"],
  ['personas/p1-first-timer.mjs', 'P03 P1-06 goes back to claiming every control was pressed', "'Every control given a row was accounted for: pressed, or listed with why it was not; none left unsettled or skipped by the trial cap'", "'Every control found was pressed and ended PASS, DEAD END or NOT RUN: none skipped'"],
  ['personas/p1-first-timer.mjs', 'P04 P1-06 evidence is no longer the tally sentence', "evidence: describeTally(t, { maxDepth: MAX_DEPTH, outcomes: c })", "evidence: `${t.total} controls found and each pressed`"],
  // ---- F7 / F9: the README ----
  ['README.md', 'D01 the README says three presses deep again', "up to four presses deep (`MAX_DEPTH` is 4", "up to three presses deep (`MAX_DEPTH` is 4"],
  ['README.md', 'D02 the README claims nothing can reach a real provider', "a call made through the Anthropic SDK reaches the stub, never a real provider", "nothing can reach a real provider"],
  ['README.md', 'D03 the README stops saying the network is not isolated', "- **The network.** Nothing stops the app server opening a connection wherever this machine allows.", "- **The network.** The app server is confined."],
  ['run.sh', 'D04 the run.sh header stops saying the network is not isolated', "Nothing stops the app server opening a connection wherever this machine allows (the", "The app server cannot leave this machine (the"],
  // ---- F3: the report directory ----
  ['lib/run-lib.sh', 'S01 a missing report directory yields "/name" (the code that was there)', "  [ -d \"$d\" ] || return 1\n  abs=\"$(cd -- \"$d\" 2>/dev/null && pwd)\" || return 1\n  [ -n \"$abs\" ] || return 1\n", "  abs=\"$(cd -- \"$d\" 2>/dev/null && pwd)\"\n"],
  ['lib/run-lib.sh', 'S02 a report path that is a directory is accepted', "  [ ! -d \"$p\" ] || return 1\n", ""],
  ['run.sh', 'R01 run.sh no longer refuses a report directory that does not exist', "|| { echo \"REFUSED: the report's directory does not exist ($(dirname -- \"$REPORT\")); create it first\"; exit 64; }", "|| true"],
  ['run.mjs', 'J01 run.mjs no longer refuses a report directory that does not exist', "if (!fs.existsSync(reportDir) || !fs.statSync(reportDir).isDirectory() || (fs.existsSync(reportPath) && fs.statSync(reportPath).isDirectory())) {", "if (false) {"],
  // ---- F5: the combined exit code ----
  ['lib/run-lib.sh', 'S03 WJ-1 can never fail the run', "if [ -n \"$w\" ] && [ \"$w\" != 0 ] && [ \"$l\" -lt 64 ]; then echo 1; else echo \"$l\"; fi", "echo \"$l\""],
  ['lib/run-lib.sh', 'S04 a WJ-1 failure overwrites a harness failure code', " && [ \"$l\" -lt 64 ]; then echo 1;", "; then echo 1;"],
  ['run.sh', 'R02 the run exits with the ledger code alone', "exit \"$FINAL_RC\"", "exit \"$RC\""],
  ['run.sh', 'R03 WJ-1\'s code is not handed to the combiner', "FINAL_RC=\"$(jl_combined_exit \"$RC\" \"${WJ1_RC:-}\")\"", "FINAL_RC=\"$(jl_combined_exit \"$RC\" \"\")\""],
  // ---- F10: the Subject ----
  ['lib/run-lib.sh', 'S05 an untracked instrument file does not mark the run', "status --porcelain --untracked-files=all -- tests/e2e/journey-ledger", "status --porcelain --untracked-files=no -- tests/e2e/journey-ledger"],
  ['lib/run-lib.sh', 'S06 any untracked file anywhere marks the run as modified product', "--untracked-files=no -- . ':(exclude)tests/e2e/journey-ledger'", "--untracked-files=all -- . ':(exclude)tests/e2e/journey-ledger'"],
  ['lib/run-lib.sh', 'S07 a modified product file does not mark the run', "[ \"$other\" -gt 0 ] && parts+=", "[ 0 -gt 0 ] && parts+="],
  ['lib/run-lib.sh', 'S08 a modified instrument file does not mark the run', "[ \"$own\" -gt 0 ] && parts+=", "[ 0 -gt 0 ] && parts+="],
  ['lib/run-lib.sh', 'S08b an instrument file is also counted as a modified product file', "-- . ':(exclude)tests/e2e/journey-ledger'", "-- ."],
  ['run.sh', 'R06 the Subject is the bare SHA again', "SUBJECT=\"$(jl_subject \"$ROOT\")\" ||", "SUBJECT=\"$(git rev-parse --short HEAD)\" ||"],
  ['run.sh', 'R07 the report header drops the marker from the Subject', "  Subject: e.JL_SUBJECT,", "  Subject: e.JL_SUBJECT.split(' ')[0],"],
  // ---- F9: the app server's environment ----
  ['lib/run-lib.sh', 'S09 the checkout\'s env-file names are not blanked', "[ -n \"$name\" ] && JL_APP_ENV+=(\"$name=\"); done <<<\"$names\"", "[ -n \"$name\" ] && : ; done <<<\"$names\""],
  ['lib/run-lib.sh', 'S10 the caller\'s HOME is passed to the app', "\"HOME=$RUN/home\"", "\"HOME=$HOME\""],
  ['lib/run-lib.sh', 'S11 the caller\'s API key is passed to the app', "\"ANTHROPIC_API_KEY=journey-ledger-fictional-not-a-key\"", "\"ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY:-x}\""],
  ['lib/run-lib.sh', 'S12 the caller\'s NODE_OPTIONS is passed to the app', "\"NODE_OPTIONS=--max-old-space-size=${JL_APP_HEAP_MB:-8192}\"", "\"NODE_OPTIONS=${NODE_OPTIONS:---max-old-space-size=8192}\""],
  ['lib/run-lib.sh', 'S13 an env-file loader that cannot run is guessed past', "names=\"$(jl_dotenv_names \"$ROOT\")\" || return 1", "names=\"$(jl_dotenv_names \"$ROOT\")\" || true"],
  ['lib/run-lib.sh', 'S14a .env.development.local is not read', "for f in .env.development.local .env.local .env.development .env; do [ -f", "for f in .env.local .env.development .env; do [ -f"],
  ['lib/run-lib.sh', 'S14b .env.local is not read', "for f in .env.development.local .env.local .env.development .env; do [ -f", "for f in .env.development.local .env.development .env; do [ -f"],
  ['lib/run-lib.sh', 'S14c .env.development is not read', "for f in .env.development.local .env.local .env.development .env; do [ -f", "for f in .env.development.local .env.local .env; do [ -f"],
  ['lib/run-lib.sh', 'S14d .env is not read', "for f in .env.development.local .env.local .env.development .env; do [ -f", "for f in .env.development.local .env.local .env.development; do [ -f"],
  ['lib/run-lib.sh', 'S15 the loader\'s answer is discarded', "Object.keys(r.parsedEnv || {}).join(\"\\n\")", "[].join(\"\\n\")"],
  ['lib/run-lib.sh', 'S16 the app\'s TMPDIR is the caller\'s', "\"TMPDIR=$RUN/tmp\"", "\"TMPDIR=${TMPDIR-}\""],
  ['run.sh', 'R04 the app server inherits the caller\'s environment (no env -i)', "setsid env -i \"${JL_APP_ENV[@]}\"", "setsid env \"${JL_APP_ENV[@]}\""],
  ['run.sh', 'R05 an environment that could not be built no longer refuses the run', "jl_build_app_env || { echo \"REFUSED: cannot tell what the checkout's env files would inject into the app (@next/env did not run)\"; exit 71; }", "jl_build_app_env || true"],
  ['run.sh', 'R08 the app server is started through npx again', "\"$ROOT/node_modules/.bin/next\" dev --webpack", "npx next dev --webpack"],
];

// The unmutated copy must pass, or "killed" means nothing.
{
  const { root, dest } = makeCopy('base');
  try {
    const r = runTests(dest, root);
    if (r.status !== 0) { console.log('BASELINE FAILS: the unmutated tests do not pass, so no mutant can be judged'); console.log(r.stdout.split('\n').filter(l => /^not ok|error:/.test(l)).slice(0, 8).join('\n')); process.exit(2); }
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
}

let survived = 0;
for (const [file, name, from, to] of MUTANTS) {
  const { root, dest } = makeCopy('m');
  try {
    const rel = /[./]/.test(file) ? file : `lib/${file}.mjs`;
    const target = path.join(dest, rel);
    const src = fs.readFileSync(target, 'utf8');
    if (!src.includes(from)) { console.log(`INVALID  ${name}: the line it breaks is not in ${rel} (the mutant list is stale)`); survived += 1; continue; }
    fs.writeFileSync(target, src.replace(from, to));
    // A mutant that does not even parse would be "killed" by accident, which proves nothing about the tests.
    if (!parses(target)) { console.log(`INVALID  ${name}: the mutant does not parse`); survived += 1; continue; }
    const r = runTests(dest, root);
    if (r.status === 0) { console.log(`SURVIVED ${name}`); survived += 1; } else {
      console.log(`killed   ${name}`);
      // JL_SHOW_KILLS=1 also prints which tests failed, so the reason a mutant died can be read, not only counted.
      if (process.env.JL_SHOW_KILLS) for (const l of r.stdout.split('\n').filter(l => /^not ok \d+ - /.test(l)).slice(0, 2)) console.log(`           by: ${l.replace(/^not ok \d+ - /, '').slice(0, 130)}`);
    }
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}
console.log(survived === 0 ? `\nall ${MUTANTS.length} mutants killed` : `\n${survived} mutant(s) survived or were invalid`);
process.exit(survived === 0 ? 0 : 1);
