/** LISTEN-14: FICTIONAL BROWSER REHEARSAL ONLY. Requires Next/PG localhost fixture.
 * Not actual Soullab member audio, production release or iPhone acceptance.
 */
'use strict';
const {chromium,webkit}=require('playwright-core');
const ORIGIN='http://127.0.0.1:43281';
const name=process.env.LISTEN14_ENGINE||'chromium';
const launcher=name==='webkit'?webkit:chromium;
const options=name==='webkit'?{}:{executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',args:['--no-first-run','--disable-extensions','--disable-background-networking','--disable-background-timer-throttling']};
(async()=>{
let browser,checks=[],errors=[],remote=[];
const check=(name,pass,detail)=>{checks.push({name,pass:!!pass,detail});if(!pass)throw Error('FAILED '+name+' '+JSON.stringify(detail));};
const watch=(p)=>{p.on('pageerror',e=>errors.push(String(e)));p.on('request',r=>{if(/^https?:/.test(r.url())&&!r.url().startsWith(ORIGIN))remote.push(r.url())});};
const spy=async(p)=>p.addInitScript(()=>{
  window.__listen14VoiceAudios=[];
  const Base=window.Audio;
  function AudioSpy(...args){const a=new Base(...args);window.__listen14VoiceAudios.push(a);return a}
  AudioSpy.prototype=Base.prototype;window.Audio=AudioSpy;
});
const voiceIsAudible=()=>window.__listen14VoiceAudios.some(a=>!a.paused&&a.readyState>1&&a.currentTime>0.13);
const speak=async(p)=>{await p.getByRole('button',{name:'Start fictional MAIA speech'}).click();await p.waitForFunction(voiceIsAudible,null,{timeout:14000})};
const musicButton=(p)=>p.getByRole('button',{name:/Listen to sound sketch/});
try{
 browser=await launcher.launch({headless:true,timeout:18000,...options});
 const ctx=await browser.newContext();
 await ctx.addCookies([{name:'maia_session',value:'fictional-listen08-cookie-A',url:ORIGIN}]);
 const A=await ctx.newPage();watch(A);await spy(A);
 await A.goto(ORIGIN+'/maia',{waitUntil:'load'});
 check('locks-and-channel-enabled-in-browser',await A.evaluate(()=>!!navigator.locks?.request && !!BroadcastChannel));
 await speak(A);
 const B=await ctx.newPage();watch(B);
 await B.goto(ORIGIN+'/listen',{waitUntil:'load'});
 await musicButton(B).click();
 await B.waitForTimeout(210);
 const duringSpeech=await B.evaluate(()=>({playing:document.querySelector('[data-listen10-state]')?.textContent?.includes('playing'),visible:document.querySelector('[data-listen10-persistent-dock]')?.style.display,hero:document.querySelector('.play')?.textContent||''}));
 check('late-join-music-refused-while-voice-active',duringSpeech.playing!==true,duringSpeech);
 check('voice-still-running-after-music-refusal',await A.evaluate(voiceIsAudible));
 await A.getByRole('button',{name:'Stop fictional MAIA speech'}).click();
 await musicButton(B).click();
 await B.locator('[data-listen10-state]').filter({hasText:'playing'}).waitFor({timeout:8500});
 check('music-allowed-after-maia-stop',true);
 await speak(A);
 await B.locator('[data-listen10-state]').filter({hasText:'paused'}).waitFor({timeout:8500});
 check('maia-preempts-other-tab-music-before-speaking',await A.evaluate(voiceIsAudible));
 const previous=await B.locator('[data-listen10-state]').textContent();
 check('other-tab-music-paused',previous.includes('paused'),previous);
 await A.getByRole('button',{name:'Stop fictional MAIA speech'}).click();
 await B.getByRole('button',{name:'Resume persistent music'}).click();
 await B.locator('[data-listen10-state]').filter({hasText:'playing'}).waitFor({timeout:8500});
 check('member-restarts-music-after-voice-stops',true);
 const C=await ctx.newPage();watch(C);await C.goto(ORIGIN+'/listen',{waitUntil:'load'});
 await musicButton(C).click();
 await C.locator('[data-listen10-state]').filter({hasText:'playing'}).waitFor({timeout:9000});
 await B.locator('[data-listen10-state]').filter({hasText:'paused'}).waitFor({timeout:9000});
 check('other-music-tab-yields-focus',true);
 await C.getByRole('button',{name:'Stop and clear persistent music'}).click();
 await speak(A);
 await musicButton(B).click();
 await B.waitForTimeout(160);
 check('busy-voice-still-refuses-new-music',!(await B.locator('[data-listen10-state]').textContent()).includes('playing'));
 await A.close();
 await B.getByRole('button',{name:/Listen to sound sketch|Resume persistent music/}).first().click();
 await B.locator('[data-listen10-state]').filter({hasText:'playing'}).waitFor({timeout:9000});
 check('abruptly-closed-voice-tab-releases-web-lock',true);
 await B.getByRole('button',{name:'Stop and clear persistent music'}).click();
 check('no-js-errors',errors.length===0,errors);
 check('no-external-requests',remote.length===0,remote);
 console.log('LISTEN14_CROSS_TAB_'+name.toUpperCase(),JSON.stringify({status:'PASS',checks:checks.length,results:checks,errors,remote},null,2));
}catch(e){console.error('LISTEN14_CROSS_TAB_'+name.toUpperCase()+'_ERROR',e.stack);console.log('LISTEN14_CROSS_TAB_'+name.toUpperCase(),JSON.stringify({status:'FAIL',passed:checks.filter(x=>x.pass).length,results:checks,errors,remote},null,2));process.exitCode=2}
finally{if(browser)await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=2});
