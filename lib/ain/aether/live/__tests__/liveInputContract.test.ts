import { admitLiveInputToShadow } from '../liveInputContract';

const consent={
  consentRef:'consent:1',
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

const input={
  inputRef:'live-fixture:1',
  memberRef:'member:fixture',
  source:'member_authored' as const,
  domain:'work',
  observation:'Work feels more open this week.',
  temporalStanding:'is_being' as const,
  confidence:.81,
  consentRef:'consent:1',
};

describe('AIN-AETHER-LIVE-ADAPTER-01R1 live input contract',()=>{
  test('admits consent-bound live-shaped fixture only into read-only shadow',()=>{
    const result=admitLiveInputToShadow(input,consent);
    expect(result.admitted).toBe(true);
    expect(result.shadow?.readOnly).toBe(true);
    expect(result.shadow?.finalMeaningAuthority).toBe('member');
    expect(result.shadow?.persisted).toBe(false);
    expect(result.shadow?.delivered).toBe(false);
  });

  test('refuses missing or mismatched consent',()=>{
    expect(admitLiveInputToShadow(input,null).errors).toContain('live_consent_required');

    const mismatch=admitLiveInputToShadow(input,{...consent,memberRef:'member:other'});
    expect(mismatch.admitted).toBe(false);
    expect(mismatch.errors).toContain('consent_member_mismatch');
  });

  test('refuses consent scopes that authorize side effects',()=>{
    const broad=admitLiveInputToShadow(input,{
      ...consent,
      persistenceAllowed:true as false,
      deliveryAllowed:true as false,
    });
    expect(broad.admitted).toBe(false);
    expect(broad.errors).toEqual(expect.arrayContaining([
      'consent_persistence_scope_too_broad',
      'consent_delivery_scope_too_broad',
    ]));
  });

  test('refuses authority flags and authority-smuggling language',()=>{
    const result=admitLiveInputToShadow({
      ...input,
      observation:'Your soul wants you to follow this destiny.',
      predictiveAuthority:true,
      destinyAuthority:true,
      soulRepresentationAuthority:true,
      persistenceAuthority:true,
      deliveryAuthority:true,
      promptMutationAuthority:true,
      productionAuthority:true,
      finalMeaningAuthority:'system',
    },consent);
    expect(result.admitted).toBe(false);
    expect(result.errors).toEqual(expect.arrayContaining([
      'predictive_authority_forbidden',
      'destiny_authority_forbidden',
      'soul_representation_authority_forbidden',
      'persistence_authority_forbidden',
      'delivery_authority_forbidden',
      'prompt_mutation_authority_forbidden',
      'production_authority_forbidden',
      'final_meaning_must_remain_member_owned',
      'destiny_language_forbidden',
      'soul_language_forbidden',
    ]));
  });

  test('admission never authorizes persistence, delivery, prompt mutation, or production',()=>{
    const result=admitLiveInputToShadow(input,consent);
    expect(result.persistenceAuthorized).toBe(false);
    expect(result.memberFacingDeliveryAuthorized).toBe(false);
    expect(result.maiaPromptMutationAuthorized).toBe(false);
    expect(result.productionAuthority).toBe(false);
  });
});
