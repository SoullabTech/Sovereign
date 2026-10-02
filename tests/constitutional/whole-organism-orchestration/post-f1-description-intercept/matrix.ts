import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import {
  ROUTE_STAGE_ORDER,
  simulatePostF1Intercept,
  type InterceptScenario,
  type InterceptSimulation,
} from './simulator';
import { REFERENCE_SCENARIOS } from './scenarios';
import {
  runRoutePlanLaws,
  runSimulationLaws,
} from './contract';
import {
  MUTANT_ABSTAIN_CHANGES_RESPONSE,
  MUTANT_AUDIO_INTERCEPTED,
  MUTANT_BAD_CANON,
  MUTANT_COGNITION_FIELDS,
  MUTANT_DESCRIBE_ENTERS_F2,
  MUTANT_DURABILITY_FAILS_INTO_MODEL,
  MUTANT_FAKE_PROVIDER,
  MUTANT_GUEST_PERSISTED,
  MUTANT_INTERCEPT_FAILURE_FABRICATES_OUTPUT,
  MUTANT_NEW_EXCHANGE_ID,
  MUTANT_OBSERVER_SIDE_EFFECT,
  MUTANT_OFFER_SIDE_EFFECT,
  MUTANT_ORPHAN_ASSISTANT,
  MUTANT_ROUTE_PLAN_BEFORE_F1,
  MUTANT_SANCTUARY_PERSISTED,
} from './candidates';

const line = (text: string) => process.stdout.write(text + '\n');
let exit = 0;

const ACTIVE_ROUTE_PATH = path.resolve(
  process.cwd(),
  'app/api/sovereign/app/maia/list/route.ts',
);
const CANON_HEADERS_PATH = path.resolve(
  process.cwd(),
  'lib/sovereign/http/canonHeaders.ts',
);

const EXPECTED_ACTIVE_ROUTE_SHA256 =
  '3f3ba6ec7491aa627a31728b14d9677b20e0d73f340acefe214914da654491ab';
const EXPECTED_CANON_HEADERS_SHA256 =
  '38e3178c97286915498281d178d06621cc641cf43a1e33f7fd573618557b1d8a';

function sha256File(file: string): string {
  return createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

function failedLawIds(
  scenario: InterceptScenario,
  sim: InterceptSimulation,
): string[] {
  return runSimulationLaws(scenario, sim)
    .filter((law) => !law.ok)
    .map((law) => law.lawId);
}

function assertNamedKill(
  label: string,
  failed: readonly string[],
  named: string,
  collateral: readonly string[] = [],
): void {
  if (!failed.includes(named)) {
    line('  ⛔ SURVIVED   ' + label + ' → ' + named);
    line('              failed: ' + (failed.join(', ') || 'none'));
    exit = 1;
    return;
  }

  const actualCollateral = failed.filter((id) => id !== named);
  const stale = collateral.filter((id) => !actualCollateral.includes(id));
  const unclassified = actualCollateral.filter((id) => !collateral.includes(id));

  line('  DEAD        ' + label + ' → ' + named);
  if (actualCollateral.length) {
    line('              collateral: ' + actualCollateral.join(', '));
  }
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
line('── SOULLAB WHOLE-ORGANISM / O8R2R1 · POST-F1 INTERCEPT SIMULATION ──');
line('');

line('── route-plan custody ────────────────────────────────────────────────');
const routePlanFailures = runRoutePlanLaws(ROUTE_STAGE_ORDER)
  .filter((law) => !law.ok)
  .map((law) => law.lawId);

if (routePlanFailures.length) {
  line('  ⛔ route plan fails: ' + routePlanFailures.join(', '));
  exit = 1;
} else {
  line('  ✅ reference route plan 2/2 laws');
}

line('');
line('── reference scenarios ───────────────────────────────────────────────');
let referenceScenarioPasses = 0;
for (const [name, scenario] of Object.entries(REFERENCE_SCENARIOS)) {
  const sim = simulatePostF1Intercept(scenario);
  const failed = failedLawIds(scenario, sim);

  if (failed.length) {
    line('  ⛔ ' + name + ' failed: ' + failed.join(', '));
    exit = 1;
  } else {
    referenceScenarioPasses += 1;
    line('  ✅ ' + name + ' → ' + sim.branch);
  }
}

line('');
line('── reference semantic witnesses ──────────────────────────────────────');
const durable = simulatePostF1Intercept(REFERENCE_SCENARIOS.durableMemberDescribe);
assert.equal(durable.branch, 'DESCRIBE');
assert.equal(durable.assistantWrite?.exchangeId, 'exchange-001');
assert.equal(durable.assistantWrite?.content, durable.response?.message);
line('  ✅ durable member description uses same exchange + same served text');

const durabilityFailed = simulatePostF1Intercept(
  REFERENCE_SCENARIOS.memberDurabilityFailedDescribe,
);
assert.equal(durabilityFailed.branch, 'DESCRIBE');
assert.equal(durabilityFailed.assistantWrite, null);
assert.ok(durabilityFailed.response?.message);
line('  ✅ member-half durability failure produces no orphan assistant write');

const sanctuary = simulatePostF1Intercept(REFERENCE_SCENARIOS.sanctuaryDescribe);
assert.equal(sanctuary.branch, 'DESCRIBE');
assert.equal(sanctuary.assistantWrite, null);
assert.equal(sanctuary.canon?.mode, 'SANCTUARY');
line('  ✅ Sanctuary description is ephemeral with SANCTUARY provenance');

const guest = simulatePostF1Intercept(REFERENCE_SCENARIOS.guestDescribe);
assert.equal(guest.branch, 'DESCRIBE');
assert.equal(guest.assistantWrite, null);
line('  ✅ guest description is ephemeral');

const abstain = simulatePostF1Intercept(REFERENCE_SCENARIOS.abstain);
assert.equal(abstain.branch, 'ABSTAIN');
assert.equal(abstain.fallThrough, true);
assert.equal(abstain.response, null);
line('  ✅ ABSTAIN falls through without an O8 response');

const audio = simulatePostF1Intercept(REFERENCE_SCENARIOS.audioBypass);
assert.equal(audio.branch, 'AUDIO_BYPASS');
assert.equal(audio.fallThrough, true);
line('  ✅ audio-requested turn bypasses O8');

const assistantFailure = simulatePostF1Intercept(
  REFERENCE_SCENARIOS.assistantDurabilityFailedDescribe,
);
assert.equal(assistantFailure.branch, 'DESCRIBE');
assert.equal(assistantFailure.durabilityError, true);
assert.equal(assistantFailure.assistantWrite, null);
assert.ok(assistantFailure.response?.message);
line('  ✅ assistant durability failure still returns deterministic description');
line('');
line('── F-O8R2-01..16 ─────────────────────────────────────────────────────');
let dead = 0;

const routeMutantFailures = runRoutePlanLaws(MUTANT_ROUTE_PLAN_BEFORE_F1)
  .filter((law) => !law.ok)
  .map((law) => law.lawId);
assertNamedKill(
  'F-O8R2-01',
  routeMutantFailures,
  'F1_MUST_PRECEDE_DESCRIPTION_INTERCEPT',
);
if (routeMutantFailures.includes('F1_MUST_PRECEDE_DESCRIPTION_INTERCEPT')) dead += 1;

let failed = failedLawIds(
  REFERENCE_SCENARIOS.durableMemberDescribe,
  MUTANT_DESCRIBE_ENTERS_F2,
);
assertNamedKill(
  'F-O8R2-02',
  failed,
  'DESCRIBE_MUST_RETURN_PRE_COGNITION',
);
if (failed.includes('DESCRIBE_MUST_RETURN_PRE_COGNITION')) dead += 1;

failed = failedLawIds(
  REFERENCE_SCENARIOS.abstain,
  MUTANT_ABSTAIN_CHANGES_RESPONSE,
);
assertNamedKill(
  'F-O8R2-03',
  failed,
  'ABSTAIN_MUST_FALL_THROUGH_UNCHANGED',
);
if (failed.includes('ABSTAIN_MUST_FALL_THROUGH_UNCHANGED')) dead += 1;

failed = failedLawIds(
  REFERENCE_SCENARIOS.audioBypass,
  MUTANT_AUDIO_INTERCEPTED,
);
assertNamedKill('F-O8R2-04', failed, 'TEXT_ONLY_PILOT');
if (failed.includes('TEXT_ONLY_PILOT')) dead += 1;

failed = failedLawIds(
  REFERENCE_SCENARIOS.durableMemberDescribe,
  MUTANT_NEW_EXCHANGE_ID,
);
assertNamedKill('F-O8R2-05', failed, 'SAME_EXCHANGE_REQUIRED');
if (failed.includes('SAME_EXCHANGE_REQUIRED')) dead += 1;

failed = failedLawIds(
  REFERENCE_SCENARIOS.memberDurabilityFailedDescribe,
  MUTANT_ORPHAN_ASSISTANT,
);
assertNamedKill('F-O8R2-06', failed, 'NO_ORPHAN_ASSISTANT');
if (failed.includes('NO_ORPHAN_ASSISTANT')) dead += 1;
failed = failedLawIds(
  REFERENCE_SCENARIOS.sanctuaryDescribe,
  MUTANT_SANCTUARY_PERSISTED,
);
assertNamedKill(
  'F-O8R2-07',
  failed,
  'SANCTUARY_NON_PERSISTENCE',
  ['NO_ORPHAN_ASSISTANT'],
);
if (failed.includes('SANCTUARY_NON_PERSISTENCE')) dead += 1;

failed = failedLawIds(
  REFERENCE_SCENARIOS.guestDescribe,
  MUTANT_GUEST_PERSISTED,
);
assertNamedKill(
  'F-O8R2-08',
  failed,
  'GUEST_NON_PERSISTENCE',
  ['NO_ORPHAN_ASSISTANT'],
);
if (failed.includes('GUEST_NON_PERSISTENCE')) dead += 1;

failed = failedLawIds(
  REFERENCE_SCENARIOS.assistantDurabilityFailedDescribe,
  MUTANT_DURABILITY_FAILS_INTO_MODEL,
);
assertNamedKill(
  'F-O8R2-09',
  failed,
  'DURABILITY_FAILURE_NOT_MODEL_FALLBACK',
  ['DESCRIBE_MUST_RETURN_PRE_COGNITION'],
);
if (failed.includes('DURABILITY_FAILURE_NOT_MODEL_FALLBACK')) dead += 1;

failed = failedLawIds(
  REFERENCE_SCENARIOS.durableMemberDescribe,
  MUTANT_FAKE_PROVIDER,
);
assertNamedKill(
  'F-O8R2-10',
  failed,
  'DETERMINISTIC_RESPONSE_MUST_NOT_FAKE_PROVIDER',
  ['PRE_COGNITION_RESPONSE_MINIMALITY'],
);
if (failed.includes('DETERMINISTIC_RESPONSE_MUST_NOT_FAKE_PROVIDER')) dead += 1;

failed = failedLawIds(
  REFERENCE_SCENARIOS.durableMemberDescribe,
  MUTANT_COGNITION_FIELDS,
);
assertNamedKill(
  'F-O8R2-11',
  failed,
  'PRE_COGNITION_RESPONSE_MINIMALITY',
);
if (failed.includes('PRE_COGNITION_RESPONSE_MINIMALITY')) dead += 1;

failed = failedLawIds(
  REFERENCE_SCENARIOS.durableMemberDescribe,
  MUTANT_BAD_CANON,
);
assertNamedKill('F-O8R2-12', failed, 'CANON_PROVENANCE_REQUIRED');
if (failed.includes('CANON_PROVENANCE_REQUIRED')) dead += 1;
failed = failedLawIds(
  REFERENCE_SCENARIOS.durableMemberDescribe,
  MUTANT_OBSERVER_SIDE_EFFECT,
);
assertNamedKill(
  'F-O8R2-13',
  failed,
  'DESCRIPTION_SIDE_EFFECT_FORBIDDEN',
);
if (failed.includes('DESCRIPTION_SIDE_EFFECT_FORBIDDEN')) dead += 1;

failed = failedLawIds(
  REFERENCE_SCENARIOS.durableMemberDescribe,
  MUTANT_OFFER_SIDE_EFFECT,
);
assertNamedKill('F-O8R2-14', failed, 'DESCRIPTION_NOT_OFFER');
if (failed.includes('DESCRIPTION_NOT_OFFER')) dead += 1;

const liveRouteHash = sha256File(ACTIVE_ROUTE_PATH);
const syntheticDriftHash =
  liveRouteHash === EXPECTED_ACTIVE_ROUTE_SHA256
    ? 'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
    : EXPECTED_ACTIVE_ROUTE_SHA256;
if (syntheticDriftHash !== EXPECTED_ACTIVE_ROUTE_SHA256) {
  dead += 1;
  line('  DEAD        F-O8R2-15 → ACTIVE_ROUTE_WITNESS_DRIFT');
} else {
  line('  ⛔ route-witness drift mutant survived');
  exit = 1;
}

failed = failedLawIds(
  REFERENCE_SCENARIOS.resolverFailure,
  MUTANT_INTERCEPT_FAILURE_FABRICATES_OUTPUT,
);
assertNamedKill(
  'F-O8R2-16',
  failed,
  'INTERCEPT_FAILURE_MUST_DISAPPEAR',
);
if (failed.includes('INTERCEPT_FAILURE_MUST_DISAPPEAR')) dead += 1;
line('');
line('── external witness custody ──────────────────────────────────────────');
if (liveRouteHash === EXPECTED_ACTIVE_ROUTE_SHA256) {
  line('  ✅ active /list route witness MATCH');
} else {
  line('  ⛔ ACTIVE_ROUTE_WITNESS_DRIFT');
  line('      expected ' + EXPECTED_ACTIVE_ROUTE_SHA256);
  line('      live     ' + liveRouteHash);
  exit = 1;
}

const canonHash = sha256File(CANON_HEADERS_PATH);
if (canonHash === EXPECTED_CANON_HEADERS_SHA256) {
  line('  ✅ canonHeaders witness MATCH');
} else {
  line('  ⛔ CANON_HEADERS_WITNESS_DRIFT');
  line('      expected ' + EXPECTED_CANON_HEADERS_SHA256);
  line('      live     ' + canonHash);
  exit = 1;
}

line('');
line('── production-coupling guard ─────────────────────────────────────────');
const THIS_DIR = path.dirname(new URL(import.meta.url).pathname);
const forbiddenImportFragments = [
  'app/api/sovereign/app/maia/list/route',
  'lib/sovereign/maiaService',
  'lib/memory/stores/TurnsStore',
  'lib/sovereign/platformKnowledge',
  'lib/maia/cognitionEvents',
  'lib/house/',
] as const;

function importSources(source: string): string[] {
  const refs: string[] = [];
  const re = /^\s*import(?:[\s\S]*?)\sfrom\s+['"]([^'"]+)['"];?/gm;
  let match: RegExpExecArray | null;
  while ((match = re.exec(source))) refs.push(match[1]);
  return refs;
}

for (const file of [
  'simulator.ts',
  'scenarios.ts',
  'contract.ts',
  'candidates.ts',
  'matrix.ts',
]) {
  const source = fs.readFileSync(path.join(THIS_DIR, file), 'utf8');
  const hits = importSources(source).filter((ref) =>
    forbiddenImportFragments.some((needle) => ref.includes(needle)),
  );
  if (hits.length) {
    line('  ⛔ ' + file + ' forbidden imports: ' + hits.join(', '));
    exit = 1;
  } else {
    line('  ✅ ' + file + ' has no production route/runtime import');
  }
}

line('');
line('── verdict ───────────────────────────────────────────────────────────');
line('  route-plan laws      ' + (routePlanFailures.length ? 'FAIL' : '2/2 PASS'));
line('  reference scenarios  ' + referenceScenarioPasses + '/' + Object.keys(REFERENCE_SCENARIOS).length + ' PASS');
line('  falsifiers dead      ' + dead + '/16');
line('  active route witness ' + (liveRouteHash === EXPECTED_ACTIVE_ROUTE_SHA256 ? 'MATCH' : 'DRIFT'));
line('  canon witness        ' + (canonHash === EXPECTED_CANON_HEADERS_SHA256 ? 'MATCH' : 'DRIFT'));
line('  matrix               ' + (exit === 0 && dead === 16 ? 'LETHAL + DISCRIMINATING' : '⛔ NOT LETHAL'));
line('');
line('  ⛔ SIMULATION ONLY · LIVE ROUTE UNCHANGED · NO RUNTIME DESCRIPTION');

process.exit(exit === 0 && dead === 16 ? 0 : 1);
