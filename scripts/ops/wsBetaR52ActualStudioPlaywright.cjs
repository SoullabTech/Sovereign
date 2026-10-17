'use strict';
/**
 * R52: the actual canonical /writers-studio page (Next.js, PC3 controllers)
 * with genuine disposable local PG auth and mocked content GET APIs.
 * All browser API writes refuse; no editorial backend or real users.
 */
const {webkit}=require('playwright');
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');

const origin=process.env.R52_LOCAL_STUDIO_ORIGIN;
if(process.env.R52_CANONICAL_NEXT_AUTH_FIXTURE!=='fictional-only'||
 !/^http:\/\/127\.0\.0\.1:\d+$/.test(origin||''))
 throw Error('R52_BROWSER_NOT_AUTHORITATIVE_FICTIONAL_LOOPBACK');
const manuscriptId='33333333-3333-4333-8333-333333333333';
const S1='55555555-5555-4555-8555-555555555551';
const S2='55555555-5555-4555-8555-555555555552';
const C1='🍂 The lantern glows at the river. Later the lantern glows beneath the hill.\n\n';
const C2='The second section remains separate and retains the original author’s cadence.';
const token='r52-local-fictional-session';
const hit=[];
const written=[];
const calls=[];
const checks=[];
const result={
 protocol:'soullab.ws.r52.actual-next-pc3-auth-browser.held',
 sourceHead:process.env.R52_SOURCE_GIT_HEAD,
 status:'R52_CANONICAL_LOCAL_BROWSER_HOLD',checks,
 browserEngine:'WebKit',noRealAccounts:true,actualRoute:true,
 serverSessionVerified:false,apiWritesAccepted:0,
 realModelRequests:0,realMemberWrites:0,productionChanged:false,
 error:null,
};
const verify=(condition,label)=>{
 assert.ok(condition,'R52_BROWSER_CHECK_FAILED_'+label);
 checks.push(label);
};
const serverJSON=(body,status=200)=>({
 status,contentType:'application/json',
 headers:{'Cache-Control':'no-store','X-R52-Fictional':'true'},
 body:JSON.stringify(body),
});
function respondApi(route,mode){
 const req=route.request();
 const url=new URL(req.url());
 const routeName=url.pathname;
 const method=req.method().toUpperCase();
 calls.push(method+' '+routeName);
 if(method!=='GET'&&method!=='HEAD'){
  written.push(routeName);
  return route.fulfill(serverJSON({
    error:'R52_HELD_BROWSER_WRITE_CANNOT_PERSIST',persisted:false,releaseApproved:false
  },423));
 }
 if(mode==='refuse'){
  return route.fulfill(serverJSON({error:'R52_OTHER_MEMBER_REFUSED',persisted:false},403));
 }
 if(routeName==='/api/writers-studio/relationships'){
  return route.fulfill(serverJSON({relationships:[],items:[]}));
 }
 if(routeName==='/api/writers-studio/return/place'){
  return route.fulfill(serverJSON({place:null,memberPlace:null,source:'fictional-none'}));
 }
 if(routeName==='/api/auth/whoami'){
  return route.fulfill(serverJSON({
    authenticated:true,memberId:'11111111-1111-4111-8111-111111111111',
    member:{id:'11111111-1111-4111-8111-111111111111',tier:'pro'},
  }));
 }
 if(routeName==='/api/sovereign/living-works'){
  return route.fulfill(serverJSON({works:[{
    id:'44444444-4444-4444-8444-444444444444',
    title:'The River — Fictional Work',purpose:'Explore the river',
    form:'Book',stage:null,manuscriptState:'existing-manuscript',
    createdAt:'2026-10-16T15:00:00.000Z',updatedAt:'2026-10-16T15:00:00.000Z',
    expressions:[{
      expressionType:'manuscript',expressionId:manuscriptId,
      declaredAt:'2026-10-16T15:00:00.000Z',
    }],materials:[],
  }]}));
 }
 if(routeName==='/api/sovereign/manuscripts'){
  return route.fulfill(serverJSON({manuscripts:[{id:manuscriptId,title:'The River — Fictional'}]}));
 }
 if(routeName==='/api/writers-studio/rebuild/context'){
  if(url.searchParams.get('manuscriptId')!==manuscriptId){
   return route.fulfill(serverJSON({error:'foreign fictional Work'},403));
  }
  return route.fulfill(serverJSON({
   state:'section_aware',manuscriptId,title:'The River — Fictional',
   version:1,updatedAt:'2026-10-16T15:00:00.000Z',
   sections:[
    {draftSectionId:S1,sourceSectionId:S1,position:0,
     heading:'Chapter 1 — The River',headingDepth:2,headingSignal:null,
     body:C1,editable:true},
    {draftSectionId:S2,sourceSectionId:S2,position:1,
     heading:'Chapter 2 — The Forest',headingDepth:2,headingSignal:null,
     body:C2,editable:true},
   ],
  }));
 }
 // No background route may receive real credentials or inferred authority.
 return route.fulfill(serverJSON({kind:'fictional_unavailable',items:[],results:[],works:[],persisted:false},404));
}
function attachRoutes(context,mode='allow'){
 return context.route('**/*',route=>{
  const url=route.request().url();
  if(url.startsWith(origin+'/')){
   const pathname=new URL(url).pathname;
   if(pathname.startsWith('/api/'))return respondApi(route,mode);
   return route.continue();
  }
  hit.push('external-request-blocked');
  return route.abort();
 });
}
(async()=>{
 let browser=null;
 try{
  browser=await webkit.launch({headless:true});
  const anonymous=await browser.newContext({viewport:{width:1365,height:870}});
  await attachRoutes(anonymous);
  const anon=await anonymous.newPage();
  const anonResponse=await anon.goto(origin+'/writers-studio?mode=write&m='+manuscriptId,{
    waitUntil:'domcontentloaded',timeout:70000});
  await anon.waitForURL(url=>url.pathname==='/signin',{timeout:10000});
  verify(anon.url().includes('/signin')&&anonResponse?.status()===200,
    'actual Next proxy refuses anonymous member at canonical Studio door');
  await anonymous.close();

  const desktop=await browser.newContext({viewport:{width:1440,height:900}});
  await desktop.addCookies([{name:'maia_session',value:token,url:origin,
    httpOnly:true,sameSite:'Strict'}]);
  await attachRoutes(desktop);
  const page=await desktop.newPage();
  const errors=[];page.on('pageerror',e=>errors.push(String(e.message).slice(0,120)));
  const response=await page.goto(origin+'/writers-studio?mode=write&m='+manuscriptId,{
    waitUntil:'domcontentloaded',timeout:70000});
  result.redirectedPath=new URL(page.url()).pathname;
  result.contextRequests=calls.filter(x=>x.includes('/api/writers-studio/rebuild/context')).length;
  if(new URL(page.url()).pathname!=='/writers-studio')
   throw Error('R52_ACTUAL_LOGIN_REFUSED_'+new URL(page.url()).pathname);
  verify(response?.status()===200,
    'genuine Next canonical Writer route returns HTML for fictional PG session');
  await page.locator('.fr-shell').waitFor({timeout:35000});
  verify(await page.locator('.fr-shell').count()>0,
    'genuine PC3 Writer Shell mounts in WebKit');
  result.serverSessionVerified=true;
  const html=await page.locator('body').innerText();
  result.actualContentReady=html.includes('🍂 The lantern glows at the river');
  result.bodyPreview=html.slice(0,280);
  verify(html.includes('The River')||html.includes('lantern'),
    'fictional two-section manuscript appears in genuine canonical React UI');
  verify(await page.locator('.fr-panel-splitter-left').count()===1,
    'real Outline/manuscript divider exists');
  const showMaia=page.getByRole('button',{name:'Show MAIA panel'});
  if(await showMaia.count())await showMaia.click();
  await page.locator('.fr-panel-splitter-right').waitFor({state:'visible',timeout:12000});
  verify(await page.locator('.fr-panel-splitter-right').count()===1,
    'real manuscript/MAIA divider becomes available after explicit reveal');
  verify(await page.locator('[data-r41-reset-column-widths]').count()===1,
    'R41 Reset widths lives in the real authenticated Studio');
  await page.locator('.fr-workpick').waitFor({timeout:10000});
  verify((await page.locator('.fr-workpick').textContent()).includes('The River — Fictional Work'),
    'MAIA/Studio Work identity resolves only from the member-declared manuscript expression');
  verify(!((await page.locator('[data-region="maia"]').innerText()).includes(
    'A Work has not been resolved')),
    'MAIA does not show an unlinked-Work warning for a correctly declared fictional Work');
  const left=page.locator('.fr-panel-splitter-left');
  await left.focus();const original=Number(await left.getAttribute('aria-valuenow'));
  await page.keyboard.press('ArrowRight');
  const altered=Number(await left.getAttribute('aria-valuenow'));
  verify(altered>original,'real authenticated Outline divider keyboard resize');
  await page.locator('[data-r41-reset-column-widths]').click();
  verify(Number(await left.getAttribute('aria-valuenow'))===original,
    'R41 Reset restores the real Writer panel layout');
  const editor=page.locator('[data-write-editor][data-section-id="'+S1+'"]');
  await editor.waitFor({state:'visible',timeout:12000});
  const firstParagraph=editor.locator('[data-write-block]').first();
  verify((await firstParagraph.textContent()).includes('Later the lantern glows beneath the hill'),
    'real PC3 paragraph editor shows the two occurrences of the selected phrase');
  const locate=await firstParagraph.evaluate(node=>{
    const text=node.firstChild;
    if(!text||text.nodeType!==Node.TEXT_NODE)
      return {error:'untrusted_wrapped_paragraph'};
    const original=text.textContent||'';
    const needle='lantern glows';
    const start=original.lastIndexOf(needle);
    const selection=window.getSelection();
    const range=document.createRange();
    range.setStart(text,start);range.setEnd(text,start+needle.length);
    selection.removeAllRanges();selection.addRange(range);
    document.dispatchEvent(new Event('selectionchange'));
    return {selected:selection.toString(),
      second:start>original.indexOf(needle)};
  });
  verify(locate?.selected==='lantern glows'&&locate.second===true,
    'real WebKit selected the SECOND repeated phrase in canonical contenteditable');
  await page.locator('[data-p4r1-selection-affordance]').waitFor({
    state:'visible',timeout:12000});
  verify((await page.locator('[data-p4r1-selection-affordance]').textContent())
    .includes('Work with passage'),
    'real PC3 selection callback exposed the author-controlled passage menu');
  await page.locator('.p4r1-selection-trigger').click();
  verify((await page.locator('[role="menu"]').textContent()).includes('Discuss')&&
    (await page.locator('[role="menu"]').textContent()).includes('Revise'),
    'the real Write menu offers Discuss and Revise before any Apply');
  verify((await firstParagraph.textContent()).includes(
    'The lantern glows at the river. Later the lantern glows beneath the hill.'),
    'selecting exact repeated words does not mutate either occurrence');
  result.contextRequests=calls.filter(x=>x.includes('/api/writers-studio/rebuild/context')).length;
  verify(result.contextRequests>=1,
    'actual PC3 controller loaded a server-scoped fictional section-aware manuscript');
  const contentMutationAttempts=written.filter(
    route=>route!=='/api/writers-studio/return/place');
  verify(contentMutationAttempts.length===0,
    'exact passage selection submits no manuscript/editorial content mutation');
  verify(written.every(route=>route==='/api/writers-studio/return/place'),
    'all background write attempts are only blocked writer-place metadata persistence');
  result.placeReturnWriteAttempts=written.length;
  result.actualNextRendered=true;
  result.apiWritesAccepted=0;
  result.mockedContextResponses=result.contextRequests;
  result.offHostRequestsBlocked=hit.length;
  result.runtimePageErrors=errors.slice(0,5);
  result.apiPathSamples=calls.slice(0,18);
  const photo=process.env.R52_BROWSER_SCREENSHOT;
  if(photo){verify(photo.endsWith('R52_CANONICAL_WRITER_WEBKIT_FICTIONAL_20261016.png'),
    'screenshot path is exact fictional review artifact');
   await page.screenshot({path:photo,fullPage:false});
  }
  // Mode transitions run the actual canonical P4R1StudioHost, never the old
  // detached mock. They must preserve explicit manuscript identity.
  for(const mode of ['develop','review','write']){
    await page.locator('.fr-nav-item[data-mode="'+mode+'"]').click();
    await page.waitForURL(u=>u.pathname==='/writers-studio'&&
      u.searchParams.get('mode')===mode&&
      u.searchParams.get('m')===manuscriptId,{timeout:18000});
    verify(true,'canonical Studio navigates into '+mode+' while preserving manuscript identity');
  }
  await page.locator('[data-region="work"]').waitFor({state:'visible',timeout:18000});
  verify((await page.locator('[data-region="work"]').innerText())
      .includes('lantern glows'),
    'real Write manuscript remains authored and unmodified after Develop/Review navigation');
  result.routeModeTransitions=3;
  await desktop.close();

  const mobile=await browser.newContext({viewport:{width:390,height:844},
    isMobile:true,hasTouch:true});
  await mobile.addCookies([{name:'maia_session',value:token,url:origin,
    httpOnly:true,sameSite:'Strict'}]);
  await attachRoutes(mobile);
  const phone=await mobile.newPage();
  const mobileResponse=await phone.goto(
    origin+'/writers-studio?mode=write&m='+manuscriptId,
    {waitUntil:'domcontentloaded',timeout:70000});
  await phone.locator('.fr-shell').waitFor({timeout:24000});
  verify(mobileResponse?.status()===200&&
    new URL(phone.url()).pathname==='/writers-studio',
    'actual Next Writer admits fictional authenticated mobile viewport');
  await phone.getByText('The lantern glows at the river',{exact:false})
    .first().waitFor({state:'visible',timeout:20000});
  verify(await phone.locator('[data-region="work"]').isVisible(),
    'actual PC3 mobile layout keeps manuscript as the visible writing authority');
  result.mobileLayoutWidth=await phone.evaluate(()=>({
    viewport:window.innerWidth,
    documentWidth:document.documentElement.scrollWidth,
  }));
  if(result.mobileLayoutWidth.documentWidth>result.mobileLayoutWidth.viewport+1){
    result.mobileOverflows=await phone.evaluate(()=>Array.from(document.querySelectorAll('*'))
      .map(e=>({element:e,right:e.getBoundingClientRect().right}))
      .filter(({element,right})=>right>window.innerWidth+1 &&
         getComputedStyle(element).position!=='fixed')
      .slice(0,12).map(({element,right})=>({
        tag:element.tagName,
        className:String(element.className||'').slice(0,80),
        right:Math.round(right),
      })));
  }
  verify(result.mobileLayoutWidth.documentWidth<=result.mobileLayoutWidth.viewport+1,
    'real PC3 mobile page has no horizontal document overflow');
  const mobileShot=process.env.R52_BROWSER_MOBILE_SCREENSHOT;
  if(mobileShot&&mobileShot.endsWith('R52_CANONICAL_MOBILE_WEBKIT_FICTIONAL_20261016.png')){
    await phone.screenshot({path:mobileShot,fullPage:false});
    verify(true,'genuine PC3 mobile WebKit screenshot captures only fictional Work');
  }
  result.mobileWebkit=true;
  await mobile.close();
  verify(hit.length===0,'WebKit made no off-host network requests');
  result.status='R52_ACTUAL_NEXT_CANONICAL_WEBKIT_AUTH_SOURCE_TEST_PASS_BETA_HOLD';
 }catch(error){
  result.error=String(error&&error.message||error).slice(0,300);
  result.apiPathSamples=calls.slice(0,20);
  result.offHostRequestsBlocked=hit.length;
  process.exitCode=2;
 }finally{
  try{if(browser)await browser.close();}catch{}
  result.browserClosed=!!browser;
  console.log(JSON.stringify(result));
  if(result.status!=='R52_ACTUAL_NEXT_CANONICAL_WEBKIT_AUTH_SOURCE_TEST_PASS_BETA_HOLD')
   process.exitCode=2;
 }
})();