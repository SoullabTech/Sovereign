#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..', '..', '..');
const ledger = fs.readFileSync(path.join(root, 'scripts/builder/work-unit-ledger-v2.mjs'), 'utf8');
const durable = fs.readFileSync(path.join(root, 'scripts/builder/durable-result-v1.mjs'), 'utf8');
const native = fs.readFileSync(path.join(root, 'scripts/builder/jarvis-runtime-pipeline.mjs'), 'utf8');

const checks = [
  ['W4 has diff', /diff:\s*Object\.freeze\(\['diff_id', 'attempt_id', 'base_ref', 'head_ref', 'digest'\]\)/.test(ledger)],
  ['W4 has resulting_commit', /resulting_commit:\s*Object\.freeze\(\['commit_sha', 'attempt_id'\]\)/.test(ledger)],
  ['W4 has deterministic verification', /'deterministic_verification'/.test(ledger)],
  ['W4 has verifier_result', /verifier_result:\s*Object\.freeze/.test(ledger)],
  ['durable result ignores unknown fields', /Unknown fields are ignored/.test(durable)],
  ['native custody verifies PATCH_APPLIED', /PATCH_APPLIED/.test(native)],
  ['native custody verifies candidate parent/base', /parent !== base \|\| count !== 1/.test(native)],
  ['native custody verifies changed paths', /NATIVE_COMMIT_PATH_MISMATCH/.test(native)],
];

let bad = 0;
for (const [name, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`);
  if (!ok) bad += 1;
}
process.exit(bad === 0 ? 0 : 1);
