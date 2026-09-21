#!/usr/bin/env node
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import os from 'node:os';
import { applyNativeEdits } from '../jarvis-native-edit-admission.mjs';

let passed=0, failed=0;
const must=(cond,name)=>{ if(cond){passed++;console.log('  PASS  '+name)} else {failed++;console.log('  FAIL  '+name)} };
const tmp=mkdtempSync(path.join(os.tmpdir(),'nea-proof-')); const wt=path.join(tmp,'wt'); mkdirSync(wt);
execFileSync('git',['init','-q'],{cwd:wt}); execFileSync('git',['config','user.email','proof@local'],{cwd:wt}); execFileSync('git',['config','user.name','Proof'],{cwd:wt});
mkdirSync(path.join(wt,'src')); writeFileSync(path.join(wt,'src/a.txt'),'alpha\nbeta\n'); execFileSync('git',['add','.'],{cwd:wt}); execFileSync('git',['commit','-qm','base'],{cwd:wt});
process.env.AIN_DELEGATION_HOME=path.join(tmp,'home');
const packet={work_unit_id:'nea-proof',allowed_files:['src/a.txt'],objective:'x',task_class:'CODE_GROUNDED',execution_lane:'local-native',branch:'x',canonical_sha:execFileSync('git',['rev-parse','HEAD'],{cwd:wt,encoding:'utf8'}).trim(), governing_authority:'proof', established_facts:[], prohibited_files_actions:[], acceptance_criteria:[], escalation_conditions:[], expected_output:'x', context_selectors:['src/a.txt'], verification_commands:[]};
console.log('\n=== NEA1 unauthorized path ===');
let r=applyNativeEdits({packet,worktree:wt,outputText:'EDIT_JSON: '+JSON.stringify({edits:[{path:'src/b.txt',old_text:'x',new_text:'y'}]})});
must(!r.ok && r.code==='EDIT_PATH_NOT_AUTHORIZED','unauthorized path refused');
must(readFileSync(path.join(wt,'src/a.txt'),'utf8')==='alpha\nbeta\n','refusal leaves authorized file untouched');
console.log('\n=== NEA2 non-unique old text ===');
r=applyNativeEdits({packet,worktree:wt,outputText:'EDIT_JSON: '+JSON.stringify({edits:[{path:'src/a.txt',old_text:'a',new_text:'A'}]})});
must(!r.ok && r.code==='OLD_TEXT_NOT_UNIQUE','ambiguous replacement refused');
console.log('\n=== NEA3 exact edit ===');
r=applyNativeEdits({packet,worktree:wt,outputText:'EDIT_JSON: '+JSON.stringify({edits:[{path:'src/a.txt',old_text:'beta',new_text:'gamma'}]})});
must(r.ok && r.changed_paths.length===1 && r.changed_paths[0]==='src/a.txt','exact authorized edit applied');
must(readFileSync(path.join(wt,'src/a.txt'),'utf8')==='alpha\ngamma\n','result bytes are exact');
console.log(`\n${passed} passed · ${failed} failed`); rmSync(tmp,{recursive:true,force:true}); process.exit(failed?1:0);
