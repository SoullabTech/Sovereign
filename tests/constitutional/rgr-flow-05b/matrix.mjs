import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';

const root = execFileSync('git', ['rev-parse', '--show-toplevel'], {encoding:'utf8'}).trim();
const git = (...args) => execFileSync('git', args, {cwd:root});
const sha = x => createHash('sha256').update(x).digest('hex');
const read = p => readFileSync(resolve(root,p));
const doc = 'docs/programme/RGR-05B_SYNTHETIC_FLOW_REPRESENTATION_BENCHMARK_2026-10-07.md';
const rationale = 'docs/programme/RGR-05B_BENCHMARK_DESIGN_RATIONALE_2026-10-07.md';
const workPath = 'docs/programme/RGR-05B_WORK_UNIT_2026-10-07.json';
const work = JSON.parse(read(workPath));
const repair = work.repair_r1;
const c = repair.contract;
let checks=0;
function check(name, fn) { fn(); checks++; console.log(`PASS ${name}`); }

check('version and non-authority',()=>{
  assert.equal(c.version,'RGR-FLOW-SFRB-01-R1');
  assert.equal(repair.standing,'REPAIR_CANDIDATE_NOT_FOUNDER_ADJUDICATED');
  for(const [k,v] of Object.entries(c.executionAuthority)) assert.equal(v,false,k);
});
check('exact document binding',()=>{
  assert.equal(sha(read(doc)),repair.document_sha256);
  assert.equal(sha(read(rationale)),repair.rationale_sha256);
});
check('original reviewed bytes remain recoverable',()=>{
  assert.equal(sha(git('show',`${repair.original_reviewed_commit}:${doc}`)),repair.original_document_sha256);
});
check('parent RGR-02 and accepted 05A unchanged by bytes',()=>{
  for (const p of repair.protected_sources) assert.equal(sha(read(p)),sha(git('show',`${c.scopeBase}:${p}`)),p);
});
check('complete candidate scope, including committed and untracked files',()=>{
  const paths=new Set([
    ...git('diff','--name-only','-z',c.scopeBase,'--').toString().split('\0'),
    ...git('diff','--cached','--name-only','-z',c.scopeBase,'--').toString().split('\0'),
    ...git('ls-files','--others','--exclude-standard','-z').toString().split('\0'),
  ].filter(Boolean));
  for (const p of paths) assert.ok(c.allowedPaths.includes(p),`scope escape: ${p}`);
  assert.ok(paths.has(doc),'must inspect real branch diff, not only dirty files');
});
check('pulse arithmetic (not a simulated transport example)',()=>{
  const P=c.pulses;
  for(const p of Object.values(P)) assert.equal(p.reduce((a,b)=>a+b,0),1);
  const mean=p=>p.reduce((s,x,i)=>s+x*i,0);
  assert.equal(mean(P.P4),1.5); assert.equal(mean(P.P5),1.5);
  const prefix=p=>p.map((_,i)=>p.slice(0,i+1).reduce((a,b)=>a+b,0));
  const delta=prefix(P.P4).map((x,i)=>x-prefix(P.P5)[i]);
  assert.ok(delta.some(x=>x>0)&&delta.some(x=>x<0));
  assert.deepEqual(c.confirmatoryRhythm,['P4','P5']);
});
check('effective coefficient equivalence arithmetic',()=>{
  for(const p of [0,0.5,1]) assert.equal(p*0.5*(1-0),p*1*(1-0.5));
  assert.equal(c.separateConductanceResistanceClaim,false);
});
check('root partitions are complete and nonoverlapping',()=>{
  const buckets=Object.values(c.buckets).flatMap(([lo,hi])=>Array.from({length:hi-lo+1},(_,i)=>lo+i));
  assert.equal(buckets.length,100);assert.equal(new Set(buckets).size,100);
  assert.equal(Math.min(...buckets),0);assert.equal(Math.max(...buckets),99);
  assert.equal(c.rootGrouping,'query_marked_topology_all_descendants');
});
check('quotas, populations and bounded draws',()=>{
  for(const s of ['TRAIN','VALIDATION','TEST','REPLICATION']) {
    assert.equal(c.ordinary[s],20*c.roots[s]);
    assert.equal(c.oppositePairsPerFamily[s]%2,0);
    assert.equal(c.sameLabelPairsPerFamily[s]%2,0);
    assert.ok(c.oppositePairsPerFamily[s]<=c.roots[s]*10);
  }
  assert.equal(c.primaryMetricPopulation,'ordinary_only');
  assert.ok(c.graphDrawCap>0&&c.pairDrawCap>0&&c.ordinaryDrawCap>0);
});
check('shared raw information and narrowed claim',()=>{
  assert.deepEqual(c.rawViews.F_G,c.rawViews.F_F);
  assert.equal(c.uniqueFlowAlgorithmClaim,false);
  assert.equal(c.hypothesis,'H-GT1_declared_graph_temporal_inductive_bias');
});
check('complete independent task family lists',()=>{
  assert.deepEqual(c.tasks.A.families,['CF-1','CF-2','CF-3']);
  assert.deepEqual(c.tasks.B.families,['CF-1','CF-2','CF-3','CF-6']);
  assert.equal(c.tasks.A.horizon,10);assert.equal(c.tasks.B.horizon,18);
  assert.equal(c.turnaround,0.75);
  assert.deepEqual(c.invariantFamilies,['CF-4','CF-5','CF-7']);
});
check('training and RNG commitments',()=>{
  assert.equal(c.training.searchConfigurationsPerDynamicFamily,12);
  assert.equal(c.training.confirmationSeeds.length,10);
  assert.equal(c.training.replicationSeeds.length,10);
  const ids=[...c.training.searchSeeds,...c.training.confirmationSeeds,...c.training.replicationSeeds];
  assert.equal(ids.length,new Set(ids).size);
  assert.equal(c.training.maxEpochs,100);assert.equal(c.training.batchSize,128);
  assert.equal(c.bootstrap.commonRootDrawAcrossModels,true);
  assert.equal(c.bootstrap.independentFamilySeedDraws,true);
  assert.equal(c.bootstrap.coverageValidated,false);
});
// Abstract interval summaries test only disposition logic. No transport worlds,
// synthetic benchmark dataset, bootstrap samples or trained predictions exist here.
function intervalDisposition({valid=true,competent=true,qF=true,qG=true,controls=true,low,high,allMetricEquivalence=true,fQualityUpperFailed=false}) {
  assert.ok(Number.isFinite(low)&&Number.isFinite(high)&&low<=high);
  if(!valid) return 'INVALID';
  if(!competent) return 'UNDERDETERMINED';
  if(qF&&controls&&low>0.05) return 'GRAPH_TEMPORAL_ADVANTAGE';
  if(qF&&qG&&controls&&allMetricEquivalence&&low> -0.05&&high<0.05) return 'PRACTICALLY_EQUIVALENT';
  if(qG&&controls&&high< -0.05) return 'GENERIC_ADVANTAGE';
  if(fQualityUpperFailed||!controls) return 'NOT_SUPPORTED_AT_GATE';
  return 'INCONCLUSIVE';
}
check('hypothetical outcome boundary fixtures, not benchmark results',()=>{
  assert.equal(intervalDisposition({low:0.06,high:0.1}),'GRAPH_TEMPORAL_ADVANTAGE');
  assert.equal(intervalDisposition({low:-0.03,high:0.02}),'PRACTICALLY_EQUIVALENT');
  assert.equal(intervalDisposition({low:-0.08,high:0.08}),'INCONCLUSIVE');
  assert.equal(intervalDisposition({low:0.05,high:0.1}),'INCONCLUSIVE');
  assert.equal(intervalDisposition({low:-0.05,high:0.03}),'INCONCLUSIVE');
  assert.equal(intervalDisposition({low:-0.1,high:-0.06}),'GENERIC_ADVANTAGE');
  assert.equal(intervalDisposition({low:0.06,high:0.1,competent:false}),'UNDERDETERMINED');
  assert.equal(intervalDisposition({low:0.06,high:0.1,valid:false}),'INVALID');
  assert.equal(intervalDisposition({low:-0.02,high:0.02,allMetricEquivalence:false}),'INCONCLUSIVE');
});
check('static paired-identity bound arithmetic',()=>{
  for(const predicted of [0,1]){
    assert.equal((Number(predicted===0)+Number(predicted===1))/2,0.5);
    assert.equal(Number(predicted===0 && predicted===1),0);
  }
});
check('document explicitly distinguishes its checks from science',()=>{
  const text=read(doc).toString();
  assert.ok(text.includes('no transport simulator'));
  assert.ok(text.includes('not a demonstrated finite-sample coverage guarantee'));
  assert.ok(text.includes('benchmark data: NOT MATERIALIZED'));
});
console.log(JSON.stringify({matrix:'RGR-05B-R1-DOCUMENTARY-CONTRACT',checksPassed:checks,
  scope:'PASS',simulationRun:false,trainingRun:false,empiricalResult:false,
  statisticalCalibration:false,founderAdjudication:false,runtimeAuthority:false},null,2));
