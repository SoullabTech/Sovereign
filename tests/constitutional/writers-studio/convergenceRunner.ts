import { runC2C4 } from './convergenceC2C4';
const line = (s: string) => process.stdout.write(s + '\n');
const checks = runC2C4();
line('── WS-CONVERGENCE-01 / C2–C4 · structural acceptance ──────');
for (const c of checks) line(`  ${c.ok ? 'PASS' : 'FAIL'}  ${c.id}  — ${c.detail}`);
const failed = checks.filter((c) => !c.ok);
line('');
line(failed.length === 0
  ? '⭐ C2–C4 STRUCTURAL GATES GREEN — ⚠️ the five experiential questions remain the FOUNDER WALK.'
  : `⛔ ${failed.length} FAILED`);
process.exit(failed.length === 0 ? 0 : 1);
