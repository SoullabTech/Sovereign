import type { BenchmarkEpistemicRole } from './corpus';
import type { RepresentedTime } from './temporalGraph';

export type AetherPermission='admitted'|'reference_only'|'excluded';
export type AetherSourceStatus=
  | 'active'
  | 'historical'
  | 'prospective'
  | 'superseded'
  | 'revoked'
  | 'reference_only';

export type AetherRelationStatus=
  | 'active_candidate'
  | 'complicated'
  | 'weakened'
  | 'rejected'
  | 'superseded';

export type AetherRelationStanding=
  | 'candidate_unestablished'
  | 'source_declared'
  | 'historical_record';

export interface AetherSourceNode {
  sourceRef:string;
  permission:AetherPermission;
  epistemicRole:BenchmarkEpistemicRole;
  representedTime:RepresentedTime;
  status:AetherSourceStatus;
  reliedUpon:boolean;
  speakable:boolean;
  disclosed:boolean;
  uncertainty:number;
}

export interface AetherRelationCandidate {
  relationRef:string;
  endpointRefs:string[];
  supportRefs:string[];
  criticalSupportRefs:string[];
  predicate:
    | 'co_presence'
    | 'comparison'
    | 'resonance'
    | 'tension'
    | 'contrast'
    | 'possible_continuity'
    | 'symbolic_correspondence'
    | 'temporal_sequence'
    | 'explanatory_possibility';
  standing:AetherRelationStanding;
  status:AetherRelationStatus;
  claimTemporalNeed:'current'|'historical'|'prospective'|'mixed';
  counterevidenceRefs:string[];
  uncertainty:number;
  introducedBy:'source_declared'|'maia_candidate'|'aether_candidate';
}
export interface AetherCorrection {
  correctionRef:string;
  targetRelationRef:string;
  effect:'weaken'|'reject'|'supersede';
  introducedBy:'member'|'governed_source';
}

export interface AetherAbsence {
  absenceRef:string;
  subject:string;
  reason:'not_admitted'|'not_retrieved'|'no_support'|'revoked'|'unknown';
}

export interface AetherUncertainty {
  uncertaintyRef:string;
  subjectRef:string;
  note:string;
}

export interface AetherSynthesisPermissions {
  allowCreativeRelation:boolean;
  allowCausalClaim:false;
  allowPrediction:false;
  allowIdentityClaim:false;
  allowDiagnosticClaim:false;
  allowThirdPartyInteriority:false;
  allowPersistence:false;
  requireAblation:true;
}

export interface AetherInput {
  inquiryRef:string;
  temporalNeed:'current'|'historical'|'prospective'|'mixed';
  sources:AetherSourceNode[];
  relations:AetherRelationCandidate[];
  contradictions:Array<{contradictionRef:string;sourceRefs:string[];note:string}>;
  absences:AetherAbsence[];
  corrections:AetherCorrection[];
  uncertainties:AetherUncertainty[];
  synthesisPermissions:AetherSynthesisPermissions;
}

export interface AetherValidation {
  valid:boolean;
  errors:string[];
}
function unique(values:string[]):boolean{
  return new Set(values).size===values.length;
}

export function applyAetherCorrections(input:AetherInput):AetherInput{
  const relations=input.relations.map(r=>({...r}));
  const byRef=new Map(relations.map(r=>[r.relationRef,r]));

  for(const correction of input.corrections){
    const relation=byRef.get(correction.targetRelationRef);
    if(!relation)continue;
    if(correction.effect==='reject')relation.status='rejected';
    if(correction.effect==='supersede')relation.status='superseded';
    if(correction.effect==='weaken'&&relation.status==='active_candidate')relation.status='weakened';
  }

  return {...input,relations};
}

export function validateAetherInput(input:AetherInput):AetherValidation{
  const errors:string[]=[];
  const sourceRefs=input.sources.map(s=>s.sourceRef);
  const relationRefs=input.relations.map(r=>r.relationRef);
  const sources=new Map(input.sources.map(s=>[s.sourceRef,s]));

  if(!unique(sourceRefs))errors.push('duplicate_source_ref');
  if(!unique(relationRefs))errors.push('duplicate_relation_ref');

  for(const source of input.sources){
    if(source.uncertainty<0||source.uncertainty>1)errors.push('invalid_source_uncertainty:'+source.sourceRef);
    if(source.reliedUpon&&source.permission!=='admitted')errors.push('relied_source_not_admitted:'+source.sourceRef);
    if(source.reliedUpon&&source.status==='revoked')errors.push('relied_source_revoked:'+source.sourceRef);
  }
  for(const relation of input.relations){
    if(relation.uncertainty<0||relation.uncertainty>1)errors.push('invalid_relation_uncertainty:'+relation.relationRef);
    if(!unique(relation.endpointRefs))errors.push('duplicate_relation_endpoint:'+relation.relationRef);
    if(!unique(relation.supportRefs))errors.push('duplicate_relation_support:'+relation.relationRef);

    for(const ref of [...relation.endpointRefs,...relation.supportRefs,...relation.counterevidenceRefs]){
      if(!sources.has(ref))errors.push('relation_unknown_source:'+relation.relationRef+':'+ref);
    }

    for(const ref of relation.supportRefs){
      const source=sources.get(ref);
      if(source&&source.permission!=='admitted')errors.push('relation_support_not_admitted:'+relation.relationRef+':'+ref);
      if(source&&source.status==='revoked')errors.push('relation_support_revoked:'+relation.relationRef+':'+ref);
      if(relation.claimTemporalNeed==='current'&&source&&source.status==='superseded'){
        errors.push('current_relation_uses_superseded_source:'+relation.relationRef+':'+ref);
      }
    }

    for(const critical of relation.criticalSupportRefs){
      if(!relation.supportRefs.includes(critical))errors.push('critical_not_support:'+relation.relationRef+':'+critical);
    }

    if(relation.introducedBy==='aether_candidate'&&new Set(relation.supportRefs).size<2){
      errors.push('aether_relation_requires_multiple_sources:'+relation.relationRef);
    }
  }

  const relationSet=new Set(relationRefs);
  for(const correction of input.corrections){
    if(!relationSet.has(correction.targetRelationRef))errors.push('correction_unknown_relation:'+correction.correctionRef);
  }

  for(const contradiction of input.contradictions){
    if(contradiction.sourceRefs.length<2)errors.push('contradiction_requires_multiple_sources:'+contradiction.contradictionRef);
    for(const ref of contradiction.sourceRefs){
      if(!sources.has(ref))errors.push('contradiction_unknown_source:'+contradiction.contradictionRef+':'+ref);
    }
  }

  if(input.synthesisPermissions.allowCausalClaim!==false)errors.push('causal_claim_must_remain_false');
  if(input.synthesisPermissions.allowPrediction!==false)errors.push('prediction_must_remain_false');
  if(input.synthesisPermissions.allowIdentityClaim!==false)errors.push('identity_claim_must_remain_false');
  if(input.synthesisPermissions.allowDiagnosticClaim!==false)errors.push('diagnostic_claim_must_remain_false');
  if(input.synthesisPermissions.allowThirdPartyInteriority!==false)errors.push('third_party_interiority_must_remain_false');
  if(input.synthesisPermissions.allowPersistence!==false)errors.push('persistence_must_remain_false');
  if(input.synthesisPermissions.requireAblation!==true)errors.push('ablation_required');

  return {valid:errors.length===0,errors};
}
export interface AetherAblationResult {
  removedSourceRef:string;
  invalidatedRelations:string[];
  survivingRelations:string[];
  removedContradictions:string[];
}

export function ablateAetherSource(input:AetherInput,sourceRef:string):AetherAblationResult{
  const invalidated=input.relations
    .filter(r=>r.supportRefs.includes(sourceRef)||r.endpointRefs.includes(sourceRef))
    .map(r=>r.relationRef);
  const invalidatedSet=new Set(invalidated);

  return {
    removedSourceRef:sourceRef,
    invalidatedRelations:invalidated,
    survivingRelations:input.relations
      .filter(r=>!invalidatedSet.has(r.relationRef))
      .map(r=>r.relationRef),
    removedContradictions:input.contradictions
      .filter(c=>c.sourceRefs.includes(sourceRef))
      .map(c=>c.contradictionRef),
  };
}

export function validateCriticalAblations(input:AetherInput):AetherValidation{
  const errors:string[]=[];
  for(const relation of input.relations){
    if(
      relation.status==='rejected'||
      relation.status==='superseded'||
      relation.criticalSupportRefs.length===0
    ) continue;

    for(const critical of relation.criticalSupportRefs){
      const result=ablateAetherSource(input,critical);
      if(!result.invalidatedRelations.includes(relation.relationRef)){
        errors.push('critical_ablation_did_not_invalidate:'+relation.relationRef+':'+critical);
      }
    }
  }
  return {valid:errors.length===0,errors};
}
