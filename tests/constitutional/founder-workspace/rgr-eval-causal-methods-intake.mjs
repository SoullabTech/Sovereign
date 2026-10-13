import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..');
const read=(p)=>readFileSync(path.join(root,p));
const digest=(data)=>createHash('sha256').update(data).digest('hex');
const manifest=JSON.parse(read('docs/programme/RGR-EVAL-CAUSAL-01_METHOD_CANDIDATES_2026-10-12.json').toString('utf8'));
const doc=read('docs/programme/RGR-EVAL-CAUSAL-01_METHOD_DESIGN_2026-10-12.md').toString('utf8');

const immutable=[
 ['docs/programme/RGR-03_FALSIFICATION_CONTRACT_2026-09-18.md','b5bd5bbadfd1097752e2c312d0918cce3f1d612ffd27a735c1e1b8d662a23f26'],
 ['docs/programme/RGR-04_PREREGISTRATION_LOCK_2026-09-18.md','21b95f61d628ed804aa8e1892d4ea0cf20a88e96d5ce208feda5a7e539dcb226'],
 ['docs/programme/evidence/RGR-06/RGR06_RUNTIME_LOCK.json','322f6cc16a033e92e5c86811607d41ab9c5914e9353f0871d54216b887f647b4'],
 ['docs/programme/RGR-05_PRE_MATERIALIZATION_FEASIBILITY_REPORT_2026-09-18.md','fc03b492142044eeb046ca603088855f630211707534577b3355a5c5447dee5e'],
];
const forbiddenKeys=['THIRD_PARTY_INSTALL','DEPENDENCY_BUILD','NEW_MODEL_DOWNLOAD','MODEL_INFERENCE','BENCHMARK_MATERIALIZATION','RGR_04_MODIFICATION','RGR_06_MODIFICATION','TRAINING','TEST_EXECUTION','REPLICATION','REAL_MEMBER_DATA','CLINICAL_DATA','PRODUCTION_READ_WRITE','MAIA_PROMPT_MEMORY_CHANGE','GIT_MERGE','DEPLOYMENT','PROVIDER_SPEND','NEW_CANONICAL_WORK_UNIT_GRANT'];

function problems(x) {
 const errors=[];
 if(x.schema!=='rgr.eval-causal-method-candidates.v1'||x.workstream!=='RGR-EVAL-CAUSAL-01')errors.push('identity');
 if(x.foundry_source_commit!=='45ac2a182a7687062704e28f0dc0e3d5e0c5ce4d')errors.push('unreviewed base');
 if(x.work_class!=='RESEARCH_DESIGN_ONLY'||x.status!=='DRAFT_FOR_INDEPENDENT_REVIEW')errors.push('standing');
 if(x.frozen_benchmark!=='RGR-RT1-D2C-01')errors.push('benchmark identity');
 if(!Array.isArray(x.forbidden)||forbiddenKeys.some(k=>!x.forbidden.includes(k)))errors.push('forbidden act omitted');
 if(!Array.isArray(x.allowed_this_gate)||x.allowed_this_gate.some(a=>!['READ_ONLY_PUBLIC_METHOD_COMPARISON','DETERMINISTIC_SOURCE_INVENTORY','DOCUMENTARY_INTERFACE_DESIGN','NON_EXECUTABLE_NEGATIVE_CONTROL_DESIGN'].includes(a)))errors.push('unexpected action');
 for(const key of ['member_data','maia_runtime','clinical_inference','downloads','tool_execution','experiments','training','production','merge','deployment'])
  if(x[key]!=='NOT_AUTHORIZED')errors.push('execution field '+key);
 if(!Array.isArray(x.candidate_methods)||x.candidate_methods.length!==4)errors.push('four methods');
 else {
  const ids=new Set();
  for(const m of x.candidate_methods) {
   if(ids.has(m.id)||!['FND-EVL-01','FND-EVL-02','FND-RGR-05','FND-RGR-03'].includes(m.id))errors.push('candidate ID');
   ids.add(m.id);
   if(!['COMPARE_ONLY','FUTURE_SEPARATE_GATE'].includes(m.adoption_decision)||m.execution!=='NOT_AUTHORIZED')errors.push('method authority');
   if(m.source_revision!==null||m.license_exact!==null||m.security_review!=='PENDING'||m.dependency_review!=='PENDING')errors.push('falsely cleared upstream');
   if(!m.known_gap||!Array.isArray(m.design_checks)||m.design_checks.length<3)errors.push('uncritical method');
  }
 }
 if(!Array.isArray(x.minimum_negative_controls)||x.minimum_negative_controls.length<5)errors.push('minimum controls');
 if(!Array.isArray(x.baselines_preserved)||!x.baselines_preserved.some(s=>s.includes('SYMBOLIC')))errors.push('nongeometric alternative missing');
 return errors;
}

test('Method design preserves source and all four named research options',()=>{
 assert.deepEqual(problems(manifest),[]);
 assert.deepEqual(manifest.candidate_methods.map(x=>x.title),['Inspect AI','LM Evaluation Harness','DoWhy','pyvene']);
});

test('Frozen RGR-03, RGR-04, RGR-05 and RGR-06 evidence is byte-identical',()=>{
 for(const [file,hash] of immutable)assert.equal(digest(read(file)),hash,file);
});

test('Original benchmark identity and causal contrasts are unmodified',()=>{
 const locked=read('docs/programme/RGR-04_PREREGISTRATION_LOCK_2026-09-18.md').toString('utf8');
 assert.match(locked,/RGR-RT1-D2C-01/);
 assert.match(locked,/DIRECTED_TWO_STEP_COMPOSITION/);
 assert.match(locked,/BALANCED_16BIT_NODE_CODE/);
 assert.match(doc,/RGR-RT1-D2C-01/);
 assert.match(doc,/x = G\(s,r,η\)/);
 assert.match(doc,/same relation, changed surface/i);
 assert.match(doc,/changed relation, matched surface/i);
});

test('Model execution permission cannot be smuggled through a method definition',()=>{
 const tampered=structuredClone(manifest);
 tampered.candidate_methods[0].execution='AUTHORIZED';
 assert.ok(problems(tampered).includes('method authority'));
});

test('Foundry descendant cannot claim benchmark materialization or MAIA access',()=>{
 const tampered=structuredClone(manifest);
 tampered.downloads='AUTHORIZED';
 tampered.maia_runtime='AUTHORIZED';
 assert.ok(problems(tampered).includes('execution field downloads'));
 assert.ok(problems(tampered).includes('execution field maia_runtime'));
});

test('Benchmark no-rescue, symbolic comparator and negative controls remain mandatory',()=>{
 const tampered=structuredClone(manifest);
 tampered.minimum_negative_controls=[];
 tampered.baselines_preserved=['FROZEN_SURFACE_ONLY'];
 assert.ok(problems(tampered).includes('minimum controls'));
 assert.ok(problems(tampered).includes('nongeometric alternative missing'));
 assert.match(doc,/no-rescue/i);
 assert.match(doc,/structure-mapping/i);
});

test('RGR-05 feasibility and RGR-05B Flow infeasibility are not conflated',()=>{
 assert.match(doc,/RGR-05.*FEASIBILITY_PASS/i);
 assert.match(doc,/RGR-05B.*infeasibility/i);
 assert.match(doc,/One result does not rescue or contradict the other/i);
});

test('Programme document explicitly preserves model/human meaning and governed next gate',()=>{
 assert.match(doc,/do not prove relational consciousness/i);
 assert.match(doc,/only a new work unit with explicit grants/i);
 assert.match(doc,/independent/i);
 assert.match(doc,/Kelly's World/i);
 assert.match(doc,/not connected/i);
});

test('This intake is JSON/markdown planning only; no model downloads or provider calls',()=>{
 assert.ok(manifest.candidate_methods.every(x=>x.source_revision===null));
 assert.ok(manifest.candidate_methods.every(x=>x.execution==='NOT_AUTHORIZED'));
 assert.deepEqual(problems(manifest),[]);
});
