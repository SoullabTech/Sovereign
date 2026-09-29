import type { AetherConnectorQueryPlan } from '../connector/queryPlan';
import { createHumanQueryPlanReview, fingerprintQueryPlan } from '../connector/planReviewCustody';
import { issueExecutionToken } from '../connector/executionToken';
import { executeOneLocalFixtureRecord } from './localFixtureExecutor';
import { adaptFixtureExecutionToLiveShadow } from './fixtureRecordShadowAdapter';
import { replayExecutorOriginShadows } from './executorOriginRuntimeReplay';

export interface ExecutorClosureInvariant {
  invariantRef:string;
  description:string;
  pass:boolean;
  evidence:string[];
}

export interface ExecutorProgrammeClosure {
  parentR3:string;
  invariants:ExecutorClosureInvariant[];
  allPass:boolean;
  contradictionRefs:string[];
  standing:'closed_for_isolated_executor_scope'|'open_due_to_contradiction';
  productionReachable:false;
  externalNetworkCall:false;
  persistenceAuthorized:false;
  memberFacingDeliveryAuthorized:false;
  maiaPromptMutationAuthorized:false;
  productionAuthority:false;
}

function plan(domain:string,queryRef:string):AetherConnectorQueryPlan{
  return {
    queryRef,
    connectorRef:'connector:executor:r4',
    manifestRef:'manifest:executor:r4',
    memberRef:'member:fixture',
    consentRef:'consent:executor:r4',
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

function runOne(domain:string,recordRef:string){
  const p=plan(domain,'query:executor:r4:'+domain);
  const review=createHumanQueryPlanReview(
    'review:executor:r4:'+domain,
    p,
    true,
    'Exact max-1 fixture plan reviewed.',
  );
  const issued=issueExecutionToken(p,review,{
    authorizationRef:'exec-auth:executor:r4:'+domain,
    actor:'human',
    queryRef:p.queryRef,
    fingerprint:fingerprintQueryPlan(p),
    authorized:true,
    issuedAt:'2026-09-28T20:00:00-04:00',
    expiresAt:'2026-09-28T21:00:00-04:00',
    note:'Authorize one isolated local fixture read.',
  });

  if(!issued.token) throw new Error('executor_r4_token_not_issued:'+domain);

  const execution=executeOneLocalFixtureRecord({
    transportRef:'transport:executor:r4:'+domain,
    transportKind:'local_fixture_only',
    productionReachable:false,
    networkEnabled:false,
    records:[{
      recordRef,
      memberRef:'member:fixture',
      text:'A shared movement toward greater openness.',
      createdAt:'2026-09-28T12:00:00-04:00',
      domain,
    }],
  },issued.token,p,'2026-09-28T20:30:00-04:00');

  const consent={
    consentRef:'consent:executor:r4',
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

  const adapted=adaptFixtureExecutionToLiveShadow(execution,{
    bindingRef:'binding:executor:r4:'+domain,
    consentRef:consent.consentRef,
    source:'member_authored',
    temporalStanding:'is_being',
    confidence:.8,
  },consent);

  if(!adapted.admission?.shadow||!execution.receipt){
    throw new Error('executor_r4_shadow_not_admitted:'+domain);
  }

  return {p,execution,adapted,shadow:adapted.admission.shadow};
}

export function runExecutorProgrammeClosure():ExecutorProgrammeClosure{
  const work=runOne('work','record:r4:work');
  const creative=runOne('creative','record:r4:creative');

  const replay=replayExecutorOriginShadows('executor-r4:closure',[
    {
      shadow:work.shadow,
      origin:{
        recordRef:work.execution.record!.recordRef,
        executorReceiptRef:work.execution.receipt!.receiptRef,
        transportRef:work.execution.receipt!.transportRef,
        transportKind:'local_fixture_only',
        externalNetworkCall:false,
        productionReachable:false,
      },
    },
    {
      shadow:creative.shadow,
      origin:{
        recordRef:creative.execution.record!.recordRef,
        executorReceiptRef:creative.execution.receipt!.receiptRef,
        transportRef:creative.execution.receipt!.transportRef,
        transportKind:'local_fixture_only',
        externalNetworkCall:false,
        productionReachable:false,
      },
    },
  ]);

  const invariants:ExecutorClosureInvariant[]=[
    {
      invariantRef:'EXEC-INV-01',
      description:'Each executor read is max-one, local-fixture-only, token-bound, and network-isolated.',
      pass:[work,creative].every(x=>
        x.execution.executed===true &&
        x.execution.receipt?.recordCountRead===1 &&
        x.execution.receipt?.transportKind==='local_fixture_only' &&
        x.execution.receipt?.externalNetworkCall===false &&
        x.execution.receipt?.productionReachable===false &&
        x.execution.consumedToken?.consumed===true &&
        x.execution.consumedToken?.executionEligible===false
      ),
      evidence:['R1 controlled fixture executor'],
    },
    {
      invariantRef:'EXEC-INV-02',
      description:'Executor output crosses the frozen live-shadow membrane with exact value preservation and no authority gain.',
      pass:[work,creative].every(x=>
        x.adapted.adapted===true &&
        x.adapted.memberRefPreserved===true &&
        x.adapted.domainPreserved===true &&
        x.adapted.observationPreserved===true &&
        x.adapted.sourceStandingPreserved===true &&
        x.adapted.temporalStandingPreserved===true &&
        x.adapted.confidencePreserved===true &&
        x.adapted.consentRefPreserved===true &&
        x.adapted.persisted===false &&
        x.adapted.memberFacingDelivery===false &&
        x.adapted.maiaPromptMutated===false &&
        x.adapted.productionAuthority===false
      ),
      evidence:['R2 fixture record shadow adapter'],
    },
    {
      invariantRef:'EXEC-INV-03',
      description:'Executor-origin shadows traverse the frozen runtime with executor provenance preserved.',
      pass:replay.replayed===true &&
        replay.projectedCount===2 &&
        replay.adaptedCount===2 &&
        replay.fieldDerived===true &&
        replay.reflectionGenerated===true &&
        replay.humanGatePassed===true &&
        replay.noOpSimulationPassed===true &&
        replay.originRecordsPreserved.length===2 &&
        replay.originReceiptsPreserved.length===2 &&
        replay.originTransportsPreserved.length===2,
      evidence:['R3 executor-origin runtime replay'],
    },
    {
      invariantRef:'EXEC-INV-04',
      description:'The complete isolated executor lane preserves production isolation and zero downstream external effect.',
      pass:[work,creative].every(x=>
        x.execution.receipt?.externalNetworkCall===false &&
        x.execution.receipt?.productionReachable===false &&
        x.execution.receipt?.persisted===false &&
        x.execution.receipt?.memberFacingDelivery===false &&
        x.execution.receipt?.maiaPromptMutated===false &&
        x.execution.receipt?.productionAuthority===false
      ) &&
        replay.externalNetworkCall===false &&
        replay.persisted===false &&
        replay.memberFacingContacted===false &&
        replay.deliveryExecuted===false &&
        replay.maiaPromptMutated===false &&
        replay.productionAuthority===false,
      evidence:['R1-R3 production-isolation chain'],
    },
  ];

  const contradictionRefs=invariants.filter(i=>!i.pass).map(i=>i.invariantRef);

  return {
    parentR3:'f51e8c08c1579de71bc0ad561e0a84bc94df059d',
    invariants,
    allPass:contradictionRefs.length===0,
    contradictionRefs,
    standing:contradictionRefs.length===0
      ? 'closed_for_isolated_executor_scope'
      : 'open_due_to_contradiction',
    productionReachable:false,
    externalNetworkCall:false,
    persistenceAuthorized:false,
    memberFacingDeliveryAuthorized:false,
    maiaPromptMutationAuthorized:false,
    productionAuthority:false,
  };
}
