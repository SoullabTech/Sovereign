/**
 * O5R1 — Capability Awareness Conformance Matrix.
 *
 * Constitutional evidence only. No product/runtime effects.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import { CAPABILITY_AUTHORITY_REGISTRY } from '../../../../lib/maia/capabilityAuthorityRegistry';
import { projectCapabilityAwareness } from '../../../../lib/maia/capabilityAwarenessProjection';
import { runCapabilityAwarenessLaws } from './contract';
import {
  REFERENCE,
  DEFEAT_CANDIDATES,
  NAMED_KILL,
  CLASSIFIED_COLLATERAL,
} from './candidates';

const line = (text: string) => process.stdout.write(text + '\n');
let exit = 0;

function failedLawIds(records: readonly any[]): string[] {
  return runCapabilityAwarenessLaws(records as any)
    .filter((r) => !r.ok)
    .map((r) => r.lawId);
}

function importSources(source: string): string[] {
  const refs: string[] = [];
  const re = /^\s*import(?:[\s\S]*?)\sfrom\s+['"]([^'"]+)['"];?/gm;
  let m: RegExpExecArray | null;
  while ((m = re.exec(source))) refs.push(m[1]);
  return refs;
}
const FORBIDDEN_RUNTIME_IMPORT_FRAGMENTS = [
  'config/accessMatrix',
  'maia/presence/place',
  'maia/cognitionEvents',
  'voice/voiceCommands',
  'components/',
  'app/house',
  'next/navigation',
] as const;

function forbiddenRuntimeImports(source: string): string[] {
  return importSources(source).filter((ref) =>
    FORBIDDEN_RUNTIME_IMPORT_FRAGMENTS.some((needle) => ref.includes(needle))
  );
}

line('');
line('── SOULLAB WHOLE-ORGANISM / O5R1 · CAPABILITY AWARENESS CONFORMANCE ──');
line('');

line('── frozen reference ───────────────────────────────────────────────────');
const referenceFailures = failedLawIds(REFERENCE);
if (referenceFailures.length) {
  line('  ⛔ reference fails: ' + referenceFailures.join(', '));
  exit = 1;
} else {
  line('  ✅ reference 14/14 laws');
}

line('');
line('── live O3→O4 projection against frozen reference ─────────────────────');
const live = projectCapabilityAwareness(CAPABILITY_AUTHORITY_REGISTRY);
try {
  assert.deepEqual(live, REFERENCE);
  line('  ✅ live awareness is byte-semantic-equivalent to frozen reference');
} catch {
  line('  ⛔ live awareness differs from frozen reference');
  exit = 1;
}
const liveFailures = failedLawIds(live);
if (liveFailures.length) {
  line('  ⛔ live law failures: ' + liveFailures.join(', '));
  exit = 1;
} else {
  line('  ✅ live awareness 14/14 laws');
}

line('');
line('── defeat candidates ──────────────────────────────────────────────────');
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
line('── F-O5-14 · runtime-coupling guard ───────────────────────────────────');

const THIS_DIR = path.dirname(new URL(import.meta.url).pathname);
const guardedFiles = ['contract.ts', 'candidates.ts', 'matrix.ts'];
for (const file of guardedFiles) {
  const source = fs.readFileSync(path.join(THIS_DIR, file), 'utf8');
  const hits = forbiddenRuntimeImports(source);
  if (hits.length) {
    line('  ⛔ ' + file + ' forbidden imports: ' + hits.join(', '));
    exit = 1;
  } else {
    line('  ✅ ' + file + ' has no forbidden runtime imports');
  }
}

const syntheticForbidden = "import { ACCESS_RULES } from '../../../../config/accessMatrix';";
assert.deepEqual(forbiddenRuntimeImports(syntheticForbidden), ['../../../../config/accessMatrix']);
line('  DEAD        SYNTHETIC-RUNTIME-COUPLING → CONFORMANCE_RUNTIME_COUPLING_FORBIDDEN');
line('');
line('── consumer arity / member-context guard ─────────────────────────────');
assert.equal(
  runCapabilityAwarenessLaws.length,
  1,
  'conformance laws must accept awareness only',
);
line('  ✅ conformance law consumer accepts exactly one semantic input');

line('');
line('── verdict ────────────────────────────────────────────────────────────');
line('  reference laws       ' + (referenceFailures.length ? 'FAIL' : '14/14 PASS'));
line('  live laws            ' + (liveFailures.length ? 'FAIL' : '14/14 PASS'));
line('  data mutants dead    ' + dead + '/' + Object.keys(DEFEAT_CANDIDATES).length);
line('  coupling falsifier   DEAD');
line('  matrix               ' + (exit === 0 ? 'LETHAL + DISCRIMINATING' : '⛔ NOT LETHAL'));
line('');
line('  ⛔ TEST/GOVERNANCE ONLY · NO PRODUCTION CONSUMER · NO SELF-REPAIR');

process.exit(exit);
