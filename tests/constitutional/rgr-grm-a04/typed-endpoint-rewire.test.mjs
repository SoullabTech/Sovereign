import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {dirname,resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {
  VERTICES,TYPES,G_POS,G_NEG,bareEdges,typedEdges,typedDegrees,
  typeHistogram,clauseTokenBag,twoHopTypeBag,derivedTwoHopTypeBag,
  reciprocalPairs,stronglyConnected,anchoredTwoHopEnds,
  typedThreeHopCount,flipPHeads,renameWorld,
} from '../../../scripts/research/rgr-grma04/typed-endpoint-rewire-toy.mjs';
import {
  G_POS as A03_POS,G_NEG as A03_NEG,
  untypedEdges as a03Bare,threeHopCount as a03Count,
} from '../../../scripts/research/rgr-grma03/latin-three-template-toy.mjs';
import {
  G_POS as A02_POS,G_NEG as A02_NEG,
  typedThreeHopCount as a02Count,
} from '../../../scripts/research/rgr-grma02/typed-composition-toy.mjs';

const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),'../../..');
const BASE='547aa43042a3189b198fa132c15c75eb95542967';
const unitPath='docs/programme/RGR-GRM-A04_WORK_UNIT_2026-10-16.json';
const unit=JSON.parse(readFileSync(join(ROOT,unitPath),'utf8'));
const sha=(b)=>createHash('sha256').update(b).digest('hex');
const git=(...args)=>execFileSync('git',args,{cwd:ROOT}).toString();
const typedTypeByEdge=(edges)=>new Map(edges.map(x=>[x.from+'->'+x.to,x.type]));

function* permutations(a,i=0){
  if(i>=a.length){yield [...a];return;}
  for(let j=i;j<a.length;j++){
    [a[i],a[j]]=[a[j],a[i]];
    yield* permutations(a,i+1);
    [a[i],a[j]]=[a[j],a[i]];
  }
}

test('two worlds each have exactly eight named vertices and 14 distinct directed typed arcs',()=>{
  assert.deepEqual(VERTICES,['s','a','b','c','u','v','w','t']);
  assert.equal(TYPES.length,10);
  for(const graph of [G_POS,G_NEG]){
    assert.equal(graph.length,14);
    assert.equal(new Set(bareEdges(graph)).size,14);
    assert.ok(graph.every(e=>e.from!==e.to));
  }
});
test('exactly twelve retained typed arcs are identical, four symmetric-difference P arcs are rewired',()=>{
  const p=new Set(typedEdges(G_POS)), n=new Set(typedEdges(G_NEG));
  const shared=[...p].filter(x=>n.has(x));
  const plusOnly=[...p].filter(x=>!n.has(x)).sort();
  const minusOnly=[...n].filter(x=>!p.has(x)).sort();
  assert.equal(shared.length,12);
  assert.deepEqual(plusOnly,['a->u|P','b->v|P']);
  assert.deepEqual(minusOnly,['a->v|P','b->u|P']);
  for(const x of shared)assert.equal(x.split('|').length,2);
});
test('the named untyped adjacency CHANGES, unlike A02 and A03 label-only switches',()=>{
  assert.notDeepEqual(bareEdges(G_POS),bareEdges(G_NEG));
  assert.deepEqual(a03Bare(A03_POS),a03Bare(A03_NEG));
});
test('the two bare graph shapes are isomorphic by swapping u and v, but their typed graphs are not equal under that map',()=>{
  const mapping=Object.fromEntries(VERTICES.map(x=>[x,(x==='u'?'v':x==='v'?'u':x)]));
  const image=renameWorld(G_POS,mapping);
  assert.deepEqual(bareEdges(image),bareEdges(G_NEG));
  assert.notDeepEqual(typedEdges(image),typedEdges(G_NEG));
});
test('each named vertex has precisely the same per-type in- and out-degrees after the switch',()=>{
  assert.deepEqual(typedDegrees(G_POS),typedDegrees(G_NEG));
});
test('global label totals and canonical token unigrams match, without claiming prose equivalence',()=>{
  assert.deepEqual(typeHistogram(G_POS),typeHistogram(G_NEG));
  assert.deepEqual(clauseTokenBag(G_POS),clauseTokenBag(G_NEG));
});
test('unanchored two-hop label histograms match as a COROLLARY of typed node degrees',()=>{
  assert.deepEqual(derivedTwoHopTypeBag(G_POS),twoHopTypeBag(G_POS));
  assert.deepEqual(derivedTwoHopTypeBag(G_NEG),twoHopTypeBag(G_NEG));
  assert.deepEqual(twoHopTypeBag(G_POS),twoHopTypeBag(G_NEG));
});
test('source-anchored OPEN,P two-hop endpoints differ (u vs v)',()=>{
  assert.deepEqual(anchoredTwoHopEnds(G_POS),['u']);
  assert.deepEqual(anchoredTwoHopEnds(G_NEG),['v']);
});
test('fixed source-target OPEN,P,ACK three-hop predicate changes from one to zero',()=>{
  assert.equal(typedThreeHopCount(G_POS),1);
  assert.equal(typedThreeHopCount(G_NEG),0);
  assert.equal(typedThreeHopCount(G_POS,{labels:['CLOSED','P','ACK']}),0);
  assert.equal(typedThreeHopCount(G_NEG,{labels:['CLOSED','P','ACK']}),1);
});
test('both graphs are strongly connected with no reciprocal arcs',()=>{
  assert.equal(stronglyConnected(G_POS),true);
  assert.equal(stronglyConnected(G_NEG),true);
  assert.equal(reciprocalPairs(G_POS),0);
  assert.equal(reciprocalPairs(G_NEG),0);
});
test('the exact 2-switch is an involution; no retained edge changes its type',()=>{
  const sort=(a)=>a.map(e=>e.from+'->'+e.to+'|'+e.type).sort();
  assert.deepEqual(sort(flipPHeads(G_POS)),sort(G_NEG));
  assert.deepEqual(sort(flipPHeads(G_NEG)),sort(G_POS));
});
test('an isolated one-edge destination change breaks the required typed-degree controls',()=>{
  const single=G_POS.map(x=>(x.from==='a'&&x.to==='u')?{...x,to:'v'}:{...x});
  assert.notDeepEqual(typedDegrees(single),typedDegrees(G_POS));
  assert.notDeepEqual(bareEdges(single),bareEdges(G_POS));
});
test('all 40,320 coherent renamings preserve A04 paired truth and per-node typed equality',()=>{
  let checked=0;
  for(const order of permutations([...VERTICES])){
    const map=Object.fromEntries(VERTICES.map((v,i)=>[v,order[i]]));
    const p=renameWorld(G_POS,map), n=renameWorld(G_NEG,map);
    assert.equal(typedThreeHopCount(p,{start:map.s,target:map.t}),1);
    assert.equal(typedThreeHopCount(n,{start:map.s,target:map.t}),0);
    assert.deepEqual(typedDegrees(p),typedDegrees(n));
    checked++;
  }
  assert.equal(checked,40320);
});
test('edge order has no effect on any matched statistic or exact three-hop truth',()=>{
  for(const [graph,answer] of [[G_POS,1],[G_NEG,0]]){
    const rev=[...graph].reverse();
    assert.deepEqual(typedDegrees(rev),typedDegrees(graph));
    assert.deepEqual(twoHopTypeBag(rev),twoHopTypeBag(graph));
    assert.equal(typedThreeHopCount(rev),answer);
  }
});
test('invalid shape, type, labels, source and incoherent renaming refuse',()=>{
  assert.throws(()=>typedThreeHopCount([{from:'s',to:'a',type:'OPEN'}]),/INVALID_FIXED_SHAPE/);
  assert.throws(()=>typedThreeHopCount(G_POS,{start:'UNKNOWN'}),/INVALID_THREE_HOP_QUERY/);
  assert.throws(()=>typedThreeHopCount(G_POS,{labels:['OPEN','P','UNKNOWN']}),/INVALID_THREE_HOP_QUERY/);
  assert.throws(()=>bareEdges([...G_POS.slice(0,13),G_POS[0]]),/DUPLICATE_ARC/);
  assert.throws(()=>flipPHeads(G_POS.map(x=>x.from==='a'&&x.to==='u'?{...x,type:'Q'}:x)),/INVALID_SWITCH_TYPE/);
  assert.throws(()=>renameWorld(G_POS,{s:'s',a:'s',b:'b',c:'c',u:'u',v:'v',w:'w',t:'t'}),/INVALID_RENAMING/);
});
test('A02/A03 label permutations and A04 edge-switch share a target but do NOT share their intervention',()=>{
  assert.equal(a02Count(A02_POS),1);
  assert.equal(a02Count(A02_NEG),0);
  assert.equal(a03Count(A03_POS),1);
  assert.equal(a03Count(A03_NEG),0);
  assert.equal(typedThreeHopCount(G_POS),1);
  assert.equal(typedThreeHopCount(G_NEG),0);
  assert.deepEqual(a03Bare(A03_POS),a03Bare(A03_NEG));
  assert.notDeepEqual(bareEdges(G_POS),bareEdges(G_NEG));
});
test('fixed mathematical module has no generator, network, file I/O or model hooks',()=>{
  const s=readFileSync(join(ROOT,'scripts/research/rgr-grma04/typed-endpoint-rewire-toy.mjs'),'utf8');
  for(const token of ['process.env','process.argv','Math.random','readFileSync','writeFileSync','fetch(','http:','https:','child_process','import ','openai','axios']){
    assert.equal(s.includes(token),false,'forbidden token '+token);
  }
});
test('all 35 inherited parent/canonical files stay byte-identical to exact A03 commit',()=>{
  assert.equal(unit.source_parent_sha,BASE);
  assert.equal(unit.protected_parent_sources.length,35);
  for(const p of unit.protected_parent_sources){
    const now=sha(readFileSync(join(ROOT,p)));
    const then=sha(execFileSync('git',['show',BASE+':'+p],{cwd:ROOT}));
    assert.equal(now,then,'protected path '+p);
  }
  assert.equal(unit.canonical_RGR07_opened,false);
});
test('candidate changes are limited to its six declared paths, even when files are untracked',()=>{
  const paths=new Set([
    ...git('diff','--name-only','-z',BASE,'--').split('\0'),
    ...git('diff','--cached','--name-only','-z',BASE,'--').split('\0'),
    ...git('ls-files','--others','--exclude-standard','-z').split('\0'),
  ].filter(Boolean));
  assert.equal(unit.allowed_changed_paths.length,6);
  for(const p of paths)assert.ok(unit.allowed_changed_paths.includes(p),'OUT_OF_SCOPE: '+p);
  assert.ok(paths.has('tests/constitutional/rgr-grm-a04/typed-endpoint-rewire.test.mjs'));
});
test('the authored prose is SHA-bound and explicitly admits no unique-geometry or third-family claim',()=>{
  const docs=Object.entries(unit.source_doc_sha256);
  assert.equal(docs.length,2);
  for(const [p,h] of docs){
    assert.match(h,/^[0-9a-f]{64}$/);
    assert.equal(sha(readFileSync(join(ROOT,p))),h,'doc hash '+p);
  }
  const design=readFileSync(join(ROOT,unit.allowed_changed_paths[0]),'utf8');
  const review=readFileSync(join(ROOT,unit.allowed_changed_paths[1]),'utf8');
  assert.match(design,/A01 already used an untyped edge-target two-switch/);
  assert.match(design,/isomorphic/);
  assert.match(design,/not.*named adjacency/i);
  assert.match(design,/not.*automatically.*A05|not A05 by automatic repetition/i);
  assert.match(review,/A01 also used a two-edge destination swap/);
  assert.match(review,/RETURN_FOR_SCIENTIFIC_REVIEW/);
  assert.match(review,/NOT.*independent human review/);
});
test('standing is strictly documentation/fixed math: no experiment, runtime, member or governance authority',()=>{
  assert.equal(unit.id,'RGR-GRM-A04');
  assert.equal(unit.noncanonical_identifier,true);
  assert.equal(unit.sample_counts.fixed_mathematical_worlds,2);
  assert.equal(unit.sample_counts.generated_experimental_examples,0);
  assert.equal(unit.research_scope.new_independent_human_meaning_task,false);
  assert.equal(unit.research_scope.untyped_named_adjacency_same,false);
  assert.equal(unit.research_scope.untyped_bare_graph_isomorphic_under_u_v_swap,true);
  assert.equal(unit.research_scope.not_historically_unique_because_A01_also_rewired,true);
  const allowed=new Set(['source_documentation','pure_fixed_mathematical_fixture_tests','read_project_and_public_sources']);
  for(const [name,value] of Object.entries(unit.authority))assert.equal(value,allowed.has(name),'authority '+name);
  for(const [name,value] of Object.entries(unit.epistemic_standing))
    if(name!=='fixed_two_world_graph_math_verified')assert.equal(value,false,'claim '+name);
});
