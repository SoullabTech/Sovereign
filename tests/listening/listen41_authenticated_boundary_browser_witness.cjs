/**
 * LISTEN-41 · Chromium witness for the actual boundary + transport components
 * in an isolated fictional fixture. No server, database, member data or remote
 * network. This is browser-component acceptance, not integrated Next acceptance.
 */
'use strict';
const path=require('node:path');
const {chromium}=require('playwright-core');
const root=process.env.LISTEN41_FIXTURE_DIR;
if(!root)throw new Error('LISTEN41_FIXTURE_DIR is required');
const url='file://'+path.join(root,'index.html');
const results=[];
const check=async(name,fn)=>{const detail=await fn();const pass=!!detail;results.push({name,pass,detail:pass?undefined:detail});if(!pass)throw new Error('FAILED '+name+' '+JSON.stringify(detail))};
(async()=>{
 let browser;const errors=[],outside=[];
 try{
  browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',args:['--no-first-run','--disable-extensions','--disable-background-networking','--autoplay-policy=no-user-gesture-required']});
  const page=await browser.newPage();
  page.on('pageerror',e=>errors.push(String(e)));
  page.on('request',r=>{if(!/^(file|data|blob):/.test(r.url()))outside.push(r.url())});
  await page.addInitScript(()=>{
   window.__listen41Contexts=[];
   const Base=window.AudioContext;
   if(Base)window.AudioContext=class extends Base{constructor(...args){super(...args);this.__listen41ID=Math.random().toString(36).slice(2);window.__listen41Contexts.push(this)}};
  });
  await page.goto(url,{waitUntil:'load'});
  await page.locator('[data-transport]').filter({hasText:'mounted'}).waitFor({timeout:10000});
  await check('verified-session-mounts-one-transport',()=>page.locator('[data-transport]').textContent().then(x=>x==='mounted'));
  await check('session-call-is-no-store',()=>page.evaluate(()=>window.__listen41SessionCalls.some(x=>x.path==='/api/members/session'&&x.cache==='no-store')));

  await page.locator('[data-start]').click();
  await page.locator('[data-playback]').filter({hasText:'playing'}).waitFor({timeout:8000});
  const first=await page.evaluate(()=>({count:window.__listen41Contexts.length,id:window.__listen41Contexts[0]?.__listen41ID,state:window.__listen41Contexts[0]?.state}));
  await check('member-action-starts-actual-transport',()=>Promise.resolve(first.count===1&&first.state==='running'));

  const approvedRoutes=['/home','/house','/maia','/writers-studio','/journal','/astrology'];
  const routeStates=[];
  for(const route of approvedRoutes){
    await page.evaluate(next=>window.__setFixturePath(next),route);
    await page.locator('[data-pathname]').filter({hasText:route}).waitFor();
    await page.locator('[data-playback]').filter({hasText:'playing'}).waitFor();
    const observed=await page.evaluate(()=>({count:window.__listen41Contexts.length,id:window.__listen41Contexts[0]?.__listen41ID,state:window.__listen41Contexts[0]?.state}));
    routeStates.push({route,...observed});
    await check(`route-${route}-preserves-one-playing-context`,()=>Promise.resolve(observed.count===1&&observed.id===first.id&&observed.state==='running'));
  }

  await page.evaluate(()=>window.__setFixturePath('/maia/community/elemental-alchemy/reader'));
  await page.locator('[data-transport]').filter({hasText:'none'}).waitFor();
  await page.waitForTimeout(80);
  const readerState=await page.evaluate(()=>window.__listen41Contexts.at(-1)?.state);
  await check('reader-route-is-excluded-and-closes-music',()=>Promise.resolve(readerState==='closed'));

  await page.evaluate(()=>window.__setFixturePath('/listen'));
  await page.locator('[data-transport]').filter({hasText:'mounted'}).waitFor();
  await check('return-from-reader-does-not-auto-resume',()=>page.locator('[data-playback]').textContent().then(x=>x==='idle'));

  await page.locator('[data-start]').click();
  await page.locator('[data-playback]').filter({hasText:'playing'}).waitFor();
  await page.getByRole('button',{name:'Stop and clear persistent music'}).click();
  await page.locator('[data-playback]').filter({hasText:'idle'}).waitFor();
  await check('explicit-stop-clears-selection',()=>page.locator('[data-kind]').textContent().then(x=>x==='none'));
  await page.waitForFunction(()=>window.__listen41Contexts.at(-1)?.state==='closed');
  await check('explicit-stop-closes-audio-context',()=>page.evaluate(()=>window.__listen41Contexts.at(-1)?.state==='closed'));

  await page.locator('[data-start]').click();
  await page.locator('[data-playback]').filter({hasText:'playing'}).waitFor();

  await page.evaluate(()=>window.__setFixturePath('/signin'));
  await page.locator('[data-transport]').filter({hasText:'none'}).waitFor();
  await page.waitForTimeout(80);
  const publicState=await page.evaluate(()=>window.__listen41Contexts.at(-1)?.state);
  await check('public-route-unmounts-and-closes-audio',()=>Promise.resolve(publicState==='closed'));

  await page.evaluate(()=>window.__setFixturePath('/listen'));
  await page.locator('[data-transport]').filter({hasText:'mounted'}).waitFor();
  await check('return-does-not-auto-resume',()=>page.locator('[data-playback]').textContent().then(x=>x==='idle'));

  await page.locator('[data-start]').click();
  await page.locator('[data-playback]').filter({hasText:'playing'}).waitFor();
  await page.evaluate(()=>{window.__setListen41SessionMode('B');window.dispatchEvent(new Event('focus'))});
  await page.locator('[data-playback]').filter({hasText:'idle'}).waitFor({timeout:5000});
  await check('member-switch-clears-prior-transport',()=>page.locator('[data-kind]').textContent().then(x=>x==='none'));

  await page.locator('[data-start]').click();
  await page.locator('[data-playback]').filter({hasText:'playing'}).waitFor();
  await page.evaluate(()=>window.dispatchEvent(new Event('soullab:member-session-ended')));
  await page.locator('[data-transport]').filter({hasText:'none'}).waitFor();
  await check('session-end-removes-private-player-state',()=>page.locator('[data-playback]').textContent().then(x=>x==='unavailable'));

  await page.evaluate(()=>{window.__setFixturePath('/signin');window.__setListen41SessionMode('A')});
  await page.locator('[data-pathname]').filter({hasText:'/signin'}).waitFor();
  await page.evaluate(()=>window.__setFixturePath('/listen'));
  await page.locator('[data-transport]').filter({hasText:'mounted'}).waitFor();
  await page.locator('[data-start]').click();
  await page.locator('[data-playback]').filter({hasText:'playing'}).waitFor();
  await page.evaluate(()=>{window.__setListen41SessionMode('invalid');window.dispatchEvent(new Event('focus'))});
  await page.locator('[data-transport]').filter({hasText:'none'}).waitFor({timeout:5000});
  await check('rejected-session-fails-closed',()=>page.locator('[data-playback]').textContent().then(x=>x==='unavailable'));

  await check('no-external-network',()=>Promise.resolve(outside.length===0));
  await check('no-page-errors',()=>Promise.resolve(errors.length===0));
  console.log('LISTEN41_CHROMIUM',JSON.stringify({status:'PASS',passed:results.length,results,first,routeStates,readerState,publicState,errors,outside},null,2));
 }catch(error){
  console.error('LISTEN41_CHROMIUM_ERROR',error.stack);
  console.log('LISTEN41_CHROMIUM',JSON.stringify({status:'FAIL',passed:results.filter(x=>x.pass).length,results,errors,outside},null,2));
  process.exitCode=1;
 }finally{if(browser)await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1});
