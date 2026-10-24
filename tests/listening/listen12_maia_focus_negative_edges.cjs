/** LISTEN-12: test-only failed-play, multi-chunk, and new-session focus edges.
 * Must use synthetic media, localhost-only Next/fictional-PG fixture,
 * and existing browser engines. Not a physical iPhone/voice permission test.
 */
'use strict';
const {chromium,webkit}=require('playwright-core');
const origin='http://127.0.0.1:43279';
async function checkEngine(engine,driver){
 let browser;
 const results=[],errors=[],remote=[];
 const check=(name,pass,detail)=>{const ok=Boolean(pass);results.push({name,pass:ok,detail:detail||''});if(!ok)throw Error('FAIL '+name+' '+String(detail||''))};
 try{
 browser=await driver.launch({headless:true,timeout:15000,...engine==='chromium'?{executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',args:['--no-first-run','--disable-extensions','--disable-background-networking']}:{}} );
 const ctx=await browser.newContext();
 await ctx.addCookies([{name:'maia_session',value:'fictional-listen08-cookie-A',url:origin}]);
 const page=await ctx.newPage();
 page.on('pageerror',e=>errors.push(String(e)));
 page.on('request',r=>{const url=r.url();if(/^https?:/.test(url)&&!url.startsWith(origin))remote.push(url)});
 await page.addInitScript(()=>{
  window.__maia12Audios=[];
  const AudioCtor=window.Audio;
  function WrappedAudio(...args){const a=new AudioCtor(...args);window.__maia12Audios.push(a);return a}
  WrappedAudio.prototype=AudioCtor.prototype;window.Audio=WrappedAudio;
  window.__maia12FocusRequests=[];
  window.addEventListener('soullab:audio-focus-request',e=>{window.__maia12FocusRequests.push(e.detail?.source)});
 });
 await page.goto(origin+'/listen',{waitUntil:'load'});
 await page.getByRole('button',{name:/Listen to sound sketch/}).click();
 await page.locator('[data-listen10-state]').filter({hasText:'playing'}).waitFor();
 await page.getByRole('navigation',{name:'Soullab'}).getByRole('link',{name:/House/}).click();
 await page.locator('[data-review-route="home"]').waitFor();
 await page.getByRole('link',{name:'Open fictional MAIA voice playback'}).click();
 await page.locator('[data-review-route="maia"]').waitFor();
 check('music-active-at-maia-entry',(await page.locator('[data-listen10-state]').textContent()).includes('playing'));
 await page.getByRole('button',{name:'Simulate failed MAIA audio'}).click();
 await page.waitForTimeout(450);
 const rejectedCount=await page.evaluate(()=>window.__maia12FocusRequests.filter(s=>s==='maia-voice').length);
 check('failed-tts-audio-claims-no-focus',rejectedCount===0,String(rejectedCount));
 check('failed-audio-does-not-stop-music',(await page.locator('[data-listen10-state]').textContent()).includes('playing'));
 await page.getByRole('button',{name:'Queue two fictional MAIA chunks'}).click();
 await page.waitForFunction(()=>window.__maia12Audios.some(a=>!a.paused&&a.readyState>1&&a.currentTime>0.15),null,{timeout:12000});
 await page.locator('[data-listen10-state]').filter({hasText:'paused'}).waitFor({timeout:6000});
 check('two-chunk-voice-pauses-music',true);
 await page.waitForFunction(()=>window.__maia12Audios.length>=3 && window.__maia12Audios[window.__maia12Audios.length-1].ended,{timeout:7000});
 const once=await page.evaluate(()=>window.__maia12FocusRequests.filter(s=>s==='maia-voice').length);
 check('multi-chunk-session-claims-focus-once',once===1,String(once));
 check('finished-voice-does-not-autoresume',(await page.locator('[data-listen10-state]').textContent()).includes('paused'));
 await page.getByRole('button',{name:'Resume persistent music'}).click();
 await page.locator('[data-listen10-state]').filter({hasText:'playing'}).waitFor({timeout:8000});
 check('explicit-member-music-resume',true);
 await page.getByRole('button',{name:'Start fictional MAIA speech'}).click();
 await page.waitForFunction(()=>window.__maia12FocusRequests.filter(s=>s==='maia-voice').length===2,{timeout:10000});
 await page.locator('[data-listen10-state]').filter({hasText:'paused'}).waitFor();
 check('next-voice-session-claims-fresh-focus',true);
 await page.getByRole('button',{name:'Stop fictional MAIA speech'}).click();
 check('no-remote-request',remote.length===0,JSON.stringify(remote));
 check('no-page-errors',errors.length===0,JSON.stringify(errors));
 console.log('LISTEN12_EDGE_'+engine.toUpperCase(),JSON.stringify({status:'PASS',passed:results.length,results,remote,errors},null,2));
 }catch(e){
 console.error('LISTEN12_EDGE_'+engine.toUpperCase()+'_ERROR',e.stack);
 console.log('LISTEN12_EDGE_'+engine.toUpperCase(),JSON.stringify({status:'FAIL',passed:results.filter(r=>r.pass).length,results,remote,errors},null,2));
 process.exitCode=1;
 }finally{if(browser)await browser.close()}
}
(async()=>{await checkEngine('chromium',chromium);await checkEngine('webkit',webkit)})().catch(e=>{console.error(e);process.exitCode=1});
