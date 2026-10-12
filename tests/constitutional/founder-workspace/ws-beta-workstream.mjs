import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {readWriterBetaReleaseEvidence, WORK_ID, WORK_TITLE, EVIDENCE_SCHEMA} from '../../../scripts/builder/founder-workspace/release-workstream-reader.mjs';
import {buildEvidenceGraph} from '../../../scripts/builder/founder-workspace/graph-join.mjs';
import {adaptTeamAttention} from '../../../scripts/builder/founder-workspace/adapters.mjs';

const here=path.dirname(fileURLToPath(import.meta.url));
const repo=path.resolve(here,'../../..');
/** @typedef {{
  tmp:string,ain:string,projection:string,receipts:string,doc:any,
  file:string,save:()=>void,read:()=>any,
  receiptById:Record<string,{path:string,sha256:string}>
}} Fixture */
/** @param {(f:Fixture)=>void} callback */
function withFixture(callback) {
  const tmp=fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(),'jarvis-ws-beta-workunit-')));
  const ain=path.join(tmp,'ain');
  const projection=path.join(ain,'projections');
  const receipts=path.join(tmp,'receipt');
  fs.mkdirSync(projection,{recursive:true});
  fs.mkdirSync(receipts,{recursive:true});
  const idList=['linux-fence','member-access','device-copy','source-custody','migrations','writer-rehearsal','release-authorization'];
  const receiptNames=['linux-fence','member-access','device-copy','source-custody','migrations'];
  /** @type {Record<string,{path:string,sha256:string}>} */
  const receiptById={};
  for(const id of receiptNames) {
    const p=path.join(receipts,id+'.txt');
    fs.writeFileSync(p,'Synthetic evidence for '+id);
    receiptById[id]={path:p,sha256:createHash('sha256').update(fs.readFileSync(p)).digest('hex')};
  }
  const doc={
    schema:EVIDENCE_SCHEMA,work_unit_id:WORK_ID,title:WORK_TITLE,
    authority:'orientation_only',release_approval:'NOT_AUTHORIZED',
    recorded_at:'2026-10-12T12:00:00.000Z',
    gates:idList.map((id,i)=>({
      id,label:id,plain:'Recorded synthetic gate '+id,
      standing:i<3?'witnessed':i<5?'hold':i===5?'open':'future-decision',
      observed_at:i<5?'2026-10-12':null,receipt:receiptById[id]||null,
    })),
  };
  const file=path.join(projection,'writers-studio-small-beta-launch.v1.json');
  const save=()=>fs.writeFileSync(file,JSON.stringify(doc)+'\n');
  const read=()=>readWriterBetaReleaseEvidence({env:{AIN_DELEGATION_HOME:ain},home:tmp,allowedRoots:[receipts]});
  try {callback({tmp,ain,projection,receipts,doc,file,save,read,receiptById});}
  finally {fs.rmSync(tmp,{recursive:true,force:true});}
}
test('gates are historical evidence; never release authorization or live health',()=>withFixture(f=>{
  f.save();const r=f.read();
  assert.equal(r.evidence_state,'OBSERVED');
  assert.equal(r.work_unit_id,WORK_ID);
  assert.equal(r.release_approval,'NOT_AUTHORIZED');
  assert.equal(r.authority,'orientation_only');
  assert.equal(r.historical_only,true);
  assert.equal(r.gates.length,7);
  assert.equal(r.gates.filter((/** @type {any} */ x)=>x.receipt_verified).length,5);
  assert.equal(r.gates[5].standing,'open');
  assert.equal(r.gates[6].standing,'future-decision');
}));
test('missing manifest is not auto-created and cannot imply a green beta',()=>withFixture(f=>{
  assert.equal(fs.existsSync(f.file),false);
  const r=f.read();
  assert.equal(r.evidence_state,'UNVERIFIED');
  assert.equal(r.gates.length,0);
  assert.equal(r.release_approval,'NOT_AUTHORIZED');
  assert.equal(fs.existsSync(f.file),false);
}));
test('a witnessed standing without a verifiable receipt is always downgraded',()=>withFixture(f=>{
  f.doc.gates[0].receipt=null;f.save();
  const r=f.read();
  assert.equal(r.gates[0].standing,'unverified');
  assert.equal(r.release_approval,'NOT_AUTHORIZED');
}));
test('tampering with a cited receipt downgrades witnessed status and never rewrites receipt',()=>withFixture(f=>{
  f.save();fs.appendFileSync(f.receiptById['device-copy'].path,' tampered');
  const before=fs.readFileSync(f.receiptById['device-copy'].path);
  const r=f.read();const gate=r.gates.find((/** @type {any} */ x)=>x.id==='device-copy');
  assert.equal(gate.standing,'unverified');
  assert.equal(gate.receipt_verified,false);
  assert.match(gate.note,/cannot be verified/);
  assert.deepEqual(fs.readFileSync(f.receiptById['device-copy'].path),before);
  assert.equal(r.evidence_state,'PARTIAL');
}));
test('receipt paths outside allowlist are refused even if their SHA matches',()=>withFixture(f=>{
  f.save();const external=path.join(f.tmp,'outside-secret.txt');fs.writeFileSync(external,'Not admitted');
  f.doc.gates[0].receipt={path:external,sha256:createHash('sha256').update('Not admitted').digest('hex')};f.save();
  const r=f.read();assert.equal(r.gates[0].standing,'unverified');assert.equal(r.gates[0].receipt_verified,false);
}));
test('manifest symlinks and unapproved release standing are refused',()=>withFixture(f=>{
  const real=path.join(f.tmp,'valid-manifest.json');fs.writeFileSync(real,JSON.stringify(f.doc));
  fs.symlinkSync(real,f.file);
  assert.equal(f.read().evidence_state,'UNVERIFIED');
  fs.unlinkSync(f.file);
  f.doc.release_approval='AUTHORIZED';f.save();
  assert.equal(f.read().evidence_state,'UNVERIFIED');
}));
test('malformed or duplicate gate identity is refused, never silently omitted',()=>withFixture(f=>{
  f.doc.gates[2].id='linux-fence';f.save();
  assert.equal(f.read().evidence_state,'UNVERIFIED');
}));
test('only the work unit gets an evidenced graph edge; no inferred programme association',()=>withFixture(f=>{
  f.save();const s=f.read();
  const u={id:WORK_ID,title:WORK_TITLE,file:path.join(f.ain,'work-units-v2',WORK_ID+'.json'),evidence_state:'OBSERVED',programme:'Writer’s Studio',release_snapshot:s};
  const graph=buildEvidenceGraph({programme_state:{programmes:[]},work:{units:[u],handoffs:[],results:[]}});
  const edges=graph.edges.filter(x=>x.from==='work:'+WORK_ID);
  assert.equal(edges.length,1);
  assert.equal(edges[0].rel,'has historical release evidence');
  assert.equal(edges[0].evidence.kind,'release-evidence-index');
  assert.equal(edges[0].evidence.ref,s.file);
  assert.equal(graph.nodes.some(n=>n.kind==='programme'),false);
  const without=buildEvidenceGraph({programme_state:{programmes:[]},work:{units:[{...u,release_snapshot:{...s,file:null}}]}});
  assert.equal(without.edges.length,0);
}));
test('AI partner field text remains plain prose, not forbidden VM aggregate key',()=>{
  const h={handoffs:[{handoff_id:'partner-one',source:'chatgpt',field:'Studio',summary:'This is a bounded handoff.',created_at:'2026-10-12'}]};
  const p=adaptTeamAttention(h,[]);
  assert.equal(p.items[0].plain,'This is a bounded handoff.');
  assert.equal(Object.hasOwn(p.items[0],'summary'),false);
  assert.equal(p.items[0].authority,'orientation_only');
});
test('release reader is read-only and scoped to the admitted Work Unit, without model or network',()=>{
  const src=fs.readFileSync(path.join(repo,'scripts/builder/founder-workspace/release-workstream-reader.mjs'),'utf8');
  assert.match(src,/readWriterBetaReleaseEvidence/);
  assert.doesNotMatch(src,/writeFileSync|mkdirSync|\.fetch\(|\bfetch\(|spawn\(|execFileSync|providerSpend/);
});
