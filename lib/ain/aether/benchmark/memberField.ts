export type AetherTemporalStanding='has_been'|'is_being'|'may_become';

export type AetherMovement=
  | 'intensifying'
  | 'dissipating'
  | 'converging'
  | 'diverging'
  | 'threshold'
  | 'recurring'
  | 'latent'
  | 'unresolved';

export type AetherFieldQuality=
  | 'coherence'
  | 'tension'
  | 'permeability'
  | 'resonance'
  | 'directionality'
  | 'latency'
  | 'threshold';

export type AetherObservationStanding=
  | 'member_named'
  | 'source_observed'
  | 'maia_hypothesis';

export type MemberRecognition=
  | 'unreviewed'
  | 'recognized'
  | 'partly_recognized'
  | 'rejected'
  | 'reshaped';

export interface MemberFieldObservation {
  observationRef:string;
  facetRef:string;
  motif:string;
  temporalStanding:AetherTemporalStanding;
  standing:AetherObservationStanding;
  qualities:AetherFieldQuality[];
  note:string;
}

export interface AetherFieldPattern {
  patternRef:string;
  motif:string;
  contributingObservationRefs:string[];
  contributingFacetRefs:string[];
  temporalStandings:AetherTemporalStanding[];
  movements:AetherMovement[];
  qualities:AetherFieldQuality[];
  contradictionRefs:string[];
  uncertainty:number;
  memberRecognition:MemberRecognition;
  provisional:true;
  identityAuthority:false;
  diagnosticAuthority:false;
  predictiveAuthority:false;
  soulRepresentationAuthority:false;
}

export interface AetherFieldContradiction {
  contradictionRef:string;
  observationRefs:string[];
  note:string;
  status:'held_open';
}

export interface AetherFieldAbsence {
  absenceRef:string;
  subject:string;
  status:'absent'|'latent'|'unknown';
  note:string;
}

export interface MemberAetherField {
  fieldRef:string;
  observations:MemberFieldObservation[];
  patterns:AetherFieldPattern[];
  contradictions:AetherFieldContradiction[];
  absences:AetherFieldAbsence[];
  fieldStatus:'open'|'changing'|'uncertain';
  finalMeaningAuthority:'member';
  persistenceAuthority:false;
}

export type MemberAetherCorrectionKind=
  | 'source'
  | 'relevance'
  | 'meaning'
  | 'temporal'
  | 'tone'
  | 'ontological';

export interface MemberAetherCorrection {
  correctionRef:string;
  kind:MemberAetherCorrectionKind;
  targetRef:string;
  effect:
    | 'exclude'
    | 'downweight'
    | 'reject_pattern'
    | 'mark_historical'
    | 'mark_emerging'
    | 'reshape'
    | 'not_identity';
  note:string;
  introducedBy:'member';
}

function unique<T>(items:T[]):T[]{ return [...new Set(items)]; }

export function deriveMemberAetherField(
  fieldRef:string,
  observations:MemberFieldObservation[],
  contradictions:AetherFieldContradiction[]=[],
  absences:AetherFieldAbsence[]=[],
):MemberAetherField {
  const byMotif=new Map<string,MemberFieldObservation[]>();
  for(const observation of observations){
    const key=observation.motif.trim().toLowerCase();
    const bucket=byMotif.get(key)??[];
    bucket.push(observation);
    byMotif.set(key,bucket);
  }

  const patterns:AetherFieldPattern[]=[];
  for(const [key,group] of byMotif){
    const facets=unique(group.map(x=>x.facetRef));
    const times=unique(group.map(x=>x.temporalStanding));
    const qualities=unique(group.flatMap(x=>x.qualities));
    const movements:AetherMovement[]=[];

    if(facets.length>=2) movements.push('converging');
    if(times.includes('has_been')&&times.includes('is_being')) movements.push('recurring');
    if(times.includes('may_become')) movements.push('latent');
    if(qualities.includes('threshold')) movements.push('threshold');
    if(qualities.includes('tension')&&qualities.includes('coherence')) movements.push('unresolved');

    const linkedContradictions=contradictions
      .filter(c=>c.observationRefs.some(ref=>group.some(o=>o.observationRef===ref)))
      .map(c=>c.contradictionRef);
    if(linkedContradictions.length>0) movements.push('diverging');

    patterns.push({
      patternRef:'aether-pattern:'+key.replace(/[^a-z0-9]+/g,'-'),
      motif:group[0].motif,
      contributingObservationRefs:group.map(x=>x.observationRef),
      contributingFacetRefs:facets,
      temporalStandings:times,
      movements:unique(movements.length?movements:['unresolved']),
      qualities,
      contradictionRefs:linkedContradictions,
      uncertainty:group.every(x=>x.standing==='member_named')?.15:.35,
      memberRecognition:'unreviewed',
      provisional:true,
      identityAuthority:false,
      diagnosticAuthority:false,
      predictiveAuthority:false,
      soulRepresentationAuthority:false,
    });
  }

  const changing=patterns.some(p=>
    p.movements.some(m=>['intensifying','dissipating','threshold','recurring','converging','diverging'].includes(m))
  );

  return {
    fieldRef,
    observations:[...observations],
    patterns,
    contradictions:[...contradictions],
    absences:[...absences],
    fieldStatus:changing?'changing':'uncertain',
    finalMeaningAuthority:'member',
    persistenceAuthority:false,
  };
}

export function applyMemberAetherCorrection(
  field:MemberAetherField,
  correction:MemberAetherCorrection,
):MemberAetherField {
  const observations=field.observations.map(o=>({...o}));
  const patterns=field.patterns.map(p=>({
    ...p,
    contributingObservationRefs:[...p.contributingObservationRefs],
    contributingFacetRefs:[...p.contributingFacetRefs],
    temporalStandings:[...p.temporalStandings],
    movements:[...p.movements],
    qualities:[...p.qualities],
    contradictionRefs:[...p.contradictionRefs],
  }));

  const observation=observations.find(o=>o.observationRef===correction.targetRef);
  const pattern=patterns.find(p=>p.patternRef===correction.targetRef);

  if(correction.effect==='exclude'&&observation){
    const kept=observations.filter(o=>o.observationRef!==observation.observationRef);
    return deriveMemberAetherField(
      field.fieldRef,
      kept,
      field.contradictions.filter(c=>!c.observationRefs.includes(observation.observationRef)),
      field.absences,
    );
  }

  if(correction.effect==='mark_historical'&&observation){
    observation.temporalStanding='has_been';
    return deriveMemberAetherField(
      field.fieldRef,
      observations,
      field.contradictions,
      field.absences,
    );
  }
  if(correction.effect==='mark_emerging'&&observation){
    observation.temporalStanding='may_become';
    return deriveMemberAetherField(
      field.fieldRef,
      observations,
      field.contradictions,
      field.absences,
    );
  }

  if(pattern){
    if(correction.effect==='reject_pattern') pattern.memberRecognition='rejected';
    if(correction.effect==='reshape') pattern.memberRecognition='reshaped';
    if(correction.effect==='not_identity') pattern.memberRecognition='recognized';
    if(correction.effect==='downweight') pattern.uncertainty=Math.min(1,pattern.uncertainty+.25);
  }

  return {...field,observations,patterns};
}

export function validateMemberAetherField(field:MemberAetherField){
  const errors:string[]=[];
  if(field.finalMeaningAuthority!=='member') errors.push('final_meaning_not_member_owned');
  if(field.persistenceAuthority!==false) errors.push('persistence_authority_granted');

  for(const pattern of field.patterns){
    if(!pattern.provisional) errors.push('pattern_not_provisional:'+pattern.patternRef);
    if(pattern.identityAuthority) errors.push('identity_authority_granted:'+pattern.patternRef);
    if(pattern.diagnosticAuthority) errors.push('diagnostic_authority_granted:'+pattern.patternRef);
    if(pattern.predictiveAuthority) errors.push('predictive_authority_granted:'+pattern.patternRef);
    if(pattern.soulRepresentationAuthority) errors.push('soul_representation_authority_granted:'+pattern.patternRef);
    if(pattern.uncertainty<0||pattern.uncertainty>1) errors.push('invalid_uncertainty:'+pattern.patternRef);
  }

  for(const contradiction of field.contradictions){
    if(contradiction.status!=='held_open') errors.push('contradiction_not_held_open:'+contradiction.contradictionRef);
  }

  return {valid:errors.length===0,errors};
}
