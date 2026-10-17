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
const path=require('node:path');
const {createHash}=require('node:crypto');
const {jsPDF}=require('jspdf');

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
 protocol:'soullab.ws.beta.r81.converged-author-four-file-actual-next.v1',
 sourceSha:process.env.R66_SOURCE_SHA,
 status:'R81_REAL_FOUR_FORMATS_AND_PRIVATE_AUTHOR_BROWSER_HOLD',
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
 r71Actions:[],r71StateReads:0,r71StateReplies:[],r71Reopens:0,r71Applied:false,r71Undone:false,
 r71ReplayStatuses:[],r71ForbiddenOriginStatus:null,dialogs:[],
 r72Actions:[],r72Stage:null,r72Revoked:false,r72ConsentRefusals:[],
 r72ForgedMaiaStatus:null,
 r77pStageStatuses:[],r77pReadStatuses:[],r77pPendingId:null,
 r77pReadVerified:false,r77pCrossMemberDenied:false,
 r77pForgedRequestDenied:false,r77pStaleReadDenied:false,
 r77pRevokedReadDenied:false,
 r79SealedApply:false,r79SeparateUndo:false,
 r79ReplayStatuses:[],r79NoAutoApply:true,
 r81FileUploads:[],r81FileSavedCount:0,r81FourFormatSourceCustody:false,
 r81DocxFidelityBrowserPassed:false,r81RefusedOtherWrites:[],
 screenshot:null,checks,error:null,
 navigationPathTrail:[],
};
let browser;
let seenConfirmation;
let firstCommittedId;
let failedReplySent=false;
let repeats=0;
let r71ApplyToken=null,r71UndoToken=null;
const milestone=(name)=>process.stderr.write('R72_STAGE_'+name+'\n');
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
  if(name==='/api/writers-studio/r77p-private-preview'&&
   (method==='POST'||method==='GET')){
   const backend=await route.fetch({timeout:45000});
   let data=null;try{data=await backend.json()}catch{}
   if(method==='POST'){
    report.r77pStageStatuses.push(backend.status());
    if(backend.status()===200&&
      data?.kind==='r77p_fictional_candidate_sealed'&&
      typeof data.pendingId==='string'){
     report.r77pPendingId=data.pendingId;
     verify(!JSON.stringify(data).includes('A fictional candle glows'),
      'sealing returns only an opaque pending ID and no confidential prose');
    }
   }else{
    report.r77pReadStatuses.push(backend.status());
   }
   return route.fulfill({response:backend});
  }
  if(name==='/api/writers-studio/r72-fixture-proposals'&&method==='POST'){
   const backend=await route.fetch({timeout:45000});
   let data=null;try{data=await backend.json()}catch{}
   let payload=null;try{payload=r.postDataJSON()}catch{}
   report.r72Actions.push({kind:payload?.kind??'unknown',status:backend.status()});
   if(payload?.kind==='stage_member_formulations'&&backend.status()===200){
    report.r72Stage={author:data?.author,alternatives:data?.alternatives};
   }
   return route.fulfill({response:backend});
  }
  if(name==='/api/writers-studio/r71-fixture-author'&&
   ['GET','POST'].includes(method)){
   const backend=await route.fetch({timeout:45000});
   let data=null;try{data=await backend.json()}catch{}
   if(method==='POST'){
    let request=null;try{request=r.postDataJSON()}catch{}
    report.r71Actions.push({kind:request?.kind??'unknown',status:backend.status()});
    if(request?.kind==='review_exact_passage'&&
      typeof data?.reviewToken==='string')r71ApplyToken=data.reviewToken;
    if(request?.kind==='review_last_apply_for_undo'&&
      typeof data?.undoToken==='string')r71UndoToken=data.undoToken;
   }else if(url.searchParams.get('mode')==='state'){
    report.r71StateReads++;
    report.r71StateReplies.push({status:backend.status(),
      reason:typeof data?.reason==='string'?data.reason:null});
   }
   else if(url.searchParams.get('mode')==='reopen')report.r71Reopens++;
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
/**
 * R81 additional real Next.js multipart ingest → member-confirmed
 * mechanical preview → file-backed Work Save → owned manuscript GET.
 * All four artifacts are synthetic and sent ONLY to disposable localhost.
 * The original R79 WebKit author gesture runs untouched afterward.
 *
 * TXT/MD/PDF are member-scoped Next API transactions; DOCX additionally
 * exercises the real WebKit file chooser, mandatory fidelity checkbox and
 * separate author Preview and Save actions. Actual device Safari remains
 * a distinct release gate.
 */
/** Genuine WebKit DOCX chooser, required member fidelity acknowledgement,
 * preview and file-backed Save. Does not bypass the React safety checkbox. */
async function acceptR81DocxThroughRealBrowser(subject){
 const imported=await browser.newContext({viewport:{width:1280,height:800}});
 await imported.addCookies([{name:'maia_session',value:cookie,url:origin,
  httpOnly:true,sameSite:'Strict'}]);
 await imported.route('**/*',async route=>{
  let u;try{u=new URL(route.request().url());}
  catch{return route.abort();}
  if(u.origin!==origin){report.offHostRequestsBlocked++;return route.abort();}
  if(!u.pathname.startsWith('/api/'))return route.continue();
  const method=route.request().method().toUpperCase();
  if(u.pathname==='/api/sovereign/manuscripts/ingest'&&method==='POST')
   return route.continue();
  if(u.pathname==='/api/sovereign/manuscripts'&&
    (method==='POST'||method==='GET'))return route.continue();
  if(method==='GET'||method==='HEAD')
   return route.fulfill(json({kind:'fictional_unavailable',items:[],works:[]},404));
  report.r81RefusedOtherWrites.push(u.pathname);
  return route.fulfill(json({error:'fictional_unapproved_writer_write'},423));
 });
 try{
  const page=await imported.newPage();
  await page.goto(origin+'/press/manuscript?import=1',{
   waitUntil:'domcontentloaded',timeout:70000});
  await page.getByRole('heading',{name:'Import a manuscript'}).waitFor({
   timeout:45000});
  const name='R81 Fictional DOCX Imported Work';
  await page.locator('input[placeholder="Title of your manuscript"]').fill(name);
  const uploadWait=page.waitForResponse(r=>
    new URL(r.url()).pathname==='/api/sovereign/manuscripts/ingest'&&
    r.request().method()==='POST',{timeout:100000});
  await page.locator('input[type="file"]').setInputFiles({
   name:subject.name,mimeType:subject.mimeType,buffer:subject.buffer});
  const resp=await uploadWait;
  let arrival=null;try{arrival=await resp.json()}catch{}
  verify(resp.status()===200&&
   typeof arrival?.sourceArrivalId==='string'&&
   Array.isArray(arrival.warnings)&&arrival.warnings.length>=1&&
   arrival.fidelity?.requiresReview===true&&
   arrival.text?.includes(subject.expected),
   'actual WebKit DOCX file chooser retains author wording and warns about Word fidelity');
  const previewButton=page.getByRole('button',{name:'Import into Author Studio'});
  const reviewBox=page.locator('label')
   .filter({hasText:'I have reviewed these conversion limits'})
   .locator('input[type="checkbox"]');
  await reviewBox.waitFor({timeout:35000});
  verify(await previewButton.isDisabled()&&!await reviewBox.isChecked(),
   'real DOCX writer cannot preview without acknowledging conversion limits');
  await reviewBox.check();
  verify(await previewButton.isEnabled(),
   'member explicitly acknowledges DOCX fidelity before editable preview');
  const previewWait=page.waitForResponse(r=>
   new URL(r.url()).pathname==='/api/sovereign/manuscripts'&&
   r.request().method()==='POST',{timeout:45000});
  await previewButton.click();
  const preview=await previewWait;
  let details=null;try{details=await preview.json()}catch{}
  verify(preview.status()===200&&
   Array.isArray(details?.preview)&&details.preview.some(s=>
    s.body?.includes(subject.expected)),
   'real DOCX fidelity-acknowledged preview retains selected author phrase');
  const saveButton=page.getByRole('button',{name:'Save manuscript'});
  await saveButton.waitFor({timeout:35000});
  verify(await saveButton.isEnabled(),
   'real DOCX author sees distinct final Save after fidelity acknowledgement');
  const saveWait=page.waitForResponse(r=>
   new URL(r.url()).pathname==='/api/sovereign/manuscripts'&&
   r.request().method()==='POST',{timeout:45000});
  await saveButton.click();
  const saved=await saveWait;
  let savedBody=null;try{savedBody=await saved.json()}catch{}
  verify(saved.status()===201&&
   typeof savedBody?.id==='string'&&
   savedBody?.sourceCustody==='source_custodied',
   'real DOCX author Save claims intact uploaded Source only after explicit review');
  await page.waitForURL(u=>
   u.pathname==='/writers-studio'&&
   u.searchParams.get('m')===savedBody.id,{
    waitUntil:'commit',timeout:35000});
  report.r81DocxFidelityBrowserPassed=true;
  return {arrivalId:arrival.sourceArrivalId,workId:savedBody.id,
   title:name,uploadStatus:resp.status(),previewStatus:preview.status(),
   saveStatus:saved.status()};
 }finally{
  await imported.close();
 }
}
async function proveR81RealFileUploads(context){
 const pdf=new jsPDF({unit:'pt',format:'letter',compress:false});
 pdf.setFont('times','normal');
 pdf.text('Chapter One - R81 Fictional PDF',45,60);
 for(let i=0;i<14;i++)pdf.text(
  'R81 fictional PDF text layer. The imagined river stays the author’s own.',
  45,87+i*27);
 pdf.addPage();
 pdf.text('Chapter Two - R81 Fictional PDF',45,60);
 for(let i=0;i<14;i++)pdf.text(
  'R81 fictional PDF text layer. The imagined river stays the author’s own.',
  45,87+i*27);
 const samples=[
  {format:'txt',name:'r81-fictional-lines.txt',mimeType:'text/plain',
   buffer:Buffer.from(
    'Chapter One\\r\\n\\r\\nR81 fictional TXT source line.\\r\\n\\tRiver leaves.\\r\\n',
    'utf8'),
   expected:'R81 fictional TXT source line.'},
  {format:'md',name:'r81-fictional-chapters.md',mimeType:'text/markdown',
   buffer:Buffer.from(
    '# Chapter One\\n\\nR81 fictional Markdown chapter.\\n\\n'+
    '## The Second Passage\\n\\nThe river holds a fictional lantern.\\n',
    'utf8'),
   expected:'R81 fictional Markdown chapter.'},
  {format:'docx',name:'r81-fictional-word.docx',
   mimeType:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
   buffer:fs.readFileSync(path.join(__dirname,
    '../../lib/manuscript/ingest/__tests__/fixtures/sample.docx')),
   expected:'The morning came slowly over the hills'},
  {format:'pdf',name:'r81-fictional-typed.pdf',mimeType:'application/pdf',
   buffer:Buffer.from(pdf.output('arraybuffer')),
   expected:'R81 fictional PDF text layer.'},
 ];
 for(const subject of samples){
  if(subject.format==='docx'){
   const word=await acceptR81DocxThroughRealBrowser(subject);
   const recheck=await context.request.get(
    origin+'/api/sovereign/manuscripts/'+word.workId,{
     headers:{'x-session-token':cookie},timeout:35000,
    });
   let reopened=null;try{reopened=await recheck.json()}catch{}
   verify(recheck.status()===200&&
    reopened?.manuscript?.id===word.workId&&
    reopened?.manuscript?.title===word.title&&
    Array.isArray(reopened?.sections)&&
    reopened.sections.some(s=>Number.isSafeInteger(s.chars)&&s.chars>0),
    'genuine DOCX browser import reopens owner metadata without private section prose');
   report.r81FileUploads.push({
    format:subject.format,uploadStatus:word.uploadStatus,
    previewStatus:word.previewStatus,saveStatus:word.saveStatus,
    reopenStatus:recheck.status(),arrivalId:word.arrivalId,
    workId:word.workId,
    contentSha256:createHash('sha256').update(subject.buffer).digest('hex'),
    artifactSize:subject.buffer.length,sourceCustody:'source_custodied',
    fidelityAcknowledgedInActualWebKit:true,
   });
   continue;
  }
  const reply=await context.request.post(
    origin+'/api/sovereign/manuscripts/ingest',{
    headers:{'x-session-token':cookie},
    multipart:{file:{name:subject.name,mimeType:subject.mimeType,
     buffer:subject.buffer}},timeout:100000,
  });
  let arrival=null;
  try{arrival=await reply.json()}catch{}
  verify(reply.status()===200&&
    typeof arrival?.sourceArrivalId==='string'&&
    /^[a-f0-9-]{36}$/i.test(arrival.sourceArrivalId)&&
    arrival?.text?.includes(subject.expected)&&
    Array.isArray(arrival.warnings)&&
    arrival.warnings.length===0,
   'real multipart '+subject.format+' upload preserves author phrase in owned Source');
  const name='R81 Fictional '+subject.format.toUpperCase()+' Imported Work';
  const preview=await context.request.post(
   origin+'/api/sovereign/manuscripts',{
    headers:{'x-session-token':cookie},
    data:{title:name,text:arrival.text},timeout:45000,
   });
  let proposed=null;try{proposed=await preview.json()}catch{}
  verify(preview.status()===200&&
   Array.isArray(proposed?.preview)&&proposed.preview.length>=1&&
   proposed.preview.some(s=>s.body?.includes(subject.expected)),
   'real Next mechanically previews exact '+subject.format+' upload before Save');
  const saved=await context.request.post(
    origin+'/api/sovereign/manuscripts',{
     headers:{'x-session-token':cookie},
     data:{title:name,sections:proposed.preview,
      sourceArrivalId:arrival.sourceArrivalId},timeout:45000,
    });
  let savedBody=null;try{savedBody=await saved.json()}catch{}
  verify(saved.status()===201&&typeof savedBody?.id==='string'&&
   savedBody?.sourceCustody==='source_custodied',
   'fictional member Save claims original '+subject.format+' artifact as Source custody');
  const reopen=await context.request.get(
   origin+'/api/sovereign/manuscripts/'+savedBody.id,{
    headers:{'x-session-token':cookie},timeout:35000,
   });
  let reopened=null;try{reopened=await reopen.json()}catch{}
  // The real GET route intentionally exposes section metadata/char counts
  // but not full section text. Do NOT weaken it to satisfy a test.
  // Exact saved prose and original-byte hashes are independently proven by
  // the disposable owner's SQL source/section joins in the PG runner.
  verify(reopen.status()===200&&reopened?.manuscript?.id===savedBody.id&&
   reopened.manuscript.title===name&&
   Array.isArray(reopened?.sections)&&reopened.sections.some(s=>
    Number.isSafeInteger(s.chars)&&s.chars>0),
   'verified member reopens '+subject.format+' owned metadata without source text disclosure');
  report.r81FileUploads.push({
   format:subject.format,uploadStatus:reply.status(),
   previewStatus:preview.status(),saveStatus:saved.status(),
   reopenStatus:reopen.status(),
   arrivalId:arrival.sourceArrivalId,workId:savedBody.id,
   contentSha256:createHash('sha256').update(subject.buffer).digest('hex'),
   artifactSize:subject.buffer.length,sourceCustody:savedBody.sourceCustody,
   // Do NOT include source/proposal prose or raw original bytes in the receipt.
  });
 }
 report.r81FileSavedCount=report.r81FileUploads.length;
 report.r81FourFormatSourceCustody=report.r81FileUploads.length===4&&
  report.r81FileUploads.every(x=>x.sourceCustody==='source_custodied');
 verify(report.r81FourFormatSourceCustody&&
   report.r81DocxFidelityBrowserPassed,
  'four real Next file-backed Works and explicit DOCX browser fidelity acknowledgement');
 milestone('r81_four_file_artifact_custody');
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
  await proveR81RealFileUploads(desktop);
  const page=await openPress(desktop);
  page.on('dialog',async modal=>{
   report.dialogs.push(modal.type());
   await modal.accept();
  });
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
  milestone('write_ready');
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
  milestone('review_round_trip');
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
  milestone('history_restore');

  // R71: real PC3 exact selection -> existing R54 author panel -> new
  // server-owned one-use approval -> canonical PG section writer -> new Undo.
  const revealMaia=page.getByRole('button',{name:'Show MAIA panel'});
  if(await revealMaia.count())await revealMaia.click();
  await page.locator('[data-r71-fixture-author-panel]').waitFor({timeout:45000});
  verify(await page.getByText('Fictional member-authored editorial comparison',{
   exact:false,
  }).isVisible(),'real PC3 distinguishes member-authored fiction from a MAIA response');
  await page.evaluate(()=>{
   const root=document.querySelector('[data-write-editor]');
   const p=[...(root?.querySelectorAll('p')||[])].find(e=>
    e.textContent?.includes('The river remembers'));
   if(!p)throw Error('R71 missing exact real rendered passage');
   const walk=document.createTreeWalker(p,NodeFilter.SHOW_TEXT);
   let targetNode=null,start=-1;
   while(walk.nextNode()){
    const s=walk.currentNode.textContent||'';
    const i=s.indexOf('fictional lantern');
    if(i>=0){targetNode=walk.currentNode;start=i;break;}
   }
   if(!targetNode)throw Error('R71 could not select exact text node');
   const range=document.createRange();
   range.setStart(targetNode,start);
   range.setEnd(targetNode,start+'fictional lantern'.length);
   const sel=window.getSelection();sel.removeAllRanges();sel.addRange(range);
   document.dispatchEvent(new Event('selectionchange'));
  });
  milestone('selected_exact_passage');
  // Real PC3 private-pending preview: member expressly opens a fictional
  // server-sealed encrypted response. There is no Apply affordance here.
  const privatePanel=page.locator('[data-r77p-private-preview]');
  await privatePanel.waitFor({timeout:35000});
  verify(await privatePanel.getByText('No MAIA model was called.',{
   exact:false,
  }).isVisible(),
   'real PC3 discloses no actual MAIA provider inference');
  await privatePanel.getByRole('button',{
   name:'Seal a fictional private suggestion',
  }).click();
  await privatePanel.getByRole('button',{
   name:'Read sealed fictional suggestion',
  }).waitFor({timeout:35000});
  verify(report.r77pStageStatuses.includes(200)&&
   typeof report.r77pPendingId==='string',
   'real authenticated Next stored one confidential pending candidate');
  await privatePanel.getByRole('button',{
   name:'Read sealed fictional suggestion',
  }).click();
  await privatePanel.locator('[data-r77p-private-revealed]')
   .waitFor({timeout:35000});
  const privateReview=await privatePanel.locator('[data-r77p-private-revealed]').innerText();
  verify(privateReview.includes('fictional candle')&&
   privateReview.includes('qwen2.5:7b')&&
   privateReview.includes('This is a fictional author-choice test.')&&
   report.r77pReadStatuses.includes(200),
   'real WebKit opens server-verified private text and exact synthetic served model');
  verify(await privatePanel.getByRole('button',{name:/^Apply/}).count()===0,
   'private pending preview exposes no author Apply control');
  report.r77pReadVerified=true;
  const wrongMember=await browser.newContext();
  const otherPrivate=await wrongMember.request.get(
   origin+'/api/writers-studio/r77p-private-preview?'+
    new URLSearchParams({manuscriptId:firstCommittedId,
      pendingId:report.r77pPendingId}),{
     headers:{'x-session-token':other},timeout:25000,
    });
  report.r77pCrossMemberDenied=otherPrivate.status()===404;
  verify(report.r77pCrossMemberDenied,
   'another member cannot decrypt or inspect the pending private suggestion');
  await wrongMember.close();
  const forgedPrivate=await desktop.request.post(
   origin+'/api/writers-studio/r77p-private-preview',{
    headers:{origin,'content-type':'application/json',
     'sec-fetch-site':'same-origin'},
    data:{kind:'stage_fictional_private_candidate',
      manuscriptId:firstCommittedId,
      sectionId:restoredData?.sections?.[0]?.id??'33333333-3333-4333-8333-333333333333',
      proposedText:'browser-forged proposal',
      provider:'anthropic'},timeout:25000,
   });
  report.r77pForgedRequestDenied=forgedPrivate.status()===400;
  verify(report.r77pForgedRequestDenied,
   'browser provider or proposed-word injection is refused before custody writes');
  milestone('private_review_verified');
  await page.locator('[data-r72-member-formulations]').waitFor({timeout:35000});
  await page.getByRole('textbox',{name:'Your first formulation'})
   .fill('fictional candle');
  await page.getByRole('textbox',{name:'Your second formulation'})
   .fill('fictional lantern at dusk');
  await page.getByRole('button',{name:'Keep my two formulations'}).click();
  await page.locator('[data-r54-original]').getByText('fictional lantern',{
   exact:true,
  }).waitFor({timeout:35000});
  verify(await page.locator('[data-r54-pc3-author-journey]').isVisible(),
   'actual R54 PC3 author panel follows a genuine rendered manuscript selection');
  milestone('member_formulation_response');
  verify(report.r72Stage?.author==='member'&&
   report.r72Stage?.alternatives?.length===2,
   'real member explicitly authored two immutable proposals; no MAIA attribution');
  const forged=await desktop.request.post(
   origin+'/api/writers-studio/r72-fixture-proposals',{
    headers:{'origin':origin,'x-session-token':cookie,'content-type':'application/json'},
    data:{kind:'stage_member_formulations',manuscriptId:firstCommittedId,
     author:'maia'},
    timeout:25000,
   });
  report.r72ForgedMaiaStatus=forged.status();
  verify(forged.status()===400,
   'a browser cannot claim MAIA as author of member-authored formulations');
  await page.locator('[data-r54-choice="'+
   report.r72Stage.alternatives[0].id+'"]').click();
  await page.getByRole('button',{name:'Read this revision in context'}).click();
  await page.locator('[data-r54-phase="reviewed"]').waitFor({timeout:35000});
  verify(await page.locator('[data-r54-after]').innerText()==='fictional candle',
   'exact server-owned fictional alternative is reviewed before permission to Apply');
  const preApplyRead=await desktop.request.get(
   origin+'/api/sovereign/manuscripts/'+firstCommittedId+'/draft',{
    headers:{'x-session-token':cookie},timeout:25000,
   });
  const beforeApplyDraft=await preApplyRead.json();
  verify(beforeApplyDraft.content===draftContent.content,
   'review itself made no manuscript mutation');
  await page.getByRole('button',{name:'Apply this revision'}).click();
  for(let i=0;i<100&&!report.r71Actions.some(x=>
   x.kind==='apply_reviewed_change'&&x.status===200);i++)
    await page.waitForTimeout(125);
  verify(report.r71Actions.some(x=>
   x.kind==='apply_reviewed_change'&&x.status===200),
   'real explicit R54 Apply consumed a single server-minted approval');
  await page.waitForTimeout(500);
  await page.locator('[data-write-editor]').first().waitFor({timeout:65000});
  const revealAfterApply=page.getByRole('button',{name:'Show MAIA panel'});
  if(await revealAfterApply.count())await revealAfterApply.click();
  await page.getByRole('button',{name:'Review Undo'}).waitFor({timeout:45000});
  const afterApplyRes=await desktop.request.get(
   origin+'/api/sovereign/manuscripts/'+firstCommittedId+'/draft',{
    headers:{'x-session-token':cookie},timeout:25000,
   });
  const afterApply=await afterApplyRes.json();
  verify(afterApply.content.includes('fictional candle')&&
    !afterApply.content.includes('fictional lantern.') &&
    afterApply.revisionId===beforeApplyDraft.revisionId+1,
    'real section-native PostgreSQL Apply advances only the intended text');
  report.r71Applied=true;
  const stalePrivate=await desktop.request.get(
   origin+'/api/writers-studio/r77p-private-preview?'+
    new URLSearchParams({manuscriptId:firstCommittedId,
      pendingId:report.r77pPendingId}),{
    headers:{'x-session-token':cookie},timeout:25000,
   });
  report.r77pStaleReadDenied=stalePrivate.status()===409;
  verify(report.r77pStaleReadDenied,
   'a changed draft head closes the older encrypted candidate immediately');
  milestone('protected_apply');
  await page.getByRole('button',{name:'Review Undo'}).click();
  await page.locator('[data-r54-phase="undo_reviewed"]').waitFor({timeout:35000});
  verify(!(await page.getByRole('button',{name:'Confirm Undo'}).isDisabled()),
   'separate Undo token was prepared by an explicit author review');
  await page.getByRole('button',{name:'Confirm Undo'}).click();
  for(let i=0;i<100&&!report.r71Actions.some(x=>
   x.kind==='undo_reviewed_change'&&x.status===200);i++)
    await page.waitForTimeout(125);
  verify(report.r71Actions.some(x=>
   x.kind==='undo_reviewed_change'&&x.status===200),
   'real distinct Undo gesture spent its own separate authorization');
  await page.locator('[data-write-editor]').first().waitFor({timeout:45000});
  const afterUndoRes=await desktop.request.get(
   origin+'/api/sovereign/manuscripts/'+firstCommittedId+'/draft',{
    headers:{'x-session-token':cookie},timeout:25000,
   });
  const afterUndo=await afterUndoRes.json();
  verify(afterUndo.content===draftContent.content &&
   afterUndo.revisionId===afterApply.revisionId+1,
   'real PG Undo restored original bytes as a NEW section-addressable draft version');
  report.r71Undone=true;
  milestone('separately_authorized_undo');
  verify(typeof r71ApplyToken==='string'&&typeof r71UndoToken==='string',
   'one-use approvals existed but are retained only in local test-process memory');
  for(const [kind,token] of [
   ['apply_reviewed_change',r71ApplyToken],
   ['undo_reviewed_change',r71UndoToken],
  ]){
   const replay=await desktop.request.post(
    origin+'/api/writers-studio/r71-fixture-author',{
     headers:{'origin':origin,'x-session-token':cookie,
      'content-type':'application/json','sec-fetch-site':'same-origin'},
     data:{kind,manuscriptId:firstCommittedId,opaqueToken:token},
     timeout:25000,
    });
   report.r71ReplayStatuses.push(replay.status());
   verify(replay.status()===409,
    'real Next refuses an already-consumed '+kind+' approval');
  }
  const crossOrigin=await desktop.request.post(
   origin+'/api/writers-studio/r71-fixture-author',{
    headers:{'origin':'https://not-soullab.example','x-session-token':cookie,
     'content-type':'application/json'},
    data:{kind:'apply_reviewed_change',manuscriptId:firstCommittedId,
     opaqueToken:r71ApplyToken},
    timeout:25000,
   });
  report.r71ForbiddenOriginStatus=crossOrigin.status();
  verify(crossOrigin.status()===403,
   'fictional writer editorial route rejects a cross-site Origin before token use');
  verify(report.r71Reopens>=2 && report.r71StateReads>=2,
   'R54 author actions independently reopened verified server state after each change');

  // R79: a NEW pending cipher is sealed only after the first author Undo
  // restores the original wording. It is bound to the NEW exact draft head
  // and independently to one exact Unicode passage locus. This is separate
  // from member-authored proposal_versions, which remain immutable.
  await page.locator('[data-write-editor]').first().waitFor({timeout:45000});
  await page.evaluate(()=>{
   const root=document.querySelector('[data-write-editor]');
   const p=[...(root?.querySelectorAll('p')||[])].find(x=>
    x.textContent?.includes('The river remembers'));
   if(!p)throw Error('R79 original paragraph not displayed');
   const walker=document.createTreeWalker(p,NodeFilter.SHOW_TEXT);
   let n=null,at=-1;
   while(walker.nextNode()){
    const i=(walker.currentNode.textContent||'').indexOf('fictional lantern');
    if(i>=0){n=walker.currentNode;at=i;break;}
   }
   if(!n)throw Error('R79 exact private target missing');
   const r=document.createRange();
   r.setStart(n,at);r.setEnd(n,at+'fictional lantern'.length);
   const s=window.getSelection();s.removeAllRanges();s.addRange(r);
   document.dispatchEvent(new Event('selectionchange'));
  });
  const r79panel=page.locator('[data-r77p-private-preview]');
  await r79panel.getByRole('button',{name:'Seal a fictional private suggestion'})
    .waitFor({timeout:35000});
  const previousStageCount=report.r77pStageStatuses.length;
  await r79panel.getByRole('button',{name:'Seal a fictional private suggestion'}).click();
  await r79panel.getByRole('button',{name:'Read sealed fictional suggestion'})
   .waitFor({timeout:45000});
  verify(report.r77pStageStatuses.length===previousStageCount+1&&
   report.r77pStageStatuses.at(-1)===200,
   'R79 new current draft version receives separate encrypted pending proposal');
  await r79panel.getByRole('button',{name:'Read sealed fictional suggestion'}).click();
  await r79panel.locator('[data-r77p-private-revealed]').waitFor({timeout:35000});
  verify(report.r77pReadStatuses.at(-1)===200,
   'encrypted candidate decrypted and served only after member consent and model witness');
  verify(await r79panel.getByRole('button',{
   name:'Apply this reviewed private suggestion',
  }).count()===0,
   'no Apply button appears before explicit exact private review');
  report.r79NoAutoApply=true;
  const r79First=await desktop.request.get(
   origin+'/api/sovereign/manuscripts/'+firstCommittedId+'/draft',{
    headers:{'x-session-token':cookie},timeout:25000,
   });
  const r79Before=await r79First.json();
  verify(r79Before.content===draftContent.content&&
   r79Before.revisionId===afterUndo.revisionId,
   'sealing and opening unpublished private candidate changed no manuscript words');
  const oldReviewCount=report.r71Actions.filter(x=>
    x.kind==='review_exact_passage').length;
  await r79panel.getByRole('button',{
   name:'Review this exact private suggestion',
  }).click();
  await r79panel.locator('[data-r79-exact-reviewed]').waitFor({timeout:35000});
  verify(report.r71Actions.filter(x=>
   x.kind==='review_exact_passage'&&x.status===200).length===oldReviewCount+1,
   'server opened exact sealed candidate under the same one-use review authority');
  verify((await r79panel.locator('[data-r79-exact-reviewed]').innerText())
   .includes('fictional candle'),
   'writer confirms exact original and private suggested words before Apply');
  const oldApplyCount=report.r71Actions.filter(x=>
   x.kind==='apply_reviewed_change'&&x.status===200).length;
  await r79panel.getByRole('button',{
    name:'Apply this reviewed private suggestion',
  }).click();
  for(let i=0;i<120&&report.r71Actions.filter(x=>
   x.kind==='apply_reviewed_change'&&x.status===200).length<=oldApplyCount;i++)
   await page.waitForTimeout(120);
  verify(report.r71Actions.filter(x=>
   x.kind==='apply_reviewed_change'&&x.status===200).length===oldApplyCount+1,
   'R79 Apply explicitly spent one private one-use review token');
  const r79Saved=await desktop.request.get(
   origin+'/api/sovereign/manuscripts/'+firstCommittedId+'/draft',{
    headers:{'x-session-token':cookie},timeout:25000,
   });
  const r79Applied=await r79Saved.json();
  verify(r79Applied.content.includes('fictional candle')&&
   r79Applied.revisionId===r79Before.revisionId+1,
   'encrypted proposed text reached only the author-owned canonical working draft');
  report.r79SealedApply=true;
  milestone('r79_sealed_explicit_apply');
  await page.locator('[data-write-editor]').first().waitFor({timeout:45000});
  const privateUndo=page.getByRole('button',{name:'Review Undo'});
  await privateUndo.waitFor({timeout:45000});
  await privateUndo.click();
  await page.getByRole('button',{name:'Confirm Undo'}).waitFor({timeout:45000});
  const r79UndoCount=report.r71Actions.filter(x=>
    x.kind==='undo_reviewed_change'&&x.status===200).length;
  await page.getByRole('button',{name:'Confirm Undo'}).click();
  for(let i=0;i<120&&report.r71Actions.filter(x=>
    x.kind==='undo_reviewed_change'&&x.status===200).length<=r79UndoCount;i++)
    await page.waitForTimeout(120);
  verify(report.r71Actions.filter(x=>
    x.kind==='undo_reviewed_change'&&x.status===200).length===r79UndoCount+1,
    'R79 independent Undo gesture consumed a fresh authorization');
  const r79Revert=await desktop.request.get(
   origin+'/api/sovereign/manuscripts/'+firstCommittedId+'/draft',{
    headers:{'x-session-token':cookie},timeout:25000,
   });
  const r79Undone=await r79Revert.json();
  verify(r79Undone.content===draftContent.content&&
   r79Undone.revisionId===r79Applied.revisionId+1,
   'separately reviewed author Undo restores exactly the original prose again');
  report.r79SeparateUndo=true;
  const r79SpentTokens=[r71ApplyToken,r71UndoToken];
  for(const [i,k] of r79SpentTokens.entries()){
   const replay=await desktop.request.post(
    origin+'/api/writers-studio/r71-fixture-author',{
     headers:{origin,'x-session-token':cookie,
      'content-type':'application/json','sec-fetch-site':'same-origin'},
     data:{kind:i===0?'apply_reviewed_change':'undo_reviewed_change',
      manuscriptId:firstCommittedId,opaqueToken:k},timeout:25000,
    });
   report.r79ReplayStatuses.push(replay.status());
   verify(replay.status()===409,'R79 spent private author token cannot be replayed');
  }
  milestone('r79_separate_undo_and_spent_replays');
  const revoke=await desktop.request.post(
   origin+'/api/writers-studio/r72-fixture-proposals',{
    headers:{'origin':origin,'x-session-token':cookie,
     'content-type':'application/json','sec-fetch-site':'same-origin'},
    data:{kind:'revoke_fictional_writer_consent'},timeout:25000,
   });
  verify(revoke.status()===200,
   'fictional member records a later explicit Writer beta consent revocation');
  report.r72Revoked=true;
  const revokedPrivate=await desktop.request.get(
   origin+'/api/writers-studio/r77p-private-preview?'+
    new URLSearchParams({manuscriptId:firstCommittedId,
      pendingId:report.r77pPendingId}),{
    headers:{'x-session-token':cookie},timeout:25000,
   });
  report.r77pRevokedReadDenied=revokedPrivate.status()===403;
  verify(report.r77pRevokedReadDenied,
   'a later consent revocation prevents decryption before SQL private read');
  milestone('consent_revoked');
  const readAfterRevoke=await desktop.request.get(
   origin+'/api/writers-studio/r71-fixture-author?'+
     new URLSearchParams({mode:'state',manuscriptId:firstCommittedId}),{
    headers:{'x-session-token':cookie},timeout:25000,
   });
  report.r72ConsentRefusals.push(readAfterRevoke.status());
  verify(readAfterRevoke.status()===403,
   'revocation immediately denies later editorial preview reads');
  const stageAfterRevoke=await desktop.request.post(
   origin+'/api/writers-studio/r72-fixture-proposals',{
    headers:{'origin':origin,'x-session-token':cookie,
     'content-type':'application/json','sec-fetch-site':'same-origin'},
    data:{kind:'stage_member_formulations',manuscriptId:firstCommittedId,
     sectionId:afterUndo.sections?.[0]?.id??'33333333-3333-4333-8333-333333333333',
     expectedGeneration:afterUndo.revisionId,
     selected:{start:0,end:1,text:'x'},
     formulations:['fictional one','fictional two']},timeout:25000,
   });
  report.r72ConsentRefusals.push(stageAfterRevoke.status());
  verify(stageAfterRevoke.status()===403,
   'revoked writer cannot stage another proposal even with a valid session');

  // Retain the original author isolation proofs and mobile test.
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
  const otherAuthor=await outsider.request.get(
   origin+'/api/writers-studio/r71-fixture-author?'+
     new URLSearchParams({manuscriptId:firstCommittedId,mode:'state'}),{
    headers:{'x-session-token':other},timeout:25000,
   });
  verify(otherAuthor.status()===404,
   'another verified member cannot read an author editorial approval state');
  const foreignApply=await outsider.request.post(
   origin+'/api/writers-studio/r71-fixture-author',{
    headers:{'origin':origin,'x-session-token':other,
      'content-type':'application/json','sec-fetch-site':'same-origin'},
    data:{kind:'apply_reviewed_change',manuscriptId:firstCommittedId,
     opaqueToken:r71ApplyToken},timeout:25000,
   });
  verify(foreignApply.status()===404,
   'another verified member cannot consume someone else’s opaque Apply approval');
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
  milestone('mobile_finished');
  // Context teardown after consent revocation can wait on a blocked
  // beforeunload/navigation. Browser.close owns ALL disposable contexts
  // together in finally, without a member UI reload or Save attempt.
  milestone('browser_owned_teardown');
  report.actualSavedId=firstCommittedId;
  report.duplicateCount=repeats;
  verify(report.unexpectedWrites.every(name=>name==='/api/writers-studio/return/place'),
    'all incidental place writes were refused 423; no provider or other writes');
  verify(report.offHostRequestsBlocked===0,
    'genuine local Press browser made no off-host requests');
  report.status='R81_REAL_FOUR_FORMATS_AND_PRIVATE_AUTHOR_WEBKIT_PASS_BETA_HOLD';
 }catch(err){
  report.error=String(err?.message||err).slice(0,450);
 }finally{
  if(browser){
   try{
    milestone('browser_closing');
    await browser.close();
    milestone('browser_closed');
    report.browserClosed=true;
   }catch{}
  }
  delete report.actualSavedId; // Never log even fictional Work IDs in receipt.
  delete report.screenshot; // Stored image is fictional; metadata-only receipt.
  console.log(JSON.stringify(report));
  if(report.error)process.exitCode=2;
 }
})();
