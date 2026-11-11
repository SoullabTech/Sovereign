/** LISTEN-12 NEGATIVE WITNESS: original queue cannot stop speech when music resumes.
 * A success exit means UNSAFE OVERLAP REPRODUCED, not release acceptance.
 * Never treat a green negative-witness execution as production readiness.
 * Fictional WAV and localhost only; no live MAIA conversation.
 */
'use strict';
const {chromium,webkit}=require('playwright-core');
const origin='http://127.0.0.1:43279';
(async()=>{
 for(const [name,driver,config] of [['chromium',chromium,{executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',args:['--no-first-run','--disable-extensions','--disable-background-networking']}],['webkit',webkit,{}]]){
  let browser;
  try{
    browser=await driver.launch({headless:true,...config,timeout:16000});
    const ctx=await browser.newContext();
    await ctx.addCookies([{name:'maia_session',value:'fictional-listen08-cookie-A',url:origin}]);
    const page=await ctx.newPage();
    const errors=[];
    page.on('pageerror',e=>errors.push(String(e)));
    await page.addInitScript(()=>{
      window.__listen12Audios=[];
      const Base=window.Audio;
      function Wrapped(...args){const x=new Base(...args);window.__listen12Audios.push(x);return x}
      Wrapped.prototype=Base.prototype;window.Audio=Wrapped;
    });
    await page.goto(origin+'/listen',{waitUntil:'load'});
    await page.getByRole('button',{name:/Listen to sound sketch/}).click();
    await page.locator('[data-listen10-state]').filter({hasText:'playing'}).waitFor();
    await page.getByRole('navigation',{name:'Soullab'}).getByRole('link',{name:/House/}).click();
    await page.getByRole('link',{name:'Open fictional MAIA voice playback'}).click();
    await page.locator('[data-review-route="maia"]').waitFor();
    await page.getByRole('button',{name:'Start fictional MAIA speech'}).click();
    await page.locator('[data-listen10-state]').filter({hasText:'paused'}).waitFor();
    await page.waitForFunction(()=>window.__listen12Audios.some(x=>!x.paused && x.currentTime>0.15),null,{timeout:9500});
    await page.getByRole('button',{name:'Resume persistent music'}).click();
    await page.locator('[data-listen10-state]').filter({hasText:'playing'}).waitFor();
    const first=await page.evaluate(()=>window.__listen12Audios.filter(a=>!a.paused).map(a=>a.currentTime));
    await page.waitForTimeout(350);
    const second=await page.evaluate(()=>window.__listen12Audios.filter(a=>!a.paused).map(a=>a.currentTime));
    const unsafeOverlap=first.length>0&&second.length>0&&second.some((v,i)=>v>(first[i]||0)+0.13);
    console.log('LISTEN12_REVERSE_FOCUS_'+name.toUpperCase(),JSON.stringify({witness:'EXPECTED_UNSAFE_OVERLAP',unsafeOverlap,voiceBefore:first,voiceAfter:second,errors,status:unsafeOverlap?'BLOCKED':'NO_OVERLAP_OBSERVED'}));
    await page.getByRole('button',{name:'Stop fictional MAIA speech'}).click();
    await page.getByRole('button',{name:'Stop and clear persistent music'}).click();
    if(!unsafeOverlap)process.exitCode=2;
  }catch(e){console.error('LISTEN12_REVERSE_'+name+'_ERROR',e.stack);process.exitCode=2;}
  finally{if(browser)await browser.close()}
 }
})().catch(e=>{console.error(e);process.exitCode=2});
