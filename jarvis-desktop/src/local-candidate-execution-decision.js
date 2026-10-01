// EC1-R11B — host-side local-candidate occurrence + execution-decision custody.
'use strict';
const crypto = require('node:crypto');
const path = require('node:path');

const VERSION = 'EC1-R21.v1';
const pending = new Map();
function clone(v){return JSON.parse(JSON.stringify(v));}
function canonical(v){if(Array.isArray(v))return '['+v.map(canonical).join(',')+']';if(v&&typeof v==='object')return '{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+canonical(v[k])).join(',')+'}';return JSON.stringify(v??null);}
function digest(v){return 'sha256:'+crypto.createHash('sha256').update(canonical(v)).digest('hex');}
function occurrenceId(){return 'lc-'+crypto.randomBytes(10).toString('hex');}
function decisionId(){return 'exec-'+crypto.randomBytes(10).toString('hex');}
function binding({root,runId,packet,canonicalCoreDigest,routeDigest,transportBinding}){
  const tb=transportBinding&&typeof transportBinding==='object'?clone(transportBinding):null;
  return Object.freeze({
    binding_version:'EC1-LOCAL-CANDIDATE.v2',
    root:path.resolve(root),
    run_id:String(runId||''),
    work_unit_id:String(packet?.work_unit_id||''),
    packet_digest:digest(packet),
    canonical_core_digest:String(canonicalCoreDigest||''),
    route_digest:String(routeDigest||''),
    transport_binding:tb,
  });
}
function stage({root,runId,packet,canonicalCoreDigest,routeDigest,transportBinding}){
  if(!root||!runId||!packet?.work_unit_id||!canonicalCoreDigest||!routeDigest||!transportBinding)return{ok:false,status:'REFUSED',reason:'LOCAL_CANDIDATE_BINDING_REQUIRED'};
  const id=occurrenceId();const bound=binding({root,runId,packet,canonicalCoreDigest,routeDigest,transportBinding});
  const record=Object.freeze({version:VERSION,occurrence_id:id,binding:bound,binding_digest:digest(bound),decided:false});
  pending.set(id,record);return{ok:true,status:'LOCAL_CANDIDATE_AWAITING_EXECUTION_DECISION',occurrence_id:id,binding_digest:record.binding_digest};
}
function verify(id,input){const r=pending.get(String(id||''));if(!r)return{ok:false,status:'REFUSED',reason:'PENDING_OCCURRENCE_NOT_FOUND'};if(r.decided)return{ok:false,status:'REFUSED',reason:'OCCURRENCE_ALREADY_DECIDED'};const current=binding(input);if(digest(current)!==r.binding_digest)return{ok:false,status:'REFUSED',reason:'LOCAL_CANDIDATE_BINDING_CHANGED'};return{ok:true,record:clone(r)};}
function constitute(id,input){const checked=verify(id,input);if(!checked.ok)return checked;const current=pending.get(String(id));const decision=Object.freeze({decision_version:VERSION,decision_id:decisionId(),occurrence_id:current.occurrence_id,run_id:current.binding.run_id,work_unit_id:current.binding.work_unit_id,packet_digest:current.binding.packet_digest,canonical_core_digest:current.binding.canonical_core_digest,route_digest:current.binding.route_digest,transport_binding:clone(current.binding.transport_binding),binding_digest:current.binding_digest,source:'host:local-candidate-confirmation',constituted_at:new Date().toISOString(),one_shot:true});pending.set(String(id),Object.freeze({...current,decided:true,execution_decision:decision}));return{ok:true,status:'EXECUTION_DECISION_CONSTITUTED',execution_decision:clone(decision)};}
function verifyConstituted(decision,{root,runId,packet,canonicalCoreDigest,routeDigest,transportBinding}={}){if(!decision||decision.decision_version!==VERSION||decision.one_shot!==true)return{ok:false,reason:'EXECUTION_DECISION_INVALID'};const bound=binding({root,runId,packet,canonicalCoreDigest,routeDigest,transportBinding});if(decision.run_id!==String(runId||'')||decision.work_unit_id!==String(packet?.work_unit_id||'')||decision.packet_digest!==bound.packet_digest||decision.canonical_core_digest!==bound.canonical_core_digest||decision.route_digest!==bound.route_digest||canonical(decision.transport_binding)!==canonical(bound.transport_binding)||decision.binding_digest!==digest(bound))return{ok:false,reason:'EXECUTION_DECISION_BINDING_MISMATCH'};return{ok:true,binding:clone(bound)};}
function inspect(id){const r=pending.get(String(id||''));return r?clone(r):null;}
function forget(id){return pending.delete(String(id||''));}
module.exports={VERSION,stage,verify,constitute,verifyConstituted,inspect,forget,_bindingForTest:binding,_digestForTest:digest};
