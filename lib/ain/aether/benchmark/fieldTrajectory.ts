import type { MemberAetherField } from './memberField';
import { compareMemberAetherFields, deriveFieldGeometry, type MemberAetherFieldDelta } from './fieldChange';

export type TrajectoryPattern=
  | 'oscillation'
  | 'recurrence'
  | 'sustained_convergence'
  | 'dissolution'
  | 'phase_change'
  | 'ordinary_fluctuation'
  | 'insufficient_evidence';

export interface TrajectoryMoment {
  index:number;
  fieldRef:string;
  motifRefs:string[];
  relationRefs:string[];
}

export interface AetherTrajectory {
  trajectoryRef:string;
  moments:TrajectoryMoment[];
  deltas:MemberAetherFieldDelta[];
  classification:TrajectoryPattern;
  supportingSignals:string[];
  confidence:number;
  predictiveAuthority:false;
  destinyAuthority:false;
  developmentalRankAuthority:false;
  finalMeaningAuthority:'member';
  provisional:true;
}

function unique<T>(xs:T[]):T[]{ return [...new Set(xs)]; }

function motifSet(field:MemberAetherField):Set<string>{
  return new Set(field.patterns.filter(p=>p.memberRecognition!=='rejected').map(p=>p.patternRef));
}

function relationSet(field:MemberAetherField):Set<string>{
  return new Set(deriveFieldGeometry(field).relations.map(r=>r.relationRef));
}

function jaccard(a:Set<string>,b:Set<string>):number{
  const union=new Set([...a,...b]);
  if(union.size===0) return 1;
  let intersection=0;
  for(const x of a) if(b.has(x)) intersection++;
  return intersection/union.size;
}

function recurringMotifs(fields:MemberAetherField[]):string[]{
  const byRef=new Map<string,number[]>();
  fields.forEach((field,i)=>{
    for(const p of field.patterns){
      const xs=byRef.get(p.patternRef)??[];
      xs.push(i);
      byRef.set(p.patternRef,xs);
    }
  });
  return [...byRef.entries()]
    .filter(([,idx])=>idx.length>=2 && idx.some((x,i)=>i>0&&x-idx[i-1]>1))
    .map(([ref])=>ref);
}

export function deriveFieldTrajectory(
  trajectoryRef:string,
  fields:MemberAetherField[],
):AetherTrajectory {
  const moments=fields.map((field,index)=>({
    index,
    fieldRef:field.fieldRef,
    motifRefs:[...motifSet(field)],
    relationRefs:[...relationSet(field)],
  }));

  const deltas:MemberAetherFieldDelta[]=[];
  for(let i=0;i<fields.length-1;i++){
    deltas.push(compareMemberAetherFields(fields[i],fields[i+1]));
  }

  if(fields.length<3){
    return {
      trajectoryRef,moments,deltas,
      classification:'insufficient_evidence',
      supportingSignals:['fewer_than_three_moments'],
      confidence:.1,
      predictiveAuthority:false,
      destinyAuthority:false,
      developmentalRankAuthority:false,
      finalMeaningAuthority:'member',
      provisional:true,
    };
  }

  const signals:string[]=[];
  const recurring=recurringMotifs(fields);
  const relationSimilarities:number[]=[];
  const motifSimilarities:number[]=[];
  for(let i=0;i<fields.length-1;i++){
    relationSimilarities.push(jaccard(relationSet(fields[i]),relationSet(fields[i+1])));
    motifSimilarities.push(jaccard(motifSet(fields[i]),motifSet(fields[i+1])));
  }

  const totalAdded=deltas.reduce((n,d)=>n+d.geometryDelta.addedRelations.length,0);
  const totalRemoved=deltas.reduce((n,d)=>n+d.geometryDelta.removedRelations.length,0);
  const firstLastRelationSimilarity=jaccard(relationSet(fields[0]),relationSet(fields[fields.length-1]));
  const firstLastMotifSimilarity=jaccard(motifSet(fields[0]),motifSet(fields[fields.length-1]));

  const recurringCrossFacet=fields.some(field=>
    field.patterns.some(p=>p.contributingFacetRefs.length>=2&&p.movements.includes('converging'))
  );
  const repeatedConvergence=deltas.filter(d=>
    d.patternDeltas.some(p=>p.kind==='intensified'||p.kind==='reconfigured')
  ).length>=2;

  const disappearedAcrossRun=unique(deltas.flatMap(d=>
    d.patternDeltas.filter(p=>p.kind==='disappeared'||p.kind==='dissipated').map(p=>p.patternRef)
  ));
  const reappearedLater=recurring.some(ref=>disappearedAcrossRun.includes(ref));

  const strongStructuralTurn=
    firstLastRelationSimilarity<.35 &&
    totalAdded>=3 &&
    totalRemoved>=3;

  const stableMotifsButNewGeometry=
    firstLastMotifSimilarity>=.4 &&
    firstLastRelationSimilarity<.35;

  const alternatingSimilarity=
    relationSimilarities.length>=3 &&
    relationSimilarities[0]<.5 &&
    relationSimilarities[1]>.5 &&
    relationSimilarities[2]<.5;

  let classification:TrajectoryPattern='ordinary_fluctuation';
  let confidence=.45;

  if(alternatingSimilarity){
    classification='oscillation';
    confidence=.7;
    signals.push('alternating_field_similarity');
  } else if(reappearedLater){
    classification='recurrence';
    confidence=.75;
    signals.push('motif_returns_after_absence');
  } else if(strongStructuralTurn&&stableMotifsButNewGeometry){
    classification='phase_change';
    confidence=.8;
    signals.push('persistent_motifs_new_relational_organization');
    signals.push('low_first_last_relation_similarity');
  } else if(repeatedConvergence&&recurringCrossFacet){
    classification='sustained_convergence';
    confidence=.7;
    signals.push('repeated_intensification_or_reconfiguration');
    signals.push('cross_facet_convergence');
  } else if(disappearedAcrossRun.length>=2&&totalRemoved>totalAdded){
    classification='dissolution';
    confidence=.7;
    signals.push('multiple_patterns_recede');
    signals.push('more_relations_removed_than_added');
  } else {
    signals.push('changes_do_not_cross_phase_threshold');
  }

  return {
    trajectoryRef,moments,deltas,classification,
    supportingSignals:signals,
    confidence,
    predictiveAuthority:false,
    destinyAuthority:false,
    developmentalRankAuthority:false,
    finalMeaningAuthority:'member',
    provisional:true,
  };
}

export function validateAetherTrajectory(t:AetherTrajectory){
  const errors:string[]=[];
  if(t.predictiveAuthority) errors.push('predictive_authority_granted');
  if(t.destinyAuthority) errors.push('destiny_authority_granted');
  if(t.developmentalRankAuthority) errors.push('developmental_rank_authority_granted');
  if(t.finalMeaningAuthority!=='member') errors.push('final_meaning_not_member_owned');
  if(!t.provisional) errors.push('trajectory_not_provisional');
  if(t.confidence<0||t.confidence>1) errors.push('invalid_confidence');
  if(t.classification!=='insufficient_evidence'&&t.moments.length<3){
    errors.push('trajectory_claim_with_too_few_moments');
  }
  return {valid:errors.length===0,errors};
}
