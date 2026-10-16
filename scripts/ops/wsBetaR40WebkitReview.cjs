'use strict';
/**
 * R40: browser-actual, LOCALHOST-ONLY two-section WebKit editorial review.
 * This is not an authenticated Writer's Studio, encrypted DB connector, or
 * approval for production. The fixture uses fictional JS/sessionStorage only.
 */
const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const os=require('node:os');
const crypto=require('node:crypto');
const {webkit}=require('playwright');

if(process.env.R40_EDITORIAL_WEBKIT_FIXTURE!=='fictional-only')
 throw Error('R34_EXACT_FICTIONAL_ONLY_GATE_REQUIRED');
const root=path.join(process.cwd(),'scripts/ops/fixtures/r40');
const routes={
 '/':'Studio.html',
 '/r40.js':'studio.js',
 '/r40.css':'studio.css',
};
const receiptPath='/Volumes/T7 Shield/ws-beta-release-r11-build-20261016/R40_WEBKIT_TWO_SECTION_EDITORIAL_20261016.json';
const checks=[];
const check=(yes,name)=>{if(!yes)throw Error('R40_ASSERTION_FAILED:'+name);checks.push(name);};
const receipt={
 status:'R40_WEBKIT_REVIEW_HOLD',checks,desktopWebkit:false,
 mobileWebkit:false,requestCount:0,blockedExternalRequests:0,
 realMemberWrites:false,serverChanges:false,productionRouteAdded:false,
 browserClosed:false,localhostClosed:false,error:null,
 sourceHead:null,
};
let server=null,browser=null,temp=null;
const contentTypes={'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8'};
async function startServer(){
 server=http.createServer((req,res)=>{
  receipt.requestCount++;
  const requested=new URL(req.url||'/', 'http://127.0.0.1');
  if(req.method!=='GET'||!(requested.pathname in routes)||requested.search){
   res.writeHead(404,{'Cache-Control':'no-store'});res.end('Not Found');return;
  }
  const file=path.join(root,routes[requested.pathname]);
  const bytes=fs.readFileSync(file);
  res.writeHead(200,{'Content-Type':contentTypes[path.extname(file)],
   'Cache-Control':'no-store','X-Content-Type-Options':'nosniff',
   'Content-Security-Policy':"default-src 'none'; script-src 'self'; style-src 'self'; connect-src 'none'; img-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
   'Referrer-Policy':'no-referrer'});
  res.end(bytes);
 });
 await new Promise((resolve,reject)=>{
  server.once('error',reject);
  server.listen(0,'127.0.0.1',resolve);
 });
 return server.address().port;
}
async function run(){
 const port=await startServer();
 const url='http://127.0.0.1:'+port+'/';
 browser=await webkit.launch({headless:true});
 temp=fs.mkdtempSync(path.join(os.tmpdir(),'ws-r40-fictional-webkit-'));
 async function context(options){
  const c=await browser.newContext(options);
  await c.route('**/*',route=>{
   const parsed=new URL(route.request().url());
   if(parsed.protocol==='http:'&&parsed.hostname==='127.0.0.1'&&
      parsed.port===String(port))return route.continue();
   receipt.blockedExternalRequests++;
   return route.abort();
  });
  return c;
 }
 const desktop=await context({viewport:{width:1440,height:900}});
 const page=await desktop.newPage();
 await page.goto(url,{waitUntil:'domcontentloaded'});
 check(await page.title()==="Soullab Writer's Studio · R40 fictional WebKit review",
  'real WebKit desktop renders explicitly labeled fictional studio');
 check(await page.locator('[data-panel]').count()===3,
  'all three Outline manuscript and MAIA panes exist');
 check(await page.locator('[data-panel="writing"]').isVisible()&&
  await page.locator('[data-panel="maia"]').isVisible(),
  'manuscript and MAIA are visible together on desktop');
 check(await page.locator('#section-one').getAttribute('data-section-id')!==
  await page.locator('#section-two').getAttribute('data-section-id'),
  'two distinct frozen manuscript-section UUIDs');
 const other='The second section keeps its own story. Nothing in this paragraph should change when the first passage is refined.';
 check(await page.locator('#section-two').textContent()===other &&
  await page.locator('#target').textContent()==='lantern glows',
  'two-section author manuscript starts with exact target and separate context');
 await page.evaluate(()=>{
  const section=document.getElementById('section-two');
  const range=document.createRange();
  range.selectNodeContents(section);
  const selection=window.getSelection();
  selection.removeAllRanges();selection.addRange(range);
 });
 await page.locator('#work-selection').click();
 check((await page.locator('#editor-status').textContent()).includes('Select only the highlighted passage')&&
  await page.locator('#target').textContent()==='lantern glows',
  'selection outside the anchored first section is not mistaken for editable passage');
 await page.evaluate(()=>window.getSelection().removeAllRanges());
 check(await page.locator('.option').count()===3,
  'three optional alternatives, lightest first');
 check(await page.locator('#apply').isDisabled()&&await page.locator('#undo').isDisabled(),
  'Apply and Undo cannot be triggered before author selection');

 await page.locator('[data-option="0"]').click();
 check((await page.locator('#diff').innerHTML()).includes('<del>glows</del>')&&
  (await page.locator('#diff').innerHTML()).includes('<ins>shimmers</ins>'),
  'changed words visible before Apply, not entire paragraph rewritten');
 check(await page.locator('#target').textContent()==='lantern glows' &&
  await page.locator('#section-two').textContent()===other,
  'preview leaves both manuscript sections unchanged');
 check((await page.locator('[data-option="1"]').textContent()).includes('Writer example'),
  'alternative labels distinguish fictional member and MAIA sources');
 check(!(await page.locator('#diff').innerHTML()).includes('<del>lantern</del>'),
  'word-level preview preserves unchanged words rather than striking a whole sentence');

 await page.locator('#ignore').click();
 check(await page.locator('#apply').isDisabled()&&
  await page.locator('#target').textContent()==='lantern glows',
  'Ignore resets author choice and preserves original passage');

 await page.locator('[data-option="1"]').click();
 await page.locator('#apply').click();
 check(await page.locator('#target').textContent()==='lantern shines' &&
  await page.locator('#revision').textContent()==='Version 2',
  'explicit Apply changes only chosen passage and increments author history');
 check(await page.locator('#section-two').textContent()===other &&
  (await page.locator('#section-one').textContent()).startsWith('🍂 A lantern shines'),
  'the second section and every character outside passage remain untouched');
 check(await page.locator('#undo').isEnabled() &&
  await page.locator('#apply').isDisabled(),
  'Undo becomes available and accidental double Apply is blocked');
 await page.locator('#undo').click();
 check(await page.locator('#target').textContent()==='lantern glows'&&
  await page.locator('#revision').textContent()==='Version 3'&&
  await page.locator('#section-two').textContent()===other,
  'Undo adds a new revision and restores exact wording without touching section two');
 check(await page.locator('#undo').isDisabled(),
  'double Undo is disabled after restoring author wording');
 await page.locator('#save').click();
 await page.reload({waitUntil:'domcontentloaded'});
 check(await page.locator('#revision').textContent()==='Version 3'&&
  await page.locator('#target').textContent()==='lantern glows'&&
  await page.locator('#section-two').textContent()===other,
  'fictional author draft reopens after WebKit reload with both sections intact');
 await page.locator('#zoom').click();
 check(await page.locator('#zoom').getAttribute('aria-pressed')==='true'&&
  (await page.locator('#zoom-description').textContent()).includes('unchanged second section'),
  'semantic zoom changes context and preserves exact authored words');

 const before=Number(await page.locator('#left-divider').getAttribute('aria-valuenow'));
 await page.locator('#left-divider').focus();
 await page.keyboard.press('ArrowRight');
 const after=Number(await page.locator('#left-divider').getAttribute('aria-valuenow'));
 check(after===before+16,'accessible keyboard outline-divider resizing');
 await page.reload({waitUntil:'domcontentloaded'});
 check(Number(await page.locator('#left-divider').getAttribute('aria-valuenow'))===after,
  'column width persists across WebKit reload');
 await page.locator('#right-divider').focus();
 await page.keyboard.press('ArrowLeft');
 check(await page.locator('#right-divider').getAttribute('aria-valuenow')==='339',
  'MAIA column independently resizes by keyboard');
 await page.locator('#reset').click();
 check(await page.locator('#left-divider').getAttribute('aria-valuenow')==='235'&&
  await page.locator('#right-divider').getAttribute('aria-valuenow')==='355',
  'Reset restores the three manuscript-first default widths');
 const outlineDivider=await page.locator('#left-divider').boundingBox();
 check(!!outlineDivider,'outline divider remains present for pointer drag');
 await page.mouse.move(outlineDivider.x+outlineDivider.width/2,outlineDivider.y+92);
 await page.mouse.down();
 await page.mouse.move(outlineDivider.x+outlineDivider.width/2+36,outlineDivider.y+92,{steps:6});
 await page.mouse.up();
 const outlineDragged=Number(await page.locator('#left-divider').getAttribute('aria-valuenow'));
 check(outlineDragged>=260&&outlineDragged<=300,
  'real WebKit pointer drag adjusts Outline column without replacing manuscript');
 const maiaDivider=await page.locator('#right-divider').boundingBox();
 await page.mouse.move(maiaDivider.x+maiaDivider.width/2,maiaDivider.y+92);
 await page.mouse.down();
 await page.mouse.move(maiaDivider.x+maiaDivider.width/2-40,maiaDivider.y+92,{steps:6});
 await page.mouse.up();
 const maiaDragged=Number(await page.locator('#right-divider').getAttribute('aria-valuenow'));
 check(maiaDragged>=380&&maiaDragged<=415,
  'real WebKit pointer drag adjusts MAIA column independently');
 await page.locator('#reset').click();
 check(await page.locator('#left-divider').getAttribute('aria-valuenow')==='235'&&
  await page.locator('#right-divider').getAttribute('aria-valuenow')==='355',
  'Reset undoes both pointer drags and restores manuscript-first defaults');
 receipt.desktopWebkit=true;
 await page.screenshot({path:path.join(temp,'r40-desktop.png'),fullPage:true});
 await desktop.close();

 const mobile=await context({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 const phone=await mobile.newPage();
 await phone.goto(url,{waitUntil:'domcontentloaded'});
 check(await phone.locator('.mobile-nav').isVisible()&&
  await phone.locator('[data-panel="writing"]').isVisible()&&
  !(await phone.locator('[data-panel="maia"]').isVisible()),
  'mobile WebKit opens the manuscript as one visible pane');
 check(!(await phone.locator('#reset').isVisible()),
  'mobile hides the irrelevant three-column Reset control');
 check(await phone.locator('#section-two').textContent()===
  'The second section keeps its own story. Nothing in this paragraph should change when the first passage is refined.',
  'second section remains visible in the mobile manuscript');
 await phone.locator('#work-selection').click();
 check(await phone.locator('[data-panel="maia"]').isVisible()&&
  !(await phone.locator('[data-panel="writing"]').isVisible()),
  'work with selected passage opens the single MAIA pane');
 await phone.locator('[data-option="0"]').click();
 check(await phone.locator('#apply').isEnabled()&&
  (await phone.locator('#diff').innerHTML()).includes('<ins>shimmers</ins>'),
  'mobile author can examine a light-touch changed-word preview');
 await phone.locator('#apply').click();
 await phone.locator('[data-pane="writing"]').click();
 check(await phone.locator('#target').textContent()==='lantern shimmers'&&
  await phone.locator('#revision').textContent()==='Version 2'&&
  await phone.locator('#undo').isEnabled(),
  'mobile author Apply changes exactly one passage, preserving Undo');
 check((await phone.locator('#section-two').textContent()).startsWith(
  'The second section keeps its own story'),
  'mobile Apply does not change the second section');
 await phone.locator('#undo').click();
 check(await phone.locator('#target').textContent()==='lantern glows'&&
  await phone.locator('#revision').textContent()==='Version 3',
  'mobile author Undo restores original passage as a new version');
 await phone.locator('#save').click();
 await phone.reload({waitUntil:'domcontentloaded'});
 check(await phone.locator('#revision').textContent()==='Version 3'&&
  await phone.locator('#section-two').isVisible(),
  'mobile WebKit reopen retains fiction-only history and both sections');
 await phone.locator('[data-pane="outline"]').click();
 check(await phone.locator('[data-panel="outline"]').isVisible()&&
  !(await phone.locator('[data-panel="writing"]').isVisible()),
  'mobile outline is selected explicitly rather than sharing pane width');
 receipt.mobileWebkit=true;
 await phone.screenshot({path:path.join(temp,'r40-mobile.png'),fullPage:true});
 await mobile.close();

 receipt.status='R40_ISOLATED_WEBKIT_TWO_SECTION_PASS_NO_ENCRYPTED_BACKEND';
}
(async()=>{
 try{await run();}catch(error){
  receipt.error=String(error&&error.message||error).slice(0,500);
  process.exitCode=2;
 }finally{
  if(browser){try{await browser.close();receipt.browserClosed=true;}catch{}}
  if(server){try{await new Promise(r=>server.close(r));receipt.localhostClosed=true;}catch{}}
  if(temp){fs.rmSync(temp,{recursive:true,force:true});temp=null;}
  const x=require('node:child_process').spawnSync('git',['rev-parse','HEAD'],{encoding:'utf8'});
  receipt.sourceHead=x.status===0?x.stdout.trim():null;
  fs.writeFileSync(receiptPath,JSON.stringify(receipt,null,2)+'\n',{mode:0o600});
  console.log(JSON.stringify({status:receipt.status,checks:checks.length,
   desktop:receipt.desktopWebkit,mobile:receipt.mobileWebkit,
   blockedExternal:receipt.blockedExternalRequests,clean:receipt.browserClosed&&receipt.localhostClosed,
   error:receipt.error,realBeta:'HOLD'}));
  if(receipt.status!=='R40_ISOLATED_WEBKIT_TWO_SECTION_PASS_NO_ENCRYPTED_BACKEND' ||
    !receipt.browserClosed||!receipt.localhostClosed)process.exitCode=2;
 }
})();
