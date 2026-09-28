import {
  applyMemberAetherCorrection,
  deriveMemberAetherField,
  validateMemberAetherField,
  type MemberFieldObservation,
} from '../memberField';

const observations:MemberFieldObservation[]=[
  {
    observationRef:'journal:courage',
    facetRef:'journal',
    motif:'Courage',
    temporalStanding:'has_been',
    standing:'member_named',
    qualities:['resonance'],
    note:'Courage was named in an earlier journal reflection.',
  },
  {
    observationRef:'work:courage',
    facetRef:'work',
    motif:'Courage',
    temporalStanding:'is_being',
    standing:'source_observed',
    qualities:['directionality','threshold'],
    note:'A current work transition also carries the courage motif.',
  },
  {
    observationRef:'dream:courage',
    facetRef:'dream',
    motif:'Courage',
    temporalStanding:'may_become',
    standing:'maia_hypothesis',
    qualities:['latency','resonance'],
    note:'A dream image may resonate with the same motif.',
  },
  {
    observationRef:'relationship:solitude',
    facetRef:'relationship',
    motif:'Solitude',
    temporalStanding:'is_being',
    standing:'member_named',
    qualities:['tension'],
    note:'The member names a need for solitude.',
  },
  {
    observationRef:'relationship:intimacy',
    facetRef:'relationship',
    motif:'Intimacy',
    temporalStanding:'is_being',
    standing:'member_named',
    qualities:['resonance'],
    note:'The member also names a longing for intimacy.',
  },
];

describe('AIN-AETHER-01R1 member field',()=>{
  const contradiction={
    contradictionRef:'relationship:solitude-intimacy',
    observationRefs:['relationship:solitude','relationship:intimacy'],
    note:'Solitude and intimacy are both presently meaningful.',
    status:'held_open' as const,
  };
  const absence={
    absenceRef:'career-next-form',
    subject:'the exact next form of work',
    status:'latent' as const,
    note:'Direction is present but the concrete form is not yet known.',
  };
  const field=deriveMemberAetherField('member-field:test',observations,[contradiction],[absence]);

  test('cross-facet recurrence creates a provisional pattern, not identity',()=>{
    const courage=field.patterns.find(p=>p.motif==='Courage')!;
    expect(courage.contributingFacetRefs).toEqual(expect.arrayContaining(['journal','work','dream']));
    expect(courage.movements).toEqual(expect.arrayContaining(['converging','recurring','latent','threshold']));
    expect(courage.provisional).toBe(true);
    expect(courage.identityAuthority).toBe(false);
    expect(courage.soulRepresentationAuthority).toBe(false);
  });

  test('has been, is being, and may become remain differentiated',()=>{
    const courage=field.patterns.find(p=>p.motif==='Courage')!;
    expect(courage.temporalStandings).toEqual(expect.arrayContaining(['has_been','is_being','may_become']));
  });

  test('contradiction and latency remain valid field states',()=>{
    expect(field.contradictions[0].status).toBe('held_open');
    expect(field.absences[0].status).toBe('latent');
    expect(validateMemberAetherField(field)).toEqual({valid:true,errors:[]});
  });

  test('member can reject a field pattern without deleting source history',()=>{
    const courage=field.patterns.find(p=>p.motif==='Courage')!;
    const corrected=applyMemberAetherCorrection(field,{
      correctionRef:'member:no-courage-pattern',
      kind:'meaning',
      targetRef:courage.patternRef,
      effect:'reject_pattern',
      note:'This does not feel like one pattern to me.',
      introducedBy:'member',
    });
    expect(corrected.patterns.find(p=>p.patternRef===courage.patternRef)!.memberRecognition).toBe('rejected');
    expect(corrected.observations).toHaveLength(field.observations.length);
  });

  test('member can correct temporal standing and field recomputes without rewriting the original object',()=>{
    const corrected=applyMemberAetherCorrection(field,{
      correctionRef:'member:dream-not-yet',
      kind:'temporal',
      targetRef:'dream:courage',
      effect:'mark_historical',
      note:'That dream belongs to an earlier period.',
      introducedBy:'member',
    });
    expect(corrected.observations.find(o=>o.observationRef==='dream:courage')!.temporalStanding).toBe('has_been');
    expect(corrected.patterns.find(p=>p.motif==='Courage')!.temporalStandings).not.toContain('may_become');
    expect(field.observations.find(o=>o.observationRef==='dream:courage')!.temporalStanding).toBe('may_become');
  });

  test('member can exclude an irrelevant observation and derived field is recomputed',()=>{
    const corrected=applyMemberAetherCorrection(field,{
      correctionRef:'member:exclude-dream',
      kind:'relevance',
      targetRef:'dream:courage',
      effect:'exclude',
      note:'This dream is not relevant to this inquiry.',
      introducedBy:'member',
    });
    const courage=corrected.patterns.find(p=>p.motif==='Courage')!;
    expect(courage.contributingFacetRefs).not.toContain('dream');
    expect(corrected.observations.some(o=>o.observationRef==='dream:courage')).toBe(false);
  });

  test('field grants no identity, diagnosis, prediction, soul-capture, or persistence authority',()=>{
    for(const pattern of field.patterns){
      expect(pattern.identityAuthority).toBe(false);
      expect(pattern.diagnosticAuthority).toBe(false);
      expect(pattern.predictiveAuthority).toBe(false);
      expect(pattern.soulRepresentationAuthority).toBe(false);
    }
    expect(field.persistenceAuthority).toBe(false);
    expect(field.finalMeaningAuthority).toBe('member');
  });
});
