import { createReadOnlyAetherRuntimeAdapter } from './constitutionalAdapter';
import { adjudicateCandidateAetherEvent } from './candidateEventEnvelope';
import { adaptSyntheticEventToBenchmarkObservation } from './benchmarkObservationAdapter';
import { deriveSyntheticMemberField } from './syntheticFieldDerivation';
import { generateSyntheticReflectionCandidate } from './syntheticReflectionCandidate';
import { authorizeSyntheticReflectionHandoff } from './reflectionDeliveryGate';
import { simulateSyntheticDelivery } from './syntheticDeliverySimulator';

export interface RuntimeConformanceInvariant {
  invariantRef:string;
  description:string;
  pass:boolean;
  evidence:string[];
}

export interface SyntheticRuntimeClosure {
  parentR7:string;
  invariants:RuntimeConformanceInvariant[];
  allPass:boolean;
  contradictionRefs:string[];
  standing:'closed_for_synthetic_runtime_scope'|'open_due_to_contradiction';
  liveMemberDataAuthorized:false;
  persistenceAuthorized:false;
  memberFacingDeliveryAuthorized:false;
  deliveryExecuted:false;
  maiaPromptMutationAuthorized:false;
  networkSideEffect:false;
  productionAuthority:false;
}

export function runSyntheticRuntimeClosure():SyntheticRuntimeClosure{
  const constitution=createReadOnlyAetherRuntimeAdapter();

  const readOnly=constitution.adjudicate({
    intentRef:'r8:read-only',
    requestedCapabilities:[
      'read_constitution',
      'read_benchmark_contracts',
      'evaluate_candidate_against_constitution',
    ],
  });

  const forbidden=constitution.adjudicate({
    intentRef:'r8:forbidden',
    requestedCapabilities:[
      'bind_live_member_data',
      'persist_member_field',
      'mutate_maia_prompt',
      'activate_production_route',
      'write_back_to_benchmark_corpus',
    ],
  });

  const eventInputs=[
    {
      eventRef:'r8:e:work',
      synthetic:true,
      source:'synthetic_member_authored' as const,
      domain:'work',
      observation:'A shared movement toward greater openness.',
      temporalStanding:'is_being' as const,
      confidence:.82,
      consent:'explicit_synthetic_consent' as const,
    },
    {
      eventRef:'r8:e:creative',
      synthetic:true,
      source:'synthetic_system_observed' as const,
      domain:'creative',
      observation:'A shared movement toward greater openness.',
      temporalStanding:'is_being' as const,
      confidence:.64,
      consent:'explicit_synthetic_consent' as const,
    },
    {
      eventRef:'r8:e:relationship',
      synthetic:true,
      source:'synthetic_member_authored' as const,
      domain:'relationship',
      observation:'Relationship feels unsettled but present.',
      temporalStanding:'is_being' as const,
      confidence:.77,
      consent:'explicit_synthetic_consent' as const,
    },
  ];

  const admissions=eventInputs.map(adjudicateCandidateAetherEvent);
  const admittedEvents=admissions.map(a=>a.event).filter(Boolean);
  const adaptations=admittedEvents.map(e=>adaptSyntheticEventToBenchmarkObservation(e!));
  const adapted=adaptations.map(a=>a.result).filter(Boolean);

  const fieldResult=deriveSyntheticMemberField(
    'synthetic:r8:field',
    adapted as NonNullable<(typeof adaptations)[number]['result']>[],
  );

  const reflection=fieldResult.field
    ? generateSyntheticReflectionCandidate(fieldResult.field)
    : {generated:false,errors:['field_missing'],candidate:null};

  const noHumanGate=reflection.candidate
    ? authorizeSyntheticReflectionHandoff(reflection.candidate,null)
    : null;

  const humanGate=reflection.candidate
    ? authorizeSyntheticReflectionHandoff(reflection.candidate,{
        authorizationRef:'human-auth:r8',
        candidateRef:reflection.candidate.candidateRef,
        actor:'human',
        authorized:true,
        scope:'synthetic_handoff_only',
        note:'Authorize synthetic R8 no-op conformance handoff only.',
      })
    : null;

  const simulation=humanGate?.token
    ? simulateSyntheticDelivery(humanGate.token)
    : {simulated:false,errors:['handoff_token_missing'],receipt:null};

  const invariants:RuntimeConformanceInvariant[]=[
    {
      invariantRef:'RINV-01',
      description:'Runtime constitution is pinned to closed benchmark scope and grants only read-only use.',
      pass:constitution.constitution.sourceCommit==='297edbade3d1deab9311b93023852961797e23b2' &&
        readOnly.allowed &&
        !forbidden.allowed &&
        forbidden.liveBindingAuthorized===false &&
        forbidden.benchmarkMutationAuthorized===false &&
        forbidden.productionAuthority===false,
      evidence:['R1 constitutional adapter'],
    },
    {
      invariantRef:'RINV-02',
      description:'Ingress remains synthetic, consented, and free of interpretation authority.',
      pass:admissions.length===3 &&
        admissions.every(a=>a.admitted&&a.event?.synthetic===true) &&
        admissions.every(a=>a.liveMemberDataAuthorized===false&&a.persistenceAuthorized===false&&a.productionAuthority===false),
      evidence:['R2 synthetic event membrane'],
    },
    {
      invariantRef:'RINV-03',
      description:'Observation adaptation preserves standing without confidence or authority escalation.',
      pass:adaptations.length===3 &&
        adaptations.every(a=>a.adapted&&a.result?.authorityEscalated===false) &&
        adaptations.every(a=>a.result?.confidenceIncreased===false&&a.result?.temporalStandingStrengthened===false) &&
        adaptations.every(a=>a.result?.persistenceAuthority===false),
      evidence:['R3 benchmark observation adapter'],
    },
    {
      invariantRef:'RINV-04',
      description:'Field derivation remains synthetic, in-memory, member-owned, and non-persistent.',
      pass:fieldResult.derived &&
        fieldResult.syntheticOnly===true &&
        fieldResult.persisted===false &&
        fieldResult.liveMemberDataBound===false &&
        fieldResult.productionAuthority===false &&
        fieldResult.field?.finalMeaningAuthority==='member' &&
        fieldResult.field?.persistenceAuthority===false,
      evidence:['R4 synthetic field derivation'],
    },
    {
      invariantRef:'RINV-05',
      description:'Reflection candidate is evidence-bound, corrigible, non-authoritative, and non-deliverable.',
      pass:reflection.generated &&
        reflection.candidate?.correctionInvited===true &&
        reflection.candidate?.provisional===true &&
        reflection.candidate?.finalMeaningAuthority==='member' &&
        reflection.candidate?.identityAuthority===false &&
        reflection.candidate?.diagnosticAuthority===false &&
        reflection.candidate?.predictiveAuthority===false &&
        reflection.candidate?.destinyAuthority===false &&
        reflection.candidate?.soulRepresentationAuthority===false &&
        reflection.candidate?.deliverable===false &&
        reflection.candidate?.memberFacingDelivered===false &&
        reflection.candidate?.persisted===false &&
        reflection.candidate?.productionAuthority===false,
      evidence:['R5 reflection candidate'],
    },
    {
      invariantRef:'RINV-06',
      description:'Candidate validity alone cannot authorize handoff; explicit human synthetic authorization is required.',
      pass:Boolean(noHumanGate) &&
        noHumanGate?.gatePassed===false &&
        noHumanGate?.errors.includes('explicit_human_authorization_required')===true &&
        humanGate?.gatePassed===true &&
        humanGate?.candidateValiditySelfAuthorized===false &&
        humanGate?.memberFacingDeliveryAuthorized===false &&
        humanGate?.deliveryExecuted===false &&
        humanGate?.persistenceAuthorized===false &&
        humanGate?.productionAuthority===false,
      evidence:['R6 human delivery gate'],
    },
    {
      invariantRef:'RINV-07',
      description:'Synthetic handoff can be consumed by a no-op sink with zero external effect.',
      pass:simulation.simulated &&
        simulation.receipt?.memberFacingContacted===false &&
        simulation.receipt?.deliveryExecuted===false &&
        simulation.receipt?.notificationSent===false &&
        simulation.receipt?.persisted===false &&
        simulation.receipt?.maiaPromptMutated===false &&
        simulation.receipt?.networkSideEffect===false &&
        simulation.receipt?.productionAuthority===false,
      evidence:['R7 no-op delivery simulation'],
    },
    {
      invariantRef:'RINV-08',
      description:'No stage opens live member-data, persistence, delivery, MAIA mutation, network, or production authority.',
      pass:forbidden.liveBindingAuthorized===false &&
        fieldResult.liveMemberDataBound===false &&
        fieldResult.persisted===false &&
        reflection.candidate?.memberFacingDelivered===false &&
        reflection.candidate?.maiaPromptMutated===false &&
        humanGate?.memberFacingDeliveryAuthorized===false &&
        simulation.receipt?.networkSideEffect===false &&
        simulation.receipt?.productionAuthority===false,
      evidence:['R1-R7 zero-external-effect chain'],
    },
  ];

  const contradictionRefs=invariants.filter(i=>!i.pass).map(i=>i.invariantRef);

  return {
    parentR7:'cb258f40b765c05e3e5b31871632add7fead21ca',
    invariants,
    allPass:contradictionRefs.length===0,
    contradictionRefs,
    standing:contradictionRefs.length===0
      ? 'closed_for_synthetic_runtime_scope'
      : 'open_due_to_contradiction',
    liveMemberDataAuthorized:false,
    persistenceAuthorized:false,
    memberFacingDeliveryAuthorized:false,
    deliveryExecuted:false,
    maiaPromptMutationAuthorized:false,
    networkSideEffect:false,
    productionAuthority:false,
  };
}
