#!/usr/bin/env node
// JOP-04 · D3 evidence — repo.grep.max_results is a real LIMIT term that execution ignores.
//
// READ-ONLY. Exercises ONLY the registered read capability `repo.grep` through the registry's
// own runCapability() — no handler, schema or production code is modified.
//
// ⭐ Self-contamination discipline (five prior incidents in this programme): every assertion is a
//    RELATIONSHIP that only strengthens as documentation grows. Nothing asserts a global zero and
//    nothing asserts an exact count.
//
// Usage: node scripts/jop04/d3-max-results-evidence.mjs [root]

import { CAPABILITIES, runCapability } from '../builder/deterministic.mjs';
import { execFileSync } from 'node:child_process';

const root = process.argv[2] || execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();
let pass = 0, fail = 0;
const ok  = (m) => { pass++; console.log(`  PASS  ${m}`); };
const bad = (m) => { fail++; console.log(`  FAIL  ${m}`); };
const records = (out) => out.stdout.split('\n').filter((l) => l.trim() !== '').length;

console.log('JOP-04 D3 · repo.grep.max_results — evidence');
console.log(`root: ${root}`);
console.log(`HEAD: ${execFileSync('git', ['-C', root, 'rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).trim()}`);
console.log();

// A pattern guaranteed to have many hits and to only ever gain more as the record grows.
const PATTERN = 'declareRoutingEligibility';

console.log('S1 · the schema declares max_results as a bounded LIMIT');
const spec = CAPABILITIES['repo.grep'].args.max_results;
console.log(`      ${JSON.stringify(spec)}`);
(spec && spec.type === 'number' && spec.min === 1 && spec.max === 200)
  ? ok('declared: number, 1…200 — the domain D3 ratifies')
  : bad('the declared domain is not 1…200');
console.log();

console.log('S2 · the handler READS, DEFAULTS and RE-VALIDATES it');
const src = CAPABILITIES['repo.grep'].handler.toString();
const reads    = /args\.max_results/.test(src);
const defaults = /\|\|\s*200/.test(src);
const checks   = />\s*200/.test(src);
const applies  = /max_results/.test(src.slice(src.indexOf('const cmd')));
console.log(`      reads=${reads}  defaults=${defaults}  re-validates=${checks}  reaches the command=${applies}`);
(reads && defaults && checks && !applies)
  ? ok('read → defaulted → validated → never reaches the command (H3, from source)')
  : bad('the handler shape has changed since the D3 ruling');
console.log();

console.log('S3 · ⭐ D3-F6 / D3-F1 LIVE — an accepted N does not bound returned cardinality');
const r1   = runCapability('repo.grep', { pattern: PATTERN, max_results: 1 }, root);
const r200 = runCapability('repo.grep', { pattern: PATTERN, max_results: 200 }, root);
const rNone= runCapability('repo.grep', { pattern: PATTERN }, root);
const n1 = records(r1), n200 = records(r200), nNone = records(rNone);
console.log(`      max_results=1 → ${n1} records   max_results=200 → ${n200}   omitted → ${nNone}`);
(n1 > 1)
  ? ok(`max_results:1 was ACCEPTED and returned ${n1} records — the limit is not honoured`)
  : bad('max_results:1 returned at most one record — D3-F6 does not reproduce');
(n1 === n200 && n200 === nNone)
  ? ok('every N is indistinguishable from every other and from omission — the term is inert')
  : bad('the three invocations differ; re-read the runtime');
console.log();

console.log('S4 · D3.2 — omission and an explicit 200 are the SAME EFFECT, not the same INVOCATION');
console.log(`      { pattern } and { pattern, max_results: 200 } both returned ${nNone} records.`);
console.log('      ⛔ Identical effect is NOT identical authorship. Per D4 and D3-F7, 200 arose from');
console.log('         host_default in the first and from the caller in the second; a canonical record');
console.log('         that collapses them is defective even while the runtime cannot tell them apart.');
ok('recorded as an attribution obligation, asserted by nothing here (no canonicalizer exists yet)');
console.log();

console.log('⛔ CURRENT RUNTIME (H3 defect), not a prediction. D3 authorizes NO handler repair.');
console.log(`---- ${pass} passed · ${fail} failed ----`);
process.exit(fail === 0 ? 0 : 1);
