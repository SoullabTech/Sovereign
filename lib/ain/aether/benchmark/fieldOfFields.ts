import type { MultiSpiralField, CrossSpiralRelation } from './multiSpiral';

export type GestaltStanding=
  | 'candidate_gestalt'
  | 'partial_gestalt'
  | 'insufficient_gestalt';

export interface AethericGestaltCandidate {
  gestaltRef:string;
  participatingSpiralRefs:string[];
  excludedSpiralRefs:string[];
  supportingRelationRefs:string[];
  excludedRelationRefs:string[];
  standing:GestaltStanding;
  proposition:string;
  preservesNonfit:true;
  totalizingAuthority:false;
  identityAuthority:false;
  causalAuthority:false;
  predictiveAuthority:false;
  destinyAuthority:false;
  developmentalRankAuthority:false;
  soulRepresentationAuthority:false;
  finalMeaningAuthority:'member';
  provisional:true;
}

function relationWeight(r:CrossSpiralRelation):number{
  if(r.kind==='co_convergence') return 3;
  if(r.kind==='mutual_support') return 2;
  if(r.kind==='shared_recurrence') return 2;
  if(r.kind==='shared_dissolution') return 2;
  if(r.kind==='tension') return 1;
  if(r.kind==='timing_mismatch') return 1;
  return 0;
}

export function deriveAethericGestalt(field:MultiSpiralField):AethericGestaltCandidate{
  const score=new Map<string,number>();
  for(const spiral of field.spirals) score.set(spiral.spiralRef,0);

  for(const relation of field.crossSpiralRelations){
    const w=relationWeight(relation);
    score.set(relation.aSpiralRef,(score.get(relation.aSpiralRef)??0)+w);
    score.set(relation.bSpiralRef,(score.get(relation.bSpiralRef)??0)+w);
  }

  const ordered=[...score.entries()].sort((a,b)=>b[1]-a[1]);
  const max=ordered[0]?.[1]??0;
  const threshold=max>0?Math.max(2,max-1):Infinity;

  const participatingSpiralRefs=ordered
    .filter(([,s])=>s>=threshold)
    .map(([ref])=>ref);

  const participating=new Set(participatingSpiralRefs);
  const excludedSpiralRefs=field.spirals
    .map(s=>s.spiralRef)
    .filter(ref=>!participating.has(ref));

  const supportingRelationRefs=field.crossSpiralRelations
    .filter(r=>participating.has(r.aSpiralRef)&&participating.has(r.bSpiralRef)&&relationWeight(r)>0)
    .map(r=>r.relationRef);

  const excludedRelationRefs=field.crossSpiralRelations
    .filter(r=>!supportingRelationRefs.includes(r.relationRef))
    .map(r=>r.relationRef);

  const standing:GestaltStanding=
    participatingSpiralRefs.length>=3&&supportingRelationRefs.length>=2
      ? 'candidate_gestalt'
      : participatingSpiralRefs.length>=2&&supportingRelationRefs.length>=1
        ? 'partial_gestalt'
        : 'insufficient_gestalt';

  const proposition=
    standing==='candidate_gestalt'
      ? 'Several domain trajectories currently form a provisional higher-order relational configuration, while non-fitting domains remain explicitly outside the gestalt.'
      : standing==='partial_gestalt'
        ? 'A partial cross-domain configuration is visible, but the field does not yet support a broader gestalt.'
        : 'The current field does not support a higher-order gestalt beyond the individual and pairwise spiral relations.';

  return {
    gestaltRef:'aetheric-gestalt:'+field.fieldRef,
    participatingSpiralRefs,
    excludedSpiralRefs,
    supportingRelationRefs,
    excludedRelationRefs,
    standing,
    proposition,
    preservesNonfit:true,
    totalizingAuthority:false,
    identityAuthority:false,
    causalAuthority:false,
    predictiveAuthority:false,
    destinyAuthority:false,
    developmentalRankAuthority:false,
    soulRepresentationAuthority:false,
    finalMeaningAuthority:'member',
    provisional:true,
  };
}

export function validateAethericGestalt(
  field:MultiSpiralField,
  gestalt:AethericGestaltCandidate=deriveAethericGestalt(field),
){
  const errors:string[]=[];
  const allSpirals=new Set(field.spirals.map(s=>s.spiralRef));
  const union=new Set([...gestalt.participatingSpiralRefs,...gestalt.excludedSpiralRefs]);

  if(union.size!==allSpirals.size) errors.push('spiral_coverage_incomplete');
  for(const ref of allSpirals) if(!union.has(ref)) errors.push('missing_spiral:'+ref);
  if(gestalt.participatingSpiralRefs.some(ref=>gestalt.excludedSpiralRefs.includes(ref))){
    errors.push('spiral_both_participating_and_excluded');
  }
  if(!gestalt.preservesNonfit) errors.push('nonfit_not_preserved');
  if(gestalt.totalizingAuthority) errors.push('totalizing_authority_granted');
  if(gestalt.identityAuthority) errors.push('identity_authority_granted');
  if(gestalt.causalAuthority) errors.push('causal_authority_granted');
  if(gestalt.predictiveAuthority) errors.push('predictive_authority_granted');
  if(gestalt.destinyAuthority) errors.push('destiny_authority_granted');
  if(gestalt.developmentalRankAuthority) errors.push('developmental_rank_authority_granted');
  if(gestalt.soulRepresentationAuthority) errors.push('soul_representation_authority_granted');
  if(gestalt.finalMeaningAuthority!=='member') errors.push('final_meaning_not_member_owned');
  if(!gestalt.provisional) errors.push('gestalt_not_provisional');

  if(gestalt.standing==='candidate_gestalt' && gestalt.excludedSpiralRefs.length===0){
    errors.push('candidate_gestalt_totalizes_all_spirals');
  }

  return {valid:errors.length===0,errors};
}

export function ablateGestaltSpiral(
  field:MultiSpiralField,
  spiralRef:string,
):AethericGestaltCandidate{
  const next={
    ...field,
    spirals:field.spirals.filter(s=>s.spiralRef!==spiralRef),
    crossSpiralRelations:field.crossSpiralRelations.filter(r=>
      r.aSpiralRef!==spiralRef&&r.bSpiralRef!==spiralRef
    ),
  };
  return deriveAethericGestalt(next);
}
