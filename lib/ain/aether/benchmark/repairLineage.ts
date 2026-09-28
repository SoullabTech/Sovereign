import type { HumanReviewRepairResult } from './humanReviewRepair';

export type ReflectionNodeKind='machine'|'human_review'|'repair';

export interface ReflectionLineageNode {
  nodeRef:string;
  kind:ReflectionNodeKind;
  parentRef:string|null;
  text:string|null;
  accepted:boolean;
  supersededByRef:string|null;
  active:boolean;
}

export interface ReflectionLineage {
  lineageRef:string;
  nodes:ReflectionLineageNode[];
  activeHeadRef:string;
  appendOnly:true;
}

export function createReflectionLineage(
  lineageRef:string,
  machineRef:string,
  machineText:string,
):ReflectionLineage{
  return {
    lineageRef,
    nodes:[{
      nodeRef:machineRef,
      kind:'machine',
      parentRef:null,
      text:machineText,
      accepted:true,
      supersededByRef:null,
      active:true,
    }],
    activeHeadRef:machineRef,
    appendOnly:true,
  };
}

function clone(lineage:ReflectionLineage):ReflectionLineage{
  return {
    ...lineage,
    nodes:lineage.nodes.map(n=>({...n})),
  };
}

export function appendHumanReviewNode(
  lineage:ReflectionLineage,
  reviewRef:string,
):ReflectionLineage{
  const next=clone(lineage);
  const head=next.nodes.find(n=>n.nodeRef===next.activeHeadRef);
  if(!head) throw new Error('LINEAGE_ACTIVE_HEAD_MISSING');
  next.nodes.push({
    nodeRef:reviewRef,
    kind:'human_review',
    parentRef:head.nodeRef,
    text:null,
    accepted:true,
    supersededByRef:null,
    active:false,
  });
  return next;
}

export function promoteAcceptedRepair(
  lineage:ReflectionLineage,
  repair:HumanReviewRepairResult,
):ReflectionLineage{
  if(!repair.accepted||!repair.activeReflection){
    throw new Error('LINEAGE_REPAIR_NOT_ACCEPTED');
  }
  const next=clone(lineage);
  const head=next.nodes.find(n=>n.nodeRef===next.activeHeadRef);
  if(!head) throw new Error('LINEAGE_ACTIVE_HEAD_MISSING');
  if(next.nodes.some(n=>n.nodeRef===repair.repairRef)){
    throw new Error('LINEAGE_DUPLICATE_NODE');
  }
  head.active=false;
  head.supersededByRef=repair.repairRef;
  next.nodes.push({
    nodeRef:repair.repairRef,
    kind:'repair',
    parentRef:head.nodeRef,
    text:repair.activeReflection,
    accepted:true,
    supersededByRef:null,
    active:true,
  });
  next.activeHeadRef=repair.repairRef;
  return next;
}

export function promotePriorReflectionAsNewHead(
  lineage:ReflectionLineage,
  sourceNodeRef:string,
  newNodeRef:string,
):ReflectionLineage{
  const source=lineage.nodes.find(n=>n.nodeRef===sourceNodeRef);
  if(!source||!source.text) throw new Error('LINEAGE_ROLLBACK_SOURCE_INVALID');
  const next=clone(lineage);
  const head=next.nodes.find(n=>n.nodeRef===next.activeHeadRef);
  if(!head) throw new Error('LINEAGE_ACTIVE_HEAD_MISSING');
  if(next.nodes.some(n=>n.nodeRef===newNodeRef)) throw new Error('LINEAGE_DUPLICATE_NODE');

  head.active=false;
  head.supersededByRef=newNodeRef;
  next.nodes.push({
    nodeRef:newNodeRef,
    kind:'repair',
    parentRef:head.nodeRef,
    text:source.text,
    accepted:true,
    supersededByRef:null,
    active:true,
  });
  next.activeHeadRef=newNodeRef;
  return next;
}

export function validateReflectionLineage(lineage:ReflectionLineage){
  const errors:string[]=[];
  const active=lineage.nodes.filter(n=>n.active);
  if(active.length!==1) errors.push('lineage_requires_exactly_one_active_head');
  if(active[0]?.nodeRef!==lineage.activeHeadRef) errors.push('active_head_ref_mismatch');
  if(lineage.appendOnly!==true) errors.push('lineage_not_append_only');

  const refs=new Set<string>();
  for(const node of lineage.nodes){
    if(refs.has(node.nodeRef)) errors.push('duplicate_node:'+node.nodeRef);
    refs.add(node.nodeRef);
    if(node.parentRef && !lineage.nodes.some(n=>n.nodeRef===node.parentRef)){
      errors.push('missing_parent:'+node.nodeRef);
    }
    if(node.supersededByRef && !lineage.nodes.some(n=>n.nodeRef===node.supersededByRef)){
      errors.push('missing_successor:'+node.nodeRef);
    }
  }
  return {valid:errors.length===0,errors};
}
