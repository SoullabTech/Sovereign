import { adjudicateCandidateAetherEvent } from '../candidateEventEnvelope';

describe('AIN-AETHER-RUNTIME-01R2 synthetic candidate event envelope',()=>{
  test('admits a minimal synthetic member-authored observation',()=>{
    const result=adjudicateCandidateAetherEvent({
      eventRef:'synthetic:event:1',
      synthetic:true,
      source:'synthetic_member_authored',
      domain:'work',
      observation:'Work feels more open and experimental this week.',
      temporalStanding:'is_being',
      confidence:.8,
      consent:'explicit_synthetic_consent',
    });
    expect(result.admitted).toBe(true);
    expect(result.event?.finalMeaningAuthority).toBe('member');
    expect(result.liveMemberDataAuthorized).toBe(false);
    expect(result.persistenceAuthorized).toBe(false);
  });

  test('refuses non-synthetic event and absent consent',()=>{
    const result=adjudicateCandidateAetherEvent({
      eventRef:'event:live-ish',
      synthetic:false,
      source:'synthetic_system_observed',
      domain:'relationship',
      observation:'A relation was observed.',
      temporalStanding:'is_being',
      confidence:.6,
      consent:'absent',
    });
    expect(result.admitted).toBe(false);
    expect(result.errors).toContain('live_or_non_synthetic_event_not_authorized');
    expect(result.errors).toContain('consent_absent');
  });

  test('refuses authority flags carried in the payload',()=>{
    const result=adjudicateCandidateAetherEvent({
      eventRef:'synthetic:event:authority',
      synthetic:true,
      source:'synthetic_system_observed',
      domain:'creative',
      observation:'Creative activity increased.',
      temporalStanding:'is_being',
      confidence:.9,
      consent:'explicit_synthetic_consent',
      identityAuthority:true,
      diagnosticAuthority:true,
      predictiveAuthority:true,
      destinyAuthority:true,
      soulRepresentationAuthority:true,
      persistenceAuthority:true,
      finalMeaningAuthority:'system',
    });
    expect(result.admitted).toBe(false);
    expect(result.errors).toEqual(expect.arrayContaining([
      'identity_authority_forbidden',
      'diagnostic_authority_forbidden',
      'predictive_authority_forbidden',
      'destiny_authority_forbidden',
      'soul_representation_authority_forbidden',
      'persistence_authority_forbidden',
      'final_meaning_must_remain_member_owned',
    ]));
  });

  test('refuses identity, diagnosis, destiny, and Soul claims in observation text',()=>{
    const bad=[
      'You are finally your true self.',
      'This diagnosis shows you meet criteria for something.',
      'You are destined to follow this path.',
      'Your soul wants you to leave.',
    ];
    for(const [i,observation] of bad.entries()){
      const result=adjudicateCandidateAetherEvent({
        eventRef:'synthetic:bad:'+i,
        synthetic:true,
        source:'synthetic_member_authored',
        domain:'other',
        observation,
        temporalStanding:'unknown',
        confidence:.5,
        consent:'explicit_synthetic_consent',
      });
      expect(result.admitted).toBe(false);
    }
  });

  test('refuses malformed confidence and empty required fields',()=>{
    const result=adjudicateCandidateAetherEvent({
      eventRef:' ',
      synthetic:true,
      source:'synthetic_imported',
      domain:' ',
      observation:' ',
      temporalStanding:'unknown',
      confidence:1.5,
      consent:'explicit_synthetic_consent',
    });
    expect(result.admitted).toBe(false);
    expect(result.errors).toEqual(expect.arrayContaining([
      'event_ref_required',
      'domain_required',
      'observation_required',
      'confidence_out_of_range',
    ]));
  });
});
