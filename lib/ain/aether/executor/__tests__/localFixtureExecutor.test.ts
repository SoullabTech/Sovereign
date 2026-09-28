import type { AetherConnectorQueryPlan } from '../../connector/queryPlan';
import {
  createHumanQueryPlanReview,
  fingerprintQueryPlan,
} from '../../connector/planReviewCustody';
import { issueExecutionToken } from '../../connector/executionToken';
import { executeOneLocalFixtureRecord } from '../localFixtureExecutor';

function plan(maxRecords=1):AetherConnectorQueryPlan{
  return {
    queryRef:'query:executor:r1',
    connectorRef:'connector:executor:r1',
    manifestRef:'manifest:executor:r1',
    memberRef:'member:fixture',
    consentRef:'consent:executor:r1',
    sourceClass:'member_authored_text',
    fields:['recordRef','memberRef','text','createdAt','domain'],
    startTime:'2026-09-01T00:00:00-04:00',
    endTime:'2026-09-29T00:00:00-04:00',
    maxRecords,
    wildcard:false,
    paginationAllowed:false,
    execute:false,
  };
}

function token(p:AetherConnectorQueryPlan){
  const review=createHumanQueryPlanReview('review:executor:r1',p,true,'Exact fixture plan reviewed.');
  const issued=issueExecutionToken(p,review,{
    authorizationRef:'exec-auth:executor:r1',
    actor:'human',
    queryRef:p.queryRef,
    fingerprint:fingerprintQueryPlan(p),
    authorized:true,
    issuedAt:'2026-09-28T18:00:00-04:00',
    expiresAt:'2026-09-28T19:00:00-04:00',
    note:'Authorize one local fixture record read.',
  });
  if(!issued.token) throw new Error('token not issued');
  return issued.token;
}

const transport={
  transportRef:'transport:fixture:r1',
  transportKind:'local_fixture_only' as const,
  productionReachable:false as const,
  networkEnabled:false as const,
  records:[
    {
      recordRef:'fixture-record:1',
      memberRef:'member:fixture',
      text:'A local fixture observation.',
      createdAt:'2026-09-28T12:00:00-04:00',
      domain:'work',
    },
  ],
};

describe('AIN-AETHER-EXECUTOR-01R1 local fixture executor',()=>{
  test('reads exactly one local fixture record and consumes token',()=>{
    const p=plan();
    const result=executeOneLocalFixtureRecord(
      transport,
      token(p),
      p,
      '2026-09-28T18:30:00-04:00',
    );
    expect(result.executed).toBe(true);
    expect(result.record?.recordRef).toBe('fixture-record:1');
    expect(result.consumedToken?.consumed).toBe(true);
    expect(result.consumedToken?.executionEligible).toBe(false);
    expect(result.receipt?.recordCountRead).toBe(1);
  });

  test('refuses plan cardinality above one',()=>{
    const p=plan(2);
    const result=executeOneLocalFixtureRecord(
      transport,
      token(p),
      p,
      '2026-09-28T18:30:00-04:00',
    );
    expect(result.executed).toBe(false);
    expect(result.errors).toContain('executor_r1_requires_max_records_1');
  });

  test('refuses token fingerprint drift before fixture IO',()=>{
    const p=plan();
    const t=token(p);
    const drifted={...p,endTime:'2026-10-01T00:00:00-04:00'};
    const result=executeOneLocalFixtureRecord(
      transport,
      t,
      drifted,
      '2026-09-28T18:30:00-04:00',
    );
    expect(result.executed).toBe(false);
    expect(result.errors).toContain('token:token_fingerprint_mismatch');
    expect(result.record).toBeNull();
  });

  test('reads no record for wrong member',()=>{
    const p={...plan(),memberRef:'member:other'};
    const t=token(p);
    const result=executeOneLocalFixtureRecord(
      transport,
      t,
      p,
      '2026-09-28T18:30:00-04:00',
    );
    expect(result.executed).toBe(false);
    expect(result.errors).toContain('fixture_record_not_found');
    expect(result.consumedToken).toBeNull();
  });

  test('successful fixture read has zero network and zero side effects',()=>{
    const p=plan();
    const result=executeOneLocalFixtureRecord(
      transport,
      token(p),
      p,
      '2026-09-28T18:30:00-04:00',
    );
    const receipt=result.receipt!;
    expect(receipt.connectorIoAttempted).toBe(true);
    expect(receipt.externalNetworkCall).toBe(false);
    expect(receipt.productionReachable).toBe(false);
    expect(receipt.persisted).toBe(false);
    expect(receipt.memberFacingDelivery).toBe(false);
    expect(receipt.maiaPromptMutated).toBe(false);
    expect(receipt.productionAuthority).toBe(false);
  });

  test('expired token is refused before fixture IO',()=>{
    const p=plan();
    const result=executeOneLocalFixtureRecord(
      transport,
      token(p),
      p,
      '2026-09-28T19:00:00-04:00',
    );
    expect(result.executed).toBe(false);
    expect(result.errors).toContain('token:token_expired');
    expect(result.record).toBeNull();
  });
});
