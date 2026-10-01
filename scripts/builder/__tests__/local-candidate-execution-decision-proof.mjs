#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require=createRequire(import.meta.url);
const D=require('../../../jarvis-desktop/src/local-candidate-execution-decision.js');
let passed=0,failed=0;
function check(name,fn){try{fn();passed++;console.log('PASS  '+name)}catch(e){failed++;console.log('FAIL  '+name);console.log('      '+e.stack)}}
const packet={work_unit_id:'work-local-candidate-1',objective:'Repair local candidate continuity',execution_lane:'local-native',canonical_sha:'a'.repeat(40),allowed_files:['scripts/builder/x.mjs'],authorized_acts:['repo.read','repo.write:worktree','tests.run'],not_authorized_acts:['network.external','provider.spend','merge','deploy'],integration_actor:'jarvis',verification_commands:['node --test']};
const input={root:'/tmp/repo-a',runId:'r-123',packet,canonicalCoreDigest:'sha256:core1'};
check('LC-D1 valid binding stages without constituting execution',()=>{const s=D.stage(input);assert.equal(s.ok,true);assert.equal(s.status,'LOCAL_CANDIDATE_AWAITING_EXECUTION_DECISION');const r=D.inspect(s.occurrence_id);assert.equal(r.decided,false);D.forget(s.occurrence_id)});
check('LC-D2 incomplete binding is refused',()=>{const s=D.stage({...input,canonicalCoreDigest:''});assert.equal(s.ok,false);assert.equal(s.reason,'LOCAL_CANDIDATE_BINDING_REQUIRED')});
check('LC-D3 caller-forged occurrence id is refused',()=>{const v=D.verify('lc-deadbeef',input);assert.equal(v.ok,false);assert.equal(v.reason,'PENDING_OCCURRENCE_NOT_FOUND')});
check('LC-D4 root drift invalidates binding',()=>{const s=D.stage(input);const v=D.verify(s.occurrence_id,{...input,root:'/tmp/repo-b'});assert.equal(v.ok,false);assert.equal(v.reason,'LOCAL_CANDIDATE_BINDING_CHANGED');D.forget(s.occurrence_id)});
check('LC-D5 run occurrence drift invalidates binding',()=>{const s=D.stage(input);const v=D.verify(s.occurrence_id,{...input,runId:'r-999'});assert.equal(v.ok,false);D.forget(s.occurrence_id)});
check('LC-D6 packet drift invalidates binding',()=>{const s=D.stage(input);const v=D.verify(s.occurrence_id,{...input,packet:{...packet,allowed_files:['scripts/builder/y.mjs']}});assert.equal(v.ok,false);D.forget(s.occurrence_id)});
check('LC-D7 canonical core drift invalidates binding',()=>{const s=D.stage(input);const v=D.verify(s.occurrence_id,{...input,canonicalCoreDigest:'sha256:core2'});assert.equal(v.ok,false);D.forget(s.occurrence_id)});
check('LC-D8 host decision is one-shot per exact occurrence',()=>{const s=D.stage(input);const c=D.constitute(s.occurrence_id,input);assert.equal(c.ok,true);assert.equal(c.execution_decision.one_shot,true);assert.match(c.execution_decision.decision_id,/^exec-/);const again=D.constitute(s.occurrence_id,input);assert.equal(again.ok,false);assert.equal(again.reason,'OCCURRENCE_ALREADY_DECIDED');D.forget(s.occurrence_id)});
check('LC-D9 withholding preserves pending state',()=>{const s=D.stage(input);const a=D.inspect(s.occurrence_id);const b=D.inspect(s.occurrence_id);assert.deepEqual(a,b);assert.equal(a.decided,false);D.forget(s.occurrence_id)});
console.log('\n'+passed+' passed · '+failed+' failed');process.exit(failed?1:0);
