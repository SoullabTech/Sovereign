import { runMemberPlaceLaws } from './laws';
import { REFERENCE, DEFEAT_CANDIDATES, NAMED_KILL, CLASSIFIED } from './candidates';

const line = (s: string) => process.stdout.write(s + '\n');
let exit = 0;
line(''); line('── OBSERVATION-ADDRESS-01 / B-I · MEMBER-PLACE LETHALITY ────────────'); line('');
const ref = runMemberPlaceLaws(REFERENCE); const refFailed = ref.filter((r) => !r.ok);
line(`  reference            ${ref.length - refFailed.length}/${ref.length} ${refFailed.length ? '⛔ FAIL' : 'PASS'}`);
for (const f of refFailed) { line(`    ⛔ ${f.id} — ${f.detail}`); exit = 1; }
line('');
let dead = 0;
for (const [name, make] of Object.entries(DEFEAT_CANDIDATES)) {
  const named = NAMED_KILL[name]; if (!named) { line(`  ⛔ ${name} names no law`); exit = 1; continue; }
  const failed = runMemberPlaceLaws(make).filter((r) => !r.ok).map((r) => r.id);
  if (!failed.includes(named)) { line(`  ⛔ SURVIVED   ${name} → ${named}`); exit = 1; continue; }
  dead += 1; line(`  DEAD        ${name} → ${named}`);
  const collateral = failed.filter((id) => id !== named); const allowed = CLASSIFIED[name] ?? [];
  if (collateral.length) line(`              collateral: ${collateral.join(', ')}`);
  const stale = allowed.filter((id) => !collateral.includes(id)); if (stale.length) { line(`              ⚠️ stale classification: ${stale.join(', ')}`); exit = 1; }
  const un = collateral.filter((id) => !allowed.includes(id)); if (un.length) { line(`              ⛔ UNCLASSIFIED: ${un.join(', ')}`); exit = 1; }
}
line(''); line('── VERDICT ──────────────────────────────────────────────────────────');
line(`  reference            ${ref.length - refFailed.length}/${ref.length}`);
line(`  candidates dead      ${dead}/${Object.keys(DEFEAT_CANDIDATES).length}`);
line(`  matrix               ${exit === 0 ? 'LETHAL + DISCRIMINATING' : '⛔ NOT LETHAL'}`);
line('');
line('  GREEN LAW · MEMBER-OBSERVATION PERSISTENCE NOT YET IMPLEMENTED');
line('  ⛔ No member_observations table exists. The reference is a Map. These');
line('     laws are E1; nothing here is E2/E3 product behaviour.');
line('  SANCTUARY: policy RESOLVED (founder rider) · wiring NOT IMPLEMENTED ·');
line('     runtime witness NOT YET POSSIBLE.');
line('');
process.exit(exit);
