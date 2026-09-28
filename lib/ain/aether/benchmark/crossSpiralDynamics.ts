import type {
  CrossSpiralRelation,
  CrossSpiralRelationKind,
  MultiSpiralField,
} from './multiSpiral';

export type CrossSpiralDeltaKind=
  | 'formed'
  | 'dissolved'
  | 'changed_kind'
  | 'persisted';

export interface CrossSpiralRelationDelta {
  relationRef:string;
  aSpiralRef:string;
  bSpiralRef:string;
  kind:CrossSpiralDeltaKind;
  beforeKind:CrossSpiralRelationKind|null;
  afterKind:CrossSpiralRelationKind|null;
  interpretation:
    | 'relation_formed'
    | 'relation_dissolved'
    | 'relation_reconfigured'
    | 'relation_persisted';
  causalAuthority:false;
  predictiveAuthority:false;
  provisional:true;
}

export interface CrossSpiralFieldDelta {
  fromFieldRef:string;
  toFieldRef:string;
  relationDeltas:CrossSpiralRelationDelta[];
  newlyRelatedPairs:string[];
  newlyIndependentPairs:string[];
  changedRelationPairs:string[];
  causalAuthority:false;
  predictiveAuthority:false;
  finalMeaningAuthority:'member';
  provisional:true;
}

function pairKey(r:Pick<CrossSpiralRelation,'aSpiralRef'|'bSpiralRef'>){
  return [r.aSpiralRef,r.bSpiralRef].sort().join('::');
}

function relationMap(field:MultiSpiralField){
  return new Map(field.crossSpiralRelations.map(r=>[pairKey(r),r]));
}

export function compareMultiSpiralFields(
  before:MultiSpiralField,
  after:MultiSpiralField,
):CrossSpiralFieldDelta{
  const bm=relationMap(before);
  const am=relationMap(after);
  const keys=[...new Set([...bm.keys(),...am.keys()])];
  const relationDeltas:CrossSpiralRelationDelta[]=[];

  for(const key of keys){
    const b=bm.get(key);
    const a=am.get(key);

    if(!b&&a){
      relationDeltas.push({
        relationRef:a.relationRef,
        aSpiralRef:a.aSpiralRef,
        bSpiralRef:a.bSpiralRef,
        kind:'formed',
        beforeKind:null,
        afterKind:a.kind,
        interpretation:'relation_formed',
        causalAuthority:false,
        predictiveAuthority:false,
        provisional:true,
      });
      continue;
    }

    if(b&&!a){
      relationDeltas.push({
        relationRef:b.relationRef,
        aSpiralRef:b.aSpiralRef,
        bSpiralRef:b.bSpiralRef,
        kind:'dissolved',
        beforeKind:b.kind,
        afterKind:null,
        interpretation:'relation_dissolved',
        causalAuthority:false,
        predictiveAuthority:false,
        provisional:true,
      });
      continue;
    }

    const beforeRel=b!;
    const afterRel=a!;
    relationDeltas.push({
      relationRef:afterRel.relationRef,
      aSpiralRef:afterRel.aSpiralRef,
      bSpiralRef:afterRel.bSpiralRef,
      kind:beforeRel.kind===afterRel.kind?'persisted':'changed_kind',
      beforeKind:beforeRel.kind,
      afterKind:afterRel.kind,
      interpretation:beforeRel.kind===afterRel.kind?'relation_persisted':'relation_reconfigured',
      causalAuthority:false,
      predictiveAuthority:false,
      provisional:true,
    });
  }

  const newlyRelatedPairs=relationDeltas
    .filter(d=>
      d.beforeKind==='independent_movement' &&
      d.afterKind!==null &&
      d.afterKind!=='independent_movement'
    )
    .map(d=>[d.aSpiralRef,d.bSpiralRef].sort().join('::'));

  const newlyIndependentPairs=relationDeltas
    .filter(d=>
      d.beforeKind!==null &&
      d.beforeKind!=='independent_movement' &&
      d.afterKind==='independent_movement'
    )
    .map(d=>[d.aSpiralRef,d.bSpiralRef].sort().join('::'));

  const changedRelationPairs=relationDeltas
    .filter(d=>d.kind==='changed_kind')
    .map(d=>[d.aSpiralRef,d.bSpiralRef].sort().join('::'));

  return {
    fromFieldRef:before.fieldRef,
    toFieldRef:after.fieldRef,
    relationDeltas,
    newlyRelatedPairs,
    newlyIndependentPairs,
    changedRelationPairs,
    causalAuthority:false,
    predictiveAuthority:false,
    finalMeaningAuthority:'member',
    provisional:true,
  };
}

export interface CrossSpiralEmergenceCandidate {
  candidateRef:string;
  pairRefs:string[];
  proposition:string;
  basis:string[];
  causalAuthority:false;
  predictiveAuthority:false;
  destinyAuthority:false;
  provisional:true;
}

export function generateCrossSpiralEmergence(
  delta:CrossSpiralFieldDelta,
):CrossSpiralEmergenceCandidate[]{
  const out:CrossSpiralEmergenceCandidate[]=[];

  for(const pair of delta.newlyRelatedPairs){
    out.push({
      candidateRef:'cross-spiral-emergence:'+pair.replace(/::/g,':'),
      pairRefs:pair.split('::'),
      proposition:'Two previously independent domain trajectories now show a provisional relational configuration worth human inquiry.',
      basis:['pair_moved_from_independent_to_related'],
      causalAuthority:false,
      predictiveAuthority:false,
      destinyAuthority:false,
      provisional:true,
    });
  }

  for(const pair of delta.newlyIndependentPairs){
    out.push({
      candidateRef:'cross-spiral-release:'+pair.replace(/::/g,':'),
      pairRefs:pair.split('::'),
      proposition:'Two domain trajectories that were previously related now appear to be moving more independently in the reflected field.',
      basis:['pair_moved_from_related_to_independent'],
      causalAuthority:false,
      predictiveAuthority:false,
      destinyAuthority:false,
      provisional:true,
    });
  }

  return out;
}

export function validateCrossSpiralDynamics(
  delta:CrossSpiralFieldDelta,
  candidates:CrossSpiralEmergenceCandidate[]=generateCrossSpiralEmergence(delta),
){
  const errors:string[]=[];
  if(delta.causalAuthority) errors.push('causal_authority_granted');
  if(delta.predictiveAuthority) errors.push('predictive_authority_granted');
  if(delta.finalMeaningAuthority!=='member') errors.push('final_meaning_not_member_owned');
  if(!delta.provisional) errors.push('delta_not_provisional');

  for(const d of delta.relationDeltas){
    if(d.causalAuthority) errors.push('relation_delta_causal_authority:'+d.relationRef);
    if(d.predictiveAuthority) errors.push('relation_delta_predictive_authority:'+d.relationRef);
    if(!d.provisional) errors.push('relation_delta_not_provisional:'+d.relationRef);
  }

  for(const c of candidates){
    if(c.causalAuthority) errors.push('candidate_causal_authority:'+c.candidateRef);
    if(c.predictiveAuthority) errors.push('candidate_predictive_authority:'+c.candidateRef);
    if(c.destinyAuthority) errors.push('candidate_destiny_authority:'+c.candidateRef);
    if(!c.provisional) errors.push('candidate_not_provisional:'+c.candidateRef);
  }

  return {valid:errors.length===0,errors};
}
