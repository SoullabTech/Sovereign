import type { ReflectionLineage, ReflectionLineageNode } from './repairLineage';

export interface LineageReasonRecord {
  reasonRef:string;
  nodeRef:string;
  kind:'human_review_reason'|'repair_reason'|'rollback_reason';
  note:string;
  sourceRef:string;
}

export interface LineageExplanation {
  query:
    | 'what_changed'
    | 'why_changed'
    | 'what_did_i_say'
    | 'when_superseded'
    | 'active_now';
  answer:string;
  evidenceNodeRefs:string[];
  evidenceReasonRefs:string[];
  unknowns:string[];
  reconstructed:false;
}

function node(lineage:ReflectionLineage,ref:string):ReflectionLineageNode|undefined{
  return lineage.nodes.find(n=>n.nodeRef===ref);
}

function reasonsFor(reasons:LineageReasonRecord[],nodeRef:string){
  return reasons.filter(r=>r.nodeRef===nodeRef);
}

export function explainActiveHead(
  lineage:ReflectionLineage,
):LineageExplanation{
  const head=node(lineage,lineage.activeHeadRef);
  if(!head){
    return {
      query:'active_now',
      answer:'The lineage record does not contain its declared active head.',
      evidenceNodeRefs:[],
      evidenceReasonRefs:[],
      unknowns:['active_head_missing'],
      reconstructed:false,
    };
  }
  return {
    query:'active_now',
    answer:`The active reflection is ${head.nodeRef}: ${head.text??'no text recorded'}`,
    evidenceNodeRefs:[head.nodeRef],
    evidenceReasonRefs:[],
    unknowns:[],
    reconstructed:false,
  };
}

export function explainWhatChanged(
  lineage:ReflectionLineage,
  fromRef:string,
  toRef:string,
):LineageExplanation{
  const from=node(lineage,fromRef);
  const to=node(lineage,toRef);
  const unknowns:string[]=[];
  if(!from) unknowns.push('from_node_missing:'+fromRef);
  if(!to) unknowns.push('to_node_missing:'+toRef);

  if(!from||!to){
    return {
      query:'what_changed',
      answer:'The lineage record is incomplete for that comparison.',
      evidenceNodeRefs:[from,to].filter(Boolean).map(n=>n!.nodeRef),
      evidenceReasonRefs:[],
      unknowns,
      reconstructed:false,
    };
  }

  const changed=from.text!==to.text;
  return {
    query:'what_changed',
    answer:changed
      ? `The reflection changed from “${from.text??'no text recorded'}” to “${to.text??'no text recorded'}”.`
      : 'The recorded reflection text did not change between those two nodes.',
    evidenceNodeRefs:[from.nodeRef,to.nodeRef],
    evidenceReasonRefs:[],
    unknowns:[],
    reconstructed:false,
  };
}

export function explainWhyChanged(
  lineage:ReflectionLineage,
  reasons:LineageReasonRecord[],
  targetRef:string,
):LineageExplanation{
  const target=node(lineage,targetRef);
  if(!target){
    return {
      query:'why_changed',
      answer:'The lineage record does not contain that target reflection.',
      evidenceNodeRefs:[],
      evidenceReasonRefs:[],
      unknowns:['target_node_missing:'+targetRef],
      reconstructed:false,
    };
  }

  const rs=reasonsFor(reasons,targetRef);
  if(rs.length===0){
    return {
      query:'why_changed',
      answer:'The preserved lineage shows that the reflection changed, but it does not record why.',
      evidenceNodeRefs:[targetRef],
      evidenceReasonRefs:[],
      unknowns:['change_reason_not_recorded'],
      reconstructed:false,
    };
  }

  return {
    query:'why_changed',
    answer:'The recorded reason for this revision was: '+rs.map(r=>r.note).join(' '),
    evidenceNodeRefs:[targetRef],
    evidenceReasonRefs:rs.map(r=>r.reasonRef),
    unknowns:[],
    reconstructed:false,
  };
}

export function explainWhatMemberSaid(
  lineage:ReflectionLineage,
  reasons:LineageReasonRecord[],
  repairRef:string,
):LineageExplanation{
  const repair=node(lineage,repairRef);
  if(!repair){
    return {
      query:'what_did_i_say',
      answer:'The lineage record does not contain that repair.',
      evidenceNodeRefs:[],
      evidenceReasonRefs:[],
      unknowns:['repair_node_missing:'+repairRef],
      reconstructed:false,
    };
  }

  const human=reasons.filter(r=>
    r.nodeRef===repairRef &&
    r.kind==='human_review_reason'
  );

  if(human.length===0){
    return {
      query:'what_did_i_say',
      answer:'The record does not preserve a human correction note for that repair.',
      evidenceNodeRefs:[repairRef],
      evidenceReasonRefs:[],
      unknowns:['human_correction_note_not_recorded'],
      reconstructed:false,
    };
  }

  return {
    query:'what_did_i_say',
    answer:'The preserved human correction note says: '+human.map(r=>r.note).join(' '),
    evidenceNodeRefs:[repairRef],
    evidenceReasonRefs:human.map(r=>r.reasonRef),
    unknowns:[],
    reconstructed:false,
  };
}

export function explainWhenSuperseded(
  lineage:ReflectionLineage,
  nodeRef:string,
):LineageExplanation{
  const current=node(lineage,nodeRef);
  if(!current){
    return {
      query:'when_superseded',
      answer:'The lineage does not contain that reflection.',
      evidenceNodeRefs:[],
      evidenceReasonRefs:[],
      unknowns:['node_missing:'+nodeRef],
      reconstructed:false,
    };
  }

  if(current.active){
    return {
      query:'when_superseded',
      answer:'That reflection is still the active head and has not been superseded.',
      evidenceNodeRefs:[nodeRef],
      evidenceReasonRefs:[],
      unknowns:[],
      reconstructed:false,
    };
  }

  if(!current.supersededByRef){
    return {
      query:'when_superseded',
      answer:'The record shows that this reflection is inactive, but it does not preserve which node superseded it.',
      evidenceNodeRefs:[nodeRef],
      evidenceReasonRefs:[],
      unknowns:['successor_not_recorded'],
      reconstructed:false,
    };
  }

  return {
    query:'when_superseded',
    answer:`That reflection stopped being active when ${current.supersededByRef} became its recorded successor.`,
    evidenceNodeRefs:[nodeRef,current.supersededByRef],
    evidenceReasonRefs:[],
    unknowns:[],
    reconstructed:false,
  };
}

export function validateLineageExplanation(explanation:LineageExplanation){
  const errors:string[]=[];
  if(explanation.reconstructed!==false) errors.push('reconstructive_fiction_allowed');
  if(!explanation.answer.trim()) errors.push('empty_explanation');
  return {valid:errors.length===0,errors};
}
