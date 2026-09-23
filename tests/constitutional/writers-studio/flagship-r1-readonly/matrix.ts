import { execFileSync } from 'node:child_process';
import { runR10Laws, type LawResult } from './laws';
import { REFERENCE, DEFEAT_CANDIDATES, NAMED_KILL } from './candidates';

const line = (s = '') => process.stdout.write(s + '\n');
const failed = (rs: readonly LawResult[]) => rs.filter((r) => !r.ok);
let exit = 0;

function main() {
  line(''); line('── FLAGSHIP-RUNTIME-CONVERGENCE-01 / R1-0 · READ-ONLY REAL-READER MAPPING ──'); line();
  try {
    execFileSync('npm', ['run', 'verify:flagship-freeze', '--silent'], { stdio: 'pipe' });
    line('  PASS  R1-0-G0-FS1-freeze-intact');
  } catch {
    line('  FAIL  R1-0-G0-FS1-freeze-intact'); exit = 1;
  }
  const ref = runR10Laws(REFERENCE);
  for (const r of ref) line(`  ${r.ok ? 'PASS' : 'FAIL'}  ${r.id} — ${r.detail}`);
  if (failed(ref).length) { exit = 1; line('  ⛔ REFERENCE RED'); }
  line();
  let dead = 0;
  for (const c of DEFEAT_CANDIDATES) {
    const rs = runR10Laws(c); const dl = failed(rs).map((r) => r.id); const named = NAMED_KILL[c.name];
    const killed = !!named && dl.includes(named);
    if (killed) dead += 1; else exit = 1;
    line(`  ${killed ? 'DEAD' : '⛔ SURVIVED'}  ${c.name} → ${named} · failed: ${dl.join(', ') || 'none'}`);
  }
  line(); line('── VERDICT ──────────────────────────────────────────────────────────');
  line(`  reference       ${ref.length - failed(ref).length}/${ref.length}`);
  line(`  candidates dead ${dead}/${DEFEAT_CANDIDATES.length}`);
  line(`  matrix          ${exit === 0 ? 'LETHAL' : 'RED'}`);
  process.exit(exit);
}
main();
