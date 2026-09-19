#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { createWorkUnitDraftV2 } from '../work-unit-v2.mjs';
import { createLifecycleEnvelopeV2, transitionLifecycleV2 } from '../work-unit-lifecycle-v2.mjs';
import { bindAuthorizedRouteV2 } from '../work-unit-routing-v2.mjs';
import { appendTransportBindingV1, governedTransportForParticipantV1 } from '../work-unit-transport-v1.mjs';
import { prepareCanonicalExecutionAuthorizationV1 } from '../canonical-provider-execution-v1.mjs';
import {
  canonicalGrantLedgerPathV1,
  canonicalGrantLedgerLockPathV1,
  readCanonicalGrantEventsV1,
  listCanonicalGrantStandingsV1,
  issueCanonicalExecutionGrantV1,
  claimCanonicalExecutionGrantV1,
  consumeCanonicalExecutionGrantV1,
  revokeCanonicalExecutionGrantV1,
} from '../canonical-provider-execution-grant-store-v1.mjs';

const SHA='aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
let pass=0, fail=0;
function check(name,fn){try{fn();pass++;console.log('PASS  '+name);}catch(e){fail++;console.log('FAIL  '+name);console.log('      '+e.message);}}

function input(){
  return {
    identity:{id:'e1-store-proof',programme:'E1',parent_work_unit:null,objective:'store proof',work_class:'VERIFICATION',task_shape:'CODE_GROUNDED',capability:null},
    custody:{evidence_class:'E1_REPOSITORY_LOCAL'},
    routing_request:{requested_posture:'default',review_pressure:'ordinary'},
    context:{context_refs:[],evidence_refs:['local-worktree:'+SHA],assumptions:[],unknowns:[]},
    scope:{repository:'synthetic/e1',base_ref:SHA,allowed_paths:['scripts/builder'],forbidden_paths:[]},
    authority:{repository_read:true,repository_write:'none',shell:'none',network_external:false,provider_spend:false,external_disclosure:'none',merge:false,deploy:false,production_read:false,production_write:false},
    evaluation:{acceptance_conditions:['a'],falsification_conditions:['f'],stop_conditions:['s']},
    provenance:{creator:'synthetic:e1',authorizing_act:null,source_commits:[SHA]},
    state:{supersedes:null},
  };
}
function tx(env,to,extra={}){
  const r=transitionLifecycleV2(env,{to,evidence_ref:'e1:'+to,reason_code:'E1_'+to,...extra});
  assert.equal(r.ok,true,JSON.stringify(r.blockers)); return r.envelope;
}
function ready(){
  const d=createWorkUnitDraftV2(input()); assert.equal(d.ok,true);
  let env=createLifecycleEnvelopeV2(d.work_unit).envelope;
  env=tx(env,'BOUNDED'); env=tx(env,'AUTHORIZED',{authorization_ref:'human:e1'});
  env=bindAuthorizedRouteV2(env).envelope;
  for(const p of [env.work_unit.routing.route_record.primary,...env.work_unit.routing.route_record.challengers]){
    if(p.required_for_completion!==true) continue;
    const g=governedTransportForParticipantV1(env.work_unit,p.participant_id);
    const a=appendTransportBindingV1(env,{
      transport_binding_id:'ready-'+p.participant_id,
      supersedes_binding_id:null,
      route_participant_id:p.participant_id,
      provider_id:g.provider_id,model_id:g.model_id,adapter_id:g.adapter_id,
      readiness:{status:'READY',evidence_ref:'e1:ready:'+p.participant_id},
    });
    assert.equal(a.ok,true,JSON.stringify(a.blockers)); env=a.envelope;
  }
  return env;
}
function preview(){
  const p=prepareCanonicalExecutionAuthorizationV1({envelope:ready(),route_participant_id:'primary',local_worktree_available:true});
  assert.equal(p.ok,true,JSON.stringify(p.blockers)); return p;
}

const home=fs.mkdtempSync(path.join(os.tmpdir(),'e1-grant-store-'));
try{
  const p=preview();
  check('E1S-1 — issue appends ACTIVE human grant',()=>{
    const out=issueCanonicalExecutionGrantV1(p,{home,actor_id:'human:e1',issued_at:'2026-09-18T20:00:00.000Z'});
    assert.equal(out.ok,true); assert.equal(out.standing,'ACTIVE');
    assert.equal(readCanonicalGrantEventsV1(p.work_unit_id,{home}).length,1);
  });
  const first=listCanonicalGrantStandingsV1(p.work_unit_id,{home})[0].grant;
  const file=canonicalGrantLedgerPathV1(p.work_unit_id,home);
  const one=fs.readFileSync(file,'utf8');

  check('E1S-2 — duplicate active grant for same participant is refused without rewrite',()=>{
    const out=issueCanonicalExecutionGrantV1(p,{home,actor_id:'human:e1',issued_at:'2026-09-18T20:00:01.000Z'});
    assert.equal(out.ok,false); assert.equal(out.reason,'UNRESOLVED_GRANT_ALREADY_EXISTS');
    assert.equal(fs.readFileSync(file,'utf8'),one);
  });

  check('E1S-3 — exclusive ledger lock fails closed before claim',()=>{
    const lock=canonicalGrantLedgerLockPathV1(p.work_unit_id,home);
    fs.mkdirSync(path.dirname(lock),{recursive:true});
    const fd=fs.openSync(lock,'wx',0o600);
    fs.closeSync(fd);
    try{
      const out=claimCanonicalExecutionGrantV1(p.work_unit_id,first.grant_id,{home,at:'2026-09-18T20:00:01.500Z'});
      assert.equal(out.ok,false);
      assert.equal(out.reason,'GRANT_LEDGER_BUSY');
      assert.equal(listCanonicalGrantStandingsV1(p.work_unit_id,{home})[0].standing,'ACTIVE');
    }finally{
      fs.unlinkSync(lock);
    }
  });

  check('E1S-4 — claim is append-only and immediately prevents reuse',()=>{
    const out=claimCanonicalExecutionGrantV1(p.work_unit_id,first.grant_id,{home,at:'2026-09-18T20:00:02.000Z'});
    assert.equal(out.ok,true);
    assert.equal(fs.readFileSync(file,'utf8').startsWith(one),true);
    assert.equal(listCanonicalGrantStandingsV1(p.work_unit_id,{home})[0].standing,'CLAIMED');
    assert.equal(claimCanonicalExecutionGrantV1(p.work_unit_id,first.grant_id,{home}).ok,false);
  });

  check('E1S-5 — claimed in-flight grant blocks overlapping authorization',()=>{
    const out=issueCanonicalExecutionGrantV1(p,{home,actor_id:'human:e1',issued_at:'2026-09-18T20:00:02.500Z'});
    assert.equal(out.ok,false);
    assert.equal(out.reason,'UNRESOLVED_GRANT_ALREADY_EXISTS');
    assert.equal(out.standing,'CLAIMED');
  });

  check('E1S-6 — provider failure still consumes spent one-shot authority',()=>{
    const out=consumeCanonicalExecutionGrantV1(p.work_unit_id,first.grant_id,{home,at:'2026-09-18T20:00:03.000Z',outcome:'failed'});
    assert.equal(out.ok,true);
    assert.equal(listCanonicalGrantStandingsV1(p.work_unit_id,{home})[0].standing,'CONSUMED');
    assert.equal(claimCanonicalExecutionGrantV1(p.work_unit_id,first.grant_id,{home}).ok,false);
  });

  check('E1S-7 — new attempt requires a separately issued grant id/sequence',()=>{
    const out=issueCanonicalExecutionGrantV1(p,{home,actor_id:'human:e1',issued_at:'2026-09-18T20:00:04.000Z'});
    assert.equal(out.ok,true); assert.equal(out.grant.sequence,2);
    assert.notEqual(out.grant.grant_id,first.grant_id);
  });
  const second=listCanonicalGrantStandingsV1(p.work_unit_id,{home})[1].grant;

  check('E1S-8 — unused grant can be explicitly revoked append-only',()=>{
    const before=fs.readFileSync(file,'utf8');
    const out=revokeCanonicalExecutionGrantV1(p.work_unit_id,second.grant_id,{home,at:'2026-09-18T20:00:05.000Z'});
    assert.equal(out.ok,true);
    assert.equal(fs.readFileSync(file,'utf8').startsWith(before),true);
    assert.equal(listCanonicalGrantStandingsV1(p.work_unit_id,{home})[1].standing,'REVOKED');
  });

  check('E1S-9 — corrupt ledger fails closed',()=>{
    fs.appendFileSync(file,'{broken\n');
    assert.throws(()=>readCanonicalGrantEventsV1(p.work_unit_id,{home}),/CANONICAL_EXECUTION_GRANT_LEDGER_CORRUPT/);
  });
}finally{fs.rmSync(home,{recursive:true,force:true});}

console.log();
console.log(pass+' passed · '+fail+' failed');
process.exit(fail===0?0:1);
