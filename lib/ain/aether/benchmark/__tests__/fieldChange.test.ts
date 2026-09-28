import { deriveMemberAetherField, type MemberFieldObservation } from '../memberField';
import {
  applyCorrectionAndCompare,
  compareMemberAetherFields,
  deriveFieldGeometry,
} from '../fieldChange';

function obs(
  observationRef:string,facetRef:string,motif:string,
  temporalStanding:'has_been'|'is_being'|'may_become',
  qualities:any[],
):MemberFieldObservation{
  return {observationRef,facetRef,motif,temporalStanding,qualities,standing:'member_named',note:observationRef};
}

describe('AIN-AETHER-01R2 temporal field deltas',()=>{
  const before=deriveMemberAetherField('field:t1',[
    obs('grief:journal','journal','Grief','is_being',['tension']),
    obs('grief:relationship','relationship','Grief','is_being',['tension']),
    obs('fear:relationship','relationship','Fear','is_being',['tension']),
    obs('isolation:journal','journal','Isolation','is_being',['tension']),
  ],[{
    contradictionRef:'grief-fear',
    observationRefs:['grief:relationship','fear:relationship'],
    note:'Grief and fear are tightly linked here.',
    status:'held_open',
  }]);

  const after=deriveMemberAetherField('field:t2',[
    obs('grief:journal','journal','Grief','is_being',['resonance']),
    obs('grief:relationship','relationship','Grief','is_being',['resonance']),
    obs('grief:creative','creative','Grief','is_being',['resonance','threshold']),
    obs('love:relationship','relationship','Love','is_being',['resonance']),
    obs('memory:journal','journal','Memory','is_being',['resonance']),
    obs('creativity:creative','creative','Creativity','may_become',['latency','resonance']),
  ]);

  test('detects intensification without pretending the motif disappeared and reappeared',()=>{
    const delta=compareMemberAetherFields(before,after);
    const grief=delta.patternDeltas.find(d=>d.motif==='Grief')!;
    expect(grief.kind).toBe('intensified');
    expect(grief.addedFacetRefs).toContain('creative');
    expect(grief.beforeFacetRefs.length).toBe(2);
    expect(grief.afterFacetRefs.length).toBe(3);
  });

  test('detects field reorganization around a persistent motif',()=>{
    const delta=compareMemberAetherFields(before,after);
    expect(delta.changed).toBe(true);
    expect(delta.geometryDelta.removedRelations.length).toBeGreaterThan(0);
    expect(delta.geometryDelta.addedRelations.length).toBeGreaterThan(0);
  });

  test('field geometry is relational rather than a flat score vector',()=>{
    const g1=deriveFieldGeometry(before);
    const g2=deriveFieldGeometry(after);
    expect(g1.relations.some(r=>r.basis==='contradiction_link')).toBe(true);
    expect(g2.relations.some(r=>r.basis==='shared_quality')).toBe(true);
  });

  test('new motifs can appear while older organizing motifs disappear',()=>{
    const delta=compareMemberAetherFields(before,after);
    expect(delta.patternDeltas.find(d=>d.motif==='Love')!.kind).toBe('appeared');
    expect(delta.patternDeltas.find(d=>d.motif==='Creativity')!.kind).toBe('appeared');
    expect(delta.patternDeltas.find(d=>d.motif==='Fear')!.kind).toBe('disappeared');
    expect(delta.patternDeltas.find(d=>d.motif==='Isolation')!.kind).toBe('disappeared');
  });

  test('member temporal correction produces a field delta rather than rewriting the baseline',()=>{
    const field=deriveMemberAetherField('field:correction',[
      obs('courage:journal','journal','Courage','is_being',['resonance']),
      obs('courage:dream','dream','Courage','may_become',['latency']),
    ]);
    const {corrected,delta}=applyCorrectionAndCompare(field,{
      correctionRef:'member:dream-was-then',
      kind:'temporal',
      targetRef:'courage:dream',
      effect:'mark_historical',
      note:'This dream belongs to the past.',
      introducedBy:'member',
    });
    expect(corrected.observations.find(o=>o.observationRef==='courage:dream')!.temporalStanding).toBe('has_been');
    expect(delta.patternDeltas.find(d=>d.motif==='Courage')!.kind).toBe('temporally_shifted');
    expect(field.observations.find(o=>o.observationRef==='courage:dream')!.temporalStanding).toBe('may_become');
  });

  test('delta remains provisional and final meaning remains member-owned',()=>{
    const delta=compareMemberAetherFields(before,after);
    expect(delta.provisional).toBe(true);
    expect(delta.finalMeaningAuthority).toBe('member');
  });
});
