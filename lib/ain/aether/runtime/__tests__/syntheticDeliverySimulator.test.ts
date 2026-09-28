import { deriveMemberAetherField } from '../../benchmark/memberField';
import { generateSyntheticReflectionCandidate } from '../syntheticReflectionCandidate';
import { authorizeSyntheticReflectionHandoff } from '../reflectionDeliveryGate';
import { simulateSyntheticDelivery } from '../syntheticDeliverySimulator';

function token(){
  const field=deriveMemberAetherField('synthetic:r7:field',[
    {
      observationRef:'r7:o:work',
      facetRef:'work',
      motif:'A shared movement toward greater openness.',
      temporalStanding:'is_being',
      standing:'member_named',
      qualities:[],
      note:'Work feels more open.',
    },
    {
      observationRef:'r7:o:creative',
      facetRef:'creative',
      motif:'A shared movement toward greater openness.',
      temporalStanding:'is_being',
      standing:'source_observed',
      qualities:[],
      note:'Creative work looks more open.',
    },
  ]);
  const candidate=generateSyntheticReflectionCandidate(field).candidate;
  if(!candidate) throw new Error('candidate generation failed');
  const gated=authorizeSyntheticReflectionHandoff(candidate,{
    authorizationRef:'human-auth:r7',
    candidateRef:candidate.candidateRef,
    actor:'human',
    authorized:true,
    scope:'synthetic_handoff_only',
    note:'Authorize no-op delivery simulation only.',
  });
  if(!gated.token) throw new Error('handoff token missing');
  return gated.token;
}

describe('AIN-AETHER-RUNTIME-01R7 synthetic delivery simulation',()=>{
  test('consumes a valid handoff token into a no-op receipt',()=>{
    const result=simulateSyntheticDelivery(token());
    expect(result.simulated).toBe(true);
    expect(result.receipt?.simulation).toBe('no_op_sink');
    expect(result.receipt?.consumed).toBe(true);
  });

  test('simulation produces no member-facing contact or delivery',()=>{
    const receipt=simulateSyntheticDelivery(token()).receipt!;
    expect(receipt.memberFacingContacted).toBe(false);
    expect(receipt.deliveryExecuted).toBe(false);
    expect(receipt.notificationSent).toBe(false);
  });

  test('simulation produces no persistence, prompt mutation, network effect, or production authority',()=>{
    const receipt=simulateSyntheticDelivery(token()).receipt!;
    expect(receipt.persisted).toBe(false);
    expect(receipt.maiaPromptMutated).toBe(false);
    expect(receipt.networkSideEffect).toBe(false);
    expect(receipt.productionAuthority).toBe(false);
  });

  test('refuses token that already claims member-facing authority',()=>{
    const bad={...token(),memberFacingDeliveryAuthorized:true as false};
    const result=simulateSyntheticDelivery(bad);
    expect(result.simulated).toBe(false);
    expect(result.errors).toContain('member_facing_authority_present');
  });

  test('receipt remains auditable and bound to exact token/candidate',()=>{
    const t=token();
    const receipt=simulateSyntheticDelivery(t).receipt!;
    expect(receipt.tokenRef).toBe(t.tokenRef);
    expect(receipt.candidateRef).toBe(t.candidateRef);
    expect(receipt.auditNote).toMatch(/no-op sink/i);
  });
});
