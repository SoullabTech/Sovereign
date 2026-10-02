import { runC5 } from './convergenceC5';

const checks = runC5();
console.log('── WS-CONVERGENCE-01 / C5 · guided editorial loop acceptance ──────');
let failed = 0;
for (const c of checks) {
  console.log(`  ${c.ok ? 'PASS' : 'FAIL'}  ${c.id}  — ${c.detail}`);
  if (!c.ok) failed += 1;
}
if (failed > 0) {
  console.error(`\n⛔ C5 NOT CLOSED — ${failed} acceptance check(s) failed.`);
  process.exit(1);
}
console.log('\n⭐ C5 MECHANICAL GATES GREEN — founder experience/learning-quality witness remains owed.');
