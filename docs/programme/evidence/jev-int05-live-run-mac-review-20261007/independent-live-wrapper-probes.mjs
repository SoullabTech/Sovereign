/**
 * Independent, synthetic-only JEV-INT-05 wrapper boundary measurements on Mac+T7.
 * No real provider endpoint is contacted; remote grant test uses a fake transport and dummy callback.
 * Exit 0 means measurements completed, NOT that every invariant holds.
 */
import http from 'node:http';
import { createHash } from 'node:crypto';
import { mkdtempSync, mkdirSync, renameSync, symlinkSync, rmSync, readFileSync, copyFileSync, statSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { pathToFileURL } from 'node:url';
const REPO = process.argv[2];
const OUT = process.argv[3];
const T7_ROOT = process.argv[4];
if (!REPO || !OUT || !T7_ROOT) throw new Error('USAGE: witness <repository> <output> <checkpoint-root>');
const { makeVariant } = await import(pathToFileURL(REPO + '/scripts/builder/__tests__/jev-wire-variant-lib.mjs').href);
const wireV = makeVariant([], { witnessed: true });
const wrapV = makeVariant([], { from: REPO + '/scripts/builder/jev-wire-live-run-v1.mjs', importMap: { './jev-wire-v1.mjs': wireV.url } });
const W = await import(wireV.url);
const R = await import(wrapV.url);
const full = { model:'jev-1.13.0', usage:{input_tokens:300,output_tokens:5},
 answers:{Q_RISK:{type:'noul',noul:0.25}} };
const rows = [];
const report = (item) => { rows.push(item); console.log(JSON.stringify(item)); };
const sroot = mkdtempSync(join(tmpdir(), 'jev-live-probes-SYNTHETIC-'));
const troot = mkdtempSync(join(T7_ROOT,'jev-live-probes-SYNTHETIC-'));
const is2=statSync(sroot).dev !== statSync(troot).dev;
if(!is2) throw new Error('NEED_TWO_DEVICES');
const iso = (ms) => new Date(ms).toISOString();
const grant = (url, over = {}) => ({
 instrument:'jev-int05-execution-grant/v1',state:'AUTHORIZED',
 experiment_id:'JEV-INT-05-SYNTHETIC-REVIEW',provider_id:'typesafe-jev',
 model:'jev-1.13.0',endpoint:url,network:'LOOPBACK_ONLY',
 table_hash: W.questionTableHash(),fixture_list_hash:W.fixtureListHash(),
 schema_sha256:W.RESPONSE_SHAPE.schema_sha256,max_attempts:2,ceiling_usd:1,
 not_before:iso(Date.now()-60_000), expires_at:iso(Date.now()+3600_000),
 volume_policy:'SAME_DEVICE_MOCK_ONLY',operator:'SYNTHETIC',authorized_by:'TEST-NOT-HUMAN',
 authorization_ref:'REVIEW-ONLY-NOT-ADMITTED',...over,
});
function stores(name,distinct=false) {
 const d=join(sroot,name);const c=distinct?join(troot,name):join(d,'anchor');
 mkdirSync(d,{recursive:true});mkdirSync(c,{recursive:true});
 const L=join(d,'ledger.jsonl');const C=join(c,'cp.json');
 return { d,c,L,C,config(g, mode='initialize'){return {grant:g,confirmGrantHash:R.grantHash(g),
 ledgerPath:L,checkpointPath:C,checkpointMountPoint:distinct?T7_ROOT:undefined,mode};}};
}
const mock = async () => {
 const m={requests:[],onRequest:null};
 const server=http.createServer((req,res)=>{
  const b=[];req.on('data',x=>b.push(x));req.on('end',()=>{
   m.requests.push(Buffer.concat(b));
   m.onRequest?.();
   res.writeHead(200,{'content-type':'application/json'});res.end(JSON.stringify(full));
  });
 });
 await new Promise(done=>server.listen(0,'127.0.0.1',done));
 m.url='http://127.0.0.1:'+server.address().port+'/v1/systemone';
 m.close=()=>new Promise(done=>server.close(done));
 return m;
};
try {
 // E1: fake HTTP dependency can impersonate TypeSafe despite EXTERNAL_PINNED grant.
 {
  const s=stores('faux-remote',true);let mockInvocations=0, factories=0;
  const g=grant('https://api.typesafe.ai/v1/systemone',{network:'EXTERNAL_PINNED',
   volume_policy:'DISTINCT_DEVICES',max_attempts:1});
  const resp=await R.executeLiveRun(s.config(g),{credential:()=>'DUMMY-LOCAL-ONLY',
   createTransport:({endpoint,allowRemote})=>{
    factories++;
    if(endpoint!=='https://api.typesafe.ai/v1/systemone' || allowRemote!==true) throw new Error('NOT_PINNED');
    return {send:async()=>{mockInvocations++;return full;}};
   }});
  const r=W.createLedger(s.L,{experiment_id:g.experiment_id}).read();
  report({test:'E1-fake-transport-under-remote-grant',result_ran:resp.ran,
   recorded_observations:r.filter(x=>x.kind==='observed').length,simulated_transport_sends:mockInvocations,
   real_provider_sends:0,grant_network:g.network,can_claim_completed_attempt:resp.attempts[0]?.outcome==='ok'});
 }
 // E2: store disappears while local response is in flight; wrapper throws rather than structured refusal.
 {
  const s=stores('ledger-disappears');const m=await mock();
  let replaced=false; m.onRequest=()=>{
   renameSync(s.L,s.L+'.preserved');replaced=true;
  };
  const g=grant(m.url,{max_attempts:1});
  let value,thrown;
  try {value=await R.executeLiveRun(s.config(g),{credential:()=> 'DUMMY-LOCAL-ONLY'});}
  catch(e){thrown=e?.message||String(e);}
  report({test:'E2-ledger-disappears-mid-response',ledger_preserved:existsSync(s.L+'.preserved'),
   threw:typeof thrown==='string',thrown_code:thrown??null,structured_outcome:!!value,
   local_mock_requests:m.requests.length});
  await m.close();
 }
 // E3: storage path is swapped to same device after first settlement. Pair head is copied byte-for-byte.
 {
  const s=stores('device-swap',true);const m=await mock();
  const g=grant(m.url,{volume_policy:'DISTINCT_DEVICES',max_attempts:2});
  const shadow=join(sroot,'device-swap-shadow');mkdirSync(shadow);
  let switched=false;
  const now=()=>{
    if(!switched && existsSync(s.L) && existsSync(s.C)) {
      let records=[];
      try {records=W.createLedger(s.L,{experiment_id:g.experiment_id}).read();} catch {}
      if(records.filter(x=>x.kind==='settled').length===1 && records.at(-1)?.kind==='settled') {
        copyFileSync(s.C,join(shadow,'cp.json'));
        renameSync(s.c,s.c+'.preserved');
        symlinkSync(shadow,s.c,'dir');
        switched=true;
      }
    }
    return Date.now();
  };
  const got=await R.executeLiveRun(s.config(g),{now,credential:()=> 'DUMMY-LOCAL-ONLY'});
  const afterDevice=statSync(dirname(s.C)).dev;
  report({test:'E3-checkpoint-remapped-to-same-device-after-preflight',
   switched,transport_sends:m.requests.length,granted_device_policy:g.volume_policy,
   checkpoint_dev_at_end:afterDevice,ledger_dev:statSync(dirname(s.L)).dev,
   invariant_distinct:statSync(dirname(s.L)).dev!==afterDevice,
   stopped_reason:got.stopped_reason??null,reported_ran:got.ran});
  await m.close();
  // Return only disposable test symlink and T7 subdir to former state for safe cleanup
  if(switched) { rmSync(s.c); renameSync(s.c+'.preserved',s.c); }
 }
 // E4: minFreeBytes knob permits overriding the advertised 64MiB minimum.
 {
  const s=stores('free-space-setting');const x=R.checkStorage({ledgerPath:s.L,checkpointPath:s.C,
   volumePolicy:'SAME_DEVICE_MOCK_ONLY',minFreeBytes:0});
  const y=R.checkStorage({ledgerPath:s.L,checkpointPath:s.C,
   volumePolicy:'SAME_DEVICE_MOCK_ONLY',minFreeBytes:R.MIN_FREE_BYTES});
  report({test:'E4-zero-free-space-minimum-configuration',
   advertised_minimum:R.MIN_FREE_BYTES,override_zero_passes:x.every(z=>z.ok),
   default_preq_passes:y.every(z=>z.ok),source:'local test config only'});
 }
} finally {
 rmSync(sroot,{recursive:true,force:true});
 rmSync(troot,{recursive:true,force:true});
}
const data=JSON.stringify({head:'41caa8f79af488fd8ea82442fe3586f03b13d15e',
 tested_with_temporary_witnessed_gate:true,only_synthetic_local_interactions:true,
 no_TypeSafe_requests:true,no_real_credentials:true,rows},null,2)+'\n';
const bytes=Buffer.from(data);
await import('node:fs').then(fs=>fs.writeFileSync(OUT+'/independent-probes.json',bytes));
console.log('MEASUREMENT_COMPLETE sha256='+createHash('sha256').update(bytes).digest('hex'));
