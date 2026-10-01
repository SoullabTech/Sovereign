#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { executeInspectionVerifierPlanV1 } from '../local-verifier-inspection-v1.mjs';
import { VERIFIER_PLAN_VERSION } from '../local-verifier-plan-v1.mjs';
let passed=0,failed=0;
function check(name,fn){try{fn();passed++;console.log('PASS  '+name)}catch(e){failed++;console.log('FAIL  '+name);console.log('      '+e.stack)}}
function repo(){const root=fs.mkdtempSync(path.join(os.tmpdir(),'ec1-r14-'));execFileSync('git',['init','-q'],{cwd:root});execFileSync('git',['config','user.email','proof@local'],{cwd:root});execFileSync('git',['config','user.name','Proof'],{cwd:root});fs.mkdirSync(path.join(root,'src'));fs.writeFileSync(path.join(root,'src','a.txt'),'alpha\nbeta\n');execFileSync('git',['add','.'],{cwd:root});execFileSync('git',['commit','-qm','base'],{cwd:root});return root;}
const plan=(ops)=>({version:VERIFIER_PLAN_VERSION,operations:ops});

check('R14-1 inspection plan executes admitted operations only',()=>{const root=repo();try{const p=plan([
 {operation_id:'o1',kind:'git.diff_check',effect_class:'INSPECT',args:{}},
 {operation_id:'o2',kind:'git.status_short',effect_class:'INSPECT',args:{}},
 {operation_id:'o3',kind:'file.exists',effect_class:'INSPECT',args:{path:'src/a.txt'}},
 {operation_id:'o4',kind:'text.contains',effect_class:'INSPECT',args:{path:'src/a.txt',literal:'beta'}},
]);const r=executeInspectionVerifierPlanV1(p,{worktree:root});assert.equal(r.ok,true,JSON.stringify(r));assert.equal(r.status,'PASS');assert.equal(r.results.length,4);assert.ok(r.results.every(x=>x.status==='PASS'));}finally{fs.rmSync(root,{recursive:true,force:true})}});

check('R14-2 missing file is a verifier FAIL, not an exception or guessed PASS',()=>{const root=repo();try{const r=executeInspectionVerifierPlanV1(plan([{operation_id:'o1',kind:'file.exists',effect_class:'INSPECT',args:{path:'src/missing.txt'}}]),{worktree:root});assert.equal(r.ok,false);assert.equal(r.status,'FAIL');assert.equal(r.results[0].status,'FAIL');}finally{fs.rmSync(root,{recursive:true,force:true})}});

check('R14-3 project execution remains refused before any operation runs',()=>{const root=repo();try{const r=executeInspectionVerifierPlanV1(plan([{operation_id:'o1',kind:'project.test',effect_class:'PROJECT_EXECUTION',args:{runner:'node',argv:['--test']}}]),{worktree:root});assert.equal(r.ok,false);assert.equal(r.status,'REFUSED');assert.equal(r.reason,'PROJECT_EXECUTION_NOT_ADMITTED');assert.deepEqual(r.results,[]);}finally{fs.rmSync(root,{recursive:true,force:true})}});

check('R14-4 relative path escape is refused by the plan contract',()=>{const root=repo();try{const r=executeInspectionVerifierPlanV1(plan([{operation_id:'o1',kind:'file.exists',effect_class:'INSPECT',args:{path:'../outside'}}]),{worktree:root});assert.equal(r.ok,false);assert.equal(r.status,'REFUSED');assert.equal(r.reason,'VERIFIER_PATH_REFUSED');}finally{fs.rmSync(root,{recursive:true,force:true})}});

check('R14-5 symlink escape never reads the outside target',()=>{const root=repo();const outside=fs.mkdtempSync(path.join(os.tmpdir(),'ec1-r14-out-'));try{fs.writeFileSync(path.join(outside,'secret.txt'),'secret');fs.symlinkSync(path.join(outside,'secret.txt'),path.join(root,'src','link.txt'));const r=executeInspectionVerifierPlanV1(plan([{operation_id:'o1',kind:'text.contains',effect_class:'INSPECT',args:{path:'src/link.txt',literal:'secret'}}]),{worktree:root});assert.equal(r.ok,false);assert.equal(r.status,'FAIL');assert.equal(r.results[0].status,'ERROR');assert.match(r.results[0].evidence,/VERIFIER_REALPATH_OUTSIDE_WORKTREE/);}finally{fs.rmSync(root,{recursive:true,force:true});fs.rmSync(outside,{recursive:true,force:true})}});

check('R14-6 host worktree must be an existing absolute path',()=>{const p=plan([{operation_id:'o1',kind:'git.status_short',effect_class:'INSPECT',args:{}}]);for(const worktree of ['relative/path','/definitely/not/here']){const r=executeInspectionVerifierPlanV1(p,{worktree});assert.equal(r.ok,false);assert.equal(r.reason,'HOST_WORKTREE_REQUIRED')}});

check('R14-7 text inspection has a bounded read size',()=>{const root=repo();try{fs.writeFileSync(path.join(root,'src','big.txt'),'x'.repeat(2*1024*1024+1));const r=executeInspectionVerifierPlanV1(plan([{operation_id:'o1',kind:'text.contains',effect_class:'INSPECT',args:{path:'src/big.txt',literal:'x'}}]),{worktree:root});assert.equal(r.ok,false);assert.equal(r.results[0].status,'ERROR');assert.match(r.results[0].evidence,/VERIFIER_TEXT_TARGET_TOO_LARGE/);}finally{fs.rmSync(root,{recursive:true,force:true})}});

check('R14-8 executor source contains no shell/eval/project execution surface',()=>{const src=fs.readFileSync(new URL('../local-verifier-inspection-v1.mjs',import.meta.url),'utf8').replace(/\/\*[\s\S]*?\*\//g,'').replace(/^\s*\/\/.*$/gm,'');for(const bad of ["'bash'",'"bash"',"'-c'",'"-c"','eval(','spawn(','npm','npx','tsx','tsc','node --test','project.test\')'])assert.equal(src.includes(bad),false,'found '+bad);assert.match(src,/execFileSync\('git',args/);});

console.log('\n'+passed+' passed · '+failed+' failed');process.exit(failed?1:0);
