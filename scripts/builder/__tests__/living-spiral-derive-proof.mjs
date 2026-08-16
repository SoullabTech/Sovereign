#!/usr/bin/env node
/**
 * PROOF — Living Spiral Slice 1 performed-derivation harness
 *
 * Acceptance criteria 1-6 of
 * docs/architecture/JARVIS_LIVING_SPIRAL_BOUNDED_IMPLEMENTATION_PROPOSAL_2026-08-16.md
 *
 * Each test is written so that a plausible WRONG implementation fails it,
 * rather than passing quietly. Criterion 3 is load-bearing: if the decoy
 * subject derives CONGRUENT, Slice 1 has failed and the fixture must NOT be
 * reinterpreted to save the implementation.
 *
 * Run:  node scripts/builder/__tests__/living-spiral-derive-proof.mjs
 * Exit: 0 all pass · 1 any failure
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../../..');
const HARNESS = path.join(REPO, 'scripts/builder/living-spiral-derive.mjs');

let failures = 0;
const results = [];

function check(name, fn) {
  try {
    const detail = fn();
    results.push(`  PASS  ${name}${detail ? ` — ${detail}` : ''}`);
  } catch (err) {
    failures++;
    results.push(`  FAIL  ${name}\n          ${err.message}`);
  }
}

function must(cond, msg) {
  if (!cond) throw new Error(msg);
}

/** Run the harness with a clean environment. Never pipe — the pipeline's exit status is not the command's. */
function runHarness(args = [], opts = {}) {
  const env = { ...process.env, ...(opts.env ?? {}) };
  delete env.JARVIS_REPO_ROOT;
  if (opts.env?.JARVIS_REPO_ROOT) env.JARVIS_REPO_ROOT = opts.env.JARVIS_REPO_ROOT;

  const r = spawnSync(process.execPath, [HARNESS, ...args], {
    cwd: opts.cwd ?? REPO,
    env,
    encoding: 'utf8',
  });
  return { status: r.status, stdout: r.stdout ?? '', stderr: r.stderr ?? '' };
}

function runJson(args = [], opts = {}) {
  const r = runHarness([...args, '--json'], opts);
  let parsed = null;
  try {
    parsed = JSON.parse(r.stdout);
  } catch {
    throw new Error(`stdout was not JSON. status=${r.status} stderr=${r.stderr.slice(0, 300)}`);
  }
  return { ...r, json: parsed };
}

/** A decoy that satisfies every structural marker and is a DIFFERENT repository. */
function makeDecoy() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ls-decoy-'));
  const g = (...a) => execFileSync('git', ['-C', dir, ...a], { stdio: 'ignore' });

  fs.mkdirSync(path.join(dir, 'scripts/builder'), { recursive: true });
  fs.mkdirSync(path.join(dir, 'docs/ops'), { recursive: true });
  fs.mkdirSync(path.join(dir, 'lib/http'), { recursive: true });
  fs.mkdirSync(path.join(dir, 'lib/auth'), { recursive: true });
  fs.mkdirSync(path.join(dir, 'lib/maia/context'), { recursive: true });
  fs.mkdirSync(path.join(dir, 'lib/sovereign'), { recursive: true });
  fs.mkdirSync(path.join(dir, 'app/api/astrology/reading'), { recursive: true });

  // Structural markers, all present, all well-formed.
  fs.writeFileSync(path.join(dir, 'package.json'), '{"name":"spiralogic-oracle-system"}');
  fs.writeFileSync(path.join(dir, 'CLAUDE.md'), '# MAIA-SOVEREIGN\n');
  // And — critically — content that would derive CONGRUENT if the harness
  // trusted structure over identity: a middleware with NO raw-header grant.
  fs.writeFileSync(path.join(dir, 'middleware.ts'), 'const memberIdHeader = req.headers.get("x-member-id");\nif (memberIdHeader) { await verify(memberIdHeader); }\n');
  fs.writeFileSync(path.join(dir, 'lib/http/apiBase.ts'), "const directId = localStorage.getItem('memberId');\n");
  fs.writeFileSync(path.join(dir, 'lib/auth/getMemberFromRequest.ts'), 'export async function getMemberIdFromRequest(r) { return null; }\n');
  fs.writeFileSync(path.join(dir, 'lib/maia/context/buildMaiaContext.ts'), 'import { getAstrologyContextForUser } from "x";\n');
  fs.writeFileSync(path.join(dir, 'lib/sovereign/maiaService.ts'), 'const astrologyAddendum = m.a;\nconst p = `${astrologyAddendum ? astrologyAddendum : ""}`;\n');
  fs.writeFileSync(path.join(dir, 'app/api/astrology/reading/route.ts'), 'export const GET = () => {};\n');

  g('init', '-q');
  g('config', 'user.email', 'proof@local');
  g('config', 'user.name', 'proof');
  g('add', '-A');
  g('commit', '-q', '-m', 'decoy');
  return dir;
}

// ===========================================================================
// CRITERION 1 — derivation PERFORMED, not specified
// ===========================================================================

check('C1 harness emits assertions for both capabilities', () => {
  const { json, status } = runJson();
  must(status === 0, `expected exit 0, got ${status}`);
  must(json.subject.bound === true, 'subject not bound');
  const caps = json.capabilities.map((c) => c.capability);
  must(caps.includes('maia.identity.congruence'), 'missing identity capability');
  must(caps.includes('astrology.maia_relation'), 'missing astrology capability');
  const n = json.capabilities.reduce((a, c) => a + c.assertions.length, 0);
  must(n >= 6, `expected >=6 assertions, got ${n}`);
  return `${n} assertions, ${caps.length} capabilities`;
});

check('C1 every provenance cites a line that ACTUALLY contains the cited text', () => {
  const { json } = runJson();
  let verified = 0;
  for (const cap of json.capabilities) {
    for (const a of cap.assertions) {
      const m = /line (\d+): (.+?)(?: \||$)/.exec(a.provenance.read);
      if (!m) continue; // aggregate reads (e.g. route counts) have no single line
      const [, lineNo, cited] = m;
      const src = path.join(json.subject.resolvedPath, a.provenance.source);
      must(fs.existsSync(src), `cited source missing: ${a.provenance.source}`);
      const line = fs.readFileSync(src, 'utf8').split('\n')[Number(lineNo) - 1] ?? '';
      must(
        line.includes(cited.trim().split(' -> ')[0].trim()),
        `${a.id}: ${a.provenance.source}:${lineNo} does not contain cited text`,
      );
      verified++;
    }
  }
  must(verified >= 4, `expected >=4 line-verified provenances, got ${verified}`);
  return `${verified} provenances re-read and confirmed against source`;
});

// ===========================================================================
// CRITERION 2 — negative control
// ===========================================================================

check('C2 nonexistent subject refuses, emits zero assertions, never succeeds', () => {
  const { json, status } = runJson(['--subject', '/nonexistent/path/xyz']);
  must(status === 2, `expected exit 2, got ${status}`);
  must(json.subject.bound === false, 'bound a nonexistent subject');
  must(json.capabilities.length === 0, 'emitted capabilities for a nonexistent subject');
  must(json.apertures.length === 0, 'emitted apertures for an unbound subject');
  must(/does not exist/.test(json.subject.refusal), 'refusal did not name the cause');
  return 'exit 2, zero assertions, refusal named';
});

// ===========================================================================
// CRITERION 3 — LOAD-BEARING. Subject Identity Failure, instance #3.
// ===========================================================================

check('C3 decoy repo with ALL structural markers is REFUSED, never CONGRUENT', () => {
  const decoy = makeDecoy();
  try {
    const { json, status } = runJson(['--subject', decoy]);

    // The decoy's content would derive CONGRUENT if structure were trusted.
    must(json.subject.bound === false, 'BOUND a foreign repository that satisfied every structural marker');
    must(status === 2, `expected exit 2, got ${status}`);

    const verdicts = json.capabilities.map((c) => c.congruence?.verdict).filter(Boolean);
    must(!verdicts.includes('CONGRUENT'), 'DERIVED CONGRUENT ON THE WRONG SUBJECT — Slice 1 FAILS');
    must(json.capabilities.length === 0, 'emitted state about the wrong subject');
    must(/DIFFERENT REPOSITORY/.test(json.subject.refusal), 'refusal did not name repository identity');
    return 'refused on root-commit identity, not on structure';
  } finally {
    fs.rmSync(decoy, { recursive: true, force: true });
  }
});

check('C3b ambient JARVIS_REPO_ROOT pointing elsewhere is REFUSED', () => {
  const decoy = makeDecoy();
  try {
    const { json, status } = runJson([], { env: { JARVIS_REPO_ROOT: decoy } });
    must(json.subject.bound === false, 'ambient env silently redirected the subject');
    must(status === 2, `expected exit 2, got ${status}`);
    must(/SUBJECT DIVERGENCE/.test(json.subject.refusal), 'refusal did not name subject divergence');
    return 'ambient redirection refused';
  } finally {
    fs.rmSync(decoy, { recursive: true, force: true });
  }
});

// ===========================================================================
// CRITERION 4 — Astrology separates availability from composition
// ===========================================================================

check('C4 context-carriage and prompt-composition are DISTINCT assertions', () => {
  const { json } = runJson();
  const astro = json.capabilities.find((c) => c.capability === 'astrology.maia_relation');
  const carried = astro.assertions.find((a) => a.id === 'astrology.context.carried');
  const composed = astro.assertions.find((a) => a.id === 'astrology.prompt.composed');
  must(carried && composed, 'the two assertions are not both present');
  must(
    !carried.operational_element.includes('composition'),
    'carriage was classified as composition — availability/composition collapsed',
  );
  must(/NOT.*THE PROMPT|not composition/i.test(carried.doesNotEstablish), 'carriage does not disclaim reaching the prompt');
  must(
    composed.epistemic_status === 'provisional',
    `composition claimed at '${composed.epistemic_status}' on source-only evidence; must be provisional`,
  );
  return 'availability != composition; composition held at provisional';
});

// ===========================================================================
// CRITERION 5 — empty means something
// ===========================================================================

check('C5 every assertion carries presence + observation; §7.1 binding rule holds', () => {
  const { json } = runJson();
  for (const cap of json.capabilities) {
    for (const a of cap.assertions) {
      must(a.presence_value, `${a.id}: no presence_value`);
      must(a.observation_status, `${a.id}: no observation_status`);
      must(
        a.observation_status === 'observed' || a.presence_value === 'unknown',
        `${a.id}: §7.1 violated — presence '${a.presence_value}' under observation '${a.observation_status}'`,
      );
      must(a.establishes && a.doesNotEstablish && a.failingImplementation, `${a.id}: incomplete competence boundary`);
    }
  }
  for (const ap of json.apertures) {
    must(Array.isArray(ap.thereforeNotClaimable) && ap.thereforeNotClaimable.length > 0, `aperture ${ap.domain}: no THEREFORE NOT CLAIMABLE`);
  }
  return `${json.apertures.length} apertures, all with prohibited-claim consequences`;
});

// ===========================================================================
// CRITERION 6 — no forbidden emission
// ===========================================================================

check('C6 no health value, lifecycle value, error class, scalar, or ranking', () => {
  const { json } = runJson();
  const axisPayload = JSON.stringify(
    json.capabilities.map((c) => ({
      congruence: c.congruence?.verdict,
      assertions: c.assertions.map((a) => ({
        operational_element: a.operational_element,
        presence_value: a.presence_value,
        observation_status: a.observation_status,
        temporal_status: a.temporal_status,
        epistemic_status: a.epistemic_status,
      })),
    })),
  );

  const forbidden = [
    'HEALTHY', 'DEGRADED', 'BROKEN', 'LEGACY_DEBT', 'UNWITNESSED', 'DRIFT',
    'CONCEIVED', 'DESIGNED', 'BUILT', 'INTEGRATED', 'DEPLOYED', 'WITNESSED', 'RETIRED',
    'severity', 'score', 'percent', 'ranking', 'priority', 'pulse',
  ];
  for (const f of forbidden) {
    must(!new RegExp(f, 'i').test(axisPayload), `forbidden value '${f}' emitted on a primary axis`);
  }

  // No numeric scalar may be emitted as a judgement on any axis.
  must(!/"(score|index|vitality|rating|confidence)"\s*:/i.test(JSON.stringify(json)), 'a scalar judgement field was emitted');
  return 'primary axes clean of health/lifecycle/scalar vocabulary';
});

check('C6b congruence verdict is one of exactly three admissible values', () => {
  const { json } = runJson();
  const v = json.capabilities.find((c) => c.congruence)?.congruence?.verdict;
  must(['CONGRUENT', 'DIVERGENT', 'CANNOT_ESTABLISH'].includes(v), `inadmissible verdict '${v}'`);
  return v;
});

// ===========================================================================

console.log('\nLIVING SPIRAL — SLICE 1 PROOF\n' + '='.repeat(60));
for (const r of results) console.log(r);
console.log('='.repeat(60));
console.log(failures === 0 ? `${results.length} passed · 0 failed\n` : `${results.length - failures} passed · ${failures} FAILED\n`);
process.exit(failures === 0 ? 0 : 1);
