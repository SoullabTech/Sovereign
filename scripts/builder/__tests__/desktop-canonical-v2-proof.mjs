#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '..', '..', '..');
const require = createRequire(import.meta.url);
const C = require('../../../jarvis-desktop/src/canonical-work-unit-v2.js');
const WUC = require('../../../jarvis-desktop/src/work-unit-control.js');

const renderer = fs.readFileSync(path.join(REPO, 'jarvis-desktop/src/renderer.js'), 'utf8');
const main = fs.readFileSync(path.join(REPO, 'jarvis-desktop/src/main.js'), 'utf8');
const helper = fs.readFileSync(path.join(REPO, 'jarvis-desktop/src/canonical-work-unit-v2.js'), 'utf8');
const controller = fs.readFileSync(path.join(REPO, 'jarvis-desktop/src/work-unit-control.js'), 'utf8');

const SHA='f0063747979b8104282e3f482dcd91ec6c208ad0';
let passed=0;
let failed=0;

function check(id,name,fn){
  try{fn();passed++;console.log('PASS  '+id+' — '+name);}
  catch(error){failed++;console.log('FAIL  '+id+' — '+name);console.log('      '+error.message);}
}
async function checkAsync(id,name,fn){
  try{await fn();passed++;console.log('PASS  '+id+' — '+name);}
  catch(error){failed++;console.log('FAIL  '+id+' — '+name);console.log('      '+error.message);}
}
function spec(patch={}){
  return {
    objective:'I4 canonical falsifier',
    workClass:'VERIFICATION',
    taskShape:'CODE_GROUNDED',
    capability:'',
    evidenceClass:'E1_REPOSITORY_LOCAL',
    requestedPosture:'default',
    reviewPressure:'ordinary',
    evidenceFocus:'scripts/builder/work-unit-v2.mjs',
    acceptanceCriteria:'canonical state is truthful',
    falsificationConditions:'authority widens',
    stopConditions:'stop before provider execution',
    authorityRequest:{networkExternal:false,providerSpend:false,externalDisclosure:'none'},
    ...patch,
  };
}
function tempEnv(){
  const home=fs.mkdtempSync(path.join(os.tmpdir(),'i4-falsifier-'));
  return {home,env:{...process.env,AIN_DELEGATION_HOME:home,USER:'i4-proof'}};
}
function cleanup(home){fs.rmSync(home,{recursive:true,force:true});}

async function routedFixture(env, nowMs=2000, s=spec()){
  let out=await C.createCanonicalV2(REPO,s,{canonicalSha:SHA,nowMs,env,actorId:'human:i4-proof'});
  assert.equal(out.ok,true,JSON.stringify(out.blockers));
  const id=out.work_unit_id;
  out=await C.transitionCanonicalV2(REPO,id,'BOUNDED',{env,actorId:'human:i4-proof'}); assert.equal(out.ok,true);
  out=await C.transitionCanonicalV2(REPO,id,'AUTHORIZED',{env,actorId:'human:i4-proof'}); assert.equal(out.ok,true);
  out=await C.bindCanonicalRouteV2(REPO,id,{env,actorId:'human:i4-proof'}); assert.equal(out.ok,true,JSON.stringify(out.blockers));
  return {id,out};
}

function canonicalRendererSlice(){
  const a=renderer.indexOf('function renderCanonicalV2Snapshot');
  const b=renderer.indexOf('function renderWorkUnitSnapshot',a);
  return renderer.slice(a,b);
}

await checkAsync('F1','canonical routed Desktop creation produces W0.v2, never a legacy packet',async()=>{
  const {home,env}=tempEnv();
  try{
    const out=await C.createCanonicalV2(REPO,spec(),{canonicalSha:SHA,nowMs:2100,env,actorId:'human:i4'});
    assert.equal(out.work_unit_version,'W0.v2');
    assert.equal(out.mode,'CANONICAL_V2');
    assert.equal(fs.existsSync(C.workUnitPath(out.work_unit_id,env)),true);
    assert.equal(fs.existsSync(path.join(home,'packets',out.work_unit_id+'.json')),false);
  }finally{cleanup(home);}
});

check('F2','renderer cannot supply lifecycle state',()=>{
  assert.doesNotMatch(canonicalRendererSlice(),/lifecycle_state\s*:/);
  assert.doesNotMatch(renderer,/mode:\s*'canonical-v2'[\s\S]{0,500}lifecycle_state\s*:/);
  assert.match(helper,/CANONICAL_SPEC_FIELD_REFUSED/);
});

check('F3','renderer cannot supply route record',()=>{
  assert.doesNotMatch(renderer,/mode:\s*'canonical-v2'[\s\S]{0,500}route_record\s*:/);
  assert.doesNotMatch(canonicalRendererSlice(),/route_record\s*:/);
  assert.match(helper,/route_record: null/);
});

check('F4','renderer cannot supply route digest',()=>{
  assert.doesNotMatch(renderer,/mode:\s*'canonical-v2'[\s\S]{0,500}route_digest\s*:/);
  assert.match(helper,/prospective_route_digest/);
  assert.match(helper,/canonical_route_digest/);
});

check('F5','renderer cannot supply canonical SHA',()=>{
  assert.doesNotMatch(renderer,/canonicalSha\s*:/);
  assert.doesNotMatch(renderer,/canonical_sha\s*:/);
  assert.match(main,/function currentCanonicalSha/);
  assert.match(main,/CWUV2\.createCanonicalV2\(root, spec, \{\s*canonicalSha/s);
});

check('F6','renderer cannot supply raw authority envelope',()=>{
  assert.doesNotMatch(renderer,/permission_envelope\s*:/);
  assert.doesNotMatch(renderer,/authorized_acts\s*:/);
  assert.match(helper,/RAW_AUTHORITY_FIELD_REFUSED/);
  assert.match(helper,/AUTHORITY_REQUEST_FIELDS/);
});

check('F7','renderer cannot supply arbitrary provider/model for canonical transport binding',()=>{
  const slice=canonicalRendererSlice();
  assert.match(slice,/route_participant_id/);
  assert.doesNotMatch(slice,/canonical-bind-transport[\s\S]{0,180}provider_id/);
  assert.doesNotMatch(slice,/canonical-bind-transport[\s\S]{0,180}model_id/);
  assert.match(helper,/governedTransportForParticipantV1/);
});

await checkAsync('F8','prospective preview is not canonical route truth',async()=>{
  const {home,env}=tempEnv();
  try{
    const out=await C.createCanonicalV2(REPO,spec(),{canonicalSha:SHA,nowMs:2101,env,actorId:'human:i4'});
    assert.equal(out.lifecycle.state,'DRAFT');
    assert.equal(out.work_unit.routing.route_record,null);
    assert.ok(out.prospective_preview.route_record);
    assert.equal(out.prospective_preview.classification,'PROSPECTIVE_NONCANONICAL_NONEXECUTING');
  }finally{cleanup(home);}
});

await checkAsync('F9','W3.v2 recomputes canonical route after AUTHORIZED',async()=>{
  const {home,env}=tempEnv();
  try{
    const {out}=await routedFixture(env,2102);
    assert.equal(out.lifecycle.state,'ROUTED');
    assert.equal(out.routing.route_version,'J5.v1');
    assert.ok(out.work_unit.routing.route_record);
    assert.ok(['MATCH','DIFF','NO_PROSPECTIVE_PREVIEW'].includes(out.preview_comparison.standing));
    assert.match(helper,/bindAuthorizedRouteV2/);
  }finally{cleanup(home);}
});

await checkAsync('F10','legacy task shapes are refused by W0.v2 Desktop creation',async()=>{
  const {home,env}=tempEnv();
  try{
    for(const taskShape of ['mechanical_code','deep_reasoning']){
      const out=await C.createCanonicalV2(REPO,spec({taskShape}),{canonicalSha:SHA,nowMs:2103,env,actorId:'human:i4'});
      assert.equal(out.ok,false);
      assert.ok(out.blockers.some(b=>b.code==='INVALID_TASK_SHAPE'));
    }
  }finally{cleanup(home);}
});

await checkAsync('F11','CODE_GROUNDED independent GPT_OSS review is route law, not optional UI preference',async()=>{
  const {home,env}=tempEnv();
  try{
    const preview=await C.prospectivePreview(REPO,spec(),{canonicalSha:SHA,nowMs:2200,env});
    const review=preview.route_record.challengers.find(c=>c.model_family==='GPT_OSS');
    assert.ok(review);
    assert.equal(review.required_for_completion,true);
    assert.equal(review.review_dimension,'distinct_model_family');
    assert.doesNotMatch(renderer,/id="wu-independent-review"/);
    assert.match(renderer,/QWEN primary → GPT_OSS required independent local review/);
  }finally{cleanup(home);}
});

await checkAsync('F12','provider id is never cognitive route identity in canonical v2',async()=>{
  const {home,env}=tempEnv();
  try{
    const preview=await C.prospectivePreview(REPO,spec(),{canonicalSha:SHA,nowMs:2201,env});
    assert.equal(preview.route_record.primary.model_family,'QWEN');
    assert.equal(Object.hasOwn(preview.route_record.primary,'provider_id'),false);
    assert.match(canonicalRendererSlice(),/model_family/);
    assert.match(canonicalRendererSlice(),/Model family = cognitive route/);
  }finally{cleanup(home);}
});

await checkAsync('F13','transport HOLD remains the selected family and cannot silently substitute',async()=>{
  const {home,env}=tempEnv();
  try{
    const {id}=await routedFixture(env,2202);
    const out=await C.bindCanonicalTransportV2(REPO,id,'primary',{env,actorId:'human:i4'});
    assert.equal(out.ok,true);
    assert.equal(out.transport_binding.model_family,'QWEN');
    assert.equal(out.transport_binding.provider_id,'qwen-local');
    assert.equal(out.transport_binding.readiness.status,'HOLD');
    assert.equal(out.work_unit.routing.route_record.primary.model_family,'QWEN');
  }finally{cleanup(home);}
});

check('F14','canonical read surface exposes no Run Provider / Run Strategy / R5B execute control',()=>{
  const slice=canonicalRendererSlice();
  assert.doesNotMatch(slice,/run-provider/);
  assert.doesNotMatch(slice,/wu-run-strategy/);
  assert.doesNotMatch(slice,/Authorize this execution once/);
  assert.doesNotMatch(slice,/Confirm Execute/);
  assert.match(slice,/Provider execution: <b>DISCONNECTED<\/b>/);
});

check('F15','MAIN refuses canonical Work Units before legacy run-provider/R5B execution path',()=>{
  const runIndex=main.indexOf("if (action === 'run-provider')");
  const guardIndex=main.indexOf('CANONICAL_V2_EXECUTION_DISCONNECTED',runIndex);
  const callIndex=main.indexOf('WUC.runProvider',runIndex);
  assert.ok(runIndex>=0 && guardIndex>runIndex && callIndex>guardIndex);
  for(const action of ['execution-auth-preview','authorize-execution-once','confirm-execute']){
    const i=main.indexOf(`if (action === '${action}')`);
    const g=main.indexOf('CANONICAL_V2_EXECUTION_DISCONNECTED',i);
    assert.ok(i>=0 && g>i);
  }
});

await checkAsync('F16','lower controller refuses provider execution for canonical W0.v2',async()=>{
  const {home,env}=tempEnv();
  try{
    const created=await C.createCanonicalV2(REPO,spec(),{canonicalSha:SHA,nowMs:2203,env,actorId:'human:i4'});
    const out=await WUC.runProvider(REPO,{work_unit_id:created.work_unit_id,provider_id:'qwen-local'},{env});
    assert.equal(out.ok,false);
    assert.equal(out.status,'CANONICAL_V2_EXECUTION_DISCONNECTED');
  }finally{cleanup(home);}
});

await checkAsync('F17','provider_strategy is absent from canonical routing authority/read model',async()=>{
  const {home,env}=tempEnv();
  try{
    const created=await C.createCanonicalV2(REPO,spec(),{canonicalSha:SHA,nowMs:2204,env,actorId:'human:i4'});
    assert.equal(Object.hasOwn(created,'provider_strategy'),false);
    assert.doesNotMatch(canonicalRendererSlice(),/provider_strategy/);
    assert.doesNotMatch(helper,/provider_strategy/);
  }finally{cleanup(home);}
});

await checkAsync('F18','failed primary remains visible after retry success in canonical read model',async()=>{
  const {home,env}=tempEnv();
  try{
    const e2e=await import('../work-unit-e2e-v2.mjs');
    const synthetic=e2e.runSyntheticCanonicalCompositionV2();
    assert.equal(synthetic.ok,true);
    const id=synthetic.final_envelope.work_unit.identity.id;
    fs.mkdirSync(path.dirname(C.workUnitPath(id,env)),{recursive:true});
    fs.writeFileSync(C.workUnitPath(id,env),JSON.stringify(synthetic.final_envelope,null,2)+'\n');
    const status=await C.statusCanonicalV2(REPO,id,{env});
    const primary=status.provenance.attempts.find(a=>a.attempt_id==='primary-1');
    const retry=status.provenance.attempts.find(a=>a.attempt_id==='retry-1');
    assert.equal(primary.status,'failed');
    assert.equal(retry.status,'completed');
    assert.match(canonicalRendererSlice(),/attempt\.status === 'failed'/);
  }finally{cleanup(home);}
});

check('F19','retry is rendered distinctly from independent model review',()=>{
  assert.match(renderer,/retry: 'Retry'/);
  assert.match(renderer,/independent_model_review: 'Independent model review'/);
  assert.match(canonicalRendererSlice(),/canonicalAttemptLabel\(attempt\.attempt_kind\)/);
});

await checkAsync('F20','verifier support is displayed separately from adjudication',async()=>{
  const {home,env}=tempEnv();
  try{
    const e2e=await import('../work-unit-e2e-v2.mjs');
    const synthetic=e2e.runSyntheticCanonicalCompositionV2();
    const id=synthetic.final_envelope.work_unit.identity.id;
    fs.mkdirSync(path.dirname(C.workUnitPath(id,env)),{recursive:true});
    fs.writeFileSync(C.workUnitPath(id,env),JSON.stringify(synthetic.final_envelope,null,2)+'\n');
    const status=await C.statusCanonicalV2(REPO,id,{env});
    assert.ok(status.provenance.verifier_results.length>0);
    assert.equal(status.provenance.adjudication,null);
    assert.match(canonicalRendererSlice(),/Verification evidence is not adjudication/);
  }finally{cleanup(home);}
});

async function seedEvidenceReady(env){
  const e2e=await import('../work-unit-e2e-v2.mjs');
  const synthetic=e2e.runSyntheticCanonicalCompositionV2();
  assert.equal(synthetic.ok,true);
  const envelope=JSON.parse(JSON.stringify(synthetic.final_envelope));
  envelope.work_unit.state.lifecycle_state='EVIDENCE_READY';
  envelope.work_unit.state.disposition='open';
  envelope.guard.current_state='EVIDENCE_READY';
  const id=envelope.work_unit.identity.id;
  fs.mkdirSync(path.dirname(C.workUnitPath(id,env)),{recursive:true});
  fs.writeFileSync(C.workUnitPath(id,env),JSON.stringify(envelope,null,2)+'\n');
  return id;
}

await checkAsync('F21','model consensus cannot enable adjudication',async()=>{
  const {home,env}=tempEnv();
  try{
    const id=await seedEvidenceReady(env);
    const out=await C.adjudicateCanonicalV2(
      REPO,id,
      {decision:'accepted',basis_refs:['verifier:x'],model_consensus:true},
      {env,actorId:'human:i4-proof'},
    );
    assert.equal(out.ok,false);
    assert.equal(out.reason,'ADJUDICATION_REQUEST_REFUSED');
  }finally{cleanup(home);}
});

await checkAsync('F22','model-authored adjudication is refused; helper always derives model_authored:false',async()=>{
  const {home,env}=tempEnv();
  try{
    const id=await seedEvidenceReady(env);
    const bad=await C.adjudicateCanonicalV2(
      REPO,id,
      {decision:'accepted',basis_refs:['verifier:x'],model_authored:true},
      {env,actorId:'model:qwen'},
    );
    assert.equal(bad.ok,false);
    assert.equal(bad.reason,'ADJUDICATION_REQUEST_REFUSED');

    const good=await C.adjudicateCanonicalV2(
      REPO,id,
      {decision:'accepted',basis_refs:['verifier:x']},
      {env,actorId:'human:i4-proof'},
    );
    assert.equal(good.ok,true);
    assert.equal(good.adjudication_record.model_authored,false);
    assert.equal(good.adjudication_record.actor_kind,'human');
  }finally{cleanup(home);}
});

await checkAsync('F23','adjudication gesture is unavailable before EVIDENCE_READY',async()=>{
  const {home,env}=tempEnv();
  try{
    const created=await C.createCanonicalV2(REPO,spec(),{canonicalSha:SHA,nowMs:2300,env,actorId:'human:i4'});
    assert.equal(created.next_actions.some(a=>a.action==='canonical-adjudicate'),false);
    const out=await C.adjudicateCanonicalV2(
      REPO,created.work_unit_id,
      {decision:'accepted',basis_refs:['x']},
      {env,actorId:'human:i4'},
    );
    assert.equal(out.ok,false);
    assert.equal(out.reason,'EVIDENCE_READY_REQUIRED');
  }finally{cleanup(home);}
});

check('F24','Desktop never directly writes ADJUDICATED lifecycle state',()=>{
  assert.doesNotMatch(helper,/\.lifecycle_state\s*=\s*['"]ADJUDICATED['"]/);
  assert.doesNotMatch(main,/\.lifecycle_state\s*=\s*['"]ADJUDICATED['"]/);
  assert.doesNotMatch(canonicalRendererSlice(),/\.lifecycle_state\s*=\s*['"]ADJUDICATED['"]/);
  assert.match(helper,/transitionLifecycleV2\(envelope, \{/);
});

await checkAsync('F25','adjudication never auto-closes; closure is a separate human gesture',async()=>{
  const {home,env}=tempEnv();
  try{
    const id=await seedEvidenceReady(env);
    const adjudicated=await C.adjudicateCanonicalV2(
      REPO,id,
      {decision:'accepted',basis_refs:['verifier:x']},
      {env,actorId:'human:i4'},
    );
    assert.equal(adjudicated.ok,true);
    assert.equal(adjudicated.lifecycle.state,'ADJUDICATED');
    assert.equal(adjudicated.provenance.closure,null);
    assert.equal(adjudicated.next_actions.some(a=>a.action==='canonical-close'),true);
  }finally{cleanup(home);}
});

check('F26','legacy deriveLifecycle cannot override canonical W2.v2',()=>{
  assert.doesNotMatch(helper,/deriveLifecycle/);
  assert.match(helper,/transitionLifecycleV2/);
  const statusBranch=main.slice(main.indexOf("if (action === 'status')"),main.indexOf("if (action === 'canonical-bound')"));
  assert.ok(statusBranch.indexOf('CWUV2.existsCanonicalV2') < statusBranch.indexOf('WUC.status'));
});

await checkAsync('F27','stale prospective preview cannot overwrite newer intent or canonical route',async()=>{
  const {home,env}=tempEnv();
  try{
    const oldPreview=await C.prospectivePreview(REPO,spec({taskShape:'CODE_GROUNDED'}),{
      canonicalSha:SHA,nowMs:2301,env,
    });
    assert.equal(oldPreview.route_record.primary.model_family,'QWEN');

    const newer=spec({
      objective:'Newer architecture intent',
      taskShape:'ARCHITECTURE_REASONING',
    });
    const created=await C.createCanonicalV2(REPO,newer,{canonicalSha:SHA,nowMs:2302,env,actorId:'human:i4'});
    const id=created.work_unit_id;
    let out=await C.transitionCanonicalV2(REPO,id,'BOUNDED',{env,actorId:'human:i4'});
    out=await C.transitionCanonicalV2(REPO,id,'AUTHORIZED',{env,actorId:'human:i4'});
    out=await C.bindCanonicalRouteV2(REPO,id,{env,actorId:'human:i4'});
    assert.equal(out.routing.participants[0].model_family,'GPT_OSS');
    assert.equal(out.preview_comparison.standing,'MATCH');
    assert.notEqual(out.prospective_preview.route_digest,oldPreview.route_digest);
    assert.match(renderer,/generation !== routePreviewGeneration/);
  }finally{cleanup(home);}
});

await checkAsync('F28','canonical read model is presentation-only and cannot widen authority/lifecycle',async()=>{
  const {home,env}=tempEnv();
  try{
    const created=await C.createCanonicalV2(REPO,spec(),{canonicalSha:SHA,nowMs:2303,env,actorId:'human:i4'});
    const file=C.workUnitPath(created.work_unit_id,env);
    const before=fs.readFileSync(file,'utf8');
    const status=await C.statusCanonicalV2(REPO,created.work_unit_id,{env});
    const after=fs.readFileSync(file,'utf8');
    assert.equal(before,after);
    assert.equal(status.presentation_only,true);
    assert.equal(status.authority_effect,'none');
    assert.equal(status.provider_execution.authority_created,false);
  }finally{cleanup(home);}
});

check('F29','canonical v2 and legacy compatibility do not share lifecycle authority',()=>{
  assert.match(helper,/work_unit_version: 'W0\.v2'/);
  assert.match(helper,/transitionLifecycleV2/);
  assert.doesNotMatch(helper,/work-unit\.mjs/);
  assert.match(renderer,/LEGACY \/ COMPATIBILITY/);
  assert.match(renderer,/legacy compatibility only — not W2\.v2 canonical state/);
  assert.match(main,/CWUV2\.existsCanonicalV2/);
});

await checkAsync('F30','no I4 canonical action creates provider execution authority',async()=>{
  const {home,env}=tempEnv();
  try{
    const created=await C.createCanonicalV2(REPO,spec(),{canonicalSha:SHA,nowMs:2304,env,actorId:'human:i4'});
    assert.equal(created.provider_execution.connected,false);
    assert.equal(created.provider_execution.authority_created,false);
    assert.doesNotMatch(helper,/provider\.execute:/);
    const slice=canonicalRendererSlice();
    assert.doesNotMatch(slice,/confirm-execute/);
    assert.doesNotMatch(slice,/authorize-execution-once/);
  }finally{cleanup(home);}
});

console.log('\n'+passed+' passed · '+failed+' failed');
process.exit(failed===0?0:1);
