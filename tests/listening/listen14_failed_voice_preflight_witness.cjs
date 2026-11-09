/** LISTEN-14: FICTIONAL BROWSER REHEARSAL ONLY. Requires Next/PG localhost fixture.
 * Not actual Soullab member audio, production release or iPhone acceptance.
 */
'use strict';
const {chromium,webkit}=require('playwright-core');
const ROOT='http://127.0.0.1:43281';
(async()=>{
 for(const [name,browserType,options] of [['chromium',chromium,{executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',args:['--no-first-run','--disable-background-networking','--disable-extensions']}],['webkit',webkit,{}]]){
 let browser,results=[];
 const assert=(label,pass)=>{results.push({label,pass:!!pass});if(!pass)throw Error('FAIL '+label)};
 try{
  browser=await browserType.launch({headless:true,...options});
  const ctx=await browser.newContext();
  await ctx.addCookies([{name:'maia_session',value:'fictional-listen08-cookie-A',url:ROOT}]);
  const page=await ctx.newPage();
  const errors=[];page.on('pageerror',e=>errors.push(String(e)));
  await page.goto(ROOT+'/listen',{waitUntil:'load'});
  await page.getByRole('button',{name:/Listen to sound sketch/}).click();
  await page.locator('[data-listen10-state]').filter({hasText:'playing'}).waitFor();
  await page.getByRole('navigation',{name:'Soullab'}).getByRole('link',{name:/House/}).click();
  await page.getByRole('link',{name:'Open fictional MAIA voice playback'}).click();
  await page.locator('[data-review-route="maia"]').waitFor();
  assert('background-music-running-before-failed-voice',(await page.locator('[data-listen10-state]').textContent()).includes('playing'));
  await page.getByRole('button',{name:'Simulate failed MAIA audio'}).click();
  await page.locator('[data-listen10-state]').filter({hasText:'paused'}).waitFor({timeout:5000});
  assert('failed-voice-preflight-paused-music',true);
  // The fake NotSupportedError never begins actual speech and does not
  // automatically resume music after final playback failure.
  await page.waitForTimeout(400);
  assert('failed-voice-no-auto-resume',(await page.locator('[data-listen10-state]').textContent()).includes('paused'));
  await page.getByRole('button',{name:'Resume persistent music'}).click();
  await page.locator('[data-listen10-state]').filter({hasText:'playing'}).waitFor({timeout:6000});
  assert('member-can-resume-after-failed-voice',true);
  assert('no-unhandled-page-errors',errors.length===0);
  console.log('LISTEN14_FAILED_PLAYBACK_'+name.toUpperCase(),JSON.stringify({status:'PASS',checks:results.length,results,errors},null,2));
 }catch(e){console.error('LISTEN14_FAILED_PLAYBACK_'+name.toUpperCase()+'_ERROR',e.stack);process.exitCode=2}
 finally{if(browser)await browser.close()}
 }
})().catch(e=>{console.error(e);process.exitCode=2});
