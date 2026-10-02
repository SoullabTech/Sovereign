import { runC6 } from './convergenceC6';

const checks = runC6();
console.log('── WS-CONVERGENCE-01 / C6 · observation layer convergence ─────────');
let failed = 0;
for (const c of checks) {
  console.log(`  ${c.ok ? 'PASS' : 'FAIL'}  ${c.id}  — ${c.detail}`);
  if (!c.ok) failed += 1;
}
if (failed > 0) {
  console.error(`\n⛔ C6 NOT CLOSED — ${failed} acceptance check(s) failed.`);
  process.exit(1);
}
console.log('\n⭐ C6 MECHANICAL GATES GREEN — founder experience witness remains owed.');
