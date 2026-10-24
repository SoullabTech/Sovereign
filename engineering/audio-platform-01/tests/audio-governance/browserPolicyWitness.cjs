/** AUDIO-PLATFORM-01 · Pure policy Chrome/WebKit compatibility, fictional only.
 * No actual player, capture, voice, member credentials or network.
 */
'use strict';
const {chromium,webkit}=require('playwright-core');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const url=pathToFileURL(path.resolve(__dirname,'../../browser-policy.html')).href;
const req=(project,activity,initiatedBy='member')=>({project,activity,initiatedBy,instanceKey:'fictional-new'});
const old=(project,activity,state='playing')=>({project,activity,state,instanceKey:'fictional-old'});
(async()=>{
 for(const [name,type,config] of [
  ['chrome',chromium,{executablePath:process.env.CHROME_BIN||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',args:['--no-first-run','--disable-extensions','--disable-background-networking']}],
  ['webkit',webkit,{}],
 ]){
  let browser;
  try{
   browser=await type.launch({headless:true,...config});
   const page=await browser.newPage(),errors=[],remote=[];
   page.on('pageerror',e=>errors.push(String(e)));
   page.on('request',r=>{if(/^https?:/.test(r.url()))remote.push(r.url())});
   await page.goto(url,{waitUntil:'load'});
   const checks=await page.evaluate(()=>{
     const p=window.AudioPolicy;const r=(proj,act,origin='member')=>({project:proj,activity:act,initiatedBy:origin,instanceKey:'new'});const a=(proj,act,state='playing')=>({project:proj,activity:act,state,instanceKey:'old'});
     return [
      ['policy exports',typeof p.decideAudioFocus==='function'],
      ['12 project groups',p.AUDIO_PROJECTS.length===12],
      ['spoken MAIA pauses ambient',p.decideAudioFocus(r('maia','conversation-speech','authorized-turn'),[a('listening-room','continuous-media')]).verdict==='pause-and-attempt'],
      ['music denied during MAIA speech',p.decideAudioFocus(r('listening-room','continuous-media'),[a('maia','conversation-speech')]).verdict==='deny'],
      ['private Pro call protected',p.decideAudioFocus(r('jarvis','conversation-speech'),[a('pro-studio','live-session')]).verdict==='deny'],
      ['Sound Sanctuary member starts',p.decideAudioFocus(r('sound-sanctuary','continuous-media'),[]).verdict==='attempt'],
      ['Writer narration pauses soundtrack',p.decideAudioFocus(r('writers-studio','narration'),[a('listening-room','continuous-media')]).verdict==='pause-and-attempt'],
      ['mic recording handoff required',p.decideAudioFocus(r('journals','microphone-capture'),[]).verdict==='owner-handoff'],
      ['autonomous microphone refused',p.decideAudioFocus(r('maia','microphone-capture','system'),[]).verdict==='deny'],
      ['no surprise music autoplay',p.decideAudioFocus(r('listening-room','continuous-media','authorized-turn'),[]).verdict==='deny'],
      ['Cabin offline profile in shared policy',p.PROJECT_AUDIO_CAPABILITIES.cabin.includes('continuous-media')],
      ['invalid model activity rejected',p.decideAudioFocus(r('house','self-authorized-mic'),[]).verdict==='deny'],
      ['no mic grants',!p.decideAudioFocus(r('maia','conversation-speech'),[]).grantsMicrophonePermission],
      ['no music rights grants',!p.decideAudioFocus(r('listening-room','continuous-media'),[]).grantsMediaRights],
      ['no automatic resumption',!p.decideAudioFocus(r('reader','narration'),[]).automaticResume],
      ['explicit output lease required',p.decideAudioFocus(r('reader','narration'),[]).requiresOutputLease],
     ];
   });
   const passed=checks.filter(([,ok])=>ok).length;
   console.log(JSON.stringify({engine:name,status:passed===checks.length&&!errors.length&&!remote.length?'PASS':'FAIL',passed,total:checks.length,errors,remote},null,2));
   if(passed!==checks.length||errors.length||remote.length)process.exitCode=2;
  }catch(e){console.error(name,'BROWSER_FAILURE',e.stack);process.exitCode=2}
  finally{if(browser)await browser.close()}
 }
})().catch(e=>{console.error(e);process.exitCode=2});
