import {
  deriveMemberAetherField,
  type MemberFieldObservation,
} from '../../benchmark/memberField';
import {
  generateSyntheticReflectionCandidate,
  validateSyntheticReflectionSemantics,
} from '../syntheticReflectionCandidate';

function field(){
  const observations:MemberFieldObservation[]=[
    {
      observationRef:'o:work',
      facetRef:'work',
      motif:'A shared movement toward greater openness.',
      temporalStanding:'is_being',
      standing:'member_named',
      qualities:[],
      note:'Work feels more open.',
    },
    {
      observationRef:'o:creative',
      facetRef:'creative',
      motif:'A shared movement toward greater openness.',
      temporalStanding:'is_being',
      standing:'source_observed',
      qualities:[],
      note:'Creative activity also looks more open.',
    },
    {
      observationRef:'o:relationship',
      facetRef:'relationship',
      motif:'Relationship feels unsettled but present.',
      temporalStanding:'is_being',
      standing:'member_named',
      qualities:[],
      note:'Relationship feels unsettled.',
    },
  ];
  return deriveMemberAetherField('synthetic:r5:field',observations);
}

describe('AIN-AETHER-RUNTIME-01R5 synthetic reflection candidate',()=>{
  test('generates an evidence-bound, corrigible candidate from a cross-facet pattern',()=>{
    const result=generateSyntheticReflectionCandidate(field());
    expect(result.generated).toBe(true);
    expect(result.candidate?.text).toMatch(/Work and Creative/i);
    expect(result.candidate?.text).toMatch(/Does that connection feel meaningful/i);
    expect(result.candidate?.correctionInvited).toBe(true);
    expect(result.candidate?.finalMeaningAuthority).toBe('member');
  });

  test('candidate provenance contains the exact supporting observations and uncertainty',()=>{
    const result=generateSyntheticReflectionCandidate(field());
    expect(result.candidate?.provenance.contributingObservationRefs).toEqual([
      'o:work','o:creative',
    ]);
    expect(result.candidate?.provenance.contributingFacetRefs).toEqual([
      'work','creative',
    ]);
    expect(result.candidate?.provenance.sourceObservationNotes).toHaveLength(2);
    expect(result.candidate?.provenance.uncertainty).toBe(.35);
  });

  test('candidate remains non-authoritative and non-deliverable',()=>{
    const candidate=generateSyntheticReflectionCandidate(field()).candidate!;
    expect(candidate.provisional).toBe(true);
    expect(candidate.identityAuthority).toBe(false);
    expect(candidate.diagnosticAuthority).toBe(false);
    expect(candidate.predictiveAuthority).toBe(false);
    expect(candidate.destinyAuthority).toBe(false);
    expect(candidate.soulRepresentationAuthority).toBe(false);
    expect(candidate.deliverable).toBe(false);
    expect(candidate.memberFacingDelivered).toBe(false);
    expect(candidate.maiaPromptMutated).toBe(false);
    expect(candidate.persisted).toBe(false);
    expect(candidate.productionAuthority).toBe(false);
  });

  test('semantic validator refuses unsupported facet injection',()=>{
    const f=field();
    const generated=generateSyntheticReflectionCandidate(f);
    const pattern=f.patterns.find(p=>p.contributingFacetRefs.length===2)!;
    const candidate={
      ...generated.candidate!,
      text:generated.candidate!.text+' Family belongs here too.',
      referencedFacetRefs:[...generated.candidate!.referencedFacetRefs,'family'],
    };
    const validation=validateSyntheticReflectionSemantics(f,pattern,candidate);
    expect(validation.valid).toBe(false);
    expect(validation.errors).toContain('candidate_adds_unsupported_facet:family');
  });

  test('refuses field with no cross-facet pattern',()=>{
    const single=deriveMemberAetherField('synthetic:r5:single',[{
      observationRef:'o:single',
      facetRef:'work',
      motif:'Only one observation.',
      temporalStanding:'is_being',
      standing:'member_named',
      qualities:[],
      note:'Only one observation.',
    }]);
    const result=generateSyntheticReflectionCandidate(single);
    expect(result.generated).toBe(false);
    expect(result.errors).toContain('no_cross_facet_pattern_available');
  });
});
