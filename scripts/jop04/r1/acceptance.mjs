#!/usr/bin/env node
// JOP-04 · R1a ACCEPTANCE INSTRUMENT — the judge.
//
// AUTHORITY ORDER: sealed semantic rulings → R0 reconciliation → current capability contract →
//   current substrate. Earlier DESCRIPTION-ONLY census/contract artifacts remain historical
//   evidence and do NOT regain implementation authority where later rulings supersede them.
//
// ⛔ CONTAINS NO REPAIR. ⛔ READ-ONLY AND FAIL-CLOSED: it never creates or rewrites sealed custody.
//    A missing or changed pin is a HARD FAILURE, never a re-baseline — a judge that can mint its
//    own baseline from the thing it judges is fail-open.
// ⭐ One test per falsifiable boundary. Every behavioural arm runs against a HERMETIC fixture.
//
// ⭐ TWO TEMPORAL PHASES, both stated explicitly and neither derived from the other:
//      --phase pre    the unrepaired custody state — eight obligations RED, five invariants GREEN
//      --phase post   the acceptance state         — ALL THIRTEEN boundaries GREEN
//    The SEMANTIC OBSERVATIONS are identical in both modes. Only the expected custody state differs.
//    ⛔ The phase is MANDATORY. A judge that defaults to a temporal mode can be run in the wrong one
//    and have its exit status treated as authority.
//
// Usage: node scripts/jop04/r1/acceptance.mjs --phase <pre|post> [--json <external-path>]

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import {
  buildFixture, buildNonRepo, LITERAL_GLOB_FILE, LITERAL_MAGIC_FILE, ORDINARY_FILE,
  SYMBOL, LOOKALIKE, EMBED_LEFT, EMBED_RIGHT, BRE_PATTERN, MANY_TOKEN, MANY_COUNT,
  C_ORDINARY, C_GLOB, C_MAGIC,
  buildSymbolDomainFixture, DOMAIN_WORD_NEIGHBOUR, DOMAIN_DASH_LEADING, DOMAIN_ABSENT,
  DOMAIN_ASTRAL, MARK_ASTRAL_STANDALONE, MARK_ASTRAL_EMBEDDED,
  DOMAIN_BMP, MARK_BMP_STANDALONE, MARK_BMP_ASTRAL_LEFT, MARK_BMP_ASTRAL_RIGHT,
} from './fixture.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();
const require = createRequire(import.meta.url);
const reg = await import(path.join(REPO, 'scripts/builder/deterministic.mjs'));
const { CAPABILITIES, runCapability } = reg;
const CF = require(path.join(REPO, 'jarvis-desktop/src/capability-form.js'));

// ── PHASE TARGETS ──────────────────────────────────────────────────────────────────────
// ⛔ `post` is written out in full, NOT computed by inverting `pre`. A mechanically inverted
//    postcondition would encode "whatever pre was not", which is a restatement of the defect
//    rather than a statement of the law. The acceptance state is: every boundary GREEN.
const BOUNDARY_IDS = ['D4', 'D1', 'D5', 'D6', 'D6-domain', 'D6-unicode', 'role-separation', 'D4-admission', 'D3-numeric', 'F-D', 'F-D.5', 'D3', 'D3/D4', 'D2.6', 'D2.3', 'H1-effective', 'check.run', 'verify.*'];
const PHASE_TARGETS = {
  pre: {
    'D4': 'RED', 'D1': 'RED', 'D5': 'RED', 'D6': 'RED', 'F-D': 'RED', 'F-D.5': 'GREEN',
    'D3': 'RED', 'D3/D4': 'RED', 'D2.6': 'RED', 'D2.3': 'GREEN', 'H1-effective': 'GREEN',
    'check.run': 'GREEN', 'verify.*': 'GREEN',
    // R1c: all three were RED at the unrepaired subject too — no seam existed, the same
    // spelling-based path test applied, and the derived matcher imported a grammar.
    'D6-domain': 'RED', 'role-separation': 'RED', 'D4-admission': 'RED',
    // R1d: at the unrepaired subject neither law was implemented at all — no host boundary
    // policy existed, and no seam existed to agree or disagree with the executor.
    'D6-unicode': 'RED', 'D3-numeric': 'RED',
  },
  post: {
    'D4': 'GREEN', 'D1': 'GREEN', 'D5': 'GREEN', 'D6': 'GREEN', 'F-D': 'GREEN', 'F-D.5': 'GREEN',
    'D3': 'GREEN', 'D3/D4': 'GREEN', 'D2.6': 'GREEN', 'D2.3': 'GREEN', 'H1-effective': 'GREEN',
    'check.run': 'GREEN', 'verify.*': 'GREEN',
    'D6-domain': 'GREEN', 'role-separation': 'GREEN', 'D4-admission': 'GREEN',
    'D6-unicode': 'GREEN', 'D3-numeric': 'GREEN',
  },
};
const pi = process.argv.indexOf('--phase');
const PHASE = pi > -1 ? process.argv[pi + 1] : undefined;
if (!PHASE || !Object.prototype.hasOwnProperty.call(PHASE_TARGETS, PHASE)) {
  console.error(PHASE ? `⛔ UNKNOWN PHASE: '${PHASE}'` : '⛔ NO --phase GIVEN');
  console.error('   This judge encodes two temporal custody states and will not guess which one you mean.');
  console.error('   node scripts/jop04/r1/acceptance.mjs --phase pre    # the unrepaired state');
  console.error('   node scripts/jop04/r1/acceptance.mjs --phase post   # the acceptance state (all GREEN)');
  process.exit(2);
}
const TARGET = PHASE_TARGETS[PHASE];

const PIN_GITLOG = path.join(HERE, 'pinned-gitlog-output.json');
const PIN_SCOPE = path.join(HERE, 'pinned-out-of-scope.json');

const results = [];
const B = (id, law) => {
  if (!Object.prototype.hasOwnProperty.call(TARGET, id)) {
    console.error(`⛔ INSTRUMENT ERROR: boundary '${id}' has no target in either phase table.`);
    process.exit(2);
  }
  const r = { id, law, phase: PHASE, predeclared: TARGET[id], actual: null, detail: [] };
  results.push(r);
  return {
    conform: (m) => { if (r.actual !== 'RED') r.actual = 'GREEN'; r.detail.push(`✔ ${m}`); },
    breach:  (m) => { r.actual = 'RED'; r.detail.push(`✘ ${m}`); },
    note:    (m) => r.detail.push(`  ${m}`),
  };
};
const records = (o) => (o?.stdout ?? '').split('\n').map(s => s.trim()).filter(Boolean);
const paths = (o) => [...new Set(records(o).map(l => l.split('\0')[0].replace(/^\.\//, '')))];
const attempt = (fn) => { try { return { ok: true, value: fn() }; } catch (e) { return { ok: false, error: e }; } };
const sha = (s) => crypto.createHash('sha256').update(s).digest('hex').slice(0, 16);

// ⛔ FAIL-CLOSED CUSTODY GATE — before any judging happens.
for (const [p, what] of [[PIN_GITLOG, 'D2.3 git.log output pin'], [PIN_SCOPE, 'out-of-scope shape pin']]) {
  if (!fs.existsSync(p)) {
    console.error(`⛔ SEALED CUSTODY MISSING: ${what} (${path.relative(REPO, p)})`);
    console.error('   The acceptance run is READ-ONLY. It will not manufacture a baseline from the');
    console.error('   subject it is judging. Restore the sealed pin, or re-seal under a custody ruling');
    console.error('   with: node scripts/jop04/r1/seal-pins.mjs');
    process.exit(2);
  }
}

const fx = buildFixture();
const nonRepo = buildNonRepo();
// [capability, default-bearing field, host default, BASE caller terms]
// ⭐ The base terms are whatever OTHER required arguments make the probe a VALID invocation.
//    Without them, describe('git.branch_contains', {}) and describe('repo.grep', {}) are not
//    invocations at all — and a correct observation seam that refuses inadmissible requests would
//    stay RED forever, or be forced to describe request shapes that are not invocations.
//    ⛔ That would make the INSTRUMENT author a new semantic requirement ("describeInvocation must
//    accept invalid partial requests"). Nothing in D4 authorized that. This repairs the probe, not D4.
const H1_DEFAULTS = [
  ['git.rev_parse', 'ref', 'HEAD', {}],
  ['git.show_stat', 'ref', 'HEAD', {}],
  ['git.diff_stat', 'ref1', 'HEAD~1', {}],
  ['git.diff_stat', 'ref2', 'HEAD', {}],
  ['git.branch_contains', 'commit', 'HEAD', { branch: 'main' }],
  ['repo.grep', 'max_results', 200, { pattern: MANY_TOKEN }],
  ['inventory.migrations', 'dir', 'database/migrations', {}],
  ['inventory.routes', 'dir', 'app', {}],
];
// (capability, omittedArgs, explicitArgs) — 7 invocation pairs covering all 8 defaults.
const PAIRS = [
  ['git.rev_parse', {}, { ref: 'HEAD' }],
  ['git.show_stat', {}, { ref: 'HEAD' }],
  ['git.diff_stat', {}, { ref1: 'HEAD~1', ref2: 'HEAD' }],
  ['git.branch_contains', { branch: 'main' }, { branch: 'main', commit: 'HEAD' }],
  ['repo.grep', { pattern: MANY_TOKEN }, { pattern: MANY_TOKEN, max_results: 200 }],
  ['inventory.migrations', {}, { dir: 'database/migrations' }],
  ['inventory.routes', {}, { dir: 'app' }],
];

try {
// ── 1 · D4 — the authorship seam, bound to EFFECTIVE EXECUTION ──────────────────────────
{
  const t = B('D4', 'caller omission preserved · host default recorded with source=host_default · the described plan corresponds to the act performed',);
  const describe = reg.describeInvocation;
  if (typeof describe !== 'function') {
    t.breach('no pure observation seam: deterministic.mjs exports no describeInvocation()');
    t.note('required minimum: describeInvocation(name, args) → { caller_terms, host_terms, effective_terms }');
    t.note(`the same law must hold for all ${H1_DEFAULTS.length} host-applied defaults — one boundary, not eight concepts`);
  } else {
    const bad = [];
    for (const [cap, field, dflt, base] of H1_DEFAULTS) {
      const om = attempt(() => describe(cap, { ...base })).value;
      const ex = attempt(() => describe(cap, { ...base, [field]: dflt })).value;
      const okOm = om?.caller_terms?.[field] === undefined
        && om?.host_terms?.[field]?.value === dflt
        && om?.host_terms?.[field]?.source === 'host_default'
        && om?.effective_terms?.[field] === dflt;          // ⭐ effective_terms is VERIFIED, not just required
      const okEx = ex?.caller_terms?.[field] === dflt
        && ex?.host_terms?.[field] === undefined
        && ex?.effective_terms?.[field] === dflt;
      if (!okOm || !okEx) bad.push(`${cap}.${field}`);
    }
    bad.length === 0 ? t.conform(`all ${H1_DEFAULTS.length} defaults keep caller absence and host authorship distinct, with effective_terms agreeing`)
                     : t.breach(`authorship or effective_terms wrong for: ${bad.join(', ')}`);
  }
  // ⭐ CORRESPONDENCE — the described plan must match the act actually performed. Without this a
  //    beautiful, truthful-LOOKING describeInvocation() could sit beside handlers that still
  //    derive defaults independently, and the judge would certify documentation, not execution.
  const diverged = [];
  for (const [cap, a, b] of PAIRS) {
    const ra = attempt(() => runCapability(cap, a, fx.root));
    const rb = attempt(() => runCapability(cap, b, fx.root));
    const same = ra.ok === rb.ok && (!ra.ok || ra.value.stdout === rb.value.stdout);
    if (!same) diverged.push(cap);
  }
  diverged.length === 0
    ? t.conform(`execution(omitted) == execution(explicit effective default) for all ${PAIRS.length} pairs — the plan corresponds to the act`)
    : t.breach(`execution diverged for: ${diverged.join(', ')} — described plan ≠ act performed`);
}

// ── 2 · D1 — literal identity: selection injection AND namespace annexation ─────────────
{
  const t = B('D1', 'PATH fields carry literal identity — glob spelling is not selection authority, magic spelling is not namespace authority',);
  const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const LEAK_FILE_GLOB = /(^|\s|\0)app\/a\.ts|app\/b\.ts/;
  const LEAK_COMMIT_GLOB = new RegExp(esc(C_ORDINARY));
  const VECTORS = [
    { name: 'wildcard', subject: LITERAL_GLOB_FILE, commit: C_GLOB, leakFile: LEAK_FILE_GLOB, leakCommit: LEAK_COMMIT_GLOB },
    // ⛔ magic: ':(literal)app/a.ts' as a PATHSPEC denotes the ORDINARY file app/a.ts.
    { name: 'magic', subject: LITERAL_MAGIC_FILE, commit: C_MAGIC, leakFile: new RegExp(`(^|\\s|\\0)${esc(ORDINARY_FILE)}$`, 'm'), leakCommit: LEAK_COMMIT_GLOB },
  ];
  const FIELDS = [
    ['repo.find_file', (s) => ({ pattern: s }), 'paths'],
    ['inventory.migrations', (s) => ({ dir: s }), 'paths'],
    ['inventory.routes', (s) => ({ dir: s }), 'paths'],
    ['git.log', (s) => ({ path: s }), 'commits'],
    ['git.file_history', (s) => ({ file: s }), 'commits'],
  ];
  for (const v of VECTORS) {
    for (const [cap, mk, kind] of FIELDS) {
      const r = attempt(() => runCapability(cap, mk(v.subject), fx.root));
      if (!r.ok) { t.breach(`${cap} · ${v.name} threw: ${String(r.error.message).split('\n')[0].slice(0, 55)}`); continue; }
      const out = r.value.stdout || '';
      // POSITIVE CONTROL: the arm must reach its literal subject, or it is not discriminating.
      const sees = kind === 'paths' ? paths(r.value).includes(v.subject) : out.includes(v.commit);
      if (!sees) { t.breach(`${cap} · ${v.name} did not reach the literal subject — REJECTED it instead (D1 forbids that too)`); continue; }
      const leak = kind === 'paths' ? v.leakFile.test(paths(r.value).join('\n')) : v.leakCommit.test(out);
      leak ? t.breach(`${cap} · ${v.name} ALSO matched the ordinary ${kind} — the spelling acted as ${v.name === 'magic' ? 'NAMESPACE AUTHORITY' : 'SELECTION'}`)
           : t.note(`${cap} · ${v.name} · literal identity held (${kind})`);
    }
  }
  if (results.at(-1).actual !== 'RED') t.conform('both vectors literal across all five PATH fields');
}

// ── 3 · D5 — BRE pinned by contract; ambient dialect has no authority ───────────────────
{
  const t = B('D5', 'repo.grep.pattern is POSIX BRE; ambient grep.patternType has no authority',);
  t.note(`fixture ambient dialect = ${execFileSync('git', ['-C', fx.root, 'config', '--get', 'grep.patternType'], { encoding: 'utf8' }).trim()}`);
  const r = attempt(() => runCapability('repo.grep', { pattern: BRE_PATTERN }, fx.root));
  if (!r.ok) t.breach(`threw: ${String(r.error.message).split('\n')[0].slice(0, 60)}`);
  else {
    const f = paths(r.value);
    (f.includes('app/a.ts') && f.includes('app/b.ts'))
      ? t.conform(`'${BRE_PATTERN}' alternated despite an 'extended' ambient dialect — the contract won`)
      : t.breach(`'${BRE_PATTERN}' did not alternate (matched ${JSON.stringify(f)}) — the AMBIENT dialect decided the meaning`);
  }
}

// ── 4 · D6 — literal AND whole-symbol AND ambient-independent ───────────────────────────
{
  const t = B('D6', 'symbol is sought literally, as a WHOLE symbol, with no authority from ambient matcher config',);
  const r = attempt(() => runCapability('repo.locate_symbol', { symbol: SYMBOL }, fx.root));
  if (!r.ok) t.breach(`threw: ${String(r.error.message).split('\n')[0].slice(0, 60)}`);
  else {
    const hit = records(r.value).join('\n');
    const has = (s) => hit.includes(s);
    // The subject line is the only one containing SYMBOL without an adjacent word character.
    const subjectFound = /SUBJECT/.test(hit);
    const controls = [
      ['regex-authority', LOOKALIKE, /regexControl/.test(hit)],
      ['left boundary (substring)', EMBED_LEFT, /leftControl/.test(hit)],
      ['right boundary (substring)', EMBED_RIGHT, /rightControl/.test(hit)],
    ];
    subjectFound ? t.note('subject line found') : t.breach('the literal whole-symbol occurrence was not found');
    for (const [why, text, matched] of controls) {
      matched ? t.breach(`${why}: '${text}' matched — that is ${why === 'regex-authority' ? "the caller's '.' authoring matcher syntax" : 'raw substring search, not whole-symbol lookup'}`)
              : t.note(`${why} control held ('${text}' not matched)`);
    }
    if (subjectFound && controls.every(([, , m]) => !m)) t.conform('literal, whole-symbol, and no regex authority');
  }
  // ⭐ D6.4 — ambient independence: the same invocation across two ambient dialects.
  const fxB = buildFixture({ patternType: 'basic' });
  try {
    const a = attempt(() => runCapability('repo.locate_symbol', { symbol: SYMBOL }, fx.root));
    const b = attempt(() => runCapability('repo.locate_symbol', { symbol: SYMBOL }, fxB.root));
    const norm = (x) => x.ok ? records(x.value).map(l => l.split('\0').slice(1).join('\0')).join('\n') : `THREW:${String(x.error.message).split('\n')[0]}`;
    norm(a) === norm(b)
      ? t.conform("identical semantics under ambient 'extended' and 'basic' (D6.4)")
      : t.breach('ambient grep.patternType changed what the same symbol invocation means (D6.4)');
  } finally { fxB.cleanup(); }
}

// ── 4b · R1c · D6 FULL SYMBOL DOMAIN ───────────────────────────────────────────────────
// D6 permits ARBITRARY literal symbol strings and forbids an accidental identifier grammar.
// ⛔ Removing the caller's REGEX authority is not the same as narrowing the caller's DOMAIN.
{
  const t = B('D6-domain', 'any literal string the schema admits is SOUGHT — no word-character grammar, no argv grammar');
  const dfx = buildSymbolDomainFixture();
  try {
    // ARM 1 · a legitimate symbol whose LEFT NEIGHBOUR is a word character. A word-boundary
    //         rule reports it absent although it is present — a confident WRONG ANSWER.
    const w = attempt(() => runCapability('repo.locate_symbol', { symbol: DOMAIN_WORD_NEIGHBOUR }, dfx.root));
    if (!w.ok) t.breach(`'${DOMAIN_WORD_NEIGHBOUR}' THREW: ${String(w.error.message).split('\n')[0].slice(0, 55)}`);
    else records(w.value).length > 0
      ? t.conform(`'${DOMAIN_WORD_NEIGHBOUR}' found despite a word character on its left`)
      : t.breach(`'${DOMAIN_WORD_NEIGHBOUR}' reported ABSENT although it is present — an imported word-character grammar, and a confident wrong answer rather than an error`);

    // ARM 2 · a legitimate symbol that BEGINS WITH '-'. Caller text is a term to be sought,
    //         never a position in the tool's own option grammar.
    const d = attempt(() => runCapability('repo.locate_symbol', { symbol: DOMAIN_DASH_LEADING }, dfx.root));
    if (!d.ok) t.breach(`'${DOMAIN_DASH_LEADING}' THREW — caller text was consumed as an OPTION, not sought: ${String(d.error.message).split('\n')[0].slice(0, 50)}`);
    else records(d.value).length > 0
      ? t.conform(`'${DOMAIN_DASH_LEADING}' sought literally, not parsed as an option`)
      : t.breach(`'${DOMAIN_DASH_LEADING}' reported absent although it is present`);

    // ARM 3 · CONTROL — widening the domain must not resurrect absence-as-failure (F-D).
    const a = attempt(() => runCapability('repo.locate_symbol', { symbol: DOMAIN_ABSENT }, dfx.root));
    (a.ok && records(a.value).length === 0)
      ? t.conform('a genuinely absent symbol still returns success with zero records')
      : t.breach('absence handling regressed while widening the domain');
  } finally { dfx.cleanup(); }
}

// ── 4b-ii · R1d · D6 UNICODE EDGE ──────────────────────────────────────────────────────
// The whole-symbol policy is host-authored — so its OWN stated notion of a word constituent
// must be applied correctly. A policy that classifies Unicode with \p{L} but indexes UTF-16
// CODE UNITS misreads its own rule at the symbol's edges: `symbol[0]` on an astral letter is
// a lone high surrogate, which no letter test matches.
// ⛔ The consequence is a REAL misclassification, not a cosmetic one: an astral symbol whose
//    edge is wrongly read as non-word becomes boundary-satisfied unconditionally, so it
//    matches as a FRAGMENT of a longer word-constituent run.
// ⛔ An ASCII-only replacement is not admissible — that would narrow the domain D6 protects.
{
  const t = B('D6-unicode', 'word-constituent classification operates on CODE POINTS, never on UTF-16 halves');
  const dfx = buildSymbolDomainFixture();
  try {
    const r = attempt(() => runCapability('repo.locate_symbol', { symbol: DOMAIN_ASTRAL }, dfx.root));
    if (!r.ok) t.breach(`astral symbol THREW: ${String(r.error.message).split('\n')[0].slice(0, 55)}`);
    else {
      const hit = records(r.value).join('\n');
      const standalone = hit.includes(MARK_ASTRAL_STANDALONE);
      const embedded = hit.includes(MARK_ASTRAL_EMBEDDED);
      t.note(`standalone matched=${standalone} · embedded matched=${embedded}`);
      standalone
        ? t.conform('the astral symbol is FOUND standing alone — the domain is not narrowed')
        : t.breach('the astral symbol was not found standing alone — the domain was narrowed');
      !embedded
        ? t.conform('the astral symbol is NOT found as a fragment of a longer word-constituent run')
        : t.breach('matched as a FRAGMENT — the SYMBOL edge code point was misread as a UTF-16 half');
    }

    // ⭐ R1e · THE CONTENT SIDE OF THE SAME LAW.
    // The arms above exercise only the SYMBOL's edges. The policy also indexes the characters
    // ADJACENT TO THE OCCURRENCE, so a repair that fixed only `[...symbol][0]` would pass them
    // while still reading content neighbours as code units. Here the symbol is an ordinary BMP
    // letter and the surrogate pair sits in the CONTENT beside it.
    const b = attempt(() => runCapability('repo.locate_symbol', { symbol: DOMAIN_BMP }, dfx.root));
    if (!b.ok) t.breach(`BMP symbol THREW: ${String(b.error.message).split('\n')[0].slice(0, 55)}`);
    else {
      const hit = records(b.value).join('\n');
      const standalone = hit.includes(MARK_BMP_STANDALONE);
      const astralLeft = hit.includes(MARK_BMP_ASTRAL_LEFT);
      const astralRight = hit.includes(MARK_BMP_ASTRAL_RIGHT);
      t.note(`BMP symbol · standalone=${standalone} · astral-left=${astralLeft} · astral-right=${astralRight}`);
      standalone
        ? t.conform('the BMP symbol is FOUND standing alone — the domain is not narrowed')
        : t.breach('the BMP symbol was not found standing alone — the domain was narrowed');
      !astralLeft
        ? t.conform('an astral LETTER immediately to the LEFT correctly blocks the boundary')
        : t.breach('matched with an astral letter to its left — content[i-1] was the LOW SURROGATE, misread as non-word');
      !astralRight
        ? t.conform('an astral LETTER immediately to the RIGHT correctly blocks the boundary')
        : t.breach('matched with an astral letter to its right — content[j] was the HIGH SURROGATE, misread as non-word');
    }
  } finally { dfx.cleanup(); }
}

// ── 4c · R1c · ROLE SEPARATION (D5 · D6 · D1) ──────────────────────────────────────────
// ⭐ A caller term's ROLE comes from the capability contract, never from how the value is
//    SPELLED. A GREP_PATTERN or a SYMBOL that happens to contain '../' is not a PATH.
//    Inference-by-characters is the architecture the rulings superseded.
// ⛔ And this must NOT become permission to drop containment: the control arm requires a
//    real PATH field to keep refusing an escape.
{
  const t = B('role-separation', 'role is contract-assigned; a PATTERN or SYMBOL is never adjudicated as a PATH by spelling — while real PATH containment holds');
  const ESCAPEY = '../x';
  for (const [cap, args, role] of [
    ['repo.grep', { pattern: ESCAPEY }, 'GREP_PATTERN'],
    ['repo.locate_symbol', { symbol: ESCAPEY }, 'SYMBOL'],
  ]) {
    const r = attempt(() => runCapability(cap, args, fx.root));
    if (r.ok) t.conform(`${cap} admitted '${ESCAPEY}' as a ${role} (${records(r.value).length} records)`);
    else /resolves outside cwd/.test(String(r.error.message))
      ? t.breach(`${cap} refused '${ESCAPEY}' as a PATH — the ${role} was adjudicated by its SPELLING`)
      : t.breach(`${cap} threw for another reason: ${String(r.error.message).split('\n')[0].slice(0, 55)}`);
  }
  // CONTROL — containment for an actual PATH field must survive.
  const guard = attempt(() => runCapability('verify.file_exists', { path: '../../../etc/passwd' }, fx.root));
  (!guard.ok && /outside cwd/.test(String(guard.error.message)))
    ? t.conform('a real PATH field still refuses an escape — containment intact')
    : t.breach('PATH containment was LOST — role separation must not be bought by dropping containment');
}

// ── 4d · R1c · D4 ADMISSION CORRESPONDENCE ─────────────────────────────────────────────
// The seam must describe INVOCATIONS, not requests execution would refuse. Admissibility is
// one judgement: whatever runCapability() refuses, describeInvocation() must refuse too.
{
  const t = B('D4-admission', 'describeInvocation admits exactly what runCapability admits — it never describes a request execution would refuse');
  const describe = reg.describeInvocation;
  if (typeof describe !== 'function') t.breach('no observation seam exists');
  else {
    const CASES = [
      ['repo.grep', { pattern: MANY_TOKEN, max_results: 999 }, 'above max'],
      ['repo.grep', { pattern: MANY_TOKEN, max_results: 0 }, 'below min'],
      ['repo.grep', { pattern: 123 }, 'wrong type'],
      ['git.log', { max_count: 0 }, 'below min'],
      ['repo.grep', { pattern: MANY_TOKEN }, 'VALID — must be admitted by both'],
    ];
    const bad = [];
    for (const [cap, args, why] of CASES) {
      const described = attempt(() => describe(cap, args)).ok;
      const executed = attempt(() => runCapability(cap, args, fx.root)).ok;
      t.note(`${cap} ${JSON.stringify(args)} (${why}) · describe=${described ? 'admits' : 'refuses'} · execute=${executed ? 'admits' : 'refuses'}`);
      if (described !== executed) bad.push(`${cap} ${why}`);
    }
    bad.length === 0
      ? t.conform(`admissibility agrees across all ${CASES.length} cases`)
      : t.breach(`described an invocation execution would refuse: ${bad.join(', ')}`);
  }
}

// ── 4e · R1d · D3 NUMERIC DOMAIN ───────────────────────────────────────────────────────
// D3 ratified `CALLER RANGE integer 1…200`. A bound check alone admits values the domain
// excludes, and JavaScript then silently coerces them at the slice — so the RECORD and the
// ACT disagree again: caller_terms and effective_terms say 1.5 while execution behaves as 1,
// and NaN becomes an effective bound of 0 while serializing as null.
// ⛔ Not input hygiene: it is the D4 correspondence law failing on a numeric domain.
{
  const t = B('D3-numeric', 'max_results is an INTEGER in 1…200 — both seams admit exactly the ratified domain');
  const describe = reg.describeInvocation;
  const CASES = [
    [1, true, 'lower bound'], [200, true, 'upper bound'],
    [1.5, false, 'fractional — coerced by slice() to 1'],
    [Number.NaN, false, 'NaN — coerced by slice() to 0, serializes as null'],
  ];
  const bad = [];
  for (const [value, shouldAdmit, why] of CASES) {
    const described = typeof describe === 'function' && attempt(() => describe('repo.grep', { pattern: MANY_TOKEN, max_results: value })).ok;
    const executed = attempt(() => runCapability('repo.grep', { pattern: MANY_TOKEN, max_results: value }, fx.root)).ok;
    t.note(`max_results=${String(value).padEnd(4)} (${why}) · describe=${described ? 'admits' : 'refuses'} · execute=${executed ? 'admits' : 'refuses'} · required=${shouldAdmit ? 'admit' : 'refuse'}`);
    if (described !== shouldAdmit || executed !== shouldAdmit) bad.push(`${value}`);
  }
  bad.length === 0
    ? t.conform('both seams admit exactly the ratified integer domain')
    : t.breach(`the ratified domain is not enforced for: ${bad.join(', ')}`);

  // The Desktop boundary claims to mirror the registry; it may not admit what the
  // authoritative boundary refuses.
  const man = CF.buildManifest(CAPABILITIES);
  const st = CF.validateSubmission({ manifest: man, capabilityName: 'repo.grep', mode: 'structured', rawValues: { pattern: MANY_TOKEN, max_results: '1.5' } });
  const adv = CF.validateSubmission({ manifest: man, capabilityName: 'repo.grep', mode: 'advanced', advancedText: '{"pattern":"' + MANY_TOKEN + '","max_results":1.5}' });
  !st.ok ? t.conform('structured submission refuses a fractional max_results')
         : t.breach('structured submission ADMITS 1.5 — a local validator admitting what the authoritative boundary refuses');
  !adv.ok ? t.conform('advanced submission refuses a fractional max_results')
          : t.breach('advanced submission ADMITS 1.5');
}

// ── 5 · F-D ARM 2 · valid absence ───────────────────────────────────────────────────────
{
  const t = B('F-D', 'ARM 2 · a valid search finding nothing SUCCEEDS with zero records',);
  const r = attempt(() => runCapability('repo.locate_symbol', { symbol: 'ZZ_DEFINITELY_ABSENT_SYMBOL' }, fx.root));
  if (!r.ok) t.breach(`ordinary absence THREW — absence collapsed into failure`);
  else records(r.value).length === 0 ? t.conform('absence returned success with zero records')
                                     : t.breach(`expected zero records, got ${records(r.value).length}`);
}

// ── 6 · F-D.5 ARM 3 · genuine failure ───────────────────────────────────────────────────
{
  const t = B('F-D.5', 'ARM 3 · a GENUINE execution failure propagates and is NEVER normalized to zero',);
  t.note('invoked against a directory that is not a git repository');
  const r = attempt(() => runCapability('repo.locate_symbol', { symbol: MANY_TOKEN }, nonRepo.root));
  r.ok ? t.breach(`a non-repository returned success (${records(r.value).length} records) — a broad catch swallowed a real failure`)
       : t.conform('genuine failure propagated');
}

// ── 7 · D3 — global bound + prefix law ──────────────────────────────────────────────────
{
  const t = B('D3', 'max_results is a GLOBAL bound; results(N) is a prefix of results(M) for N<M',);
  const one = attempt(() => runCapability('repo.grep', { pattern: MANY_TOKEN, max_results: 1 }, fx.root));
  const three = attempt(() => runCapability('repo.grep', { pattern: MANY_TOKEN, max_results: 3 }, fx.root));
  if (!one.ok || !three.ok) t.breach('repo.grep threw while bounded');
  else {
    const r1 = records(one.value), r3 = records(three.value);
    t.note(`max_results=1 → ${r1.length} · =3 → ${r3.length} · fixture holds ${MANY_COUNT} matching lines`);
    const bounded = r1.length <= 1 && r3.length <= 3;
    const prefix = r1.every((l, i) => l === r3[i]);
    bounded && prefix ? t.conform('bound honoured globally; smaller result is a prefix of the larger')
                      : t.breach(bounded ? 'bounded, but not a prefix' : `the bound was ignored (1→${r1.length}, 3→${r3.length})`);
  }
}

// ── 8 · D3/D4 — authorship of 200 survives identical effective output ───────────────────
{
  const t = B('D3/D4', 'omitted → host 200 · explicit 200 → caller 200 · identical execution does not collapse identity',);
  const describe = reg.describeInvocation;
  if (typeof describe !== 'function') t.breach('no observation seam: identical output cannot be distinguished from identical authorship');
  else {
    const om = describe('repo.grep', { pattern: MANY_TOKEN });
    const ex = describe('repo.grep', { pattern: MANY_TOKEN, max_results: 200 });
    const okOm = om?.caller_terms?.max_results === undefined && om?.host_terms?.max_results?.value === 200
      && om?.host_terms?.max_results?.source === 'host_default' && om?.effective_terms?.max_results === 200;
    const okEx = ex?.caller_terms?.max_results === 200 && ex?.host_terms?.max_results === undefined
      && ex?.effective_terms?.max_results === 200;
    (okOm && okEx) ? t.conform('the two invocations remain distinguishable by authorship while effective terms agree')
                   : t.breach('authorship of 200 is not distinguishable between omission and explicit supply');
  }
}

// ── 9 · D2.6 — `format` REFUSED at admission, and NOT SOLICITED at all ──────────────────
{
  const t = B('D2.6', 'git.log { format } is refused at every admission layer AND is not solicited by the form',);
  const r = attempt(() => runCapability('git.log', { format: '%H' }, fx.root));
  r.ok ? t.breach(`runCapability ACCEPTED an unauthorized format (${records(r.value).length} records)`)
       : t.conform('runCapability refused');

  const man = CF.buildManifest(CAPABILITIES);
  const entry = man.find(e => e.name === 'git.log');
  // ⭐ ENFORCED, not noted. A repair could leave the manifest visibly soliciting `format` and
  //    special-case refusal later — that is D2-F2, and the accept-then-erase shape D2.6 closes.
  const solicits = !!entry?.args?.some(a => a.name === 'format');
  solicits ? t.breach('the Desktop manifest still SOLICITS a format field (D2-F2)')
           : t.conform('the manifest does not solicit format');

  const structured = CF.validateSubmission({ manifest: man, capabilityName: 'git.log', mode: 'structured', rawValues: { format: '%H' } });
  structured.ok ? t.breach('structured submission ACCEPTED format — silently discarding stale or malicious structured input reproduces accept-and-erase')
                : t.conform('structured submission refused format');

  // ⚠️ The R1 instrument passed `rawJson`; validateSubmission reads `advancedText`, so it was
  //    submitting BLANK advanced input and reporting RED for the wrong reason. Corrected.
  const advanced = CF.validateSubmission({ manifest: man, capabilityName: 'git.log', mode: 'advanced', advancedText: '{"format":"%H"}' });
  advanced.ok ? t.breach('advanced submission ACCEPTED format')
              : t.conform('advanced submission refused format');
}

// ── 10 · D2.3 — the existing observable git.log output is PINNED (read-only) ────────────
{
  const t = B('D2.3', 'removing `format` may not redesign git.log output: fields, order, dates, quoting, record order',);
  const pin = JSON.parse(fs.readFileSync(PIN_GITLOG, 'utf8'));
  const r = attempt(() => runCapability('git.log', pin.args, fx.root));
  if (!r.ok) t.breach(`git.log threw: ${String(r.error.message).split('\n')[0]}`);
  else (pin.stdout === r.value.stdout && pin.exit_code === r.value.exit_code)
    ? t.conform('observable output byte-identical to the sealed pin')
    : t.breach('observable git.log output CHANGED against the sealed pin');
}

// ── 11 · H1 effective behaviour — unchanged for all eight defaults ──────────────────────
{
  const t = B('H1-effective', 'adding authorship truth alters no current effective result, across all eight defaults',);
  const bad = [];
  for (const [cap, a, b] of PAIRS) {
    const ra = attempt(() => runCapability(cap, a, fx.root)), rb = attempt(() => runCapability(cap, b, fx.root));
    if (ra.ok !== rb.ok || (ra.ok && ra.value.stdout !== rb.value.stdout)) bad.push(cap);
  }
  bad.length === 0 ? t.conform(`effective equivalence preserved across ${PAIRS.length} pairs covering all ${H1_DEFAULTS.length} defaults`)
                   : t.breach(`effective result diverged for: ${bad.join(', ')}`);
}

// ── 12 · out-of-scope boundaries — UNCHANGED, not merely still named the same ───────────
{
  const t = B('check.run', 'check.run is OUT OF SCOPE: its declaration AND handler are unchanged',);
  const pin = JSON.parse(fs.readFileSync(PIN_SCOPE, 'utf8'));
  // ⛔ Deliberately NOT executed: running it would itself cross the delegated-execution boundary.
  //    Out of jurisdiction means UNCHANGED, so the shape is source-pinned. This is the one place
  //    source pinning is the right instrument rather than a behavioural one.
  const spec = CAPABILITIES['check.run'];
  const argsDigest = sha(JSON.stringify(spec?.args ?? null));
  const handlerDigest = sha(String(spec?.handler ?? ''));
  t.note(`args ${argsDigest} · handler ${handlerDigest}`);
  (argsDigest === pin['check.run'].args && handlerDigest === pin['check.run'].handler)
    ? t.conform('check.run declaration and handler byte-identical to the sealed pin')
    : t.breach('check.run CHANGED — R1 crossed a boundary it was told to stay out of');
}
{
  const t = B('verify.*', 'unrelated verify.* behaviour is untouched',);
  const pin = JSON.parse(fs.readFileSync(PIN_SCOPE, 'utf8'));
  const drift = ['verify.file_exists', 'verify.sha256', 'verify.count_matches']
    .filter(n => sha(String(CAPABILITIES[n]?.handler ?? '')) !== pin[n].handler);
  const fileOk = attempt(() => runCapability('verify.file_exists', { path: 'many.txt' }, fx.root));
  const cnt = attempt(() => runCapability('verify.count_matches', { pattern: MANY_TOKEN, file: 'many.txt' }, fx.root));
  const counted = cnt.ok && new RegExp(`(^|\\D)${MANY_COUNT}(\\D|$)`).test(cnt.value.stdout || '');
  (drift.length === 0 && fileOk.ok && counted)
    ? t.conform(`three verify.* handlers source-pinned and behaving (count=${MANY_COUNT})`)
    : t.breach(drift.length ? `handler source changed: ${drift.join(', ')}` : 'verify.* behaviour changed');
}

} finally { fx.cleanup(); nonRepo.cleanup(); }

// ── report ──────────────────────────────────────────────────────────────────────────────
const pad = (s, n) => String(s).padEnd(n);
console.log(`JOP-04 · R1b ACCEPTANCE INSTRUMENT — phase: ${PHASE.toUpperCase()}`);
console.log(`target: ${PHASE === 'pre' ? '8 RED · 5 GREEN (the unrepaired custody state)' : 'ALL 13 BOUNDARIES GREEN (the acceptance state)'}`);
console.log(`subject: ${execFileSync('git', ['rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).trim()}   fixture: hermetic, deterministic   custody: read-only\n`);
for (const r of results) {
  const match = r.actual === r.predeclared;
  console.log(`${match ? '  ' : '⚠️'} ${pad(r.id, 14)} predeclared ${pad(r.predeclared, 6)} actual ${pad(r.actual ?? '—', 6)} ${match ? '' : '← MISMATCH'}`);
  console.log(`   ${r.law}`);
  for (const d of r.detail) console.log(`     ${d}`);
}
const mismatches = results.filter(r => r.actual !== r.predeclared);
// Guard: every declared boundary must actually have run.
const ran = new Set(results.map(r => r.id));
const missing = BOUNDARY_IDS.filter(id => !ran.has(id));
if (missing.length) { console.error(`⛔ INSTRUMENT ERROR: declared boundaries never ran: ${missing.join(', ')}`); process.exit(2); }
console.log(`\n---- ${results.filter(r => r.actual === 'RED').length} RED · ${results.filter(r => r.actual === 'GREEN').length} GREEN · ${mismatches.length} mismatch(es) against the ${PHASE.toUpperCase()} target ----`);
if (mismatches.length && PHASE === 'pre') {
  console.log('⚠️  In PRE phase a mismatch is a finding about the INSTRUMENT or the SPEC, never a licence to change the product:');
  console.log('    protected invariant RED → the instrument widened its jurisdiction; fix the instrument');
  console.log('    known defect GREEN      → the witness cannot judge that repair; strengthen the instrument');
}
if (mismatches.length && PHASE === 'post') {
  console.log('⚠️  In POST phase a mismatch is an UNDISCHARGED REPAIR OBLIGATION — the named boundaries are');
  console.log('    not yet conforming. Fix the product, never the judge; the instrument is frozen custody.');
}
const ji = process.argv.indexOf('--json');
if (ji > -1) {
  const dest = process.argv[ji + 1];
  if (!dest || path.resolve(dest).startsWith(HERE)) {
    console.error('⛔ --json requires an EXTERNAL destination. The judge never writes into its own sealed directory.');
    process.exit(2);
  }
  fs.writeFileSync(dest, JSON.stringify(results, null, 2) + '\n');
}
process.exit(mismatches.length === 0 ? 0 : 1);
