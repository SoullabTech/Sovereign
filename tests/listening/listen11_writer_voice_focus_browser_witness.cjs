/** LISTEN-11: real protected Writer MaiaListen component, but ONLY inside fictional Next/PG facade.
 * The protected Writer source itself is untouched. LISTEN11_MODE=baseline|candidate;
 * baseline PASS documents an undesirable speech/music overlap, NOT product acceptance.
 * Candidate requires one source-owner-proposed requestAudioFocus('writers-listen') in
 * a disposable copy; no OpenAI API calls: test-only apiFetch supplies local synthetic WAV.
 * Never run against external/public origin, members or actual Writer source checkout.
 */
'use strict';
const { chromium, webkit }=require('playwright-core');
const engines={chromium:{executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',args:['--no-first-run','--disable-extensions','--disable-background-networking']},webkit:{}};
const base='http://127.0.0.1:43279';
const desired=process.env.LISTEN11_MODE;
if(!['baseline','candidate'].includes(desired))throw Error('LISTEN11_MODE must be baseline/candidate');
const results=[];
const check=(name,pass,info)=>{
 const p=!!pass;results.push({name,pass:p,details:info||''});
 if(!p)throw Error('FAILED '+name+' '+String(info||''));
};
(async()=>{
 for(const [engine,driver] of [['chromium',chromium],['webkit',webkit]]){
  let browser;
  let remote=[],jsErrors=[];
  try{
   browser=await driver.launch({headless:true,timeout:15000,...engines[engine]});
   const ctx=await browser.newContext({acceptDownloads:true});
   await ctx.addCookies([{name:'maia_session',value:'fictional-listen08-cookie-A',url:base}]);
   const page=await ctx.newPage();
   page.on('pageerror',e=>jsErrors.push(String(e)));
   page.on('request',r=>{const u=r.url();if(/^https?:/.test(u)&&!u.startsWith(base))remote.push(u);});
   await page.addInitScript(()=>{
     const Original=window.Audio;window.__listen11VoiceAudio=[];
     function Recorder(...a){const output=new Original(...a);window.__listen11VoiceAudio.push(output);return output;}
     Recorder.prototype=Original.prototype; window.Audio=Recorder;
   });
   const first=await page.goto(base+'/listen',{waitUntil:'load',timeout:25000});
   check(engine+':logged-in-listen-route',first.status()===200,String(first.status()));
   await page.getByRole('button',{name:/Listen to sound sketch/}).click();
   await page.locator('[data-listen10-state]').filter({hasText:'playing'}).waitFor({timeout:10000});
   check(engine+':music-playing-before-writer',await page.locator('[data-listen10-state]').textContent().then(x=>x.includes('playing')));
   await page.getByRole('navigation',{name:'Soullab'}).getByRole('link',{name:/Writer/}).click();
   await page.locator('[data-listen11-real-writer]').waitFor({timeout:10000});
   check(engine+':actual-writer-component-mounted',await page.getByRole('button',{name:'Listen to MAIA'}).count()===1);
   await page.getByRole('button',{name:'Listen to MAIA'}).click();
   await page.getByRole('button',{name:'Stop MAIA playback'}).waitFor({timeout:10000});
   try {
     await page.waitForFunction(()=>window.__listen11VoiceAudio && window.__listen11VoiceAudio.some(a=>!a.paused && a.readyState>1),null,{timeout:7000});
   } catch (e) {
     const writerButtons=await page.locator('[data-listen11-real-writer] button').allTextContents();
     const remoteVoice=await page.evaluate(()=>window.__listen11VoiceAudio?.length);
     console.log('WRITER_VOICE_WAIT_DIAGNOSTIC',JSON.stringify({writerButtons,remoteVoice,error:String(e)}));
     throw e;
   }
   const firstVoice=await page.evaluate(()=>window.__listen11VoiceAudio.map(a=>({paused:a.paused,readyState:a.readyState,currentTime:a.currentTime,src:a.src.split('/').pop()?.slice(0,40)})));
   const pauseExpected=desired==='candidate';
   const state=await page.locator('[data-listen10-state]').textContent();
   check(engine+':writer-to-music-audio-focus',pauseExpected?state.includes('paused'):state.includes('playing'),state);
   check(engine+':real-writer-playing-synthetic-voice',firstVoice.some(a=>!a.paused&&a.readyState>1),JSON.stringify(firstVoice));
   if(desired==='candidate'){
     await page.getByRole('button',{name:'Resume persistent music'}).click();
     await page.locator('[data-listen10-state]').filter({hasText:'playing'}).waitFor({timeout:8000});
     await page.getByRole('button',{name:'Listen to MAIA'}).waitFor({timeout:10000});
     const stopped=await page.evaluate(()=>window.__listen11VoiceAudio.map(a=>({paused:a.paused,src:a.src})));
     check(engine+':music-stops-writer-speech',stopped.every(a=>a.paused),JSON.stringify(stopped));
     await page.evaluate(()=>window.dispatchEvent(new Event('ws-stop-maia-reading')));
     await page.waitForTimeout(250);
     const afterEditing=await page.locator('[data-listen10-state]').textContent();
     check(engine+':editorial-scope-stop-does-not-pause-music',afterEditing.includes('playing'),afterEditing);
     await page.getByRole('button',{name:'Stop and clear persistent music'}).click();
     await page.waitForFunction(()=>{const d=document.querySelector('[data-listen10-persistent-dock]');return d&&d.style.display==='none'});
     check(engine+':explicit-stop-releases-music',true);
   }
   check(engine+':zero-remote-network',remote.length===0,JSON.stringify(remote));
   check(engine+':zero-page-errors',jsErrors.length===0,JSON.stringify(jsErrors));
   console.log('LISTEN11_'+engine.toUpperCase(),JSON.stringify({status:'PASS',mode:desired,checks:results.filter(x=>x.name.startsWith(engine+':')).length,writerAudio:firstVoice},null,2));
  }catch(e){console.error('LISTEN11_'+engine.toUpperCase()+'_ERROR',e.stack);process.exitCode=1;}
  finally{if(browser)await browser.close();}
 }
 console.log('LISTEN11_SUMMARY',JSON.stringify({mode:desired,passed:results.filter(x=>x.pass).length,total:results.length,failures:results.filter(x=>!x.pass)}));
})().catch(e=>{console.error(e);process.exitCode=1});
