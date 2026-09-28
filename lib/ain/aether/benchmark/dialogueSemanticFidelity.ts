import type { MultiSpiralField, CrossSpiralRelation } from './multiSpiral';
import type { AethericGestaltCandidate } from './fieldOfFields';
import { adjudicateBalancedAetherUtterance } from './fieldDialogueFalsification';

export type DialogueClaimKind=
  | 'spirals_related'
  | 'spirals_more_independent'
  | 'trajectory_pair'
  | 'gestalt_partiality';

export interface EvidenceBoundUtterance {
  utteranceRef:string;
  text:string;
  claimKind:DialogueClaimKind;
  spiralRefs:string[];
  relationRefs:string[];
  fieldAnchorTerms:string[];
}

export interface HumanLegibleFieldProvenance {
  utteranceRef:string;
  whyThisReflection:string;
  spiralEvidence:Array<{
    spiralRef:string;
    domain:string;
    trajectoryClassification:string;
    whyItMattered:string;
  }>;
  relationEvidence:Array<{
    relationRef:string;
    kind:string;
    whyItMattered:string;
  }>;
  nonfitSpiralRefs:string[];
  uncertainty:string;
  memberCheck:string;
}

export interface DialogueSemanticFidelityResult {
  valid:boolean;
  errors:string[];
  utterance:EvidenceBoundUtterance;
  provenance:HumanLegibleFieldProvenance|null;
}

function normalize(xs:string[]):string[]{ return [...new Set(xs)]; }

function relationByRef(field:MultiSpiralField,ref:string):CrossSpiralRelation|undefined{
  return field.crossSpiralRelations.find(r=>r.relationRef===ref);
}

function relationBetween(field:MultiSpiralField,a:string,b:string){
  return field.crossSpiralRelations.find(r=>
    new Set([r.aSpiralRef,r.bSpiralRef]).has(a) &&
    new Set([r.aSpiralRef,r.bSpiralRef]).has(b)
  );
}

export function buildEvidenceBoundUtterance(
  field:MultiSpiralField,
  gestalt:AethericGestaltCandidate,
  claimKind:DialogueClaimKind,
  spiralRefs:string[],
):EvidenceBoundUtterance{
  const refs=normalize(spiralRefs);
  const relations:CrossSpiralRelation[]=[];

  for(let i=0;i<refs.length;i++){
    for(let j=i+1;j<refs.length;j++){
      const relation=relationBetween(field,refs[i],refs[j]);
      if(relation) relations.push(relation);
    }
  }

  let text='';
  if(claimKind==='spirals_related'){
    text=`I notice ${refs.join(' and ')} are moving in related ways in the reflected field. Does that connection feel real to you?`;
  } else if(claimKind==='spirals_more_independent'){
    text=`I notice ${refs.join(' and ')} appear more independent in the reflected field right now. Is that a useful reflection?`;
  } else if(claimKind==='trajectory_pair'){
    const descriptions=refs.map(ref=>{
      const spiral=field.spirals.find(s=>s.spiralRef===ref);
      return spiral?`${ref} is showing ${spiral.trajectory.classification.replace(/_/g,' ')}`:`${ref} is not present`;
    });
    text=`I notice ${descriptions.join(' while ')}. I do not know whether those movements are related. Do you?`;
  } else {
    text=`I notice ${refs.join(', ')} are moving in related ways strongly enough to form a partial field pattern, while other parts of the field remain outside it. Does that connection feel meaningful to you?`;
  }

  return {
    utteranceRef:'evidence-bound:'+claimKind+':'+refs.join(':'),
    text,
    claimKind,
    spiralRefs:refs,
    relationRefs:relations.map(r=>r.relationRef),
    fieldAnchorTerms:refs,
  };
}

function validateClaimSemantics(
  field:MultiSpiralField,
  gestalt:AethericGestaltCandidate,
  utterance:EvidenceBoundUtterance,
):string[]{
  const errors:string[]=[];
  const known=new Set(field.spirals.map(s=>s.spiralRef));

  for(const ref of utterance.spiralRefs){
    if(!known.has(ref)) errors.push('unknown_spiral:'+ref);
  }
  for(const ref of utterance.relationRefs){
    if(!relationByRef(field,ref)) errors.push('unknown_relation:'+ref);
  }

  if(utterance.claimKind==='spirals_related'){
    if(utterance.spiralRefs.length<2) errors.push('related_claim_requires_two_spirals');
    for(let i=0;i<utterance.spiralRefs.length;i++){
      for(let j=i+1;j<utterance.spiralRefs.length;j++){
        const rel=relationBetween(field,utterance.spiralRefs[i],utterance.spiralRefs[j]);
        if(!rel||rel.kind==='independent_movement'){
          errors.push('unsupported_related_pair:'+utterance.spiralRefs[i]+'::'+utterance.spiralRefs[j]);
        }
      }
    }
  }

  if(utterance.claimKind==='spirals_more_independent'){
    if(utterance.spiralRefs.length!==2) errors.push('independent_claim_requires_pair');
    if(utterance.spiralRefs.length===2){
      const rel=relationBetween(field,utterance.spiralRefs[0],utterance.spiralRefs[1]);
      if(!rel||rel.kind!=='independent_movement'){
        errors.push('unsupported_independence_claim');
      }
    }
  }

  if(utterance.claimKind==='trajectory_pair'){
    if(utterance.spiralRefs.length!==2) errors.push('trajectory_pair_requires_two_spirals');
  }

  if(utterance.claimKind==='gestalt_partiality'){
    for(const ref of utterance.spiralRefs){
      if(!gestalt.participatingSpiralRefs.includes(ref)){
        errors.push('spiral_not_in_gestalt:'+ref);
      }
    }
    if(gestalt.excludedSpiralRefs.length===0) errors.push('partiality_claim_without_nonfit');
  }

  return errors;
}

export function explainEvidenceBoundUtterance(
  field:MultiSpiralField,
  gestalt:AethericGestaltCandidate,
  utterance:EvidenceBoundUtterance,
):HumanLegibleFieldProvenance{
  const spiralEvidence=utterance.spiralRefs.map(ref=>{
    const spiral=field.spirals.find(s=>s.spiralRef===ref)!;
    return {
      spiralRef:ref,
      domain:spiral.domain,
      trajectoryClassification:spiral.trajectory.classification,
      whyItMattered:`${ref} is currently represented as ${spiral.trajectory.classification.replace(/_/g,' ')}.`,
    };
  });

  const relationEvidence=utterance.relationRefs
    .map(ref=>relationByRef(field,ref))
    .filter((r):r is CrossSpiralRelation=>Boolean(r))
    .map(r=>({
      relationRef:r.relationRef,
      kind:r.kind,
      whyItMattered:`${r.aSpiralRef} and ${r.bSpiralRef} are represented as ${r.kind.replace(/_/g,' ')} in the current reflected field.`,
    }));

  const whyThisReflection=
    utterance.claimKind==='spirals_related'
      ? 'I offered the reflection because the named life areas have an explicit non-independent relation in the current field, not simply because they appeared at the same time.'
      : utterance.claimKind==='spirals_more_independent'
        ? 'I offered the reflection because the named life areas are currently represented as moving independently rather than through a stronger cross-spiral relation.'
        : utterance.claimKind==='trajectory_pair'
          ? 'I offered the reflection because the named life areas have different explicit trajectory classifications that can be compared without assuming that one causes the other.'
          : 'I offered the reflection because these life areas participate in the current gestalt while other life areas remain explicitly outside it.';

  return {
    utteranceRef:utterance.utteranceRef,
    whyThisReflection,
    spiralEvidence,
    relationEvidence,
    nonfitSpiralRefs:[...gestalt.excludedSpiralRefs],
    uncertainty:'This explains why the reflection was offered; it does not establish the final meaning of the pattern or whether the member experiences the relation the same way.',
    memberCheck:'Does this explanation match your experience of why these areas belong together, or should I reshape the reflection?',
  };
}

export function validateDialogueSemanticFidelity(
  field:MultiSpiralField,
  gestalt:AethericGestaltCandidate,
  utterance:EvidenceBoundUtterance,
):DialogueSemanticFidelityResult{
  const errors=[
    ...validateClaimSemantics(field,gestalt,utterance),
  ];

  const posture=adjudicateBalancedAetherUtterance(utterance.text,utterance.fieldAnchorTerms);
  if(!posture.valid){
    errors.push('dialogue_posture:'+posture.disposition);
  }

  const lower=utterance.text.toLowerCase();
  for(const ref of utterance.spiralRefs){
    if(!lower.includes(ref.toLowerCase())) errors.push('spoken_text_missing_spiral:'+ref);
  }

  const provenance=errors.length===0
    ? explainEvidenceBoundUtterance(field,gestalt,utterance)
    : null;

  return {valid:errors.length===0,errors,utterance,provenance};
}
