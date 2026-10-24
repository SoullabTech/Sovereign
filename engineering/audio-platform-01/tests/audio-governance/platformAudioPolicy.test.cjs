'use strict';
const {test} = require('node:test');
const assert = require('node:assert/strict');
const {
 AUDIO_PROJECTS,AUDIO_ACTIVITIES,PROJECT_AUDIO_CAPABILITIES,
 decideAudioFocus, policyIsSideEffectFree,
}=require('../../dist/lib/audio-governance/platformAudioPolicy.js');

const req=(project,activity,initiatedBy='member',instanceKey='new-local-output')=>
 ({project,activity,initiatedBy,instanceKey});
const active=(project,activity,instanceKey='older-local-output',state='playing')=>
 ({project,activity,instanceKey,state});

// This is preference evidence ONLY, not member/turn/media-license authorization.
const fixtures=[
 {name:'music enters an idle room', r:req('listening-room','continuous-media'), v:'attempt', reason:'idle'},
 {name:'Sound Sanctuary takes one internal mix output', r:req('sound-sanctuary','continuous-media'),v:'attempt',reason:'idle'},
 {name:'Writer member-started narration can prepare output',r:req('writers-studio','narration'),v:'attempt',reason:'idle'},
 {name:'MAIA opted-in response can prepare speech',r:req('maia','conversation-speech','authorized-turn'),v:'attempt',reason:'idle'},
 {name:'Jarvis can prepare member requested speech',r:req('jarvis','conversation-speech'),v:'attempt',reason:'idle'},
 {name:'Cabin local media can prepare output without cloud',r:req('cabin','continuous-media'),v:'attempt',reason:'idle'},
 {name:'Astrology spoken guidance is an optional output',r:req('astrology','guided-audio'),v:'attempt',reason:'idle'},
 {name:'Reader narration is a member-owned output',r:req('reader','narration'),v:'attempt',reason:'idle'},
 {name:'Journal readback narration may be requested',r:req('journals','narration'),v:'attempt',reason:'idle'},
 {name:'Pro Studio live session starts explicitly',r:req('pro-studio','live-session'),v:'attempt',reason:'idle'},
 {name:'House can start user requested ambience',r:req('house','continuous-media'),v:'attempt',reason:'idle'},
 {name:'Research can narrate a member-selected passage',r:req('research','narration'),v:'attempt',reason:'idle'},
 {name:'MAIA speech pauses an earlier album',r:req('maia','conversation-speech','authorized-turn'),a:[active('listening-room','continuous-media')],v:'pause-and-attempt',reason:'spoken-output-over-continuous',pause:['older-local-output']},
 {name:'Writer narration pauses Sound Sanctuary',r:req('writers-studio','narration'),a:[active('sound-sanctuary','continuous-media')],v:'pause-and-attempt',reason:'spoken-output-over-continuous'},
 {name:'Jarvis response pauses an audiobook',r:req('jarvis','conversation-speech','authorized-turn'),a:[active('reader','continuous-media')],v:'pause-and-attempt',reason:'spoken-output-over-continuous'},
 {name:'Cabin voice pauses ambient after consented start',r:req('cabin','conversation-speech','authorized-turn'),a:[active('cabin','continuous-media')],v:'pause-and-attempt',reason:'spoken-output-over-continuous'},
 {name:'Pro Studio professional session pauses background media',r:req('pro-studio','live-session'),a:[active('listening-room','continuous-media')],v:'pause-and-attempt',reason:'live-session-over-continuous'},
 {name:'A second music selection pauses the previous one',r:req('listening-room','continuous-media'),a:[active('sound-sanctuary','continuous-media')],v:'pause-and-attempt',reason:'explicit-user-switch'},
 {name:'Reader switches from soundscape to audiobook',r:req('reader','continuous-media'),a:[active('sound-sanctuary','continuous-media')],v:'pause-and-attempt',reason:'explicit-user-switch'},
 {name:'Sound Sanctuary changes its whole session output',r:req('sound-sanctuary','continuous-media'),a:[active('listening-room','continuous-media')],v:'pause-and-attempt',reason:'explicit-user-switch'},
 {name:'MAIA speech is protected from music started afterward',r:req('listening-room','continuous-media'),a:[active('maia','conversation-speech')],v:'deny',reason:'active-voice-turn'},
 {name:'Jarvis speech is protected from Sound Sanctuary',r:req('sound-sanctuary','continuous-media'),a:[active('jarvis','conversation-speech')],v:'deny',reason:'active-voice-turn'},
 {name:'Writer narration is protected from music',r:req('house','continuous-media'),a:[active('writers-studio','narration')],v:'deny',reason:'active-voice-turn'},
 {name:'Second voice cannot barge into a MAIA speech turn',r:req('jarvis','conversation-speech'),a:[active('maia','conversation-speech')],v:'deny',reason:'active-voice-turn'},
 {name:'Another narration cannot mix with spoken Writer text',r:req('reader','narration'),a:[active('writers-studio','narration')],v:'deny',reason:'active-voice-turn'},
 {name:'Real professional call cannot be interrupted by music',r:req('listening-room','continuous-media'),a:[active('pro-studio','live-session')],v:'deny',reason:'active-live-session'},
 {name:'Real professional call cannot be interrupted by MAIA',r:req('maia','conversation-speech','authorized-turn'),a:[active('pro-studio','live-session')],v:'deny',reason:'active-live-session'},
 {name:'Professional live session cannot interrupt another live session',r:req('pro-studio','live-session'),a:[active('pro-studio','live-session','other-pro-session')],v:'deny',reason:'active-live-session'},
 {name:'Professional session must hand off from ongoing voice',r:req('pro-studio','live-session'),a:[active('maia','conversation-speech')],v:'owner-handoff',reason:'active-voice-turn'},
 {name:'Active microphone must be handed off before music',r:req('house','continuous-media'),a:[active('maia','microphone-capture','mic1','capturing')],v:'owner-handoff',reason:'active-microphone-capture'},
 {name:'Active journal recording must be handed off before Jarvis voice',r:req('jarvis','conversation-speech','authorized-turn'),a:[active('journals','microphone-capture','mic2','capturing')],v:'owner-handoff',reason:'active-microphone-capture'},
 {name:'Mic request returns owner handoff not permission',r:req('maia','microphone-capture'),v:'owner-handoff',reason:'capture-requires-external-permission'},
 {name:'Journal capture returns owner handoff',r:req('journals','microphone-capture'),v:'owner-handoff',reason:'capture-requires-external-permission'},
 {name:'Pro Studio recording returns owner handoff',r:req('pro-studio','microphone-capture'),v:'owner-handoff',reason:'capture-requires-external-permission'},
 {name:'Cabin recording returns owner handoff',r:req('cabin','microphone-capture'),v:'owner-handoff',reason:'capture-requires-external-permission'},
 {name:'Background AI cannot open a microphone',r:req('maia','microphone-capture','authorized-turn'),v:'deny',reason:'not-member-initiated'},
 {name:'System cannot start a microphone',r:req('pro-studio','microphone-capture','system'),v:'deny',reason:'not-member-initiated'},
 {name:'AI cannot auto-start album',r:req('listening-room','continuous-media','authorized-turn'),v:'deny',reason:'not-member-initiated'},
 {name:'System cannot auto-start Sound Sanctuary',r:req('sound-sanctuary','continuous-media','system'),v:'deny',reason:'not-member-initiated'},
 {name:'Autonomous assistant cannot start a professional call',r:req('pro-studio','live-session','system'),v:'deny',reason:'not-member-initiated'},
 {name:'System cue cannot ring automatically by policy alone',r:req('house','ui-cue','system'),v:'deny',reason:'system-cues-require-opt-in'},
 {name:'AI-generated cue is not member requested',r:req('jarvis','ui-cue','authorized-turn'),v:'deny',reason:'system-cues-require-opt-in'},
 {name:'User-clicked UI cue can prepare idle output',r:req('house','ui-cue'),v:'attempt',reason:'idle'},
 {name:'A cue cannot interrupt a soundtrack',r:req('house','ui-cue'),a:[active('listening-room','continuous-media')],v:'deny',reason:'cue-not-allowed-to-interrupt'},
 {name:'An already active sound must not start twice',r:req('listening-room','continuous-media'),a:[active('listening-room','continuous-media','new-local-output')],v:'deny',reason:'already-active'},
 {name:'An old paused soundtrack is not an active conflict',r:req('listening-room','continuous-media'),a:[active('maia','conversation-speech','voice','paused')],v:'attempt',reason:'idle'},
 {name:'Multiple background players must all acknowledge pause',r:req('maia','conversation-speech','authorized-turn'),a:[active('listening-room','continuous-media','music1'),active('sound-sanctuary','continuous-media','sound1')],v:'pause-and-attempt',reason:'spoken-output-over-continuous',pause:['music1','sound1']},
 {name:'A second voice is rejected even if ambient is also active',r:req('jarvis','conversation-speech'),a:[active('maia','conversation-speech','voice1'),active('house','continuous-media','music1')],v:'deny',reason:'active-voice-turn'},
 {name:'A live session is protected even with other music',r:req('maia','conversation-speech'),a:[active('pro-studio','live-session','live'),active('sound-sanctuary','continuous-media','music')],v:'deny',reason:'active-live-session'},
 {name:'Astrology cannot quietly start a microphone',r:req('astrology','microphone-capture'),v:'deny',reason:'project-capability-not-admitted'},
 {name:'Research cannot stream a live call by accident',r:req('research','live-session'),v:'deny',reason:'project-capability-not-admitted'},
 {name:'Listening Room cannot start MAIA speech as another owner',r:req('listening-room','conversation-speech'),v:'deny',reason:'project-capability-not-admitted'},
 {name:'Sound Sanctuary cannot demand microphone by default',r:req('sound-sanctuary','microphone-capture'),v:'deny',reason:'project-capability-not-admitted'},
 {name:'House cannot invent professional live session',r:req('house','live-session'),v:'deny',reason:'project-capability-not-admitted'},
 {name:'A system cannot voice astrology automatically',r:req('astrology','narration','system'),v:'deny',reason:'requires-authorized-turn'},
 {name:'System may not automatically narrate a private journal',r:req('journals','narration','system'),v:'deny',reason:'requires-authorized-turn'},
 {name:'Two reports must not share the same active instance',r:req('reader','narration','member','same'),a:[active('reader','narration','same')],v:'deny',reason:'already-active'},
];

for(const f of fixtures){
 test(f.name,()=>{
   const decision=decideAudioFocus(f.r,f.a||[]);
   assert.equal(decision.verdict,f.v,JSON.stringify(f.r));
   assert.equal(decision.reason,f.reason);
   assert.equal(policyIsSideEffectFree(decision),true);
   assert.equal(Object.isFrozen(decision),true);
   assert.equal(Object.isFrozen(decision.pauseInstanceKeys),true);
   assert.equal(decision.grantsMediaRights,false);
   assert.equal(decision.grantsIdentityOrTurnAuthority,false);
   assert.equal(decision.grantsMicrophonePermission,false);
   assert.equal(decision.automaticResume,false);
   if(f.pause)assert.deepEqual(decision.pauseInstanceKeys,f.pause);
   if(f.v==='attempt'||f.v==='pause-and-attempt')assert.equal(decision.requiresOutputLease,true);
   else assert.equal(decision.requiresOutputLease,false);
 });
}

test('all project capabilities are explicit and no project accepts every activity',()=>{
 assert.equal(AUDIO_PROJECTS.length,12);
 for(const p of AUDIO_PROJECTS){
  assert.ok(Array.isArray(PROJECT_AUDIO_CAPABILITIES[p]));
  assert.ok(PROJECT_AUDIO_CAPABILITIES[p].length>0);
  assert.ok(PROJECT_AUDIO_CAPABILITIES[p].length<AUDIO_ACTIVITIES.length);
 }
 assert.deepEqual(Object.keys(PROJECT_AUDIO_CAPABILITIES),[...AUDIO_PROJECTS]);
});

test('all focus decisions are mere preferences, never media rights or capture grants',()=>{
 for(const p of AUDIO_PROJECTS)for(const activity of AUDIO_ACTIVITIES){
  for(const initiator of ['member','authorized-turn','system']){
   const result=decideAudioFocus(req(p,activity,initiator),[]);
   assert.equal(policyIsSideEffectFree(result),true);
  }
 }
});

test('runtime validation refuses unknown projects, forged activities, malformed actor IDs and invalid sessions',()=>{
 for(const evil of [
  [null,[]],
  [{...req('house','continuous-media'),project:'another-project'},[]],
  [{...req('house','continuous-media'),activity:'force-allow'},[]],
  [{...req('house','continuous-media'),initiatedBy:'cloud-worker'},[]],
  [{...req('house','continuous-media'),instanceKey:''},[]],
  [{...req('house','continuous-media'),instanceKey:'x'.repeat(97)},[]],
  [req('house','continuous-media'),null],
  [req('house','continuous-media'),[active('house','continuous-media','old','forged-active')]],
  [req('house','continuous-media'),[{...active('house','continuous-media'),project:'unknown'}]],
  [req('house','continuous-media'),[{...active('house','continuous-media'),instanceKey:''}]],
 ]){
  const x=decideAudioFocus(...evil);
  assert.equal(x.verdict,'deny');assert.equal(x.reason,'invalid-policy-input');
 }
});

test('paused input is not a current mic capture, active input is an owner handoff',()=>{
 const r=req('listening-room','continuous-media');
 assert.equal(decideAudioFocus(r,[active('journals','microphone-capture','mic','paused')]).verdict,'attempt');
 assert.equal(decideAudioFocus(r,[active('journals','microphone-capture','mic','capturing')]).verdict,'owner-handoff');
});

test('policy results cannot mutate caller request or active registry',()=>{
 const r=req('maia','conversation-speech','authorized-turn');const a=[active('house','continuous-media','sound')];
 const saved=JSON.stringify([r,a]);const x=decideAudioFocus(r,a);
 assert.equal(JSON.stringify([r,a]),saved);
 assert.equal(x.pauseInstanceKeys[0],'sound');
});
console.log('FOCUS_CASES',fixtures.length);
