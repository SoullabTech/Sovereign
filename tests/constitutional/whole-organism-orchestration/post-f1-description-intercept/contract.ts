import type {
  InterceptScenario,
  InterceptSimulation,
  RouteStage,
  SimulatedResponse,
} from './simulator';

export interface RouteSeamLawResult {
  readonly lawId: string;
  readonly ok: boolean;
  readonly detail: string;
}

const PRE_COGNITION_FORBIDDEN_STAGES: readonly RouteStage[] = [
  'F2',
  'COGNITION',
  'MODEL',
  'OBSERVER',
  'SIGNAL',
  'SHADOW',
  'OFFER',
  'AUDIO',
] as const;

const MINIMAL_RESPONSE_KEYS = ['message', 'metadata', 'route', 'session'].sort();
const MINIMAL_METADATA_KEYS = [
  'processingProfile',
  'processingTimeMs',
  'tierProcessing',
  'voiceRequested',
].sort();
const MINIMAL_ROUTE_KEYS = [
  'endpoint',
  'mode',
  'operational',
  'safeMode',
  'type',
  'voiceEnabled',
].sort();

function result(lawId: string, ok: boolean, detail: string): RouteSeamLawResult {
  return { lawId, ok, detail };
}

function indexOfStage(stages: readonly RouteStage[], stage: RouteStage): number {
  return stages.indexOf(stage);
}

function allSideEffectsZero(sim: InterceptSimulation): boolean {
  return Object.values(sim.sideEffects).every((count) => count === 0);
}

function responseIsMinimal(response: SimulatedResponse | null): boolean {
  if (!response) return false;
  return JSON.stringify(Object.keys(response).sort()) === JSON.stringify(MINIMAL_RESPONSE_KEYS)
    && JSON.stringify(Object.keys(response.metadata).sort()) === JSON.stringify(MINIMAL_METADATA_KEYS)
    && JSON.stringify(Object.keys(response.route).sort()) === JSON.stringify(MINIMAL_ROUTE_KEYS);
}
export function runRoutePlanLaws(
  stages: readonly RouteStage[],
): readonly RouteSeamLawResult[] {
  const f1 = indexOfStage(stages, 'F1_MEMBER_ACCEPTANCE');
  const o8 = indexOfStage(stages, 'O8_RESOLVE');
  const f2 = indexOfStage(stages, 'F2');

  return [
    result(
      'F1_MUST_PRECEDE_DESCRIPTION_INTERCEPT',
      f1 >= 0 && o8 >= 0 && f1 < o8,
      'F1 member acceptance must occur before O8 resolution',
    ),
    result(
      'DESCRIPTION_INTERCEPT_MUST_PRECEDE_F2',
      o8 >= 0 && f2 >= 0 && o8 < f2,
      'O8 resolution belongs before F2 on the normal route plan',
    ),
  ];
}

export function runSimulationLaws(
  scenario: InterceptScenario,
  sim: InterceptSimulation,
): readonly RouteSeamLawResult[] {
  const f1 = indexOfStage(sim.stages, 'F1_MEMBER_ACCEPTANCE');
  const o8 = indexOfStage(sim.stages, 'O8_RESOLVE');
  const hasPreCognitionLeak = PRE_COGNITION_FORBIDDEN_STAGES.some(
    (stage) => sim.stages.includes(stage),
  );

  const describe = sim.branch === 'DESCRIBE';
  const abstain = sim.branch === 'ABSTAIN';
  const audioBypass = sim.branch === 'AUDIO_BYPASS';
  const interceptFailure = sim.branch === 'INTERCEPT_FAILURE';

  return [
    result(
      'F1_MUST_PRECEDE_DESCRIPTION_INTERCEPT',
      audioBypass || (f1 >= 0 && o8 >= 0 && f1 < o8),
      'O8 may not resolve before F1',
    ),
    result(
      'DESCRIBE_MUST_RETURN_PRE_COGNITION',
      !describe || (!hasPreCognitionLeak && sim.stages.includes('EARLY_RETURN')),
      'DESCRIBE must return before F2/cognition/model/observer tail',
    ),
    result(
      'ABSTAIN_MUST_FALL_THROUGH_UNCHANGED',
      !abstain || (
        sim.fallThrough
        && sim.response === null
        && sim.canon === null
        && sim.assistantWrite === null
        && allSideEffectsZero(sim)
      ),
      'ABSTAIN contributes no response, metadata, persistence, or side effects',
    ),
    result(
      'TEXT_ONLY_PILOT',
      !scenario.includeAudio || audioBypass,
      'audio-requested turns must bypass O8',
    ),
    result(
      'SAME_EXCHANGE_REQUIRED',
      !describe
        || !scenario.recognizedMember
        || scenario.sanctuary
        || !scenario.memberTurnDurable
        || !scenario.assistantDurabilitySucceeds
        || sim.assistantWrite?.exchangeId === scenario.exchangeId,
      'durable assistant half must reuse the accepted exchangeId',
    ),
    result(
      'NO_ORPHAN_ASSISTANT',
      !describe || scenario.memberTurnDurable || sim.assistantWrite === null,
      'assistant durability requires a durable member half',
    ),
    result(
      'SANCTUARY_NON_PERSISTENCE',
      !scenario.sanctuary || sim.assistantWrite === null,
      'Sanctuary description must remain non-persistent',
    ),
    result(
      'GUEST_NON_PERSISTENCE',
      scenario.recognizedMember || sim.assistantWrite === null,
      'guest description must not create member-attributed persistence',
    ),
    result(
      'DURABILITY_FAILURE_NOT_MODEL_FALLBACK',
      !describe
        || scenario.assistantDurabilitySucceeds
        || (
          sim.durabilityError
          && !sim.stages.includes('MODEL')
          && sim.sideEffects.model === 0
          && sim.response !== null
        ),
      'assistant durability failure must not invoke a model fallback',
    ),
    result(
      'DETERMINISTIC_RESPONSE_MUST_NOT_FAKE_PROVIDER',
      !describe
        || (
          sim.response !== null
          && !('providerUsed' in sim.response)
          && !('model' in sim.response)
          && !('servingTruth' in sim.response)
        ),
      'deterministic response must not fabricate provider/model serving truth',
    ),
    result(
      'PRE_COGNITION_RESPONSE_MINIMALITY',
      !describe || responseIsMinimal(sim.response),
      'DESCRIBE response contains only client-required deterministic fields',
    ),
    result(
      'CANON_PROVENANCE_REQUIRED',
      !describe
        || (
          sim.canon?.canon === 'v1.1'
          && sim.canon.pipeline === 'direct'
          && sim.canon.source === 'direct'
          && sim.canon.validator === 'none'
          && sim.canon.repair === '0'
          && sim.canon.mode === (scenario.sanctuary ? 'SANCTUARY' : 'STANDARD')
          && !('provider' in sim.canon)
          && !('model' in sim.canon)
        ),
      'DESCRIBE must carry truthful direct Canon provenance',
    ),
    result(
      'DESCRIPTION_SIDE_EFFECT_FORBIDDEN',
      !describe || (
        sim.sideEffects.observer === 0
        && sim.sideEffects.signal === 0
        && sim.sideEffects.shadow === 0
        && sim.sideEffects.memory === 0
        && sim.sideEffects.retrieval === 0
        && sim.sideEffects.audio === 0
      ),
      'DESCRIBE may not enter observer/signal/shadow/memory/retrieval/audio tails',
    ),
    result(
      'DESCRIPTION_NOT_OFFER',
      !describe || sim.sideEffects.offer === 0,
      'DESCRIBE may not enter capability-offer semantics',
    ),
    result(
      'INTERCEPT_FAILURE_MUST_DISAPPEAR',
      !interceptFailure || (
        sim.fallThrough
        && sim.response === null
        && sim.canon === null
        && sim.assistantWrite === null
        && allSideEffectsZero(sim)
      ),
      'resolver/composer failure must leave no O8 response artifact',
    ),
    result(
      'SESSION_INFRA_FAILURE_STAYS_INFRASTRUCTURE',
      sim.branch !== 'SESSION_INFRA_FAILURE'
        || (
          !sim.fallThrough
          && sim.response === null
          && sim.assistantWrite === null
          && allSideEffectsZero(sim)
        ),
      'session infrastructure failure may not fall into cognition/model as recovery',
    ),
  ];
}
