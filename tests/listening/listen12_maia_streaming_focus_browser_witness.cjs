/** LISTEN-12: TEST-ONLY actual MAIA StreamingAudioQueue mounted in a fictional page with local WAV.
 * Source-owner queue patch is NOT admitted in protected MAIA code.
 * LISTEN12_MODE=baseline|candidate; baseline PASS proves an undesirable overlap.
 * Loopback 127.0.0.1:43279 only; no members/providers/microphone.
 */
'use strict';
const {chromium,webkit}=require('playwright-core');
const origin='http://127.0.0.1:43279';
const mode=process.env.LISTEN12_MODE;
if(!['baseline','candidate'].includes(mode))throw Error('LISTEN12_MODE=baseline|candidate required');
async function run(engine,driver){
 const checks=[],remote=[],errors=[];
 const check=(name,ok,detail)=>{checks.push({name,pass:!!ok,detail:detail||''});if(!ok)throw Error('FAIL '+name+' '+String(detail||''));};
 const opts=engine==='chromium'?{executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',args:['--disable-background-networking','--disable-extensions','--no-first-run']}:{};
 let b;
 try{
 b=await driver.launch({headless:true,...opts,timeout:18000});
 const ctx=await b.newContext();
 await ctx.addCookies([{name:'maia_session',value:'fictional-listen08-cookie-A',url:origin}]);
 const page=await ctx.newPage();
 page.on('pageerror',e=>errors.push(String(e)));
 page.on('request',r=>{const u=r.url();if(/^https?:/.test(u)&&!u.startsWith(origin))remote.push(u)});
 await page.addInitScript(()=>{
   window.__listen12Audio=[];
   const native=window.Audio;
   function Tracker(...args){const audio=new native(...args);window.__listen12Audio.push(audio);return audio}
   Tracker.prototype=native.prototype;
   window.Audio=Tracker;
   window.__listen12FocusRequests=[];
   window.addEventListener('soullab:audio-focus-request',e=>window.__listen12FocusRequests.push(e.detail?.source));
 });
 const response=await page.goto(origin+'/listen',{waitUntil:'load',timeout:25000});
 check('auth-room-200',response.status()===200,response.status());
 await page.getByRole('button',{name:/Listen to sound sketch/}).click();
 await page.locator('[data-listen10-state]').filter({hasText:'playing'}).waitFor({timeout:9000});
 check('music-playing-before-maia',await page.locator('[data-listen10-state]').textContent().then(t=>t.includes('playing')));
 await page.getByRole('navigation',{name:'Soullab'}).getByRole('link',{name:/House/}).click();
 await page.locator('[data-review-route="home"]').waitFor({timeout:12000});
 await page.getByRole('link',{name:'Open fictional MAIA voice playback'}).click();
 await page.locator('[data-review-route="maia"]').waitFor({timeout:12000});
 check('fake-maia-route-preserves-music',await page.locator('[data-listen10-state]').textContent().then(t=>t.includes('playing')));
 await page.evaluate(()=>window.dispatchEvent(new Event('maya-voice-start')));
 await page.waitForTimeout(100);
 check('maia-preplay-event-not-audio-focus',await page.locator('[data-listen10-state]').textContent().then(t=>t.includes('playing')));
 await page.getByRole('button',{name:'Start fictional MAIA speech'}).click();
 await page.waitForFunction(()=>window.__listen12Audio.some(a=>!a.paused&&a.readyState>1&&a.currentTime>0.10),null,{timeout:14000});
 const voice=await page.evaluate(()=>window.__listen12Audio.map(a=>({paused:a.paused,currentTime:a.currentTime,readyState:a.readyState})));
 check('actual-streaming-queue-wav-playing',voice.some(a=>!a.paused&&a.currentTime>0.10),JSON.stringify(voice));
 const state=await page.locator('[data-listen10-state]').textContent();
 check('music-state-during-maia',mode==='candidate'?state.includes('paused'):state.includes('playing'),state);
 const focus=await page.evaluate(()=>window.__listen12FocusRequests.filter(s=>s==='maia-voice').length);
 check('maia-focus-issued-only-when-audible',mode==='candidate'?focus===1:focus===0,String(focus));
 await page.getByRole('button',{name:'Stop fictional MAIA speech'}).click();
 await page.waitForTimeout(150);
 const after=await page.locator('[data-listen10-state]').textContent();
 check('voice-stop-does-not-autoresume-music',mode==='candidate'?after.includes('paused'):after.includes('playing'),after);
 check('no-unexpected-remote',remote.length===0,JSON.stringify(remote));
 check('no-unhandled-errors',errors.length===0,JSON.stringify(errors));
 console.log('LISTEN12_'+engine.toUpperCase(),JSON.stringify({mode,status:'PASS',passed:checks.length,focusRequests:focus,voice,results:checks,errors,remote},null,2));
 }catch(e){console.error('LISTEN12_'+engine.toUpperCase()+'_ERROR',e.stack);console.log('LISTEN12_'+engine.toUpperCase(),JSON.stringify({mode,status:'FAIL',passed:checks.filter(c=>c.pass).length,results:checks,errors,remote},null,2));process.exitCode=1;}
 finally{if(b)await b.close()}
}
(async()=>{await run('chromium',chromium);await run('webkit',webkit)})().catch(e=>{console.error(e);process.exitCode=1});
