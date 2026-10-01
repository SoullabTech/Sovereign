import { BINDING_FIELDS,SATISFIED_DEPENDENCY_STATE,ELIGIBLE_OWN_STATE,EVIDENCE_GATE } from './contract.mjs';
import { stable } from './substrate.mjs';
const exactFields=(o,fields)=>o&&typeof o==='object'&&!Array.isArray(o)&&Object.keys(o).sort().join('|')===[...fields].sort().join('|');
const validSha=(s)=>typeof s==='string'&&/^[0-9a-f]{40}$/i.test(s);
export function validateBinding(b,g){
  if(!exactFields(b,BINDING_FIELDS))return false;
  if(b.graph_id!==g.graph_id||b.graph_digest!==g.graph_digest||!validSha(b.bound_at_sha))return false;
  return g.work_units.some(x=>x.work_unit_id===b.planned_work_unit_id)&&typeof b.canonical_work_unit_id==='string'&&b.canonical_work_unit_id.length>0;
}
export function bindingIndex(w){
  const byPlan=new Map(),byRuntime=new Map(); const errors=[];
  for(const b of w.bindings){
    if(!validateBinding(b,w.graph)){errors.push('INVALID_BINDING');continue;}
    if(byPlan.has(b.planned_work_unit_id))errors.push('MULTIPLE_RUNTIME_BINDINGS'); else byPlan.set(b.planned_work_unit_id,b);
    if(byRuntime.has(b.canonical_work_unit_id))errors.push('RUNTIME_BOUND_TO_MULTIPLE_NODES'); else byRuntime.set(b.canonical_work_unit_id,b);
  }
  return {byPlan,byRuntime,errors};
}
export function readiness(w){
  const idx=bindingIndex(w), rows=[];
  for(const pid of w.graph.topological_order){
    const node=w.graph.work_units.find(x=>x.work_unit_id===pid); const b=idx.byPlan.get(pid);
    if(idx.errors.length||!b){rows.push({planned_work_unit_id:pid,status:'BLOCKED',gate:EVIDENCE_GATE,reason:'BINDING_EVIDENCE_INCOMPLETE'});continue;}
    const runtime=w.runtimes[b.canonical_work_unit_id];
    if(!runtime||runtime.guard!=='valid'){rows.push({planned_work_unit_id:pid,status:'BLOCKED',gate:EVIDENCE_GATE,reason:'RUNTIME_EVIDENCE_INCOMPLETE'});continue;}
    if(runtime.state!==ELIGIBLE_OWN_STATE){rows.push({planned_work_unit_id:pid,status:'INELIGIBLE',reason:'OWN_STATE_'+runtime.state});continue;}
    let blocked=null;
    for(const dep of node.depends_on){
      const db=idx.byPlan.get(dep); if(!db){blocked='DEPENDENCY_BINDING_MISSING';break;}
      const dr=w.runtimes[db.canonical_work_unit_id]; if(!dr||dr.guard!=='valid'){blocked='DEPENDENCY_EVIDENCE_MISSING';break;}
      if(dr.state!==SATISFIED_DEPENDENCY_STATE){blocked='DEPENDENCY_NOT_CLOSED';break;}
    }
    rows.push(blocked?{planned_work_unit_id:pid,status:'BLOCKED',gate:EVIDENCE_GATE,reason:blocked}:{planned_work_unit_id:pid,status:'READY',reason:'DEPENDENCIES_CLOSED'});
  }
  return rows;
}
export function selectReady(w){
  const n=Number.isInteger(w?.capacity?.available_slots)&&w.capacity.available_slots>=0?w.capacity.available_slots:0;
  return readiness(w).filter(x=>x.status==='READY').slice(0,n).map(x=>x.planned_work_unit_id);
}
export function decide(w){
  const before=stable({runtimes:w.runtimes,sessions:w.sessions}); const selected=selectReady(w); const after=stable({runtimes:w.runtimes,sessions:w.sessions});
  return {selected,protected_unchanged:before===after};
}
export function sessionRecheckAllows({observed_slots,live_active,live_limit}){
  if(live_active>=live_limit)return false;
  return observed_slots>0;
}
