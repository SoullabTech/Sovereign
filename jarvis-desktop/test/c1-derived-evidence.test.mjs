#!/usr/bin/env node
// C1 derived-evidence proof.
//
// The failure this covers: a C1 task that asked JARVIS to inspect the bound
// repository reached the worker with NO fragments. qwen2.5:7b answered from its
// weights and invented `src/main/java/com/jarvis/signup/ResendEmailCodeService.java`
// — a Java service, in a TypeScript repository, for a route that lives at
// app/api/members/email-code/route.ts. The verifier refused to certify it
// (UNVERIFIED / NO_EVIDENCE_CONTEXT), which was correct. What was missing was
// not judgement but perception: nothing had selected any repository evidence.
//
// Two things are proven here, and they must BOTH hold:
//   1. A repo-inspection prompt now receives real, bounded MAIA-SOVEREIGN code.
//   2. The epistemic guard is untouched — no evidence still never becomes
//      VERIFIED, and a fabricated citation still fails against real fragments.
//
// A test that only proved (1) would be the more dangerous half.

import assert from 'node:assert/strict';
import path from 'node:path';
import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const HERE = path.dirname(fileURLToPath(import.meta.url));
const DESKTOP = path.resolve(HERE, '..');
const REPO_ROOT = path.resolve(DESKTOP, '..');

const { deriveContextSelectors } = await import(
  `file://${path.join(REPO_ROOT, 'scripts', 'builder', 'jarvis-context-derive.mjs')}`);
const { materializePacket, renderFragments } = await import(
  `file://${path.join(REPO_ROOT, 'scripts', 'builder', 'jarvis-context.mjs')}`);
const { verifyEvidence } = await import(
  `file://${path.join(REPO_ROOT, 'scripts', 'builder', 'jarvis-runtime-pipeline.mjs')}`);
const { decideCorrectness } = require(path.join(DESKTOP, 'src', 'correctness.js'));

// Assert on CODE, not prose. These modules document what they must never do by
// naming it — the derive module's header names verifyEvidence precisely to say
// it does not call it — and a regex over raw text cannot tell an invocation from
// an explanation. Same lesson already encoded in c1-evidence-containment.
const codeOnly = (src) => src
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .split('\n')
  .filter((l) => !l.trim().startsWith('//'))
  .join('\n');

let pass = 0, fail = 0;
const t = (name, fn) => {
  try { fn(); console.log(`  ✓ ${name}`); pass++; }
  catch (e) { console.log(`  ✗ ${name}\n      ${e.message}`); fail++; }
};

// The task shape that failed on the founder walk.
const SIGNUP_PROMPT =
  'Inspect the MAIA signup implementation and explain how the beta signup email code is sent and resent.';
// The fabrication it produced, verbatim.
const FABRICATION = 'src/main/java/com/jarvis/signup/ResendEmailCodeService.java';

const gitStatusBefore = execFileSync('git', ['-C', REPO_ROOT, 'status', '--porcelain'], { encoding: 'utf8' });
const selectors = deriveContextSelectors(SIGNUP_PROMPT, REPO_ROOT);

console.log('\nPERCEPTION — the task now receives repository evidence');

t('1. the signup prompt derives selectors at all', () => {
  assert.ok(selectors.length > 0, 'no selectors derived — the worker would be blind again');
});

t('2. every derived ref is a real file on disk (nothing fabricated)', () => {
  for (const s of selectors) {
    assert.ok(existsSync(path.join(REPO_ROOT, s.ref)), `derived a path that does not exist: ${s.ref}`);
  }
});

t('3. the ACTUAL TypeScript email-code route is selected', () => {
  const refs = selectors.map((s) => s.ref);
  assert.ok(refs.includes('app/api/members/email-code/route.ts'),
    `expected the real route in evidence, got:\n      ${refs.join('\n      ')}`);
});

t('4. no Java, and not the fabricated service path', () => {
  for (const s of selectors) {
    assert.doesNotMatch(s.ref, /\.java$/, `derived a Java file: ${s.ref}`);
    assert.notEqual(s.ref, FABRICATION);
  }
});

t('5. every selector is BOUNDED — a line range, never a whole tree', () => {
  for (const s of selectors) {
    assert.equal(s.selector.type, 'lines');
    assert.ok(s.selector.start >= 1);
    assert.ok(s.selector.end >= s.selector.start);
  }
});

const fragments = materializePacket({ context_selectors: selectors }, REPO_ROOT);

t('6. derived selectors materialize through the CANONICAL materializer', () => {
  assert.equal(fragments.length, selectors.length);
  assert.ok(fragments.every((f) => f.content.length > 0));
  assert.ok(renderFragments(fragments).includes('app/api/members/email-code/route.ts'));
});

console.log('\nEPISTEMIC GUARD — unchanged, in both directions');

const decide = (answer, origin = 'derived') => decideCorrectness({
  materialization_error: null,
  fragmentCount: fragments.length,
  evidence: fragments.length ? verifyEvidence(answer, fragments) : null,
  contextOrigin: origin,
});

t('7. a citation inside the derived evidence can reach VERIFIED', () => {
  const f = fragments.find((x) => x.source_file === 'app/api/members/email-code/route.ts');
  const d = decide(`The handler is defined at ${f.source_file}:${f.start_line}`);
  assert.equal(d.correctness, 'verified', d.correctness_reason);
});

t('8. THE fabrication still FAILS against derived evidence', () => {
  const d = decide(`The resend path lives in ${FABRICATION}:42`);
  assert.notEqual(d.correctness, 'verified');
  assert.equal(d.correctness, 'failed');
  assert.match(d.correctness_reason, /EVIDENCE_INSUFFICIENT/);
});

t('9. an uncitable answer never becomes VERIFIED, even with good evidence', () => {
  const d = decide('MAIA sends a six digit code by email.');
  assert.notEqual(d.correctness, 'verified');
});

t('10. a prompt with NO repository purchase yields no evidence, and UNVERIFIED', () => {
  const none = deriveContextSelectors('qqzzxvv wubbleflux', REPO_ROOT);
  assert.equal(none.length, 0, `expected nothing, derived: ${none.map((s) => s.ref).join(', ')}`);
  const d = decideCorrectness({
    materialization_error: null, fragmentCount: 0, evidence: null, contextOrigin: 'derived',
  });
  assert.equal(d.correctness, 'unverified');
  assert.match(d.correctness_reason, /NO_EVIDENCE_CONTEXT/);
});

console.log('\nSCOPE GUARDS');

t('11. derivation is deterministic — same repo + prompt, same selectors', () => {
  const again = deriveContextSelectors(SIGNUP_PROMPT, REPO_ROOT);
  assert.deepEqual(again, selectors);
});

t('12. derivation performs NO repository mutation', () => {
  const src = codeOnly(readFileSync(path.join(REPO_ROOT, 'scripts', 'builder', 'jarvis-context-derive.mjs'), 'utf8'));
  assert.doesNotMatch(src, /writeFileSync|mkdirSync|unlinkSync|rmSync|appendFileSync|rename/);
  // Witness, not just a source scan: the working tree is byte-identical after
  // a real derivation ran against this checkout.
  const after = execFileSync('git', ['-C', REPO_ROOT, 'status', '--porcelain'], { encoding: 'utf8' });
  assert.equal(after, gitStatusBefore, 'derivation changed the working tree');
});

t('13. derivation selects only, and imports no verifier or worker', () => {
  const src = codeOnly(readFileSync(path.join(REPO_ROOT, 'scripts', 'builder', 'jarvis-context-derive.mjs'), 'utf8'));
  assert.doesNotMatch(src, /verifyEvidence|decideCorrectness|ain-delegate|executeRun|11434|fetch\(/);
});

const mainSrc = readFileSync(path.join(DESKTOP, 'src', 'main.js'), 'utf8');
const c1Block = mainSrc.slice(mainSrc.indexOf("execution_lane === 'C1'"), mainSrc.indexOf("execution_lane === 'C3'"));

t('14. a DECLARED packet is never overridden by derivation', () => {
  assert.match(c1Block, /let selectors = declared/);
  assert.match(c1Block, /if \(!declared\.length/);
});

t('15. main.js has no undeclared REPO_ROOT — the defect that made this lane unreachable', () => {
  const code = codeOnly(mainSrc);
  const bare = code
    .replace(/JARVIS_REPO_ROOT/g, '')
    .replace(/REPO_ROOT_MODE/g, '')
    .match(/\bREPO_ROOT\b/g) || [];
  const declared = /(?:const|let|var)\s+REPO_ROOT\s*=/.test(code);
  assert.ok(bare.length === 0 || declared,
    `main.js reads REPO_ROOT ${bare.length}× but never declares it — ReferenceError on the C1 path`);
});

t('16. evidence provenance is reported to the operator', () => {
  assert.match(c1Block, /context_origin/);
});

console.log(`\n${pass} passed · ${fail} failed\n`);
process.exit(fail === 0 ? 0 : 1);
