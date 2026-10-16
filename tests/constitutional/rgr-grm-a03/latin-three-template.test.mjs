import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {dirname,join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {
 VERTICES,TYPES,G_POS,G_NEG,untypedEdges,typeHistogram,typedDegrees,
 lexicalUnigramBag,twoHopLabelBag,derivedTwoHopLabelBag,anchoredTwoHopEnds,
 threeHopCount,stronglyConnected,reciprocalPairs,renameWorld,
} from '../../../scripts/research/rgr-grma03/latin-three-template-toy.mjs';
import {
 VERTICES as A02_VERTICES,G_POS as A02_POS,G_NEG as A02_NEG,typedThreeHopCount as a02Count
} from '../../../scripts/research/rgr-grma02/typed-composition-toy.mjs';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'../../..');
const BASE='9780af3387aa0015299b96069c90b4cd2a31a18c';
const contract=JSON.parse(readFileSync(join(root,'docs/programme/RGR-GRM-A03_WORK_UNIT_2026-10-16.json'),'utf8'));
const sha=b=>createHash('sha256').update(b).digest('hex');
const git=(...args)=>execFileSync('git',args,{cwd:root}).toString();
const sortEntries=map=>[...map.entries()].sort(([a],[b])=>a.localeCompare(b));
function* perms(array,i=0){
 if(i>=array.length){yield [...array];return;}
 for(let j=i;j<array.length;j++){
   [array[i],array[j]]=[array[j],array[i]];
   yield* perms(array,i+1);
   [array[i],array[j]]=[array[j],array[i]];
 }
}

test('exactly two explicit eight-vertex sixteen-edge labeled graph worlds are provided',()=>{
 assert.deepEqual(VERTICES,['s','a','b','c','u','v','w','t']);
 assert.equal(TYPES.length,10);
 for(const e of [G_POS,G_NEG]){
   assert.equal(e.length,16);
   assert.equal(new Set(untypedEdges(e)).size,16);
   assert.ok(e.every(x=>x.from!==x.to));
 }
});
test('both worlds have identical full untyped graph, not only degree sequence',()=>{
 assert.deepEqual(untypedEdges(G_POS),untypedEdges(G_NEG));
});
test('each named vertex retains all typed incoming and outgoing counts',()=>{
 assert.deepEqual(typedDegrees(G_POS),typedDegrees(G_NEG));
});
test('each middle-row and middle-column has exactly one P, Q and R',()=>{
 for(const g of [G_POS,G_NEG]){
   for(const s of ['a','b','c']){
     assert.deepEqual(g.filter(x=>x.from===s).map(x=>x.type).sort(),['P','Q','R']);
   }
   for(const t of ['u','v','w']){
     assert.deepEqual(g.filter(x=>x.to===t).map(x=>x.type).sort(),['P','Q','R']);
   }
 }
});
test('the negative differs by exactly the cyclic reassignment P→Q→R→P on all 9 middle arcs',()=>{
 const rotation={P:'Q',Q:'R',R:'P'};
 for(const x of G_POS){
   const changed=G_NEG.find(y=>y.from===x.from&&y.to===x.to);
   assert.ok(changed);
   assert.equal(changed.type,rotation[x.type]??x.type);
 }
 assert.equal(G_POS.filter(x=>['P','Q','R'].includes(x.type)).length,9);
});
test('global type-label and canonical one-clause unigram histograms stay equal',()=>{
 assert.deepEqual(typeHistogram(G_POS),typeHistogram(G_NEG));
 assert.deepEqual(lexicalUnigramBag(G_POS),lexicalUnigramBag(G_NEG));
});
test('unanchored twohop type-label histogram matches in both worlds',()=>{
 assert.deepEqual(twoHopLabelBag(G_POS),twoHopLabelBag(G_NEG));
 const a=new Map(twoHopLabelBag(G_POS));
 for(const key of ['OPEN|P','P|ACK'])assert.equal(a.get(key),1,key);
});
test('global twohop type-label histograms are an algebraic consequence of typed degrees',()=>{
 assert.deepEqual(derivedTwoHopLabelBag(G_POS),twoHopLabelBag(G_POS));
 assert.deepEqual(derivedTwoHopLabelBag(G_NEG),twoHopLabelBag(G_NEG));
 assert.deepEqual(typedDegrees(G_POS),typedDegrees(G_NEG));
});
test('anchored OPEN→P twohop destinations differ, unlike aggregate twohop counts',()=>{
 assert.deepEqual(anchoredTwoHopEnds(G_POS),['u']);
 assert.deepEqual(anchoredTwoHopEnds(G_NEG),['w']);
});
test('OPEN→P→ACK anchored three-hop predicate changes exactly from 1 to 0',()=>{
 assert.equal(threeHopCount(G_POS),1);
 assert.equal(threeHopCount(G_NEG),0);
 assert.equal(threeHopCount(G_POS,{labels:['WAIT','P','ACK']}),0);
 assert.equal(threeHopCount(G_NEG,{labels:['WAIT','P','ACK']}),1);
});
test('both graphs are strongly connected and contain no reciprocal edges',()=>{
 assert.equal(stronglyConnected(G_POS),true);
 assert.equal(stronglyConnected(G_NEG),true);
 assert.equal(reciprocalPairs(G_POS),0);
 assert.equal(reciprocalPairs(G_NEG),0);
});
test('the A02 and A03 reference templates differ in graph size but share target semantics',()=>{
 assert.equal(A02_VERTICES.length,6);
 assert.equal(A02_POS.length,9);
 assert.equal(VERTICES.length,8);
 assert.equal(G_POS.length,16);
 assert.equal(a02Count(A02_POS),1);
 assert.equal(a02Count(A02_NEG),0);
 assert.equal(threeHopCount(G_POS),1);
 assert.equal(threeHopCount(G_NEG),0);
});
test('all 40320 coherent node renamings preserve the anchored query truth',()=>{
 let total=0;
 for(const order of perms([...VERTICES])){
   const mapping=Object.fromEntries(VERTICES.map((v,i)=>[v,order[i]]));
   const positive=renameWorld(G_POS,mapping);
   const negative=renameWorld(G_NEG,mapping);
   const opts={start:mapping.s,end:mapping.t};
   assert.equal(threeHopCount(positive,opts),1);
   assert.equal(threeHopCount(negative,opts),0);
   // only two explicit mathematical worlds are source fixtures; renamed
   // in-memory temporaries are not retained as dataset or experimental items.
   total++;
 }
 assert.equal(total,40320);
});
test('edge clause order changes neither type counts nor target truth',()=>{
 for(const [world,target] of [[G_POS,1],[G_NEG,0]]){
   const shuffled=[...world].reverse();
   assert.deepEqual(typeHistogram(shuffled),typeHistogram(world));
   assert.deepEqual(derivedTwoHopLabelBag(shuffled),twoHopLabelBag(world));
   assert.equal(threeHopCount(shuffled),target);
 }
});
test('an isolated P→Q change is NOT an admissible fully matched counterfactual',()=>{
 const broken=G_POS.map(x=>x.from==='a'&&x.to==='u'?{...x,type:'Q'}:{...x});
 assert.notDeepEqual(typedDegrees(broken),typedDegrees(G_POS));
 assert.notDeepEqual(typeHistogram(broken),typeHistogram(G_POS));
});
test('invalid sources, types, duplicate edges and incoherent renamings refuse',()=>{
 assert.throws(()=>threeHopCount([{from:'s',to:'a',type:'OPEN'}]),/INVALID_FIXED_SHAPE/);
 assert.throws(()=>threeHopCount(G_POS,{start:'nobody'}),/INVALID_THREEHOP_QUERY/);
 assert.throws(()=>threeHopCount(G_POS,{labels:['OPEN','P','UNKNOWN']}),/INVALID_THREEHOP_QUERY/);
 assert.throws(()=>untypedEdges([...G_POS.slice(0,15),G_POS[0]]),/DUPLICATE_EDGE/);
 assert.throws(()=>renameWorld(G_POS,{s:'s',a:'s',b:'b',c:'c',u:'u',v:'v',w:'w',t:'t'}),/INVALID_RENAMING/);
});
test('toy implementation has no I/O, model, network, environment or random sampling',()=>{
 const s=readFileSync(join(root,'scripts/research/rgr-grma03/latin-three-template-toy.mjs'),'utf8');
 for(const token of ['process.env','process.argv','Math.random','readFileSync','writeFileSync','fetch(','http:','https:','child_process','import ','axios','openai']) {
   assert.equal(s.includes(token),false,'forbidden source token '+token);
 }
});
test('all 29 parent/canonical files are byte-identical to the exact A02 commit',()=>{
 assert.equal(contract.base_commit,BASE);
 assert.equal(contract.protected_parent_sources.length,29);
 for(const p of contract.protected_parent_sources){
   const now=sha(readFileSync(join(root,p)));
   const then=sha(execFileSync('git',['show',BASE+':'+p],{cwd:root}));
   assert.equal(now,then,p);
 }
 assert.equal(contract.canonical_RGR07_opened,false);
});
test('only six explicitly declared new A03 paths can differ',()=>{
 const paths=new Set([
  ...git('diff','--name-only','-z',BASE,'--').split('\0'),
  ...git('diff','--cached','--name-only','-z',BASE,'--').split('\0'),
  ...git('ls-files','--others','--exclude-standard','-z').split('\0'),
 ].filter(Boolean));
 assert.equal(contract.allowed_changed_paths.length,6);
 for(const p of paths)assert.ok(contract.allowed_changed_paths.includes(p),'out of scope '+p);
 assert.ok(paths.has('scripts/research/rgr-grma03/latin-three-template-toy.mjs'));
});
test('source prose and specific methodological caveats are SHA bound',()=>{
 const docs=Object.entries(contract.documents_sha256);
 assert.equal(docs.length,2);
 for(const [p,h] of docs){
   assert.match(h,/^[a-f0-9]{64}$/);
   assert.equal(sha(readFileSync(join(root,p))),h,p);
 }
 const p=readFileSync(join(root,contract.allowed_changed_paths[0]),'utf8');
 const r=readFileSync(join(root,contract.allowed_changed_paths[1]),'utf8');
 assert.match(p,/shared use of label-permutation patterns|shared mechanism|typed-label-permutation mechanism/i);
 assert.match(p,/A03.*does not.*two independently generated relationship families|A03.*does not.*independent/i);
 assert.match(p,/not a numbered canonical gate|not.*numbered canonical gate|No numbered canonical RGR gate/i);
 assert.match(r,/RETURN_FOR_SPECIFICATION/);
 assert.match(r,/\*\*NOT\*\* independent human/i);
});
test('the candidate neither authorizes research execution nor asserts empirical superiority',()=>{
 assert.equal(contract.id,'RGR-GRM-A03');
 assert.equal(contract.epistemic_standing.fixed_toy_math_verified,true);
 assert.equal(contract.new_identifier_noncanonical,true);
 assert.equal(contract.research_scope.new_hand_authored_graph_worlds,2);
 assert.equal(contract.research_scope.total_hand_authored_worlds_in_two_template_comparison,4);
 assert.equal(contract.research_scope.statistically_independent_samples,0);
 assert.equal(contract.research_scope.independent_change_mechanisms_established,false);
 assert.equal(contract.research_scope.text_renderer_implemented,false);
 const allowed=new Set(['documentary_method_specification','pure_fixed_mathematical_fixture_verification','source_read_and_comparison']);
 for(const [name,value] of Object.entries(contract.allowed_work))
   assert.equal(value,allowed.has(name),'authority: '+name);
 for(const [name,value] of Object.entries(contract.epistemic_standing))
   if(name!=='fixed_toy_math_verified')assert.equal(value,false,'standing: '+name);
});
