/** LISTEN-10 · Execute with Playwright core and preinstalled Chromium/WebKit.
 * An isolated Next fixture must be running with only fictional sessions, a
 * test-only local audio file, and a test-only persistent root layout. The
 * script cannot run against a remote or production origin. Not iPhone proof.
 */
'use strict';
const {chromium,webkit}=require('playwright-core');
const ROOT=process.env.LISTEN10_TEST_ORIGIN||'http://127.0.0.1:43279';
if(!/^http:\/\/127\.0\.0\.1:\d+$/.test(ROOT))throw Error('Only a fictional localhost origin is permitted.');
const FLAC=process.env.LISTEN10_TEST_FLAC;
if(!FLAC)throw Error('LISTEN10_TEST_FLAC must point to a fictional generated audio file.');
const cookie={name:'maia_session',value:'fictional-listen08-cookie-A',url:ROOT};
const fixture={
  chromium:{executablePath:process.env.CHROME_BIN||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'},
  webkit:{},
};
(async()=>{
 for(const [engine,driver] of [['chromium',chromium],['webkit',webkit]]){
  const results=[];
  const check=async(name,fn)=>{
    const value=await fn();
    const pass=!!value;
    results.push({name,pass,detail:pass?undefined:JSON.stringify(value)});
    if(!pass)throw Error('FAILED '+name+' '+JSON.stringify(value));
  };
  let browser;
  const errors=[],outside=[];
  try{
   browser=await driver.launch({headless:true,...fixture[engine],timeout:18000,args:engine==='chromium'?['--no-first-run','--disable-extensions','--disable-background-networking']:undefined});
   const context=await browser.newContext({acceptDownloads:true});
   await context.addCookies([cookie]);
   const page=await context.newPage();
   page.on('pageerror',e=>errors.push(String(e)));
   page.on('request',r=>{const u=r.url();if(/^https?:/.test(u)&&!u.startsWith(ROOT))outside.push(u)});
   await page.addInitScript(()=>{
     window.__check_root_version=Math.random();
     const Base=window.AudioContext;
     if(Base)window.AudioContext=class extends Base {
       constructor(...args){super(...args);window.__lastAudioContext=this}
     };
   });
   await page.goto(ROOT+'/listen',{waitUntil:'networkidle',timeout:25000});
   await page.locator('h1').waitFor();
   await check('room-authenticated',()=>page.locator('h1').textContent().then(t=>t==='The Blue Hour'));
   const startMarker=await page.evaluate(()=>window.__check_root_version);
   await page.getByRole('button',{name:/Listen to sound sketch/}).click();
   await page.locator('[data-listen10-title]').waitFor();
   await check('dock-started',()=>page.locator('[data-listen10-state]').textContent().then(x=>x.includes('playing')));
   const state0=await page.evaluate(()=>window.__lastAudioContext?.state);
   await check('web-audio-context-running',()=>Promise.resolve(state0==='running'));
   await page.getByRole('navigation',{name:'Soullab'}).getByRole('link',{name:/House/}).click();
   await page.locator('[data-review-route="home"]').waitFor();
   await check('house-navigation-hydrated',()=>page.locator('h1').textContent().then(t=>t==='Fictional Soullab House'));
   await check('browser-document-not-reloaded',()=>page.evaluate(x=>window.__check_root_version===x,startMarker));
   await check('player-retained-across-room',()=>page.locator('[data-listen10-state]').textContent().then(x=>x.includes('playing')));
   await check('audio-context-still-running',()=>page.evaluate(()=>window.__lastAudioContext?.state==='running'));
   await page.getByRole('link',{name:/Return to Listening Room/}).click();
   await page.locator('#listen-title').waitFor();
   await check('return-room-playing-state',()=>page.getByRole('button',{name:/Pause sound sketch/}).count().then(n=>n>0));
   await page.getByRole('navigation',{name:'Soullab'}).getByRole('link',{name:/Writer/}).click();
   await page.locator('[data-review-route="writer"]').waitFor();
   await check('writer-placeholder-keeps-sound',()=>page.locator('[data-listen10-state]').textContent().then(x=>x.includes('playing')));
   await page.getByRole('button',{name:'Simulate Writer Listen requesting audio'}).click();
   await check('writer-audio-focus-pauses',()=>page.locator('[data-listen10-state]').textContent().then(x=>x.includes('paused')));
   await page.waitForFunction(()=>window.__lastAudioContext?.state==='suspended',{timeout:6500});
   await check('writer-audio-focus-suspends-audiocontext',()=>page.evaluate(()=>window.__lastAudioContext?.state==='suspended'));
   await page.getByRole('button',{name:'Resume persistent music'}).click();
   await page.locator('[data-listen10-state]').filter({hasText:'playing'}).waitFor({timeout:6500});
   await check('member-explicit-resume',()=>page.locator('[data-listen10-state]').textContent().then(x=>x.includes('playing')));
   const second=await context.newPage();
   await second.goto(ROOT+'/listen',{waitUntil:'networkidle'});
   await second.getByRole('button',{name:/Listen to sound sketch/}).click();
   await second.locator('[data-listen10-title]').waitFor();
   await page.waitForTimeout(350);
   await check('cross-tab-focus-paused-original',()=>page.locator('[data-listen10-state]').textContent().then(x=>x.includes('paused')));
   await check('cross-tab-second-playing',()=>second.locator('[data-listen10-state]').textContent().then(x=>x.includes('playing')));
   await second.getByRole('button',{name:'Stop and clear persistent music'}).click();
   await check('cross-tab-second-stopped',()=>second.locator('[data-listen10-persistent-dock]').getAttribute('style').then(x=>x.includes('none')));
   await page.getByRole('link',{name:/Return to Listening Room/}).click();
   await page.locator('#member-audio-file').setInputFiles(FLAC);
   await page.getByRole('button',{name:'Play local recording'}).click();
   await page.locator('[data-listen10-state]').filter({hasText:'playing'}).waitFor({timeout:7000});
   await check('local-file-transferred-to-dock',()=>page.locator('[data-listen10-state]').textContent().then(x=>x.includes('local-file')||x.includes('playing')));
   const playback=await page.locator('[data-listen10-audio]').evaluate(async a=>{
      await new Promise(r=>setTimeout(r,600));
      return {playing:!a.paused,position:a.currentTime,readyState:a.readyState};
   });
   await check('genuine-flac-playback-advanced',()=>Promise.resolve(playback.position>0.1&&playback.readyState>1));
   await page.getByRole('navigation',{name:'Soullab'}).getByRole('link',{name:/House/}).click();
   await page.locator('[data-review-route="home"]').waitFor();
   const continuation=await page.locator('[data-listen10-audio]').evaluate(async a=>{
      const initial=a.currentTime;await new Promise(r=>setTimeout(r,350));
      return {initial,later:a.currentTime,paused:a.paused};
   });
   await check('flac-playback-persists-house-navigation',()=>Promise.resolve(continuation.later>continuation.initial&&!continuation.paused));
   await page.evaluate(()=>window.dispatchEvent(new Event('soullab:member-session-ended')));
   await check('session-end-stops-player',()=>page.locator('[data-listen10-persistent-dock]').getAttribute('style').then(x=>x.includes('none')));
   await check('session-end-releases-local-file',()=>page.locator('[data-listen10-audio]').getAttribute('src').then(x=>!x));
   await check('no-unhandled-js-errors',()=>Promise.resolve(errors.length===0));
   await check('no-external-requests',()=>Promise.resolve(outside.length===0));
   console.log('LISTEN10_'+engine.toUpperCase(),JSON.stringify({status:'PASS',passed:results.length,results,firstAudioContext:state0,localFile:playback,continuation,errors,outside},null,2));
  }catch(e){
   console.error('LISTEN10_'+engine.toUpperCase()+'_ERROR',e.stack);
   console.log('LISTEN10_'+engine.toUpperCase(),JSON.stringify({status:'FAIL',passed:results.filter(x=>x.pass).length,results,errors,outside},null,2));
   process.exitCode=1;
  }finally {if(browser)await browser.close()}
 }
})().catch(e=>{console.error(e);process.exitCode=1});
