import type { AetherConnectorQueryPlan } from '../../connector/queryPlan';
import {
  createHumanQueryPlanReview,
  fingerprintQueryPlan,
} from '../../connector/planReviewCustody';
import { issueExecutionToken } from '../../connector/executionToken';
import { executeOneLocalFixtureRecord } from '../localFixtureExecutor';
import { adaptFixtureExecutionToLiveShadow } from '../fixtureRecordShadowAdapter';

function plan():AetherConnectorQueryPlan{
  return {
    queryRef:'query:executor:r2',
    connectorRef:'connector:executor:r2',
    manifestRef:'manifest:executor:r2',
    memberRef:'member:fixture',
    consentRef:'consent:executor:r2',
    sourceClass:'member_authored_text',
    fields:['recordRef','memberRef','text','createdAt','domain'],
    startTime:'2026-09-01T00:00:00-04:00',
    endTime:'2026-09-29T00:00:00-04:00',
    maxRecords:1,
    wildcard:false,
    paginationAllowed:false,
    execute:false,
  };
}

function execution(){
  const p=plan();
  const review=createHumanQueryPlanReview('review:executor:r2',p,true,'Exact fixture plan reviewed.');
  const issued=issueExecutionToken(p,review,{
    authorizationRef:'exec-auth:executor:r2',
    actor:'human',
    queryRef:p.queryRef,
    fingerprint:fingerprintQueryPlan(p),
    authorized:true,
    issuedAt:'2026-09-28T18:00:00-04:00',
    expiresAt:'2026-09-28T20:00:00-04:00',
    note:'Authorize one local fixture record read.',
  });
  if(!issued.token) throw new Error('token not issued');

  return executeOneLocalFixtureRecord({
    transportRef:'transport:fixture:r2',
    transportKind:'local_fixture_only',
    productionReachable:false,
    networkEnabled:false,
    records:[{
      recordRef:'fixture-record:r2',
      memberRef:'member:fixture',
      text:'A local fixture observation.',
      createdAt:'2026-09-28T12:00:00-04:00',
      domain:'work',
    }],
  },issued.token,p,'2026-09-28T18:30:00-04:00');
}

const consent={
  consentRef:'consent:executor:r2',
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

const binding={
  bindingRef:'binding:executor:r2',
  consentRef:'consent:executor:r2',
  source:'member_authored' as const,
  temporalStanding:'has_been' as const,
  confidence:.8,
};

describe('AIN-AETHER-EXECUTOR-01R2 fixture record shadow adapter',()=>{
  test('admits successful local fixture record into frozen live-shadow membrane',()=>{
    const result=adaptFixtureExecutionToLiveShadow(execution(),binding,consent);
    expect(result.adapted).toBe(true);
    expect(result.admission?.admitted).toBe(true);
    expect(result.sourceRecordRef).toBe('fixture-record:r2');
  });

  test('preserves record-owned and binding-owned values exactly',()=>{
    const result=adaptFixtureExecutionToLiveShadow(execution(),binding,consent);
    expect(result.memberRefPreserved).toBe(true);
    expect(result.domainPreserved).toBe(true);
    expect(result.observationPreserved).toBe(true);
    expect(result.sourceStandingPreserved).toBe(true);
    expect(result.temporalStandingPreserved).toBe(true);
    expect(result.confidencePreserved).toBe(true);
    expect(result.consentRefPreserved).toBe(true);
  });

  test('refuses consent-binding mismatch',()=>{
    const result=adaptFixtureExecutionToLiveShadow(execution(),{
      ...binding,
      consentRef:'consent:wrong',
    },consent);
    expect(result.adapted).toBe(false);
    expect(result.errors).toContain('binding_consent_ref_mismatch');
  });

  test('frozen live-shadow membrane still rejects authority language',()=>{
    const ex=execution();
    if(!ex.record) throw new Error('fixture execution failed');
    ex.record.text='Your soul wants this outcome.';
    const result=adaptFixtureExecutionToLiveShadow(ex,binding,consent);
    expect(result.adapted).toBe(false);
    expect(result.errors).toContain('soul_language_forbidden');
  });

  test('adapter creates no persistence, delivery, MAIA mutation, or production authority',()=>{
    const result=adaptFixtureExecutionToLiveShadow(execution(),binding,consent);
    expect(result.persisted).toBe(false);
    expect(result.memberFacingDelivery).toBe(false);
    expect(result.maiaPromptMutated).toBe(false);
    expect(result.productionAuthority).toBe(false);
    expect(result.admission?.persistenceAuthorized).toBe(false);
    expect(result.admission?.memberFacingDeliveryAuthorized).toBe(false);
    expect(result.admission?.maiaPromptMutationAuthorized).toBe(false);
    expect(result.admission?.productionAuthority).toBe(false);
  });
});
