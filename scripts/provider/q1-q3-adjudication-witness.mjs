#!/usr/bin/env node
// Provider Governance · Q1–Q3 adjudication witness — record-only, read-only.
//
// ⭐ Section-scoped and membership-based, never a tree-wide zero grep (five prior
//    self-contamination incidents in the adjacent lane established why).
//
// Proves only: correct census subject · all three rulings present with their operative
// content · both withdrawals retained · zero provider-policy and zero product-code change.

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = process.argv[2] || execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();
const REC = 'docs/programme/PROVIDER_GOVERNANCE_Q1_Q3_ADJUDICATION_2026-09-14.md';
const CENSUS_SUBJECT = 'ce6b32f09';
const POLICY = 'scripts/provider-policy.json';
const GUARD = 'scripts/check-provider-governance.ts';
const PRODUCT = ['lib/', 'app/', 'components/', 'middleware.ts', 'scripts/builder/', 'jarvis-desktop/'];

let pass = 0, fail = 0;
const ok  = (m) => { pass++; console.log(`  PASS  ${m}`); };
const bad = (m) => { fail++; console.log(`  FAIL  ${m}`); };
const g   = (...a) => execFileSync('git', ['-C', ROOT, ...a], { encoding: 'utf8' });

const doc = fs.readFileSync(path.join(ROOT, REC), 'utf8');
const lines = doc.split('\n');
function section(frag) {
  const i = lines.findIndex((l) => /^#{1,3} /.test(l) && l.includes(frag));
  if (i < 0) return null;
  const d = lines[i].match(/^#+/)[0].length;
  let j = i + 1;
  while (j < lines.length && !(new RegExp(`^#{1,${d}} `).test(lines[j]))) j++;
  return lines.slice(i, j).join('\n');
}

console.log('Provider Governance · Q1–Q3 adjudication witness');
console.log(`root: ${ROOT}   HEAD: ${g('rev-parse', '--short', 'HEAD').trim()}\n`);

console.log('0 · census subject is correct and reachable');
try {
  const subj = g('rev-parse', '--short', CENSUS_SUBJECT).trim();
  const msg = g('show', '-s', '--format=%s', CENSUS_SUBJECT).trim();
  console.log(`      ${subj}  ${msg}`);
  (doc.includes(CENSUS_SUBJECT) && /debt reachability census/i.test(msg))
    ? ok('the record names the census commit, and that commit IS the census')
    : bad('subject SHA does not match the census commit');
} catch { bad(`${CENSUS_SUBJECT} not reachable`); }
console.log();

console.log('1 · Q1 — policy authors the class; environment affects activation only');
const q1 = section('Q1 —');
if (!q1) bad('Q1 section missing'); else {
  const checks = [
    [/Provider policy authors the class/i, 'states policy authors the class'],
    [/OpenAI remains lab-tier whether or not/i, 'states lab tier is unchanged by credential presence'],
    [/UNOBSERVED\s+whether OPENAI_API_KEY exists in production/i, 'production key state recorded UNOBSERVED'],
    [/SEPARATE DEPLOYMENT-CUSTODY ACT/i, 'production-env read named as a separate custody act'],
    [/does NOT conditionally gate on key presence/i, 'the two TTS surfaces are distinguished, not flattened'],
  ];
  for (const [re, name] of checks) re.test(q1) ? ok(name) : bad(`Q1 missing: ${name}`);
}
console.log();

console.log('2 · Q2 — source-classified; traffic unobserved; blanket description stale');
const q2 = section('Q2 —');
if (!q2) bad('Q2 section missing'); else {
  const checks = [
    [/PRODUCTION-ADDRESSABLE/, 'route classified production-addressable'],
    [/TRAFFIC STATUS\s+⛔ UNOBSERVED/, 'traffic status UNOBSERVED'],
    [/KNOWN-LIVE\s+⛔ NOT PROVEN/, 'known-live NOT PROVEN'],
    [/DEAD \/ LEGACY\s+⛔ NOT PROVEN/, 'dead/legacy NOT PROVEN'],
    // ⭐ newline-tolerant: markdown hard-wraps, and a probe that assumes a phrase sits on one
    //    line fails on formatting rather than on substance. Fix the probe, never the record.
    [/top-level\s+singleton/, 'the load-time singleton chain is recorded, not dismissed as unused import'],
    [/NOT edited in this act/i, 'policy debt named but explicitly not repaired'],
  ];
  for (const [re, name] of checks) re.test(q2) ? ok(name) : bad(`Q2 missing: ${name}`);
}
console.log();

console.log('3 · Q3 — reachability invariant, privilege-movement shaped');
const q3 = section('Q3 —');
if (!q3) bad('Q3 section missing'); else {
  const classes = ['MEMBER / ORDINARY PRODUCTION', 'ADMIN PRODUCTION', 'EXPLICIT LAB-GATED', 'LEGACY / NONPRODUCTION', 'TEST'];
  const missing = classes.filter((c) => !q3.includes(c));
  missing.length === 0 ? ok('all five root classes preserved') : bad(`root classes missing: ${missing.join(', ')}`);
  /may not gain new reachability from a more\s*\n?> \*\*privileged runtime surface|privileged runtime surface/i.test(q3)
    ? ok('the invariant is stated in privilege terms, not reachable/unreachable')
    : bad('the invariant is not stated in privilege terms');
  /LAB-GATED\s+→ ordinary production/.test(q3) ? ok('lab→ordinary promotion is explicitly REFUSED') : bad('lab→ordinary refusal missing');
  /MUST NOT TRIP/.test(q3) ? ok('the Anthropic negative control is pre-declared') : bad('negative control missing');
}
console.log();

console.log('4 · withdrawals retained');
[[/check:no-cloud-ai\s+WITHDRAWN/, 'check:no-cloud-ai withdrawal retained'],
 [/WITHDRAWN — false\. The rule set has FOUR rules/, 'the api.openai.com misreading retained']]
  .forEach(([re, n]) => re.test(doc) ? ok(n) : bad(`missing: ${n}`));
console.log();

console.log('5 · nothing was changed that this act forbids');
const changed = g('diff', '--name-only', CENSUS_SUBJECT, 'HEAD').split('\n').filter(Boolean);
console.log(`      files changed since ${CENSUS_SUBJECT}: ${changed.length}`);
for (const f of changed) console.log(`        ${f}`);
!changed.includes(POLICY) ? ok('provider-policy.json UNCHANGED') : bad('provider-policy.json was edited');
!changed.includes(GUARD)  ? ok('check-provider-governance.ts UNCHANGED') : bad('the guard was modified');
const prod = changed.filter((f) => PRODUCT.some((p) => f.startsWith(p)));
prod.length === 0 ? ok('zero product-code files touched') : bad(`product code touched: ${prod.join(', ')}`);
console.log();

console.log(`---- ${pass} passed · ${fail} failed ----`);
process.exit(fail === 0 ? 0 : 1);
