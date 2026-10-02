#!/usr/bin/env tsx
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(__dirname, '../../..');
const deploy = fs.readFileSync(path.join(root, 'scripts/deploy-production.sh'), 'utf8');
const telemetry = fs.readFileSync(path.join(root, 'app/api/ain/telemetry/route.ts'), 'utf8');

const must = (token: string) => {
  if (!deploy.includes(token)) throw new Error('deploy law missing: ' + token);
};
const mustNot = (token: string) => {
  if (deploy.includes(token)) throw new Error('deploy law still contains: ' + token);
};

must('run_dependency_security_audit() {');
must("packageManager || ''");
must('npm audit --omit=dev --audit-level=moderate');
must('pnpm audit --prod --audit-level=moderate');
must('run_dependency_security_audit || exit 1');
mustNot('pnpm not found — skipping dependency audit');
mustNot('SKIP_AUDIT');

const calls = deploy.match(/run_dependency_security_audit \|\| exit 1/g) ?? [];
if (calls.length !== 2) throw new Error('expected deploy+update audit invocation exactly twice');
if (!telemetry.includes('export const dynamic = "force-dynamic";'))
  throw new Error('AIN telemetry must remain runtime-dynamic');

console.log('POST-PROMOTION HYGIENE CONFORMANCE: PASS');
console.log('  target-declared package manager governs dependency audit');
console.log('  dependency audit fails closed with no bypass');
console.log('  AIN telemetry is runtime-dynamic');
