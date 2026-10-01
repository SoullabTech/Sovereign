#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE=path.dirname(fileURLToPath(import.meta.url));
const REPO=path.resolve(HERE,'..','..','..');
const main=fs.readFileSync(path.join(REPO,'jarvis-desktop/src/main.js'),'utf8');
let passed=0,failed=0;
function check(name,fn){try{fn();passed++;console.log('PASS  '+name)}catch(e){failed++;console.log('FAIL  '+name);console.log('      '+e.stack)}}

function createHandlerSlice(){
  const a=main.indexOf("if (action === 'create')");
  const b=main.indexOf("if (action === 'status')",a);
  assert.ok(a>=0&&b>a,'create handler slice not found');
  return main.slice(a,b);
}

check('R8-1 MAIN imports the governed dual-shadow coordinator',()=>{
  assert.match(main,/const DUAL_SHADOW = require\('\.\/dual-work-shadow\.js'\);/);
});

check('R8-2 dual-shadow is a distinct explicit create mode',()=>{
  const s=createHandlerSlice();
  assert.match(s,/req\?\.mode === 'dual-shadow'/);
  assert.match(s,/req\?\.mode === 'canonical-v2'/);
});

check('R8-3 dual-shadow requires explicit legacy and canonical specs',()=>{
  const s=createHandlerSlice();
  assert.match(s,/const legacySpec = req\?\.legacy_spec;/);
  assert.match(s,/const canonicalSpec = req\?\.canonical_spec;/);
  assert.match(s,/DUAL_SHADOW_SPECS_REQUIRED/);
});

check('R8-4 dual-shadow delegates only to createDualShadow with MAIN-derived SHA/time/actor',()=>{
  const s=createHandlerSlice();
  const a=s.indexOf("if (req?.mode === 'dual-shadow')");
  const b=s.indexOf('let routeRecord = null;',a);
  const dual=s.slice(a,b);
  assert.match(dual,/DUAL_SHADOW\.createDualShadow/);
  assert.match(dual,/canonicalSha/);
  assert.match(dual,/nowMs: Date\.now\(\)/);
  assert.match(dual,/actorId: desktopHumanActorId\(\)/);
  for(const forbidden of ['MECH.runWorkUnit','canonicalConfirmAuthorizedExecution','runProvider','authorizeExecutionOnce','transitionCanonicalV2']){
    assert.equal(dual.includes(forbidden),false,'dual block contains '+forbidden);
  }
});

check('R8-5 existing canonical-v2 create path remains ahead of dual-shadow and unchanged in shape',()=>{
  const s=createHandlerSlice();
  assert.ok(s.indexOf("mode === 'canonical-v2'") < s.indexOf("mode === 'dual-shadow'"));
  assert.match(s,/CWUV2\.createCanonicalV2\(root, spec, \{[\s\S]*canonicalSha,[\s\S]*nowMs: Date\.now\(\),[\s\S]*env: process\.env,[\s\S]*actorId: desktopHumanActorId\(\)/);
});

check('R8-6 existing legacy create path remains the default fallthrough',()=>{
  const s=createHandlerSlice();
  assert.match(s,/const built = OPWU\.buildPacket\(spec,/);
  assert.match(s,/const created = await WUC\.create\(root, built\.packet\);/);
});

check('R8-7 renderer does not expose dual-shadow mode yet',()=>{
  const renderer=fs.readFileSync(path.join(REPO,'jarvis-desktop/src/renderer.js'),'utf8');
  assert.equal(renderer.includes('dual-shadow'),false);
});

console.log('\n'+passed+' passed · '+failed+' failed');
process.exit(failed?1:0);
