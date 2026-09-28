import { deriveMemberAetherField } from '../../benchmark/memberField';
import { generateSyntheticReflectionCandidate } from '../syntheticReflectionCandidate';
import { authorizeSyntheticReflectionHandoff } from '../reflectionDeliveryGate';

function candidate(){
  const field=deriveMemberAetherField('synthetic:r6:field',[
    {
      observationRef:'r6:o:work',
      facetRef:'work',
      motif:'A shared movement toward greater openness.',
      temporalStanding:'is_being',
      standing:'member_named',
      qualities:[],
      note:'Work feels more open.',
    },
    {
      observationRef:'r6:o:creative',
      facetRef:'creative',
      motif:'A shared movement toward greater openness.',
      temporalStanding:'is_being',
      standing:'source_observed',
      qualities:[],
      note:'Creative work looks more open.',
    },
  ]);
  const result=generateSyntheticReflectionCandidate(field);
  if(!result.candidate) throw new Error('candidate generation failed');
  return result.candidate;
}

describe('AIN-AETHER-RUNTIME-01R6 reflection delivery gate',()=>{
  test('candidate validity alone cannot authorize handoff',()=>{
    const result=authorizeSyntheticReflectionHandoff(candidate(),null);
    expect(result.gatePassed).toBe(false);
    expect(result.errors).toContain('explicit_human_authorization_required');
    expect(result.candidateValiditySelfAuthorized).toBe(false);
  });

  test('explicit synthetic human authorization creates only a handoff token',()=>{
    const c=candidate();
    const result=authorizeSyntheticReflectionHandoff(c,{
      authorizationRef:'human-auth:r6:1',
      candidateRef:c.candidateRef,
      actor:'human',
      authorized:true,
      scope:'synthetic_handoff_only',
      note:'Authorize synthetic handoff testing only.',
    });
    expect(result.gatePassed).toBe(true);
    expect(result.token?.handoffEligible).toBe(true);
    expect(result.token?.authorizedBy).toBe('human');
    expect(result.token?.scope).toBe('synthetic_handoff_only');
  });

  test('handoff token still does not authorize member-facing delivery',()=>{
    const c=candidate();
    const result=authorizeSyntheticReflectionHandoff(c,{
      authorizationRef:'human-auth:r6:2',
      candidateRef:c.candidateRef,
      actor:'human',
      authorized:true,
      scope:'synthetic_handoff_only',
      note:'Synthetic gate witness.',
    });
    expect(result.memberFacingDeliveryAuthorized).toBe(false);
    expect(result.deliveryExecuted).toBe(false);
    expect(result.persistenceAuthorized).toBe(false);
    expect(result.productionAuthority).toBe(false);
    expect(result.token?.memberFacingDeliveryAuthorized).toBe(false);
    expect(result.token?.deliveryExecuted).toBe(false);
    expect(result.token?.persisted).toBe(false);
    expect(result.token?.maiaPromptMutated).toBe(false);
    expect(result.token?.productionAuthority).toBe(false);
  });

  test('refuses mismatched candidate authorization',()=>{
    const c=candidate();
    const result=authorizeSyntheticReflectionHandoff(c,{
      authorizationRef:'human-auth:r6:bad',
      candidateRef:'wrong-candidate',
      actor:'human',
      authorized:true,
      scope:'synthetic_handoff_only',
      note:'Wrong candidate.',
    });
    expect(result.gatePassed).toBe(false);
    expect(result.errors).toContain('authorization_candidate_mismatch');
  });

  test('refuses human non-authorization',()=>{
    const c=candidate();
    const result=authorizeSyntheticReflectionHandoff(c,{
      authorizationRef:'human-auth:r6:no',
      candidateRef:c.candidateRef,
      actor:'human',
      authorized:false,
      scope:'synthetic_handoff_only',
      note:'Do not authorize.',
    });
    expect(result.gatePassed).toBe(false);
    expect(result.errors).toContain('human_authorization_not_granted');
  });
});
