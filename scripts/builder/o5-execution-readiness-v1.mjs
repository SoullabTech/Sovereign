/**
 * O5-R5A execution binding + readiness — pure evidence composition only.
 *
 * No process launch, session mutation, W2 transition, worktree claim, capacity
 * override, routing mutation, or authority mutation occurs here.
 */
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { validateWorkUnitV2 } from './work-unit-v2.mjs';
import { authorizedCoreSnapshotV2, validateLifecycleEnvelopeV2 } from './work-unit-lifecycle-v2.mjs';

const require=createRequire(import.meta.url);
const O2=require('../../jarvis-desktop/src/operator-work-graph.js');
const O3=require('../../jarvis-desktop/src/operator-authority-planner.js');

export const VERSION='O5-R5A.v1';
export const BINDING_VERSION='O5-R5A.binding.v1';
export const READY_STATE='ROUTED';
export const SATISFIED_DEPENDENCY_STATE='CLOSED';
export const SESSION_RECHECK_REQUIRED=true;

function deepFreeze(value){if(!value||typeof value!=='object'||Object.isFrozen(value))return value;Object.freeze(value);for(const child of Object.values(value))deepFreeze(child);return value;}
function clone(v){if(Array.isArray(v))return v.map(clone);if(v&&typeof v==='object')return Object.fromEntries(Object.entries(v).map(([k,x])=>[k,clone(x)]));return v;}
function blocker(code,detail,path=null){return Object.freeze({code,detail,path});}
function text(v){return typeof v==='string'?v.trim():'';}
function validSha(v){return /^[0-9a-f]{40}$/i.test(text(v));}
function canonicalize(v){if(Array.isArray(v))return v.map(canonicalize);if(!v||typeof v!=='object')return v;return Object.fromEntries(Object.keys(v).sort().map(k=>[k,canonicalize(v[k])]));}
export function graphDigestV1(graph){return 'sha256:'+createHash('sha256').update(JSON.stringify(canonicalize(graph))).digest('hex');}

export function graphBlockersV1(graph){
  return deepFreeze([
    ...O2.validateGraph(graph),
    ...O3.validateCanonicalGraphIntegrity(graph),
  ]);
}

export function runtimeEnvelopeBlockersV1(envelope){
  const blocks=[];
  const wu=envelope?.work_unit;
  blocks.push(...validateLifecycleEnvelopeV2(envelope));
  if(wu)blocks.push(...validateWorkUnitV2(wu));
  if(wu&&envelope?.guard?.authorized_core_snapshot!==authorizedCoreSnapshotV2(wu)){
    blocks.push(blocker('AUTHORIZED_CORE_SNAPSHOT_MISMATCH','W2 authorized core snapshot no longer matches runtime Work Unit.','guard.authorized_core_snapshot'));
  }
  return deepFreeze(blocks);
}

export function createExecutionBindingV1({graph,planned_work_unit_id,envelope,bound_at_sha}={}){
  const blocks=[...graphBlockersV1(graph),...runtimeEnvelopeBlockersV1(envelope)];
  const pid=text(planned_work_unit_id), sha=text(bound_at_sha);
  const node=graph?.work_units?.find((x)=>x?.work_unit_id===pid);
  if(!node)blocks.push(blocker('PLANNED_WORK_UNIT_NOT_FOUND','Binding must name one planned Work Unit in the canonical O2 graph.','planned_work_unit_id'));
  if(!validSha(sha))blocks.push(blocker('EXACT_BINDING_SHA_REQUIRED','Binding requires an exact 40-character canonical SHA.','bound_at_sha'));
  if(envelope?.work_unit?.scope?.base_ref!==sha)blocks.push(blocker('BINDING_SHA_MISMATCH','Binding SHA must equal the canonical Work Unit base_ref.','bound_at_sha'));
  if(blocks.length)return deepFreeze({ok:false,binding:null,blockers:blocks});
  return deepFreeze({ok:true,binding:{
    binding_version:BINDING_VERSION,
    graph_id:graph.graph_id,
    graph_digest:graphDigestV1(graph),
    planned_work_unit_id:pid,
    canonical_work_unit_id:envelope.work_unit.identity.id,
    bound_at_sha:sha,
  },blockers:[]});
}

export function validateBindingSetV1({graph,bindings,envelopes_by_id}={}){
  const blocks=[...graphBlockersV1(graph)];
  const list=Array.isArray(bindings)?bindings:[];
  const byPlan=new Map(),byRuntime=new Map();
  const gd=graphDigestV1(graph);
  for(const b of list){
    if(!b||b.binding_version!==BINDING_VERSION||b.graph_id!==graph?.graph_id||b.graph_digest!==gd||!validSha(b.bound_at_sha)){
      blocks.push(blocker('INVALID_EXECUTION_BINDING','Execution binding does not match canonical graph identity.','bindings'));continue;
    }
    if(!graph?.work_units?.some((x)=>x.work_unit_id===b.planned_work_unit_id))blocks.push(blocker('PLANNED_WORK_UNIT_NOT_FOUND','Binding references a node outside the canonical graph.','planned_work_unit_id'));
    if(byPlan.has(b.planned_work_unit_id))blocks.push(blocker('MULTIPLE_RUNTIME_BINDINGS','One planned node may bind to exactly one canonical runtime Work Unit.','planned_work_unit_id'));else byPlan.set(b.planned_work_unit_id,b);
    if(byRuntime.has(b.canonical_work_unit_id))blocks.push(blocker('RUNTIME_BOUND_TO_MULTIPLE_NODES','One canonical runtime Work Unit may instantiate exactly one planned node.','canonical_work_unit_id'));else byRuntime.set(b.canonical_work_unit_id,b);
    const env=envelopes_by_id?.[b.canonical_work_unit_id];
    const eb=runtimeEnvelopeBlockersV1(env);
    if(eb.length)blocks.push(blocker('BOUND_RUNTIME_INVALID','Bound runtime envelope is not a valid W2.v2 envelope.','canonical_work_unit_id'));
    if(env?.work_unit?.scope?.base_ref!==b.bound_at_sha)blocks.push(blocker('BOUND_RUNTIME_SHA_MISMATCH','Bound runtime base_ref differs from binding SHA.','bound_at_sha'));
  }
  return deepFreeze({ok:blocks.length===0,by_plan:byPlan,by_runtime:byRuntime,blockers:blocks});
}

export function evaluateExecutionReadinessV1({graph,bindings,envelopes_by_id}={}){
  const checked=validateBindingSetV1({graph,bindings,envelopes_by_id});
  if(!checked.ok)return deepFreeze({ok:false,standing:'BLOCKED',rows:[],blockers:checked.blockers});
  const rows=[];
  for(const pid of graph.topological_order){
    const node=graph.work_units.find((x)=>x.work_unit_id===pid);
    const b=checked.by_plan.get(pid);
    if(!b){rows.push({planned_work_unit_id:pid,canonical_work_unit_id:null,status:'BLOCKED',gate:'BLOCKED_BY_EVIDENCE',reason:'BINDING_EVIDENCE_INCOMPLETE'});continue;}
    const env=envelopes_by_id[b.canonical_work_unit_id], state=env.work_unit.state.lifecycle_state;
    if(state!==READY_STATE){rows.push({planned_work_unit_id:pid,canonical_work_unit_id:b.canonical_work_unit_id,status:'INELIGIBLE',gate:null,reason:'OWN_STATE_'+state});continue;}
    const predecessor=node.depends_on[0]??null;
    if(predecessor){
      const db=checked.by_plan.get(predecessor);
      if(!db){rows.push({planned_work_unit_id:pid,canonical_work_unit_id:b.canonical_work_unit_id,status:'BLOCKED',gate:'BLOCKED_BY_EVIDENCE',reason:'DEPENDENCY_BINDING_MISSING'});continue;}
      const depEnv=envelopes_by_id[db.canonical_work_unit_id];
      if(depEnv.work_unit.state.lifecycle_state!==SATISFIED_DEPENDENCY_STATE){rows.push({planned_work_unit_id:pid,canonical_work_unit_id:b.canonical_work_unit_id,status:'BLOCKED',gate:'BLOCKED_BY_EVIDENCE',reason:'DEPENDENCY_NOT_CLOSED'});continue;}
    }
    rows.push({planned_work_unit_id:pid,canonical_work_unit_id:b.canonical_work_unit_id,status:'READY',gate:null,reason:'PREDECESSOR_CLOSED'});
  }
  return deepFreeze({ok:true,standing:'READY',rows,blockers:[]});
}

export function selectExecutionReadyV1({graph,bindings,envelopes_by_id,available_slots}={}){
  const evaluated=evaluateExecutionReadinessV1({graph,bindings,envelopes_by_id});
  if(!evaluated.ok)return deepFreeze({...evaluated,selected:[],available_slots_observed:available_slots??null,requires_live_session_recheck:SESSION_RECHECK_REQUIRED});
  const slots=Number.isInteger(available_slots)&&available_slots>0?1:0;
  const selected=evaluated.rows.filter((r)=>r.status==='READY').slice(0,slots).map((r)=>({planned_work_unit_id:r.planned_work_unit_id,canonical_work_unit_id:r.canonical_work_unit_id,standing:'ELIGIBLE_FOR_LIVE_SESSION_ADMISSION'}));
  return deepFreeze({ok:true,standing:'READY',rows:evaluated.rows,selected,available_slots_observed:available_slots??null,effective_slots:slots,requires_live_session_recheck:SESSION_RECHECK_REQUIRED,effects:{authority:'none',routing:'none',lifecycle:'none',session:'none',dispatch:'none'},blockers:[]});
}
