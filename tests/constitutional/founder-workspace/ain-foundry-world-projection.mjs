import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {readFoundryCatalogue} from '../../../scripts/builder/capability-foundry/catalogue-reader.mjs';
import {projectFoundryWorld,verifyFounderAcceptance,FOUNDRY_ACCEPTANCE_SHA256} from '../../../scripts/builder/capability-foundry/world-projection.mjs';
import {createHash} from 'node:crypto';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..');
const source=readFoundryCatalogue({root});
const founderText=readFileSync('/Users/soullab/JARVIS-handoffs/AIN-CAPABILITY-FOUNDRY-01_FOUNDER_DECISION_2026-10-12.json','utf8');

test('Foundry acceptance is an exact hashed documentary decision with no cryptographic founder signature',()=>{
 assert.equal(createHash('sha256').update(founderText,'utf8').digest('hex'),FOUNDRY_ACCEPTANCE_SHA256);
 assert.deepEqual(verifyFounderAcceptance(founderText),{
  valid:true,
  standing:'ACCEPTED_RESEARCH_ONLY',
  exact_commit:'45ac2a182a7687062704e28f0dc0e3d5e0c5ce4d',
  reason:'Founder accepted the fixed catalogue for research-only inventory. This is documentary evidence, not an authenticated signature or execution grant.',
  cryptographically_signed:false
 });
});

test('Foundry projection displays exactly one governed source in all five Kelly’s World rooms',()=>{
 const m=projectFoundryWorld({catalogue:source,founderDecisionText:founderText});
 assert.equal(m.status,'ACCEPTED_RESEARCH_ONLY');
 assert.equal(m.presentation_only,true);
 assert.equal(m.authority_effect,'none');
 assert.equal(m.installed_jarvis_integration,false);
 assert.equal(m.source_evidence,'OBSERVED');
 assert.deepEqual([m.today.room,m.work.room,m.graph.room,m.monitor.room,m.system.room],
 ['Today','Work','Graph','Monitor','System']);
 assert.equal(m.today.state,'Watching');
 assert.equal(m.today.needs_founder,false);
});

test('All 26 source candidates carry their real catalogue provenance, not installation or licensure claims',()=>{
 const m=projectFoundryWorld({catalogue:source,founderDecisionText:founderText});
 assert.equal(m.candidates.length,26);
 assert.deepEqual(m.counts.by_priority,{P0:12,P1:12,P2:2});
 assert.equal(m.counts.categories,11);
 assert.equal(m.counts.lanes,6);
 assert.equal(m.counts.public_docs_reviewed,23);
 assert.equal(m.counts.nominated_only,3);
 assert.equal(m.counts.licensed,0);
 assert.equal(m.counts.installed,0);
 for(const x of m.candidates) {
  assert.equal(x.stage,'Discover');
  assert.equal(x.action,'Research source only — no execution');
  assert.match(x.license,/pending/i);
  assert.equal(x.source_sha256,m.source_sha256);
  assert.ok(x.boundary);
  assert.ok(x.purpose);
 }
});

test('Graph uses only source-backed, catalogue-derived candidate-to-product possibilities',()=>{
 const m=projectFoundryWorld({catalogue:source,founderDecisionText:founderText});
 assert.equal(m.graph.nodes.length,59);
 assert.equal(m.graph.edges.length,123);
 const ids=new Set(m.graph.nodes.map(n=>n.id));
 assert.equal(ids.size,m.graph.nodes.length);
 for(const edge of m.graph.edges) {
  assert.ok(ids.has(edge.from),'source node must exist');
  assert.ok(ids.has(edge.to),'target node must exist');
  assert.ok(edge.evidence_ref,'no invented edge');
  assert.equal(edge.source_sha256,m.source_sha256);
  assert.match(edge.relation,/(catalogues|future use|external source)/);
 }
 assert.match(m.graph.meaning,/never proof/);
});

test('Monitor shows license, security and source versions as pending — never silently green',()=>{
 const m=projectFoundryWorld({catalogue:source,founderDecisionText:founderText});
 const labels=Object.fromEntries(m.monitor.rows.map(x=>[x.name,x.standing]));
 assert.equal(labels['Catalogue source custody'],'OBSERVED');
 assert.equal(labels['Founder catalogue acceptance'],'DOCUMENTED_RESEARCH_ONLY');
 assert.equal(labels['Source revision pins'],'PENDING');
 assert.equal(labels['Exact candidate licenses'],'PENDING');
 assert.equal(labels['Dependency and security clearance'],'PENDING');
 assert.equal(labels['Third-party execution'],'NOT_AUTHORIZED');
});

test('System keeps every major operational capability denied after founder research acceptance',()=>{
 const m=projectFoundryWorld({catalogue:source,founderDecisionText:founderText});
 assert.equal(m.execution_grants,'NONE');
 assert.equal(m.system.standing,'RESEARCH_ONLY_HELD');
 assert.equal(m.system.blocked.length,9);
 assert.ok(m.system.blocked.every(x=>x.standing==='NOT_AUTHORIZED'));
 assert.ok(m.system.blocked.some(x=>x.id==='maia'));
 assert.ok(m.system.blocked.some(x=>x.id==='member_data'));
 assert.ok(m.system.blocked.some(x=>x.id==='install'));
 assert.ok(m.system.blocked.some(x=>x.id==='work_unit'));
});

test('One missing or altered founder receipt cannot invent research acceptance',()=>{
 const changed=JSON.stringify({...JSON.parse(founderText),decision:'ACCEPTED_ALL_PERMISSIONS'})+'\n';
 const a=projectFoundryWorld({catalogue:source,founderDecisionText:changed});
 const b=projectFoundryWorld({catalogue:source,founderDecisionText:''});
 assert.equal(a.founder_acceptance.valid,false);
 assert.equal(a.status,'FOUNDER_DECISION_UNVERIFIED');
 assert.equal(b.status,'FOUNDER_DECISION_UNVERIFIED');
 assert.ok(b.system.blocked.every(x=>x.standing==='NOT_AUTHORIZED'));
});

test('Forged catalogue permissions fail closed, with no rows or Graph relationships displayed',()=>{
 const copied=structuredClone(source);
 copied.candidates[0].execution_grant='AUTHORIZED';
 const result=projectFoundryWorld({catalogue:copied,founderDecisionText:founderText});
 assert.equal(result.source_evidence,'UNVERIFIED');
 assert.equal(result.candidates.length,0);
 assert.equal(result.graph.edges.length,0);
 assert.equal(result.today.needs_founder,false);
 assert.equal(result.system.standing,'ALL_HELD');
});

test('Wrong source hash or made-up lane/priority fails closed',()=>{
 const wrong=structuredClone(source);
 wrong.source_sha256='f'.repeat(64);
 assert.equal(projectFoundryWorld({catalogue:wrong,founderDecisionText:founderText}).status,'UNVERIFIED');
 const lane=structuredClone(source);
 lane.candidates[0].product_lanes=['maia-execution-authority'];
 assert.equal(projectFoundryWorld({catalogue:lane,founderDecisionText:founderText}).counts.total,0);
 const priority=structuredClone(source);
 priority.candidates[0].priority='IMMEDIATE_INSTALL';
 assert.equal(projectFoundryWorld({catalogue:priority,founderDecisionText:founderText}).graph.nodes.length,0);
});

test('Pure projection has no network, shell, model calls or persistent state changes',()=>{
 const js=readFileSync(path.join(root,'scripts/builder/capability-foundry/world-projection.mjs'),'utf8');
 assert.doesNotMatch(js,/from ['"]node:child_process['"]/);
 assert.doesNotMatch(js,/(\bfetch\(|https?\.get\(|\bexecFileSync\(|\bspawn\(|\bwriteFileSync\(|\bmkdirSync\()/);
 assert.match(js,/not an authenticated signature/i);
});
