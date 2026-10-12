import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {
 readRgrCf01ResearchIntake,RGR_CF_WORK_ID,RGR_CF_TITLE,RGR_CF_SCHEMA,RGR_CF_DOCUMENT,
} from '../../../scripts/builder/founder-workspace/rgr-research-intake-reader.mjs';
import {buildEvidenceGraph} from '../../../scripts/builder/founder-workspace/graph-join.mjs';

const here=path.dirname(fileURLToPath(import.meta.url));
const repo=path.resolve(here,'../../..');
const shasum=b=>createHash('sha256').update(b).digest('hex');

/** @param {(f:any)=>void} cb */
function fixture(cb) {
 const tmp=fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(),'rgr-cf01-witness-')));
 const ain=path.join(tmp,'ain'),projection=path.join(ain,'projections');
 const root=path.join(tmp,'repo'),doc=path.join(root,RGR_CF_DOCUMENT);
 const index=path.join(projection,'rgr-cf01-research-intake.v1.json');
 fs.mkdirSync(path.dirname(doc),{recursive:true});fs.mkdirSync(projection,{recursive:true});
 const source='# Synthetic CF01 source\nThis is a deliberately non-production fixture.\n';
 fs.writeFileSync(doc,source);
 const ids=['source-custody','hypotheses','falsification','independent-review','experiment-authority','maia-boundary'];
 const standings=['documented','candidate','candidate','not-reviewed','hold','hold'];
 const meta={
  schema:RGR_CF_SCHEMA,work_unit_id:RGR_CF_WORK_ID,title:RGR_CF_TITLE,
  programme:'RELATIONAL-GEOMETRY-REASONING',authority:'orientation_only',
  experiment_authority:'NOT_AUTHORIZED',maia_authority:'NOT_AUTHORIZED',
  source_rel:RGR_CF_DOCUMENT,source_sha256:shasum(fs.readFileSync(doc)),
  recorded_at:'2026-10-12T16:00:00Z',
  stages:ids.map((id,i)=>({id,label:'Gate '+id,plain:'Synthetic standing '+id,standing:standings[i]})),
 };
 const save=()=>fs.writeFileSync(index,JSON.stringify(meta,null,2)+'\n');
 const read=()=>readRgrCf01ResearchIntake({root,env:{AIN_DELEGATION_HOME:ain}});
 try {cb({tmp,ain,root,doc,index,meta,save,read});}
 finally {fs.rmSync(tmp,{recursive:true,force:true});}
}

test('CF01 missing sidecar cannot fabricate an intake or source evidence',()=>fixture(f=>{
 const r=f.read();
 assert.equal(r.evidence_state,'UNVERIFIED');
 assert.equal(r.authority,'orientation_only');
 assert.equal(r.experiment_authority,'NOT_AUTHORIZED');
 assert.equal(r.maia_authority,'NOT_AUTHORIZED');
 assert.equal(r.stages.length,0);
 assert.equal(fs.existsSync(f.index),false);
}));
test('CF01 valid documentary source remains proposed, held and historical',()=>fixture(f=>{
 f.save();const r=f.read();
 assert.equal(r.evidence_state,'OBSERVED');
 assert.equal(r.source_verified,true);
 assert.equal(r.source_ref,f.doc);
 assert.equal(r.source_sha256,shasum(fs.readFileSync(f.doc)));
 assert.equal(r.historical_only,true);
 assert.deepEqual(r.stages.map(x=>x.standing),['documented','candidate','candidate','not-reviewed','hold','hold']);
 assert.equal(r.experiment_authority,'NOT_AUTHORIZED');
 assert.equal(r.maia_authority,'NOT_AUTHORIZED');
}));
test('CF01 tampered source invalidates fingerprint and any Graph relationship',()=>fixture(f=>{
 f.save();fs.appendFileSync(f.doc,'changed');
 const r=f.read();assert.equal(r.evidence_state,'UNVERIFIED');
 const u={id:RGR_CF_WORK_ID,title:RGR_CF_TITLE,file:path.join(f.ain,'work-units-v2','cf.json'),research_snapshot:r};
 const g=buildEvidenceGraph({programme_state:{programmes:[]},work:{units:[u],handoffs:[],results:[]}});
 assert.equal(g.edges.filter(e=>e.from==='work:'+RGR_CF_WORK_ID && e.rel==='has candidate research intake').length,0);
}));
test('CF01 source-verified Graph edge points to exactly one file-backed record',()=>fixture(f=>{
 f.save();const snap=f.read();
 const u={id:RGR_CF_WORK_ID,title:RGR_CF_TITLE,file:path.join(f.ain,'work-units-v2','cf.json'),programme:'RELATIONAL-GEOMETRY-REASONING',research_snapshot:snap};
 const g=buildEvidenceGraph({programme_state:{programmes:[]},work:{units:[u],handoffs:[],results:[]}});
 const es=g.edges.filter(e=>e.from==='work:'+RGR_CF_WORK_ID);
 assert.equal(es.length,1);assert.equal(es[0].rel,'has candidate research intake');
 assert.equal(es[0].evidence.ref,f.doc);
 assert.equal(es[0].evidence.kind,'rgr-intake-source');
 const fake=buildEvidenceGraph({programme_state:{programmes:[]},work:{units:[{...u,id:'wrong-unit'}]}});
 assert.equal(fake.edges.filter(e=>e.rel==='has candidate research intake').length,0);
}));
test('CF01 manifest cannot authorize experimentation or MAIA by changing status',()=>fixture(f=>{
 f.meta.experiment_authority='AUTHORIZED';f.save();
 assert.equal(f.read().evidence_state,'UNVERIFIED');
 f.meta.experiment_authority='NOT_AUTHORIZED';f.meta.maia_authority='AUTHORIZED';f.save();
 assert.equal(f.read().evidence_state,'UNVERIFIED');
 f.meta.maia_authority='NOT_AUTHORIZED';f.meta.stages[4].standing='documented';f.save();
 assert.equal(f.read().evidence_state,'UNVERIFIED');
}));
test('CF01 rejects source and manifest symlinks',()=>fixture(f=>{
 f.save();
 const redirected=path.join(f.tmp,'redirected.md');
 fs.renameSync(f.doc,redirected);fs.symlinkSync(redirected,f.doc);
 assert.equal(f.read().evidence_state,'UNVERIFIED');
 fs.unlinkSync(f.doc);fs.renameSync(redirected,f.doc);
 const indexCopy=path.join(f.tmp,'index-copy.json');
 fs.renameSync(f.index,indexCopy);fs.symlinkSync(indexCopy,f.index);
 assert.equal(f.read().evidence_state,'UNVERIFIED');
}));
test('CF01 source reader neither executes nor writes; renderer projects same unit across five rooms',()=>{
 const src=fs.readFileSync(path.join(repo,'scripts/builder/founder-workspace/rgr-research-intake-reader.mjs'),'utf8');
 assert.doesNotMatch(src,/writeFileSync|mkdirSync|spawn\(|execFileSync|fetch\(|providerSpend/);
 const renderer=fs.readFileSync(path.join(repo,'jarvis-desktop/src/founder-workspace-renderer.js'),'utf8');
 assert.match(renderer,/function rgrCfMarkup\(u\)/);
 assert.match(renderer,/rgrCfMarkup\(unit\)/);
 assert.match(renderer,/rgrCfSection\('Work'\)/);
 assert.match(renderer,/rgrCfSection\('Monitor'\)/);
 assert.match(renderer,/rgrCfSection\('System'\)/);
 assert.match(renderer,/researchContext/);
 assert.match(renderer,/rgrDraftWatching/);
});
