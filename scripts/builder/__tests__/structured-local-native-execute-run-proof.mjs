#!/usr/bin/env node
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { execFileSync } from 'node:child_process';
import { mkdtempSync,mkdirSync,writeFileSync,rmSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const tmp=mkdtempSync(path.join(os.tmpdir(),'ec1-r16-run-'));
const home=path.join(tmp,'ain');const repo=path.join(tmp,'repo');mkdirSync(home);mkdirSync(path.join(home,'packets'),{recursive:true});mkdirSync(path.join(home,'results'),{recursive:true});mkdirSync(path.join(home,'logs'),{recursive:true});mkdirSync(repo);process.env.AIN_DELEGATION_HOME=home;
const runtime=await import('../jarvis-runtime-pipeline.mjs?r16run='+Date.now());
const { ledgerPath }=await import('../jarvis-native-patch-admission.mjs?r16run='+Date.now());
const git=(args)=>execFileSync('git',args,{cwd:repo,encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();
let passed=0,failed=0;
function check(name,fn){try{fn();passed++;console.log('PASS  '+name)}catch(e){failed++;console.log('FAIL  '+name);console.log('      '+e.stack)}}
try{
  git(['init','-q']);git(['config','user.name','Proof']);git(['config','user.email','proof@local.invalid']);writeFileSync(path.join(repo,'allowed.txt'),'before\n');git(['add','.']);git(['commit','-qm','base']);const base=git(['rev-parse','HEAD']);
  const packet={work_unit_id:'structured-execute-run',objective:'change allowed',expected_output:'one candidate',execution_lane:'local-native',canonical_sha:base,branch:'fix/structured-execute-run',worktree:repo,allowed_files:['allowed.txt'],context_selectors:['allowed.txt'],verification_mode:'structured-v1',verification_plan:{version:'EC1-VERIFY.v1',operations:[{operation_id:'o1',kind:'text.contains',effect_class:'INSPECT',args:{path:'allowed.txt',literal:'after'}}]},verification_commands:["printf 'LEGACY-RAN\\n' >> allowed.txt"],authorized_acts:['repo.read','repo.write:worktree','tests.run'],not_authorized_acts:['production.read','production.write','deploy','authority.change','network.external','provider.spend','repo.disclose:external-readonly'],integration_actor:'jarvis'};
  const run={run_id:'r-structured-proof',packet,owns_packet:false,state:'QUEUED',created_at:new Date().toISOString(),origin:'proof'};
  const events=[];
  const ctx={
    transition(r,state,patch){Object.assign(r,patch||{},{state});return r;},cancelled(){return false;},emit(name,payload){events.push({name,payload});},registerChild(){},
    spawnDelegate(){
      const child=new EventEmitter();child.stdout=new EventEmitter();child.stderr=new EventEmitter();
      queueMicrotask(()=>{
        try{
          writeFileSync(path.join(repo,'allowed.txt'),'after\n');git(['add','allowed.txt']);execFileSync('git',['-c','user.name=JARVIS','-c','user.email=jarvis@local.invalid','commit','-qm','chore(jarvis): structured-execute-run'],{cwd:repo,stdio:['ignore','pipe','pipe']});const head=git(['rev-parse','HEAD']);
          const digest='sha256:'+'d'.repeat(64);const ledger=ledgerPath(packet.work_unit_id);mkdirSync(path.dirname(ledger),{recursive:true});writeFileSync(ledger,JSON.stringify({event:'APPLIED',code:'PATCH_APPLIED',applied:true,work_unit_id:packet.work_unit_id,patch_digest:digest,changed_paths:['allowed.txt']})+'\n');
          const resultDir=path.join(home,'results');mkdirSync(resultDir,{recursive:true});writeFileSync(path.join(resultDir,packet.work_unit_id+'.json'),JSON.stringify({work_unit_id:packet.work_unit_id,lane:'local-native',model:'qwen3-coder:30b',starting_sha:base,ending_sha:head,files_changed:['allowed.txt'],summary:'canned structured candidate',exit_code:0,test_results:'not_run',verification_mode:'structured-v1',escalation_required:false,recommended_next_action:'review-diff',log_path:path.join(home,'logs',packet.work_unit_id+'.log'),duration_s:1,patch_admission:{ok:true,status:'APPLIED',code:'PATCH_APPLIED',patch_digest:digest,patch_paths:['allowed.txt'],changed_paths:['allowed.txt'],evidence_path:ledger,event:{applied:true}}}));
          child.emit('close',0,null);
        }catch(e){child.stderr.emit('data',Buffer.from(String(e.stack||e)));child.emit('close',1,null);}
      });
      return child;
    },
  };
  const finished=await runtime.executeRun(run,ctx);
  check('R16-X1 full executeRun reaches VERIFIED through structured inspection',()=>{assert.equal(finished.state,'VERIFIED',JSON.stringify(finished));assert.equal(finished.verification.ok,true);assert.equal(finished.verification.structured.ok,true);assert.equal(finished.result.test_results,'pass')});
  check('R16-X2 dangerous legacy verifier string never executed',()=>{assert.equal(execFileSync('git',['show','HEAD:allowed.txt'],{cwd:repo,encoding:'utf8'}),'after\n');assert.equal(git(['status','--porcelain','--untracked-files=all']),'')});
  check('R16-X3 verification event is emitted only after candidate custody exists',()=>{const done=events.find(e=>e.name==='verification.completed');assert.ok(done);assert.equal(done.payload.ok,true);assert.match(done.payload.commit_sha,/^[0-9a-f]{40}$/)});
  console.log('\n'+passed+' passed · '+failed+' failed');
}finally{rmSync(tmp,{recursive:true,force:true});}
process.exit(failed?1:0);
