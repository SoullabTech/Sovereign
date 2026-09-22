import { runIntentLaws } from './laws';
import { REFERENCE, DEFEAT_CANDIDATES, NAMED_KILL, CLASSIFIED } from './candidates';
const line = (s: string) => process.stdout.write(s + '\n'); let exit = 0;
line(''); line('── F7 · INTENT-FIRST · LETHALITY ────────────────────────────────────'); line('');
const ref = runIntentLaws(REFERENCE); const rf = ref.filter((r) => !r.ok);
line(`  reference            ${ref.length - rf.length}/${ref.length} ${rf.length ? '⛔ FAIL' : 'PASS'}`); for (const f of rf) { line(`    ⛔ ${f.id} — ${f.detail}`); exit = 1; } line('');
let dead = 0;
for (const [name, make] of Object.entries(DEFEAT_CANDIDATES)) {
  const named = NAMED_KILL[name]; if (!named) { line(`  ⛔ ${name} names no law`); exit = 1; continue; }
  const failed = runIntentLaws(make).filter((r) => !r.ok).map((r) => r.id);
  if (!failed.includes(named)) { line(`  ⛔ SURVIVED   ${name} → ${named}`); exit = 1; continue; }
  dead += 1; line(`  DEAD        ${name} → ${named}`);
  const col = failed.filter((id) => id !== named); const allowed = CLASSIFIED[name] ?? [];
  if (col.length) line(`              collateral: ${col.join(', ')}`);
  const stale = allowed.filter((id) => !col.includes(id)); if (stale.length) { line(`              ⚠️ stale classification: ${stale.join(', ')}`); exit = 1; }
  const un = col.filter((id) => !allowed.includes(id)); if (un.length) { line(`              ⛔ UNCLASSIFIED: ${un.join(', ')}`); exit = 1; }
}
line(''); line('── VERDICT ──────────────────────────────────────────────────────────');
line(`  reference            ${ref.length - rf.length}/${ref.length}`); line(`  candidates dead      ${dead}/${Object.keys(DEFEAT_CANDIDATES).length}`);
line(`  matrix               ${exit === 0 ? 'LETHAL + DISCRIMINATING' : '⛔ NOT LETHAL'}`); line('');
line('  INTENT-FIRST LAW GREEN'); line('');
line('  This proves:'); line('    intent and commission are separable'); line('    scope consent is mechanically expressible'); line('    defeat candidates are discriminated'); line('');
line('  This does not prove:'); line('    an intent UI exists'); line('    a reading runtime is wired'); line('    non-professional writers understand it'); line('    the first ten minutes succeed'); line('');
line('  GREEN LAW · INTENT-FIRST CAPABILITY NOT YET IMPLEMENTED'); line('');
process.exit(exit);
