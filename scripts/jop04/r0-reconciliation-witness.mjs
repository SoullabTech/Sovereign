#!/usr/bin/env node
// JOP-04 · R0 witness — the canonical-invocation identity design is reconciled to D4.
//
// READ-ONLY. Record-only: proves what the DESIGN RECORD says, and that NO PRODUCT CODE changed.
//
// ⭐ SECTION-SCOPED AND MEMBERSHIP-BASED, never a tree-wide zero grep. Five prior
//    self-contamination incidents in this programme established why: an instrument that scans prose
//    for a token it must also name will find itself, and a global-zero assertion cannot survive its
//    own documentation. Every check below asks "does THIS PASSAGE say X", never "does the tree
//    contain no X".
//
// Usage: node scripts/jop04/r0-reconciliation-witness.mjs [root]

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = process.argv[2] || execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();
const DESIGN = 'docs/programme/JOP-04_RB-6B-CI_CANONICAL_INVOCATION_IDENTITY_DESIGN_2026-09-14.md';
const SEMANTIC_SUBJECT = '2d3a399043d7ef36984bd56b9de8448f79e9af29';
const PRODUCT_PATHS = ['scripts/builder/', 'jarvis-desktop/', 'lib/', 'app/', 'components/', 'middleware.ts'];

let pass = 0, fail = 0;
const ok  = (m) => { pass++; console.log(`  PASS  ${m}`); };
const bad = (m) => { fail++; console.log(`  FAIL  ${m}`); };
const g   = (...a) => execFileSync('git', ['-C', ROOT, ...a], { encoding: 'utf8' });

const doc = fs.readFileSync(path.join(ROOT, DESIGN), 'utf8');
const lines = doc.split('\n');

/** Text of one markdown section, by heading substring, up to the next heading of the same depth. */
function section(headingFragment) {
  const i = lines.findIndex((l) => /^#{2,3} /.test(l) && l.includes(headingFragment));
  if (i < 0) return null;
  const depth = lines[i].match(/^#+/)[0].length;
  let j = i + 1;
  while (j < lines.length && !(new RegExp(`^#{1,${depth}} `).test(lines[j]))) j++;
  return lines.slice(i, j).join('\n');
}

/** A claim is ACTIVE if it appears outside strike-through and outside a superseded block. */
function activeClaim(text, claim) {
  if (!text.includes(claim)) return false;
  const idx = text.indexOf(claim);
  const before = text.slice(Math.max(0, idx - 400), idx);
  const struck = /~~[^~]*$/.test(before);
  const superseded = /SUPERSEDED|R0 · RECONCILED/.test(before.slice(-400));
  return !struck && !superseded;
}

console.log('JOP-04 R0 · reconciliation witness (record-only)');
console.log(`root: ${ROOT}   HEAD: ${g('rev-parse', '--short', 'HEAD').trim()}`);
console.log(`design: ${DESIGN}\n`);

// ── 1 · the ACTIVE H1 law -------------------------------------------------------------
console.log('1 · the ACTIVE H1 law says UNRECORDED HOST CONTRIBUTION, not caller default');
const h1 = section('H1 · Defaults are applied INSIDE handlers');
if (!h1) bad('§4 H1 section not found — the witness cannot address its subject');
else {
  const saysDifferent = /DIFFERENT canonical invocations/.test(h1);
  const saysHostDefault = /source = host_default/.test(h1);
  const saysUnrecorded = /unrecorded host contribution/i.test(h1);
  const oldStillActive = activeClaim(h1, 'two different REQUESTS  ·  one ACT');
  console.log(`      different-invocations=${saysDifferent}  host_default recorded=${saysHostDefault}  unrecorded-host-contribution=${saysUnrecorded}  pre-D4 claim still active=${oldStillActive}`);
  (saysDifferent && saysHostDefault && saysUnrecorded)
    ? ok('the section states the D4 shape: absence preserved, host default recorded separately')
    : bad('the section does not state the D4 shape');
  !oldStillActive
    ? ok('the pre-D4 "one ACT" claim is struck/superseded, and retained rather than erased')
    : bad('the pre-D4 "one ACT" claim is still an ACTIVE claim');
  /~~/.test(h1) ? ok('history preserved in place (strike-through present)') : bad('history was erased, not superseded');
}
console.log();

// ── 2 · the two stale equivalence-corpus pairs ----------------------------------------
console.log('2 · the two stale equivalence pairs are visibly SUPERSEDED');
const corpusLines = lines.filter((l) => /vs\s+(git\.rev_parse|repo\.grep)/.test(l) || /repo\.grep \{ max_results: 200 \}/.test(l));
const pairs = [
  { name: "git.rev_parse {} vs { ref:'HEAD' }", re: /git\.rev_parse \{\}\s+vs/ },
  { name: 'repo.grep { max_results: 200 } vs {}', re: /repo\.grep \{ max_results: 200 \}\s+vs/ },
];
for (const p of pairs) {
  const line = corpusLines.find((l) => p.re.test(l));
  if (!line) { bad(`${p.name} — corpus row not found`); continue; }
  const i = lines.indexOf(line);
  const ctx = lines.slice(i, i + 5).join('\n');
  const superseded = /SUPERSEDED BY D4/.test(ctx);
  const stillSame = /→ SAME act/.test(ctx);
  (superseded && !stillSame)
    ? ok(`${p.name} → marked SUPERSEDED BY D4; no active "SAME act" verdict`)
    : bad(`${p.name} → superseded=${superseded} stillSameAct=${stillSame}`);
}
console.log();

// ── 3 · the ACTIVE canonicalization language --------------------------------------------
console.log('3 · the ACTIVE canonicalization language does NOT fold host defaults into caller terms');
const repair = section('9 ·') || doc;
const foldActive = activeClaim(repair, 'canonicalize before dispatch and let the');
const ratified = /canonicalize ONLY what the caller supplied/.test(doc)
              && /SEPARATELY-AUTHORED execution plan/.test(doc);
const innerRep = /MAY NOT be the sole identity bound by authority/.test(doc);
console.log(`      pre-D4 "canonicalize before dispatch" still active=${foldActive}  ratified shape present=${ratified}  inner-representation caveat=${innerRep}`);
!foldActive ? ok('the pre-D4 fold-defaults repair shape is no longer an active recommendation')
            : bad('the pre-D4 fold-defaults repair shape is STILL ACTIVE');
ratified ? ok('the ratified shape is stated: canonicalize only caller-supplied; resolve omissions into a separate execution plan')
         : bad('the ratified shape is not stated');
innerRep ? ok('the inner-representation caveat is recorded: a shared effective operation may not be the sole bound identity')
         : bad('the inner-representation caveat is missing');
console.log();

// ── 4 · NO PRODUCT CODE CHANGED since the semantic subject -------------------------------
console.log('4 · no product code changed since the semantic subject');
let changed;
try {
  changed = g('diff', '--name-only', `${SEMANTIC_SUBJECT}`, 'HEAD').split('\n').filter(Boolean);
} catch { changed = null; }
if (changed === null) bad(`semantic subject ${SEMANTIC_SUBJECT.slice(0, 9)} not reachable — custody UNVERIFIED`);
else {
  const product = changed.filter((f) => PRODUCT_PATHS.some((p) => f.startsWith(p)));
  console.log(`      files changed since ${SEMANTIC_SUBJECT.slice(0, 9)}: ${changed.length}`);
  for (const f of changed) console.log(`        ${f}`);
  product.length === 0
    ? ok('zero product-code files touched (scripts/builder · jarvis-desktop · lib · app · components · middleware)')
    : bad(`PRODUCT CODE TOUCHED: ${product.join(', ')}`);
}
console.log();

console.log(`---- ${pass} passed · ${fail} failed ----`);
process.exit(fail === 0 ? 0 : 1);
