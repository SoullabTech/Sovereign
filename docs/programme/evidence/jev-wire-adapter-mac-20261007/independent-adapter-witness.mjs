/** Reviewer measurements. Dummy credentials, loopback HTTP, and fresh synthetic stores only. */
import assert from 'node:assert/strict';
import http from 'node:http';
import { createHash } from 'node:crypto';
import { mkdtempSync,mkdirSync,readFileSync,writeFileSync,statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join,resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';
const repo=resolve(process.argv[2]); const out=resolve(process.argv[3]);
const root=mkdtempSync(join(tmpdir(),'jev-adapter-independent-SYNTHETIC-'));
const external=mkdtempSync(join('/Volumes/T7 Shield','jev-adapter-independent-SYNTHETIC-'));
assert.notEqual(statSync(root).dev,statSync(external).dev);
const sha=b=>createHash('sha256').update(b).digest('hex');
const paths=['scripts/builder/jev-wire-http-adapter-v1.mjs','scripts/builder/jev-wire-v1.mjs','scripts/builder/jev-wire-checkpoint-v1.mjs'];
const hashes=()=>Object.fromEntries(paths.map(p=>[p,sha(readFileSync(join(repo,p)))]));const before=hashes();
const AD=await import(pathToFileURL(join(repo,paths[0])));
const G=await import(pathToFileURL(join(repo,paths[1])));
const CK=await import(pathToFileURL(join(repo,paths[2])));
const {makeVariant}=await import(pathToFileURL(join(repo,'scripts/builder/__tests__/jev-wire-variant-lib.mjs')));
const v=makeVariant([],{witnessed:true});const W=await import(v.url);
const KEY='DUMMY-REVIEW-CREDENTIAL-NOT-A-REAL-KEY';
const GOOD={model:'jev-1.13.0',answers:{Q_RISK:{type:'noul',noul:0.25}},usage:{input_tokens:300,output_tokens:5}};
const rows=[];const add=r=>{rows.push(r);console.log(JSON.stringify(r));};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function server(handler){
 const s={requests:[],sockets:new Set(),connections:0};
 s.server=http.createServer((req,res)=>{const chunks=[];req.on('data',b=>chunks.push(b));req.on('end',()=>{const item={body:Buffer.concat(chunks),authorization:req.headers.authorization,url:req.url};s.requests.push(item);handler(req,res,item);});});
 s.server.on('connection',sock=>{s.connections++;s.sockets.add(sock);sock.on('close',()=>s.sockets.delete(sock));});
 await new Promise(r=>s.server.listen(0,'127.0.0.1',r));s.url='http://127.0.0.1:'+s.server.address().port+'/v1/systemone';
 s.close=()=>new Promise(r=>{for(const sock of s.sockets)sock.destroy();s.server.close(r);});return s;
}
const reply=res=>{res.writeHead(200,{'content-type':'application/json'});res.end(JSON.stringify(GOOD));};
const plan=W.planAttempt('F01');
// Direct callback failures must not expose dummy secret-bearing exception content.
{
 const s=await server((_q,r)=>reply(r));let error;let sync=false;
 try{let pending;try{pending=AD.createJevHttpTransport({endpoint:s.url,credential:()=>{throw new Error('lookup failed with '+KEY);}}).send(plan.bodyJson,{bodyHash:plan.bodyHash});}catch(e){sync=true;throw e;}await pending;}catch(e){error=e;}
 const leak=[String(error),JSON.stringify(error),String(error?.stack)].some(x=>x.includes(KEY));
 add({id:'E1-throwing-credential-callback',synchronous_throw:sync,closed_adapter_error:/^ADAPTER_[A-Z_]+$/.test(error?.message??''),dummy_credential_in_error:leak,requests:s.requests.length,connections:s.connections});await s.close();
}
// Check cancellation at the actual dispatch boundary after credential acquisition.
{
 const s=await server((_q,r)=>reply(r));const ac=new AbortController();let result,error;
 try{result=await AD.createJevHttpTransport({endpoint:s.url,credential:()=>{ac.abort();return KEY;},timeoutMs:500}).send(plan.bodyJson,{bodyHash:plan.bodyHash,signal:ac.signal});}catch(e){error=e.code??e.message;}
 add({id:'E2-abort-during-credential-acquisition',signal_aborted:ac.signal.aborted,requests:s.requests.length,connections:s.connections,response_returned:result!==undefined,error:error??null});await s.close();
}
// Invalid size configuration must not silently disable a claimed response bound.
for(const [label,limit] of [['NaN',NaN],['Infinity',Infinity]]){
 const s=await server((_q,r)=>{r.writeHead(200,{'content-type':'application/json'});r.end(JSON.stringify(GOOD)+' '.repeat(70000));});let result,error;
 try{result=await AD.createJevHttpTransport({endpoint:s.url,credential:KEY,maxResponseBytes:limit}).send(plan.bodyJson,{bodyHash:plan.bodyHash});}catch(e){error=e.code??e.message;}
 add({id:'E3-invalid-response-limit-'+label,configured_limit:label,requests:s.requests.length,response_bytes:Buffer.byteLength(JSON.stringify(GOOD))+70000,accepted:result!==undefined,error:error??null,scope:'explicit invalid configuration; default limit tested separately'});await s.close();
}
// Positive and negative controls for default cap and ordinary credentials.
{
 const s=await server((_q,r)=>{r.writeHead(200,{'content-type':'application/json'});r.end(JSON.stringify(GOOD)+' '.repeat(70000));});let code;
 try{await AD.createJevHttpTransport({endpoint:s.url,credential:KEY}).send(plan.bodyJson,{bodyHash:plan.bodyHash});}catch(e){code=e.code;}
 add({id:'CONTROL-default-size-cap',pass:code==='ADAPTER_RESPONSE_TOO_LARGE',code,requests:s.requests.length});await s.close();
}
// Independent 31-attempt composition with physical Mac/T7 separation and a local HTTP service.
{
 const d=join(root,'composition'),c=join(external,'composition');mkdirSync(d);mkdirSync(c);
 const L=join(d,'ledger.jsonl'),C=join(c,'anchor.json');const pair=()=>CK.createCheckpointedLedger(W.createLedger(L),C);pair().initialize();
 const checks=[];const s=await server((_q,res,item)=>{const records=W.createLedger(L).read(),last=records.at(-1),cp=JSON.parse(readFileSync(C));checks.push(last.kind==='reserved'&&last.hash===cp.head&&last.seq===cp.seq&&last.wire_body_hash===sha(item.body)&&item.authorization==='Bearer '+KEY);reply(res);});
 try{
  const transport=AD.createJevHttpTransport({endpoint:s.url,credential:KEY});let post=0;
  for(const id of W.fixtureAttemptIds()){const r=await W.runAttempt({attemptId:id,ledger:pair(),transport});assert.equal(r.outcome,'ok');const last=W.createLedger(L).read().at(-1),cp=JSON.parse(readFileSync(C));assert.equal(cp.head,last.hash);assert.equal(last.kind,'settled');post++;}
  const records=W.createLedger(L).read();const replay=await W.runAttempt({attemptId:'F01',ledger:pair(),transport});
  const beforeOff=s.requests.length;const off=await G.runAttempt({attemptId:'F02',ledger:{},transport});
  add({id:'CONTROL-31-local-http-Mac-T7',pass:s.requests.length===31&&checks.length===31&&checks.every(Boolean)&&post===31&&replay.sent===false&&off.sent===false,requests:s.requests.length,anchored_and_hash_equal_at_server:checks.filter(Boolean).length,anchored_completions:post,observations:records.filter(r=>r.kind==='observed').length,replay_reason:replay.reason,off_reason:off.reason,requests_through_committed_gate:s.requests.length-beforeOff,simulated_cost:W.createLedger(L).state().usd,ledger_device:statSync(L).dev,checkpoint_device:statSync(C).dev});
 }finally{await s.close();}
}
// The actual default 30-second adapter deadline, without using the runner's timer.
{
 const s=await server((_q,_r)=>{});const start=Date.now();let code;
 try{await AD.createJevHttpTransport({endpoint:s.url,credential:KEY}).send(plan.bodyJson,{bodyHash:plan.bodyHash});}catch(e){code=e.code;}
 const elapsed=Date.now()-start;await sleep(100);
 add({id:'CONTROL-default-30000ms-deadline',pass:code==='ADAPTER_TIMEOUT'&&elapsed>=29500&&elapsed<35000&&s.sockets.size===0,elapsed_ms:elapsed,code,requests:s.requests.length,server_sockets_after_grace:s.sockets.size,scope:'loopback headers stall, not DNS or TLS handshake'});await s.close();
}
assert.deepEqual(hashes(),before);
const result={observed_at:new Date().toISOString(),head:execFileSync('git',['rev-parse','HEAD'],{cwd:repo,encoding:'utf8'}).trim(),code_unchanged:true,source_sha256:before,credential:'dummy only',external_inference_requests:0,local_root:root,checkpoint_root:external,rows};
const bytes=JSON.stringify(result,null,2)+'\n';writeFileSync(join(out,'independent-adapter-results.json'),bytes,{mode:0o600});console.log('RESULT_SHA256='+sha(bytes));
console.log('MEASUREMENT_COMPLETE; exit 0 is completion, not acceptance. Inspect rows.');
