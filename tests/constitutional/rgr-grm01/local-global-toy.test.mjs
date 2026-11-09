import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  VARIABLES, CASES, analyze, localSolutions, pairwiseCompatible,
  globalSolutions, renameVariables,
} from '../../../scripts/research/rgr-grm01/local-global-toy.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const git = (...args) => execFileSync('git', args, {cwd:ROOT});
const base = '2e836abc32853bf01bf8256062b561c2b7406378';
const hash = (b) => createHash('sha256').update(b).digest('hex');
const unitPath = 'docs/programme/RGR-GRM-01_WORK_UNIT_2026-10-16.json';
const unit = JSON.parse(readFileSync(path.join(ROOT,unitPath),'utf8'));

test('the four exact hand-authored worlds have their declared outcomes', () => {
  assert.equal(CASES.length, 4);
  assert.deepEqual(VARIABLES, ['a','b','c']);
  for (const item of CASES) {
    const result = analyze(item.constraints);
    assert.deepEqual(
      { local:result.local,pairwise:result.pairwise,global_count:result.global_count},
      item.expected, item.id);
  }
});

test('the frustrated cycle defeats a weak pairwise projection comparator', () => {
  const c=CASES.find((w)=>w.id==='frustrated_cycle').constraints;
  for(const relation of c) assert.ok(localSolutions(relation).length>0);
  assert.equal(pairwiseCompatible(c),true);
  assert.equal(globalSolutions(c).length,0);
});

test('global witnesses are exact and plural where appropriate', () => {
  const coherent=globalSolutions(CASES[0].constraints);
  assert.deepEqual(coherent,[{a:0,b:0,c:0},{a:1,b:1,c:1}]);
  const under=globalSolutions(CASES[2].constraints);
  assert.equal(under.length,4);
  assert.ok(under.some(x=>x.c===0));
  assert.ok(under.some(x=>x.c===1));
});

test('obvious source disagreement is not the higher-order cycle finding', () => {
  assert.equal(pairwiseCompatible(CASES[3].constraints),false);
  assert.equal(globalSolutions(CASES[3].constraints).length,0);
});

test('coherent renaming preserves outcomes for all example worlds', () => {
  const permutations=[
    {a:'a',b:'b',c:'c'},
    {a:'b',b:'c',c:'a'},
    {a:'c',b:'a',c:'b'},
    {a:'b',b:'a',c:'c'},
  ];
  for(const w of CASES) for(const mapping of permutations){
    const relabeled=renameVariables(w.constraints,mapping);
    const a=analyze(w.constraints),b=analyze(relabeled);
    assert.equal(b.global_count,a.global_count,w.id);
    assert.equal(b.pairwise,a.pairwise,w.id);
  }
});

test('relation-breaking while retaining the same variable surface is detectable', () => {
  const baseline=CASES[0].constraints;
  const broken=[baseline[0],baseline[1],{op:'neq',x:'a',y:'c'}];
  assert.equal(analyze(baseline).global_count,2);
  assert.equal(analyze(broken).global_count,0);
  assert.equal(analyze(baseline).pairwise,true);
  assert.equal(analyze(broken).pairwise,true);
});

test('constraint order and equality endpoint order do not affect decisions', () => {
  for (const w of CASES) {
    const rev=w.constraints.slice().reverse();
    assert.equal(analyze(rev).global_count,analyze(w.constraints).global_count);
    const swap=rev.map(c=>c.op==='fixed'?c:{...c,x:c.y,y:c.x});
    assert.equal(analyze(swap).global_count,analyze(w.constraints).global_count);
  }
});

test('invalid operations, invented variables and invalid mappings refuse', () => {
  assert.throws(()=>analyze([{op:'causes',x:'a',y:'b'}]),/UNKNOWN_CONSTRAINT/);
  assert.throws(()=>analyze([{op:'eq',x:'a',y:'z'}]),/INVALID_PAIR_CONSTRAINT/);
  assert.throws(()=>analyze([{op:'fixed',x:'a',value:2}]),/INVALID_FIXED_CONSTRAINT/);
  assert.throws(()=>renameVariables(CASES[0].constraints,{a:'a',b:'a',c:'c'}),/INVALID_VARIABLE_PERMUTATION/);
  assert.throws(()=>globalSolutions(CASES[0].constraints,['a','a','c']),/INVALID_VARIABLE_UNIVERSE/);
});

test('protected canonical RGR-00 through 06 sources stay byte-identical',()=>{
  assert.equal(unit.lineage.scope_base,base);
  for(const p of unit.protected_paths){
    assert.equal(hash(readFileSync(path.join(ROOT,p))),hash(git('show',base+':'+p)),p);
  }
  assert.ok(unit.protected_paths.includes('docs/programme/RGR-06_CONFIRMATORY_IMPLEMENTATION_LOCK_2026-09-19.md'));
  assert.equal(unit.lineage.canonical_rgr07_status,'NOT_OPENED');
});

test('candidate scope inspects committed and untracked paths against its declared base',()=>{
  const paths=new Set([
    ...git('diff','--name-only','-z',base,'--').toString().split('\0'),
    ...git('diff','--cached','--name-only','-z',base,'--').toString().split('\0'),
    ...git('ls-files','--others','--exclude-standard','-z').toString().split('\0'),
  ].filter(Boolean));
  for (const p of paths) assert.ok(unit.artifact_paths.includes(p),'out-of-scope: '+p);
  assert.ok(paths.has('scripts/research/rgr-grm01/local-global-toy.mjs'));
  assert.ok(paths.has(unitPath));
});

test('source-document hashes bind the reviewed prose once set',()=>{
  for(const [p,h] of Object.entries(unit.document_sha256)){
    assert.match(h,/^[0-9a-f]{64}$/);
    assert.equal(hash(readFileSync(path.join(ROOT,p))),h,p);
  }
  assert.equal(Object.keys(unit.document_sha256).length,3);
});

test('the candidate explicitly has no empirical or operational authority',()=>{
  assert.equal(unit.id,'RGR-GRM-01');
  assert.equal(unit.standing,'RESEARCH_DESIGN_CANDIDATE_NOT_FOUNDER_ADJUDICATED');
  assert.equal(unit.no_duplicate_work_unit,true);
  assert.equal(unit.authorized_for_this_packet.finite_hand_authored_synthetic_reference_test,true);
  for(const [k,v] of Object.entries(unit.authorized_for_this_packet)){
    if(!['documentation','isolated_worktree_only','finite_hand_authored_synthetic_reference_test'].includes(k)) assert.equal(v,false,k);
  }
  for(const v of Object.values(unit.labels)) assert.equal(v,false);
  for(const lane of Object.values(unit.sublanes)) assert.equal(lane.preregistered,false);
});

test('canonical scientific boundaries are stated rather than silently modified',()=>{
  const a=readFileSync(path.join(ROOT,unit.artifact_paths[0]),'utf8');
  const b=readFileSync(path.join(ROOT,unit.artifact_paths[1]),'utf8');
  const c=readFileSync(path.join(ROOT,unit.artifact_paths[2]),'utf8');
  assert.match(a,/already uses RGR-06/);
  assert.match(a,/first-class \*derived\*/);
  assert.match(b,/CSP/);
  assert.match(b,/symbolic CSP\/SAT baselines/);
  assert.match(b,/NOT PREREGISTERED/);
  assert.match(c,/FAILED_UNDER_FROZEN_BUDGET/);
  assert.match(c,/Sophontic/);
  assert.match(c,/RGR-EVAL-CAUSAL-01/);
});
