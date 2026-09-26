import type { InterceptScenario } from './simulator';

const BASE: InterceptScenario = {
  message: 'What is New Journal Entry?',
  includeAudio: false,
  recognizedMember: true,
  sanctuary: false,
  memberTurnDurable: true,
  assistantDurabilitySucceeds: true,
  exchangeId: 'exchange-001',
  sessionId: 'session-001',
  safeMode: false,
};

export const REFERENCE_SCENARIOS = {
  durableMemberDescribe: { ...BASE },
  memberDurabilityFailedDescribe: {
    ...BASE,
    memberTurnDurable: false,
  },
  assistantDurabilityFailedDescribe: {
    ...BASE,
    assistantDurabilitySucceeds: false,
  },
  sanctuaryDescribe: {
    ...BASE,
    sanctuary: true,
    memberTurnDurable: false,
  },
  guestDescribe: {
    ...BASE,
    recognizedMember: false,
    memberTurnDurable: false,
  },
  audioBypass: {
    ...BASE,
    includeAudio: true,
  },
  abstain: {
    ...BASE,
    message: 'I had a dream.',
  },
  resolverFailure: {
    ...BASE,
    resolverThrows: true,
  },
  composerFailure: {
    ...BASE,
    composerThrows: true,
  },
  sessionInfrastructureFailure: {
    ...BASE,
    sessionInfraSucceeds: false,
  },
} as const satisfies Readonly<Record<string, InterceptScenario>>;
