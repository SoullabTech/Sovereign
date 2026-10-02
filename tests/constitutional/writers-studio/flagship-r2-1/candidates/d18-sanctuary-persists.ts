export * from '../contract';
export function sanctuaryDecision(_state: 'ALLOW' | 'FORBID'): any {
  return {
    admitted: false,
    threadCreated: true,
    memberTurnCreated: true,
    actCreated: true,
    receiptCreated: false,
    providerCalled: false,
    assistantTurnCreated: false,
    persistedBeforeDecision: true,
  };
}
