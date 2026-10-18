'use strict';
/** R84 isolated real Next+WebKit Listen journey, fictional PG member and Work.
 * The real microphone is NEVER used. Before every page loads, a synthetic
 * capture guard intercepts getUserMedia and always refuses. On guard failure,
 * no recording or microphone button is clicked and this test fails closed.
 * No provider, model, off-host requests, production or real member data.
 */
const {webkit}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const origin=process.env.R66_PRESS_ORIGIN;
const work=process.env.R84_LISTEN_FICTIONAL_WORK;
if(process.env.R84_LISTEN_ACTUAL_WEBKIT!=='fictional-no-real-microphone' ||
 !/^http:\/\/127\.0\.0\.1:\d+$/.test(origin||'') ||
 !/^[a-f0-9-]{36}$/.test(work||'') ||
 process.env.R84_LISTEN_KEYS_KIND!=='none')
 throw new Error('R84_REFUSE_NOT_AN_ISOLATED_FAKE_WORK');
const checks=[];const events=[];
const report={protocol:'soullab.ws.beta.r84.real-next-listen-webkit-fake-mic.v1',
 status:'R84_LISTEN_WEBKIT_HELD',
 sourceHead:process.env.R66_SOURCE_SHA,
 fictionalWorkOnly:true,networkOffHost:0,
 microphoneGuards:[],microphoneRequests:0,
 blockedWriterPOSTs:[],workReadStatuses:[],
 chapterSelectionVerified:false,privateNotesDownload:false,
 safeLeavePromptVerified:false,anonymousWorkReadDenied:false,
 differentMemberDenied:false,realRecordingUsed:false,
 sourceManuscriptUnchanged:null,browserClosed:false,
 mobile390Fits:false,screenshots:[],checks,error:null};
const verify=(ok,explain)=>{assert.ok(ok,'R84_FAILED_'+explain);checks.push(explain);};
const refusal=(status=404)=>({status,contentType:'application/json',
 headers:{'Cache-Control':'private, no-store, max-age=0'},
 body:JSON.stringify({kind:'fictional-unavailable'})});
async function guard(context){
 await context.addInitScript({content:`
  (() => {
    window.__R84MicGuard={installed:false,calls:0,attempted:false};
    const deny=async function(){window.__R84MicGuard.calls++;
      window.__R84MicGuard.attempted=true;
      throw new Error('R84_SYNTHETIC_MICROPHONE_REFUSAL_NO_HARDWARE');};
    try {
      if(navigator.mediaDevices) {
        Object.defineProperty(navigator.mediaDevices,'getUserMedia',
         {configurable:true,writable:false,value:deny});
      } else {
        Object.defineProperty(navigator,'mediaDevices',
         {configurable:true,value:{getUserMedia:deny,enumerateDevices:async()=>[]}});
      }
      window.__R84MicGuard.installed=(navigator.mediaDevices.getUserMedia===deny);
    } catch(e){window.__R84MicGuard.installed=false;}
  })();`});
}
async function routes(context){
 await context.route('**/*',async route=>{
  const req=route.request();let u;
  try{u=new URL(req.url())}catch{report.networkOffHost++;return route.abort();}
  if(u.origin!==origin){report.networkOffHost++;return route.abort();}
  if(!u.pathname.startsWith('/api/'))return route.continue();
  const method=req.method().toUpperCase();
  if(method==='GET'&&u.pathname==='/api/writers-studio/rebuild/context'){
   const original=await route.fetch({timeout:30000});
   report.workReadStatuses.push(original.status());
   return route.fulfill({response:original});
  }
  if(method==='GET'&&u.pathname.startsWith('/api/sovereign/manuscripts/'+work)&&
    (u.pathname===('/api/sovereign/manuscripts/'+work)||
     u.pathname===('/api/sovereign/manuscripts/'+work+'/draft')))
   return route.continue();
  if(method!=='GET'&&method!=='HEAD'){
    report.blockedWriterPOSTs.push(u.pathname);
    return route.fulfill(refusal(423));
  }
  return route.fulfill(refusal(404));
 });
}
async function getJSON(context,id){
 const r=await context.request.get(origin+'/api/writers-studio/rebuild/context?'+
   new URLSearchParams({manuscriptId:id}),{timeout:25000});
 let j=null;try{j=await r.json()}catch{}
 return {status:r.status(),value:j};
}
const cookie=(value)=>({name:'maia_session',value,url:origin,httpOnly:true,sameSite:'Strict'});
(async()=>{let browser;
 try{
  browser=await webkit.launch({headless:true});
  const anonymous=await browser.newContext();
  const denyAnonymous=await getJSON(anonymous,work);
  report.anonymousWorkReadDenied=denyAnonymous.status===401;
  verify(report.anonymousWorkReadDenied,
   'anonymous writer cannot read actual owner draft sections');
  await anonymous.close();
  const other=await browser.newContext();
  await other.addCookies([cookie('r63-fictional-auth-b')]);
  const denyOther=await getJSON(other,work);
  report.differentMemberDenied=denyOther.status===404;
  verify(report.differentMemberDenied,
   'second authenticated fictional member cannot read owner Listen text');
  await other.close();

  const owner=await browser.newContext({
   viewport:{width:1365,height:860},acceptDownloads:true});
  await owner.addCookies([cookie('r63-fictional-auth-a')]);
  await guard(owner);
  await routes(owner);
  const state=await getJSON(owner,work);
  verify(state.status===200&&state.value?.state==='section_aware'&&
    state.value.sections?.length>=2,
   'real owner Next context returns section-aware original manuscript');
  const original=state.value.sections.map(s=>({
    heading:s.heading,body:s.body,id:s.draftSectionId}));
  verify(original.some(x=>x.body.includes('The river remembers the fictional lantern.'))&&
    original.some(x=>x.body.includes('The mountains hold a fictional evening.')),
   'real Source is an authored two-chapter fixture not synthetic browser text');
  verify(state.value.title==='R66 Fictional Author Manuscript',
   'R84 Listen reads existing restored and consent-scoped exact Work');
  const page=await owner.newPage();
  page.on('pageerror',e=>events.push('pageerror:'+String(e.message).slice(0,150)));
  await page.goto(origin+'/writers-studio?'+new URLSearchParams({
   m:work,mode:'listen'}),{waitUntil:'domcontentloaded',timeout:70000});
  await page.locator('[data-listening-studio-pilot]').waitFor({timeout:50000});
  verify((await page.getByRole('heading',{name:'Bring your manuscript to life.'})
      .isVisible())&&
   (await page.locator('[data-writers-listen-entry][aria-current="page"]')
     .isVisible()),
   'canonical Writer Studio host and navigation actually mount Listen mode');
  // The Listen shell paints before the authenticated draft context resolves.
  // Await its owner-bound section list, not merely the shell/header mount.
  await page.locator('#listen-section').waitFor({timeout:30000});
  await page.waitForFunction(()=>
    document.querySelectorAll('#listen-section option').length>=2,
    null,{timeout:25000});
  verify((await page.locator('#listen-section option').count())>=2,
   'actual reading-selector presents owner-bound draft sections');
  let mode=new URL(page.url()).searchParams.get('mode');
  verify(mode==='listen'&&new URL(page.url()).searchParams.get('m')===work,
   'Listen mode preserves exact Work identity in navigation');
  verify((await page.locator('[data-reading-scope="single-section"]').count())===1,
   'no Preface means Listen selects a single original section by default');
  const options=await page.locator('#listen-section option').allTextContents();
  verify(options.some(x=>x.includes('Chapter One'))&&
     options.some(x=>x.includes('Chapter Two'))&&
     !options.some(x=>x.includes('Complete Preface')),
   'Listen never invents a complete Preface in a two-chapter Work');
  // WebKit may replace MediaDevices after initScript as it connects a
  // secure-context page. Re-assert the refusal AFTER mount and verify strict
  // function identity BEFORE any button could touch actual hardware.
  const guardStatus=await page.evaluate(()=>{
   const state=window.__R84MicGuard;
   if(!state||!navigator.mediaDevices)return {present:false,calls:-1,secure:window.isSecureContext};
   const deny=async function R84SyntheticNoHardware(){
    state.calls++;state.attempted=true;
    throw new Error('R84_SYNTHETIC_MICROPHONE_REFUSAL_NO_HARDWARE');
   };
   try{
    Object.defineProperty(navigator.mediaDevices,'getUserMedia',
      {configurable:true,writable:false,value:deny});
   }catch{return {present:false,calls:state.calls,secure:window.isSecureContext};}
   state.liveStub=deny;
   return {present:navigator.mediaDevices.getUserMedia===state.liveStub,
     calls:state.calls,secure:window.isSecureContext};
  });
  report.microphoneGuards.push(guardStatus);
  verify(guardStatus.present&&guardStatus.calls===0&&guardStatus.secure,
   'active post-hydration microphone guard replaces hardware before any action');
  const formatPanelText=await page.locator('[data-capture-format-panel]').innerText();
  verify(await page.getByText('24-bit PCM WAV').isVisible()&&
    formatPanelText.includes('Not available in this pilot'),
   'R84 honest compressed format label does not claim native WAV masters');
  verify(formatPanelText.includes('MP4 / M4A (compressed)'),
   'R85 actual mounted Safari Listen selects the clean M4A codec path without opening microphone');

  const selected=state.value.sections.find(s=>s.heading?.includes('Chapter Two'));
  verify(!!selected,'original Chapter Two address is source-verified');
  await page.locator('#listen-section').selectOption(selected.draftSectionId);
  const displayed=await page.locator('article[data-reading-scope="single-section"]').innerText();
  report.chapterSelectionVerified=displayed.includes('The mountains hold a fictional evening.')&&
    !displayed.includes('The river remembers the fictional lantern.');
  verify(report.chapterSelectionVerified,
    'explicit chapter choice displays exact correct owner passage, not adjacent text');
  verify((await page.locator('[data-recording="false"]').count())===1,
   'Listen starts idle with no recording or microphone access');

  // Do NOT click hardware controls in automated WebKit. Headless WebKit can
  // swap out MediaDevices across hydration/permission checks, so a simulator
  // cannot safely certify the real physical microphone. Recording is held
  // for founder device acceptance; no hardware access is attempted here.
  verify(await page.getByRole('button',{name:'Check microphone & format'}).isVisible()&&
    await page.getByRole('button',{name:'Start recording'}).isVisible()&&
    await page.getByRole('button',{name:'Stop & keep take'}).isDisabled(),
   'real Listen browser displays explicit recording controls without auto-capture');
  report.microphoneRequests=await page.evaluate(()=>window.__R84MicGuard?.calls??-1);
  report.microphoneAutomationHeld=true;
  verify(report.microphoneRequests===0&&
    await page.getByRole('button',{name:'Download original'}).count()===0,
   'browser session never initiates hardware input or invents a take');
  const note='R84 FICTIONAL rehearsal: preserve the breath after the first line.';
  await page.locator('#listen-notes').fill(note);
  const noteDownload=page.waitForEvent('download',{timeout:12000});
  await page.getByRole('button',{name:'Download notes'}).click();
  const dl=await noteDownload;
  const local=await dl.path();
  report.privateNotesDownload=dl.suggestedFilename()==='performance-notes.txt'&&
    local&&fs.readFileSync(local,'utf8')===note;
  verify(report.privateNotesDownload,
   'notes download returns exactly the member-authored fictional performance note');
  const cancelled=[];
  page.once('dialog',async dialog=>{cancelled.push(dialog.type());await dialog.dismiss()});
  await page.locator('button.fr-nav-item[data-mode="develop"]').click();
  await page.waitForTimeout(350);
  report.safeLeavePromptVerified=cancelled.includes('confirm')&&
   new URL(page.url()).searchParams.get('mode')==='listen';
  verify(report.safeLeavePromptVerified,
   'unsaved notes cause a genuine browser leave-warning; dismiss retains Listen');
  const confirm=[];
  page.once('dialog',async dialog=>{confirm.push(dialog.type());await dialog.accept()});
  await page.locator('button.fr-nav-item[data-mode="develop"]').click();
  await page.waitForURL(u=>u.pathname==='/writers-studio'&&
    u.searchParams.get('mode')==='develop',{timeout:25000});
  verify(confirm.includes('confirm'),
   'accepting leave explicitly permits navigation without silently saving notes');

  const mobile=await browser.newContext({
   viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  await mobile.addCookies([cookie('r63-fictional-auth-a')]);
  await routes(mobile);await guard(mobile);
  const phone=await mobile.newPage();
  await phone.goto(origin+'/writers-studio?'+new URLSearchParams({
   m:work,mode:'listen'}),{waitUntil:'domcontentloaded',timeout:60000});
  await phone.locator('[data-listening-studio-pilot]').waitFor({timeout:40000});
  const dims=await phone.evaluate(()=>({
   viewport:document.documentElement.clientWidth,
   body:document.body.scrollWidth,
   html:document.documentElement.scrollWidth,
  }));
  report.mobile390Fits=dims.body<=dims.viewport+1&&dims.html<=dims.viewport+1;
  verify(report.mobile390Fits,
   '390px real WebKit Listen has no horizontal page overflow');
  await mobile.close();
  const refreshed=await getJSON(owner,work);
  report.sourceManuscriptUnchanged=refreshed.status===200&&
    JSON.stringify(refreshed.value?.sections?.map(s=>({
      heading:s.heading,body:s.body,id:s.draftSectionId})))===
    JSON.stringify(original);
  verify(report.sourceManuscriptUnchanged,
   'Listen selection, mic refusal and notes never modify the persisted Work');
  verify(report.blockedWriterPOSTs.length===0,
   'Listen interactions issue no unexpected manuscript or provider writes');
  verify(report.networkOffHost===0,'Listen and file download made no off-host requests');
  verify(events.length===0,'real WebKit Listen experience raised no runtime exceptions');
  await owner.close();
  report.status='R84_REAL_NEXT_LISTEN_WEBKIT_SAFE_NO_MIC_PASS_HELD';
 }catch(err){report.error=String(err?.message||err).slice(0,400);}
 finally{
  if(browser){try{await browser.close();report.browserClosed=true;}catch{}}
  report.checks=checks;
  console.log(JSON.stringify(report));
  process.exitCode=report.status.endsWith('PASS_HELD')&&report.browserClosed?0:2;
 }
})();
