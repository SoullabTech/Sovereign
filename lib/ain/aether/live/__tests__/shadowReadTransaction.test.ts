import { createFixtureLiveSourceReader, executeShadowReadTransaction } from '../shadowReadTransaction';

const grant={
  consentRef:'consent:r3',
  memberRef:'member:fixture',
  scope:'aether_read_once' as const,
  grantedBy:'member' as const,
  granted:true as const,
  purpose:'aether_reflection' as const,
  persistenceAllowed:false as const,
  deliveryAllowed:false as const,
  promptMutationAllowed:false as const,
  productionEscalationAllowed:false as const,
};

const lifecycle={
  consentRef:'consent:r3',
  grantedAt:'2026-09-28T16:00:00-04:00',
  expiresAt:'2026-09-28T17:00:00-04:00',
};

const reader=createFixtureLiveSourceReader([
  {
    sourceRef:'fixture:work:1',
    memberRef:'member:fixture',
    source:'member_authored',
    domain:'work',
    observation:'Work feels more open this week.',
    temporalStanding:'is_being',
    confidence:.81,
  },
  {
    sourceRef:'fixture:bad-member',
    memberRef:'member:other',
    source:'member_authored',
    domain:'work',
    observation:'Wrong member source.',
    temporalStanding:'is_being',
    confidence:.5,
  },
  {
    sourceRef:'fixture:bad-language',
    memberRef:'member:fixture',
    source:'member_authored',
    domain:'work',
    observation:'Your soul wants you to follow this destiny.',
    temporalStanding:'may_become',
    confidence:.9,
  },
]);

function request(sourceRef='fixture:work:1'){
  return {
    transactionRef:'tx:r3',
    sourceRef,
    inputRef:'live-shadow:r3',
    consentGrant:grant,
    consentLifecycle:lifecycle,
    consentUse:{
      memberRef:'member:fixture',
      consentRef:'consent:r3',
      now:'2026-09-28T16:30:00-04:00',
    },
  };
}

describe('AIN-AETHER-LIVE-ADAPTER-01R3 shadow read transaction',()=>{
  test('valid read-once transaction creates shadow and consumes consent atomically',()=>{
    const result=executeShadowReadTransaction(reader,request());
    expect(result.committed).toBe(true);
    expect(result.shadow?.readOnly).toBe(true);
    expect(result.consentConsumed).toBe(true);
    expect(result.consentLifecycleAfter.consumedAt).toBe('2026-09-28T16:30:00-04:00');
    expect(result.sourceRead).toBe(true);
  });

  test('invalid consent reads nothing and consumes nothing',()=>{
    const bad=request();
    bad.consentUse={...bad.consentUse,now:'2026-09-28T17:00:00-04:00'};
    const result=executeShadowReadTransaction(reader,bad);
    expect(result.committed).toBe(false);
    expect(result.sourceRead).toBe(false);
    expect(result.shadow).toBeNull();
    expect(result.consentConsumed).toBe(false);
    expect(result.consentLifecycleAfter).toEqual(result.consentLifecycleBefore);
  });

  test('missing source consumes nothing and returns no shadow',()=>{
    const result=executeShadowReadTransaction(reader,request('fixture:missing'));
    expect(result.committed).toBe(false);
    expect(result.errors).toContain('fixture_source_not_found');
    expect(result.shadow).toBeNull();
    expect(result.consentConsumed).toBe(false);
    expect(result.consentLifecycleAfter).toEqual(result.consentLifecycleBefore);
  });

  test('source member mismatch consumes nothing',()=>{
    const result=executeShadowReadTransaction(reader,request('fixture:bad-member'));
    expect(result.committed).toBe(false);
    expect(result.errors).toContain('source_member_mismatch');
    expect(result.consentConsumed).toBe(false);
    expect(result.consentLifecycleAfter).toEqual(result.consentLifecycleBefore);
  });

  test('shadow admission failure consumes nothing',()=>{
    const result=executeShadowReadTransaction(reader,request('fixture:bad-language'));
    expect(result.committed).toBe(false);
    expect(result.errors).toEqual(expect.arrayContaining([
      'destiny_language_forbidden',
      'soul_language_forbidden',
    ]));
    expect(result.shadow).toBeNull();
    expect(result.consentConsumed).toBe(false);
    expect(result.consentLifecycleAfter).toEqual(result.consentLifecycleBefore);
  });

  test('successful transaction grants no side-effect authority',()=>{
    const result=executeShadowReadTransaction(reader,request());
    expect(result.persistenceAuthorized).toBe(false);
    expect(result.memberFacingDeliveryAuthorized).toBe(false);
    expect(result.maiaPromptMutationAuthorized).toBe(false);
    expect(result.productionAuthority).toBe(false);
  });
});
