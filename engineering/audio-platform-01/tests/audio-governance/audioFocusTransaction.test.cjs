'use strict';
const {test} = require('node:test');
const assert = require('node:assert/strict');
const {prepareAudioOutput,startAudioWithFocus}=require('../../dist/lib/audio-governance/audioFocusTransaction.js');
const {
  policyIsSideEffectFree,decideAudioFocus,
}=require('../../dist/lib/audio-governance/platformAudioPolicy.js');

const output=(project='maia',activity='conversation-speech',initiatedBy='authorized-turn')=>
 ({project,activity,initiatedBy,instanceKey:'fictional-new-output'});
const active=(project='listening-room',activity='continuous-media',instanceKey='older-playing')=>
 ({project,activity,instanceKey,state:'playing'});
function syntheticAdapter(initial=[], options={}) {
 const events=[];
 let current=[...initial], leases=0, releases=0, observations=0, admissionCalls=0;
 return {
  events,
  get leases(){return leases},get releases(){return releases},get current(){return current},
  setCurrent:(x)=>{current=[...x]},
  async observe(){
   events.push('observe');observations++;
   if(options.throwAt==='observe')throw Error('synthetic read down');
   if(options.onObserve)await options.onObserve(observations,()=>current,(x)=>{current=x});
   return [...current];
  },
  async pauseAndConfirm(key){
   events.push('pause:'+key);
   if(options.throwAt==='pause')throw Error('synthetic player unavailable');
   if(options.pauseAck===false)return false;
   current=current.map(x=>x.instanceKey===key?{...x,state:'paused'}:x);
   if(options.afterPause)await options.afterPause({key,current,setCurrent:x=>{current=x}});
   return true;
  },
  async externallyAdmitted(){
   admissionCalls++; events.push('external-verification');
   if(options.throwAt==='external')throw Error('synthetic auth inaccessible');
   return options.externallyAdmitted?options.externallyAdmitted(admissionCalls):options.authorized!==false;
  },
  async claimOutput(){
   events.push('claim-exclusive-output');
   if(options.throwAt==='claim')throw Error('synthetic device busy');
   if(options.claimable===false)return null;
   leases++;
   return {release:async()=>{releases++;events.push('release-exclusive-output')}};
  },
 };
}

test('idle permitted speech acquires exactly one exclusive output lease, releases idempotently',async()=>{
 const adapter=syntheticAdapter(); const result=await prepareAudioOutput(output(),adapter);
 assert.equal(result.status,'ready');assert.equal(adapter.leases,1);
 assert.equal(adapter.events.filter(x=>x==='external-verification').length,3);
 assert.equal(policyIsSideEffectFree(result.decision),true);
 assert.ok(!adapter.events.some(x=>x.startsWith('pause:')));
 await result.release();await result.release();assert.equal(adapter.releases,1);
});

test('MAIA speaking pauses previous music and waits for actual ACK before lock',async()=>{
 const adapter=syntheticAdapter([active()]); const result=await prepareAudioOutput(output(),adapter);
 assert.equal(result.status,'ready');
 const pause=adapter.events.indexOf('pause:older-playing');
 const claim=adapter.events.indexOf('claim-exclusive-output');
 assert.ok(pause>=0&&claim>pause);
 assert.equal(adapter.current[0].state,'paused');
 assert.equal(adapter.leases,1);
 assert.equal(result.decision.verdict,'attempt'); // rechecked AFTER acknowledged pause
 await result.release();assert.equal(adapter.releases,1);
});

test('speaker never starts if old soundtrack does not confirm pause',async()=>{
 const adapter=syntheticAdapter([active()],{pauseAck:false});
 const result=await prepareAudioOutput(output(),adapter);
 assert.equal(result.status,'refused');assert.equal(result.reason,'pause-unconfirmed');
 assert.equal(adapter.leases,0);
});

test('an unreachable player never authorizes a new voice',async()=>{
 const adapter=syntheticAdapter([active()],{throwAt:'pause'});
 const x=await prepareAudioOutput(output(),adapter);
 assert.equal(x.status,'refused');assert.equal(x.reason,'runtime-error');assert.equal(adapter.leases,0);
});

test('a second MAIA/Writer speech cannot interrupt the current voice turn',async()=>{
 const adapter=syntheticAdapter([active('writers-studio','narration')]);
 const x=await prepareAudioOutput(output(),adapter);
 assert.equal(x.status,'refused');assert.equal(x.reason,'policy-deny');
 assert.equal(adapter.events.filter(x=>x.includes('claim')).length,0);
});

test('a private Pro Studio session is not interrupted by music',async()=>{
 const adapter=syntheticAdapter([active('pro-studio','live-session')]);
 const x=await prepareAudioOutput(output('listening-room','continuous-media','member'),adapter);
 assert.equal(x.status,'refused');assert.equal(x.reason,'policy-deny');assert.equal(adapter.leases,0);
});

test('mic capture remains an owner handoff and never touches output lock',async()=>{
 const adapter=syntheticAdapter([]);
 const x=await prepareAudioOutput(output('journals','microphone-capture','member'),adapter);
 assert.equal(x.status,'refused');assert.equal(x.reason,'owner-handoff');
 assert.deepEqual(adapter.events,['observe']);assert.equal(adapter.leases,0);
});

test('system/agent microphone start never reaches an audio driver',async()=>{
 const adapter=syntheticAdapter([]);
 const x=await prepareAudioOutput(output('maia','microphone-capture','system'),adapter);
 assert.equal(x.status,'refused');assert.equal(x.reason,'policy-deny');
 assert.deepEqual(adapter.events,['observe']);
});

test('external member/turn authority can refuse even when pure policy would allow',async()=>{
 const adapter=syntheticAdapter([],{authorized:false});
 const x=await prepareAudioOutput(output(),adapter);
 assert.equal(x.status,'refused');assert.equal(x.reason,'external-denial');
 assert.equal(adapter.leases,0);
});

test('external identity/consent revocation during transaction denies before lock claim',async()=>{
 const adapter=syntheticAdapter([],{externallyAdmitted:n=>n===1});
 const x=await prepareAudioOutput(output(),adapter);
 assert.equal(x.status,'refused');assert.equal(x.reason,'external-denial');
 assert.equal(adapter.leases,0);
});

test('external identity/consent revocation after lock claim releases the lock',async()=>{
 const adapter=syntheticAdapter([],{externallyAdmitted:n=>n<3});
 const x=await prepareAudioOutput(output(),adapter);
 assert.equal(x.status,'refused');assert.equal(x.reason,'external-denial');
 assert.equal(adapter.leases,1);assert.equal(adapter.releases,1);
});

test('a conflicting voice appears after first pause: refreshed policy rejects',async()=>{
 const adapter=syntheticAdapter([active()],{afterPause:({current,setCurrent})=>{
  setCurrent([...current,active('writers-studio','narration','new-turn')]);
 }});
 const x=await prepareAudioOutput(output(),adapter);
 assert.equal(x.status,'refused');assert.equal(x.reason,'stale-snapshot');
 assert.equal(adapter.leases,0);
});

test('new voice appears after lock claim: terminal revalidation releases lock',async()=>{
 const adapter=syntheticAdapter([],{onObserve:async(n,_,setCurrent)=>{
  if(n===3)setCurrent([active('writers-studio','narration','race')]);
 }});
 const x=await prepareAudioOutput(output(),adapter);
 assert.equal(x.status,'refused');assert.equal(x.reason,'stale-snapshot');
 assert.equal(adapter.leases,1);assert.equal(adapter.releases,1);
});

test('required WebLock/native output reservation unavailable means no playback',async()=>{
 const adapter=syntheticAdapter([],{claimable:false});
 const x=await prepareAudioOutput(output(),adapter);
 assert.equal(x.status,'refused');assert.equal(x.reason,'output-unavailable');
 assert.equal(adapter.leases,0);
});

test('broken adapter observe stops safely',async()=>{
 const adapter=syntheticAdapter([],{throwAt:'observe'});
 const x=await prepareAudioOutput(output(),adapter);
 assert.equal(x.status,'refused');assert.equal(x.reason,'runtime-error');
 assert.equal(adapter.leases,0);
});

test('broken external admission check stops safely',async()=>{
 const adapter=syntheticAdapter([],{throwAt:'external'});
 const x=await prepareAudioOutput(output(),adapter);
 assert.equal(x.status,'refused');assert.equal(x.reason,'runtime-error');
 assert.equal(adapter.leases,0);
});

test('broken lock adapter stops safely',async()=>{
 const adapter=syntheticAdapter([],{throwAt:'claim'});
 const x=await prepareAudioOutput(output(),adapter);
 assert.equal(x.status,'refused');assert.equal(x.reason,'runtime-error');
 assert.equal(adapter.leases,0);
});

test('playback cannot start without a confirmed exclusive output',async()=>{
 const adapter=syntheticAdapter([],{claimable:false});let started=0;
 const x=await startAudioWithFocus(output(),adapter,async()=>{started++;return true});
 assert.equal(x.status,'refused');assert.equal(started,0);
});

test('successful playback leaves lock held until explicit caller release',async()=>{
 const adapter=syntheticAdapter();let started=0;
 const x=await startAudioWithFocus(output(),adapter,async()=>{started++;return true});
 assert.equal(x.status,'playing');assert.equal(started,1);
 assert.equal(adapter.leases,1);assert.equal(adapter.releases,0);
 await x.release();await x.release();assert.equal(adapter.releases,1);
});

test('playback decoder refusal frees the lock',async()=>{
 const adapter=syntheticAdapter();
 const x=await startAudioWithFocus(output(),adapter,async()=>false);
 assert.equal(x.status,'refused');assert.equal(x.reason,'playback-failed');
 assert.equal(adapter.releases,1);
});

test('a thrown media play() also frees the lock',async()=>{
 const adapter=syntheticAdapter();
 const x=await startAudioWithFocus(output(),adapter,async()=>{throw Error('NotSupportedError')});
 assert.equal(x.status,'refused');assert.equal(x.reason,'playback-failed');
 assert.equal(adapter.releases,1);
});

test('switching to another Sound Sanctuary session pauses previous master mix',async()=>{
 const adapter=syntheticAdapter([active('sound-sanctuary','continuous-media','old-composition')]);
 const x=await prepareAudioOutput(output('sound-sanctuary','continuous-media','member'),adapter);
 assert.equal(x.status,'ready');
 assert.ok(adapter.events.includes('pause:old-composition'));
 await x.release();
});

test('all interrupted streams remain PAUSED; no restart callback exists in the policy/transaction port',async()=>{
 const adapter=syntheticAdapter([active('sound-sanctuary','continuous-media')]);
 const x=await prepareAudioOutput(output(),adapter);
 assert.equal(x.status,'ready');
 assert.equal(adapter.current[0].state,'paused');
 assert.ok(!('resume' in adapter));
 await x.release();
 assert.equal(adapter.current[0].state,'paused');
});

test('no raw recording, content, session tokens or member IDs are in the core decision',async()=>{
 const adapter=syntheticAdapter();
 const x=await prepareAudioOutput(output(),adapter);
 assert.equal(x.status,'ready');
 const txt=JSON.stringify(x.decision);
 for(const term of ['token','transcript','memberId','recordingBytes','birthChart','oauth','streamUrl'])
  assert.equal(txt.includes(term),false);
 await x.release();
});
