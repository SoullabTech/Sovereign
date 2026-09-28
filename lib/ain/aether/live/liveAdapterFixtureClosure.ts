import { admitLiveInputToShadow } from './liveInputContract';
import {
  consumeReadOnceConsent,
  evaluateLiveConsent,
  revokeLiveConsent,
} from './consentLifecycle';
import {
  createFixtureLiveSourceReader,
  executeShadowReadTransaction,
} from './shadowReadTransaction';
import { projectFixtureShadowToSyntheticRuntime } from './shadowRuntimeCompatibility';
import { runFixtureEndToEndReplay } from './fixtureEndToEndReplay';

export interface LiveAdapterFixtureInvariant {
  invariantRef:string;
  description:string;
  pass:boolean;
  evidence:string[];
}

export interface LiveAdapterFixtureClosure {
  parentR5:string;
  invariants:LiveAdapterFixtureInvariant[];
  allPass:boolean;
  contradictionRefs:string[];
  standing:'closed_for_fixture_live_adapter_scope'|'open_due_to_contradiction';
  realConnectorAuthorized:false;
  realMemberDataRead:false;
  persistenceAuthorized:false;
  memberFacingDeliveryAuthorized:false;
  maiaPromptMutationAuthorized:false;
  networkSideEffect:false;
  productionAuthority:false;
}

export function runLiveAdapterFixtureClosure():LiveAdapterFixtureClosure{
  const consent={
    consentRef:'consent:r6:closure',
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

  const admitted=admitLiveInputToShadow({
    inputRef:'r6:fixture:input',
    memberRef:'member:fixture',
    source:'member_authored',
    domain:'work',
    observation:'Work feels more open this week.',
    temporalStanding:'is_being',
    confidence:.81,
    consentRef:consent.consentRef,
  },consent);

  const noConsent=admitLiveInputToShadow({
    inputRef:'r6:fixture:no-consent',
    memberRef:'member:fixture',
    source:'member_authored',
    domain:'work',
    observation:'Work feels more open this week.',
    temporalStanding:'is_being',
    confidence:.81,
    consentRef:'missing',
  },null);

  const lifecycle={
    consentRef:consent.consentRef,
    grantedAt:'2026-09-28T16:00:00-04:00',
    expiresAt:'2026-09-28T17:00:00-04:00',
  };

  const validBefore=evaluateLiveConsent(consent,lifecycle,{
    memberRef:consent.memberRef,
    consentRef:consent.consentRef,
    now:'2026-09-28T16:30:00-04:00',
  });
  const consumedLifecycle=consumeReadOnceConsent(
    consent,
    lifecycle,
    '2026-09-28T16:31:00-04:00',
  );
  const consumed=evaluateLiveConsent(consent,consumedLifecycle,{
    memberRef:consent.memberRef,
    consentRef:consent.consentRef,
    now:'2026-09-28T16:32:00-04:00',
  });
  const expired=evaluateLiveConsent(consent,lifecycle,{
    memberRef:consent.memberRef,
    consentRef:consent.consentRef,
    now:'2026-09-28T17:00:00-04:00',
  });
  const revokedLifecycle=revokeLiveConsent(
    lifecycle,
    '2026-09-28T16:20:00-04:00',
  );
  const revoked=evaluateLiveConsent(consent,revokedLifecycle,{
    memberRef:consent.memberRef,
    consentRef:consent.consentRef,
    now:'2026-09-28T16:30:00-04:00',
  });

  const reader=createFixtureLiveSourceReader([{
    sourceRef:'fixture:r6:work',
    memberRef:'member:fixture',
    source:'member_authored',
    domain:'work',
    observation:'Work feels more open this week.',
    temporalStanding:'is_being',
    confidence:.81,
  }]);

  const txSuccess=executeShadowReadTransaction(reader,{
    transactionRef:'r6:tx:success',
    sourceRef:'fixture:r6:work',
    inputRef:'r6:shadow:work',
    consentGrant:consent,
    consentLifecycle:lifecycle,
    consentUse:{
      memberRef:consent.memberRef,
      consentRef:consent.consentRef,
      now:'2026-09-28T16:30:00-04:00',
    },
  });

  const txFailure=executeShadowReadTransaction(reader,{
    transactionRef:'r6:tx:failure',
    sourceRef:'fixture:r6:missing',
    inputRef:'r6:shadow:missing',
    consentGrant:consent,
    consentLifecycle:lifecycle,
    consentUse:{
      memberRef:consent.memberRef,
      consentRef:consent.consentRef,
      now:'2026-09-28T16:30:00-04:00',
    },
  });

  const compatibility=txSuccess.shadow
    ? projectFixtureShadowToSyntheticRuntime(txSuccess.shadow,{
        fixtureRef:'r6:fixture-attestation',
        fixtureOnly:true,
        memberRef:txSuccess.shadow.memberRef,
        consentRef:txSuccess.shadow.consentRef,
      })
    : null;

  const antiLaundering=txSuccess.shadow
    ? projectFixtureShadowToSyntheticRuntime(txSuccess.shadow,null)
    : null;

  const sessionGrant={
    ...consent,
    consentRef:'consent:r6:session',
    scope:'aether_session_read' as const,
  };

  const replay=runFixtureEndToEndReplay({
    replayRef:'fixture-replay:r6',
    memberRef:'member:fixture',
    sessionRef:'session:r6',
    now:'2026-09-28T16:30:00-04:00',
    consentGrant:sessionGrant,
    consentLifecycle:{
      consentRef:sessionGrant.consentRef,
      grantedAt:'2026-09-28T16:00:00-04:00',
      expiresAt:'2026-09-28T17:00:00-04:00',
      sessionRef:'session:r6',
    },
    sources:[
      {
        sourceRef:'fixture:r6:replay:work',
        memberRef:'member:fixture',
        source:'member_authored',
        domain:'work',
        observation:'A shared movement toward greater openness.',
        temporalStanding:'is_being',
        confidence:.82,
      },
      {
        sourceRef:'fixture:r6:replay:creative',
        memberRef:'member:fixture',
        source:'system_observed',
        domain:'creative',
        observation:'A shared movement toward greater openness.',
        temporalStanding:'is_being',
        confidence:.64,
      },
    ],
    sourceRefs:[
      'fixture:r6:replay:work',
      'fixture:r6:replay:creative',
    ],
  });

  const invariants:LiveAdapterFixtureInvariant[]=[
    {
      invariantRef:'LAINV-01',
      description:'Live-shaped fixture admission is member-consent-bound and read-only.',
      pass:admitted.admitted &&
        admitted.shadow?.readOnly===true &&
        admitted.shadow?.persisted===false &&
        admitted.shadow?.delivered===false &&
        admitted.shadow?.maiaPromptMutated===false &&
        admitted.shadow?.finalMeaningAuthority==='member' &&
        noConsent.admitted===false &&
        noConsent.errors.includes('live_consent_required'),
      evidence:['R1 live input contract'],
    },
    {
      invariantRef:'LAINV-02',
      description:'Consent lifetime fails closed on consumption, expiry, and revocation.',
      pass:validBefore.valid===true &&
        consumed.state==='consumed' &&
        expired.state==='expired' &&
        revoked.state==='revoked',
      evidence:['R2 consent lifecycle'],
    },
    {
      invariantRef:'LAINV-03',
      description:'Shadow read transaction is atomic with no partial consent consumption on failure.',
      pass:txSuccess.committed===true &&
        txSuccess.shadow!==null &&
        txSuccess.consentConsumed===true &&
        txFailure.committed===false &&
        txFailure.shadow===null &&
        txFailure.consentConsumed===false &&
        JSON.stringify(txFailure.consentLifecycleBefore)===JSON.stringify(txFailure.consentLifecycleAfter),
      evidence:['R3 atomic shadow read'],
    },
    {
      invariantRef:'LAINV-04',
      description:'Synthetic runtime compatibility is fixture-attested and does not launder genuine live data.',
      pass:compatibility?.projected===true &&
        compatibility.provenance?.fixtureOnly===true &&
        compatibility.provenance?.liveDataProjected===false &&
        compatibility.provenance?.confidenceIncreased===false &&
        compatibility.provenance?.temporalStandingStrengthened===false &&
        compatibility.provenance?.authorityEscalated===false &&
        antiLaundering?.projected===false &&
        antiLaundering?.errors.includes('fixture_attestation_required')===true,
      evidence:['R4 fixture-only runtime compatibility'],
    },
    {
      invariantRef:'LAINV-05',
      description:'Fixture-backed end-to-end replay completes through no-op simulation.',
      pass:replay.replayed &&
        replay.shadowCount===2 &&
        replay.projectedCount===2 &&
        replay.adaptedCount===2 &&
        replay.fieldDerived &&
        replay.reflectionGenerated &&
        replay.humanGatePassed &&
        replay.noOpSimulationPassed,
      evidence:['R5 fixture end-to-end replay'],
    },
    {
      invariantRef:'LAINV-06',
      description:'No fixture-stage creates real connector use, real member-data read, persistence, delivery, MAIA mutation, network effect, or production authority.',
      pass:admitted.persistenceAuthorized===false &&
        admitted.memberFacingDeliveryAuthorized===false &&
        admitted.maiaPromptMutationAuthorized===false &&
        admitted.productionAuthority===false &&
        txSuccess.persistenceAuthorized===false &&
        txSuccess.memberFacingDeliveryAuthorized===false &&
        txSuccess.maiaPromptMutationAuthorized===false &&
        txSuccess.productionAuthority===false &&
        compatibility?.provenance?.persistenceAuthority===false &&
        compatibility?.provenance?.deliveryAuthority===false &&
        compatibility?.provenance?.promptMutationAuthority===false &&
        compatibility?.provenance?.productionAuthority===false &&
        replay.liveSourceConnected===false &&
        replay.realMemberDataRead===false &&
        replay.persisted===false &&
        replay.memberFacingContacted===false &&
        replay.deliveryExecuted===false &&
        replay.maiaPromptMutated===false &&
        replay.networkSideEffect===false &&
        replay.productionAuthority===false,
      evidence:['R1-R5 zero-real-data-effect chain'],
    },
  ];

  const contradictionRefs=invariants.filter(i=>!i.pass).map(i=>i.invariantRef);

  return {
    parentR5:'b48fbd8a1f6e9aafb2604f06c795b0fc571d0a0b',
    invariants,
    allPass:contradictionRefs.length===0,
    contradictionRefs,
    standing:contradictionRefs.length===0
      ? 'closed_for_fixture_live_adapter_scope'
      : 'open_due_to_contradiction',
    realConnectorAuthorized:false,
    realMemberDataRead:false,
    persistenceAuthorized:false,
    memberFacingDeliveryAuthorized:false,
    maiaPromptMutationAuthorized:false,
    networkSideEffect:false,
    productionAuthority:false,
  };
}
