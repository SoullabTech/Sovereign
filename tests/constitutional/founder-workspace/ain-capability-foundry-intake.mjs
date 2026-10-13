import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..');
const registryPath=path.join(root,'docs/programme/AIN-CAPABILITY-FOUNDRY-01_CANDIDATE_REGISTRY_2026-10-12.json');
const programmePath=path.join(root,'docs/programme/AIN-CAPABILITY-FOUNDRY-01_GOVERNED_PROGRAMME_2026-10-12.md');
const raw=readFileSync(registryPath,'utf8');
const catalog=JSON.parse(raw);
const text=readFileSync(programmePath,'utf8');
const forbids=new Set(['NOT_AUTHORIZED']);
function validate(c) {
 const problems=[];
 const err=(s)=>problems.push(s);
 if(c.schema!=='ain.capability-foundry.candidate-registry.v1')err('schema');
 if(c.programme!=='AIN-CAPABILITY-FOUNDRY-01'||c.authority!=='RESEARCH_INTAKE_ONLY')err('programme/authority');
 if(c.custody_parent_commit!=='df6027a6ffc4c0a38576291e1bad546e8dd34c4c')err('base lineage');
 if(c.catalogue_not_exhaustive!==true||c.research_and_execution_separation!==true)err('scope');
 for(const k of ['model_experiment','member_data','maia_runtime','writer_public_release','production'])
   if(!forbids.has(c[k]))err('authority '+k);
 if(c.new_work_unit_grants!=='NONE'||c.reporting!=='JARVIS_AND_KELLYS_WORLD_READ_ONLY_PROPOSAL')err('no new canonical authority');
 if(!Array.isArray(c.requirements)||c.requirements.length<7)err('gate list');
 if(!Array.isArray(c.candidates)||c.candidates.length<20)err('candidate count');
 const ids=new Set();
 const allowed=new Set(['github.com','huggingface.co','arxiv.org','sophontic.ai','blog.pypi.org','www.promptfoo.dev']);
 for(const item of c.candidates||[]) {
  if(!/^FND-[A-Z]{3}-\d{2}$/.test(item.id)||ids.has(item.id))err('duplicate/invalid identity '+item.id);
  ids.add(item.id);
  if(!item.title||!item.candidate_use||!item.critical_guard)err('source applicability '+item.id);
  if(!['P0','P1','P2'].includes(item.priority))err('priority '+item.id);
  if(!['PUBLIC_DOC_REVIEWED','URL_NOMINATED'].includes(item.source_check))err('truthful external source standing '+item.id);
  try{const u=new URL(item.source_url);if(u.protocol!=='https:'||!allowed.has(u.hostname))err('source domain '+item.id);}
  catch{err('malformed url '+item.id);}
  if(!Array.isArray(item.product_lanes)||!item.product_lanes.length)err('no product reason '+item.id);
  for(const key of ['execution_grant','production_admission','model_download'])
   if(item[key]!=='NOT_AUTHORIZED')err('unsafe materialization '+item.id+':'+key);
  for(const key of ['license_status','dependency_security_review','data_rights_review','independent_review'])
   if(item[key]!=='EXACT_VERSION_PENDING'&&item[key]!=='PENDING')err('premature admission '+item.id+':'+key);
  if(item.source_commit_pin!==null||item.exact_license!==null||item.status!=='DISCOVERED_CANDIDATE')err('false pinned/approved '+item.id);
 }
 return problems;
}
test('Foundry intake has exact research-only schema, permissions and scope',()=>{
 assert.deepEqual(validate(catalog),[]);
});
test('Foundry has multiple research areas and truthful nominated-only references',()=>{
 assert.ok(new Set(catalog.candidates.map(x=>x.area)).size>=10);
 assert.ok(catalog.candidates.some(x=>x.source_check==='URL_NOMINATED'));
 assert.ok(catalog.candidates.some(x=>x.area==='mechanistic'));
 assert.ok(catalog.candidates.some(x=>x.area==='security'));
 assert.ok(catalog.candidates.some(x=>x.area==='skills'));
});
test('Attempt to turn candidate listing into a model download is refused',()=>{
 const f=structuredClone(catalog);
 f.candidates[0].model_download='AUTHORIZED';
 assert.ok(validate(f).some(x=>x.startsWith('unsafe materialization')));
});
test('Attempt to invent canonical execution authority in registry is refused',()=>{
 const f=structuredClone(catalog);
 f.new_work_unit_grants='ACTIVE';
 assert.ok(validate(f).some(x=>x.startsWith('no new canonical authority')));
});
test('Invented source domains and duplicate IDs are rejected',()=>{
 const f=structuredClone(catalog);
 f.candidates[1].source_url='https://unsafe.example/skill';
 f.candidates[1].id=f.candidates[0].id;
 assert.ok(validate(f).some(x=>x.startsWith('source domain')));
 assert.ok(validate(f).some(x=>x.startsWith('duplicate/invalid identity')));
});
test('License, security and independent reviews may never be silently presumed',()=>{
 const f=structuredClone(catalog);
 f.candidates[0].license_status='LICENSE_APPROVED';
 f.candidates[1].independent_review='PASS';
 assert.ok(validate(f).some(x=>x.startsWith('premature admission')));
});
test('Programme keeps the RGR falsification and existing MAIA sovereignty constraints',()=>{
 for(const phrase of ['RGR-04','RGR-05B','RGR-06','MAIA','Kelly','consent','source','independent','GraphRAG','privileged-local'])
  assert.ok(text.toLowerCase().includes(phrase.toLowerCase()),'missing constitutional continuity: '+phrase);
 assert.match(text,/not a signed founder adjudication/i);
 assert.match(text,/no authority to merge/i);
 assert.match(text,/not proof of lived meaning/i);
});
test('Discovery manifest is inert JSON; the test itself has no model execution',()=>{
 assert.ok(raw.trimStart().startsWith('{'));
 assert.doesNotMatch(raw,/"executable_code"\s*:/);
 assert.ok(catalog.candidates.every(c=>c.model_download==='NOT_AUTHORIZED'));
});

import {mkdtempSync, mkdirSync, writeFileSync, symlinkSync, rmSync} from 'node:fs';
import os from 'node:os';
import {readFoundryCatalogue, FOUNDRY_SOURCE, FOUNDRY_SOURCE_SHA256} from '../../../scripts/builder/capability-foundry/catalogue-reader.mjs';
import {createHash} from 'node:crypto';

function catalogueFixture(fn) {
 const tmp=mkdtempSync(path.join(os.tmpdir(),'ain-foundry-reader-'));
 const source=path.join(tmp,FOUNDRY_SOURCE);
 mkdirSync(path.dirname(source),{recursive:true});
 writeFileSync(source,raw);
 try{fn({tmp,source});}
 finally{rmSync(tmp,{recursive:true,force:true});}
}

test('Foundry inert read seam accepts exact source bytes and claims no execution',()=>{
 const r=readFoundryCatalogue({root});
 assert.equal(r.evidence_state,'OBSERVED',r.reason);
 assert.equal(r.programme,'AIN-CAPABILITY-FOUNDRY-01');
 assert.equal(r.runtime_grants,'NONE');
 assert.equal(r.new_work_unit_grants,'NONE');
 assert.equal(r.maia_runtime,'NOT_AUTHORIZED');
 assert.equal(r.source_sha256,FOUNDRY_SOURCE_SHA256);
 assert.equal(r.candidates.length,catalog.candidates.length);
 assert.ok(r.candidates.every(c=>c.execution_grant==='NOT_AUTHORIZED'));
 assert.equal(createHash('sha256').update(Buffer.from(raw)).digest('hex'),FOUNDRY_SOURCE_SHA256);
});

test('Foundry reader refuses missing source root',()=>{
 assert.equal(readFoundryCatalogue().evidence_state,'UNVERIFIED');
});

test('Foundry reader refuses modified source even if altered source claims new authority',()=>catalogueFixture(({tmp,source})=>{
 const actual=readFoundryCatalogue({root:tmp});
 assert.equal(actual.evidence_state,'OBSERVED');
 const bad=structuredClone(catalog);
 bad.candidates[0].execution_grant='AUTHORIZED';
 writeFileSync(source,JSON.stringify(bad,null,2)+'\n');
 const refused=readFoundryCatalogue({root:tmp});
 assert.equal(refused.evidence_state,'UNVERIFIED');
 assert.deepEqual(refused.candidates,[]);
}));

test('Foundry refuses symlinked JSON catalogue redirected beyond bound root',()=>catalogueFixture(({tmp,source})=>{
 const external=path.join(os.tmpdir(),'ain-foundry-fixture-external-'+path.basename(tmp)+'.json');
 try{
   writeFileSync(external,raw);
   rmSync(source);
   symlinkSync(external,source);
   assert.equal(readFoundryCatalogue({root:tmp}).evidence_state,'UNVERIFIED');
 } finally {rmSync(external,{force:true});}
}));

test('Foundry read seam does not download models, invoke providers or mutate source',()=>{
 const src=readFileSync(path.join(root,'scripts/builder/capability-foundry/catalogue-reader.mjs'),'utf8');
 assert.doesNotMatch(src,/\b(execFileSync|spawnSync|spawn|writeFileSync|fetch)\s*\(/);
 assert.doesNotMatch(src,/child_process/);
 assert.match(src,/O_NOFOLLOW/);
});
