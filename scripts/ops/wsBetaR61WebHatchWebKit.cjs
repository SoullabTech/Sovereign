'use strict';
/**
 * R61 HELD-ONLY actual Next/WebKit sanity check on the TWO real mobile web
 * handoff pages. The browser may contact this localhost-only dev server;
 * all external browser requests and member/API requests are refused.
 *
 * Does NOT establish any real authenticated user, outbound website launch,
 * native Capacitor availability, production KMS or beta admission.
 */
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const net=require('node:net');
const {spawn,execFileSync}=require('node:child_process');
const {webkit}=require('playwright');

const ROOT=path.resolve(__dirname,'../..');
const SOURCE='9540724171d06cec40b4cdbdc754539b828b817f';
const EVIDENCE_ROOT='/Volumes/T7 Shield/ws-beta-r61-safe-web-hatch-evidence-20261017';
const MARKER='R61_WEB_HATCH_WEBKIT_FIXTURE';
const head=execFileSync('git',['rev-parse','HEAD'],{cwd:ROOT,encoding:'utf8'}).trim();
const anchored=head===SOURCE||
 require('node:child_process').spawnSync('git',['merge-base','--is-ancestor',SOURCE,head],
  {cwd:ROOT}).status===0;
if(process.env[MARKER]!=='fictional-only'||process.cwd()!==ROOT||!anchored||
 fs.existsSync(path.join(ROOT,'.env'))||fs.existsSync(path.join(ROOT,'.env.local'))||
 (process.env.R61_EXACT_SOURCE_SHA&&process.env.R61_EXACT_SOURCE_SHA!==head)||
 (process.env.R61_EXACT_SOURCE_SHA&&
  execFileSync('git',['status','--porcelain'],{cwd:ROOT,encoding:'utf8'}).trim()))
 throw Error('R61_REFUSE_NONFICTIONAL_OR_UNSCOPED_NEXT_SOURCE');

const exact=Boolean(process.env.R61_EXACT_SOURCE_SHA);
const design=process.env.R61_DESIGN_WITNESS==='fictional-only';
const EVIDENCE=exact?
 path.join(EVIDENCE_ROOT,'exact-'+head.slice(0,12)+'-01'):
 design?path.join(EVIDENCE_ROOT,'design-witness-20261017-v2'):EVIDENCE_ROOT;
const prefix=exact?'R61_EXACT':design?'R61_DESIGN':'R61_PRECOMMIT';
const testRoot=fs.mkdtempSync(path.join(os.tmpdir(),'ws-r61-webkit-fixture-'));
const browserPhoto=path.join(EVIDENCE,prefix+'_WEBKIT_MOBILE_HATCH.png');
const browserPhotoTwo=path.join(EVIDENCE,prefix+'_WEBKIT_MOBILE_HOMEPAGE.png');
const desktopPhoto=path.join(EVIDENCE,prefix+'_WEBKIT_DESKTOP_HATCH.png');
const receipt=path.join(EVIDENCE,prefix+'_ACTUAL_NEXT_WEBKIT_20261017.json');
fs.mkdirSync(EVIDENCE,{recursive:true,mode:0o700});
if([receipt,browserPhoto,browserPhotoTwo,desktopPhoto].some(p=>fs.existsSync(p)))
 throw Error('R61_REFUSE_TO_OVERWRITE_EVIDENCE');
let browser=null,app=null,localOrigin='',closedServer=false,browserClosed=false;
let externalRequestsBlocked=0,realMemberRequestsBlocked=0;
const checks=[];
const check=(condition,label)=>{
 if(!condition)throw Error('R61_BROWSER_FAILED_'+label);
 checks.push(label);
};
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function availablePort(){
 const server=net.createServer();
 await new Promise((resolve,reject)=>{
  server.once('error',reject);
  server.listen(0,'127.0.0.1',resolve);
 });
 const port=server.address().port;
 await new Promise(resolve=>server.close(resolve));
 return port;
}
const pageOpenCaptures=async(page)=>{
 await page.evaluate(()=>{
  window.__r61Captured=[];
  window.open=(url,target,features)=>{
   window.__r61Captured.push({url:String(url),target,features});
   return null;
  };
 });
};
const captured=page=>page.evaluate(()=>window.__r61Captured||[]);
async function waitForStartup(origin){
 for(let i=0;i<110;i++){
  if(app.exitCode!==null)throw Error('R61_NEXT_SERVER_PREMATURE_EXIT');
  try{
   const r=await fetch(origin+'/open-web',{
    method:'GET',signal:AbortSignal.timeout(4500),
   });
   if(r.status===200)return;
  }catch{}
  await pause(500);
 }
 throw Error('R61_LOCAL_ONLY_NEXT_NOT_READY');
}
async function run(){
 const port=await availablePort();
 localOrigin='http://127.0.0.1:'+port;
 const logfile=fs.openSync(path.join(EVIDENCE,prefix+'_NEXT_DEV_20261017.log'),'wx',0o600);
 const env={
  PATH:'/Users/soullab/.nvm/versions/node/v22.22.3/bin:/usr/bin:/bin:/opt/homebrew/bin',
  HOME:testRoot,NODE_ENV:'development',CI:'1',
  NEXT_TELEMETRY_DISABLED:'1',
  DATABASE_URL:'postgresql://fict@127.0.0.1:1/r35_draft',
  FILE_STORAGE_PATH:path.join(testRoot,'vault'),
  NEXT_PUBLIC_WS_BETA_REAL_MEMBER_ENABLED:'false',
  PLAYWRIGHT_BROWSERS_PATH:'/Users/soullab/Library/Caches/ms-playwright',
 };
 fs.mkdirSync(env.FILE_STORAGE_PATH,{recursive:true,mode:0o700});
 app=spawn(path.join(ROOT,'node_modules/.bin/next'),
  ['dev','--webpack','--hostname','127.0.0.1','-p',String(port)],{
   cwd:ROOT,env,detached:true,stdio:['ignore',logfile,logfile],
  });
 fs.closeSync(logfile);
 await waitForStartup(localOrigin);
 check(app.exitCode===null,'actual Next.js page server available on loopback');
 browser=await webkit.launch({headless:true});
 const context=await browser.newContext({viewport:{width:390,height:844},
  isMobile:true,hasTouch:true,acceptDownloads:false});
 await context.route('**/*',route=>{
  const url=route.request().url();
  if(!url.startsWith(localOrigin+'/')){
   externalRequestsBlocked++;
   return route.abort('blockedbyclient');
  }
  if(new URL(url).pathname.startsWith('/api/')){
   realMemberRequestsBlocked++;
   return route.fulfill({status:403,contentType:'application/json',
    body:'{"kind":"fictional_no_member_access"}'});
  }
  return route.continue();
 });
 const page=await context.newPage();
 const pageErrors=[];
 page.on('pageerror',e=>pageErrors.push(String(e).slice(0,160)));
 let r=await page.goto(localOrigin+'/open-in-web',{
  waitUntil:'networkidle',timeout:40000});
 check(r&&r.status()===200,'actual generic web-hatch route responds 200');
 await page.getByRole('link',{name:'Open Soullab homepage'}).waitFor();
 let link=page.getByRole('link',{name:'Open Soullab homepage'});
 check(await link.getAttribute('href')==='https://soullab.life',
  'missing route offers explicit canonical homepage');
 check(await page.getByText('Continue on Soullab').isVisible(),
  'no false claim about a selected protected Studio route');
 r=await page.goto(localOrigin+'/open-in-web?path=%2Fstudio%2Fmarketing%3Ftab%3Dwrite&label=Marketing',
  {waitUntil:'networkidle',timeout:35000});
 link=page.getByRole('link',{name:'Open in Web Studio'});
 await link.waitFor();
 check(r&&r.status()===200&&
  await link.getAttribute('href')==='https://soullab.life/studio/marketing?tab=write',
  'exact same-origin deep-link remains intact');
 check(await page.getByText(/Marketing is part of the full Studio/).isVisible(),
  'verified concise label describes only approved target');
 await page.screenshot({path:browserPhoto,fullPage:false});
 await page.goto(localOrigin+'/open-in-web?path=%2F%2Fevil.example%2Fescape&label=Fake',
  {waitUntil:'networkidle'});
 link=page.getByRole('link',{name:'Open Soullab homepage'});
 await link.waitFor();
 check(await link.getAttribute('href')==='https://soullab.life',
  'external/ambiguous deep-link is not displayed as a launch destination');
 check(!(await page.locator('body').innerText()).includes('evil.example'),
  'untrusted destination is not echoed to the member');
 await page.goto(localOrigin+'/open-web?to=%2Fwriters-studio',{
  waitUntil:'networkidle'});
 await page.getByRole('button',{name:'Open in Browser'}).waitFor();
 await pageOpenCaptures(page);
 await page.getByRole('button',{name:'Open in Browser'}).click();
 let calls=await captured(page);
 check(calls.length===1&&calls[0].url==='https://soullab.life/writers-studio'&&
  calls[0].target==='_blank'&&calls[0].features==='noopener,noreferrer',
  'actual browser button opens only the verified exact Soullab destination');
 await page.goto(localOrigin+'/open-web?to=%2F%2Fevil.example%2Fescape',{
  waitUntil:'networkidle'});
 await page.getByRole('button',{name:'Open Soullab homepage'}).waitFor();
 await pageOpenCaptures(page);
 await page.getByRole('button',{name:'Open Soullab homepage'}).click();
 calls=await captured(page);
 check(calls.length===1&&calls[0].url==='https://soullab.life',
  'untrusted web-page destination cannot reach external launch');
 await page.goto(localOrigin+'/open-web',{waitUntil:'networkidle'});
 await page.getByRole('button',{name:'Open Soullab homepage'}).waitFor();
 await pageOpenCaptures(page);
 await page.getByRole('button',{name:'Open Soullab homepage'}).click();
 calls=await captured(page);
 check(calls.length===1&&calls[0].url==='https://soullab.life',
  'absent next hydration query never reuses old writers-studio destination');
 await page.screenshot({path:browserPhotoTwo,fullPage:false});
 const desktop=await browser.newContext({
  viewport:{width:1280,height:800},acceptDownloads:false,
 });
 await desktop.route('**/*',route=>{
  const url=route.request().url();
  if(!url.startsWith(localOrigin+'/')){
   externalRequestsBlocked++;
   return route.abort('blockedbyclient');
  }
  if(new URL(url).pathname.startsWith('/api/')){
   realMemberRequestsBlocked++;
   return route.fulfill({status:403,contentType:'application/json',
    body:'{"kind":"fictional_no_member_access"}'});
  }
  return route.continue();
 });
 const desktopPage=await desktop.newPage();
 const desktopResponse=await desktopPage.goto(
  localOrigin+'/open-in-web?path=%2Fstudio&label=Studio',
  {waitUntil:'networkidle',timeout:35000});
 check(desktopResponse?.status()===200&&
  await desktopPage.getByRole('link',{name:'Open in Web Studio'})
   .getAttribute('href')==='https://soullab.life/studio',
  'actual desktop Next route preserves exact verified browser link');
 check(await desktopPage.evaluate(()=>
  document.documentElement.scrollWidth<=window.innerWidth),
  'desktop web-handoff has no horizontal overflow');
 await desktopPage.screenshot({path:desktopPhoto,fullPage:false});
 await desktop.close();
 check(pageErrors.length===0,'no unhandled browser exception');
 check(realMemberRequestsBlocked===0,'no account or member API was contacted');
 await context.close();
}
(async()=>{
 let error=null;
 try{await run();}
 catch(e){error=(e instanceof Error?e.message:String(e)).slice(0,260);}
 finally{
  if(browser){
   try{await browser.close();browserClosed=true;}catch{browserClosed=false;}
  }else browserClosed=true;
  if(app){
   try{process.kill(-app.pid,'SIGTERM');}catch{}
   await pause(600);
   if(app.exitCode===null&&app.signalCode===null){
    try{process.kill(-app.pid,'SIGKILL');}catch{}
    await pause(400);
   }
   closedServer=app.exitCode!==null||app.signalCode!==null;
  }
  fs.rmSync(testRoot,{recursive:true,force:true});
  const success=!error&&browserClosed&&closedServer&&
   !fs.existsSync(testRoot)&&checks.length===15&&
   realMemberRequestsBlocked===0;
  const result={
   protocol:'soullab.ws.r61.local-next-webkit-hatch.v1',
   parentSourceCommit:SOURCE,sourceHead:head,
   kind:success?'FICTIONAL_NEXT_WEBKIT_WEB_HATCH_PASS_RELEASE_HOLD':'HELD_BROWSER_REHEARSAL_FAILED',
   checks,checkCount:checks.length,
   externalRequestsBlocked,realMemberRequestsBlocked,
   browserClosed,serverClosed:closedServer,
   generatedFixtureRemoved:!fs.existsSync(testRoot),
   releaseApproved:false,productionChanged:false,
   error:error??(success?null:'cleanup_or_scope_unverified'),
   images:[browserPhoto,browserPhotoTwo,desktopPhoto].filter(p=>fs.existsSync(p)),
  };
  fs.writeFileSync(receipt,JSON.stringify(result,null,2)+'\n',{flag:'wx',mode:0o600});
  console.log(JSON.stringify({status:result.kind,checks:checks.length,
   externalRequestsBlocked,realMemberRequestsBlocked,
   cleanup:result.generatedFixtureRemoved&&result.serverClosed,
   error,receipt}));
  if(!success)process.exitCode=2;
 }
})();
