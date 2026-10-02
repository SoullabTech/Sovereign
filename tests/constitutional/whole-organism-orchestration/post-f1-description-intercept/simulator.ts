import {
  composeResolvedInquiry,
  renderPilotDescription,
  resolveExplicitCapabilityInquiry,
  type ExplicitCapabilityInquiryResolution,
} from '../explicit-capability-inquiry/resolver';

export type RouteStage =
  | 'VALIDATED'
  | 'F1_MEMBER_ACCEPTANCE'
  | 'AUDIO_BYPASS'
  | 'O8_RESOLVE'
  | 'SESSION_INFRA'
  | 'O8_COMPOSE'
  | 'ASSISTANT_DURABILITY'
  | 'EARLY_RETURN'
  | 'F2'
  | 'COGNITION'
  | 'MODEL'
  | 'OBSERVER'
  | 'SIGNAL'
  | 'SHADOW'
  | 'OFFER'
  | 'AUDIO';

export interface InterceptScenario {
  readonly message: string;
  readonly includeAudio: boolean;
  readonly recognizedMember: boolean;
  readonly sanctuary: boolean;
  readonly memberTurnDurable: boolean;
  readonly assistantDurabilitySucceeds: boolean;
  readonly resolverThrows?: boolean;
  readonly composerThrows?: boolean;
  readonly sessionInfraSucceeds?: boolean;
  readonly exchangeId?: string;
  readonly sessionId?: string;
  readonly safeMode?: boolean;
}

export interface SimulatedResponse {
  readonly message: string;
  readonly route: {
    readonly endpoint: '/api/sovereign/app/maia';
    readonly type: 'Sovereign Consciousness Interface';
    readonly operational: true;
    readonly mode: 'capability-description';
    readonly safeMode: boolean;
    readonly voiceEnabled: false;
  };
  readonly session: {
    readonly id: string;
    readonly turns: number;
  };
  readonly metadata: {
    readonly processingProfile: 'DETERMINISTIC_DESCRIPTION';
    readonly processingTimeMs: number;
    readonly tierProcessing: false;
    readonly voiceRequested: false;
  };
}
export interface CanonWitness {
  readonly canon: 'v1.1';
  readonly validator: 'none';
  readonly mode: 'STANDARD' | 'SANCTUARY';
  readonly repair: '0';
  readonly pipeline: 'direct';
  readonly source: 'direct';
  readonly requestId: string;
  readonly provider?: never;
  readonly model?: never;
  readonly fallback?: never;
}

export interface InterceptSimulation {
  readonly branch:
    | 'DESCRIBE'
    | 'ABSTAIN'
    | 'AUDIO_BYPASS'
    | 'INTERCEPT_FAILURE'
    | 'SESSION_INFRA_FAILURE';
  readonly resolution: ExplicitCapabilityInquiryResolution | null;
  readonly stages: readonly RouteStage[];
  readonly fallThrough: boolean;
  readonly response: SimulatedResponse | null;
  readonly canon: CanonWitness | null;
  readonly assistantWrite: null | {
    readonly userId: 'recognized-member';
    readonly sessionId: string;
    readonly role: 'assistant';
    readonly content: string;
    readonly exchangeId: string;
  };
  readonly durabilityError: boolean;
  readonly sideEffects: Readonly<Record<
    | 'cognition'
    | 'model'
    | 'memory'
    | 'retrieval'
    | 'observer'
    | 'signal'
    | 'shadow'
    | 'offer'
    | 'audio',
    number
  >>;
}

export const ROUTE_STAGE_ORDER: readonly RouteStage[] = [
  'VALIDATED',
  'F1_MEMBER_ACCEPTANCE',
  'O8_RESOLVE',
  'F2',
  'COGNITION',
  'MODEL',
] as const;

function zeroSideEffects(): InterceptSimulation['sideEffects'] {
  return {
    cognition: 0,
    model: 0,
    memory: 0,
    retrieval: 0,
    observer: 0,
    signal: 0,
    shadow: 0,
    offer: 0,
    audio: 0,
  };
}
function fallThroughSimulation(
  branch: 'ABSTAIN' | 'AUDIO_BYPASS' | 'INTERCEPT_FAILURE',
  resolution: ExplicitCapabilityInquiryResolution | null,
  stages: readonly RouteStage[],
): InterceptSimulation {
  return {
    branch,
    resolution,
    stages,
    fallThrough: true,
    response: null,
    canon: null,
    assistantWrite: null,
    durabilityError: false,
    sideEffects: zeroSideEffects(),
  };
}

export function simulatePostF1Intercept(
  scenario: InterceptScenario,
): InterceptSimulation {
  const exchangeId = scenario.exchangeId ?? 'exchange-001';
  const sessionId = scenario.sessionId ?? 'session-001';
  const stages: RouteStage[] = ['VALIDATED', 'F1_MEMBER_ACCEPTANCE'];

  if (scenario.includeAudio) {
    stages.push('AUDIO_BYPASS');
    return fallThroughSimulation('AUDIO_BYPASS', null, stages);
  }

  stages.push('O8_RESOLVE');

  let resolution: ExplicitCapabilityInquiryResolution;
  try {
    if (scenario.resolverThrows) throw new Error('SIMULATED_RESOLVER_FAILURE');
    resolution = resolveExplicitCapabilityInquiry(scenario.message);
  } catch {
    return fallThroughSimulation('INTERCEPT_FAILURE', null, stages);
  }

  if (resolution.kind === 'ABSTAIN') {
    return fallThroughSimulation('ABSTAIN', resolution, stages);
  }

  const sessionInfraSucceeds = scenario.sessionInfraSucceeds !== false;
  stages.push('SESSION_INFRA');
  if (!sessionInfraSucceeds) {
    return {
      branch: 'SESSION_INFRA_FAILURE',
      resolution,
      stages,
      fallThrough: false,
      response: null,
      canon: null,
      assistantWrite: null,
      durabilityError: false,
      sideEffects: zeroSideEffects(),
    };
  }

  stages.push('O8_COMPOSE');

  let rendered: string;
  try {
    if (scenario.composerThrows) throw new Error('SIMULATED_COMPOSER_FAILURE');
    const payload = composeResolvedInquiry(resolution);
    if (!payload) throw new Error('DESCRIBE_WITHOUT_PAYLOAD');
    rendered = renderPilotDescription(payload);
  } catch {
    return fallThroughSimulation('INTERCEPT_FAILURE', null, stages);
  }
  let assistantWrite: InterceptSimulation['assistantWrite'] = null;
  let durabilityError = false;

  if (
    scenario.recognizedMember
    && !scenario.sanctuary
    && scenario.memberTurnDurable
  ) {
    stages.push('ASSISTANT_DURABILITY');

    if (scenario.assistantDurabilitySucceeds) {
      assistantWrite = {
        userId: 'recognized-member',
        sessionId,
        role: 'assistant',
        content: rendered,
        exchangeId,
      };
    } else {
      durabilityError = true;
    }
  }

  stages.push('EARLY_RETURN');

  const response: SimulatedResponse = {
    message: rendered,
    route: {
      endpoint: '/api/sovereign/app/maia',
      type: 'Sovereign Consciousness Interface',
      operational: true,
      mode: 'capability-description',
      safeMode: scenario.safeMode ?? false,
      voiceEnabled: false,
    },
    session: {
      id: sessionId,
      turns: 0,
    },
    metadata: {
      processingProfile: 'DETERMINISTIC_DESCRIPTION',
      processingTimeMs: 1,
      tierProcessing: false,
      voiceRequested: false,
    },
  };

  const canon: CanonWitness = {
    canon: 'v1.1',
    validator: 'none',
    mode: scenario.sanctuary ? 'SANCTUARY' : 'STANDARD',
    repair: '0',
    pipeline: 'direct',
    source: 'direct',
    requestId: 'request-001',
  };

  return {
    branch: 'DESCRIBE',
    resolution,
    stages,
    fallThrough: false,
    response,
    canon,
    assistantWrite,
    durabilityError,
    sideEffects: zeroSideEffects(),
  };
}
