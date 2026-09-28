import type { AetherTrajectory, TrajectoryPattern } from './fieldTrajectory';

export type LifeDomain =
  | 'relationship'
  | 'family'
  | 'work'
  | 'creative'
  | 'body'
  | 'spiritual'
  | 'community'
  | 'other';

export interface DomainSpiral {
  spiralRef:string;
  domain:LifeDomain;
  trajectory:AetherTrajectory;
  memberLabel?:string;
}

export type CrossSpiralRelationKind =
  | 'co_convergence'
  | 'timing_mismatch'
  | 'tension'
  | 'mutual_support'
  | 'independent_movement'
  | 'shared_recurrence'
  | 'shared_dissolution';

export interface CrossSpiralRelation {
  relationRef:string;
  aSpiralRef:string;
  bSpiralRef:string;
  kind:CrossSpiralRelationKind;
  basis:string[];
  provisional:true;
}

export interface MultiSpiralField {
  fieldRef:string;
  spirals:DomainSpiral[];
  crossSpiralRelations:CrossSpiralRelation[];
  singleStageAuthority:false;
  developmentalRankAuthority:false;
  predictiveAuthority:false;
  finalMeaningAuthority:'member';
  provisional:true;
}

function isConvergent(t:TrajectoryPattern){
  return t==='sustained_convergence'||t==='phase_change';
}
function isDissolving(t:TrajectoryPattern){
  return t==='dissolution';
}
function isRecurring(t:TrajectoryPattern){
  return t==='recurrence';
}

function relationFor(a:DomainSpiral,b:DomainSpiral):CrossSpiralRelation{
  const ac=a.trajectory.classification;
  const bc=b.trajectory.classification;
  let kind:CrossSpiralRelationKind='independent_movement';
  const basis:string[]=[];

  if(isConvergent(ac)&&isConvergent(bc)){
    kind='co_convergence';
    basis.push('both_spirals_show_convergent_or_phase_change_movement');
  } else if(isDissolving(ac)&&isConvergent(bc) || isConvergent(ac)&&isDissolving(bc)){
    kind='timing_mismatch';
    basis.push('one_spiral_is_dissolving_while_another_is_converging');
  } else if(isRecurring(ac)&&isRecurring(bc)){
    kind='shared_recurrence';
    basis.push('both_spirals_show_recurrence');
  } else if(isDissolving(ac)&&isDissolving(bc)){
    kind='shared_dissolution';
    basis.push('both_spirals_show_dissolution');
  } else if(
    (ac==='oscillation'&&isConvergent(bc)) ||
    (bc==='oscillation'&&isConvergent(ac))
  ){
    kind='tension';
    basis.push('one_spiral_oscillates_while_another_converges');
  } else if(
    isConvergent(ac)&&bc==='ordinary_fluctuation' ||
    isConvergent(bc)&&ac==='ordinary_fluctuation'
  ){
    kind='mutual_support';
    basis.push('one_spiral_provides_stable_convergence_beside_fluctuation');
  } else {
    basis.push('trajectories_remain_distinct_without_declared_dependency');
  }

  return {
    relationRef:['cross',a.spiralRef,b.spiralRef].sort().join(':'),
    aSpiralRef:a.spiralRef,
    bSpiralRef:b.spiralRef,
    kind,
    basis,
    provisional:true,
  };
}

export function buildMultiSpiralField(
  fieldRef:string,
  spirals:DomainSpiral[],
):MultiSpiralField{
  const relations:CrossSpiralRelation[]=[];
  for(let i=0;i<spirals.length;i++){
    for(let j=i+1;j<spirals.length;j++){
      relations.push(relationFor(spirals[i],spirals[j]));
    }
  }
  return {
    fieldRef,
    spirals:[...spirals],
    crossSpiralRelations:relations,
    singleStageAuthority:false,
    developmentalRankAuthority:false,
    predictiveAuthority:false,
    finalMeaningAuthority:'member',
    provisional:true,
  };
}

export function validateMultiSpiralField(field:MultiSpiralField){
  const errors:string[]=[];
  const refs=field.spirals.map(s=>s.spiralRef);
  if(new Set(refs).size!==refs.length) errors.push('duplicate_spiral_ref');
  if(field.singleStageAuthority) errors.push('single_stage_authority_granted');
  if(field.developmentalRankAuthority) errors.push('developmental_rank_authority_granted');
  if(field.predictiveAuthority) errors.push('predictive_authority_granted');
  if(field.finalMeaningAuthority!=='member') errors.push('final_meaning_not_member_owned');
  if(!field.provisional) errors.push('field_not_provisional');

  for(const relation of field.crossSpiralRelations){
    if(relation.aSpiralRef===relation.bSpiralRef) errors.push('self_relation:'+relation.relationRef);
    if(!refs.includes(relation.aSpiralRef)||!refs.includes(relation.bSpiralRef)){
      errors.push('unknown_spiral_relation:'+relation.relationRef);
    }
    if(!relation.provisional) errors.push('relation_not_provisional:'+relation.relationRef);
  }

  return {valid:errors.length===0,errors};
}

export function summarizeDomainStates(field:MultiSpiralField){
  return field.spirals.map(s=>({
    domain:s.domain,
    classification:s.trajectory.classification,
    confidence:s.trajectory.confidence,
  }));
}
