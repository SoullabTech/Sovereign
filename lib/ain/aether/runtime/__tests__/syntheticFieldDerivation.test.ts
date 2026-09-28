import { adjudicateCandidateAetherEvent } from '../candidateEventEnvelope';
import { adaptSyntheticEventToBenchmarkObservation } from '../benchmarkObservationAdapter';
import { deriveSyntheticMemberField } from '../syntheticFieldDerivation';

function adapted(
  ref:string,
  domain:string,
  observation:string,
  source:'synthetic_member_authored'|'synthetic_system_observed'='synthetic_member_authored',
  temporalStanding:'has_been'|'is_being'|'may_become'='is_being',
){
  const adjudication=adjudicateCandidateAetherEvent({
    eventRef:ref,
    synthetic:true,
    source,
    domain,
    observation,
    temporalStanding,
    confidence:.7,
    consent:'explicit_synthetic_consent',
  });
  if(!adjudication.event) throw new Error('candidate not admitted');
  const conversion=adaptSyntheticEventToBenchmarkObservation(adjudication.event);
  if(!conversion.result) throw new Error('candidate not adapted');
  return conversion.result;
}

describe('AIN-AETHER-RUNTIME-01R4 synthetic member-field derivation',()=>{
  test('derives an in-memory field from a bounded synthetic batch',()=>{
    const batch=[
      adapted('e:1','work','A shared movement toward greater openness.'),
      adapted('e:2','creative','A shared movement toward greater openness.'),
      adapted('e:3','relationship','Relationship feels unsettled but present.'),
    ];
    const result=deriveSyntheticMemberField('synthetic:field:1',batch);
    expect(result.derived).toBe(true);
    expect(result.field?.observations).toHaveLength(3);
    expect(result.field?.finalMeaningAuthority).toBe('member');
    expect(result.field?.persistenceAuthority).toBe(false);
    expect(result.persisted).toBe(false);
    expect(result.liveMemberDataBound).toBe(false);
  });

  test('benchmark engine can derive a provisional cross-facet pattern without identity authority',()=>{
    const batch=[
      adapted('e:4','work','A shared movement toward greater openness.'),
      adapted('e:5','creative','A shared movement toward greater openness.'),
    ];
    const result=deriveSyntheticMemberField('synthetic:field:2',batch);
    const pattern=result.field?.patterns.find(p=>p.contributingFacetRefs.length===2);
    expect(pattern?.movements).toContain('converging');
    expect(pattern?.provisional).toBe(true);
    expect(pattern?.identityAuthority).toBe(false);
    expect(pattern?.diagnosticAuthority).toBe(false);
    expect(pattern?.predictiveAuthority).toBe(false);
    expect(pattern?.soulRepresentationAuthority).toBe(false);
  });

  test('source-observed input increases benchmark uncertainty rather than gaining authority',()=>{
    const batch=[
      adapted('e:6','work','A shared movement toward greater openness.','synthetic_member_authored'),
      adapted('e:7','creative','A shared movement toward greater openness.','synthetic_system_observed'),
    ];
    const result=deriveSyntheticMemberField('synthetic:field:3',batch);
    const pattern=result.field?.patterns[0];
    expect(pattern?.uncertainty).toBe(.35);
    expect(pattern?.memberRecognition).toBe('unreviewed');
  });

  test('refuses empty batches and duplicate observation refs',()=>{
    expect(deriveSyntheticMemberField('synthetic:field:empty',[]).derived).toBe(false);

    const one=adapted('e:dup','work','A synthetic observation.');
    const duplicate={...one,provenance:{...one.provenance}};
    const result=deriveSyntheticMemberField('synthetic:field:dup',[one,duplicate]);
    expect(result.derived).toBe(false);
    expect(result.errors).toContain('duplicate_observation_ref:e:dup');
  });

  test('derivation never grants persistence, live binding, or production authority',()=>{
    const result=deriveSyntheticMemberField('synthetic:field:4',[
      adapted('e:8','family','A synthetic family observation.'),
    ]);
    expect(result.syntheticOnly).toBe(true);
    expect(result.persisted).toBe(false);
    expect(result.liveMemberDataBound).toBe(false);
    expect(result.productionAuthority).toBe(false);
  });
});
