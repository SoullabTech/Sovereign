import {
  ROUTE_STAGE_ORDER,
  simulatePostF1Intercept,
  type InterceptSimulation,
  type RouteStage,
} from './simulator';
import { REFERENCE_SCENARIOS } from './scenarios';

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

export const MUTANT_ROUTE_PLAN_BEFORE_F1: readonly RouteStage[] = [
  'VALIDATED',
  'O8_RESOLVE',
  'F1_MEMBER_ACCEPTANCE',
  'F2',
  'COGNITION',
  'MODEL',
] as const;

export const MUTANT_DESCRIBE_ENTERS_F2 = (() => {
  const sim = clone(
    simulatePostF1Intercept(REFERENCE_SCENARIOS.durableMemberDescribe),
  ) as any;
  sim.stages.splice(sim.stages.indexOf('EARLY_RETURN'), 0, 'F2', 'COGNITION');
  sim.sideEffects.cognition = 1;
  return sim as InterceptSimulation;
})();

export const MUTANT_ABSTAIN_CHANGES_RESPONSE = (() => {
  const sim = clone(simulatePostF1Intercept(REFERENCE_SCENARIOS.abstain)) as any;
  sim.response = {
    message: 'fallback',
    route: {},
    session: {},
    metadata: {},
  };
  return sim as InterceptSimulation;
})();

export const MUTANT_AUDIO_INTERCEPTED = (() => {
  const sim = clone(
    simulatePostF1Intercept(REFERENCE_SCENARIOS.durableMemberDescribe),
  ) as any;
  sim.branch = 'DESCRIBE';
  return sim as InterceptSimulation;
})();

export const MUTANT_NEW_EXCHANGE_ID = (() => {
  const sim = clone(
    simulatePostF1Intercept(REFERENCE_SCENARIOS.durableMemberDescribe),
  ) as any;
  sim.assistantWrite.exchangeId = 'different-exchange';
  return sim as InterceptSimulation;
})();

export const MUTANT_ORPHAN_ASSISTANT = (() => {
  const sim = clone(
    simulatePostF1Intercept(REFERENCE_SCENARIOS.memberDurabilityFailedDescribe),
  ) as any;
  sim.assistantWrite = {
    userId: 'recognized-member',
    sessionId: 'session-001',
    role: 'assistant',
    content: sim.response.message,
    exchangeId: 'exchange-001',
  };
  return sim as InterceptSimulation;
})();

export const MUTANT_SANCTUARY_PERSISTED = (() => {
  const sim = clone(
    simulatePostF1Intercept(REFERENCE_SCENARIOS.sanctuaryDescribe),
  ) as any;
  sim.assistantWrite = {
    userId: 'recognized-member',
    sessionId: 'session-001',
    role: 'assistant',
    content: sim.response.message,
    exchangeId: 'exchange-001',
  };
  return sim as InterceptSimulation;
})();

export const MUTANT_GUEST_PERSISTED = (() => {
  const sim = clone(
    simulatePostF1Intercept(REFERENCE_SCENARIOS.guestDescribe),
  ) as any;
  sim.assistantWrite = {
    userId: 'recognized-member',
    sessionId: 'session-001',
    role: 'assistant',
    content: sim.response.message,
    exchangeId: 'exchange-001',
  };
  return sim as InterceptSimulation;
})();

export const MUTANT_DURABILITY_FAILS_INTO_MODEL = (() => {
  const sim = clone(
    simulatePostF1Intercept(
      REFERENCE_SCENARIOS.assistantDurabilityFailedDescribe,
    ),
  ) as any;
  sim.stages.push('MODEL');
  sim.sideEffects.model = 1;
  return sim as InterceptSimulation;
})();

export const MUTANT_FAKE_PROVIDER = (() => {
  const sim = clone(
    simulatePostF1Intercept(REFERENCE_SCENARIOS.durableMemberDescribe),
  ) as any;
  sim.response.providerUsed = 'anthropic';
  sim.response.model = 'fake-model';
  return sim as InterceptSimulation;
})();

export const MUTANT_COGNITION_FIELDS = (() => {
  const sim = clone(
    simulatePostF1Intercept(REFERENCE_SCENARIOS.durableMemberDescribe),
  ) as any;
  sim.response.stateVector = { element: 'fire' };
  sim.response.ainState = { sourceMix: [] };
  sim.response.memoryHealth = { healthy: true };
  return sim as InterceptSimulation;
})();

export const MUTANT_BAD_CANON = (() => {
  const sim = clone(
    simulatePostF1Intercept(REFERENCE_SCENARIOS.durableMemberDescribe),
  ) as any;
  sim.canon.pipeline = 'sovereign.getMaiaResponse';
  sim.canon.source = 'pfi_full';
  sim.canon.provider = 'anthropic';
  return sim as InterceptSimulation;
})();

export const MUTANT_OBSERVER_SIDE_EFFECT = (() => {
  const sim = clone(
    simulatePostF1Intercept(REFERENCE_SCENARIOS.durableMemberDescribe),
  ) as any;
  sim.sideEffects.observer = 1;
  sim.sideEffects.signal = 1;
  sim.sideEffects.shadow = 1;
  return sim as InterceptSimulation;
})();

export const MUTANT_OFFER_SIDE_EFFECT = (() => {
  const sim = clone(
    simulatePostF1Intercept(REFERENCE_SCENARIOS.durableMemberDescribe),
  ) as any;
  sim.sideEffects.offer = 1;
  return sim as InterceptSimulation;
})();

export const MUTANT_INTERCEPT_FAILURE_FABRICATES_OUTPUT = (() => {
  const sim = clone(
    simulatePostF1Intercept(REFERENCE_SCENARIOS.resolverFailure),
  ) as any;
  sim.fallThrough = false;
  sim.response = {
    message: 'fabricated O8 fallback',
    route: {},
    session: {},
    metadata: {},
  };
  return sim as InterceptSimulation;
})();

export const EXPECTED_ROUTE_PLAN = ROUTE_STAGE_ORDER;
