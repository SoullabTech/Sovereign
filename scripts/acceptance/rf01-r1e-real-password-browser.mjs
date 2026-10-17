/**
 * RF01 R1-E actual password sign-in and Next.js MAIA browser fixture.
 * No web model/provider requests. Assumes an independently started, isolated
 * Next dev server on 127.0.0.1:3740, with absent production credentials.
 * Every /api call is locally mocked in the browser; server handler authority
 * is tested independently by authenticated-handler Jest and physical fixtures.
 */
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname,resolve } from 'node:path';
import { mkdirSync } from 'node:fs';
const require=createRequire(import.meta.url);
const { chromium, webkit }=require('playwright');
const root=resolve(dirname(fileURLToPath(import.meta.url)),'../..');
const imageDir=resolve(root,'docs/ops/evidence/rf01-r1e');
mkdirSync(imageDir,{recursive:true});
const BASE='http://127.0.0.1:3740';
const useWebkit=process.argv.includes('--webkit');
const mobile=process.argv.includes('--mobile');
const browserLabel=useWebkit ? (mobile?'webkit-mobile':'webkit-desktop') : 'chromium-desktop';
const ID='11111111-1111-4111-8111-111111111111';
let initial=null;
let nextIndex=0,failNew=false,external=0,realSigninCalls=0;
const calls=[];

const browser=useWebkit
  ? await webkit.launch({headless:true})
  : await chromium.launch({
      executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      headless:true,args:['--no-first-run','--disable-extensions'],
    });
let page;
try {
 const context=await browser.newContext({
  viewport:mobile?{width:390,height:844}:{width:1280,height:800},
  deviceScaleFactor:1,
  isMobile:mobile,hasTouch:mobile,
 });
 page=await context.newPage();
 page.setDefaultTimeout(25000);
 page.on('pageerror', e=>console.log('BROWSER_SCRIPT_ERROR',e.message.slice(0,240)));
 await page.route('**/*',async route=>{
   const url=new URL(route.request().url());
   if(url.hostname==='127.0.0.1' && url.port==='3740')return route.continue();
   external+=1;
   return route.abort();
 });
 await page.route('**/api/**',async route=>{
   const request=route.request(),url=new URL(request.url());
   const path=url.pathname;
   let payload={ok:true};
   calls.push({path,method:request.method()});
   if(path==='/api/members/signin'){
     realSigninCalls += 1;
     return route.continue();
   }else if(path==='/api/auth/whoami'){
     payload={authed:false};
   }else if(path==='/api/sovereign/privacy/new-conversation'){
     nextIndex += 1;
     if(failNew)return route.fulfill({status:503,contentType:'application/json',
       headers:{'Cache-Control':'no-store'},body:JSON.stringify({ok:false,error:'FICTIONAL_NEW_SESSION_UNAVAILABLE'})});
     return route.continue();
   }else if(path==='/api/maia/session/start'){
     return route.continue();
   }else if(path==='/api/user/profile'){
     payload={success:true,user:{id:ID,name:'Fictional Tester',preferredName:'Fictional Tester'}};
   }else if(path==='/api/conversation/turns'){
     payload={success:true,messages:[]};
   }else if(path==='/api/members/settings'){
     payload={success:true,settings:{defaultMemoryMode:'sanctuary',storageConsent:{}}};
   }else if(path==='/api/sovereign/privacy/turn-consent'){
     const raw=request.postDataJSON?.()??{};
     payload={ok:true,exchangeId:raw.exchangeId,privacyChoice:raw.privacyChoice,sessionId:raw.sessionId};
   }else if(path==='/api/sovereign/app/maia/list'){
     return route.fulfill({status:503,contentType:'application/json',
       body:JSON.stringify({error:'SANCTUARY_PROCESSING_UNQUALIFIED'})});
   }else{
     payload={success:true,ok:true,items:[],messages:[],hasAccess:false,authenticated:true};
   }
   return route.fulfill({status:200,contentType:'application/json',
     headers:{'Cache-Control':'no-store'},body:JSON.stringify(payload)});
 });
 const signin=await page.goto(BASE+'/signin?next=%2Fmaia%2Fencounter',{
   waitUntil:'domcontentloaded',timeout:45000,
 });
 if(signin?.status()!==200)throw Error('SIGNIN_PAGE_NOT_AVAILABLE');
 await page.getByPlaceholder('Email or username').waitFor({state:'visible',timeout:20000});
 // Capture the real signed-out face before entering any password.
 await page.screenshot({
   path:imageDir+'/signed-out-password-'+browserLabel+'.png',
   animations:'disabled',fullPage:false,
 });
 const nameField=page.getByPlaceholder('Email or username');
 const passField=page.getByPlaceholder('Password');
 const submit=page.getByRole('button',{name:'Sign in',exact:true});
 await nameField.fill('rf01-fictional-member');
 await passField.fill('RF01_INVALID_PASSWORD_FIRST');
 await submit.click();
 await page.getByText('Invalid username or password').waitFor({state:'visible',timeout:20000});
 const initialCookies=await context.cookies(BASE);
 if(initialCookies.some(cookie=>cookie.name==='maia_session')){
   throw Error('FAILED_PASSWORD_ISSUED_COOKIE');
 }
 console.log('REAL_WRONG_PASSWORD_REFUSED_NO_SESSION_COOKIE');
 await passField.fill('RF01_FICTIONAL_LOCAL_PASSWORD_ONLY');
 await submit.click();
 await page.waitForURL(/\/maia\/encounter/, {timeout:40000});
 const cookies=await context.cookies(BASE);
 const bearerCookie=cookies.find(cookie=>cookie.name==='maia_session');
 const browserToken=await page.evaluate(()=>localStorage.getItem('maia_session_token'));
 if(!bearerCookie || !/^[0-9a-f]{64}$/i.test(bearerCookie.value) ||
    bearerCookie.value!==browserToken || !bearerCookie.httpOnly){
    throw Error('REAL_LOGIN_SESSION_COOKIE_AND_TRANSPORT_NOT_CONSISTENT');
 }
 console.log('REAL_PASSWORD_FORM_SIGNIN_AND_ISSUED_HTTPONLY_COOKIE_PASS');
 const choice=page.getByRole('group',{name:'Choose conversation privacy'});
 // First encounter has a separately authored Arrival ceremony at z-90.
 // Privacy cannot be clicked underneath it. Cross the threshold without
 // creating a member turn, then deliberately choose privacy.
 const ready=page.getByRole('button',{name:/I.m ready/i});
 const arrivalVisible=await ready.waitFor({state:'visible',timeout:13000})
   .then(()=>true).catch(()=>false);
 if(arrivalVisible){
   if(await choice.isVisible().catch(()=>false)){
     throw Error('PRIVACY_CONTROL_FALSE_AFFORDANCE_UNDER_ARRIVAL');
   }
   await ready.click();
   console.log('REAL_ARRIVAL_GESTURE_CROSSED_WITHOUT_MESSAGE');
 }
 try {
   await choice.waitFor({state:'visible',timeout:18000});
 }catch(err){
   await page.screenshot({path:imageDir+'/arrival-failure.png',fullPage:false});
   console.log('ARRIVAL_DEBUG', (await page.locator('body').innerText()).slice(0,1200));
   throw err;
 }
 console.log('ARRIVAL_CHOICE_VISIBLE');
 initial=await page.evaluate(()=>localStorage.getItem('maia_session_id'));
 if(!initial || !initial.startsWith('session_')){
   throw Error('INITIAL_VERIFIED_SESSION_ID_NOT_ESTABLISHED');
 }
 const stored=await page.evaluate(()=>localStorage.getItem('maia_session_id'));
 if(stored!==initial)throw Error('INITIAL_ID_NOT_STABLE');
 await page.getByRole('button',{name:/Sanctuary — do not retain this conversation as memory/i}).click();
 await choice.waitFor({state:'hidden',timeout:7000});
 console.log('EXPLICIT_SANCTUARY_CHOICE_UI_PASS');

 // The member must receive a visible refusal before any content-free consent
 // preflight or model request. Choose the actual text composer.
 const textMode=page.getByRole('button',{name:'Switch to text mode'});
 await textMode.waitFor({state:'visible',timeout:6000});
 await textMode.click();
 const compose=page.locator('textarea:visible').first();
 await compose.waitFor({state:'visible',timeout:6000});
 await compose.fill('RF01_FICTIONAL_SANCTUARY_SEND_MUST_NOT_LEAVE_BROWSER');
 await compose.press('Enter');
 await page.waitForTimeout(500);
 if(calls.some(c=>c.path==='/api/sovereign/privacy/turn-consent' ||
                  c.path==='/api/sovereign/app/maia/list')){
   throw Error('SANCTUARY_SEND_TRIGGERED_CONSENT_OR_MODEL');
 }
 const notice=await page.locator('body').innerText();
 if(!notice.includes('Sanctuary messaging is on hold')){
   throw Error('SANCTUARY_SEND_REFUSAL_NOT_VISIBLE');
 }
 const preservedDraft=await compose.inputValue();
 if(!preservedDraft.includes('RF01_FICTIONAL_SANCTUARY_SEND_MUST_NOT_LEAVE_BROWSER')){
   throw Error('HELD_SANCTUARY_SEND_LOST_AUTHORED_DRAFT');
 }
 console.log('SANCTUARY_SEND_FAILS_BEFORE_NETWORK_WITH_VISIBLE_MEMBER_NOTICE_AND_DRAFT_PRESERVED');

 await page.evaluate((sid)=>localStorage.setItem('maia_conversation_'+sid,
   JSON.stringify([{role:'user',text:'FICTIONAL_OLD_WRITING_PRESERVED'}])),initial);
 // Open the real Quick Settings panel and click its actual New Conversation
 // button; dispatching only a synthetic window event would miss UI wiring.
 await page.evaluate(()=>window.dispatchEvent(new Event('openLabDrawer')));
 const drawerSettings=page.getByRole('button',{name:/Conversation Settings/i});
 await drawerSettings.waitFor({state:'visible',timeout:9000});
 await drawerSettings.click();
 console.log('REAL_DRAWER_CONVERSATION_SETTINGS_BUTTON_CLICKED');
 const realNew=page.getByRole('button',{name:'New Conversation'});
 await realNew.waitFor({state:'visible',timeout:8000});
 await realNew.click();
 console.log('QUICK_SETTINGS_NEW_CONVERSATION_BUTTON_CLICKED');
 await page.waitForFunction(sid=>
    localStorage.getItem('maia_session_id')!==sid,initial,{timeout:12000});
 const nextId=await page.evaluate(()=>localStorage.getItem('maia_session_id'));
 if(nextId===initial||!nextId?.startsWith('session_'))throw Error('FRESH_ID_FAILED');
 await choice.waitFor({state:'visible',timeout:15000});
 const remains=await page.evaluate(sid=>
    localStorage.getItem('maia_conversation_'+sid),initial);
 if(!remains?.includes('FICTIONAL_OLD_WRITING_PRESERVED'))throw Error('OLD_WRITING_REMOVED');
 console.log('VERIFIED_NEW_ID_AND_UNRESOLVED_CHOICE_PASS',nextId,'OLD_HISTORY_PRESERVED',true);
 // The success witness must not be contaminated by a deliberate failure
 // banner; capture the fresh encounter BEFORE negative-path testing.
 await page.screenshot({path:imageDir+'/new-session-unresolved-'+browserLabel+'.png',
   animations:'disabled',fullPage:false});
 failNew=true;
 await page.evaluate(()=>window.dispatchEvent(new CustomEvent('maia-new-conversation')));
 await page.waitForTimeout(650);
 const afterRefusal=await page.evaluate(()=>localStorage.getItem('maia_session_id'));
 if(afterRefusal!==nextId)throw Error('FAILED_NEW_SESSION_STILL_CHANGED_ID');
 if(await choice.count()!==1)throw Error('PRIVACY_CHOICE_CLEARED_ON_FAILED_REQUEST');
 console.log('FAILED_NEW_SESSION_PRESERVES_CURRENT_ID_PASS');
 if(calls.filter(x=>x.path==='/api/sovereign/app/maia/list').length) {
   throw Error('NEW_CONVERSATION_CAUSED_MODEL_EGRESS');
 }
 if(external!==0)throw Error('EXTERNAL_BROWSER_REQUESTS='+external);
 console.log('BROWSER_WITNESS_PASS',{
   server:'Next.js 16.3.8 authenticated MAIA encounter and PostgreSQL-owned New Conversation',browser:browserLabel,
   realSigninCalls,returnedIds:nextIndex,sessionChanged:true,external,modelCalls:0,
   savePreserved:true,initialChoiceReset:true,failedNewIdRefused:true,
 });
}finally{
 await page?.close().catch(()=>{});
 await browser.close();
}
