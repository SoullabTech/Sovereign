#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require=createRequire(import.meta.url);
const D=require('../../../jarvis-desktop/src/c0-execution-decision.js');
let passed=0,failed=0;
function check(name,fn){try{fn();passed++;console.log('PASS  '+name)}catch(e){failed++;console.log('FAIL  '+name);console.log('      '+e.stack)}}
const task={capability:'git.rev_parse',args:{ref:'HEAD'},routing:{satisfied:true,basis:'operator_submission'}};
const route={execution_lane:'C0',cost_class:'deterministic',status:'routed'};
const invocation={capability:'git.rev_parse',caller_terms:{ref:'HEAD'},host_terms:{},effective_terms:{ref:'HEAD'}};

check('RB6B-D1 valid routed invocation stages without constituting execution',()=>{
  const s=D.stage({task,routeDecision:route,root:'/tmp/repo-a',invocation});
  assert.equal(s.ok,true);assert.equal(s.status,'ROUTED_AWAITING_EXECUTION_DECISION');
  const r=D.inspect(s.occurrence_id);assert.equal(r.decided,false);assert.equal(r.execution_decision,undefined);
  D.forget(s.occurrence_id);
});
check('RB6B-D2 non-C0 route cannot stage an executable occurrence',()=>{
  const s=D.stage({task,routeDecision:{...route,execution_lane:'C1'},root:'/tmp/repo-a',invocation});
  assert.equal(s.ok,false);assert.equal(s.reason,'C0_ROUTE_REQUIRED');
});
check('RB6B-D3 check.run remains outside canonical invocation authority',()=>{
  const s=D.stage({task:{...task,capability:'check.run'},routeDecision:route,root:'/tmp/repo-a',invocation:{...invocation,capability:'check.run'}});
  assert.equal(s.ok,false);assert.equal(s.reason,'CHECK_RUN_EXECUTION_PLAN_IDENTITY_UNRESOLVED');
});
check('RB6B-D4 caller-forged occurrence id is refused',()=>{
  const v=D.verify('c0-deadbeef',{root:'/tmp/repo-a',invocation,routeDecision:route});
  assert.equal(v.ok,false);assert.equal(v.reason,'PENDING_OCCURRENCE_NOT_FOUND');
});
check('RB6B-D5 root drift invalidates the pending occurrence',()=>{
  const s=D.stage({task,routeDecision:route,root:'/tmp/repo-a',invocation});
  const v=D.verify(s.occurrence_id,{root:'/tmp/repo-b',invocation,routeDecision:route});
  assert.equal(v.ok,false);assert.equal(v.reason,'INVOCATION_BINDING_CHANGED');D.forget(s.occurrence_id);
});
check('RB6B-D6 invocation drift invalidates the pending occurrence',()=>{
  const s=D.stage({task,routeDecision:route,root:'/tmp/repo-a',invocation});
  const v=D.verify(s.occurrence_id,{root:'/tmp/repo-a',invocation:{...invocation,effective_terms:{ref:'HEAD~1'}},routeDecision:route});
  assert.equal(v.ok,false);assert.equal(v.reason,'INVOCATION_BINDING_CHANGED');D.forget(s.occurrence_id);
});
check('RB6B-D7 route drift invalidates the pending occurrence',()=>{
  const s=D.stage({task,routeDecision:route,root:'/tmp/repo-a',invocation});
  const v=D.verify(s.occurrence_id,{root:'/tmp/repo-a',invocation,routeDecision:{...route,status:'refused_not_routable',execution_lane:null}});
  assert.equal(v.ok,false);assert.equal(v.reason,'INVOCATION_BINDING_CHANGED');D.forget(s.occurrence_id);
});
check('RB6B-D8 host decision is one-shot per exact occurrence',()=>{
  const s=D.stage({task,routeDecision:route,root:'/tmp/repo-a',invocation});
  const c=D.constitute(s.occurrence_id,{root:'/tmp/repo-a',invocation,routeDecision:route,source:'host:native-confirmation'});
  assert.equal(c.ok,true);assert.equal(c.execution_decision.one_shot,true);assert.match(c.execution_decision.decision_id,/^exec-/);
  const again=D.constitute(s.occurrence_id,{root:'/tmp/repo-a',invocation,routeDecision:route,source:'host:native-confirmation'});
  assert.equal(again.ok,false);assert.equal(again.reason,'OCCURRENCE_ALREADY_DECIDED');D.forget(s.occurrence_id);
});
check('RB6B-D9 withholding decision leaves same valid route pending and executable state absent',()=>{
  const s=D.stage({task,routeDecision:route,root:'/tmp/repo-a',invocation});
  const before=D.inspect(s.occurrence_id);const after=D.inspect(s.occurrence_id);
  assert.deepEqual(after,before);assert.equal(after.route.execution_lane,'C0');assert.equal(after.decided,false);D.forget(s.occurrence_id);
});
console.log('\n'+passed+' passed · '+failed+' failed');process.exit(failed?1:0);
