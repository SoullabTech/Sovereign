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
 protocol:'soullab.ws.beta.r66.real-next-press-browser-fictional.v1',
 sourceSha:process.env.R66_SOURCE_SHA,
 status:'R66_REAL_PRESS_BROWSER_HOLD',
 browser:'WebKit',realNextPage:true,
 actualContentAPIGetAndPost:true,
 sourceTextFictional:true,
 actualSavedId:null,
 firstSaveStatus:null,secondSaveStatus:null,
 duplicateCount:0,confirmationStable:false,
 offHostRequestsBlocked:0,unexpectedWrites:[],
 browserClosed:false,previewPostCount:0,
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
  await phone.close();await mobile.close();
  await page.close();await desktop.close();
  report.actualSavedId=firstCommittedId;
  report.duplicateCount=repeats;
  verify(report.unexpectedWrites.length===0,
    'no unrelated writer/model/provider mutations executed from browser');
  verify(report.offHostRequestsBlocked===0,
    'genuine local Press browser made no off-host requests');
  report.status='R66_ACTUAL_NEXT_PRESS_WEBKIT_IMPORT_RETRY_PASS_BETA_HOLD';
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
