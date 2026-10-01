#!/usr/bin/env node
import assert from 'node:assert/strict';
import {
  mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync,
} from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import os from 'node:os';

const tmp=mkdtempSync(path.join(os.tmpdir(),'ec1-r16-'));
const home=path.join(tmp,'ain');
const repo=path.join(tmp,'repo');
mkdirSync(home);mkdirSync(repo);process.env.AIN_DELEGATION_HOME=home;
const pipeline=await import('../jarvis-runtime-pipeline.mjs?r16='+Date.now());
const inspect=await import('../local-verifier-inspection-v1.mjs?r16='+Date.now());
let passed=0,failed=0;
function check(name,fn){try{fn();passed++;console.log('PASS  '+name)}catch(e){failed++;console.log('FAIL  '+name);console.log('      '+e.stack)}}
const git=(args)=>execFileSync('git',args,{cwd:repo,encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();

try{
  git(['init','-q']);git(['config','user.name','Proof']);git(['config','user.email','proof@local.invalid']);
  writeFileSync(path.join(repo,'allowed.txt'),'before\n');git(['add','.']);git(['commit','-qm','base']);const base=git(['rev-parse','HEAD']);
  writeFileSync(path.join(repo,'allowed.txt'),'after\n');git(['add','allowed.txt']);
  execFileSync('git',['-c','user.name=JARVIS','-c','user.email=jarvis@local.invalid','commit','-qm','chore(jarvis): structured-r16'],{cwd:repo,stdio:['ignore','pipe','pipe']});
  const head=git(['rev-parse','HEAD']);
  const plan={version:'EC1-VERIFY.v1',operations:[
    {operation_id:'o1',kind:'git.diff_check',effect_class:'INSPECT',args:{}},
    {operation_id:'o2',kind:'file.exists',effect_class:'INSPECT',args:{path:'allowed.txt'}},
    {operation_id:'o3',kind:'text.contains',effect_class:'INSPECT',args:{path:'allowed.txt',literal:'after'}},
  ]};
  const packet={
    work_unit_id:'structured-r16',objective:'structured candidate',expected_output:'one candidate',execution_lane:'local-native',canonical_sha:base,branch:'fix/structured-r16',allowed_files:['allowed.txt'],context_selectors:['allowed.txt'],
    verification_mode:'structured-v1',verification_plan:plan,
    verification_commands:["printf 'SHOULD_NOT_RUN\\n' >> allowed.txt"],
    authorized_acts:['repo.read','repo.write:worktree','tests.run'],
    not_authorized_acts:['production.read','production.write','deploy','authority.change','network.external','provider.spend','repo.disclose:external-readonly'],integration_actor:'jarvis',
  };
  const ledger=path.join(home,'native-patch-admission',packet.work_unit_id+'.jsonl');mkdirSync(path.dirname(ledger),{recursive:true});const digest='sha256:'+'c'.repeat(64);
  writeFileSync(ledger,JSON.stringify({event_version:'NPA1.v1',event:'APPLIED',code:'PATCH_APPLIED',applied:true,work_unit_id:packet.work_unit_id,patch_digest:digest,patch_paths:['allowed.txt'],changed_paths:['allowed.txt']})+'\n');
  const result={work_unit_id:packet.work_unit_id,lane:'local-native',model:'qwen3-coder:30b',starting_sha:base,ending_sha:head,files_changed:['allowed.txt'],summary:'structured candidate',exit_code:0,test_results:'not_run',verification_mode:'structured-v1',escalation_required:false,recommended_next_action:'review-diff',log_path:path.join(tmp,'worker.log'),duration_s:1,patch_admission:{ok:true,status:'APPLIED',code:'PATCH_APPLIED',patch_digest:digest,patch_paths:['allowed.txt'],changed_paths:['allowed.txt'],evidence_path:ledger,event:{applied:true}}};

  check('R16-1 structured packet is schema-valid and authority-valid without legacy command requirement',()=>{
    const v=pipeline.validatePacket(packet);assert.equal(v.ok,true,JSON.stringify(v));const a=pipeline.checkAuthority(packet);assert.equal(a.ok,true,JSON.stringify(a));
  });
  check('R16-2 structured custody validation never invokes legacy runVerification hook',()=>{
    let called=false;const v=pipeline.validateNativePatchResult(packet,result,repo,{runVerification(){called=true;throw new Error('legacy verifier called');}});assert.equal(v.ok,true,JSON.stringify(v));assert.equal(called,false);assert.equal(v.structured_verification_pending,true);assert.match(v.verification_plan_digest,/^sha256:/);
  });
  check('R16-3 R14 inspection verifier passes the committed candidate',()=>{
    const v=inspect.executeInspectionVerifierPlanV1(plan,{worktree:repo});assert.equal(v.ok,true,JSON.stringify(v));assert.equal(v.status,'PASS');
  });
  check('R16-4 dangerous legacy verification_commands are not required or replayed by structured custody',()=>{
    assert.equal(readFileSync(path.join(repo,'allowed.txt'),'utf8'),'after\n');
  });
  check('R16-5 structured result must declare structured mode',()=>{
    const v=pipeline.validateNativePatchResult(packet,{...result,verification_mode:'legacy'},repo);assert.equal(v.ok,false);assert.equal(v.failure_class,'NATIVE_STRUCTURED_VERIFICATION_MODE_MISMATCH');
  });
  check('R16-6 project-execution verifier plan is rejected at authority boundary',()=>{
    const p={...packet,verification_plan:{version:'EC1-VERIFY.v1',operations:[{operation_id:'t1',kind:'project.test',effect_class:'PROJECT_EXECUTION',args:{runner:'node',argv:['--test']}}]}};
    const a=pipeline.checkAuthority(p);assert.equal(a.ok,false);assert.equal(a.failure_class,'NATIVE_VERIFICATION_REQUIRED');
  });
  check('R16-7 verification plan without structured mode is rejected by packet schema',()=>{
    const p={...packet};delete p.verification_mode;const v=pipeline.validatePacket(p);assert.equal(v.ok,false);assert.ok(v.errors.some(x=>x.includes('verification_plan requires verification_mode')));
  });
  check('R16-8 legacy packet still requires verification_commands',()=>{
    const legacy={...packet};delete legacy.verification_mode;delete legacy.verification_plan;legacy.verification_commands=[];const a=pipeline.checkAuthority(legacy);assert.equal(a.ok,false);assert.equal(a.failure_class,'NATIVE_VERIFICATION_REQUIRED');
  });
  check('R16-9 delegate structured branch structurally excludes shell verifier and repair',()=>{
    const src=readFileSync(new URL('../../ain-delegate.sh',import.meta.url),'utf8');
    assert.match(src,/\[ "\$verification_mode" != "structured-v1" \] && \[ "\$vcount" -gt 0 \]/);
    assert.match(src,/\[ "\$verification_mode" != "structured-v1" \] \\\n\s*&& \[ "\$test_results" = "fail" \]/);
    assert.match(src,/\[ "\$test_results" = "pass" \] \|\| \[ "\$test_results" = "not_run" \]/);
    assert.match(src,/verification_mode: \$verification_mode/);
  });
  check('R16-10 runtime calls structured inspection only after native custody validation',()=>{
    const src=readFileSync(new URL('../jarvis-runtime-pipeline.mjs',import.meta.url),'utf8');const custody=src.indexOf('const nativeVerification = validateNativePatchResult');const structured=src.indexOf('executeInspectionVerifierPlanV1',custody);assert.ok(custody>=0&&structured>custody);
  });
  check('R16-11 delegate shell syntax remains valid',()=>{execFileSync('bash',['-n',path.resolve(path.dirname(new URL(import.meta.url).pathname),'../../ain-delegate.sh')]);});

  console.log('\n'+passed+' passed · '+failed+' failed');
}finally{rmSync(tmp,{recursive:true,force:true});}
process.exit(failed?1:0);
