/** Reviewer measurement, fake transports and disposable fixtures only. Exit 0 means measurements completed. */
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,readFileSync,writeFileSync,existsSync,renameSync,statSync,unlinkSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {execFileSync,spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const repo=resolve(process.argv[2]);const out=resolve(process.argv[3]);
const sha=x=>createHash('sha256').update(x).digest('hex');
const sourcePaths=['scripts/builder/jev-wire-v1.mjs','scripts/builder/jev-wire-checkpoint-v1.mjs'];
const sourceBefore=Object.fromEntries(sourcePaths.map(p=>[p,sha(readFileSync(join(repo,p)))]));
const actual=await import(pathToFileURL(join(repo,sourcePaths[0])).href);
const CK=await import(pathToFileURL(join(repo,sourcePaths[1])).href);
const {makeVariant}=await import(pathToFileURL(join(repo,'scripts/builder/__tests__/jev-wire-variant-lib.mjs')).href);
const v=makeVariant([],{witnessed:true});const W=await import(v.url);
const checkpointParent=resolve(process.argv[4] ?? tmpdir());
const requireSeparateDevices=process.argv.includes('--require-distinct-devices');
if(requireSeparateDevices)assert.notEqual(statSync(checkpointParent).dev,statSync(tmpdir()).dev);
const local=mkdtempSync(join(tmpdir(),'jev-checkpoint-independent-SYNTHETIC-'));
const second=mkdtempSync(join(checkpointParent,'jev-checkpoint-independent-SYNTHETIC-'));
const good={model:'jev-1.13.0',answers:{Q_RISK:{type:'noul',noul:0.25}},usage:{input_tokens:300,output_tokens:12}};
const rows=[];const report=row=>{rows.push(row);console.log(JSON.stringify(row));};
function stores(name){
 const d=join(local,name);const c=join(second,name);mkdirSync(d);mkdirSync(c);
 const ledgerPath=join(d,'ledger.jsonl');const cpPath=join(c,'anchor.json');
 const open=(opts={})=>CK.createCheckpointedLedger(W.createLedger(ledgerPath),cpPath,opts);
 return{d,c,ledgerPath,cpPath,open};
}
// Real APFS volumes; all 31 dispatches are fake.
{
 const s=stores('normal');s.open().initialize();let sends=0;let preVerified=0;let postVerified=0;
 for(const id of W.fixtureAttemptIds()){
  const r=await W.runAttempt({attemptId:id,ledger:s.open(),transport:{send:async()=>{
   const recs=W.createLedger(s.ledgerPath).read();const last=recs.at(-1);const cp=JSON.parse(readFileSync(s.cpPath));
   assert.equal(last.kind,'reserved');assert.equal(last.hash,cp.head);assert.equal(last.seq,cp.seq);preVerified++;sends++;return good;
  }}});
  assert.equal(r.outcome,'ok');const last=W.createLedger(s.ledgerPath).read().at(-1);const cp=JSON.parse(readFileSync(s.cpPath));
  assert.equal(last.kind,'settled');assert.equal(cp.head,last.hash);assert.equal(r.ledger_head,last.hash);postVerified++;
 }
 let replaySends=0;const replay=await W.runAttempt({attemptId:'F01',ledger:s.open(),transport:{send:async()=>{replaySends++;return good;}}});
 report({id:'APFS-two-volume-normal-control',pass:sends===31&&preVerified===31&&postVerified===31&&replaySends===0&&s.open().verify().consistent,sends_fake:sends,reservations_verified_before_send:preVerified,outcomes_verified_after:postVerified,replay_reason:replay.reason,ledger_device:statSync(s.ledgerPath).dev,checkpoint_device:statSync(s.cpPath).dev});
}
// Unavailable checkpoint after reservation, preserved rename of disposable checkpoint directory only.
{
 const s=stores('reservation-outage');s.open().initialize();let sends=0;
 const r=await W.runAttempt({attemptId:'F01',ledger:s.open({hooks:{afterLedgerAppend:k=>{if(k==='reserved')renameSync(s.c,s.c+'.offline');}}}),transport:{send:async()=>{sends++;return good;}}});
 assert.equal(sends,0);renameSync(s.c+'.offline',s.c);
 const ahead=s.open().verify().ahead;s.open().resume();
 const next=await W.runAttempt({attemptId:'F02',ledger:s.open(),transport:{send:async()=>{sends++;return good;}}});
 report({id:'APFS-reservation-outage',pass:sends===0&&ahead===1&&next.reason==='UNRESOLVED_ATTEMPT',initial_reason:r.reason,next_reason:next.reason,fake_sends:sends,rename_simulation_not_volume_unmount:true});
}
// Crash at the real ledger-settlement/checkpoint boundary; check old stop repair through wrapper.
for(const condition of ['transport-error','malformed','model-drift','excess-usage']){
 const s=stores('stop-'+condition);s.open().initialize();
 const childCode=`import {appendFileSync} from 'node:fs';
 const W=await import(${JSON.stringify(v.url)}); const CK=await import(${JSON.stringify(pathToFileURL(join(repo,sourcePaths[1])).href)});
 const pair=CK.createCheckpointedLedger(W.createLedger(${JSON.stringify(s.ledgerPath)}),${JSON.stringify(s.cpPath)},{hooks:{afterLedgerAppend:k=>{if(k==='settled')process.exit(47);}}});
 const good=${JSON.stringify(good)};const condition=${JSON.stringify(condition)};
 await W.runAttempt({attemptId:'F01',ledger:pair,transport:{send:async()=>{
 appendFileSync(${JSON.stringify(join(s.d,'fake-send.txt'))},'F01 fake');
 if(condition==='transport-error')throw new Error('FAKE');
 if(condition==='malformed')return {invalid:true};
 if(condition==='model-drift')return {...good,model:'OTHER-SYNTHETIC-MODEL'};
 return {...good,usage:{input_tokens:200000,output_tokens:12}};
 }}});process.exit(48);`;
 const child=spawnSync(process.execPath,['--input-type=module','-e',childCode],{encoding:'utf8',timeout:5000});assert.equal(child.status,47,child.stderr);
 let sends=0;const fake={send:async()=>{sends++;return good;}};
 const locked=await W.runAttempt({attemptId:'F02',ledger:s.open(),transport:fake});assert.equal(locked.reason,'PAIR_LOCK_HELD');
 assert.equal(existsSync(s.ledgerPath+'.lock'),false);
 // Test-only simulation of manual stale-lock clearance, after confirmed child exit; never real runtime lock removal.
 unlinkSync(s.ledgerPath+'.pair.lock');
 const behind=await W.runAttempt({attemptId:'F02',ledger:s.open(),transport:fake});assert.equal(behind.reason,'PAIR_CHECKPOINT_BEHIND');
 s.open().resume();const next=await W.runAttempt({attemptId:'F02',ledger:s.open(),transport:fake});
 report({id:'APFS-checkpoint-stop-'+condition,pass:sends===0&&next.reason==='HALTED',child_exit:child.status,first_refusal:locked.reason,after_test_only_lock_clearance:behind.reason,after_explicit_resume:next.reason,next_fake_sends:sends});
}
// Loss of checkpoint BEFORE observed append. Does the returned status assert data that never reached the ledger?
for(const failure of ['checkpoint-missing','checkpoint-storage-unavailable','pair-lock-held']){
 const s=stores(failure);s.open().initialize();let sends=0;
 const r=await W.runAttempt({attemptId:'F01',ledger:s.open(),transport:{send:async()=>{
  sends++;
  if(failure==='checkpoint-missing')renameSync(s.cpPath,s.cpPath+'.preserved');
  if(failure==='checkpoint-storage-unavailable')renameSync(s.c,s.c+'.offline');
  if(failure==='pair-lock-held')writeFileSync(s.ledgerPath+'.pair.lock','REVIEWER_SYNTHETIC_HOLD\n',{flag:'wx'});
  return good;
 }}});
 const recs=W.createLedger(s.ledgerPath).read();const observed=recs.filter(x=>x.kind==='observed').length;
 let nextSends=0;const next=await W.runAttempt({attemptId:'F02',ledger:s.open(),transport:{send:async()=>{nextSends++;return good;}}});
 report({id:'observation-before-write-'+failure,returned_outcome:r.outcome,ledger_kinds:recs.map(x=>x.kind),observed_records:observed,misclassified_as_persisted:r.outcome==='observation_persisted_checkpoint_failed'&&observed===0,next_fake_sends:nextSends,next_reason:next.reason,all_original_synthetic_bytes_preserved:true});
}
// Input-layout validation: deliberately colliding scratch-only paths.
for(const collision of ['same-file','checkpoint-temp-is-ledger']){
 const d=join(local,collision);mkdirSync(d);
 const cpPath=join(d,'anchor.json');const ledgerPath=collision==='same-file'?cpPath:cpPath+'.tmp';
 const base=W.createLedger(ledgerPath);
 const beforeFiles=Object.fromEntries((await import('node:fs')).readdirSync(d).sort().map(n=>[n,sha(readFileSync(join(d,n)))]));
 let error=null;let stage='construction';try{const pair=CK.createCheckpointedLedger(base,cpPath);stage='initialization';pair.initialize();}catch(e){error=e.message;}
 const afterFiles=Object.fromEntries((await import('node:fs')).readdirSync(d).sort().map(n=>[n,sha(readFileSync(join(d,n)))]));
 let ledgerValid=false;let ledgerError=null;try{base.read();ledgerValid=true;}catch(e){ledgerError=e.message;}
 report({id:'placement-'+collision,rejected_at:stage,files_unchanged:JSON.stringify(beforeFiles)===JSON.stringify(afterFiles),initialize_error:error,initialization_returned_success:error===null,ledger_exists:existsSync(ledgerPath),ledger_valid:ledgerValid,ledger_error:ledgerError,cp_exists:existsSync(cpPath),unsafe_initialization_accepted:error===null&&!ledgerValid});
}
// Real committed off-switch remains closed.
let sends=0;const off=await actual.runAttempt({attemptId:'F01',ledger:{},transport:{send:async()=>{sends++;return good;}}});
assert.equal(sends,0);assert.equal(off.reason,'RESPONSE_SHAPE_UNWITNESSED');
const sourceAfter=Object.fromEntries(sourcePaths.map(p=>[p,sha(readFileSync(join(repo,p)))]));assert.deepEqual(sourceAfter,sourceBefore);
const result={observed_at:new Date().toISOString(),head:execFileSync('git',['rev-parse','HEAD'],{cwd:repo,encoding:'utf8'}).trim(),all_transports_fake:true,paid_calls:0,credentials_accessed:false,committed_gate_sends:sends,committed_gate_reason:off.reason,committed_source_unchanged:true,source_sha256:sourceAfter,synthetic_local_root:local,synthetic_checkpoint_root:second,distinct_devices:statSync(local).dev!==statSync(second).dev,require_separate_devices:requireSeparateDevices,witness_script_sha256:sha(readFileSync(new URL(import.meta.url))),rows};
const bytes=JSON.stringify(result,null,2)+'\n';writeFileSync(join(out,'independent-checkpoint-results.json'),bytes,{mode:0o600});
console.log('RESULT_SHA256='+sha(bytes));console.log('MEASUREMENT_COMPLETE: inspect individual rows; exit 0 is not all-case acceptance.');
