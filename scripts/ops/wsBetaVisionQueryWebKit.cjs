'use strict';
/**
 * Vision Query R62V: actual Next.js Vision Studio with invented verified
 * PostgreSQL session supplied by a separately disposable R52-derived runner.
 * All /api writes and external requests are refused; no MAIA turn, person,
 * physical iPhone or operational Work access.
 */
const {webkit}=require('playwright');
const fs=require('node:fs');
const path=require('node:path');

const origin=process.env.VISION_QUERY_LOCAL_ORIGIN;
const fixture=process.env.VISION_QUERY_AUTH_WEBKIT_FIXTURE;
const SHA=process.env.VISION_QUERY_SOURCE_SHA;
const token='r52-local-fictional-session';
const target=process.env.VISION_QUERY_DESKTOP_SCREENSHOT;
const mobileShot=process.env.VISION_QUERY_MOBILE_SCREENSHOT;
if(fixture!=='fictional-only'||
 !/^http:\/\/127\.0\.0\.1:\d+$/.test(origin||'')||
 !/^[a-f0-9]{40}$/.test(SHA||'')||
 !target||!mobileShot||fs.existsSync(target)||fs.existsSync(mobileShot))
 throw Error('VISION_BROWSER_REFUSE_NONFICTIONAL_OR_EXISTING_ARTIFACT');

const report={
 protocol:'soullab.ws.vision-query.actual-next-webkit-auth-held.v1',
 sourceHead:SHA,status:'VISION_QUERY_BROWSER_HOLD',
 checks:[],serverSessionVerified:false,
 browserClosed:false,apiWritesAccepted:0,
 offHostRequestsBlocked:0,
 realMemberContentUsed:false,externalProviderCalls:0,
 releaseApproved:false,error:null,
};
const check=(ok,label)=>{
 if(!ok)throw Error('VISION_QUERY_BROWSER_CHECK_FAILED_'+label);
 report.checks.push(label);
};
let browser=null;
const screenshot=async(page,file)=>{
 await page.screenshot({path:file,fullPage:false});
 check(fs.existsSync(file)&&fs.statSync(file).size>12000,
  'fictional Vision Studio screenshot generated');
};
const gate=async(context)=>{
 await context.route('**/*',route=>{
  const url=route.request().url();
  if(!url.startsWith(origin+'/')){
   report.offHostRequestsBlocked++;
   return route.abort('blockedbyclient');
  }
  const pathname=new URL(url).pathname;
  if(pathname.startsWith('/api/')){
   if(!['GET','HEAD'].includes(route.request().method())){
    return route.fulfill({
     status:423,contentType:'application/json',
     body:'{"kind":"fictional_write_denied","persisted":false,"releaseApproved":false}',
    });
   }
   return route.fulfill({
    status:403,contentType:'application/json',
    body:'{"kind":"fictional_member_data_refused","persisted":false}',
   });
  }
  return route.continue();
 });
};
const queryState=page=>new URL(page.url()).searchParams;
(async()=>{
 try{
  browser=await webkit.launch({headless:true});
  const guest=await browser.newContext({viewport:{width:1280,height:800}});
  await gate(guest);
  const before=await guest.newPage();
  const noMember=await before.goto(origin+'/maia/vision-studio?tab=vision',
   {waitUntil:'domcontentloaded',timeout:55000});
  await before.waitForURL(url=>url.pathname==='/signin',{timeout:12000});
  check(noMember?.status()===200&&new URL(before.url()).pathname==='/signin',
   'anonymous visitor cannot see protected Vision Studio');
  await guest.close();

  const desktop=await browser.newContext({
   viewport:{width:1280,height:820},acceptDownloads:false,
  });
  await desktop.addCookies([{
   name:'maia_session',value:token,url:origin,httpOnly:true,sameSite:'Strict',
  }]);
  await gate(desktop);
  const page=await desktop.newPage();
  const errors=[];
  page.on('pageerror',e=>errors.push(String(e.message).slice(0,180)));
  const entered=await page.goto(origin+
   '/maia/vision-studio?tab=vision&phase=water_2&fieldContext=fictional-R62V',
   {waitUntil:'domcontentloaded',timeout:80000});
  check(entered?.status()===200&&new URL(page.url()).pathname==
   '/maia/vision-studio',
   'real Vision Studio route renders with verified fictional session');
  report.serverSessionVerified=true;
  await page.getByRole('button',{name:'Vision Studio'}).waitFor({timeout:28000});
  check(queryState(page).get('tab')==='vision'&&
   queryState(page).get('phase')==='water_2'&&
   queryState(page).get('fieldContext')==='fictional-R62V',
   'initial exact phase and field context preserved');
  check(await page.getByRole('button',{name:'Vision Studio'})
   .getAttribute('class')!==null,
   'Vision Studio tab is rendered in its actual Next page');
  await screenshot(page,target);
  await page.getByRole('button',{name:'Practice Field'}).click();
  await page.waitForURL(url=>url.pathname==='/maia/vision-studio'&&
   url.searchParams.get('tab')==='practice',{timeout:19000});
  check(queryState(page).get('phase')==='water_2'&&
   queryState(page).get('fieldContext')==='fictional-R62V',
   'Practice tab click retains exact member phase and opaque context');
  await page.getByRole('button',{name:'Vision Studio'}).click();
  await page.waitForURL(url=>url.pathname==='/maia/vision-studio'&&
   url.searchParams.get('tab')==='vision',{timeout:19000});
  check(queryState(page).get('phase')==='water_2'&&
   queryState(page).get('fieldContext')==='fictional-R62V',
   'Vision return keeps the original author context without guessing');
  await desktop.close();

  const mobile=await browser.newContext({
   viewport:{width:390,height:844},isMobile:true,hasTouch:true,
   acceptDownloads:false,
  });
  await mobile.addCookies([{
   name:'maia_session',value:token,url:origin,httpOnly:true,sameSite:'Strict',
  }]);
  await gate(mobile);
  const phone=await mobile.newPage();
  const phoneRes=await phone.goto(origin+
   '/maia/vision-studio?tab=practice&phase=earth_3&fieldContext=fictional-Mobile',
   {waitUntil:'domcontentloaded',timeout:80000});
  check(phoneRes?.status()===200&&new URL(phone.url()).pathname==
   '/maia/vision-studio',
   'fictional verified member can open real mobile Vision Studio shell');
  await phone.getByRole('button',{name:'Practice Field'}).waitFor({timeout:28000});
  check(queryState(phone).get('fieldContext')==='fictional-Mobile'&&
   queryState(phone).get('phase')==='earth_3',
   'mobile query retains exact requested phase and field context');
  await screenshot(phone,mobileShot);
  await mobile.close();
  check(report.offHostRequestsBlocked===0,
   'neither browser contacted an external website or model');
  check(report.apiWritesAccepted===0,
   'no Vision or Practice content mutation accepted');
  report.status='VISION_QUERY_ACTUAL_NEXT_WEBKIT_FICTIONAL_PASS_RELEASE_HOLD';
 }catch(error){
  report.error=(error instanceof Error?error.message:String(error)).slice(0,290);
 }finally{
  if(browser){
   try{await browser.close();report.browserClosed=true;}
   catch{report.browserClosed=false;}
  }else report.browserClosed=true;
  console.log(JSON.stringify(report));
  if(report.error||!report.browserClosed||
   report.status!=='VISION_QUERY_ACTUAL_NEXT_WEBKIT_FICTIONAL_PASS_RELEASE_HOLD')
   process.exitCode=2;
 }
})();
