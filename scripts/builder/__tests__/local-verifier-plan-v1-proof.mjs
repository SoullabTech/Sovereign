#!/usr/bin/env node
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  VERIFIER_PLAN_VERSION,
  validateVerifierPlanV1,
  verifierPlanDigestV1,
} from '../local-verifier-plan-v1.mjs';
let passed=0,failed=0;
function check(name,fn){try{fn();passed++;console.log('PASS  '+name)}catch(e){failed++;console.log('FAIL  '+name);console.log('      '+e.stack)}}
const inspect=()=>({version:VERIFIER_PLAN_VERSION,operations:[
  {operation_id:'op-1',kind:'git.diff_check',effect_class:'INSPECT',args:{}},
  {operation_id:'op-2',kind:'file.exists',effect_class:'INSPECT',args:{path:'scripts/builder/router.mjs'}},
  {operation_id:'op-3',kind:'text.contains',effect_class:'INSPECT',args:{path:'scripts/builder/router.mjs',literal:'export function route'}},
]});
const project=()=>({version:VERIFIER_PLAN_VERSION,operations:[
  {operation_id:'op-test',kind:'project.test',effect_class:'PROJECT_EXECUTION',args:{runner:'node',argv:['--test','scripts/builder/__tests__/x.mjs']}},
]});

check('R13-1 structured inspection plan is admitted',()=>{const r=validateVerifierPlanV1(inspect());assert.equal(r.ok,true);assert.equal(r.status,'INSPECTION_PLAN_ADMITTED');assert.equal(r.executable,true);assert.match(r.digest,/^sha256:[0-9a-f]{64}$/)});
check('R13-2 project execution is representable but held',()=>{const r=validateVerifierPlanV1(project());assert.equal(r.ok,true);assert.equal(r.status,'HELD_FOR_EFFECT_CONTAINMENT');assert.equal(r.executable,false)});
check('R13-3 unknown verifier kind is refused',()=>{const p=inspect();p.operations[0].kind='mystery';const r=validateVerifierPlanV1(p);assert.equal(r.ok,false);assert.equal(r.reason,'VERIFIER_KIND_UNRECOGNIZED')});
check('R13-4 shell/string command fields are outside the closed operation schema',()=>{const p=inspect();p.operations[0].command='git diff --check';const r=validateVerifierPlanV1(p);assert.equal(r.ok,false);assert.equal(r.reason,'VERIFIER_OPERATION_SHAPE_REFUSED')});
check('R13-5 caller cwd/env fields are outside the closed plan schema',()=>{for(const k of ['cwd','env']){const p=inspect();p[k]='/tmp';const r=validateVerifierPlanV1(p);assert.equal(r.ok,false);assert.equal(r.reason,'VERIFIER_PLAN_SHAPE_REFUSED')}});
check('R13-6 repository paths are bounded relative paths',()=>{for(const path of ['/etc/passwd','../secret','a/../b','a\\b']){const p=inspect();p.operations[1].args.path=path;const r=validateVerifierPlanV1(p);assert.equal(r.ok,false,path)}});
check('R13-7 exact record order/key order does not change digest',()=>{const a=inspect();const b={operations:a.operations.map(o=>({args:o.args,effect_class:o.effect_class,kind:o.kind,operation_id:o.operation_id})),version:a.version};assert.equal(verifierPlanDigestV1(a),verifierPlanDigestV1(b))});
check('R13-8 materially changed verifier args change digest',()=>{const a=inspect();const b=inspect();b.operations[2].args.literal='different';assert.notEqual(verifierPlanDigestV1(a),verifierPlanDigestV1(b))});
check('R13-9 duplicate operation ids are refused',()=>{const p=inspect();p.operations[1].operation_id='op-1';const r=validateVerifierPlanV1(p);assert.equal(r.ok,false);assert.equal(r.reason,'VERIFIER_OPERATION_ID_DUPLICATE')});
check('R13-10 module has no runtime/effect capability',()=>{const src=readFileSync(new URL('../local-verifier-plan-v1.mjs',import.meta.url),'utf8').replace(/\/\*[\s\S]*?\*\//g,'').replace(/^\s*\/\/.*$/gm,'');for(const bad of ['node:fs','node:child_process','process.env','fetch(','spawn(','execFile','eval(','bash -lc','runCapability','runWorkUnit'])assert.equal(src.includes(bad),false,'found '+bad)});
console.log('\n'+passed+' passed · '+failed+' failed');process.exit(failed?1:0);
