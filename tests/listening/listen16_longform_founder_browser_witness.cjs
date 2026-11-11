'use strict';
/** LISTEN-16: founder-only review journey in the REAL pre-existing Listening Room.
 * FICTIONAL 20-minute WAV/AAC input; never loads actual founder recording,
 * member accounts, cloud audio, providers, or private manuscripts.
 */
const {chromium,webkit}=require('playwright-core');
const fs=require('node:fs');
const root='http://127.0.0.1:43283';
const media='/private/tmp/soullab-listen16-fictitious-media/Between_the_Tides_Founder_Study_20min_AAC256.m4a';
if(!fs.existsSync(media))throw new Error('Private fictional media fixture missing.');
async function test(engine,browserType,options){
 const checks=[],errors=[],remote=[];
 const check=(name,pass,extra)=>{checks.push({name,pass:!!pass,...(extra?{extra}:{} )});if(!pass)throw Error('FAIL '+name+' '+JSON.stringify(extra));};
 let browser;
 try{
  browser=await browserType.launch({headless:true,timeout:18000,...options});
  const ctx=await browser.newContext({viewport:{width:1440,height:900},acceptDownloads:true});
  await ctx.addCookies([{name:'maia_session',value:'fictional-listen08-cookie-A',url:root}]);
  const p=await ctx.newPage();
  p.on('pageerror',e=>errors.push(String(e)));
  p.on('request',r=>{const u=r.url();if(/^https?:/.test(u)&&!u.startsWith(root))remote.push(u)});
  const r=await p.goto(root+'/listen',{waitUntil:'load',timeout:30000});
  check('real-Next-authenticated-Listening-Room',r.status()===200,String(r.status()));
  await p.locator('#member-audio-file').waitFor();
  check('no-founder-map-without-manual-file',await p.locator('[data-listen16-founder-score]').count()===0);
  await p.locator('#member-audio-file').setInputFiles(media);
  await p.locator('[data-listen16-founder-score]').waitFor({timeout:15000});
  check('five-private-movements',await p.locator('[data-listen16-chapter]').count()===5);
  check('local-audio-is-paused-after-selection',await p.locator('[data-listen10-audio]').evaluate(a=>a.paused===true));
  const initial=await p.locator('[data-listen16-time]').textContent();
  check('true-twenty-minute-metadata',initial?.includes('20:00'),initial);
  const velvet=p.getByRole('button',{name:/Seek to Velvet Current at 3:30/});
  await velvet.click();
  await p.waitForFunction(()=>Math.abs(document.querySelector('[data-listen10-audio]').currentTime-210)<1.5,null,{timeout:7000});
  check('chapter-seeks-without-autoplay',await p.locator('[data-listen10-audio]').evaluate(a=>a.paused));
  check('active-chapter-is-labelled',await p.locator('[data-listen16-chapter="velvet-current"]').getAttribute('aria-current')==='true');
  await p.getByRole('button',{name:/Seek to Unfolding at 9:00/}).click();
  await p.waitForFunction(()=>Math.abs(document.querySelector('[data-listen10-audio]').currentTime-540)<1.5);
  check('nine-minute-chapter-seek',true);
  await p.getByRole('button',{name:'Play local recording'}).click();
  await p.locator('[data-listen10-state]').filter({hasText:'playing'}).waitFor({timeout:10000});
  await p.waitForFunction(()=>document.querySelector('[data-listen10-audio]').currentTime>540.15,null,{timeout:8000});
  check('long-form-audio-actually-playing',true);
  const before=await p.locator('[data-listen10-audio]').evaluate(a=>a.currentTime);
  const documentVersion=await p.evaluate(()=>{window.__listen16_documentMark='existing';return location.href});
  await p.getByRole('navigation',{name:'Soullab'}).getByRole('link',{name:/House/}).click();
  await p.locator('[data-review-route="home"]').waitFor();
  await p.waitForTimeout(500);
  const after=await p.locator('[data-listen10-audio]').evaluate(a=>a.currentTime);
  check('audio-continues-after-next-client-navigation',after>before+0.1,{before,after});
  check('same-document-retained',await p.evaluate(()=>window.__listen16_documentMark==='existing'),documentVersion);
  await p.getByRole('link',{name:/Return to Listening Room/}).click();
  await p.locator('[data-listen16-founder-score]').waitFor();
  check('chapter-map-survives-return',await p.locator('[data-listen16-chapter]').count()===5);
  await p.getByRole('button',{name:'Pause local music'}).click();
  await p.locator('[data-listen10-state]').filter({hasText:'paused'}).waitFor();
  await p.getByRole('button',{name:/Seek to Dissolve at 18:30/}).click();
  await p.waitForFunction(()=>Math.abs(document.querySelector('[data-listen10-audio]').currentTime-1110)<1.5);
  check('seek-after-pause-does-not-autoplay',await p.locator('[data-listen10-audio]').evaluate(a=>a.paused));
  const label=await p.locator('[data-listen16-time]').textContent();
  check('progress-shows-chosen-late-chapter',label?.includes('18:30') && label?.includes('20:00'),label);
  const slider=p.getByRole('slider',{name:'Seek within the selected local recording'});
  await slider.focus();
  await slider.press('ArrowRight');
  await p.waitForFunction(()=>document.querySelector('[data-listen10-audio]').currentTime>1110.6,null,{timeout:7000});
  check('keyboard-accessible-precise-seeking',await p.locator('[data-listen10-audio]').evaluate(a=>a.paused));
  await p.evaluate(()=>window.dispatchEvent(new Event('soullab:member-session-ended')));
  await p.waitForFunction(()=>document.querySelector('[data-listen10-audio]').getAttribute('src')===null);
  check('session-end-releases-file',true);
  check('session-end-hides-founders-score',await p.locator('[data-listen16-founder-score]').count()===0);
  const short='/private/tmp/soullab-listen07-ui-review/fictional-24bit-48k.flac';
  await p.locator('#member-audio-file').setInputFiles(short);
  await p.waitForTimeout(350);
  check('other-local-track-never-gets-founder-chapters',await p.locator('[data-listen16-founder-score]').count()===0);
  check('no-other-origin-requests',remote.length===0,JSON.stringify(remote));
  check('no-unhandled-page-errors',errors.length===0,JSON.stringify(errors));
  // Responsive screenshot is evidence, not a separate UI redesign.
  const mobile=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});
  await mobile.addCookies([{name:'maia_session',value:'fictional-listen08-cookie-A',url:root}]);
  const mp=await mobile.newPage();
  await mp.goto(root+'/listen',{waitUntil:'load'});
  await mp.locator('#member-audio-file').setInputFiles(media);
  await mp.locator('[data-listen16-founder-score]').waitFor({timeout:12000});
  const dimensions=await mp.evaluate(()=>({width:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));
  check('mobile-layout-fits-390px',dimensions.scroll<=dimensions.width+3,JSON.stringify(dimensions));
  const path='/Volumes/T7 Shield/soullab-content/LISTEN16_LONGFORM_FOUNDER_JOURNEY_REVIEW_20261024/evidence/listen16_'+engine+'_mobile.png';
  await mp.screenshot({path,fullPage:true});
  check('mobile-source-derived-screenshot-saved',fs.statSync(path).size>2000,fs.statSync(path).size);
  console.log('LISTEN16_'+engine.toUpperCase(),JSON.stringify({status:'PASS',passed:checks.length,results:checks,dimensions,remote,errors},null,2));
 }catch(e){
  console.error('LISTEN16_'+engine.toUpperCase()+'_ERROR',e.stack);
  console.log('LISTEN16_'+engine.toUpperCase(),JSON.stringify({status:'FAIL',passed:checks.filter(c=>c.pass).length,results:checks,remote,errors},null,2));
  process.exitCode=2;
 }finally{if(browser)await browser.close();}
}
(async()=>{
await test('chromium',chromium,{executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',args:['--no-first-run','--disable-extensions','--disable-background-networking']});
await test('webkit',webkit,{});
})().catch(e=>{console.error(e);process.exitCode=2});
