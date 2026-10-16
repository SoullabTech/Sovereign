'use strict';
/** R40: actual standalone file:// WebKit desktop/mobile review; no server. */
const fs=require('node:fs');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const crypto=require('node:crypto');
const {webkit}=require('playwright');

if(process.env.R40_OFFLINE_PREVIEW_FIXTURE!=='fictional-only')
 throw Error('R40_OFFLINE_PREVIEW_FICTIONAL_ONLY_REQUIRED');
const file='/Volumes/T7 Shield/ws-beta-release-r11-build-20261016/R40_FICTIONAL_WRITER_ROOM_PREVIEW_20261016.html';
const folder='/Volumes/T7 Shield/ws-beta-release-r11-build-20261016';
const checks=[];
const result={protocol:'soullab.ws.r40.offline-webkit.held',
 status:'HOLD',checks,sourceHead:null,offlineFile:false,
 desktop:false,mobile:false,externalAborted:0,
 realAccounts:false,providerCalls:0,serverWriting:false,
 browserClosed:false,error:null};
let browser=null;
const expect=(yes,label)=>{if(!yes)throw Error('R40_PREVIEW_CHECK_FAILED:'+label);checks.push(label);};
async function run(){
 expect(fs.existsSync(file)&&path.extname(file)==='.html',
  'standalone fully local fictional preview exists');
 const html=fs.readFileSync(file,'utf8');
 expect(html.includes("connect-src 'none'")&&
  html.includes('No server writing')&&
  !html.includes('<script src=')&&
  !html.includes('<link rel="stylesheet"'),
  'preview self-contained and explicitly no-network/no-server');
 browser=await webkit.launch({headless:true});
 const context=async(options)=>{
  const c=await browser.newContext(options);
  await c.route('**/*',route=>{
   const url=route.request().url();
   if(url===pathToFileURL(file).href)return route.continue();
   result.externalAborted++;
   return route.abort();
  });
  return c;
 };
 const desktop=await context({viewport:{width:1440,height:900}});
 const page=await desktop.newPage();
 await page.goto(pathToFileURL(file).href,{waitUntil:'domcontentloaded'});
 expect(await page.title()==="Soullab Writer's Studio · R40 fictional WebKit review",
  'standalone file is rendered by desktop WebKit');
 expect(await page.locator('[data-panel="maia"]').isVisible()&&
  await page.locator('[data-panel="writing"]').isVisible(),
  'standalone manuscript and MAIA render next to each other');
 const unchanged=await page.locator('#section-two').textContent();
 await page.locator('[data-option="0"]').click();
 expect((await page.locator('#diff').innerHTML()).includes('<del>glows</del>')&&
  (await page.locator('#diff').innerHTML()).includes('<ins>shimmers</ins>'),
  'standalone changed-word diff preserves the unchanged token');
 await page.locator('#apply').click();
 expect(await page.locator('#target').textContent()==='lantern shimmers'&&
  await page.locator('#section-two').textContent()===unchanged,
  'offline Apply modifies exact first-section passage and not the second section');
 await page.locator('#undo').click();
 expect(await page.locator('#target').textContent()==='lantern glows'&&
  await page.locator('#section-two').textContent()===unchanged,
  'offline Undo restores exact authored text');
 await page.locator('#save').click();
 await page.reload({waitUntil:'domcontentloaded'});
 expect(await page.locator('#target').textContent()==='lantern glows'&&
  await page.locator('#section-two').textContent()===unchanged,
  'standalone file reopens manuscript (persistent session when available)');
 result.desktop=true;
 await page.screenshot({path:path.join(folder,'R40_DESKTOP_WRITER_REVIEW_20261016.png'),fullPage:true});
 await desktop.close();

 const mobile=await context({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 const phone=await mobile.newPage();
 await phone.goto(pathToFileURL(file).href,{waitUntil:'domcontentloaded'});
 expect(await phone.locator('.mobile-nav').isVisible()&&
  await phone.locator('[data-panel="writing"]').isVisible()&&
  !(await phone.locator('[data-panel="maia"]').isVisible()),
  'standalone mobile WebKit starts manuscript-first and single-pane');
 expect(!(await phone.locator('#reset').isVisible()),
  'mobile standalone view omits irrelevant desktop-only column reset');
 await phone.locator('#work-selection').click();
 expect(await phone.locator('[data-panel="maia"]').isVisible(),
  'mobile author intentionally opens MAIA suggestions');
 await phone.locator('[data-option="1"]').click();
 await phone.locator('#apply').click();
 await phone.locator('[data-pane="writing"]').click();
 expect(await phone.locator('#target').textContent()==='lantern shines',
  'mobile author deliberately chooses member alternative');
 await phone.locator('#undo').click();
 expect(await phone.locator('#target').textContent()==='lantern glows',
  'mobile Undo restores author words in local file review');
 result.mobile=true;
 await phone.screenshot({path:path.join(folder,'R40_MOBILE_WRITER_REVIEW_20261016.png'),fullPage:true});
 await mobile.close();
 expect(result.externalAborted===0,
  'no external network request attempted from standalone browser preview');
 result.offlineFile=true;
 result.status='R40_STANDALONE_FILE_WEBKIT_PASS_BROWSER_ONLY';
}
(async()=>{
 try{await run();}
 catch(e){result.error=String(e?.message||e).slice(0,300);process.exitCode=2;}
 finally{
  if(browser){try{await browser.close();result.browserClosed=true;}catch{}}
  const rev=require('node:child_process').spawnSync('git',['rev-parse','HEAD'],{encoding:'utf8'});
  result.sourceHead=rev.status===0?rev.stdout.trim():null;
  const receipt=path.join(folder,'R40_OFFLINE_PREVIEW_WEBKIT_20261016.json');
  fs.writeFileSync(receipt,JSON.stringify(result,null,2)+'\n',{mode:0o600});
  console.log(JSON.stringify({status:result.status,checks:checks.length,
   desktop:result.desktop,mobile:result.mobile,clean:result.browserClosed,
   externalAborted:result.externalAborted,error:result.error,realBeta:'HOLD'}));
  if(!result.browserClosed||result.status!=='R40_STANDALONE_FILE_WEBKIT_PASS_BROWSER_ONLY')
   process.exitCode=2;
 }
})();