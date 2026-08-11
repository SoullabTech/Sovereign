#!/usr/bin/env node
// Desktop C1 evidence-containment proof.
//
// Two things are being proven, and they are different:
//   1. Desktop C1 reuses the CANONICAL materializer + verifier, and its
//      correctness mapping never lets execution success imply truth.
//   2. Reaching that verifier does NOT cross into the delegate execution
//      surface that shares its module. This is proved by a tripwire, not
//      asserted — jarvis-runtime-pipeline.mjs also houses executeRun(), which
//      spawns scripts/ain-delegate.sh, and dormancy claimed without a tripwire
//      is exactly the "occupied edge" failure this project already recorded.

import assert from 'node:assert/strict';
import path from 'node:path';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DESKTOP = path.resolve(HERE, '..');
const REPO_ROOT = path.resolve(DESKTOP, '..');

// ── DELEGATE TRIPWIRE — installed BEFORE the canonical modules are linked ────
// Patching the CJS module object before the dynamic import means the ESM named
// bindings in jarvis-runtime-pipeline.mjs link to these functions, not the real
// ones. Any attempt to spawn the delegate therefore fails loudly, here.
const require = createRequire(import.meta.url);
const cp = require('node:child_process');
const TRIPPED = [];

const realExecFileSync = cp.execFileSync;
for (const m of ['spawn', 'spawnSync', 'exec', 'execSync', 'fork', 'execFile']) {
  cp[m] = (...a) => {
    TRIPPED.push(`${m}(${String(a[0])})`);
    throw new Error(`DELEGATE_TRIPWIRE: Desktop C1 must never call ${m} — attempted ${String(a[0])}`);
  };
}
// execFileSync is NOT blanket-banned: jarvis-context.mjs's headOf() shells out
// to `git rev-parse` for fragment provenance, which is legitimate and read-only.
// Only the delegate boundary itself is fatal.
cp.execFileSync = (file, args, opts) => {
  const joined = `${file} ${(args || []).join(' ')}`;
  if (/ain-delegate|jarvis-runtime\.mjs|session\.mjs/.test(joined)) {
    TRIPPED.push(`execFileSync(${joined})`);
    throw new Error(`DELEGATE_TRIPWIRE: Desktop C1 must never invoke ${joined}`);
  }
  return realExecFileSync(file, args, opts);
};

// ── canonical substrate, imported exactly as main.js imports it ──────────────
const { materializePacket, renderFragments } = await import(
  `file://${path.join(REPO_ROOT, 'scripts', 'builder', 'jarvis-context.mjs')}`);
const { verifyEvidence } = await import(
  `file://${path.join(REPO_ROOT, 'scripts', 'builder', 'jarvis-runtime-pipeline.mjs')}`);
const { decideCorrectness } = require(path.join(DESKTOP, 'src', 'correctness.js'));

let pass = 0, fail = 0;
const t = (name, fn) => {
  try { fn(); console.log(`  ✓ ${name}`); pass++; }
  catch (e) { console.log(`  ✗ ${name}\n      ${e.message}`); fail++; }
};

// Real evidence: a bounded line range of a file that genuinely exists.
const SELECTORS = [{
  ref: 'scripts/builder/router.mjs',
  why: 'bounded evidence for the proof',
  selector: { type: 'lines', start: 30, end: 60 },
}];
const fragments = materializePacket({ context_selectors: SELECTORS }, REPO_ROOT);

console.log('\nCANONICAL SUBSTRATE');
t('materializePacket produced real fragments', () => {
  assert.equal(fragments.length, 1);
  assert.equal(fragments[0].source_file, 'scripts/builder/router.mjs');
  assert.ok(fragments[0].content.length > 0);
});
t('renderFragments is available for prompt construction', () => {
  assert.ok(renderFragments(fragments).includes('router.mjs'));
});

const decide = (answer) => decideCorrectness({
  materialization_error: null,
  fragmentCount: fragments.length,
  evidence: verifyEvidence(answer, fragments),
});

console.log('\nACCEPTANCE');

// A — the exact fabrication from the founder walk
t('A. fabricated citation does NOT become correctness PASS', () => {
  const d = decide('The capability is EnumerateApiRoutes, registered at '
    + 'desktop_alpha/modules/api_enumeration/register_capabilities.py:42');
  assert.notEqual(d.correctness, 'verified');
  assert.equal(d.correctness, 'failed');
  assert.match(d.correctness_reason, /EVIDENCE_INSUFFICIENT/);
});

// B — a real citation that resolves inside the materialized evidence
t('B. real in-context citation resolves and verifies', () => {
  const d = decide('The routing law is stated at scripts/builder/router.mjs:42');
  assert.equal(d.correctness, 'verified', d.correctness_reason);
  assert.match(d.correctness_reason, /citations contained in materialized evidence/);
});

// C — real file on disk, but never materialized for this task
t('C. out-of-context but real filesystem citation FAILS', () => {
  const d = decide('See scripts/builder/deterministic.mjs:5 for the registry.');
  assert.equal(d.correctness, 'failed');
  assert.match(d.correctness_reason, /outside the materialized evidence/);
});

// D — citations required, none supplied
t('D. no citations when required does NOT become VERIFIED', () => {
  const d = decide('The routing law prefers deterministic capabilities.');
  assert.notEqual(d.correctness, 'verified');
  assert.match(d.correctness_reason, /no citable file:line evidence/);
});

t('D2. no evidence context at all yields UNVERIFIED, never VERIFIED', () => {
  const d = decideCorrectness({ materialization_error: null, fragmentCount: 0, evidence: null });
  assert.equal(d.correctness, 'unverified');
  assert.match(d.correctness_reason, /NO_EVIDENCE_CONTEXT/);
});

t('D3. failed materialization fails closed, never silently passes', () => {
  const d = decideCorrectness({ materialization_error: 'file not found: nope.mjs', fragmentCount: 0, evidence: null });
  assert.equal(d.correctness, 'failed');
  assert.match(d.correctness_reason, /CONTEXT_MATERIALIZATION_FAILED/);
});

// E — the honesty split survives: execution PASS alongside correctness FAIL
t('E. execution PASS and correctness FAIL are reported as separate facts', () => {
  const execution = { kind: 'execution', label: 'Execution verified', pass: true };
  const d = decide('It is at desktop_alpha/modules/api_enumeration/register_capabilities.py:42');
  assert.equal(execution.pass, true, 'execution fact must remain PASS');
  assert.equal(d.correctness, 'failed', 'correctness must be independent of execution');
  assert.notEqual(execution.pass, d.correctness === 'verified');
});

// F — a valid grounded answer earns VERIFIED
t('F. valid grounded answer yields Execution PASS + correctness VERIFIED', () => {
  const execution = { pass: true };
  const d = decide('COST_CLASS is defined at scripts/builder/router.mjs:33 and the '
    + 'C1 bound at scripts/builder/router.mjs:42.');
  assert.equal(execution.pass, true);
  assert.equal(d.correctness, 'verified', d.correctness_reason);
});

// ── G/H/I — scope guards, read from the shipped source ──────────────────────
const mainSrc = readFileSync(path.join(DESKTOP, 'src', 'main.js'), 'utf8');
const c1Block = mainSrc.slice(mainSrc.indexOf("execution_lane === 'C1'"), mainSrc.indexOf("execution_lane === 'C3'"));

console.log('\nSCOPE GUARDS');
t('G. C0 lane unchanged — still kind:\'result\', unchanged check', () => {
  assert.ok(mainSrc.includes("kind: 'result'"));
  assert.ok(mainSrc.includes('capability registered + exit_code present'));
});
t("H. C3 lane unchanged — routed, never auto-invoked", () => {
  assert.ok(mainSrc.includes("response.status = 'routed_not_executed'"));
  assert.ok(mainSrc.includes('does not auto-invoke Claude'));
});
t('I. C1 block introduces no repository mutation', () => {
  assert.doesNotMatch(c1Block, /writeFileSync|mkdirSync|unlinkSync|rmSync|appendFileSync|git (add|commit)/);
});
t('C1 block calls ONLY the two canonical functions', () => {
  assert.ok(c1Block.includes('materializePacket'), 'must materialize canonically');
  assert.ok(c1Block.includes('verifyEvidence'), 'must verify canonically');
  // Assert on CODE, not prose: the block's own comments name executeRun() and
  // ain-delegate.sh precisely to document that they are not called, and a
  // regex over raw text cannot tell an invocation from an explanation.
  const code = c1Block.split('\n').filter((l) => !l.trim().startsWith('//')).join('\n');
  assert.doesNotMatch(code, /executeRun|ain-delegate|spawnDelegate|createRun|\/runs/);
});
t('C1 does not reimplement the verifier locally', () => {
  const local = readFileSync(path.join(DESKTOP, 'src', 'correctness.js'), 'utf8');
  assert.doesNotMatch(local, /CITATION_RE|matchAll|in_context\s*[:=]/,
    'Desktop must map the canonical result, never recompute containment');
});

// ── the negative proof ──────────────────────────────────────────────────────
console.log('\nDELEGATE DORMANCY (negative proof)');
t('delegate boundary was never crossed during import + materialize + verify', () => {
  assert.deepEqual(TRIPPED, [], `tripwire fired: ${TRIPPED.join('; ')}`);
});
t('tripwire is live (it fires when the delegate IS invoked)', () => {
  assert.throws(() => cp.spawn('bash', ['scripts/ain-delegate.sh', 'local-native', 'x']),
    /DELEGATE_TRIPWIRE/);
  assert.throws(() => cp.execFileSync('bash', ['scripts/ain-delegate.sh']), /DELEGATE_TRIPWIRE/);
  TRIPPED.length = 0; // deliberate trips from this self-test
});

console.log(`\n${pass} passed · ${fail} failed\n`);
process.exit(fail === 0 ? 0 : 1);
