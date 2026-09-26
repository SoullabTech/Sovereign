/**
 * O7R2R1 — Ratified Presentation Reconciliation Conformance Matrix.
 *
 * Test/governance only. No MAIA/House/runtime effect.
 */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import { runPresentationReconciliationLaws } from './contract';
import {
  REFERENCE,
  DEFEAT_CANDIDATES,
  NAMED_KILL,
  CLASSIFIED_COLLATERAL,
} from './candidates';

const line = (text: string) => process.stdout.write(text + '\n');
let exit = 0;

const FIXTURE_PATH = path.resolve(
  process.cwd(),
  'docs/business/FOUNDER-LAUNCH-AND-BUSINESS/08-WHOLE-ORGANISM-ORCHESTRATION/O7R2_RATIFIED_PRESENTATION_RECONCILIATION_FIXTURE_v0.1.jsonl',
);

const PLATFORM_KNOWLEDGE_PATH = path.resolve(
  process.cwd(),
  'lib/sovereign/platformKnowledge.ts',
);

const EXPECTED_PLATFORM_KNOWLEDGE_SHA256 =
  '050a8ef1bc79be1c2c9f32644b7e35151d59db1bf090e9fb4fe205e93b5add29';

function parseFixture(): any[] {
  return fs.readFileSync(FIXTURE_PATH, 'utf8')
    .trim()
    .split('\n')
    .map((lineText) => JSON.parse(lineText));
}

function failedLawIds(records: readonly any[]): string[] {
  return runPresentationReconciliationLaws(records as any)
    .filter((r) => !r.ok)
    .map((r) => r.lawId);
}
function sha256File(file: string): string {
  return createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

function importSources(source: string): string[] {
  const refs: string[] = [];
  const re = /^\s*import(?:[\s\S]*?)\sfrom\s+['"]([^'"]+)['"];?/gm;
  let m: RegExpExecArray | null;
  while ((m = re.exec(source))) refs.push(m[1]);
  return refs;
}

const FORBIDDEN_RUNTIME_IMPORT_FRAGMENTS = [
  'lib/sovereign/platformKnowledge',
  'lib/maia/cognitionEvents',
  'lib/maia/capabilities',
  'lib/voice/voiceCommands',
  'lib/house/',
  'app/house',
  'config/accessMatrix',
  'next/navigation',
] as const;

function forbiddenRuntimeImports(source: string): string[] {
  return importSources(source).filter((ref) =>
    FORBIDDEN_RUNTIME_IMPORT_FRAGMENTS.some((needle) => ref.includes(needle))
  );
}

line('');
line('── SOULLAB WHOLE-ORGANISM / O7R2R1 · PRESENTATION RECONCILIATION ───');
line('');

line('── frozen reference ──────────────────────────────────────────────────');
const referenceFailures = failedLawIds(REFERENCE);
if (referenceFailures.length) {
  line('  ⛔ reference fails: ' + referenceFailures.join(', '));
  exit = 1;
} else {
  line('  ✅ reference 12/12 laws');
}
line('');
line('── documentary fixture custody ───────────────────────────────────────');
const fixture = parseFixture();
try {
  assert.deepEqual(fixture, REFERENCE);
  line('  ✅ documentary fixture is semantic-identical to frozen reference');
} catch {
  line('  ⛔ documentary fixture differs from frozen reference');
  exit = 1;
}

const fixtureFailures = failedLawIds(fixture);
if (fixtureFailures.length) {
  line('  ⛔ fixture law failures: ' + fixtureFailures.join(', '));
  exit = 1;
} else {
  line('  ✅ documentary fixture 12/12 laws');
}

line('');
line('── platformKnowledge witness custody ─────────────────────────────────');
const livePlatformHash = sha256File(PLATFORM_KNOWLEDGE_PATH);
if (livePlatformHash === EXPECTED_PLATFORM_KNOWLEDGE_SHA256) {
  line('  ✅ platformKnowledge witness hash matches O7R2 reconciliation');
} else {
  line('  ⛔ PLATFORM_KNOWLEDGE_WITNESS_DRIFT');
  line('      expected ' + EXPECTED_PLATFORM_KNOWLEDGE_SHA256);
  line('      live     ' + livePlatformHash);
  exit = 1;
}
line('');
line('── defeat candidates ─────────────────────────────────────────────────');
let dead = 0;

for (const [name, make] of Object.entries(DEFEAT_CANDIDATES)) {
  const named = NAMED_KILL[name];
  if (!named) {
    line('  ⛔ ' + name + ' has no named kill');
    exit = 1;
    continue;
  }

  const failed = failedLawIds(make());
  if (!failed.includes(named)) {
    line('  ⛔ SURVIVED   ' + name + ' → ' + named);
    line('              failed: ' + (failed.join(', ') || 'none'));
    exit = 1;
    continue;
  }

  dead += 1;
  line('  DEAD        ' + name + ' → ' + named);

  const collateral = failed.filter((id) => id !== named);
  const allowed = [...(CLASSIFIED_COLLATERAL[name] ?? [])];
  const stale = allowed.filter((id) => !collateral.includes(id));
  const unclassified = collateral.filter((id) => !allowed.includes(id));

  if (collateral.length) line('              collateral: ' + collateral.join(', '));
  if (stale.length) {
    line('              ⛔ stale classification: ' + stale.join(', '));
    exit = 1;
  }
  if (unclassified.length) {
    line('              ⛔ UNCLASSIFIED: ' + unclassified.join(', '));
    exit = 1;
  }
}
line('');
line('── source-coupling guard ─────────────────────────────────────────────');

const THIS_DIR = path.dirname(new URL(import.meta.url).pathname);
for (const file of ['contract.ts', 'candidates.ts', 'matrix.ts']) {
  const source = fs.readFileSync(path.join(THIS_DIR, file), 'utf8');
  const hits = forbiddenRuntimeImports(source);
  if (hits.length) {
    line('  ⛔ ' + file + ' forbidden runtime imports: ' + hits.join(', '));
    exit = 1;
  } else {
    line('  ✅ ' + file + ' has no forbidden runtime imports');
  }
}

const syntheticRuntimeImport =
  "import { PLATFORM_KNOWLEDGE_ADDENDUM } from '../../../../lib/sovereign/platformKnowledge';";
assert.deepEqual(
  forbiddenRuntimeImports(syntheticRuntimeImport),
  ['../../../../lib/sovereign/platformKnowledge'],
);
line('  DEAD        SYNTHETIC-RUNTIME-COUPLING → PRESENTATION_RUNTIME_COUPLING_FORBIDDEN');

line('');
line('── law input guard ───────────────────────────────────────────────────');
assert.equal(
  runPresentationReconciliationLaws.length,
  1,
  'presentation laws must accept documentary records only',
);
line('  ✅ conformance laws accept one documentary record set only');

line('');
line('── verdict ───────────────────────────────────────────────────────────');
line('  reference laws       ' + (referenceFailures.length ? 'FAIL' : '12/12 PASS'));
line('  fixture laws         ' + (fixtureFailures.length ? 'FAIL' : '12/12 PASS'));
line('  data mutants dead    ' + dead + '/' + Object.keys(DEFEAT_CANDIDATES).length);
line('  coupling falsifier   DEAD');
line('  platform map witness ' + (livePlatformHash === EXPECTED_PLATFORM_KNOWLEDGE_SHA256 ? 'MATCH' : 'DRIFT'));
line('  matrix               ' + (exit === 0 ? 'LETHAL + DISCRIMINATING' : '⛔ NOT LETHAL'));
line('');
line('  ⛔ TEST/DOCUMENTARY ONLY · NO RUNTIME UTTERANCE · NO MAIA/HOUSE CONSUMER');

process.exit(exit);
