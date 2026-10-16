import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..');
const BASE='b8e1b34df46784667b54bb68ebda491a66f86ec8';
const P='docs/programme/RGR-GRM-A01_WORK_UNIT_2026-10-16.json';
const manifest=JSON.parse(readFileSync(path.join(ROOT,P),'utf8'));
const git=(...args)=>execFileSync('git',args,{cwd:ROOT}).toString();
const hash=(x)=>createHash('sha256').update(x).digest('hex');
const ACTORS=['a','b','c','d'];

// Hand-authored mathematical witness ONLY; not a dataset, generator, benchmark, or model inference.
const PLUS=[['a','b'],['b','c'],['c','d'],['d','a']];
const MINUS=[['a','b'],['b','a'],['c','d'],['d','c']];

function degrees(arcs) {
  const inDegree=Object.fromEntries(ACTORS.map(a=>[a,0]));
  const outDegree=Object.fromEntries(ACTORS.map(a=>[a,0]));
  for(const [s,d] of arcs){
    assert.ok(ACTORS.includes(s)&&ACTORS.includes(d)&&s!==d);
    ++outDegree[s]; ++inDegree[d];
  }
  return {inDegree,outDegree};
}
function cycleLengths(arcs) {
  assert.equal(arcs.length,ACTORS.length);
  const next=Object.fromEntries(arcs);
  assert.equal(Object.keys(next).length,ACTORS.length);
  const seen=new Set(),lengths=[];
  for(const root of ACTORS) {
    if(seen.has(root)) continue;
    let a=root,count=0;
    while(!seen.has(a)) {seen.add(a);a=next[a];++count;assert.ok(count<=ACTORS.length);}
    assert.equal(a,root,'component must be a directed cycle');
    lengths.push(count);
  }
  return lengths.sort((x,y)=>x-y);
}
function twoSwitch(arcs){
  const removed=arcs.filter(([s,d])=>
    !(s==='b'&&d==='c') && !(s==='d'&&d==='a'));
  assert.equal(removed.length,arcs.length-2);
  return [...removed,['b','a'],['d','c']];
}
function directedSet(arcs){
  return arcs.map(([s,d])=>s+'->'+d).sort();
}
function lexicalBag(arcs){
  return arcs.flatMap(([s,d])=>[s,'relates','to',d]).sort();
}
function rename(arcs,mapping) {return arcs.map(([s,d])=>[mapping[s],mapping[d]]);}
const rotations=[
  {a:'a',b:'b',c:'c',d:'d'},
  {a:'b',b:'c',c:'d',d:'a'},
  {a:'d',b:'a',c:'b',d:'c'},
  {a:'c',b:'d',c:'a',d:'b'},
];

test('hand-authored witnesses each contain four unique valid directed edges',()=>{
  for(const arcs of [PLUS,MINUS]){
    assert.equal(arcs.length,4);
    assert.equal(new Set(directedSet(arcs)).size,4);
    assert.deepEqual(Object.keys(degrees(arcs).inDegree).sort(),ACTORS);
  }
});
test('positive graph is one directed four-cycle, not two reciprocal pairs',()=>{
  assert.deepEqual(cycleLengths(PLUS),[4]);
});
test('negative graph is two directed two-cycles, not one four-cycle',()=>{
  assert.deepEqual(cycleLengths(MINUS),[2,2]);
});
test('the exact two-edge head swap changes the graph label',()=>{
  assert.deepEqual(directedSet(twoSwitch(PLUS)),directedSet(MINUS));
  assert.notDeepEqual(cycleLengths(PLUS),cycleLengths(twoSwitch(PLUS)));
});
test('counterfactual preserves node count, edge count and each actor in/out degree',()=>{
  assert.deepEqual(degrees(PLUS),degrees(MINUS));
  assert.deepEqual(degrees(PLUS).inDegree,{a:1,b:1,c:1,d:1});
  assert.deepEqual(degrees(PLUS).outDegree,{a:1,b:1,c:1,d:1});
});
test('canonical one-clause-per-edge actor/verb bag of words is the same',()=>{
  assert.deepEqual(lexicalBag(PLUS),lexicalBag(MINUS));
  // This limited bag-equality does not imply full-length parity in a future renderer.
});
test('coherent permutations of actor identities preserve cycle class',()=>{
  for(const m of rotations){
    assert.deepEqual(cycleLengths(rename(PLUS,m)),[4]);
    assert.deepEqual(cycleLengths(rename(MINUS,m)),[2,2]);
  }
});
test('edge-clause order does not affect the mathematical label',()=>{
  assert.deepEqual(cycleLengths(PLUS.slice().reverse()),[4]);
  assert.deepEqual(cycleLengths(MINUS.slice().reverse()),[2,2]);
});
test('naive graph summaries remain insufficient; stronger summaries are not suppressed',()=>{
  assert.equal(new Set(Object.values(degrees(PLUS).inDegree)).size,1);
  assert.equal(new Set(Object.values(degrees(MINUS).inDegree)).size,1);
  const mutual=(arcs)=>arcs.filter(([s,d])=>arcs.some(([u,v])=>u===d&&v===s)).length/2;
  assert.equal(mutual(PLUS),0);
  assert.equal(mutual(MINUS),2);
});
test('fixed review candidate does not expose an inferred human-meaning label',()=>{
  assert.equal(manifest.hypothesis.domain,'synthetic directed-role structures rendered as prose');
  assert.equal(manifest.hypothesis.metrics_observed,false);
  assert.equal(manifest.hypothesis.samples_generated,0);
  assert.equal(manifest.hypothesis.language_renderer_implemented,false);
});
test('source constitution, old GRM-01 candidate and RGR-06 remain byte-identical',()=>{
  assert.equal(manifest.source_parent_commit,BASE);
  for(const p of manifest.source_protections){
    assert.equal(hash(readFileSync(path.join(ROOT,p))),hash(execFileSync('git',['show',BASE+':'+p],{cwd:ROOT})),p);
  }
});
test('scope covers both committed/staged and untracked differences',()=>{
  const paths=new Set([
    ...git('diff','--name-only','-z',BASE,'--').split('\0'),
    ...git('diff','--cached','--name-only','-z',BASE,'--').split('\0'),
    ...git('ls-files','--others','--exclude-standard','-z').split('\0'),
  ].filter(Boolean));
  for(const p of paths) assert.ok(manifest.allowed_changed_paths.includes(p),'out-of-scope '+p);
  assert.ok(paths.has(P));
  assert.ok(paths.has('tests/constitutional/rgr-grm-a01/design-guard.test.mjs'));
});
test('document digests protect the two source-review and method-design documents',()=>{
  const entries=Object.entries(manifest.document_sha256);
  assert.equal(entries.length,2);
  for(const [p,h] of entries){
    assert.match(h,/^[0-9a-f]{64}$/);
    assert.equal(hash(readFileSync(path.join(ROOT,p))),h,p);
  }
});
test('no data, model, provider, operational or canon authority is admitted',()=>{
  const {authority}=manifest;
  assert.equal(manifest.status,'DESIGN_CANDIDATE_RETURN_FOR_SPECIFICATION');
  const allowed=['document_preparation','pure_hand_authored_mathematical_fixture_tests','research_literature_read'];
  for(const [k,v] of Object.entries(authority)){
    assert.equal(v,allowed.includes(k),'authority: '+k);
  }
  assert.equal(manifest.outcome_standing.subspace_retrieval_advantage_established,false);
  assert.equal(manifest.outcome_standing.independent_human_review_completed,false);
  assert.equal(manifest.information_access.privileged_oracle_excluded_from_fair_contrast,true);
});
test('the design explicitly retains serious baselines, information parity, and no-rescue',()=>{
  const a=readFileSync(path.join(ROOT,manifest.allowed_changed_paths[0]),'utf8');
  const b=readFileSync(path.join(ROOT,manifest.allowed_changed_paths[1]),'utf8');
  assert.match(a,/same number of renderings is provided to \*every\* serious competing model/);
  assert.match(a,/F_TEXT2GRAPH/);
  assert.match(a,/F_MULTI/);
  assert.match(a,/F_ORACLE/);
  assert.match(a,/BENCHMARK_INVALID/);
  assert.match(a,/no equivalence claim/i);
  assert.match(a,/not previously unseen graph-isomorphism class/i);
  assert.match(b,/RGR-01.*§14/);
  assert.match(b,/RGR-06/);
  assert.match(b,/RETURN_FOR_SPECIFICATION/);
});
