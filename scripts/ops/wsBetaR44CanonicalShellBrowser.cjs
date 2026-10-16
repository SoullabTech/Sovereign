'use strict';
/**
 * R44: Browser acceptance of the exact canonical React Shell + R41 selection
 * calling only a held R43 read-only projection of fictional R35 section text.
 *
 * This is NOT production Next.js routing, human authentication, KMS, real
 * MAIA, real member content, or a proof that Apply/Undo is permitted.
 *
 * Opt-in: R44_CANONICAL_BROWSER_FIXTURE=fictional-only
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const crypto=require('node:crypto');
const Module=require('node:module');
const {spawnSync}=require('node:child_process');
const esbuild=require('esbuild');
const {chromium,webkit}=require('playwright');
const ROOT=path.resolve(__dirname,'../..');
const run=process.env.R44_EVIDENCE_RUN||'v1';
if(!/^v[1-9][0-9]?$/.test(run))throw Error('R44_evidence_run_invalid');
const EVIDENCE=path.join('/Volumes/T7 Shield',
 'ws-beta-r44-canonical-browser-evidence-chatgpt-20261016-'+run);
const FIXTURE=path.join(ROOT,'scripts/ops/fixtures/wsR44CanonicalShellBrowser.tsx');
const STYLE=path.join(ROOT,'app/dev/writers-studio-full-redesign-review/full-redesign-review.css');
const S1='55555555-5555-4555-8555-555555555551';
const S2='55555555-5555-4555-8555-555555555552';
const A='66666666-6666-4666-8666-666666666666';
const B='77777777-7777-4777-8777-777777777777';
const W='33333333-3333-4333-8333-333333333333';
const C1='🍂 First lantern glows. Second lantern glows.\n\n';
const C2='The forest has a different story.';
const view={workId:W,generation:1,checkpointCount:0,kind:'sections',
 sections:[{id:S1,text:C1},{id:S2,text:C2}],content:C1+C2,
 note:null,action:'start',restoredFrom:null};
const record={protocol:'soullab.ws.r44.canonical-browser-readonly-v1',
 decision:'HOLD',sourceHead:null,
 exactCanonicalReactShell:false,readOnlyProtectedReview:false,
 fixtureSessionNotRealAuth:true,liveRouting:false,canApply:false,
 realMembersTouched:0,externalProviderCalls:0,productionChanged:false,
 imagePath:null,checks:[],externalRequests:0,browsersClosed:false,
 temporaryServerClosed:false,error:null};
const check=(condition,label)=>{
 assert.ok(condition,'R44_ASSERTION_FAILED:'+label);
 record.checks.push(label);
};
const expectedOrigin='http://127.0.0.1';
const headers={
 'content-type':'application/json;charset=utf-8',
 'cache-control':'no-store',
 'x-content-type-options':'nosniff',
};
const getHead=()=>{
 const r=spawnSync('git',['rev-parse','HEAD'],{cwd:ROOT,encoding:'utf8'});
 if(r.status!==0)throw Error('R44_git_head_unavailable');
 return r.stdout.trim();
};
const JSON_MAX=2048;
const parseBounded=(req)=>new Promise((resolve,reject)=>{
 let buffer='';let length=0;
 req.on('data',(x)=>{length+=x.length;if(length>JSON_MAX){reject(Error('R44_json_too_large'));req.destroy();return;}
   buffer+=x.toString('utf8');});
 req.on('end',()=>{try{resolve(JSON.parse(buffer));}catch(e){reject(e);}});
 req.on('error',reject);
});
const refuse=(res,status)=>{
 res.writeHead(status,headers);
 res.end(JSON.stringify({kind:'refused',canWrite:false}));
};
function compileHeldReview(){
 return esbuild.build({
  absWorkingDir:ROOT,
  entryPoints:['lib/writersStudio/recovery/heldCanonicalReviewR43.ts'],
  platform:'node',format:'cjs',bundle:true,packages:'external',
  write:false,alias:{'@':ROOT},logLevel:'silent'
 }).then((built)=>{
  const output=built.outputFiles[0].text;
  const m=new Module(path.join(ROOT,'scripts/ops/.__r44virtual.cjs'),module);
  m.filename=path.join(ROOT,'scripts/ops/.__r44virtual.cjs');
  m.paths=module.paths;m._compile(output,m.filename);
  assert.equal(m.exports.R43_REAL_STUDIO_REVIEW_BRIDGE_ENABLED,false);
  return m.exports.reviewFictionalCanonicalSelectionR43;
 });
}
async function compileClient(){
 const navigationShim={
  name:'fictional-next-hooks',setup(build){
    build.onResolve({filter:/^next\/navigation$/},()=>({
      path:'r44-next-navigation-shim',namespace:'r44-shim',
    }));
    build.onResolve({filter:/^@\/lib\/cabin\/doorway$/},()=>({
      path:'r44-cabin-shim',namespace:'r44-shim',
    }));
    build.onLoad({filter:/r44-next-navigation-shim/,namespace:'r44-shim'},()=>({
      contents:'export const usePathname=()=>"/writers-studio"; export const useSearchParams=()=>new URLSearchParams("mode=write");',
      loader:'js',
    }));
    build.onLoad({filter:/r44-cabin-shim/,namespace:'r44-shim'},()=>({
      contents:'export const isCabinOrigin=()=>false; export const cabinReturnPath=()=>"/cabin";',
      loader:'js',
    }));
  },
 };
 const b=await esbuild.build({
  absWorkingDir:ROOT,entryPoints:[FIXTURE],
  bundle:true,platform:'browser',format:'iife',jsx:'automatic',
  write:false,alias:{'@':ROOT},plugins:[navigationShim],logLevel:'silent',
 });
 return b.outputFiles[0].text;
}
function fixtureHttp(js,css,review){
 let origin=null;
 const html='<!doctype html><html><head><meta charset="utf-8">'+
  '<meta name="viewport" content="width=device-width, initial-scale=1">'+
  '<title>R44 fictional canonical Studio</title>'+
  '<style>html,body{margin:0;padding:0;width:100%;height:100%;}'+
  'button:disabled{opacity:.55;cursor:not-allowed;}'+css+'</style>'+
  '</head><body><div id="root"></div><script src="/fixture.js" defer></script></body></html>';
 const api={observed:0,denied:0};
 const server=http.createServer(async(req,res)=>{
  const host=req.headers.host;
  if(host!==origin?.slice('http://'.length)){refuse(res,404);return;}
  if(req.method==='GET'&&req.url==='/'){
   res.writeHead(200,{'content-type':'text/html;charset=utf-8','cache-control':'no-store',
    'content-security-policy':"default-src 'none'; script-src 'self'; style-src 'unsafe-inline'; connect-src 'self';"});
   res.end(html);return;
  }
  if(req.method==='GET'&&req.url==='/fixture.js'){
   res.writeHead(200,{'content-type':'text/javascript;charset=utf-8','cache-control':'no-store'});
   res.end(js);return;
  }
  if(req.url!=='/fixture-preview'||req.method!=='POST'){refuse(res,404);return;}
  if(req.headers.cookie!=='r44_fixture_writer=fictional_alpha'||
     req.headers.origin!==origin||
     req.headers['x-r44-fixture-csrf']!=='fictional-local-readonly'||
     !String(req.headers['content-type']||'').startsWith('application/json')){
    api.denied++;refuse(res,403);return;
  }
  try{
   const body=await parseBounded(req);
   if(!body||typeof body!=='object'||Array.isArray(body)||
      Object.keys(body).sort().join('|')==='')throw Error('r44_bad_shape');
   const names=Object.keys(body).sort().join('|');
   if(names!=='chosenAlternativeId|expectedGeneration|sectionId|selected')
     throw Error('r44_untrusted_body');
   if(body.sectionId!==S1||body.expectedGeneration!==1||body.chosenAlternativeId!==A)
     throw Error('r44_stale_choice');
   const approved=review(view,{
    expectedWorkId:W,expectedGeneration:body.expectedGeneration,
    sectionId:body.sectionId,selected:body.selected,
    alternatives:[
     {id:A,origin:'maia',wording:'lantern shimmers'},
     {id:B,origin:'member',wording:'lantern shines'},
    ],chosenAlternativeId:body.chosenAlternativeId,
   });
   api.observed++;
   assert.equal(approved.releaseApproved,false);
   assert.equal(approved.review.canWrite,false);
   res.writeHead(200,headers);
   res.end(JSON.stringify({
    kind:'fictional_preview_only',canWrite:false,
    originalPassage:approved.review.originalPassage,
    proposedPassage:approved.review.proposedPassage,
    sectionOrder:approved.sectionOrder,
   }));
  }catch(e){api.denied++;refuse(res,409);}
 });
 return {server,api,setOrigin:(s)=>{origin=s;}};
}
async function request(origin,cookie,override={}){
 const data={sectionId:S1,expectedGeneration:1,
   selected:{start:33,end:46,text:'lantern glows'},
   chosenAlternativeId:A};
 return fetch(origin+'/fixture-preview',{
  method:'POST',
  headers:{origin,'content-type':'application/json',
   'x-r44-fixture-csrf':'fictional-local-readonly',cookie,...override},
  body:JSON.stringify(data),
 });
}
const pause=(ms)=>new Promise(r=>setTimeout(r,ms));
async function runBrowser(kind,browser,origin){
 const ctx=await browser.newContext({viewport:{width:1440,height:900}});
 let page=null;
 try{
  await ctx.addCookies([{name:'r44_fixture_writer',value:'fictional_alpha',
    url:origin,httpOnly:true,sameSite:'Strict'}]);
  await ctx.route('**/*',route=>{
   const u=route.request().url();
   if(u.startsWith(origin+'/'))return route.continue();
   record.externalRequests++;return route.abort();
  });
  page=await ctx.newPage();
  const errors=[];page.on('pageerror',e=>errors.push(String(e)));
  const resp=await page.goto(origin+'/',{waitUntil:'load'});
  check(resp?.status()===200,kind+' canonical fictional page served only locally');
  await page.locator('[data-r44-work]').waitFor({timeout:8000});
  check(await page.locator('.fr-shell[data-mode="write"]').count()===1,
   kind+' actual canonical Shell component rendered');
  check(await page.evaluate(()=>window.__r44Mounts===1),
   kind+' fictional Work mounted exactly once');
  const editor=page.locator('#r44-body');
  const snap=await editor.inputValue();
  check(snap===C1,kind+' fictional manuscript exact original');
  await editor.evaluate(el=>{
   el.focus();
   const i=el.value.lastIndexOf('lantern glows');
   el.setSelectionRange(i,i+'lantern glows'.length);
   el.dispatchEvent(new MouseEvent('mouseup',{bubbles:true}));
  });
  await page.waitForFunction(()=>window.__r44Selection?.text==='lantern glows',null,{timeout:7000});
  const locus=await page.evaluate(()=>window.__r44Selection);
  check(locus.start===Array.from(C1.slice(0,C1.lastIndexOf('lantern glows'))).length,
   kind+' selected SECOND repeated passage in true Unicode offsets');
  await page.locator('#r44-read').click();
  await page.locator('#r44-preview').waitFor({timeout:7000});
  const preview=await page.evaluate(()=>window.__r44Read);
  check(preview?.originalPassage==='lantern glows'&&
    preview.proposedPassage==='lantern shimmers'&&preview.canWrite===false,
   kind+' browser read-only R43 protected section preview');
  check(await page.locator('#r44-apply').isDisabled(),
   kind+' no real Apply capability exposed');
  check(await editor.inputValue()===C1,
   kind+' reading proposal does not mutate original manuscript');
  const left=page.locator('.fr-panel-splitter-left');
  const right=page.locator('.fr-panel-splitter-right');
  check(await left.getAttribute('aria-valuenow')==='300'&&
    await right.getAttribute('aria-valuenow')==='355',
   kind+' both actual column splitters have independent defaults');
  await left.focus();await page.keyboard.press('ArrowRight');
  await right.focus();await page.keyboard.press('ArrowLeft');
  check(await left.getAttribute('aria-valuenow')==='324'&&
    await right.getAttribute('aria-valuenow')==='379',
   kind+' both actual splitters keyboard-adjust independently');
  await page.reload({waitUntil:'load'});
  await page.locator('[data-r44-work]').waitFor({timeout:8000});
  check(await page.locator('.fr-panel-splitter-left').getAttribute('aria-valuenow')==='324'&&
    await page.locator('.fr-panel-splitter-right').getAttribute('aria-valuenow')==='379',
   kind+' both widths persist across real reload');
  await page.locator('[data-r41-reset-column-widths]').click();
  check(await page.locator('.fr-panel-splitter-left').getAttribute('aria-valuenow')==='300'&&
    await page.locator('.fr-panel-splitter-right').getAttribute('aria-valuenow')==='355',
   kind+' Reset restores both native widths');
  // R44 expands R41's simulated keyboard check to actual pointer dragging
  // of BOTH production splitters in two browser engines.
  for(const [selector,delta,baseline,name] of [
    ['.fr-panel-splitter-left',36,300,'Outline'],
    ['.fr-panel-splitter-right',-36,355,'MAIA'],
  ]){
    const splitter=page.locator(selector);
    const bounds=await splitter.boundingBox();
    check(!!bounds&&bounds.width>0&&bounds.height>0,
      kind+' '+name+' real drag handle has a visible hit target');
    const x=bounds.x+bounds.width/2, y=bounds.y+Math.min(bounds.height/2,90);
    await page.mouse.move(x,y);await page.mouse.down();
    await page.mouse.move(x+delta,y,{steps:6});await page.mouse.up();
    const after=Number(await splitter.getAttribute('aria-valuenow'));
    check(after>baseline+15,
      kind+' '+name+' real pointer drag changes canonical width');
  }
  await page.locator('[data-r41-reset-column-widths]').click();
  check(await page.locator('.fr-panel-splitter-left').getAttribute('aria-valuenow')==='300'&&
    await page.locator('.fr-panel-splitter-right').getAttribute('aria-valuenow')==='355',
    kind+' pointer resizing can Reset to original proportions');
  await page.evaluate(()=>{window.__r44OriginalWork=document.querySelector('[data-r44-work]');});
  await page.locator('#r44-canvas').click();
  check(await page.evaluate(()=>window.__r44OriginalWork===
      document.querySelector('[data-r44-work]')&&window.__r44Mounts===1),
   kind+' Full Canvas does not unmount Work/lose author draft');
  await page.locator('#r44-canvas').click();
  check(await page.locator('.fr-panel-splitter-left').count()===1,
   kind+' returning from Full Canvas restores layout');
  // screenshot contains ONLY fictional text; never save DOM, cookie or original manuscript.
  const shot=path.join(EVIDENCE,'R44_'+kind.toUpperCase()+'_CANONICAL_DESKTOP_FICTIONAL.png');
  assert.ok(!fs.existsSync(shot),'R44_refuses_to_overwrite_evidence');
  await page.screenshot({path:shot,fullPage:false});
  await editor.evaluate(el=>{el.value='stale unauthorized text';el.focus();
   el.setSelectionRange(0,5);el.dispatchEvent(new MouseEvent('mouseup',{bubbles:true}));});
  await page.waitForFunction(()=>window.__r44Selection===null,null,{timeout:6000});
  check(await page.locator('#r44-read').isDisabled(),
   kind+' stale live editor selection cannot review an outdated body');

  const mobile=await browser.newContext({viewport:{width:390,height:844},
    isMobile:true,hasTouch:true});
  try{
   await mobile.addCookies([{name:'r44_fixture_writer',value:'fictional_alpha',
    url:origin,httpOnly:true,sameSite:'Strict'}]);
   await mobile.route('**/*',route=>{
    const u=route.request().url();
    if(u.startsWith(origin+'/'))return route.continue();
    record.externalRequests++;return route.abort();
   });
   const phone=await mobile.newPage();
   await phone.goto(origin+'/',{waitUntil:'load'});
   await phone.locator('[data-r44-work]').waitFor();
   check(await phone.locator('#r44-body').isVisible(),
    kind+' mobile browser can reach manuscript in single room');
   const positions=await phone.evaluate(()=>{
    const top=(s)=>document.querySelector(s)?.getBoundingClientRect().top;
    return {work:top('[data-region="work"]'),
      outline:top('[data-region="manuscript"]'),
      maia:top('[data-region="maia"]'),
      viewport:window.innerHeight};
   });
   check(positions.work>=0&&positions.work<positions.viewport/2,
    kind+' mobile manuscript begins in FIRST half of viewport');
   check(positions.work<positions.outline&&positions.work<positions.maia,
    kind+' mobile manuscript precedes Outline and MAIA');
   const mobileShot=path.join(EVIDENCE,'R44_'+kind.toUpperCase()+'_CANONICAL_MOBILE_FICTIONAL.png');
   assert.ok(!fs.existsSync(mobileShot),'R44_refuses_to_overwrite_mobile');
   await phone.screenshot({path:mobileShot,fullPage:false});
   await phone.locator('#r44-canvas').click();
   check(await phone.locator('[data-region="maia"]').evaluate(el=>getComputedStyle(el).display)==='none'&&
     await phone.locator('#r44-body').isVisible(),
     kind+' mobile Full Canvas removes hidden panel space without unmounting Work');
  }finally{await mobile.close();}
  check(errors.length===0,kind+' browser has no uncaught script errors');
 }finally{if(page&&!page.isClosed())await page.close();await ctx.close();}
}
async function main(){
 if(process.env.R44_CANONICAL_BROWSER_FIXTURE!=='fictional-only')
  throw Error('R44_fictional_only_opt_in_required');
 // This new Node process is solely a disposable local review fixture.
 // Do NOT set live routes, issuer/KMS flags, author gestures or persistence.
 for(const name of ['R43_CANONICAL_REVIEW_FIXTURE',
   'R37_SECTION_PASSAGE_FIXTURE','R36_PASSAGE_REVIEW_FIXTURE'])
  process.env[name]='fictional-only';
 const head=getHead();
 record.sourceHead=head;
 const parent=spawnSync('git',['merge-base','--is-ancestor',
  'e9ff6d5a76c701d70d3ed36f21a38eea5581f205','HEAD'],{
  cwd:ROOT,encoding:'utf8'});
 check(parent.status===0,'accepted R43 revision is exact commit ancestor');
 check(!fs.existsSync(EVIDENCE),'unique private evidence destination not overwritten');
 fs.mkdirSync(EVIDENCE,{mode:0o700});
 const serverReview=await compileHeldReview();
 const browserJS=await compileClient();
 const css=fs.readFileSync(STYLE,'utf8');
 const {server,api,setOrigin}=fixtureHttp(browserJS,css,serverReview);
 let browsers=[];
 try{
  await new Promise((resolve,reject)=>{
   server.once('error',reject);
   server.listen(0,'127.0.0.1',resolve);
  });
  const address=server.address();
  check(address&&address.address==='127.0.0.1',
   'HTTP fixture listener restricted to loopback');
  const origin='http://127.0.0.1:'+address.port;
  setOrigin(origin);
  const foreign=await request(origin,'r44_fixture_writer=fictional_beta');
  check(foreign.status===403,'foreign fictional account session refused before protected view');
  const wrongOrigin=await request(origin,'r44_fixture_writer=fictional_alpha',
    {origin:'http://evil.invalid'});
  check(wrongOrigin.status===403,'cross-origin author preview request refused');
  const wrongCSRF=await request(origin,'r44_fixture_writer=fictional_alpha',
    {'x-r44-fixture-csrf':'wrong'});
  check(wrongCSRF.status===403,'invalid fictional anti-CSRF request refused');
  for(const [kind,engine] of [['chromium',chromium],['webkit',webkit]]){
   const browser=await engine.launch(kind==='chromium'?{headless:true,channel:'chrome'}:{headless:true});
   browsers.push(browser);
   await runBrowser(kind,browser,origin);
  }
  check(api.observed===2,'exactly two protected read previews; zero Apply writes');
  check(api.denied>=3,'fixture session/origin/CSRF refusals observed');
  check(record.externalRequests===0,'no off-device requests');
  record.exactCanonicalReactShell=true;
  record.readOnlyProtectedReview=true;
  record.decision='R44_CANONICAL_SHELL_BROWSER_READONLY_ACCEPTED';
 }finally{
  for(const browser of browsers)await browser.close().catch(()=>{});
  record.browsersClosed=true;
  await new Promise(resolve=>server.close(resolve));
  record.temporaryServerClosed=true;
 }
}
(async()=>{
 try{await main();}
 catch(e){record.error=String(e?.stack||e).slice(0,900);process.exitCode=2;}
 finally{
  if(fs.existsSync(EVIDENCE)){
   const receipt=path.join(EVIDENCE,'R44_CANONICAL_BROWSER_READONLY_EVIDENCE.json');
   const fd=fs.openSync(receipt,'wx',0o600);
   fs.writeFileSync(fd,JSON.stringify(record,null,2)+'\n');
   fs.closeSync(fd);
  }
  console.log(JSON.stringify({
    decision:record.decision,passed:record.checks.length,
    head:record.sourceHead,
    externalRequests:record.externalRequests,
    browsersClosed:record.browsersClosed,
    serverClosed:record.temporaryServerClosed,
    error:record.error,
    release:'HOLD',
  }));
  if(record.decision!=='R44_CANONICAL_SHELL_BROWSER_READONLY_ACCEPTED'||
    !record.browsersClosed||!record.temporaryServerClosed)process.exitCode=2;
 }
})();
