/** R1-2 LETHALITY MATRIX — `npm run matrix:ws-flagship-r1-2`. ⛔ A surviving candidate repairs the SUITE. */
import { runR12Laws, type LawResult } from './laws';
import { REFERENCE, DEFEAT_CANDIDATES, NAMED_KILL, CLASSIFIED } from './candidates';
const line = (s: string) => process.stdout.write(s + '\n');
let exit = 0; const failed = (rs: LawResult[]) => rs.filter((r) => !r.ok);
async function main() {
  line(''); line('── FLAGSHIP-RUNTIME-CONVERGENCE-01 / R1-2 · EXACT REVIEW → MANUSCRIPT SECTION NAVIGATION + GOVERNED RE-FREEZE ──'); line('');
  const ref = await runR12Laws(REFERENCE);
  for (const r of ref) line(`  ${r.ok ? 'PASS' : 'FAIL'}  ${r.id}  — ${r.detail}`);
  if (failed(ref).length) { exit = 1; line('  ⛔ THE REFERENCE MUST PASS EVERY LAW'); }
  line(''); let dead = 0;
  for (const c of DEFEAT_CANDIDATES) {
    const named = NAMED_KILL[c.name]; const dl = failed(await runR12Laws(c)).map((r) => r.id);
    if (!named || !dl.includes(named)) { exit = 1; line(`  ⛔ SURVIVED   ${c.name} → ${named} · failed: ${dl.join(', ') || 'nothing'}`); continue; }
    dead += 1; const collateral = dl.filter((id) => id !== named).filter((id) => !failed(ref).some((r) => r.id === id)); const allowed = CLASSIFIED[c.name] ?? [];
    const un = collateral.filter((id) => !allowed.includes(id)); const stale = allowed.filter((id) => !collateral.includes(id));
    line(`  DEAD        ${c.name.padEnd(46)} → ${named}${collateral.length ? `   collateral: ${collateral.join(', ')}${un.length ? ' ⛔ UNCLASSIFIED' : ' (classified)'}` : ''}`);
    if (un.length || stale.length) exit = 1; if (stale.length) line(`              ⚠️ stale classification: ${stale.join(', ')}`);
  }
  line(''); line('── VERDICT ──────────────────────────────────────────────────────────');
  line(`  reference            ${ref.length - failed(ref).length}/${ref.length}`);
  line(`  candidates dead      ${dead}/${DEFEAT_CANDIDATES.length}`);
  line(`  matrix               ${exit === 0 ? 'LETHAL + DISCRIMINATING' : '⛔ NOT LETHAL'}`);
  line(''); line('  R1-2 returns the writer from a mounted finding to EXACTLY its durable section — reading removed, Work kept, s=<that id>.');
  line('  ⛔ No position · no nearest · no focus · no text search · no held passage · no write · no cognition · only navigate moved.'); line('');
  process.exit(exit);
}
void main();
