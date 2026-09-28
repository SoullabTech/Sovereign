import {
  ablateAetherSource,
  applyAetherCorrections,
  validateAetherInput,
  validateCriticalAblations,
  type AetherInput,
} from '../aetherInput';

const input:AetherInput={
  inquiryRef:'aether-fixture-01',
  temporalNeed:'mixed',
  sources:[
    {sourceRef:'authority-law',permission:'admitted',epistemicRole:'governing_law',representedTime:'is_being',status:'active',reliedUpon:true,speakable:true,disclosed:true,uncertainty:.05},
    {sourceRef:'source-fabric',permission:'admitted',epistemicRole:'governing_law',representedTime:'is_being',status:'active',reliedUpon:true,speakable:true,disclosed:true,uncertainty:.05},
    {sourceRef:'indra-permeability',permission:'admitted',epistemicRole:'governing_law',representedTime:'is_being',status:'active',reliedUpon:true,speakable:true,disclosed:true,uncertainty:.05},
    {sourceRef:'rgr-note',permission:'admitted',epistemicRole:'research_hypothesis',representedTime:'unknown_time',status:'active',reliedUpon:true,speakable:true,disclosed:true,uncertainty:.2},
    {sourceRef:'indra-grammar',permission:'admitted',epistemicRole:'governing_law',representedTime:'is_being',status:'active',reliedUpon:true,speakable:true,disclosed:true,uncertainty:.1},
    {sourceRef:'j9-adjudication',permission:'admitted',epistemicRole:'technical_witness',representedTime:'has_been',status:'superseded',reliedUpon:false,speakable:true,disclosed:true,uncertainty:.05},
    {sourceRef:'j11-reconciliation',permission:'admitted',epistemicRole:'technical_witness',representedTime:'has_been',status:'historical',reliedUpon:true,speakable:true,disclosed:true,uncertainty:.05},
    {sourceRef:'library-adr',permission:'admitted',epistemicRole:'implementation_architecture',representedTime:'has_been',status:'active',reliedUpon:true,speakable:true,disclosed:true,uncertainty:.1},
    {sourceRef:'source-fabric-census',permission:'admitted',epistemicRole:'technical_witness',representedTime:'is_being',status:'active',reliedUpon:true,speakable:true,disclosed:true,uncertainty:.05},
  ],
  relations:[
    {
      relationRef:'rel-permission-center',
      endpointRefs:['authority-law','source-fabric','indra-permeability'],
      supportRefs:['authority-law','source-fabric','indra-permeability'],
      criticalSupportRefs:['authority-law','source-fabric','indra-permeability'],
      predicate:'possible_continuity',
      standing:'candidate_unestablished',
      status:'active_candidate',
      claimTemporalNeed:'current',
      counterevidenceRefs:[],
      uncertainty:.15,
      introducedBy:'aether_candidate',
    },
    {
      relationRef:'rel-relation-as-primitive',
      endpointRefs:['rgr-note','indra-grammar'],
      supportRefs:['rgr-note','indra-grammar'],
      criticalSupportRefs:['rgr-note','indra-grammar'],
      predicate:'resonance',
      standing:'candidate_unestablished',
      status:'active_candidate',
      claimTemporalNeed:'mixed',
      counterevidenceRefs:[],
      uncertainty:.25,
      introducedBy:'aether_candidate',
    },
    {
      relationRef:'rel-retrieval-history',
      endpointRefs:['j9-adjudication','j11-reconciliation'],
      supportRefs:['j9-adjudication','j11-reconciliation'],
      criticalSupportRefs:['j9-adjudication','j11-reconciliation'],
      predicate:'temporal_sequence',
      standing:'historical_record',
      status:'active_candidate',
      claimTemporalNeed:'historical',
      counterevidenceRefs:[],
      uncertainty:.05,
      introducedBy:'source_declared',
    },
    {
      relationRef:'rel-maia-pattern',
      endpointRefs:['source-fabric','rgr-note'],
      supportRefs:['source-fabric','rgr-note'],
      criticalSupportRefs:['source-fabric','rgr-note'],
      predicate:'explanatory_possibility',
      standing:'candidate_unestablished',
      status:'active_candidate',
      claimTemporalNeed:'mixed',
      counterevidenceRefs:['source-fabric-census'],
      uncertainty:.4,
      introducedBy:'maia_candidate',
    },
  ],
  contradictions:[
    {
      contradictionRef:'contradiction-library-live-state',
      sourceRefs:['library-adr','source-fabric-census'],
      note:'Architecture describes hybrid machinery while current census records semantic-first / lexical-fallback orchestration.',
    },
  ],
  absences:[
    {absenceRef:'absence-dream',subject:'Dream source',reason:'not_admitted'},
  ],
  corrections:[
    {
      correctionRef:'member-correction-1',
      targetRelationRef:'rel-maia-pattern',
      effect:'reject',
      introducedBy:'member',
    },
  ],
  uncertainties:[
    {
      uncertaintyRef:'uncertainty-rgr-indra',
      subjectRef:'rel-relation-as-primitive',
      note:'Conceptual bridge is plausible and not established identity/equivalence.',
    },
  ],
  synthesisPermissions:{
    allowCreativeRelation:true,
    allowCausalClaim:false,
    allowPrediction:false,
    allowIdentityClaim:false,
    allowDiagnosticClaim:false,
    allowThirdPartyInteriority:false,
    allowPersistence:false,
    requireAblation:true,
  },
};

describe('R5 Aether input contract',()=>{
  it('accepts a temporally differentiated, governed constellation',()=>{
    expect(validateAetherInput(input)).toEqual({valid:true,errors:[]});
  });

  it('applies correction to the relation without rewriting source history',()=>{
    const corrected=applyAetherCorrections(input);
    expect(corrected.relations.find(r=>r.relationRef==='rel-maia-pattern')?.status).toBe('rejected');
    expect(corrected.sources).toEqual(input.sources);
  });

  it('proves every declared critical jewel is structurally necessary by ablation',()=>{
    expect(validateCriticalAblations(input)).toEqual({valid:true,errors:[]});
    const removed=ablateAetherSource(input,'rgr-note');
    expect(removed.invalidatedRelations).toEqual(
      expect.arrayContaining(['rel-relation-as-primitive','rel-maia-pattern']),
    );
    expect(removed.invalidatedRelations).not.toContain('rel-permission-center');
  });

  it('preserves contradiction as a first-class dependency',()=>{
    const removed=ablateAetherSource(input,'source-fabric-census');
    expect(removed.removedContradictions).toContain('contradiction-library-live-state');
  });

  it('refuses current claims supported by superseded sources',()=>{
    const invalid: AetherInput=structuredClone(input);
    invalid.relations.push({
      relationRef:'bad-current-history',
      endpointRefs:['j9-adjudication','authority-law'],
      supportRefs:['j9-adjudication','authority-law'],
      criticalSupportRefs:['j9-adjudication'],
      predicate:'possible_continuity',
      standing:'candidate_unestablished',
      status:'active_candidate',
      claimTemporalNeed:'current',
      counterevidenceRefs:[],
      uncertainty:.2,
      introducedBy:'aether_candidate',
    });
    const result=validateAetherInput(invalid);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('current_relation_uses_superseded_source:bad-current-history:j9-adjudication');
  });

  it('refuses hidden authority through reference-only or revoked support',()=>{
    const invalid: AetherInput=structuredClone(input);
    invalid.sources.find(s=>s.sourceRef==='source-fabric')!.permission='reference_only';
    const result=validateAetherInput(invalid);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('relied_source_not_admitted:source-fabric');
    expect(result.errors).toContain('relation_support_not_admitted:rel-permission-center:source-fabric');
  });

  it('requires cross-source support for an Aether-proposed relation',()=>{
    const invalid: AetherInput=structuredClone(input);
    invalid.relations[0].supportRefs=['authority-law'];
    invalid.relations[0].criticalSupportRefs=['authority-law'];
    const result=validateAetherInput(invalid);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('aether_relation_requires_multiple_sources:rel-permission-center');
  });
});
