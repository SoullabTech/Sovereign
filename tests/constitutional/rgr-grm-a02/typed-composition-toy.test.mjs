import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  VERTICES, TYPES, G_POS, G_NEG,
  bareAdjacency, vertexDegrees, typedDegrees, typeHistogram, clauseUnigramBag,
  globalTwoHopTypeBag, reciprocalPairs, stronglyConnected,
  typedThreeHopCount, checkerboardFlip, renameWorld,
} from '../../../scripts/research/rgr-grma02/typed-composition-toy.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const BASE = '1cc463da4d660a6bbf351df5847c4108d8166d4e';
const manifestPath = 'docs/programme/RGR-GRM-A02_WORK_UNIT_2026-10-16.json';
const manifest = JSON.parse(readFileSync(path.join(ROOT,manifestPath),'utf8'));
const git = (...args) => execFileSync('git',args,{cwd:ROOT}).toString();
const sha = (content) => createHash('sha256').update(content).digest('hex');
const typeBag=(edges)=>new Map(globalTwoHopTypeBag(edges));

function* permutations(arr, i=0) {
  if(i>=arr.length){ yield [...arr]; return; }
  for(let j=i;j<arr.length;j++){
    [arr[i],arr[j]]=[arr[j],arr[i]];
    yield* permutations(arr,i+1);
    [arr[i],arr[j]]=[arr[j],arr[i]];
  }
}

test('exact hand-authored worlds each have six vertices, nine valid unique arcs', () => {
  assert.deepEqual(VERTICES,['s','a','b','c','d','t']);
  assert.equal(TYPES.length,7);
  for (const g of [G_POS,G_NEG]) {
    assert.equal(g.length,9);
    assert.equal(new Set(bareAdjacency(g)).size,9);
    assert.ok(g.every(x=>VERTICES.includes(x.from)&&VERTICES.includes(x.to)&&x.from!==x.to));
  }
});
test('the entire untyped directed graph, not just its degree histogram, is the same', () => {
  assert.deepEqual(bareAdjacency(G_POS),bareAdjacency(G_NEG));
  assert.deepEqual(vertexDegrees(G_POS),vertexDegrees(G_NEG));
});
test('all named per-vertex edge-type in/out degree counts are exactly matched', () => {
  assert.deepEqual(typedDegrees(G_POS),typedDegrees(G_NEG));
});
test('global label counts and canonical arc-token unigrams are identical', () => {
  assert.deepEqual(typeHistogram(G_POS),typeHistogram(G_NEG));
  assert.deepEqual(clauseUnigramBag(G_POS),clauseUnigramBag(G_NEG));
});
test('global unanchored adjacent two-hop edge-type bigram bags are exactly equal', () => {
  assert.deepEqual(globalTwoHopTypeBag(G_POS),globalTwoHopTypeBag(G_NEG));
  const bag=typeBag(G_POS);
  assert.equal(bag.get('OPEN|P'),1);
  assert.equal(bag.get('P|ACK'),1);
  assert.equal(new Map(globalTwoHopTypeBag(G_NEG)).get('OPEN|P'),1);
  assert.equal(new Map(globalTwoHopTypeBag(G_NEG)).get('P|ACK'),1);
});
test('the unanchored two-hop bag follows algebraically from typed vertex degrees', () => {
  const derived=(g)=>{
    const d=new Map(typedDegrees(g)),bag=new Map();
    for(const v of VERTICES)for(const a of TYPES)for(const b of TYPES){
      const count=d.get(v+'|in|'+a)*d.get(v+'|out|'+b);
      if(count)bag.set(a+'|'+b,(bag.get(a+'|'+b)||0)+count);
    }
    return [...bag.entries()].sort(([a],[b])=>a.localeCompare(b));
  };
  assert.deepEqual(derived(G_POS),globalTwoHopTypeBag(G_POS));
  assert.deepEqual(derived(G_NEG),globalTwoHopTypeBag(G_NEG));
});
test('anchored two-hop endpoints differ despite the equal aggregate type-bigram bag', () => {
  const destinations=(g)=>g.filter(x=>x.from==='s'&&x.type==='OPEN')
    .flatMap(e=>g.filter(x=>x.from===e.to&&x.type==='P').map(x=>x.to)).sort();
  assert.deepEqual(destinations(G_POS),['c']);
  assert.deepEqual(destinations(G_NEG),['d']);
});
test('both untyped graphs remain strongly connected and have no reciprocal pairs', () => {
  assert.equal(stronglyConnected(G_POS),true);
  assert.equal(stronglyConnected(G_NEG),true);
  assert.equal(reciprocalPairs(G_POS),0);
  assert.equal(reciprocalPairs(G_NEG),0);
});
test('a source-anchored OPEN,P,ACK triple exists only in the positive world', () => {
  assert.equal(typedThreeHopCount(G_POS),1);
  assert.equal(typedThreeHopCount(G_NEG),0);
  assert.equal(typedThreeHopCount(G_POS,{types:['CLOSED','P','ACK']}),0);
  assert.equal(typedThreeHopCount(G_NEG,{types:['CLOSED','P','ACK']}),1);
});
test('the full four-edge checkerboard switch and its reverse are exact', () => {
  assert.deepEqual(
    checkerboardFlip(G_POS).sort((a,b)=>(a.from+a.to).localeCompare(b.from+b.to)),
    G_NEG.slice().sort((a,b)=>(a.from+a.to).localeCompare(b.from+b.to)));
  assert.deepEqual(
    checkerboardFlip(G_NEG).sort((a,b)=>(a.from+a.to).localeCompare(b.from+b.to)),
    G_POS.slice().sort((a,b)=>(a.from+a.to).localeCompare(b.from+b.to)));
});
test('incomplete one-edge switch is NOT a legitimate matched-type control', () => {
  const bad=G_POS.map(x=>(x.from==='a'&&x.to==='c')?{...x,type:'Q'}:x);
  assert.notDeepEqual(typedDegrees(bad),typedDegrees(G_POS));
  assert.notDeepEqual(typeHistogram(bad),typeHistogram(G_POS));
});
test('the route query is not a function solely of the checked local histograms', () => {
  assert.deepEqual(typedDegrees(G_POS),typedDegrees(G_NEG));
  assert.deepEqual(globalTwoHopTypeBag(G_POS),globalTwoHopTypeBag(G_NEG));
  assert.notEqual(typedThreeHopCount(G_POS),typedThreeHopCount(G_NEG));
  // Exact typed graph traversal is a valid symbolic baseline; this is not proof of a geometry advantage.
});
test('all 720 coherent actor renamings preserve the two reference answers', () => {
  let count=0;
  for(const perm of permutations([...VERTICES])){
    const mapping=Object.fromEntries(VERTICES.map((v,i)=>[v,perm[i]]));
    const gp=renameWorld(G_POS,mapping), gn=renameWorld(G_NEG,mapping);
    assert.deepEqual(bareAdjacency(gp),bareAdjacency(gn));
    assert.deepEqual(typedDegrees(gp),typedDegrees(gn));
    assert.deepEqual(globalTwoHopTypeBag(gp),globalTwoHopTypeBag(gn));
    assert.equal(typedThreeHopCount(gp,{source:mapping.s,target:mapping.t}),1);
    assert.equal(typedThreeHopCount(gn,{source:mapping.s,target:mapping.t}),0);
    count++;
  }
  assert.equal(count,720);
});
test('edge and clause ordering do not change any global typed counts', () => {
  for(const [world,answer] of [[G_POS,1],[G_NEG,0]]) {
    const reversed=[...world].reverse();
    assert.equal(typedThreeHopCount(reversed),answer);
    assert.deepEqual(globalTwoHopTypeBag(reversed),globalTwoHopTypeBag(world));
  }
});
test('invalid or invented arcs, sources, labels and renamings fail closed', () => {
  assert.throws(()=>typedThreeHopCount([{from:'a',to:'b',type:'P'}]),/INVALID_TOY_SHAPE/);
  assert.throws(()=>typedThreeHopCount(G_POS,{source:'nonexistent'}),/INVALID_TYPED_QUERY/);
  assert.throws(()=>typedThreeHopCount(G_POS,{types:['OPEN','P','MAGIC']}),/INVALID_TYPED_QUERY/);
  assert.throws(()=>checkerboardFlip(G_POS.map(x=>x.from==='a'&&x.to==='c'?{...x,type:'ACK'}:x)),/BAD_SWITCH_TYPE/);
  assert.throws(()=>renameWorld(G_POS,{s:'s',a:'a',b:'b',c:'a',d:'d',t:'t'}),/INVALID_RENAMING/);
});
test('toy module is pure and does not read memory, models or provider inputs', () => {
  const text=readFileSync(path.join(ROOT,'scripts/research/rgr-grma02/typed-composition-toy.mjs'),'utf8');
  for(const token of ['process.env','process.argv','fetch(','http:','https:','readFileSync','writeFileSync','Math.random','child_process','import ']) {
    assert.equal(text.includes(token),false,'unexpected token: '+token);
  }
});
test('all protected parent and canonical RGR sources remain byte-identical', () => {
  assert.equal(manifest.immediate_parent_sha,BASE);
  assert.equal(manifest.sources_protected.length,23);
  for(const p of manifest.sources_protected) {
    assert.equal(sha(readFileSync(path.join(ROOT,p))),sha(execFileSync('git',['show',BASE+':'+p],{cwd:ROOT})),p);
  }
  assert.equal(manifest.canonical_rgr07_opened,false);
});
test('only six explicitly listed RGR-GRM-A02 files may differ from the source commit', () => {
  const paths=new Set([
    ...git('diff','--name-only','-z',BASE,'--').split('\0'),
    ...git('diff','--cached','--name-only','-z',BASE,'--').split('\0'),
    ...git('ls-files','--others','--exclude-standard','-z').split('\0'),
  ].filter(Boolean));
  for(const p of paths) assert.ok(manifest.allowed_changed_paths.includes(p),'out of scope: '+p);
  assert.equal(manifest.allowed_changed_paths.length,6);
  assert.ok(paths.has('scripts/research/rgr-grma02/typed-composition-toy.mjs'));
});
test('source design documents are hash-bound, including challenge limitations', () => {
  const docs=Object.entries(manifest.document_sha256);
  assert.equal(docs.length,2);
  for(const [p,h] of docs){
    assert.match(h,/^[0-9a-f]{64}$/);
    assert.equal(sha(readFileSync(path.join(ROOT,p))),h,p);
  }
  const a=readFileSync(path.join(ROOT,manifest.allowed_changed_paths[0]),'utf8');
  const b=readFileSync(path.join(ROOT,manifest.allowed_changed_paths[1]),'utf8');
  assert.match(a,/two-hop edge-type label pairs/);
  assert.match(a,/Endpoint-aware two-hop walks can differ/);
  assert.match(a,/oracle ceiling/);
  assert.match(a,/not a numbered canonical gate/);
  assert.match(b,/Do not silently widen this claim/);
  assert.match(b,/RETURN_FOR_SPECIFICATION/);
});
test('no benchmark, no empirical/model or product authority is present', () => {
  assert.equal(manifest.standing,'RESEARCH_DESIGN_CANDIDATE_NOT_ADJUDICATED');
  assert.equal(manifest.relation_family.edge_count,9);
  assert.equal(manifest.sample_counts.hand_authored_fixed_worlds,2);
  assert.equal(manifest.sample_counts.synthetic_benchmark_examples_generated,0);
  assert.equal(manifest.sample_counts.model_inferences,0);
  assert.equal(manifest.authority.train_or_score_model,false);
  for(const [k,v] of Object.entries(manifest.authority)){
    if(!['prepare_documentation','run_pure_hand_authored_mathematical_fixture_checks','read_versioned_public_and_project_sources'].includes(k)) assert.equal(v,false,k);
  }
  assert.equal(manifest.conclusion.fixed_combinatorial_witness_verified,true);
  for(const [k,v] of Object.entries(manifest.conclusion))if(k!=='fixed_combinatorial_witness_verified')assert.equal(v,false,k);
});
