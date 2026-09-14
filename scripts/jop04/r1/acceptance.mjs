#!/usr/bin/env node
// JOP-04 · R1 ACCEPTANCE INSTRUMENT — the judge.
//
// AUTHORITY ORDER (standing rule):
//   sealed semantic rulings → R0 reconciliation → current capability contract → current substrate.
//   Earlier DESCRIPTION-ONLY census/contract artifacts remain historical evidence and do NOT
//   regain implementation authority where later rulings supersede them.
//
// ⛔ CONTAINS NO REPAIR. It judges; it does not fix.
// ⭐ ONE TEST PER FALSIFIABLE BOUNDARY, not one per ruling — several rulings may share a witness.
// ⭐ Every behavioural arm runs against a HERMETIC GIT FIXTURE, never against this repository.
//
// Usage: node scripts/jop04/r1/acceptance.mjs [--json]

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { buildFixture, buildNonRepo, LITERAL_GLOB_FILE, SYMBOL, LOOKALIKE, BRE_PATTERN, MANY_TOKEN, MANY_COUNT, ORDINARY_COMMIT, LITERAL_COMMIT } from './fixture.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();
const require = createRequire(import.meta.url);
const reg = await import(path.join(REPO, 'scripts/builder/deterministic.mjs'));
const { CAPABILITIES, runCapability } = reg;

// ── result model ───────────────────────────────────────────────────────────────────────
// Each boundary declares its PREDECLARED colour. A boundary is CONFORMING when it behaves
// as the ratified law requires. Pre-repair, obligations are expected NONCONFORMING (RED) and
// protected invariants CONFORMING (GREEN). The instrument never "fails" on a predeclared RED.
const results = [];
const B = (id, law, predeclared) => {
  const r = { id, law, predeclared, actual: null, detail: [] };
  results.push(r);
  return {
    conform: (m) => { r.actual = 'GREEN'; r.detail.push(`✔ ${m}`); },
    breach:  (m) => { r.actual = 'RED';   r.detail.push(`✘ ${m}`); },
    note:    (m) => r.detail.push(`  ${m}`),
  };
};
const records = (out) => (out?.stdout ?? '').split('\n').map(s => s.trim()).filter(Boolean);
const files = (out) => [...new Set(records(out).map(l => l.split('\0')[0].replace(/^\.\//, '')))];
// stdio 'pipe' keeps the DELIBERATE failure arms from leaking git's stderr into the report.
const attempt = (fn) => { try { return { ok: true, value: fn() }; } catch (e) { return { ok: false, error: e }; } };

const fx = buildFixture();
const nonRepo = buildNonRepo();

try {
// ── 1 · D4 — the authorship seam (pure observation, no execution) ───────────────────────
// The law, not the mechanism: a pure read-only structure must distinguish caller_terms from
// host_terms for every host-applied default. ⛔ No permit, authority object, digest, receipt
// or RB-6B decision shape is prescribed — only that the distinction be observable.
{
  const t = B('D4', 'caller omission preserved · host default recorded separately with source=host_default', 'RED');
  const H1_DEFAULTS = [
    ['git.rev_parse', 'ref', 'HEAD'], ['git.show_stat', 'ref', 'HEAD'],
    ['git.diff_stat', 'ref1', 'HEAD~1'], ['git.diff_stat', 'ref2', 'HEAD'],
    ['git.branch_contains', 'commit', 'HEAD'], ['repo.grep', 'max_results', 200],
    ['inventory.migrations', 'dir', 'database/migrations'], ['inventory.routes', 'dir', 'app'],
  ];
  const describe = reg.describeInvocation;
  if (typeof describe !== 'function') {
    t.breach('no pure observation seam exists: scripts/builder/deterministic.mjs exports no describeInvocation()');
    t.note('required minimum: describeInvocation(name, args) → { caller_terms, host_terms, effective_terms }');
    t.note(`the same law must hold for all ${H1_DEFAULTS.length} host-applied defaults — one boundary, not eight concepts`);
  } else {
    const bad = [];
    for (const [cap, field, dflt] of H1_DEFAULTS) {
      const omitted = describe(cap, {});
      const explicit = describe(cap, { [field]: dflt });
      const okOmitted = omitted?.caller_terms?.[field] === undefined
        && omitted?.host_terms?.[field]?.value === dflt
        && omitted?.host_terms?.[field]?.source === 'host_default';
      const okExplicit = explicit?.caller_terms?.[field] === dflt
        && explicit?.host_terms?.[field] === undefined;
      if (!okOmitted || !okExplicit) bad.push(`${cap}.${field}`);
    }
    bad.length === 0
      ? t.conform(`all ${H1_DEFAULTS.length} host-applied defaults keep caller absence and host authorship distinct`)
      : t.breach(`authorship collapsed for: ${bad.join(', ')}`);
  }
}

// ── 2 · D1 — literal path identity, table-driven over all five PATH fields ──────────────
{
  const t = B('D1', 'PATH fields carry literal identity; glob/magic spelling is never selection authority', 'RED');
  // ⭐ Each arm needs a discriminator appropriate to WHAT THAT CAPABILITY RETURNS.
  //    Path-listing capabilities return FILENAMES; commit capabilities return COMMITS. Using the
  //    filename discriminator on git.log/git.file_history made those two arms pass vacuously in
  //    the first pre-repair run — a known defect reading GREEN. Corrected here.
  const LEAK_FILE = /app\/a\.ts|app\/b\.ts/;                    // ordinary files: reachable only by glob
  const LEAK_COMMIT = new RegExp(ORDINARY_COMMIT.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const CASES = [
    ['repo.find_file', { pattern: LITERAL_GLOB_FILE }, LEAK_FILE, 'filenames'],
    ['inventory.migrations', { dir: LITERAL_GLOB_FILE }, LEAK_FILE, 'filenames'],
    ['inventory.routes', { dir: LITERAL_GLOB_FILE }, LEAK_FILE, 'filenames'],
    ['git.log', { path: LITERAL_GLOB_FILE }, LEAK_COMMIT, 'commits'],
    ['git.file_history', { file: LITERAL_GLOB_FILE }, LEAK_COMMIT, 'commits'],
  ];
  const breaches = [];
  for (const [cap, args, leakRe, kind] of CASES) {
    const r = attempt(() => runCapability(cap, args, fx.root));
    if (!r.ok) { breaches.push(`${cap} threw: ${String(r.error.message).split('\n')[0]}`); continue; }
    const out = r.value.stdout || '';
    // Positive control: the arm must actually be able to see the literal subject at all.
    const sees = kind === 'filenames' ? out.includes(LITERAL_GLOB_FILE) : out.includes(LITERAL_COMMIT);
    if (!sees) { breaches.push(`${cap} did not reach the literal subject at all — arm is not discriminating`); continue; }
    if (leakRe.test(out)) breaches.push(`${cap} also matched the ORDINARY ${kind} — the spelling acted as SELECTION`);
    else t.note(`${cap} · literal identity held (${kind})`);
  }
  breaches.length === 0
    ? t.conform('all five PATH fields treated the wildcard-looking name as an identity')
    : breaches.forEach(b => t.breach(b));
}

// ── 3 · D5 — BRE is pinned by the contract; ambient config cannot change meaning ────────
{
  const t = B('D5', 'repo.grep.pattern is POSIX BRE; ambient grep.patternType has no authority', 'RED');
  t.note(`fixture declares grep.patternType=${execFileSync('git', ['-C', fx.root, 'config', '--get', 'grep.patternType'], { encoding: 'utf8' }).trim()}`);
  const r = attempt(() => runCapability('repo.grep', { pattern: BRE_PATTERN }, fx.root));
  if (!r.ok) t.breach(`threw: ${String(r.error.message).split('\n')[0]}`);
  else {
    const f = files(r.value);
    const alternated = f.includes('app/a.ts') && f.includes('app/b.ts');   // BRE: ZEBRA or QUAGGA
    alternated
      ? t.conform(`'${BRE_PATTERN}' alternated under a fixture whose ambient dialect is 'extended' — the contract won`)
      : t.breach(`'${BRE_PATTERN}' did not alternate (matched ${JSON.stringify(f)}) — the AMBIENT dialect decided the meaning`);
  }
}

// ── 4 · D6 + F-D — the three-arm witness (one boundary, two opposite bad repairs) ───────
{
  const t = B('D6', 'ARM 1 · punctuation in symbol is sought literally and cannot author matcher syntax', 'RED');
  const r = attempt(() => runCapability('repo.locate_symbol', { symbol: SYMBOL }, fx.root));
  if (!r.ok) t.breach(`threw: ${String(r.error.message).split('\n')[0]}`);
  else {
    const hit = records(r.value).join('\n');
    const literalFound = hit.includes(SYMBOL);
    const lookalikeMatched = hit.includes(LOOKALIKE);
    t.note(`literal '${SYMBOL}' found=${literalFound} · lookalike '${LOOKALIKE}' also matched=${lookalikeMatched}`);
    (literalFound && !lookalikeMatched)
      ? t.conform("only the literal whole-symbol occurrence qualified — '.' was sought, not executed")
      : t.breach(lookalikeMatched
          ? `'${LOOKALIKE}' matched: the caller's '.' authored matcher syntax`
          : `the literal symbol was not found`);
  }
}
{
  const t = B('F-D', 'ARM 2 · a valid search finding nothing SUCCEEDS with zero records', 'RED');
  const r = attempt(() => runCapability('repo.locate_symbol', { symbol: 'ZZ_DEFINITELY_ABSENT_SYMBOL' }, fx.root));
  if (!r.ok) t.breach(`ordinary absence THREW (${String(r.error.message).split('\n')[0].slice(0, 60)}…) — absence collapsed into failure`);
  else records(r.value).length === 0
    ? t.conform('absence returned success with zero records')
    : t.breach(`expected zero records, got ${records(r.value).length}`);
}
{
  const t = B('F-D.5', 'ARM 3 · a GENUINE execution failure propagates and is NEVER normalized to zero', 'GREEN');
  t.note('invoked against a directory that is not a git repository');
  const r = attempt(() => runCapability('repo.locate_symbol', { symbol: MANY_TOKEN }, nonRepo.root));
  r.ok
    ? t.breach(`a non-repository returned success (${records(r.value).length} records) — a broad catch swallowed a real failure`)
    : t.conform(`genuine failure propagated: ${String(r.error.message).split('\n')[0].slice(0, 70)}`);
}

// ── 5 · D3 — global bound + prefix law ──────────────────────────────────────────────────
{
  const t = B('D3', 'max_results is a GLOBAL bound; results(N) is a prefix of results(M) for N<M', 'RED');
  const one = attempt(() => runCapability('repo.grep', { pattern: MANY_TOKEN, max_results: 1 }, fx.root));
  const three = attempt(() => runCapability('repo.grep', { pattern: MANY_TOKEN, max_results: 3 }, fx.root));
  if (!one.ok || !three.ok) t.breach('repo.grep threw while bounded');
  else {
    const r1 = records(one.value), r3 = records(three.value);
    t.note(`max_results=1 → ${r1.length} records · max_results=3 → ${r3.length} · fixture contains ${MANY_COUNT} matching lines`);
    const bounded = r1.length <= 1 && r3.length <= 3;
    const prefix = r1.every((l, i) => l === r3[i]);
    bounded && prefix
      ? t.conform('the bound is honoured globally and the smaller result is a prefix of the larger')
      : t.breach(bounded ? 'bounded, but the smaller result is not a prefix of the larger' : `the bound was ignored (1→${r1.length}, 3→${r3.length})`);
  }
}

// ── 6 · D3/D4 — authorship of 200 survives identical effective output ───────────────────
{
  const t = B('D3/D4', 'omitted → host 200 · explicit 200 → caller 200 · identical execution does not collapse identity', 'RED');
  const describe = reg.describeInvocation;
  if (typeof describe !== 'function') {
    t.breach('no observation seam: identical effective output cannot be distinguished from identical authorship');
  } else {
    const om = describe('repo.grep', { pattern: MANY_TOKEN });
    const ex = describe('repo.grep', { pattern: MANY_TOKEN, max_results: 200 });
    const okOm = om?.caller_terms?.max_results === undefined && om?.host_terms?.max_results?.value === 200 && om?.host_terms?.max_results?.source === 'host_default';
    const okEx = ex?.caller_terms?.max_results === 200 && ex?.host_terms?.max_results === undefined;
    (okOm && okEx) ? t.conform('the two invocations remain distinguishable by authorship')
                   : t.breach('authorship of 200 is not distinguishable between omission and explicit supply');
  }
}

// ── 7 · D2.6 — `format` is REFUSED AT ADMISSION, at both layers that exist today ────────
{
  const t = B('D2.6', 'git.log { format } is REFUSED — not stripped, not ignored, not canonicalized to {}', 'RED');
  const r = attempt(() => runCapability('git.log', { format: '%H' }, fx.root));
  if (r.ok) t.breach(`runCapability ACCEPTED an unauthorized format (returned ${records(r.value).length} records)`);
  else t.conform(`runCapability refused: ${String(r.error.message).split('\n')[0].slice(0, 60)}`);

  const CF = require(path.join(REPO, 'jarvis-desktop/src/capability-form.js'));
  const man = CF.buildManifest(CAPABILITIES);
  const entry = man.find(e => e.name === 'git.log');
  const solicits = !!entry?.args?.some(a => a.name === 'format');
  const sub = CF.validateSubmission({ manifest: man, capabilityName: 'git.log', mode: 'structured', rawValues: { format: '%H' } });
  t.note(`the Desktop form solicits a format field: ${solicits}`);
  sub.ok
    ? t.breach('validateSubmission ACCEPTED format — the form layer admits an unauthorized term')
    : t.conform('validateSubmission refused format');
  // ⭐ The form is a faithful schema lens, so removing `format` from the authoritative registry
  //    should remove the ordinary affordance with no second UI repair — but ADVANCED JSON
  //    submission must still reject it as an unexpected argument.
  const adv = CF.validateSubmission({ manifest: man, capabilityName: 'git.log', mode: 'advanced', rawJson: '{"format":"%H"}' });
  adv.ok ? t.breach('advanced JSON submission ACCEPTED format') : t.conform('advanced JSON submission refused format');
}

// ── 8 · D2.3 — the existing observable git.log output is PINNED ─────────────────────────
{
  const t = B('D2.3', 'removing `format` may not redesign git.log output: fields, order, dates, quoting, record order', 'GREEN');
  const pinPath = path.join(HERE, 'pinned-gitlog-output.json');
  const r = attempt(() => runCapability('git.log', { max_count: 3 }, fx.root));
  if (!r.ok) { t.breach(`git.log threw: ${String(r.error.message).split('\n')[0]}`); }
  else if (!fs.existsSync(pinPath)) {
    fs.writeFileSync(pinPath, JSON.stringify({
      _note: 'Captured from the UNREPAIRED subject against the hermetic fixture. This is the D2.3 pin.',
      capability: 'git.log', args: { max_count: 3 }, stdout: r.value.stdout, exit_code: r.value.exit_code,
    }, null, 2) + '\n');
    t.note('PIN CREATED from the unrepaired subject — this run establishes the baseline');
    t.conform('observable output captured and frozen');
  } else {
    const pin = JSON.parse(fs.readFileSync(pinPath, 'utf8'));
    pin.stdout === r.value.stdout && pin.exit_code === r.value.exit_code
      ? t.conform('observable output byte-identical to the pin')
      : t.breach('observable git.log output CHANGED against the pin');
  }
}

// ── 9 · H1 effective behaviour — adding authorship truth changes no current result ───────
{
  const t = B('H1-effective', 'omitted and default-equivalent valid calls still produce the same effective result', 'GREEN');
  const pairs = [
    ['git.rev_parse', {}, { ref: 'HEAD' }],
    ['inventory.routes', {}, { dir: 'app' }],
    ['inventory.migrations', {}, { dir: 'database/migrations' }],
  ];
  const bad = [];
  for (const [cap, a, b] of pairs) {
    const ra = attempt(() => runCapability(cap, a, fx.root)), rb = attempt(() => runCapability(cap, b, fx.root));
    if (!ra.ok || !rb.ok || ra.value.stdout !== rb.value.stdout) bad.push(cap);
  }
  bad.length === 0 ? t.conform(`effective equivalence preserved for ${pairs.length} default-bearing capabilities`)
                   : t.breach(`effective result diverged for: ${bad.join(', ')}`);
}

// ── 10 · out-of-scope boundaries must remain untouched ──────────────────────────────────
{
  const t = B('check.run', 'check.run is OUT OF SCOPE and untouched', 'GREEN');
  const spec = CAPABILITIES['check.run'];
  const shape = spec?.args?.test_type;
  (shape?.type === 'enum' && Array.isArray(shape.enum) && shape.enum.join(',') === 'typecheck,test,lint')
    ? t.conform('check.run declaration unchanged (enum typecheck,test,lint)')
    : t.breach('check.run declaration changed — R1 crossed a boundary it was told to stay out of');
}
{
  const t = B('verify.*', 'unrelated verify.* behaviour is untouched', 'GREEN');
  const fileOk = attempt(() => runCapability('verify.file_exists', { path: 'many.txt' }, fx.root));
  const shaOk = attempt(() => runCapability('verify.sha256', { path: 'many.txt' }, fx.root));
  const cnt = attempt(() => runCapability('verify.count_matches', { pattern: MANY_TOKEN, file: 'many.txt' }, fx.root));
  const counted = cnt.ok && /(^|\D)12(\D|$)/.test(cnt.value.stdout || '');
  (fileOk.ok && shaOk.ok && cnt.ok && counted)
    ? t.conform(`verify.file_exists · verify.sha256 · verify.count_matches all behave (count=${MANY_COUNT})`)
    : t.breach(`verify.* behaviour changed (exists=${fileOk.ok} sha=${shaOk.ok} count=${cnt.ok}/${counted})`);
}

} finally {
  fx.cleanup();
  nonRepo.cleanup();
}

// ── report ──────────────────────────────────────────────────────────────────────────────
const pad = (s, n) => String(s).padEnd(n);
console.log('JOP-04 · R1 ACCEPTANCE INSTRUMENT — pre-repair run');
console.log(`subject: ${execFileSync('git', ['rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).trim()}   fixture: hermetic, deterministic\n`);
for (const r of results) {
  const match = r.actual === r.predeclared;
  console.log(`${match ? '  ' : '⚠️'} ${pad(r.id, 14)} predeclared ${pad(r.predeclared, 6)} actual ${pad(r.actual ?? '—', 6)} ${match ? '' : '← MISMATCH'}`);
  console.log(`   ${r.law}`);
  for (const d of r.detail) console.log(`     ${d}`);
}
const mismatches = results.filter(r => r.actual !== r.predeclared);
const red = results.filter(r => r.actual === 'RED').length;
const green = results.filter(r => r.actual === 'GREEN').length;
console.log(`\n---- ${red} RED · ${green} GREEN · ${mismatches.length} mismatch(es) against the predeclared matrix ----`);
if (mismatches.length) {
  console.log('⚠️  A mismatch is a finding about the INSTRUMENT or the SPEC, never a licence to change the product:');
  console.log('    protected invariant RED  → the instrument widened its jurisdiction; fix the instrument');
  console.log('    known defect GREEN       → the witness cannot judge that repair; strengthen the instrument');
}
if (process.argv.includes('--json')) fs.writeFileSync(path.join(HERE, 'unrepaired-matrix.json'), JSON.stringify(results, null, 2) + '\n');
process.exit(mismatches.length === 0 ? 0 : 1);
