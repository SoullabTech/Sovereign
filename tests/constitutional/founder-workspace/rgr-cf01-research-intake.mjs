import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {
 readRgrCf01ResearchIntake,RGR_CF_WORK_ID,RGR_CF_TITLE,RGR_CF_SCHEMA,RGR_CF_DOCUMENT,
 RGR_CF_SOURCE_COMMIT,RGR_CF_SOURCE_SHA256,RGR_CF_RECORDED_AT,RGR_CF_FROZEN_STAGES,
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
 // Synthetic temp repository *environment*, but authentic publicly readable
 // fixed research document bytes. This fixture cannot alter any source repo.
 fs.copyFileSync(path.join(repo,RGR_CF_DOCUMENT),doc);
 const meta={
  schema:RGR_CF_SCHEMA,work_unit_id:RGR_CF_WORK_ID,title:RGR_CF_TITLE,
  programme:'RELATIONAL-GEOMETRY-REASONING',authority:'orientation_only',
  experiment_authority:'NOT_AUTHORIZED',maia_authority:'NOT_AUTHORIZED',
  source_rel:RGR_CF_DOCUMENT,source_sha256:RGR_CF_SOURCE_SHA256,
  source_commit:RGR_CF_SOURCE_COMMIT,recorded_at:RGR_CF_RECORDED_AT,
  stages:RGR_CF_FROZEN_STAGES.map(s=>({...s})),
 };
 const save=()=>fs.writeFileSync(index,JSON.stringify(meta,null,2)+'\n');
 const read=()=>readRgrCf01ResearchIntake({root,env:{AIN_DELEGATION_HOME:ain}});
 try {cb({tmp,ain,root,doc,index,meta,save,read});}
 finally {fs.rmSync(tmp,{recursive:true,force:true});}
}

test('immutable source digest is independently proved from exact committed Git tree',()=>{
 const commitBytes=execFileSync('git',['show',RGR_CF_SOURCE_COMMIT+':'+RGR_CF_DOCUMENT],{cwd:repo,maxBuffer:250000});
 assert.equal(shasum(commitBytes),RGR_CF_SOURCE_SHA256);
 assert.deepEqual(commitBytes,fs.readFileSync(path.join(repo,RGR_CF_DOCUMENT)));
});
test('CF01 missing sidecar cannot fabricate an intake or source evidence',()=>fixture(f=>{
 const r=f.read();
 assert.equal(r.evidence_state,'UNVERIFIED');
 assert.equal(r.authority,'orientation_only');
 assert.equal(r.experiment_authority,'NOT_AUTHORIZED');
 assert.equal(r.maia_authority,'NOT_AUTHORIZED');
 assert.equal(r.stages.length,0);
 assert.equal(fs.existsSync(f.index),false);
}));
test('CF01 valid frozen documentary intake is bound to a commit and grants nothing',()=>fixture(f=>{
 f.save();const r=f.read();
 assert.equal(r.evidence_state,'OBSERVED');
 assert.equal(r.source_verified,true);
 assert.equal(r.source_ref,f.doc);
 assert.equal(r.source_sha256,RGR_CF_SOURCE_SHA256);
 assert.equal(r.source_commit,RGR_CF_SOURCE_COMMIT);
 assert.equal(r.source_custody,'LOCAL_BYTES_MATCH_PINNED_COMMIT_DOCUMENT');
 assert.equal(r.recorded_at,RGR_CF_RECORDED_AT);
 assert.equal(r.historical_only,true);
 assert.deepEqual(r.stages,RGR_CF_FROZEN_STAGES);
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
test('CF01 jointly altered index+document fails despite locally matching SHA',()=>fixture(f=>{
 fs.appendFileSync(f.doc,'\nALTERED CONCLUSION');
 f.meta.source_sha256=shasum(fs.readFileSync(f.doc));
 f.save();
 const r=f.read();
 assert.equal(r.evidence_state,'UNVERIFIED');
 assert.equal(r.source_verified,false);
 assert.equal(r.stages.length,0);
}));
test('CF01 exact committed-source pin cannot be silently substituted',()=>fixture(f=>{
 f.meta.source_commit='f'.repeat(40);f.save();
 assert.equal(f.read().evidence_state,'UNVERIFIED');
 f.meta.source_commit=RGR_CF_SOURCE_COMMIT;
 f.meta.source_sha256='a'.repeat(64);f.save();
 assert.equal(f.read().evidence_state,'UNVERIFIED');
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
 const forged={...snap,source_custody:undefined};
 const noPin=buildEvidenceGraph({programme_state:{programmes:[]},work:{units:[{...u,research_snapshot:forged}]}});
 assert.equal(noPin.edges.filter(e=>e.rel==='has candidate research intake').length,0);
}));
test('CF01 manifest cannot authorize experimentation or MAIA by changing status',()=>fixture(f=>{
 f.meta.experiment_authority='AUTHORIZED';f.save();
 assert.equal(f.read().evidence_state,'UNVERIFIED');
 f.meta.experiment_authority='NOT_AUTHORIZED';f.meta.maia_authority='AUTHORIZED';f.save();
 assert.equal(f.read().evidence_state,'UNVERIFIED');
 f.meta.maia_authority='NOT_AUTHORIZED';f.meta.stages[4].standing='documented';f.save();
 assert.equal(f.read().evidence_state,'UNVERIFIED');
}));
test('CF01 C1: hypotheses, falsification, and their words cannot be promoted',()=>fixture(f=>{
 f.meta.stages[1].standing='documented';f.save();
 assert.equal(f.read().evidence_state,'UNVERIFIED');
 f.meta.stages[1].standing='candidate';
 f.meta.stages[2].standing='documented';f.save();
 assert.equal(f.read().evidence_state,'UNVERIFIED');
 f.meta.stages[2].standing='candidate';
 f.meta.stages[3].plain='An independent reviewer has passed this packet.';f.save();
 assert.equal(f.read().evidence_state,'UNVERIFIED');
 f.meta.stages[3].plain=RGR_CF_FROZEN_STAGES[3].plain;
 f.meta.stages[1].label='Certified geometry';f.save();
 assert.equal(f.read().evidence_state,'UNVERIFIED');
 f.meta.stages[1].label=RGR_CF_FROZEN_STAGES[1].label;
 f.meta.stages[0].extra='counterfeit';f.save();
 assert.equal(f.read().evidence_state,'UNVERIFIED');
}));
test('CF01 untrusted provenance timestamp and extra index fields fail closed',()=>fixture(f=>{
 f.meta.recorded_at='2026-10-13T10:00:00Z';f.save();
 assert.equal(f.read().evidence_state,'UNVERIFIED');
 f.meta.recorded_at=RGR_CF_RECORDED_AT;f.meta.extra_verdict='PASS';f.save();
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
