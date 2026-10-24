'use strict';
const {chromium,webkit}=require('playwright-core');
const ROOT='http://127.0.0.1:43279';
const FLAC=process.env.LISTEN13_TEST_FLAC;
if(!FLAC || !FLAC.startsWith('/private/tmp/')) throw Error('A fictional /private/tmp FLAC fixture is required.');
async function run(engine,driver) {
  const checks=[],errors=[],external=[];
  const check=(name,pass,details='')=>{
    checks.push({name,pass:!!pass,details:String(details)});
    if(!pass)throw Error('FAIL '+name+' '+String(details));
  };
  let browser;
  try{
    browser=await driver.launch({headless:true,timeout:17000,...(engine==='chromium'?{executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',args:['--no-first-run','--disable-background-networking','--disable-extensions']}:{})});
    const ctx=await browser.newContext();
    await ctx.addCookies([{name:'maia_session',value:'fictional-listen08-cookie-A',url:ROOT}]);
    const page=await ctx.newPage();
    page.on('pageerror',e=>errors.push(String(e)));
    page.on('request',r=>{
      const url=r.url();if(/^https?:/.test(url) && !url.startsWith(ROOT))external.push(url);
    });
    await page.addInitScript(()=>{
      const Base=window.Audio;window.__listen13Audio=[];
      function AudioSpy(...args){const item=new Base(...args);window.__listen13Audio.push(item);return item;}
      AudioSpy.prototype=Base.prototype;window.Audio=AudioSpy;
      window.__listen13Interrupts=0;
      window.addEventListener('maya-voice-interrupted',()=>window.__listen13Interrupts++);
    });
    let response=await page.goto(ROOT+'/listen',{waitUntil:'load',timeout:25000});
    check('authenticated-listen-200',response.status()===200,String(response.status()));
    await page.getByRole('button',{name:/Listen to sound sketch/}).click();
    await page.locator('[data-listen10-state]').filter({hasText:'playing'}).waitFor({timeout:11000});
    check('member-started-music-playing',true);
    await page.getByRole('navigation',{name:'Soullab'}).getByRole('link',{name:/House/}).click();
    await page.locator('[data-review-route="home"]').waitFor();
    await page.getByRole('link',{name:'Open fictional MAIA voice playback'}).click();
    await page.locator('[data-review-route="maia"]').waitFor({timeout:9000});
    await page.getByRole('button',{name:'Start fictional MAIA speech'}).click();
    await page.waitForFunction(()=>window.__listen13Audio.some(x=>!x.paused&&x.readyState>1&&x.currentTime>0.15),null,{timeout:11000});
    await page.locator('[data-listen10-state]').filter({hasText:'paused'}).waitFor();
    check('maia-start-pauses-sketch',true);
    const early=await page.evaluate(()=>window.__listen13Audio.filter(x=>!x.paused).map(x=>x.currentTime));
    await page.getByRole('button',{name:'Resume persistent music'}).click();
    const blocked=await page.locator('[data-listen10-state]').textContent();
    check('music-resume-declined-while-maia-active',blocked.includes('paused'),blocked);
    const info=await page.locator('[data-listen10-persistent-dock]').textContent();
    check('explain-denial-to-listener',info.includes('MAIA is speaking.'),info.slice(-140));
    await page.waitForTimeout(360);
    const late=await page.evaluate(()=>window.__listen13Audio.filter(x=>!x.paused).map(x=>x.currentTime));
    check('maia-speech-not-interrupted',early.length>0&&late.some((t,i)=>t>(early[i]||0)+0.10),JSON.stringify({early,late}));
    check('music-request-did-not-interrupt-maia-floor',(await page.evaluate(()=>window.__listen13Interrupts))===0);
    await page.getByRole('button',{name:'Stop fictional MAIA speech'}).click();
    await page.waitForTimeout(130);
    check('maia-stop-no-autoresume',(await page.locator('[data-listen10-state]').textContent()).includes('paused'));
    await page.getByRole('button',{name:'Resume persistent music'}).click();
    await page.locator('[data-listen10-state]').filter({hasText:'playing'}).waitFor({timeout:11000});
    check('member-can-resume-after-maia-stop',true);

    // FLAC should be selected in the room and handed to the single global dock.
    await page.getByRole('link',{name:/Return to Listening Room/}).click();
    await page.locator('#member-audio-file').setInputFiles(FLAC);
    await page.getByRole('button',{name:'Play local recording'}).click();
    await page.locator('[data-listen10-state]').filter({hasText:'playing'}).waitFor({timeout:9000});
    await page.waitForFunction(()=>{const a=document.querySelector('[data-listen10-audio]');return a&&a.currentTime>0.1&&!a.paused;},null,{timeout:8500});
    check('device-local-flac-playing',true);
    await page.getByRole('navigation',{name:'Soullab'}).getByRole('link',{name:/House/}).click();
    await page.getByRole('link',{name:'Open fictional MAIA voice playback'}).click();
    await page.getByRole('button',{name:'Start fictional MAIA speech'}).click();
    await page.locator('[data-listen10-state]').filter({hasText:'paused'}).waitFor({timeout:9000});
    await page.waitForFunction(()=>window.__listen13Audio.some(x=>!x.paused&&x.currentTime>0.15),null,{timeout:9000});
    check('maia-start-pauses-device-file',await page.locator('[data-listen10-audio]').evaluate(a=>a.paused));
    await page.getByRole('button',{name:'Play local music'}).click();
    await page.waitForTimeout(220);
    const fileState=await page.locator('[data-listen10-state]').textContent();
    check('flac-resume-denied-while-maia-speaks',fileState.includes('paused'),fileState);
    check('flac-actually-remains-paused',await page.locator('[data-listen10-audio]').evaluate(a=>a.paused));
    await page.getByRole('button',{name:'Stop fictional MAIA speech'}).click();
    await page.getByRole('button',{name:'Play local music'}).click();
    await page.locator('[data-listen10-state]').filter({hasText:'playing'}).waitFor({timeout:9000});
    check('flac-resumes-after-maia-stop-on-click',await page.locator('[data-listen10-audio]').evaluate(a=>!a.paused));
    await page.getByRole('button',{name:'Pause local music'}).click();
    await page.getByRole('button',{name:'Queue two fictional MAIA chunks'}).click();
    await page.locator('[data-listen10-state]').filter({hasText:'paused'}).waitFor({timeout:9000});
    await page.waitForFunction(()=>window.__listen13Audio.length>=4&&window.__listen13Audio.at(-1).ended,null,{timeout:11000});
    await page.waitForTimeout(100);
    check('natural-voice-complete-keeps-music-paused',(await page.locator('[data-listen10-state]').textContent()).includes('paused'));
    await page.getByRole('button',{name:'Play local music'}).click();
    await page.locator('[data-listen10-state]').filter({hasText:'playing'}).waitFor();
    check('after-natural-finish-explicit-music-play',true);
    await page.evaluate(()=>window.dispatchEvent(new Event('soullab:member-session-ended')));
    await page.waitForFunction(()=>document.querySelector('[data-listen10-persistent-dock]')?.style.display==='none');
    check('session-end-releases-music',!await page.locator('[data-listen10-audio]').getAttribute('src'));
    check('no-external-network-requests',external.length===0,JSON.stringify(external));
    check('no-unhandled-page-errors',errors.length===0,JSON.stringify(errors));
    console.log('LISTEN13_'+engine.toUpperCase(),JSON.stringify({status:'PASS',passed:checks.length,results:checks,errors,external},null,2));
  }catch(e){
    console.error('LISTEN13_'+engine.toUpperCase()+'_ERROR',e.stack);
    console.log('LISTEN13_'+engine.toUpperCase(),JSON.stringify({status:'FAIL',passed:checks.filter(c=>c.pass).length,results:checks,errors,external},null,2));
    process.exitCode=1;
  }finally{if(browser)await browser.close()}
}
(async()=>{await run('chromium',chromium);await run('webkit',webkit)})().catch(e=>{console.error(e);process.exitCode=1});
