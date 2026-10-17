'use strict';
/**
 * R66 — GENUINE Next.js /press/manuscript React component in WebKit
 * with actual disposable PostgreSQL-backed manuscript POST/GET handlers.
 * Only an HTTP response is simulated as lost; server persistence is REAL
 * within the fictional localhost database. No provider, mail, keys, prod.
 */
const {webkit}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');

const origin=process.env.R66_PRESS_ORIGIN;
if(process.env.R66_ACTUAL_PRESS_BROWSER!=='fictional-only'||
 !/^http:\/\/127\.0\.0\.1:\d+$/.test(origin||''))
 throw Error('R66_NOT_FICTIONAL_LOCAL_ORIGIN');
const cookie='r63-fictional-auth-a';
const other='r63-fictional-auth-b';
const title='R66 Fictional Author Manuscript';
const content='Chapter One\nThe river remembers the fictional lantern.\n\nChapter Two\nThe mountains hold a fictional evening.';
const checks=[];
const report={
 protocol:'soullab.ws.beta.r70.real-author-edit-restore-fictional.v1',
 sourceSha:process.env.R66_SOURCE_SHA,
 status:'R70_REAL_AUTHOR_EDIT_RESTORE_BROWSER_HOLD',
 browser:'WebKit',realNextPage:true,
 actualContentAPIGetAndPost:true,
 sourceTextFictional:true,
 actualSavedId:null,
 firstSaveStatus:null,secondSaveStatus:null,
 duplicateCount:0,confirmationStable:false,
 offHostRequestsBlocked:0,unexpectedWrites:[],
 browserClosed:false,previewPostCount:0,
 actualWriteReady:false,contextStates:[],draftCreateStatuses:[],allowedDraftPosts:0,
 realReviewReady:false,reviewGetStatuses:[],reviewRunCounts:[],
 reviewPostAttempts:[],editorialDefaultOffStatuses:[],mobileReviewReady:false,
 authorEditSaved:false,restoreCompleted:false,sectionSaveStatuses:[],
 checkpointStatuses:[],revisionListStatuses:[],revisionRestoreStatuses:[],
 revisionRestoreIntentVisible:false,unrelatedContentWriteCount:0,
 screenshot:null,checks,error:null,
 navigationPathTrail:[],
};
let browser;
let seenConfirmation;
let firstCommittedId;
let failedReplySent=false;
let repeats=0;
const verify=(value,name)=>{
 assert.ok(value,'R66_FAILED_'+name);
 checks.push(name);
};
const json=(payload,status=404)=>({
 status,contentType:'application/json',
 headers:{'Cache-Control':'private, no-store, max-age=0',
  'X-R66-Fictional':'true'},
 body:JSON.stringify(payload),
});
function localRoutes(context){
 return context.route('**/*',async route=>{
  const r=route.request();
  const href=r.url();
  let url;
  try{url=new URL(href);}catch{report.offHostRequestsBlocked++;return route.abort();}
  if(url.origin!==origin){
   report.offHostRequestsBlocked++;
   return route.abort();
  }
  if(!url.pathname.startsWith('/api/'))return route.continue();
  const method=r.method().toUpperCase();
  const name=url.pathname;
  if(name==='/api/sovereign/manuscripts'&&(method==='GET'||method==='POST')){
   if(method==='POST'){
    let payload={};
    try{payload=r.postDataJSON()||{}}catch{}
    if(Array.isArray(payload.sections)){
     verify(typeof payload.confirmationId==='string'&&
        /^[a-f0-9-]{36}$/i.test(payload.confirmationId),
        'real Press author Save uses once-only random confirmation');
     if(!seenConfirmation)seenConfirmation=payload.confirmationId;
     else verify(payload.confirmationId===seenConfirmation,
       'real Press preserves one exact Save ID across a lost response');
     const backend=await route.fetch({timeout:45000});
     let saved;
     try{saved=await backend.json()}catch{}
     verify(saved&&typeof saved.id==='string',
       'real Next POST returns a persisted exact manuscript identity');
     if(!failedReplySent){
      report.firstSaveStatus=backend.status();
      firstCommittedId=saved.id;
      failedReplySent=true;
      // This response is substituted AFTER the server transaction commits.
      return route.fulfill(json({error:'R66_FICTIONAL_LOST_RESPONSE'},503));
     }
     report.secondSaveStatus=backend.status();
     repeats++;
     report.duplicateCount=repeats;
     verify(saved.id===firstCommittedId,
       'browser retry returns SAME stored manuscript identity');
     return route.fulfill({response:backend});
    }
    report.previewPostCount++;
    return route.continue();
   }
   return route.continue();
  }
  if(method==='GET'&& /^\/api\/sovereign\/manuscripts\/[a-f0-9-]{36}$/.test(name))
   return route.continue();
  if(name==='/api/writers-studio/rebuild/context'&&method==='GET'){
   const backend=await route.fetch({timeout:45000});
   let data=null;
   try{data=await backend.json()}catch{}
   report.contextStates.push(data?.state??'invalid');
   return route.fulfill({response:backend});
  }
  if(name===`/api/sovereign/manuscripts/${firstCommittedId}/draft`&&method==='POST'){
   report.allowedDraftPosts++;
   const backend=await route.fetch({timeout:45000});
   report.draftCreateStatuses.push(backend.status());
   return route.fulfill({response:backend});
  }
  if(name===`/api/sovereign/manuscripts/${firstCommittedId}/chapter-reviews`&&method==='GET'){
   const backend=await route.fetch({timeout:45000});
   report.reviewGetStatuses.push(backend.status());
   let data=null;
   try{data=await backend.json()}catch{}
   if(Array.isArray(data?.runs))report.reviewRunCounts.push(data.runs.length);
   return route.fulfill({response:backend});
  }
  // R70: real author-owned one-section Save, bodyless Keep, and explicit
  // revision Restore. No other manuscript/write paths are released.
  if(firstCommittedId &&
     /^\/api\/sovereign\/manuscripts\/[a-f0-9-]{36}\/sections\/[a-f0-9-]{36}$/.test(name) &&
     name.startsWith('/api/sovereign/manuscripts/'+firstCommittedId+'/')&&method==='PUT'){
   const backend=await route.fetch({timeout:45000});
   report.sectionSaveStatuses.push(backend.status());
   return route.fulfill({response:backend});
  }
  const draftBase=firstCommittedId?
   '/api/sovereign/manuscripts/'+firstCommittedId+'/draft':null;
  if(draftBase&&name===draftBase+'/checkpoint'&&method==='POST'){
   const backend=await route.fetch({timeout:45000});
   report.checkpointStatuses.push(backend.status());
   return route.fulfill({response:backend});
  }
  if(draftBase&&name===draftBase+'/revisions'&&
    ['GET','POST'].includes(method)){
   const backend=await route.fetch({timeout:45000});
   (method==='GET'?report.revisionListStatuses:
    report.revisionRestoreStatuses).push(backend.status());
   return route.fulfill({response:backend});
  }
  // No provider, external AI, analytics, mail, real billing or mutation
  // route is reachable from this deliberately narrow browser experiment.
  if(method!=='GET'&&method!=='HEAD'){
   report.unexpectedWrites.push(name);
   return route.fulfill(json({error:'fictional_unapproved_writer_write'},423));
  }
  return route.fulfill(json({kind:'fictional_unavailable',items:[],works:[]},404));
 });
}
async function openPress(context){
 const page=await context.newPage();
 await page.goto(origin+'/press/manuscript?import=1',{
  waitUntil:'domcontentloaded',timeout:75000,
 });
 return page;
}
(async()=>{
 try{
  browser=await webkit.launch({headless:true});
  const anonymous=await browser.newContext({viewport:{width:1350,height:850}});
  await localRoutes(anonymous);
  const anon=await openPress(anonymous);
  await anon.waitForTimeout(250);
  const anonymousCanSave=await anon.getByRole('button',{name:'Import into Author Studio'}).count();
  verify(anonymousCanSave===0 ||
   anon.url().includes('/signin'),
   'anonymous browser cannot author imported manuscript');
  await anonymous.close();

  const desktop=await browser.newContext({viewport:{width:1365,height:860}});
  await desktop.addCookies([{name:'maia_session',value:cookie,url:origin,
    httpOnly:true,sameSite:'Strict'}]);
  await localRoutes(desktop);
  const page=await openPress(desktop);
  report.navigationPathTrail.push(new URL(page.url()).pathname);
  page.on('framenavigated',frame=>{
   if(frame===page.mainFrame()){
    try{report.navigationPathTrail.push(new URL(frame.url()).pathname);}
    catch{}
   }
  });
  await page.getByRole('heading',{name:'Import a manuscript'}).waitFor({
   timeout:45000,
  });
  verify(page.url().includes('/press/manuscript'),
    'actual Next Press manuscript page opens for PG16 authenticated fake member');
  await page.locator('input[placeholder="Title of your manuscript"]').fill(title);
  await page.locator('textarea[placeholder^="Paste your manuscript"]').fill(content);
  verify(await page.locator('button:has-text("Import into Author Studio")').isEnabled(),
    'author can explicitly preview text with real Press control');
  await page.getByRole('button',{name:'Import into Author Studio'}).click();
  await page.getByRole('button',{name:'Save manuscript'}).waitFor({
   timeout:25000,
  });
  verify(report.previewPostCount===1,
    'author preview passes through real Next POST without saving');
  verify(page.url().includes('/press/manuscript'),
    'preview requires distinct author Save before navigation');
  const shot=process.env.R66_DESKTOP_SCREENSHOT;
  if(shot){await page.screenshot({path:shot,fullPage:false});report.screenshot=shot;}
  await page.getByRole('button',{name:'Save manuscript'}).click();
  await page.getByText('Could not save. Please try again.').waitFor({
   timeout:30000,
  });
  verify(report.firstSaveStatus===201&&!!firstCommittedId,
    'actual save COMMITTED while fictional network response was lost');
  verify(await page.getByRole('button',{name:'Save manuscript'}).isEnabled(),
    'real Press keeps same preview and exposes an explicit retry');
  await page.getByRole('button',{name:'Save manuscript'}).click();
  await page.waitForURL(url=>url.pathname==='/writers-studio'&&
   url.searchParams.get('m')===firstCommittedId,{
    waitUntil:'commit',timeout:40000,
  });
  await page.waitForTimeout(700);
  verify(new URL(page.url()).pathname==='/writers-studio',
    'author handoff stays in genuine Writer Studio after navigation commit');
  await page.locator('[data-write-editor]').first().waitFor({timeout:55000});
  const prose=await page.locator('[data-write-editor]').first().innerText();
  verify(prose.includes('The river remembers the fictional lantern.'),
    'real Write editor renders exact imported fictional author words');
  verify(report.contextStates.includes('no_draft')&&
         report.contextStates.includes('section_aware'),
    'genuine member context reports no draft then server-side section-aware draft');
  verify(report.draftCreateStatuses.length===1&&report.draftCreateStatuses[0]===201,
    'real Studio initialized working draft once through authenticated Next POST');
  report.actualWriteReady=true;
  const backgroundWritesBeforeReview=report.unexpectedWrites.length;
  await page.locator('button.fr-nav-item[data-mode="review"]').click();
  await page.locator('.fr-shell[data-mode="review"]').waitFor({timeout:45000});
  await page.getByText('There are no saved Reviews for this manuscript yet.',{
   exact:false,
  }).waitFor({timeout:35000});
  verify(new URL(page.url()).searchParams.get('mode')==='review' &&
    new URL(page.url()).searchParams.get('m')===firstCommittedId,
    'real member navigates Write to genuine Review for exact manuscript');
  verify((await page.locator('.fr-work-id').first().innerText()).includes(title),
    'genuine Review presents the same verified imported manuscript title');
  verify(report.reviewGetStatuses.includes(200)&&report.reviewRunCounts.includes(0),
    'real authenticated PostgreSQL Review listing returns zero saved readings');
  verify(await page.getByText('Entering this room does not ask MAIA to read anything again.',{
   exact:false,
  }).isVisible(),'real Review truthfully discloses no automatic MAIA rerun');
  verify(backgroundWritesBeforeReview===report.unexpectedWrites.length,
    'entering Review makes no attempted content, provider or editorial write');
  await page.locator('button.fr-nav-item[data-mode="write"]').click();
  await page.locator('[data-write-editor]').first().waitFor({timeout:45000});
  verify(new URL(page.url()).searchParams.get('mode')==='write' &&
   (await page.locator('[data-write-editor]').first().innerText())
     .includes('The river remembers the fictional lantern.'),
   'real Review returns to exactly authored Write content');
  report.realReviewReady=true;
  verify(report.secondSaveStatus===200&&repeats===1,
    'author retry hit real Next and returned 200 without a duplicate');
  report.confirmationStable=true;
  verify(page.url().includes('mode=write'),
    'successful import hands off to Writer Studio Write mode');
  const owner=await desktop.request.get(
   origin+'/api/sovereign/manuscripts/'+firstCommittedId,{
    headers:{'x-session-token':cookie},timeout:20000,
   });
  verify(owner.status()===200&&
   (owner.headers()['cache-control']||'').includes('no-store'),
   'actual authenticated manuscript GET reopens with private no-store');
  const ownerBody=await owner.json();
  verify(ownerBody.manuscript?.id===firstCommittedId&&
   ownerBody.sections?.length>=1,
   'real stored manuscript and author sections reopen under same identity');

  const savedDraft=await desktop.request.get(
   origin+'/api/sovereign/manuscripts/'+firstCommittedId+'/draft',{
    headers:{'x-session-token':cookie},timeout:25000,
   });
  verify(savedDraft.status()===200,
    'real separate working draft reopens for authenticated author');
  const draftContent=await savedDraft.json();
  verify(draftContent.sectionAddressable===true &&
    draftContent.content.includes('The river remembers the fictional lantern.') &&
    draftContent.sections.length>=1,
    'reopened section-addressable draft retains original prose without recasting');
  // These are genuine default-OFF Next routes, not browser-mocked editorial
  // handlers. Fictional owner identity is supplied exactly as for draft GET.
  for(const kind of ['thread','turn','version','adoption','undo']){
   const attempt=await desktop.request.post(
    origin+'/api/writers-studio/editorial/'+kind,{
     headers:{'x-session-token':cookie,'content-type':'application/json'},
     data:{threadId:'33333333-3333-4333-8333-333333333333',
      versionId:'44444444-4444-4444-8444-444444444444',
      authorizationId:'55555555-5555-4555-8555-555555555555',
      sectionId:'66666666-6666-4666-8666-666666666666',
      sanctuary:false},
     timeout:65000,
    });
   report.editorialDefaultOffStatuses.push({kind,status:attempt.status()});
   verify(attempt.status()===404,
     'default-off actual Next editorial '+kind+' refused before writing');
  }
  const postAttemptDraft=await desktop.request.get(
   origin+'/api/sovereign/manuscripts/'+firstCommittedId+'/draft',{
    headers:{'x-session-token':cookie},timeout:25000,
   });
  const afterEditorial=postAttemptDraft.status()===200?
   await postAttemptDraft.json():null;
  verify(afterEditorial?.content===draftContent.content &&
   afterEditorial?.revisionId===draftContent.revisionId,
   'actual draft stays byte-identical after all default-off editorial requests');
  // Real author edits one fictional paragraph. A1 queue, section PUT,
  // checkpoint and restore are all the ACTUAL deployed route handlers.
  const edit=page.locator('[data-write-editor]').first();
  const line=edit.locator('p').filter({hasText:'The river remembers'}).first();
  await line.click();
  await page.keyboard.press('End');
  await page.keyboard.type(' R70 fictional author revision.');
  verify((await edit.innerText()).includes('R70 fictional author revision.'),
    'real contenteditable visibly accepts an explicit fictional author edit');
  for(let i=0;i<100&&!report.sectionSaveStatuses.includes(200);i++)
   await page.waitForTimeout(120);
  verify(report.sectionSaveStatuses.includes(200),
    'actual single-section Next PUT acknowledged the author edit');
  const editedRead=await desktop.request.get(
   origin+'/api/sovereign/manuscripts/'+firstCommittedId+'/draft',{
    headers:{'x-session-token':cookie},timeout:25000,
   });
  const editedData=editedRead.status()===200?await editedRead.json():null;
  verify(editedData?.content.includes('R70 fictional author revision.')&&
   editedData.revisionId>draftContent.revisionId,
   'real PostgreSQL reopens revised writing at advanced draft version');
  report.authorEditSaved=true;
  const history=page.getByRole('button',{name:'History',exact:true});
  await history.waitFor({timeout:35000});
  await history.click();
  await page.getByRole('heading',{name:'Manuscript history'}).waitFor({timeout:35000});
  await page.getByRole('button',{name:'Keep a version'}).click();
  await page.getByText('Version kept.',{exact:false}).waitFor({timeout:35000});
  verify(report.checkpointStatuses.includes(200),
   'real History gesture checkpoints the current author text');
  const restoreChoose=page.getByRole('button',{name:'Restore version 1'});
  await restoreChoose.waitFor({timeout:35000});
  await restoreChoose.click();
  await page.getByRole('heading',{name:'Restore version 1?'}).waitFor();
  const confirmRestore=page.getByRole('button',{
   name:'Keep current and restore version 1',
  });
  verify(await confirmRestore.isEnabled(),
   'real member sees a distinct confirmation before restoring old words');
  report.revisionRestoreIntentVisible=true;
  await confirmRestore.click();
  for(let i=0;i<125&&!report.revisionRestoreStatuses.includes(200);i++)
   await page.waitForTimeout(120);
  verify(report.revisionRestoreStatuses.includes(200)&&
    report.checkpointStatuses.filter(x=>x===200).length>=2,
    'real confirm Restore writes an extra prior-content checkpoint and new revision');
  await page.locator('[data-write-editor]').first().waitFor({timeout:45000});
  const restoredRead=await desktop.request.get(
   origin+'/api/sovereign/manuscripts/'+firstCommittedId+'/draft',{
    headers:{'x-session-token':cookie},timeout:25000,
   });
  const restoredData=restoredRead.status()===200?await restoredRead.json():null;
  verify(restoredData?.content===draftContent.content &&
    restoredData?.revisionId>editedData.revisionId &&
    restoredData?.sectionAddressable===true,
    'physical PostgreSQL restored the exact original section-native draft bytes');
  verify(!(await page.locator('[data-write-editor]').first().innerText())
    .includes('R70 fictional author revision.'),
    'genuine Write editor reopened without the undone author edit');
  report.restoreCompleted=true;
  const outsider=await browser.newContext({viewport:{width:1280,height:820}});
  await outsider.addCookies([{name:'maia_session',value:other,url:origin,
    httpOnly:true,sameSite:'Strict'}]);
  await localRoutes(outsider);
  const otherRead=await outsider.request.get(
   origin+'/api/sovereign/manuscripts/'+firstCommittedId,{
    headers:{'x-session-token':other},timeout:20000,
   });
  verify(otherRead.status()===404,
    'other real SQL session cannot read author owned imported writing');
  const otherDraft=await outsider.request.get(
   origin+'/api/sovereign/manuscripts/'+firstCommittedId+'/draft',{
    headers:{'x-session-token':other},timeout:25000,
   });
  verify(otherDraft.status()===404,
    'other real SQL session cannot read author owned working draft');
  const otherReviews=await outsider.request.get(
   origin+'/api/sovereign/manuscripts/'+firstCommittedId+'/chapter-reviews?list=1',{
    headers:{'x-session-token':other},timeout:30000,
   });
  verify(otherReviews.status()===404,
    'other real SQL session cannot enumerate author owned Review records');
  const otherVersions=await outsider.request.get(
   origin+'/api/sovereign/manuscripts/'+firstCommittedId+'/draft/revisions',{
    headers:{'x-session-token':other},timeout:25000,
   });
  verify(otherVersions.status()===404,
   'other signed-in member cannot read the author revision history');
  const otherRestore=await outsider.request.post(
   origin+'/api/sovereign/manuscripts/'+firstCommittedId+'/draft/revisions',{
    headers:{'x-session-token':other,'content-type':'application/json'},
    data:{revisionNumber:1,baseRevisionId:1,
     idempotencyKey:'r70-outsider-restore-must-be-denied'},
    timeout:25000,
   });
  verify(otherRestore.status()===404,
   'other signed-in member cannot restore the author draft');
  await outsider.close();

  const mobile=await browser.newContext({viewport:{width:390,height:844},
    deviceScaleFactor:2,isMobile:true,hasTouch:true});
  await mobile.addCookies([{name:'maia_session',value:cookie,url:origin,
    httpOnly:true,sameSite:'Strict'}]);
  await localRoutes(mobile);
  const phone=await openPress(mobile);
  await phone.getByRole('heading',{name:'Import a manuscript'}).waitFor({
   timeout:25000,
  });
  const sizes=await phone.evaluate(()=>({
   viewport:document.documentElement.clientWidth,
   document:document.documentElement.scrollWidth,
  }));
  verify(sizes.document<=sizes.viewport+1,
    'real mobile Press import form has no 390px horizontal overflow');
  verify(await phone.locator('input[placeholder="Title of your manuscript"]').isVisible(),
    'real WebKit mobile Press retains visible title entry');
  await phone.goto(origin+'/writers-studio?mode=review&m='+firstCommittedId,{
   waitUntil:'domcontentloaded',timeout:75000,
  });
  await phone.getByText('There are no saved Reviews for this manuscript yet.',{
   exact:false,
  }).waitFor({timeout:45000});
  const reviewMobileSize=await phone.evaluate(()=>({
   viewport:document.documentElement.clientWidth,
   document:document.documentElement.scrollWidth,
  }));
  verify(reviewMobileSize.document<=reviewMobileSize.viewport+1,
    'actual mobile 390px Review has no horizontal overflow');
  report.mobileReviewReady=true;
  await phone.close();await mobile.close();
  await page.close();await desktop.close();
  report.actualSavedId=firstCommittedId;
  report.duplicateCount=repeats;
  verify(report.unexpectedWrites.every(name=>name==='/api/writers-studio/return/place'),
    'all incidental place writes were refused 423; no provider or other writes');
  verify(report.offHostRequestsBlocked===0,
    'genuine local Press browser made no off-host requests');
  report.status='R70_ACTUAL_AUTHOR_SAVE_HISTORY_RESTORE_WEBKIT_PASS_BETA_HOLD';
 }catch(err){
  report.error=String(err?.message||err).slice(0,450);
 }finally{
  if(browser){
   try{await browser.close();report.browserClosed=true;}catch{}
  }
  delete report.actualSavedId; // Never log even fictional Work IDs in receipt.
  delete report.screenshot; // Stored image is fictional; metadata-only receipt.
  console.log(JSON.stringify(report));
  if(report.error)process.exitCode=2;
 }
})();
