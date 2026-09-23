/** C1C1 LETHALITY MATRIX — `npm run matrix:ws-flagship-c1c1`. ⛔ A surviving candidate repairs the SUITE. */
import { runC1C1Laws, type LawResult } from './laws';
import { REFERENCE, DEFEAT_CANDIDATES, NAMED_KILL, CLASSIFIED } from './candidates';
const line = (s: string) => process.stdout.write(s + '\n');
let exit = 0; const failed = (rs: LawResult[]) => rs.filter((r) => !r.ok);
async function main() {
  line(''); line('── FLAGSHIP-RUNTIME-CONVERGENCE-01 / C1C1 · DISCUSS-ONLY CONTEXTUAL MAIA ──'); line('');
  const ref = await runC1C1Laws(REFERENCE);
  for (const r of ref) line(`  ${r.ok ? 'PASS' : 'FAIL'}  ${r.id}  — ${r.detail}`);
  if (failed(ref).length) { exit = 1; line('  ⛔ THE REFERENCE MUST PASS EVERY LAW'); }
  line(''); let dead = 0;
  for (const c of DEFEAT_CANDIDATES) {
    const named = NAMED_KILL[c.name]; const dl = failed(await runC1C1Laws(c)).map((r) => r.id);
    if (!named || !dl.includes(named)) { exit = 1; line(`  ⛔ SURVIVED   ${c.name} → ${named} · failed: ${dl.join(', ') || 'nothing'}`); continue; }
    dead += 1; const collateral = dl.filter((id) => id !== named); const allowed = CLASSIFIED[c.name] ?? [];
    const un = collateral.filter((id) => !allowed.includes(id)); const stale = allowed.filter((id) => !collateral.includes(id));
    line(`  DEAD        ${c.name.padEnd(40)} → ${named}${collateral.length ? `   collateral: ${collateral.join(', ')}${un.length ? ' ⛔ UNCLASSIFIED' : ' (classified)'}` : ''}`);
    if (un.length || stale.length) exit = 1; if (stale.length) line(`              ⚠️ stale classification: ${stale.join(', ')}`);
  }
  line(''); line('── VERDICT ──────────────────────────────────────────────────────────');
  line(`  reference            ${ref.length - failed(ref).length}/${ref.length}`);
  line(`  candidates dead      ${dead}/${DEFEAT_CANDIDATES.length}`);
  line(`  matrix               ${exit === 0 ? 'LETHAL + DISCRIMINATING' : '⛔ NOT LETHAL'}`);
  line(''); line('  C1C1 opens ONE passage-bound Discuss turn from the flagship Write host.');
  line('  ⛔ No Revise · Apply · Undo · Reason · Teach · coverage · second turn · production enablement is conferred.'); line('');
  process.exit(exit);
}
void main();
