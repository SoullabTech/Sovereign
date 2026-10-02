import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const read = (p: string) => fs.readFileSync(path.join(root, p), 'utf8');
const strip = (s: string) =>
  s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '');

const migration = read('database/migrations/20260921000001_epistemic_join_persistence.sql');
const store = strip(read('lib/ain/epistemic-join/persistence/store.ts'));
const feature = strip(read('lib/ain/epistemic-join/persistence/feature.ts'));
const purity = read('lib/ain/epistemic-join/__tests__/purity.test.ts');

let passed = 0;
const failures: string[] = [];

function guard(id: string, law: string, fn: () => boolean): void {
  const ok = (() => { try { return fn(); } catch { return false; } })();
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${id}  ${law}`);
  if (ok) passed += 1;
  else failures.push(id);
}

guard('I3-F01', 'feature flag is literal-1 and therefore default OFF', () =>
  feature.includes("=== '1'") && feature.includes('AIN_EPISTEMIC_JOIN_PERSISTENCE_ENABLED'));
guard('I3-F02', 'I2 pure-core inventory guard remains unchanged', () =>
  purity.includes("expect(names).not.toContain('store.ts')"));
guard('I3-F03', 'persistence lives below the pure-core top-level scan', () =>
  fs.existsSync(path.join(root, 'lib/ain/epistemic-join/persistence/store.ts'))
  && !fs.existsSync(path.join(root, 'lib/ain/epistemic-join/store.ts')));
guard('I3-F04', 'store re-runs the canonical I2 evaluator before custody', () =>
  store.includes('evaluateJoin(request)'));
guard('I3-F05', 'store checks the OFF gate before preparation or transaction', () =>
  store.indexOf('epistemicJoinPersistenceEnabled') < store.indexOf('prepareEpistemicJoinPersistence')
  && store.indexOf('prepareEpistemicJoinPersistence(input.memberId') < store.indexOf('deps.transaction'));
guard('I3-F06', 'same-join writers serialize transactionally', () =>
  store.includes('pg_advisory_xact_lock') && store.includes('deps.transaction'));
guard('I3-F07', 'store has no UPDATE/DELETE/TRUNCATE mutation statement', () =>
  !/\bUPDATE\s+\w+\s+SET\b|\bDELETE\s+FROM\b|\bTRUNCATE\b/i.test(store));
guard('I3-F08', 'schema contains no ON DELETE CASCADE', () =>
  !/ON\s+DELETE\s+CASCADE/i.test(migration));
guard('I3-F09', 'member scope is structural, not advisory', () =>
  migration.includes('REFERENCES members(id) ON DELETE RESTRICT')
  && migration.includes("envelope ->> 'memberScope' = member_id::text"));
guard('I3-F10', 'all six persistence tables are append-only', () =>
  (migration.match(/BEFORE UPDATE OR DELETE/g) ?? []).length === 6);
guard('I3-F11', 'standing history has one root and one successor', () =>
  migration.includes('epistemic_standing_one_root_per_subject')
  && migration.includes('epistemic_standing_one_successor'));
guard('I3-F12', 'admission history has one root and one successor', () =>
  migration.includes('epistemic_admission_one_root')
  && migration.includes('epistemic_admission_one_successor'));
guard('I3-F13', 'standing succession cannot cross member/join/subject', () =>
  migration.includes('epistemic_validate_standing_successor')
  && migration.includes('same member/join/subject'));
guard('I3-F14', 'admission succession cannot cross member/join', () =>
  migration.includes('epistemic_validate_admission_successor')
  && migration.includes('same member/join'));
guard('I3-F15', 'current standing is a derived tip view, never a mutable field', () =>
  migration.includes('CREATE VIEW epistemic_join_current_standing')
  && migration.includes('successor.previous_admission_id = a.admission_id')
  && !/current_standing\s+text/i.test(migration));
guard('I3-F16', 'database refuses representation-open admissions', () =>
  migration.includes('epistemic_admission_representation_closed')
  && migration.includes("representationAuthority' = 'closed'"));
guard('I3-F17', 'migration carries an explicit reverse path', () =>
  migration.includes('ROLLBACK (manual')
  && migration.includes('DROP TABLE IF EXISTS epistemic_join_records'));
guard('I3-F18', 'no application/runtime surface imports I3 persistence', () => {
  const rg = spawnSync('rg', [
    '-n', 'epistemic-join/persistence', 'app', 'lib',
    '-g', '!lib/ain/epistemic-join/persistence/**',
  ], { cwd: root, encoding: 'utf8' });
  return rg.status === 1 && rg.stdout.trim() === '';
});

console.log(`\nRESULT: ${passed}/18 PASS`);
if (failures.length) {
  console.error(`FAILED: ${failures.join(', ')}`);
  process.exit(1);
}
