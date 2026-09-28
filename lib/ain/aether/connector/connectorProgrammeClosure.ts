import { createAetherConnectorDeclaration, adjudicateConnectorDryRun } from './connectorContract';
import { createSourceManifest, adjudicateSourceFieldDryRun } from './sourceManifest';
import { adjudicateQueryPlan, type AetherConnectorQueryPlan } from './queryPlan';
import { createHumanQueryPlanReview, adjudicateReviewedQueryPlan, fingerprintQueryPlan } from './planReviewCustody';
import { issueExecutionToken } from './executionToken';
import { rehearseExecutionWithoutIo } from './executionRehearsalSink';

export interface ConnectorClosureInvariant {
  invariantRef:string;
  description:string;
  pass:boolean;
  evidence:string[];
}

export interface ConnectorProgrammeClosure {
  parentR6:string;
  invariants:ConnectorClosureInvariant[];
  allPass:boolean;
  contradictionRefs:string[];
  standing:'closed_for_pre_execution_connector_scope'|'open_due_to_contradiction';
  realRecordReadCapability:false;
  connectorExecutorImplemented:false;
  externalIoAuthorized:false;
  persistenceAuthorized:false;
  memberFacingDeliveryAuthorized:false;
  maiaPromptMutationAuthorized:false;
  productionAuthority:false;
}

export function runConnectorProgrammeClosure():ConnectorProgrammeClosure{
  const connector=createAetherConnectorDeclaration('connector:r7',[
    'member_authored_text',
  ]);

  const consent={
    consentRef:'consent:r7',
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

  const dryRun=adjudicateConnectorDryRun(connector,consent,{
    dryRunRef:'dry:r7',
    memberRef:'member:fixture',
    consentRef:consent.consentRef,
    requestedSourceClasses:['member_authored_text'],
    executeRecordRead:false,
  });

  const manifest=createSourceManifest('manifest:r7',[{
    sourceClass:'member_authored_text',
    fields:[
      {field:'recordRef',purpose:'identify_source',required:true},
      {field:'memberRef',purpose:'bind_member_scope',required:true},
      {field:'text',purpose:'represent_observation',required:true},
      {field:'createdAt',purpose:'represent_time',required:true},
      {field:'domain',purpose:'represent_domain',required:true},
    ],
  }]);

  const fieldDryRun=adjudicateSourceFieldDryRun(manifest,{
    manifestRef:manifest.manifestRef,
    sourceClass:'member_authored_text',
    requestedFields:['recordRef','memberRef','text','createdAt','domain'],
  });

  const plan:AetherConnectorQueryPlan={
    queryRef:'query:r7',
    connectorRef:connector.connectorRef,
    manifestRef:manifest.manifestRef,
    memberRef:'member:fixture',
    consentRef:consent.consentRef,
    sourceClass:'member_authored_text',
    fields:['recordRef','memberRef','text','createdAt','domain'],
    startTime:'2026-09-01T00:00:00-04:00',
    endTime:'2026-09-29T00:00:00-04:00',
    maxRecords:25,
    wildcard:false,
    paginationAllowed:false,
    execute:false,
  };

  const query=adjudicateQueryPlan(connector,manifest,consent,plan);

  const review=createHumanQueryPlanReview(
    'review:r7',
    plan,
    true,
    'Exact bounded plan reviewed for pre-execution closure.',
  );
  const reviewResult=adjudicateReviewedQueryPlan(plan,review);

  const tokenResult=issueExecutionToken(plan,review,{
    authorizationRef:'exec-auth:r7',
    actor:'human',
    queryRef:plan.queryRef,
    fingerprint:fingerprintQueryPlan(plan),
    authorized:true,
    issuedAt:'2026-09-28T18:00:00-04:00',
    expiresAt:'2026-09-28T19:00:00-04:00',
    note:'Authorize one inert pre-execution rehearsal only.',
  });

  const rehearsal=tokenResult.token
    ? rehearseExecutionWithoutIo(tokenResult.token,plan,'2026-09-28T18:30:00-04:00')
    : {rehearsed:false,errors:['token_missing'],consumedToken:null,receipt:null};

  const invariants:ConnectorClosureInvariant[]=[
    {
      invariantRef:'CONN-INV-01',
      description:'Connector declares source capability without implementing record reads.',
      pass:connector.readCapabilityDeclared===true &&
        connector.recordReadImplemented===false &&
        dryRun.allowed===true &&
        dryRun.recordReadExecuted===false &&
        dryRun.recordCountRead===0,
      evidence:['R1 connector contract'],
    },
    {
      invariantRef:'CONN-INV-02',
      description:'Source manifest is minimum-necessary and field adjudication remains zero-read.',
      pass:manifest.minimumNecessary===true &&
        manifest.zeroRecordRead===true &&
        fieldDryRun.allowed===true &&
        fieldDryRun.recordReadExecuted===false &&
        fieldDryRun.recordCountRead===0,
      evidence:['R2 source manifest'],
    },
    {
      invariantRef:'CONN-INV-03',
      description:'Query plan is fully bounded and non-executing.',
      pass:query.allowed===true &&
        query.plan?.wildcard===false &&
        query.plan?.paginationAllowed===false &&
        query.plan?.execute===false &&
        query.recordReadExecuted===false &&
        query.recordCountRead===0,
      evidence:['R3 bounded query plan'],
    },
    {
      invariantRef:'CONN-INV-04',
      description:'Human review is bound to exact immutable plan fingerprint and does not authorize execution.',
      pass:reviewResult.reviewBound===true &&
        reviewResult.approvedForFutureExecutionDesign===true &&
        reviewResult.executionAuthorized===false &&
        reviewResult.recordReadExecuted===false &&
        reviewResult.recordCountRead===0,
      evidence:['R4 review custody'],
    },
    {
      invariantRef:'CONN-INV-05',
      description:'One-shot token requires fresh human authorization yet still carries no executor or read effect.',
      pass:tokenResult.issued===true &&
        tokenResult.token?.oneShot===true &&
        tokenResult.token?.connectorExecutionImplemented===false &&
        tokenResult.executionAuthorized===false &&
        tokenResult.recordReadExecuted===false &&
        tokenResult.recordCountRead===0,
      evidence:['R5 execution token'],
    },
    {
      invariantRef:'CONN-INV-06',
      description:'Rehearsal consumes token with zero connector IO and zero record read.',
      pass:rehearsal.rehearsed===true &&
        rehearsal.receipt?.connectorIoAttempted===false &&
        rehearsal.receipt?.externalNetworkCall===false &&
        rehearsal.receipt?.executionOccurred===false &&
        rehearsal.receipt?.recordReadExecuted===false &&
        rehearsal.receipt?.recordCountRead===0,
      evidence:['R6 zero-IO execution rehearsal'],
    },
    {
      invariantRef:'CONN-INV-07',
      description:'No stage grants persistence, delivery, MAIA mutation, production authority, or real-record-read capability.',
      pass:dryRun.persistenceAuthorized===false &&
        dryRun.memberFacingDeliveryAuthorized===false &&
        dryRun.maiaPromptMutationAuthorized===false &&
        dryRun.productionAuthority===false &&
        query.persistenceAuthorized===false &&
        query.memberFacingDeliveryAuthorized===false &&
        query.maiaPromptMutationAuthorized===false &&
        query.productionAuthority===false &&
        reviewResult.persistenceAuthorized===false &&
        reviewResult.memberFacingDeliveryAuthorized===false &&
        reviewResult.maiaPromptMutationAuthorized===false &&
        reviewResult.productionAuthority===false &&
        tokenResult.persistenceAuthorized===false &&
        tokenResult.memberFacingDeliveryAuthorized===false &&
        tokenResult.maiaPromptMutationAuthorized===false &&
        tokenResult.productionAuthority===false &&
        rehearsal.receipt?.persisted===false &&
        rehearsal.receipt?.memberFacingDelivery===false &&
        rehearsal.receipt?.maiaPromptMutated===false &&
        rehearsal.receipt?.productionAuthority===false,
      evidence:['R1-R6 zero-I/O chain'],
    },
  ];

  const contradictionRefs=invariants.filter(i=>!i.pass).map(i=>i.invariantRef);

  return {
    parentR6:'1565cf0526834822b65875b2c4b617ff5ff2a835',
    invariants,
    allPass:contradictionRefs.length===0,
    contradictionRefs,
    standing:contradictionRefs.length===0
      ? 'closed_for_pre_execution_connector_scope'
      : 'open_due_to_contradiction',
    realRecordReadCapability:false,
    connectorExecutorImplemented:false,
    externalIoAuthorized:false,
    persistenceAuthorized:false,
    memberFacingDeliveryAuthorized:false,
    maiaPromptMutationAuthorized:false,
    productionAuthority:false,
  };
}
