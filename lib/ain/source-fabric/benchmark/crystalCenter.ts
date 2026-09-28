import type { AetherInput } from './aetherInput';
import type { AetherSynthesisCandidate } from './aetherSynthesis';

export type CrystalMode =
  | 'analytic'
  | 'associative'
  | 'temporal'
  | 'contradiction'
  | 'absence'
  | 'uncertainty'
  | 'imaginal';

export interface CrystalFacet {
  facetRef:string;
  mode:CrystalMode;
  sourceRefs:string[];
  relationRefs:string[];
  temporalNeed:AetherInput['temporalNeed'];
  standing:
    | 'evidential'
    | 'relational'
    | 'historical'
    | 'conflicted'
    | 'absent'
    | 'uncertain'
    | 'imaginal_provisional';
  proposition:string;
  collapsible:false;
}

export interface CrystalCenterField {
  inquiryRef:string;
  facets:CrystalFacet[];
  candidates:AetherSynthesisCandidate[];
  integrationPermissions:{
    allowCrossModeRelation:true;
    allowModeCollapse:false;
    allowContradictionErasure:false;
    allowAbsenceFilling:false;
    allowImaginalPromotion:false;
    allowWholePersonConclusion:false;
    allowPersistence:false;
  };
}

export function buildCrystalCenterField(
  input:AetherInput,
  candidates:AetherSynthesisCandidate[],
):CrystalCenterField {
  const facets:CrystalFacet[]=[];

  for (const source of input.sources) {
    facets.push({
      facetRef:'analytic:'+source.sourceRef,
      mode:'analytic',
      sourceRefs:[source.sourceRef],
      relationRefs:[],
      temporalNeed:input.temporalNeed,
      standing:'evidential',
      proposition:'Admitted source remains available according to its declared standing.',
      collapsible:false,
    });
    if (source.representedTime!=='is_being' || source.status==='superseded' || source.status==='historical') {
      facets.push({
        facetRef:'temporal:'+source.sourceRef,
        mode:'temporal',
        sourceRefs:[source.sourceRef],
        relationRefs:[],
        temporalNeed:input.temporalNeed,
        standing:'historical',
        proposition:'This source carries differentiated temporal standing.',
        collapsible:false,
      });
    }
  }

  for (const relation of input.relations) {
    if (relation.status==='rejected' || relation.status==='superseded') continue;
    facets.push({
      facetRef:'associative:'+relation.relationRef,
      mode:'associative',
      sourceRefs:[...relation.supportRefs],
      relationRefs:[relation.relationRef],
      temporalNeed:relation.claimTemporalNeed,
      standing:'relational',
      proposition:'A relation may be considered without changing the standing of its sources.',
      collapsible:false,
    });
  }

  for (const contradiction of input.contradictions) {
    facets.push({
      facetRef:'contradiction:'+contradiction.contradictionRef,
      mode:'contradiction',
      sourceRefs:[...contradiction.sourceRefs],
      relationRefs:[],
      temporalNeed:input.temporalNeed,
      standing:'conflicted',
      proposition:contradiction.note,
      collapsible:false,
    });
  }

  for (const absence of input.absences) {
    facets.push({
      facetRef:'absence:'+absence.absenceRef,
      mode:'absence',
      sourceRefs:[],
      relationRefs:[],
      temporalNeed:input.temporalNeed,
      standing:'absent',
      proposition:absence.subject+' remains absent: '+absence.reason,
      collapsible:false,
    });
  }

  for (const uncertainty of input.uncertainties) {
    facets.push({
      facetRef:'uncertainty:'+uncertainty.uncertaintyRef,
      mode:'uncertainty',
      sourceRefs:[],
      relationRefs:[uncertainty.subjectRef],
      temporalNeed:input.temporalNeed,
      standing:'uncertain',
      proposition:uncertainty.note,
      collapsible:false,
    });
  }

  for (const candidate of candidates.filter(c=>c.disposition==='admitted_provisional')) {
    facets.push({
      facetRef:'imaginal:'+candidate.candidateRef,
      mode:'imaginal',
      sourceRefs:[...candidate.supportRefs],
      relationRefs:[candidate.relationRef],
      temporalNeed:candidate.temporalNeed,
      standing:'imaginal_provisional',
      proposition:candidate.proposition,
      collapsible:false,
    });
  }

  return {
    inquiryRef:input.inquiryRef,
    facets,
    candidates,
    integrationPermissions:{
      allowCrossModeRelation:true,
      allowModeCollapse:false,
      allowContradictionErasure:false,
      allowAbsenceFilling:false,
      allowImaginalPromotion:false,
      allowWholePersonConclusion:false,
      allowPersistence:false,
    },
  };
}

export function validateNonCollapsingIntegration(field:CrystalCenterField){
  const errors:string[]=[];
  const modes=new Set(field.facets.map(f=>f.mode));
  if (modes.size<2) errors.push('insufficient_mode_differentiation');
  for (const facet of field.facets) {
    if (facet.collapsible!==false) errors.push('facet_may_collapse:'+facet.facetRef);
    if (facet.mode==='imaginal' && facet.standing!=='imaginal_provisional') {
      errors.push('imaginal_promoted:'+facet.facetRef);
    }
    if (facet.mode==='contradiction' && facet.standing!=='conflicted') {
      errors.push('contradiction_erased:'+facet.facetRef);
    }
    if (facet.mode==='absence' && facet.standing!=='absent') {
      errors.push('absence_filled:'+facet.facetRef);
    }
  }
  const p=field.integrationPermissions;
  if (p.allowModeCollapse!==false) errors.push('mode_collapse_permitted');
  if (p.allowContradictionErasure!==false) errors.push('contradiction_erasure_permitted');
  if (p.allowAbsenceFilling!==false) errors.push('absence_filling_permitted');
  if (p.allowImaginalPromotion!==false) errors.push('imaginal_promotion_permitted');
  if (p.allowWholePersonConclusion!==false) errors.push('whole_person_conclusion_permitted');
  if (p.allowPersistence!==false) errors.push('persistence_permitted');
  return {valid:errors.length===0,errors};
}

export function modeInventory(field:CrystalCenterField){
  return [...new Set(field.facets.map(f=>f.mode))].sort();
}


export interface CrystalModeAblation {
  removedMode:CrystalMode;
  beforeModes:CrystalMode[];
  afterModes:CrystalMode[];
  removedFacetRefs:string[];
  substitutedByOtherMode:boolean;
}

export function ablateCrystalMode(
  field:CrystalCenterField,
  mode:CrystalMode,
):CrystalModeAblation {
  const beforeModes=modeInventory(field);
  const removed=field.facets.filter(f=>f.mode===mode);
  const afterFacets=field.facets.filter(f=>f.mode!==mode);
  const afterModes=[...new Set(afterFacets.map(f=>f.mode))].sort() as CrystalMode[];

  // A different epistemic mode may remain present, but it must not inherit the
  // standing of the removed mode. This catches silent "helpful" substitution.
  const removedStandings=new Set(removed.map(f=>f.standing));
  const substitutedByOtherMode=afterFacets.some(
    f=>removedStandings.has(f.standing) && f.mode!==mode,
  );

  return {
    removedMode:mode,
    beforeModes,
    afterModes,
    removedFacetRefs:removed.map(f=>f.facetRef),
    substitutedByOtherMode,
  };
}

export function validateModeAblations(field:CrystalCenterField){
  const errors:string[]=[];
  for(const mode of modeInventory(field)){
    const result=ablateCrystalMode(field,mode);
    if(result.afterModes.includes(mode)){
      errors.push('mode_ablation_failed:'+mode);
    }
    if(result.substitutedByOtherMode){
      errors.push('mode_standing_substituted:'+mode);
    }
  }
  return {valid:errors.length===0,errors};
}
