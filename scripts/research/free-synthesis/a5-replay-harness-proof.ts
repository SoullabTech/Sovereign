import { strict as assert } from 'node:assert';
import {
  buildA5Conditions,
  preflightA5Conditions,
  runA5Replay,
  type A5ModelCaller,
  type A5ReplayFixture,
} from './a5-replay-harness';
import {
  SILVER_CEDAR_POSITIVE_GESTALT_ID,
  silverCedarField,
} from './a4-silver-cedar-trace';

/**
 * Mechanical A5 proof only.
 *
 * The fixture uses the real A4 Silver Cedar field and historical probe, but the two
 * standing-direction strings and recent-context string below are synthetic placeholders.
 * Therefore this proves harness law, not a replay result and not the A/B baseline binding.
 */

const fixture: A5ReplayFixture = {
  benchmarkId: 'A2:SILVER-CEDAR:HARNESS-PROOF',
  incomingMemberTurn: 'do you remember me saying the something about a silver Cedar',
  currentSystemDirection: [
    'SYNTHETIC CURRENT-DIRECTION PLACEHOLDER FOR HARNESS PROOF ONLY.',
    'Follow a standing conversational response choreography.',
  ].join('\n'),
  reducedSystemDirection: [
    'SYNTHETIC REDUCED-DIRECTION PLACEHOLDER FOR HARNESS PROOF ONLY.',
    'Preserve source standing, provisionality, member correction, honest absence and revisability.',
  ].join('\n'),
  sharedRecentContext: [
    'SYNTHETIC RECENT-CONTEXT PLACEHOLDER FOR HARNESS PROOF ONLY.',
    'The actual A5 replay must bind the frozen session window before a real model call.',
  ].join('\n'),
  field: silverCedarField,
  gestaltId: SILVER_CEDAR_POSITIVE_GESTALT_ID,
  model: {
    provider: 'research-mock',
    model: 'fixed-model-v1',
    temperature: 0,
    maxTokens: 256,
  },
};

const conditions = buildA5Conditions(fixture);
const preflight = preflightA5Conditions(conditions);

assert.equal(preflight.ok, true);
assert.equal(preflight.conditionCount, 4);
assert.equal(preflight.sameIncomingTurn, true);
assert.equal(preflight.sameModelSpec, true);
assert.equal(preflight.distinctConditionContexts, true);
assert.equal(preflight.narrativeRelationalEvidenceIdentical, true);

const narrative = conditions.find((condition) => condition.id === 'compact_narrative_gestalt')!;
const relational = conditions.find((condition) => condition.id === 'relational_structure_gestalt')!;
assert.equal(narrative.evidenceRootIds?.length, 14);
assert.deepEqual(narrative.evidenceRootIds, relational.evidenceRootIds);
assert.equal(narrative.evidenceLedgerDigest, relational.evidenceLedgerDigest);
assert.notEqual(narrative.contextDigest, relational.contextDigest);

const caller: A5ModelCaller = async ({ conditionId, model }) => ({
  text: `opaque-output-for-${conditionId}`,
  provider: model.provider,
  model: model.model,
  latencyMs: 1,
  usage: { inputTokens: 10, outputTokens: 5, totalTokens: 15 },
});

const results = await runA5Replay(fixture, caller, [
  'relational_structure_gestalt',
  'current_context',
  'compact_narrative_gestalt',
  'reduced_direction',
]);
assert.equal(results.length, 4);
assert.deepEqual(results.map((result) => result.conditionId), [
  'relational_structure_gestalt',
  'current_context',
  'compact_narrative_gestalt',
  'reduced_direction',
]);
assert.equal(new Set(results.map((result) => result.model)).size, 1);
assert.equal(new Set(results.map((result) => result.provider)).size, 1);

const wrongModelCaller: A5ModelCaller = async () => ({
  text: 'wrong-model-output',
  provider: 'research-mock',
  model: 'different-model-v2',
  latencyMs: 1,
});
await assert.rejects(() => runA5Replay(fixture, wrongModelCaller), /same-model violation/);

console.log(JSON.stringify({
  proof: 'JARVIS-MAIA-FREE-SYNTHESIS-01 A5 replay harness',
  status: 'PASS',
  fourConditions: true,
  sameIncomingTurn: preflight.sameIncomingTurn,
  sameModelSpec: preflight.sameModelSpec,
  narrativeRelationalEvidenceIdentical: preflight.narrativeRelationalEvidenceIdentical,
  narrativeRelationalEvidenceRoots: narrative.evidenceRootIds?.length,
  modelFallbackRefused: true,
  dbImports: 0,
  servingImports: 0,
  realModelCalls: 0,
  baselineBinding: 'UNSPENT — synthetic direction/recent-context placeholders only',
}, null, 2));
