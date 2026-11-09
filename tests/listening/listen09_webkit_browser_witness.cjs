/** LISTEN-09: WebKit acceptance of the isolated STRICT-PROXY /listen candidate.
 * Requires a local Next 16.3.8 fixture with fictional PostgreSQL sessions and
 * test-only source-pin corrections (NOT the protected Soullab application).
 * Install playwright-core@1.56.0 + cached WebKit revision 2215; use fictional
 * audio only. No provider/API/member data. Hard-coded loopback HTTP origin.
 * Do not claim real Safari/iPhone/WebKit native-app clearance from this test.
 */
'use strict';
const {webkit}=require('playwright-core');
const fs=require('node:fs');
const localAudio=process.env.LISTEN09_FLAC_TEST_FILE;
if(!localAudio || !fs.existsSync(localAudio)) throw Error('Provide a fictional local FLAC fixture through LISTEN09_FLAC_TEST_FILE');
const listen='http://127.0.0.1:43277/listen';
const checks=[],errors=[],external=[];
const check=(name,condition,info='')=>{
 const pass=Boolean(condition);checks.push({name,pass,info:String(info)});
 if(!pass)throw Error('WEBKIT_FAIL '+name+' '+String(info));
};
async function enter(ctx,url=listen){
 const page=await ctx.newPage();
 page.on('pageerror',e=>errors.push(String(e)));
 page.on('request',r=>{
  const u=r.url();
  if(/^https?:/.test(u)&&!u.startsWith('http://127.0.0.1:43277'))
   external.push(u);
 });
 return page;
}
(async()=>{
 let browser;
 try{
  browser=await webkit.launch({headless:true,timeout:16000});
  const A=await browser.newContext({acceptDownloads:true,viewport:{width:1280,height:850}});
  await A.addCookies([{name:'maia_session',value:'fictional-listen08-cookie-A',url:'http://127.0.0.1:43277'}]);
  const page=await enter(A);
  const response=await page.goto(listen,{waitUntil:'load',timeout:25000});
  check('authenticated-webkit-next-page',response.status()===200,String(response.status()));
  await page.locator('h1').waitFor();
  check('actual-react-room-hydrated',(await page.locator('h1').textContent())==='The Blue Hour');
  await page.locator('#list-name').fill('Existential Bliss, Fictional');
  await page.locator('#list-url').fill('https://open.spotify.com/playlist/123?si=tracking');
  await page.getByRole('button',{name:'Add link'}).click();
  check('playlist-collection-reactive',(await page.locator('section:has(#library-title)').textContent()).includes('Existential Bliss, Fictional'));
  const link=await page.locator('section:has(#library-title) a[href*="spotify"]').getAttribute('href');
  check('provider-url-tracker-stripped',link==='https://open.spotify.com/playlist/123',link);
  await page.getByRole('button',{name:'Personal reflection'}).click();
  await page.locator('#listen-note').fill('The night feels expansive and beautiful.');
  check('reflection-input-retained',(await page.locator('#listen-note').inputValue()).includes('expansive'));
  await page.locator('#listen-private-passphrase').fill('A fictional long listening passphrase 2026');
  await page.locator('#listen-private-confirm').fill('A fictional long listening passphrase 2026');
  const pending=page.waitForEvent('download',{timeout:25000});
  await page.getByRole('button',{name:'Save encrypted backup'}).click();
  const download=await pending,downloaded=await download.path();
  const sealed=fs.readFileSync(downloaded,'utf8');
  const envelope=JSON.parse(sealed);
  check('actual-webkit-blob-download',download.suggestedFilename()==='soullab-listening-private-backup.json',download.suggestedFilename());
  check('envelope-aes-gcm-format',envelope.format==='SOULLAB_LISTEN_PRIVATE_BACKUP_V1');
  check('encrypted-data-opaque',!sealed.includes('The night feels')&&!sealed.includes('Existential Bliss'));
  check('password-fields-cleared-after-save',(await page.locator('#listen-private-passphrase').inputValue())==='');
  page.once('dialog',dialog=>dialog.accept());
  await page.getByRole('button',{name:'Clear tab data'}).click();
  check('clear-removes-user-library',!(await page.locator('section:has(#library-title)').textContent()).includes('Existential Bliss'));
  check('clear-removes-reflection',(await page.locator('#listen-note').inputValue())==='');
  await page.locator('#listen-private-file').setInputFiles(downloaded);
  await page.locator('#listen-private-passphrase').fill('A different incorrect long passphrase');
  await page.getByRole('button',{name:'Restore with passphrase'}).click();
  await page.getByText(/Unable to unlock this backup/).waitFor({timeout:15000});
  check('incorrect-passphrase-cannot-restore',!(await page.locator('section:has(#library-title)').textContent()).includes('Existential Bliss'));
  await page.locator('#listen-private-passphrase').fill('A fictional long listening passphrase 2026');
  await page.getByRole('button',{name:'Restore with passphrase'}).click();
  await page.getByText(/Restored 1 collections/).waitFor({timeout:15000});
  check('real-webkit-decrypt-restored-collection',(await page.locator('section:has(#library-title)').textContent()).includes('Existential Bliss'));
  check('real-webkit-decrypt-restored-reflection',(await page.locator('#listen-note').inputValue())==='The night feels expansive and beautiful.');
  check('real-webkit-no-persisted-password',(await page.locator('#listen-private-passphrase').inputValue())==='');
  await page.locator('#member-audio-file').setInputFiles(localAudio);
  await page.locator('audio[controls]').waitFor();
  const audio=await page.locator('audio[controls]').evaluate(async el=>{
   let error=null;try{await el.play();await new Promise(resolve=>setTimeout(resolve,700))}
   catch(e){error=String(e)}
   return {readyState:el.readyState,currentTime:el.currentTime,paused:el.paused,error};
  });
  check('webkit-local-flac-selected',!!(await page.locator('audio[controls]').count()));
  check('webkit-local-flac-decoded',audio.readyState>1,JSON.stringify(audio));
  const B=await browser.newContext(); const pageB=await enter(B);
  await pageB.setExtraHTTPHeaders({'x-session-token':'fictional-listen08-header-B'});
  const respB=await pageB.goto(listen,{waitUntil:'load'});
  check('header-only-safari-engine-admitted',respB.status()===200,String(respB.status()));
  const anon=await browser.newContext(),pageAnon=await enter(anon);
  const ar=await pageAnon.goto(listen,{waitUntil:'load'});
  check('anonymous-webkit-denied',pageAnon.url().includes('/signin?next='),String(ar.status())+' '+pageAnon.url());
  const cross=await browser.newContext();
  await cross.addCookies([{name:'maia_session',value:'fictional-listen08-cookie-A',url:'http://127.0.0.1:43277'}]);
  const cp=await enter(cross); await cp.setExtraHTTPHeaders({'x-session-token':'fictional-listen08-header-B'});
  const cr=await cp.goto(listen,{waitUntil:'load'});
  check('cross-member-webkit-denied',cp.url().includes('/signin?next='),String(cr.status())+' '+cp.url());
  const mobile=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:3,isMobile:true,hasTouch:true});
  await mobile.addCookies([{name:'maia_session',value:'fictional-listen08-cookie-A',url:'http://127.0.0.1:43277'}]);
  const mp=await enter(mobile);
  const mr=await mp.goto(listen,{waitUntil:'load'});
  check('webkit-mobile-viewport-200',mr.status()===200,String(mr.status()));
  const dimensions=await mp.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,viewportWidth:document.documentElement.clientWidth}));
  check('webkit-mobile-no-major-horizontal-scroll',dimensions.scrollWidth<=dimensions.viewportWidth+3,JSON.stringify(dimensions));
  check('zero-external-requests',external.length===0,JSON.stringify(external));
  check('zero-js-page-errors',errors.length===0,JSON.stringify(errors));
  console.log(JSON.stringify({status:'PASS',checks:checks.length,results:checks,audio,dimensions,external,errors,webkitVersion:browser.version()},null,2));
 }catch(e){
  console.error('WEBKIT_LISTEN09_ERROR',e.stack);
  console.log(JSON.stringify({status:'FAIL',checks:checks.length,results:checks,external,errors,webkitVersion:browser?.version()},null,2));
  process.exitCode=2;
 }finally{if(browser)await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=2});
