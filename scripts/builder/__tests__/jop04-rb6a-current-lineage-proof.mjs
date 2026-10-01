#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { route, declareRoutingEligibility } from '../router.mjs';

const HERE=path.dirname(fileURLToPath(import.meta.url));
const REPO=path.resolve(HERE,'..','..','..');
let passed=0,failed=0;
function check(name,fn){try{fn();passed++;console.log('PASS  '+name)}catch(e){failed++;console.log('FAIL  '+name);console.log('      '+e.stack)}}

const ELIGIBLE=declareRoutingEligibility({satisfied:true,basis:'jop04-rb6a-current-lineage-proof',declared_by:'proof'});

check('RB6A-1 registered capability without eligibility is not routable',()=>{
  const r=route({capability:'git.rev_parse',args:{}});
  assert.equal(r.execution_lane,null);assert.equal(r.status,'refused_not_routable');
});
check('RB6A-2 unbranded caller imitation cannot create routing eligibility',()=>{
  const r=route({capability:'git.rev_parse',args:{}},{satisfied:true,basis:'caller'});
  assert.equal(r.execution_lane,null);assert.equal(r.status,'refused_not_routable');
});
check('RB6A-3 genuine satisfied eligibility admits registered capability to C0',()=>{
  const r=route({capability:'git.rev_parse',args:{}},ELIGIBLE);
  assert.equal(r.execution_lane,'C0');assert.equal(r.status,'routed');
});
check('RB6A-4 registry membership cannot preempt router oversized refusal',()=>{
  const r=route({capability:'git.rev_parse',bounded_for_local:true,input_chars:999999},ELIGIBLE);
  assert.equal(r.execution_lane,null);assert.equal(r.status,'rejected_oversized');
});
check('RB6A-5 unregistered capability remains non-C0 despite genuine eligibility',()=>{
  const r=route({capability:'definitely.not.registered'},ELIGIBLE);
  assert.notEqual(r.execution_lane,'C0');
});
check('RB6A-6 forbidden registry-membership basis cannot mint eligibility',()=>{
  assert.throws(()=>declareRoutingEligibility({satisfied:true,basis:'registry_membership',declared_by:'proof'}),/restates registry membership/);
});
check('RB6A-7 MAIN obtains producer and consumer from the same router graph',()=>{
  const main=fs.readFileSync(path.join(REPO,'jarvis-desktop/src/main.js'),'utf8');
  assert.match(main,/const \{ route, declareRoutingEligibility \} = await import\(`file:\/\/\$\{routerPath\}\?t=\$\{Date\.now\(\)\}`\);/);
  assert.match(main,/const decision = route\(task, routingEligibility\);/);
});
check('RB6A-8 MAIN does not synthesize eligibility from registry membership',()=>{
  const main=fs.readFileSync(path.join(REPO,'jarvis-desktop/src/main.js'),'utf8');
  const a=main.indexOf("ipcMain.handle('jarvis:submit-task'");
  const b=main.indexOf("ipcMain.handle('jarvis:run-external-reasoning'",a);
  const slice=main.slice(a,b);
  assert.doesNotMatch(slice,/CAPABILITIES/);
  assert.match(slice,/task && typeof task\.routing === 'object'/);
});

console.log('\n'+passed+' passed · '+failed+' failed');
process.exit(failed?1:0);
