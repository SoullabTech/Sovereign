/** LISTEN-13 EXPECTED FAILURE WITNESS. A zero process exit means cross-tab
 * MAIA/music overlap was successfully REPRODUCED. It NEVER means release PASS.
 * Uses two same-origin browser tabs with only fictional TTS/identity.
 * Do not promote music/voice integration while this witness is UNSAFE.
 */
'use strict';
const {chromium,webkit}=require('playwright-core');
(async()=>{
 for(const [name,driver,options] of [
  ['CHROMIUM',chromium,{executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',args:['--no-first-run','--disable-extensions','--disable-background-networking','--disable-background-timer-throttling']}],
  ['WEBKIT',webkit,{}]
 ]){
 let b;
 try{
  b=await driver.launch({headless:true,...options});
  const c=await b.newContext();
  await c.addCookies([{name:'maia_session',value:'fictional-listen08-cookie-A',url:'http://127.0.0.1:43279'}]);
  const maia=await c.newPage();
  await maia.addInitScript(()=>{
   window.__voice=[];
   const Base=window.Audio;
   function Track(...args){const a=new Base(...args);window.__voice.push(a);return a}
   Track.prototype=Base.prototype;window.Audio=Track;
  });
  await maia.goto('http://127.0.0.1:43279/maia',{waitUntil:'load'});
  await maia.getByRole('button',{name:'Start fictional MAIA speech'}).click();
  await maia.waitForFunction(()=>window.__voice.some(a=>!a.paused&&a.currentTime>0.15),{timeout:10000});
  const other=await c.newPage();
  await other.goto('http://127.0.0.1:43279/listen',{waitUntil:'load'});
  await other.getByRole('button',{name:/Listen to sound sketch/}).click();
  await other.locator('[data-listen10-state]').filter({hasText:'playing'}).waitFor({timeout:10000});
  const t0=await maia.evaluate(()=>window.__voice.filter(a=>!a.paused).map(a=>a.currentTime));
  await other.waitForTimeout(400);
  const t1=await maia.evaluate(()=>window.__voice.filter(a=>!a.paused).map(a=>a.currentTime));
  const unsafe=t0.length>0&&t1.length>0&&t1.some((x,i)=>x>(t0[i]||0)+0.10);
  console.log('LISTEN13_CROSS_TAB_'+name,JSON.stringify({
    type:'NEGATIVE_WITNESS',musicSecondTabPlaying:true,maiaVoiceProgressedInFirstTab:unsafe,
    outcome:unsafe?'UNSAFE_OVERLAP_CONFIRMED':'NOT_REPRODUCED',
    voiceTimes:[t0,t1],notReleaseApproval:true
  }));
 }catch(e){console.log('LISTEN13_CROSS_TAB_'+name,JSON.stringify({type:'UNVERIFIED',error:String(e).slice(0,350)}))}
 finally{if(b)await b.close()}
 }
})().catch(e=>console.error(e));
