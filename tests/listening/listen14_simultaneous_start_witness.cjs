/** LISTEN-14: FICTIONAL BROWSER REHEARSAL ONLY. Requires Next/PG localhost fixture.
 * Not actual Soullab member audio, production release or iPhone acceptance.
 */
'use strict';
const {chromium,webkit}=require('playwright-core');
const ROOT='http://127.0.0.1:43281';
async function run(name,browserType,launchOptions){
 let browser;
 const trials=[];
 try{
  browser=await browserType.launch({headless:true,...launchOptions});
  const ctx=await browser.newContext();
  await ctx.addCookies([{name:'maia_session',value:'fictional-listen08-cookie-A',url:ROOT}]);
  for(let i=0;i<5;i++){
   const voice=await ctx.newPage();
   await voice.addInitScript(()=>{
     window.__raceVoice=[];
     const Base=window.Audio;
     function W(...a){const x=new Base(...a);window.__raceVoice.push(x);return x}
     W.prototype=Base.prototype;window.Audio=W;
   });
   await voice.goto(ROOT+'/maia',{waitUntil:'load'});
   const music=await ctx.newPage();
   const errors=[];music.on('pageerror',e=>errors.push(String(e)));
   await music.goto(ROOT+'/listen',{waitUntil:'load'});
   await Promise.all([
     voice.getByRole('button',{name:'Start fictional MAIA speech'}).click(),
     music.getByRole('button',{name:/Listen to sound sketch/}).click()
   ]);
   await voice.waitForFunction(()=>window.__raceVoice.some(a=>!a.paused&&a.currentTime>0.12),null,{timeout:9500});
   const playingVoice=await voice.evaluate(()=>window.__raceVoice.some(a=>!a.paused&&a.currentTime>0.12));
   const musicState=await music.locator('[data-listen10-state]').textContent();
   const unsafe=playingVoice&&musicState.includes('playing');
   trials.push({trial:i+1,voice:playingVoice,music:musicState.includes('playing'),overlap:unsafe,pageErrors:errors});
   if(unsafe||errors.length)throw Error('Overlapping speech/music simultaneous trial '+(i+1)+' '+JSON.stringify(trials.at(-1)));
   await voice.close();await music.close();
  }
  console.log('LISTEN14_RACE_'+name.toUpperCase(),JSON.stringify({status:'PASS',trials:trials.length,unsafeOverlaps:0,details:trials},null,2));
 }catch(e){
  console.error('LISTEN14_RACE_'+name.toUpperCase()+'_ERROR',e.stack);
  console.log('LISTEN14_RACE_'+name.toUpperCase(),JSON.stringify({status:'FAIL',trials:trials.length,details:trials},null,2));
  process.exitCode=2;
 }finally{if(browser)await browser.close()}
}
(async()=>{
await run('chromium',chromium,{executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',args:['--no-first-run','--disable-extensions','--disable-background-networking','--disable-background-timer-throttling']});
await run('webkit',webkit,{});
})().catch(e=>{console.error(e);process.exitCode=2});
