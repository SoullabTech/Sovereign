#!/usr/bin/env node
// matrix.mjs -- the lethality matrix for the Writer original-file intake acceptance instrument.
//
// Plain Node ESM, node: built-ins plus the suite's own modules, zero npm dependencies. Fictional data only.
// It ties the seven modules together with checks NO SINGLE MODULE CAN MAKE ABOUT ITSELF, each paired with a
// known-wrong input that the check must kill, so a check that cannot fail is not counted.
//
//   node matrix.mjs                run the quick steps               (about 1 minute)
//   node matrix.mjs --full         add the three shipped mutation audits (strip, tree, scanners; about 10 minutes)
//   node matrix.mjs --sweep[=N]    add the mutation sweep of the four modules that have no audit of their own
//                                  (fixtures, receipt, falsifiers-a, falsifiers-b): N mutants each, default 24,
//                                  deterministic (seeded), about 5-10 minutes
//   node matrix.mjs --seed=S       change the sweep seed (a different seed samples different mutants)
//   node matrix.mjs --probe=MODULE:FINGERPRINT[:K]
//                                  apply ONE named mutant (the fingerprint printed by --sweep; K picks the K-th site when a line holds
//                                  several) and report KILLED or SURVIVED with the first failing checks. For triage; touches no source.
//
// STEPS
//   A selftests      every module's own selfTest, run as a child process: exit 0 and passed == total.
//   H content-free   the output of every selfTest holds no canary-shaped token. The scan uses the REAL scanners and the
//                    REAL fixtures canary, and is proven armed by planting a canary the scan must find.
//   C integrity      falsifier ids are unique, every cited obligation is in the index, no GREEN falsifier cites an
//                    obligation the index expects RED. Three planted contradictions must each be found.
//   D reality        every falsifier's check() on THIS repository equals its declared expectedToday, none INCONCLUSIVE.
//   E no-laundering  the best-case receipt (every obligation PASS with measured evidence) is NOT STEP4_READY while
//                    dispositions.json is unruled. A discriminating control proves the same input CAN reach STEP4_READY
//                    once ruled, so the refusal is attributable to the missing ruling and not to a malformed input.
//   B audits         (--full) strip, tree, scanners --mutation-audit: every mutant killed.
//   F sweep          (--sweep) seeded source mutants of fixtures, receipt, falsifiers-a, falsifiers-b: a mutant that
//                    leaves the module's selfTest green is a SURVIVOR. Survivors are never hidden; one is allowed only if
//                    matrix-survivors.json classifies it with a stated reason (an equivalent mutant, for example).
//
// WHAT THE VERDICT MEANS
//   PASS_COMPLETE  every step ran and passed.
//   PASS_PARTIAL   nothing failed but at least one step did not run. The line names which; a step that did not run is
//                  never counted as passed.
//   FAIL           at least one step failed. Exit status 1.
//
// WHAT THIS CANNOT ESTABLISH
//   It measures the instrument, not the product. A green matrix says the checks are internally consistent and hard to
//   defeat in the ways listed; it does not say the intake is correct, and it authorizes nothing.

import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../../..');
const args = process.argv.slice(2);
const FULL = args.includes('--full');
const sweepArg = args.find((a) => a === '--sweep' || a.startsWith('--sweep='));
const SWEEP = Boolean(sweepArg);
const SWEEP_N = sweepArg && sweepArg.includes('=') ? Math.max(1, parseInt(sweepArg.split('=')[1], 10) || 24) : 24;
const SEED = parseInt((args.find((a) => a.startsWith('--seed=')) || '--seed=20261102').split('=')[1], 10) || 20261102;

const MODULES = [
  { name: 'strip', file: 'lib/strip.mjs', audit: true },
  { name: 'tree', file: 'lib/tree.mjs', audit: true },
  { name: 'fixtures', file: 'fixtures.mjs', audit: false },
  { name: 'scanners', file: 'scanners.mjs', audit: true },
  { name: 'receipt', file: 'receipt.mjs', audit: false },
  { name: 'falsifiers-a', file: 'falsifiers-a.mjs', audit: false },
  { name: 'falsifiers-b', file: 'falsifiers-b.mjs', audit: false },
];
const SWEEP_TARGETS = MODULES.filter((m) => !m.audit);
const MUT_PREFIX = '.matrix-mut-';

// ------------------------------------------------------------------------------------------------------------------
// helpers
// ------------------------------------------------------------------------------------------------------------------

/** A clean environment for child processes: no ambient cloud credentials or proxies reach the instrument. */
function cleanEnv() {
  const env = { ...process.env };
  for (const k of Object.keys(env)) if (/^(AWS_|HTTPS?_PROXY$|ALL_PROXY$|NODE_USE_ENV_PROXY$)/i.test(k)) delete env[k];
  return env;
}

function run(file, extra = [], timeoutMs = 1_700_000) {
  return new Promise((resolve) => {
    const t0 = Date.now();
    const child = spawn(process.execPath, [file, ...extra], { cwd: HERE, env: cleanEnv(), stdio: ['ignore', 'pipe', 'pipe'] });
    let out = '';
    let err = '';
    let timedOut = false;
    const timer = setTimeout(() => { timedOut = true; child.kill('SIGKILL'); }, timeoutMs);
    child.stdout.on('data', (d) => { out += d; });
    child.stderr.on('data', (d) => { err += d; });
    child.on('close', (code) => { clearTimeout(timer); resolve({ code: timedOut ? null : code, out, err, timedOut, ms: Date.now() - t0 }); });
    child.on('error', () => { clearTimeout(timer); resolve({ code: null, out, err: err + 'spawn error', timedOut, ms: Date.now() - t0 }); });
  });
}

const steps = [];
function record(id, status, detail) { steps.push({ id, status, detail }); console.log(`${status.padEnd(8)} ${id.padEnd(14)} ${detail}`); }
const imp = (rel) => import(pathToFileURL(path.join(HERE, rel)).href);

function cleanupMutants() {
  for (const f of fs.readdirSync(HERE)) if (f.startsWith(MUT_PREFIX)) { try { fs.unlinkSync(path.join(HERE, f)); } catch { /* best effort */ } }
}
process.on('SIGINT', () => { cleanupMutants(); process.exit(130); });
process.on('SIGTERM', () => { cleanupMutants(); process.exit(143); });

// ------------------------------------------------------------------------------------------------------------------
// A. self-tests
// ------------------------------------------------------------------------------------------------------------------

const outputs = new Map(); // module name -> combined stdout+stderr, kept for step H

async function stepSelftests() {
  const results = await Promise.all(MODULES.map((m) => run(m.file)));
  const problems = [];
  const counts = [];
  results.forEach((r, i) => {
    const m = MODULES[i];
    outputs.set(m.name, `${r.out}\n${r.err}`);
    const c = /(\d+)\/(\d+) checks/.exec(r.out);
    if (r.timedOut) problems.push(`${m.name}: timed out`);
    else if (r.code !== 0) problems.push(`${m.name}: exit ${r.code}`);
    else if (!c) problems.push(`${m.name}: no "N/N checks" summary line to read`);
    else if (c[1] !== c[2]) problems.push(`${m.name}: ${c[1]}/${c[2]} checks`);
    else counts.push(`${m.name} ${c[1]}`);
  });
  if (problems.length) record('A selftests', 'FAIL', problems.join('; '));
  else record('A selftests', 'PASS', `7 of 7 modules exit 0 with passed == total (${counts.join(', ')})`);
}

// ------------------------------------------------------------------------------------------------------------------
// H. content-free
// ------------------------------------------------------------------------------------------------------------------

async function stepContentFree() {
  if (outputs.size === 0) { record('H content-free', 'SKIPPED', 'needs the captured output of step A'); return; }
  const fx = await imp('fixtures.mjs');
  const sc = await imp('scanners.mjs');
  const shape = new RegExp(`${fx.CANARY_PREFIX}[0-9A-Za-z]{8,}`);
  // armed? plant a canary the scan must find, with the real scanner, and require the clean text to be clean
  const planted = fx.makeCanary('0123456789abcdef01234567');
  const needles = sc.makeNeedles({ canary: planted }, { partial: true }); // only the canary is under test here
  const controlText = `${[...outputs.values()][0]}\n${planted}\n`;
  const armedShape = shape.test(controlText);
  const armedScanner = sc.scanText(controlText, needles).hits.length > 0;
  if (!armedShape || !armedScanner) { record('H content-free', 'FAIL', `the scan is not armed (shape finds planted canary: ${armedShape}; scanner finds it: ${armedScanner})`); return; }
  const dirty = [];
  for (const [name, text] of outputs) {
    if (shape.test(text)) dirty.push(`${name}: canary-shaped token`);
    if (/-----BEGIN [A-Z ]*PRIVATE KEY-----/.test(text)) dirty.push(`${name}: private-key block`);
    if (/\bAKIA[0-9A-Z]{16}\b/.test(text)) dirty.push(`${name}: AWS access-key-id shape`);
    if (sc.scanText(text, needles).hits.length > 0) dirty.push(`${name}: scanner hit against the control canary`);
  }
  if (dirty.length) record('H content-free', 'FAIL', dirty.join('; '));
  else record('H content-free', 'PASS', `${outputs.size} module outputs hold no canary-shaped token, key block or access-key shape; the scan finds a planted canary (armed)`);
}

// ------------------------------------------------------------------------------------------------------------------
// C. integrity (pure function, so it can be proven against planted contradictions)
// ------------------------------------------------------------------------------------------------------------------

export function crossCheck(falsifiers, index) {
  const errors = [];
  const info = [];
  const by = new Map(index.obligations.map((o) => [o.id, o]));
  const seen = new Set();
  for (const f of falsifiers) {
    if (seen.has(f.id)) errors.push(`duplicate falsifier id ${f.id}`);
    seen.add(f.id);
    const obs = f.obligations || [];
    if (obs.length === 0) errors.push(`${f.id} cites no obligation`);
    for (const id of obs) if (!by.has(id)) errors.push(`${f.id} cites ${id}, which is not in the index`);
    const flagged = obs.filter((id) => by.get(id)?.expectedRedToday === true);
    if (f.expectedToday === 'GREEN' && flagged.length > 0) errors.push(`${f.id} is GREEN today but cites ${flagged.join(',')}, which the index expects RED`);
    if (f.expectedToday === 'RED' && flagged.length === 0) info.push(f.id);
  }
  return { errors, understated: info };
}

async function stepIntegrity() {
  const A = await imp('falsifiers-a.mjs');
  const B = await imp('falsifiers-b.mjs');
  const all = [...A.FALSIFIERS_A, ...B.FALSIFIERS_B];
  const index = JSON.parse(fs.readFileSync(path.join(HERE, 'obligation-index.json'), 'utf8'));
  const real = crossCheck(all, index);
  // known-wrong inputs the check must catch
  const redObligation = index.obligations.find((o) => o.expectedRedToday === true).id;
  const base = all[0];
  const controls = [
    ['duplicate id', [...all, { ...base }]],
    ['unknown obligation', [...all, { id: 'SF-X1', expectedToday: 'RED', obligations: ['NO-SUCH-ID'] }]],
    ['GREEN citing an expected-RED obligation', [...all, { id: 'SF-X2', expectedToday: 'GREEN', obligations: [redObligation] }]],
  ];
  const notKilled = controls.filter(([, fs_]) => crossCheck(fs_, index).errors.length === 0).map(([n]) => n);
  if (notKilled.length) { record('C integrity', 'FAIL', `the check missed planted contradiction(s): ${notKilled.join(', ')}`); return; }
  const cited = new Set(all.flatMap((f) => f.obligations || []));
  const note = `${all.length} falsifiers cite ${cited.size} of ${index.obligations.length} obligations; ${real.understated.length} RED falsifier(s) cite none the index marks expected-RED (${real.understated.join(', ') || 'none'}) -- the index flag is title-derived, the falsifier verdict is the measured one`;
  if (real.errors.length) record('C integrity', 'FAIL', real.errors.join('; '));
  else record('C integrity', 'PASS', `no id/duplicate/contradiction errors; 3 planted contradictions caught. INFO: ${note}`);
}

// ------------------------------------------------------------------------------------------------------------------
// D. reality
// ------------------------------------------------------------------------------------------------------------------

async function stepReality() {
  const A = await imp('falsifiers-a.mjs');
  const B = await imp('falsifiers-b.mjs');
  const { createTree } = await imp('lib/tree.mjs');
  const tree = createTree(ROOT);
  const all = [...A.FALSIFIERS_A, ...B.FALSIFIERS_B];
  const wrong = [];
  let green = 0;
  let red = 0;
  for (const f of all) {
    let r;
    try { r = await f.check(tree); } catch (e) { r = { ok: false, evidence: [`INCONCLUSIVE: threw ${e.message}`] }; }
    const inconclusive = (r.evidence || []).some((l) => l.startsWith('INCONCLUSIVE'));
    const verdict = inconclusive ? 'INCONCLUSIVE' : r.ok ? 'GREEN' : 'RED';
    if (verdict === 'GREEN') green++; else if (verdict === 'RED') red++;
    if (verdict !== f.expectedToday) wrong.push(`${f.id} is ${verdict}, declared ${f.expectedToday}`);
  }
  if (wrong.length) record('D reality', 'FAIL', `${wrong.length} falsifier(s) disagree with the repository as it is: ${wrong.join('; ')}`);
  else record('D reality', 'PASS', `${all.length} falsifiers measured on this repository: ${green} GREEN, ${red} RED, 0 INCONCLUSIVE, every one equal to its declared expectedToday`);
}

// ------------------------------------------------------------------------------------------------------------------
// E. no laundering
// ------------------------------------------------------------------------------------------------------------------

async function stepNoLaundering() {
  const R = await imp('receipt.mjs');
  const { index, dispositions } = R.loadSuiteData();
  const results = index.obligations.map((ob) => ({
    id: ob.id,
    status: 'PASS',
    environment: 'E2',
    realKms: ob.requiresRealKms === true,
    realVault: ob.requiresRealVault === true,
    browser: ob.requiresBrowser === true,
    evidence: [{ kind: 'assertion', ref: `matrix:best-case:${ob.id}`, summary: `best-case construction for ${ob.id}, asserted by the matrix` }],
  }));
  const header = { suite: 'writer-source-intake', kind: R.MEASURED_HEADER_KIND };
  let unruled;
  let ruled;
  try {
    unruled = R.buildReceipt({ index, dispositions, results, header });
    const sealed = R.sealRuling(JSON.parse(JSON.stringify(dispositions)), index, 'matrix-control-ruling');
    ruled = R.buildReceipt({ index, dispositions: sealed, results, header });
  } catch (e) {
    record('E no-laundering', 'FAIL', `could not construct the best-case receipt: ${e.name || 'Error'}`);
    return;
  }
  const problems = [];
  if (ruled.verdict !== 'STEP4_READY') problems.push(`the CONTROL (same best-case input, ruled) is ${ruled.verdict}, not STEP4_READY, so a refusal of the unruled receipt would prove nothing`);
  if (unruled.verdict === 'STEP4_READY') problems.push('an UNRULED receipt with best-case measured evidence reached STEP4_READY');
  if (!(unruled.provisionalReasons || []).includes('NOT_RULED') && unruled.verdict !== 'NOT_READY') problems.push(`unruled verdict ${unruled.verdict} does not name NOT_RULED`);
  const v1 = R.validateReceipt(unruled, { index, dispositions });
  if (!v1.ok) problems.push(`the independent validator rejects the unruled receipt: ${v1.codes.join(',')}`);
  if (problems.length) record('E no-laundering', 'FAIL', problems.join('; '));
  else record('E no-laundering', 'PASS', `best-case input is ${unruled.verdict} while unruled (reasons: ${(unruled.provisionalReasons || []).join(',') || 'none'}) and STEP4_READY once ruled; the independent validator agrees`);
}

// ------------------------------------------------------------------------------------------------------------------
// B. shipped mutation audits
// ------------------------------------------------------------------------------------------------------------------

async function stepAudits() {
  if (!FULL) { record('B audits', 'SKIPPED', 'not run (use --full): strip, tree and scanners --mutation-audit'); return; }
  const audited = MODULES.filter((m) => m.audit);
  const rs = await Promise.all(audited.map((m) => run(m.file, ['--mutation-audit'])));
  const bad = [];
  const ok = [];
  rs.forEach((r, i) => {
    const s = /\((\d+)\/(\d+) mutants killed\)/.exec(r.out);
    if (r.code !== 0 || !s || s[1] !== s[2]) bad.push(`${audited[i].name}: ${s ? `${s[1]}/${s[2]} killed` : 'no result line'}, exit ${r.code}`);
    else ok.push(`${audited[i].name} ${s[1]}/${s[2]}`);
  });
  if (bad.length) record('B audits', 'FAIL', bad.join('; '));
  else record('B audits', 'PASS', `every shipped mutant killed (${ok.join(', ')})`);
}

// ------------------------------------------------------------------------------------------------------------------
// F. mutation sweep of the modules that have no audit of their own
// ------------------------------------------------------------------------------------------------------------------

/** Marks which characters of JS source are CODE (not comments, strings, template literals or regex literals). */
export function codeMask(src) {
  const n = src.length;
  const mask = new Uint8Array(n);
  let ok = true;
  const prevWord = (i) => /\b(return|typeof|case|in|of|delete|void|throw|new|else|do|yield|await)\s*$/.test(src.slice(Math.max(0, i - 12), i));
  function skipString(i, q) {
    i++;
    while (i < n && src[i] !== q) { if (src[i] === '\\') i++; if (src[i] === '\n') { ok = false; return i; } i++; }
    return i + 1;
  }
  function skipTemplate(i) {
    i++;
    while (i < n) {
      const c = src[i];
      if (c === '\\') { i += 2; continue; }
      if (c === '`') return i + 1;
      if (c === '$' && src[i + 1] === '{') { i = skipBraces(i + 2); continue; }
      i++;
    }
    ok = false;
    return n;
  }
  function skipBraces(i) { // after "${": to the matching "}", over nested strings, templates, comments, braces
    let depth = 1;
    while (i < n && depth > 0) {
      const c = src[i];
      if (c === '/' && src[i + 1] === '/') { while (i < n && src[i] !== '\n') i++; continue; }
      if (c === '/' && src[i + 1] === '*') { i += 2; while (i < n && !(src[i] === '*' && src[i + 1] === '/')) i++; i += 2; continue; }
      if (c === "'" || c === '"') { i = skipString(i, c); continue; }
      if (c === '`') { i = skipTemplate(i); continue; }
      if (c === '{') depth++;
      else if (c === '}') depth--;
      i++;
    }
    return i;
  }
  let prev = '';
  let i = 0;
  while (i < n) {
    const c = src[i];
    const d = src[i + 1];
    if (c === '/' && d === '/') { while (i < n && src[i] !== '\n') i++; continue; }
    if (c === '/' && d === '*') { i += 2; while (i < n && !(src[i] === '*' && src[i + 1] === '/')) i++; i += 2; continue; }
    if (c === "'" || c === '"') { i = skipString(i, c); prev = '"'; continue; }
    if (c === '`') { i = skipTemplate(i); prev = '`'; continue; }
    if (c === '/' && (prev === '' || '(,=:[!&|?{};+-*%<>~^'.includes(prev) || prevWord(i))) {
      i++;
      let inClass = false;
      while (i < n) {
        if (src[i] === '\\') { i += 2; continue; }
        if (src[i] === '\n') { ok = false; break; }
        if (src[i] === '[') inClass = true;
        else if (src[i] === ']') inClass = false;
        else if (src[i] === '/' && !inClass) break;
        i++;
      }
      i++;
      while (i < n && /[a-z]/.test(src[i])) i++;
      prev = '/';
      continue;
    }
    mask[i] = 1;
    if (!/\s/.test(c)) prev = c;
    i++;
  }
  return { mask, ok: ok && i >= n };
}

const OPERATORS = [
  { op: '===->!==', re: /===/g, to: '!==' },
  { op: '!==->===', re: /!==/g, to: '===' },
  { op: '&&->||', re: /&&(?!=)/g, to: '||' },
  { op: '||->&&', re: /\|\|(?!=)/g, to: '&&' },
  { op: '>=->>', re: /(?<![=<>!])>=(?!=)/g, to: '>' },
  { op: '<=-><', re: /(?<![=<>!])<=(?!=)/g, to: '<' },
  { op: 'return true->false', re: /\breturn true\b/g, to: 'return false' },
  { op: 'return false->true', re: /\breturn false\b/g, to: 'return true' },
  { op: 'ok: true->false', re: /\bok: true\b/g, to: 'ok: false' },
  { op: 'ok: false->true', re: /\bok: false\b/g, to: 'ok: true' },
  { op: 'delete !', re: /(?<![=!<>&|])!(?![=])(?=[A-Za-z_$(])/g, to: '' },
];

export function candidates(src) {
  const { mask, ok } = codeMask(src);
  if (!ok) return { ok: false, list: [] };
  const list = [];
  for (const o of OPERATORS) {
    o.re.lastIndex = 0;
    let m;
    while ((m = o.re.exec(src))) {
      let allCode = true;
      for (let k = m.index; k < m.index + m[0].length; k++) if (!mask[k]) { allCode = false; break; }
      if (allCode) list.push({ op: o.op, at: m.index, len: m[0].length, to: o.to });
    }
  }
  return { ok: true, list };
}

function lcg(seed) { let s = seed >>> 0; return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; }
function shuffle(arr, rnd) { for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; } return arr; }
const sha = (s) => crypto.createHash('sha256').update(s).digest('hex').slice(0, 16);

function loadClassified() {
  const p = path.join(HERE, 'matrix-survivors.json');
  if (!fs.existsSync(p)) return new Map();
  const j = JSON.parse(fs.readFileSync(p, 'utf8'));
  return new Map((j.classified || []).filter((e) => e.fingerprint && e.reason && String(e.reason).trim().length >= 20).map((e) => [e.fingerprint, e]));
}

async function sweepModule(mod, classified) {
  const abs = path.join(HERE, mod.file);
  const src = fs.readFileSync(abs, 'utf8');
  const cand = candidates(src);
  if (!cand.ok) return { mod: mod.name, error: 'source could not be masked (unterminated construct): the sweep cannot run on this module' };
  // control: the UNMUTATED source under the temporary name must pass, or the sweep itself is invalid
  const ctlName = `${MUT_PREFIX}${mod.name}-control.mjs`;
  fs.writeFileSync(path.join(HERE, ctlName), src);
  const base = await run(ctlName);
  if (base.code !== 0) return { mod: mod.name, error: `control (unmutated copy under a temporary name) failed with exit ${base.code}: the temporary file perturbs the module, so a sweep would be invalid` };
  const timeout = Math.max(120_000, base.ms * 6);
  const rnd = lcg(SEED ^ parseInt(sha(mod.name).slice(0, 8), 16));
  const pool = shuffle(cand.list.slice(), rnd);
  const lineOf = (idx) => src.slice(0, idx).split('\n').length;
  const killed = [];
  const survivors = [];
  let tried = 0;
  for (const c of pool) {
    if (tried >= SWEEP_N) break;
    const mutated = src.slice(0, c.at) + c.to + src.slice(c.at + c.len);
    const name = `${MUT_PREFIX}${mod.name}-${tried}.mjs`;
    fs.writeFileSync(path.join(HERE, name), mutated);
    const syntax = spawnSync(process.execPath, ['--check', path.join(HERE, name)], { encoding: 'utf8' });
    if (syntax.status !== 0) { fs.unlinkSync(path.join(HERE, name)); continue; } // not a valid program: not a mutant
    tried++;
    const r = await run(name, [], timeout);
    fs.unlinkSync(path.join(HERE, name));
    const line = lineOf(c.at);
    const original = src.split('\n')[line - 1].trim();
    const fingerprint = sha(`${mod.name}|${c.op}|${original}`);
    if (r.code !== 0) killed.push({ line, op: c.op, by: r.timedOut ? 'timeout' : `exit ${r.code}` });
    else survivors.push({ line, op: c.op, fingerprint, classified: classified.get(fingerprint) || null });
  }
  try { fs.unlinkSync(path.join(HERE, ctlName)); } catch { /* best effort */ }
  return { mod: mod.name, tried, killed, survivors, available: cand.list.length };
}

async function stepSweep() {
  if (!SWEEP) { record('F sweep', 'SKIPPED', 'not run (use --sweep[=N]): seeded source mutants of fixtures, receipt, falsifiers-a, falsifiers-b'); return; }
  cleanupMutants();
  const classified = loadClassified();
  const results = await Promise.all(SWEEP_TARGETS.map((m) => sweepModule(m, classified)));
  const errors = results.filter((r) => r.error);
  const lines = [];
  let unclassified = 0;
  let totalKilled = 0;
  let totalTried = 0;
  let totalClassified = 0;
  for (const r of results) {
    if (r.error) { lines.push(`${r.mod}: ${r.error}`); continue; }
    totalKilled += r.killed.length;
    totalTried += r.tried;
    const surv = r.survivors.filter((s) => !s.classified);
    totalClassified += r.survivors.length - surv.length;
    unclassified += surv.length;
    lines.push(`${r.mod}: ${r.killed.length}/${r.tried} killed of ${r.available} available mutants${r.survivors.length ? `; survivors: ${r.survivors.map((s) => `L${s.line} ${s.op} [${s.fingerprint}]${s.classified ? ' (classified)' : ''}`).join(', ')}` : ''}`);
  }
  const detail = `seed ${SEED}, up to ${SWEEP_N} per module -- ${totalKilled}/${totalTried} killed, ${totalClassified} survivor(s) classified, ${unclassified} UNCLASSIFIED. ${lines.join(' | ')}`;
  if (errors.length || unclassified > 0) record('F sweep', 'FAIL', detail);
  else record('F sweep', 'PASS', detail);
}

// ------------------------------------------------------------------------------------------------------------------

/** Apply one named mutant to a module's selfTest and say what kills it. Source on disk is never modified. */
async function probe(spec) {
  const [modName, fingerprint, kStr] = spec.split(':');
  const mod = SWEEP_TARGETS.find((m) => m.name === modName);
  if (!mod) { console.log(`PROBE ERROR unknown module "${modName}" (one of ${SWEEP_TARGETS.map((m) => m.name).join(', ')})`); return 2; }
  const abs = path.join(HERE, mod.file);
  const src = fs.readFileSync(abs, 'utf8');
  const cand = candidates(src);
  if (!cand.ok) { console.log('PROBE ERROR source could not be masked'); return 2; }
  const lines = src.split('\n');
  const lineOf = (idx) => src.slice(0, idx).split('\n').length;
  const hits = cand.list.filter((c) => sha(`${mod.name}|${c.op}|${lines[lineOf(c.at) - 1].trim()}`) === fingerprint);
  const k = kStr ? parseInt(kStr, 10) : 0;
  if (hits.length === 0) { console.log(`PROBE ERROR no mutant has fingerprint ${fingerprint} in ${mod.name} (the line may have been edited or removed)`); return 2; }
  if (k >= hits.length) { console.log(`PROBE ERROR fingerprint has only ${hits.length} site(s); K=${k} is out of range`); return 2; }
  const c = hits[k];
  const name = `${MUT_PREFIX}${mod.name}-probe.mjs`;
  fs.writeFileSync(path.join(HERE, name), src.slice(0, c.at) + c.to + src.slice(c.at + c.len));
  try {
    const syntax = spawnSync(process.execPath, ['--check', path.join(HERE, name)], { encoding: 'utf8' });
    if (syntax.status !== 0) { console.log('PROBE ERROR the mutant is not a valid program'); return 2; }
    const r = await run(name, [], 600_000);
    const failing = (r.out + '\n' + r.err).split('\n').filter((l) => /^\s*FAIL\b|selfTest.*FAIL|mismatch|not ok/i.test(l)).slice(0, 4).map((l) => l.trim().slice(0, 200));
    const where = `${mod.name} L${lineOf(c.at)} ${c.op} site ${k + 1}/${hits.length}`;
    if (r.code !== 0) console.log(`KILLED   ${where}  (${r.timedOut ? 'timeout' : `exit ${r.code}`})${failing.length ? `\n  ${failing.join('\n  ')}` : ''}`);
    else console.log(`SURVIVED ${where}: the module's selfTest still exits 0 with this change\n  line: ${lines[lineOf(c.at) - 1].trim().slice(0, 220)}`);
    return r.code !== 0 ? 0 : 1;
  } finally {
    try { fs.unlinkSync(path.join(HERE, name)); } catch { /* best effort */ }
  }
}

async function main() {
  const probeArg = args.find((a) => a.startsWith('--probe='));
  if (probeArg) { process.exit(await probe(probeArg.slice('--probe='.length))); }
  console.log(`writer-source-intake matrix  (root ${path.relative(process.cwd(), ROOT) || '.'}, mode: ${FULL ? 'full' : 'quick'}${SWEEP ? `+sweep(${SWEEP_N}, seed ${SEED})` : ''})`);
  cleanupMutants();
  try {
    // A step that throws is a FAILED step, never a crashed matrix and never a silent pass.
    const guarded = (id, fn) => async () => {
      try { await fn(); } catch (e) { record(id, 'FAIL', `step threw ${e && e.name ? e.name : 'Error'}: ${String(e && e.message).slice(0, 160)}`); }
    };
    await guarded('A selftests', stepSelftests)();
    await guarded('H content-free', stepContentFree)();
    await guarded('C integrity', stepIntegrity)();
    await guarded('D reality', stepReality)();
    await guarded('E no-laundering', stepNoLaundering)();
    await guarded('B audits', stepAudits)();
    await guarded('F sweep', stepSweep)();
  } finally {
    cleanupMutants();
  }
  const failed = steps.filter((s) => s.status === 'FAIL');
  const skipped = steps.filter((s) => s.status === 'SKIPPED');
  const verdict = failed.length ? 'FAIL' : skipped.length ? 'PASS_PARTIAL' : 'PASS_COMPLETE';
  console.log(`\nMATRIX ${verdict}: ${steps.length - skipped.length - failed.length} passed, ${failed.length} failed, ${skipped.length} not run${skipped.length ? ` (${skipped.map((s) => s.id).join('; ')})` : ''}`);
  process.exit(failed.length ? 1 : 0);
}

const isMain = process.argv[1] && fs.realpathSync(process.argv[1]) === fs.realpathSync(fileURLToPath(import.meta.url));
if (isMain) await main();
